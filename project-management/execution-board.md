# Execution Board — queues · gates · Board agenda

**FE Program Management v1.0** · Non-authoritative, derived (chain: `review-process.md` §9).
**Owner (maintains): FE Program Manager** — queue advancement rule: `review-process.md` §5
(as amended v1.3 §13 — Dev-team self-close on a clean A:PASS ∧ B:PASS gate; Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override).
Roadmap: [`fe-program-wbs.md`](fe-program-wbs.md) · pointer: [`current-focus.md`](current-focus.md).

## Team queues (gate-adjusted — pull top-down; skip nothing without citing its gate)

**Team-1 (Public / PF):**
~~FE-PUB-02 Discovery~~ ✅ **Closed** (RV-0107, A:PASS ∧ B:PASS, Dev-team self-close 2026-07-02 @
`5d9d94a`) · ~~FE-PUB-03 Vendor Profile~~ ✅ **Closed** (RV-0111, A:PASS ∧ B:PASS, Dev-team
self-close 2026-07-02 @ `1275f70`) · ~~FE-PUB-04 Category Page~~ ✅ **Closed** (RV-0116, A:PASS ∧
B:PASS, 0 B/M/M both lanes, no fix-and-reverify cycle, Dev-team self-close 2026-07-03 @ `4777e84`
— new drill-down route realizing P-PUB-08, which was tracked "🟩 Built" but never actually
existed) · ~~FE-PUB-06 Vendor Directory~~ ✅ **Closed** (RV-0118, A:PASS ∧ B:PASS, 0 B/M/M both
lanes, no fix-and-reverify cycle, Dev-team self-close 2026-07-03 @ `4812157` — added the
spec-declared search entry point missing from P-PUB-12, reusing the existing `SearchBar` kit
component) · ~~FE-PUB-07 Search Result~~ ✅ **Closed** (RV-0119, A:PASS ∧ B:ISSUES-non-gating,
audit-only zero code delta, Dev-team self-close 2026-07-03 — P-PUB-10/19/20 confirmed complete;
a genuine MAJOR finding [landing "Popular search" dead ends] surfaced by the adversarial pass but
correctly attributed to the separate, not-yet-started `FE-PUB-01`, carried forward not fixed here)
· `FE-PUB-01` ← next (pre-diagnosed fix in hand) · ~~FE-PUB-05~~ ⛔ `ESC-7-API-PRODDETAIL` (skip
while gated).

**Team-2 (Buyer):**
~~FE-BUY-04..09~~ ✅ **All Closed** this session (RV-0102/0108/0109/0112/0113/0114 @ `5a4550c`/
`79b738a`/`5654956`/`2d1b23e`/`d501345`/`adc84fa`; FE-BUY-07 after 1 fix-and-reverify cycle,
FE-BUY-09 audit-only zero-delta) · ~~FE-CLN-01~~ ✅ **Closed** (RV-0115 @ `636c192`, A:PASS ∧
B:PASS, 0 B/M/M both lanes, no fix-and-reverify cycle; Dev-team self-close 2026-07-02) — SEVEN
Team-2 milestones this session. `FE-BUY-10 Discovery & Favorites` — **✅ APPROVED** (RV-0117 @
`6306de4`, A:PASS ∧ B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes; **Review Team 5 marked approved
2026-07-03** per Amendment v1.3 §13-refined — owning Team-2 to commit [checkpoints/trackers; close
record uncommitted] + start next; owner resolved both gating decisions 2026-07-03: reuse existing
surfaces for P-BUY-03/04, hold P-BUY-05 build; P-BUY-04 link-out repointed to the public microsite,
8/8 buyer slugs resolve, favorites correctly held; WP card
`governanceReviews/milestones/fe-buy-10-discovery-favorites/WORK-PACKAGE.md`).

**Team-3 (Vendor):**
~~FE-VEN-05~~ ✅ **Closed** (RV-0101 @ `e2f8642`) · ~~FE-VEN-06~~ ✅ **Closed** (RV-0103 @
`4ae0ec1`) · ~~FE-VEN-07~~ ✅ **Closed** (RV-0104 @ `b1810fe`) · ~~FE-VEN-08~~ ✅ **Closed**
(RV-0105, board-approved 2026-07-02 @ `ec8306b`) · ~~FE-VEN-13~~ ✅ **Closed** (RV-0106,
board-approved 2026-07-02 @ `34395b2`, after one fix-and-reverify cycle) · ~~FE-VEN-04 remainder~~
✅ **Closed** (RV-0110, Dev-team self-close 2026-07-02 @ `4b4dc5c`, after one fix-and-reverify
cycle) · `FE-VEN-09 Trust Center` ← current (🔵A Review-A @ `32fe6fb` — P-VND-28, scope complete,
ungated same-session by the Board ruling; awaiting Review-A, Team-3 holds) → FE-VEN-10/11/12
still at Board kickoff scoping (unaffected by this ruling).

