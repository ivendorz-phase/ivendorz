// Public DTOs / IDs for module "trust" (cross-module surface). DTOs/IDs only — domain value-objects
// stay private. Realized per the module's frozen Doc-4G / Doc-5G / Doc-6G contracts, bound by pointer.
//
// W3-TRUST-2 realizes the `trust.request_verification.v1` write DTOs (Doc-4G §G4.1; wire Doc-5G §4).
// This WP is RESTRICTED to `subject_type = organization`; the other frozen subject types are enumerated
// here (the fixed Doc-2 §10.6 set) but application-DEFERRED (see the command). Field names/semantics are
// owned by Doc-4G §G4.1 + Doc-2 §10.6; bound by pointer, never re-authored.

import type { AppendAuditRecord, WriteOutboxEvent } from "@/modules/core/contracts";

/** The `trust.verification_subject_type` value set (Doc-2 §10.6 / Doc-6G §3.1.1; fixed — do not extend). */
export type VerificationSubjectTypeValue =
  | "vendor_profile"
  | "organization"
  | "capacity"
  | "declared_tier";

/** The `trust.verification_type` value set (Doc-2 §10.6 / Doc-6G §3.1.1; fixed — do not extend). */
export type VerificationTypeValue =
  | "contact"
  | "business"
  | "factory"
  | "organization"
  | "tier"
  | "capacity";

/** The `trust.verification_state` value set (Doc-2 §5.6 / Doc-6G §3.1.1). The open-case entry state is
 *  `requested` (Doc-4G §G4.1 metadata "Lifecycle entry Doc-2 §5.6 `requested`"). */
export type VerificationStateValue =
  | "requested"
  | "in_review"
  | "approved"
  | "rejected"
  | "expired"
  | "revoked";

/**
 * Input to `trust.request_verification.v1` (Doc-4G §G4.1 request schema). The submitting org is the
 * SERVER-RESOLVED active org (Invariant #5 — never client input) and is NOT part of this input.
 *
 * W3-TRUST-2 scope: `subjectType` MUST be `organization`; any other (frozen-valid) subject type is a
 * WP-scope VALIDATION reject (deferred — needs M2/M1 ownership resolution the platform lacks today).
 */
export interface RequestVerificationInput {
  /** `subject_id : uuid : required` (Doc-4G §G4.1) — the org being verified; a bare cross-module UUID
   *  (no FK). This WP: MUST equal the submitting active org (SCOPE — the org owns itself). */
  subjectId: string;
  /** `subject_type : enum : required` (Doc-4G §G4.1; Doc-2 §10.6 fixed set). This WP: `organization`. */
  subjectType: VerificationSubjectTypeValue;
  /** `verification_type : enum : required` (Doc-4G §G4.1; Doc-2 §10.6 fixed set). */
  verificationType: VerificationTypeValue;
  /** `evidence_document_refs : uuid[] : optional : 0..n` (Doc-4G §G4.1) — Platform Core storage refs;
   *  bare UUIDs (no FK). Omit ⇒ empty set. */
  evidenceDocumentRefs?: string[];
}

/** The server-resolved request context for the write (from the active-org context guard — never
 *  client input; Invariant #5). */
export interface RequestVerificationContext {
  /** The acting `identity.users` id (= `app.user_id`; the `requested_by` attribution). */
  userId: string;
  /** The server-resolved active org (= `app.active_org`; the submitting org — Invariant #5). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (no module re-implements audit). */
export interface RequestVerificationDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE (`@/modules/core/contracts`). */
  appendAuditRecord: AppendAuditRecord;
}

/** Result of a successful `request_verification` (Doc-4G §G4.1 response; `reference_id` rides the
 *  Doc-5A §5.6 envelope top-level, not `result`). Property names camelCase (Doc-5A Option B). */
export interface RequestVerificationResult {
  /** The opened `verification_records.id` (UUIDv7). */
  verificationRecordId: string;
  /** Always `requested` on a fresh open (Doc-4G §G4.1 — lifecycle entry `requested`). */
  state: VerificationStateValue;
}

