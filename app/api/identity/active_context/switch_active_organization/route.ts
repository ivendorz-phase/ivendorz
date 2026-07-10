// Thin Next.js App Router entry for `POST /identity/active_context/switch_active_organization` —
// `identity.switch_active_organization.v1` (Doc-5C §6.1 row 29 → `200`; User; W2-IDN-6.6). ROUTING +
// COMPOSITION ONLY (REPOSITORY_STRUCTURE §8).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + module `contracts/` + `src/shared/*` only —
// never a module internal. The body carries ONLY the declared §C8 field `organization_id` (Doc-4A §9.7
// prohibited inputs — actor/attribution — are never mapped; the org id is SERVER-VALIDATED, never trusted).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleSwitchActiveOrganization } from "@/server/identity";
import { parseIdempotencyKey } from "@/shared/http";

/** Shape of the JSON request body (Doc-4C §C8 — snake_case wire field name). */
interface SwitchActiveOrganizationBody {
  organization_id?: unknown;
}

/**
 * `POST /identity/active_context/switch_active_organization` — validate + establish active context.
 * Unauthenticated → `401`; missing Idempotency-Key / malformed id → `400`; validated → `200`; not an
 * active member → `404`; member of a suspended org → `422`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: SwitchActiveOrganizationBody;
  try {
    body = (await request.json()) as SwitchActiveOrganizationBody;
  } catch {
    body = {};
  }

  const {
    status,
    body: responseBody,
    headers: wireHeaders,
  } = await handleSwitchActiveOrganization(
    { organizationId: body.organization_id },
    {
      resolveSession: resolveSupabaseSession,
      ensureProvisioned,
      idempotencyKey: parseIdempotencyKey(request),
    },
  );

  const headers = {
    ...(wireHeaders ?? {}),
    ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
  };
  return NextResponse.json(responseBody, { status, headers });
}
