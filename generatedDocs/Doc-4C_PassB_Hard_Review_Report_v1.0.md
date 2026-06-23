# Doc-4C Pass-B Independent Architecture Hard Review Report v1.0

## Review Metadata

| Field | Value |
|---|---|
| Review Type | Independent Architecture Hard Review — Defect Hunting |
| Subject | `Doc-4C_Content_v1.0_PassB.md` |
| Review Gate | Freeze Patch Stage / Freeze Audit |
| Corpus Baseline | Architecture FINAL · ADRs v1 · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A v1.0 (incl. FreezeAudit Patch v1.0.1) · Doc-4B v1.0 · Doc-4C Structure v1.0 FROZEN · Doc-4C Content v1.0 Pass-A CLOSED (as amended by Patch v1.0.1) |
| Reviewer Mode | Hard Review · Defect Hunting · No Feature Expansion · No Architecture Redesign · No Ownership Reallocation · No Module Boundary Changes |
| Corpus Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C Structure → Doc-4C Pass-A CLOSED |

---

## Executive Summary

Doc-4C Pass-B implementation-hardens 42 contracts across 9 owned identity entities. The document correctly carries all Pass-A structure, template assignments, actor designations, escalation markers, and freeze-gate dependencies unchanged. The §B convention architecture is sound, the firewall declarations are correct, the tenancy declarations are correct, the DC-1–DC-5 posture is preserved, and the ESC marker bindings are faithfully propagated.

However, the review identifies **2 BLOCKER-severity** findings and **3 MAJOR-severity** findings that preclude Freeze Audit entry:

- **BLOCKER-01:** Missing Rate-Limit blocks for POLICY-stage validation rules (`create_organization`, `update_workflow_settings`) — a CHK-215 (Doc-4A §19.3) mandatory requirement for every contract bearing a Category 9 rule.
- **BLOCKER-02:** Pervasive omission of CONFLICT error from 10 out of 12 expected contracts that accept an `updated_at` concurrency token — a systematic concurrency-control gap covering every delegation management command, three membership management commands, two role management commands, and restore/recovery paths.
- **MAJOR-01:** Missing DELEGATION validation stage in `reinstate_delegation_grant` — structurally inapplicable exclusion does not apply; both sibling commands (`suspend`, `revoke`) include this stage for the same §6B controller check.
- **MAJOR-02:** `create_organization` CONFLICT error (`identity_org_personal_exists`) is mislabeled: the issue is a uniqueness/existence precondition (BUSINESS or VALIDATION semantics), not an optimistic-concurrency stale-token collision (CONFLICT). The error-class registration is incorrect.
- **MAJOR-03:** `set_membership_status` CONFLICT error absent despite carrying `updated_at : timestamp : required`; uniquely notable because this is a non-terminal state-reversible command (unlike the terminal commands in BLOCKER-02 which could be argued less critical), making the concurrency gap operationally active on every repeated suspend/reinstate cycle.

The 2 BLOCKER and 3 MAJOR findings collectively require a targeted Freeze Patch before Freeze Audit can proceed.

**2 MINOR** and **1 NITPICK** findings are also recorded.

---

## Findings Table

### BLOCKER Findings

---

**Finding B-01**

| Field | Detail |
|---|---|
| Finding ID | B-01 |
| Severity | BLOCKER |
| Affected Section | §C5 `identity.create_organization.v1`; §C11 `identity.update_workflow_settings.v1` |
| Corpus Citation | Doc-4A §19.2 / §19.3; Doc-4A Appendix A CHK-215 (Severity B) |

**Issue:** Both contracts declare a POLICY-stage Category 9 validation rule in their Validation Matrix, but neither includes a Rate-Limit block.

- `identity.create_organization.v1` (§C5, line ~245): Validation Matrix includes `→ POLICY (per-user org-count cap if configured [DC-5])`; Error Register declares `identity_org_quota_exceeded (QUOTA, no)`. No Rate-Limit block present declaring `V<n>-Type`, `Policy-Key`, `Attribution`, `Reset-Interval`, or `Error-Class`.

- `identity.update_workflow_settings.v1` (§C11, line ~720): Validation Matrix includes `→ POLICY (bounds resolved via Doc-4B core.config_value_query.v1 where Doc-3 §12.3 defines)`. No Rate-Limit block present.

Doc-4A §19.3 states: "Every contract with a Category 9 validation rule MUST include a Rate-Limit block for each V\<n\> limit rule, declaring: `V<n>-Type: quota | throughput; Policy-Key: ...; Attribution: ...; Reset-Interval: ...; Error-Class: QUOTA | RATE_LIMITED`." CHK-215 flags this as a Blocker-level checklist item.

