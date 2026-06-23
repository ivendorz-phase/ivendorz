# Doc-4C — Pass-A Patch v1.0.1 (Identity & Organization — Hard Review Resolution)

## 1 — Patch Metadata

| Field | Value |
|---|---|
| Patch ID | Doc-4C-PassA-Patch-v1.0.1 |
| Applies To | `Doc-4C_Content_v1.0_PassA.md` (Module 1 — Identity & Organization) |
| Produces | Doc-4C Content v1.0 Pass-A **as amended** — Pass-A closure candidate (Mini Review → Pass-A Closure → Pass-B Authorization) |
| Patch Authority | Architecture Board Directive — approved Doc-4C Pass-A Hard Review findings **M-01, M-02, m-01, m-02** |
| Patch Type | **Additive amendment only.** Disambiguates one actor declaration (M-01); strengthens escalation coverage and governance traceability (M-02, m-01); completes a DC-5 intended-key enumeration (m-02). **No section regenerated; base document not rewritten.** |
| Coining guarantee | **No new entity, event, permission slug, audit action, template, module responsibility, or state transition is introduced.** No frozen document is modified. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md (FROZEN), ADR_Compendium_v1.md (FROZEN), Doc-2 v1.0.3 (FROZEN), Doc-3 v1.0.2 (FROZEN), Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN), Doc-4C_Structure_v1.0_FROZEN.md (FROZEN) |
| Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C Structure → Doc-4C Content Pass-A |
| Status | **APPROVED — additive Pass-A patch** |

---

## 2 — Purpose

This patch applies the four approved Hard Review findings to `Doc-4C_Content_v1.0_PassA.md` as **targeted, additive amendments**. Each amendment cites the exact existing text it replaces or extends; no other text is altered. The patch resolves the **M-01** actor ambiguity by collapsing `identity.activate_membership.v1` to a single authoritative execution model already present in the corpus (no new actor category); **strengthens** the `[ESC-IDN-AUDIT]` escalation so every contract relying on a non-enumerated Doc-2 §9 action is explicitly covered (**M-02**); **documents** the delegation `suspended`-at-validity-expiry ambiguity as a new escalation marker routed to the owning-document channel without inventing a transition (**m-01**); and **completes** the DC-5 intended-key enumeration for the delegation expiry-sweep cadence (**m-02**). No finding is resolved by invention; no frozen rule is touched.

---

## 3 — Findings Addressed

| Finding | Severity | Summary | Amendment(s) |
|---|---|---|---|
| **M-01** | MAJOR | `identity.activate_membership.v1` declared an ambiguous actor ("System or User"), violating the actor model. | PATCH-4C-PA-01 (A–D) |
| **M-02** | MAJOR | `[ESC-IDN-AUDIT]` coverage incomplete — contracts relying on non-enumerated Doc-2 §9 actions were not all explicitly covered. | PATCH-4C-PA-02 (A–D) |
| **m-01** | MINOR | Delegation state handling does not address `suspended` + validity expiry. | PATCH-4C-PA-03 (A–C) |
| **m-02** | MINOR | Contracts reference an expiry-sweep-cadence concept with no corresponding DC-5 intended POLICY key. | PATCH-4C-PA-04 (A–B) |

---

## 4 — Normative Amendments

> Convention: each amendment quotes the **Existing Text Reference** verbatim from `Doc-4C_Content_v1.0_PassA.md` and gives the **Amendment Text** that replaces it. Replacements are line-for-line; additions are marked *(insert)*. Section anchors (§Cn, Appendix x) are the base document's.

### PATCH-4C-PA-01 — Resolve M-01 (actor disambiguation: `identity.activate_membership.v1`)

