# Doc-4C — Pass-B Patch v1.0.1 (Identity & Organization — Hard Review Freeze Patch)

| Field | Value |
|---|---|
| Patch ID | Doc-4C-PassB-Patch-v1.0.1 |
| Applies To | `Doc-4C_Content_v1.0_PassB.md` (Module 1 — Identity & Organization) |
| Produces | Doc-4C Content v1.0 Pass-B **as amended** — Freeze-Audit candidate |
| Patch Authority | Architecture Board Directive — approved `Doc-4C_PassB_Hard_Review_Report_v1.0.md` findings **B-01, B-02, M-01, M-02, M-03** + Board restore clarification |
| Patch Type | **Additive amendment only.** Adds mandatory Rate-Limit blocks (B-01), missing CONFLICT error codes (B-02), one omitted validation stage (M-01), one error-class correction (M-02), one restore-behavior clarification (Board), and the DELEGATION-stage controller error code (M-03). **No section regenerated; base document not rewritten; unaffected sections untouched.** |
| Coining guarantee | **No new entity, contract, event, permission slug, POLICY key, audit action, template, module responsibility, state transition, actor assignment, or escalation marker.** Error codes added are registrations **within the existing `identity_` prefix** and the **closed Doc-4A §12 class set** (§12.3). No frozen document is modified. DC-1…DC-5 and `[ESC-IDN-*]` markers are unchanged and unresolved. |
| Conforms To | Architecture FINAL, ADRs v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C Structure v1.0 (all FROZEN); Doc-4C Pass-A CLOSED |
| Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C Structure → Doc-4C Pass-A CLOSED → Doc-4C Pass-B → Hard Review Report v1.0 |
| Status | **APPROVED — additive Pass-B freeze patch** |

---

## 1 — Purpose

This patch applies the Architecture Board–approved Hard Review findings to `Doc-4C_Content_v1.0_PassB.md` as **targeted, additive amendments**, each quoting the exact existing text it replaces or extends. It resolves the two BLOCKER findings (**B-01** mandatory Rate-Limit blocks on POLICY-stage contracts; **B-02** missing CONFLICT errors on optimistic-concurrency contracts) and the three MAJOR findings (**M-01** missing DELEGATION stage in `reinstate_delegation_grant`; **M-02** incorrect error class for `identity_org_personal_exists`; **M-03** missing DELEGATION-stage controller error code on the delegation management commands), and adds the Board-requested **restore-behavior clarification** for `restore_organization`. The MINOR (m-01, m-02) and NITPICK (N-01) findings are **out of this patch's scope** (Board directive) and are not touched. Nothing is invented; no frozen rule, ownership, state machine, actor, escalation marker, or freeze-gate dependency is changed.

---

## 2 — Findings Addressed

| Finding | Severity | Patch Item | Resolution summary |
|---|---|---|---|
| **B-01** | BLOCKER | PA-01 (A–C) | Add §19.3 Rate-Limit blocks to the two POLICY-stage contracts (`create_organization`, `update_workflow_settings`); add the supporting RATE_LIMITED code for the latter. Values deferred to DC-5. |
| **B-02** | BLOCKER | PA-02 (A–G) + PA-06 (A–C) | Add the `identity_<domain>_update_conflict (CONFLICT)` stale-token code to the 10 `updated_at`-bearing contracts (7 here; the 3 delegation commands combined with PA-06 to amend each Error Register exactly once). |
| **M-01** | MAJOR | PA-03 | Insert `DELEGATION (§6B controller check)` between SCOPE and STATE in `reinstate_delegation_grant`. |
| **M-02** | MAJOR | PA-04 | Reclassify `identity_org_personal_exists` from CONFLICT to BUSINESS in `create_organization`. |
| **M-03** | MAJOR | PA-06 (A–C) | Add `identity_delegation_not_controller (AUTHORIZATION)` to `suspend`/`revoke`/`reinstate` delegation commands (the code already exists in `create_delegation_grant`). |
| **Board restore clarification** | — | PA-05 (A–B) | Clarify that `restore_organization` clears the cascade-applied `deleted_at` on memberships soft-deleted by the corresponding `soft_delete_organization`, returning them to their last §5.2 state (orthogonal soft-delete; no transition invented). |

