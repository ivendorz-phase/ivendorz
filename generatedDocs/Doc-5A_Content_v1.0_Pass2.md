# Doc-5A — API Realization Standards — Content v1.0, Pass 2 (§3–§4)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 2 of N — Sections §3–§4 only |
| Status | ACTIVE — Content Pass 2 of N; §3–§4 only; incorporates Patch v1.0.1 and Board Assessment rounds 1–2 (`review.txt`); pending Pass-2 Patch Verification |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Contains | Wire-format realization standards only — naming, serialization, canonical wire representations, transport envelope, standard-header registry. No endpoints, request/response examples, error mappings, auth realization, pagination, idempotency, async, or versioning |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** Each rule below binds to a frozen upstream authority by pointer and adds only the wire realization. Doc-4A §9.8 explicitly defers transport concepts (headers, status, wire encoding) to "the owning section" — Doc-5A is that owner. Where Doc-4A and the corpus are silent on a purely transport-level encoding, Doc-5A fixes a convention under §0.3; each such convention is marked **[realization convention]** with its rationale. **No missing declared authority was encountered in this pass; nothing is invented.**

---

## Incorporated Revisions (consolidated — patch file retired)

```
Patch v1.0.1 (folded in; provenance retained here):
  P-01  Restored §4 title; added §4.0 Transport Envelope realization
  P-02  Added Pagination Cursor conditional slot to §4.4
  P-03  Removed nonexistent "§10 / observability" owning-section pointer; rebound to valid authority
  P-04  Merged trace-propagation into Request Correlation Id slot; removed separate Optional row
  P-05  Restored create-command vs update-command optional-field semantics in §3.8
  P-06  Restored contract-declared idempotency/concurrency model per Doc-4A §14
  P-07  Restricted entity-id tiebreaker scope to paginated entity list sorting
  P-08  Added [realization convention] markers to §3.2 / §3.7 / §3.9
  P-09  Removed unsupported "valid-code set owned by Doc-2 §0.4" claim
  P-10  Added HTTP infrastructure header / Doc-5A application header boundary
  R-01  §3.5: prohibited +00:00 and equivalent UTC offset forms (Z-only)
  R-02  §3.6: lexical grammar precision for amount decimal string

Board Assessment round 1 (review.txt) — applied:
  M-01  Canonical header tokens surfaced in §4.4 registry, cross-referenced to Appendix B
  M-02  Request Correlation Id behavior explicitly declared OUT OF SCOPE for Doc-5A
  N-01  §3.5 fractional-second precision explicitly deferred (no corpus authority)
  N-02  §3.6 zero / trailing-zero / scale normalization clarified
  N-03  §4.0 no-body responses clarified (root-object rule applies only when a body exists)
  N-04  §4.4 four-way classification confirmed consistent with frozen structure §4
  NP-01 §3.4 citation updated RFC-4122 → RFC-9562 (defines UUIDv7; obsoletes 4122)

Board Assessment round 2 (review.txt) — applied:
  M-01  §4.4 Pagination Cursor REMOVED from header registry; it is a pagination concern owned by §8 (registry kept header-only)
  N-01  §3.5 added note: canonicalization for hashing/signing/idempotency owned by §9/§14, not §3.5
  N-02  §4.4 Request Correlation Id generation reclassified development-owned / non-normative
  N-03  §4.3 Iv- prefix marked [realization convention] with authority cited (§0.3; ratified in Appendix B)
  NP-01 §4.4 Authentication carrier token reduced to `Authorization`; scheme owned by §7 (no "Bearer" named)
  NP-02 §4.4 Surface-version naming standardized → role "Surface version", token `Iv-Api-Version`
```

---

## §3 — Wire Naming & Serialization Standard

Realizes `Doc-4A §3` (terminology/naming), `§8` (identifiers), `§9` (request notation, types, timestamp, money). Every rule states **Binds** (upstream owner) and **Rationale**, and defines wire encoding only — never a schema, entity, DTO, or endpoint payload.

### 3.1 JSON Serialization

