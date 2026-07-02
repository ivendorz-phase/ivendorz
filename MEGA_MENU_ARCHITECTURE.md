# Mega Menu System — Architecture

**Status:** DRAFT v1.0 — design companion (NON-authoritative; supplements Doc-7 program; on conflict
the frozen corpus wins). **Documentation only — no implementation until approved.**
**Date:** 2026-07-02 · **Companions:** `MEGA_MENU_COMPONENT_SPEC.md` · `MEGA_MENU_DATA_MODEL.md` ·
`MEGA_MENU_UX_FLOW.md` · `MEGA_MENU_IMPLEMENTATION_PLAN.md` · realizes `information_architecture.md`
§5.3 + `ux_patterns.md` §3.2 (**Industrial Category Explorer**) · consumes **Taxonomy Content v1.0**
(`productSpec/CATEGORY_TAXONOMY_REVIEW.md` — canonical, not redesigned here).

---

## 0. Position in the platform

- **Naming.** The design corpus already renamed the consumer "mega menu" to **Industrial Category
  Explorer** for the public surface (IA §5.3). This package keeps that surface name; *"Mega Menu
  system"* refers to the reusable component family beneath it. Component names use the `MegaMenu*` /
  `CategoryTree*` prefixes; the public header instance is branded the Explorer.
- **Presentation layer only.** The system renders taxonomy data it is given. It never fetches inside
  the kit (kit rule BR4/BR10: no data fetch, no authoritative state, no domain hooks), never mutates
  taxonomy, never computes counts (GI-03), and never re-ranks anything (Content ≠ Presentation).
- **Single source of truth.** Taxonomy Content v1.0 (794 nodes, 13 roots, ≤4 levels — the frozen
  `level CHECK 1–4` guarantees depth) — hierarchy, names, and slugs are consumed verbatim. The
  **4-level cap is a data guarantee, not a rendering constant**: rendering is depth-recursive with no
  hardcoded level limit.
- **Known gap.** Public anonymous tree data is blocked by **`[ESC-7-API-CATNAV]`** (no Public
  `list_categories` projection). Architecture is adapter-based so surfaces work now from a build-time
  seed and switch to the contract without component changes (`MEGA_MENU_DATA_MODEL.md` §4).

## 1. Package layout (kit home — adapted recommendation)

The reusable-navigation-package recommendation is adopted, homed under the **frozen kit root
`src/frontend/`** (not `src/components/` — the kit home is settled platform foundation):

```
src/frontend/navigation/
├── mega-menu/                      # composed menu surfaces
│   ├── mega-menu.tsx               # MegaMenu (root, desktop)
│   ├── mega-menu-trigger.tsx       # MegaMenuTrigger
│   ├── mega-menu-content.tsx       # MegaMenuContent (popover panel)
│   ├── mega-menu-column.tsx        # MegaMenuColumn
│   ├── mega-menu-section.tsx       # MegaMenuSection
│   ├── mega-menu-category.tsx      # MegaMenuCategory (row/link item)
│   ├── mega-menu-featured.tsx      # MegaMenuFeatured
│   ├── mega-menu-search.tsx        # MegaMenuSearch (visible-node filter only)
│   ├── mega-menu-footer.tsx        # MegaMenuFooter
│   ├── mega-menu-mobile.tsx        # MegaMenuMobile (accordion drawer)
│   └── mega-menu-breadcrumb.tsx    # MegaMenuBreadcrumb (mobile drill trail)
├── category-tree/                  # headless-ish tree building blocks
│   ├── category-tree.tsx           # CategoryTree (recursive renderer)
│   ├── category-node.tsx           # CategoryNodeItem (one node row)
│   ├── category-card.tsx           # CategoryCard (rich tile; wraps kit CategoryTile idiom)
│   ├── category-icon.tsx           # CategoryIcon (registry-resolved)
│   └── category-badge.tsx          # CategoryBadge (new/featured/comingSoon chips)
├── providers/
│   ├── taxonomy-provider.tsx       # TaxonomyProvider — holds resolved tree + index (client ctx)
│   └── menu-state-provider.tsx     # NavigationMenuStateProvider — open/active/path UI state
├── model/
│   ├── types.ts                    # CategoryNodeVM, presentation overlay types
│   ├── taxonomy-index.ts           # byId/bySlug/children maps, path + filter helpers (pure)
│   └── icon-registry.ts            # category icon map (serializable key → Lucide), NAV_ICONS idiom
└── index.ts                        # package surface (re-exported from src/frontend/index.ts)
```

