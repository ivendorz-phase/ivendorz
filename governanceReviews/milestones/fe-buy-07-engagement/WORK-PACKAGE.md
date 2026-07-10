# WORK PACKAGE — FE-BUY-07 Engagement

- **Lane:** G (Buyer Productivity; post-award document surface; money-boundary DF-6 adjacency)
- **Reviewed-SHA record:** `2d1b23e` (fix-and-reverify cycle — Review-A REVISION on `c2882fa`
  [MAJOR: per-engagement existence-claim caption] fixed by removing the caption; P-BUY-19/21-25
  still carried forward untouched, no defect found)
- **Value:** Buyer Productivity · **Priority:** P1 · **Size:** L · **Risk:** Med

## In scope (the delta — enhancement, BX-01/BX-02/FE-BUY-04/05/06 model)

- **P-BUY-20 Engagement detail** (🟩 pre-loop, exemplary): the "Documents" card is a permanent
  dead-end — it always renders "Documents open in a later milestone", even though P-BUY-21..25
  (PO / Payments / Trade invoice / Challan / WCC) are ALL already fully built and reachable by
  URL. Replace the dead-end EmptyState with static navigation links to the 5 fixed document-kind
  routes. This is NOT the blocked `ESC-7G-ENG-03` enumeration (which asks "which documents exist
  for this engagement" — still correctly ungrounded, no contract) — it is plain navigation to
  fixed, always-known routes, exactly the technique already used for the RFQ detail's sub-route
  tabs (versions/routing/clarifications) and FE-BUY-06's comparison cross-link: the destination
  page's own `notFound()` handles absence gracefully (byte-identical, Inv#11/H.9), no existence is
  asserted or fabricated by the hub.
- **P-BUY-19, 21, 22, 23, 24, 25** (🟩 pre-loop, exemplary — list + 5 document detail pages):
  reviewed for hierarchy issues per the WP card scope; all already realistic, well-projected,
  money-boundary-correct (DF-6), non-disclosure-correct (H.9 byte-identical not-found); carried
  forward untouched (like P-BUY-18 was for FE-BUY-06).

## Out of scope (Review-A enforces)

- **No fabricated per-document existence indicator** (a checkmark/badge saying "PO: yes/no" would
  require the blocked `ESC-7G-ENG-03` enumeration) — links are plain navigation, not a status list.
- No `rfq_id`/originating-RFQ live link (still correctly gated `ESC-7G-ENG-01`, "not yet
  available" stays as-is).
- No vendor display name (still correctly gated `ESC-7G-ENG-02`).
- No wiring, no mutation, no kit/token change, no coined field/enum.
- F2-Z freeze findings (parked for FE-CLN-01).

## Dependencies

- H: — none (buildable now — the 5 target routes already exist and are already built).
- S: — none.
- Carried context: money boundary DF-6/R8 (recorded figures only, never settled on-platform);
  non-disclosure H.9 (unknown/absent/non-party all collapse to the same byte-identical not-found).

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **Team-2** · Review A → Review B (fresh contexts) → Dev-team
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13; Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner directive: proceed to kickoff without a pending
approval pause) · Paused — · Resumed — · Closed 2026-07-02 (RV-0112, Dev-team self-close, after
one fix-and-reverify cycle)

## DoD confirmation (checked at close — review-process.md §6, carry-forward rule applies:
delta-only; P-BUY-19/21-25 are 🟩 legacy so the P-BUY-20 delta is the review surface)

☑ page DoD ☑ responsive D/T/M ☑ WCAG-AA ☑ tsc/eslint/prettier ☑ realistic mock data ☑ Review A
PASS (RV-0112, after 1 fix-and-reverify cycle — 1 MAJOR raised+resolved) ☑ Review B PASS (RV-0112,
3 OBS, B/M/M=0) ☑ no TODO/dead code ☑ no duplicate components ☑ promotion candidates registered
(none flagged) ☑ tracker updated ☑ card closed