/** Error outcome of `request_verification` (Doc-4G §G4.1 error register; classes per Doc-5A §6.2). The
 *  `errorCode` strings are the interim `trust_verification_*` register ([ESC-TRUST-CODE]). */
export interface RequestVerificationError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION→400 · AUTHORIZATION→403 · NOT_FOUND→404 · BUSINESS→422). */
  errorClass: "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "BUSINESS";
  /** The interim `trust_verification_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/** Outcome of `trust.request_verification.v1`. `ok:true` ⇒ `201` (a fresh open case). */
export type RequestVerificationOutcome =
  | { ok: true; result: RequestVerificationResult }
  | { ok: false; error: RequestVerificationError };

// ── W3-TRUST-3 — Verified Financial Tier write-service DTOs (Doc-4G §G4.6/§G4.7; Doc-6G §3.1.3) ────────
// The write-service functions (establish/confirm/downgrade/suspend/expire) are exercised DIRECTLY by tests.
// The admin HTTP commands (+ `staff_can_verify` authz + routes) and the System expire timer are DEFERRED.
// The `set` basis `verification_record_id` (§G4.6 line 322, REQUIRED) IS enforced in-band (stage-8 BUSINESS,
// line 339): `establishVerifiedTier` reads trust's OWN WP1 `verification_records` table and requires an
// APPROVED tier verification for this vendor — no verified tier / `VendorTierChanged` is minted without it.
// DEFERRED (genuinely cross-module — the legitimate WP2-style edge deferral): the stage-7 REFERENCE
// resolution of `vendor_profile_id` itself against M2/Marketplace (DG-2) — see the service header `[ESC]`
// note; no M2 resolver is built here. Field names/semantics owned by Doc-4G §G4.6/§G4.7 + Doc-2 §10.6.

/** The `trust.financial_tier` value set (Doc-2 §10.6 / Doc-6G §3.1.3; fixed A–E — do not extend). */
export type FinancialTier = "A" | "B" | "C" | "D" | "E";

/** The `trust.verified_tier_status` value set (Doc-2 §10.6 / Doc-6G §3.1.3). */
export type VerifiedTierStatus = "pending_verification" | "verified" | "suspended" | "expired";

/** The acting-staff context for the Admin verified-tier transitions (set/confirm/downgrade/suspend). The
 *  `staff_can_verify` AUTHZ is performed at the DEFERRED composition edge BEFORE the service runs (WP2
 *  precedent); this carries only the Doc-2 §9 attribution (`actorId` = the acting staff user). */
export interface VerifiedTierAdminContext {
  /** The acting `identity.users` staff id — the Doc-2 §9 audit attribution (Admin actor). */
  actorId: string;
}

/**
 * Injected Module 0 contract services — the ONLY audit-write + outbox-emit surfaces (no module
 * re-implements audit/outbox). Both are M0 TYPES from `@/modules/core/contracts` (the trust module imports
 * NOTHING from M1/M2; core contract TYPES are allowed — the WP2 precedent).
 */
export interface VerifiedTierDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** `core.write_outbox_event.v1` (Doc-4B §B10), injected by the contract TYPE — the FIRST §8 emitter. */
  writeOutboxEvent: WriteOutboxEvent;
}

/** `set` (establish) input (Doc-4G §G4.6) — absence-of-row → verified. */
export interface EstablishVerifiedTierInput {
  /** `vendor_profile_id : uuid : required` — a bare cross-module UUID → M2 (no FK); UNIQUE per vendor. */
  vendorProfileId: string;
  /** `verification_record_id : uuid : required` (§G4.6 line 322) — the APPROVED tier-verification basis.
   *  Enforced in-band (stage-8 BUSINESS): must be an `approved`, `verification_type='tier'` record whose
   *  subject IS this vendor (`subject_type='vendor_profile' AND subject_id=vendor_profile_id`; §G4.1). */
  verificationRecordId: string;
  /** `tier : enum<A|B|C|D|E> : required` (Doc-2 §10.6 fixed band). */
  tier: FinancialTier;
  /** `basis_jsonb : jsonb : optional` (Doc-2 §10.6) — OPAQUE (dev-doc shape); persisted as-is, not schema-validated. */
  basisJsonb?: Record<string, unknown> | null;
}

