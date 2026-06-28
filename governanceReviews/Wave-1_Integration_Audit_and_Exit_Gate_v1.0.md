# Wave 1 — Integration Audit + Exit Gate + Retrospective — v1.0

| Field | Value |
|---|---|
| **WP** | WP-1.10 [W1-AUDIT-001] |
| **Date** | 2026-06-28 |
| **Integration branch** | `wave/1-foundation` (10 WP merges; tags `wave1/wp-1.0-green` … `wave1/wp-1.8-green` + `wave1/wp-1.2.1-green`; 25 commits since `wave0-complete`) |
| **Verdict** | **GREEN — code-complete + locally-green.** All in-wave Exit-Gate clauses pass; the **deploy / CI-green-on-`main`** clause is **PARKED** by Board ruling (external infra → WP-1.9). The walking skeleton stands end-to-end. |

---

## A. Wave Integration Audit (all verified on `wave/1-foundation`)

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | Builds | ✅ | `next build` compiles (routes `/account` ƒ · `/api/identity/buyer_profiles` ƒ · `/login` ○) on CI/ubuntu **and** locally with a clean HOME; `tsc --noEmit` 0 |
| 2 | Lint clean | ✅ | `eslint .` 0 (incl. `eslint-plugin-boundaries`); `prettier --check .` 0 |
| 3 | Tests pass | ✅ | `vitest run` **36/36** (8 files); no `.only`/`.skip` (a skipped test is a red gate) |
| 4 | Structure matches | ✅ | `check-structure.mjs`: 10 modules × (module.ts + 4 contracts + 4 layers), shared, server, route groups, tests |
| 5 | Import boundaries enforced | ✅ | planted probes blocked at lint: `server→module-internal`, `inngest→module-internal`, `identity/contracts→core/infrastructure` (cross-module) all **error**; the same-module facade + `tests→app` refinements proven scoped (cross-module still errors) |
| 6 | Generated artifacts | ✅ | `git ls-files generated-contracts-registry src/generated` empty; registry regenerates |
| 7 | CI merge-gate | ✅ | `.github/workflows/ci.yml` unchanged + green-equivalent locally (all gates run) |
| 8 | No architecture drift / FROZEN corpus untouched | ✅ | `git diff wave0-complete..wave/1-foundation -- generatedDocs/Doc-* Master ADR` = **0 files**; `prisma/schema.prisma` = the 10 namespaces + only M0/M1 (5+5) models |
| 9 | **`CHK-8-024` MANDATORY (RLS byte-equivalence)** | ✅ | WP-1.7 — **adversarially proven (20+ vuln probes), cannot false-pass**: restricted role `NOBYPASSRLS`/non-owner; no-GUC ⇒ 0 rows; superuser-contrast ⇒ 2; excluded ≡ non-matched for SELECT **and** COUNT (Doc-8D §5.4) |
| 10 | Migrations forward-only from empty | ✅ | `docker compose down -v` → `migrate deploy`: baseline → `core_init` → `identity_init` apply clean; 36/36 on the fresh DB (deterministic bootstrap) |
| 11 | No unresolved `[ESC-*]` / `TODO` | ✅ | `ESC-W1-OUTBOX` RESOLVED (R-a); 3 ESCs DEFERRED/recorded (non-blocking); 0 `TODO`/`FIXME` in code paths |
| 12 | Secrets | ✅ | `check-no-secrets.mjs` clean (944 tracked files); `check-no-cross-schema-fk.mjs` clean (3 migrations) |
| 13 | All WP tags present | ✅ | `wave1/wp-1.{0,1,2,2.1,3,4,5,6,7,8}-green` |
| 14 | **Repository Ownership Audit** | ✅ | each WP merge diff ⊆ its Files-Owned; **sanctioned cross-cutting expansions (documented)**: same-module `contracts/` facades (allocate/audit/drain/provision/getBuyerProfile/mapGetBuyerProfile — R-a facade pattern); framework realizations `src/shared/{db,ids,http}`; the app-layer composition edge `src/server/identity`; eslint refinements (WP-1.3 same-module facade, WP-1.6 `tests→app`); `vitest.config.ts` (alias parity + `fileParallelism:false`); the **WP-1.2.1 enum-`@@map` corrective** |

## B. Wave Exit Gate (Build_Roadmap §3 + §7 DoD)

| Clause | Status |
|--------|--------|
| Slice builds + locally green (auth → context → read → screen) | ✅ **GREEN** |
| `CHK-8-024` DB-layer RLS byte-equivalence (pos/neg/cross-tenant) | ✅ **GREEN** (adversarially proven; no false-pass) |
| Harness / CI merge-gate green locally | ✅ **GREEN** |
| All WP tags `wave1/wp-1.*-green` present | ✅ **GREEN** (10) |
| Outbox observer exercised | ✅ **GREEN** — Board ruled **R-a**; synthetic-row observer (`ESC-W1-OUTBOX` RESOLVED) |
| **Deployed + integration test green in CI on `main`** | **PARKED** — external infra (Supabase + Vercel + GitHub remote); Board-deferred to **WP-1.9** |

