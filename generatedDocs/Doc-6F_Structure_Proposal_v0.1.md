# Doc-6F — M4 Business Operations (`operations`) Schema Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1 → effective v0.2** — Independent Hard Review applied (2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). For Structure Freeze Audit → FROZEN |
| Module | **M4 — Business Operations** (`operations` schema). The **private Vendor CRM (the blacklist's owning side — non-disclosure invariant #11)** + the **two-sided engagement (party-column RLS)** + the **money-record boundary (no funds custody)** + post-award documents |
| Realizes | **Doc-2 §10.5** — **19 tables / 6 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4F (M4 contracts, consumed); Doc-3 v1.0.2 **+ v1.4 (`operations.*` POLICY — registered, 2 keys)**; Doc-6B (`core`); Doc-6C (`identity` UUID); Doc-6D (`marketplace` UUID); Doc-6E (`rfq` UUID + event); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.4), Doc-4A v1.0, Doc-4F v1.0 (FROZEN), Doc-4L/4M, Doc-6A/6B/6C/6D/6E v1.0 (FROZEN) |
| Contains | Structure only — section map, 19-table partition, ratified decisions (OP-CR1–CR12), non-disclosure + two-sided-party RLS model, state machines, money-boundary firewall, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Invariant #11** (private exclusion stays private, forever — **the blacklist `buyer_vendor_statuses` LIVES here**; served to M3 routing **only** via CRM service). **Governance signal #5** (Buyer Vendor Status, private to one buyer) — **never mutates platform-wide scores** (firewall). **Platform never handles buyer↔vendor money** (`trade_invoices`/`payment_records` = records only; ≠ `billing.platform_invoices`). RLS = backstop (Doc-6A §4.5) |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.5 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions proposed at structure freeze (OP-CR-set)