**Risk:** Implementors have no Rate-Limit block to bind the enforcement mechanism to. An AI agent or backend engineer following the contract will implement the POLICY stage without a quota-enforcement specification, leading to either no enforcement or an invented enforcement model that diverges from the POLICY key registration path. This is a mandatory contract completeness defect.

**Recommended Resolution:** For each contract, add a `Rate-Limit` block immediately following the Validation Matrix. For `create_organization`: `V9-Type: quota; Policy-Key: identity.command_dedup_window [DC-5] / per-user-org-count-cap intended key [DC-5]; Attribution: user_id; Reset-Interval: per DC-5 registration; Error-Class: QUOTA`. For `update_workflow_settings`: `V9-Type: throughput (or quota per DC-5 registration); Policy-Key: [DC-5] intended key; Attribution: organization_id; Reset-Interval: [DC-5]; Error-Class: RATE_LIMITED or QUOTA`. DC-5 deferral is acceptable in the block body (values pending registration) but the block structure is mandatory.

---

**Finding B-02**

| Field | Detail |
|---|---|
| Finding ID | B-02 |
| Severity | BLOCKER |
| Affected Section | §C5 `identity.restore_organization.v1`; §C5 `identity.admin_recover_ownership.v1`; §C6 `identity.set_membership_status.v1`; §C6 `identity.remove_member.v1`; §C6 `identity.revoke_invitation.v1`; §C7 `identity.set_role_permissions.v1`; §C7 `identity.delete_role.v1`; §C9 `identity.suspend_delegation_grant.v1`; §C9 `identity.reinstate_delegation_grant.v1`; §C9 `identity.revoke_delegation_grant.v1` |
| Corpus Citation | Doc-4A §14 (optimistic concurrency); §B.2 "Concurrency token: `updated_at` on mutable entities, optimistic concurrency on updates"; Doc-4A §12.2 (`CONFLICT` class definition: "concurrent modification / stale-token collision") |

**Issue:** Ten contracts accept `updated_at : timestamp : required` as an optimistic concurrency token in the Request Contract but declare no `CONFLICT` error in the Error Register.

The pattern is inconsistent with the 12 contracts in the same document that correctly declare `CONFLICT`:
- `update_user_profile` → `identity_user_update_conflict (CONFLICT)` ✓
- `update_user_2fa_settings` → `identity_user_update_conflict (CONFLICT)` ✓
- `deactivate_own_account` → `identity_user_update_conflict (CONFLICT)` ✓
- `set_user_account_status` → `identity_user_status_conflict (CONFLICT)` ✓
- `update_organization_profile` → `identity_org_update_conflict (CONFLICT)` ✓
- `transfer_ownership` → `identity_org_update_conflict (CONFLICT)` ✓
- `soft_delete_organization` → `identity_org_update_conflict (CONFLICT)` ✓
- `set_organization_status` → `identity_org_status_conflict (CONFLICT)` ✓
- `update_role` → `identity_role_name_conflict (CONFLICT)` ✓ (note: this CONFLICT code is for name uniqueness — see MAJOR-02 analog below — but a stale-token CONFLICT is also structurally required given `updated_at : required`)
- `upsert_buyer_profile` → `identity_buyer_profile_conflict (CONFLICT)` ✓
- `update_workflow_settings` → `identity_workflow_conflict (CONFLICT)` ✓

The ten deficient contracts, their tokens, and what their Error Registers contain:

| Contract | updated_at | Error Register (CONFLICT absent) |
|---|---|---|
| `restore_organization` | required | `invalid_input, forbidden, not_found, state_invalid` |
| `admin_recover_ownership` | required | `invalid_input, forbidden, not_found, user_not_found, recovery_invalid` |
| `set_membership_status` | required | `invalid_input, forbidden, not_found, state_invalid, last_owner_block` |
| `remove_member` | required | `invalid_input, forbidden, not_found, state_invalid, last_owner_block` |
| `revoke_invitation` | required | `invalid_input, forbidden, not_found, state_invalid` |
| `set_role_permissions` | required | `invalid_input, forbidden, not_found, slug_unknown, system_protected` |
| `delete_role` | required | `invalid_input, forbidden, not_found, system_protected, in_use` |
| `suspend_delegation_grant` | required | `invalid_input, forbidden, not_found, state_invalid` |
| `reinstate_delegation_grant` | required | `invalid_input, forbidden, not_found, state_invalid` |
| `revoke_delegation_grant` | required | `invalid_input, forbidden, not_found, state_invalid` |

