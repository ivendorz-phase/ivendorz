import { appendAuditRecord } from "@/modules/core/contracts";
import { activateMembership } from "@/modules/identity/contracts";
import { inngest } from "../client";

// M1 membership-activation worker (REPOSITORY_STRUCTURE §7; Doc-4C §C6 `identity.activate_membership.v1`
// · 21.5 System). THIN by design: the activation mechanics live in M1 (`application/commands/activate-
// membership.command.ts`) and are consumed here ONLY through M1's public contract surface
// (`@/modules/identity/contracts`). The M0 `appendAuditRecord` concrete is injected via
// `@/modules/core/contracts` (the boundary-legal audit path).
//
// TRIGGER (DC-4 seam): unlike the two expiry SWEEPS (cron), activation is SIGNAL-DRIVEN — the infrastructure
// account-verification-complete signal (Doc-4C §C6). That signal is a DC-4 INFRA boundary (Supabase auth
// verification), NOT a Doc-2 §8 domain event: there is no identity emitter ([DC-1]) and this is NOT drained
// from the M0 outbox. This function is the CONSUMER SEAM for that signal, modelled as the Inngest transport
// event `identity/account.verification-completed` carrying only the target `membershipId`. When the real DC-4
// emitter lands it dispatches this event; until then the seam exists (registered, testable via the command).
// Zero §8 events ([DC-1]).
//
// EDGE: `pending → active` ONLY (Doc-2 §5.2). IDEMPOTENT (a membership already `active` is a no-op); the
// activation is an AUDITED, ATOMIC write (System actor). `concurrency: { limit: 1 }` per membership serializes
// duplicate signals; correctness rests on the command's compare-and-set (a lost race is a no-op).

/** The DC-4 infra verification-complete signal (Inngest transport event; NOT a Doc-2 §8 domain event). */
const VERIFICATION_COMPLETED_EVENT = "identity/account.verification-completed" as const;

export const activateMembershipWorker = inngest.createFunction(
  {
    id: "identity-activate-membership",
    name: "M1 membership activation (pending → active)",
    concurrency: { limit: 1, key: "event.data.membershipId" },
  },
  [{ event: VERIFICATION_COMPLETED_EVENT }],
  async ({ event, step }) => {
    const membershipId = String((event.data as { membershipId?: unknown }).membershipId ?? "");
    // The M1 System activation (own transaction, staff GUC, audited). Injected M0 audit facade.
    const result = await step.run("activate-membership", () =>
      activateMembership({ membershipId }, { appendAuditRecord }),
    );
    return result;
  },
);
