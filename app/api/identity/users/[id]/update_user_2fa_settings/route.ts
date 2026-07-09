// Thin Next.js App Router entry for `POST /identity/users/{id}/update_user_2fa_settings` —
// `identity.update_user_2fa_settings.v1` (Doc-5C §4.1 row 2 → `200`; the §4.6(b) named-command
// [realization convention]; W2-IDN-6.1). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
// Settings only — the 2FA challenge/verification mechanism is Supabase Auth infrastructure (DC-4).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleUpdateUser2faSettings } from "@/server/identity";
import type { UpdateUser2faSettingsInput } from "@/modules/identity/contracts";
import { parseIfMatchTimestamp } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C4 — snake_case wire field names). */
interface UpdateUser2faSettingsBody {
  two_fa_enabled?: unknown;
  recovery_method?: unknown;
}

/** Map the path `{id}` + snake_case wire body + `If-Match` → the typed command input. Type
 *  mismatches pass through for the command's SYNTAX validation to reject uniformly. */
function toInput(
  id: string,
  body: UpdateUser2faSettingsBody,
  request: Request,
): UpdateUser2faSettingsInput {
  const input: UpdateUser2faSettingsInput = {
    targetUserId: id,
    twoFaEnabled: body.two_fa_enabled as boolean,
    updatedAt: parseIfMatchTimestamp(request),
  };
  if (body.recovery_method !== undefined) input.recoveryMethod = body.recovery_method as string;
  return input;
}

/**
 * `POST /identity/users/{id}/update_user_2fa_settings` — self 2FA-settings command (audited).
 * Unauthenticated → `401`; updated → `200`; validation/conflict → `400`/`409`; non-self /
 * no-context → `404` (collapse).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  let body: UpdateUser2faSettingsBody;
  try {
    body = (await request.json()) as UpdateUser2faSettingsBody;
  } catch {
    body = {};
  }

  const { status, body: responseBody } = await handleUpdateUser2faSettings(
    toInput(id, body, request),
    {
      resolveSession: resolveSupabaseSession,
      ensureProvisioned,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    },
  );

  const headers = status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined;
  return NextResponse.json(responseBody, { status, headers });
}
