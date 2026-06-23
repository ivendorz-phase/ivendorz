# Doc-5A — API Realization Standards — Content v1.0, Pass 5 (§8)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 5 of N — Section §8 only |
| Status | ACTIVE — Content Pass 5 of N; §8 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1 (§0–§2), Pass-2 (§3–§4), Pass-3 (§5–§6), Pass-4 (§7) |
| Contains | Pagination, filtering, and sort **wire grammar** realization only — query-parameter carriage and encoding, page-size POLICY binding, list-response shape, exclusion-consistency on the wire. No endpoints, no module list contracts, no POLICY values, no framework code |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** The list request grammar (`Doc-4A §9.6`), the list response structure (`Doc-4A §10.3`), the exclusion-consistency rule (`Doc-4A §10.7`), the non-disclosure invariant (`Doc-4A §7.5`), and the POLICY-binding rule for limits (`Doc-4A §18`) are **frozen**. §8 realizes only their **wire carriage and encoding** as HTTP query parameters and the list response envelope (already bound in §5.6). It defines no POLICY value and invents nothing; transport-level choices are marked **[realization convention]**.

---

## §8 — Pagination, Filtering & Sort Wire Grammar

One canonical list grammar realizes `Doc-4A §9.6` for **every** list request in every module document. The grammar field names (`page_size`, `cursor`, `filter`, `sort`) are owned by `Doc-4A §9.6` and bound by pointer; §8 fixes only their **HTTP carriage (query parameters) and wire encoding**.

### 8.1 Pagination Model

- List pagination is **cursor-based only**. Offset-, index-, or page-number pagination is **forbidden** (`Doc-4A §9.6`: offset arithmetic leaks exclusion counts, violating `§7.5`).
- The two pagination parameters are carried as **HTTP query parameters**: `page_size` (§8.5) and `cursor` (§8.2).
- **Binds:** `Doc-4A §9.6` (cursor grammar, offset forbidden), §7.5 (offset leaks exclusions). **Rationale [realization convention — query-param carriage]:** the corpus fixes a cursor grammar but not its transport; query parameters are the single realization, keeping list inputs uniform and cacheable.

### 8.2 Cursor Realization

- The continuation cursor is carried as the `cursor` query parameter, value = the **opaque token** returned as `page_info.next_cursor` in the prior response (`Doc-4A §10.3`). A client **MUST NOT** construct, decode, or meaningfully modify it (`Doc-4A §9.6`).
- Cursor traversal delivers each item **at most once per traversal** under concurrent data change; a contract **MUST NOT** promise snapshot isolation across pages (`Doc-4A §10.3`).
- **Binds:** `Doc-4A §9.6` (opaque cursor), §10.3 (`next_cursor`, at-most-once traversal). **Rationale [realization convention — opacity]:** an opaque query-param cursor prevents clients deriving offsets/positions, which is what keeps exclusion counts from leaking (`§7.5`).

> **Governance Flag:** the classification of the pagination cursor (request parameter vs. its placement in the §4 standard-header registry) depends on a **pending §4 / Structure alignment decision**. Pass-5 does **not** resolve that conflict; it keeps the current pagination behavior (cursor carried as the `cursor` request parameter per `Doc-4A §9.6`) unchanged.

### 8.3 Filter Grammar

- Filtering is carried as **`filter[<field>]=<value>`** query parameters, one per filtered field, where `<field>` is **only** a field on the contract's explicit **filterable allowlist** (`Doc-4A §9.6`). `<field>` and any enum `<value>` follow §3 wire naming/serialization.
- **Multi-value filter (single canonical encoding) [realization convention]:** multiple values for one filterable field are expressed as a **comma-separated value list inside a single `filter[<field>]` parameter** (e.g. `filter[status]=open,closed`). This is the **one platform-wide** multi-value encoding; **repeated** `filter[<field>]` parameters for the same field, or any alternate multi-value syntax, are nonconforming.
- Filtering (or sorting) on an **undeclared** field is a **SYNTAX validation failure** → `400 VALIDATION` (`Doc-4A §9.6`/§11.2; Doc-5A §6.2). Protected facts (`§7.5`) and other tenants' data are **never** filterable dimensions (`Doc-4A §9.6`).
- **Binds:** `Doc-4A §9.6` (filterable allowlist), §7.5 (no protected-fact filtering), §11.2 (SYNTAX category), §3 (wire encoding). **Rationale [realization convention — `filter[...]` encoding]:** the corpus fixes the allowlist semantics, not the query encoding; bracketed per-field parameters give one unambiguous, allowlist-checkable encoding.

### 8.4 Sort Grammar

- Sorting is carried as the **`sort`** query parameter, value = a comma-separated list of `<field>:<asc|desc>` terms, where each `<field>` is **only** a field on the contract's explicit **sortable allowlist** (`Doc-4A §9.6`).
- Every declared sort **MUST** define a **total order**: the server appends the entity `id` as the final tiebreaker so ordering is stable across pages (`Doc-4A §9.6` sort-determinism; the `id` tiebreaker is appended, never client-supplied). Protected facts are **never** sortable dimensions (`§7.5`).
- **Client-supplied `id` in `sort` [realization convention]:** a `sort` term naming `id` is a **SYNTAX validation failure → `400 VALIDATION`** (the `id` tiebreaker is server-appended, not a client sort field). A deterministic rejection is preferred over silently ignoring or merging the term.
- **Binds:** `Doc-4A §9.6` (sortable allowlist, sort-determinism, `id` tiebreaker), §7.5. **Rationale [realization convention — `field:dir` encoding]:** one compact multi-key encoding; the total-order/tiebreaker requirement is upstream and merely realized here.

