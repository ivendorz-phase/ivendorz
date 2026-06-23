# Doc-4A — Pass 4 Patch v1.0.1

| Field | Value |
|---|---|
| Patch ID | Doc-4A-Pass4-Patch-v1.0.1 |
| Applies To | Doc-4A_Content_v1.0_Pass4.md |
| Base Version | Doc-4A Content v1.0, Pass 4 — §13, §14, §15, §16, §17 (Board-approved pending patch) |
| Authority | Architecture Board — Pass 4 review findings |
| Source Findings | PATCH-01 through PATCH-04 (mandatory); OPTIONAL-01, OPTIONAL-02 (applied) |
| Rejected Findings | F-002, F-006, F-008, F-010, F-011, F-012, F-013, F-016, F-017 — not applied |
| Status | PASS 4 FREEZE CANDIDATE — all BLOCKER/MAJOR resolved |

---

## §1 — Patch Summary

| Patch ID | Section(s) | Change Type | Subject |
|---|---|---|---|
| PATCH-01 | §14.3 | Targeted addition | In-flight idempotency protection: replay MUST NOT begin second execution while original is in-flight |
| PATCH-02 | §15.2, §15.5 | Targeted edit | Phase-2 contract identity: `Phase-2` field declared as navigation pointer only; Phase-1 MUST NOT declare Phase-2 state effects for another module |
| PATCH-03 | §16.3, §16.5, §16.9 | Grammar field addition + rule update + table row | `Privacy-Review: §7.5 compliant` mandatory field added to Events Produced grammar; §16.5 payload privacy bullet updated to reference grammar field; §16.9 prohibited pattern row added |
| PATCH-04 | §17.2, §17.3 | Grammar extension + rule addition + section update | `phase2-origin` added to Correlation grammar; rule bullet defining its semantics added to §17.2; §17.3 System actor attribution updated to reference `phase2-origin` |
| OPTIONAL-01 | §13.2 | Targeted addition | Multi-entity State Machine Effects block sequencing format clarification |
| OPTIONAL-02 | §17.1 | Targeted addition | Business audit vs. operational telemetry distinction bullet |

---

## §2 — Modified Sections (Complete Modified Text)

### PATCH-01 — §14.3 Replay Behavior — The Joint Rule

**Change**: Added "In-flight protection" paragraph after the Implementation-neutral constraint paragraph.

**Modified paragraph block (§14.3, paragraphs 5–7):**

> **Implementation-neutral constraint**: Idempotency deduplication **MUST** be applied at the application layer before any transaction begins. A replay is detected and the stored result returned without initiating a new write transaction; the transactional outbox is not involved in the replay path. This is a contract-layer assertion checkable in design review; the implementation mechanism belongs in development documents.
>
> **In-flight protection**: The joint rule applies regardless of whether the original execution has completed. A replay arriving while the original execution is still in-flight **MUST NOT** begin a second execution of the command's business logic. The platform **MUST** treat the in-flight original as the single execution for this idempotency key; duplicate business outcomes — a second state transition, a second audit record, a second outbox event — are prohibited under all timing conditions (completed, in-progress, or concurrent). The response the replaying client receives depends on implementation: it may receive the cached result once the original completes, or a response consistent with the contract's declared `Replay-Result` (§14.2). The specific detection and handling mechanism belongs in development documents.
>
> This is the platform-wide replay safety invariant. Contracts **MUST** declare their idempotency model in terms that make this invariant verifiable by review and by Appendix A conformance checks.

---

### PATCH-02 — §15.2 Async Operation Declaration + §15.5 Async Ownership and Attribution

**Change A — §15.2 grammar, Phase-2 field:**

```
Phase-2:     <navigation pointer — owning module name; triggering event per Doc-2 §8;
              State Machine Effects, Audit Requirements, and Events Produced for Phase-2
              work are declared in the Phase-2 module's own System-actor contract, not here>
```

**Change B — §15.2 rules, second bullet (complete replacement):**

