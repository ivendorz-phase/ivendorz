# Doc-4A — Content v1.0 — Pass 3 Patch v1.0.1

| Field | Value |
|---|---|
| Patch ID | Doc-4A-Pass3-Patch-v1.0.1 |
| Applies To | Doc-4A_Content_v1.0_Pass3.md |
| Base | Doc-4A Content v1.0 Pass 3 (§9–§12, APPROVED PENDING PATCH) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A §0.4; Doc-4A §3.5 |
| Source Findings | Architecture Board approved: PATCH-01 through PATCH-08 |
| Excluded | F-006, F-008, F-011, F-015, F-016, F-018 (deferred, implementation-concern, or rejected) |
| Status | Applied — Suitable for Pass 3 Freeze Approval |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2 — all FROZEN |

---

## §1 — Patch Summary

| Patch | Target Section(s) | Change |
|---|---|---|
| PATCH-01 | §10.6 | Add Display Label Boundaries — normative definition preventing shadow representations |
| PATCH-02 | §9.2 | Distinguish CREATE vs UPDATE absence semantics for optional fields |
| PATCH-03 | §9.4 | Scope state-field prohibition to mutating contracts; permit state filters in query contracts |
| PATCH-04 | §11.2 / §12.2 | Category 9 dual error class mapping: QUOTA vs RATE_LIMITED |
| PATCH-05 | §11.4 | Case A / Case B delegation error boundary — explicit normative distinction |
| PATCH-06 | §12.4 | Timing-Uniformity declaration — makes timing path requirement contract-actionable |
| PATCH-07 | §12.4 | Error Boundary block — canonical location for per-failure-point declarations |
| PATCH-08 | §11.2 | Explicit cross-reference: validation categories → §12.2 error classification |

---

## §2 — Modified Sections

Each entry shows the complete modified subsection text. Surrounding unmodified content is not reproduced.

---

### PATCH-02 — §9.2 (Modified)

**Section:** 9.2 Required, Optional, and Nullable — `optional` definition

**Change:** The `optional` bullet now explicitly distinguishes CREATE-command context (server applies declared default) from UPDATE-command context (field not written; stored value preserved). Two nested sub-bullets replace the prior single-sentence absence rule.

```
- **optional** — the field MAY be absent. The contract MUST state the behavior of
  absence in the constraint position. Absence semantics are never implied; the
  contract MUST distinguish by operation type:
  - Create-command context (instantiating a new aggregate root): absent optional
    field → server applies the declared default, named explicitly in the constraint
    position as a POLICY key (§18) or a corpus-defined static default. Absent does
    not mean null; if null is separately permissible, it is declared as nullable.
  - Update-command context (modifying an existing aggregate root): absent optional
    field → the stored value is unchanged; the field is not written. Absent is not
    null: an explicit null in an update-command context means what the nullable
    constraint declares. A contract MUST NOT treat absent and explicit null as
    equivalent in an update-command context.
```

---

### PATCH-03 — §9.4 (Modified)

**Section:** 9.4 Enumerations — last bullet

**Change:** The state-field prohibition now explicitly scopes to mutating contracts. A new sentence permits state-field filter/sort declarations in query contracts, subject to the §9.6 allowlist and the §7.5 non-disclosure rule.

```
- **State fields are not writable enums.** In a mutating contract, a request MUST NOT
  accept an entity's lifecycle state as an input field; state changes occur only
  through commands whose State Machine Effects declare the transition (§13, by pointer
  to the frozen structure). In a query contract, a lifecycle-state field MAY be
  declared as a filterable or sortable dimension, provided it appears in the contract's
  explicit filterable/sortable allowlist (§9.6). Such a declaration is a read assertion
  only — it does not create a writable state path and MUST NOT be construed as a state
  transition or used as a protected-fact filtering shortcut (§7.5; §9.6 second bullet).
```

---

### PATCH-01 — §10.6 (Modified)

**Section:** 10.6 Reference Expansion Rules — fourth bullet added

**Change:** A new fourth bullet defines the Display Label boundary. Labels must be a single human-readable name or title only. The bullet enumerates what labels MUST NOT carry, prohibits shadow representations, and requires that label absence be indistinguishable from label-not-returned (closing the §7.5 response-channel risk for the label surface).

