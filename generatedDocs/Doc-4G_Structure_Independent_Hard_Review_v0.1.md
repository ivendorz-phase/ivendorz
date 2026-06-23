# Doc-4G Structure — Independent Hard Review
**Document ID:** Doc-4G_Structure_Independent_Hard_Review_v0.1
**Review Date:** 2026-06-18
**Status:** FINAL

---

## Review Header

| Field | Value |
|---|---|
| Document Under Review | `Doc-4G_Structure_Proposal_v0.1` |
| Module | Module 5 — Trust & Verification (`trust` schema, `trust_` namespace) |
| Operating Context | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · Principal Platform Architect · AI-Agent Governance Auditor |
| Review Posture | Independent. Adversarial. Defects assumed until disproved. No authoring. No redesign. Structure only. |
| Authoritative Corpus | Master_System_Architecture_v1.0_FINAL; ADR_Compendium_v1.md; Doc-2 v1.0.3; Doc-3 v1.0.2; Doc-4A v1.0; Doc-4B v1.0; Doc-4C v1.0; Doc-4D v1.0; Doc-4E v1.0; Doc-4F v1.0 — all FROZEN |
| Special Focus | Trust firewall; governance-signal ownership; cross-context intra-module coupling; event co-consumption gaps; BC-TRUST-3 performance-input provenance; BC-TRUST-5 dual-aggregate and internal feed mechanism; RFQ/Marketplace boundary; Billing firewall |

---

## Executive Summary

Doc-4G_Structure_Proposal_v0.1 is architecturally sound at the module boundary level. The trust firewall is upheld throughout. All seven Module-5 aggregates map to exactly one BC-TRUST context. The governance-signal authority claim is correct and consistently stated. Cross-module dependencies DG-1…DG-8 are directionally correct with single-authorship identified. The procurement moat is not breached. No entity, slug, event, or audit action is invented.

Two MAJOR defects and three MINOR defects require patch before structure freeze.

**MAJOR defects:**

- **F4G-MA1 (MAJOR):** §G11 states that RFQ invitation/response outcomes feed `performance_inputs` (response/decline/non_response) but names no specific Doc-2 §8 event as the consumption vehicle. The statement is hedged as "confirmed at content authoring" — meaning the structure document carries a consumption path with no verified event anchor. If no such Doc-2 §8 event exists, the path is unanchored and constitutes an implicit event invention. A structure document must either name the event (by pointer to Doc-2 §8) or carry `[ESC-TRUST-AUDIT]` / note the gap explicitly. Deferring anchor verification to Pass-A is a structure-level completeness defect.

- **F4G-MA2 (MAJOR):** §G4 BC-TRUST-2 (Trust Scoring) states its computation inputs as "the inputs it reads (verification, performance, fraud — within Trust)" — naming BC-TRUST-1, BC-TRUST-3, and BC-TRUST-4 as read sources. The structure document does not define the mechanism for these cross-context reads (service boundary? direct same-schema query? event-driven? a BC-TRUST-2 read-service?). These are load-bearing intra-module dependencies: BC-TRUST-2 cannot compute the trust score without them. The §G6 Domain Service Inventory describes BC-TRUST-2's service as "trust-score computation + freeze + publication service" but names only Platform Core and Doc-4C as consumed services — the intra-module read dependencies are absent from the service inventory. Content-pass authors for BC-TRUST-2 contracts have no structural seam to implement the score-computation input read.

**MINOR defects:**

- **F4G-M1 (MINOR):** §G10 Event Production Map lists consumers for all six Trust-produced events (Marketplace, RFQ, analytics) but does not include Communication (Doc-4H) as a co-consumer for notification dispatch — despite DG-6 (§G8) stating "Trust emits events; Communication owns and authors notification dispatch." This is the same pattern as F4F-M1 in the Doc-4F structure review: the event production map must reflect both data-consumption legs and notification-dispatch legs per Doc-2 §8 primary-consumer rows. Communication is a primary consumer of Trust events for fan-out; its absence from §G10 is a completeness defect that will cause content-pass authors to miss the DG-6 wiring.

- **F4G-M2 (MINOR):** §G11 documents a within-Trust feed: "Published `public_reviews` feed `performance_inputs` (Buyer Feedback) within Trust (BC-TRUST-5 → BC-TRUST-3), not a cross-module event." The document explicitly says this is not an event — yet the mechanism is unspecified. A cross-context coupling within a module requires a structural seam statement: is it a domain service call (BC-TRUST-3 exposes a performance-input ingestion service that BC-TRUST-5 calls on review publish)? A within-module event? A direct same-schema write by BC-TRUST-5 into BC-TRUST-3's `performance_inputs`? The third option would violate aggregate ownership (BC-TRUST-3 owns `performance_inputs`; BC-TRUST-5 must not write directly). The structure document must state the mechanism — without it, content-pass authors face an unresolved cross-context coupling.

