// M1 application (PRIVATE) — `identity.get_buyer_profile.v1` read query (Doc-5C §6.1 row 33;
// §6.3 non-disclosure). Orchestration only; owns NO state. The authoritative buyer_profile lives
// in `identity.buyer_profiles` (Doc-6C §3.8); this query reads the active-org singleton and maps
// it to the public `GetBuyerProfileResult` outcome.
//
// Owning/active-org read: the active org is established by the app-layer org-context guard, which
// server-validates the active membership and sets `app.active_org` on the request transaction
// (Doc-6C §2.1; Doc-5C §3.3 — client-supplied org id never trusted). RLS scopes the read; this
// query adds NO client org filter. Cross-tenant / absent → `found: false` (Doc-5C §6.3 — the wire
// `404` collapse; indistinguishable from genuine absence).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { findActiveOrgBuyerProfile } from "../../infrastructure/data/buyer-profile.repository";
import type { GetBuyerProfileResult } from "../../contracts/types";

/**
 * `identity.get_buyer_profile.v1` (Doc-5C §6.1/§6.3). Returns the active-org buyer_profile, or the
 * not-found outcome when the active org has no (visible) buyer_profile.
 *
 * @param db transaction executor carrying the server-set `app.active_org` GUC (Doc-6C §2.1).
 *           RLS performs the org-scoping; no organization id is taken as input.
 */
export async function getBuyerProfile(db: DbExecutor = prisma): Promise<GetBuyerProfileResult> {
  const profile = await findActiveOrgBuyerProfile(db);

  if (profile === null) {
    // Active org has no visible buyer_profile (genuine absence or cross-tenant RLS exclusion).
    return { found: false };
  }

  return {
    found: true,
    profile: {
      id: profile.id,
      organizationId: profile.organizationId,
      industry: profile.industry,
      factoryInfo: profile.factoryInfo,
      deliveryLocations: profile.deliveryLocations,
      procurementPreferences: profile.procurementPreferences,
    },
  };
}
