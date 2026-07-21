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
// M1's private command. The Module 0 services flow through contracts too (WP-1.4: the CONCRETE M0
// facades from `@/modules/core/contracts` are the DEFAULT dependencies at this composition edge —
// fully concrete end-to-end, still strictly contracts/-only). A caller may inject stand-ins (tests).
// This file owns the AUTHENTICATION→provisioning seam only — authorization (active-org context,
// check_permission, guards) is NOT here (Doc-7C §3.3).
//
// ATTRIBUTION INGRESS (P2-A3 — Doc-4C v1.0.3 §PROV-EXT; closes L3-MINOR-2): the raw invitation
// token carried by the HttpOnly `iv_invite_token` cookie (set by the `/invite` ingress — P2-A2) is
// read SERVER-SIDE here and passed into `provisionIdentity` as the optional `referralToken` input;
// the CONCRETE `writeOutboxEvent` + `appendAuditRecord` M0 facades are injected by default so the
// §PROV-EXT bind's unconditional event/audit legs are live (the command's dep-guard no longer
// skips). FAIL-OPEN stands (the command guarantees it — no throw path is added here): a bad /
// missing / expired token never fails registration. After the provisioning attempt (bound or
// fail-open no-bind) the cookie is cleared best-effort so the token does not linger (bounded
// maxAge + the next mutable context own any read-only-context residue). The token value is NEVER
// logged in this path.

import {
  allocateHumanReference as coreAllocateHumanReference,
  appendAuditRecord as coreAppendAuditRecord,
  writeOutboxEvent as coreWriteOutboxEvent,
  type AllocateHumanReference,
  type AppendAuditRecord,
  type WriteOutboxEvent,
} from "@/modules/core/contracts";
import { provisionIdentity, type ProvisionIdentityResult } from "@/modules/identity/contracts";
import { clearInviteTokenCookie, readInviteTokenCookie } from "./invite-token-cookie";

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

/** Dependencies for provisioning. Optional — defaults bind the CONCRETE M0 contract facades. */
export interface EnsureProvisionedDeps {
  /**
   * The Module 0 `core.allocate_human_reference.v1` contract service (Doc-4B §A7), passed straight
   * into the M1 `provisionIdentity` contract. Defaults to the concrete M0 facade from
   * `@/modules/core/contracts` (the composition wire is fully concrete end-to-end); a caller may
   * override it (e.g. a test stand-in). Always consumed via contracts — never a cross-module internal value.
   */
  allocateHumanReference: AllocateHumanReference;
  /**
   * `core.write_outbox_event.v1` (Doc-4B) — the §PROV-EXT `InvitationConverted` outbox leg
   * (P2-A3). Optional; absent, the CONCRETE M0 facade is bound (so the attribution bind's
   * unconditional event leg is live — the L3-MINOR-2 closure). Test stand-ins may override.
   */
  writeOutboxEvent?: WriteOutboxEvent;
  /**
   * `core.append_audit_record.v1` (Doc-4B §A10) — the §PROV-EXT `invitation_converted` audit leg
   * (P2-A3). Optional; absent, the CONCRETE M0 facade is bound (same closure posture).
   */
  appendAuditRecord?: AppendAuditRecord;
}

/** The fully-concrete default deps — the M0 contract facades bound at the composition edge. */
const defaultDeps: EnsureProvisionedDeps = {
  allocateHumanReference: coreAllocateHumanReference,
  writeOutboxEvent: coreWriteOutboxEvent,
  appendAuditRecord: coreAppendAuditRecord,
};

/**
 * Ensure the authenticated user is provisioned (idempotent + atomic — the guarantees live behind the
 * M1 contract). Safe to call on every first-touch authenticated request: a second/concurrent call
 * creates nothing. Reads the `iv_invite_token` carriage cookie (fail-open — absent/out-of-scope →
 * no token) and hands it to the §PROV-EXT attribution seam; clears the cookie after the attempt.
 *
 * @param session the authenticated Supabase subject (authentication established upstream).
 * @param deps    Module 0 contract services; default to the concrete M0 contract facades.
 */
export async function ensureProvisioned(
  session: AuthSession,
  deps: EnsureProvisionedDeps = defaultDeps,
): Promise<ProvisionIdentityResult> {
  // Server-side cookie read (P2-A3) — the ONLY carriage between the `/invite` ingress and the
  // §PROV-EXT bind. Null outside a request scope or with no cookie: provisioning behaves exactly
  // as frozen (no token → no bind; never an error path).
  const referralToken = await readInviteTokenCookie();

  const result = await provisionIdentity(
    {
      authUserId: session.authUserId,
      email: session.email ?? null,
      referralToken,
    },
    {
      allocateHumanReference: deps.allocateHumanReference,
      writeOutboxEvent: deps.writeOutboxEvent ?? coreWriteOutboxEvent,
      appendAuditRecord: deps.appendAuditRecord ?? coreAppendAuditRecord,
    },
  );

  // Success OR fail-open no-bind: the token must not linger (P2-A3). Best-effort — a read-only
  // (RSC) context swallows the clear; the bounded cookie maxAge owns the residue.
  if (referralToken !== null) {
    await clearInviteTokenCookie();
  }

  return result;
}

export type { ProvisionIdentityResult };
