# Doc-4K_Structure_Independent_Hard_Review_v1.0

| Field | Value |
|---|---|
| Document | `Doc-4K_Structure_Independent_Hard_Review_v1.0` |
| Nature | **Independent Architecture Board Hard Review — Structure.** Defect Discovery Review. Not a Patch Review, Patch Verification, Freeze Audit, or Pass Review. |
| Document Reviewed | `Doc-4K_Structure_Authoring_v1.0` (designated internally as Structure Proposal v0.1) + `Doc-4K_Brief_Reconciliation_Note_v1.0` |
| Scope | Module 9 — AI Layer (`ai` schema, `ai_` namespace) — structure only |
| Corpus Authority (precedence) | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4J (all FROZEN) → Doc-4K_Brief_Reconciliation_Note_v1.0 |
| Standing Constraints | No slug invented · No event invented · No aggregate invented · No ownership change · No structural redesign · No new BC invented · No new module · No reopening frozen decisions · FLAG-AND-HALT on corpus conflict |

---

## Executive Verdict

```
BLOCKER  = 0
MAJOR    = 0
MINOR    = 0
NITPICK  = 2  (K-HR-N1, K-HR-N2)
```

---

## What Was Done Well

**Family-map conformance is exact.** §K1 binds to Doc-4A §1.3 verbatim: "Doc-4K | AI Layer contracts (Module 9; advisory-only per Master Architecture §18)." The schema (`ai`), namespace (`ai_`), and module number (9) are all correct. The Brief Reconciliation Note correctly disposed of the prior scope conflict and the structure authors against the right target.

**Inventory-gate result is explicitly stated and verifiable.** The preamble records a formal inventory-gate pass (2026-06-19) against Doc-2 §2/§3.10/§10.10 with four specific claims: four derived aggregates, no authoritative record, no Doc-2 §8 event, no `ai_` slug/audit domain/POLICY key. All four claims are corroborated by the corpus.

**Four-BC one-to-one mapping is structurally correct.** BC-AI-1 ↔ Recommendation, BC-AI-2 ↔ Prediction, BC-AI-3 ↔ Classification Result, BC-AI-4 ↔ Similar Vendor Result mirrors the exact four-aggregate set in Doc-2 §2 Module-9 row. No BC added, none split, none merged without authorization.

**Procurement moat is asserted in the right places and with the right precision.** §K2, §K4, §K7 (DF-AI-3), §K8, and §K16 all explicitly state the moat: no matching/routing/ranking/supplier-selection/award/eligibility decision. The matching-assist artifact in DF-AI-3 is correctly bounded as a non-authoritative artifact RFQ may optionally consume, with the routing decision staying RFQ's. This is the exact framing from Master Architecture §18.

**Trust firewall is correctly stated at every relevant seam.** DF-AI-5 (§K7), §K8, §K4, §K2, and §K16 all exclude Trust/Performance/Verification/Governance score ownership. DF-AI-5 draws the read-only line precisely: AI may consume a published score output as a derived input but computes, owns, and modifies no score. The firewall assertion is redundant-by-design across sections, which is correct for a structure document consumed by AI coding agents.

**Dependency map (§K7) is the strongest section.** Six dependency markers (DF-AI-1 through DF-AI-6) each state direction, consumption pattern, channel, and protected fact. The write-only-to-`ai.*` discipline is stated at every seam. The §4.3 no-foreign-representation rule is correctly applied — `result_jsonb` holds derived results, not copies of another module's entity. The buyer-private data protection via DF-AI-4 is explicitly called out.

**Escalation inventory (§K14) is complete and well-scoped.** Four `[ESC-AI-*]` markers (EVENT, SLUG, AUDIT, POLICY) each carry a justified corpus-silence basis, state what they cover, and confirm nothing is coined. The POLICY escalation correctly identifies the right additive channel (Doc-3 §12.2). No escalation hides a structure defect.

