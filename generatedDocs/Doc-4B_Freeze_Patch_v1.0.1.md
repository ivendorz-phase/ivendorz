# Doc-4B — Freeze Patch v1.0.1

| Field | Value |
|---|---|
| Patch ID | Doc-4B-Freeze-Patch-v1.0.1 |
| Applies To | `Doc-4B_Content_v1.0_PassB.md` |
| Patch Authority | Architecture Board Directive + `Doc-4B_PassB_Hard_Review_v1.0.md` — resolves PB-M01, PB-m01, PB-m02 (+ PB-n01, PB-n02, PB-n03); records Board decisions D-1/D-2/D-4/D-5; links PB-B01 resolution to `Doc-3_Policy_Key_Registration_Patch_v1.0.md` |
| Patch Type | **Targeted freeze-readiness corrections + Board-decision recording.** No architecture redesign, module-boundary, ownership, permission, event, workflow, state-machine, or template change. Doc-4A and Doc-4B Structure not reopened. |
| Corpus Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A (FROZEN) → Doc-4B Structure (FROZEN) → Doc-4B Content Pass-B → This Patch |
| Family Map | **Unchanged** — Doc-4B = Platform Core / Shared Kernel (Module 0); Doc-4C = Identity & Organization (Module 1) |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (base `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`), Doc-3 v1.0.2 (base `…v1.0.1.md` + `Doc-3_Patch_v1.0.2.md`) **+ `Doc-3_Policy_Key_Registration_Patch_v1.0.md`**, Doc-4A v1.0 (FROZEN: Pass1–Pass6 + Pass3/4/5/6 Patches v1.0.1 + FreezeAudit Patch v1.0.1) |
| Linked Document | `Doc-3_Policy_Key_Registration_Patch_v1.0.md` (registers the 18 `core.*` keys; this patch clears the `[PA-E1]` markers by reference) |
| Status | **DOC-4B FREEZE CANDIDATE — all review findings resolved (PB-B01 via the linked Doc-3 patch)** |

---

## §1 — Patch Authority

Issued by the iVendorz Architecture Board on completion of the Doc-4B Pass-B Independent Architecture Hard Review (`Doc-4B_PassB_Hard_Review_v1.0.md`; decision: **APPROVE WITH FREEZE PATCH** — 1 BLOCKER, 1 MAJOR, 2 MINOR, 3 NITPICK).

This patch (a) records the Board's formal adjudication of the carried governance items (D-1, D-2, D-4, D-5); (b) applies the targeted freeze corrections FP-01 (PB-M01), FP-02 (PB-m01), FP-03 (PB-m02); (c) applies the optional cleanups FP-N01 (PB-n01), FP-N02 (PB-n02), FP-N03 (PB-n03); and (d) resolves PB-B01 by reference to the linked `Doc-3_Policy_Key_Registration_Patch_v1.0.md`.

No finding is resolved by architecture change, ownership change, or invention. Doc-4A is **not** reopened; Doc-4B Structure is **not** reopened; no new entity, aggregate, permission, event, workflow, state machine, or template is created. Formula-version ownership remains with Trust (`trust.trust_scores.trust_formula_version`, Doc-2 §10.6).

---

## §2 — Board Decisions Adopted (governance tracking closed)

The Board formally adopts the following. These supersede the corresponding `BOARD DECISION PENDING` / `… PENDING` markers in Doc-4B §B2 and inline:

| ID | Decision | Adopted status | Effect on Doc-4B |
|---|---|---|---|
| **D-1** Template Composition Convention | Continue the existing D-1 composition convention; **no new Doc-4A template**; no Doc-4A reopening. | **APPROVED** | The 21.3/21.4 `Audience: internal-service` composition + non-recursion annotations are the **ratified** pattern. All inline `[D-1]` markers are **RESOLVED**. |
| **D-2** Permission Granularity | Least-privilege slugs remain a **future Doc-2 additive enhancement**. `staff_super_admin` and `staff_can_redact_audit` remain **authoritative** for Doc-4B. No permission redesign. | **CARRY FORWARD** | Current slug bindings are confirmed authoritative. `[D-2]` markers remain as a **tracked Doc-2 future enhancement** — **not a freeze gate**. |
| **D-4** Configuration Governance Boundary | Module 0 **stores and exposes** configuration values; Module 8 **governs** administrative policy and oversight. **No Doc-4B ownership change.** | **APPROVED** | `core.admin_update_config_value.v1` remains in Doc-4B (the write/store), with Module 8 governance/oversight per Doc-2 §16.2. All inline `[D-4]` markers are **RESOLVED**. |
| **D-5** Outbox Audit Granularity | Outbox worker auditing remains **"service-role sensitive operations" at run/batch granularity**. Per-event audit logging is **not authorized**. **No additional audit actions required for freeze.** | **APPROVED** | The interim Action-Ref binding is **confirmed authoritative**. All inline `[D-5]` markers are **RESOLVED**; the §B2 D-5 "freeze gate: YES" self-classification is closed (the review adjudicated D-5 as not a blocker; the Board confirms the binding). |

