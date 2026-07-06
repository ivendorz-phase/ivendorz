<!--
Classification: DESIGN COMPANION / UX BENCHMARK (owner Board reclassification, 2026-07-03). NOT a
            planning or implementation authority, NOT a build authorization.
Board:      PASS WITH CLARIFICATION (owner, 2026-07-03) — verdict folded into §0.0 below.
Authority:  NON-AUTHORITATIVE. Benchmarks + refines the UX of already-FROZEN, already-SHIPPED public
            surfaces (FE-PUB-09 Mega Menu, FE-PUB-03 Vendor Microsite, FE-PUB-05 Product Detail) plus
            one genuinely net-new surface (Project/Case-Study detail). Coins no mechanism, contract,
            ownership boundary, or invariant. Binds frozen entities/contracts/states by pointer
            (reference-never-restate). On any conflict the frozen `generatedDocs/` corpus wins
            (CLAUDE.md §7) and this document is patched to match.
Ownership:  REQUESTED OF TEAM-2 (Buyer), but every surface in scope (Header/Nav/Mega Menu, Vendor
            Profile, Product Page, Project Page) is Public-marketplace chrome/content — Team-1's
            owned territory (M2 Marketplace) per `team-1.md` / `execution-board.md`, and three of the
            four are already built, reviewed, and CLOSED this program (see §0.2). Team-2 does not
            modify or redefine them. Any resulting build is a TEAM-1 backlog item — the missing
            Project Detail page is registered as such: **FE-PUB-11, Planned, High priority, Team-1**
            (see §0.0 + `fe-program-wbs.md` Track 1).
Produced:   2026-07-03, single-author analysis (not a multi-agent workflow synthesis).
-->

# Public Marketplace — Design Companion & UX Benchmark (Global Sources)

> **Classification (owner Board, 2026-07-03): Design Companion / UX Benchmark — NOT a planning or
> implementation authority.** Same non-authoritative posture as `buyer_planning_and_design.md` /
> `vendor_planning_and_design.md`.

### 0.0 Board Verdict — PASS WITH CLARIFICATION (owner, 2026-07-03)

The owner (Board) reviewed this document and ruled **PASS WITH CLARIFICATION**. The rulings, folded
in verbatim of intent:

1. **Correct ownership confirmed.** Header · Navigation · Mega Menu · Vendor Profile · Product Detail
   are all **Public Marketplace (Team-1 / M2 Marketplace)** surfaces. Team-2 does not modify or
   redefine them. This document is a benchmark/companion, not a Team-2 deliverable to build.
2. **Global Sources is a benchmark, not a template.** Endorsed. Binding framing (owner's own
   wording): _"**Benchmark against Global Sources to identify proven B2B UX patterns. Adapt those
   patterns to iVendorz's RFQ-first industrial procurement experience while maintaining the existing
   design system and architecture.**"_ Inspiration, not duplication — applied throughout (§0.4, §2).
3. **No code changes** — keeping this as an analysis/design artifact is the correct governance
   decision; nothing in scope was built or modified.
4. **Most valuable finding accepted:** the **Single Project / Case-Study detail page is a genuine
   gap** (Vendor Profile → Project Card → ❌ no detail page). Fixing it completes the journey
   (Vendor Profile → Project Card → Project Detail → {Related Products · Related Services · RFQ ·
   Vendor Profile}) and strengthens trust + SEO simultaneously. **Registered as a new Team-1 backlog
   item — `FE-PUB-11 Project Detail Page`, Status: Planned, Priority: High, Owner: Team-1** — reusing
   the existing vendor-microsite components exactly as proposed in §6.
5. **The already-approved Team-1 milestones are NOT reopened.** The remaining §3–§5 suggestions are
   **future UX enhancements, not mandatory redesign work** — a Team-1 backlog to draw from at its own
   cadence, never a directive against closed milestones.

The rest of this document is the benchmark analysis and the §6 Project-Detail design that back these
rulings.

---

> **What this is:** a competitive UX benchmark against Global Sources, translated into concrete
> design direction for iVendorz's Header/Navigation/Mega Menu, Vendor Profile, Single Product Page,
> and a new Single Project (case-study) Page — plus explicit recommendations on what to keep, what
> to refine, and what to leave alone because it's already better-reasoned than the benchmark. Per the
> Board framing above, "benchmark" means _identify proven B2B patterns and adapt them to iVendorz's
> RFQ-first industrial procurement experience_ — never mirror or duplicate Global Sources.
>
> **What this is not:** an authorization to rebuild the Mega Menu, Vendor Microsite, or Product
> Detail page. All three are closed milestones (FE-PUB-09 · RV-0126, FE-PUB-03 · RV-0111, FE-PUB-05 ·
> RV-0132) built by Team-1 against Board-approved specs (`MEGA_MENU_*.md`, `vendor_planning_and_design.md`,
> the FE-PUB-05 WP card). Where this document recommends a change to one of those, it is a **proposed
> future enhancement for Team-1's backlog**, not a redo and not mandatory — closed milestones are not
> reopened by this document (the standing convention all session: "closed milestones not reopened").

---

## 0. Front Matter

### 0.1 Scope

| # | Surface | Status today | This document's role |
|---|---|---|---|
| 1 | Header, top nav, search | ✅ Built (`SiteHeader`, part of Doc-7C shell + FE-PUB-01/06 era work) | Benchmark + refine |
| 2 | Mega Menu ("Industrial Category Explorer") | ✅ Built + CLOSED (FE-PUB-09, RV-0126) | Benchmark + refine |
| 3 | Vendor Profile (public microsite) | ✅ Built + CLOSED (FE-PUB-03, RV-0111; 7-route IA per ADR-022) | Benchmark + refine |
| 4 | Single Product Page | ✅ Built + CLOSED (FE-PUB-05, RV-0132) | Benchmark + refine |
| 5 | Single Project / Case-Study Page | ❌ Does NOT exist — the vendor microsite's Projects page lists project cards, but every "View details" button is `disabled` and no detail route exists | **Full net-new design** |

### 0.2 Authority pointers (all bound, never restated)

