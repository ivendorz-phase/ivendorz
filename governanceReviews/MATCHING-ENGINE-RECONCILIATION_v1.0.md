# RFQ Matching Engine — Reconciliation & Intake (Track 2)

**Status:** DRAFT v1.0 — Intake for the M3 owner + human Architecture Board (NON-authoritative).
**Date:** 2026-07-01
**Author:** AI Coding Supervisor (planning) — raises; does not rule (§13 Raise ≠ Accept).
**Scope guard:** This document **does not redesign the matching engine.** The engine is the frozen **M3
moat** — Doc-3 owns gates/scoring/fairness/distribution; Doc-4E/Doc-6E realize it. This intake maps an
external weighted-engine proposal onto the frozen pipeline and routes each idea to its channel.
Resolves/registers `ESC-RFQ-MATCH-EVOLVE`.

> Precedence: NON-authoritative; on any conflict the frozen corpus wins (`CLAUDE.md §7`, §11
> Flag-and-Halt). Coins no weight, no contract, no POLICY key.

---

## 0. The frozen pipeline (reference — restated by pointer only)

The canonical matching pipeline is **Phase A hard gates → Phase B geography → Phase C scoring**
(`Doc-4E_Content_v1.0_PassB_Part2_MatchingPipeline`; `Doc-3 §3.1`), run under the System actor to produce
`matching_results`. Phase-A hard gates (order FIXED, gate-before-score): **A1** blacklist/self-match ·
**A2** category · **A3** capability · **A4** work-nature · **A5** verification value-band + probation ·
**A6** tier ceiling · **A7** capacity. Matching **reads** governance signals as **bands via events**
(`vendor_matching_attributes`; `Doc-3 §6`), never raw scores, and **never mutates** them (§4B). The RFQ
control plane owns lifecycle/routing/throttling/sorting/scoring (Invariant #4).

**Two structural facts the external proposal must conform to:**
- Gates ≠ ranking are **already separated** (Phase A vs Phase C). Classification metadata may enter at
  **Phase C only** — never as a new Phase-A gate (except the frozen A2 category / A3 capability).
- Matching takes **no payment/plan/entitlement input** (`Doc-3 §12.1/§4B`, repeated across every
  policy-key patch). Monetization affects **capacity/distribution**, never rank.

---

## 1. Adjudication of the weighted-engine proposal (§13)

| Proposed element | Frozen reality | Disposition · Channel |
|---|---|---|
| Eligibility filter (hard rules) | = Phase A gates A1–A7 | **CONFORMS.** Already exists; no change. |
| Weighted scoring (Industry/Category/Capability/…) | = Phase C scoring + `Doc-3 §6` confidence | **INTAKE → M3/Board.** Weights are M3-owned; this doc coins none. |
| **Subscription ranking boost (+2)** | `Doc-3 §12.1/§4B`: no payment/plan/entitlement input to matching; Invariant #10 (Tier ≠ Plan); M7 entitlements ≠ plan-name checks | **REJECT score-boost.** Subscription's frozen levers = **intake capacity** (`entitlement_quota`/`monthly_rfq_limit`, `Doc-3 §4.1`) + lead credits — never rank. |
| Trust +15 / Performance +12 as raw numbers | Matching consumes **bands via events**, not raw scores (`vendor_matching_attributes`; `Doc-3 §6`); score-display firewall (Invariant #6) | **REMODEL as bands.** Use trust/performance **bands**; never a hand-weighted raw 0–100. |
| Industry +30 (top weight) | Industry **not modeled yet** (`../esc_registry.md`; Track-1 `Doc-2…IndustryTaxonomy` patch) | **DEFER.** Depends on the industry taxonomy landing (Track 1); then an additive Phase-C signal (M3/Board). |
| Business Type / Product portfolio as signals | Business Type = metadata (ADR-023 §2); products exist (M2) | **OPTIONAL Phase-C, M3/Board.** Never a gate. |
| Distribution + fairness rules | `Doc-3` routing/fairness/capacity already own this | **CONFORMS.** No change. |
| **AI learning-to-rank / self-improving** | M9 "AI suggests; modules decide" (Invariant #12); Doc-4K advisory/reserved | **ROADMAP only.** M9 advises; M3 decides. No autonomous rank mutation. |
| Per-RFQ "Matching Policy Engine" | RFQ **control plane** already exists (Invariant #4) | **RECOMMEND to M3/Board** as a policy layer (below); coins nothing. |

## 2. Recommended configurable Matching Policies (B2 — for M3/Board)

A policy layer on the existing control plane: named policies vary **Phase-C signals only**; **gates stay
fixed** across all policies. Illustrative (for the Board; coins no weights):

| Signal | Standard | Urgent | High-Value | OEM |
|---|---|---|---|---|
| Capability / Category | **Gate (A2/A3)** | **Gate** | **Gate** | **Gate** |
| Verification / Tier | rank | rank | **gate-tighten (A5/A6)** | rank |
| Industry (when modeled) | rank | rank | rank | rank |
| Experience | rank | rank | **strong rank** | strong rank |
| Business Type | rank | — | rank | rank |
| Distance (geography) | medium | **high** | low | low |

## 3. Matching input → source (canonical reference; Now / Future)

| Input | Source (owner) | Used by matching |
|---|---|---|
| Vendor Capability (4 flags) | Vendor / M2 | **Now (gate A3)** |
| Category | RFQ + Vendor assignment / M2 | **Now (gate A2)** |
| Geography / Distance | Vendor / M2 | **Now (Phase B/C)** |
| Trust **band** | M5 (event) | **Now (Phase C)** |
| Performance **band** | M5 (event) | **Now (Phase C)** |
| Verified Tier | M5 (event) | **Now (gate A5/A6)** |
| Capacity | Vendor declared / M2 + throttle | **Now (gate A7)** |
| Vendor Industry | Vendor / M2 | **Future** (needs taxonomy + M3 patch) |
| Buyer Industry | Buyer / M1 | **Future** (M3 patch) |
| Business Type | Vendor / M2 | **Future / optional** (M3 policy) |
| Product Portfolio | Vendor / M2 | **Future** |
| Availability | Vendor / M2 | **Future** |
| Certifications (structured) | M5 / M2 | **Future** (net-new; esc) |

## 4. What the M3 owner / Board is asked

1. Confirm the **firewall rejections** (subscription-in-rank; raw-score weights) — or rule otherwise with
   an additive Doc-3 patch.
2. Decide whether to adopt the **configurable policy layer** (§2) as an M3 additive.
3. Note the industry/business-type ranking signals as **deferred** pending Track-1 ratification.
4. Confirm M9's role stays **advisory** (Invariant #12).

**Nothing here changes Doc-3/Doc-4E/Doc-6E.** Any adopted item ships as its own additive M3 patch with
human approval.