**Lifecycle posture is correctly handled.** §K13 correctly identifies that AI aggregates have no business state machine — the "lifecycle" is cache posture (generated → refreshed → expired/invalidated → regenerated). The `expires_at` field is correctly classified as cache management, not a business lifecycle transition.

**Authorization surface is correctly zeroed.** §K11 correctly observes: no `ai_` slug in Doc-2 §7, AI reads reuse the consumed module's entitlement, system/automated regeneration runs under System-actor authority, `[ESC-AI-SLUG]` carried for any AI-specific user-triggered action. The frozen `AI Agent` `actor_type` anchor in Doc-2 §9 is correctly noted.

**Audit surface is correctly handled.** §K12 binds AI mutations to the shared `core.audit_records` facility via Doc-4B, attributes with `actor_type ∈ {System, AI Agent, User/Admin}`, and correctly notes reads are not audited (Doc-4A §17.1). `[ESC-AI-AUDIT]` correctly reserved.

**Cross-module reference integrity (§K15) is precisely stated.** Bare UUIDv7, no cross-schema FK (Doc-2 §0.3), no embedded foreign representation (Doc-4A §4.3), write-time validation via owning module's service, nightly integrity-audit reconciliation (Doc-2 §10.11) — all correctly applied.

**AI-agent governance (§K16) is complete and correctly bound by pointer.** The three hard constraints (write only `ai.*`, moat, firewall), flag-and-halt rule, determinism/advisory presentation, smallest-change doctrine, and provenance field obligations (`model_version`/`generated_at`/`expires_at`) are all present. Governance is correctly bound by pointer to Doc-4A rather than restated.

**Open questions in §K17 are correctly framed.** All three are genuine review-time questions, not deferred structure decisions. The structure does not resolve them locally — it surfaces them for Hard Review ruling.

---

## Findings

### BLOCKER

None.

### MAJOR

None.

### MINOR

None.

### NITPICK

#### Finding K-HR-N1

**Finding ID:** K-HR-N1

**Severity:** NITPICK

**Affected Section:** §K3 — BC Landscape — open-question parenthetical

**Issue:** §K3 contains the parenthetical: *"BC count is held at four to mirror the four frozen aggregates one-to-one; an Hard-Review may challenge whether the four collapse into fewer BCs."* The phrase "an Hard-Review" is a typographic error ("an" should be "a").

**Impact:** Cosmetic only. No governance or semantic implication.

**Recommended Resolution:** Change "an Hard-Review" to "a Hard-Review" in §K3. Acceptable at structure freeze time without a patch.

---

#### Finding K-HR-N2

**Finding ID:** K-HR-N2

**Severity:** NITPICK

**Affected Section:** §K6 — Domain Service Inventory

**Issue:** §K6 names service surfaces per BC (recommendation service, prediction service, etc.) without explicitly stating within §K6 that these are structure-level capability descriptions, not frozen service contract names or `ai_` slugs. A future Pass-A author reading §K6 in isolation could mistake a surface label for a frozen service identifier and coin an `ai_` slug or service ID from it. The ambiguity is fully resolved by §K11 and §K14 when the document is read holistically, but is not self-contained within §K6.

**Impact:** Low AI-agent risk, cosmetic when the full document is read. No governance violation in the current text.

**Recommended Resolution:** Add one sentence to §K6 Excluded scope: *"No service identifier coined here — surface labels are structure-level capability descriptions, not frozen service contract names or `ai_` slugs (§K11/§K14)."* Optional; acceptable to carry as a Pass-A authoring note.

---

## Domain-by-Domain Assessment

### 1. Family Map Conformance — PASS

Doc-4K correctly represents Module 9. Doc-4A §1.3 binding is verbatim and correctly cited. Master Architecture §16 (ten-module map) and §18 (AI Layer advisory role) are both cited in §K1 and §K2. The Brief Reconciliation Note established that the prior scope conflict (Cross-Module Execution Framework) was correctly resolved in favor of the AI Layer target before any authoring proceeded. No hidden reassignment of Doc-4K scope exists anywhere in the document. Doc-4L is correctly referenced as the non-normative cross-module view and is not conflated with Doc-4K.

