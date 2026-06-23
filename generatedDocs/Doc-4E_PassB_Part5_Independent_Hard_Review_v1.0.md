# Doc-4E Pass-B Part-5 Independent Hard Review

**Report ID:** Doc-4E_PassB_Part5_Independent_Hard_Review_v1.0  
**Document Under Review:** Doc-4E_Content_v1.0_PassB_Part5_EvaluationComparisonAward.md  
**Scope:** BC-5 — Buyer Evaluation & Comparison + BC-6 — Procurement Decision & Closure (§E8 — 6 contracts)  
**Reviewer Role:** Architecture Board Independent Hard Reviewer · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Governance Auditor  
**Review Date:** 2026-06-17  
**Authoritative Corpus:** Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Parts 1–4_v1.0_FROZEN — all FROZEN

---

## Executive Verdict

Part 5 is a structurally strong final-part document. The governance invariants that matter most in procurement — single-award cardinality, decision-support-never-auto-decision, buyer-preference firewall, quotation confidentiality, and Communication/Operations boundary isolation — are all correctly and multiply stated. Events, audit bindings, and DDD boundaries are clean.

One MAJOR is identified: the award contract (§E8.4) stage 7 REFERENCE check allows awarding any "submitted" quotation on the RFQ, without a BUSINESS rule explicitly verifying the selected quotation is in the persisted shortlist set. An AI coding agent can implement an award path that bypasses the shortlist governance step — selecting a vendor who was never shortlisted — without triggering any validation failure. This is the highest-risk defect in the document.

Three MINORs and three NITPICKs complete the finding set. All are targeted, non-architectural fixes. The document is recommended for patch, then freeze.

**APPROVE WITH PATCH** — 0 BLOCKERs · 1 MAJOR · 3 MINORs · 3 NITPICKs.

---

## Area-by-Area Findings

### Area 1 — Pass-A Conformance

**Result: PASS**

**Contract inventory:** 6 contracts per Pass-A §E8 — `generate_comparison_statement.v1`, `shortlist_quotation.v1`, `manage_clarification.v1` / `invoke_best_and_final.v1` (bundled), `award_rfq.v1`, `close_lost_rfq.v1`, `get_comparison_statement.v1`. All present; none extra; none missing. ✓

**Ownership drift:** None. BC-5 owns comparison/shortlist/clarification/best-and-final. BC-6 owns award/closure. The post-award engagement is Operations' (DE-4). The clarification thread is Communication's (DE-6). The `submitted → selected`/`→ not_selected` quotation edges are correctly claimed as Part-5-owned (deferred from Part 4). ✓

**Lifecycle drift:** None. RFQ-head edges are `quotations_received → buyer_reviewing` (§E8.6 read side effect), `buyer_reviewing → shortlisted` (§E8.2), `shortlisted → closed_won` (§E8.4), `shortlisted → closed_lost` (§E8.5). All match Doc-2 §5.4. No edge invented. ✓

**Event drift:** None. `RFQClosedWon`, `RFQClosedLost`, `QuotationSelected` emitted; no shortlist event (state + audit only); no comparison event (derived refresh). All match Doc-2 §8. ✓

**Audit drift:** None. RFQ domain: "shortlist, close won/lost" (Doc-2 §9). Quotation domain: "select, reject" (Doc-2 §9). `[ESC-RFQ-AUDIT]` carried for clarification orchestration actions not yet enumerated in Doc-2 §9. ✓

**Pass-B mission:** Correctly stated — hardens Pass-A §E8 contracts without redesign; no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. ✓

---

### Area 2 — BC-5 Contract Inventory Completeness

**Result: PASS**

| Expected | Present | Contract ID |
|---|---|---|
| Comparison generation | ✓ | `rfq.generate_comparison_statement.v1` (21.5 System) |
| Comparison retrieval | ✓ | `rfq.get_comparison_statement.v1` (21.3 Query) |
| Shortlist handling | ✓ | `rfq.shortlist_quotation.v1` (21.4 Command) |
| Clarification handling | ✓ | `rfq.manage_clarification.v1` (21.4 Command, bundled) |
| Best-and-final handling | ✓ | `rfq.invoke_best_and_final.v1` (21.4 Command, bundled with clarification) |

No missing contracts. No extra contracts. ✓

---

### Area 3 — BC-6 Contract Inventory Completeness

**Result: PASS**

| Expected | Present | Contract ID |
|---|---|---|
| Award | ✓ | `rfq.award_rfq.v1` (21.4 Command) |
| Close without award | ✓ | `rfq.close_lost_rfq.v1` (21.4 Command) |
| Quotation outcome handling | ✓ | Driven by award/close within their transactions (Part-5-owned `submitted → selected/not_selected`) |
| RFQ terminal transitions | ✓ | `shortlisted → closed_won` (§E8.4); `shortlisted → closed_lost` (§E8.5) |

No missing contracts. No extra contracts. ✓

---

### Area 4 — Validation Matrix Integrity

**Result: PASS WITH FINDINGS (PB5-M2)**

**§E8.1 `generate_comparison_statement.v1` (21.5 System):**
- Stage 1 SYNTAX, stages 2–5 collapsed (trigger authenticity per Doc-4A §5.6), stage 6 STATE, stage 7 REFERENCE, stage 8 BUSINESS. ✓
- 21.5 collapse correctly applied. ✓

**§E8.2 `shortlist_quotation.v1` (21.4 Command):**
- Stages 1, 2, 3, 4, 6, 6/concurrency, 7, 9 present. ✓
- Stage 5 DELEGATION: **absent** — the H.3 convention states "buyer decision commands not delegation-eligible" but this is not represented as an explicit row in the matrix. See PB5-M2.
- Stage ordering correct (no 6 before 5, no 8 before 7). ✓