**Authoritative execution model selected.** Per Doc-4A §5 (authentication boundary, DC-4) and Doc-2 §5.2, the `pending → active` "verification complete" transition is **effected by the System actor in reaction to the infrastructure account-verification-complete signal** — it is **not a user-invocable business command** (Doc-4A §13: System transitions are never user-invocable). The contract therefore uses **Template 21.5 (System Actor)**, `Response: none`. This reuses the **existing** System actor and 21.5 template — **no new actor category and no new template** are introduced.

**Amendment 4C-PA-01-A**

- *Affected Section:* §C6 — Membership Contracts → `identity.activate_membership.v1`
- *Existing Text Reference:*
  > `- *Entity:* \`memberships\` · *Template:* 21.4 Command · *Actor:* System or User context (per verification source; DC-4 boundary).`
- *Amendment Text:*
  > `- *Entity:* \`memberships\` · *Template:* **21.5 System** (\`Response: none\`) · *Actor:* **System** (single). The transition is **System-effected in reaction to the infrastructure account-verification-complete signal** (DC-4); it is **not user-invocable** (Doc-4A §13). The invitee's act is authentication/verification via Supabase Auth infrastructure, not a business-command invocation.`
- *Rationale:* Eliminates the "System or User" ambiguity with the single model consistent with the Doc-4A actor model, the §5 authentication boundary (DC-4), and the Doc-2 §5.2 machine; introduces no new actor category and no new template (System / 21.5 already exist and are already used for §C6 `expire_invitation` and §C9 `expire_delegation_grant`).

**Amendment 4C-PA-01-B**

- *Affected Section:* §C6 — `identity.activate_membership.v1`
- *Existing Text Reference:*
  > `- *State:* Doc-2 §5.2 \`pending → active\`. · *Audit:* yes → Doc-2 §9 Organization (membership activation) by pointer.`
- *Amendment Text:*
  > `- *State:* Doc-2 §5.2 \`pending → active\` (legal transition only; §13). · *Audit:* yes → Doc-2 §9 Organization (membership activation) by pointer; **System attribution (§17.3)**; **[ESC-IDN-AUDIT]** — no enumerated §9 "membership activate" action (coverage formalized in PATCH-4C-PA-02-A).`
- *Rationale:* Audit attribution follows the actor change (System, §17.3). Adds the `[ESC-IDN-AUDIT]` marker because Doc-2 §9 enumerates "membership invite/accept/suspend/remove" but **not** "activate"; the gap is carried, not invented (consistent with M-02).

**Amendment 4C-PA-01-C**

- *Affected Section:* §C6 — `identity.activate_membership.v1`
- *Existing Text Reference:*
  > `- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.4; Doc-2 §5.2; Doc-4A §5 (auth boundary), §13, §14.`
- *Amendment Text:*
  > `- *Events:* none (§8). · *Idempotency:* required (platform scope) [DC-5]. · *Source:* Architecture §5.4; Doc-2 §5.2; Doc-4A §5 (auth boundary), §13, §14, §18.2.`
- *Rationale:* Aligns the idempotency scope with the System-actor model (platform scope, as for the other 21.5 contracts) and adds the §18.2 pointer (System sweep/timer governance) for consistency with `expire_invitation` / `expire_delegation_grant`. No semantic change beyond the actor disambiguation.

**Amendment 4C-PA-01-D**

- *Affected Section:* Appendix A — Module 1 Contract Inventory → §C6 row for `identity.activate_membership.v1`
- *Existing Text Reference:*
  > `| \`identity.activate_membership.v1\` | memberships | 21.4 | System/User | Doc-2 §5.2; Doc-4A §5 | DC-4, DC-5 |`
- *Amendment Text:*
  > `| \`identity.activate_membership.v1\` | memberships | 21.5 System | System | Doc-2 §5.2; Doc-4A §5, §13 | DC-4, ESC-IDN-AUDIT, DC-5 |`
- *Rationale:* Reconciles the inventory row with the disambiguated record (template 21.5, single System actor) and the added audit-escalation marker.

**Amendment 4C-PA-01-E**

