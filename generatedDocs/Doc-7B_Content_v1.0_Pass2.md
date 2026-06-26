# Doc-7B — Design System & Component Kit — **Content Pass-2 (§5–§9 + Appendix)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §5–§9 + Appendix of `Doc-7B_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7B FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7B_Structure_v1.0_FROZEN` §5–§9 + Appendix; BR5 (§5) · BR9 (§6) · BR6/BR7 (§7) · BR8 (§8) · BR11/BR12 (§9) |
| Carries forward | Pass-1 §2 kit boundary · §4 props-in / re-query-not-reorder |
| Posture | Reference-never-restate; mechanism only. Coins **nothing architectural** (component names = presentation vocabulary) |

> **Scope:** the shared embedded component catalog (§5), status/error/empty/loading/not-found primitives (§6), the a11y/i18n/currency presentation baseline (§7), responsive & performance (§8), conformance & carried items (§9), and the component-inventory skeleton (Appendix).

---

## §5 — Shared Embedded Component Catalog *(mechanism only)*

> Doc-7B **defines once** the cross-surface embedded components the frozen `Doc-7A` allocation table assigns to it; surfaces **compose, never re-implement** (`CHK-7-005`). Each is **presentation-only** (renders props the surface fetched from the module's wired contract), **non-disclosure-bound** (`Doc-7A §8/§9.1a`), and **contract-owned by its module**. **The global notification center is Doc-7C's**, not here (§1.2).

| Embedded component | Renders (by props, from) | Non-disclosure rule | Contract owner |
|---|---|---|---|
| **Trust badge / score chip** | M5 trust/performance score + verification state (`Doc-5G` read) | Renders only what the wired read discloses; never an internal signal | M5 `Doc-5G` |
| **Billing / entitlement indicator** | M7 entitlement/quota *state* surfaced via wired contract (`Doc-5I`) | boolean/numeric/enum only, never plan-/role-name (Invariant #10); never the out-of-wire `resolve_entitlements` (Pass-1 §2.3) | M7 `Doc-5I` |
| **AI advisory panel** | M9 advisory read (`Doc-5K`) | Labeled advisory, non-authoritative, non-gating; regenerable/TTL (`Doc-5K R7`); **obeys §8 — never surfaces a protected/excluded or buyer-private datum** (`Doc-7A §9.1a`) | M9 `Doc-5K` |
| **Conversation-thread presentation** | M6 thread/messages (`Doc-5H`), mounted via the **Doc-7C shell slot** | Renders only disclosed messages; no excluded-party inference | M6 `Doc-5H` |

### §5.1 Single-owner & composition
Each component is **defined once** here; a surface imports and composes it, **never re-implementing** it (`CHK-7-005`). The **contract owner remains the module** regardless of where the component renders — the kit names the module whose data it displays, never re-owns it.

### §5.2 Presentation-only & non-disclosure
None of these components fetches a contract (the surface or shell does — Pass-1 §2.3); each renders props. Each is **non-disclosure-bound**: it displays only what the wired read discloses and never reconstructs a protected/excluded fact (`Doc-7A §8`). The AI panel additionally never auto-commits a decision (`Doc-7A §9`).

---

## §6 — State / Error / Empty / Loading / Not-Found Primitives *(mechanism only)*

Realize the shared status primitives every surface reuses (BR9):

| Primitive | Realization | Rule |
|---|---|---|
| **Loading / skeleton** | suspense-boundary fallback for streamed RSC reads (`Doc-7A §3.5`) | presentation; no data |
| **Empty-state** | renders when a contract returns an empty (exclusion-applied) result | shows the contract's empty result; computes no client-side total (`Doc-7A §8.3`) |
| **Error-state** | renders from `error.error_class` / `error.message` (`Doc-7A §5.3`) | **no protected enrichment** (`Doc-7A §5.4`) — never surfaces field/metadata/header protected facts |
| **Not-found** | renders for `NOT_FOUND` (404) | **byte-identical to genuine absence** (`Doc-7A §8.2`) — no distinction in copy/layout/timing/telemetry between "forbidden" and "does not exist" |

### §6.1 The non-disclosure presentation contract, encoded once
The error and not-found primitives encode `Doc-7A`'s non-disclosure presentation rules **once** so every surface inherits them: the protected-fact collapse (`§8.2`) and the no-protected-enrichment rule (`§5.4`). A surface reusing these primitives cannot accidentally leak through an error or not-found view. (Covered by `CHK-7-041` + `Doc-7A §5.4` — BR11 seam.)

---

## §7 — Accessibility, i18n & Currency Presentation Baseline *(mechanism only)*

### §7.1 Accessibility (BR6; `CHK-7-060`)
WCAG-AA realized in the kit: semantic primitives, full keyboard operability, visible focus order, color-contrast compliance, ARIA on primitives that require it. Inherited by every surface; the a11y **test** is Doc-8's.

### §7.2 i18n / localization (BR7; `CHK-7-061`)
Copy is **externalized and translatable**; layout tolerates text expansion and RTL where a locale requires it. **The locale set is a product requirement, not fixed by Doc-7** (`Doc-7A §10.2`). Localized copy is presentation; authoritative data stays module-owned.

### §7.3 Currency display (BR7; `CHK-7-062`)
A **currency-display app component** renders the `{amount, currency}` pair carried by each value field, **default `BDT`, never assumed or hardcoded** (`Doc-2 §0.4`). It reads the currency adjacent to the amount from the contract; multi-currency display is presentation over contract-provided pairs. Locale-aware number/currency formatting is presentation (§7.2).

---

## §8 — Responsive & Performance *(mechanism only)*

### §8.1 Responsive (BR8)
Realize a responsive breakpoint system (mobile-first); components reflow across breakpoints; touch and pointer targets meet the a11y baseline (§7.1).

### §8.2 Performance — RSC-compatible (BR8; `CHK-7-063`)
Components are **Server-Component-default-friendly** (`Doc-7A §3.3`): a component is a Server Component unless interactivity requires a Client Component (which holds only ephemeral state — `Doc-7A R12`). The kit supports streamed RSC reads via suspense fallbacks (§6 loading primitive); image/font optimization is realized at the kit/app boundary. The performance **budget/test** is Doc-8's.

---

## §9 — Conformance (Applicable Appendix A Subset) & Carried Items

### §9.1 Applicable `CHK-7-xxx` subset (BR11)
Doc-7B runs the **applicable** subset and marks the rest **N/A with reason**:

| CHK | Status (Doc-7B) | Reason |
|---|---|---|
| `CHK-7-005` | **APPLIES** | Doc-7B is the *definer* of the shared embedded components (§5) |
| `CHK-7-020/021` | **APPLIES** | Content≠Presentation (Pass-1 §4) |
| `CHK-7-040/041/042` | **APPLIES** | non-disclosure presentation primitives (§6) + embedded non-disclosure (§5.2) |
| `CHK-7-050/051` | **APPLIES** | AI panel presentation + §8 non-disclosure (§5) |
| `CHK-7-060/061/062/063` | **APPLIES** | baseline (§7–§8) |
| `CHK-7-070/071` | **APPLIES** | out-of-frontend / disposability (Pass-1 §2.3, BR10) |
| `CHK-7-080/081` | **APPLIES** | realize-never-redecide (BR12) |
| `CHK-7-001/002/003/004` | **N/A** | no screen binds a contract here; the error/not-found **primitive's** non-disclosure obligation is instead covered by `CHK-7-041` + `Doc-7A §5.4` (§6.1 seam) |
| `CHK-7-010/011/012` | **N/A** | no active-org / authz surface in the kit |
| `CHK-7-030/031` | **N/A** | no lifecycle screen in the kit |

### §9.2 Carried items
`DR-7-SHELL` (Doc-7B frozen before surfaces) · `DR-7-API` (components render contract data by props; binding is the surface's) · `[ESC-7-DESIGN]` (Doc-7B is the embedded-component definer; unresolved allocation escalates) · `[ESC-7-API]` (a component needing a non-existent contract/field → flag-and-halt, additive Doc-5x patch). Resolved only via named channels.

### §9.3 Coins nothing
Token/component names are presentation vocabulary; no domain/API element is introduced (BR12).

---

## Appendix — Component-Inventory Skeleton *(names = presentation vocabulary; instantiated with the code)*

> Names below are the kit's presentation vocabulary (the legitimate *how* Doc-7 owns). They are **not** domain entities and coin nothing in Doc-2/3/4/5.

- **Primitives (shadcn/ui, vendored):** button · input · select · checkbox · radio · switch · dialog · popover · dropdown-menu · tabs · tooltip · toast · badge · card · table · skeleton · avatar · separator · sheet (names per the shadcn primitive set; styled via §3 semantic tokens).
- **App components (compositions):** data-table (cursor-paginated; sort/filter = re-query per Pass-1 §4.3) · form-field (renders `field_errors` per §6) · status-chip (state→variant, §3.3) · **currency-display** (§7.3) · pagination-control (cursor; no offset/page-number — `Doc-7A §5.5`) · file-link (renders `file_ref`, no blob — BR10) · empty-state · error-state · not-found (§6).
- **Shared embedded components (§5):** trust-badge · billing-indicator · ai-advisory-panel · conversation-thread (presentation; mounted by Doc-7C shell slot). *(notification-center = Doc-7C, not here.)*

Exact props, variants, and token bindings are realized with the implementation; Doc-7B fixes the **inventory + conventions**, not the code.

---

## Pass-2 self-check (pre-review)

- **Single-owner conformance:** §5 catalog matches the frozen `Doc-7A` allocation table (notification center excluded — Doc-7C). `CHK-7-005` applies.
- **Non-disclosure encoded once:** §6 error/not-found primitives realize `Doc-7A §5.4/§8.2`; embedded components §5.2 non-disclosure-bound.
- **Coins nothing architectural:** Appendix names are presentation vocabulary; 0 new module/contract/route/field/permission/state/event/POLICY key.
- **Currency/i18n/a11y** bound by pointer (`Doc-2 §0.4`, `Doc-7A §10`).
- **Open for review:** confirm the §9.1 applicability table matches BR11 exactly (no check mis-classified); confirm the Appendix shadcn primitive list coins nothing (presentation vocabulary only).

*End of Content Pass-2 (§5–§9 + Appendix) — DRAFT. Realizes `Doc-7B_Structure_v1.0_FROZEN` §5–§9 + Appendix. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7B FROZEN.*
