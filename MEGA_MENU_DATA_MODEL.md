# Mega Menu System — Data Model

**Status:** DRAFT v1.0 — design companion (NON-authoritative). **Documentation only.**
**Date:** 2026-07-02 · **Parent:** `MEGA_MENU_ARCHITECTURE.md`.
**Golden rule applied throughout:** Content ≠ Presentation. The frozen category entity is content;
everything the menu needs beyond it is a **presentation overlay** owned by the frontend — so the menu
ships with **zero corpus changes**.

---

## 1. What is EXISTS vs presentation-owned

The original brief's `CategoryNode` (id, name, slug, icon, children, level, description, featured,
order…) mixes two provenances. Splitting them is the load-bearing decision of this data model:

| Field | Provenance | Anchor / owner |
|---|---|---|
| `id` (UUIDv7) · `name` · `slug` · `level` (1–4) · `parent_id` · `status` | **EXISTS** — frozen `marketplace.categories` | `Doc-2 §10.3` · `Doc-4D §D7.1`; only `active` nodes are ever fed to menus (retired/draft excluded upstream) |
| `children` | **Derived** — computed client-side from `parent_id` when building the VM forest | `model/taxonomy-index.ts` |
| `icon` · `description` · `featured` · `popular` · `new` · `comingSoon` · `hidden` · `badge` · `image` · `seoTitle` · `seoDescription` · `order` · `sectionLabel` · `synonyms` | **Presentation overlay** — FE-owned config keyed by **slug**; none of these exist on the frozen entity and none are coined onto it | `navigation/model/` overlay file(s); future graduation path in §5 |
| counts (products/vendors per node) · featured suppliers | **Contract-provided only** — rendered when a public projection supplies them, otherwise absent | `[ESC-7-API-CATNAV]` scope (IA §5.3); GI-03: never fabricated |

## 2. TypeScript interfaces (view-model — not a DB schema, not a contract)

```ts
/** Frozen-entity mirror — fields the taxonomy source guarantees. */
export interface CategoryNodeData {
  id: string;               // UUIDv7, immutable
  slug: string;             // unique, immutable-after-publish (governance policy)
  name: string;
  level: 1 | 2 | 3 | 4;     // frozen CHECK 1–4 — typed literally, but rendering never branches on it
  parentId: string | null;
}

/** FE-owned optional presentation metadata, keyed by slug. All optional; absence = render nothing. */
export interface CategoryPresentation {
  icon?: CategoryIconKey;         // serializable key → icon-registry (NAV_ICONS idiom)
  description?: string;           // one line, menu-length (≤ ~90 chars)
  featured?: boolean;             // eligible for MegaMenuFeatured
  popular?: boolean;              // eligible for "Popular" ordering boosts within a column
  isNew?: boolean;                // "New" chip           (brief: `new` — renamed, reserved word)
  comingSoon?: boolean;           // visible but marked; href suppressed
  hidden?: boolean;               // excluded from menus (NOT from taxonomy — presentation veto only)
  badge?: string;                 // custom chip text (short)
  image?: string;                 // CategoryCard media (public asset path / file_ref-resolved URL)
  seoTitle?: string;              // future landing pages (NET-NEW surface)
  seoDescription?: string;
  order?: number;                 // sort within siblings (default: alphabetical; taxonomy has no order)
  sectionLabel?: string;          // visual grouping inside a column (MegaMenuSection)
  synonyms?: string[];            // MegaMenuSearch expansion; sourced from the taxonomy package's
                                  // synonym dictionary (starter set v0.1) — never invented ad hoc
}

/** What components consume. */
export interface CategoryNodeVM extends CategoryNodeData, CategoryPresentation {
  children: CategoryNodeVM[];     // derived; [] for leaves
}

export type PresentationOverlay = Record<string /* slug */, CategoryPresentation>;

/** Normalized index built once per provider (no duplicated data — nodes stored once). */
export interface TaxonomyIndex {
  roots: CategoryNodeVM[];
  byId: ReadonlyMap<string, CategoryNodeVM>;
  bySlug: ReadonlyMap<string, CategoryNodeVM>;
  pathTo(id: string): CategoryNodeVM[];              // ancestors, root-first
  filter(query: string): CategoryNodeVM[];           // name+slug+synonyms, diacritic/case-insensitive
}

/** How data reaches the menu — the ONLY seam that changes when the contract lands. */
export interface TaxonomySource {
  load(): Promise<CategoryNodeData[]>;               // flat list; VM/forest built locally
}
```

