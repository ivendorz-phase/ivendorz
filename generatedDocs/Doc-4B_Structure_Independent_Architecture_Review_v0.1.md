# Independent Architecture Review — Doc-4B Structure Proposal v0.1 & Doc-4 Family Map Conflict Escalation v0.1

**Review Board:** Principal Enterprise Architect · Principal API Governance Architect · Principal Module Boundary Architect · Principal AI-Agent Systems Reviewer  
**Review Date:** 2026-06-13  
**Documents Under Review:**
- `Doc-4B_Structure_Proposal_v0.1.md` (primary)
- `Doc-4_FamilyMap_Conflict_Escalation_v0.1.md` (secondary)

**Corpus Consulted (FROZEN):**
- Master_System_Architecture_v1.0_FINAL.md
- ADR_Compendium_v1.md (ADR-001–ADR-020 + all amendments)
- Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md (+ Patches v1.0.2, v1.0.3)
- Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md (+ Patch v1.0.2)
- Doc-4A v1.0 FROZEN: Passes 1–6 + Pass 3/4/5/6 Patches + FreezeAudit Patch v1.0.1
- Doc-4_Governance_Note_v1.0.md

**Review Scope:** Structure freeze candidacy. No contract content evaluated; no business logic evaluated; no implementation detail evaluated. All findings are against the structure, scope, boundary, template-binding, and authoring-safety properties of the document.

**Posture:** Defect-finding only. Every ambiguity that will be inherited by Pass-A authors and AI coding agents is treated as a risk.

---

## Executive Summary

### Doc-4 Family Map Conflict Escalation v0.1

This document is architecturally clean. The conflict was correctly identified, authoring was correctly halted per Doc-4A §0.6, the three resolution options are accurately cited and scoped, and the Board's selection of Option B is correctly recorded. The natural dependency-ordering rationale for Option B (Module 0 before Module 1, since all other modules bind to Module 0 services) is sound. No findings against this document.

### Doc-4B Structure Proposal v0.1

The structure is well-formed and architecturally disciplined. Module 0 scope is correctly fixed to the five Doc-2 §3.1 infrastructure entities. No business logic is introduced. The infrastructure-only rule is properly stated and restated at every relevant section. The shared-kernel-abuse prohibition is explicit and correctly grounded. All section descriptions stay within Module 0 boundaries and bind to frozen sources by pointer. The two structural dependencies (D-1, D-2) that require Board resolution before Pass-A are correctly identified and routed.

Two MAJOR findings prevent immediate freeze. Both are editorial — they require no structural change, no boundary change, and no architectural decision. One MINOR finding requires a clarification in the outbox dispatcher framing before Pass-A authors are sent to work. All three are patchable in a single amendment document.

---

## Freeze Recommendation

**APPROVE WITH PATCHES**

Resolve F-01 and F-02 (MAJOR) before freeze. Resolve F-03 (MINOR) in the same amendment. The structural content is sound and can proceed to Pass-A authoring after the patch. Do not proceed to Pass-A under the current version.

---

## Counts

| Severity | Doc-4B Structure | Family Map Escalation |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 2 | 0 |
| MINOR | 1 | 0 |
| NITPICK | 2 | 0 |
| **Total** | **5** | **0** |

---

## Findings

---

### F-01 | MAJOR | Header Conformance Claim | Frozen Corpus Citation Is Incomplete — Pass 6 Patch v1.0.1 and Earlier Pass Patches Are Not Cited

**Affected Section:** Header table, `Conforms To` field

**Explanation:**

The Doc-4B header states: "Doc-4A v1.0 (FROZEN: Pass1–Pass6 + FreezeAudit Patch v1.0.1)."

The frozen Doc-4A corpus consists of more than this. The complete citation is:
- Pass 1–6 (content)
- Pass 3 Patch v1.0.1
- Pass 4 Patch v1.0.1
- Pass 5 Patch v1.0.1
- **Pass 6 Patch v1.0.1** (`Doc-4A_Pass6_Patch_v1.0.1.md`) — **entirely absent from the claim**
- FreezeAudit Patch v1.0.1

