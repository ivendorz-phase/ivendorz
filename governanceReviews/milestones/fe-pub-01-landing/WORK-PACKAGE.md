# WORK PACKAGE — FE-PUB-01 Landing (✅ Closed — RV-0121, A:PASS ∧ B:PASS, Dev-team self-close per
Amendment v1.3 §13)

- **Lane:** G (anonymous contract surface — the primary conversion entry point)
- **Reviewed-SHA record:** `17f93a8` (scope complete — popular-search terms fixed)
- **Value:** Core Marketplace · **Priority:** P1 · **Size:** S · **Risk:** Low

## Scoping note

`fe-program-wbs.md` tracked FE-PUB-01 as `READY(enh) — owner-named polish item on the pre-loop 🟩
landing`, with no further specifics recorded. The just-closed `FE-PUB-07` (RV-0119) audit
independently surfaced a concrete, evidence-backed, MAJOR-severity gap that lives on this
milestone's own page (P-PUB-01) and was correctly carried forward here rather than fixed ad hoc:
4 of 5 curated "Popular" search-term chips in the landing hero's Command Center
(`app/(public)/_components/landing/command-center.tsx`'s `DEFAULT_POPULAR_SEARCHES`) produce a
dead-end "No results to show" on `/search` when clicked and submitted — a content mismatch
against `discovery/seed.ts`'s actual product catalog, not a route/contract/governance defect
(`command-center.tsx:42-47` vs. `discovery/seed.ts` product names — verified directly: "MS plate"
is the only one of the 5 that matches; "ball valves"/"VFD drives"/"gear pumps"/"industrial PPE"
match nothing in the seed).

A supplementary sweep of the other 3 landing sections (`featured-categories.tsx`,
`supplier-showcase.tsx`, `popular-products.tsx`) found no TODO/FIXME and no other obvious defect —
this milestone's scope is the one concrete, diagnosed gap, not speculative polish.

## In scope (this delta)

- Fix `DEFAULT_POPULAR_SEARCHES` in `command-center.tsx` so all 5 curated terms genuinely resolve
  to a real seed match via `/search`'s existing substring filter (`contains(name/category/
  vendorName, query)`). New set, each independently verified against `discovery/seed.ts`:
  `"gate valve"` (→ "Cast Steel Gate Valve DN100 PN16"), `"MS plate"` (kept — already matched),
  `"VFD drive"` (singular fix — was "VFD drives," plural didn't substring-match the seed's
  singular "VFD Drive"), `"centrifugal pump"` (→ "End-Suction Centrifugal Pump 15HP"), `"safety
  helmet"` (→ "Industrial Safety Helmet (HDPE)"). Preserves the original 5-term, cross-category
  spread (valves / steel / electrical / pumps / safety) — just each term now genuinely matches.

## Out of scope (Review-A enforces)

- Any change to `/search`'s filter logic itself (already reviewed/closed under `FE-PUB-04`/
  `FE-PUB-06`/`FE-PUB-07`) — this is a content-only fix to the curated term list, not the search
  mechanism.
- The other 3 landing sections — audited, no defect found, not touched.
- Real `search_catalog`/`list_vendor_directory` wiring, backend/mutation, AI, kit/token changes.
- Any new landing section (SEC-STATS/PROCESS/TRUST/SUCCESS/PARTNERS/RESOURCES/CTA) — those are a
  later Public milestone (M3) per this page's own file-header comment, not this delta.

## Dependencies

- H: — none (buildable now; content-only change against the existing seed).
- S: — none.

## Lifecycle ownership

Builder = **Team-1** · Maintainer = **Team-1** · Review A → Review B (fresh contexts); on a clean
A:PASS ∧ B:PASS gate the owning Dev team self-closes per `review-process.md` Amendment v1.3 §13.

## Key dates

Created 2026-07-03 · Started 2026-07-03 · Paused — · Resumed — · Closed 2026-07-03

## DoD confirmation (checked at close)

☑ page DoD ☑ responsive D/T/M (390/768/1280, Playwright, Review-B) ☑ WCAG-AA (axe-core 0
violations all 3 viewports) ☑ tsc/eslint/prettier ☑ all 5 terms verified to match a real result
(both lanes, independently) ☑ Review A PASS (RV-0121, 0 findings) ☑ Review B PASS (RV-0121, 2 OBS,
B/M/M=0) ☑ gate approval (A:PASS ∧ B:PASS on `17f93a8` — the clean gate is the approval signal per
Amendment v1.3 §13) ☑ no TODO/dead code ☑ no duplicate components (content-only change, no
component touched) ☑ tracker updated ☑ card closed

## Close record

**✅ Closed 2026-07-03.** Review-A: PASS (0 findings). Review-B: PASS (0 B/M/M, 2 OBS — a
confirming sweep found no other landing section carries the same bug class; the other three all
source from seed-derived constants, not independent string literals). No fix-and-reverify cycle —
both lanes passed on the first submission. Dev-team self-close per Amendment v1.3 §13. Full
record: `project-management/review-log.md` RV-0121. Milestone-close commit:
`milestone(FE-PUB-01): close — RV-0121 A:PASS B:PASS`.
