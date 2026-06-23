# Doc-4E — RFQ Procurement Engine — API & Integration Contracts — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN — canonical Table of Contents for Doc-4E** |
| Module | Module 3 — RFQ Procurement Engine (`rfq` schema) — **the procurement moat** |
| Supersedes | `Doc-4E_Structure_Proposal_v0.1.md` (Architecture Board structure review + `Doc-4E_Structure_Patch_v0.1.1.md` applied; authoring/review/patch commentary removed per Board decision). Freeze certified by `Doc-4E_Structure_Freeze_Gate_v1.0.md`. |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (`…v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`), Doc-3 v1.0.2 (`…v1.0.1.md` + `Doc-3_Patch_v1.0.2.md` + `Doc-3_Policy_Key_Registration_Patch_v1.0.md`), Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0 (all FROZEN) |
| Family-map basis | Doc-4A §1.3: **Doc-4E = RFQ Procurement Engine (Module 3)**; Appendix B namespace `rfq_` |
| Contains | Structure only — section number, title, purpose, expected content scope, dependencies, excluded scope. **No contracts, endpoints, payloads, events, permissions, audit actions, validations, business rules, or implementation detail.** |
| Audience | Doc-4E content-pass authors; Claude Code / Cursor / backend / frontend / QA / AI coding agents |

**Family-map basis (recorded).** **Doc-4E = RFQ Procurement Engine (Module 3)**, confirmed against the frozen corpus: Doc-4A §1.3, Doc-4A Appendix B (`rfq_` → Doc-4E), Doc-2 §0.3 (`rfq` = Module 3), and Context Pack v3 §3 (Module 3, `rfq` schema). RFQ occupies the reserved Doc-4E slot; Marketplace remains Doc-4D (Module 2), unaffected.

**Three governing rules shape this document:**

1. **Reference, never restate (Doc-4A §0.3).** Entity definitions (Doc-2 §3.4), the RFQ / Quotation state machines (Doc-2 §5.4/§5.5, as amended by `Doc-2_Patch_v1.0.3` PATCH-D2-01/02), permission slugs (Doc-2 §7), events (Doc-2 §8), audit actions (Doc-2 §9), and POLICY keys (Doc-3 §12.2) have owners; Doc-4E binds to them by pointer and copies none of them. Operational rules (gates, pipeline order, fairness, capacity, distribution, quotation, evaluation, abuse) are owned by **Doc-3 v1.0.2** and are bound by pointer, never re-derived.
2. **Consume frozen lower layers; redefine nothing.** Doc-4E consumes the Doc-4A standards (templates §21, authorization §6/§6B, context §5, firewall §4B) and the frozen services/contracts of **Doc-4B Platform Core** (audit-write §17, outbox-write §16, UUIDv7 + human-reference §8, POLICY §18, feature flags), **Doc-4C Identity** (org/membership resolution, `check_permission`, delegation grants), and the **Doc-4D Marketplace** service surface (the `vendor_matching_attributes` read-model — DE-2) — all by pointer. It redefines none of them.
3. **Structure only.** This document maps sections; it instantiates no contract, payload, event, slug, audit action, validation, or business rule. Those are the content passes' work, authored against this frozen structure.

---

# Document Purpose

**Doc-4E is the API & Integration Contract document for Module 3 — the RFQ Procurement Engine, the platform's procurement moat.** Its purpose is to convert the frozen RFQ behavior — Doc-3 v1.0.2's lifecycle, eligibility framework, routing pipeline, capacity model, distribution policy, matching-confidence framework, quotation workflow, buyer-evaluation workflow, abuse controls, and economics — together with the Doc-2 v1.0.3 `rfq`-schema entities, state machines, events, audit actions, and permission slugs, into **implementation-ready contracts** for AI-assisted and human engineering.

Doc-4E is where the moat becomes executable: buyer-outcome quality, vendor fairness, capacity awareness, and trust preservation are expressed as contract obligations, and pay-to-win routing is foreclosed at the contract layer (Doc-3 §11.8 / §12.1 FIXED; Doc-4A §4B firewall). The document is **implementation-neutral** (no REST-only/GraphQL-only assumption; Doc-4A §2, Authoring Rule 9), **internally complete** (no "TBD"; Authoring Rule 11), and **written for AI-agent consumption** — agents flag conflicts and escalate rather than working around invariants (Doc-4A §0.6).

What Doc-4E is **not**: it is not a redesign of any frozen decision, not a new workflow, not a new entity/ownership model, and not the operational specification itself (that is Doc-3, consumed by pointer). It introduces no module, bounded context, lifecycle, permission system, or audit system beyond what the frozen corpus already defines.

---

# Ownership Statement

**Module 3 owns the `rfq` schema and no other.** Per Doc-2 §2 (Module 3), §3.4, §10.4 and Architecture §16 / ADR-017, Doc-4E exposes contracts over — and only over — the following owned aggregates and their entities:

**Owned aggregates (Doc-2 §2, Module 3):**

- **RFQ** — root `rfqs`; children `rfq_versions` (immutable once quoted), `rfq_invitations` (invitation lifecycle per vendor profile), `rfq_invitation_grantees` (per-organization access rows materialized at delivery), `rfq_document_grants` (per-organization spec-document access), `rfq_routing_log`; value objects WorkNature, RoutingMode, EstimatedValue, DeliveryGeography.
- **Quotation** — root `quotations`; children `quotation_versions` (each bound to an `rfq_version_id`), `quotation_visibility` (grant); value objects PriceBreakdown, DeliveryTerms, WarrantyTerms.
- **Comparison Statement** — root `comparison_statements`; versioned rows; value object ComparisonMatrix.
- **Routing Rule** — root `routing_rules` (control-plane rule definitions; platform-owned).
- **Matching Result** — `matching_results` (derived; AR for regeneration); value object ConfidenceBreakdown.

**RFQ Procurement Engine owns the procurement logic** (Doc-3, by pointer): RFQ lifecycle; RFQ versioning/revision; submission & moderation hand-off; routing pipeline (the canonical Phase A–F pipeline, Doc-3 §3.1); matching-confidence computation (Doc-3 §6); ranking, fairness, capacity-aware selection (Doc-3 §3.3/§4/§7); supplier-selection & fair-distribution; invitation creation/delivery/lifecycle; quotation collection & lifecycle; quotation comparison; and procurement decision **support** (shortlist/award/loss — decision support, never auto-decision; Doc-3 §9.1 FIXED).

**Module 3 does NOT own (reference by UUID only; bind by service/event):**

