// M1 api (PRIVATE) — the HTTP wire mapping for `identity.update_user_2fa_settings.v1`
// (Doc-4C §C4 → `POST /identity/users/{id}/update_user_2fa_settings` → `200`; the Doc-5C §4.6(b)
// named-command [realization convention]). W2-IDN-6.1. Pure mapper — no orchestration, no I/O.
//
// `null` = the self-scope / context collapse → Doc-5A §6.6 `404` safe default (non-disclosure;
// includes the no-active-org-context case — the ADR-021 tenant audit leg is unreachable without an
// org anchor, so the audited write fail-closes rather than skipping its audit obligation).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  UpdateUser2faSettingsOutcome,
  UpdateUser2faSettingsResult,
} from "@/modules/identity/contracts";
import { userAccountErrorResponse } from "./update-user-profile.handler";

const USER_NOT_FOUND_CODE = "identity_user_not_found";

/**
 * Map a resolved `identity.update_user_2fa_settings.v1` outcome to its Doc-5A wire response.
 * `null` ⇒ the self-scope/no-context collapse (`404`, non-disclosure). A stale-precondition
 * CONFLICT carries the §9.5 `ETag` current token (via the shared §C4 error mapper — RV-0152 F2).
 */
export function mapUpdateUser2faSettings(
  outcome: UpdateUser2faSettingsOutcome | null,
): WireResponse<UpdateUser2faSettingsResult> {
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
