// M1 api (PRIVATE) — the HTTP wire mapping for `identity.create_delegation_grant.v1`
// (Doc-4C §C9 → `POST /identity/delegation_grants` → `201` + `Location`; Doc-5C §5.1 row 12).
//
// Maps the in-process `CreateDelegationGrantOutcome` to the Doc-5A envelope (§5.6 success / §6.1
// error), choosing the §6.2 status. Owns NO orchestration, touches NO session/transaction — pure
// (no I/O). One-Owner placement: M1 owns how its write becomes HTTP. This file also owns the ONE
// §C9 error→wire mapping every delegation wire face shares (the 6.1 `userAccountErrorResponse`
// idiom): §6.1 envelope, §6.2 status, and — when the error carries the current token (the
// LOSING-WRITE leg only, call-13 discipline) — the Doc-5A §9.5 `ETag` response header.

import { concurrencyEtag, errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  CreateDelegationGrantOutcome,
  CreateDelegationGrantResult,
  DelegationGrantError,
} from "@/modules/identity/contracts";

// The frozen §C9 VALIDATION code (every §C9 register authors it) — exported so the composition edge
// realizes its SYNTAX legs (missing Idempotency-Key / malformed body) from ONE constant, never a
// re-declared literal (the 6.1 `userAccountInvalidInput` precedent).
const DELEGATION_INVALID_INPUT_CODE = "identity_delegation_invalid_input";

/** The §C9-wide SYNTAX failure response (`identity_delegation_invalid_input` → §6.2 `400`). */
export function delegationInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: DELEGATION_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/** The ONE §C9 error→wire mapping (all delegation wire faces share it): §6.1 envelope, §6.2 status,
 *  and the §9.5 `ETag` current-token header when the error carries one (the losing-write leg only —
 *  never a machine-illegal-edge STATE rejection; the RV-0152 call-13 discipline). */
export function delegationGrantErrorResponse(error: DelegationGrantError): WireResponse<never> {
  return errorResponse(
    {
      error_class: error.errorClass,
      error_code: error.errorCode,
      message: error.message,
      retryable: false,
    },
    error.currentUpdatedAt !== undefined
      ? { ETag: concurrencyEtag(error.currentUpdatedAt) }
      : undefined,
  );
}

/**
 * Map a resolved `identity.create_delegation_grant.v1` outcome to its Doc-5A wire response:
 * `201` + the §5.5 `Location` header (the created item's frozen Doc-5C §5.1 address) on success;
 * the §C9 register legs otherwise. `null` ⇒ no active-org context resolved (fail-closed) — the
 * Doc-5A §6.6 non-disclosure collapse (`404`, the delegation-domain register code).
 */
export function mapCreateDelegationGrant(
  outcome: CreateDelegationGrantOutcome | null,
): WireResponse<CreateDelegationGrantResult> {
  if (outcome === null) {
    return errorResponse({
      error_class: "NOT_FOUND",
      error_code: "identity_delegation_not_found",
      message: "Not found.",
      retryable: false,
    });
  }
  if (outcome.ok) {
    const created = successResponse(outcome.result, 201);
    return {
      ...created,
      // The §5.5 `Location` header [realization convention] — a standard HTTP infrastructure
      // header (Doc-5A §4.0 class), pointing at the frozen `GET /identity/delegation_grants/{id}`.
      headers: { Location: `/identity/delegation_grants/${outcome.result.delegationGrantId}` },
    };
  }
  return delegationGrantErrorResponse(outcome.error);
}