```
- **Display labels are bounded, not representations.** A display label carried alongside
  a cross-module uuid reference MUST be a single human-readable name or title — the
  label the owning module's Query publishes for the requesting audience. A display label
  MUST NOT include, encode, or imply: entity lifecycle state; any governance signal
  (Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer Vendor Status
  — Master Architecture §1.5); verification or trust indicators; computed scores or
  Matching Confidence outputs; financial tier or capacity profile data; or any protected
  fact (§7.5). Carrying a display label MUST NOT become a substitute for calling the
  owning module's Query, and MUST NOT be used to construct shadow representations that
  reconstruct what only the owning module may return (§4.3; One Entity = One Owner
  principle). Where the owning module's non-disclosure rules would withhold the label
  for the requesting audience, the cross-module reference carries only the uuid; label-
  absent and label-present response shapes MUST be indistinguishable to the caller as
  an omission signal — the label field is simply absent, not signaled as redacted.
```

---

### PATCH-04 — §11.2 (Modified)

**Section:** 11.2 Validation Categories — two normative notes added before the existing category-behavior bullets

**Change:** "Category 9 — dual error class mapping" distinguishes quota-type limits (→ `QUOTA`, retryable: false) from throughput-type limits (→ `RATE_LIMITED`, retryable: true) and requires per-rule declaration. "Cross-reference to error classification" (PATCH-08) is co-located here as a companion note (see PATCH-08 entry below).

```
Category 9 — dual error class mapping. Category 9 (POLICY) maps to two distinct error
classes (§12.2), distinguished by the nature of the limit:

- A quota-type limit — a finite entitlement that has been consumed (§19; §6B.3 quota
  attribution) — maps to QUOTA (retryable: false; retry cannot succeed until the quota
  state changes by an external action such as a plan upgrade or a platform-actor reset).
- A throughput-type limit — a rate window governed by a POLICY key that resets on a
  declared schedule (§19) — maps to RATE_LIMITED (retryable: true; the contract declares
  the reset interval in its Error Behavior block).

A contract MUST declare, per V<n> rule in Category 9, whether the limit is quota-type or
throughput-type, so that the correct error class is unambiguous to AI agents and reviewers.
```

---

### PATCH-08 — §11.2 (Modified — co-located with PATCH-04)

**Section:** 11.2 Validation Categories — second normative note

**Change:** Explicit cross-reference from the V\<n> grammar's `error class per §12` position to §12.2, with instruction on handling multi-class categories.

```
Cross-reference to error classification. The error class per §12 position of each V<n>
rule (§11.1 grammar) MUST be populated from the closed class set in §12.2. The "Maps from
§11 category" column in §12.2 defines the binding. Where a category maps to more than one
error class (Category 4/5: NOT_FOUND or AUTHORIZATION per §12.4; Category 9: QUOTA or
RATE_LIMITED per the dual mapping above), the V<n> rule MUST name the specific class
applicable to that rule, not the category-level default. Errors outside the §12.2 closed
set are nonconforming and require escalation (§0.6; §12.6).
```

---

### PATCH-05 — §11.4 (Modified)

**Section:** 11.4 Cross-Module and Delegation Validation Notes — last bullet replaced

**Change:** The prior single-sentence delegation failure rule is replaced with a two-case normative structure. Case A (protected-fact risk → NOT_FOUND) is the safe default. Case B (established resource + grant, slug gap only → AUTHORIZATION) requires that neither the resource's existence nor the grant's existence constitutes a protected-fact disclosure. Contracts must assign cases in their Error Boundary block.

```
- **DELEGATION-category error classification** is governed by the §12.4 boundary rule and
  §7.5 non-disclosure requirements. Two cases apply per failure point:

  - Case A — protected-fact risk: Where the DELEGATION check fails in a way that would
    disclose a protected fact — including: revealing that an entity exists which the
    representative's grant no longer covers; distinguishing "no such entity" from "entity
    exists but you lack delegation"; or exposing grant existence or scope to a party that
    has no independent right to know — the error MUST be NOT_FOUND with the same code,
    message, and shape as the entity-never-existed response (§12.4 protected-fact collapse
    rule). Case A is the safe default where case assignment is ambiguous (§12.6).

  - Case B — established resource, slug gap: Where the resource's existence and the grant's
    existence are both established as non-protected facts already visible to the caller
    through their legitimate scope (neither constitutes a protected-fact disclosure), and the
    DELEGATION check fails solely because the required slug is absent from the grant's
    permission_set (§6B.2, condition 3), the error MUST be AUTHORIZATION. In Case B, only
    the permission gap is disclosed; resource and grant existence are already known.

  Contracts that declare delegation eligibility MUST identify, per failure point, the
  applicable case in their Error Boundary block (§12.4).
```