With D-1/D-4/D-5 **APPROVED** and D-2 **CARRY FORWARD**, no governance item gates the Doc-4B freeze. The sole remaining blocker (PB-B01 / PA-M3) is resolved by the linked Doc-3 registration patch (FP-04).

---

## §3 — Scope Statement

This patch modifies the following locations in `Doc-4B_Content_v1.0_PassB.md` only:

| Location | Change | Finding |
|---|---|---|
| §B8 `core.admin_update_config_value.v1` — Request note, Response `formula_version_bumped`, Events-Produced note | Resolve Trust-trigger mechanism to a service call; update `formula_version_bumped`; keep `Events-Produced: none` | FP-01 / PB-M01 |
| §B8 `core.admin_update_config_value.v1` & §B9 `core.admin_set_feature_flag.v1` — Required Permissions | Add `Compliance-Basis` | FP-02 / PB-m01 |
| §B5 `core.admin_redact_audit_field.v1` — Idempotency note | Clarify §14.3 audit-record leg only; outbox-event leg N/A | FP-03 / PB-m02 |
| 7 affected contracts — `[PA-E1]` markers | Cleared by reference to the linked Doc-3 registration patch | FP-04 / PB-B01 |
| §B4 `core.audit_record_query.v1` — Error codes | `core_audit_not_found` → `core_audit_record_not_found` | FP-N01 / PB-n01 |
| §B0 header — Conforms To | Remove ghost `Doc2_Patch_v1.0.2`; correct Doc-2 composition | FP-N02 / PB-n02 |
| §B11 O-5 | Align wording to the FP-01 service-call mechanism | FP-N03 / PB-n03 |
| §B2 + inline `[D-…]` markers | Disposition per §2 Board decisions (documentation) | D-1/D-2/D-4/D-5 |

No other content is modified. No contract is added or removed. No behavioral rule changes.

---

## §4 — Patch Entries

---

### FP-01 — Resolve PB-M01: Trust formula-version trigger is a service call, not an event

| Field | Value |
|---|---|
| Patch ID | FP-01 |
| Finding Reference | PB-M01 (MAJOR) |
| Affected Contract | `core.admin_update_config_value.v1` (§B8) |

**Issue:** The Request note read "…through the integration single-authorship channel **(domain event or service call)** declared in Doc-4G/Doc-4E…". The "domain event or service call" disjunction is ambiguous; the domain-event path contradicts `Events-Produced: none`, and the `formula_version_bumped` semantics differ by mechanism. An AI agent cannot implement deterministically.

**Correction (Board decision: Module 0 invokes a Trust-owned integration service; Doc-4B coins no event and defines no receiving contract; Doc-4G authors the receiving Trust contract):**

(1) Request Contract note — replace:
```
… trigger the Trust module's formula_version increment (trust.trust_scores.trust_formula_version,
Doc-2 §10.6) through the integration single-authorship channel (domain event or service call)
declared in Doc-4G/Doc-4E per Doc-4A §4. Formula-version ownership remains with Trust; Module 0
neither owns nor mutates it.)
```
with:
```
… trigger the Trust module's formula_version increment (trust.trust_scores.trust_formula_version,
Doc-2 §10.6) by invoking an internal service call to a Trust-owned integration service. The receiving
service contract is authored in Doc-4G as a Module 0 → Trust dependency (Doc-4A §4 integration
single-authorship); Doc-4B coins no event and defines no receiving contract. Formula-version ownership
remains with Trust; Module 0 neither owns nor mutates it.)
```

