// M1 application (PRIVATE) — `identity.get_organization.v1` read query (Doc-4C §C3). Orchestration
// only; owns NO state. The canonical org read — consumers MUST call this (via the contracts facade),
// never read `identity.organizations` cross-module. Reads unaudited; no events.

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { GetOrganizationResult } from "../../contracts/types";

/**
 * `identity.get_organization.v1` — resolve the org projection (Doc-2 §10.2 / Doc-4C §C3 PassB line 128:
 * `{ organization_id, human_ref, name, slug, org_status, verification_level, participation_flags }`), or
 * `found: false` when the org is not resolvable / not disclosable (NOT_FOUND collapse, Doc-4C §C3).
 *
 * The read is performed inline over M1's OWN schema via the injected executor: the RV-0148 patch envelope
 * is `contracts` + `application/queries` only, so the frozen fields (`verification_level` read-through +
 * the two `participation_flags` booleans, realized in `schema.prisma`) are selected here rather than
 * through the infrastructure base-field reader. `verification_level` is the org's own derived attribute,
 * NOT a Trust `verification_records` projection (DC-2) and not a firewalled signal.
 */
export async function getOrganization(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<GetOrganizationResult> {
  const row = await db.organization.findFirst({
    where: { id: organizationId, deletedAt: null },
    select: {
      id: true,
      humanRef: true,
      name: true,
      slug: true,
      orgStatus: true,
      verificationLevel: true,
      hasBuyerProfile: true,
      hasVendorProfile: true,
    },
  });
  if (row === null) return { found: false };
  return {
    found: true,
    organization: {
      organizationId: row.id,
      humanRef: row.humanRef,
      name: row.name,
      slug: row.slug,
      orgStatus: row.orgStatus,
      verificationLevel: row.verificationLevel,
      participationFlags: {
        hasBuyerProfile: row.hasBuyerProfile,
        hasVendorProfile: row.hasVendorProfile,
      },
    },
  };
}
