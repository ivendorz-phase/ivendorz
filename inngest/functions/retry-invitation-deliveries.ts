import {
  listFailedInvitationDeliveries,
  retryInvitationDelivery,
} from "@/modules/communication/contracts";
import { inngest } from "../client";

// M6 invitation-delivery RETRY JOB (W3-COMM-GRW-1 B2-5; the Doc-4H_GrowthDelivery_Patch_v1.0.1 §2
// "invitation-delivery retry-job orchestration" — implementation-wired per the patch's §6
// consumer-wiring scope). THIN: the guard + the minimal frozen `failed → queued` slice live in M6
// (`retryInvitationDelivery`) and are consumed ONLY through `@/modules/communication/contracts`.
//
// Per row the workflow runs the §2 guard FIRST: recover `delivery_reference_id` from the
// PERSISTED M0 outbox envelope (never a new column, never an M1 table), re-resolve the delivery
// payload — live → re-dispatch with a FRESH signed URL; not-live → the record STAYS `failed`,
// no re-queue, no send ("must not retry a revoked/expired invitation"). Terminal outcomes are
// simply recorded in the run output; transient ones are left for the next tick (the row is
// unchanged). The retry/backoff POLICY budget stays `[ESC-COMM-POLICY]`-carried (keys not yet
// Doc-3-registered — none invented here); the cron cadence below is mechanical infra, not a
// business rule.

/** Mechanical scan cadence (infra) + bounded batch per channel per tick. */
const RETRY_SCAN_CRON = "*/5 * * * *" as const; // every 5 minutes
const RETRY_BATCH_LIMIT = 20;

const CHANNELS = ["email", "sms", "whatsapp"] as const;

export const retryInvitationDeliveriesJob = inngest.createFunction(
  {
    id: "communication-retry-invitation-deliveries",
    name: "M6 invitation-delivery retry job (guarded failed → queued)",
    concurrency: { limit: 1 },
  },
  [{ cron: RETRY_SCAN_CRON }],
  async ({ step }) => {
    const summary: Record<string, { requeued: number; terminal: number; transient: number }> = {};

    for (const channel of CHANNELS) {
      const counters = { requeued: 0, terminal: 0, transient: 0 };
      const rows = await step.run(`scan-${channel}`, () =>
        listFailedInvitationDeliveries(channel, RETRY_BATCH_LIMIT),
      );
      for (const row of rows) {
        const outcome = await step.run(`retry-${channel}-${row.deliveryLogId}`, () =>
          retryInvitationDelivery({ channel, deliveryLogId: row.deliveryLogId }),
        );
        if (outcome.ok) counters.requeued += 1;
        else if (outcome.error.retryable) counters.transient += 1;
        else counters.terminal += 1; // permanent classification — the row stays `failed`
      }
      summary[channel] = counters;
    }
    return summary;
  },
);
