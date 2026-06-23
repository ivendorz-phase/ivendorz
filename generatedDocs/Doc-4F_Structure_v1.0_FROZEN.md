# Doc-4F — Business Operations Engine — API & Integration Contracts — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN — canonical Table of Contents for Doc-4F.** Consolidates `Doc-4F_Structure_v1.0.md` as amended by `Doc-4F_Structure_Patch_v1.0.md`; certified by `Doc-4F_Structure_Freeze_Audit_v1.0.md`. Authorized next stage: **Doc-4F_PassA_v1.0**. |
| Module | Module 4 — Business Operations Engine (`operations` schema) — the **post-procurement business-execution layer** |
| Supersedes | `Doc-4F_Structure_v1.0.md` with `Doc-4F_Structure_Patch_v1.0.md` applied (F4F-M1/M2 closed; F4F-N1 applied); review/patch/audit commentary removed. |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (`…v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`), Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0 — all FROZEN |
| Family-map basis | Doc-4A §1.3: **Doc-4F = Business Operations Engine (Module 4)**; Appendix B namespace `ops_` (operations) |
| Contains | Structure only — section, bounded-context purpose/ownership/aggregates/services/dependencies, maps. **No contracts, commands, queries, payloads, API definitions, validation matrices, state machines, audit actions, or events beyond the structure-level production/consumption maps.** |
| Audience | Doc-4F content-pass authors; Claude Code / Cursor / backend / frontend / QA / AI coding agents |

**Family-map confirmation (recorded).** **Doc-4F = Business Operations Engine (Module 4, `operations` schema)** — confirmed against Doc-4A §1.3, Doc-4A Appendix B (`ops_` → Doc-4F), Doc-2 §0.3 (`operations` = Module 4), and Context Pack v3 §3 (Module 4, `operations`). No family-map conflict; no flag-and-halt.

**Three governing rules shape this document** (inherited from Doc-4A §0.3; Doc-4D/Doc-4E precedent):

1. **Reference, never restate (Doc-4A §0.3).** Entity definitions (Doc-2 §3.5), state machines (Doc-2 §5.9 + §3.5 lifecycles), permission slugs (Doc-2 §7), events (Doc-2 §8), audit actions (Doc-2 §9), and POLICY keys (Doc-3 §12.2) have owners; Doc-4F binds to them by pointer and copies none. This is a **structure** document — it names the section homes for those bindings; the content passes instantiate them.
2. **Consume frozen lower layers; redefine nothing.** Doc-4F consumes Doc-4A standards and the frozen services of **Doc-4B Platform Core** (audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags), **Doc-4C Identity** (org/membership resolution, `check_permission`, delegation grants), **Doc-4D Marketplace** (public vendor profile by service), and **Doc-4E RFQ** (consumes RFQ award + invitation events) — all by pointer.
3. **Structure only.** This document maps sections and bounded contexts; it instantiates no contract, command, query, payload, validation, state machine, or audit action. Those are the content passes' work, authored against this structure once frozen.

**Ownership boundary (the post-award seam).** Module 4 owns **only post-procurement business execution**. It owns **none** of: RFQs, quotations, matching, routing, ranking, supplier selection, or award decisions (those are **RFQ / Doc-4E, FROZEN**); vendor discovery, profiles, or attributes (those are **Marketplace / Doc-4D, FROZEN**); trust/performance/verification scores (those are **Trust / Doc-4G**); organizations/memberships/delegation (those are **Identity / Doc-4C, FROZEN**). Operations **begins after** the RFQ `closed_won` award: it consumes the award/invitation events and runs the engagement, the buyer-side private CRM, and the vendor-side lead pipeline.

---

## §F1 — Module Overview