- `organizations` / `memberships` / `roles` / `delegation_grants` / `buyer_profiles` / `check_permission` → **Identity (Doc-4C, FROZEN) — DE-1**.
- `vendor_profiles` / `vendor_capacity_profiles` / `declared_financial_tiers` / `category_assignments` / `categories` / `vendor_matching_attributes` read-model → **Marketplace (Doc-4D, FROZEN) — DE-2**. RFQ **reads** vendor discovery/profile/attribute data via the Marketplace service surface; it never writes vendor data and never re-derives the attributes (Doc-4D DD-2 is the mirror of DE-2).
- `verification_records` / `trust_scores` / `performance_scores` / `verified_financial_tiers` → **Trust (Doc-4G) — DE-3**. RFQ consumes verified outcomes/scores as scoring and gate inputs; it never computes or stores them.
- `private_vendor_records` / `buyer_vendor_statuses` (**root: `buyer_supplier_relationships`**; Approved/Conditional/Blacklisted) / `vendor_favorites` / `engagements` / `vendor_leads` → **Operations (Doc-4F) — DE-4**. The buyer's CRM status set (the Buyer Filter universe and blacklist floor, Doc-3 §2.1) is **read via the Operations CRM service only**, under the non-disclosure invariant; post-award `engagements` and vendor-side `vendor_leads` are Operations-owned and created by Operations on RFQ-emitted events. (`buyer_vendor_statuses` is a child of the `buyer_supplier_relationships` aggregate root — Doc-2 §2 Module 4, §10.5; ownership unchanged, pointer clarification only.)
- `ban_actions` / moderation decisions / `VendorBanned` → **Admin (Doc-4J) — DE-5**. RFQ moderation hand-off (`submitted → under_review`, and the `under_review → draft` reject edge) is a platform-staff/Admin action (`staff_can_moderate_rfq`); RFQ **reflects** the moderation outcome, it does not own the moderation decision authority.
- Notification fan-out (in-app/email/SMS/WhatsApp) → **Communication (Doc-4H) — DE-6**. RFQ **emits** outbox events (`VendorInvited`, etc.); Communication owns and authors the notification dispatch (single-authorship, Doc-4A §4.4). RFQ authors no notification contract.
- `subscriptions` / `entitlements` / `plan_entitlements` / quotation-submission-quota balance (`monthly_rfq_limit`) / lead-guarantee entitlement / lead credits → **Billing (Doc-4I) — DE-7**. RFQ **reads** the remaining quotation-submission quota as a delivery ceiling and at submission (Doc-3 §4.1.1 three-instrument identity); it consumes guarantee/credit entitlement facts; it never owns the monetization ledger.
- all `core.*` (audit, outbox, id_sequences, system_configuration, feature_flags) → **Platform Core (Doc-4B, FROZEN) — DE-8**.

**No ownership leakage permitted** (Doc-4A §4.1; Project Instructions "One Entity = One Owner"). Specifically: Marketplace owns vendor discovery/profiles/attributes — RFQ never re-models them; RFQ owns matching/routing/ranking/selection/comparison/decision-support — no other module duplicates that logic (Doc-4D DD-2 explicitly cedes it here).

---

# Domain Map

Module 3 decomposes into **bounded contexts within the `rfq` schema** (candidate set, to be confirmed at content authoring — analogous to Doc-4D §D3). Each context maps to one or more owned aggregates; every planned contract lands in exactly one context.

| # | Bounded Context (within Module 3) | Primary Aggregate(s) | Core responsibility (Doc-3 / Doc-2 pointers) |
|---|---|---|---|
| BC-1 | **RFQ Authoring & Lifecycle** | RFQ (`rfqs`, `rfq_versions`) | Draft→submit→approval→moderation hand-off→terminal lifecycle; versioning/immutability-once-quoted; validity clock; reissue (Doc-3 §1; Doc-2 §5.4 + PATCH-D2-01/02) |
| BC-2 | **Eligibility & Matching Pipeline** | Matching Result (`matching_results`), Routing Rule (`routing_rules`) | Phase-A hard gates; geography; matching-confidence scoring; `matching_results` projection (Doc-3 §2/§3.1/§6) |
| BC-3 | **Routing, Selection & Distribution** | RFQ Invitation (`rfq_invitations`, grantees, document grants), `rfq_routing_log` | Selection & fair distribution; throttling; wave assembly & replenishment; invitation creation/delivery/lifecycle; routing telemetry/explainability (Doc-3 §3.3–§3.6/§4/§5/§7) |
| BC-4 | **Quotation Management** | Quotation (`quotations`, `quotation_versions`, `quotation_visibility`) | Submit/revise/withdraw/decline; one-active-per-vendor-per-RFQ; version-binding to `rfq_version_id`; quota consumption at submission (Doc-3 §8; Doc-2 §5.5) |
| BC-5 | **Buyer Evaluation & Comparison** | Comparison Statement (`comparison_statements`) | Auto-generated/versioned comparison; shortlist; clarification rounds; best-and-final; award/loss decision-support (Doc-3 §9) |
| BC-6 | **Procurement Decision & Closure** | RFQ (terminal states) + award projection | Single-award closure; closed_won→engagement hand-off (Operations); closed_lost/cancel/expire; loss notification trigger (Doc-3 §1.2/§9.4–§9.5; Doc-2 §5.4) |
| BC-7 | **Routing Governance & Control Plane** | Routing Rule (`routing_rules`), POLICY surface | Control-plane routing rules; operating-stage behavior; human-assisted/founder review hooks; POLICY binding (Doc-3 §0.1/§3.6/§12; Doc-4A §18/§18B) |

**Bounded-context → section mapping (no new section; contract-placement guide for content passes):** BC-1 → §E4; BC-2 → §E5; BC-3 → §E6; BC-4 → §E7; BC-5 → §E8; BC-6 → §E8 (absorbed — procurement decision & closure contracts share the buyer-evaluation/closure section); BC-7 → §E6 (routing governance & control-plane contracts live in the routing/selection/distribution section). Each planned contract lands in exactly one bounded context; the absorption of BC-6 into §E8 and BC-7 into §E6 is a section-placement clarification only — no section added or removed.

Cross-cutting surfaces (not separate contexts; threaded through the above and structured in dedicated sections): **Event surface** (§E10), **Audit surface** (§E12), **Authorization surface** (§E11), **Integration surface** (§E9), **AI-agent constraints** (§E13). The matching/routing **engine** context belongs here (Module 3); vendor **discovery/profile/attribute** context belongs to Marketplace (Doc-4D), referenced not owned — the moat boundary.

---

# Section Tree

> Numbering is hierarchical (`§En` top level; `§En.m`, `§En.m.k` nested). Each top-level section carries **Purpose · Expected content scope · Dependencies · Excluded scope**, matching the frozen Doc-4D structure format. This is the frozen Table of Contents; it instantiates nothing.

---

## §E0 — Governance & Scope

