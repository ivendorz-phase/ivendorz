<!--
Doc-type:  Team Charter AMENDMENT (program org; NON-authoritative). Additive amendment to TEAM-4-QCT-CHARTER_v1.0.md — the v1.0 text is NOT edited (append-only governance).
Directive: Architecture Board, 2026-07-02 — FE Program Management v1.0 cutover (plan v6, Board-ratified). Companion: REVIEW-TEAM-A-CHARTER_v1.0.md.
-->

# Team 4 QCT Charter — Amendment v1.1: Redesignation as Review Team B

**Directive (Architecture Board, 2026-07-02):** with the FE program's move to milestone-driven
Frontend Program Management, **Team 4 (QCT) is redesignated Review Team B — Quality & Adversarial
Review**. This amendment is **additive**: the v1.0 charter (mandate, severity ladder, gate,
stable-target rule, Raise ≠ Accept, boundaries) continues in force except where amended below.

## 1. Redesignation & continuity

- Team 4 QCT → **Review Team B (Quality & Adversarial)**. Continuity is total: the RV-#### ledger,
  the §13 severity ladder, the **gate BLOCKER 0 · MAJOR 0 · MINOR 0**, the stable-target rule
  (v1.0 2026-07-01 amendment), and Raise ≠ Accept all carry forward unchanged.
- **Independence (binding, new):** Review B runs in a **fresh agent context** — no shared working
  memory with the builder or with Review A. Sequential passes inside one context do not satisfy
  the A→B pipeline.

## 2. Position in the pipeline

Review B reviews **after Review Team A returns a pass-class verdict** — never in parallel, never
first. In **Lane L** (light lane, `project-management/review-process.md`) a single fresh-context
review covers both A and B checklists.

## 3. Jurisdiction carve-out (prevents double review — the concern the v1.0
sequencing amendment was written for)

- v1.0 responsibilities **1 (cross-team architecture reviews)** and **2 (component-duplication
  detection *as an architecture concern*)**, plus promotion shepherding, **transfer to Review
  Team A**.
- Review B **retains** v1.0 responsibilities 3–6 (design-system conformance · accessibility
  audits · responsive verification · governance compliance *as rendered-quality verification*)
  and duplication detection **as a quality symptom** (dead code, parallel copies, drifted
  imports).
- Tie-breaker: an ambiguous finding goes **to A first**. Defense-in-depth: B may still raise a
  governance defect A missed — it is routed back to A, never dropped.

## 4. Checklist additions

Review B's checklist adds: **render verification** (D/T/M, all in-scope routes 200) ·
**screenshots** into `governanceReviews/milestones/<fe-id-slug>/` (existing convention) ·
**visual regression** — screenshot comparison against the milestone folder's prior baseline
(review practice only; no test tooling coined — Doc-8 owns test infrastructure) ·
**cross-team regression** (adjacent surfaces unbroken; shared-file diffs additive) ·
imports/type-safety/lint/prettier verification.

## 5. Verdicts

- **PASS** → milestone → 🟣 Board.
- **ISSUES** → 🟠 Revising; resubmission re-enters at **B** if fixes are pure presentation, at
  **A** if any fix alters scope, contract grounding, or architecture.
- **REGRESSION** → cross-team regression report to the Board; the Board routes it to the owning
  team as a new work item — a closed milestone reopens only by Board decision.

v1.0's "final milestone sign-off before commits" is restated: **B's pass feeds the Board approval
step, which is now the close gate** (`review-process.md`).

## 6. Standing backlog — the v1.0 5-step milestone track, mapped

| v1.0 step | Disposition under FE-PM v1.0 |
|---|---|
| 1. Platform primitives | **Recorded DONE** (PASS WITH PATCH; patches applied) |
| 2. Vendor Shared Extraction | **Recorded DONE** (APPROVED, sign-off filed) |
| 3. Public Shared Promotion | **Standing Review-B baseline sweep** — runs at a stable post-cutover SHA **before FE-PUB-02 starts**; findings feed the FE-PUB-02..07 enhancement packages |
| 4. Full Repository Integration Gate | → milestone **FE-CLN-06** |
| 5. Release Candidate Gate | → milestone **FE-CLN-07** |

---

*Non-authoritative program-org amendment. Conforms upward; coins nothing. Review B raises; the
presiding authority rules (CLAUDE.md §7/§13); architecture-affecting resolutions require human
approval (§8).*
