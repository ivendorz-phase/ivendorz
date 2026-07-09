import { appendAuditRecord, configValueQuery } from "@/modules/core/contracts";
import { expireInvitations } from "@/modules/identity/contracts";
import { inngest } from "../client";

// M1 membership-invite expiry pump (REPOSITORY_STRUCTURE §7; Doc-4C §C6 `identity.expire_invitation.v1`
// · 21.5 System). THIN by design: the sweep mechanics live in M1 (`application/commands/expire-invitations
// .command.ts`) and are consumed here ONLY through M1's public contract surface
// (`@/modules/identity/contracts`) — strictly contracts/-only cross-module access. The M0 `appendAuditRecord`
// + `configValueQuery` concretes are injected via `@/modules/core/contracts` (the boundary-legal path).
//
// EDGE: `invited → removed` (expire) ONLY (Doc-2 §5.2). IDEMPOTENT (the sweep's `invited`-only filter is the
// guard); each expiry is an AUDITED, ATOMIC write (System actor). Zero §8 events ([DC-1]).
//
// WINDOW: the invite lifetime is the POLICY key `identity.membership_invite_expiry_window` (Doc-4C §C6 `[DC-5]`;
// seeded W2-IDN-7), read INSIDE the command via `configValueQuery` — never a code literal. Inngest's cron is a
// MECHANICAL infra poll cadence fixed at registration (exactly as the M0 outbox pump + the delegation-expiry
// pump do); the POLICY window governs WHICH invitations lapse. `concurrency: { limit: 1 }` serializes
// overlapping ticks; correctness rests on the per-invitation compare-and-set (a lost race is a 0-row no-op).

/** Mechanical infra poll cadence for the invite-expiry pump (mirrors the delegation-expiry pump). NOT the
 *  invite window — that is the `identity.membership_invite_expiry_window` POLICY (seeded W2-IDN-7). */
const MEMBERSHIP_INVITE_EXPIRY_CRON = "*/5 * * * *" as const; // every 5 minutes

export const expireInvitationsPump = inngest.createFunction(
  {
    id: "identity-expire-invitations",
    name: "M1 membership-invite expiry sweep (invited → removed)",
    concurrency: { limit: 1 },
  },
  [{ cron: MEMBERSHIP_INVITE_EXPIRY_CRON }],
  async ({ step }) => {
    // The M1 System sweep (own transaction, staff GUC, audited per expiry). Injected M0 audit + config facades.
    const result = await step.run("expire-invitations", () =>
      expireInvitations({ appendAuditRecord, configValueQuery }),
    );
    return result;
  },
);
