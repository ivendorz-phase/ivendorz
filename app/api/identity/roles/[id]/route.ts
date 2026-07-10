// Thin Next.js App Router entries for the `/identity/roles/{id}` item (W2-IDN-6.4):
//   `PATCH`  — `identity.update_role.v1` (Doc-5C §5.1 row 20 → `200`; rename)
//   `DELETE` — `identity.delete_role.v1` (Doc-5C §5.1 row 22 → `200`; the ADR-012 soft-delete →
//              DELETE-on-item method rule, Doc-5C §4.6(a) — never a hard delete)
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// `updated_at` carriage is PER-CONTRACT (the RV-0153 call-1 discipline): NO §C7 contract declares
// `Concurrency: optimistic` (contrast the §C5 org PATCH) → the token is the frozen REQUIRED
// request-BODY field on BOTH the PATCH and the DELETE (never `If-Match`). Bodies carry ONLY declared
// §C7 fields (Doc-4A §9.7 — prohibited inputs never mapped; unknown keys dropped at this seam).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleDeleteRole, handleUpdateRole } from "@/server/identity";
import type { DeleteRoleInput, UpdateRoleInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** PATCH body (Doc-4C §C7 PassB:489 — snake_case wire field names). */
interface UpdateRoleBody {
  name?: unknown;
  updated_at?: unknown;
}

/** DELETE body (Doc-4C §C7 PassB:514). */
interface DeleteRoleBody {
  updated_at?: unknown;
  reason?: unknown;
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

/** Parse a REQUIRED §C7 body `updated_at` (ISO-8601 string). Invalid/absent yields an invalid Date —
 *  the command's SYNTAX validation rejects it as the single required-field failure path. */
function parseBodyTimestamp(value: unknown): Date {
  return typeof value === "string" ? new Date(value) : new Date(Number.NaN);
}

/**
 * `PATCH /identity/roles/{id}` — rename a custom role bundle. Unauthenticated → `401`; updated →
 * `200`; validation / stale token → `400`; forbidden → `403`; foreign/no context → `404`; system
 * bundle → `422`; name conflict / reserved → `409`; losing write → `400` + `ETag`.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const body = await readJson<UpdateRoleBody>(request);

  const input: UpdateRoleInput = {
    roleId: id,
    updatedAt: parseBodyTimestamp(body.updated_at),
  };
  if (body.name !== undefined) input.name = body.name as string;

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleUpdateRole(input, {
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
 * `DELETE /identity/roles/{id}` — ADR-012 soft-delete a custom role bundle (never a hard delete).
 * Unauthenticated → `401`; soft-deleted → `200`; validation / stale token → `400`; forbidden →
 * `403`; foreign/no context → `404`; system bundle / members bound → `422`; losing write → `400` +
 * `ETag`.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const body = await readJson<DeleteRoleBody>(request);

  const input: DeleteRoleInput = {
    roleId: id,
    updatedAt: parseBodyTimestamp(body.updated_at),
  };
  if (body.reason !== undefined) input.reason = body.reason as string;

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleDeleteRole(input, {
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
