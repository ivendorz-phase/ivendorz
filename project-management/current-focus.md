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

## Team-2 — Buyer (FE-BUY)

- **Current Milestone:** _(none — `FE-BUY-08` Dashboard Widgets ✅ **Closed**, RV-0113, A:PASS ∧
  B:PASS, 0 BLOCKER/MAJOR/MINOR, 12 OBS, checkpoint `d501345`; Dev-team self-close per Amendment
  v1.3 §13. FE-BUY-04/05/06/07 also ✅ Closed — FIVE milestones this session, no kickoff-approval
  pause per owner directive)_
- **Current Page:** _(none — Engagement pipeline widget shipped alongside BX-01's Sourcing
  pipeline on P-BUY-01, following the identical `RV-0070` governance pattern; a `PipelineCard`
  promotion candidate registered [watch for a 3rd funnel widget])_
- **Pipeline stage:** idle — pulling `FE-BUY-09` CRM next (WP card pending kickoff)
- **Next Milestone:** FE-BUY-09 → FE-CLN-01 (F2-Z). FE-BUY-10 🅿 parked

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
  grep-confirmed gone, rationale in comments-only), FE-BUY-05 (RV-0108), FE-BUY-06 (RV-0109 Award).
- _Prior full-B (routed to Team-5): FE-PUB-02 (RV-0107). Earlier closed: FE-BUY-04 (RV-0102),
  FE-VEN-06/07/08/13 (RV-0103/0104/0105/0106)._

- **Standing backlog:** Step-3 Public Shared Promotion baseline sweep — ✅ **DONE / PASS
  2026-07-02** (SHA `6007ea1`; 0 B/M/M; report
  `governanceReviews/REVIEW-TEAM-5-STEP-3-PUBLIC-BASELINE-SWEEP_v1.0.md`). 4 within-public promotion
  candidates + kit `Textarea` gap **raised → Board** (Raise≠Accept). **FE-PUB-02 S-dependency
  satisfied — Team-1 unblocked.** · Next: Step 4 → FE-CLN-06 · Step 5 → FE-CLN-07

## Architecture Board — queue

- **Standing agenda:** [`execution-board.md`](execution-board.md) §Board standing agenda (10 items)
