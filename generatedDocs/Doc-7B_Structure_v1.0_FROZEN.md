# Doc-7B — Design System & Component Kit — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **STRUCTURE FROZEN v1.0** (2026-06-26). Effective = `Doc-7B_Structure_Proposal_v0.1` + `Doc-7B_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-7 — Frontend Realization**; Doc-7B = the shared **Design System & Component Kit**, the first cross-cutting realization (**frozen first** per `DR-7-SHELL`) |
| Realizes | `Doc-7A_SERIES_FROZEN_v1.0` — §3 (composition) · §6 (Content≠Presentation) · §9 (AI advisory presentation) · §10 (a11y/i18n/currency/perf baseline); **defines** the shared embedded components the Doc-7A allocation table assigns to Doc-7B |
| Gated by | `Doc-7A` Appendix A — applicable subset (BR11) |
| Authority | Conforms to `Doc-7A` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5 surface (components render contract data by reference) |
| Coins | **Nothing architectural** — token/component **names** are presentation vocabulary only |

**Governing rule:** Doc-7B is **presentation only** — a kit component owns no content, fetches no contract, holds no authoritative state, caches nothing as authoritative. It renders content a surface passes to it (fetched from a wired Doc-5 contract). Realizes Doc-7A; re-decides nothing.

---

## Ratified decisions (BR1–BR12)

