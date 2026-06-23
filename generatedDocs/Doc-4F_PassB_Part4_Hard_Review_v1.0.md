# Doc-4F_PassB_Part4_Hard_Review_v1.0

## Executive Verdict

PASS WITH PATCH

BC-OPS-4 is structurally sound. Two aggregates, ownership boundaries, template machine, immutability invariant, generation dedup, non-disclosure, and counterparty grant model are correctly expressed. No BLOCKER found. Three MAJOR defects requiring patch before freeze: (1) the §F7.1 Validation Matrix repeats the merged STATE/CONCURRENCY row defect from the pre-patch BC-OPS-3 (IR-02) — STATE and CONFLICT rows are collapsed into a single "6 STATE / concurrency" row; (2) §F7.3 Stage-9 POLICY/infra row lists an invalid stage label ("9 POLICY/infra") and carries a non-error `ASYNC_PENDING` outcome directly in the validation matrix, creating an ambiguous signal; (3) §F7.4 carries `[ESC-OPS-SLUG]` as an inline hedge inside the authorization matrix for the document-sharing slug question but does not carry it in Appendix B independently — the escalation marker is split across two locations with different scoping, creating resolution ambiguity. Four MINOR defects. One NITPICK.

---

# Architecture Defects

## AD-01

### Severity
MAJOR

### Location
§F7.1 Validation Matrix, stage 6 rows (`ops.activate_template.v1` / `ops.archive_template.v1` / `ops.reactivate_template.v1`)

### Issue
The Validation Matrix contains:

```
| transition legal | 6 STATE | Doc-2 §5.9 | `target_stage` reachable … | `STATE` |
| status match | 6 STATE / concurrency | Doc-4A §14 | `expected_status` = current status | `CONFLICT` |
```

This is the identical merged-row defect identified in the BC-OPS-3 Hard Review (IR-02) and resolved in the BC-OPS-3 Patch (P-04). The FROZEN Part-3 precedent now mandates: lifecycle legality (STATE) and optimistic concurrency (CONFLICT) must be in distinct, ordered rows. The merged "6 STATE / concurrency" row violates Doc-4A §11.2 row-order discipline and the established FROZEN Part-3 fix. The evaluation order is ambiguous: an illegal transition with a stale `expected_status` would not produce a deterministic failure class. Implementers and AI agents cannot reliably resolve which check runs first.

### Governance Impact
Doc-4A §11.2 stage row discipline. FROZEN Part-3 P-04 precedent. Inconsistency with the corrected row structure in all Parts 1–3.

### Required Fix
Split into two distinct rows: (a) Stage 6 STATE — `target_stage` reachable from current per Doc-2 §5.9 machine → `STATE`; lifecycle legality checked first. (b) Stage 6 STATE → concurrency sub-check (Doc-4A §14) — after lifecycle legality passes, `expected_status` = current status → `CONFLICT`. Apply the same split to §F7.2 which carries the same pattern (merged STATE/concurrency rows).

---

## AD-02

### Severity
MAJOR

### Location
§F7.3 Validation Matrix, row "storage available | 9 POLICY/infra"

### Issue
The Validation Matrix row reads:

```
| storage available | 9 POLICY/infra | Doc-4B storage (DF-8) | storage backend available to write the `storage_ref` | `DEPENDENCY` (retry) / `ASYNC_PENDING` (not yet complete) |
```

Two defects:

First, the stage label "9 POLICY/infra" is not a valid Doc-4A §11.2 stage label. The nine stages are fixed as `1 SYNTAX · 2 CONTEXT · 3 AUTHZ · 4 SCOPE · 5 DELEGATION · 6 STATE · 7 REFERENCE · 8 BUSINESS · 9 POLICY`. Stage 9 is `POLICY` — not "POLICY/infra." A custom stage-label suffix violates Doc-4A §11.2's "fixed order and labels, never reordered or renamed" (Doc-4A §0.6). The Infrastructure availability check is not a POLICY check — it belongs at stage 7 REFERENCE (storage backend resolves as a reference dependency) or is a System/Infra precondition outside the validation matrix.

