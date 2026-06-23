# Doc-4G_Structure_Patch_v0.1.md

## Status

**Approved Structure Patch** — applies the Architecture-Board-approved corrections to `Doc-4G_Structure_Proposal_v0.1.md`. Surgical, structure-level patching only — no rewrite, no redesign.

| Field | Value |
|---|---|
| Applies to | `Doc-4G_Structure_Proposal_v0.1.md` |
| Produces | `Doc-4G_Structure_Proposal_v0.1` as amended by this patch (canonical input to Structure Freeze) |
| Review authority | `Doc-4G_Structure_Independent_Hard_Review_v0.1` |
| Board adjudication | **Apply (approved):** F4G-MA1, F4G-M1, F4G-M2, F4G-M3. **Apply (recommended):** F4G-MA2, F4G-N1. |
| Scope | §G7/§G11 invitation/response event-anchor resolution (F4G-MA1); §G10 Communication co-consumer (F4G-M1); §G11 BC-TRUST-5→BC-TRUST-3 ingestion-seam (F4G-M2); §G7/§G11 Buyer-Feedback dual-path distinction (F4G-M3); §G4/§G6 BC-TRUST-2 score-input seam (F4G-MA2); §G3/§G17 BC-TRUST-5 dual-aggregate clarity (F4G-N1). |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0 — all FROZEN |
| Application model | Additive amendment. Each item quotes the exact **Before** text present verbatim in the base and gives the **After**. Anchors verified verbatim against the base before editing. |

This patch **creates no bounded context, aggregate, event, DG marker, escalation marker, slug, audit action, or POLICY key**. Ownership, aggregate boundaries, event ownership, the trust firewall, and the procurement moat are preserved unchanged. Escalation markers are preserved, not renamed, not removed.

---

# 1. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4G_Structure_Proposal_v0.1.md` and gives the **After**.

---

### F4G-MA1 — §G7 + §G11 — invitation/response event-anchor resolution

**Authoritative verification (Doc-2 §8, §10.6):** Doc-2 §8 contains **no** event for invitation response / decline / non_response. The §8 events on the invitation/quotation lifecycle are `VendorInvited` (fires only on transition to `delivered`), `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected`. The response / decline / non_response performance inputs are defined by **Doc-2 §10.6** as `trust.performance_inputs` rows derived from `source_type = invitation` / `quotation` source refs ("only delivered invitations generate response/non_response inputs"); invitation outcomes are otherwise Doc-2 §9 **audit** transitions (`InvitationDelivered/Accepted/Declined/Expired`), not events. `non_response` is an **absence** and cannot be an event. **Resolution (Option A, executed against the real anchors):** name the authoritative Doc-2 §10.6 source-ref rule as the anchor; name `QuotationSubmitted` (Doc-2 §8) as the event where an actual event applies (the response/quote leg, already a §8 performance-input consumer); state that response / decline / non_response are §10.6-derived from invitation source refs with **no event, and none may be invented**. The path is fully specified; no anchor ambiguity remains.

#### F4G-MA1·a — §G7 Trust-consumed inputs

**Before:**

```
  - **Trust-consumed inputs (events; Doc-2 §8):** the Operations performance-input events `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` (→ `performance_inputs`, idempotent consumer); RFQ invitation/response outcomes as performance inputs (response/decline/non_response, by pointer to Doc-2 §10.6); the Marketplace declared-tier reference (read) and vendor-profile reference (read).
```

**After:**

```
  - **Trust-consumed inputs:** (a) **events (Doc-2 §8):** the Operations performance-input events `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` (→ `performance_inputs`, idempotent consumer), and `QuotationSubmitted` (Doc-2 §8, RFQ) consumed into `performance_inputs` as the **response** leg (Doc-2 §8 primary-consumers row: `QuotationSubmitted → … performance inputs`); (b) **§10.6-derived source-ref inputs (no event; Doc-2 §10.6):** `response` / `decline` / `non_response` performance inputs derived from `trust.performance_inputs.source_type = invitation` / `quotation` source refs per the Doc-2 §10.6 rule ("only delivered invitations generate response/non_response inputs") — `non_response` is an absence and **no event exists or may be invented** for it; (c) **read references:** the Marketplace declared-tier reference (read) and vendor-profile reference (read). The authoritative anchor for (b) is **Doc-2 §10.6** (the `performance_inputs` source-ref rule), not a Doc-2 §8 event.
```

