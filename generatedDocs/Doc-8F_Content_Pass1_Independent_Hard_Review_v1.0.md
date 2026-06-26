# Doc-8F — Content Pass-1 (§0–§3) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8F_Content_v1.0_Pass1.md` (§0–§3) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-1 Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- `Doc-4J` (catalog) · `Doc-4L` (flow) · `Doc-2 §8` (emitters) · `Doc-6A §7`/`Doc-6B` (`core.outbox_events`) · **`Doc-4B §16.2`** (the sole sanctioned outbox write — verified via `Doc-6B §3.2`) · Invariant #7 · CLAUDE.md §10 (module shape) · `Doc-8A §4.2` (through-contracts) · `Doc-8B §7`/§3 (observer/savepoint) · `Doc-8D §6` (FK cross-ref) — all correctly invoked.
- The structure MAJOR-1 fix (static + construction boundary mechanism) is correctly realized in §2.

0 BLOCKER, 0 MAJOR. The event-inventory + boundary + atomicity altitude is sound. Two atomicity-semantics precision defects, one readiness nit.

### MINOR-1 — §3 atomic-commit hardcodes "exactly one outbox row"; an operation emits **0 / 1 / N** events per `Doc-2 §8`
§3 asserts "**exactly one** outbox row exists for the event." But a single business operation may emit **zero** events (no §8 emitter — atomicity trivially holds), **one**, or **N** events (e.g. an award flow). Hardcoding "exactly one" mis-models multi-event and no-event operations.
**Required fix:** §3 — assert the operation's **declared event set** (per `Doc-2 §8` / the inventory — 0, 1, or N events) **all commit atomically with the business write** (all-or-nothing); the count is the frozen `Doc-2 §8` emitter declaration for that operation, not a hardcoded 1.

### MINOR-2 — §3 conflates the transactional outbox **row** with **dispatch** (post-commit async)
§3's rollback assertion says "no **event is dispatched**." But **dispatch is post-commit async** (the dispatcher/Inngest polls **committed** outbox rows — §4), separate from the transaction. Atomicity (`CHK-8-051`) is about the **outbox row** committing or rolling back **with the business write**; "no dispatch" on rollback **follows** from "no committed row" but is **not** the atomicity assertion.
**Required fix:** §3 — assert the **outbox row** (committed-with-write on success; absent on rollback) + business-table state; **remove "no event dispatched" from the atomicity assertion** — dispatch is §4 (the drainer's tick over **committed** rows). Note: "no dispatch on rollback" is a *consequence* (no committed row to poll), asserted in §4, not a separate §3 claim.

### NITPICK-1 — §2 import-graph is **static but execution-deferred** (needs code), not "ready now"
§2 calls the import-graph facet "execution-ready against the code once it exists" — but code is NOT STARTED, so it is **deferred until code**, merely **static** (not runtime) when it runs. Only the **8D DDL FK** facet is testable **now** (against the frozen DDL).
**Suggested fix:** §2 — label the import-graph facet **"static, execution-deferred until code exists"**; the **8D DDL FK** facet is the only one **ready now**; the through-contracts construction is a harness property exercised when integration tests run (deferred).

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§1's bidirectional `Doc-2 §8` ↔ `Doc-4J` cross-check is out of scope — Doc-8F tests integration, not corpus consistency; whether two frozen docs agree is the corpus's job."* | **REJECTED (false).** The cross-check is **how the suite provably covers the event space**: the inventory's completeness depends on `Doc-4J` and `Doc-2 §8` agreeing on the event set; if they **diverge**, the inventory is ambiguous and coverage **unprovable**. Surfacing that as **`[ESC-8-CORPUS]`** (flag-and-halt, never reconcile by coining) is the correct never-coin behavior. A conformance suite that **ignored** an oracle inconsistency would silently mis-cover. The cross-check **is** the completeness guarantee, not out of scope. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 §3 atomicity over the declared event set (0/1/N) | MINOR | Pass-1 Patch — assert per Doc-2 §8 emitter declaration, not hardcoded 1 |
| MINOR-2 §3 row-vs-dispatch conflation | MINOR | Pass-1 Patch — atomicity = the outbox row; dispatch = §4 |
| NITPICK-1 §2 import-graph static-deferred | NIT | Pass-1 Patch — static/deferred vs 8D DDL ready-now |

**Gate:** 2 MINOR open → **Pass-1 Patch required**, then short closure check, then Content Pass-2 (§4–§7).

*End of Independent Hard Review (Content Pass-1). Nothing coined; no frozen document edited.*
