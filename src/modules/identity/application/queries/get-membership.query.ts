// M1 application (PRIVATE) — `identity.get_membership.v1` read query (Doc-4C §C3). Orchestration only;
// owns NO state. Resolves the (user × org) link and returns its `state` — the access-formula input
// (§6.1). Consumers read `state` here, never cache stale membership, and never re-derive the
// role→permission mapping (they call `check_permission`). Reads unaudited; no events.

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { GetMembershipResult } from "../../contracts/types";

/**
 * `identity.get_membership.v1` — resolve the (user × org) membership link, or `found: false` when there
 * is no such link (or it is not disclosable beyond its tenant scope, Doc-4C §C3 / §7.5). Projects the
 * frozen §C3 field set (PassB line 139: `{ membership_id, user_id, organization_id, state, role_id,
 * department }`).
 *
 * The read is performed inline over M1's OWN schema via the injected executor: the RV-0148 patch envelope
 * is `contracts` + `application/queries` only, so `department` (realized in `schema.prisma`) is selected
 * here rather than through the infrastructure base-field reader.
 */
export async function getMembership(
  userId: string,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<GetMembershipResult> {
  const row = await db.membership.findFirst({
    where: { userId, organizationId, deletedAt: null },
    select: { id: true, roleId: true, state: true, department: true },
  });
  if (row === null) return { found: false };
  return {
    found: true,
    membership: {
      membershipId: row.id,
      userId,
      organizationId,
      roleId: row.roleId,
      state: row.state,
      department: row.department,
    },
  };
}