**New primitives required** (demand-driven vendoring, per kit policy — these do not exist yet):
`navigation-menu` (Radix), `accordion` (Radix), `popover` (already on the deferred list). Vendored
into `src/frontend/primitives/` with `--iv-*` theming like the existing twelve; the mega-menu tier
composes them and never talks to Radix directly.

**Consumers (one renderer, many surfaces):** public header Explorer · public mobile drawer nav ·
`/categories` full-page explorer · marketplace sidebar tree · buyer RFQ category picker (single-select,
gate-A2 target) · vendor onboarding category selector (multi-select, ≤10/≤5 caps shown, selection
enforcement stays app-side) · admin category browser. Pickers reuse `category-tree/` with selection
props; they do not fork rendering.

## 2. Component hierarchy

```
TaxonomyProvider (data: resolved CategoryNodeVM forest + index)
└─ NavigationMenuStateProvider (UI state: open, activePath[], drill stack, query)
   ├─ MegaMenu (desktop ≥ lg)
   │  ├─ MegaMenuTrigger ("All Categories" / per-root triggers)
   │  └─ MegaMenuContent            role=region, labelled panel
   │     ├─ MegaMenuSearch          (filters visible nodes only)
   │     ├─ MegaMenuColumn × N      (N = drilled depth, max 4 — data-bounded)
   │     │  └─ MegaMenuSection
   │     │     └─ MegaMenuCategory  (→ CategoryIcon · CategoryBadge · name · optional description)
   │     ├─ MegaMenuFeatured        (featured overlay nodes; optional slot)
   │     └─ MegaMenuFooter          ("View all …" links; contract-provided counts only, else none)
   └─ MegaMenuMobile (< lg; Sheet-based drawer)
      ├─ MegaMenuBreadcrumb         (drill trail + back)
      ├─ MegaMenuSearch
      └─ CategoryTree (accordion mode, lazy-mounted children)
```

`CategoryTree` is the shared recursive core; `MegaMenuColumn` and the mobile accordion are two
*projections* of the same node list + state, so desktop/mobile/picker never duplicate traversal
logic.

## 3. State management

| State | Where | Notes |
|---|---|---|
| Taxonomy data (forest + index) | `TaxonomyProvider` — immutable value, resolved **outside** the kit (server component / static seed) and passed down once | Never refetched by components; no duplication — single normalized index, nodes referenced by id |
| Open/closed, hover intent | `NavigationMenuStateProvider` (wraps Radix NavigationMenu state) | Hover-open with intent delay + safe-triangle (§UX doc); click/focus fallback |
| Active path (`activePath: id[]`) | `NavigationMenuStateProvider` | Single source for which columns render; length ≤ tree depth; drives desktop columns AND mobile drill stack |
| Search query + filtered id-set | `NavigationMenuStateProvider` | Pure filter over the index (name + slug + provided synonyms); debounced ~120 ms |
| Selection (pickers only) | **App-side, via props** (`value`/`onSelect`) | Caps (≤10/≤5), validation, persistence are application/domain concerns — never in the kit |
| Theme | none — tokens | Components read `--iv-*` semantic tokens; light/dark/future brands = zero code change |

No global store, no state library: two narrow contexts + controlled-prop escape hatches
(`open`/`onOpenChange`, `activePath`/`onActivePathChange`) so embedding apps can drive the menu.

## 4. Data flow

