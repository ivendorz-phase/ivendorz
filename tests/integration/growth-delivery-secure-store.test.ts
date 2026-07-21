import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appendAuditRecord, configValueQuery, writeOutboxEvent } from "@/modules/core/contracts";
import {
  createInvitation,
  redeemSignedInvitationUrl,
  resolveInvitationDeliveryPayload,
  INVITATION_ISSUED_EVENT,
} from "@/modules/identity/contracts";
import { ensureProvisioned } from "../../src/server/auth";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// W3-COMM-GRW-1 (B2-2) — the M1 §C13 SECURE DELIVERY STORE round-trip (Doc-4C v1.0.3 §C13
// semantics: short-lived / ONE-TIME / replay-guarded signed URL; TTL = the seeded 15m
// `identity.growth_invite_delivery_url_ttl` POLICY key; Doc-6C v1.0.4 §5 `[ESC-6-API]` store
// shape). Boundary-legal: imports only `@/modules/*/contracts`, `src/server` and `src/shared/*`.
// Shared-Postgres hygiene: FULL uuidv7 fixture values; assertions scoped to fixture-owned rows;
// no global counts. Raw tokens exist only in test memory/assertions — never logged.

// The store key is env-owned (never persisted/logged). Set BEFORE any create/resolve call; the
// cipher reads it lazily per call. Random per run — key material never shared across runs.
const TEST_STORE_KEY = randomBytes(32).toString("hex");

const CAMPAIGN_KEY = "referral" as const; // the corpus-grounded MVP campaign key

/** Provision a fresh referrer identity (personal org = the referrer org). */
async function seedReferrer(): Promise<{ userId: string; orgId: string }> {
  const provisioned = await ensureProvisioned({
    authUserId: uuidv7(),
    email: `referrer-${uuidv7()}@example.com`,
  });
  expect(provisioned.organizationId).not.toBeNull();
  return { userId: provisioned.userId, orgId: provisioned.organizationId as string };
}

/** Create a TARGETED invitation through the real §C13 create (authorize stubbed allow —
 *  membership-satisfied; the AUTHZ root itself is out of this slice's scope). Returns the raw
 *  token (GI-2: returned once), the invitation id, and the event-side handles. */
async function createTargetedInvitation(recipientEmail: string): Promise<{
  token: string;
  growthInvitationId: string;
  deliveryReferenceId: string;
  eventId: string;
}> {
  const { userId, orgId } = await seedReferrer();
  const outcome = await prisma.$transaction((tx) =>
    createInvitation(
      { campaignKey: CAMPAIGN_KEY, recipientType: "email", recipientIdentifier: recipientEmail },
      { userId, activeOrgId: orgId },
      {
        appendAuditRecord,
        writeOutboxEvent,
        configValueQuery,
        authorize: async () => ({ decision: "allow", satisfiedBy: "membership" }),
      },
      tx,
    ),
  );
  expect(outcome.ok).toBe(true);
  if (!outcome.ok) throw new Error("create failed");
  const growthInvitationId = outcome.result.growthInvitationId;

  const outboxRow = await prisma.outboxEvent.findFirst({
    where: { eventName: INVITATION_ISSUED_EVENT.name, aggregateId: growthInvitationId },
  });
  expect(outboxRow).not.toBeNull();
  const payload = outboxRow!.payloadJsonb as Record<string, unknown>;
  return {
    token: outcome.result.token,
    growthInvitationId,
    deliveryReferenceId: payload["delivery_reference_id"] as string,
    eventId: payload["event_id"] as string,
  };
}