For terminal-state commands (`remove_member → removed`, `revoke_invitation → removed`, `revoke_delegation_grant → revoked`), the concurrency gap is operationally real: two concurrent requests with a stale `updated_at` will both attempt the terminal transition; the second will hit a STATE error (already terminal), but the contract has no CONFLICT path for the stale-token case specifically, which has distinct semantics from a STATE error — they require different client handling (retry vs. halt). For non-terminal commands (`set_membership_status`, `suspend_delegation_grant`, `reinstate_delegation_grant`, `restore_organization`, `set_role_permissions`, etc.) the gap is directly exploitable under concurrent writes.

**Risk:** Missing CONFLICT errors create two categories of risk: (1) implementors omit the stale-token check entirely, relying solely on STATE validation, producing silent data races under concurrent writes; (2) AI agents generating client code will not handle CONFLICT responses (retryable: false) correctly, producing incorrect retry or error-propagation logic. The scope is pervasive — 10 of 42 contracts. Severity is BLOCKER because the optimistic-concurrency model (§B.2 / §14) is a cross-cutting platform-level requirement and the omission is systematic.

**Recommended Resolution:** For each affected contract, add the appropriate CONFLICT error code to the Error Register. Suggested naming pattern follows the established `identity_<domain>_update_conflict` convention:
- `restore_organization` → `identity_org_update_conflict (CONFLICT, no)`
- `admin_recover_ownership` → `identity_org_update_conflict (CONFLICT, no)` (or `identity_org_recovery_conflict`)
- `set_membership_status` → `identity_membership_update_conflict (CONFLICT, no)`
- `remove_member` → `identity_membership_update_conflict (CONFLICT, no)`
- `revoke_invitation` → `identity_membership_update_conflict (CONFLICT, no)`
- `set_role_permissions` → `identity_role_update_conflict (CONFLICT, no)`
- `delete_role` → `identity_role_update_conflict (CONFLICT, no)`
- `suspend_delegation_grant` → `identity_delegation_update_conflict (CONFLICT, no)`
- `reinstate_delegation_grant` → `identity_delegation_update_conflict (CONFLICT, no)`
- `revoke_delegation_grant` → `identity_delegation_update_conflict (CONFLICT, no)`

Note: `update_role` already declares `identity_role_name_conflict (CONFLICT)` for the uniqueness check. A stale-token CONFLICT code should be added separately or the existing code broadened to cover both cases with disambiguation in the message field — see also MAJOR-02 analog.

---

### MAJOR Findings

---

**Finding M-01**

| Field | Detail |
|---|---|
| Finding ID | M-01 |
| Severity | MAJOR |
| Affected Section | §C9 `identity.reinstate_delegation_grant.v1` |
| Corpus Citation | Doc-4A §11.2 (canonical nine-category order; "omitting only structurally inapplicable stages, never reordering"); Doc-4A §6B (five-condition delegated-access check at DELEGATION stage) |

**Issue:** The Validation Matrix for `identity.reinstate_delegation_grant.v1` omits the DELEGATION stage:

```
SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (can_manage_delegations) → SCOPE (controlling org) → STATE (Doc-2 §5.10 suspended → active) → BUSINESS ([ESC-IDN-DELEG-EXPIRY])
```

The two sibling commands in §C9 that perform the same controlling-org management action include the DELEGATION stage:

- `suspend_delegation_grant`: `SYNTAX → CONTEXT → AUTHZ → SCOPE → **DELEGATION (§6B controller check)** → STATE`
- `revoke_delegation_grant`: `SYNTAX → CONTEXT → AUTHZ → SCOPE → **DELEGATION (§6B controller check)** → STATE`

All three commands share identical Authorization declarations: `Membership active; Slug can_manage_delegations; Scope = controlling org (§6B); Delegation: not eligible`. The §6B controller check is the structural substance of the DELEGATION stage for these commands — it validates that the caller's active org is in fact the controlling org of the grant (a condition beyond what SCOPE checks). Omitting DELEGATION from reinstate while including it in suspend and revoke creates an asymmetric bypass: an attacker who can access the AUTHZ and SCOPE stages but would fail the §6B controller check on the reinstate path does not face that check.

The structurally inapplicable exclusion (Doc-4A §11.2) does not apply: the §6B check IS exercised for this contract family, as evidenced by its presence in the sibling contracts.

**Risk:** Authorization bypass on reinstatement. A caller who holds `can_manage_delegations` in any org that can reach the grant's scope might reinstate a suspended grant without passing the five-condition §6B controller verification, because the DELEGATION stage — where that verification occurs — is absent. This is the highest-value attack surface in the delegation lifecycle: reinstatement restores active delegated authority.

