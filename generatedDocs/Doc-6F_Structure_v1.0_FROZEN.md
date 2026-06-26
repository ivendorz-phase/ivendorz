# Doc-6F — M4 Business Operations (`operations`) Schema Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the `operations` schema realization |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6F_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied, 2 MAJOR + 2 MINOR + 1 NIT; history retained there). Certified by `Doc-6F_Structure_Freeze_Audit_v1.0.md` |
| Module | **M4 — Business Operations** (`operations` schema). The **private Vendor CRM (the blacklist's owning side — non-disclosure #11)** + **two-sided engagement (party-column RLS)** + **money-record boundary (no funds custody)** + post-award documents |
| Realizes | **Doc-2 §10.5** — **19 tables / 6 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4F (consumed); Doc-3 v1.4 (`operations.*` POLICY — registered, 2 keys); Doc-6B (`core`); Doc-6C/6D/6E (UUID + event/service); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.4), Doc-4A v1.0, Doc-4F v1.0 (FROZEN), Doc-4L/4M, Doc-6A/6B/6C/6D/6E v1.0 (FROZEN) |
| Contains | Structure only — section map, 19-table partition, ratified decisions (OP-CR1–CR12), non-disclosure + two-sided-party RLS model, state machines, money-boundary firewall, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Invariant #11** — the blacklist `buyer_vendor_statuses` **lives here**; served to M3 routing **only** via CRM service. **Governance signal #5** (Buyer Vendor Status) **never mutates platform scores**. **Platform never handles buyer↔vendor money** (`trade_invoices`/`payment_records` = records; ≠ `billing.platform_invoices`). RLS = backstop |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.5 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions ratified at structure freeze (OP-CR-set)

