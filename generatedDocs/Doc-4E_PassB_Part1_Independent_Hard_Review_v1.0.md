# Doc-4E Pass-B Part 1 Independent Hard Review
**Review ID:** Doc-4E_PassB_Part1_Independent_Hard_Review_v1.0  
**Document Under Review:** Doc-4E_Content_v1.0_PassB_Part1_RFQLifecycle.md  
**Review Scope:** Pass-B Hardening — BC-1 RFQ Lifecycle (§E4.1–§E4.9)  
**Reviewer Role:** iVendorZ Architecture Board Independent Hard Reviewer  
**Review Date:** 2026-06-17  
**Review Mode:** Aggressive — Assume defects exist until proven otherwise  

---

## Corpus Authority

| Document | Version | Role |
|---|---|---|
| Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md | v1.0.2 | Primary — entity model, state machine, permission slugs |
| Doc-2_Patch_v1.0.3.md | v1.0.3 | Patch — PATCH-D2-01, PATCH-D2-02; §5.4 machine authoritative |
| Doc-4A_Architecture_Foundation_and_Contract_Standards.md | frozen | Primary — nine-stage validation, error model, idempotency, conventions |
| Doc-4E_PassA_Approved_v1.0.md | frozen | Pass-A baseline — §B conventions, §E4 BC-1 contracts |
| Doc-4E_PassA_Patch_v1.0.md | frozen | Patch chain — PATCH-4E-PA-01 through PATCH-4E-PA-19 |

**Review Authority:** Against frozen corpus only. No redesign. No invention. Flag-and-halt on any conflict.

---

## Executive Verdict

Pass-B Part 1 (BC-1 RFQ Lifecycle) is substantially well-executed. The nine-stage validation ordering is respected across all nine contracts; the state machine bindings are correct for all states including PATCH-D2-01/02 additions; permission slugs are drawn entirely from Doc-2 §7; error registers conform to the Doc-4A §12 closed class; idempotency is uniformly declared; audit/event bindings carry the correct escape markers; and AI-Agent Notes are substantive throughout.

Three defects require patch before freeze:

1. **§E4.6 cancel_rfq — Validation Matrix SYNTAX gap:** `expected_version_no` is declared required in the Request Schema but is absent from the Stage 1 SYNTAX check list. An implementer working from the Validation Matrix alone would not validate this field at intake, allowing schema-invalid payloads through to Stage 6 STATE processing. This is a field-level validation matrix incompleteness defect — the core Pass-B deliverable.

2. **§E4.9 expire_rfq — SYNTAX stage entirely missing:** The Validation Matrix contains only Stage 6 STATE and Stage 8 BUSINESS. No Stage 1 SYNTAX entry exists. Even system-triggered contracts must enumerate their intake fields at SYNTAX per H.1; the absence leaves the matrix structurally incomplete.

3. **§E4.5 moderate_rfq — Compound-path framing creates AI-agent implementation risk:** The State Machine Enforcement section describes `submitted→under_review→matching` as the "pass" path of a single moderation call. These are two distinct transitions belonging to two distinct actors (moderation system auto-advance for `submitted→under_review`; moderator action for the `cleared` edge). An AI agent implementing from this description could generate a single command that advances directly from `submitted` to `matching`, skipping the intermediate `under_review` state and violating Doc-2 §5.4.

Two NITPICKs are also recorded. The overall decision is **APPROVE WITH PATCH**.

---

## Findings

### MINOR Findings

---

**PB1-M1**  
**Severity:** MINOR  
**Location:** §E4.6 cancel_rfq — §4 Validation Matrix, Stage 1 SYNTAX  
**Description:**  
The Request Schema (§E4.6 §2) declares three required fields:
```
rfq_id       : uuid      (required)
cancellation_reason : string  (required)
expected_version_no : numeric (1, required)
```
The Validation Matrix Stage 1 SYNTAX entry lists only:
```
Stage 1 | SYNTAX | rfq_id, cancellation_reason
```
`expected_version_no` is absent from SYNTAX. This means:
- An implementer who derives field validation from the Validation Matrix (the Pass-B authoritative surface for validation logic) would not validate `expected_version_no` at intake.
- The field could be missing, malformed, or of incorrect type and pass Stage 1 silently.
- The optimistic-concurrency assertion at Stage 6 STATE would then fail with a misleading STATE error rather than a SYNTAX error, violating Doc-4A §11.2 stage semantics.

Pass-B validation matrices are the definitive field-validation specification. Every required field in the Request Schema must appear in the Stage where it is first consumed. `expected_version_no` is consumed at Stage 6 (concurrency assertion), but it must be validated for presence and type at Stage 1 SYNTAX before reaching there.