**Recommended Resolution:** Insert the DELEGATION stage into `reinstate_delegation_grant`'s Validation Matrix between SCOPE and STATE:
`SYNTAX → CONTEXT → AUTHZ (can_manage_delegations) → SCOPE (controlling org) → DELEGATION (§6B controller check) → STATE (Doc-2 §5.10 suspended → active) → BUSINESS ([ESC-IDN-DELEG-EXPIRY])`.
No new entity, slug, or rule is introduced — the §6B controller check is already required and already present in both sibling commands.

---

**Finding M-02**

| Field | Detail |
|---|---|
| Finding ID | M-02 |
| Severity | MAJOR |
| Affected Section | §C5 `identity.create_organization.v1` |
| Corpus Citation | Doc-4A §12.2 (`CONFLICT` class definition: "concurrent modification detected via concurrency token, or uniqueness conflict on a client-deterministic key"); Doc-4A §12 (closed class set; each error code must be correctly classified) |

**Issue:** `create_organization` declares `identity_org_personal_exists (CONFLICT, no)` in the Error Register. The scenario this code names is: a user attempts to create a personal org but already has one (Solo Trader invariant — exactly one personal org per user). This is a **precondition check on existing state** (does a personal org already exist for this user?) — it is semantics identical to a BUSINESS rule violation or a uniqueness constraint on a non-concurrency-token field. It is not an optimistic-concurrency stale-token collision, which is the defining characteristic of the `CONFLICT` error class per Doc-4A §12.2.

The CONFLICT class is used correctly elsewhere in the document for stale `updated_at` tokens (e.g., `identity_org_update_conflict`) and for client-deterministic key uniqueness (e.g., `identity_role_name_conflict` on `create_role` — where the role name is a client-supplied key with a uniqueness constraint, making CONFLICT semantically defensible). The `identity_org_personal_exists` scenario lacks a client-deterministic concurrency token; the personal-org existence is a server-side invariant check.

The correct error class for "you already have a personal org" is `BUSINESS` (a business rule violation: Solo Trader invariant).

**Risk:** Incorrect error classification misleads implementors and AI agents: a CONFLICT response implies the client should check its concurrency token and retry with a refreshed `updated_at`, which is not the correct remediation for this case (the user simply cannot create a second personal org regardless of token freshness). This produces incorrect client retry logic.

**Recommended Resolution:** Reclassify `identity_org_personal_exists` from `(CONFLICT, no)` to `(BUSINESS, no)`. The error code name accurately describes the condition; only the class label needs correction. The Solo Trader invariant check belongs at the BUSINESS stage, which is already present in the Validation Matrix.

---

**Finding M-03**

| Field | Detail |
|---|---|
| Finding ID | M-03 |
| Severity | MAJOR |
| Affected Section | §C9 `identity.create_delegation_grant.v1` |
| Corpus Citation | Doc-4A §12.2 (`CONFLICT` class); Doc-4A §11.2 (stage→error-class mapping: DELEGATION stage → `AUTHORIZATION` or `NOT_FOUND` on protected facts per §B.4) |

**Issue:** `create_delegation_grant` declares `identity_delegation_not_controller (AUTHORIZATION, no)` as a distinct error code for "caller not the controlling org." The DELEGATION stage in Doc-4A §6B and the stage→error-class mapping in §B.4 specify that DELEGATION failures map to `AUTHORIZATION` (or `NOT_FOUND` on protected facts via §12.4 Case A/Case B). `identity_delegation_not_controller (AUTHORIZATION, no)` is therefore correctly classified.

However, this contract also declares `identity_delegation_forbidden (AUTHORIZATION, no)` as a separate code. With both present, the split between `delegation_forbidden` (AUTHZ stage failure on the slug check) and `delegation_not_controller` (DELEGATION stage failure on the §6B controller check) is meaningful and correct.

Upon closer examination: the adjacent management commands (`suspend_delegation_grant`, `revoke_delegation_grant`) do NOT declare `identity_delegation_not_controller` — they only declare `identity_delegation_forbidden`. Since all three commands have identical Authorization declarations and all three include the DELEGATION (§6B controller check) stage, the DELEGATION-stage failure path (`not_controller`) should be consistently declared across all three. The omission from `suspend` and `revoke` means the DELEGATION-stage error code coverage is incomplete for those two contracts.

The `identity_delegation_forbidden` code in `suspend` and `revoke` must therefore be covering both the AUTHZ-stage slug failure AND the DELEGATION-stage controller failure — conflating two distinct validation stages into one error code, which violates the stage→error-class precision requirement of §12 and makes it impossible for a caller to distinguish "you lack the slug" from "you are not the controlling org."

