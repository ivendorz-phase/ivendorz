// M1 api (PRIVATE) — the HTTP wire mapping for `identity.deactivate_own_account.v1`
// (Doc-4C §C4 → `POST /identity/users/{id}/deactivate_own_account` → `200`). W2-IDN-6.1.
// Pure mapper — no orchestration, no I/O.
//
// `null` = the self-scope / no-subject collapse → Doc-5A §6.6 `404` safe default (non-disclosure).
// The §C4 error registers surface through the outcome: VALIDATION→400 ·
// `identity_user_last_owner_block` BUSINESS→422 · `identity_user_update_conflict` CONFLICT→409.

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  DeactivateOwnAccountOutcome,
  DeactivateOwnAccountResult,
} from "@/modules/identity/contracts";
import { userAccountErrorResponse } from "./update-user-profile.handler";

const USER_NOT_FOUND_CODE = "identity_user_not_found";

/**
 * Map a resolved `identity.deactivate_own_account.v1` outcome to its Doc-5A wire response.
 * `null` ⇒ the self-scope/no-subject collapse (`404`, non-disclosure). A stale-precondition
 * CONFLICT carries the §9.5 `ETag` current token (via the shared §C4 error mapper — RV-0152 F2).
 */
export function mapDeactivateOwnAccount(
  outcome: DeactivateOwnAccountOutcome | null,
): WireResponse<DeactivateOwnAccountResult> {
  if (outcome === null) {
    return errorResponse({
      error_class: "NOT_FOUND",
      error_code: USER_NOT_FOUND_CODE,
      message: "Not found.",
      retryable: false,
    });
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return userAccountErrorResponse(outcome.error);
}