#### F4G-MA1·b — §G11 structure-level note

**Before:**

```
  - *(Structure-level note — confirmed at content authoring against Doc-2 §8/§10.6:)* RFQ invitation/response outcomes feed `performance_inputs` (response/decline/non_response — only delivered invitations) by the Doc-2 §10.6 rule; any such consumption binds to existing Doc-2 §8 events only; **no event coined**. Published `public_reviews` feed `performance_inputs` (Buyer Feedback) **within** Trust (BC-TRUST-5 → BC-TRUST-3), not a cross-module event.
```

**After:**

```
  - **RFQ invitation/response inputs — authoritative anchor = Doc-2 §10.6 (source-ref rule), not a §8 event.** `response` / `decline` / `non_response` are `trust.performance_inputs` rows derived from `source_type = invitation` / `quotation` source refs under Doc-2 §10.6 ("only delivered invitations generate response/non_response inputs"); the **response** leg additionally has an event anchor — `QuotationSubmitted` (Doc-2 §8, consumed into `performance_inputs` per the §8 primary-consumers row). There is **no Doc-2 §8 event** for invitation `decline` or `non_response` (invitation outcomes are Doc-2 §9 audit transitions — `InvitationDelivered/Accepted/Declined/Expired`), and `non_response` is an absence; **no event may be invented** — any §8 binding is to `QuotationSubmitted` only, all other invitation-derived inputs bind to the Doc-2 §10.6 source-ref rule. The path is fully specified; no event-anchor ambiguity remains.
  - Published `public_reviews` feed `performance_inputs` (Buyer Feedback) **within** Trust (BC-TRUST-5 → BC-TRUST-3 via the performance-input ingestion service; see F4G-M2), **not** a cross-module event.
```

---

### F4G-M1 — §G10 — Communication (Doc-4H) co-consumer where notification fan-out applies

> Trust emits the event; Communication owns notification dispatch; Marketplace / RFQ own the business effects. Event ownership and consumer ownership unchanged — completeness only. Communication is the existing DG-6 boundary.

#### F4G-M1·a — §G10 `VendorVerified`

**Before:**

```
  - **`VendorVerified`** (BC-TRUST-1, `verification_records`) → Marketplace (verified-status reflect), RFQ (eligibility refresh), analytics.
```

**After:**

```
  - **`VendorVerified`** (emitted by BC-TRUST-1, `verification_records`) → **Marketplace** (verified-status reflect — business effect), **RFQ** (eligibility refresh — business effect), **Communication / Doc-4H** (notification dispatch / fan-out — Communication owns dispatch, DG-6), analytics. Ownership direction: Trust owns the event; each consumer owns its own effect (single-authorship, Doc-4A §4.4); consumers are independent and idempotent.
```

#### F4G-M1·b — §G10 `VendorTierChanged[verified]`

**Before:**

```
  - **`VendorTierChanged[verified]`** (BC-TRUST-1, `verified_financial_tiers`; payload `tier_type='verified'`) → **Marketplace** (writes `financial_tier_history` — Trust never writes it directly), matching refresh.
```

**After:**

```
  - **`VendorTierChanged[verified]`** (emitted by BC-TRUST-1, `verified_financial_tiers`; payload `tier_type='verified'`) → **Marketplace** (writes `financial_tier_history` — Trust never writes it directly; matching refresh — business effects), **Communication / Doc-4H** (notification dispatch / fan-out — DG-6). Ownership direction: Trust owns the event; Marketplace owns the `financial_tier_history` effect; Communication owns the notification effect; each consumer idempotent.
```

#### F4G-M1·c — §G10 `TrustScoreUpdated`

**Before:**

