import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import {
  trackReferralFromEvent,
  validateTrackReferralFromEventInput,
} from "../../src/modules/billing/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";

// W3-BILL-GRW-1 [Growth Hub P2 Lane B-1] — the SYSTEM EVENT-CREATE branch of `billing.track_referral.v1`
// (Doc-4I_GrowthReferral_Patch_v1.0.1 §1; the M7 `InvitationConverted` consumer effect). Exercised through
// the contracts seam exactly as the Inngest consumer invokes it. Shared-Postgres hygiene: FULL uuidv7 ids
// (never sliced); assertions are PAIR-/ID-scoped — never global counts or page-1 contents.

const DEPS = { appendAuditRecord };

/** A fresh event-shaped input (every conversion mints a FRESH referred org — §PROV-EXT). */
function freshInput() {
  return {
    referrerOrganizationId: uuidv7(),
    referredOrganizationId: uuidv7(),
    sourceEventId: uuidv7(),
  };
}

describe("billing.track_referral.v1 SYSTEM event-create branch — Doc-4I_GrowthReferral_Patch_v1.0.1 §1", () => {
  it("SYNTAX (stage-1 overlay): source_event_id REQUIRED on this branch; org ids must be uuids — definitive VALIDATION, no row", async () => {
    // The stage-1 overlay: `source_event_id` uuid — required on the System branch (absent on the org branch).
    expect(
      validateTrackReferralFromEventInput({
        referrerOrganizationId: uuidv7(),
        referredOrganizationId: uuidv7(),
        sourceEventId: "",
      }),
    ).not.toBeNull();

    const referrer = uuidv7();
    const referred = uuidv7();
    const out = await trackReferralFromEvent(
      { referrerOrganizationId: referrer, referredOrganizationId: referred, sourceEventId: "nope" },
      DEPS,
    );
    // DEFINITIVE outcome — the declared §16.7 terminal-skip posture (returned, never retried, no write).
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error.errorClass).toBe("VALIDATION");
    expect(
      await prisma.referral.count({
        where: { referrerOrganizationId: referrer, referredOrganizationId: referred },
      }),
    ).toBe(0);

    const badOrg = await trackReferralFromEvent(
      { referrerOrganizationId: "nope", referredOrganizationId: uuidv7(), sourceEventId: uuidv7() },
      DEPS,
    );
    expect(badOrg.ok).toBe(false);
    if (!badOrg.ok) expect(badOrg.error.errorClass).toBe("VALIDATION");
  });

  it("inserts the referral at `pending` (the frozen stage-6 entry state) with a SYSTEM-actor audit", async () => {
    const input = freshInput();
    const out = await trackReferralFromEvent(input, DEPS);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.state).toBe("pending");

    // Insert shape — `pending`, event-sourced org ids, System write (no acting user ⇒ createdBy null).
    const row = await prisma.referral.findUnique({
      where: { id: out.result.referralId },
      select: {
        state: true,
        referrerOrganizationId: true,
        referredOrganizationId: true,
        createdBy: true,
        updatedBy: true,
      },
    });
    expect(row).toEqual({
      state: "pending",
      referrerOrganizationId: input.referrerOrganizationId,
      referredOrganizationId: input.referredOrganizationId,
      createdBy: null,
      updatedBy: null,
    });

    // Q-15 guard 4 — the unchanged §HB-6.2 binding: `referral_tracked` (never invented), entity_type
    // `referrals`, SYSTEM actor (`core.ActorType 'system'`), org-scoped to the referrer org.
    const audit = await prisma.auditRecord.findFirst({
      where: { entityId: out.result.referralId, action: "referral_tracked" },
      select: { actorType: true, actorId: true, entityType: true, organizationId: true },
    });
    expect(audit).toEqual({
      actorType: "system",
      actorId: null,
      entityType: "referrals",
      organizationId: input.referrerOrganizationId,
    });
  });

  it("replay-idempotency (Q-15 guard 2): the same event_id re-delivered → same referral, ONE row, ONE audit", async () => {
    const input = freshInput();
    const first = await trackReferralFromEvent(input, DEPS);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const replay = await trackReferralFromEvent(input, DEPS); // same event_id (at-least-once re-delivery)
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;
    expect(replay.result.referralId).toBe(first.result.referralId);
    expect(replay.result.state).toBe("pending");

    expect(
      await prisma.referral.count({
        where: {
          referrerOrganizationId: input.referrerOrganizationId,
          referredOrganizationId: input.referredOrganizationId,
        },
      }),
    ).toBe(1);
    expect(
      await prisma.auditRecord.count({
        where: { entityId: first.result.referralId, action: "referral_tracked" },
      }),
    ).toBe(1);
  });

  it("beyond-window pair rule (patch §1 stage-8): a same-pair delivery under a DIFFERENT event_id → idempotent success returning the EXISTING referral (even after it advanced)", async () => {
    const referrer = uuidv7();
    const referred = uuidv7();
    // The existing referral has ADVANCED (`qualified`) — the branch still returns it untouched: the
    // machine `pending → qualified → rewarded` is never re-entered or reset by a late re-delivery.
    const existingId = uuidv7();
    await prisma.referral.create({
      data: {
        id: existingId,
        referrerOrganizationId: referrer,
        referredOrganizationId: referred,
        state: "qualified",
      },
    });

    const out = await trackReferralFromEvent(
      {
        referrerOrganizationId: referrer,
        referredOrganizationId: referred,
        sourceEventId: uuidv7(), // beyond the H.8 window — a fresh event_id, same pair
      },
      DEPS,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.referralId).toBe(existingId);
    expect(out.result.state).toBe("qualified");

    // Still ONE row for the pair; NO audit was appended for the idempotent no-op.
    expect(
      await prisma.referral.count({
        where: { referrerOrganizationId: referrer, referredOrganizationId: referred },
      }),
    ).toBe(1);
    expect(
      await prisma.auditRecord.count({
        where: { entityId: existingId, action: "referral_tracked" },
      }),
    ).toBe(0);
  });

  it("REFERENCE posture (stage-7, disclosed): org resolution rides the deferred DF-BILL-1 seam — a well-formed unknown org id is accepted as a trusted bare UUID (no M1 table read)", async () => {
    // The definitive Identity-resolve is DEFERRED to the DF-BILL-1 seam exactly as on the org branch;
    // stage-7 is exceptional here — the referred org was minted in the SAME M1 provisioning txn and the
    // referrer org is held live by the invitation row's NOT-NULL FK. So a syntactically valid pair writes.
    const input = freshInput();
    const out = await trackReferralFromEvent(input, DEPS);
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.result.state).toBe("pending");
  });
});
