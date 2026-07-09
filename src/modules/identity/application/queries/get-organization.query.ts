// M1 application (PRIVATE) — `identity.get_organization.v1` read query (Doc-4C §C3). Orchestration
// only; owns NO state. The canonical org read — consumers MUST call this (via the contracts facade),
// never read `identity.organizations` cross-module. Reads unaudited; no events.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { getOrganizationRow } from "../../infrastructure/data/authz.repository";
import type { GetOrganizationResult } from "../../contracts/types";

/**
 * `identity.get_organization.v1` — resolve the org projection (Doc-2 §10.2), or `found: false` when the
 * org is not resolvable / not disclosable (NOT_FOUND collapse, Doc-4C §C3).
 */
export async function getOrganization(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<GetOrganizationResult> {
  const row = await getOrganizationRow(organizationId, db);
  if (row === null) return { found: false };
  return {
    found: true,
    organization: {
      organizationId: row.organizationId,
      humanRef: row.humanRef,
      name: row.name,
      slug: row.slug,
      orgStatus: row.orgStatus,
    },
  };
}