- **F4G-M3 (MINOR):** §G7 and §G17 list `BuyerFeedbackRecorded` (from Operations/Doc-4F) as a consumed event that feeds `performance_inputs`. §G4 BC-TRUST-5 additionally states "public reviews feed `performance_inputs` (Buyer Feedback)" — a separate input to the same Buyer Feedback performance component. The structure document does not distinguish these two Buyer Feedback input channels: (1) engagement-level buyer feedback from Operations (`BuyerFeedbackRecorded` event → `performance_inputs`); (2) post-award public review from BC-TRUST-5 (→ `performance_inputs`, within Trust). Both feed the same Buyer Feedback component of the performance score. Content-pass authors for BC-TRUST-3 must know whether these are the same or distinct input rows, and what authority separates them in `performance_inputs`. The document is silent on this distinction.

One NITPICK:

- **F4G-N1 (NITPICK):** §G17 Structure Summary states "5 bounded contexts owning 7 aggregates" without noting that BC-TRUST-5 holds two aggregates (Public Review + Admin Rating). This is the same class of minor count-clarity gap as F4F-N1 in the Doc-4F structure review. The §G5 Aggregate Inventory resolves it unambiguously, but a one-line note in §G3 or §G17 would eliminate potential first-pass reader confusion.

Open findings at review: **0B · 2MA · 3M · 1N**

---

## Findings

---

### F4G-MA1
**Severity:** MAJOR
**Location:** §G11 — Event Consumption Map, RFQ invitation/response outcomes paragraph

**Description:**
§G11 states: "RFQ invitation/response outcomes feed `performance_inputs` (response/decline/non_response — only delivered invitations) by the Doc-2 §10.6 rule; any such consumption binds to existing Doc-2 §8 events only; **no event coined**."

The consumption is asserted as real and Doc-2-sourced, but no specific Doc-2 §8 event is named. The paragraph hedges: "any such consumption binds to existing Doc-2 §8 events only" — but does not name which event. It then defers the anchor: "(Structure-level note — confirmed at content authoring against Doc-2 §8/§10.6)". This means the structure document:

1. Asserts a real consumption path (RFQ outcomes → `performance_inputs`),
2. Claims it is grounded in Doc-2 §8, and
3. Does not verify the anchor at structure level.

A structure review cannot accept a consumption path whose event-anchor is unverified. If no Doc-2 §8 event covers RFQ invitation outcome signals, then either: (a) the path cannot exist without an event coined at the Doc-2 §8 additive channel, which is not a Doc-4G action; or (b) the consumption is driven by a service call, not an event, which must be stated explicitly with the mechanism. The current hedged text creates a structure-level ambiguity that — if carried unresolved into Pass-A — will produce a content-pass author inventing an event or a service call with no governance anchor.

Separately: Doc-2 §8 lists `VendorInvited` (producer: RFQ) as consumed by Operations (creates vendor leads) and Communication (notification). `VendorInvited` fires only at invitation `delivered`. If Trust is consuming RFQ invitation **outcomes** (response/decline/non_response), these are post-invitation resolution signals — distinct from the invitation dispatch. The §G7 Trust Authority Matrix lists Trust-consumed events exclusively as the five Operations performance-input events; RFQ events are not listed there. The §G11 claim is thus inconsistent with §G7 — §G7 shows Trust consumes only Operations events for `performance_inputs`; §G11 adds an unanchored RFQ consumption path.

**Corpus Reference:** Doc-2 §8 (event catalog, primary consumers); Doc-2 §10.6 (`performance_inputs` source rule); §G7 Trust Authority Matrix (Trust-consumed events).

**Required Fix:** Either (a) name the specific Doc-2 §8 event that carries RFQ invitation/response outcomes to Trust — citing the verbatim row — and add it to §G7 consumed events and §G11; or (b) if no such Doc-2 §8 event exists, remove the RFQ-outcome consumption claim from §G11 and §G7, carry `[ESC-TRUST-AUDIT]` with the note that an additive Doc-2 §8 event may be needed, and defer to the Doc-2 §8 additive channel; or (c) state the mechanism is a service call (not event), name the service boundary, and add it to §G8 DG-3 as a supplemental read. Do not carry a consumption path whose event anchor is unverified at structure level.

---

### F4G-MA2
**Severity:** MAJOR
**Location:** §G4 BC-TRUST-2 — Context Responsibilities; §G6 — Domain Service Inventory, BC-TRUST-2 entry

**Description:**
§G4 BC-TRUST-2 states the trust-score computation service consumes "the inputs it reads (verification, performance, fraud — within Trust)" — meaning BC-TRUST-2 reads from:
- BC-TRUST-1: `verification_records` / `verified_financial_tiers` (verification status)
- BC-TRUST-3: `performance_scores` (performance band)
- BC-TRUST-4: `fraud_signals` (fraud indicator)

