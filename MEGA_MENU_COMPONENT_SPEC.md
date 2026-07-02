# Mega Menu System — Component Specification

**Status:** DRAFT v1.0 — design companion (NON-authoritative). **Documentation only.**
**Date:** 2026-07-02 · **Parent:** `MEGA_MENU_ARCHITECTURE.md` · types in `MEGA_MENU_DATA_MODEL.md`.

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
