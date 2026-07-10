// Thin Next.js App Router entry for `GET /identity/delegation_grants/{id}` —
// `identity.get_delegation_grant.v1` (Doc-5C §5.1 → `200`; W2-IDN-6.5). ROUTING + COMPOSITION ONLY
// (REPOSITORY_STRUCTURE §8). Dual-party read: either party org; non-party collapses to `404` (§7.5).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetDelegationGrant } from "@/server/identity";

/**
 * `GET /identity/delegation_grants/{id}` — the frozen §C9 projection. `200` · `401` · `400`
 * (malformed `{id}`) · `404` (absent / non-party / no context — byte-identical collapse).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const { status, body: responseBody } = await handleGetDelegationGrant(id, {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  return NextResponse.json(responseBody, {
    status,
    headers: status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined,
  });
}