- **Purpose:** Establish Doc-4E as the contract document for **Module 3 — RFQ Procurement Engine only**, subordinate to the frozen corpus and Doc-4A. Declare the ownership boundary, the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E), the flag-and-halt obligation (§0.6) and patch-based amendment rule, the conformed corpus versions, and the carried freeze-gate dependency / escalation markers (DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`).
- **Expected content scope:** A short, fully normative control section: ownership declaration (Module 3 owns the `rfq` schema entities and no others); authority boundaries (what RFQ governs vs. only references/consumes — the moat boundary against Marketplace, Trust, Operations, Admin, Communication, Billing); corpus bindings (Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A/4B/4C/4D v1.0); escalation-marker register (DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`); the family-map confirmation note.
- **Dependencies:** Doc-4_Governance_Note_v1.0; Doc-4A §0, §1.3, Appendix B; Doc-2 §0.3; Doc-4D §D0 (the carried-marker precedent).
- **Excluded scope:** No standards introduced; no resolution of any DE / ESC marker (carried only); no module other than Module 3.

**Carried freeze-gate dependency / escalation markers (identified structurally; carried — not resolved here).** Each is derived from a boundary the frozen corpus already fixes; resolution (where needed) is an additive patch to the owning document, never a change to Doc-4E. (These mirror the Doc-4C `DC-*` / Doc-4D `DD-*` pattern.)

- **DE-1 — Identity boundary.** `organizations`, `memberships`, `roles`, `buyer_profiles`, `delegation_grants`, and `check_permission` are owned by **Identity (Module 1 / Doc-4C, FROZEN)**. RFQ consumes org/membership/active-org-context resolution, `check_permission`, and delegation grants (for vendor-side representative action) by pointer; it authors none of them. **Channel:** consume the Doc-4C contracts; no Identity contract authored in Doc-4E.
- **DE-2 — Marketplace vendor-data boundary (moat seam).** `vendor_profiles`, `vendor_capacity_profiles`, `declared_financial_tiers`, `category_assignments`, `categories`, and the **`vendor_matching_attributes` read-model** are owned by **Marketplace (Module 2 / Doc-4D, FROZEN)**. RFQ **reads** vendor discovery/capability/geography/category/tier/capacity/attribute data via the Marketplace service surface to run gates and scoring; it never writes vendor data and never re-derives the read-model. This is the exact mirror of Doc-4D **DD-2** ("matching/routing logic = RFQ; Marketplace owns the read-model"). **Channel:** read via Marketplace service; matching/routing logic stays in Doc-4E.
- **DE-3 — Trust signal boundary (firewall).** `verification_records`, `trust_scores`, `performance_scores`, and `verified_financial_tiers` are owned by **Trust (Module 5 / Doc-4G)**. RFQ consumes verified tier, trust band, and performance score as **gate and scoring inputs** (Doc-3 §2.5/§6.1) and reacts to `VendorVerified` / `VendorTierChanged[verified]` / `TrustScoreUpdated` / `PerformanceScoreUpdated`; it never computes, stores, or mutates a trust signal. Governance-signal firewall applies (Doc-4A §4B; Doc-3 §12.1 FIXED): no signal mutates another; payment never influences a signal. **Channel:** consume Trust outcomes/events; no trust/score/verification contract authored.
- **DE-4 — Operations boundary (buyer CRM + post-award + vendor CRM).** `buyer_vendor_statuses` (**root: `buyer_supplier_relationships`**; Approved/Conditional/Blacklisted), `private_vendor_records`, `vendor_favorites`, `engagements`, `vendor_leads` are owned by **Operations (Module 4 / Doc-4F)**. The Buyer Filter universe and blacklist floor (Doc-3 §2.1) are **read via the Operations CRM service only**, under the non-disclosure invariant (blacklist exclusion indistinguishable from non-match). Post-award `engagements` and vendor-side `vendor_leads` are created by Operations on RFQ-emitted events (`RFQClosedWon`, `VendorInvited`). **Channel:** read CRM status via service; Operations authors its own consumers; no Operations entity authored.
- **DE-5 — Admin moderation & ban boundary.** RFQ moderation (the `submitted → under_review` gate and the `under_review → draft` reject edge per `Doc-2_Patch_v1.0.3` PATCH-D2-01) is a **platform-staff/Admin** action (`staff_can_moderate_rfq`; Admin Module 8 / Doc-4J); `ban_actions` / `VendorBanned` are Admin-owned. RFQ **reflects** moderation and ban outcomes (a banned/suspended vendor fails the eligibility gate; Doc-3 §2.7) and exposes the moderation transition surface, but the moderation/ban **decision authority** is Admin's. **Channel:** reflect Admin decisions / consume `VendorBanned`; the moderation actor and ban action are Admin-owned.
- **DE-6 — Communication boundary (single-authorship).** Notification fan-out (in-app/email/SMS/WhatsApp) is owned by **Communication (Module 6 / Doc-4H)**. **RFQ MUST NOT author any notification-dispatch or Communication contract** — emitting the outbox event (e.g., `VendorInvited`, `QuotationSubmitted`, `RFQClosedWon`/`RFQClosedLost`) is the only authored product of an RFQ state change that crosses to Communication (single-authorship preserved, Doc-4A §4.4). Per-event Communication-consumption legs are Communication-authored. **Channel:** emit the event; Communication owns the fan-out.
- **DE-7 — Billing entitlement & quota boundary (firewall).** `subscriptions`, `entitlements`, `plan_entitlements`, the quotation-submission quota balance (`monthly_rfq_limit`), lead-guarantee entitlement, and lead credits are owned by **Billing (Module 7 / Doc-4I)**. RFQ **reads** the remaining quotation-submission quota as a delivery ceiling and consumes it at submission per the **three-instrument accounting identity** (Doc-3 §4.1.1, `Doc-3_Patch_v1.0.2` PATCH-D3-01: entitlement vs delivery vs quotation-quota, no single event consumes more than one instrument); it consumes guarantee/credit entitlement facts for accounting (Doc-3 §11.6–§11.7). **FIXED:** paid plans never influence eligibility, scores, confidence, or the routing fairness ceiling (Doc-3 §11.8/§12.1; Doc-4A §4B). **Channel:** read entitlement/quota from Billing; no billing contract authored; firewall preserved.
- **DE-8 — Platform Core boundary.** All `core.*` services — audit-write (§17), outbox-write (§16), UUIDv7 + human-reference (§8), POLICY read (§18), feature flags — are owned by **Platform Core (Module 0 / Doc-4B, FROZEN)**. RFQ consumes them by pointer and re-implements none. **Channel:** consume Doc-4B services.
- **`[ESC-RFQ-AUDIT]` — RFQ audit-action gaps not separately enumerated in Doc-2 §9.** Doc-2 §9 enumerates the RFQ and Quotation audit domains (create/edit/submit/approve/moderation pass-fail/cancel/expire/shortlist/close; invitation transitions `InvitationDelivered`/`Accepted`/`Declined`/`Expired`; quotation create/edit/submit/withdraw/select/reject). **Candidate gaps identifiable at structure time** (newer Doc-3 v1.0.2 behaviors whose audit action is not separately named in §9): the **`under_review → draft` moderation-reject** action (PATCH-D2-01, reason `rfq_correction_required`); the **`matching → expired` coverage-exhausted** action (PATCH-D2-02, reason `no_eligible_vendors_found`); **incremental-rematch** routing-log entries (PATCH-D3-03, flag `incremental_rematch`); and **`buyer_directed`-flagged invitation** creation (PATCH-D3-02). **Interim:** bind the nearest enumerated §9 action by pointer; **no audit action invented**. **Channel:** Doc-2 §9 additive patch (analogous to Doc-4C `[ESC-IDN-AUDIT]` and Doc-4D `[ESC-MKT-AUDIT]`).
- **`[ESC-RFQ-POLICY]` — `rfq`/`matching`/`routing`/`distribution`/`fairness`/`capacity`/`confidence`/`quote`/`eval`/`abuse` POLICY keys are owned by Doc-3 §12.2; any key referenced by a Doc-4E contract MUST exist there (Doc-4A §18.2).** Doc-3 §12.2 already registers the full RFQ POLICY inventory (and the `core.*` block via the Policy-Key-Registration patch). **Interim:** reference POLICY keys by their exact Doc-3 §12.2 name; if a content pass finds a referenced key absent from §12.2, **carry the marker — never invent the key in Doc-4E** (the exact failure mode the Doc-4B `core.*` registration resolved). **Channel:** Doc-3 §12.2 additive registration.

