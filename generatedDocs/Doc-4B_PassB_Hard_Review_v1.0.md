# Doc-4B — Pass-B Independent Architecture Hard Review v1.0

| Field | Value |
|---|---|
| Review Type | Independent Architecture Hard Review — Freeze-Readiness |
| Document Under Review | `Doc-4B_Content_v1.0_PassB.md` |
| Review Objective | Determine whether Doc-4B Pass-B is ready for Doc-4B Freeze |
| Reviewer Posture | Defect-finding only. The reviewer is NOT the author. No new features, entities, permissions, events, or workflows are proposed. No architecture is redesigned. |
| Review Date | 2026-06-13 |
| Decision | **APPROVE WITH FREEZE PATCH** |

---

## §R0 — Review Posture

This is a freeze-readiness review. The question is not whether additional features could be added. The question is whether the current document is **correct, complete, internally consistent, implementation-safe, and freeze-ready** as the authoritative implementation contract layer for Module 0.

All findings are treated as implementation defects that will propagate into production systems. The audience for Doc-4B is Claude Code, Cursor, AI coding agents, backend engineers, QA engineers, and integration engineers. Any ambiguity that could mislead an AI agent building against this document is treated as a defect.

The reviewer has NOT considered Pass-A or prior review documents as a baseline. This review evaluates Pass-B against the frozen corpus only.

---

## §R1 — Corpus Referenced

| Document | Role | Effective Version |
|---|---|---|
| `Master_System_Architecture_v1.0_FINAL.md` | Architecture authority | FROZEN |
| `ADR_Compendium_v1.md` | ADR authority | FROZEN |
| `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` | Domain model authority | Doc-2 v1.0.3 (base v1.0.2 + `Doc-2_Patch_v1.0.3.md`) |
| `Doc-2_Patch_v1.0.3.md` | RFQ state machine additive patch | APPROVED |
| `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` | Procurement spec authority | Doc-3 v1.0.2 (base v1.0.1 + `Doc-3_Patch_v1.0.2.md`) |
| `Doc-3_Patch_v1.0.2.md` | Doc-3 additive patch | APPROVED |
| `Doc-4A v1.0 (FROZEN)` | Template and governance authority | Pass1–Pass6 + Pass3/4/5/6 Patches v1.0.1 + FreezeAudit Patch v1.0.1 |
| `Doc-4B_Structure_Proposal_v0.1.md` + `Doc-4B_Structure_Patch_v0.1.1.md` | Frozen Doc-4B Structure | BOARD-FROZEN |
| `Doc-4B_Content_v1.0_PassA.md` | Pass-A (superseded by Pass-B) | Reference |
| `Doc-4B_PassA_Patch_v1.0.1.md` | Pass-A review resolution | APPLIED in Pass-B |
| `Doc-4B_PassA_Consistency_Patch_v1.0.2.md` | Version-identifier normalization | APPLIED in Pass-B |

**Version note.** Pass-B claims "Doc-2 v1.0.3 (base v1.0.2 + Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3)". The file `Doc2_Patch_v1.0.2` does not exist in the workspace; `Doc-2_Patch_v1.0.3.md` applies directly to the v1.0.2 base to produce v1.0.3. This ghost reference originates in the Consistency Patch's reconciliation table and propagated into Pass-B's header. It is a documentation artifact only — the substantive corpus is correct. See PB-n02.

---

## §R2 — Review Summary

| Severity | Count | IDs |
|---|---|---|
| BLOCKER | 1 | PB-B01 |
| MAJOR | 1 | PB-M01 |
| MINOR | 2 | PB-m01, PB-m02 |
| NITPICK | 3 | PB-n01, PB-n02, PB-n03 |

**Final Decision: APPROVE WITH FREEZE PATCH**

Doc-4B Pass-B is architecturally sound, internally consistent, and achieves combined Pass-4/5 maturity. The single BLOCKER (PB-B01) is the PA-M3 upstream dependency — correctly flagged and tracked by the document itself. It requires a Doc-3 §12.2 additive patch, not a redesign. The MAJOR (PB-M01) and two MINORs (PB-m01, PB-m02) require targeted freeze patches on specific contracts. After those four actions, Doc-4B may be declared FROZEN without a new full review cycle.

---

## §R3 — Domain Review

---

### Domain 1 — Family Map Conformance

**Verdict: PASS**

Doc-4B authors contracts for Module 0 (Platform Core / Shared Kernel) and no other module. The §B0 scope statement is unambiguous: "Doc-4B authors the contracts of Module 0 … and **no other module**." All 13 contract/service entries in §B1 operate exclusively on `core.*` entities. Per-event integration contracts (21.2) are correctly deferred to producing modules per §4.4. Contract count is 13 — unchanged from Pass-A, consistent with the Objective ("Hardening, not expansion. No new contracts, entities, events, permissions, templates, or domains"). Doc-4C (Identity & Organization) is not mentioned, correctly.

