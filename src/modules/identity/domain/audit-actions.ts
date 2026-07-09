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

// ─────────────────────────────────────────────────────────────────────────────
// Membership lifecycle audit actions (W2-IDN-5). BUSINESS actions live in Doc-2 §9 "Organization" domain
// ("create, membership invite/accept/suspend/remove, …") — so, like the delegation tokens, NO Doc-2 §9 patch
// is authored; these tokens bind BY POINTER to the existing §9 actions. The token STRINGS are the Doc-4C-class
// serialization; a future rename touches Doc-4C + this constant, never Doc-2. Imported as NAMED CONSTANTS —
// never a hardcoded literal (Board ruling 2026-06-30). Only the two System-timer edges realized this WP append
// audit rows; the remaining membership edges (invite/accept/suspend/reinstate/remove) are W2-IDN-6.2's wired
// commands and bind their own tokens then.
// ─────────────────────────────────────────────────────────────────────────────

/** The audit `entity_type` for `identity.memberships` rows (Doc-4C §C6 Mutation-Scope `identity.memberships`). */
export const MEMBERSHIP_ENTITY_TYPE = "membership" as const;

/**
 * Canonical membership audit actions realized this WP (the two System-timer edges only):
 *   ACTIVATED → `pending → active` (`activate_membership`). Bound BY POINTER via **`[ESC-IDN-AUDIT]`** —
 *               Doc-4C §C6 `activate_membership` Audit: "Domain Organization (membership activation, §9) by
 *               pointer — `[ESC-IDN-AUDIT]` (no enumerated 'membership activate' action)". Attribution System
 *               (§17.3). NOT a newly-invented business action — a bound-by-pointer serialization of the §9
 *               "membership …/accept" activation family.
 *   REMOVED   → `invited → removed` via expire (`expire_invitation`). Bound to the ENUMERATED Doc-2 §9
 *               "Organization" action "membership … remove" (Doc-4C §C6 `expire_invitation` Audit: "Domain
 *               Organization 'membership remove' (§9) by pointer"). Attribution System (§17.3).
 * Distinct tokens so the immutable ledger records what actually happened (activate ≠ remove).
 */
export const MembershipAuditAction = {
  /** `[ESC-IDN-AUDIT]` — bound by pointer to §9 membership activation family (System attribution). */
  ACTIVATED: "membership_activated",
  /** Bound to §9 "membership remove" (enumerated); the `expire_invitation` `invited → removed` leg. */
  REMOVED: "membership_removed",
} as const;

export type MembershipAuditActionToken =
  (typeof MembershipAuditAction)[keyof typeof MembershipAuditAction];

// ─────────────────────────────────────────────────────────────────────────────
// User-account audit actions (W2-IDN-6.1 — the §C4 wired user commands). Doc-2 §9 enumerates NO
// "User" domain, so ALL THREE audited §C4 user actions bind interim BY POINTER on the frozen
// `[ESC-IDN-AUDIT]` channel — exactly as Doc-4C §C4 itself directs per contract (PassB:197/211/225)
// and §C12.3 confirms ("user-account suspend/reinstate, anonymization, 2FA-settings change" are the
// carried coverage). NOTHING is invented: each token below serializes a Doc-4C-authored interim
// binding to its NEAREST Doc-2 §9 family; the channel's future §9 additive ratifies or renames them
// (a rename touches Doc-4C + this constant, never Doc-2). Named CONSTANTS — never literals (Board
// ruling 2026-06-30). NOTE: `update_user_profile` is NOT here — frozen Doc-4C §C4 declares it
// `Audit: no` (PassB:183, "profile/preference edits are operational, not a Doc-2 §9 MUST-audit
// action") and §C12.3's coverage list omits it; auditing it would require inventing an action.
// ─────────────────────────────────────────────────────────────────────────────

/** The audit `entity_type` for `identity.users` rows (Doc-4C §C4 Mutation-Scope `identity.users`). */
export const USER_ENTITY_TYPE = "user" as const;

/**
 * Canonical user-account audit actions (the three AUDITED §C4 user commands):
 *   TWO_FA_SETTINGS_UPDATED → `update_user_2fa_settings` (Doc-4C §C4: "account-security setting
 *               change — [ESC-IDN-AUDIT] (no enumerated Doc-2 §9 user-2FA-settings action; interim
 *               bind nearest by pointer)"). Nearest §9 family: Domain Platform's security-sensitive
 *               operations family ("Super Admin access (flagged)" / "service-role sensitive
 *               operations") — the same Platform family §C4 itself names for the user-status action.
 *               Attribution: User (self).
 *   DEACTIVATED → `deactivate_own_account` (Doc-4C §C4: "anonymization follows the §14.3 /
 *               Architecture §14.3 compliance-redaction model; [ESC-IDN-AUDIT] (no enumerated §9
 *               user-anonymization action; interim nearest by pointer)"). Nearest §9 family: the §9
 *               preamble redaction rule ("Redaction of sensitive fields creates a new audit event")
 *               + Domain Platform "audit redaction (event)". Attribution: User (self). The audit
 *               old/new payload carries STATUS + anonymized FIELD NAMES ONLY — never the personal
 *               values (recording them would defeat the redaction the action performs).
 *   SUSPENDED / REINSTATED → `set_user_account_status` (Doc-4C §C4 AUTHORS the pointer verbatim:
 *               "Domain Platform ('Super Admin access (flagged)' / 'service-role sensitive
 *               operations', §9) by pointer — [ESC-IDN-AUDIT] (no separately enumerated user-status
 *               action)"). Attribution: Admin. Two distinct tokens so the immutable ledger records
 *               what actually happened (suspend ≠ reinstate — the delegation-token precedent).
 */
export const UserAccountAuditAction = {
  /** `[ESC-IDN-AUDIT]` — nearest §9 Platform security-sensitive family (User attribution). */
  TWO_FA_SETTINGS_UPDATED: "user_2fa_settings_updated",
  /** `[ESC-IDN-AUDIT]` — §9 preamble redaction rule / Platform "audit redaction (event)" family. */
  DEACTIVATED: "user_account_deactivated",
  /** `[ESC-IDN-AUDIT]` — §9 Domain Platform pointer authored in Doc-4C §C4 (Admin attribution). */
  SUSPENDED: "user_account_suspended",
  /** `[ESC-IDN-AUDIT]` — §9 Domain Platform pointer authored in Doc-4C §C4 (Admin attribution). */
  REINSTATED: "user_account_reinstated",
} as const;

export type UserAccountAuditActionToken =
  (typeof UserAccountAuditAction)[keyof typeof UserAccountAuditAction];
