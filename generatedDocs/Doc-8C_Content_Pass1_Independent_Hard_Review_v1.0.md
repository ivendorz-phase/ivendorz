# Doc-8C — Content Pass-1 (§0–§4) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8C_Content_v1.0_Pass1.md` (§0–§4) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 2 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-1 Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- `Doc-5A §5.6` (envelope), `§8` (pagination), `§5.3` (path grammar), `Pass10 §B.1` (route registry); `Doc-4A §22.1 C-05` (reference_id / 204 exempt); `Doc-3 §12` (`*.list_page_size_max`); `Doc-6A §10` (sort-key index, cross-ref); `Doc-8A §3.2/§3.3/§3.4/§5` + bands A/B; `Doc-8B` (harness); CLAUDE.md §10 — all correctly invoked.
- Inventory frozen-sourcing (the MAJOR-1 structure fix) correctly carried into §1/§2 — coverage target counts match the frozen `Doc-5x` enumerations; completeness asserts inventory ≡ frozen surface.

0 BLOCKER, 0 MAJOR. The table-driven realization is clean and the binding-vs-choice tagging is right. Two real internal-consistency / test-data defects, two labelling nits.

### MINOR-1 — §1 inventory row schema omits `namespace`, which §4 (and Pass-2 §6) require for namespaced POLICY lookups
§4's page-size check reads `policy(c.namespace, 'list_page_size_max')` and Pass-2 §6's idempotency check will read `<namespace>.idempotency_dedup_window` — both keyed on the **module namespace**. But §1's inventory row schema has no `namespace` column (only `method`/`path`/`actor`/…). The POLICY keys are namespaced (`Doc-3 §12`: `<ns>.list_page_size_max`), so the row must carry the namespace (derivable from the `Doc-5A §5.3` path prefix / owning module).
**Required fix:** add `namespace` to the §1 row schema (source = the `Doc-5A §5.3` route-prefix / owning `Doc-5x` module); §4/Pass-2 §6 read the POLICY key under that namespace.

### MINOR-2 — §4 pagination check has no **data precondition**; the boundary assertion is vacuous without a seeded list
§4 requests "at / above / below the bound," but a list with fewer rows than `max` cannot exercise the above-bound or multi-page cases — the assertion passes vacuously. The check must **seed the list (via the Doc-8B factories, §4/§5) with > `max` rows** before asserting pagination boundaries.
**Required fix:** §4 — state the data precondition: the pagination check **seeds the target list with > `*.list_page_size_max` rows** (through the owning module's Doc-8B factory — through-contracts/seed, Invariant #7) so the boundary + multi-page traversal are genuinely exercised; the seeded count is deterministic (Doc-8B §6).

### NITPICK-1 — §2 completeness check mislabeled "`CHK-8-001`-adjacent"
The completeness assertion (inventory ≡ frozen surface) is **Doc-8C's coverage attestation** (§9), not an instance of **`CHK-8-001`** (which is Band-A oracle-by-pointer — "every assertion traces to a frozen pointer"). The label conflates a coverage check with the oracle check.
**Suggested fix:** §2 — relabel as Doc-8C's **coverage attestation** (carried in §9); keep `CHK-8-001` for the per-assertion oracle-by-pointer property.

### NITPICK-2 — §3 `declares204` should key on the contract's **declared success status**
§3/§the snippet use a `declares204` flag; clearer as "**the contract's declared success status is 204**" (from the frozen `Doc-5x`), so the envelope check keys on the declared status, not an ad-hoc boolean.
**Suggested fix:** §3 — derive the 204 exemption from the contract's declared success status (frozen), add `success_status` to the inventory row if needed.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§2's cross-product generates ~300 contracts × ~6 checks ≈ 1800 tests — unmaintainable; hand-written per-contract suites would be clearer."* | **REJECTED (false).** The table-driven design is **exactly** what makes ~1800 assertions maintainable and coverage **provable**: each check is authored **once** and parameterized; adding a contract adds **one inventory row** (auto-covered by every applicable check), not six hand-written tests. Hand-writing 1800 cases is the unmaintainable, drift-prone alternative **C1 explicitly rejected** (structure). High assertion volume is a property of provable coverage, not a defect. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 inventory missing `namespace` | MINOR | Pass-1 Patch — add `namespace` (+ `success_status`) to row schema |
| MINOR-2 §4 pagination data precondition | MINOR | Pass-1 Patch — seed list > max rows via Doc-8B factory |
| NITPICK-1 completeness mislabel | NIT | Pass-1 Patch — relabel as coverage attestation |
| NITPICK-2 declares204 phrasing | NIT | Pass-1 Patch — key on declared success status |

**Gate:** 2 MINOR open → **Pass-1 Patch required**, then short closure check, then Content Pass-2 (§5–§9).

*End of Independent Hard Review (Content Pass-1). Nothing coined; no frozen document edited.*
