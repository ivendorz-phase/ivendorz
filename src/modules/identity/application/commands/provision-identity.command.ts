// M1 application (PRIVATE) — lazy first-login identity provisioning (WP-1.3 [W1-AUTH-001]).
//
// Out-of-band provisioning (Doc-7E §2 / [ESC-7-API-SIGNUP]): signup coins NO `create_user` wire
// contract; the user record + a default Personal Organization + the founding Owner membership are
// materialized here on first authenticated login. This realizes the Doc-4C §C5 `create_organization`
// FROZEN create-flow shape (org + Owner membership + `human_ref` via Module 0) as the lazy
// provisioning mechanism, plus the Solo-Trader Rule (Architecture §5.2 — every user ends with ≥1 org,
// Invariant #5). Orchestration only; M1 OWNS the `identity.*` writes (One Module, One Owner).
//
// ATOMIC + IDEMPOTENT (the load-bearing guarantees):
//   - ONE interactive transaction: user + org + membership all-or-nothing (Doc-4C §C5 "founding
//     Owner membership created in the same transaction"); a mid-bootstrap failure rolls back the
//     whole identity (no partial user/org).
//   - Idempotent on the natural key `auth_user_id`: a second OR concurrent first-login creates
//     nothing. Existence is checked inside the transaction; the concurrent race is closed by the
//     `users_auth_user_id_uq` partial-unique index (Doc-6C §3.1) — a losing concurrent insert
//     surfaces P2002 and is treated as "already provisioned" (re-read, return the existing identity).
//
// RLS-AT-BOOTSTRAP (corpus-faithful — never a bypass): the bootstrap inserts run BEFORE the user has
// an `app.active_org`, and `identity.users` has NO INSERT policy at all (Doc-6C §6.2a) — so these
// inserts cannot satisfy tenant `WITH CHECK (org = active_org OR is_platform_staff)` as a normal user.
// The FROZEN mechanism is the System/platform-staff provisioning context: Doc-6C §6.2a line
// "-- (INSERT at provisioning / DELETE-anonymize = System/staff)" + §2.1 (`app.is_platform_staff`
// gates platform-owned writes; the staff backstop is the satisfiable leg of every org/membership
// WITH CHECK) + Doc-6B §2.2 (the platform-staff RLS backstop). We set the three server-set GUCs
// (§2.1) for this single provisioning transaction: `app.is_platform_staff=true` (System/staff
// bootstrap), `app.user_id` (the just-ensured user), and `app.active_org` (the new org) so the
// membership WITH CHECK is also met by its primary leg. GUCs are set transaction-local
// (`set_config(.,.,true)`) so they never leak past this transaction — RLS is not weakened.

import { Prisma, prisma } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { AllocateHumanReference } from "@/modules/core/contracts";
import type { ProvisionIdentityInput, ProvisionIdentityResult } from "../../contracts/types";

// The seeded Owner system-bundle role (Doc-6C §5.2 / migration seed): organization_id IS NULL,
// is_system_bundle = true, name = 'Owner'. Bound by its FROZEN seed identity, never coined here.
const OWNER_SYSTEM_BUNDLE_ROLE_NAME = "Owner" as const;

// Entity-type prefix for the org human_ref sequence (Doc-2 §0.1 registry; Doc-4C §C5 — `ORG-…`).
// Owned by Module 0 / Doc-2 §0.1; bound by pointer, never invented.
const ORG_HUMAN_REF_ENTITY_TYPE = "ORG" as const;

/**
 * Derive the Personal Organization name (Architecture §5.2 Solo-Trader Rule).
 *
 * [ESC-W1-USER-PROVISION] — the corpus gives an *example* ("Musa Trading", Architecture §5.2),
 * not a deterministic naming RULE. The personal-org name format is therefore genuinely unspecified.
 * Interim derivation: the email local-part (the only person-identifying token available at first
 * login; display_name may be absent), title-cased, suffixed " Trading" to match the §5.2 example
 * shape. Flagged for a future Doc-4C/Architecture additive that ratifies the naming rule; no
 * business-naming convention is silently invented as final.
 */
