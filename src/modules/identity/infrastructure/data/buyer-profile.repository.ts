// M1 infrastructure (PRIVATE) — thin Prisma repository over `identity.buyer_profiles`.
// This is M1 reading its OWN schema (allowed); other modules reach this only via the M1
// composition root / contracts, never by importing infrastructure (REPOSITORY_STRUCTURE).
//
// RLS does the org-scoping: the read MUST run on the executor (transaction client) whose
// `app.active_org` GUC was server-set by the app-layer org-context guard (Doc-6C §2.1). This
// repository adds NO client-supplied org filter — Invariant #5 (client-supplied org id never
// trusted) is upheld by RLS + the GUC, not by a WHERE clause here. It only excludes soft-deleted
// rows (live read — the `buyer_profiles_org_live_uq` partial-unique is `WHERE deleted_at IS NULL`).

import { prisma, type DbExecutor } from "../../../../shared/db";
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