> Phase-2 always belongs to a named owning module. The `Phase-2` field is a **navigation pointer only**: it names the owning module and triggering event so that reviewers and AI agents can locate the Phase-2 contract. The Phase-1 contract **MUST NOT** declare State Machine Effects (§13), Audit Requirements (§17), or Events Produced (§16.3) for Phase-2 work belonging to another module — those declarations are authored in the Phase-2 module's own System-actor contract, following the integration single-authorship rule (§4.4) and the One Entity = One Owner principle (§4.1). Where Phase-2 effects cross module boundaries via events, each module's Phase-2 contract declares its own async work independently.

**Change C — §15.5 first bullet (complete replacement):**

> Phase-2 async workers execute under the **System actor type** (§5.2). Their State Machine Effects (§13), Audit Requirements (§17), and Events Produced (§16.3) are declared in their own System-actor contracts, authored by the Phase-2 owning module under the integration single-authorship rule (§4.4). The Phase-1 contract declares the triggering event and observation interface only; it **MUST NOT** declare Phase-2 state effects belonging to another module.

---

### PATCH-03 — §16.3 Event Declaration Grammar + §16.5 Payload Rules + §16.9 Prohibited Patterns

**Change A — §16.3 Events Produced grammar (complete replacement):**

```
Event:          <event_name — MUST exist in Doc-2 §8; never coined in a Doc-4 document>
Version:        <integer ≥ 1>
Trigger:        <the operation in this contract that causes emission>
Payload:        <field list in §9.1 notation; thin per §16.5>
Outbox:         yes
Source-Ref:     Doc-2 §8.<event_entry> [as amended by <PATCH-ID> per §3.5]
Privacy-Review: §7.5 compliant
```

**Change B — §16.3 rule sentence after grammar blocks (extension):**

> All fields in both grammars are mandatory. A declaration with an empty or missing field is nonconforming (Appendix A). The `Privacy-Review` field carries the literal assertion `§7.5 compliant` — the contract author's declaration that the payload has been reviewed against §7.5 and contains no protected facts, Buyer Vendor Status values, routing-exclusion data, private CRM content, or governance signal values beyond what the emitting module's own authoritative state legitimately contains. Any value other than `§7.5 compliant` is nonconforming; absence of the field is a conformance failure (§7.6).

**Change C — §16.5 Payload privacy bullet (complete replacement):**

> Payload privacy: producers **MUST** declare `Privacy-Review: §7.5 compliant` in their Events Produced grammar (§16.3). This machine-reviewable assertion confirms that the payload has been reviewed against §7.5 and contains no protected facts, Buyer Vendor Status values, routing-exclusion data, or private CRM content. Absence of the `Privacy-Review` field is a conformance failure (Appendix A; §7.6).

**Change D — §16.9 prohibited patterns table (row addition):**

| Missing `Privacy-Review` field in Events Produced declaration | §16.3; §16.5; §7.6 |

---

### PATCH-04 — §17.2 Audit Declaration Grammar + §17.3 Actor Attribution Requirements

**Change A — §17.2 grammar, Correlation field:**

```
Correlation:     reference_id | idempotency_key | both | phase2-origin
```

**Change B — §17.2 rules, new bullet (added after `Mutation-Scope` bullet, before Phase-2 audit ownership bullet):**

> `Correlation: phase2-origin` is used **exclusively** by System-actor Phase-2 contracts (§15). It declares that the audit record carries: this Phase-2 execution's own `reference_id`; the originating Phase-1 `reference_id` (and idempotency key where applicable); and the originating actor (user) and organization identifiers — as correlation linkage fields per Doc-2 §9 (by pointer). This enables full chain reconstruction: originating user action → Phase-1 acceptance → Phase-2 System execution. The specific linkage field names are defined in Doc-2 §9 and **MUST NOT** be restated in Doc-4 documents.

**Change C — §17.3 System actor attribution paragraph (complete replacement):**

> **System actor**: `actor_id` = the platform's stable system actor identifier (Doc-2 §9, by pointer); `actor_type` = `system`; `organization_id` = the owning organization of the entity being acted upon. Phase-2 System-actor audit records **MUST** declare `Correlation: phase2-origin` (§17.2) to carry the originating user, originating organization, and Phase-1 reference linkage as correlation fields — not as primary actor attribution. This is what makes Phase-2 audit records reconstructible to their originating user action (§15.5; §17.7).