| Concern | Pointer |
|---|---|
| Public shell (header/footer, anonymous) | `app/(public)/_components/site-header.tsx`, `site-footer.tsx` (Doc-7C) |
| Mega menu architecture | `MEGA_MENU_ARCHITECTURE.md` / `_COMPONENT_SPEC.md` / `_DATA_MODEL.md` / `_UX_FLOW.md` / `_IMPLEMENTATION_PLAN.md` — **canonical, not redesigned here** |
| Category taxonomy | `productSpec/CATEGORY_TAXONOMY_REVIEW.md` — 794 nodes, 13 roots, ≤4 levels (frozen `level CHECK`) |
| Vendor microsite IA | `vendor_planning_and_design.md` + ADR-022 (multi-page revision) + Doc-7D §10 |
| Public product detail contract | `Doc-4D_PublicProductDetail_Patch_v1.0.3` / `Doc-5D_PublicProductDetail_Patch_v1.0.1` / `ADR-025` (canonical URL law) |
| Page inventory | `page_inventory.md` §5 (P-PUB-*) |
| Design tokens | `app/globals.css` — Navy-dominant (`--iv-navy-*`), Indigo interactive-only (`--iv-brand-*`), Gold reserved for premium/verified/featured (`--iv-amber-*`) |
| Governance invariants cited throughout | Inv #1 (capability matrix, never a label) · Inv #6 (trust firewall, display-silent) · Inv #9 (Content ≠ Presentation) · Inv #11 (non-disclosure/byte-equivalence) · R6 (never ranks/recommends a vendor) · R7 (no client-computed figures) · GI-04 (never re-ranks contract order) · GI-12 (no widget implies functionality that doesn't exist) |

### 0.3 Method

Benchmarked against Global Sources' live public site (fetched 2026-07-03) plus well-established
conventions common across the B2B industrial-marketplace genre (Alibaba, IndiaMART, Made-in-China,
ThomasNet, TradeIndia) that Global Sources itself belongs to — the live GS homepage today is
trade-show/exhibition-forward rather than a pure product-catalog experience, so where GS's own
current page doesn't show a pattern, this document draws on the genre convention it's known for and
says so explicitly, rather than presenting a thin read as if it were complete.

### 0.4 Non-negotiable adaptation rules (constraints honored throughout)

1. **No B2C patterns.** No cart, no "buy now," no star-rating aggregate, no consumer checkout flow.
   Every commerce-shaped affordance here is quotation-based (RFQ) or inquiry-based.
2. **Trust stays firewalled.** Public surfaces show ONLY the binary `VendorVerifiedBadge` — never a
   numeric trust score, tier, or percentile (Inv #6; `ESC-7G-SCORE-DISPLAY` ruling: score display is
   *permitted* on public surfaces in principle, but nothing here currently wires a real score source,
   so nothing is fabricated to fill the gap).
3. **Capability is a matrix, never a label.** Any "what this vendor does" signal is the frozen 4-flag
   `can_supply`/`can_service`/`can_fabricate`/`can_consult` set — never a coined "Manufacturer" /
   "Trading Company" badge (Inv #1; this is exactly the class of finding a real review round in this
   program rejected once already).
4. **R6 — never a ranked recommendation.** Comparison, "best match," or "top pick" language is
   forbidden anywhere in this scope. Sorting/order is always contract-provided, never re-derived.
5. **Navy stays dominant; Gold stays reserved.** Indigo is interactive-only; Gold is reserved for
   premium/verified/featured contexts only (already-ratified brand rule, re-confirmed this session).
6. **No coined categories, industries, or document types.** The 794-node taxonomy is the only
   category source; "industries served" is an editorial, non-contract field (already how the
   microsite handles it) — nothing here invents a second taxonomy.

---

## 1. Global Sources Benchmark — What Was Actually Observed

Global Sources' current live homepage is dominated by its physical trade-show business (Hong Kong
Shows, exhibitor booth applications, show-phase cards), which is not the shape of surface iVendorz is
building. The genuinely transferable UX patterns — the ones this document adapts — are:

| Pattern | Global Sources (+ genre convention) | Why it matters for B2B industrial procurement |
|---|---|---|
| **Dual-path header** | Separate "Buyer Center" (My Inquiries/My RFQ/My Messages/My Orders) vs "Supplier Center" (booth/registration/selling tools) navigation, never blended into one generic "Account" menu | Buyers and vendors have almost no overlapping workflows on a B2B platform — conflating them into one nav creates dead-end clicks |
| **RFQ as a first-class top-level action**, not buried in a cart icon | "My RFQ" is a named nav destination, and posting a buying request is a persistent top-level CTA | On B2B platforms the RFQ *is* the transaction — treating it as secondary (like a cart badge) undersells the platform's actual value prop |
| **Category-first discovery, not search-first** | Category taxonomy is the dominant navigation model; a text search box is present but category browsing carries equal or greater weight | Industrial buyers often know their category ("centrifugal pumps," "CNC machining") before they know a specific product name — category-first discovery matches real sourcing behavior |
| **Sparse, platform-level trust language** ("100% verified suppliers") rather than rich per-supplier trust widgets on listing surfaces | GS states a platform-wide verification claim in its hero rather than decorating every card with scores | Aligns naturally with iVendorz's own firewalled binary-verified posture — GS's restraint here is closer to iVendorz's actual governance than a data-rich competitor like Alibaba would be |
| **Exhibition/event content as a credibility layer**, distinct from the transactional catalog | Shows, awards, "Best of Innovation" — these build institutional credibility without touching the RFQ funnel | The Project/Case-Study page this document designs (§6) plays an analogous credibility role for iVendorz, minus the physical-event framing |
| **Category tree depth without a rich mega-panel** on the current GS build (link lists, not card-based columns) | Category menu today is largely text-link based | iVendorz's ALREADY-BUILT mega menu (columns + featured rail + industry strip) is **more sophisticated** than what GS currently ships — see §3, this is a "don't regress" note, not a gap to close |

**What Global Sources does NOT do well, that iVendorz should NOT copy:**
- Homepage information density is very high (12+ stacked sections observed) with weak hierarchy —
  "New Products / Most Popular / Analyst's Choice / Low MOQ / OEM Products" reads as five near-
  duplicate discovery modules competing for the same attention.
- Trust signals are asserted at the platform level ("100% verified") without visible per-vendor
  proof points (certifications, response metrics) on the actual listing surfaces observed.
- The RFQ entry point ("My RFQ") is nested inside a Buyer Center dropdown rather than being a
  standalone, always-visible action — undersells the platform's core value action.

---

## 2. Adaptation Principles — How the Benchmark Maps to iVendorz

