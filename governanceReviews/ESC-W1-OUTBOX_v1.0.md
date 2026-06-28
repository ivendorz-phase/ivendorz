# FLAG-AND-HALT — `ESC-W1-OUTBOX` v1.0

| Field | Value |
|---|---|
| **Type** | FLAG-AND-HALT escalation (Raise ≠ Accept — CLAUDE.md §13) |
| **Raised by** | Wave 1 execution, WP-1.0 [W1-ESC-001] |
| **Date** | 2026-06-28 |
| **Severity** | MAJOR (gates the Wave 1 Exit Gate's "outbox observer exercised" sub-clause; does **not** block the rest of Wave 1) |
| **Status** | **RESOLVED — Board ruled R-a (2026-06-28); realized + proven.** WP-1.8 ships the dispatcher; WP-1.7 exercises the observer against a synthetic `core.outbox_events` row (`pending → dispatched`, idempotent, distinct archival) — coining no event. The Exit-Gate "outbox observer exercised" sub-clause is **CLOSED**. See §7. |
| **Authority** | CLAUDE.md §7 (Authority Order), §11 (Flag-and-Halt), §13 (Raise ≠ Accept); Build_Roadmap_v1.0.md §0 conflict rule |
| **Disposition rule** | Do **not** resolve locally. Wave 1 proceeds on all other items; only the outbox-observer step + its dependants park until ruled. |

---

## 1. The conflict (cite both sources)

**Source A — the Wave 1 Walking-Skeleton definition.** `Build_Roadmap_v1.0.md` §3 fixes the skeleton's
integration test to exercise the **M0 outbox observer** (`Doc-8B` harness + outbox observer/drainer over
`core.outbox_events`; "one Doc-8 integration test (Doc-8B harness + outbox observer)"). The observer asserts
the write-plus-emit / `pending → dispatched` outbox mechanics end-to-end.

**Source B — M1 emits no domain event.** The chosen Wave-1 slice is a single **M1 `identity`** read
(`identity.get_buyer_profile.v1`). Module 1 is frozen as emitting **no** domain event:

> `Doc-5C_Structure_v1.0_FROZEN.md` (R6 — No event surface, DC-1): "**Module 1 emits no domain event**
> (`Doc-2 §8`; `Doc-4C §C12.4`). Doc-5A §11 event surface is N/A …"
> `Doc-5C_Content_v1.0_Pass2.md` §4.5/§4: "`Events-Produced: none`" (R6).

`Doc-2 §8` declares no `identity` emitter. There is therefore **no natural emission anywhere in the Wave-1
slice** for the mandated outbox observer to observe — not on the read (reads never emit) and not on the
lazy-provision write (M1 emits nothing at all, on any write).

**Why this is a genuine conflict, not a local choice.** Satisfying Source A by manufacturing an M1 event
would **coin an event the frozen corpus does not declare** (forbidden — realize-never-redecide; Red-Flag
"Change a governance signal" / inventing the event catalog is Doc-4J/Doc-2 §8 territory). Dropping the
observer entirely weakens a Build_Roadmap-mandated skeleton clause. Either resolution is
architecture-adjacent and must be **escalated, never resolved locally** (CLAUDE.md §11).

## 2. What is parked until the ruling

- **WP-1.8 [W1-JOBS-001]** — the Inngest outbox dispatcher (`pending → dispatched`).
- **WP-1.7 [W1-TEST-001]** — *only* its outbox-observer assertion clause. WP-1.7's **MANDATORY
  `CHK-8-024` RLS byte-equivalence** work and the slice e2e proceed unaffected.
- **Wave 1 Exit Gate** — *only* the "outbox observer exercised" sub-clause.

The `core.outbox_events` **table** itself (+ its forward-only trigger) is **still created in WP-1.1**
(Doc-6B, needed by every later wave) regardless of this ruling. All other Wave-1 work proceeds.

## 3. Options for the Board (recommend, do not decide)

- **(R-a) Synthetic-row observer — RECOMMENDED (Board lean).** Exercise the Doc-8B outbox observer/drainer
  against a **directly-inserted `core.outbox_events` row** (a System/test-seeded row), asserting the
  `pending → dispatched` lifecycle + distinct archival — i.e. prove the **table + observer mechanics**, which
  `Doc-8F` explicitly allows to be tested via Doc-6B table-mechanics ahead of a real emitter (`Doc-8F` is
  FROZEN; `Doc-8F_SERIES_FROZEN_v1.0`). This **coins no event** (no entry added to the Doc-4J catalog / Doc-2
  §8; nothing emitted by M1). Pair it with a one-line additive Build_Roadmap note recording that the **first
  real emitter** (a Wave-2+ module that emits per Doc-2 §8) is what exercises write-plus-emit atomicity
  (`CHK-8-051`) end-to-end. Residual: the Wave-1 observer proves mechanics, not a real business write+emit
  pair — acceptable for a skeleton (the slice's business event genuinely does not exist yet).
- **(R-b) Defer the observer to Wave 2.** Wave 1 ships **no** outbox-observer assertion; the first module
  that actually emits (Wave 2+) exercises the observer. Requires a one-line additive Build_Roadmap §3
  clarification (the skeleton's observer clause reads as "harness present, exercised at the first emitter").
  Matches "M1 emits nothing" literally; leaves the observer unexercised one wave longer.

## 4. Requested action

A Board ruling **R-a** or **R-b** (an additive disposition; never an edit to a frozen document). On **R-a**:
WP-1.7 adds the synthetic-row observer assertion and WP-1.8 ships the minimal dispatcher; a one-line
Build_Roadmap note is added (non-authoritative doc). On **R-b**: the observer clause is dropped from Wave 1
(Build_Roadmap §3 one-line clarification) and WP-1.8 defers to Wave 2.

## 7. Resolution (Board ruling — R-a, 2026-06-28)

The Board **approved R-a**: implement the M0 outbox observer now against a **synthetic
`core.outbox_events` record**, asserting the `pending → dispatched` lifecycle + distinct archival — i.e.
prove the table + observer mechanics independently of any domain emitter. Coins no event (nothing added to
the Doc-4J catalog / Doc-2 §8; M1 still emits nothing).

**Binding conditions (Board, verbatim intent):**
1. The synthetic event **must never become part of production business logic** — it is a
   **bootstrap/test fixture for architecture validation only, NOT a domain event**, and must be documented
   as such at its site.
2. The **observer implementation must remain identical** when real emitters arrive in Wave 2 (the synthetic
   row exercises the *same* observer/drainer code path; only the row's origin differs — test-seeded now vs.
   a real write-plus-emit later).

**Realization (WP-1.7 + WP-1.8):** WP-1.8 ships the minimal dispatcher (`pending → dispatched`,
forward-only/idempotent); WP-1.7 asserts the observer against a clearly-labelled synthetic
`core.outbox_events` fixture. A one-line additive note in `Build_Roadmap` records that the **first real
emitter** (Wave 2+) exercises write-plus-emit atomicity (`CHK-8-051`) end-to-end. This ESC is marked
**RESOLVED** when WP-1.7/1.8 land.

---

*Raised under Raise ≠ Accept (CLAUDE.md §13): a claim with a severity, adjudicated by the presiding
authority (Board, §7). Ruled R-a (2026-06-28); realized in WP-1.7/1.8 under the conditions above.*