Second, the failure outcome column lists two classes: "`DEPENDENCY` (retry) / `ASYNC_PENDING` (not yet complete)". A validation matrix row produces one failure outcome per triggering condition. `DEPENDENCY` and `ASYNC_PENDING` are distinct error classes with distinct semantics (transient unavailability vs. in-progress; Doc-4A §12.2). These are two separate triggering conditions and must be two separate rows (or one row per condition). A dual-outcome single row is ambiguous for implementation: the triggering condition for `DEPENDENCY` (storage unavailable) differs from `ASYNC_PENDING` (generation in progress). AI agents cannot deterministically branch on a single-row dual outcome.

### Governance Impact
Doc-4A §11.2 (fixed stage labels, never renamed). Doc-4A §12 (one error class per triggering condition). Error class ambiguity for async job implementers.

### Required Fix
Remove the "9 POLICY/infra" row. Replace with two correctly-staged rows: (a) Stage 7 REFERENCE — storage backend / Doc-4B resolves → `DEPENDENCY` (transient unavailability; retryable). (b) Separately, `ASYNC_PENDING` belongs in §10 Idempotency Rules / async behavior note, not the Validation Matrix (it is not a validation failure — it is a polling signal). Alternatively, if `ASYNC_PENDING` is modeled as a validation outcome for the job-result query surface, it requires a separate row with its own stage and authority citation.

---

## AD-03

### Severity
MAJOR

### Location
§F7.4 Authorization Matrix + Appendix B `[ESC-OPS-SLUG]` entry

### Issue
§F7.4 Authorization Matrix reads: "Slug **`can_create_documents`** (Doc-2 §7) **or carry `[ESC-OPS-SLUG]`** if a distinct generated-document-share slug is later required." The `[ESC-OPS-SLUG]` escalation marker appears inline as an alternative-authority hedge within the Authorization Matrix itself.

Appendix B `[ESC-OPS-SLUG]` entry reads: "only if a distinct generated-document **share** slug (vs `can_create_documents`) or a distinct **read** slug is later required."

The escalation marker is split: the §F7.4 contract uses it as an inline hedge for the share-slug question, while Appendix B frames it as a conditional for both share AND read slugs. These two framings are not identical in scope. The inline "or carry" construction inside the Authorization Matrix means the current authority is conditional — the document simultaneously asserts that `can_create_documents` covers sharing AND that it may not. This is not a legitimate escalation pattern. Per Doc-4A §0.6 FLAG-AND-HALT, an escalation marker carries an unresolved question forward — it does not co-exist inline with an asserted answer. The correct pattern is: assert `can_create_documents` as the current authority (if that is the corpus-grounded choice) and carry `[ESC-OPS-SLUG]` separately in Appendix B as a forward dependency, not as an inline alternative.

The Validation Matrix for §F7.4 (stage 3 AUTHZ row) also inlines the hedge: "`can_create_documents`... (generated-document sharing under document-creation authority; **if a content/review pass finds a distinct share slug is required, carry `[ESC-OPS-SLUG]`**)." A Validation Matrix stage row must assert a single, definitive rule. A row that asserts a rule conditionally is a null check.

### Governance Impact
Doc-4A §0.6 FLAG-AND-HALT protocol. Doc-4A §11.2 validation matrix row must assert a definitive rule. Escalation markers are carry-forward pointers, not inline conditional alternatives to asserted authority.

### Required Fix
In §F7.4 Validation Matrix stage-3 AUTHZ row: assert `can_create_documents` as the current binding authority (Doc-2 §7), with no inline hedge. In §F7.4 Authorization Matrix: assert `can_create_documents` as the current slug, with no inline "or carry" alternative. Move `[ESC-OPS-SLUG]` exclusively to Appendix B as: "`[ESC-OPS-SLUG]` — the generated-document sharing and read surfaces bind `can_create_documents` (current corpus authority); if a distinct share-slug or read-slug is added to Doc-2 §7, these surfaces must be updated (Doc-2 §7 additive channel)." The inline hedge is eliminated; the escalation marker travels cleanly.

---

# Implementation Risks

## IR-01

### Severity
MINOR

### Location
§F7.2 Validation Matrix, stage 8 BUSINESS row

### Issue
The stage-8 BUSINESS row reads:

```
| immutable-version semantics | 8 BUSINESS | Doc-2 §5.9 | append a new `version_no` (prior versions retained, never overwritten) | `BUSINESS` (if an overwrite of an existing version is attempted) |
```

This row describes normal creation behavior ("append a new `version_no`") in the Rule column, then adds an overwrite-attempt failure in parentheses in the Failure Outcome column. The normal path (append) is not a business rule check — it is the contract's intended effect. The failure condition (overwrite attempt) is real, but the row structure is inverted: the Rule column should state the rule being checked ("no overwrite of an existing version_no permitted — Doc-2 §5.9 immutability") and the Failure Outcome should state the failure class (`BUSINESS`). As written, the Rule column reads as a description of the happy path, not a check, which mirrors the AD-01 defect identified in BC-OPS-3 (null-check-masquerading-as-rule). An implementer scanning the row sees a description of the write operation rather than a guard condition.

Additionally: in practice, if `version_no` is system-assigned (always `current+1`), an overwrite is structurally impossible at the API surface — there is no caller-supplied `version_no` in the Request Schema. If overwrite is impossible by construction, the BUSINESS row is a null check and should either be removed (with a prose note on immutability) or the Request Schema must be explicit that `version_no` is server-assigned.

### Governance Impact
Doc-4A §11.2 — stage rows must assert checkable rules with defined failure outcomes. Null checks in stage-8 create implementation ambiguity.

### Required Fix
Either: (a) Remove the stage-8 BUSINESS row and replace with a post-matrix implementation note: "`version_no` is system-assigned (current+1); overwrite is structurally impossible — no caller-supplied version number accepted (Doc-2 §5.9 immutability)." Or: (b) Rewrite the row Rule column as a guard: "caller must not supply an explicit `version_no` — server assigns `current_version_no + 1`; any payload field attempting to set `version_no` is rejected" → `BUSINESS`. Choose (a) or (b); the current hybrid is neither.

---

## IR-02

### Severity
MINOR

### Location
§F7.3 §6 State Machine Enforcement, idempotent no-op statement

### Issue
§F7.3 §6 State Machine Enforcement reads: "Forbidden: a second row for the same completed `generation_job_id` → idempotent no-op." The idempotent no-op is correctly documented in §10 Idempotency Rules. However, the §9 Error Register repeats it as a parenthetical note — the same placement defect as BC-OPS-3 IR-04 (resolved in P-06). The Error Register note reads:

```
*(No `CONFLICT` on the per-job uniqueness path: a replayed job for an existing `generation_job_id` is an **idempotent no-op** (dedup on job identity, Doc-4A §16.7), never `CONFLICT` — consistent with the FROZEN Part-2/Part-3 / Doc-4A §14.6 convention.)*
```

The FROZEN Part-3 P-06 precedent resolved this pattern: idempotency/replay behavior belongs in §10 Idempotency Rules; the Error Register contains only error outcomes. The parenthetical in §9 is a direct recurrence of the resolved defect.

### Governance Impact
FROZEN Part-3 P-06 precedent. Doc-4A §12 (Error Register = error outcomes only). Consistency with corrected pattern.

### Required Fix
Remove the parenthetical note from §F7.3 §9 Error Register. The replay-is-no-op behavior is already correctly stated in §10 Idempotency Rules. No behavior change.

---

## IR-03

### Severity
MINOR

### Location
§F7.1 Validation Matrix, stage 5 DELEGATION row

### Issue
The stage-5 DELEGATION row reads: "n/a — template management is not delegation-eligible | —". Doc-4A §6B governs delegation eligibility. The document asserts `can_manage_templates` is "not delegation-eligible" without citing the corpus authority for this restriction. Doc-2 §7 slug catalog entries carry eligibility flags (O,D,M,F notation). If `can_manage_templates` is marked not delegation-eligible in Doc-2 §7, the stage-5 row must cite that authority. If Doc-2 §7 does not explicitly exclude delegation, the assertion is an invention and must carry FLAG-AND-HALT.

This matters because §F7.2 (`add_template_version`) and §F7.4 (`grant_generated_document`) also assert "not eligible" at stage 5 — the same uncited restriction propagates across four contracts. Contrast: §F7.5 also asserts "not eligible" for templates and generated-document grant/revoke. Only BC-OPS-3 correctly cited the delegation eligibility basis per contract (via H.3 noting the vendor-org / representative pattern).