(2) Response Contract — replace the `formula_version_bumped` line:
```
formula_version_bumped : boolean : conditional (key is scoring-relevant) : true if the service
                                   determined this change triggered a Trust formula_version increment
                                   per Doc-3 §12.4; absent when the key is not scoring-relevant
```
with:
```
formula_version_bumped : boolean : conditional (key is scoring-relevant) : true if Module 0
                                   determined the key is scoring-relevant AND dispatched the Trust
                                   integration-service call (the receiving service is authored in
                                   Doc-4G); absent when the key is not scoring-relevant
```

(3) Events Produced note — replace:
```
(Doc-2 §8 designates no event for configuration change; engines read values at runtime per
Architecture §17.3. The Trust formula-version trigger, where applicable, uses the integration channel
authored by the owning module per §4 — Doc-4B coins no event.)
```
with:
```
(Doc-2 §8 designates no event for configuration change; engines read values at runtime per
Architecture §17.3. The Trust formula-version trigger, where applicable, is an internal service call
to a Trust-owned integration service authored in Doc-4G — Doc-4B coins no event and defines no
receiving contract.)
```

`Events-Produced: none` is **maintained** (unchanged).

**Rationale:** Removes the mechanism ambiguity per the Board decision; eliminates the domain-event path that conflicted with `Events-Produced: none`; makes `formula_version_bumped` deterministic (true = scoring-relevant and the Trust service call was dispatched). Doc-4B coins no event and defines no receiving contract — the Trust-side contract is Doc-4G's, per §4 single-authorship. No ownership moves; no event created.

---

### FP-02 — Resolve PB-m01: add the Template 21.6 `Compliance-Basis` field

| Field | Value |
|---|---|
| Patch ID | FP-02 |
| Finding Reference | PB-m01 (MINOR) |
| Affected Contracts | `core.admin_update_config_value.v1` (§B8), `core.admin_set_feature_flag.v1` (§B9) |

**Issue:** Template 21.6 (Doc-4A §5.6) requires a `Compliance-Basis` field in the Required Permissions block. The three audit Admin contracts declare it; these two platform-wide Admin contracts omit it. An AI agent running the §21 template checklist detects the gap.

**Correction:** In each contract's Required Permissions block, immediately after `Admin-Scope: platform-wide`, **add**:

For `core.admin_update_config_value.v1`:
```
Compliance-Basis: Doc-2 §9 (system_configuration change) / Master Architecture §17.1 (platform administrative authority), by pointer — platform operational administration, not per-tenant compliance basis
```
For `core.admin_set_feature_flag.v1`:
```
Compliance-Basis: Doc-2 §9 (feature flag change) / Master Architecture §17.1 (platform administrative authority), by pointer — platform operational administration, not per-tenant compliance basis
```

**Rationale:** Editorial template completeness only. No behavior, permission, or ownership change — the basis cites existing corpus pointers (Doc-2 §9 audit actions + Architecture §17.1 platform administration). Both contracts remain platform-wide `staff_super_admin` operations.

---

### FP-03 — Resolve PB-m02: clarify the redaction Idempotency note (no phantom outbox event)

| Field | Value |
|---|---|
| Patch ID | FP-03 |
| Finding Reference | PB-m02 (MINOR) |
| Affected Contract | `core.admin_redact_audit_field.v1` (§B5) |

**Issue:** The Idempotency note applied the full §14.3 joint-rule language including "no duplicate outbox event," despite `Events-Produced: none`. An AI agent could infer a phantom outbox write that must be deduplicated.

**Correction:** In the Idempotency block, replace:
```
(Replay safety — §14.3 joint rule: a replay within the window returns the original redaction result;
no second redaction, no duplicate redaction audit record, no duplicate outbox event.)
```
with:
```
(Replay safety — §14.3 joint rule (audit-record leg only): a replay within the window returns the
original redaction result; no second redaction, no duplicate redaction audit record. Events-Produced:
none — the §14.3 outbox-event leg is not applicable to this contract.)
```

**Rationale:** Removes the phantom-event implication; aligns the note with the contract's `Events-Produced: none`. No behavior change, no event creation, no workflow change. Idempotency remains `required` with the existing dedup window.

---

### FP-04 — Resolve PB-B01: `[PA-E1]` clearance by reference to the Doc-3 registration patch

| Field | Value |
|---|---|
| Patch ID | FP-04 |
| Finding Reference | PB-B01 / PA-M3 (BLOCKER) |
| Affected Contracts | the 7 PA-E1-marked contracts (audit query, correlation lookup, redact, dispatch, archive, config change, flag set) |

**Issue:** 18 `core.system_configuration.core.*` POLICY keys were referenced with `[PA-E1]` markers but unregistered in Doc-3 §12.2 (Doc-4A §18.2 freeze gate).

