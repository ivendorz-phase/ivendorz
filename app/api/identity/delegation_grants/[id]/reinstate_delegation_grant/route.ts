// Thin Next.js App Router entry for `POST /identity/delegation_grants/{id}/reinstate_delegation_grant`
// — `identity.reinstate_delegation_grant.v1` (Doc-5C §5.1 → `200`; contract #25, REAL since
// W2-IDN-6.5 per `Doc-2_Patch_v1.0.7` — the former `[ESC-IDN-DELEG-EXPIRY]` gate is RESOLVED).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). Controlling-org state command
// (`suspended → active`, valid ONLY while the validity window is open; reject-expired inside the
// frozen §C9 register). `updated_at` = required §C9 BODY field; `Idempotency-Key` mandatory.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleReinstateDelegationGrant } from "@/server/identity";
import type { DelegationGrantLifecycleInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C9 — `updated_at` only; reinstate declares no reason). */
interface ReinstateBody {
  updated_at?: unknown;
}

function toInput(id: string, body: ReinstateBody): DelegationGrantLifecycleInput {
  return {
    delegationGrantId: id,
    updatedAt: new Date(String(body.updated_at ?? "")),
  };
}

/**
 * `POST /identity/delegation_grants/{id}/reinstate_delegation_grant`. `200` · `401` · `400` (syntax /
 * missing Idempotency-Key / stale token) · `403` · `404` (non-party collapse) · `409` STATE (illegal
 * edge / lapsed window — the patch rule-3 rejection / losing write).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: ReinstateBody;
  try {
    body = (await request.json()) as ReinstateBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleReinstateDelegationGrant(toInput(id, body), {
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
