// M1 domain — canonical audit-action constants for identity entities (the realized serialization
// tokens). Realizes:
//   - `Doc-2_Patch_v1.0.4` — the BUSINESS actions "buyer profile create" / "buyer profile update"
//     (§9 Organization domain; business semantics only).
//   - `Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2` — the WIRE realization: the `action` token strings
//     + `entity_type` for those two business actions.
//
// These are the FROZEN serialization constants the M1 buyer-profile write appends to
// `core.audit_records` via `core.append_audit_record.v1`. They are imported as NAMED CONSTANTS — never
// hardcoded string literals (Board ruling 2026-06-30). The BUSINESS meaning is owned by rank-0 Doc-2;
// the SERIALIZATION (these tokens + entity_type) is owned by Doc-4C v1.0.2 — so a future token rename
// changes Doc-4C + this constant, NEVER reopens Doc-2.

/** The audit `entity_type` for `buyer_profiles` rows (Doc-4C v1.0.2). */
export const BUYER_PROFILE_ENTITY_TYPE = "buyer_profile" as const;

/**
 * Canonical buyer-profile audit actions (Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2 → Doc-2 §9 business
 * actions "buyer profile create" / "buyer profile update"). TWO distinct actions so the immutable audit
 * ledger records what actually happened — a create is materially different from an update.
 */
export const BuyerProfileAuditAction = {
  /** "buyer profile create" → the create leg (`old_value = null`). */
  CREATED: "buyer_profile_created",
  /** "buyer profile update" → the update leg (`old_value` = prior field set). */
  UPDATED: "buyer_profile_updated",
} as const;

export type BuyerProfileAuditActionToken =
  (typeof BuyerProfileAuditAction)[keyof typeof BuyerProfileAuditAction];
