# Board Decision — AI Engineering Organization: Ratification v1.0

**Date:** 2026-07-08 · **Decided by:** Human owner (Architecture Board — owner decides, Claude
prepares) · **Status:** RATIFIED · **Record class:** append-only Board decision record.

## Decision

The owner ratified `project-management/ai-engineering-organization-plan.md` at **v1.0 — Ratified
Execution Governance** (owner's words: "STATUS: APPROVED FOR RATIFICATION", 2026-07-08), closing
the plan's Appendix A adoption checklist. The plan now governs **execution** program-wide. It
remains non-authoritative under the frozen corpus (CLAUDE.md §7, §11): it governs who works, how
roles activate, and how work flows — never architecture.

## What was ratified (plan Appendix A, items 1–8)

1. The **9-Core-Team structure** — Team-1/2/3 FE lanes (Public / Buyer / Vendor+Admin), Team-4
   Review-A, Team-5 Review-B/QA (with the Performance lens folded in; Doc-8 still owns budgets),
   Team-6 Security gate, Team-7 Backend, Team-8 Documentation & AI Support, Team-9 DevOps/Release.
   Numbering is fully compatible with the live FE-PM ledger (2026-07-02 cutover) — no renumber.
2. The **Team-7 Module-Agent model** — 10 stateless Module Agents (M0–M9), one per frozen module,
   activated only by the Backend-Lead hat; shared charter + per-module specializations (plan §3).
3. The **runtime activation model** — logical roles, zero-cost dormancy, activation packets,
   completion reports, suspension via handoff notes, binding context-destruction rule (plan §4, §9).
4. The **concurrency ceiling** — default 1 active worker context, peak 2 independent builders in
   worktrees, absolute 3 without explicit owner opt-in (plan §10).
5. **Commissioning** of the activation-packet / completion-report / handoff-note templates and the
   Team-6 Security standing-prompt charter → dispatched as a **P1 follow-up work item** (Team-8 +
   Board); it gates the first backend activation under this model but did not gate ratification.
6. The **Performance-lens fold** into Team-5 (no separate performance team).
7. The **cost-aware model-routing policy** (plan §6.10) and **packet size limits** (≤5 documents ·
   ≤15 files · ~20k input tokens, plan §8) as operating defaults.
8. Version bump to **v1.0** + reference from `project-management/README.md` (executed with this
   record).

Review round R1 (5 MINOR + 4 NIT, all accepted) is dispositioned in the plan's Appendix B per
CLAUDE.md §13 — no finding conflicted with the frozen corpus; no Flag-and-Halt was required.

## Additive charter amendment (carried by this record — charter files untouched)

The FE-PM charters (`REVIEW-TEAM-A-CHARTER_v1.0.md` + Team-4 amendments v1.1/v1.2,
`REVIEW-TEAM-5-CHARTER_v1.0.md`) and the FE-PM office (`project-management/README.md`,
`review-process.md`) **now operate within the ratified organization plan**:

- Team-4 and Team-5 keep their charters, lanes, verdicts, and jurisdiction **unchanged**; the plan
  extends their scope from the FE presentation stream to the **full program** (backend modules
  M0–M9, wiring, security-adjacent items) under the same Raise ≠ Accept / stable-target /
  fresh-context rules.
- The FE-PM "Program Manager" and the plan's **AI Engineering Orchestrator** are the **same single
  long-lived role** (plan §1 single-coordinator rule); no ledger rename is implied or performed.
- Where the plan and an FE-PM charter both speak, the **more specific charter wins for FE review
  mechanics**; the plan wins for program-wide runtime/activation/concurrency policy. Conflicts
  neither resolves → Board.

This section discharges plan Appendix A item 8's "charters get an additive amendment pointing
here" without editing any frozen-at-cutover charter file (append-only convention).

## Binding effects from this date

- Exactly **one long-lived AI session** (the Orchestrator); every other role activates statelessly
  per the plan's lifecycle and is destroyed on completion — never resumed.
- Backend work is coordinated **only** through the Backend-Lead hat; Module Agents never
  self-activate; cross-module work splits at the contract/event seam.
- Dispatch is by **P0–P3 priority**, never plain FIFO; priority never bypasses a gate.
- Wave gates, review gates (B/M/M = 0), the Red-Flag Checklist, and all frozen-corpus authority
  are untouched by this ratification and continue to bind.

**Amendments to the ratified plan:** additive patch + version bump only, owner-approved.