- *Affected Section:* §C12.1 — Cross-Cutting Declarations → Actor model (System bullet)
- *Existing Text Reference:*
  > `- **System** (Phase-2 timers): membership-invite expiry (§5.2) and delegation-grant expiry (§5.10) — **Template 21.5**, \`Response: none\`, not user-invocable (§13). Timer windows are \`identity.*\` POLICY keys **[DC-5]**.`
- *Amendment Text:*
  > `- **System** (Phase-2 timers / event-driven sweeps): membership-invite expiry (§5.2), delegation-grant expiry (§5.10), and **membership activation on verification-complete** (§5.2 \`pending → active\`, in reaction to the DC-4 infrastructure account-verification signal) — **Template 21.5**, \`Response: none\`, not user-invocable (§13). Timer/sweep windows are \`identity.*\` POLICY keys **[DC-5]**.`
- *Rationale:* Records the disambiguated System actor for activation in the once-stated actor-model declaration, keeping §C12.1 the single authoritative actor source (prevents per-contract drift). No new actor category.

### PATCH-4C-PA-02 — Resolve M-02 (strengthen `[ESC-IDN-AUDIT]` coverage)

**Coverage principle.** `[ESC-IDN-AUDIT]` must explicitly cover **every** contract whose audited action has **no** enumerated Doc-2 §9 entry. This patch (a) adds the three previously-uncovered gaps — `update_organization_profile` (org-profile change), `activate_membership` (membership activation), `expire_delegation_grant` (delegation expiry); and (b) records the explicit coverage decision for the **reinstate inverse-legs** so coverage is provably complete. **No audit action is invented and Doc-2 §9 is not modified.**

**Amendment 4C-PA-02-A**

- *Affected Section:* Appendix C.2 — Escalation markers → `[ESC-IDN-AUDIT]`
- *Existing Text Reference:*
  > `- **\`[ESC-IDN-AUDIT]\` — identity audit actions not separately enumerated in Doc-2 §9.** The §9 Organization domain enumerates org/membership/role/ownership/workflow/soft-delete actions, and the Vendor profile domain enumerates the delegation actions, but §9 does not separately name: user-account suspend/reinstate, user anonymization-on-departure, organization suspend/reinstate, 2FA-settings change, or buyer-profile change. **Interim binding:** the nearest §9 domain/Platform action by pointer (admin status changes → Platform "Super Admin access (flagged)" / "service-role sensitive operations"; anonymization → the §14.3 compliance-redaction model; org/buyer changes → Organization domain). **Channel:** a future **Doc-2 §9 additive** enumerating the identity user-account, org-status, and buyer-profile audit actions. **No audit action invented.** *Affects:* \`set_user_account_status\`, \`deactivate_own_account\`, \`set_organization_status\`, \`update_user_2fa_settings\`, \`upsert_buyer_profile\`.`
- *Amendment Text:*
  > `- **\`[ESC-IDN-AUDIT]\` — identity audit actions not separately enumerated in Doc-2 §9.** The §9 Organization domain enumerates org/membership/role/ownership/workflow/soft-delete actions, and the Vendor profile domain enumerates the delegation actions (issue/suspend/revoke), but §9 does not separately name: **organization-profile change**, user-account suspend/reinstate, user anonymization-on-departure, organization suspend/reinstate, 2FA-settings change, buyer-profile change, **membership activation (\`pending → active\`)**, and **delegation-grant expiry**. **Interim binding:** the nearest §9 domain/Platform action by pointer (admin status changes → Platform "Super Admin access (flagged)" / "service-role sensitive operations"; anonymization → the §14.3 compliance-redaction model; org-profile / buyer-profile / membership-activation changes → Organization domain; delegation expiry → the §9 Vendor-profile delegation family). **Reinstate inverse-legs** (\`set_membership_status\` reinstate; \`reinstate_delegation_grant\`) bind to their **enumerated suspend action** — the status-toggle action records either direction — and therefore require **no** separate additive. **Channel:** a future **Doc-2 §9 additive** enumerating the identity org-profile, user-account, org-status, membership-activation, delegation-expiry, and buyer-profile audit actions. **No audit action invented.** *Affects:* \`update_organization_profile\`, \`set_user_account_status\`, \`deactivate_own_account\`, \`set_organization_status\`, \`update_user_2fa_settings\`, \`upsert_buyer_profile\`, \`activate_membership\`, \`expire_delegation_grant\` (reinstate inverse-legs explicitly covered-by-suspend, above).`
