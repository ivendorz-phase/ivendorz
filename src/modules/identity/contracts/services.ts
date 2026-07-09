// Public service interfaces + callables for module "identity" — the ONLY cross-module call surface
// (REPOSITORY_STRUCTURE §3). Cross-module consumers (e.g. `src/server`) import from here, never the
// private application/domain/infrastructure layers (the boundary linter enforces this).
//
// `provisionIdentity` (WP-1.3 [W1-AUTH-001]) is the public face over the private M1 first-login
// provisioning command — the contracts/ facade delegates to its OWN module's application layer
// (same-module import; the cross-module One-Module rule is untouched). The Module 0
// `allocateHumanReference` contract service is INJECTED (typed from `@/modules/core/contracts` — a
// cross-module TYPE import, the only boundary-legal way to consume another module): M0 allocation
// stays flowing through contracts, never a concrete cross-module value import (Doc-4B §A7; Doc-4C §C5
// "allocate the ref via Module 0").

import type { AllocateHumanReference } from "@/modules/core/contracts";
import type { DbExecutor } from "@/shared/db";
import {
  createDelegationGrantCommand,
  type CreateDelegationGrantContext,
  type CreateDelegationGrantDeps,
} from "../application/commands/create-delegation-grant.command";
import {
  revokeDelegationGrantCommand,
  suspendDelegationGrantCommand,
  type DelegationGrantLifecycleContext,
  type DelegationGrantLifecycleDeps,
} from "../application/commands/suspend-revoke-delegation-grant.command";
import { reinstateDelegationGrantCommand } from "../application/commands/reinstate-delegation-grant.command";
import {
  expireDelegationGrantsCommand,
  type ExpireDelegationGrantsDeps,
} from "../application/commands/expire-delegation-grants.command";
import {
  expireInvitationsCommand,
  type ExpireInvitationsDeps,
} from "../application/commands/expire-invitations.command";
import {
  activateMembershipCommand,
  type ActivateMembershipDeps,
} from "../application/commands/activate-membership.command";
import { provisionIdentityForAuthUser } from "../application/commands/provision-identity.command";
import { getBuyerProfile as getBuyerProfileQuery } from "../application/queries/get-buyer-profile.query";
import {
  upsertBuyerProfileCommand,
  type UpsertBuyerProfileContext,
  type UpsertBuyerProfileDeps,
} from "../application/commands/upsert-buyer-profile.command";
import { getUser as getUserQuery } from "../application/queries/get-user.query";
import { getOrganization as getOrganizationQuery } from "../application/queries/get-organization.query";
import { getMembership as getMembershipQuery } from "../application/queries/get-membership.query";
import {
  checkPermission as checkPermissionQuery,
  type CheckPermissionDeps,
} from "../application/queries/check-permission.query";
import type {
  ActivateMembershipInput,
  ActivateMembershipResult,
  CheckPermissionInput,
  CheckPermissionResult,
  CreateDelegationGrantInput,
  CreateDelegationGrantOutcome,
  DelegationGrantLifecycleInput,
  DelegationGrantLifecycleOutcome,
  ExpireDelegationGrantsResult,
  ExpireInvitationsResult,
  GetBuyerProfileResult,
  GetMembershipResult,
  GetOrganizationResult,
  GetUserResult,
  ProvisionIdentityInput,
  ProvisionIdentityResult,
  ReinstateDelegationGrantInput,
  UpsertBuyerProfileInput,
  UpsertBuyerProfileOutcome,
} from "./types";

// Re-export the write-command's context/deps shapes on the contracts surface so the app-layer composition
// edge (`src/server/identity`) can build them via `@/modules/identity/contracts` (contracts-only).
export type { UpsertBuyerProfileContext, UpsertBuyerProfileDeps };

// Re-export the check_permission deps shape (the injectable ports — vendor-profile-state reader + clock)
// so the app-layer authz seam (`src/server/authz`) can supply them via `@/modules/identity/contracts`.
export type { CheckPermissionDeps };

