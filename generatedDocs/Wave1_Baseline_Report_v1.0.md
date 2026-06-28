# iVendorz — Wave 1 Baseline Report — v1.0

| Field | Value |
|---|---|
| **Document type** | Permanent engineering baseline record (delivery artifact). |
| **Authority** | **NON-AUTHORITATIVE.** On any conflict, the FROZEN corpus and `generatedDocs/00_AUTHORITY_MAP.md` win. References the corpus by pointer only; restates no architecture. |
| **Date** | 2026-06-28 |
| **Supersedes** | — (additive; `Wave0_Baseline_Report_v1.0.md` remains the Wave 0 record) |

> This file records the engineering facts of the **Wave 1 — Foundation (Walking Skeleton)** delivery so
> the baseline is recoverable and auditable. It is a *delivery* record, not a governance authority and not
> a status tracker — the live phase/status SSoT is `generatedDocs/00_AUTHORITY_MAP.md` +
> `generatedDocs/Program_Status_And_Roadmap.md`; the gated build sequence is
> `generatedDocs/Build_Roadmap_v1.0.md` (§3 Wave 1). The wave's governance record is
> `governanceReviews/Wave-1_Integration_Audit_and_Exit_Gate_v1.0.md`.

---

## 1. Baseline identity

| Field | Value |
|---|---|
| **Wave** | Wave 1 — Foundation / Walking Skeleton (`Build_Roadmap_v1.0.md` §3) |
| **Completion status** | **CODE-COMPLETE + LOCALLY-GREEN — delivered to `main`.** Integration Audit GREEN (14/14); Exit Gate GREEN on all **in-wave** clauses. The deploy + CI-green-on-`main` clause is **PARKED** by Board ruling (external infra; WP-1.9). |
| **Merge commit SHA** | `3345b0020a6dabae4ce740bfebaa75ab4c1e46c1` (`--no-ff` delivery merge; parents `bf8dfda` old `main` + `7e07f21` `wave/1-foundation`) |
| **Baseline tag** | `wave1-complete` (annotated; points at `3345b00`) |
| **Default branch** | `main` |
| **History** | Complete — no squash; **11 WP merges (27 commits)** preserved under the delivery merge: `wave1/wp-1.{0,1,2,2.1,3,4,5,6,7,8}-green` + WP-1.10 (Integration Audit) + the recorded Board rulings on the three Wave-1 escalations. |
| **Git remote** | `origin` → `https://github.com/mebdtech-dotcom/test1.git` (configured since the Wave 0 baseline). **This delivery is a LOCAL merge — `main` has not been pushed.** Pushing + branch protection + marking CI "required" remain repo-admin actions (see §5). |

## 2. Toolchain pins (the baseline stack)

**Unchanged from the Wave 0 baseline** — Wave 1 added no production dependency; it added the first
Prisma **models** (M0 `core` 5 + M1 `identity` 5) and two forward-only migrations on the existing pins.
Resolved from `package-lock.json` (lockfileVersion 3) at `3345b00`.

| Concern | Version | Source of truth |
|---|---|---|
| **Node** | **20 LTS** (`.nvmrc` = `20`; `engines.node` = `>=20`; CI = Node 20) | `.nvmrc`, `package.json` |
| **Package manager** | **npm** (lockfileVersion 3) | `package-lock.json` |
| **Next.js** | **15.5.19** | lockfile |
| **React / React-DOM** | **19.2.7** | lockfile |
| **TypeScript** | **5.9.3** | lockfile |
| **Prisma / @prisma/client** | **6.19.3** (multiSchema; 10 module namespaces; M0+M1 models materialized) | lockfile, `prisma/schema.prisma` |
| **Vitest** | **2.1.9** | lockfile |
| **Playwright** (`@playwright/test`) | **1.61.1** (+ `@axe-core/playwright`) | lockfile |
| **ESLint** | **9.39.4** (flat config + `eslint-plugin-boundaries`) | lockfile |
| Database engine (Wave 1 gate) | PostgreSQL 16 (Docker / CI service container; **Supabase Auth + Postgres deferred to WP-1.9** — build-local-park-deploy) | `docker-compose.yml`, `.github/workflows/ci.yml` |

