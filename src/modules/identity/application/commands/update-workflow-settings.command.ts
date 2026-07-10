// M1 application (PRIVATE) — `identity.update_workflow_settings.v1` (Doc-4C §C11 PassB:714–726;
// Doc-5C §6.1 row 34: `PATCH /identity/organization_workflow_settings` · 200). W2-IDN-6.8. The FINAL
// wired §C-sub-domain before the M1 conformance gate.
//
// ORCHESTRATION ONLY (owns no state): SYNTAX → AUTHZ → BUSINESS(§6.2) → WRITE(CAS) → AUDIT, all on the
// SAME caller-supplied RLS-scoped transaction executor. The command is the single place that knows BOTH
// the workflow_settings write AND the audit obligation — wiring them atomically (D7) — but knows neither
// the SQL (the repository owns it) NOR the audit MECHANISM (the M0 `core.append_audit_record.v1` facade
// owns it). MUST be invoked INSIDE `withActiveOrgContext` (the RLS-scoped executor).
//
// FROZEN VALIDATION MATRIX (§C11 PassB:720): SYNTAX (enums; jsonb shapes — the policy module) → CONTEXT
// (active-org — the composition) → AUTHZ (`can_manage_workflow_settings`, Doc-2 §7 O,D — via the wired
// `check_permission` root; Delegation NOT eligible, §C11 PassB:716) → SCOPE (the caller's active org IS
// the target singleton — Invariant #5; no path {id}) → BUSINESS (§6.2 FIXED-authz floor — the policy
// module) → POLICY (field-value bounds are resolved via `core.config_value_query.v1` WHERE Doc-3 §12.3
// defines — and §12.3 defines NONE for these fields; NONE is coined here, Doc-4A §18.2/§18.4 "most" —
// the command's real config read is the [DC-5] dedup window at the composition edge).
//
// AUDIT (§C11 PassB:724): the ENUMERATED Doc-2 §9 "Organization" action "workflow settings change"
// (Doc-2 line 686) — `workflow_settings_changed`, the M1 constant (`domain/audit-actions.ts`); NOT
// `[ESC-IDN-AUDIT]` (the action is enumerated; Appendix A carries only `DC-5`). Never a hardcoded literal.
//
// FIREWALL (Golden Rule 3 / Invariant #6 / §B.7 default `none` / §C12.6): this write touches ONLY
// `organization_workflow_settings` (+ the atomic `core.audit_records` row + the composition's
// `identity.command_dedup` idempotency row). It writes NO governance signal — no Trust Score, no
// Performance Score, no Financial Tier, no Capacity Profile, no Buyer-Vendor-Status (those are
// M5/M2/M4-owned, auto-calculated under System). Workflow settings are org-operational config (the ORG
// leg of FIXED/POLICY/ORG — Doc-4A §18.4 / Doc-3 §12.3), NOT a signal. Proven signal-free by the 8E
// discriminating test (the write's column set is closed to the four §C11 fields; a signal-shaped input
// reaches no column and no audit key). This comment is TRUE and TESTED (no false invariant).
//
// Events: none (§8) — `[DC-1]` (Module 1 produces no domain events; §C12.4).

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { buildUserAuditInput } from "./_audit";
import { prisma, type DbExecutor } from "../../../../shared/db";
import { updateActiveOrgWorkflowSettingsFields } from "../../infrastructure/data/workflow-settings.repository";
import {
  WORKFLOW_SETTINGS_ENTITY_TYPE,
  WorkflowSettingsAuditAction,
} from "../../domain/audit-actions";
import {
  isWorkflowSettingsAuthzFloorConformant,
  validateWorkflowSettingsSyntax,
} from "../../domain/policies/workflow-settings.policy";
import { checkPermission } from "../queries/check-permission.query";
import type {
  CheckPermissionInput,
  CheckPermissionResult,
  UpdateWorkflowSettingsInput,
  UpdateWorkflowSettingsOutcome,
} from "../../contracts/types";

/** The Doc-2 §7 slug the §C11 update binds (Doc-4C §C11 PassB:716: "Slug `can_manage_workflow_settings`
 *  (Doc-2 §7, O,D)"; Doc-2 line 633 "Workflow settings | `can_manage_workflow_settings` (O,D)"). A
 *  CATALOG token by pointer — never invented. */
export const MANAGE_WORKFLOW_SETTINGS_SLUG = "can_manage_workflow_settings" as const;

// Doc-4C §C11 error register (PassB:721 — frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_workflow_invalid_input";
const FORBIDDEN_CODE = "identity_workflow_forbidden";
const NOT_FOUND_CODE = "identity_workflow_not_found";
const POLICY_VIOLATION_CODE = "identity_workflow_policy_violation";
const CONFLICT_CODE = "identity_workflow_conflict";

/** The server-resolved request context (from the composition edge — never client input). */
export interface UpdateWorkflowSettingsContext {
  /** The acting `identity.users` id (Invariant #5 — users act). */
  userId: string;
  /** The SERVER-RESOLVED active org (the tenant anchor — organizations own; never client input). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected services (D7 rule 4). `authorize` is injectable for tests; the production default is the
 *  M1 `check_permission` root itself (never a shadow check — §B.11). */
export interface UpdateWorkflowSettingsDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. The ONLY audit surface. */
  appendAuditRecord: AppendAuditRecord;
  /** The authorization root (defaults to `identity.check_permission` — the single decider). */
  authorize?: (input: CheckPermissionInput, db?: DbExecutor) => Promise<CheckPermissionResult>;
}