**§E8.3 `manage_clarification.v1` / `invoke_best_and_final.v1` (21.4 Command):**
- Stages 1, 2, 3, 4/6, 9, 8 present. ✓ (Stage 4 SCOPE and 6 STATE combined in one row, which is non-standard but acceptable for a pre-award orchestration contract with no independent SCOPE check beyond the STATE check.) 
- Stage 5 DELEGATION: **absent** — see PB5-M2.
- Stage 8 BUSINESS and 9 POLICY order: §E8.3 lists stage 9 POLICY before stage 8 BUSINESS in the matrix rows. Doc-4A §11.2 mandates `8 BUSINESS` before `9 POLICY`. This is a **stage-ordering violation**. See **PB5-M3**.

**§E8.4 `award_rfq.v1` (21.4 Command):**
- Stages 1, 2, 3, 4, 6, 6/concurrency, 7, 8×2 present. ✓
- Stage 5 DELEGATION: **absent** — see PB5-M2.
- No stage 9 POLICY (no POLICY key governs award eligibility beyond ORG threshold). ✓

**§E8.5 `close_lost_rfq.v1` (21.4 Command):**
- Stages 1, 2, 3, 4, 6, 6/concurrency present. ✓
- Stage 5 DELEGATION: **absent** — see PB5-M2.
- No stage 7 REFERENCE, 8 BUSINESS, or 9 POLICY rows. Close-without-award has no REFERENCE dependencies (the quotations are marked `not_selected` as a bulk transition, not individually referenced) and no soft-cap POLICY. The absence is defensible; REFERENCE check is absorbed into the SCOPE ownership check. ✓

**§E8.6 `get_comparison_statement.v1` (21.3 Query):**
- Stages 1, 2, 3, 4, 7 present. ✓ No stages 5, 6, 8, 9 (reads, correct). ✓

---

### Area 5 — Authorization Integrity

**Result: PASS WITH FINDING (PB5-N1)**

All slugs verified against Doc-2 §7:
- `can_approve_vendor_selection` (O,D,M): shortlist (§E8.2), close-without-award primary (§E8.5), clarification authority (§E8.3). ✓
- `can_award_rfq` (O,D): award (§E8.4). ✓ Also listed as alternate for close-without-award — see PB5-N1.
- `can_view_rfq` / `can_view_all_rfqs`: comparison read (§E8.6). ✓
- `can_create_rfq`: clarification/best-and-final orchestration (§E8.3; RFQ-owner authority). ✓
- No slug invented. ✓

**ORG award-threshold enforcement:** Stage 8 BUSINESS in §E8.4 explicitly checks "value above org threshold requires Director/Owner approval (consumed from Identity)" (Doc-3 §9.4). ✓ Consumed from Identity — not re-derived. ✓

**Buyer decision non-delegation:** H.3 states "buyer decision commands not delegation-eligible (§6B not populated — the decision is the buyer org's)." This is correctly stated in the conventions and authorization matrices. ✓ The omission of explicit stage 5 rows is addressed in PB5-M2.

**`can_award_rfq` as alternate close-lost slug — PB5-N1:** §E8.5 §3 AUTHZ and §5 Authorization Matrix allow `can_award_rfq` "where the org binds closure to award authority." Doc-2 §7 maps both slugs to "Vendor selection / award," which is broad enough to encompass closure. Doc-3 §9.2 Exit row does not explicitly assign a slug to `close_lost`; the derivation is implicit from the combined Doc-2 §7 row. This is defensible but should cite its authority explicitly. See PB5-N1.

---

### Area 6 — Evaluation Governance Integrity

**Result: PASS**

**Comparison ownership:** `generate_comparison_statement.v1` (BC-5) is the sole owner of comparison statement writes. Sourced from `matching_results` (BC-2 authoritative display source, PA-04). No live Trust/Marketplace read. ✓

**Shortlist ownership:** `shortlist_quotation.v1` (BC-5). Shortlist set persisted as a state transition (`buyer_reviewing → shortlisted`) with the shortlist IDs. ✓

**Clarification ownership:** `manage_clarification.v1` (BC-5) orchestrates the evaluation step. Thread entities are Communication-owned (DE-6) — RFQ does not author them. ✓ Correctly stated in §E8.3 §11 and §12. ✓

**Best-and-final ownership:** `invoke_best_and_final.v1` (BC-5) invokes the round. Sealed revisions reuse Part-4 `revise_quotation.v1`. Cap `eval.baf_rounds_max`. ✓ No new revision mechanism invented. ✓

**No auto-recommendation:** "Never marks/recommends a winner" stated in §E8.1 §4 BUSINESS check, §E8.1 §12, §E8.6 §12, and H.10. Doc-3 §9.1 FIXED. ✓

---

### Area 7 — Award Governance Integrity

**Result: PASS WITH FINDING (PB5-MA1)**

**Single-award invariant:** Enforced at SYNTAX (exactly one `selected_quotation_id`), BUSINESS (multi-award `BUSINESS`), and atomicity (one transaction for RFQ + all quotation transitions). ✓ Doc-2 §5.4 1:1 cardinality FIXED. ✓

**Buyer decision authority:** `can_award_rfq` (O,D only — Director/Owner tier). ✓ Not delegation-eligible. ✓

**ORG award threshold:** Stage 8 BUSINESS — value above org threshold requires Director/Owner approval consumed from Identity (Doc-3 §9.4). ✓

**Terminal-state protection:** `closed_won` never reopens; re-issue is BC-1 `reissue_rfq`. ✓ Concurrent award → `CONFLICT`. ✓

**Shortlist bypass at award — PB5-MA1:** §E8.4 §4 Validation Matrix stage 7 REFERENCE reads: "`selected_quotation_id` is a `submitted`/shortlisted quotation on this RFQ." The source authority is `Doc-4A §9.5; Doc-2 §10.4`. This check verifies the quotation is `submitted` and belongs to this RFQ. However, it does not verify the quotation is in the persisted shortlist set.

In the data model, the RFQ state advances to `shortlisted` (at §E8.2) and the shortlisted quotation IDs are written to storage (returned in §E8.2 response as `shortlisted_quotation_ids`). But individual quotation rows do not change state at shortlisting — they remain `submitted`. An `award_rfq.v1` call with a `selected_quotation_id` pointing to any `submitted` quotation on the RFQ (including one that was never shortlisted, or was removed from the shortlist in a later shortlist edit) would pass the current REFERENCE check and reach the BUSINESS check, which only verifies the single-award cardinality and ORG threshold.