**Corpus Reference:** Doc-4A §11.2 (nine-stage validation; Stage 1 = format/type/presence of all required fields); Doc-4E_Content_v1.0_PassB_Part1 §E4.6 §2 Request Schema; §E4.6 §4 Validation Matrix Stage 1  
**Required Fix:** Add `expected_version_no` to the Stage 1 SYNTAX entry of §E4.6 Validation Matrix. Entry should read: `rfq_id (uuid, required), cancellation_reason (string, required), expected_version_no (numeric, required)`.

---

**PB1-M2**  
**Severity:** MINOR  
**Location:** §E4.9 expire_rfq — §4 Validation Matrix  
**Description:**  
The §E4.9 expire_rfq Validation Matrix contains exactly two stages:
```
Stage 6 | STATE | Verify rfq is in a state eligible for expiry ...
Stage 8 | BUSINESS | Verify validity window has elapsed ...
```
Stage 1 SYNTAX is entirely absent. The §E4.9 Request Schema (§2) declares:
```
rfq_id  : uuid  (required, internal)
trigger : enum<validity_lapse, coverage_exhausted>  (required, internal)
```
H.1 (§H.1, bound to Doc-4A §11.2) requires that all contracts, including system-triggered ones, enumerate their intake fields at Stage 1 SYNTAX. The rationale is that:
- System actors can also produce malformed payloads (programming errors, messaging system faults).
- A complete matrix documents what is validated and when — absence creates an undocumented gap.
- Downstream readers (including AI-agent code generators) have no Stage 1 entry to implement.

The absence of a SYNTAX stage is structurally inconsistent with every other contract in Part 1 and with H.1.

**Corpus Reference:** Doc-4A §11.2 (Stage 1 SYNTAX — all contracts); §H.1 (nine-stage validation, bound per contract); Doc-4E_Content_v1.0_PassB_Part1 §E4.9 §2 Request Schema; §E4.9 §4 Validation Matrix  
**Required Fix:** Add Stage 1 SYNTAX entry to §E4.9 Validation Matrix: `rfq_id (uuid, required), trigger (enum<validity_lapse|coverage_exhausted>, required)`. Place before Stage 6 STATE in the matrix ordering.

---

**PB1-M3**  
**Severity:** MINOR  
**Location:** §E4.5 moderate_rfq — §6 State Machine Enforcement  
**Description:**  
The State Machine Enforcement section for moderate_rfq states:
```
Allowed source states:
  pass:   submitted → under_review → matching
  reject: under_review → draft
```
This framing presents `submitted → under_review → matching` as a single compound path driven by the moderation pass action. However, Doc-2 §5.4 (as patched by Doc-2_Patch_v1.0.3.md) defines these as two distinct transitions:

1. `submitted ──moderation pass──▶ under_review` — driven by platform moderation system (auto-advance when `moderation.mode` is passive or configuration-directed)
2. `under_review ──cleared──▶ matching` — driven by moderator action completing review

These are separate edges with separate actors. The moderator's action source state is `under_review`; `submitted` is not a valid source for the `cleared` edge.

An AI agent or implementer reading §E4.6 State Machine Enforcement may:
- Implement a single `moderate_rfq` command handler that accepts `submitted` as a source state and advances to `matching` directly (skipping `under_review`).
- Omit the intermediate `under_review` state entirely, creating an impossible direct `submitted → matching` transition not present in Doc-2 §5.4.
- Generate a state guard that allows `submitted` as a valid input state for the clearing action.

The compound-path notation is not defined in H.5 (State Machine Enforcement conventions) and conflicts with the single-edge-per-row model implied by Doc-2 §5.4.

**Corpus Reference:** Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md §5.4 (state machine edges); Doc-2_Patch_v1.0.3.md (PATCH-D2-01 — distinct edge definitions); Doc-4A §11.2 (stage 6 STATE enforces source state); §H.5 (state machine enforcement); Doc-4E_Content_v1.0_PassB_Part1 §E4.5 §6 State Machine Enforcement  
**Required Fix:** Split the compound-path into distinct single-edge rows:
```
Action:  moderation pass
  Source state: submitted → under_review  [system auto-advance; actor: moderation system]
Action:  cleared
  Source state: under_review → matching  [actor: moderator (staff_can_moderate_rfq)]
Action:  moderation reject
  Source state: under_review → draft  [actor: moderator; PATCH-D2-01; reason: rfq_correction_required]
```
Or, if §E4.5 covers only the moderator's explicit action, the allowed source state must be `under_review` only, and the system auto-advance must be described separately (or noted as a pre-condition out of scope for this contract). The compound-path framing must be removed regardless.

---

### NITPICK Findings

---

