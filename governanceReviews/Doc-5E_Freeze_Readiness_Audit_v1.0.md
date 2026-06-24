# Doc-5E — Freeze Readiness Audit v1.0

| Field | Value |
|---|---|
| Subject | Doc-5E — RFQ Procurement Engine (Module 3) API Realization (§0–§9 + Appendix A) |
| Audit date | 2026-06-24 |
| Authority | `Doc-5_Program_Governance_Note_v1.0 §6/§8`; `Doc-5A Appendix A` (the checklist gate); `Doc-4A §18.2` (POLICY-key registration) |
| Realizes | `Doc-4E` (M3 contracts, FROZEN — 38 contracts) on HTTP, governed by `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) |
| Verdict | **READY TO FREEZE** *(gate cleared 2026-06-24)*. Content complete; realization conformant; **0 open BLOCKER/MAJOR/MINOR.** The sole freeze gate — `[ESC-RFQ-POLICY]`, two `rfq.*` POLICY keys absent from Doc-3 §12.2 — is **resolved** by the approved additive `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ` (Option A; human owner approval). Re-run §4 check = PASS. Recommend Board declare Doc-5E **FROZEN** and authorize the consolidation manifest. |
| Original verdict | CONDITIONAL — NOT YET READY (the `[ESC-RFQ-POLICY]` gate, §4). Retained below for provenance; **cleared** by Patch v1.1. |

## 1. Section completeness (content passes)

| Section | Pass | State |
|---|---|---|
| §0 Document Control, Precedence & Conformance | Pass-1 | drafted |
| §1 Scope, Audience & M3 Surface Partition | Pass-1 | drafted; partition + dual-path rule; carried DE-1…DE-8 + `[ESC-RFQ-*]` |
| §2 Realized Endpoint Inventory | Pass-1 | drafted; **30** caller-facing endpoints; no caller `202` |
| §3 Cross-Cutting Authz, Context & Non-Disclosure Wire Model | Pass-1 | drafted; mechanism-only; R5 non-disclosure first-class |
| §4 RFQ Authoring & Lifecycle | Pass-2 | drafted; §5.4 machine (Doc-4M); `reissue_rfq` §0.4 convention |
| §5 Quotation & Invitation-Response | Pass-2 | drafted; §5.5 machine; three-instrument quota (R7) |
| §6 Buyer Evaluation, Comparison & Closure | Pass-2 | drafted; R6 no-auto-decision; comparison read-only |
| §7 Routing Governance & Engine/Routing Reads | Pass-2 | drafted; `manage_routing_rule` per-variant (freeze fence); R5 reads |
| §8 Out-of-Wire Boundary | Pass-3 | drafted; 8 engine workers, internal legs, DE-1…DE-8, outbox events; protocol exclusion (REST/SSE/WS/webhook/GraphQL); flag-and-halt |
| §9 Conformance & Carried Items | Pass-3 | drafted; carried register |
| Appendix A Conformance Attestation | Pass-3 | drafted; all applicable `[B]`/`[M]` PASS + dedicated R5 + engine-execution attestations |

All 10 sections + Appendix A present (per `Doc-5E_Structure_v1.0_FROZEN`). No "TBD"; no orphan forward reference. Structure conformance: ✅.

## 2. Finding-register disposition (Pass-1 + Pass-2 + Pass-3 reviews)

| Item | Disposition |
|---|---|
| Pass-1 PATCH-01/02 + m-01 + clarifications | **RESOLVED** — §2.1 dual-path leg rule; §2.5 nested/source addressing finalized; `manage_routing_rule` per-variant deferred to Pass-2. |
| Pass-2 r1 **MAJOR-01** (`manage_routing_rule` freeze fence) | **RESOLVED** — §7.2 fence: single Doc-4E contract preserved; no new contract/permission/audit/state/authority; count 38. |
| Pass-2 r1 **MIN-01/02/03** | **RESOLVED** — §4.6 source unchanged; §5.3 Billing-owns-ledger; §7.3 matching results observational only. |
| Pass-2 r2 (m-01/02/03; NP-01/02) | **RESOLVED** — concurrency token; §0.4 bases; first-open transition; CONFLICT class; two-phase note. |
| Pass-3 r1 (MINOR-01/02; NP-01/02) | **RESOLVED** — §8.2 dual-path traceability; CHK-5A-121 objective gate; §8.5 GraphQL exclusion; engine-execution attestation. |
| Pass-3 r2 (CHK-5A-082 coverage; §9.3/§122 location; §8.1 language; §110 §12 precision; §8.4 cleanup) | **RESOLVED** — per Pass-3 status header. |

**0 open BLOCKER/MAJOR/MINOR on the realization.** The only open item is the §3 carried-register gate below.

## 3. Carried items

| ID | Status | Gate? |
|---|---|---|
| **DE-1…DE-8** | OPEN (out-of-wire, §8) | **No** — consumed in-process / via outbox; no M3 wire realized |
| `[ESC-RFQ-AUDIT]` | OPEN | **No** — bound to nearest Doc-2 §9 action; channel additive; never invented |
| `[ESC-RFQ-SLUG]` | OPEN | **No** — interim `staff_*`; least-privilege slug = future Doc-2 §7 patch |
| **`[ESC-RFQ-POLICY]`** | **RESOLVED** (Patch v1.1) | Gate **cleared** — two `rfq.*` keys registered in Doc-3 §12.2 (§4). No longer blocking. |

## 4. ✅ FREEZE GATE — `[ESC-RFQ-POLICY]` — RESOLVED (was the blocking finding)

> **Resolution (2026-06-24):** the additive `Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ` (Status: APPROVED — human owner) registers the two `rfq.*` keys below in Doc-3 §12.2 (`rfq.idempotency_dedup_window` *[start: 24h]*, `rfq.list_page_size_max` *[start: 100]*), satisfying Doc-4A §18.2. The gate is **cleared**. The original finding is retained verbatim below for provenance.

### 4.1 The gap (verified against the frozen corpus)

`Doc-3 §12.2` (POLICY key inventory) is the authoritative POLICY-key registry; `Doc-4A §18.2` mandates *"a POLICY key MUST exist in Doc-3 §12.2."* The §12.2 `rfq.*` block (Doc-3 v1.0.1, "Lifecycle" row) registers **only** lifecycle keys:

> `rfq.min_scope_chars`, `rfq.draft_dormancy_days`, `rfq.approval_reminder_hours`, `rfq.approval_stale_days`, `rfq.category_min_level`, `rfq.quote_window_min/max_days`, `rfq.review_allowance_days`, `rfq.decision_allowance_days`, `rfq.max_extensions`, `rfq.edit_clock_reset`, `rfq.reissue_won_block_days`

Doc-5E's realization depends on **two `rfq.*` POLICY keys that are not registered** anywhere in §12.2 (nor in the additive `Doc-3_Policy_Key_Registration_Patch_v1.0`, which registers `core.*` keys only):

| # | Needed key (intent) | Referenced at | §12.2 status |
|---|---|---|---|
| 1 | `rfq.*` **idempotency replay dedup-window** (Doc-5A §9.7 replay window for `Idempotency: required` mutations) | §4.3, §5.4, §6.4, §7.4; CHK-5A-080/081 | **ABSENT** |
| 2 | `rfq.*` **list pagination page-size bound** (per-list max page size) | CHK-5A-071 (`list_rfqs`, `list_quotations_for_rfq`, `list_invitations`) | **ABSENT** |

(Rate/quota are covered: `abuse.buyer_rfq_rate_limit` exists in §12.2; quotation quota is Billing-owned, DE-7. The gap is the two keys above only.)

### 4.2 Why the gate fires (Doc-5E's own FROZEN structure)

`Doc-5E_Structure_v1.0_FROZEN` — Open Carried Items, `[ESC-RFQ-POLICY]`:

> *"Conditional — No if all referenced keys exist in Doc-3 §12.2; **blocks if a content pass references an unregistered key** (`CHK-5A-121`; Doc-3 §12.2 additive first)."*

Doc-5E deliberately adopted a **stricter** stance than Doc-5C (whose DC-5 treated the same key-class as a *tracked, non-gate* finalization). Under Doc-5E's frozen definition, the realization's dependence on two unregistered `rfq.*` keys **trips the gate**. Doc-5E correctly did **not** invent the keys (it bound them by the `[ESC-RFQ-POLICY]` marker — `CHK-5A-121/123` anti-invention upheld), so this is a *registration* gap, not a conformance defect.

### 4.3 Resolution (M0 precedent — additive, human/Board-approved)

The sanctioned mechanism is an **additive Doc-3 §12.2 registration patch**, exactly as `Doc-3_Policy_Key_Registration_Patch_v1.0` did for the 18 `core.*` Module-0 keys (Status: APPROVED — additive registration only; satisfies Doc-4A §18.2). The Doc-5E equivalent registers the two `rfq.*` keys above (key name, category, value type, owner Module 3 behavioral / Doc-3 inventory-owner, purpose, mutability POLICY, start value), touching no existing key and no Doc-3 semantic. **This patch modifies a rank-0 frozen Doc-3 additively and requires human/Board approval** (CLAUDE.md authority order; Doc-4A §18.2) — it is **not** a Doc-5E self-decision.

> **Note for the Board — consistency choice.** Doc-5C froze with DC-5 (the same key-class) **open** as a tracked, non-gate finalization. The Board MAY instead (a) **register now** via the additive patch → Doc-5E freezes clean under every reading *(recommended — cheapest, removes ambiguity, satisfies Doc-5E's strict gate)*; or (b) **re-classify** `[ESC-RFQ-POLICY]` to the Doc-5C DC-5 precedent (tracked, non-gate). Option (b) is a structure-interpretation call the Board owns; the auditor does not self-select it because Doc-5E's frozen gate text reads strict.

## 5. Anchor verification (sampled, verbatim against frozen corpus)

| Anchor | Confirmed |
|---|---|
| `Doc-2 §0.3` → M3 namespace = `rfq` (App B.1) | ✅ |
| `Doc-4A Appendix B.2` → `rfq_` error-code prefix | ✅ pointer-only |
| `Doc-4E` PassB = **38 contracts** (30 caller-facing + 8 System engine workers) | ✅ partition reconciles |
| `Doc-5A §5.2` method mapping (create→POST/201, edit→PATCH, command→POST named, read→GET; no PUT) | ✅ realized §4–§7 |
| `Doc-5A §6.2` class→status (incl. `STATE`/`CONFLICT`→409, `QUOTA`→403, `RATE_LIMITED`→429) | ✅ |
| `Doc-5A §7.1–§7.6` identity/context/authz carriage | ✅ realized §3 |
| `Doc-4M` §5.4 RFQ machine + patched edges (`under_review→draft`, `matching→expired`) | ✅ legal transitions only |
| `Doc-3 §9.1` no auto-decision (R6); `Doc-3 §5.1` no public board (R5); `Doc-3 §4.1.1` three-instrument (R7) | ✅ FIXED, by pointer |
| `Doc-4A §22.1 C-05` top-level `reference_id` (body-bearing) | ✅ |
| **`Doc-3 §12.2` `rfq.*` POLICY keys** | ⚠ **gap — see §4** (lifecycle keys present; dedup-window + page-size **absent**) |

## 6. Conformance & consistency

- **Appendix A attestation:** all applicable `[B]`/`[M]` PASS; `[m]` PASS no deviation; N/A cite absent precondition (async/event-completion/versioning-bump/deprecation). Dedicated **R5 non-disclosure** (7 aspects PASS) and **engine-execution** (no caller surface — the moat invariant) attestations present.
- **CHK-5A-121** (nothing coined): **PASS (conditional)** — anti-invention upheld; the conditional is exactly the §4 registration gate.
- **R1 out-of-wire:** ✅ — 8 engine workers / internal legs / DE-1…DE-8 / outbox events fenced; no caller `202`; explicit protocol exclusion incl. GraphQL; flag-and-halt.
- **R5 / R6 / R7:** ✅ — non-disclosure, no-auto-decision, firewall + three-instrument quota realized as first-class wire invariants.
- **Reference-never-restate:** ✅ — representations, codes, POLICY keys, audit actions, events, state machines, Doc-3 rules bound by pointer.

## 7. Patch / ratification status

**One patch — APPROVED and applied.** The additive **Doc-3 §12.2 `rfq.*` POLICY-key registration** (`Doc-3_Policy_Key_Registration_Patch_v1.1_RFQ`, §4.3) was authored and **human-owner-approved** (2026-06-24), clearing the strict `[ESC-RFQ-POLICY]` gate. No other architecture-touching change is implicated (the realization conventions are §0.4 transport disambiguations within Doc-5E's authority).

## Verdict

**READY TO FREEZE.** The realization is complete and conformant: structure conformance ✅, anchor verification ✅ (the §4 gap closed by Patch v1.1), Appendix A attestation ✅, **0 open BLOCKER/MAJOR/MINOR**. The sole blocker — the `[ESC-RFQ-POLICY]` freeze gate — is **cleared** by the approved additive Doc-3 §12.2 registration. Carried `DE-*` / `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-SLUG]` are tracked Doc-4E/Doc-2 future items, not freeze gates.

**Recommended Board action:**

> **Doc-5E v1.0 — STATUS: FROZEN.** Consolidate `Doc-5E_Content_v1.0_Pass1…3` + `Doc-5E_Structure_v1.0_FROZEN` + the resolved registers into `Doc-5E_SERIES_FROZEN_v1.0`, then sync the non-authoritative trackers. Doc-5E (RFQ Procurement Engine, Module 3 — the procurement moat) becomes the authoritative API-realization layer for M3. Remaining: Doc-5D, 5F…5M.

*Freeze Readiness Audit — non-authoritative provenance record. On any conflict, the frozen corpus and Doc-5A (FROZEN) win; flag-and-halt. Architecture-touching artifacts (the Doc-3 §12.2 patch) require human approval — code/AI review is insufficient.*