| Global Sources pattern | iVendorz adaptation |
|---|---|
| Buyer Center vs Supplier Center split | Already present in spirit: `SiteHeader`'s "Sell on iVendorz" vs the buyer-facing RFQ CTA are visually distinct; §3 recommends sharpening this further |
| "My RFQ" as persistent nav destination | Already present and *stronger* than GS's version: the Row-2 "Request for Quotation" pill button is already the visually dominant action (per the header's own governing comment) |
| Category-first discovery | Already the dominant pattern — the Explorer/Mega Menu is the header's Row-2 anchor, not an afterthought |
| Platform-level trust assertion, not per-card score inflation | Exactly matches iVendorz's binary-Verified-only posture — no change needed, just confirmed as the right instinct |
| Institutional credibility content (shows/awards) | Reinterpreted as the **Project/Case-Study page** (§6) — demonstrated engineering capability instead of trade-show attendance, matching an industrial (not consumer-goods) marketplace |
| High homepage density, weak hierarchy | Explicit anti-pattern — iVendorz's existing pages already avoid this (single hero, bounded featured slices, "View all" overflow pattern used consistently); §7 reinforces this discipline for the new Project page |

---

## 3. Header, Navigation & Mega Menu

### 3.1 Current state (built, CLOSED — FE-PUB-01/06 header era + FE-PUB-09 mega menu)

**Information Architecture (as shipped):**

```
Row 1 (h-16, always visible)
├─ BrandLogo → /
├─ SearchBar (desktop only) → action=/search
├─ [Sign in] [Get started]  (desktop only, both → /login)
└─ ☰ hamburger (mobile only) → Sheet drawer

Row 2 (h-11, desktop only, border-top)
├─ [Explorer ▾]  ← Mega Menu trigger ("All Categories")
├─ Marketplace → /marketplace
├─ Suppliers → /vendors
├─ More ▾ (Pricing, Resources — placeholders)
├─ Sell on iVendorz → /login (placeholder)
├─ Help Center → / (placeholder)                    [right-aligned]
└─ [⊕ Request for Quotation]  ← primary pill CTA     [right-aligned]

Mobile Sheet (triggered from Row 1 hamburger)
├─ SearchBar
├─ Marketplace · Suppliers · More-links flattened · Sell on iVendorz · Help Center
├─ "All categories" → MegaMenuMobile (lazy-loaded accordion+drill-in)
└─ [Request for Quotation] [Sign in] [Get started]
```

**Component hierarchy:** `SiteHeader` (client) → `BrandLogo`, `SearchBar` (kit), `Explorer` →
`ExplorerMenu` (lazy) → `MegaMenu`/`MegaMenuDisclosure`/`MegaMenuPanel` → `MegaMenuColumns`,
`MegaMenuFeatured`, `MegaMenuVendors`, `MegaMenuRecent`, `MegaMenuTrail`, `MegaMenuPopular`,
`MegaMenuIndustryStrip`, `MegaMenuQuickActions`, `MegaMenuFooter`; mobile path →
`Sheet` → `MegaMenuMobile` (accordion root, kit `Accordion` primitive) → `MegaMenuBreadcrumb`.

**Sticky behavior:** `position: sticky; top: 0` on the whole two-row header — both rows stay pinned,
not just row 1. This differs from a lot of competitor patterns (which often collapse to a single
compact row on scroll) — flagged as a possible refinement below (§3.4).

**User journey (category-first discovery):** land on any public page → hover/tap "All Categories" →
mega panel opens (≤150ms hover-intent on desktop) → drill through columns (breadcrumb trail updates
live) → land on a category page, OR jump straight to a featured vendor/product in the right rail →
OR abandon the tree and use the persistent search box instead. Both paths are equally reachable at
all times — this is the "category-first, search-always-available" model GS also uses.

### 3.2 Desktop / Tablet / Mobile behavior (as shipped)

| Breakpoint | Behavior |
|---|---|
| Desktop (≥1280px, `xl`) | Full 2-row header; mega panel shows drill columns + the 5th-column right rail (Featured + Vendors) |
| Tablet / small desktop (768–1279px, `md`–`lg`) | 2-row header retained, but the mega panel's right rail (`xl:block`) is hidden — columns only, no featured rail |
| Mobile (<768px) | Row 2 collapses entirely into the hamburger sheet; category browsing becomes the accordion+drill-in `MegaMenuMobile`, not a hover panel |

### 3.3 UX rationale (why each header element exists)

| Element | Rationale |
|---|---|
| Top utility area (none currently — GS has one) | iVendorz deliberately has NO separate utility bar above the header (no i18n switcher, no currency picker — single-market Bangladesh focus for now); the governing code comment explicitly avoids fabricating an org-switcher/notification-center on the anonymous surface, which is the correct call — see §3.4 for the one thing worth reconsidering here |
| Search bar (Row 1) | Always-visible fallback discovery path alongside category-first browsing — matches the "search always available" GS pattern |
| Sign in / Get started (Row 1) | Standard auth entry; kept visually secondary (ghost/outline) so they don't compete with the RFQ CTA |
| Explorer / Mega Menu (Row 2, leftmost) | Primary discovery entry — leftmost position matches the F-pattern scan priority category-first platforms rely on |
| Marketplace / Suppliers nav items | The two other primary discovery modes (browse the catalog broadly vs. browse the vendor directory) — kept as plain links, not sub-menus, since neither needs a tree |
| Sell on iVendorz | The vendor-acquisition CTA, deliberately visually distinct from the buyer-facing RFQ CTA — mirrors GS's Buyer-Center/Supplier-Center split |
| Request for Quotation (Row 2, rightmost, pill, primary) | The platform's actual value-moat action, made maximally visible — stronger than GS's nested "My RFQ" pattern |
| Help Center | Placeholder today (routes to `/`) — acceptable at this build stage, flagged not fixed here |

### 3.4 Recommended improvements over Global Sources (proposed — Team-1 queue, not built here)

1. **Sharpen the buyer/vendor path split further.** GS's Buyer Center vs Supplier Center separation
   is cleaner than iVendorz's current single flat Row-2 nav. Recommend grouping "Sell on iVendorz"
   into a visually distinct micro-section (e.g. a subtle divider or a different button treatment)
   so the buyer-vs-vendor fork reads instantly, without adding a second header row.