These are intra-module cross-context reads. The `trust` schema is one physical schema, so these may be same-schema reads. However, DDD aggregate ownership requires that no context reads another context's aggregate root directly — it must do so via a published service, a projection, or an event-sourced read model. The structure document provides no statement on which mechanism applies.

§G6 Domain Service Inventory BC-TRUST-2 entry lists: "trust-score computation + freeze + publication service." The only named consumed services are Platform Core (audit/outbox) and Doc-4C (`check_permission`, `staff_*` slugs) — the intra-module inputs (verification status, performance score, fraud signal) are absent. This means the service inventory is incomplete: BC-TRUST-2's computation service has undeclared dependencies on BC-TRUST-1, BC-TRUST-3, and BC-TRUST-4 that are not surfaced in the structure document.

Content-pass authors for BC-TRUST-2 contracts will reach Pass-A without a structural decision on how the computation service reads verification, performance, and fraud inputs. They will face a binary choice — direct cross-aggregate table read (DDD violation, aggregate ownership breach) or an undeclared service boundary — with no guidance from the frozen structure.

**Corpus Reference:** Doc-4A §4.1 (one owner per entity); DDD aggregate boundary principle (each aggregate accessed via root or service); §G6 Domain Service Inventory.

**Required Fix:** §G4 BC-TRUST-2 and §G6 BC-TRUST-2 service entry: add explicit structural seam for intra-module input reads. Options: (a) state that BC-TRUST-2 reads from BC-TRUST-1/3/4 via named read-services within the `trust` schema boundary (same-module, same-schema service calls — not cross-module); (b) state that BC-TRUST-2 consumes published score/verification events internally to maintain a local projection; or (c) state that the `trust` schema allows same-schema aggregate reads within the module boundary and name the tables read. Pick one mechanism; state it explicitly in both §G4 and §G6 for BC-TRUST-2. Without this, the computation boundary is a structure-level gap.

---

### F4G-M1
**Severity:** MINOR
**Location:** §G10 — Event Production Map, all six Trust-produced events

**Description:**
§G10 lists consumers for the six Trust-produced events:
- `VendorVerified` → Marketplace, RFQ, analytics
- `VendorTierChanged[verified]` → Marketplace (writes `financial_tier_history`), matching refresh
- `TrustScoreUpdated` → Marketplace (`vendor_matching_attributes` rebuild, directory re-rank), RFQ (matching refresh)
- `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen` → Marketplace (read-model rebuild), RFQ (matching refresh)

Communication (Doc-4H) is absent from every entry. Yet §G8 DG-6 states: "Trust emits events; Communication owns and authors notification dispatch (single-authorship, Doc-4A §4.4). Channel: emit event; Communication owns fan-out." And §G7 Trust Authority Matrix §G7 lists Communication under "Interaction boundaries" confirming the fan-out.

Per Doc-2 §8 primary-consumer rows, Communication is a primary consumer of Trust-produced events for notification dispatch (analogous to its co-consumption of `VendorInvited` in the Doc-4F review). Not including Communication in §G10 creates the same pattern as F4F-M1 in the Doc-4F structure review: content-pass authors reading §G10 alone will not know that Communication must be wired as a co-consumer and may fail to establish the DG-6 relationship correctly for these events.

**Corpus Reference:** Doc-2 §8 (primary consumers for Trust events); §G8 DG-6; §G7 Trust Authority Matrix (Communication interaction boundary).

**Required Fix:** §G10 entries for Trust-produced events: add Communication (Doc-4H) as a co-consumer (notification dispatch) for the relevant events, noting that Communication owns the fan-out and BC-TRUST-* owns only the data-consumption leg. Ownership direction: Trust emits; Communication owns fan-out; data consumers (Marketplace, RFQ) own their own effects. Consistent with DG-6 and single-authorship (Doc-4A §4.4).

---

### F4G-M2
**Severity:** MINOR
**Location:** §G11 — Event Consumption Map, within-Trust BC-TRUST-5 → BC-TRUST-3 feed note

**Description:**
§G11 states: "Published `public_reviews` feed `performance_inputs` (Buyer Feedback) within Trust (BC-TRUST-5 → BC-TRUST-3), not a cross-module event." The document explicitly says "not a cross-module event" — so this is an intra-module, cross-context coupling. But it says nothing about the mechanism.

The candidate mechanisms are:
1. BC-TRUST-3 exposes a performance-input ingestion service; BC-TRUST-5 calls it on review publish.
2. BC-TRUST-5 publishes an intra-module event (within the `trust` schema / bounded by module); BC-TRUST-3 consumes it.
3. BC-TRUST-5 writes directly to BC-TRUST-3's `performance_inputs` table.

