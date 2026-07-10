# iVendorz — Wave 2 Baseline Report — v1.0

> **▲ DELIVERY UPDATE — 2026-07-11 (supersedes the "local rehearsal" framing below).** Wave 2 was
> subsequently **delivered to `origin/main` via PR #2** (GitHub merge-commit **`2e42ed5`**), not left as
> a parked local merge. The remote-delivery facts now supersede the §1 "LOCAL merge / not pushed / PARKED
> remote" rows (which record the earlier local rehearsal at merge `1121cb0`, retained as the annotated
> tag `wave2-complete` and the safety tag `backup/local-main-pre-remote-reconcile`; local `main` was
> reset to `origin/main` = `2e42ed5`). What actually shipped:
> - **Branch-protection CI ALL GREEN on the remote:** Verify (types · lint · format · **real ubuntu
>   `next build`** · structure · secrets · FK) · Unit/integration (Vitest **386/33**) · **E2E + a11y
>   (Playwright)**. Admin-merged (solo repo cannot self-approve the 1 required review; `enforce_admins=false`).
> - **CI caught 3 defects the local audit structurally cannot** (Windows `next build` EPERMs before
>   prerender; the local suite is Vitest, not Playwright) — all fixed on the branch pre-merge:
>   **W2X-F1** (prettier 3.8.5 reformat), **W2X-F2** `faa75df` (shell `Sidebar`/`MobileNav`
>   `useSearchParams()` wrapped in `<Suspense>` — Next-15 static-prerender bailout on `/account/billing`
>   + `/workspace/billing`), **W2X-F3** `70175a4` (home smoke `h1` assertion realigned to the shipped
>   Doc-7D landing hero).
> - **Vercel Production deploy: live** (`2e42ed5`, deploy succeeded).
> - **PARKED (owner-deferred 2026-07-11): Supabase PRODUCTION migrations** — the deploy pipeline runs
>   `next build` + `prisma generate` only; `prisma migrate deploy` against the prod Supabase conn-string
>   is a separate owner step.

