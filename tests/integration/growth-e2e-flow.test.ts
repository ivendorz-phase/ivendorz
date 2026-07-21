import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  allocateHumanReference,
  appendAuditRecord,
  configValueQuery,
  writeOutboxEvent,
} from "@/modules/core/contracts";
import {
  createInvitation,
  provisionIdentity,
  redeemSignedInvitationUrl,
  resolveInvitationToken,
  INVITATION_CONVERTED_EVENT,
  INVITATION_ISSUED_EVENT,
} from "@/modules/identity/contracts";
import {
  dispatchInvitationDelivery,
  retryInvitationDelivery,
  type DeliveryDispatchRequest,
  type DeliveryProviderTransport,
} from "@/modules/communication/contracts";
import { trackReferralFromEvent } from "@/modules/billing/contracts";
import { handleInviteIngress, INVITE_LANDING_PATH } from "@/server/auth/invite-ingress";
import { INVITE_TOKEN_COOKIE_NAME } from "@/server/auth/invite-token-cookie";
import { ensureProvisioned } from "../../src/server/auth";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// Lane C — the Growth Hub END-TO-END composition proof (integration branch; assembly-only scope).
// Proves the FULL folded flow composes across the three merged owner branches using REAL
// commands/contracts only: issue (M1) → deliver (M6, `outbox/InvitationIssued`) → land/redeem
// (§C13 one-time signed URL) → resolve → register/convert (M1 §PROV-EXT) → track referral
// (M7, `outbox/InvitationConverted`) → GI-1 capacity fail-open. The Inngest broker is SIMULATED
// by invoking the consumer-side commands directly with the persisted outbox rows' payloads —
// the transport namespace mapping (`outbox/<EventName>` → payload_jsonb verbatim) is
// string-level (see `inngest/functions/dispatch-invitation-delivery.ts` /
// `track-referral-on-invitation-converted.ts`, mirrored here field-for-field).
//
// Boundary-legal: imports only `@/modules/*/contracts`, `src/server` (composition edge) and
// `src/shared/*` — never a module internal. Shared-Postgres hygiene: FULL uuidv7 fixtures
// (never sliced); assertions scoped to fixture-owned rows — never global counts. Raw tokens and
// recipient addresses exist only in test memory and assertions; they are never logged.

const TEST_STORE_KEY = randomBytes(32).toString("hex");
const CAMPAIGN_KEY = "referral" as const; // the corpus-grounded MVP campaign key (Doc-7E §2(a))

/** A capture transport (the B2-4 provider seam) — records hand-offs; never logs anything. */
function captureTransport(): {
  calls: DeliveryDispatchRequest[];
  transport: DeliveryProviderTransport;
} {
  const calls: DeliveryDispatchRequest[] = [];
  return {
    calls,
    transport: async (request) => {
      calls.push(request);
    },
  };
}