- **Purpose:** Establish Doc-4F as the contract document for **Module 4 — Business Operations Engine only**, the layer that executes the business relationship **after** procurement decisions are made by RFQ. State the schema (`operations`), the namespace (`ops_`), the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-4F), and the post-award ownership seam.
- **Expected content scope:** Module identity (post-procurement business-execution layer of iVendorz); the `operations` schema and `ops_` namespace; the position in the module map (consumes RFQ award outputs, supplies performance inputs to Trust); the structure-only nature of this document; the conformed frozen corpus versions.
- **Owned aggregates (Doc-2 §2, Module 4):** Private Vendor Record, Buyer–Supplier Relationship, Procurement Engagement (post-award), Finance Record, Document Template, Generated Document, Vendor Lead.
- **Dependencies:** Doc-4A §0/§1.3/Appendix B; Doc-2 §0.3, §2 (Module 4); Architecture §16 (module map), ADR-002 (post-award container), Architecture Patch v1.0.1 (PATCH-02 private-vendor claim-lifecycle scope).
- **Excluded scope:** No RFQ/quotation/matching/award ownership; no vendor-data ownership; no trust-score ownership; no module other than Module 4.

---

## §F2 — Business Objectives

- **Purpose:** State, once, the business purpose and strategic role of Module 4 within the platform positioning.
- **Expected content scope:** The post-procurement objectives the module serves — **buyer-vendor engagement** (the post-award delivery container), **lead management** (vendor-side CRM pipeline), **opportunity tracking** (vendor lead → quoted → won/lost), **engagement lifecycle** (open → in_delivery → completed → closed), **commercial follow-up** (LOI/PO/challan/invoice/payment-record/WCC document chain), **conversion visibility** (lead/engagement outcome reporting), and **procurement outcome tracking** (engagement results feeding Trust performance inputs). Strategic role within the **40% B2B Marketplace · 30% Procurement · 20% ERP-Lite · 10% Vendor Network** positioning — Module 4 is the **20% ERP-Lite** execution layer plus the buyer/vendor private CRM. Maturity staging (Stage A→C) as it affects operational support.
- **Dependencies:** Architecture (platform identity, ERP-Lite layer); Doc-3 §0 (operating context); Doc-2 §2 (Module 4 aggregates); ADR-002.
- **Excluded scope:** No procurement decision logic (RFQ / Doc-4E); no re-derivation of architecture; no operating-number hardcoding (POLICY by key).

---

## §F3 — Bounded Context Landscape

