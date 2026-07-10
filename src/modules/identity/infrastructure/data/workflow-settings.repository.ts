// M1 infrastructure (PRIVATE) — thin Prisma repository over `identity.organization_workflow_settings`
// (Doc-2 §10.2 / Doc-6C §3.7) for the §C11 wired contracts. M1 reading/writing its OWN schema
// (allowed); other modules reach this only via the M1 contracts facade. W2-IDN-6.8.
//
// APP-LAYER org anchor is PRIMARY (the RV-0146 / `authz.repository` doctrine, Doc-6C §6.2a): every
// read/write carries its OWN explicit `organization_id = :activeOrgId` WHERE anchor — it does NOT rely
// on RLS for correctness (a local/superuser connection bypasses RLS entirely). `activeOrgId` is the
// SERVER-RESOLVED active org (Invariant #5 — client-supplied org id never trusted; it reaches here only
// after the app-layer context guard validated the caller's active membership). The Doc-6C §3.7 RLS
// (`ows_tenant USING (organization_id = active_org)`) remains the defense-in-depth backstop.
//
// D7 pattern (REFERENCE_Audited_Write_Pattern_v1.0 rules 2–3): this repository OWNS the SQL and knows
// NOTHING of audit policy — it returns DATA (the old/new field sets + the new `updated_at`) so the
// COMMAND chooses the audit action and the M0 facade performs the append.
//
// CONCURRENCY: the write is a WRITE-TIME compare-and-set on `updated_at` (the `updateOrganization
// ProfileFields` shape — the §C11 `optimistic on updated_at` token, PassB:723). `updated_at` is the
// Prisma `@updatedAt` client-managed token (ms precision — so the DB-level CAS matches reliably, the
// proven org-profile precedent) and Prisma bumps it on the update. A zero-row CAS re-reads and returns
// the row's CURRENT `updated_at` (Doc-5A §9.5 → the wire `ETag`) for the §9.6 re-read-retry.
//
// FIREWALL (Invariant #6 / §B.7 / §C12.6): the write's column set is CLOSED to the four realizable
// §C11 fields + the server-populated `updated_by` — it touches NO governance-signal table/column
// (Trust/Performance/Financial-Tier/Capacity/Buyer-Vendor-Status live in OTHER modules' schemas, no
// cross-module FK). `organization_workflow_settings` has no signal column (Doc-6C §3.7).

import { Prisma, prisma, type DbExecutor } from "../../../../shared/db";
import type {
  RfqApprovalModeValue,
  WorkflowSettingsPatch,
} from "../../domain/policies/workflow-settings.policy";
import type { WorkflowSettingsReadModel } from "../../domain/read-models/workflow-settings.read-model";

/** The audited workflow-settings field set (the four realized Doc-6C §3.7 business columns) — the
 *  `old_value` / `new_value` shape the command records. Snake_case keys = the frozen §C11 wire field
 *  names (the audit payload mirrors the contract, not the Prisma camelCase). */
export interface WorkflowSettingsFieldSet {
  rfq_approval_mode: RfqApprovalModeValue;
  approval_chain: unknown;
  financial_permissions: unknown;
  notification_rules: unknown;
}

/** A CAS-conflict outcome carrying the row's CURRENT concurrency token (Doc-5A §9.5); absent only when
 *  the live row vanished mid-flight (the caller's response simply omits `ETag`). */
export interface WorkflowSettingsCasConflict {
  outcome: "conflict";
  currentUpdatedAt?: Date;
}

const WORKFLOW_SETTINGS_SELECT = {
  organizationId: true,
  rfqApprovalMode: true,
  approvalChainJsonb: true,
  financialPermissionsJsonb: true,
  notificationRulesJsonb: true,
  updatedAt: true,
} as const;

type WorkflowSettingsRow = {
  id: string;
  rfqApprovalMode: RfqApprovalModeValue;
  approvalChainJsonb: unknown;
  financialPermissionsJsonb: unknown;
  notificationRulesJsonb: unknown;
  updatedAt: Date;
};

function fieldSetOf(row: {
  rfqApprovalMode: RfqApprovalModeValue;
  approvalChainJsonb: unknown;
  financialPermissionsJsonb: unknown;
  notificationRulesJsonb: unknown;
}): WorkflowSettingsFieldSet {
  return {
    rfq_approval_mode: row.rfqApprovalMode,
    approval_chain: row.approvalChainJsonb,
    financial_permissions: row.financialPermissionsJsonb,
    notification_rules: row.notificationRulesJsonb,
  };
}