- The Doc-5 API surface serializes all request and response bodies as **JSON**, encoded **UTF-8**. A Doc-5 module contract **MUST NOT** define any other body serialization for the realized surface.
- **Binds:** §2.2 (HTTP transport binding); `Doc-4A §2` (implementation neutrality — wire format is a realization choice, not an architecture rule).
- **Rationale [realization convention]:** Doc-4A is wire-format-neutral; the family needs one serialization so ten module documents are mutually consistent. JSON is the single bound encoding.

### 3.2 Property Naming

- A JSON property name **MUST** equal the abstract field name from the owning corpus location **verbatim**, in `snake_case` (singular noun; collection fields plural; boolean fields phrased as predicates `is_…`/`has_…` or the domain flag named in Doc-2). No casing transformation is applied on the wire (no `camelCase`/`PascalCase` aliasing). **[realization convention]**
- **Binds:** `Doc-4A §3` (field-naming standard) → Doc-2 §3, §10.
- **Rationale [no-casing-transformation = realization convention]:** Doc-4A fixes abstract field names as `snake_case` but is wire-format-neutral; fixing identical no-transform wire encoding eliminates aliasing as a second naming authority and preserves reference-never-restate.

### 3.3 Enum Serialization

- Enum values serialize as a **JSON string** carrying the `snake_case` token **verbatim** from the owning corpus location (`enum(<source pointer>)`). Numeric, ordinal, or abbreviated enum encodings are **forbidden**.
- A contract **MUST NOT** serialize a value outside the owning enum's frozen set; a needed-but-missing value is escalated (`Doc-5_Program_Governance_Note_v1.0 §7`), never coined on the wire.
- **Binds:** `Doc-4A §9.4` (enumerations); Doc-2 §5 (state values) / §3 (entity attributes) / Doc-3 value sets.
- **Rationale:** Stable string tokens keep wire values self-describing and aligned with the frozen vocabulary; numeric enums drift silently across documents.

### 3.4 Identifier Serialization

- A `uuid` (UUIDv7) serializes as a **JSON string** in the canonical **RFC-9562** textual form — **lowercase**, hyphenated `8-4-4-4-12`. UUIDv7 is the only identifier permitted in payload references. *(RFC-9562 defines UUIDv7 and its canonical text form and obsoletes RFC-4122.)*
- `human_ref` serializes as a **JSON string** in its uppercase-prefixed form verbatim (e.g. `RFQ-2026-000123`); it is display/lookup-only and **MUST NOT** be used as a reference value.
- **Binds:** `Doc-4A §8.1` (UUIDv7 authority), `§8.2` (human_ref lookup-only); Doc-2 §0.1; Master Architecture §17.2.
- **Rationale [lowercase = realization convention]:** the corpus fixes UUIDv7 as the identifier; the lowercase canonical text form is fixed here so byte-for-byte identifier comparison and idempotency keying (§9, later pass) are deterministic.

### 3.5 Timestamp & Date (ISO-8601) Realization

- A `timestamp` serializes as a **JSON string** in **ISO-8601** with an **explicit UTC designator** (`Z`), exchanged in UTC. The `Z` designator is the **only** accepted UTC representation; `+00:00` and equivalent UTC-offset expressions are **forbidden** even when they denote UTC, so timestamp comparison is unambiguous without normalization.
- **Fractional-second precision is not fixed by the frozen corpus and is therefore not mandated by Doc-5A.** A producer **MAY** emit zero or more fractional digits (decimal separator `.`); a consumer **MUST** accept any precision. **[realization convention — precision ownership explicitly deferred]:** no corpus authority fixes sub-second precision; Doc-5A defers it rather than inventing one, and requires consumers to be precision-tolerant. Multiple lexical forms therefore coexist on the wire by design; **canonicalization for hashing, signing, or idempotency keying is owned by §9 / §14 (by pointer), not §3.5** (board N-01).
- A `date` serializes as a **JSON string** as an ISO-8601 calendar date (`YYYY-MM-DD`).
- Server-assigned times (e.g. state-transition times) are **never** accepted as client input.
- **Binds:** `Doc-4A §9.8` (timestamp standard — ISO-8601, explicit UTC, exchanged in UTC; date = ISO-8601 calendar); `Doc-4A §5.4` (attribution/server-assigned fields are server-populated; not client inputs).
- **Rationale [`Z`-only lexical form = realization convention]:** Doc-4A fixes "ISO-8601, explicit UTC"; the single lexical form (`Z`, no alternate offset forms) removes parsing ambiguity across documents.

