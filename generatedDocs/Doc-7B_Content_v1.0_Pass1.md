# Doc-7B — Design System & Component Kit — **Content Pass-1 (§0–§4)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§4 of `Doc-7B_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9 + Appendix) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7B_Structure_v1.0_FROZEN` §0–§4; BR1 (§1) · BR2 (§2) · BR3 (§3) · BR4 (§4) |
| Authority | Conforms to `Doc-7A_SERIES_FROZEN_v1.0` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5 surface |
| Posture | Reference-never-restate; **mechanism only — no JSX, no token values, no theme files**. Coins **nothing architectural** (token/component names = presentation vocabulary) |

> **Scope:** the kit foundation — document control & gating (§0), the kit's place (§1), the three-layer component architecture (§2), design tokens & theming (§3), and the Content≠Presentation realization (§4). §5–§9 + Appendix (embedded catalog, status primitives, baseline, responsive/perf, conformance, inventory) land in Pass-2.

---

## §0 — Document Control, Precedence & Gating

### §0.1 Precedence & conformance
Doc-7B is a Doc-7 surface-layer realization document. It **conforms to** `Doc-7A` (its metastandard) and to Doc-4M/Doc-2 (upstream, rank-0); it is **consistent with** the frozen Doc-5 surface (the components render contract data by reference). Precedence: `… → Doc-5A…5K → Doc-7A → Doc-7B…7H → Code`. On any conflict the higher document wins and Doc-7B is corrected.

### §0.2 Realize-never-redecide
Doc-7B realizes Doc-7A's presentation conventions (§3 composition · §6 Content≠Presentation · §9 AI presentation · §10 baseline) as a reusable kit. It re-decides nothing in Doc-7A/Doc-2/Doc-4M/Doc-5. The only new decisions are **presentation choices** (component structure, token names, theme); these coin no domain or API element (BR12).

### §0.3 Flag-and-halt
Where a component would need a contract/field/permission that does not exist in the frozen corpus, Doc-7B **halts and escalates** via the named channel — `[ESC-7-API]` (additive Doc-5x patch, Board) or `[ESC-7-DESIGN]` (allocation) — never invents (`Doc-5 Governance Note §7`).

### §0.4 Freeze obligation
Doc-7B passes the **applicable subset** of `Doc-7A` Appendix A (`CHK-7-xxx`, BR11) — checks outside its scope are marked **N/A with reason**, never silently skipped — and clears any carried `[ESC-7-*]` before freeze (governance §8 rules 1, 3).

---

## §1 — Scope & the Kit's Place *(authors no surface)*

### §1.1 What Doc-7B is
Doc-7B is the **shared Design System & Component Kit** — the single presentation layer every surface (Doc-7D…7H) consumes (BR1). It owns: the component kit (primitives + app components), design tokens & theming, the Content≠Presentation boundary, the shared embedded components assigned to it (BR5, §5), and the a11y/i18n/currency/responsive/performance baseline (§7–§8).

### §1.2 What Doc-7B is not
It **authors no surface, route, view, or screen** (those are Doc-7D…7H) and **no app shell, route-group topology, active-org context, typed API-client, or notification center** (those are Doc-7C). It binds **no Doc-5 contract to a screen** — surfaces do that; the kit only renders the data a surface passes it.

### §1.3 Ordering — frozen first
Per `DR-7-SHELL`, Doc-7B freezes **before** the surfaces; Doc-7C (App Shell) freezes after Doc-7B (it composes Doc-7B primitives, e.g. into the notification center). Surfaces consume both **by reference**, never re-authoring a kit component (single-owner; `CHK-7-005`).

### §1.4 Physical home (orientation, by pointer)
The kit is framework-level presentation code (`REPOSITORY_STRUCTURE.md` — `src/shared/` is framework-level, not a domain module). The exact directory is an implementation detail realized with the code; Doc-7B fixes the **conventions**, not the file tree.

---

## §2 — Component-Kit Architecture & Boundary *(mechanism only)*

