// Thin Next.js App Router entry for `POST /identity/delegation_grants/{id}/revoke_delegation_grant`
// — `identity.revoke_delegation_grant.v1` (Doc-5C §5.1 → `200`; W2-IDN-6.5). ROUTING + COMPOSITION
// ONLY (REPOSITORY_STRUCTURE §8). Controlling-org state command (`active|suspended → revoked`,
// terminal; audited). The M3 grantee/visibility teardown stays out-of-wire and [DC-1]-blocked (the
// injected NO-OP seam — never wired here). `updated_at` = required §C9 BODY field; `Idempotency-Key`
// mandatory.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleRevokeDelegationGrant } from "@/server/identity";
import type { DelegationGrantLifecycleInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C9 — snake_case wire field names). */
interface RevokeBody {
  reason?: unknown;
  updated_at?: unknown;
}

function toInput(id: string, body: RevokeBody): DelegationGrantLifecycleInput {
  return {
    delegationGrantId: id,
    ...(typeof body.reason === "string" ? { reason: body.reason } : {}),
    updatedAt: new Date(String(body.updated_at ?? "")),
  };
}

/**
 * `POST /identity/delegation_grants/{id}/revoke_delegation_grant`. `200` (frozen response — no
 * `updated_at`) · `401` · `400` · `403` · `404` (non-party collapse) · `409` STATE (terminal replay /
 * losing write).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: RevokeBody;
  try {
    body = (await request.json()) as RevokeBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleRevokeDelegationGrant(toInput(id, body), {
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
