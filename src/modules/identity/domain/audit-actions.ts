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
 *   ISSUED     → "delegation grant issue"  (Doc-4C §C9 `create_delegation_grant` Audit).
 *   SUSPENDED  → "delegation grant suspend" (Doc-4C §C9 `suspend_delegation_grant` Audit).
 *   REINSTATED → the "delegation suspend/reinstate pair" by pointer — the frozen §C9 reinstate Audit
 *               declaration AUTHORS the binding ("Domain Vendor profile (delegation suspend/reinstate
 *               pair) by pointer — reinstate covered-by-suspend (Patch v1.0.1 PA-02)"): the §9
 *               "delegation grant suspend" family covers the pair; a distinct token records what
 *               actually happened (the user-account SUSPENDED/REINSTATED precedent). W2-IDN-6.5 —
 *               realized with the real reinstate command (`Doc-2_Patch_v1.0.7`).
 *   REVOKED    → "delegation grant revoke"  (Doc-4C §C9 `revoke_delegation_grant` Audit).
 *   EXPIRED    → the "delegation revoke/expiry family" by pointer — carried on `[ESC-IDN-AUDIT]`
 *               (delegation expiry is NOT separately enumerated in §9; Doc-4C §C9 `expire_delegation_grant`
 *               Audit / Patch v1.0.1 PA-02). Attribution is System (§17.3). This is a bound-by-pointer
 *               serialization of the §9 delegation-terminal family — NOT a newly-invented business action.
 * Distinct tokens so the immutable ledger records what actually happened (issue ≠ suspend ≠ reinstate ≠
 * revoke ≠ expire).
 */
export const DelegationGrantAuditAction = {
  ISSUED: "delegation_grant_issued",
  SUSPENDED: "delegation_grant_suspended",
  /** Frozen §C9-authored pointer — §9 suspend/reinstate pair, covered-by-suspend (PA-02). */
  REINSTATED: "delegation_grant_reinstated",
  REVOKED: "delegation_grant_revoked",
  /** `[ESC-IDN-AUDIT]` — bound by pointer to the §9 delegation revoke/expiry family (System attribution). */
  EXPIRED: "delegation_grant_expired",
} as const;

export type DelegationGrantAuditActionToken =
  (typeof DelegationGrantAuditAction)[keyof typeof DelegationGrantAuditAction];

// ─────────────────────────────────────────────────────────────────────────────
// Membership lifecycle audit actions (W2-IDN-5 System timers + W2-IDN-6.3 wired §C6 commands).
// BUSINESS actions live in Doc-2 §9 "Organization" domain ("create, membership
// invite/accept/suspend/remove, …") — so, like the delegation tokens, NO Doc-2 §9 patch is authored;
// these tokens bind BY POINTER to the existing §9 actions. The token STRINGS are the Doc-4C-class
// serialization; a future rename touches Doc-4C + this constant, never Doc-2. Imported as NAMED
// CONSTANTS — never a hardcoded literal (Board ruling 2026-06-30).
// ─────────────────────────────────────────────────────────────────────────────

/** The audit `entity_type` for `identity.memberships` rows (Doc-4C §C6 Mutation-Scope `identity.memberships`). */
export const MEMBERSHIP_ENTITY_TYPE = "membership" as const;

