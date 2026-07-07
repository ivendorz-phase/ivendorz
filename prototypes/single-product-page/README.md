# Single Product Page — High-Fidelity Clickable Prototype

**Status:** NON-PRODUCTION · quarantined under `prototypes/` (RS v1.1 P-4, excluded from root build gates) ·
non-authoritative · coins no route, contract, token, page ID, or score. On any conflict the **frozen
corpus wins** (CLAUDE.md §7, §11).

**Purpose:** a mockup-first **Visual Approval** artifact for stakeholder review **before any production
code** — the same gate used for the Comparative Statement (CS) surface. It validates information
architecture, visual hierarchy, section order, CTA placement, responsive behaviour, navigation, trust
signals, and industrial-marketplace usability for the public **Single Product Page**.

**What it is not:** no backend, no API, no database, no business logic, no persistence, no production
React. 100% mock data in one self-contained HTML file. Opening `index.html` in any browser (from
`file://` or a host) is the whole experience — there is nothing to install or build.

---

## How to review it

Open [`index.html`](./index.html) in a browser. A dark **prototype toolbar** sits at the top — it is
the review harness, *not* part of the product UI. It gives you:

- **Device switcher** — Desktop 1440 · Tablet 768 · Mobile 390. The page reflows through the *same
  markup* using CSS container queries; on a small screen the frame scales to fit.
- **Annotations toggle** — overlays a governance flag on every section (see below) with a hover/focus
  note explaining exactly what is grounded and what is not.

Everything inside the white device frame is the proposed product. All CTAs are mock — conversion
actions (Request Quotation, Contact, Chat, Sign-in) fire a toast explaining they route to the auth
boundary in production; they never mutate anything.

---

## Governance annotation layer (the review's spine)

Because the brief asks for several sections the **frozen corpus currently excludes or does not model**,
every section is flagged so stakeholders approve with eyes open. Toggle **Annotations** in the toolbar.

| Flag | Meaning |
|---|---|
| **GROUNDED** (green) | The frozen corpus permits this on the public product page **today**. |
| **PROPOSED** (violet) | Net-new concept/field — plausible, but requires a Board decision / ESC intake before it can be built. |
| **CONFLICTS** (red) | Contradicts a frozen normative exclusion — shown for completeness, but must **not** ship without an explicit corpus patch. |
| **MIXED** (amber) | The section combines grounded and non-grounded parts (the note itemizes which). |

The annotation colours are **prototype-chrome only** and deliberately outside the product palette, so
they can never be mistaken for product status colours.

**Anchors used by the flags:** ADR-025 (apex id-anchored URL law) · Doc-4D PublicProductDetail Patch
v1.0.3 (normative exclusions) · `docs/product/ux/screen_specifications.md` §P-PUB-11 · Doc-7D §5
(conversion CTAs → auth). These are referenced *by pointer*; nothing is copied or re-coined.

### Section-by-section governance status

| # | Section | Flag | Rationale (short) |
|---|---|---|---|
| 1 | Sticky header (logo · search · categories · RFQ pill · sign-in) | GROUNDED | Mirrors the built public SiteHeader; all CTAs → auth. |
| 2 | Breadcrumb | GROUNDED | P-PUB-11 required; mirrors the frozen taxonomy path (≤4 levels). |
| 3 | Product hero (gallery · title · vendor + Verified · CTAs) | MIXED | Core is P-PUB-11; **availability** + warranty chips are PROPOSED. |
| 4 | Commercial summary (price · MOQ · lead time · stock · packaging · delivery) | CONFLICTS | Doc-4D excludes **price/currency** and **inventory**; "Price on request" honours it, the Stock row is the conflict; MOQ/lead-time/packaging/delivery are PROPOSED. |
| 5 | Action panel (RFQ · Contact · Chat · Save · Share · Compare) | MIXED | RFQ + Contact are grounded (→ auth); **Chat / Save / product Compare** are PROPOSED (only *vendor* compare P-PUB-20 is grounded). |
| 6 | Specifications (tabs + table) | GROUNDED | Spec entries + spec docs are in the projection; **Attributes** noted as reserved-empty. |
| 7 | Features & benefits | PROPOSED | Vendor marketing content — net-new content model. |
| 8 | Applications / industries | PROPOSED | Industry taxonomy not modelled (ESC-CLASS-INDUSTRY). |
| 9 | Downloads (datasheet · drawing · cert · checklist · URS) | GROUNDED | Uses exactly the frozen kind enum `urs·datasheet·checklist·drawing·standard`. |
| 10 | Gallery (images · video · 360°) | MIXED | Images grounded; **video / 360°** are PROPOSED media kinds. |
| 11 | **Same category** strip | GROUNDED | P-PUB-11 optional facet — labelled "Same category", **never "Recommended"**. |
| 12 | Similar products strip | CONFLICTS | Doc-4D excludes "related items"; a similarity-derived strip implies computed relevance. |
| 13 | About vendor | MIXED | Name + microsite + **binary Verified** + capability matrix grounded; experience figures PROPOSED; **no score/band/tier ever**. |
| 14 | Vendor contact card | PROPOSED | Public projection exposes no direct contacts; details masked, reveal → auth. |
| 15 | Inquiry CTA banner | GROUNDED | Enquire → P-PUB-17 / auth (Doc-7D §5). |
| 16 | FAQ | PROPOSED | Net-new content concept. |
| 17 | SEO content block | MIXED | Canonical URL grounded (ADR-025, Class K); prose PROPOSED. |
| 18 | Footer | GROUNDED | Mirrors the built public SiteFooter. |

