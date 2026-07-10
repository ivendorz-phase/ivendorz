// M1 api (PRIVATE) — the HTTP wire mappings for the six §C7 role/permission contracts (Doc-4C §C7 →
// Doc-5C §5.1 rows 17–22). W2-IDN-6.4. Pure mappers — no orchestration, no I/O. One-Owner placement:
// M1 owns how its writes/reads become HTTP.
//
// One shared §C7 error→wire mapping (the 6.1/6.2/6.3 idiom): §6.1 envelope, §6.2 status, and — when
// the error carries the current concurrency token (a genuine losing-write leg) — the `ETag` response
// header (the call-13 discipline: stale-arrival-view / SCOPE / BUSINESS rejections carry NO token).
// `null` outcome (writes) = the active-org-context / non-disclosure collapse → the frozen 404. The
// two reads never collapse to 404 (a collection face; unresolved context → the empty list).

import { concurrencyEtag, errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  CreateRoleOutcome,
  CreateRoleResult,
  DeleteRoleOutcome,
  DeleteRoleResult,
  ListPermissionsResult,
  ListRolesResult,
  RoleError,
  SetRolePermissionsOutcome,
  SetRolePermissionsResult,
  UpdateRoleOutcome,
  UpdateRoleResult,
} from "@/modules/identity/contracts";

// The frozen §C7 register codes shared by the composition edge (never re-declared literals — the
// 6.1/6.2/6.3 precedent).
const ROLE_INVALID_INPUT_CODE = "identity_role_invalid_input";
const ROLE_NOT_FOUND_CODE = "identity_role_not_found";

/** The wire list shape (Doc-5A §8.6 — items + page_info inside the §5.6 envelope). */
export interface ListPermissionsWireResult {
  items: ListPermissionsResult["items"];
  pageInfo: { hasMore: boolean; nextCursor?: string };
}
export interface ListRolesWireResult {
  items: ListRolesResult["items"];
  pageInfo: { hasMore: boolean; nextCursor?: string };
}

/** The §C7-wide SYNTAX failure response (`identity_role_invalid_input` → §6.2 `400`) — used by the
 *  compositions for the mandatory Idempotency-Key leg and malformed-body/dimension legs. */
export function roleInvalidInput(message: string): WireResponse<never> {
  return errorResponse({
    error_class: "VALIDATION",
    error_code: ROLE_INVALID_INPUT_CODE,
    message,
    retryable: false,
  });
}

/** The uniform §6.6 non-disclosure collapse (`identity_role_not_found` → `404`) — unresolved active-
 *  org context, foreign target, or an unresolvable subject. Byte-identical wherever raised. */
export function roleNotFoundCollapse(): WireResponse<never> {
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: ROLE_NOT_FOUND_CODE,
    message: "Not found.",
    retryable: false,
  });
}

/** The ONE §C7 error→wire mapping (all four write faces share it) — see header. */
export function roleErrorResponse(error: RoleError): WireResponse<never> {
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

/** Map `identity.list_permissions.v1` → `200` (§8.6 list envelope). `null` never occurs (authenticated
 *  scope, no active-org) — the composition passes the resolved result. */
export function mapListPermissions(
  outcome: ListPermissionsResult,
): WireResponse<ListPermissionsWireResult> {
  return successResponse({ items: outcome.items, pageInfo: outcome.pageInfo }, 200);
}

/** Map `identity.list_roles.v1` → `200` (§8.6 list envelope). `null` (no active-org context) ⇒ the
 *  empty list — fail-closed, non-disclosing (the list_delegation_grants collection-face posture). */
export function mapListRoles(outcome: ListRolesResult | null): WireResponse<ListRolesWireResult> {
  if (outcome === null) {
    return successResponse({ items: [], pageInfo: { hasMore: false } }, 200);
  }
  return successResponse({ items: outcome.items, pageInfo: outcome.pageInfo }, 200);
}

/** Map `identity.create_role.v1` → `201` + the `Location` header (the created item's frozen
 *  `/identity/roles/{id}` collection address — the invite/create precedent). */
export function mapCreateRole(outcome: CreateRoleOutcome | null): WireResponse<CreateRoleResult> {
  if (outcome === null) {
    return roleNotFoundCollapse();
  }
  if (outcome.ok) {
    const created = successResponse(outcome.result, 201);
    return { ...created, headers: { Location: `/identity/roles/${outcome.result.roleId}` } };
  }
  return roleErrorResponse(outcome.error);
}

/** Map `identity.update_role.v1` → `200` / the §C7 register legs. */
export function mapUpdateRole(outcome: UpdateRoleOutcome | null): WireResponse<UpdateRoleResult> {
  if (outcome === null) {
    return roleNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return roleErrorResponse(outcome.error);
}

/** Map `identity.set_role_permissions.v1` → `200` / the §C7 register legs. */
export function mapSetRolePermissions(
  outcome: SetRolePermissionsOutcome | null,
): WireResponse<SetRolePermissionsResult> {
  if (outcome === null) {
    return roleNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return roleErrorResponse(outcome.error);
}

/** Map `identity.delete_role.v1` → `200` (soft-delete) / the §C7 register legs. */
export function mapDeleteRole(outcome: DeleteRoleOutcome | null): WireResponse<DeleteRoleResult> {
  if (outcome === null) {
    return roleNotFoundCollapse();
  }
  if (outcome.ok) {
    return successResponse(outcome.result, 200);
  }
  return roleErrorResponse(outcome.error);
}