Option 3 would violate aggregate ownership: `performance_inputs` is owned by BC-TRUST-3 (§G5, §G9). BC-TRUST-5 must not write to it directly. Options 1 and 2 are architecturally valid but structurally distinct — the content pass author must know which applies. The structure document silently passes this choice to Pass-A without a seam.

This is a load-bearing structural gap: BC-TRUST-5 → BC-TRUST-3 is the coupling that ensures public reviews influence the performance score's Buyer Feedback component. Without a structural mechanism statement, an implementing agent may choose option 3 and silently violate aggregate ownership.

**Corpus Reference:** Doc-4A §4.1 (one owner per entity); §G5 Aggregate Inventory (BC-TRUST-3 owns `performance_inputs`); §G6 BC-TRUST-3 service entry ("performance-input ingestion").

**Required Fix:** §G11 BC-TRUST-5 → BC-TRUST-3 note: state the mechanism explicitly. Recommended: "BC-TRUST-5 calls BC-TRUST-3's performance-input ingestion service on review publish (same module, `trust` schema; BC-TRUST-3 owns `performance_inputs`; BC-TRUST-5 does not write `performance_inputs` directly)." Alternatively, if an intra-module event is preferred, state that. Either way, the mechanism must be named so that aggregate ownership of `performance_inputs` is unambiguous to content-pass authors.

---

### F4G-M3
**Severity:** MINOR
**Location:** §G7 — Trust Authority Matrix (consumed inputs); §G4 BC-TRUST-5; §G11 Event Consumption Map

**Description:**
The structure document identifies two Buyer Feedback input paths into `performance_inputs` (both feeding the Buyer Feedback component of the Performance Score in BC-TRUST-3):

**Path A** — §G7 and §G11: `BuyerFeedbackRecorded` (Operations/Doc-4F event) → BC-TRUST-3 writes `performance_inputs` row (engagement-level buyer feedback, idempotent consumer).

**Path B** — §G4 BC-TRUST-5: "review-to-performance-input feed (Buyer Feedback)" — a published public review (reviewed by staff, moderated) feeds BC-TRUST-3's `performance_inputs`.

These two paths target the same `performance_inputs.component = 'buyer_feedback'` slot. The document does not:
- Distinguish the two input types (engagement-level feedback vs. platform public review)
- State whether they produce separate rows in `performance_inputs` or merge into one
- Clarify which has precedence if both exist for the same engagement
- State whether `BuyerFeedbackRecorded` already accounts for the review (making Path B redundant) or the two are independent inputs

Doc-2 §10.6 is the authority for `performance_inputs` source rules. If Doc-2 §10.6 already distinguishes engagement-level feedback from public-review feedback as separate source types, the structure document should confirm this by pointer. If it does not, there is a structure-level gap that will produce conflicting implementations.

**Corpus Reference:** Doc-2 §10.6 (`performance_inputs` source rule); §G4 BC-TRUST-5; §G7 Trust Authority Matrix.

**Required Fix:** §G7 Trust-consumed inputs section and §G11: add a one-line structural note distinguishing Path A (`BuyerFeedbackRecorded` = engagement-level feedback from BC-OPS-2, idempotent event consumer) from Path B (public-review Buyer Feedback = moderated platform review from BC-TRUST-5, written via the BC-TRUST-3 ingestion service). Cite Doc-2 §10.6 for the `performance_inputs` source taxonomy. If Doc-2 §10.6 already names these as distinct source types, cite and bind; if not, carry `[ESC-TRUST-AUDIT]` with the note that the source-type taxonomy needs extension via the Doc-2 §10.6 additive channel.

---

### F4G-N1
**Severity:** NITPICK
**Location:** §G3 / §G17 — Bounded Context Landscape / Structure Summary

**Description:**
§G17 states "5 bounded contexts owning 7 aggregates" without noting that BC-TRUST-5 uniquely holds two aggregates (Public Review + Admin Rating). §G3 similarly describes BC-TRUST-5 without a parenthetical aggregate count. §G5 Aggregate Inventory resolves this unambiguously, but a one-line note at the summary level would eliminate first-pass reader confusion about the 5-context/7-aggregate distribution.

This is the same class of gap as F4F-N1 in the Doc-4F structure review.

**Corpus Reference:** Doc-2 §2 Module 5 aggregate table.

**Required Fix:** §G3 BC-TRUST-5 entry or §G17 aggregate count statement: add "(2 aggregates: Public Review + Admin Rating)" alongside the BC-TRUST-5 entry. One line. No structural change.

---

## Ownership Analysis

### BC-TRUST-1 Verification & Verified Tier

`verification_records` (+`verification_decisions`): correctly owned by BC-TRUST-1. Confirmed against Doc-2 §2/§3.6 Module 5. State machine (`requested→in_review→approved/rejected`, `in_review→requested`, `approved→expired/revoked`) matches Doc-2 §5.6 by pointer.

