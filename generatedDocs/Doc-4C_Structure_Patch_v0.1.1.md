# Doc-4C — Structure Clarification Patch v0.1.1

| Field | Value |
|---|---|
| Patch ID | Doc-4C-Structure-Patch-v0.1.1 |
| Applies To | `Doc-4C_Structure_Proposal_v0.1.md` |
| Patch Authority | Architecture Board Directive — accepted independent structure-review findings SP-01, SP-02, SP-03, SP-04 |
| Patch Type | **Structure-level clarification only.** No architecture redesign, scope expansion, new business capability, module-boundary, ownership, entity, permission, event, workflow, state-machine, or template change. Doc-4A and Doc-4B are not modified; the Family Map is not altered. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 — Platform Core / Shared Kernel (Board-authorized corpus) |
| Family Map | **Unchanged** — Doc-4C = Identity & Organization (Module 1) |
| Status | **DOC-4C STRUCTURE FREEZE CANDIDATE — clarification patch** |

---

## §2 — Patch Authority

This patch is issued by the iVendorz Architecture Board to resolve the four accepted findings of the independent structure review of `Doc-4C_Structure_Proposal_v0.1.md` (SP-01, SP-02, SP-03, SP-04). It is a **structure-level clarification patch only** — it corrects governance wording and adds two AI-agent-safety clarifications. It resolves no dependency (DC-1…DC-5 remain open for the freeze gate), introduces no event or integration contract, and changes no behavior, ownership, or boundary. Doc-4A and Doc-4B are not reopened; the Family Map is unchanged.

The authoritative corpus is taken as already reviewed and understood; this patch applies only the accepted structure-review corrections.

---

## §3 — Scope Statement

This patch modifies the following locations in `Doc-4C_Structure_Proposal_v0.1.md` only:

| Location | Change | Finding |
|---|---|---|
| Header `Conforms To` field | Governance-safe wording for the Doc-4B reference (remove premature bare-"FROZEN" assertion) | SP-01 |
| §C2 — Conformance & Template Binding (D-1 reference + Source bindings) | Correct D-1 status to **Board Decision Pending** | SP-02 |
| §C3 — Shared Identity Services (purpose block) | Add authoritative-authorization-source clarification | SP-03 |
| §C2 — Conformance & Template Binding; Appendix C DC-1 | Add Template 21.2 / DC-1 Pass-A guardrail | SP-04 |

No other content is modified. No section is added or removed. No dependency is resolved. Optional editorial cleanup (§4 note) is applied only where semantic-neutral.

---

## §4 — Patch Entries

---

### PATCH-4CS-01 — Resolve SP-01: governance-safe wording for the Doc-4B reference

| Field | Value |
|---|---|
| Patch ID | PATCH-4CS-01 |
| Finding Reference | SP-01 |
| Affected Section | Header `Conforms To` field |

**Issue:** The header asserts "**Doc-4B v1.0 (FROZEN — Platform Core / Shared Kernel)**". A downstream module document should not itself assert another document's canonical freeze status as an established fact; the freeze declaration is the Architecture Board's act. The reference must be governance-safe — citing the Board-authorized corpus rather than a bare "FROZEN" status claim — without altering the dependency on Doc-4B.

**Correction:** In the header `Conforms To` field, replace:
```
Before:
… Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN — Platform Core / Shared Kernel)

After:
… Doc-4A v1.0 (FROZEN), Doc-4B v1.0 — Platform Core / Shared Kernel (Board-authorized authoritative corpus: `Doc-4B_Content_v1.0_PassB.md` + `Doc-4B_Freeze_Patch_v1.0.1.md` + `Doc-3_Policy_Key_Registration_Patch_v1.0.md`; canonical freeze status as declared by the Architecture Board)
```

**Rationale:** Governance-safe wording: Doc-4C references the Board-authorized Doc-4B corpus and attributes the freeze status to the Board, rather than asserting it independently. The dependency on Doc-4B (and the precedence chain) is unchanged; ownership is untouched. `Doc-4A v1.0 (FROZEN)` is retained — Doc-4A's canonical freeze is long-established and is not in scope for SP-01.

---

### PATCH-4CS-02 — Resolve SP-02: D-1 status is Board Decision Pending

| Field | Value |
|---|---|
| Patch ID | PATCH-4CS-02 |
| Finding Reference | SP-02 |
| Affected Section | §C2 — Conformance & Template Binding (D-1 reference and Source bindings) |

**Issue:** §C2 states the internal-service composition uses "the **D-1 composition convention** (**Board-APPROVED for Doc-4B**; reused here …)". Characterizing D-1 as Board-approved is inconsistent with the current canonical governance status of D-1, which remains **Board Decision Pending**. Doc-4C must maintain governance consistency and must not assert a final D-1 ratification.