### §2.1 Three layers (BR2)
| Layer | Owns | Rule |
|---|---|---|
| **Primitives** | shadcn/ui components **vendored into the kit** (copied in, owned, themeable — shadcn's model) | The base building blocks; styled via tokens (§3); fetch no data, own no business state |
| **App components** | kit **compositions** of primitives (e.g. a data table, a form field, a status chip, a currency display) | Receive content **by props** (§4); own only ephemeral interaction state; fetch no contract |
| **Surface composition** | **NOT Doc-7B** — surfaces (Doc-7D…7H) assemble app components into views | Listed for boundary clarity; out of scope here |

Only **primitives + app components** are Doc-7B. A component at either layer **never** calls a Doc-5 contract, owns content, or holds authoritative state (BR2; `Doc-7A R5/R12`).

### §2.2 Server / Client component discipline
Kit components are **RSC-compatible** (Server-Component-default-friendly — `Doc-7A §3.3`): a component is a Server Component unless it requires interactivity, in which case it is an **explicit Client Component** holding only ephemeral view/interaction state (`Doc-7A R12`). A Client kit component receives no secret, no service credential, and no out-of-wire contract — it renders props the surface (server layer) supplied.

### §2.3 No data, no state, no fetch
The kit boundary is the load-bearing realization of `Doc-7A R5/R12`: a kit component is a pure presentation function of its props + ephemeral interaction state. It **never** fetches, mutates, persists, or caches authoritative content. Any persistence/fetch is the surface's (server layer), passed in by props.

### §2.4 What §2 does not do
Instantiates no component — the primitive set and app-component inventory are realized in Pass-2 (§5 catalog + Appendix). §2 is the architecture rule.

---

## §3 — Design Tokens & Theming *(mechanism only)*

### §3.1 Token layers (BR3)
Realize two token tiers via **Tailwind config + CSS variables**:
- **Primitive tokens** — raw scales (color ramp, spacing scale, type scale, radius, elevation, motion).
- **Semantic tokens** — purpose-named aliases of primitives (e.g. surface/foreground/border/accent/danger), which components reference. Components consume **semantic** tokens, not raw primitives, so theming is a single swap.

### §3.2 No domain value in a token
**No token encodes a domain value.** A token is never "the BDT symbol," never "the color that *means* approved-status." Domain meaning is never embedded in a token (BR3).

### §3.3 Status → presentation-variant mapping
Mapping a **contract-reported state value** (e.g. an RFQ/quotation/verification state, a delivery status) to a **visual variant** is a **kit-component presentation concern keyed on the contract value** (`Doc-7A §6/§7`), realized in the relevant app component (e.g. a status chip), **not** a token semantic and **not** a surface re-decision. The kit **invents no status/label** and re-orders/re-ranks nothing (`Doc-7A §7.1`); it renders whatever state the contract reports.

### §3.4 Theming & microsite overriding
Theming (light/dark, brand) is a **presentation** swap of semantic tokens. The theme layer supports **microsite-level theme overriding** — vendor-branded presentation skinning (`Doc-7A §6.2`) — while kit primitives stay structurally consistent. Microsite theming is **presentation only and owns no M2 content**: it skins the rendering of M2-owned microsite content (rendered by Public 7D / managed by Vendor 7G), never the content itself.

### §3.5 What §3 does not do
Defines no token **values** or theme files — those are Pass-2/implementation. §3 fixes the token **architecture** and the no-domain-value rule.

---

## §4 — Content ≠ Presentation Realization *(mechanism only)*

### §4.1 Props-in, content-out-of-scope (BR4; `Doc-7A §6`, Invariant #9)
The kit's realization of Content≠Presentation is the **props-in pattern**: a presentation component receives content **as props** — the surface fetched it from a wired Doc-5 contract and passes it **by reference** (never reshaped — `Doc-4A §10.1`). The component renders; it **never** fetches a contract, owns content, or caches it as authoritative.

### §4.2 The kit owns presentation; modules own content
A kit component owns **layout, theme, interaction** — presentation. The **content** it displays is module-owned, fetched via contract by the surface. The microsite component (§3.4) is the canonical example: it renders M2 content with vendor-branded presentation, owning the skin, never the data.

### §4.3 Display controls never re-rank governed matching
Kit-provided sort/filter/display controls reorder only **within the surface-supplied result set** and **never re-rank governed M3 matching** (`Doc-7A §6.3`; matching authority = M3 `Doc-5E`). A kit sort toggle is presentation over the contract's already-ordered, exclusion-applied result (the exclusion/order guarantees are the contract's — `Doc-5A §8`); it never reconstructs a ranking the engine withheld.

### §4.4 What §4 does not do
Authors no component; §4 is the separation rule every kit component and surface conforms to.

---

## Pass-1 self-check (pre-review)

- **Mechanism only:** §0–§4 author no component, token value, or screen.
- **Coins nothing architectural:** token/component names deferred to Pass-2 as presentation vocabulary; 0 new module/contract/route/field/permission/state/event/POLICY key.
- **Conforms to Doc-7A:** §2/§3/§4 bind `Doc-7A R5/R12/§3.3/§6/§6.2/§6.3/§7`; notification center correctly excluded (Doc-7C — §1.2).
- **Reference-never-restate:** Doc-7A conventions, `Doc-4A §10.1`, `Doc-5A §8`, `Doc-2 §6.2`/Invariant #9 bound by pointer.
- **Open for review:** confirm §1.4 physical-home pointer (`REPOSITORY_STRUCTURE.md` `src/shared/`) is accurate; confirm the §2.1 "surface composition NOT Doc-7B" row reads as boundary-clarity, not scope creep.

*End of Content Pass-1 (§0–§4) — DRAFT. Realizes `Doc-7B_Structure_v1.0_FROZEN` §0–§4. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9 + Appendix).*