`verified_financial_tiers`: correctly owned by BC-TRUST-1. Validated tier distinct from declared tier (Marketplace/Doc-4D). PATCH-01 (Architecture Patch v1.0.1) correctly cited — Trust validates/confirms/downgrades without owning the declared tier. Tier-change event (`VendorTierChanged[verified]`) published; Marketplace consumes and writes `financial_tier_history` — Trust never writes it directly. **CLEAN.**

`staff_can_verify` slug: correctly sourced from Doc-2 §7 by pointer. No slug invented. **CLEAN.**

### BC-TRUST-2 Trust Scoring

`trust_scores` (+`trust_score_history`): correctly owned by BC-TRUST-2. Auto-computed; no hand-edit. Formula version recorded. Freeze state (`computed/frozen`) matches Doc-2 §3.6/§10.6 by pointer.

Computation input seam: **DEFECT — F4G-MA2.** Intra-module reads from BC-TRUST-1/3/4 not structurally bounded.

### BC-TRUST-3 Performance Scoring

`performance_scores` (+`performance_score_history`, `performance_inputs`): correctly owned by BC-TRUST-3. Performance inputs from Operations events correctly described as idempotent consumer. Six-component formula and threshold gate (5 responses OR 2 projects) correctly stated.

`performance_inputs` ownership: **load-bearing ownership** — BC-TRUST-3 owns these; BC-TRUST-5 must not write directly. Mechanism gap covered under F4G-M2.

### BC-TRUST-4 Fraud & Risk Signals

`fraud_signals`: correctly owned by BC-TRUST-4. Lifecycle (`open→reviewed→actioned/dismissed`) matches Doc-2 §3.6 by pointer. DG-5 (Admin boundary): Trust publishes signals; Admin owns the ban decision. Single-authorship preserved. **CLEAN.**

### BC-TRUST-5 Reviews & Admin Ratings

`public_reviews`: correctly owned by BC-TRUST-5. Tenancy correctly classified as "shared" (author org writes; public when published) per §G9. Moderation lifecycle (`submitted→approved→published/rejected/removed`) matches Doc-2 §3.6 by pointer. Engagement-gated constraint (`can_submit_review`, engagement reference required) correctly stated.

`admin_ratings`: correctly owned by BC-TRUST-5. Internal-only, never public, never cross-tenant. Simple/append-only per §G13 (parenthetical — acceptable). No state machine invented.

Dual-aggregate count gap: **F4G-N1.**

### Aggregate-to-Context Uniqueness

All seven Module-5 aggregates appear in exactly one BC-TRUST context. No aggregate claimed by two contexts. No aggregate absent. No aggregate from another module introduced. Confirmed against Doc-2 §2 Module 5 table.

| Aggregate | Context | Correct |
|---|---|---|
| Verification Case | BC-TRUST-1 | ✓ |
| Verified Financial Tier | BC-TRUST-1 | ✓ |
| Trust Score | BC-TRUST-2 | ✓ |
| Performance Score | BC-TRUST-3 | ✓ |
| Fraud Signal | BC-TRUST-4 | ✓ |
| Admin Rating | BC-TRUST-5 | ✓ |
| Public Review | BC-TRUST-5 | ✓ |

**Single-ownership verdict: CLEAN.**

---

## Trust Firewall Analysis

### Governance-Signal Authority

No other module's governance signal is absorbed. Trust owns and computes: Trust Score, Verified Financial Tier, Performance Score, Verification records/decisions, Fraud Signals, Admin Ratings, Public Reviews. All seven are in the `trust` schema; none cross to another module's schema. Scores are auto-computed under the System actor; no hand-edit path is described. **CLEAN.**

### Billing Firewall (Doc-4A §4B)

DG-7 establishes a strict firewall: no plan/entitlement input to any Trust signal. No section contradicts this. No POLICY key gating trust/verification/eligibility described. **CLEAN.**

### Marketplace Boundary

Trust publishes `VendorTierChanged[verified]`; Marketplace consumes and writes `financial_tier_history`. Trust never writes `marketplace.financial_tier_history` — stated four times across §G2, §G7, §G8 DG-2, §G16. PATCH-01 correctly cited. Declared tier remains Marketplace's. **CLEAN.**

### RFQ Boundary

Trust publishes governance signals; RFQ consumes for gate/scoring inputs. Trust makes no procurement decision. Matching/routing/ranking/quotation-evaluation/supplier-selection/award are RFQ's (Doc-4E, FROZEN) — correctly excluded. No RFQ authority absorbed in any section. **CLEAN.** RFQ event consumption gap noted in F4G-MA1.

### Operations Boundary

Trust consumes the five Operations performance-input events into `performance_inputs`. Trust does not own engagements or post-award entities. `engagement_id` referenced by UUID only (review gate). **CLEAN.**

**Trust firewall verdict: CLEAN (no firewall breach; F4G-MA1 is a structure-completeness defect, not a firewall breach).**

---