### 3.6 Money Realization

- A `money` value serializes as a **JSON object** with exactly two members: `amount` and `currency`.
  - `amount` serializes as a **JSON string** in canonical decimal notation: digits `0–9`, at most one decimal point `.`, no exponent notation, no thousands separators, no leading plus sign. A JSON number **MUST NOT** be used for `amount`.
  - **Amount canonicalization (N-02):** zero is the single token `"0"` (never `"0.0"`, `"-0"`, `"00"`, or empty); no leading zeros in the integer part (a single `0` permitted only when the integer part is zero, e.g. `"0.5"`); **no insignificant trailing zeros and no trailing decimal point** (`"1.5"`, not `"1.50"`; `"2"`, not `"2.0"` or `"2."`); non-negative amounts carry no sign, and a permitted negative amount carries exactly one leading `-`.
  - **Display scale** (a fixed number of decimal places per currency) is a **presentation concern owned by the frontend (Doc-7)**; the wire `amount` carries the value, not its display scale. Doc-5A defines no per-currency scale.
  - `currency` serializes as a **JSON string** carrying the currency code; `BDT` is the platform default per Doc-2 §0.4. No closed currency-code set is defined or enumerated in the frozen corpus; Doc-2 §0.4 governs the money type definition.
- A bare numeric monetary field (an amount without its `currency`, or a money value serialized as a number) is **nonconforming**.
- **Binds:** `Doc-4A §9.8` (money type, bare-number nonconformance); Doc-2 §0.4 (`{amount, currency}`, BDT default).
- **Rationale [`amount`-as-string + canonical form = realization convention]:** IEEE-754 JSON numbers cannot represent decimal monetary amounts exactly; a decimal string preserves precision, and a single canonical lexical form makes amount equality and idempotency/audit hashing deterministic. Display scale is left to presentation because the corpus does not fix per-currency scale.

### 3.7 Boolean Realization

- A `boolean` serializes as a **JSON boolean literal** (`true` / `false`) only. The strings `"true"`/`"false"`, and the numbers `0`/`1`, are **forbidden** as boolean encodings. **[realization convention]**
- **Binds:** `Doc-4A §3` (booleans as predicate-named fields); §3.3 type set.
- **Rationale [boolean-as-JSON-literal = realization convention]:** Doc-4A defines booleans as a type but is wire-format-neutral; fixing JSON literal encoding eliminates the string/numeric boolean ambiguity that is a recurrent cross-document inconsistency.

### 3.8 Nullability Rules (Wire Realization of Required / Optional / Nullable)

Realizes the three distinct dispositions of `Doc-4A §9.2` on the wire, with the **optional** disposition differentiated by command context per `Doc-4A §9.2`. A contract **MUST NOT** treat absent and explicit `null` as equivalent.

| Disposition (Doc-4A §9.2) | Context | Wire realization |
|---|---|---|
| **required** | — | Property **MUST** be present and non-null. |
| **optional**, unset | Create-command | Property key is **omitted** from the JSON object. Absence means the server applies the declared default (POLICY key or corpus-defined static default, per `Doc-4A §9.2`). It **MUST NOT** be serialized as `null`. |
| **optional**, unset | Update-command | Property key is **omitted** from the JSON object. Absence means the stored value is **unchanged**; the field is not written. It **MUST NOT** be serialized as `null`. |
| **nullable**, null | — | Property key is **present** with JSON `null`; the meaning of `null` is the one the constraint declares. |

- **Binds:** `Doc-4A §9.2` (required/optional/nullable distinction; create-command vs update-command absence semantics).
- **Rationale:** The omit-vs-`null` wire mapping, differentiated by command context, is the only encoding that preserves `Doc-4A §9.2`'s distinct absent semantics: "apply default" in create-command context and "no change" in update-command context. Collapsing both contexts produces incorrect wire behavior for create operations.

