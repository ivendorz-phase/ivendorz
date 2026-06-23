# Doc-5 — Implementation Contracts Program — Governance Note v1.0

| Field | Value |
|---|---|
| **Document ID** | `Doc-5_Program_Governance_Note_v1.0` |
| **Status** | APPROVED (Architecture Board approval complete; program-governance authority for the Doc-5 Implementation Contracts family) |
| **Scope** | Establishes the **Doc-5 Implementation Contracts program** — its purpose, authority, source-of-truth placement, family structure, and amendment / conformance / escalation / freeze rules. Governs *production discipline* only. Authors **no** contract, schema, UI, test, API endpoint, or code. |
| **Conforms To** | `Master_System_Architecture_v1.0_FINAL` · `ADR_Compendium_v1` · Doc-2 **v1.0.3** (`Doc-2_..._v1.0.2` + `Doc-2_Patch_v1.0.3`) · Doc-3 **v1.0.2** (`Doc-3_..._v1.0.1` + `Doc-3_Patch_v1.0.2` + `Doc-3_Policy_Key_Registration_Patch_v1.0`) · Doc-4A effective state: `Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6 (`Doc-4A_Content_v1.0_Pass1…Pass6`) · Doc-4B…4M v1.0 (`Doc-4_SERIES_FROZEN_v1.0`) — all FROZEN |
| **Contains** | Program purpose · authority hierarchy (by pointer) · source-of-truth hierarchy · Doc-5 family structure (pattern only) · amendment / conformance / escalation / freeze rules. **Does NOT contain** API endpoints, DB tables, frontend specs, test cases, or any restated architecture. |
| **Audience** | Architecture Board · contract authors (human + AI) · AI Coding Supervisor · implementation-governance reviewers |
| **Authoring posture** | **Reference-never-restate.** Every architectural fact is bound by pointer to its frozen owner; nothing is copied, summarized, reinterpreted, or invented. |

---

## 1. Program Purpose

The architecture program is **COMPLETE and FROZEN**: the Master System Architecture, the ADR Compendium, Doc-2, Doc-3, and the full Doc-4 contract family (Doc-4A metastandard + Doc-4B…4M) are ratified. The project has entered **Implementation Governance**.

The **Doc-5 Implementation Contracts program** is the bridge between the frozen architecture and executable code: it produces the concrete, implementable contracts an engineering team (human + AI agents) builds against. Doc-5 covers the **API contract surface**; its sibling programs are Doc-6 (Database), Doc-7 (Frontend), and Doc-8 (Tests).

This note is **non-architectural**. It introduces no module, ownership, governance signal, state transition, permission slug, event, audit action, or POLICY key. It governs *how* the Doc-5 family is produced, reviewed, frozen, amended, and escalated — and **may never override any frozen document**. On any conflict, the frozen document prevails and this note (and any offending downstream draft) is corrected.

---

## 2. Authority Hierarchy

The binding authority order is owned by **`generatedDocs/00_AUTHORITY_MAP.md`** (mirrored in `CLAUDE.md`). It is reproduced here **by pointer**, not re-decided; on any disagreement the authority map wins and this section is patched to match.

| Rank | Authority |
|---|---|
| 0 | **Frozen Architecture Corpus** (Master Architecture · Doc-2 · Doc-3 · Doc-4A…4M) — *immutable* |
| 1 | **ADR Compendium** — *immutable* |
| 2 | Virtual CTO |
| 3 | Enterprise Architect |
| 4 | DDD Architect |
| 5 | API Governance Board |
| 6 | Security Architect |
| 7 | Engineering |
| 8 | Product |
| 9 | AI Skills |

**Load-bearing rule (per `00_AUTHORITY_MAP.md`):** ranks 0–1 are immutable to all skills and roles — *including the Virtual CTO*. Changing them requires an additive architecture patch with **human approval** (`Master_System_Architecture_v1.0_FINAL` §22.7 — Build Governance for AI Agents), never a skill or agent decision. The Doc-5 program is authored under ranks 2–9 and is bound by ranks 0–1.

> **Note:** The table above is an informational reproduction for operational clarity. `00_AUTHORITY_MAP.md §1` is authoritative; on any disagreement it prevails and this section is patched to match.

---

## 3. Source Of Truth Hierarchy

Documents rank by precedence as follows. `Master_System_Architecture_v1.0_FINAL` is the **CANONICAL single source of truth**; the Doc-5 family sits **below Doc-4A and above implementation**, extending the chain ratified in `Doc-4_Governance_Note_v1.0` by exactly one level.

```
Master System Architecture        (CANONICAL — single source of truth)
   └─ ADR Compendium
        └─ Doc-2  ·  Doc-3
             └─ Doc-4A  (API metastandard — governs Doc-4B…4M)
                  └─ Doc-4B…4M  (conform to Doc-4A)
                       └─ Implementation Contracts   (Doc-5 API · Doc-6 DB · Doc-7 Frontend · Doc-8 Tests)
                            └─ Code
