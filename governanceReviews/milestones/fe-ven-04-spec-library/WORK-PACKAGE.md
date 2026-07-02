# WORK PACKAGE — FE-VEN-04 remainder (P-VND-09 Spec Library)

- **Lane:** G (contract-bound render; new build page)
- **Reviewed-SHA record:** _(filled at 🔵A)_
- **Value:** Vendor Growth · **Priority:** P2 · **Size:** S · **Risk:** Low

## In scope

FE-VEN-04 Catalog is `P-VND-07..11`; `07/08/11` are already ✅ (legacy 🟩 Built), `P-VND-10` stays
⛔ `ESC-7-API/upload`. This milestone closes the one remaining buildable page:

- **P-VND-09 Spec library (Listing)** — new route `workspace/company/spec-library/page.tsx`
  (`SpecLibraryList`). Reusable specification library entries
  (`marketplace.spec_library_entries`, Doc-2 §10.3 row 741: `name, summary`, optional `category_id`
  FK), distinct from P-VND-10 (the versioned per-entry FILES, upload-gated) and from the per-product
  spec panel (S7 tab — a product's linked spec *documents*, not this org-level library). Built
  against `marketplace.create_spec_library_entry.v1` / `update_spec_library_entry.v1` (Doc-4D PassB
  §D7.2). Create **and** edit both happen through one `SpecEntryDialog` component (screen spec's
  "Dialogs: edit" delta) — unlike Ads, a real symmetric update contract exists here, so editing an
  existing entry is genuinely grounded, not invented. List renders search (disabled), a data-table
  (kit list pattern, matching Products/Ads), the `PaginationControl` kit component (cursor-only,
  GI-03), and a genuine "No spec entries" empty state.
- Nav: added "Spec Library" to the vendor Company nav section (`vendor-shell-vm.ts`) and a
  `specLibrary` icon key (`Library`, lucide-react) to the shared shell icon registry
  (`_components/shell/icons.ts` — additive only; the registry's own comment invites this: "a
  workspace adds its icons by extending this map").

## Out of scope (Review-A enforces)

- P-VND-10 Spec documents — stays ⛔ `ESC-7-API/upload`, not touched.
- Linking a spec entry to a product (`link_product_spec`/`unlink_product_spec`) — that affordance
  lives on P-VND-08 (already built), not authored or duplicated here.
- Any category *picker* UI backed by a live taxonomy list — no reusable "pick any category" widget
  exists yet; `category_id` is rendered as a plain labelled field (same treatment as `ad-form.tsx`'s
  `vendor_profile_id`), not a fabricated search/select.
- Trust/performance/tier surfaces (⛔ FE-VEN-09) · backend wiring · kit/token changes (native
  `<textarea>` mirrors the registered `[ESC-7B-TEXTAREA]` gap — no invented kit primitive).
- Any other FE-VEN milestone's files (05/06/07/08/13, all ✅ Closed) — untouched.

## Dependencies

- H: — none (P-VND-07/08/11 precedent already shipped; the create/update contract is frozen and
  named).
- S: — none.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** · Review A → Review B (fresh contexts) → self-close
on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13) — Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override only.

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner: "you should not stop, just start the work, no
approval required") · Scope complete 2026-07-02 · Closed —

## DoD confirmation (checked at close)

☐ page DoD (1 page) ☐ responsive D/T/M ☐ WCAG-AA ☐ tsc/eslint/prettier ☐ realistic mock data —
N/A by design (genuine-empty pattern, consistent with the rest of the vendor workspace) ☐ Review A
PASS ☐ Review B PASS (B/M/M = 0) ☐ self-closed on clean gate (or Board, if BLOCKER/REGRESSION) ☐ no
TODO/dead code ☐ no duplicate components ☐ promotion candidates reviewed ☐ tracker updated ☐ card
closed
