// App-layer COMPOSITION for `identity.set_user_account_status.v1` (W2-IDN-6.1; Doc-5C §4.1 row 4 —
// `POST /identity/users/{id}/set_user_account_status` · 200 · Admin 21.6, NO org context).
//
// TWO DISCRIMINATED AUTHORIZATION LEGS (RV-0147 B8 lineage — staff-space NEVER via org roles):
//   • AFFIRMATIVE: the server-derived platform-staff basis via the injectable
//     `resolveStaffContext` port (Doc-5C §3.2 actor-type determination). The PRODUCTION default is
//     the DC-3 fail-closed resolver (no staff roster exists in Wave 2 — no principal ever
//     resolves); tests inject a staff context to exercise the allow leg.
//   • NEGATIVE (every non-staff caller): the deny is DELEGATED to `identity.check_permission`
//     through the wired `src/server/authz` seam (ZERO shadow authorization): the caller's own
//     active-org context + the frozen `staff_super_admin` slug run through the authorization root,
//     whose staff-space firewall denies REGARDLESS of org-role composition (a forged
//     `role_permissions` row grants nothing — the RV-0147 B8 discrimination). Any deny — or no
//     resolvable org context at all — maps to the FROZEN §C4 `identity_user_forbidden` (403).
//     No target fact is disclosed (the target is resolved only AFTER the staff gate).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveActiveOrg, resolveStaffContext, type ResolveStaffContext } from "@/server/context";
import { authorize } from "@/server/authz";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  forbiddenSetUserAccountStatus,
  mapSetUserAccountStatus,
  SET_USER_ACCOUNT_STATUS_SLUG,
  setUserAccountStatus,
  userAccountInvalidInput,
  validateSetUserAccountStatusInput,
  type SetUserAccountStatusInput,
  type SetUserAccountStatusResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the Admin status composition. All injectable (defaults bind production wiring). */
export interface SetUserAccountStatusHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The server-side staff-principal resolution port (default: the DC-3 FAIL-CLOSED resolver). */
  resolveStaffContext?: ResolveStaffContext;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /identity/users/{id}/set_user_account_status`. Returns `200` (§5.6
 * envelope) · `401` auth-boundary · `403` `identity_user_forbidden` (non-staff — the frozen §C4
 * AUTHORIZATION leg) · `400`/`404`/`409` (§C4 register, staff path only).
 */
export async function handleSetUserAccountStatus(
  input: SetUserAccountStatusInput,
  deps: SetUserAccountStatusHandlerDeps,
): Promise<WireResponse<SetUserAccountStatusResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (Doc-4A §11.2 fixed order — category 1 decides before CONTEXT/AUTHZ): a
  // syntactically invalid request is `400` for EVERY caller, staff or not (the command re-runs the
  // same exported validator — single source, no re-derivation).
  const syntaxFailure = validateSetUserAccountStatusInput(input);
  if (syntaxFailure !== null) {
    return userAccountInvalidInput(syntaxFailure);
  }

  await deps.ensureProvisioned(session);

  // ── AFFIRMATIVE leg: the server-derived platform-staff basis (never client-asserted). ──
  const staff = await (deps.resolveStaffContext ?? resolveStaffContext)(session);
  if (staff !== null) {
    const outcome = await setUserAccountStatus(
      input,
      {
        adminUserId: staff.userId,
        isPlatformStaff: staff.isPlatformStaff,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
    );
    return mapSetUserAccountStatus(outcome);
  }

  // ── NEGATIVE leg: delegate the deny to the authorization root (no shadow authz). The caller's
  //    own org context is resolved server-side; the staff slug can NEVER be satisfied through it
  //    (staff-space firewall) — the call exists so check_permission REMAINS the single decider.
  //    No resolvable org context is the same uniform deny (the caller's own fact; nothing about
  //    the target is disclosed either way). ──
  const orgContext = await resolveActiveOrg(session);
  if (orgContext.resolved) {
    await authorize({
      userId: orgContext.context.userId,
      activeOrgId: orgContext.context.activeOrgId,
      permissionSlug: SET_USER_ACCOUNT_STATUS_SLUG,
    });
    // The decision is deny BY CONSTRUCTION (staff space); uniform 403 regardless of deny reason
    // (§7.5 — the wire never discloses why beyond the caller's own lack of authority).
  }
  return forbiddenSetUserAccountStatus();
}