/** Dependencies a caller injects into provisioning — the Module 0 contract service(s). */
export interface ProvisionIdentityDeps {
  /**
   * The Module 0 `core.allocate_human_reference.v1` contract service (Doc-4B §A7), injected by the
   * contract TYPE. Bound into the provisioning transaction so the `ORG-…` ref allocation is atomic
   * with the org create (Doc-4C §C5 — "no second ref on replay").
   */
  allocateHumanReference: AllocateHumanReference;
}

/**
 * `identity.provisionIdentity` — the cross-module callable that lazily provisions a first-login
 * identity (user + Personal Organization + Owner membership), atomically and idempotently. The
 * authoritative behavior (one transaction, idempotent on `auth_user_id`, full rollback, RLS
 * bootstrap context) lives in the private M1 command; this is its public, contracts-only entry point.
 */
export type ProvisionIdentity = (
  input: ProvisionIdentityInput,
  deps: ProvisionIdentityDeps,
) => Promise<ProvisionIdentityResult>;

/**
 * The concrete public provisioning service (M1 contracts facade → M1 application command).
 * Cross-module consumers call this via `@/modules/identity/contracts`.
 */
export const provisionIdentity: ProvisionIdentity = (input, deps) =>
  provisionIdentityForAuthUser(input, { allocateHumanReference: deps.allocateHumanReference });

/**
 * `identity.get_buyer_profile.v1` (Doc-5C §6.1 row 33; §6.3 non-disclosure) — the PUBLIC, contracts-only
 * face over the private M1 read query (WP-1.2). The owning/active-org buyer-profile singleton read; the
 * active org is RESOLVED + enforced upstream by the app-layer org-context guard which sets `app.active_org`
 * on the request transaction (Doc-6C §2.1 / Doc-5C §3.3 — client-supplied org id never trusted). RLS scopes
 * the read; NO organization id is taken as input. Cross-tenant / absent → `found: false` (Doc-5C §6.3 — the
 * wire `404` collapse, indistinguishable from genuine absence).
 *
 * The cross-module surface is the TYPE; the concrete callable below binds the same-module application query
 * (the canonical DDD contracts-facade pattern — `${from.module}`-scoped; no cross-module internal access).
 * Callers (the app-layer route) MUST invoke it with the transaction executor carrying the server-set
 * `app.active_org` GUC — i.e. INSIDE `withActiveOrgContext` (`src/server/context`).
 *
 * @param db the request-transaction executor carrying the server-set active-org GUC (Doc-6C §2.1).
 */
export type GetBuyerProfile = (db?: DbExecutor) => Promise<GetBuyerProfileResult>;

/** Concrete `identity.get_buyer_profile.v1` facade (M1 contracts → M1 application query). */
export const getBuyerProfile: GetBuyerProfile = (db) => getBuyerProfileQuery(db);

// The M1 WIRE FACE for the buyer-profile read (result → Doc-5A envelope + §6.2 status). M1 owns how
// its read becomes HTTP, so the mapper lives in M1's `api/`; this contracts re-export is the public,
// boundary-legal handle the app-layer route composition consumes via `@/modules/identity/contracts`
// (same-module contracts → own `api/`; `${from.module}`-scoped — no cross-module internal access).
export { mapGetBuyerProfile } from "../api/get-buyer-profile.handler";

/**
 * `identity.upsert_buyer_profile.v1` (Doc-4C §C10; D7) — the PUBLIC, contracts-only face over the private
 * M1 write command. Create-or-update the active-org buyer profile, appending the canonical audit action
 * (`buyer_profile_created` / `buyer_profile_updated` — Doc-2_Patch_v1.0.4 + Doc-4C realization patch)
 * ATOMICALLY with the write. The active org is RESOLVED + enforced upstream by the app-layer org-context
 * guard (RLS); the M0 `appendAuditRecord` is INJECTED by the contract TYPE (the boundary-legal mechanism).
 *
 * MUST be invoked INSIDE `withActiveOrgContext` — the `db` executor carries the server-set `app.active_org`
 * / `app.user_id` GUCs that BOTH the buyer_profiles RLS and the audit `WITH CHECK` read.
 */
export type UpsertBuyerProfile = (
  input: UpsertBuyerProfileInput,
  ctx: UpsertBuyerProfileContext,
  deps: UpsertBuyerProfileDeps,
  db?: DbExecutor,
) => Promise<UpsertBuyerProfileOutcome>;

