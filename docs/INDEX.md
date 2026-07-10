# Documentation Index

## Repository Navigation Map

```
Repository
│
├── Source Code            app/ · src/ · prisma/ · inngest/ · tests/ · scripts/ · public/
├── Frozen Specifications  generatedDocs/            ← authoritative; start at CORPUS_INDEX.md
├── Governance Archive     governanceReviews/        ← pinned, append-only provenance
├── Living Documentation   docs/  (this tree)
├── Project Execution      project-management/
├── Design Assets          design/  (sources only)
├── AI Prompts             prompts/
├── Templates & Examples   templates/ · examples/
└── Prototypes             prototypes/
```

New here? Read [`README.md`](README.md) (documentation philosophy + ownership), then
`IMPLEMENTATION_START_HERE.md` at the repository root.

---

## Architecture

- [`architecture/README.md`](architecture/README.md) — pointer to the frozen corpus; diagram taxonomy

## Product

- **Journeys** — [`JOURNEY_ATLAS.md`](product/journeys/JOURNEY_ATLAS.md) (frozen v1.0 suite, 51 journeys) ·
  [`buyer_journey_v1.0.md`](product/journeys/buyer_journey_v1.0.md) ·
  [`vendor_journey_plan.md`](product/journeys/vendor_journey_plan.md) · 9 per-domain `journeys_*.md`
- **UX** — [`ux_patterns.md`](product/ux/ux_patterns.md) · [`marketplace_ux.md`](product/ux/marketplace_ux.md) ·
  [`screen_specifications.md`](product/ux/screen_specifications.md) ·
  [`landing_page_spec.md`](product/ux/landing_page_spec.md) ·
  [`page_inventory.md`](product/ux/page_inventory.md) (frozen page-ID source)
- **Navigation** — the five `MEGA_MENU_*.md` specs in [`product/navigation/`](product/navigation/)
- **Information architecture** — [`information_architecture.md`](product/information-architecture/information_architecture.md)
- **Requirements** — buyer/vendor planning & design, `rfq-workflow.md`, and the 14 classification/
  taxonomy/profile specs (former `productSpec/`) in [`product/requirements/`](product/requirements/)
- **Benchmarks** — [`public_marketplace_ui_benchmark_and_design_direction.md`](product/benchmarks/public_marketplace_ui_benchmark_and_design_direction.md)

## Backend

- [`backend/README.md`](backend/README.md) — Backend Build Office (execution charter) ·
  [`backend/backend_build_plan.md`](backend/backend_build_plan.md) — wave-by-wave backend build plan
  (Wave 2 M0 → M1 at work-package granularity; Waves 3–6 sequenced)

## Frontend

- **Architecture** — [`ui_realization_framework.md`](frontend/architecture/ui_realization_framework.md) ·
  [`visual_reference_implementation.md`](frontend/architecture/visual_reference_implementation.md) (reference-driven UI standard)
- **Components** — [`shared_conventions.md`](frontend/components/shared_conventions.md) ·
  [`shared_platform_component_registry.md`](frontend/components/shared_platform_component_registry.md)
- **Design system** — [`design_philosophy.md`](frontend/design-system/design_philosophy.md) ·
  [`page_templates.md`](frontend/design-system/page_templates.md) ·
  [`motion_standard.md`](frontend/design-system/motion_standard.md) (binding animation standard — all teams/agents)

## Testing

- Reserved — materializes on first content.

## Governance

- Process: CLAUDE.md §13 (Review & Findings Governance). Archive: `governanceReviews/` (pinned).
- `docs/governance/` + `docs/adr/` — reserved forward homes for new working documents
  (G1 ruling ⑤); the authoritative ADR corpus stays in `generatedDocs/`.

## Prompts

- `prompts/` — reserved; README charter lands with first content.

## Reference

- [`glossary.md`](reference/glossary.md) · [`deferred_decisions.md`](reference/deferred_decisions.md)
- Root pointers that never move (frozen-path-pinned): `esc_registry.md` · `ROADMAP.md` ·
  `00_PROJECT_STATUS.md` · `iVendorz_New_Chat_Primer.md` · `Wave_Template_v1.0.md` ·
  `Governance_Freeze_v1.0.md`
