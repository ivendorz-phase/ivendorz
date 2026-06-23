# Doc-4A — Pass 5 Patch v1.0.1

| Field | Value |
|---|---|
| Patch ID | Doc-4A-Pass5-Patch-v1.0.1 |
| Applies To | Doc-4A_Content_v1.0_Pass5.md |
| Base | Doc-4A Content v1.0 Pass 5 (FROZEN CANDIDATE) |
| Authority | Architecture Board Review of Pass 5; Doc-4_Governance_Note_v1.0.md |
| Source Findings | Pass 5 Self-Review P5-M1 (template registry), P5-M2 (Appendix B title), P5-M3 (Appendix C title), P5-n2 (stage_b+ shorthand) |
| Patch Type | Governance-alignment only — no architecture, no new content, no redesign |
| Status | **PASS 5 FREEZE CANDIDATE** |

---

## §1 — Patch Summary

| Patch ID | Section(s) Modified | Type | Description |
|---|---|---|---|
| PATCH-01 | §21 header | Documentation alignment | Add governance note registering Templates 21.3–21.6 as normative specializations of Template 21.1; declares registry extension; no domain changes |
| PATCH-02 | Appendix B header; Appendix C header | Documentation alignment | Add governance notes clarifying each appendix's relationship to the frozen Structure's registered appendix titles; no behavior changes |
| PATCH-03 | §18B.2 grammar block; §18B.2 rule bullet; Template 21.1 Operating Stage grammar; Self-Review P5-n2 | Grammar normalization | Replace `stage_b+` shorthand with explicit `stage_b \| stage_c` in all occurrences; preserve behavior |

---

## §2 — Modified Sections (Complete Modified Text)

### PATCH-01 — §21 Header: Template Registry Governance Note

**Location:** `Doc-4A_Content_v1.0_Pass5.md` — `## §21 — Canonical Contract Templates`, immediately before the "Templates in this section are normative" paragraph.

**Change:** Added governance note block.

**Modified text (governance note only — all other §21 content unchanged):**

> **Governance Note — Template Registry Extension (Pass 5 Patch v1.0.1, PATCH-01):** The frozen Structure (Doc-4A_Structure_v1.0_FROZEN.md §21) registers four templates: 21.1 Endpoint Contract (MANDATORY), 21.2 Integration Contract (MANDATORY), 21.3 Internal Service Contract (RECOMMENDED), and 21.4 Event Schema Declaration (RECOMMENDED). Pass 5 introduces Templates 21.3 Query, 21.4 Command, 21.5 System Actor, and 21.6 Admin as **normative specializations of Template 21.1**. These specializations extend the template registry. They introduce no new entities, state machines, state transitions, permission slugs, events, workflows, POLICY keys, or ownership assignments. The Structure's RECOMMENDED templates (Internal Service Contract and Event Schema Declaration) are deferred to a future Doc-4A patch; they are not superseded by this extension. A Structure patch formalizing the extended registry is recommended as a follow-on action before the Doc-4A final freeze.

---

### PATCH-02 — Appendix B Header: Namespace Registry Alignment Note

**Location:** `Doc-4A_Content_v1.0_Pass5.md` — `## Appendix B — Standard Error Catalog & Reserved Namespace Registry`, immediately before `### B.1 Standard Error Classes`.

**Change:** Added governance note block.

**Modified text (governance note only — all B.1–B.4 content unchanged):**

> **Governance Note — Appendix Registry Alignment (Pass 5 Patch v1.0.1, PATCH-02):** The frozen Structure (Doc-4A_Structure_v1.0_FROZEN.md) registers Appendix B as "Reserved Namespace Registry." This appendix satisfies that obligation in full (§B.2–B.4) while also providing the Standard Error Catalog (§B.1) required for complete contract conformance. The combined scope represents the minimal set required to make conformance reviewable. No architectural meaning, error class definitions, or namespace authority changes. A Structure patch updating the Appendix B registration title is recommended as a follow-on action.

---

### PATCH-02 — Appendix C Header: Contract Authoring Checklist Alignment Note

**Location:** `Doc-4A_Content_v1.0_Pass5.md` — `## Appendix C — Contract Authoring Checklist`, immediately before the opening paragraph.

