# Doc-6D — M2 Marketplace & Discovery (`marketplace`) Schema Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the `marketplace` schema realization |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6D_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied, 0 findings; history retained there). Certified by `Doc-6D_Structure_Freeze_Audit_v1.0.md` |
| Module | **M2 — Marketplace & Discovery** (`marketplace` schema). The **first public/anonymous tri-actor surface** + capability-matrix + visibility-scope module |
| Realizes | **Doc-2 §10.3** — **21 tables / 8 aggregates** as PostgreSQL DDL + Prisma + RLS + FTS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4D (M2 contracts, consumed); Doc-3 v1.2 (`marketplace.*` POLICY — registered); Doc-6B (`core` consumed); Doc-6C (`identity` referenced by UUID); Doc-4L/4M (events/state) |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.2), Doc-4A v1.0, Doc-4D v1.0 (FROZEN), Doc-4L/4M v1.0, Doc-6A v1.0 (FROZEN), Doc-6B/6C v1.0 (FROZEN) |
| Contains | Structure only — section map, 21-table partition, ratified decisions (MK-CR1–CR12), tri-actor RLS + visibility model, 2 state machines, FTS plan, cross-module read-firewalls, carried DD-dependencies, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | First public read surface (anonymous). RLS = backstop (Doc-6A §4.5). **M2 reads Trust scores, never calculates** (Invariant #6). **M2 reflects ban/verification, never decides** (DD-1/DD-3). RFQ reads only `vendor_matching_attributes` (derived) via service (DD-2) |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.3 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions ratified at structure freeze (MK-CR-set)

- **MK-CR1 — 21 tables / 8 aggregates (Doc-2 §10.3), coin nothing.** Vendor Profile (AR) + 11 children + `categories` + `products`(+`product_spec_links`) + `spec_library_entries`(+`spec_documents`) + `microsites` + `advertisements` + `showcase_projects` + `catalog_favorites` (Doc-4D §D2). A 22nd table is non-conformant.
- **MK-CR2 — Tri-actor tenancy + the first public surface (Doc-2 §6).** Four RLS classes: shared/public-read (published, non-soft-deleted, non-banned), tenant-owned (draft presentation, buyer-uploaded spec_documents, catalog_favorites), platform-owned (ownership/claim/tier history, categories), derived (vendor_matching_attributes). Actors: Public (anonymous published read), User (controlling-org write; buyer reads via matching read-model), Admin (all states). RLS = backstop (Doc-6A §4.5).
- **MK-CR3 — Visibility-scope (Invariant #3) = publish-state RLS; no `buyer_private` column coined.** Doc-2 §10.3 declares `vendor_profiles.visibility(public)` (a column); **no `buyer_private` column exists in Doc-2**. Realize public/private as RLS over publish-state (published → public-read; draft → controlling-org-only); soft-deleted/banned excluded from public + routing/search.
- **MK-CR4 — Capability matrix (Invariant #1) = four booleans, not a label.** `can_supply`/`can_service`/`can_fabricate`/`can_consult` on `vendor_profiles` (Doc-2 §10.3), verbatim.
- **MK-CR5 — Vendor Profile state machine: two orthogonal dimensions (Doc-2 §5.3).** `claim_state` (`seeded|invited|claimed|verified`) + `status` (`active|suspended|banned`), enum + CHECK. `claimed→verified` Trust-event-driven (idempotent consumer of `VendorVerified` — DD-1; **reflect, never decide**); ownership transfer → Trust Protection Workflow (service); soft-deleted excluded from routing/search.
- **MK-CR6 — Advertisement state machine (Doc-2 §5.8).** `status` enum + CHECK: `draft|pending_review|scheduled|active|paused|completed|rejected`. Ad purchase = `billing.platform_invoice` (DD-5; `platform_invoice_id` bare-UUID → M7); review/approval audit = `[ESC-MKT-AUDIT]` (Doc-2 §9 channel; none invented).
- **MK-CR7 — Cross-module reads & the score firewall (Invariant #6).** M2 **reads** trust/performance scores + verified tier by **bare UUID, never calculates** (M5-owned). All cross-module refs bare-UUID, no FK (Doc-2 §0.3): `controlling_/claimed_by_/owner_organization_id` (M1), `purchaser_organization_id` (M4), `platform_invoice_id` (M7), trust reads (M5). **`financial_tier_history` exclusive-writer-as-consumer:** M2 writes declared direct + verified as idempotent consumer of Trust's `VendorTierChanged`; **Trust never writes this table**. **`vendor_matching_attributes`** = derived read-model (rebuilt on events); the only RFQ matching surface, via service (DD-2); M2 owns no matching logic.
- **MK-CR8 — Categories: platform-owned reference, admin-governed (DD-4).** 4-level self-FK tree (`parent_id` self-FK, `level 1–4` CHECK, `path`); public-read, platform-staff write (`staff_can_manage_categories`); `category_assignments` (≤10 / ≤5 primary, service; `status proposed|active|removed`).
- **MK-CR9 — FTS = first real search (Doc-6A §10.4/R12).** `tsvector`+GIN over `vendor_profiles.name`, `products.name`/`description`, `categories.name` (`search_catalog` + `list_vendor_directory`); search-follows-ownership; disposable projection; directory ranking via `vendor_matching_attributes.trust_band`/`performance_band`. FTS now; Meilisearch future (out-of-DB).
- **MK-CR10 — POLICY: registered (Doc-3 v1.2); `[ESC-6-POLICY]` CLEARED (DD-6 RESOLVED).** 2 keys (`marketplace.idempotency_dedup_window` [24h] + `marketplace.list_page_size_max` [100]); no DB-specific key beyond these; read from `core.system_configuration`, never literal. No new patch.
- **MK-CR11 — `human_ref` carrier: `vendor_profiles` only.** Via `core.allocate_human_ref(<entity_type>, year)` (Doc-6B); the entity-type prefix is a §2.5 choice (Doc-2 §0.1 gives no vendor example). No other marketplace table.
- **MK-CR12 — Intra-schema FKs; carried DD-dependencies.** Many intra-schema FKs (children→vendor_profiles; products→vendor_profiles; assignments→vendor_profiles+categories; categories self-FK; product_spec_links→products+spec; spec_documents→spec_library_entries). Carried: DD-1 (verification reflect), DD-2 (matching read-model), DD-3 (ban reflect), DD-4 (category Admin), DD-5 (entitlement Billing), **`[ESC-6-DD7]`** (vendor_claim_records tenancy — Doc-2 §6 vs §3.3 tension; interim per Doc-4D §D2; escalate via additive Doc-2 §6/§3.3 reconciliation), **`[ESC-MKT-AUDIT]`** (ad/product audit actions not in Doc-2 §9 → Doc-2 §9 channel).

## The `marketplace` schema partition (the structural spine)

| Doc-2 §10.3 table | Aggregate | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `vendor_profiles` | Vendor Profile (AR) | public-read / controlling-org write | YES | **§5.3** | §3.1 |
| `vendor_capacity_profiles` · `declared_financial_tiers` · `category_assignments` | ↳ | public-read / org write | YES | simple/assign | §3.1 |
| `financial_tier_history` · `vendor_ownership_history` | ↳ | platform-owned | NO | append-only | §3.1 |
| `vendor_matching_attributes` | ↳ | derived (read-model) | NO | derived | §3.1 |
| `vendor_claim_records` | ↳ | platform-owned **[DD-7]** | NO | seeded→invited→claimed | §3.1 |
| `profile_sections` · `branding_assets` · `seo_settings` · `custom_domains` | ↳ | draft: org / published: public | YES | draft→published / domain | §3.4 |
| `categories` | Category (AR) | platform-owned; public-read (self-FK tree) | YES | draft→active→retired | §3.2 |
| `products` · `product_spec_links` | Product (AR) | public-read / org write | YES/NO | draft→published→unpublished | §3.3 |
| `spec_library_entries` · `spec_documents` | Spec Library (AR) | public-read / org write; buyer-upload `owner_organization_id` | YES/NO (versioned) | simple / versioned | §3.3 |
| `microsites` | Microsite (AR) | public when published | YES | draft→published→unpublished | §3.4 |
| `advertisements` | Advertisement (AR) | public when active | YES | **§5.8** | §3.5 |
| `showcase_projects` | Showcase (AR) | public-read / org write | YES | draft→published | §3.6 |
| `catalog_favorites` | Catalog Favorite (AR) | tenant-owned (`organization_id`) | YES | simple | §3.7 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4D → Doc-6A → Doc-6B/6C → **Doc-6D** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried gates: `[ESC-6-DD7]`, `[ESC-MKT-AUDIT]`, DD-1…5; `[ESC-6-POLICY]` CLEARED (v1.2). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.3`; `Doc-4D §D0/§D2`.

## §1 — Scope & the `marketplace` Table Partition
What Doc-6D governs (21 tables) / not (Trust scores, matching/routing, ban, entitlement, private CRM — referenced by UUID/event, never realized); the partition; carried DD + `[ESC-6-*]`. Score firewall + reflect-never-decide load-bearing. **Deps:** `Doc-2 §2/§3.3/§10.3`; `Doc-4D §D2`; `Doc-6A §1`.

## §2 — Tri-Actor Tenancy, Visibility & RLS Realization Model *(load-bearing)*
The first public/anonymous surface: four tenancy classes; public-read RLS (published + non-soft-deleted + non-banned); controlling-org-write RLS (anchored on `controlling_organization_id` vs the server-set active-org GUC — **intra-schema, not a §6-forbidden traversal**); draft-vs-published visibility (MK-CR3); Admin all-states; buyer via matching read-model; platform-owned (categories admin-write; history append-only) + derived postures. Non-disclosure N/A-by-ownership (blacklist is M4's). RLS tests = Doc-8. **Deps:** `Doc-2 §6/§10.3`; `Doc-6A §4`; `Doc-4D`.

## §3 — Per-Aggregate Realization
§3.1 Vendor Profile + 11 children (capability matrix, §5.3, human_ref, children, exclusive-writer tier history, derived matching attributes, [DD-7], score firewall) · §3.2 Category (4-level tree, admin-governed) · §3.3 Product + Spec Library (versioned spec_documents) · §3.4 Presentation (Content≠Presentation; draft-vs-published; custom_domains entitlement-gated) · §3.5 Advertisement (§5.8; platform_invoice_id; [ESC-MKT-AUDIT]) · §3.6 Showcase · §3.7 Catalog Favorite (polymorphic target, no FK; CRM vendor-favorites are M4's). **Deps:** `Doc-2 §5.3/§5.8/§10.3`; `Doc-4D`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3`.

## §4 — State Machine Realization (Doc-2 §5.3 · §5.8)
The 2 machines — claim_state + status (vendor, orthogonal) + advertisement status; enum + CHECK; transition split (simple → DB; Trust-event-driven verify + ban reflect + ownership-transfer-Trust-Protection → service/event consumer, DR-6-STATE); transitions → `core.outbox_events` per Doc-2 §8; reflect-never-decide. **Deps:** `Doc-2 §5.3/§5.8/§8`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-1…DD-5)
Bare-UUID read pattern + firewalls: score firewall (Invariant #6), reflect-never-decide (DD-1/DD-3), matching read-model (DD-2), financial_tier_history exclusive-writer-as-consumer, entitlement (DD-5). No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4D §D0`; `Doc-4L`; `Doc-6A §5.3/§5.5/§7`.

## §6 — FTS, Indexing & Performance (first real search)
FTS (tsvector+GIN, search-follows-ownership, disposable projection); cursor-pagination sort-key indexes (Band H); partial indexes `WHERE deleted_at IS NULL`; matching-attributes ranking index; page-size via `marketplace.list_page_size_max`, never literal. **Deps:** `Doc-5D`; `Doc-6A §10/§12`; `Doc-3 v1.2`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → categories self-FK → vendor_profiles → children → products/spec → presentation → ads → favorites → intra-FKs → FTS/indexes → RLS → seeds); POLICY = Doc-3 v1.2 (CLEARED); category seed by pointer if declared, else admin-runtime. **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.2`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C tri-actor/public PASS; Band H FTS PASS; CHK-6-002 human_ref; CHK-6-091 module-owned enums); carried register (DD-1…5, `[ESC-6-DD7]`, `[ESC-MKT-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.3`.

## Appendix A — Doc-6D Conformance Attestation (Doc-6A `CHK-6-xxx`)
Per-check PASS / N/A-with-reason (content pass). Highlights: Band C PASS (public-read + controlling-org-write + admin; non-disclosure N/A-by-ownership) · Band H PASS (FTS first real use + cursor indexes) · CHK-6-002 PASS (vendor_profiles human_ref) · CHK-6-005 PASS (partial-unique-live slug/controlling_org/domain) · CHK-6-030 PASS (append-only history; versioned spec_documents; soft-delete) · CHK-6-041 PASS (M2 emits its §8 events; consumes VendorVerified/VendorBanned/VendorTierChanged) · CHK-6-091 PASS (enums module-owned). **Deps:** `Doc-6A Appendix A`; `Doc-5D`.

---

## Open Carried Items
| ID | Item | Doc-6D handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / 2 machines / Doc-5D persistable | by pointer / enum+CHECK+service / Band H+FTS | No |
| DD-1…DD-5 | Trust reflect / matching read-model / ban reflect / category Admin / entitlement Billing | consume events / derived / no authority | No |
| **`[ESC-6-DD7]`** | vendor_claim_records tenancy-class (Doc-2 §6 vs §3.3) | interim per Doc-4D §D2 (child aggregate; no org anchor; RLS via controlling org + admin); additive Doc-2 §6/§3.3 reconciliation (human-approved); never local | Possible (carried) |
| **`[ESC-MKT-AUDIT]`** | ad/product audit actions not in Doc-2 §9 | bind nearest §9 by pointer; additive Doc-2 §9; none invented | No (content: bind) |
| `[ESC-6-POLICY]` | `marketplace.*` keys | **CLEARED** — Doc-3 v1.2 | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5D gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`marketplace` table · Trust score/verification calculation (M5 read-only; Invariant #6) · matching/routing/award logic (M3) · ban authority (M8) · entitlement/billing logic (M7) · private CRM / buyer-vendor-status / vendor-favorites (M4; non-disclosure) · coining any element · coining a `buyer_private` column · a cross-schema FK · cross-schema RLS traversal · Trust writing `financial_tier_history` · resolving DD-7 locally · DDL/Prisma/migration bodies (content passes).

---

*End of Doc-6D Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes the Proposal (v0.2, 0 findings); certified by `Doc-6D_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6D realizes the 21 `marketplace` tables verbatim from Doc-2 §10.3 against frozen Doc-6A; first public/anonymous tri-actor surface + capability matrix + visibility-scope + FTS; reads Trust scores never calculates; reflects ban/verification never decides; coins nothing. Carried: DD-7 (claim-records tenancy) + `[ESC-MKT-AUDIT]`. Next: content passes → Content Freeze Audit → `Doc-6D_SERIES_FROZEN`.*
