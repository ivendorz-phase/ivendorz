<!--
Doc-type:  Governance companion — operational template (NON-authoritative). Realizes the
           AI Engineering Organization v1.0 §8 completion report (P1 follow-up, Board decision
           BOARD-DECISION-AI-ENG-ORG_v1.0.md item 5).
Directive: Team-8 authors · Board approves. Coins nothing; operationalizes ratified governance only.
-->

# AI Completion Report — Template v1.0

| Field | Value |
|---|---|
| **Document type** | Operational template · non-authoritative under the frozen corpus |
| **Realizes** | `project-management/ai-engineering-organization-plan.md` (v1.0 — Ratified) §4 (completion) · §8 (report structure) · §9 rule 6 (destroy on completion) |
| **Companion to** | `AI-Activation-Packet-Template.md` (the input this is the output of) · `AI-Handoff-Note-Template.md` (used instead of §11 when the outcome is SUSPENDED) |
| **Status** | **RATIFIED v1.0** — Board close of RV-0142 (owner, 2026-07-09); changes henceforth = additive amendment + version bump |
| **Maintained by** | Team-8; changes = additive amendment + version bump |
| **Rule** | Facts only, tersely; no narrative. "None"/"zero" answers are stated **explicitly** — an omitted section reads as "not checked," never as "nothing to report." |

**Depends on:** AI Engineering Organization v1.0 (`project-management/ai-engineering-organization-plan.md`)
· `BOARD-DECISION-AI-ENG-ORG_v1.0.md` · CLAUDE.md (§8 · §11 · §13).

**Related governance:** [`AI-Activation-Packet-Template.md`](AI-Activation-Packet-Template.md) (the
input this reports against) · [`AI-Handoff-Note-Template.md`](AI-Handoff-Note-Template.md)
(attached when Outcome = SUSPENDED) · [`TEAM-6-Security-Review-Charter.md`](TEAM-6-Security-Review-Charter.md)
(§11 Readiness routes security-surfaced items to it).

> **Purpose.** The single thing every AI role returns when its activation ends. The coordinator
> validates it against the packet's §1 TASK and §6 EXPECTED OUTPUTS, records it in the owning
> tracker, and then the context is **destroyed** (org plan §4 context-destruction rule). Everything
> a future activation will ever know about this work must therefore be in this report, the code,
> and the trackers — not in the conversation.

---

## The template

```markdown
# COMPLETION REPORT — <role> · <work-item ID>

## 0. Header
- **Role / Work item:**    <Team-N | Agent Mx> · <WP/milestone ID> · packet: <ref>
- **Outcome:**             COMPLETE | SUSPENDED (→ attach Handoff Note, skip §11) | REVIEW-VERDICT
- **Checkpoint SHA:**      <named SHA — the stable review target> · branch: <feat/…>

## 1. Summary
<2–4 sentences: what was built/reviewed and the result. Written for the coordinator, who did not
watch the work.>

## 2. Files changed
<full list, path per line, grouped added/modified/deleted — or "None (read-only activation)">

## 3. Contracts changed
<module contracts/ files touched + what changed at the surface — or "None."
Reminder: a contract change is Doc-4A-governed and owned by this module only.>

## 4. Migrations
<migration dirs added, forward-only confirmation, apply-clean result — or "None">

## 5. Events
<events emitted, each bound by pointer to Doc-2 §8 — or "Zero (frozen truth for this module:
M0/M1 emit no §8 events)". Anything not in the 26-name catalog is invented → this section is
where that failure surfaces.>

## 6. Tests
<Doc-8 bands run (8B/8C/8D/8E/8F/8G) · suite results with counts · run environment (local
ephemeral tx DB while WP-1.9 is parked) — or the review-role equivalent: routes rendered,
checks executed>

## 7. Self-review
- Self-check gates run + results: </ivendorz-security · /fe-checklist · /review-a-lens · …>
- Red-Flag scan (CLAUDE.md checklist): CLEAR | <item → this report becomes a Flag-and-Halt>
- Standing-charter Never-list: no violation | <violation found + where>
- tsc / lint / prettier: <green | findings>

## 8. Open questions / ESC
<ESC handles raised or cited (with channel + required Board action) · packet ambiguities that
needed a judgment call (state the call made) — or "None">

## 9. Checkpoint
<the commit(s) made, conventional-commit messages, and what each checkpoint bounds>

## 10. Packet gaps
<files read beyond the packet's §3/§4 list + why — feeds Team-8's template/packet maintenance
(org plan §8 hygiene rules) — or "None; packet was sufficient">

## 11. Readiness
- **Next gate:** Review-A at <SHA> | Review-B (A passed) | Team-6 (security surface: yes/no —
  if yes, name the surface) | Board (finding/ESC pending) | merge-ready (all gates PASS, B/M/M=0)
- **Blocked on:** nothing | <handle — then Outcome must be SUSPENDED + Handoff Note>
- **Suggested next work item** (optional, coordinator decides): <…>
```

---

## Validation rules (coordinator, on receipt — before the context is destroyed)

1. **§1/§6-of-packet check:** every acceptance criterion and expected output is either delivered
   or accounted for in §8/§11. A silent miss = reactivate with the delta, not "close and hope."
2. **Explicit-none check:** §§2–6, 8, 10 each present, "None"/"Zero" stated where applicable.
3. **Anti-invention check:** §5 events ⊆ Doc-2 §8 catalog · §3 contracts within the owning module
   · no new audit action, slug, state, or POLICY key anywhere in §2's diff.
4. **Gate routing:** §11's next gate matches the packet's pre-flagged surfaces (a security surface
   flagged at dispatch cannot be "N/A" at completion without explanation).
5. **Record then destroy:** report lands in the owning tracker (backend: `backend_execution_tracker.md`
   row; FE: team file + execution-board), the checkpoint SHA is queued for review, and the worker
   context is destroyed — never held (org plan §9 rule 6).

---

*Non-authoritative operational template. Conforms upward; coins nothing. Section semantics come
from the ratified org plan §8; the template adds no rule the plan does not already state.*
