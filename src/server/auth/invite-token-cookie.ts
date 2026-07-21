// App-layer auth wiring (REPOSITORY_STRUCTURE §5) — the growth-invitation token carriage cookie
// (P2-A2/P2-A3; Doc-7E_GrowthHub_Patch_v1.0.1 §2(b): "the token is carried through the
// registration flow state so provisioning can bind attribution").
//
// TOKEN HYGIENE (binding — Doc-5C v1.0.1 §3/G-6; strict-conformance ruling): the raw invitation
// token is a BEARER CREDENTIAL. It is carried ONLY in this HttpOnly cookie between the `/invite`
// ingress and the provisioning attribution seam — never logged, never persisted to any table
// (only sha256(token) is ever compared server-side — GI-2), never left in a resting URL (the
// ingress redirect strips it), never readable by client JS (HttpOnly), never sent to analytics.
// The cookie maxAge is a CARRIAGE bound only — real validity is always re-checked server-side
// (resolve query / the GI-1 guard); an expired-but-cookied token simply never binds (§PROV-EXT
// fail-open).
//
// Read/clear are GUARDED fail-open: `cookies()` throws outside a Next request scope (e.g. the
// vitest harness) and cookie MUTATION is admitted only in Route Handlers / Server Actions — a
// disallowed context (RSC) swallows the clear; the bounded maxAge and the next route-handler
// touch own the residue. Never a throw path into provisioning (registration never fails on
// token grounds).

import { cookies } from "next/headers";

/** The HttpOnly carriage cookie name (P2-A2 — implementation scope; coins no contract). */
export const INVITE_TOKEN_COOKIE_NAME = "iv_invite_token" as const;

/** Carriage bound only (14 days) — never the token's validity (that is POLICY + server-checked). */
export const INVITE_TOKEN_COOKIE_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;

/** The cookie attribute set (HttpOnly · Secure in prod · SameSite=Lax · Path=/ · bounded maxAge). */
export function inviteTokenCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: INVITE_TOKEN_COOKIE_MAX_AGE_SECONDS,
  };
}

/**
 * Read the carried raw invitation token server-side (landing page + provisioning seam). Fail-open:
 * outside a request scope, or with no/empty cookie, resolves `null` (no token → no bind — never an
 * error path). The value is returned to the caller and NEVER logged here.
 */
export async function readInviteTokenCookie(): Promise<string | null> {
  try {
    const store = await cookies();
    const value = store.get(INVITE_TOKEN_COOKIE_NAME)?.value;
    return value !== undefined && value.length > 0 ? value : null;
  } catch {
    return null; // no request scope (e.g. test harness) — fail-open, no token
  }
}

/**
 * Best-effort clear of the carriage cookie after a provisioning attempt (P2-A3 — "the token does
 * not linger"). Cookie mutation is only admitted in Route Handlers / Server Actions; a disallowed
 * context (RSC) swallows the failure — the bounded maxAge and the next mutable-context touch own
 * the residue. Returns whether the clear took effect (diagnostic only; never throws).
 */
export async function clearInviteTokenCookie(): Promise<boolean> {
  try {
    const store = await cookies();
    if (store.get(INVITE_TOKEN_COOKIE_NAME) === undefined) return true;
    store.delete(INVITE_TOKEN_COOKIE_NAME);
    return true;
  } catch {
    return false; // read-only / out-of-scope context — fail-open
  }
}
