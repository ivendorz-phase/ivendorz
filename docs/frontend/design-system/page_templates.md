# iVendorz — Page Templates

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — Page Templates (non-authoritative companion to the Doc-7 program)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor
**Revision:** v0.3 — adopt `SC` spine: per-template "Inherited From" banner (SC §2) + deltas-only; inherited boilerplate (a11y/state/AI/responsive/currency/pagination) replaced by `GI` refs; toolbar/skeleton/mobile cited as `TB/SK/MB` presets (SC §3); page-specific hero/marketing/pricing moved to `LP`/page specs; ESC explanations replaced by bare `ER` handles; companion refs via `SC §6` codes. ~24% smaller.
**Companions:** [`shared_conventions.md`](../components/shared_conventions.md) (`SC` — spine) · `DP` · `IA` · `UX` · `MX` · `PI` · `SS` · `LP` · [`esc_registry.md`](../../../esc_registry.md) (`ER`) · [`glossary.md`](../../reference/glossary.md) (`GL`). Cross-ref codes: `SC §6`.

---

## 0. Precedence & Authority (read first)

A **non-authoritative companion**. It defines the **11 canonical, reusable page templates** — the
layouts every one of the 144 pages (`PI`) instantiates. It **coins no architecture, route, contract,
state, transition, permission, event, token, or component**. Templates **compose** the shell (`IA §3`),
the design tokens (`DP`), the kit (Doc-7B), and the patterns (`UX`) **by reference** — re-authoring none
of them.

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                        ▲ this doc conforms upward
```

**On any conflict, the frozen corpus wins and this document is corrected** (CLAUDE.md §7, §11). Doc-7C
owns the shell/route topology/server-resolved org/data layer/notification center; Doc-7B owns the kit +
the four state primitives; Doc-7A owns realization rules; Doc-7D…7H own the surfaces — all referenced,
never re-authored. Gaps are bound by reference to `ER` handles, **never invented**.

> **Conforms upward, coins nothing.** A template is a *layout contract* — named regions + responsive
> behavior + which patterns/components are allowed — not a screen and not a page. Screens are `SS`.

> **Scope:** the **11 templates** the `Template` column of `PI §9` / `DP §6` resolves to. **We do NOT
> design individual pages here** — page-specific content (hero, marketing copy, pricing detail) lives in
> `LP` / the per-page specs. A specification, not code.

### 0.1 Template ID set (canonical)

The 11 template IDs are this document's handles; each maps 1:1 onto a `Template` value used in `PI` /
`DP §6`.

| Template ID | `PI` / `DP §6` name |
|---|---|
| **T-LANDING** | Landing |
| **T-LISTING** | Listing |
| **T-DETAILS** | Details |
| **T-DASHBOARD** | Dashboard |
| **T-WIZARD** | Wizard |
| **T-SETTINGS** | Settings |
| **T-MANAGEMENT** | Management |
| **T-ANALYTICS** | Analytics |
| **T-AUTH** | Authentication / Auth |
| **T-STATIC** | Static |
| **T-STATE** | State |

### 0.2 Inheritance model (the SC spine)

Every template inherits **all of `GI-01…GI-12`** (`SC §1`) and opens with the **`SC §2` "Inherited
From" banner**; each section then documents **only deltas**. **Omission means "as inherited," not
"missing."** This replaces the per-template re-statement of shared rails:

- **Shell / org / data / currency / files / a11y / responsive / state primitives / pagination / sort=
  presentation / AI advisory / non-disclosure** — all are `GI` (see `SC §1`). Templates cite a specific
  `GI-0n` only when they narrow it.
- **Toolbar / skeleton / mobile behavior** are cited as **`TB-*` / `SK-*` / `MB-*` presets** (`SC §3`),
  not re-described inline.
- **Component tier** legend = `SC §7` (Doc-7B-owned). **Planning vocab** = `SC §8`. **Analytics
  grammar** = `SC §4`. **`Future:` vocab** = `SC §5`. **ESC handles** = `ER` (bare handle, no
  re-explanation).
- **Test ownership:** acceptance criteria, a11y/perf conformance, and QA are **Doc-8's** — each template
  carries a pointer ("Test → Doc-8"), never the criteria.

What remains per template below is the **region contract**: purpose · layout regions (+wireframe) ·
responsive deltas · allowed components · prohibited components · a short local governance summary.

---

## 1. Template anatomy & the region lexicon

Every template is composed from a fixed lexicon of **named regions** (`IA §3.3` + layout tokens
`DP §2.9`). Templates differ by *which* regions they include and *how those regions behave
responsively* — not by inventing regions. (Layout tokens, the 12/8/24-col grid, breakpoints, and
density are inherited via `GI-07` / `DP §2.8–§2.10, §3.3` — not restated per template.)

| Region | Token / source | Present in |
|---|---|---|
| **Topbar** | `--iv-topbar-height`; `IA §3.3 / §4.2` (org-switcher · Quick Create · ⌘K · search · notifications · user) | All app/admin templates (shell-owned, `GI-01`) |
| **Sidebar** | `--iv-sidebar-width` / `--iv-sidebar-collapsed`; `IA §4.3` | App/admin templates (shell-owned, `GI-01`) |
| **Page-header** | `--iv-topbar-height`; `DP §5.3` (title · ref-mono · status-chip · actions) | Listing, Details, Dashboard, Wizard, Settings, Management, Analytics |
| **Toolbar** | sub-bar under page-header — preset `TB-*` (`SC §3`) | Listing, Management |
| **Content** | `--iv-content-max` (1440) capped `--iv-page-max` (1600) | All |
| **Right-rail** | optional context pane; collapses first | Details, Dashboard, Analytics, some Listing |
| **Stepper-rail** | step progress (`stepper`, `DP §5`) | Wizard |
| **Settings-nav** | secondary nav (`IA §4.4`) | Settings, Management |
| **Save-bar** | sticky action bar (save/cancel) | Settings, Wizard |
| **Footer** | app: minimal (legal/version, `IA §4.6`) · public: full marketing | Landing/Static (full) · app/admin (minimal) |
| **Marketing-nav** | public top nav + Industrial Category Explorer (`IA §5.3`) | Landing, Static, public Listing/Details |

ASCII wireframes below use this lexicon. They are **schematic** (region placement + responsive intent),
not pixel specs.

---

## 2. `T-LANDING` — Marketing / Landing

```text
Inherits: GI · TB-NONE · SK-CARD (dynamic strips) · MB-LIST   (public — no shell, GI-01 narrowed)
Deltas:   anonymous public; no app shell (no sidebar/org-switcher/notification center, IA §3.2);
          page-specific hero/CTA/marketing copy → LP (not defined here).