```
  - **`TrustScoreUpdated`** (BC-TRUST-2, `trust_scores`) → Marketplace (`vendor_matching_attributes` rebuild, directory re-rank), RFQ (matching refresh).
```

**After:**

```
  - **`TrustScoreUpdated`** (emitted by BC-TRUST-2, `trust_scores`) → **Marketplace** (`vendor_matching_attributes` rebuild, directory re-rank — business effect), **RFQ** (matching refresh — business effect), **Communication / Doc-4H** (notification dispatch / fan-out where applicable — DG-6). Ownership direction: Trust owns the event; each consumer owns its own effect; consumers idempotent.
```

#### F4G-M1·d — §G10 `PerformanceScoreUpdated` / `PerformanceReviewTriggered` / `PerformanceFrozen`

**Before:**

```
  - **`PerformanceScoreUpdated`**, **`PerformanceReviewTriggered`**, **`PerformanceFrozen`** (BC-TRUST-3, `performance_scores`) → Marketplace (read-model rebuild), RFQ (matching refresh).
```

**After:**

```
  - **`PerformanceScoreUpdated`**, **`PerformanceReviewTriggered`**, **`PerformanceFrozen`** (emitted by BC-TRUST-3, `performance_scores`) → **Marketplace** (read-model rebuild — business effect), **RFQ** (matching refresh — business effect), **Communication / Doc-4H** (notification dispatch / fan-out where applicable — DG-6). Ownership direction: Trust owns the events; each consumer owns its own effect; consumers idempotent.
```

---

### F4G-M2 — §G11 — BC-TRUST-5 → BC-TRUST-3 structural seam

> BC-TRUST-3 owns `performance_inputs`. BC-TRUST-5 does **not** write `performance_inputs` directly. Approved mechanism: BC-TRUST-5 invokes the BC-TRUST-3 performance-input ingestion service — same module, same `trust` schema, no ownership transfer, no direct aggregate mutation.

**Location:** §G11 Event Consumption Map — the Operations-events consumption bullet (`DeliveryRecorded` … `BuyerFeedbackRecorded`).

**Before:**

```
  - **`DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`** (producer: Operations / Doc-4F) → **BC-TRUST-3** writes the corresponding `performance_inputs` rows (delivery/completion/dispute/feedback), idempotent consumer (Doc-2 §10.6). Ownership direction: Operations owns the events; Trust owns the `performance_inputs` effect (its own consumer).
```

**After:**

```
  - **`DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`** (producer: Operations / Doc-4F) → **BC-TRUST-3** writes the corresponding `performance_inputs` rows (delivery/completion/dispute/feedback), idempotent consumer (Doc-2 §10.6). Ownership direction: Operations owns the events; Trust owns the `performance_inputs` effect (its own consumer).
  - **Structural seam — `performance_inputs` is BC-TRUST-3-owned (single writer).** `performance_inputs` is owned exclusively by **BC-TRUST-3** (Doc-2 §2/§10.6); it is the **sole writer**. No other context — including **BC-TRUST-5** — writes `performance_inputs` directly. Where another Trust context contributes an input (e.g. BC-TRUST-5 published `public_reviews` → Buyer-Feedback input), it does so by **invoking the BC-TRUST-3 performance-input ingestion service** (same module, same `trust` schema). This is an in-module service invocation — **no ownership transfer, no cross-context direct aggregate mutation, no cross-module event**.
```

---

### F4G-M3 — §G7 + §G11 — Buyer-Feedback dual-path distinction (prevent double-count ambiguity)

> Two distinct sources feed the same Buyer-Feedback performance component: **Path A** `BuyerFeedbackRecorded` (from Operations / Doc-4F) and **Path B** published `public_reviews` (from BC-TRUST-5, in-module). Different sources, different authorities, same performance component. Reference Doc-2 §10.6.

#### F4G-M3·a — §G7 Trust-produced outputs bullet (anchor) → add dual-path note immediately after the consumed-inputs treatment

**Before:**

```
  - **Trust-produced outputs (events; Doc-2 §8):** `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen` (+ score bands/badges projected to read-models by the consumers).
```

**After:**