---

## §E1 — Module Mission

- **Purpose:** State, once, the business purpose, strategic role, and **procurement-moat ownership** of Module 3.
- **Expected content scope:** Business purpose (the matched-and-metered RFQ procurement engine of iVendorz — it sells *matched, metered, high-intent leads*, not exposure; Doc-3 operating doctrine); strategic role within the **40% B2B Marketplace · 30% Procurement · 20% ERP-Lite · 10% Vendor Network** positioning, with RFQ as the **30% procurement core and the platform moat**; the four permanent selection objectives (buyer-outcome quality, vendor fairness, marketplace growth, capacity utilization — Doc-3 §3.3 FIXED) and the no-pay-to-win invariant (Doc-3 §11.8/§12.1); marketplace-maturity staging (Stage A→C, per-cell, Doc-3 §0.1) as it governs routing autonomy and human-assist.
- **Dependencies:** Architecture (platform identity, procurement moat); Doc-3 §0 (operating context, doctrine, stages), §11 (economics); Doc-2 §2 (Module 3 aggregates); Project Instructions (procurement philosophy).
- **Excluded scope:** No vendor discovery/profile/attribute narrative (Doc-4D); no re-derivation of architecture; no operating-numbers hardcoding (POLICY values stay in Doc-3 §12, bound by key).

---

## §E2 — Ownership Model

- **Purpose:** Fix the contract surface of Module 3 — enumerate owned entities, aggregates, lifecycle ownership, authority ownership, and — critically — what RFQ does **not** own and references by UUID only (the moat seam).
- **Expected content scope:**
  - **Owned aggregates (Doc-2 §2, Module 3):** RFQ (`rfqs` + children `rfq_versions`, `rfq_invitations`, `rfq_invitation_grantees`, `rfq_document_grants`, `rfq_routing_log`), Quotation (`quotations` + `quotation_versions`, `quotation_visibility`), Comparison Statement (`comparison_statements`), Routing Rule (`routing_rules`), Matching Result (`matching_results`, derived/regenerable).
  - **Owned entities (Doc-2 §3.4):** the `rfq.*` entities, each with tenancy class (Doc-2 §6) and lifecycle (Doc-2 §3.4/§5.4/§5.5).
  - **Lifecycle ownership:** RFQ (§5.4 incl. PATCH-D2-01/02 edges), Quotation (§5.5), and the append-only/derived lifecycles (`rfq_routing_log`, `matching_results`, versioned children).
  - **Authority ownership:** which mutations/state transitions only RFQ may perform (create/version/submit/cancel RFQ; selection/routing/invitation delivery; quotation collection; comparison generation; shortlist/award decision-support) — by pointer to §E11. Note the **two non-RFQ-actor transitions** RFQ surfaces but does not decide: moderation pass/reject (platform/Admin actor — DE-5) and system-actor expiry (validity clock + coverage-exhausted — Doc-2 §5.4).
  - **Explicitly NOT owned (reference by UUID only):** Identity entities + `check_permission` (Doc-4C — DE-1); Marketplace vendor data + `vendor_matching_attributes` (Doc-4D — DE-2); Trust scores/verification/verified-tier (Doc-4G — DE-3); Operations CRM/`buyer_vendor_statuses`/`engagements`/`vendor_leads` (Doc-4F — DE-4); `ban_actions`/moderation decision authority (Doc-4J — DE-5); notification fan-out (Doc-4H — DE-6); Billing entitlement/quota/credits (Doc-4I — DE-7); all `core.*` (Doc-4B — DE-8).
- **Dependencies:** Doc-2 §2, §3.4, §6, §10.4; Architecture §16 (module map); ADR-017 (module ownership), ADR-005 (vendor identity/representation, consumed); Architecture Patch v1.0.1 (PATCH-06 RFQMatched/RFQRouted events).
- **Excluded scope:** No ownership of any non-`rfq` entity; no aggregate-boundary change; the matching **read-model** is Marketplace's (consumed, not owned — DE-2); post-award **engagement** is Operations' (hand-off, not owned — DE-4).

---

## §E3 — Bounded Context Model

- **Purpose:** Define the bounded contexts **within** Module 3 (Domain Map), their responsibilities, internal ownership boundaries, and interactions — so content passes place each contract in exactly one context.
- **Expected content scope:** The candidate contexts (BC-1…BC-7 of the Domain Map): **RFQ Authoring & Lifecycle**, **Eligibility & Matching Pipeline**, **Routing/Selection & Distribution**, **Quotation Management**, **Buyer Evaluation & Comparison**, **Procurement Decision & Closure**, **Routing Governance & Control Plane**. For each: responsibilities, internal aggregate ownership, and inter-context interactions (all within RFQ; cross-module interactions deferred to §E9). Confirm the boundary that the **matching/routing engine context lives here**, while the **vendor discovery/profile/attribute context is Marketplace's** (referenced via DE-2).
- **Dependencies:** Doc-2 §2 (aggregates), §3.4 (entities); Doc-3 §1–§9 (operational context boundaries); Doc-4D §D3 (the within-module context precedent).
- **Excluded scope:** No cross-module context ownership; no new bounded context beyond what the aggregates and Doc-3 sections imply; the vendor-data context is not re-modeled here (DE-2).

---

## §E4 — RFQ & Quotation Lifecycle Model