/**
 * Update the active-org workflow settings (Doc-4C §C11). A partial write under an `updated_at` CAS (the
 * §C11 `optimistic on updated_at` token — NOT create-class; the row must pre-exist, absent →
 * `identity_workflow_not_found`, Doc-5C §6.2). The write + its ENUMERATED §9 audit row share ONE
 * transaction (D7). Writes no governance signal (the firewall — see header).
 */
export async function updateWorkflowSettingsCommand(
  input: UpdateWorkflowSettingsInput,
  ctx: UpdateWorkflowSettingsContext,
  deps: UpdateWorkflowSettingsDeps,
  db: DbExecutor = prisma,
): Promise<UpdateWorkflowSettingsOutcome> {
  // (1) SYNTAX (§C11 "enums; jsonb shapes") + deferred fail-close + empty-patch guard (the policy
  //     module — the single validation surface). The required If-Match token is checked here too.
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return err("VALIDATION", INVALID_INPUT_CODE, "updated_at is required (If-Match).");
  }
  const syntax = validateWorkflowSettingsSyntax({
    rfqApprovalMode: input.rfqApprovalMode,
    approvalChain: input.approvalChain,
    financialPermissions: input.financialPermissions,
    notificationRules: input.notificationRules,
    ...(input.deferredFields?.defaultRoutingModeSupplied !== undefined
      ? { defaultRoutingModeSupplied: input.deferredFields.defaultRoutingModeSupplied }
      : {}),
    ...(input.deferredFields?.buyerCourtesyOptionsSupplied !== undefined
      ? { buyerCourtesyOptionsSupplied: input.deferredFields.buyerCourtesyOptionsSupplied }
      : {}),
  });
  if (!syntax.ok) {
    return err("VALIDATION", INVALID_INPUT_CODE, syntax.message);
  }

  // (2) AUTHZ — `can_manage_workflow_settings` via the wired authorization root (§11.2 category 3
  //     precedes SCOPE/semantics). Delegation NOT eligible (§C11 PassB:716) — only the `membership`
  //     granting path is accepted; a delegation-satisfied allow is rejected fail-closed (the
  //     invite_member precedent).
  const authorize =
    deps.authorize ??
    ((i: CheckPermissionInput, d?: DbExecutor) => checkPermission(i, undefined, d));
  const decision = await authorize(
    {
      userId: ctx.userId,
      organizationId: ctx.activeOrgId,
      permissionSlug: MANAGE_WORKFLOW_SETTINGS_SLUG,
    },
    db,
  );
  if (decision.decision !== "allow" || decision.satisfiedBy !== "membership") {
    return err("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to manage workflow settings.");
  }

  // (3) BUSINESS — §6.2 FIXED-authz floor (the policy module): a workflow setting may ADD required
  //     approvals but NEVER remove a required slug (Doc-4A §6.2). Enforced upstream of the write
  //     (Doc-5C §6.3: BUSINESS → 422). With the realized additive-only field model no well-formed
  //     patch weakens FIXED authz, so this holds — the reserved guard (see the policy header).
  if (!isWorkflowSettingsAuthzFloorConformant(syntax.patch)) {
    return err(
      "BUSINESS",
      POLICY_VIOLATION_CODE,
      "A workflow setting may add required approvals but never remove a required slug.",
    );
  }

  // (4) WRITE — CAS on `updated_at` (the §C11 optimistic token). Absent live row → NOT_FOUND (not
  //     create-class — Doc-5C §6.2). Stale → CONFLICT + the §9.5 current token. Column set closed to
  //     the four §C11 fields (the firewall — no governance signal, see header).
  const write = await updateActiveOrgWorkflowSettingsFields(
    {
      activeOrgId: ctx.activeOrgId,
      actorUserId: ctx.userId,
      expectedUpdatedAt: input.updatedAt,
      patch: syntax.patch,
    },
    db,
  );
  if (write.outcome === "not_found") {
    return err("NOT_FOUND", NOT_FOUND_CODE, "Not found.");
  }
  if (write.outcome === "conflict") {
    return {
      ok: false,
      error: {
        errorClass: "CONFLICT",
        errorCode: CONFLICT_CODE,
        message: "The workflow settings were modified concurrently; reload and retry.",
        ...(write.currentUpdatedAt !== undefined
          ? { currentUpdatedAt: write.currentUpdatedAt }
          : {}),
      },
    };
  }

  // (5) AUDIT — the ENUMERATED §9 "workflow settings change" action, atomic (same tx; D7). Payload =
  //     the four workflow field sets ONLY (old/new) — no governance-signal key can appear (the write's
  //     field set is closed; the firewall). If this throws, the whole tx (incl. the write) rolls back.
  await deps.appendAuditRecord(
    buildUserAuditInput(ctx, {
      organizationId: ctx.activeOrgId,
      entityType: WORKFLOW_SETTINGS_ENTITY_TYPE,
      entityId: ctx.activeOrgId, // the active-org singleton (one settings row per org — Doc-6C §3.7).
      action: WorkflowSettingsAuditAction.CHANGED,
      oldValue: write.oldValue,
      newValue: write.newValue,
    }),
    db,
  );

  return {
    ok: true,
    result: { organizationId: ctx.activeOrgId, updatedAt: write.updatedAt },
  };
}

function err(
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "BUSINESS",
  errorCode: string,
  message: string,
): UpdateWorkflowSettingsOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
