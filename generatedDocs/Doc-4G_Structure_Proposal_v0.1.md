# Doc-4G — Trust & Verification Engine — API & Integration Contracts — Structure Proposal v0.1

| Field | Value |
|---|---|
| Document | Doc-4G — **Structure Proposal v0.1** — canonical Table of Contents proposal for Module 5 — Trust & Verification (`trust` schema, `trust_` namespace) — the **governance-signal authority** |
| Status | **Structure Proposal — pre-freeze.** Defines the complete Module-5 structure (bounded contexts, aggregates, events, dependencies, maps) before contract authoring. **Not Pass-A; not Pass-B.** Next stage: Independent Hard Review → Structure Patch → Structure FROZEN → Pass-A. |
| Module | Module 5 — Trust & Verification (`trust` schema) — the **sole authority for Trust Score, Verification Score/records, Performance Score, and governance signals** |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0 — all FROZEN |
| Family-map basis | Doc-4A §1.3: **Doc-4G = Trust & Verification (Module 5)**; Appendix B namespace `trust_` (trust) |
| Contains | Structure only — section, bounded-context purpose/ownership/aggregates/services/dependencies, maps. **No contracts, commands, queries, payloads, API definitions, validation matrices, state-machine details, audit actions, or events beyond the structure-level production/consumption maps.** |
| Audience | Doc-4G content-pass authors; Claude Code / Cursor / backend / frontend / QA / AI coding agents |

**Family-map confirmation (recorded).** **Doc-4G = Trust & Verification (Module 5, `trust` schema)** — confirmed against Doc-4A §1.3, Doc-4A Appendix B (`trust_` → Doc-4G), Doc-2 §0.3 (`trust` = Module 5), and Context Pack v3 §3 (Module 5, `trust`). No family-map conflict; no flag-and-halt.

**Three governing rules shape this document** (inherited from Doc-4A §0.3; Doc-4D/4E/4F precedent):

1. **Reference, never restate (Doc-4A §0.3).** Entity definitions (Doc-2 §3.6), state machines (Doc-2 §5.6 + §3.6 lifecycles), permission slugs (Doc-2 §7), events (Doc-2 §8), audit actions (Doc-2 §9), and POLICY keys (Doc-3 §12.2) have owners; Doc-4G binds to them by pointer and copies none. This is a **structure** document — it names the section homes for those bindings; the content passes instantiate them.
2. **Consume frozen lower layers; redefine nothing.** Doc-4G consumes Doc-4A standards and the frozen services of **Doc-4B Platform Core** (audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags), **Doc-4C Identity** (org/membership resolution, `check_permission`, platform-staff `staff_*` slugs), **Doc-4D Marketplace** (declared tier owned there; vendor profile reference; verified-tier/score bands projected into the read-model), **Doc-4E RFQ** (consumes governance signals; never mutated), and **Doc-4F Operations** (consumes the performance-input events Operations emits) — all by pointer.
3. **Structure only.** This document maps sections and bounded contexts; it instantiates no contract, command, query, payload, validation, state-machine detail, or audit action. Those are the content passes' work, authored against this structure once frozen.

**Trust-firewall boundary (the governance-signal seam).** Module 5 is the **sole authority** for the governance signals (Architecture §1.5; Doc-3 §12.1 FIXED): it **owns and computes** Trust Score, Verified Financial Tier, Performance Score, Verification records/decisions, Fraud Signals, Admin Ratings, and Public Reviews; **no other module calculates, mutates, or owns a score** — other modules **consume Trust outputs** and **emit operational signals** only. Trust **consumes** the Operations performance-input events and writes `performance_inputs`; it **never** writes `marketplace.financial_tier_history` directly (the verified-tier change is published as an event Marketplace consumes — event synchronization preserves module ownership). Trust owns **none** of: matching/routing/ranking/quotation-evaluation/supplier-selection/award (RFQ / Doc-4E, FROZEN); vendor discovery/profiles/attributes/declared-tier (Marketplace / Doc-4D, FROZEN); post-award execution (Operations / Doc-4F, FROZEN); orgs/memberships (Identity / Doc-4C, FROZEN); notification fan-out (Communication / Doc-4H); plans/entitlements (Billing / Doc-4I). **A paid plan/entitlement/flag never gates trust, verification, eligibility, routing, or matching** (Doc-4A §4B; Architecture §1.5).

---

## §G1 — Module Overview

