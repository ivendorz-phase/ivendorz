# Doc-5A — API Realization Standards — Content v1.0, Pass 3 (§5–§6)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 3 of N — Sections §5–§6 only |
| Status | ACTIVE — Content Pass 3 of N; §5–§6 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1 (§0–§2), Pass-2 (§3–§4) |
| Contains | Endpoint and error wire realization only — HTTP method/path/status binding, request/response envelope binding, error-class→status mapping, non-disclosure wire behavior. No real endpoints, no module contracts, no schemas, no framework code; one non-normative illustration as the frozen structure requires |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** §5 and §6 add the HTTP-transport realization of contract shapes whose *abstract* form is already frozen in Doc-4A. The abstract endpoint template (`Doc-4A §21.1`), request notation (`Doc-4A §9`), response structure (`Doc-4A §10`), error structure and classes (`Doc-4A §12`), validation order (`Doc-4A §11`), and non-disclosure invariant (`Doc-4A §7`) are bound **by pointer** and are **not** restated. Transport-level decisions the corpus leaves open are marked **[realization convention]** with rationale.

---

## §5 — Endpoint Realization Standard

Realizes the `Doc-4A §21.1` Endpoint Contract Template and `Doc-4A §4` surface topology as a concrete HTTP operation. A module endpoint is the **instantiation of its abstract Doc-4A §21.1 contract** (owned upstream) **plus** the realization fields this section adds. §5 defines only the realization fields; it neither restates nor re-decides any §21.1 field.

### 5.1 Surface Style (ratified)

- The Doc-5 surface is a **resource-oriented HTTP surface with explicit command actions for state-changing operations**. Reads are addressed as resources; mutations are addressed as **named commands** on a resource, never as arbitrary field replacement.
- **Binds:** `Doc-4A §4` (every contract is a Command, Query, Service, Event, or Public Contract of its owning module); `Doc-4A §9.8` ("one command, one aggregate"); `Doc-4A §9.7` (state, ownership, attribution fields are never client inputs); `Doc-4A §9.2` (create-command vs update-command contexts); `Doc-4A §11.2`/§11.3 (the fixed command-validation order; validation is not a workflow); `Doc-4A §10.2` (a mutating command returns the aggregate root in its true post-command state); `Doc-4A §13` (mutations are state-machine-gated commands, by pointer).
- **Rationale [realization convention — surface style]:** the corpus is transport-neutral (`Doc-4A §2.2`) but command-shaped — mutations carry declared State Machine Effects and cannot be modelled as free CRUD field writes. A resource+command hybrid is the realization that fits the frozen command model without re-deciding it. Fixed here so ten module documents realize the same shape.

### 5.2 HTTP Method Selection

| Contract kind (Doc-4A §4.2) | HTTP method | Notes |
|---|---|---|
| Query (read item / list) | `GET` | Safe, no body; inputs in path/query (§5.4). |
| Create-command (new aggregate root) | `POST` to the collection | Success `201` (§5.5). |
| Update-command (partial, non-state field change, `Doc-4A §9.2` update-command) | `PATCH` on the item | Absent optional field = no change (§3.8). Never full-replace. |
| State-transition / domain command (`Doc-4A §13`) | `POST` to a named command sub-resource | The command name is the transition/operation, not an arbitrary verb. |
| Soft-delete command (ADR-012, by pointer) | `DELETE` on the item | Realizes the soft-delete command; never a hard delete. |

- `PUT` (full-replace) is **not** used: the platform has no full-replace command semantics (mutations are partial, state-gated commands). A module document **MUST NOT** realize a domain mutation as `PUT`.
- **Binds:** `Doc-4A §4.2`, §9.2, §9.7, §13; ADR-012. **Rationale [realization convention — method mapping]:** the corpus is method-neutral; one mapping prevents per-module method drift.

### 5.3 URL / Path Grammar

```
/{module-namespace}/{resource-plural}                      # collection      (GET list, POST create)
/{module-namespace}/{resource-plural}/{id}                 # item            (GET, PATCH, DELETE)
/{module-namespace}/{resource-plural}/{id}/{command-name}  # command action  (POST)
```

