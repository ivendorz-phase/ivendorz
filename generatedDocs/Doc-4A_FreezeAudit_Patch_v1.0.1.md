# Doc-4A — Freeze Audit Patch v1.0.1

| Field | Value |
|---|---|
| Patch ID | Doc-4A-FreezeAudit-Patch-v1.0.1 |
| Applies To | Doc-4A_Content_v1.0_Pass5.md; Doc-4A_Content_v1.0_Pass6.md |
| Patch Authority | Doc-4A_Freeze_Readiness_Audit_v1.0.md — Findings B-01, M-01, M-02, M-03, M-04, m-01, m-02 |
| Patch Type | Freeze readiness — corrective only; no architecture, no new content, no redesign |
| Corpus Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A Passes 1–6 → This Patch |
| Status | **DOC-4A FREEZE CANDIDATE — FINAL PATCH** |

---

## §1 — Patch Authority

This patch is issued by the iVendorz Architecture Board upon completion of the Freeze Readiness Consistency Audit (`Doc-4A_Freeze_Readiness_Audit_v1.0.md`). It resolves all seven audit findings (1 BLOCKER, 4 MAJOR, 2 MINOR) as a single cohesive corrective patch.

No finding in this patch represents an architectural decision. Every correction either:

- Resolves a self-referential contradiction within the Doc-4A corpus, or
- Aligns ambiguous notation with the normative intent already expressed in the corpus.

All frozen upstream documents (Architecture, ADRs, Doc-2, Doc-3) are unaffected.

---

## §2 — Scope Statement

This patch modifies the following locations only:

| File | Sections Modified |
|---|---|
| `Doc-4A_Content_v1.0_Pass6.md` | §22.1 C-05/P6-B01 mandate (carve-out addition); §22.3 (Rule R-07 addition); Annexure B §B.4 (format string); Annexure C §C.3 (heading and description); Annexure E §E.1 (organization_id row restructure) |
| `Doc-4A_Content_v1.0_Pass5.md` | §18B.2 grammar block; Template 21.1 Operating Stage block; Appendix A CHK-151 amendment |

No other section in either document is modified.

---

## §3 — Patch Entries

---

### PATCH-FA-01 — Resolve B-01: Template 21.5 carve-out from C-05/P6-B01 reference_id mandate

**Finding Reference:** B-01

**Affected Section:** `Doc-4A_Content_v1.0_Pass6.md` — §22.1, Correction C-05 / P6-B01 mandate block

**Issue:**

The P6-B01 mandate states: *"This line is binding on all contracts authored against Templates 21.1 through 21.6. Its absence from a contract's Response Contract is a conformance failure."* Template 21.5 declares `Response: none` (no synchronous response from Phase-2 workers). The mandate physically cannot be satisfied for Template 21.5 contracts: there is no Response Contract into which `reference_id` can be placed. The mandate contains no carve-out for this case.

**Correction:**

Append the following paragraph immediately after the P6-B01 mandate block's final sentence ("Its absence from a contract's Response Contract is a conformance failure."):

> **Template 21.5 carve-out:** Phase-2 System-actor contracts (Template 21.5) produce no synchronous response and therefore have no Response Contract block. These contracts are exempt from the `reference_id` Response Contract binding. The audit-traceability obligation is fully satisfied for Template 21.5 contracts by the mandatory Audit Requirements block (`Audit-Required: yes`, `Correlation: phase2-origin`) and the Phase-2 execution's own `reference_id` in the audit record (§17.2, Annexure E §E.3). No `reference_id` field appears in a Template 21.5 Response Contract. CHK-233 and CHK-235 apply to all Template 21.1 mandatory fields; the Template 21.5 `Response Contract [OMIT]` annotation satisfies CHK-233 in the context of this carve-out.

**Modified text (complete C-05/P6-B01 block after patch — additions in context):**