The Pass 6 Patch v1.0.1 resolves ten findings (P6-B01 through P6-Min10) and applies normative changes to §22.1, §22.3, Annexure A, B, D, F, and I. Among its substantive changes:

- **P6-B01** — mandates `reference_id` in every contract's Template 21.1 Response Contract block (the mandate that Doc-4B §3 references by the finding code "P6-B01")
- **P6-B02** — prohibits TBD placeholder syntax in contract fields; replaces it with an omission + BLOCKER self-review finding procedure
- **P6-M03** — expands the protected-fact filter exclusion list from 3 items to 5 categories
- **P6-M04** — replaces implementation-prescribing filter semantics ("OR within / AND across") with implementation-neutral language
- **P6-Min10** — promotes event consumer Tolerant Reader pattern from convention to binding obligation

Pass-A authors reading Doc-4B's conformance claim will believe the frozen corpus ends at the FreezeAudit Patch. They will not consult the Pass 6 Patch and will miss the Response Contract `reference_id` mandate, the POLICY key gap procedure, the filter protected-fact requirements, and filter evaluation semantics. An AI coding agent authoring contracts from this structure will inherit all these gaps.

Additionally, Pass 3 Patch v1.0.1, Pass 4 Patch v1.0.1, and Pass 5 Patch v1.0.1 are also absent from the citation. These are earlier corrections to the frozen corpus. Their absence is less critical (they affect content far from Module 0) but the citation should be complete.

**Recommended Resolution:**

Update the header `Conforms To` field to the complete frozen corpus citation:

```
Doc-4A v1.0 (FROZEN: Pass1–Pass6 + Pass3 Patch v1.0.1 + Pass4 Patch v1.0.1 + Pass5 Patch v1.0.1 + Pass6 Patch v1.0.1 + FreezeAudit Patch v1.0.1)
```

Also update the Self-Review table at the end of the document to add a check: "Conformance claim cites all known pass-level patches in the frozen Doc-4A corpus."

---

### F-02 | MAJOR | §3 Shared Infrastructure Obligations | `reference_id` Binding Uses a Finding Code as a Normative Pointer — Violates Doc-4A §3 Citation Standard

**Affected Section:** §3 (Shared Infrastructure Obligations), last sentence of the purpose block

**Explanation:**

§3 states: "The `reference_id` linkage (Doc-4A §12/§17, **P6-B01**) is the connective tissue and is described here as a Module 0 concern."

"P6-B01" is a finding code from the Pass 6 Independent Architecture Review — it is not a section reference in the frozen Doc-4A corpus. The authoritative source for the `reference_id` Response Contract mandate is:

> `Doc-4A §22.1, Correction C-05, as amended by Pass 6 Patch v1.0.1 P6-B01`

Doc-4A §3 (Canonical Terminology, Naming & Notation Standard) specifies the patch citation standard: "how Doc-4 documents cite patched sources (always cite the base document + patch ID, e.g., 'Doc-2 §5.4 as amended by PATCH-D2-01'), so contract references survive future patch integration."

Using a review-finding code ("P6-B01") as a pointer violates this citation standard in two ways:

1. A Pass-A author or AI coding agent reading the pointer "P6-B01" cannot resolve it to a corpus section without consulting the review document — which is not part of the authoritative corpus. Review documents are input to patches; patches are what enter the corpus.

2. Even if the Pass 6 Patch is located, the correct resolution path for the author is the amended §22.1 C-05 text — not the patch document's problem summary.

This finding is compounded by F-01: the Pass 6 Patch is not in the conformance claim, so "P6-B01" is doubly unresolvable for authors following only the cited corpus.

**Recommended Resolution:**

Replace:

> "The `reference_id` linkage (Doc-4A §12/§17, P6-B01) is the connective tissue and is described here as a Module 0 concern."

With:

> "The `reference_id` linkage (Doc-4A §22.1 C-05, as amended by Pass 6 Patch v1.0.1 P6-B01, and §17.2) is the connective tissue and is described here as a Module 0 concern."

---

