// M1 api (PRIVATE) — the HTTP wire mapping for `identity.update_user_profile.v1`
// (Doc-4C §C4 → `PATCH /identity/users/{id}` → `200`; Doc-5A §6.2 errors). W2-IDN-6.1.
//
// Maps the in-process `UpdateUserProfileOutcome` to the Doc-5A envelope (§5.6 success / §6.1 error),
// choosing the §6.2 status. Owns NO orchestration, touches NO session/transaction — pure (no I/O).
// One-Owner placement: M1 owns how its write becomes HTTP.
//
// `null` = the SELF-SCOPE / CONTEXT collapse (path `{id}` ≠ session subject, or no resolvable
// subject): the Doc-5A §6.6 non-disclosure safe default — `404`, indistinguishable from a genuinely
// absent target (§C4: "self-only — never accept a target `user_id` ≠ session user"; another user's
// existence is never the caller's to know). The code is the frozen §C4 user-domain register code.

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  UpdateUserProfileOutcome,
  UpdateUserProfileResult,
} from "@/modules/identity/contracts";

// The frozen §C4 user-domain NOT_FOUND code (authored on `get_user`/`set_user_account_status`),
// reused for the §6.6 collapse — never coined.
const USER_NOT_FOUND_CODE = "identity_user_not_found";
// The frozen §C4 VALIDATION code (every §C4 register authors it).
const USER_INVALID_INPUT_CODE = "identity_user_invalid_input";

/** The §C4-wide SYNTAX failure response (`identity_user_invalid_input` → §6.2 `400`) — used by the
 *  set_user_account_status composition to honor the Doc-4A §11.2 category order for NON-staff
 *  callers (SYNTAX 400 before the 403 deny), so the frozen code lives in ONE place (never
 *  re-declared as a literal at the app edge). */
export function userAccountInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: USER_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/**
 * Map a resolved `identity.update_user_profile.v1` outcome to its Doc-5A wire response. `null` ⇒
 * the self-scope/no-subject collapse (`404`, non-disclosure).
 */
export function mapUpdateUserProfile(
  outcome: UpdateUserProfileOutcome | null,
): WireResponse<UpdateUserProfileResult> {
  if (outcome === null) {
    return errorResponse({
      error_class: "NOT_FOUND",
      error_code: USER_NOT_FOUND_CODE,
      message: "Not found.",
      retryable: false,
    });
  }
  if (outcome.ok) {
    // Doc-5C §4.1 row 1: update → `200` + the §5.6 envelope.
    return successResponse(outcome.result, 200);
  }
  return errorResponse({
    error_class: outcome.error.errorClass,
    error_code: outcome.error.errorCode,
    message: outcome.error.message,
    retryable: false,
  });
}