**Exit verdict:** Wave 1 is **GREEN on all in-wave clauses** and **code-complete + locally-green**. The single
remaining clause (deploy + CI-green-on-`main`) is **PARKED by Board ruling** (external infra, WP-1.9). Per the
build-local-park-deploy decision, Wave 1 is **ready to deliver** — the final PR `wave/1-foundation` → `main`
(+ the live-Supabase login round-trip + Vercel deploy) are the remaining outward/admin actions.

## C. The slice (what stands end-to-end)

Login (Supabase Auth) → **atomic, idempotent lazy provision** (user + personal org + Owner membership;
`human_ref` via the M0 `contracts/` service — no cross-schema SQL) → **server-validated active-org context**
(transaction-local RLS GUCs; fail-closed; client org never trusted) → **wired `get_buyer_profile.v1` route**
(`200` Doc-5A envelope + `reference_id` / `404` non-disclosure / pre-contract `401` auth-boundary) →
**Doc-7E Account screen** → proven by **`CHK-8-024`** (RLS byte-equivalence) + the **synthetic outbox observer**
+ the **slice integration test**. M0 `core` (5 tables, immutability, allocator, 18 keys) + the outbox dispatcher
underpin it.

## D. Deferred ESCs (recorded; non-blocking — Raise ≠ Accept)

- `ESC-W1-USER-PROVISION` — DEFERRED (Board): personal-org naming rule; interim email-derived default stands; revisit at operational provisioning.
- `ESC-W1-CONTEXT-RESOLVE` — DEFERRED (Board): the in-process M1 active-context contract (Doc-5C §C8 is wire-only); app-edge realization stands.
- `ESC-W1-AUTH-401` — recorded: the Doc-5A error model has no authentication/401 class by design (auth = DC-4); the auth-boundary 401 carries no contract `error_class`.
- `ESC-IDN-BUYERPROFILE-CODE` — recorded: interim NOT_FOUND code in the registered `identity_` namespace (Doc-4C §C10 interim authority); preserves non-disclosure regardless of the final value.

## E. External / parked (cannot be done by the execution agent)

1. **Deliver `wave/1-foundation` → `main`** — the wave's PR (held for delivery authorization; the default branch).
2. **Supabase project + secrets** → the live login round-trip (build-local-park-deploy).
3. **GitHub remote + branch protection + CI required-checks** → so CI runs + Vercel can deploy.
4. **Vercel project** → the deploy + "CI green on `main`" Exit clause (WP-1.9).

## F. Retrospective (engineering)

- **What the per-WP board review caught (the lifecycle paying off):** an audit DEFAULT-partition **RLS bypass** (WP-1.1); a runtime **BLOCKER** — Prisma enums unmapped → `42704` — that WP-1.2's own review *missed* because it probed with raw SQL not the client (fixed as **WP-1.2.1**; a client-insert smoke is now part of the discipline); a **401/403 conflation** in the error model (WP-1.5, reframed to a DC-4 auth boundary). Raise ≠ Accept also **down-ruled** mis-scoped/wrong findings against the corpus (a "GUC guard BLOCKER" that was WP-1.4's scope; a factually-wrong "Doc-6C 8 tables").
- **`CHK-8-024` rigor:** the mandatory gate was made impossible to false-pass via a `NOBYPASSRLS` restricted role + a no-GUC⇒0 meta-check + a superuser-contrast — verified by an adversarial review running 20+ vuln probes.
- **The import boundary is real, not theoretical:** every cross-module call routes through `contracts/`; the `human_ref` allocation is the worked example; planted violations error at lint.
- **Friction / carry-forward:** local `next build` trips on the Windows `C:\Users\engra\Application Data` junction (EPERM during a webpack home-glob) — clean on CI/ubuntu + with a clean HOME; an environment artifact (like the Wave-0 npm allow-scripts quirk), not a code defect. The 5-table M1 subset (vs the planned 4) was forced by `memberships.role_id NOT NULL → roles` (DDL-1). Carry into Wave 2: real Supabase + Vercel + remote; the first real event emitter (exercises `CHK-8-051` write-plus-emit against the unchanged dispatcher); the deferred ESC ratifications.

---

*WP-1.10 record. Wave 1 Integration Audit GREEN (14/14); Exit Gate GREEN on all in-wave clauses; the deploy
clause parked by Board ruling. Wave 1 is code-complete + locally-green and ready for the delivery PR to `main`.*
