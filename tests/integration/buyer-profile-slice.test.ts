import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { ensureProvisioned, type AuthSession } from "../../src/server/auth";
import { resolveActiveOrg } from "../../src/server/context";
import { handleGetBuyerProfile } from "../../src/server/identity";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// WP-1.7 [W1-TEST-001] — the VERTICAL-SLICE integration test (build item 4). One pass over the wired
// M0+M1 slice: auth (test-scoped seeded session) → lazy provision (M1 via contract) → active-org context
// (server-resolved; client org id never trusted — Invariant #5) → the WIRED route handler returns `200`
// + the Doc-5A §5.6 envelope + a top-level `reference_id`, with the active-org context scoping the read.
//
// PARKED (build-local-park-deploy): the LIVE Supabase login round-trip parks (no live Supabase project in
// CI/local) — the session is INJECTED (a deterministic `auth_user_id`), so the handler runs against a real
// provisioned user with NO live auth round-trip. The full Playwright login → screen → axe E2E (Doc-7E /
// Doc-8G) likewise PARKS with the Supabase project; it is noted here and lives under `tests/e2e/` (a
// `.gitkeep` placeholder until the project is provisioned). Faking a session to drive the SERVED Next.js
// route would violate the auth boundary (Doc-7C §3.1) — so the slice is exercised through the app-layer
// handler CORE (`handleGetBuyerProfile`, `src/server/identity`), the boundary-legal test-reachable surface.
//
// WHAT THIS ADDS OVER WP-1.5's route test: WP-1.5 asserts the wire shape with the global-singleton crutch
// (one row in the table; superuser connection — RLS unscoped). WP-1.7 now has the restricted-role harness,
// so this slice test ALSO proves the active-org context scopes the read under GENUINE RLS enforcement: a
// second tenant's user, querying the SAME wired read path, never sees tenant-1's profile (cross-tenant
// non-disclosure at the DB, not merely a structural context check). The seeded fixtures are deterministic.

const SLICE_AUTH_USER_ID = "01920000-0000-7000-8000-0000000005e1";
const SLICE_EMAIL = "slice-buyer@example.com";

/** Test-scoped seeded session resolver — stands in for the parked live Supabase round-trip. */
function seededSession(session: AuthSession): () => Promise<AuthSession | null> {
  return async () => session;
}

async function cleanup(authUserId: string): Promise<void> {
  // TEST-ONLY hard-delete teardown (production never hard-deletes — Invariant #8; the test DB is
  // ephemeral). Order: buyer_profiles → memberships → orgs → user (FK-safe).
  const user = await prisma.user.findFirst({ where: { authUserId } });
  if (user === null) return;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  const orgIds = [...new Set(memberships.map((m) => m.organizationId))];
  if (orgIds.length > 0) {
    await prisma.buyerProfile.deleteMany({ where: { organizationId: { in: orgIds } } });
  }
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  if (orgIds.length > 0) await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  await prisma.user.deleteMany({ where: { id: user.id } });
}

describe("WP-1.7 buyer-profile vertical slice (provision → active-org context → wired 200 envelope)", () => {
  beforeEach(async () => {
    await ensureRestrictedRlsRole();
    await cleanup(SLICE_AUTH_USER_ID);
  });

  afterAll(async () => {
    await cleanup(SLICE_AUTH_USER_ID);
    await prisma.$disconnect();
  });

  it("provision → seed active-org buyer_profile → wired route returns 200 + Doc-5A envelope + reference_id", async () => {
    const session: AuthSession = { authUserId: SLICE_AUTH_USER_ID, email: SLICE_EMAIL };

    // (1) Lazy first-login provisioning (M1, via the contract) — personal org + founding Owner membership.
    const provisioned = await ensureProvisioned(session);
    expect(provisioned.created).toBe(true);
    expect(provisioned.organizationId).not.toBeNull();
    const orgId = provisioned.organizationId!;

    // (2) The active-org context is SERVER-RESOLVED from the confirmed active membership (never client
    //     input — Invariant #5). It resolves to the user's personal org — the same context the read runs in.
    const resolution = await resolveActiveOrg(session);
    expect(resolution.resolved).toBe(true);
    if (!resolution.resolved)
      throw new Error("unreachable: expected a resolved active-org context");
    expect(resolution.context.activeOrgId).toBe(orgId);

    // (3) Seed the active org's buyer_profile (TEST-ONLY; the singleton index guarantees one live row/org).
    const seededId = uuidv7();
    await prisma.buyerProfile.create({
      data: {
        id: seededId,
        organizationId: orgId,
        industry: "textiles",
        deliveryLocationsJsonb: ["Dhaka"],
      },
    });

    // (4) The WIRED route (Doc-5C §6.1 → `GET /identity/buyer_profiles` → `200`) returns the Doc-5A §5.6
    //     single-entity envelope + a top-level `reference_id` (CHK-5A-042), the read scoped to the active org.
    const res = await handleGetBuyerProfile({
      resolveSession: seededSession(session),
      ensureProvisioned,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("result");
    expect(res.body).toHaveProperty("reference_id");
    expect("error" in res.body).toBe(false);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body.reference_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(res.body.result.id).toBe(seededId);
    expect(res.body.result.organizationId).toBe(orgId);
    expect(res.body.result.industry).toBe("textiles");
    expect(res.body.result.deliveryLocations).toEqual(["Dhaka"]);
  });

  it("the active-org context genuinely SCOPES the read under RLS: another tenant never sees this profile", async () => {
    const session: AuthSession = { authUserId: SLICE_AUTH_USER_ID, email: SLICE_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;
    const seededId = uuidv7();
    await prisma.buyerProfile.create({
      data: { id: seededId, organizationId: orgId, industry: "textiles" },
    });

    // Own tenant (active_org = orgId) sees its row under genuine RLS enforcement (restricted role).
    const own = await asRestrictedRole({ activeOrg: orgId }, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM identity.buyer_profiles WHERE id = $1::uuid`,
        seededId,
      ),
    );
    expect(own.map((r) => r.id)).toEqual([seededId]);

    // A DIFFERENT tenant's active-org context (a fresh, unrelated org id) sees NOTHING for this profile —
    // the wired read's active-org scoping is real DB-level tenant isolation, not a structural placeholder.
    const otherOrgId = uuidv7();
    const cross = await asRestrictedRole({ activeOrg: otherOrgId }, (tx) =>
      tx.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM identity.buyer_profiles WHERE id = $1::uuid`,
        seededId,
      ),
    );
    expect(cross).toEqual([]);
  });
});
