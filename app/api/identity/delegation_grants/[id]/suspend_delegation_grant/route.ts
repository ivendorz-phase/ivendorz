// Thin Next.js App Router entry for `POST /identity/delegation_grants/{id}/suspend_delegation_grant`
// — `identity.suspend_delegation_grant.v1` (Doc-5C §5.1 → `200`; W2-IDN-6.5). ROUTING + COMPOSITION
// ONLY (REPOSITORY_STRUCTURE §8). Controlling-org state command (`active → suspended`; audited).
//
// `updated_at` is a REQUIRED §C9 BODY field (Doc-5A §5.4 — the §C9 lifecycle commands declare no
// `Concurrency: optimistic`, so the §4.3 If-Match convention does not attach; logged judgment call).
// The `Idempotency-Key` header is MANDATORY (Doc-5C §4.3; §B.6 replay store).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleSuspendDelegationGrant } from "@/server/identity";
import type { DelegationGrantLifecycleInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C9 — snake_case wire field names). */
interface LifecycleBody {
  reason?: unknown;
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input (declared keys only). */
function toInput(id: string, body: LifecycleBody): DelegationGrantLifecycleInput {
  return {
    delegationGrantId: id,
    ...(typeof body.reason === "string" ? { reason: body.reason } : {}),
    updatedAt: new Date(String(body.updated_at ?? "")),
  };
}

/**
 * `POST /identity/delegation_grants/{id}/suspend_delegation_grant`. `200` · `401` · `400` (syntax /
 * missing Idempotency-Key / stale token) · `403` · `404` (non-party collapse) · `409` STATE.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: LifecycleBody;
  try {
    body = (await request.json()) as LifecycleBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleSuspendDelegationGrant(toInput(id, body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    idempotencyKey: parseIdempotencyKey(request),
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  // Carry the core-decided standard HTTP headers (e.g. the §9.5 `ETag` on a losing-write 409).
  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