describe("Growth Hub E2E — issue → deliver → redeem → register → convert → referral (Lane C)", () => {
  beforeAll(() => {
    process.env.GROWTH_INVITE_DELIVERY_STORE_KEY = TEST_STORE_KEY;
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("composes the full folded flow over the real contracts, with one-time redemption and GI-1 fail-open", async () => {
    // ── (1) ISSUE — `create_invitation` (targeted email; the real §C13 issuing txn). ──────────
    const referrer = await ensureProvisioned({
      authUserId: uuidv7(),
      email: `referrer-${uuidv7()}@example.com`,
    });
    expect(referrer.organizationId).not.toBeNull();
    const referrerOrgId = referrer.organizationId as string;
    const recipientEmail = `invitee-${uuidv7()}@example.com`;

    const issued = await prisma.$transaction((tx) =>
      createInvitation(
        { campaignKey: CAMPAIGN_KEY, recipientType: "email", recipientIdentifier: recipientEmail },
        { userId: referrer.userId, activeOrgId: referrerOrgId },
        {
          appendAuditRecord,
          writeOutboxEvent,
          configValueQuery,
          authorize: async () => ({ decision: "allow", satisfiedBy: "membership" }),
        },
        tx,
      ),
    );
    expect(issued.ok).toBe(true);
    if (!issued.ok) throw new Error("create_invitation failed");
    const invitationId = issued.result.growthInvitationId;
    const rawToken = issued.result.token;

    // Invitation row — targeted email is SINGLE-CAPACITY (`max_redemptions` = 1 targeted).
    const invitation = await prisma.growthInvitation.findUnique({ where: { id: invitationId } });
    expect(invitation).not.toBeNull();
    expect(invitation!.state).toBe("issued");
    expect(invitation!.recipientType).toBe("email");
    expect(invitation!.maxRedemptions).toBe(1);
    expect(invitation!.redemptionCount).toBe(0);

    // `InvitationIssued` outbox row (thin payload + producer-stamped envelope).
    const issuedRow = await prisma.outboxEvent.findFirst({
      where: { eventName: INVITATION_ISSUED_EVENT.name, aggregateId: invitationId },
    });
    expect(issuedRow).not.toBeNull();
    expect(issuedRow!.status).toBe("pending");
    const issuedPayload = issuedRow!.payloadJsonb as Record<string, unknown>;
    expect(issuedPayload["event_id"]).toBe(issuedRow!.id); // envelope stamped by the producer
    expect(typeof issuedPayload["delivery_reference_id"]).toBe("string");
    expect(issuedPayload["recipient_identifier"]).toBeUndefined(); // GI-3 thin payload
    expect(JSON.stringify(issuedPayload)).not.toContain(rawToken); // no token in any event
    const deliveryReferenceId = issuedPayload["delivery_reference_id"] as string;

    // §C13 secure-store leg: the delivery SECRET (ciphertext + nonce) was written in the SAME
    // issuing txn — and the raw token itself is never persisted (GI-2 parity).
    const secret = await prisma.invitationDeliverySecret.findUnique({
      where: { deliveryReferenceId },
    });
    expect(secret).not.toBeNull();
    expect(secret!.tokenCiphertext.length).toBeGreaterThan(0);
    expect(secret!.tokenNonce.length).toBeGreaterThan(0);
    expect(secret!.tokenCiphertext).not.toContain(rawToken);

    // ── (2) DELIVER — feed the persisted payload to the M6 consumer command (broker simulated;
    //        the string-level `outbox/InvitationIssued` mapping mirrored field-for-field). ─────
    const capture = captureTransport();
    const dispatched = await dispatchInvitationDelivery(
      {
        eventId: String(issuedPayload["event_id"]),
        occurredAt:
          typeof issuedPayload["occurred_at"] === "string"
            ? issuedPayload["occurred_at"]
            : undefined,
        growthInvitationId: String(issuedPayload["growth_invitation_id"]),
        recipientType: String(issuedPayload["recipient_type"]),
        deliveryReferenceId: String(issuedPayload["delivery_reference_id"]),
      },
      { transport: capture.transport },
    );
    expect(dispatched.ok).toBe(true);
    if (!dispatched.ok) throw new Error("dispatch failed");
    expect(dispatched.result.channel).toBe("email");

    // Queued channel-log row keyed by the consumed event id (`source_event_id = event_id`).
    const emailLog = await prisma.emailLog.findFirst({
      where: { sourceEventId: issuedRow!.id },
    });
    expect(emailLog).not.toBeNull();
    expect(emailLog!.status).toBe("queued");
    expect(emailLog!.recipientRef).toBe(recipientEmail); // GI-3: the ONE sanctioned landing surface

    // The captured signed URL carries the raw token + the three §C13 signed legs (`n`/`e`/`s` —
    // the signed-URL helper's param set; full verification is proven via redemption below).
    expect(capture.calls).toHaveLength(1);
    const signedUrl = capture.calls[0]!.signedInvitationUrl;
    const parsed = new URL(signedUrl);
    expect(parsed.pathname).toBe("/invite");
    expect(parsed.searchParams.get("token")).toBe(rawToken);
    expect(parsed.searchParams.get("n")).not.toBeNull();
    expect(Number.isInteger(Number(parsed.searchParams.get("e")))).toBe(true);
    expect(parsed.searchParams.get("s")).not.toBeNull();

    // ── (3) REDEEM — first redemption ok; replay uniformly invalid (ONE-TIME proven). ─────────
    const firstRedemption = await redeemSignedInvitationUrl(signedUrl);
    expect(firstRedemption.valid).toBe(true);
    if (firstRedemption.valid) expect(firstRedemption.token).toBe(rawToken);

    const replayRedemption = await redeemSignedInvitationUrl(signedUrl);
    expect(replayRedemption).toEqual({ valid: false }); // anti-oracle uniform shape

    // ── (3b) INGRESS (the Lane-C step-4 wiring) — a FRESH signed URL (minted by the guarded
    //         retry: `failed → queued` re-resolves the live invitation) redeems AT THE BOUNDARY:
    //         cookie set with the raw token + token-free redirect; replaying the SAME URL at the
    //         ingress → NO cookie, SAME redirect (the §C13 one-time property holds at `/invite`).
    await prisma.emailLog.updateMany({ where: { id: emailLog!.id }, data: { status: "failed" } });
    const retryCapture = captureTransport();
    const retried = await retryInvitationDelivery(
      { channel: "email", deliveryLogId: emailLog!.id },
      { transport: retryCapture.transport },
    );
    expect(retried.ok).toBe(true);
    expect(retryCapture.calls).toHaveLength(1);
    const freshSignedUrl = retryCapture.calls[0]!.signedInvitationUrl;
    expect(freshSignedUrl).not.toBe(signedUrl); // never the stale URL

    const ingressOrigin = "https://ivendorz.example";
    const ingressUrl = new URL(freshSignedUrl);
    const ingressRequest = new Request(
      `${ingressOrigin}${ingressUrl.pathname}${ingressUrl.search}`,
    );
    const ingressResponse = await handleInviteIngress(ingressRequest);
    expect(ingressResponse.status).toBe(303);
    expect(ingressResponse.headers.get("location")).toBe(`${ingressOrigin}${INVITE_LANDING_PATH}`);
    const ingressCookie = ingressResponse.headers.get("set-cookie");
    expect(ingressCookie).not.toBeNull();
    expect(ingressCookie!.includes(`${INVITE_TOKEN_COOKIE_NAME}=${rawToken}`)).toBe(true);

    const ingressReplay = await handleInviteIngress(ingressRequest.clone() as Request);
    expect(ingressReplay.status).toBe(303); // same observable redirect — anti-oracle
    expect(ingressReplay.headers.get("location")).toBe(`${ingressOrigin}${INVITE_LANDING_PATH}`);
    expect(ingressReplay.headers.get("set-cookie")).toBeNull(); // but NO carriage — one-time held

    // ── (4) RESOLVE — the raw token still resolves live (redemption consumes the URL nonce,
    //        never the invitation itself). ────────────────────────────────────────────────────
    const resolved = await resolveInvitationToken({ token: rawToken });
    expect(resolved.valid).toBe(true);
    expect(resolved.campaignKey).toBe(CAMPAIGN_KEY);

    // ── (5) REGISTER/CONVERT — `provisionIdentity` (§PROV-EXT; deps injected). ────────────────
    const referred = await provisionIdentity(
      {
        authUserId: uuidv7(),
        email: `referred-${uuidv7()}@example.com`,
        referralToken: rawToken,
      },
      { allocateHumanReference, writeOutboxEvent, appendAuditRecord },
    );
    expect(referred.created).toBe(true);
    expect(referred.organizationId).not.toBeNull();
    const referredOrgId = referred.organizationId as string;

    const conversion = await prisma.invitationConversion.findFirst({
      where: { growthInvitationId: invitationId },
    });
    expect(conversion).not.toBeNull();
    expect(conversion!.state).toBe("registered");
    expect(conversion!.referrerOrganizationId).toBe(referrerOrgId);
    expect(conversion!.referredOrganizationId).toBe(referredOrgId);

    const convertedRow = await prisma.outboxEvent.findFirst({
      where: { eventName: INVITATION_CONVERTED_EVENT.name, aggregateId: invitationId },
    });
    expect(convertedRow).not.toBeNull();
    const convertedPayload = convertedRow!.payloadJsonb as Record<string, unknown>;
    expect(convertedPayload["event_id"]).toBe(convertedRow!.id);
    expect(convertedPayload["referrer_organization_id"]).toBe(referrerOrgId);
    expect(convertedPayload["referred_organization_id"]).toBe(referredOrgId);

    // ── (6) TRACK — feed the `InvitationConverted` payload to the M7 consumer command (broker
    //        simulated; the string-level `outbox/InvitationConverted` mapping mirrored). ───────
    const trackInput = {
      referrerOrganizationId: String(convertedPayload["referrer_organization_id"]),
      referredOrganizationId: String(convertedPayload["referred_organization_id"]),
      sourceEventId: String(convertedPayload["event_id"]),
    };
    const tracked = await trackReferralFromEvent(trackInput, { appendAuditRecord });
    expect(tracked.ok).toBe(true);
    if (!tracked.ok) throw new Error("track_referral failed");
    expect(tracked.result.state).toBe("pending"); // the frozen stage-6 entry state

    const referralRow = await prisma.referral.findUnique({
      where: { id: tracked.result.referralId },
    });
    expect(referralRow).not.toBeNull();
    expect(referralRow!.state).toBe("pending");
    expect(referralRow!.referrerOrganizationId).toBe(referrerOrgId);
    expect(referralRow!.referredOrganizationId).toBe(referredOrgId);

    // System-actor audit (`referral_tracked` — never invented; §HB-6.2 binding unchanged).
    const referralAudit = await prisma.auditRecord.findFirst({
      where: { entityId: tracked.result.referralId, action: "referral_tracked" },
      select: { actorType: true, actorId: true, entityType: true, organizationId: true },
    });
    expect(referralAudit).toEqual({
      actorType: "system",
      actorId: null,
      entityType: "referrals",
      organizationId: referrerOrgId,
    });

    // Replay (at-least-once re-delivery, same event_id) → SAME referral; one row, one audit.
    const trackedReplay = await trackReferralFromEvent(trackInput, { appendAuditRecord });
    expect(trackedReplay.ok).toBe(true);
    if (!trackedReplay.ok) throw new Error("track_referral replay failed");
    expect(trackedReplay.result.referralId).toBe(tracked.result.referralId);
    expect(
      await prisma.referral.count({
        where: { referrerOrganizationId: referrerOrgId, referredOrganizationId: referredOrgId },
      }),
    ).toBe(1);
    expect(
      await prisma.auditRecord.count({
        where: { entityId: tracked.result.referralId, action: "referral_tracked" },
      }),
    ).toBe(1);

    // ── (7) GI-1 — a SECOND conversion attempt against the same single-capacity invitation:
    //        registration succeeds (fail-open), NO second conversion/event; counter untouched. ─
    const second = await provisionIdentity(
      {
        authUserId: uuidv7(),
        email: `referred-${uuidv7()}@example.com`,
        referralToken: rawToken,
      },
      { allocateHumanReference, writeOutboxEvent, appendAuditRecord },
    );
    expect(second.created).toBe(true);
    expect(second.organizationId).not.toBeNull();

    expect(
      await prisma.invitationConversion.count({ where: { growthInvitationId: invitationId } }),
    ).toBe(1); // still exactly the first conversion
    expect(
      await prisma.outboxEvent.count({
        where: { eventName: INVITATION_CONVERTED_EVENT.name, aggregateId: invitationId },
      }),
    ).toBe(1); // no second InvitationConverted
    expect(
      (await prisma.growthInvitation.findUnique({ where: { id: invitationId } }))!.redemptionCount,
    ).toBe(1); // the GI-1 ceiling held
  });
});