**B-02 accounting:** the 10 affected contracts are 7 under PA-02 (`restore_organization`, `admin_recover_ownership`, `set_membership_status`, `remove_member`, `revoke_invitation`, `set_role_permissions`, `delete_role`) + 3 under PA-06 (`suspend_delegation_grant`, `reinstate_delegation_grant`, `revoke_delegation_grant`). The 3 delegation commands are amended **once** under PA-06 (adding both the B-02 CONFLICT code and the M-03 controller code) to avoid double-editing a single Error Register line.

---

## 3 — Patch Instructions

> Convention: each amendment quotes the **Existing Text** verbatim from `Doc-4C_Content_v1.0_PassB.md` and gives the **Amendment Text** that replaces it (or, for insertions, the bullet to insert and its anchor). Section/contract anchors are the base document's.

### PATCH-4C-PB-PA-01 — B-01: Rate-Limit blocks for POLICY-stage contracts (Doc-4A §19.3 / CHK-215)

**PA-01-A** — `identity.create_organization.v1` (§C5): **insert** a Rate-Limit bullet immediately **after** the Validation Matrix bullet.

- *Anchor (Existing Text — unchanged):*
  > `- **Validation Matrix (§B.4):** SYNTAX (\`name\` present/bounded; enums) → CONTEXT (authenticated user) → BUSINESS (Solo Trader invariant — user ends with ≥1 org; duplicate-personal-org guard) → POLICY (per-user org-count cap if configured \`[DC-5]\`).`
- *Insert immediately after the anchor:*
  > `- **Rate-Limit (Doc-4A §19.3 / CHK-215):** V9-Type: \`quota\` · Policy-Key: per-user org-create quota — intended \`identity.*\` key, carried under **[DC-5]** (existing channel; not finalized) · Attribution: \`user_id\` · Reset-Interval: **[DC-5]** · Error-Class: \`QUOTA\` (→ existing \`identity_org_quota_exceeded\`). *(Block structure mandatory per CHK-215; values pending DC-5 registration — no key registered here.)*`
- *Rationale:* CHK-215 (Doc-4A §19.3) requires a Rate-Limit block for the Category 9 POLICY quota rule already present in the Validation Matrix. The QUOTA Error-Class maps to the **existing** `identity_org_quota_exceeded` code — no new code. The Policy-Key/Reset-Interval reference the **existing [DC-5]** channel (no key created, no value finalized — entry condition 2 preserved).

**PA-01-B** — `identity.update_workflow_settings.v1` (§C11): **insert** a Rate-Limit bullet immediately **after** the Validation Matrix bullet.

- *Anchor (Existing Text — unchanged):*
  > `- **Validation Matrix (§B.4):** SYNTAX (enums; jsonb shapes) → CONTEXT (active-org) → AUTHZ (\`can_manage_workflow_settings\`) → SCOPE (caller's org) → BUSINESS (ORG values within POLICY bounds, §18.4/§12.3; an approval setting may **add** required approvals but **never remove a required slug**, §6.2) → POLICY (bounds resolved via Doc-4B \`core.config_value_query.v1\` where Doc-3 §12.3 defines).`
- *Insert immediately after the anchor:*
  > `- **Rate-Limit (Doc-4A §19.3 / CHK-215):** V9-Type: \`throughput\` · Policy-Key: workflow-settings-update throughput — intended \`identity.*\` key, carried under **[DC-5]** (existing channel; not finalized) · Attribution: \`organization_id\` · Reset-Interval: **[DC-5]** · Error-Class: \`RATE_LIMITED\` (→ \`identity_workflow_rate_limited\`, PA-01-C). *(Block structure mandatory per CHK-215; values pending DC-5 registration — no key registered here. The POLICY-bounds validation remains the BUSINESS-stage \`identity_workflow_policy_violation\` check; this block governs only the throughput limit.)*`
- *Rationale:* CHK-215 requires a Rate-Limit block for the contract's Category 9 POLICY rule. The block declares the throughput limit (distinct from the BUSINESS-stage bounds check, which is unchanged). Policy-Key/Reset-Interval reference the existing [DC-5] channel (no key created/finalized).

**PA-01-C** — `identity.update_workflow_settings.v1` (§C11): add the RATE_LIMITED code required by PA-01-B's Error-Class.