```
**Correction C-05 — "reference_id" field consistent presence**

The `reference_id` field appears in both the error envelope (§12.1) and audit requirements
(§17.2). Normalized: `reference_id` is a platform-assigned UUID (UUIDv7) present in **every**
contract response — success and error — generated at request acceptance. It is the primary
linkage between the API response, the audit record, and the idempotency key. Contracts MUST
NOT use a caller-supplied value as the `reference_id`.

**Response Contract mandate (P6-B01):** Every contract's Response Contract block (Template 21.1
§Response Contract) MUST include the following line as a mandatory field, regardless of actor
type, operation type, or response shape:

    reference_id : uuid : always : platform-assigned UUIDv7; generated at request acceptance;
                                   links response to audit record and idempotency key

This line is binding on all contracts authored against Templates 21.1 through 21.6. Its absence
from a contract's Response Contract is a conformance failure.

**Template 21.5 carve-out (FreezeAudit Patch v1.0.1, PATCH-FA-01):** Phase-2 System-actor
contracts (Template 21.5) produce no synchronous response and therefore have no Response
Contract block. These contracts are exempt from the `reference_id` Response Contract binding.
The audit-traceability obligation is fully satisfied for Template 21.5 contracts by the mandatory
Audit Requirements block (`Audit-Required: yes`, `Correlation: phase2-origin`) and the Phase-2
execution's own `reference_id` in the audit record (§17.2, Annexure E §E.3). No `reference_id`
field appears in a Template 21.5 Response Contract. CHK-233 and CHK-235 apply to all Template
21.1 mandatory fields; the Template 21.5 `Response Contract [OMIT]` annotation satisfies
CHK-233 in the context of this carve-out.
```

**Rationale:**

Template 21.5 represents a structurally distinct contract type — the Phase-2 worker — which has no synchronous caller and produces no API response. Audit traceability for these contracts is fully preserved through the mandatory `Correlation: phase2-origin` Audit Requirements block, which populates `reference_id` in the audit record (§17.2, Annexure E §E.3). The carve-out does not reduce auditability; it resolves an irreconcilable contradiction between two normative statements in the same pass without changing any architectural rule, template structure, or audit obligation.

---

### PATCH-FA-02 — Resolve M-01: Stage-Availability grammar notation ambiguity

**Finding Reference:** M-01

**Affected Sections:**
- `Doc-4A_Content_v1.0_Pass5.md` — §18B.2 grammar block
- `Doc-4A_Content_v1.0_Pass5.md` — Template 21.1, Operating Stage block

**Issue:**

The grammar line `Stage-Availability: all | stage_a | stage_b | stage_c | stage_b | stage_c` uses the pipe character (`|`) simultaneously as a grammar-level alternation separator and as a literal character within the compound value `stage_b | stage_c`. A grammar processor reading this line sees six pipe-delimited tokens with two apparent duplicates. The compound declaration `stage_b | stage_c` cannot be distinguished from two repeated individual entries using the grammar notation alone.

**Correction — §18B.2 grammar block:**

Replace:
```
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b | stage_c
Stage-Behavior:     core.system_configuration.<key> | none
```

With:
```
Stage-Availability: <stage-value>
  Valid values for <stage-value>:
    all               — available at all operating stages (default; no declaration needed)
    stage_a           — available at Stage A only
    stage_b           — available at Stage B only
    stage_c           — available at Stage C only
    stage_b | stage_c — available at Stage B and Stage C; NOT available at Stage A
                        (write the compound string verbatim, including the pipe and spaces)
Stage-Behavior:     core.system_configuration.<key> | none
```

**Correction — Template 21.1, Operating Stage block:**

Replace:
```
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b | stage_c
Stage-Behavior:     core.system_configuration.<stage_behavior_key> | none
```

With:
```
Stage-Availability: <stage-value>
  [Valid values: all | stage_a | stage_b | stage_c | "stage_b | stage_c"]
  [See §18B.2 for compound-value grammar — write "stage_b | stage_c" verbatim for B+C availability]
Stage-Behavior:     core.system_configuration.<stage_behavior_key> | none
```

**Rationale:**

The correction does not change any valid Stage-Availability declaration. All five valid values (`all`, `stage_a`, `stage_b`, `stage_c`, and the compound `stage_b | stage_c`) are preserved. The only change is notation: the expanded grammar block in §18B.2 uses an indented enumerated list that unambiguously separates the five valid values and identifies the compound value as a literal string. The Template 21.1 annotation uses bracketed inline notes to guide AI agents without altering the field grammar. No conforming contract authored before this patch requires modification.