- **Purpose:** Establish Doc-4G as the contract document for **Module 5 — Trust & Verification only**, the layer that owns and computes the platform's governance signals. State the schema (`trust`), the namespace (`trust_`), the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-4F → Doc-4G), and the trust-firewall seam.
- **Expected content scope:** Module identity (governance-signal authority of iVendorz); the `trust` schema and `trust_` namespace; the position in the module map (consumes Operations performance inputs, publishes verified-tier/score events Marketplace+RFQ consume); the structure-only nature of this document; the conformed frozen corpus versions.
- **Owned aggregates (Doc-2 §2, Module 5):** Verification Case, Verified Financial Tier, Trust Score, Performance Score, Fraud Signal, Admin Rating, Public Review.
- **Dependencies:** Doc-4A §0/§1.3/Appendix B; Doc-2 §0.3, §2 (Module 5); Architecture §16 (module map), Architecture §1.5 (governance-signal firewall), Architecture Patch v1.0.1 PATCH-01 (verified-tier validates declared without owning it).
- **Excluded scope:** No RFQ/matching/award ownership; no Marketplace vendor-data/declared-tier ownership; no Operations post-award ownership; no module other than Module 5.

---

## §G2 — Business Objectives

- **Purpose:** State, once, the business purpose and strategic role of Module 5 within the platform positioning.
- **Expected content scope:** The governance objectives the module serves — **verification** (contact/business/factory/organization/tier/capacity cases, with staff decisions), **verified financial tier** (validating/confirming/downgrading the declared tier without owning it), **trust scoring** (auto-computed 0–100 trust band), **performance scoring** (auto-computed 0–100 from six weighted components, Not Rated until threshold), **fraud signals** (indicators feeding ban management), **admin ratings** (internal-only staff ratings), **public reviews** (post-award buyer reviews feeding Buyer-Feedback performance and trust indicators). Strategic role: the trust/verification layer that underwrites the **procurement moat** — RFQ matching consumes these signals; their integrity (FIXED owners, no pay-to-win) is the platform's quality guarantee. Maturity staging (Stage A→C) as it affects verification/scoring operations.
- **Dependencies:** Architecture (platform identity, §1.5 firewall); Doc-3 §11.8/§12.1 (FIXED governance-signal rules); Doc-2 §2 (Module 5 aggregates).
- **Excluded scope:** No procurement decision logic (RFQ / Doc-4E); no re-derivation of architecture; no operating-number hardcoding (POLICY by key).

---

## §G3 — Bounded Context Landscape

- **Purpose:** Enumerate the bounded contexts **within** Module 5, each mapped to one or more owned aggregates; every planned contract lands in exactly one context (no aggregate in two contexts).
- **Expected content scope (candidate contexts, derived from the Doc-2 §2 Module-5 aggregates):**
  - **BC-TRUST-1 — Verification & Verified Tier** (Verification Case + Verified Financial Tier aggregates): the verification-case workflow (subjects: vendor profile / organization / capacity claim / declared tier), staff verification decisions, and the verified financial tier (status + 24-month review) that validates the declared tier **without owning it** (PATCH-01).
  - **BC-TRUST-2 — Trust Scoring** (Trust Score aggregate): the auto-computed trust score (0–100, band, formula version), its history, and freeze state.
  - **BC-TRUST-3 — Performance Scoring** (Performance Score aggregate): the auto-computed performance score (0–100 nullable / Not Rated, six weighted components), its history, the normalized `performance_inputs` ledger, and freeze state.
  - **BC-TRUST-4 — Fraud & Risk Signals** (Fraud Signal aggregate): fraud indicators (subject + type + severity) feeding ban management.
  - **BC-TRUST-5 — Reviews & Admin Ratings** (Public Review + Admin Rating aggregates): post-award public reviews (moderated; feed Buyer-Feedback performance, displayed by Marketplace) and internal-only staff admin ratings.
- **Dependencies:** Doc-2 §2 (Module 5 aggregates), §3.6 (entities); Doc-4D §D3 / Doc-4E §E3 / Doc-4F §F3 (within-module context precedent).
- **Excluded scope:** No cross-module context ownership; no aggregate split across contexts; the procurement-decision context is RFQ's (Doc-4E), the vendor-data/declared-tier context is Marketplace's (Doc-4D).

---

## §G4 — Context Responsibilities