**PB1-N1**  
**Severity:** NITPICK  
**Location:** §E4.3 submit_rfq — §4 Validation Matrix, Stage 8 BUSINESS  
**Description:**  
The Validation Matrix for submit_rfq places the check "specs reference an active doc revision" at Stage 8 BUSINESS. Per Doc-4A §11.2, Stage 7 REFERENCE is defined as the stage for external entity existence and validity checks — i.e., whether a referenced foreign entity exists and is in a valid state. A check that a `spec_document_id` references an active revision in `marketplace.spec_documents` is an entity-reference validity check (does the foreign record exist and is it active?), which maps to Stage 7 REFERENCE rather than Stage 8 BUSINESS.

Stage 8 BUSINESS is for domain rules that combine multiple validated facts (e.g., estimated_value ≥ threshold, work_nature constraints, budget policy). The spec-document active-revision check is a single-entity existence/state check, not a multi-fact domain rule.

This is a stage-placement question, not a correctness question (the check is present). The document is internally consistent in placing all cross-entity existence checks here, but the canonical stage assignment per Doc-4A §11.2 suggests Stage 7 is more precise.

**Corpus Reference:** Doc-4A §11.2 (Stage 7 REFERENCE — entity existence/validity; Stage 8 BUSINESS — domain business rules); Doc-4E_Content_v1.0_PassB_Part1 §E4.3 §4 Validation Matrix Stage 8  
**Required Fix (optional):** Consider moving "specs reference an active doc revision" to Stage 7 REFERENCE at Pass-B patch time, for alignment with Doc-4A §11.2 stage semantics. Not a blocking defect; note for Pass-B author discretion.

---

**PB1-N2**  
**Severity:** NITPICK  
**Location:** §E4.4 — Combined approve_rfq / reject_internal_rfq Contract Record; Part-1 Conformance Summary  
**Description:**  
Pass-A finding PA-03 (NITPICK, PATCH-4E-PA-03 applied) noted that `rfq.approve_rfq.v1` and `rfq.reject_internal_rfq.v1` are two distinct actions on distinct source states (`pending_internal_approval → submitted` vs `pending_internal_approval → draft`) and recommended they be split into two separate Contract-IDs at Pass-B.

Pass-B Part 1 retains them as a single combined record (§E4.4). The Conformance Summary table also combines them in one row. While combining them does not introduce an error in the current content (the document correctly describes both paths), the combined record:
- Makes it impossible to assign a single Contract-ID to one action vs the other.
- Complicates AI-agent contract discovery (a contract titled `approve_rfq` also defines `reject_internal_rfq`).
- Defers a known technical debt item that was explicitly recommended for resolution at Pass-B.

**Corpus Reference:** Doc-4E_PassA_Patch_v1.0.md PATCH-4E-PA-03 (NITPICK — split at Pass-B); Doc-4E_PassA_Approved_v1.0.md §E4.4; Doc-4E_Content_v1.0_PassB_Part1 §E4.4 and Part-1 Conformance Summary  
**Required Fix (recommended):** Split §E4.4 into §E4.4a `rfq.approve_rfq.v1` and §E4.4b `rfq.reject_internal_rfq.v1` as two distinct contract records, each with their own Request Schema, Response Schema, Validation Matrix, Authorization Matrix, State Machine Enforcement, Audit Binding, Event Binding, Error Register, Idempotency Rules, Cross-Module References, and AI-Agent Notes. Update the Conformance Summary table accordingly.

---

## Finding Summary

| ID | Severity | Location | Description |
|---|---|---|---|
| PB1-M1 | MINOR | §E4.6 Validation Matrix Stage 1 | `expected_version_no` absent from SYNTAX stage despite being required in Request Schema |
| PB1-M2 | MINOR | §E4.9 Validation Matrix | Stage 1 SYNTAX entirely absent for system-triggered contract |
| PB1-M3 | MINOR | §E4.5 State Machine Enforcement | Compound-path framing conflates two distinct Doc-2 §5.4 transitions; AI-agent implementation risk |
| PB1-N1 | NITPICK | §E4.3 Validation Matrix Stage 8 | Spec-document active-revision check at BUSINESS rather than REFERENCE stage |
| PB1-N2 | NITPICK | §E4.4 combined contract record | approve_rfq / reject_internal_rfq not split per Pass-A PA-03 recommendation |

**Totals:** 0 BLOCKERs · 0 MAJORs · 3 MINORs · 2 NITPICKs

---

## Area-by-Area Review

### Area 1 — Pass-A Conformance

**Verdict: PASS**

The document declares and binds Pass-A conventions (§B cross-cutting conventions, §E0–§E3 global contracts) by pointer. H.1–H.9 are stated once in §H and bound per contract. No Pass-A convention is restated substantively rather than by pointer. The nine-stage validation ordering, field type vocabulary, authorization model, error model, state machine enforcement, audit binding, event binding, idempotency, and rfqs/rfq_versions field source are all carried forward from the frozen Pass-A baseline.

