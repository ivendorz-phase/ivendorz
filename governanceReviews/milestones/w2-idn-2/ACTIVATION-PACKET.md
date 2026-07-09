# ACTIVATION PACKET — Agent M1 · W2-IDN-2

*Per `governanceReviews/AI-Activation-Packet-Template.md` (RATIFIED v1.0). Coordinator: AI
Engineering Orchestrator, Backend-Lead hat.*

## 0. Header
- **Role activated:**       Agent M1 — Identity & Organization (org plan §3 charter + M1 row)
- **Work item:**            `W2-IDN-2` — role/permission catalog seed (45 slugs + 4 bundles) ·
                            WP defs: `docs/backend/backend_build_plan.md` §4 Stage B +
                            `backend_execution_playbook.md` §5
- **Priority / Lane:**      P2 · Lane G (authz substrate content)
- **Model class:**          advanced (Sonnet default — transcription WP, no E-trigger)
- **Worktree:**             none · **Activation type:** FIRST
- **Date · Packet author:** 2026-07-09 · Orchestrator (Backend-Lead hat: yes)

## 1. TASK
- **Objective:** seed the frozen permission/role catalog — **45 permission slugs + 4 system
  bundles + the bundle→permission mapping** — idempotently, System-actor-authored, with the
  8E Invariant-#2 conformance test.
- **In scope:**
  - **Slug seed:** 45 permissions transcribed **verbatim from Doc-2 §7 by pointer** (Doc-6C §5
    coins nothing — it points at Doc-2 §7 too): **38 tenant** (`space='tenant'`) + **7 staff**
    (`space='staff'`); idempotent `ON CONFLICT (slug) DO UPDATE` per Doc-6C §5.2.
  - **Bundle seed:** the 4 system bundles verbatim — `Owner`, `Director`, `Manager`, `Officer`
    (`organization_id = NULL`, `is_system_bundle = true`); idempotent
    `ON CONFLICT (name) WHERE deleted_at IS NULL AND organization_id IS NULL DO NOTHING`.
  - **Mapping seed:** `role_permissions` rows = the Doc-2 §7 bundle-default columns (O/D/M/F),
    as a **separate idempotent data migration**; system-bundle mapping rows carry
    `organization_id = NULL` (the RLS design's system leg — RV-0146).
  - **Inv #2 guard (hard):** `staff_*`-space slugs are NEVER mapped to any org bundle — enforce
    in the seed logic AND prove by test.
  - **Doc-8 8E test:** Invariant #2 (two role dimensions) — assert the seeded state: exactly 45
    slugs (38/7 split), exactly 4 system bundles, zero staff-slug→bundle mappings, mapping counts
    per bundle ≡ Doc-2 §7; **idempotency proof: run the seed twice, assert identical state**.
  - **Fold-in (non-gating carries):** `tests/_harness/db.ts:42` — fix the stale
    `RESTRICTED_RLS_ROLE` constant docstring (RV-0146 re-verify NIT).
- **Out of scope:** `check_permission` (`W2-IDN-3`) · any RLS/schema change · any contracts/
  change (E3 → suspend) · POLICY keys (`W2-IDN-7`) · M0 files (except the one harness docstring
  line above).
- **Acceptance criteria:** slug set ≡ Doc-2 §7 **exactly** (count + names + spaces — never coin,
  never rename; a slug you cannot find verbatim in Doc-2 §7 = Flag-and-Halt) · seeds idempotent
  (double-run proven) · forward-only data migration(s) apply clean on-chain · 8E green · full
  suite green (**current baseline: 172 tests / 19 files**, zero regressions) · tsc/ESLint/
  Prettier green.

## 2. DOCUMENTS (pointers only)
1. `generatedDocs/` **Doc-2 §7** (locate via `CORPUS_INDEX.md`) — THE slug/bundle/mapping oracle;
   transcribe verbatim.
2. `generatedDocs/` Doc-6C §5/§5.2 (seed mechanics: conflict clauses, System actor) — mechanics
   only; content always Doc-2 §7.
3. `docs/backend/backend_execution_playbook.md` §5 `W2-IDN-2` · `docs/backend/backend_build_plan.md`
   §4 Stage B (cross-check; on mismatch Doc-2/Doc-6C win → Flag-and-Halt).
4. `prisma/migrations/20260709100000_identity_authz/migration.sql` (the tables/enums you seed
   into — READ-ONLY) + the existing `identity_init` seed blocks (house seed style).
5. `project-management/ai-engineering-organization-plan.md` §3 (shared charter binds).

## 3. CONTRACTS
- None to change.

## 4. CODE (≤15 with §3)
- `prisma/migrations/<ts>_identity_catalog_seed/` (new data migration dir — or the house
  pattern's seed location if the repo seeds outside migrations; follow the existing 18-POLICY-key
  precedent in `core_init`/`identity_init`, whichever pattern the corpus/house uses for data seeds)
- `tests/integration/` (the 8E suite) · `tests/_harness/db.ts` (line-42 docstring ONLY)
- READ-ONLY: `prisma/schema.prisma` · existing identity tests (fixture-collision awareness — the
  RLS suite attaches temp rows to the live Owner bundle, B-OBS-2; your seed must be stable under
  that suite's teardown)

## 5. CONSTRAINTS
- Standing charter binds. **Never coin or rename a slug** (Inv #2 + reference-never-restate);
  the 38/7 split and every name must trace to Doc-2 §7 verbatim.
- **Team-6 pre-flag: YES** (authz substrate content). Self-run `/ivendorz-security`; report in §7.
- Idempotency is a frozen requirement, not a nicety — the double-run proof is part of DoD.
- DB bootstrap: `docker compose up -d db`. Forward-only (Doc-6A §11).
- Commit discipline: checkpoint commit(s) of ONLY W2-IDN-2 files (+ the one docstring line),
  `feat(identity): W2-IDN-2 … [checkpoint]`, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Halt condition: Doc-2 §7 ↔ Doc-6C §5 ↔ playbook mismatch, or an ambiguous bundle-default cell
  → Flag-and-Halt citing both sources; never resolve locally.

## 6. EXPECTED OUTPUTS
- Completion Report per `governanceReviews/AI-Completion-Report-Template.md` (§5 Events = "Zero —
  frozen truth: M1 emits no §8 events"; §6 must state the 45-count verification method + the
  double-run idempotency evidence; §11 next gate = Review-A with **Team-6 = YES**).
- Checkpoint SHA · 8E + full-suite results · self-check results.