/** `confirm` input (Doc-4G §G4.6) — verified → verified; renews `next_review_at` (+24mo); tier unchanged. */
export interface ConfirmVerifiedTierInput {
  vendorProfileId: string;
  /** `expected_revision` (Doc-4G §G4.6) realized against `updated_at`. Omit ⇒ use the current row's token. */
  expectedUpdatedAt?: Date | null;
}

/** `downgrade` input (Doc-4G §G4.6) — verified → verified at a STRICTLY lower tier band. */
export interface DowngradeVerifiedTierInput {
  vendorProfileId: string;
  /** `tier : enum<A|B|C|D|E>` — the new (lower) band; must be strictly weaker than the current tier. */
  newTier: FinancialTier;
  /** `expected_revision` realized against `updated_at`. Omit ⇒ use the current row's token. */
  expectedUpdatedAt?: Date | null;
}

/** `suspend` input (Doc-4G §G4.7) — verified → suspended; `reason` mandatory. */
export interface SuspendVerifiedTierInput {
  vendorProfileId: string;
  /** `reason : text : required` (Doc-4G §G4.7) — the mandatory suspension reason. */
  reason: string;
  /** `expected_revision` realized against `updated_at`. Omit ⇒ use the current row's token. */
  expectedUpdatedAt?: Date | null;
}

/** `expire` input (Doc-4G §G4.7) — verified → expired; System; on the 24-month review lapse. Idempotent. */
export interface ExpireVerifiedTierInput {
  vendorProfileId: string;
  /** The "now" the review-due check compares `next_review_at` against (server clock; injectable for tests). */
  now?: Date;
}

/** Result of an applied (or no-op) verified-tier transition (Doc-4G §G4.6/§G4.7 response). Property names
 *  camelCase (Doc-5A Option B); `reference_id` (deferred admin command) rides the envelope, not `result`. */
export interface VerifiedTierResult {
  /** The `verified_financial_tiers.id` (UUIDv7). */
  verifiedFinancialTierId: string;
  /** The vendor the tier belongs to (bare UUID → M2). */
  vendorProfileId: string;
  /** The tier after the transition (A–E). */
  tier: FinancialTier;
  /** The status after the transition. */
  status: VerifiedTierStatus;
  /** `next_review_at` (ISO-8601 UTC) or `null`. */
  nextReviewAt: string | null;
  /** The NEW `updated_at` (ISO-8601 UTC) — the caller's next `expected_revision` optimistic token. */
  updatedAt: string;
  /** `false` ONLY for an `expire` no-op skip (non-verified source) — NO event/audit written on a no-op. */
  applied: boolean;
}

/** Error outcome of a verified-tier transition (Doc-4G §G4.6/§G4.7 error register; classes per Doc-5A §6.2).
 *  The `errorCode` strings are the interim `trust_verified_tier_*` register ([ESC-TRUST-CODE]). */
export interface VerifiedTierError {
  /** Doc-5A §6.2 class → HTTP status (VALIDATION→400 · NOT_FOUND→404 · STATE/CONFLICT→409 · BUSINESS→422). */
  errorClass: "VALIDATION" | "NOT_FOUND" | "STATE" | "CONFLICT" | "BUSINESS";
  /** The interim `trust_verified_tier_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  /** Human-safe, non-leaking message. */
  message: string;
}

/** Outcome of a verified-tier transition. `ok:true` ⇒ applied (or an idempotent expire no-op). */
export type VerifiedTierOutcome =
  | { ok: true; result: VerifiedTierResult }
  | { ok: false; error: VerifiedTierError };

