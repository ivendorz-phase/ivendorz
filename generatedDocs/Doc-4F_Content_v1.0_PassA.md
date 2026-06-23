# Doc-4F — Business Operations Engine — API & Integration Contracts — Content Pass-A v1.0

| Field | Value |
|---|---|
| Document | Doc-4F — **Content Pass-A v1.0** — contract-structure pass for Module 4 — Business Operations Engine (`operations` schema) — the **post-procurement business-execution (ERP-Lite) layer** |
| Status | **Pass-A draft — contract surface for Independent Hard Review.** Authored against `Doc-4F_Structure_v1.0_FROZEN.md` (sole structure authority; §F1–§F15). Next stage after review/patch: **Doc-4F Pass-B.** |
| Structure authority | `Doc-4F_Structure_v1.0_FROZEN.md` (the sole structure authority — 5 bounded contexts, 7 aggregates) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (`…v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`), Doc-3 v1.0.2 (`…v1.0.1.md` + `Doc-3_Patch_v1.0.2.md` + `Doc-3_Policy_Key_Registration_Patch_v1.0.md`), Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0 — all FROZEN |
| Pass-A depth | Per contract: Purpose · Ownership · Actor Types · Preconditions · High-Level Request Schema · High-Level Response Schema · State-Machine Dependencies · Authorization Dependencies · Audit Dependencies · Event Dependencies · Cross-Module Dependencies · Error Categories · AI-Agent Implementation Notes. **High-level only** — field-level payloads, validation rules, and business logic are Pass-B / development-document scope. |
| Audience | Doc-4F content-pass authors; Claude Code / Cursor / backend / frontend / QA / AI coding agents |

**Pass-A baseline scope.** This document is the proposed contract surface of Module 4 against the frozen structure: it names each contract, binds it to a Doc-4A §21 template, fixes its ownership/actor/authorization/state/audit/event/cross-module pointers, and gives high-level request/response shapes and error categories. It **does not** author field-level payloads, validation order, or business rules (Pass-B), and it **redesigns nothing**. Every binding is by pointer to the frozen corpus; **no entity, state, transition, permission slug, event, audit action, POLICY key, or template is invented.** Carried dependencies **DF-1…DF-8**, `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` are referenced by name only and **never resolved here**.

**Reading note.** Operations executes the business relationship **after** the RFQ award; it owns **no procurement decision**. Lifecycles (engagement, document, trade-invoice, payment-record, buyer-vendor-status, lead, template) are owned by **Doc-2 §3.5/§5.9/§10.5** and bound by pointer; this document encodes them as **contract obligations**, never re-derives them. The post-award seam (Operations owns post-award execution; RFQ owns matching/award; Marketplace owns vendor data; Trust owns scores) is preserved on every contract. On any conflict with a higher/frozen document: **flag-and-halt** (Doc-4A §0.6) — none was encountered in this pass.

---

## §B — Pass-A Cross-Cutting Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3) and avoid duplication, the following apply to **every** contract; per-contract records cite specifics and reference these by pointer.

- **B.1 — Contract-ID & templates (Doc-4A §21).** Contract-ID `ops.<operation>.v1` (prefix = schema `operations`; Appendix B namespace `ops_`). Templates: **21.3 Query** (reads), **21.4 Command** (mutations/state-transitions), **21.5 System** (`Response: none` — inbound event-consumer effects on Operations' own entities: engagement creation on `RFQClosedWon`, lead creation on `VendorInvited`; and the async document-generation job). **Template 21.6 (Admin) is NOT instantiated here** — Module 4 has no platform-staff mutation surface of its own (moderation/ban/category/link-suggestion *decisions* are Admin's, Doc-4J — DF-5); Operations confirms a link as a tenant-actor write on its own row. **Template 21.2 (Integration) is NOT instantiated here** — per Doc-4A §4.4 the event-delivery integration contract is authored by the **emitting** module; Operations authors its own commands (which emit its own events) and its own consumer effects on its own entities (single-authorship). No template invented.
- **B.2 — Actor types (Doc-4A §5; Doc-2 §9 actor set User|Admin|System|AI Agent).** **User** (tenant member in a server-validated active-org context, §5.3 — *buyer* controlling org for BC-OPS-1 CRM, BC-OPS-2 engagement-buyer-side, BC-OPS-4 templates, BC-OPS-5 finance; *vendor* controlling org for BC-OPS-3 leads and the vendor side of an engagement); **System** (inbound event consumers — `RFQClosedWon`/`VendorInvited` — and the document-generation job); **internal-service** (synchronous cross-module reads *consumed by Operations*, e.g., Marketplace public profile for linking, Identity resolution; and the **CRM status read-service** *Operations exposes to RFQ* under non-disclosure — DF-3). **Admin actor is not an Operations mutation actor** (no 21.6 here): the link-suggestion *decision* surface is Admin's (DF-5). No actor category invented.
- **B.3 — Identifiers (Doc-4A §8; Doc-2 §0.1).** UUIDv7 is the only canonical machine ID; `engagements`, `trade_invoices`, the engagement document rows (`lois`/`purchase_orders`/`challans`/`work_completion_certificates`), and `generated_documents` carry `human_ref` (display/lookup; `DOC-…` for documents, `INV-…` for trade invoices — Doc-2 §10.5; allocated via Doc-4B `core.allocate_human_reference.v1`). Cross-module references (`rfq_id`, `vendor_profile_id`, `buyer_organization_id`, `vendor_controlling_org_id`, `invitation_id`, `linked_vendor_profile_id`, `template_version_id`, `source_entity_id`) are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3, §10.5, §10.11).
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B). **Slugs only** (§6.2), from the Doc-2 §7 catalog; **no slug invented**. Operations **consumes** Identity's `check_permission` and org/membership/active-org resolution (Doc-4C §C3/§C8, FROZEN) and the §6B **delegation grant** path where a representative org acts for a vendor profile it does not control (vendor-lead / vendor-side engagement action) — **no shadow authorization** implemented. Buyer-side write scope = the **buyer organization** of the target row (`organization_id` / `buyer_organization_id`); vendor-side write scope = the **controlling organization** of the vendor (`controlling_organization_id` / `vendor_controlling_org_id`). The Doc-2 §7 operations slugs are: `can_manage_private_vendors`, `can_manage_vendor_status`, `can_manage_engagements`, `can_create_documents`, `can_approve_po`, `can_record_payments`, `can_approve_payment`, `can_manage_finance_records`, `can_manage_templates`, `can_manage_leads`. If a content pass finds a required Operations action lacks a §7 slug, it carries **`[ESC-OPS-SLUG]`** (channel: Doc-2 §7 additive; no slug invented).
- **B.5 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Audited mutations bind to the **Doc-2 §9 Engagement, Documents, Buyer CRM, and Financial** domains by pointer (attribution: User/System per actor; mutation-scope = the `operations.*` table; written in-transaction via the Doc-4B mechanism, never re-implemented). **Reads are not audited** (§17.1). A mutation whose audit action is **not separately enumerated in Doc-2 §9** carries **`[ESC-OPS-AUDIT]`** (interim: nearest §9 action by pointer; channel: Doc-2 §9 additive; **no audit action invented**) — candidates identified at structure and confirmed in §F12 / the per-contract records below: `private_vendor_records`/notes/ratings create-edit-archive, `vendor_favorites` set/clear, `vendor_leads` create + stage-change, `lead_activities` append, and `finance_records` create/edit (the §9 Financial domain enumerates trade-invoice + payment-record actions but does not separately name finance-record mutations).
- **B.6 — Events (Doc-2 §8 via Doc-4B outbox-write).** Emitted events are **only** those in the Doc-2 §8 operations catalog — **`DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`** — all emitted by **BC-OPS-2** (Engagement & Commercial Documents) and consumed idempotently by Trust into `performance_inputs`; written transactionally via Doc-4B `core.write_outbox_event.v1` (business write + event insert one transaction); **no event coined** (§16.4). **Consumed events (from RFQ, Doc-2 §8):** **`RFQClosedWon`** (→ BC-OPS-2 creates the `engagements` row) and **`VendorInvited`** (→ BC-OPS-3 creates the `vendor_leads` row; fires **only** at invitation `delivered`; **independently** co-consumed by Communication for notification fan-out — DF-7; each consumer idempotent on event identity, §16). The delivery integration is the emitter's (RFQ, §4.4). **Non-events (Doc-2 §8):** every other Operations mutation — CRM record/status/favorite changes, lead pipeline transitions, template/generated-document lifecycle, finance-record changes, trade-invoice/payment-record status changes — has **no** domain event and is bound as a **state + §9 audit** action only (cross-module notification, where needed, rides Communication via DF-7).
- **B.7 — Governance-signal firewall & non-disclosure (Doc-4A §4B / §7.5; Doc-3 §12.1 FIXED).** Operations **computes and stores no governance signal** (no trust/performance/verification score — those are Trust, DF-4; no matching/eligibility — that is RFQ, DF-3); it **emits** performance *inputs* (delivery/WCC/dispute/feedback events) that Trust consumes, and **never mutates one signal from another, and never lets any paid plan / entitlement / flag gate eligibility, verification, routing fairness, or matching confidence** (§4B). The **non-disclosure invariant** is load-bearing for BC-OPS-1: `buyer_vendor_statuses` (Approved/Conditional/Blacklisted) and private CRM facts are **tenant-owned, never disclosed**, and are served to RFQ routing **only via the CRM status read-service** such that a blacklist/exclusion is indistinguishable from a non-match (Doc-4A §7.5; Doc-2 §6/§10.5/§10.11). Per-contract non-disclosure notes appear on every BC-OPS-1 surface and the CRM read-service.
- **B.8 — AI-agent source rule.** Every contract record states its **ownership / authority / lifecycle / audit / event source** by pointer, so Claude Code / Cursor / backend / frontend / QA implement without architectural assumptions. Global constraints: consume frozen Doc-4B/Doc-4C services and the Doc-4D public-profile read + Doc-4E award/invitation events (never re-derive auth/membership/delegation/audit/vendor-attributes/procurement decisions); honor the Doc-2 §3.5/§5.9/§10.5 lifecycles verbatim; never own RFQ/quotation/matching/award (DF-3), vendor data (DF-2), or trust/performance scores (DF-4); `trade_invoices` ≠ Billing platform invoices and `payment_records` track only (no funds custody, DF-6); never expose a protected fact (§7.5); never coin an entity/event/slug/audit-action/POLICY-key/template (escalate via DF / `[ESC-OPS-AUDIT]` / `[ESC-OPS-POLICY]` / `[ESC-OPS-SLUG]`).

**Per-contract record shape (Pass-A).** Each contract below is recorded as: **Purpose · Ownership · Actor Types · Preconditions · Request (high-level) · Response (high-level) · State-Machine · Authorization · Audit · Events · Cross-Module · Error Categories · AI-Agent Notes.** Where several contracts share a lifecycle, they are grouped; each still carries its own record.

---

## §F1 — Module Overview (Pass-A consolidation)

No contracts. Pass-A affirms the frozen module identity: Module 4 — **Business Operations Engine** owns the `operations` schema (namespace `ops_`) and is the **post-procurement business-execution (ERP-Lite) layer** of iVendorz — it **begins after** the RFQ `closed_won` award (consumes the award/invitation events) and runs the engagement, the buyer-side private CRM, the vendor-side lead pipeline, document generation, and finance records. The precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-4F), the flag-and-halt obligation (§0.6), and the patch-based amendment rule apply. **Owned aggregates (Doc-2 §2, Module 4):** Private Vendor Record, Buyer–Supplier Relationship, Procurement Engagement (post-award), Finance Record, Document Template, Generated Document, Vendor Lead.

---

## §F2 — Business Objectives (Pass-A consolidation)

No contracts. Pass-A affirms the frozen objectives without restating them: Module 4 is the **20% ERP-Lite** execution layer plus the buyer/vendor private CRM within the **40% Marketplace · 30% Procurement · 20% ERP-Lite · 10% Vendor Network** positioning — serving buyer-vendor engagement (the post-award delivery container), lead management (vendor-side CRM pipeline), opportunity tracking, the commercial follow-up document chain (LOI/PO/challan/trade-invoice/payment-record/WCC), conversion visibility, and procurement-outcome tracking that feeds **Trust performance inputs** (Architecture; Doc-3 §0; ADR-002). Maturity staging (Stage A→C) affects operational support and is POLICY-bound; no operating number is hardcoded (any required tunable carries `[ESC-OPS-POLICY]` — §F12). No procurement-decision logic is authored here (RFQ / Doc-4E).

---

## §F3 — Bounded Context Model (Pass-A grouping)

Pass-A groups contracts by the five frozen bounded contexts, placed per the frozen BC→section mapping. Each contract below lands in **exactly one** bounded context (no aggregate in two contexts — §F5/§F8). Cross-cutting surfaces are consolidated in §F10 (Integration), §F11 (Events), §F12 (Authorization & Escalation), §F13 (Audit), §F14 (AI-agent).

| Bounded context | Owned aggregate(s) (Doc-2 §2) | Pass-A contract section |
|---|---|---|
| **BC-OPS-1 — Buyer Private CRM** | Private Vendor Record; Buyer–Supplier Relationship | **§F4** |
| **BC-OPS-2 — Engagement & Commercial Documents** | Procurement Engagement (post-award) | **§F5** |
| **BC-OPS-3 — Vendor Lead Pipeline** | Vendor Lead | **§F6** |
| **BC-OPS-4 — Document Generation & Templates** | Document Template; Generated Document | **§F7** |
| **BC-OPS-5 — Finance Records** | Finance Record | **§F8** |

