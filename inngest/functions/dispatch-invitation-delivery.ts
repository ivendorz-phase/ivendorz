import { NonRetriableError } from "inngest";
import { dispatchInvitationDelivery } from "@/modules/communication/contracts";
import { inngest } from "../client";
import { OUTBOX_TRANSPORT_EVENT_PREFIX } from "./dispatch-outbox";

// M6 `InvitationIssued` delivery consumer (W3-COMM-GRW-1 B2-3; REPOSITORY_STRUCTURE §7). THIN by
// design: the §HB-3.6 mechanics live in M6 (`comm.dispatch_invitation_delivery.v1` —
// Doc-4H_GrowthDelivery_Patch_v1.0.1) and are consumed here ONLY through M6's public contract
// surface (`@/modules/communication/contracts`). This is the registered consumption of the
// M1-OWNED `InvitationIssued` event (Doc-2 §8 as amended by Doc-2_Patch_v1.0.10 §4; catalog
// Doc-4J v1.0.1; flow Doc-4L L9-1) over the P2-A1 outbox transport namespace
// (`outbox/<EventName>` — dispatch-outbox.ts).
//
// THIN PAYLOAD: `event.data` is the persisted `payload_jsonb` VERBATIM — the emitter's
// {growth_invitation_id, recipient_type, delivery_reference_id} + the stamped
// {event_id, occurred_at}. NO raw token, NO recipient_identifier (GI-3/§16.5) — M6 resolves the
// delivery payload just-in-time inside the command.
//
// FAILURE POSTURE (the Doc-4A §16.7 declaration — the definitive/transient split, §HB-3.6 item 9):
//   • ok / deduplicated            → success (idempotent on `event_id` — broker id-dedup + the
//                                    command's `source_event_id` probe compose).
//   • retryable:false (VALIDATION / the DEFINITIVE `identity_growth_invite_delivery_not_
//     resolvable`) → TERMINAL: NonRetriableError-free clean return — no row, no dispatch, and the
//                                    broker NEVER retries (the §B4 suppression rule).
//   • retryable:true (the TRANSIENT `…_delivery_unavailable` / provider outage) → THROW →
//                                    Inngest retry/backoff (the `DEPENDENCY` budget).

/** The consumer-side transport name for the M1-owned `InvitationIssued` (namespace + frozen name —
 *  no event coined or renamed). */
export const OUTBOX_INVITATION_ISSUED = `${OUTBOX_TRANSPORT_EVENT_PREFIX}InvitationIssued` as const;

export const dispatchInvitationDeliveryConsumer = inngest.createFunction(
  {
    id: "communication-dispatch-invitation-delivery",
    name: "M6 dispatch invitation delivery (outbox/InvitationIssued)",
    // Serialize per event id — overlapping deliveries of the same envelope compose with the
    // command's in-tx `source_event_id` dedup re-probe (no duplicate row/audit/send).
    concurrency: { limit: 1, key: "event.data.event_id" },
  },
  [{ event: OUTBOX_INVITATION_ISSUED }],
  async ({ event, step }) => {
    const data = event.data as Record<string, unknown>;
    const outcome = await step.run("dispatch-invitation-delivery", () =>
      dispatchInvitationDelivery({
        eventId: String(data["event_id"] ?? ""),
        occurredAt: typeof data["occurred_at"] === "string" ? data["occurred_at"] : undefined,
        growthInvitationId: String(data["growth_invitation_id"] ?? ""),
        recipientType: String(data["recipient_type"] ?? ""),
        deliveryReferenceId: String(data["delivery_reference_id"] ?? ""),
      }),
    );

    if (!outcome.ok) {
      if (outcome.error.retryable) {
        // TRANSIENT (`DEPENDENCY`) — throw so Inngest retries under its backoff budget.
        throw new Error(`invitation delivery transient failure: ${outcome.error.errorCode}`);
      }
      // DEFINITIVE/terminal — never retried (no row was written). NonRetriableError marks the
      // run failed-terminal in the broker without a retry storm.
      throw new NonRetriableError(
        `invitation delivery terminal no-dispatch: ${outcome.error.errorCode}`,
      );
    }
    return outcome.result;
  },
);
