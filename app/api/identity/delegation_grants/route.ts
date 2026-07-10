// Thin Next.js App Router entry for the frozen Doc-5C §5.1 delegation collection routes
// (W2-IDN-6.5). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8):
//   POST /identity/delegation_grants — `identity.create_delegation_grant.v1` → `201` + `Location`
//   GET  /identity/delegation_grants — `identity.list_delegation_grants.v1`  → `200`
//
// The POST carries the MANDATORY `Idempotency-Key` header (Doc-5C §4.3; §B.6 replay store). Query
// dimensions on the GET are the frozen §C9 filters; `page_size`/`cursor`/`sort` are extracted so the
// composition can realize their fail-closed legs (`ESC-IDN-LIST-PAGESIZE`).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleCreateDelegationGrant, handleListDelegationGrants } from "@/server/identity";
import type { CreateDelegationGrantInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C9 — snake_case wire field names). */
interface CreateDelegationGrantBody {
  representative_organization_id?: unknown;
  vendor_profile_id?: unknown;
  permission_set?: unknown;
  valid_from?: unknown;
  valid_to?: unknown;
}

/** Map the snake_case wire body → the typed command input (declared keys only — Doc-4A §9.7:
 *  no attribution/org-selection/state field is ever read from the body). */
function toCreateInput(body: CreateDelegationGrantBody): CreateDelegationGrantInput {
  return {
    representativeOrganizationId: String(body.representative_organization_id ?? ""),
    vendorProfileId: String(body.vendor_profile_id ?? ""),
    permissionSet: Array.isArray(body.permission_set) ? (body.permission_set as string[]) : [],
    ...(body.valid_from !== undefined ? { validFrom: new Date(String(body.valid_from)) } : {}),
    ...(body.valid_to !== undefined ? { validTo: new Date(String(body.valid_to)) } : {}),
  };
}

/**
 * `POST /identity/delegation_grants` — issue a delegation grant (controlling org; audited).
 * `201` + `Location` · `401` · `400` (syntax / missing Idempotency-Key) · `403`/`404`/`422` (§C9).
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: CreateDelegationGrantBody;
  try {
    body = (await request.json()) as CreateDelegationGrantBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleCreateDelegationGrant(toCreateInput(body), {
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
 * `GET /identity/delegation_grants` — the party-scoped list (frozen §C9 filters; deterministic
 * `valid_from` order). `200` · `401` · `400` (undeclared/handle-gated dimension).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const read = (name: string): string | undefined => {
    const value = params.get(name);
    return value === null ? undefined : value;
  };

  const { status, body: responseBody } = await handleListDelegationGrants(
    {
      roleFilter: read("role_filter"),
      statusFilter: read("status_filter"),
      vendorProfileId: read("vendor_profile_id"),
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
