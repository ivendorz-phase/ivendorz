# W2-IDN-7 — Review-B DELTA re-verify (RV-0160 · B-F1 fix-forward)

| Field | Value |
|---|---|
| Lane | **B-delta re-verify** — fresh-context, independent (Raise ≠ Accept; read-only for findings) |
| Milestone | **W2-IDN-7** — 7 `identity.*` POLICY-key seed (Doc-3 v1.9 §3 / Doc-6C §5–§6) |
| Review round | **RV-0160** |
| Fix under test | `c562e7f` — *test(identity): W2-IDN-7 pin 7 POLICY-key Doc-3 values (RV-0160 B-F1)* |
| Finding re-verified | **B-F1 (MINOR)** — the 7 seeded POLICY **values** were unpinned; a wrong-but-valid value (`command_dedup_window="48h"`) passed all 381 tests |
| Isolation | dedicated git worktree, `git checkout c562e7f` (detached, HEAD = `c562e7ffbda45ddd9b68b38726bfbf54354c9f16`); throwaway DB `ivendorz_bdelta_tmp` on the running `postgres:16` (`:5432`), dropped at end; real `npm ci` (no node_modules junction) |
| **VERDICT** | **✅ PASS — B-F1 RESOLVED (class-wide, all 7 keys) · A ✅ + T6 ✅ STAND · 0/0/0** |

---

## Point 1 — Code-delta integrity (the gate-standing proof)

**Diff 1 — M1 backend code unchanged e9ff0b8 → c562e7f (MUST be empty):**

```
$ git diff e9ff0b8 c562e7f -- src/modules/identity src/server/identity prisma inngest
(empty — exit 0, no lines, --stat empty)
$ git merge-base --is-ancestor e9ff0b8 c562e7f  →  YES (e9ff0b8 is an ancestor of c562e7f)
```

The M1 backend surface (`src/modules/identity`, `src/server/identity`, `prisma`, `inngest`) that
Review-A reviewed at `e9ff0b8` (Review-A PASS, `e08a8a8`) and Team-6 Security reviewed
(`a5fe096`, PASS 0/0/0) is **byte-identical at `c562e7f`**. → **Review-A ✅ and Team-6 ✅ STAND
without re-review.**

**Diff 2 — the fix commit is test-only:**

```
$ git diff --stat c562e7f~1 c562e7f
 tests/integration/identity-policy-keys-seed.test.ts | 53 ++++++++++++++---
 1 file changed, 50 insertions(+), 3 deletions(-)
```

`c562e7f~1` = `2a4f2f2` (an unrelated FE token-removal chore). The fix touches **only**
`tests/integration/identity-policy-keys-seed.test.ts` — no production, migration, contract, or
schema change. It adds one `DOC3_REGISTERED_VALUES` map + one new `it(...)` value-conformance test
(4 seed tests → **5**, raising the suite total 381 → **382**). Purely additive test coverage.

---

## Point 2 — B-F1 resolved CLASS-WIDE (7-key sabotage discrimination)

For **each** of the 7 `identity.*` keys, I temporarily edited **only that key's** value in the seed
migration to a wrong-but-valid duration, ran the seed test file against the throwaway DB (the suite's
`beforeAll` re-applies the on-disk `INSERT … ON CONFLICT DO UPDATE`, so the wrong value lands in
`core.system_configuration`), then reverted byte-clean. **Every key bit** — exactly one test failed
(the new value-pin), 4 passed, and the failure named exactly the sabotaged key:

| # | Key | Sabotage | Result | Failing assertion (locus) | Revert |
|---|---|---|---|---|---|
| 1 | `command_dedup_window` | `24h`→`48h` | 1 failed / 4 passed | `command_dedup_window: … expected '48h' to deeply equal '24h'` | byte-CLEAN |
| 2 | `user_update_dedup_window` | `24h`→`48h` | 1 failed / 4 passed | `user_update_dedup_window: … expected '48h' to deeply equal '24h'` | byte-CLEAN |
| 3 | `membership_invite_dedup_window` | `24h`→`48h` | 1 failed / 4 passed | `membership_invite_dedup_window: … expected '48h' to deeply equal '24h'` | byte-CLEAN |
| 4 | `membership_invite_expiry_window` | `14d`→`21d` | 1 failed / 4 passed | `membership_invite_expiry_window: … expected '21d' to deeply equal '14d'` | byte-CLEAN |
| 5 | `delegation_validity_default` | `365d`→`400d` | 1 failed / 4 passed | `delegation_validity_default: … expected '400d' to deeply equal '365d'` | byte-CLEAN |
| 6 | `delegation_expiry_sweep_cadence` | `1h`→`2h` | 1 failed / 4 passed | `delegation_expiry_sweep_cadence: … expected '2h' to deeply equal '1h'` | byte-CLEAN |
| 7 | `ownership_succession_reminder_cadence` | `7d`→`10d` | 1 failed / 4 passed | `ownership_succession_reminder_cadence: … expected '10d' to deeply equal '7d'` | byte-CLEAN |