```
  - **Trust-produced outputs (events; Doc-2 §8):** `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen` (+ score bands/badges projected to read-models by the consumers).
  - **Buyer-Feedback inputs — two distinct sources, one performance component (no double-count):** **Path A** = `BuyerFeedbackRecorded` (source: **Operations / Doc-4F** event; cross-module; → `performance_inputs` input_type `feedback`). **Path B** = published `public_reviews` (source: **BC-TRUST-5**, in-module; → `performance_inputs` Buyer-Feedback input via the BC-TRUST-3 ingestion service, F4G-M2). Different sources, different authorities (Operations event vs. Trust-owned public review), **same** Buyer-Feedback performance component (Doc-2 §10.6 — `performance_inputs.input_type = feedback`, distinguished by `source_type`). The two paths are recorded as distinct `performance_inputs` rows with distinct `source_type`/`source_entity_id`; **de-duplication and weighting are Pass-A/Pass-B computation concerns** (Doc-2 §10.6 component renormalization), not a structural double-write — the structure fixes the two sources so the content passes prevent any double-count.
```

#### F4G-M3·b — §G11 in-module review-feed clause (already revised in F4G-MA1·b) — confirm dual-path anchor

> The §G11 `public_reviews` clause was revised under **F4G-MA1·b** to route through the BC-TRUST-3 ingestion service (F4G-M2). That revised clause carries the Path-B identity; Path A is the Operations `BuyerFeedbackRecorded` consumption bullet immediately above it. No further §G11 edit required for F4G-M3 — the two paths are now distinct and explicit in §G11 (Operations `BuyerFeedbackRecorded` bullet = Path A; revised `public_reviews` clause = Path B) and in §G7 (F4G-M3·a). Reference: Doc-2 §10.6 (`performance_inputs.input_type = feedback`, distinguished by `source_type`).

---

### F4G-MA2 (recommended) — §G4 + §G6 — BC-TRUST-2 score-computation input seam

> Add an explicit structural seam for how BC-TRUST-2 obtains verification status, performance score, and fraud signal. Mechanism chosen and stated consistently in §G4 and §G6: **same-module Trust read-services** (in-module, `trust` schema). No ownership altered; no service created outside Trust.

#### F4G-MA2·a — §G4 BC-TRUST-2

**Before:**

```
  - **BC-TRUST-2 Trust Scoring** — *purpose:* compute and publish the trust score; *ownership:* `trust_scores` (+`trust_score_history`); *services:* trust-score computation (formula-versioned), freeze/reactivate, history snapshot, score-update publication; *dependencies:* the inputs it reads (verification, performance, fraud — within Trust), Platform Core (audit/outbox — DG). **Auto-calculated; never hand-edited.**
```

**After:**

```
  - **BC-TRUST-2 Trust Scoring** — *purpose:* compute and publish the trust score; *ownership:* `trust_scores` (+`trust_score_history`); *services:* trust-score computation (formula-versioned), freeze/reactivate, history snapshot, score-update publication; *input seam (how BC-TRUST-2 obtains its computation inputs):* **same-module Trust read-services** — BC-TRUST-2 reads **verification status** from BC-TRUST-1, **performance score** from BC-TRUST-3, and **fraud signal** state from BC-TRUST-4 via **in-module read-services within the `trust` schema** (read-only; no cross-context write; no ownership transfer; each input aggregate stays owned by its own BC-TRUST). The firewall holds: each signal is read as an input, never mutated (Architecture §1.5 / Invariant 6); Financial Tier never feeds Trust Score. *dependencies:* in-module read-services (BC-TRUST-1/3/4 — same schema), Platform Core (audit/outbox — DG-8). **Auto-calculated under the System actor; never hand-edited.**
```

#### F4G-MA2·b — §G6 Domain Service Inventory (BC-TRUST-2 surface)

**Before:**

