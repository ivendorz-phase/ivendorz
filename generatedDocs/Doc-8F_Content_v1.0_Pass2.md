# Doc-8F — Integration & Event-Flow Conformance Suite — Content v1.0 **Pass-2 (§4–§7)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §4–§7 of `Doc-8F_Structure_v1.0_FROZEN`. Final Doc-8F content pass. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8F_Structure_v1.0_FROZEN` §4–§7: event-payload & dispatch · consumer-effect locality · composition · conformance |
| Authority | `Doc-8A §8` + bands A/F; oracle = `Doc-4J`/`Doc-4L`/`Doc-6B`; consumes `Doc-8B` (outbox observer/drainer §7) by pointer |
| Coins | **Nothing — zero events.** Assertions oracle-by-pointer; snippets illustrative |
| Binding vs choice | Convention = **[binding]**; physical specific = **[Doc-8F choice]**. |

> **Scope of this pass:** event-payload & dispatch conformance (§4, `CHK-8-052`), consumer-effect locality (§5, `CHK-8-053`), the composition of 8E/8D helpers at the event layer (§6), and Doc-8F's conformance attestation (§7). With Pass-1 (§0–§3) this completes Doc-8F content.

---

## §4 — Event-Payload & Dispatch Conformance *(`CHK-8-052`)*

**[binding `Doc-4J` / `Doc-4L` / `Doc-6B`]** Three assertions per inventory event:

- **Payload conformance:** the emitted event's **name + version + payload** matches the **`Doc-4J` catalog entry** — every payload field traces to the catalog schema; a field with **no catalog source** is forbidden (a coined field → `[ESC-8-CORPUS]`). An event **not in the `Doc-4J` catalog** is a **coined event** — the suite fails it (never reconciles by adding it).
- **Dispatch lifecycle:** the outbox row advances **`pending → dispatched`** via the Doc-8B drainer's controlled **dispatch tick** (against the mocked Inngest double); **archival (`dispatched → archived`)** is a **distinct retention step** (`core.outbox_archive_retention` POLICY — `Doc-6B`), driven separately; the **`status` is forward-only** and **DELETE-blocked** (`Doc-6B`) — the drainer never deletes.
- **Fan-out (dispatch-routing layer):** the outbox event routes to **exactly the `Doc-4L`-declared consumer handlers** — **no more, no fewer** — observed at the **mocked Inngest double** (the routing edges are the frozen `Doc-4L` oracle; the routing realization is code). Consumer **execution effects** are §5.

**Execution-readiness [F3]:** payload + fan-out need **emitters/consumers** (code) → **deferred**; the `Doc-4J` catalog + `Doc-4L` edges + the `core.outbox_status` lifecycle are the frozen oracle now; the dispatch-tick mechanics run against the realized `core.outbox_events` + the Doc-8B drainer.

```ts
// illustrative; convention [Doc-4J / Doc-4L / Doc-6B binding]; payload ⊆ catalog; routing ⊆ Doc-4L; status forward-only
expectPayloadMatchesCatalog(event, Doc4J[event.name])              // no coined field; event ⊆ Doc-4J or [ESC-8-CORPUS]
await outbox.dispatch(tx)                                          // pending -> dispatched (Doc-8B drainer tick)
expectRoutesToExactly(event, Doc4L[event.name].consumers, mockedInngest)  // fan-out edges; no more/fewer
await outbox.archive(tx)                                           // dispatched -> archived, POLICY-bounded, never DELETE
```

## §5 — Consumer-Effect Locality *(`CHK-8-053`)*

