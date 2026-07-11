// Public DTOs / IDs for module "trust" (cross-module surface). DTOs/IDs only — domain value-objects
// stay private. Realized per the module's frozen Doc-4G / Doc-5G / Doc-6G contracts, bound by pointer.
//
// W3-TRUST-2 realizes the `trust.request_verification.v1` write DTOs (Doc-4G §G4.1; wire Doc-5G §4).
// This WP is RESTRICTED to `subject_type = organization`; the other frozen subject types are enumerated
// here (the fixed Doc-2 §10.6 set) but application-DEFERRED (see the command). Field names/semantics are
// owned by Doc-4G §G4.1 + Doc-2 §10.6; bound by pointer, never re-authored.

import type { AppendAuditRecord } from "@/modules/core/contracts";

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
