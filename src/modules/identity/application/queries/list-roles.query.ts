// M1 application (PRIVATE) — `identity.list_roles.v1` (Doc-4C §C7 · 21.3 Query · Actor: User).
// SINGLE-actor (User), active-org scoped (PassB:463: "Membership active; Slug none (read); Scope
// active-org"). Visibility (PassB:468): "caller's org roles + platform seeds only" (§7) — NEVER
// another tenant's custom role. Sort: `name` (tiebreaker `role_id`) — the frozen deterministic order.
//
// PAGINATION — FAIL-CLOSED (handle-gated `ESC-IDN-LIST-PAGESIZE`; see `list-permissions.query`): a
// supplied `page_size`/`cursor` is rejected at the wire face; this query returns the full org-scoped
// set (own-org roles + system seeds) with `has_more: false` (org scope + RLS bound the set).
//
// Read: unaudited (§17.1 / §B.8) · `Idempotency: not-applicable` · zero events. `orgId` is the
// SERVER-RESOLVED active org (Invariant #5) — never client input.

import { prisma, type DbExecutor } from "@/shared/db";
import { listRolesForOrg } from "../../infrastructure/data/role.repository";
import type { ListRolesInput, ListRolesResult, RoleView } from "../../contracts/types";

/**
 * List the active org's roles + the platform system-bundle seeds (Doc-4C §C7). `include_system`
 * (frozen, default true) toggles the seed leg. `orgId` is the SERVER-RESOLVED active org.
 */
export async function listRoles(
  input: ListRolesInput,
  orgId: string,
  db: DbExecutor = prisma,
): Promise<ListRolesResult> {
  const includeSystem = input.includeSystem ?? true;
  const rows = await listRolesForOrg(orgId, includeSystem, db);
  const items: RoleView[] = rows.map((r) => ({
    roleId: r.roleId,
    name: r.name,
    isSystemBundle: r.isSystemBundle,
  }));
  return { items, pageInfo: { hasMore: false } };
}