## 3. Health at baseline (all in-wave gates green)

Certified by the Wave 1 Integration Audit on `wave/1-foundation`; the delivery merge is a **clean `ort`
merge (0 conflicts)**, so the delivered `main` tree is **content-identical** to the audited tip.

| Signal | Status | Evidence |
|---|---|---|
| **Build** | ✅ GREEN | `next build` compiles (`/account` ƒ · `/api/identity/buyer_profiles` ƒ · `/login` ○) on **CI/ubuntu and locally with a clean HOME**; `tsc --noEmit` 0. *(Local `next build` trips on the Windows `Application Data` junction — an environment artifact, §5; clean on CI.)* |
| **Lint** | ✅ GREEN | `eslint .` 0 incl. `eslint-plugin-boundaries`; cross-module-internal imports error at lint (planted probes blocked) |
| **Format** | ✅ GREEN | `prettier --check .` 0 |
| **Typecheck** | ✅ GREEN | `tsc --noEmit` 0 |
| **Tests** | ✅ GREEN | `vitest run` **36/36** (8 files); no `.only`/`.skip` |
| **`CHK-8-024` (MANDATORY — RLS byte-equivalence)** | ✅ GREEN | Doc-8D §5.4 DB-layer gate on `identity.buyer_profiles` — adversarially proven (20+ vuln probes), **cannot false-pass**: `NOBYPASSRLS` non-owner role; no-GUC ⇒ 0; superuser-contrast ⇒ 2; excluded ≡ non-matched for SELECT **and** COUNT |
| **Migration** | ✅ GREEN | `docker compose down -v` → `migrate deploy`: baseline → `core_init` → `identity_init` apply clean; deterministic bootstrap from an empty Postgres 16; forward-only (no down-migrations) |
| **Structure** | ✅ GREEN | `check-structure.mjs` — 10 modules × (module.ts + 4 `contracts/` + 4 layers), shared, server, 4 route groups, tests *(re-verified on delivered `main`)* |
| **No cross-schema FK / secrets** | ✅ GREEN | `check-no-cross-schema-fk.mjs` clean (3 migrations); `check-no-secrets.mjs` clean (945 tracked files) *(re-verified on delivered `main`)* |
| **CI merge-gate** | ✅ OPERATIONAL | `.github/workflows/ci.yml` unchanged from Wave 0; all gates wired (typecheck/build/lint/format/structure/no-cross-schema-FK/no-secrets/migrate+probe/vitest/playwright) |
| **Wave Exit Gate** | ✅ **GREEN — all in-wave clauses** | slice builds + locally green · `CHK-8-024` · harness/CI green locally · all WP tags · outbox observer exercised. **Deploy + CI-green-on-`main` PARKED** (external infra; WP-1.9). |

## 4. What the baseline contains (by pointer — not restated)

One real end-to-end vertical slice on a **thin** M0+M1 foundation (Wave 1 scope, `Build_Roadmap` §3) —
the full M0/M1 module builds are Wave 2:

- **M0 `core` (Doc-6B):** 5 tables (`id_sequences`, `audit_records` + immutability, `outbox_events` +
  forward-only trigger, `system_configuration` + 18 `core.*` keys, `feature_flags`); the
  `core.allocate_human_reference.v1` `contracts/` service over the `SECURITY DEFINER` allocator; the
  minimal Inngest outbox dispatcher (`pending → dispatched`, forward-only/idempotent).
- **M1 `identity` (Doc-6C, 5-of-9 subset):** `users`, `organizations`, `roles` (Owner system-bundle),
  `memberships` (inline FKs), `buyer_profiles` (pure org-anchored RLS); the
  `identity.get_buyer_profile.v1` read contract.
