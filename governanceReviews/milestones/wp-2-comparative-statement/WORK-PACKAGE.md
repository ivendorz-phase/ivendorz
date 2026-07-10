# WP-2 — Comparative Statement (CS) · Work Package

**Track:** Buyer (Team-2) · **Status:** 🔵A Submitted (awaiting Review-A per FE-PM pipeline)
**Date:** 2026-07-06 · **Owner authority:** `docs/product/requirements/COMPARE_SHEET_UX_FREEZE_v0.1.md`
(header **v1.0 — FROZEN (product)**) + Visual Approval (owner "approved", same day).
**Sign-off record:** `governanceReviews/COMPARE-SHEET-CS-REDEFINITION_v1.0.md` ·
**Board packet:** `BOARD-PACKET-CS-DOCUMENT_v1.0.md` (agenda #17 — none of the 5 handles blocks this build).
**Rules:** WP-1 rules — presentation-only · mock adapters · no backend logic · no new workflow states.

## Scope

The Comparative Statement print view (freeze §3 CS Document Standard) + the two freeze-ruled
Workspace entry points. The CS is a generated procurement document over the Workspace selection —
**not** an independent business entity until `ESC-CS-DOCKIND` (ownership statement carried
verbatim in freeze §1).

**In scope (built):**
1. `app/(app)/(buyer)/_components/comparative-statement/` — `cs-view-models.ts` ·
   `cs-sheet.tsx` (A4 sheet, compact repeating header, letterhead block) · `cs-sections.tsx`
   (page-1 / item-table / final-page sections) · `cs-document.tsx` (composer; content-driven
   chunking `ITEMS_PER_PAGE = 16`, computed Page N of M) · `cs-toolbar.tsx` (the only client
   component — `window.print()`) · `comparative-statement.css` (`.cs-`-scoped; `@page` A4
   landscape, 8mm margins; print zeroes screen spacing).
2. Adapter seam: `BuyerRfqWorkflowReads.getComparativeStatement(rfqId, selectedQuotationIds?)`
   (types + mock impl — ALL arithmetic adapter-side per R7: line totals, subtotals, VAT 15%,
   grand totals, lowest marks, difference/%, delivery rows resolved against the CHOSEN set).
3. Mock fixtures `adapters/mock/cs-universe.ts` — rfq-000123 (18 items × 2 vendors) +
   rfq-000119 (8 items × 3 vendors). **Consistency invariant:** per-vendor line sums equal the
   fixture quotation amounts EXACTLY (2,695,000 / 2,810,000 / 745,000 / 799,000 / 712,000 —
   Sub Total = quoted price ex-VAT; Grand Total adds VAT 15%).
4. TEMPORARY route `app/(app)/(buyer)/rfqs/[rfqId]/comparative-statement/` (+loading) —
   MAJOR-1/NIT-1 header sentences verbatim; `?sel=` = ephemeral W-1 selection (2–5) via native
   GET; absent/invalid → full disclosed set.
5. Workspace deltas: "Comparative Statement" affordance on the compare surface (≥ 2 suppliers,
   W-2.4) · "Compare quotations" CTA on the quotations tab (W-2.1 — that file's stale
   no-Compare comment updated to cite the freeze).

**Out of scope (deliberate):** the W-1 checkbox picker + W-3 sort control on the Workspace
(follow-on slice); real letterhead (`ESC-CS-LETTERHEAD`); real line-item data
(`ESC-CS-LINEITEMS` dev-doc schema); platform PDF/Excel generation (`ESC-CS-EXPORT` — the Excel
button is an honest disabled stub); any persisted CS entity/reference (`ESC-CS-DOCKIND`/`ESC-CS-REF`).

## Governance (owner-adjudicated findings honored — freeze §4.2)

- **MAJOR-1/NIT-1:** temporary route; header carries *"This route exists only for the mock-era
  implementation and will migrate to the canonical Comparative Statement document route after
  ESC-CS-DOCKIND approval."*
- **MAJOR-2/MINOR-1:** "Draft Reference" only (derived from the RFQ ref, pending-governance
  marked); grep-verified **zero `CS-\d` strings** in `app/` + `src/`; single swappable
  view-model field.
- **MAJOR-3:** "**Buyer Evaluation Summary**" — "Vendor Ranking" appears only inside
  never-use-this-label comments (grep-verified).
- **R6 provenance (freeze §4.1):** every evaluative section renders from
  `buyerEvaluation.buyerAuthored: true` with a visible † mark + caption; the 119 fixture
  deliberately demonstrates a buyer recommendation that is NOT the arithmetic lowest.
- **§3.4:** signature blocks are printed (empty signing space + "Date: ____"); nothing captured.
- **Inv #11 / GI-12:** unknown id, pre-first-quotation, and no-CS-fixture all collapse to the
  same in-view genuine-absence state (the P-BUY-15 `NotFoundState` shape, noun changed).
- **Delivery-comparison non-leak:** fixture rows are keyed by quotation id; the adapter DROPS a
  row whose vendor is excluded from the selection (caught in verification — a subset render
  originally named an excluded vendor via a static fixture string; fixed, re-verified).

## Verification (all run 2026-07-06)

- **Static:** `tsc --noEmit` clean · eslint clean on all touched paths · prettier clean on all
  touched files (11 repo-wide prettier warns are pre-existing, untouched).
- **Live render (dev):** rfq-000123 CS → 200, 4 sheets (exec · items 1–16 · items 17–18 +
  Sub/VAT/Grand totals · final), "Page 1 of 4" fragments confirmed; rfq-000119 → 200, 3 sheets;
  unknown id → genuine-absence state; grand totals/diff verified in-render (3,099,250.00 /
  3,231,500.00 / 132,250.00 / 4.09% and 856,750.00 / 918,850.00 / 818,800.00 / 37,950.00 /
  4.43%); compare-page affordance + quotations-tab CTA hrefs present.
- **Selection:** `?sel=q-119-1&sel=q-119-3` → 2 vendors, Eastern Grid absent EVERYWHERE
  (incl. delivery rows post-fix); single-id `?sel=` → full set (D1 conformance note).
- **Print (headless Chrome print-to-PDF):** rfq-000123 → **exactly 4 pages**, rfq-000119 →
  **exactly 3 pages**, MediaBox 841.92×594.96pt = A4 landscape; artifacts committed in this
  folder (`print-cs-rfq-000123.pdf`, `print-cs-rfq-000119.pdf`, `cs-screen-desktop.png`).
  One real defect caught here: screen container padding + flex gap leaked into print and emitted
  a 5th phantom page — fixed in the print CSS (`.cs-scope` padding zeroed, `.cs-sheet-list`
  block, sheet 192mm), re-verified 4/3.
- **Not run:** axe sweep (review-lane standard) — left to Review-A/B per pipeline; the
  RV-0126 isolated-prod-build lane remains blocked repo-wide by Board agenda #16 (shell
  `useSearchParams`), not by this milestone.

## Promotion note

`CsSheet`/document primitives are registered on `project-management/promotion-watchlist.md` —
expected second consumer: M4 engagement-document print views. Not promoted now (registry
2nd-consumer rule).

## DoD

- [x] Freeze signed (v1.0) before any code · Visual Approval before any code (NIT-2)
- [x] Presentation-only; no coined state/enum/slug/ref; adapter-side arithmetic only
- [x] Static gates green; live render + print pagination verified; governance greps clean
- [x] Trackers synced (current-focus, execution-board agenda #17, changelog)
- [ ] Review-A (Team-4) → Review-B (Team-5) → close per Amendment v1.3 §13