// ── W3-TRUST-4a — BC-TRUST-3 Performance Scoring DTOs (Doc-4G §G6.1/§G6.2/§G6.4; Doc-6G §3.3) ──────────
// The three System write-services (ingest / compute / trigger_review) are exercised DIRECTLY by tests. The
// live Inngest production triggers + M4/M3 event-consumption wiring + the reads (§G6.5) + freeze/reactivate
// (§G6.3, Admin 21.6) are DEFERRED to later WPs. Field names/semantics owned by Doc-4G §G6 + Doc-2 §10.6;
// bound by pointer, never re-authored. All three are System-actor (no slug; Doc-4G §H.3) — no tenant body.

/** The `trust.performance_input_type` value set (Doc-2 §10.6 / Doc-6G §3.3.3; fixed — do not extend). */
export type PerformanceInputTypeValue =
  | "response"
  | "decline"
  | "non_response"
  | "delivery"
  | "feedback"
  | "dispute"
  | "completion";

/** The `trust.performance_source_type` value set (Doc-2 §10.6 / Doc-6G §3.3.3; fixed — do not extend). */
export type PerformanceSourceTypeValue = "invitation" | "quotation" | "engagement" | "wcc";

/** The `trust.score_freeze_state` value set (Doc-2 §10.6 / Doc-6G §3.3.1; fixed). */
export type ScoreFreezeStateValue = "none" | "frozen";

/** `compute_performance_score` trigger (Doc-4G §G6.2 request schema; fixed — do not extend). */
export type PerformanceComputeTrigger =
  | "input_change"
  | "scheduled_recalc"
  | "formula_version_change";

/** `trigger_performance_review` reason (Doc-4G §G6.4 request schema; fixed — do not extend). */
export type PerformanceReviewReason = "threshold_crossing" | "periodic_cadence" | "dispute_pattern";

// ── ingest_performance_input.v1 (Doc-4G §G6.1) — sole writer of performance_inputs; emits NO event ──────

/** Input to `trust.ingest_performance_input.v1` (Doc-4G §G6.1 request schema; System/internal-service). */
export interface IngestPerformanceInputInput {
  /** `vendor_profile_id : uuid : required` — bare cross-module UUID → M2 (no FK). */
  vendorProfileId: string;
  /** `source_type : enum : required` (Doc-2 §10.6 fixed set). */
  sourceType: PerformanceSourceTypeValue;
  /** `source_entity_id : uuid : required` — the invitation/quotation/engagement/wcc ref (bare UUID → M3/M4). */
  sourceEntityId: string;
  /** `input_type : enum : required` (Doc-2 §10.6 fixed set). */
  inputType: PerformanceInputTypeValue;
  /** `occurred_at : timestamptz : required` — when the operational fact occurred. */
  occurredAt: Date;
  /** `value_jsonb : jsonb : optional` (Doc-2 §10.6) — OPAQUE (dev-doc shape); persisted as-is. */
  valueJsonb?: Record<string, unknown> | null;
  /** `source_event_id : uuid : optional` — the Doc-2 §8 event id, for event-sourced dedup provenance. The
   *  DB-enforced dedup is the `(source_type, source_entity_id, input_type)` UNIQUE (Doc-4G §G6.1 §10). */
  sourceEventId?: string | null;
}

/** Injected M0 audit-write surface for ingestion (NO outbox — ingestion emits no event; Doc-4G §G6.1 §8). */
export interface IngestPerformanceInputDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

/** Result of `ingest_performance_input` (Doc-4G §G6.1 §3 — no wire response; internal effect). */
export interface IngestPerformanceInputResult {
  /** The `performance_inputs.id` — the appended row, or (on a dedup replay) the pre-existing row. */
  performanceInputId: string;
  /** `false` on an idempotent dedup replay (NO new row, NO audit); `true` on a fresh append. */
  created: boolean;
}