- **The slice:** Supabase login → **atomic, idempotent lazy provision** (user + personal org + Owner
  membership; `human_ref` via the M0 `contracts/` service — **no cross-schema SQL**) →
  **server-validated active-org context** (transaction-local RLS GUCs; fail-closed; client org never
  trusted) → **wired `get_buyer_profile.v1` route** (`200` Doc-5A envelope + `reference_id` / `404`
  non-disclosure / pre-contract DC-4 `401`) → **Doc-7E Account screen** (server-rendered via the wired
  client) → proven by **`CHK-8-024`** + the **synthetic M0 outbox observer** + the **slice integration
  test**.

Authoritative detail lives in the frozen corpus + `REPOSITORY_STRUCTURE.md` — **not here.**

## 5. Known non-blocking follow-ups (Raise ≠ Accept; recorded, not gating)

**Parked external / repo-admin (cannot be done by an execution agent) — close the final Exit clause (WP-1.9):**
- **Supabase project + secrets** (`NEXT_PUBLIC_SUPABASE_*`, `SERVICE_ROLE_KEY`, `DATABASE_URL`/`DIRECT_URL`)
  → the live login round-trip + live Postgres.
- **Push `main` to `origin` + branch protection + mark CI checks "required"** → the literal
  "merge-gate enforced on `main`" + lets CI run on the remote.
- **Vercel project (+ env)** → the deploy + "integration test green in CI on `main`" Exit clause.

**Deferred Wave-1 escalations (recorded in `governanceReviews/`; non-blocking — revisit Wave 2+):**
- `ESC-W1-OUTBOX` — **RESOLVED** (Board R-a; synthetic-row observer; Wave-2 first real emitter exercises
  `CHK-8-051` write-plus-emit against the unchanged dispatcher).
- `ESC-W1-USER-PROVISION` — DEFERRED: personal-org naming rule; interim email-derived default stands.
- `ESC-W1-CONTEXT-RESOLVE` — DEFERRED: the in-process M1 active-context contract (Doc-5C §C8 is wire-only);
  app-edge realization stands, boundary-legal.
- `ESC-W1-AUTH-401` — recorded: the Doc-5A error model has no authentication/401 class by design (auth =
  DC-4); the auth-boundary 401 carries no contract `error_class`.
- `ESC-IDN-BUYERPROFILE-CODE` — recorded: interim NOT_FOUND code in the registered `identity_` namespace.

**Carried engineering follow-ups:**
- Local `next build` trips on the Windows `C:\Users\engra\Application Data` junction (EPERM during a
  webpack home-glob) — clean on CI/ubuntu + with a clean HOME; an environment artifact, not a code defect.
- The M1 subset is **5 tables (not the planned 4)** — forced by `memberships.role_id NOT NULL → roles`
  (DDL-1); Wave 2 completes the other 4 (`permissions`, `role_permissions`,
  `organization_workflow_settings`, `delegation_grants`).
- Open Wave-0 carry-forwards still stand: `governanceReviews/W0-DEP-AUDIT-FOLLOWUP_v1.0.md` (npm-audit,
  dev-only); the `REPOSITORY_STRUCTURE.md` route-group diagram doc-sync.

## 6. Repository health summary

The repository builds (CI/clean-HOME), lints, type-checks, formats, tests (36/36), and migrates clean
forward-only from an empty Postgres at `main`, with the frozen corpus **byte-identical** to its
pre-Wave-1 state (verified: `git diff wave0-complete..3345b00 -- generatedDocs/Doc-* *Master* *ADR*`
empty; no architecture, ownership, or governance change). Cross-module communication routes exclusively
through `contracts/` (the `human_ref` allocation is the worked example; planted violations error at lint);
no cross-schema SQL. The single architecture-adjacent ambiguity (the skeleton's outbox-observer clause
vs. M1 emitting no domain event) was handled as a formal FLAG-AND-HALT
(`governanceReviews/ESC-W1-OUTBOX_v1.0.md`) and realized exactly per Board ruling **R-a** — no frozen
document was edited. **The baseline is healthy and the walking skeleton stands end-to-end; ready for
Wave 2 — Core Platform (M0 → M1).**

---

*Non-authoritative engineering baseline record. Patch additively if a fact changes; the corpus and the
live status SSoT always win. Wave 1 execution is closed — future work begins from Wave 2.*