**Change:** Added governance note block.

**Modified text (governance note only — all C.1–C.5 content unchanged):**

> **Governance Note — Appendix Registry Alignment (Pass 5 Patch v1.0.1, PATCH-02):** The frozen Structure (Doc-4A_Structure_v1.0_FROZEN.md) registers Appendix C as "Cross-Reference Index." This appendix serves as the Contract Authoring Checklist — a pre-authoring and pre-freeze guide for contract authors and AI coding agents. The cross-reference intent of the Structure's Appendix C is partially satisfied by the CHK-xxx source pointers in Appendix A; a full cross-reference index table is deferred to a future Doc-4A patch. No architectural meaning, governance behavior, or conformance obligation changes. A Structure patch updating the Appendix C registration title is recommended as a follow-on action.

---

### PATCH-03 — §18B.2: Stage Availability Grammar Normalization

**Location:** `Doc-4A_Content_v1.0_Pass5.md` — `### 18B.2 Stage Declaration Grammar`

**Change (grammar block):**

Before:
```
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b+ | stage_c
Stage-Behavior:     core.system_configuration.<key> | none
```

After:
```
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b | stage_c
Stage-Behavior:     core.system_configuration.<key> | none
```

**Change (rule bullet):**

Before:
> `Stage-Availability` declares the operating stage(s) at which the contract is activated. `stage_b+` is shorthand for `stage_b` and `stage_c` only (i.e., not Stage A). A contract not available at the current stage returns `BUSINESS` error with a corpus-defined code (not a 404 pattern — the endpoint exists, it is not activated).

After:
> `Stage-Availability` declares the operating stage(s) at which the contract is activated. `stage_b | stage_c` declares availability at Stage B and Stage C only (not Stage A). A contract not available at the current stage returns `BUSINESS` error with a corpus-defined code (not a 404 pattern — the endpoint exists, it is not activated).

---

### PATCH-03 — Template 21.1: Operating Stage Grammar Normalization

**Location:** `Doc-4A_Content_v1.0_Pass5.md` — Template 21.1, `### Operating Stage` block.

**Change:**

Before:
```
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b+
Stage-Behavior:     core.system_configuration.<stage_behavior_key> | none
```

After:
```
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b | stage_c
Stage-Behavior:     core.system_configuration.<stage_behavior_key> | none
```

*Note: Template 21.3–21.6 inherit the Operating Stage block from Template 21.1 by specialization reference. No separate edit required in those templates.*

---

### PATCH-03 — Self-Review P5-n2 Status Update

**Location:** `Doc-4A_Content_v1.0_Pass5.md` — Self-Review NITPICK table, row P5-n2.

**Change (disposition column):**

Before:
> Accepted — Minimal convenience shorthand; does not alter the stage model. An alternative is to require explicit `stage_b | stage_c`. Shorthand retained for authoring efficiency.

After:
> RESOLVED by Pass 5 Patch v1.0.1 PATCH-03 — shorthand replaced with explicit `stage_b | stage_c` grammar in §18B.2 and Template 21.1. Parsing ambiguity eliminated.

---

## §3 — Governance Impact Assessment

### 3.1 Architecture Integrity

None of the three patches alters any rule in the frozen corpus (Architecture, ADRs, Doc-2, Doc-3). All changes are either: (a) documentation alignment notes added at section headers, or (b) a grammar token substitution that preserves identical semantics.

| Architecture invariant | Affected? | Assessment |
|---|---|---|
| One Entity = One Owner | No | No entity, ownership, or module assignment touched |
| Integration Single Authorship | No | No integration contract touched |
| No Cross-Module Mutation | No | No state machine or mutation rule touched |
| Reference-Never-Restate | No | No source-of-truth restated; only navigation notes added |
| Governance Signal Firewall | No | No signal, firewall rule, or Firewall-Compliance declaration touched |
| Delegation Attribution | No | No delegation rule touched |
| Tenant Isolation / Non-Disclosure | No | No tenancy or §7.5 rule touched |
| UUIDv7 Authority | No | No identifier rule touched |
| State Machine Authority (Doc-2) | No | No transition, pre-state, or post-state touched |
| Workflow Authority (Doc-3) | No | No workflow definition touched |
| AI-Agent Constraints | No | No AI-agent rule or advisory-only restriction touched |