---

### PATCH-FA-03 — Resolve M-02: Annexure C §C.3 heading mislabels STATE as "Business Rule Violation"

**Finding Reference:** M-02

**Affected Section:** `Doc-4A_Content_v1.0_Pass6.md` — Annexure C §C.3

**Issue:**

The section heading reads "C.3 — Business Rule Violation." The example describes and demonstrates a `STATE` error: "A quote submission is rejected because the RFQ is no longer in a state that accepts quotes." `STATE` (state-machine precondition failure) and `BUSINESS` (business rule violation) are distinct error classes in the §12.2 closed set. The mislabeling causes AI agents to associate "business rule violation" scenarios with `error_class: "STATE"`, producing systematic error class misclassification.

**Correction:**

Replace the §C.3 heading and its opening description line:

Before:
```
### C.3 — Business Rule Violation

A quote submission is rejected because the RFQ is no longer in a state that accepts quotes.
```

After:
```
### C.3 — State Precondition Failure

A quote submission is rejected because the RFQ is no longer in a state that accepts quotes.
This is a STATE error: the entity exists, is accessible, and the request is structurally valid —
but the entity's current lifecycle state does not permit the requested operation.
```

The JSON payload in §C.3 is unchanged.

**Rationale:**

The example JSON is correct (`"error_class": "STATE"`). Only the heading and explanatory sentence require correction. The corrected heading and description accurately characterize the STATE class as a lifecycle-state precondition failure, which is the intended instructional content of this reference example. The existing note below the JSON (*"STATE errors do not include `field_errors`"*) is preserved without modification.

---

### PATCH-FA-04 — Resolve M-03: Annexure B §B.4 error code format string

**Finding Reference:** M-03

**Affected Section:** `Doc-4A_Content_v1.0_Pass6.md` — Annexure B §B.4

**Issue:**

Annexure B §B.4 states: *"Error codes follow the format `<prefix><domain>_<code>`."* This format string omits the underscore separator between `<prefix>` and `<domain>`. The authoritative format in Pass 5 Appendix B §B.2 (FROZEN normative) is `<module_prefix>_<domain>_<code>`. All actual examples in §B.4 and throughout the corpus follow the §B.2 three-segment underscore-separated format. The §B.4 format string contradicts both §B.2 and its own examples.

**Correction:**

In the opening sentence of §B.4, replace:

Before:
```
Error codes follow the format `<prefix><domain>_<code>`. See Appendix B §B.2 for the full prefix table.
```

After:
```
Error codes follow the format `<module_prefix>_<domain>_<code>`. See Appendix B §B.2 for the full prefix table and registered module prefix values.
```

The §B.4 table of examples and all other §B.4 content are unchanged.

**Rationale:**

This is a transcription error in the §B.4 format string. The correction aligns §B.4 with the frozen normative definition in Appendix B §B.2 (`<module_prefix>_<domain>_<code>`). No example, table, or behavioral rule is changed. The clarified cross-reference to "registered module prefix values" in §B.2 is additive and aids AI agents locating the authoritative prefix table.

---

### PATCH-FA-05 — Resolve M-04: CHK-151 terminology amendment

**Finding Reference:** M-04

**Affected Section:** `Doc-4A_Content_v1.0_Pass5.md` — Appendix A, CHK-151 row

**Issue:**

CHK-151 in Appendix A reads: *"Unsafe operations declare `Idempotency: required`"*. Pass 6 §22.1 C-01 normatively states: *"CHK-151 reads: 'Mutating operations declare `Idempotency: required`.'"* and *"Where a correction conflicts with any prior pass text on the specific term or pattern, this section governs."* The CHK-151 row text was never updated to reflect the C-01 normalization. Conformance tools reading CHK-151 verbatim apply the "unsafe operations" test rather than the "mutating operations" test that C-01 mandates. "Unsafe" is an HTTP-protocol concept explicitly barred by §2 (implementation-neutral); "mutating" is the Doc-4A-native concept.

**Correction:**

