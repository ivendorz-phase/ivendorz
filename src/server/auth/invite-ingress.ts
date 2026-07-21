// App-layer auth wiring (REPOSITORY_STRUCTURE §5) — the `/invite` URL-redacting ingress (P2-A2 +
// the Lane-C §C13 redemption wiring).
//
// The signed invitation link lands as `GET /invite?token=…` (the Doc-5C v1.0.1 §3 clicked-URL
// shape — the API URL is NOT the clicked URL). The token is a bearer credential and MUST NOT rest
// in a user-visible URL (Doc-5C G-6 / Doc-7E §3 hygiene): this ingress (a) moves the raw token
// into the HttpOnly carriage cookie, then (b) 303-redirects to the TOKEN-FREE landing URL
// (`/invite/welcome`). After ingress the token exists only in the HttpOnly cookie — no client JS,
// no analytics `$current_url`, and no Referer header can carry it (the history-only carve-out of
// the stamped landing URL itself is the sanctioned exception, Doc-7E §3). The token is NEVER
// logged here.
//
// DUAL-MODE (Lane-C integration — the B-2 carry wired home):
//   • SIGNED MODE — the inbound URL carries the §C13 signed legs (`n`/`e`/`s` — minted by
//     `resolve_invitation_delivery_payload`, param names owned by the M1
//     `signed-invitation-url` helper). The ingress calls `redeemSignedInvitationUrl`
//     (`@/modules/identity/contracts`) so the Doc-6C v1.0.4 §5 one-time/TTL property holds AT THE
//     BOUNDARY: valid+unconsumed+unexpired → cookie set (the redemption-returned raw token),
//     redirect; invalid/replayed/expired → NO cookie, SAME redirect to the token-free landing
//     (which renders the ONE uniform invalid framing — anti-oracle preserved; no distinct
//     behavior observable from outside). ANY signed leg present ⇒ signed mode (a stripped/partial
//     leg set never silently downgrades the guarded link to bare mode).
//   • BARE MODE — `/invite?token=…` WITHOUT signed legs (the pre-store P1 link shape and any
//     manually shared link) keeps the original behavior unchanged: cookie set, redirect. The
//     invitation token's own liveness (resolve seam, Doc-4C v1.0.3 §C13) still gates everything
//     downstream — validity is NOT checked here in this mode (anti-oracle belongs to the resolve
//     seam).
//
// Kept in `src/server` (composition edge) so the behavior is directly testable; the `app/` route
// is a thin delegate (REPOSITORY_STRUCTURE §8: `app/` is composition only).

import { NextResponse } from "next/server";
import { redeemSignedInvitationUrl } from "@/modules/identity/contracts";
import { INVITE_TOKEN_COOKIE_NAME, inviteTokenCookieOptions } from "./invite-token-cookie";

/** The token-free landing URL the ingress redirects to (implementation scope — Doc-7E §5). */
export const INVITE_LANDING_PATH = "/invite/welcome" as const;

/** The §C13 signed-leg query params (owned by the M1 `signed-invitation-url` helper — mirrored
 *  here only to DETECT signed mode; parsing/verification stays inside the M1 contract call). */
const SIGNED_LEG_PARAMS = ["n", "e", "s"] as const;

/**
 * Handle `GET /invite[?token=…[&n=…&e=…&s=…]]`: set the HttpOnly carriage cookie (bare mode, or
 * signed mode on a valid one-time redemption) and redirect to the token-free landing. `no-store`
 * on the redirect — a token-bearing URL response never enters any cache tier (the Doc-5C G-3
 * posture applied protectively).
 */
export async function handleInviteIngress(request: Request): Promise<Response> {
  const url = new URL(request.url);

  const response = NextResponse.redirect(new URL(INVITE_LANDING_PATH, url.origin), 303);
  response.headers.set("Cache-Control", "no-store");

  const signedMode = SIGNED_LEG_PARAMS.some((p) => url.searchParams.get(p) !== null);

  if (signedMode) {
    // §C13 one-time/TTL redemption at the boundary. Every failure cause collapses uniformly to
    // "no cookie, same redirect" — the raw token/params are never logged, never echoed.
    const outcome = await redeemSignedInvitationUrl(request.url);
    if (outcome.valid) {
      response.cookies.set(INVITE_TOKEN_COOKIE_NAME, outcome.token, inviteTokenCookieOptions());
    }
    return response;
  }

  const token = url.searchParams.get("token");
  if (token !== null && token.length > 0) {
    response.cookies.set(INVITE_TOKEN_COOKIE_NAME, token, inviteTokenCookieOptions());
  }
  return response;
}
