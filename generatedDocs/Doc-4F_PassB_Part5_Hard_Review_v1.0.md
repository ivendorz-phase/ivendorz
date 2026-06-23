# Doc-4F_PassB_Part5_Hard_Review_v1.0
# Independent Architecture Board Hard Review — BC-OPS-5 Finance Records

| Field | Value |
|---|---|
| Document Under Review | `Doc-4F_PassB_Part5_BC-OPS-5_Finance_Records_v1.0.md` |
| Review Pass | Pass-B Part 5 Hard Review |
| Review Date | 2026-06-18 |
| Reviewers | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Governance Auditor |
| Posture | Adversarial — assume defects exist; attempt to break the document |
| Authority | Frozen corpus only: Architecture v1.0, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F Structure FROZEN, Pass-A FROZEN, Parts 1–4 FROZEN |

---

## Executive Summary

BC-OPS-5 is the leanest bounded context in Module 4: one aggregate, no state machine, no events consumed or emitted, two contracts. The document is structurally tight. No BLOCKER found. Two MAJOR defects. Three MINOR defects. One NITPICK.

**MAJOR defects:** (1) §F8.1 Error Register marks `SYSTEM` as `retryable: false` — Doc-4A §12 closed class set defines `SYSTEM` as retryable: true. This is a direct error-model violation against frozen corpus. (2) §F8.1 stage-8 BUSINESS row asserts `record_type` is "immutable post-create" but the Validation Matrix provides no explicit guard mechanism — the rule is stated in prose but no failure-routing exists for an attempted `record_type` mutation at update; the Validation Matrix does not distinguish which fields are update-mutable vs. immutable at the schema level.

**MINOR defects:** (1) §F8.1 stage-6 concurrency sub-check is correctly split (FROZEN Part-3/4 precedent followed) but the state row for no-state-machine is stated twice in two formats that are potentially contradictory. (2) §F8.2 Error Register `retryable` for `SYSTEM` is also `false` — same corpus violation as MAJOR AD-01. (3) §F8.1 Response Schema omits `revision` — the optimistic-concurrency field `expected_revision` references a current revision on the record, but the Response Schema does not return it; callers cannot perform a subsequent update without reading back.

---

# Architecture Defects

## AD-01

### Severity
MAJOR

### Location
§F8.1 Error Register, `SYSTEM` row

### Issue
The Error Register `SYSTEM` row reads: `retryable: false`. Doc-4A §12 closed error class set defines `SYSTEM` as `retryable: true`. From Doc-4A §12.2: the error class groups are `{VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA}` (retryable: false) and `{CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM, RATE_LIMITED}` (retryable: true). `SYSTEM` is in the retryable-true group. Every FROZEN Part 1–4 Error Register carries `SYSTEM` with `retryable: true`. The `false` value in §F8.1 is a direct contradiction of the frozen corpus (Doc-4A §12) and established precedent across all four frozen Parts.

### Governance Impact
Doc-4A §12 closed class set. Retryability is a load-bearing contract property — implementers use it to drive retry logic. `SYSTEM` with `retryable: false` will cause agents to discard retryable failures, producing data loss on transient infrastructure faults.

### Required Fix
Change `SYSTEM` row `retryable` from `false` to `true` in §F8.1 Error Register. Cite Doc-4A §12 as authority.

---

## AD-02

### Severity
MAJOR

### Location
§F8.1 Validation Matrix stage-8 BUSINESS row; §F8.1 Request Schema

### Issue
The stage-8 BUSINESS row states: "`record_type` immutable post-create (update may not change `record_type`); structured text only (no funds, no file uploads) | `BUSINESS` (if `record_type` mutation or funds operation attempted)."

The Request Schema for update includes `finance_record_id`, `expected_revision`, and implicitly allows `period`, `amount`, `currency`, `note` as mutable fields. However, `record_type` is listed in the Request Schema as "yes (create)" — meaning it is absent from the update request schema. If `record_type` is absent from the update request schema, it cannot be mutated at the API surface — the guard is structurally enforced by field absence, not by a BUSINESS rule. In that case, the stage-8 BUSINESS row's "if `record_type` mutation … attempted" failure is a null check (the field cannot arrive in an update request if the schema excludes it).

