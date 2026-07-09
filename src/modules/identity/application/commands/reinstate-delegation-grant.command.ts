// M1 application (PRIVATE) — `identity.reinstate_delegation_grant.v1` (Doc-4C §C9, contract #25).
//
// SCAFFOLD-GATED — NOT FINALIZED. The Doc-2 §5.10 `suspended → active` reinstate edge is legal, BUT its
// BUSINESS boundary is UNSPECIFIED: whether reinstatement is permitted when `valid_to` has already lapsed
// is silent in Doc-2 §5.10 and carried on `[ESC-IDN-DELEG-EXPIRY]` (Doc-4C §C9 reinstate Validation
// Matrix — entry condition 4). Until the owner rules that boundary, this command MUST NOT perform the
// transition (inventing the suspended-at-expiry disposition is forbidden — packet + Doc-4C §C9 AI-Agent
// Notes "never invent a `suspended → expired` edge").
//
// So this is a command SHELL that rejects with a handle-citing INTERNAL error (not a user-facing wire
// class — the wire face `W2-IDN-6.5` gates contract #25 until the ESC resolves). The real edge + the
// lapsed-window error disposition land WITH the ruling; the state-machine `suspended → active` edge already
// exists in `delegation-grant.state-machine.ts` (the machine is complete; only this command is gated).

import type { ReinstateDelegationGrantInput } from "../../contracts/types";

/** Thrown by the scaffold `reinstate_delegation_grant` command — its BUSINESS boundary is Board-gated on
 *  `[ESC-IDN-DELEG-EXPIRY]` (Doc-2 §5.10 unresolved). NOT a Doc-5A wire error class; a not-yet-invocable
 *  internal signal. Carries the handle so a caller/log shows exactly why it is gated. */
export class DelegationReinstateGatedError extends Error {
  readonly handle = "ESC-IDN-DELEG-EXPIRY" as const;
  /** The grant the caller attempted to reinstate — diagnostic only (no state was read/changed). */
  readonly delegationGrantId: string;

  constructor(delegationGrantId: string) {
    super(
      "reinstate_delegation_grant is gated on [ESC-IDN-DELEG-EXPIRY]: the suspended-at-valid_to-lapse " +
        "reinstatement boundary is unspecified in Doc-2 §5.10 (Doc-4C §C9). Not invocable until ruled.",
    );
    this.name = "DelegationReinstateGatedError";
    this.delegationGrantId = delegationGrantId;
  }
}

/**
 * `identity.reinstate_delegation_grant.v1` — SCAFFOLD. Performs NO write and NO audit; it rejects by
 * throwing `DelegationReinstateGatedError` (`[ESC-IDN-DELEG-EXPIRY]`). The input is accepted so the command
 * signature is stable for when the edge lands (and echoed into the error for diagnostics), never acted upon.
 */
export async function reinstateDelegationGrantCommand(
  input: ReinstateDelegationGrantInput,
): Promise<never> {
  throw new DelegationReinstateGatedError(input.delegationGrantId);
}