### 3.2 Conformance Checklist Impact

No Appendix A CHK-xxx items are modified, added, or removed. The three patches do not introduce new compliance requirements and do not relax any existing ones.

### 3.3 Template Impact

PATCH-01 adds a governance note above the template selection guide. All six templates (21.1–21.6) are preserved without field, field-order, or fill-grammar modification, with the sole exception of the grammar token substitution in PATCH-03 (Template 21.1 Operating Stage block). No template becomes more or less restrictive as a result.

### 3.4 Downstream Impact on Doc-4B–4N

| Impact area | Assessment |
|---|---|
| Authors of Doc-4B–4N documents using Template 21.1–21.6 | PATCH-03 grammar change is backward-compatible: contracts already authored with `stage_a`, `stage_b`, `stage_c`, or `all` are unaffected. No existing conforming contract used `stage_b+` syntax; the shorthand was definitional only. |
| AI coding agents parsing §18B.2 grammar | Grammar is now unambiguously enumerated. No agent that previously parsed the grammar correctly is broken. Agents that previously parsed `stage_b+` as a literal token will now parse the unambiguous `stage_b \| stage_c` form. |
| Conformance checking tools or scripts using CHK-xxx | Unaffected — no CHK items changed. |

### 3.5 Recommended Follow-On Actions (Not Part of This Patch)

The following are advisory only. None block Doc-4A freeze:

1. **Structure patch** — Update `Doc-4A_Structure_v1.0_FROZEN.md §21` to formally register Templates 21.3–21.6 as normative specializations; update Appendix B title from "Reserved Namespace Registry" to "Standard Error Catalog & Reserved Namespace Registry"; update Appendix C title from "Cross-Reference Index" to "Contract Authoring Checklist."
2. **Deferred Structure templates** — Author the Structure's RECOMMENDED Internal Service Contract Template (21.3 per Structure numbering) and Event Schema Declaration Template (21.4 per Structure numbering) as a future Doc-4A patch.
3. **Full cross-reference index** — Produce the cross-reference index table described in the Structure's Appendix C purpose, mapping every Doc-4A binding point to its corpus source.

---

## §4 — Self-Review

*All findings classified BLOCKER / MAJOR / MINOR / NITPICK. All BLOCKER and MAJOR resolved before this output.*

### BLOCKER Findings

None identified.

### MAJOR Findings

None identified. The three structural deviations (template registry, Appendix B/C titles) that were MAJOR in the Pass 5 self-review are addressed by this patch's governance notes and are downgraded to accepted-with-documentation-alignment.

### MINOR Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P501-m1 | §3 Follow-On Actions | Structure patch recommended but not produced in this document. If the Structure patch is not executed before the Doc-4A Freeze Board convenes, the deviation will persist as a known item. | Accepted — follow-on actions are advisory; they do not block Doc-4A freeze. The governance notes in Pass 5 provide the bridge. Recorded as open action item in §3.5. |

### NITPICK Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P501-n1 | PATCH-03 | The grammar form `stage_b \| stage_c` inside a backtick-delimited grammar block could theoretically be read as two separate OR-pipe alternatives rather than a compound two-stage declaration. In context (the grammar shows all five valid values separated by `\|`) this is unambiguous, but a parenthesized form `(stage_b \| stage_c)` would be maximally explicit. | Accepted — the existing `\|` notation is consistent throughout all grammar blocks in Doc-4A; introducing parentheses only in this one grammar line would be inconsistent. Accepted as-is. |
| P501-n2 | §3.5 | Follow-on actions §3.5.2 and §3.5.3 (deferred Structure templates and cross-reference index) were also open items from the original Pass 5 self-review. This patch does not resolve them. | Accepted — deferred items are correctly identified as outside this patch scope. They are restated here for completeness. |

---

*Doc-4A Pass 5 Patch v1.0.1 — 0 BLOCKER, 0 MAJOR, 1 MINOR (accepted), 2 NITPICK (accepted). All patches applied to `Doc-4A_Content_v1.0_Pass5.md`. Status: **PASS 5 FREEZE CANDIDATE — PATCH APPLIED**.*
