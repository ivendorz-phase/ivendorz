// M1 infrastructure (PRIVATE) — the §C13 secure-delivery-store CIPHER + signed-URL SIGNER
// (W3-COMM-GRW-1 B2-2; the P1 Board carry). Semantics are PINNED upstream (Doc-4C v1.0.3 §C13:
// short-lived / one-time / replay-guarded signed URL; Doc-6C v1.0.4 §5 `[ESC-6-API]` store-shape
// marker; Doc-3 v1.14 key 6 `identity.growth_invite_delivery_url_ttl`) — this file only realizes
// the crypto mechanics.
//
// HARD RULES (strict-conformance ruling — binding):
//   • The raw invitation token is NEVER persisted in plaintext, NEVER logged, and NEVER returned
//     to any caller other than inside the signed URL handed to M6 (the GI-3 delivery exception).
//   • The key comes from ENV (`GROWTH_INVITE_DELIVERY_STORE_KEY` — 32 bytes, base64 or hex) and is
//     never logged, never persisted, never surfaced in an error message.
//   • AES-256-GCM with a fresh random 12-byte IV per encryption (the stored `token_nonce`);
//     ciphertext||authTag is stored base64. Decryption failure discloses NOTHING token-shaped.
//   • The URL-signing key is DERIVED from the store key (HMAC-SHA256 domain separation) — one env
//     secret, two purposes, no raw-key reuse across primitives.

import { createCipheriv, createDecipheriv, createHmac, createHash, randomBytes } from "node:crypto";

/** The env var carrying the 32-byte store key (base64 or hex). Never logged. */
export const DELIVERY_STORE_KEY_ENV = "GROWTH_INVITE_DELIVERY_STORE_KEY" as const;

const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;
const URL_SIGN_DOMAIN = "ivz-growth-invite-url-sign-v1";

/** Thrown when the store key env is absent/malformed — a SERVICE-side condition (the caller maps
 *  it to the transient `identity_growth_invite_delivery_unavailable`, never a token leak). */
export class DeliveryStoreKeyUnavailableError extends Error {
  constructor() {
    super("The invitation delivery store key is not available."); // no key material, ever
    this.name = "DeliveryStoreKeyUnavailableError";
  }
}

/** Resolve the 32-byte store key from env (base64 or hex). Throws `DeliveryStoreKeyUnavailableError`
 *  when absent or not decodable to exactly 32 bytes. The key value is never logged. */
function storeKey(): Buffer {
  const raw = process.env[DELIVERY_STORE_KEY_ENV];
  if (raw === undefined || raw.length === 0) throw new DeliveryStoreKeyUnavailableError();
  // hex (64 chars) first, then base64 — both decode paths verified to 32 bytes.
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  const b64 = Buffer.from(raw, "base64");
  if (b64.length === 32) return b64;
  throw new DeliveryStoreKeyUnavailableError();
}

/** The derived URL-signing key (domain-separated from the cipher key). */
function urlSignKey(): Buffer {
  return createHash("sha256").update(storeKey()).update(":").update(URL_SIGN_DOMAIN).digest();
}

/** Encrypt the raw invitation token for the secure store. Returns base64 `ciphertext` (ct||tag)
 *  + base64 `nonce` (the fresh GCM IV). Called ONLY by the create-invitation issuing txn. */
export function encryptInvitationToken(rawToken: string): { ciphertext: string; nonce: string } {
  const iv = randomBytes(GCM_IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", storeKey(), iv);
  const ct = Buffer.concat([cipher.update(rawToken, "utf8"), cipher.final(), cipher.getAuthTag()]);
  return { ciphertext: ct.toString("base64"), nonce: iv.toString("base64") };
}

/** Decrypt a stored token ciphertext. Returns the raw token, or `null` on any failure
 *  (bad tag / truncated / wrong key) — no partial plaintext, nothing logged. Called ONLY inside
 *  the delivery-payload resolve (M6 sole caller) for signed-URL minting. */
export function decryptInvitationToken(ciphertext: string, nonce: string): string | null {
  try {
    const ct = Buffer.from(ciphertext, "base64");
    if (ct.length <= GCM_TAG_BYTES) return null;
    const iv = Buffer.from(nonce, "base64");
    const body = ct.subarray(0, ct.length - GCM_TAG_BYTES);
    const tag = ct.subarray(ct.length - GCM_TAG_BYTES);
    const decipher = createDecipheriv("aes-256-gcm", storeKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  } catch (e) {
    if (e instanceof DeliveryStoreKeyUnavailableError) throw e; // service condition — caller maps
    return null; // integrity failure — uniform null, nothing disclosed
  }
}

/** Compute the signed-URL signature over (nonceId, expiresEpochSeconds, rawToken) — base64url. */
export function signInvitationUrlParams(
  nonceId: string,
  expiresEpochSeconds: number,
  rawToken: string,
): string {
  return createHmac("sha256", urlSignKey())
    .update(`${nonceId}.${expiresEpochSeconds}.${rawToken}`)
    .digest("base64url");
}

/** Constant-length signature comparison (both sides re-derived to buffers; length mismatch = false). */
export function verifyInvitationUrlSignature(
  nonceId: string,
  expiresEpochSeconds: number,
  rawToken: string,
  signature: string,
): boolean {
  const expected = signInvitationUrlParams(nonceId, expiresEpochSeconds, rawToken);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  // timing-safe compare without importing timingSafeEqual's throw-on-length semantics
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}
