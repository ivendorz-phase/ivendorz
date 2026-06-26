# Doc-8B — Content Pass-1 (§0–§4) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8B_Content_v1.0_Pass1.md` (§0–§4) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · Reference-Never-Restate · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-1 Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- `Doc-6C` role/permission seed — verified (`00_AUTHORITY_MAP` Doc-6C row + roadmap §4b): **45-slug + 4-bundle** seed, frozen 2026-06-26; the four bundles = the Org Roles (Owner/Director/Manager/Officer — Invariant #2). §4's seed pointer is correct.
- `Doc-6B` `core.system_configuration` POLICY seed (18 `core.*` keys; Doc-3 §12 registered keys incl. `identity.*` via Doc-3 v1.9) — verified. §4 invokes the realized seed, re-authors none.
- `Doc-6A §3` (standard columns) / `R3b` (`multiSchema`) / `§11` (migration); `Doc-4B` (ID owner) + `Doc-6B core.id_sequences` (`ERR-8A-1` anchor); `Doc-8A §4.4/§10.1` (transaction-rollback **or** schema-reset — both sanctioned); Bands H/I (`CHK-8-070…074`, `080/081`); CLAUDE.md §2/§5/§10; Invariant #7 — all correctly invoked.

0 BLOCKER, 0 MAJOR. The realization altitude (binding-vs-choice tagging, illustrative-not-frozen snippets) matches the Doc-6B precedent; reference-never-restate is honored. Findings: one real isolation/atomicity tension, one temporal-dependency precision, one determinism nit.

---

## Findings

### MINOR-1 — §3's transaction-rollback-default conflicts with the Band-F atomicity suites, which must observe a **real** commit/rollback of write + outbox
§3 sets transaction-rollback-per-test as the default isolation. But `Doc-8A §8` (Band F, `CHK-8-051`) requires asserting that a business write **and** its `core.outbox_events` insert **commit or roll back together** — which means a suite must drive and **observe a real transaction boundary**, not run forever inside one outer rollback-everything transaction (you cannot observe a genuine commit if the harness holds an un-committable outer tx). This couples to the §7 (Pass-2) outbox observer.
**Required fix:** §3 must state that suites asserting **real transaction atomicity** (Band F) **opt out** of the rollback-everything default — using a **savepoint-per-case** strategy (so the inner business transaction genuinely commits/rolls back while the outer harness still cleans up) **or** the schema-reset path — and cross-reference the §7 outbox observer (Pass-2). The rollback-default remains correct for the non-atomicity majority.

### MINOR-2 — §4's "through contracts" path assumes the application/contract layer, which is NOT STARTED; make the temporal split explicit
§4 says factories create data "through module contracts **or** the module's own seed path." Correct in principle, but **code is NOT STARTED** (CLAUDE.md) — the contract/application layer does not yet exist, while the **realized DB seed paths** (Doc-6B/Doc-6C) do. A reader could infer Doc-8B depends on unwritten code.
**Required fix:** make the temporal split explicit — *"the harness seeds via the module's **realized seed path now** (Doc-6B/Doc-6C migrations/seeds) and via the module's **contract once the application layer exists**; both are the owning-module's own write path (Invariant #7). Doc-8B specifies the convention; it depends on no unwritten code."*

### NITPICK-1 — §2 `shuffle: false` under-uses the runner for proving isolation
§2's illustrative config sets `sequence: { shuffle: false }` with a comment "no order-dependence either way." Since per-test isolation is **required** (Band H), `shuffle: true` would **actively detect** any accidental order-dependence (a latent isolation bug) rather than hide it.
**Suggested fix:** flip the illustrative default to `shuffle: true` (isolation is required; shuffle is the detector that proves it) — or note both are [Doc-8B choice] and shuffle-on is the stronger posture.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§4 factories that call module contracts violate One-Module-One-Owner — the **test harness**, not the module, is driving cross-module writes."* | **REJECTED (false).** The harness is **not a module**; §4 composes **each owning module's own contract/seed** for that module's data — M1's create-organization is **M1 owning its write**; the harness orchestrates the call, it never `INSERT`s another module's tables. That is precisely the One-Module-One-Owner-**preserving** path (§4; Invariant #7); the forbidden pattern (a factory raw-`INSERT`ing `identity.*` from outside M1) is exactly what §4 prohibits. No violation. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 rollback-default vs Band-F atomicity observation | MINOR | Pass-1 Patch — savepoint/schema-reset opt-out + §7 cross-ref |
| MINOR-2 "through contracts" assumes unwritten code | MINOR | Pass-1 Patch — realized-seed-now / contract-later temporal split |
| NITPICK-1 §2 shuffle:false under-proves isolation | NIT | Pass-1 Patch — shuffle:true as stronger posture |

**Gate (governance §6/§8 rule 1):** approved with no open BLOCKER/MAJOR/MINOR. 2 MINOR open → **Pass-1 Patch required**, then short closure check, then Content Pass-2 (§5–§9).

*End of Independent Hard Review (Content Pass-1). Nothing coined; no frozen document edited. Anchors verified against the frozen corpus (Doc-6C 45-slug/4-bundle seed; Doc-8A §4.4/§8 atomicity; Doc-6A §3/R3b; ERR-8A-1).*