Conversely, if implementers allow `record_type` in the update request body (the schema marks it "yes (create)" but does not explicitly list it as forbidden in update), the BUSINESS check is load-bearing and must be correctly expressed.

The document is ambiguous: the Request Schema does not explicitly list the update-mutable fields, only the create-required fields. An implementer cannot determine from the schema alone which fields are valid in an update request body versus which are silently ignored versus which are rejected with `BUSINESS`. Doc-4A §9 requires field-level clarity on Required/Nullable/Cardinality per operation. The dual-contract single-schema approach (one table for both create and update) leaves the update surface underspecified.

### Governance Impact
Doc-4A §9 field-level schema specification. AI agents reading the schema will not know whether `amount`, `currency`, `note`, `period` are all update-mutable, or whether some are immutable post-create alongside `record_type`. The BUSINESS guard in stage 8 is either a null check or a load-bearing rule — the document cannot be both simultaneously.

### Required Fix
Split the Request Schema into two sub-tables (create and update) explicitly listing which fields are valid for each operation. For the update sub-table: list `finance_record_id` (required), `expected_revision` (required), and each mutable field explicitly (with authority from Doc-2 §10.5). If `record_type` is absent from the update sub-table (i.e., structurally excluded), remove the `record_type` mutation branch from the stage-8 BUSINESS row and replace with a note: "`record_type` is not accepted in update requests (field absent from update schema — Doc-2 §10.5 immutability)." If `record_type` remains in the update sub-table as rejected, retain the BUSINESS guard. Choose one path; eliminate the ambiguity.

---

# Implementation Risks

## IR-01

### Severity
MINOR

### Location
§F8.2 Error Register, `SYSTEM` row

### Issue
Same corpus violation as AD-01. The §F8.2 Error Register `SYSTEM` row also carries `retryable: false`. Doc-4A §12: `SYSTEM` retryable: true. This is the same defect in the read-contract Error Register.

### Governance Impact
Doc-4A §12 closed class set. Same implementation impact as AD-01 for read operations.

### Required Fix
Change `SYSTEM` row `retryable` from `false` to `true` in §F8.2 Error Register. Consistent with Doc-4A §12 and all FROZEN Part 1–4 precedents.

---

## IR-02

### Severity
MINOR

### Location
§F8.1 Response Schema; §F8.1 §11 Idempotency Rules

### Issue
§F8.1 §5 Validation Matrix stage-6 concurrency sub-check requires `expected_revision` = current revision on update. This means callers must know the current `revision` value to perform an update. The Response Schema for `ops.update_finance_record.v1` returns `finance_record_id`, `record_type`, and `reference_id` — it does NOT return the `revision` (or updated `revision` value) after a successful update.

A caller who updates and then wishes to update again must perform a GET to learn the new revision. The §11 Idempotency Rules state: "a replayed update that already applied returns the same result" — but does not address whether the response includes the current revision to enable chained updates without an extra round-trip.

The Response Schema omission is a usability defect with governance implications: Doc-4A §22.1 C-05 requires `reference_id` in every response (present), but also requires that the response contract be complete enough for a caller to act deterministically. A caller who receives the update response but not the new `revision` cannot perform a subsequent update without a separate GET. This forces an implicit GET-then-update pattern that is not stated in the contract and creates ambiguity for AI-agent implementation.

### Governance Impact
Doc-4A §22.1 (response completeness). AI-agent implementation ambiguity: agent cannot determine updated revision from response, leading to non-deterministic retry/update chains.

### Required Fix
Add `revision : numeric` to the §F8.1 Response Schema for `ops.update_finance_record.v1` (and `ops.create_finance_record.v1` — callers need the initial revision to perform any subsequent update). Cite Doc-2 §10.5 or Doc-4A §14 as authority for the revision field.