- **Purpose:** For each BC-TRUST context, fix its responsibilities, internal ownership boundary, and the lifecycles it drives (by pointer to Doc-2 §3.6/§5.6) — so content passes place each contract unambiguously.
- **Expected content scope (per context — purpose · ownership · aggregate list · service list · dependencies):**
  - **BC-TRUST-1 Verification & Verified Tier** — *purpose:* run the verification-case workflow and own the verified financial tier; *ownership:* `verification_records` (+`verification_decisions`), `verified_financial_tiers`; *services:* verification case lifecycle (request→assign→decide), staff decision recording, verified-tier set/confirm/downgrade/suspend/expire, verified-tier-change publication; *dependencies:* Identity (staff `staff_can_verify`, `verification_tasks` admin ref — DG), Marketplace (vendor profile + declared tier reference — DG), Platform Core (audit/outbox — DG).
  - **BC-TRUST-2 Trust Scoring** — *purpose:* compute and publish the trust score; *ownership:* `trust_scores` (+`trust_score_history`); *services:* trust-score computation (formula-versioned), freeze/reactivate, history snapshot, score-update publication; *dependencies:* the inputs it reads (verification, performance, fraud — within Trust), Platform Core (audit/outbox — DG). **Auto-calculated; never hand-edited.**
  - **BC-TRUST-3 Performance Scoring** — *purpose:* compute and publish the performance score; *ownership:* `performance_scores` (+`performance_score_history`, `performance_inputs`); *services:* performance-input ingestion (idempotent consumer of Operations events), performance-score computation (six weighted components, threshold gate), freeze/reactivate, review trigger, score-update publication; *dependencies:* Operations (consumes performance-input events — DG), Platform Core (audit/outbox — DG). **Auto-calculated; only `performance_inputs`/underlying data may be corrected.**
  - **BC-TRUST-4 Fraud & Risk Signals** — *purpose:* record and triage fraud signals; *ownership:* `fraud_signals`; *services:* signal creation, review/action/dismiss lifecycle; *dependencies:* Admin (ban management consumes actioned signals — DG), Platform Core (audit — DG).
  - **BC-TRUST-5 Reviews & Admin Ratings** — *purpose:* own post-award public reviews and internal admin ratings; *ownership:* `public_reviews`, `admin_ratings`; *services:* review submit/moderate/publish/remove (engagement-gated), review-to-performance-input feed (Buyer Feedback), internal admin-rating management; *dependencies:* Operations (engagement reference, service-validated — DG), Marketplace (displays published reviews via service — DG), Platform Core (audit — DG).
- **Dependencies:** Doc-2 §3.6 (entity lifecycles), §5.6 (Verification machine); Architecture §1.5; Architecture Patch v1.0.1 PATCH-01.
- **Excluded scope:** No procurement evaluation/award (RFQ / Doc-4E); no declared-tier ownership (Marketplace / Doc-4D); no notification fan-out (Communication / Doc-4H).

---

## §G5 — Aggregate Inventory

- **Purpose:** Enumerate the seven Module-5 aggregates (Doc-2 §2), each assigned to exactly one bounded context — the machine-readable ownership ledger for content passes.
- **Expected content scope (aggregate → root → children/value-objects → owning BC-TRUST, by pointer to Doc-2 §2/§3.6):**
  - **Verification Case** — root `verification_records`; child `verification_decisions`; VO EvidenceRefs / SubjectRef (vendor_profile / organization / capacity_claim / declared_tier) → **BC-TRUST-1**.
  - **Verified Financial Tier** — root `verified_financial_tiers`; VO TierBand (A–E) → **BC-TRUST-1**.
  - **Trust Score** — root `trust_scores`; child `trust_score_history`; VO ComponentBreakdown / FreezeState → **BC-TRUST-2**.
  - **Performance Score** — root `performance_scores`; children `performance_score_history`, `performance_inputs`; VO ComponentBreakdown (6 weighted components) / FreezeState → **BC-TRUST-3**.
  - **Fraud Signal** — root `fraud_signals`; VO SignalSource → **BC-TRUST-4**.
  - **Admin Rating** — root `admin_ratings` → **BC-TRUST-5**.
  - **Public Review** — root `public_reviews`; VO Rating (1–5) / ReviewBody / ModerationState → **BC-TRUST-5**.
- **Dependencies:** Doc-2 §2 (Module 5 aggregate design), §3.6 (entity catalog), §10.6 (`trust` blueprint); Architecture Patch v1.0.1 PATCH-01.
- **Excluded scope:** **No aggregate belongs to more than one context**; no aggregate added beyond the Doc-2 §2 Module-5 set; no aggregate from another module.

---

## §G6 — Domain Service Inventory

- **Purpose:** Name the structure-level domain services per context (the service *surfaces*, not contracts) — so content passes know where each capability lands without inventing service names.
- **Expected content scope (service surface → owning BC-TRUST; capability-level only, no contract IDs):** verification-case + staff-decision + verified-tier service (BC-TRUST-1); trust-score computation + freeze + publication service (BC-TRUST-2); performance-input ingestion + performance-score computation + freeze + review-trigger + publication service (BC-TRUST-3); fraud-signal lifecycle service (BC-TRUST-4); public-review moderation + admin-rating service (BC-TRUST-5). Each service consumes the frozen Doc-4B (audit/outbox/human-ref/POLICY) and Doc-4C (`check_permission`, `staff_*` slugs) services by pointer.
- **Dependencies:** Doc-2 §3.6 (capabilities implied by entities); Doc-4B/Doc-4C (consumed services); Architecture §16.
- **Excluded scope:** No command/query/contract instantiated (content-pass work); no service that performs RFQ/matching/award, Marketplace vendor-data mutation, or Operations post-award execution; no shadow authorization/audit path.