Doc-2 v1.0.3 and Doc-3 v1.0.2 patches were reviewed. Neither touches Module 0 entities, permissions, audit actions, events, or POLICY keys. Doc-2 Patch v1.0.3 adds two edges to the RFQ state machine (§5.4); Doc-3 Patch v1.0.2 resolves procurement-engine findings. No Module 0 conformance impact from either patch.

---

### Domain 2 — Module Boundary Integrity

**Verdict: PASS**

No non-Module-0 entity is created or transitioned anywhere in the document. The Trust `trust.trust_scores.trust_formula_version` (Doc-2 §10.6) is referenced by name in prose as the target of the formula-version trigger — correctly, because Module 0 triggers Trust, it does not own or mutate the Trust column. The PA-B01 fix (removing `formula_version_bump` from the request) strengthens the boundary: Module 0 no longer places formula-version determination on the API caller. The `formula_version_bumped` response field is a visibility field, not a mutation ownership claim.

**However:** the mechanism by which Module 0 triggers the Trust formula-version increment is ambiguous. See PB-M01 (MAJOR).

---

### Domain 3 — Contract Inventory Completeness

**Verdict: PASS**

All five Module 0 entities have complete contract coverage:

| Entity | Coverage |
|---|---|
| `core.audit_records` | Query (21.6) + Correlation lookup (21.6) + Redact (21.6) + Append (21.4 D-1) |
| `core.outbox_events` | Dispatch (21.5) + Archive (21.5) + Write (21.4 D-1) |
| `core.id_sequences` | UUIDv7 (no contract; algorithmic) + Allocate human reference (21.4 D-1) |
| `core.system_configuration` | Query (21.3 D-1) + Change (21.6) |
| `core.feature_flags` | Evaluate (21.3 D-1) + Set (21.6) |

No contract is missing. No "TBD" or placeholder contract appears. No contract outside Module 0 boundary. §B0 Objective statement ("Hardening, not expansion") is upheld — count is 13, unchanged.

---

### Domain 4 — Template Correctness

**Verdict: PASS WITH FINDINGS**

Template assignments are correct:
- **21.6 Admin** (mutating and read): all five Admin contracts appropriately use 21.6. The Pass-A review dismissal of 21.3 vs 21.6 for Admin reads is confirmed: §5.6 requires Admin-Scope + Compliance-Basis; Template 21.3 does not provide them.
- **21.5 System** (Phase-2 workers): both outbox contracts carry `Response: none` (PATCH-FA-01), `Correlation: phase2-origin` (PATCH-FA-01), `State-Machine-Effects: none`, and `Mutation-Scope`. ✓
- **21.4/21.3 D-1 composition**: internal services carry `Audience: internal-service`, non-recursion annotations, and justified `Audit: n/a` / `Events: n/a`. ✓

**Gap.** Template 21.6 requires `Compliance-Basis` in the Required Permissions block per Doc-4A §5.6. Three Admin contracts declare it correctly (both audit reads and the redact contract). Two do not:
- `core.admin_update_config_value.v1` — missing `Compliance-Basis`
- `core.admin_set_feature_flag.v1` — missing `Compliance-Basis`

See PB-m01 (MINOR).

All five Admin contracts now carry `Entitlements: none` (PA-m03 integrated) ✓. All five carry the Firewall-Compliance Declaration (PA-m01 integrated for the correlation lookup) ✓. `Operating Stage` and `Rate Limits` are present on all callable contracts ✓.

---

### Domain 5 — Error Governance

**Verdict: PASS WITH FINDING**

Error envelope: §B3 declares the standard §12.1 envelope shape (error_class, error_code, message, field_errors, retryable, reference_id) applies to all contracts by pointer — conformant with the "reference-never-restate" convention (Doc-4A §0.3). Per-contract error codes correctly enumerate domain-specific codes only.

Error class coverage: VALIDATION, NOT_FOUND, BUSINESS, CONFLICT, RATE_LIMITED, DEPENDENCY, SYSTEM, REFERENCE classes are all present across the contract set with appropriate codes. AUTHORIZATION failures are platform-standard; omission from per-contract enumeration is intentional and correct.

**Gap.** `core.audit_record_query.v1` uses `core_audit_not_found` (NOT_FOUND); `core.admin_redact_audit_field.v1` uses `core_audit_record_not_found` (NOT_FOUND) for what is conceptually the same condition (an `audit_records` row not found). The codes are distinct despite identical conceptual semantics. An AI agent implementing a shared error-handling layer will not be able to treat these uniformly. See PB-n01 (NITPICK).

Specific correctness checks:
- Redact contract declares CONFLICT (`core_audit_redaction_conflict`) consistent with `Concurrency: optimistic`. ✓
- Config change declares REFERENCE (`core_config_key_not_found`) consistent with V7 registration gate. ✓
- Outbox dispatch declares DEPENDENCY (`core_outbox_dispatch_failed`, retryable) — correct for a consumer-delivery failure. ✓
- Internal primitives declare SYSTEM (`core_audit_append_failed`, `core_outbox_write_failed`) — correct; caller's transaction rolls back. ✓