### 8.5 Page-Size Bounds (POLICY-bound)

- `page_size` is an integer query parameter whose **minimum, maximum, and server default are referenced by POLICY key** (`Doc-4A §9.6`/§18; `Doc-3 §12`), never as a literal on the wire or in this document.
- An omitted `page_size` applies the POLICY-keyed server default; a `page_size` exceeding the POLICY-keyed maximum is a **SYNTAX validation failure** → `400 VALIDATION` **[realization convention]** (§11.2; Doc-5A §6.2). A contract **MUST NOT** silently widen beyond, or hardcode, the POLICY bound.
- **Binds:** `Doc-4A §9.6` (bounded by POLICY key), §18 (POLICY-by-key, never by value), `Doc-3 §12` (POLICY configuration layer / key registry), §11.2 (SYNTAX). **Rationale [realization convention — over-max → 400]:** Doc-4A leaves the out-of-bounds outcome to realization; a deterministic SYNTAX rejection (rather than silent clamping) keeps page size explicit and auditable, and references — never embeds — the POLICY value.

### 8.6 List Response Realization

- A list response realizes the `Doc-4A §10.3` structure inside the §5.6 envelope:

```
{ "items": [ <representation> … ],
  "page_info": { "next_cursor": <opaque string | absent>,    // present iff more results exist
                 "has_more":    <boolean>,
                 "total_count": <integer | absent> },         // present only if the contract declares totals (§10.3)
  "reference_id": <uuid> }                                    // platform-assigned UUIDv7, present in every response (Doc-4A §22.1 C-05)
```

- `next_cursor` is present **iff** more results exist (`has_more: true`); it is the §8.2 opaque token. `total_count` is **contract-optional** (`Doc-4A §10.3`): it is present (`<integer>`) only when the contract declares totals, and **absent** otherwise; when present it obeys §8.7. Item `<representation>` is the owning module's representation **by reference** (§5.6; `Doc-4A §10.1`), never reshaped.
- **`reference_id` (top-level):** every list response carries a top-level **`reference_id`** — a platform-assigned `UUIDv7`, generated at request acceptance, never caller-supplied. List responses carry top-level `reference_id` per `Doc-4A §22.1 C-05`.
- **Binds:** `Doc-4A §10.3` (list structure), §10.1 (representation by reference), `§22.1 C-05` (top-level `reference_id`); §5.6 (envelope). **Rationale:** the response structure is upstream; §8 fixes the wire list envelope and carries the top-level `reference_id` required by `§22.1 C-05`.

> **Governance Flag (dependency):** `Doc-4A §22.1 C-05` requires `reference_id` in **every** response, but its realization in the single-entity success shape (§5.6) and the error envelope (§6.1) is **owned by those sections, not §8**. §8 therefore realizes `reference_id` only for the list response and **cannot claim corpus-wide success/error consistency**. Aligning §5.6 and §6.1 to `§22.1 C-05` requires **upstream review and must be resolved in those owning sections** — not patched here.

### 8.7 Exclusion Consistency & Non-Disclosure (binding realization of Doc-4A §10.7 / §7.5)

- `items`, `has_more`, `total_count`, and any facet/aggregate in a list response **MUST** apply the **same exclusion set**: soft-deleted rows (ADR-012), rows outside the requester's tenancy/grants (`§7`), rows excluded by protected facts (`§7.5`), and **routing-excluded rows (routing exclusions are protected facts per `§7.5`)** are absent from **all** of them **identically**. A response **MUST NOT** return a `total_count` or `has_more` that counts rows absent from `items` (`Doc-4A §10.7`).
- **Routing exclusions** are applied **identically** to `items`, to `total_count`/`has_more` (and any facet), and to the pagination/cursor realization (§8.1/§8.2) — a routing-excluded row is never revealed through item content, a count, or a page boundary (`§7.5`/`§10.7`).
- A contract **SHOULD NOT** expose `total_count` on a surface where protected-fact exclusions apply unless it can assert `§7.5` compliance (`Doc-4A §10.3`).
- The cursor **MUST NOT** encode absolute positions or offsets (§8.1/§8.2); page boundaries **MUST NOT** reveal the count or existence of excluded rows.
- **Binds:** `Doc-4A §10.7` (exclusion consistency), §10.3 (total disclosure caution), §7.5 (non-disclosure / inference leak), ADR-012 (soft delete). **Rationale:** pagination is where tenancy meets list mechanics; realizing identical exclusion across items/counts/cursor is the wire guarantee that the list surface leaks no protected fact by inference.

---

*End of Doc-5A Content v1.0, Pass 5 (§8). Pagination/filter/sort wire-grammar realization only — no endpoints, module list contracts, POLICY values, or framework code. §9 onward follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
