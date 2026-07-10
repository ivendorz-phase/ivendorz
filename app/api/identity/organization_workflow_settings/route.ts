// Thin Next.js App Router entries for the `/identity/organization_workflow_settings` active-org
// singleton (W2-IDN-6.8):
//   `GET`   — `identity.get_workflow_settings.v1`    (Doc-5C §6.1 row 35 → `200`; §6.3 → `404`)
//   `PATCH` — `identity.update_workflow_settings.v1` (Doc-5C §6.1 row 34 → `200`; ORG leg of
//             FIXED/POLICY/ORG; writes NO governance signal — the firewall)
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8): this file binds the LIVE defaults (the
// cookie-bound Supabase session resolver + the concrete first-login provisioning hook), delegates to the
// app-layer handler core in `src/server/identity`, and serializes the transport-agnostic `WireResponse`.
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): an `app/` file imports `src/server/*` + module `contracts/` +
// `src/shared/*` only — never a module internal, never cross-schema SQL.
//
// `updated_at` carriage: the PATCH is the §C11 `Concurrency: optimistic` contract (PassB:723 "optimistic
// on `updated_at`") → the token rides `If-Match` (Doc-5C §4.3/§6.4); a stale token is CONFLICT → `409` +
// `ETag`. The GET returns the current token via the `ETag` response header (HTTP §4.0 infrastructure
// header). Bodies carry ONLY declared §C11 fields; `default_routing_mode`/`buyer_courtesy_options` are the
// FAIL-CLOSED deferred fields (presence forwarded; the command rejects — Doc-4A §9.7).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetWorkflowSettings, handleUpdateWorkflowSettings } from "@/server/identity";
import type { UpdateWorkflowSettingsInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey, parseIfMatchTimestamp } from "@/shared/http";

/** PATCH body (Doc-4C §C11 — snake_case wire field names). `default_routing_mode` /
 *  `buyer_courtesy_options` are the FAIL-CLOSED deferred fields (presence forwarded; command rejects). */
interface UpdateWorkflowSettingsBody {
  rfq_approval_mode?: unknown;
  approval_chain?: unknown;
  financial_permissions?: unknown;
  notification_rules?: unknown;
  default_routing_mode?: unknown;
  buyer_courtesy_options?: unknown;
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

/**
 * `GET /identity/organization_workflow_settings` — the active-org workflow-settings read. The handler
 * core resolves the session, lazily provisions, runs the M1 read inside the server-validated active-org
 * context (RLS-scoped), and returns the wire response. Unauthenticated → `401`; present → `200` +
 * `ETag`; absent / cross-tenant / no-context → `404`.
 */
export async function GET(): Promise<NextResponse> {
  const {
    status,
    body,
    headers: wireHeaders,
  } = await handleGetWorkflowSettings({
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(body, { status, headers });
}

/**
 * `PATCH /identity/organization_workflow_settings` — update the active-org workflow settings (the
 * `can_manage_workflow_settings` slug; writes no governance signal). Unauthenticated → `401`; updated →
 * `200`; validation → `400`; forbidden → `403`; absent row / no context → `404`; §6.2 violation → `422`;
 * stale If-Match → `409` + `ETag`.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  const body = await readJson<UpdateWorkflowSettingsBody>(request);

  const input: UpdateWorkflowSettingsInput = {
    updatedAt: parseIfMatchTimestamp(request),
    deferredFields: {
      defaultRoutingModeSupplied: body.default_routing_mode !== undefined,
      buyerCourtesyOptionsSupplied: body.buyer_courtesy_options !== undefined,
    },
  };
  if (body.rfq_approval_mode !== undefined) input.rfqApprovalMode = body.rfq_approval_mode;
  if (body.approval_chain !== undefined) input.approvalChain = body.approval_chain;
  if (body.financial_permissions !== undefined) {
    input.financialPermissions = body.financial_permissions;
  }
  if (body.notification_rules !== undefined) input.notificationRules = body.notification_rules;

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleUpdateWorkflowSettings(input, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