```

Binding consequences for every Doc-5 document:

1. **Conformance is mandatory, not advisory.** A Doc-5 document that contradicts any higher document fails review and may not be frozen.
2. **Reference-never-restate.** Entities (Doc-2 effective v1.0.3 §2 Aggregate Design / §3 Entity Catalog), permission slugs (Doc-2 effective v1.0.3 §7 Permission Mapping), events (Doc-2 effective v1.0.3 §8 Event Ownership Mapping / Doc-4J authoritative event catalog), audit actions (Doc-2 effective v1.0.3 §9 Audit Mapping), state machines (Doc-4M — authoritative lifecycle/state authority), POLICY keys (Doc-3 effective v1.0.2 §12 Policy Configuration Layer / `core.system_configuration`), and all Doc-4A standards (effective state: Structure + Content Pass-1…Pass-6) are bound **by pointer**, never duplicated.
3. **No re-decision.** Implementation contracts *realize* architectural decisions; they never reopen or remake them. Where the architecture is silent, the gap is **escalated** (§7), never resolved locally.

---

## 4. Doc-5 Family Structure

Doc-5 realizes the architecture's API surface as concrete, implementable contracts. It follows the proven corpus shape — a **realization metastandard first**, then the contracts that conform to it, then cross-cutting indexes — each artifact authored and frozen under §8 and conforming to Doc-4A.

- **Doc-5A — API Standards** is authored and frozen **first**: the API-realization metastandard every later Doc-5 artifact conforms to.
- The remaining Doc-5 artifacts (per-module API contracts and cross-cutting integration / state-machine surfaces) are authored only after Doc-5A freezes.

**The exact family composition — how many artifacts, their identifiers, and the artifact-to-module allocation — is NOT decided here.** It is established by the `Doc-5A Structure Proposal` and ratified at the Doc-5A structure freeze. This note fixes the *pattern and ordering*, not the document architecture.

**Doc-4A ↔ Doc-5A boundary (load-bearing):** Doc-4A is the abstract, implementation-neutral metastandard (*what* a contract declares — ownership, authorization, validation order, error taxonomy, event/audit declarations, canonical templates); Doc-5A is the realization metastandard (*how* those contracts become concrete, callable APIs), conforming to Doc-4A and never restating or contradicting it. Doc-5A re-decides nothing frozen upstream.

---

## 5. Amendment Rules

1. After freeze, a Doc-5 document changes **only through an approved additive patch** of minimal scope. A frozen document is **never reopened or rewritten**.
2. The effective state of a document is **base + all approved patches**; implementation reads both.
3. A module contract may **never locally deviate** from Doc-5A as a substitute for a patch.
4. **Reserved API namespaces** (API namespace prefixes, error-code mappings, surface-version identifiers) are allocated **only by Doc-5A amendment**, never by module-document invention — mirroring the Doc-4A Appendix B (Reserved Namespace Registry) discipline.
5. **Patch-citation obligation:** downstream documents cite patched sources by base document pointer plus patch identifier (e.g. base document + patch ID), so references survive integration. Doc-5A §3 (canonical terminology) will establish the authoritative patch-identifier naming convention for the Doc-5 program.
6. Any amendment that would touch architecture, an ADR, a module boundary, a governance invariant, or a frozen contract is **out of scope for this program** and requires the rank 0–1 human-approval path (§7).

---

## 6. Conformance Rules

1. **Doc-5A is the conformance authority for the Doc-5 family.** Before any Doc-5 module contract may freeze, it must pass the **Doc-5A API Conformance Checklist**: a machine-executable checklist with stable identifiers, binary (pass/fail) results, and each check naming its authoritative source. The checklist's name, location, and identifier format are established by the Doc-5A Structure Proposal and review — mirroring the role of Doc-4A's conformance checklist for the Doc-4 family.
2. The checklist is **executable by CI and AI agents** and gates the freeze of every downstream Doc-5 document. A failing check **blocks freeze**.
3. Conformance is **transitive**: passing Doc-5A does not waive conformance to Doc-4A and the upstream corpus — a Doc-5 document must satisfy the entire source-of-truth chain (§3).
4. Conformance is checked at each lifecycle gate (§8), not only at final freeze.

---

## 7. Escalation Rules (Flag-and-Halt · Never Invent)

If authoring a Doc-5 document requires a permission slug, event, state transition, audit action, POLICY key, entity, or contract field that does **not** exist in the frozen corpus:

1. **Halt.** Do not invent it. Do not approximate it. Do not resolve it locally.
2. **Cite both sources** — the need (the Doc-5 location) and the gap (the missing element) — and **carry a named escalation marker** to the owning frozen document's channel.
3. **Resolution is additive at the owning document** (a corpus patch), never local, never by reopening a frozen doc.
4. Any Doc-5 artifact that touches architecture, an ADR, a module-ownership boundary, a governance invariant, or a frozen contract requires **human approval** — AI Coding Supervisor sign-off does **not** substitute (`Master_System_Architecture_v1.0_FINAL` §22.7).

This discipline binds to the AI-agent guardrails in `CLAUDE.md` (AI Agent Rules · Red Flag Checklist).

---

## 8. Freeze Rules

Every Doc-5 document follows the corpus-established staged-freeze discipline (`project_details.md` §10 — Document Production Methodology). The diagram below is an operational adaptation that names steps consistently with actual corpus practice; `project_details.md §10` is authoritative on any disagreement.

```
Structure Proposal → Independent Hard Review → Structure Patch → Structure FROZEN
  → Content Pass-A → Hard Review → Pass-A Patch → Patch Verification → Approved
  → Content Pass-B (hardening) → Hard Review → Pass-B Patch → Patch Verification
  → Freeze Audit → FROZEN
