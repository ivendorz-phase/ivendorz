# Doc-7B — Design System & Component Kit — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-7B artifact. Next: Independent Hard Review (Board) → Structure Patch → short closure check → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Supersedes | — (first Doc-7B artifact) |
| Program | **Doc-7 — Frontend Realization**; Doc-7B = the **shared Design System & Component Kit**, the first cross-cutting realization (**frozen first** per `DR-7-SHELL`) every surface (Doc-7D…7H) consumes |
| Realizes | `Doc-7A_SERIES_FROZEN_v1.0` — §6 (Content≠Presentation) · §10 (a11y/i18n/currency/perf baseline) · §9 (AI advisory presentation) · §3 (composition) — and **defines** the shared embedded components named in the Doc-7A Program-partition allocation table (trust badge, notification-center & thread presentation, billing indicator, AI panel) |
| Gated by | `Doc-7A` Appendix A (`CHK-7-xxx`) — the **applicable subset** (Doc-7B authors no screen; per-surface contract-binding checks are N/A here — §9) |
| Authority | Frozen corpus governs; `Doc-5_Program_Governance_Note §3/§7/§8`. Doc-7B **conforms** to Doc-7A (its metastandard) and to Doc-4M/Doc-2 (upstream); **consistent with** the frozen Doc-5 surface (the components render contract data by reference) |
| Contains | Structure only — scope, R-set, section spine, the component-inventory skeleton, carried dependencies. **No JSX, no component code, no tokens values, no theme files** — those land in Doc-7B content passes |
| Coins | **Nothing architectural** — no module, contract, route, field, permission slug, state, event, audit action, or POLICY key. Token/component **names** are presentation vocabulary (the legitimate *how* Doc-7 owns), never domain values |

**Governing rule:** Doc-7B is **presentation only**. A kit component **owns no content, fetches no contract, holds no authoritative state, and caches nothing as authoritative** (Doc-7A R5/R12). It renders content passed to it by a surface (which fetched it from a wired Doc-5 contract). Doc-7B realizes Doc-7A's conventions as a reusable kit; it re-decides nothing.

---

## Decisions proposed for ratification at structure freeze (R-set)

