# Buyer Frontend Freeze Report — v1.0 (F1-6)

**Owner:** Team-2 (Buyer) · **Date:** 2026-07-02 · **Phase:** F1 — Buyer UX Refinement & Frontend Freeze
**Scope:** all buyer surfaces under `app/(app)/(buyer)/` (21 routes + `_components/`), plus the shared shell
(`app/(app)/_components/shell/`) and kit (`@/frontend`) where buyer pages depend on them.
**Method:** 3 independent static-audit lenses (UX/a11y consistency · forms standardization · component
reuse) + a mobile axe sweep @ 390/768/1280 across 20 routes × 3 viewports (WCAG 2a/2aa/21a/21aa +
best-practice). Presentation-only — no backend/contract/governance change reviewed here.

> **Freeze verdict: NOT YET FROZEN.** Per §13 the gate is BLOCKER = 0 · MAJOR = 0 · MINOR = 0.
> Result: **BLOCKER 0 · MAJOR 6 · MINOR 5 · (NIT/OBS several)**. The surface is *architecturally* clean
> (no governance/contract/boundary issue; no cross-surface leak); every gating item is a contained,
> additive presentation fix. Two of the six MAJORs are **cross-team / shared-foundation** decisions
> (container ownership; kit `FormField`) and must not be resolved unilaterally by Team-2.

---

## 1. Gating findings (block freeze)

| ID | Sev | Dimension | Scope | Finding | Fix |
|---|---|---|---|---|---|
| FZ-01 | MAJOR | Layout rhythm | **SHARED shell (all teams)** | Shell `<main>` owns the container (`app-shell.tsx:68-70`, explicit), yet every non-dashboard buyer page **re-wraps** in `mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6` → doubled padding + redundant max-w. Dashboard (bare `<section>`) is the correct pattern. Almost certainly affects Team-1/Team-3 surfaces too. | Pages drop the inner container; shell remains the sole owner. **Cross-team coordinated sweep** (or owner-authorized buyer-first). |
| FZ-02 | MAJOR | A11y (headings) | Buyer | In-view `data===null` not-found branches render kit `EmptyState` (title = `<p>`, not a heading) → **no page `<h1>`** → axe `page-has-heading-one` fails all viewports on: rfq detail, quotation detail, engagement detail + po/payments/trade-invoice/challan/wcc, crm detail. (Route-level `not-found.tsx` already has an sr-only `<h1>`; the in-view branch does not.) | Add `<h1 className="sr-only">…</h1>` to each buyer in-view `NotFoundState`. Buyer-scoped. |
| FZ-03 | MAJOR | Header consistency | Buyer | 3 pages hand-roll `<h1 font-semibold>` instead of the shell `PageHeader` (`font-bold`): `dashboard-view.tsx:126/166`, `rfq-create-view.tsx:104`, `award-view.tsx:53`. | Route through `PageHeader`, or unify the weight if the wizard/award hero is intentionally distinct. |
| FZ-04 | MAJOR | Forms | Buyer | Raw `<input type="radio">` hand-rolled 3 divergent ways (`form-controls.tsx` has `CheckboxRow` but no radio; `award-view.tsx:94-101` `mt-1`; `rfq-sections.tsx:388-395` `size-4`, no margin, neither handles `disabled`). Flagged independently by the forms **and** reuse audits. | Add a shared `RadioRow`/`RadioGroup` to `form-controls.tsx` (mirror `CheckboxRow`); repoint both call sites. |
| FZ-05 | MAJOR | Reuse | Buyer | The same structural info-callout (`flex items-start gap-2 rounded-md border bg-secondary p-3 text-sm` + lucide icon + `<p>`) is re-authored inline in ~10 views (approvals, engagement detail, po, challan, wcc, payments, trade-invoice, quotation detail, close-lost, award). | Extract one buyer Tier-2 `Callout`/`InfoNote` (props: `icon`, `tone`, children); repoint all sites. |
| FZ-06 | MAJOR | Forms | Buyer | Submit-required RFQ fields are marked inconsistently: `estimated_value`/`delivery district` conveyed only in prose, `routing_mode` **not flagged at all**, while category/request-type get an asterisk (`rfq-sections.tsx:193/229/261 vs :72/82`). | Pick one required-at-submit convention (asterisk + `aria-required` via `FormField required`) and apply to all three. |

## 2. Non-gating-but-fix-before-freeze (MINOR)

