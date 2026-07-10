# REVIEW-B — W2-IDN-7 (M1 module conformance gate) · Team-5 Quality & Adversarial

*Independent, fresh-context adversarial review. Opened AFTER Review-A (RV-0160) PASS 0/0/0.
Reviewer re-attacks; does not trust A's re-derivations. Raise ≠ Accept.*

- **Target:** code = `e9ff0b8` (delta base `1dc0edb`, 14 files). Worktree HEAD `e08a8a8`
  (= `e9ff0b8` + concurrent-session churn + coordinator markdown). **Backend code byte-identical
  to `e9ff0b8`** — verified: none of the 14 target files appears in the `e9ff0b8..e08a8a8` diff.
- **Isolation mode used:** **DEDICATED DOCKER DB on `:5433`** (container `idn7b-db`,
  `postgres:16`), separate from the main `:5432` (`ivendorz-db-1`, being probed by Team-6). Fresh
  `npm ci` + `prisma generate` + `prisma migrate deploy` in this isolated worktree. `.env.local`
  (gitignored) points Prisma at `:5433`. Main DB and main tree **never touched** by any DB-mutating
  sabotage. Full suite + all sabotages ran on `:5433` only.

---

## VERDICT

**ISSUES — BLOCKER 0 · MAJOR 0 · MINOR 1 · NIT 0 · OBS 2**

The deliverable is frozen-accurate and structurally sound: every catalog/POLICY-key/parser claim
matches Doc-2 v1.0.8 + Doc-3 v1.9 verbatim, all *structural* discriminating tests genuinely BITE
(proven by sabotage-revert), both routing-slug twins are independently pinned, idempotency holds,
and the live §B.6 consumer fails loud with no literal fallback. **One MINOR coverage gap** is
raised (seeded POLICY *values* are pinned nowhere — a wrong-but-valid duration passes all 381
tests). It is **borderline OBS** (see disposition) and is routed to the author/Board to adjudicate
under the §13 4-gate (Raise ≠ Accept).

---

## Findings table

| # | Sev | file:line | Frozen anchor | 4-gate (Valid / Applicable / Best-for-product / Corpus-consistent) |
|---|-----|-----------|---------------|--------------------------------------------------------------------|
| B-F1 | **MINOR** | `tests/integration/identity-policy-keys-seed.test.ts:77-101` (tests (a)+(b)); no value-pin anywhere in the suite | Doc-3 v1.9 §3 registers the exact start **values** (24h/24h/24h/14d/365d/1h/7d), not just names | **Valid: YES** — empirically, seeding `command_dedup_window="48h"` (wrong; frozen = 24h) leaves **all 381 tests green** (full suite). **Applicable: YES** — the suite's stated purpose is seed↔Doc-3-v1.9 conformance; the values are operationally load-bearing dedup/timer/validity windows. **Best-for-product: DEBATABLE** — the test deliberately avoids restating a literal POLICY value (header comment) and the values are *tunable* POLICY (Doc-3 "changes audited"). **Corpus-consistent: the corpus treats the values as tunable and does not mandate a value-pin; all 7 seeded values ARE correct** (I verified each against Doc-3 v1.9 §3). |

**Disposition note on B-F1 (borderline).** This is a *test-coverage* gap, not a defect in the
*delivered seed* — the 7 seeded values are correct and human/review-verified. What is caught:
key **presence** (set-equality, test (d)), **value_type** (`duration`, test (b)), **interpretability**
(`policyDurationToMs` throws on garbage, test (b)), and **service↔row consistency** (test (a)). What
is NOT caught: a wrong-but-still-valid duration (48h vs 24h; 1d vs 14d…). The COMPLETION-REPORT
**does not over-claim** — §6 scopes this highlight to "value + value_type" consistency and "mis-typed",
never to the Doc-3 value. Recommended dispositions for the author/Board: **(i)** add one
value-conformance assertion (interpret each seeded value and assert the exact ms per the Doc-3
start value), catching a seed typo on a load-bearing window; **OR (ii)** formally accept as
tunable-POLICY-not-pinned and **downgrade to OBS** (the intentional no-literal-duplication design).
Raised MINOR (not silently accepted) so the decision is recorded.

