// App-layer COMPOSITION for `identity.deactivate_own_account.v1` (W2-IDN-6.1; Doc-5C §4.1 row 3 —
// `POST /identity/users/{id}/deactivate_own_account` · 200). Depart + anonymize (§14.3 redaction).
//
// Composition:
//   1. Resolve session → `401` when unauthenticated.
//   2. `ensureProvisioned(session)` (house standard on authenticated touch).
//   3. Resolve the session subject (`resolveSelfUser`); none → the Doc-5A §6.6 non-disclosure `404`.
//   4. `deactivateOwnAccount(...)` — the COMMAND owns the §C4 order (SYNTAX → self-scope collapse →
//      STATE → BUSINESS Last-Owner → write + anonymize + audit) and opens its OWN transaction under
//      the frozen Doc-6C §6.2a DELETE-anonymize staff-GUC leg (departure spans multiple orgs). The
//      M0 `appendAuditRecord` concrete is injected here (M1 sees only the contract TYPE); audit rows
//      are USER-attributed.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  deactivateOwnAccount,
  mapDeactivateOwnAccount,
  type DeactivateOwnAccountInput,
  type DeactivateOwnAccountResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the deactivation composition. All injectable (defaults bind production wiring). */
export interface DeactivateOwnAccountHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /identity/users/{id}/deactivate_own_account`. Returns `200` (§5.6
 * envelope: `user_id` + `status` = soft_deleted) · `401` auth-boundary · `400` validation · `422`
 * `identity_user_last_owner_block` (succession required first) · `409` conflict · `404` collapse.
 */
export async function handleDeactivateOwnAccount(
  input: DeactivateOwnAccountInput,
  deps: DeactivateOwnAccountHandlerDeps,
): Promise<WireResponse<DeactivateOwnAccountResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  await deps.ensureProvisioned(session);

  const self = await resolveSelfUser(session);
  if (self === null) {
    return mapDeactivateOwnAccount(null);
  }

  const outcome = await deactivateOwnAccount(
    input,
    {
      userId: self.userId,
      ipAddress: deps.ipAddress ?? null,
      userAgent: deps.userAgent ?? null,
    },
    { appendAuditRecord },
  );
  return mapDeactivateOwnAccount(outcome);
}