---

### PATCH-04 (cont.) — §12.2 (Modified)

**Section:** 12.2 Error Classification — normative note added after the class table

**Change:** Adds the QUOTA vs RATE_LIMITED distinction note to §12.2, complementing the §11.2 Category 9 dual mapping note and the existing table entries.

```
QUOTA vs RATE_LIMITED distinction. QUOTA signals a finite entitlement whose supply is
exhausted; time passing alone does not restore it — retry without an external state change
(plan upgrade, platform-actor quota reset) is meaningless (retryable: false). RATE_LIMITED
signals a throughput window that resets on a policy-declared schedule; retry is meaningful
after the declared interval (retryable: true). Contracts MUST NOT return RATE_LIMITED for
quota exhaustion, or QUOTA for throughput-limit engagement. The §11.2 Category 9 dual
mapping note defines which validation rule maps to which class.
```

---

### PATCH-06 — §12.4 (Modified)

**Section:** 12.4 Non-Disclosure Error Behavior — fifth bullet added

**Change:** Introduces the `Timing-Uniformity` assertion as a contract-level declaration. `asserted` commits to same-path processing for protected and standard cases. `not-applicable` declares no protected-fact scenario. The declaration is reviewable and an Appendix A conformance check; it does not prescribe implementation mechanism.

```
- **Timing-Uniformity declaration (contract assertion).** A contract that applies the
  protected-fact collapse rule MUST carry a Timing-Uniformity assertion in its Error
  Boundary block (see below):

    Timing-Uniformity: asserted | not-applicable

  asserted declares that the protected-fact case and the standard (no protected fact)
  case for the same operation travel the same processing path with no timing signature
  distinguishable between them — as required by §7.5. not-applicable declares that the
  contract handles no protected-fact scenarios. The Timing-Uniformity assertion is a
  contract-level commitment reviewable by humans and AI agents and is a conformance check
  (Appendix A). It does not prescribe the implementation mechanism for achieving timing
  uniformity; implementation choices (queue design, padding, async paths) belong in
  development documents (§2.2).
```

---

### PATCH-07 — §12.4 (Modified)

**Section:** 12.4 Non-Disclosure Error Behavior — sixth bullet added

**Change:** Defines the Error Boundary block as the canonical location for: per-failure-point AUTHORIZATION/NOT_FOUND declarations, delegation Case A/B assignments, and Timing-Uniformity assertions. The block format uses V\<n> identifiers from §11.1 grammar. Block is machine-readable, AI-reviewable, and a conformance check. Absence of the block in a protected-fact-bearing contract is nonconforming.

```
- **Error Boundary block — canonical location.** The per-failure-point AUTHORIZATION/
  NOT_FOUND boundary declarations required by §12.4 (second bullet), the per-delegation-
  failure case assignment required by §11.4, and the Timing-Uniformity assertion required
  above, MUST all appear in a dedicated Error Boundary block within the contract's Error
  Behavior declaration (§21 template). The block form is:

    Error-Boundary:
      V<n> : NOT_FOUND | AUTHORIZATION | collapse-rule   (repeated for each failure point)
      Timing-Uniformity : asserted | not-applicable

  The V<n> identifiers reference the corresponding validation rules (§11.1 grammar). This
  block is machine-readable, AI-reviewable, and is checked by Appendix A. A contract with
  protected-fact exposure and a missing or incomplete Error Boundary block is nonconforming.
  The safe default for any ambiguous failure point is NOT_FOUND | collapse-rule (§12.6).
```

---

## §3 — Rationale

**PATCH-01 (Display Label Boundaries).** The existing §10.6 permitted display labels alongside cross-module `uuid` references but gave no definition of what a label may contain. Without a boundary, a label field becomes a vector for cross-module shadow representations — a contract could progressively add governance signal values, trust scores, or verification status to a "label" field, reconstructing the owning module's full representation without going through it. The boundary definition closes this by enumerating the prohibited content categories exactly, tying to the One Entity = One Owner principle and §7.5. The label-absence indistinguishability rule closes the parallel §7.5 response-channel risk: a redacted label must not produce a different response shape than a label-never-returned case.