Issue a patch-level amendment to CHK-151. The amended criterion supersedes the existing CHK-151 row text.

**CHK-151 amended criterion (FreezeAudit Patch v1.0.1, PATCH-FA-05):**

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-151 | Mutating operations (creates, updates, soft-deletes, or state-transitions an entity) declare `Idempotency: required` | §14.1 as amended by Pass 6 §22.1 C-01 | B |

This row replaces the prior CHK-151 row in Appendix A. The criterion text, source citation, and severity are updated; the CHK number is unchanged.

**Note:** The Template 21.1 Idempotency annotation `[OR for unsafe operations:]` is separately covered by Pass 6 §22.1 C-01's scope clause: *"All template annotations referencing 'unsafe operations' are interpreted as 'mutating operations.'"* That annotation does not require independent text modification; C-01's scope clause governs.

**Rationale:**

C-01 already declared the normative intent. This patch makes the CHK-151 row text match that intent, eliminating the two-source conflict. The underlying architectural meaning is unchanged: operations that write, create, or transition state must declare an idempotency model. Only the terminology is updated from an HTTP-protocol concept to the Doc-4A-native concept.

---

### PATCH-FA-06 — Resolve m-01: Template 21.1 Events Consumed vs Template 21.2 selection boundary

**Finding Reference:** m-01

**Affected Section:** `Doc-4A_Content_v1.0_Pass6.md` — §22.3, following Rule R-01

**Issue:**

Rule R-01 step 5 ("Is the contract an event-driven integration between two modules? → Template 21.2") and Template 21.1's Events Consumed section (`[CONDITIONAL — Integration contracts in source module document only]`) describe overlapping paths for a module that processes an event produced by another module. No decision criterion distinguishes: (a) a contract whose entire purpose is to subscribe to and process an event (→ Template 21.2), from (b) an endpoint contract with a synchronous request path that also declares event subscriptions as a secondary concern (→ Template 21.1 with Events Consumed). AI agents cannot reliably select between the two forms without an explicit rule.

**Correction:**

Add Rule R-07 immediately after Rule R-06 in §22.3:

```
**Rule R-07 — Template 21.1 Events Consumed vs Template 21.2 (Integration) boundary**

Use these criteria to distinguish:

- Use **Template 21.2** (Integration Contract) when the contract's primary and sole purpose is to
  declare that this module subscribes to and processes an event produced by another module. The
  contract has no synchronous request contract; the triggering event payload IS the input.
  Template 21.2 is authored once by the source (consuming) module. The producing module does not
  restate it.

- Use **Template 21.1 with an Events Consumed section** when the contract is a regular endpoint
  contract with a synchronous request contract that ALSO subscribes to events as a secondary
  concern (for example: an endpoint that both accepts user commands AND reacts to a lifecycle
  event to refresh a denormalized aggregate). The Events Consumed section in Template 21.1 is
  `[CONDITIONAL — Integration contracts in source module document only]`: it is included only in
  contracts where event subscription is part of the contract's declared behavior.

- Use **Template 21.5** when the actor is System and the contract is triggered by an event
  (Rule R-01 step 3). Template 21.5 is specifically for Phase-2 async workers triggered by an
  event in the outbox. It is not an alternative to Template 21.2 for inter-module subscriptions.

If a contract appears to satisfy both Template 21.2 and Template 21.5 criteria: Template 21.5
governs when the actor is always System and the event is a Phase-2 work-trigger published to the
outbox by a Phase-1 command. Template 21.2 governs when the consumer module subscribes to an
event published by a different module for cross-module integration purposes.
```

**Rationale:**

This rule does not introduce new templates, new template types, or new selection criteria beyond what is already implied by the existing template annotations and the §4.4 integration single-authorship rule. It makes the selection boundary explicit and machine-readable for AI agents. No contract already authored in conformance with Doc-4A is affected.

---

### PATCH-FA-07 — Resolve m-02: Annexure E §E.1 organization_id conditional qualifier placement

**Finding Reference:** m-02

**Affected Section:** `Doc-4A_Content_v1.0_Pass6.md` — Annexure E §E.1 Required Audit Fields table

**Issue:**

The `organization_id` row has:

| Field | Required for all actors | Population rule |
|---|---|---|
| `organization_id` | yes (except System actor for platform ops) | Organization in whose context the action occurred |

The conditional exception is embedded within the "Required for all actors" cell alongside the "yes" value. The table has no dedicated "Conditional" column; however, placing a behavioral qualification inside a boolean-style "yes/no" cell causes the exception to be invisible to parsers reading the Required column as a simple boolean. An AI agent generating audit metadata will read "yes" and emit `organization_id` unconditionally, missing the System-actor exemption.

**Correction:**

Replace the `organization_id` table row:

Before:
```
| `organization_id` | yes (except System actor for platform ops) | Organization in whose context the action occurred |
```

After:
```
| `organization_id` | conditional | Required unless the actor is System performing a platform-level operation with no organization context (e.g., Template 21.5 platform-scoped Phase-2 workers). Required for all User, Admin, and AI Agent actors unconditionally. |
```

All other rows in the §E.1 table are unchanged.

**Rationale:**

The behavioral rule is unchanged. The System-actor exemption was already stated; this patch moves it to the Population rule cell where conditional logic belongs and changes the Required cell from a qualified "yes" to an explicit "conditional." This ensures AI agents generating audit schemas read the exemption as a decision condition rather than a parenthetical exception on a boolean.

---

## §4 — Impact Analysis

### 4.1 Architecture Integrity

| Architecture invariant | Affected? | Assessment |
|---|---|---|
| One Entity = One Owner | No | No entity ownership or module assignment touched |
| Integration Single Authorship (§4.4) | No | PATCH-FA-06 clarifies the selection rule; the single-authorship obligation is unchanged |
| No Cross-Module Mutation | No | No state machine or mutation rule touched |
| Reference-Never-Restate | No | No source-of-truth restated |
| Governance Signal Firewall | No | No signal, firewall rule, or Firewall-Compliance declaration touched |
| Delegation Attribution | No | No delegation rule touched |
| Tenant Isolation / Non-Disclosure (§7.5) | No | No tenancy or non-disclosure rule touched |
| UUIDv7 Authority | No | No identifier rule touched |
| State Machine Authority (Doc-2) | No | No transition, pre-state, or post-state touched |
| Workflow Authority (Doc-3) | No | No workflow definition touched |
| FIXED / POLICY / ORG trichotomy | No | No policy key, fixed rule, or org setting touched |
| Phase-2 Audit Traceability | No | PATCH-FA-01 carve-out preserves phase2-origin Correlation requirement — audit record obligation is unchanged |

### 4.2 Conformance Checklist Impact

| CHK | Change | Effect |
|---|---|---|
| CHK-151 | Criterion text amended (PATCH-FA-05) | Conformance test now checks for "mutating operations" rather than "unsafe operations" — aligned with C-01 intent; no previously conforming contract is newly nonconforming |
| All other CHK items | Unchanged | No conformance criteria added, removed, or relaxed |

The CHK-231 through CHK-236 template conformance checks (Pass 6 §22.2) are not affected. PATCH-FA-01 adds an explicit statement that the Template 21.5 `Response Contract [OMIT]` annotation satisfies CHK-233 under the carve-out — no new check is required.

### 4.3 Template Impact

| Template | Change | Assessment |
|---|---|---|
| Template 21.1 | Operating Stage grammar notation updated (PATCH-FA-02) — no field added, removed, or made required/optional | Backward compatible; all valid Stage-Availability values unchanged |
| Template 21.5 | No template modification; carve-out added to §22.1 C-05 prose (PATCH-FA-01) | Template 21.5 contract structure unchanged; `Response Contract [OMIT]` is now explicitly authorized |
| Templates 21.2, 21.3, 21.4, 21.6 | No modification | Unaffected |

### 4.4 Downstream Impact on Doc-4B–4N

