// Thin Next.js App Router entry for `GET /identity/permissions` — `identity.list_permissions.v1`
// (Doc-5C §5.1 row 17 → `200`; the genuinely-DUAL-ACTOR wire read — User / internal-service; W2-IDN-
// 6.4). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + `src/shared/*` only. Authenticated
// scope (no active-org); the frozen `space` filter + the handle-gated `page_size`/`cursor`/`sort`
// dimensions are extracted so the composition realizes their fail-closed legs (ESC-IDN-LIST-PAGESIZE).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleListPermissions } from "@/server/identity";

/**
 * `GET /identity/permissions` — the platform permission catalog (optionally `space`-filtered).
 * `200` · `401` (unauthenticated) · `400` (undeclared/handle-gated dimension).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const read = (name: string): string | undefined => {
    const value = params.get(name);
    return value === null ? undefined : value;
  };

  const { status, body: responseBody } = await handleListPermissions(
    {
      space: read("space"),
      pageSize: read("page_size"),
      cursor: read("cursor"),
      sort: read("sort"),
    },
    { resolveSession: resolveSupabaseSession, ensureProvisioned },
  );

  return NextResponse.json(responseBody, {
    status,
    headers: status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined,
  });
}
