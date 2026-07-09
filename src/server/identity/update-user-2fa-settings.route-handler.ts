// App-layer COMPOSITION for `identity.update_user_2fa_settings.v1` (W2-IDN-6.1; Doc-5C §4.1 row 2 —
// `POST /identity/users/{id}/update_user_2fa_settings` · 200). Settings only — DC-4.
//
// Composition (the D7 audited-write shape):
//   1. Resolve session → `401` when unauthenticated.
//   2. `ensureProvisioned(session)`.
//   3. `withActiveOrg(session, (tx, context) => updateUser2faSettings(..., { appendAuditRecord }, tx))`
//      — this AUDITED self write runs inside the active-org transaction because the ADR-021
//      `audit_records_context_append` tenant leg admits a USER-attributed audit row ONLY with the
//      server-resolved org anchor (`app.active_org` + `app.user_id` + actor 'user'). The org is the
//      AUDIT-CONTEXT anchor (D7 rule 8), NOT an authorization gate (the sub-domain carries none —
//      Doc-5C §4.5); no active membership ⇒ the audit obligation is unreachable ⇒ fail-closed `404`
//      collapse (the write is never performed unaudited — Doc-4B §B10).
//   4. The COMMAND owns the Doc-4A §11.2 category order: SYNTAX (path `{id}` uuid + body fields) →
//      SELF-SCOPE (`{id}` ≠ subject → `404` collapse) → write + audit (one tx).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  mapUpdateUser2faSettings,
  updateUser2faSettings,
  type UpdateUser2faSettingsInput,
  type UpdateUser2faSettingsOutcome,
  type UpdateUser2faSettingsResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the 2FA-settings composition. All injectable (defaults bind production wiring). */
export interface UpdateUser2faSettingsHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /identity/users/{id}/update_user_2fa_settings`. Returns `200` (§5.6
 * envelope) · `401` auth-boundary · `400`/`409` (§C4 register) · `404` collapse (self-scope /
 * no-context — non-disclosure).
 */
export async function handleUpdateUser2faSettings(
  input: UpdateUser2faSettingsInput,
  deps: UpdateUser2faSettingsHandlerDeps,
): Promise<WireResponse<UpdateUser2faSettingsResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, (tx, context) =>
    updateUser2faSettings(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    ),
  );

  const outcome: UpdateUser2faSettingsOutcome | null = ran.resolved ? ran.value : null;
  return mapUpdateUser2faSettings(outcome);
}
