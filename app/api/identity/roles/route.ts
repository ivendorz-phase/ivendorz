// Thin Next.js App Router entries for the frozen Doc-5C §5.1 role collection routes (W2-IDN-6.4).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8):
//   GET  /identity/roles — `identity.list_roles.v1`   → `200` (User, active-org; own roles + seeds)
//   POST /identity/roles — `identity.create_role.v1`  → `201` + `Location`
//
// The POST carries the MANDATORY `Idempotency-Key` header (Doc-5C §4.3; §B.6 replay store). The body
// carries ONLY declared §C7 fields (Doc-4A §9.7 — no actor/org/attribution/is_system_bundle input;
// the owning org is the SERVER-RESOLVED active org, never a body field). GET query dimensions are the
// frozen `include_system` filter + the handle-gated `page_size`/`cursor`/`sort` legs.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreateRole, handleListRoles } from "@/server/identity";
import type { CreateRoleInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C7 PassB:476 — snake_case wire field names). */
interface CreateRoleBody {
  name?: unknown;
  permission_slugs?: unknown;
}

/** Map the snake_case wire body → the typed command input. Type mismatches pass through for the
 *  command's SYNTAX validation to reject uniformly. */
function toCreateInput(body: CreateRoleBody): CreateRoleInput {
  const input: CreateRoleInput = { name: body.name as string };
  if (body.permission_slugs !== undefined) {
    input.permissionSlugs = body.permission_slugs as string[];
  }
  return input;
}

/**
 * `POST /identity/roles` — create a custom role bundle (`is_system_bundle = false`, active-org).
 * `401` · `201` + `Location` · `400` (syntax / missing Idempotency-Key) · `403` · `404` (no context)
 * · `409` (name conflict / reserved) · `422` (unknown/non-assignable slug).
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: CreateRoleBody;
  try {
    body = (await request.json()) as CreateRoleBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleCreateRole(toCreateInput(body), {
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

/**
 * `GET /identity/roles` — the active-org role list (own custom roles + system seeds).
 * `200` · `401` · `400` (undeclared/handle-gated dimension).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const read = (name: string): string | undefined => {
    const value = params.get(name);
    return value === null ? undefined : value;
  };

  const { status, body: responseBody } = await handleListRoles(
    {
      includeSystem: read("include_system"),
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
