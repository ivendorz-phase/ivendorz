// M1 domain (PRIVATE) — the PURE policy for `identity.update_workflow_settings.v1` (Doc-4C §C11).
// Owns NO state, reads NO DB, touches NO governance signal — the Doc-4M "single lookup surface"
// idiom for the §C11 validation matrix (PassB:720). W2-IDN-6.8.
//
// FROZEN VALIDATION MATRIX (§C11 PassB:720, verbatim):
//   SYNTAX (enums; jsonb shapes) → CONTEXT (active-org) → AUTHZ (`can_manage_workflow_settings`) →
//   SCOPE (caller's org) → BUSINESS (ORG values within POLICY bounds, §18.4/§12.3; an approval
//   setting may ADD required approvals but NEVER remove a required slug, §6.2) → POLICY (bounds
//   resolved via Doc-4B `core.config_value_query.v1` where Doc-3 §12.3 defines).
//
// This module owns the SYNTAX + BUSINESS legs (the pure ones). CONTEXT/AUTHZ/SCOPE are the
// command's composition/authz legs; the [DC-5] idempotency-window POLICY read is the composition's
// `core.config_value_query.v1` consumption (never a literal).
//
// POLICY-BOUNDED FIELD VALIDATION — the frozen-derived reality (report §8 + citations):
//   §C11's BUSINESS/POLICY legs resolve field-value bounds "via `core.config_value_query.v1` WHERE
//   Doc-3 §12.3 defines" (PassB:720). Doc-3 §12.3 (verbatim) enumerates the ORG-setting CATEGORIES —
//   "RFQ approval mode and chain; financial/award approval thresholds; notification rules; default
//   routing mode; buyer-courtesy options" — but defines NO POLICY-key ceiling/floor for any writable
//   field, and NO §12.2 key bounds them (the registered `identity.*` block is 7 idempotency/timer
//   windows — Doc-3 v1.9 — none a field bound). Doc-4A §18.4: a contract declares "whether the
//   setting is bounded by a POLICY key (MOST ORG settings have POLICY-defined ceiling/floor)" — "most",
//   not all: an ORG setting with NO POLICY bound is conformant. So there is NO field-value POLICY bound
//   to resolve for these fields, and NONE is coined here (Doc-4A §18.2 escalate-never-invent; the
//   command's real `core.config_value_query.v1` consumption is the [DC-5] dedup window). The BUSINESS
//   leg that IS grounded is the §6.2 FIXED-authz floor (below).
//
// §6.2 FIXED-authz floor (Doc-4A §6.2 Pass2:175, verbatim: "A workflow setting may add required
// approvals; it may never remove a required slug"): the realized writable fields are ADDITIVE-config
// by construction — none can express a slug-removal (there is no "bypass slug X" field; `approval_chain`
// only ADDS approval steps, `rfq_approval_mode='none'` is the DB DEFAULT and means "no mandatory extra
// step", NOT a removal of the FIXED `can_approve_rfq` check M3 still enforces). So no well-formed input
// weakens FIXED authz — the invariant holds by construction; `identity_workflow_policy_violation` is the
// reserved BUSINESS guard (currently unreachable-by-construction — the `identity_org_*` QUOTA-unreachable
// precedent; a future richer approval_chain schema would make it live). Enforced upstream of the write
// (Doc-5C §6.3: "BUSINESS → 422 if violated").

/** The frozen `rfq_approval_mode` enum (Doc-6C §3.7 `identity.rfq_approval_mode`; §C11 PassB:718). */
export const RFQ_APPROVAL_MODES = ["none", "single", "multi_step"] as const;
export type RfqApprovalModeValue = (typeof RFQ_APPROVAL_MODES)[number];

/**
 * The FIVE platform-wide governance signals (CLAUDE.md §4 / Invariant #6). Named here ONLY as the
 * firewall allow-list's negative set: `update_workflow_settings` writes NONE of them (§B.7 default
 * `none`; §C12.6). Workflow settings are org-operational config (the ORG leg of FIXED/POLICY/ORG —
 * Doc-4A §18.4 / Doc-3 §12.3), NOT a signal. Used by the firewall assertion (below) + the 8E
 * discriminating test to prove — never merely assert — that no signal name reaches the write. The
 * signals are OWNED by M5 (Trust/Performance/Financial-Tier)/M2 (Capacity)/M4 (Buyer-Vendor-Status)
 * and auto-calculated under System; Identity never writes them.
 */
export const GOVERNANCE_SIGNAL_KEYS: readonly string[] = [
  "trust_score",
  "performance_score",
  "financial_tier",
  "capacity_profile",
  "buyer_vendor_status",
] as const;

/** The realizable §C11 writable fields (a Doc-6C §3.7 column exists). The command persists ONLY these
 *  (+ the server-populated `updated_by`) — the firewall's structural guarantee: the write's column set
 *  is closed to these four, none a governance signal. */
export const WORKFLOW_SETTINGS_WRITABLE_FIELDS = [
  "rfq_approval_mode",
  "approval_chain",
  "financial_permissions",
  "notification_rules",
] as const;

/** True iff `value` is a plain JSON object (not an array, not null) — the `financial_permissions` /
 *  `notification_rules` jsonb-shape SYNTAX check (§C11 "jsonb shapes"). */
export function isJsonObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The parsed, SYNTAX-valid patch the command applies. An absent key = "leave unchanged" (Doc-4A §9.2
 *  update semantics); a `null` for a jsonb key = an explicit clear (Prisma JSON null). */
export interface WorkflowSettingsPatch {
  rfqApprovalMode?: RfqApprovalModeValue;
  approvalChain?: unknown;
  financialPermissions?: unknown;
  notificationRules?: unknown;
}

