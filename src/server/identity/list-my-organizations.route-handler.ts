// App-layer COMPOSITION for `identity.list_my_organizations.v1` (W2-IDN-6.6; Doc-5C §6.1 row 31 —
// `GET /identity/organizations` · `200`). The context-switcher SOURCE list — SELF-scoped (the caller's
// own memberships), PRINCIPAL-resolved (no active-org context needed — the CONTEXT stage is "authenticated"
// only, Doc-4C §C8 PassB:559; the list must work before any context is set, incl. when the caller's only
// org was suspended). Reads carry no Idempotency-Key (queries) and are unaudited (§17.1).
//
// BOUNDARY: like `resolveActiveOrg`/`resolveSelfUser`, this resolves the principal's own tenant-directory
// rows at the app-composition edge (self-anchored on `user_id` — the primary control; RLS is the backstop).
// It spans ALL the caller's orgs, so it cannot be scoped to a single active-org RLS context (which would
// hide `state_filter=all` non-active memberships behind `organizations_member_visible`).
//
// PAGINATION FAIL-CLOSED (handle-gated `ESC-IDN-LIST-PAGESIZE`, 🟠): the §C8 `page_size` bound is a
// `[DC-5]` POLICY key NEVER REGISTERED (Doc-3 v1.9 §Notes; Doc-5A §8.5 requires POLICY-keyed min/max/
// default, never a literal). A supplied `page_size` is rejected (400); since this interim never ISSUES a
// cursor (§8.2 opacity), a supplied `cursor` is rejected likewise; a client `sort` is a SYNTAX failure
// (§C8 declares NO sortable allowlist — the frozen org-`name` order is server-fixed, Doc-5A §8.4).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser } from "@/server/context";
import {
  contextInvalidInput,
  listMyOrganizations,
  mapListMyOrganizations,
  type ListMyOrganizationsInput,
  type ListMyOrganizationsResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

export interface ListMyOrganizationsHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/** The RAW wire query dimensions (route-extracted, unvalidated — this composition owns SYNTAX). */
export interface ListMyOrganizationsWireInput {
  stateFilter?: string;
  /** Presence of any of these three = the fail-closed 400 (see header). */
  pageSize?: string;
  cursor?: string;
  sort?: string;
}

const STATE_FILTERS = new Set(["active", "all"]);

/**
 * The HTTP face for `GET /identity/organizations` (principal-scoped list). Returns `200` (§8.6 list
 * envelope) · `401` auth-boundary · `400` (undeclared pagination/sort dimension; bad `state_filter` enum).
 */
export async function handleListMyOrganizations(
  input: ListMyOrganizationsWireInput,
  deps: ListMyOrganizationsHandlerDeps,
): Promise<WireResponse<ListMyOrganizationsResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX (Doc-4A §11.2 category 1) — the fail-closed pagination/sort legs first (see header).
  if (input.pageSize !== undefined) {
    return contextInvalidInput(
      "page_size is not accepted: the identity page-size POLICY bound is unregistered (ESC-IDN-LIST-PAGESIZE).",
    );
  }
  if (input.cursor !== undefined) {
    return contextInvalidInput(
      "cursor is not accepted: no cursor has been issued (pagination pending ESC-IDN-LIST-PAGESIZE).",
    );
  }
  if (input.sort !== undefined) {
    return contextInvalidInput(
      "sort is not accepted: the contract declares no sortable field (server-fixed name order).",
    );
  }
  if (input.stateFilter !== undefined && !STATE_FILTERS.has(input.stateFilter)) {
    return contextInvalidInput("state_filter must be active | all.");
  }

  await deps.ensureProvisioned(session);

  const user = await resolveSelfUser(session);
  if (user === null) {
    // No resolvable principal ⇒ the fail-closed empty list (non-disclosing collection realization).
    return mapListMyOrganizations(null);
  }

  const typed: ListMyOrganizationsInput = {
    ...(input.stateFilter !== undefined
      ? { stateFilter: input.stateFilter as ListMyOrganizationsInput["stateFilter"] }
      : {}),
  };
  const result = await listMyOrganizations(typed, { userId: user.userId });
  return mapListMyOrganizations(result);
}
