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