/**
 * Canonical membership audit actions:
 *   INVITED   → `→ invited` (`invite_member`, W2-IDN-6.3). Bound to the ENUMERATED Doc-2 §9
 *               "Organization" action "membership invite" (Doc-4C §C6 invite Audit, PassB:354:
 *               'Domain Organization "membership invite" (§9)'). Attribution: User.
 *   ACCEPTED  → `invited → pending` (`accept_invitation`, W2-IDN-6.3). Bound to the ENUMERATED §9
 *               action "membership accept" (Doc-4C §C6 accept Audit, PassB:369: 'Domain Organization
 *               "membership accept" (§9)'). Attribution: User (the invitee).
 *   ACTIVATED → `pending → active` (`activate_membership`). Bound BY POINTER via **`[ESC-IDN-AUDIT]`** —
 *               Doc-4C §C6 `activate_membership` Audit: "Domain Organization (membership activation, §9) by
 *               pointer — `[ESC-IDN-AUDIT]` (no enumerated 'membership activate' action)". Attribution System
 *               (§17.3). NOT a newly-invented business action — a bound-by-pointer serialization of the §9
 *               "membership …/accept" activation family.
 *   SUSPENDED / REINSTATED → `active ⇄ suspended` (`set_membership_status`, W2-IDN-6.3). Bound to the
 *               ENUMERATED §9 action "membership suspend" — the frozen declaration (Doc-4C §C6
 *               PassB:397) AUTHORS the coverage: 'the suspend action records either direction
 *               (reinstate inverse-leg covered-by-suspend, per Patch v1.0.1 PA-02)'. ONE §9 business
 *               action; two SERIALIZATION tokens so the immutable ledger records what actually
 *               happened — the ratified `delegation_grant_reinstated` covered-by-suspend precedent
 *               (RV-0150 Adjudication 2 class; no business action invented). Attribution: User.
 *   REMOVED   → `→ removed` — the ENUMERATED §9 action "membership remove", shared BY FROZEN
 *               DECLARATION across its three legs: `expire_invitation` (PassB:439, System),
 *               `remove_member` (PassB:411, User) and `revoke_invitation` (PassB:425, User) all
 *               declare 'Domain Organization "membership remove" (§9)'. ONE token; the audited
 *               old/new field sets discriminate the leg (old state invited = revoke/expire;
 *               active|suspended = remove) and attribution discriminates System vs User.
 * Distinct tokens only where the ledger needs them; nothing coined.
 */
