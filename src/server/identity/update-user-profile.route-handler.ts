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

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { resolveSelfUser, withUserSelfContext } from "@/server/context";
import {
  mapUpdateUserProfile,
  updateUserProfile,
  type UpdateUserProfileInput,
  type UpdateUserProfileOutcome,
  type UpdateUserProfileResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the profile-update composition. All injectable (defaults bind production wiring). */
export interface UpdateUserProfileHandlerDeps {
  /** Resolve the authenticated subject (default: the live Supabase cookie session — route entry). */
  resolveSession: ResolveSession;
  /** Lazy first-login provisioning (default: the concrete WP-1.3 hook). */
  ensureProvisioned: typeof ensureProvisioned;
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

  await deps.ensureProvisioned(session);

  // The server-resolved subject (Invariant #5 — never client input); none ⇒ `404` collapse.
  const self = await resolveSelfUser(session);
  if (self === null) {
    return mapUpdateUserProfile(null);
  }

  const outcome: UpdateUserProfileOutcome = await withUserSelfContext(self.userId, (tx) =>
    updateUserProfile(input, { userId: self.userId }, tx),
  );
  return mapUpdateUserProfile(outcome);
}