---

### Domain 6 — Audit Governance

**Verdict: PASS**

Audit coverage:

| Contract | Audit-Required | Action-Ref | Source |
|---|---|---|---|
| `core.audit_record_query.v1` | no + Access-Flagging: yes | "Super Admin access (flagged)" | Doc-2 §9 ✓ |
| `core.audit_correlation_lookup.v1` | no + Access-Flagging: yes | same | Doc-2 §9 ✓ |
| `core.admin_redact_audit_field.v1` | yes | "audit redaction (event)" | Doc-2 §9 ✓ |
| `core.phase2_dispatch_outbox_events.v1` | yes | "service-role sensitive operations" [D-5] | Doc-2 §9 ✓ (interim) |
| `core.phase2_archive_dispatched_events.v1` | yes | same [D-5] | Doc-2 §9 ✓ (interim) |
| `core.admin_update_config_value.v1` | yes | "system_configuration change" | Doc-2 §9 ✓ |
| `core.admin_set_feature_flag.v1` | yes | "feature flag change" | Doc-2 §9 ✓ |
| Internal D-1 primitives | n/a (non-recursion) | — | ✓ |
| D-1 reads | no (reads) | — | ✓ |

All Doc-2 §9 Platform audit actions are bound. No action is invented. Access-Flagging (PA-m02) correctly places the "Super Admin access (flagged)" responsibility on the API middleware layer — an infrastructure obligation distinct from a contract-level business audit declaration. The mechanism (middleware writes before endpoint executes, actor_type=Admin, action="Super Admin access (flagged)") is specified with sufficient implementation guidance.

Mutation-Scope and Correlation fields are declared on all mutating contracts. §14.3 joint rule (one audit record, one outbox event on replay) is applied consistently to Admin contracts. Outbox workers use `Correlation: phase2-origin` per PATCH-FA-01 ✓.

`core.audit_records` is correctly treated as append-only with no Doc-2 §5 state machine; redaction is field-blanking captured under Mutation-Scope (Structure Patch F-03 applied throughout) ✓.

D-5 [BOARD DECISION PENDING] markers correctly present on outbox worker Action-Refs ✓.

---

### Domain 7 — Event Governance

**Verdict: PASS**

No domain event is coined in this document (§16.4). Every contract with `Events-Produced: none` cites the reason: Doc-2 §8 designates no event for that operation. The `core.write_outbox_event.v1` internal service validates that `event_name` must exist in Doc-2 §8 and never coins one ✓. The outbox dispatcher delivers existing events — it does not produce new ones ✓.

The Trust formula-version trigger in `core.admin_update_config_value.v1` uses "the integration channel authored by the owning module per §4 — Doc-4B coins no event." This is consistent with `Events-Produced: none` and correctly defers the integration contract to Doc-4G/Doc-4E. However, the mechanism is left ambiguous — see PB-M01 (MAJOR).

Doc-2 §8 has no Module 0 / `core.*` events — confirmed in prior review. The outbox write primitive (`core.write_outbox_event.v1`) correctly enforces this by requiring event_name to exist in Doc-2 §8 by pointer, never permitting a runtime invention ✓.

---

### Domain 8 — Configuration Governance

**Verdict: PASS**

All `core.system_configuration.core.*` keys are marked `[PA-E1]` — none treated as registered. Count confirmed: 18 distinct keys across §B4 (audit pagination/rate/dedup), §B5 (redaction reason-min/dedup), §B6 (outbox dispatch/retry/DLQ/archive), §B8 (config change reason-min/dedup), §B9 (flag change reason-min/dedup). PA-M3 freeze gate is correctly maintained.

`core.config_value_query.v1` correctly declares: "key registered in Doc-3 §12.2 — an unknown key is a contract gap (escalate §18.2), never a runtime invention." ✓

`core.admin_update_config_value.v1` correctly declares: "a new key requires a Doc-3 patch (escalation), never created here." ✓

V8 validation on config change correctly enforces that FIXED rules (Doc-3 §12.1) are never settable via the config surface — the `core_config_fixed_rule_not_settable` BUSINESS error code covers this ✓.

Doc-3 §12.2 POLICY key inventory (confirmed to have no `core.*` block) is unchanged in Doc-3 v1.0.2. The upstream patch adds no Module 0 keys. PA-M3 remains an upstream blocker.

Firewall-Compliance Declaration on `core.admin_update_config_value.v1` correctly states `Routing-Impact: none — config tunes POLICY values only; never alters FIXED rules, trust, verification, eligibility, routing fairness, or matching confidence (§18.3, §18.5, §4B)` ✓.

---

### Domain 9 — AI-Agent Authoring Safety

**Verdict: PASS WITH FINDINGS**

