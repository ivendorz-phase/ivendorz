# Wave-2 Integration Audit + Exit Gate — v1.0

**Gate:** final gate before `wave/2-core-platform → main`
**Target (detached):** `142a2f6` — *"merge: consolidate W2-CORE-4 [D-5] audit leg + canonical M1-close into wave/2-core-platform"*
**Scope:** M0 (`core`) + M1 (`identity`), integrated wave tip
**Method:** independent reproduction — throwaway Postgres (`ivendorz_w2audit`, port 5546), FRESH DB, ALL migrations applied, full suite 3×, all CI gates re-run. Reviewer **raises**; coordinator/owner **disposes** (§13 Raise ≠ Accept).
**Verdict:** **EXIT-GATE BLOCKED** — BLOCKER=0 · **MAJOR=1** · MINOR=0 · NIT=0 · OBS=2. One gating finding: a required CI merge-gate (`prettier --check`) is RED at the wave tip. All 8 other clauses GREEN. Remediation is trivial and non-semantic.

---

## Findings summary

| ID | Clause | Severity | Gating | One-liner |
|----|--------|----------|--------|-----------|
| **W2X-F1** | 6 | **MAJOR** | Yes | `npm run format:check` (prettier@3.8.5 per committed lockfile, installed by `npm ci`) FAILS on 15 files — a required CI merge-gate is RED at `142a2f6`. Not CRLF, not an env artifact (reproducible under the committed lockfile); blobs also fail under the pinned floor 3.4.2. Auto-fixable (`npm run format`), zero semantic impact. |
| W2X-O1 | 2 | OBS | No | The 18 `core.*` POLICY rows seed `id` via `gen_random_uuid()`; the 7 `identity.*` rows use deterministic UUID constants (ESC-SEED-PK-UUID Option A, first carrier). Non-gating — `key` is the natural key; `id` incidental to all reads. |
| W2X-O2 | 7 | OBS | No | M0 `core` has no `README.md`; M1 `identity` does. README is **not** in the canonical module shape (REPOSITORY_STRUCTURE §106–131), so non-gating — a documentation asymmetry, not a structural gap. |

---

## Clause 1 — Full integrated suite green (the big one)

**PASS.** Full Vitest suite run **3× consecutively** on the FRESH DB. Deterministic — identical counts every run, no flake, no red.

| Run | Test Files | Tests | Failed | Skipped/Todo | Duration |
|-----|-----------|-------|--------|--------------|----------|
| 1 | 33 passed (33) | **386 passed (386)** | 0 | 0 | 24.63s |
| 2 | 33 passed (33) | **386 passed (386)** | 0 | 0 | ~24s |
| 3 | 33 passed (33) | **386 passed (386)** | 0 | 0 | 23.98s |

Matches the merge claim "full suite 386/33 ALL PASS."

**Red-gate scan:** ZERO `.only` / `.skip` / `.todo` / `xit` / `xdescribe` markers (precise call-form grep across `tests/**` = no matches; the two `\bfit\b`-style hits were false positives inside "retro-fit"). Zero deleted-without-replacement (33 files present, all green).

