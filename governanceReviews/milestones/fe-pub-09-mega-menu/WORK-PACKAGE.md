# WORK PACKAGE — FE-PUB-09 Mega Menu & Taxonomy Nav (Industrial Category Explorer)

- Lane: G (full Dev → Review-A [Team-4] → Review-B [Team-5] → close; L size, new kit package +
  header/nav surface + category-landing rebind — architecture-sensitive)
- Reviewed-SHA record: **`4d1aae8`** (fix-and-reverify checkpoint, round 3 — supersedes `d455151`
  and `7e95dce`; see Fix-and-reverify section below). Phase checkpoints: 1957857 P0 ·
  53c8649+971aa76 P1 · aee81c2 P2 · 22d501c P3 · ad62cfe P4 · 7e95dce P5; docs/gates 6da2e1d.
  NOTE for reviewers: parallel sessions share this working tree — 53c8649/22d501c carry a few
  unrelated FE-BUY-10/FE-VEN-11 tracker/screenshot files swept by concurrent commits; the
  FE-PUB-09 delta is the navigation package + explorer/header/categories/landing files listed here.

## Fix-and-reverify (RV-0126 addendum, 2026-07-03) — 3 rounds, the real root cause found at round 3

The first Dev → Review-A → Review-B pass at `7e95dce` both PASSed (0 BLOCKER/MAJOR/MINOR) and
`execution-board.md` briefly recorded the milestone "APPROVED... Team-1 to commit + pull
FE-PUB-10" — **that instruction was never acted on** (no `milestone(FE-PUB-09): close` commit
exists at any point in this cycle) and is now superseded. A second, independently-dispatched
Review-B ran the one check both the first Review-A (finding 7) and first Review-B (its own
carried-forward OBS) had explicitly deferred — a real `next build --turbopack`, run in an isolated
same-drive git worktree with a genuine `pnpm install` (not a `node_modules` symlink/junction —
Turbopack's production bundler hard-rejects any reparse point as "pointing out of the filesystem
root") specifically to avoid touching the shared dev cache active parallel sessions depend on.

**Found (round 1 Review-B): 1 MAJOR.** `app/(public)/_components/explorer/explorer.tsx`'s
`ExplorerMenu` and `app/(public)/_components/site-header.tsx`'s `ExplorerMobile` both used
`React.lazy(() => import(...))` at module scope — correct-looking in source, indistinguishable
from correct in a dev server — but Turbopack's *production* bundler injects the resulting chunk
as an eager `<script async>` tag into every public page's initial HTML, including pages with zero
relationship to the mega-menu. Confirmed via Playwright network tracing on a cold `next start`
server with zero interaction. Directly contradicts `explorer.tsx`'s own documented contract ("the
header pays nothing until first hover intent") and `MEGA_MENU_ARCHITECTURE.md` §9.5.

**Round 1 fix** (checkpoint `d455151`): both call sites switched from `React.lazy` to
`next/dynamic(() => import(...), { ssr: false })`. Self-verified via the same isolated-build
method — but that verification used "Post RFQ"/"All Categories"/"MegaMenu" as a content
fingerprint to identify the chunk, and **that fingerprint was a false positive**: "Post RFQ" is
also `SiteHeader`'s own always-rendered CTA text, so the check couldn't actually distinguish the
lazy chunk from the always-loaded header chunk. This was only caught at round 2.

**Found (round 2 Review-B, fresh dispatch): REGRESSION.** The independently-dispatched round-2
Review-B rebuilt in its own isolated worktree and reproduced the identical eager `<script async>`
defect — `next/dynamic({ ssr: false })` doesn't solve it either. `ssr: false` only suppresses
server rendering; it doesn't remove the module from the route's client-reference-manifest, which
is what Turbopack's production bundler uses to decide what to eagerly inject.

**Round 2 fix** (checkpoint `631f26a`): removed the `React.lazy`/`next/dynamic` module-scope
boundary entirely from both `explorer.tsx` and `site-header.tsx`, replacing it with a bare
`import()` call made only inside the interaction handler, with the resolved component held in
local state (no lazy-loading API at all — just a manual promise). Self-re-verified — **using the
same flawed "Post RFQ" fingerprint again**, which again produced a false "fixed" read.

**Found (self-caught before round 3 Review-B, using a corrected fingerprint): the round-2 fix
ALSO didn't work.** Re-running the identical isolated-build verification with a precise,
non-ambiguous signal (the literal component name `MegaMenuVendors`, which exists nowhere outside
the `mega-menu/*` component tree — confirmed by locating the exact chunk file containing it and
cross-checking it against `SiteHeader`'s own bundle) showed the chunk was **still** eagerly
`<script async>`'d on `/about`. The lazy-loading API on the trigger side was never the actual
leak.

**Real root cause, found by tracing the precise chunk's other imports:** the mega-menu package's
barrel file (`src/frontend/navigation/index.ts`) re-exports BOTH the lightweight, always-needed
model/provider code AND every heavy interactive `MegaMenu*` component from ONE `index.ts`.
`app/(public)/_components/explorer/explorer-seo-nav.tsx` — the zero-JS, server-rendered,
crawlable category-links baseline, rendered directly in `app/(public)/layout.tsx` (every public
route, always, by design — it's the progressive-enhancement fallback for the interactive
Explorer) — imported `buildTaxonomyIndex`/`categoryHref`/`OVERLAY_V1` **through that same barrel**.
Turbopack's production tree-shaking wasn't granular enough to prove the barrel's unused
`MegaMenu*` re-exports were safe to drop when only the lightweight exports were referenced, so
importing anything through the barrel from an always-eager component pulled the ENTIRE mega-menu
chunk in as collateral. Neither prior fix round touched this file, because both were focused on
the trigger-side lazy-loading API, which was never where the leak actually was.

**Round 3 fix** (checkpoint `4d1aae8`): `explorer-seo-nav.tsx` now imports directly from the
concrete `model/taxonomy-index.ts`/`model/types.ts`/`model/overlay.v1.ts` files it actually needs,
bypassing the `@/frontend/navigation` barrel entirely. `model/*` and `mega-menu/*` are separate
subtrees with no other shared dependency, so this fully decouples the always-eager path's module
graph from the interactive package. The round-2 manual-`import()` fix on the trigger side stays —
it's still correct, just wasn't sufficient on its own; both fixes are needed together.

**Round 3 re-verification, with a corrected methodology closing the gaps both prior rounds
missed:**
- **Precise signal**: identified the chunk by grepping for the literal string `MegaMenuVendors`
  (a name that cannot appear in `SiteHeader`'s own bundle or anywhere outside the `mega-menu/*`
  tree), not a generic marketing string.
- **Negative path, 3 pages**: the identified chunk (`077f93c84a0fc493.js`) has **zero**
  references — no `<script>` tag, no `<link rel="modulepreload">`, no `<link rel="prefetch">` of
  any kind, checked by grepping the full served HTML — on `/about` (unrelated page) and `/`
  (the landing page hosting the trigger). A second matched chunk (`5ec4df5ef8e968e2.js`, part of
  the mega-menu tree but a different split point) legitimately DOES appear on `/categories`,
  which directly and intentionally renders the interactive category tree inline — correctly
  eager there, not a defect.
- **Positive path (never directly confirmed by any prior round)**: real Playwright browser
  automation (`@playwright/test`'s `chromium`, not just `curl`/static HTML inspection) with
  network-request tracing (`page.on("request")`) confirms the mega-menu chunk is **not**
  requested on initial `/` page load, and **is** requested within ~500ms of hovering the desktop
  Explorer trigger. Same confirmation for the mobile drawer: chunk not requested until the sheet
  is opened via tap.
- Isolated same-drive `git worktree` + genuine `pnpm install` + `next build --turbopack` +
  `next start`, fully independent of the shared dev cache, per the established safe-verification
  method; worktree and processes cleaned up after.

Re-submitted to a fresh Review-A per Amendment v1.3's unified re-review rule (any Review-B ISSUES
always re-enters at A, never a B-only shortcut). Full record:
`project-management/review-log.md` RV-0126 addendum (rounds 1–3).

## Build adaptations & disclosures (for Review-A — deviations from the letter of the package)

1. **MegaMenu disclosure is direct, not Radix NavigationMenu** — Radix NM injects an internal
   `position:relative` wrapper that pins the panel to trigger width and its `defaultValue`
   doesn't hold open on mount (both found live in the Phase 5 Playwright walkthrough). The spec's
   behavior contract (WAI-ARIA disclosure-nav, hover-intent, ESC/outside-click/focus rules) is
   implemented directly over `NavigationMenuStateProvider`; the vendored `navigation-menu`
   primitive stays in the kit for simpler navs. Behavior-faithful; composition detail differs.
2. **Sidebar-tree home** — the spec's "marketplace sidebar" instance mounts on the CATEGORY
   LANDING aside (`/marketplace/category/[slug]`): the shipped marketplace hub (P-PUB-10, closed)
   has no sidebar region by design; the landing drill surface is where route-aware
   `aria-current` is meaningful.
3. **Seed size** — `taxonomy.v1.json` measures 169.7KB raw / **35.6KB gz** (doc §4 estimated
   ~60KB/15KB; deterministic UUID ids dominate). Static, cached, ships once; the ≤25KB-gz budget
   row is the panel CODE chunk (excl. data/icons) — formal bundle audit deferred to the next
   stable `next build` (dev-only servers this session; a build would clobber the shared
   turbopack cache under parallel sessions). Disclosed, not silently passed.
4. **Legacy slug union** — the landing resolves taxonomy-v1 slugs UNION the 15 legacy interim
   slugs so links on closed surfaces stay alive (additive; unknown slugs still render the
   not-found UI byte-identically — note: this dev environment returns HTTP 200 with the 404 UI
   for ALL notFound() routes incl. the pre-existing `/vendors/[slug]`, environment-wide, not a
   regression).
5. **Synonym starter set** — 8 entries authored from Appendix C design notes (genset/GI pipe/
   PFI etc., unit-tested); `menu_search_zero` is the documented growth loop.
6. **Interactive verification** — 28/28 Playwright checks (desktop keyboard map, hover drill,
   `/` focus, synonym search, zero-result handoff, strips, ESC; mobile ≤4-tap m-03 walkthrough,
   breadcrumb Back; /categories inline + A–Z; L4 landing journey) + axe 0 critical/serious on
   panel-open, drawer-open, and landing.

## Board ruling (this milestone's unlock — recorded 2026-07-03)

Owner Board session (live planning session, review-log entry `BOARD-2026-07-03-B`) cleared the
double gate: **Taxonomy Content v1.0 P1 APPROVED** (794-node tree ratified for build-time seeding
from `productSpec/CATEGORY_MIGRATION_PLAN.md` Appendix C) + **`MEGA_MENU_*.md` package APPROVED**
(5 root docs, DRAFT → APPROVED via additive status lines + Approval Addenda). Full phases 0–5
authorized in one milestone run. Soft gate `[ESC-7-API-CATNAV]` unchanged (open) — build-time seed
interim; `TaxonomySource` adapter seam must prove the zero-component-change swap at Phase 5.

## Owner findings — adjudication record (§13 Validate-Findings, 3 rounds)

| # | Finding | Disposition |
|---|---|---|
| MAJOR-01 | Category Landing Contract | **ACCEPTED** — menu rows → existing `/marketplace/category/[slug]` (FE-PUB-04); rebind to taxonomy index (794 slugs); hero breadcrumb + related-categories rail; counts/featured-suppliers contract-gated (ARCH §9.1) |
| MAJOR-02 | Vendor discovery in panel | **ACCEPTED with Invariant-#1 binding** — `MegaMenuVendors` data-gated slot; capability-matrix chips ONLY; **"Manufacturer/Importer/Distributor/Contractor" trade-role labels REJECTED as coined** (ARCH §9.2) |
| MAJOR-03 | Featured right column | **ACCEPTED** — `MegaMenuFeatured` expanded tile types, pulled forward to Phase 1; every tile collapses when data absent |
| MINOR-01 | Recently Viewed (authed) | **ACCEPTED as reserved data-gated slot** — props-only, wiring deferred |
| MINOR-02 | Saved/pinned categories | **ACCEPTED as reserved slot** — favorites M2-owned; enforcement app-side |
| MINOR-03 | Quick actions | **ACCEPTED (trimmed)** — Post RFQ · Browse Vendors · Compare Vendors; "Request Quote" dropped (duplicate verb) |
| MINOR-04 | Industry shortcuts | **ACCEPTED** — overlay-authored chips, existing routes only, ≤6 |
| MINOR-05 | Vendor type filters | **PARTIAL** — frozen 4-flag capability matrix only (same Inv#1 binding as MAJOR-02) |
| MINOR-06 | A–Z browse | **ACCEPTED** — `/categories` secondary alphabetical index |
| MINOR-07 | Breadcrumb preview | **ACCEPTED** — `MegaMenuTrail` status row |
| NIT×8 (R1) | counts-gated · icon override · 1440px cap · lazy icons · hover prefetch · RTL · skeleton · z-stacking | **ALL ACCEPTED** (several already spec'd — confirmed, not re-coined) |
| R2-MINOR-01 | Frequently Used Categories | **ACCEPTED** — second reserved authed slot |
| R2-MINOR-02 | Global empty-state contract | **ACCEPTED** — degraded panel w/ 3 working links; build fails on seed drift (UX §9) |
| R2-MINOR-03 | Breakpoint table | **ACCEPTED** — <1024 drawer / 1024–1280 4-col / 1280–1600 5-col / >1600 capped 1440px (ARCH §9.3) |
| R2-MINOR-04 | Hover preload ladder | **ACCEPTED (adapted)** — data ships server-side; ladder = panel chunk + index (ARCH §9.5) |
| R2-NIT×5 | z-index ladder · touch hover suppression · `<mark>` highlight · intent-only prefetch · max-item caps | **ALL ACCEPTED** |
| R3-NIT-01 | Keyboard shortcut table | **ACCEPTED** — consolidated table + new `/` binding (SPEC addendum) |
| R3-NIT-02 | Analytics event contract | **ACCEPTED (harmonized)** — typed `MenuAnalyticsEvent` envelope under the spec's existing event names + `quick_action_clicked`; proposed `category_open`/`category_selected` names mapped, not forked |
| R3-NIT-03 | Performance budget table | **ACCEPTED** — package-level consolidation (ARCH §9.6); coins no Doc-8 platform budget |
| Future AI | Recommended/Trending/Seasonal slots | **DOCUMENTED, NOT BUILT** — M9-gated (ARCH §9.7) |

Owner deltas (directives, not findings): **Post RFQ prominent header CTA** (→ `/login`,
presentation-only; header scope) · **Popular Searches strip** (`MegaMenuPopular`, reuses
RV-0121-verified curated terms).

## In scope (phases 0–5 per `MEGA_MENU_IMPLEMENTATION_PLAN.md` + Approval Addenda)

- **Phase 0:** vendor `navigation-menu`/`accordion`/`popover` primitives; `src/frontend/navigation/`
  model (types/taxonomy-index/icon-registry) + providers; seed generator
  (`scripts/generate-taxonomy-seed.mjs`: Appendix C → `taxonomy.v1.json`, 794 nodes, drift check);
  index unit tests.
- **Phase 1:** desktop panel components + addendum slots; SiteHeader mount (Industrial Category
  Explorer) + **Post RFQ CTA**; `/categories` inline variant + Browse A–Z; **category landing
  rebind/enrich** (`app/(public)/marketplace/category/[slug]/page.tsx`); global empty state;
  breakpoints; z-index tokens; touch suppression.
- **Phase 2:** `CategoryTree`/`CategoryNodeItem`; `MegaMenuMobile` + `MegaMenuBreadcrumb`;
  marketplace sidebar instance; picker groundwork (`selectable`/`value` — caps app-side).
- **Phase 3:** `MegaMenuSearch` (pure taxonomy filter, synonyms starter set, `<mark>` highlight,
  zero-result handoff, `/` binding); typed analytics callbacks.
- **Phase 4:** motion tokens + reduced-motion; featured curation for 13 roots; reserved authed
  slots (render-nothing); preload/prefetch ladder; nitpick sweep (max-width, lazy icons, RTL
  logical properties, caps).
- **Phase 5:** perf-budget validation (ARCH §9.6); memoization/bundle audit; virtualization
  skip-record; `TaxonomySource` adapter demo; rollout order.

## Out of scope (explicit — scope creep against this list is a Review-A finding)

- Wiring any contract (`list_categories`, `search_catalog`, counts, featured suppliers) — stays
  presentation-only under `[ESC-7-API-CATNAV]`.
- Vendor trade-role labels (Manufacturer/Importer/Distributor/Contractor) — **rejected coins**.
- Product search inside the menu — `MegaMenuSearch` filters loaded taxonomy nodes only.
- Recently-viewed/frequently-used/pinned **wiring** (auth + analytics) — reserved slots only.
- AI recommendation slots — documented, disabled, M9-gated.
- Buyer RFQ picker / vendor onboarding / admin browser **adoption** — future consumer milestones;
  this milestone ships the shared tree + picker props only.
- Authenticated RFQ-create flow — Post RFQ CTA routes to `/login` only.
- Any edit to a FROZEN document or the frozen kit foundation (extend-only).

## Dependencies

- H: none remaining (double gate cleared 2026-07-03).
- S: `[ESC-7-API-CATNAV]` (live data, counts, featured suppliers) — interim seed disclosed in-page.

## Lifecycle ownership

Builder = Team-1 · Maintainer = Team-1 · Review A = Review Team 4 · Review B = Review Team 5 ·
Board = owner (dev-team self-close on a clean A:PASS ∧ B:PASS gate, Amendment v1.3 §13).
Coverage: FE-PUB-09 **owns no pages** (own-nothing by design); touches nav + P-PUB-07/08/09
surfaces + P-PUB-08 landing enrichment.

## Key dates

- Created / gates cleared / started: 2026-07-03 (owner Board ruling live in planning session)
- Closed: 2026-07-03 (after a 3-round fix-and-reverify cycle — see Fix-and-reverify section)

## DoD confirmation

☑ per-phase checkpoint commits (P0–P5) ☑ tsc/eslint/prettier green (every phase + every
fix-and-reverify round) ☑ seed drift-check green (13/13 unit tests) ☑ axe pass (0 violations,
panel-open/drawer-open/landing/category-landing, re-confirmed at every review round) ☑ perf table
validated (panel code chunk 16.1KB gz, under the ≤25KB-gz budget) ☑ byte-equivalence outside the
declared touch surface ☑ Invariant #1 clean (capability-matrix-only, no vendor trade-role labels —
independently verified 3 times) ☑ frozen-foundation extend-only (3 genuinely-new primitives, zero
existing primitive modified) ☑ Review A PASS (round 3, `4d1aae8`, 0 findings + 2 OBS) ☑ Review B
PASS (round 3, `4d1aae8`, 0 findings + 2 OBS, empirically re-verified via an independent isolated
build + real interaction tracing) ☑ gate approval (A:PASS ∧ B:PASS, BLOCKER=MAJOR=MINOR=0 IS the
approval signal per Amendment v1.3 §13) ☑ no TODO/dead code ☑ no duplicate components ☑ tracker
updated ☑ card closed

## Close record

**✅ Closed 2026-07-03**, at stable-target `4d1aae8`, after a 3-round fix-and-reverify cycle —
see the "Fix-and-reverify" section above for the complete history, including two fix attempts
that looked correct but weren't (both self-caught before or by an independent review, never
silently shipped) and the eventual empirically-confirmed root-cause fix. Full record:
`project-management/review-log.md` RV-0126 (original build + all 3 rounds).