```
- **Expected content scope (service surface → owning BC-TRUST; capability-level only, no contract IDs):** verification-case + staff-decision + verified-tier service (BC-TRUST-1); trust-score computation + freeze + publication service (BC-TRUST-2); performance-input ingestion + performance-score computation + freeze + review-trigger + publication service (BC-TRUST-3); fraud-signal lifecycle service (BC-TRUST-4); public-review moderation + admin-rating service (BC-TRUST-5). Each service consumes the frozen Doc-4B (audit/outbox/human-ref/POLICY) and Doc-4C (`check_permission`, `staff_*` slugs) services by pointer.
```

**After:**

```
- **Expected content scope (service surface → owning BC-TRUST; capability-level only, no contract IDs):** verification-case + staff-decision + verified-tier service (BC-TRUST-1); trust-score computation + freeze + publication service (BC-TRUST-2) — its computation inputs (verification status, performance score, fraud signal) are obtained via **same-module Trust read-services** within the `trust` schema (read-only projections of BC-TRUST-1/3/4 state; no cross-context write; no ownership transfer; consistent with §G4); performance-input ingestion + performance-score computation + freeze + review-trigger + publication service (BC-TRUST-3) — **the performance-input ingestion service is the sole writer of `performance_inputs`; in-module contributors (e.g. BC-TRUST-5 Buyer-Feedback) invoke it rather than writing `performance_inputs` directly** (F4G-M2); fraud-signal lifecycle service (BC-TRUST-4); public-review moderation + admin-rating service (BC-TRUST-5) — its Buyer-Feedback contribution is delivered by **invoking the BC-TRUST-3 performance-input ingestion service** (in-module). Each service consumes the frozen Doc-4B (audit/outbox/human-ref/POLICY) and Doc-4C (`check_permission`, `staff_*` slugs) services by pointer.
```

---

### F4G-N1 (recommended) — §G3 + §G17 — BC-TRUST-5 dual-aggregate clarity (5 BCs / 7 aggregates)

> Pure clarity. State that BC-TRUST-5 owns both Public Review and Admin Rating, so "5 BCs / 7 aggregates" is immediately understandable. No structural change.

#### F4G-N1·a — §G3 BC-TRUST-5

**Before:**

```
  - **BC-TRUST-5 — Reviews & Admin Ratings** (Public Review + Admin Rating aggregates): post-award public reviews (moderated; feed Buyer-Feedback performance, displayed by Marketplace) and internal-only staff admin ratings.
```

**After:**

```
  - **BC-TRUST-5 — Reviews & Admin Ratings** (**owns two aggregates: Public Review + Admin Rating**): post-award public reviews (moderated; feed Buyer-Feedback performance, displayed by Marketplace) and internal-only staff admin ratings. BC-TRUST-5 is the only Module-5 context owning two aggregates — this is why **5 bounded contexts own 7 aggregates** (BC-TRUST-1 also owns two: Verification Case + Verified Financial Tier; BC-TRUST-2/3/4 own one each); each aggregate remains in exactly one context.
```

#### F4G-N1·b — §G17 Structure Summary

**Before:**

```
- **Expected content scope:** Module 5 — Trust & Verification (`trust` schema, `trust_` namespace) decomposes into **5 bounded contexts** (BC-TRUST-1 Verification & Verified Tier · BC-TRUST-2 Trust Scoring · BC-TRUST-3 Performance Scoring · BC-TRUST-4 Fraud & Risk Signals · BC-TRUST-5 Reviews & Admin Ratings) owning **7 aggregates** (Doc-2 §2, Module 5), each aggregate in exactly one context.
```

**After:**

```
- **Expected content scope:** Module 5 — Trust & Verification (`trust` schema, `trust_` namespace) decomposes into **5 bounded contexts** (BC-TRUST-1 Verification & Verified Tier · BC-TRUST-2 Trust Scoring · BC-TRUST-3 Performance Scoring · BC-TRUST-4 Fraud & Risk Signals · BC-TRUST-5 Reviews & Admin Ratings) owning **7 aggregates** (Doc-2 §2, Module 5), each aggregate in exactly one context. **Aggregate distribution: BC-TRUST-1 = 2 (Verification Case + Verified Financial Tier); BC-TRUST-2 = 1 (Trust Score); BC-TRUST-3 = 1 (Performance Score); BC-TRUST-4 = 1 (Fraud Signal); BC-TRUST-5 = 2 (Public Review + Admin Rating) — total 7.**
```

