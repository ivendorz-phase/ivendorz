# iVendorz — Landing Page Specification (P-PUB-01 Home / Landing)

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — Landing Page Specification (non-authoritative companion to the Doc-7 program)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor
**Revision:** v0.3 — refactored onto the `SC` de-duplication spine: added the `SC §2` Inherited-From banner + a `SEC-*` ID and `SC §8` Binding type to every section; stripped inherited boilerplate to `GI` references; `ESC` gaps now cite `ER` handles (no re-explanation); terms normalized to `GL`; tokens referenced by `--iv-*` name only. Command Center (§2) marked an **Extractable Unit (extraction deferred)** — kept in place. Coins nothing.
**Page:** **P-PUB-01 Home / Landing** (Public surface · Doc-7D · template **`T-LANDING`** — `PT §2`)
**Companions:** [`shared_conventions.md`](shared_conventions.md) (`SC`) · [`esc_registry.md`](esc_registry.md) (`ER`) · [`glossary.md`](glossary.md) (`GL`) · [`design_philosophy.md`](design_philosophy.md) (`DP`) · [`page_templates.md`](page_templates.md) (`PT`) · [`information_architecture.md`](information_architecture.md) (`IA`) · [`ux_patterns.md`](ux_patterns.md) (`UX`) · [`marketplace_ux.md`](marketplace_ux.md) (`MX`) · [`page_inventory.md`](page_inventory.md) (`PI`)

---

## 0. Precedence & Authority (read first)