The one Pass-A finding that carried a Pass-B obligation (PA-03, split approve/reject) has not been executed — recorded as PB1-N2.

---

### Area 2 — Contract Inventory Completeness

**Verdict: PASS**

Nine contracts are present: §E4.1 create_rfq, §E4.2 update_rfq, §E4.3 submit_rfq, §E4.4 approve/reject_internal, §E4.5 moderate_rfq, §E4.6 cancel_rfq, §E4.7 submit_quotation (trigger), §E4.8 award_rfq (trigger), §E4.9 expire_rfq.

These match the BC-1 contract inventory established in the frozen Pass-A baseline (§E4, Doc-4E_PassA_Approved_v1.0.md lines 73–102). No contracts have been added or removed. The Part-1 Conformance Summary table at the end of the document reflects all nine.

---

### Area 3 — Request Schema Completeness

**Verdict: CONDITIONAL PASS** (PB1-M1 gap in §E4.6; PB1-M2 gap in §E4.9 noted against matrix, not schema)

Request schemas for §E4.1–§E4.8 correctly enumerate all fields with type vocabulary drawn from H.2, required/optional markings, and constraints. Fields bind to Doc-2 §10.4 columns: `rfq_id` (uuid), `rfq_version_id` (uuid), `work_nature[]` (string[], Doc-2 §10.4 CHECK constraint), `routing_mode` (enum per Doc-2 §10.4), `estimated_value` (numeric), `currency` (string, defaults BDT), `category_id` (uuid), `scope_text` (text), `no_formal_spec` (bool), `spec_document_ids[]` (uuid[], rfq_versions column), `current_version_no` / `expected_version_no` (numeric), `cancellation_reason` (string), `moderation_outcome` (enum), `rfq_correction_required` reason (string).

§E4.9 expire_rfq Request Schema correctly identifies `rfq_id` and `trigger` as internal fields with appropriate type annotations.

The §E4.6 `expected_version_no` validation gap is a Validation Matrix defect, not a Request Schema defect — the field is correctly declared in §E4.6 §2. Recorded under PB1-M1.

---

### Area 4 — Response Schema Completeness

**Verdict: PASS**

Response schemas are present and complete for all nine contracts. Notably:
- §E4.1 create_rfq response correctly returns `rfq_id`, `rfq_version_id`, `state`, `human_ref`, `current_version_no` — all fields per Doc-2 §10.4.
- §E4.2 update_rfq response correctly returns `rfq_version_id`, `version_no`, `current_version_no`, and `state` — the Pass-A response included `state` and `current_version_no` in the baseline (Pass-A approved value: "new `rfq_version_id`, version number, `reference_id`"; Pass-B expands correctly with `state` and `current_version_no`).
- §E4.5 moderate_rfq response correctly differentiates pass/reject outcomes.
- §E4.6 cancel_rfq response includes `rfq_id`, `state: cancelled`, `cancelled_at`.
- §E4.7 submit_quotation trigger response correctly identifies state transition driven.
- System contracts (§E4.9) have appropriate minimal response schemas.

No invented fields detected. All response fields traceable to Doc-2 §10.4 columns or derived state outputs.

---

### Area 5 — Validation Matrix Correctness

**Verdict: CONDITIONAL PASS** (PB1-M1, PB1-M2, PB1-N1)

With the exception of the three findings noted above:
- All matrices respect the nine-stage ordering (no stage appears before a preceding stage).
- Stages 2–5 (authorization chain) always precede stages 6–9 (semantic processing) across all nine contracts.
- Field-level checks are correctly placed at the stage of first consumption.
- CONTEXT checks (stage 2) correctly verify caller identity and organization membership before authorization slug checks (stage 3).
- SCOPE checks (stage 4) correctly appear after AUTHZ (stage 3).
- DELEGATION checks (stage 5) appear after SCOPE (stage 4).
- STATE checks (stage 6) appear after the full authorization chain.
- REFERENCE checks (stage 7) appear after STATE.
- BUSINESS checks (stage 8) appear after REFERENCE.
- POLICY checks (stage 9) carry `[ESC-RFQ-POLICY]` markers correctly where POLICY keys are referenced.

---

### Area 6 — Nine-Stage Validation Ordering

**Verdict: PASS**

No instance of stage reordering detected across all nine contracts. The ordering `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY` is preserved in all matrices. Authorization (stages 2–5) always precedes semantic processing (stages 6–9), conforming to Doc-4A §11.2. Stages 2–9 appear singly (no aggregation). Stage 1 SYNTAX is the only stage that may aggregate multiple field errors. The two matrices missing SYNTAX (§E4.9) and the one with a SYNTAX omission (§E4.6) are recorded as PB1-M2 and PB1-M1 respectively — ordering is not violated in those cases, only completeness.