- **OP-CR1 — 19 tables / 6 groupings (Doc-2 §10.5), coin nothing.** Private CRM (`private_vendor_records`+`notes`/`ratings`) · Relationship (`buyer_supplier_relationships`+`buyer_vendor_statuses`/`vendor_favorites`) · Engagement (`engagements`+`lois`/`purchase_orders`/`challans`/`work_completion_certificates`/`trade_invoices`/`payment_records`) · Finance (`finance_records`) · Templates (`document_templates`+`template_versions`/`generated_documents`) · Leads (`vendor_leads`+`lead_activities`). *(§10.5's lois/po/challan/wcc row = 4 tables.)* A 20th is non-conformant.
- **OP-CR2 — Non-disclosure: the OWNING side (Invariant #11; signal #5).** `buyer_vendor_statuses` (**blacklist**) + `private_vendor_records`/`notes`/`ratings` + `finance_records` are **strictly buyer-private** (`organization_id` tenant; **never** vendor-readable; **never** in any vendor-facing surface). Served to M3 routing **only via the CRM service**. `buyer_vendor_statuses` **NO SD** — set/cleared history; current = `effective_to IS NULL`. **Never mutates platform-wide scores** (firewall).
- **OP-CR3 — Two-sided engagement RLS via PARTY COLUMNS (Doc-2 §6).** `engagements` + post-award docs shared via `buyer_organization_id` + `vendor_controlling_org_id`; RLS = `active_org IN (buyer_organization_id, vendor_controlling_org_id)` OR admin. M3 used materialized grant rows; M4 uses **named party columns** — both intra-schema, never cross-schema traversal.
- **OP-CR4 — Money-record boundary: no funds custody.** `trade_invoices` + `payment_records` = **records only** (amount/currency/status); no settlement/escrow/wallet. `trade_invoices` **≠ `billing.platform_invoices`** (firewall: buyer↔vendor document vs platform's own revenue). `payment_records` = a record of an off-platform payment.
- **OP-CR5 — Versioned post-award documents (Doc-2 §10.11 #6).** `lois`/`purchase_orders`/`challans`/`work_completion_certificates`/`trade_invoices`/`generated_documents`/`template_versions` versioned, never overwritten; **column-scoped immutability** (only `is_active_revision` toggles) via `core.raise_immutable_violation` (Doc-6D `spec_documents` pattern); `template_versions` fully immutable.
- **OP-CR6 — `human_ref` carriers.** `engagements` (`human_ref`); `lois`/`purchase_orders`/`challans`/`work_completion_certificates` + `generated_documents` (`DOC-…`); `trade_invoices` (`INV-…`) via `core.allocate_human_ref` (Doc-2 §0.1/§10.5 prefixes).
- **OP-CR7 — State machines.** `engagements.status`(open/in_delivery/completed/closed) · `document_templates.status` §5.9(draft/active/archived) · `trade_invoices.status`(issued/partially_paid/paid/disputed/cancelled) · `payment_records.status`(recorded/confirmed) · `buyer_vendor_statuses.status`(approved/conditional/blacklisted) · `vendor_leads.stage`(received/quoted/negotiation/won/lost/follow_up) · `private_vendor_records.link_status`(none/suggested/linked). enum + CHECK; service/event; `engagements` on M3 award; `vendor_leads` on `VendorInvited`.
- **OP-CR8 — Cross-module bare-UUID; in-module FKs (Doc-2 §0.3).** Bare UUID: `vendor_profile_id`/`linked_vendor_profile_id`(M2), `rfq_id`/`invitation_id`(M3), `organization_id`/`buyer_organization_id`/`vendor_controlling_org_id`/user-ids(M1), `source_entity_id`(polymorphic). In-module FKs: notes/ratings→`private_vendor_records`; statuses/favorites→`buyer_supplier_relationships`; post-award docs→`engagements`; payment_records→`trade_invoices`(optional); template_versions/generated_documents→`document_templates`/`template_versions`; lead_activities→`vendor_leads`.
- **OP-CR9 — Private Vendor link lifecycle (DD-ADMIN).** `link_status`/`link_confidence`/`linked_at`/`link_confirmed_by` + `linked_vendor_profile_id`(nullable→M2). **Admin (M8) suggests** (`admin.link_suggestions`); **Operations service confirms** (writes link columns); never vendor-visible.
- **OP-CR10 — POLICY: registered (Doc-3 v1.4); `[ESC-6-POLICY]` CLEARED.** 2 `operations.*` keys; read from `core.system_configuration`, never literals.
- **OP-CR11 — Governance-signal firewall (Invariant #6/#11).** Buyer Vendor Status + private ratings/favorites **never** mutate platform Trust/Performance/Tier; M4 writes no M5 table. Buyer feedback that feeds performance flows via the M5 event consumer (DD-TRUST), in M5's schema.
- **OP-CR12 — Indexing + carried DD.** Cursor sort-key indexes (Band H); party-column indexes; partial `WHERE deleted_at IS NULL`; `buyer_supplier_relationships` partial-unique; current-status index `WHERE effective_to IS NULL`. Carried: DD-MKT/RFQ/TRUST/ADMIN, **`[ESC-OPS-AUDIT]`**.

## The `operations` schema partition (the structural spine)

| Doc-2 §10.5 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `private_vendor_records` | Private CRM | buyer `organization_id` — **never disclosed** | YES | `link_status` | §3.1 |
| `private_vendor_notes` · `private_vendor_ratings` | ↳ | buyer — private | YES | — | §3.1 |
| `buyer_supplier_relationships` | Relationship | buyer `organization_id` | YES | — | §3.2 |
| `buyer_vendor_statuses` **(blacklist)** | ↳ | buyer — **non-disclosure** | NO (set/cleared) | `status` | §3.2 |
| `vendor_favorites` | ↳ | buyer — private | YES | — | §3.2 |
| `engagements` | Engagement | **two-sided** (party columns) | YES (close/archive) | `status` | §3.3 |
| `lois`·`purchase_orders`·`challans`·`work_completion_certificates` | ↳ | two-sided | NO (versioned) | `is_active_revision` | §3.3 |
| `trade_invoices` | ↳ | two-sided | NO (versioned; status) | `status` | §3.3 |
| `payment_records` | ↳ | two-sided — **records only** | NO | `status` | §3.3 |
| `finance_records` | Finance | buyer `organization_id` | YES | `record_type` | §3.4 |
| `document_templates` | Templates | `organization_id` | YES (archive) | **§5.9** | §3.5 |
| `template_versions` | ↳ | `organization_id` | NO (immutable) | — | §3.5 |
| `generated_documents` | ↳ | `organization_id` (+ counterparty grant) | NO (versioned) | — | §3.5 |
| `vendor_leads` | Leads | vendor `controlling_organization_id` | YES | `stage` | §3.6 |
| `lead_activities` | ↳ | vendor `controlling_organization_id` | NO (append-only) | — | §3.6 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4F → Doc-6A → Doc-6B/6C/6D/6E → **Doc-6F** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried: DD-MKT/RFQ/TRUST/ADMIN, `[ESC-OPS-AUDIT]`; `[ESC-6-POLICY]` CLEARED (v1.4). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.5`; `Doc-4F §F0`.

## §1 — Scope & the `operations` Table Partition
Governs 19 tables / not (vendor profile/scores = M2/M5; matching/routing = M3; platform billing = M7; ban authority = M8 — by UUID/event/service). The non-disclosure owning side (#11), the money-boundary, the two-sided engagement. **Deps:** `Doc-2 §2/§10.5`; `Doc-4F §F2`; `Doc-6A §1`.

## §2 — Tenancy & RLS Realization Model *(load-bearing — non-disclosure + two-sided)*
Three classes: **buyer-private** (`organization_id`; CRM/blacklist/finance/templates — never disclosed, never vendor-readable); **two-sided shared** (party columns `active_org IN (buyer_organization_id, vendor_controlling_org_id)`); **vendor-side** (`vendor_leads` `controlling_organization_id`). Non-disclosure byte-equivalence (Invariant #11) in-scope; no vendor-facing surface exposes a buyer's status/exclusion. RLS = backstop; authz app-layer (Doc-4F). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.5/§10.11`; `Doc-6A §4`; `Doc-4F`.

## §3 — Per-Aggregate Realization
§3.1 Private CRM (link lifecycle; never disclosed) · §3.2 Relationship (**blacklist** set/cleared history; firewall) · §3.3 Engagement + post-award docs (two-sided party RLS; versioned immutability; money-record boundary) · §3.4 Finance · §3.5 Templates (§5.9; immutable `template_versions`; `generated_documents` + counterparty grant) · §3.6 Leads (vendor-side; on `VendorInvited`). **Deps:** `Doc-2 §5.9/§10.5`; `Doc-4F`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization
The OP-CR7 machines; enum + CHECK; service/event transitions; `engagements` on M3 award; `vendor_leads` on `VendorInvited`; transitions → `core.outbox_events` (Doc-2 §8); `closed`→ M5 performance/public-review eligibility (consumer effect). **Deps:** `Doc-2 §5.9/§8/§10.5`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/RFQ/TRUST/ADMIN)
Bare-UUID + service + event; **money firewall** (`trade_invoices ≠ platform_invoices`; no custody); **governance firewall** (Buyer Vendor Status never mutates platform scores); buyer feedback → M5 via event (M4 writes no M5 table); link suggestions from M8. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8/§10.11`; `Doc-4F §F0`; `Doc-4L`; `Doc-6A §5.3/§5.5/§7`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H); party-column indexes (two-sided reads); partial `WHERE deleted_at IS NULL`; `buyer_supplier_relationships` partial-unique; current-status `WHERE effective_to IS NULL`; page-size via `operations.*` POLICY. **Deps:** `Doc-5F`; `Doc-6A §10/§12`; `Doc-3 v1.4`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → private CRM → relationships → engagements → post-award docs → finance → templates → generated_documents → leads → in-FKs → indexes → triggers → RLS); POLICY = Doc-3 v1.4 (CLEARED). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.4`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C non-disclosure byte-equivalence in-scope + two-sided party RLS; Band D versioned immutability; Band F money-record currency); carried register (DD-MKT/RFQ/TRUST/ADMIN, `[ESC-OPS-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.5`.

## Appendix A — Doc-6F Conformance Attestation (Doc-6A `CHK-6-001…093`)
Highlights: **Band C PASS** (non-disclosure byte-equivalence **in-scope**; two-sided party-column RLS; CHK-6-020/022/023) · Band D PASS (versioned post-award docs column-scoped; `template_versions` immutable; append-only history) · Band E PASS (CHK-6-040/041; `[ESC-OPS-AUDIT]` at 043) · Band F PASS (CHK-6-050 amount+currency on invoices/payments/finance/engagement) · CHK-6-002 PASS (multiple human_refs) · CHK-6-005 PASS (buyer_supplier partial-unique). **Deps:** `Doc-6A Appendix A`; `Doc-5F`.

---

## Open Carried Items
| ID | Item | Doc-6F handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / machines / Doc-5F persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-MKT / DD-RFQ / DD-TRUST / DD-ADMIN | vendor link / engagement-leads / feedback→performance / link suggestions | bare UUID + service + event | No |
| **Invariant #11 (non-disclosure, OWNING side)** | blacklist + private CRM never disclosed | buyer-private RLS; byte-equivalence; served to M3 via CRM service only | **Load-bearing (in-scope CHK-6-022)** |
| **Money boundary (no custody)** | `trade_invoices ≠ platform_invoices`; records only | firewall; no settlement column | **Load-bearing** |
| **`[ESC-OPS-AUDIT]`** | post-award doc audit actions vs Doc-2 §9 | bind nearest §9 by pointer; none invented | No (content: bind) |
| `[ESC-6-POLICY]` | `operations.*` keys | **CLEARED** — Doc-3 v1.4 | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5F gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`operations` table · vendor profile/scores (M2/M5) · matching/routing (M3) · platform billing (M7) · ban authority (M8) · coining any element · a cross-schema FK · cross-schema RLS traversal · **any vendor-readable buyer-status/private-CRM surface** · **any funds-custody/settlement column** · Buyer Vendor Status mutating a platform score · DDL/Prisma/migration bodies (content passes).

---

*End of Doc-6F Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes the Proposal (v0.2, 2 MAJOR + 2 MINOR + 1 NIT applied); certified by `Doc-6F_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6F realizes the 19 `operations` tables verbatim from Doc-2 §10.5 against frozen Doc-6A — the private Vendor CRM (blacklist owning side, non-disclosure #11), the two-sided engagement (party-column RLS), the money-record boundary (no funds custody); coins nothing. Carried: Invariant #11 + money boundary (load-bearing) + `[ESC-OPS-AUDIT]`. Next: content passes → Content Hard Review → Content Freeze Audit → `Doc-6F_SERIES_FROZEN`.*
