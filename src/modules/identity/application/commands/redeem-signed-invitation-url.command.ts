// M1 application (PRIVATE) — the §C13 signed-URL REDEMPTION / replay guard (W3-COMM-GRW-1 B2-2).
// Realizes the Doc-6C v1.0.4 §5 one-time leg: the signed-URL nonce is "consumed on first
// redemption — the replay guard"; the URL is short-lived (`identity.growth_invite_delivery_url_ttl`)
// and single-use (Doc-4C v1.0.3 §C13: "single-use / replay-guarded").
//
// CALLER: the invite ingress seam (`/invite` — the Lane-A URL-redacting route resolves the landing
// server-side; wiring this guard into that ingress is Lane-C integration scope — until then the
// guard is the M1-owned redemption primitive its tests prove). NEVER a public wire row.
//
// ANTI-ORACLE (the resolve-token uniform-invalid precedent): every failure — malformed URL, bad
// signature, expired, already consumed, unknown nonce — collapses to ONE `{valid:false}` shape.
// On success the RAW TOKEN carried by the URL is returned to the ingress caller for the HttpOnly
// cookie carriage (the sanctioned clicked-URL hop) — never logged, never persisted here.
//
// OPERATIONAL WRITE ONLY: consuming the nonce mutates §10.3-class operational state (never a Doc-2
// aggregate; no state machine touched) — no audit action exists or is invented for it (Doc-2 §9
// untouched); the business-facts trail is untouched.

import { prisma } from "../../../../shared/db";
import {
  parseSignedInvitationUrl,
  verifySignedInvitationUrlParams,
} from "../../infrastructure/security/signed-invitation-url";
import { DeliveryStoreKeyUnavailableError } from "../../infrastructure/security/invitation-delivery-cipher";
import { consumeUrlNonce } from "../../infrastructure/data/invitation-delivery-store.repository";
import type { RedeemSignedInvitationUrlOutcome } from "../../contracts/types";

/**
 * Redeem a signed invitation URL exactly once: verify the HMAC signature + expiry, then atomically
 * consume the one-time nonce. `{valid:true, token}` iff THIS call is the first, in-TTL, correctly
 * signed redemption; uniformly `{valid:false}` otherwise (no cause disclosure).
 */
export async function redeemSignedInvitationUrl(
  urlString: string,
  db: typeof prisma = prisma,
): Promise<RedeemSignedInvitationUrlOutcome> {
  const params = parseSignedInvitationUrl(urlString);
  if (params === null) return { valid: false };

  // TTL leg (short-lived — §C13): the stamped expiry gates before any store touch.
  if (params.expiresEpochSeconds * 1000 <= Date.now()) return { valid: false };

  // Signature leg (the derived URL-signing key; constant-time compare). A missing/malformed store
  // key is a service condition — uniform invalid (never an oracle, never a key disclosure).
  try {
    if (!verifySignedInvitationUrlParams(params)) return { valid: false };
  } catch (e) {
    if (e instanceof DeliveryStoreKeyUnavailableError) return { valid: false };
    throw e;
  }

  // One-time leg: atomic consume (unconsumed AND unexpired) under the service-lane context.
  const consumed = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    return consumeUrlNonce(params.nonceId, tx);
  });
  if (!consumed) return { valid: false };

  return { valid: true, token: params.token };
}