- **Purpose:** Provide the structural home for Module 3's state machines, bound to the literal Doc-2 §5.4/§5.5 edges (as amended) — declared as legal transitions only (Doc-4A §13), never invented or modified.
- **Expected content scope:**
  - **RFQ (Doc-2 §5.4, as amended by `Doc-2_Patch_v1.0.3`):** the full machine — `draft → [pending_internal_approval] → submitted → under_review → matching → vendors_notified → quotations_received → buyer_reviewing → shortlisted → closed_won | closed_lost`; plus the patched edges **`under_review → draft`** (moderation reject; platform-moderation actor; reason `rfq_correction_required`; PATCH-D2-01) and **`matching → expired`** (coverage exhausted; system actor; reason `no_eligible_vendors_found`; PATCH-D2-02); the multi-source **`→ expired`** (validity-window lapse, system actor) and **`any active → cancelled`** (audited reason). Actor/guard per transition by pointer to Doc-3 §1.2 (operational meaning) and Doc-2 §5.4 guards (version immutability once quoted; `estimated_value` required at submission — ASSUMPTION A-05).
  - **Quotation (Doc-2 §5.5):** `draft → submitted`; `submitted → submitted` (revise → new version, prior superseded); `submitted → withdrawn`; `submitted → selected`; `submitted → not_selected`; `submitted → expired`; `draft → discard`. Guards by pointer: one-active-per-vendor-per-RFQ (partial unique index, Doc-2 §10.4); quotation binds to `rfq_version_id` not the mutable head; submission consumes quotation-submission quota from the controlling org (Doc-3 §4.1.1 — DE-7); a formal **decline** is recorded on `rfq_invitations` (`declined`), not as a quotation state.
  - **Invitation lifecycle (Doc-2 §3.4):** `draft → selected → deferred → delivered → accepted | declined | expired` for `rfq_invitations`; the `buyer_directed`-flagged invitation path (Doc-3 §2.11 + PATCH-D3-02) bound by pointer as a delivery variant, **not** a new state.
  - **Terminal states** identified per machine (RFQ: `closed_won`, `closed_lost`, `cancelled`, `expired`; Quotation: `withdrawn`, `selected`, `not_selected`, `expired`); terminal states never reopen (Doc-3 §1.6 FIXED); the recovery path is re-issue (new identity, `reissued_from`).
- **Dependencies:** Doc-2 §5.4 (+ `Doc-2_Patch_v1.0.3` PATCH-D2-01/02), §5.5, §3.4; Doc-3 §1, §8; Doc-4A §13 (state-machine declaration), §3 (patch citation — "Doc-2 §5.4 as amended by PATCH-D2-01").
- **Excluded scope:** No transition invented or modified; the moderation-reject and coverage-exhausted edges are bound exactly as the Doc-2 patch defines them (no variation); the Verification machine (§5.6) is **Trust-owned** (DE-3), not modeled here; the `banned`/`suspended` vendor status that fails eligibility is set by Admin/Marketplace (DE-5/DE-2), reflected not authored.

---

## §E5 — Eligibility & Matching Pipeline Model

- **Purpose:** Structure the engine's deterministic, explainable pipeline — the eligibility gates, geography evaluation, and matching-confidence scoring that produce `matching_results` — bound to Doc-3 §2/§3/§6, with the **FIXED phase order and gate-before-score** preserved as a contract obligation.
- **Expected content scope:**
  - **Canonical pipeline (Doc-3 §3.1, by pointer):** Phase A hard gates A0–A7 (RFQ eligibility validation; buyer filter + blacklist floor + self-match exclusion; category; capability; work-nature; verification value-band + probation; financial-tier ceiling; capacity pre-gate/defer) → Phase B geography → Phase C scoring (`matching_results`) → Phase D selection (capacity adjustment, exposure fairness, probation allocation, final selection) → Phase E throttling → Phase F routing. **FIXED:** phase order; gate-before-score; blacklist before everything; no gate-failed vendor in any downstream artifact (non-disclosure).
  - **Eligibility framework (Doc-3 §2):** each gate's semantics by pointer; probation pool (§2.6); suspension/ban behavior (§2.7 — reflects DE-5); financial-tier lifecycle as a *gating input* (§2.9, declared tier Marketplace-owned, verified tier Trust-owned — DE-2/DE-3); representative-access eligibility computed against the **vendor profile** (§2.8, via delegation grant — DE-1).
  - **Matching-confidence framework (Doc-3 §6):** inputs (all frozen signals — tier fit, capacity consistency, performance, trust band, category weight, geography, buyer preference [buyer-scoped only]); weight groups + dominance cap; band-function normalization with `formula_version`; missing-data renormalization (absence-of-history never scored as zero — FIXED); deterministic salted tie-breaking (§6.5).
  - **Matching Result projection:** `matching_results` as the derived, **regenerable** artifact (Doc-2 §3.4/§6 "derived"); incremental-rematch appends, never recomputes existing results (Doc-3 §11.4 + PATCH-D3-03).
- **Dependencies:** Doc-3 §2 (eligibility), §3.1–§3.5 (pipeline, fairness, cold-start), §6 (confidence); Doc-2 §3.4 (`matching_results`, `routing_rules`), §6 (derived/non-disclosure); Doc-4A §4B (governance-signal firewall — scoring reads signals, never mutates), §13; Marketplace `vendor_matching_attributes` read-model (DE-2); Trust score/verification inputs (DE-3).
- **Excluded scope:** **No matching/routing/ranking/selection logic re-derived from scratch** — Doc-3 §3/§6 owns the rules; Doc-4E binds them as contract obligations (this section structures the *contract surface*, not new math). No governance-signal mutation (firewall). No vendor-attribute computation (Marketplace — DE-2). No POLICY value hardcoded (bound by Doc-3 §12.2 key — `[ESC-RFQ-POLICY]`).

---

## §E6 — Routing, Selection & Distribution Model

- **Purpose:** Structure the wave-based distribution surface — selection & fair distribution, throttling, wave assembly/replenishment, invitation lifecycle, and routing explainability — bound to Doc-3 §3.3–§3.6/§4/§5/§7, preserving vendor fairness and capacity awareness as contract obligations.
- **Expected content scope:**
  - **Selection & fair distribution (Doc-3 §3.3/§7):** equivalence bands + LRR rotation; exposure ceiling + exposure ratio; anti-starvation floor; deterministic salted tie-break; the FIXED selection doctrine (never always-same, never pure-random; four balanced objectives).
  - **Capacity model (Doc-3 §4):** the three capacities (intake/active/monthly-engagement); exhaustion → **defer, not exclude**; recovery on response/expiry/terminal; vendor self-throttle never penalized; capacity vs tier vs performance firewall (§4.5).
  - **Distribution policy (Doc-3 §5):** wave sizing (`target_quotes`/`expected_rr`/clamps); waves & replenishment; relevance floor; per-buyer pressure valve; **no public RFQ board** (§5.1 FIXED — RFQs are distributed, never published).
  - **Invitation lifecycle & access materialization (Doc-2 §3.4):** `rfq_invitations` lifecycle; `rfq_invitation_grantees` + `rfq_document_grants` materialized at delivery (the vendor-side RLS anchor; refreshed on delegation-grant revocation — DE-1); invitation uniqueness (one per RFQ–vendor ever); `buyer_directed`-flagged invitations excluded from valid-lead/guarantee/fairness/wave accounting (Doc-3 §2.11 + PATCH-D3-02 — DE-7).
  - **Routing governance & telemetry:** `routing_rules` control-plane; `rfq_routing_log` per-run explainability (applied mode, filter reference, pipeline outcome, `incremental_rematch` flag); human-assisted/founder review hooks (Doc-3 §3.6) within the forbidden-actions wall; per-cell operating-stage behavior (Doc-3 §0.1; Doc-4A §18B).
