# docs/backend/ — Backend Build Office

**Status:** Living (mutable) · non-authoritative under the frozen corpus
**Materializes:** the reserved `docs/backend/` area (`docs/README.md` §3 reserved-directory rule)
**Owner:** Engineering (backend) · **AI may edit:** yes
**Navigation:** [`docs/INDEX.md`](../INDEX.md)

---

This folder is the **execution office for the backend build** — the backend analog of the
frontend `project-management/` office. It tracks *how the frozen corpus is realized into code,
wave by wave*. It **coins nothing**: every work package binds a frozen authority by pointer.

**Precedence (reference-never-restate):**

```
Master → ADR → Doc-2/3 → Doc-4A…4M → Doc-5A…5K (API) → Doc-6A…6K (DB) → Doc-8A…8G (test)
        → Development_Decomposition_v1.0 → Build_Roadmap_v1.0 → Code
                                                                  ▲ this folder tracks, never overrides
```

- **Wave sequence + gates:** `generatedDocs/Build_Roadmap_v1.0.md` (authoritative sequence).
- **Work-package template + Build Artifact Checklist:** `generatedDocs/Development_Decomposition_v1.0.md` §3.
- **Live status:** `generatedDocs/Program_Status_And_Roadmap.md`.
- **Per-WP lifecycle:** `Wave_Template_v1.0.md` (CLAUDE.md §13 Validate-Findings gate).

On any conflict with a frozen document, the frozen document wins and this folder is corrected
(Flag-and-Halt if frozen-vs-frozen). WP IDs coined here (`W<n>-<MOD>-<k>`) are an organizing
convenience for the ordered steps the Decomposition already fixed — never new architecture.

## Files (three-layer structure)

1. [`backend_build_plan.md`](backend_build_plan.md) — **Build Plan**: wave sequence, dependency
   graph, governance constraints, milestones. Wave 2 (M0 → M1) at WP granularity; Waves 3–6 sequenced.
2. [`backend_execution_playbook.md`](backend_execution_playbook.md) — **Execution Playbook**: per-WP
   deterministic build order, concrete file-map (frozen nested-DDD shape), CQRS command/query list,
   event matrix, API mapping, DB build order, Doc-8 test mapping. *(Wave 2 execution-ready; being
   assembled from the frozen Doc-5C / Doc-4J-4L / Doc-6C inputs.)*
3. [`backend_execution_tracker.md`](backend_execution_tracker.md) — **Execution Tracker**: live
   per-WP status, owner, review stage, PR, suites, ESC.

All three bind the frozen corpus by pointer and coin nothing. On any conflict the frozen document
wins and these are corrected.
</content>
</invoke>