| ID | Sev | Scope | Finding | Fix |
|---|---|---|---|---|
| FZ-07 | MINOR | Buyer | Dashboard skeleton (`dashboard/loading.tsx:8`, wraps in container) ≠ dashboard-view (bare) → layout shift on load. | Falls out of FZ-01 resolution. |
| FZ-08 | MINOR | Buyer | Award required radio group `<legend>` carries no required indicator, unlike the checkbox-group sibling. | Mirror the checkbox-group required pattern on the award fieldset. |
| FZ-09 | MINOR | **KIT `FormField` (all teams)** | The shared error `<p>` lacks `role="alert"`/`aria-live` (`src/frontend/components/form-field.tsx:96-98`). Fixing once covers every form in every surface. | Escalate to kit owner: add `role="alert"`. |
| FZ-10 | MINOR | Buyer | Upload drop zone (`upload-area.tsx:16-23`) is a `<div>` with no keyboard entry point / control labelling (status is correctly non-color-only). Presentation-parked (no upload this milestone). | When wired, make it a labelled `<label>`+file-input/button; for now add `aria-disabled` + note. |
| FZ-11 | MINOR | Buyer | Amber "warning callout" variant duplicated (`award-view.tsx:175`, `close-lost-view.tsx:129`). | Fold into FZ-05 `Callout` as `tone="warning"`. |

## 3. NIT / OBS (non-blocking)

- **OBS** — Dashboard title "Procurement" vs `metadata.title` "Dashboard" (`dashboard-view.tsx:127` / `dashboard/page.tsx:17`) — likely intentional per §9.1; confirm.
- **NIT** — Hand-rolled fieldset groups use ad-hoc spacing vs `FormField` `space-y-1.5`; consider a `FieldsetGroup` wrapper.
- **NIT** — `close-lost` detail textarea has no explicit `rows` (defaults to 4) while RFQ textareas set 3/6.
- **OBS** — Kit ships a `NotFound` (BR9) component unused by the 7 buyer `not-found.tsx` (they hand-compose EmptyState + sr-only h1 + breadcrumbs). Consistent across all 7; deliberate. No action.
- **OBS (promotion candidates → registry, do NOT fork)** — `DataListTable` → kit `data-table`; `Textarea`/`Select`/`CheckboxRow`(+new `RadioRow`) → kit form primitives; `DescriptionList` (buyer + vendor have parallel copies) → shared; `ActivityTimeline` → kit `timeline`; new `Callout` → kit. All cross-surface; owner + kit-owner decision.

## 4. Clean dimensions (freeze-ready as-is)

Breadcrumbs (consistent, leaf never linked, non-disclosing) · loading coverage (22/22 routes, kit `Skeleton`,
shapes match) · empty states (kit `EmptyState`, copy never implies exclusion — Inv #11) · error states ·
button hierarchy (back=secondary, primary action=default, destructive=destructive, reject=outline) ·
status chips (all via `state-display.ts` + kit `StatusChip`, no re-coined labels) · **money always via
`format.tsx`/`CurrencyDisplay`; dates via `format.tsx`; no re-implementation** · single `<table>`
(`DataListTable`), single `DescriptionList`, single `ActivityTimeline`, single `EngagementDocumentFileCard` ·
keyboard/ARIA (`aria-current="page"`/`"step"` correct — never `"true"`; decorative icons `aria-hidden`;
skip-link + focusable `<main>`; focusable horizontal-scroll tables) · **no cross-surface component leak**
(zero vendor-tree imports) · non-disclosure holds on every surface (blacklist/deferral invisible).

## 5. Mobile QA (F1-4) result

axe @ 390/768/1280 across 20 routes: **the only real own-content finding is FZ-02** (not-found `<h1>`).
Single-viewport `page-has-heading-one` hits on populated dashboard/versions/award are a dev-server
hydration/compile race (those pages carry a PageHeader `<h1>` when populated) — not defects. The shared-shell
mobile menu-trigger `button-name` (Radix) is a known, filtered non-own-content false positive.

## 6. Scope split for remediation

- **Team-2 can fix now (buyer-scoped, low-risk, clearly-correct):** FZ-02, FZ-03, FZ-04, FZ-05, FZ-06,
  FZ-08, FZ-10, FZ-11 + the NITs. Each under the normal one-change → tsc/eslint/prettier + axe → 2-review →
  §13 discipline.
- **Cross-team / shared-foundation — must NOT be resolved unilaterally by Team-2 (escalate to owner /
  kit-owner / cross-team):** **FZ-01** (shell container ownership — program-wide; buyer, public, vendor,
  admin all likely double-wrap) and **FZ-09** (kit `FormField` `role="alert"` — affects every surface).

## 7. Screens ready for backend wiring

All P-BUY-01…27 buyer pages are presentation-complete and contract-grounded (projection discipline verified
per page in `team-2.md`). They are **wiring-ready** once (a) the gating polish above lands and (b) the three
owner-gated pages resolve: **P-BUY-03/04** (route topology) and **P-BUY-05** (favorites scope + display-
projection gap). No page carries an unresolved contract/governance blocker.