---

### Area 7 — Authorization Matrix Correctness

**Verdict: PASS**

Permission slugs used across all nine contracts:
- `can_create_rfq` — §E4.1: ✓ (Doc-2 §7)
- `can_create_rfq` (implicit via update gate) — §E4.2: ✓
- `can_create_rfq` (submit own draft) — §E4.3: ✓
- `can_approve_rfq` — §E4.4: ✓ (Doc-2 §7)
- `staff_can_moderate_rfq` — §E4.5: ✓ (Doc-2 §7, platform-staff space)
- `can_cancel_rfq` — §E4.6: ✓ (Doc-2 §7)
- `can_submit_quote` — §E4.7: ✓ (Doc-2 §7, vendor side)
- `can_award_rfq` / `can_approve_vendor_selection` — §E4.8: ✓ (Doc-2 §7)
- System actor — §E4.9: ✓ (no permission slug; internal trigger)

No invented permission slugs detected. All slugs present in Doc-2 §7 permission mapping table (lines 613–645, verified). Platform-staff slugs correctly segregated from tenant slugs.

---

### Area 8 — Scope Enforcement Correctness

**Verdict: PASS**

Scope checks (Stage 4) are correctly present where tenant isolation is required:
- Buyer-side contracts (§E4.1–§E4.4, §E4.6, §E4.8) verify `rfq.organization_id = caller.organization_id` at Stage 4.
- §E4.5 moderate_rfq correctly identifies platform staff scope (no tenant scope check; platform-wide).
- §E4.7 submit_quotation trigger correctly scopes to the RFQ's invited vendor set (non-disclosure invariant gate).
- §E4.9 system trigger has no scope check (internal system call; no external actor).

No scope bypass detected. Scope stage (4) appears after AUTHZ (3) in all contracts.

---

### Area 9 — Delegation Enforcement Correctness

**Verdict: PASS**

Stage 5 DELEGATION checks are correctly applied in contracts where delegation grants are relevant (§E4.1 create_rfq, §E4.3 submit_rfq where delegation of submission authority is documented). Contracts where delegation is not applicable correctly note absence or carry no Stage 5 entry. No invented delegation check patterns detected. The delegation check correctly references `delegation_grants` (Doc-2 §5.2 / §10 Identity module tables).

---

### Area 10 — State Machine Enforcement

**Verdict: CONDITIONAL PASS** (PB1-M3)

With the exception of §E4.5 moderate_rfq compound-path framing (PB1-M3):

All other state machine enforcement sections correctly cite:
- Allowed source states that exist in Doc-2 §5.4 (as patched by Doc-2_Patch_v1.0.3.md)
- Target states that exist in Doc-2 §5.4
- Forbidden states that are the correct complement of allowed source states
- PATCH-D2-01 (`under_review → draft`, rfq_correction_required) correctly cited in §E4.5
- PATCH-D2-02 (`matching → expired`, no_eligible_vendors_found) correctly cited in §E4.9
- §E4.3 submit_rfq correctly handles both paths: `draft → submitted` (no approval required) and `draft → pending_internal_approval` (approval required)
- §E4.4 correctly enforces `pending_internal_approval` as the sole source state for both approve and reject paths
- §E4.6 cancel_rfq correctly enforces the "any active state" cancel rule from Doc-2 §5.4
- §E4.7 submit_quotation trigger correctly enforces `vendors_notified → quotations_received` (first quotation path, PATCH-4E-PA-07 / PATCH-4E-PA-16 dual-trigger check)

No invented state transitions detected. No invented state names detected.

---

### Area 11 — Concurrency Rules

**Verdict: PASS**

Optimistic concurrency (`expected_version_no`) is correctly applied to all mutating contracts where race conditions are possible:
- §E4.2 update_rfq: `expected_version_no` in Request Schema; CONFLICT error in Error Register (retryable: true)
- §E4.6 cancel_rfq: `expected_version_no` in Request Schema; CONFLICT in Error Register (retryable: true) — Validation Matrix gap (PB1-M1) noted but concurrency semantics are correct
- §E4.3 submit_rfq: `expected_version_no` present; correct
- §E4.4 approve/reject: `expected_version_no` present; correct

Read-only and system contracts correctly omit `expected_version_no`. No contract applies concurrency control incorrectly.

---

### Area 12 — Audit Binding Correctness

**Verdict: PASS**

All nine contracts carry audit bindings. Bindings reference Doc-2 §9 audit actions by pointer. Where a Doc-2 §9 action does not yet enumerate the specific RFQ audit action, the `[ESC-RFQ-AUDIT]` carry marker is correctly applied with: interim binding to nearest §9 action by pointer, channel noted as Doc-2 §9 additive, no new action invented.

