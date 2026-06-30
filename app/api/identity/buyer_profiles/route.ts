// Thin Next.js App Router entry for `GET /identity/buyer_profiles` — `identity.get_buyer_profile.v1`
// (Doc-5C §6.1 row 33 → `200`; §6.3 non-disclosure → `404`). REPOSITORY_STRUCTURE §8: `app/` does
// ROUTING + COMPOSITION ONLY — no business logic. This entry binds the LIVE defaults (the cookie-bound
// Supabase session resolver + the concrete first-login provisioning hook) and delegates to the app-layer
// handler core in `src/server/identity`, then serializes the transport-agnostic `WireResponse` to a
// `NextResponse`. The status + the Doc-5A §5.6/§6.1 envelope (incl. the top-level `reference_id`,
// CHK-5A-042) are decided in the core; this file only carries them onto the wire.
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): an `app/` file imports `src/server/*` + module `contracts/` +
// `src/shared/*` only — never a module internal, never cross-schema SQL. Here it imports `src/server`
// (auth + the handler core) only.
//
// AUTH-BOUNDARY 401 (DC-4): the unauthenticated case is a transport-level auth-boundary response (no
// Doc-5A contract `error_class`; see `governanceReviews/ESC-W1-AUTH-401_v1.0.md`). On a 401 this entry
// also sets the HTTP-standard `WWW-Authenticate` header — pure HTTP transport, outside the Doc-5A
// application-header registry (Doc-5A §4.0 admits standard HTTP infrastructure headers).

import { NextResponse } from "next/server";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { handleGetBuyerProfile, handleUpsertBuyerProfile } from "@/server/identity";
import type { UpsertBuyerProfileInput } from "@/modules/identity/contracts";

/**
 * `GET /identity/buyer_profiles` — the active-org buyer-profile read. The handler core resolves the
 * session, lazily provisions, runs the M1 read inside the server-validated active-org context (RLS-scoped),
 * and returns the wire response. Unauthenticated → `401`; absent / cross-tenant / no-context → `404`.
 */
export async function GET(): Promise<NextResponse> {
  const { status, body } = await handleGetBuyerProfile({
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  // HTTP-standard 401 auth challenge header (transport only; not a Doc-5A application header).
  const headers = status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined;
  return NextResponse.json(body, { status, headers });
}

/** Shape of the JSON request body for the upsert (Doc-4C §C10 — snake_case wire field names). */
interface UpsertBuyerProfileBody {
  industry?: unknown;
  factory_info?: unknown;
  delivery_locations?: unknown;
  procurement_preferences?: unknown;
  /** Optimistic-concurrency token (ISO-8601) on update. */
  updated_at?: unknown;
}

/** Map the snake_case wire body → the typed (camelCase) command input (Doc-4C §C10 request contract). */
function toUpsertInput(body: UpsertBuyerProfileBody): UpsertBuyerProfileInput {
  return {
    industry: typeof body.industry === "string" ? body.industry : (body.industry as undefined),
    factoryInfo: body.factory_info,
    deliveryLocations: body.delivery_locations,
    procurementPreferences: body.procurement_preferences,
    expectedUpdatedAt: typeof body.updated_at === "string" ? new Date(body.updated_at) : undefined,
  };
}

/**
 * `POST /identity/buyer_profiles` — `identity.upsert_buyer_profile.v1` (Doc-4C §C10). Create-or-update the
 * active-org buyer profile, appending the canonical audit action atomically. The handler core resolves the
 * session, provisions, and runs the M1 command inside the server-validated active-org context. Unauthenticated
 * → `401`; created → `201`; updated → `200`; validation/forbidden/conflict → `400`/`403`/`409`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: UpsertBuyerProfileBody;
  try {
    body = (await request.json()) as UpsertBuyerProfileBody;
  } catch {
    body = {};
  }

  const { status, body: responseBody } = await handleUpsertBuyerProfile(toUpsertInput(body), {
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  const headers = status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined;
  return NextResponse.json(responseBody, { status, headers });
}
