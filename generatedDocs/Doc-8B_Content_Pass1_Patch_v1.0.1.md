# Doc-8B — Content Pass-1 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8B_Content_v1.0_Pass1.md` (§0–§4) |
| Against | `Doc-8B_Content_Pass1_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 2 MINOR + 1 NITPICK dispositioned (all FIXED); 1 finding REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-1 APPROVED; proceed to Content Pass-2 |
| Method | Additive content patch — no frozen document edited; nothing coined. Effective Pass-1 = `Content_v1.0_Pass1` **as amended below** |

---

## Disposition of findings

### MINOR-1 — rollback-default vs Band-F real-atomicity observation → **FIXED**
§3 gains a clause after the isolation-mechanism bullet:
> **Band-F atomicity opt-out [Doc-8A §8 binding].** Suites that assert a **real** transaction boundary — a business write + `core.outbox_events` insert committing or rolling back **together** (`CHK-8-051`) — **opt out of the rollback-everything default**: they use a **savepoint-per-case** strategy (the inner business transaction genuinely commits/rolls back while the outer harness still cleans up at teardown) **or** the schema-reset path. You cannot observe a genuine commit from inside an un-committable outer transaction. These suites consume the **§7 outbox observer/drainer** (Pass-2) to read the committed/rolled-back outbox state. The rollback-everything default remains correct for the non-atomicity majority.

### MINOR-2 — "through contracts" assumes unwritten code → **FIXED**
§4's first bullet is amended:
> **[Doc-8A §4.2 binding]:** factories create data through the owning module's own write path — **the realized seed path now** (Doc-6B/Doc-6C migrations + seeds, which exist today) **and the module's contract once the application layer exists** (code is NOT STARTED — CLAUDE.md). Both are the owning module's own write (Invariant #7); **never** a hand-`INSERT` into another module's tables. Doc-8B specifies the convention and depends on no unwritten code — the seed path is available immediately; the contract path activates as code lands.

### NITPICK-1 — §2 shuffle:false under-proves isolation → **FIXED (applied)**
§2's illustrative config flips to the stronger posture:
> `sequence: { shuffle: true }   // [Doc-8B choice] isolation is required (Band H); shuffle actively detects accidental order-dependence`

### REJECTED finding — upheld
"§4 factories violate One-Module-One-Owner" stays **REJECTED as false** — the harness composes each owning module's own write; it never cross-`INSERT`s. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER / MAJOR | 0 / 0 | 0 / 0 |
| MINOR | 2 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Closure Check (re-review)

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 Band-F atomicity opt-out | MINOR | **CLOSED** — savepoint/schema-reset opt-out + §7 cross-ref; rollback-default scoped to non-atomicity |
| MINOR-2 realized-seed-now / contract-later | MINOR | **CLOSED** — temporal split explicit; no dependency on unwritten code |
| NITPICK-1 shuffle posture | NIT | **CLOSED** — shuffle:true (isolation detector) |
| REJECTED (harness One-Owner) | — | **Upheld false** |

No new defect. Re-verified: `Doc-8A §8` atomicity (savepoint observes real commit); realized seed paths (Doc-6B/6C) available now vs contract-later. **0 open BLOCKER/MAJOR/MINOR → Pass-1 APPROVED.**

*End of Content Pass-1 Patch v1.0.1 + Closure Check. Nothing coined; no frozen document edited. Next: Content Pass-2 (§5–§9) — tenant seeding · seeded clock & ID provider · mock boundary + outbox observer · CI merge-gate · conformance.*