- *Rationale:* Makes coverage complete and provable: adds the three real gaps, and states the explicit covered-by-suspend decision for reinstate legs so no contract is silently uncovered. Strengthens governance traceability only; invents nothing; does not modify Doc-2.

**Amendment 4C-PA-02-B**

- *Affected Section:* §C12.3 — Cross-Cutting Declarations → Audit binding (closing `[ESC-IDN-AUDIT]` sentence)
- *Existing Text Reference:*
  > `**[ESC-IDN-AUDIT]** (Appendix C): Doc-2 §9 does not separately enumerate user-account suspend/reinstate, user anonymization-on-departure, organization suspend/reinstate, 2FA-settings change, or buyer-profile change — interim bound to the nearest §9 domain/Platform action by pointer; escalated for a Doc-2 §9 additive; **not invented**.`
- *Amendment Text:*
  > `**[ESC-IDN-AUDIT]** (Appendix C.2): Doc-2 §9 does not separately enumerate organization-profile change, user-account suspend/reinstate, user anonymization-on-departure, organization suspend/reinstate, 2FA-settings change, buyer-profile change, membership activation (\`pending → active\`), or delegation-grant expiry — interim bound to the nearest §9 domain/Platform action by pointer; reinstate inverse-legs bind to their enumerated suspend action; escalated for a Doc-2 §9 additive; **not invented**.`
- *Rationale:* Keeps the once-stated cross-cutting audit declaration consistent with the expanded Appendix C.2 coverage.

**Amendment 4C-PA-02-C**

- *Affected Section:* §C5 — Organization Contracts → `identity.update_organization_profile.v1`
- *Existing Text Reference:*
  > `- *State:* none (attribute edit; not a §5.1 transition). · *Audit:* yes → Doc-2 §9 Organization domain (org-profile change) by pointer.`
- *Amendment Text:*
  > `- *State:* none (attribute edit; not a §5.1 transition). · *Audit:* yes → Doc-2 §9 Organization domain (org-profile change) by pointer; **[ESC-IDN-AUDIT]** (no enumerated §9 org-profile-change action — Appendix C.2).`
- *Rationale:* Closes the previously-silent coverage gap for org-profile change (the §9 Organization domain enumerates create/membership/role/ownership/workflow/soft-delete, not a profile-attribute edit).

**Amendment 4C-PA-02-D**

- *Affected Section:* §C9 — Delegation Grant Contracts → `identity.expire_delegation_grant.v1`
- *Existing Text Reference:*
  > `- *Audit:* yes → Doc-2 §9 Vendor profile (delegation revoke/expiry family) by pointer (System attribution, §17.3).`
- *Amendment Text:*
  > `- *Audit:* yes → Doc-2 §9 Vendor profile (delegation revoke/expiry family) by pointer (System attribution, §17.3); **[ESC-IDN-AUDIT]** (§9 enumerates delegation issue/suspend/revoke, not expiry — Appendix C.2).`
- *Rationale:* Closes the previously-silent coverage gap for delegation expiry (the §9 Vendor-profile delegation enumeration is issue/suspend/revoke).

### PATCH-4C-PA-03 — Resolve m-01 (delegation `suspended` + validity-expiry ambiguity)