export const MembershipAuditAction = {
  /** §9 "membership invite" (enumerated); the `invite_member` `→ invited` leg (User). */
  INVITED: "membership_invited",
  /** §9 "membership accept" (enumerated); the `accept_invitation` `invited → pending` leg (User). */
  ACCEPTED: "membership_accepted",
  /** `[ESC-IDN-AUDIT]` — bound by pointer to §9 membership activation family (System attribution). */
  ACTIVATED: "membership_activated",
  /** §9 "membership suspend" (enumerated); the `active → suspended` leg (User). */
  SUSPENDED: "membership_suspended",
  /** §9 "membership suspend" — reinstate covered-by-suspend (PassB:397 / PA-02); `suspended → active` (User). */
  REINSTATED: "membership_reinstated",
  /** §9 "membership remove" (enumerated); the `→ removed` legs (expire=System · remove/revoke=User). */
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

// ─────────────────────────────────────────────────────────────────────────────
// Organization audit actions (W2-IDN-6.2 — the §C5 wired organization commands). Doc-2 §9 enumerates
// the "Organization" domain: "create, membership invite/accept/suspend/remove, role/permission change,
// ownership change/succession, workflow settings change, subscription change, soft delete/restore" —
// so FIVE of the seven §C5 actions bind to ENUMERATED §9 business actions; the org-profile change and
// the admin suspend/reinstate pair are Doc-4C-authored interim pointers on the frozen `[ESC-IDN-AUDIT]`
// channel (§C5 PassB:263/:320 author them per contract). NOTHING is invented: token STRINGS are the
// Doc-4C-class serialization (a rename touches Doc-4C + this constant, never Doc-2). Named CONSTANTS —
// never literals (Board ruling 2026-06-30).
// ─────────────────────────────────────────────────────────────────────────────

/** The audit `entity_type` for `identity.organizations` rows (Doc-4C §C5 Mutation-Scope
 *  `identity.organizations`). */
export const ORGANIZATION_ENTITY_TYPE = "organization" as const;

/**
 * Canonical organization audit actions (the seven audited §C5 commands):
 *   CREATED     → `create_organization` — the ENUMERATED §9 Organization action "create"
 *                 (Doc-4C §C5: 'Domain Organization "create" (§9)'). Attribution: User.
 *   PROFILE_UPDATED → `update_organization_profile` — `[ESC-IDN-AUDIT]` (Doc-4C §C5 PassB:263:
 *                 "Domain Organization (org-profile change) by pointer — [ESC-IDN-AUDIT] (no
 *                 enumerated §9 org-profile-change action)"). Nearest §9 family: the Organization
 *                 domain row. Attribution: User.
 *   OWNERSHIP_TRANSFERRED → `transfer_ownership` — the ENUMERATED §9 Organization action
 *                 "ownership change/succession" (Doc-4C §C5 PassB:277). Attribution: User (Owner).
 *   SOFT_DELETED / RESTORED → `soft_delete_organization` / `restore_organization` — the ENUMERATED
 *                 §9 Organization action "soft delete/restore" (Doc-4C §C5 PassB:291/:306). Two
 *                 distinct tokens so the immutable ledger records what actually happened
 *                 (the delegation/user-account precedent). Attribution: User (Owner) / Admin.
 *   SUSPENDED / REINSTATED → `set_organization_status` — `[ESC-IDN-AUDIT]` (Doc-4C §C5 PassB:320
 *                 AUTHORS the pointer: 'Domain Organization + Platform ("Super Admin access
 *                 (flagged)", §9) by pointer — [ESC-IDN-AUDIT] (org suspend/reinstate not
 *                 separately enumerated)'). Attribution: Admin.
 *   OWNERSHIP_RECOVERED → `admin_recover_ownership` — the ENUMERATED §9 Organization action
 *                 "ownership change/succession" (Doc-4C §C5 PassB:334; distinct token from the User
 *                 transfer so the ledger records the RECOVERY path — Master Architecture §5.5:
 *                 "Every recovery action requires an audit record, a reason code, and an approver
 *                 identity"). Attribution: Admin.
 */
export const OrganizationAuditAction = {
  /** §9 Organization "create" (enumerated). */
  CREATED: "organization_created",
  /** `[ESC-IDN-AUDIT]` — §C5-authored pointer; nearest §9 Organization-domain family. */
  PROFILE_UPDATED: "organization_profile_updated",
  /** §9 Organization "ownership change/succession" (enumerated; the User transfer leg). */
  OWNERSHIP_TRANSFERRED: "organization_ownership_transferred",
  /** §9 Organization "soft delete/restore" (enumerated; the soft-delete leg). */
  SOFT_DELETED: "organization_soft_deleted",
  /** §9 Organization "soft delete/restore" (enumerated; the restore leg). */
  RESTORED: "organization_restored",
  /** `[ESC-IDN-AUDIT]` — §9 Domain Organization + Platform pointer authored in §C5 (Admin). */
  SUSPENDED: "organization_suspended",
  /** `[ESC-IDN-AUDIT]` — §9 Domain Organization + Platform pointer authored in §C5 (Admin). */
  REINSTATED: "organization_reinstated",
  /** §9 Organization "ownership change/succession" (enumerated; the Admin recovery leg). */
  OWNERSHIP_RECOVERED: "organization_ownership_recovered",
} as const;

export type OrganizationAuditActionToken =
  (typeof OrganizationAuditAction)[keyof typeof OrganizationAuditAction];

// ─────────────────────────────────────────────────────────────────────────────
// Role & permission audit actions (W2-IDN-6.4 — the §C7 wired role commands). Doc-2 §9 ENUMERATES
// the "Organization" domain action **"role/permission change"** (line 686: "membership
// invite/accept/suspend/remove, **role/permission change**, ownership change/succession, …") — so,
// UNLIKE the buyer-profile / user-account tokens, ALL FOUR audited §C7 writes bind BY POINTER to an
// ENUMERATED §9 action (NO `[ESC-IDN-AUDIT]` channel — the enumerated-action precedent of the
// membership `INVITED`/`ACCEPTED` tokens). Each contract's Audit declaration authors the SAME bind:
// `create_role` (PassB:482), `update_role` (PassB:494), `set_role_permissions` (PassB:507),
// `delete_role` (PassB:519) all state 'Domain Organization "role/permission change" (§9)'. The token
// STRINGS are the Doc-4C-class serialization; a future rename touches Doc-4C + this constant, never
// Doc-2. Named CONSTANTS — never a hardcoded literal (Board ruling 2026-06-30).
// ─────────────────────────────────────────────────────────────────────────────

/** The audit `entity_type` for `identity.roles` rows. Every §C7 write records the "role/permission
 *  change" against the ROLE aggregate (`set_role_permissions` Mutation-Scope is `identity.role_
 *  permissions` per PassB:507, but the audited entity is the role the composition belongs to — the
 *  membership/org aggregate-entity precedent; the added/removed/effective slugs ride the payload). */
export const ROLE_ENTITY_TYPE = "role" as const;

/**
 * Canonical role/permission audit actions — each bound BY POINTER to the ENUMERATED Doc-2 §9
 * Organization action "role/permission change" (never `[ESC-IDN-AUDIT]`; the action is enumerated):
 *   CREATED             → `create_role` (`→` a NEW custom bundle; `old_value = null`).
 *   UPDATED             → `update_role` (bundle metadata / name change).
 *   PERMISSIONS_CHANGED → `set_role_permissions` (N:N composition add/remove; removal = an audited
 *                         revocation, PassB:503/:509 — "removing a slug is an audited revocation").
 *   DELETED             → `delete_role` (ADR-012 soft-delete — never a hard delete; Invariant #8).
 * FOUR distinct SERIALIZATION tokens so the immutable ledger records what actually happened
 * (create ≠ rename ≠ recompose ≠ delete) — the delegation/user-account/org distinct-token precedent;
 * ONE §9 business action ("role/permission change"), nothing coined. Attribution: User (§17.3).
 */
export const RoleAuditAction = {
  /** §9 Organization "role/permission change" (enumerated); the `create_role` `→` NEW bundle leg. */
  CREATED: "role_created",
  /** §9 Organization "role/permission change" (enumerated); the `update_role` rename leg. */
  UPDATED: "role_updated",
  /** §9 Organization "role/permission change" (enumerated); the `set_role_permissions` compose leg
   *  (add/remove; a removal is an audited revocation — PassB:503/:509). */
  PERMISSIONS_CHANGED: "role_permissions_changed",
  /** §9 Organization "role/permission change" (enumerated); the `delete_role` ADR-012 soft-delete leg. */
  DELETED: "role_deleted",
} as const;

export type RoleAuditActionToken = (typeof RoleAuditAction)[keyof typeof RoleAuditAction];

// ─────────────────────────────────────────────────────────────────────────────
// Organization workflow-settings audit action (W2-IDN-6.8 — the §C11 wired update command). Doc-2 §9
// ENUMERATES the "Organization" domain action **"workflow settings change"** (line 686: "… ownership
// change/succession, **workflow settings change**, subscription change, soft delete/restore") — so,
// like the role/permission-change + membership-invite tokens, this write binds BY POINTER to an
// ENUMERATED §9 action (NO `[ESC-IDN-AUDIT]` channel — the action is enumerated; and Doc-4C Appendix A
// carries NO `A` marker on `update_workflow_settings`, only `DC-5`, PassB:792). The frozen §C11 Audit
// declaration AUTHORS the bind (PassB:724: 'yes; Domain Organization "workflow settings change" (§9)').
// The token STRING is the Doc-4C-class serialization; a future rename touches Doc-4C + this constant,
// never Doc-2. Named CONSTANT — never a hardcoded literal (Board ruling 2026-06-30).
// ─────────────────────────────────────────────────────────────────────────────

/** The audit `entity_type` for `identity.organization_workflow_settings` rows (Doc-4C §C11
 *  Mutation-Scope `organization_workflow_settings`; the Doc-6C §3.7 entity). [logged judgment call —
 *  the entity/table name is used verbatim: unlike `buyer_profiles`→`buyer_profile` (a count-plural),
 *  the trailing "settings" is a collective noun with no natural singular, so the least-inventive
 *  serialization is the frozen table/entity name unchanged — the buyer-profile "specific child
 *  entity, not the aggregate root" precedent applied to a non-count-plural table name.] */
export const WORKFLOW_SETTINGS_ENTITY_TYPE = "organization_workflow_settings" as const;

/**
 * Canonical organization-workflow-settings audit action — bound BY POINTER to the ENUMERATED Doc-2 §9
 * "Organization" action "workflow settings change" (Doc-2 line 686; §C11 update Audit PassB:724). ONE
 * §9 business action, ONE serialization token (the enumerated-action `role_*` / `membership_invited`
 * precedent — a settings change is a single "changed" leg). Attribution: User (§17.3).
 */
export const WorkflowSettingsAuditAction = {
  /** §9 Organization "workflow settings change" (enumerated); the `update_workflow_settings` leg (User). */
  CHANGED: "workflow_settings_changed",
} as const;

export type WorkflowSettingsAuditActionToken =
  (typeof WorkflowSettingsAuditAction)[keyof typeof WorkflowSettingsAuditAction];
