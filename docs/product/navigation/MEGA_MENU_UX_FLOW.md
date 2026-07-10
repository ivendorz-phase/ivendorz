# Mega Menu System — UX Flows

**Status:** DRAFT v1.0 — design companion (NON-authoritative). **Documentation only.**
**Date:** 2026-07-02 · **Parent:** `MEGA_MENU_ARCHITECTURE.md` · realizes `ux_patterns.md` §3.2
(Industrial Category Explorer: dense, professional, no consumer gimmicks — DP §1.3).
**APPROVED — owner Board session 2026-07-03**; owner deltas → **§9 Approval Addendum** below.

---

## 1. Desktop (≥ lg) — hover-first, click-parity

**Open**
1. Pointer enters `MegaMenuTrigger` → **hover intent** delay (~80 ms, token-tunable) → panel opens
   (fade+slide, `--iv-duration-fast`, `--iv-ease-out`; instant under `prefers-reduced-motion`).
2. Click / Enter / Space / ArrowDown on the trigger opens identically (hover is an enhancement —
   every flow works pointer-free).

**Drill (the four synchronized columns)**
1. Column 1 lists the 13 roots (icon + name). Hover/focus a root → column 2 renders its children;
   the root row shows active state (`--iv-surface-selected` tokens) + `aria-current`.
2. Hovering L2 → column 3; L3 → column 4. **Column count = drilled depth** — a shallow branch simply
   shows fewer columns; nothing is padded. Whole visible taxonomy, single-hover drilling (IA §5.3).
3. **Safe-triangle pointer tolerance**: moving diagonally from a parent row into its child column must
   not flip the active parent (triangle between cursor and the child column's corners; ~300 ms
   grace). This is the make-or-break mega-menu detail.
4. Every row is a real link: **click navigates** to the category route regardless of children;
   the chevron affordance signals drillability. "View all in {parent}" appears at each column head.

**Close** — ESC (focus returns to trigger) · outside click · pointer leaves panel+trigger union for
~250 ms · route navigation.

**Overflow** — a column exceeding the panel height (>~14 rows) scrolls locally with a fade cue;
the panel itself never scrolls the page.

## 2. Tablet (md)

Same popover; horizontal budget = 2 columns. Drilling past depth 2 **pane-swaps** (columns shift
left; a compact trail chip row appears above, e.g. `‹ Plant Utility Systems / Steam & Boilers`).
Touch: first tap on a parent = drill (opens children), tap on its name in the trail chip = navigate;
leaves navigate on first tap. Hover paths are inert; everything above works from tap/keyboard.

## 3. Mobile (< lg) — drawer, accordion + drill-in

1. Hamburger → kit `Sheet` slides in (nav sections passed through; "All Categories" section hosts
   the tree).
2. **Hybrid drill model** (matches ux_patterns §3.2 accordion-drawer with usability tuning):
   - Roots render as an accordion (expand-in-place to L2) — cheap scanning without losing context.
   - Tapping into L2's children **drills in** (pane slides left; children pane slides in,
     `--iv-duration-normal`) — deep lists stay full-width and thumb-friendly.
   - `MegaMenuBreadcrumb` pins at top: `‹ Back` + trail (middle-truncated; leaf always visible).
3. Every level offers **"View all {name}"** as the first row (navigates to the category page); node
   rows with children show a chevron-right; leaves navigate directly.
4. Back gestures: breadcrumb back button, and the Sheet respects swipe-to-close only at the root pane
   (deeper panes swipe = back, not close).
5. Targets ≥ 44 px, row height comfortable-dense (48 px), no hover states.

## 4. Keyboard map (desktop panel — disclosure-nav pattern)

| Key | Context | Behavior |
|---|---|---|
| Enter / Space / ↓ | Trigger | Open panel, focus first row of column 1 |
| ↓ / ↑ | In column | Next/previous row (wraps within column) |
| → | Row with children | Render/enter next column, focus its first row |
| ← | Any column > 1 | Return focus to the active parent row in the previous column |
| Enter | Any row | Navigate (link activation) |
| ESC | Anywhere in panel | Close, restore focus to trigger; in `MegaMenuSearch` first ESC clears query |
| TAB / Shift+TAB | Panel | Natural tab order: search → columns (active path only) → featured → footer; TAB past the end closes the panel (no trap) |
| Home / End | In column | First / last row |
| a–z typeahead | In column | Jump to next row starting with the letter |

Mobile drawer: standard Sheet focus trap; back button is first in tab order after the trail.

## 5. Search flow (taxonomy filter — not product search)

1. Focus lands in `MegaMenuSearch` (combobox). Typing (debounced ~120 ms) filters **loaded taxonomy
   nodes** by name, slug, and overlay synonyms — e.g. "genset" → *Diesel Generator (DG) Sets*.
2. Results render as a flat list (max 12) with full ancestor trail per hit
   (*Power & Electrical › Power Generation › Diesel Generator (DG) Sets*) — the trail is the
   disambiguator now that every concept has exactly one home.
3. ↓ enters results; Enter navigates; selecting with → (desktop) instead *reveals* the node in the
   columns (sets `activePath`) for spatial learners.
