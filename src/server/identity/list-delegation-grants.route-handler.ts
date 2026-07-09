// App-layer COMPOSITION for `identity.list_delegation_grants.v1` (W2-IDN-6.5; Doc-5C §5.1 —
// `GET /identity/delegation_grants` · `200`). Party-scoped list (frozen §C9 filters + order).
//
// PAGINATION FAIL-CLOSED (handle-gated — `ESC-IDN-LIST-PAGESIZE` proposed): the §C9 `page_size`
// bound is a `[DC-5]` POLICY key that was NEVER REGISTERED — Doc-3 v1.9 §Notes (verbatim): "No
// `identity.list_page_size_max`. … a separate escalation ([ESC-6-API] / Doc-4A §18.2) — not coined
// here"; Doc-5A §8.5 requires POLICY-keyed min/max/default, never a literal. With no key to read
// and literals forbidden, a SUPPLIED `page_size` is rejected (400, citing the handle) — and since
// this interim never ISSUES a cursor (`has_more` always false), a supplied `cursor` cannot be a
// token from a prior response (Doc-5A §8.2 opacity: clients MUST NOT construct one) and is rejected
// the same way. A client `sort` is likewise a SYNTAX failure — §C9 declares NO sortable allowlist
// (Doc-5A §8.4: sorting on an undeclared field → 400); the frozen `valid_from` order is server-fixed.
//
// Unresolved active-org context → the EMPTY list (fail-closed deny/empty for a collection face).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import {
  delegationInvalidInput,
  listDelegationGrants,
  mapListDelegationGrants,
  type ListDelegationGrantsInput,
  type ListDelegationGrantsWireResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

export interface ListDelegationGrantsHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/** The RAW wire query dimensions (route-extracted, unvalidated — this composition owns SYNTAX). */
export interface ListDelegationGrantsWireInput {
  roleFilter?: string;
  statusFilter?: string;
  vendorProfileId?: string;
  /** Presence of any of these three = the fail-closed 400 (see header). */
  pageSize?: string;
  cursor?: string;
  sort?: string;
}

const ROLE_FILTERS = new Set(["as_controlling", "as_representative", "any"]);
const STATUS_FILTERS = new Set(["draft", "active", "suspended", "revoked", "expired"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The HTTP face for `GET /identity/delegation_grants`. Returns `200` (§8.6 list envelope) · `401`
 * auth-boundary · `400` (undeclared/enum-invalid dimension; the handle-gated pagination legs).
 */
export async function handleListDelegationGrants(
  input: ListDelegationGrantsWireInput,
  deps: ListDelegationGrantsHandlerDeps,
): Promise<WireResponse<ListDelegationGrantsWireResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX (Doc-4A §11.2 category 1) — the fail-closed pagination/sort legs first (see header).
  if (input.pageSize !== undefined) {
    return delegationInvalidInput(
      "page_size is not accepted: the identity page-size POLICY bound is unregistered (ESC-IDN-LIST-PAGESIZE).",
    );
  }
  if (input.cursor !== undefined) {
    return delegationInvalidInput(
      "cursor is not accepted: no cursor has been issued (pagination pending ESC-IDN-LIST-PAGESIZE).",
    );
  }
  if (input.sort !== undefined) {
    return delegationInvalidInput(
      "sort is not accepted: the contract declares no sortable field (server-fixed valid_from order).",
    );
  }
  // The frozen filter enums / uuid (allowlist — Doc-4A §9.6; §C9 request contract).
  if (input.roleFilter !== undefined && !ROLE_FILTERS.has(input.roleFilter)) {
    return delegationInvalidInput("role_filter must be as_controlling | as_representative | any.");
  }
  if (input.statusFilter !== undefined && !STATUS_FILTERS.has(input.statusFilter)) {
    return delegationInvalidInput("status_filter must be a delegation_grant_status value.");
  }
  if (input.vendorProfileId !== undefined && !UUID_RE.test(input.vendorProfileId)) {
    return delegationInvalidInput("vendor_profile_id must be a uuid.");
  }

  await deps.ensureProvisioned(session);

  const typed: ListDelegationGrantsInput = {
    ...(input.roleFilter !== undefined
      ? { roleFilter: input.roleFilter as ListDelegationGrantsInput["roleFilter"] }
      : {}),
    ...(input.statusFilter !== undefined
      ? { statusFilter: input.statusFilter as ListDelegationGrantsInput["statusFilter"] }
      : {}),
    ...(input.vendorProfileId !== undefined ? { vendorProfileId: input.vendorProfileId } : {}),
  };

  const ran = await withActiveOrg(session, (tx, context) =>
    listDelegationGrants(typed, context.activeOrgId, tx),
  );
  return mapListDelegationGrants(ran.resolved ? ran.value : null);
}
