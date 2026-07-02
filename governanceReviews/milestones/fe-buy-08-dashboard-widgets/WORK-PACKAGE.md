# WORK PACKAGE — FE-BUY-08 Dashboard Widgets

- **Lane:** G (touches the P-BUY-01 dashboard; R6/R7 adjacency — observe-only widgets, no
  client-computed figures)
- **Reviewed-SHA record:** `d501345` (scope complete — engagement-pipeline widget checkpointed)
- **Value:** Buyer Productivity · **Priority:** P2 · **Size:** S · **Risk:** Low

## In scope (the delta — a second dashboard widget, following the BX-01/RV-0070 pattern exactly)

- **P-BUY-01 Dashboard** (touches only — owned by FE-BUY-01, already ✅ Complete): add an
  **Engagement pipeline** widget — a second lifecycle-funnel card alongside BX-01's existing
  Sourcing pipeline (RFQ) card, built to the IDENTICAL governance shape: `EngagementPipelineStage
  {state: EngagementState; count}[]`, a wired aggregate read supplied by the caller (never
  client-computed, R7), rendered in the contract-supplied order (never re-ranked, GI-04), observe
  only (R6 — no drill-down action, just a `View all engagements` link). `EngagementState` is the
  pinned contract-authority set already used everywhere else on this dashboard
  (`engagementStateDisplay`) — no new state/enum is coined.

## Out of scope (Review-A enforces)

- No third widget, no new KPI figure, no new field beyond `engagementPipeline` (mirrors the
  already-approved `rfqPipeline` shape 1:1).
- No client-side aggregation/counting of `engagementQueue` or any other list into the pipeline
  counts — the counts are a separate, independently-supplied aggregate (same posture as
  `rfqPipeline`, which is never derived from `rfqQueue`).
- No modification to `SourcingPipelineCard` (already-approved BX-01/RV-0070 code) — a new,
  separate `EngagementPipelineCard` is added instead (2 instances does not meet the "rule of
  three" for extracting a shared generic card; mirrors the FE-BUY-06/07 carry-forward discipline
  of not touching already-approved code without cause).
- No kit/token change.
- F2-Z freeze findings (parked for FE-CLN-01).

## Dependencies

- H: — none (buildable now).
- S: — none.
- Carried context: `EngagementState`/`engagementStateDisplay` already frozen-grounded and reused
  throughout the dashboard's existing "Engagements needing action" queue and P-BUY-19/20.

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **Team-2** · Review A → Review B (fresh contexts) → Dev-team
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13; Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner directive: proceed to kickoff without a pending
approval pause) · Paused — · Resumed — · Closed 2026-07-02 (RV-0113, Dev-team self-close)

## DoD confirmation (checked at close — review-process.md §6)

☑ page DoD ☑ responsive D/T/M ☑ WCAG-AA ☑ tsc/eslint/prettier ☑ realistic mock data ☑ Review A
PASS (RV-0113, 9 OBS) ☑ Review B PASS (RV-0113, 3 OBS, B/M/M=0) ☑ no TODO/dead code ☑ no
duplicate components (2-instance rule-of-three reasoning confirmed by both lanes) ☑ promotion
candidates registered (generic `PipelineCard` at a 3rd instance — B#1) ☑ tracker updated ☑ card
closed
