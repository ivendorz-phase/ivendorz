// M1 api (PRIVATE) — the HTTP wire mapping for `identity.get_delegation_grant.v1`
// (Doc-4C §C9 → `GET /identity/delegation_grants/{id}` → `200`; Doc-5C §5.1). Pure (no I/O).
//
// Non-disclosure: `found: false` (absent OR non-party OR malformed id) and `null` (no active-org
// context, fail-closed) map to ONE byte-identical `404` — never an existence oracle over another
// tenant's delegation relationships (§C9 SCOPE collapse; §7.5; Doc-5A §6.6).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type { DelegationGrantView, GetDelegationGrantResult } from "@/modules/identity/contracts";

/**
 * Map a resolved `identity.get_delegation_grant.v1` outcome to its Doc-5A wire response: `200` with
 * the FROZEN §C9 projection (`result` = the grant view, exactly the frozen field set) or the `404`
 * collapse (frozen §C9 register code `identity_delegation_not_found`).
 */
export function mapGetDelegationGrant(
  outcome: GetDelegationGrantResult | null,
): WireResponse<DelegationGrantView> {
  if (outcome !== null && outcome.found) {
    return successResponse(outcome.grant, 200);
  }
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: "identity_delegation_not_found",
    message: "Not found.",
    retryable: false,
  });
}