### F-03 | MINOR | §5.2 Outbox Dispatcher | "State Machine Effects over the existing lifecycle" Framing Is Inconsistent with Doc-2 §2's "Append-Only Stream" Characterization

**Affected Section:** §5.2 (Outbox Dispatcher), specifically the State Machine Effects attribution

**Explanation:**

§5.2 states: "declares State Machine Effects over the **existing** `core.outbox_events` lifecycle `pending → dispatched → archived` (Doc-2 §3.1, §10.1) — introduces no new transition (Doc-4A §13)."

Doc-4A §13 governs interaction with "frozen state machines (Doc-2 §5 + patches)." State machines in the frozen corpus live in Doc-2 §5. The citation in §5.2 is to Doc-2 §3.1 (Domain Map) and §10.1 (Database Blueprint / table column specification) — not §5 (State Machines). This discrepancy is meaningful.

Doc-2 §2 (Aggregate Design, Module 0) explicitly states:

> "`audit_records` and `outbox_events` are **append-only streams**; `system_configuration` and `feature_flags` are keyed configuration. **No business aggregate exists here, by rule.**"

An "append-only stream" is not a state machine entity. Doc-4A §13 defines State Machine Effects as transitions within "frozen state machines (Doc-2 §5 + patches)." If `core.outbox_events` has no state machine entry in Doc-2 §5, the outbox dispatcher contract cannot correctly declare a `State Machine Effects` block under §13.

The dispatcher updates the `status` column of `core.outbox_events` rows (`pending → dispatched → archived`). This is a status-column mutation on an infrastructure table, not a §13 state machine transition. The correct contract grammar for the dispatcher would be:
- `State-Machine-Effects: none` (no Doc-2 §5 state machine governs the outbox)
- `Mutation-Scope: core.outbox_events (status column: pending → dispatched; dispatched → archived)` (infrastructure mutation, declared in the Mutation-Scope field under §17)

If Pass-A authors follow §5.2's framing, they will attempt to declare a State Machine Effects block referencing a lifecycle that is not in Doc-2 §5, which will fail CHK-143 ("State Machine Effects transition exists in Doc-2 §5"). Alternatively, they may search Doc-2 §5 for an outbox state machine, fail to find it, and create an incorrect contract without the mutation scope declaration.

**Recommended Resolution:**

Replace in §5.2:

> "declares State Machine Effects over the **existing** `core.outbox_events` lifecycle `pending → dispatched → archived` (Doc-2 §3.1, §10.1) — introduces no new transition (Doc-4A §13)"

With:

> "declares **no** Doc-4A §13 State Machine Effects (Doc-2 §2: `core.outbox_events` is an append-only stream; no business aggregate and no §5 state machine exist for it); the dispatcher's status-column updates (`pending → dispatched → archived`, per Doc-2 §10.1 table schema) are declared in the Mutation-Scope field under the §17 Audit Requirements block — not as state machine transitions; confirms this contract introduces no new lifecycle state (Doc-2 §10.1 column values are fixed; any new status value requires a Doc-2 patch)"

Also update the Source bindings for §5.2 to replace the §13 reference with a note that §13 is not applicable for this contract type.

---

### F-04 | NITPICK | Appendix C D-1 | Recommended Option B Composition Path Does Not Acknowledge the Template 21.5 Carve-Out That Governs the Primary Phase-2 Contract

**Affected Section:** Appendix C, D-1 (Deferred Templates)

**Explanation:**

D-1 recommends composing existing templates for Module 0's internal services (Option B) rather than formalizing the deferred Internal Service Contract template (Option A). The outbox dispatcher (§5.2) is Module 0's primary Phase-2 System Actor contract and will be authored against Template 21.5.

The FreezeAudit Patch v1.0.1 PATCH-FA-01 establishes a carve-out that directly governs Template 21.5 contracts: Phase-2 System Actor contracts have `Response: none` and are exempt from the `reference_id` Response Contract binding. Audit traceability for Template 21.5 is satisfied through `Correlation: phase2-origin` in the Audit Requirements block.

