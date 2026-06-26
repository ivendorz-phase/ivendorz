# Doc-8C — Content Pass-2 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8C_Content_v1.0_Pass2.md` (§5–§9) |
| Against | `Doc-8C_Content_Pass2_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 3 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED; proceed to Content Freeze Audit |
| Method | Additive content patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MINOR-1 — §6 single-effect: emit vs non-emit → **FIXED**
§6's single-effect clause is split (inventory gains an `emits_event` flag derived from `Doc-2 §8` / `Doc-4J`):
> **Single-effect [binding]:** for **event-emitting** contracts (`emits_event = true`, from the frozen `Doc-2 §8` emitter list / `Doc-4J` catalog), the deduped replay produces **no second `core.outbox_events` row** (Doc-8B §7 outbox observer). For **non-emitting** idempotent contracts, the replay produces a **single state effect** — no double-write / double-increment (assert the DB row count / value unchanged by the replay). The `emits_event` flag selects which.

### MINOR-2 — §5 un-triggerable declared error class → **FIXED**
§5 gains the no-silent-omission clause:
> **Un-triggerable classes [Doc-8A §3.4 / no-silent-caps]:** a declared error class that cannot be triggered deterministically in the hermetic harness (e.g. concurrency/conflict races, downstream-timeout) is **either** forced via a **targeted fault-injection** (the Doc-8B §7 mocked boundary induces the condition) **or** recorded as an explicit **coverage-limitation by pointer** (logged in the coverage attestation, §9) — **never silently skipped**. Silent omission is the inverse of never-weaken.

### MINOR-3 — §9 "PASS" implies execution → **FIXED**
§9's attestation table is restated (the Doc-8B §9 "realizes-by-design" phrasing):
> Doc-8C **realizes/satisfies Bands A and B by design** — the conventions + parameterized checks (§2–§8) are complete and oracle-anchored to the frozen Doc-5 surface. The **per-assertion PASS/FAIL is recorded at execution**, once the application code exists (per-suite oracle-readiness: the oracle — Doc-5 — is frozen now; execution awaits code). Bands C–I N/A.

### NITPICK-1 — §8 field-trace direction → **FIXED (applied)**
§8: "every **present** response field is `§HB`-declared (no coined field); **declared-optional** fields **may be absent**."

### REJECTED finding — upheld
"§8 duplicates Doc-8D RLS" stays **REJECTED as false** — API-surface contract scope (8C) vs DB RLS backstop + cross-tenant (8D); one behavior, two layer-checks; dropping either leaves a hole. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER / MAJOR | 0 / 0 | 0 / 0 |
| MINOR | 3 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Closure Check

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 emit vs non-emit single-effect | MINOR | **CLOSED** — `emits_event` flag; outbox-observer vs state-effect |
| MINOR-2 un-triggerable error class | MINOR | **CLOSED** — fault-inject or logged coverage-limitation; no silent skip |
| MINOR-3 realizes-by-design vs PASS | MINOR | **CLOSED** — realizes by design; PASS/FAIL at execution |
| NITPICK-1 field-trace direction | NIT | **CLOSED** — present→declared; optional may be absent |
| REJECTED (§8 vs 8D) | — | **Upheld false** |

No new defect. **0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED.** Both content passes (§0–§9) approved → ready for Content Freeze Audit.

*End of Content Pass-2 Patch v1.0.1 + Closure Check. Next: Content Freeze Audit → `Doc-8C_SERIES_FROZEN_v1.0`.*
