// M1 infrastructure (PRIVATE) — the Context / Active-Organization sub-domain reads (Doc-4C §C8) over
// M1's OWN schema (`identity`): memberships + organizations. This is M1 reading its own tables (allowed);
// other modules reach these only via the M1 contracts facade, never by importing infrastructure.
//
// All three §C8 contracts are UNAUDITED and side-effect-free: `switch_active_organization` (State Effects:
// none — session context; Doc-4C §C8 PassB:537), `get_active_context`, `list_my_organizations` (queries,
// §17.1). These legs therefore only READ. Every read carries its OWN explicit self/org anchor (app-layer
// authz is primary — Doc-6C §6.2a; RLS is the row-visibility backstop).

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { OrganizationStatus } from "../../domain/state-machines/organization.state-machine";
import type { MembershipState } from "../../domain/state-machines/membership.state-machine";

/**
 * Read the LIVE organization's own lifecycle status (Doc-2 §5.1 `org_status`), for the
 * `switch_active_organization` BUSINESS precondition (Doc-4C §C8 PassB:535 "org not suspended for the
 * user's access"). `null` ⇒ no live row (a soft-deleted / absent org — unreachable once an active
 * membership is confirmed, since the org soft-delete cascade tombstones the memberships).
 */
export async function readOrganizationLifecycle(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<{ orgStatus: OrganizationStatus } | null> {
  const row = await db.organization.findFirst({
    where: { id: organizationId, deletedAt: null },
    select: { orgStatus: true },
  });
  if (row === null) return null;
  return { orgStatus: row.orgStatus as OrganizationStatus };
}

/** One row of `list_my_organizations` (Doc-4C §C8 PassB:558 — `{ organization_id, name,
 *  membership_state, role_id }`). The org name is the org's own attribute (Doc-2 §10.2), joined
 *  in-schema (`identity.organizations`) — never a cross-module read. */
export interface MyMembershipRow {
  organizationId: string;
  name: string;
  membershipState: MembershipState;
  roleId: string;
}

/**
 * List the caller's OWN memberships (Doc-4C §C8 `list_my_organizations`; Visibility: "only orgs where the
 * caller has a membership", PassB:561). SELF-ANCHORED on `user_id` — the switcher SOURCE list, so it must
 * resolve across ALL the caller's orgs regardless of any active context (CONTEXT stage = "authenticated"
 * only, PassB:559); realized at the M1 read layer over the caller's own tenant-directory rows (the
 * `resolveActiveOrg` / `resolveSelfUser` app-edge precedent — the `memberships_read` own-leg + the
 * `memberships_user_idx` Band-H index, Doc-6C, exist for exactly this read).
 *
 * `includeNonActive=false` (the default `state_filter=active`) returns only `active` memberships;
 * `true` (`state_filter=all`) returns every non-tombstoned membership state (invited/pending/active/
 * suspended). Tombstoned rows (`deleted_at`, incl. the org soft-delete cascade) are always excluded.
 * Sort: org `name` asc, tiebreaker `organization_id` asc (the frozen deterministic total order,
 * PassB:561). NEVER filters by ORG status — a member's own suspended org still appears (the switch,
 * not the list, enforces "org not suspended").
 */
export async function listMembershipsForUser(
  userId: string,
  includeNonActive: boolean,
  db: DbExecutor = prisma,
): Promise<MyMembershipRow[]> {
  const rows = await db.membership.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(includeNonActive ? {} : { state: "active" }),
    },
    select: {
      organizationId: true,
      roleId: true,
      state: true,
      organization: { select: { name: true } },
    },
    orderBy: [{ organization: { name: "asc" } }, { organizationId: "asc" }],
  });
  return rows.map((r) => ({
    organizationId: r.organizationId,
    name: r.organization.name,
    membershipState: r.state as MembershipState,
    roleId: r.roleId,
  }));
}