### 3.9 Collection Realization

- A `list<type>` serializes as a **JSON array** of homogeneous elements (heterogeneous arrays are **forbidden**). Elements follow the recursive rules of this section.
- An empty collection serializes as `[]` (an empty array), never as `null` or an omitted key, when the field is present. **[realization convention]**
- Where the corpus declares ordering significance (`ordered`), the serialized array order **MUST** equal the declared order; where `unordered`, consumers **MUST NOT** depend on element order.
- **Binds:** `Doc-4A §9.3` (collections — bounds, homogeneity, ordering significance).
- **Rationale [empty-collection-as-array = realization convention]:** `Doc-4A §9.3` fixes collection notation and ordering significance but is wire-format-neutral; fixing `[]` (not `null`) for empty present collections prevents the "missing list vs empty list" ambiguity across ten module documents.

### 3.10 Deterministic Ordering Requirements

- **Object members are unordered.** A JSON object is a set of name/value members; a consumer **MUST NOT** depend on property order, and a producer **MUST NOT** assign meaning to it.
- **Array order is significant only when declared `ordered`** (§3.9). For a paginated entity list (§8) declared `ordered`, the serialized order **MUST** be a total order including the entity `id` as the declared tiebreaker, so results are stable across pages. For non-paginated ordered collections (e.g., embedded child entities within an aggregate), ordering follows `Doc-4A §9.3` — the contract declares what the order means; an entity-id tiebreaker is not required unless the contract declares one.
- Any requirement for a **canonical/stable byte serialization** (e.g. for idempotency keying or audit hashing) is owned by §9 / §14 and bound there by pointer; §3 fixes only ordering meaning above.
- **Binds:** `Doc-4A §9.6` (sort determinism, `id` tiebreaker — paginated entity lists); `Doc-4A §9.3` (ordering significance for non-paginated ordered collections); `Doc-4A §14` (idempotency/concurrency — by pointer, not defined here).
- **Rationale:** Removes order-dependence as a source of nondeterministic clients while scoping the entity-id tiebreaker requirement to the paginated-list context where stability across pages is the relevant invariant.

---

## §4 — Transport Envelope & Standard Header Set

Realizes the structure's §4. This section defines the **HTTP transport envelope** and the **registry structure, ownership, governance, allocation, reserved-namespace policy, and canonical tokens** for standard application headers, and classifies each standard application header as **mandatory / conditional / optional / forbidden**. It does **not** define the authentication model (§7), rate limits (§6/§19 by pointer), API versioning behavior (§12), pagination wire grammar (§8), or any endpoint behavior — those are owned by their named sections in later passes and bound here only by pointer.

### 4.0 Transport Envelope

The HTTP transport envelope for every Doc-5 API request and response has two layers:

1. **Body layer** — the JSON business payload; its structure is realized in §5 (endpoint request and response shapes) and §6 (error shapes).
2. **Header layer** — the standard out-of-band application headers defined in the registry below.

Rules:

- The HTTP request body and response body, **when present**, **MUST** carry a **JSON object** as the root value. Bare JSON arrays, JSON primitives (`string`, `number`, `boolean`), and `null` as the HTTP body root are **nonconforming**.
- **No-body outcomes (N-03):** an operation **MAY** define a no-body request or response where its owning section (§5 success outcomes, §6 error outcomes, §10 response contract) declares one (e.g., an accepted-async outcome, or a no-content result). The root-JSON-object rule applies **only when a body is present**; the absence of a body is conforming where the owning section declares it. Doc-5A does not, in this pass, enumerate which operations omit a body — that is §5/§6/§10 behavior.
- The header layer **MUST NOT** duplicate or substitute body fields; headers carry transport-level metadata only (§4.4 Forbidden).
- **HTTP infrastructure headers** (`Content-Type`, `Accept`, `Accept-Encoding`, connection-management headers, and equivalent transport-plumbing headers) are **outside** the Doc-5A standard header registry. They are implementation-level transport plumbing governed by development documents (§1.3 scope deferral). The standard header registry in §4.3–§4.4 and Appendix B covers **Doc-5A application-level headers only**.
- **Binds:** `Doc-4A §2.2` (transport neutrality — the wire envelope is a realization choice, not an architecture rule); `Doc-4A §9.8` (contracts MUST NOT reference headers; transport concepts are realized in their owning section).

