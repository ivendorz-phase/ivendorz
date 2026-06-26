# Doc-8C — Content Pass-2 (§5–§9) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8C_Content_v1.0_Pass2.md` (§5–§9) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 3 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-2 Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- `Doc-5A §6.2` (error taxonomy) · `Doc-4A §9.7` (10 prohibited categories / CHK-087) + idempotency-key · `Doc-3 §12` (namespaced, via the Pass-1 `namespace` column) · `Doc-6A §10`/`R8/§4` (cross-refs) · owning `Doc-4x §HB` · `Doc-5C R2`/`Doc-5D`/`Doc-5J` (actor models) · `Doc-8B §6/§7` (seeded clock, outbox observer) · CLAUDE.md §4 · Invariants #6/#7 — all correctly invoked.
- Pass-1 fixes consumed (§6 reads `namespace`; single-effect via the Doc-8B §7 outbox observer); the §8 seam (8C API-scope / 8D RLS) carried.

0 BLOCKER, 0 MAJOR. The four remaining Band-B checks are oracle-anchored and the seam discipline holds. Three correctness refinements + one direction nit.

### MINOR-1 — §6 single-effect conflates outbox emission with **all** idempotent mutations; not every idempotent command emits an event
§6 asserts "no second `core.outbox_events` row for the deduped replay" via the Doc-8B §7 outbox observer. But **not every idempotent mutation is a §8 event emitter** — many idempotent commands produce a DB state change with **no outbox row** at all. For those, the single-effect assertion must read **DB state** (no double-write), not the outbox (which would be vacuously satisfied — there's no row either way).
**Required fix:** §6 — split single-effect: for **event-emitting** contracts, assert no second `core.outbox_events` row (Doc-8B §7 observer); for **non-emitting** idempotent contracts, assert a single **state effect** (no double-write/double-increment). The inventory row's emit-or-not flag (derivable from the frozen `Doc-2 §8` emitter list / `Doc-4J` catalog) selects which.

### MINOR-2 — §5 must not silently skip a declared error class that cannot be deterministically triggered (never-weaken extends to never-silently-omit)
§5 drives "each declared error condition," but some declared classes (e.g. concurrency/conflict races, downstream-timeout) **cannot be triggered deterministically** in the hermetic harness. Silently skipping them would be a coverage hole disguised as green — the inverse of never-weaken (`Doc-8A §3.4`).
**Required fix:** §5 — an un-triggerable declared error class is **either** triggered via a targeted fixture / fault-injection (the mocked boundary forces the condition — Doc-8B §7) **or** recorded as an explicit **coverage-limitation by pointer** (logged, not silently dropped — the Doc-8A "no silent caps" discipline). Never a silent skip.

### MINOR-3 — §9 attestation states "PASS" for Bands A/B, implying execution; the suite is **authored, not run** (code NOT STARTED)
§9's table marks Bands A/B "PASS." But Doc-8C is a content pass authoring the suite **design** — the application code under test does not exist yet (CLAUDE.md). "PASS" implies the suite ran green, which it cannot have.
**Required fix:** §9 — restate as Doc-8C **realizes/satisfies Bands A/B by design** (the conventions + parameterized checks are complete and oracle-anchored); the **per-assertion PASS/FAIL is recorded at execution** once the code exists (per-suite oracle-readiness — the oracle (Doc-5) is frozen now; execution awaits code). Match the Doc-8B §9 "realizes directly" phrasing.

### NITPICK-1 — §8 field-trace direction should be explicit
§8 says "every field traces to `§HB`." Direction: **every field *present in the response* must be `§HB`-declared** (no coined field); a **declared-optional** field **may be absent**. State the direction so a reviewer doesn't read it as "every declared field must be present."
**Suggested fix:** §8 — "every **present** response field is `§HB`-declared; declared-optional fields may be absent."

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§8's actor-scope assertion duplicates Doc-8D's RLS cross-tenant test — both check actor X can't see actor Y's data."* | **REJECTED (false).** Different layers, different oracles. Doc-8C asserts the **contract-declared actor scope at the API surface** (the contract's documented boundary); Doc-8D asserts the **RLS backstop** (the DB enforces isolation even if the app layer is bypassed) + cross-tenant byte-equivalence. The §8 seam states this (one behavior, two layer-checks). Dropping either leaves a hole — 8C-only has no DB-enforcement proof; 8D-only has no contract-surface proof. Not redundant. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 §6 single-effect: emit vs non-emit | MINOR | Pass-2 Patch — split outbox-effect / state-effect by emit flag |
| MINOR-2 §5 un-triggerable error class | MINOR | Pass-2 Patch — fault-inject or log coverage-limitation; no silent skip |
| MINOR-3 §9 "PASS" implies execution | MINOR | Pass-2 Patch — realizes-by-design; PASS/FAIL at execution |
| NITPICK-1 §8 field-trace direction | NIT | Pass-2 Patch — present→declared; optional may be absent |

**Gate:** 3 MINOR open → **Pass-2 Patch required**, then short closure check, then Content Freeze Audit → SERIES_FROZEN.

*End of Independent Hard Review (Content Pass-2). Nothing coined; no frozen document edited.*