---

### OPTIONAL-01 — §13.2 State Machine Effects Declaration Grammar

**Change**: Extended the multi-entity rule bullet with sequencing format guidance.

**Modified bullet (§13.2, fourth rule bullet, complete replacement):**

> A single command that transitions multiple entities within the same aggregate (e.g., a parent and its dependent child per Doc-2 §2) **MUST** declare one State Machine Effects block per entity. When multiple blocks are declared, they are sequenced one after the other within the State Machine Effects field, each block using the full grammar above, separated by a blank line. A comment line (beginning with `#` followed by the entity name) **SHOULD** precede each block to aid review navigation; the entity name in the comment **MUST** match the `Entity:` field value in that block. Blocks are ordered by aggregate mutation sequence — aggregate root first, then dependent children per Doc-2 §2 composition.

---

### OPTIONAL-02 — §17.1 Audit Is Mandatory for Mutations

**Change**: Added business audit vs. operational telemetry bullet after the permanence bullet.

**Added bullet (§17.1, new final bullet):**

> **Business audit vs. operational telemetry**: The Audit Requirements declaration governs **business audit records** only — records of named actors performing business actions on business entities, for governance and compliance. **Operational telemetry** (infrastructure metrics, health checks, timing data, service logs) and **abuse-monitoring logs** (records of suspicious activity, rejected authentication attempts, rate-limit events) are distinct categories governed by their own policies in development documents. A contract **MUST NOT** conflate these: `Audit-Required: yes` does not imply operational telemetry is produced, and operational telemetry does not satisfy business audit obligations.

---

## §3 — Rationale

### PATCH-01 Rationale

The original §14.3 Joint Rule covered only the completed-execution replay case: "deduplication applied before transaction begins" is unambiguous once a result is stored. The in-flight case — where two identical requests arrive concurrently before either commits — was architecturally uncovered. A naive implementation could pass the deduplication check twice (neither has yet stored a result), produce two state transitions, two audit records, and two outbox events, all while technically satisfying the letter of §14.3 as written. The patch adds an explicit contract-layer rule: no second execution under any timing condition. The rule is implementation-neutral — it asserts the obligation without prescribing detection mechanisms (optimistic lock, state machine pre-check, distributed flag), preserving development freedom while closing the audit and event-integrity gap.

### PATCH-02 Rationale

The `Phase-2` field description in §15.2 — "what happens asynchronously: owning module; triggered by which event" — could be read by an AI agent or developer as authorization to declare Phase-2 State Machine Effects, Audit Requirements, and Events Produced within the Phase-1 contract. This reading would violate One Entity = One Owner (§4.1) and integration single-authorship (§4.4): the Phase-1 module would be declaring contract obligations it does not own. The patch converts the Phase-2 field into an explicit navigation pointer and adds a MUST NOT prohibition in both §15.2 and §15.5. The prohibition closes the ownership gap without redesigning the async declaration model: the Phase-1 contract retains full visibility of the triggering event and observation interface; the Phase-2 contract retains full ownership of its own state, audit, and event declarations.

### PATCH-03 Rationale

§16.5 required a §7.5 compliance statement in the Events Produced declaration, but §16.3's Events Produced grammar had no field for it. The requirement existed in narrative prose only — invisible to Appendix A conformance checks and to AI agents reviewing grammar fields. The patch adds `Privacy-Review: §7.5 compliant` as a mandatory grammar field with a fixed acceptable value, making the privacy review obligation machine-reviewable and Appendix-A-checkable. The §16.5 bullet is updated from a prose requirement to a grammar-field reference, establishing the field as the normative home of the obligation. The §16.9 prohibited patterns table receives a corresponding row to close the Appendix A coverage. The Privacy-Review field accepts only `§7.5 compliant` — there is no valid "not-applicable" alternative, because the privacy review obligation applies to all event payloads without exception.

### PATCH-04 Rationale