No invented audit action names detected. All binding descriptions reference the action, actor, and triggering condition correctly. Audit immutability and dual-write (audit-before-state-change) pattern is consistent with Doc-4A §6 / §H.6 requirements.

---

### Area 13 — Event Binding Correctness

**Verdict: PASS**

Events used across BC-1 contracts:
- `RFQCreated` — §E4.1: ✓
- `RFQSubmitted` — §E4.3: ✓
- `RFQApproved` — §E4.3 (self-approve, no internal approval required) and §E4.4 (approve path): ✓
- `RFQModerated` (pass/reject variants) — §E4.5: ✓
- `RFQCancelled` — §E4.6: ✓
- `RFQExpired` — §E4.9: ✓
- System-trigger notifications — §E4.7, §E4.8: correctly identified as trigger notifications, not independent domain events published by RFQ module

No invented event names detected. Single-authorship rule (Doc-4A §4.4) is respected: RFQ module authors events it emits; consumer effects not authored here. Template 21.2 not instantiated.

Contracts where no event is emitted (§E4.2 update_rfq — draft update, no lifecycle event) correctly note absence of event or rationale.

---

### Area 14 — Error Register Completeness

**Verdict: PASS**

All error registers draw exclusively from the Doc-4A §12 closed class: `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`.

No invented error types detected. Across all nine contracts:
- `CONFLICT` is consistently marked `retryable: true`
- `SYSTEM` is consistently marked `retryable: true`
- `VALIDATION`, `AUTHORIZATION`, `NOT_FOUND`, `STATE`, `REFERENCE`, `BUSINESS` are consistently marked `retryable: false`
- Non-disclosure invariant (Doc-4A §7.5) is correctly applied: gate-excluded vendors receive `NOT_FOUND` rather than `AUTHORIZATION`, collapsing access denial and non-existence to the same error surface

Error registers are complete for each contract — no missing obvious failure modes detected.

---

### Area 15 — Idempotency Correctness

**Verdict: PASS**

All mutating contracts carry `Idempotency: required` with a dedup window expressed as a POLICY key reference (`[ESC-RFQ-POLICY]` with Doc-3 §12.2 pointer). System-triggered contracts (§E4.7, §E4.8, §E4.9) correctly note inherent idempotency by trigger design (system does not re-trigger for same event). No contract omits idempotency declaration. Dedup window values are not invented — all carried as POLICY key references, not hardcoded values. Replay-within-window semantics (same result, no duplicate audit, no duplicate event) are correctly described per Doc-4A §14.

---

### Area 16 — Cross-Module Dependency Integrity

**Verdict: PASS**

Cross-module references across BC-1 contracts:
- Identity (DE-1): user resolution, membership check, organization_id — §E4.1–§E4.9 as appropriate ✓
- Marketplace (DE-2): `spec_documents` active revision check (§E4.3), vendor matching (§E4.5, §E4.7), category validation (§E4.1, §E4.2) ✓
- Platform Core (DE-8): workflow settings (approval mode, `rfq_approval_mode`), moderation configuration ✓
- Communication (DE-6): vendor notification on matching/vendors_notified (§E4.7 trigger) ✓
- Admin (DE-5): audit log, platform-staff action recording ✓
- Operations (DE-4): where relevant for internal approval workflow ✓

All cross-module references use bare UUID service-validation pattern (no cross-schema FK). No module added. No module relationship invented. DDD boundary is respected.

---

### Area 17 — DDD Boundary Integrity

**Verdict: PASS**

BC-1 RFQ Lifecycle remains within the Procurement bounded context. No RFQ contract redefines or re-models entities belonging to Marketplace (vendor profiles, spec documents, categories), Identity (users, organizations, memberships), or any other module. Cross-module lookups are described as service calls or by pointer to the owning module. No Procurement entity is replicated into another module's schema.

---

### Area 18 — Procurement Moat Protection

**Verdict: PASS**

The procurement moat (RFQ routing defensibility: buyer-outcome quality + vendor fairness + capacity awareness + trust preservation; no pay-to-win routing) is correctly protected across BC-1:
- Routing mode (`routing_mode` field: `approved_only / approved_conditional / approved_open / open_market`) is not mutated by any BC-1 contract after submission — correctly locked post-submit.
- No contract introduces preferential routing, paid placement, or vendor-selection override outside documented authorization paths.
- Non-disclosure invariant (§7.5) is correctly applied in §E4.7 submit_quotation trigger — gate-excluded vendors cannot discern whether they were excluded or whether the RFQ exists.
- `moderation_outcome` in §E4.5 correctly gates into matching, protecting vendor fairness (only moderation-passed RFQs enter vendor-visible matching pool).
- No `matching_results`, leads, counts, or logs are exposed to excluded vendors in any BC-1 contract.

