// M7 application (PRIVATE) — `billing.track_referral.v1` (Doc-4I §HB-6.2 / Doc-5I §9 `POST /billing/referrals`
// · 201). W3-BILL-12. ORG-SCOPED audited write — User leg only (org self-initiates; `can_manage_billing`;
// System n/a for create — R11). Inserts a `referrals` row at `pending` (referrer = the actor's active org),
// in the ONE tenant tx the composition supplies. Audit = [ESC-BILL-AUDIT] (referral movement, nearest §9).
//
// REFERENCE note: Doc-4I §HB-6.2 mandates a `referred_organization_id` "resolves" check → REFERENCE. Billing
// cannot verify an M1 organization's existence directly (no cross-module table access). SYNTAX validates the
// uuid; the definitive Identity-resolve (DF-BILL-1) is DEFERRED to the Identity-service seam (disclosed) —
// `referred_organization_id` is a trusted bare UUID here, as every M1 org reference is. The BUSINESS
// duplicate-pair check IS enforced (intra-module query).
//
// W3-BILL-GRW-1 (Growth Hub P2 Lane B-1) ADDS the SYSTEM EVENT-CREATE branch below
// (`trackReferralFromEventCommand`) — Doc-4I_GrowthReferral_Patch_v1.0.1 §1. SAME ONE contract-ID
// `billing.track_referral.v1`, actor-branched (F4I-PA-M1 — never split). The frozen org (User) branch above
// stands verbatim; its "System n/a for create — R11" posture is EXTENDED (not replaced) by the folded patch.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { UUID_PATTERN } from "../../../../shared/ids";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  findReferralByPair,
  insertReferral,
  referralPairExists,
} from "../../infrastructure/data/reward.repository";
import { REFERRAL_ENTITY_TYPE, ReferralAuditAction } from "../../domain/audit-actions";
import type {
  RewardWriteError,
  TrackReferralFromEventInput,
  TrackReferralInput,
  TrackReferralOutcome,
} from "../../contracts/types";

const INVALID_INPUT = "billing_referral_invalid_input";
const FORBIDDEN = "billing_referral_forbidden";
const DUPLICATE = "billing_referral_duplicate"; // BUSINESS

/** The server-resolved request context (from the composition — never client input). */
export interface TrackReferralContext {
  userId: string;
  /** The referrer org (= the actor's active org). */
  organizationId: string;
  canManageBilling: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface TrackReferralDeps {
  appendAuditRecord: AppendAuditRecord;
}

function err(
  errorClass: RewardWriteError["errorClass"],
  errorCode: string,
  message: string,
): { ok: false; error: RewardWriteError } {
  return { ok: false, error: { errorClass, errorCode, message } };
}

/** SYNTAX validation (Doc-4A §11.2 category 1). */
export function validateTrackReferralInput(input: TrackReferralInput): string | null {
  if (
    typeof input.referredOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.referredOrganizationId)
  ) {
    return "referred_organization_id must be a valid UUID.";
  }
  return null;
}

/**
 * Create a referral at `pending` (Doc-4I §HB-6.2 track). Duplicate `(referrer, referred)` pair → BUSINESS.
 * `organizationId` (the referrer) is the server-validated active org (from the composition — never input).
 */
export async function trackReferralCommand(
  input: TrackReferralInput,
  ctx: TrackReferralContext,
  deps: TrackReferralDeps,
  db: DbExecutor = prisma,
): Promise<TrackReferralOutcome> {
  const invalid = validateTrackReferralInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  // AUTHZ — the referrer org self-initiates (Owner `can_manage_billing`).
  if (ctx.canManageBilling !== true) {
    return err("AUTHORIZATION", FORBIDDEN, "can_manage_billing is required to track a referral.");
  }

  // BUSINESS — a referral already exists for this (referrer, referred) pair (Doc-4I §HB-6.2 stage-8).
  if (await referralPairExists(ctx.organizationId, input.referredOrganizationId, db)) {
    return err("BUSINESS", DUPLICATE, "A referral for this organization pair already exists.");
  }

  const referralId = await insertReferral(
    {
      referrerOrganizationId: ctx.organizationId,
      referredOrganizationId: input.referredOrganizationId,
      actorUserId: ctx.userId,
    },
    db,
  );

  // AUDIT — [ESC-BILL-AUDIT] referral created; User-attributed; org-scoped (the referrer org).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.organizationId,
      entityType: REFERRAL_ENTITY_TYPE,
      entityId: referralId,
      action: ReferralAuditAction.TRACKED,
      oldValue: null,
      newValue: { referred_organization_id: input.referredOrganizationId, state: "pending" },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { referralId, state: "pending" } };
}