function derivePersonalOrgName(email: string | null | undefined): string {
  const localPart = (email ?? "").split("@")[0]?.trim() ?? "";
  if (localPart.length === 0) return "Personal Organization"; // safe non-empty fallback
  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const titled = cleaned
    .split(" ")
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `${titled || "Personal"} Trading`;
}

/**
 * Derive a URL-safe org slug from the human_ref (always unique + live — `organizations_slug_live_uq`,
 * Doc-6C §3.2). The human_ref (`ORG-YYYY-NNNNNN`) is guaranteed unique by Module 0's never-reused
 * sequence (Doc-2 §0.1), so a slug derived from it collides only with a soft-deleted row's slug, which
 * the restore-conflict regeneration rule owns (DC-CR5) — not reachable on a fresh personal-org create.
 */
function deriveOrgSlug(humanRef: string): string {
  return humanRef.toLowerCase();
}

interface ProvisionDeps {
  /**
   * The Module 0 `core.allocate_human_reference.v1` contract service (Doc-4B §A7), injected by the
   * contract TYPE (`@/modules/core/contracts`). Dependency-injected — never imported as a concrete
   * cross-module value (the only boundary-legal cross-module call mechanism). Bound into THIS
   * transaction so the ref allocation is atomic with the org create (Doc-4C §C5 "no second ref on
   * replay"; Doc-4B §A7 atomicity).
   */
  allocateHumanReference: AllocateHumanReference;
}

/**
 * Provision (lazily, on first login) the identity for an authenticated Supabase user: ensure the
 * `identity.users` record (keyed by `auth_user_id`), a default Personal Organization
 * (`is_personal_org = true`, `human_ref` via Module 0), and the founding Owner membership (active).
 *
 * Idempotent + atomic: a second/concurrent call with the same `auth_user_id` creates nothing and
 * returns the existing identity; any mid-bootstrap failure rolls back entirely.
 *
 * @param input  the authenticated subject — `auth_user_id` (the Supabase `auth.users` id) + email.
 * @param deps   injected Module 0 contract service(s).
 * @param db     optional executor; defaults to the shared client (the command opens its own
 *               interactive transaction internally).
 */
