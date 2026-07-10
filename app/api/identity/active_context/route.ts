// Thin Next.js App Router entry for `GET /identity/active_context` —
// `identity.get_active_context.v1` (Doc-5C §6.1 row 30 → `200`; User; W2-IDN-6.6). ROUTING +
// COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). The principal-scoped context singleton — no `{id}`, no
// query params (the caller's OWN context only; §C8 PassB:546 "none — resolves the caller's session context").
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` only — never a module internal.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetActiveContext } from "@/server/identity";

/**
 * `GET /identity/active_context` — resolve the caller's current active context. Unauthenticated → `401`;
 * resolved → `200` (org id + membership + effective_permission_summary); no active context → `404`.
 */
export async function GET(): Promise<NextResponse> {
  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleGetActiveContext({
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
