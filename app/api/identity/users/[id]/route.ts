// Thin Next.js App Router entry for `PATCH /identity/users/{id}` — `identity.update_user_profile.v1`
// (Doc-5C §4.1 row 1 → `200`; W2-IDN-6.1). REPOSITORY_STRUCTURE §8: `app/` does ROUTING +
// COMPOSITION ONLY — no business logic. Binds the LIVE defaults (cookie-bound Supabase session
// resolver + the concrete provisioning hook) and delegates to the app-layer handler core in
// `src/server/identity`, then serializes the transport-agnostic `WireResponse` to a `NextResponse`.
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + module `contracts/` + `src/shared/*`
// only — never a module internal. Method conventions (frozen, Doc-5A §5.2): partial field update →
// `PATCH` item; never `PUT`. The optimistic token rides `If-Match` (Doc-5C §4.3); the body carries
// ONLY the declared §C4 fields (Doc-4A §9.7 prohibited inputs — actor/org/attribution — are never
// mapped; unknown keys are dropped at this seam so they cannot influence the write).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleUpdateUserProfile } from "@/server/identity";
import type { UpdateUserProfileInput } from "@/modules/identity/contracts";
import { parseIfMatchTimestamp } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C4 — snake_case wire field names). */
interface UpdateUserProfileBody {
  display_name?: unknown;
  phone?: unknown;
  preferences?: unknown;
}

/** Map the path `{id}` + snake_case wire body + `If-Match` → the typed command input (Doc-4C §C4
 *  request contract). Type mismatches pass through for the command's SYNTAX validation to reject
 *  uniformly. */
function toInput(
  id: string,
  body: UpdateUserProfileBody,
  request: Request,
): UpdateUserProfileInput {
  const input: UpdateUserProfileInput = {
    targetUserId: id,
    updatedAt: parseIfMatchTimestamp(request),
  };
  if (body.display_name !== undefined) input.displayName = body.display_name as string;
  if (body.phone !== undefined) input.phone = body.phone as string;
  if (body.preferences !== undefined) input.preferences = body.preferences;
  return input;
}

/**
 * `PATCH /identity/users/{id}` — self profile/preferences update. Unauthenticated → `401`;
 * updated → `200`; validation/conflict → `400`/`409`; non-self / no subject → `404` (collapse).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: UpdateUserProfileBody;
  try {
    body = (await request.json()) as UpdateUserProfileBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleUpdateUserProfile(toInput(id, body, request), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  // Carry the core-decided standard HTTP headers (e.g. the Doc-5A §9.5 `ETag` current token on a stale-precondition 409) + the 401 challenge.
  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
