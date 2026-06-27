# Wave 0 — Repository Bootstrap — Independent Hard Review & Audit

| Field | Value |
|---|---|
| **Subject** | Wave 0 Repository Bootstrap (first application code) |
| **Realizes** | `Build_Roadmap_v1.0` §2 · `Development_Decomposition_v1.0` §5 · `REPOSITORY_STRUCTURE.md` |
| **Date** | 2026-06-26 |
| **Process** | Author → Independent Hard Review (Board) → Fix → Consolidate → Validate → Apply → Verification Recheck → Audit → Approve |
| **Stance** | Adversarial — conformance to the frozen corpus; correctness of configs; no business logic |
| **Result** | **APPROVED — Wave 0 freeze-ready.** 0 BLOCKER / 0 open MAJOR / 0 open MINOR. |

> Wave 0 is the spine only — scaffold, tooling, 10-module nested-DDD skeleton, Prisma multiSchema,
> test harness, CI merge-gate. **No business logic; coins nothing.** It realizes the frozen
> `REPOSITORY_STRUCTURE.md` shape; it invents no architecture/API/schema/UI/event/permission/route/state.

---

## Independent Hard Review — findings & disposition

| ID | Sev | Finding | Disposition |
|---|---|---|---|
| **F1** | MINOR | `experimental.typedRoutes` deprecated in Next 15.5 (moved to top-level `typedRoutes`). | **FIXED** — `next.config.ts` top-level `typedRoutes`. |
| **F2** | MINOR | CI ran a standalone `tsc` typecheck *before* `next build`, but `next-env.d.ts` + `.next/types` are gitignored/build-generated → fragile on a fresh checkout. | **FIXED** — CI reordered; `next build` (which regenerates the types and runs `tsc`) is the authoritative type gate, kept last. |
| **F3** | NIT | `tsconfig` typechecked the generated Prisma client (`src/generated`). | **FIXED** — excluded `src/generated`, `prisma/generated`, `.next`. |
| **F4** | MINOR | *(caught in Verification Recheck)* `typedRoutes` makes `next build` add a triple-slash reference into the generated `next-env.d.ts`; eslint linted that generated file → `triple-slash-reference` error. | **FIXED** — eslint `ignores` now excludes `next-env.d.ts` (generated). |
| **F5** | OBSERVATION | 9 npm audit vulnerabilities (4 moderate / 3 high / 2 critical), **all in dev/build/test tooling** (vite · vitest · vite-node · esbuild · postcss · eslint-plugin-boundaries). Fixes require breaking major bumps (`--force`). | **ACCEPTED + DEFERRED** — zero runtime/production exposure (none in next/react/prisma/supabase/inngest/zod). Forcing breaking majors into the foundational scaffold is the wrong trade. Recorded as a follow-up **tooling-maintenance** task. |
| **F6** | OBSERVATION | `inngest` declares a `peerOptional @sveltejs/kit`, which transitively pulls `vite@8` and clashes with vitest's `vite@7` under npm strict peer resolution. | **RESOLVED** — `.npmrc` `legacy-peer-deps=true` (Svelte unused; only an unused optional peer is ignored). Documented in `.npmrc`. |
| **F7** | OBSERVATION | `core` (M0) carries an empty `domain/` folder, though M0 is infra-only (shape-exception). | **ACCEPTED** — REPOSITORY_STRUCTURE §3: unused layers *need not* exist; an empty one is not a violation. Populated/removed when M0 builds (Wave 2). |
| **F8** | NOTE | Tailwind **v3** chosen (vs the Next 15.5 default v4). | **ACCEPTED** — v3 is stable and valid; design tokens are owned by Doc-7B and realized later. Stack (CLAUDE.md §2) names "Tailwind" without a version. |

**Consolidate other reviews:** none outstanding (single-author scaffold; the recheck served as the second pass that caught F4).

---

## Validation (valid · applicable · beneficial · corpus-compliant)

