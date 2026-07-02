# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. Pointers only — the milestone
> roadmap is [`fe-program-wbs.md`](fe-program-wbs.md), queues/gates are
> [`execution-board.md`](execution-board.md), process is [`review-process.md`](review-process.md).
> Team files remain the **page-level source record**. On any change, append to `changelog.md`.

**Updated:** 2026-07-02 · **Model:** FE Program Management v1.0 (cutover complete — Phases 0/A/B/C
done; page-loop terminus RV-0100). Teams pull milestones from the execution board, never from chat.

---

## Team-1 — Public / Platform (FE-PUB · FE-PF)

- **Current Milestone:** _(none — `FE-PUB-03` Vendor Profile ✅ **Closed**, RV-0111, A:PASS ∧ B:PASS
  (Review-B by Team-5, 8 OBS), 0 BLOCKER/MAJOR/MINOR both lanes, checkpoint `1275f70`; Dev-team
  self-close per Amendment v1.3 §13. Second FE-PUB milestone through the full Dev→A→B pipeline)_
- **Current Page:** _(none — shared microsite chrome delta `1275f70`: stale pre-ADR-022 footer nav
  anchors → real routes + fixed-bottom mobile-only enquire CTA; Review-B verified sticky-bar
  no-occlusion (pb-24 96px > 61px bar) + duplicate-control-clean + axe 0 mobile/desktop)_
- **Pipeline stage:** idle — pulling `FE-PUB-04` next (WP card pending kickoff)
- **Next Milestone:** FE-PUB-04 → FE-PUB-06 → FE-PUB-07 → FE-PUB-01 (skip FE-PUB-05 ⛔)

## Team-2 — Buyer (FE-BUY / FE-CLN)

- **Current Milestone:** _(none — `FE-CLN-01` Buyer F2-Z Freeze Remediation ✅ **Closed**, RV-0115,
  A:PASS ∧ B:PASS (0 B/M/M both lanes, 5 OBS total, no fix-and-reverify cycle), checkpoint
  `636c192`; Dev-team self-close per Amendment v1.3 §13. FE-BUY-04..09 also ✅ Closed — SEVEN
  milestones this session, no kickoff-approval pause per owner directive.)_
- **Current Page:** _(none — 18 buyer view files remediated: FZ-02/03/04/05/06/08/10/11 from
  `BUYER_FRONTEND_FREEZE_REPORT_v1.0.md` §6; FZ-01/FZ-09 confirmed untouched (cross-team). New
  buyer Tier-2 `Callout` composition; two of the freeze report's own file-count claims corrected
  after independent re-verification [§13]. A pre-existing, out-of-scope shell a11y bug
  (`quick-create.tsx` QuickCreate button-name <640px) discovered during this milestone's own axe
  sweep and escalated, not fixed unilaterally — `execution-board.md` agenda #11)_
- **Pipeline stage:** idle — Team-2 queue exhausted except the owner-gated item below
- **Next Milestone:** none pullable. FE-BUY-10 🅿 parked (P-BUY-03/04 route topology + P-BUY-05
  favorites scope — owner decision needed)

## Team-3 — Vendor (FE-VEN)

- **Current Milestone:** _(none — `FE-VEN-04` remainder (Catalog) ✅ **Closed**, RV-0110, A:PASS ∧
  B:PASS, 0 BLOCKER/MAJOR/MINOR both lanes, 21 OBS total, one fix-and-reverify cycle [1 MINOR
  textarea token drift, raised → fixed → re-verified], checkpoint `4b4dc5c`; Dev-team self-close
  per Amendment v1.3 §13)_
- **Current Page:** _(none — P-VND-09 `4b4dc5c` Spec library shipped: new route
  `workspace/company/spec-library`, `SpecLibraryList`/`SpecEntryDialog` against the frozen
  `create/update_spec_library_entry.v1` pair; FE-VEN-04 Catalog now fully closed — 07/08/11
  legacy, 09 this milestone, 10 stays ⛔)_
- **Pipeline stage:** idle
- **Next Milestone:** FE-VEN-09 ⛔ · FE-VEN-10/11/12 at Board kickoff scoping

---

## Review Team 4 — Architecture & Governance (A lane) — queue

_(A-lane clear — `FE-PUB-03` (RV-0111), `FE-VEN-04` (RV-0110), `FE-BUY-07` (RV-0112) all cleared A
  and closed. Nothing currently awaiting Review-A.)_

## Review Team 5 — Quality & Adversarial (B lane) — queue

_(B-lane clear — nothing at 🔵B awaiting Review-B.)_

- **`FE-PUB-03` Vendor Profile** (Team-1) — Review-B **PASS** (RV-0111, 0 B/M/M, 8 OBS, `1275f70`;
  render D/T/M + axe 0 mobile/desktop; sticky-bar no-occlusion + dup-control clean) → Team-1 self-close.
- **Post-verified (owner "Team-5 post-verifies each" ruling — mode-B, self-B'd + closed by the
  parallel session, Team-5 independently concurred read-only, no defect):** FE-VEN-04 (RV-0110, same
  textarea MINOR reached independently + `4b4dc5c` fix faithful), FE-BUY-07 (RV-0112, MAJOR caption
  grep-confirmed gone, rationale in comments-only), FE-BUY-08 (RV-0113, no coined enum, R7 counts
  wired-not-derived, clone = rule-of-three OBS not MINOR), FE-BUY-09 (RV-0114 CRM, zero-diff audit;
  Inv#11 blacklist-undetectable + Inv#6 firewall re-confirmed by grep — status only in CRM detail,
  every other surface's "blacklist" mention is a non-disclosure comment), FE-BUY-05 (RV-0108), FE-BUY-06 (RV-0109 Award).
- _Prior full-B (routed to Team-5): FE-PUB-02 (RV-0107). Earlier closed: FE-BUY-04 (RV-0102),
  FE-VEN-06/07/08/13 (RV-0103/0104/0105/0106)._

- **Standing backlog:** Step-3 Public Shared Promotion baseline sweep — ✅ **DONE / PASS
  2026-07-02** (SHA `6007ea1`; 0 B/M/M; report
  `governanceReviews/REVIEW-TEAM-5-STEP-3-PUBLIC-BASELINE-SWEEP_v1.0.md`). 4 within-public promotion
  candidates + kit `Textarea` gap **raised → Board** (Raise≠Accept). **FE-PUB-02 S-dependency
  satisfied — Team-1 unblocked.** · Next: Step 4 → FE-CLN-06 · Step 5 → FE-CLN-07

## Architecture Board — queue

- **Standing agenda:** [`execution-board.md`](execution-board.md) §Board standing agenda (10 items)