**Strengths:**
- No invented slugs, POLICY keys, events, entities, templates, or state machines anywhere in the document.
- All five open dependency markers ([D-1], [D-2], [D-4], [D-5], [PA-E1]) appear inline at every affected point. AI agents reading any affected contract will encounter the open-dependency signal and will not silently resolve it.
- No unresolved "TBD" or placeholder language (§B13.1 confirmed).
- Contract-ID convention (`core.<operation>.v1`) and error-code namespace (`core_<domain>_<code>`) are defined and applied consistently.
- §B12 Cross-Reference Index maps all binding points to frozen sources.
- §B11 Operational Readiness provides implementers with the cross-cutting behavioral rules (idempotency, outbox ordering, retry/DLQ, failure discipline, config governance, flag governance, audit integrity).

**Gap 1.** `core.admin_update_config_value.v1` states the formula_version trigger uses "the integration single-authorship channel (domain event or service call)." The phrase "domain event or service call" leaves the trigger mechanism undecided — an AI agent cannot determine whether to (a) write to the outbox / coin a domain event (which conflicts with `Events-Produced: none`) or (b) make a synchronous service call to Trust. Transaction boundary, failure mode, and `formula_version_bumped` semantics all depend on this choice. See PB-M01 (MAJOR).

**Gap 2.** The Idempotency note on `core.admin_redact_audit_field.v1` includes "no duplicate outbox event" — the standard §14.3 joint-rule language — despite `Events-Produced: none`. An AI agent reading this note will reasonably infer that the redact contract writes an outbox event that it must deduplicate. The contract does not. See PB-m02 (MINOR).

**Gap 3.** Two Admin contracts (`core.admin_update_config_value.v1`, `core.admin_set_feature_flag.v1`) are missing the `Compliance-Basis` field from their Required Permissions block. An AI agent implementing these contracts against the 21.6 template checklist will detect the gap. See PB-m01 (MINOR).

---

### Domain 10 — Cross-Document Consistency

**Verdict: PASS WITH FINDING**

§B12 Cross-Reference Index covers 27 binding points, each resolved to a specific frozen source section. All critical bindings verified:

- `reference_id` mandate → "Doc-4A §22.1 C-05 as amended by Pass 6 Patch v1.0.1 P6-B01" ✓
- Template 21.5 `Response: none` carve-out → "FreezeAudit Patch v1.0.1 PATCH-FA-01" ✓
- Outbox = no §5 state machine → "Doc-2 §2; Doc-4A §13; Structure Patch v0.1.1 F-03" ✓
- Permission slugs → "Doc-2 §7" (verified: `staff_super_admin`, `staff_can_redact_audit` exist; D-2 gap explicitly tracked) ✓
- Formula-version ownership → "`trust.trust_scores.trust_formula_version`, Doc-2 §10.6" ✓
- POLICY key referencing → "Doc-4A §18.2; Doc-3 §12.2 ([PA-E1]: `core.*` block unregistered → PA-M3)" ✓
- Audit actions cited → all verified against Doc-2 §9 Platform row ✓

Canonical version identifiers (Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 FROZEN) are applied consistently throughout the document (Consistency Patch C-01 applied) ✓.

**Gap.** Pass-B header cites "Doc-2 v1.0.3 (base `…v1.0.2.md` + Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3)". The file `Doc2_Patch_v1.0.2` does not exist. The correct composition is "base v1.0.2 + `Doc-2_Patch_v1.0.3.md` = v1.0.3". This ghost reference originated in the Consistency Patch reconciliation table and propagated into the Pass-B header. Substantive corpus is unaffected. See PB-n02 (NITPICK).

---

### Domain 11 — Freeze Gate Validation

**Required adjudication items: D-1, D-2, D-4, D-5, PA-M3**

---

#### D-1 — Template Composition Convention

**Document status: BOARD DECISION PENDING. Document self-freeze-gate: No.**

**Adjudication: MAJOR — NOT A FREEZE BLOCKER.**

The D-1 Option b composition (21.3/21.4 with `Audience: internal-service` + non-recursion annotations) is architecturally sound. The non-recursion rationale is explicit and correct: infrastructure primitives invoked inside a caller's transaction do not recursively audit themselves. The `Audience: internal-service` marker is a valid AI-agent safety convention identifying these contracts as internal-only. Whether the Board ratifies this convention or accelerates a dedicated Internal Service Template (the D-1 options) is a governance question that does not change the current contracts' correctness. Any Board resolution will either endorse the existing pattern (no change) or introduce a new template (additive Doc-4A patch, requiring conformance update from Doc-4B). The contracts are correctly authorable and implementable under the interim. D-1 does not gate freeze.

---

#### D-2 — Permission Granularity

**Document status: DOC-2 PATCH PENDING. Document self-freeze-gate: No.**

**Adjudication: MAJOR — NOT A FREEZE BLOCKER.**

`staff_super_admin` is a verified Doc-2 §7 slug (governs all actions; every access audited and flagged). Its use as the interim slug for audit-read, config-change, and flag-management operations is conformant — "super admin" is not invented; it is the most restrictive existing permission and is operationally correct. The recommended additive slugs (`staff_can_read_audit`, `staff_can_manage_system_configuration`, `staff_can_manage_feature_flags`) are a Doc-2 §7 least-privilege improvement, not a fix for a broken contract. D-2 does not gate freeze.

