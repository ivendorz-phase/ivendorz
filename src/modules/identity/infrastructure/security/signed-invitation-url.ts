// M1 infrastructure (PRIVATE) — the §C13 `signed_invitation_url` BUILD/PARSE mechanics
// (W3-COMM-GRW-1 B2-2). The URL targets the Lane-A ingress `GET /invite?token=…` (the Doc-5C
// v1.0.1 §3 clicked-URL shape realized by `app/(public)/invite/route.ts` — `token` is the raw
// invitation token the ingress moves into the HttpOnly carriage cookie). The §C13 short-lived /
// one-time / replay-guard legs ride three ADDITIONAL query params the ingress transparently
// ignores today and the redemption guard verifies:
//   `n` — the minted one-time nonce id (`identity.invitation_delivery_url_nonces.id`),
//   `e` — the expiry (epoch seconds; mint-time + `identity.growth_invite_delivery_url_ttl`),
//   `s` — HMAC-SHA256 over (n, e, token) with the derived URL-signing key.
// `redeemSignedInvitationUrl` (application) verifies s + e and atomically consumes n — the
// Doc-6C v1.0.4 §5 "consumed on first redemption" replay guard.

import {
  signInvitationUrlParams,
  verifyInvitationUrlSignature,
} from "./invitation-delivery-cipher";

/** The Lane-A ingress path (the clicked-URL shape — Doc-5C v1.0.1 §3 / `app/(public)/invite`). */
export const INVITE_INGRESS_PATH = "/invite" as const;

/** The platform base URL for outbound links (the `app/layout.tsx` metadataBase convention). */
export function inviteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://ivendorz.com";
}

/** The parsed signed-URL parameter set (raw token + the three signature legs). */
export interface SignedInvitationUrlParams {
  token: string;
  nonceId: string;
  expiresEpochSeconds: number;
  signature: string;
}

/** Build the signed invitation URL (mint side — called ONLY by the delivery-payload resolve). */
export function buildSignedInvitationUrl(params: {
  rawToken: string;
  nonceId: string;
  expiresEpochSeconds: number;
}): string {
  const url = new URL(INVITE_INGRESS_PATH, inviteBaseUrl());
  url.searchParams.set("token", params.rawToken);
  url.searchParams.set("n", params.nonceId);
  url.searchParams.set("e", String(params.expiresEpochSeconds));
  url.searchParams.set(
    "s",
    signInvitationUrlParams(params.nonceId, params.expiresEpochSeconds, params.rawToken),
  );
  return url.toString();
}

/** Parse a signed invitation URL back to its parameter set; `null` when any leg is absent or
 *  malformed (uniform — no distinguishing detail). */
export function parseSignedInvitationUrl(urlString: string): SignedInvitationUrlParams | null {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }
  const token = url.searchParams.get("token");
  const nonceId = url.searchParams.get("n");
  const expires = url.searchParams.get("e");
  const signature = url.searchParams.get("s");
  if (token === null || nonceId === null || expires === null || signature === null) return null;
  const expiresEpochSeconds = Number(expires);
  if (!Number.isInteger(expiresEpochSeconds) || expiresEpochSeconds <= 0) return null;
  return { token, nonceId, expiresEpochSeconds, signature };
}

/** Verify the signature leg of a parsed signed URL (constant-time HMAC compare). */
export function verifySignedInvitationUrlParams(params: SignedInvitationUrlParams): boolean {
  return verifyInvitationUrlSignature(
    params.nonceId,
    params.expiresEpochSeconds,
    params.token,
    params.signature,
  );
}
