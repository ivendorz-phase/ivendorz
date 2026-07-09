// M1 domain (PRIVATE) — the "only `active` participates" guard. The authoritative STATEMENT of the
// participation predicate that gates every tenant access decision. PURE (no I/O, no governance-signal read).
//
// Reference-never-restate. The rule is frozen in Doc-2 §5.2 and Doc-4A §6.1 (bound by VERBATIM transcription,
// per the WP acceptance criteria):
//
//   Doc-2 §5.2: "`invited` grants no access; `pending` grants no business access; only `active`
//                participates in the access formula."
//   Doc-4A §6.1 / Doc-4C §C6: "only `active` participates in the access formula."
//
// ENFORCEMENT POINT vs STATEMENT. The access-formula layer-1 read (`authz.repository.findActiveMembership`,
// `where: { state: "active" }`) is where this predicate is ENFORCED at resolution time; this function is the
// canonical, single-owner STATEMENT of the same rule the repository filter conforms to — consulted by the
// W2-IDN-6.2 lifecycle commands and any caller that must reason about participation WITHOUT re-deriving §6.1.
// It is NOT a second enforcement path (it reads no DB); it never widens access (a non-`active` state is never
// a participant), so the two can never disagree.

import type { MembershipState } from "../state-machines/membership.state-machine";
import type { OrganizationStatus } from "../state-machines/organization.state-machine";

/**
 * True iff a membership in `state` participates in the Doc-4A §6.1 access formula. ONLY `active` participates
 * — `invited`/`pending`/`suspended`/`removed` all return false (fail-closed). This is the membership-level
 * gate: a non-`active` membership never satisfies a participation predicate regardless of role/permission.
 */
export function membershipParticipatesInAccessFormula(state: MembershipState): boolean {
  return state === "active";
}

/**
 * True iff an organization in `orgStatus` participates (its members may act). ONLY `active` participates —
 * a `suspended` or `soft_deleted` org never satisfies participation (Doc-2 §5.1; Doc-4C §C11 "org not
 * suspended for the user's access"). Fail-closed for any non-`active` status. This composes with
 * `membershipParticipatesInAccessFormula`: participation requires BOTH the org AND the membership `active`.
 */
export function organizationParticipatesInAccessFormula(orgStatus: OrganizationStatus): boolean {
  return orgStatus === "active";
}