## Procurement Moat Analysis

Trust owns governance signals — not matching, routing, ranking, quotation evaluation, supplier selection, or awards. All moat concerns remain with RFQ (Doc-4E, FROZEN) referenced only via DG-3. No section claims or implies Operations-style moat ownership. The trust score and verified-tier signals are consumed by RFQ as gate/scoring inputs — this is correct; Trust produces inputs; RFQ makes procurement decisions. **CLEAN.**

---

## Dependency Analysis

| Marker | Direction | Single-Authorship | Boundary Rule | Assessment |
|---|---|---|---|---|
| DG-1 Identity | consume org/membership/`check_permission`/`staff_can_verify`/`staff_can_ban`; author none | Identity authors slugs/check_permission; Trust consumes | **CLEAN** |
| DG-2 Marketplace | reference vendor profile + declared tier by UUID (read); publish `VendorTierChanged[verified]`/score events Marketplace consumes; own/mutate no vendor data; never write `financial_tier_history` | Marketplace authors vendor data + `financial_tier_history`; Trust publishes events | **CLEAN** |
| DG-3 RFQ | reference `rfq_invitation_id`/`quotation_id` as source refs (read); publish signals RFQ consumes; make no procurement decision | RFQ owns matching/award; Trust publishes signals | **CLEAN** — F4G-MA1 noted for unanchored RFQ outcome consumption in §G11 |
| DG-4 Operations | consume Operations performance-input events into `performance_inputs` (idempotent); reference `engagement_id` read-only; own no Operations entity | Operations emits; Trust authors consumer effect | **CLEAN** |
| DG-5 Admin | publish fraud/verification outputs Admin consumes; ban decision is Admin's | Admin owns ban decision; Trust publishes signals | **CLEAN** |
| DG-6 Communication | emit events; Communication owns fan-out | Communication owns notification dispatch; Trust emits | **CLEAN** — F4G-M1 noted for §G10 missing Communication co-consumer entries |
| DG-7 Billing | strict firewall — no Billing input to any Trust signal | No dependency direction; firewall only | **CLEAN** |
| DG-8 Platform Core | consume audit/outbox/UUIDv7+human-ref/POLICY/flags; re-implement none | Platform Core authors; Trust consumes | **CLEAN** |

All eight DG markers are directionally correct and single-authorship-compliant.

**Dependency analysis verdict: CLEAN (F4G-MA1 and F4G-M1 are description/completeness gaps, not boundary violations).**

---

## DDD Boundary Analysis

### Bounded Context Correctness

Five contexts, each mapping to a coherent trust-domain capability:
- BC-TRUST-1: verification workflow + verified financial tier. Coherent — verification decisions drive tier status; the two aggregates are tightly coupled by the PATCH-01 validate-not-own seam.
- BC-TRUST-2: auto-computed trust score. Coherent — single-purpose scoring engine; formula-versioned; freeze-controlled.
- BC-TRUST-3: auto-computed performance score + input ledger. Coherent — the six-component formula and append-only input ledger are naturally co-located.
- BC-TRUST-4: fraud signals. Coherent — distinct lifecycle, distinct staff role, feeds Admin ban management.
- BC-TRUST-5: public reviews + admin ratings. Coherent — both are human-authored quality signals; staff moderate both; both are trust inputs.

No context overlap. No aggregate split across contexts. The separation of BC-TRUST-2 (trust score) from BC-TRUST-3 (performance score) is architecturally correct — these are independent score dimensions with independent formula versions and freeze states; co-location in one context would create a god-context for all scoring. **CLEAN.**

### Intra-Module Cross-Context Coupling

Three intra-module couplings identified:
1. BC-TRUST-2 reads BC-TRUST-1/3/4 (score computation inputs) — **F4G-MA2, mechanism unspecified.**
2. BC-TRUST-5 feeds BC-TRUST-3 `performance_inputs` on review publish — **F4G-M2, mechanism unspecified.**
3. BC-TRUST-3 ingests Operations events — correctly described via DG-4.

Couplings 1 and 2 are load-bearing and require structural seam statements before Pass-A can proceed deterministically.

**DDD boundary verdict: CLEAN on ownership; DEFECTIVE on intra-module coupling seams (F4G-MA2, F4G-M2).**

---

## Event Integrity Analysis

### Produced Events (§G10)

All six events named in §G10 are verified against Doc-2 §8 naming:
- `VendorVerified` — confirmed as Doc-2 §8 Trust event (verification domain).
- `VendorTierChanged[verified]` — confirmed as Doc-2 §8 Trust event; `tier_type='verified'` payload qualifier is correct.
- `TrustScoreUpdated` — confirmed as Doc-2 §8 Trust event.
- `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen` — confirmed as Doc-2 §8 Trust/Performance events.

