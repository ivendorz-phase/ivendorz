# iVendorz Search System — Planning & Design

**Status:** **v1.0 — PLANNING FREEZE (Board-approved 2026-07-09)** — authoritative *planning
baseline* for search implementation work. Changes from here require an **additive patch +
version bump** — no in-place edits. Implementation remains unauthorized until scheduled through
the normal wave/roadmap process; see the Board Decision (§16).
**Date:** 2026-07-09
**Lane:** Product design / UX architecture / information architecture
**Revision v0.2 (2026-07-09):** Board review PASS WITH PATCH folded — adds §13 **Search
Governance & Knowledge Asset Management (ISKB)** (asset lifecycle, versioning/rollback, audit
binding, analytics ownership, KPIs, curation workflow, priority tiers); ESC-SRCH-05 carries the
Board's M1-ownership recommendation; adjudication record in §15. No other section's substance
changed.
**Revision v0.3 (2026-07-09):** Board pre-freeze recommendation folded — adds §13.10 **Search
Evolution Policy** (five backward-compatibility rules: URLs · saved searches · semantic
versioning · no silent dictionary edits · no page changes for existing flows). Additive only.
**Revision v1.0 (2026-07-09):** **PLANNING FREEZE** — Board approval recorded in §16;
ESC-SRCH-04/05 reclassified as implementation-time architectural dependencies (non-blocking for
this freeze). No design content changed.
**Authority:** NON-AUTHORITATIVE under the frozen corpus. Every entity, contract, page ID, and
POLICY key referenced here is **bound by pointer** to its frozen owner; this document coins
nothing authoritative. On any conflict, the frozen document wins (CLAUDE.md §7).