**Documented, not resolved.** Doc-2 §5.10 specifies `active ──valid_to passes──▶ expired` but is silent on the disposition of a **`suspended`** grant whose `valid_to` lapses. This patch documents the ambiguity, raises a new escalation marker, and routes it to the owning-document (Doc-2 §5.10) change-management channel. **No transition is invented; Doc-2 §5.10 is not modified; the ambiguity is not resolved locally.**

**Amendment 4C-PA-03-A** *(insert)*

- *Affected Section:* Appendix C.2 — Escalation markers (insert a new marker after `[ESC-IDN-AUDIT]`)
- *Existing Text Reference:* *(none — additive insertion at the end of the Appendix C.2 marker list)*
- *Amendment Text:*
  > `- **\`[ESC-IDN-DELEG-EXPIRY]\` — disposition of a suspended delegation grant at validity expiry is unspecified in Doc-2 §5.10.** The §5.10 machine specifies \`active ──valid_to passes──▶ expired\` and \`active|suspended ──revoke──▶ revoked\`, but does **not** specify whether a grant in \`suspended\` reaches \`expired\` when \`valid_to\` lapses (or remains \`suspended\`, affecting whether \`reinstate_delegation_grant\` may act on a grant whose validity window has already passed). **Interim behavior (literal machine):** \`expire_delegation_grant\` (System sweep) acts on the \`active → expired\` edge only; no \`suspended → expired\` edge is assumed or exercised. **Channel:** the owning-document change-management channel for Doc-2 §5.10 (Doc-4A §0.6 flag-and-halt; Doc-4_Governance_Note) — a Doc-2 §5.10 clarification/additive defining the suspended-at-expiry disposition. **No transition invented; Doc-2 §5.10 not modified; not resolved here.** *Affects:* \`expire_delegation_grant\`, \`reinstate_delegation_grant\` (reinstatement into a lapsed validity window).`
- *Rationale:* Surfaces the state-semantics ambiguity explicitly and routes it to the only authoritative channel (Doc-2 §5.10 change management), consistent with how the corpus handles state-machine questions (e.g., Doc-2_Patch_v1.0.3 added RFQ edges additively). The Pass-A document remains internally complete by carrying the dependency rather than guessing.

**Amendment 4C-PA-03-B**

- *Affected Section:* §C9 — Delegation Grant Contracts → `identity.expire_delegation_grant.v1`
- *Existing Text Reference:*
  > `- *AuthZ:* System actor; platform scope; not user-invocable (§13). · *State:* Doc-2 §5.10 \`active → expired\` (terminal).`
- *Amendment Text:*
  > `- *AuthZ:* System actor; platform scope; not user-invocable (§13). · *State:* Doc-2 §5.10 \`active → expired\` (terminal; **literal-machine edge only**). **[ESC-IDN-DELEG-EXPIRY]** — Doc-2 §5.10 does not specify the \`suspended\`-at-validity-expiry disposition; carried to the Doc-2 §5.10 channel (Appendix C.2), not resolved here.`
- *Rationale:* Marks the contract with the new escalation and pins the interim behavior to the literal `active → expired` edge, so an implementing agent does not infer an unspecified `suspended → expired` transition.

**Amendment 4C-PA-03-C**

- *Affected Section:* Appendix A — Module 1 Contract Inventory → §C9 row for `identity.expire_delegation_grant.v1`
- *Existing Text Reference:*
  > `| \`identity.expire_delegation_grant.v1\` | delegation_grants | 21.5 System | System | Doc-2 §5.10; Doc-4A §18.2 | DC-1 (teardown), DC-5 |`
- *Amendment Text:*
  > `| \`identity.expire_delegation_grant.v1\` | delegation_grants | 21.5 System | System | Doc-2 §5.10; Doc-4A §18.2 | DC-1 (teardown), DC-5, ESC-IDN-AUDIT, ESC-IDN-DELEG-EXPIRY |`