| ID | Valid? | Applicable? | Beneficial? | Corpus-compliant? | Action |
|---|---|---|---|---|---|
| F1 | ✓ | ✓ | ✓ (removes deprecation) | ✓ | Apply |
| F2 | ✓ | ✓ | ✓ (CI robustness) | ✓ | Apply |
| F3 | ✓ | ✓ | ✓ (faster/cleaner typecheck) | ✓ | Apply |
| F4 | ✓ | ✓ | ✓ (lint green; correct — don't lint generated) | ✓ | Apply |
| F5 | ✓ | ✓ | partial (no safe fix now) | ✓ | Accept + defer |
| F6 | ✓ | ✓ | ✓ (install/CI resolve) | ✓ | Applied |
| F7 | ✓ | ✓ | n/a | ✓ | Accept |
| F8 | ✓ | ✓ | n/a | ✓ | Accept |

---

## Verification Recheck (no regressions; all findings closed)

| Gate | Command | Result |
|---|---|---|
| Typecheck | `tsc --noEmit` | **PASS** (exit 0) |
| Lint (incl. import-boundary) | `eslint .` | **PASS** (exit 0) — F4 regression caught here, fixed, re-passed |
| Prisma schema | `prisma validate` | **PASS** — 10 namespaces valid |
| Prisma client | `prisma generate` | **PASS** — generated to gitignored `src/generated/prisma` |
| Unit/harness | `vitest run` | **PASS** (0 tests; `passWithNoTests`) |
| Production build | `next build` | **PASS** — `/` (static) · `/_not-found` · `/api/health` (dynamic); typedRoutes warning gone |
| Composite | `npm run verify` | **PASS** (exit 0) |

---

## Conformance Audit (vs frozen references)

| Check | Source | Result |
|---|---|---|
| Single Next.js deployable; modular monolith internal | REPOSITORY_STRUCTURE §1/§2 | ✓ |
| Nested-DDD module shape (contracts/domain/application/infrastructure/api + `<m>.module.ts`) | REPOSITORY_STRUCTURE §3 | ✓ — all 10 modules |
| `contracts/` is the only importable cross-module surface | REPOSITORY_STRUCTURE §3/§9 | ✓ — enforced by `eslint-plugin-boundaries` (`boundaries/element-types`) |
| App Router route groups `(public)/(auth)/(app)/(admin)` + `app/api/` | REPOSITORY_STRUCTURE §8 | ✓ |
| Cross-cutting `src/shared/` + `src/server/` (framework-only) | REPOSITORY_STRUCTURE §5 | ✓ |
| One schema per module — 10 Prisma namespaces, one per module | Doc-2; Doc-6A R3(b) | ✓ — no models (coin nothing) |
| Generated artifacts gitignored, never hand-edited | REPOSITORY_STRUCTURE §2/§5/§10 | ✓ — `generated-contracts-registry/`, `src/generated/`, `prisma/generated/`, `next-env.d.ts` |
| Test toolchain = Vitest + Playwright + @axe-core + TS-native SQL | Doc-8B `[ESC-8-TOOLING]` | ✓ |
| CI merge-gate + import-boundary lint + no-cross-schema-FK intent | REPOSITORY_STRUCTURE §10; Doc-8B | ✓ — `.github/workflows/ci.yml` |
| Stack: Next 15 · React 19 · Prisma · Supabase · Inngest · Tailwind · Zod · Node ≥20 | CLAUDE.md §2 | ✓ |
| No business logic / coins nothing | This wave's scope | ✓ — stubs + config only |

---

## Deferred (need external resources — not Wave-0 blockers)

- **Live DB migration** ("10 schemas migrate clean") — needs a real Supabase `DATABASE_URL`/`DIRECT_URL`. `prisma validate`/`generate` pass without a DB; `prisma migrate` runs once a database exists.
- **Playwright browsers** — `npx playwright install chromium` (binary download); wired in CI's `e2e` job.
- **Vercel deploy** — the Walking Skeleton (Wave 1) deploy; needs a Vercel project + env.
- **Component-test env (jsdom/happy-dom)** — added when the Doc-8G component suites land.
- **Tooling-maintenance pass** — re-evaluate F5 dev-tooling vulns when vitest/eslint-plugin-boundaries majors stabilize.

---

## Approval

**APPROVED.** Wave 0 Repository Bootstrap is freeze-ready: the scaffold conforms to the frozen
`REPOSITORY_STRUCTURE.md`, realizes `Build_Roadmap_v1.0` §2, coins nothing, and passes every local
gate (typecheck · lint · prisma · vitest · build). All review findings are closed or accepted with
recorded rationale. **Next:** Wave 1 — Walking Skeleton (one real M0+M1 vertical slice), which
unblocks once a Supabase project / `DATABASE_URL` is available.