2. **Avoid a real utility bar, but reconsider one thing.** GS's utility bar carries sign-in/register
   only (no i18n needed here either) — iVendorz's current no-utility-bar choice is right. The one
   gap worth a Team-1 ticket: there is no visible way to reach a language/currency assumption
   statement (e.g. "BDT · English") anywhere in the header — low priority, but worth a single
   static label near the auth CTAs so buyers aren't left to assume.
3. **Consider a compact-on-scroll header state**, collapsing Row 2 into Row 1 after a scroll
   threshold (keeping the Explorer trigger + RFQ CTA, dropping the rest) — GS and most catalog-heavy
   competitors do this to reclaim vertical space on long listing pages. Not built here; flagged as a
   Doc-7B-owner (kit) enhancement since it touches the shared `SiteHeader`, not Buyer-owned code.
4. **"Help Center" and "Sell on iVendorz" are both placeholders today** (`→ /` and `→ /login`
   respectively) — not a regression to fix now, just recorded as the two remaining header TODOs
   ahead of a genuine content build.
5. **Mega menu is already ahead of the benchmark** — GS's current live category menu is a plain
   link list; iVendorz's drill-column + featured-rail + industry-strip + popular-searches panel is
   materially richer. No structural change recommended; only the interaction-polish items already
   tracked (Board standing agenda) apply.

### 3.5 Mapping to existing design system

Every component named in §3.1 already exists and is reused, not proposed — `SearchBar`, `Sheet`,
`Accordion`, `Button`, the full `MegaMenu*`/`CategoryTree*` family in `src/frontend/navigation/`. No
new kit primitive is proposed anywhere in this section.

---

## 4. Vendor Profile (Public Microsite)

### 4.1 Current state (built, CLOSED — FE-PUB-03, 7-route IA per ADR-022/Doc-7D §10)

**Information Architecture (as shipped) — 7 routes under `/vendors/[slug]/`:**

```
/vendors/[slug]              Home        Hero → Overview → Capabilities(top4) → Products(top4)
                                          → Projects(top3) → Industries(top8) → CTA band
/vendors/[slug]/about        About       Overview+facilities → Mission/Vision → Why choose us
                                          → History → Statistics → Management message
/vendors/[slug]/products     Products    Full catalog (ProductShowcase)
/vendors/[slug]/projects     Projects    Full "Selected work" list (ProjectShowcase)
/vendors/[slug]/industries   Industries  Full IndustryGrid
/vendors/[slug]/resources    Resources   Downloads(disabled) · Certifications(self-declared)
                                          · Gallery(decorative) · FAQ · Video(genuine-empty)
/vendors/[slug]/contact      Contact     Address+hours (open) · phone/email/website (sign-in-gated)
                                          · CTA → /login
```