**Correction:**

(1) In §C2, replace the D-1 sentence:
```
Before:
… internal services (if any) use the D-1 composition convention (Board-APPROVED for Doc-4B; reused
here — 21.3/21.4 with `Audience: internal-service`, no new template).

After:
… internal services (if any) use the D-1 composition convention (governance status: Board Decision
Pending; applied here as the interim composition approach consistent with the Doc-4B precedent —
21.3/21.4 with `Audience: internal-service`, no new Doc-4A template). Doc-4C neither relies on nor
asserts a final D-1 ratification; should the D-1 decision change the convention, affected internal-
service sections are updated then.
```

(2) In §C2 Source bindings, replace:
```
Before:  Doc-4B D-1 composition precedent.
After:   Doc-4B D-1 composition precedent (D-1 governance status: Board Decision Pending).
```

**Rationale:** Aligns the D-1 reference with its current governance status (Board Decision Pending), removing the premature "approved" characterization. The composition approach itself is unchanged (interim, per the Doc-4B precedent); no new template is created; no behavior changes. Maintains governance consistency with the current corpus.

---

### PATCH-4CS-03 — Resolve SP-03: Identity permission-resolution is the authoritative authorization source

| Field | Value |
|---|---|
| Patch ID | PATCH-4CS-03 |
| Finding Reference | SP-03 |
| Affected Section | §C3 — Shared Identity Services (purpose block); cross-referenced in §C8 |

**Issue:** §C3 describes the Identity public services (Get User, Get Organization, Get Membership, Check Permission) and notes some reads may be internal-service composed (§C2 / D-1). Future authors need an explicit statement that these permission-resolution contracts are the **authoritative authorization-resolution source**, so that the internal-service audience marker is not misread as reducing their authority and no module builds a parallel authorization resolver.

**Correction:** In §C3, append the following clarification to the purpose block (additive; no field, permission, service, or behavior change):
```
Authoritative-source clarification: Identity's permission-resolution contracts (Check Permission and
the Get-Membership / Role / Permission reads) are the single authoritative authorization-resolution
source for the platform. Other modules CONSUME these contracts to resolve the Doc-4A §6 three-layer
check; no other module may implement a parallel or shadow authorization-resolution path (One Entity =
One Owner; Doc-4A §4.1, §6). Where such a read is internal-service composed (§C2 / D-1), the
`Audience: internal-service` marker identifies the consumption channel only — it does not reduce the
contract's authoritativeness. This clarification introduces no new permission, no new service, and no
behavioral change.
```
A one-line cross-reference is added to §C8 ("the authoritative-source rule of §C3 applies to the Check Permission resolution defined here").

**Rationale:** Prevents a future author or AI agent from (a) misreading the internal-service audience as advisory, or (b) implementing parallel authorization resolution in another module. It restates the existing One-Owner / Doc-4A §6 principle as it applies to Identity — no new capability, permission, or service.

---

### PATCH-4CS-04 — Resolve SP-04: Template 21.2 applicability under unresolved DC-1

| Field | Value |
|---|---|
| Patch ID | PATCH-4CS-04 |
| Finding Reference | SP-04 |
| Affected Section | §C2 — Conformance & Template Binding; Appendix C DC-1 |

**Issue:** §C2 lists Template 21.2 (Integration) as applicable to "cross-module integrations Identity is the source of." Dependency DC-1 (Appendix C) — the identity cross-module cascade (org soft-delete → Modules 2/3) and delegation-revocation teardown (Module 3) — remains unresolved (service-call integrations vs a Doc-2 §8 event). Without guidance, a Pass-A author might prematurely instantiate a 21.2 integration contract (or coin an event) for the DC-1 legs.

**Correction:**

(1) In §C2, add the following guardrail (does not resolve DC-1; introduces no event or integration contract):
```
Template 21.2 applicability under DC-1 (Pass-A guardrail): while DC-1 (Appendix C) is unresolved,
Template 21.2 (Integration) MUST NOT be instantiated for the DC-1-dependent cross-module legs —
the org soft-delete cascade to Modules 2/3 and the delegation-revocation grantee/visibility teardown
in Module 3. Those legs remain blocked at DC-1 pending the Board decision. Template 21.2 may be used
in Pass-A only for integrations that are NOT DC-1-dependent. This guardrail neither resolves DC-1,
introduces an event, nor authors any integration contract.
```

(2) In Appendix C DC-1, append: "Pass-A guardrail (§C2): Template 21.2 is not instantiated for the DC-1-dependent cross-module legs until this dependency is resolved."

