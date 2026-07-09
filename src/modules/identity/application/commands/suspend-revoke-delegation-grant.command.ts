// M1 application (PRIVATE) — the delegation-grant LIFECYCLE commands `identity.suspend_delegation_grant.v1`
// and `identity.revoke_delegation_grant.v1` (Doc-4C §C9). Both are controlling-org status transitions that
// share one shape (load → scope → concurrency → state → write → audit); the two differ only in the target
// status, the legal source states, the audit action, and whether the refresh-on-revocation seam fires.
//
// ORCHESTRATION ONLY (owns no state): the write + its audit share ONE tx (`db`, RLS-scoped by
// `withActiveOrgContext` with the CONTROLLING org as `app.active_org`) — the D7 audited-write pattern. The
// two invariants hold by construction (audit atomic with the write). Zero §8 events ([DC-1]).
//
// AUDIT ACTIONS (bound BY POINTER to Doc-2 §9 "Vendor profile"): suspend → "delegation grant suspend";
// revoke → "delegation grant revoke". STATE transitions bind Doc-2 §5.10 (`active → suspended`;
// `active|suspended → revoked`); the machine rejects any illegal edge → STATE `identity_delegation_state_invalid`.
//
// REFRESH-ON-REVOCATION (revoke only): on `→ revoked`, the injected `DelegationRefreshPort` is invoked
// AFTER commit (the M3 `rfq_invitation_grantees`/visibility teardown seam). The DEFAULT port is a genuine
// NO-OP — it calls no M3 and emits no event ([DC-1] / Doc-4C §C9 "do not synthesize an event or call M3");
// the real teardown lands via service/event when [DC-1] resolves. NEVER a cross-schema write from identity.

import { prisma, type DbExecutor } from "@/shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  findActiveMembership,
  resolveGrantedTenantSlugs,
} from "../../infrastructure/data/authz.repository";
import {
  findDelegationGrantById,
  transitionDelegationGrantStatus,
} from "../../infrastructure/data/delegation-grant.repository";
import {
  assertTransition,
  canTransition,
  type DelegationGrantStatus,
} from "../../domain/state-machines/delegation-grant.state-machine";
import {
  DELEGATION_GRANT_ENTITY_TYPE,
  DelegationGrantAuditAction,
  type DelegationGrantAuditActionToken,
} from "../../domain/audit-actions";
import type {
  DelegationGrantError,
  DelegationGrantLifecycleInput,
  DelegationGrantLifecycleOutcome,
  DelegationRefreshPort,
} from "../../contracts/types";

const CAN_MANAGE_DELEGATIONS = "can_manage_delegations" as const;