**Discrimination is exact.** Each wrong value is a *valid* duration, so sibling tests (a) value/type
consistency, (b) `policyDurationToMs > 0`, (c) consumer-constant resolve, (d) exactly-7-exist all
stayed **green** — proving the pre-fix state would have shipped any of these 7 drifts green (B-F1 is
real) and the new value-pin is the *only* assertion that catches it. The pin fires at **exactly** the
drifted key via the per-key `Record<…7 keys…>` map + loop. **NOT the RV-0157/0159 twin-unpin class**
— the fix swept the whole 7-key class, not just the one key the fix-forward demoed. Each sabotage was
reverted and confirmed byte-clean before the next.

---

## Point 3 — Doc-3 conformance of the 7 pins (false-conformance guard)

Re-read `generatedDocs/Doc-3_Policy_Key_Registration_Patch_v1.9_Identity.md` §3 (the "Proposed start
value" column, Board-confirmed §3.1) **verbatim**. The test's `DOC3_REGISTERED_VALUES` pins match the
frozen registry exactly — and the migration seed matches too:

| Key | Doc-3 v1.9 §3 value | Test pin | Migration seed | Match |
|---|---|---|---|---|
| `command_dedup_window` | **24h** | `24h` | `"24h"` | ✅ |
| `user_update_dedup_window` | **24h** | `24h` | `"24h"` | ✅ |
| `membership_invite_dedup_window` | **24h** | `24h` | `"24h"` | ✅ |
| `membership_invite_expiry_window` | **14d** | `14d` | `"14d"` | ✅ |
| `delegation_validity_default` | **365d** | `365d` | `"365d"` | ✅ |
| `delegation_expiry_sweep_cadence` | **1h** | `1h` | `"1h"` | ✅ |
| `ownership_succession_reminder_cadence` | **7d** | `7d` | `"7d"` | ✅ |

No false-conformance pin. The pins encode the **frozen** values; nothing coined (names + values both
transcribed from Doc-3 §3). Live DB read-back on the pristine baseline confirmed all 7 rows carry the
frozen values.

---

## Point 4 — 3× green stability (doubles as quiet-tree reconciliation)

Migration restored to `c562e7f`'s correct state; throwaway DB dropped + recreated pristine
(`prisma migrate deploy` = all 10 migrations applied); FULL suite run **3× consecutively** in the
isolated worktree/DB:

| Run | Test Files | Tests | Result | Duration |
|---|---|---|---|---|
| 1 | **33 passed (33)** | **382 passed (382)** | ✅ 0 failed | 25.15s |
| 2 | **33 passed (33)** | **382 passed (382)** | ✅ 0 failed | 26.14s |
| 3 | **33 passed (33)** | **382 passed (382)** | ✅ 0 failed | 26.01s |

**382 tests / 33 files, green all three runs.** No flake observed — the known **WI-CAS-FLAKE** did
**not** manifest in any of the 3 runs (cross-run scan for `failed`/`FAIL`/`CAS` reddening = 0 hits).
`382` = the pre-fix `381` + the one new value-conformance `it(...)`.

---

## Point 5 — Byte-clean teardown

- HEAD still `c562e7f`; `git status --short` = **empty** (no tracked modifications).
- `migration.sql` and `identity-policy-keys-seed.test.ts` blobs both **byte-identical to HEAD**
  (`git hash-object` == `git rev-parse HEAD:<path>`).
- All 7 sabotage edits reverted via `git checkout`, each confirmed byte-clean before proceeding.
- Throwaway DB `ivendorz_bdelta_tmp` **dropped** (`DROP DATABASE … WITH (FORCE)`, confirmed absent).
- The shared `ivendorz` DB (`:5432`) was **never targeted** — every DB step ran against
  `ivendorz_bdelta_tmp` only.

---

## Gate roll-up (for coordinator → Board close)

| Lane | State at | Verdict |
|---|---|---|
| Review-A (architecture/governance) | `e9ff0b8` | ✅ PASS 0/0/0 — **STANDS** (code byte-identical at `c562e7f`) |
| Team-6 (security) | `e9ff0b8` | ✅ PASS 0/0/0 — **STANDS** (code byte-identical at `c562e7f`) |
| Review-B (original) | `e9ff0b8` | B-F1 (MINOR) raised — value-pin gap |
| **B-delta (this)** | `c562e7f` | **✅ PASS — B-F1 RESOLVED class-wide; 0 BLOCKER / 0 MAJOR / 0 MINOR** |

**Freeze/merge gate (BLOCKER 0 · MAJOR 0 · MINOR 0): MET.** B-F1 is closed by the `c562e7f`
test-only pin, independently proven to bite for all 7 keys. No new findings. The fix is additive,
production code is untouched, and the suite is stable at 382/33 across 3 consecutive runs.
Recommend **Board close** of W2-IDN-7 / RV-0160.

---

*Independent B-delta re-verify at `c562e7f`. Read-only for findings — every sabotage reverted
byte-clean; throwaway DB dropped. Coins nothing; Doc-3 v1.9 §3 remains the value SSoT — on any drift
the frozen doc wins.*