- **Dependencies:** Doc-3 §3.3–§3.6 (fairness, capacity-aware routing, human-assist), §4 (capacity), §5 (distribution), §7 (prioritization); Doc-2 §3.4 (invitation entities, `rfq_routing_log`, `routing_rules`), §6/§10.4 (grantee tenancy anchors), §10.11 (non-disclosure CI rules); Doc-4A §18/§18B (POLICY/operating-stage); Doc-4B outbox (for `VendorInvited` — DE-8); Communication fan-out (DE-6).
- **Excluded scope:** No notification dispatch authored (Communication — DE-6); no entitlement/quota computation (Billing — DE-7, read only); no public-visibility surface (FIXED no RFQ board); no fairness/ceiling value hardcoded (POLICY key — `[ESC-RFQ-POLICY]`); no protected-fact exposure (deferral and blacklist exclusion invisible to buyer — Doc-3 §2.1/§4.2 FIXED).

---

## §E7 — Quotation Management Model

- **Purpose:** Structure the vendor-side quotation surface — submit, revise, withdraw, formal decline, late-quote handling — bound to Doc-3 §8 and the Doc-2 §5.5 machine, preserving version integrity and the quota accounting identity.
- **Expected content scope:**
  - **Quotation lifecycle (Doc-2 §5.5; Doc-3 §8):** submit (against the current `rfq_version`; one-active-per-vendor-per-RFQ; completeness floor; quota consumed at submission); revise (new version, never overwrite; soft-cap + clarification-justification beyond it); withdraw (pre-award; slot frees; pattern tracked); formal decline (one-tap, reason-coded, counts as a response, zero performance penalty — recorded on `rfq_invitations`); late quotes (blocked by default; buyer-extension reopens window for **all** un-responded invitees — no private windows, FIXED).
  - **Quota accounting identity (Doc-3 §4.1.1, PATCH-D3-01):** the three-instrument separation (lead entitlement vs lead-delivery accounting vs quotation-submission quota); **FIXED** no single event consumes more than one instrument; `entitlement_quota` read as a delivery ceiling is a *read*, not consumption; submission consumes the quotation-submission quota on the controlling org regardless of acting representative (DE-7).
  - **Visibility & representation:** `quotation_visibility` grant surface (who may read a quotation — buyer side); vendor-side anchor on `controlling_organization_id` + representatives via grantees/visibility (Doc-2 §3.4/§6); one vendor = one active quotation regardless of representative count (conflict surfaced inside the vendor's own house, never to the buyer — Doc-3 §2.8).
- **Dependencies:** Doc-3 §8 (quotation workflow), §4.1.1 (quota identity), §2.8 (representative access); Doc-2 §5.5, §3.4 (`quotations`/`quotation_versions`/`quotation_visibility`), §10.4 (partial unique index); Doc-4C delegation grants + `check_permission` (DE-1); Billing quota read (DE-7); Doc-4B audit/outbox (DE-8).
- **Excluded scope:** No quota ledger owned (Billing — DE-7); no instrument cross-consumption (FIXED); no version overwrite (immutable revisions); no private/silent late acceptance (FIXED); no notification authored (Communication — DE-6).

---

## §E8 — Buyer Evaluation & Comparison Model

- **Purpose:** Structure the buyer-side decision-**support** surface — comparison generation, shortlisting, clarification rounds, best-and-final, award, loss — bound to Doc-3 §9, preserving "decision-support, never auto-decision" as a contract obligation.
- **Expected content scope:**
  - **Comparison statement (Doc-2 §3.4; Doc-3 §9.1):** auto-generated at first quotation; re-versioned on every quotation event; comparison rows + buyer-private columns; default sort (buyer-chosen; Approved floats in Approved-inclusive modes — buyer-scoped only, firewall). **FIXED:** platform never auto-recommends a winner pre-award.
  - **Shortlisting & clarification (Doc-3 §9.2–§9.3):** shortlist (min 1, soft max; starts the decision clock; notifies shortlisted); RFQ-scoped clarification threads; fair-information rule (material clarifications broadcast, anonymized; optional revision window); best-and-final round (sanctioned simultaneous sealed revision).
  - **Award & closure (Doc-3 §9.4; Doc-2 §5.4):** single award → `closed_won` → engagement hand-off (Operations — DE-4); partial/split via re-issue; award authority (`can_award_rfq`; value-threshold ORG approval); award records deal value (transaction intelligence).
  - **Loss process (Doc-3 §9.5):** uniform closure notification to non-selected responders (Communication-dispatched — DE-6); banded (never exact) loss feedback opt-in; expiry-without-buyer-action penalizes vendors nothing (FIXED).
- **Dependencies:** Doc-3 §9 (evaluation workflow); Doc-2 §3.4 (`comparison_statements`), §5.4 (shortlist/award/close edges); Doc-4A §4B (buyer-preference firewall — buyer-scoped, never platform signal); Operations engagement hand-off (DE-4); Communication notifications (DE-6).
- **Excluded scope:** No auto-winner / auto-recommendation (FIXED decision-support boundary); no post-award engagement authored (Operations — DE-4); no cross-tenant buyer-preference leakage (firewall); no notification authored (Communication — DE-6); **no clarification-thread entity or Communication contract authored here (DE-6) — clarification/best-and-final threads are a Communication-owned channel; §E8 binds the buyer-evaluation decision-support surface only and references the thread by pointer**; no multi-award on one RFQ (frozen single-award cardinality).

---

## §E9 — Integration Surface

- **Purpose:** Structure RFQ's cross-module interactions **without transferring ownership** — for each counterpart module, the direction, trigger, and contract-consumption pattern (Doc-4A §4 single-authorship, §4.4 integration rules).
- **Expected content scope:** Interaction surfaces with — **Identity (Doc-4C, FROZEN) — DE-1:** consume org/membership/active-org resolution, `check_permission`, and delegation grants (vendor-side representative action); **Marketplace (Doc-4D, FROZEN) — DE-2:** **read** the `vendor_matching_attributes` read-model and vendor profile/capability/geography/category/tier/capacity data by service (the moat seam — RFQ runs the matching, Marketplace supplies the data); **Trust (Doc-4G) — DE-3:** consume `VendorVerified` / `VendorTierChanged[verified]` / `TrustScoreUpdated` / `PerformanceScoreUpdated` as gate/scoring inputs and re-rank triggers (firewall: read, never mutate); **Operations (Doc-4F) — DE-4:** read buyer CRM status (Buyer Filter universe + blacklist floor) via the CRM service under non-disclosure; emit `RFQClosedWon` (→ Operations creates `engagements`) and `VendorInvited` (→ Operations creates `vendor_leads`); **Communication (Doc-4H) — DE-6:** RFQ events trigger notification dispatch — **Communication owns notification fan-out and authors all notification/Communication integration contracts (Doc-4A §4.4); RFQ MUST NOT author any notification-dispatch or Communication contract** — the outbox event is the only authored product of an RFQ state change that crosses to Communication; **Billing (Doc-4I) — DE-7:** read quotation-submission quota (delivery ceiling + submission) and guarantee/credit entitlement (firewall: payment never influences matching); **Admin (Doc-4J) — DE-5:** moderation hand-off (`staff_can_moderate_rfq`) and `VendorBanned` reflection (RFQ reflects, Admin decides); **Platform Core (Doc-4B, FROZEN) — DE-8:** consume audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags. Each entry states "consume" vs "expose" and the single-authorship side; **no Template 21.2 integration is instantiated in the structure.**
- **Dependencies:** Doc-4A §4, §4.4, §16 (events); Doc-4B (Platform Core services), Doc-4C (Identity contracts), Doc-4D (Marketplace read-model) — all FROZEN; Doc-2 §8 (event ownership).
- **Excluded scope:** No ownership transfer in any direction; no integration contract authored (structure only); Communication/Trust/Billing/Operations/Admin author their own side per single-authorship; **emitting the outbox event is the boundary — RFQ authors no consumer's contract.**

---

## §E10 — Event & Dependency Map

- **Purpose:** Structure the event surface (emitted/consumed) and the dependency markers, bound to Doc-2 §8 — RFQ **is** a primary domain-event emitter, so both directions are populated.
- **Expected content scope:**
  - **Emitted events (Doc-2 §8, by pointer):** `RFQCreated`, `RFQSubmitted`, `RFQApproved`, `RFQClosedWon`, `RFQClosedLost` (rfqs); `RFQMatched`, `RFQRouted` (matching/routing; Architecture Patch v1.0.1 PATCH-06); `VendorInvited` — **fires only on transition to `delivered`**, never on `selected`/`deferred` (undelivered invitations must not create leads or visibility — FIXED); `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected` (quotations).
  - **Non-events (Doc-2 §8 — bound as state-machine + audit effects, never coined as events):** **RFQ cancellation** is the `any active state → cancelled` transition (Doc-2 §5.4) and the `cancel` audit action (Doc-2 §9) — there is no `RFQCancelled` domain event. **Quotation revision** is the `submitted → submitted` new-version transition (Doc-2 §5.5) and the `edit (new version)` audit action (Doc-2 §9) — there is no quotation-revision domain event. Both bound in §E4 and §E12; **no event coined** (Doc-4A §16.4).
  - **Consumed events (by pointer):** `VendorClaimed`, `VendorSuspended` (from Marketplace — eligibility/standing changes; `VendorClaimed` also enables the incremental-rematch trigger in an open coverage case, Doc-3 §11.4 + PATCH-D3-03); `VendorTierChanged[tier_type='declared']` (Marketplace) and `[tier_type='verified']` (Trust) → re-rank/matching refresh; `VendorVerified` (Trust → eligibility/scoring refresh); `TrustScoreUpdated` / `PerformanceScoreUpdated` (Trust → re-rank); `VendorBanned` (Admin → reflect standing, fail eligibility — DE-5); `VendorOwnershipTransferred` (Marketplace → matching refresh). Each consumed event is **idempotent** (Doc-2 §8; Doc-4A §16).
  - **Primary-consumer legs RFQ triggers (Doc-2 §8):** `VendorInvited` → Communication dispatch + Operations `vendor_leads`; `QuotationSubmitted` → comparison refresh + performance inputs + usage ledger; `RFQClosedWon` → Operations engagement + Trust performance inputs + transaction intelligence. RFQ **emits**; consumers author their own legs (single-authorship).
  - **Dependency markers:** DE-1…DE-8 (§E0), each routed to its named channel; the open `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` markers carried.
- **Dependencies:** Doc-2 §8 (event ownership map), Architecture Patch v1.0.1 PATCH-06 (RFQMatched/RFQRouted); Doc-4A §16 (event contract standard, idempotency); Doc-4B outbox-write (consumed — DE-8).
- **Excluded scope:** **No event coined** (Doc-2 §8 owns the catalog; Doc-4A §16.4); no consumer logic authored for events owned by other modules; the transactional-outbox mechanism is Doc-4B's (consumed, not redefined). `VendorClaimed` is **consumed**, never emitted by RFQ (it is Marketplace's — DE-2).