---

## §G7 — Trust Authority Matrix

- **Purpose:** State, explicitly, what Trust **decides/produces/consumes**, and the interaction boundary with each adjacent module — the structure-level guarantee that the governance-signal firewall holds.
- **Expected content scope:**
  - **Trust-owned decisions:** verification approve/reject/downgrade/confirm/revoke; verified-tier set/confirm/downgrade/suspend/expire; trust-score computation + freeze/reactivate; performance-score computation + freeze/reactivate + review-trigger; fraud-signal review/action/dismiss; public-review moderation (approve/publish/reject/remove); admin-rating set. All **platform-owned, auto-calculated for scores (never hand-edited)**.
  - **Trust-produced outputs (events; Doc-2 §8):** `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen` (+ score bands/badges projected to read-models by the consumers).
  - **Trust-consumed inputs (events; Doc-2 §8):** the Operations performance-input events `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` (→ `performance_inputs`, idempotent consumer); RFQ invitation/response outcomes as performance inputs (response/decline/non_response, by pointer to Doc-2 §10.6); the Marketplace declared-tier reference (read) and vendor-profile reference (read).
  - **Interaction boundaries (counterpart → boundary rule):** **Marketplace (Doc-4D)** — owns declared tier + vendor data; Trust publishes `VendorTierChanged[verified]` which Marketplace consumes to write `financial_tier_history` (Trust **never** writes it directly); Marketplace projects verified-tier/score bands into its read-model. **RFQ (Doc-4E)** — consumes trust/verified-tier/performance signals as gate/scoring inputs; Trust **never** computes matching/ranking. **Operations (Doc-4F)** — emits performance-input events Trust consumes; Trust **never** owns engagements/post-award execution. **Communication (Doc-4H)** — fans out Trust event notifications; Trust authors no notification contract. **Billing (Doc-4I)** — a paid plan **never** gates trust/verification/eligibility (firewall).
- **Dependencies:** Architecture §1.5; Doc-3 §11.8/§12.1; Doc-2 §8/§10.6; Doc-4A §4B; Architecture Patch v1.0.1 PATCH-01.
- **Excluded scope:** No score computed/mutated/owned outside Trust; no procurement-decision authority absorbed; no declared-tier ownership.

---

## §G8 — External Dependency Map

- **Purpose:** State every cross-module dependency explicitly, with direction and consumption pattern (per Doc-4A §4 single-authorship, §4.4 integration) — the structure-level seam list the content passes bind to. Carried dependency markers **DG-* identified structurally — carried, not resolved here; analogous to Doc-4D `DD-*` / Doc-4E `DE-*` / Doc-4F `DF-*`.**
  - **DG-1 — Identity boundary.** `organizations`/`memberships`/`check_permission`/`staff_*` slugs are Identity's (Doc-4C, FROZEN). Trust consumes org/membership/active-org resolution, `check_permission`, and the platform-staff slugs (`staff_can_verify`, `staff_can_ban`) by pointer; authors none. **Channel:** consume Doc-4C.
  - **DG-2 — Marketplace boundary.** `vendor_profiles`, `declared_financial_tiers`, and the `vendor_matching_attributes` read-model are Marketplace's (Doc-4D, FROZEN). Trust **references** the vendor profile + declared tier by UUID (read) and **publishes** `VendorTierChanged[verified]`/score events Marketplace consumes into history + read-model; Trust owns no vendor data and **never writes `financial_tier_history`** directly. **Channel:** read by service; publish events; no vendor-data ownership.
  - **DG-3 — RFQ boundary (the moat seam).** `rfqs`/matching/ranking/award are RFQ's (Doc-4E, FROZEN). RFQ **consumes** Trust signals (verified tier, trust band, performance) as gate/scoring inputs; Trust references `rfq_invitations`/`quotations` only as **performance-input source refs** (read) and makes **no procurement decision**. **Channel:** publish signals RFQ consumes; reference source refs read-only.
  - **DG-4 — Operations boundary.** `engagements`/post-award execution are Operations' (Doc-4F, FROZEN). Trust **consumes** the Operations performance-input events (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`) into `performance_inputs` (idempotent consumer); it references `engagement_id` (review gate) by UUID; it owns no Operations entity. **Channel:** consume Operations events; reference engagement read-only.
  - **DG-5 — Admin boundary.** `ban_actions`/moderation are Admin's (Doc-4J). Trust **publishes** fraud-signal/verification outputs Admin consumes for ban management; the ban **decision** is Admin's. **Channel:** publish signals; Admin owns the ban decision.
  - **DG-6 — Communication boundary.** Notification fan-out is Communication's (Doc-4H). Trust **emits** events; Communication owns and authors notification dispatch (single-authorship, Doc-4A §4.4). **Channel:** emit event; Communication owns fan-out.
  - **DG-7 — Billing boundary.** `plans`/`entitlements` are Billing's (Doc-4I). A paid plan/entitlement/flag **never** gates trust/verification/eligibility/routing/matching (firewall, Doc-4A §4B). **Channel:** strict firewall — no Billing input to any Trust signal.
  - **DG-8 — Platform Core boundary.** All `core.*` services (audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags) are Platform Core's (Doc-4B, FROZEN). Trust consumes them by pointer; re-implements none. **Channel:** consume Doc-4B services.