Rules: rendering logic is depth-recursive — `level` is display metadata (indent/column hints), never
a loop bound; `hidden`/`comingSoon` are presentation vetoes and never leak back into taxonomy
governance; overlay keys that match no active slug are dead entries (build-time lint warns).

## 3. Overlay authoring & governance

- Lives as versioned FE config (e.g. `navigation/model/overlay.v1.ts` or JSON), reviewed like any
  kit change; **keyed by slug** so it survives ID re-seeding and never forks taxonomy structure.
- May only *decorate* nodes — it cannot add nodes, rename nodes, or re-parent (build-time check:
  every overlay key ∈ active slugs; no `name` override field exists at all).
- `featured/popular` are editorial flags pending real analytics; when demand data exists, curation
  moves to a governed process (taxonomy governance §9 quarterly review is the natural home).
- Icon set: industrial glyphs (DP §10) through the registry — 13 root icons required at launch,
  L2 icons optional, deeper levels inherit the root glyph by default.

## 4. Loading strategy & caching

**Phase now (pre-contract, `[ESC-7-API-CATNAV]` open):**
- Build-time static seed generated **from Taxonomy Content v1.0's master table**
  (`productSpec/CATEGORY_MIGRATION_PLAN.md` Appendix C) by a script — never hand-copied, so the menu
  cannot drift from the canonical tree. Emits `taxonomy.v1.json` (flat `CategoryNodeData[]`,
  ~794 rows ≈ 60 KB raw / ~15 KB gzip).
- Served as a static import in a **server component**; VM forest + overlay merge happen server-side;
  the client receives the resolved forest once via `TaxonomyProvider`.

**Phase later (contract lands):**
- Swap the `TaxonomySource` implementation to the public `list_categories` projection (active nodes
  only). Components and providers are untouched — the seam is exactly one adapter.
- Cache: Next.js data-cache / ISR with a long TTL and tag-based revalidation on taxonomy content
  releases (Taxonomy Content vX.Y is the natural cache-busting version); client holds the tree for
  the session (it is immutable within a release).
- Menus never hit the network on open: data is resolved at page render; panel open is pure UI.

**Lazy loading clarified:** at 794 nodes, *data* lazy-loading is counterproductive (one small file
beats N request waterfalls). Laziness applies to (a) the panel **code** (`next/dynamic` on
`MegaMenuContent`/`MegaMenuMobile`), and (b) **rendering** (columns/accordion children mount on
demand). If a future market pushes a single release past ~5k nodes, the `TaxonomySource` seam admits
per-root chunking without component changes — recorded here so the decision isn't re-derived.

## 5. Future extensions (explicitly out of scope now)

| Extension | Trigger | Path |
|---|---|---|
| Public `list_categories` projection | `[ESC-7-API-CATNAV]` ruled | Swap adapter (§4) |
| Counts + featured suppliers per node | Same ESC (public reads) | Overlay gains contract-fed fields; render-if-present already specced |
| SEO landing pages consuming `seoTitle/seoDescription` | Landing-page surface ruled (taxonomy package escalations) | Overlay fields already reserved |
| Synonym mechanism (`ESC-CLASS-ALIAS`) | Board | `synonyms` moves from overlay snapshot to served data; search filter unchanged |
| Attribute-driven flyout facets (`ESC-CLASS-ATTR`) | Board | New leaf-panel slot; not designed here |
| Per-market overlays (multi-country) | Expansion | Overlay file per market; same tree |
| Localization (Bangla labels) | Product decision | `name` stays canonical; overlay gains `displayName` per locale — flagged as the one field that would need naming-governance sign-off before use |