> Section numbering note: Pass-A reuses the structure's §F-numbers as **content homes** for contract groups (BC-OPS-1 → §F4 … BC-OPS-5 → §F8), then consolidates cross-cutting surfaces in §F9–§F14 and closes with appendices. This mirrors the Doc-4E Pass-A pattern (BC → §E-section + consolidations + appendices). No structure section is redefined; the binding map (Appendix B) records the §F-content ↔ Doc-4A-standard mapping.

> **Recorded reconciliation (no Flag-and-Halt; no structure change).** The five bounded contexts and their owned aggregates are taken **verbatim** from the sole structure authority `Doc-4F_Structure_v1.0_FROZEN.md` §F3/§F4/§F5/§F15. Where an authoring brief refers to **BC-OPS-5 as "Outcome & Performance Tracking,"** that concern is **not a separate bounded context** in the frozen structure: BC-OPS-5 owns the **Finance Record** aggregate, and the **outcome/performance** concern is realized as the **performance-input event surface emitted by BC-OPS-2** (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded` → Trust; Doc-2 §8; §F11). Operations **emits performance inputs; it computes no score** (Trust owns scores — DF-4). This Pass-A therefore authors **BC-OPS-5 = Finance Records** and treats outcome/performance tracking as the §F5/§F11 emission surface — preserving the frozen structure and the post-award seam; **nothing re-scoped, nothing invented.**

---

## §F4 — BC-OPS-1 Buyer Private CRM — Contracts (Private Vendor Record + Buyer–Supplier Relationship aggregates)

> Binds Doc-2 §3.5 (`private_vendor_records`/notes/ratings, `buyer_supplier_relationships`/`buyer_vendor_statuses`/`vendor_favorites`), §5.9 (n/a here), §6/§10.5 (tenancy, **never disclosed**), ADR-003 (link-not-merge), Architecture Patch v1.0.1 PATCH-02 (claim lifecycle does **not** apply; favorites are Operations'). The **non-disclosure invariant** (Doc-4A §7.5; Doc-2 §10.11) is load-bearing for this whole context. Error categories use the Doc-4A §12 closed class set with `ops_`-prefixed codes (Pass-B assigns exact codes).

**Purpose.** Manage the buyer organization's **private** vendor relationships — private vendor records (with notes/ratings), the Buyer–Supplier relationship container, the Buyer-Vendor Status (Approved/Conditional/Blacklisted), CRM favorites, and the confirmed private↔public link — and expose the **CRM status read-service** that RFQ routing consumes under non-disclosure. All data here is tenant-owned and **never vendor-facing**.

**Ownership.** Owner = Operations / `operations` schema. **Aggregates (Doc-2 §2 — each in exactly this one context):** **Private Vendor Record** (root `private_vendor_records`; children `private_vendor_notes`, `private_vendor_ratings`; VO `LinkedProfileRef` = `linked_vendor_profile_id` + `link_status` + `link_confidence`); **Buyer–Supplier Relationship** (root `buyer_supplier_relationships`; children `buyer_vendor_statuses`, `vendor_favorites`; VO `CaveatNote`).

**Aggregate responsibilities.** *Private Vendor Record* — hold the buyer's private vendor entry (name/contact/details), its private notes and ratings, and the confirmed link column-set to a public `vendor_profiles` UUID (link-not-merge, ADR-003); it is **not** a Vendor Profile and never mutates Marketplace data (DF-2). *Buyer–Supplier Relationship* — hold the per-(buyer org, vendor profile) relationship container, the current and historical Buyer-Vendor Status rows, and the CRM favorite flags.

**Aggregate invariants (by pointer; not re-derived).** (1) **Tenancy/non-disclosure (Doc-2 §6/§10.5; §7.5):** every row carries `organization_id` (buyer) and is **never disclosed** in any vendor-facing surface, view, log, or error; a blacklist must be indistinguishable from a non-match. (2) **Status history (Doc-2 §10.5):** `buyer_vendor_statuses` are **append-only history rows**; the *current* status is the row with `effective_to NULL`; "set/clear" appends, never overwrites. (3) **Link-not-merge (ADR-003; PATCH-05):** the confirmed link is a **column set on `private_vendor_records`**, not a merge; linking never moves or exposes private data, and the public profile remains Marketplace-owned. (4) **Claim lifecycle excluded (PATCH-02):** `private_vendor_records` use only `active/archived`; the vendor-profile claim lifecycle does **not** apply. (5) **Relationship uniqueness (Doc-2 §10.5):** at most one `buyer_supplier_relationships` row per (buyer `organization_id`, `vendor_profile_id`).

**Lifecycle definitions (Doc-2 §3.5/§10.5; bound by pointer, never restated):** `private_vendor_records` → `active | archived`; `private_vendor_notes`/`private_vendor_ratings` → simple; `buyer_supplier_relationships` → simple (container); `buyer_vendor_statuses` → `none → approved | conditional | blacklisted → cleared` (history rows); `vendor_favorites` → flag rows.

**Domain services (surfaces; Doc-4F Structure §F6).** Buyer-CRM record management; Buyer-Vendor Status set/clear; private↔public link confirm/dismiss (link-not-merge, consuming Admin `link_suggestions` candidates — DF-5); the **CRM status read-service** RFQ consumes under non-disclosure (DF-3). Each consumes Doc-4B (audit/human-ref/POLICY) and Doc-4C (`check_permission`) by pointer.

#### `ops.create_private_vendor.v1` · `ops.update_private_vendor.v1` · `ops.archive_private_vendor.v1` — Private Vendor Record management · 21.4 Command · Actor: User

- **Purpose:** Create, edit, or archive a buyer-private vendor record (name/contact/details; source manual/email_list/excel) (Doc-2 §3.5/§10.5).
- **Ownership:** owner = Operations / BC-OPS-1; `private_vendor_records` (AR). Buyer org = creator's active org.
- **Actor Types:** User (buyer member, active-org context §5.3).
- **Preconditions:** active membership; `can_manage_private_vendors`; for archive, record in `active`.
- **Request (high-level):** record fields (name/email/phone/details, source) on create/update; `private_vendor_record_id` on update/archive — high-level only; field rules Pass-B.
- **Response (high-level):** `private_vendor_record_id` (UUIDv7), `link_status`, state (`active`/`archived`), `reference_id` (Doc-4A §22.1 C-05).
- **State-Machine:** `active ⇄ archived` (Doc-2 §3.5; claim lifecycle excluded — PATCH-02).
- **Authorization:** §6 three-layer; `can_manage_private_vendors` (Doc-2 §7); scope = buyer active org.
- **Audit:** yes → bind nearest Doc-2 §9; **`[ESC-OPS-AUDIT]`** — §9 enumerates **Buyer CRM** "vendor status set/changed/cleared" but does **not** separately name private-record create/edit/archive (interim: nearest Buyer-CRM action by pointer; channel Doc-2 §9 additive; no action invented).
- **Events:** none — no Doc-2 §8 operations event for CRM record changes (state + audit only — B.6).
- **Cross-Module:** none direct on create/edit; `human_ref` not allocated for private records (Doc-2 §10.5 — no `human_ref` column). Non-disclosure: never vendor-facing.
- **Error Categories:** VALIDATION, AUTHORIZATION, STATE (archive of non-active), SYSTEM.
- **AI-Agent Notes:** a private vendor record is **not** a Marketplace `vendor_profiles` row — never create/mutate vendor data here (DF-2); never expose any private-CRM field to a vendor surface (§7.5). Source values are enumerated by Doc-2 §10.5; do not extend.

#### `ops.add_private_vendor_note.v1` · `ops.set_private_vendor_rating.v1` — Notes & Ratings · 21.4 Command · Actor: User

- **Purpose:** Attach a buyer-private note or rating to a private vendor record (Doc-2 §3.5).
- **Ownership:** owner = Operations / BC-OPS-1; `private_vendor_notes`, `private_vendor_ratings` (children of the Private Vendor Record AR).
- **Actor Types:** User (buyer member).
- **Preconditions:** active membership; `can_manage_private_vendors`; parent record exists and readable in buyer org.
- **Request (high-level):** `private_vendor_record_id`; note text or rating value + comment.
- **Response (high-level):** child id; `reference_id`.
- **State-Machine:** simple (Doc-2 §3.5 — no lifecycle).
- **Authorization:** §6; `can_manage_private_vendors` (Doc-2 §7); buyer-org scope.
- **Audit:** yes → **`[ESC-OPS-AUDIT]`** (nearest Doc-2 §9 Buyer-CRM action by pointer; private notes/ratings not separately enumerated; channel Doc-2 §9 additive; no action invented).
- **Events:** none (state + audit only).
- **Cross-Module:** none. Non-disclosure: buyer-private only, never vendor-facing.
- **Error Categories:** VALIDATION, AUTHORIZATION, NOT_FOUND (parent), SYSTEM.
- **AI-Agent Notes:** notes/ratings are **buyer-private** and distinct from Trust `public_reviews` (DF-4) — never surface them publicly or feed them to any score; they are not performance inputs.

#### `ops.set_buyer_vendor_status.v1` · `ops.clear_buyer_vendor_status.v1` — Buyer-Vendor Status · 21.4 Command · Actor: User

- **Purpose:** Set or clear the Buyer-Vendor Status (Approved/Conditional/Blacklisted, + caveat note) on the buyer–supplier relationship — the buyer's private governance signal (Doc-2 §3.5/§10.5).
- **Ownership:** owner = Operations / BC-OPS-1; `buyer_vendor_statuses` (history child of Buyer–Supplier Relationship); creates the `buyer_supplier_relationships` container if absent.
- **Actor Types:** User (buyer member).
- **Preconditions:** active membership; `can_manage_vendor_status`; target `vendor_profile_id` resolvable (service-validated, DF-2); for set, a status value + optional caveat; for clear, an open current status.
- **Request (high-level):** `vendor_profile_id`; status (`approved`/`conditional`/`blacklisted`) + caveat on set; relationship ref on clear.
- **Response (high-level):** relationship id, current status, `reference_id`.
- **State-Machine:** `none → approved | conditional | blacklisted → cleared` (Doc-2 §3.5); **append-only history** — set appends a new row, clear closes the current row (`effective_to` set); current = `effective_to NULL` (Doc-2 §10.5). Never overwrite.
- **Authorization:** §6; `can_manage_vendor_status` (Doc-2 §7); buyer-org scope.
- **Audit:** yes → Doc-2 §9 **Buyer CRM** "vendor status set/changed/cleared (visible only to buyer org + platform compliance; never vendor-facing)".
- **Events:** none — no Doc-2 §8 operations event for status changes (state + audit only — B.6). **A blacklist/exclusion never emits a vendor-detectable signal** (§7.5).
- **Cross-Module:** target `vendor_profile_id` validated against Marketplace by service (DF-2, read-only). The status is **consumed by RFQ routing only via the CRM status read-service** (`ops.read_crm_status_for_routing.v1`), never pushed.
- **Error Categories:** VALIDATION (bad status), AUTHORIZATION, REFERENCE (vendor profile not found — service-validated), STATE (clear with no open status), SYSTEM.
- **AI-Agent Notes:** **non-disclosure is absolute** — a Blacklisted status must be indistinguishable from non-match wherever RFQ uses it (Doc-2 §10.11; §7.5); the status is **buyer-private**, never a platform-wide signal and never mutated by or mutating any Trust/Marketplace signal (§4B firewall). Status history is evidence — never delete a row.

#### `ops.set_vendor_favorite.v1` · `ops.clear_vendor_favorite.v1` — CRM Favorites · 21.4 Command · Actor: User

- **Purpose:** Flag/unflag a vendor as a CRM favorite on the buyer–supplier relationship (Doc-2 §3.5; Architecture Patch v1.0.1 PATCH-02 — favorites are Operations' `vendor_favorites`, distinct from `marketplace.catalog_favorites`).
- **Ownership:** owner = Operations / BC-OPS-1; `vendor_favorites` (child of Buyer–Supplier Relationship).
- **Actor Types:** User (buyer member).
- **Preconditions:** active membership; `can_manage_private_vendors` (CRM favorites fall under the private-vendor CRM slug, Doc-2 §7); target resolvable.
- **Request (high-level):** `vendor_profile_id` / relationship ref; favorite on/off.
- **Response (high-level):** relationship id, favorite flag, `reference_id`.
- **State-Machine:** flag rows (Doc-2 §10.5 — no lifecycle).
- **Authorization:** §6; `can_manage_private_vendors` (Doc-2 §7); buyer-org scope.
- **Audit:** yes → **`[ESC-OPS-AUDIT]`** (nearest Doc-2 §9 Buyer-CRM action by pointer; favorite set/clear not separately enumerated; channel Doc-2 §9 additive; no action invented).
- **Events:** none (state + audit only).
- **Cross-Module:** target validated against Marketplace by service (DF-2). Non-disclosure: buyer-private.
- **Error Categories:** VALIDATION, AUTHORIZATION, REFERENCE, SYSTEM.
- **AI-Agent Notes:** these are **CRM** favorites (Operations, PATCH-02) — never conflate with `marketplace.catalog_favorites` (public catalog bookmarks, Doc-4D); they are buyer-private and never vendor-facing.

#### `ops.confirm_vendor_link.v1` · `ops.dismiss_vendor_link.v1` — Private↔Public Link (link-not-merge) · 21.4 Command · Actor: User

- **Purpose:** Confirm or dismiss the link between a private vendor record and a public `vendor_profiles` UUID, writing the link column-set on the private record (ADR-003 link-not-merge; Doc-2 ASSUMPTION A-03/§10.5; consumes Admin `link_suggestions` candidates — DF-5).
- **Ownership:** owner = Operations / BC-OPS-1; the **link column-set on `private_vendor_records`** (`linked_vendor_profile_id`, `link_status`, `link_confidence`, `linked_at`, `link_confirmed_by`). The **suggestion entity is Admin-owned** (`admin.link_suggestions` — DF-5); the confirmed link is an Operations column write.
- **Actor Types:** User (buyer member).
- **Preconditions:** active membership; `can_manage_private_vendors`; private record exists; target `vendor_profile_id` resolvable (service-validated, DF-2); a candidate may originate from an Admin `link_suggestions` row (DF-5).
- **Request (high-level):** `private_vendor_record_id`; `vendor_profile_id`; decision (confirm/dismiss); optional `link_suggestion` reference.
- **Response (high-level):** `private_vendor_record_id`, `link_status` (`none`/`suggested`/`linked`), `reference_id`.
- **State-Machine:** `link_status` column transitions `none → suggested → linked` (or dismiss → `none`) on `private_vendor_records` (Doc-2 §10.5); no aggregate-root lifecycle change.
- **Authorization:** §6; `can_manage_private_vendors` (Doc-2 §7); buyer-org scope.
- **Audit:** yes → Doc-2 §9 **Admin** "link confirm/dismiss" (the link-confirm decision is enumerated under §9 Admin; Operations performs the column write in the buyer org and binds the §9 action by pointer). *(If a reviewer reads §9 "link confirm/dismiss" as Admin-actor-only, the Operations-side column write carries `[ESC-OPS-AUDIT]` to the nearest Buyer-CRM/Admin action — no action invented.)*
- **Events:** none — no Doc-2 §8 operations event for linking (state + audit only — B.6).
- **Cross-Module:** consumes Admin `link_suggestions` candidate (DF-5); validates `vendor_profile_id` against Marketplace by service (DF-2). **Linking never moves or exposes private data** (ADR-003).
- **Error Categories:** VALIDATION, AUTHORIZATION, REFERENCE (profile/suggestion not found), STATE (already linked), SYSTEM.
- **AI-Agent Notes:** **link-not-merge** — the confirmed link is a column reference, never a data merge; the public profile stays Marketplace-owned (DF-2) and the private data stays private (§7.5). The *suggestion* is Admin's (DF-5); Operations only writes its own link columns.

#### `ops.read_crm_status_for_routing.v1` — CRM Status Read-Service (RFQ routing, non-disclosure) · 21.3 Query · Actor: internal-service · *(the DF-3 seam)*

- **Purpose:** Serve the buyer's Buyer-Vendor Status (and blacklist floor) to **RFQ routing** as an eligibility/Buyer-Filter input — the **only** channel by which `buyer_vendor_statuses` leave BC-OPS-1 (Doc-2 §10.5 "served to routing only via CRM service"; Doc-4F Structure §F4/§F7 DF-3).
- **Ownership:** owner = Operations / BC-OPS-1; read over `buyer_vendor_statuses` (current rows). **RFQ owns no copy** — it reads per routing run.
- **Actor Types:** internal-service (RFQ matching/routing composition; Doc-4A §5 internal-service). **Never a tenant-vendor surface; never a buyer-facing list surface.**
- **Preconditions:** internal-service context invoked by RFQ for a specific buyer org + candidate vendor set; non-disclosure invariant enforced at the boundary.
- **Request (high-level):** buyer `organization_id` + candidate `vendor_profile_id` set (internal).
- **Response (high-level):** per-vendor current status (approved/conditional/blacklisted/none) for the buyer's universe — consumed by RFQ as Buyer Filter + blacklist floor; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** internal-service to-Operations boundary; not exposed to any tenant actor; the consuming RFQ contract enforces non-disclosure downstream (Doc-2 §10.11.10; §7.5).
- **Audit:** no (read — §17.1).
- **Events:** none.
- **Cross-Module:** **RFQ consumes this read-service** (DF-3); Operations exposes it and owns the data. Firewall: this is a buyer-private status input to eligibility — never a paid signal, never mutated by or mutating a Trust signal (§4B).
- **Error Categories:** AUTHORIZATION (non-internal caller), VALIDATION, SYSTEM.
- **AI-Agent Notes:** this is the **single sanctioned disclosure path** for Buyer-Vendor Status, and only to RFQ routing under non-disclosure — a blacklist surfaces to routing as exclusion, **never** as a vendor-detectable or buyer-list-detectable fact (§7.5; Doc-2 §10.11). Never widen this surface; never expose it to a vendor or to a general buyer read.

#### `ops.get_private_vendor.v1` · `ops.list_private_vendors.v1` · `ops.get_buyer_supplier_relationship.v1` — Buyer CRM Reads · 21.3 Query · Actor: User

- **Purpose:** Read the buyer's own private vendor records / relationships (own-org scope only).
- **Ownership:** owner = Operations / BC-OPS-1; reads over `private_vendor_records`(+notes/ratings), `buyer_supplier_relationships`(+statuses/favorites).
- **Actor Types:** User (buyer member, own org only).
- **Preconditions:** active membership; `can_manage_private_vendors` (the CRM read falls under the private-vendor slug; no separate read slug in Doc-2 §7 — carry `[ESC-OPS-SLUG]` only if a distinct read slug is later required); buyer-org scope.
- **Request (high-level):** `private_vendor_record_id` / relationship ref / filter+pagination (Doc-4A §22.3).
- **Response (high-level):** CRM projection (record, notes/ratings, current status, favorites, link status), list page; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** §6; `can_manage_private_vendors` (Doc-2 §7); scope = buyer active org.
- **Audit:** no (reads not audited — §17.1).
- **Events:** none.
- **Cross-Module:** linked public-profile display columns read from Marketplace by service (DF-2, read-only).
- **Error Categories:** AUTHORIZATION, NOT_FOUND, VALIDATION (bad filter).
- **AI-Agent Notes:** strictly **own-org** CRM data; never cross-tenant; never expose another buyer's CRM. The vendor never sees that they are recorded, rated, statused, or favorited (§7.5).

**Cross-context interaction rules (BC-OPS-1).** *Inbound:* consumes Admin `link_suggestions` candidates (DF-5); validates `vendor_profile_id` against Marketplace (DF-2). *Outbound (within Operations):* BC-OPS-1 references **BC-OPS-2 engagement outcomes** for relationship history (read-by-UUID; no aggregate crosses the boundary). *Outbound (cross-module):* exposes the **CRM status read-service to RFQ** (DF-3) under non-disclosure. No BC-OPS-1 aggregate is ever written by another context; no status is ever pushed to RFQ.

---

## §F5 — BC-OPS-2 Engagement & Commercial Documents — Contracts (Procurement Engagement aggregate)

> Binds Doc-2 §3.5/§10.5 (`engagements` + `lois`/`purchase_orders`/`challans`/`trade_invoices`/`payment_records`/`work_completion_certificates`), §5.4 (consumes the RFQ `closed_won` terminal — Doc-2_Patch_v1.0.3), §8 (the operations event row — performance inputs to Trust), ADR-002 (post-award container naming `engagements`, 1:1 with a Closed-Won award). This context **begins after** the RFQ award (DF-3 post-award seam) and is the **only** Operations context that emits domain events. Error categories use the Doc-4A §12 closed class set with `ops_`-prefixed codes (Pass-B assigns exact codes).

**Purpose.** Run the **post-award engagement** and its commercial-document chain (LOI → PO → challan → trade invoice → payment record → WCC), track delivery and payment-record status (records only, no funds custody), and **emit the performance-input events** Trust consumes — i.e., this context *is* the "outcome & performance tracking" surface, realized as event emission (not score computation). The engagement is **shared between the two parties** (buyer org + vendor side) via party columns + RLS.

**Ownership.** Owner = Operations / `operations` schema. **Aggregate (Doc-2 §2 — in exactly this one context):** **Procurement Engagement (post-award)** — root `engagements`; children `lois`, `purchase_orders`, `challans`, `trade_invoices`, `payment_records`, `work_completion_certificates`; VOs `PaymentTerms`, `DeliveryTerms`.

**Aggregate responsibilities.** Hold the post-award container (one per Closed-Won award between one buyer org and one vendor profile — ADR-002), its lifecycle (open→in_delivery→completed→closed), and the full document chain as **versioned document rows** under the engagement; track `trade_invoices` status and `payment_records` (recorded→confirmed) as **inter-party commercial records** (≠ Billing platform invoices — DF-6); emit delivery/WCC/dispute/feedback/completion events as Trust performance inputs (DF-4).

**Aggregate invariants (by pointer; not re-derived).** (1) **1:1 with award (ADR-002; Doc-2 §4.1):** exactly one engagement per `closed_won` award (`rfq_id` unique); created by consuming `RFQClosedWon` (DF-3), never by a buyer-initiated create. (2) **Shared tenancy (Doc-2 §6/§10.5):** rows carry `buyer_organization_id`, `vendor_profile_id`, `vendor_controlling_org_id`; visibility is the **parties**, enforced by party columns + RLS — no cross-schema traversal. (3) **Versioned documents (Doc-2 §10.5):** `lois`/`purchase_orders`/`challans`/`work_completion_certificates` are immutable **versioned rows** (`version_no`, `is_active_revision`, `revision_reason`); edits create new versions, never overwrite; each carries a `DOC-…` `human_ref`. (4) **Records-only finance (Doc-2 §10.5; DF-6):** `trade_invoices` (`INV-…`) follow `issued → partially_paid → paid / disputed / cancelled` and are **≠ `billing.platform_invoices`**; `payment_records` follow `recorded → confirmed` and hold **no funds** — status tracking only. (5) **Performance inputs only (DF-4; §4B):** engagement/document/dispute/feedback events are **inputs** Trust consumes; Operations computes/stores **no** trust/performance score.

**Lifecycle definitions (Doc-2 §3.5/§10.5; bound by pointer):** `engagements` → `open → in_delivery → completed → closed`; `trade_invoices` → `issued → partially_paid → paid | disputed | cancelled`; `payment_records` → `recorded → confirmed`; `lois`/`purchase_orders`/`challans`/`work_completion_certificates` → versioned documents (no status machine; revision rows).

**Domain services (surfaces; Doc-4F Structure §F6).** Engagement-lifecycle; commercial-document issue/revision; payment-record tracking (records only); **performance-input emission**. Each consumes Doc-4B (audit/outbox/human-ref) and Doc-4C (`check_permission`) by pointer; document *rendering* is BC-OPS-4 (referenced by `template_version_id`).

#### `ops.create_engagement_on_award.v1` — Engagement Creation (RFQ `RFQClosedWon` consumer) · 21.5 System · Actor: System · *(the DF-3 post-award seam)*

- **Purpose:** On the RFQ `RFQClosedWon` event, create the `engagements` row for the awarded (buyer org, vendor profile) pair — the post-award container (Doc-2 §5.4 `closed_won` "triggers engagement creation"; Doc-2 §8 primary consumer "engagement creation"; ADR-002).
- **Ownership:** owner = Operations / BC-OPS-2; `engagements` (AR). **RFQ owns the event; Operations owns the engagement effect** (single-authorship — Operations authors its own consumer).
- **Actor Types:** System (inbound event consumer; idempotent on event identity — §16).
- **Preconditions:** a delivered `RFQClosedWon` event (Doc-2 §8); references `rfq_id`/`buyer_organization_id`/`vendor_profile_id`/`vendor_controlling_org_id` (bare UUIDs, service-validated); no existing engagement for the `rfq_id` (1:1 — ADR-002).
- **Request (high-level):** inbound event reference (internal; `Response: none` per 21.5).
- **Response (high-level):** none (system; writes `engagements` at `open`, allocates `human_ref`).
- **State-Machine:** creates `engagements` at `open` (Doc-2 §3.5 entry).
- **Authorization:** system actor (no org context; §5.5/§5 system-actor — no delegation).
- **Audit:** yes → Doc-2 §9 **Engagement** "open".
- **Events:** none emitted at creation (no Doc-2 §8 operations event for engagement open; the award event was RFQ's). Downstream notification is Communication's (DF-7).
- **Cross-Module:** consumes RFQ `RFQClosedWon` (DF-3); allocates `human_ref` via Doc-4B `core.allocate_human_reference.v1` (DF-8); party UUIDs validated by service (Identity DF-1 / Marketplace DF-2, read-only).
- **Error Categories:** SYSTEM, DEPENDENCY (a consumed service unavailable → retry), CONFLICT (engagement already exists → idempotent no-op).
- **AI-Agent Notes:** the engagement is **created by the event consumer, never by a buyer command** (DF-3 seam) — there is no `create_engagement` user contract; one award = one engagement (ADR-002). Idempotent: a replayed `RFQClosedWon` must not create a duplicate.

#### `ops.update_engagement_status.v1` · `ops.close_engagement.v1` — Engagement Lifecycle · 21.4 Command · Actor: User

- **Purpose:** Advance the engagement (`open → in_delivery → completed → closed`) as the parties progress and close it on completion (Doc-2 §3.5).
- **Ownership:** owner = Operations / BC-OPS-2; `engagements` (AR).
- **Actor Types:** User (buyer org or vendor-side controlling org, per the action and party scope; §5.3; vendor representative via §6B delegation grant where applicable).
- **Preconditions:** active membership; `can_manage_engagements`; engagement in a non-terminal state; transition legal per Doc-2 §3.5.
- **Request (high-level):** `engagement_id`; target status (or close); reason where required.
- **Response (high-level):** new status, `reference_id`.
- **State-Machine:** `open → in_delivery → completed → closed` (Doc-2 §3.5; `closed` terminal — archive).
- **Authorization:** §6/§6B; `can_manage_engagements` (Doc-2 §7); party scope (buyer org or vendor controlling org).
- **Audit:** yes → Doc-2 §9 **Engagement** "status change" / "close".
- **Events:** **`EngagementCompleted`** (Doc-2 §8) emitted on transition to `completed` (Trust performance input) via Doc-4B outbox-write; other transitions are state + audit only (B.6). *(Exact transition→event binding — e.g., whether `completed` or `closed` carries `EngagementCompleted` — is confirmed in Pass-B against Doc-2 §8/§3.5; the event itself is the existing `EngagementCompleted`, none coined.)*
- **Cross-Module:** `EngagementCompleted` consumed by Trust (DF-4); party notification is Communication's (DF-7).
- **Error Categories:** AUTHORIZATION, STATE (illegal transition / terminal), VALIDATION, SYSTEM.
- **AI-Agent Notes:** honor the Doc-2 §3.5 engagement machine verbatim; `closed` never reopens. `EngagementCompleted` is a **performance input** — Operations emits, Trust scores (DF-4); never compute a score here.

#### `ops.record_delivery.v1` — Record Delivery (challan / delivery event) · 21.4 Command · Actor: User

- **Purpose:** Record a delivery against the engagement (challan issuance / delivery confirmation) — a Trust performance input (Doc-2 §8 `DeliveryRecorded`).
- **Ownership:** owner = Operations / BC-OPS-2; `challans` (versioned child) and/or the engagement delivery state.
- **Actor Types:** User (vendor-side or buyer-side party per the document; §5.3).
- **Preconditions:** active membership; `can_create_documents` (challan create falls under engagement-document creation, Doc-2 §7); engagement in `in_delivery` (or per Doc-2 §3.5).
- **Request (high-level):** `engagement_id`; delivery/challan content ref (uses a `template_version_id` from BC-OPS-4); quantities/terms (high-level).
- **Response (high-level):** challan `human_ref` (`DOC-…`), version, `reference_id`.
- **State-Machine:** appends a `challans` version (Doc-2 §10.5 versioned document); may advance engagement to `in_delivery`.
- **Authorization:** §6; `can_create_documents` (Doc-2 §7); party scope.
- **Audit:** yes → Doc-2 §9 **Engagement** "challan issue + revision" (Documents/Engagement domains).
- **Events:** **`DeliveryRecorded`** (Doc-2 §8) via Doc-4B outbox-write (Trust performance input — Delivery Performance).
- **Cross-Module:** `DeliveryRecorded` consumed by Trust (DF-4); document body rendered via BC-OPS-4 `template_versions` (internal reference); `human_ref` via Doc-4B (DF-8).
- **Error Categories:** AUTHORIZATION, STATE, VALIDATION, REFERENCE (template version), SYSTEM.
- **AI-Agent Notes:** `DeliveryRecorded` is a performance input (Trust, DF-4) — never score it here; the challan is a **versioned** document (never overwrite — Doc-2 §10.5).

#### `ops.issue_engagement_document.v1` · `ops.revise_engagement_document.v1` — LOI / PO / WCC Issue & Revision · 21.4 Command · Actor: User

- **Purpose:** Issue or revise an engagement commercial document — LOI, Purchase Order, or Work Completion Certificate (Doc-2 §3.5/§10.5 versioned documents; WCC additionally a performance input).
- **Ownership:** owner = Operations / BC-OPS-2; `lois` / `purchase_orders` / `work_completion_certificates` (versioned children).
- **Actor Types:** User (buyer-side for LOI/PO issuance and approval; party-appropriate for WCC; §5.3).
- **Preconditions:** active membership; `can_create_documents` for create/revise; **`can_approve_po`** additionally for PO/financial approval (Doc-2 §7); engagement non-terminal; references an active `template_version_id` (BC-OPS-4).
- **Request (high-level):** `engagement_id`; document kind (loi/po/wcc); content ref + `template_version_id`; `revision_reason` on revise.
- **Response (high-level):** document `human_ref` (`DOC-…`), `version_no`, `reference_id`.
- **State-Machine:** appends a versioned row (`version_no`, `is_active_revision`; Doc-2 §10.5); no status machine on these documents.
- **Authorization:** §6; `can_create_documents` (Doc-2 §7); **PO/financial approval `can_approve_po`** (Doc-2 §7); party scope.
- **Audit:** yes → Doc-2 §9 **Engagement** "LOI/PO/…/WCC issue + revision".
- **Events:** **`WorkCompletionIssued`** (Doc-2 §8) on WCC issuance (Trust performance input); LOI/PO issuance/revision emit **no** event (state + audit only — B.6).
- **Cross-Module:** `WorkCompletionIssued` consumed by Trust (DF-4); document body via BC-OPS-4 `template_versions`; `human_ref` via Doc-4B (DF-8).
- **Error Categories:** AUTHORIZATION (missing `can_approve_po` for PO approval), STATE, VALIDATION, REFERENCE (template), SYSTEM.
- **AI-Agent Notes:** PO/financial approval requires `can_approve_po` in addition to `can_create_documents` (Doc-2 §7) — do not collapse the two slugs. WCC issuance is a **performance input** (Trust, DF-4). All three are **versioned** documents — never overwrite a prior version.

#### `ops.issue_trade_invoice.v1` · `ops.update_trade_invoice_status.v1` — Trade Invoice (inter-party; ≠ Billing) · 21.4 Command · Actor: User

- **Purpose:** Issue an inter-party trade (commerce) invoice against the engagement and track its status (Doc-2 §3.5/§10.5). **These are inter-party records, strictly distinct from Billing `platform_invoices` (DF-6); no funds move.**
- **Ownership:** owner = Operations / BC-OPS-2; `trade_invoices` (child; `INV-…` `human_ref`).
- **Actor Types:** User (issuing party per the engagement; §5.3).
- **Preconditions:** active membership; `can_record_payments` (trade invoices / payment records, Doc-2 §7); engagement non-terminal; status transition legal.
- **Request (high-level):** `engagement_id`; amount + currency + due date on issue; `trade_invoice_id` + target status on update.
- **Response (high-level):** invoice `human_ref` (`INV-…`), status, `reference_id`.
- **State-Machine:** `issued → partially_paid → paid | disputed | cancelled` (Doc-2 §10.5).
- **Authorization:** §6; `can_record_payments` (Doc-2 §7); party scope.
- **Audit:** yes → Doc-2 §9 **Financial** "trade invoice issue/status change".
- **Events:** **`DisputeRecorded`** (Doc-2 §8) where a trade invoice transitions to `disputed` and a dispute is recorded against the engagement (Trust performance input — Dispute Record); other status changes are state + audit only (B.6). *(Whether `disputed` is the sole `DisputeRecorded` trigger or disputes are recorded via a distinct engagement action is confirmed in Pass-B against Doc-2 §8; the event is the existing `DisputeRecorded`, none coined.)*
- **Cross-Module:** strictly **separate from Billing** (`platform_invoices`/`subscriptions`/`entitlements` are Billing's — DF-6); `DisputeRecorded` consumed by Trust (DF-4); `human_ref` via Doc-4B (DF-8).
- **Error Categories:** AUTHORIZATION, STATE (illegal status transition), VALIDATION, SYSTEM.
- **AI-Agent Notes:** `trade_invoices` are **never** `billing.platform_invoices` (DF-6) — different owner, different schema, no funds custody; a trade invoice records a buyer↔vendor commercial obligation only. Disputes feed Trust (DF-4), never a local score.

#### `ops.record_payment.v1` · `ops.confirm_payment.v1` — Payment Records (records only, no funds) · 21.4 Command · Actor: User

- **Purpose:** Record and confirm a buyer↔vendor payment against a trade invoice / engagement — **status tracking only, no funds custody** (Doc-2 §3.5/§10.5).
- **Ownership:** owner = Operations / BC-OPS-2; `payment_records` (child).
- **Actor Types:** User (recording party; confirmation may require approver; §5.3).
- **Preconditions:** active membership; `can_record_payments` to record; **`can_approve_payment`** to confirm (Doc-2 §7); target trade invoice/engagement exists.
- **Request (high-level):** `engagement_id` (+ optional `trade_invoice_id`); amount + currency + method note on record; `payment_record_id` on confirm.
- **Response (high-level):** payment-record id, status, `reference_id`.
- **State-Machine:** `recorded → confirmed` (Doc-2 §10.5).
- **Authorization:** §6; `can_record_payments` (record) / `can_approve_payment` (confirm) (Doc-2 §7); party scope.
- **Audit:** yes → Doc-2 §9 **Financial** "payment record entries".
- **Events:** none — no Doc-2 §8 operations event for payment records (state + audit only — B.6). Where a payment completes a trade invoice, the invoice-status update (above) carries its own audit.
- **Cross-Module:** **no funds movement** (records only — DF-6); no Billing entity touched. Party notification is Communication's (DF-7).
- **Error Categories:** AUTHORIZATION (missing `can_approve_payment` for confirm), STATE, VALIDATION, SYSTEM.
- **AI-Agent Notes:** **records only** — Operations never moves money (DF-6); confirmation requires `can_approve_payment` distinct from `can_record_payments` (Doc-2 §7). No payment event is coined (verified absent from Doc-2 §8 operations row).

#### `ops.record_buyer_feedback.v1` — Buyer Feedback (performance input) · 21.4 Command · Actor: User

- **Purpose:** Record buyer feedback on the engagement — a Trust performance input (Doc-2 §8 `BuyerFeedbackRecorded`; §9 "buyer feedback submitted").
- **Ownership:** owner = Operations / BC-OPS-2; recorded against `engagements` (feedback as a performance input; the public review entity itself is Trust's `public_reviews` — DF-4).
- **Actor Types:** User (buyer-side party; §5.3).
- **Preconditions:** active membership; engagement exists (feedback requires the engagement — Doc-2 §9 "dispute evidence requires the full chain"); buyer-side scope. *(Slug: buyer post-award feedback maps to the engagement/CRM authority; if a content pass finds no precise §7 slug for engagement feedback distinct from `can_manage_engagements`, carry `[ESC-OPS-SLUG]`; the public-review submission slug `can_submit_review` is a Trust/review surface, not an Operations-owned mutation.)*
- **Request (high-level):** `engagement_id`; feedback content (high-level).
- **Response (high-level):** feedback ref, `reference_id`.
- **State-Machine:** none on the engagement root (feedback is a recorded input); no new machine.
- **Authorization:** §6; `can_manage_engagements` (Doc-2 §7) for the engagement-bound feedback record (or `[ESC-OPS-SLUG]` if a distinct slug is later required); buyer party scope.
- **Audit:** yes → Doc-2 §9 **Engagement** "buyer feedback submitted".
- **Events:** **`BuyerFeedbackRecorded`** (Doc-2 §8) via Doc-4B outbox-write (Trust performance input — Buyer Feedback).
- **Cross-Module:** `BuyerFeedbackRecorded` consumed by Trust (DF-4); the **published public review** is Trust-owned (`trust.public_reviews`) and Marketplace-displayed — Operations does **not** own or publish reviews.
- **Error Categories:** AUTHORIZATION, STATE (no engagement), VALIDATION, SYSTEM.
- **AI-Agent Notes:** this records a **performance input** (Trust, DF-4); Operations never computes a Trust/Performance score and never owns the public review (`public_reviews` = Trust). Engagement is a precondition (no feedback without the post-award chain — Doc-2 §9).

#### `ops.get_engagement.v1` · `ops.list_engagements.v1` · `ops.get_engagement_document.v1` — Engagement Reads · 21.3 Query · Actor: User

- **Purpose:** Read an engagement, its document chain, and party views (parties only).
- **Ownership:** owner = Operations / BC-OPS-2; reads over `engagements`(+document children).
- **Actor Types:** User (a party to the engagement — buyer org or vendor controlling org; §5.3).
- **Preconditions:** active membership; `can_manage_engagements` (engagement read falls under the engagement slug; no separate read slug exists in Doc-2 §7 — carry `[ESC-OPS-SLUG]` only if a distinct read slug is later required); party scope (RLS via party columns).
- **Request (high-level):** `engagement_id` / `document_id` / filter+pagination.
- **Response (high-level):** engagement projection (status, party refs, award value snapshot), document list/version, page; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** §6; `can_manage_engagements` (Doc-2 §7); **party scope only** — buyer org sees its side, vendor controlling org sees its side (Doc-2 §6/§10.5 shared-by-parties).
- **Audit:** no (reads not audited — §17.1).
- **Events:** none.
- **Cross-Module:** vendor/party identity resolution consumed from Identity (DF-1, read-only).
- **Error Categories:** AUTHORIZATION, NOT_FOUND, VALIDATION.
- **AI-Agent Notes:** an engagement is **shared by the parties only** (Doc-2 §6) — never expose it to a non-party; RLS anchors on party columns, never cross-schema traversal (Doc-2 §10.11).

**Cross-context interaction rules (BC-OPS-2).** *Inbound (cross-module):* consumes RFQ `RFQClosedWon` to create the engagement (DF-3). *Inbound (within Operations):* references **BC-OPS-4** `template_versions` for document bodies (LOI/PO/challan/WCC) by `template_version_id`; **BC-OPS-1** reads BC-OPS-2 outcomes for relationship history. *Outbound (cross-module):* emits **`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`** to **Trust** as performance inputs (DF-4); emits events Communication fans out (DF-7). No aggregate crosses a context boundary; documents are referenced, generated bodies live in BC-OPS-4.

---

## §F6 — BC-OPS-3 Vendor Lead Pipeline — Contracts (Vendor Lead aggregate)

> Binds Doc-2 §3.5/§10.5 (`vendor_leads` + `lead_activities`), §8 (consumes RFQ `VendorInvited`). This is the **vendor-side** CRM pipeline, tenant-owned by the vendor's controlling org. Error categories use the Doc-4A §12 closed class set with `ops_`-prefixed codes (Pass-B assigns exact codes).

**Purpose.** Maintain the vendor-side CRM pipeline entry per received RFQ invitation and its activity log — opportunity tracking from `received` through `quoted`/`negotiation` to `won`/`lost`/`follow_up`. The lead is created by consuming RFQ `VendorInvited` (which fires only at invitation `delivered`); Operations owns the lead effect (single-authorship).

**Ownership.** Owner = Operations / `operations` schema. **Aggregate (Doc-2 §2 — in exactly this one context):** **Vendor Lead** — root `vendor_leads`; child `lead_activities`; VO `PipelineStage`.

**Aggregate responsibilities.** Hold the vendor's pipeline entry (`stage`, `value_estimate`, `next_action_at`) keyed to `vendor_profile_id` + `controlling_organization_id` + `rfq_id` + `invitation_id`, and an append-only `lead_activities` log; advance the pipeline stage as the vendor works the opportunity. The lead is a **vendor-side CRM artifact** — it owns no RFQ/quotation data (DF-3) and references the RFQ/invitation by UUID only.

**Aggregate invariants (by pointer; not re-derived).** (1) **Created on delivery only (Doc-2 §10.5; §8):** a `vendor_leads` row is created **only** on `VendorInvited` (which fires only at invitation `delivered`) — undelivered invitations never create leads or visibility. (2) **Vendor tenancy (Doc-2 §6/§10.5):** RLS anchors on `controlling_organization_id` (vendor side); a representative org acts via §6B delegation grant. (3) **References, not ownership (DF-3):** `rfq_id`/`invitation_id`/`vendor_profile_id` are bare UUIDs — the lead never owns or mutates RFQ/quotation/award data. (4) **Append-only activity (Doc-2 §10.5):** `lead_activities` is append-only.

**Lifecycle definitions (Doc-2 §3.5/§10.5; bound by pointer):** `vendor_leads` → `received → quoted → negotiation → won | lost → follow_up`; `lead_activities` → append-only.

**Domain services (surfaces; Doc-4F Structure §F6).** Vendor-lead pipeline management; activity logging. Each consumes Doc-4B (audit) and Doc-4C (`check_permission`/delegation) by pointer.

#### `ops.create_lead_on_invitation.v1` — Vendor Lead Creation (RFQ `VendorInvited` consumer) · 21.5 System · Actor: System · *(the DF-3 seam; co-consumer with Communication)*

- **Purpose:** On the RFQ `VendorInvited` event (fired only at invitation `delivered`), create the `vendor_leads` row for the invited vendor's controlling org (Doc-2 §8 primary consumer "vendor_leads creation (operations)"; §10.5).
- **Ownership:** owner = Operations / BC-OPS-3; `vendor_leads` (AR). **RFQ owns the event; Operations owns the lead effect** (single-authorship); **Communication independently consumes the same event** for notification fan-out (DF-7) — the two consumers are independent and idempotent (§16).
- **Actor Types:** System (inbound event consumer; idempotent on event identity).
- **Preconditions:** a delivered `VendorInvited` event (Doc-2 §8); references `vendor_profile_id`/`controlling_organization_id`/`rfq_id`/`invitation_id` (bare UUIDs, service-validated); no existing lead for the `invitation_id` (dedupe).
- **Request (high-level):** inbound event reference (internal; `Response: none` per 21.5).
- **Response (high-level):** none (system; writes `vendor_leads` at `received`).
- **State-Machine:** creates `vendor_leads` at `received` (Doc-2 §3.5 entry).
- **Authorization:** system actor (no org context; no delegation).
- **Audit:** yes → bind nearest Doc-2 §9; **`[ESC-OPS-AUDIT]`** — §9 does not separately enumerate `vendor_leads` create (interim: nearest action by pointer; channel Doc-2 §9 additive; no action invented).
- **Events:** none emitted (the invitation event was RFQ's; lead creation emits no operations event — B.6).
- **Cross-Module:** consumes RFQ `VendorInvited` (DF-3); party UUIDs validated by service (Identity DF-1 / Marketplace DF-2, read-only). **Independent of** Communication's consumption of the same event (DF-7).
- **Error Categories:** SYSTEM, DEPENDENCY, CONFLICT (lead already exists → idempotent no-op).
- **AI-Agent Notes:** the lead is created **only** at invitation `delivered` (Doc-2 §8 — `VendorInvited` never fires on `selected`/`deferred`); idempotent on `invitation_id`; the Operations consumer is **independent** of the Communication consumer (neither depends on the other — Doc-4F Structure §F10).

#### `ops.update_lead_stage.v1` — Advance Lead Pipeline Stage · 21.4 Command · Actor: User

- **Purpose:** Advance the vendor lead through its pipeline (`received → quoted → negotiation → won | lost → follow_up`) (Doc-2 §3.5).
- **Ownership:** owner = Operations / BC-OPS-3; `vendor_leads` (AR).
- **Actor Types:** User (vendor controlling org; or representative via §6B delegation grant).
- **Preconditions:** active membership; `can_manage_leads`; lead exists; stage transition legal per Doc-2 §3.5.
- **Request (high-level):** `vendor_lead_id`; target stage; optional `value_estimate`/`next_action_at`.
- **Response (high-level):** new stage, `reference_id`.
- **State-Machine:** `received → quoted → negotiation → won | lost → follow_up` (Doc-2 §3.5).
- **Authorization:** §6/§6B; `can_manage_leads` (Doc-2 §7); scope = vendor controlling org or delegation grant.
- **Audit:** yes → **`[ESC-OPS-AUDIT]`** (nearest Doc-2 §9 action by pointer; `vendor_leads` stage-change not separately enumerated; channel Doc-2 §9 additive; no action invented).
- **Events:** none — no Doc-2 §8 operations event for lead stage changes (state + audit only — B.6).
- **Cross-Module:** delegation grant consumed from Identity (DF-1). The lead's `stage` is **vendor-private CRM** — it does not affect RFQ/quotation state (DF-3) and is not a governance signal (§4B).
- **Error Categories:** AUTHORIZATION, STATE (illegal transition), VALIDATION, NOT_FOUND, SYSTEM.
- **AI-Agent Notes:** the lead pipeline is **vendor-side CRM only** — advancing a lead never mutates an RFQ, quotation, or award (DF-3); `won`/`lost` here is the vendor's private pipeline outcome, **not** the RFQ award decision (RFQ owns award — Doc-4E).

#### `ops.add_lead_activity.v1` — Log Lead Activity · 21.4 Command · Actor: User

- **Purpose:** Append an activity entry to a vendor lead's log (Doc-2 §3.5 `lead_activities`, append-only).
- **Ownership:** owner = Operations / BC-OPS-3; `lead_activities` (child).
- **Actor Types:** User (vendor controlling org; or representative via §6B delegation grant).
- **Preconditions:** active membership; `can_manage_leads`; parent lead exists.
- **Request (high-level):** `vendor_lead_id`; activity content (`actor_user_id` captured).
- **Response (high-level):** activity id, `reference_id`.
- **State-Machine:** append-only (Doc-2 §10.5 — no lifecycle).
- **Authorization:** §6/§6B; `can_manage_leads` (Doc-2 §7); vendor controlling-org scope.
- **Audit:** yes → **`[ESC-OPS-AUDIT]`** (nearest Doc-2 §9 action by pointer; `lead_activities` not separately enumerated; channel Doc-2 §9 additive; no action invented).
- **Events:** none (state + audit only).
- **Cross-Module:** delegation grant consumed from Identity (DF-1).
- **Error Categories:** AUTHORIZATION, VALIDATION, NOT_FOUND (parent), SYSTEM.
- **AI-Agent Notes:** append-only — never mutate or delete a logged activity (Doc-2 §10.5).

#### `ops.get_lead.v1` · `ops.list_leads.v1` — Vendor Lead Reads · 21.3 Query · Actor: User

- **Purpose:** Read the vendor org's own leads and activity (own controlling-org scope only).
- **Ownership:** owner = Operations / BC-OPS-3; reads over `vendor_leads`(+`lead_activities`).
- **Actor Types:** User (vendor controlling org; or representative via §6B delegation grant).
- **Preconditions:** active membership; `can_manage_leads` (lead read falls under the lead slug; no separate read slug in Doc-2 §7); vendor controlling-org scope.
- **Request (high-level):** `vendor_lead_id` / filter+pagination.
- **Response (high-level):** lead projection (stage, value, next action, RFQ/invitation refs), activity list, page; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** §6/§6B; `can_manage_leads` (Doc-2 §7); scope = vendor controlling org or delegation grant.
- **Audit:** no (reads not audited — §17.1).
- **Events:** none.
- **Cross-Module:** RFQ/invitation refs are bare UUIDs (DF-3); any RFQ detail beyond the vendor's grant is **not** read here (RFQ owns RFQ reads — Doc-4E grantee-scoped).
- **Error Categories:** AUTHORIZATION, NOT_FOUND, VALIDATION.
- **AI-Agent Notes:** strictly **own controlling-org** leads; never cross-tenant; the lead references the RFQ by UUID but is not a window into RFQ-owned data (DF-3).

**Cross-context interaction rules (BC-OPS-3).** *Inbound (cross-module):* consumes RFQ `VendorInvited` to create the lead (DF-3), **independently** of Communication's consumption of the same event (DF-7). *Within Operations:* informed by the same RFQ events BC-OPS-2 consumes (lead at `VendorInvited`; engagement at `RFQClosedWon`) — but the two contexts own **separate** aggregates and never write each other's. No aggregate crosses a context boundary.

---

## §F7 — BC-OPS-4 Document Generation & Templates — Contracts (Document Template + Generated Document aggregates)

> Binds Doc-2 §3.5/§10.5 (`document_templates` + `template_versions`, `generated_documents`), §5.9 (Document Template state machine). **This context owns two aggregates** — Document Template and Generated Document — **each in exactly this one context.** Error categories use the Doc-4A §12 closed class set with `ops_`-prefixed codes (Pass-B assigns exact codes).

**Purpose.** Manage the organization's branded template formats (the five formats: challan/bill/letterhead/quotation/wcc) with immutable versioning, and produce template-engine outputs (`generated_documents`, storage refs) with counterparty grant-sharing. Engagement documents (BC-OPS-2) reference a `template_version_id` for their body; rendering lives here.

**Ownership.** Owner = Operations / `operations` schema. **Aggregates (Doc-2 §2 — each in exactly this one context):** **Document Template** — root `document_templates`; child `template_versions`; VO `TemplateFormat` (challan/bill/letterhead/quotation/wcc). **Generated Document** — root `generated_documents`; VO `StorageRef` (versions are rows).

**Aggregate responsibilities.** *Document Template* — hold the branded format definition per org and its immutable version chain (`layout_jsonb`, `brand_binding_jsonb`); follow the §5.9 lifecycle. *Generated Document* — hold the template-engine output (`doc_kind`, `version_no`, `storage_ref`, `generation_job_id`) keyed to a `source_entity_id` (rfq/quotation/engagement doc) and an optional `template_version_id`; sharable to the counterparty by grant.

**Aggregate invariants (by pointer; not re-derived).** (1) **Immutable versions (Doc-2 §5.9/§10.5):** `template_versions` are **never overwritten**; editing an active template creates a new version; prior versions are retained; generated documents **record the `template_version` used**. (2) **Tenancy (Doc-2 §6/§10.5):** `document_templates`/`template_versions`/`generated_documents` carry `organization_id` and are tenant-owned; `generated_documents` add a **counterparty grant** for sharing. (3) **Storage-ref only (Doc-2 §10.5):** generated documents hold storage refs (Doc-4B storage — DF-8), not blobs in-row. (4) **Two aggregates, one context (Doc-4F Structure §F4/§F5):** Document Template and Generated Document each remain in exactly this context; neither crosses to BC-OPS-2 (which only *references* a `template_version_id`).

**Lifecycle definitions (Doc-2 §5.9/§10.5; bound by pointer):** `document_templates` → `draft → active → archived` with `active → active` on new version and `archived → active` on reactivate (§5.9); `template_versions` → immutable rows; `generated_documents` → versioned rows.

**Domain services (surfaces; Doc-4F Structure §F6).** Template-management; document-generation (template engine); counterparty grant-sharing of generated documents. Each consumes Doc-4B (audit/human-ref/storage) and Doc-4C (`check_permission`) by pointer.

#### `ops.create_template.v1` · `ops.activate_template.v1` · `ops.archive_template.v1` · `ops.reactivate_template.v1` — Template Lifecycle · 21.4 Command · Actor: User

- **Purpose:** Create, activate, archive, or reactivate a branded document template (Doc-2 §5.9 Document Template machine).
- **Ownership:** owner = Operations / BC-OPS-4; `document_templates` (AR).
- **Actor Types:** User (org member; §5.3).
- **Preconditions:** active membership; `can_manage_templates`; state transition legal per Doc-2 §5.9 (`draft`/`active`/`archived`).
- **Request (high-level):** template `format` (challan/bill/letterhead/quotation/wcc), name on create; `document_template_id` + action on activate/archive/reactivate.
- **Response (high-level):** `document_template_id`, state, `current_version_no`, `reference_id`.
- **State-Machine:** `draft → active → archived`; `archived → active` (reactivate) (Doc-2 §5.9).
- **Authorization:** §6; `can_manage_templates` (Doc-2 §7); org scope.
- **Audit:** yes → Doc-2 §9 **Documents** "template create/activate/archive".
- **Events:** none — no Doc-2 §8 operations event for template lifecycle (state + audit only — B.6).
- **Cross-Module:** none direct (POLICY/flags via Doc-4B if any timing applies — DF-8; any required tunable carries `[ESC-OPS-POLICY]`).
- **Error Categories:** AUTHORIZATION, STATE (illegal §5.9 transition), VALIDATION (bad format), SYSTEM.
- **AI-Agent Notes:** `format` is the **fixed five-format enum** (Doc-2 §10.5 challan/bill/letterhead/quotation/wcc) — never extend it; honor the §5.9 machine verbatim (templates are never overwritten — versions are added).

#### `ops.add_template_version.v1` — New Template Version (immutable) · 21.4 Command · Actor: User

- **Purpose:** Add a new immutable version of an active template (Doc-2 §5.9 "edit → active (new template_version; prior versions retained)").
- **Ownership:** owner = Operations / BC-OPS-4; `template_versions` (immutable child).
- **Actor Types:** User (org member; §5.3).
- **Preconditions:** active membership; `can_manage_templates`; template in `active`.
- **Request (high-level):** `document_template_id`; `layout_jsonb`, `brand_binding_jsonb` (high-level).
- **Response (high-level):** `template_version_id`, `version_no`, `reference_id`.
- **State-Machine:** template stays `active`; appends an immutable `template_versions` row (Doc-2 §5.9/§10.5).
- **Authorization:** §6; `can_manage_templates` (Doc-2 §7); org scope.
- **Audit:** yes → Doc-2 §9 **Documents** "template … new version".
- **Events:** none (state + audit only).
- **Cross-Module:** none.
- **Error Categories:** AUTHORIZATION, STATE (template not active), VALIDATION, SYSTEM.
- **AI-Agent Notes:** versions are **immutable** (Doc-2 §5.9) — never overwrite; generated documents must record the `template_version` they used (Doc-2 §5.9).

#### `ops.generate_document.v1` — Generate Document (template engine) · 21.5 System · Actor: System

- **Purpose:** Produce a generated document from a source entity (engagement doc / rfq / quotation) and an optional template version, writing a `generated_documents` row with a storage ref (Doc-2 §3.5/§10.5; async generation job).
- **Ownership:** owner = Operations / BC-OPS-4; `generated_documents` (AR).
- **Actor Types:** System (async generation job — `generation_job_id`; may be enqueued by a user action in BC-OPS-2/BC-OPS-4). *(If a content pass models the trigger as a synchronous user command rather than an async job, it binds 21.4 Command instead; the owned entity and bindings are unchanged. Confirmed in Pass-B.)*
- **Preconditions:** source entity exists (`source_entity_id` — rfq/quotation/engagement doc, service-validated); optional `template_version_id` active; storage available (Doc-4B — DF-8).
- **Request (high-level):** `source_entity_id`; `doc_kind`; optional `template_version_id` (internal job input; `Response: none` per 21.5).
- **Response (high-level):** none (system; writes `generated_documents` with `human_ref` `DOC-…` + `storage_ref`).
- **State-Machine:** writes a versioned `generated_documents` row (Doc-2 §10.5).
- **Authorization:** system actor (the enqueuing user action carries `can_create_documents`/`can_manage_templates` per source; the job itself is system).
- **Audit:** yes → Doc-2 §9 **Documents** "generated document creation".
- **Events:** none — no Doc-2 §8 operations event for generation (state + audit only — B.6).
- **Cross-Module:** storage + `human_ref` via Doc-4B (DF-8); `source_entity_id` validated by service (RFQ/quotation refs are DF-3 UUIDs, read-only — generation never mutates the source).
- **Error Categories:** SYSTEM, DEPENDENCY (storage/engine), REFERENCE (source/template), VALIDATION.
- **AI-Agent Notes:** the generated document **records its `template_version`** (Doc-2 §5.9); it holds a **storage ref, not a blob** (Doc-2 §10.5); generating from an RFQ/quotation source **reads** that source by UUID and never mutates it (DF-3/DF-2).

#### `ops.grant_generated_document.v1` · `ops.revoke_generated_document_grant.v1` — Counterparty Grant Sharing · 21.4 Command · Actor: User

- **Purpose:** Share (or revoke) a generated document with the engagement counterparty by grant (Doc-2 §10.5 "sharable to counterparty by grant").
- **Ownership:** owner = Operations / BC-OPS-4; the counterparty grant on `generated_documents`.
- **Actor Types:** User (owning org member; §5.3).
- **Preconditions:** active membership; `can_create_documents` (generated-document sharing falls under document creation authority; if a content pass finds a distinct share slug is required, carry `[ESC-OPS-SLUG]`); document exists; counterparty is the engagement party.
- **Request (high-level):** `generated_document_id`; counterparty ref; grant/revoke.
- **Response (high-level):** grant state, `reference_id`.
- **State-Machine:** grant flag on `generated_documents` (Doc-2 §10.5); no root lifecycle change.
- **Authorization:** §6; `can_create_documents` (Doc-2 §7) (or `[ESC-OPS-SLUG]` if a distinct slug is later required); org scope.
- **Audit:** yes → bind nearest Doc-2 §9; **`[ESC-OPS-AUDIT]`** — §9 **Documents** enumerates "generated document creation" and "rfq_document_grant create/remove" (an RFQ-side grant); the **Operations `generated_documents` counterparty grant** is bound to the nearest Documents grant action by pointer (channel Doc-2 §9 additive; no action invented).
- **Events:** none (state + audit only).
- **Cross-Module:** counterparty identity resolution from Identity (DF-1, read-only).
- **Error Categories:** AUTHORIZATION, NOT_FOUND, VALIDATION, SYSTEM.
- **AI-Agent Notes:** sharing is a **grant**, not a copy or a tenancy change — the document stays Operations-owned; the counterparty grant is the only sharing channel (Doc-2 §10.5). Distinct from RFQ's `rfq_document_grant` (RFQ-owned — Doc-4E).

#### `ops.get_template.v1` · `ops.list_templates.v1` · `ops.get_generated_document.v1` · `ops.list_generated_documents.v1` — Template / Generated-Document Reads · 21.3 Query · Actor: User

- **Purpose:** Read templates/versions and generated documents (own-org; counterparty sees granted generated documents).
- **Ownership:** owner = Operations / BC-OPS-4; reads over `document_templates`(+`template_versions`), `generated_documents`.
- **Actor Types:** User (owning org member; counterparty for granted generated documents; §5.3).
- **Preconditions:** active membership; `can_manage_templates` (template reads) / `can_create_documents` or counterparty grant (generated-document reads); org or grant scope.
- **Request (high-level):** `document_template_id` / `generated_document_id` / filter+pagination.
- **Response (high-level):** template+versions projection / generated-document projection (storage ref, kind, version), page; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** §6; `can_manage_templates` / `can_create_documents` (Doc-2 §7); owning-org or counterparty-grant scope.
- **Audit:** no (reads not audited — §17.1).
- **Events:** none.
- **Cross-Module:** storage retrieval via Doc-4B (DF-8); counterparty resolution from Identity (DF-1).
- **Error Categories:** AUTHORIZATION, NOT_FOUND, VALIDATION.
- **AI-Agent Notes:** a generated document is visible to the **owning org and granted counterparty only** (Doc-2 §10.5) — never broaden; templates are own-org only.

**Cross-context interaction rules (BC-OPS-4).** *Within Operations:* **BC-OPS-2** references `template_versions` (by `template_version_id`) for engagement-document bodies, and `generated_documents` may have a `source_entity_id` pointing at an engagement doc — **by reference/UUID only; no aggregate crosses the boundary** (the template/generated-document aggregates stay in BC-OPS-4). *Cross-module:* consumes Doc-4B storage/human-ref (DF-8); reads RFQ/quotation sources by UUID for generation (DF-3/DF-2, read-only). No event emitted by this context.

---

## §F8 — BC-OPS-5 Finance Records — Contracts (Finance Record aggregate)

> Binds Doc-2 §3.5/§10.5 (`finance_records`). **Tenant-owned structured finance text records — distinct from Billing platform invoices (Doc-4I — DF-6) and from inter-party trade invoices in BC-OPS-2.** Error categories use the Doc-4A §12 closed class set with `ops_`-prefixed codes (Pass-B assigns exact codes).

**Purpose.** Maintain structured TAX/AIT/payment/expense **text** records for the organization (no file uploads, no funds) — the lightweight finance ledger of the ERP-Lite layer. *(This is the frozen scope of BC-OPS-5; the "outcome & performance tracking" concern raised in some briefs is the BC-OPS-2 performance-input emission surface — §F5/§F11 — not this context.)*

**Ownership.** Owner = Operations / `operations` schema. **Aggregate (Doc-2 §2 — in exactly this one context):** **Finance Record** — root `finance_records`; VOs `TaxEntry`, `AITEntry` (typed text records).

**Aggregate responsibilities.** Hold structured finance entries (`record_type` tax/ait/payment/expense; `period`, `amount`, `currency`, `note`) as **structured text** — no file uploads, no funds movement, no Billing linkage.

**Aggregate invariants (by pointer; not re-derived).** (1) **Tenancy (Doc-2 §6/§10.5):** `finance_records` carry `organization_id` and are tenant-owned. (2) **Structured text only (Doc-2 §10.5):** `record_type` ∈ {tax, ait, payment, expense}; no file uploads. (3) **Not Billing, not trade invoices (DF-6):** a finance record is neither a `billing.platform_invoice` nor a BC-OPS-2 `trade_invoice`/`payment_record`; it is an org-internal finance text entry, no funds.

**Lifecycle definitions (Doc-2 §3.5/§10.5; bound by pointer):** `finance_records` → simple (no state machine).

**Domain services (surfaces; Doc-4F Structure §F6).** Finance-record management (TAX/AIT/payment/expense). Consumes Doc-4B (audit) and Doc-4C (`check_permission`) by pointer.

#### `ops.create_finance_record.v1` · `ops.update_finance_record.v1` — Finance Record management · 21.4 Command · Actor: User

- **Purpose:** Create or edit a structured finance text record (Doc-2 §3.5/§10.5).
- **Ownership:** owner = Operations / BC-OPS-5; `finance_records` (AR).
- **Actor Types:** User (org member; §5.3).
- **Preconditions:** active membership; `can_manage_finance_records`; `record_type` valid; for update, record exists.
- **Request (high-level):** `record_type` (tax/ait/payment/expense), `period`, `amount`, `currency`, `note` on create; `finance_record_id` on update.
- **Response (high-level):** `finance_record_id`, `reference_id`.
- **State-Machine:** simple (Doc-2 §3.5 — no lifecycle).
- **Authorization:** §6; `can_manage_finance_records` (Doc-2 §7); org scope.
- **Audit:** yes → bind nearest Doc-2 §9; **`[ESC-OPS-AUDIT]`** — §9 **Financial** enumerates platform-invoice/trade-invoice/payment-record actions but does **not** separately name `finance_records` create/edit (interim: nearest Financial action by pointer; channel Doc-2 §9 additive; no action invented).
- **Events:** none — no Doc-2 §8 operations event for finance records (state + audit only — B.6).
- **Cross-Module:** none — strictly org-internal; **no Billing linkage** (DF-6); no funds.
- **Error Categories:** VALIDATION (bad `record_type`), AUTHORIZATION, NOT_FOUND (update), SYSTEM.
- **AI-Agent Notes:** finance records are **structured text only** (Doc-2 §10.5 — no file uploads, no funds); never link them to Billing (`platform_invoices` are Doc-4I — DF-6) or treat them as trade invoices (BC-OPS-2). `record_type` is the fixed four-value enum — never extend.

#### `ops.get_finance_record.v1` · `ops.list_finance_records.v1` — Finance Record Reads · 21.3 Query · Actor: User

- **Purpose:** Read the org's own finance records (own-org scope only).
- **Ownership:** owner = Operations / BC-OPS-5; reads over `finance_records`.
- **Actor Types:** User (org member; §5.3).
- **Preconditions:** active membership; `can_manage_finance_records` (finance read falls under the finance slug; no separate read slug in Doc-2 §7); org scope.
- **Request (high-level):** `finance_record_id` / filter+pagination.
- **Response (high-level):** finance-record projection, page; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** §6; `can_manage_finance_records` (Doc-2 §7); org scope.
- **Audit:** no (reads not audited — §17.1).
- **Events:** none.
- **Cross-Module:** none.
- **Error Categories:** AUTHORIZATION, NOT_FOUND, VALIDATION.
- **AI-Agent Notes:** strictly **own-org** finance text; never cross-tenant; not a financial-transaction surface (records only).

**Cross-context interaction rules (BC-OPS-5).** *Isolated:* BC-OPS-5 owns only `finance_records`; it references no other Operations context's aggregate and is referenced by none. *Cross-module:* none beyond Identity org-context (DF-1) and Doc-4B audit (DF-8). **Strictly distinct** from Billing (DF-6) and from BC-OPS-2 trade invoices/payment records.

---

## §F9 — Context Interaction Surface (Pass-A consolidation)

Interactions are **by reference/UUID within the `operations` schema** (no aggregate crosses a context) and **by event/service across modules**. No contract instantiated here; this consolidates the per-BC interaction rules.

| Interaction | From → To | Mechanism | Rule |
|---|---|---|---|
| Engagement-document body | BC-OPS-2 → BC-OPS-4 | reference (`template_version_id`) | BC-OPS-2 references a template version for LOI/PO/challan/WCC bodies; the template aggregate stays in BC-OPS-4 |
| Generated-document source | BC-OPS-4 → BC-OPS-2 | reference (`source_entity_id`) | a generated document may point at an engagement doc by UUID; read-only; no aggregate moves |
| Relationship history | BC-OPS-1 → BC-OPS-2 | read-by-UUID | Buyer CRM reads engagement outcomes for relationship history; never writes the engagement |
| RFQ-event twins | RFQ → BC-OPS-2 **and** BC-OPS-3 | events (`RFQClosedWon`, `VendorInvited`) | engagement created at `RFQClosedWon`; lead created at `VendorInvited`; the two contexts own separate aggregates |
| **Entry points (module boundary in)** | RFQ → BC-OPS-2 / BC-OPS-3; Admin → BC-OPS-1 | events; service candidate | `RFQClosedWon` (engagement), `VendorInvited` (lead), `link_suggestions` candidates (link confirm) |
| **Exit points (module boundary out)** | BC-OPS-2 → Trust; BC-OPS-2 → Communication; BC-OPS-1 → RFQ | events; CRM read-service | performance-input events → Trust (DF-4); event fan-out → Communication (DF-7); CRM status read-service → RFQ (DF-3, non-disclosure) |

**No cross-module ownership; interactions by reference/event/service only; no contract instantiated** (Doc-4F Structure §F9).

---

## §F10 — Integration Surface (Pass-A consolidation)

Per Doc-4A §4.4 single-authorship, Operations authors **its own** commands (which emit its own events) and **its own** consumer effects on **its own** entities; it authors no other module's contract. **Template 21.2 is not instantiated** (the emitter authors the delivery integration; consumers author their legs). **Template 21.6 (Admin) is not instantiated** (Operations has no platform-staff mutation surface of its own; moderation/ban/category/link-suggestion *decisions* are Admin's — DF-5). Direction per counterpart:

| Counterpart | Marker | Direction | Operations surface (authored here) | Other side (authored there) |
|---|---|---|---|---|
| **Identity (Doc-4C, FROZEN)** | DF-1 | consume | `check_permission`, org/membership/active-org resolution, §6B delegation grants (vendor representative action) | Identity owns all of these (consumed by pointer) |
| **Marketplace (Doc-4D, FROZEN)** | DF-2 | consume (read) | read the **public vendor profile by UUID** for private↔public linking (link-not-merge) and for party validation | Marketplace owns vendor data/attributes (never owned or mutated by Operations) |
| **RFQ (Doc-4E, FROZEN)** | DF-3 | consume (events) + expose (read-service) | consume `RFQClosedWon` (→ engagement) and `VendorInvited` (→ vendor lead); reference `rfq_id`/`vendor_profile_id`/`invitation_id` by UUID; **expose the CRM status read-service** RFQ consumes under non-disclosure | RFQ owns RFQs/quotations/matching/award + emits the award/invitation events (the post-award seam: RFQ decides, Operations executes) |
| **Trust (Doc-4G)** | DF-4 | emit only | emit `DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded` as performance inputs | **Trust owns scores/verification and authors its own consumer** (firewall: Operations emits inputs, computes no score) |
| **Admin (Doc-4J)** | DF-5 | consume (candidate) | consume `link_suggestions` candidates; the **confirmed link is an Operations column write** on `private_vendor_records` | Admin owns the suggestion entity + the moderation/ban/category *decisions* |
| **Billing (Doc-4I)** | DF-6 | strict separation | `trade_invoices`/`payment_records` are **Operations-owned inter-party records (≠ platform invoices); no funds** | Billing owns `platform_invoices`/`subscriptions`/`entitlements` (Operations references none) |
| **Communication (Doc-4H)** | DF-7 | emit only | emit outbox events (engagement/document/dispute/feedback; `VendorInvited` co-consumed) | **Communication owns notification fan-out and authors all notification contracts — Operations authors none** (single-authorship) |
| **Platform Core (Doc-4B, FROZEN)** | DF-8 | consume | audit-write (`core.append_audit_record.v1`), outbox-write (`core.write_outbox_event.v1`), UUIDv7 + `core.allocate_human_reference.v1`, POLICY read, feature flags, storage | Platform Core owns all `core.*` services |

**Excluded:** no ownership transfer in any direction; emitting the outbox event is the boundary — Operations authors no consumer's contract; no notification/Communication contract authored (DF-7); no RFQ/Marketplace/Trust/Billing entity owned or mutated.

---

## §F11 — Event & Dependency Map (Pass-A consolidation)

**Emitted (Doc-2 §8 operations catalog; via Doc-4B outbox-write; no event coined) — all from BC-OPS-2:** `DeliveryRecorded` (`record_delivery`), `WorkCompletionIssued` (`issue_engagement_document` — WCC), `EngagementCompleted` (`update_engagement_status` → completed), `DisputeRecorded` (`update_trade_invoice_status` → disputed / engagement dispute), `BuyerFeedbackRecorded` (`record_buyer_feedback`). **All consumed idempotently by Trust into `performance_inputs`** (Delivery Performance, Buyer Feedback, Dispute Record — DF-4). *(Exact transition→event bindings for `EngagementCompleted`/`DisputeRecorded` are confirmed in Pass-B against Doc-2 §8/§3.5; the events themselves are the existing five, none coined.)*

**Consumed (Doc-2 §8, RFQ's events; idempotent — Doc-4A §16):** `RFQClosedWon` → BC-OPS-2 `create_engagement_on_award` (engagement creation); `VendorInvited` → BC-OPS-3 `create_lead_on_invitation` (vendor-lead creation; fires only at invitation `delivered`; **independently** co-consumed by Communication for fan-out — DF-7). The delivery integration is the emitter's (RFQ — §4.4).

**Non-events (verified absent from Doc-2 §8 operations row — bound as state + audit only):** every CRM mutation (record/status/favorite/link), every lead pipeline transition + activity, every template/generated-document lifecycle action, every finance-record change, and every trade-invoice/payment-record status change other than the dispute path. **No event coined** (Doc-4A §16.4).

**Dependency markers (carried; not resolved):** DF-1…DF-8 (§F10), each to its named channel; `[ESC-OPS-AUDIT]` (Doc-2 §9 additive), `[ESC-OPS-POLICY]` (Doc-3 §12.2 additive), `[ESC-OPS-SLUG]` (Doc-2 §7 additive).

---

## §F12 — Authorization Surface & Escalation Register (Pass-A consolidation)

**Authorization.** Three-layer check (active Membership + Permission Slug + Resource Scope) OR active §6B delegation grant; resolved via Identity `check_permission` (consumed, no shadow authorization). **Slugs (Doc-2 §7; none invented):**

| Slug | Space | Contracts |
|---|---|---|
| `can_manage_private_vendors` | tenant (buyer) | private vendor record/notes/ratings/favorites manage + reads; CRM favorites |
| `can_manage_vendor_status` | tenant (buyer) | set/clear Buyer-Vendor Status |
| `can_manage_engagements` | tenant (party) | engagement lifecycle/close; engagement reads; engagement-bound buyer feedback |
| `can_create_documents` | tenant (party) | issue/revise LOI/PO/challan/WCC; record delivery (challan); generated-document grant |
| `can_approve_po` | tenant (buyer) | PO / financial approval (in addition to `can_create_documents`) |
| `can_record_payments` | tenant (party) | issue/update trade invoice; record payment |
| `can_approve_payment` | tenant (party) | confirm payment (in addition to `can_record_payments`) |
| `can_manage_finance_records` | tenant (org) | finance-record manage + reads |
| `can_manage_templates` | tenant (org) | template lifecycle + versions + reads |
| `can_manage_leads` | tenant (vendor; + delegation) | vendor-lead pipeline + activity + reads |

Buyer-side write scope = buyer organization of the target row; vendor-side write scope = vendor controlling org (or §6B delegation grant); system-actor contracts (event consumers, generation job) carry no org context. **No role bundle authored** (Identity-seeded); **no slug invented** (§6.4).

**Escalation register (carried; never resolved here):**

- **`[ESC-OPS-AUDIT]`** (channel: Doc-2 §9 additive). Operations mutations whose audit action is not separately enumerated in Doc-2 §9 — bind the nearest §9 action by pointer until the additive patch lands; **no action invented.** Candidates confirmed in the per-contract records: `private_vendor_records`/notes/ratings create-edit-archive; `vendor_favorites` set/clear; `vendor_leads` create + stage-change; `lead_activities` append; `finance_records` create/edit; the Operations-side `generated_documents` counterparty grant (vs the §9-enumerated `rfq_document_grant`); and (if read as Admin-actor-only) the Operations-side link-confirm column write.
- **`[ESC-OPS-POLICY]`** (channel: Doc-3 §12.2 additive). Any Operations runtime tunable requiring a POLICY key absent from Doc-3 §12.2 — **Doc-3 §12.2 registers no `operations`/`ops` namespace.** Interim: reference an existing key by name; if none fits, carry the marker — **never invent the key in Doc-4F.** No Operations tunable is hardcoded in this pass.
- **`[ESC-OPS-SLUG]`** (channel: Doc-2 §7 additive). Operations uses the ten Doc-2 §7 slugs above; if a content pass finds a required action lacks a §7 slug (candidates: a distinct engagement-feedback slug vs `can_manage_engagements`; a distinct generated-document-share slug vs `can_create_documents`; distinct read slugs), carry the marker — **no slug invented.**

---

## §F13 — Audit Surface (Pass-A consolidation)

All audited mutations bind to Doc-2 §9 via Doc-4B `core.append_audit_record.v1` (in-transaction; never re-implemented); reads not audited (§17.1).

**Doc-2 §9 domains Operations binds (by pointer):**

- **Engagement:** open, status change, close; LOI/PO/challan/WCC issue + revision; dispute recorded; buyer feedback submitted.
- **Documents:** template create/activate/archive/new version; generated document creation; (rfq_document_grant create/remove is RFQ-side).
- **Buyer CRM:** vendor status set/changed/cleared (visible only to buyer org + platform compliance; never vendor-facing).
- **Financial:** trade invoice issue/status change; payment record entries.
- **Admin:** link confirm/dismiss (the decision is Admin-audited; Operations writes the link column).

**`[ESC-OPS-AUDIT]` (carried; interim = nearest §9 action by pointer; channel Doc-2 §9 additive; no action invented):** private-vendor record/notes/ratings create-edit-archive; `vendor_favorites` set/clear; `vendor_leads` create + stage-change; `lead_activities` append; `finance_records` create/edit; Operations `generated_documents` counterparty grant; Operations-side link-confirm column write (if §9 "link confirm/dismiss" is read as Admin-actor-only). Each binds the nearest enumerated §9 action until the additive patch lands.

---

## §F14 — AI-Agent Implementation Considerations (Pass-A consolidation)

- **Consume, never re-derive:** Doc-4B services (audit/outbox/UUIDv7/human-ref/POLICY/flags/storage — DF-8), Doc-4C authorization/membership/delegation (DF-1), Doc-4D public vendor profile (DF-2, read-only), Doc-4E award/invitation events (DF-3, consumed). Honor the Doc-2 §3.5/§5.9/§10.5 lifecycles verbatim.
- **Seam protection (post-award only):** Operations owns **only** post-award business execution. Never own RFQs/quotations/matching/routing/ranking/supplier-selection/award (RFQ — DF-3); never own/mutate vendor discovery/profiles/attributes (Marketplace — DF-2); never compute/store trust/performance/verification scores (Trust — DF-4 — Operations emits performance *inputs* only); never own orgs/memberships/delegation (Identity — DF-1); never touch `platform_invoices`/`subscriptions`/`entitlements` (Billing — DF-6 — `trade_invoices` ≠ platform invoices, `payment_records` are records only, no funds).
- **Non-disclosure & firewall:** `buyer_vendor_statuses`/private-CRM facts are tenant-owned, **never vendor-facing**, and served to RFQ routing **only via the CRM status read-service** under the §7.5 indistinguishability invariant (Doc-2 §10.11); no paid plan/entitlement/flag gates eligibility/verification/routing/matching, and no signal mutates another (§4B).
- **Ambiguity prevention:** every aggregate in exactly one BC-OPS context (§F5/§F8 of the structure; the §F3 table here); the engagement is **created by the `RFQClosedWon` consumer, never a buyer command** (one award = one engagement, ADR-002); the lead is created **only at invitation `delivered`** (`VendorInvited`); document/template versions are **immutable** (Doc-2 §5.9); reviews are **Trust's** (`public_reviews`), not Operations'. **No event/slug/audit-action/POLICY-key invention** — escalate via DF / `[ESC-OPS-AUDIT]` / `[ESC-OPS-POLICY]` / `[ESC-OPS-SLUG]`.
- **Self-check before review:** run the Doc-4A Appendix A conformance checklist (CHK-xxx) — every command/query/system contract uses 21.4/21.3/21.5 (no 21.6 here; no 21.2 here); no new entity/state/transition; slugs in Doc-2 §7; events in Doc-2 §8; audit actions in Doc-2 §9 (or carried `[ESC-OPS-AUDIT]`); POLICY by key (or carried `[ESC-OPS-POLICY]`); non-disclosure + firewall declarations present on BC-OPS-1 + the CRM read-service; integration authored by source module. Audience: Claude Code, Cursor, backend, frontend, QA, AI Coding Agents.

---

## Appendix A — Module 4 Contract Inventory (Pass-A)

| # | Contract-ID | Capability | Template | Owned aggregate/entity | Actor | BC / §F | Authoritative source |
|---|---|---|---|---|---|---|---|
| 1 | `ops.create_private_vendor.v1` / `ops.update_private_vendor.v1` / `ops.archive_private_vendor.v1` | Private vendor record manage | 21.4 | Private Vendor Record (`private_vendor_records`) | User | BC-OPS-1/§F4 | Doc-2 §3.5/§10.5; PATCH-02 |
| 2 | `ops.add_private_vendor_note.v1` / `ops.set_private_vendor_rating.v1` | Private notes & ratings | 21.4 | `private_vendor_notes`,`private_vendor_ratings` | User | BC-OPS-1/§F4 | Doc-2 §3.5 |
| 3 | `ops.set_buyer_vendor_status.v1` / `ops.clear_buyer_vendor_status.v1` | Buyer-Vendor Status set/clear | 21.4 | `buyer_vendor_statuses` | User | BC-OPS-1/§F4 | Doc-2 §3.5/§10.5; §7.5 |
| 4 | `ops.set_vendor_favorite.v1` / `ops.clear_vendor_favorite.v1` | CRM favorites | 21.4 | `vendor_favorites` | User | BC-OPS-1/§F4 | Doc-2 §3.5; PATCH-02 |
| 5 | `ops.confirm_vendor_link.v1` / `ops.dismiss_vendor_link.v1` | Private↔public link (link-not-merge) | 21.4 | link columns on `private_vendor_records` | User | BC-OPS-1/§F4 | ADR-003; Doc-2 A-03/§10.5 (DF-5) |
| 6 | `ops.read_crm_status_for_routing.v1` | CRM status read-service (RFQ; non-disclosure) | 21.3 | `buyer_vendor_statuses` (read) | internal-service | BC-OPS-1/§F4 | Doc-2 §10.5/§10.11; §7.5 (DF-3) |
| 7 | `ops.get_private_vendor.v1` / `ops.list_private_vendors.v1` / `ops.get_buyer_supplier_relationship.v1` | Buyer CRM reads | 21.3 | Private Vendor Record; Buyer–Supplier Relationship | User | BC-OPS-1/§F4 | Doc-2 §6/§10.5 |
| 8 | `ops.create_engagement_on_award.v1` | Engagement creation (`RFQClosedWon` consumer) | 21.5 | Procurement Engagement (`engagements`) | System | BC-OPS-2/§F5 | Doc-2 §5.4/§8; ADR-002 (DF-3) |
| 9 | `ops.update_engagement_status.v1` / `ops.close_engagement.v1` | Engagement lifecycle | 21.4 | `engagements` | User | BC-OPS-2/§F5 | Doc-2 §3.5 |
| 10 | `ops.record_delivery.v1` | Record delivery (challan) | 21.4 | `challans` | User | BC-OPS-2/§F5 | Doc-2 §10.5/§8 |
| 11 | `ops.issue_engagement_document.v1` / `ops.revise_engagement_document.v1` | LOI/PO/WCC issue & revision | 21.4 | `lois`/`purchase_orders`/`work_completion_certificates` | User | BC-OPS-2/§F5 | Doc-2 §10.5/§8 |
| 12 | `ops.issue_trade_invoice.v1` / `ops.update_trade_invoice_status.v1` | Trade invoice (≠ Billing) | 21.4 | `trade_invoices` | User | BC-OPS-2/§F5 | Doc-2 §10.5 (DF-6) |
| 13 | `ops.record_payment.v1` / `ops.confirm_payment.v1` | Payment records (no funds) | 21.4 | `payment_records` | User | BC-OPS-2/§F5 | Doc-2 §10.5 (DF-6) |
| 14 | `ops.record_buyer_feedback.v1` | Buyer feedback (performance input) | 21.4 | `engagements` (feedback) | User | BC-OPS-2/§F5 | Doc-2 §8/§9 (DF-4) |
| 15 | `ops.get_engagement.v1` / `ops.list_engagements.v1` / `ops.get_engagement_document.v1` | Engagement reads | 21.3 | Procurement Engagement | User | BC-OPS-2/§F5 | Doc-2 §6/§10.5 |
| 16 | `ops.create_lead_on_invitation.v1` | Vendor lead creation (`VendorInvited` consumer) | 21.5 | Vendor Lead (`vendor_leads`) | System | BC-OPS-3/§F6 | Doc-2 §8/§10.5 (DF-3) |
| 17 | `ops.update_lead_stage.v1` | Advance lead pipeline | 21.4 | `vendor_leads` | User | BC-OPS-3/§F6 | Doc-2 §3.5 |
| 18 | `ops.add_lead_activity.v1` | Log lead activity | 21.4 | `lead_activities` | User | BC-OPS-3/§F6 | Doc-2 §10.5 |
| 19 | `ops.get_lead.v1` / `ops.list_leads.v1` | Vendor lead reads | 21.3 | Vendor Lead | User | BC-OPS-3/§F6 | Doc-2 §6/§10.5 |
| 20 | `ops.create_template.v1` / `ops.activate_template.v1` / `ops.archive_template.v1` / `ops.reactivate_template.v1` | Template lifecycle | 21.4 | Document Template (`document_templates`) | User | BC-OPS-4/§F7 | Doc-2 §5.9 |
| 21 | `ops.add_template_version.v1` | New template version (immutable) | 21.4 | `template_versions` | User | BC-OPS-4/§F7 | Doc-2 §5.9/§10.5 |
| 22 | `ops.generate_document.v1` | Generate document (template engine) | 21.5 | Generated Document (`generated_documents`) | System | BC-OPS-4/§F7 | Doc-2 §3.5/§10.5 |
| 23 | `ops.grant_generated_document.v1` / `ops.revoke_generated_document_grant.v1` | Counterparty grant sharing | 21.4 | grant on `generated_documents` | User | BC-OPS-4/§F7 | Doc-2 §10.5 |
| 24 | `ops.get_template.v1` / `ops.list_templates.v1` / `ops.get_generated_document.v1` / `ops.list_generated_documents.v1` | Template / generated-doc reads | 21.3 | Document Template; Generated Document | User | BC-OPS-4/§F7 | Doc-2 §6/§10.5 |
| 25 | `ops.create_finance_record.v1` / `ops.update_finance_record.v1` | Finance record manage | 21.4 | Finance Record (`finance_records`) | User | BC-OPS-5/§F8 | Doc-2 §3.5/§10.5 (DF-6) |
| 26 | `ops.get_finance_record.v1` / `ops.list_finance_records.v1` | Finance record reads | 21.3 | Finance Record | User | BC-OPS-5/§F8 | Doc-2 §6/§10.5 |

*Skeleton inventory — working contract names (Doc-4A §21 namespace `ops_`); Pass-B finalizes per-Contract-ID payloads, validation order, error codes, exact transition→event bindings, and any contract split. No contract instantiated beyond this Pass-A record. No 21.6 (Admin) or 21.2 (Integration) contract appears — Operations has no platform-staff mutation surface, and the emitter authors event-delivery integration (§4.4).*

---

## Appendix B — Conformance Binding Map (Pass-A)

| §F section | Governing Doc-4A standard(s) | Consumed frozen services / read-models / events |
|---|---|---|
| §F4 Buyer Private CRM | §21.4/§21.3, §6/§6B (authz), §7.5 (non-disclosure), §17 (audit), §12 (errors) | Doc-4B audit/human-ref (DF-8); Marketplace public profile (DF-2); Admin `link_suggestions` (DF-5); **exposes** CRM read-service to RFQ (DF-3) |
| §F5 Engagement & Documents | §21.4/§21.5/§21.3, §13 (state), §16 (events), §17 (audit), §4B (firewall) | Doc-4B audit/outbox/human-ref/storage (DF-8); RFQ `RFQClosedWon` (DF-3); Trust performance inputs (DF-4); Communication fan-out (DF-7) |
| §F6 Vendor Lead Pipeline | §21.4/§21.5/§21.3, §6B (delegation), §16 (idempotent consumer), §17 | Doc-4B audit (DF-8); RFQ `VendorInvited` (DF-3); Identity delegation (DF-1) |
| §F7 Document Generation & Templates | §21.4/§21.5/§21.3, §13 (§5.9 machine), §17 | Doc-4B storage/human-ref/audit (DF-8); RFQ/quotation sources by UUID (DF-3, read) |
| §F8 Finance Records | §21.4/§21.3, §6 (authz), §17 | Doc-4B audit (DF-8); Identity org-context (DF-1) |
| §F9–§F14 cross-cutting | §4/§4.4 (single-authorship), §5/§6/§6B, §16/§17, §4B/§7.5, Appendix A/B | Doc-4B/Doc-4C/Doc-4D/Doc-4E (consumed) |

Doc-4F redefines none of the above; all bindings are by pointer.

---

## Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers (UNCHANGED)

**DF-1** (Identity — consume org/membership/`check_permission`/delegation), **DF-2** (Marketplace — read public vendor profile for linking; own/mutate no vendor data), **DF-3** (RFQ post-award seam — consume `RFQClosedWon`/`VendorInvited`; expose CRM status read-service; own no RFQ/quotation/award), **DF-4** (Trust — emit performance-input events; compute no score), **DF-5** (Admin — consume `link_suggestions`; the confirmed link is an Operations column write), **DF-6** (Billing — `trade_invoices`/`payment_records` are Operations-owned inter-party records, strictly distinct from platform invoices; no funds), **DF-7** (Communication — emit events; Communication owns fan-out; author no notification contract), **DF-8** (Platform Core — consume audit/outbox/UUIDv7+human-ref/POLICY/storage; re-implement none); **`[ESC-OPS-AUDIT]`** (Doc-2 §9 additive — CRM record/note/rating/favorite, lead create/stage/activity, finance-record, generated-document grant, link-confirm column write), **`[ESC-OPS-POLICY]`** (Doc-3 §12.2 additive — no `operations` namespace registered; no tunable hardcoded), **`[ESC-OPS-SLUG]`** (Doc-2 §7 additive — only if a required action lacks a §7 slug). **Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Doc-4F.

---

## Appendix D — Cross-Reference Index (Pass-A)

| Binding point | Authoritative source (with patch ID per Doc-4A §3) |
|---|---|
| Engagement state machine | Doc-2 §3.5/§10.5 (`open → in_delivery → completed → closed`) |
| Trade-invoice / payment-record machines | Doc-2 §10.5 (`issued → partially_paid → paid/disputed/cancelled`; `recorded → confirmed`) |
| Buyer-Vendor Status machine | Doc-2 §3.5/§10.5 (`none → approved/conditional/blacklisted → cleared`; history rows) |
| Vendor-lead machine | Doc-2 §3.5/§10.5 (`received → quoted → negotiation → won/lost → follow_up`) |
| Document Template machine | Doc-2 §5.9 (`draft → active → archived`; reactivate) |
| RFQ `closed_won` trigger (engagement creation) | Doc-2 §5.4 as amended by `Doc-2_Patch_v1.0.3`; ADR-002 (1:1 award→engagement) |
| Operations entities / aggregates | Doc-2 §2 (Module 4), §3.5, §10.5 |
| Permissions | Doc-2 §7 (`can_manage_private_vendors`, `can_manage_vendor_status`, `can_manage_engagements`, `can_create_documents`, `can_approve_po`, `can_record_payments`, `can_approve_payment`, `can_manage_finance_records`, `can_manage_templates`, `can_manage_leads`) |
| Events (produced) | Doc-2 §8 operations row (`DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`) |
| Events (consumed) | Doc-2 §8 (`RFQClosedWon`, `VendorInvited` — RFQ) |
| Audit actions | Doc-2 §9 (Engagement, Documents, Buyer CRM, Financial, Admin link confirm/dismiss) |
| POLICY keys | Doc-3 §12.2 (no `operations`/`ops` namespace; `[ESC-OPS-POLICY]` carried) |
| Tenancy / non-disclosure | Doc-2 §6, §10.5, §10.11; Doc-4A §7.5 |
| Linking / Vendor Master Identity | ADR-003 (link-not-merge); Architecture Patch v1.0.1 PATCH-05 (logical), PATCH-02 (private-vendor claim-lifecycle scope; favorites = Operations) |
| Standards / templates | Doc-4A v1.0 §4/§4.4/§4B/§5/§6/§6B/§7/§8/§11/§12/§13/§14/§16/§17/§21 |
| Consumed services | Doc-4B (audit/outbox/UUIDv7/human-ref/POLICY/flags/storage), Doc-4C (`check_permission`/delegation), Doc-4D (public vendor profile), Doc-4E (`RFQClosedWon`/`VendorInvited`) |

---

*End of Doc-4F — Business Operations Engine — Content Pass-A v1.0. Authored against `Doc-4F_Structure_v1.0_FROZEN.md` (sole structure authority; §F1–§F15). Module 4 (`operations` schema, `ops_` namespace) decomposes into 5 bounded contexts (BC-OPS-1 Buyer Private CRM · BC-OPS-2 Engagement & Commercial Documents · BC-OPS-3 Vendor Lead Pipeline · BC-OPS-4 Document Generation & Templates · BC-OPS-5 Finance Records) owning 7 aggregates (Doc-2 §2), each in exactly one context. Every contract bound by pointer to the frozen corpus; no entity, state, transition, permission slug, event, audit action, POLICY key, or template invented. Consumed events `RFQClosedWon`/`VendorInvited` (RFQ); produced events `DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded` (Trust). Carried dependencies DF-1…DF-8, `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` carried unchanged via their named channels. The post-award seam and all frozen ownership boundaries (RFQ matching/award, Marketplace vendor data, Trust scores, Identity orgs, Billing platform invoices) are preserved; Operations owns only post-award business execution. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Authorized next stage after Hard Review → Pass-A Patch → Patch Verification: Doc-4F Pass-B.*