- `{module-namespace}` is the owning module's reserved route prefix (Appendix B; one owner per resource, `Doc-4A §4.1`). A contract appears only under its owning module's namespace; cross-module composition is via Services/Events/Public Contracts (`Doc-4A §4.2`), never a foreign-namespace endpoint.
- `{id}` is a `UUIDv7` in canonical form (§3.4). A lookup endpoint **MAY** accept a `human_ref` only where the contract is declared a lookup (`Doc-4A §8.2`); `human_ref` is never a mutation-path identifier.
- `{resource-plural}` and `{command-name}` are `snake_case` tokens drawn from the owning module's contract; no abstract verb (`get`/`update`) appears in a collection or item path — only named commands appear as `{command-name}`.
- **Binds:** `Doc-4A §4.1` (ownership), §4.2 (channels), §8.1/§8.2 (identifiers), §3 (naming). **Rationale [realization convention — path grammar]:** a single path grammar makes the surface mechanically reviewable and collision-free (namespaces in Appendix B).

### 5.4 Input Placement

| Location | Carries | Authority |
|---|---|---|
| Path | Resource identifier(s) — `UUIDv7` (or `human_ref` for a declared lookup) | §3.4; `Doc-4A §8` |
| Query | List pagination/filter/sort parameters; lookup keys | `Doc-4A §9.6` grammar realized in §8 (later pass) |
| Body (JSON object root, §4.0) | The command's Request Contract fields | `Doc-4A §9` (request notation) |
| Headers | Standard headers only (§4.4) | §4; never business inputs (`Doc-4A §9.7`) |

- Prohibited request fields (`Doc-4A §9.7`) are forbidden in **every** location — path, query, body, and header alike (attribution, tenant-selection, authorization, lifecycle-state, POLICY-override, soft-delete fields, `human_ref` as a reference).

### 5.5 Success Status Families

| Status | Used for | Body | Authority |
|---|---|---|---|
| `200 OK` | Query result; update-command; synchronous command with a result | `{ "result": <representation> }`, or list shape (§5.6) | `Doc-4A §10.2`, §10.3 |
| `201 Created` | Create-command producing a new aggregate root | `{ "result": <canonical representation> }`; a standard `Location` response header to the item **[realization convention]** | `Doc-4A §10.2` |
| `202 Accepted` | Command triggering async work | the async status resource (owned by §10, later pass); **MUST NOT** fabricate completed outcomes | `Doc-4A §15`; Doc-3 §12.1 |
| `204 No Content` | Command whose owning contract declares a no-body outcome | none (no-body outcome, §4.0) | §4.0; `Doc-4A §10` |

- The `Location` (201) response header is a **standard HTTP infrastructure header [realization convention]**, governed by HTTP semantics and **outside** the Doc-5A application-header registry (§4.0) — as is `Retry-After` (§6.4).
- **Binds:** `Doc-4A §10.2/§10.3` (response/list structure), §15 (async). **Rationale [realization convention — status families]:** the corpus fixes response *structure*, not HTTP status; one mapping keeps success semantics uniform.

### 5.6 Request & Response Body Binding

- Every request/response body, when present, is a **JSON object root** (§4.0).
- **Single-entity success:** `{ "result": <representation> }`, where `<representation>` is the owning module's canonical (or summary) representation **by reference** (`Doc-4A §10.1/§10.2` — never reshaped here).
- **List success:** `{ "items": [ <representation> … ], "page_info": { … } }`, realizing the `Doc-4A §10.3` list structure (`items`, `page_info.next_cursor`, `has_more`, optional `total_count`); the pagination *grammar* is owned by §8 (later pass) and bound by pointer.
- **Batch / multi-outcome:** per-item positional outcomes, each a `result` or an `error` object (`Doc-4A §10.5`); partial success is explicit.
- **Binds:** `Doc-4A §10.1–§10.5`. **Rationale [realization convention — envelope keys]:** Doc-4A fixes the `result`/`items`/`page_info`/`error` field structure; fixing the JSON-object root and these top-level keys gives one envelope across all modules.