### 2. AI Layer Boundary Integrity — PASS

All seven prohibited ownership categories are clean: no authoritative business record owned (§K5, §K8), no procurement workflow state (§K2, §K4, §K7, §K8, §K16), no RFQ authority (DF-AI-3 keeps routing decision in RFQ), no vendor authority (DF-AI-2 — Marketplace owns vendor profiles; AI references only), no billing authority (not claimed), no trust authority (DF-AI-5, §K8). No ownership leakage found.

### 3. Aggregate Ownership Integrity — PASS

All four Doc-2 §2 Module-9 aggregates present and correctly mapped:

| Aggregate | Root table | Owning BC |
|---|---|---|
| Recommendation | `ai.recommendations` | BC-AI-1 |
| Prediction | `ai.predictions` | BC-AI-2 |
| Classification Result | `ai.classification_results` | BC-AI-3 |
| Similar Vendor Result | `ai.similar_vendor_results` | BC-AI-4 |

No aggregate added beyond the frozen Doc-2 §2 set. No aggregate from another module claimed. One-to-one BC assignment; no shared aggregate. Score and Basis VOs for BC-AI-1 correctly deferred to Pass-A/B by pointer; not invented here.

### 4. Procurement Moat Protection — PASS

The moat is asserted at five structural locations: §K2 (constraint set), §K4 (BC-AI-1 "suggestions only"; BC-AI-3 "authoritative category remains Marketplace's"), §K7 (DF-AI-3 — routing decision stays RFQ), §K8 (explicit exclusion list), §K16 (hard agent constraint). The matching-assist artifact is correctly scoped as a non-binding suggestion AI produces and RFQ optionally consumes — AI never writes RFQ state, never decides selection. No path through the structure allows AI to perform or influence any of the seven prohibited procurement actions.

### 5. Trust Firewall Protection — PASS

The firewall is asserted at §K2 (constraint (d)), §K7 (DF-AI-5 — "computes/owns/modifies no score"), §K8 (explicit exclusion), §K4 (common-to-all clause), §K16 (hard agent constraint). DF-AI-5 correctly distinguishes consuming a published score output as a derived input (permitted) vs. computing or owning a score (prohibited). Trust ownership remains entirely in Module 6 (Doc-4G).

### 6. Cross-Module Dependency Integrity — PASS

Six DF-AI-* markers covering all required upstream modules:

| Marker | Module | Direction | Pattern |
|---|---|---|---|
| DF-AI-1 | Identity (Doc-4C) | Downstream consumer | consume `check_permission` + org resolution |
| DF-AI-2 | Marketplace (Doc-4D) | Downstream consumer | reference + read-via-Query |
| DF-AI-3 | RFQ (Doc-4E) | Downstream consumer | reference + read-via-Query; optional AI artifact delivery to RFQ |
| DF-AI-4 | Operations (Doc-4F) | Downstream consumer | reference + read-via-Query (buyer-private protection) |
| DF-AI-5 | Trust (Doc-4G) | Downstream consumer | read-only score output consumption |
| DF-AI-6 | Platform Core (Doc-4B) | Downstream consumer | consume audit-write, POLICY, feature-flag, UUIDv7 |