/** Error outcome of `ingest_performance_input` (Doc-4G §G6.1 error register; classes per Doc-4A §12). */
export interface IngestPerformanceInputError {
  /** VALIDATION→400 · BUSINESS→422 (Doc-4A §12). */
  errorClass: "VALIDATION" | "BUSINESS";
  /** The interim `trust_performance_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  message: string;
}

export type IngestPerformanceInputOutcome =
  | { ok: true; result: IngestPerformanceInputResult }
  | { ok: false; error: IngestPerformanceInputError };

// ── compute_performance_score.v1 (Doc-4G §G6.2) — System; publisher of record for PerformanceScoreUpdated ─

/** Input to `trust.compute_performance_score.v1` (Doc-4G §G6.2 request schema; System trigger). The score is
 *  COMPUTED, never supplied (Doc-4G §H.9a). */
export interface ComputePerformanceScoreInput {
  vendorProfileId: string;
  /** `trigger : enum<input_change|scheduled_recalc|formula_version_change> : required`. */
  trigger: PerformanceComputeTrigger;
}

/** Injected M0 surfaces for compute (audit + outbox — the publish-on-change emit + one audit; Doc-4G §G6.2). */
export interface PerformanceScoreDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** `core.write_outbox_event.v1` (Doc-4B §B10), injected by contract TYPE. */
  writeOutboxEvent: WriteOutboxEvent;
}

/** Result of `compute_performance_score` (Doc-4G §G6.2 §3 internal effect; NOT the public badge — this
 *  internal result carries the numeric score for the System caller; the public numeric `score` stays staff-only). */
export interface ComputePerformanceScoreResult {
  /** The `performance_scores.id` (created on first compute, else the existing head). */
  performanceScoreId: string;
  vendorProfileId: string;
  /** 0–100, or NULL = Not Rated (below the min-threshold gate — never 0). */
  score: number | null;
  /** Interim `level` text (NULL while Not Rated). */
  level: string | null;
  /** The FROZEN min-threshold gate outcome (Doc-6G §3.3.1). `rated = !!score && minThresholdMet`. */
  minThresholdMet: boolean;
  /** `false` = Not Rated (score NULL; never surfaced as 0). */
  rated: boolean;
  /** The current freeze state (compute never mutates it; publication is suppressed while `frozen`). */
  freezeState: ScoreFreezeStateValue;
  /** `true` iff this compute changed (score/level/formula) → a snapshot was appended + one audit written. */
  changed: boolean;
  /** `true` iff a `PerformanceScoreUpdated` event was published (changed AND not frozen). */
  published: boolean;
  /** The `performance_score_updated_at` / optimistic token (ISO-8601 UTC). */
  updatedAt: string;
}

export interface ComputePerformanceScoreError {
  errorClass: "VALIDATION" | "REFERENCE";
  errorCode: string;
  message: string;
}

export type ComputePerformanceScoreOutcome =
  | { ok: true; result: ComputePerformanceScoreResult }
  | { ok: false; error: ComputePerformanceScoreError };

// ── trigger_performance_review.v1 (Doc-4G §G6.4) — System; publisher of record for PerformanceReviewTriggered ─

/** Input to `trust.trigger_performance_review.v1` (Doc-4G §G6.4 request schema; System trigger). No score write. */
export interface TriggerPerformanceReviewInput {
  vendorProfileId: string;
  /** `trigger_reason : enum<threshold_crossing|periodic_cadence|dispute_pattern> : required`. */
  triggerReason: PerformanceReviewReason;
}

/** Result of `trigger_performance_review` (Doc-4G §G6.4 §3 internal effect; a published event for staff attention). */
export interface TriggerPerformanceReviewResult {
  vendorProfileId: string;
  triggerReason: PerformanceReviewReason;
  /** Always `true` on success — the review event was published. NO score value written. */
  triggered: boolean;
}

export interface TriggerPerformanceReviewError {
  errorClass: "VALIDATION" | "REFERENCE";
  errorCode: string;
  message: string;
}

export type TriggerPerformanceReviewOutcome =
  | { ok: true; result: TriggerPerformanceReviewResult }
  | { ok: false; error: TriggerPerformanceReviewError };

