# WORK PACKAGE — FE-BUY-05 Supplier Comparison

- **Lane:** G (Procurement Moat; R6-sensitive — "the most R6-sensitive buyer screen"; contract-bound
  renders)
- **Reviewed-SHA record:** `79b738a` (scope complete — sole in-scope page checkpointed: P-BUY-15)
- **Value:** Procurement Moat · **Priority:** P1 · **Size:** M · **Risk:** High

## In scope (the delta — enhancement, BX-01/BX-02/FE-BUY-04 model)

- **P-BUY-15 Supplier comparison** (🟩 pre-loop): the route (`rfqs/[rfqId]/compare/page.tsx`)
  currently always passes `suppliers: []`, so the built `ComparisonSummary`/`ComparisonTable`
  never actually render — seed a realistic, contract-shaped presentation fixture
  (`get_comparison_statement.v1`, Doc-4E §E8.6) with several suppliers so the comparison surface
  renders for review. Information-hierarchy polish on the existing summary/table composition
  (e.g. clearer per-attribute row labeling, currency-driven Money) — descriptive only.

## Out of scope (Review-A enforces — R6/Inv#12 the binding constraint)

- **No ranking, scoring, "best"/"lowest"/"recommended" cue, highlight-the-winner styling, or any
  sort order other than the System-supplied order** (GI-04 — never re-ranked client-side).
- **No award affordance** — award is the separate, deliberate P-BUY-17 (`FE-BUY-06`).
- No comparison-to-a-baseline/target price. No computed delta/variance/rank badge.
- Backend/wiring/server actions · kit/token changes · coined fields/enums (render only what the
  frozen `get_comparison_statement.v1` projects; gaps cite `esc_registry.md`) · F2-Z freeze
  findings (parked for FE-CLN-01).

## Dependencies

- H: — none (buildable now).
- S: — none.
- Carried context: quotation visibility gating (Doc-4E) binds; vendor names buyer-disclosed only
  for submitted quotations on the buyer's own RFQ (RV-0075/RV-0102 precedent); the comparison
  auto-generates at the first quotation (Doc-3 §9.1) — an RFQ with 0 quotations is the honest
  "awaiting responses" empty state, not a fabricated comparison.

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **Team-2** · Review A → Review B (fresh contexts) → Dev-team
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13; Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner kickoff approved) · Paused — · Resumed — · Closed
2026-07-02 (RV-0108, Dev-team self-close)

## DoD confirmation (checked at close — review-process.md §6, carry-forward rule applies:
delta-only; P-BUY-15 is 🟩 legacy so the enhancement delta is the review surface)

☑ page DoD ☑ responsive D/T/M ☑ WCAG-AA ☑ tsc/eslint/prettier ☑ realistic mock data ☑ Review A
PASS (RV-0108, 3 OBS) ☑ Review B PASS (RV-0108, 3 OBS, B/M/M=0) ☑ no TODO/dead code ☑ no
duplicate components (zero raw input/button/select/textarea in the diff — Review-B confirmed) ☑
promotion candidates registered (none flagged) ☑ tracker updated ☑ card closed
