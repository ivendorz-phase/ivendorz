# Doc-8F — Integration & Event-Flow Conformance Suite — Content v1.0 **Pass-1 (§0–§3)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§3 of `Doc-8F_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8F_Structure_v1.0_FROZEN` §0–§3: control · event-catalog inventory · cross-module boundary · write-plus-emit atomicity |
| Authority | `Doc-8A §8` + bands A/F; oracle = `Doc-2 §8`/`Doc-4J`/`Doc-4L`/`core.outbox_events`; consumes `Doc-8B` (outbox observer §7) by pointer |
| Coins | **Nothing — zero events.** Inventory derived from frozen Doc-4J; assertions oracle-by-pointer; snippets illustrative |
| Binding vs choice | Convention tracing to the frozen catalog/flow = **[binding]**; physical specific = **[Doc-8F choice]**. |

> **Scope of this pass:** control/precedence + Bands A/F gate (§0), the frozen-catalog-sourced event inventory (§1), cross-module boundary conformance (§2), and write-plus-emit atomicity (§3). §4–§7 (payload/dispatch/fan-out, consumer-effect locality, composition, conformance) land in Pass-2.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding

Doc-8F sits at: `… → Doc-8A → (Doc-8B harness, outbox observer §7) → **Doc-8F** → asserts Doc-2 §8 / Doc-4J / Doc-4L`. It **realizes** `Doc-8A §8` and **passes Appendix A Bands A + F** (`CHK-8-001…003`; `CHK-8-050…053`) before content freeze. Realize-never-redecide: every assertion is an **oracle-by-pointer** into `Doc-2 §8`/`Doc-4J`/`Doc-4L`/the `core.outbox_events` contract; **no flow stricter or looser** than Doc-4L (`Doc-8A §3.3`); **zero events coined**. A red test = code defect, or `[ESC-8-CORPUS]` (a coined event / catalog defect / §8↔Doc-4J divergence — flag-and-halt) — **never weaken** (`Doc-8A §3.4`). Doc-8F **composes** Doc-8E (firewall-via-events) + Doc-8D (non-disclosure-via-events); it does not define them. Consumes the **Doc-8B** harness (incl. the outbox observer/drainer §7 + mocked Inngest) by pointer. Coins nothing.

## §1 — Scope & the Event-Catalog Inventory

**[F1 binding]** The suite's spine is the **event inventory** — **derived from the frozen `Doc-4J` authoritative event catalog + `Doc-4L` flow map**, **never hand-maintained**. Row schema **[Doc-8F choice — columns; values [binding] from the frozen catalog]**:

| Field | Source |
|---|---|
| `event`, `version` | the frozen `Doc-4J` catalog entry |
| `emitter` | the `Doc-2 §8` owning emitter (the bounded context that emits it) |
| `payload_contract` | the `Doc-4J` payload schema (the oracle for §4 payload conformance) |
| `consumers` | the `Doc-4L` declared fan-out (consumer handlers the event routes to) |
| `execution` | `ready` (table mechanics / import-graph) \| `deferred` (needs emitter/consumer code — F3) |

The **completeness check** asserts **inventory ≡ the frozen `Doc-4J` catalog** (every catalog event has exactly one row; **none coined**), with a **bidirectional cross-check vs `Doc-2 §8`** (every §8 emitter has a catalog event; every catalog event has a §8 emitter). **A `Doc-2 §8` ↔ `Doc-4J` divergence between two frozen docs is `[ESC-8-CORPUS]`** (flag-and-halt at the owning docs) — never resolved suite-locally, never reconciled by coining.

## §2 — Cross-Module Boundary Conformance *(`CHK-8-050`)*

