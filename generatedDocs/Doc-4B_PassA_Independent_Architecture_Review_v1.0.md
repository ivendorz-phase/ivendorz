# Independent Architecture Review — Doc-4B Content v1.0 Pass-A

**Review Board:** Principal Enterprise Architect · Principal API Governance Architect · Principal Module Boundary Architect · Principal AI-Agent Systems Reviewer  
**Review Date:** 2026-06-13  
**Document Under Review:** `Doc-4B_Content_v1.0_PassA.md`  
**Review Objective:** Determine whether Doc-4B Pass-A has achieved combined Pass 1–3 maturity and is ready to advance to Pass-B authoring.

**Corpus Consulted (FROZEN):**
- Master_System_Architecture_v1.0_FINAL.md
- ADR_Compendium_v1.md
- Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md
- Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md
- Doc-4A v1.0 FROZEN (Passes 1–6 + Pass 3/4/5/6 Patches + FreezeAudit Patch v1.0.1)
- Doc-4B Structure (= `Doc-4B_Structure_Proposal_v0.1.md` + `Doc-4B_Structure_Patch_v0.1.1.md`, Board-frozen)
- Doc-4_Governance_Note_v1.0.md

**Pass-A maturity claim (header):** Combined maturity of traditional Pass 1–3 (contracts + validation + error/audit/event/idempotency completeness).

**Self-review provided:** Yes — §A11 of the document provides a pre-review classification of 2 BLOCKER, 3 MAJOR, 2 MINOR findings.

**Review Posture:** Defect-finding only. Every ambiguity that could propagate into implementation by Claude Code, Cursor, AI coding agents, backend engineers, or QA engineers is treated as a defect.

---

## Executive Summary

The document is architecturally disciplined. Module boundaries are clean. No entity, event, permission, state machine, template, or cross-module ownership is invented. The five Module 0 entities are all covered. The reference-never-restate discipline is applied consistently throughout. Contract structure, idempotency, error, and event declarations are substantially correct.

The self-review's 2 BLOCKER findings are both confirmed. The review additionally identifies 1 new BLOCKER that the self-review did not catch: the `formula_version_bump` field in the Change Configuration Value contract contradicts Doc-3 §12.4's system-determined formula versioning governance. This is the highest-risk new finding because it directly misleads AI coding agents about where formula versioning responsibility lies.

