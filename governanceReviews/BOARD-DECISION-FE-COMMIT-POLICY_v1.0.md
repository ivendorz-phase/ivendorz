<!--
Doc-type:  Board Decision Record (process governance; NON-authoritative under the frozen corpus).
Directive: Architecture Board, 2026-07-02. Scope: FE presentation program commit policy only.
NOTE: this is a Board/process decision record, NOT an ADR — the ADR Compendium is frozen rank-1
(CLAUDE.md §7) and creating/modifying ADRs exceeds AI authority (§8). Nothing here touches
architecture.
-->

# Board Decision — FE Program Commit Policy v1.0

## Decision

For the frontend presentation program under FE Program Management v1.0, the commit policy changes
from **commit-on-approval** (one commit per approved page, the RV-0001..0100 loop rule) to:

1. **Per-page checkpoint commits** while a milestone is 🟡 In Progress —
   `feat(FE-XXX-NN): P-YYYY <summary> [checkpoint]` after each page passes its page-standards.md
   DoD self-check and its changelog line is appended.
2. **Milestone-close commit** after Board approval —
   `milestone(FE-XXX-NN): close — RV-00NN A:<verdict> B:<verdict> board-approved`.

## Rationale

- Milestones are **multi-page**; the stable-target rule (QCT charter, 2026-07-01 amendment)
  **requires a named SHA** for Review A/B to review — an uncommitted multi-page tree cannot be
  reviewed under that rule.
- Losing multi-page work in an uncommitted working tree is the greater risk.
- Checkpoint commits contain work that is **not yet Board-approved** — this is the explicit,
  consciously-accepted trade; the milestone-close commit remains the approval record.

## Scope & limits

- Applies to the **FE presentation program only**. Backend/wave work keeps its own governance
  (`Build_Roadmap_v1.0.md`, Wave Execution Lifecycle).
- **Gated pages are never committed** (⛔ ESC-gated scope stays out of the tree).
- Never push unless the owner asks (standing rule, unchanged).
- Supersedes the loop rule recorded in the pre-cutover `project-management/README.md` and the
  "commit approved page before next" convention — for this program only, from the Phase-A commit
  onward.

## Sign-off

**Ratified by the owner (human Architecture Board) via approval of the FE Program Management
cutover plan v6, 2026-07-02** — the plan carried this decision as an explicitly-flagged governance
change (5th-review MAJOR finding "commit-policy needs its own decision record", accepted), and the
plan-approval gate is owner-only under the Board pen split.

---

*Non-authoritative process decision. Conforms upward; on any conflict the frozen corpus wins (§7).*