### OBS (non-gating)

- **OBS-1** — `COMPLETION-REPORT.md §1` states the baseline as **"381/31→381/33"**; the real
  dispatch baseline is **368/31** (packet §1; §6 states it correctly as "368/31 → 381/33"). Cosmetic
  narrative typo in the report prose; the code/counts are correct. No action implied.
- **OBS-2** — `README.md` DoD row "35 caller-facing + 7 out-of-wire = 42 Doc-4C contracts wired" is a
  **carried prior-WP assertion** (6.1–6.8), not a W2-IDN-7 deliverable; I did not independently
  re-derive the 42-count (out of the code delta's scope). Informational only.

**Verified honest (no finding):** the `command_dedup` window-clock split (JS clock in the FIND path
vs SQL `now()` in the atomic CLAIM guard) is **preserved, not unified** — transparently documented
(README "Note on the window-clock" + report §8 call 2) and correctly scoped OUT (unifying would
change observable behavior; the *parser* — the substantive duplication — IS unified). Not a defect.

---

## Per-sabotage discrimination table (each proven non-vacuous)

| # | Sabotage (mutation) | Target test → EXACT red locus | Restore (byte-clean) |
|---|---------------------|-------------------------------|----------------------|
| **1a** | Remove `staff_can_view_routing` tuple from `20260710160000…/migration.sql` → reset+migrate | catalog suite **4 red**: `seeds exactly 45…` → **44≠45**; `…9 staff-space…` → **8≠9**; `it.each` `staff_can_view_routing…ZERO org bundles` → **findUniqueOrThrow "No record was found"**; `double-run idempotency` → **44≠45**. Twin `manage_routing` it.each stayed GREEN. | `git checkout` → hash `6048dce1…` == HEAD; status clean |
| **1b** | Remove `staff_can_manage_routing` tuple (twin) → reset+migrate | catalog suite **4 red**, incl. `it.each` `staff_can_manage_routing…ZERO org bundles`. Twin `view_routing` it.each stayed GREEN. | hash `6048dce1…` == HEAD; status clean |
| **2a** | DB-INSERT `role_permissions(Owner bundle, staff_can_view_routing, org=NULL)` | catalog suite **4 red**: `it.each` `staff_can_view_routing…` → **1≠0**; `Invariant #2 hard guard` → **1≠0**; `bundle 'Owner'` → **37≠36**; `total…=103` → **104≠103** | DB row DELETEd; staff-mappings back to 0; catalog 13/13 GREEN. No file touched. |
| **2b** | DB-INSERT twin `(Owner, staff_can_manage_routing, NULL)` | catalog suite **4 red**, incl. `it.each` `staff_can_manage_routing…` → **1≠0** + hard guard → **1≠0** | DB row DELETEd; staff-mappings=0; 13/13 GREEN. No file touched. |
| **3a** | `command_dedup_window` value `"24h"→"48h"` in `20260710170000…/migration.sql` → reset+migrate | **NO red — FINDING B-F1.** seed suite + policy-duration + 2 live consumer slices = **52 GREEN**; **FULL SUITE = 381/33 GREEN** under the wrong value | `git checkout` → hash `eb59ac14…` == HEAD; status clean |
| **3b** | DROP `command_dedup_window` row from the same migration → reset+migrate | seed suite **4 red**: `resolves all 7…` → **"seed row missing for identity.command_dedup_window"**; `each…duration…` → **red (configValueQuery THREW)**; `EXACT reference-form constants…resolve` → **red (THREW)**; `exactly 7 keys` → **6≠7** | hash `eb59ac14…` == HEAD; status clean |
| **3b-consumer** | DB-DELETE `command_dedup_window` row; call the LIVE §B.6 path (throwaway probe) | `configValueQuery(COMMAND_DEDUP_WINDOW_KEY)` **and** `claimCommandDedupRecord(...)` **both throw `/POLICY key not found/`** — no literal fallback (RV-0159 P5 precedent). M0 source: `system-configuration.service.ts:57-62` throws `core_config_key_not_found`; the 3 consumers propagate (no try/catch, no `?? literal`). | probe file deleted; key re-seeded; status clean |
| **4a** | Throw template `(W2-IDN-7 seed).`→`(W2-IDN-7 seedX).` in `policy-duration.ts` | policy-duration **1 red**: `reproduces each former call site's VERBATIM throw message` → **Expected "…(W2-IDN-7 seed)." Received "…(W2-IDN-7 seedX)."**. The 6 `/not an interpretable duration/` regex tests stayed GREEN (proves the verbatim test pins byte-for-byte). | `git checkout` → hash `e4060e09…` == HEAD; status clean |
| **4b** | Parse arm `h: 3_600_000 → 3_600_001` in `policy-duration.ts` | policy-duration **3 red**: `…<int><unit> arm (s/m/h/d)`, `…5 Doc-3 v1.9 seeded values exactly`, `…whitespace…` → all **86400024≠86400000** | hash `e4060e09…` == HEAD; status clean |
| **5** | Re-execute BOTH whole seed migrations ×2 on the clean DB | `perms=45 staff=9 idkeys=7 routing_rows=2 idkey_pk_rows=7` **identical BEFORE/AFTER** — no dup rows (`ON CONFLICT (slug)`/`(key)` DO UPDATE; deterministic format-v4 UUID PKs) | DB-only; no file touched |

**Byte-clean attestation (final):** all 3 mutated source files `git hash-object` == HEAD blob
(`policy-duration.ts`=`e4060e09…`, `routing_slugs_seed`=`6048dce1…`, `policy_key_seed`=`eb59ac14…`);
`git status --porcelain` on tracked files = **empty**; HEAD unchanged (`e08a8a8`). DB-only sabotages
touched no file. `.env.local` is gitignored (does not dirty tracked status).

---

## Twin-class + over-claim results (the RV-0157/0159 "fix-the-class" lens)

- **BOTH routing slugs pinned?** **YES — independently, in BOTH paths.** `it.each(ROUTING_SLUGS)`
  covers `staff_can_view_routing` AND `staff_can_manage_routing`; sabotage 1a/1b (catalog-count +
  presence) and 2a/2b (firewall `rolePermission.count===0`) each reddened the *specific* slug while
  its twin stayed green. **No twin-unpinned gap** (contrast RV-0157 `list_roles`).
- **ALL 7 POLICY keys pinned?** Split result:
  - **PRESENCE — YES, all 7 uniformly.** Test (d) is a set-equality + count over
    `REGISTERED_IDENTITY_KEYS`; it catches any missing/extra/renamed key. Demonstrated red by
    dropping one (3b); the mechanism is uniform across all 7.
  - **VALUE — NO, none of the 7.** Tests compare service↔row (a), and type/interpretability (b) —
    never the Doc-3 value. Uniform mechanism ⇒ the gap is **class-wide (all 7)**, demonstrated
    full-suite-green under a wrong value (3a). → **Finding B-F1.**
- **Truthful-comment lens (RV-0158):** the `list-permissions.query.ts:13` comment `43 → "45 slugs
  — 36 tenant + 9 staff"` is **TRUE as-built AND tested** (`role-wire-slice.test.ts:204-220`
  asserts 45/36/9 via `handleListPermissions`). Migration header comments truthful (45=36+9; the
  "45 (38/7) prose is stale" call-out is correct per Doc-6C_Patch_v1.0.3). README DoD rows truthful
  (modulo OBS-2). **No false/contradictory comment found.**
- **Does the full suite pass under ANY wrong impl?** **YES for a wrong-but-valid seeded VALUE**
  (B-F1). **NO for every structural mutation** — all catalog/firewall/parser/throw-message/presence
  sabotages bit. The parser canonicalization is provably behavior-preserving (byte-identical arms +
  verbatim throws; 4a/4b).

---

## Frozen-accuracy re-derivation (independent; did not trust Review-A)

- **Doc-2 v1.0.8 (PATCH-D2-07):** both routing slugs `space='staff'`; catalog 43→**45 = 36 tenant
  + 9 staff**; staff = separate space, on NO org bundle. Migration `20260710160000` matches verbatim;
  DB confirms 45/36/9, both slugs `staff`, 0 staff→bundle, 103 role-perm rows.
- **Doc-3 v1.9 §3:** all 7 key **names + values** (24h/24h/24h/14d/365d/1h/7d, all `duration`)
  match migration `20260710170000` **byte-for-byte**; DB confirms 7 `identity.*` rows with these
  exact values. None coined.
- **Deterministic PKs:** format-v4 UUID constants (`1de77a17-05c9-4000-8000-…`,
  `1de77a17-0901-4000-8000-…`), hand-authored — matches Board Option A; never `gen_random_uuid()`.
- **Canonicalization:** original three copies (`durationToMs`×2, `windowToMs`) had byte-identical
  parse arms (regex `/^(\d+)\s*([smhd])$/`, units `{s:1000,m:60_000,h:3_600_000,d:86_400_000}`,
  `value*1000` seconds arm) → `policyDurationToMs` reproduces them exactly; the 3 context labels
  reproduce the 3 former throw messages verbatim (pinned by `policy-duration.test.ts:51-63`).
- **No literal fallback:** `configValueQuery` throws `core_config_key_not_found` on a missing row;
  the 3 consumers + `claimCommandDedupRecord` propagate with no catch/fallback (source + runtime probe).
- **Doc-6C_Patch_v1.0.3:** additive count overlay (43→45; 36 tenant + 9 staff), coins nothing, no
  base edit. Correct.

---

## Suite result

- **Clean full suite (isolated `:5433`): 381 passed / 33 files — 0 failed.** Matches
  COMPLETION-REPORT (381/33). Delta vs dispatch baseline 368/31 = +13 tests / +2 files (as claimed).
- Target-suite green baseline (pre-sabotage): 34/34 (policy-duration 7 · catalog 13 · policy-keys 4
  · role-wire 10).

## Gate roll-up

| BLOCKER | MAJOR | MINOR | NIT | OBS |
|---|---|---|---|---|
| 0 | 0 | **1** (B-F1, borderline-OBS) | 0 | 2 |

Freeze/merge gate (BLOCKER 0 · MAJOR 0 · MINOR 0): **not met** solely on B-F1. If the author/Board
adjudicates B-F1 to OBS/WONTFIX under the §13 4-gate (best-for-product: tunable POLICY, values
correct + reviewed, no over-claim), the gate closes clean.

---

## Notes for the coordinator (quiet-tree 3× green reconciliation)

- My isolated run is authoritative for the CODE (backend byte-identical to `e9ff0b8`); the concurrent
  FE churn in `e08a8a8` does not touch any of the 14 target files, so the coordinator's quiet-tree
  3× green on `:5432` should reproduce **381/33** for these suites. The seed START/END counts on a
  fresh migrate are **perms 45 (36/9) · role-perm 103 · identity POLICY keys 7** (idempotent — a
  re-run leaves them identical, proven).
- **Concurrency caution (per the review-log rule):** do NOT run the DB-mutating catalog/policy-key
  suites against the shared `:5432` while Team-6 is probing it — they mutate `role_permissions` /
  `core.system_configuration` fixtures. My sabotages ran only on the isolated `:5433`.
- **Teardown:** isolated container `idn7b-db` (`:5433`) + `.env.local` (gitignored) are mine; safe to
  remove after close.
- **B-F1 is the only open item.** Everything else the WP claims is verified true and non-vacuous.