No event coined. All six are Doc-2 §8 catalog entries. Producing contexts are correctly assigned (BC-TRUST-1 for verification events; BC-TRUST-2 for trust score events; BC-TRUST-3 for performance events). Outbox write via Doc-4B confirmed. **CLEAN** subject to F4G-M1 (Communication co-consumer gap in §G10).

### Consumed Events (§G11)

Five Operations events consumed by BC-TRUST-3 via DG-4:
- `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` — all confirmed as Doc-2 §8 Operations events (producer: Doc-4F BC-OPS-2, FROZEN).

Idempotent consumer: correctly stated. **CLEAN** subject to F4G-MA1 (RFQ outcome consumption unanchored) and F4G-M3 (dual Buyer Feedback path not distinguished).

### Event Topology

No event loop. Trust consumes Operations events and emits Trust events that Marketplace/RFQ consume. No Trust event is consumed within Trust (the BC-TRUST-5 → BC-TRUST-3 feed is explicitly declared non-event). **CLEAN.**

---

## AI-Agent Safety Analysis

§G16 correctly states:
- Ownership rules: one owning BC-TRUST per aggregate.
- Calculation authority: System actor, never hand-edited.
- Mutation restrictions: Trust never writes `marketplace.financial_tier_history`; scores not computable/mutable outside Trust.
- Trust-firewall rules: no paid-plan gating; no matching/routing absorbed.
- Escalation markers: `ESC-TRUST-*` for gaps.

**Gap:** §G16 does not address the intra-module coupling seams (F4G-MA2: BC-TRUST-2 computation input reads; F4G-M2: BC-TRUST-5 → BC-TRUST-3 feed mechanism). An AI agent reading §G16 alone will not know the aggregate-ownership constraint on `performance_inputs` (BC-TRUST-5 must not write it directly) or the undeclared input dependencies of BC-TRUST-2. These are non-obvious constraints — BC-TRUST-3 owns `performance_inputs` and BC-TRUST-5 must use the ingestion service — and should be stated in §G16 as implementation constraints alongside the cross-module firewall rules.

**Gap:** §G16 does not surface the delivery-only constraint for `VendorInvited` analogous to the Doc-4F AI-agent safety note. This is a lesser gap since Doc-4G does not consume `VendorInvited` directly — the relevant constraint is the engagement-gate on public-review submission (`can_submit_review` requires an active engagement). This is stated in §G4 BC-TRUST-5 ("engagement-gated") but not in §G16. Content-pass authors for BC-TRUST-5 contracts should find this in §G16 as a AI-agent constraint.

These gaps are covered by F4G-MA2/F4G-M2 — not raised as separate findings but noted here for the patch author.

**AI-agent safety verdict: PASS with observations (intra-module coupling constraints not in §G16; engagement-gate constraint not in §G16).**

---

## Escalation Marker Analysis

### `[ESC-TRUST-AUDIT]`
§G14 defines the marker for Trust mutations lacking explicit Doc-2 §9 coverage. Doc-2 §9 Trust domain covers: verification request/decision/revoke/expiry, trust/performance freeze+reactivation, recalculation, formula version change, admin tier override. Doc-2 §9 Reviews domain covers public reviews. For gaps beyond these, the marker is carried. Correctly patterned. **CLEAN.**

### `[ESC-TRUST-POLICY]`
§G14 defines the marker for runtime tunables absent from Doc-3 §12.2. No key invented in the structure document. Correctly patterned. **CLEAN.**

### `[ESC-TRUST-SLUG]`
§G12 identifies Doc-2 §7 slugs: `staff_can_verify`, `staff_can_ban`, `can_submit_review`. For required actions lacking a §7 slug, the marker is carried. No slug invented. §G12 correctly states "no endpoint permission defined (Pass-A)" and "no slug invented." **CLEAN.**

### Inbound Carried Dependencies (DC-2, DD-1, DF-4)
§G14 names three inbound carried markers now owned by Doc-4G:
- DC-2 (Doc-4C — org/vendor verification = Trust submission boundary): correctly identified as Trust's to resolve.
- DD-1 (Doc-4D — vendor verification = Trust contract boundary): correctly identified.
- DF-4 (Doc-4F — Operations emits performance inputs; Trust consumes): correctly resolved via DG-4 and §G11.

These are the documented carried deps from the prior frozen modules pointing at Trust. Resolution as owning-document via additive contracts in Doc-4G is the correct governance posture. **CLEAN.**

**Escalation marker verdict: CLEAN.**

---

## Structure Freeze Readiness

