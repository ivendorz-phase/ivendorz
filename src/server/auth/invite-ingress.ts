// App-layer auth wiring (REPOSITORY_STRUCTURE §5) — the `/invite` URL-redacting ingress (P2-A2).
//
// The signed invitation link lands as `GET /invite?token=…` (the Doc-5C v1.0.1 §3 clicked-URL
// shape — the API URL is NOT the clicked URL). The token is a bearer credential and MUST NOT rest
// in a user-visible URL (Doc-5C G-6 / Doc-7E §3 hygiene): this ingress (a) moves the raw token
// into the HttpOnly carriage cookie, then (b) 303-redirects to the TOKEN-FREE landing URL
// (`/invite/welcome`). After ingress the token exists only in the HttpOnly cookie — no client JS,
// no analytics `$current_url`, and no Referer header can carry it (the history-only carve-out of
// the stamped landing URL itself is the sanctioned exception, Doc-7E §3). The token is NEVER
// logged here; validity is NOT checked here (the landing page resolves server-side — anti-oracle
// belongs to the resolve seam, Doc-4C v1.0.3 §C13).
//
// Kept in `src/server` (composition edge) so the behavior is directly testable; the `app/` route
// is a thin delegate (REPOSITORY_STRUCTURE §8: `app/` is composition only).

import { NextResponse } from "next/server";
import { INVITE_TOKEN_COOKIE_NAME, inviteTokenCookieOptions } from "./invite-token-cookie";

/** The token-free landing URL the ingress redirects to (implementation scope — Doc-7E §5). */
export const INVITE_LANDING_PATH = "/invite/welcome" as const;

/**
 * Handle `GET /invite[?token=…]`: set the HttpOnly carriage cookie (when a non-empty token is
 * present) and redirect to the token-free landing. `no-store` on the redirect — a token-bearing
 * URL response never enters any cache tier (the Doc-5C G-3 posture applied protectively).
 */
export function handleInviteIngress(request: Request): Response {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  const response = NextResponse.redirect(new URL(INVITE_LANDING_PATH, url.origin), 303);
  response.headers.set("Cache-Control", "no-store");

  if (token !== null && token.length > 0) {
    response.cookies.set(INVITE_TOKEN_COOKIE_NAME, token, inviteTokenCookieOptions());
  }
  return response;
}
