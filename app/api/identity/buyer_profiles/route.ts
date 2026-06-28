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
import { handleGetBuyerProfile } from "@/server/identity";

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