```

**Purpose.** Conversion- and SEO-first marketing surface; **light, broad-audience, trust-building**
(`DP §3.1`) — the anonymous entry to the funnel. Region contract only; the hero/marketing/CTA *content*
is `LP` (`P-PUB-01`). Other public marketing surfaces use **T-STATIC**.

### 2.1 Layout regions
Marketing-nav + Industrial Category Explorer (`IA §5.3`) · hero · alternating content sections · social
proof · CTA band · **full marketing footer** (`IA §4.6`).

```
┌───────────────────────────────────────────────────────────────┐
│ MARKETING-NAV  [logo] [Marketplace][Categories▾][Vendors][Pricing]  [Sign in]│
├───────────────────────────────────────────────────────────────┤
│  HERO   (composition → LP)                                     │
├───────────────────────────────────────────────────────────────┤
│  SECTION  value props / how-it-works / social proof           │
│  CTA BAND                                                      │
├───────────────────────────────────────────────────────────────┤
│  FOOTER (full marketing: categories · company · legal · locale)│
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Responsive deltas
Multi-column hero/section grids collapse to **single column** below `md`; the Industrial Category
Explorer **collapses to an accordion drawer** on mobile (`UX §3.2 / §9`). Hero may bleed full-width with
inner content capped at `--iv-content-max`. Sticky bottom CTA on mobile (`UX §9`). (Else `GI-07` /
`MB-LIST`.)

### 2.3 Allowed components
button · card · `status-chip` · technical line-art illustration (`DP §4.5`) · Industrial Category
Explorer · marketing footer. *(Public category nav renders facets only — `ER ESC-7-API-CATNAV`; no
anonymous ads — `ER ESC-7-API-ADS`.)*