---

### Area 19 — AI-Agent Safety

**Verdict: CONDITIONAL PASS** (PB1-M3)

AI-Agent Notes sections are substantive across all nine contracts and address implementation-specific hazards. Positive observations:
- §E4.1: Correctly warns against auto-submitting after create (two-step create → submit must be explicit)
- §E4.2: Correctly warns that update creates a new rfq_version; warns against treating update as in-place mutation
- §E4.3: Correctly distinguishes self-approve path (no approval required) from approval-required path
- §E4.6: Correctly warns that cancel is irreversible and requires human confirmation
- §E4.9: Correctly identifies system-only trigger; warns against AI agent calling expire directly

**Risk detected (PB1-M3):** §E4.5 AI-Agent Notes do not call out the compound-path risk. The AI-Agent Notes section says "the moderation pass advances the RFQ through two states" — this language may reinforce rather than clarify the ambiguity in §E4.5 §6. AI agents should be explicitly warned that `submitted → under_review` is a system auto-advance (not a moderator action) and that the moderator's action source state is `under_review` only.

The PB1-M3 required fix to §E4.5 §6 State Machine Enforcement, if executed correctly, will resolve the AI-Agent Notes gap as a side effect (the notes should be updated to match the corrected state machine description).

---

### Area 20 — Corpus Compliance

**Verdict: CONDITIONAL PASS** (PB1-M1, PB1-M2, PB1-M3 to resolve)

No invented permission slugs, event names, audit action names, state names, state transitions, POLICY keys, error types, entity names, or module boundaries detected. All corpus claims verified against:
- Doc-2 §5.4 (state machine, patched v1.0.3)
- Doc-2 §7 (permission slugs)
- Doc-2 §9 (audit actions, with ESC markers where not yet enumerated)
- Doc-2 §10.4 (rfqs and rfq_versions field columns)
- Doc-4A §11.2 (nine-stage validation)
- Doc-4A §12 (error closed class)
- Doc-4A §14 (idempotency)
- Doc-4E_PassA_Approved_v1.0.md §B and §E4 (Pass-A baseline)
- Doc-4E_PassA_Patch_v1.0.md (all 19 patches, including PA-07 vendors_notified→quotations_received, PA-16 dual-trigger)

The three MINOR defects are corpus-compliance gaps (validation matrix incompleteness vs Doc-4A §11.2; state machine description vs Doc-2 §5.4). Resolution required before freeze.

---

## Drift Analysis

**Permission Drift:** NONE DETECTED  
All slugs match Doc-2 §7. No slug used that does not appear in the Doc-2 §7 permission mapping table.

**Event Drift:** NONE DETECTED  
All events are named consistently with prior corpus references. No event emitted by a non-owning module. No event invented for this document.

**Audit Drift:** NONE DETECTED  
All audit action bindings reference Doc-2 §9 by pointer. ESC carry markers correctly applied where §9 enumeration is pending.

**State Transition Drift:** MINOR — §E4.5 compound-path framing (PB1-M3)  
No fabricated transitions. The §E4.5 compound-path description conflates two Doc-2 §5.4 edges; it does not invent a new edge. However, the framing could drive incorrect implementations. Recorded as MINOR.

**Lifecycle Drift:** NONE DETECTED  
No RFQ lifecycle alteration. No state added or removed. PATCH-D2-01/02 correctly absorbed.

**Ownership Drift:** NONE DETECTED  
RFQ entities remain owned by Procurement. No cross-module ownership claim.

**Authorization Drift:** NONE DETECTED  
No privilege escalation. No slug assigned to a role bundle inconsistent with Doc-2 §7.

**POLICY Key Drift:** NONE DETECTED  
All POLICY keys carried as `[ESC-RFQ-POLICY]` references to Doc-3 §12.2. No POLICY key value invented or hardcoded.

---

## AI-Agent Safety Analysis

**Overall AI-Agent Safety Rating: CONDITIONAL — 1 MINOR risk identified**

The document's AI-Agent Notes sections are among the strongest elements of Part 1. Each contract provides implementation-specific guidance that goes beyond boilerplate. The following risks are specifically identified:

**Risk 1 (PB1-M3 — MINOR): moderate_rfq compound-path framing**  
An AI agent that generates command handler code from §E4.5 §6 State Machine Enforcement as written may generate a handler that:
- Accepts `submitted` as a valid input state for the moderator's clearing action
- Implements a single state transition from `submitted` → `matching` bypassing `under_review`
- Omits the `under_review` intermediate state check