```

1. A document may freeze **only with no open BLOCKER / MAJOR / MINOR**. NITPICKs are deferrable and carried forward.
2. **Each step is a separate deliverable**; stages are not skipped.
3. **Carried dependencies** (gaps surfaced against a frozen document) are resolved **additively** (§5, §7) — never by reopening a frozen document.
4. Each freeze produces a consolidated `_FROZEN` artifact (base + approved patches merged, review/patch commentary stripped, anchors verified verbatim).
5. **Ordering:** Doc-5A freezes first. Later Doc-5 artifacts **must conform to Doc-5A** (Doc-5A is the conformance authority for the Doc-5 family only). The sibling Doc-6 / Doc-7 / Doc-8 programs are authored after Doc-5A and their contracts must be **consistent with the API surface established by the Doc-5 program** — but Doc-5A does not have conformance authority over those programs. Planning for Doc-6/7/8 may proceed in parallel (not hard-blocked).
6. This note is a **Governance Note** and terminates at **APPROVED** (precedent: `Doc-4_Governance_Note_v1.0`), not FROZEN; it is maintained additively as the program evolves.

**Authorized next deliverable:** `Doc-5A — API Standards`, beginning at the **Structure Proposal** step, then Independent Hard Review → Structure Patch → Structure FROZEN.

---

*End of Doc-5 Program Governance Note v1.0. Non-architectural; additive; binds to the frozen corpus by pointer and never overrides it.*