4. Empty result: "No matching category" + "Search products instead →" link handing off to the real
   search surface (`search_catalog` route) — the menu never runs product search itself.
5. Live region politely announces "N categories".

## 6. Hover vs click vs touch — parity matrix

| Intent | Pointer (desktop) | Keyboard | Touch |
|---|---|---|---|
| Open panel | Hover (intent-delayed) or click | Enter/Space/↓ | Tap |
| Drill to children | Hover row (safe-triangle) | → | Tap row (parents) |
| Navigate to category | Click row | Enter | Tap leaf / tap "View all {name}" |
| Close | Leave / outside click / ESC | ESC / TAB out | Swipe (root pane) / close button / back |

## 7. States & feedback

- **Loading:** trigger renders immediately (server HTML); if a surface ever receives the tree late,
  panel shows kit `Skeleton` columns — never spinners-in-place-of-structure.
- **Empty branch:** (possible pre-seed or filtered) — column shows quiet empty hint, no fabricated
  rows.
- **`comingSoon` nodes:** visible, muted, `CategoryBadge` chip, non-navigable (no dead links).
- **`hidden` nodes:** absent from all menu surfaces (presentation veto; taxonomy unaffected).
- **Counts/featured suppliers:** render only when contract-provided (GI-03) — absence collapses the
  slot entirely; no "0 products".
- **Analytics** (PostHog per stack): `menu_open`, `node_drill`, `node_navigate`, `menu_search_used`,
  `menu_search_zero` (the zero-result feed is the synonym dictionary's growth input — taxonomy
  governance §9). Fired via the optional callbacks; no auto-instrumentation inside kit components.

## 8. Surface-specific flow deltas

| Surface | Delta from base |
|---|---|
| Public header Explorer | Full experience as above |
| `/categories` page | Same components, inline (no popover): persistent columns (desktop) / tree (mobile); doubles as the no-JS fallback destination |
| Marketplace sidebar | `CategoryTree mode="tree"`, always-visible, current node from route, `aria-current="page"` |
| Buyer RFQ picker | `selectable="single"`; drill identical; Enter/tap **selects** instead of navigating; selected trail echoed in the RFQ form (gate-A2 target); "change" reopens |
| Vendor onboarding selector | `selectable="multi"`; checkboxes at app-decided grain; cap feedback (≤10/≤5) rendered from app-provided state — the tree only displays it |
| Admin browser | `mode="tree"` + status chips (draft/active/retired) via `renderNode` — the one surface that may see non-active nodes (admin-provided data) |

---

## 9. Approval Addendum (v1.1, 2026-07-03 — additive; owner Board findings)

- **Global empty-state contract (R2-MINOR-02).** Per-slot collapse (§7) covers missing slot data;
  this covers the whole tree failing to resolve. At build time the seed drift-check makes a
  missing/corrupted seed a **build failure** (nothing ships). At runtime (future adapter era), if
  the taxonomy is unavailable the trigger still renders and opens a **degraded panel**:
  "Industrial categories temporarily unavailable." + three always-working links — Browse
  Categories (`/categories`) · Search Products (`/search`) · Post RFQ. Never a blank panel; never
  a fabricated tree.
- **Breadcrumb preview (MINOR-07).** Desktop panel shows the active/hovered node's ancestor trail
  (*Mechanical › Pumps › Centrifugal*) in a status row (`MegaMenuTrail`) before any click — same
  trail renderer as search results (§5.2).
- **Panel strips (owner deltas).** Footer region hosts, in order and each collapsing when empty:
  `MegaMenuTrail` · `MegaMenuPopular` (Popular Searches chips → `/search?q=…`, ≤8) ·
  `MegaMenuIndustryStrip` (industry entry chips, ≤6, overlay-authored, existing routes only) ·
  `MegaMenuQuickActions` (Post RFQ · Browse Vendors · Compare Vendors). The right rail hosts
  `MegaMenuFeatured` (expanded tiles) and `MegaMenuVendors` (≤5 rows + "View all suppliers →").
  Mobile drawer root pane repeats Popular Searches + quick actions.
- **Touch hover suppression (R2-NITPICK-02).** All hover-open/hover-drill paths are gated behind
  `@media (hover: hover) and (pointer: fine)` — coarse/hybrid pointers (touchscreen laptops) are
  tap-only; no accidental opens.
- **`/` shortcut (R3-NITPICK-01).** With the panel open, `/` focuses `MegaMenuSearch`; the full
  consolidated shortcut table lives in the component spec's Approval Addendum.
- **Search match highlighting (R2-NITPICK-03).** Result rows highlight the matched substring with
  an accessible, token-styled `<mark>`.
- **Preload/prefetch ladder (R2-MINOR-04 · R2-NITPICK-04).** First sustained hover intent
  (~150–200 ms) preloads the panel chunk + builds the index; route prefetch uses the same intent
  timer — never pointer fly-by. Details: ARCHITECTURE §9.5.
- **Reserved authed slots (MINOR-01/02 · R2-MINOR-01).** Recently Viewed · Frequently Used
  Categories · ⭐ pinned categories render **only when the app supplies data** (kit stores
  nothing); absent on the public anonymous instance until an authed milestone wires them.