### Governance Impact
Doc-4A §6B (delegation framework). Doc-2 §7 slug authority for delegation eligibility. An asserted "not eligible" without corpus authority is a hidden authority creation (Doc-4A §0.6).

### Required Fix
In §H.3 and in every stage-5 DELEGATION row that asserts "not eligible": add the Doc-2 §7 authority citation for `can_manage_templates` / `can_create_documents` delegation eligibility. If Doc-2 §7 is silent on delegation restriction for these slugs, carry FLAG-AND-HALT at each stage-5 row. Do not assert ineligibility without cited authority.

---

## IR-04

### Severity
MINOR

### Location
§F7.3 Validation Matrix, stage-6 STATE row failure outcome

### Issue
The stage-6 STATE row for `ops.generate_document.v1` reads:

```
| no completed document for `generation_job_id` | 6 STATE | Doc-2 §10.5 (per-job) | a generated document is produced once per `generation_job_id`; a duplicate job is an idempotent no-op (dedup on job identity) | idempotent no-op (no error) |
```

The failure outcome column value is `idempotent no-op (no error)` — an unclassed prose string. This is the same pattern identified in BC-OPS-3 IR-04 (the Validation Matrix stage-6 row failure outcome for the duplicate `invitation_id` case in §F6.1), resolved in P-06 by changing the outcome to `—`. FROZEN Part-3 precedent: the correct value for a non-failure outcome in the Validation Matrix is `—` (per the corrected BC-OPS-3 pattern). An unclassed prose string in the failure outcome column is not a valid Doc-4A §12 error class and creates implementation ambiguity.

### Governance Impact
FROZEN Part-3 P-06 precedent. Doc-4A §12 (failure outcomes are error classes or `—` for non-applicable). Consistency.

### Required Fix
Change failure outcome for the stage-6 STATE duplicate-job row from `idempotent no-op (no error)` to `—`. Prose explanation of idempotent behavior belongs in §10 Idempotency Rules (already stated there — no additional content needed).

---

## IR-05

### Severity
NITPICK

### Location
§F7.3 §9 Error Register, `AUTHORIZATION` class absence

### Issue
The §F7.3 Error Register does not list `AUTHORIZATION` as a possible error class. The stage-2 CONTEXT row of the Validation Matrix produces `AUTHORIZATION` when the actor is not System. For a 21.5 System contract, the AUTHORIZATION outcome from stage 2 is low-probability but structurally present (a non-System caller reaching this endpoint). FROZEN Part-2 (§F5.1 — a 21.5 System contract) included `AUTHORIZATION` in its Error Register for exactly this reason. The omission is a gap in the error register's completeness, not a behavioral defect, but it creates inconsistency with the FROZEN Part-2 precedent.

### Governance Impact
FROZEN Part-2 §F5.1 precedent. Error Register completeness. Low severity — no behavioral impact.

### Required Fix
Add `AUTHORIZATION` to the §F7.3 Error Register: "context/actor-type check fails (non-System caller reaches this endpoint) | false."

---

# Regression Audit

| Area | Result | Notes |
|---|---|---|
| Ownership Drift | NONE | Two aggregates (Document Template + Generated Document) correctly owned by BC-OPS-4; no foreign-aggregate mutation |
| Aggregate Drift | NONE | `document_templates`+`template_versions` = Document Template AR; `generated_documents` = Generated Document AR; no boundary crossed |
| Lifecycle Drift | NONE | Template machine exactly Doc-2 §5.9 `draft/active/archived` + `active→active` (new version) + `archived→active` (reactivate); no stage invented |
| Event Drift | NONE | BC-OPS-4 emits zero domain events (Doc-2 §8 / Pass-A §F7/§F11); no event consumption |
| Authorization Drift | NONE | Only `can_manage_templates` and `can_create_documents` (Doc-2 §7); no slug invented; `[ESC-OPS-SLUG]` carried (see AD-03 for inline-hedge defect — slug binding is correct, inline framing is the defect) |
| Procurement Moat Drift | NONE | RFQ owns matching/routing/ranking/quotation/award; Marketplace owns vendor data; Operations owns template/document generation — no leakage; `source_entity_id` refs are read-only bare UUIDs |
| Trust Firewall Drift | NONE | No Trust score computation, no Trust aggregate mutation; audit signals via Doc-4B only |
| Audit Drift | NONE | Template lifecycle binds Doc-2 §9 Documents actions directly; counterparty grant carries `[ESC-OPS-AUDIT]` correctly; no audit action invented |
| Template Immutability | NONE | `template_versions` immutable per Doc-2 §5.9; `add_template_version` appends; no overwrite path |
| Generation Dedup | NONE | `generation_job_id` dedup correctly specified in §F7.3 §10 |
| Counterparty Grant Boundary | NONE | Grant is Operations-owned, distinct from RFQ's `rfq_document_grant` (Doc-4E); sharing never broadens beyond owning org + granted counterparty |
| BC-OPS-2 Boundary | NONE | BC-OPS-2 references `template_version_id` by pointer only; no template/generated-document ownership in BC-OPS-2; correctly noted in H.9 |