### 5.7 Endpoint Realization Template

A module endpoint document instantiates its **abstract `Doc-4A §21.1` contract** (fields in the frozen order: Header → Permissions → Delegation → Firewall → Request → Response → Validation → Error Behavior → State Machine → Idempotency → Concurrency → Async → Events Produced → Events Consumed → Audit → Entitlements → Stage → Rate Limits — owned upstream, bound by pointer) **and additionally declares the following realization fields:**

```
Realization (Doc-5A §5):
  HTTP-Method      : one of GET | POST | PATCH | DELETE          (§5.2)
  Path             : the §5.3 path grammar instance               (§5.3)
  Input-Placement  : map each Request field → path | query | body (§5.4)
  Success-Status   : the §5.5 status for the success outcome      (§5.5)
  Response-Body    : result | list | none (no-body)               (§5.6)
  Error-Status-Set : { <error_class> -> <HTTP status per §6.2> }  (§6.2; fill grammar below)
```

**Error-Status-Set fill grammar (N-03):** the field is the set of `{ error_class -> HTTP status }`
pairs for **only the subset** of the `Doc-4A §12.2` closed class set that the contract can actually
raise — derived from its Validation Rules and Error-Behavior declaration (`Doc-4A §11`/§12). A contract:
- lists **each** error class it can return, each at its **§6.2** status (the status is fixed by §6.2,
  never chosen per contract);
- **omits** classes it cannot raise (the subset is declared, not the full twelve);
- **MUST NOT** list `ASYNC_PENDING` here (realized by §10, not the §6 error envelope);
- **MUST NOT** invent a class or status — an unrepresentable failure is escalated (§6.6).

- The realization fields **MUST NOT** introduce any input, permission, event, state, audit action, or POLICY key absent from the abstract contract; they bind transport only. A realization that would require an absent declared element is escalated (`Doc-5_Program_Governance_Note_v1.0 §7`), never invented.
- **Binds:** `Doc-4A §21.1` (abstract template), §9, §10, §13–§17 (by pointer); §6 (error status).

### 5.8 Illustrative Instantiation (NON-NORMATIVE)

> **NON-NORMATIVE ILLUSTRATION.** The following shows only how the §5.7 realization fields attach to an abstract contract. It defines **no endpoint, no contract, and no fields**; it invents nothing. Real contracts are authored solely in the owning module's document (Doc-5B…5M). Entity name used illustratively from Doc-2 only.

For a hypothetical create-command on the Doc-2 `organization` aggregate (owner: Identity, M1):

```
(abstract contract: Doc-4A §21.1 fields — owned by the identity module document, not here)
Realization (Doc-5A §5):
  HTTP-Method     : POST
  Path            : /identity/organizations
  Input-Placement : Request fields → body (JSON object root); no path/query inputs
  Success-Status  : 201 Created   (+ Location response header to /identity/organizations/{id})
  Response-Body   : result  ( { "result": <organization canonical representation, by reference> } )
  Error-Status-Set: per §6 mapping for the contract's declared error classes
```

This illustrates field placement only; the identity module document is the sole authority for the actual `organization` contract.

---

## §6 — Error Realization & Status Mapping Standard

Realizes `Doc-4A §12` (canonical error structure, the closed error-class set, codes, and non-disclosure error behavior) on the HTTP wire, preserving `Doc-4A §7` non-disclosure. `Doc-4A §12` is transport-neutral; this section makes the **error-class → HTTP-status mapping normative** and fixes the wire error envelope. Error-class *meanings* are owned by `Doc-4A §12.2` and bound by pointer, not restated.

### 6.1 Error Wire Envelope