**Required Wave-2 bands present (evidence):**
- **M0 → 8B (outbox observer):** `outbox-drainer.test.ts`, `outbox-dispatch-hardening.test.ts`, `outbox-write-plus-emit-atomicity.test.ts`.
- **M0 → 8D (CR4′ immutability):** `core-cr4-immutability-triggers.test.ts` + `audit-records-context-append-rls.test.ts`.
- **M1 → 8C (contract/envelope):** `active-context-wire-slice.test.ts`, `organization-wire-slice.test.ts`, `membership-wire-slice.test.ts`, `role-wire-slice.test.ts`, `delegation-wire-slice.test.ts` (each tagged "8C" in-file).
- **M1 → 8D (org-anchor RLS pos/neg/cross-tenant):** `rls-buyer-profiles-byte-equivalence.test.ts`, `rls-identity-authz-tables.test.ts`, `authz-rls-backstop.test.ts` (restricted NON-privileged role via `SET LOCAL ROLE`, NOBYPASSRLS — the CHK-8-024 backstop asserts through the app-bypassed path; no vacuous superuser pass).
- **M1 → 8E (Invariant #2 two role dimensions):** `identity-permission-catalog-seed.test.ts` ("ZERO staff-space slugs mapped to any system bundle"), `role-wire-slice.test.ts` (Invariant #2 firewall discriminating-tested). **(Invariant #5 users-act/orgs-own):** `buyer-profile-slice.test.ts` (server-resolved org; client org id never trusted), `active-org-context.test.ts`, `get-active-context.query`.

---

## Clause 2 — POLICY keys seeded

**PASS.** Confirmed at the **DB level** (queried live after `prisma migrate deploy` on the fresh DB):

```
domain     count
core       18
identity    7
TOTAL      25
```

**18 `core.*` (Doc-3 v1.0, seeded by `20260627183528_core_init`):** audit_query_page_size_max=100, audit_query_rate_window=60s, audit_query_rate_reset=60s, audit_lookup_rate_window=60s, audit_lookup_rate_reset=60s, audit_redactable_fields_max=10, audit_redaction_reason_min_chars=20, redaction_dedup_window=24h, outbox_dispatch_max_attempts=10, outbox_dispatch_backoff="exponential, base 2s, cap 5m", outbox_dispatch_dedup_window=24h, outbox_dlq_policy=park_and_alert, outbox_archive_retention=30d, outbox_archive_dedup_window=24h, config_change_reason_min_chars=20, config_change_dedup_window=24h, flag_change_reason_min_chars=20, flag_change_dedup_window=24h.

**7 `identity.*` (Doc-3 v1.9, seeded by `20260710170000_identity_policy_key_seed`):** command_dedup_window=**24h**, user_update_dedup_window=**24h**, membership_invite_dedup_window=**24h**, membership_invite_expiry_window=**14d**, delegation_validity_default=**365d**, delegation_expiry_sweep_cadence=**1h**, ownership_succession_reminder_cadence=**7d**.

**Value spot-check vs frozen Doc-3:** identity dedup/timer windows = **24h/24h/24h/14d/365d/1h/7d** — verbatim match to Doc-3 v1.9 §3 (rows 1–7). Core spot-checks (page_size_max=100, dispatch_max_attempts=10, backoff spec, dlq_policy, archive_retention=30d, redactable_fields_max=10, config reason min=20) all match Doc-3 v1.0. **No value drift.** (OBS W2X-O1 on seed-PK scheme; non-gating.)

---

## Clause 3 — Zero UNRESOLVED [ESC-*] (M0/M1 scope)

**PASS.** All named M1 carries present in `esc_registry.md` with an **explicit disposition** — none silent. Each fail-closed claim independently verified in code:

| ESC | Registry status | Fail-closed proof (code) |
|-----|-----------------|--------------------------|
| `ESC-IDN-2FA-RECOVERY` | OPEN (dispositioned) | `update-user-2fa-settings.command.ts:69–75` — any `recoveryMethod` → `"recovery_method is not accepted…"` → VALIDATION reject. |
| `ESC-IDN-PREF-KEYS` | OPEN (RV-0152 F1 remedy) | `update-user-profile.command.ts:88–92` — any `preferences` → VALIDATION reject; repo comment confirms no write path (`user-account.repository.ts:76`). |
| `ESC-IDN-CTX-SUSPENDED-DOWNSTREAM` | OPEN (Board completeness) | As-built frozen-faithful: switch denies suspended (§C8), downstream resolution stays membership-only (§3.3); `active-org.ts:54`, `switch-active-organization.route-handler.ts:17`. Dispositioned, **not** silent. |
| `ESC-IDN-INVITE-ACCOUNT` | OPEN (dispositioned) | `invite-member.command.ts:17–30,183` — non-resolving email → in-register VALIDATION `invalid_input` 400; existing-user invite works. |
| `ESC-IDN-LIST-PAGESIZE` | OPEN (dispositioned) | `role.route-handler.ts:102/107`, `list-my-organizations.route-handler.ts:64/69`, `list-delegation-grants.route-handler.ts:66/71` — `page_size`/`cursor` "not accepted" reject; queries fail-closed (`hasMore` always false, no cursor issued). |
| `ESC-IDN-ORG-PROFILE-FIELDS` | FORMALLY DEFERRED (owner ruled) | `update-organization-profile.command.ts:103–110` — `address`/`contact_info`/`brand_assets_ref` supplied → VALIDATION reject; NO migration authored (Invariant 8). |

No M0/M1 ESC is silent/undispositioned; no false fail-closed claim. (Future-wave M2+/FE ESCs out of scope, not gated.)

---

## Clause 4 — Zero unresolved TODO/FIXME

**PASS.** ZERO `TODO` / `FIXME` / `HACK` / `XXX` markers in `src/modules/core`, `src/modules/identity`, `src/server`, `inngest` (word-boundary grep = no matches). The only `XXX`-substring hits are format placeholders (`TYPE-YEAR-XXXXX` human-ref, `+8801XXXXXXXXX` E.164 example) — not markers.

---

## Clause 5 — Migrations clean

**PASS.** 10 forward-only migrations (one `migration.sql` each, **no down-migrations**), applied cleanly and **in order** on the fresh DB — "All migrations have been successfully applied", no error/duplicate/out-of-order. `migration_lock.toml` provider = `postgresql`.

```
00000000000000_init_schemas
20260627183528_core_init
20260627202753_identity_init
20260630090000_audit_context_append_policy
20260709100000_identity_authz
20260709130000_identity_catalog_seed
20260710090000_identity_users_display_name
20260710120000_identity_command_dedup
20260710160000_identity_routing_slugs_seed
20260710170000_identity_policy_key_seed
```

Data-only seeds are idempotent (`ON CONFLICT (key) DO UPDATE`); DDL follows expand-contract (Doc-6A §11). `check-schemas.mjs` confirms all 10 frozen schemas exist post-migration.

---

## Clause 6 — CI gates

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | **PASS** (exit 0) |
| Lint incl. import-boundary | `npm run lint` (`eslint .`; `eslint-plugin-boundaries` — contracts-only cross-module) | **PASS** (exit 0) |
| Format | `npm run format:check` (`prettier --check .`) | **FAIL (exit 1) — 15 files → W2X-F1 (MAJOR)** |
| Structure conformance | `node scripts/check-structure.mjs` | **PASS** — 10 modules × (module.ts + 4 contracts + 4 layers) |
| No cross-schema FK | `node scripts/check-no-cross-schema-fk.mjs` | **PASS** — clean (10 migrations scanned) |
| 10 schemas present | `node scripts/check-schemas.mjs` | **PASS** — all 10 frozen schemas |
| Secret scan | `node scripts/check-no-secrets.mjs` | **PASS** — clean (2560 files, 11 patterns) |

### W2X-F1 (MAJOR) — `prettier --check` red on 15 files

**Evidence.** Under the canonical toolchain (`npm ci` → `package-lock.json` pins **prettier 3.8.5**), `npm run format:check` exits 1 with "Code style issues found in 15 files":

```
app/(app)/_components/admin/verification/verification-seed.ts
app/(app)/_components/rfq-workflow/journey.ts
app/(app)/_components/vendor/ads/types.ts
app/(app)/_components/vendor/rfq/types.ts
app/(app)/(buyer)/_components/rfq-create/rfq-form-models.ts
app/(app)/(buyer)/_components/view-models.ts
app/(app)/account/account-view.tsx
app/(public)/_components/vendor-url.ts
src/frontend/components/quotation-state-display.ts
src/frontend/components/rfq/types.ts
src/modules/identity/contracts/types.ts
src/modules/identity/domain/policies/delegation-grant.policy.ts
src/modules/identity/domain/policies/role-composition.policy.ts
src/modules/identity/domain/policies/workflow-settings.policy.ts
src/modules/marketplace/contracts/types.ts
```

**Why this is a genuine gate failure (not an environment artifact):**
- **Not CRLF** — flagged files are LF-clean (0 CR bytes; `file` reports "UTF-8 text"). The diff is real re-wrapping (e.g. union types `{…} | {…}` → leading-`|` multi-line form), not line-endings.
- **Reproducible under the committed lockfile** — `package-lock.json` at `142a2f6` pins prettier 3.8.5, so CI's own `npm ci` installs 3.8.5 and hits the identical failure. This is baked into the tree, not local to my machine.
- **Not merely version drift** — the blobs also fail under the pinned floor `prettier@3.4.2` (21 files), so the committed files are genuinely not prettier-clean under any 3.4–3.8 version, not just the newest.
- **How it slipped through:** `142a2f6` is a consolidation **merge**, and the wave carries many `[checkpoint]` commits from parallel sessions. lint-staged (Husky pre-commit) runs `prettier --write` on **staged files only** — merge results and some checkpoint paths bypass it, so unformatted blobs landed while `tsc`/tests stayed green.

**Impact.** `format:check` is a defined CI merge-gate (`.github/workflows/ci.yml` → "Verify … · format"). It is RED at the exit tip → the branch fails its own CI. Clause 6 requires it green. **Zero** semantic/runtime/security impact — pure whitespace/line-wrapping.

**Suggested disposition (owner/coordinator — I raise, they decide):** run `npm run format` (prettier --write) to reformat the 15 files, pin prettier to an exact version (kill the `^3.4.2` caret drift), re-run the 3× suite + all gates, re-commit. Fast turnaround; not a structural block. The coordinator may reasonably reclassify to MINOR — it still gates (§13 freeze/merge gate = BLOCKER=MAJOR=MINOR=0) until fixed or ruled NIT.

---

## Clause 7 — Build Artifact Checklists

**PASS (with OBS W2X-O2).** `check-structure.mjs` PASS confirms every module has `module.ts` + 4 contracts + 4 layers.

| Artifact | M0 `core` | M1 `identity` |
|----------|-----------|---------------|
| `contracts/` (services.ts · events.ts · types.ts · index.ts) | ✅ all 4 | ✅ all 4 |
| `domain/` | ✅ (`audit-actions.ts`) | ✅ (policies, read-models, state-machines, value-objects) |
| `application/` | ✅ present (`.gitkeep` — M0 is "infra only" per CLAUDE §3, no app-layer logic by design) | ✅ (commands + queries) |
| `infrastructure/` | ✅ (`data/`, `events/`) | ✅ (`data/`) |
| `api/` | ✅ present (`.gitkeep` — infra-only) | ✅ (17 handlers) |
| `<module>.module.ts` | ✅ `core.module.ts` | ✅ `identity.module.ts` |
| Module `README.md` | ❌ absent (**OBS**) | ✅ present |

The canonical module shape (REPOSITORY_STRUCTURE §106–131) is `contracts/ + domain/ + application/ + infrastructure/ + api/ + <module>.module.ts` — **README is not part of it**, so M0's absence is a documentation asymmetry, non-gating.

---

## Clause 8 — Repository Ownership Audit (One Module, One Owner)

**PASS.** No violations across the integrated wave:
- **Cross-module imports:** none. `eslint-plugin-boundaries` (lint exit 0) enforces "a module imports only its own internals + ANY module's `contracts/` + shared"; direct grep for non-contracts cross-module imports (`@/modules/*/{domain,application,infrastructure,api}`) = empty.
- **Cross-module FKs:** none. `check-no-cross-schema-fk.mjs` clean (10 migrations) — no `REFERENCES <other-schema>.` crossing a boundary.
- **Cross-schema raw SQL (runtime):** none. Zero `$queryRaw*`/`$executeRaw*` in `src/modules`, `src/server`, `inngest`. The only raw SQL in the repo is the sanctioned **test-harness** RLS backstop (`tests/_harness/db.ts`, Doc-8B §5) — not module runtime.
- **identity → core POLICY reads:** via the **M0 config CONTRACT service** (`core.config_value_query.v1`) keyed by **name string** (e.g. `"core.system_configuration.identity.command_dedup_window"`, M0 strips the fixed prefix). This is reference-by-key through a contract — not cross-schema table access, FK, or raw SQL.
- **core → identity:** no reference to `identity.*` from `src/modules/core`.

M0 owns `core`, M1 owns `identity`; references by ID/key only.

---

## Clause 9 — Merge-consistency spot check

**PASS.** The integrated tree is internally consistent; the merge left no duplication:
- **No conflict markers** (`<<<<<<<`/`=======`/`>>>>>>>`) in `src`/`inngest`/`prisma`; **no** `.orig`/`.bak`/`.rej`/`~` leftovers.
- **audit-action catalogs:** exactly one per module — `core/domain/audit-actions.ts` + `identity/domain/audit-actions.ts`. No orphan/duplicate.
- **Single outbox-audit implementation:** only `drain-outbox.service.ts` implements it (`contracts/services.ts` declares, `domain/audit-actions.ts` catalogs — no competing impl).
- **drain-outbox audit path:** `drainOutbox()` orchestrates two workers — `dispatchOutboxEvents()` (audit at line 169) and `archiveDispatchedEvents()` (audit at line 232) — **exactly ONE `appendAuditRecord` per worker** ("ONE System-attributed immutable audit record per run that ADVANCED", D-5 / BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1). Two workers → two run/batch audit legs, one each. Consistent with "one run/batch audit path per worker."
- Same-named files across module dirs (`events.ts`, `index.ts`, `services.ts`, `types.ts`, `audit-actions.ts`) are per-module contracts — the canonical shape, not duplication.

---

## Verdict

- **Clause 1** Full suite 3× green (386/33, deterministic, no flake, no `.only/.skip/.todo`, all required bands) — **PASS**
- **Clause 2** 25 POLICY keys (18 core + 7 identity), values verbatim vs Doc-3 v1.0/v1.9 — **PASS**
- **Clause 3** All 6 M1 ESC carries dispositioned + genuinely fail-closed in code — **PASS**
- **Clause 4** Zero TODO/FIXME/HACK in M0+M1 path — **PASS**
- **Clause 5** 10 forward-only migrations apply clean/in-order on fresh DB — **PASS**
- **Clause 6** tsc/eslint/import-boundary/structure/FK/schemas/secrets green; **`prettier --check` RED (15 files) → W2X-F1 MAJOR** — **FINDING**
- **Clause 7** M0+M1 module artifacts complete (README non-mandated; OBS on M0) — **PASS**
- **Clause 8** No cross-module imports / FKs / raw SQL; ownership intact — **PASS**
- **Clause 9** No merge duplication; one audit path per worker — **PASS**

**Findings:** BLOCKER=0 · **MAJOR=1** (W2X-F1) · MINOR=0 · NIT=0 · OBS=2 (W2X-O1, W2X-O2).

# EXIT-GATE BLOCKED (MAJOR=1) — gating finding: W2X-F1 (`prettier --check` red on 15 files, a required CI merge-gate). All 8 other clauses GREEN; remediation trivial and non-semantic (`npm run format` + exact prettier pin + re-verify). Reviewer raises; coordinator/owner disposes.

---

*Audit performed on a detached checkout of `142a2f6` in an isolated worktree with a throwaway Postgres (`ivendorz_w2audit`, port 5546, fresh DB, all migrations applied). Worktree tree == `142a2f6` (git clean besides this report; `.env.local` gitignored, probe DB external).*