- **Purpose:** Enumerate the bounded contexts **within** Module 4, each mapped to one or more owned aggregates; every planned contract lands in exactly one context (no aggregate in two contexts).
- **Expected content scope:** The candidate contexts (to be confirmed at content authoring), derived from the Doc-2 §2 Module-4 aggregates:
  - **BC-OPS-1 — Buyer Private CRM** (Private Vendor Record + Buyer–Supplier Relationship aggregates): buyer's private vendor records/notes/ratings; the Buyer–Supplier relationship container, Buyer-Vendor Status (Approved/Conditional/Blacklisted), and CRM favorites — all tenant-owned, **never disclosed**.
  - **BC-OPS-2 — Engagement & Commercial Documents** (Procurement Engagement aggregate): the post-award engagement container and its LOI/PO/challan/trade-invoice/payment-record/WCC document chain — shared between the parties.
  - **BC-OPS-3 — Vendor Lead Pipeline** (Vendor Lead aggregate): the vendor-side CRM pipeline entry per received RFQ and its activity log — tenant-owned (vendor's controlling org).
  - **BC-OPS-4 — Document Generation & Templates** (Document Template + Generated Document aggregates): the branded template formats and the template-engine outputs (storage refs). **BC-OPS-4 owns two aggregates: Document Template and Generated Document** (each remains in exactly one context).
  - **BC-OPS-5 — Finance Records** (Finance Record aggregate): structured TAX/AIT/payment/expense text records — tenant-owned. *(Distinct from Billing/platform invoices — Doc-4I — and from inter-party trade invoices in BC-OPS-2.)*
- **Dependencies:** Doc-2 §2 (Module 4 aggregates), §3.5 (entities); Doc-4D §D3 / Doc-4E §E3 (within-module context precedent).
- **Excluded scope:** No cross-module context ownership; no aggregate split across contexts; the procurement-decision context is RFQ's (Doc-4E), the vendor-data context is Marketplace's (Doc-4D).

---

## §F4 — Context Responsibilities

- **Purpose:** For each BC-OPS context, fix its responsibilities, internal ownership boundary, and the lifecycles it drives (by pointer to Doc-2 §3.5/§5.9) — so content passes place each contract unambiguously.
- **Expected content scope (per context — purpose · ownership · aggregate list · service list · dependencies):**
  - **BC-OPS-1 Buyer Private CRM** — *purpose:* manage the buyer's private vendor relationships and Buyer-Vendor Status; *ownership:* `private_vendor_records` (+`private_vendor_notes`,`private_vendor_ratings`), `buyer_supplier_relationships` (+`buyer_vendor_statuses`,`vendor_favorites`); *services:* CRM-record management, status set/clear, private↔public link (link-not-merge, ADR-003), the **CRM status read-service** RFQ consumes (DD/DE seam — served to RFQ routing only, non-disclosure); *dependencies:* Identity (org context — DE), Marketplace (public profile reference for linking — DE), Admin (`link_suggestions` candidates — DE).
  - **BC-OPS-2 Engagement & Commercial Documents** — *purpose:* run the post-award engagement and its document chain; *ownership:* `engagements` (+`lois`,`purchase_orders`,`challans`,`trade_invoices`,`payment_records`,`work_completion_certificates`); *services:* engagement lifecycle, document issue/revision, payment-record tracking (records only, no funds custody), performance-input emission; *dependencies:* RFQ (consumes `RFQClosedWon` to create the engagement — DE), Trust (engagement events feed performance inputs — DE), Platform Core (human-reference, audit, outbox — DE).
  - **BC-OPS-3 Vendor Lead Pipeline** — *purpose:* the vendor-side CRM pipeline per received RFQ; *ownership:* `vendor_leads` (+`lead_activities`); *services:* lead lifecycle (received→quoted→negotiation→won/lost→follow_up), activity logging; *dependencies:* RFQ (consumes `VendorInvited` to create the lead — DE), Identity (controlling-org context — DE).
  - **BC-OPS-4 Document Generation & Templates** — *purpose:* branded template management + generated-document output; *ownership:* `document_templates` (+`template_versions`), `generated_documents`; *services:* template lifecycle (Doc-2 §5.9), template-engine generation, counterparty grant-sharing of generated documents; *dependencies:* Platform Core (storage ref, human-reference, audit — DE); source entities (engagement docs in BC-OPS-2) by reference.
  - **BC-OPS-5 Finance Records** — *purpose:* structured finance text records; *ownership:* `finance_records`; *services:* record management (TAX/AIT/payment/expense); *dependencies:* Identity (org context — DE). No funds movement.
- **Dependencies:** Doc-2 §3.5 (entity lifecycles), §5.9 (Document Template machine); ADR-002/003; Architecture (ERP-Lite, CRM).
- **Excluded scope:** No procurement evaluation/award (RFQ / Doc-4E); no platform invoicing (Billing / Doc-4I); no trust-score computation (Trust / Doc-4G).

---

## §F5 — Aggregate Inventory

- **Purpose:** Enumerate the seven Module-4 aggregates (Doc-2 §2), each assigned to exactly one bounded context — the machine-readable ownership ledger for content passes.
- **Expected content scope (aggregate → root → children/value-objects → owning BC-OPS, by pointer to Doc-2 §2/§3.5):**
  - **Private Vendor Record** — root `private_vendor_records`; children `private_vendor_notes`, `private_vendor_ratings`; VO LinkedProfileRef → **BC-OPS-1**.
  - **Buyer–Supplier Relationship** — root `buyer_supplier_relationships`; children `buyer_vendor_statuses`, `vendor_favorites`; VO CaveatNote → **BC-OPS-1**.
  - **Procurement Engagement** — root `engagements`; children `lois`, `purchase_orders`, `challans`, `trade_invoices`, `payment_records`, `work_completion_certificates`; VO PaymentTerms/DeliveryTerms → **BC-OPS-2**.
  - **Vendor Lead** — root `vendor_leads`; child `lead_activities`; VO PipelineStage → **BC-OPS-3**.
  - **Document Template** — root `document_templates`; child `template_versions`; VO TemplateFormat → **BC-OPS-4**.
  - **Generated Document** — root `generated_documents`; VO StorageRef → **BC-OPS-4**.
  - **Finance Record** — root `finance_records`; VO TaxEntry/AITEntry → **BC-OPS-5**.
- **Dependencies:** Doc-2 §2 (Module 4 aggregate design), §3.5 (entity catalog), §10.5 (`operations` blueprint); ADR-002 (engagement naming).
- **Excluded scope:** **No aggregate belongs to more than one context**; no aggregate added beyond the Doc-2 §2 Module-4 set; no aggregate from another module.

---

## §F6 — Domain Service Inventory

- **Purpose:** Name the structure-level domain services per context (the service *surfaces*, not contracts) — so content passes know where each capability lands without inventing service names.
- **Expected content scope (service surface → owning BC-OPS; capability-level only, no contract IDs):** Buyer-CRM management + **CRM status read-service** (BC-OPS-1, the surface RFQ consumes under non-disclosure); private↔public link service (BC-OPS-1, link-not-merge); engagement-lifecycle + commercial-document service + payment-record service + performance-input emission (BC-OPS-2); vendor-lead pipeline + activity service (BC-OPS-3); template-management + document-generation + counterparty-grant service (BC-OPS-4); finance-record service (BC-OPS-5). Each service consumes the frozen Doc-4B (audit/outbox/human-ref/POLICY) and Doc-4C (`check_permission`) services by pointer.
- **Dependencies:** Doc-2 §3.5 (capabilities implied by entities); Doc-4B/Doc-4C (consumed services); Architecture §16.
- **Excluded scope:** No command/query/contract instantiated (content-pass work); no service that performs RFQ/matching/award or vendor-data mutation; no shadow authorization/audit path.

---

## §F7 — Dependency Map

- **Purpose:** State every cross-module dependency explicitly, with direction and consumption pattern (per Doc-4A §4 single-authorship, §4.4 integration) — the structure-level seam list the content passes bind to.
- **Expected content scope (carried dependency markers, `DF-*`, identified structurally — carried, not resolved here; analogous to Doc-4D `DD-*` / Doc-4E `DE-*`):**
  - **DF-1 — Identity boundary.** `organizations`/`memberships`/`delegation_grants`/`check_permission` are Identity's (Doc-4C, FROZEN). Operations consumes org/membership/active-org-context resolution, `check_permission`, and delegation grants (representative action) by pointer; authors none. **Channel:** consume Doc-4C.
  - **DF-2 — Marketplace boundary.** `vendor_profiles` and vendor attributes are Marketplace's (Doc-4D, FROZEN). Operations references the **public vendor profile by UUID** (for private↔public linking — link-not-merge) via the Marketplace service; it never owns or mutates vendor data. **Channel:** read public profile by service; no vendor-data ownership.
  - **DF-3 — RFQ boundary (the post-award seam).** `rfqs`/`quotations`/matching/award are RFQ's (Doc-4E, FROZEN). Operations **consumes** the RFQ award and invitation **events** — `RFQClosedWon` (→ create the engagement) and `VendorInvited` (→ create the vendor lead) — and references `rfq_id`/`vendor_profile_id`/`invitation_id` by UUID; it owns no RFQ/quotation entity and makes no procurement decision. **Channel:** consume RFQ events (single-authorship — RFQ emits, Operations consumes its own effects).
  - **DF-4 — Trust boundary.** `trust_scores`/`performance_scores`/`verification_records` are Trust's (Doc-4G). Operations **emits** engagement/document/dispute/feedback events that Trust consumes as **performance inputs** (Delivery Performance, Buyer Feedback, Dispute Record); it never computes or stores a trust/performance score. **Channel:** emit events; Trust consumes (single-authorship — Operations emits, Trust authors its own consumer).
  - **DF-5 — Admin boundary.** `link_suggestions` (unconfirmed private↔public match candidates) are Admin's (Doc-4J). Operations consumes link-suggestion candidates and confirms/dismisses the link on its own `private_vendor_records` column set (ADR-003); the suggestion entity is Admin-owned. **Channel:** consume Admin link-suggestions; the confirmed link is an Operations column write.
  - **DF-6 — Billing boundary.** `platform_invoices`/`subscriptions`/`entitlements` are Billing's (Doc-4I). Operations' `trade_invoices` are **inter-party commerce invoices (≠ platform invoices)** and `payment_records` track buyer↔vendor payments (records only, no funds); Operations references no Billing entity. **Channel:** strict separation — `trade_invoices`/`payment_records` are Operations-owned and distinct from Billing.
  - **DF-7 — Communication boundary.** Notification fan-out is Communication's (Doc-4H). Operations **emits** events; Communication owns and authors notification dispatch (single-authorship, Doc-4A §4.4). Operations authors no notification contract. **Channel:** emit event; Communication owns fan-out.
  - **DF-8 — Platform Core boundary.** All `core.*` services (audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags, storage) are Platform Core's (Doc-4B, FROZEN). Operations consumes them by pointer; re-implements none. **Channel:** consume Doc-4B services.
- **Dependencies:** Doc-4A §4/§4.4/§16; Doc-2 §8 (event ownership); Doc-4B/4C/4D/4E (consumed, FROZEN).
- **Excluded scope:** No ownership transfer in any direction; no dependency resolved here (carried as `DF-*`); no integration contract authored (structure only).

---

## §F8 — Ownership Matrix

- **Purpose:** Fix the machine-readable ownership ledger — every Module-4 aggregate/entity to its owning BC-OPS, and every not-owned reference to its owning module — so no hidden, shared, or duplicate ownership survives into Pass-A.
- **Expected content scope:**
  - **Owned (Operations / `operations` schema), by Doc-2 §2/§3.5/§10.5 — one owning BC-OPS each:** `private_vendor_records`(+notes/ratings), `buyer_supplier_relationships`(+`buyer_vendor_statuses`/`vendor_favorites`) → BC-OPS-1; `engagements`(+`lois`/`purchase_orders`/`challans`/`trade_invoices`/`payment_records`/`work_completion_certificates`) → BC-OPS-2; `vendor_leads`(+`lead_activities`) → BC-OPS-3; `document_templates`(+`template_versions`)/`generated_documents` → BC-OPS-4; `finance_records` → BC-OPS-5.
  - **NOT owned (reference by UUID / service / event only):** Identity entities + `check_permission` (Doc-4C — DF-1); `vendor_profiles`/attributes (Doc-4D — DF-2); `rfqs`/`quotations`/matching/award (Doc-4E — DF-3); `trust_scores`/`performance_scores`/`verification_records` (Doc-4G — DF-4); `link_suggestions`/moderation/ban (Doc-4J — DF-5); `platform_invoices`/`subscriptions`/`entitlements` (Doc-4I — DF-6); notification fan-out (Doc-4H — DF-7); all `core.*` (Doc-4B — DF-8).
  - **Tenancy class (Doc-2 §6, by pointer):** BC-OPS-1 records are **tenant-owned, never disclosed**; `buyer_vendor_statuses` served to RFQ routing **only via the CRM service** under the non-disclosure invariant; `engagements`/documents are **shared (parties)**; `vendor_leads`/`finance_records`/templates are tenant-owned; `generated_documents` tenant-owned + counterparty grant.
- **Dependencies:** Doc-2 §2, §3.5, §6, §10.5; ADR-002/003; Architecture Patch v1.0.1 (PATCH-02).
- **Excluded scope:** **No shared ownership, no duplicate ownership, no hidden ownership**; no aggregate in two contexts; every ownership claim justified by a Doc-2 pointer.

---

## §F9 — Context Interaction Map

- **Purpose:** Structure the interactions **within** Module 4 (context-to-context) and the entry/exit points to other modules — so content passes wire contracts to the right context without ambiguity.
- **Expected content scope:**
  - **Internal (within Operations):** BC-OPS-2 (Engagement) references BC-OPS-4 (Document Generation) for LOI/PO/challan/WCC generation (engagement docs use `template_versions`); BC-OPS-1 (Buyer CRM) references BC-OPS-2 outcomes for relationship history; BC-OPS-3 (Vendor Lead) is informed by the same RFQ events that BC-OPS-2 consumes (lead created at `VendorInvited`; engagement at `RFQClosedWon`). Each interaction is by reference/UUID within the schema; no aggregate crosses a context.
  - **Entry points (module boundary in):** `RFQClosedWon` (RFQ → BC-OPS-2 engagement creation), `VendorInvited` (RFQ → BC-OPS-3 lead creation), link-suggestion candidates (Admin → BC-OPS-1).
  - **Exit points (module boundary out):** engagement/document/dispute/feedback events (BC-OPS-2 → Trust performance inputs); event emissions that Communication fans out (DF-7).
- **Dependencies:** Doc-2 §8 (event ownership map); Doc-4A §4.4 (integration); ADR-002 (engagement chain).
- **Excluded scope:** No cross-module ownership; interactions by reference/event only; no contract instantiated.

---

## §F10 — Event Consumption Map

- **Purpose:** Structure the events Module 4 **consumes** (Doc-2 §8, by pointer) — producer, consumer context, ownership direction — at structure level only; consumers are idempotent (Doc-4A §16).
- **Expected content scope (consumed event → producing module → consuming BC-OPS):**
  - **`RFQClosedWon`** (producer: RFQ / Doc-4E) → **BC-OPS-2** creates the `engagements` row (Doc-2 §8 primary consumer: "engagement creation"). Ownership direction: RFQ owns the event; Operations owns the engagement effect.
  - **`VendorInvited`** (producer: **RFQ / Doc-4E owns event production**; fires only at invitation `delivered`) — **two independent consumers (Doc-2 §8)**: (1) **BC-OPS-3 (Operations)** consumes it to create the `vendor_leads` row ("vendor_leads creation (operations)"); (2) **Communication (Doc-4H)** consumes it for notification dispatch (fan-out: in-app/email/SMS/WhatsApp). The two consumption paths are **independent** (neither depends on the other) and **idempotent** (each consumer dedupes on event identity, Doc-4A §16). Ownership direction: RFQ owns the event; Operations owns the `vendor_leads` effect (its own consumer); Communication owns the notification effect (its own consumer, DF-7) — single-authorship preserved, no shared ownership.
  - *(Structure-level note — confirmed at content authoring against Doc-2 §8:)* any further consumed events (e.g., RFQ closure/cancel signals affecting an open lead) bind to existing Doc-2 §8 events only; **no event coined**.
- **Dependencies:** Doc-2 §8 (event catalog + primary consumers); Doc-4A §16 (idempotent consumer); Doc-4B outbox (consumed).
- **Excluded scope:** **No event invented**; no consumer logic for events owned by other modules beyond Operations' own effect; the delivery integration is the emitter's (RFQ, §4.4).

---

## §F11 — Event Production Map

- **Purpose:** Structure the events Module 4 **produces** (Doc-2 §8, by pointer) — emitting context, consumers, ownership direction — written transactionally via Doc-4B outbox-write; no event coined.
- **Expected content scope (emitted event → emitting BC-OPS → consumers, by Doc-2 §8):** the **operations / engagements+documents** row of Doc-2 §8 — **`DeliveryRecorded`**, **`WorkCompletionIssued`**, **`EngagementCompleted`**, **`DisputeRecorded`**, **`BuyerFeedbackRecorded`** — all emitted by **BC-OPS-2** (Engagement & Commercial Documents), **consumed idempotently by Trust** into `performance_inputs` (Delivery Performance, Buyer Feedback, Dispute Record). Ownership direction: Operations owns the events; Trust authors its own consumer (single-authorship, DF-4). No other context emits a domain event at structure level (CRM/lead/template/finance mutations are state + audit; any cross-module notification rides Communication via DF-7).
- **Dependencies:** Doc-2 §8 (operations event row); Doc-4A §16 (event contract standard); Doc-4B outbox-write (consumed).
- **Excluded scope:** **No event coined** (Doc-2 §8 owns the catalog); no consumer logic authored for Trust's side; outbox mechanism is Doc-4B's.

---

## §F12 — Escalation Register

- **Purpose:** Carry the structurally-identified escalation markers (`ESC-OPS-*`) for gaps where the frozen corpus may lack a Module-4 binding — carried, never resolved here; analogous to Doc-4D `[ESC-MKT-AUDIT]` / Doc-4E `[ESC-RFQ-AUDIT]`/`[ESC-RFQ-SLUG]`.
- **Expected content scope (candidate markers, identified at structure time; confirmed/expanded at content authoring — never invented around):**
  - **`[ESC-OPS-AUDIT]`** — **audit coverage for all Operations mutations (including Buyer CRM) is governed by Doc-2 §9.** Structure authoring does **not** determine audit coverage and performs no audit-binding analysis here. **Rule:** any Operations mutation discovered during **Pass-A** that lacks explicit Doc-2 §9 coverage MUST carry **`[ESC-OPS-AUDIT]`** and **halt until resolved** via the Doc-2 §9 additive channel; **no audit action is invented**. (Enumerating candidate audit actions and binding them to §9 is Pass-A work, out of scope at structure level.) **Channel:** Doc-2 §9 additive.
  - **`[ESC-OPS-POLICY]`** — any Operations runtime tunable requiring a POLICY key absent from Doc-3 §12.2 (e.g., engagement/document timing, finance-record constraints). **Interim:** reference an existing key by name; if absent, carry the marker — **never invent the key in Doc-4F**. **Channel:** Doc-3 §12.2 additive.
  - **`[ESC-OPS-SLUG]`** — Operations uses the Doc-2 §7 slugs (`can_manage_private_vendors`, `can_manage_vendor_status`, `can_manage_engagements`, `can_create_documents`, `can_approve_po`, `can_record_payments`, `can_approve_payment`, `can_manage_finance_records`, `can_manage_templates`, `can_manage_leads`); if a content pass finds a required action lacks a §7 slug, carry the marker — **no slug invented**. **Channel:** Doc-2 §7 additive.
- **Dependencies:** Doc-2 §7/§9 (slug/audit catalogs); Doc-3 §12.2 (POLICY); Doc-4A §6.4/§16.4/§17 (no-invention rules); Doc-4D/Doc-4E escalation-marker precedent.
- **Excluded scope:** No marker resolved here (carried only); no entity/slug/event/audit-action/POLICY-key invented; markers route to their owning-document channels.

---

## §F13 — Cross-Module Boundaries

- **Purpose:** State, per counterpart module, the boundary direction and single-authorship side — the structure-level guarantee that no frozen ownership leaks into or out of Operations.
- **Expected content scope (counterpart → direction → boundary rule, binding DF-1…DF-8):** **Identity (Doc-4C, FROZEN) — DF-1:** consume org/membership/`check_permission`/delegation; author none. **Marketplace (Doc-4D, FROZEN) — DF-2:** reference public vendor profile by UUID for linking; own/mutate no vendor data. **RFQ (Doc-4E, FROZEN) — DF-3 (post-award seam):** consume `RFQClosedWon`/`VendorInvited`; own no RFQ/quotation entity; make no procurement decision; reference `rfq_id`/`vendor_profile_id`/`invitation_id` by UUID. **Trust (Doc-4G) — DF-4:** emit engagement/document/dispute/feedback events for Trust to consume as performance inputs; compute no score. **Admin (Doc-4J) — DF-5:** consume `link_suggestions`; the confirmed link is an Operations column write. **Billing (Doc-4I) — DF-6:** `trade_invoices`/`payment_records` are Operations-owned inter-party records, strictly distinct from Billing platform invoices; no funds movement. **Communication (Doc-4H) — DF-7:** emit events; Communication owns fan-out; author no notification contract. **Platform Core (Doc-4B, FROZEN) — DF-8:** consume audit/outbox/UUIDv7+human-ref/POLICY/storage; re-implement none.
- **Dependencies:** Doc-4A §4 (module ownership), §4.4 (single-authorship); Doc-2 §8 (events), §6 (tenancy); Doc-4B/4C/4D/4E (FROZEN).
- **Excluded scope:** No ownership crosses a boundary; no shared ownership; the procurement moat (RFQ owns matching/award; Marketplace owns vendor data) is preserved — Operations executes outcomes, never decisions.

---

## §F14 — AI-Agent Implementation Guidance

- **Purpose:** Structure the cross-cutting constraints that keep AI-assisted implementation of Module 4 unambiguous and ownership-safe — machine-readable boundaries enabling Pass-A authoring without reinterpretation.
- **Expected content scope:** **Implementation constraints** — consume frozen Doc-4B/Doc-4C services and the Doc-4D/Doc-4E read/event surfaces by pointer; never re-derive authorization, org/membership, delegation, audit, vendor attributes, or procurement decisions; honor the Doc-2 §3.5/§5.9 lifecycles verbatim. **Ownership protections** — Operations owns only post-award business execution (the seam); never own RFQ/quotation/matching/routing/ranking/supplier-selection/award (RFQ — DF-3); never own/mutate vendor discovery/profiles/attributes (Marketplace — DF-2); never compute trust/performance scores (Trust — DF-4); `buyer_vendor_statuses` served to RFQ via CRM service under non-disclosure only. **Ambiguity prevention** — every aggregate in exactly one BC-OPS context (§F5/§F8); the non-disclosure invariant on Buyer-CRM/Buyer-Vendor-Status (Doc-4A §7.5; never vendor-facing); `trade_invoices` ≠ Billing platform invoices; `payment_records` track only (no funds); no event/slug/audit-action/POLICY-key invention — escalate via `ESC-OPS-*` (§F12). Audience: Claude Code, Cursor, backend, frontend, QA.
- **Dependencies:** Doc-4A §0.6 (flag-and-halt), §4.1 (one owner), §7.5 (non-disclosure); Doc-4B/4C/4D/4E (consumed); ADR-002/003; Architecture Patch v1.0.1.
- **Excluded scope:** No implementation code; no architectural assumption (all bindings by pointer); no resolution of `DF-*`/`ESC-OPS-*` markers.

---

## §F15 — Structure Summary

- **Purpose:** Close the structure with the section inventory and the freeze-readiness posture (no findings, no commentary — a structure ledger).
- **Expected content scope:** Module 4 — Business Operations Engine (`operations` schema, `ops_` namespace) decomposes into **5 bounded contexts** (BC-OPS-1 Buyer Private CRM · BC-OPS-2 Engagement & Commercial Documents · BC-OPS-3 Vendor Lead Pipeline · BC-OPS-4 Document Generation & Templates · BC-OPS-5 Finance Records) owning **7 aggregates** (Doc-2 §2, Module 4), each aggregate in exactly one context. Cross-module dependencies **DF-1…DF-8** (Identity, Marketplace, RFQ, Trust, Admin, Billing, Communication, Platform Core) are explicit with direction + single-authorship side. Consumed events: `RFQClosedWon`, `VendorInvited` (from RFQ). Produced events: `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` (to Trust). Escalation markers carried: `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]`. The procurement moat and all frozen ownership boundaries are preserved; Operations owns only post-award business execution; nothing invented. **Structure is ready for Independent Hard Review → Structure Patch → Structure FROZEN → Pass-A authoring.**
- **Dependencies:** §F1–§F14; the frozen corpus.
- **Excluded scope:** No contract/command/query/payload/validation/state-machine/audit-action instantiated; no review/commentary/roadmap.

---

*End of Doc-4F — Business Operations Engine — Canonical Structure v1.0 (FROZEN). Consolidates the Structure as amended by Doc-4F_Structure_Patch_v1.0 (F4F-M1/M2 integrated; F4F-N1 applied); certified by Doc-4F_Structure_Freeze_Audit_v1.0. Authorized next stage: Doc-4F_PassA_v1.0. Structure only — no contract, command, query, payload, validation matrix, state machine, or audit action instantiated. Module 4 (`operations` schema) decomposes into 5 bounded contexts owning 7 aggregates (Doc-2 §2), each in exactly one context; cross-module dependencies DF-1…DF-8 explicit; consumed events `RFQClosedWon`/`VendorInvited` (RFQ); produced events `DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded` (Trust); escalation markers `[ESC-OPS-AUDIT]`/`[ESC-OPS-POLICY]`/`[ESC-OPS-SLUG]` carried. Bound by pointer to Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A/4B/4C/4D/4E v1.0 (all FROZEN); the procurement moat and all frozen ownership preserved; nothing invented. Next: Independent Hard Review.*
