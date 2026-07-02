# WORK PACKAGE — FE-PUB-06 Vendor Directory (✅ Closed — RV-0118, A:PASS ∧ B:PASS, Dev-team
self-close per Amendment v1.3 §13)

- **Lane:** G (anonymous contract surface)
- **Reviewed-SHA record:** `4812157` (scope complete — SearchBar entry point added)
- **Value:** Vendor Growth · **Priority:** P1 · **Size:** S · **Risk:** Low

## Scoping note

`team-1.md` tracked P-PUB-12 (Vendor directory, `app/(public)/vendors/page.tsx`) as "🟩 Built."
Grounding audit against `screen_specifications.md`'s P-PUB-12 delta (Toolbar: query · sort ·
filter trigger · density) found the page already correctly composes `FilterSidebar`/`VendorCard`/
`ResultsGrid`/`PaginationControl` (all inert-until-wired, matching the FE-PUB-02/03/04 posture) —
but has **zero search entry point**, unlike its sibling public index page `/categories`
(FE-PUB-02), which places a `SearchBar` under its H1. The buyer-authenticated equivalent
(`discover-view.tsx`) also gives its directory a search toolbar — confirming a genuine parity gap
between the anonymous and authenticated versions of the same "vendor directory" job, not
gold-plating.

## In scope (this delta)

- Add `<SearchBar action="/search" label="Search suppliers" placeholder="Search suppliers by name
  or category…" />` to `app/(public)/vendors/page.tsx`'s header, mirroring `/categories`'s exact
  placement/reuse pattern (kit `SearchBar`, Doc-7B, already promoted for Public-surface use — no
  new component). `action="/search"` (not `/vendors`) because `/search` is the one page with real
  `?q=`-consuming filter logic (including a "Vendors" result tab that filters the same `VENDORS`
  seed and renders the same `VendorCard`); `/vendors/page.tsx` itself has no query-param handling
  and adding one here would duplicate `/search`'s existing filter logic rather than reuse it —
  same "point at the real search page" decision `/categories` already made.

## Out of scope (Review-A enforces)

- Sort control and density toggle (also named in the spec's Toolbar delta) — no kit
  `Sort`/`Density` primitive exists yet; inventing one is a new-component decision, not a
  narrow reuse-only delta. Not built; the gap remains cited, same disposition FE-PUB-03 used for
  its cited-not-built items.
- Making `/vendors/page.tsx` itself consume `?q=` / filter in place — would duplicate `/search`'s
  existing Vendors-tab filter logic instead of reusing it.
- Real `search_catalog` wiring, backend/mutation, AI, kit/token changes, ranking/scoring of any
  kind (R6/GI-04).

## Dependencies

- H: — none (buildable now; `SearchBar` and `/search`'s Vendors tab both already exist).
- S: — none.

## Lifecycle ownership

Builder = **Team-1** · Maintainer = **Team-1** · Review A → Review B (fresh contexts); on a clean
A:PASS ∧ B:PASS gate the owning Dev team self-closes per `review-process.md` Amendment v1.3 §13.

## Key dates

Created 2026-07-03 · Started 2026-07-03 · Paused — · Resumed — · Closed 2026-07-03

## DoD confirmation (checked at close)

☑ page DoD ☑ responsive D/T/M (Playwright 390/768/1280, Review-B) ☑ WCAG-AA (axe-core, 0
violations all 3 viewports) ☑ tsc/eslint/prettier ☑ realistic mock data (existing seed, real
submit flow verified end-to-end) ☑ Review A PASS (RV-0118, 1 OBS, B/M/M=0) ☑ Review B PASS
(RV-0118, 1 OBS, B/M/M=0) ☑ gate approval (A:PASS ∧ B:PASS on `4812157` — the clean gate is the
approval signal per Amendment v1.3 §13) ☑ no TODO/dead code ☑ no duplicate components (reuses kit
`SearchBar` only; no new primitive) ☑ promotion candidates registered (none raised — pure reuse,
no duplication pattern surfaced) ☑ tracker updated ☑ card closed

## Close record

**✅ Closed 2026-07-03.** Review-A: PASS (0 B/M/M, 1 OBS). Review-B: PASS (0 B/M/M, 1 OBS — same
observation independently reached). No fix-and-reverify cycle — both lanes passed on the first
submission. Dev-team self-close per Amendment v1.3 §13. Full record:
`project-management/review-log.md` RV-0118. Milestone-close commit:
`milestone(FE-PUB-06): close — RV-0118 A:PASS B:PASS`.
