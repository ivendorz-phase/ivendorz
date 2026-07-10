# Mega Menu System — Implementation Plan

**Status:** DRAFT v1.0 — design companion (NON-authoritative). **Documentation only — implementation
starts only after this package is approved.**
**Date:** 2026-07-02 · **Parent:** `MEGA_MENU_ARCHITECTURE.md`.
**APPROVED — owner Board session 2026-07-03** (with Taxonomy Content v1.0 P1). **Implementation
authorized: FE-PUB-09, phases 0–5 in one run** (WP card
`governanceReviews/milestones/fe-pub-09-mega-menu/WORK-PACKAGE.md`). Owner-delta phase amendments:
Phase 1 additionally lands the Category Landing Contract rebind/enrichment, the header Post RFQ
CTA (header-scope, not a menu component), `MegaMenuFeatured` (pulled forward from Phase 4) and the
addendum slots (`MegaMenuPopular`/`MegaMenuVendors`/`MegaMenuQuickActions`/`MegaMenuIndustryStrip`/
`MegaMenuTrail`), `/categories` Browse A–Z, the global empty-state panel, breakpoint table, z-index
ladder, and touch hover suppression; Phase 3 adds `<mark>` highlighting, the `/` shortcut, and the
typed `MenuAnalyticsEvent` envelope (+ `quick_action_clicked`); Phase 4 adds the reserved authed
slots (render-nothing defaults) and the preload/prefetch ladder; Phase 5 validates the ARCHITECTURE
§9.6 performance budget table row-by-row.

Standing constraints for every phase: presentation-only (no wiring, no coined contracts) ·
taxonomy consumed verbatim from Taxonomy Content v1.0 (seed generated from
`docs/product/requirements/CATEGORY_MIGRATION_PLAN.md` Appendix C — never hand-copied) · kit conventions
(`src/frontend/`, `--iv-*` tokens, forwardRef/className, static gates: `tsc` + eslint + prettier
green per milestone) · per-milestone adversarial review before advancing (established team practice).

---

## Phase 0 — Foundations (prerequisite, small)
- Vendor the missing primitives demand-driven: `navigation-menu`, `accordion`, `popover` into
  `src/frontend/primitives/` (Radix, `--iv-*` themed, same idiom as the existing twelve).
- `navigation/model/`: `types.ts` (CategoryNodeVM, overlay), `taxonomy-index.ts` (pure, unit-tested:
  forest build, pathTo, filter), `icon-registry.ts` (13 root glyphs minimum).
- Seed generator script: Appendix C master table → `taxonomy.v1.json` + drift check (fails if a
  slug/level/parent mismatch vs the canonical table).
- Providers: `TaxonomyProvider`, `NavigationMenuStateProvider` (controlled-prop escape hatches).
- **Exit:** index unit tests green; seed generated & validated (794 nodes); providers render children.

## Phase 1 — Desktop Mega Menu
- `MegaMenu` + Trigger + Content + Column + Section + Category + Footer; safe-triangle hover intent;
  disclosure-pattern semantics; column-local overflow; server-rendered trigger row + L1/L2 links for
  SEO; `next/dynamic` panel.
- `CategoryIcon`, `CategoryBadge`, `CategoryCard` (tree tier subset the desktop needs).
- Mount on the public header (`SiteHeader`) as the Industrial Category Explorer instance; `/categories`
  inline variant (same components, no popover) as the no-JS/SEO fallback destination.
- **Exit:** keyboard map fully working (UX doc §4); axe/WCAG-AA pass on the panel; hover parity with
  click; zero taxonomy strings in code (data-driven proof: swap seed → menu follows).

## Phase 2 — Mobile & shared tree
- `CategoryTree` (modes: accordion, tree) + `CategoryNodeItem`; `MegaMenuMobile` (Sheet) +
  `MegaMenuBreadcrumb`; hybrid accordion/drill-in with back navigation.
- Marketplace sidebar tree instance; picker mode groundwork (`selectable`, controlled `value`) —
  actual RFQ/vendor picker surfaces adopt it in their own milestones (app-side caps/validation).
- **Exit:** m-03-style walkthrough on mobile (find centrifugal pump / SS316 butterfly valve /
  fire-protection contractor in ≤4 taps each); Sheet a11y (trap, swipe rules); reduced-motion pass.

## Phase 3 — Quick category search
- `MegaMenuSearch` (combobox, debounced pure filter over the index; synonyms from the taxonomy
  package starter set baked into the overlay).
- Result trail rendering, reveal-in-columns behavior, zero-result handoff link to real search.
- `menu_search_zero` analytics hook (feeds the synonym growth loop — governance §9).
- **Exit:** "genset", "GI pipe", "PFI" resolve to the right nodes; zero-result path verified; no
  network activity from the menu (proof: offline panel works fully).

## Phase 4 — Motion & polish
- Token-driven transitions (panel fade/slide, column cascade ≤ 120 ms, mobile pane slides);
  `prefers-reduced-motion` = instant everywhere; safe-triangle tuning on real devices.
- Featured tier (`MegaMenuFeatured`) with overlay curation for the 13 roots; empty-collapse rules.
- **Exit:** interaction-latency budget met (open < 100 ms after code loaded; drill < 16 ms/frame);
  visual QA across light/dark (semantic tokens only — no literal colors found in review).

## Phase 5 — Optimization & rollout
- Memoization audit (React Profiler: hover drill re-renders only the affected column); bundle audit
  (panel chunk budget ~25 KB gz excluding icons; icons tree-shaken via registry).
- Virtualization decision checkpoint: confirm max sibling list still < 50 → explicitly skip (record
  in review log); document the threshold trigger.
- Adapter readiness: `TaxonomySource` seam demo — seed impl swapped for a mock contract impl in a
  test to prove zero component changes when `[ESC-7-API-CATNAV]` lands.
- Rollout order: `/categories` page → public header → marketplace sidebar → mobile drawer → picker
  adoption by buyer/vendor/admin surfaces in their own team milestones.
- **Exit:** QCT-style gate (BLOCKER/MAJOR/MINOR = 0) on the package; Reuse Register entry for the
  navigation package; sign-off recorded.

---

## Dependencies & sequencing notes

| Dependency | Phase impact |
|---|---|
| Taxonomy Content v1.0 **P1 approval** (human gate, taxonomy package) | Blocks Phase 0 seed generation — the menu must not ship a tree the Board hasn't ratified |
| `[ESC-7-API-CATNAV]` public projection | Not a blocker (seed strategy); unlocks live data + counts/featured-suppliers later |
| `ESC-CLASS-ALIAS` / `ESC-CLASS-ATTR` | Not blockers; reserved seams (synonyms served, attribute flyouts) |
| Official brand SVGs / icon set (DP §10) | Root glyphs can launch from Lucide industrial set; custom glyph swap is registry-only |

## Risks

- **Hover-intent tuning** is device-sensitive → Phase 4 real-device pass; parameters are tokens, not
  constants.
- **Scope creep toward search engine** → hard rule + offline proof in Phase 3 exit.
- **Overlay drift vs taxonomy releases** → build-time lint (overlay key ∉ active slugs = warning;
  drift check vs Appendix C = failure).
- **Duplicate navigation implementations** by parallel teams → the package is the single home;
  Promotion Watchlist/Reuse Register entry lands in Phase 0 so other teams point at it early.