- *Existing Text:*
  > `- **Error Register:** \`identity_workflow_invalid_input\` (VALIDATION, no) · \`identity_workflow_forbidden\` (AUTHORIZATION, no) · \`identity_workflow_not_found\` (NOT_FOUND, no) · \`identity_workflow_policy_violation\` (BUSINESS, no — out of POLICY bounds / would weaken FIXED authz) · \`identity_workflow_conflict\` (CONFLICT, no).`
- *Amendment Text:*
  > `- **Error Register:** \`identity_workflow_invalid_input\` (VALIDATION, no) · \`identity_workflow_forbidden\` (AUTHORIZATION, no) · \`identity_workflow_not_found\` (NOT_FOUND, no) · \`identity_workflow_policy_violation\` (BUSINESS, no — out of POLICY bounds / would weaken FIXED authz) · \`identity_workflow_conflict\` (CONFLICT, no) · \`identity_workflow_rate_limited\` (RATE_LIMITED, yes — throughput limit per the Rate-Limit block).`
- *Rationale:* The Rate-Limit block's `Error-Class: RATE_LIMITED` requires a corresponding code; `identity_workflow_rate_limited` is a registration within the existing `identity_` prefix and the closed RATE_LIMITED class (§12.3) — `retryable: true` per §B.5. No new error class.

### PATCH-4C-PB-PA-02 — B-02: CONFLICT codes for optimistic-concurrency contracts (Doc-4A §14 / §12.2)

For each contract below, append the stale-token CONFLICT code to the Error Register (established `identity_<domain>_update_conflict` pattern, matching `identity_org_update_conflict` / `identity_user_update_conflict`). *(The 3 delegation commands in B-02 are amended under PA-06.)*

**PA-02-A** — `identity.restore_organization.v1` (§C5)

