# Doc-8C — Contract & API Conformance Suite — Content v1.0 **Pass-1 (§0–§4)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§4 of `Doc-8C_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8C_Structure_v1.0_FROZEN` §0–§4: control/precedence · contract inventory · table-driven design · envelope conformance · cursor-pagination conformance |
| Authority | `Doc-8A` (the *how* — §5 + bands A/B); the frozen Doc-5 surface is the oracle; consumes `Doc-8B` by pointer |
| Coins | **Nothing.** Inventory derived from frozen `Doc-5x`; assertions oracle-by-pointer; snippets illustrative |
| Binding vs choice | Convention tracing to Doc-8A/Doc-5 = **[binding]**; physical specific (inventory column names, helper names, snippet shape) = **[Doc-8C choice]**. Code illustrates the convention; the convention binds. |

> **Scope of this pass:** the suite foundation — control/precedence + Bands A/B gate (§0), the frozen-sourced contract inventory (§1), the table-driven design + completeness check (§2), and the first two Band-B checks: envelope (§3) and cursor pagination (§4). §5–§9 (error, idempotency, prohibited-field, actor-scope, conformance) land in Pass-2.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding

Doc-8C sits at: `… → Doc-8A → (Doc-8B harness) → **Doc-8C** → asserts the frozen Doc-5 surface`. It **realizes** `Doc-8A §5` (contract-conformance conventions) as an executable table-driven suite and **passes Appendix A Bands A + B** (`CHK-8-001…003` oracle-by-pointer; `CHK-8-010…015` contract conformance) before content freeze. Realize-never-redecide-never-respecify: every assertion is an **oracle-by-pointer** into a frozen `Doc-5x §HB`; **no assertion is stricter or looser** than its contract (`Doc-8A §3.3`). A red test = code defect (fix the code) **or** a corpus/contract defect (`[ESC-8-API]`/`[ESC-8-CORPUS]`, flag-and-halt) — **never weaken the assertion** (`Doc-8A §3.4`). Doc-8C consumes the **Doc-8B** harness (runner, fixtures, seeding, clock/ID, mock boundary, CI gate) **by pointer**; it re-authors none. Coins nothing.

## §1 — Scope & the Contract Inventory

**[C1 binding]** The suite's spine is the **contract inventory** — **derived from the frozen per-module Doc-5x enumerations** (`Doc-5B…5K`), **never hand-maintained** (reference-never-restate). Coverage target (the frozen counts): `Doc-5C` 42 · `Doc-5D` 71 · `Doc-5E` 38 · `Doc-5F` 50 · `Doc-5G` 40 · `Doc-5H` 23 · `Doc-5I` 33 · `Doc-5J` 34 · `Doc-5K` 16 · `Doc-5B` out-of-wire. The inventory is cross-checked against the **`Doc-5A_Content_v1.0_Pass10 §B.1`** route-registry namespace/path grammar, and — once code exists — against the **`generated-contracts-registry/`** (CLAUDE.md §10).

Each inventory row **[Doc-8C choice — column set; values [binding] from the frozen contract]**:

| Field | Source |
|---|---|
| `contract_id` | the frozen `Doc-5x` contract identifier |
| `method`, `path` | the frozen `Doc-5x` method + the `Doc-5A §5.3` path grammar (`/{namespace}/…`) |
| `actor` | the owning `Doc-4x` actor model (User/Admin/System/anonymous) |
| `kind` | `read` \| `list` \| `command` (drives check applicability) |
| `idempotent` | boolean, from the frozen idempotency declaration |
| `wired` | boolean — **wired caller-facing** (Band B applies) vs **out-of-wire** (N/A — C2) |
| `hb_pointer` | the owning `Doc-4x §HB` (field/error/validation oracle) |
| `owning_suite` | for out-of-wire rows: the discipline that verifies it (8F/8D/8E) |

**[C2 binding]** Band B runs only over `wired = true` rows; `wired = false` rows are **N/A-recorded with `owning_suite`** (no silent omission).

## §2 — Table-Driven Conformance Design *(C1 — mechanism)*

**[C1 binding]** Each Band-B check (§3–§8) is a **pure function over an inventory row**; the runner (Vitest — Doc-8B D1) iterates the inventory, applying every **applicable** check per row (applicability from the row flags — list-checks skip `command`/`read`, idempotency-checks skip `idempotent=false`, Band B skips `wired=false`). No per-contract case is hand-authored — coverage is the cross-product **(inventory rows × applicable checks)**.

**Completeness check [C1 binding / `CHK-8-001`-adjacent]:** the suite asserts **inventory ≡ the frozen Doc-5x enumerations** — every frozen contract has exactly one row (no under-coverage), none invented (no over-coverage), each correctly flagged `wired`. A divergence **fails the suite** (a frozen contract with no row, or a row with no frozen contract, is a red). This is what makes C1's coverage *provable against the frozen oracle*, not merely internally consistent.

Illustrative driver **[Doc-8C choice]**:

