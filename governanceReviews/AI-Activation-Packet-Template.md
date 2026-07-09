<!--
Doc-type:  Governance companion — operational template (NON-authoritative). Realizes the
           AI Engineering Organization v1.0 §8 activation packet (P1 follow-up, Board decision
           BOARD-DECISION-AI-ENG-ORG_v1.0.md item 5).
Directive: Team-8 authors · Board approves. Coins nothing; operationalizes ratified governance only.
-->

# AI Activation Packet — Template v1.1

| Field | Value |
|---|---|
| **Document type** | Operational template · non-authoritative under the frozen corpus |
| **Realizes** | `project-management/ai-engineering-organization-plan.md` (v1.0 — Ratified) §4 (lifecycle) · §5 (orchestration) · §8 (packet structure + size limits) · §9 (activation rules) |
| **Status** | **RATIFIED v1.1** — v1.0: Board close of RV-0142 (owner, 2026-07-09); v1.1: additive amendment per the owner's **WP-GOV-B fold-forward ruling** (Option A APPROVED, 2026-07-09) — see Amendment log |
| **Maintained by** | Team-8 (Documentation & AI Support); changes = additive amendment + version bump |
| **Rule** | The packet **points, never restates** (CLAUDE.md §11). A packet that copies frozen content instead of citing it is defective. On any conflict the frozen corpus wins — Flag-and-Halt. |

**Depends on:** AI Engineering Organization v1.0 (`project-management/ai-engineering-organization-plan.md`)
· `BOARD-DECISION-AI-ENG-ORG_v1.0.md` · CLAUDE.md (§7 authority · §8 AI rules · §11 working rules ·
§13 Review & Findings Governance).

**Related governance:** [`AI-Completion-Report-Template.md`](AI-Completion-Report-Template.md) (the
output of every activation) · [`AI-Handoff-Note-Template.md`](AI-Handoff-Note-Template.md)
(suspension; carried back via §7) · [`TEAM-6-Security-Review-Charter.md`](TEAM-6-Security-Review-Charter.md)
(the gate a security-surfaced packet pre-flags in §5).

> **Purpose.** The one standard briefing used to activate **any** AI role — a Core Team (1–9) or a
> Backend Module Agent (M0–M9). One packet = one activation = one task = one fresh context
> (org plan §4). The activated role reads **only** what the packet names. The coordinator (the AI
> Engineering Orchestrator, or its Backend-Lead hat for Module Agents) authors the packet;
> **no role authors its own packet.**

---

## Size limits (org plan §8 — binding at dispatch, whichever is reached first)

| Dimension | Maximum |
|---|---|
| Document pointers (distinct documents) | **5** |
| Source + contract files (sections 3 + 4 combined) | **15** |
| Total input budget (packet + everything it names) | **~20k tokens** |

A packet authored over any limit **fails coordinator self-review** — split the task at a natural
seam (sub-scope, layer, or contract boundary) into sequential activations before dispatch
(org plan §9 rule 14). An *active* agent that legitimately needs one unlisted file reads the
minimum and records the packet gap in its Completion Report §10.

**Counting-unit disclosure (v1.1):** the proven Wave-2 packets cite up to 6–8 *distinct files*
inside ≤5 *document pointer rows* (method-dependent count — WP-GOV-B dry-fill evidence,
2026-07-09; the per-packet count table travels with the Board clarification item). Until the
Board clarifies plan §8's counting unit, the §0 attestation discloses **both** counts; the
~20k-token input budget remains the hard ceiling either way.

---

## The template