§15.5 and §17.3 required Phase-2 System-actor audit records to carry the originating user and organization as correlation linkage. The §17.2 `Correlation` grammar provided only `reference_id | idempotency_key | both` — none of which express the Phase-2 attribution chain semantics. A System-actor contract declaring `Correlation: both` would be syntactically valid but semantically ambiguous: it would not distinguish a Phase-2 attribution chain from an ordinary dual-correlation on the same contract's own request identifiers. The patch adds `phase2-origin` as a dedicated Correlation value exclusive to Phase-2 System-actor contracts, with an explicit rule defining its declared content (own reference_id + Phase-1 reference_id + originating actor + originating organization). The §17.3 System actor paragraph is updated to reference `phase2-origin` by name, converting the previously implicit attribution obligation into a mechanical, reviewable contract declaration.

### OPTIONAL-01 Rationale

§13.2 required multiple State Machine Effects blocks for multi-entity aggregate transitions but gave no sequencing format. Authors could reasonably place blocks as YAML-like adjacent entries with no separation, or with blank lines, or with arbitrary labels — creating inconsistency across contracts. The patch adds a minimal sequencing convention (blank-line separation, optional comment line with entity name, aggregate root first) that aligns with the existing grammar style. No new grammar fields are introduced; the comment line is a SHOULD (aids navigation) not a MUST (the `Entity:` field is the machine-readable identifier).

### OPTIONAL-02 Rationale

§17.1 declared audit records as "permanent governance and compliance records, not debugging artifacts" but did not explicitly distinguish them from operational telemetry or abuse-monitoring logs. Without this distinction, a contract author could interpret `Audit-Required: yes` as implying production of operational telemetry (or vice versa), or could cite an abuse-monitoring log as satisfying a business audit obligation. The patch adds an explicit categorical separation, naming both operational telemetry and abuse-monitoring logs as out-of-scope for the Audit Requirements declaration.

---

## §4 — Rejected Findings

The following Board findings were reviewed and explicitly rejected. Rejection is a permanent record and **MUST NOT** be re-applied without an Architecture Board escalation.

| Finding | Reason for Rejection |
|---|---|
| F-002 | Out of scope for this patch target: structural concern outside §13–§17 |
| F-006 | Would require redesigning an approved standard rather than patching a gap |
| F-008 | No corpus basis for the proposed change; would introduce an entity not in Doc-2 |
| F-010 | Conflicts with Reference-Never-Restate doctrine (§0.3): would require restating Doc-2 §5 content |
| F-011 | Implementation-prescriptive; belongs in development documents not contract standards |
| F-012 | Duplicates existing rule coverage already present in §16.4 and §4.1 |
| F-013 | Proposes an alternate state machine model inconsistent with Doc-2 §5 (BLOCKER-level conflict with frozen corpus) |
| F-016 | Introduces a new POLICY key class not present in §18 (frozen); would require §18 patch first |
| F-017 | Scope creep: addresses a §19–§21 concern; not applicable to §13–§17 standards |

---

## §5 — Architecture Impact Assessment

### Cross-Section Dependencies

| Patch | Sections Affected | Downstream Impact |
|---|---|---|
| PATCH-01 | §14.3 | None. Strengthens an existing rule; does not add new contract fields, change grammar, or affect event, audit, or state declarations. Appendix A in-flight detection guidance is a development-document concern. |
| PATCH-02 | §15.2, §15.5 | None to contract grammar. Affects authoring practice: Phase-1 contract authors MUST NOT include Phase-2 state effects. This is a conformance obligation, not a schema change. No Doc-4B–4N contracts exist yet; the rule is additive to the standard, not corrective of existing contracts. |
| PATCH-03 | §16.3, §16.5, §16.9 | Appendix A checklist will gain one new mandatory field check for Events Produced declarations (Privacy-Review present and value = `§7.5 compliant`). All future Doc-4B–4N contracts authoring Events Produced blocks must include this field. No existing frozen content is affected. |
| PATCH-04 | §17.2, §17.3 | Appendix A checklist will gain one new Correlation value to check for System-actor Phase-2 contracts (phase2-origin required). All future Phase-2 System-actor contracts in Doc-4B–4N must use `Correlation: phase2-origin`. No existing frozen content is affected. Doc-2 §9 remains the sole definer of linkage field names; no Doc-2 change required. |
| OPTIONAL-01 | §13.2 | Style/format clarification only. No grammar fields added. No Appendix A change required. |
| OPTIONAL-02 | §17.1 | Scope clarification only. No grammar fields added. No Appendix A change required. |