### 4.1 Purpose of Standard Headers

- Standard headers carry **transport-level metadata** that is out-of-band from the business payload (correlation, context carriage, idempotency keying, concurrency preconditions, surface version). `Doc-4A §9.8` forbids such transport concepts inside the contract payload and defers them to their owning realization section; §4 is the single home for the **header registry**.
- A single closed registry guarantees the same concern uses the **same header in every module document**, so ten documents authored in parallel do not invent ten header idioms.

### 4.2 Ownership & Governance

- **Doc-5A owns the standard-header registry.** Each header's **behavior** is owned by the section named in its registry row (§4.4) and is defined in that section's pass; this pass registers the **slot, canonical token, classification, and owning-section pointer**.
- A Doc-5 module document (Doc-5B…5M) **MUST NOT** define, rename, repurpose, or extend a standard header, and **MUST NOT** introduce a non-registered header that carries semantic meaning.

### 4.3 Allocation & Reserved-Namespace Policy

- **Reserved namespace [realization convention — token scheme]:** Doc-5A application headers occupy a reserved namespace consisting of (a) the platform-reserved prefix **`Iv-`** for platform-specific headers (e.g. `Iv-Request-Id`, `Iv-Active-Organization`, `Iv-Api-Version`), and (b) reused **standard IETF/HTTP headers**, explicitly registered, where one already serves the slot (`Authorization`, `Idempotency-Key`, `If-Match`). The `X-` prefix is not used (RFC 6648). **Authority (board N-03):** the `Iv-` prefix and this token scheme are a **[realization convention]** fixed under **§0.3** — the frozen corpus is silent on concrete header names, so Doc-5A fixes a convention that contradicts nothing upstream; final tokens are ratified in Appendix B.
- **Canonical tokens are surfaced in the §4.4 registry (board M-01)** and are the authoritative names module authors reference. **Appendix B** (Reserved API-Surface Namespace Registry, later pass) records the same tokens as the central cross-document registry; §4.4 and Appendix B **MUST** agree, and any later divergence is resolved by Doc-5A amendment.
- A new standard application header is added **only by Doc-5A amendment** (additive patch) registering it in §4.4 and Appendix B with its owning section. Module-document invention of headers is **forbidden** (mirrors the `Doc-4A Appendix B` reserved-namespace discipline).
- HTTP infrastructure headers (`Content-Type`, `Accept`, etc.) are outside this registry and outside the conformance surface (§4.0).

### 4.4 Header Registry & Classification — Mandatory / Conditional / Optional / Forbidden

> **Classification-vocabulary note (board N-04):** the four-way *Mandatory / Conditional / Optional / Forbidden* classification is a content-level refinement of the frozen structure's "standard header registry" (`Doc-5A_Structure_v1.0_FROZEN §4`). It introduces no TOC change and is consistent with the structure authority.

**Mandatory** (every request of the stated type carries the slot; behavior in the owning section):

| Slot (role) | Canonical token | Classification | Owning section (behavior) | Meaning (slot/token only) |
|---|---|---|---|---|
| Request correlation id | `Iv-Request-Id` | Mandatory (every request) | **Out of scope for Doc-5A** — development/observability documents (§1.3) | Correlates a request across the async surface; accepts an inbound trace context for propagation when present. Carries no business data. **(M-02)** |
| Authentication carrier | `Authorization` | Mandatory (every authenticated request) | **§7** (later pass) | Carries the caller's authentication credential. The authentication **scheme** and validation are defined in §7 — **not here**. |
| Active-organization context carrier | `Iv-Active-Organization` | Mandatory (every org-scoped operation) | **§7** (later pass) | Names the active organization context; **server-validated, never client-trusted** (`Doc-4A §5.3`/§9.7). |

