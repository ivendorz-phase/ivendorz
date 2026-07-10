// M1 api (PRIVATE) — the HTTP wire mapping for `identity.set_user_account_status.v1`
// (Doc-4C §C4 → `POST /identity/users/{id}/set_user_account_status` → `200`; Admin 21.6, no org
// context). W2-IDN-6.1. Pure mapper — no orchestration, no I/O.
//
// The NON-STAFF deny (the check_permission-delegated negative leg at the composition edge) maps to
// the FROZEN §C4 `identity_user_forbidden` (AUTHORIZATION → 403): the §C4 register authors the 403
// leg for this contract — the caller learns only that it lacks platform-staff authority (its own
// fact); nothing about the target is disclosed (target resolution happens AFTER the staff gate,
// per the Doc-4A §11.2 category order — CONTEXT/AUTHZ before any target read).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  SetUserAccountStatusOutcome,
  SetUserAccountStatusResult,
} from "@/modules/identity/contracts";
import { userAccountErrorResponse } from "./update-user-profile.handler";

const FORBIDDEN_CODE = "identity_user_forbidden";

/** The uniform NON-STAFF deny (the frozen §C4 AUTHORIZATION register row → §6.2 `403`). */
export function forbiddenSetUserAccountStatus(): WireResponse<SetUserAccountStatusResult> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: FORBIDDEN_CODE,
    message: "Platform-staff authority required.",
    retryable: false,
  });
}

/** Map a resolved `identity.set_user_account_status.v1` outcome to its Doc-5A wire response. The
 *  losing-write CONFLICT carries the §9.5 `ETag` current token (RV-0152 F2); the
 *  machine-illegal-edge CONFLICT does not (not a precondition mismatch — decided in the command). */
export function mapSetUserAccountStatus(
  outcome: SetUserAccountStatusOutcome,
): WireResponse<SetUserAccountStatusResult> {
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return userAccountErrorResponse(outcome.error);
}
