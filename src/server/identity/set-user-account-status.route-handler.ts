// App-layer COMPOSITION for `identity.set_user_account_status.v1` (W2-IDN-6.1; Doc-5C §4.1 row 4 —
// `POST /identity/users/{id}/set_user_account_status` · 200 · Admin 21.6, NO org context).
//
// TWO DISCRIMINATED AUTHORIZATION LEGS (RV-0147 B8 lineage — staff-space NEVER via org roles):
//   • AFFIRMATIVE: the server-derived platform-staff basis via the injectable
//     `resolveStaffContext` port (Doc-5C §3.2 actor-type determination). The PRODUCTION default is
//     the DC-3 fail-closed resolver (no staff roster exists in Wave 2 — no principal ever
//     resolves); tests inject a staff context to exercise the allow leg.
//   • NEGATIVE (every non-staff caller): an UNCONDITIONAL 403 DENY-BY-CONSTRUCTION — no resolution
//     result is branched on. The `authorize(...)` call below runs the caller's org context + the
//     frozen `staff_super_admin` slug through the authorization root and its decision is
//     INTENTIONALLY UNUSED (RV-0152 F-B1): the deny holds regardless of what it returns, which is
//     strictly fail-closed (an unconditional deny ≥ branching on a resolver output). The
//     staff-space firewall ("a forged `role_permissions` row grants nothing") is check_permission's
//     OWN contract-level guarantee — discriminated at the query level in its suites and pinned in
//     the 6.1 slice — not something this composition re-derives or depends on. Any non-staff
//     caller — org context or none — maps to the FROZEN §C4 `identity_user_forbidden` (403).
//     No target fact is disclosed (the target is resolved only AFTER the staff gate).
//   ⚠ DC-3 WP MAINTAINER WARNING: when the real staff channel lands, replace ONLY the
//     `resolveStaffContext` production resolver. Do NOT convert the discarded `authorize(...)`
//     result into a branch — the staff basis is actor-type determination (§3.2), never an
//     org-context permission resolution; branching here would introduce FAIL-OPEN risk.

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

  // ── NEGATIVE leg: UNCONDITIONAL 403 deny-by-construction (RV-0152 F-B1 — see header). The
  //    `authorize(...)` decision below is INTENTIONALLY UNUSED: it exercises the authorization
  //    root for observability/consistency, but the deny does NOT depend on it — every non-staff
  //    caller falls through to the same uniform 403 whatever the resolution returns (fail-closed
  //    by construction; §7.5 — the wire never discloses why beyond the caller's own lack of
  //    authority; nothing about the target is disclosed either way).
  //    ⚠ Do NOT branch on this result (fail-open risk — see the header's DC-3 maintainer warning). ──
  const orgContext = await resolveActiveOrg(session);
  if (orgContext.resolved) {
    await authorize({
      userId: orgContext.context.userId,
      activeOrgId: orgContext.context.activeOrgId,
      permissionSlug: SET_USER_ACCOUNT_STATUS_SLUG,
    });
  }
  return forbiddenSetUserAccountStatus();
}