**Correction (documentation-only conformance update; depends on the linked patch):** With `Doc-3_Policy_Key_Registration_Patch_v1.0.md` adopted, all 18 keys are registered under the new Doc-3 §12.2 **"Core / Platform Infrastructure (Module 0)"** block. Accordingly, in Doc-4B every `[PA-E1]` marker is **cleared**; each key now resolves to its registered Doc-3 §12.2 entry (full reference form `core.system_configuration.core.<key_name>`, §18.2). No key name, value, validation rule, or contract behavior changes — the keys were always cited correctly; they are now registered upstream.

**Rationale:** Resolves the sole BLOCKER without any contract redesign. The keys' names and uses are unchanged; only their upstream registration status changes (now satisfied). Per Doc-4A §18.2, the 7 affected contracts become freeze-eligible. This is the linked half of the two-document action.

---

### FP-N01 — PB-n01: normalize audit-record NOT_FOUND error naming

| Field | Value |
|---|---|
| Patch ID | FP-N01 |
| Finding Reference | PB-n01 (NITPICK) |
| Affected Contract | `core.audit_record_query.v1` (§B4) |

**Issue:** The query used `core_audit_not_found` while `core.admin_redact_audit_field.v1` used `core_audit_record_not_found` for the same conceptual condition (an `audit_records` row not found), preventing uniform error handling.

**Correction:** In `core.audit_record_query.v1`, in the Error codes line, replace `core_audit_not_found` (NOT_FOUND) with **`core_audit_record_not_found`** (NOT_FOUND), harmonizing with `core.admin_redact_audit_field.v1`. `core.audit_correlation_lookup.v1` retains `core_audit_reference_not_found` (a semantically distinct "correlation id not found" condition).

**Rationale:** Editorial naming harmonization within the registered `core_` namespace (Doc-4A Appendix B §B.2). No behavior change.

---

### FP-N02 — PB-n02: remove the ghost `Doc2_Patch_v1.0.2` reference

| Field | Value |
|---|---|
| Patch ID | FP-N02 |
| Finding Reference | PB-n02 (NITPICK) |
| Affected Section | §B0 header — `Conforms To` |

**Issue:** The header cited "Doc-2 v1.0.3 (base `…v1.0.2.md` + Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3)". The canonical Doc-2 v1.0.3 composition is base v1.0.2 + `Doc-2_Patch_v1.0.3.md` (which applies directly to the v1.0.2 base); the intermediate `Doc2_Patch_v1.0.2` reference is a ghost that propagated from the Consistency Patch reconciliation table.

**Correction:** In the `Conforms To` field, replace the Doc-2 composition string:
```
Before:  Doc-2 v1.0.3 (base `…v1.0.2.md` + Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3)
After:   Doc-2 v1.0.3 (base `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`)
```

