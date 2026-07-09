// M1 application (PRIVATE) — `identity.reinstate_delegation_grant.v1` (Doc-4C §C9, contract #25).
//
// REAL COMMAND (W2-IDN-6.5) — the former `[ESC-IDN-DELEG-EXPIRY]` scaffold is REPLACED per the owner
// ruling 2026-07-09 (`BOARD-DECISION-IDN-DELEG-EXPIRY_v1.0` instrument (c) → `Doc-2_Patch_v1.0.7`):
// contract #25 is UN-GATED. The patched §5.10 boundary (freeze-level; the patch governs):
//   • rule 3 — reinstatement is valid ONLY for a currently `suspended`, NON-expired grant (the
//     validity window still open at reinstate time). `reinstate_delegation_grant` MUST NOT revive an
//     expired grant.
//   • rule 2/4 — `expired` (like `revoked`) is TERMINAL for the grant instance; any future delegation
//     requires a NEW grant (new UUID, fresh independent audit trail). No resurrection.
//
// ERROR SURFACE stays inside the frozen §C9 register (Board instrument (c) verbatim: "error surface
// stays inside the frozen §C9 registers" — PassB:608): a lapsed-window reinstatement rejects with
// `identity_delegation_state_invalid` (STATE → 409). Judgment call (report §8): the frozen reinstate
// matrix stages the boundary at BUSINESS, but the frozen register authors NO BUSINESS-class code and
// the patch makes the lapsed grant terminal-with-respect-to-reinstatement — the STATE register row is
// the only in-register realization and the semantically faithful one (the instance is expired-pending-
// sweep; the operation is illegal from its current temporal state). Nothing is coined.
//
// ORCHESTRATION ONLY (owns no state); the D7 audited-write shape shared with suspend/revoke: SYNTAX →
// AUTHZ (`can_manage_delegations`) → SCOPE (party-load, §7.5 collapse) → DELEGATION (controller-only)
// → token match → STATE (`suspended → active`, machine-asserted) → BUSINESS (window open — patch rule
// 3) → CAS write → audit, ALL on the caller-supplied RLS-scoped executor. Zero §8 events ([DC-1]).
//
// AUDIT: `delegation_grant_reinstated` — bound BY POINTER per the frozen §C9 reinstate Audit
// declaration ("Domain Vendor profile (delegation suspend/reinstate pair) by pointer — reinstate
// covered-by-suspend (Patch v1.0.1 PA-02)"): the Doc-2 §9 "delegation grant suspend" family covers the
// pair; the distinct token records what actually happened (the suspend/REINSTATED token precedent).

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
} from "../../domain/state-machines/delegation-grant.state-machine";
import {
  DELEGATION_GRANT_ENTITY_TYPE,
  DelegationGrantAuditAction,
} from "../../domain/audit-actions";
import type {
  DelegationGrantError,
  DelegationGrantLifecycleOutcome,
  ReinstateDelegationGrantInput,
} from "../../contracts/types";

const CAN_MANAGE_DELEGATIONS = "can_manage_delegations" as const;