D-1 does not acknowledge this carve-out. A Pass-A author reading D-1 for guidance on composing existing templates for Module 0's Phase-2 contracts may not know that the dispatcher's authoring constraints differ from Template 21.1 (the base endpoint template). Without this callout, the first time the carve-out becomes relevant is when the Pass-A author arrives at the dispatcher contract and must independently discover it from the FreezeAudit Patch.

**Recommended Resolution:**

Add a note to D-1 after the recommendation for Option B: "Note for Pass-A authors using Template 21.5 for the outbox dispatcher (§5.2): per FreezeAudit Patch v1.0.1 PATCH-FA-01, Template 21.5 contracts have `Response Contract [OMIT]` and are exempt from the §22.1 C-05 `reference_id` Response Contract mandate. Audit traceability is satisfied by `Audit-Required: yes; Correlation: phase2-origin` in the Audit Requirements block."

---

### F-05 | NITPICK | Self-Review Table | Corpus Citation Completeness Not Explicitly Checked

**Affected Section:** Self-Review table (end of document)

**Explanation:**

The self-review table checks "Binds to frozen Doc-4A standards by pointer (reference-never-restate)" — PASS. However, it does not include a check for whether the header's conformance claim accurately and completely identifies the frozen corpus it was authored against. F-01 above demonstrates that this check would catch the missing patch citations.

Given that the conformance claim is the primary navigation guide for Pass-A authors and AI coding agents, its completeness is as important as the structural content's adherence to standards.

**Recommended Resolution:**

Add to the self-review table: "Conformance claim identifies all frozen corpus patch documents (Pass-level patches + FreezeAudit Patch)" — verify before freeze.

---

## Doc-4 Family Map Conflict Escalation v0.1 — Review

No findings. The document correctly identifies the authorization conflict, correctly halts authoring under Doc-4A §0.6, presents all three resolution options with accurate corpus citations, and records the Board's Option B selection. The rationale for Option B (natural dependency ordering: Module 0 services are consumed by Module 1 contracts) is architecturally sound and correctly noted in §8. The constraint that "no frozen document is amended by this record" is satisfied. The escalation document is architecturally clean and may be treated as closed.

---

## Review Against All 10 Domains

| Domain | Result | Finding(s) |
|---|---|---|
| 1. Family Map Conformance | PASS | — Doc-4B correctly maps to Module 0 per Doc-4A §1.3, ADR-017 R Amendment A, Doc-2 §0.3 |
| 2. Module Boundary Integrity | PASS | — All five owned entities exact per Doc-2 §3.1; no non-Module-0 entity claimed |
| 3. Shared Kernel Abuse Prevention | PASS | — Infrastructure-only rule stated and restated at §1, §7.2, §8.2, §9; governance-signal firewall explicit at §4B and §9 |
| 4. Ownership Integrity | PASS | — No new entity introduced; no ownership re-assignment; §5.5 correctly defers per-event 21.2 contracts to producing modules per §4.4 |
| 5. Template Selection Correctness | PASS (with F-03 risk) | — 21.3 Query for reads, 21.5 System Actor for Phase-2 workers, 21.6 Admin for mutations are correctly mapped; F-03 complicates the dispatcher's State Machine Effects declaration |
| 6. Dependency Resolution Readiness | PASS | — D-1 (deferred templates) and D-2 (permission slug) correctly identified and routed; no dependency invented around or suppressed |
| 7. Future Pass-A Authoring Risk | MAJOR | — F-01 (missing patch citation) and F-02 (non-standard reference_id pointer) are risks an AI coding agent inherits |
| 8. AI-Agent Authoring Safety | MAJOR | — F-01 and F-02 directly affect AI-agent corpus navigation; an agent that reads only the header conformance claim will miss the Pass 6 Patch's binding obligations |
| 9. Cross-Module Contract Consistency | PASS | — Single-authorship rule applied correctly (§5.5); Module 0 mechanisms vs Module 0 contracts correctly separated in §3 |
| 10. Structure Freeze Readiness | CONDITIONAL | — Content is sound; F-01 and F-02 must be resolved before freeze; F-03 must be clarified to prevent Pass-A authoring error |

---

## Mandatory Patch List