**Rationale:** Documentation-only citation correction. The effective version identifier (Doc-2 v1.0.3) is unchanged; only the lineage annotation is corrected. Doc-4A is not reopened (this corrects only Doc-4B's header).

---

### FP-N03 — PB-n03: align O-5 wording with the FP-01 mechanism

| Field | Value |
|---|---|
| Patch ID | FP-N03 |
| Finding Reference | PB-n03 (NITPICK) |
| Affected Section | §B11 O-5 |

**Issue:** O-5 described the Trust formula-version trigger as "**service-side** via the §4 integration channel (Doc-4G/Doc-4E)" — ambiguous after FP-01 resolved the mechanism to a service call.

**Correction:** In O-5, replace:
```
… triggers a Trust formula_version increment service-side via the §4 integration channel (Doc-4G/Doc-4E), surfaced through formula_version_bumped.
```
with:
```
… triggers a Trust formula_version increment by invoking an internal service call to a Trust-owned integration service (authored in Doc-4G per Doc-4A §4); Module 0 coins no event; surfaced through formula_version_bumped. (Consistent with FP-01.)
```

**Rationale:** Aligns the operational-readiness description with the corrected contract mechanism (FP-01). No behavior change.

---

## §5 — Impact Analysis

### 5.1 Architecture Integrity

| Invariant | Affected? | Assessment |
|---|---|---|
| One Entity = One Owner | No | No entity ownership changed; formula-version stays in Trust (Doc-2 §10.6) |
| Module boundary integrity | No | FP-01 makes the Trust trigger an explicit Module 0 → Trust service call (receiver authored in Doc-4G); no cross-module entity touched |
| Ownership integrity | No | D-4 confirms Module 0 stores/exposes config; Module 8 governs oversight — no ownership moved |
| Family Map | No | Unchanged |
| Permissions (Doc-2 §7) | No | D-2 CARRY FORWARD; `staff_super_admin`/`staff_can_redact_audit` authoritative; no slug coined |
| Events (Doc-2 §8) | No | No event coined; FP-01 confirms service call, not event; `Events-Produced: none` maintained |
| State machines (Doc-2 §5) | No | None touched |
| Templates (Doc-4A §21) | No | D-1 APPROVED — no new template; FP-02 completes existing-template fields |
| Audit actions (Doc-2 §9) | No | D-5 APPROVED — interim "service-role sensitive operations" confirmed; no action coined |
| Doc-4A corpus / Doc-4B Structure | No | Neither reopened |

### 5.2 Validation Self-Review (Board-required checklist)

| Criterion | Result |
|---|---|
| PB-B01 resolved through the Doc-3 registration patch (FP-04 linkage) | PASS |
| PB-M01 resolved (FP-01) | PASS |
| PB-m01 resolved (FP-02) | PASS |
| PB-m02 resolved (FP-03) | PASS |
| PB-n01 / PB-n02 / PB-n03 resolved (FP-N01/N02/N03) | PASS |
| Board decisions D-1/D-2/D-4/D-5 recorded; markers dispositioned | PASS |
| No architecture changes introduced | PASS |
| No ownership changes introduced | PASS |
| No module boundary changes introduced | PASS |
| No new permissions introduced | PASS |
| No new events introduced (`Events-Produced: none` maintained) | PASS |
| No new workflows introduced | PASS |
| No new state machines introduced | PASS |
| No new templates introduced; Doc-4A / Doc-4B Structure not reopened | PASS |

---

## §6 — Freeze Readiness Statement

Upon application of this patch **and** the linked `Doc-3_Policy_Key_Registration_Patch_v1.0.md`, all Doc-4B Pass-B Hard Review findings are resolved:

| Finding | Resolution |
|---|---|
| PB-B01 / PA-M3 (BLOCKER) | Doc-3 §12.2 `core.*` key registration (Part A) + `[PA-E1]` clearance (FP-04) |
| PB-M01 (MAJOR) | FP-01 — Trust trigger resolved to a service call; Doc-4G authors the receiver |
| PB-m01 (MINOR) | FP-02 — `Compliance-Basis` added to two Admin contracts |
| PB-m02 (MINOR) | FP-03 — redaction Idempotency note clarified (no phantom outbox event) |
| PB-n01 / PB-n02 / PB-n03 (NITPICK) | FP-N01 / FP-N02 / FP-N03 |
| D-1 / D-4 / D-5 | APPROVED (recorded §2) — markers resolved |
| D-2 | CARRY FORWARD (recorded §2) — future Doc-2 additive enhancement; not a freeze gate |

No governance item gates the freeze; no contract is redesigned; no new review cycle is required (the corrections match the review's prescriptive resolutions).

**Recommended Board action:**

> **Doc-4B v1.0 — STATUS: FROZEN.**
>
> Adopt `Doc-3_Policy_Key_Registration_Patch_v1.0.md` (additive §12.2 registration) and this `Doc-4B_Freeze_Patch_v1.0.1.md`. The authoritative Doc-4B = `Doc-4B_Content_v1.0_PassB.md` + this freeze patch, with the 18 `core.*` keys registered upstream. Declare Doc-4B (Platform Core / Shared Kernel, Module 0) **FROZEN** as the authoritative implementation contract layer for Module 0.
>
> **Authorize `Doc-4C` (Identity & Organization, Module 1) Structure authoring.** No further Doc-4B review cycle is required.

---

*Doc-4B Freeze Patch v1.0.1 — resolves PB-M01 (FP-01), PB-m01 (FP-02), PB-m02 (FP-03), PB-n01/n02/n03 (FP-N01/N02/N03); PB-B01 resolved via the linked Doc-3 key registration patch (FP-04); Board decisions D-1/D-4/D-5 APPROVED, D-2 CARRY FORWARD. No architecture, ownership, boundary, permission, event, workflow, state-machine, or template change. Doc-4A and Doc-4B Structure not reopened. Status: **DOC-4B FREEZE CANDIDATE — READY TO FREEZE**.*