- **Dependencies:** Doc-4A §4/§4.4/§16; Doc-2 §8 (event ownership); Doc-4B/4C/4D/4E/4F (consumed, FROZEN).
- **Excluded scope:** No ownership transfer in any direction; no dependency resolved here (carried as `DG-*`); no integration contract authored (structure only).

---

## §G9 — Ownership Matrix

- **Purpose:** Fix the machine-readable ownership ledger — every Module-5 aggregate/entity to its owning BC-TRUST, and every not-owned reference to its owning module — so no hidden, shared, or duplicate ownership survives into Pass-A.
- **Expected content scope:**
  - **Owned (Trust / `trust` schema), by Doc-2 §2/§3.6/§10.6 — one owning BC-TRUST each:** `verification_records`(+`verification_decisions`), `verified_financial_tiers` → BC-TRUST-1; `trust_scores`(+`trust_score_history`) → BC-TRUST-2; `performance_scores`(+`performance_score_history`/`performance_inputs`) → BC-TRUST-3; `fraud_signals` → BC-TRUST-4; `public_reviews`, `admin_ratings` → BC-TRUST-5.
  - **NOT owned (reference by UUID / service / event only):** Identity entities + `check_permission` + `staff_*` (Doc-4C — DG-1); `vendor_profiles`/`declared_financial_tiers`/attributes (Doc-4D — DG-2); `rfqs`/matching/award (Doc-4E — DG-3); `engagements`/post-award (Doc-4F — DG-4); `ban_actions`/moderation (Doc-4J — DG-5); notification fan-out (Doc-4H — DG-6); `plans`/`entitlements` (Doc-4I — DG-7); all `core.*` (Doc-4B — DG-8).
  - **Tenancy class (Doc-2 §6/§10.6, by pointer):** all `trust.*` are **platform-owned** (scores/verification/fraud/admin-ratings), except `public_reviews` which is **shared** (author org writes; public when published). Bands/badges are public unless frozen; `admin_ratings` are **internal-only, never public, never cross-tenant**.
- **Dependencies:** Doc-2 §2, §3.6, §6, §10.6; Architecture Patch v1.0.1 PATCH-01.
- **Excluded scope:** **No shared ownership, no duplicate ownership, no hidden ownership**; no aggregate in two contexts; every ownership claim justified by a Doc-2 pointer.

---

## §G10 — Event Production Map

- **Purpose:** Structure the events Module 5 **produces** (Doc-2 §8, by pointer) — emitting context, consumers, ownership direction — written transactionally via Doc-4B outbox-write; no event coined.
- **Expected content scope (emitted event → emitting BC-TRUST → consumers, by Doc-2 §8):**
  - **`VendorVerified`** (BC-TRUST-1, `verification_records`) → Marketplace (verified-status reflect), RFQ (eligibility refresh), analytics.
  - **`VendorTierChanged[verified]`** (BC-TRUST-1, `verified_financial_tiers`; payload `tier_type='verified'`) → **Marketplace** (writes `financial_tier_history` — Trust never writes it directly), matching refresh.
  - **`TrustScoreUpdated`** (BC-TRUST-2, `trust_scores`) → Marketplace (`vendor_matching_attributes` rebuild, directory re-rank), RFQ (matching refresh).
  - **`PerformanceScoreUpdated`**, **`PerformanceReviewTriggered`**, **`PerformanceFrozen`** (BC-TRUST-3, `performance_scores`) → Marketplace (read-model rebuild), RFQ (matching refresh).
- **Dependencies:** Doc-2 §8 (trust event rows + primary consumers); Doc-4A §16 (event contract standard); Doc-4B outbox-write (consumed).
- **Excluded scope:** **No event coined** (Doc-2 §8 owns the catalog); no consumer logic authored for other modules' side; outbox mechanism is Doc-4B's.

---

## §G11 — Event Consumption Map