// ── W3-TRUST-4b — BC-TRUST-2 Trust Scoring DTOs (Doc-4G §G5.1; Doc-6G §3.2) ────────────────────────────
// The System compute-service (`compute_trust_score`) is exercised DIRECTLY by tests. The live Inngest
// production triggers + event-consumption wiring, the reads (§G5.3 get band via M2 / list history staff), and
// freeze/reactivate (§G5.2, Admin) are DEFERRED to later WPs. Field names/semantics owned by Doc-4G §G5 +
// Doc-2 §3.6/§10.6; bound by pointer, never re-authored. Compute is System-actor (no slug; Doc-4G §H.3) — no
// tenant body. FIREWALL (Invariant #6): the Trust Score CONSUMES Verification + Performance + Fraud only — it
// is INVARIANT to Financial Tier (`verified_financial_tiers` is NEVER read) and to Buyer-Vendor Status.

/** `compute_trust_score` trigger (Doc-4G §G5.1 §2 request schema; fixed — do not extend). NOTE: the Trust-Score
 *  label is `input_signal_change` (NOT `input_change`, which is the Performance §G6.2 trigger). */
export type TrustComputeTrigger =
  | "input_signal_change"
  | "scheduled_recalc"
  | "formula_version_change";

/** Input to `trust.compute_trust_score.v1` (Doc-4G §G5.1 §2 request schema; System trigger). The score is
 *  COMPUTED, never supplied (Doc-4G §H.9a) — no caller score field. */
export interface ComputeTrustScoreInput {
  /** `vendor_profile_id : uuid : required` — bare cross-module UUID → M2 (no FK). */
  vendorProfileId: string;
  /** `trigger : enum<input_signal_change|scheduled_recalc|formula_version_change> : required`. */
  trigger: TrustComputeTrigger;
}

/** Injected M0 surfaces for compute (audit + outbox — the publish-on-change emit + one audit; Doc-4G §G5.1).
 *  Both are M0 TYPES from `@/modules/core/contracts` (the trust module imports NOTHING from M1/M2). */
export interface TrustScoreDeps {
  /** `core.append_audit_record.v1` (Doc-4B §B10), injected by contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** `core.write_outbox_event.v1` (Doc-4B §B10), injected by contract TYPE. */
  writeOutboxEvent: WriteOutboxEvent;
}

/** Result of `compute_trust_score` (Doc-4G §G5.1 §3 internal effect). The numeric `score` is carried to the
 *  System caller only (staff-only; NEVER public / in the `TrustScoreUpdated` event). */
export interface ComputeTrustScoreResult {
  /** The `trust_scores.id` (created on first compute, else the existing head). */
  trustScoreId: string;
  vendorProfileId: string;
  /** 0–100 — ALWAYS a real score (Doc-6G §3.2.1 `score smallint NOT NULL`; NO Not-Rated; absence ≠ 0). */
  score: number;
  /** The PUBLIC band (Doc-2 §3.6). Text (Doc-6G §3.2.1 declares no band enum); always non-empty. */
  band: string;
  /** The current freeze state (compute never mutates it; publication is suppressed while `frozen`). */
  freezeState: ScoreFreezeStateValue;
  /** `true` iff this compute changed (score/band/formula) → a snapshot was appended + one audit written. */
  changed: boolean;
  /** `true` iff a `TrustScoreUpdated` event was published (changed AND not frozen). */
  published: boolean;
  /** The `trust_score_updated_at` / optimistic token (ISO-8601 UTC). */
  updatedAt: string;
}

/** Error outcome of `compute_trust_score` (Doc-4G §G5.1 §9 error register; classes per Doc-4A §12). REFERENCE is
 *  reserved (Doc-4A closed class set) — with the frozen absence-tolerance postures the pipeline emits only
 *  VALIDATION in practice (absent inputs are TOLERATED, not a REFERENCE error). */
export interface ComputeTrustScoreError {
  errorClass: "VALIDATION" | "REFERENCE";
  /** The interim `trust_trust_score_*` register code ([ESC-TRUST-CODE]). */
  errorCode: string;
  message: string;
}

export type ComputeTrustScoreOutcome =
  | { ok: true; result: ComputeTrustScoreResult }
  | { ok: false; error: ComputeTrustScoreError };
