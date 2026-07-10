// App-layer COMPOSITIONS for the two §C11 workflow-settings contracts (W2-IDN-6.8; Doc-5C §6.1 rows
// 34–35). REPOSITORY_STRUCTURE §5/§8 — `src/server` is the composition edge that wires Supabase Auth ↔
// active-org context ↔ M1 contracts. Two faces:
//   `handleGetWorkflowSettings`    — `GET /identity/organization_workflow_settings` (owning-org read).
//   `handleUpdateWorkflowSettings` — `PATCH /identity/organization_workflow_settings` (active-org update).
//
// READ (the get-buyer-profile composition shape): session → provision → `withActiveOrg(getWorkflow
// Settings(tx))` (RLS-scoped) → the M1 wire mapper. Unauthenticated → the DC-4 auth-boundary `401`;
// absent / cross-tenant / no-context → `404` (non-disclosure — Doc-5C §6.3). UNAUDITED (§C11 read).
//
// UPDATE (the organization-tenant composition shape): session → `401` · Idempotency-Key REQUIRED
// (Doc-5C §4.3) → `400` · provision · `withActiveOrg` → §B.6 replay lookup → command → wire map → §B.6
// persist (success-only, SAME tx — the §14.3 joint rule). NO claim leg: the update is CAS-covered (the
// `updated_at` optimistic token IS the in-flight guard — the create-only claim is RV-0153 F2). The
// [DC-5] dedup window is the REAL `identity.command_dedup_window` POLICY key read via `core.config_
// value_query.v1` (never a literal — the IDN-4/IDN-5 precedent). Zero §8 events ([DC-1]).
//
// FIREWALL (Invariant #6 / §B.7 / §C12.6): the update command writes NO governance signal; the
// composition binds only the M0 `appendAuditRecord` (audit) + the §B.6 dedup store — no signal service.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  getWorkflowSettings,
  mapGetWorkflowSettings,
  mapUpdateWorkflowSettings,
  updateWorkflowSettings,
  workflowSettingsInvalidInput,
  type UpdateWorkflowSettingsInput,
  type UpdateWorkflowSettingsResult,
  type WorkflowSettingsView,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import {
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the workflow-settings READ face. All injectable (defaults bind production wiring). */
export interface GetWorkflowSettingsHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/** Dependencies for the workflow-settings UPDATE face. */
export interface UpdateWorkflowSettingsHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). Routes always pass string|null. */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/**
 * The HTTP face for `GET /identity/organization_workflow_settings` (`200`). Resolves the session,
 * lazily provisions, runs the M1 read INSIDE the server-validated active-org context (RLS-scoped), and
 * returns the wire response. Unauthenticated → `401`; present → `200` (+ the `ETag` current token);
 * absent / cross-tenant / no-context → `404` (non-disclosure). UNAUDITED.
 */
export async function handleGetWorkflowSettings(
  deps: GetWorkflowSettingsHandlerDeps,
): Promise<WireResponse<WorkflowSettingsView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }
  await deps.ensureProvisioned(session);

  // Run the M1 read INSIDE the active-org context transaction, passing the SERVER-RESOLVED active org
  // as the explicit anchor (app-layer primary — RV-0146; the tx also carries the RLS-backstop GUC).
  // Fail-closed: no active org ⇒ the read never runs → `null` → the `404` collapse (indistinguishable
  // from a genuinely-absent row — Doc-5C §6.3).
  const outcome = await withActiveOrg(session, (tx, context) =>
    getWorkflowSettings(context.activeOrgId, tx),
  );
  return mapGetWorkflowSettings(outcome.resolved ? outcome.value : null);
}

/**
 * The HTTP face for `PATCH /identity/organization_workflow_settings` (`200`). Session → `401`;
 * mandatory Idempotency-Key → `400`; updated → `200`; validation → `400`; forbidden → `403`; absent
 * row / no context → `404`; §6.2 violation → `422`; stale If-Match → `409` + `ETag`.
 */
export async function handleUpdateWorkflowSettings(
  input: UpdateWorkflowSettingsInput,
  deps: UpdateWorkflowSettingsHandlerDeps,
): Promise<WireResponse<UpdateWorkflowSettingsResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — before any semantic processing.
  if (deps.idempotencyKey === null) {
    return workflowSettingsInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const contractId = "identity.update_workflow_settings.v1";
  const ran = await withActiveOrg(session, async (tx, context) => {
    if (key !== undefined) {
      const replay = await findStoredReplay<UpdateWorkflowSettingsResult>(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await updateWorkflowSettings(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
    const wire = mapUpdateWorkflowSettings(outcome);

    if (outcome.ok && key !== undefined) {
      // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule). No claim
      // leg: the CAS on `updated_at` is the in-flight guard (RV-0153 F2 — claim is create-only).
      await persistWireReplay(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        wire,
        tx,
      );
    }
    return wire;
  });

  if (!ran.resolved) {
    return mapUpdateWorkflowSettings(null); // §6.6 collapse (no user / no active membership).
  }
  return ran.value;
}
