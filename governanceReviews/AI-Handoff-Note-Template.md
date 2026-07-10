<!--
Doc-type:  Governance companion — operational template (NON-authoritative). Realizes the
           AI Engineering Organization v1.0 §4 suspension/reactivation handoff note (P1 follow-up,
           Board decision BOARD-DECISION-AI-ENG-ORG_v1.0.md item 5).
Directive: Team-8 authors · Board approves. Coins nothing; operationalizes ratified governance only.
-->

# AI Handoff Note — Template v1.1

| Field | Value |
|---|---|
| **Document type** | Operational template · non-authoritative under the frozen corpus |
| **Realizes** | `project-management/ai-engineering-organization-plan.md` (v1.0 — Ratified) §4 (SUSPENDED state + reactivation) · §9 rules 7–8 |
| **Companion to** | `AI-Activation-Packet-Template.md` (§7 REACTIVATION DELTA carries this note) · `AI-Completion-Report-Template.md` (Outcome: SUSPENDED attaches this note) |
| **Status** | **RATIFIED v1.1** — v1.0: Board close of RV-0142 (owner, 2026-07-09); v1.1: additive amendment per the owner's **WP-GOV-B fold-forward ruling** (Option A APPROVED, 2026-07-09) — see Amendment log |
| **Maintained by** | Team-8; changes = additive amendment + version bump |
| **Rule** | Written for a **stateless successor**: a fresh context that has the original packet, this note, and the repo — and nothing else. Anything not written here or committed does not exist. |

**Depends on:** AI Engineering Organization v1.0 (`project-management/ai-engineering-organization-plan.md`)
· `BOARD-DECISION-AI-ENG-ORG_v1.0.md` · CLAUDE.md (§8 · §11 · §13).

**Related governance:** [`AI-Activation-Packet-Template.md`](AI-Activation-Packet-Template.md)
(reactivation = original packet + this note) · [`AI-Completion-Report-Template.md`](AI-Completion-Report-Template.md)
(a SUSPENDED outcome attaches this note) · [`TEAM-6-Security-Review-Charter.md`](TEAM-6-Security-Review-Charter.md)
(a Team-6 BLOCKER is a common suspension cause).

> **Purpose.** The suspension artifact. When an active role hits a hard blocker (⛔ ESC handle,
> missing dependency, Flag-and-Halt, owner ruling pending), it writes this note into the owning
> tracker, and its context is **discarded** — parked work costs zero (org plan §4). Reactivation
> is always a **new** context briefed with the original packet **plus this note** — never a
> resumed transcript. The note lives in the owning tracker (backend: the WP's row/notes in
> `backend_execution_tracker.md` or the WP card; FE: the team file / WP card), following the
> derivation chain — it is a tracker record, not a chat message.

---

## The template

```markdown
# HANDOFF NOTE — <role> · <work-item ID> · SUSPENDED <yyyy-mm-dd>

## 0. Header
- **Role / Work item:**   <Team-N | Agent Mx> · <WP/milestone ID> · packet: <ref>
- **Checkpoint SHA:**     <last committed SHA — ALL surviving work is committed at or before it;
                           uncommitted work is lost by design> · branch: <feat/…>
- **Tracker row set to:** ⛔ | 🅿 (with this note referenced)

## 1. Current state
<where in the task's ladder the work stopped — e.g. "playbook §3 ladder step 4 of 8: contracts/ +
domain/ done, application/ half-built, no api/ yet" — one glance tells the successor what phase
it resumes into>

## 2. Completed work
<verifiable list: files committed (grouped) · migrations applied · suites green at the SHA ·
decisions already made within packet scope (state them — the successor must not re-decide)>

## 3. Blocker
- **Exact blocker:**      <the handle/ruling/dependency, by name — e.g. "[D-5] Outbox Audit
                           Granularity, Board-pending" · "ESC-… undisposed" · "Flag-and-Halt:
                           <frozen doc §> vs <observed>, both cited">
- **Why it hard-stops:**  <one sentence — why building around it is not allowed/possible>
- **Escalation filed:**   <Board packet / ESC registry entry / agenda item — path or ID>

## 4. Dependency
<what must happen, by whom, before resume — e.g. "Owner rules [ESC-…]" · "W2-IDN-2 seed must be
✅ (this WP reads the slug catalog)" · "none beyond §3's ruling">

## 5. Next action (first thing the successor does)
<the single concrete first step on resume — e.g. "apply the ruled audit-granularity leg to
infrastructure/events/dispatcher per the [D-5] disposition, then re-run 8B observer">

## 6. Resume instructions
- **Reactivation packet =** original packet + this note + <the ruling/unblock artifact, by pointer>
- **Files to re-read first:** <the ≤3 files whose state the successor must load before coding>
- **Re-verify at resume (do NOT trust this note for these):** <cross-package state that may have
  moved while parked — e.g. "tracker row deps," "whether the sibling contract changed," "current
  wave gate"> 
- **Known traps:** <anything the suspended agent learned the hard way that isn't visible in the
  diff — or "none">

## 7. Context-destruction attestation
- This context is discarded on filing; nothing survives it except this note, the checkpoint SHA,
  and the tracker records (org plan §4 binding context-destruction rule · §9 r6–r8): **CONFIRMED**

*Board-ratified permanent section (owner/Board approval of WP-GOV-B, 2026-07-09) — verbatim;
confirmed for the work performed before suspension.*

## Frozen Authority Checklist

Before execution, the assignee confirms:

□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
```

---

## Rules of use (from the ratified plan — restated as operating steps, not new policy)

1. **Suspend instead of wait** (org plan §9 rule 7): any blocker needing the owner, a gate, or an
   upstream dependency → write this note → context discarded → coordinator pulls the next
   unblocked item. No idle context ever waits on a ruling.
2. **Commit before suspending.** The checkpoint SHA bounds the surviving work (checkpoint-commit
   discipline); a note pointing at uncommitted work is defective.
3. **State the decisions, not the story.** The successor needs conclusions ("chose X within packet
   scope because Y"), never the exploration narrative.
4. **The note is the only memory** (org plan §8): reactivation is a new context; nothing from the
   suspended conversation survives except what this note and the repo carry.
5. **Re-verify list is mandatory.** Parked time is state-drift time; the note names what to
   re-check rather than asserting it will still hold.
6. **One note per suspension.** A re-suspension writes a **new** note (append-only thinking);
   notes are never edited after the context that wrote them is gone.

---

## Amendment log

- **v1.1 (2026-07-09)** — additive amendment per the owner's **WP-GOV-B fold-forward ruling**
  (Option A APPROVED): Frozen Authority Checklist embedded in the form (Board-ratified verbatim,
  2026-07-09) · new §7 context-destruction attestation (org plan §4 · §9 r6–r8 — the one
  plan-required slot the v1.0 form carried only as a rule of use). Form validated against the
  real `governanceReviews/milestones/w2-idn-2/HANDOFF-NOTE.md` instance during WP-GOV-B. Source:
  the WP-GOV-B second-generation drafts, retired on fold.
- **v1.1 patch (2026-07-09 — RV-0151 fix-forward)** — H1 version designator aligned to the
  Status row (F1).

*Non-authoritative operational template. Conforms upward; coins nothing. State semantics come from
the ratified org plan §4; the template adds no rule the plan does not already state.*
