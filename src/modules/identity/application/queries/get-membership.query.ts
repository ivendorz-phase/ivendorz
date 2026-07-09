// M1 application (PRIVATE) — `identity.get_membership.v1` read query (Doc-4C §C3). Orchestration only;
// owns NO state. Resolves the (user × org) link and returns its `state` — the access-formula input
// (§6.1). Consumers read `state` here, never cache stale membership, and never re-derive the
// role→permission mapping (they call `check_permission`). Reads unaudited; no events.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { getMembershipRow } from "../../infrastructure/data/authz.repository";
import type { GetMembershipResult } from "../../contracts/types";

/**
 * `identity.get_membership.v1` — resolve the (user × org) membership link, or `found: false` when there
 * is no such link (or it is not disclosable beyond its tenant scope, Doc-4C §C3 / §7.5).
 */
export async function getMembership(
  userId: string,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<GetMembershipResult> {
  const row = await getMembershipRow(userId, organizationId, db);
  if (row === null) return { found: false };
  return {
    found: true,
    membership: {
      membershipId: row.membershipId,
      userId,
      organizationId,
      roleId: row.roleId,
      state: row.state,
    },
  };
}
