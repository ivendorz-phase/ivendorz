// M1 infrastructure (PRIVATE) — thin Prisma repository over `identity.buyer_profiles`.
// This is M1 reading its OWN schema (allowed); other modules reach this only via the M1
// composition root / contracts, never by importing infrastructure (REPOSITORY_STRUCTURE).
//
// RLS does the org-scoping: the read MUST run on the executor (transaction client) whose
// `app.active_org` GUC was server-set by the app-layer org-context guard (Doc-6C §2.1). This
// repository adds NO client-supplied org filter — Invariant #5 (client-supplied org id never
// trusted) is upheld by RLS + the GUC, not by a WHERE clause here. It only excludes soft-deleted
// rows (live read — the `buyer_profiles_org_live_uq` partial-unique is `WHERE deleted_at IS NULL`).

import { Prisma, prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { BuyerProfileReadModel } from "../../domain/read-models/buyer-profile.read-model";

/**
 * Read the active-org buyer_profile singleton (Doc-5C §6.1/§6.3). The active org is resolved by
 * RLS from `app.active_org` on `db` — NOT by a parameter. Returns the live row, or `null` when the
 * active org has no buyer_profile or the row is not visible (RLS-scoped / cross-tenant → absent).
 *
 * @param db transaction executor carrying the server-set `app.active_org` GUC (Doc-6C §2.1).
 */
export async function findActiveOrgBuyerProfile(
  db: DbExecutor = prisma,
): Promise<BuyerProfileReadModel | null> {
  // No `organizationId` filter: RLS scopes to `app.active_org`; the singleton index guarantees
  // at most one live row visible. `deletedAt: null` selects the live row only.
  const row = await db.buyerProfile.findFirst({
    where: { deletedAt: null },
  });

  if (row === null) return null;

  return {
    id: row.id,
    organizationId: row.organizationId,
    industry: row.industry,
    factoryInfo: row.factoryInfoJsonb,
    deliveryLocations: row.deliveryLocationsJsonb,
    procurementPreferences: row.procurementPreferencesJsonb,
  };
}

/** The audited buyer-profile field set (Doc-2 §10.2) — the `old_value`/`new_value` shape for the audit. */
export interface BuyerProfileFieldSet {
  industry: string | null;
  factoryInfo: unknown;
  deliveryLocations: unknown;
  procurementPreferences: unknown;
}

/** Writable columns for the upsert (partial — an omitted key is left unchanged on update). */
export interface BuyerProfileWriteInput {
  industry?: string | null;
  factoryInfo?: unknown;
  deliveryLocations?: unknown;
  procurementPreferences?: unknown;
  /** Optimistic-concurrency token (the prior `updated_at`); checked in-app on update. */
  expectedUpdatedAt?: Date;
}

/**
 * Outcome of the upsert WRITE. `created`/`updated` carry the new `updated_at` + the audit field sets the
 * command needs (the repository computes them but knows NOTHING of audit policy — it returns data, the
 * command decides the audit action). `conflict` = stale optimistic-concurrency token or a concurrent
 * create race (the command maps it to the Doc-4C `CONFLICT`).
 */
export type UpsertBuyerProfileWrite =
  | { outcome: "created"; id: string; updatedAt: Date; newValue: BuyerProfileFieldSet }
  | {
      outcome: "updated";
      id: string;
      updatedAt: Date;
      oldValue: BuyerProfileFieldSet;
      newValue: BuyerProfileFieldSet;
    }
  | { outcome: "conflict" };

// Map a contract jsonb value to Prisma's nullable-JSON input: `null` → JSON null literal; otherwise the
// value (Doc-6A §12 — IDs/values only, no blobs). Callers spread this only when the key is present.
function toJsonInput(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function fieldSetOf(row: {
  industry: string | null;
  factoryInfoJsonb: unknown;
  deliveryLocationsJsonb: unknown;
  procurementPreferencesJsonb: unknown;
}): BuyerProfileFieldSet {
  return {
    industry: row.industry,
    factoryInfo: row.factoryInfoJsonb,
    deliveryLocations: row.deliveryLocationsJsonb,
    procurementPreferences: row.procurementPreferencesJsonb,
  };
}

/**
 * Upsert the active-org buyer_profile singleton (Doc-4C §C10) on the RLS-scoped executor `db`. The active
 * org is enforced by RLS (`app.active_org`); `activeOrgId` (the SERVER-RESOLVED context — never client
 * input, Invariant #5) is used ONLY as the `organization_id` column value on CREATE, which the RLS
 * `WITH CHECK` then re-verifies. CREATE is admitted under `buyer_profiles_org_live_uq` (one live row/org);
 * UPDATE is partial (omitted fields unchanged) with **optimistic concurrency** on `updated_at`.
 *
 * This repository OWNS the buyer_profiles write SQL and knows NOTHING of audit policy — it returns the
 * `created`/`updated` outcome plus the `old_value`/`new_value` field sets so the COMMAND can append the
 * audit (Doc-4C realization: `buyer_profile_created` / `buyer_profile_updated`).
 */
export async function upsertActiveOrgBuyerProfile(
  activeOrgId: string,
  actorUserId: string,
  input: BuyerProfileWriteInput,
  db: DbExecutor = prisma,
): Promise<UpsertBuyerProfileWrite> {
  // RLS scopes to the active org; the singleton index guarantees at most one live row.
  const existing = await db.buyerProfile.findFirst({ where: { deletedAt: null } });

  if (existing === null) {
    // ── CREATE leg ──
    const id = uuidv7();
    try {
      const row = await db.buyerProfile.create({
        data: {
          id,
          organizationId: activeOrgId, // RLS WITH CHECK re-verifies = app.active_org
          industry: input.industry ?? null,
          ...(input.factoryInfo !== undefined
            ? { factoryInfoJsonb: toJsonInput(input.factoryInfo) }
            : {}),
          ...(input.deliveryLocations !== undefined
            ? { deliveryLocationsJsonb: toJsonInput(input.deliveryLocations) }
            : {}),
          ...(input.procurementPreferences !== undefined
            ? { procurementPreferencesJsonb: toJsonInput(input.procurementPreferences) }
            : {}),
          createdBy: actorUserId,
          updatedBy: actorUserId,
        },
      });
      return {
        outcome: "created",
        id: row.id,
        updatedAt: row.updatedAt,
        newValue: fieldSetOf(row),
      };
    } catch (e) {
      // Concurrent create race on `buyer_profiles_org_live_uq` → conflict (retry takes the UPDATE leg).
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { outcome: "conflict" };
      }
      throw e;
    }
  }

  // ── UPDATE leg (partial; optimistic concurrency on `updated_at`) ──
  // Compare the prior token in-app (both are Prisma-read ms Dates — avoids the timestamptz µs/ms mismatch
  // of a DB-level `WHERE updated_at = <ms>`); the read + update share THIS transaction (withActiveOrgContext).
  if (
    input.expectedUpdatedAt !== undefined &&
    existing.updatedAt.getTime() !== input.expectedUpdatedAt.getTime()
  ) {
    return { outcome: "conflict" };
  }

  const oldValue = fieldSetOf(existing);
  const row = await db.buyerProfile.update({
    where: { id: existing.id },
    data: {
      ...(input.industry !== undefined ? { industry: input.industry } : {}),
      ...(input.factoryInfo !== undefined
        ? { factoryInfoJsonb: toJsonInput(input.factoryInfo) }
        : {}),
      ...(input.deliveryLocations !== undefined
        ? { deliveryLocationsJsonb: toJsonInput(input.deliveryLocations) }
        : {}),
      ...(input.procurementPreferences !== undefined
        ? { procurementPreferencesJsonb: toJsonInput(input.procurementPreferences) }
        : {}),
      updatedBy: actorUserId,
    },
  });
  return {
    outcome: "updated",
    id: row.id,
    updatedAt: row.updatedAt,
    oldValue,
    newValue: fieldSetOf(row),
  };
}

/**
 * The acting user's role NAME in the active org (the confirmed active membership's role). Used by the
 * upsert command for the `[ESC-IDN-SLUG]` INTERIM authorization (Owner/Director authority — Doc-4C §C10,
 * no dedicated `can_manage_buyer_profile` slug in Doc-2 §7's minimal set). RLS-scoped read of M1's own
 * memberships/roles. Returns `null` when no active membership/role resolves.
 */
export async function findActiveMembershipRoleName(
  userId: string,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<string | null> {
  const membership = await db.membership.findFirst({
    where: { userId, organizationId, state: "active", deletedAt: null },
    select: { roleId: true },
  });
  if (membership === null) return null;
  const role = await db.role.findFirst({
    where: { id: membership.roleId, deletedAt: null },
    select: { name: true },
  });
  return role?.name ?? null;
}