- **Purpose:** Structure the events Module 5 **consumes** (Doc-2 §8, by pointer) — producer, consuming context, ownership direction — at structure level only; consumers are idempotent (Doc-4A §16).
- **Expected content scope (consumed event → producing module → consuming BC-TRUST):**
  - **`DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`** (producer: Operations / Doc-4F) → **BC-TRUST-3** writes the corresponding `performance_inputs` rows (delivery/completion/dispute/feedback), idempotent consumer (Doc-2 §10.6). Ownership direction: Operations owns the events; Trust owns the `performance_inputs` effect (its own consumer).
  - *(Structure-level note — confirmed at content authoring against Doc-2 §8/§10.6:)* RFQ invitation/response outcomes feed `performance_inputs` (response/decline/non_response — only delivered invitations) by the Doc-2 §10.6 rule; any such consumption binds to existing Doc-2 §8 events only; **no event coined**. Published `public_reviews` feed `performance_inputs` (Buyer Feedback) **within** Trust (BC-TRUST-5 → BC-TRUST-3), not a cross-module event.
- **Dependencies:** Doc-2 §8 (event catalog + primary consumers), §10.6 (`performance_inputs` source rule); Doc-4A §16 (idempotent consumer); Doc-4B outbox (consumed).
- **Excluded scope:** **No event invented**; no consumer logic for events owned by other modules beyond Trust's own `performance_inputs` effect; the delivery integration is the emitter's (Operations, §4.4).

---

## §G12 — Permission Surface Map

- **Purpose:** Identify the high-level permission **families** the module's contracts will bind (Doc-2 §7, by pointer) — **not** endpoint permissions (Pass-A work).
- **Expected content scope (permission family → applicable BC-TRUST; by pointer to Doc-2 §7):**
  - **Platform-staff verification family — `staff_can_verify`** (Verification Admin; Doc-2 §7) → BC-TRUST-1 (verification decisions, verified-tier management). Verification Admins hold no finance-read slugs (Doc-2 §7).
  - **Platform-staff ban/fraud family — `staff_can_ban`** (Doc-2 §7) → consumed at the Admin boundary (DG-5); fraud-signal triage is staff-scoped.
  - **Score computation = system-actor** (auto-calculated; no tenant slug — scores are never hand-edited; computation runs under the System actor, Doc-4A §5.2).
  - **Buyer post-award review family — `can_submit_review`** (O,D,M — buyer side, engagement required; Doc-2 §7) → BC-TRUST-5 (public-review submission). Review moderation is platform-staff.
  - Where a required staff action lacks a §7 slug, carry **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive channel) — **no slug invented**.
- **Dependencies:** Doc-2 §7 (permission catalog, `staff_*` + `can_submit_review`); Doc-4A §6/§6B; Doc-4C (`check_permission`, staff slugs).
- **Excluded scope:** **No endpoint permission defined** (Pass-A); no slug invented; no role bundle authored (Identity-seeded).

---

## §G13 — State Machine Inventory

- **Purpose:** Inventory all Trust-owned state machines (Doc-2 §5.6 + §3.6 lifecycles, by pointer) — **inventory only**, no contract or transition detail (Pass-A/Pass-B work).
- **Expected content scope (machine → owning aggregate/BC-TRUST → source pointer):**
  - **Verification** — `verification_records`: `requested → in_review → approved | rejected`, `in_review → requested` (more info), `approved → expired` (lapse/expiry), `approved → revoked` (fraud/compliance) — BC-TRUST-1 (Doc-2 §5.6).
  - **Verified Financial Tier** — `verified_financial_tiers`: `pending_verification → verified → suspended | expired` (24-month review); "Declared Only" = absence of a row — BC-TRUST-1 (Doc-2 §3.6/§10.6).
  - **Trust Score** — `trust_scores`: `computed | frozen` (freeze suspends publication/ranking effect only) — BC-TRUST-2 (Doc-2 §3.6/§10.6).
  - **Performance Score** — `performance_scores`: `not_rated → computed | frozen` (Not Rated until threshold: 5 responses OR 2 projects) — BC-TRUST-3 (Doc-2 §3.6/§10.6).
  - **Performance Inputs** — `performance_inputs`: append-only (correctable, corrections audited) — BC-TRUST-3 (Doc-2 §3.6/§10.6).
  - **Fraud Signal** — `fraud_signals`: `open → reviewed → actioned | dismissed` — BC-TRUST-4 (Doc-2 §3.6/§10.6).
  - **Public Review** — `public_reviews`: `submitted → approved → published | rejected | removed` — BC-TRUST-5 (Doc-2 §3.6/§10.6).
  - *(Trust-score / verification-decision / admin-rating — simple/append-only per Doc-2 §3.6.)*
- **Dependencies:** Doc-2 §5.6 (Verification machine), §3.6/§10.6 (lifecycles); Doc-4A §13 (state-machine standard, applied at Pass-A).
- **Excluded scope:** **No transition contract instantiated** (inventory only); no state/transition invented; the machines are exactly the Doc-2 §5.6/§3.6 set.

---

## §G14 — Escalation Inventory