**PATCH-02 (CREATE vs UPDATE Absence Semantics).** The prior §9.2 optional definition said "state the behavior of absence in the constraint position" but did not distinguish operation type. An AI agent implementing an update command against a contract that only says "server default by POLICY key" could reasonably overwrite an existing value with the default on every absent field — destroying data. The CREATE/UPDATE distinction is fundamental: CREATE applies a default once at instantiation; UPDATE preserves stored values when a field is absent. The two nested sub-bullets make this unambiguous for AI agents and reviewers without altering the field grammar.

**PATCH-03 (State Filter Scope).** The prior §9.4 prohibition — "a request MUST NOT accept an entity's lifecycle state as an input field" — was unqualified. This correctly blocks writing a state directly in a mutating command, but it also blocked, by literal reading, declaring state as a filterable dimension in a list query. The patch scopes the prohibition to mutating contracts explicitly and permits query-contract state filters subject to the §9.6 allowlist mechanism. The read-assertion language and the cross-reference to §7.5/§9.6 ensure state filters cannot become a protected-fact side channel.

**PATCH-04 (QUOTA vs RATE_LIMITED Mapping).** Both `QUOTA` and `RATE_LIMITED` map from Category 9 (POLICY), but they have fundamentally different retry semantics. An AI agent generating error-handling code from a contract that says only "Category 9 → see §12.2" may default to the wrong retry strategy (retrying a quota exhaustion indefinitely, or suppressing retry on a resetting rate window). The dual mapping note forces per-rule declaration of limit type, making the error class derivation deterministic. The §12.2 note reinforces the distinction with the causal explanation (finite supply vs. resetting window).

**PATCH-05 (Delegation Error Boundary).** The prior §11.4 rule was: "follow §7.5 where failure would reveal a protected fact." This covers Case A correctly but leaves Case B unspecified. Case B is a real scenario: a representative with a known, visible grant on a known, visible vendor profile attempts an operation whose slug is not in their permission_set. Here, NOT_FOUND would incorrectly imply non-existence of something the representative legitimately knows exists. AUTHORIZATION is the correct response. The two-case structure makes the boundary normative and per-failure-point deterministic. The safe default (Case A) preserves non-disclosure conservatism.

**PATCH-06 (Timing-Uniformity Declaration).** The prior §12.4 phrase "same declared timing path (§7.5)" was an aspiration rather than a checkable contract commitment. An AI agent reviewing a contract has no way to verify this requirement is satisfied without an explicit contract field. The `Timing-Uniformity` assertion creates a reviewable, machine-readable contract commitment: `asserted` / `not-applicable`. This is deliberately not an implementation instruction — it does not specify queue depth, padding time, or framework behavior. Those belong in development documents. The assertion is the contract's statement that timing uniformity is a requirement; how the implementation achieves it is a development-document concern. This satisfies the implementation-neutrality requirement of §2.2 while making the obligation AI-agent-consumable.

**PATCH-07 (Error Boundary Block).** §12.4 required per-failure-point boundary declarations, §11.4 (now patched) requires delegation case assignments, and PATCH-06 adds the Timing-Uniformity assertion. Without a canonical location, these three requirements would scatter across the contract narrative, making AI review non-deterministic. The Error Boundary block groups all three under a named, structured block with V\<n> identifiers referencing the §11.1 validation rule grammar. The format is deliberately minimal: `V<n> : class | rule`, `Timing-Uniformity : value`. This is the minimum change that satisfies the canonical-location requirement without redesigning any template.

**PATCH-08 (Validation → Error Mapping Cross-Reference).** The §11.1 grammar includes an `error class per §12` position but §11.2 never explicitly pointed to §12.2 to resolve it. An AI agent could populate this position with any string. The cross-reference note makes the binding explicit and handles the multi-class categories (4/5 and 9) by requiring per-rule specificity rather than category defaults. This is the minimum change needed: a normative note, no structural addition.

---

## §4 — Self-Review

### 4.1 BLOCKER Findings

*None. All potential blocker conditions were analyzed and resolved during drafting; see dispositions below.*