- *Rationale:* Reconciles the inventory markers with the audit-coverage addition (PATCH-4C-PA-02-D) and the new state-ambiguity escalation (this finding) in a single row update.

### PATCH-4C-PA-04 — Resolve m-02 (DC-5 enumeration: delegation expiry-sweep cadence)

**Enumerated, not registered.** `identity.expire_delegation_grant.v1` references an expiry-sweep-cadence concept that has no corresponding intended key in the Appendix C.3 DC-5 inventory. This patch adds the intended key to the enumeration (maintaining the `identity.<concept>` naming convention) and points the contract's timer reference at it. **The key is enumerated for the future Doc-3 §12.2 registration patch only — it is not registered here.**

**Amendment 4C-PA-04-A** *(insert)*

- *Affected Section:* Appendix C.3 — `identity.*` POLICY keys enumerated for the DC-5 registration patch (insert one row)
- *Existing Text Reference:*
  > `| \`identity.delegation_validity_default\` | default \`valid_to\` span at grant issue | \`create_delegation_grant\`, \`expire_delegation_grant\` |`
- *Amendment Text (the existing row, followed by the inserted row):*
  > `| \`identity.delegation_validity_default\` | default \`valid_to\` span at grant issue | \`create_delegation_grant\`, \`expire_delegation_grant\` |`
  > `| \`identity.delegation_expiry_sweep_cadence\` | cadence of the System sweep that detects and applies delegation-grant validity expiry (§5.10 \`active → expired\`) | \`expire_delegation_grant\` |`
- *Rationale:* Adds the missing intended POLICY key for the sweep-cadence concept referenced in the body, following the established `identity.<concept>` naming. Enumeration only; registration remains a Doc-3 §12.2 additive patch (DC-5 channel) — the key is **not** registered by this document (Doc-4A §18.2).

**Amendment 4C-PA-04-B**

- *Affected Section:* §C9 — Delegation Grant Contracts → `identity.expire_delegation_grant.v1` (timer reference)
- *Existing Text Reference:*
  > `- *Events:* none (§8); teardown → **[DC-1]**. · *Idempotency:* required (platform scope). · *Timer window:* \`core.system_configuration.identity.delegation_validity_default\` / expiry sweep cadence **[DC-5]**.`
- *Amendment Text:*
  > `- *Events:* none (§8); teardown → **[DC-1]**. · *Idempotency:* required (platform scope). · *Timer/sweep:* \`core.system_configuration.identity.delegation_validity_default\` (validity span) + \`core.system_configuration.identity.delegation_expiry_sweep_cadence\` (sweep cadence) **[DC-5]**.`
- *Rationale:* Replaces the unregistered free-text "expiry sweep cadence" reference with the now-enumerated intended key, restoring DC-5 traceability for every tunable the contract relies on.

---

## 5 — Cross-Reference Impact

### 5.1 — Affected base-document locations (and nothing else)

| Base location | Amendment(s) | Nature |
|---|---|---|
| §C6 `identity.activate_membership.v1` (record) | PA-01-A/B/C | actor → System; template → 21.5; audit attribution + `[ESC-IDN-AUDIT]`; idempotency scope |
| §C12.1 Actor model (System bullet) | PA-01-E | record activation as a System transition |
| §C5 `identity.update_organization_profile.v1` (audit line) | PA-02-C | `[ESC-IDN-AUDIT]` added |
| §C9 `identity.expire_delegation_grant.v1` (audit / state / timer lines) | PA-02-D, PA-03-B, PA-04-B | `[ESC-IDN-AUDIT]`; `[ESC-IDN-DELEG-EXPIRY]`; sweep-cadence key |
| §C12.3 Audit binding (ESC-IDN-AUDIT sentence) | PA-02-B | enumeration synced |
| Appendix C.2 (`[ESC-IDN-AUDIT]`; new `[ESC-IDN-DELEG-EXPIRY]`) | PA-02-A, PA-03-A | coverage expanded; new marker inserted |
| Appendix C.3 (DC-5 key table) | PA-04-A | one intended key inserted |
| Appendix A (rows: activate_membership, expire_delegation_grant) | PA-01-D, PA-03-C | inventory reconciled |