**[binding Invariant #7 / `Doc-4L`]** A consumer's effect persists in the **consuming module's own schema** — never a cross-schema write back into the emitter's (or any other) tables; effects propagate **forward** via the consumer's own contracts. This is One-Module-One-Owner from the **consumer** side (the emitter side is §2/§3): a consumer reacting to event E writes **only** its own schema; if its reaction must touch another module, it calls that module's contract (which writes that module's own tables).

**Consequence — no dispatch on rollback (Pass-1 §3 cross-ref):** because dispatch polls **committed** outbox rows, a rolled-back operation (no committed row — §3) produces **no dispatch and no consumer effect** — asserted here via the drainer (no committed row → the tick routes nothing).

**Execution-readiness [F3]:** needs running **consumers** (code) → **deferred**; the consumer map (`Doc-4L`) + the own-schema-only rule (Invariant #7) are the frozen oracle now.

```ts
// illustrative; convention [Inv #7 / Doc-4L binding]; consumer writes only its own schema; forward via contracts
await outbox.dispatch(tx)                                          // route to consumers (deferred: needs consumer code)
expectConsumerWroteOnlyOwnSchema(consumer, event)                  // no cross-schema write back
expectForwardEffectsViaContracts(consumer)                        // touches other modules only via their contracts
```

## §6 — Composition: Firewall-via-Events & Non-Disclosure-via-Events *(mechanism)*

**[binding the Doc-8A allocation table]** Doc-8F **invokes** the canonical defining assertions at the event-flow layer; it **defines neither**:

- **Firewall-via-events** — invoke **Doc-8E's `firewallNonCross`/`firewallNonDom`** where a governance signal **flows in an event payload**: assert **no event carries a cross-mutating or dominating signal** (e.g. no event propagates a Financial-Tier change into a Trust-affecting consumer path). 8E owns the firewall criterion; 8F asserts it at the event boundary.
- **Non-disclosure-via-events** — invoke **Doc-8D's `CHK-8-024` byte-equivalence criterion** where an exclusion could leak **via an event/notification**: assert **no distinguishing event is emitted** for an **excluded** vs a **non-matched** vendor (the buyer-private case — `Doc-6F`, execution-deferred; the criterion is single-sourced in Doc-8D §5.4). This is the **"8F: no distinguishing notification/event"** facet of the byte-equivalence composition (Doc-8D §5.4 / Doc-8C §9.6).

A divergent re-implementation of the firewall or byte-equivalence criterion in 8F is a defect (assert-once). 8F composes; the definers are 8E (firewall) and 8D (byte-equivalence).

```ts
// illustrative; convention [Doc-8A allocation binding]; compose 8E/8D criteria at the event layer, never re-define
expectNoEventCarriesCrossMutatingSignal(event, Doc8E.firewallNonCross)   // invoke 8E helper
expectNoDistinguishingEvent(excludedVendor, nonmatchedVendor, Doc8D.byteEquivCriterion)  // invoke 8D criterion (Doc-6F deferred)
```

## §7 — Conformance & Carried Items

**Doc-8F conformance attestation:**

| Band | Disposition |
|---|---|
| **A** — oracle-by-pointer | **realizes by design** — every assertion binds `Doc-2 §8`/`Doc-4J`/`Doc-4L`/`Doc-6B` by pointer; none stricter/looser; **zero events coined**; red = code or `[ESC-8-CORPUS]`, never weakened |
| **F** — integration/event (`CHK-8-050…053`) | **realizes by design** — cross-module boundary (§2, static + construction) · write-plus-emit atomicity (§3, outbox observer) · payload/dispatch/fan-out (§4) · consumer-effect locality (§5) |
| **A-compose** — firewall/non-disclosure via events | **composes** — §6 invokes 8E (firewall) + 8D (byte-equivalence); does not define |
| **B/C/D/E/G/H/I** | **N/A** — contract (8C) · persistence/RLS (8D — 8F cross-refs the static FK) · domain/invariant/firewall/state (8E — 8F composes) · frontend (8G) · harness (8B) |

**Coverage attestation [F1]:** inventory ≡ the frozen `Doc-4J` catalog (every catalog event covered by every applicable Band-F check; **zero coined**); bidirectional `Doc-2 §8` cross-check; **execution-readiness flagged (F3)** — ready (the `core.outbox_events` table mechanics + the 8D-DDL static FK) vs deferred (emitters/consumers/import-graph need code; the non-disclosure-via-events facet needs `Doc-6F`) — **none silently dropped**. **Authored-not-run**: design + coverage frozen now (oracle = `Doc-2 §8`/`Doc-4J`/`Doc-4L`); per-assertion PASS/FAIL recorded at execution as the emitting/consuming modules exist.

**Carried register [by pointer]:** `DR-8-HARNESS` **consumed** (Doc-8B, outbox observer/drainer + mocked Inngest); `[ESC-8-CORPUS]` (coined event / catalog defect / `Doc-2 §8`↔`Doc-4J` divergence — flag-and-halt, **never weaken, never coin an event**); `[ESC-8-API]`/`[ESC-8-POLICY]` (by pointer, named channel). Doc-8F coins nothing.

---

## Pass-2 self-check (pre-review)

- **Reference-never-restate:** `Doc-4J` (catalog) · `Doc-4L` (fan-out) · `Doc-6B` (`core.outbox_status` forward-only/DELETE-blocked; `core.outbox_archive_retention`) · Invariant #7 · `Doc-8E` (firewall helpers) · `Doc-8D §5.4` (byte-equivalence criterion) · `Doc-8B §7` (drainer) · the Doc-8A allocation. **Nothing invented; zero events coined.**
- **Pass-1 fixes consumed:** §5 cross-refs the §3 row-vs-dispatch fix (no-dispatch-on-rollback is a consequence, asserted here); atomicity stays §3.
- **Composition correct:** §6 invokes 8E/8D criteria; does not define (assert-once); the non-disclosure-via-events facet is the Doc-8D §5.4 "8F" composition (Doc-6F deferred).
- **Authored-not-run honesty:** §7 "realizes by design"; readiness flagged (F3), none dropped.
- **Coins nothing:** 0 new event/payload field/consumer/expected value.
- **Open for review:** confirm the dispatch-vs-archival split (§4) matches the Doc-6B `core.outbox_status` + `core.outbox_archive_retention` realization; confirm §6's non-disclosure-via-events facet correctly defers to Doc-6F (buyer-private) and does not assert a marketplace facet (per Doc-8D `CLAR-8D-1`).

*End of Content Pass-2 (§4–§7) — DRAFT. Realizes `Doc-8F_Structure_v1.0_FROZEN` §4–§7. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN.*