- **BR1 — Scope: the shared kit, cross-cutting, frozen first.** Realizes the presentation layer all surfaces consume (kit, tokens/theme, Content≠Presentation boundary, shared embedded components, a11y/i18n/currency/responsive/perf baseline). Authors no surface/route/screen (Doc-7D…7H) and no app shell/data layer (Doc-7C). Freezes before the surfaces (`DR-7-SHELL`).
- **BR2 — Component-kit boundary (three layers).** **primitives** (shadcn/ui vendored into the kit — owned, themeable) → **app components** (kit compositions of primitives) → **surface composition** (surfaces assemble app components; not Doc-7B). Only primitives + app components live in Doc-7B; none fetches data or owns state.
- **BR3 — Design tokens & theming.** Token layer (color/spacing/typography/radius/elevation/motion) via Tailwind config + CSS variables; theming is presentation. **No token encodes a domain value.** **Status → presentation-variant mapping is a kit-component presentation concern keyed on the contract-reported state** (`Doc-7A §6/§7`); the kit invents no status/label and re-ranks nothing. The theme layer supports **microsite-level theme overriding** (vendor-branded skinning), presentation-only, **owning no M2 content** (`Doc-7A §6.2`).
- **BR4 — Content ≠ Presentation (`Doc-7A §6`; `CHK-7-020/021`).** Presentation components receive content **by props** (surface passes contract-fetched data by reference, never reshaped — `Doc-4A §10.1`); a kit component never calls a contract, owns content, or caches authoritative data. Kit sort/filter controls reorder only within the surface-supplied set and **never re-rank governed M3 matching** (`Doc-7A §6.3`).
- **BR5 — Shared embedded component catalog (single-owner; `CHK-7-005`).** Doc-7B **defines once**: **trust badge / score chip** (M5 `Doc-5G`), **billing / entitlement indicator** (M7 `Doc-5I`), **AI advisory panel** (M9 `Doc-5K`), and the **conversation-thread presentation** (M6 `Doc-5H`, consumed via the Doc-7C shell slot). Each is **presentation-only**, **non-disclosure-bound** (`Doc-7A §8/§9.1a`), contract-owned by its module; surfaces compose, never re-implement. **The global notification center is defined in Doc-7C** (App Shell) — Doc-7B supplies only its presentational primitives (toast/list-item/badge-count) that Doc-7C composes.
- **BR6 — Accessibility baseline (`Doc-7A §10.1`; `CHK-7-060`).** WCAG-AA in the kit (semantic primitives, keyboard, visible focus, contrast, ARIA). A11y test = Doc-8's.
- **BR7 — i18n & currency presentation (`Doc-7A §10.2/§10.3`; `CHK-7-061/062`).** i18n-ready (externalized copy, expansion/RTL tolerance; **locale set not fixed by Doc-7**); a **currency-display component** renders the `{amount, currency}` per value field, **default BDT, never assumed/hardcoded** (`Doc-2 §0.4`).
- **BR8 — Responsive & performance (`Doc-7A §10.4/§3.3`; `CHK-7-063`).** Responsive breakpoints; **RSC-compatible** components (Server-Component-default-friendly; interactive ones are explicit Client Components holding only ephemeral state). Perf budget/test = Doc-8's.
- **BR9 — State / error / empty / loading / not-found primitives.** Shared status primitives: loading/skeleton, empty-state, **error-state** (renders `error.error_class`/`message` per `Doc-7A §5.3` with **no protected enrichment** — `Doc-7A §5.4`), and a **not-found** presentation **byte-identical to genuine absence** (`Doc-7A §8.2`; `CHK-7-041`).
- **BR10 — Out-of-frontend / disposability (`Doc-7A R12`; `CHK-7-070/071`).** Kit owns no authoritative state; in-component caches are disposable; file references render as `file_ref`/links (no embedded authoritative blobs). Flag-and-halt if a component is proposed as a business-state owner.
- **BR11 — Applicable Appendix A subset.** **Applies:** `CHK-7-005` (definer), `CHK-7-020/021`, `CHK-7-040/041/042`, `CHK-7-050/051`, `CHK-7-060/061/062/063`, `CHK-7-070/071`, `CHK-7-080/081`. **N/A (reason):** `CHK-7-001/002/003/004` (no screen binds a contract here — the error-**primitive's** non-disclosure obligation is instead covered by `CHK-7-041` + `Doc-7A §5.4`), `CHK-7-010/011/012` (no active-org/authz surface), `CHK-7-030/031` (no lifecycle screen).
- **BR12 — Coins nothing architectural.** Token/component names are presentation vocabulary. On any gap (a component needing a non-existent contract/field), **flag-and-halt** → `[ESC-7-API]`/`[ESC-7-DESIGN]`, never invent.

---

## Section spine (authored in content passes)

§0 Document Control, Precedence & Gating · §1 Scope & the Kit's Place · §2 Component-Kit Architecture & Boundary (BR2) · §3 Design Tokens & Theming (BR3) · §4 Content ≠ Presentation (BR4) · §5 Shared Embedded Component Catalog (BR5) · §6 State/Error/Empty/Loading/Not-Found Primitives (BR9) · §7 Accessibility, i18n & Currency Presentation Baseline (BR6/BR7) · §8 Responsive & Performance (BR8) · §9 Conformance (applicable Appendix A subset — BR11) & Carried Items · Appendix Component-Inventory Skeleton (names at content).

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7B handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Doc-7B (+ Doc-7C) freeze before surfaces | Doc-7B is the kit owner; surfaces consume by reference | No (ordering) |
| **DR-7-API** | Components render frozen Doc-5 contract data | Kit receives data by props; the binding is the surface's | No (per-surface) |
| `[ESC-7-DESIGN]` | An embedded-component allocation needing ratification | Doc-7B is the definer; escalate, never coin | Possible |
| `[ESC-7-API]` | A component would need a non-existent contract/field | Flag-and-halt; additive Doc-5x patch (Board) | Possible |

## Fences / out of scope

Authoring component code/JSX/token values/theme files (Doc-7B content) · any surface/route/screen (Doc-7D…7H) · the App Shell / route topology / active-org context / typed API-client / **notification center** (Doc-7C) · binding a Doc-5 contract to a screen (surfaces) · giving a kit component authoritative state/content/contract-fetch (`Doc-7A R5/R12`) · re-ranking governed M3 matching in a kit control (`Doc-7A §6.3`) · coining any contract/route/field/permission/state/event/POLICY key or embedding a domain value in a token · the visual-regression / a11y / component **test** obligation (Doc-8).

---

*End of Doc-7B Canonical Structure **v1.0 FROZEN**. Effective = Proposal v0.1 + Patch v0.1.1; Independent Hard Review + Structure Freeze Audit PASS. Doc-7B realizes Doc-7A's presentation conventions as the shared kit; presentation only; conforms to the frozen Doc-7A allocation table; coins nothing. Next: Doc-7B content passes (the kit).*