/** Concrete `identity.upsert_buyer_profile.v1` facade (M1 contracts → M1 application command). */
export const upsertBuyerProfile: UpsertBuyerProfile = (input, ctx, deps, db) =>
  upsertBuyerProfileCommand(input, ctx, deps, db);

// The M1 WIRE FACE for the buyer-profile WRITE (outcome → Doc-5A envelope + §6.2 status). Same One-Owner
// placement as the read mapper — M1 owns how its write becomes HTTP.
export { mapUpsertBuyerProfile } from "../api/upsert-buyer-profile.handler";

// ─────────────────────────────────────────────────────────────────────────────
// §C3 — Shared Identity Services (OUT-OF-WIRE, internal-service). The four auth-root reads — the
// SINGLE authorization-resolution source (Doc-4C §C3). Doc-5C §7.1: these carry NO HTTP method/path;
// proposing a wire = an architecture change (§7.5). Every consuming module (and `src/server/authz`)
// consumes THESE, never `identity.*` tables directly and never a shadow authorization check (§B.11).
// All are reads: unaudited (§17.1), zero events. The `db` executor may carry the RLS-scoped active-org
// context (defense-in-depth); resolution correctness does not depend on RLS (each read is org-anchored).
// ─────────────────────────────────────────────────────────────────────────────

/** `identity.get_user.v1` (Doc-4C §C3) — canonical user read (personal-data minimized; never an
 *  auth-mechanism field, DC-4). Consumers MUST call this, never read `identity.users` directly. */
export type GetUser = (userId: string, db?: DbExecutor) => Promise<GetUserResult>;
export const getUser: GetUser = (userId, db) => getUserQuery(userId, db);

/** `identity.get_organization.v1` (Doc-4C §C3) — canonical org read. Consumers MUST call this, never
 *  read `identity.organizations` cross-module. */
export type GetOrganization = (
  organizationId: string,
  db?: DbExecutor,
) => Promise<GetOrganizationResult>;
export const getOrganization: GetOrganization = (organizationId, db) =>
  getOrganizationQuery(organizationId, db);

/** `identity.get_membership.v1` (Doc-4C §C3) — the (user × org) link + its `state` (the access-formula
 *  input, §6.1). Consumers read `state`, never re-derive the role→permission mapping (use `checkPermission`). */
export type GetMembership = (
  userId: string,
  organizationId: string,
  db?: DbExecutor,
) => Promise<GetMembershipResult>;
export const getMembership: GetMembership = (userId, organizationId, db) =>
  getMembershipQuery(userId, organizationId, db);

/**
 * `identity.check_permission.v1` (Doc-4C §C3) — THE platform authorization root. Implements (never
 * redefines) the Doc-4A §6.1 three-layer check + §6B.2 five-condition delegated-access check. This is
 * the SINGLE authorization-resolution source: every consuming module MUST call this (or the §C3 reads it
 * composes) and MUST NOT implement a parallel/shadow check. Slugs only (never a role or plan); no
 * plan/entitlement influences the decision (firewall). `organizationId` is the SERVER-VALIDATED active
 * org (never client-asserted). `deps.vendorProfileStateReader` (the M2 Vendor Service port) is required
 * to affirm §6B.2 condition 5 on a delegated path — absent ⇒ the delegated path fails closed.
 */
export type CheckPermission = (
  input: CheckPermissionInput,
  deps?: CheckPermissionDeps,
  db?: DbExecutor,
) => Promise<CheckPermissionResult>;
export const checkPermission: CheckPermission = (input, deps, db) =>
  checkPermissionQuery(input, deps, db);

// ─────────────────────────────────────────────────────────────────────────────
// §C9 — Delegation Grant write surface (W2-IDN-4). The controlling-org create/suspend/revoke commands +
// the scaffold reinstate + the out-of-wire System expiry sweep. Every mutation is an AUDITED, ATOMIC write
// (the D7 pattern): the M0 `appendAuditRecord` is INJECTED by contract TYPE; the audit is atomic with the
// write (same tx). The User commands MUST be invoked INSIDE `withActiveOrgContext` with the CONTROLLING org
// as the active org. Zero §8 events ([DC-1]). Re-export the command context/deps shapes so the app-layer
// composition edge builds them via `@/modules/identity/contracts` (contracts-only).
// ─────────────────────────────────────────────────────────────────────────────

