# ADR-022: Vendor Public Microsite Information Architecture — Single-Page → Multi-Page Route Composition

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / ARCHITECTURE-REVIEW-BOARD APPROVAL.** A new ADR is a **new
decision**; per CLAUDE.md §7 the ADR Compendium is **rank 1, immutable to skills** — this proposal is **NOT**
folded into `generatedDocs/ADR_Compendium_v1.md` by any AI action. On approval, a human folds it into the
Compendium under the next free number (**ADR-022**; ADR-019 reserved / do-not-backfill, ADR-021 last folded).
Until then this file lives in `governanceReviews/` and is non-authoritative.

| Field | Value |
|---|---|
| Proposed number | **ADR-022** (next free; ADR-019 reserved, ADR-021 last folded) |
| Date | 2026-07-01 |
| Raised by | **Architecture Board directive** — *Vendor Microsite IA Revision* (approved with changes, score 9.7/10). The Board directed that the durable rationale live in an ADR, not only in the FE roadmap. |
| Realized by | `Doc-7D` additive patch — *Public Microsite Route Information Architecture* (`Doc-7D_MultiPage_IA_Additive_Patch_PROPOSAL.md`) — which **authors** the route IA; plus the FE WBS **M2.7 → M2.16** (this ADR is the **decision**; the Doc-7D patch + WBS are its **realization**). |
| Relationship to existing ADRs | **Refines the realization of Doc-7D §4** (mechanism-only; authors no route) by authoring the page/route IA it deliberately left open. **Touches no existing ADR; supersedes nothing.** Consistent with the Content ≠ Presentation invariant (Inv #9) and Invariant #11 (private exclusion / byte-equivalent 404). |
| Authority | CLAUDE.md §7 (authority order), §8 (architecture-affecting → human approval), §11 (Flag-and-Halt / reference-never-restate), §13 (Raise ≠ Accept). |

---

## Context

1. **Doc-7D §4 authors no route.** The frozen Doc-7D content (`Doc-7D_Content_v1.0_Pass1` §4, *"Microsite &
   Content ≠ Presentation — mechanism only"*) binds the microsite to its Public reads and the Content ≠
   Presentation rule, and its Pass-1 self-check states verbatim: **"Mechanism only: §0–§4 author no
   page/route."** Doc-7D therefore mandates **neither** a single-page **nor** a multi-page layout — page/route
   authoring was deliberately left to the FE surface.

2. **The content model is unchanged by either layout.** The microsite **content** model is owned by M2 and
   modelled in **Doc-2 §3.3** (`microsites` aggregate: `layout_template` A–E + `profile_sections`, atomic
   draft → published → unpublished). That is a **content-composition** model — how a vendor composes their
   published content — **not** a routing mandate. Both a single page and a set of pages are valid *projections*
   of the same published content.

3. **The shipped single-page IA was an implementation choice, not a frozen mandate.** M2.5–M2.7 realized the
   microsite as one page of anchor-linked sections under the owner-ruled "Hybrid" / "Single-page sections"
   dispositions. Those were FE/design-companion decisions; no frozen clause requires them.

4. **Why change.** Industrial B2B buyer expectations, SEO/indexability (already called for in Doc-7D §1 —
   *"public metadata … for … microsites (SEO)"*), future CMS/content management, scalability, backend
   integration, and per-section UX all favour a multi-page company-website IA.

Because Doc-7D authored no route, selecting a route IA is an **additive authoring** decision — **not** an
override of any frozen clause, and **not** a change to any business-architecture document. This is the gap this
ADR closes.

## Decision

The Vendor Public Microsite is composed as a **multi-page site of exactly seven (7) primary routes** under
`/vendors/[slug]`, behind a **persistent chrome layout**, with **per-page data resolution**.

### Route IA (canonical)

| Route | Page | Page content (composed from existing presentation components) |
|---|---|---|
| `/vendors/[slug]` | **Home** | Hero · Company Summary · Capabilities · Featured Products · Featured Projects · Industries · CTA |
| `/vendors/[slug]/about` | **About** | Overview · Mission · Vision · Core Values · History · Timeline · Management · Facilities · Statistics |
| `/vendors/[slug]/products` | **Products** | Categories · Product Grid · Featured Products · Product-detail links · RFQ CTA |
| `/vendors/[slug]/projects` | **Projects** | Project cards · Gallery · Case studies · Industries served |
| `/vendors/[slug]/industries` | **Industries** | All industries served |
| `/vendors/[slug]/resources` | **Resources** | Company Profile · Brochure · Datasheet · Certificates · Gallery · Videos |
| `/vendors/[slug]/contact` | **Contact** | Address · Phone · Email · Website · Map placeholder · Inquiry CTA · RFQ CTA |

- **Navigation = exactly 7 items** (Home · About · Products · Projects · Industries · Resources · Contact).
  **No top-level navigation item is added without Board approval.** Resources is the umbrella for Certifications
  / Downloads / Gallery / Videos / Brochures / Datasheets — these are **not** top-level nav items.
- **Persistent chrome layout.** The vendor header, navigation, footer, and breadcrumb live in a **route-group
  layout** (`app/(public)/vendors/[slug]/layout.tsx`) that wraps all seven pages — chrome is not re-authored per
  page.
- **Per-page data resolution (Board ruling §2).** Each page resolves its **own** Public read
  (`get_public_vendor_profile` + vendor-scoped `search_catalog`, per Doc-7D §4.1) and renders `notFound()` on an
  unknown / unpublished / banned vendor, preserving **Invariant #11** (byte-equivalent 404) on **every** route.
  The layout does **not** centralize data fetching. A single shared `loadVendorOr404(slug)` helper keeps the
  404 semantics identical across pages (no divergence). This posture scales cleanly once backend wiring begins.
- **SEO.** Each route emits its own `generateMetadata` (the indexability Doc-7D §1 calls for).

## What this decision is NOT

- **Not a content-model change.** Doc-2 §3.3 `microsites` (`layout_template` / `profile_sections` / atomic
  publish) is **unchanged**; M2 still **owns** the content. Same content, projected across routes.
- **Not a Doc-2 / Doc-4 / Doc-5 / Doc-6 change.** No business architecture, no contract/DTO, no schema, no
  module or ownership boundary, no governance signal, no event, no state machine is touched.
- **Not a new API or cross-module surface.** The Public reads are unchanged; product detail stays the
  `[ESC-7-API-PRODDETAIL]` interim (in-search detail, no standalone anonymous product page); no route is
  treated as a contract.
- **Not a Vendor-workspace coupling.** The public microsite imports **nothing** from `app/(app)` (Doc-7G).
- **Not backend authoring.** Search / Filter / Contact form / Google Map / Videos remain **unwired
  presentation placeholders**; this ADR authors **presentation routing only**.

## Consequences

- **Doc-7D gains one additive authored section** (the realization patch) — *Public Microsite Route Information
  Architecture* — that authors the seven-route IA. **No existing Doc-7D clause is altered**; the proposed bump
  is **Doc-7D v1.0 → v1.1** (additive section).
- **A shared FE Foundation is recognized, owner = Team 1:** `VendorMicrositeLayout`, `VendorNavigation`,
  `VendorHero`, `VendorSection`, `VendorFooter`, `VendorBreadcrumb`, `VendorVerifiedBadge`. The two foundation
  refactors this IA requires — navigation **anchors → route links** (+ active state), and `VendorMicrositeLayout`
  **page-wrapper → chrome shell** — are **Team-1-owned** changes (Team 3 consumes; Board to rule whether Team 1
  executes the foundation refactor or Team 3 executes under Team-1 sign-off).
- **WBS:** `M2.7` Multi-page Architecture → `M2.8` Home → `M2.9` About → `M2.10` Products → `M2.11` Projects →
  `M2.12` Industries → `M2.13` Resources → `M2.14` Contact → `M2.15` SEO + Metadata → `M2.16` QA + Freeze.
- **Back-compat:** the dropped nav routes (`/capabilities`, `/certifications`) and the legacy `#anchor` URLs
  redirect to their canonical pages (`/about`, `/resources`); no broken links.
- **Editorial discipline unchanged:** no fabricated content or scores; certifications stay **self-declared**;
  "featured" is an **editorial slice**, never a computed ranking (GI-04); decorative tiles only (no fabricated
  images); disabled actions where unwired (no fabricated files/routes).

## Firewall / invariant check (no governance signal touched)

This ADR adds **no** permission slug, **no** POLICY key, **no** module/ownership change, **no** contract,
**no** event, **no** state machine, and weakens **no** RLS. It touches **none** of the five firewalled
governance signals (Trust · Capacity · Financial Tier · Performance · Buyer Vendor Status). **Invariant #9**
(Content ≠ Presentation) is honoured — routing is *presentation*; M2 still owns the content. **Invariant #11**
(private exclusion stays private; byte-equivalent 404) is preserved **per route**. **Invariant #1** (capability
matrix) is unchanged (the kit `CapabilityMatrix` is reused, never recomputed). It records a **presentation
route IA** for one public surface.

---

**Principle:** *The microsite's content model is M2's and unchanged; its route layout is the FE surface's to
author. Doc-7D §4 left the page/route unauthored — this decision authors it as seven pages, additively, without
touching a single business-architecture clause.*

*ADR-022 (PROPOSED / DRAFT) — refines the realization of Doc-7D §4, supersedes nothing. Records the
Architecture Board's Vendor Microsite IA Revision; realized by the Doc-7D additive patch + FE WBS M2.7–M2.16.
Awaits human/Board approval; not folded into the frozen ADR Compendium by any AI action (CLAUDE.md §7 rank 1
immutable to skills).*