**Request Correlation Id — behavior scope (board M-02 / N-02):** the correlation-id **lifecycle** (generation when absent, propagation, retention, sampling) is **OUT OF SCOPE for Doc-5A** and owned by development/observability documents (§1.3). Doc-5A fixes only: the slot, its canonical token `Iv-Request-Id`, that it **carries no business data**, and that an inbound value is accepted for propagation. **Generation-when-absent and any propagation/retention behavior are development-owned and non-normative to Doc-5A** — Doc-5A asserts no generation behavior.

**Conditional** (mandatory when the owning section's rule applies):

| Slot (role) | Canonical token | Classification | Owning section | Meaning (slot/token only) |
|---|---|---|---|---|
| Idempotency key | `Idempotency-Key` | Conditional — present when the contract declares `Idempotency: required` (`Doc-4A §14.2`); absent otherwise | **§9** (later pass) | Carries the idempotency key; duplicate-request behavior defined in §9. |
| Concurrency precondition | `If-Match` | Conditional — present when the contract declares `Concurrency: optimistic` (`Doc-4A §14.5`); absent when `Concurrency: none` | **§9** (later pass) | Carries the optimistic-concurrency token (`updated_at` per `Doc-4A §14.5`); semantics in §9. |
| Surface version | `Iv-Api-Version` | Version-carriage header (owned by §12) | **§12** (later pass) | Carries the API surface-version identifier; versioning behavior defined in §12. (Present per the §12 rules; this cell records ownership only — kept identical to Appendix B.4 per §4.5, PATCH-D5A-0D.) |

> **Pagination cursor (board M-01):** the paginated-traversal continuation cursor is a **pagination concern, not a header**. It is carried as the `cursor` request parameter (`Doc-4A §9.6`) and owned entirely by **§8**; it is **not** a slot in this header registry. Removed from the registry to keep §4 a pure header registry (no non-header entries).

**Optional:**

No additional optional slots are defined in this pass. Inbound trace-context propagation is subsumed in the Request Correlation Id mandatory slot.

**Forbidden** — a request **MUST NOT** carry, and the surface **MUST NOT** honor, any header that:

| Forbidden header class | Governing rule |
|---|---|
| Asserts identity, role, permission, slug, grant, or an "as-admin" flag | Authorization is server-enforced per **§7** (Identity, Context & Authorization Realization Standard; later pass; realizes `Doc-4A §§5, 6`). Headers must never carry authorization assertions (`Doc-4A §9.7`). |
| Selects a tenant / acts-for-organization by client assertion (bypassing server validation) | Active-organization context is server-validated ambient context (`Doc-4A §5.3`/§9.7). |
| Supplies attribution (`created_by`/`updated_by`/actor id) or audit fields | Server-populated only (`Doc-4A §9.7`, §17 by pointer). |
| Overrides a POLICY value, limit, or quota inline | `Doc-4A §9.7` (prohibited request fields: tunable limits inline); §18 (POLICY key authority). |
| Duplicates or substitutes a business payload field | Payload is the contract surface; headers carry transport metadata only (§4.0). |
| Is an unregistered application header carrying semantic meaning | Allocation is §4.4 / Appendix-B-only (§4.3). |

### 4.5 Registry Synchronization (Appendix B)

Each standard-header row above is the authoritative source of its **role/slot name**, **canonical token**, **classification**, and **owning section** (which defines its behavior). **Appendix B** (later pass) mirrors this registry as the cross-document namespace registry and **MUST** agree with §4.4; divergence is resolved by Doc-5A amendment. No header **value format** or **behavior** is defined in §4 — those belong to each header's owning section.

- **Binds:** structure §4 (header registry); `Doc-4A §9.8` (transport concepts deferred to owning section); `Doc-4A §9.7` (prohibited client-asserted inputs, realized at the header layer); §7/§8/§9/§12 (header behaviors, later passes); Appendix B (cross-document mirror).

---

*End of Doc-5A Content v1.0, Pass 2 (§3–§4). Consolidated: Patch v1.0.1 + Board Assessment (`review.txt`) findings folded in; the standalone patch file is retired. Wire-format, transport-envelope, and header-registry realization only — no endpoints, examples, error mappings, auth realization, pagination, idempotency, async, or versioning. §5 onward follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
