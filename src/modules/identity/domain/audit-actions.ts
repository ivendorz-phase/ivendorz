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

// ─────────────────────────────────────────────────────────────────────────────
// Delegation-grant audit actions (W2-IDN-4). BUSINESS actions are already enumerated in Doc-2 §9 (the
// "Vendor profile" domain row: "delegation grant issue/suspend/revoke") — so, UNLIKE the buyer-profile
// tokens, NO Doc-2 §9 patch is authored; these tokens bind BY POINTER to the existing §9 actions (Doc-4C
// §C9 "Audit … by pointer"). The token STRINGS are the Doc-4C-class serialization (like `buyer_profile_
// created`); a future rename touches Doc-4C + this constant, never Doc-2. Imported as NAMED CONSTANTS —
// never a hardcoded literal (Board ruling 2026-06-30).
// ─────────────────────────────────────────────────────────────────────────────

/** The audit `entity_type` for `identity.delegation_grants` rows (Doc-4C §C9 Mutation-Scope). */
export const DELEGATION_GRANT_ENTITY_TYPE = "delegation_grant" as const;

/**
 * Canonical delegation-grant audit actions — each bound BY POINTER to Doc-2 §9 "Vendor profile" domain:
 *   ISSUED    → "delegation grant issue"  (Doc-4C §C9 `create_delegation_grant` Audit).
 *   SUSPENDED → "delegation grant suspend" (Doc-4C §C9 `suspend_delegation_grant` Audit).
 *   REVOKED   → "delegation grant revoke"  (Doc-4C §C9 `revoke_delegation_grant` Audit).
 *   EXPIRED   → the "delegation revoke/expiry family" by pointer — carried on `[ESC-IDN-AUDIT]`
 *               (delegation expiry is NOT separately enumerated in §9; Doc-4C §C9 `expire_delegation_grant`
 *               Audit / Patch v1.0.1 PA-02). Attribution is System (§17.3). This is a bound-by-pointer
 *               serialization of the §9 delegation-terminal family — NOT a newly-invented business action.
 * Distinct tokens so the immutable ledger records what actually happened (issue ≠ suspend ≠ revoke ≠ expire).
 */
export const DelegationGrantAuditAction = {
  ISSUED: "delegation_grant_issued",
  SUSPENDED: "delegation_grant_suspended",
  REVOKED: "delegation_grant_revoked",
  /** `[ESC-IDN-AUDIT]` — bound by pointer to the §9 delegation revoke/expiry family (System attribution). */
  EXPIRED: "delegation_grant_expired",
} as const;

export type DelegationGrantAuditActionToken =
  (typeof DelegationGrantAuditAction)[keyof typeof DelegationGrantAuditAction];