---

# 2. Regression Audit

| Check | Result | Evidence |
|---|---|---|
| **Aggregate count** | **UNCHANGED** | 7 aggregates (Doc-2 §2, Module 5); F4G-N1 only states the existing distribution (BC-TRUST-1=2, BC-TRUST-5=2, others=1). No aggregate added/removed/split. |
| **Bounded context count** | **UNCHANGED** | 5 contexts (BC-TRUST-1…5); none created/merged/split. |
| **Ownership map** | **UNCHANGED** | Every aggregate in exactly one BC-TRUST as in the base; `performance_inputs` remains BC-TRUST-3-owned (F4G-M2 names BC-TRUST-3 as sole writer — restates existing ownership, transfers none). |
| **Event ownership** | **UNCHANGED** | Trust still owns all produced events (Doc-2 §8); F4G-M1 adds Communication only as a **consumer** (existing DG-6); F4G-MA1 binds the response leg to the existing `QuotationSubmitted` (Doc-2 §8) and otherwise to the Doc-2 §10.6 source-ref rule. No event created; no producer changed. |
| **Trust firewall** | **UNCHANGED** | F4G-MA2 reads verification/performance/fraud as inputs via in-module read-services, never mutating them (Architecture §1.5 / Invariant 6); Financial Tier never feeds Trust/Performance Score; no paid-plan gating introduced. |
| **Procurement moat** | **UNCHANGED** | Trust absorbs no matching/routing/ranking/quotation-evaluation/supplier-selection/award; RFQ owns the procurement decisions; Trust references invitation/quotation refs read-only as performance-input sources. |
| **Dependency map** | **UNCHANGED except approved clarification** | DG-1…DG-8 intact; F4G-M1 references existing **DG-6** (Communication) as co-consumer — the only approved clarification; no DG marker created/renamed/removed. |
| **Escalation markers** | **PRESERVED** | `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` and inbound carried DC-2 / DD-1 / DD-2 / DF-4 unchanged — not renamed, not removed. |
| **No invention** | **CONFIRMED** | No aggregate, bounded context, event, slug, audit action, or POLICY key introduced. F4G-MA1 resolves the anchor using only existing Doc-2 §8 (`QuotationSubmitted`) + Doc-2 §10.6; explicitly states no event may be invented (notably for `non_response`). |
| **Structure-level discipline** | **CONFIRMED** | No contract/command/query/payload/validation/state-machine-detail/audit-action instantiated; all bindings remain by pointer. |

---

*End of Doc-4G_Structure_Patch_v0.1 — applies F4G-MA1 (§G7/§G11 invitation/response anchor = Doc-2 §10.6 source-ref rule + `QuotationSubmitted` §8 for the response leg; no event invented, `non_response` is an absence), F4G-M1 (§G10 Communication/Doc-4H co-consumer on `VendorVerified`/`VendorTierChanged[verified]`/`TrustScoreUpdated`/`PerformanceScoreUpdated`+`PerformanceReviewTriggered`+`PerformanceFrozen`), F4G-M2 (§G11 `performance_inputs` BC-TRUST-3 sole writer; BC-TRUST-5 invokes the ingestion service), F4G-M3 (§G7/§G11 Buyer-Feedback Path A `BuyerFeedbackRecorded`/Operations vs Path B `public_reviews`/BC-TRUST-5 — same component, no double-count), F4G-MA2 (§G4/§G6 BC-TRUST-2 score inputs via same-module Trust read-services), F4G-N1 (§G3/§G17 BC-TRUST-5 dual-aggregate clarity). Surgical/structure-level only; aggregate count, bounded-context count, ownership map, event ownership, trust firewall, procurement moat, and dependency map preserved (the sole approved dependency clarification being the existing DG-6 Communication co-consumer); escalation markers preserved; nothing invented. Canonical input: `Doc-4G_Structure_Proposal_v0.1.md` as amended by this patch.*