All findings are editorial corrections requiring no structural change, no boundary change, no new entity, no new event, no new permission, and no architectural decision.

---

### Patch P4B-M01 — Complete Frozen Corpus Citation in Header

Addresses: F-01

Update the `Conforms To` header field:

**Before:**
```
Doc-4A v1.0 (FROZEN: Pass1–Pass6 + FreezeAudit Patch v1.0.1)
```

**After:**
```
Doc-4A v1.0 (FROZEN: Pass1–Pass6 + Pass3 Patch v1.0.1 + Pass4 Patch v1.0.1 + Pass5 Patch v1.0.1 + Pass6 Patch v1.0.1 + FreezeAudit Patch v1.0.1)
```

Add a corresponding check to the Self-Review table: "Conformance claim identifies all frozen corpus patch documents" — PASS.

---

### Patch P4B-M02 — Correct §3 `reference_id` Citation to Canonical Section Reference

Addresses: F-02

In §3 (Shared Infrastructure Obligations), purpose block, last sentence:

**Before:**
```
The `reference_id` linkage (Doc-4A §12/§17, P6-B01) is the connective tissue and is described here as a Module 0 concern.
```

**After:**
```
The `reference_id` linkage (Doc-4A §22.1 C-05 as amended by Pass 6 Patch v1.0.1 P6-B01, and §17.2) is the connective tissue and is described here as a Module 0 concern.
```

---

### Patch P4B-m01 — Correct §5.2 Outbox Dispatcher State Machine Effects Framing

Addresses: F-03

In §5.2 (Outbox Dispatcher), purpose block, second bullet point:

**Before:**
```
declares State Machine Effects over the **existing** `core.outbox_events` lifecycle `pending → dispatched → archived` (Doc-2 §3.1, §10.1) — introduces no new transition (Doc-4A §13)
```

**After:**
```
declares **no** Doc-4A §13 State Machine Effects — Doc-2 §2 characterizes `core.outbox_events` as an append-only stream with no business aggregate and no §5 state machine; the dispatcher's status-column transitions (`pending → dispatched → archived`, defined in Doc-2 §10.1 table schema) are operational-entity field updates declared in the Mutation-Scope field under the §17 Audit Requirements block, not as state machine transitions; no status value is invented — all values are from the Doc-2 §10.1 schema (new status values require a Doc-2 patch per Doc-4A §13)
```

Update the Source bindings line for §5.2 to remove the §13 reference and add: "Note: §13 does not apply — no §5 state machine governs `core.outbox_events`."

---

## Can Doc-4B Structure Be Frozen and Moved to Pass-A Authoring?

**Not yet. Apply the three patches above first. After the patches: yes.**

The structural content is sound. The scope is correct. The boundaries are enforced. The shared-kernel discipline is explicit and well-grounded. The dependencies requiring Board resolution (D-1, D-2) are correctly identified and routed. The reference-never-restate discipline is applied throughout. No business logic is present. No new entity, event, permission, or state machine is introduced.

The two MAJOR findings (F-01, F-02) are both citation-accuracy problems, not architectural failures. They prevent freeze only because they will cause Pass-A authors and AI coding agents to follow an incomplete or non-standard corpus navigation path. Both are fixable in a single line-edit to the header and a single sentence-edit to §3.

The MINOR finding (F-03) is a framing issue in §5.2 that will cause the outbox dispatcher contract to be incorrectly authored in Pass-A unless clarified now. It is fixable with a sentence-level edit.

Once the three patches are applied and re-issued as `Doc-4B_Structure_v0.2.md` (or equivalent), the Architecture Board may freeze the structure and authorize Pass-A authoring. The two Appendix C dependencies (D-1 and D-2) must be resolved at or before the Pass-A freeze gate as documented.

---

*End of Independent Architecture Review — Doc-4B Structure Proposal v0.1 & Doc-4 Family Map Conflict Escalation v0.1.*  
*Recommendation: APPROVE WITH PATCHES. 0 BLOCKERs, 2 MAJORs, 1 MINOR, 2 NITPICKs. All findings are editorial; no structural redesign required.*