This would produce code that violates Doc-2 §5.4. The AI-Agent Notes section for §E4.5 should be updated alongside the State Machine Enforcement fix to explicitly state: "The moderator's action source state is `under_review` only. The `submitted → under_review` transition is driven by the platform moderation system, not by the moderator's call to this contract."

**Risk 2 (PB1-M1 — MINOR): cancel_rfq SYNTAX gap**  
An AI agent generating field validation code from the §E4.6 Validation Matrix alone would not validate `expected_version_no` at intake. This creates a code path where a missing or malformed `expected_version_no` is not caught at SYNTAX but propagates to STATE stage, producing a misleading error. The fix (add `expected_version_no` to Stage 1 SYNTAX) resolves this completely.

**Risk 3 (PB1-M2 — MINOR): expire_rfq missing SYNTAX**  
Same pattern as Risk 2, limited to the internal trigger fields of a system contract. Lower severity because system actors are internal, but a missing SYNTAX stage creates an undocumented gap in the matrix.

**Areas of Strong AI-Agent Safety (no action required):**
- §E4.1: Create-then-submit two-step explicitly warned
- §E4.2: rfq_version immutability after first quotation explicitly warned
- §E4.3: Self-approve vs approval-required path disambiguation is clear
- §E4.6: Irreversibility of cancel is called out; human-confirmation requirement noted
- §E4.7: System trigger boundary clearly marked; AI agent warned not to call directly
- §E4.9: System-only; AI agent warned off direct invocation

---

## Pass-B Readiness Assessment

| Check | Status | Notes |
|---|---|---|
| All nine BC-1 contracts present | ✓ PASS | §E4.1–§E4.9 complete |
| Request schemas complete and typed | ✓ PASS | All fields, all types per H.2 |
| Response schemas complete | ✓ PASS | All contracts |
| Validation matrices present | ⚠ CONDITIONAL | PB1-M1 (§E4.6 SYNTAX gap), PB1-M2 (§E4.9 SYNTAX absent) |
| Nine-stage ordering respected | ✓ PASS | No ordering violation |
| Authorization matrices correct | ✓ PASS | No invented slugs |
| Scope enforcement correct | ✓ PASS | All contracts |
| Delegation enforcement correct | ✓ PASS | All contracts |
| State machine enforcement correct | ⚠ CONDITIONAL | PB1-M3 (§E4.5 compound-path) |
| Audit bindings correct | ✓ PASS | ESC markers correctly applied |
| Event bindings correct | ✓ PASS | No invented events |
| Error registers complete | ✓ PASS | Closed class; retryable flags correct |
| Idempotency declared | ✓ PASS | All mutating contracts |
| Cross-module references correct | ✓ PASS | No cross-schema FK; bare UUIDs |
| DDD boundaries respected | ✓ PASS | No boundary violation |
| Procurement moat protected | ✓ PASS | No pay-to-win path; non-disclosure correct |
| AI-Agent Notes substantive | ⚠ CONDITIONAL | §E4.5 AI-Agent Notes need update per PB1-M3 fix |
| No corpus drift | ✓ PASS | No invented entities/transitions/slugs/events |
| Pass-A conformance | ✓ PASS | All §B conventions bound by pointer |
| Pass-A PA-03 split recommendation | ⚠ NITPICK | §E4.4 not split (PB1-N2) |

**Blocks to freeze:** 3 MINOR findings (PB1-M1, PB1-M2, PB1-M3) must be resolved by Pass-B patch before the Part-1 freeze audit.

---

## Final Decision

**APPROVE WITH PATCH**

Doc-4E_Content_v1.0_PassB_Part1_RFQLifecycle.md is **conditionally approved** subject to a Pass-B patch addressing the three MINOR findings:

1. **PB1-M1:** Add `expected_version_no` to §E4.6 Validation Matrix Stage 1 SYNTAX
2. **PB1-M2:** Add Stage 1 SYNTAX entry to §E4.9 Validation Matrix
3. **PB1-M3:** Split §E4.5 State Machine Enforcement compound-path into discrete single-edge rows per Doc-2 §5.4; update §E4.5 AI-Agent Notes accordingly

The two NITPICKs (PB1-N1, PB1-N2) are recommended for resolution at the discretion of the Pass-B author but do not block the freeze audit.

**Upon patch application, a Pass-B Freeze Audit is required before `Doc-4E_PassB_Part1_v1.0_FROZEN` is authorized.**

No BLOCKERs. No MAJORs. No architecture redesign required. No corpus conflicts detected.

---

*Review completed by: iVendorZ Architecture Board Independent Hard Reviewer*  
*Authority: Doc-4E_PassB_Part1_Independent_Hard_Review_v1.0*  
*Next step: Pass-B Patch → Pass-B Freeze Audit → FROZEN*
