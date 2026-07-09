// M1 domain (PRIVATE) — the `delegation_grant_status` transition matrix (DR-6-STATE, service-layer).
// This is the SINGLE authority for which delegation-grant lifecycle edges are legal; the application
// commands and the System expiry worker consult it and NEVER hand-roll a transition. A paraphrased
// machine is the repository's cardinal sin — so the legal edge set below is transcribed VERBATIM from
// Doc-2 §5.10 (bound by pointer, not redefined):
//
//   draft ──grant [granted_by must hold authority in controlling org]──▶ active
//   active ──suspend──▶ suspended ──reinstate──▶ active
//   active|suspended ──revoke──▶ **revoked**
//   active ──valid_to passes──▶ **expired**
//
// Every legal edge is enumerated in `LEGAL_TRANSITIONS`; anything not enumerated is ILLEGAL and MUST be
// rejected (fail-closed). Two edges are deliberately ABSENT and are load-bearing:
//   • `suspended → expired` — NOT legal. Doc-2 §5.10 says only `active` expires (`active ──valid_to
//     passes──▶ expired`); the suspended-at-`valid_to`-lapse disposition is UNSPECIFIED and carried on
//     `[ESC-IDN-DELEG-EXPIRY]` (Doc-4C §C9 `expire_delegation_grant`). The System sweep expires `active`
//     grants ONLY. Do not add this edge until the ESC resolves.
//   • `suspended → active` (reinstate) — legal per §5.10, BUT the reinstate COMMAND is scaffold-gated on
//     `[ESC-IDN-DELEG-EXPIRY]` (whether reinstatement into an elapsed window is permitted is unspecified).
//     The edge lives here (the machine is complete); the command does not exercise it until the ESC rules.
//
// `revoked` and `expired` are TERMINAL (§13) — no outgoing edge; a terminal grant never reopens.

/** The five `delegation_grant_status` values (Doc-2 §5.10 / the `DelegationGrantStatus` enum, Doc-6C §3.9). */
export type DelegationGrantStatus = "draft" | "active" | "suspended" | "revoked" | "expired";

/** The terminal states (§13) — no legal outgoing transition. */
export const TERMINAL_DELEGATION_STATUSES: ReadonlySet<DelegationGrantStatus> = new Set([
  "revoked",
  "expired",
]);

/** A directed lifecycle edge `from → to`. */
export interface DelegationGrantTransition {
  from: DelegationGrantStatus;
  to: DelegationGrantStatus;
}

// Encode each legal edge as a `"from>to"` key for O(1) matrix membership. VERBATIM from Doc-2 §5.10 —
// exactly six edges; nothing more (see the two deliberate omissions in the header).
const edgeKey = (from: DelegationGrantStatus, to: DelegationGrantStatus): string => `${from}>${to}`;

const LEGAL_TRANSITIONS: ReadonlySet<string> = new Set([
  edgeKey("draft", "active"), //      issue: draft ──grant──▶ active
  edgeKey("active", "suspended"), //  suspend: active ──suspend──▶ suspended
  edgeKey("suspended", "active"), //  reinstate: suspended ──reinstate──▶ active (command scaffold-gated)
  edgeKey("active", "revoked"), //    revoke: active ──revoke──▶ revoked (terminal)
  edgeKey("suspended", "revoked"), // revoke: suspended ──revoke──▶ revoked (terminal)
  edgeKey("active", "expired"), //    expire: active ──valid_to passes──▶ expired (terminal; System only)
]);

/** True iff `from → to` is a legal Doc-2 §5.10 edge. Self-loops and every unlisted pair are false. */
export function canTransition(from: DelegationGrantStatus, to: DelegationGrantStatus): boolean {
  return LEGAL_TRANSITIONS.has(edgeKey(from, to));
}

/** Thrown when a caller attempts an edge the machine forbids — the service maps it to the Doc-4C §C9
 *  `identity_delegation_state_invalid` (STATE) error. Carries the rejected edge for diagnostics. */
export class IllegalDelegationTransitionError extends Error {
  readonly from: DelegationGrantStatus;
  readonly to: DelegationGrantStatus;

  constructor(from: DelegationGrantStatus, to: DelegationGrantStatus) {
    super(`Illegal delegation-grant transition: ${from} → ${to} (Doc-2 §5.10).`);
    this.name = "IllegalDelegationTransitionError";
    this.from = from;
    this.to = to;
  }
}

/** Assert `from → to` is legal (Doc-2 §5.10); throw `IllegalDelegationTransitionError` otherwise. The
 *  application commands call this BEFORE writing the new status — an illegal edge never reaches the DB. */
export function assertTransition(from: DelegationGrantStatus, to: DelegationGrantStatus): void {
  if (!canTransition(from, to)) {
    throw new IllegalDelegationTransitionError(from, to);
  }
}
