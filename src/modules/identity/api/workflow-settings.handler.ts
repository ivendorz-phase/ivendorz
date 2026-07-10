// M1 api (PRIVATE) — the HTTP wire mappings for the two §C11 workflow-settings contracts (Doc-4C §C11
// → Doc-5C §6.1 rows 34–35). W2-IDN-6.8. Pure mappers — no orchestration, no I/O. One-Owner placement:
// M1 owns how its read/write become HTTP.
//
//   - `get_workflow_settings`    → present → `200` (§5.6 envelope) + the `ETag` current-token header
//                                  (Doc-5A §9.5/§4.0 — an HTTP infrastructure header, NOT a response
//                                  field; it hands the client the token the update's REQUIRED `If-Match`
//                                  consumes, Doc-5C §6.4); absent / cross-tenant / no-context → `404`
//                                  (byte-identical non-disclosure collapse — Doc-5C §6.3).
//   - `update_workflow_settings` → `200` (§5.6) / the §C11 register legs (VALIDATION 400 · AUTHORIZATION
//                                  403 · NOT_FOUND 404 · BUSINESS 422 · CONFLICT 409 + the §9.5 `ETag`).
//
// The `identity_workflow_*` `error_code`s are owned by Doc-4C §C11 (PassB:709/:721) — carried by
// pointer, never coined here. `null` outcome = the active-org-context / non-disclosure collapse
// (Doc-5A §6.6 safe default — `404`).

import { concurrencyEtag, errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  GetWorkflowSettingsResult,
  UpdateWorkflowSettingsOutcome,
  UpdateWorkflowSettingsResult,
  WorkflowSettingsError,
  WorkflowSettingsView,
} from "@/modules/identity/contracts";

// The frozen §C11 register codes shared by the composition edge (never re-declared literals — the
// `orgInvalidInput` precedent).
const WORKFLOW_INVALID_INPUT_CODE = "identity_workflow_invalid_input";
const WORKFLOW_NOT_FOUND_CODE = "identity_workflow_not_found";

/** The §C11 SYNTAX failure response (`identity_workflow_invalid_input` → §6.2 `400`) — used by the
 *  composition for the mandatory Idempotency-Key leg and malformed-body legs. */
export function workflowSettingsInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: WORKFLOW_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/** The uniform §6.3 non-disclosure collapse (`identity_workflow_not_found` → `404`) — unresolved
 *  active-org context, or an absent/cross-tenant settings row. Byte-identical wherever raised. */
export function workflowSettingsNotFoundCollapse(): WireResponse<never> {
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: WORKFLOW_NOT_FOUND_CODE,
    message: "Not found.",
    retryable: false,
  });
}

/** The ONE §C11 error→wire mapping (the update wire face shares it) — the §9.5 stale-precondition /
 *  §9.4 losing-write leg carries the `ETag` current token; every other leg carries no header (the
 *  RV-0152 call-13 discipline — a token on a non-conflict rejection is a false retry signal). */
export function workflowSettingsErrorResponse(error: WorkflowSettingsError): WireResponse<never> {
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
 * Map a resolved `identity.get_workflow_settings.v1` outcome to its Doc-5A wire response. Present →
 * `200` + the §5.6 envelope (`result` = the `workflow_settings` object) + the `ETag` current-token
 * header (§9.5/§4.0). `null` (unresolved context) OR `{ found: false }` (absent / cross-tenant) →
 * the byte-identical `404` collapse (non-disclosure — Doc-5C §6.3).
 */
export function mapGetWorkflowSettings(
  outcome: GetWorkflowSettingsResult | null,
): WireResponse<WorkflowSettingsView> {
  if (outcome !== null && outcome.found) {
    const ok = successResponse(outcome.settings, 200);
    return { ...ok, headers: { ETag: concurrencyEtag(outcome.updatedAt) } };
  }
  return workflowSettingsNotFoundCollapse();
}

/** Map `identity.update_workflow_settings.v1` → `200` (§5.6 envelope) / the §C11 register legs. `null`
 *  outcome = the active-org-context / non-disclosure collapse (`404`). */
export function mapUpdateWorkflowSettings(
  outcome: UpdateWorkflowSettingsOutcome | null,
): WireResponse<UpdateWorkflowSettingsResult> {
  if (outcome === null) {
    return workflowSettingsNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return workflowSettingsErrorResponse(outcome.error);
}