Dependency direction is correct throughout. AI is a pure downstream consumer; writes only `ai.*`. No unauthorized write path exists. No direct cross-module table access (all mediated via owning module's Query/Service per Doc-4A §4.3). No dependency marker invented.

### 7. Event Integrity — PASS

**Production:** Zero. §K9 states the AI Layer produces no Doc-2 §8 event; inventory-gate scan cited as evidence. No event invented. `[ESC-AI-EVENT]` correctly reserved for future activation. No 21.2 integration contract claimed.

**Consumption:** §K10 correctly states no Doc-2 §8 event consumed as an authoritative trigger; pull/derive-on-demand posture adopted. The optional future cache-refresh path via existing upstream events is correctly carried as `[ESC-AI-EVENT]` rather than enumerated. Three constraints for any future event consumption are all stated (AI-local target only; existing event by pointer; `[ESC-AI-EVENT]` escalation).

No event invented. No event re-owned. No event ownership conflict.

### 8. Authorization Integrity — PASS

Doc-4A §6.1–§6.4 posture followed. No `ai_` slug invented (Doc-2 §7 confirmed absent at inventory gate). AI read capabilities correctly reuse the consumed module's entitlement. System-actor authority correctly assigned to automated regeneration. `[ESC-AI-SLUG]` correctly reserved. Frozen `AI Agent` `actor_type` in Doc-2 §9 correctly identified as the audit attribution anchor.

### 9. Audit & Traceability Integrity — PASS

`core.audit_records` (Doc-4B) consumed by pointer for AI mutations. Attribution via frozen `actor_type` values including `AI Agent` (Doc-2 §9). Reads correctly not audited (Doc-4A §17.1). Artifact provenance fields (`model_version`, `generated_at`, `expires_at`) from Doc-2 §10.10 cited by pointer — deferred to Pass-A/B for field-level specification. No new audit action invented; `[ESC-AI-AUDIT]` correctly reserved.

### 10. Escalation Framework Integrity — PASS

All four escalation markers present and correctly bounded:

| Marker | Additive channel | Justification | Status |
|---|---|---|---|
| `[ESC-AI-EVENT]` | Doc-2 §8 | No AI event in catalog; pull-on-demand posture | Justified |
| `[ESC-AI-SLUG]` | Doc-2 §7 | No `ai_` slug in catalog | Justified |
| `[ESC-AI-AUDIT]` | Doc-2 §9 | No AI-specific audit action in catalog | Justified |
| `[ESC-AI-POLICY]` | Doc-3 §12.2 | No `ai.*` POLICY key; TTL/cadence values needed in Pass-B | Justified |

No escalation hides a structure defect. No escalation coins anything. No escalation violates frozen ownership. All four additive channels correctly identified.

### 11. AI-Agent Authoring Safety — PASS

The structure is deterministic and unambiguous at every ownership-critical point. Module write boundary is unambiguous (`ai.*` tables only). Moat and firewall are stated as hard constraints in §K16, not guidelines. Aggregate ownership is one-to-one with no shared aggregates. Dependency direction is explicit (downstream consumer only). Escalation markers clearly identify where corpus is silent. §K15 cross-module reference inventory gives a concrete, actionable list of what AI artifacts reference and under what obligations. §K16 explicitly names Claude Code, Cursor, Codex as consumers and states the flag-and-halt rule.

The one low-risk ambiguity (K-HR-N2) in §K6 service surface labels is resolved by §K11/§K14 context. No hidden assumptions. No ownership ambiguity at structure level. Open questions in §K17 are explicitly flagged as Review-time ruling points rather than embedded assumptions.

### 12. Structure Completeness — PASS

All 17 sections present and correctly scoped:

§K1 Module Overview · §K2 Business Objectives · §K3 BC Landscape · §K4 Context Responsibilities · §K5 Aggregate Inventory · §K6 Domain Service Inventory · §K7 External Dependency Map · §K8 Ownership Matrix · §K9 Event Production Map · §K10 Event Consumption Map · §K11 Authorization Surface · §K12 Audit & Traceability Surface · §K13 Lifecycle Registry · §K14 Escalation Inventory · §K15 Cross-Module Reference Inventory · §K16 AI-Agent Governance · §K17 Structure Summary & Open Questions

No section missing. No section duplicates another module's responsibility. No unresolved ownership gap. The structure correctly excludes all Pass-A/B content as specified. Section hierarchy is complete and internally consistent.

---

## Open Questions — Architecture Board Rulings

**Q1 — BC Granularity (four BCs vs. collapse):**

**Ruling: Retain four BCs (BC-AI-1…4).** The four aggregates are functionally distinct derived-artifact families: recommendations serve vendor/RFQ surfacing; predictions serve forecasting; classifications serve category/RFQ structuring; similarity results serve vendor discovery. Each has a distinct upstream input set and a distinct service surface. Collapsing them into a single "AI Derived-Artifacts" context would produce a BC with four roots — violating the one-aggregate-per-BC discipline applied consistently throughout Doc-4B–4J and not authorized by Doc-2 §2, which enumerates them as four separate aggregates. The Doc-4J Suggestion-family precedent (three roots in one BC) arose because Doc-2 §2 defined them as a single Suggestion aggregate with three roots — that is not the AI Module-9 case. Four BCs confirmed.

**Q2 — Matching-assist artifact home:**

**Ruling: BC-AI-1 Recommendation is confirmed.** Master Architecture §18 describes the matching-assist artifact as a "confidence suggestion" — a recommendation artifact RFQ optionally consumes. BC-AI-1 (Recommendation) is the only BC whose charter covers vendor/RFQ recommendation artifacts. DF-AI-3 correctly keeps the routing decision in RFQ. Pass-A should author a specific contract group for the matching-assist confidence artifact within BC-AI-1.

**Q3 — Event-refresh posture:**

**Ruling: Pull/derive-on-demand confirmed as the frozen structure posture.** The optional future `[ESC-AI-EVENT]` cache-refresh path is permitted within the stated three constraints (AI-local target; existing upstream event by pointer; `[ESC-AI-EVENT]` escalation). No structural change is needed to accommodate either posture.

---

## Structure Freeze Readiness

| Domain | Assessment |
|---|---|
| Family Map Conformance | PASS — exact Doc-4A §1.3 / Master Architecture §16/§18 conformance |
| Ownership Integrity | PASS — four aggregates, one-to-one, no leakage |
| AI Boundary Integrity | PASS — moat and firewall fully asserted, no authoritative record owned |
| Dependency Integrity | PASS — six DF-AI-* markers, correct direction, no unauthorized write paths |
| Event Integrity | PASS — zero production, zero consumption, `[ESC-AI-EVENT]` correctly reserved |
| Authorization Integrity | PASS — no slug invented, reuses consuming module entitlements |
| Structure Completeness | PASS — 17 sections, no missing foundational section, no duplication |

---

## Final Status

```
APPROVE FOR STRUCTURE FREEZE
```

**Can Doc-4K Structure be frozen and moved to Pass-A Authoring?**

```
YES
```

**Justification.** The structure is fully corpus-conformant across all 12 review domains. The family-map binding is exact. All four Doc-2 §2 Module-9 aggregates are correctly assigned one-to-one to four BCs. The procurement moat and Trust firewall are asserted at every relevant structural seam. The dependency map is complete and directionally correct. No event, slug, audit action, POLICY key, or aggregate is invented. All four escalation markers are justified and correctly bounded. The three open questions in §K17 are ruled on by this Review (BC count = four retained; matching-assist = BC-AI-1 confirmed; event posture = pull/derive-on-demand confirmed). The two NITPICKs (typographic error in §K3; §K6 service label ambiguity) carry zero governance risk and are disposable at freeze time or first patch. No structural defect blocks Pass-A authoring.

**Required path:** Structure Patch (optional — NITPICKs only, may be applied at freeze time) → Structure FROZEN → Pass-A Authoring.

If the two NITPICKs are accepted as-is, the structure may be frozen directly without a patch.

---

*End of Doc-4K_Structure_Independent_Hard_Review_v1.0. Structure Hard Review — Module 9 AI Layer. BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 2 (K-HR-N1: typographic "an Hard-Review" in §K3; K-HR-N2: §K6 service surface labels not explicitly excluded from being read as frozen service identifiers, resolved by §K11/§K14). Status: APPROVE FOR STRUCTURE FREEZE. Open questions ruled: BC count = four retained · matching-assist home = BC-AI-1 confirmed · event-refresh posture = pull/derive-on-demand confirmed. Can proceed to Pass-A: YES. Corpus authority: Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A → Doc-4B–4J (all FROZEN) → Doc-4K_Brief_Reconciliation_Note_v1.0.*