| Impact area | Assessment |
|---|---|
| Contracts already authored using Template 21.5 | PATCH-FA-01 carve-out means these contracts are now explicitly conforming; previously they were in an ambiguous state. No contract modification required. |
| Contracts using Stage-Availability `all`, `stage_a`, `stage_b`, `stage_c` | PATCH-FA-02 grammar change is backward compatible; these single-value declarations remain valid and unchanged. |
| Contracts using Stage-Availability `stage_b \| stage_c` | PATCH-FA-02 clarifies the compound string; these declarations were already correct and remain valid. |
| Contracts with CHK-151 conformance checks | The amended CHK-151 criterion (PATCH-FA-05) may cause a conformance tool to recheck contracts that declare idempotency for operations previously classified as "unsafe." Any contract correctly declaring `Idempotency: required` for a mutating operation is unaffected. |
| AI agents authoring new contracts (Doc-4B–4N) | PATCH-FA-06 Rule R-07 reduces template selection ambiguity; existing correctly-authored integration contracts are unaffected. |

### 4.5 Backward Compatibility Summary

All seven patches are backward compatible. No conforming contract authored against Doc-4A (any pass) requires modification as a result of this patch. The corrections resolve internal contradiction and notation ambiguity without changing any architectural rule, behavioral obligation, or valid contract form.

---

## §5 — Self-Review

*All findings classified BLOCKER / MAJOR / MINOR. All BLOCKER and MAJOR resolved before this output.*

### BLOCKER Findings

None identified.

### MAJOR Findings

None identified. All four MAJOR audit findings (M-01 through M-04) are addressed by PATCH-FA-02 through PATCH-FA-05 respectively. Each patch is narrowly scoped to the finding's stated corrective action. Review confirmed no patch introduces architecture, entity, workflow, ownership, state machine, permission, or event changes.

### MINOR Findings

None identified.

### Self-Review Checklist

| Criterion | Result |
|---|---|
| No architectural changes introduced | PASS — No architecture rule modified; no ADR overridden |
| No workflow changes introduced | PASS — No Doc-3 workflow definition touched |
| No ownership changes introduced | PASS — No module ownership or entity ownership modified |
| No state machine changes introduced | PASS — No Doc-2 state machine touched |
| No new entities introduced | PASS — No entity coined or renamed |
| No new permissions introduced | PASS — No permission slug coined |
| No new events introduced | PASS — No event defined or renamed |
| All audit findings addressed | PASS — B-01, M-01, M-02, M-03, M-04, m-01, m-02 all resolved |
| All corrections backward compatible | PASS — No conforming existing contract requires modification |
| Template 21.5 structure preserved | PASS — `Response Contract [OMIT]` remains; audit obligations unchanged |
| CHK-151 semantics preserved | PASS — Criterion meaning unchanged; terminology aligned with §2 |
| Reference_id audit traceability preserved | PASS — Phase-2 audit record with phase2-origin satisfies traceability obligation for Template 21.5 |

---

## §6 — Freeze Readiness Statement

Upon application of all seven patches in this document, the Architecture Board finds that:

1. The sole BLOCKER finding (B-01) is resolved by PATCH-FA-01. Template 21.5 Phase-2 worker contracts are explicitly exempt from the Response Contract `reference_id` binding; audit traceability is satisfied through the mandatory `Correlation: phase2-origin` Audit Requirements block.

2. All four MAJOR findings (M-01 through M-04) are resolved by PATCH-FA-02 through PATCH-FA-05. Stage-Availability grammar is unambiguous; error reference example §C.3 is correctly labeled; error code format string in §B.4 matches the normative §B.2 definition; CHK-151 criterion text matches the C-01 normalization.

3. Both MINOR findings (m-01 and m-02) are resolved by PATCH-FA-06 and PATCH-FA-07. Template selection for event-driven contracts is explicitly rule-governed; the audit metadata table organization_id condition is structurally correct.

**The Architecture Board declares:**

> **Doc-4A is FROZEN as of the application of this patch.**
>
> No Pass-7 or additional content pass is required.
>
> Doc-4B through Doc-4N module documents may now be authored against the frozen Doc-4A corpus.
>
> Any future change to Doc-4A requires a formal patch document following the Doc-4A patch governance process.

---

*Doc-4A FreezeAudit Patch v1.0.1 — 0 BLOCKER, 0 MAJOR, 0 MINOR. All 7 audit findings resolved. Status: **DOC-4A FROZEN**.*
