# Doc-6D — M2 Marketplace & Discovery (`marketplace`) Schema Realization — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.2 — Independent Hard Review applied** (0 BLOCKER/MAJOR/MINOR/NITPICK — clean; §Review Disposition). Freeze-ready → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Module | **Module 2 — Marketplace & Discovery** (`marketplace` schema; vendor profiles, microsites, products, categories, ads, favorites, presentation). The **first public/anonymous surface** + the **capability-matrix** + **visibility-scope** module |
| Realizes | **Doc-2 §10.3** — **21 tables** across 8 aggregates (Vendor Profile + 11 children, Category, Product, Spec Library, Microsite, Advertisement, Showcase Project, Catalog Favorite) — as physical PostgreSQL/Prisma schema + RLS + FTS, against frozen **Doc-6A** |
| Authority | **`Doc-6A_SERIES_FROZEN_v1.0` governs** (Appendix A = gate); **Doc-2 v1.0.3 = binding *what*-authority**; `Doc-4D` (M2 contract owner — consumed); `Doc-3 §12` + **v1.2 (`marketplace.*` POLICY — already registered)**; `Doc-6B` (`core` consumed); `Doc-6C` (`identity` referenced by UUID) |
| Precedent (informational) | `Doc-6B`/`Doc-6C` (per-module schema; flag-and-halt; per-pass cycle; first RLS). Force derives from Doc-6A, never from Doc-6B/6C |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.2 Marketplace), Doc-4A v1.0, Doc-4D v1.0 (FROZEN — M2 contracts), Doc-4L (event-flow), Doc-4M (state-machine index), Doc-6A v1.0 (FROZEN), Doc-6B/6C v1.0 (FROZEN — consumed/referenced) |
| Contains | Structure only — section map, the 21-table partition, ratified decisions (MK-CR-set), the tri-actor RLS + visibility model, the 2 state machines, the FTS plan, cross-module read-firewalls, carried DD-dependencies, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Audience | Architecture Board · DDD/Security Architect (the public surface) · Doc-6D content authors · AI Coding Supervisor · backend, DBA |
| Module note | The **first public read surface** (anonymous discovery). RLS is the backstop (Doc-6A §4.5); **M2 reads Trust scores, never calculates them** (Invariant #6 firewall); **M2 reflects ban/verification, never decides** (DD-1/DD-3); the RFQ engine reads only `vendor_matching_attributes` (derived) via service (DD-2) |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.3 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions proposed for ratification at structure freeze (MK-CR-set)

- **MK-CR1 — 21 tables / 8 aggregates (Doc-2 §10.3), coin nothing.** Vendor Profile (AR) + 11 children (`vendor_capacity_profiles`, `declared_financial_tiers`, `financial_tier_history`, `category_assignments`, `vendor_matching_attributes`, `vendor_ownership_history`, `vendor_claim_records`, `profile_sections`, `branding_assets`, `seo_settings`, `custom_domains`); `categories`; `products` (+ `product_spec_links`); `spec_library_entries` (+ `spec_documents`); `microsites`; `advertisements`; `showcase_projects`; `catalog_favorites`. (Doc-4D §D2 ownership.) A 22nd table is non-conformant.
- **MK-CR2 — Tri-actor tenancy + the first public surface (Doc-2 §6 — binding).** Four RLS classes: **shared / public-read** (published, non-soft-deleted, non-banned: vendor_profiles, products, categories, spec_library_entries, published profile_sections/branding/seo, microsites, advertisements (active), showcase_projects, custom_domains — public/anonymous read); **tenant-owned** (draft profile_sections/branding/seo, buyer-uploaded spec_documents (`owner_organization_id`), catalog_favorites (`organization_id`)); **platform-owned** (vendor_ownership_history, vendor_claim_records [DD-7], financial_tier_history, categories-as-reference); **derived** (vendor_matching_attributes). The three actors: **Public** (anonymous, published read), **User** (controlling-org write of own profile/children; buyer reads via the matching read-model), **Admin** (all states incl. soft-deleted). RLS is the app-layer-authz backstop (Doc-6A §4.5).
- **MK-CR3 — Visibility-scope (Invariant #3) = the publish-state mechanism; no `buyer_private` column coined.** Doc-2 §10.3 declares `vendor_profiles.visibility(public)` (a column) — there is **no `buyer_private` column** in Doc-2. The public/private split is realized as **RLS over publish-state** (`profile_sections.publish_state`, `microsites.status`, `products.status`, `advertisements.status`, etc.): **published → public-read; draft → controlling-org-only**. Soft-deleted/banned profiles are excluded from public read and from routing/search. Realize `visibility` as the Doc-2 enum; do not coin `buyer_private`.
- **MK-CR4 — Capability matrix (Invariant #1) = four booleans, not a label.** `vendor_profiles` carries `can_supply` / `can_service` / `can_fabricate` / `can_consult` as **four boolean columns** (Doc-2 §10.3) — never a single "type" label. Realize verbatim.
- **MK-CR5 — Vendor Profile state machine: two orthogonal dimensions (Doc-2 §5.3).** Two enum columns + CHECK: **`claim_state`** (`seeded|invited|claimed|verified`) + **`status`** (`active|suspended|banned`). `claimed→verified` is **Trust-event-driven** — M2 updates claim status as an **idempotent consumer of `VendorVerified`** (DD-1; **M2 reflects, never decides** verification). Ownership transfer → Trust Protection Workflow (service). Claim lifecycle applies **only** to marketplace vendor profiles (never private vendor records). Soft-deleted excluded from routing/search.
- **MK-CR6 — Advertisement state machine (Doc-2 §5.8).** `status` enum + CHECK: `draft|pending_review|scheduled|active|paused|completed|rejected`. Ad purchase = a **`billing.platform_invoice`** (DD-5; `platform_invoice_id` bare-UUID → M7); the creative/placement lifecycle is M2's. Review/approval audit actions are **`[ESC-MKT-AUDIT]`** (not separately enumerated in Doc-2 §9 — bind nearest by pointer, never coined).
- **MK-CR7 — Cross-module reads & the score firewall (Invariant #6 — binding).** M2 **reads** trust/performance scores + verified financial tier **by bare UUID, never calculates them** (M5-owned — Doc-2 boundary; "M2 may read trust scores, never calculate"). All cross-module refs are **bare UUID, no FK** (Doc-2 §0.3): `controlling_organization_id`/`claimed_by_organization_id`/`owner_organization_id` (M1), `purchaser_organization_id` (M4), `platform_invoice_id` (M7), trust/tier reads (M5). **`financial_tier_history` exclusive-writer-as-consumer:** M2 writes declared changes directly **and** writes verified changes as an **idempotent consumer of Trust's `VendorTierChanged`** event — **Trust never writes this table**. **`vendor_matching_attributes`** = a **derived read-model** (rebuilt on change events), the **only** surface the RFQ engine's matching reads — **via service** (DD-2); M2 owns no matching/routing logic.
- **MK-CR8 — Categories: platform-owned reference, admin-governed (DD-4).** `categories` = a **4-level self-referencing tree** (`parent_id` self-FK, `level 1–4` CHECK, ≤4 enforced CHECK+service; `path`); **platform-owned** (public-read, **platform-staff write** — category approval is the Admin `staff_can_manage_categories` action, but the table is M2-owned). `category_assignments` (vendor↔category; ≤10 total / ≤5 primary — service-enforced; `status proposed|active|removed`).
- **MK-CR9 — FTS = the first real search realization (Doc-6A §10.4 / R12).** `tsvector` + GIN indexes over the searchable text (`vendor_profiles.name`, `products.name`/`description`, `categories.name`) for `search_catalog` + `list_vendor_directory` (Doc-5D). **Search follows aggregate ownership** (M2 indexes only its own tables); the FTS index is a **disposable projection**, not a source of truth. Directory ranking reads `vendor_matching_attributes.trust_band`/`performance_band`. Postgres FTS now; Meilisearch future (out-of-DB — Doc-6A §12).
- **MK-CR10 — POLICY: already registered (Doc-3 v1.2); `[ESC-6-POLICY]` marketplace CLEARED (DD-6 RESOLVED).** The 2 `marketplace.*` keys (`marketplace.idempotency_dedup_window` [24h] + `marketplace.list_page_size_max` [100]) are registered (Doc-3 v1.2). **No DB-specific marketplace POLICY key beyond these** (Doc-4D — category/assignment/ad caps are service-enforced, not POLICY-on-the-wire). Reads from `core.system_configuration`, never literals. If a DB-tunable surfaces with no key → `[ESC-6-POLICY]` (none expected; no v1.x patch needed for Doc-6D).
- **MK-CR11 — `human_ref` carrier: `vendor_profiles` only.** Allocated via `core.allocate_human_ref(<entity_type>, year)` (Doc-6B — DR-6-CORE). The entity-type prefix (Doc-2 §0.1 gives no vendor example) is a **§2.5 realization choice** bound to the vendor entity (e.g. `VND`), consumed by pointer. No other marketplace table carries `human_ref`.
- **MK-CR12 — Intra-schema FKs; carried DD-dependencies.** The 21 tables carry many **intra-schema** FKs (children → `vendor_profiles`; `products`→`vendor_profiles`; `category_assignments`→`vendor_profiles`+`categories`; `categories` self-FK `parent_id`; `product_spec_links`→`products`+`spec_library_entries`; `spec_documents`→`spec_library_entries`) — all same-schema (Doc-6A §5.2). **Carried (resolved only via named channels):** DD-1 (Trust verification reflect — consume `VendorVerified`), DD-2 (matching read-model — RFQ consumes), DD-3 (ban reflect — consume `VendorBanned`), DD-4 (category approval — Admin staff), DD-5 (entitlement — Billing consume), **DD-7 `[ESC-6-DD7]`** (vendor_claim_records tenancy-class — a pre-existing Doc-2 §6-vs-§3.3 tension; interim per Doc-4D §D2: child aggregate, no org RLS anchor, RLS via the vendor profile's controlling org + admin), **`[ESC-MKT-AUDIT]`** (ad/product lifecycle audit actions not in Doc-2 §9 → Doc-2 §9 additive channel).

## The `marketplace` schema partition (the structural spine)

> **21 Doc-2 §10.3 tables**, 8 aggregates. Each realized in one §3.x. Tenancy mixed (public-read / tenant-owned-draft / platform-owned / derived); 2 state machines; 1 `human_ref` carrier; many intra-schema FKs; cross-module refs all bare-UUID.

| Doc-2 §10.3 table | Aggregate | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `vendor_profiles` | Vendor Profile (AR) | public-read / controlling-org write | YES (excl. routing/search) | **§5.3** (claim + status) | §3.1 |
| `vendor_capacity_profiles` | ↳ | public-read display / org write (1:1) | YES | simple | §3.1 |
| `declared_financial_tiers` | ↳ | public-read / org write (0..1) | YES | simple | §3.1 |
| `financial_tier_history` | ↳ | platform-owned (append-only) | NO | append-only | §3.1 |
| `category_assignments` | ↳ | public-read / org write | YES | proposed→active→removed | §3.1 |
| `vendor_matching_attributes` | ↳ | **derived** (read-model) | NO (rebuilt) | derived | §3.1 |
| `vendor_ownership_history` | ↳ | platform-owned (append-only) | NO | append-only | §3.1 |
| `vendor_claim_records` | ↳ | platform-owned **[DD-7]** | NO | seeded→invited→claimed | §3.1 |
| `profile_sections` | ↳ | draft: org / published: public | YES | draft→published | §3.4 |
| `branding_assets` | ↳ | draft: org / published: public | YES | simple | §3.4 |
| `seo_settings` | ↳ | draft: org / published: public (1:1) | YES | simple | §3.4 |
| `custom_domains` | ↳ | public; entitlement-gated (DD-5) | YES | pending→verified→active→released | §3.4 |
| `categories` | Category (AR) | platform-owned; public-read (self-FK tree) | YES (retire) | draft→active→retired | §3.2 |
| `products` | Product (AR) | public-read / org write | YES | draft→published→unpublished | §3.3 |
| `product_spec_links` | ↳ | public (N:N PK) | NO | simple | §3.3 |
| `spec_library_entries` | Spec Library (AR) | public-read / org write | YES | simple | §3.3 |
| `spec_documents` | ↳ | public OR `owner_organization_id` (buyer upload) | NO (versioned) | versioned (never overwritten) | §3.3 |
| `microsites` | Microsite (AR) | public when published | YES | draft→published→unpublished | §3.4 |
| `advertisements` | Advertisement (AR) | public when active | YES | **§5.8** | §3.5 |
| `showcase_projects` | Showcase (AR) | public-read / org write | YES | draft→published | §3.6 |
| `catalog_favorites` | Catalog Favorite (AR) | tenant-owned (`organization_id`) | YES | simple | §3.7 |

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4D → Doc-6A → Doc-6B/6C → **Doc-6D** → Code); realize-never-redecide; conform to Doc-6A + pass Appendix A; flag-and-halt. State the carried gates: `[ESC-6-DD7]` (vendor_claim_records tenancy), `[ESC-MKT-AUDIT]` (Doc-2 §9), DD-1…5 (cross-module boundaries). `[ESC-6-POLICY]` is **CLEARED** (Doc-3 v1.2).
- **Dependencies:** `Doc-6A §0/§13`; `Doc-2 §10.3`; `Doc-4D §D0/§D2`. **Detail:** short, normative.

## §1 — Scope & the `marketplace` Table Partition
- **Purpose:** what Doc-6D governs (21 tables) and not (Trust scores/verification = M5 read-only; matching/routing = M3; ban = M8; entitlement = M7; private CRM/vendor-favorites = M4 — all referenced by UUID/event, never realized here); the partition; carried DD-dependencies + `[ESC-6-*]`. **The score firewall** (Invariant #6) and **reflect-never-decide** (DD-1/DD-3) load-bearing.
- **Dependencies:** `Doc-2 §2/§3.3/§10.3`; `Doc-4D §D2`; `Doc-6A §1`. **Detail:** scope + partition + carried table.

## §2 — Tri-Actor Tenancy, Visibility & RLS Realization Model *(the load-bearing section)*
- **Purpose:** realize the first **public/anonymous** surface (Doc-2 §6 + Doc-6A §4): the four tenancy classes (MK-CR2); the **public-read RLS** (anonymous: published + non-soft-deleted + non-banned); the **controlling-org write** RLS (the vendor org owns its profile + children — anchored on the profile's `controlling_organization_id`, an M1 bare-UUID; **not** a cross-schema traversal — the org check is against the server-set active-org GUC); the **draft-vs-published** visibility split (MK-CR3); the **Admin all-states** scope; the **buyer** path (reads `vendor_matching_attributes` read-model, not the live aggregate); the platform-owned (categories admin-write; history append-only) + derived (matching attributes) postures. Non-disclosure (Invariant #11) is **N/A by ownership** (blacklist/buyer-vendor-status is M4's, never in marketplace) — assert it. RLS tests = Doc-8 (Doc-6A §11.5).
- **Dependencies:** `Doc-2 §6/§10.3`; `Doc-6A §4`; `Doc-4D` (actor model). **Detail:** tenancy classes + per-class RLS plan (public/controlling-org/admin/derived) + visibility mechanism.

## §3 — Per-Aggregate Realization
- **§3.1 Vendor Profile + 11 children** — the AR + capability matrix (4 booleans, MK-CR4), §5.3 two-dimension state (MK-CR5), `human_ref` (MK-CR11), the 1:1/0..1/append-only/derived children; `financial_tier_history` exclusive-writer-as-consumer (MK-CR7); `vendor_matching_attributes` derived read-model (MK-CR7/DD-2); `vendor_claim_records` [DD-7]; cross-module reads (score firewall). **Dependencies:** `Doc-2 §5.3/§10.3`; `Doc-4D`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3`.
- **§3.2 Category** — 4-level self-FK tree (MK-CR8); platform-owned, admin-write; public-read. **Dependencies:** `Doc-2 §10.3`; `Doc-4D` (DD-4).
- **§3.3 Product + Spec Library** — products (draft/published/unpublished), product_spec_links (N:N), spec_library_entries, spec_documents (versioned, never overwritten — Invariant #8; public OR buyer-owned). **Dependencies:** `Doc-2 §10.3`; `Doc-6A §6`.
- **§3.4 Presentation (Microsite + profile experience + custom_domains)** — Content ≠ Presentation (Invariant #9); draft-vs-published visibility (MK-CR3); custom_domains entitlement-gated (DD-5). **Dependencies:** `Doc-2 §10.3`; `Doc-4D` (DD-5).
- **§3.5 Advertisement** — §5.8 state (MK-CR6); `platform_invoice_id` bare-UUID (DD-5); `[ESC-MKT-AUDIT]`. **Dependencies:** `Doc-2 §5.8/§10.3`; `Doc-4D`.
- **§3.6 Showcase Project** — portfolio (draft→published). **§3.7 Catalog Favorite** — tenant-owned bookmarks (polymorphic target, no FK; CRM vendor-favorites are M4's, not here). **Dependencies:** `Doc-2 §10.3`.

## §4 — State Machine Realization (Doc-2 §5.3 · §5.8)
- **Purpose:** the 2 named machines (MK-CR5/CR6) — `claim_state` + `status` (vendor profile, orthogonal) + advertisement `status`, each enum + CHECK; transition split (simple → DB; Trust-event-driven `claimed→verified` + ban reflect + ownership-transfer-Trust-Protection → **service/event consumer**, DR-6-STATE); transitions → `core.outbox_events` where Doc-2 §8 declares an event (M2 emitters by pointer); reflect-never-decide (DD-1/DD-3). **Dependencies:** `Doc-2 §5.3/§5.8/§8`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-1…DD-5)
- **Purpose:** the bare-UUID read pattern (MK-CR7) + the firewalls: **score firewall** (M2 reads M5 scores, never calculates — Invariant #6); **reflect-never-decide** (verification DD-1, ban DD-3); **matching read-model** (vendor_matching_attributes the only RFQ surface, derived, service — DD-2); **financial_tier_history exclusive-writer-as-consumer** (declared direct + verified via Trust `VendorTierChanged`; Trust never writes); **entitlement** (DD-5 — ad/custom-domain gated via Billing consume). No cross-module write; no cross-schema FK/JOIN/traversal. **Dependencies:** `Doc-2 §0.3/§8`; `Doc-4D §D0` (DD-1…5); `Doc-4L`; `Doc-6A §5.3/§5.5/§7`.

## §6 — FTS, Indexing & Performance (first real search)
- **Purpose:** the FTS realization (MK-CR9 — tsvector+GIN, search-follows-ownership, disposable projection); cursor-pagination sort-key indexes for the Doc-5D lists (Band H — products/categories/ads/directory); partial indexes `WHERE deleted_at IS NULL`; the matching-attributes ranking index. Page-size bounds via `marketplace.list_page_size_max` (Doc-3 v1.2), never literal. **Dependencies:** `Doc-5D` (reads/search); `Doc-6A §10/§12`; `Doc-3 v1.2`.

## §7 — POLICY & Migration
- **Purpose:** the marketplace structural migration (forward-only, non-destructive — Doc-6A §11; order: schema → enums → categories (self-FK) → vendor_profiles → children → products/spec → presentation → ads → favorites → intra-FKs → FTS/indexes → RLS → seeds). POLICY = Doc-3 v1.2 (2 keys; **CLEARED** — no new patch). Category seed if Doc-2/Doc-4D declares a base taxonomy (by pointer; else admin-managed at runtime). **Dependencies:** `Doc-6A §9/§10/§11`; `Doc-3 v1.2`.

## §8 — Conformance & Carried Items
- **Purpose:** the Doc-6A Appendix A attestation map (Band C tri-actor/public RLS PASS; Band H FTS+pagination PASS; CHK-6-002 PASS vendor_profiles human_ref; CHK-6-091 module-owned enums); the carried register (DD-1…5, `[ESC-6-DD7]`, `[ESC-MKT-AUDIT]`); Doc-6D coins nothing; `[ESC-6-POLICY]` cleared (v1.2). **Dependencies:** `Doc-6A Appendix A`; `Doc-2 §10.3`. **Detail:** attestation map + register.

## Appendix A — Doc-6D Conformance Attestation (Doc-6A `CHK-6-xxx`)
- **Purpose:** per-check PASS / N/A-with-reason. Highlights: **Band C PASS** (first public-read + controlling-org-write + admin RLS; non-disclosure N/A by ownership); **Band H PASS** (FTS first real use + cursor indexes); CHK-6-002 PASS (vendor_profiles human_ref); CHK-6-005 PASS (partial-unique-live — slug, controlling_organization_id, custom domain); CHK-6-021 N/A (no grantee tables in M2); CHK-6-030 PASS (append-only history; versioned spec_documents; soft-delete); **CHK-6-041 PASS** (M2 emits only its Doc-2 §8 events; consumes VendorVerified/VendorBanned/VendorTierChanged — consumer effects in M2's own schema); CHK-6-091 PASS (marketplace enums module-owned). **Dependencies:** `Doc-6A Appendix A`; `Doc-5D`. **Detail:** attestation table (content pass).

---

## Open Carried Items

| ID | Item | Doc-6D handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE | `core` consumed (id/human_ref/audit/outbox/config) | by pointer (Doc-6B) | No |
| DR-6-STATE | 2 machines (§5.3/§5.8) | enum+CHECK + service/event guards | No |
| DR-6-API | Doc-5D persistable (Band H + FTS) | cross-check | No |
| DD-1 | Trust verification reflect | consume `VendorVerified`; M2 reflects, never decides; no Trust surface | No |
| DD-2 | Matching read-model | `vendor_matching_attributes` derived; RFQ consumes via service; no matching logic | No |
| DD-3 | Vendor ban reflect | consume `VendorBanned`; no ban authority | No |
| DD-4 | Category approval | M2 owns the table; Admin governs (staff_can_manage_categories) | No |
| DD-5 | Entitlement (ads/custom domains) | consume Billing entitlement; `platform_invoice_id` bare-UUID | No |
| **`[ESC-6-DD7]`** | `vendor_claim_records` tenancy-class (Doc-2 §6 platform-owned vs §3.3/§10.3 child aggregate) | **interim per Doc-4D §D2** (child aggregate; no org RLS anchor; RLS via vendor profile's controlling org + admin); resolved only via additive **Doc-2 §6/§3.3 reconciliation patch** (human-approved); never locally | Possible (carried) |
| **`[ESC-MKT-AUDIT]`** | Ad/product lifecycle audit actions not separately in Doc-2 §9 | bind nearest §9 action by pointer; additive Doc-2 §9 channel; none invented | No (content: bind by pointer) |
| `[ESC-6-POLICY]` (marketplace) | `marketplace.*` keys | **CLEARED** — Doc-3 v1.2 (2 keys); no new patch | No |
| `[ESC-6-SCHEMA]` / `[ESC-6-API]` | physical/Doc-5D gap | none expected; additive Doc-2 patch / flag-and-halt | Possible (none expected) |

## Fences / Out of scope

Any non-`marketplace` table · Trust score/verification calculation (M5 — read-only here; Invariant #6) · matching/routing/award logic (M3 — Doc-2; M2 owns only the derived read-model) · ban authority (M8) · entitlement/billing logic (M7) · private CRM / buyer-vendor-status / vendor-favorites (M4 — never in marketplace; non-disclosure) · coining any table/column/enum-value/slug/POLICY-key/state/audit-action · coining a `buyer_private` column (MK-CR3) · a cross-schema FK (cross-module = bare UUID) · cross-schema ownership traversal in RLS · Trust writing `financial_tier_history` (M2 is the exclusive writer-as-consumer) · DDL/Prisma/migration bodies (content passes).

---

## Provenance & next steps

- **Provenance:** first Doc-6D artifact. Grounded in Doc-2 §10.3 (21 tables, the *what*), Doc-6A (the *how*, FROZEN), Doc-6B/6C (consumed/referenced), Doc-4D (M2 ownership + DD-1…7). No frozen doc edited; nothing coined.
- **Status:** **PROPOSAL v0.1 — pre-review.** MK-CR1–CR12; partition = 21 tables / 8 aggregates; section map §0–§8 + Appendix A. Carried: DD-1…5, `[ESC-6-DD7]`, `[ESC-MKT-AUDIT]`; `[ESC-6-POLICY]` cleared (v1.2).
- **Next:** Independent Hard Review (v0.1 → v0.2) → Structure Freeze Audit → `Doc-6D_Structure_v1.0_FROZEN` → content passes (per-aggregate DDL/Prisma + tri-actor RLS + FTS + state machines) → Content Freeze Audit → `Doc-6D_SERIES_FROZEN`.

## Review Disposition (Independent Hard Review — Structure v0.1 → v0.2)

Reviewer: independent (Architecture Board / DDD / Security). **0 BLOCKER · 0 MAJOR · 0 MINOR · 0 NITPICK** — no defects (field-traced to Doc-2 §10.3 from the start). 15 anchors verified CORRECT: **21-table set** (Doc-2 §10.3 = Doc-4D §D2 verbatim); **capability matrix** 4 booleans (Invariant #1); **no `buyer_private`** coined (visibility = publish-state RLS); **Vendor Profile §5.3** two-dimension (claim seeded|invited|claimed|verified + status active|suspended|banned) verbatim; **Advertisement §5.8** verbatim; cross-module **bare-UUID** reads (no cross-schema FK); **`financial_tier_history` exclusive-writer-as-consumer** (Trust never writes); **`vendor_matching_attributes`** derived read-model (RFQ via service, DD-2); **categories** 4-level self-FK tree, M2-owned/Admin-governed (DD-4); **POLICY** Doc-3 v1.2 = 2 keys, `[ESC-6-POLICY]` CLEARED (no new patch); **human_ref** vendor_profiles only (prefix = §2.5); **tri-actor RLS** intra-schema GUC check (not a §6-forbidden cross-schema traversal); **DD-7 carried-not-resolved** (interim per Doc-4D §D2; escalate via Doc-2 §6/§3.3 reconciliation); **`[ESC-MKT-AUDIT]`** carried (Doc-2 §9 channel; no action coined); Appendix-A bands anticipated. **Verdict: APPROVE to Structure Freeze Audit.**

---

*End of Doc-6D Canonical Structure **Proposal v0.2** — structure only; Independent Hard Review applied (0 findings — freeze-ready). On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6D realizes the 21 `marketplace` tables verbatim from Doc-2 §10.3 against the frozen Doc-6A conventions; first public/anonymous tri-actor surface + capability matrix + visibility-scope + FTS; reads Trust scores never calculates (firewall); reflects ban/verification never decides; coins nothing. Carried: DD-7 (claim-records tenancy) + `[ESC-MKT-AUDIT]`.*