| Area | Result | Notes |
|---|---|---|
| 1. Structure completeness | PASS | §G1–§G17 all present; purpose + expected content scope stated per section |
| 2. Bounded-context correctness | PASS | 5 BCs, coherent, non-overlapping |
| 3. Aggregate ownership correctness | PASS | 7 aggregates, one BC each, all Doc-2 §2 Module-5 aggregates present |
| 4. Cross-module ownership integrity | PASS | DG-1…DG-8 explicit, directional, single-authorship-compliant |
| 5. Trust firewall integrity | PASS | No score computed/mutated/owned outside Trust; Billing firewall intact |
| 6. Procurement moat integrity | PASS | No RFQ/quotation/matching/award ownership; signals published but decisions remain RFQ's |
| 7. Marketplace boundary integrity | PASS | DG-2 correct; published event → Marketplace consumes; never writes `financial_tier_history` directly |
| 8. Operations boundary integrity | PASS | DG-4 correct; consumes performance-input events; no Operations entity owned |
| 9. RFQ boundary integrity | PASS (F4G-MA1) | DG-3 direction correct; RFQ outcome consumption in §G11 unanchored — F4G-MA1 |
| 10. Event production correctness | PASS (F4G-M1) | All 6 events ∈ Doc-2 §8; Communication co-consumer absent from §G10 — F4G-M1 |
| 11. Event consumption correctness | MAJOR (F4G-MA1, F4G-M3) | Operations events correctly anchored; RFQ outcome path unanchored (F4G-MA1); dual Buyer Feedback path undistinguished (F4G-M3) |
| 12. Intra-module coupling seams | MAJOR (F4G-MA2, F4G-M2) | BC-TRUST-2 computation input mechanism undeclared (F4G-MA2); BC-TRUST-5→BC-TRUST-3 feed mechanism undeclared (F4G-M2) |
| 13. Dependency-map correctness | PASS | DG-1…DG-8 match frozen corpus; direction correct |
| 14. Escalation-marker correctness | PASS | `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` correctly patterned; no marker renamed or removed |
| 15. DDD boundary integrity | PASS on ownership | No context overlap; no aggregate split; no cross-context ownership violation |
| 16. Aggregate-to-context uniqueness | PASS | Each aggregate in exactly one BC-TRUST; verified against Doc-2 §2 |
| 17. AI-agent implementation readiness | PASS with observations | §G16 complete at module boundary level; intra-module coupling constraints not surfaced |
| 18. Structure-freeze readiness | PATCH REQUIRED | 2 MAJORs (F4G-MA1, F4G-MA2) require patch before freeze |

---

## Final Decision

**APPROVE WITH PATCH REQUIRED**

Doc-4G_Structure_Proposal_v0.1 is structurally correct at the module boundary level. The trust firewall, governance-signal ownership, and procurement moat are upheld. All seven Module-5 aggregates map cleanly to five BC-TRUST contexts with no duplicate or missing ownership. Cross-module dependency markers DG-1…DG-8 are directionally correct and single-authorship-compliant. No entity, slug, event, audit action, or POLICY key is invented.

Two MAJORs block structure freeze:

- **F4G-MA1:** §G11 carries an unanchored RFQ-outcome consumption path with no Doc-2 §8 event named. Must resolve: name the specific event, remove the path if no event exists (carry `[ESC-TRUST-AUDIT]`), or state a service-call mechanism.
- **F4G-MA2:** §G4/§G6 BC-TRUST-2 has undeclared intra-module input read dependencies (verification, performance, fraud inputs needed for score computation). Must state the intra-module read mechanism explicitly.

Three MINORs require patch in the same pass:

- **F4G-M1:** §G10 Event Production Map missing Communication as co-consumer for notification dispatch.
- **F4G-M2:** §G11 BC-TRUST-5 → BC-TRUST-3 feed mechanism unspecified — risk of aggregate-ownership violation.
- **F4G-M3:** §G11 / §G7 dual Buyer Feedback input paths (Operations `BuyerFeedbackRecorded` vs. BC-TRUST-5 public review) not distinguished.

One NITPICK (F4G-N1) — BC-TRUST-5 dual-aggregate count ambiguity — Board discretion.

Open: **0B · 2MA · 3M · 1N**

---

## Approval Question

```
Can Doc-4G_Structure_Proposal_v0.1 proceed directly to Structure FROZEN?

NO
```

**Required next step:** `Doc-4G_Structure_Patch_v0.1` — resolve F4G-MA1, F4G-MA2, F4G-M1, F4G-M2, F4G-M3 (and F4G-N1 at Board discretion) → patch verification → `Doc-4G_Structure_FROZEN`.

**Justification:** Two MAJOR findings are open. F4G-MA1 carries an unverified event-anchor that could silently propagate an invented event into Pass-A authoring. F4G-MA2 leaves the trust-score computation input boundary structurally undefined — a content-pass author implementing BC-TRUST-2 contracts has no structural seam for the intra-module reads and may violate aggregate ownership. Both must be resolved at structure level before content authoring begins.

---

*Review conducted under Doc-4A §0.6 (flag-and-halt), §0.3 (reference-never-restate). No corpus conflict encountered requiring flag-and-halt. No authoring performed. Independent reviewer posture maintained throughout.*