> **Reviews & ratings are intentionally absent from every section.** Public reviews are *vendor*-subject
> (Doc-2 §10.6 `public_reviews`), and no aggregate rating, average score, recommendation %, or derived
> review statistic may be displayed — the frozen corpus defines no such computation. See the companion
> `docs/product/requirements/REVIEWS_RATINGS_DISPLAY_PLANNING_v1.0.md`.

---

## Component inventory

All components are hand-built to the frozen kit's conventions (they are **not** the real React kit —
this is a prototype). Tokens are copied **verbatim** from `app/globals.css`.

**Global / chrome**
- Prototype toolbar, device frame (container-query rig + scale-to-fit), annotation chip + shared
  tooltip, zoom overlay (dialog), toast rack (`aria-live`). All chrome uses a `pc-` prefix.

**Product primitives (kit-convention)**
- `.btn` variants: `primary` (navy gradient), `outline`, `ghost`; sizes `sm`/`md`/`lg`; `pill`, `block`.
- `.badge` variants: `success` (Verified), `brand` (navy), `amber` (premium/Featured), `neutral`.
- `.card`, `.chip`, `.section-title` / `.section-head`.
- Brand: the **official `public/brand/ivendorz-logo-long.svg` inlined verbatim** as a `<symbol>` — never redrawn.

**Composite components**
- Two-row **SiteHeader** (BrandLogo, SearchBar, All-Categories dropdown, primary nav, RFQ pill) + mobile drawer.
- **Breadcrumb**, sticky **section-nav** (scrollspy), **hero gallery** (main + thumb strip), **pricing/commercial rail**, **action panel** with **share popover**, **vendor snapshot rail card**.
- **Spec tabs + table**, **feature cards**, **application cards**, **download list**, **media gallery**, **product strips** (Same category / Similar), **vendor about + capability matrix**, **vendor contact card** (masked), **inquiry banner**, **FAQ accordion**, **SEO block**, **SiteFooter**, **sticky mobile CTA bar**.

**Mock illustrations (inline SVG, clearly not photos)**
- Gate-valve studio render · dimension drawing · cross-section · installed-line view. Reused at
  hero / thumbnail / gallery / product-card sizes from one sprite (`<use href="#…">`, same-document).

**Icon set:** ~40 inline stroke icons (lucide convention) as `<symbol>`s — zero external icon library.

---

## Interaction notes

| Interaction | Behaviour |
|---|---|
| Device switch | Sets container width; page reflows via `@container` queries; JS scales the frame to fit the stage. |
| Annotations toggle | Adds/removes per-section chips + dashed outlines; **zero layout shift** (absolute + outline). |
| Gallery | Thumb click swaps the main image (`aria-current`); main image / gallery tiles open the **zoom overlay** (click image to toggle magnification — placeholder for production pan/lens zoom). |
| Spec tabs | `role="tablist"` with roving `tabindex` + Arrow-Left/Right; panels toggle `hidden`. |
| FAQ | Native `<button aria-expanded>` accordion; Enter/Space. |
| Share | Absolute-positioned popover; Esc / click-outside closes; "Copy link" fires a mock toast (no real clipboard dependency). |
| Save / Compare | `aria-pressed` toggle + toast; the toast text states the concept is PROPOSED. |
| Categories | Simplified dropdown (hover with 150 ms close timer + click + Esc). |
| Section nav | Smooth-scroll to sections; active tab follows scroll (scrollspy on the frame scroller). |
| Sticky mobile CTA | Docked below the frame at ≤639; Request Quotation + contact + save. |
| Toasts | Single rack, `aria-live="polite"`, capped at 3, auto-dismiss 4 s. |

---

## Responsive notes

Desktop-first, **two container-query bands** (`@container page`): tablet ≤1023, mobile ≤639. The same
markup adapts — no separate mobile page. Key transforms:

- **Header:** row-2 nav collapses; a hamburger drawer + full-width search row appear at mobile.
- **Hero:** 3-column (gallery / info / action rail) → 2-column at tablet (rail becomes a 2-up card row) → single stacked column at mobile, with the hero CTAs moving into a **sticky bottom CTA bar**.
- **Pricing / commercial facts:** re-flow within the rail card.
- **Spec table:** label-over-value stacking at mobile.
- **Feature / application cards:** `auto-fit` grid → 2-up → 1-up.
- **Product strips:** grid → horizontal scroll-snap rows at tablet/mobile.
- **Vendor about + contact:** 2-column → stacked.
- **SEO block:** 2 columns → 1.
- **No horizontal page scroll at any width** (wide content scrolls inside its own container).

---