---

## IR-03

### Severity
MINOR

### Location
§F8.1 Validation Matrix, stage-6 STATE row and stage-6 concurrency sub-check row

### Issue
The Validation Matrix contains two stage-6 rows:

```
| 6 STATE | Doc-2 §3.5; Doc-4A §13 | `finance_records` is simple — no state machine; `State-Machine-Effects: none` (no transition gate) | — |
| 6 STATE → concurrency sub-check | Doc-4A §14 | (update) optimistic-concurrency: `expected_revision` = current revision | `CONFLICT` |
```

The first row correctly states no state machine exists and failure outcome `—`. The second row correctly follows the FROZEN Part-3/4 P-01/P-04 precedent for the concurrency sub-check. However, the first row is marked as applying to both create and update: the parenthetical "(update)" on the concurrency row implies the STATE row also implicitly applies to both. For `create`, the concurrency sub-check does not apply (there is no `expected_revision` on create). The matrix does not clearly scope which rows apply to which operation (create vs. update). A reader or agent implementing create will encounter the concurrency sub-check row and may incorrectly apply it.

This is the same dual-contract single-matrix ambiguity noted in AD-02 — the matrix does not distinguish create from update scope at the row level.

### Governance Impact
Doc-4A §11.2 validation matrix clarity. AI-agent implementation ambiguity: create path should not enforce `expected_revision` check; the matrix does not explicitly exclude it for create.

### Required Fix
Add operation scope annotation to the concurrency sub-check row: label it "(update only)" in the Validation column, and confirm the STATE row as "(both)" or "(all operations)". Alternatively, split the Validation Matrix into create and update sub-matrices, consistent with the Request Schema split recommended in AD-02. This eliminates all dual-operation ambiguity at once.

---

## IR-04

### Severity
NITPICK

### Location
§F8.1 §13 AI-Agent Implementation Notes, validation execution order

### Issue
§F8.1 §13 states: "Validation execution order: SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION(n/a) → STATE(none)+concurrency → REFERENCE(none) → BUSINESS → POLICY(none)."

The inline "(n/a)" / "(none)" annotations embedded in the execution order string are a non-standard notation not used in FROZEN Parts 1–4. The FROZEN precedents state the canonical order plainly and reference the applicable rows; they do not annotate the order string with skip-signals. The annotation "STATE(none)+concurrency" conflates the no-state-machine fact with the concurrency check in a way that could mislead agents into thinking STATE and concurrency are co-evaluated. Per the corrected matrix rows, they are sequential (STATE row first, concurrency sub-check second). The prose in §13 is not incorrect, but the inline notation creates ambiguity inconsistent with the FROZEN Part-3/4 convention.

### Governance Impact
AI-agent implementation clarity. Low severity — no behavioral defect, but notation inconsistency with established FROZEN precedents.

### Required Fix
Replace inline annotation string with plain canonical order: "SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → STATE → REFERENCE → BUSINESS → POLICY" (matching Doc-4A §11.2 verbatim), followed by prose: "Stage 5 DELEGATION: not eligible (own-org). Stage 6 STATE: no state machine — STATE row is n/a; concurrency sub-check (update only) applies `expected_revision` assertion. Stage 7 REFERENCE: none. Stage 9 POLICY: `page_size` bound (list only)."

---

# Regression Audit

