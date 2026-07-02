# WORK PACKAGE — FE-PUB-04 Category Page (Started)

- **Lane:** G (anonymous contract surface; touches an already-closed FE-PUB-02 file)
- **Reviewed-SHA record:** _(filled at checkpoint)_
- **Value:** Core Marketplace · **Priority:** P1 · **Size:** S · **Risk:** Low

## Scoping note (why this milestone looks different from a normal enhancement)

`team-1.md` listed P-PUB-08 (Category page) as "🟩 Built | partial — verify facets," but no
dedicated implementation actually exists: `/marketplace` is a static curated hub that reads zero
query params, and `/search` has real filter/result infrastructure but never consumed `?category=`
or `?capability=`. Every category-tile link across the app (`/categories`, `/marketplace`,
`/search`'s categories tab) pointed at `/marketplace?category=slug`, which does nothing — a dead
interim. This is a genuine fresh build (READY(build), not READY(enh)) despite the WBS row saying
READY(enh); flagged here rather than silently building around it.

## In scope (this delta)

- **New route `app/(public)/marketplace/category/[slug]/page.tsx`** (realizes P-PUB-08): drills
  into a category from its slug, lists matching vendors and products (exact-match filter over the
  same curated seed `/search`/`/vendors` already use — a `search_catalog` category-facet read
  stand-in under the registered interim `ESC-7-API-CATNAV`, disclosed in-page). Vendors/Products
  tabs (URL-synced `?tab=`), reuses the kit `FilterSidebar`/`VendorCard`/`ProductCard`/
  `ResultsGrid`/`PaginationControl` — no new card type, no new primitive, no kit/token change.
  Unknown slug → `notFound()` (byte-identical to absence, Inv#11), matching the established
  `getVendorOr404` pattern.
- **Repoint the 3 existing dead-link sources** to the new real route: `categories/page.tsx`
  (FE-PUB-02's closed delta — touched again here, in scope for THIS milestone's re-review only),
  `_components/landing/featured-categories.tsx`, and `search/page.tsx`'s categories tab. Only the
  `?category=` links change; the separate `?capability=` interim (also on `categories/page.tsx`)
  is untouched — out of scope, a different gap.

## Out of scope (Review-A enforces)

- The `?capability=` interim (still not consumed by any page) — a distinct gap, not this
  milestone's job.
- P-PUB-09 Industry page — stays ⛔ `ESC-7-API-CATNAV` carved out, not built.
- Real `search_catalog` wiring, pagination wiring, backend/mutation, AI, kit/token changes.
- Any change to the Vendors/Products tab content beyond routing them off the category filter
  (no new sort/rank — GI-04; no fabricated counts — GI-03).

## Dependencies

- H: — none (buildable now against the existing seed).
- S: — none.

## Lifecycle ownership

Builder = **Team-1** · Maintainer = **Team-1** · Review A → Review B (fresh contexts).

## Key dates

Created 2026-07-03 · Started 2026-07-03 · Paused — · Resumed — · Closed —

## DoD confirmation (checked at close)

☐ page DoD ☐ responsive D/T/M ☐ WCAG-AA ☐ tsc/eslint/prettier ☐ realistic mock data ☐ Review A
PASS ☐ Review B PASS (B/M/M=0) ☐ gate approval ☐ no TODO/dead code ☐ no duplicate components ☐
promotion candidates registered ☐ tracker updated ☐ card closed
