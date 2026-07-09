// Thin Next.js App Router entry for `POST /identity/users/{id}/set_user_account_status` —
// `identity.set_user_account_status.v1` (Doc-5C §4.1 row 4 → `200`; Admin 21.6, NO active-org
// context; W2-IDN-6.1). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// The platform-staff basis is SERVER-DERIVED (Doc-5C §3.2) via the DC-3 fail-closed production
// resolver bound in the handler core — no header/body field can assert staffness (Doc-4A §9.7).
// Every non-staff caller is denied through the wired `check_permission` root (staff-space never
// via org roles — RV-0147 B8) → the frozen §C4 `identity_user_forbidden` (403).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleSetUserAccountStatus } from "@/server/identity";
import type { SetUserAccountStatusInput } from "@/modules/identity/contracts";
import { parseIfMatchTimestamp } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C4 — snake_case wire field names; the target
 *  `user_id` is the path `{id}`, Doc-5C §4.1 input placement — never a body field). */
interface SetUserAccountStatusBody {
  target_status?: unknown;
  reason?: unknown;
}

/** Map the path `{id}` + snake_case wire body + `If-Match` → the typed command input. */
function toInput(
  id: string,
  body: SetUserAccountStatusBody,
  request: Request,
): SetUserAccountStatusInput {
  return {
    targetUserId: id,
    targetStatus: body.target_status as SetUserAccountStatusInput["targetStatus"],
    reason: body.reason as string,
    updatedAt: parseIfMatchTimestamp(request),
  };
}

/**
 * `POST /identity/users/{id}/set_user_account_status` — Admin suspend/reinstate (audited,
 * Admin-attributed). Unauthenticated → `401`; non-staff → `403`; transitioned → `200`;
 * validation → `400`; absent target → `404`; illegal edge / stale token → `409`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: SetUserAccountStatusBody;
  try {
    body = (await request.json()) as SetUserAccountStatusBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleSetUserAccountStatus(toInput(id, body, request), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  // Carry the core-decided standard HTTP headers (e.g. the §9.5 `ETag` on a losing-write 409) + the 401 challenge.
  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