```
Taxonomy Content v1.0 (canonical)
   │  build step (Phase 1: generate from migration-plan Appendix C)
   ▼
taxonomy seed (static JSON, ~60 KB → ~15 KB gz)          ── later ──►  Public list_categories
   │  server component resolves + merges                              projection (ESC-7-API-CATNAV)
   ▼                                                                   via the same adapter interface
presentation overlay (icons/featured/order — keyed by slug, FE-owned)
   ▼
CategoryNodeVM forest + TaxonomyIndex  ──►  TaxonomyProvider  ──►  components (render only)
```

One direction, no back-channel: components emit navigation (hrefs) and callbacks (`onSelect`,
analytics hooks); nothing writes taxonomy. Counts/featured-supplier data render **only when
contract-provided** through the overlay (GI-03 — absence renders nothing, never a fabricated number).

## 5. Accessibility architecture (summary — full flows in UX doc)

- **Pattern:** WAI-ARIA **disclosure navigation** (recommended APG pattern for site-nav mega menus) —
  NOT `role="menu"` (menubar semantics break link navigation and screen-reader expectations).
  Triggers are buttons with `aria-expanded` + `aria-controls`; panel content is plain `<nav>` with
  lists of links; columns are labelled groups.
- Keyboard: TAB through triggers/links · Arrow keys move within and across columns · Enter/Space
  activates · ESC closes and returns focus to trigger · typeahead within a column · focus trap only
  in the mobile Sheet (never on desktop popover).
- Screen readers: each column labelled by its parent node name; drill state announced via
  `aria-current` on the active parent; search results count announced politely (`aria-live`).
- Touch targets ≥ 44 px; hover behavior has full click/tap parity (hover is an enhancement, never the
  only path).
- Reduced motion: all transitions honor `prefers-reduced-motion` (motion tokens already define
  durations/easings).

## 6. Responsive behavior (summary)

| Breakpoint | Surface | Behavior |
|---|---|---|
| ≥ lg (1024) | `MegaMenu` popover | Trigger row in header; hover/click opens; up to 4 columns, column count = drilled depth; no panel scroll until >~14 rows/column (then column-local scroll) |
| md | Same popover, ≤ 2 visible columns | Deeper drills replace columns (pane-swap) instead of adding |
| < lg mobile | `MegaMenuMobile` in kit `Sheet` | Accordion + drill-in panes, breadcrumb + back, animated (see UX doc); matches ux_patterns §3.2 "collapses to accordion drawer" |

## 7. Performance

- **Data:** whole tree ships once (794 nodes is small); normalized index built once
  (`taxonomy-index.ts`), memoized by reference. No per-surface copies — every consumer shares the
  provider value.
- **Render laziness:** column N mounts only when `activePath[N-1]` exists; mobile accordion children
  mount on first expand (and stay mounted for back-nav snappiness). Panel content is
  dynamic-imported (`next/dynamic`) so the header pays nothing until first open; trigger row is
  server-rendered.
- **Memoization:** node rows memoized on `(node.id, isActive, isFiltered)`; state provider exposes
  granular selectors so hover changes re-render only the affected column, not the panel.
- **Virtualization:** *not needed at v1.0 scale* (max sibling list ≈ 13). Threshold documented: if any
  sibling list exceeds ~50 (future markets), virtualize that column list only — decision recorded so
  nobody adds the dependency preemptively.
- **SEO:** L1/L2 links render in server HTML (crawlable `<a href>` to category routes) inside a
  `<nav aria-label="Categories">`; the interactive panel enhances progressively. Slugs come from
  taxonomy verbatim; SEO title/description fields ride the overlay for the future landing pages
  (NET-NEW surface — see data-model doc §5).

## 8. Boundaries (what this package must never do)

Never hardcode categories · never duplicate/fork taxonomy data · never fetch inside kit components ·
never implement product search (`MegaMenuSearch` filters already-loaded taxonomy nodes only —
`search_catalog` remains the search engine) · never invent counts/badges (overlay- or
contract-provided only) · never encode Trust/Tier/Performance signals in navigation · never gate or
rank anything (matching is M3's; menus are links).