- **DR1 — Scope: the shared Design System & Component Kit (cross-cutting, frozen first).** Doc-7B realizes the presentation layer every surface consumes: the component kit, design tokens/theme, the Content≠Presentation boundary, the shared embedded components, and the a11y/i18n/currency/responsive/performance baseline. It **authors no surface, route, or screen** (those are Doc-7D…7H) and no app shell/data layer (that is Doc-7C). Per `DR-7-SHELL` it **freezes before** the surfaces. *(Alternative: fold the kit into each surface. Rejected — duplicates components and breaks the single-owner embedded-component rule, Doc-7A `CHK-7-005`.)*
- **DR2 — Component-kit boundary (three layers).** Realize a strict layering: **primitives** (shadcn/ui components vendored into the kit — owned, themeable; shadcn's copy-in model) → **app components** (kit compositions of primitives, e.g. a data table, a form field) → **surface composition** (surfaces assemble app components; not part of Doc-7B). Only primitives + app components live in Doc-7B; surfaces compose them. No primitive or app component fetches data or owns state.
- **DR3 — Design tokens & theming.** Realize a token layer (color, spacing, typography, radius, elevation, motion) via Tailwind config + CSS variables; theming is **presentation** (Doc-7A §6). **No token encodes a domain value** (a token is never "the BDT symbol," "the approved color meaning approved-status," etc. — status→presentation mapping is a render-time concern, not a token semantic). Token **names** are presentation vocabulary, coined freely; domain meaning is never embedded in a token.
- **DR4 — Content ≠ Presentation realization (Doc-7A R5; `CHK-7-020/021`).** Presentation components receive content **by props** (the surface passes contract-fetched data, by reference, never reshaped — `Doc-4A §10.1`); a kit component **never** calls a contract, owns content, or caches authoritative data. Display ordering/sort controls provided by the kit reorder only within the surface-supplied result set and **never re-rank governed M3 matching** (Doc-7A §6.3).
- **DR5 — Shared embedded component catalog (single-owner; `CHK-7-005`).** Doc-7B **defines once** the cross-surface embedded components the Doc-7A allocation table assigns to it: **trust badge / score chip** (renders M5 `Doc-5G` read data), **billing / entitlement indicator** (M7 `Doc-5I`), **AI advisory panel** (M9 `Doc-5K`), and the **conversation-thread presentation** (M6 `Doc-5H` — presentation only; the App Shell Doc-7C provides the mount slot + data). Each is **presentation-only**, **non-disclosure-bound** (Doc-7A §8/§9.1a — never renders a protected/excluded or buyer-private datum), and its **contract owner is the module**; surfaces compose them, never re-implement (Doc-7A C-1 rule).
- **DR6 — Accessibility baseline (Doc-7A §10.1; `CHK-7-060`).** Realize WCAG-AA in the kit: semantic primitives, full keyboard operability, visible focus order, color-contrast compliance, ARIA where a primitive requires it. Accessibility is a kit property surfaces inherit; the a11y **test** is Doc-8's.
- **DR7 — i18n & currency presentation (Doc-7A §10.2/§10.3; `CHK-7-061/062`).** Realize i18n-readiness (externalized copy, text-expansion/RTL tolerance; **locale set not fixed by Doc-7**) and a **currency-display component** that renders the `{amount, currency}` pair carried by each value field, **default BDT, never assumed/hardcoded** (`Doc-2 §0.4`). Localized copy is presentation; authoritative data stays module-owned.
- **DR8 — Responsive & performance (Doc-7A §10.4/§3.3; `CHK-7-063`).** Realize responsive breakpoints and **RSC-compatible** components: components are Server-Component-default-friendly; any component requiring interactivity is explicitly a Client Component holding only ephemeral state (Doc-7A R12). The performance **budget/test** is Doc-8's.
- **DR9 — State / error / empty / loading / not-found presentation primitives.** Realize the shared status primitives every surface reuses: loading/skeleton, empty-state, **error-state** (renders from `error.error_class`/`message` per Doc-7A §5.3 — **no protected enrichment**, Doc-7A §5.4), and a **not-found** presentation that is **byte-identical to genuine absence** (Doc-7A §8.2; `CHK-7-041`). These primitives encode the non-disclosure presentation contract once.
- **DR10 — Out-of-frontend / disposability (Doc-7A R12; `CHK-7-070/071`).** The kit owns **no authoritative state**; any in-component cache is a disposable projection; file references render as `file_ref`/links (never embedded authoritative blobs). Flag-and-halt if a kit component is proposed as an owner of business state.
- **DR11 — Applicable Appendix A subset (Doc-7A §12 / Appendix A applicability preamble).** Doc-7B runs the **applicable** `CHK-7-xxx` subset and marks the rest **N/A with reason**: **N/A** — `CHK-7-001/002/003/004` (no screen binds a contract here), `CHK-7-010/011/012` (no active-org/authz surface here), `CHK-7-030/031` (no lifecycle screen). **Applies** — `CHK-7-005` (Doc-7B is the *definer*), `CHK-7-020/021` (Content≠Presentation), `CHK-7-040/041/042` (non-disclosure presentation, esp. not-found primitive), `CHK-7-050/051` (AI panel presentation), `CHK-7-060/061/062/063` (baseline), `CHK-7-070/071` (out-of-frontend), `CHK-7-080/081` (realize-never-redecide).
- **DR12 — Coins nothing architectural.** Token/component names are presentation vocabulary; no domain/API element is introduced. On any gap (a component that would need a contract/field that does not exist), **flag-and-halt** → `[ESC-7-API]`/`[ESC-7-DESIGN]`, never invent.

---

## The Doc-7B section spine (authored in content passes)

| § | Title | Realizes | Detail |
|---|---|---|---|
| §0 | Document Control, Precedence & Gating | Doc-7A §0; governance §3 | Doc-7B conforms to Doc-7A; consistency with Doc-5; flag-and-halt |
| §1 | Scope & the Kit's Place (cross-cutting, frozen first) | DR1; `DR-7-SHELL` | what Doc-7B governs vs Doc-7C/7D…7H; authors no surface |
| §2 | Component-Kit Architecture & Boundary | DR2 | primitives → app components → (surface composition); no data/state in kit |
| §3 | Design Tokens & Theming | DR3 | token layer; theme = presentation; no domain value in a token |
| §4 | Content ≠ Presentation Realization | DR4; Doc-7A §6 | props-in; no content ownership; no M3 re-rank |
| §5 | Shared Embedded Component Catalog | DR5; Doc-7A allocation table; `CHK-7-005` | trust badge · notification/thread presentation · billing indicator · AI panel; single-owner; non-disclosure-bound |
| §6 | State / Error / Empty / Loading / Not-Found Primitives | DR9; Doc-7A §5.3/§5.4/§8.2 | shared status primitives; not-found ≡ absence; no protected enrichment |
| §7 | Accessibility, i18n & Currency Presentation Baseline | DR6/DR7; Doc-7A §10 | WCAG-AA; i18n-ready; currency-per-field default BDT |
| §8 | Responsive & Performance (RSC-compatible) | DR8; Doc-7A §3.3/§10.4 | breakpoints; Server-Component-default-friendly |
| §9 | Conformance (applicable Appendix A subset) & Carried Items | DR11/DR12 | applicable `CHK-7-xxx` + N/A set with reasons; `DR-7-*`/`[ESC-7-*]` |
| Appendix | Component-Inventory Skeleton | DR2/DR5/DR9 | primitive/app/embedded component **names** assigned at content (presentation vocabulary) |

*Doc-7B authors no surface. §2–§8 are the kit; the actual components/tokens/themes are realized in the Doc-7B content passes.*

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7B handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Doc-7B (+ Doc-7C) freeze before surfaces; surfaces consume by reference | Doc-7B is the kit owner; surfaces never re-author it | **No** (ordering) |
| **DR-7-API** | Components render frozen Doc-5 contract data | The kit receives data by props; the *binding* is the surface's (the kit names no contract as a dependency, only the module that owns the rendered datum) | **No** (per-surface) |
| `[ESC-7-DESIGN]` | An embedded-component allocation needing ratification | Doc-7B is the definer; an unresolved allocation escalates, never coined | **Possible** |
| `[ESC-7-API]` | A component would need a contract/field that does not exist | Flag-and-halt; additive Doc-5x patch (Board); never invented | **Possible** |

## Fences / out of scope

Authoring actual component code / JSX / token values / theme files (Doc-7B content) · authoring any surface, route, or screen (Doc-7D…7H) · the App Shell, route-group topology, active-org context, or typed API-client (Doc-7C) · binding a Doc-5 contract to a screen (surfaces do that) · giving a kit component authoritative state, content ownership, or a contract fetch (Doc-7A R5/R12) · re-ranking governed M3 matching in a kit control (Doc-7A §6.3) · coining any contract/route/field/permission/state/event/POLICY key or embedding a domain value in a token · the visual-regression / a11y / component **test** obligation (Doc-8).

---

## Provenance & next steps

- **Provenance:** first Doc-7B artifact. Grounded in `Doc-7A_SERIES_FROZEN_v1.0` (its metastandard — §6/§9/§10 + the embedded-component allocation table) and the frozen corpus (Doc-2 §0.4 currency; Doc-5G/5H/5I/5K as the modules whose data the embedded components render). No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. R-set DR1–DR12; section spine §0–§9 + component-inventory appendix.
- **Next (Board-directed loop):** Independent Hard Review → Structure Patch (fixes) → short closure check → Structure Freeze Audit → `Doc-7B_Structure_v1.0_FROZEN` → Doc-7B content passes (the kit), then Doc-7C (App Shell), then the surfaces Doc-7D…7H.

*End of Doc-7B Canonical Structure **Proposal v0.1** — structure only. On any conflict, Doc-7A + the frozen corpus win; flag-and-halt. Doc-7B realizes Doc-7A's presentation conventions as the shared kit; presentation only; coins nothing. Next: Independent Hard Review.*
