// App-layer auth wiring (REPOSITORY_STRUCTURE §5) — first-login identity provisioning hook.
//
// `ensureProvisioned(session, deps)` is the request/auth-layer entry point that guarantees an
// authenticated Supabase user has an `identity.users` record + a default Personal Organization +
// the founding Owner membership (Invariant #5; Architecture §5.2 Solo-Trader Rule). Provisioning is
// OUT-OF-BAND (Doc-7E §2 / [ESC-7-API-SIGNUP]): no `create_user` wire contract is coined.
//
// BOUNDARY (REPOSITORY_STRUCTURE §3/§9): `src/server/` imports another module ONLY through its
// `contracts/`. This file calls the M1 `provisionIdentity` contract via `@/modules/identity/contracts`
// (boundary-legal) — the authoritative atomic/idempotent provisioning lives behind that contract, in
// M1's private command. The Module 0 `core.allocate_human_reference.v1` service flows through
// contracts too: it is INJECTED here (typed from `@/modules/core/contracts`) and passed straight into
// the M1 contract — never imported by `server/` as a concrete cross-module value. The concrete M0
// binding is supplied by the request-composition edge (`src/server/context`/`guards`, WP-1.4) or a
// route/test. This file owns the AUTHENTICATION→provisioning seam only — authorization (active-org
// context, check_permission, guards) is NOT here (Doc-7C §3.3).

import type { AllocateHumanReference } from "@/modules/core/contracts";
import { provisionIdentity, type ProvisionIdentityResult } from "@/modules/identity/contracts";

/**
 * The authenticated subject handed to provisioning — distilled from a Supabase Auth session
 * (authentication only — Doc-7C §3.1). Carries the auth-boundary linkage + email, never a secret.
 */
export interface AuthSession {
  /** The Supabase `auth.users` id (the identity linkage — Doc-6C §3.1 / DC-4). */
  authUserId: string;
  /** The subject's email (auth-managed identifier). */
  email?: string | null;
}

/** Dependencies injected at the request-composition edge (WP-1.4 / route / test). */
export interface EnsureProvisionedDeps {
  /**
   * The Module 0 `core.allocate_human_reference.v1` contract service (Doc-4B §A7), passed straight
   * into the M1 `provisionIdentity` contract. Injected (not imported) because cross-module value
   * surfaces are consumed only via contracts; the concrete binding is supplied at the composition edge.
   */
  allocateHumanReference: AllocateHumanReference;
}

/**
 * Ensure the authenticated user is provisioned (idempotent + atomic — the guarantees live behind the
 * M1 contract). Safe to call on every first-touch authenticated request: a second/concurrent call
 * creates nothing.
 *
 * @param session the authenticated Supabase subject (authentication established upstream).
 * @param deps    the injected Module 0 `allocateHumanReference` service.
 */
export async function ensureProvisioned(
  session: AuthSession,
  deps: EnsureProvisionedDeps,
): Promise<ProvisionIdentityResult> {
  return provisionIdentity(
    { authUserId: session.authUserId, email: session.email ?? null },
    { allocateHumanReference: deps.allocateHumanReference },
  );
}

export type { ProvisionIdentityResult };