### 2.4 Prohibited components
`data-table` · `ai-advisory-panel` · org-switcher / notification center (no shell) · any authenticated
workspace component · no consumer gimmicks (`DP §1.3`) · **no buyer-private / trust-computed data**
(public has zero concept of buyer-private — Invariant #11).

> **Local governance.** Anonymous, read-only, published-only public projection; no state-machine actions;
> non-disclosure is total (`GI-12`). State pages route to **T-STATE**.

---

## 3. `T-LISTING` — Index / Search / Directory

```text
Inherits: GI · TB-LIST · SK-LIST (or SK-CARD for card grids) · MB-LIST   (+ GI-03 lists, GI-04 sort/filter)
Deltas:   below.
```

**Purpose.** The workhorse for **collections**: filterable, sortable, cursor-paginated lists and search
results — public discovery **and** in-app lists.
**Used by:** `P-SH-01`; `P-PUB-07/08/09/10/12/14/19`; `P-ACC-06/08/10/11/16/19/20`;
`P-BUY-02/03/05/06/09/13/19`; `P-VND-07/09/10/12/15/17/23/27`; the listing legs of Admin queues. (§13.)

### 3.1 Layout regions
Page-header (title · count when contract provides · primary action) · **Toolbar** (`TB-LIST`) · optional
**filter-rail** (desktop left) · **Content** = `data-table` *or* card grid · `pagination-control`
(cursor) footer.

```
┌──────────────────────────────────────────────────────────────┐
│ PAGE-HEADER   Title            [+ Primary action]            │
│ TOOLBAR  (TB-LIST)  [search][filter▾][sort▾][density][chips✕]│
├───────────┬──────────────────────────────────────────────────┤
│ FILTER-   │  CONTENT                                          │
│ RAIL      │  data-table (sticky header, selection) — or —    │
│ (facets,  │  card grid                                        │
│  contract │  [ Load more ]   (cursor — no page numbers)       │
│  counts)  │                                                   │
└───────────┴──────────────────────────────────────────────────┘
```

### 3.2 Responsive deltas
Filter-rail → **filter sheet** below `lg` (`UX §2.2 / §9`). `data-table` → h-scroll at `--iv-table-min`
*or* stacked cards below `sm` (`DP §3.2`). Card grids use `repeat(auto-fill, minmax(--iv-card-min,1fr))`.
(Else `GI-07` / `MB-LIST` — incl. FAB for the single primary create; swipe row-actions need a visible
non-swipe alternative, `UX §9`.)

### 3.3 Allowed components
`data-table` · card grid · `filter` · `search` · `status-chip` · `trust-badge` (read-only) ·
`currency-display` · `pagination-control` · `empty-state` · `error-state` · bulk-action bar · density
toggle. AI: **optional, collapsed**, right-rail, non-recommending (`GI-11`); **none on public listings**
(`ER ESC-7-AI`). Related/similar facets labeled "Same category", never "Recommended" (`ER
ESC-7-API/related`).

### 3.4 Prohibited components
**Offset / page-number pager** (`GI-03`). **Client-side re-sort/re-rank** of a governed M3 result set
(`GI-04`). **Client-computed facet/total counts** (leak exclusion counts — `GI-12`; `CHK-7-042`). No
"recommended" ordering. On dense tables: **no decorative illustration** (`DP §4.5`).

> **Local governance.** Content hierarchy: active filters/search → result rows/cards (primary signal
> first, `DP §4.1`; vendor cards lead with trust chip + identity, `DP §8`) → load-more. Empty ≡ genuine
> absence; sort/filter re-queries (`GI-04/05/12`). Test → Doc-8.

---

## 4. `T-DETAILS` — Entity Detail

```text
Inherits: GI · TB-DETAIL · SK-DETAIL · MB-DETAIL   (+ GI-08 currency, GI-09 files, GI-10 state machine)
Deltas:   below.
```

**Purpose.** One reusable skeleton for **every entity detail** (`UX §6.1`): identity + status + tabbed
facets + metadata + timeline + files.
**Used by:** `P-PUB-11/13/15/16/17/20`; `P-ACC-17/21`; `P-BUY-04/08/10/11/14/16/18/20/21/22/23/24/25/27`;
`P-VND-06/14/16/19/20/22/24/25/26`; `P-ADM-03/06/11/13/17/21/29`. (§13.)

### 4.1 Layout regions
Breadcrumb · **Hero** (identity · primary signal: `status-chip` + `score-ring`/`trust-badge` · key meta
+ `TB-DETAIL` actions) · **Tabs** (Overview / facets) · **Content** (active tab) · **Right-rail**
(metadata, relations by ID, files, audit summary). Timeline lives in a tab or the rail.

```
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumb: Section / List / RFQ-2026-000123                 │
│ HERO  [identity]  [status-chip][trust ring]   [Actions ▾]    │
│ TABS  Overview | Quotations | Activity | Files | Audit       │
├──────────────────────────────────────────┬───────────────────┤
│ CONTENT (active tab)                      │ RIGHT-RAIL        │
│  primary facts · sections                 │  metadata         │
│  (currency-display, status-chip, …)       │  relations (by id)│
│                                           │  files (file-link)│
│                                           │  audit (read-only)│
└──────────────────────────────────────────┴───────────────────┘
```

### 4.2 Responsive deltas
Right-rail drops **below Content** under `xl`, then into a **bottom sheet / "Details" tab** on mobile.
Tabs → horizontally scrollable strip or a select on the smallest viewport; Hero actions → overflow.
(Else `MB-DETAIL`.) **Right-rail is the primary host** of metadata/relations/files/audit.

### 4.3 Allowed components
`status-chip` · `trust-badge` / `score-ring` (read-only) · `capacity-bar` · `currency-display` · tabs ·
`timeline` · `file-link` · `conversation-thread` (e.g. clarifications, `P-BUY-16`) · `ai-advisory-panel`
(advisory tab/rail — Explain / Summarize / Draft only, `GI-11`; `ER ESC-7-AI`) · `data-table` (nested
relation lists, cursor). Files via `file_ref`/Storage (`GI-09`; upload grant `ER ESC-7-API/upload`).

### 4.4 Prohibited components
**Fabricated state/transition** in Actions (`GI-10`, Doc-4M only). **Trust/score mutation** (M5
read-only). **Competitor values** in any quotation detail (vendor isolation — bands not values,
`UX §2.7`). **Overwrite** of versioned docs — show versions, never replace (Invariant #8). Offset pager
in nested lists (`GI-03`).

> **Local governance.** Whole-entity miss → **not-found ≡ absence** (`GI-05`; forbidden collapses to
> not-found where no right-to-know, Doc-7A §8.2; `CHK-7-041`). Hero actions are state-machine-permitted
> only (`GI-10`; mobile primary = sticky CTA). Test → Doc-8.

---

## 5. `T-DASHBOARD` — At-a-Glance Workspace Home

```text
Inherits: GI · TB-NONE (page-header only) · SK-DASHBOARD · MB-DASHBOARD
Deltas:   below.
```

**Purpose.** Role home: KPI cards + activity + work queues on a 12/24-col grid (`DP §6` / `UX §6.2`) —
orientation and triage, not deep work.
**Used by:** `P-ACC-01/18/22`; `P-BUY-01`; `P-VND-01/28`; `P-ADM-01`. (§13.)

### 5.1 Layout regions
Page-header (greeting/title · range/scope control · Quick Create) · **KPI band** (stat-cards) ·
**Content grid** (activity feed · queue widgets · charts) · optional **right-rail** (tasks / shortcuts /
notification digest — the full center stays the Doc-7C shell slot, `GI-01`).

```
┌──────────────────────────────────────────────────────────────┐
│ PAGE-HEADER  Dashboard            [range ▾] [+ Create ▾]     │
├──────────────────────────────────────────────────────────────┤
│ KPI BAND  [stat][trend][progress][health]  (auto-fill grid)  │
├──────────────────────────────────────────┬───────────────────┤
│ CONTENT GRID                              │ RIGHT-RAIL        │
│  [activity feed]  [queue: needs action]   │  shortcuts / tasks│
│  [chart / sparkline]  [recent items]      │  (optional)       │
└──────────────────────────────────────────┴───────────────────┘
```

### 5.2 Responsive deltas
KPI band `repeat(auto-fill, minmax(--iv-card-min,1fr))` → 2-up → 1-up. Content grid 12→8→1 col; 24-col
only at `xl+`. Right-rail stacks under `xl`. (Else `MB-DASHBOARD`; FAB → Quick Create.)

### 5.3 Allowed components
stat-card (Metric/Trend/Chart/Status/Progress/Health — `UX §6.2`) · `score-ring` / `trust-badge`
(read-only) · `capacity-bar` · `data-table` (compact queue lists, cursor) · `currency-display` ·
`billing-indicator` · `ai-advisory-panel` (collapsed, non-recommending — `GI-11`; `ER ESC-7-AI`) ·
`empty-state`. Per-widget skeletons stream as independent Suspense boundaries (`GI-05` / `UX §4.1`).

### 5.4 Prohibited components
**Client-computed authoritative metrics** (metrics come from contract reads — `UX §6.2`).
**Excluded/blacklist counts** in any KPI (`GI-12`; vendor win-rate denominator = *received invitations*,
never all-matchable RFQs — `PI §7` note / Invariant #11). Offset pager (`GI-03`). No "recommended
vendor/winner" widget. No destructive primary action.

> **Local governance.** Hierarchy: headline KPIs → "needs your action" queues → activity/trends →
> shortcuts. A widget read failure shows a scoped `error-state` without taking down the dashboard
> (`GI-05`). Quick Create is role-scoped + entitlement-gated (`IA §4.9`). Test → Doc-8.

---

## 6. `T-WIZARD` — Multi-Step Authoring

```text
Inherits: GI · TB-NONE (page-header + stepper) · SK-WIZARD · MB-WIZARD   (+ GI-10 state machine)
Deltas:   below.
```

**Purpose.** Decompose a complex, **state-machine-gated** authoring task into resumable steps
(`UX §5.1`). Canonical: RFQ creation.
**Used by:** `P-AUTH-03`; `P-BUY-07/17`; `P-VND-08/18`; `P-ADM-15`. (§13.)

### 6.1 Layout regions
Page-header (task title · draft ref · exit) · **Stepper-rail** · **Content** (current-step form, 8-col
form grid) · **Save-bar** (Back · Save draft · Next/Submit).

```
┌──────────────────────────────────────────────────────────────┐
│ PAGE-HEADER  Create RFQ · draft RFQ-2026-000123      [Exit]  │
├───────────────┬──────────────────────────────────────────────┤
│ STEPPER-RAIL  │  CONTENT (8-col form)                        │
│  1 Details ✓  │   form-field … form-field                    │
│  2 Specs  ●   │   (inline validation on blur)                │
│  3 Routing    │                                              │
│  4 Review     │                                              │
├───────────────┴──────────────────────────────────────────────┤
│ SAVE-BAR (sticky)   [Back]            [Save draft] [Next →]  │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Responsive deltas
Stepper-rail → **horizontal stepper** above Content below `lg`, then a compact "Step n of N" + progress
bar on mobile. Save-bar **sticky at bottom on all sizes**; repositions above the keyboard on mobile.
(Else `MB-WIZARD`.)

### 6.3 Allowed components
`stepper` · `form-field` · input/select/checkbox/radio/switch · `currency-display` · `file-link` (+
upload, `GI-09`; grant `ER ESC-7-API/upload`) · review summary cards · `ai-advisory-panel` (draft/
pre-fill, editable, **never committed by AI** — `GI-11`; `ER ESC-7-AI`) · `status-chip` (draft).

### 6.4 Prohibited components
A **state-mutating step outside a wired command** (draft persists via `create_*`/`update_*`; final step
`submit_*` — `UX §5.1`). **Offering a non-permitted next state** (`GI-10`, Doc-4M). **AI auto-submit/
auto-select** — AI may draft, the **user confirms and the module commits** (Invariant #12; especially the
Award wizard). Local-only "draft" that bypasses the contract.

> **Local governance.** Validation = inline `field_errors`, no protected enrichment (`GI-05`);
> `CONFLICT`/`STATE` (409) → re-derive offerable transitions + idempotent retry (`GI-10` / `UX §5.3`);
> async final steps → `ASYNC_PENDING` → poll status, never a blocking spinner (`GI-09`; import job status
> via create-then-poll, `UX §5.2`). Forward action is state-machine-gated. Test → Doc-8.

---

## 7. `T-SETTINGS` — Configuration & Editors

```text
Inherits: GI · TB-NONE (settings-nav) · SK-DETAIL (form sections) · MB-DETAIL
Deltas:   below.
```

**Purpose.** Single-record configuration/editing on the narrow **8-col** form grid with a secondary
settings-nav and a save-bar (`DP §6 / §2.10`).
**Used by:** `P-ACC-02/03/04/05/07/09/12/13/14/15/16`; `P-VND-02/03/04/11/13`; `P-ADM-09/20/23`. (§13.)

### 7.1 Layout regions
Page-header (section title) · **Settings-nav** (left secondary nav — `IA §4.4`) · **Content** (grouped
`form-field` sections, 8-col) · **Save-bar** (sticky, dirty-state aware).

```
┌──────────────────────────────────────────────────────────────┐
│ PAGE-HEADER  Settings · Organization                         │
├───────────────┬──────────────────────────────────────────────┤
│ SETTINGS-NAV  │  CONTENT (8-col form)                        │
│ Profile       │   ── Section: Identity ──                    │
│ Security      │     form-field  form-field                   │
│ Organization● │   ── Section: Contact ──                     │
│ Members       │     form-field                               │
├───────────────┴──────────────────────────────────────────────┤
│ SAVE-BAR (sticky, appears when dirty)   [Cancel] [Save]      │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Responsive deltas
Settings-nav → a **top tab strip / select** below `md`; form sections single-column throughout (8-col
already narrow). Save-bar sticky at bottom; above the keyboard on mobile. (Else `MB-DETAIL`.)

### 7.3 Allowed components
`form-field` · input/select/checkbox/radio/switch · `status-chip` · `billing-indicator` (billing
settings) · `data-table` (sub-lists like role permissions / members — cursor) · `file-link` ·
readonly/disabled field states (`DP §5.2`). AI: **generally none**; if present, **explains** a setting
only — never auto-applies/recommends a value (`GI-11`; `ER ESC-7-AI`).

### 7.4 Prohibited components
**Plan-name string checks** for gating — read **entitlements** (boolean/numeric/enum) via
`billing-indicator`/contract (Invariant #10). **Protected enrichment** in field errors (`GI-05`).
**Hard-delete** affordances — soft-delete only (Invariant #8; e.g. `P-ACC-05` org lifecycle). Hiding
**required/safety/compliance** fields behind progressive disclosure (`UX §5.4`). Offset pager in
sub-lists (`GI-03`).

> **Local governance.** Hierarchy: section nav → grouped fields (most-common first) → helper/validation
> → save/cancel. Save failures surface `reference_id`; `CONFLICT` → refresh + idempotent retry (`GI-05`).
> Destructive actions (transfer ownership, soft-delete org) require explicit confirm (`UX §2`); delegation
> reinstate is `ER ESC-IDN-DELEG-EXPIRY` (`P-ACC-12`). Test → Doc-8.

---

## 8. `T-MANAGEMENT` — Operational Queues & Bulk Action

```text
Inherits: GI · TB-MANAGEMENT · SK-LIST · MB-LIST   (Admin: no active-org — GI-01 narrowed, IA §2.3)
Deltas:   below; Admin desktop-first (mobile mostly Future, PI §13).
```

**Purpose.** Admin/operational control surfaces: queues, moderation/approval/verification, bulk actions,
rule/plan management — **Admin acts on targets by ID, no active-org** (`IA §2.3 / §6.5`).
**Used by:** `P-BUY-12`; `P-VND-05/21`; `P-ADM-02/04/07/08/10/12/16/19/22/24/25/26/27/28`. (§13.)

### 8.1 Layout regions
Page-header (queue title · scope/filter · queue counts where contract provides) · **Toolbar**
(`TB-MANAGEMENT`, incl. bulk-action bar) · **Content** = `data-table` (selection-first) · optional
**right-rail** (selected-item preview / decision panel) · cursor `pagination-control`.

```
┌──────────────────────────────────────────────────────────────┐
│ PAGE-HEADER  Moderation queue            [scope ▾]          │
│ TOOLBAR (TB-MANAGEMENT)   ▸ 3 selected: [Approve]…           │
├──────────────────────────────────────────┬───────────────────┤
│ CONTENT  data-table (☑ selection)         │ RIGHT-RAIL        │
│  ☑ row …  status-chip … assignee …        │  selected item    │
│  ☑ row …                                  │  decision panel   │
│  [ Load more ]  (cursor)                   │  (act by ID)      │
└──────────────────────────────────────────┴───────────────────┘
```

### 8.2 Responsive deltas
**Desktop-first** (`PI §13`). Right-rail → drawer/bottom sheet under `xl`; table → h-scroll (rarely
stacked, given density); bulk-action bar → sticky bottom bar on narrow widths. Most Admin queues are
`Future` on mobile (where enabled: swipe actions need a visible alternative, `UX §9`). (Else `MB-LIST`.)

### 8.3 Allowed components
`data-table` (selection + bulk + column pin/resize) · bulk-action bar · `status-chip` · `filter` ·
`search` · `currency-display` · decision panel (right-rail — selected target preview + wired action set,
all by ID) · `empty-state` · `error-state`. AI: **advisory only** — summarize a case; never decides/
ranks/auto-actions (`GI-11`; `ER ESC-7-AI`).

### 8.4 Prohibited components
**Writing Trust/Performance/Tier scores** or making matching/award decisions from any management page —
Admin **invokes** wired commands; the **owning module owns the effect/score** (R5; firewall — `PI §8`
note). **Bypassing an owning module's domain** (Red-Flag). Surfacing **buyer-private/exclusion** data in
triage (`GI-12`; `P-ADM-27/28`). **Offset pager** (`GI-03`). No "AI auto-decide" on a moderation/
verification case.

> **Local governance.** Actions are wired-command + permission-gated + state-machine-permitted (`GI-10`;
> e.g. `moderate_rfq` pass→matching / reject→draft). Empty ≡ genuinely empty queue (`GI-12`). Async ops
> (e.g. import) surface as status via contracts, never a blocking spinner (`UX §5.2`). Test → Doc-8.

---

## 9. `T-ANALYTICS` — Comparison & KPI Analytics

```text
Inherits: GI · TB-NONE (page-header + range/export) · SK-DASHBOARD · MB-DASHBOARD   (+ GI-04 no re-rank)
Deltas:   below; comparison is desktop-primary (P-BUY-15 is D only, PI §13).
```

**Purpose.** Decision-support analytics: dense KPI/chart surfaces and the **governed RFQ comparison**
(`UX §2.7 / §6.2`). Forward-looking for broader analytics waves.
**Used by:** `P-BUY-15` (the load-bearing case today; later analytics pages arrive in later waves,
`PI §9`). (§13.)

### 9.1 Layout regions
Page-header (title · range/scope · export) · **KPI band** (optional) · **Content** = comparison matrix
(24-col / `data-table`) **or** chart grid · optional **right-rail** (legend / filters / advisory).
Comparison uses the dense 24-col grid (`DP §2.10`).

```
┌──────────────────────────────────────────────────────────────┐
│ PAGE-HEADER  Comparison · RFQ-2026-000123     [range][export]│
├──────────────────────────────────────────────────────────────┤
│ KPI BAND (optional)  [stat][trend]                           │
├──────────────────────────────────────────┬───────────────────┤
│ CONTENT  comparison matrix (24-col)       │ RIGHT-RAIL        │
│  criteria × quotations (contract order)   │  legend / filters │
│  bands, not competitor values             │  advisory (R6)    │
└──────────────────────────────────────────┴───────────────────┘
```

### 9.2 Responsive deltas
**Desktop-primary.** Matrix uses h-scroll / column-pin below `xl`; chart grid 12→1 col; right-rail
stacks under `xl`. Below `lg` the matrix degrades to stacked per-quotation cards (criteria as rows).
(Else `MB-DASHBOARD`.)

### 9.3 Allowed components
comparison `data-table` (24-col, column-pin/resize, density) · stat-card · charts/sparklines (data-viz
tokens, `DP §2.12`) · `currency-display` · `status-chip` · `ai-advisory-panel` (decision *support* —
explain criteria / summarize differences only, `GI-11`; `ER ESC-7-AI`) · `empty-state`. Export renders
**only exclusion-applied data the user can already read**; large export = create-then-poll (`ER
ESC-7-API/export`).

### 9.4 Prohibited components (template-specific — load-bearing)
**A "recommended winner" / ranked-to-winner / auto-select** anywhere in the comparison — **and the AI
panel must not recommend** (R6; Doc-3 §9.1; Invariant #12). **Competitor quotation values** to a vendor
— show **bands, not competitor values** (`UX §2.7`). **Client re-rank** of the contract-ordered set
(`GI-04`). **Client-computed authoritative metrics / excluded counts** (`GI-12`). **Offset pager**
(`GI-03`). **Award is a separate, deliberate, unranked act** (T-WIZARD / `award_rfq`) — not a button the
analytics view pre-selects.

> **Local governance.** This is the firewall-critical template: the buyer reads; the UI never generates
> the statement, ranks, or pre-selects a winner. Hierarchy: scope/criteria → matrix (contract order) →
> supporting charts/KPIs → legend. No award action here. Test → Doc-8.

---

## 10. `T-AUTH` — Authentication Entry

```text
Inherits: GI · TB-NONE · SK-DETAIL (centered card) · MB-DETAIL   (no shell, GI-01 narrowed; no session)
Deltas:   below.
```

**Purpose.** Unauthenticated entry: login/signup/recovery/challenge. **Minimal chrome, centered card** —
the `(auth)` route group, which **cannot hold a session** (Doc-7C §2.1).
**Used by:** `P-AUTH-01/02/04/05/06/07/08`. *(`P-AUTH-03` org setup uses **T-WIZARD**.)* (§13.)

### 10.1 Layout regions
Brand mark · **centered card** (form) · minimal links (alt action · legal) · **no shell** (`IA §3.2`).

```
┌──────────────────────────────────────────────────────────────┐
│                         [ brand mark ]                        │
│                  ┌──────────────────────────┐                │
│                  │  Title                    │                │
│                  │  form-field (email)       │                │
│                  │  form-field (password)    │                │
│                  │  [ Primary action ]       │                │
│                  │  alt action · legal link  │                │
│                  └──────────────────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

### 10.2 Responsive deltas
Card is fixed-max-width (≈ `--iv-form-max`), centered on all sizes; full-bleed background. On mobile the
card grows to comfortable padding; inputs never obscured by the keyboard. (Else `MB-DETAIL`.)

### 10.3 Allowed components
`form-field` · input · button · `status-chip` (e.g. "verification sent") · restrained brand line-art
(`DP §4.5`). Auth provider = **Supabase Auth** (binding by pointer).

### 10.4 Prohibited components
Any app-shell component (sidebar/org-switcher/notification center). `data-table` · `ai-advisory-panel` ·
dashboards. **No protected enrichment** in auth errors — generic, non-enumerating messages (`GI-05`).
Offset pager (`GI-03`).

> **Local governance.** Hierarchy: brand → task title → minimal fields → primary action → secondary path.
> Inline submit state (no full-page spinner); auth errors render generically (no account enumeration,
> `GI-05`). Single primary action, no state-machine actions. Route failure → **T-STATE**. Test → Doc-8.

---

## 11. `T-STATIC` — Marketing / Legal / Content

```text
Inherits: GI · TB-NONE · SK-CARD (dynamic strips) · MB-LIST   (public — no shell, GI-01 narrowed)
Deltas:   below; long-form content/pricing copy → per-page specs, not here.
```

**Purpose.** Long-form, mostly static content: marketing segments, explainers, legal, resources.
Public, light, SEO-relevant, **reading-optimized** (`--iv-reading-max`). Region contract only.
**Used by:** `P-PUB-02/03/04/05/06/18/21/22/23/24`. (§13.)

### 11.1 Layout regions
Marketing-nav · optional content sub-nav (long docs) · **Content** (reading column, `--iv-reading-max`)
· optional aside (table of contents) · **full marketing footer**.

```
┌──────────────────────────────────────────────────────────────┐
│ MARKETING-NAV                                                │
├───────────────┬──────────────────────────────────────────────┤
│ TOC (optional)│  CONTENT (reading column --iv-reading-max)   │
│  · Section 1  │   long-form prose / sections                 │
│  · Section 2  │   (Pricing may embed plan cards: list_plans) │
├───────────────┴──────────────────────────────────────────────┤
│  FOOTER (full marketing)                                     │
└───────────────────────────────────────────────────────────────┘
```

### 11.2 Responsive deltas
TOC aside → collapses above content (or into an in-page menu) below `lg`. Reading column stays at
`--iv-reading-max`; generous mobile padding; footer columns stack. Optional conversion CTA may be a
sticky bottom CTA on mobile (routes to `(auth)`). (Else `MB-LIST`.)

### 11.3 Allowed components
prose/typography · card (e.g. public plan cards reading `list_plans` — `P-PUB-04`) · technical line-art
(`DP §4.5`) · marketing footer · `status-chip` (e.g. "Popular" on a plan). TOC aside only (not the
workspace right-rail).

### 11.4 Prohibited components
Workspace components · `data-table` (dense) · `ai-advisory-panel` · shell chrome. **No purchase/activate
action** on public pricing — it is **marketing of plans** (`activate_plan` is Admin-only; purchase is
in-app `P-ACC-17`). Offset pager (`GI-03`).

> **Local governance.** Hierarchy: page title → section headings → prose → related links/footer.
> Server-rendered/static; a dynamic strip uses a `skeleton`, absent data renders nothing (`GI-05`).
> Anonymous, published-only, zero buyer-private concept (Invariant #11). Route failure → **T-STATE**.
> Test → Doc-8.

---

## 12. `T-STATE` — System State Pages

```text
Inherits: GI · TB-NONE   (+ GI-05 state primitives, GI-12 byte-equivalence — load-bearing)
Deltas:   below.
```

**Purpose.** Full-page system states: not-found, error, maintenance, forbidden. Encodes the
**non-disclosure presentation contract** once (Doc-7B §6 state primitives; Doc-7A §5/§8).
**Used by:** `P-SH-03/04/05/06`. (§13.)

### 12.1 Layout regions
Centered **state primitive** (`not-found` / `error-state`) · message · safe action(s) · minimal brand
mark. Mounts in whichever shell context it's reached from (or bare for hard failures).

```
┌──────────────────────────────────────────────────────────────┐
│                       [ brand mark ]                          │
│                   ┌────────────────────┐                     │
│                   │   icon / line-art  │                     │
│                   │   Headline         │                     │
│                   │   message          │                     │
│                   │  [ Back to known ] │   (+ reference_id   │
│                   └────────────────────┘    on error)        │
└──────────────────────────────────────────────────────────────┘
```

### 12.2 Responsive deltas
Single centered column at all sizes; illustration scales/drops on the smallest viewport. No
shell-dependent regions required. (`MB-*` n/a.)

### 12.3 Allowed components
`not-found` · `error-state` (Doc-7B §6) · button (safe back/retry, idempotent where offered) · minimal
on-brand line-art (`DP §4.5`).

### 12.4 Prohibited components (template-specific — load-bearing)
**Any distinction between "forbidden" and "does not exist"** — `not-found` is **byte-identical to genuine
absence**: no difference in copy/layout/timing/telemetry (Doc-7A §8.2; `CHK-7-041`; `GI-12`). **Protected
enrichment** on the error page — render from `error_class`/`message` only; never surface protected
field/metadata/header facts (`GI-05`). `P-SH-06` (forbidden) **collapses to 404 where no right-to-know**
(`PI §2`). No data-bearing components; no offset pager.

> **Local governance.** This template *is* the error/not-found surface and the home of byte-equivalence.
> Hierarchy: what happened (neutral) → safe next action → (error) `reference_id`. Error branches on
> `error_class`, never HTTP status alone (`GI-05` / `UX §4.3`). Maintenance is a neutral static state. No
> state-machine actions. Test → Doc-8.

---

## 13. Template → Page coverage

Representative mapping (the authoritative per-page `Template` column is `PI §3–§8`; this is the canonical
*layout* each resolves to).

| Template | Representative pages (`PI`) |
|---|---|
| **T-LANDING** | `P-PUB-01` |
| **T-LISTING** | `P-SH-01`; `P-PUB-07/08/09/10/12/14/19`; `P-ACC-06/08/10/11/16/19/20`; `P-BUY-02/03/05/06/09/13/19`; `P-VND-07/09/10/12/15/17/23/27` |
| **T-DETAILS** | `P-PUB-11/13/15/16/17/20`; `P-ACC-17/21`; `P-BUY-04/08/10/11/14/16/18/20/21/22/23/24/25/27`; `P-VND-06/14/16/19/20/22/24/25/26`; `P-ADM-03/06/11/13/17/21/29` |
| **T-DASHBOARD** | `P-ACC-01/18/22`; `P-BUY-01`; `P-VND-01/28`; `P-ADM-01` |
| **T-WIZARD** | `P-AUTH-03`; `P-BUY-07/17`; `P-VND-08/18`; `P-ADM-15` |
| **T-SETTINGS** | `P-ACC-02/03/04/05/07/09/12/13/14/15/16`; `P-VND-02/03/04/11/13`; `P-ADM-09/20/23` |
| **T-MANAGEMENT** | `P-BUY-12`; `P-VND-05/21`; `P-ADM-02/04/07/08/10/12/16/19/22/24/25/26/27/28` |
| **T-ANALYTICS** | `P-BUY-15` (+ later analytics-wave pages) |
| **T-AUTH** | `P-AUTH-01/02/04/05/06/07/08` |
| **T-STATIC** | `P-PUB-02/03/04/05/06/18/21/22/23/24` |
| **T-STATE** | `P-SH-03/04/05/06` |

> The `P-SH-02` notification-center *page* is a Listing realization of the Doc-7C-owned center; the shell
> **slot** itself is not a template a page re-implements (`IA §5.4` / Doc-7B §5).

---

## 14. Governance ledger

This document conforms upward (§0) and coins nothing. Cross-cutting rails are inherited via the **`SC`
spine** (`GI-01…GI-12`, presets `TB/SK/MB`, component tiers `SC §7`) and are **not** re-stated per
template. The template-specific constraints honored above:

| Constraint | Source | Where honored |
|---|---|---|
| Templates realize layouts inside the Doc-7C shell; never re-own it | `GI-01` / Doc-7C §2.2 / `IA §3` | §1; every app/admin template banner |
| Layout tokens / grid / breakpoints / density inherited, not redefined | `GI-07` / `DP §2.8–2.10, §3.3` | §1; every "Responsive deltas" |
| Cursor pagination only; offset/page-number forbidden | `GI-03` / Doc-7C §5.3 | §3.4, §4.4, §5.4, §7.4, §8.4, §9.4, §10.4, §11.4 |
| Sort/filter re-queries; never re-rank governed M3 | `GI-04` / Doc-7A §6 / GR #4 | §3.4, §9.4 |
| Non-disclosure / byte-equivalence (lists, counts, empties, not-found) | `GI-12` / Invariant #11 / `CHK-7-040/041` | §2.4, §3.4, §4-gov, §5.4, §8.4, §9.4, §12.4 |
| State-machine-permitted actions only; invent no transition | `GI-10` / Doc-7A §7 / Doc-4M | §4.4, §6.4, §8.4, §9.4 |
| Errors branch on `error_class`; no protected enrichment; `reference_id` | `GI-05` / Doc-7A §5.3–5.4 | §6-gov, §7-gov, §10.4, §12.4 |
| State primitives (loading/empty/error/not-found) per pattern | `GI-05` / Doc-7B §6 / `UX §4` | every template banner + gov line |
| Comparison read-only, System-gen, **non-recommending**; no winner | R6 / Doc-7F §6 / Doc-3 §9.1 | §9.4, §9-gov, §4.3 |
| AI = `ai-advisory-panel`, non-recommending, suggest-only, future | `GI-11` / Invariant #12 / `Doc-5K` | every "Allowed components" AI line; `ER ESC-7-AI` |
| Notification center is the Doc-7C shell slot, not a page region | `GI-01` / Doc-7C / Doc-7B §5 | §5.1, §13 |
| Embedded components single-owned (trust/billing/AI/conversation) | `SC §7` / Doc-7B §5 | §3.3, §4.3, §5.3, §7.3 |
| Trust/score/tier read-only (M2 reads, M5 owns) | Governance Signals §4 | §3-gov, §4.4, §5.4, §9.4 |
| Admin-decides / owning-module-owns; firewall; no active-org | R5 / Doc-7C §4 | §8.1, §8.4 |
| Post-award records only; no funds movement | R8 / DF-6 | §4 (payment/invoice details), §13 |
| Versioned/immutable; soft-delete; no overwrite/hard-delete | Invariant #8 | §4.4, §6.4, §7.4 |
| Currency `{amount, currency}` per field, default BDT | `GI-08` / Doc-2 §0.4 | every `currency-display` use |
| Mobile-first; sidebar→rail→drawer; bottom-sheet/FAB/sticky-CTA | `GI-07` / `MB-*` (`SC §3`) / `UX §9` | every "Responsive deltas" |
| WCAG-AA baseline; conformance test = Doc-8 | `GI-06` / `DP §11` / Doc-8 | every "Test → Doc-8" |
| Files via `file_ref`/Storage; upload-grant gap | `GI-09` / `ER ESC-7-API/upload` | §4.3, §6.3 |
| No public RFQ board; public has zero buyer-private concept | Doc-3 §5.1 / Invariant #11 | §2.4, §3 (public legs), §11.4 |

### ESC handles (referenced, coined nowhere here)

This document **introduces no new ESC tags** — it references **`ER`** (the single source) by bare
handle; `ER` holds gap + interim + channel. Handles touched here:
`ESC-7-AI` (every AI line) · `ESC-7-API/upload` (T-WIZARD/T-DETAILS files) · `ESC-7-API/export`
(T-ANALYTICS / list-management export) · `ESC-7-API/related` (T-DETAILS/T-LISTING discovery) ·
`ESC-7-API-CATNAV` · `ESC-7-API-ADS` (T-LANDING / public T-LISTING) · `ESC-7-API-PRODDETAIL`
(T-DETAILS, `P-PUB-11`) · `ESC-IDN-DELEG-EXPIRY` (T-SETTINGS, `P-ACC-12`). Industry/Brand/Standard
taxonomies are a recorded non-ESC gap (`ER`; navigation reference only, coined nowhere).

> Each handle resolves only via its named channel (`ER`) — **never locally** (Doc-7C §0.3; CLAUDE.md
> §11). If a template ever needs a region/component/order that conflicts with a frozen doc,
> **Flag-and-Halt** (CLAUDE.md §11) — do not resolve in this companion.

---

*This document is non-authoritative. It defines the 11 reusable page templates the 144 pages
instantiate. It operates under the frozen corpus authority order (CLAUDE.md §7) and the Doc-7 precedence
chain (§0); it introduces no architecture change and coins no route, contract, state, permission, token,
or component. On any conflict, the frozen document wins and this file is patched to match.*