---

## §E11 — Authorization Surface

- **Purpose:** Structure the authorization model for RFQ contracts, bound to Doc-4A §6/§6B and the Doc-2 §7 slug catalog — slugs only, never coined here.
- **Expected content scope:**
  - **Buyer-side permissions (Doc-2 §7, by pointer):** `can_create_rfq`, `can_approve_rfq`, **`can_view_rfq` (own-RFQ scope; all active members) and `can_view_all_rfqs` (all-org-RFQ scope; O,D,M) — two distinct slugs per Doc-2 §7, listed separately, never merged**, `can_cancel_rfq`, `can_approve_vendor_selection`, `can_award_rfq` (tenant space, buyer controlling org).
  - **Vendor-side permissions (Doc-2 §7):** `can_submit_quote`, `can_respond_to_rfq` (accept/formal decline), `can_withdraw_quote` (vendor side; also via **delegation grant** — DE-1).
  - **Platform-staff slug (separate space):** `staff_can_moderate_rfq` (moderation gate + reject edge — Admin-owned actor, DE-5).
  - **Authorization model:** the three-layer check (active Membership + Permission Slug + Resource Scope) **OR** an active **delegation grant** (§6B) for representative vendor action — resolved via Identity's `check_permission` (consumed; no shadow authorization, Doc-4A §6.2); buyer-org scope for buyer contracts, controlling-org scope for vendor contracts, system/platform actor for moderation and system-expiry transitions; ORG-configured approval thresholds (award/financial) noted by pointer (Doc-3 §9.4; Doc-2 §7 ORG settings).
- **Dependencies:** Doc-2 §7 (slugs, incl. `staff_can_moderate_rfq`); Doc-4A §6, §6B, §6.2, §6.4; Doc-4C §C3/§C8 (`check_permission`, context — consumed), §C9 (delegation grants — consumed); Architecture §13.3 (role bundles, seeded by Identity).
- **Excluded scope:** **No permission slug invented** (Doc-2 §7 owns the catalog; Doc-4A §6.4); no role bundle authored (Identity-owned); no parallel/shadow authorization resolution (consume `check_permission`); the moderation actor is Admin's (DE-5).

---

## §E12 — Audit Surface