// Doc-4C §C9 reinstate error register (PassB:608) — EXACTLY these four codes; the lapsed-window
// disposition (formerly carried) is realized on the STATE row per the Board instrument (see header).
const CODE = {
  INVALID_INPUT: "identity_delegation_invalid_input",
  FORBIDDEN: "identity_delegation_forbidden",
  NOT_FOUND: "identity_delegation_not_found",
  STATE_INVALID: "identity_delegation_state_invalid",
} as const;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Server-resolved request context (active org = the controlling org; Invariant #5). */
export interface ReinstateDelegationGrantContext {
  userId: string;
  activeOrgId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ReinstateDelegationGrantDeps {
  appendAuditRecord: AppendAuditRecord;
  /** Injectable clock for the patch-rule-3 window-open check (deterministic tests). Default `new Date()`. */
  now?: () => Date;
}

const err = (
  errorClass: DelegationGrantError["errorClass"],
  errorCode: string,
  message: string,
  currentUpdatedAt?: Date,
): DelegationGrantLifecycleOutcome => ({
  ok: false,
  error: {
    errorClass,
    errorCode,
    message,
    ...(currentUpdatedAt !== undefined ? { currentUpdatedAt } : {}),
  },
});

/**
 * `identity.reinstate_delegation_grant.v1` (Doc-4C §C9 #25; boundary per `Doc-2_Patch_v1.0.7`) —
 * `suspended → active`, valid ONLY while the validity window is open. Must run INSIDE
 * `withActiveOrgContext` with the CONTROLLING org as `app.active_org` (the audit is atomic with the
 * write on the same executor — the D7 pattern).
 */
export async function reinstateDelegationGrantCommand(
  input: ReinstateDelegationGrantInput,
  ctx: ReinstateDelegationGrantContext,
  deps: ReinstateDelegationGrantDeps,
  db: DbExecutor = prisma,
): Promise<DelegationGrantLifecycleOutcome> {
  // (1) SYNTAX.
  if (!UUID_RE.test(input.delegationGrantId)) {
    return err("VALIDATION", CODE.INVALID_INPUT, "delegation_grant_id must be a uuid.");
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return err("VALIDATION", CODE.INVALID_INPUT, "updated_at is required.");
  }

  // (3) AUTHZ — `can_manage_delegations` in the controlling (active) org (the suspend/revoke shape).
  const membership = await findActiveMembership(ctx.userId, ctx.activeOrgId, db);
  const actingUserSlugs =
    membership === null
      ? new Set<string>()
      : await resolveGrantedTenantSlugs(membership.roleId, ctx.activeOrgId, db);
  if (!actingUserSlugs.has(CAN_MANAGE_DELEGATIONS)) {
    return err("AUTHORIZATION", CODE.FORBIDDEN, "Not permitted to manage delegations.");
  }

  // (4) SCOPE — PARTY-SCOPED load; a non-party caller collapses to NOT_FOUND (§7.5 — byte-
  //     indistinguishable from a nonexistent grant; the RV-0149 F2 discrimination).
  const grant = await findDelegationGrantById(input.delegationGrantId, ctx.activeOrgId, db);
  if (grant === null) {
    return err("NOT_FOUND", CODE.NOT_FOUND, "delegation grant not found.");
  }

  // (5) DELEGATION — only the CONTROLLING org may manage (§6B controller check; dual-party reads,
  //     controller-only writes).
  if (grant.controllingOrganizationId !== ctx.activeOrgId) {
    return err("AUTHORIZATION", CODE.FORBIDDEN, "only the controlling org may manage this grant.");
  }

  // (6) Optimistic view check — the caller's `updated_at` must match the live row (stale view →
  //     the IDN-4-ratified in-register VALIDATION; §C9 declares no CONFLICT code — see the wire WP
  //     judgment log).
  if (grant.updatedAt.getTime() !== input.updatedAt.getTime()) {
    return err(
      "VALIDATION",
      CODE.INVALID_INPUT,
      "the grant was modified concurrently; reload and retry.",
    );
  }

  // (7) STATE — the machine edge `suspended → active` (Doc-2 §5.10 v1.0.7). Any other source state
  //     (incl. terminal `expired`/`revoked` — patch rules 2/4: no resurrection) rejects with STATE.
  if (!canTransition(grant.status, "active") || grant.status !== "suspended") {
    return err("STATE", CODE.STATE_INVALID, `illegal transition ${grant.status} → active.`);
  }

  // (8) BUSINESS — patch rule 3: reinstatement is valid ONLY while the validity window is open at
  //     reinstate time. A `suspended` grant whose `valid_to` has lapsed is expired-pending-sweep —
  //     it MUST NOT be revived (the in-register STATE realization; Board instrument (c)). An
  //     open-ended grant (`valid_to IS NULL`) never lapses.
  const now = deps.now?.() ?? new Date();
  if (grant.fieldSet.validTo !== null && grant.fieldSet.validTo.getTime() <= now.getTime()) {
    return err(
      "STATE",
      CODE.STATE_INVALID,
      "the grant's validity window has lapsed; reinstatement requires a new delegation grant.",
    );
  }

  assertTransition("suspended", "active"); // defensive — the machine is the single authority.

  // (9) WRITE — compare-and-set on `suspended`. A lost race (0 rows) ⇒ a LOSING WRITE: STATE with
  //     the CURRENT token attached so the wire carries the §9.5 `ETag` (call-13 discipline —
  //     losing-write legs carry the token; machine-illegal edges above do NOT).
  const write = await transitionDelegationGrantStatus(
    { id: grant.id, from: "suspended", to: "active", actorUserId: ctx.userId },
    db,
  );
  if (write === null) {
    const current = await findDelegationGrantById(input.delegationGrantId, ctx.activeOrgId, db);
    return err(
      "STATE",
      CODE.STATE_INVALID,
      "the grant was already transitioned; reload and retry.",
      current?.updatedAt,
    );
  }

  // (10) AUDIT — atomic with the write (SAME executor), via the M0 facade ONLY (a throw rolls the
  //      write back — D7 invariant 1). `delegation_grant_reinstated`, bound by pointer (header).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: DELEGATION_GRANT_ENTITY_TYPE,
      entityId: grant.id,
      action: DelegationGrantAuditAction.REINSTATED,
      oldValue: write.oldValue,
      newValue: write.newValue,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: { delegationGrantId: grant.id, status: "active", updatedAt: write.updatedAt },
  };
}
