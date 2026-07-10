// Thin Next.js App Router entry for `POST /identity/roles/{id}/set_role_permissions` —
// `identity.set_role_permissions.v1` (Doc-5C §5.1 row 21 → `200`; User, active-org; W2-IDN-6.4).
// ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). `updated_at` is the frozen REQUIRED
// request-body field (§C7 declares NO `Concurrency: optimistic` — no If-Match on this contract; the
// RV-0153 call-1 discipline). The ⊆-assignable / never-staff / never-ownership-class firewall + the
// system-bundle immutability guard live in the command/policy, never here.

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleSetRolePermissions } from "@/server/identity";
import type { SetRolePermissionsInput } from "@/modules/identity/contracts";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C7 PassB:501 — snake_case wire field names). */
interface SetRolePermissionsBody {
  add_slugs?: unknown;
  remove_slugs?: unknown;
  updated_at?: unknown;
}

/** Map the path `{id}` + snake_case wire body → the typed command input. */
function toInput(id: string, body: SetRolePermissionsBody): SetRolePermissionsInput {
  const input: SetRolePermissionsInput = {
    roleId: id,
    updatedAt:
      typeof body.updated_at === "string" ? new Date(body.updated_at) : new Date(Number.NaN),
  };
  if (body.add_slugs !== undefined) input.addSlugs = body.add_slugs as string[];
  if (body.remove_slugs !== undefined) input.removeSlugs = body.remove_slugs as string[];
  return input;
}

/**
 * `POST /identity/roles/{id}/set_role_permissions` — compose the role's permissions (add/remove;
 * removal = audited revocation). Unauthenticated → `401`; composed → `200`; validation / stale token
 * → `400`; forbidden → `403`; foreign/no context → `404`; unknown/non-assignable slug → `422`;
 * system bundle → `422`; losing write → `400` + `ETag`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: SetRolePermissionsBody;
  try {
    body = (await request.json()) as SetRolePermissionsBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleSetRolePermissions(toInput(id, body), {
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
