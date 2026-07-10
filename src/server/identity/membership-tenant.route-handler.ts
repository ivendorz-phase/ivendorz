// App-layer COMPOSITIONS for the four ACTIVE-ORG §C6 membership commands (W2-IDN-6.3; Doc-5C §5.1):
//   `identity.invite_member.v1`          — `POST /identity/memberships` · 201 + Location
//   `identity.set_membership_status.v1`  — `POST …/{id}/set_membership_status` · 200
//   `identity.remove_member.v1`          — `POST …/{id}/remove_member` · 200
//   `identity.revoke_invitation.v1`      — `POST …/{id}/revoke_invitation` · 200
// (`accept_invitation` is PRE-membership — its composition lives in
// `accept-invitation.route-handler.ts` under the §6.2a mechanism.)
//
// The three lifecycle commands share the 6.2 tenant composition shape:
//   session → 401 · Idempotency-Key REQUIRED (Doc-5C §4.3) → 400 · provision · `withActiveOrg`
//   (unresolved context → the §6.6 404 collapse) → §B.6 replay lookup → command → wire map →
//   §B.6 persist (success-only, same tx — the §14.3 joint rule).
//
// INVITE adds the CREATE legs (the create-organization precedent): SYNTAX FIRST (the exported
// validator on the same category-1 slot), and the §14.3 PRE-EXECUTION CLAIM inside the tenant tx
// (a create has no CAS/machine leg — the claim is the single-execution guard, RV-0153 F2; a lost
// claim returns the concurrent winner's stored §9.3 payload WITHOUT executing). Window POLICY:
// `identity.membership_invite_dedup_window` (invite — its OWN frozen key, Doc-4C §C6 PassB:353) ·
// `identity.command_dedup_window` (the other three — PassB:396/:410/:424). Both UNSEEDED until
// W2-IDN-7 (real read, never a literal).
//
// SERIALIZATION (RV-0150 T6-F1): the `withActiveOrg` transaction IS each command's OWN transaction
// — the §5.5-GUARDED legs (`remove_member` · `set_membership_status` suspend) pass it straight to
// the FOR-UPDATE fact resolver and apply the guarded write on it (facts and writes never split).
// Zero §8 events ([DC-1] — the invite notification fan-out has NO emitter; nothing is dispatched).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  inviteMember,
  mapInviteMember,
  mapRemoveMember,
  mapRevokeInvitation,
  mapSetMembershipStatus,
  MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY,
  membershipInvalidInput,
  removeMember,
  revokeInvitation,
  setMembershipStatus,
  validateInviteMemberInput,
  type InviteMemberInput,
  type InviteMemberResult,
  type RemoveMemberInput,
  type RemoveMemberResult,
  type RevokeInvitationInput,
  type RevokeInvitationResult,
  type SetMembershipStatusInput,
  type SetMembershipStatusResult,
} from "@/modules/identity/contracts";
import { type WireResponse } from "@/shared/http";
import { runTenantCreate, runTenantWrite, type WireIdempotencyKey } from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for a tenant membership composition (uniform across the four commands). */
export interface MembershipTenantHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). Routes always pass string|null.
   *  REQUIRED-field dep shape (RV-0153 OBS-2 — never optional on a new composition). */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `POST /identity/memberships` (`201` + `Location`) — `identity.invite_member.v1`
 * with the §14.3 CREATE claim leg (see header). Returns the §9.3 stored replay on a within-window
 * same-key re-submission.
 */
export async function handleInviteMember(
  input: InviteMemberInput,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<InviteMemberResult>> {
  return runTenantCreate(
    "identity.invite_member.v1",
    MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY,
    (ctx, tx) => inviteMember(input, ctx, { appendAuditRecord }, tx),
    mapInviteMember,
    (o) => o.ok,
    membershipInvalidInput,
    deps,
    () => validateInviteMemberInput(input),
  );
}

/** The HTTP face for `POST /identity/memberships/{id}/set_membership_status` (`200`) — the
 *  §5.5-guarded suspend leg / the unguarded reinstate leg (RV-0150: the `withActiveOrg` tx IS the
 *  lock tx). */
export async function handleSetMembershipStatus(
  input: SetMembershipStatusInput,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<SetMembershipStatusResult>> {
  return runTenantWrite(
    "identity.set_membership_status.v1",
    (ctx, tx) => setMembershipStatus(input, ctx, { appendAuditRecord }, tx),
    mapSetMembershipStatus,
    (o) => o.ok,
    membershipInvalidInput,
    deps,
  );
}

/** The HTTP face for `POST /identity/memberships/{id}/remove_member` (`200`) — the §5.5-guarded
 *  terminal removal (RV-0150: the `withActiveOrg` tx IS the lock tx). */
export async function handleRemoveMember(
  input: RemoveMemberInput,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<RemoveMemberResult>> {
  return runTenantWrite(
    "identity.remove_member.v1",
    (ctx, tx) => removeMember(input, ctx, { appendAuditRecord }, tx),
    mapRemoveMember,
    (o) => o.ok,
    membershipInvalidInput,
    deps,
  );
}

/** The HTTP face for `POST /identity/memberships/{id}/revoke_invitation` (`200`) — `invited →
 *  removed` (terminal; NOT §5.5-guarded — no frozen §5.5 stage). */
export async function handleRevokeInvitation(
  input: RevokeInvitationInput,
  deps: MembershipTenantHandlerDeps,
): Promise<WireResponse<RevokeInvitationResult>> {
  return runTenantWrite(
    "identity.revoke_invitation.v1",
    (ctx, tx) => revokeInvitation(input, ctx, { appendAuditRecord }, tx),
    mapRevokeInvitation,
    (o) => o.ok,
    membershipInvalidInput,
    deps,
  );
}
