// App-layer COMPOSITION for `identity.update_user_profile.v1` (W2-IDN-6.1; Doc-5C §4.1 row 1 —
// `PATCH /identity/users/{id}` · 200). REPOSITORY_STRUCTURE §5/§8: `src/server` wires Supabase
// Auth ↔ context ↔ module contracts; the thin HTTP entry delegates here.
//
// Composition:
//   1. Resolve the Supabase session (injectable). Unauthenticated → the DC-4 auth-boundary `401`.
//   2. `ensureProvisioned(session)` — lazy first-login identity materialization (house standard).
//   3. Resolve the session subject (`resolveSelfUser`); none → the Doc-5A §6.6 non-disclosure `404`.
//   4. `withUserSelfContext(userId, tx => updateUserProfile(...))` — the self-context transaction
//      (`app.user_id` pinned; NO org context — this sub-domain carries none, Doc-5C §4.5). The
//      COMMAND owns the Doc-4A §11.2 category order: SYNTAX (path `{id}` uuid + body fields) →
//      SELF-SCOPE (`{id}` ≠ subject → `404` collapse) → write.
//
// UNAUDITED — frozen Doc-4C §C4 `Audit: no` (the command documents the binding). No events ([DC-1]).
//
// §B.6 RETRO-FIT (W2-IDN-6.5 — the RV-0152 close carry): the wire now REQUIRES the Idempotency-Key
// header (Doc-5C §4.3) and wraps the write in the M1 replay store (`identity.user_update_dedup_window`
// — the contract's own `[DC-5]` key): a within-window same-key replay returns the STORED response,
// no re-execution; the persist rides the SAME self-context transaction (the §14.3 joint rule).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser, withUserSelfContext } from "@/server/context";
import {
  mapUpdateUserProfile,
  updateUserProfile,
  userAccountInvalidInput,
  USER_UPDATE_DEDUP_WINDOW_KEY,
  type UpdateUserProfileInput,
  type UpdateUserProfileResult,
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

const CONTRACT_ID = "identity.update_user_profile.v1" as const;

/** Dependencies for the profile-update composition. All injectable (defaults bind production wiring). */
export interface UpdateUserProfileHandlerDeps {
  /** Resolve the authenticated subject (default: the live Supabase cookie session — route entry). */
  resolveSession: ResolveSession;
  /** Lazy first-login provisioning (default: the concrete WP-1.3 hook). */
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`): routes always pass string|null;
   *  omitted (undefined) = off-wire caller, dedup inactive. §B.6 retro-fit, W2-IDN-6.5. */
  idempotencyKey?: WireIdempotencyKey;
}

/**
 * The HTTP face for `PATCH /identity/users/{id}` — `identity.update_user_profile.v1`. Returns a
 * transport-agnostic `WireResponse`: `200` (§5.6 envelope) · `401` auth-boundary · `400`/`409`
 * (§C4 register) · `404` non-disclosure collapse (path `{id}` ≠ session subject / no subject).
 *
 * @param input the (already type-mapped) §C4 fields — `targetUserId` = the path `{id}`
 *              (server-checked, never trusted) + `updatedAt` from `If-Match`.
 */
export async function handleUpdateUserProfile(
  input: UpdateUserProfileInput,
  deps: UpdateUserProfileHandlerDeps,
): Promise<WireResponse<UpdateUserProfileResult>> {
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

  // The server-resolved subject (Invariant #5 — never client input); none ⇒ `404` collapse.
  const self = await resolveSelfUser(session);
  if (self === null) {
    return mapUpdateUserProfile(null);
  }

  return withUserSelfContext(self.userId, async (tx) => {
    // §B.6 replay lookup — a within-window same-key hit is the stored response (no re-execution).
    if (key !== undefined) {
      const replay = await findStoredReplay<UpdateUserProfileResult>(
        dedupScope(CONTRACT_ID, self.userId, null, key),
        USER_UPDATE_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await updateUserProfile(input, { userId: self.userId }, tx);
    const wire = mapUpdateUserProfile(outcome);

    // §B.6 persist — SUCCESS-ONLY, same tx as the write (the §14.3 joint rule).
    if (outcome.ok && key !== undefined) {
      await persistWireReplay(dedupScope(CONTRACT_ID, self.userId, null, key), wire, tx);
    }
    return wire;
  });
}