There is no BUSINESS rule row in §E8.4 that reads: "`selected_quotation_id` must be in the current shortlist set." This means an AI coding agent can implement an award path that bypasses shortlist governance entirely. Doc-3 §9.4 describes the award as proceeding from the shortlist but does not explicitly state that the selected quotation must be in the shortlist set as a machine-enforceable constraint. The absence of this constraint in the validation matrix is a defect.

**Impact:** Award of a non-shortlisted quotation is possible with no validation failure — the highest-risk procurement governance bypass in Module 3. Severity: **MAJOR (PB5-MA1)**.

**Required Fix:** Add a stage 8 BUSINESS row to §E8.4 §4 Validation Matrix: "`selected_quotation_id` is in the current shortlist set (persisted from `shortlist_quotation.v1` — Doc-3 §9.4); award outside the shortlist is foreclosed" → `BUSINESS`. Annotate the cross-reference to §E8.2's shortlist set write.

---

### Area 8 — Procurement Fairness Integrity

**Result: PASS**

No subscription plan, entitlement, billing state, commercial tier, or vendor spend influences any evaluation, comparison, shortlist, or award contract. ✓

H.10 states: "No plan/entitlement gates evaluation, comparison ranking, or award (§4B; Doc-3 §11.8/§12.1)." ✓ Cross-module references confirm no Billing (DE-7) read in any Part 5 contract. ✓

Loss feedback is banded, not exact, off by default (Doc-3 §9.5). Exact-delta feedback is not provided (trains quote dumping). ✓

Expiry-without-buyer-action feeds nothing negative for vendors (FIXED). ✓

Structured `reason_code` for close-lost is POLICY-managed (Doc-3 §9.5) — not invented here. ✓

---

### Area 9 — Buyer Preference Firewall

**Result: PASS**

Buyer preference (Approved-vendor preference) is buyer-scoped only per Doc-3 §7.5 FIXED: "never crosses tenants, never feeds platform scores, never affects other buyers' routing." ✓

In §E8.1 §12 AI-Agent Notes, display data is sourced from `matching_results` (PA-04) — Approved-vendor floating in the buyer's comparison sorting is already baked into the stored `matching_results` at pipeline time, buyer-scoped. ✓

In §E8.6 response: "buyer-private columns for the buyer only." ✓

H.10 states: "Buyer-preference firewall: Approved-vendor preference is buyer-scoped only — never a platform signal, never cross-tenant." ✓

No comparison column exposes buyer preference state to vendors. ✓ Non-disclosure invariant (§7.5) applied. ✓

---

### Area 10 — Quotation Confidentiality

**Result: PASS WITH FINDING (PB5-N3)**

**Vendor isolation:** Comparison statement shows vendor-standing bands, not individual quotation details across vendors. ✓ "Comparison shows bands + buyer-private columns; vendor isolation preserved (Part 4)." ✓

**Buyer-private columns:** Buyer-only; not exposed to vendors. ✓ NOT_FOUND collapse (§7.5) for any unauthorized access path. ✓

**Comparison confidentiality:** Display data sourced from `matching_results` (PA-04) — not a live Trust/Marketplace read (preserving the governance-signal firewall). ✓

**Sealed-until-close — PB5-N3:** `abuse.sealed_until_close` (Doc-3 §12.2 POLICY key) governs visibility of price terms pre-close. The Part 4 review (PB4-MA2) flagged the absence of this key from the quotation-read contract. In Part 5, the comparison statement (§E8.6) aggregates price and delivery terms for buyer review. The document does not explicitly address how `abuse.sealed_until_close` interacts with the comparison statement display pre-window-close. Doc-3 §9.1 describes the comparison as showing "price (normalized), delivery, validity, warranty, spec-compliance, vendor standing" to the buyer — this is the buyer-facing document. Whether `abuse.sealed_until_close` restricts the comparison statement pre-close (i.e., buyer cannot see prices before window close) is not addressed here. Given PB4-MA2 was flagged in the Part 4 patch, the cascade to §E8.6 should be explicitly noted. See PB5-N3.

---

### Area 11 — Communication Boundary Integrity

**Result: PASS**

**Thread ownership:** The clarification thread is Communication-owned (DE-6). Part 5 orchestrates the evaluation step and references the thread by pointer (`clarification_ref` — a uuid pointer to a Communication-owned entity). Part 5 does NOT author any thread entity or Communication contract. ✓

§E8.3 §11: "Communication (DE-6): owns the clarification/best-and-final thread channel and authors its contracts — RFQ MUST NOT author a thread entity or Communication contract." ✓

§E8.3 §12 AI-Agent Notes: "Author no clarification-thread entity or Communication contract here (DE-6)." ✓

Shortlisted-vendor notification (§E8.2 §8): Communication consumer leg. ✓ Not authored by BC-5. ✓

Closure notification (§E8.5 §11, §E8.4 §11): Communication consumer leg. ✓

---

### Area 12 — Operations Boundary Integrity

**Result: PASS**

**Engagement ownership:** The post-award engagement is Operations-owned (DE-4). Created by Operations consuming `RFQClosedWon`. Part 5 emits the event; it DOES NOT author the engagement entity or engagement lifecycle. ✓

§E8.4 §11: "Operations (DE-4): `RFQClosedWon` → Operations **creates the engagement** (RFQ does **not** author it)." ✓

§E8.4 §12 AI-Agent Notes: "The engagement is Operations' (DE-4), created off `RFQClosedWon` — never authored here." ✓