export type {
  CreateDelegationGrantContext,
  CreateDelegationGrantDeps,
  DelegationGrantLifecycleContext,
  DelegationGrantLifecycleDeps,
  ExpireDelegationGrantsDeps,
};

/** `identity.create_delegation_grant.v1` (Doc-4C §C9) — issue a grant (controlling org → representative
 *  org over a controlled vendor profile). Audited (`delegation_grant_issued`) atomically with the insert. */
export type CreateDelegationGrant = (
  input: CreateDelegationGrantInput,
  ctx: CreateDelegationGrantContext,
  deps: CreateDelegationGrantDeps,
  db?: DbExecutor,
) => Promise<CreateDelegationGrantOutcome>;
export const createDelegationGrant: CreateDelegationGrant = (input, ctx, deps, db) =>
  createDelegationGrantCommand(input, ctx, deps, db);

/** `identity.suspend_delegation_grant.v1` (Doc-4C §C9) — `active → suspended`. Audited atomically. */
export type SuspendDelegationGrant = (
  input: DelegationGrantLifecycleInput,
  ctx: DelegationGrantLifecycleContext,
  deps: DelegationGrantLifecycleDeps,
  db?: DbExecutor,
) => Promise<DelegationGrantLifecycleOutcome>;
export const suspendDelegationGrant: SuspendDelegationGrant = (input, ctx, deps, db) =>
  suspendDelegationGrantCommand(input, ctx, deps, db);

/** `identity.revoke_delegation_grant.v1` (Doc-4C §C9) — `active|suspended → revoked` (terminal); fires the
 *  refresh-on-revocation seam after commit. Audited (`delegation_grant_revoked`) atomically. */
export type RevokeDelegationGrant = (
  input: DelegationGrantLifecycleInput,
  ctx: DelegationGrantLifecycleContext,
  deps: DelegationGrantLifecycleDeps,
  db?: DbExecutor,
) => Promise<DelegationGrantLifecycleOutcome>;
export const revokeDelegationGrant: RevokeDelegationGrant = (input, ctx, deps, db) =>
  revokeDelegationGrantCommand(input, ctx, deps, db);

/** `identity.reinstate_delegation_grant.v1` (Doc-4C §C9 #25) — SCAFFOLD; rejects with an
 *  `[ESC-IDN-DELEG-EXPIRY]`-citing internal error (`DelegationReinstateGatedError`). No write, no audit. */
export type ReinstateDelegationGrant = (input: ReinstateDelegationGrantInput) => Promise<never>;
export const reinstateDelegationGrant: ReinstateDelegationGrant = (input) =>
  reinstateDelegationGrantCommand(input);

export { DelegationReinstateGatedError } from "../application/commands/reinstate-delegation-grant.command";

/** `identity.expire_delegation_grant.v1` (Doc-4C §C9 · System) — the out-of-wire sweep expiring `active`
 *  grants whose `valid_to` has lapsed (`active → expired` ONLY). Audited per grant (System actor). */
export type ExpireDelegationGrants = (
  deps: ExpireDelegationGrantsDeps,
) => Promise<ExpireDelegationGrantsResult>;
export const expireDelegationGrants: ExpireDelegationGrants = (deps) =>
  expireDelegationGrantsCommand(deps);

// ─────────────────────────────────────────────────────────────────────────────
// §C4/§C5/§C6 — User · Organization · Membership lifecycle (W2-IDN-5). The two out-of-wire System timers +
// the pure lifecycle authority (state machines + guards) re-exported for the app-layer / W2-IDN-6.2 wired
// commands / other-module consumers. The machines/guards are PURE (own no state, read no DB, touch no
// governance signal) — Doc-4M's "single lookup surface" for lifecycle, boundary-legal on the contracts face.
// Every System-timer mutation is an AUDITED, ATOMIC write (D7): the M0 `appendAuditRecord` is INJECTED by
// contract TYPE; the audit is atomic with the state write (same tx). Zero §8 events ([DC-1]).
// ─────────────────────────────────────────────────────────────────────────────