**Risk:** Ambiguous error codes on the delegation management commands mask whether the rejection is an AUTHZ (slug) failure or a DELEGATION (§6B controller) failure. A caller who holds the correct slug but targets a grant they do not control receives the same error as a caller who lacks the slug entirely — preventing correct remediation. For AI agents, this ambiguity produces incorrect branching logic.

**Recommended Resolution:** Add `identity_delegation_not_controller (AUTHORIZATION, no)` to the Error Registers of `suspend_delegation_grant` and `revoke_delegation_grant`, matching the pattern established by `create_delegation_grant`. The DELEGATION stage maps to AUTHORIZATION; the not-controller code is the precise signal for §6B controller-check failure, distinct from the AUTHZ slug failure (`delegation_forbidden`).

---

### MINOR Findings

---

**Finding m-01**

| Field | Detail |
|---|---|
| Finding ID | m-01 |
| Severity | MINOR |
| Affected Section | §C5 `identity.update_organization_profile.v1`; §C6 `identity.accept_invitation.v1`; §C4 `identity.update_user_profile.v1`; §C4 `identity.update_user_2fa_settings.v1`; §C4 `identity.deactivate_own_account.v1`; §C5 `identity.create_organization.v1` |
| Corpus Citation | Doc-4A §11.2 (canonical nine-category order; "omitting only structurally inapplicable stages, never reordering"; structurally inapplicable exclusion); §B.4 (AUTHZ stage: "AUTHZ (Category 3) is structurally inapplicable for Slug:none / Membership:n/a self-service contracts") |

**Issue:** Six contracts omit the AUTHZ validation stage (and in some cases SCOPE) without an explicit "structurally inapplicable" annotation:

- `update_user_profile`: `SYNTAX → CONTEXT → BUSINESS → POLICY` (AUTHZ, SCOPE absent; Membership:n/a, Slug:none)
- `update_user_2fa_settings`: `SYNTAX → CONTEXT → BUSINESS` (AUTHZ, SCOPE absent; Membership:n/a, Slug:none)
- `deactivate_own_account`: `SYNTAX → CONTEXT → STATE → BUSINESS → POLICY` (AUTHZ, SCOPE absent; Membership:n/a, Slug:none)
- `create_organization`: `SYNTAX → CONTEXT → BUSINESS → POLICY` (AUTHZ, SCOPE absent; Membership:n/a, Slug:none, bootstrap)
- `accept_invitation`: `SYNTAX → CONTEXT → SCOPE → STATE → BUSINESS` (AUTHZ absent; Membership:n/a pre-membership)

§B.4 states: "omitting only structurally inapplicable stages." The omission is defensible for all five — Slug:none contracts have no AUTHZ layer to apply, and Membership:n/a contracts have no SCOPE layer (no active-org membership). However, Doc-4A §11.2 requires the omission to be grounded in structural inapplicability, and the document does not annotate these omissions explicitly as structurally inapplicable — it simply leaves the stages out.

§B.4 does state the stage→error-class mapping and the inapplicability rule, but an AI agent reading a per-contract block without cross-referencing §B.4 will not know whether the omission is intentional or a gap. The risk of misimplementation is non-trivial.

**Risk:** An implementor or AI agent may add AUTHZ/SCOPE stages to self-service contracts in error, or conversely may omit them from contracts where they are required. The ambiguity is documentation-level only — no authorization bypass is possible because these contracts have no slug to check — but it creates an implementation ambiguity that violates the "AI-agent ambiguity" hunt criterion.

**Recommended Resolution:** Add a parenthetical annotation to the omitted stages in each affected contract's Validation Matrix, e.g., `SYNTAX → CONTEXT [AUTHZ: n/a — Slug:none, self-service] → BUSINESS → POLICY`. Alternatively, add a §B.4 sub-rule explicitly enumerating the self-service / pre-membership structural inapplicability cases and cite it per-contract.

---

**Finding m-02**

| Field | Detail |
|---|---|
| Finding ID | m-02 |
| Severity | MINOR |
| Affected Section | §B.6; All mutation contracts (42 total, excluding System 21.5 contracts) |
| Corpus Citation | Doc-4A §14; §B.2 "Concurrency token: `updated_at` on mutable entities, optimistic concurrency on updates"; §B.6 "Replay → cached response; no duplicate audit record; no duplicate side effect" |

**Issue:** §B.2 declares "`updated_at` on mutable entities, optimistic concurrency on updates" as a cross-cutting convention. §B.6 declares `Idempotency: required` for every mutation. However, no contract in the document includes an explicit `Concurrency: optimistic | none` block as a declared field — concurrency handling is embedded in the Request Contract description ("concurrency" or "optimistic-concurrency token" annotations inline) and in the Idempotency note, but is never declared as a separate structured block.