**Rationale:** Prevents Pass-A ambiguity and premature integration authoring while preserving DC-1 as an open Board-gate item. It does not resolve DC-1, introduce an event, or author a new integration contract — it is a guardrail on template applicability only.

---

### Optional Editorial Cleanup

Reviewed; applied only where semantic-neutral. The SP-01 wording change is the single Doc-4B-freeze reference in the document (no other occurrence requires alignment). No duplicate governance language requires removal beyond the SP-driven edits. The clarifications added by PATCH-4CS-03 and PATCH-4CS-04 improve AI-agent readability at the two points most prone to misinterpretation (authorization authority; integration timing). No further editorial change is made, and no semantic change is introduced.

---

## §5 — Impact Analysis

### 5.1 Architecture & Governance Integrity

| Invariant | Affected? | Assessment |
|---|---|---|
| One Entity = One Owner | No | No ownership changed; SP-03 restates Identity's existing authorization authority |
| Module boundary integrity | No | No boundary changed; SP-04 is a timing guardrail, not a boundary move |
| Ownership integrity | No | SP-01 preserves the Doc-4B dependency; no ownership altered |
| Family Map | No | Unchanged (Doc-4C = Module 1) |
| Permissions (Doc-2 §7) | No | No slug coined; SP-03 introduces no permission |
| Events (Doc-2 §8) | No | No event coined; SP-04 explicitly introduces none; DC-1 unresolved |
| State machines (Doc-2 §5) | No | None touched |
| Templates (Doc-4A §21) | No | No new template; SP-02 confirms no new Doc-4A template; SP-04 constrains 21.2 use only |
| Doc-4A / Doc-4B | No | Neither modified |
| Dependencies DC-1…DC-5 | No | None resolved; DC-1 explicitly preserved (SP-04) |

### 5.2 Finding Disposition

| Finding | Disposition |
|---|---|
| SP-01 (Doc-4B freeze wording) | Resolved (PATCH-4CS-01) — governance-safe reference |
| SP-02 (D-1 status) | Resolved (PATCH-4CS-02) — Board Decision Pending |
| SP-03 (authoritative authorization source) | Resolved (PATCH-4CS-03) — clarification, no new capability |
| SP-04 (Template 21.2 under DC-1) | Resolved (PATCH-4CS-04) — Pass-A guardrail, DC-1 not resolved |

### 5.3 Validation Self-Review (no-change checklist)

| Criterion | Result |
|---|---|
| No architecture changes introduced | PASS |
| No ownership changes introduced | PASS |
| No module boundary changes introduced | PASS |
| No new entities introduced | PASS |
| No new permissions introduced | PASS |
| No new events introduced | PASS |
| No new workflows introduced | PASS |
| No new state machines introduced | PASS |
| No new templates introduced | PASS |
| Family Map unaltered; Doc-4A / Doc-4B not modified | PASS |
| DC-1 not resolved; no integration contract authored | PASS |
| All four accepted findings (SP-01…SP-04) resolved | PASS |
| Changes are structure-level clarification / governance wording only | PASS |

---

## §6 — Structure Freeze Recommendation

Upon application of PATCH-4CS-01 through PATCH-4CS-04, all four accepted independent-review findings are resolved with structure-level clarifications only — no architecture redesign, scope expansion, new capability, or dependency resolution. The five open structural dependencies (DC-1…DC-5) remain correctly tracked for the freeze gate; SP-04 strengthens the DC-1 guardrail without resolving it.

**Recommended Board action:**

> **Doc-4C Structure — STATUS: FROZEN.**
>
> Apply this patch and re-issue the corrected structure as `Doc-4C_Structure_v1.0_FROZEN.md` (per the Doc-4A / Doc-4B Structure precedent: proposal → patch → frozen re-issue). No further independent structure review is required.
>
> **Authorize `Doc-4C_Content_v1.0_PassA` authoring** against the frozen structure. Carry dependencies DC-1…DC-5 as content-pass / freeze-gate conditions, resolved through their named channels (Board decisions and the Doc-3 §12.2 `identity.*` additive registration); none blocks the start of Pass-A authoring except where a contract's freeze depends on it.

---

*Doc-4C Structure Clarification Patch v0.1.1 — resolves SP-01 (Doc-4B freeze wording), SP-02 (D-1 = Board Decision Pending), SP-03 (Identity authorization-source clarification), SP-04 (Template 21.2 / DC-1 Pass-A guardrail). Structure-level clarification only. No architecture, ownership, boundary, entity, permission, event, workflow, state-machine, or template change; DC-1 not resolved; Doc-4A / Doc-4B / Family Map untouched. Status: **DOC-4C STRUCTURE FREEZE CANDIDATE**.*