// Map a contract jsonb value to Prisma's nullable-JSON input: `null` → the JSON null literal;
// otherwise the value (Doc-6A §12 — IDs/values only). Callers spread this only when the key is present.
function toJsonInput(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

/**
 * Read the active-org workflow_settings singleton (Doc-4C §C11 `get_workflow_settings.v1`; Doc-5C
 * §6.1/§6.3). Scoped by the EXPLICIT `activeOrgId` anchor (app-layer primary — RV-0146); RLS is the
 * backstop. Returns the live row projected to the read model (the four realized fields + the two
 * DEFERRED §C11 keys as `null`, see the read-model header), or `null` when the active org has no
 * (visible) settings row (genuine absence → the §6.3 non-disclosure 404 collapse).
 */
export async function findActiveOrgWorkflowSettings(
  activeOrgId: string,
  db: DbExecutor = prisma,
): Promise<WorkflowSettingsReadModel | null> {
  // Explicit org anchor (RV-0146): does not rely on RLS for correctness. The `ows_org_live_uq`
  // partial-unique (WHERE deleted_at IS NULL) guarantees at most one live row per org.
  const row = await db.organizationWorkflowSettings.findFirst({
    where: { organizationId: activeOrgId, deletedAt: null },
    select: WORKFLOW_SETTINGS_SELECT,
  });
  if (row === null) return null;

  return {
    organizationId: row.organizationId,
    rfqApprovalMode: row.rfqApprovalMode as RfqApprovalModeValue,
    approvalChain: row.approvalChainJsonb,
    financialPermissions: row.financialPermissionsJsonb,
    notificationRules: row.notificationRulesJsonb,
    // DEFERRED — no Doc-6C §3.7 column (read-model header): the frozen six-key shape, no fabricated value.
    defaultRoutingMode: null,
    buyerCourtesyOptions: null,
    updatedAt: row.updatedAt,
  };
}

/** The outcome of the CAS write. `updated` carries the new token + the old/new field sets the command
 *  audits; `conflict` = stale token (+ current token for the §9.5 ETag); `not_found` = no live row
 *  for the active org (the frozen `identity_workflow_not_found` — the row is NOT create-class here,
 *  Doc-5C §6.2: only the buyer-profile UPSERT "creates on first call"). */
export type WorkflowSettingsWrite =
  | {
      outcome: "updated";
      updatedAt: Date;
      oldValue: WorkflowSettingsFieldSet;
      newValue: WorkflowSettingsFieldSet;
    }
  | WorkflowSettingsCasConflict
  | { outcome: "not_found" };

/** Re-read the live row's current `updated_at` for a §9.5 conflict response. */
async function currentToken(rowId: string, db: DbExecutor): Promise<WorkflowSettingsCasConflict> {
  const row = await db.organizationWorkflowSettings.findFirst({
    where: { id: rowId, deletedAt: null },
    select: { updatedAt: true },
  });
  return row === null
    ? { outcome: "conflict" }
    : { outcome: "conflict", currentUpdatedAt: row.updatedAt };
}

/**
 * Apply the `update_workflow_settings` partial write to the active-org singleton under a CAS on
 * `updated_at` (the §C11 `optimistic on updated_at` token). Scoped by the EXPLICIT `activeOrgId` anchor
 * (app-layer primary — RV-0146; RLS is the backstop). Returns the new token + old/new field sets on
 * success; `conflict` (+ current token) when stale; `not_found` when the active org has no live
 * settings row.
 *
 * The write column set is CLOSED to the four realizable §C11 fields + the server-set `updated_by` — no
 * governance signal is written (the firewall; see the file header).
 */
export async function updateActiveOrgWorkflowSettingsFields(
  params: {
    activeOrgId: string;
    actorUserId: string;
    expectedUpdatedAt: Date;
    patch: WorkflowSettingsPatch;
  },
  db: DbExecutor = prisma,
): Promise<WorkflowSettingsWrite> {
  // Explicit org anchor (RV-0146); the singleton index guarantees at most one live row per org. Load it
  // for the NOT_FOUND leg + the `old_value` field set.
  const existing = (await db.organizationWorkflowSettings.findFirst({
    where: { organizationId: params.activeOrgId, deletedAt: null },
    select: { id: true, ...WORKFLOW_SETTINGS_SELECT },
  })) as (WorkflowSettingsRow & { organizationId: string }) | null;
  if (existing === null) return { outcome: "not_found" };

  const oldValue = fieldSetOf(existing);

  // CAS on (`updated_at` × live) — atomic; a stale token / losing writer touches nothing (updateMany
  // count 0). `@updatedAt` bumps the token on write (Prisma client-managed ms precision).
  const data: Prisma.OrganizationWorkflowSettingsUpdateManyMutationInput = {
    updatedBy: params.actorUserId,
  };
  if (params.patch.rfqApprovalMode !== undefined)
    data.rfqApprovalMode = params.patch.rfqApprovalMode;
  if (params.patch.approvalChain !== undefined) {
    data.approvalChainJsonb = toJsonInput(params.patch.approvalChain);
  }
  if (params.patch.financialPermissions !== undefined) {
    data.financialPermissionsJsonb = toJsonInput(params.patch.financialPermissions);
  }
  if (params.patch.notificationRules !== undefined) {
    data.notificationRulesJsonb = toJsonInput(params.patch.notificationRules);
  }

  const written = await db.organizationWorkflowSettings.updateMany({
    where: { id: existing.id, deletedAt: null, updatedAt: params.expectedUpdatedAt },
    data,
  });
  if (written.count !== 1) return currentToken(existing.id, db);

  const after = await db.organizationWorkflowSettings.findFirst({
    where: { id: existing.id },
    select: WORKFLOW_SETTINGS_SELECT,
  });
  if (after === null) return { outcome: "conflict" }; // unreachable; fail closed.
  return {
    outcome: "updated",
    updatedAt: after.updatedAt,
    oldValue,
    newValue: fieldSetOf(after),
  };
}