---

# AI-Agent Readiness

MEDIUM

Three issues reduce determinism for agent implementation:

**AD-01 (merged STATE/CONCURRENCY rows):** Agent implementing §F7.1 and §F7.2 lifecycle transitions faces evaluation-order ambiguity. An illegal transition with a stale `expected_status` does not produce a deterministic failure class from the current merged row. This directly impacts retry logic and error handling. Must be resolved before agent implementation begins.

**AD-02 (invalid stage label + dual-outcome row in §F7.3):** Agent implementing the async generation job sees "9 POLICY/infra" — an unrecognized stage label — and a single row with two outcome classes (`DEPENDENCY` / `ASYNC_PENDING`). An agent cannot branch deterministically on a dual-outcome row. `ASYNC_PENDING` vs. `DEPENDENCY` handling are fundamentally different (polling vs. retry-after-backoff). This is the highest-risk defect for AI-agent implementation.

**AD-03 (inline escalation hedge):** Agent implementing §F7.4 counterparty grant sees an Authorization Matrix that simultaneously asserts `can_create_documents` AND "or carry `[ESC-OPS-SLUG]`." The agent cannot determine whether `can_create_documents` is the definitive authority or a placeholder. This creates non-determinism in the authorization check path.

**Items correctly expressed for agent consumption:**

- Template machine `draft/active/archived` is explicit per Doc-2 §5.9 with all four valid edges stated; agents have deterministic transition guidance.
- `template_versions` immutability is explicitly stated (never overwrite; `version_no` is system-assigned) — agents will not attempt version mutation.
- `generation_job_id` dedup is clearly specified — agents will not produce duplicate generated documents.
- Non-disclosure (owning org + granted counterparty only) is correctly stated in §F7.5 §9 Error Boundary and §12 AI notes.
- `won`/`lost`-equivalent confusion is not applicable here — §F7.2 §12 AI notes correctly signal that generated documents record `template_version` (lineage preservation).
- Storage-ref-only pattern (never in-row blob) is correctly stated across §F7.3 and §F7.5.

---

# Final Assessment

```
BLOCKER  = 0
MAJOR    = 3
MINOR    = 4
NITPICK  = 1
```

---

# Final Decision

PASS WITH PATCH

BC-OPS-4 passes Hard Review subject to patch. Aggregate ownership, template machine, immutability invariant, generation dedup, non-disclosure, and carried escalation markers are correct. Three MAJOR findings (AD-01, AD-02, AD-03) and four MINOR findings (IR-01–IR-04) must be resolved before freeze. One NITPICK (IR-05) resolved in the same patch pass. No BLOCKER; no corpus escalation required.

**BC-OPS-4 freeze is BLOCKED** pending patch application, patch verification, and freeze audit.

---

# Next Recommended Artifact

`Doc-4F_PassB_Part4_Patch_v1.0` — Patch register for AD-01, AD-02, AD-03, IR-01, IR-02, IR-03, IR-04, IR-05 (8 patch actions P-01–P-08). After patch: `Doc-4F_PassB_Part4_Patch_Verification_Report_v1.0` → `Doc-4F_PassB_Part4_Freeze_Audit_v1.0` → BC-OPS-4 FROZEN.
