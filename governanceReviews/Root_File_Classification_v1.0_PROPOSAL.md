# Root File & Directory Classification — v1.0 PROPOSAL

**Date:** 2026-07-06 · **Status:** PROPOSAL — every row awaits owner adjudication at Gate G1; nothing moves before approval.
**Rubric:** **KEEP** if constitution-§2-listed, frozen-path-referenced (rule R2 — grep-verified against `generatedDocs/`), a deliberate redirect stub, or a standard tool config. **MOVE** with named target + link budget. **DELETE** junk only (tracked junk via `git rm` — history-recoverable).
**Link policy (G1 ask ④):** `generatedDocs/` is never edited. `governanceReviews/` and `project-management/review-log.md`/`changelog.md` are point-in-time historical records — old links stay as-is; the **old→new mapping table (§5)** is the lookup. Only live documents receive link edits.

---

## 1. KEEP at root

| File | Reason |
|---|---|
| `README.md`, `CLAUDE.md`, `IMPLEMENTATION_START_HERE.md`, `project_details.md` | Constitution §2 root set. `IMPLEMENTATION_START_HERE.md` also frozen-linked (`../IMPLEMENTATION_START_HERE.md`). `project_details.md` frozen-mentioned 4× — relocation to `docs/reference/` registered as **deferred** (v1.1 P-5). |
| `repository_structure.md` | Constitution itself — case-fixed to `REPOSITORY_STRUCTURE.md` in C6 (audit F-05). |
| `esc_registry.md` | Frozen ref: ADR-024:131 (+49 live refs). PINNED. |
| `ROADMAP.md` | Frozen refs: Build_Roadmap 343/344/390 + `../ROADMAP.md` relative link. Redirect stub. PINNED. |
| `Wave_Template_v1.0.md` | Frozen ref: Build_Roadmap:262 ("owned by"). PINNED. |
| `00_PROJECT_STATUS.md`, `iVendorz_New_Chat_Primer.md` | Redirect stubs "retained only so existing links resolve". |
| `Governance_Freeze_v1.0.md` | The `governance-frozen-v1` freeze instrument. |
| Tool configs: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `lint-staged.config.mjs`, `playwright.config.ts`, `vitest.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `.prettierrc`, `.prettierignore`, `.gitignore`, `.gitattributes`, `.nvmrc`, `.env.example`, `docker-compose.yml` + canonical lockfile (per F-06 ruling) | Codified by v1.1 P-5. (`.env.local`, `next-env.d.ts` gitignored locals.) |

## 2. MOVE (live-link budget = one-line edits in live docs only; historical hits covered by §5 mapping)

### → `docs/product/`

| File(s) | Target | Live-link budget |
|---|---|---|
| `MEGA_MENU_ARCHITECTURE.md`, `MEGA_MENU_COMPONENT_SPEC.md`, `MEGA_MENU_DATA_MODEL.md`, `MEGA_MENU_IMPLEMENTATION_PLAN.md`, `MEGA_MENU_UX_FLOW.md` | `docs/product/navigation/` | ~3 (pm). The ~24 refs in `src/`/`tests/`/`app/` are bare-name comment citations — no edits. |
| `information_architecture.md` | `docs/product/information-architecture/` | ~3 |
| `ux_patterns.md` | `docs/product/ux/` | ~5 |
| `marketplace_ux.md` | `docs/product/ux/` | ~10 (journeys cluster — co-moves, relative fixes in sweep) |
| `screen_specifications.md` | `docs/product/ux/` | ~3 (incl. IMPLEMENTATION_START_HERE) |
| `landing_page_spec.md` | `docs/product/ux/` | ~2 |
| `page_inventory.md` | `docs/product/ux/` | ~10 live (9 pm + 1 journeys); script ref is comment-only |
| `buyer_planning_and_design.md` (224KB) | `docs/product/requirements/` | ~2 |
| `vendor_planning_and_design.md` (167KB) | `docs/product/requirements/` | ~4 |
| `rfq-workflow.md` | `docs/product/requirements/` | ~4 |
| **All 14 `productSpec/*`**: BUYER-PROFILE-MODEL, BUYER_VENDOR_DIRECTORY_SPEC_v1.0, CATEGORY_ATTRIBUTE_FRAMEWORK, CATEGORY_GOVERNANCE_MODEL, CATEGORY_MIGRATION_PLAN, CATEGORY_TAXONOMY_DECISION_RECORD, CATEGORY_TAXONOMY_REVIEW, COMPARE_SHEET_UX_FREEZE_v0.1, INDUSTRY-TAXONOMY-MODEL, MASTER-CLASSIFICATION-DICTIONARY, PRODUCT-CLASSIFICATION-MODEL, RFQ-CREATION-BUSINESS-MODEL, RFQ-MATCHING-BUSINESS-MODEL, VENDOR-PROFILE-MODEL | `docs/product/requirements/` | sweep-measured at execution (zero frozen refs verified) |
| `public_marketplace_ui_benchmark_and_design_direction.md` | `docs/product/benchmarks/` | ~0 |
| `buyer_journey_v1.0.md` ⚠ | `docs/product/journeys/` | ~3. **Conditions (R3):** owner-frozen 2026-07-06 AND currently dirty in the working tree → moves only after the team-2 checkpoint commit, content untouched, explicit owner sign-off. |
| `vendor_journey_plan.md` | `docs/product/journeys/` | ~0 |
| **All 10 `journeys/*`**: JOURNEY_ATLAS + journeys_admin/ai/communication/identity/marketplace/monetization/operations/procurement/trust | `docs/product/journeys/` | intra-cluster relative links fixed in sweep |

### → `docs/frontend/` (engineering documentation)

| File | Target |
|---|---|
| `design_philosophy.md`, `page_templates.md` | `docs/frontend/design-system/` |
| `ui_realization_framework.md` | `docs/frontend/architecture/` |
| `shared_conventions.md`, `shared_platform_component_registry.md` | `docs/frontend/components/` |
| `visual_reference_implementation.md` *(post-G1 closure row — the file postdated this classification; owner directed closure 2026-07-06)* | `docs/frontend/architecture/` (realization standard, sibling of `ui_realization_framework.md`; zero frozen refs — R2 grep-verified; sole live ref = ISH companions row, updated) |

### → other homes

| File | Target |
|---|---|
| `glossary.md`, `deferred_decisions.md` | `docs/reference/` (ISH links updated) |
| `frontend_first_slice.md` | `project-management/` (directory name kept per owner) |
| `ivendorz-rfq-creator/` (27 tracked files) | `prototypes/ivendorz-rfq-creator/` via `git mv`; update `tsconfig.json:30` + `eslint.config.mjs:32` excludes |
| `information_architecture_demo.html` | `prototypes/` (1 historical ref → §5 mapping) |

## 3. DELETE

| File | Method |
|---|---|
| `ChatGPT prompt.txt`, `review.txt` | `git rm` (C2; recoverable from history) |
| `.next-dev.log`, `tsconfig.tsbuildinfo` | disk delete (untracked; gitignore already covers) |
| Loser lockfile per F-06 ruling | Option A: `git rm pnpm-lock.yaml pnpm-workspace.yaml` · Option B: `git rm package-lock.json` + ci.yml ×3 + husky + `packageManager` in ONE commit |
| `.git.code-workspace` | **ADJUDICATE** (G1 ask ⑧; seed: `git rm` + gitignore `*.code-workspace`) |

## 4. Directories — dispositions

| Dir | Disposition |
|---|---|
| `governanceReviews/` | KEEP — PINNED append-only archive (audit F-15); new-artifact taxonomy per G1 ask ⑤ |
| `productSpec/`, `journeys/` | Dissolve into `docs/product/` (zero frozen refs — verified) |
| `project-management/` | KEEP name (owner rev-3 ruling); receives `frontend_first_slice.md` |
| `prototypes/`, `docs/`, `prompts/`, `design/`, `templates/`, `examples/` | CREATE per v1.1 P-4 + Reserved-Directory rule |
| `ivendorz-rfq-creator/` | Relocates (see §2) |

## 5. Old→New mapping table

**PUBLISHED at execution (branch `chore/repo-structure`, G1 approved 2026-07-06).** Historical documents are never edited; this table is the permanent lookup for stale links in `governanceReviews/`, `review-log.md`, `changelog.md`, and the frozen corpus's non-path name mentions.

| Old path | New path | Commit |
|---|---|---|
| `ivendorz-rfq-creator/**` (27 files) | `prototypes/ivendorz-rfq-creator/**` | C3 |
| `information_architecture_demo.html` | `prototypes/information_architecture_demo.html` | C3 |
| `MEGA_MENU_ARCHITECTURE.md` · `MEGA_MENU_COMPONENT_SPEC.md` · `MEGA_MENU_DATA_MODEL.md` · `MEGA_MENU_IMPLEMENTATION_PLAN.md` · `MEGA_MENU_UX_FLOW.md` | `docs/product/navigation/<same name>` | C4 |
| `information_architecture.md` | `docs/product/information-architecture/information_architecture.md` | C4 |
| `ux_patterns.md` · `marketplace_ux.md` · `screen_specifications.md` · `landing_page_spec.md` · `page_inventory.md` | `docs/product/ux/<same name>` | C4 |
| `buyer_planning_and_design.md` · `vendor_planning_and_design.md` · `rfq-workflow.md` | `docs/product/requirements/<same name>` | C4 |
| `productSpec/*.md` (all 14) | `docs/product/requirements/<same name>` | C4 |
| `public_marketplace_ui_benchmark_and_design_direction.md` | `docs/product/benchmarks/public_marketplace_ui_benchmark_and_design_direction.md` | C4 |
| `buyer_journey_v1.0.md` · `vendor_journey_plan.md` | `docs/product/journeys/<same name>` | C4 |
| `journeys/*.md` (JOURNEY_ATLAS + 9 domain files) | `docs/product/journeys/<same name>` | C4 |
| `design_philosophy.md` · `page_templates.md` | `docs/frontend/design-system/<same name>` | C4 |
| `ui_realization_framework.md` | `docs/frontend/architecture/ui_realization_framework.md` | C4 |
| `shared_conventions.md` · `shared_platform_component_registry.md` | `docs/frontend/components/<same name>` | C4 |
| `glossary.md` · `deferred_decisions.md` | `docs/reference/<same name>` | C4 |
| `frontend_first_slice.md` | `project-management/frontend_first_slice.md` | C5 |
| `visual_reference_implementation.md` | `docs/frontend/architecture/visual_reference_implementation.md` | post-G1 closure (owner-directed 2026-07-06) |

Deleted (C2, history-recoverable): `ChatGPT prompt.txt` · `review.txt` · `pnpm-lock.yaml` · `pnpm-workspace.yaml` (F-06 Option A, npm canonical) · `.git.code-workspace` (ask ⑧).

## 6. `.github/CODEOWNERS` seed (registered deferral — created when multiple contributors join)

```
/generatedDocs/          @architecture-board
/governanceReviews/      @governance
/docs/                   @engineering
/project-management/     @delivery
/design/                 @ux
/src/modules/            @backend
/src/frontend/           @frontend
/app/                    @frontend
```
Mirrors the v1.1 Documentation Ownership Matrix; team handles are placeholders until GitHub teams exist.