The 3 new BLOCKER (including the self-review's 2) are all patchable. Two are upstream dependencies correctly routed; one is a targeted in-document contract correction. The 3 self-review MAJORs are confirmed and correctly escalated. Three new MINOR findings are identified, all patchable.

**Overall quality judgment:** The document demonstrates Pass 1–3 maturity in structural completeness, idempotency coverage, error boundary declarations, audit governance, event governance, and cross-document consistency. The new BLOCKER (B-01) is an isolated but critical contract defect that must be corrected before Pass-B authoring.

---

## Final Decision

**APPROVE WITH PATCHES**

Doc-4B Pass-A may proceed to Pass-B authoring after:
1. Finding **B-01** is patched within the document (remove `formula_version_bump`; document service-side §12.4 trigger)
2. **PA-M3** is routed for a Doc-3 §12.2 upstream patch (POLICY key registration for `core.*` infrastructure keys)
3. **PA-M5** is routed for Board adjudication (outbox dispatch audit action)
4. **PA-M4** is adjudicated by the Board (config governance ownership split)
5. **PA-M1** is adjudicated by the Board (D-1 composition convention ratification)
6. Findings **m-01**, **m-02**, **m-03** are addressed in a Pass-A amendment before the Pass-A freeze gate

Items 2–5 are upstream or governance decisions. Items 1 and 6 are in-document corrections. Pass-B may begin after item 1 is resolved and items 2–5 are formally routed; items 3–6 may be carried as pass-gate conditions.

---

## Finding Counts

| Severity | Self-Review | New (This Review) | Total |
|---|---|---|---|
| BLOCKER | 2 (PA-M3, PA-M5) | 1 (B-01) | **3** |
| MAJOR | 3 (PA-M1, PA-M2, PA-M4) | 0 | **3** |
| MINOR | 2 (PA-m1, PA-m2) | 3 (m-01, m-02, m-03) | **5** |
| NITPICK | 0 | 2 (n-01, n-02) | **2** |

*Note: PA-m1 (template selection 21.6 vs 21.3 for Admin reads) — reviewed and DISMISSED as a finding. The 21.6 selection is correct because §5.6 Admin context requires Admin-Scope + Compliance-Basis declarations that Template 21.3 (Query) does not provide. The self-review's concern is resolved.*

---

## Findings

---

### B-01 | BLOCKER | §A8 Group 5 (Change Configuration Value) — `formula_version_bump` Field Contradicts Doc-3 §12.4; Misplaces Formula Versioning Responsibility onto the Client

**Affected Section:** §A8, `core.admin_update_config_value.v1`, Request Contract

**Explanation:**

The Change Configuration Value Request Contract includes:

```
formula_version_bump : boolean : optional : default false; true where the key affects scoring
                                             and Doc-3 §12.4 requires a formula_version increment
                                             (by pointer)
```

Doc-3 §12.4 states:

> "Every POLICY change: admin permission, audited (old/new), **versioned where it affects scoring** (`formula_version` bump), and visible on the ops dashboard with its effective date."

The phrase "where it affects scoring" is a property of the POLICY key itself — specifically, whether the key is a scoring-formula input (weights, band functions, confidence group parameters). This is not a runtime assertion that the Admin actor makes at the time of the change; it is a metadata property of the registered key.

Doc-3 §12.2 defines the POLICY key inventory. A key's scoring relevance is determinable from the key registry entry. The service layer — not the API caller — is the authority for determining whether a given key change triggers a `formula_version` bump.

The `formula_version_bump: boolean` field inverts this responsibility:

1. **Client responsibility mis-assignment.** By exposing this as an optional boolean, the contract implies the Admin actor is responsible for knowing which keys affect scoring and declaring this on every write. An Admin who does not set `formula_version_bump: true` when changing a scoring-relevant key (using the default `false`) will silently skip the formula version increment, violating Doc-3 §12.4.

2. **Default-false failure path.** The default is `false`. The common path — Admin submits a config change without setting this flag — will not bump the formula version. For scoring-affecting keys (confidence weights, band functions, probation share), this silently breaks the explainability requirement explicitly called out in Doc-3 line 525: "Scores carry `formula_version`; any change to bands or weights increments the version (frozen explainability requirement)."

3. **AI agent failure mode.** An AI coding agent implementing the service layer from this contract will implement a conditional formula bump controlled by the `formula_version_bump` request field. If the agent then generates an Admin UI, the form will not default this field to `true` for scoring-affecting keys (it cannot know which keys are scoring-relevant without the key registry). The result: systematic formula version tracking failures for scoring-related config changes.

4. **Cross-module boundary concern.** `formula_version` lives on `trust.trust_scores.trust_formula_version` (Doc-2 §10.6). Module 0 does not own this column. The config change contract, authored in Module 0's Doc-4B, should not be the trigger for a Trust module's formula version bump directly. The correct pattern is either (a) system-internal key-metadata-driven versioning, or (b) a domain event from Module 0 consumed by Trust.

5. **No `formula_version` column in `core.system_configuration`.** Doc-2 §10.1 defines the `core.system_configuration` table as `key, value_jsonb, value_type, updated_by`. There is no `formula_version` column here. The field's effect on the response contract and mutation scope is unclear.

**Recommended Resolution:**

Remove `formula_version_bump` from the Request Contract. Replace with:

```
(Note: Doc-3 §12.4 requires a formula_version increment in the Trust scoring records for any
POLICY key that affects scoring. This is determined service-side from key metadata in the Doc-3
§12.2 registry — it is NOT a caller-supplied parameter. The service MUST check whether the changed
key is a scoring-formula input and, if so, trigger the formula_version increment via the Trust
module's service interface or domain event (per §4 integration single-authorship rule). The Doc-4E
and Doc-4G contracts will declare this dependency.)
```

Additionally, add a `formula_version_affected: boolean: conditional (key is scoring-relevant)` field to the Response Contract to communicate back to the Admin whether a formula version bump was triggered (for ops dashboard visibility, per Doc-3 §12.4).

---

### PA-M3 | BLOCKER (Confirmed) | Multiple Sections — All `core.system_configuration.core.*` POLICY Keys Referenced Are Unregistered in Doc-3 §12.2

**Affected Sections:** §A4 (audit queries and redaction), §A6 (outbox workers), §A8 (config change), §A9 (feature flag set); also via the internal service contracts in §A7 and §A10.

**Explanation:**

Doc-4B Pass-A references the following POLICY keys, all marked `[PA-E1]`, all within the `core.system_configuration.core.*` domain:

From §A4 (Audit Queries/Redaction):
- `core.system_configuration.core.audit_query_page_size_max`
- `core.system_configuration.core.audit_query_rate_window` / `_reset`
- `core.system_configuration.core.audit_lookup_rate_window` / `_reset`
- `core.system_configuration.core.audit_redactable_fields_max`
- `core.system_configuration.core.audit_redaction_reason_min_chars`
- `core.system_configuration.core.redaction_dedup_window`

From §A6 (Outbox Workers):
- `core.system_configuration.core.outbox_dispatch_max_attempts`
- `core.system_configuration.core.outbox_dispatch_backoff`
- `core.system_configuration.core.outbox_dispatch_dedup_window`
- `core.system_configuration.core.outbox_dlq_policy`
- `core.system_configuration.core.outbox_archive_retention`
- `core.system_configuration.core.outbox_archive_dedup_window`

From §A8 (Config Change):
- `core.system_configuration.core.config_change_reason_min_chars`
- `core.system_configuration.core.config_change_dedup_window`

From §A9 (Feature Flag Set):
- `core.system_configuration.core.flag_change_reason_min_chars`
- `core.system_configuration.core.flag_change_dedup_window`

The Doc-3 §12.2 POLICY key inventory covers: `rfq.*`, `moderation.*`, `matching.*`, `routing.*`, `tier.*`, `probation.*`, `fairness.*`, `capacity.*`, `distribution.*`, `confidence.*`, `quote.*`, `eval.*`, `abuse.*`, `suspension.*`, `econ.*`, `platform.*`, `stage_a.*`, `category.*`, `human_routing.*`, `strategic.*`, `quality.*`, `coverage.*`, `leads.*`.

**No `core.*` infrastructure key block exists in Doc-3 §12.2.** Per Doc-4A §18.2, contracts must reference registered POLICY keys by canonical name. Inventing keys in a Doc-4 document is a conformance failure. The self-review correctly flags this and routes for a Doc-3 §12.2 additive patch.

**Recommended Resolution (confirmed from self-review):** Issue a Doc-3 §12.2 additive patch registering the `core.system_configuration.core.*` key block covering: audit pagination/rate/dedup controls; outbox dispatch/retry/DLQ/archive controls; config/flag change validation and dedup windows. The patch must not alter existing §12.2 keys. The Doc-4B Pass-A contracts remain correct in structure; they reference the intended key names with `[PA-E1]` markers, pending the patch.

---

### PA-M5 | BLOCKER (Confirmed) | §A6 — Outbox Dispatcher/Archiver `Action-Ref` Binds to a Generic Catch-All; Board Must Adjudicate the Infrastructure-Audit Boundary

**Affected Section:** §A6, `core.phase2_dispatch_outbox_events.v1` and `core.phase2_archive_dispatched_events.v1`, Audit Requirements

**Explanation:**

Both outbox worker contracts declare:
```
Audit-Required:  yes
Action-Ref:      Doc-2 §9 (Platform) — "service-role sensitive operations" (by pointer)   [PA-M5]
```

Template 21.5 mandates `Audit-Required: yes` with a Doc-2 §9 Action-Ref. Doc-2 §9 (Platform audit domain) lists: "system_configuration change, feature flag change, audit redaction (event), Super Admin access (flagged), service-role sensitive operations."

"Service-role sensitive operations" is a generic catch-all — not a dedicated lifecycle action for outbox delivery. Two competing interpretations create ambiguity:

**Interpretation A:** Outbox dispatch/archive is operational telemetry (infrastructure state transition of a stream), not a business audit event. The dispatcher DELIVERS business events authored by other modules; the delivery mechanism itself is not a business action. Under this view, `Audit-Required: no` with operational telemetry captured in an ops log is correct, and the generic action is a mis-application.

**Interpretation B:** Any System-actor operation touching platform infrastructure must emit an audit record under §17.1, and the generic "service-role sensitive operations" action is an acceptable interim binding until a dedicated action is added to Doc-2 §9.

**Interpretation C:** A Doc-2 §9 patch adds dedicated actions "outbox_dispatch_run" and "outbox_archive_run" (or similar), resolving the ambiguity.

The interim binding ("service-role sensitive operations" at batch/run granularity) keeps the contracts conformant with Template 21.5's mandatory audit requirement while the adjudication is pending. But the granularity question (per-event vs per-run audit) is a significant gap: per-event auditing of every outbox row dispatched would create a recursive cycle (auditing the audit mechanism's delivery of audit events); per-run auditing is operationally correct.