// ─────────────────────────────────────────────────────────────────────────────
// W3-BILL-GRW-1 — the SYSTEM EVENT-CREATE branch of `billing.track_referral.v1`
// (Doc-4I_GrowthReferral_Patch_v1.0.1 §1; Q-15 ratified with four guards; F4I-PA-M1 — ONE contract-ID).
//
// - GUARD 1 (consumer-only): reachable ONLY from M7's registered `InvitationConverted` Inngest consumer
//   (`inngest/functions/track-referral-on-invitation-converted.ts`; flow = Doc-4L L9-2). No user, org, or
//   API invocation path exists — not exposed on any wire face; Doc-5C carries NO row for it.
// - GUARD 3 (args from the event): `referrer_organization_id` / `referred_organization_id` come from the
//   event payload — no caller override; `source_event_id = event_id` (required on THIS branch only — the
//   SYNTAX extension of the frozen §HB-6.2 matrix, stage-1 overlay).
// - GUARD 2 (idempotent on `event_id`): the §HB-6.1/H.8 windowed-replay posture as realized in this
//   codebase — there is NO persisted event-id column (Doc-2 §10.8 / Doc-6I §3.6 define none; NO `billing`
//   schema change) and the §B.6 idempotency replay store is program-wide DEFERRED (the `record_usage`
//   precedent). On THIS branch full replay-safety holds regardless: the `(referrer, referred)` pair is a
//   NATURAL KEY (patch §1 stage-8 — every conversion mints a FRESH referred org via §PROV-EXT, so a
//   same-pair delivery can only be the same conversion re-delivered). Within OR beyond the window, a
//   duplicate delivery resolves as IDEMPOTENT SUCCESS returning the existing referral — one row, no
//   duplicate audit, never BUSINESS. (Two racing FIRST deliveries are serialized by the consumer's
//   per-referred-org concurrency key — no unique constraint exists and none is added.)
// - GUARD 4 (audit): the frozen §HB-6.2 §9 binding UNCHANGED — `[ESC-BILL-AUDIT]` nearest-by-pointer via
//   `ReferralAuditAction.TRACKED`, `entity_type=referrals`, in-transaction (Doc-4B/D7), SYSTEM actor
//   (`core.ActorType 'system'` — the set-wide casing pin, Doc-4J fold-note; `actorId` null).
//
// AUTHZ (stage-3): System authority, NO slug (`can_manage_billing` binds the org branch only). SCOPE
// (stage-4): the referrer org resolves FROM THE EVENT — no Controlling-Org assertion (no acting user).
// REFERENCE (stage-7): both orgs ride the frozen DF-BILL-1 Identity seam — trusted bare UUIDs, the
// definitive resolve DEFERRED exactly as on the org branch (never an M1 table read); exceptional here —
// the referred org was minted in the SAME M1 provisioning txn and the referrer org is held live by the
// invitation row's NOT-NULL FK. STATE (stage-6): unchanged — the new referral enters `pending`; the
// frozen machine `pending → qualified → rewarded` is untouched (early attribution ≠ early reward — Q-14).
// Q-3 (self-referral) stays OPEN — no same-org rule added or foreclosed.
//
// TX: opens its OWN transaction and pins `app.is_platform_staff = 'true'` TRANSACTION-LOCAL (the M1
// `activate_membership` System-worker precedent) so the `referrals_tenant` write RLS and the audit
// System/staff `WITH CHECK` leg both admit the write. The GUC never leaks past the transaction.
// ─────────────────────────────────────────────────────────────────────────────

export interface TrackReferralFromEventDeps {
  appendAuditRecord: AppendAuditRecord;
}

/** SYNTAX validation for the System event-create branch (the stage-1 overlay: `source_event_id` uuid —
 *  REQUIRED on this branch, absent on the org branch; both org ids uuid — from the event payload). */
export function validateTrackReferralFromEventInput(
  input: TrackReferralFromEventInput,
): string | null {
  if (
    typeof input.referrerOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.referrerOrganizationId)
  ) {
    return "referrer_organization_id must be a valid UUID.";
  }
  if (
    typeof input.referredOrganizationId !== "string" ||
    !UUID_PATTERN.test(input.referredOrganizationId)
  ) {
    return "referred_organization_id must be a valid UUID.";
  }
  if (typeof input.sourceEventId !== "string" || !UUID_PATTERN.test(input.sourceEventId)) {
    return "source_event_id must be a valid UUID.";
  }
  return null;
}

/**
 * The System event-create branch of `billing.track_referral.v1` (Doc-4I_GrowthReferral_Patch_v1.0.1 §1).
 * Inserts a `referrals` row at `pending` (the frozen stage-6 entry state) attributed to the SYSTEM actor,
 * atomically with its audit. A duplicate delivery (same `event_id`, or a beyond-window same-pair
 * re-delivery) is IDEMPOTENT SUCCESS returning the existing referral — one row, no duplicate audit.
 */
export async function trackReferralFromEventCommand(
  input: TrackReferralFromEventInput,
  deps: TrackReferralFromEventDeps,
): Promise<TrackReferralOutcome> {
  const invalid = validateTrackReferralFromEventInput(input);
  if (invalid !== null) return err("VALIDATION", INVALID_INPUT, invalid);

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // IDEMPOTENCY (Q-15 guard 2) — the pair natural key (patch §1 stage-8): an existing `(referrer,
    // referred)` referral ⇒ the same conversion re-delivered ⇒ return it. No write, no audit.
    const existing = await findReferralByPair(
      input.referrerOrganizationId,
      input.referredOrganizationId,
      tx,
    );
    if (existing !== null) {
      return { ok: true as const, result: { referralId: existing.id, state: existing.state } };
    }

    // EFFECT — insert at `pending` (the frozen stage-6 entry state; machine untouched).
    const referralId = await insertReferral(
      {
        referrerOrganizationId: input.referrerOrganizationId,
        referredOrganizationId: input.referredOrganizationId,
        actorUserId: null,
      },
      tx,
    );

    // AUDIT (Q-15 guard 4) — [ESC-BILL-AUDIT] referral created; SYSTEM-attributed; in-transaction;
    // org-scoped to the referrer org (the same §HB-6.2 binding the org branch uses).
    await deps.appendAuditRecord(
      {
        actorId: null,
        actorType: "system",
        organizationId: input.referrerOrganizationId,
        entityType: REFERRAL_ENTITY_TYPE,
        entityId: referralId,
        action: ReferralAuditAction.TRACKED,
        oldValue: null,
        newValue: { referred_organization_id: input.referredOrganizationId, state: "pending" },
        ipAddress: null,
        userAgent: null,
      },
      tx,
    );

    return { ok: true as const, result: { referralId, state: "pending" as const } };
  });
}