- *Existing Text:* `- **Error Register:** \`identity_org_invalid_input\` (VALIDATION, no) · \`identity_org_forbidden\` (AUTHORIZATION, no) · \`identity_org_not_found\` (NOT_FOUND, no) · \`identity_org_state_invalid\` (STATE, no — not soft-deleted).`
- *Amendment Text:* `- **Error Register:** \`identity_org_invalid_input\` (VALIDATION, no) · \`identity_org_forbidden\` (AUTHORIZATION, no) · \`identity_org_not_found\` (NOT_FOUND, no) · \`identity_org_state_invalid\` (STATE, no — not soft-deleted) · \`identity_org_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* Contract accepts `updated_at : required` (optimistic concurrency, §B.2) with no stale-token error; CONFLICT is structurally required (§12.2). Distinct from the STATE error (different client handling).

**PA-02-B** — `identity.admin_recover_ownership.v1` (§C5)

- *Existing Text:* `- **Error Register:** \`identity_org_invalid_input\` (VALIDATION, no) · \`identity_org_forbidden\` (AUTHORIZATION, no) · \`identity_org_not_found\` (NOT_FOUND, no) · \`identity_user_not_found\` (REFERENCE, no) · \`identity_org_recovery_invalid\` (BUSINESS, no).`
- *Amendment Text:* `- **Error Register:** \`identity_org_invalid_input\` (VALIDATION, no) · \`identity_org_forbidden\` (AUTHORIZATION, no) · \`identity_org_not_found\` (NOT_FOUND, no) · \`identity_user_not_found\` (REFERENCE, no) · \`identity_org_recovery_invalid\` (BUSINESS, no) · \`identity_org_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* As PA-02-A (`updated_at : required`; CONFLICT absent).

**PA-02-C** — `identity.set_membership_status.v1` (§C6)

- *Existing Text:* `- **Error Register:** \`identity_membership_invalid_input\` (VALIDATION, no) · \`identity_membership_forbidden\` (AUTHORIZATION, no) · \`identity_membership_not_found\` (NOT_FOUND, no) · \`identity_membership_state_invalid\` (STATE, no) · \`identity_org_last_owner_block\` (BUSINESS, no).`
- *Amendment Text:* `- **Error Register:** \`identity_membership_invalid_input\` (VALIDATION, no) · \`identity_membership_forbidden\` (AUTHORIZATION, no) · \`identity_membership_not_found\` (NOT_FOUND, no) · \`identity_membership_state_invalid\` (STATE, no) · \`identity_org_last_owner_block\` (BUSINESS, no) · \`identity_membership_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* Non-terminal reversible command with `updated_at : required`; concurrency gap operationally active on every suspend/reinstate cycle (Hard Review M-03 note / B-02).

**PA-02-D** — `identity.remove_member.v1` (§C6)

- *Existing Text:* `- **Error Register:** \`identity_membership_invalid_input\` (VALIDATION, no) · \`identity_membership_forbidden\` (AUTHORIZATION, no) · \`identity_membership_not_found\` (NOT_FOUND, no) · \`identity_membership_state_invalid\` (STATE, no) · \`identity_org_last_owner_block\` (BUSINESS, no).` *(Affected Section disambiguates this from PA-02-C: this is the `remove_member` Error Register.)*
- *Amendment Text:* `- **Error Register:** \`identity_membership_invalid_input\` (VALIDATION, no) · \`identity_membership_forbidden\` (AUTHORIZATION, no) · \`identity_membership_not_found\` (NOT_FOUND, no) · \`identity_membership_state_invalid\` (STATE, no) · \`identity_org_last_owner_block\` (BUSINESS, no) · \`identity_membership_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* `updated_at : required`; stale-token CONFLICT distinct from the terminal STATE error (retry vs. halt).

**PA-02-E** — `identity.revoke_invitation.v1` (§C6)

- *Existing Text:* `- **Error Register:** \`identity_membership_invalid_input\` (VALIDATION, no) · \`identity_membership_forbidden\` (AUTHORIZATION, no) · \`identity_membership_not_found\` (NOT_FOUND, no) · \`identity_membership_state_invalid\` (STATE, no — already accepted/removed).`
- *Amendment Text:* `- **Error Register:** \`identity_membership_invalid_input\` (VALIDATION, no) · \`identity_membership_forbidden\` (AUTHORIZATION, no) · \`identity_membership_not_found\` (NOT_FOUND, no) · \`identity_membership_state_invalid\` (STATE, no — already accepted/removed) · \`identity_membership_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* As above.

**PA-02-F** — `identity.set_role_permissions.v1` (§C7)

- *Existing Text:* `- **Error Register:** \`identity_role_invalid_input\` (VALIDATION, no) · \`identity_role_forbidden\` (AUTHORIZATION, no) · \`identity_role_not_found\` (NOT_FOUND, no) · \`identity_permission_slug_unknown\` (REFERENCE, no) · \`identity_role_system_protected\` (BUSINESS, no).`
- *Amendment Text:* `- **Error Register:** \`identity_role_invalid_input\` (VALIDATION, no) · \`identity_role_forbidden\` (AUTHORIZATION, no) · \`identity_role_not_found\` (NOT_FOUND, no) · \`identity_permission_slug_unknown\` (REFERENCE, no) · \`identity_role_system_protected\` (BUSINESS, no) · \`identity_role_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* As above.

**PA-02-G** — `identity.delete_role.v1` (§C7)

- *Existing Text:* `- **Error Register:** \`identity_role_invalid_input\` (VALIDATION, no) · \`identity_role_forbidden\` (AUTHORIZATION, no) · \`identity_role_not_found\` (NOT_FOUND, no) · \`identity_role_system_protected\` (BUSINESS, no) · \`identity_role_in_use\` (BUSINESS, no — members still bound).`
- *Amendment Text:* `- **Error Register:** \`identity_role_invalid_input\` (VALIDATION, no) · \`identity_role_forbidden\` (AUTHORIZATION, no) · \`identity_role_not_found\` (NOT_FOUND, no) · \`identity_role_system_protected\` (BUSINESS, no) · \`identity_role_in_use\` (BUSINESS, no — members still bound) · \`identity_role_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* As above.

### PATCH-4C-PB-PA-03 — M-01: insert DELEGATION stage in `reinstate_delegation_grant` (§C9)

- *Existing Text:*
  > `- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (\`can_manage_delegations\`) → SCOPE (controlling org) → STATE (Doc-2 §5.10 \`suspended → active\`) → BUSINESS (**\`[ESC-IDN-DELEG-EXPIRY]\`** — whether reinstatement is permitted when \`valid_to\` has already lapsed is **unspecified in Doc-2 §5.10**; carried to the Doc-2 §5.10 channel, **not resolved here** — entry condition 4; interim: reinstatement does not extend an elapsed validity window).`
- *Amendment Text:*
  > `- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (\`can_manage_delegations\`) → SCOPE (controlling org) → **DELEGATION (§6B controller check)** → STATE (Doc-2 §5.10 \`suspended → active\`) → BUSINESS (**\`[ESC-IDN-DELEG-EXPIRY]\`** — whether reinstatement is permitted when \`valid_to\` has already lapsed is **unspecified in Doc-2 §5.10**; carried to the Doc-2 §5.10 channel, **not resolved here** — entry condition 4; interim: reinstatement does not extend an elapsed validity window).`
- *Rationale:* The §6B controller check (validating the caller's active org is the grant's controlling org — beyond SCOPE) is present in both sibling commands (`suspend_delegation_grant`, `revoke_delegation_grant`) and is **not** structurally inapplicable here (Doc-4A §11.2). Reinstatement restores active delegated authority; omitting DELEGATION created an asymmetric bypass. No new entity, slug, or rule — the §6B check is already required.

### PATCH-4C-PB-PA-04 — M-02: error-class correction in `create_organization` (§C5)

- *Existing Text:*
  > `- **Error Register (§B.5):** \`identity_org_invalid_input\` (VALIDATION, no) · \`identity_org_personal_exists\` (CONFLICT, no) · \`identity_org_quota_exceeded\` (QUOTA, no).`
- *Amendment Text:*
  > `- **Error Register (§B.5):** \`identity_org_invalid_input\` (VALIDATION, no) · \`identity_org_personal_exists\` (BUSINESS, no — Solo Trader invariant: a server-side precondition on existing state, not an optimistic-concurrency stale-token collision) · \`identity_org_quota_exceeded\` (QUOTA, no).`
- *Rationale:* The "user already has a personal org" condition is a BUSINESS-rule violation (Solo Trader invariant) checked at the BUSINESS stage already present in the Validation Matrix; it lacks a client-deterministic concurrency token and is therefore not CONFLICT (Doc-4A §12.2). Only the class label changes; behavior and code name are unchanged.

### PATCH-4C-PB-PA-05 — Board restore clarification: `restore_organization` membership behavior (§C5)

**PA-05-A** — State Effects clarification.

- *Existing Text:*
  > `- **State Effects:** Doc-2 §5.1 \`soft_deleted → active\`; reused slugs regenerated. Cross-module reactivation of dependents is **[DC-1]** (not authored).`
- *Amendment Text:*
  > `- **State Effects:** Doc-2 §5.1 \`soft_deleted → active\`; reused slugs regenerated. **Membership restore (clarification):** memberships soft-deleted **by the corresponding \`soft_delete_organization\` cascade** have their cascade-applied \`deleted_at\` cleared and return to their **last Doc-2 §5.2 state** — soft-delete is **orthogonal** to the §5.2 machine (Doc-2 §0.2 \`deleted_at/by/reason\`), so this is **not a §5.2 state transition** and introduces none. Memberships already terminal (\`removed\`), or soft-deleted by an unrelated action **before** the cascade, are **not** reopened (terminal never reopens, §13). No entity is created. Cross-module reactivation of dependents is **[DC-1]** (not authored).`
- *Rationale:* Board-requested clarification. Uses the existing ownership model (Organization aggregate owns `memberships`, Doc-2 §2), the existing membership lifecycle (§5.2), and the orthogonal soft-delete mechanism (§0.2). Introduces no new state transition and no new entity; the terminal-`removed` exclusion is the existing §13 rule.

**PA-05-B** — AI-Agent Notes clarification.

- *Existing Text:*
  > `- **AI-Agent Notes:** apply the slug restore-conflict rule (regenerate, never collide); restore reactivates only the org + in-module rows — cross-module dependents await DC-1.`
- *Amendment Text:*
  > `- **AI-Agent Notes:** apply the slug restore-conflict rule (regenerate, never collide); restore reactivates only the org + in-module rows — cross-module dependents await DC-1. **Restore only the memberships soft-deleted by this org's \`soft_delete_organization\` cascade (clear their \`deleted_at\`, restoring the last §5.2 state); never reopen a terminal \`removed\` membership and never resurrect a membership soft-deleted by an unrelated action (Doc-2 §0.2 orthogonal soft-delete; §5.2 \`removed\` terminal, §13).**`
- *Rationale:* Implementation-level statement of PA-05-A for AI agents; no new behavior beyond the existing lifecycle.

### PATCH-4C-PB-PA-06 — M-03 (+ B-02 for delegation commands): DELEGATION controller code (§C9)

Corpus support is **sufficient**: Doc-4A §11.2 maps the DELEGATION stage to `AUTHORIZATION`; Doc-4A §12 requires precise stage→code classification; and `identity_delegation_not_controller (AUTHORIZATION, no)` **already exists** in `create_delegation_grant` (this propagates an existing code — no invention, no new class). Each Error Register below is amended **once**, adding both the B-02 stale-token CONFLICT code and the M-03 controller code. `reinstate_delegation_grant` is included because PA-03 gives it the DELEGATION stage, making the controller code consistent with its siblings.

**PA-06-A** — `identity.suspend_delegation_grant.v1`

- *Existing Text:* `- **Error Register:** \`identity_delegation_invalid_input\` (VALIDATION, no) · \`identity_delegation_forbidden\` (AUTHORIZATION, no) · \`identity_delegation_not_found\` (NOT_FOUND, no) · \`identity_delegation_state_invalid\` (STATE, no).`
- *Amendment Text:* `- **Error Register:** \`identity_delegation_invalid_input\` (VALIDATION, no) · \`identity_delegation_forbidden\` (AUTHORIZATION, no — AUTHZ-stage slug failure) · \`identity_delegation_not_controller\` (AUTHORIZATION, no — DELEGATION-stage §6B controller-check failure, distinct from the slug failure) · \`identity_delegation_not_found\` (NOT_FOUND, no) · \`identity_delegation_state_invalid\` (STATE, no) · \`identity_delegation_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* M-03 (controller code distinct from slug failure; matches `create_delegation_grant`) + B-02 (stale-token CONFLICT; `updated_at : required`).

**PA-06-B** — `identity.reinstate_delegation_grant.v1`

- *Existing Text:* `- **Error Register:** \`identity_delegation_invalid_input\` (VALIDATION, no) · \`identity_delegation_forbidden\` (AUTHORIZATION, no) · \`identity_delegation_not_found\` (NOT_FOUND, no) · \`identity_delegation_state_invalid\` (STATE, no). *(The lapsed-window-reinstatement error disposition is **carried under \`[ESC-IDN-DELEG-EXPIRY]\`** and not finalized — entry condition 4.)*`
- *Amendment Text:* `- **Error Register:** \`identity_delegation_invalid_input\` (VALIDATION, no) · \`identity_delegation_forbidden\` (AUTHORIZATION, no — AUTHZ-stage slug failure) · \`identity_delegation_not_controller\` (AUTHORIZATION, no — DELEGATION-stage §6B controller-check failure, distinct from the slug failure) · \`identity_delegation_not_found\` (NOT_FOUND, no) · \`identity_delegation_state_invalid\` (STATE, no) · \`identity_delegation_update_conflict\` (CONFLICT, no — stale \`updated_at\`). *(The lapsed-window-reinstatement error disposition is **carried under \`[ESC-IDN-DELEG-EXPIRY]\`** and not finalized — entry condition 4.)*`
- *Rationale:* M-03 controller code (consistent with the DELEGATION stage added by PA-03) + B-02 stale-token CONFLICT. The `[ESC-IDN-DELEG-EXPIRY]` carry is preserved unchanged.

**PA-06-C** — `identity.revoke_delegation_grant.v1`

- *Existing Text:* `- **Error Register:** \`identity_delegation_invalid_input\` (VALIDATION, no) · \`identity_delegation_forbidden\` (AUTHORIZATION, no) · \`identity_delegation_not_found\` (NOT_FOUND, no) · \`identity_delegation_state_invalid\` (STATE, no).`
- *Amendment Text:* `- **Error Register:** \`identity_delegation_invalid_input\` (VALIDATION, no) · \`identity_delegation_forbidden\` (AUTHORIZATION, no — AUTHZ-stage slug failure) · \`identity_delegation_not_controller\` (AUTHORIZATION, no — DELEGATION-stage §6B controller-check failure, distinct from the slug failure) · \`identity_delegation_not_found\` (NOT_FOUND, no) · \`identity_delegation_state_invalid\` (STATE, no) · \`identity_delegation_update_conflict\` (CONFLICT, no — stale \`updated_at\`).`
- *Rationale:* M-03 + B-02, as PA-06-A.

---

## 4 — Corpus Impact

### 4.1 — Affected base-document locations (and nothing else)

| Base location | Patch item(s) | Nature |
|---|---|---|
| §C5 `create_organization` — Validation Matrix (insert), Error Register | PA-01-A, PA-04 | Rate-Limit block added; `identity_org_personal_exists` CONFLICT→BUSINESS |
| §C5 `restore_organization` — Error Register, State Effects, AI-Agent Notes | PA-02-A, PA-05-A/B | CONFLICT code added; membership-restore clarification |
| §C5 `admin_recover_ownership` — Error Register | PA-02-B | CONFLICT code |
| §C6 `set_membership_status` / `remove_member` / `revoke_invitation` — Error Registers | PA-02-C/D/E | CONFLICT code (×3) |
| §C7 `set_role_permissions` / `delete_role` — Error Registers | PA-02-F/G | CONFLICT code (×2) |
| §C9 `reinstate_delegation_grant` — Validation Matrix | PA-03 | DELEGATION stage inserted |
| §C9 `suspend` / `reinstate` / `revoke` delegation — Error Registers | PA-06-A/B/C | `not_controller` (AUTHORIZATION) + `update_conflict` (CONFLICT) (×3) |
| §C11 `update_workflow_settings` — Validation Matrix (insert), Error Register | PA-01-B, PA-01-C | Rate-Limit block; `identity_workflow_rate_limited` (RATE_LIMITED) |

No other section, contract, table, appendix, convention (§B), or cross-cutting declaration (§C12) is altered. The §B conventions, §C0–§C2, §C3/§C4/§C8/§C10 contracts (except those listed), Appendices A–D, and the 30+ unaffected contracts are unchanged.

### 4.2 — Error codes added (all registrations within the existing `identity_` prefix; closed §12 class set — no new class)

| Code | Class | Retryable | Contract(s) | Finding |
|---|---|---|---|---|
| `identity_org_update_conflict` | CONFLICT | no | `restore_organization`, `admin_recover_ownership` | B-02 |
| `identity_membership_update_conflict` | CONFLICT | no | `set_membership_status`, `remove_member`, `revoke_invitation` | B-02 |
| `identity_role_update_conflict` | CONFLICT | no | `set_role_permissions`, `delete_role` | B-02 |
| `identity_delegation_update_conflict` | CONFLICT | no | `suspend`/`reinstate`/`revoke` delegation | B-02 |
| `identity_delegation_not_controller` | AUTHORIZATION | no | `suspend`/`reinstate`/`revoke` delegation | M-03 (pre-existing in `create_delegation_grant`) |
| `identity_workflow_rate_limited` | RATE_LIMITED | yes | `update_workflow_settings` | B-01 |

`identity_org_personal_exists` is **reclassified** (CONFLICT→BUSINESS), not added (M-02). No POLICY key is registered (B-01 Rate-Limit blocks reference the existing `[DC-5]` channel).

### 4.3 — Preservation validation

| Property | Status | Note |
|---|---|---|
| Frozen ownership boundaries (9 `identity` entities) | **Preserved** | No entity added/moved/re-owned. |
| DDD / single owner per capability | **Preserved** | No capability added or duplicated. |
| State machines (Doc-2 §5.1/§5.2/§5.10) | **Preserved** | No transition invented; PA-03 adds a validation stage, not a transition; PA-05 clarifies orthogonal soft-delete (§0.2), not a §5.2 edge. |
| Actor assignments | **Preserved** | Unchanged on every contract. |
| Authorization model (Doc-4A §6/§6B) | **Preserved** | No slug invented; PA-03/PA-06 make the existing §6B controller check explicit; `not_controller` already exists in `create_delegation_grant`. |
| Error model (Doc-4A §12 closed class set) | **Preserved** | All added codes are within `identity_` and the closed class set (§12.3); M-02 corrects a misclassification. |
| Rate-limit completeness (Doc-4A §19.3 / CHK-215) | **Resolved** | Both POLICY-stage contracts now carry a Rate-Limit block. |
| Audit ownership (Doc-2 §9 via Doc-4B) | **Preserved** | No audit action added; audit declarations untouched. |
| Event ownership (Doc-2 §8 — no `identity` emitter) | **Preserved** | `Events: none` unchanged. |
| Firewall (Doc-4A §4B) | **Preserved** | No signal touched; rate-limit/quota are throughput controls, not governance gates. |
| DC-1…DC-5 | **Preserved/unchanged** | No 21.2 instantiated; no POLICY key registered/finalized (B-01 references existing [DC-5]); DC posture identical. |
| `[ESC-IDN-SLUG]` / `[ESC-IDN-AUDIT]` / `[ESC-IDN-DELEG-EXPIRY]` | **Preserved/unchanged** | Markers carried verbatim; `[ESC-IDN-DELEG-EXPIRY]` on `reinstate`/`expire` delegation unchanged. |
| Scope discipline (m-01, m-02, N-01 out of scope) | **Preserved** | MINOR/NITPICK findings not touched, per directive. |

---

## 5 — Governance Notes

- **Nothing invented.** No new entity, contract, event, permission slug, POLICY key, audit action, template, module responsibility, state transition, actor assignment, or escalation marker is created. Per Doc-4A §12.3, error codes are registrations **within the existing `identity_` prefix** and the **closed §12 class set**; the added codes follow established naming (`identity_<domain>_update_conflict` mirrors `identity_org_update_conflict`/`identity_user_update_conflict`; `identity_delegation_not_controller` already exists in `create_delegation_grant`).
- **DC / ESC unchanged.** DC-1…DC-5 are carried and unresolved; the Rate-Limit blocks (B-01) reference the **existing `[DC-5]` channel** by name with **no key registered and no value finalized** (entry condition 2). `[ESC-IDN-SLUG]`, `[ESC-IDN-AUDIT]`, and `[ESC-IDN-DELEG-EXPIRY]` are carried verbatim; PA-06-B preserves the `[ESC-IDN-DELEG-EXPIRY]` carry on `reinstate_delegation_grant`.
- **No flag-and-halt triggered.** Every amendment is grounded in a frozen corpus citation (Doc-4A §19.3, §14, §12.2, §11.2, §6B; Doc-2 §0.2, §5.2, §13). No conflict with a higher document was encountered; nothing required escalation beyond the already-carried dependencies.
- **MINOR/NITPICK deferral.** m-01 (self-service AUTHZ-inapplicability annotation), m-02 (explicit `Concurrency` block), and N-01 (System CONTEXT-stage wording consistency) are **not** addressed here, per the Board directive's patch scope; they may be taken up in a later pass at the Board's discretion.
- **Behavior neutrality.** No amendment changes runtime behavior beyond making an already-required control explicit: B-01 adds the rate-limit specification implementors bind to; B-02 names the stale-token rejection that the optimistic-concurrency model (§B.2/§14) already implies; M-01/M-03 make the existing §6B controller check explicit; M-02 corrects a class label; PA-05 documents the existing orthogonal soft-delete restore behavior.

---

## 6 — Approval Recommendation

**RECOMMEND APPROVAL — additive freeze patch; Freeze Audit may proceed upon adoption.**

All five Hard Review findings that precluded Freeze Audit (B-01, B-02, M-01, M-02, M-03) are resolved additively, and the Board-requested restore clarification (PA-05) is applied. Each amendment cites the exact base text and a frozen-corpus basis; no frozen document is modified; no entity, event, slug, POLICY key, audit action, template, transition, actor, or escalation marker is invented; DC-1…DC-5 and all `[ESC-IDN-*]` markers are preserved unchanged. The 2 MINOR and 1 NITPICK findings are deferred per directive. Upon adoption, `Doc-4C_Content_v1.0_PassB.md` (as amended by this patch) is recommended to proceed to **Freeze Audit**.

*End of Doc-4C Pass-B Patch v1.0.1 — additive resolution of approved Hard Review findings B-01, B-02, M-01, M-02, M-03 + Board restore clarification. No frozen modification; nothing invented; DC-1…DC-5 and `[ESC-IDN-*]` preserved.*