## Accessibility notes

- Skip link to `#main`; visible focus ring (`:focus-visible`, 2px indigo `--iv-brand-500`, used nowhere decoratively).
- Landmarks (`header`/`nav`/`main`/`footer`); each section `aria-labelledby` its heading.
- ARIA on accordion (`aria-expanded`/`aria-controls`), tabs (`role=tab/tabpanel`, roving tabindex, arrows), popover & menu (`aria-haspopup`/`aria-expanded`, Esc returns focus), toasts (`aria-live`).
- Touch targets ≥44px (icon buttons, thumbs, accordion headers).
- Contrast pairs pre-checked AA (body 10.4:1; muted 5.4:1; white on navy 13:1; links use `--iv-brand-600` #4f46e5 = 7.3:1, **not** brand-500 which is reserved for the non-text focus ring).
- `prefers-reduced-motion` disables smooth-scroll and transitions.

---

## UX rationale (per major section)

- **Header:** persistent search + All-Categories + a visually dominant **Request for Quotation** pill keep the platform's primary job (RFQ) one click away on every scroll position. RFQ keeps the navy CTA colour — gold is reserved for premium/verified/featured, never for the primary action.
- **Breadcrumb:** industrial buyers arrive deep via search/category; a full taxonomy path orients them and offers lateral escape without a back-button.
- **Hero:** a large technical illustration + a scannable spec/vendor/availability block answers "is this the right part, from a trustworthy source, available?" above the fold — the three questions a procurement engineer asks first. Trust is a single **binary Verified** badge (no score theatre).
- **Commercial rail (sticky):** B2B buyers don't checkout — they request a quote. The rail keeps price-on-request, MOQ, lead time and the RFQ button pinned while the buyer reads specs. (Flagged, because price/stock conflict with the frozen public exclusions.)
- **Action panel:** collects the "what can I do with this listing" verbs (quote/contact/chat/save/share/compare) in one place instead of scattering them, so the primary path (quote) stays unambiguous.
- **Specifications:** a professional, grouped table (General/Dimensions/Materials/Standards) is the core decision artifact for industrial parts; tabs prevent a 30-row wall.
- **Features / Applications:** benefit-led scanning for less-technical approvers; applications map the part to the buyer's own plant type.
- **Downloads:** datasheets, drawings and certificates are how industrial specs get validated and approved internally — first-class, using only the frozen document kinds.
- **Gallery:** consolidates all media (with honest video/360° placeholders) so the hero stays uncluttered.
- **Same category / Similar:** supports "is there a better fit / a second source" — the grounded one is a neutral "Same category" facet; the similarity strip is flagged CONFLICTS.
- **About vendor + contact:** who-you're-buying-from is half the B2B decision; capability matrix (Invariant #1 four flags) + binary Verified + a microsite link, with contact gated to auth.
- **Inquiry banner / FAQ / SEO:** convert late-scrollers, pre-empt objections, and make the page discoverable — the canonical URL is the one grounded, load-bearing piece here.
- **Footer:** platform wayfinding + the "Made in Bangladesh · BDT" positioning.

---

## Design assumptions

1. **Anchor product is the real presentation seed item** — "Cast Steel Gate Valve DN100 PN16", vendor "Padma Valve & Fittings Ltd." (Verified), from `app/(public)/_components/discovery/seed.ts`. All engineering values (materials, standards, dimensions) are **plausible mock detail** authored for realism, not sourced from a real datasheet.
2. **The canonical URL shown is illustrative** — it applies the ADR-025 pattern `/marketplace/product/{name-slug}-{uuid}` to the seed UUID; the host `ivendorz.example` is a placeholder.
3. **"Inter" renders via the system fallback stack** (no CDN fonts under a strict CSP). On a machine with Inter installed it looks pixel-accurate; otherwise the nearest system sans is used.
4. **Illustrations stand in for product media** — the frozen contract stores media as storage refs; there are none in the seed, so inline SVG technical drawings are used and are obviously not photographs.
5. **The commercial rail is aspirational** — it visualises what a full B2B pricing block *could* look like precisely so stakeholders can decide whether to pursue the corpus patches it would require. It is flagged CONFLICTS/PROPOSED, not a recommendation to build as-is.
6. **Contact details are masked mock values** — the real public projection exposes none; the masking demonstrates the auth-gating pattern.
7. **Device presets** approximate common breakpoints (1440 desktop, 768 tablet portrait, 390 modern mobile); real production breakpoints are owned by the design system, not this file.
8. **No analytics, cookies, or storage** — the prototype is stateless; nothing persists between reloads.

---

## Relationship to the codebase

- The **real** public product page is `app/(public)/marketplace/product/[slug]/page.tsx` (P-PUB-11, FE-PUB-05), which today renders the *grounded* subset only. This prototype proposes the fuller experience and marks the delta.
- Approving this prototype does **not** authorise building the PROPOSED/CONFLICTS sections. Those feed **ESC intake / a Board packet** for the fields and concepts they introduce (pricing block, related/similar, chat, product-compare, video/360°, industries, FAQ/marketing content models) before engineering begins.