### Higher-Precedence Document Conflicts

No patch in this record conflicts with Master Architecture, ADR Compendium, Doc-2 v1.0.3, Doc-3 v1.0.2, or Doc-4A Passes 1–3 (including Pass 3 Patch v1.0.1). All patches strengthen or clarify existing rules; none introduce new entities, new workflows, new ownership boundaries, or new Doc-2 §5 transitions.

### Appendix A Update Requirement

Two new Appendix A conformance checks are implied by this patch:

1. **§16.3 check** (PATCH-03): Events Produced block — `Privacy-Review` field present and value equals `§7.5 compliant`.
2. **§17.2 check** (PATCH-04): System-actor Phase-2 contract — `Correlation` field value equals `phase2-origin` (not `reference_id`, `idempotency_key`, or `both`).

These checks are recorded here as the authoritative source; Appendix A (Doc-4A Pass N) will incorporate them at authoring time per the frozen structure.

---

## §6 — Self-Review

*Classification per §3.4: BLOCKER, MAJOR, MINOR, NITPICK. All BLOCKER and MAJOR findings resolved before this output.*

### BLOCKER Findings

None. All mandatory patches are targeted, implementation-neutral, and consistent with higher-precedence frozen documents.

### MAJOR Findings

None. Cross-section dependency analysis (§5) confirms no downstream regressions in Passes 1–3. No new entities, workflows, or ownership boundaries introduced.

### MINOR Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| R4P-m1 | PATCH-01 | "A response consistent with the contract's declared `Replay-Result` (§14.2)" — `Replay-Result: acknowledged` is defined for async commands (§14.2); applying it to sync commands would be unexpected. | Accepted. The Replay-Result reference is an implementation hint, not a mandatory value constraint. Sync command in-flight durations are sub-millisecond in practice; the implementation-deference framing keeps the rule implementation-neutral. An Appendix A check would look for "no duplicate business outcome," not for the specific response shape. |
| R4P-m2 | PATCH-03 | `Privacy-Review` field accepts only one value (`§7.5 compliant`). A reviewer might ask: what if the review found a violation before freezing? | Accepted. If the review reveals a violation, the contract fails §7.5 and MUST NOT be frozen (§7.6) until the violation is resolved. The field is a pre-freeze assertion, not a post-freeze audit trail. Contracts that fail privacy review do not reach freeze. |
| R4P-m3 | PATCH-04 | `phase2-origin` is used exclusively by Phase-2 System-actor contracts, but §17.2 grammar lists it alongside `reference_id | idempotency_key | both` without visual separation. A Phase-1 author could inadvertently declare it. | Accepted. The rule bullet ("used exclusively by System-actor Phase-2 contracts") is normatively sufficient. An Appendix A check on the combination `Actor-Types: System` + `Execution: async` (Phase-2) will enforce the requirement mechanically. |

### NITPICK Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| R4P-n1 | PATCH-03 | §16.3 grammar alignment: original Events Produced grammar used 6-char field labels with 8-space alignment; Privacy-Review uses 14-char label with 1-space after colon. Field-alignment adjusted in patch to 14-char padded labels for visual consistency. | Accepted |
| R4P-n2 | OPTIONAL-01 | Comment line (`# entity name`) uses shell-style comment syntax. Doc-4 grammars do not otherwise use comments within declaration blocks. | Accepted. The comment is a navigational aid declared as SHOULD, not a grammar element. Its use is limited to multi-entity sequences where disambiguation is needed. The `Entity:` field remains the machine-readable identifier. |
| R4P-n3 | PATCH-02 | §15.2 second rule bullet is now substantially longer than the other three bullets in the same list. | Accepted. Length is proportional to the importance of the ownership prohibition. No information can be removed without weakening the conformance obligation. |

---

*End of Doc-4A Pass 4 Patch v1.0.1. All BLOCKER and MAJOR findings resolved. Pass 4 FREEZE APPROVED pending Architecture Board ratification. Next: Doc-4A Pass 5 — §18, §18B, §19, §20, §21, Appendices A–C.*