```markdown
# ACTIVATION PACKET — <role> · <work-item ID>

## 0. Header
- **Role activated:**        <Team-N | Agent M0…M9> (charter: <pointer — org plan §2/§3 entry, or team charter file>)
- **Work item:**             <WP/milestone ID, e.g. W2-CORE-1 · FE-XXX-NN> · WP card: <path>
- **Depends on:**            <each dependency + tracker status, e.g. W2-IDN-3 ✅ — gates checked per org plan §5 ③>
- **Priority / Lane:**       P0–P3 (org plan §5) · Lane G|L (review-process.md §2, where applicable)
- **Model class:**           lightweight | medium | advanced | highest (org plan §6.10)
- **Worktree:**              none | <path> (required if any parallel activation mutates files, §9 r10)
- **Activation type:**       FIRST | REACTIVATION (if REACTIVATION → §7 carries the handoff note)
- **Date · Packet author:**  <yyyy-mm-dd> · Orchestrator (Backend-Lead hat: yes|no)
- **Packet-size attestation:** <k> document pointer rows / <n> distinct files · §3+§4 files: <m> ·
                             est. input ~<t>k tokens — within limits: YES | NO → split (never ship oversized)

## 1. TASK
- **Objective:**             <one sentence — what done looks like>
- **In scope:**              <explicit list>
- **Out of scope:**          <explicit list — additions here are a Review-A finding, not a bonus>
- **Acceptance criteria:**   <from the WP card — verifiable, incl. required Doc-8 bands where backend;
                             suite baseline at dispatch: <N tests / M files> — "resolve at dispatch" if queued behind a moving tree>
- **Binding carries (inbound):** <every obligation minted for THIS WP by a prior review / tracker
  row / ESC / Board record — source (RV-#### / row / handle) · obligation (pointer or verbatim
  quote) · class: acceptance-criterion | fold-in — or "None" (stated explicitly: checked, not omitted)>

## 2. DOCUMENTS  (pointers ONLY — path + section; ≤5 documents — dual count attested in §0)
   <every FROZEN pointer carries the fixed instruction: **RE-READ VERBATIM — never trust a
   paraphrase, including this packet's** (RV-0150 NIT-1); no summary prose beside a frozen
   pointer — a packet that restates frozen content is defective (CLAUDE.md §11). The role
   charter is already bound in §0 — never spend a document row on it.>
1. <owning authority doc + §, e.g. Doc-4C §C3 · Doc-6C §6.2a>
2. <cross-cutting standard in scope, e.g. Doc-4A envelope · Doc-5A §6.2>
3. <execution reference, e.g. backend_execution_playbook.md §5 W2-IDN-3>
…

## 3. CONTRACTS  (exact files — own module + any consumed sibling contracts/)
- <src/modules/<module>/contracts/…>
- <consumed: src/modules/<other>/contracts/… — consume only, never edit>

## 4. CODE  (exact source files/dirs in scope; §3+§4 combined ≤15 files)
- <files/dirs the task touches or must read>

## 5. CONSTRAINTS
- **Standing charter binds** (not restated): org plan §3 shared charter (Module Agents) or §2
  team entry (Teams) — Never-list violations are Review-A BLOCKERs.
- **Team-6 pre-flag:** YES — <security surface, named> | N/A — no security surface (+ re-flag
  condition). The Completion Report's readiness section must match or explain (org plan §2 T6 trigger).
- **Open gates/ESC on this scope:** <e.g. [D-5] Board-pending · [DC-1] no identity events ·
  [ESC-…] — with the exact behavior required: build around / gate / carry on channel>
- **Task-specific constraints:** <anything the WP card adds — e.g. "contract-first ladder,
  playbook §3" · "audited-write per REFERENCE_Audited_Write_Pattern_v1.0.md" · "presentation-only">
- **Halt condition:** any corpus conflict or Red-Flag item → Flag-and-Halt via Handoff Note;
  never resolve locally (CLAUDE.md §11).

## 6. EXPECTED OUTPUTS
- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (always).
- <artifacts: code at a checkpoint SHA · migration · seed · suite results · review verdict + RV
  entry (review roles) · doc delta (Team-8) — as the role's charter defines>
- Self-check gates to run before handoff: </ivendorz-security | /fe-checklist | /review-a-lens |
  band list — per role>

## 7. REACTIVATION DELTA  (only when Activation type = REACTIVATION)
- Handoff note: <path/pointer into the tracker — per AI-Handoff-Note-Template.md>
- Ruling/unblock since suspension: <e.g. the Board's [ESC-…] disposition, verbatim pointer>
- **Re-verify at resume:** <cross-package state that may have moved while parked>

*Board-ratified permanent section (owner/Board approval of WP-GOV-B, 2026-07-09) — verbatim.*

## Frozen Authority Checklist

Before execution, the assignee confirms:

□ All cited documents are frozen.
□ Every cited section has been re-read verbatim.
□ No draft document is treated as authority.
□ Any uncertainty results in Flag-and-Halt.
```

---

## Authoring rules (coordinator self-review before every dispatch)

1. **One owner.** The task sits inside exactly one module/lane (CLAUDE.md §3; org plan §5 step ②).
   Spans two → split at the contract/event seam first; never dispatch a two-module packet.
2. **Gates checked** before authoring: wave open · ESC handles cited with required behavior ·
   WP card exists · security/perf surface pre-flagged for the later gates (org plan §5 step ③).
3. **Pointers, never prose.** If a section restates frozen content instead of citing it, cut it.
   Discovery ("which files matter") is done **here, once** — never re-done by the agent.
4. **Limits hold** (table above). Over → split, never ship oversized.
5. **Variable-last ordering.** Standing text (role, charter pointer) first; task-specific content
   last (org plan §7.8 prompt-cache alignment).
6. **Expected outputs are checkable.** If the coordinator can't validate the Completion Report
   against §1/§6 mechanically, the packet is under-specified.
7. **Baseline at dispatch.** §1's suite baseline is the actual green count when the packet fires;
   a WP queued behind a moving tree carries "resolve at dispatch" and the coordinator fills it at
   dispatch (RV-0143 close refinement; WP-GOV-B dry-fill fix).
8. **Backend test tasks carry their environment.** Name the DB-bootstrap step; a fixture-creating
   test task pre-lists the owning service + migration; a POLICY-touching task points the Doc-4A
   §18.2 reference form (RV-0143 close — Team-8 refinement queue, folded here).

---

## Amendment log

- **v1.1 (2026-07-09)** — additive amendment per the owner's **WP-GOV-B fold-forward ruling**
  (Option A APPROVED): Frozen Authority Checklist embedded in the form (Board-ratified verbatim,
  2026-07-09) · §0 Depends-on line + dual-count packet-size attestation · §1 baseline-at-dispatch
  + inbound binding-carries slot · §2 RE-READ-VERBATIM instruction, no-prose-beside-frozen-pointers,
  charter-row dedup (RV-0150 NIT-1) · §5 Team-6 pre-flag line · authoring rules 7–8 (RV-0143-close
  Team-8 refinement queue) · counting-unit disclosure (Board clarification pending). Source: the
  WP-GOV-B second-generation drafts (validated by the W2-IDN-6.1 dry-fill), retired on fold.
- **v1.1 patch (2026-07-09 — RV-0151 fix-forward)** — H1 version designator aligned to the
  Status row (F1) · counting-unit figure made method-neutral (OBS-5) · disclosure: §2's heading
  parenthetical was extended in place — section number, name, and anchor preserved (NIT-2).

*Non-authoritative operational template. Conforms upward; coins nothing. Field semantics come from
the ratified org plan §8; the template adds no rule the plan does not already state.*