describe("B2-2 §C13 secure delivery store (M1)", () => {
  beforeAll(() => {
    process.env.GROWTH_INVITE_DELIVERY_STORE_KEY = TEST_STORE_KEY;
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("create → ciphertext persisted (never plaintext) → resolve mints a signed URL carrying the raw token", async () => {
    const email = `invitee-${uuidv7()}@example.com`;
    const { token, deliveryReferenceId } = await createTargetedInvitation(email);

    // (1) The secret row exists in the SAME issuing txn's effect — ciphertext + nonce, and the
    //     plaintext token appears NOWHERE in it (never persisted in plaintext).
    const secret = await prisma.invitationDeliverySecret.findUnique({
      where: { deliveryReferenceId },
    });
    expect(secret).not.toBeNull();
    expect(secret!.tokenCiphertext).not.toContain(token);
    expect(secret!.tokenNonce.length).toBeGreaterThan(0);

    // (2) The mapping-only ref store is UNCHANGED in shape (mapping only — no token column).
    const ref = await prisma.invitationDeliveryRef.findUnique({ where: { deliveryReferenceId } });
    expect(ref).not.toBeNull();

    // (3) Resolve (M6 sole caller) → the full §C13 payload; the signed URL targets the Lane-A
    //     ingress and carries the RAW token + the signature legs.
    const resolved = await resolveInvitationDeliveryPayload({ deliveryReferenceId });
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.result.recipientType).toBe("email");
    expect(resolved.result.recipientIdentifier).toBe(email);
    const url = new URL(resolved.result.signedInvitationUrl);
    expect(url.pathname).toBe("/invite");
    expect(url.searchParams.get("token")).toBe(token);
    expect(url.searchParams.get("n")).not.toBeNull();
    expect(url.searchParams.get("e")).not.toBeNull();
    expect(url.searchParams.get("s")).not.toBeNull();

    // (4) The minted nonce row exists with a future POLICY-bound expiry (the seeded 15m TTL).
    const nonceId = url.searchParams.get("n") as string;
    const nonce = await prisma.invitationDeliveryUrlNonce.findUnique({ where: { id: nonceId } });
    expect(nonce).not.toBeNull();
    expect(nonce!.consumedAt).toBeNull();
    expect(nonce!.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // (5) A second resolve mints a FRESH URL (fresh nonce — the stale one is never re-sent).
    const resolvedAgain = await resolveInvitationDeliveryPayload({ deliveryReferenceId });
    expect(resolvedAgain.ok).toBe(true);
    if (!resolvedAgain.ok) return;
    expect(resolvedAgain.result.signedInvitationUrl).not.toBe(resolved.result.signedInvitationUrl);
  });

  it("signed URL is ONE-TIME (replay-guarded) and tamper-evident", async () => {
    const { token, deliveryReferenceId } = await createTargetedInvitation(
      `invitee-${uuidv7()}@example.com`,
    );
    const resolved = await resolveInvitationDeliveryPayload({ deliveryReferenceId });
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    const url = resolved.result.signedInvitationUrl;

    // First redemption → valid, surfaces the raw token (the HttpOnly cookie hop).
    const first = await redeemSignedInvitationUrl(url);
    expect(first).toEqual({ valid: true, token });

    // Replay of the SAME URL → uniformly invalid (consumed nonce).
    const replay = await redeemSignedInvitationUrl(url);
    expect(replay).toEqual({ valid: false });

    // A tampered URL (token substituted) → uniformly invalid (signature).
    const fresh = await resolveInvitationDeliveryPayload({ deliveryReferenceId });
    expect(fresh.ok).toBe(true);
    if (!fresh.ok) return;
    const tampered = new URL(fresh.result.signedInvitationUrl);
    tampered.searchParams.set("token", `ivz_inv_${uuidv7()}`);
    expect(await redeemSignedInvitationUrl(tampered.toString())).toEqual({ valid: false });
  });

  it("signed URL is SHORT-LIVED — an expired nonce/URL never redeems (POLICY TTL)", async () => {
    const { deliveryReferenceId } = await createTargetedInvitation(
      `invitee-${uuidv7()}@example.com`,
    );
    const resolved = await resolveInvitationDeliveryPayload({ deliveryReferenceId });
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    const url = new URL(resolved.result.signedInvitationUrl);
    const nonceId = url.searchParams.get("n") as string;

    // Force the nonce past its TTL (the store-side expiry gate — independent of the stamped `e`).
    await prisma.invitationDeliveryUrlNonce.update({
      where: { id: nonceId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect(await redeemSignedInvitationUrl(url.toString())).toEqual({ valid: false });
  });

  it("definitive vs transient split: revoked/expired/unknown → not_resolvable; missing secret → unavailable", async () => {
    // Revoked → DEFINITIVE (REFERENCE; M6 never re-queues).
    const revoked = await createTargetedInvitation(`invitee-${uuidv7()}@example.com`);
    await prisma.growthInvitation.update({
      where: { id: revoked.growthInvitationId },
      data: { state: "revoked" },
    });
    const revokedOutcome = await resolveInvitationDeliveryPayload({
      deliveryReferenceId: revoked.deliveryReferenceId,
    });
    expect(revokedOutcome.ok).toBe(false);
    if (revokedOutcome.ok) return;
    expect(revokedOutcome.error.errorClass).toBe("REFERENCE");
    expect(revokedOutcome.error.errorCode).toBe("identity_growth_invite_delivery_not_resolvable");

    // Expired (by timestamp — the self-sufficient expiry predicate) → DEFINITIVE.
    const expired = await createTargetedInvitation(`invitee-${uuidv7()}@example.com`);
    await prisma.growthInvitation.update({
      where: { id: expired.growthInvitationId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const expiredOutcome = await resolveInvitationDeliveryPayload({
      deliveryReferenceId: expired.deliveryReferenceId,
    });
    expect(expiredOutcome.ok).toBe(false);
    if (expiredOutcome.ok) return;
    expect(expiredOutcome.error.errorClass).toBe("REFERENCE");

    // Unknown reference → DEFINITIVE.
    const unknownOutcome = await resolveInvitationDeliveryPayload({
      deliveryReferenceId: uuidv7(),
    });
    expect(unknownOutcome.ok).toBe(false);
    if (unknownOutcome.ok) return;
    expect(unknownOutcome.error.errorClass).toBe("REFERENCE");

    // A resolvable ref WITHOUT a persisted secret (pre-store P1 residue) → TRANSIENT
    // (DEPENDENCY, retryable — the service cannot currently serve it; no oracle).
    const { userId, orgId } = await seedReferrer();
    void userId;
    const invitationId = uuidv7();
    await prisma.growthInvitation.create({
      data: {
        id: invitationId,
        referrerOrganizationId: orgId,
        campaignKey: CAMPAIGN_KEY,
        recipientType: "email",
        recipientIdentifier: `legacy-${uuidv7()}@example.com`,
        tokenHash: `hash-${uuidv7()}`, // FULL uuid — shared-DB uniqueness rule
        maxRedemptions: 1,
        state: "issued",
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });
    const bareRefId = uuidv7();
    await prisma.invitationDeliveryRef.create({
      data: { deliveryReferenceId: bareRefId, growthInvitationId: invitationId },
    });
    const bareOutcome = await resolveInvitationDeliveryPayload({
      deliveryReferenceId: bareRefId,
    });
    expect(bareOutcome.ok).toBe(false);
    if (bareOutcome.ok) return;
    expect(bareOutcome.error.errorClass).toBe("DEPENDENCY");
    expect(bareOutcome.error.errorCode).toBe("identity_growth_invite_delivery_unavailable");
  });
});