---

#### D-4 — Configuration Governance Boundary

**Document status: BOARD DECISION PENDING. Document self-freeze-gate: No.**

**Adjudication: MAJOR — NOT A FREEZE BLOCKER.**

The tension is real: Doc-2 §16.2 assigns "system configuration policy" to Module 8 (Doc-4J); the frozen Doc-4B Structure §7.2 places `core.admin_update_config_value.v1` in Doc-4B. The document correctly follows the frozen Structure and flags the tension. The Board's decision determines whether Module 8 (Doc-4J) adds a governance/ratification layer above Module 0's write, or whether Module 0 owns the contract end-to-end with Module 8 controlling it via the permission slug and audit trail. Either resolution is additive — it does not require removing or redesigning the Module 0 contract. D-4 does not gate freeze.

---

#### D-5 — Outbox Audit Granularity

**Document status: BOARD DECISION PENDING. Document self-freeze-gate: YES (as declared in §B2).**

**Adjudication: MAJOR — NOT A FREEZE BLOCKER. (Independent review overrides the document's self-classification.)**

The interim Action-Ref "service-role sensitive operations" (Doc-2 §9, Platform row) is a verified existing audit action. Binding at dispatch-run/batch granularity (not per-event) is operationally correct — per-event audit of outbox delivery would recursively audit the delivery of audit events. The three Board options (A: operational-telemetry-only with Doc-4A clarification; B: retain interim + Doc-4A clarification; C: dedicated Doc-2 §9 actions) are all additive resolutions. None requires modifying the behavioral contract of the outbox workers — they change only the audit-action name and granularity declaration. An AI agent implementing the outbox workers from Pass-B will produce conformant audit records under any of the three options.

The document's conservative self-classification as a freeze gate is noted but not binding on the independent review. D-5 does not gate freeze; the Board decision should be formally recorded and the outbox contracts given a conformance update when the decision issues.

---

#### PA-M3 — Infrastructure POLICY Key Registration

**Document status: DOC-3 PATCH PENDING. Document self-freeze-gate: YES (affected contracts).**

**Adjudication: BLOCKER — IS A FREEZE BLOCKER for 7 contracts. (See PB-B01.)**

18 `core.system_configuration.core.*` keys are referenced across 7 contracts and are absent from the Doc-3 §12.2 POLICY key inventory. Per Doc-4A §18.2, a POLICY key "MUST exist in Doc-3 §12.2" for a contract referencing it to be freeze-ready. An AI agent implementing any of the 7 affected contracts will encounter validation rule V7/V8 referencing Doc-3 §12.2 and be unable to register the key as valid. The `core.config_value_query.v1` V8 rule ("key registered in Doc-3 §12.2 — an unknown key is a contract gap") would reject all `core.*` keys at runtime until registration.

The contracts are structurally correct — the key names are specified, the `[PA-E1]` markers are present, and the freeze gate is acknowledged. The resolution (an additive Doc-3 §12.2 patch adding the `core.*` key block) requires no contract redesign and will not trigger a new Doc-4B review cycle. The 7 affected contracts cannot be declared frozen until the registration patch is in effect.

**Affected contracts (7):**
1. `core.audit_record_query.v1` (rate-limit keys, page-size key)
2. `core.audit_correlation_lookup.v1` (rate-limit keys)
3. `core.admin_redact_audit_field.v1` (redaction bounds keys, dedup window)
4. `core.phase2_dispatch_outbox_events.v1` (dispatch/retry/DLQ keys)
5. `core.phase2_archive_dispatched_events.v1` (archive retention/dedup keys)
6. `core.admin_update_config_value.v1` (change-reason min, dedup window)
7. `core.admin_set_feature_flag.v1` (flag-change reason min, dedup window)

**Immediately freeze-eligible contracts (6, unaffected by PA-M3 and by freeze-patch findings below):**
- UUIDv7 capability (non-contract; algorithmic)
- `core.allocate_human_reference.v1`
- `core.config_value_query.v1`
- `core.feature_flag_evaluate.v1`
- `core.append_audit_record.v1`
- `core.write_outbox_event.v1`

---

## §R4 — Findings Register

---

### PB-B01 — BLOCKER

**Finding ID:** PB-B01
**Severity:** BLOCKER
**Affected Contracts:** `core.audit_record_query.v1`, `core.audit_correlation_lookup.v1`, `core.admin_redact_audit_field.v1`, `core.phase2_dispatch_outbox_events.v1`, `core.phase2_archive_dispatched_events.v1`, `core.admin_update_config_value.v1`, `core.admin_set_feature_flag.v1` (7 of 13 contracts)
**Affected Section:** §B4 (rate limits), §B5 (dedup window), §B6 (dispatch/archive keys), §B8 (change reason/dedup), §B9 (flag change reason/dedup) — any location with a `[PA-E1]` marker

**Explanation:**

18 `core.system_configuration.core.*` POLICY keys are referenced across 7 contracts and are absent from the Doc-3 §12.2 POLICY key inventory. This is the PA-M3 finding carried from Pass-A, unresolved pending an upstream Doc-3 §12.2 additive patch. The document correctly tracks this and marks all unregistered keys with `[PA-E1]`.

Doc-4A §18.2 is unambiguous: a POLICY key "MUST exist in Doc-3 §12.2." An AI coding agent or engineer implementing any of the 7 affected contracts will encounter validation rules referencing keys that do not exist in their authoritative source. The `core.config_value_query.v1` V8 rule explicitly states "an unknown key is a contract gap (escalate §18.2)" — at implementation time, all `core.*` keys are currently "unknown."

This is not an in-document design defect. The contracts are structurally correct. The blocker is the absence of upstream registration.

**Required Resolution:** Issue an additive Doc-3 §12.2 patch registering the `core.*` POLICY key block (18 keys across the audit, outbox, config, and flag domains). After the patch, issue a Doc-4B conformance update removing `[PA-E1]` from the registered keys and updating their documentation to cite the registered Doc-3 §12.2 entries. No contract behavioral redesign is required.

---

### PB-M01 — MAJOR

**Finding ID:** PB-M01
**Severity:** MAJOR
**Affected Contract:** `core.admin_update_config_value.v1`
**Affected Sections:** §B8 Request Contract note; §B8 Response Contract (`formula_version_bumped`); §B8 Events Produced; §B11 O-5

**Explanation:**

The Request Contract note states: "trigger the Trust module's formula_version increment … through the integration single-authorship channel **(domain event or service call)** declared in Doc-4G/Doc-4E per Doc-4A §4."

"Domain event or service call" leaves the trigger mechanism undecided. These are not equivalent:

| Mechanism | Transaction boundary | `formula_version_bumped` semantics | Consistent with `Events-Produced: none`? |
|---|---|---|---|
| Domain event (Module 0 coins event → outbox → Trust consumer) | Async — event in outbox; Trust processes later | "trigger queued in outbox" | **NO — Module 0 coins an event; contradicts `Events-Produced: none`** |
| Synchronous service call (Module 0 → Trust within Phase-1 tx) | Sync — Trust call inside the config-write transaction | "Trust confirmed the increment" | Yes |
| Async service call / queue | Async — trigger sent; Trust processes independently | "trigger sent" (not confirmed) | Yes |

The contradiction with `Events-Produced: none` ("Doc-4B coins no event") eliminates the domain-event path. The mechanism must be a service call. But "domain event or service call" still leaves an AI coding agent with an ambiguous choice — they may attempt to coin an event, conflicting with `Events-Produced: none`, or implement a synchronous cross-module call without knowing whether it is in-transaction or deferred.

Separately, `formula_version_bumped : boolean : conditional` in the Response Contract has different implementation semantics depending on the resolved mechanism:
- Synchronous call: `true` means Trust returned success (increment confirmed in the same transaction)
- Asynchronous trigger: `true` means trigger was sent (increment will occur, not confirmed yet)

An AI agent cannot implement the response field correctly without knowing which semantics apply.

**Required Resolution (Freeze Patch FP-01):**

In `core.admin_update_config_value.v1`, in the Request Contract note:
1. Remove "domain event or" from "the integration single-authorship channel (domain event or service call)" — leaving: "through an internal service call to the Trust module (the receiving service contract is authored in Doc-4G as a Module 0 → Trust dependency; `formula_version_bumped: true` indicates the call was dispatched within this contract's Phase-1 execution)."
2. Update `formula_version_bumped` definition to explicitly state: "true if Module 0 determined this change triggered a formula_version increment AND the trigger was dispatched (via the §4 integration channel to Trust — see Doc-4G); absent when the key is not scoring-relevant."
3. Update O-5 (§B11) to replace "triggers a Trust formula_version increment service-side via the §4 integration channel (Doc-4G/Doc-4E)" with the resolved mechanism phrase.

The Trust-side contract (what Trust exposes to Module 0) is authored in Doc-4G — Doc-4B does not define it here. Doc-4B only needs to commit to invoking it.

---

### PB-m01 — MINOR

**Finding ID:** PB-m01
**Severity:** MINOR
**Affected Contracts:** `core.admin_update_config_value.v1` (§B8); `core.admin_set_feature_flag.v1` (§B9)
**Affected Section:** Required Permissions block of each contract

**Explanation:**

Template 21.6 Admin requires `Compliance-Basis` in the Required Permissions block (Doc-4A §5.6). The three audit Admin contracts carry it correctly:
- `core.audit_record_query.v1`: `Compliance-Basis: Doc-2 §9 (audit trail) / Master Architecture §14…` ✓
- `core.audit_correlation_lookup.v1`: same ✓
- `core.admin_redact_audit_field.v1`: `Compliance-Basis: Master Architecture §14.3 / Doc-2 §9…` ✓

The two remaining Admin contracts omit the field:
- `core.admin_update_config_value.v1`: no `Compliance-Basis` field ✗
- `core.admin_set_feature_flag.v1`: no `Compliance-Basis` field ✗

An AI agent implementing these contracts against the Doc-4A §21 template checklist will detect the gap and may either refuse to proceed or invent a Compliance-Basis value.

**Required Resolution (Freeze Patch FP-02):**

In each contract's Required Permissions block, immediately after `Admin-Scope: platform-wide`, add:

For `core.admin_update_config_value.v1`:
```
Compliance-Basis: Doc-2 §9 (system_configuration change) / Master Architecture §17.1 (platform administrative authority), by pointer — platform operational administration, not per-tenant compliance basis
```

For `core.admin_set_feature_flag.v1`:
```
Compliance-Basis: Doc-2 §9 (feature flag change) / Master Architecture §17.1 (platform administrative authority), by pointer — platform operational administration, not per-tenant compliance basis
```

No behavioral change. Editorial template completeness only.

---

### PB-m02 — MINOR

**Finding ID:** PB-m02
**Severity:** MINOR
**Affected Contract:** `core.admin_redact_audit_field.v1`
**Affected Section:** §B5 Idempotency block (prose note)

**Explanation:**

The Idempotency prose note on `core.admin_redact_audit_field.v1` states:

> "Replay safety — §14.3 joint rule: a replay within the window returns the original redaction result; **no second redaction, no duplicate redaction audit record, no duplicate outbox event.**"

The contract declares `Events-Produced: none`. There is no outbox event for this contract. The §14.3 joint rule includes an outbox-event clause that is not applicable here. The note applies the clause verbatim without qualifying that the outbox-event leg is N/A.

An AI agent reading this note will reasonably infer that the redaction contract produces an outbox event that must be deduplicated — triggering implementation of an outbox write that should not exist. Deduplication logic may be written for a non-existent event, or the engineer may question whether `Events-Produced: none` is an error.

**Required Resolution (Freeze Patch FP-03):**

In `core.admin_redact_audit_field.v1`, Idempotency block, replace the prose note with:

> "Replay safety — §14.3 joint rule (audit-record leg only): a replay within the window returns the original redaction result; no second redaction, no duplicate redaction audit record. (`Events-Produced: none` — the §14.3 outbox-event leg is not applicable to this contract.)"

No behavioral change. Prevents an AI agent from implementing a phantom outbox write.

---

### PB-n01 — NITPICK

**Finding ID:** PB-n01
**Severity:** NITPICK
**Affected Contracts:** `core.audit_record_query.v1` (§B4); `core.admin_redact_audit_field.v1` (§B5)

**Explanation:**

`core.audit_record_query.v1` uses `core_audit_not_found` for NOT_FOUND. `core.admin_redact_audit_field.v1` uses `core_audit_record_not_found` for NOT_FOUND. Both conditions represent a `core.audit_records` row not found. The distinct code names prevent uniform error-handling across the two contracts that operate on the same entity.

**Recommended Resolution:** Harmonize to `core_audit_record_not_found` for both. The query context (zero results) and the redact context (specific target not found) are conceptually equivalent — both signal "the queried audit record does not exist."

---

### PB-n02 — NITPICK

**Finding ID:** PB-n02
**Severity:** NITPICK
**Affected Section:** §B0 "Conforms To" header field; also present in `Doc-4B_PassA_Consistency_Patch_v1.0.2.md` §4 reconciliation table

**Explanation:**

Pass-B header states: "Doc-2 v1.0.3 (base `…v1.0.2.md` + Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3)". The file `Doc2_Patch_v1.0.2` does not exist in the project. `Doc-2_Patch_v1.0.3.md` itself states it applies to v1.0.2 directly, producing v1.0.3 — no intermediate v1.0.2 patch. The ghost reference originated in the Consistency Patch reconciliation table and propagated to Pass-B.

**Recommended Resolution:** In the Conforms To header, correct the Doc-2 composition string to: "Doc-2 v1.0.3 (base `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`)".

---

### PB-n03 — NITPICK

**Finding ID:** PB-n03
**Severity:** NITPICK
**Affected Section:** §B11 O-5

**Explanation:**

O-5 states: "triggers a Trust `formula_version` increment **service-side** via the §4 integration channel (Doc-4G/Doc-4E)." The word "service-side" is ambiguous: it could mean "determined by the service layer" (as opposed to caller-supplied — the PA-B01 fix) or "executed via a service call." After PB-M01 is resolved by Freeze Patch FP-01, this phrasing should be updated to use the resolved mechanism language (synchronous internal service call, or async trigger, whichever FP-01 specifies) so O-5 is consistent with the contract declaration.

**Recommended Resolution:** After FP-01 is applied to the contract, update O-5 to match the resolved mechanism phrase so operational and contract descriptions are identical.

---

## §R5 — Final Decision and Required Freeze Actions

### Decision: APPROVE WITH FREEZE PATCH

Doc-4B Pass-B is correct in architecture, complete in contract inventory, internally consistent, and clean on module boundaries. It demonstrates Pass-4/5 maturity: operational hardening (§B11), cross-reference index (§B12), AI-agent execution safety markers, and full elimination of Pass-A in-document findings. The governance/upstream dependencies are properly tracked and not resolved by invention.

The document CANNOT be declared FROZEN in its current form because of the BLOCKER (PA-M3 upstream registration) and the three freeze patches required (PB-M01, PB-m01, PB-m02). After those four actions, no further full review cycle is required.

### Required Actions Before Declaring Doc-4B FROZEN

| # | Action | Finding | Channel | Affected Contracts |
|---|---|---|---|---|
| **1** | Issue Doc-3 §12.2 additive patch registering the `core.*` POLICY key block (18 keys) + issue Doc-4B conformance update removing `[PA-E1]` from registered keys | PB-B01 / PA-M3 | Upstream Doc-3 patch — Board authorizes | 7 contracts |
| **2** | Apply Freeze Patch FP-01: clarify formula_version trigger mechanism and `formula_version_bumped` semantics in `core.admin_update_config_value.v1` | PB-M01 | Doc-4B Freeze Patch | 1 contract |
| **3** | Apply Freeze Patch FP-02: add `Compliance-Basis` to `core.admin_update_config_value.v1` and `core.admin_set_feature_flag.v1` | PB-m01 | Doc-4B Freeze Patch | 2 contracts |
| **4** | Apply Freeze Patch FP-03: correct Idempotency note on `core.admin_redact_audit_field.v1` re: outbox event clause | PB-m02 | Doc-4B Freeze Patch | 1 contract |
| **5** | Board formally records D-5 disposition (MAJOR, not a freeze blocker; confirm interim "service-role sensitive operations" binding or choose D-5 option A/B/C) | D-5 | Board decision record | Outbox workers |

NITPICKs (PB-n01, PB-n02, PB-n03) SHOULD be incorporated into Freeze Patches FP-02/FP-03 for cleanliness but are not prerequisites for declaring the document frozen.

### Contracts That May Be Declared Frozen Immediately

These 6 contract/capabilities are unaffected by all BLOCKER, MAJOR, and MINOR findings. They may be frozen now pending Board approval:

1. UUIDv7 Machine Identifier Generation (capability, no contract)
2. `core.allocate_human_reference.v1`
3. `core.config_value_query.v1`
4. `core.feature_flag_evaluate.v1`
5. `core.append_audit_record.v1`
6. `core.write_outbox_event.v1`

---

## §R6 — Mandatory Closing Answer

**Can Doc-4B be declared FROZEN and become the authoritative implementation contract layer for Module 0?**

**Not in its current form. After the four required actions, yes — without a new full review cycle.**

Doc-4B Pass-B is the most mature Module 0 contract document to date. It is architecturally clean, boundary-safe, and correctly implements the frozen corpus. The single BLOCKER (PB-B01 / PA-M3) is an upstream registration gap — not an in-document design error — requiring only an additive Doc-3 §12.2 patch. The MAJOR finding (PB-M01) requires one targeted freeze patch on one contract. The two MINORs (PB-m01, PB-m02) require targeted edits on three contracts.

None of the required actions involves architecture redesign, entity invention, boundary modification, or a re-review loop. All three freeze patches (FP-01, FP-02, FP-03) are implementable by the authoring team and verifiable against this review's prescriptive resolutions.

The Board's adjudication of D-1, D-2, D-4, and D-5 as MAJOR (not BLOCKER) means those four governance items do not gate the freeze declaration. The contracts carry explicit dependency markers and interim bindings that remain conformant.

**Recommended Board action:**

> Doc-4B Pass-B — APPROVED WITH FREEZE PATCHES.
>
> Authorize: (1) the Doc-3 §12.2 `core.*` key registration patch (Board-authorized upstream patch); (2) Freeze Patches FP-01, FP-02, FP-03 (targeted contract corrections per this review's prescriptive resolutions); (3) formal Board recording of D-5 disposition. Upon application of all four, declare Doc-4B FROZEN as the authoritative implementation contract layer for Module 0 (Platform Core / Shared Kernel). Doc-4C authoring (Module 1 — Identity & Organization) may proceed in parallel with the freeze-patch cycle.

---

*End of Doc-4B — Pass-B Independent Architecture Hard Review v1.0.*
*Reviewed: 2026-06-13 | Decision: APPROVE WITH FREEZE PATCH | 1 BLOCKER · 1 MAJOR · 2 MINOR · 3 NITPICK*
*BLOCKER (PB-B01/PA-M3): upstream Doc-3 §12.2 registration — 7 contracts gated.*
*MAJOR (PB-M01): formula_version trigger mechanism ambiguity — 1 contract, targeted freeze patch.*
*MINOR (PB-m01): missing Compliance-Basis — 2 contracts. MINOR (PB-m02): phantom outbox-event in idempotency note — 1 contract.*
*D-1, D-2, D-4, D-5 adjudicated MAJOR / NOT FREEZE BLOCKER. PA-M3 adjudicated BLOCKER.*