This document is a **non-authoritative companion**. It specifies the *presentation, layout, interaction,
and data-binding intent* of one page — the public landing page. It **coins no architecture, route,
contract, projection, permission, state, event, POLICY key, or domain element.** It sits **below** the
frozen Doc-7 program and conforms upward.

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → Doc-7B
  → Doc-7C → {Doc-7D (this surface's owner), Doc-7E…7H} → Code
                                    ▲ this document conforms to everything above
```

- **Doc-7D** owns the **Public surface** (anonymous, Public-projection, published-only). This document
  *realizes one Doc-7D view* (the landing page) — it never re-decides Doc-7D's bind-or-ESC inventory,
  and it binds only the **three frozen anonymous Public reads** Doc-7D verified: `search_catalog`,
  `list_vendor_directory`, `get_public_vendor_profile` (all **BC-MKT-6 §8**), plus the **public trust
  badge** reads (`get_trust_score` / `get_verified_tier`, **Doc-5G** BC-TRUST-1/2, public projection).
- **Doc-7B** + `DP` own the component kit and design tokens (component tiers → `SC §7`). This document
  references tokens by their `--iv-*` names and **never redefines a value** (`SC §3` note).
- **Doc-7C** owns the `(public)` route group, the server-side wired client, and SSR/SSG/streaming. This
  document specifies presentation *within* that shell (shell + data layer inherited → `SC §1` GI-01/GI-02).
- This landing **specializes `T-LANDING`** (`PT §2`), referenced by its stable template ID.
- **On any conflict, the frozen corpus wins and this document is corrected** (CLAUDE.md §7, §11).
  Frozen facts are bound **by pointer**. Where a dynamic element needs a read absent from the frozen
  wired surface, this document **flags an `ER` handle and renders the registered interim — it never
  invents** (§19).

> **Conforms upward · Coins nothing.** Page IDs (`P-PUB-01`), section IDs (`SEC-*`), telemetry event
> names, and the "Industrial Procurement Command Center" name are **presentation vocabulary** —
> document-internal handles, not coined architecture (`GL` "Command Center"). Theme posture:
> **light-primary** (`DP §3.1`).

### 0.1 What this page is — and is not

| It IS | It is NOT |
|---|---|
| The **public gateway** to an industrial B2B procurement marketplace | A consumer-ecommerce storefront (no Alibaba/Amazon/IndiaMART/Daraz patterns — `DP §1.3`) |
| The **visual identity** of iVendorz — the flagship first impression | A generic SaaS marketing page with a hero image and a feature grid |
| An **anonymous, read-only, published-only** Public-projection surface (Doc-7D §3) | A place that performs any authenticated mutation (every authed action routes to `(auth)` — §1.3) |
| A **discovery launchpad** — search, browse, convert | A re-ranking / matching / recommendation surface (Content ≠ Presentation; no M3 — §0.2) |

### 0.2 The three load-bearing constraints (honored on every section below)

1. **Anonymous · read-only.** The page carries **no `Iv-Active-Organization`** and performs **no
   server-action write** (Doc-7D §5.1/§6.3; inherited shell/data rules → `SC §1` GI-01/GI-02). Any
   authenticated capability (Create RFQ, Find Suppliers *as a buyer*, AI Assistant, claim, favorite) is
   a **CTA that routes to `(auth)`** (Doc-7D §5.2; Doc-7E owns the auth action). The CTA reveals no
   protected fact and asserts no permission (`CHK-7-011`).
2. **Published-only Public projection · zero buyer-private awareness.** Only `public`-visibility,
   published content is exposed; **draft / unpublished / soft-deleted / retired never appear** (Doc-7D
   §7.2). The surface has **no concept of buyer-private status** — a vendor blacklisted by one buyer
   still appears publicly (Invariant #11; `GL` "Byte-equivalence"; `SC §1` GI-12). The page **cannot
   leak an exclusion because it never holds one.**
3. **Content ≠ Presentation · no matching.** Any "showcase" ordering is **presentation over a contract
   result set** — it implies **no matching, ranking, or recommendation**, and **never re-ranks governed
   M3** (there is no M3 on the public surface — Doc-7D §4.3; Golden Rule #4; `SC §1` GI-04). Trust
   indicators are **trust badges displayed, never computed** (M5-owned; M2/Public reads — `DP §2.1.6`).

> **Inheritance note.** Per `SC §2`, every section below opens with an **Inherited From** banner and
> documents **deltas only**. Cross-cutting defaults are **not restated per section** — accessibility →
> `SC §1` GI-06; responsive → `SC §1` GI-07; loading/empty/error/not-found → `SC §1` GI-05;
> non-disclosure / byte-equivalence + analytics → `SC §1` GI-12; performance posture → `SC §1`
> (inherited posture note); currency → `SC §1` GI-08; cursor pagination → `SC §1` GI-03; AI advisory →
> `SC §1` GI-11. A field left to its inheritance is **omitted** (omission = "as inherited"). `ESC`
> handles are defined once in `ER` and cited by handle.

---

## 1. Page Overview & Welcome Wireframe

### 1.1 Purpose

Convert an anonymous industrial buyer (or a vendor seeking presence) from **curiosity → discovery →
evaluation → trust → commitment** (the `J-GST` intent arc — `MX §2`), while exposing **zero** private
or unpublished data. The page is **`J-GST-01` Land** and is the launch point for `J-GST-02` (explore
taxonomy), `J-GST-03` (search), `J-GST-04` (view a vendor), and `J-GST-06` (convert to `(auth)`).

### 1.2 Overall page anatomy (ASCII welcome map)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PUBLIC TOP NAV  (brand · Industrial Category Explorer · Marketplace · Vendors │
│                   · Pricing · Resources · [Sign in] · [Get started ▸ (auth)])  │  sticky
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─── SEC-HERO ─────────────────────────────────────────────────────┐        │
│   │  H1 value proposition · subhead · primary + secondary CTAs        │        │
│   │  ┌────────────────────────────────────────────────────────────┐  │        │
│   │  │   ▓▓▓  INDUSTRIAL PROCUREMENT COMMAND CENTER  ▓▓▓ (§2)       │  │        │
│   │  │   floating · elevated · the signature experience            │  │        │
│   │  └────────────────────────────────────────────────────────────┘  │        │
│   │  trust strip: verified vendors · categories · live (badges only)  │        │
│   └───────────────────────────────────────────────────────────────────┘       │
│                                                                                │
│   SEC-CATEGORY  Featured Categories …… search_catalog facets · ER ESC-7-API-CATNAV│
│   SEC-INDUSTRY  Industry Explorer (preview) … facets only  · ER ESC-7-API-CATNAV │
│   SEC-SUPPLIERS Verified Supplier Showcase … list_vendor_directory + trust (5G)  │
│   SEC-PRODUCTS  Popular Products …………………… search_catalog · ER ESC-7-API-PRODDETAIL│
│   SEC-STATS     Marketplace Statistics ……… ER ESC-7-API/stats (no public stats)  │
│   SEC-PROCESS   Procurement Process (How it works) ……………………… static marketing    │
│   SEC-TRUST     Trust & Verification ………………………………………………… static + badge legend  │
│   SEC-SUCCESS   Customer Success ………………………………………………………… static marketing      │
│   SEC-PARTNERS  Partner / Ecosystem Logos …………………………………… static marketing      │
│   SEC-RESOURCES Knowledge Resources …………………………………………………… static marketing     │
│   SEC-CTA       Final CTA band ………………………………………… routes to (auth) / Doc-7E      │
│                                                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│  SEC-FOOTER  (full marketing footer — categories · company · legal · locale)   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Routing & boundary contract (applies to every CTA on the page)

| CTA family | Anonymous behavior | Destination |
|---|---|---|
| **Marketplace Search**, **Industry/Category Explorer**, **Verified Supplier Showcase cards**, **Popular Products** | Read-only Public reads (or interim) — render results / navigate within `(public)` | Public catalog/directory/profile views (P-PUB-10/12/13…) |
| **Create RFQ**, **Find Suppliers (as buyer)**, **Save / Favorite**, **Claim vendor** | **No anonymous mutation** — route to `(auth)` | `(auth)` group → Doc-7E (then 7F/7G post-auth) |
| **AI Assistant** | **"Coming Soon"** — disabled, non-interactive, future activation | none (no panel call) — `ER ESC-7-AI` |
| **Sign in / Get started** | Navigate | `(auth)` → Doc-7E |

> **Anonymous-action-routing rule (binding for this page):** any authenticated capability is a CTA that
> **routes to `(auth)`** and never mutates here. The public top nav and footer are the Doc-7D **Public**
> chrome (`IA §3.2`) — **no org-switcher, no notification center** (those are authenticated shell slots,
> Doc-7C; `SC §7` shell slots). The nav is specified at the page level here; the authoritative shell is
> Doc-7C/7D.

---

## 2. CENTERPIECE — The Industrial Procurement Command Center  *(Extractable Unit — extraction deferred)*

> **Extractable Unit (extraction deferred).** This block is a self-contained, reusable unit and a
> candidate for extraction into its own spec/component doc. **Noted, not extracted** — per this wave it
> **stays in LP**. When extracted, it would carry its own `SC §2` banner and SEC ID; until then it lives
> here as the page centerpiece.

**Section ID:** `SEC-COMMAND-CENTER` *(centerpiece; not one of the 13 content sections)*

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-DETAIL   (+ GI-03, GI-04, GI-05, GI-11, GI-12)
Deltas:   Floating elevated centerpiece (not a standard section); public mirror of the authenticated
          Universal Command Center (IA §5.2); binds only the 3 frozen Public reads + public trust
          badge; every other dynamic entry is an ER ESC with a registered interim. Search/suggest is
          presentation over the contract result set — never re-ranks M3. Custom ⌘K focus + combobox
          keyboard model (§2.6). Trust strip = badges only, qualitative unless a contract aggregate
          exists (ER ESC-7-API/stats).
```

**Binding type:** `READ+ESC` (`SC §8`) — binds public reads **and** depends on registered `ER` gaps.

> The signature, floating experience that **replaces the generic marketplace search box.** It is the
> visual and functional anchor of the brand: a single elevated surface that unifies **Marketplace
> Search, taxonomy entry, the two primary procurement intents (Create RFQ / Find Suppliers), an AI entry
> (Coming Soon), popular searches, and trust indicators** — the *command center* metaphor of an
> industrial operating system, not a shopping bar. It is the public, anonymous cousin of the
> authenticated Universal Command Center (⌘K) (`IA §5.2`; `UX §3.1`) — sharing its keyboard ergonomics
> and visual language, but **bound only to public reads and routing to `(auth)` for anything
> authenticated.**

### 2.1 Anatomy (ASCII)

```
                 ╔══════════════════════════════════════════════════════════════╗
                 ║  INDUSTRIAL PROCUREMENT COMMAND CENTER          [⌘K] hint     ║  ← elevation-3/4
                 ║ ┌──────────────────────────────────────────────────────────┐ ║     floating card
   mode tabs ──▶ ║ │ ⌕  Search products, suppliers, categories…      [  ▸  ]  │ ║  ← Marketplace Search
                 ║ └──────────────────────────────────────────────────────────┘ ║     (the input)
                 ║                                                                ║
   entry rail ─▶ ║  [▤ Explore Categories]  [✚ Create RFQ →auth]  [⌕ Find        ║  ← primary entries
                 ║                                          Suppliers →auth]      ║
                 ║  [✦ AI Assistant — Coming Soon (disabled)]                     ║  ← future, ER ESC-7-AI
                 ║                                                                ║
   popular ────▶ ║  Popular:  ⌁ ball valves   ⌁ MS plate   ⌁ VFD drives   ⌁ …    ║  ← static seed (interim)
                 ║                                                                ║
   trust strip ▶ ║  ✓ Verified suppliers   ▦ Industrial categories   ◷ Updated   ║  ← trust badges only
                 ╚══════════════════════════════════════════════════════════════╝
                              ▲ rests over the hero; subtle --iv-shadow-xl + 1px --iv-border
```

### 2.2 Layout & token realization

- **Elevation & surface:** a floating card at **`--iv-elevation-3`→`-4`** (`DP §2.5.2`) — `--iv-overlay`
  surface, `--iv-shadow-xl`, `--iv-radius-xl`, 1px `--iv-border`. It visually *floats* over the hero
  (overlapping the hero's lower third on desktop). Optional restrained `--iv-glow-brand` on the focused
  input only (used sparingly per §2.5).
- **Width:** caps at `--iv-container-md`→`lg`, centered; never exceeds the hero measure.
- **Internal grid:** vertical stack — (1) mode/intent context, (2) the search input row, (3) the entry
  rail, (4) popular searches, (5) trust strip. Gutters `--iv-gutter` desktop / `--iv-gutter-tight`
  below `md`.
- **Type:** input placeholder `--iv-text-base`; entry-rail labels `--iv-text-sm` / `--iv-weight-medium`;
  popular/trust `--iv-text-xs` / `--iv-fg-muted`. `--iv-font-mono` only if a human ref ever surfaces
  (none here).
- **Icons:** Lucide (`DP §2.11`/`§10`) — `Search`, `LayoutGrid`/`Boxes` (Explore), `ClipboardList`
  (Create RFQ), `Factory`/`Search` (Find Suppliers), `Sparkles` (AI), `ShieldCheck`/`BadgeCheck`
  (trust). Size `--iv-icon-sm`, stroke `--iv-icon-stroke`.

### 2.3 The entries (each with binding + governance)

| # | Entry | Behavior | Binding / governance |
|---|---|---|---|
| **a** | **Marketplace Search** (the input) | Type → debounced suggest/results; submit → public catalog/vendor results | `search_catalog` + `list_vendor_directory` (**BC-MKT-6 §8**, Public). Presentation over the contract result set; **never re-ranks M3** (`SC §1` GI-04; Doc-7D §4.3). Cursor-paginated downstream; **no client-side total** (`SC §1` GI-03). |
| **b** | **Industrial Category Explorer entry** | Opens the explorer (§4) — public taxonomy navigation | **`ER ESC-7-API-CATNAV`** — interim per `ER` (`search_catalog` facets only). |
| **c** | **Create RFQ** | Anonymous → **routes to `(auth)`**; never authors an RFQ here | No anonymous mutation (Doc-7D §5.1). Post-auth → Buyer 7F `create_rfq` (Doc-5E). CTA gating is UX only (`CHK-7-011`). |
| **d** | **Find Suppliers** | Public discovery → Vendor Directory / search; the *buyer* "find suppliers" workflow routes to `(auth)` | Public leg: `list_vendor_directory` / `search_catalog`. Buyer-context leg → `(auth)` (Doc-7E). **No matching/recommendation** on the public leg (Invariant #11; Content ≠ Presentation). |
| **e** | **AI Assistant** | **"Coming Soon"** — disabled affordance; opens no panel | **`ER ESC-7-AI`**; AI advisory inheritance → `SC §1` GI-11 (suggests, never decides/ranks/auto-selects). Future activation (CLAUDE.md §2). Invariant #12. |
| **f** | **Popular searches** | Static seed chips that pre-fill the search input | **`ER ESC-7-API/stats`** (no public suggest/trending read) → **static seed (interim)**. Clicking a chip runs `search_catalog` (presentation, never a recommendation). |
| **g** | **Trust indicators** | Badge strip (verified-supplier style, category count, freshness) | **Trust badges displayed, never computed** (M5-owned). Counts must come from a contract (facet/aggregate) or be omitted — **never client-computed** (`SC §1` GI-03/GI-12). Absent a public count read → render a **qualitative** badge ("Verified suppliers"), not a fabricated number → **`ER ESC-7-API/stats`**. |

> **Popular searches — gap note.** Interim per **`ER ESC-7-API/stats`**: a **curated static seed** of
> industrial terms (e.g. ball valves, MS plate, VFD drives, gear pumps, PPE) maintained as marketing
> content — **never presented as "trending now"** (that would imply a computed signal we do not have).

### 2.4 States (deltas only — base primitives inherited via `SC §1` GI-05)

| State | Delta presentation (centerpiece specifics) |
|---|---|
| **Default (idle)** | Input shows placeholder; entry rail + static popular chips + trust strip visible; AI entry shows the "Coming Soon" pill. |
| **Focus** | Input gains the `:focus-visible` ring (`DP §4.2`), optional `--iv-glow-brand`; a results/suggest popover anchors below at `--iv-elevation-2`. Keyboard nav active (§2.6). |
| **Typing (debounced)** | Debounced query (`DP §2.6` motion); inline `.iv-skeleton` suggest rows; no full-page spinner. Reduced-motion → static placeholder (`UX §4.1`). |
| **Results** | Grouped suggest: **Products** (`search_catalog`), **Suppliers** (`list_vendor_directory`), **Categories** (facets — `ER ESC-7-API-CATNAV`). Each row → its public view; vendor rows carry a read-only trust badge. Order is **contract order** (no re-rank — `SC §1` GI-04). |

*(Loading, Empty, Error, Not-found follow `SC §1` GI-05 — empty is byte-identical to genuine absence;
error branches on `error_class` with `reference_id`, no protected enrichment.)*

### 2.5 Interactions & motion

- **Open/anchor:** the suggest popover scales/fades in ≤200ms `--iv-ease-in-out` (`iv-scale-in`).
  Forbidden: layout-reflow animation, parallax, looping decorative motion (`DP §2.6`).
- **Hover:** color/shadow/opacity only — **never size** (no layout-shifting hover, `DP §4.2`).
- **Submit:** Enter (or the `▸` button) runs the active query and navigates to the public results view.
- **Glow discipline:** `--iv-glow-brand` is reserved for the focused input; not applied to the whole
  card (gravitas via rigor, not glow — `DP §1.2`).

### 2.6 Keyboard & ⌘K tie-in (delta — beyond GI-06 baseline)

- **Page-level shortcut:** `⌘K` / `Ctrl-K` focuses the Command Center search input (the public mirror of
  the Universal Command Center, `IA §5.2`). A visible `⌘K` hint badge sits top-right of the card.
- **Within the card:** `Tab` moves input → entry rail → popular chips → trust strip in DOM order;
  `↑/↓` traverse suggest rows; `Enter` activates the focused row/CTA; `Esc` closes the suggest popover
  and returns focus to the input. The suggest list uses the combobox pattern
  (`aria-expanded`/`aria-controls`/`aria-activedescendant`).
- **Scope note:** unlike the authenticated palette, this public ⌘K offers **only** public navigation +
  search; authenticated commands are absent (they live behind `(auth)`).

*(General keyboard operability, focus order, no-trap, visible focus → `SC §1` GI-06.)*

### 2.7 Responsive behavior of the floating Command Center (delta — beyond GI-07 baseline)

| Tier | Command Center behavior |
|---|---|
| **Desktop `xl`+** | Floats over the hero's lower third; full width to `--iv-container-md/lg`; entry rail is a single horizontal row; suggest popover overlays. |
| **Laptop `lg–xl`** | Same, slightly narrower; entry rail may wrap to two rows. |
| **Tablet `md–lg`** | Card **docks** into normal flow beneath the hero copy (no longer overlapping); entry rail wraps to a 2×2 grid; popular chips horizontally scroll. |
| **Mobile `< md`** | Card becomes **full-bleed in flow** (`--iv-radius-lg`, lighter shadow); the search input is a **prominent button/field**; tapping it can open a **full-screen search sheet** (`MB-DETAIL` / `UX §9` search sheet) so the on-screen keyboard never obscures results; entry rail stacks vertically; AI "Coming Soon" remains visible but disabled. |

*(Mobile-first defaults, breakpoints, touch-target baseline → `SC §1` GI-07; reduced-motion → `DP §2.6`.)*

### 2.8 A11y (Command Center — deltas only; baseline → `SC §1` GI-06)

- The card is a labeled `search`/`region` landmark ("Industrial Procurement Command Center"); the input
  has an explicit `<label>` and the combobox ARIA pattern for the suggest popover.
- Suggest list is keyboard-traversable with `aria-activedescendant`; each row announces type + name +
  (for vendors) the **trust badge text** (never color-only).
- The AI "Coming Soon" control is `aria-disabled` with an accessible name conveying future availability;
  not a focus trap; exposes no fake action.

### 2.9 AI panel behavior (anonymous landing)

- **No AI panel is rendered or invoked.** The AI Assistant entry is a **reserved, disabled "Coming
  Soon"** affordance only. The sole wired AI surface is M9's **`ai-advisory-panel`** (`Doc-5K`),
  **User-read-only with no anonymous projection** (Doc-7D §9.1) and **non-recommending** (`SC §1`
  GI-11; Invariant #12). Anything beyond it is **`ER ESC-7-AI`**.
- **When activated (future, post-auth only):** it would appear inside `(auth)`/`(app)` surfaces under
  its full governance — **AI suggests; modules decide**, never ranks to a winner, never auto-selects,
  never re-ranks M3, never discloses an excluded/blacklisted/buyer-private signal (`SC §1` GI-11/GI-12;
  `UX §5.5`). The public landing never hosts that panel.

### 2.10 Governance summary (Command Center)

- Anonymous, read-only; authenticated intents route to `(auth)` (Doc-7D §5; anonymous-action-routing
  rule, §1.3).
- Binds only the three frozen Public reads + public trust badge; every other dynamic entry is an `ER`
  ESC with a registered interim (§19).
- No matching, no recommendation, no client-computed totals; trust displayed never computed.

---

## 3. Section — Hero  `SEC-HERO`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-DETAIL
Deltas:   First-viewport identity slot; hosts the Command Center (§2). Static marketing copy — the only
          dynamic element is the embedded centerpiece. Trust strip is qualitative unless a contract
          aggregate exists (ER ESC-7-API/stats). One <h1> for the page.
```

**Binding type:** `STATIC` (`SC §8`) — static copy; the embedded Command Center owns its own bindings.

**Purpose:** State the value proposition in one breath and host the Command Center. Establish the
**Industrial · Professional · Premium · Trustworthy** identity in the first viewport.

**Layout / wireframe:**

```
┌───────────────────────────── HERO (elevation-0, --iv-bg) ─────────────────────────────┐
│  H1  "The Industrial Procurement Operating System for Bangladesh."                      │
│  Sub  "Source, compare, and award — from RFQ to delivery — with verified suppliers."    │
│  [ Get started ▸ (auth) ]   [ Explore the marketplace ]                                 │
│                                                                                         │
│        ╔══════════ INDUSTRIAL PROCUREMENT COMMAND CENTER (§2) ══════════╗                │
│        ╚══════════════════════════════════════════════════════════════╝                │
│  ✓ Verified suppliers   ▦ Industrial categories   ◷ Published-only, always current      │
│  (subtle technical line-art / blueprint motif, brand-tinted — DP §4.5)                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** `T-LANDING` hero slot (`PT §2.2`); Doc-7B `button` (primary + secondary); the Command
  Center (§2); a trust strip of `trust-badge`-style chips (qualitative).
- **Content hierarchy:** H1 `--iv-text-5xl`/`--iv-weight-extrabold`/`--iv-tracking-tight` → subhead
  `--iv-text-lg`/`--iv-fg-secondary` → CTAs → Command Center → trust strip `--iv-text-xs`/`--iv-fg-muted`.
- **Visual language:** restrained **blueprint/technical line-art** (industrial, brand/neutral, no
  photorealism, no mascots — `DP §4.5`). Background `--iv-bg` (light); brand hues are *ink and accent*,
  not a saturated commerce gradient (`DP §1.4`).
- **Data binding:** **static marketing copy.** The only dynamic element is the embedded Command Center
  (§2). Trust strip counts are qualitative unless a contract aggregate exists → **`ER ESC-7-API/stats`**.
- **Delta A11y:** exactly one `<h1>`; line-art is decorative (`aria-hidden`, empty `alt`) — it **never
  encodes data** (`DP §4.5`). (Baseline a11y → `SC §1` GI-06; responsive → GI-07.)

---

## 4. Section — Featured Categories & Industry Explorer (preview)  `SEC-CATEGORY` · `SEC-INDUSTRY`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-LIST
Deltas:   Two sub-blocks: Featured Categories (SEC-CATEGORY) + Industry Explorer preview (SEC-INDUSTRY).
          Both are ER ESC-7-API-CATNAV — full anonymous taxonomy tree blocked; interim = search_catalog
          facets only; featured selection curated/static. Opens the Industrial Category Explorer
          (UX §3.2). Industry is a wayfinding section, not a modeled taxonomy (GL "Industry Explorer").
```

**Binding type:** `READ+ESC` (`SC §8`) — facet reads via `search_catalog`; gated on `ER ESC-7-API-CATNAV`.

**Purpose:** Give the industrial taxonomy a first-class, premium presence (the iVendorz answer to the
consumer "mega menu" — denser, technical, professional). On the landing page this appears as
**(a) a compact Featured Categories grid (`SEC-CATEGORY`)** and **(b) an Industry Explorer preview/entry
(`SEC-INDUSTRY`)** that opens the full **Industrial Category Explorer** (`UX §3.2`; `IA §5.3`; `GL`).

**Layout / wireframe:**

```
┌── SEC-CATEGORY · Featured Categories ─────────────────────────────────────────┐
│  ▣ Valves & Fittings   ▣ Steel & Metals   ▣ Electrical & Drives              │
│  ▣ Pumps & Motors      ▣ Safety / PPE      ▣ Chemicals  …  [ View all ▸ ]      │
└──────────────────────────────────────────────────────────────────────────────┘
┌── SEC-INDUSTRY · Industry Explorer (preview — opens full explorer) ───────────┐
│  Parent ▸ Child ▸ Child-2 ▸ Child-3   (4 synchronized columns in full view)   │
│  ⚠ INTERIM: facets only — full anonymous tree blocked  (ER ESC-7-API-CATNAV)  │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** category tiles (Doc-7B `card` with industrial Lucide glyph — `Factory`, `Cog`, `Zap`,
  `FlaskConical`, `HardHat`, `Layers`; `DP §10`); the Industrial Category Explorer (four synchronized
  columns, single-hover drill, in-explorer search, "View all" per column — `UX §3.2`), opened from the
  preview/entry.
- **Content hierarchy:** section header `--iv-text-2xl` → tiles (icon + name + optional product count) →
  "View all".
- **Data binding (load-bearing ESC):** **`ER ESC-7-API-CATNAV`** — interim per `ER` (render
  `search_catalog` **facets** only; product counts via facet aggregations where available;
  featured-category selection curated/static until the projection lands). Featured suppliers per node
  need a public vendor-by-category read (absent → same handle).
- **Delta A11y:** tiles are links with icon + text label (never color/icon-only); explorer columns are
  keyboard-navigable; hover-drill has a keyboard/focus equivalent. (Baseline a11y → `SC §1` GI-06;
  responsive incl. four-column → accordion drawer on mobile → GI-07 / `UX §3.2`/`§9`; states → GI-05;
  non-disclosure → GI-12.)

> **Taxonomy independence:** Category / Product / Vendor (and any future Industry / Brand / Standard /
> Manufacturer) are **independent taxonomies**; the page composes them for wayfinding but never couples
> them into one model and never coins a taxonomy absent from the corpus (`IA §5.3`/`§8`; `ER` known-gaps;
> `GL` "Taxonomy"). "Industry" pages are not modeled in the frozen corpus → navigation reference only.

---

## 5. Section — Verified Supplier Showcase  `SEC-SUPPLIERS`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-LIST
Deltas:   Vendor Card grid bound to list_vendor_directory + get_public_vendor_profile + public trust
          badge (Doc-5G). Capability = 4-flag matrix, never a label (Invariant #1). Showcase order is
          presentation, never a computed score sort — never re-ranks M3. Verification detail/fraud/admin
          ratings never public (Doc-5G R10). The trust centerpiece among content sections.
```

**Binding type:** `READ` (`SC §8`) — binds frozen Public reads + public trust badge (no ESC gap).

**Purpose:** Prove the marketplace's core value — **verified, credible industrial suppliers** — with a
curated, premium showcase.

**Layout / wireframe:**

```
┌── Verified Suppliers ────────────────────────────────────────────────────────┐
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │ Vendor name   │ │ Vendor name   │ │ …             │ │ …             │     │
│  │ category·loc  │ │ category·loc  │ │               │ │               │     │
│  │ ✓ Verified ▦A │ │ ✓ Verified ▦C │ │ capability▮▮▮ │ │ capability▮▮▮ │     │
│  │ [View profile]│ │ [View profile]│ │               │ │               │     │
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘     │
│                                                          [ Browse directory ▸ ]│
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** **Vendor Card** (`DP §8`) — name, category, location, **trust badge**, **financial-tier
  badge**, **capability matrix (4 flags)**, optional capacity; Doc-7B `card` + `trust-badge` embedded
  component (`SC §7` embedded tier).
- **Content hierarchy (`DP §4.1`/`§4.3`):** primary signal = **trust badge** (top-right) → identity
  (vendor name `--iv-text-xl`/semibold) → category (`--iv-text-sm`, brand) → location + tier
  (`--iv-text-xs`/muted) → capability matrix → action ("View profile").
- **Data binding:**
  - List → **`list_vendor_directory`** (BC-MKT-6 §8, Public).
  - Card detail / "View profile" → **`get_public_vendor_profile`** (BC-MKT-6 §8, Public) → P-PUB-13.
  - **Trust badge → `get_trust_score` / `get_verified_tier`** (public badge projection — **Doc-5G**
    BC-TRUST-1/2). **Read-only, displayed never computed** (M5 owns; R5 firewall). Verification *detail*,
    fraud signals, admin ratings are **never public** (Doc-5G R10).
  - **Capability matrix** = 4 flags (`can_supply`/`can_service`/`can_fabricate`/`can_consult`) — a
    **matrix, never a label** (Invariant #1); colors `DP §2.1.6`.
- **Ordering (governance):** showcase order is **presentation over the contract result** — implies **no
  matching, ranking, or recommendation** and never re-ranks M3 (`SC §1` GI-04; Doc-7D §4.3). Curated
  "featured" selection is editorial/static, **not** a computed score sort.
- **Non-disclosure:** published-only; a vendor blacklisted by some buyer **still appears** (the surface
  has no exclusion concept — Invariant #11; Doc-7D §3.2; `SC §1` GI-12). No count of "excluded"/"private".
- **Delta A11y:** each card a self-contained article with a clear heading; trust/tier/capability conveyed
  with **text + icon**, not color alone; "View profile" has an accessible name including the vendor.
  (Baseline a11y → GI-06; responsive card grid 4→2→1 → GI-07; states → GI-05.)

---

## 6. Section — Popular Products  `SEC-PRODUCTS`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-LIST
Deltas:   Product cards bound to search_catalog; no anonymous product-detail page → ER
          ESC-7-API-PRODDETAIL (card click opens search-in-context / vendor microsite). "Popular" is
          curated/facet-backed, never labeled "Recommended". Price via currency-display (GI-08).
```

**Binding type:** `READ+ESC` (`SC §8`) — `search_catalog` reads; gated on `ER ESC-7-API-PRODDETAIL`.

**Purpose:** Surface representative industrial products to seed discovery and demonstrate catalog depth.

**Layout / wireframe:**

```
┌── Popular Products ──────────────────────────────────────────────────────────┐
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ product│ │ product│ │ …      │ │ …      │ │ …      │ │ …      │           │
│  │ vendor │ │ vendor │ │        │ │        │ │        │ │        │           │
│  │ ৳/spec │ │ ৳/spec │ │        │ │        │ │        │ │        │  [Search ▸]│
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘           │
│  (cards open search results in context — no standalone anon product page)     │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** product cards (Doc-7B `card`); `currency-display` for any price (`SC §7` app tier).
- **Content hierarchy:** product name → vendor/category → key spec or price → CTA.
- **Data binding (load-bearing ESC):** **`search_catalog`** (BC-MKT-6 §8, Public). **`ER
  ESC-7-API-PRODDETAIL`** — interim per `ER` (products render **from `search_catalog` results**; a card
  click opens the **search result in context / vendor microsite**, not a standalone anonymous product
  page). "Popular" selection is **curated/facet-backed**, not a computed recommendation (no
  "Recommended" labeling — `UX §7.6`). *(Related/similar, if ever added, → `ER ESC-7-API/related`,
  labelled "Same category", never "Recommended".)*
- **Currency (governance):** every price is `{amount, currency}` **carried by the field**;
  `currency-display` reads the currency from the contract, **default BDT, never hardcoded**; `৳` only when
  BDT; BDT lac/crore grouping; `tabular-nums` (`SC §1` GI-08; `DP §9`).
- **Delta A11y:** cards are links with discernible names; price announced with unit/currency text;
  carousel has keyboard controls + visible focus. (Baseline a11y → GI-06; mobile horizontal scroll/carousel,
  cursor-backed, no offset/page-number → GI-03/GI-07 / `UX §2.4`; states → GI-05.)

---

## 7. Section — Marketplace Statistics  `SEC-STATS`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-DASHBOARD · MB-DASHBOARD
Deltas:   No frozen public statistics read → ER ESC-7-API/stats. Interim per ER: omit the section, OR
          show only search_catalog facet-derived counts — NEVER fabricated numbers, NEVER client-computed
          totals (GI-03). Open question §19.3(1).
```

**Binding type:** `READ+ESC` (`SC §8`) — facet-only interim; gated on `ER ESC-7-API/stats`.

**Purpose:** Convey scale and momentum (suppliers, categories, RFQs facilitated, deliveries) as a trust
signal — *if and only if* a contract can supply the numbers.

**Layout / wireframe:**

```
┌── Marketplace at a glance ───────────────────────────────────────────────────┐
│   [  N+  ]        [  N+  ]        [  N+  ]        [  N+  ]                      │
│  Verified        Industrial      RFQs            Deliveries                    │
│  suppliers       categories      facilitated     recorded                      │
│  ⚠ ER ESC-7-API/stats — no public statistics read; do NOT fabricate numbers    │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** `stat-card` (`DP §5` / `UX §6.2`) — metric variant, `tabular-nums`.
- **Content hierarchy:** big number (`--iv-text-4xl`, `--iv-font-mono`/tabular) → label
  (`--iv-text-sm`/muted).
- **Data binding (load-bearing ESC):** **`ER ESC-7-API/stats`** — interim per `ER`: **(i) omit the
  section** until a public aggregate read is approved (Board); or **(ii) render only `search_catalog`
  facet-derived counts** (e.g. categories/products) clearly scoped — **never client-computed totals**,
  never a fabricated "RFQs facilitated" figure (`SC §1` GI-03/GI-12). Qualitative copy ("Trusted across
  Bangladeshi industry") is acceptable static marketing meanwhile. **Do not invent a stats endpoint.**
- **States (delta):** if bound → loading/results/error per GI-05; if interim-omitted → **section not
  rendered**. **No fabricated numbers in any state.**
- **Delta A11y:** each stat is a labeled figure (number + descriptive label as text); animated counters
  respect reduced-motion (`DP §2.6`). (Baseline a11y → GI-06; responsive 4→2→1 → GI-07.)

---

## 8. Section — Procurement Process (How it works)  `SEC-PROCESS`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-DETAIL
Deltas:   Static marketing. Describes the governed RFQ → match → quote → compare → award → deliver flow;
          must not imply auto-recommended winner or ranking (R6; Content ≠ Presentation). Restates no
          Doc-4M state (GL "RFQ"/"Award"/"Comparison statement").
```

**Binding type:** `STATIC` (`SC §8`).

**Purpose:** Explain the governed RFQ → match → quote → compare → award → deliver flow at a glance, so
buyers understand the operating-system value (not a generic 3-step funnel).

**Layout / wireframe:**

```
┌── How procurement works on iVendorz ─────────────────────────────────────────┐
│  ① Post RFQ ─▶ ② Smart routing ─▶ ③ Compare quotes ─▶ ④ Award ─▶ ⑤ Deliver    │
│   ClipboardList   Route(governed)   FileSpreadsheet    FileCheck   Truck        │
│   (each step: short professional description; no consumer gimmicks)             │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** `stepper`/`timeline` presentation (`DP §5`); Lucide industrial glyphs.
- **Content hierarchy:** section header → 4–5 numbered steps (icon + title + one-line description).
- **Data binding:** **static marketing content.** It **describes** the governed flow; it must **not
  imply** that the platform auto-recommends a winner or ranks vendors — wording stays faithful to
  **explicit, unranked award** and **Content ≠ Presentation** (Doc-3 §9.1; R6; `GL` "Comparison
  statement"/"Award"). It may reference the RFQ lifecycle conceptually but **coins/restates no Doc-4M
  state** (Doc-4M is authoritative).
- **Delta A11y:** ordered list semantics; step numbers as text, not color-only; icons decorative.
  (Baseline a11y → GI-06; responsive horizontal→vertical stepper → GI-07.)

---

## 9. Section — Trust & Verification  `SEC-TRUST`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-LIST
Deltas:   Static explainer + read-only public trust badge (get_trust_score/get_verified_tier, Doc-5G);
          legends the five firewalled signals (CLAUDE.md §4) + the 4-flag capability matrix
          (Invariant #1). Verification detail/fraud/admin ratings never public (Doc-5G R10). Blacklist /
          private exclusion never rendered or hinted (Invariant #11). The moat, made legible.
```

**Binding type:** `READ` (`SC §8`) — static explainer with read-only public trust badge (no ESC gap).

**Purpose:** Explain *how* trust works on iVendorz — verification, trust score, financial tier,
performance, capability matrix — and legend the badges used across the marketplace.

**Layout / wireframe:**

```
┌── Trust you can verify ──────────────────────────────────────────────────────┐
│  ✓ Verification     ◔ Trust Score      ▦ Financial Tier     ★ Performance      │
│  records (M5)       0–100 (read-only)   A–E (capability)     0–100             │
│  ▮▮▮▮ Capability matrix: supply · service · fabricate · consult                │
│  [ How verification works ▸ P-PUB-18 ]                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** badge legend tiles (Doc-7B `trust-badge` + `badge`); `score-ring` illustration
  (presentation only).
- **Content hierarchy:** header → 4 signal explainers → capability-matrix legend → link to the Trust &
  Verification explainer page (P-PUB-18).
- **Data binding:** primarily **static explainer**; any *live* badge shown here is the **read-only public
  trust badge** (`get_trust_score` / `get_verified_tier`, Doc-5G) — **displayed, never computed.** The
  page **must not** expose verification case detail, fraud signals, or admin ratings (Doc-5G R10).
- **Governance (firewall):** the five governance signals are **independent and firewalled** (CLAUDE.md
  §4; `GL` "Trust signals") — copy must not imply Financial Tier raises Trust, or that any single signal
  dominates. **Blacklist / private exclusion is never rendered or hinted** (Invariant #11; `SC §1` GI-12)
  — the legend covers only public, platform-wide signals; buyer-private CRM stays *private to the buyer*,
  never shown here.
- **Delta A11y:** each signal explained in text; score ring has a text equivalent; color paired with
  label. (Baseline a11y → GI-06; responsive 4→2→1 → GI-07; states → GI-05.)

---

## 10. Section — Customer Success  `SEC-SUCCESS`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-LIST
Deltas:   Static, curated, permissioned testimonials. NOT bound to list_reviews (Doc-5G BC-TRUST-5 is
          per-vendor, engagement-gated) — kept editorial to avoid implying a computed/aggregate signal.
          Open question §19.3(2).
```

**Binding type:** `STATIC` (`SC §8`).

**Purpose:** Social proof — outcomes and quotes from buyers/vendors, presented with enterprise restraint.

**Layout / wireframe:**

```
┌── Trusted by industrial teams ───────────────────────────────────────────────┐
│  "Quote…"                      "Quote…"                     [ logo ] [ logo ]   │
│  — Name, Role, Company         — Name, Role, Company        (with permission)   │
│  ▣ outcome metric (static)     ▣ outcome metric (static)                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** testimonial cards (Doc-7B `card`); optional logo row.
- **Content hierarchy:** quote → attribution → optional outcome metric.
- **Data binding:** **static marketing content** (curated, permissioned testimonials). *Not* bound to
  `list_reviews` — although a **public published-reviews** read exists (Doc-5G BC-TRUST-5), reviews are
  **per-vendor, engagement-gated** content for vendor profiles; landing-page testimonials are **editorial
  marketing**, kept static to avoid implying a computed/aggregate signal. (Live reviews here would be a
  deliberate binding decision — §19.3(2).)
- **Delta A11y:** `<blockquote>` + `<cite>`; logos have `alt`; metrics are text. (Baseline a11y → GI-06;
  responsive 2→1 → GI-07.)

---

## 11. Section — Partner / Ecosystem Logos  `SEC-PARTNERS`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-LIST
Deltas:   Static logo grid/marquee (no contract). Monochrome/brand-tinted for enterprise restraint
          (not a colorful commerce strip — DP §1.3). Marquee pauses on hover / reduced-motion.
```

**Binding type:** `STATIC` (`SC §8`).

**Purpose:** Signal credibility via recognizable partners, associations, or integrations.

- **Components:** monochrome logo grid/marquee (static images).
- **Content hierarchy:** quiet section label → logo row.
- **Data binding:** **static marketing content** (no contract). Logos used **with permission**;
  monochrome/brand-tinted for enterprise restraint (`DP §1.3`).
- **Delta A11y:** each logo has descriptive `alt`; if a marquee, it must be pausable and not the sole
  means of conveying anything (pauses on hover / reduced-motion — `DP §2.6`). (Baseline a11y → GI-06;
  responsive wrap → GI-07.)

---

## 12. Section — Knowledge Resources  `SEC-RESOURCES`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-LIST
Deltas:   Static, CMS/MD-backed (no Doc-5 contract). Authority + SEO surface; links to Resources/Blog
          (P-PUB-23).
```

**Binding type:** `STATIC` (`SC §8`).

**Purpose:** Establish authority and feed SEO — guides, articles, category/spec explainers.

**Layout / wireframe:**

```
┌── Knowledge & resources ─────────────────────────────────────────────────────┐
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                          │
│  │ Guide title  │ │ Article title│ │ Explainer    │   [ All resources ▸ ]      │
│  │ excerpt…     │ │ excerpt…     │ │ excerpt…     │   (P-PUB-23)               │
│  └──────────────┘ └──────────────┘ └──────────────┘                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** resource/article cards (Doc-7B `card`).
- **Content hierarchy:** header → 3 resource cards → "All resources" → P-PUB-23.
- **Data binding:** **static marketing content** (CMS/MD-backed, no Doc-5 contract). Links to
  Resources/Blog (P-PUB-23).
- **Delta A11y:** cards are links with discernible names; excerpts are text; images have `alt`.
  (Baseline a11y → GI-06; responsive 3→2→1 → GI-07.)

---

## 13. Section — Final CTA band  `SEC-CTA`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-DETAIL
Deltas:   Static band; CTAs route to (auth) / Doc-7E (anonymous-action-routing rule). "Talk to us" →
          public contact (P-PUB-24); NO anonymous lead-capture write — it routes, it does not POST
          (Doc-7D §5.4). Amber reserved for value, used sparingly (DP §2.1).
```

**Binding type:** `STATIC` (`SC §8`).

**Purpose:** The decisive conversion moment — drive sign-up / get-started before the footer.

**Layout / wireframe:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│   Ready to modernize procurement?                                              │
│   [ Get started ▸ (auth) ]        [ Talk to us ]                               │
│   (brand-anchored band; amber accent reserved for value, used sparingly)        │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** CTA band (`T-LANDING` slot, `PT §2`); Doc-7B `button` (primary + secondary).
- **Content hierarchy:** headline `--iv-text-3xl/4xl` → primary + secondary CTA.
- **Data binding:** **static**; CTAs **route to `(auth)`** (Doc-7E) — no anonymous mutation (Doc-7D
  §5.2; §1.3). "Talk to us" → public contact/support (P-PUB-24); **no anonymous lead-capture write**
  unless a frozen Public command exists (none bound → it routes, it does not POST — Doc-7D §5.4).
- **Delta A11y:** real links/buttons; sufficient contrast on the brand band (`--iv-fg-inverse` on brand
  fill). (Baseline a11y → GI-06; responsive stacked CTAs / full-bleed band → GI-07.)

---

## 14. Section — Footer  `SEC-FOOTER`

```text
Inherits: GI · T-LANDING · TB-NONE · SK-CARD · MB-LIST
Deltas:   Public marketing footer (IA §4.6) — no app shell footer. Categories column, if live, is again
          ER ESC-7-API-CATNAV (facets-only) else curated static. No buyer-private / draft / excluded
          content (Invariant #11; GI-12).
```

**Binding type:** `STATIC` (`SC §8`) — mostly static; the optional live Categories column is `READ+ESC`
under `ER ESC-7-API-CATNAV`.

**Purpose:** Full marketing footer — wayfinding, company, legal, locale — and SEO surface.

**Layout / wireframe:**

```
┌── FOOTER ────────────────────────────────────────────────────────────────────┐
│ Marketplace      Categories       Company        Legal          Locale         │
│  Catalog          Valves           About          Terms          [ EN ▾ ]       │
│  Vendors          Steel/Metals     How it works   Privacy        ৳ BDT          │
│  Pricing          Electrical…      Resources      Contact                       │
│  Industrial search [View all ▸]                                                 │
│ ───────────────────────────────────────────────────────────────────────────── │
│  © iVendorz · Industrial Procurement OS for Bangladesh        [social]          │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Components:** multi-column link footer (`IA §4.6` Public footer); locale/currency indicator.
- **Content hierarchy:** grouped link columns → legal/locale row → copyright.
- **Data binding:** **mostly static**; the **Categories** column, if it lists live categories, is again
  **`ER ESC-7-API-CATNAV`** (facets-only interim) — otherwise a curated static list. Marketplace/Vendors/
  Pricing links go to P-PUB-10 / P-PUB-12 / P-PUB-04.
- **Governance:** **no buyer-private, no draft, no excluded** content (Invariant #11; Doc-7D §7.2; `SC §1`
  GI-12). Public footer only (no app shell footer — `IA §4.6`).
- **Delta A11y:** `<nav>` landmarks with labels; locale control is a real control; contrast maintained.
  (Baseline a11y → GI-06; responsive columns → stacked accordions on mobile → GI-07.)

---

## 15. Design Language

> **Quality bar:** premium enterprise SaaS — **Stripe** (trust through density/precision, light-first),
> **Linear** (smooth surfaces, micro-animation mastery), **Vercel** (crisp minimal authority),
> **Notion** (information-hierarchy clarity) — fused with the industrial directories **Thomasnet** and
> **DirectIndustry** (technical, dense, taxonomy-forward). The landing page must feel like the **front
> door of an industrial operating system**, not a marketing microsite.

**Expressed adjectives → how realized (via `--iv-*` tokens; `DP` referenced, not redefined):**

| Adjective | Realization |
|---|---|
| **Industrial** | Blueprint navy + electric indigo brand (`DP §1.4`/`§2.1.1`); industrial Lucide glyph set (`DP §10`); technical line-art (`DP §4.5`); category-forward layout. |
| **Professional** | Restrained palette, no commerce red/orange, no auction urgency (`DP §1.3`); structured 12-col grid (`DP §2.10`); Inter + JetBrains Mono (`DP §2.2`). |
| **Premium** | The floating Command Center at high elevation (`DP §2.5.2`); generous spacing on the 4px grid (`DP §2.3`); precise shadows / `--iv-radius-xl`; amber reserved for value only. |
| **Trustworthy** | Verified-supplier showcase + trust badges (read-only, M5); trust/verification explainer (§9); published-only content; WCAG-AA. |
| **Modern** | Light-primary surfaces; subtle depth; GPU-only micro-motion (`DP §2.6`); RSC/SSR speed (§16). |
| **AI-ready** | A reserved, governed AI entry ("Coming Soon") that respects "AI suggests; modules decide" (§2.9; `SC §1` GI-11). |
| **Minimal** | Clear hierarchy, one hero idea, no decorative gimmicks; data/clarity over ornament (`DP §1.3`). |
| **Accessible** | WCAG-AA, visible focus, no color-only info, keyboard-first Command Center (`SC §1` GI-06; §17). |
| **Responsive** | Mobile-first; the floating Command Center adapts to dock/full-bleed/sheet (§2.7; `SC §1` GI-07). |
| **Fast** | SSR/SSG, RSC, cursor pagination, skeletons not spinners (`SC §1` GI-03/GI-11 posture; §16). |

**Theme posture:** **Light is primary** for the public/marketing surface (`DP §3.1` — SEO-first, broad
audience, trust-building). Dark remains a first-class user preference elsewhere via the semantic-token
swap (`DP §2.1.4`), but the landing page is authored light-first; all status/trust/brand colors are
**re-verified against light backgrounds** before freeze (`DP §11`). *(Implementation divergence — shipped
CSS currently defaults dark — is tracked outside this doc per `DP §0`/`§3.1`; not reconciled here.)*

**Color discipline:** brand navy/indigo = ink + interactive; **amber/gold strictly for procurement
value** (awards/PO context) and used sparingly; status colors semantic only, never decorative (`DP §2.1`).

---

## 16. SEO / Performance Posture

> Performance posture is **inherited** (`SC §1` inherited-posture note: RSC streaming + suspense, image/
> font optimization; **no numeric budgets coined** — perf *tests/targets* are Doc-8's). Deltas below are
> landing-specific.

- **Rendering (Doc-7C / Doc-7A):** the landing page is **Server-Component-rendered, SSR/SSG-friendly and
  indexable** with public metadata (Doc-7D §7.1; Doc-7A §3.3). Static marketing sections are
  **SSG-eligible**; dynamic public reads (Command Center suggest, showcase, popular products) stream via
  **RSC + Suspense** (Doc-7C §7). Interactive islands (the Command Center input, explorer drill, ⌘K) are
  **explicit Client Components holding ephemeral UI state only** (Doc-7C §2.3/§5).
- **Indexability (governance):** only **published, Public-projection** content is rendered or placed in
  metadata/sitemap; **no draft/unpublished/soft-deleted/retired** (Doc-7D §7.2). SEO/sitemap reflect
  only the `public` scope and carry **no buyer-private awareness** (Doc-7D §7.3; `SC §1` GI-12).
- **Data discipline:** public lists are **cursor-paginated** with **POLICY-keyed `page_size`**
  (`*.list_page_size_max`) — **offset/page-number forbidden**, **no client-side total** (`SC §1` GI-03;
  Doc-7D §6.2). The browser **never calls Doc-5 directly** (`SC §1` GI-02; Doc-7C §5.1).
- **Performance patterns:** **skeletons mirror final layout, never full-page spinners** (`UX §4.1`);
  GPU-only motion (`opacity`/`transform`), no layout-thrashing animation (`DP §2.6`); images/line-art
  optimized; reduced-motion honored.
- **Budgets / conformance:** **no specific performance budgets are coined here** — the a11y/SEO/perf
  **conformance tests are owned by Doc-8** (`SC §8` Test-hooks; `DP §11`; Doc-7D §8). This document states
  posture, not the gate.

---

## 17. Accessibility Pass (WCAG-AA)

> Accessibility baseline is **inherited** (`SC §1` GI-06: WCAG-AA — semantic markup, full keyboard,
> visible `:focus-visible` ring, ARIA where needed, contrast, no color-only meaning; the a11y **test/gate
> is Doc-8**). This section records only **page-specific** landmarks and notes; per-section deltas live in
> each section's banner / Delta A11y line.

- **Landmarks & headings:** one `<h1>` (hero); each section a labeled `<section>`/`region`; the Command
  Center a labeled `search`/`region`; the footer `contentinfo`; nav as `<nav>` with labels.
- **Keyboard (page-level):** ⌘K focuses the Command Center (§2.6); the suggest combobox uses
  `aria-expanded`/`activedescendant`; logical focus order matching visual order; no keyboard traps.
- **Color & contrast (light primary):** re-verified for light primary (`DP §11`); **no color-only
  information** — trust, tier, capability, status always paired with text/icon (`DP §2.12`/`§11`).
- **Motion / media / touch / errors:** reduced-motion, decorative-vs-meaningful media, touch targets,
  and error rendering all follow the inherited baselines (`SC §1` GI-05/GI-06/GI-07; `DP §2.6`/`§4.5`);
  the mobile search sheet keeps inputs above the keyboard (§2.7).
- **Conformance ownership:** the a11y **test/gate is Doc-8** — this section states intent.

---

## 18. Analytics & Telemetry (proposed presentation events)

> **Presentation telemetry only**, per the `SC §4` analytics grammar (`entity.action`, lowercase,
> past-tense, dot-delimited). These **coin no Doc-2 §8 domain event** and carry **no buyer-private,
> excluded, or protected fact** (`SC §1` GI-12; Invariant #11). Names are presentation vocabulary.

| Proposed event (`SC §4` grammar) | Fires when | Notes / governance |
|---|---|---|
| `page.viewed` | Page loads | Anonymous; no PII beyond standard analytics. |
| `search.focused` | Search input focused (incl. via ⌘K) | Property: trigger (click vs ⌘K). |
| `search.performed` | A search is submitted | Property: result-group counts only (never excluded counts). |
| `cta.clicked` (entry-rail) | An entry-rail item clicked | Property: which entry (explore / create_rfq / find_suppliers / ai). |
| `ai.coming_soon_clicked` | The disabled AI entry is clicked | Measures latent demand for the future AI surface (`ER ESC-7-AI`). |
| `category.explored` / `filter.applied` | Explorer opened / a facet chosen | Facet-backed (interim) — `ER ESC-7-API-CATNAV`. |
| `vendor.card_clicked` | A vendor card / "View profile" clicked | Routes to public profile; no trust value logged beyond presence. |
| `product.clicked` | A product card clicked | `search_catalog`-backed; no product-detail page (`ER ESC-7-API-PRODDETAIL`). |
| `cta.clicked` (route-to-auth) | Any `(auth)`-routing CTA clicked | Property: CTA family (signup / get_started / create_rfq / find_suppliers / claim / favorite). |
| `cta.clicked` (resource / partner) | Static-section interactions | Marketing attribution only. |

- **Discipline (`SC §4`):** no event may carry a count or property that reveals
  exclusion/blacklist/buyer-private state; aggregate counts come from the contract (facets), never client
  computation (`SC §1` GI-03/GI-12).

---

## 19. Governance Ledger & `ER` ESC Register

### 19.1 Governance ledger (constraints honored — reference-never-restate)

> Cross-cutting defaults now live in `SC §1` (GI) and are inherited per section; this ledger keeps the
> **page-specific** orientation pointers (`SC §2` keep-for-orientation guidance).

| Constraint | Source | Where honored |
|---|---|---|
| Public surface anonymous, **read-only, no `Iv-Active-Organization`** | Doc-7D §5.1/§6.3 · `SC §1` GI-01/GI-02 | §0.2, §1.3, §2, §13 |
| Authenticated actions **route to `(auth)`**; CTA gating is UX only | Doc-7D §5.2/§5.3 (`CHK-7-011`) | §1.3, §2.3 (c/d/e), §13 |
| **Published-only Public projection**; no draft/unpublished/soft-deleted | Doc-7D §7.2 | §0.2, §4, §5, §6, §16 |
| **No concept of buyer-private status**; blacklist never rendered | Invariant #11 / Doc-7D §3.2 · `SC §1` GI-12 | §0.2, §5, §9, §18 |
| Bind only the **3 frozen Public reads** | Doc-7D §2.1/§2.2 (BC-MKT-6 §8) | §2.3, §4, §5, §6 |
| **Public trust badge** read-only; detail/fraud never public | Doc-5G BC-TRUST-1/2, R5, R10 | §5, §9 |
| **Content ≠ Presentation**; showcase order implies no matching; **no M3** | Doc-7A §6 / Doc-7D §4.3 · `SC §1` GI-04 | §0.2, §5, §8 |
| **Cursor pagination**, POLICY `page_size`, **no client-side total** | Doc-7D §6.2 / Doc-3 §12 · `SC §1` GI-03 | §2.3a, §6, §16 |
| **Error by `error_class`**, no protected enrichment, `reference_id` | Doc-7A §5.3/§5.4 · `SC §1` GI-05 | §2.4, §17 |
| **Currency per field**, default BDT, never hardcoded; `৳` only for BDT | Doc-2 §0.4 / `DP §9` · `SC §1` GI-08 | §6 |
| **Capability = 4-flag matrix**, never a label | Invariant #1 | §5, §9 |
| **AI suggests; modules decide**; non-recommending; future activation | Invariant #12 / R6 / `Doc-5K` · `SC §1` GI-11 | §2.3e, §2.9 |
| Governance signals **firewalled** (no cross-mutation); scores never hand-edited | CLAUDE.md §4 / Doc-5G R5 | §9 |
| SSR/SSG/RSC indexable; a11y/SEO/perf **tests = Doc-8** | Doc-7D §7.1/§8 · `SC §8` | §16, §17 |
| **Specializes `T-LANDING`**; tokens from `DP`; coins nothing | `PT §2` / Doc-7B / §0 | §0, §3, §13, §15 |
| Public chrome only (no org-switcher / notification center) | `IA §3.2` / Doc-7C · `SC §7` | §1.3, §14 |

### 19.2 `ER` ESC register (gaps flagged, never coined — resolved only via the `ER` named channel)

> Gaps are **defined once in `ER`** (gap + interim + channel). This page cites the **handle only**; it
> renders the registered interim until the gap resolves via its named channel — **never locally** (Doc-7D
> §9.2; CLAUDE.md §11).

| Handle (`ER`) | Touches (this page) | Interim (per `ER`) |
|---|---|---|
| **`ESC-7-API-CATNAV`** | §2.3b, §4 (`SEC-CATEGORY`/`SEC-INDUSTRY`), §14 | `search_catalog` facets only; curated/static selection. |
| **`ESC-7-API-PRODDETAIL`** | §2.4 results, §6 (`SEC-PRODUCTS`) | Render from `search_catalog`; cards open search-in-context / vendor microsite. |
| **`ESC-7-API/stats`** | §2.3f/§2.3g, §3, §7 (`SEC-STATS`) | Omit or show only `search_catalog` facet-derived counts; never fabricated/client-computed numbers; static seed for popular searches; qualitative trust-strip counts. |
| **`ESC-7-API/related`** | §6 (`SEC-PRODUCTS`) — only if related/similar is ever added | Same-category facets labelled "Same category", never "Recommended". |
| **`ESC-7-AI`** | §2.3e, §2.9 | Reserved, disabled "Coming Soon"; no panel, no action. |
| **`ESC-7-API-ADS`** *(inherited)* | whole page | No ad placements on the landing page. |

### 19.3 Open questions for review (Raise ≠ Accept — CLAUDE.md §13)

1. **Marketplace Statistics (§7 `SEC-STATS`):** omit entirely vs. show facet-derived counts only?
   (Product decision; either is governance-safe — no fabricated/uncomputed totals.)
2. **Customer Success (§10 `SEC-SUCCESS`):** keep static editorial vs. later bind `list_reviews` (Doc-5G
   BC-TRUST-5, public published) for live vendor testimonials? (A deliberate future binding, not assumed.)
3. **Trust-strip counts (§2.3g):** confirm whether any `search_catalog` facet aggregate may serve as a
   non-disclosure-safe "verified categories/products" count, vs. qualitative-only.

---

*This document is non-authoritative. It specifies the presentation, interaction, and data-binding intent
of P-PUB-01 (Home / Landing) on the Public surface. It operates under the frozen corpus authority order
(CLAUDE.md §7) and the Doc-7 precedence chain (§0); it introduces no architecture change and coins no
route, contract, projection, state, event, or permission. Cross-cutting defaults are inherited from `SC`;
ESC handles are defined in `ER`; terms in `GL`. On any conflict, the frozen document wins and this file is
patched to match.*