No other section, contract, table, or appendix is altered. The base document's structure (§C0–§C12 + Appendices A–D), all other 40 contract records, and every other binding are unchanged.

### 5.2 — Preservation validation

| Property | Status | Note |
|---|---|---|
| Frozen ownership boundaries (9 `identity` entities; no leakage) | **Preserved** | No entity added, moved, or re-owned. |
| DDD boundaries / single owner per capability | **Preserved** | `activate_membership` remains the sole owner of `pending → active`; no capability duplicated. |
| Authorization model (Doc-4A §6/§6B) | **Preserved** | No slug invented; authz bindings unchanged except actor disambiguation. |
| State-machine ownership (Doc-2 §5.1/§5.2/§5.10) | **Preserved** | No transition invented; m-01 routes the `suspended`-at-expiry question to Doc-2 §5.10, not resolved locally. |
| Audit ownership (Doc-2 §9 via Doc-4B) | **Preserved** | No audit action invented; coverage strengthened; Doc-2 unmodified. |
| Event ownership (Doc-2 §8 — no `identity` emitter) | **Preserved** | `Events-Produced: none` unchanged; DC-1 handling intact. |
| Template set (Doc-4A §21) | **Preserved** | 21.5 reused for activation; no new template. |
| Actor model (Doc-4A §5/§5.6) | **Preserved** | System reused; no new actor category. |
| DC-1…DC-5 governance handling | **Preserved** | DC-1…DC-5 unchanged; DC-5 enumeration completed (m-02); two `[ESC-IDN-*]` markers route to existing channels (Doc-2 §9 additive; Doc-2 §5.10 change management). |
| No new unresolved dependency introduced | **Preserved** | `[ESC-IDN-DELEG-EXPIRY]` and the new DC-5 key reuse existing channels (Doc-2 §5.10; Doc-3 §12.2 additive) — no novel dependency class. |
| Doc-4B Platform Core consumption model | **Preserved** | Consumption-by-pointer unchanged. |
| Pass discipline (additive; no Pass-B payloads; no findings generated) | **Preserved** | No payload, validation table, or error register instantiated; no review findings produced by this document. |

---

## 6 — Final Statement

Upon adoption, `Doc-4C_Content_v1.0_PassA.md` is amended by the eight amendments above (PATCH-4C-PA-01 through PATCH-4C-PA-04). **M-01** is resolved by collapsing `identity.activate_membership.v1` to a single System / Template 21.5 execution model consistent with the Doc-4A actor model, the §5 authentication boundary (DC-4), and the Doc-2 §5.2 machine. **M-02** is resolved by completing `[ESC-IDN-AUDIT]` coverage for every contract relying on a non-enumerated Doc-2 §9 action, with the reinstate inverse-legs explicitly addressed. **m-01** is resolved by raising `[ESC-IDN-DELEG-EXPIRY]` and routing the `suspended`-at-validity-expiry question to the Doc-2 §5.10 change-management channel without inventing a transition. **m-02** is resolved by enumerating `identity.delegation_expiry_sweep_cadence` for the DC-5 Doc-3 §12.2 registration patch. No frozen document is modified; no entity, event, permission slug, audit action, template, module responsibility, or state transition is introduced; DC-1…DC-5 governance handling is preserved and no new unresolved dependency is created. Doc-4C Content v1.0 Pass-A (as amended) is ready for Mini Review, Pass-A Closure, and Pass-B Authorization.

*End of Doc-4C Pass-A Patch v1.0.1 — additive resolution of approved Hard Review findings M-01, M-02, m-01, m-02. No frozen modification; nothing invented; DC-1…DC-5 preserved.*
