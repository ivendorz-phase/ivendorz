import {
  archiveDispatchedEvents,
  dispatchOutboxEvents,
  type OutboxTransport,
} from "@/modules/core/contracts";
import { inngest } from "../client";

// M0 transactional-outbox event pump (REPOSITORY_STRUCTURE §7; Doc-4B §B6 — M0 owns the outbox).
// THIN by design: the worker mechanics live in M0 infrastructure
// (`src/modules/core/infrastructure/events`) and are consumed here ONLY through M0's public contract
// surface (`@/modules/core/contracts`) — strictly contracts/-only cross-module access (no M0 internal
// import; the One-Module rule is intact).
//
// This job realizes the two Doc-4B §B6 System/Phase-2 workers as DISTINCT durable steps:
//   1. `core.phase2_dispatch_outbox_events.v1`    — `pending → dispatched` (+ retry/backoff, dead-
//                                                    letter park, reconciliation; all POLICY-bounded).
//   2. `core.phase2_archive_dispatched_events.v1` — `dispatched → archived` (retention-bounded).
// Distinct steps ⇒ dispatch and archival are distinctly observed (Doc-8B §7.2). Each step is a single
// durable, retriable Inngest step; the workers advance each row under a WRITE-TIME compare-and-set on
// source status (a lost race is a 0-count no-op, not a same-state re-advance), and this function runs
// at `concurrency: { limit: 1 }` — so overlapping ticks and step retries advance nothing twice and the
// returned counters stay truthful.
//
// TRANSPORT ONLY (§B6 Events-Produced: none): this job pumps the outbox lifecycle; it COINS NO domain
// event (Doc-2 §8 / Doc-4J / Doc-4L untouched). EMITTER-AGNOSTIC (R-a / ESC-W1-OUTBOX): it drains
// whatever `pending` rows exist — test-seeded now, real write-plus-emit rows in Wave 2 — identically.
//
// The [D-5] outbox-audit leg is realized in the M0 workers this job invokes: each advancing run (≥ 1
// row) appends ONE System-attributed audit record (run/batch granularity — Doc-4B_OutboxAuditToken_
// Patch_v1.0, Board-approved 2026-07-10). The dead-letter (`deadLettered`) and reconciliation
// (`reconciledStuck`) counts returned by the dispatch step are the ops-telemetry alert surface (§B6
// "never silently drop") — surfaced via the durable step output, NOT audited; parked rows are retained,
// never dropped.
//
// Triggers:
//   - a cron tick (steady-state polling of the outbox), and
//   - an internal fan-in event `core/outbox.drain.requested` (an immediate drain nudge — NOT a domain
//     event; an infrastructure control signal local to the dispatcher, carrying no business payload).

/** Internal infrastructure control signal (NOT a Doc-2 §8 domain event) — an immediate-drain nudge. */
export const OUTBOX_DRAIN_REQUESTED = "core/outbox.drain.requested" as const;

/**
 * Consumer-facing transport namespace (P2-A1): a drained Doc-2 §8 envelope is forwarded as the
 * Inngest event `outbox/<EventName>` (e.g. `outbox/InvitationIssued`, `outbox/InvitationConverted`).
 * A NAMESPACE prefix over the frozen Doc-4J catalog names — no event is coined or renamed; the
 * data is the persisted `payload_jsonb` verbatim (thin IDs + the stamped `event_id`/`occurred_at`).
 */
export const OUTBOX_TRANSPORT_EVENT_PREFIX = "outbox/" as const;

/**
 * The concrete P2-A1 outbox transport — constructed HERE because the inngest layer owns the
 * delivery mechanism (M0 never imports inngest; it receives this by injection through
 * `@/modules/core/contracts` — the One-Module rule is intact). PER-EVENT, may throw: a failed
 * `inngest.send` propagates to the dispatcher, which leaves that row `pending` for the next drain
 * (send-then-mark, at-least-once). The envelope `event_id` rides BOTH as the Inngest event `id`
 * (broker-side dedup) and inside `data.event_id` (the stamped envelope field) so consumers are
 * idempotent on it. TRANSPORT ONLY — no consumer functions are registered here (the M6/M7
 * consumers live on their owning wave branches — Lane B).
 */
const inngestOutboxTransport: OutboxTransport = async (event) => {
  await inngest.send({
    id: event.eventId,
    name: `${OUTBOX_TRANSPORT_EVENT_PREFIX}${event.eventName}`,
    data: event.payload,
  });
};

/** Steady-state poll cadence for the outbox pump. Mechanical infra cadence, not a business rule. */
const OUTBOX_DISPATCH_CRON = "* * * * *" as const; // every minute

export const dispatchOutbox = inngest.createFunction(
  {
    id: "core-dispatch-outbox",
    name: "M0 outbox event pump (dispatch + archive)",
    // Defense-in-depth: the cron tick and the `core/outbox.drain.requested` nudge can co-fire, so
    // serialize runs to at most one at a time. Correctness does NOT rest on this cap — the workers
    // are race-safe via a write-time compare-and-set on source status (drain-outbox.service.ts); the
    // limit is belt-and-suspenders that also spares the DB redundant overlapping scans.
    concurrency: { limit: 1 },
  },
  [{ cron: OUTBOX_DISPATCH_CRON }, { event: OUTBOX_DRAIN_REQUESTED }],
  async ({ step }) => {
    // Step 1 — the §B6 dispatch worker (pending → dispatched, POLICY-bounded retry/backoff/DLQ +
    // recon), now with the P2-A1 consumer-transport leg injected: each envelope is forwarded as
    // `outbox/<EventName>` via `inngest.send` BEFORE its row is marked dispatched (send-then-mark).
    const dispatch = await step.run("dispatch-outbox-events", () =>
      dispatchOutboxEvents(undefined, { transport: inngestOutboxTransport }),
    );

    // Step 2 — the §B6 archival worker (dispatched → archived, retention-bounded). DISTINCT step so the
    // two legs are separately durable and separately observed (Doc-8B §7.2).
    const archive = await step.run("archive-dispatched-events", () => archiveDispatchedEvents());

    return { dispatch, archive };
  },
);