export async function provisionIdentityForAuthUser(
  input: ProvisionIdentityInput,
  deps: ProvisionDeps,
  db: typeof prisma = prisma,
): Promise<ProvisionIdentityResult> {
  const year = new Date().getUTCFullYear(); // server-clock UTC year (Doc-2 §0.1)

  return db.$transaction(async (tx) => {
    // ── Bootstrap RLS context (System/platform-staff — Doc-6C §6.2a / §2.1; Doc-6B §2.2). ──
    // Transaction-local (set_config(.,.,true)) so it never leaks past this provisioning tx.
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // ── (1) Ensure identity.users (idempotent on auth_user_id; no secret column — DC-4). ──
    const existingUser = await tx.user.findFirst({
      where: { authUserId: input.authUserId, deletedAt: null },
    });

    if (existingUser !== null) {
      // Already provisioned — re-read the existing personal org + owner membership and return.
      // (A prior provisioning is the authoritative identity; create nothing.)
      const existingOrg = await tx.organization.findFirst({
        where: {
          isPersonalOrg: true,
          deletedAt: null,
          memberships: { some: { userId: existingUser.id, deletedAt: null } },
        },
      });
      const existingMembership = existingOrg
        ? await tx.membership.findFirst({
            where: { userId: existingUser.id, organizationId: existingOrg.id, deletedAt: null },
          })
        : null;

      return {
        created: false,
        userId: existingUser.id,
        organizationId: existingOrg?.id ?? null,
        organizationHumanRef: existingOrg?.humanRef ?? null,
        ownerMembershipId: existingMembership?.id ?? null,
      };
    }

    const userId = uuidv7(); // M0 ID generator (Doc-4B §8) — never a raw UUID in app code.

    let createdUserId: string;
    try {
      const user = await tx.user.create({
        data: {
          id: userId,
          authUserId: input.authUserId,
          email: input.email ?? null,
          status: "active",
          createdBy: userId, // self-provisioned: the subject is the actor (server-populated)
          updatedBy: userId,
        },
      });
      createdUserId = user.id;
    } catch (e) {
      // Concurrent first-login race: the other tx won the `users_auth_user_id_uq` partial-unique.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const winner = await tx.user.findFirst({
          where: { authUserId: input.authUserId, deletedAt: null },
        });
        if (winner === null) throw e; // not the expected uniqueness collision — surface it
        const winnerOrg = await tx.organization.findFirst({
          where: {
            isPersonalOrg: true,
            deletedAt: null,
            memberships: { some: { userId: winner.id, deletedAt: null } },
          },
        });
        const winnerMembership = winnerOrg
          ? await tx.membership.findFirst({
              where: { userId: winner.id, organizationId: winnerOrg.id, deletedAt: null },
            })
          : null;
        return {
          created: false,
          userId: winner.id,
          organizationId: winnerOrg?.id ?? null,
          organizationHumanRef: winnerOrg?.humanRef ?? null,
          ownerMembershipId: winnerMembership?.id ?? null,
        };
      }
      throw e;
    }

    // Set app.user_id for the rest of the bootstrap (platform-owned write context — §2.1).
    await tx.$executeRaw`SELECT set_config('app.user_id', ${createdUserId}::text, true)`;

    // ── (2) Allocate the org human_ref via the Module 0 contract service (NEVER cross-schema SQL). ──
    // Bound INTO this transaction (tx executor) so allocation is atomic with the org create
    // (Doc-4C §C5 "allocate the ref via Module 0, not locally"; Doc-4B §A7 atomicity).
    const { humanRef } = await deps.allocateHumanReference(
      { entityType: ORG_HUMAN_REF_ENTITY_TYPE, year },
      tx,
    );

    const organizationId = uuidv7();

    // Set app.active_org so the membership INSERT meets its primary WITH CHECK leg (§2.1 / §6.2a).
    await tx.$executeRaw`SELECT set_config('app.active_org', ${organizationId}::text, true)`;

    // ── (3) Ensure the Personal Organization (is_personal_org = true; §5.1 → active). ──
    await tx.organization.create({
      data: {
        id: organizationId,
        humanRef,
        name: derivePersonalOrgName(input.email), // [ESC-W1-USER-PROVISION] derived; see above
        slug: deriveOrgSlug(humanRef),
        orgStatus: "active",
        isPersonalOrg: true,
        verificationLevel: "unverified",
        createdBy: createdUserId,
        updatedBy: createdUserId,
      },
    });

    // ── (4) Resolve the seeded Owner system-bundle role (organization_id IS NULL; §5.2 seed). ──
    const ownerRole = await tx.role.findFirst({
      where: {
        name: OWNER_SYSTEM_BUNDLE_ROLE_NAME,
        organizationId: null,
        isSystemBundle: true,
        deletedAt: null,
      },
    });
    if (ownerRole === null) {
      // The Owner system-bundle seed is a migration invariant (Doc-6C §5.2). Its absence is a
      // conformance/setup failure, not a runtime fabrication — surface it (rolls back the tx).
      throw new Error(
        "provision-identity: Owner system-bundle role seed not found (Doc-6C §5.2) — cannot create founding membership",
      );
    }

    // ── (5) Ensure the founding Owner membership (state = active — Invariant #5; §5.2). ──
    const ownerMembershipId = uuidv7();
    await tx.membership.create({
      data: {
        id: ownerMembershipId,
        organizationId,
        userId: createdUserId,
        roleId: ownerRole.id,
        state: "active",
        joinedAt: new Date(), // set on → active (Doc-6C §3.3)
        createdBy: createdUserId,
        updatedBy: createdUserId,
      },
    });

    return {
      created: true,
      userId: createdUserId,
      organizationId,
      organizationHumanRef: humanRef,
      ownerMembershipId,
    };
  });
}