| Field | Value |
|---|---|
| **Document type** | Permanent engineering baseline record (delivery artifact). |
| **Authority** | **NON-AUTHORITATIVE.** On any conflict, the FROZEN corpus and `generatedDocs/00_AUTHORITY_MAP.md` win. References the corpus by pointer only; restates no architecture. |
| **Date** | 2026-07-11 |
| **Supersedes** | — (additive; `Wave0_Baseline_Report_v1.0.md` + `Wave1_Baseline_Report_v1.0.md` remain their waves' records) |

> This file records the engineering facts of the **Wave 2 — Core Platform (M0 → M1)** delivery so the
> baseline is recoverable and auditable. It is a *delivery* record, not a governance authority and not a
> status tracker — the live phase/status SSoT is `generatedDocs/00_AUTHORITY_MAP.md` +
> `generatedDocs/Program_Status_And_Roadmap.md`; the gated build sequence is
> `generatedDocs/Build_Roadmap_v1.0.md` (§ Wave 2). The wave's governance records are
> `governanceReviews/Wave-2_Integration_Audit_and_Exit_Gate_v1.0.md` +
> `governanceReviews/WAVE2-INTEGRATION-AUDIT_v1.0.md` (the independent re-audit that caught W2X-F1).

---

## 1. Baseline identity

| Field | Value |
|---|---|
| **Wave** | Wave 2 — Core Platform, full M0 + M1 module builds (`Build_Roadmap_v1.0.md` § Wave 2) |
| **Completion status** | **CODE-COMPLETE + LOCALLY-GREEN — delivered to `main`.** Integration Audit GREEN; Exit Gate GREEN on all **in-wave** clauses. The remote push + `wave→main` PR + CI-green-on-`main` + deploy clause is **PARKED** by Board ruling (external infra; WP-1.9 precedent). |
| **Merge commit SHA** | `1121cb005b7427927e82dc16942f84d63790e25d` (`--no-ff` delivery merge; parents `884a772` old `main` [Wave-1 tip] + `e14bc1a` `wave/2-core-platform`) |
| **Baseline tag** | `wave2-complete` (annotated; points at `1121cb0`). Pre-merge safety tag `backup/wave2-core-pre-merge` retained. |
| **Default branch** | `main` |
| **History** | Complete — **no squash**; **438 commits** preserved under the delivery merge (all M0 CORE-1..4 + M1 IDN-1..7 work packages, the owner-directed parallel-lineage consolidation merge `142a2f6`, and all recorded Board rulings). Per-WP `wave2/wp-*-green` tags were **not** applied on the consolidated lineage (two owner-coordinated sessions converged via a reconciliation merge rather than the linear per-WP-tag model); WP provenance is preserved in the commit history + `docs/backend/backend_execution_tracker.md`. |
| **Git remote** | `origin` configured since Wave 0. **This delivery is a LOCAL merge — `main` has not been pushed.** Pushing + branch protection + marking CI "required" remain repo-admin actions (§5, WP-1.9). |

## 2. Toolchain pins (the baseline stack)

**Production stack unchanged from the Wave 1 baseline** — Wave 2 added no production dependency in the
core-platform scope; it materialized the **full** M0 `core` + M1 `identity` schemas (10 forward-only
migrations) and the 25-key POLICY seed on the existing pins. Resolved from `package-lock.json`
(lockfileVersion 3) at `1121cb0`.

| Concern | Version | Source of truth |
|---|---|---|
| **Node** | **20 LTS** (`.nvmrc` = `20`; CI = Node 20) | `.nvmrc`, `package.json` |
| **Package manager** | **npm** (lockfileVersion 3) | `package-lock.json` |
| **Next.js / React** | **15.5.19 / 19.2.x** | lockfile |
| **TypeScript** | **5.9.x** | lockfile |
| **Prisma / @prisma/client** | **6.19.3** (multiSchema; 10 namespaces; **M0 5 + M1 9 tables materialized**) | lockfile, `prisma/schema.prisma` |
| **Vitest / Playwright** | **2.1.9 / 1.61.x** (+ `@axe-core/playwright`) | lockfile |
| **ESLint** | **9.x** (flat config + `eslint-plugin-boundaries`) | lockfile |
| **Prettier** | **3.8.5** (lockfile pin) — **W2X-F1**: `node_modules` had floated to 3.9.4 under `^3.4.2`; reconciled to the lockfile pin at delivery, 15 files re-formatted. Follow-up (§5): pin exactly to stop future float. | lockfile |
| Database engine (Wave 2 gate) | PostgreSQL 16 (Docker / CI service container; **Supabase deploy deferred to WP-1.9**) | `docker-compose.yml`, `.github/workflows/ci.yml` |

## 3. Health at baseline (all in-wave gates green)

Certified by the Wave 2 Integration Audit + an independent re-audit; the delivery merge is a clean
`--no-ff` merge (0 conflicts), so the delivered `main` tree is **byte-identical** to the audited wave tip
`e14bc1a` (`git diff main wave/2-core-platform` = empty).

| Signal | Status | Evidence |
|---|---|---|
| **Tests** | ✅ GREEN | `vitest run` **386/386** (33 files), **3× deterministic** (no flake); no `.only`/`.skip`/`.todo`. Bands: M0 → 8B (outbox observer) + 8D (CR4′ immutability); M1 → 8C + 8D (org-anchor RLS pos/neg/cross-tenant) + 8E (Inv #2 two role dimensions; Inv #5 users-act/orgs-own). |
| **Typecheck** | ✅ GREEN | `tsc --noEmit` 0 |
| **Lint** | ✅ GREEN | `eslint .` 0 incl. `eslint-plugin-boundaries` (cross-module-internal imports error at lint) |
| **Format** | ✅ GREEN | `prettier --check .` 0 under the **lockfile-pinned 3.8.5** (W2X-F1 fixed) |
| **`CHK-8-024` (MANDATORY — RLS byte-equivalence)** | ✅ GREEN | Doc-8D §5.4 on the M1 org-anchored tables — run through a `NOBYPASSRLS` non-owner role (not a vacuous superuser pass); excluded ≡ non-matched for SELECT **and** COUNT |
| **POLICY seed** | ✅ GREEN | **25 keys** = 18 `core.*` (Doc-3 v1.0) + 7 `identity.*` (Doc-3 v1.9); values verbatim to Doc-3 (identity windows 24h/24h/24h/14d/365d/1h/7d) |
| **Migration** | ✅ GREEN | 10 forward-only migrations apply clean + in-order on a fresh Postgres 16; no down-migrations; 10 schemas present |
| **Structure / boundaries / FK / secrets** | ✅ GREEN | `check-structure` (10 modules × shape), `eslint-plugin-boundaries`, no-cross-schema-FK, no-secrets — all clean; ownership within M0/M1 + sanctioned cross-cutting (identity→core POLICY reads via the M0 config **contract**, key-name string, not table access) |
| **CI merge-gate** | ✅ OPERATIONAL | `.github/workflows/ci.yml` gates wired (typecheck/build/lint/format/structure/no-cross-schema-FK/no-secrets/migrate+probe/vitest/playwright) |
| **Wave Exit Gate** | ✅ **GREEN — all in-wave clauses** | full suite 3× · CHK-8-024 · CI-local green · POLICY seed · migrations · ownership · merge-consistency. **Remote push + `wave→main` PR + CI-green-on-`main` + deploy PARKED** (external infra; WP-1.9). |

## 4. What the baseline contains (by pointer — not restated)

The **full** M0 + M1 module builds (the foundation every later module references) — serial within the
wave (M0 → M1):

- **M0 `core` (Doc-6B):** 5 tables — `id_sequences`/`human_ref` allocator, `audit_records` with
  **CR4′ column-scoped immutability**, `outbox_events` with the forward-only trigger + the
  **transactional-outbox dispatcher/archiver** (`pending → dispatched → archived`, CAS/backoff/
  dead-letter/reconciliation) carrying the **[D-5] run/batch System audit** (one immutable
  `audit_records` row per advancing worker pass — `outbox_dispatch_run`/`outbox_archive_run`, per-run
  UUIDv7, bound by pointer to Doc-2 §9 "service-role sensitive operations"; RV-0161 A+T6+B PASS; legs 1
  "created" + 4 "park" carried), `system_configuration` + 18 `core.*` POLICY keys, `feature_flags`.
- **M1 `identity` (Doc-6C):** 9 tables — `users`, `organizations`, `roles`, `permissions`,
  `role_permissions`, `memberships`, `organization_workflow_settings`, `delegation_grants`,
  `buyer_profiles`; first full **org-anchor RLS**; `identity.check_permission`; server-validated
  active-org resolution; dual-party delegation; **3 state machines** (org / membership / delegation);
  the **45-slug / 4-bundle** authz catalog (36 tenant + 9 staff, routing pair seeded on ZERO bundles per
  Inv #2); 42 Doc-4C contracts wired/reviewed; 7 `identity.*` POLICY keys.

Authoritative detail lives in the frozen corpus + `REPOSITORY_STRUCTURE.md` + the module trackers — **not
here.** Governance records: `docs/backend/backend_execution_tracker.md`; the two Wave-2 audit records
(§ header).

## 5. Known non-blocking follow-ups (Raise ≠ Accept; recorded, not gating)

**Parked external / repo-admin (close the final Exit clause — WP-1.9, cannot be done by an execution agent):**
- **Supabase project + secrets** → the live login round-trip + live Postgres.
- **Push `main` to `origin` + branch protection + mark CI checks "required"** → the literal
  "merge-gate enforced on `main`" + CI running on the remote.
- **Vercel project (+ env)** → the deploy + "integration test green in CI on `main`" clause.

**M1 ESC carries — fail-closed, owner-ruled non-gating at the M1 close ("close now, carry all") → Wave-4 channels:**
- `ESC-IDN-2FA-RECOVERY`, `ESC-IDN-PREF-KEYS`, `ESC-IDN-INVITE-ACCOUNT`, `ESC-IDN-LIST-PAGESIZE` — a
  contract field/param with no frozen source set; each **VALIDATION-rejects** a supplied value (nothing
  coined, nothing silently dropped) until the corpus registers the set.
- `ESC-IDN-ORG-PROFILE-FIELDS` — **formally deferred** (reject-on-write / null-on-read; no migration).
- `ESC-IDN-CTX-SUSPENDED-DOWNSTREAM` — as-built frozen-faithful (switch denies suspended §C8; downstream
  resolution stays membership-only §3.3); a Board completeness question, not a defect.

**Carried engineering follow-ups:**
- **[D-5] legs 1 (created) + 4 (park)** — carried on the Board channel; each needs a future additive
  frozen patch (Doc-4B §B10 / a §B6/Doc-2 §10.1 park transition) + human approval.
- **`ESC-SEED-PK-UUID` (Option A first carrier)** — M0 seed uses `gen_random_uuid()` PKs vs M1's
  deterministic UUIDs; non-gating (the natural key is authoritative).
- **Prettier exact pin** — `^3.4.2` let `node_modules` float to 3.9.4 (which mis-passed format:check at
  the parallel audit); pin to an exact version to prevent recurrence (W2X-F1 follow-up).
- Open Wave-0/1 carry-forwards still stand (dev-only npm-audit; the Windows `Application Data` junction
  local-build EPERM — an environment artifact, clean on CI).

## 6. Repository health summary

The repository builds (CI/clean-HOME), lints, type-checks, formats (under the lockfile prettier),
tests (**386/33, 3× deterministic**), and migrates clean forward-only from an empty Postgres 16 at
`main`, with the frozen corpus **base untouched** — only **additive patches** added since Wave 1
(`Doc-2_Patch_v1.0.5/6/7/8`, the Doc-4B / Doc-5A / Doc-6C patch overlays; verified: `git diff
wave1-complete..1121cb0` touches no frozen base file, no architecture/ownership/governance change).
Cross-module communication routes exclusively through `contracts/` (planted violations error at lint);
no cross-schema SQL. The one build-gate ambiguity this wave — the outbox worker's [D-5] audit
granularity — was resolved to the frozen **run/batch** mandate (per-event rejected at review), and the
parallel-audit prettier false-pass (W2X-F1) was caught and corrected before delivery. **The baseline is
healthy; the full M0 + M1 Core Platform stands; ready for Wave 3 — Independent Domains (M2 · M5 · M6 ·
M7, parallel).**

---

*Non-authoritative engineering baseline record. Patch additively if a fact changes; the corpus and the
live status SSoT always win. Wave 2 execution is closed — future work begins from Wave 3.*
