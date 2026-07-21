import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appendAuditRecord, configValueQuery, writeOutboxEvent } from "@/modules/core/contracts";
import { createInvitation, INVITATION_ISSUED_EVENT } from "@/modules/identity/contracts";
import {
  dispatchInvitationDelivery,
  retryInvitationDelivery,
  type DeliveryDispatchRequest,
  type DeliveryProviderTransport,
} from "@/modules/communication/contracts";
import { ensureProvisioned } from "../../src/server/auth";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// W3-COMM-GRW-1 (B2-3/B2-5) — the M6 `comm.dispatch_invitation_delivery.v1` consumer effect
// (Doc-4H_GrowthDelivery_Patch_v1.0.1 §HB-3.6) + the §2 invitation retry guard, END-TO-END over
// the REAL M1 resolve + M0 audit/outbox contracts. Boundary-legal: imports only
// `@/modules/*/contracts`, `src/server`, `src/shared/*`. Shared-Postgres hygiene: FULL uuidv7
// fixtures; assertions scoped to fixture-owned rows; no global counts. Raw tokens/addresses exist
// only in test memory and assertions.

const TEST_STORE_KEY = randomBytes(32).toString("hex");
const CAMPAIGN_KEY = "referral" as const;

interface Fixture {
  token: string;
  growthInvitationId: string;
  recipientEmail: string;
  deliveryReferenceId: string;
  eventId: string;
}

/** A capture transport (B2-4 seam) — records hand-offs; never logs anything. */
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

