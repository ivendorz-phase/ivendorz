# RFQ Matching — Business Model — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0.**
**Terms:** `MASTER-CLASSIFICATION-DICTIONARY.md`. **Governance:** `MATCHING-ENGINE-RECONCILIATION_v1.0.md`
(the intake) — matching is the frozen **M3 moat**. This doc explains the **business logic**; it coins
**no weights and no implementation.**

---

## 1. The matching story (business view)

When a buyer submits an RFQ, iVendorz finds and ranks eligible vendors, distributes invitations fairly,
and (over time) learns from outcomes — while never exposing private exclusions and never letting money
buy rank.

```text
Eligibility → Ranking → Distribution → Learning → Feedback
```

- **Eligibility** — hard rules decide *who can compete* (frozen Phase-A gates).
- **Ranking** — configurable signals decide *ordering among eligible vendors* (frozen Phase-C scoring).
- **Distribution** — fairness + capacity decide *who is invited* (frozen routing/throttling).
- **Learning → Feedback** — outcomes (awards, response quality, performance) refine future ranking;
  the loop closes. M5 owns performance signals; M9 may advise (Invariant #12).

## 2. Eligibility (frozen gates — restated by pointer)

`Doc-4E …Part2` Phase-A gates, order fixed, gate-before-score: **A1** blacklist/self-match · **A2**
category · **A3** capability · **A4** work-nature · **A5** verification value-band + probation · **A6**
tier ceiling · **A7** capacity. Classification metadata is **never** a new gate.

## 3. Ranking signals — input → source (canonical reference; Now / Future)

| Input | Source (owner) | Used by matching |
|---|---|---|
| Vendor Capability (4 flags) | Vendor / M2 | **Now — gate A3** |
| Category | RFQ + vendor assignment / M2 | **Now — gate A2** |
| Geography / Distance | Vendor / M2 | **Now — Phase B/C** |
| Trust **band** | M5 (event) | **Now — Phase C** |
| Performance **band** | M5 (event) | **Now — Phase C** |
| Verified Tier | M5 (event) | **Now — gate A5/A6** |
| Capacity | Vendor / M2 + throttle | **Now — gate A7** |
| **Vendor Industry** | Vendor / M2 | **Future** (needs taxonomy + M3 patch) |
| **Buyer Industry** | Buyer / M1 | **Future** (M3 patch) |
| **Business Type** | Vendor / M2 | **Future / optional** (M3 policy) |
| **Product Portfolio** | Vendor / M2 | **Future** |
| **Availability** | Vendor / M2 | **Future** |
| **Certifications (structured)** | M5 / M2 | **Future** (net-new; esc) |

**Firewalls (business rules that must never break):**
- **Money never buys rank.** Subscription affects **intake capacity** and lead credits only — never the
  score (`Doc-3 §12.1/§4B`; Invariant #10). (Rejected: the external "+2 subscription" boost.)
- **Signals are bands, not raw scores** — Trust/Performance enter as bands via events (Invariant #6).
- **Private exclusion stays private** — a blacklisted vendor is silently absent; never revealed.

## 4. Configurable Matching Policies (recommended to M3/Board — coins nothing)

Different RFQs deserve different ranking emphasis; gates stay fixed, Phase-C signals vary:

| Signal | Standard | Urgent | High-Value | OEM |
|---|---|---|---|---|
| Capability / Category | Gate | Gate | Gate | Gate |
| Verification / Tier | rank | rank | gate-tighten | rank |
| Industry (when modeled) | rank | rank | rank | rank |
| Experience | rank | rank | strong rank | strong rank |
| Business Type | rank | — | rank | rank |
| Distance | medium | high | low | low |

## 5. Future AI (roadmap — M9 advisory only, Invariant #12)

As data grows, M9 may **suggest** — never decide:

```text
AI suggests → category · industry · vendor shortlist · specification hints
            → duplicate-RFQ detection · award-probability prediction
```

All of these are advisory inputs to the buyer or to M3; the owning modules make every decision ("AI
suggests; modules decide"). No autonomous rank mutation; no authoritative data owned by M9.
