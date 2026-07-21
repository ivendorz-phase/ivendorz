// M1 infrastructure (PRIVATE) — the §C13 secure-delivery-store persistence (W3-COMM-GRW-1 B2-2;
// the `identity_growth_delivery_store` migration's two §10.3-class OPERATIONAL tables, riding the
// Doc-6C v1.0.4 §5 `[ESC-6-API]` store-shape marker):
//   • `identity.invitation_delivery_secrets` — token ciphertext + AES-GCM nonce (written ONCE, in
//     the `create_invitation` issuing txn; targeted invitations only).
//   • `identity.invitation_delivery_url_nonces` — the one-time signed-URL replay state (minted per
//     resolve; consumed atomically on first redemption).
// Staff-GUC-only RLS on both (service plumbing — GI-3; the caller supplies an executor already
// carrying the service-lane context). NOT Doc-2 aggregates; regenerable operational state.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";

/** Persist the token ciphertext + nonce for a delivery reference (issuing-txn leg; write-once). */
export async function persistDeliverySecret(
  input: { deliveryReferenceId: string; ciphertext: string; nonce: string },
  db: DbExecutor = prisma,
): Promise<void> {
  await db.invitationDeliverySecret.create({
    data: {
      deliveryReferenceId: input.deliveryReferenceId,
      tokenCiphertext: input.ciphertext,
      tokenNonce: input.nonce,
    },
  });
}

/** Load the stored ciphertext + nonce for a delivery reference; `null` when absent (a pre-store
 *  P1 row — the resolve maps absence to the TRANSIENT unavailable code). */
export async function loadDeliverySecret(
  deliveryReferenceId: string,
  db: DbExecutor = prisma,
): Promise<{ tokenCiphertext: string; tokenNonce: string } | null> {
  const row = await db.invitationDeliverySecret.findUnique({
    where: { deliveryReferenceId },
    select: { tokenCiphertext: true, tokenNonce: true },
  });
  return row;
}

/** Mint one one-time signed-URL nonce row (per resolve — a fresh URL per mint; the stale one is
 *  never re-sent). Returns the nonce id (UUIDv7 — M0 ID discipline). */
export async function mintUrlNonce(
  input: { deliveryReferenceId: string; expiresAt: Date },
  db: DbExecutor = prisma,
): Promise<string> {
  const id = uuidv7();
  await db.invitationDeliveryUrlNonce.create({
    data: {
      id,
      deliveryReferenceId: input.deliveryReferenceId,
      expiresAt: input.expiresAt,
    },
  });
  return id;
}

/**
 * Atomically consume a signed-URL nonce (the replay guard — Doc-6C v1.0.4 §5 "consumed on first
 * redemption"). `true` iff THIS call consumed it (unconsumed AND unexpired at consume time);
 * `false` for replay / expiry / unknown — uniformly.
 */
export async function consumeUrlNonce(nonceId: string, db: DbExecutor = prisma): Promise<boolean> {
  const updated = await db.invitationDeliveryUrlNonce.updateMany({
    where: { id: nonceId, consumedAt: null, expiresAt: { gt: new Date() } },
    data: { consumedAt: new Date() },
  });
  return updated.count === 1;
}