Persistent chrome across all 7 (`VendorMicrositeLayout`): breadcrumb → brand header → sticky route
nav (7 tabs) → page content → CTA band. Every page independently 404-gates via `getVendorOr404`
(byte-identical, Inv #11).

**Component hierarchy:** `VendorMicrositeLayout` → `VendorMicrositeHeader`, `VendorMicrositeNavigation`
(7-tab route nav, `aria-current` active state), page slot → `VendorHero`, `VendorSection` (generic
section wrapper), `CompanyOverview`, `MissionVision`, `WhyChooseUs`, `CapabilitySection` (wraps the
frozen `CapabilityMatrix`), `ProductShowcase` (wraps kit `ResultsGrid`/`ProductCard`), `ProjectShowcase`,
`IndustryGrid`, `CertificationGrid`, `CompanyGallery`, `CompanyStatistics`, `CompanyTimeline`,
`ManagementMessage`, `CompanyFaq`, `CompanyContact`, `DownloadCenter` → `VendorMicrositeFooter`.

**User journey:** buyer lands from Mega Menu's featured-vendor rail, a search result, or a product
page's vendor link → Home page gives a scannable summary + "View all" doors into every deep section →
buyer either requests a quote immediately (CTA band, every page) or drills into Products/Projects to
validate capability before committing → Contact page is the final-step conversion surface (sign-in
gated for direct contact details, matching the platform's lead-routing model rather than exposing a
disintermediated phone number).

### 4.2 Desktop / Tablet / Mobile behavior (as shipped)

| Breakpoint | Behavior |
|---|---|
| Desktop | Full 7-tab sticky route nav, multi-column grids (products/projects/industries) |
| Tablet | Route nav becomes horizontally scrollable (`overflow-x-auto`) rather than wrapping; grids drop to 2-column |
| Mobile | Route nav scrolls horizontally; all grids single-column; CTA band buttons stack full-width |

### 4.3 UX rationale

| Section | Why it exists |
|---|---|
| Verified badge only (binary) | Firewalled trust signal (Inv #6) — the ONE thing a buyer needs to know at a glance without exposing an internal score |
| Capabilities (4-flag matrix) | Answers "can this vendor supply/service/fabricate/consult" precisely — never a label like "Manufacturer" that papers over the real matrix (Inv #1) |
| Products / Projects tabs, not blended | Procurement buyers evaluate "what they sell" and "what they've built" as genuinely separate decisions — a manufacturer's catalog and its delivered engineering work answer different due-diligence questions |
| Contact sign-in-gate | Prevents disintermediation while still letting the buyer see everything else — matches the platform's lead-routing business model without inventing a paywall UX |
| Certifications marked self-declared | Correctly NOT conflated with the platform's own Verified signal — avoids a false-authority problem GS itself sidesteps by keeping trust language platform-level |

### 4.4 Recommended improvements over Global Sources

1. **The 7-page depth is already a step beyond GS's supplier-profile pattern** (GS profiles read as
   single-page summaries with limited drill-down) — no structural change recommended.
2. **"Why choose us" and the FAQ section are flagged in the code itself as not in the original Board
   page spec** — this document does not resolve that; it's a genuine open item for Team-1/Board, not
   something to silently keep or drop.
3. **Project cards' disabled "View details" is the single biggest gap** relative to a genuine
   case-study-driven credibility model (the analog to GS's award/exhibition credibility layer) — this
   is exactly what §6 designs.
4. **Consider a compact "trust strip" directly under the hero** (Verified badge + capability matrix +
   "N products · N projects" counts, if the counts become contract-provided) — GS's platform-level
   trust assertion pattern suggests surfacing proof-of-substance high on the page rather than only in
   deep tabs. Flag for Team-1; not built here (would need real contract-provided counts, R7).

### 4.5 Mapping to existing design system

All components named above already exist under `app/(public)/_components/microsite/` — nothing new
proposed. §6's new Project detail page reuses this exact sub-kit (see §6.5).

---

## 5. Single Product Page

### 5.1 Current state (built, CLOSED — FE-PUB-05, RV-0132)

**Information Architecture (as shipped):**

```
Breadcrumb (Marketplace › Category path › Product name — deterministic pick rule over the taxonomy)
Hero card
  ├─ Decorative image tile (no fabricated <img> src)
  ├─ Product name + description
  ├─ Vendor link + VendorVerifiedBadge (binary only)
  └─ CTAs: [Request quote → /login] [View supplier → vendor page]
Specifications section  (renders detail.spec, or EmptyState "No specifications published")
Documents section       (EmptyState "No documents published" — no download field wired yet)
```

**Normative exclusion manifest (deliberate, not an oversight):** NO price/currency, NO trust/
performance score, NO counts, NO related-items rail, NO buyer-private/entitlement facts. This is a
governance-driven design decision (the folded `Doc-4D_PublicProductDetail_Patch_v1.0.3`'s composed
projection explicitly excludes these fields) — **not a gap to close**, and any recommendation to add
price or related-items back would need a fresh corpus patch, not a UI change.

### 5.2 Desktop / Tablet / Mobile behavior

| Breakpoint | Behavior |
|---|---|
| Desktop | Hero splits image tile + info panel side-by-side; specs/documents stack below full-width |
| Tablet | Hero stacks (image above info panel); rest unchanged |
| Mobile | Fully stacked, single column, CTAs full-width |

### 5.3 UX rationale — why "industrial procurement, not e-commerce"

| Design choice | Rationale |
|---|---|
| No price shown | Industrial pricing is quote-dependent (MOQ, spec variants, freight terms) — showing a fabricated or misleading headline price would actively mislead a procurement buyer; RFQ is the correct price-discovery mechanism |
| No "add to cart" | There is no cart concept in this platform's business model at all — RFQ replaces it entirely |
| No related-items rail | Deliberately deferred to its own contract (`ESC-7-API/related`) rather than fabricated via a generic "similar products" heuristic that would imply platform-computed relevance (R7/GI-04 risk) |
| Documents section present but empty | Sets buyer expectation that spec sheets/datasheets WILL live here once vendors upload them — genuine-empty, not hidden |
| Vendor link + binary badge only | Keeps the product page focused on the PRODUCT while still answering "who makes this, can I trust them" in one glance |

### 5.4 Recommended improvements over Global Sources

1. **GS-style product cards typically show MOQ and a price range** — iVendorz's choice to omit price
   entirely is the RIGHT call for a quote-first model, not a gap; worth stating explicitly to avoid a
   future "add pricing" request being treated as an obvious win when it isn't.
2. **Consider a "Request quote" sticky action** on scroll for long specification tables (a pattern
   GS-genre sites use heavily on long product pages) — flagged as a Team-1 enhancement candidate,
   not built here.
3. **The empty Documents section is honest but passive** — recommend (Team-1 ticket) a short
   "Ask the vendor for a datasheet" micro-CTA inside the empty state, turning an honest gap into a
   lead-generation opportunity without fabricating a file that doesn't exist.

### 5.5 Mapping to existing design system

`Card`, `Badge`, `EmptyState`, `Button`, `VendorVerifiedBadge` — all pre-existing, no new primitive.

---

## 6. Single Project / Case-Study Page — Full Design (net-new)

This is the one surface in scope that genuinely does not exist. The vendor microsite's `/projects`
route already lists project cards (`ProjectShowcase`), but every card's "View details" action is
`disabled` by design — its own governing comment states no deep route is invented until the frozen
`showcase_projects` read is wired. This section proposes the detail page that button should open onto.

### 6.1 Information Architecture

```
/vendors/[slug]/projects/[projectSlug]     (NEW route, nested under the existing microsite chrome)

Breadcrumb: Vendors › {Vendor name} › Projects › {Project name}
Persistent chrome UNCHANGED: VendorMicrositeLayout (brand header + 7-tab nav stays visible —
  this is a DETAIL page inside the existing microsite, not a new top-level surface)

Page content:
0. Project-context bar  — [‹ back] + vendor logo + project name + primary category tag + [Share] +
                          [Request Quote] (the mockup's top strip; sits inside the microsite chrome,
                          not a replacement for the global header/footer)
1. Project hero        — name, one-line summary, cover image (vendor-uploaded once the asset pipeline
                          is wired; decorative placeholder tile until then), + a "PRECISION WELDING"-
                          style caption chip
1a. Project Details     — sidebar metadata block (mockup adoption): Status (StatusChip, frozen state
    (sidebar)             vocabulary) · Duration · Client (NAMED — owner Board ruling R2, §6.9;
                          vendor-authored + consent-responsible, coins no platform signal) · Location
                          · Completion year. All vendor-authored editorial; no client-computed figure
                          (R7-safe)
2. Project overview     — "Executive Summary" (mockup naming): THE CHALLENGE + OUR SOLUTION, two
                          vendor-authored narrative blocks (this is §9's "Challenges & Results",
                          relocated up-front per the mockup)
3. Capabilities applied — a FILTERED slice of the SAME frozen 4-flag CapabilityMatrix used on
                          About/Home — never a second, project-specific capability vocabulary
4. Industries served    — reuses IndustryGrid's existing editorial industry tags, scoped to this
                          project (not a new taxonomy)
5. Products used        — reuses ProductShowcase / ProductCard, filtered to products cited in
                          this project (real product links back into the catalog — see §6.6)
6. Technologies/methods — short tag list (editorial, e.g. "CNC 5-axis," "ASME B31.3 piping") —
                          NOT a coined governance signal, purely descriptive vendor-authored content
7. Gallery              — decorative placeholder tiles (matches CompanyGallery's existing pattern —
                          no fabricated image URLs until a real asset pipeline exists)
8. Deliverables         — "Scope of Deliverables" checklist (mockup naming) in the sidebar, e.g.
                          ✓ Structural Analysis & Design · ✓ Fabrication (500 Tons) · ✓ On-site
                          Installation · ✓ NDT — vendor-authored editorial, coins no platform signal
9. Challenges & results — two short editorial blocks — the actual "buyer confidence" payload
                          this whole page exists for
10. Related products     — reuses ProductCard/ResultsGrid, same-vendor products (NOT cross-vendor
                          — avoids the exact "related items" exclusion §5.1 already ruled out for
                          the product page; here it's scoped and vendor-authored, not a computed
                          relevance ranking, so it doesn't hit the same R7/GI-04 concern)
11. Related services     — plain text/tag list if the vendor's capability matrix includes
                          `can_service`/`can_consult` — no separate "services catalog" invented
12. Vendor profile card  — compact summary card (name, Verified badge, capability matrix, "View
                          vendor profile" link back to Home) — the project always resolves back to
                          its vendor, never presented as a standalone/anonymous case study
13. CTA band             — "Request a similar project" / "Contact this vendor" (→ /login, matching
                          every other CTA on this microsite — no new conversion pattern invented)
```

### 6.2 Layout Wireframe (section-by-section, desktop)

**Updated 2026-07-03 to the owner-provided reference mockup** ("High Voltage Substation" / Apex
Industrial) — a two-column layout (main content left, sticky info sidebar right) inside the unchanged
microsite chrome. The three governance-conflicting elements in that mockup were adjudicated by the
owner (Board) — see **§6.9** — and this wireframe reflects the ruled-compliant version, NOT the raw
mockup (no "TIER 1" badge, no platform "Verify Project Data", documents honest-empty).

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Global SiteHeader + VendorMicrositeLayout chrome — UNCHANGED]          │
├─────────────────────────────────────────────────────────────────────────┤
│  Project-context bar:  [‹ back] [APEX] High Voltage Substation · POWER    │
│                                              [Share]  [Request Quote]     │
├──────────────────────────────────────────────┬──────────────────────────┤
│  MAIN (left, ~2/3)                             │  SIDEBAR (right, ~1/3,   │
│                                                │  sticky)                 │
│  ┌──────────────────────────────────────────┐ │  EXECUTED BY             │
│  │  [Hero image — vendor-uploaded once       │ │  Apex Industrial Eng.    │
│  │   wired; decorative placeholder until]    │ │  & Mfg Systems Ltd.      │
│  │   ◉ "PRECISION WELDING" caption chip       │ │  [Verified]              │
│  └──────────────────────────────────────────┘ │  (NO tier/rank badge)    │
│  [thumb][thumb][thumb][thumb][▸video][thumb]…  │  [POWER] [INFRASTRUCTURE] │
│  (gallery strip — placeholder tiles until       │  ← category tags         │
│   the vendor-asset pipeline exists)            │ ┌──────────────────────┐ │
│                                                │ │ ⓘ PROJECT DETAILS    │ │
│  ┌──────────────────────────────────────────┐ │ │ Status   [COMPLETED] │ │
│  │ 🗎 Executive Summary            REF: P3   │ │ │ Duration   6 Months  │ │
│  │                                           │ │ │ Client   National Grid│ │
│  │  THE CHALLENGE                            │ │ │   (named — §6.9 R2)  │ │
│  │  ¶ challenge narrative (vendor-authored)  │ │ │ Location  Chittagong │ │
│  │                                           │ │ │ Completion    2022   │ │
│  │  OUR SOLUTION                             │ │ └──────────────────────┘ │
│  │  ¶ solution narrative (vendor-authored)   │ │ ┌──────────────────────┐ │
│  └──────────────────────────────────────────┘ │ │ ☰ SCOPE OF           │ │
│                                                │ │   DELIVERABLES       │ │
│  Capabilities Applied  [4-flag matrix, filtered]│ │ ✓ Structural Analysis│ │
│  Products Used   [ProductCard]…(links to catalog)│ │ ✓ Fabrication 500T   │ │
│  Technologies & Methods:  [tag] [tag] [tag]     │ │ ✓ On-site Install    │ │
│  Related Products (same vendor)  [ProductCard]… │ │ ✓ Procurement Grade  │ │
│  Related Services:  [tag] [tag]                 │ │ ✓ NDT                │ │
│                                                │ └──────────────────────┘ │
│                                                │  (NO "Compliance         │
│                                                │   Repository" / "Verify  │
│                                                │   Project Data" — §6.9 R3;│
│                                                │   documents surface as a │
│                                                │   genuine-empty section  │
│                                                │   in MAIN until wired)   │
├──────────────────────────────────────────────┴──────────────────────────┤
│  Documents  [EmptyState "No project documents published" — honest,        │
│              disabled, no fabricated files, no platform "verify" claim]    │
├───────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Apex Industrial Eng. & Mfg Systems Ltd.  [Verified]  [4-flag matrix]│ │
│  │  [View vendor profile →]                                            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│  CTA band:  [Request a similar project]   [Contact this vendor]           │
├───────────────────────────────────────────────────────────────────────────┤
│  [VendorMicrositeFooter — UNCHANGED]                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

The sidebar's **Project Details** block (Status · Duration · Client · Location · Completion) and
**Scope of Deliverables** checklist are the mockup's two strongest additions over the original §6.1
draft and are adopted — Status renders as a `StatusChip` (frozen state vocabulary, e.g. `completed`),
Deliverables as a checklist (was a plain list in the original draft). Every value is vendor-authored
editorial content the vendor supplies (coins no platform signal, R7-safe — no client-computed figure).

### 6.3 Component Hierarchy

```
VendorMicrositeLayout (existing, unchanged — chrome only)
└─ ProjectDetailPage (NEW, Server Component, RSC)
   ├─ VendorBreadcrumb (existing, extended one level: Projects → {project name})
   ├─ ProjectHero (NEW — mirrors VendorHero's presentation discipline: cover image
   │   [placeholder tile until the asset pipeline is wired, §6.9 R4], name, named
   │   client [§6.9 R2], VendorVerifiedBadge [no tier badge, §6.9 R1], Share + CTA row)
   ├─ VendorSection ×N (existing generic wrapper, reused for every content block below —
   │   Overview / Capabilities / Industries / Products / Technologies / Gallery /
   │   Deliverables / Challenges & Results / Related Products / Related Services)
   │   ├─ CapabilitySection (existing, reused — filtered matrix)
   │   ├─ IndustryGrid (existing, reused — scoped tags)
   │   ├─ ProductShowcase / ResultsGrid + ProductCard (existing, reused — filtered to
   │   │   this project's cited products, and again for "Related Products")
   │   └─ CompanyGallery (existing, reused — decorative tiles)
   ├─ ProjectVendorSummaryCard (NEW — thin composition of existing VendorVerifiedBadge +
   │   CapabilitySection's matrix chip row + a Link back to vendor Home; NOT a new kit
   │   primitive, a page-scoped composition like every other *Card in this program)
   └─ CTA band (existing pattern, reused verbatim — Button × 2 → /login)
```

Two genuinely new components: `ProjectHero`, `ProjectVendorSummaryCard`. Everything else is reuse.
Both new components are thin compositions of already-existing primitives (`Card`, `Badge`, `Button`,
`VendorVerifiedBadge`), following this program's own "composition, not a new kit primitive" discipline.

### 6.4 User Journey

1. **Entry points:** (a) vendor microsite's `/projects` list page — "View details" becomes a real
   link instead of `disabled`; (b) vendor microsite Home page's "Featured projects" slice — same
   button, same destination; (c) potentially a future cross-vendor "Case studies" discovery surface
   (explicitly OUT of scope here — see §6.7).
2. Buyer lands on the project page already knowing which vendor it belongs to (breadcrumb + persistent
   microsite chrome reinforces this — never presented as an anonymous, vendor-less case study).
3. Buyer scans hero → overview → capabilities/industries (fast capability-fit check) → products used
   (concrete proof of what was actually supplied) → gallery/deliverables/challenges-results (the
   confidence-building narrative payload) → related products (a natural next click if the buyer's
   own need matches something used in this project).
4. Two exits: **convert** (Request a similar project / Contact vendor → `/login`, same lead-routing
   model as every other CTA on this platform) or **continue evaluating** (View vendor profile → back
   to Home, or click a related product → into the catalog).

### 6.5 Desktop / Tablet / Mobile Behavior

| Breakpoint | Behavior |
|---|---|
| Desktop (≥1024px) | Hero splits cover tile + info panel side-by-side; Capabilities/Industries sit in a 2-column row; Deliverables/Challenges sit in a 2-column row; Products/Gallery/Related-Products are 3–4 column grids |
| Tablet (768–1023px) | Hero stacks; Capabilities/Industries stack; Deliverables/Challenges stack; grids drop to 2-column |
| Mobile (<768px) | Everything single-column; gallery becomes a horizontally-scrollable strip (matching `CompanyGallery`'s existing mobile treatment); CTA band buttons full-width stacked |

### 6.6 UX Rationale

| Decision | Rationale |
|---|---|
| Lives under `/vendors/[slug]/projects/[projectSlug]`, not a top-level `/projects/[slug]` | A project has no meaning independent of the vendor who executed it — nesting it (like the product page nests under the catalog, not under a vendor) keeps provenance unambiguous and matches the existing microsite's own "everything resolves back to the vendor" pattern |
| Persistent microsite chrome stays visible | Prevents the page from feeling like a detached micro-site; a buyer can jump straight to Products/Contact without a back-button |
| "Products Used" links back into the real catalog | Turns a credibility page into a discovery funnel — a buyer impressed by a project can immediately explore the actual purchasable products, closing the loop GS's award/exhibition content never closes (those are dead-end credibility, not discovery) |
| Named client shown (owner Board ruling R2, §6.9) — with a binding guardrail | The owner overrode the prior "sector/role only" convention for this page: named clients build the strongest procurement credibility (real reference projects), which is the whole point of the surface. **Guardrail:** the client name is vendor-authored, consent-responsible editorial — the platform coins no signal and makes no verification claim about it, and it never exposes a buyer-private/blacklisted/platform-hidden relationship (Inv #11 stays intact; a vendor publishing its own reference ≠ the platform disclosing a buyer's private sourcing record) |
| No fabricated images | Consistent with every other public surface in this program (product page, microsite gallery) — a placeholder-tile-first posture until a real asset pipeline exists is the established, deliberate pattern, not an oversight to "finally fix" here |
| No score/ranking anywhere on the page | R6/Inv#6 — a project page proves capability through demonstrated specifics (what was built, what was delivered), never through a numeric confidence score |

### 6.7 Recommended improvements over Global Sources

1. **This entire page is iVendorz's answer to GS's exhibition/awards credibility layer — and it's a
   stronger mechanism**, because it converts directly into product/vendor discovery rather than
   dead-ending at an event page.
2. **Consider (future, NOT this document's scope) a cross-vendor "Case Studies" discovery surface** —
   a `/case-studies` or `/projects` top-level listing analogous to `/vendors` — the natural next step
   once real project data exists across many vendors, giving buyers an industry-first ("show me
   process-industry projects") rather than vendor-first discovery path. Flagged as a genuine future
   idea, explicitly not designed here (would need its own IA/contract discussion, and a real
   `showcase_projects` public read to back it — currently unwired, `ESC`-class gap same family as the
   product detail page's own prior gating history).
3. **Do NOT add a comments/review section** — GS-genre B2C review patterns have no place here; buyer
   confidence comes from the vendor's own demonstrated specifics, never from unverified third-party
   comments (would also be a fresh non-disclosure/moderation surface this platform doesn't own here).

### 6.8 Mapping to Existing Design System

| New component | Composed from (100% reuse) |
|---|---|
| `ProjectHero` | `Card`, `Badge`, `Button`, `VendorVerifiedBadge` — same primitives `VendorHero` already uses |
| `ProjectVendorSummaryCard` | `Card`, `VendorVerifiedBadge`, the `CapabilitySection` matrix-chip row, `Link` |
| Everything else on the page | `VendorSection`, `CapabilitySection`, `IndustryGrid`, `ProductShowcase`/`ResultsGrid`/`ProductCard`, `CompanyGallery`, `VendorBreadcrumb` — zero new primitives, zero forked components |

**Build gate (registered, not yet started):** Board-approved as a new Team-1 backlog item —
**`FE-PUB-11 Project Detail Page`, Status: Planned, Priority: High, Owner: Team-1** (`fe-program-wbs.md`
Track 1). Wiring the real `showcase_projects` read + turning `ProjectShowcase`'s "View details" from
`disabled` to a real link is Team-1's build scope, and depends on whichever contract/ESC-class gap
currently blocks that data (same posture the product detail page was in before `ESC-7-API-PRODDETAIL`
resolved it). This document designs the destination; Team-1 owns the wiring. It will own a new
`P-PUB` page ID (`P-PUB-25`), whose formal mint + coverage-universe bump (150 → 151) is a Board-mint
action taken at kickoff — the same mechanism the FE-DOC track used for its 144 → 150 expansion — not
performed here, so the "150 pages, each owned exactly once" invariant stays intact until the build
actually starts.

### 6.9 Owner-Provided Reference Mockup + Board Rulings (2026-07-03)

The owner supplied a concrete design mockup for this page ("High Voltage Substation" case study, Apex
Industrial Engineering & Manufacturing Systems Ltd.) and directed: _"for single project details we
can use this, as main part; header, footer and other will be the same."_ The mockup is adopted as the
FE-PUB-11 visual reference (its two-column layout, Project-context bar, Executive Summary /
Challenge+Solution, sidebar Project Details block, Scope of Deliverables checklist, gallery strip,
Executed-by vendor card, Share + Request Quote actions) — **inside** the unchanged global site header/
footer + `VendorMicrositeLayout` chrome, exactly as directed.

Four elements in the raw mockup conflicted with frozen governance and were surfaced for a Board ruling
before adoption (Raise ≠ Accept / Validate-Findings gate). Owner rulings, 2026-07-03:

| # | Mockup element | Conflict raised | **Owner (Board) ruling** |
|---|---|---|---|
| **R1** | "TIER 1" trophy badge on the vendor card | Reads as a vendor tier/ranking — a firewalled signal; public surfaces show binary Verified only (Inv #6 · R6) | **DROP IT — Verified badge only.** No tier/rank badge renders. Fully compliant, no corpus change. |
| **R2** | Named client "National Grid" | Existing `ProjectShowcase` discipline restricts this to sector/role only, never a named company | **ALWAYS SHOW THE NAMED CLIENT** — a Board override of the prior "sector/role only" convention, scoped to this Project Detail page. **Guardrail (binding):** the client name is **vendor-authored editorial content the vendor is responsible for having consent to publish** — it coins no platform signal, the platform makes no verification claim about it, and it must still never expose a *buyer-private* / blacklisted / platform-hidden relationship (Inv #11 in the narrow sense stays intact; this is a vendor's own published reference, not a platform disclosure of a buyer's private sourcing record). |
| **R3** | "VERIFY PROJECT DATA" button + "Compliance Repository" (Handover Certificate / Quality Audit Report as real docs) | Implies the *platform* verifies project data + holds real certificates; it does neither (GI-12 · Inv #6) | **DROP "VERIFY"; documents honest-empty/disabled.** No platform "verify" affordance. A Documents section renders as a genuine-empty/disabled `EmptyState` ("No project documents published") until a real vendor-upload pipeline exists — same posture as the product page's Documents section and the microsite's `DownloadCenter`. |
| **R4** | Real construction photographs | Every public surface uses decorative placeholder tiles ("no fabricated `<img>` src") until an asset pipeline exists | (no decision needed) Wiring-gate: real vendor-uploaded photos render **once the asset pipeline is wired**; decorative placeholder tiles until then — the established, deliberate pattern, unchanged. |

**Follow-on note (not auto-applied):** R2 (named client) is ruled for the FE-PUB-11 Project Detail
page. Whether the already-CLOSED `ProjectShowcase` **list cards** (FE-PUB-03) also adopt named clients
for consistency is a separate Team-1 decision against a closed milestone — flagged, not silently
changed here (closed milestones aren't reopened without owner direction, and the ruling was scoped to
"single project details").

---

## 7. Cross-Cutting

### 7.1 Responsive strategy (shared across all 4 surfaces)

All four surfaces already share one discipline, and the new Project page follows it: single hero →
bounded "featured" slices with an explicit "View all" overflow link (never an infinite unbounded
list on a summary surface) → grids that step down column count at `lg`/`md`/mobile → CTA bands that
go full-width-stacked on mobile. No new responsive pattern is introduced anywhere in this document.

### 7.2 SEO-friendly IA

- Product page already has canonical URL law (id-anchored, `permanentRedirect` off non-canonical
  slugs) — the proposed Project page should follow the identical pattern:
  `/vendors/{vendor-slug}/projects/{project-slug}-{uuid}`, id-anchored, same redirect discipline,
  reusing `ADR-025`'s established Builder-interface pattern rather than inventing a second URL law.
- Every new page gets its own `generateMetadata` (title/description/canonical), matching every
  existing microsite route's own per-route metadata pattern — no shared/generic metadata block.

### 7.3 Component reuse summary (all 4 surfaces combined)

Zero new kit primitives proposed anywhere in this document. Two new page-scoped compositions
(`ProjectHero`, `ProjectVendorSummaryCard`) for the net-new Project page — both are thin, reusing
only components that already exist. Every other recommendation in §3–§5 is a refinement of already-
shipped composition, not a rebuild.

---

## 8. Board Decision Points

| # | Item | Status |
|---|---|---|
| 1 | Wire `showcase_projects` + build the Project detail page (§6) | ✅ **RULED (owner, 2026-07-03)** — registered as **`FE-PUB-11 Project Detail Page`, Planned, High, Team-1**. Build gated on the `showcase_projects` public read (same class as the resolved `ESC-7-API-PRODDETAIL`) + a `P-PUB-25` page mint / coverage bump at kickoff |
| 2 | Compact-on-scroll header (§3.4.3) | Future enhancement (not mandatory) — touches the shared `SiteHeader`, Doc-7B-kit-owner territory; Team-1 backlog |
| 3 | "Why choose us" / FAQ sections' Board-spec status (§4.4.2) | Open — already flagged in the code itself; this document does not adjudicate it |
| 4 | Sticky "Request quote" action on the product page (§5.4.2) | Future enhancement (not mandatory) — a real interaction change to a CLOSED milestone, Team-1's call |
| 5 | Future cross-vendor "Case Studies" discovery surface (§6.7.2) | Future idea — a genuinely new top-level IA decision, out of this document's scope by design |

Per the Board verdict (§0.0), items 2–5 are **future UX enhancements, not mandatory redesign work**;
the already-approved Team-1 milestones stay closed.

---

## 9. Summary

Of the five surfaces requested, four already exist as closed, Board-approved, reviewed milestones —
and in most respects they already reflect better-reasoned decisions than Global Sources' own current
live site (a firewalled trust model instead of score-inflated cards, an RFQ-first CTA instead of a
buried "My RFQ" link, a richer mega-menu than GS's current link-list). The genuine gap this benchmark
surfaces is the fifth: a Project/Case-Study detail page, fully designed in §6, that gives iVendorz the
credibility-building mechanism Global Sources gets from trade-show content — but wired directly into
product and vendor discovery instead of dead-ending at an event page.
