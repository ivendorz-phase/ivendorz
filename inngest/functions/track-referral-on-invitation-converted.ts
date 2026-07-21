import { appendAuditRecord } from "@/modules/core/contracts";
import { trackReferralFromEvent } from "@/modules/billing/contracts";
import { inngest } from "../client";

// M7 `InvitationConverted` consumer (W3-BILL-GRW-1 — Growth Hub P2 Lane B-1; flow row Doc-4L L9-2).
// THIN by design: the branch mechanics live in M7 (`application/commands/track-referral.command.ts` —
// the SYSTEM EVENT-CREATE branch of the ONE contract-ID `billing.track_referral.v1`, Doc-4I_
// GrowthReferral_Patch_v1.0.1 §1) and are consumed here ONLY through M7's public contract surface
// (`@/modules/billing/contracts`). The M0 `appendAuditRecord` concrete is injected via
// `@/modules/core/contracts` (the boundary-legal audit path).
//
// TRIGGER: the M1-owned Doc-2 §8 event `InvitationConverted` (Doc-2_Patch_v1.0.10 §4; catalog =
// Doc-4J_…v1.0.1) on the platform outbox transport namespace `outbox/<EventName>`. The event data IS the
// Doc-2 §4 payload — snake_case `{event_id, occurred_at, conversion_id, growth_invitation_id,
// campaign_key, recipient_type, referrer_organization_id, referred_organization_id}`; `event_id` is
// carried within it. Consumption transfers NO ownership (the frozen Part-1 §H.7 / BC-BILL-3
// `QuotationSubmitted` precedent); this consumer owns only its effect (Doc-4A §4.4) and emits nothing.
//
// EFFECT: insert `billing.referrals` at `pending` — the frozen stage-6 entry state; the machine
// `pending → qualified → rewarded` is untouched (early attribution ≠ early reward — Q-14). Q-15 guard 3:
// the org ids are taken FROM THE EVENT PAYLOAD only; `source_event_id = event_id`. Q-15 guard 1: this
// registered consumer is the ONLY caller of the branch (no user/org/API path; Doc-5C has no row).
//
// IDEMPOTENCY (Q-15 guard 2): idempotent on `event_id` — the command resolves any duplicate delivery
// (windowed replay OR a beyond-window same-pair re-delivery) as idempotent success returning the existing
// referral (the `(referrer, referred)` pair is a natural key on this branch — patch §1 stage-8; no
// `billing` schema change, no persisted event-id). `concurrency: { limit: 1 }` keyed on
// `referred_organization_id` serializes racing duplicate deliveries of the same conversion (every
// conversion mints a FRESH referred org, so the key isolates exactly the duplicate set).
//
// FAILURE MODE (Doc-4A §16.7 — deferred-to-implementation by patch §5; DECLARED here for the WP record):
//   - DEFINITIVE failures (a non-ok command outcome — VALIDATION on a malformed payload; a definitive
//     REFERENCE if the DF-BILL-1 seam later resolves orgs) → TERMINAL SKIP: the outcome is RETURNED (not
//     thrown), so Inngest records it durably in the run output and never retries. Surfaced via the
//     durable step output, NOT audited (the M0 dispatch-outbox dead-letter precedent — no audit action
//     exists for a non-mutation and none may be invented).
//   - TRANSIENT failures (thrown errors — DB/dependency unavailability) → Inngest's standard retry
//     (at-least-once; safe under the idempotent branch).

/** The platform outbox transport name for the M1-owned `InvitationConverted` §8 event (Doc-2 §4-amended). */
const INVITATION_CONVERTED_EVENT = "outbox/InvitationConverted" as const;

export const trackReferralOnInvitationConverted = inngest.createFunction(
  {
    id: "billing-track-referral-invitation-converted",
    name: "M7 InvitationConverted consumer (track_referral System event-create branch)",
    // Serialize duplicate deliveries of the SAME conversion (fresh referred org per conversion ⇒ the key
    // isolates exactly the duplicate set). Correctness rests on the command's pair-natural-key
    // idempotency; the cap is belt-and-suspenders against a racing first-delivery double-insert.
    concurrency: { limit: 1, key: "event.data.referred_organization_id" },
  },
  [{ event: INVITATION_CONVERTED_EVENT }],
  async ({ event, step }) => {
    // Q-15 guard 3 — args from the event payload ONLY (no caller override); `source_event_id = event_id`.
    const data = event.data as {
      event_id?: unknown;
      referrer_organization_id?: unknown;
      referred_organization_id?: unknown;
    };
    const input = {
      referrerOrganizationId: String(data.referrer_organization_id ?? ""),
      referredOrganizationId: String(data.referred_organization_id ?? ""),
      sourceEventId: String(data.event_id ?? ""),
    };

    // The M7 System event-create branch (own transaction, System GUC, audited). Injected M0 audit facade.
    // A non-ok outcome is RETURNED (terminal skip — definitive); a throw retries (transient).
    const result = await step.run("track-referral", () =>
      trackReferralFromEvent(input, { appendAuditRecord }),
    );
    return result;
  },
);