/** Create a real targeted invitation (issuing txn writes ref + ciphertext + outbox envelope). */
async function seedDispatchableInvitation(): Promise<Fixture> {
  const provisioned = await ensureProvisioned({
    authUserId: uuidv7(),
    email: `referrer-${uuidv7()}@example.com`,
  });
  const recipientEmail = `invitee-${uuidv7()}@example.com`;
  const outcome = await prisma.$transaction((tx) =>
    createInvitation(
      { campaignKey: CAMPAIGN_KEY, recipientType: "email", recipientIdentifier: recipientEmail },
      { userId: provisioned.userId, activeOrgId: provisioned.organizationId as string },
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
  const outboxRow = await prisma.outboxEvent.findFirst({
    where: {
      eventName: INVITATION_ISSUED_EVENT.name,
      aggregateId: outcome.result.growthInvitationId,
    },
  });
  expect(outboxRow).not.toBeNull();
  const payload = outboxRow!.payloadJsonb as Record<string, unknown>;
  return {
    token: outcome.result.token,
    growthInvitationId: outcome.result.growthInvitationId,
    recipientEmail,
    deliveryReferenceId: payload["delivery_reference_id"] as string,
    eventId: payload["event_id"] as string,
  };
}

/** The thin consumed-event input (Doc-2 v1.0.10 §4 — verbatim field set). */
function thinInput(f: Fixture) {
  return {
    eventId: f.eventId,
    occurredAt: new Date().toISOString(),
    growthInvitationId: f.growthInvitationId,
    recipientType: "email",
    deliveryReferenceId: f.deliveryReferenceId,
  };
}

describe("B2-3 comm.dispatch_invitation_delivery.v1 (§HB-3.6) + B2-5 retry guard (§2)", () => {
  beforeAll(() => {
    process.env.GROWTH_INVITE_DELIVERY_STORE_KEY = TEST_STORE_KEY;
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("thin-payload consumption → queued row (source_event_id = event_id) + System audit + one provider hand-off; GI-3 holds", async () => {
    const f = await seedDispatchableInvitation();
    const { calls, transport } = captureTransport();

    const outcome = await dispatchInvitationDelivery(thinInput(f), { transport });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.channel).toBe("email");
    expect(outcome.result.deduplicated).toBe(false);

    // (1) The channel-log row at the frozen entry state `queued`, keyed by the consumed event id.
    const row = await prisma.emailLog.findFirst({ where: { sourceEventId: f.eventId } });
    expect(row).not.toBeNull();
    expect(row!.id).toBe(outcome.result.deliveryLogId);
    expect(row!.status).toBe("queued");
    expect(row!.recipientRef).toBe(f.recipientEmail); // GI-3: the ONE sanctioned landing surface
    expect(row!.recipientOrganizationId).toBeNull(); // external invitee — no tenant
    expect(row!.template.length).toBeGreaterThan(0);

    // (2) Exactly one provider hand-off, carrying the transient recipient + a FRESH signed URL
    //     whose token is the raw invitation token (fetched just-in-time — never from the event).
    expect(calls).toHaveLength(1);
    expect(calls[0]!.deliveryLogId).toBe(row!.id);
    expect(calls[0]!.recipientIdentifier).toBe(f.recipientEmail);
    const url = new URL(calls[0]!.signedInvitationUrl);
    expect(url.pathname).toBe("/invite");
    expect(url.searchParams.get("token")).toBe(f.token);

    // (3) The `[ESC-COMM-AUDIT]` record: System actor, entity_type=email_logs, in-transaction —
    //     and it carries NO recipient_identifier and NO signed URL (GI-3).
    const audits = await prisma.auditRecord.findMany({
      where: { entityId: row!.id, action: "invitation_delivery_dispatched" },
    });
    expect(audits).toHaveLength(1);
    expect(audits[0]!.actorType).toBe("system");
    expect(audits[0]!.actorId).toBeNull();
    expect(audits[0]!.entityType).toBe("email_logs");
    const serialized = JSON.stringify(audits[0]!.newValue) + JSON.stringify(audits[0]!.oldValue);
    expect(serialized).not.toContain(f.recipientEmail);
    expect(serialized).not.toContain(f.token);
    expect(serialized).not.toContain("/invite");
  });

  it("idempotent on event_id: re-delivery → same row, no duplicate row/audit/provider send", async () => {
    const f = await seedDispatchableInvitation();
    const first = captureTransport();
    const firstOutcome = await dispatchInvitationDelivery(thinInput(f), {
      transport: first.transport,
    });
    expect(firstOutcome.ok).toBe(true);
    if (!firstOutcome.ok) return;

    const replay = captureTransport();
    const replayOutcome = await dispatchInvitationDelivery(thinInput(f), {
      transport: replay.transport,
    });
    expect(replayOutcome.ok).toBe(true);
    if (!replayOutcome.ok) return;
    expect(replayOutcome.result.deduplicated).toBe(true);
    expect(replayOutcome.result.deliveryLogId).toBe(firstOutcome.result.deliveryLogId);
    expect(replay.calls).toHaveLength(0); // NO duplicate provider send

    const rows = await prisma.emailLog.findMany({ where: { sourceEventId: f.eventId } });
    expect(rows).toHaveLength(1); // NO duplicate row (scoped to this fixture's event)
    const audits = await prisma.auditRecord.findMany({
      where: {
        entityId: firstOutcome.result.deliveryLogId,
        action: "invitation_delivery_dispatched",
      },
    });
    expect(audits).toHaveLength(1); // NO duplicate audit
  });

  it("definitive not_resolvable (unknown ref) → terminal no-dispatch: retryable:false, NO row, no send", async () => {
    const eventId = uuidv7();
    const { calls, transport } = captureTransport();
    const outcome = await dispatchInvitationDelivery(
      {
        eventId,
        growthInvitationId: uuidv7(),
        recipientType: "email",
        deliveryReferenceId: uuidv7(), // unknown — the M1 DEFINITIVE register leg
      },
      { transport },
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.error.errorClass).toBe("REFERENCE");
    expect(outcome.error.errorCode).toBe("identity_growth_invite_delivery_not_resolvable");
    expect(outcome.error.retryable).toBe(false);
    expect(calls).toHaveLength(0);
    expect(await prisma.emailLog.findFirst({ where: { sourceEventId: eventId } })).toBeNull();
  });

  it("transient unavailable → DEPENDENCY retryable:true, NO row; provider outage → rollback (no row/audit)", async () => {
    // (a) Transient M1 resolve (stubbed by the SAME contract type — DEPENDENCY passthrough).
    const eventId = uuidv7();
    const transient = await dispatchInvitationDelivery(
      {
        eventId,
        growthInvitationId: uuidv7(),
        recipientType: "email",
        deliveryReferenceId: uuidv7(),
      },
      {
        resolveDeliveryPayload: async () => ({
          ok: false,
          error: {
            errorClass: "DEPENDENCY",
            errorCode: "identity_growth_invite_delivery_unavailable",
            message: "transient",
          },
        }),
      },
    );
    expect(transient.ok).toBe(false);
    if (transient.ok) return;
    expect(transient.error.errorClass).toBe("DEPENDENCY");
    expect(transient.error.retryable).toBe(true);
    expect(await prisma.emailLog.findFirst({ where: { sourceEventId: eventId } })).toBeNull();

    // (b) Provider outage: the transport throws INSIDE the dispatch tx → full rollback
    //     (no row, no audit) → DEPENDENCY retryable (a clean re-dispatch on retry).
    const f = await seedDispatchableInvitation();
    const outage = await dispatchInvitationDelivery(thinInput(f), {
      transport: async () => {
        throw new Error("provider down");
      },
    });
    expect(outage.ok).toBe(false);
    if (outage.ok) return;
    expect(outage.error.errorClass).toBe("DEPENDENCY");
    expect(outage.error.retryable).toBe(true);
    expect(await prisma.emailLog.findFirst({ where: { sourceEventId: f.eventId } })).toBeNull();
  });

  it("retry guard terminal path: a revoked invitation's failed row STAYS failed — no re-queue, no send", async () => {
    const f = await seedDispatchableInvitation();
    const dispatched = await dispatchInvitationDelivery(thinInput(f), {
      transport: captureTransport().transport,
    });
    expect(dispatched.ok).toBe(true);
    if (!dispatched.ok) return;
    const rowId = dispatched.result.deliveryLogId;

    // Simulate a provider failure advance + a subsequent revoke (the guard's not-live case).
    await prisma.emailLog.updateMany({ where: { id: rowId }, data: { status: "failed" } });
    await prisma.growthInvitation.update({
      where: { id: f.growthInvitationId },
      data: { state: "revoked" },
    });

    const { calls, transport } = captureTransport();
    const outcome = await retryInvitationDelivery(
      { channel: "email", deliveryLogId: rowId },
      { transport },
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.error.errorClass).toBe("REFERENCE");
    expect(outcome.error.errorCode).toBe("identity_growth_invite_delivery_not_resolvable");
    expect(outcome.error.retryable).toBe(false);
    expect(calls).toHaveLength(0); // no provider send

    const row = await prisma.emailLog.findFirst({ where: { id: rowId } });
    expect(row!.status).toBe("failed"); // permanent classification — never re-queued
    expect(
      await prisma.auditRecord.findMany({ where: { entityId: rowId, action: "delivery_retried" } }),
    ).toHaveLength(0);
  });

  it("retry of a LIVE invitation: envelope-recovered ref → failed → queued with a FRESH signed URL + retry audit", async () => {
    const f = await seedDispatchableInvitation();
    const first = captureTransport();
    const dispatched = await dispatchInvitationDelivery(thinInput(f), {
      transport: first.transport,
    });
    expect(dispatched.ok).toBe(true);
    if (!dispatched.ok) return;
    const rowId = dispatched.result.deliveryLogId;
    const firstUrl = first.calls[0]!.signedInvitationUrl;

    await prisma.emailLog.updateMany({ where: { id: rowId }, data: { status: "failed" } });

    const retryCapture = captureTransport();
    const outcome = await retryInvitationDelivery(
      { channel: "email", deliveryLogId: rowId },
      { transport: retryCapture.transport },
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.requeued).toBe(true);

    // (1) The frozen re-dispatch transition `failed → queued` happened.
    const row = await prisma.emailLog.findFirst({ where: { id: rowId } });
    expect(row!.status).toBe("queued");

    // (2) A FRESH signed URL was handed off (never the stale one) — same raw token, new nonce.
    expect(retryCapture.calls).toHaveLength(1);
    const freshUrl = retryCapture.calls[0]!.signedInvitationUrl;
    expect(freshUrl).not.toBe(firstUrl);
    expect(new URL(freshUrl).searchParams.get("token")).toBe(f.token);
    expect(new URL(freshUrl).searchParams.get("n")).not.toBe(
      new URL(firstUrl).searchParams.get("n"),
    );

    // (3) The `[ESC-COMM-AUDIT]` retry record (System; failed → queued; GI-3-clean).
    const audits = await prisma.auditRecord.findMany({
      where: { entityId: rowId, action: "delivery_retried" },
    });
    expect(audits).toHaveLength(1);
    expect(audits[0]!.actorType).toBe("system");
    const serialized = JSON.stringify(audits[0]!.newValue) + JSON.stringify(audits[0]!.oldValue);
    expect(serialized).not.toContain(f.recipientEmail);
    expect(serialized).not.toContain("/invite");
  });

  it("malformed event fields → VALIDATION terminal (retryable:false), no row", async () => {
    const { calls, transport } = captureTransport();
    const outcome = await dispatchInvitationDelivery(
      {
        eventId: "not-a-uuid",
        growthInvitationId: uuidv7(),
        recipientType: "email",
        deliveryReferenceId: uuidv7(),
      },
      { transport },
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.error.errorClass).toBe("VALIDATION");
    expect(outcome.error.retryable).toBe(false);
    expect(calls).toHaveLength(0);

    // A non-targeted recipient_type is likewise a malformed event (link/qr never fire).
    const badChannel = await dispatchInvitationDelivery(
      {
        eventId: uuidv7(),
        growthInvitationId: uuidv7(),
        recipientType: "link",
        deliveryReferenceId: uuidv7(),
      },
      { transport },
    );
    expect(badChannel.ok).toBe(false);
    if (badChannel.ok) return;
    expect(badChannel.error.errorClass).toBe("VALIDATION");
  });
});