| Candidate | Analysis | Disposition |
|---|---|---|
| PATCH-05 Case B over-disclosure: "established as non-protected facts visible to the caller through their legitimate scope" — could this inadvertently authorize AUTHORIZATION responses where NOT_FOUND is safer? | Case B is constrained by two conjunctive conditions: (i) the resource and grant are both non-protected-fact-visible, AND (ii) the failure is solely the slug gap. Any ambiguity in (i) defaults to Case A via the safe-default rule (§12.6). The formulation does not expand AUTHORIZATION; it only permits it where NOT_FOUND would be affirmatively incorrect. | RESOLVED — not a blocker |
| PATCH-06 `Timing-Uniformity: asserted` as implementation obligation: could this be read as requiring the contract to specify implementation paths? | The text explicitly states: "It does not prescribe the implementation mechanism for achieving timing uniformity; implementation choices belong in development documents (§2.2)." The assertion is a contract-level commitment only. | RESOLVED — not a blocker |
| PATCH-07 Error Boundary block pre-constrains §21 template: does this constitute a template redesign before §21 is authored? | §21 governs contract templates; §12.4 governs the error standard. §12.4 requiring an "Error Boundary block within the contract's Error Behavior declaration" is a §12.4-level normative requirement that §21 must honor when authored — the same relationship as all other §12 requirements on templates. No template redesign occurs here; the requirement is defined at the standard layer and flows down to the template layer per the authority chain. | RESOLVED — not a blocker |

---

### 4.2 MAJOR Findings

*None after analysis.*

| Candidate | Analysis | Disposition |
|---|---|---|
| PATCH-01: Does "label field is simply absent, not signaled as redacted" conflict with §10.7 redaction-aware fields requirement? | §10.7 applies to owned entity representations. A display label on a cross-module reference is not an owned representation field — it is a secondary annotation whose withholding must be non-distinguishable per §7.5. The two rules operate at different layers (entity representation vs. cross-module reference annotation) and do not conflict. | RESOLVED — not major |
| PATCH-04: Does requiring per-rule Category 9 type declaration impose retroactive requirements on already-authored contracts? | Pass 3 is pre-freeze; no contracts have been authored yet. The requirement applies to future module documents (Doc-4B…4K). No retroactive burden exists. | RESOLVED — not major |

---

### 4.3 MINOR Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P3P-m1 | §10.6 PATCH-01 | "single human-readable name or title" — "title" is slightly broader than "name". For an organization it might be a registered business name; for a vendor profile it is a trading name. Both are acceptable label content. No ambiguity in practice, but the phrase is intentionally permissive to cover both. | Accepted — no change |
| P3P-m2 | §11.4 PATCH-05 | Case B requires both resource and grant to be non-protected-visible. A representative who has a grant covering read-access on a vendor profile meets this condition. A representative who only infers the profile exists from an indirect source does not. The contract author must judge; the safe default is Case A. This judgment burden is acceptable — it forces explicit author reasoning. | Accepted — no change |
| P3P-m3 | §12.4 PATCH-06 | `Timing-Uniformity: asserted` does not carry the path label (e.g., "synchronous-query" vs "async-write"). A path label would aid reviewers. However, prescribing a path label would tend toward implementation documentation. The bare assertion is the correct contract-layer primitive; path labels belong in development documents. | Accepted — no path label |
| P3P-m4 | §12.4 PATCH-07 | Error Boundary block format uses `V<n>` identifiers. A contract with a large validation ruleset may produce a verbose block. This is intentional: verbosity here is correctness — every failure point must be declared. | Accepted — no change |

---

### 4.4 NITPICK Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P3P-n1 | §9.2 PATCH-02 | "create-command context" and "update-command context" are descriptive labels, not corpus terms. They serve as clarifying language within the definition, not as new technical vocabulary. | Accepted — labels are non-normative descriptors within the definition |
| P3P-n2 | §11.2 PATCH-08 | The PATCH-08 cross-reference note and PATCH-04 Category 9 note are adjacent in §11.2. Ordering: PATCH-04 note appears first (more substantive), PATCH-08 note second (cross-reference). This ordering is logical. | Accepted |
| P3P-n3 | §12.2 PATCH-04 | The QUOTA/RATE_LIMITED distinction note repeats information already implicit in the §12.2 table's retryable defaults. Repetition is deliberate: the note is for AI agents who may process the note independently of the table. | Accepted |

---

*End of Doc-4A Content v1.0 — Pass 3 Patch v1.0.1. All BLOCKER and MAJOR self-review findings resolved. The patched Doc-4A_Content_v1.0_Pass3.md is suitable for Pass 3 Freeze Approval.*
