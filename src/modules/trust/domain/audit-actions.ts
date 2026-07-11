// M5 domain — canonical audit-action constants for trust verification entities (the realized
// serialization token). Realizes the ENUMERATED Doc-2 §9 Trust action "verification request":
//   - Doc-4G §G4.1 §7 (Audit Binding): "Action Doc-2 §9 Trust 'verification request' (separately
//     enumerated) · Attribution User (`requested_by`) · new `verification_records` row · same
//     transaction · Source Doc-2 §9 + Doc-4B `core.append_audit_record.v1`."
//   - Doc-2 §9 (Trust domain row): "verification request/decision/revoke/expiry, …" — "verification
//     request" is SEPARATELY ENUMERATED (Doc-4G Part1 §H.6 confirms), so — UNLIKE the assignment /
//     verified-tier transitions that carry `[ESC-TRUST-AUDIT]` — this token binds BY POINTER to an
//     ENUMERATED §9 action (NO `[ESC-TRUST-AUDIT]`; that marker is reserved for the non-enumerated
//     Trust actions per Doc-4G §H.6). The token STRING is the Doc-4G-class serialization; a future
//     rename touches Doc-4G/Doc-6G + this constant, never Doc-2.
//
// Imported as a NAMED CONSTANT — never a hardcoded string literal (the identity delegation/role-token
// precedent, Board ruling 2026-06-30). The audit is appended to `core.audit_records` via the M0
// `core.append_audit_record.v1` facade, atomically with the verification-case write.

/** The audit `entity_type` for `trust.verification_records` rows (Doc-4G §G4.1 · Doc-6G §3.1.1). */
export const VERIFICATION_RECORD_ENTITY_TYPE = "verification_record" as const;

/**
 * Canonical verification-record audit actions.
 *   REQUESTED → the `trust.request_verification.v1` open-case leg — bound BY POINTER to the ENUMERATED
 *               Doc-2 §9 Trust action "verification request" (Doc-4G §G4.1 §7). Attribution: User
 *               (`requested_by`). One §9 business action, one serialization token (the open-case leg).
 */
export const VerificationAuditAction = {
  /** §9 Trust "verification request" (enumerated); the `request_verification` open-case leg (User). */
  REQUESTED: "verification_requested",
} as const;

export type VerificationAuditActionToken =
  (typeof VerificationAuditAction)[keyof typeof VerificationAuditAction];
