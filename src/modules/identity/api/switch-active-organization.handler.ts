// M1 api (PRIVATE) — the HTTP wire mapping for `identity.switch_active_organization.v1`
// (Doc-4C §C8 → `POST /identity/active_context/switch_active_organization` → `200`; Doc-5C §6.1 row 29).
// Pure (no I/O). Owns the ONE §C8 SYNTAX-error constant every context wire face shares.
//
// Non-disclosure: the not-a-member SCOPE failure and a no-user collapse map to ONE byte-identical `404`
// (`identity_context_not_found`) — never an existence oracle over an org the caller has no live membership
// in (§C8 PassB:535/:536). A suspended org (the caller IS a member) is the distinct BUSINESS `422`
// (`identity_context_state_invalid`, PassB:536) — surfaced to a party, per the frozen register.

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  SwitchActiveOrganizationOutcome,
  SwitchActiveOrganizationResult,
} from "@/modules/identity/contracts";

// The frozen §C8 VALIDATION code (switch + list registers author it — PassB:536/:560). Exported so the
// composition edge realizes its SYNTAX legs (missing Idempotency-Key / malformed body / bad enum) from ONE
// constant, never a re-declared literal (the delegation `delegationInvalidInput` precedent).
const CONTEXT_INVALID_INPUT_CODE = "identity_context_invalid_input";

/** The §C8-wide SYNTAX failure response (`identity_context_invalid_input` → §6.2 `400`). */
export function contextInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: CONTEXT_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/** The §C8 NOT_FOUND collapse (`identity_context_not_found` → §6.2 `404`) — not an active member / no
 *  live context; byte-identical for absent/non-member/no-user (non-disclosure, §C8 register). */
function contextNotFound(): WireResponse<never> {
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: "identity_context_not_found",
    message: "Not found.",
    retryable: false,
  });
}

/**
 * Map a resolved `identity.switch_active_organization.v1` outcome to its Doc-5A wire response: `200` with
 * the frozen §C8 projection (`result = { organizationId }`, the server-validated active context) or the
 * §C8 register legs. `null` ⇒ no resolvable principal (fail-closed) → the §6.6 non-disclosure `404`.
 */
export function mapSwitchActiveOrganization(
  outcome: SwitchActiveOrganizationOutcome | null,
): WireResponse<SwitchActiveOrganizationResult> {
  if (outcome === null || (!outcome.ok && outcome.code === "not_found")) {
    return contextNotFound();
  }
  if (!outcome.ok) {
    // BUSINESS `identity_context_state_invalid` → §6.2 `422` — the caller is an active member of a
    // suspended org (the frozen "org not suspended" reject; RV-0150 OBS-B1).
    return errorResponse({
      error_class: "BUSINESS",
      error_code: "identity_context_state_invalid",
      message: "The organization is not available as active context.",
      retryable: false,
    });
  }
  return successResponse({ organizationId: outcome.organizationId }, 200);
}
