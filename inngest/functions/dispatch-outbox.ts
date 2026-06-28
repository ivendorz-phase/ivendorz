import { drainOutbox } from "@/modules/core/contracts";
import { inngest } from "../client";

// M0 transactional-outbox dispatcher job (REPOSITORY_STRUCTURE §7; Doc-8B §7.2; Doc-4B — M0 owns the
// outbox). THIN by design: the drain logic lives in M0 infrastructure
// (`src/modules/core/infrastructure/events`) and is consumed here ONLY through M0's public contract
// surface (`@/modules/core/contracts`) — strictly contracts/-only cross-module access (no M0 internal
// import; the One-Module rule is intact).
//
// EMITTER-AGNOSTIC (R-a / ESC-W1-OUTBOX §7): this job dispatches whatever `pending` rows exist in
// `core.outbox_events`. At Wave 1 those rows are test-seeded fixtures; in Wave 2 they are real
// write-plus-emit rows from business modules. The job (and the underlying drainer) stay IDENTICAL —
// only the row's origin differs. It COINS NO domain event (Doc-2 §8 / Doc-4J / Doc-4L untouched); it is
// pure mechanical infrastructure.
//
// Triggers:
//   - a cron tick (steady-state polling of the outbox), and
//   - an internal fan-in event `core/outbox.drain.requested` (an immediate drain nudge — NOT a domain
//     event; an infrastructure control signal local to the dispatcher, carrying no business payload).
// Either trigger invokes the SAME drain. The drainer is idempotent + forward-only, so overlapping ticks
// drain nothing twice.

/** Internal infrastructure control signal (NOT a Doc-2 §8 domain event) — an immediate-drain nudge. */
export const OUTBOX_DRAIN_REQUESTED = "core/outbox.drain.requested" as const;

/** Steady-state poll cadence for the outbox dispatcher. Mechanical infra cadence, not a business rule. */
const OUTBOX_DISPATCH_CRON = "* * * * *" as const; // every minute

export const dispatchOutbox = inngest.createFunction(
  { id: "core-dispatch-outbox", name: "M0 outbox dispatcher (pending → dispatched)" },
  [{ cron: OUTBOX_DISPATCH_CRON }, { event: OUTBOX_DRAIN_REQUESTED }],
  async ({ step }) => {
    // Delegate to the M0 drainer through the contract surface. `step.run` makes the drain a single
    // durable, retriable step; the drain itself is idempotent (re-running advances nothing already moved).
    return step.run("drain-outbox", () => drainOutbox());
  },
);