- An error response body is a **JSON object root** (§4.0): `{ "error": <Doc-4A §12.1 error structure> }`, i.e. `error.error_class`, `error.error_code`, `error.message`, `error.field_errors` (VALIDATION only), `error.retryable`, `error.reference_id`.
- The envelope fields, their names, and their meanings are owned by `Doc-4A §12.1` and are **not** added to, removed, or renamed here. Doc-5A fixes only the JSON-object root and the single top-level `error` key (mirroring the `result` key of §5.6 and the `result`/`error` duality of `Doc-4A §10.5`).
- **Binds:** `Doc-4A §12.1`, §10.5; §4.0. **Rationale [realization convention — error envelope key]:** one wire envelope for errors across all modules; structure itself is upstream.

### 6.2 Error-Class → HTTP Status Mapping (normative)

The closed error-class set (`Doc-4A §12.2`) maps to HTTP status as follows. Clients and agents **MUST** branch on `error.error_class`/`error.error_code`, never on status alone (`Doc-4A §12.3`); status is a coarse transport signal and several classes deliberately share one status.

| `error_class` (meaning: Doc-4A §12.2) | HTTP status | Notes |
|---|---|---|
| `VALIDATION` | `400 Bad Request` | `field_errors` present (Doc-4A §12.1). |
| `AUTHORIZATION` | `403 Forbidden` | Existence is the caller's to know (Doc-4A §12.4). |
| `NOT_FOUND` | `404 Not Found` | Includes every protected-fact collapse (§6.3). |
| `STATE` | `409 Conflict` | Operation illegal from current state. |
| `CONFLICT` | `409 Conflict` | Stale concurrency token / duplicate non-idempotent submission. The concurrency-precondition carriage and token-mismatch realization are owned by **§9** (later pass); §6 fixes only the status. |
| `REFERENCE` | `422 Unprocessable Content` | Cross-module/version reference failed. |
| `BUSINESS` | `422 Unprocessable Content` | A cited business rule rejected the operation. |
| `QUOTA` | `403 Forbidden` | Entitlement exhausted; `retryable:false`; **no** `Retry-After` (§6.4). `403` not `429`: quota exhaustion is an entitlement/authorization-style denial, not throughput limiting — waiting cannot restore a finite entitlement (contrast `RATE_LIMITED`). |
| `RATE_LIMITED` | `429 Too Many Requests` | `retryable:true`; carries `Retry-After` (§6.4). |
| `ASYNC_PENDING` | *realized by §10 — not the §6 error envelope* | The accepted-then-processing response and the status resource a caller polls are the **single authoritative realization path, owned by §10** (later pass). §6 does **not** also realize `ASYNC_PENDING` through the error envelope. |
| `DEPENDENCY` | `503 Service Unavailable` | Owning-module service unavailable; `retryable:true`. |
| `SYSTEM` | `500 Internal Server Error` | No cause detail beyond `reference_id` (Doc-4A §12.5). |

- **Binds:** `Doc-4A §12.2` (closed class set + retryable defaults), §12.3 (branch on class/code), §12.5 (class-specific rules). **Rationale [realization convention — status numbers]:** Doc-4A leaves HTTP mapping to the realization layer; this is that mapping. Shared statuses (403 for AUTHORIZATION+QUOTA; 422 for REFERENCE+BUSINESS; 409 for STATE+CONFLICT) are safe because `Doc-4A §12.3` mandates branching on `error_class`/`error_code`.
- A module document **MUST NOT** map an error class to a different status, and **MUST NOT** return a class outside the closed set (`Doc-4A §12.6` escalation applies).

### 6.3 Non-Disclosure on the Wire (binding realization of Doc-4A §7 / §12.4)