```ts
// illustrative; convention [C1 binding] = checks are functions over the frozen-derived inventory; completeness vs frozen surface
const inventory = loadInventory()                // derived from Doc-5B..5K (+ Pass10 §B.1 / generated-contracts-registry)
test('completeness: inventory == frozen Doc-5 surface', () => assertInventoryMatchesFrozen(inventory))
for (const c of inventory) {
  for (const check of applicableChecks(c)) {     // envelope/pagination/error/idempotency/prohibited/actor per flags
    test(`${check.id} :: ${c.contract_id}`, (ctx) => check.run(c, ctx))  // oracle-by-pointer into c.hb_pointer
  }
}
```

## §3 — Envelope Conformance *(`CHK-8-010`)*

**[binding `Doc-5A §5.6`]** Every `wired` contract's response is asserted against the **canonical envelope** (`Doc-5A §5.6`) — the success/error discriminant, the data block, and the metadata block — **by pointer to §5.6**, never a re-described shape. A response deviating from §5.6 is a **code defect** (§0; the contract is the oracle, the code conforms).

- **204 / no-body exemption [binding `Doc-4A §22.1 C-05`]:** body-bearing responses carry `reference_id`; **204 responses are exempt** (the frozen C-05 rule, by pointer) — the envelope check skips the data/metadata-block assertion for a declared-204 contract and asserts the empty-body + status instead.
- **Error-envelope:** an error response uses the §5.6 **error discriminant** (the error class itself is §5 — Pass-2 §5); §3 asserts only the *envelope shape* of the error, not the class.

Illustrative check **[Doc-8C choice]**:
```ts
// illustrative; convention [Doc-5A §5.6 binding]
export const envelopeCheck = { id: 'CHK-8-010', run: (c, ctx) => {
  const res = call(c, ctx)
  if (c.declares204) return expectEmptyBody(res, 204)         // Doc-4A §22.1 C-05 exemption
  expectEnvelope(res, Doc5A_5_6)                              // shape by pointer; no re-described literal
}}
```

## §4 — Cursor-Pagination Conformance *(`CHK-8-011`)*

**[binding `Doc-5A §8`]** Every `kind = list` contract is asserted against the **cursor grammar** (`Doc-5A §8`): an **opaque cursor**, a **deterministic sort key**, forward/back traversal, and stable ordering across pages. Applicability: skipped for `read`/`command`.

- **Page-size ceiling [binding `Doc-3 §12`]:** the maximum page size is read from the contract's **`*.list_page_size_max`** POLICY key (`Doc-3 §12`, **by pointer — never a literal**); the check requests **at**, **above** (expect clamp/reject per the frozen rule), and **below** the bound.
- **Sort-key index cross-ref [binding `Doc-6A §10`]:** the deterministic-sort-key **index** that makes the cursor persistable is a **Doc-8D** (`Doc-6A §10`) data-layer concern — asserted there, cross-referenced here (contract-side grammar in 8C; data-side index in 8D; neither orphaned).
- **Determinism:** the seeded clock + deterministic ID provider (Doc-8B §6) make the sort key + cursor reproducible across runs.

Illustrative check **[Doc-8C choice]**:
```ts
// illustrative; convention [Doc-5A §8 binding]; page-size bound by POLICY pointer, never a literal
export const paginationCheck = { id: 'CHK-8-011', applies: (c) => c.kind === 'list', run: (c, ctx) => {
  const max = policy(c.namespace, 'list_page_size_max')      // Doc-3 §12 by pointer
  expectCursorGrammar(call(c, { ...ctx, limit: max }), Doc5A_8)
  expectBoundaryBehavior(c, max, ctx)                        // at / above / below
}}
```

---

## Pass-1 self-check (pre-review)

- **Reference-never-restate:** every assertion bound by pointer — `Doc-5A §5.6/§8/Pass10 §B.1`; `Doc-4A §22.1 C-05`; `Doc-3 §12`; `Doc-6A §10` (cross-ref); the frozen `Doc-5x §HB`; `Doc-8A §3.2/§3.3/§3.4/§5` + bands A/B; `Doc-8B` (harness); CLAUDE.md §10. **Nothing invented.**
- **Inventory frozen-sourced:** §1 derives the inventory from `Doc-5B…5K` (+ Pass10 §B.1 / generated-contracts-registry); §2 completeness asserts inventory ≡ frozen surface (MAJOR-1 fix carried).
- **Binding vs choice tagged:** conventions [binding]; column sets/snippets [Doc-8C choice], illustrative.
- **Coins nothing:** 0 new contract/field/error/status/header/slug/expected value.
- **Open for review:** confirm the §5.3 path grammar pointer is right for the `path` column; confirm the 204-exemption interaction with the envelope check is correctly scoped to declared-204 contracts only.

*End of Content Pass-1 (§0–§4) — DRAFT. Realizes `Doc-8C_Structure_v1.0_FROZEN` §0–§4. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9).*