/** SYNTAX validation result: either a typed patch, or a failure message (mapped to VALIDATION 400). */
export type WorkflowSettingsSyntaxResult =
  | { ok: true; patch: WorkflowSettingsPatch }
  | { ok: false; message: string };

/**
 * The raw (already casing-mapped) update input the command validates. The four realizable fields are
 * optional; `default_routing_mode` / `buyer_courtesy_options` presence is carried as fail-closed flags
 * (no Doc-6C §3.7 column — the deferred-field posture); `updatedAt` is the REQUIRED If-Match CAS token.
 */
export interface WorkflowSettingsUpdateFields {
  rfqApprovalMode?: unknown;
  approvalChain?: unknown;
  financialPermissions?: unknown;
  notificationRules?: unknown;
  /** Presence-only flags for the two DEFERRED §C11 fields (no realized column → fail closed). */
  defaultRoutingModeSupplied?: boolean;
  buyerCourtesyOptionsSupplied?: boolean;
}

/**
 * The frozen §C11 SYNTAX leg (enums; jsonb shapes) + the deferred-field fail-close + the empty-patch
 * guard. Returns the typed patch of ONLY the realizable fields, or a VALIDATION message. Pure.
 */
export function validateWorkflowSettingsSyntax(
  input: WorkflowSettingsUpdateFields,
): WorkflowSettingsSyntaxResult {
  // Deferred fields FAIL CLOSED — no Doc-6C §3.7 column (see header). A supplied value is rejected
  // (escalate-never-widen; silently dropping a client's data would fabricate success — the
  // update_organization_profile deferred-field precedent). Adding a column needs a migration this WP
  // must not author.
  if (input.defaultRoutingModeSupplied === true || input.buyerCourtesyOptionsSupplied === true) {
    return {
      ok: false,
      message:
        "default_routing_mode and buyer_courtesy_options are not realizable yet (no frozen " +
        "organization_workflow_settings column — deferred; see the W2-IDN-6.8 report carry). " +
        "Remove them and retry.",
    };
  }

  const patch: WorkflowSettingsPatch = {};

  // `rfq_approval_mode` — enum SYNTAX (§C11 "enums"). Absent = unchanged.
  if (input.rfqApprovalMode !== undefined) {
    if (
      typeof input.rfqApprovalMode !== "string" ||
      !RFQ_APPROVAL_MODES.includes(input.rfqApprovalMode as RfqApprovalModeValue)
    ) {
      return {
        ok: false,
        message: `rfq_approval_mode must be one of: ${RFQ_APPROVAL_MODES.join(", ")}.`,
      };
    }
    patch.rfqApprovalMode = input.rfqApprovalMode as RfqApprovalModeValue;
  }

  // `approval_chain` — jsonb shape SYNTAX: a list<object> (§C11 `approval_chain : list<object>`).
  // `null` = explicit clear; absent = unchanged. A non-array/non-null value is rejected.
  if (input.approvalChain !== undefined) {
    if (input.approvalChain !== null && !Array.isArray(input.approvalChain)) {
      return { ok: false, message: "approval_chain must be an array (list of approval steps)." };
    }
    patch.approvalChain = input.approvalChain;
  }

  // `financial_permissions` — jsonb object SYNTAX (§C11 `object (thresholds)`).
  if (input.financialPermissions !== undefined) {
    if (input.financialPermissions !== null && !isJsonObject(input.financialPermissions)) {
      return { ok: false, message: "financial_permissions must be an object." };
    }
    patch.financialPermissions = input.financialPermissions;
  }

  // `notification_rules` — jsonb object SYNTAX (§C11 `object`).
  if (input.notificationRules !== undefined) {
    if (input.notificationRules !== null && !isJsonObject(input.notificationRules)) {
      return { ok: false, message: "notification_rules must be an object." };
    }
    patch.notificationRules = input.notificationRules;
  }

  // Empty patch — no realizable field supplied. An empty PATCH writes nothing (Doc-4A §9.2 absence
  // semantics give it no meaning); reject rather than fabricate a token-only touch (the
  // update_organization_profile empty-patch precedent).
  if (
    patch.rfqApprovalMode === undefined &&
    patch.approvalChain === undefined &&
    patch.financialPermissions === undefined &&
    patch.notificationRules === undefined
  ) {
    return {
      ok: false,
      message:
        "At least one updatable field (rfq_approval_mode, approval_chain, financial_permissions, " +
        "notification_rules) is required.",
    };
  }

  return { ok: true, patch };
}

/**
 * The §6.2 FIXED-authz-floor BUSINESS check (Doc-4A §6.2; §C11 BUSINESS leg). Returns `true` when the
 * patch is §6.2-conformant. With the realized additive-only field model NO well-formed patch can
 * express a slug-removal (see header), so this holds for every SYNTAX-valid patch — it is the reserved
 * guard the frozen register (`identity_workflow_policy_violation`) names, kept explicit so a future
 * richer `approval_chain` schema has the enforcement seam. Pure; reads no signal, no slug catalog.
 */
export function isWorkflowSettingsAuthzFloorConformant(patch: WorkflowSettingsPatch): boolean {
  // No writable field in the realized model can remove a required slug (additive-only). The FIXED
  // `can_approve_rfq` check stays M3's at approval time; these settings only ADD approval requirements.
  // `patch` is the future-schema enforcement seam (a richer `approval_chain` would inspect it here);
  // for the realized additive-only model the invariant holds by construction (`void` — RV-0158 truthful).
  void patch;
  return true;
}
