# WORK PACKAGE — FE-VEN-09 Trust Center

- **Lane:** G (contract-bound render; firewalled governance signals; newly ungated by Board ruling)
- **Reviewed-SHA record:** `32fe6fb` (RV-0120 — A:PASS 2 OBS, B:PASS 0 findings, no fix-and-reverify
  cycle, both lanes clean on first submission)
- **Value:** Trust · **Priority:** P1 · **Size:** M · **Risk:** High

## In scope

**P-VND-28 Trust & Performance (Dashboard)** — new route `workspace/trust/page.tsx`, replacing the
bare `WorkspaceSectionPlaceholder` stub (genuinely unbuilt before this milestone; `[ESC-7G-SCORE-DISPLAY]`/`[ESC-7B-TRUSTSCORE]` gated it since inception). Read-only vendor dashboard over three
frozen Doc-4G PassB reads:

- **Trust Score** (`trust.get_trust_score.v1`, Part 2 §G5.3 — public, no slug) — `TrustScoreCard` +
  `TrustScoreRing` (feature-local SVG ring; no dedicated kit primitive exists, same posture as
  `TierChip` pending `[ESC-7B-TIER-CHIP]`). Renders band + **numeric score 0–100**, permitted on
  any public-facing surface per the **Board ruling 2026-07-03** resolving `[ESC-7G-SCORE-DISPLAY]`/
  `[ESC-7B-TRUSTSCORE]` (`governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`). Frozen kit
  `embedded/trust-badge.tsx` now legitimately composed **with** `score` (Option 3, ratified) — no
  kit change. Frozen-suppressed (`freeze_state=frozen`) state handled explicitly, never fabricated.
- **Performance** (`trust.get_performance_score.v1`, Part 3 §G6.5 — public, no slug) —
  `PerformanceScoreCard`. **Band/`level` + `rated` only — NEVER a numeric score.** This is a frozen
  contract restriction (§G6.5: "the numeric `score` is NOT exposed publicly"), not a presentation
  choice, and the Board ruling explicitly does not cover Performance Score. Sub-threshold reports
  "Not Rated" (`rated=false`), never fabricated as 0.
- **Verified Financial Tier** (`trust.get_verified_tier.v1`, Part 1 §G4.8 — public badge
  projection) — `VerifiedTierCard`, reusing the existing `TierChip` (Company Profile) rather than
  duplicating a second A–E chip. Distinct, Trust-owned, read-only signal — never conflated with the
  vendor's own DECLARED tier (Company Profile S4, M2-owned, editable; Invariant 10).
- Composed by `TrustPerformanceDashboard`, which also renders the frozen kit `TrustBadge` as a
  compact header summary (satisfies the screen spec's separately-named "trust-badge" component).
  Genuine empty state ("Signals pending verification," the screen spec's own copy) when no signal
  data is present.

## Out of scope (Review-A enforces)

- **Any granular "contributing factors" checklist** (e.g., a per-item "Business Verified / Trade
  License Verified / Tax Verified / Phone Verified" breakdown). The Board ruling's illustrative
  example listed such a checklist, but the frozen corpus exposes NO public read at that granularity
  — individual verification records (`trust.get_verification.v1`/`list_verifications.v1`, Doc-4G
  Part1 §G4.8) are **Staff-Internal only**; only the aggregate `verified_tier` (A–E badge) is
  public. Building a fabricated checklist would invent a contract that doesn't exist. Shipped
  instead: a generic, honest explanatory sentence (identity/reliability/reputation/compliance) on
  the Trust Score card. Flagged as a real gap for a future `[ESC-TRUST-FACTORS]`-style escalation
  if per-category public disclosure is ever wanted — not invented here.
- **Performance Score's numeric value** — never exposed by the frozen `get_performance_score.v1`
  public read; not a scope decision this milestone can override.
- **Exact Trust Score formula/weights** — the Board ruling gave 4 categorical pillars (Identity &
  Verification / Operational Reliability / Reputation / Platform Compliance), filling
  `[ESC-TRUST-POLICY]` at the categorical level only; exact weights stay open for
  backend-implementation time. Nothing quantitative about the formula is rendered or implied here.
- **Any matching/routing/ranking/fraud-risk/confidence-coefficient data** — never wire fields,
  never rendered (procurement moat, Doc-4G H.9(e); Board ruling's explicit "never display" list).
- **Frozen kit changes** — `embedded/trust-badge.tsx` untouched; consumed as-is with `score` now
  legitimately passed.
- **Company Profile's `GovernanceBandsPlaceholder`** (S1 Profile Overview) — now stale given this
  ruling (its own comment cites the two now-resolved ESC handles), but S1 is a different,
  already-built page outside this milestone's declared scope. Flagged as a follow-up enhancement,
  not touched here.
- Any other FE-VEN milestone's files (04/05/06/07/08/13, all ✅ Closed) — untouched.

## Dependencies

- H: — none remaining. `[ESC-7G-SCORE-DISPLAY]`/`[ESC-7B-TRUSTSCORE]` RESOLVED 2026-07-03 (Board
  ruling, formalized in `esc_registry.md` + the Board packet + `vendor_planning_and_design.md`).
- S: — none.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** · Review A → Review B (fresh contexts) → self-close
on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13) — Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override only.

## Key dates

Created 2026-07-03 · Started 2026-07-03 (Board ruling resolved the gate same-session; owner
standing instruction: "no approval required, just start the work") · Scope complete 2026-07-03
(checkpoint `32fe6fb`) · **Closed 2026-07-03** (RV-0120, Dev-team self-close)

## DoD confirmation (checked at close)

☑ page DoD (1 page) ☑ responsive D/T/M (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3` +
`flex-col sm:flex-row` verified sensible mobile-first degradation) ☑ WCAG-AA (`TrustScoreRing`
`role="img"`+`aria-label` branches all 3 states correctly; numeric span + decorative svg both
`aria-hidden`; `StatusChip.label` non-optional — colour-only status structurally impossible;
heading hierarchy clean) ☑ tsc/eslint/prettier (independently re-verified across both review
passes) ☑ realistic mock data — N/A by design: genuine-empty pattern, live-render-confirmed HTTP
200 ☑ Review A PASS (RV-0120, 2 OBS — self-serving-interpretation risk explicitly checked and
cleared) ☑ Review B PASS (RV-0120, 0 findings — independent firewall re-check, a11y, dead-code,
duplicate-primitive lens all clean; no fix-and-reverify cycle needed) ☑ self-closed on clean gate
(Amendment v1.3 §13 — Board not invoked) ☑ no TODO/dead code ☑ no duplicate components (ring is
feature-local, no kit primitive exists; `TierChip`/`TrustBadge` reused, not duplicated) ☑ promotion
candidates reviewed — none flagged (ring/`TierChip` both already tracked as pending future kit
primitives, no new escalation) ☑ tracker updated (current-focus/execution-board/fe-program-wbs/
team-3/changelog) ☑ card closed