**Recommended Resolution:** Board to choose among A, B (with Doc-4A clarification), or C (with Doc-2 §9 additive patch). Interim binding at batch/run granularity with "service-role sensitive operations" is defensible pending the adjudication. The contracts are not wrong under the interim binding; they are underspecified.

---

### PA-M1 | MAJOR (Confirmed) | §A10 & §A7 — D-1 Composition Friction: Templates 21.3/21.4 Do Not Fit Infrastructure Primitives; Board Ratification Required

**Affected Sections:** §A7 (`core.allocate_human_reference.v1`), §A8 (`core.config_value_query.v1`), §A9 (`core.feature_flag_evaluate.v1`), §A10 (`core.append_audit_record.v1`, `core.write_outbox_event.v1`)

**Explanation (confirmed from self-review):**

The deferred Internal Service Contract template (Doc-4A §21, RECOMMENDED but not mandatory) was composed using existing templates 21.3 (Query) and 21.4 (Command) per the frozen structure's D-1 Option B. The composition is applied with explicit non-recursion notes:
- `core.append_audit_record.v1` cannot audit itself
- `core.write_outbox_event.v1` does not produce a further event
- `core.allocate_human_reference.v1` has no independent business audit record (it participates in the caller's audited create action)

The composition is architecturally sound but creates template friction: Template 21.4 mandates `Events-Produced` and `Audit-Required` declarations that must be declared `none` / `n/a` with explicit justifications for infrastructure primitives. This is the right approach — honest annotation is better than mis-declaration — but it creates interpretive work for Pass-B authors who must understand the non-recursion reasoning.

**Recommended Resolution:** Board to choose between (a) ratifying the D-1 Option B composition convention, explicitly endorsing the non-recursion annotations as the canonical pattern for infrastructure primitives across all Doc-4 module documents, or (b) accelerating the deferred Internal Service Contract template via a Doc-4A patch. Option (a) requires no Doc-4A change; option (b) eliminates the friction but requires a Doc-4A structural amendment.

---

### PA-M2 | MAJOR (Confirmed) | §A4, §A8, §A9 — D-2: Three Admin Operations Bind to `staff_super_admin` for Lack of Least-Privilege Slugs; Doc-2 §7 Patch Recommended

**Affected Sections:** §A4 (`core.audit_record_query.v1`, `core.audit_correlation_lookup.v1`), §A8 (`core.admin_update_config_value.v1`), §A9 (`core.admin_set_feature_flag.v1`)

**Explanation (confirmed from self-review):**

Doc-2 §7 defines the Platform-staff slug space: `staff_can_moderate_rfq`, `staff_can_verify`, `staff_can_support`, `staff_can_ban`, `staff_can_manage_categories`, `staff_can_redact_audit` (compliance-scoped), `staff_super_admin` (all; every action audited+flagged).

There are no dedicated slugs for: audit read, system configuration management, or feature flag management. The contracts correctly bind to `staff_super_admin` (an existing slug — no invention), but this gives audit-read users full super-admin authority and config/flag managers more than they need.

The D-2 dependency correctly routes this for a Doc-2 §7 additive patch introducing `staff_can_read_audit`, `staff_can_manage_system_configuration`, and `staff_can_manage_feature_flags`. Until the patch is applied, `staff_super_admin` is the correct interim slug.

**Recommended Resolution:** Doc-2 §7 additive patch. Not a freeze-blocker; `staff_super_admin` governs in the interim. Contracts are correct as written; they are simply less granular than ideal.

---

### PA-M4 | MAJOR (Confirmed) | §A8 — Configuration-Change Governance: Module 0 Stores vs. Module 8 Decides

**Affected Section:** §A8, `core.admin_update_config_value.v1`, Header and `Owner-Module` declaration

**Explanation (confirmed from self-review):**

Doc-2 §16.2 assigns "system configuration policy" to Module 8 — Admin Operations (Doc-4J). The frozen Doc-4B structure §7.2 places the configuration change contract in Doc-4B (Module 0). The Pass-A document correctly surfaces this tension with the flag `[PA-M4: governance authority may belong to Doc-4J per Doc-2 §16.2 — flagged for review]`.

Two governance models are possible:
- **Module 0 owns the write:** The store, validation, and mutation are Module 0 contracts. Module 8 (Doc-4J) has no separate contract for this operation.
- **Module 8 decides; Module 0 stores:** Doc-4J authors the governance/decision-ratification contract (who can authorize a config change, what approval workflow applies). Doc-4B authors the write mechanism. The two contracts interact via service call or event.

Neither model violates the frozen architecture, but they create different contract boundaries in Doc-4J.

**Recommended Resolution:** Board to adjudicate. Confirm one of: (a) Doc-4B owns the change contract end-to-end (Module 8 governs through the `staff_super_admin` slug + audit record, per the current document); (b) Doc-4B owns the atomic write, Doc-4J authors the governance layer (approval decision, ops dashboard visibility). Under option (a), note in Doc-4B that the Doc-2 §16.2 "system configuration policy" assignment to Module 8 is satisfied by the audit trail and slug-space, not by a separate contract. Under option (b), mark `core.admin_update_config_value.v1` as called by Doc-4J's governance contract, and the Doc-4J document will author the governance endpoint.

---

### m-01 | MINOR | §A4 — `core.audit_correlation_lookup.v1` Missing `Firewall-Compliance Declaration` Inconsistently with Sibling Contract

**Affected Section:** §A4, `core.audit_correlation_lookup.v1`

**Explanation:**

The sibling contract `core.audit_record_query.v1` in the same Group (§A4) includes a `### Firewall-Compliance Declaration` section with:

```
Signals-Read:        none-as-input (audit rows may contain historical governance-signal values...)
Signals-Written:     none
Mutation-Inputs:     none
Monetization-Inputs: none
Routing-Impact:      none
Disclosure:          audit content to platform-compliance / Super Admin audience only; §7.5 compliant
```

The correlation lookup contract (`core.audit_correlation_lookup.v1`) omits this section entirely.

Both contracts: are Template 21.6 Admin, carry the same actor type (Admin), operate on the same entity (`core.audit_records`), have the same compliance-basis declaration, and carry identical §7.5 disclosure obligations. The correlation lookup has identical firewall properties (signals: none; routing impact: none; disclosure: compliance-only). The omission creates an inconsistency that an AI coding agent may interpret as "the correlation lookup has no firewall obligations," which is incorrect.

Doc-4A §4B states that module documents must include a firewall-compliance declaration for contracts touching governance signals. Audit records may contain historical signal values; the same declaration that the query contract makes (`none-as-input`) applies equally to the correlation lookup.

**Recommended Resolution:** Add the `### Firewall-Compliance Declaration` section to `core.audit_correlation_lookup.v1`, identical to the query contract's declaration (copy; the values are the same).

---

### m-02 | MINOR | §A4 — `Audit-Required: no` for Admin Reads Does Not Declare the Mechanism for "Super Admin Access (Flagged)" in Doc-2 §9

**Affected Sections:** §A4, `core.audit_record_query.v1` and `core.audit_correlation_lookup.v1`, Audit Requirements

**Explanation:**

Both audit read contracts declare:
```
Audit-Required: no    ← pure read; Super Admin access flagging is operational per Doc-2 §9
                         ("Super Admin access (flagged)"), not a business audit record (§17.1)
```

Doc-2 §9 includes "Super Admin access (flagged)" in the Platform audit domain. The contracts correctly distinguish between business audit records (§17.1, `Audit-Required: yes`) and operational flagging. However, neither the contracts nor the `core.append_audit_record.v1` internal service declaration in §A10 specifies the mechanism by which Super Admin access to audit reads is flagged.

An AI coding agent implementing the audit query endpoint will:
1. Read `Audit-Required: no` → skip audit record creation
2. Have no declaration telling it to flag `staff_super_admin` access via any infrastructure mechanism
3. Produce an implementation that silently skips the Super Admin access flagging that Doc-2 §9 requires

The flagging mechanism is likely implemented at the middleware/gateway layer when a `staff_super_admin` token is used, independent of the contract. But this is not documented in the Pass-A contracts or the internal service spec. As written, the mechanism for satisfying the Doc-2 §9 "Super Admin access (flagged)" obligation is undeclared.

**Recommended Resolution:** In the Audit Requirements block of both read contracts, add a note:
```
Audit-Required: no    ← pure read; business audit record not produced by this endpoint
Access-Flagging: yes  ← Doc-2 §9 "Super Admin access (flagged)"; the infrastructure middleware
                         (not this contract) records access when staff_super_admin token is present;
                         implementation: append to core.audit_records with actor_type=Admin,
                         action="Super Admin access (flagged)" at the API gateway/middleware layer
                         before this endpoint executes
```
Alternatively, declare `Audit-Required: yes` with `Action-Ref: Doc-2 §9 (Platform) — "Super Admin access (flagged)"` and attribute it to the middleware layer in a note.

---

### m-03 | MINOR | §A4, §A5, §A8, §A9 — `Entitlement References` Field Absent from 4 of 5 Template 21.6 Admin Contracts

**Affected Sections:** §A4 (`core.audit_correlation_lookup.v1`), §A5 (`core.admin_redact_audit_field.v1`), §A8 (`core.admin_update_config_value.v1`), §A9 (`core.admin_set_feature_flag.v1`)

**Explanation:**

Template 21.1 (which 21.6 specializes) includes `Entitlement References` as a field in the complete template. `core.audit_record_query.v1` (§A4) correctly includes:
```
### Entitlement References
Entitlements: none
```

The four other Admin (21.6) contracts omit this section entirely. While all Module 0 Admin contracts have no entitlement gating (`Entitlements: none` is the correct value for all), the systematic omission creates incomplete template adherence across 4 of 5 Admin contracts. The Doc-4A Appendix A conformance checklist (CHK items) will flag this on automated review.

The practical effect is low — all Module 0 Admin contracts are correctly unentitlement-gated, and the omission doesn't create a behavioral difference. But an AI coding agent running a conformance check against the CHK list will report template incompleteness.

**Recommended Resolution:** Add `### Entitlement References` with `Entitlements: none` to the four omitting contracts. One-line addition per contract; no structural change.

---

### n-01 | NITPICK | §A5, §A8, §A9 — `Correlation: both` Declared on Contracts with `Events-Produced: none`

**Affected Sections:** §A5 (`core.admin_redact_audit_field.v1`), §A8 (`core.admin_update_config_value.v1`), §A9 (`core.admin_set_feature_flag.v1`), Audit Requirements

**Explanation:**

These contracts declare `Correlation: both` in their Audit Requirements block. If "both" means "Phase-1 reference_id correlation AND Phase-2 `phase2-origin` linkage," the declaration is over-specified for contracts that declare `Events-Produced: none`. Phase-2 origin correlation is only meaningful when a downstream Phase-2 worker will consume the event and carry the originating reference forward. When no events are produced and no Phase-2 workers are triggered, `Correlation: both` has no Phase-2 component to correlate against.

This is a notational imprecision, not a behavioral error. If "both" is treated by the audit infrastructure as "include reference_id in the audit record," it has no negative effect.

**Recommended Resolution:** Clarify the Correlation vocabulary in a Pass-A amendment note or in the Doc-4A patch. If "both" is the correct term for "Phase-1 reference_id correlation included in the audit record, with Phase-2 origin linkage applicable if downstream workers are later added," note this definition. Alternatively, for contracts with `Events-Produced: none`, replace `both` with `standard` if that is the canonical term for Phase-1-only correlation.

---

### n-02 | NITPICK | §A7, §A8, §A9, §A10 — `Audience: internal-service` Is Non-Standard in Template 21.3/21.4

**Affected Sections:** All D-1 composition contracts (§A7, §A8, §A9, §A10)

**Explanation:**

The D-1 composition contracts add `Audience: internal-service` as the first field in their template. This field does not appear in Template 21.3 (Internal Service Contract Template, RECOMMENDED) or 21.4 (Event Schema Declaration Template, RECOMMENDED). It is a convention invented within this document to mark the contract as internal.

The convention is clear and useful for AI-agent authoring safety — it prevents an agent from treating an internal service as an external endpoint. But it is undocumented in the frozen corpus, which means future Doc-4C…4K authors won't know whether to use this field when they author their own internal service compositions under D-1.

**Recommended Resolution:** If the Board ratifies D-1 Option B composition, add `Audience: internal-service` to the D-1 composition pattern documentation — either in a Doc-4A note (as part of elevating the Internal Service Template) or in the frozen Doc-4B structure's D-1 guidance (via a structure amendment note). No change needed to the current contracts; the field should just be documented as a convention.

---

## Domain-by-Domain Assessment

| Domain | Result | Key Findings |
|---|---|---|
| 1. Module Boundary Integrity | **PASS** | Only `core.*` entities owned and operated on; per-event 21.2 integrations correctly deferred to producing modules (§4.4); no non-Module-0 entity addressed as owner |
| 2. Ownership Integrity | **PASS WITH FLAG** | No ownership reassignment; PA-M4 (config governance) correctly escalated — no ownership moved by this document |
| 3. Contract Inventory Completeness | **PASS** | All 5 `core` entities covered; supporting infrastructure obligations (audit-write, outbox-write, ID allocation, config read, flag eval) all documented; UUIDv7 generation correctly noted as no-contract capability |
| 4. Template Correctness | **PASS WITH ISSUES** | 21.6 Admin for audit queries/redaction/config/flag (correct); 21.5 System for outbox workers (correct + PATCH-FA-01 compliant); D-1 composition for internal services (acceptable pending PA-M1 ratification); m-01/m-03 template incompleteness in correlation lookup |
| 5. Permission Governance | **PASS** | No invented slugs; `staff_can_redact_audit` verified in Doc-2 §7 (existing); `staff_super_admin` correctly applied as interim for D-2 gap; PA-M2 correctly escalated |
| 6. Audit Governance | **PASS WITH BLOCKER** | PA-M5 (outbox dispatch action) confirmed BLOCKER; m-02 (Super Admin read flagging mechanism undeclared); redaction and mutating contracts: audit correctly declared |
| 7. Event Governance | **PASS** | No events coined (§16.4); `Events-Produced: none` correctly declared per Doc-2 §8 (no Module 0 events in catalog); outbox-write mechanism honors §16.2 atomicity; per-event integrations correctly deferred; Tolerant Reader obligation confirmed via corpus binding |
| 8. AI-Agent Authoring Safety | **FAIL → APPROVE WITH PATCHES** | B-01 (formula_version_bump misleads agents on formula versioning responsibility — BLOCKER); m-01/m-02/m-03 (template inconsistencies create silent implementation gaps); non-recursion notes for D-1 primitives are well-constructed; no TBD placeholders; all corpus citations canonical |
| 9. Cross-Document Consistency | **PASS WITH BLOCKER** | PA-M3 (POLICY keys unregistered in Doc-3 §12.2) confirmed BLOCKER; all entity field bindings consistent with Doc-2 §10.1; all audit action bindings consistent with Doc-2 §9 except PA-M5 |
| 10. Pass-A Readiness | **CONDITIONAL** | Achieves combined Pass 1–3 maturity in structural completeness, idempotency (joint rule §14.3 honored), error boundaries, event governance, and validation ordering; ready for Pass-B after B-01 patch and routing of upstream BLOCKERs |

---

## Mandatory Patch List

The following changes are required before or concurrent with Pass-B authorization.

---

### Patch PA-B01 — Remove `formula_version_bump` from Change Configuration Value Request Contract

**Addresses:** B-01 (BLOCKER)  
**Priority:** Must be applied before Pass-B begins

In §A8, `core.admin_update_config_value.v1`, Request Contract:

**Remove:**
```
formula_version_bump : boolean : optional : default false; true where the key affects scoring
                                             and Doc-3 §12.4 requires a formula_version increment
                                             (by pointer)
```

**Replace with (inline note):**
```
(Doc-3 §12.4 requires a formula_version increment for POLICY keys that affect scoring. This
is determined service-side from the key's metadata in the Doc-3 §12.2 registry — the API caller
does not assert this. The service MUST check whether the changed key is a scoring-formula input
and trigger the Trust module's formula_version bump through the appropriate integration channel
(event or service call — to be declared in the Doc-4G integration contract). See Doc-4A §4
integration single-authorship rule for the integration ownership.)
```

**Add to Response Contract:**
```
formula_version_bumped : boolean : conditional (key is scoring-relevant) : true if the
                                   service determined this key change triggered a formula_version
                                   increment per Doc-3 §12.4; absent if the key is not
                                   scoring-relevant
```

---

### Patch PA-m01 — Add `Firewall-Compliance Declaration` to Correlation Lookup

**Addresses:** m-01 (MINOR)  
**Priority:** Before Pass-A freeze gate

In §A4, `core.audit_correlation_lookup.v1`, add after `### Required Permissions`:

```
### Firewall-Compliance Declaration
Signals-Read:        none-as-input (audit records may contain historical governance-signal values
                     as recorded facts; surfaced to compliance only per §7.5; never used as a
                     computation input — identical to core.audit_record_query.v1)
Signals-Written:     none
Mutation-Inputs:     none
Monetization-Inputs: none
Routing-Impact:      none
Disclosure:          audit content to platform-compliance / Super Admin audience only; §7.5 compliant
```

---

### Patch PA-m02 — Declare Super Admin Access Flagging Mechanism in Audit Read Contracts

**Addresses:** m-02 (MINOR)  
**Priority:** Before Pass-A freeze gate

In §A4, both `core.audit_record_query.v1` and `core.audit_correlation_lookup.v1`, Audit Requirements:

**Before:**
```
Audit-Required: no    ← pure read; Super Admin access flagging is operational per Doc-2 §9...
```

**After:**
```
Audit-Required: no    ← no business audit record produced by this endpoint (§17.1)
Access-Flagging: yes  ← Doc-2 §9 (Platform) "Super Admin access (flagged)": the API
                        middleware/gateway layer writes a core.audit_records row when a
                        staff_super_admin token is used, independently of this contract;
                        actor_type=Admin, action="Super Admin access (flagged)";
                        this is an infrastructure obligation, not a contract-level Audit
                        Requirements declaration (§17.1 distinction: operational vs business)
```

---

### Patch PA-m03 — Add `Entitlement References` to Four Admin Contracts

**Addresses:** m-03 (MINOR)  
**Priority:** Before Pass-A freeze gate

Add the following section to each of the four omitting contracts, in the position after `### Audit Requirements` / before `### Operating Stage`:

```
### Entitlement References
Entitlements: none    ← Module 0 Admin contracts are not entitlement-gated; platform
                        infrastructure access is permission-slug-controlled only (Doc-4A §18)
```

Apply to: `core.audit_correlation_lookup.v1`, `core.admin_redact_audit_field.v1`, `core.admin_update_config_value.v1`, `core.admin_set_feature_flag.v1`.

---

## Self-Review Assessment

| Self-Review Finding | Independent Review Disposition |
|---|---|
| PA-M3 (BLOCKER) — POLICY keys unregistered | **CONFIRMED BLOCKER** — Doc-3 §12.2 has no `core.*` infrastructure key block; all referenced keys absent from the inventory |
| PA-M5 (BLOCKER) — Outbox audit action | **CONFIRMED BLOCKER** — "service-role sensitive operations" is a catch-all; interim binding acceptable; Board must adjudicate; three resolution options confirmed viable |
| PA-M1 (MAJOR) — D-1 composition friction | **CONFIRMED MAJOR** — composition is architecturally sound; Board ratification or Internal Service Template acceleration required |
| PA-M2 (MAJOR) — D-2 least-privilege slugs | **CONFIRMED MAJOR** — Doc-2 §7 contains `staff_super_admin` and `staff_can_redact_audit` but no config/flag/audit-read slugs; interim binding correct |
| PA-M4 (MAJOR) — Config governance ownership | **CONFIRMED MAJOR** — Doc-2 §16.2 assigns system configuration policy to Module 8; frozen structure places contract in Doc-4B; governance split needs adjudication |
| PA-m1 (MINOR) — 21.6 vs 21.3 for Admin reads | **DISMISSED — NOT A FINDING** — Template 21.6 is correct for Admin-actor reads requiring §5.6 Admin-Scope + Compliance-Basis declarations; Template 21.3 (Query) does not provide these fields; the selection is sound |
| PA-m2 (MINOR) — Dispatcher/archiver scheduled trigger | **CONFIRMED as NITPICK** — deviates from typical single-event 21.5 trigger shape but is conformant; reinforces PA-M1 case; severity downgraded to NITPICK in this review |

---

## Can Doc-4B Pass-A Proceed to Pass-B Authoring?

**Yes — after the mandatory patch (PA-B01) is applied and upstream findings are formally routed.**

The document has achieved combined Pass 1–3 maturity in all non-blocked domains:
- Contract completeness: All 5 entities, 13 contracts/services, infrastructure obligations — complete
- Validation: Standard V1/V2/V3/V4/V8 ordering correct throughout; POLICY-key bound limits correctly referenced
- Error taxonomy: Error classes, boundaries, and timing-uniformity assertions correct and complete
- Idempotency: Joint rule §14.3 honored for all commands; not-applicable correctly declared for reads; worker dedup windows referenced (pending PA-M3 registration)
- Event governance: No invented events; outbox atomicity correctly specified; per-event integrations correctly deferred
- Audit: Business audit correctly declared for all mutating contracts; redaction-append self-referential loop correctly broken
- State machine: Correctly declares `State Machine Effects: none` throughout (no Doc-2 §5 state machines in Module 0); outbox status column correctly framed as Mutation-Scope per structure Patch F-03
- Cross-document: Bindings to Doc-2 §7, §8, §9, §10.1, and Doc-3 §12.2 all correct in structure (PA-M3 is a missing upstream registration, not an incorrect binding)

The one new BLOCKER (B-01) is a targeted contract defect in one field of one contract. The two self-review BLOCKERs (PA-M3, PA-M5) are upstream dependency gaps that the document correctly routes via `[PA-E1]` and `[PA-M5]` markers — they are not authoring errors.

**Gate conditions for Pass-B authorization:**
1. PA-B01 patch applied (B-01 removed/corrected) — within this document
2. PA-M3 upstream routing confirmed — Doc-3 §12.2 patch authorized by Board
3. PA-M5 Board adjudication recorded — one of the three resolution options selected
4. PA-M4 Board adjudication recorded — config governance model confirmed
5. PA-M1 Board adjudication recorded — D-1 composition ratified or template acceleration authorized
6. Minor patches (PA-m01/m-02/m-03) applied — before Pass-A freeze gate (may be carried into Pass-B)

---

*End of Independent Architecture Review — Doc-4B Content v1.0 Pass-A.*  
*Decision: APPROVE WITH PATCHES. 3 BLOCKERs (2 confirmed upstream; 1 new in-document), 3 MAJORs (confirmed; all correctly escalated), 3 MINORs (1 confirmed; 2 new), 2 NITPICKs. Combined Pass 1–3 maturity achieved subject to patches. Pass-B may proceed after PA-B01 correction and routing of upstream BLOCKERs.*
