// M1 application (PRIVATE) — `identity.list_my_organizations.v1` (Doc-4C §C8 · 21.3 Query · Actor: User).
// Orchestration only; owns NO state. The context-switcher SOURCE list: every org the caller has a
// membership in, SELF-scoped (PassB:556 "Authorization: … Scope self"; PassB:561 Visibility "only orgs
// where the caller has a membership"). Reads unaudited (§17.1); no events; no governance signal.
//
// `ctx.userId` is the SERVER-RESOLVED principal (never a client-asserted actor — Invariant #5). CONTEXT
// stage is "authenticated" only (PassB:559) — NOT an active-org context: the list must work BEFORE any
// context is set (it is how the caller discovers switch targets, incl. when their only org was suspended).
//
// PAGINATION — FAIL-CLOSED (handle-gated `ESC-IDN-LIST-PAGESIZE`, 🟠): the §C8 `page_size`/`cursor`
// dimension is bounded by a `[DC-5]` POLICY key that was NEVER REGISTERED — Doc-3 v1.9 §Notes (verbatim):
// "No `identity.list_page_size_max`. … a separate escalation ([ESC-6-API] / Doc-4A §18.2) — not coined
// here"; Doc-5A §8.5 requires POLICY-keyed min/max/default, never a literal. With no key to read and
// literals forbidden, the wire face REJECTS a supplied `page_size`/`cursor`/`sort` (400, citing the
// handle) and this query returns the FULL self-scoped set in the frozen order with `page_info
// { has_more: false }`. When the key registers, the slice/cursor activates here — never a literal meanwhile.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { listMembershipsForUser } from "../../infrastructure/data/context.repository";
import type {
  ListMyOrganizationsInput,
  ListMyOrganizationsResult,
  MyOrganizationView,
} from "../../contracts/types";

/**
 * `identity.list_my_organizations.v1` (Doc-4C §C8 PassB:558). List the caller's memberships as
 * `{ organization_id, name, membership_state, role_id }`, ordered by org `name` (tiebreaker
 * `organization_id`). `state_filter` (`active` default | `all`) filters by MEMBERSHIP state only —
 * never by org status (a suspended org the caller belongs to still appears; the switch enforces "org
 * not suspended"). Solo Trader guarantees ≥1 (a provisioned user always holds ≥1 membership).
 */
export async function listMyOrganizations(
  input: ListMyOrganizationsInput,
  ctx: { userId: string },
  db: DbExecutor = prisma,
): Promise<ListMyOrganizationsResult> {
  const includeNonActive = input.stateFilter === "all";
  const rows = await listMembershipsForUser(ctx.userId, includeNonActive, db);

  const items: MyOrganizationView[] = rows.map((r) => ({
    organizationId: r.organizationId,
    name: r.name,
    membershipState: r.membershipState,
    roleId: r.roleId,
  }));

  // Doc-5A §8.6 list shape: `next_cursor` present IFF more results exist — the fail-closed interim returns
  // the full set, so `has_more` is always false and no cursor is ever issued (§8.2 opacity: a client can
  // therefore never legitimately supply one — the wire face rejects any).
  return { items, pageInfo: { hasMore: false } };
}
