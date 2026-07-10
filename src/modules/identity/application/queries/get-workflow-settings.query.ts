// M1 application (PRIVATE) — `identity.get_workflow_settings.v1` read query (Doc-4C §C11 PassB:703;
// Doc-5C §6.1 row 35 → `GET /identity/organization_workflow_settings` → 200; §6.3 non-disclosure).
// Orchestration only; owns NO state. The authoritative settings row lives in
// `identity.organization_workflow_settings` (Doc-6C §3.7); this query reads the active-org singleton
// and maps it to the public `GetWorkflowSettingsResult` outcome. W2-IDN-6.8.
//
// Owning/active-org read (§C11 "owning-org Scope"): `activeOrgId` is the SERVER-RESOLVED active org
// (the app-layer org-context guard server-validated the caller's active membership; Doc-6C §2.1 /
// Doc-5C §3.3 — client-supplied org id never trusted). The read carries the EXPLICIT org anchor
// (app-layer primary — RV-0146; RLS is the backstop). Absent → `found: false` (Doc-5C §6.3 — the wire
// `404` collapse; indistinguishable from genuine absence).
//
// UNAUDITED (§C11: reads not audited — §17.1 / §B.8). The internal-service (M3 approval gate / M6
// notifications) consumption of this contract is OUT-OF-WIRE (Doc-5C §7.3); this query realizes the
// owning-org face — consumers call the in-process service, never the table (One Owner).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { findActiveOrgWorkflowSettings } from "../../infrastructure/data/workflow-settings.repository";
import type { GetWorkflowSettingsResult } from "../../contracts/types";

/**
 * `identity.get_workflow_settings.v1` (Doc-4C §C11; Doc-5C §6.1/§6.3). Returns the active-org
 * workflow_settings, or the not-found outcome when the active org has no (visible) settings row.
 *
 * @param activeOrgId the SERVER-RESOLVED active org (the explicit org anchor — RV-0146; never client input).
 * @param db          transaction executor (carrying the RLS backstop GUC — Doc-6C §2.1).
 */
export async function getWorkflowSettings(
  activeOrgId: string,
  db: DbExecutor = prisma,
): Promise<GetWorkflowSettingsResult> {
  const settings = await findActiveOrgWorkflowSettings(activeOrgId, db);

  if (settings === null) {
    // Active org has no visible settings row (genuine absence or cross-tenant RLS exclusion).
    return { found: false };
  }

  return {
    found: true,
    settings: {
      organizationId: settings.organizationId,
      rfqApprovalMode: settings.rfqApprovalMode,
      approvalChain: settings.approvalChain,
      financialPermissions: settings.financialPermissions,
      notificationRules: settings.notificationRules,
      defaultRoutingMode: settings.defaultRoutingMode,
      buyerCourtesyOptions: settings.buyerCourtesyOptions,
    },
    updatedAt: settings.updatedAt,
  };
}
