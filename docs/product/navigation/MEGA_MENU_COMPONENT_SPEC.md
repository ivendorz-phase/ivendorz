# Mega Menu System — Component Specification

**Status:** DRAFT v1.0 — design companion (NON-authoritative). **Documentation only.**
**Date:** 2026-07-02 · **Parent:** `MEGA_MENU_ARCHITECTURE.md` · types in `MEGA_MENU_DATA_MODEL.md`.
**APPROVED — owner Board session 2026-07-03**; owner deltas → **Approval Addendum** at end of file
(new slot components, keyboard table, caps). v1.0 body unchanged; one default amended by the
addendum: `MegaMenuCategory.hrefFor` default is now `/marketplace/category/[slug]` (Category
Landing Contract, ARCHITECTURE §9.1).

Conventions: all components are presentation-only, styled exclusively via `--iv-*` semantic tokens,
`forwardRef` + `className` pass-through (kit idiom), no data fetching, no domain logic. `children`
slots follow the kit's composition style (Radix-like compound components). Event props are plain
callbacks; analytics fire through optional `onNavigate`/`onOpen` hooks (never auto-wired).

---

## Providers

### `TaxonomyProvider`
- **Purpose:** Holds the resolved, immutable taxonomy forest + normalized index for every consumer
  beneath it. Data is resolved by the app layer (server component / static seed / future contract
  adapter) — the provider never fetches.
- **Props:** `forest: CategoryNodeVM[]` · `overlay?: PresentationOverlay` · `children`.
- **Exposes (hook `useTaxonomy`):** `roots` · `byId(id)` · `bySlug(slug)` · `childrenOf(id)` ·
  `pathTo(id)` · `filter(query): CategoryNodeVM[]` (name/slug/synonym match, pure, memoized).
- **Notes:** one instance per surface tree; nested providers forbidden (dev-mode warning).

### `NavigationMenuStateProvider`
- **Purpose:** UI state for one menu instance: open state, active drill path, mobile drill stack,
  search query.
- **Props:** `open?/onOpenChange?` · `activePath?/onActivePathChange?` (controlled escape hatches) ·
  `hoverIntentDelay?: number` (default 80 ms in / 250 ms out) · `children`.
- **Exposes (hook `useMenuState`):** `open` · `activePath` · `setActiveAt(level, id)` · `drillIn(id)`
  / `drillBack()` (mobile) · `query/setQuery` · `close()`.

---

## Mega-menu tier

### `MegaMenu`
- **Purpose:** Desktop root. Composes trigger row + content panel; owns nothing but composition.
- **Props:** `roots?: CategoryNodeVM[]` (default: all provider roots) · `renderTrigger?` (slot) ·
  `maxColumns?: number` (default 4 — layout hint, **not** a data limit) · `className`.
- **Slots:** `<MegaMenu.Trigger>` · `<MegaMenu.Content>` (compound exports).
- **Example:**
  ```tsx
  <TaxonomyProvider forest={forest} overlay={overlay}>
    <NavigationMenuStateProvider>
      <MegaMenu>
        <MegaMenuTrigger label="All Categories" />
        <MegaMenuContent>
          <MegaMenuSearch />
          <MegaMenuColumns />        {/* renders Column × activePath depth */}
          <MegaMenuFeatured />
          <MegaMenuFooter viewAllHref="/categories" />
        </MegaMenuContent>
      </MegaMenu>
    </NavigationMenuStateProvider>
  </TaxonomyProvider>
  ```

### `MegaMenuTrigger`
- **Purpose:** The header affordance that opens the panel. Disclosure-pattern button
  (`aria-expanded`, `aria-controls`), hover-intent + click + Enter/Space/ArrowDown open.
- **Props:** `label: string` · `icon?: NavIconKey` · `asChild?` (Radix Slot idiom) · `className`.
- **Events:** `onOpen?()`.

### `MegaMenuContent`
- **Purpose:** The popover panel (portal, positioned under the trigger row; z-index
  `--iv-z-dropdown`). Handles outside-click/ESC close, focus return, reduced-motion.
