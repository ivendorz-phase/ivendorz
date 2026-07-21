import type { InngestFunction } from "inngest";
import { dispatchOutbox } from "./dispatch-outbox";
import { expireDelegationGrantsPump } from "./expire-delegation-grants";
import { expireInvitationsPump } from "./expire-invitations";
import { activateMembershipWorker } from "./activate-membership";
import { trackReferralOnInvitationConverted } from "./track-referral-on-invitation-converted";

// Inngest job functions registry — outbox consumers (REPOSITORY_STRUCTURE §7).
//
// The M0 transactional-outbox dispatcher (`dispatchOutbox`) drains `core.outbox_events`
// `pending → dispatched` (Doc-8B §7.2; Doc-4B — M0 owns the outbox). It is registered here as the
// async-jobs spine over the outbox; the drain logic lives in M0 infrastructure and is consumed via
// `@/modules/core/contracts` (contracts-only cross-module access). Emitter-agnostic (R-a /
// ESC-W1-OUTBOX): it dispatches test-seeded rows now and real write-plus-emit rows in Wave 2 with no
// code change. Each module's own jobs are added here as their owning wave lands.
//
// `expireDelegationGrantsPump` (W2-IDN-4) — the M1 delegation-grant expiry sweep (`active → expired`,
// Doc-4C §C9 · System). Consumed via `@/modules/identity/contracts` (contracts-only); the M0 audit facade
// is injected inside the function. Out-of-wire System worker; audited per expiry; coins no event ([DC-1]).
//
// `expireInvitationsPump` + `activateMembershipWorker` (W2-IDN-5) — the two M1 membership System timers:
// invite-expiry SWEEP (`invited → removed`, cron; window POLICY-keyed) and verification-complete ACTIVATION
// (`pending → active`, the DC-4 signal seam). Both consumed via `@/modules/identity/contracts`; M0
// audit/config facades injected inside the functions. Out-of-wire; audited per mutation; coin no event ([DC-1]).
//
// `trackReferralOnInvitationConverted` (W3-BILL-GRW-1) — M7's registered consumer for the M1-owned
// `InvitationConverted` §8 event (`outbox/InvitationConverted`; Doc-4L L9-2): the System event-create
// branch of `billing.track_referral.v1` (Doc-4I_GrowthReferral_Patch_v1.0.1) → referral `pending`.
// Consumed via `@/modules/billing/contracts` (contracts-only); M0 audit facade injected inside; emits none.
export const functions: InngestFunction.Any[] = [
  dispatchOutbox,
  expireDelegationGrantsPump,
  expireInvitationsPump,
  activateMembershipWorker,
  trackReferralOnInvitationConverted,
];