- **Purpose:** Carry the structurally-identified escalation markers (`ESC-TRUST-*` / `DG-*`) for gaps where the frozen corpus may lack a Module-5 binding — carried, never resolved here; analogous to Doc-4F `[ESC-OPS-*]` / `DF-*`.
- **Expected content scope (markers + the carried cross-module dependencies pointed at Trust):**
  - **Carried dependencies Trust now owns (resolved as the owning module via additive contracts in Doc-4G, not by reopening a frozen module):** **DC-2** (Doc-4C — org/vendor verification = Trust submission boundary); **DD-1** (Doc-4D — vendor verification = Trust contract boundary); **DD-2** (Doc-4D — matching/routing = RFQ; Trust owns the *signals* the read-model projects, not matching); **DF-4** (Doc-4F — Operations emits performance inputs; Trust consumes). These are the inbound carried markers the prior frozen modules pointed at Trust; Doc-4G is their owning-document channel.
  - **`[ESC-TRUST-AUDIT]`** — any Trust mutation discovered during Pass-A lacking explicit Doc-2 §9 coverage MUST carry the marker and halt until resolved via the Doc-2 §9 additive channel; **no audit action invented**. (Doc-2 §9 enumerates a Trust domain — verification request/decision/revoke/expiry, trust/performance freeze+reactivation, recalculation, formula version change, admin tier override — and a Reviews domain; gaps beyond these carry the marker.)
  - **`[ESC-TRUST-POLICY]`** — any Trust runtime tunable requiring a POLICY key absent from Doc-3 §12.2 (e.g., score formula thresholds, review cadence, freeze windows). Reference an existing key by name; if absent, carry the marker — **never invent the key in Doc-4G**. **Channel:** Doc-3 §12.2 additive.
  - **`[ESC-TRUST-SLUG]`** — Trust uses Doc-2 §7 `staff_can_verify`/`staff_can_ban`/`can_submit_review`; if a content pass finds a required action lacks a §7 slug, carry the marker — **no slug invented**. **Channel:** Doc-2 §7 additive.
- **Dependencies:** Doc-2 §7/§9 (slug/audit catalogs); Doc-3 §12.2 (POLICY); Doc-4A §6.4/§16.4/§17 (no-invention rules); Doc-4D/4E/4F escalation-marker precedent; Context Pack v3 §7 (carried-dependency register: DC-2, DD-1).
- **Excluded scope:** No marker resolved here (carried only); no entity/slug/event/audit-action/POLICY-key invented; markers route to their owning-document channels.

---

## §G15 — Cross-Module Reference Inventory

- **Purpose:** State, per counterpart module, the references Trust holds (by UUID/service/event) and the boundary direction — the structure-level guarantee that no frozen ownership leaks into or out of Trust, with **no ownership transfer**.
- **Expected content scope (counterpart → reference → boundary rule, binding DG-1…DG-8):**
  - **Identity (Doc-4C, FROZEN) — DG-1:** reference `organization_id`/staff `user_id`; consume `check_permission` + `staff_can_verify`/`staff_can_ban`; author none.
  - **Marketplace (Doc-4D, FROZEN) — DG-2:** reference `vendor_profile_id` + `declared_financial_tiers` by UUID (read); publish `VendorTierChanged[verified]`/score events Marketplace consumes; own/mutate no vendor data; **never write `financial_tier_history`**.
  - **RFQ (Doc-4E, FROZEN) — DG-3:** reference `rfq_invitation_id`/`quotation_id` as performance-input source refs (read); publish trust/verified-tier/performance signals RFQ consumes; make no procurement decision.
  - **Operations (Doc-4F, FROZEN) — DG-4:** reference `engagement_id`/`wcc` source refs (read); consume the Operations performance-input events into `performance_inputs`; own no Operations entity.
  - **Admin (Doc-4J) — DG-5:** publish fraud/verification outputs Admin consumes; the ban decision is Admin's.
  - **Communication (Doc-4H) — DG-6:** emit events; Communication owns fan-out.
  - **Billing (Doc-4I) — DG-7:** strict firewall — no Billing input to any signal.
  - **Platform Core (Doc-4B, FROZEN) — DG-8:** consume audit/outbox/UUIDv7+human-ref/POLICY/flags.
- **Dependencies:** Doc-4A §4 (module ownership), §4.4 (single-authorship); Doc-2 §8 (events), §6 (tenancy), §10.6 (refs); Doc-4B/4C/4D/4E/4F (FROZEN).
- **Excluded scope:** No ownership crosses a boundary; no shared ownership; the procurement moat (RFQ owns matching/award; Marketplace owns vendor data/declared tier) is preserved — Trust owns the signals, never the decisions or the vendor data.

---

## §G16 — AI-Agent Safety Notes

