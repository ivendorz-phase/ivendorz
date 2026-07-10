// M1 api (PRIVATE) — the HTTP wire mappings for the three §C9 lifecycle state commands
// (Doc-5C §5.1 — each a named `POST` sub-resource, success `200`):
//   `identity.suspend_delegation_grant.v1`   → POST /identity/delegation_grants/{id}/suspend_delegation_grant
//   `identity.reinstate_delegation_grant.v1` → POST /identity/delegation_grants/{id}/reinstate_delegation_grant
//   `identity.revoke_delegation_grant.v1`    → POST /identity/delegation_grants/{id}/revoke_delegation_grant
//
// Pure outcome→envelope mapping (no I/O). The frozen §C9 RESPONSE field sets are honored EXACTLY:
// suspend/reinstate return `{ delegation_grant_id, status, updated_at }`; REVOKE returns
// `{ delegation_grant_id, status }` — the frozen revoke response OMITS `updated_at` (PassB:619), so
// the mapper strips it (never widened). Errors ride the shared §C9 mapper (ETag on the losing-write
// leg only — call-13 discipline).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  DelegationGrantLifecycleOutcome,
  DelegationGrantLifecycleResult,
  DelegationGrantStatusValue,
} from "@/modules/identity/contracts";
import { delegationGrantErrorResponse } from "./create-delegation-grant.handler";

/** The frozen revoke response shape (PassB:619 — NO `updated_at`). */
export interface RevokeDelegationGrantWireResult {
  delegationGrantId: string;
  status: DelegationGrantStatusValue;
}

/** The shared fail-closed collapse for an unresolved active-org context (Doc-5A §6.6 → `404`). */
function delegationContextCollapse(): WireResponse<never> {
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: "identity_delegation_not_found",
    message: "Not found.",
    retryable: false,
  });
}

/** Map a `suspend_delegation_grant` / `reinstate_delegation_grant` outcome — `200` with the frozen
 *  `{ delegation_grant_id, status, updated_at }` response. `null` ⇒ no active-org context (404). */
export function mapDelegationGrantLifecycle(
  outcome: DelegationGrantLifecycleOutcome | null,
): WireResponse<DelegationGrantLifecycleResult> {
  if (outcome === null) {
    return delegationContextCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return delegationGrantErrorResponse(outcome.error);
}

/** Map a `revoke_delegation_grant` outcome — `200` with the frozen `{ delegation_grant_id, status }`
 *  response (`updated_at` stripped — the frozen §C9 revoke response omits it). */
export function mapRevokeDelegationGrant(
  outcome: DelegationGrantLifecycleOutcome | null,
): WireResponse<RevokeDelegationGrantWireResult> {
  if (outcome === null) {
    return delegationContextCollapse();
  }
  if (outcome.ok) {
    return successResponse(
      { delegationGrantId: outcome.result.delegationGrantId, status: outcome.result.status },
      200,
    );
  }
  return delegationGrantErrorResponse(outcome.error);
}
