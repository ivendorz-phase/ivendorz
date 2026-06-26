# Doc-8C — Structure **Patch v0.1.1** (Hard Review disposition) + Short Re-Review

| Field | Value |
|---|---|
| Patches | `Doc-8C_Structure_Proposal_v0.1.md` |
| Against | `Doc-8C_Structure_Independent_Hard_Review_v0.1.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 1 MAJOR + 1 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → structure freeze-ready |
| Method | Additive structure patch — no frozen document edited; nothing coined. Effective Doc-8C structure = `Proposal_v0.1` **as amended below** |

---

## Disposition of findings

### MAJOR-1 — inventory needs a frozen source of truth → **FIXED**
C1 and §1/§2/§9 are amended to anchor the inventory and the completeness check:
> **C1 (amended) — inventory source of truth.** The contract inventory is **derived from the frozen per-module Doc-5x contract enumerations** (`Doc-5B…5K` — the authoritative contract lists; the frozen counts are the coverage target: `Doc-5C` 42 · `Doc-5D` 71 · `Doc-5E` 38 · `Doc-5F` 50 · `Doc-5G` 40 · `Doc-5H` 23 · `Doc-5I` 33 · `Doc-5J` 34 · `Doc-5K` 16 · `Doc-5B` out-of-wire), cross-checked against the **`Doc-5A_Content_v1.0_Pass10 §B.1`** route-registry namespace/path grammar. Once the application code exists, the inventory is additionally cross-checked against the **`generated-contracts-registry/`** (CLAUDE.md §10). The inventory is **never hand-maintained as an independent list.**
>
> **§2 completeness check (amended):** asserts **inventory ≡ the frozen Doc-5x enumerations** — every frozen contract present (no under-coverage), none invented (no over-coverage), each flagged wired/out-of-wire from its owning `Doc-5x` partition. A divergence between the inventory and the frozen surface **fails the suite**. This makes C1's "provable coverage" provable against the frozen oracle, not merely internally consistent.

### MINOR-1 — §8 contract-scope vs RLS seam → **FIXED**
§8 gains the seam clause:
> **Seam [allocation — the §6.4/§9.6 precedent]:** Doc-8C asserts the **contract-declared actor scope at the API surface** (oracle = the owning `Doc-4x §HB` actor model — a User/Admin/System/anonymous caller receives only what the contract grants). The **RLS backstop enforcement** and the **cross-tenant byte-equivalence** gate are **Doc-8D's** (`Doc-6A R8/§4`), cross-referenced, **not re-asserted here**. One behavior, two layer-checks (API-surface in 8C, DB-enforcement in 8D); neither duplicates the other.

### NITPICK-1 — §6 idempotency-key mechanism → **FIXED (applied)**
§6 binds the key mechanism:
> The replay is **keyed per the frozen idempotency mechanism** (`Doc-4A` idempotency-key header / request-identity rule, by pointer) — not assumed content-based; a replay = a same-key request inside `*.idempotency_dedup_window`.

### REJECTED finding — upheld
"C2 leaves out-of-wire unverified" stays **REJECTED as false** — out-of-wire is verified by its owning discipline (8F/8D/8E) and N/A-recorded with pointer; Band B is HTTP-surface-specific. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 1 | **0** |
| MINOR | 1 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Re-Review (closure confirmation)

| Finding | Sev | Closed? |
|---|---|---|
| MAJOR-1 inventory source of truth | MAJOR | **CLOSED** — anchored to frozen Doc-5x enumerations + Pass10 §B.1 + generated-contracts-registry; completeness ≡ frozen surface |
| MINOR-1 §8 scope-vs-RLS seam | MINOR | **CLOSED** — API actor-scope (8C) / RLS enforcement + cross-tenant (8D); one behavior, two layer-checks |
| NITPICK-1 idempotency key | NIT | **CLOSED** — Doc-4A key mechanism bound |
| REJECTED (out-of-wire hole) | — | **Upheld false** |

No new defect. Re-verified `Doc-5A_Content_v1.0_Pass10 §B.1` (route registry) + the frozen Doc-5x contract counts as the coverage oracle. **0 open BLOCKER/MAJOR/MINOR → structure freeze-ready.**

*End of Structure Patch v0.1.1 + Short Re-Review. Nothing coined; no frozen document edited. Next: Structure Freeze Audit → `Doc-8C_Structure_v1.0_FROZEN` → Doc-8C content passes.*