const CODE = {
  INVALID_INPUT: "identity_delegation_invalid_input",
  FORBIDDEN: "identity_delegation_forbidden",
  NOT_CONTROLLER: "identity_delegation_not_controller",
  NOT_FOUND: "identity_delegation_not_found",
  STATE_INVALID: "identity_delegation_state_invalid",
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Server-resolved request context (active org = the controlling org; Invariant #5). */
export interface DelegationGrantLifecycleContext {
  userId: string;
  activeOrgId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface DelegationGrantLifecycleDeps {
  appendAuditRecord: AppendAuditRecord;
  /** The refresh-on-revocation seam (revoke only). Omitted ⇒ the NO-OP default (honors [DC-1]). */
  refreshPort?: DelegationRefreshPort;
}

const err = (
  errorClass: DelegationGrantError["errorClass"],
  errorCode: string,
  message: string,
): DelegationGrantLifecycleOutcome => ({ ok: false, error: { errorClass, errorCode, message } });

/** The no-op default refresh port — calls no M3, emits no event ([DC-1]); the seam exists to be invoked. */
const NOOP_REFRESH: DelegationRefreshPort = async () => {};

interface TransitionSpec {
  /** The target status of this command (Doc-2 §5.10). */
  to: DelegationGrantStatus;
  /** The audit action bound by pointer to Doc-2 §9. */
  action: DelegationGrantAuditActionToken;
  /** Fire the refresh-on-revocation seam after commit? (revoke: yes; suspend: no). */
  refreshOnCommit: boolean;
}

/**
 * The shared controlling-org lifecycle transition. Loads the grant, enforces controlling-org authority +
 * optimistic concurrency, asserts the Doc-2 §5.10 edge, writes it, and appends the audit atomically. On a
 * `refreshOnCommit` spec, invokes the injected refresh port AFTER the audited write commits.
 */
async function transitionCommand(
  input: DelegationGrantLifecycleInput,
  ctx: DelegationGrantLifecycleContext,
  deps: DelegationGrantLifecycleDeps,
  spec: TransitionSpec,
  db: DbExecutor,
): Promise<DelegationGrantLifecycleOutcome> {
  // (1) SYNTAX.
  if (!UUID_RE.test(input.delegationGrantId)) {
    return err("VALIDATION", CODE.INVALID_INPUT, "delegation_grant_id must be a uuid.");
  }
  if (!(input.updatedAt instanceof Date)) {
    return err("VALIDATION", CODE.INVALID_INPUT, "updated_at is required.");
  }

  // (3) AUTHZ — `can_manage_delegations` in the controlling (active) org.
  const membership = await findActiveMembership(ctx.userId, ctx.activeOrgId, db);
  const actingUserSlugs =
    membership === null
      ? new Set<string>()
      : await resolveGrantedTenantSlugs(membership.roleId, ctx.activeOrgId, db);
  if (!actingUserSlugs.has(CAN_MANAGE_DELEGATIONS)) {
    return err("AUTHORIZATION", CODE.FORBIDDEN, "Not permitted to manage delegations.");
  }

  // Load the grant (dual-party read; RLS backstop). Not found ⇒ NOT_FOUND (non-disclosure collapse §7.5).
  const grant = await findDelegationGrantById(input.delegationGrantId, db);
  if (grant === null) {
    return err("NOT_FOUND", CODE.NOT_FOUND, "delegation grant not found.");
  }

  // (4) SCOPE — only the CONTROLLING org may manage (representative → deny). App-layer primary; RLS backstop.
  if (grant.controllingOrganizationId !== ctx.activeOrgId) {
    return err(
      "AUTHORIZATION",
      CODE.NOT_CONTROLLER,
      "only the controlling org may manage this grant.",
    );
  }

  // (5) Optimistic concurrency — the caller's `updated_at` must match the live row (else stale view).
  if (grant.updatedAt.getTime() !== input.updatedAt.getTime()) {
    return err(
      "VALIDATION",
      CODE.INVALID_INPUT,
      "the grant was modified concurrently; reload and retry.",
    );
  }

  // (6) STATE — reject an illegal Doc-2 §5.10 edge with a clean STATE error (before touching the DB write).
  if (!canTransition(grant.status, spec.to)) {
    return err("STATE", CODE.STATE_INVALID, `illegal transition ${grant.status} → ${spec.to}.`);
  }
  assertTransition(grant.status, spec.to); // defensive — the machine is the single authority.

  // (7) WRITE — compare-and-set on the source status. A lost race (0 rows) ⇒ STATE (already transitioned).
  const write = await transitionDelegationGrantStatus(
    { id: grant.id, from: grant.status, to: spec.to, actorUserId: ctx.userId },
    db,
  );
  if (write === null) {
    return err(
      "STATE",
      CODE.STATE_INVALID,
      "the grant was already transitioned; reload and retry.",
    );
  }

  // (8) AUDIT — atomic with the write (SAME tx `db`), via the M0 facade ONLY. A throw rolls the write back.
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: DELEGATION_GRANT_ENTITY_TYPE,
      entityId: grant.id,
      action: spec.action,
      oldValue: write.oldValue,
      newValue: write.newValue,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: { delegationGrantId: grant.id, status: spec.to, updatedAt: write.updatedAt },
  };
}

/** `identity.suspend_delegation_grant.v1` (Doc-4C §C9) — `active → suspended`. Must run INSIDE
 *  `withActiveOrgContext` with the controlling org as `app.active_org`. */
export async function suspendDelegationGrantCommand(
  input: DelegationGrantLifecycleInput,
  ctx: DelegationGrantLifecycleContext,
  deps: DelegationGrantLifecycleDeps,
  db: DbExecutor = prisma,
): Promise<DelegationGrantLifecycleOutcome> {
  return transitionCommand(
    input,
    ctx,
    deps,
    { to: "suspended", action: DelegationGrantAuditAction.SUSPENDED, refreshOnCommit: false },
    db,
  );
}

/** `identity.revoke_delegation_grant.v1` (Doc-4C §C9) — `active|suspended → revoked` (terminal). Fires the
 *  refresh-on-revocation seam after commit. Must run INSIDE `withActiveOrgContext` (controlling org). */
export async function revokeDelegationGrantCommand(
  input: DelegationGrantLifecycleInput,
  ctx: DelegationGrantLifecycleContext,
  deps: DelegationGrantLifecycleDeps,
  db: DbExecutor = prisma,
): Promise<DelegationGrantLifecycleOutcome> {
  const outcome = await transitionCommand(
    input,
    ctx,
    deps,
    { to: "revoked", action: DelegationGrantAuditAction.REVOKED, refreshOnCommit: true },
    db,
  );

  // Refresh-on-revocation seam — invoked AFTER the audited write. The default is a no-op ([DC-1]); the real
  // M3 teardown lands via service/event when [DC-1] resolves. Needs the grant's rep-org + profile: re-read
  // (post-transition, still resolvable) to pass the seam its inputs.
  if (outcome.ok) {
    const refresh = deps.refreshPort ?? NOOP_REFRESH;
    const grant = await findDelegationGrantById(input.delegationGrantId, db);
    if (grant !== null) {
      await refresh({
        delegationGrantId: grant.id,
        vendorProfileId: grant.vendorProfileId,
        representativeOrganizationId: grant.representativeOrganizationId,
      });
    }
  }

  return outcome;
}