**Review Team 5 standing backlog (B lane):** Step-3 Public baseline sweep (QCT 5-step Step 3) at a
stable post-cutover SHA — **owner-authorized 2026-07-02 (agenda #10)**; runs **before FE-PUB-02
starts**; findings feed the FE-PUB packages.

## Gated register (⛔ — waiting on an `esc_registry.md` handle or asset)

| Item | Gate | Interim |
|---|---|---|
| FE-PUB-05 (P-PUB-11) | `ESC-7-API-PRODDETAIL` | product modal from `search_catalog` |
| FE-PUB-09 mega menu | taxonomy P1 approval + `MEGA_MENU_*` package approval (S: `ESC-7-API-CATNAV`) | simple nav (FE-PF-05) |
| FE-PF-02 brand | official SVGs under `public/brand/` | placeholder-complete kit `BrandLogo` |
| Page-gates inside milestones | P-PUB-09 `ESC-7-API-CATNAV` · P-VND-10 `ESC-7-API/upload` · P-ACC-12 `ESC-IDN-DELEG-EXPIRY` | carve-out rule (WBS) |

## Parked register (🅿 — waiting on an owner decision)

| Item | Decision needed |
|---|---|
| FE-VEN-10/11/12 | Board kickoff scoping (vendor-context reuse of P-ACC surfaces; T3 builds adaptation, T1 keeps maintaining reused pages) |
| M2.5 vendor public microsite | continuation past the delivered foundation |

## Board standing agenda

1. **Official brand SVGs** — supply unmodified assets (`public/brand/README.md` policy); closes FE-PF-02.
2. ~~**Vendor FE BLOCKER packet**~~ — **SCORE-DISPLAY · TRUSTSCORE RULED by owner 2026-07-03**
   (`governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`): Trust Score display permitted on
   **any public-facing surface** (broader than the packet's own recommended self-view-only option),
   consistent with the frozen Doc-4G/Doc-5G public/no-slug read; no corpus patch required; Trust
   Score composition = 4 categorical pillars (Identity & Verification / Operational Reliability /
   Reputation / Platform Compliance), exact formula/weights stay `ESC-TRUST-POLICY` (open,
   backend-time). Performance Score NOT covered — stays band-only. **Unblocks `FE-VEN-09`.**
   **A7 still open** — sole remaining BLOCKER on the vendor companion freeze gate (`vendor_planning_and_design.md` §12.2, now BLOCKER=1). **Cross-team enhancement opportunity (not auto-applied):** Team-1's already-closed public microsite (`FE-PUB-03`, M2.5, Verified=binary-only) and Team-2's
   buyer-facing vendor cards were built band/badge-only under the prior posture — closed milestones
   are not reopened; this is recorded as a fresh, ownable enhancement for those tracks whenever
   picked up, not an automatic edit.
3. ~~**FE-BUY-10 decisions**~~ — **RESOLVED by owner 2026-07-03** (route topology P-BUY-03/04 →
   reuse existing surfaces; favorites scope P-BUY-05 → confirmed product/category, build held on
   the projection gap). Milestone checkpointed, awaiting Review-A.
4. **P-ACC-12** — `ESC-IDN-DELEG-EXPIRY` (delegation reinstate path).
5. **M2.5 microsite continuation.**
6. **Taxonomy P1 + mega-menu package approval** — unblocks FE-PUB-09.
7. **FE-VEN-10/11/12 kickoff scoping.**
8. **Shell-mount ratification** — global search `/account/search` + notification center
   `/notifications` (raised at loop terminus, non-blocking; pages ✅).
9. **SiteHeader "Pricing" nav → `/pricing`** chrome wiring (RV-0087 follow-up).
10. ~~**Authorize the Review-B Step-3 Public baseline sweep**~~ (first standing-backlog run) —
    **AUTHORIZED by owner 2026-07-02.**
11. **Shell QuickCreate button-name a11y bug** — `app/(app)/_components/shell/quick-create.tsx:29`:
    the trigger's `<span className="hidden sm:inline">Create</span>` label is hidden below `sm`
    (< 640px), leaving a bare `<Plus />` icon with no accessible name at mobile widths (axe
    `button-name`, critical impact; reproduces identically on every route since the shell mounts
    everywhere). Discovered during FE-CLN-01's axe sweep (buyer surface); shell-owned code —
    out of Team-2's unilateral-fix scope (same class as FZ-01). Fix is a one-line `sr-only` span
    or `aria-label` on the trigger `Button`; needs the shell owner, not a Board ruling.

## Review pipeline (pointer)

States, lanes (G/L), verdicts, re-entry, DoD, WP-card template: [`review-process.md`](review-process.md).
`⬜ → 🔍 → 🟡 → 🔵A → 🔵B → 🟣 → ✅` (+ 🟠/🟥/⛔/🅿/❌/♻).
