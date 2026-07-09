import { appendAuditRecord } from "@/modules/core/contracts";
import { expireDelegationGrants } from "@/modules/identity/contracts";
import { inngest } from "../client";

// M1 delegation-grant expiry pump (REPOSITORY_STRUCTURE §7; Doc-4C §C9 `identity.expire_delegation_grant.v1`
// · 21.5 System). THIN by design: the sweep mechanics live in M1 (`application/commands/expire-delegation-
// grants.command.ts`) and are consumed here ONLY through M1's public contract surface
// (`@/modules/identity/contracts`) — strictly contracts/-only cross-module access. The M0
// `appendAuditRecord` concrete is injected via `@/modules/core/contracts` (the boundary-legal audit path).
//
// EDGES: `active → expired` AND `suspended → expired` (Doc-2 §5.10 as patched by `Doc-2_Patch_v1.0.7`
// rule 1 — the sweep covers BOTH states; the former `[ESC-IDN-DELEG-EXPIRY]` carry is RESOLVED, owner
// ruling 2026-07-09, realized W2-IDN-6.5). IDEMPOTENT (the non-terminal source filter + per-grant CAS
// are the guard); each expiry is an AUDITED, ATOMIC write (System actor). Zero §8 events ([DC-1]).
//
// CADENCE: the BUSINESS sweep cadence is the POLICY key `identity.delegation_expiry_sweep_cadence`
// (Doc-3 v1.9; seeded W2-IDN-7). Inngest's cron is fixed at registration, so — exactly as the M0 outbox
// pump does — this uses a MECHANICAL infra poll cadence here; the POLICY key governs the intended business
// cadence and is honored as the sweep is tuned (never a business-cadence literal masquerading in code).
// `concurrency: { limit: 1 }` serializes overlapping ticks; correctness rests on the sweep's per-grant
// compare-and-set (a lost race is a 0-row no-op), not on this cap.

/** Mechanical infra poll cadence for the expiry pump (mirrors the M0 outbox pump). NOT the business
 *  cadence — that is `identity.delegation_expiry_sweep_cadence` POLICY (seeded W2-IDN-7). */
const DELEGATION_EXPIRY_CRON = "*/5 * * * *" as const; // every 5 minutes

export const expireDelegationGrantsPump = inngest.createFunction(
  {
    id: "identity-expire-delegation-grants",
    name: "M1 delegation-grant expiry sweep (active|suspended → expired)",
    concurrency: { limit: 1 },
  },
  [{ cron: DELEGATION_EXPIRY_CRON }],
  async ({ step }) => {
    // The M1 System sweep (own transaction, staff GUC, audited per expiry). Injected M0 audit facade.
    const result = await step.run("expire-delegation-grants", () =>
      expireDelegationGrants({ appendAuditRecord }),
    );
    return result;
  },
);