- **Protected-fact collapse:** wherever the protected-fact collapse rule applies (`Doc-4A §12.4`), the wire response **MUST** be **indistinguishable** from the entity-never-existed/never-matched response: identical HTTP status (`404`), identical `error` body (same `error_code`, `message`, `field_errors` shape), and identical timing path. Status, body bytes, and timing **MUST NOT** vary by the protected fact.
- **AUTHORIZATION (403) vs NOT_FOUND (404):** `403` is returned **only** where the caller's right to know the resource exists is already established by its own tenancy/grants; otherwise `404` per `Doc-4A §12.4`. The per-failure-point boundary is declared in the contract's Error-Boundary block (`Doc-4A §12.4`/§11.4) — Doc-5A realizes the two statuses but never widens disclosure.
- **Lookup parity:** lookup-by-`human_ref` returns identical `404` for "no such reference" and "not visible to you" (`Doc-4A §12.4`).
- **No protected enrichment:** `field_errors`, `RATE_LIMITED`/`QUOTA` metadata, `DEPENDENCY` detail, and any response header **MUST NOT** reveal protected facts, other tenants' data, or routing-pipeline internals (`Doc-4A §12.4`; Doc-3 §12.1).
- **Timing uniformity:** where a contract asserts `Timing-Uniformity: asserted` (`Doc-4A §12.4`), the wire **MUST NOT** introduce a status- or body-derived timing signature distinguishing the protected case. The implementation mechanism (padding, queue/async design) is owned by development documents (`Doc-4A §2.2`) — Doc-5A asserts the observable requirement only.
- **Binds:** `Doc-4A §7`, §12.4, §11.2 (authorization-before-semantic ordering); Doc-3 §12.1.

### 6.4 Retryability & Rate / Quota Realization

- `error.retryable` is realized verbatim from the class default / contract declaration (`Doc-4A §12.2`); Doc-5A adds no new retry semantics (`Doc-4A §14` owns retry, by pointer).
- **`RATE_LIMITED` (429):** carries a `Retry-After` response header expressing the contract-declared reset interval (`Doc-4A §12.2`/§11.2 Category-9 throughput mapping). `retryable:true`.
- **`QUOTA` (403):** carries **no** `Retry-After` (waiting does not restore a finite entitlement); `retryable:false`. The distinction `RATE_LIMITED` vs `QUOTA` is the `Doc-4A §11.2`/§12.2 dual mapping — a contract **MUST NOT** return one for the other.
- **`DEPENDENCY` (503):** `retryable:true`; a `Retry-After` response header **MAY** be supplied where the contract declares an interval. **`ASYNC_PENDING`** retry/polling is realized by §10 (async surface), not §6.
- **`Retry-After` is a standard HTTP infrastructure header**, governed by HTTP semantics — it is **outside** the Doc-5A application-header registry of §4 (§4.0). Doc-5A only states *when* it is carried; its format is HTTP-standard.
- **Binds:** `Doc-4A §12.2`, §11.2 (Category 9 dual mapping), §19 (rate/quota declaration), §14 (retry, by pointer). **Rationale [realization convention — Retry-After]:** `Retry-After` is the standard HTTP carrier for the corpus's already-declared retry interval; no new behavior is introduced.

### 6.5 Validation-Order Preservation

- The error returned is the class of the **first failing validation category** (`Doc-4A §11.2` fixed order: SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → STATE → REF → BUSINESS → POLICY). Doc-5A maps that resulting class to its status (§6.2) and **MUST NOT** reorder, merge, or short-circuit the categories — the order is a disclosure control owned by `Doc-4A §11.2` (authorization established before any semantic error detail is computed).
- `SYNTAX` **MAY** aggregate multiple `field_errors` into one `400`; categories 2–9 fail singly (`Doc-4A §11.2`).
- **Binds:** `Doc-4A §11.2`, §11.3.

### 6.6 Escalation

- An undeclared failure path, or a failure that cannot be expressed within the closed class set and the module's registered error codes, is a **contract gap**: the author **MUST** flag-and-halt and escalate (`Doc-4A §12.6`; `Doc-5_Program_Governance_Note_v1.0 §7`) — never invent a class, status, or code on the wire.
- The safe default for an ambiguous AUTHORIZATION/NOT_FOUND failure point is `NOT_FOUND` (`404`), the non-disclosure-preserving choice (`Doc-4A §12.6`).
- **Binds:** `Doc-4A §12.6`; `Doc-5_Program_Governance_Note_v1.0 §7`.

---

*End of Doc-5A Content v1.0, Pass 3 (§5–§6). Endpoint and error wire realization only — no real endpoints, module contracts, schemas, or framework implementation; the single §5.8 instantiation is explicitly non-normative. §7 onward follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