**[Invariant #7 binding]** Asserted by **static + construction** mechanisms (not an undefined runtime probe):

- **No cross-module import** — **static import-graph analysis** over the code: only another module's **`contracts/`** is importable cross-module (CLAUDE.md §10 module shape); an import of another module's `domain/`/`application/`/`infrastructure/`/`api/` is a defect. Execution-ready against the code once it exists (a dependency-graph lint).
- **No cross-module FK** — **Doc-8D's `CHK-8-025`** static DDL check (**cross-ref**, not re-asserted here): no foreign key crosses a schema boundary.
- **No cross-module table access** — (a) **static**: no raw SQL referencing another module's schema; (b) **harness through-contracts construction** (`Doc-8A §4.2`): every fixture/operation sets up only via a module's **own** contract/seed — a test that reaches into another module's tables is itself a boundary violation.

If a **runtime** DB-access enforcement is later desired but the corpus froze **no per-module DB-grant model**, that is **`[ESC-8-CORPUS]`** (no runtime mechanism to assert against) — **never invented**.

```ts
// illustrative; convention [Invariant #7 / CLAUDE.md §10 binding]; static + construction, no invented runtime probe
expectNoCrossModuleImport(importGraph)             // only contracts/ importable cross-module (static lint)
// no cross-module FK -> Doc-8D CHK-8-025 (cross-ref, not re-asserted)
expectNoRawSqlToForeignSchema(sourceTree)          // static
// + harness through-contracts construction is the runtime guarantee (Doc-8A §4.2) — fixtures cannot write foreign tables
```

## §3 — Transactional Write-Plus-Emit Atomicity *(`CHK-8-051`)*

**[binding `Doc-2 §8` / `Doc-6A §7` / `Doc-6B`]** Assert the outbox transactionality via the **Doc-8B §7 outbox observer** + the **savepoint/schema-reset opt-out** (a real commit boundary, not the rollback-everything default):

- **Atomic commit:** a business write **and** its `core.outbox_events` insert commit **together** — on success, **exactly one** outbox row exists for the event (read via the observer).
- **Atomic rollback:** on a **forced failure after the business write** (before commit), **neither** the business row **nor** the outbox row persists, and **no** event is dispatched — assert the observer sees **no** outbox row and the business table is unchanged.
- **M0-owned outbox:** the emitter inserts into `core.outbox_events` (the sole sanctioned cross-module write — `Doc-4B §16.2`); it writes **no other schema** (cross-ref §5).

**Execution-readiness [F3]:** the assertion needs an **emitting service** (code, NOT STARTED) → **execution-deferred**; the `core.outbox_events` **table contract** (the row shape, the one-transaction insert) is realized (`Doc-6B`) and the **observer** exists (`Doc-8B §7`) — the assertion shape is authored now, runs when an emitter exists.

```ts
// illustrative; convention [Doc-2 §8 / Doc-6B binding]; write+emit atomic via outbox observer + savepoint
withSavepoint(async (tx) => {
  await emittingService.doBusinessWrite(tx)                       // emitter (code, deferred)
  expectExactlyOneOutboxRow(outbox.pending(tx), forEvent)        // Doc-8B §7 observer
})
withSavepoint(async (tx) => {
  await expectThrows(emittingService.doBusinessWriteThenFail(tx)) // forced failure after the write
  expectNoOutboxRow(outbox.pending(tx)); expectBusinessUnchanged(tx)  // atomic rollback
})
```

---

## Pass-1 self-check (pre-review)

- **Reference-never-restate:** `Doc-4J` (catalog) · `Doc-4L` (flow) · `Doc-2 §8` (emitters) · `Doc-6A §7`/`Doc-6B` (outbox + `core.outbox_events`) · `Doc-4B §16.2` (sole outbox write) · Invariant #7 · CLAUDE.md §10 (module shape) · `Doc-8A §4.2` (through-contracts) · `Doc-8B §7`/§3 (observer/savepoint) · `Doc-8D §6` (FK cross-ref). **Nothing invented; zero events coined.**
- **Inventory frozen-sourced:** §1 derives from Doc-4J + Doc-4L; completeness ≡ Doc-4J; §8↔Doc-4J divergence = `[ESC-8-CORPUS]`.
- **Boundary mechanism concrete:** §2 static import-graph + 8D DDL cross-ref + through-contracts (the structure MAJOR-1 fix carried).
- **Coins nothing; binding/choice tagged:** 0 new event/payload/consumer/expected value.
- **Open for review:** confirm `Doc-4B §16.2` is the right anchor for the sole-sanctioned outbox write; confirm the import-graph facet's execution-readiness (static-against-code) is correctly distinguished from the emitter-dependent atomicity (runtime-deferred).

*End of Content Pass-1 (§0–§3) — DRAFT. Realizes `Doc-8F_Structure_v1.0_FROZEN` §0–§3. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7).*