Doc-4A §14 specifies that contracts must make an explicit concurrency declaration. The inline annotation pattern ("`updated_at : timestamp : required : optimistic-concurrency token (§B.2)`") partially satisfies the intent but does not constitute a formal `Concurrency` block distinct from the Request Contract payload description.

This is not a BLOCKER because the information is present (every contract with `updated_at` annotates it as a concurrency token, and §B.2 is the cross-cutting declaration). However, the absence of a formal structured declaration creates implementation ambiguity for contracts that omit `updated_at` (System 21.5 contracts, queries, and `create` contracts that don't update an existing record) — it is unclear whether `Concurrency: none` was intentionally chosen or simply omitted.

**Risk:** AI agents and implementors cannot unambiguously distinguish "no concurrency token because this is a create (none needed)" from "no concurrency token because it was omitted in error." Minor implementation ambiguity on the create-style contracts.

**Recommended Resolution:** Add an explicit `Concurrency: optimistic (updated_at)` or `Concurrency: none (create / system)` line to the Idempotency block of every mutation contract, cross-referencing §B.2. This is a one-liner addition per contract and resolves the ambiguity for AI-agent consumers.

---

### NITPICK Findings

---

**Finding N-01**

| Field | Detail |
|---|---|
| Finding ID | N-01 |
| Severity | NITPICK |
| Affected Section | §C9 `identity.expire_delegation_grant.v1` (and §C6 `identity.expire_invitation.v1`) |
| Corpus Citation | §C12.4 (Events: Module 1 produces no domain events); Appendix C DC-1; Doc-4A §16.4 |

**Issue:** Both System sweep contracts (`expire_delegation_grant`, `expire_invitation`) carry the note: "Events: none (§8); teardown → [DC-1]." The AI-Agent Notes for `expire_delegation_grant` state "teardown blocked on DC-1; do not expire `suspended` grants until Doc-2 §5.10 clarifies." This is correct.

However, the Validation Matrix for `expire_delegation_grant` (line ~635) lists a BUSINESS stage that carries `[ESC-IDN-DELEG-EXPIRY]` for the suspended-at-expiry case. The Validation Matrix for `expire_invitation` (line ~435) lists: `SYNTAX → CONTEXT → STATE → BUSINESS (window elapsed)`. Neither System 21.5 contract includes the standard Template 21.5 fields (CONTEXT = System; platform scope, §5.2) being stated with the same structural completeness as the companion `activate_membership` contract, which more explicitly states "CONTEXT (System actor; platform scope, §5.2)."

The inconsistency is cosmetic — the behavior is functionally correct — but creates minor inconsistency in how the System actor context validation is expressed across the three 21.5 contracts in the document.

**Risk:** Negligible — cosmetic consistency only. No behavioral gap.

**Recommended Resolution:** Standardize the CONTEXT stage description across all three 21.5 contracts to read "CONTEXT (System actor; platform scope, §5.2)" for consistency with `activate_membership`.

---

## DC-1 to DC-5 Compliance Assessment (Domain 13)

| Dependency | Status | Finding |
|---|---|---|
| DC-1 | **PASS** | No Template 21.2 instantiated; cross-module cascade legs correctly blocked and annotated; teardown for `soft_delete_organization`, `revoke_delegation_grant`, `expire_delegation_grant` all correctly deferred. Entry condition 1 honored throughout. |
| DC-2 | **PASS** | `verification_records` not owned; `can_submit_verification` slug referenced from Doc-2 §7 only; `verification_level` correctly described as an org-record attribute, not a Trust contract projection. |
| DC-3 | **PASS** | All Admin (21.6) contracts bind to `staff_super_admin` with the interim DC-3 annotation; no staff slug invented. |
| DC-4 | **PASS** | Authentication boundary correctly maintained throughout §C4: no password/2FA-challenge/session field appears in any contract; `activate_membership` correctly binds to the DC-4 infra verification signal; `update_user_2fa_settings` explicitly marks the 2FA challenge mechanism as DC-4 infrastructure. |
| DC-5 | **PASS** | No concrete POLICY key value is set. All intended `identity.*` keys are referenced by name with `[DC-5]` annotation. Rate-Limit blocks are deficient (B-01), but the DC-5 posture itself (no premature finalization) is preserved. |

---

## ESC Marker Compliance Assessment (Domains 14–16)

| Marker | Status | Finding |
|---|---|---|
| **ESC-IDN-SLUG** | **PASS** | Carried consistently on all affected contracts: `update_organization_profile` (§C5), `create_role`, `update_role`, `set_role_permissions`, `delete_role` (§C7), `upsert_buyer_profile` (§C10). Interim slug bindings correctly cited (nearest §7 slug). No slug invented. |
| **ESC-IDN-AUDIT** | **PASS** | Carried on all affected contracts per Patch v1.0.1 PA-02 expansion: `update_organization_profile`, `activate_membership`, `deactivate_own_account`, `set_user_account_status`, `update_user_2fa_settings`, `set_organization_status`, `upsert_buyer_profile`, `expire_delegation_grant`. Reinstate inverse-leg covered-by-suspend per PA-02 decision. §C12.3 enumeration is consistent with per-contract markers. |
| **ESC-IDN-DELEG-EXPIRY** | **PASS** | Carried on `reinstate_delegation_grant` and `expire_delegation_grant` per Patch v1.0.1 PA-03. Interim behavior correctly bounded to literal `active → expired` edge only. The `suspended`-at-expiry case correctly deferred without inventing a transition. Lapsed-window reinstatement explicitly flagged and not resolved. |

---

## Authorization Integrity Assessment (Domain 6)

No authorization bypass at the AUTHZ stage level was found beyond the DELEGATION-stage omission in M-01 and M-03. The Doc-4A §6.1 three-layer check is correctly applied: Membership + Slug + Scope on all User-actor Command and Admin contracts where applicable. Self-service contracts correctly omit the slug/membership check as structurally inapplicable (noted in m-01 as a documentation gap only). Delegation eligibility is uniformly declared as "not eligible" on all non-delegation identity management contracts, correctly excluding the §6B path from contracts that are ownership-class or tenant-management actions.

---

## Audit Integrity Assessment (Domain 8)

All auditable state-transition commands declare `Audit-Required: yes` with Doc-2 §9 domain binding. Reads are correctly declared non-audited per §17.1. Attribution is correctly System for 21.5 contracts and standard for User/Admin contracts. Phase-2 correlation is correctly `phase2-origin` for System contracts. The `[ESC-IDN-AUDIT]` marker is correctly propagated. Audit declarations are immutable, in-transaction, via `core.append_audit_record.v1` only — no re-implementation detected.

One structural gap observed: `update_user_profile` declares `Audit: no` (line ~183) citing "profile/preference edits are operational, not a Doc-2 §9 MUST-audit action." This is a correct interpretation — Doc-2 §9 Organization domain does not enumerate user-profile attribute changes, and the `[ESC-IDN-AUDIT]` channel handles the gap for account-security changes. No finding raised — correct by corpus.

---

## State Machine Integrity Assessment (Domain 9)

All state transitions bind to the literal edges of the applicable Doc-2 §5.x machine. No transition is invented. Terminal states are correctly identified and annotated. The `invited → removed` (expire/revoke), `pending → active` (activate — System), `active|suspended → revoked` (revoke delegation — terminal), and `active → expired` (expire delegation — terminal) edges are all correctly scoped to their literal Doc-2 §5 entries. The `[ESC-IDN-DELEG-EXPIRY]` boundary (no `suspended → expired` edge) is correctly carried and not crossed.

---

## Tenancy Integrity Assessment (Domain 10)

Tenancy declarations in §C12.2 are correct and consistent with Doc-2 §6: `users` and `permissions` are platform-owned; `organizations` is the tenant root; `memberships`, `roles`, `role_permissions`, `buyer_profiles`, and `organization_workflow_settings` are tenant-owned; `delegation_grants` is correctly declared as shared with dual-party RLS (`organization_id IN (controlling, representative)`). Per-contract scope declarations are consistent with this map. Cross-tenant visibility is correctly blocked: `list_delegation_grants` and `get_delegation_grant` both declare party-only visibility with NOT_FOUND collapse for non-parties. `list_roles` correctly limits to org-scoped + platform seeds only. `get_buyer_profile` correctly limits to the owning org and entitled internal consumers (M3). No tenancy leak detected.

---

## AI-Agent Implementation Safety Assessment (Domain 11)

AI-Agent Notes are present on every contract and are substantively useful. The global §B.11 constraints (One Owner, No invention at runtime, Server-validated context, Non-disclosure, Firewall) are correctly stated and consistently referenced. The most materially important notes — "never expose `activate_membership` as user-invocable," "never dispatch notifications from `invite_member` (DC-1)," "collapse non-party delegation access to NOT_FOUND," "never add/modify a slug in `list_permissions`," "never re-implement the §6B check per-module," "ORG settings strengthen but never weaken FIXED authz" — are all present and correctly bounded.

One implementation ambiguity flagged (partially covered by m-01): the absence of AUTHZ/SCOPE stage annotation on self-service contracts creates a risk that an AI agent generating a validation pipeline will either add spurious checks or omit the annotation for the correct reason. The m-01 resolution (explicit structural-inapplicability annotation) addresses this.

No hallucination-risk instructions detected. No instructions that could lead to invention of slugs, audit actions, state transitions, or events.

---

## Cross-Document Consistency Assessment (Domain 12)

§C12 cross-cutting declarations (actor model, tenancy, audit, events, idempotency, error namespace, Doc-4B consumption) are internally consistent with the per-contract blocks. Appendix A inventory (42 contracts) matches the contracts authored in §C3–§C11. Appendix B conformance binding map correctly maps each section to its governing Doc-4A standards and Doc-4B services. Appendix C dependency/escalation table matches the Patch v1.0.1 PA-01–PA-04 amendments exactly. No drift detected between §C12 cross-cutting declarations and per-contract implementations.

One cross-document note: `update_role` (§C7) carries `updated_at : timestamp : required` and declares `identity_role_name_conflict (CONFLICT, no)` — this CONFLICT code is for the role-name uniqueness check, not for the stale-token collision. A stale-token CONFLICT should be added separately (covered in B-02). The code name is slightly misleading for the stale-token case but this is a naming concern subsumed under B-02.

---

## Final Decision

**APPROVE WITH PATCH REQUIRED**

### Can Doc-4C Pass-B proceed to Freeze Audit?

**NO**

### Justification

Doc-4C Pass-B is structurally sound in its architecture, tenancy, authorization, state-machine, audit, event, and DC/ESC posture. The §B convention framework is internally consistent and the 42 contracts are correctly inventoried and template-assigned. However, two BLOCKER-severity and three MAJOR-severity findings preclude Freeze Audit:

**BLOCKER B-01** (Rate-Limit block absence on POLICY-stage contracts) is a mandatory structural requirement under Doc-4A §19.3 / CHK-215. The two affected contracts (`create_organization` and `update_workflow_settings`) have POLICY-stage rules with no Rate-Limit block — the contract is incomplete by checklist definition. Resolution is additive (Rate-Limit block insertion) and does not alter any contract logic.

**BLOCKER B-02** (CONFLICT error omission on 10 `updated_at`-bearing contracts) is a pervasive concurrency-control gap across the delegation management (3 contracts), membership management (3 contracts), role management (2 contracts), and org management (2 contracts) families. Every contract that accepts `updated_at` as an optimistic-concurrency token is required to declare a CONFLICT error for the stale-token case; 10 of 12 expected contracts omit it. The pattern is inconsistent within the same document (12 contracts correctly declare CONFLICT; 10 do not). Resolution is additive (error code insertion per contract) and does not alter validation logic.

**MAJOR M-01** (DELEGATION stage absent in `reinstate_delegation_grant`) is a structural authorization gap: the §6B controller check executed at the DELEGATION stage in `suspend_delegation_grant` and `revoke_delegation_grant` is absent in `reinstate_delegation_grant`, which shares identical authorization requirements. Reinstatement restores active delegated authority — it is the highest-value operation in the delegation lifecycle and must be the most tightly validated. Resolution requires a single-stage insertion into the validation matrix.

**MAJOR M-02** (Incorrect error class for `identity_org_personal_exists`) is an error classification defect: `CONFLICT` incorrectly applied to a BUSINESS rule violation (Solo Trader invariant check on existing org state). The class mislabeling produces incorrect client retry semantics. Resolution requires a one-word change (CONFLICT → BUSINESS) in the error register.

**MAJOR M-03** (DELEGATION-stage error code omission on `suspend_delegation_grant` and `revoke_delegation_grant`) creates ambiguous error codes: `identity_delegation_forbidden` must cover both AUTHZ-stage (slug) and DELEGATION-stage (§6B controller) failures in these two contracts, conflating distinct rejection reasons. Resolution requires adding `identity_delegation_not_controller (AUTHORIZATION, no)` to both error registers.

A **Freeze Patch** addressing findings B-01, B-02, M-01, M-02, and M-03 is required before Freeze Audit authorization. The 2 MINOR (m-01, m-02) and 1 NITPICK (N-01) findings may be addressed in the same patch or deferred to Pass-C at the Board's discretion.

---

*End of Doc-4C Pass-B Independent Architecture Hard Review Report v1.0 — 2 BLOCKER · 3 MAJOR · 2 MINOR · 1 NITPICK. Final Decision: APPROVE WITH PATCH REQUIRED. Freeze Audit: NO.*