- **Props:** `align?: "start"|"center"|"full-width"` (default full-width ribbon) · `className` ·
  `children`.
- **Slots:** free composition — search, columns, featured, footer in any arrangement.

### `MegaMenuColumn`
- **Purpose:** One drill level: a labelled list of sibling nodes at `level`, highlighting the active
  node; hovering/focusing a node with children sets `activePath[level]` → next column renders.
- **Props:** `level: number` · `parentId: string | null` · `emptyHint?: ReactNode` · `className`.
- **Events:** none of its own (delegates to `MegaMenuCategory`).
- **A11y:** `role="group"` + `aria-labelledby` (parent node name); column-local scroll past ~14 rows.

### `MegaMenuSection`
- **Purpose:** Optional visual grouping *inside* a column (e.g., splitting a long L2 list under
  headings from the overlay's `sectionLabel`). Purely presentational; taxonomy hierarchy is never
  altered by sectioning.
- **Props:** `label?: string` · `children` · `className`.

### `MegaMenuCategory`
- **Purpose:** A single node row/link: icon + name + optional description + badge + chevron when it
  has children. Renders a real `<a href>` (Next `Link`) to the node's route — always navigable even
  while acting as a drill trigger.
- **Props:** `node: CategoryNodeVM` · `active?: boolean` · `showDescription?: boolean` ·
  `hrefFor?: (node) => string` (default `/categories/[slug]`) · `className`.
- **Events:** `onActivate?(node)` (hover/focus drill) · `onNavigate?(node)` (click).
- **A11y:** child-bearing rows get `aria-haspopup="true"` + `aria-expanded`; 44 px min target.

### `MegaMenuFeatured`
- **Purpose:** Curated tiles (overlay `featured` nodes for the active root, or explicit list). Uses
  `CategoryCard`. Renders nothing when no featured data — never invents.
- **Props:** `nodes?: CategoryNodeVM[]` · `title?: string` (default "Featured") · `max?: number`
  (default 4) · `className`.

### `MegaMenuSearch`
- **Purpose:** Quick **taxonomy-node filter** — jumps to visible nodes. NOT product search: filters
  the already-loaded tree only (name, slug, overlay synonyms); no network, no `search_catalog`.
- **Props:** `placeholder?: string` · `maxResults?: number` (default 12) · `className`.
- **Events:** `onResultSelect?(node)`.
- **A11y:** combobox pattern (`role="combobox"` + listbox results); result count announced via
  polite live region; ESC clears query before closing panel.

### `MegaMenuFooter`
- **Purpose:** Panel footer: "View all categories" link, optional per-column "View all in {parent}"
  links, optional contract-provided count line.
- **Props:** `viewAllHref: string` · `counts?: { label: string }` (pre-formatted, provided — never
  computed) · `className`.

### `MegaMenuMobile`
- **Purpose:** The < lg surface: kit `Sheet` drawer containing breadcrumb, search, and the accordion/
  drill-in `CategoryTree`. Infinite nesting by recursion (depth bounded by data, not code).
- **Props:** `trigger?: ReactNode` (default hamburger row entry) · `hrefFor?` ·
  `extraSections?: ReactNode` (non-category nav passed through — this component never owns app nav) ·
  `className`.
- **Events:** `onNavigate?(node)`.

### `MegaMenuBreadcrumb`
- **Purpose:** Mobile drill trail (Root › L2 › L3) with back affordance; truncates middle on narrow
  widths (leaf + back always visible — mirrors ux_patterns §3.3 mobile rule).
- **Props:** `className`. Reads the drill stack from `useMenuState`.
- **Events:** `onCrumbSelect?(node|root)`.

---

## Category-tree tier (shared building blocks)

### `CategoryTree`
- **Purpose:** The recursive renderer every surface shares. Three display modes; identical traversal.
- **Props:** `mode: "columns" | "accordion" | "tree"` · `rootId?: string | null` ·
  `selectable?: "none" | "single" | "multi"` (picker surfaces) · `value?/onChange?` (controlled
  selection — **cap/validation logic stays app-side**; the tree only renders `disabled`/`selected`
  states it is told) · `renderNode?` (render-prop override) · `hrefFor?` · `filterQuery?` ·
  `className`.
- **Events:** `onNavigate?(node)` · `onExpand?(node)`.
- **A11y:** `tree`/`treeitem` roles in `tree` mode; disclosure lists in `accordion` mode.

### `CategoryNodeItem`
- **Purpose:** One row in tree/accordion modes (icon, name, badge, expander, optional checkbox/radio
  in picker modes). `MegaMenuCategory` is its column-mode sibling; both are thin over shared markup.
- **Props:** `node` · `expanded?` · `selected?` · `disabled?` · `depthIndent?: boolean` · `className`.
- **Events:** `onToggle?` · `onSelect?` · `onNavigate?`.

### `CategoryCard`
- **Purpose:** Rich tile (icon box + name + optional description/image) for featured grids and the
  `/categories` landing — the grown-up sibling of the existing kit `CategoryTile` (same VM idiom,
  extended with overlay fields). Landing surfaces migrate to it without breaking `CategoryTile`.
- **Props:** `node: CategoryNodeVM` · `href` · `size?: "sm"|"md"|"lg"` · `showDescription?` ·
  `className`.

### `CategoryIcon`
- **Purpose:** Resolves a node's overlay `icon` key through the icon registry
  (`model/icon-registry.ts`, same serializable-key idiom as shell `NAV_ICONS`); falls back to the
  root's default glyph, then to a neutral shape. Never inline-imports arbitrary icons.
- **Props:** `node | iconKey` · `size?: number` (default 20) · `className`.

### `CategoryBadge`
- **Purpose:** Overlay-state chips: `new` · `featured` · `comingSoon` · custom `badge` text. Maps to
  kit `Badge`/`StatusChip` tones (featured → amber premium tokens). Renders nothing without overlay
  data. **Never** renders governance signals (trust/tier/performance are not navigation chips).
- **Props:** `node` · `className`.

---

## Composition examples

**Sidebar tree (marketplace):**
```tsx
<TaxonomyProvider forest={forest}>
  <CategoryTree mode="tree" hrefFor={(n) => `/marketplace?category=${n.slug}`} />
</TaxonomyProvider>
```

**Buyer RFQ category picker (single-select, A2 target):**
```tsx
<CategoryTree mode="accordion" selectable="single"
  value={selectedId} onChange={setSelectedId}
  renderNode={(n, d) => d.isLeafOrDeepEnough ? d.defaultRender : d.defaultRender /* app decides pickable grain */} />
```

**Vendor onboarding selector (multi, caps enforced by the app):**
```tsx
<CategoryTree mode="accordion" selectable="multi"
  value={assignedIds} onChange={proposeAssignments /* app enforces ≤10/≤5 + proposed lifecycle */} />
```

---

## Approval Addendum (v1.1, 2026-07-03 — additive; owner Board findings)

All addendum components follow the base conventions (presentation-only, `--iv-*` tokens,
`forwardRef`/`className`, data via props, **render nothing when their data is absent** — GI-03
no-fabrication). Max-item caps (R2-NITPICK-05): popular searches ≤ 8 · industry chips ≤ 6 ·
vendor rows ≤ 5 · featured tiles ≤ 4 · search results ≤ 12; overflow truncates editorially, these
strips never scroll.

### `MegaMenuPopular` (owner delta)
- **Purpose:** "Popular Searches" chip strip (panel footer region + mobile drawer root pane) —
  industrial users search by item, not category. Chips navigate to `/search?q={term}`.
- **Props:** `terms?: PopularSearchTerm[]` (app-supplied; the public instance reuses the curated,
  seed-verified `POPULAR_SEARCHES` from the discovery seed — RV-0121 provenance) · `max?` (≤8) ·
  `className`. **Events:** `onTermSelect?(term)`.

### `MegaMenuVendors` (MAJOR-02 — Invariant #1 binding, ARCHITECTURE §9.2)
- **Purpose:** "Top Vendors for {category}" rows for the active branch + "View all suppliers →"
  link. Vendor typing = frozen capability-matrix chips ONLY (Supply/Service/Fabricate/Consult);
  trade-role labels are rejected coins.
- **Props:** `vendors?: MenuVendorVM[]` (app-supplied, ≤5) · `viewAllHref: string` ·
  `title?: string` · `className`. **Events:** `onVendorNavigate?(vendor)`.

### `MegaMenuQuickActions` (MINOR-03, trimmed)
- **Purpose:** Panel footer action row: Post RFQ (→ `/login` on public) · Browse Vendors
  (→ `/vendors`) · Compare Vendors (→ `/compare`). Links only to existing surfaces.
- **Props:** `actions?: QuickAction[]` (label + href + icon key; defaults to the three above on the
  public instance) · `className`. **Events:** `onActionClick?(action)` (feeds
  `quick_action_clicked`).

### `MegaMenuIndustryStrip` (MINOR-04)
- **Purpose:** Overlay-curated industry entry chips (e.g. Pharmaceutical / Food / Chemical /
  Textile) — buyers who start from industry. Data from the overlay (`industryShortcuts`), links
  only to existing surfaces; never hardcoded, never a dead route.
- **Props:** `shortcuts?: IndustryShortcut[]` · `max?` (≤6) · `className`.

### `MegaMenuTrail` (MINOR-07 breadcrumb preview)
- **Purpose:** Desktop status row rendering the ancestor trail of the active/hovered node
  (*Mechanical › Pumps › Centrifugal*) before any click — same trail renderer as search results.
- **Props:** `className`. Reads `activePath` from `useMenuState`.

### `MegaMenuRecent` (MINOR-01 · R2-MINOR-01 — reserved, data-gated)
- **Purpose:** Reserved authenticated slots: **Recently Viewed** and **Frequently Used Categories**
  (repeat-buy procurement behavior). Render only when the app supplies items — the kit never reads
  localStorage or fabricates history. Wiring deferred to an authed milestone.
- **Props:** `recent?: CategoryNodeVM[]` · `frequent?: CategoryNodeVM[]` · `pinned?:
  CategoryNodeVM[]` + `onPinToggle?` (MINOR-02 — favorites are M2-owned; enforcement app-side) ·
  `className`.

### Expanded `MegaMenuFeatured` tile types (MAJOR-03 — lands Phase 1)
The right-most rail hosts overlay-curated tiles: Featured Category (`CategoryCard`) · Popular
Products (contract/seed-provided) · Industry Highlight · Buying-Guide link (only when a real
`/resources` target exists). Each tile type collapses when its data is absent.

### Consolidated keyboard shortcuts (R3-NITPICK-01 — one table, every consumer surface)

| Key | Action |
|---|---|
| `/` | Focus `MegaMenuSearch` (panel open) |
| `Esc` | Close panel (in search: first `Esc` clears the query) |
| `←` / `→` | Column navigation (previous parent / enter children) |
| `↓` / `↑` | Next / previous row (wraps within column) |
| `Home` / `End` | First / last row in column |
| `Enter` / `Space` / `↓` on trigger | Open panel |
| `Enter` on row | Navigate (or **select** in picker surfaces) |
| `a–z` | Typeahead within column |
| `Tab` / `Shift+Tab` | search → columns (active path) → featured → footer; Tab past end closes |

### Search result highlighting (R2-NITPICK-03)
`MegaMenuSearch` results wrap the matched substring in an accessible `<mark>` (token-styled).

### Touch hover suppression (R2-NITPICK-02)
Hover-open paths activate only under `@media (hover: hover) and (pointer: fine)`; coarse/hybrid
pointers are tap/click-to-open only.