> **What this is:** the complete search *experience* design for iVendorz — information
> architecture, user journeys, component and screen inventories, ranking and intelligence
> strategy, filter architecture, and UX guidelines across desktop / tablet / mobile.
>
> **What this is not:** an implementation plan, a database design, or a search-engine
> technology selection. Engine choice is already governed (CLAUDE.md §2: "Postgres FTS now;
> Meilisearch future") and is deliberately **out of scope** here.

**Frozen anchors (reference, never restate):**

| Anchor | Owner | Pointer |
|---|---|---|
| `search_catalog` (the ONE public catalog read; query + facets, vendor-scopable) | M2 | Doc-4D series (FROZEN) |
| Vendor directory read (`list_vendor_directory`) | M2 | Doc-4D series (FROZEN) |
| Public vendor profile read (`get_public_vendor_profile`) | M2 | Doc-4D series (FROZEN) |
| Public product detail (`get_public_product_detail.v1`, ADR-025 URL law) | M2 | Doc-4D Patch v1.0.3 / ADR-025 |
| Category taxonomy (794-node tree, 751-row mapping) | M2 data / M8 curation | Taxonomy Content v1.0 (Board-amended) |
| Explorer / Mega Menu | Doc-7 kit | `docs/product/navigation/MEGA_MENU_*.md` (approved), IA §5.3 |
| Soft-deleted / banned vendors excluded from routing & search | M2 | Doc-2 §5.3 / Doc-6D MK-CR3, MK-CR5 |
| Existing search pages (P-SH-01, P-PUB-07…10, P-PUB-19, P-BUY-02 …) | FE page universe (151) | `docs/product/ux/page_inventory.md` |
| Search infra follows aggregate ownership | Structural Constitution | `REPOSITORY_STRUCTURE.md` binding layer rules |
| RFQ routing/matching/sorting control plane | M3 | Doc-4E / Doc-3 |
| Trust/Performance display rules | Board ruling 2026-07-03 | Trust Score display ruling |

---

## 0. Governance Frame (binding on every section below)

Search is a **presentation and query-understanding layer over frozen module reads**. It never
becomes a module, never owns authoritative data, and never re-ranks another module's decisions.

- **G-1 · Search follows aggregate ownership.** Product/vendor/category/brand search indexes
  belong to M2; RFQ search to M3; private CRM vendor search to M4; platform-invoice search to
  M7; admin queues to M8. "Global search" is a *composed presentation surface* calling each
  owner's contract — it owns no index of its own truth.
- **G-2 · Search results are disposable projections** (read-models), never source of truth.
- **G-3 · Discovery ranking ≠ RFQ matching.** The M3 matching/routing engine is the moat and is
  governed separately (Doc-4E control plane). Nothing in this document touches it. P-SH-01's
  frozen note applies platform-wide: *presentation never re-ranks M3*.
- **G-4 · Firewalled signals (Invariant #6).** No single governance signal dominates a search
  ranking; Financial Tier and Subscription Plan never boost organic relevance; Buyer
  Approved/Blacklisted never leaks into any shared surface.
- **G-5 · Private exclusion stays private (Invariant #11).** No search behavior — including
  no-result recovery, suggestion, or count — may make a blacklist detectable.
- **G-6 · Paid visibility is labeled, never blended.** Sponsored placements (M2 ads / M7 lead
  packages) render in visually distinct, labeled slots. Organic rank is incorruptible.
- **G-7 · Tenant boundary.** RFQ, CRM, engagement-document, and message search are org-scoped
  behind server-validated org context. Public search surfaces expose only published, active,
  non-banned content.
- **G-8 · AI suggests; modules decide (Invariant #12).** Every intelligence asset in §6
  (synonyms, acronyms, transliteration, equivalence) is *curated content* with a human/M8
  approval loop; M9 may propose entries in the future, never auto-publish them.
- **G-9 · Capability is a matrix, not a label (Invariant #1).** Any "business type" facet is
  expressed through the frozen 4-flag capability matrix — see §7 and ESC-SRCH-02.
- **G-10 · New page IDs are Board-only.** This design deliberately lands on **net 0 new pages**
  (§4); anything that later demands a new ID goes to the Board first.

---

## 1. Search Information Architecture

### 1.1 The two-layer model

iVendorz search has exactly two layers, and keeping them distinct is the core IA decision:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — UNIVERSAL SEARCH (one box, everywhere)               │
│  Global header search: understands intent, classifies the       │
│  query, previews across entity types, and HANDS OFF to the      │
│  right scoped surface. It answers "where should I go?"          │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2 — SCOPED SEARCH (one owner, one surface)               │
│  Catalog search · Vendor directory · Category/Industry browse   │
│  · RFQ search (org-private) · CRM vendor search (org-private)   │
│  · Admin queues. Each answers "show me everything of type X     │
│  matching Y, with facets." It answers "help me choose."         │
└─────────────────────────────────────────────────────────────────┘
```

Universal search is a **router with previews**, not a seventh database. Scoped search is where
filtering, sorting, and comparison happen. Every universal-search interaction ends in one of:
navigate directly to an entity, hand off to a scoped surface with the query carried over, or
recover (did-you-mean / browse / post-RFQ).

### 1.2 Searchable entity types

| Entity | Audience | Owner contract (pointer) | Scoped surface |
|---|---|---|---|
| **Product** | Public + all roles | M2 `search_catalog` | P-PUB-10 Catalog search · P-PUB-19 advanced |
| **Vendor / Company** | Public + all roles | M2 `list_vendor_directory` / `search_catalog` | P-PUB-12 Vendor directory · P-BUY-02 Discover vendors |
| **Service** (capability-flagged offerings) | Public + all roles | M2 `search_catalog` (capability facet) | P-PUB-10 with `can_service`/`can_fabricate`/`can_consult` facets |
| **Category / Industry** | Public + all roles | M2 taxonomy reads | P-PUB-07/08/09 + Explorer mega menu |
| **Brand** | Public + all roles | M2 catalog attribute (see ESC-SRCH-01) | P-PUB-10 brand-filtered; brand facet everywhere |
| **RFQ** (own org's; vendors: invited only) | Authenticated, org-scoped | M3 list/read contracts | Buyer RFQ list · Vendor RFQ/lead inbox (existing workspace pages) |
| **CRM vendor record** (private) | Buyer org only | M4 CRM reads | Buyer Vendor Directory (BC-OPS-1 surfaces) |
| **Admin entities** (moderation, imports, orgs) | Staff | M8 queue reads | P-ADM-* surfaces (already designed) |

**Deliberate exclusions from universal search:** messages/threads (M6 — in-context search inside
the inbox only), engagement documents (searched inside the Documents workspace), platform
invoices (M7 billing surfaces). Surfacing these in a global dropdown adds noise and privacy risk
for near-zero procurement value.

### 1.3 Query understanding pipeline (conceptual, engine-agnostic)

Every query, on every surface, passes through the same conceptual pipeline. This is an IA
contract, not an implementation:

```
raw query
  → 1 NORMALIZE      trim · case-fold · Bangla digit/unicode normalize · unit normalize
                      ("2 inch", 2", ২ ইঞ্চি → canonical)
  → 2 LANGUAGE       detect Bangla / English / mixed ("banglish") · transliterate
                      (পাম্প → pump · বেয়ারিং → bearing · স্টেইনলেস → stainless)
  → 3 EXPAND         acronyms (VFD → variable frequency drive) · synonyms (GI pipe ↔
                      galvanized iron pipe) · equivalence sets (air blower → roots/ring/
                      side-channel blower) · brand↔product graph (SKF → bearings;
                      bearing → SKF·NSK·FAG·NTN)
  → 4 CLASSIFY       intent: product | vendor | category | brand | service | RFQ-ish
                      ("need 500 cfm compressor urgent" → RFQ intent) | navigational
                      ("my quotations" → workspace shortcut)
  → 5 CORRECT        typo tolerance (comprssor → compressor · centrifigal → centrifugal
                      · bering → bearing) — correction is SUGGESTED, never silently
                      destructive when exact matches exist (§8)
  → 6 RETRIEVE+RANK  per-scope retrieval via the owning contract; rank per §5
  → 7 RECOVER        zero/thin results → did-you-mean · relaxation ladder · browse ·
                      post-RFQ (§8.4)
```

Stages 1–5 are powered by the **Search Intelligence Assets** (§6.2) — versioned, curated
vocabularies grounded in the ratified taxonomy. Stage 6 is always the owning module's contract.

### 1.4 Scope model on the results surface

Scope is a first-class, always-visible control — a tab row on the results page:

```
[ All ]  [ Products ]  [ Vendors ]  [ Services ]  [ Categories ]  [ Brands ]   (public)
… + [ My RFQs ] [ My Vendors ]                                    (authenticated, org context)
```

- "All" = the universal blended page (P-SH-01): grouped sections with per-type "See all N →".
- Each tab hands off to the scoped surface **carrying the query, filters where they translate,
  and the user's language**. Scope switching never wipes the query.
- Authenticated tabs appear only with a server-validated org context and never mix private
  results into public sections (no "3 results in your RFQs" teaser on a shared screen unless the
  section itself is clearly a private block — see §3, SRCH-C-10).

---

## 2. Search User Journeys

Personas (from the ratified journey atlas; pointers, not re-coins): **Procurement Officer**
(buyer org, deadline-driven, knows spec language), **Plant Engineer** (knows the part, often by
brand or acronym), **Owner/Director** (evaluates vendors, trust-first), **Vendor Sales**
(monitors RFQs/leads), **Guest** (pre-signup discovery, SEO entry).

### J-SRCH-A · "I know what I need" (spec-driven product search)

Procurement officer types `comprssor 500 cfm` in the global header.

1. **Type** — autocomplete corrects silently in suggestions ("compressor" group appears; the
   typo'd literal stays available). Suggestion groups: query completions, matching categories,
   matching brands, top products, top vendors.
2. **Understand** — intent classifier reads "500 cfm" as a spec attribute; the intelligence
   layer expands *compressor* to its category cluster (air/rotary-screw/reciprocating/oil-free/
   parts — per the taxonomy tree, §6.3).
3. **Land** — Enter → P-PUB-10 Catalog search results, query carried, category cluster shown as
   **scoping chips** ("Did you mean within: Air Compressors · Compressor Parts · …"), facet rail
   pre-populated.
4. **Refine** — facets: category, capability, division/district, verified, brand, price band.
5. **Act** — product detail → vendor microsite → **Request Quote / Add to RFQ** (the platform's
   #1 conversion; every product result carries the RFQ affordance).

### J-SRCH-B · "Find me someone who can do X" (vendor/service discovery)

Owner searches `ss pipe fabrication chittagong`.

1. Intent classifier: *service + location*. `ss` expands to *stainless steel* (synonym asset);
   "fabrication" maps to the `can_fabricate` capability flag; "Chittagong" resolves to the
   Chattogram division/district gazetteer entry (both spellings).
2. Universal dropdown shows a **Vendors** group first (intent-ordered, §5.4) with capability and
   location context visible on each row.
3. Hand-off to the Vendor Directory scoped surface, capability + district facets pre-applied.
4. Vendor cards show the trust band + numeric score, verified badge, capability matrix chips,
   and location — never a formula, rank explanation, or percentile (Board display ruling).
5. Act: view microsite → contact / invite to RFQ.

### J-SRCH-C · Brand-led search

Engineer searches `SKF`.

1. Brand↔product graph fires both ways: the **Brand entity card** (SKF) leads, followed by
   *product types under this brand* (bearings, seals…) and *vendors carrying this brand*.
2. Reverse case: searching `bearing` shows the product results plus a **"Popular brands"
   facet/strip**: SKF · NSK · FAG · NTN — sourced from the curated graph + live catalog counts,
   never hardcoded.

### J-SRCH-D · Bangla-first search

User types `পাম্প`.

1. Language detection → transliteration asset → `pump`; retrieval runs on the canonical English
   index **and** any Bangla-labeled content.
2. The results page states the bridge plainly: *«পাম্প» — showing results for "Pump"*, with a
   one-tap revert to literal search. Suggestions render bilingually where labels exist.
3. Mixed-script queries (`ss পাইপ`) resolve each token independently.

### J-SRCH-E · Vendor searching for demand (org-scoped)

Vendor sales user searches `transformer` inside the workspace.

1. Workspace search is scoped to *their* world: invited RFQs, their leads, their own catalog,
   their engagements. Public catalog results appear only as a clearly separated "On the
   marketplace" section.
2. RFQ results honor M3 visibility rules absolutely: only RFQs routed/invited to this vendor.
   Zero results says *"No matching RFQs in your inbox"* — never implying whether matching RFQs
   exist elsewhere (G-5).

### J-SRCH-F · The dead end that isn't (no-result recovery)

Buyer searches `centrifigal pump 40m head castiron` and gets zero exact hits. The recovery
ladder (§8.4) walks: spell-correct → relax the rarest token → category fallback (Centrifugal
Pumps) → equivalent products → and always, prominently: **"Can't find it? Post an RFQ —
let matching vendors come to you."** On an industrial platform the RFQ is the ultimate
no-result recovery; this is a moat-reinforcing loop, not a consolation prize.

---

## 3. Search Components Inventory

All IDs below are **proposal-stage handles** (`SRCH-C-##`) for this document's internal
cross-referencing; kit component names are ratified only through the Doc-7 kit process. Every
component composes existing kit primitives (`src/frontend/`) — no primitive duplication
(frozen-foundation rule).

### 3.1 Input & entry components

| ID | Component | Description | Key states |
|---|---|---|---|
| SRCH-C-01 | **GlobalSearchBox** | Header search input; icon + placeholder ("Search products, vendors, brands…" / bilingual); focus opens SRCH-C-03. `/` and `Ctrl+K` shortcuts | idle · focused · typing · loading · error |
| SRCH-C-02 | **ScopedSearchBox** | In-page search bound to one surface (directory, RFQ list, CRM); inherits surface scope, shows scope label inside the field | idle · focused · applied (shows active query as clearable token) |
| SRCH-C-03 | **SearchOverlay / Dropdown** | Desktop: anchored dropdown under the header box. Mobile: full-screen takeover. Hosts recent, trending, suggestions | empty (recent+trending) · suggesting · zero-suggest · loading |
| SRCH-C-04 | **SuggestionGroup** | Titled group inside the overlay: *Suggestions · Categories · Brands · Products · Vendors · In your workspace* (auth-only, visually separated) | — |
| SRCH-C-05 | **SuggestionRow** | One suggestion: type icon + highlighted match + context line (category path, vendor location, brand) + entity chip | default · keyboard-active |
| SRCH-C-06 | **RecentSearches** | Last N queries (device-local for guests; account-scoped when signed in), each removable; "Clear all" | populated · empty |
| SRCH-C-07 | **TrendingSearches** | Editorially-governed + aggregate-derived popular queries; M8-moderatable (never expose one org's activity) | — |
| SRCH-C-08 | **VoiceInputAffordance** (future flag) | Mic affordance for Bangla/English voice query — mobile priority; feature-flagged, roadmap §11 | — |

### 3.2 Results & card components

| ID | Component | Description |
|---|---|---|
| SRCH-C-10 | **BlendedResultsSection** | P-SH-01 section per entity type: header + count + top 3–5 cards + "See all N →" hand-off. Private sections (My RFQs / My Vendors) carry an explicit lock glyph + "Only visible to your organization" |
| SRCH-C-11 | **ProductResultCard** | Image · name (match-highlighted) · category path · key specs line · vendor name + verified badge · price/price-band or "Request quote" · capability-relevant chip · RFQ affordance |
| SRCH-C-12 | **VendorResultCard** | Logo · name · claim/verified state (binary "Verified" only) · trust band + numeric (per Board ruling; no formula/percentile) · capability matrix chips (Supply/Service/Fabricate/Consult) · location (district, division) · years active · product count · CTA: View profile / Invite to RFQ |
| SRCH-C-13 | **CategoryResultCard** | Category name · tree path breadcrumb · child-category chips · product/vendor counts · icon from taxonomy asset |
| SRCH-C-14 | **BrandResultCard** | Brand name/mark · product types carried (from brand↔product graph) · vendor count carrying the brand · "See all brand products →" |
| SRCH-C-15 | **RFQResultRow** (org-scoped) | Human ref (`RFQ-2026-000123`) · title · frozen state chip · deadline · line-item count — list-row density, never a marketing card |
| SRCH-C-16 | **SponsoredSlot** | Labeled "Sponsored" container for M2 ad placements; fixed positions (§5.6); visually distinct border/tint; never interleaved unlabeled |
| SRCH-C-17 | **ResultHighlight** | Shared match-highlighting primitive (bold/mark of matched tokens incl. matched-via-synonym: subtle "matches: galvanized iron pipe" annotation) |

### 3.3 Guidance & recovery components

| ID | Component | Description |
|---|---|---|
| SRCH-C-20 | **DidYouMeanBar** | "Showing results for **compressor** · Search instead for *comprssor*" — auto-applied only at zero exact hits; otherwise offered, not forced (§8.3) |
| SRCH-C-21 | **QueryUnderstandingBar** | Transparency strip: language bridge (পাম্প → Pump), expansion chips (GI pipe = Galvanized Iron Pipe), acronym expansion (VFD = Variable Frequency Drive) — each dismissible to force literal search |
| SRCH-C-22 | **RelatedSearches** | End-of-results chip row: sibling categories, equivalent products, narrower intents |
| SRCH-C-23 | **NoResultPanel** | Recovery ladder (§8.4): corrected query · relaxed-query links · category browse cards · **Post an RFQ** primary CTA · popular searches |
| SRCH-C-24 | **CategoryScopeChips** | "In category:" chip row atop mixed results, from intent classification — one tap narrows scope |
| SRCH-C-25 | **SearchStateBlock** | Shared loading (skeleton rows per card type) / error ("Search is temporarily unavailable — Retry / Browse categories") / offline-tolerant retry block; composes the frozen state-matrix pattern |

### 3.4 Filter & sort components

| ID | Component | Description |
|---|---|---|
| SRCH-C-30 | **FacetRail** (desktop) | Left rail, collapsible groups, counts per value, multi-select checkboxes, per-group search-within-facet for long lists (794-node taxonomy!) |
| SRCH-C-31 | **FilterSheet** (mobile/tablet) | Bottom-sheet with the same facet model; "Show N results" live-count apply button |
| SRCH-C-32 | **AppliedFilterBar** | Horizontal chips of active filters + "Clear all"; sticky under the header on scroll |
| SRCH-C-33 | **SortSelect** | Single-select dropdown (§5.5 options per scope); mobile: inside FilterSheet header |
| SRCH-C-34 | **LocationFacet** | Division → District two-level cascade (BD gazetteer asset, bilingual labels) |
| SRCH-C-35 | **CapabilityFacet** | The 4 frozen flags rendered as buyer-language checkboxes (§7.2) |
| SRCH-C-36 | **PriceBandFacet** | Range slider + min/max inputs, BDT-formatted (multi-currency-ready per field) |

---

## 4. Search Screen Inventory

**Design goal: net 0 new page IDs.** Every surface below maps to an existing registered page or
is a component/overlay (not a page). Anything that later needs a new ID is an ESC.

| Surface | Page ID (existing) | Role in the system |
|---|---|---|
| Global header search + overlay | — (component on every shell: public, buyer, vendor, admin) | Layer-1 universal entry; SRCH-C-01/03 |
| **Global blended results** | **P-SH-01** Global search results | The "All" tab; blended sections; hand-off hub. Frozen note honored: presentation, never re-ranks M3 |
| **Catalog search results** | **P-PUB-10** | Primary product scope; facet rail; the workhorse |
| **Industrial / advanced search** | **P-PUB-19** | Power-user surface: structured multi-field query (category + spec attributes + capability + location + certification), saved searches; "FTS now" note honored |
| Categories index / Category page / Industry page | **P-PUB-07 / 08 / 09** | Browse-based discovery; each category page is a pre-scoped search result with facets |
| Vendor directory (public) | **P-PUB-12** | Vendor scope for guests/public |
| Discover vendors (buyer) | **P-BUY-02** | Vendor scope inside the buyer workspace (adds Invite-to-RFQ affordances, CRM-status awareness — private to the org) |
| Vendor microsite product search | **P-PUB-14** (vendor-scoped `search_catalog`) | Within-one-vendor search |
| Buyer RFQ list search/filter | existing buyer RFQ list pages | Org-scoped RFQ search (ScopedSearchBox, not global) |
| Vendor RFQ/lead inbox search | existing workspace M5 (RFQ & Quotation) pages | Invited-only RFQ search |
| Buyer Vendor Directory (CRM) search | BC-OPS-1 surfaces (frozen core) | Private vendor-record search; never blends with public results without explicit sectioning |
| Admin search/queues | P-ADM-* (approved package) | Staff scopes; out of this doc's visual scope |
| **No-result state** | state of P-SH-01 / P-PUB-10 / P-PUB-19 (NOT a page) | SRCH-C-23 recovery panel |
| Mobile search takeover | overlay state of SRCH-C-03 (NOT a page) | Full-screen input + suggest on `< md` |

**Search reach matrix** (which entity types are reachable from which surface):

| Surface | Product | Vendor | Service | Category | Brand | RFQ (own) | CRM (own) |
|---|---|---|---|---|---|---|---|
| P-SH-01 All | ● | ● | ● | ● | ● | ● auth | ● auth |
| P-PUB-10 | ● | ○ via card | ● facet | chips | facet | — | — |
| P-PUB-19 | ● | ● | ● | ● | ● | — | — |
| P-PUB-12 / P-BUY-02 | — | ● | ● facet | facet | facet | — | P-BUY-02 status chips only |
| Workspace (vendor) | own catalog | — | — | — | — | ● invited | — |

---

## 5. Search Result Ranking Strategy

### 5.1 Principles

1. **Relevance is earned by data quality, never bought.** Subscription plan, lead credits, and
   Financial Tier contribute **zero** to organic rank (G-4, G-6). Paid visibility exists only as
   labeled sponsored slots (§5.6).
2. **No single signal dominates** (Invariant #6). Ranking is a blend where any one factor is
   capped in influence; trust alone cannot pin a mediocre text match above a strong one.
3. **Ranking internals are never disclosed** (Board display ruling): no "ranked #3 because…",
   no relevance percentages, no percentile badges. What we *may* show: the trust band + numeric
   score, verified badge, and "Sponsored" labels.
4. **Deterministic and explainable internally.** The factor model below is auditable by M8/Board
   even though it is never shown to users.
5. **Recency and completeness are hygiene factors,** rewarding vendors who maintain their
   catalog — this quietly drives platform data quality.

### 5.2 Factor model (conceptual weights, per entity type)

Weights are illustrative starting points for Board calibration — the *shape* is the design:
text relevance always the plurality factor; no governance signal above ~20%.

**Products (P-PUB-10, product sections):**

| Factor band | ~Weight | Contents |
|---|---|---|
| Text relevance | 45% | field-weighted match: name > brand/model no. > category label > specs > description; exact > phrase > expanded (synonym/acronym hits rank a notch under literal hits) |
| Listing quality | 20% | spec completeness, imagery, price presence, freshness of update |
| Vendor standing | 20% | trust band (capped), verified status, performance band — *bands*, not raw scores, to prevent dominance |
| Engagement | 10% | views→RFQ conversion, favorites (aggregate, never per-org) |
| Business rules | 5% | category-boost during curated campaigns (M8-governed, logged) |

**Vendors (P-PUB-12, P-BUY-02, vendor sections):**

| Factor band | ~Weight | Contents |
|---|---|---|
| Text + capability relevance | 40% | name/keyword match + capability-flag fit to classified intent + category coverage of the query |
| Trust & verification | 20% | trust band + verified (binary) — capped |
| Profile completeness | 15% | microsite depth, catalog size, certifications on file |
| Performance | 15% | performance band (M5), response behavior |
| Locality fit | 10% | match to query/filter location; nearby-division adjacency |

**Categories/Brands:** exact-label match >> alias match >> popularity (catalog density).
**RFQs (org-scoped):** relevance × recency × state urgency (deadline proximity) — *list order
only*; never touches M3 routing (G-3).

### 5.3 Blended-page (P-SH-01) section ordering

Sections are ordered by **query intent confidence**, not fixed:

- brand-classified query (`SKF`) → Brand card first, then Products, Vendors;
- service-verbed query (`pipe fabrication`) → Vendors first;
- spec-shaped query (`gi pipe 2 inch`) → Products first;
- ambiguous → default order Products · Vendors · Categories · Brands (· private sections last,
  visually fenced).

A confidence floor applies: below it, no section is suppressed — search shows breadth and lets
the user pick the tab.

### 5.4 Tie-breaking & fairness

Equal-scoring results rotate deterministically (seeded daily) rather than alphabetically, so
"Aarong Engineering" doesn't permanently outrank "Zaman Traders" on ties. IDs are never exposed
as rank rationale.

### 5.5 Sort options (user-facing, per scope)

| Scope | Default | Options |
|---|---|---|
| Products | Relevance | Relevance · Newest · Price low→high · high→low · Vendor trust band (desc) |
| Vendors | Relevance | Relevance · Trust band · Most reviewed / Highest rated (public reviews lane, derived-stats FROZEN) · Newest members · A→Z |
| RFQs (own) | Deadline soonest | Deadline · Newest · Last activity · Value |
| CRM (own) | Recently engaged | Recent · A→Z · My status (Approved first) — private ordering, private data |

User-chosen sort is always allowed (echoes the Board's Compare Workspace ruling: buyer sorting
is a buyer's right). "Most Popular" as a public sort is **withheld** at v1 — with a thin
marketplace it advantages incumbents and creates a rich-get-richer loop; revisit post-liquidity
(OBS, §12). "Most Verified" as a *sort* is replaced by the Verified *filter* + trust-band sort:
verification is binary (frozen), so "most verified" is not a truthful axis.

### 5.6 Sponsored placement policy

- Fixed, predictable slots only: 1 labeled slot above organic results + 1 after organic
  position ~8 on scoped pages; none inside the autocomplete dropdown at v1.
- Sponsored results must still *match the query* (relevance floor) — irrelevant ads erode the
  trust the platform sells.
- Slot behavior, pricing, quotas = M7/M2 ownership per the frozen corpus; this doc fixes only
  the *presentation contract*: labeled, bounded, never blended.

---

## 6. Search Intelligence Strategy

### 6.1 Intent classification

Signals: token shape (units, numbers → spec/product), verb forms ("fabrication", "servicing" →
service intent), gazetteer hits (→ location), brand-list hits, taxonomy-label hits, script
(Bangla → run transliteration first), workspace context (a vendor typing in the workspace
biases to RFQ/lead intent). Output: an intent vector that orders §5.3 sections, pre-selects
scope chips, and pre-applies obvious facets — always *visibly and reversibly* (SRCH-C-21).

### 6.2 The five Intelligence Assets (curated, versioned, taxonomy-grounded)

All five are **content**, not code: owned within M2's aggregate, curated via M8 admin surfaces,
versioned like every authoritative artifact (Invariant #8), seeded from the ratified 794-node
taxonomy, and extended by a governed suggestion loop (G-8). Together they form the **Industrial
Search Knowledge Base (ISKB)** — full governance model (lifecycle, versioning, audit, rollback,
analytics) in **§13**.

| # | Asset | Cardinality shape | Seed examples (from the design brief) |
|---|---|---|---|
| A1 | **Synonym dictionary** | term ↔ term set, bidirectional | GI Pipe ↔ Galvanized Iron Pipe · MS Plate ↔ Mild Steel Plate · SS Pipe ↔ Stainless Steel Pipe |
| A2 | **Acronym registry** | acronym → expansion(s), domain-tagged | VFD → Variable Frequency Drive · PLC → Programmable Logic Controller · MCC → Motor Control Center · MCCB → Molded Case Circuit Breaker · LT/HT Panel → Low/High Tension Panel |
| A3 | **Bangla↔English bridge** | transliteration rules + curated lexicon | পাম্প → Pump · বেয়ারিং → Bearing · স্টেইনলেস → Stainless Steel; plus BD gazetteer bilingual place names |
| A4 | **Brand↔Product graph** | brand ↔ product-type edges, weighted | SKF ↔ Bearings; Bearing → SKF·NSK·FAG·NTN; graph also powers Brand cards + "Popular brands" strips |
| A5 | **Equivalence sets** | product-type equivalence classes | Air Blower ≈ Roots Blower ≈ Ring Blower ≈ Side Channel Blower (marked "equivalent", ranked under direct matches, labeled in UI) |

Governance loop: query-log mining surfaces *candidate* entries (zero-result terms, correction
acceptances) → staff review in an M8 curation queue → publish a new asset version. M9 (future)
may generate candidates; it never publishes (Invariant #12). Every published entry is auditable.

### 6.3 Category expansion

A query hitting a taxonomy node implicitly includes its subtree (`compressor` → all compressor
child categories); the UI exposes this as CategoryScopeChips (SRCH-C-24) so a user can narrow to
"Rotary Screw Compressors" in one tap. Sibling categories feed RelatedSearches (SRCH-C-22).
Expansion depth is bounded (no exploding a root node into 794 children).

### 6.4 Typo & fuzzy policy

- Tolerance scales with token length (short tokens like `GI`, `SS`, `HT` are **exempt** —
  fuzzing acronyms is how "SS pipe" becomes "MS pipe", a genuinely dangerous industrial
  substitution).
- Brand names and model numbers get reduced fuzz (an engineer typing `6204-2RS` means exactly
  that).
- Correction interacts with results per §8.3 (never silently destroy a valid exact match).

### 6.5 Learning loop (privacy-bounded)

Aggregate-only signals: query → click-through, query → RFQ conversion, correction acceptance
rate, zero-result log, abandoned-facet paths. All analytics are cross-org aggregates; no org's
search behavior is ever visible to another (G-5, default-private). These tune weights (§5.2)
and feed the curation queue (§6.2) — humans adjust, dashboards inform.

---

## 7. Filter Architecture

### 7.1 Facet model

Facets are **per-scope, contract-grounded** (only facets the owning read actually supports),
multi-select within a group (OR), AND across groups, always count-annotated, and URL-serialized
(shareable/bookmarkable filtered searches — procurement teams share links).

### 7.2 Facet catalog

| Facet | Scope | Values / shape | Governance note |
|---|---|---|---|
| Category / Subcategory | products, vendors, RFQs | taxonomy tree picker w/ search-within | ratified taxonomy only; no ad-hoc categories |
| Industry | vendors, products | industry axis of the taxonomy/mapping | P-PUB-09 note: industry taxonomy modeling is ESC-carried (`ESC-7-API-CATNAV` lineage) — facet ships when the axis does |
| **Capability** ("What they do") | vendors, services | ☐ Supplies products ☐ Provides services ☐ Fabricates ☐ Consults | **the 4 frozen matrix flags, buyer-language labels; NOT Manufacturer/Supplier/Importer/Contractor labels** — see ESC-SRCH-02 |
| Location | vendors, products, RFQs | Division → District cascade (BD gazetteer, bilingual) | — |
| Verified status | vendors, products (via vendor) | ☐ Verified only | binary only (frozen); no verification "levels" in UI |
| Trust band | vendors | band multi-select (e.g., 80+ · 60–79 · …) | band buckets, per display ruling; never a raw-score slider |
| Certification | vendors | curated certification list (ISO 9001, BSTI, …) | verification records = M5-owned; facet reads, never asserts |
| Brand | products | brand list w/ search-within | from catalog data + A4 graph |
| Price range | products | BDT band slider + min/max | multi-currency-ready; "Price on request" bucket explicit |
| Availability | products | ☐ In stock ☐ Made to order ☐ Import/lead-time | vocabulary must bind to frozen catalog fields — ESC-SRCH-03 |
| Rating | vendors | ≥4★ · ≥3★ … | public reviews lane only (derived-stats FROZEN, projection-only) |
| Years on platform / experience | vendors | bands | derivable, non-gameable framing ("Member since") |
| RFQ state / deadline / value | RFQs (own) | frozen state chips · date ranges · value bands | frozen state slugs only |
| My status | CRM (own) | Approved · Trial · Blacklisted (private) | renders ONLY inside the buyer's own directory; never on shared surfaces |

**Explicitly rejected facets:**

- **Subscription Tier** — filtering/segmenting vendors by commercial plan violates the spirit of
  Invariant #10 (Financial Tier ≠ Subscription Plan; neither is a quality signal) and G-6
  (visibility never bought, including via filter segregation). What buyers actually want
  ("serious vendors") is served by Verified + trust band + completeness ranking. **REJECTED —
  recorded per Validate-Findings discipline.**
- **Financial Tier (A–E)** as a public facet — it's a capability signal for *matching* contexts
  governed by M3/M5, not a public browse dimension; exposing it as a filter invites
  tier-shopping and signal cross-contamination. Withheld; Board may revisit with M5.

### 7.3 Filter UX rules

1. Facet values show live counts; zero-count values grey out rather than vanish (stable rail —
   no layout churn while refining).
2. Applied filters persist across scope tabs *where the facet translates* (location survives a
   Products→Vendors switch; price does not) — carried filters are shown as chips so nothing is
   invisible.
3. Facet groups with >8 values collapse to top-6 + "Show all" with search-within (mandatory for
   Category and Brand).
4. Mobile: FilterSheet (SRCH-C-31) with live "Show N results" button; never navigate away to
   filter.
5. An applied filter can never be un-removable: AppliedFilterBar (SRCH-C-32) is the single
   always-visible truth of the active query.

---

## 8. Search UX Guidelines

### 8.1 State matrix (every search surface implements all of these — frozen state-matrix discipline)

| State | Behavior |
|---|---|
| **Idle/empty (pre-query)** | Overlay shows Recent (SRCH-C-06) + Trending (SRCH-C-07) + category shortcuts. Never a blank pane |
| **Typing/suggesting** | Debounced suggestions; skeleton shimmer only after a perceptible delay — no flicker on fast responses; stale responses discarded (last-query-wins) |
| **Loading (results)** | Skeleton cards matching the target card type; facet rail skeleton; header count area reserved (no layout shift) |
| **Partial results (blended)** | Sections render as their scope resolves; a slow section shows its own inline skeleton — one slow scope never blanks the page |
| **Success** | Count + query echo ("128 results for **compressor**"); QueryUnderstandingBar when any expansion/correction/translation fired |
| **Thin results (< ~5)** | Results + inline "Expand your search" block (relaxations, equivalents, RFQ CTA) below them |
| **Zero results** | SRCH-C-23 full recovery panel (§8.4) |
| **Error** | SRCH-C-25: honest message, Retry, and a browse escape hatch; suggestions failing never blocks plain Enter-to-search |

### 8.2 Keyboard & accessibility (WCAG 2.1 AA)

- `/` or `Ctrl/Cmd+K` focuses global search from anywhere; `Esc` closes the overlay (one press:
  clear highlight; second: close).
- Overlay: `↑/↓` traverse all suggestion rows across groups; `Enter` activates; `Tab` moves
  between input → groups → footer actions; `Alt+Enter` = "search literally, no corrections".
- Combobox pattern with proper ARIA roles (`combobox`/`listbox`/`option`), `aria-activedescendant`
  tracking, and `aria-live="polite"` announcements: "8 suggestions available", "Showing results
  for compressor, corrected from comprssor", result counts on load.
- Highlighting never relies on color alone (bold + mark); all facet controls are native-order
  focusable; FilterSheet traps focus and restores it on close; hit targets ≥ 44px on touch.
- Bangla text rendered with correct locale fonts/line-height; `lang` attributes set per string
  so screen readers switch voices.

### 8.3 Correction ethics (the "never lie" rules)

1. If the literal query has ≥1 result: show literal results; *offer* the correction
   (DidYouMeanBar in offer-mode). Never silently substitute.
2. If the literal query has 0 results and a high-confidence correction exists: auto-apply,
   state it loudly, one-tap revert.
3. Every expansion (synonym/acronym/translation/equivalence) that materially shaped results is
   disclosed in SRCH-C-21 and individually dismissible.
4. Corrections never fire on quoted strings, model numbers, or human refs (`"RFQ-2026-000123"`).

### 8.4 No-result recovery ladder (SRCH-C-23)

Rendered top-to-bottom, strongest recovery first:

1. **Correction** — "Did you mean *centrifugal pump*?" (auto-applied case per §8.3.2).
2. **Relaxation** — drop the rarest/most-constraining token; show as tappable variants
   ("Try: *centrifugal pump 40m* · *centrifugal pump cast iron*").
3. **Equivalents** — A5 equivalence-set alternatives, labeled as such.
4. **Category fallback** — nearest taxonomy node(s) as CategoryResultCards.
5. **Post an RFQ** — primary CTA with the query pre-filled into the RFQ title: *"Describe what
   you need — matched vendors will quote you."* (guests: leads to signup with intent preserved).
6. **Popular searches** — last resort, keeps the session alive.
   Zero-result queries are logged (aggregate) into the §6.2 curation queue — every dead end
   makes the dictionary better.

### 8.5 History, privacy, trust

- Recent searches: device-local for guests, account-scoped for users; clearable per-item and
  wholesale; **workspace-scope queries (RFQ/CRM) never sync into any shared or public surface**.
- Trending is curated/aggregated (M8-moderatable) — never a raw feed that could leak one org's
  procurement intent.
- Search never reveals: blacklist status (G-5), unpublished/draft/banned content, ranking
  formula, other orgs' activity.

---

## 9. Mobile Search Experience

Mobile is the primary field context — an engineer on a plant floor with one hand free.

1. **Entry:** persistent search icon in the mobile header on every public/buyer/vendor shell;
   tapping opens the **full-screen search takeover** (SRCH-C-03 mobile mode): auto-focused
   input, Bangla/English keyboard respected, Recent + Trending above the fold, `Cancel` returns
   exactly where the user was.
2. **Suggest:** larger row height, thumb-reachable; groups collapse to the top 2 per type with
   "more" expanders.
3. **Results:** single-column cards; sticky compact header (query + result count + **Filter**
   and **Sort** buttons with active-count badges); FacetRail becomes FilterSheet (SRCH-C-31);
   AppliedFilterBar scrolls horizontally.
4. **Scope tabs** become a swipeable segmented control under the header.
5. **Performance discipline:** skeletons within one frame, images lazy + dimension-reserved
   (zero CLS), pagination = "Load more" button (not infinite scroll — procurement users need a
   reachable footer and a sense of position; page-position indicator "Showing 40 of 128").
6. **Resilience:** patchy-network friendly — last successful results stay visible under a
   "Retry" banner on refresh failure; queries are retried idempotently. (No offline *mode* —
   per the standing FE governance ruling, offline state is out of scope.)
7. **Tablet:** desktop layout with the FacetRail collapsed to a toggleable drawer at `md`;
   overlay anchors like desktop.

---

## 10. Desktop Search Experience

1. **Header:** GlobalSearchBox centered/prominent on public shells (the landing "Industrial
   Procurement Command Center" hero search per `landing_page_spec.md`), compact in workspace
   shells; `Ctrl+K` universal.
2. **Overlay:** anchored dropdown, max ~10 visible rows across groups, keyboard-first (§8.2);
   footer row: "Advanced search →" (P-PUB-19) and "Search only: Products · Vendors · Brands"
   quick-scopes.
3. **Results layout:** 12-col grid — FacetRail (3 cols, sticky) · results (6–7) · context rail
   (2–3: QueryUnderstanding details, RelatedSearches, RFQ-CTA card). Blended P-SH-01 uses full
   width with sectioned groups instead of the facet rail.
4. **Density toggle** on product results (comfortable cards ↔ compact table-ish rows) —
   procurement users comparing many SKUs want density; table view reuses the kit data-table
   pattern.
5. **Advanced search (P-PUB-19):** structured form — entity type, taxonomy picker, spec
   attribute rows (attribute + operator + value), capability, location, certification — plus
   **saved searches** (org-scoped, nameable, re-runnable). This is the RFQ-drafting power
   user's tool; a saved search can seed an RFQ's line-item intent.
6. **Continuity:** query, scope, filters, sort, and page all URL-serialized; back/forward
   restore scroll; results shareable with teammates (Users act, Organizations own — a shared
   link re-validates the viewer's own access; private scopes never leak through a URL).

---

## 11. Future AI Search Roadmap (M9-gated; "AI suggests, modules decide")

Sequenced, each stage independently shippable and Board-gated; none blocks the v1 system above.

| Stage | Capability | Governance shape |
|---|---|---|
| AI-1 | **Dictionary copilot** — M9 proposes synonym/acronym/transliteration/equivalence candidates from zero-result logs and catalog text | proposals land in the M8 curation queue; human publish only (G-8) |
| AI-2 | **Semantic retrieval assist** — embedding-based recall behind lexical search (catches "machine that makes compressed air") | reranks *recall candidates* only; §5.2 factor model still governs final order; regenerable artifacts only (M9 charter) |
| AI-3 | **Spec extraction from natural language** — "10 hp 3-phase motor flange mount" → structured attribute filters, shown as editable chips | user confirms every extracted filter; nothing auto-applied invisibly |
| AI-4 | **RFQ-from-search draft** — one tap turns a search-with-specs into a draft RFQ line item | draft only; M3 state machine untouched; user reviews before submit |
| AI-5 | **Conversational procurement search** — multi-turn ("show only Chattogram" … "which are verified?") | a conversation *about* search state; every turn compiles to the same visible filter chips — auditable, reversible |
| AI-6 | **Bangla voice search** — voice → Bangla ASR → the §1.3 pipeline | feature-flagged (SRCH-C-08); mobile-first |

Standing constraints for all stages: M9 owns only regenerable derived artifacts; no AI output
ever mutates catalog, trust, or RFQ state; AI-shaped results remain subject to §5's disclosure
rules (no fake explainability); per-org query privacy holds in training/aggregation exactly as
in §6.5.

---

## 12. Escalations & Open Items (ESC-SRCH register)

**Freeze note (Board, 2026-07-09):** the open ESC items below are **implementation-time
architectural dependencies**, not planning defects — they did not block this document's
Planning Freeze (§16). Each must be resolved through the normal architecture governance process
**before the corresponding implementation work begins**.

| ID | Item | Why it's gated |
|---|---|---|
| ESC-SRCH-01 | **Brand as a first-class searchable attribute** — Brand cards/facet/graph (A4) assume a brand field on catalog items and a curated brand list. Bind to the frozen Doc-4D/Doc-2 catalog shape; if brand is not modeled, this is a carried dependency to resolve additively | reference-never-restate; may need an additive contract patch |
| ESC-SRCH-02 | **"Business type" facet labels.** The design brief requested Manufacturer/Supplier/Importer/Fabricator/Contractor. Prior Board ruling rejected vendor-type labels (Invariant #1 — capability matrix only). This design ships the 4-flag CapabilityFacet instead. If the owner still wants trade-role labels, that is a Flag-and-Halt against Invariant #1 | invariant conflict — never resolve locally |
| ESC-SRCH-03 | **Availability facet vocabulary** (In stock / Made to order / Lead time) must bind to frozen catalog fields or be additively proposed | no coined enums |
| ESC-SRCH-04 | **Intelligence Assets ownership & curation surface** — ISKB asset home (M2 aggregate + M8 curation queue UI) needs a Doc-4D/4J-conformant additive definition + an admin surface mapping (fits existing P-ADM taxonomy/curation surfaces; target net 0 pages). §13 defines the *design-level* governance model; this ESC grounds its contracts, audit-action slugs, and lifecycle enum additively. **Board review 2026-07-09: highest-priority ESC — resolve before any implementation** | contract + admin-surface grounding; Board-flagged priority |
| ESC-SRCH-05 | **Saved searches** (P-PUB-19) — org-scoped persisted queries: confirm owning module before design freeze. **Board review 2026-07-09 recommends M1 (Identity — user/org preference):** a saved search is a preference, not marketplace content; execution still calls M2 contracts (Users Act, Organizations Own). Pending confirmation against Doc-4C's frozen surface — if Doc-4C lacks a preference slot, this needs an additive patch, not a local coin | one module, one owner; Board-recommended M1, freeze pending Doc-4C grounding |
| ESC-SRCH-06 | **Trending searches** data policy (aggregation thresholds, M8 moderation workflow) | privacy guarantee needs an explicit policy, not vibes |
| ESC-SRCH-07 | **Industry facet** — carried on the existing `ESC-7-API-CATNAV` lineage (industry taxonomy axis not fully modeled) | pre-existing ESC, referenced not duplicated |
| OBS-SRCH-01 | "Most Popular" public sort withheld until marketplace liquidity (§5.5) — revisit post-launch | — |
| OBS-SRCH-02 | Ranking weight calibration (§5.2) is a live-data exercise; treat launch weights as v0 with an M8-visible tuning log | — |

---

## 13. Search Governance & Knowledge Asset Management (ISKB)

*Added at v0.2 per Board review (PASS WITH PATCH). This section turns §6.2's asset list into a
governed, versioned, auditable system. Everything here is design-level; the concrete contracts,
audit-action slugs, and lifecycle enum are grounded additively via ESC-SRCH-04 before any
implementation.*

### 13.1 The Industrial Search Knowledge Base (ISKB)

The five Intelligence Assets (§6.2) plus two supporting registries are formalized as one named
registry — the **ISKB**:

```
ISKB
├─ A1 Synonym dictionary          ├─ A5 Equivalence sets
├─ A2 Acronym registry            ├─ R1 Industry-term register (spec vocabulary,
├─ A3 Bangla↔English bridge       │     units, standards names)
├─ A4 Brand↔Product graph         └─ R2 Deprecated-term register (§13.4)
```

**Governance guard (binding):** the ISKB is a *named asset registry inside M2's aggregate* — a
collection of versioned content artifacts. It is **not** a new module, not a bounded context,
and never a source of business truth (G-1/G-2 and the Red-Flag Checklist apply unchanged).
"Search engine reads ISKB; AI suggests updates; Admin approves; everything versioned" is the
whole operating model.

### 13.2 Ownership matrix (one owner per concern)

| Concern | Owner | Notes |
|---|---|---|
| ISKB assets (content + published versions) | **M2** | lives in the marketplace aggregate; read by all search surfaces |
| Curation decisions (approve/reject/publish/deprecate) | **M8** (staff, permission-gated) | Admin decides via the curation queue; M8 never bypasses M2's domain — it calls M2's contract, mirroring the Admin-decides/owner-owns pattern |
| Candidate suggestions | **M9** (future) + query-log mining | suggest-only, never publish (Invariant #12) |
| Audit records of every ISKB mutation | **M0** | immutable audit; actions bound to the frozen audit-action registry — the D7 canonical audited-write pattern applies; **no audit action is ever invented in code** |
| Raw search query logs (aggregate) | **M2** | read-side telemetry of the surfaces M2 serves |
| Search health dashboards | **M8** | admin analytics face on existing P-ADM surfaces (net 0 pages) |
| Weight/threshold tuning decisions | **Board/owner** via M8-visible tuning log (OBS-SRCH-02) | humans adjust; dashboards inform |

### 13.3 Entry lifecycle

Every ISKB entry moves through one lifecycle (proposal-stage state names; slugs frozen via
ESC-SRCH-04):

```
DRAFT → IN-REVIEW → APPROVED → PUBLISHED → DEPRECATED → ARCHIVED
            │            │
            └─ REJECTED (with recorded reason — terminal, auditable)
```

- Only **PUBLISHED** entries influence live search behavior. APPROVED-but-unpublished entries
  wait for the next version cut (§13.4), so behavior changes land in named versions, never as
  silent drift.
- **DEPRECATED** entries stop expanding queries but remain resolvable for explanation ("this
  result matched via a deprecated term") until ARCHIVED.
- Nothing is hard-deleted (Invariant #8): ARCHIVED is the terminal state; entries and their
  history remain queryable forever.

### 13.4 Versioning & rollback

- Each asset (A1–A5, R1–R2) publishes as an **immutable whole-asset version**: `A1 v1`,
  `A1 v2`, … A version is a complete snapshot, not a diff — search always runs against exactly
  one published version per asset.
- A version cut records: included entry changes, curator, approver, effective date, and the
  linked candidate/suggestion provenance.
- **Rollback = republish.** Reverting `A1 v3` means publishing `A1 v4` whose content equals
  `v2` — versions are never overwritten or deleted, so the timeline stays truthful and the
  rollback itself is an audited event.
- The reviewer's scenario is the test: if *GI → Galvanized Iron* later gains a wrong *GI →
  GI Sheet* edge in v3, v4 restores v2's content in one governed step, and the audit trail
  shows who introduced, who caught, and who reverted it.

### 13.5 Audit trail (per mutation, non-negotiable)

Every lifecycle transition and version cut records, via M0's immutable audit:

**who** (staff actor; System actor for automated candidate intake) · **what** (entry, prior →
new state/content) · **when** · **approved by whom** (Raise ≠ Accept: suggester ≠ approver, and
the same staff user cannot approve their own draft) · **why** (mandatory reason string on
approve/reject/deprecate/rollback) · **effective version**.

Audit action names bind to the frozen audit-action registry through ESC-SRCH-04's additive
patch — this document deliberately names none.

### 13.6 Entry priority tiers

Each entry carries a tier that scales its expansion confidence and ranking treatment (§5.2's
"expanded hits rank a notch under literal"):

| Tier | Meaning | Expansion behavior |
|---|---|---|
| **Official** | canonical taxonomy/standards term | full-confidence expansion |
| **Industry standard** | universally used trade term (GI Pipe, VFD) | full-confidence expansion |
| **Alias** | common alternate name | expands; annotated in SRCH-C-21 |
| **Regional** | locality/Bangla-specific usage | expands; annotated; bilingual display |
| **Deprecated** | superseded/incorrect | never expands; resolvable for explanation only |

### 13.7 Curation workflow (the operating loop)

```
CANDIDATE INTAKE                REVIEW                    RELEASE
zero-result queries ─┐
correction accepts ──┼→ suggestion queue → M8 reviewer → approve (tier assigned)
staff manual entry ──┤   (deduped,          (permission-  → next version cut
M9 proposals (future)┘    provenance-        gated)       → PUBLISHED
                          tagged)          ↘ reject (reason) — terminal, logged
```

Cadence is an operational choice (no invented SLA here); the design requirement is only that
the queue is **never a dead end**: every candidate reaches approve or reject with a reason, and
queue depth is visible on the health dashboard (§13.9).

### 13.8 Analytics ownership & Search KPIs

KPI *definitions* below are part of this design; **numeric targets are deliberately not coined
here** (targets/budgets are owned upstream — Doc-8 lane — and calibrated by the Board with live
data, per OBS-SRCH-02). All metrics are cross-org aggregates (§6.5 privacy rules).

| KPI | Definition | Primary consumer |
|---|---|---|
| Zero-result rate | % of searches ending in SRCH-C-23 | curation queue health |
| Search success rate | % of searches with a result interaction (click/facet/hand-off) | UX quality |
| Search CTR | clicks ÷ result impressions, per scope | ranking calibration |
| Search → RFQ conversion | searches leading to an RFQ draft/post | the moat loop (§8.4.5) |
| Vendor-profile opens from search | search-attributed microsite visits | vendor-side value proof |
| Correction acceptance rate | offered corrections accepted ÷ offered | §6.4 fuzz-policy tuning |
| Expansion contribution | % of clicked results reached only via ISKB expansion | ISKB ROI; dead-entry detection |
| Time-to-first-interaction | query submit → first result interaction | perceived speed (measurement only; budget owned by Doc-8) |

### 13.9 Search Health Dashboard (admin face)

An M8 analytics face on existing admin surfaces (net 0 pages; concrete P-ADM mapping via
ESC-SRCH-04): top queries · failed/zero-result queries (→ one-click "create candidate") ·
correction acceptance trend · **dead synonyms / unused dictionary entries** (published entries
with zero expansion contribution over a window → deprecation candidates) · suggestion-queue
depth & age · trending-products/query velocity (feeds SRCH-C-07 moderation) · per-asset version
history with rollback affordance (permission-gated, audited).

### 13.10 Search Evolution Policy (backward-compatibility contract)

Five standing rules for every future change to search behavior. A change that cannot satisfy
them is not a tuning change — it is a versioned, Board-visible evolution.

1. **Never break an existing URL.** Search URLs are shared procurement artifacts (§10.6:
   query/scope/filters/sort are URL-serialized). Renaming or removing a serialized parameter
   requires a redirect/translation path; old links must keep resolving to an equivalent search.
2. **Never invalidate a saved search.** A saved search (P-PUB-19; ESC-SRCH-05) must either
   re-run with identical meaning or be migrated transparently. If a facet or vocabulary it
   references is deprecated, the saved search degrades *visibly* ("this filter no longer
   exists — review"), never silently returns different results, and is never deleted.
3. **No semantic change without a version increment.** Anything that alters what a query
   *means* — ranking-weight changes (§5.2), expansion behavior, correction thresholds (§6.4),
   intent-classification rules — lands only through a named, logged version (ISKB asset version
   or an M8-visible tuning-log entry per OBS-SRCH-02), never as silent drift.
4. **No silent dictionary modification.** Every ISKB mutation goes through the §13.3 lifecycle,
   §13.5 audit, and §13.4 version cut — including "trivial" one-entry fixes. There is no
   hotfix path around the knowledge base's governance.
5. **No frontend page changes for existing search flows.** Search evolution happens behind the
   frozen contracts and within existing surfaces (the §4 net-0-pages inventory). A behavior
   change that would force new page IDs, new routes, or breaking component contracts is
   out-of-policy and escalates to the Board before any work starts (G-10).

---

## 14. Acceptance Summary (what "done" looks like for this design)

- One universal entry (router + previews) + per-owner scoped surfaces; net 0 new page IDs.
- All 15 requested capabilities mapped: exact / typo / fuzzy (§6.4), synonyms / acronyms /
  Bangla bridge / brand↔product / equivalents / category expansion (§6.2–6.3), autocomplete /
  suggestions (§3.1), did-you-mean (§8.3), no-result recovery (§8.4), ranking (§5).
- Every governance invariant honored by construction: firewalled signals, capability matrix,
  private exclusion undetectable, paid ≠ organic, presentation never re-ranks M3, AI suggests
  modules decide, tenant privacy.
- Full state matrix, keyboard map, and AA accessibility contract for every surface (§8).
- Filter and sort catalogs with explicit rejections recorded (§7), not silently dropped.
- A governed knowledge base (ISKB, §13): lifecycle, immutable versioning with republish-rollback,
  M0-audited mutations, one-owner-per-concern analytics, KPI definitions without coined targets.
- A Board-ready ESC register (§12) isolating everything this document could not decide alone.

---

## 15. Review Adjudication Record (v0.1 → v0.2)

Board review 2026-07-09 · verdict **PASS WITH PATCH** · adjudicated per CLAUDE.md §13
(Validate Findings gate; Raise ≠ Accept). Gate state after patch: **BLOCKER 0 · MAJOR 0 ·
MINOR 0** (all gating findings resolved in §13).

| Finding | Severity | Disposition | Resolution |
|---|---|---|---|
| Missing asset governance lifecycle | MAJOR-01 | **VALID — applied** | §13.3 (slugs frozen via ESC-SRCH-04, not coined here) |
| Missing versioning strategy | MAJOR-02 | **VALID — applied** | §13.4 immutable whole-asset versions; rollback = republish (Invariant #8) |
| Missing audit trail | MAJOR-03 | **VALID — applied** | §13.5; bound to M0 immutable audit + frozen audit-action registry (canonical audited-write pattern); action names deliberately not invented |
| Search analytics ownership unclear | MAJOR-04 | **VALID — applied** | §13.2 + §13.8: raw logs M2 · dashboards M8 · suggestions M9 · audit M0 |
| Search KPIs missing | MINOR-01 | **VALID — applied with guard** | §13.8 KPI *definitions* only; numeric targets withheld (budget ownership sits upstream, Doc-8 lane) |
| Search health dashboard missing | MINOR-02 | **VALID — applied** | §13.9; admin face on existing P-ADM surfaces, net 0 pages |
| Curation workflow underspecified | MINOR-03 | **VALID — applied** | §13.7; no invented SLA, queue never a dead end |
| Dictionary priority tiers missing | MINOR-04 | **VALID — applied** | §13.6 five tiers wired into §5.2 expansion ranking |
| Formalize assets as "ISKB" | Suggestion | **ACCEPTED with guard** | §13.1; named registry *inside M2's aggregate* — explicitly not a module/bounded context (Red-Flag Checklist) |
| ESC-SRCH-05: saved searches → M1 | Ruling | **RECORDED** | §12 updated; freeze pending Doc-4C grounding (additive patch if no preference slot exists) |
| ESC-SRCH-02: keep capability matrix | Ruling | **CONFIRMED** | no change needed; trade-role labels stay rejected |
| ESC-SRCH-04 is highest priority | Ruling | **RECORDED** | §12 flagged: resolve before any implementation |
| Add a Search Evolution Policy before freeze (v0.3) | Recommendation | **VALID — applied** | §13.10: five backward-compatibility rules; additive, no scope expansion |

---

## 16. Board Decision — Planning Freeze (2026-07-09)

> **STATUS: APPROVED FOR PLANNING FREEZE**
>
> The Search System Planning & Design document is approved as the planning baseline.
>
> The remaining ESC items (**ESC-SRCH-04** and **ESC-SRCH-05**) are implementation-time
> architectural dependencies and do not block this Planning Freeze. They shall be resolved
> through the normal architecture governance process before the corresponding implementation
> work begins.

**Rationale (Board):** planning documents block only on issues that invalidate the design
itself; neither item does. ESC-SRCH-04 is an implementation-contract concern — the ISKB
concept, ownership, lifecycle, and governance are already defined here (§13); what remains is
how the architecture realizes them. ESC-SRCH-05 is a validation step — confirm whether Doc-4C
already provides a suitable user/organization preference slot for Saved Search persistence;
if not, introduce an additive architectural patch.

**Effect of this freeze:**

- This document is the **authoritative planning baseline** for search implementation work
  (still non-authoritative *under the frozen corpus* — CLAUDE.md §7 order unchanged; on any
  conflict a frozen document wins and this baseline is patched to match).
- Amendments require an **additive patch + version bump**; in-place edits are prohibited.
- Freeze gate satisfied: **BLOCKER 0 · MAJOR 0 · MINOR 0** (§15); NIT/OBS items
  (OBS-SRCH-01/02) carry forward non-blocking.
- Implementation authorization is **separate** and follows the wave/roadmap sequence.

*End of document — v1.0 PLANNING FREEZE, Board-approved 2026-07-09.*