No `engagement_id` in the §E8.4 response schema (the engagement is Operations' artifact). ✓

---

### Area 13 — Event Integrity

**Result: PASS**

| Event | Owner | Trigger | Outbox | Consumers | Assessment |
|---|---|---|---|---|---|
| `RFQClosedWon` | rfq module (Doc-2 §8) | `award_rfq.v1` | same transaction, Doc-4B | Operations (engagement), Trust (performance), Communication (notification) | ✓ Correct |
| `QuotationSelected` | rfq module / quotations (Doc-2 §8) | `award_rfq.v1` | same transaction, Doc-4B | Performance inputs | ✓ Correct |
| `RFQClosedLost` | rfq module (Doc-2 §8) | `close_lost_rfq.v1` | same transaction, Doc-4B | Communication (closure notification) | ✓ Correct |

No shortlist event: "state + audit only" — correctly verified. Doc-2 §8 does not include `RFQShortlisted`. ✓

No comparison event: "derived refresh; emits nothing." ✓

No event coined. ✓ All emitted events are pre-existing Doc-2 §8 entries.

Single-authorship (Doc-4A §4.4): all consumer legs authored by their respective modules. ✓

Atomic outbox writes: `RFQClosedWon` + `QuotationSelected` in one transaction (modular monolith, Doc-2 §10.11.4). ✓

---

### Area 14 — Audit Integrity

**Result: PASS**

All audit actions are from the Doc-2 §9 confirmed inventory:

| Contract | Audit Action | Domain | Attribution | Assessment |
|---|---|---|---|---|
| `shortlist_quotation.v1` | "shortlist" | RFQ | User (buyer) | ✓ Doc-2 §9 RFQ |
| `award_rfq.v1` | "close won" + "select" (selected quotation) | RFQ + Quotation | User (buyer) | ✓ Doc-2 §9 RFQ + Quotation |
| `close_lost_rfq.v1` | "close won/lost" (lost branch) + "reject" (not-selected quotations) | RFQ + Quotation | User (buyer) | ✓ Doc-2 §9 RFQ + Quotation |
| `manage_clarification.v1` / `invoke_best_and_final.v1` | nearest §9 / `[ESC-RFQ-AUDIT]` | RFQ | User (buyer) | ✓ `[ESC-RFQ-AUDIT]` correctly carried |
| `generate_comparison_statement.v1` | none (derived; not audited §17.1) | — | System | ✓ Correct |
| `get_comparison_statement.v1` | first-open transition audited via lifecycle; read not audited | RFQ (transition) | System/User | ✓ Correct |

No audit action invented. ✓ Doc-2 §9 compliance confirmed. ✓

---

### Area 15 — Procurement Moat Protection

**Result: PASS**

| Domain | Ownership | Assessment |
|---|---|---|
| Vendor discovery / profiles / attributes | Marketplace (DE-2) — read-only by RFQ via `matching_results` (PA-04) | ✓ No Marketplace write |
| Evaluation | BC-5 / RFQ | ✓ |
| Comparison | BC-5 / RFQ (`comparison_statements`) | ✓ |
| Ranking (bands in comparison) | BC-2/RFQ (`matching_results` sourced) | ✓ Not re-derived by BC-5 |
| Shortlist | BC-5 / RFQ | ✓ |
| Selection | BC-6 / RFQ (award/close) | ✓ |
| Award | BC-6 / RFQ | ✓ |
| Post-award engagement | Operations (DE-4) — consumer leg | ✓ Not authored by RFQ |

No moat leakage identified. ✓

---

### Area 16 — Governance Signal Firewall

**Result: PASS**

Trust, Performance, Verification, and Governance signals are consumed at pipeline run (BC-2, Part 2) and stored in `matching_results`. In Part 5:
- No live Trust/Marketplace read at comparison generation or read time (PA-04 — `matching_results` is the authoritative display source). ✓
- No Trust/Performance signal mutated by any BC-5/BC-6 contract. ✓
- Trust performance update on `RFQClosedWon` / `QuotationSelected` is a consumer leg (Trust/DE-3 reads the event and authors its own update). ✓
- H.10: "No plan/entitlement gates evaluation, comparison ranking, or award." ✓

Firewall confirmed intact across all 6 Part 5 contracts.

---

### Area 17 — DDD Boundary Integrity

**Result: PASS**

BC-5 and BC-6 correctly limit themselves to evaluation, comparison, shortlist, clarification orchestration, and award/closure. No leakage into:
- **BC-1:** re-issue is BC-1's (`reissue_rfq`), correctly cross-referenced not authored. ✓
- **BC-2:** matching/scoring is BC-2's; consumed via `matching_results` (PA-04). ✓
- **BC-3:** routing governance is BC-3's. Not touched in Part 5. ✓
- **BC-4:** quotation revisions (best-and-final) reuse Part-4 `revise_quotation.v1` — not re-authored. ✓ `submitted → selected/not_selected` transitions are Part-5-owned (deferred from Part 4). ✓
- **BC-7:** governance controls are BC-7's (Part 3). Not touched in Part 5. ✓

---

### Area 18 — AI-Agent Safety

**Result: PASS WITH FINDINGS (PB5-MA1, PB5-M1, PB5-M3)**

**Award ambiguities:**

**PB5-MA1 — shortlist bypass:** The §E8.4 validation matrix does not include a BUSINESS rule verifying the `selected_quotation_id` is in the shortlist set. An AI coding agent can implement an award that skips the shortlist governance step without triggering any error. This is the most dangerous AI-agent risk in Part 5.

**PB5-M1 — comparison read state-transition mechanism:** §E8.6 is a 21.3 Query with a conditional write side effect: the first buyer open advances `quotations_received → buyer_reviewing` (PA-16). The contract states this transition occurs but does not specify the implementation mechanism — inline write within the query handler, a separate system event, a database trigger, or a background job. An AI coding agent may implement the read as side-effect-free (correct for a query) and miss the RFQ-head transition entirely, or may implement it incorrectly (e.g., as a background job that races with concurrent opens). The one-time idempotency guarantee is stated but the mechanism is unspecified. Severity: **MINOR (PB5-M1)**.

**Comparison ambiguities:**

**PB5-M3 — `quotation_revised` internal trigger mechanism:** §E8.1 `trigger_event` enum includes `quotation_revised` — labeled "internal trigger" because revision has no Doc-2 §8 event (confirmed in Part 4). The document states "revision is a non-event — Part 4 — surfaced as an internal trigger" but does not specify the mechanism by which the comparison generator receives this trigger (application-layer call, database trigger, CDC pipeline). An AI coding agent implementing `generate_comparison_statement.v1` will not know how to wire the revision trigger, creating a gap where comparison statements are not refreshed on quotation revision. Severity: **MINOR (PB5-M3)**.

**Shortlist ambiguities:**

Well-handled: non-shortlisted vendors not notified at shortlist stage (only at terminal close). ✓ Shortlist churn free pre-award but audited. ✓ Shortlist is state + audit only (no event). ✓

**Fairness ambiguities:**

Well-handled: no auto-recommendation (multiply stated). ✓ Buyer-preference is buyer-scoped (clearly bounded). ✓ Loss feedback banded, off by default. ✓

**Replay ambiguities:**

Well-handled: award replay → `closed_won` result, no duplicate engagement or events (idempotency on state assertion). ✓ Close-lost replay → `closed_lost`, no duplicate `RFQClosedLost`. ✓ Comparison generation replay → same version content, no duplicate. ✓

---

### Area 19 — Procurement-Moat Attack Review

**Result: PASS WITH FINDING (PB5-MA1)**

**Attack vector 1 — Award bypass (shortlist bypass):** An actor with `can_award_rfq` submits `award_rfq.v1` with a `selected_quotation_id` pointing to a submitted quotation that was never added to the shortlist (or was removed from the shortlist in a later shortlist edit). The current validation matrix passes this: stage 1 SYNTAX ✓, stage 2/3 AUTHZ ✓, stage 4 SCOPE ✓, stage 6 STATE (`shortlisted`) ✓, stage 7 REFERENCE (submitted quotation on this RFQ) ✓, stage 8 BUSINESS (single award, ORG threshold) ✓. No check fails. The award proceeds with a non-shortlisted vendor. This is **PB5-MA1** — identified above.

**Attack vector 2 — Multi-award via concurrent requests:** Two concurrent `award_rfq.v1` calls with different `selected_quotation_id` values. Mitigated by optimistic concurrency (`expected_version_no`) and the `CONFLICT` error class (`retryable: true`) — only one call wins; the other receives `CONFLICT`. ✓

**Attack vector 3 — Award from non-shortlisted state:** `award_rfq.v1` called from `buyer_reviewing` (skipping shortlist). Mitigated by stage 6 STATE: "award legal only from `shortlisted`" → `STATE`. ✓

**Attack vector 4 — Close-then-award (terminal bypass):** `close_lost_rfq.v1` followed by `award_rfq.v1`. Mitigated: `closed_lost` is terminal, stage 6 STATE on award requires `shortlisted` → `STATE`. ✓

**Attack vector 5 — Auto-winner injection via comparison statement:** Manipulating the comparison generator to embed a recommended winner. Mitigated by stage 8 BUSINESS invariant in §E8.1: "never marks/recommends a winner (a recommend path is a defect)." ✓

**Attack vector 6 — Buyer-preference cross-tenant leakage:** An Approved-vendor preference from buyer Org A leaking to affect buyer Org B's comparison. Mitigated by buyer-scoped isolation in H.10, Doc-3 §7.5 FIXED, and the `matching_results` display-data model (stored per-buyer-RFQ). ✓

**Attack vector 7 — Plan/entitlement gating award:** A premium-plan buyer gaining award authority that a basic-plan buyer lacks. Mitigated by H.10 and H.3: no plan/entitlement gates award; `can_award_rfq` is a permission slug, not an entitlement check. ✓

**Summary:** One attack path confirmed viable (PB5-MA1 shortlist bypass). All others mitigated.

---

## Findings Detail

### PB5-MA1 (MAJOR) — §E8.4 `award_rfq.v1`: No BUSINESS rule verifying `selected_quotation_id` is in the shortlist set; shortlist governance bypass path confirmed

**Location:** §E8.4 — section **4. Validation Matrix**, **8. BUSINESS check**.

**Description:** The stage 7 REFERENCE check in §E8.4 verifies that `selected_quotation_id` is "a `submitted`/shortlisted quotation on this RFQ" — citing `Doc-4A §9.5; Doc-2 §10.4`. Individual quotation rows do not change state when shortlisted (they remain `submitted`); shortlisting is an RFQ-level operation that writes a shortlist set. The REFERENCE check effectively verifies only that the quotation is `submitted` and belongs to this RFQ — it cannot distinguish a shortlisted quotation from a non-shortlisted one without an explicit lookup against the persisted shortlist set.

The stage 8 BUSINESS check adds: "exactly one selected quotation (FIXED)" and "ORG award-threshold approval." Neither check verifies shortlist membership.

**Confirmed exploit path:** `award_rfq.v1` with a `selected_quotation_id` pointing to a `submitted` but non-shortlisted quotation on this RFQ — all validation stages pass, award proceeds, non-shortlisted vendor wins. The shortlist governance step (§E8.2) is completely bypassed.

**Corpus reference:** Doc-3 §9.4: "Single award: exactly one selected quotation → `closed_won` → engagement (frozen 1:1)." The award process is described as following shortlisting (§9.2 → §9.4 workflow sequence), but this workflow sequence is not enforced as a machine-level constraint in the §E8.4 validation matrix.

**Impact:** Procurement integrity breach — a buyer (or an AI coding agent acting on the buyer's behalf) can award any submitted vendor, bypassing the formal shortlist evaluation step. This is the highest-risk governance gap in Module 3.

**Required Fix:** Add a stage 8 BUSINESS row to §E8.4 §4 Validation Matrix:

> `selected_quotation_id` in shortlist set | 8 BUSINESS | Doc-3 §9.4; §E8.2 shortlist | `selected_quotation_id` must be in the current persisted shortlist set (written by `shortlist_quotation.v1`); award outside the shortlist is foreclosed | `BUSINESS`

Also add to §E8.4 §12 AI-Agent Implementation Notes: "The selected quotation must be in the shortlist set (persisted at §E8.2). Award of a non-shortlisted quotation is foreclosed (BUSINESS); implement the shortlist-membership check before committing the award transaction."

---

### PB5-M1 (MINOR) — §E8.6 `get_comparison_statement.v1`: `quotations_received → buyer_reviewing` transition mechanism unspecified

**Location:** §E8.6 — section **6. State Machine Enforcement**, **12. AI-Agent Implementation Notes**.

**Description:** §E8.6 is a 21.3 Query. Its State Machine Enforcement section correctly states: "The first buyer open drives `quotations_received → buyer_reviewing` (Doc-2 §5.4)." This is a conditional write side effect in a read contract (PA-16). The mechanism — whether this is an inline write within the query handler, a separate system event, a CDC trigger, or an application-level callback — is not specified. The §10 Idempotency Rules state "the transition is naturally idempotent on state" (correct) but do not describe the implementation path.

**Impact:** An AI coding agent implementing `get_comparison_statement.v1` as a pure read will miss the RFQ-head transition. An AI coding agent that does attempt to implement the side effect may implement it as a racy background job (violating the "same transaction" expectation) or as an event (no such event exists in Doc-2 §8). The `buyer_reviewing` state transition is required before any evaluation workflow begins (non-shortlisted vendors show "under evaluation" only from this state).

**Corpus reference:** Doc-2 §5.4 (`quotations_received ──buyer opens comparison──▶ buyer_reviewing`); Pass-A PA-16.

**Required Fix:** Add to §E8.6 §6 State Machine Enforcement: "Implementation: on first buyer open (RFQ in `quotations_received`), write `rfqs.state = buyer_reviewing` inline within the query handler — in the same DB transaction as the `comparison_statements` read, before returning the response. This is the only write in this query contract; it is gated on `state = quotations_received` (idempotent: subsequent opens do not re-transition, no write needed)."

Add to §E8.6 §12 AI-Agent Implementation Notes: "This read contract has one conditional write: if RFQ is in `quotations_received`, advance to `buyer_reviewing` (Doc-2 §5.4, PA-16) in the same transaction. Implement as an inline upsert-on-state, not a background job or event. The transition is idempotent — gate on `state = quotations_received`."

---

### PB5-M2 (MINOR) — §E8.2/§E8.4/§E8.5/§E8.3: Stage 5 DELEGATION not represented as an explicit row in validation matrices

**Location:** §E8.2 §4, §E8.3 §4, §E8.4 §4, §E8.5 §4 — Validation Matrix.

**Description:** H.3 states "buyer decision commands are not delegation-eligible (§6B not populated — the decision is the buyer org's)" and the Authorization Matrices for each affected contract state "Delegation not eligible." However, the validation matrices for all four buyer-decision command contracts (shortlist, manage_clarification/invoke_best_and_final, award, close-lost) have no stage 5 DELEGATION row. Doc-4A §11.2 mandates stage 5 in the canonical nine-stage sequence for 21.4 Command contracts; omission requires explanation. The convention at H.3 provides the policy basis, but an AI coding agent reading only the per-contract matrix will not encounter it.

**Corpus reference:** Doc-4A §11.2 (canonical nine-stage order; stages 2–5 always before 6–9).

**Required Fix:** Add a stage 5 DELEGATION row to each of §E8.2, §E8.3, §E8.4, §E8.5 validation matrices:

> `—` | 5 DELEGATION | Doc-4A §6B; Doc-3 §9.4; H.3 | Buyer decision authority is not delegation-eligible — the decision is the buyer org's own; §6B not populated | n/a (not eligible)

This makes the "not eligible" determination explicit in the matrix rather than implicit through convention reference alone.

---

### PB5-M3 (MINOR) — §E8.3 Validation Matrix stage 9 POLICY listed before stage 8 BUSINESS; and §E8.1 `quotation_revised` internal trigger mechanism unspecified

**Location:** §E8.3 §4 Validation Matrix; §E8.1 §8 Event Binding, §12 AI-Agent Notes.

**Part A — Stage ordering violation in §E8.3:**

The §E8.3 validation matrix lists stage 9 POLICY ("best-and-final cap `eval.baf_rounds_max`") before stage 8 BUSINESS ("fair-information rule — material clarifications broadcast"). Doc-4A §11.2 mandates `8 BUSINESS → 9 POLICY` order; this is reversed. While the practical implementation impact is low (both are pre-execution checks), the ordering violation contradicts a FROZEN architectural invariant.

**Required Fix:** Swap the stage 8 BUSINESS and stage 9 POLICY rows in §E8.3 §4 to restore canonical `8 BUSINESS → 9 POLICY` order.

**Part B — `quotation_revised` internal trigger mechanism unspecified in §E8.1:**

§E8.1 `trigger_event` enum includes `quotation_revised` alongside `QuotationSubmitted` and `QuotationWithdrawn`. The document correctly notes "revision is a non-event — Part 4 — surfaced as an internal trigger" (no Doc-2 §8 event). However, the mechanism by which the comparison generator receives this trigger is not specified. An AI coding agent implementing `generate_comparison_statement.v1` will know the two event-driven triggers (`QuotationSubmitted`, `QuotationWithdrawn` via outbox) but will not know how to wire the revision trigger (no event → no outbox → no consumer pipeline). Without the mechanism, comparison statements will not refresh on quotation revisions.

**Required Fix:** Add to §E8.1 §8 Event Binding or §12 AI-Agent Implementation Notes: "The `quotation_revised` trigger is not a Doc-2 §8 event (Part 4 H.7: revision has no event). It is surfaced as a direct application-layer call from `revise_quotation.v1` (Part 4 §E7.2) to the comparison-generator pipeline — in the same transaction or via an internal work-queue entry, not via the Doc-4B outbox. Implement as an application-layer call from the revision handler."

---

### PB5-N1 (NITPICK) — §E8.5 `can_award_rfq` as alternate close-lost authorization slug: implicit authority derivation

**Location:** §E8.5 §3 AUTHZ, §5 Authorization Matrix.

**Description:** §E8.5 allows `can_award_rfq` as an alternate slug "where the org binds closure to award authority." The Doc-2 §7 combined row "Vendor selection / award" lists both `can_approve_vendor_selection (O,D,M)` and `can_award_rfq (O,D)`. Doc-3 §9.2 Exit row mentions `can_award_rfq` only in the context of the `closed_won` exit — it does not explicitly assign `can_award_rfq` to the `closed_lost` exit. The derivation ("closing without award is still a vendor selection decision") is implicit.

**Recommendation:** Add a note to §E8.5 §5 Authorization Matrix: "Authority basis for `can_award_rfq` as alternate: Doc-2 §7 row 'Vendor selection / award' covers both slugs; close-without-award is a final procurement-selection decision (selecting no vendor) falling within the same authority scope. ORG-configurable: some orgs require award-tier authority for any final procurement closure."

---

### PB5-N2 (NITPICK) — §E8.3 Validation Matrix: slug-to-action mapping not explicit

**Location:** §E8.3 §4 Validation Matrix, stage 3 AUTHZ row.

**Description:** Stage 3 AUTHZ lists: "`can_approve_vendor_selection` (evaluation authority) or `can_create_rfq` (RFQ-owner orchestration)" without mapping which slug applies to which `action` value (`post_clarification | broadcast_material | invoke_best_and_final`). An implementer must infer that `can_approve_vendor_selection` covers evaluation-step actions and `can_create_rfq` covers RFQ-owner orchestration actions — but this mapping is implicit.

**Recommendation:** Add a note to §E8.3 §3 AUTHZ: "`can_approve_vendor_selection`: `post_clarification`, `broadcast_material`; `can_create_rfq`: `invoke_best_and_final` (RFQ-owner orchestration). Either slug holder may perform their respective actions."

---

### PB5-N3 (NITPICK) — §E8.6 `get_comparison_statement.v1`: `abuse.sealed_until_close` cascade from PB4-MA2 not acknowledged

**Location:** §E8.6 §4 Validation Matrix, §12 AI-Agent Notes.

**Description:** `abuse.sealed_until_close` (Doc-3 §12.2 POLICY key) was identified in the Part 4 review (PB4-MA2) as ungoverned in the quotation-read contract. The comparison statement (§E8.6) aggregates price and delivery terms from stored `matching_results`. If `abuse.sealed_until_close` restricts buyer visibility of price terms before the quotation window closes, this restriction must also be evaluated for the comparison statement (which shows price bands across vendors). The document does not acknowledge this POLICY key or its potential cascade from PB4-MA2.

**Recommendation:** Add to §E8.6 §12 AI-Agent Notes: "If `abuse.sealed_until_close` (Doc-3 §12.2; PB4-MA2 patch) restricts price-term visibility pre-window-close, apply the same restriction to price-column display in the comparison statement matrix. The applicable scope (comparison-level vs. individual-quotation-level) should be resolved at PB4-MA2 patch time and the result cascaded here."

---

## Summary Table

| ID | Severity | Location | Description | Status |
|---|---|---|---|---|
| **PB5-MA1** | **MAJOR** | §E8.4 §4 Validation Matrix + §12 | No BUSINESS rule verifying `selected_quotation_id` is in the shortlist set; award of non-shortlisted quotation passes all validation — shortlist governance bypass path confirmed | **REQUIRES PATCH** |
| **PB5-M1** | **MINOR** | §E8.6 §6 State Machine + §12 | `quotations_received → buyer_reviewing` conditional write mechanism unspecified in a 21.3 Query; AI agents will miss or misimplement the side effect | **REQUIRES PATCH** |
| **PB5-M2** | **MINOR** | §E8.2/§E8.3/§E8.4/§E8.5 §4 | Stage 5 DELEGATION absent from all four buyer-decision command matrices; "not eligible" must appear as an explicit row per Doc-4A §11.2 | **REQUIRES PATCH** |
| **PB5-M3** | **MINOR** | §E8.3 §4 ordering + §E8.1 §8/§12 | (A) §E8.3 stage 9 POLICY before stage 8 BUSINESS — ordering violates Doc-4A §11.2; (B) §E8.1 `quotation_revised` internal trigger mechanism unspecified | **REQUIRES PATCH** |
| **PB5-N1** | **NITPICK** | §E8.5 §5 Authorization Matrix | `can_award_rfq` as alternate close-lost slug has implicit authority derivation; should cite basis explicitly | Discretionary |
| **PB5-N2** | **NITPICK** | §E8.3 §4 AUTHZ | Slug-to-action mapping implicit; should map `can_approve_vendor_selection` vs `can_create_rfq` to specific `action` values | Discretionary |
| **PB5-N3** | **NITPICK** | §E8.6 §12 | `abuse.sealed_until_close` POLICY cascade from PB4-MA2 not acknowledged in comparison read | Discretionary |

**Counts:** 0 BLOCKERs · 1 MAJOR (PB5-MA1) · 3 MINORs (PB5-M1/M2/M3) · 3 NITPICKs (PB5-N1/N2/N3)

---

## Quotation Governance Analysis

BC-6 award governance is strong at the RFQ-head level (single-award cardinality, ORG threshold, terminal-state protection, optimistic concurrency) and at the event level (atomic outbox, no duplicate engagement). The critical gap is quotation-level: the validation matrix does not close the loop between the shortlist step (§E8.2) and the award step (§E8.4). The shortlist exists as an RFQ-level governance step but its output (the shortlist set) is not machine-enforced at award time. Patching PB5-MA1 closes this gap and makes the shortlist → award workflow fully machine-enforced end-to-end.

---

## Confidentiality Analysis

Vendor isolation at evaluation time is correctly implemented via the comparison statement's band-level display (no cross-vendor individual quotation exposure) and buyer-private column restriction. The `matching_results` display-data model (PA-04) correctly uses stored, firewall-preserving data rather than live Trust/Marketplace reads. The `abuse.sealed_until_close` cascade (PB5-N3) is the only open confidentiality question, deferred to PB4-MA2 patch scope.

---

## Procurement Fairness Analysis

The procurement fairness architecture in Part 5 is the strongest in the module: no-auto-recommendation is a FIXED invariant enforced at the comparison generator, the comparison read, and in AI-agent notes; buyer preference is multiply bounded to buyer-scope; loss feedback is banded and off by default; expiry-without-buyer-action is explicitly benign for vendors. The only fairness risk is PB5-MA1: if an award can bypass the shortlist, the evaluation workflow's documented fairness protections (clarification rounds, best-and-final, shortlist deliberation) can all be circumvented in a single API call.

---

## Procurement Moat Analysis

All five moat dimensions (evaluation, comparison, ranking, selection, award) are correctly RFQ-owned. The engagement is Operations'. The thread is Communication's. The vendor data is Marketplace's (read-only via `matching_results`). No moat leakage exists. The only risk would be a future integration that adds a live Marketplace read at comparison time — the PA-04 binding and the H.10/H.11 firewall statements guard against this.

---

## Drift Analysis

| Dimension | Result | Evidence |
|---|---|---|
| **Ownership Drift** | NONE | BC-5/BC-6 correctly bounded. Engagement → Operations. Thread → Communication. |
| **Lifecycle Drift** | NONE | All RFQ-head edges match Doc-2 §5.4. Quotation edges (`submitted → selected/not_selected`) correctly deferred from Part 4. |
| **Authorization Drift** | NONE | No slug invented. All slugs verified in Doc-2 §7. |
| **Event Drift** | NONE | Three events confirmed in Doc-2 §8. No shortlist event (correct). No event coined. |
| **Audit Drift** | MINOR ANOMALY (PB5-M3-A) | §E8.3 stage ordering reversed (BUSINESS after POLICY). No audit action invented. |
| **POLICY Drift** | GAP | `eval.shortlist_max`, `eval.baf_rounds_max` referenced correctly. `abuse.sealed_until_close` not referenced (PB5-N3). No POLICY key invented. |
| **Moat Drift** | NONE | No RFQ contract leaks into Marketplace, Operations, or Communication authority. |
| **Firewall Drift** | NONE | No governance signal mutated. No live Trust/Marketplace read. |
| **DDD Boundary Drift** | NONE | BC-5/BC-6 fully isolated from BC-1/BC-2/BC-3/BC-4/BC-7. |
| **Award Governance Drift** | GAP (PB5-MA1) | Shortlist-membership check absent from award BUSINESS rules. |

---

## AI-Agent Safety Assessment

**High-risk gaps:**

1. **PB5-MA1:** An AI coding agent implementing `award_rfq.v1` from the validation matrix will not implement a shortlist-membership check. The agent can produce a working award that bypasses the shortlist entirely.

2. **PB5-M1:** An AI coding agent implementing `get_comparison_statement.v1` as a pure read will miss the `quotations_received → buyer_reviewing` transition, leaving the RFQ permanently in `quotations_received` after the buyer first opens the comparison.

3. **PB5-M3-B:** An AI coding agent implementing `generate_comparison_statement.v1` will successfully wire the `QuotationSubmitted` and `QuotationWithdrawn` event consumers but will have no guidance on the `quotation_revised` internal trigger — comparison statements will be stale after every revision.

**Well-handled:**
- Auto-recommendation prohibition is multiply stated and enforced at the validation matrix level (a recommend path is a defect). ✓
- Single-award cardinality is enforced at SYNTAX + BUSINESS + atomic transaction. ✓
- Engagement-creation is explicitly deferred to Operations (AI-agent note: "never authored here"). ✓
- Thread-entity authoring is explicitly prohibited (AI-agent note: "Author no clarification-thread entity"). ✓
- Buyer-preference firewall is clearly bounded (buyer-scoped, not platform-wide). ✓
- Replay safety for award/close is clearly stated. ✓

---

## Final Decision

**APPROVE WITH PATCH**

Part 5 has one MAJOR (PB5-MA1) and three MINORs (PB5-M1/M2/M3) that require patch before freeze. PB5-MA1 is a single targeted addition to §E8.4's validation matrix — a BUSINESS rule row verifying shortlist-set membership of the selected quotation. PB5-M1 requires a mechanism specification for the comparison-read state transition. PB5-M2 requires four explicit "not eligible" delegation rows. PB5-M3 requires a stage-ordering swap in §E8.3 and a trigger-mechanism note in §E8.1. None of these require redesign or Pass-A reopening.

With the four patch items resolved (and the three NITPICKs at Board discretion), Part 5 is implementation-ready and freeze-eligible.

---

## Approval Question

**Can Doc-4E_PassB_Part5_v1.0 proceed toward Patch / Freeze workflow?**

**YES — conditional on patch of PB5-MA1, PB5-M1, PB5-M2, and PB5-M3.**

**Justification:** All four patch items are targeted, non-architectural additions to specific contract sections. PB5-MA1 is the most critical: it closes the shortlist-bypass attack path that is currently reachable through the award contract's validation matrix. PB5-M1/M3 close AI-agent implementation gaps for state-transition and trigger mechanisms. PB5-M2 makes the delegation-ineligibility determination explicit in all four buyer-decision matrices. On closure of these four findings, with PB5-N1/N2/N3 at Board discretion, Part 5 completes Pass-B authoring for BC-5 and BC-6, enabling the Part 5 Patch Verification → Freeze Audit → FROZEN sequence and the subsequent full-module Doc-4E freeze.

---

*End of Doc-4E_PassB_Part5_Independent_Hard_Review_v1.0 — Decision: APPROVE WITH PATCH — 0 BLOCKERs · 1 MAJOR (PB5-MA1: §E8.4 shortlist-bypass — no BUSINESS rule verifying `selected_quotation_id` in shortlist set) · 3 MINORs (PB5-M1: §E8.6 `quotations_received → buyer_reviewing` mechanism unspecified; PB5-M2: stage 5 DELEGATION absent from four buyer-decision matrices; PB5-M3: §E8.3 stage ordering violation + §E8.1 revision-trigger mechanism unspecified) · 3 NITPICKs. Scope: BC-5 + BC-6 (§E8, 6 contracts). Next: Doc-4E_PassB_Part5_Patch_v1.0 → Patch Verification → Freeze Audit → full-module Doc-4E freeze.*