- **Purpose:** Structure the cross-cutting constraints that keep AI-assisted implementation of Module 5 unambiguous and firewall-safe — machine-readable boundaries enabling Pass-A authoring without reinterpretation.
- **Expected content scope:** **Ownership rules** — Trust owns and computes all governance signals (trust/verified-tier/performance scores, verification, fraud, admin-ratings, public-reviews), each aggregate in exactly one BC-TRUST (§G5/§G9); every responsibility/aggregate/event has an explicit owner. **Calculation authority** — scores are **auto-calculated under the System actor, never hand-edited**; only `performance_inputs`/underlying data may be corrected (corrections audited); formula versions are recorded. **Mutation restrictions** — no other module calculates/mutates/owns a score; Trust never writes `marketplace.financial_tier_history` (publishes the event instead); the declared tier stays Marketplace's, the verified tier is Trust's. **Trust-firewall rules** — a paid plan/entitlement/flag never gates trust/verification/eligibility/routing/matching (Doc-4A §4B); Trust consumes Operations performance-input events + RFQ/Marketplace references but absorbs **no** matching/routing/ranking/quotation-evaluation/supplier-selection/award (RFQ) and **no** vendor-data/declared-tier (Marketplace); no event/slug/audit-action/POLICY-key invention — escalate via `ESC-TRUST-*` (§G14). Audience: Claude Code, Cursor, OpenAI Codex, backend, frontend, QA.
- **Dependencies:** Doc-4A §0.6 (flag-and-halt), §4.1 (one owner), §4B (firewall); Architecture §1.5; Doc-4B/4C/4D/4E/4F (consumed); Architecture Patch v1.0.1 PATCH-01.
- **Excluded scope:** No implementation code; no architectural assumption (all bindings by pointer); no resolution of `DG-*`/`ESC-TRUST-*` markers.

---

## §G17 — Structure Summary

- **Purpose:** Close the structure with the section inventory and the freeze-readiness posture (no findings, no commentary — a structure ledger).
- **Expected content scope:** Module 5 — Trust & Verification (`trust` schema, `trust_` namespace) decomposes into **5 bounded contexts** (BC-TRUST-1 Verification & Verified Tier · BC-TRUST-2 Trust Scoring · BC-TRUST-3 Performance Scoring · BC-TRUST-4 Fraud & Risk Signals · BC-TRUST-5 Reviews & Admin Ratings) owning **7 aggregates** (Doc-2 §2, Module 5), each aggregate in exactly one context. Cross-module dependencies **DG-1…DG-8** (Identity, Marketplace, RFQ, Operations, Admin, Communication, Billing, Platform Core) are explicit with direction + single-authorship side. Produced events: `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen` (to Marketplace/RFQ). Consumed events: `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` (from Operations → `performance_inputs`). State machines inventoried: Verification (§5.6), Verified Tier, Trust Score, Performance Score, Performance Inputs, Fraud Signal, Public Review. Escalation markers carried: `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]`; inbound carried dependencies now owned: DC-2, DD-1, DF-4. The **trust firewall** is preserved (Trust is the sole score authority; no external score ownership; no paid-plan gating); the **procurement moat** is preserved (Trust absorbs no matching/routing/ranking/quotation-evaluation/supplier-selection/award); DDD integrity holds (no boundary leakage); event integrity holds (no ownership conflict; no event coined). Operations owns post-award; Marketplace owns vendor data/declared tier; RFQ owns matching/award; Trust owns the governance signals; nothing invented. **Structure is ready for Independent Hard Review → Structure Patch → Structure FROZEN → Pass-A authoring.**
- **Dependencies:** §G1–§G16; the frozen corpus.
- **Excluded scope:** No contract/command/query/payload/validation/state-machine-detail/audit-action instantiated; no review/commentary/roadmap.

---

*End of Doc-4G — Trust & Verification Engine — Structure Proposal v0.1. Structure only — no contract, command, query, payload, validation matrix, state-machine detail, or audit action instantiated. Module 5 (`trust` schema, `trust_` namespace) decomposes into 5 bounded contexts (BC-TRUST-1…5) owning 7 aggregates (Doc-2 §2 — Verification Case, Verified Financial Tier, Trust Score, Performance Score, Fraud Signal, Admin Rating, Public Review), each in exactly one context; cross-module dependencies DG-1…DG-8 explicit; produced events `VendorVerified`/`VendorTierChanged[verified]`/`TrustScoreUpdated`/`PerformanceScoreUpdated`/`PerformanceReviewTriggered`/`PerformanceFrozen`; consumed events `DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded` (Operations → `performance_inputs`); escalation markers `[ESC-TRUST-AUDIT]`/`[ESC-TRUST-POLICY]`/`[ESC-TRUST-SLUG]` carried; inbound carried dependencies DC-2/DD-1/DF-4 now owned. Bound by pointer to Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A/4B/4C/4D/4E/4F v1.0 (all FROZEN); the trust firewall and procurement moat preserved; Trust is the sole governance-signal authority; nothing invented. Next: Independent Hard Review.*