- **OP-CR1 — 19 tables / 6 groupings (Doc-2 §10.5), coin nothing.** Private Vendor CRM (`private_vendor_records` +`notes`/`ratings`) · Buyer-Supplier Relationship (`buyer_supplier_relationships` +`buyer_vendor_statuses`/`vendor_favorites`) · Engagement (`engagements` +`lois`/`purchase_orders`/`challans`/`work_completion_certificates`/`trade_invoices`/`payment_records`) · Finance (`finance_records`) · Document Templates (`document_templates` +`template_versions`/`generated_documents`) · Vendor Leads (`vendor_leads` +`lead_activities`). *(The §10.5 `lois/purchase_orders/challans/work_completion_certificates` row = 4 distinct tables.)* A 20th table is non-conformant.
- **OP-CR2 — Non-disclosure: the OWNING side (Invariant #11; governance signal #5).** `buyer_vendor_statuses` (the **blacklist**) + `private_vendor_records` ("never disclosed") are **strictly buyer-private** (`organization_id` tenant; **never** shared with the vendor side; **never** in any vendor-readable surface). Served to M3 routing **only via the CRM service** (never a table read). `buyer_vendor_statuses` **NO SD** — history rows (set/cleared); current = `effective_to IS NULL`. **Buyer Vendor Status never mutates platform-wide scores** (firewall — Invariant #6/#11).
- **OP-CR3 — Two-sided engagement RLS via PARTY COLUMNS (Doc-2 §6) — second two-sided pattern.** `engagements` + post-award docs (`lois`/`purchase_orders`/`challans`/`work_completion_certificates`/`trade_invoices`/`payment_records`) are **shared between both parties** via explicit party columns (`buyer_organization_id` + `vendor_controlling_org_id`); RLS = `active_org IN (buyer_organization_id, vendor_controlling_org_id)` OR admin. (M3 used materialized grant rows; M4 uses **named party columns** — both intra-schema, never cross-schema traversal.)
- **OP-CR4 — Money-record boundary: no funds custody (the platform never handles buyer↔vendor money).** `trade_invoices` + `payment_records` = **records only** (amount/currency/status); the platform takes **no** settlement, escrow, or wallet. `trade_invoices` **≠ `billing.platform_invoices`** (firewall: the trade invoice is the buyer↔vendor document; the platform invoice is the platform's own revenue, M7). `payment_records` "no funds custody" — a record of a payment made off-platform.
- **OP-CR5 — Versioned post-award documents (Doc-2 §10.11 #6-style).** `lois`/`purchase_orders`/`challans`/`work_completion_certificates`/`trade_invoices`/`generated_documents`/`template_versions` are **versioned, never overwritten** (`version_no`, `is_active_revision`, `revision_reason`); **column-scoped immutability** (only `is_active_revision` toggles; content frozen) via `core.raise_immutable_violation` attached with the protected columns (the Doc-6D `spec_documents` pattern). `template_versions` fully immutable.
- **OP-CR6 — `human_ref` carriers + DOC-/INV- prefixes.** `engagements` (`human_ref`), `lois`/`purchase_orders`/`challans`/`work_completion_certificates` + `generated_documents` (`DOC-…`), `trade_invoices` (`INV-…`) via `core.allocate_human_ref`. Prefixes per Doc-2 §0.1/§10.5.
- **OP-CR7 — State machines.** `engagements.status` (`open/in_delivery/completed/closed`); `document_templates.status` §5.9 (`draft/active/archived`); `trade_invoices.status` (`issued/partially_paid/paid/disputed/cancelled`); `payment_records.status` (`recorded/confirmed`); `buyer_vendor_statuses.status` (`approved/conditional/blacklisted`); `vendor_leads.stage` (`received/quoted/negotiation/won/lost/follow_up`); `private_vendor_records.link_status` (`none/suggested/linked`). enum + CHECK; transitions service/event; `engagements` created on the M3 award event; `vendor_leads` on `VendorInvited`.
- **OP-CR8 — Cross-module bare-UUID; in-module FKs (Doc-2 §0.3).** Bare UUID, no cross-schema FK: `vendor_profile_id`/`linked_vendor_profile_id` (M2), `rfq_id`/`invitation_id` (M3), `organization_id`/`buyer_organization_id`/`vendor_controlling_org_id`/user-ids (M1), `source_entity_id` (polymorphic). In-module FKs: notes/ratings→`private_vendor_records`; statuses/favorites→`buyer_supplier_relationships`; lois/po/challans/wcc/trade_invoices/payment_records→`engagements`; payment_records→`trade_invoices` (optional); template_versions/generated_documents→`document_templates`/`template_versions`; lead_activities→`vendor_leads`.
- **OP-CR9 — Private Vendor link lifecycle (DD-ADMIN).** `private_vendor_records.link_status`/`link_confidence`/`linked_at`/`link_confirmed_by` + `linked_vendor_profile_id` (nullable bare UUID → M2). **Admin (M8) suggests** (`admin.link_suggestions`); the **Operations service confirms** (writes the link columns) — M4 owns the private record; M8 owns the suggestion; **never vendor-visible**.
- **OP-CR10 — POLICY: registered (Doc-3 v1.4); `[ESC-6-POLICY]` CLEARED.** 2 `operations.*` keys (`idempotency_dedup_window`, `list_page_size_max`) — read from `core.system_configuration`, never literals. No new patch.
- **OP-CR11 — Governance-signal firewall (Invariant #6/#11).** Buyer Vendor Status (signal #5, private to one buyer) **never** mutates platform-wide Trust/Performance/Tier; `private_vendor_ratings` (private buyer score) **never** feeds platform scores; M4 **writes no M5 table**. Buyer feedback that *does* feed performance flows via the M5 event consumer (DD-TRUST), in M5's schema.
- **OP-CR12 — Indexing + carried DD.** Cursor sort-key indexes (Band H); partial `WHERE deleted_at IS NULL`; the `buyer_supplier_relationships` partial-unique `(organization_id, vendor_profile_id)`. Carried: DD-MKT (vendor link), DD-RFQ (engagement/leads from award/invite), DD-TRUST (feedback→performance via event), DD-ADMIN (link suggestions), **`[ESC-OPS-AUDIT]`** (post-award doc audit actions vs Doc-2 §9 — confirm at content).

## The `operations` schema partition (the structural spine)

| Doc-2 §10.5 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `private_vendor_records` | Private CRM | buyer `organization_id` — **never disclosed** | YES | `link_status` | §3.1 |
| `private_vendor_notes` · `private_vendor_ratings` | ↳ | buyer `organization_id` — private | YES | — | §3.1 |
| `buyer_supplier_relationships` | Relationship | buyer `organization_id` | YES | — | §3.2 |
| `buyer_vendor_statuses` | ↳ **(blacklist)** | buyer `organization_id` — **non-disclosure** | NO (set/cleared history) | `status` | §3.2 |
| `vendor_favorites` | ↳ | buyer `organization_id` — private | YES | — | §3.2 |
| `engagements` | Engagement | **two-sided** (party columns) | YES (close/archive) | `status` | §3.3 |
| `lois` · `purchase_orders` · `challans` · `work_completion_certificates` | ↳ | two-sided (parties) | NO (versioned) | `is_active_revision` | §3.3 |
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
Governs 19 tables / not (vendor profile = M2; matching/routing = M3; platform billing = M7; trust scores = M5; ban authority = M8 — by UUID/event/service). The non-disclosure owning side (#11), the money-boundary (no custody), the two-sided engagement. **Deps:** `Doc-2 §2/§10.5`; `Doc-4F §F2`; `Doc-6A §1`.

## §2 — Tenancy & RLS Realization Model *(load-bearing — non-disclosure + two-sided)*
Three classes: **buyer-private** (`organization_id`; the CRM/blacklist/finance/templates — **never disclosed**, **never vendor-readable**); **two-sided shared** (`engagements` + post-award docs via party columns `active_org IN (buyer_organization_id, vendor_controlling_org_id)`); **vendor-side** (`vendor_leads` `controlling_organization_id`). Non-disclosure (Invariant #11): `buyer_vendor_statuses`/`private_vendor_records` byte-equivalence — no vendor-facing surface exposes a buyer's status/exclusion. RLS = backstop; authz app-layer (Doc-4F). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.5/§10.11`; `Doc-6A §4`; `Doc-4F`.

## §3 — Per-Aggregate Realization
§3.1 Private Vendor CRM (link lifecycle; never disclosed) · §3.2 Buyer-Supplier Relationship (**blacklist** `buyer_vendor_statuses` set/cleared history; firewall) · §3.3 Engagement + post-award docs (two-sided party RLS; versioned immutability; money-record boundary) · §3.4 Finance (`finance_records`) · §3.5 Document Templates (§5.9; immutable `template_versions`; `generated_documents`) · §3.6 Vendor Leads (vendor-side; created on `VendorInvited`). **Deps:** `Doc-2 §5.9/§10.5`; `Doc-4F`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization
`engagements.status` · `document_templates.status` (§5.9) · `trade_invoices.status` · `payment_records.status` · `buyer_vendor_statuses.status` · `vendor_leads.stage` · `private_vendor_records.link_status`; enum + CHECK; service/event transitions (`engagements` on M3 award; `vendor_leads` on `VendorInvited`); transitions → `core.outbox_events` per Doc-2 §8 (`closed`→ M5 performance/public-review eligibility). **Deps:** `Doc-2 §5.9/§8/§10.5`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/RFQ/TRUST/ADMIN)
Bare-UUID + service + event: vendor profile link (M2); engagement/leads from M3 award/invite events; **buyer feedback feeds M5 performance via event** (M4 writes no M5 table); link suggestions from M8 (Operations service confirms). **Money firewall:** `trade_invoices ≠ billing.platform_invoices`; no funds custody. **Governance firewall:** Buyer Vendor Status never mutates platform scores. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8/§10.11`; `Doc-4F §F0`; `Doc-4L`; `Doc-6A §5.3/§5.5/§7`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5F lists; party-column indexes (`buyer_organization_id`, `vendor_controlling_org_id`) for two-sided reads; partial `WHERE deleted_at IS NULL`; `buyer_supplier_relationships` partial-unique; current-status index `WHERE effective_to IS NULL`; page-size via `operations.*` POLICY. **Deps:** `Doc-5F`; `Doc-6A §10/§12`; `Doc-3 v1.4`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → private CRM → relationships → engagements → post-award docs → finance → templates → generated_documents → leads → in-FKs → indexes → triggers → RLS); POLICY = Doc-3 v1.4 (CLEARED). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.4`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C non-disclosure byte-equivalence **in-scope** + two-sided party RLS; Band D versioned immutability; Band F money-record currency; CHK-6-002 multiple human_refs); carried register (DD-MKT/RFQ/TRUST/ADMIN, `[ESC-OPS-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.5`.

## Appendix A — Doc-6F Conformance Attestation map (Doc-6A `CHK-6-001…093`)
Highlights: **Band C PASS** (non-disclosure byte-equivalence **in-scope** — `buyer_vendor_statuses`/`private_vendor_records` never vendor-readable; two-sided party-column RLS; CHK-6-020/022/023) · Band D PASS (versioned post-award docs column-scoped immutability; `template_versions` immutable; `lead_activities` append-only) · Band E PASS (CHK-6-040 engagement/lead transitions+outbox; CHK-6-041 events Doc-2 §8/4L; `[ESC-OPS-AUDIT]`) · Band F PASS (CHK-6-050 `trade_invoices`/`payment_records`/`finance_records`/`engagements` amount+currency) · CHK-6-002 PASS (multiple human_refs) · CHK-6-005 PASS (`buyer_supplier_relationships` partial-unique). **Deps:** `Doc-6A Appendix A`; `Doc-5F`.

---

## Open Carried Items
| ID | Item | Doc-6F handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / machines / Doc-5F persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-MKT / DD-RFQ / DD-TRUST / DD-ADMIN | vendor link / engagement-leads from M3 / feedback→performance / link suggestions | bare UUID + service + event; no authority | No |
| **Invariant #11 (non-disclosure, OWNING side)** | blacklist + private CRM never disclosed | buyer-private RLS; byte-equivalence; served to M3 via CRM service only | **Load-bearing (in-scope CHK-6-022)** |
| **Money boundary (no custody)** | `trade_invoices ≠ platform_invoices`; records only | firewall; no settlement column | **Load-bearing** |
| **`[ESC-OPS-AUDIT]`** | post-award doc audit actions vs Doc-2 §9 | bind nearest §9 by pointer; none invented | No (content: bind) |
| `[ESC-6-POLICY]` | `operations.*` keys | **CLEARED** — Doc-3 v1.4 | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5F gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`operations` table · vendor profile/scores (M2/M5) · matching/routing (M3) · platform billing/entitlement (M7) · ban authority (M8) · coining any element · a cross-schema FK · cross-schema RLS traversal · **any vendor-readable buyer-status/private-CRM surface** · **any funds-custody/settlement column** · Buyer Vendor Status mutating a platform score · DDL/Prisma/migration bodies (content passes).

---

## Review Disposition (Independent Hard Review — Structure)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Field-traced to Doc-2 §10.5/§5.9/§10.11. Verified CORRECT: 19-table set (lois/po/challan/wcc = 4 tables; all §10.5 rows present), engagement/trade-invoice/payment/buyer-vendor-status/lead/template state sets verbatim, `buyer_supplier_relationships` partial-unique, `buyer_vendor_statuses` NO-SD set/cleared history, the money-boundary firewall (`≠ platform_invoices`), the two-sided party-column pattern, the 2 `operations.*` POLICY keys (Doc-3 v1.4), coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **OP-HR-1** non-disclosure stated for `buyer_vendor_statuses` but `private_vendor_records`/`notes`/`ratings`/`finance` byte-equivalence scope under-specified | MAJOR | **FIXED** — §2/OP-CR2: **all** buyer-private CRM + finance tables are strictly `organization_id`-tenant, **never vendor-readable**; byte-equivalence covers the whole private surface (in-scope CHK-6-022). |
| **OP-HR-2** two-sided engagement RLS could be read as a grant-row pattern (M3) rather than party columns | MAJOR | **FIXED** — OP-CR3: explicit **party columns** (`buyer_organization_id` + `vendor_controlling_org_id`); RLS = `active_org IN (…)`; distinct from M3's materialized grant rows; intra-schema. |
| **OP-HR-3** `generated_documents` "(+ counterparty grant where shared)" tenancy ambiguous | MINOR | **CONFIRMED content-detail** — §3.5: tenant `organization_id`-primary; counterparty visibility realized as a party/grant column at content (Doc-2 §10.5); flagged. |
| **OP-HR-4** post-award doc audit actions vs Doc-2 §9 | MINOR | **CONFIRMED carried** — `[ESC-OPS-AUDIT]`: bind nearest §9 by pointer; none invented. |
| **OP-HR-5** `engagements` has no §5.x machine — status inline in §10.5 | NIT | **CONFIRMED** — `status(open/in_delivery/completed/closed)` is the §10.5-declared set + the §8 event list (line 692); realized as enum + CHECK + service, no separate §5.x needed. |

**Net:** 2 MAJOR (non-disclosure scope, two-sided party-column clarity) + 2 MINOR + 1 NIT fixed/confirmed. The non-disclosure-scope finding is load-bearing — M4 is the blacklist's owning side. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6F Structure Proposal v0.1 (effective v0.2 — Independent Hard Review applied). For Structure Freeze Audit → FROZEN. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6F realizes the 19 `operations` tables verbatim from Doc-2 §10.5 against frozen Doc-6A — the private Vendor CRM (blacklist owning side, non-disclosure #11), the two-sided engagement (party-column RLS), the money-record boundary (no funds custody); coins nothing. Next: Structure Freeze Audit.*