| Area | Result | Notes |
|---|---|---|
| Ownership Drift | NONE | Finance Record aggregate correctly owned by BC-OPS-5; `finance_records` only; no foreign-aggregate mutation |
| Aggregate Drift | NONE | Single aggregate; no children; no boundary crossed |
| Lifecycle Drift | NONE | `finance_records` correctly declared simple / no lifecycle; no state or transition invented |
| Event Drift | NONE | BC-OPS-5 emits zero domain events and consumes none; Doc-2 §8 / Pass-A §F8/§F11 preserved |
| Authorization Drift | NONE | `can_manage_finance_records` sole slug (Doc-2 §7); no slug invented; `[ESC-OPS-SLUG]` carried |
| Procurement Moat Drift | NONE | No RFQ/quotation/routing/ranking/award ownership; `finance_records` references no RFQ entity |
| Trust Firewall Drift | NONE | No Trust score computation or mutation; "may consume Trust outputs" correctly scoped as read-only |
| Billing Boundary | NONE | Explicit separation from `billing.platform_invoices`/subscriptions/payments (DF-6); no Billing entity referenced |
| Audit Drift | NONE | All mutations carry `[ESC-OPS-AUDIT]`; Doc-2 §9 Financial no `finance_records` action confirmed; no action invented |
| Escalation Drift | NONE | `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` carried unchanged in Appendix B |
| REFERENCE/DEPENDENCY Separation | NONE | H.4 correctly states distinction; no REFERENCE check arises in §F8.1 (org-internal); DEPENDENCY = Doc-4B transient |
| STATE/CONFLICT Separation | NONE | H.4 + H.5 correctly separate; concurrency sub-check correctly produces CONFLICT |

---

# AI-Agent Readiness

MEDIUM

The document is lean and most implementation paths are clear. Two issues reduce certainty for agent implementation:

**AD-02 (update schema underspecification):** An agent implementing `ops.update_finance_record.v1` cannot determine from the Request Schema which fields are mutable vs. immutable in the update request body. The dual-operation single-schema approach leaves the update surface ambiguous. Agent will not know whether to pass `amount`/`currency`/`note`/`period` individually or as a full body, and will not know whether to reject `record_type` at the API layer or pass it to the BUSINESS guard.

**IR-02 (missing revision in response):** An agent that creates or updates a finance record and then attempts to update again cannot chain the operations without an intervening GET. The contract does not tell the agent what revision value to use for the next update. This creates a non-deterministic multi-step pattern.

**Items correctly expressed:**
- No state machine: explicitly stated; agents will not synthesize lifecycle states.
- `record_type` immutability signaled in stage-8 BUSINESS (even if the guard mechanism needs clarification per AD-02).
- `can_manage_finance_records` sole slug; own-org scope; NOT_FOUND collapse — all clear.
- Billing separation explicitly stated in §13 AI notes and H.9.
- Trust firewall (consume-only) correctly stated.
- No events; no cross-module mutations — simple consumer surface.
- SYSTEM retryability defect (AD-01/IR-01) is a corpus violation but low operational risk for the leaner finance-records surface; still must be corrected.

---

# Final Assessment

```
BLOCKER  = 0
MAJOR    = 2
MINOR    = 3
NITPICK  = 1
```

---

# Review Decision

**APPROVED WITH PATCH REQUIRED**

BC-OPS-5 passes Hard Review subject to patch. Aggregate ownership, boundary separations, event model, audit escalation, and carried markers are all correct. Two MAJOR findings (AD-01 corpus `SYSTEM` retryability, AD-02 update schema underspecification) and three MINOR findings (IR-01–IR-03) must be resolved before freeze. One NITPICK (IR-04) resolved in the same patch pass. No BLOCKER; no corpus escalation required.

**BC-OPS-5 freeze is BLOCKED** pending patch, patch verification, and freeze audit.

---

# Approval Question

```
Can this document proceed directly to:
Doc-4F_PassB_Part5_BC-OPS-5_Finance_Records_Freeze_Audit ?

NO
```

**Justification:** Two MAJOR findings are open. AD-01 is a direct contradiction of Doc-4A §12 (SYSTEM retryability). AD-02 is a schema underspecification that creates implementation ambiguity for AI agents and backend engineers. Both must be resolved and verified before freeze. Required sequence: `Doc-4F_PassB_Part5_Patch_v1.0` → `Doc-4F_PassB_Part5_Patch_Verification_Report_v1.0` → `Doc-4F_PassB_Part5_Freeze_Audit_v1.0`.
