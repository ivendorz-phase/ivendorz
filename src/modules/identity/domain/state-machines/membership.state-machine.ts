// M1 domain (PRIVATE) — the `membership_state` transition matrix (DR-6-STATE, service-layer). SINGLE
// authority for which membership lifecycle edges are legal; the two System timers realized this WP
// (`activate_membership` · `expire_invitation`) AND the W2-IDN-6.2 wired management commands (out of scope
// here: invite/accept/suspend/reinstate/remove/revoke) MUST consult this and NEVER hand-roll a transition.
// A paraphrased machine is the repository's cardinal sin — so the legal edge set below is transcribed
// VERBATIM from Doc-2 §5.2 (the canonical state/transition home; bound by pointer, not redefined):
//
//   invited ──accept──▶ pending ──verification complete──▶ active
//   active ──suspend──▶ suspended ──reinstate──▶ active
//   active|suspended ──remove──▶ removed   (terminal; audit retained)
//   invited ──expire/revoke──▶ removed
//
// The realized `identity.membership_state` enum (Doc-6C §3.3 / migration) is exactly
// `invited|pending|active|suspended|removed` — this machine and the enum agree. Doc-4M's M5 index paraphrases
// this by COLLAPSING `invited → pending → active` into a single `invited → active` row and omitting `pending`
// / `invited → removed`; Doc-4M is EXPLICITLY non-normative and self-subordinates to Doc-2 §5 (Doc-4M M1/M2:
// "the frozen source governs — this index is corrected"). Doc-2 §5.2 governs; no Flag-and-Halt.
//
// Every legal edge is enumerated in `LEGAL_TRANSITIONS`; anything not enumerated is ILLEGAL and MUST be
// rejected (fail-closed). `removed` is TERMINAL (§13; "terminal; audit retained") — no outgoing edge; a
// removed membership never reopens (a re-invite mints a NEW membership row, Doc-4C §C6). Two edges are
// deliberately load-bearing:
//   • `pending → active` is the `activate_membership` System edge (verification complete; DC-4 signal).
//   • `invited → removed` is the `expire_invitation` System edge (invite window lapsed) AND the
//     `revoke_invitation` User edge (6.2) — both realize the single §5.2 `invited ──expire/revoke──▶ removed`.

/** The five `membership_state` values (Doc-2 §5.2 / the `MembershipState` enum, Doc-6C §3.3). */
export type MembershipState = "invited" | "pending" | "active" | "suspended" | "removed";

/** Terminal states (§13) — `removed` only ("terminal; audit retained"; never reopens). */
export const TERMINAL_MEMBERSHIP_STATES: ReadonlySet<MembershipState> = new Set(["removed"]);

/** A directed lifecycle edge `from → to`. */
export interface MembershipTransition {
  from: MembershipState;
  to: MembershipState;
}

// Encode each legal edge as a `"from>to"` key for O(1) matrix membership. VERBATIM from Doc-2 §5.2 —
// exactly seven edges; nothing more.
const edgeKey = (from: MembershipState, to: MembershipState): string => `${from}>${to}`;

const LEGAL_TRANSITIONS: ReadonlySet<string> = new Set([
  edgeKey("invited", "pending"), //   accept:              invited ──accept──▶ pending
  edgeKey("pending", "active"), //    verification cmplt:  pending ──verification complete──▶ active (activate_membership)
  edgeKey("active", "suspended"), //  suspend:             active ──suspend──▶ suspended
  edgeKey("suspended", "active"), //  reinstate:           suspended ──reinstate──▶ active
  edgeKey("active", "removed"), //    remove (terminal):   active ──remove──▶ removed
  edgeKey("suspended", "removed"), // remove (terminal):   suspended ──remove──▶ removed
  edgeKey("invited", "removed"), //   expire/revoke (term): invited ──expire/revoke──▶ removed (expire_invitation)
]);

/** True iff `from → to` is a legal Doc-2 §5.2 edge. Self-loops and every unlisted pair are false. */
export function canTransitionMembership(from: MembershipState, to: MembershipState): boolean {
  return LEGAL_TRANSITIONS.has(edgeKey(from, to));
}

/** Thrown when a caller attempts an edge the machine forbids — the owning command maps it to the Doc-4C
 *  §C6 `identity_membership_state_invalid` (STATE) error. Carries the rejected edge for diagnostics. */
export class IllegalMembershipTransitionError extends Error {
  readonly from: MembershipState;
  readonly to: MembershipState;

  constructor(from: MembershipState, to: MembershipState) {
    super(`Illegal membership transition: ${from} → ${to} (Doc-2 §5.2).`);
    this.name = "IllegalMembershipTransitionError";
    this.from = from;
    this.to = to;
  }
}

/** Assert `from → to` is legal (Doc-2 §5.2); throw `IllegalMembershipTransitionError` otherwise. The owning
 *  command calls this BEFORE writing the new state — an illegal edge never reaches the DB. */
export function assertMembershipTransition(from: MembershipState, to: MembershipState): void {
  if (!canTransitionMembership(from, to)) {
    throw new IllegalMembershipTransitionError(from, to);
  }
}