export type { ExpireInvitationsDeps, ActivateMembershipDeps };

/** `identity.expire_invitation.v1` (Doc-4C §C6 · System) — the out-of-wire sweep expiring `invited`
 *  memberships whose invite window (`identity.membership_invite_expiry_window` POLICY) has lapsed
 *  (`invited → removed`). Audited per invitation (System actor). */
export type ExpireInvitations = (deps: ExpireInvitationsDeps) => Promise<ExpireInvitationsResult>;
export const expireInvitations: ExpireInvitations = (deps) => expireInvitationsCommand(deps);

/** `identity.activate_membership.v1` (Doc-4C §C6 · System) — the out-of-wire worker activating a `pending`
 *  membership on the DC-4 verification-complete signal (`pending → active`, idempotent). Audited (System). */
export type ActivateMembership = (
  input: ActivateMembershipInput,
  deps: ActivateMembershipDeps,
) => Promise<ActivateMembershipResult>;
export const activateMembership: ActivateMembership = (input, deps) =>
  activateMembershipCommand(input, deps);

// The pure lifecycle authority (state machines) — the SINGLE source of legal-edge truth (Doc-2 §5.1/§5.2 +
// Doc-4C §C4/§C5/§C6). Re-exported so the W2-IDN-6.2 wired commands + consuming callers consult the SAME matrix and
// never hand-roll a transition. Domain owns them; this is the boundary-legal public face.
export {
  canTransitionOrganization,
  assertOrganizationTransition,
  IllegalOrganizationTransitionError,
  TERMINAL_ORGANIZATION_STATUSES,
  type OrganizationStatus,
} from "../domain/state-machines/organization.state-machine";
export {
  canTransitionMembership,
  assertMembershipTransition,
  IllegalMembershipTransitionError,
  TERMINAL_MEMBERSHIP_STATES,
  type MembershipState,
} from "../domain/state-machines/membership.state-machine";
export {
  canTransitionUser,
  assertUserTransition,
  IllegalUserTransitionError,
  TERMINAL_USER_STATUSES,
  type UserStatus,
} from "../domain/state-machines/user.state-machine";

// The lifecycle GUARDS (pure policies) — the "only active participates" gate + Last-Owner-Protection /
// Ownership-Succession decisions. Re-exported for the W2-IDN-6.2 wired commands (the BUSINESS-stage guard).
export {
  membershipParticipatesInAccessFormula,
  organizationParticipatesInAccessFormula,
} from "../domain/policies/membership-participation.policy";
export {
  evaluateLastOwnerProtection,
  evaluateOwnershipSuccession,
  type LastOwnerProtectionFacts,
  type LastOwnerProtectionVerdict,
  type OwnershipSuccessionFacts,
  type OwnershipSuccessionVerdict,
} from "../domain/policies/last-owner-protection.policy";

// The repository fact-resolver for the Last-Owner guard (the SERVICE-LAYER guard's DB read). Re-exported so
// W2-IDN-6.2 commands resolve owner facts through the M1 contracts face and hand them to the pure policy.
// `UnresolvableOwnerRoleError` is the loud fail-closed signal when the seeded Owner role is missing — the
// guard's prerequisite is corrupt, so the resolver refuses rather than fabricating never-block facts.
//
// SERIALIZATION CONTRACT (RV-0150 T6-F1): the facts MUST be resolved AND the guarded write applied within ONE
// transaction. `resolveOwnerRemovalFacts` locks the org's active-Owner rows (`SELECT … FOR UPDATE`) so
// concurrent Owner-disabling mutations serialize (the second sees the first's committed write) — a
// check-then-act cannot race two removals to an ownerless org. `evaluateOwnershipSuccession`'s
// `resultingActiveOwnerCount` inherits the same class; a transfer MUST resolve it in that same locking tx.
export {
  resolveOwnerRemovalFacts,
  UnresolvableOwnerRoleError,
} from "../infrastructure/data/membership-lifecycle.repository";