- **Purpose:** Structure the audit bindings for RFQ mutations, bound to Doc-2 §9 via the Doc-4B audit-write mechanism — no audit action coined.
- **Expected content scope:**
  - **Auditable actions (Doc-2 §9, by pointer):** **RFQ** domain — create, edit (new version), submit, internal approve/reject, moderation pass/fail, cancel, expire (system actor), shortlist, close won/lost; routing run (mode, filter reference); invitation transitions `InvitationDelivered` / `InvitationAccepted` / `InvitationDeclined` / `InvitationExpired`. **Quotation** domain — create, edit (new version), submit, withdraw, select, reject.
  - **Audit bindings:** `Audit-Required` per mutation; domain + action pointer; actor attribution (`User`/`Admin`/`System`/`AI Agent`, Doc-2 §9); mutation-scope; correlation — all via Doc-4B `core.append_audit_record.v1` (consumed, never re-implemented).
  - **Escalation points (`[ESC-RFQ-AUDIT]`):** RFQ mutations whose audit action is not separately enumerated in Doc-2 §9 are carried — the **moderation-reject** edge (PATCH-D2-01), the **coverage-exhausted expiry** edge (PATCH-D2-02), **incremental-rematch** routing-log entries (PATCH-D3-03), and **`buyer_directed` invitation** creation (PATCH-D3-02). **Interim:** bind the nearest §9 action by pointer; **no audit action invented**; **channel:** Doc-2 §9 additive.
- **Dependencies:** Doc-2 §9 (audit domains, actor types); Doc-4A §17 (audit declaration); Doc-4B audit-write (consumed — DE-8); Architecture §14 (audit & compliance, immutability).
- **Excluded scope:** **No audit action coined** (Doc-2 §9 owns them); reads not audited (Doc-4A §17.1); audit mechanism is Doc-4B's (consumed); the audit record is append-only/immutable (only compliance redaction mutates it — Doc-4B-owned).

---

## §E13 — AI-Agent Implementation Considerations

- **Purpose:** Structure the cross-cutting constraints that keep AI-assisted implementation of Module 3 unambiguous and ownership-safe — the moat's executable guardrails.
- **Expected content scope:**
  - **Implementation constraints:** consume frozen Doc-4B/Doc-4C services and the Doc-4D read-model by pointer; never re-derive authorization, org/membership, delegation, audit, or vendor attributes; honor the §5.4/§5.5 machines (incl. the patched edges) verbatim; bind every operational rule to Doc-3 by pointer (never re-invent gates, pipeline order, fairness, capacity, distribution, scoring, quotation, evaluation).
  - **Ownership protections (the moat):** Marketplace owns vendor discovery/profiles/attributes — RFQ reads, never re-models (DE-2); RFQ owns matching/routing/ranking/selection/comparison/decision-support — no shadow re-implementation elsewhere; Trust signals are read-only inputs, never mutated (DE-3, firewall); buyer CRM/blacklist read under non-disclosure (DE-4); moderation/ban decisions are Admin's, reflected (DE-5); notification fan-out is Communication's, never authored (DE-6); entitlement/quota is Billing's, read-only, and **payment never influences gates/scores/confidence/fairness** (DE-7, firewall).
  - **Ambiguity prevention:** the non-disclosure invariant (blacklist exclusion + deferral indistinguishable from non-match; no protected-fact exposure in any surface/count/log — Doc-2 §10.11; Doc-4A §7.5); soft-delete/retire exclusion; no auto-winner pre-award (decision-support boundary); three-instrument quota identity (no cross-consumption); **no event/slug/audit-action/POLICY-key invention** — escalate via the DE / `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` channels. Audience: Claude Code, Cursor, backend, frontend, QA, **AI Coding Agents**.
- **Dependencies:** Doc-4A §0.6 (flag-and-halt), §4.1 (one owner), §4B (firewall), §7.5 (non-disclosure); Doc-4B/Doc-4C/Doc-4D (consumed); Doc-3 §12.1 (FIXED catalog); Project Instructions (AI development rules, procurement philosophy).
- **Excluded scope:** No implementation code; no architectural assumption permitted (all bindings by pointer); no resolution of DE / ESC markers; no operating-number hardcoding (POLICY by key).

---

## §E14 — Appendices

- **Purpose:** Inventory the appendices the content passes will build (pointer-level), so the structure is complete and reviewable.
- **Expected content scope (appendix inventory only):**
  - **Appendix A — Module 3 Contract Inventory (skeleton).** One row per planned contract: capability, working contract name (`rfq.<operation>.v1`), owned entity/aggregate, bounded context (BC-1…BC-7), frozen template (Doc-4A §21: 21.1 Endpoint / 21.2 Integration / 21.3 Query / 21.4 Command / 21.5 System / 21.6 Admin), actor type, authoritative source pointer (Doc-2 §/Doc-3 §). Skeleton only; **no contract instantiated.**
  - **Appendix B — Doc-4A + Doc-4B + Doc-4C + Doc-4D Conformance Binding Map.** Each Doc-4E section → governing Doc-4A standard(s) + consumed Doc-4B/Doc-4C services + consumed Doc-4D read-model, by pointer; affirms Doc-4E redefines none.
  - **Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers.** DE-1…DE-8 and the named `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` markers (+ any further `[ESC-RFQ-*]` raised at content authoring), with named resolution channels; carried, never silently resolved (§0.6).
  - **Appendix D — Cross-Reference Index.** Pointer table from every Doc-4E binding point to its authoritative source (Architecture §, ADR, Doc-2 §, Doc-3 §, Doc-4A §, Doc-4B/Doc-4C/Doc-4D service), with canonical versions and patch IDs (Doc-4A §3 citation rule).
  - **Appendix E — Doc-3 Operational-Rule Binding Index.** Pointer table from each procurement behavior (lifecycle/eligibility/pipeline/fairness/capacity/distribution/confidence/quotation/evaluation/abuse/economics) to its Doc-3 §, so content-pass authors bind rules by pointer and never re-derive. (Structure-specific to the moat; not present in Doc-4D, justified by Doc-3's centrality to Module 3.)
- **Dependencies:** Doc-4A §21, Appendix A/B; Doc-2/Doc-3/Doc-4B/Doc-4C/Doc-4D (pointers).
- **Excluded scope:** No appendix content authored in the structure; appendices are populated by the content passes.

---

*End of Doc-4E — RFQ Procurement Engine — Canonical Structure v1.0 (FROZEN). Content-pass authoring proceeds against this structure; DE-1…DE-8 and `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` are carried as documented freeze-gate dependencies, resolved through their named channels and never silently. Structure only — no contract, endpoint, payload, permission, event, validation, or business rule instantiated. Any structural change requires a patch under Doc-4_Governance_Note_v1.0. Frozen per `Doc-4E_Structure_Freeze_Gate_v1.0.md`; supersedes `Doc-4E_Structure_Proposal_v0.1.md` with `Doc-4E_Structure_Patch_v0.1.1.md` applied. Conforms to Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A/4B/4C/4D v1.0 (all FROZEN).*

