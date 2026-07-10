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
//
// §B.6 RETRO-FIT (W2-IDN-6.5): mandatory Idempotency-Key (Doc-5C §4.3); replay lookup PRE-command;
// persist POST-commit — the command owns its OWN locking transaction (the RV-0150 serialization
// contract), so the cache write cannot ride it [logged judgment call]. The unprotected window
// (commit succeeds, cache write lost) is SAFE by the machine: a re-executed departure meets the
// terminal `soft_deleted` subject → the ratified §6.6 `404` collapse, exactly ONE departure audit
// (the 6.1-pinned terminal-replay discrimination) — no duplicate side effect is possible. NOTE the
// stored replay is reachable only WHILE the subject still resolves; after departure the auth
// linkage is severed and the ratified terminal collapse (`404`) takes precedence over §9.3 replay
// identity (non-disclosure of a departed subject beats replay fidelity — logged judgment call).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser, withUserSelfContext } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  deactivateOwnAccount,
  mapDeactivateOwnAccount,
  userAccountInvalidInput,
  type DeactivateOwnAccountInput,
  type DeactivateOwnAccountResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import {
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

const CONTRACT_ID = "identity.deactivate_own_account.v1" as const;

/** Dependencies for the deactivation composition. All injectable (defaults bind production wiring). */
export interface DeactivateOwnAccountHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`): routes always pass string|null;
   *  omitted (undefined) = off-wire caller, dedup inactive. §B.6 retro-fit, W2-IDN-6.5. */
  idempotencyKey?: WireIdempotencyKey;
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

  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — the wire said ABSENT/over-bound → 400.
  if (deps.idempotencyKey === null) {
    return userAccountInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const self = await resolveSelfUser(session);
  if (self === null) {
    return mapDeactivateOwnAccount(null);
  }

  // §B.6 replay lookup — PRE-command (the command owns its own tx; see header). Runs under the
  // self-context GUC so the store's actor-scoped RLS holds in production (backstop).
  if (key !== undefined) {
    const replay = await withUserSelfContext(self.userId, (tx) =>
      findStoredReplay<DeactivateOwnAccountResult>(
        dedupScope(CONTRACT_ID, self.userId, null, key),
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      ),
    );
    if (replay !== null) {
      return replay;
    }
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
  const wire = mapDeactivateOwnAccount(outcome);

  // §B.6 persist — SUCCESS-ONLY, post-commit (see header: the terminal machine makes the
  // unprotected window duplicate-safe by construction). Self-context GUC for the RLS backstop.
  if (outcome.ok && key !== undefined) {
    await withUserSelfContext(self.userId, (tx) =>
      persistWireReplay(dedupScope(CONTRACT_ID, self.userId, null, key), wire, tx),
    );
  }
  return wire;
}
