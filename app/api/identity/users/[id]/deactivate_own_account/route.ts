// Thin Next.js App Router entry for `POST /identity/users/{id}/deactivate_own_account` —
// `identity.deactivate_own_account.v1` (Doc-5C §4.1 row 3 → `200`; W2-IDN-6.1). ROUTING +
// COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). Depart + anonymize — irreversible (the §14.3
// compliance-redaction path; `soft_deleted` is terminal).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleDeactivateOwnAccount } from "@/server/identity";
import type { DeactivateOwnAccountInput } from "@/modules/identity/contracts";
import { parseIfMatchTimestamp } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C4 — snake_case wire field names). */
interface DeactivateOwnAccountBody {
  confirmation?: unknown;
}

/** Map the path `{id}` + snake_case wire body + `If-Match` → the typed command input. */
function toInput(
  id: string,
  body: DeactivateOwnAccountBody,
  request: Request,
): DeactivateOwnAccountInput {
  return {
    targetUserId: id,
    confirmation: body.confirmation as boolean,
    updatedAt: parseIfMatchTimestamp(request),
  };
}

/**
 * `POST /identity/users/{id}/deactivate_own_account` — self departure command (audited;
 * anonymizing). Unauthenticated → `401`; departed → `200`; validation → `400`; last-owner block →
 * `422`; conflict → `409`; non-self / no subject → `404` (collapse).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: DeactivateOwnAccountBody;
  try {
    body = (await request.json()) as DeactivateOwnAccountBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleDeactivateOwnAccount(toInput(id, body, request), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  // Carry the core-decided standard HTTP headers (e.g. the §9.5 `ETag` on a stale 409) + the 401 challenge.
  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
