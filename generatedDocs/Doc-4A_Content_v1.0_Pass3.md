# Doc-4A — API Standards & Conventions — Content v1.0, Pass 3 (§9–§12)

| Field | Value |
|---|---|
| Document | Doc-4A — API Standards & Conventions |
| Pass | 3 of N — §9, §10, §11, §12 only |
| Structure | Conforms to Doc-4A_Structure_v1.0_FROZEN.md |
| Builds On | Pass 1 (§0–§3, APPROVED), Pass 2 (§4–§8, APPROVED FOR FREEZE, review-4 patches applied) — notation per §3.3, keywords per §3.4, citations per §3.5 |
| Authority | Doc-4_Governance_Note_v1.0.md |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2 — all FROZEN |
| Contains | Standards only — no entities, no workflows, no endpoints |
| Review Findings | Recorded in Doc-4A_Review_Log.md (non-normative), per Board decision; all BLOCKER/MAJOR resolved in this text |

---

## §9 — Request Contract Standard

### 9.1 Field Notation

Every request contract declares its payload as a field list in the §3.3 grammar. Each field line **MUST** carry all four positions:

```
field_name : type : required|optional : constraint / source pointer
```

- `field_name` per §3.2 (snake_case; reference fields named for the target entity per §8.3).
- `type` from the abstract type set (§3.3): `string, integer, decimal, boolean, timestamp, date, uuid, enum(<source pointer>), money, object, list<…>`. No other types; extension requires a Doc-4A patch (Pass 1, finding P1-m1 disposition).
- The constraint position **MUST NOT** be empty: it carries the validation binding (§11), the enum source pointer, the POLICY key (§18), or the literal `none`.

### 9.2 Required, Optional, and Nullable

- **required** — the field **MUST** be present and non-null. Absence is a syntactic validation failure (§11.2, SYNTAX).
- **optional** — the field **MAY** be absent. The contract **MUST** state the behavior of absence in the constraint position. Absence semantics are never implied; the contract **MUST** distinguish by operation type:
  - **Create-command context** (instantiating a new aggregate root): absent optional field → server applies the declared default, named explicitly in the constraint position as a POLICY key (§18) or a corpus-defined static default. Absent does not mean null; if null is separately permissible, it is declared as `nullable`.
  - **Update-command context** (modifying an existing aggregate root): absent optional field → the stored value is unchanged; the field is not written. Absent is not null: an explicit null in an update-command context means what the `nullable` constraint declares. A contract **MUST NOT** treat absent and explicit null as equivalent in an update-command context.
- **nullable** — nullability is declared explicitly as a constraint (`nullable: clears the value` or similar stated semantics). Optional and nullable are distinct: an omitted field means "no change / use default"; an explicit null means what the constraint says it means. A contract **MUST NOT** treat them as interchangeable, and **MUST NOT** declare a nullable field without stating the meaning of null.

### 9.3 Collections

- Collections are declared `list<type>` with mandatory bounds in the constraint position: either a fixed bound from the corpus (cited by pointer) or a POLICY key (§18). An unbounded request collection is nonconforming.
- Collection elements follow the same notation recursively. Heterogeneous collections are prohibited.
- Ordering significance **MUST** be declared (`ordered` | `unordered`); if `ordered`, the contract states what order means.

### 9.4 Enumerations

- Enum fields are declared `enum(<source pointer>)`, where the pointer names the owning corpus location (Doc-2 §5 state values, Doc-2 §3 entity attributes, Doc-3 defined value sets). Values are quoted verbatim (§3.1).
- A request contract **MUST NOT** define a new enum or extend an existing one; a needed-but-missing value is escalated (§0.6).
- **State fields are not writable enums.** In a mutating contract, a request **MUST NOT** accept an entity's lifecycle state as an input field; state changes occur only through commands whose State Machine Effects declare the transition (§13, by pointer to the frozen structure). In a query contract, a lifecycle-state field **MAY** be declared as a filterable or sortable dimension, provided it appears in the contract's explicit filterable/sortable allowlist (§9.6). Such a declaration is a read assertion only — it does not create a writable state path and **MUST NOT** be construed as a state transition or used as a protected-fact filtering shortcut (§7.5; §9.6 second bullet).

### 9.5 Identifiers and References

- All entity references in request payloads are `uuid` (UUIDv7 per §8.1), named per §8.3. `human_ref` appears in requests only as a lookup input to a contract explicitly declared as a lookup (§8.2).
- **Version-bound references:** where the corpus binds an operation to a version (ADR-010; e.g., quotations bind to an RFQ version), the request **MUST** carry the version identifier explicitly (`…_version_id : uuid : required : version-bound per ADR-010`), and the contract **MUST NOT** accept the base-entity ID as an implicit "current version" substitute.
- Cross-module references carry the §4.5 write-time validation obligation, named in the contract's Validation Rules.

### 9.6 Pagination, Filter, and Sort Requests

One canonical grammar for all list requests in all module documents:

```
page_size : integer : optional : bounded by POLICY key (§18); server default by POLICY key
cursor    : string  : optional : opaque continuation token from a prior response (§10.3)
filter    : object  : optional : only fields the contract declares filterable
sort      : list<object{field, direction}> : optional : only fields the contract declares sortable
```

- **Cursors are opaque.** Clients **MUST NOT** be able to construct, decode, or modify them meaningfully; contracts **MUST NOT** define offset/index-based pagination (offset arithmetic leaks exclusion counts, violating §7.5).
- **Filterable and sortable fields are an explicit allowlist** declared per contract. Filtering or sorting on undeclared fields is a syntactic validation failure. Protected facts (§7.5) and other tenants' data are never filterable or sortable dimensions.
- **Sort determinism:** every declared sort **MUST** define a total order; contracts **MUST** declare the tiebreaker (the entity `id`) so ordering is stable across pages.

### 9.7 Prohibited Request Fields

The following **MUST NOT** appear as request fields in any contract. Each is a conformance failure (Appendix A):

| Prohibited | Reason / governing rule |
|---|---|
| Attribution fields (`created_by`, `updated_by`, actor identifiers) | Server-populated only (§5.4) |
| Audit fields (any `core.audit_records` field) | Audit is a platform obligation, never client input (§17 by pointer) |
| Tenant-selection fields (`organization_id` as "act for organization X") | Active organization context is server-validated ambient context (§5.3) |
| Client-controlled authorization fields (roles, slugs, grants, "as_admin" flags) | Authorization derives from §6/§6B checks, never from payload |
| Ownership-changing fields (`owner_organization_id`, controlling-organization reassignment on an unrelated command) | Ownership changes only through the corpus-defined transfer workflows (Master Architecture §7.5), each a dedicated command |
| Lifecycle state fields | §9.4; transitions only via commands |
| Governance signal values as writable inputs outside the owner module's own contracts | §4B |
| Soft-delete fields (`deleted_at`, `deleted_by`, `delete_reason` as direct writes) | Soft delete is a dedicated command with reason semantics (ADR-012, by pointer) |
| `human_ref` as a reference value | §8.2 |
| Tunable limits inline (numeric overrides of POLICY values) | §18 |

### 9.8 Request Pattern Rules

- One command, one aggregate: a mutating request targets exactly one aggregate root instance (Doc-2 §0.4). Batch mutations, if a contract offers them, are declared as a list of independent single-aggregate operations with per-item outcomes (§10.5) — never as one transaction spanning aggregates or modules.
- Requests are transport-neutral: contracts **MUST NOT** reference URLs, verbs, headers, status codes, query strings, or any REST/GraphQL/RPC construct (§2.2). Where a transport concept seems needed (e.g., an idempotency key), it is declared as a contract-level input with its semantics defined in the owning section (§14, by pointer).
- Money fields use the `money` type (`{amount, currency}`, `BDT` default; Doc-2 §0.4). A bare numeric amount field for a monetary value is nonconforming.
- **Timestamp standard (normative, platform-wide):** `timestamp` values are ISO-8601 with explicit UTC designation, exchanged in UTC; `date` values are ISO-8601 calendar dates. Clients never supply business-effective times where the corpus defines them as server-assigned (e.g., state-transition times).

---

## §10 — Response Contract Standard

### 10.1 Entity Representation Rule

- Each entity has exactly one **canonical representation**, defined once in its Owner Module's document and reused by reference everywhere the entity appears. A contract in any other document **MUST NOT** define, extend, or reshape another module's entity representation (§4.3).
- A representation is declared in the §9.1 field notation (without the required/optional position, replaced by `always|conditional`, where `conditional` names the visibility condition per §10.6).
- Representations expose business data only. They **MUST NOT** include: internal computation inputs of governance signals (§4B), grant-table internals beyond what the reading party's own grants justify, audit internals, or any field whose presence/absence varies by a protected fact (§7.5).

### 10.2 Success Response Structure

```
result   : object : always : the canonical (or summary, §10.4) representation of the affected/requested entity
```

- A mutating contract's response returns the canonical representation of the aggregate root after the mutation, including its current state value (read-only) and `updated_at` (which serves as the concurrency token; §14 by pointer).
- A response **MUST NOT** echo server-populated attribution back as if client-supplied, and **MUST NOT** include fields the §10.1 prohibitions exclude.
- Asynchronous-effect disclosure: where a command triggers async work (§15 by pointer), the response **MUST NOT** fabricate completed outcomes (Doc-3 §12.1: no fake activity); it returns the entity in its true post-command state.

### 10.3 List Response Structure

One canonical list shape for all modules:

```
items       : list<representation> : always : exclusion-consistent per §10.7
page_info   : object               : always
  next_cursor : string  : conditional (more results exist) : opaque (§9.6)
  has_more    : boolean : always
  total_count : integer : optional per contract : only if declared, and exclusion-consistent (§10.7)
```

- `total_count` is contract-optional: a list contract declares whether it provides totals. If provided, totals obey §10.7. Contracts **SHOULD NOT** declare totals on surfaces where protected-fact exclusions apply, unless they can state §7.5 compliance.
- Cursors **MUST** remain valid under concurrent data change with at-most-once delivery of each item per traversal as the declared behavior; contracts **MUST NOT** promise snapshot isolation across pages.

### 10.4 Summary Representations

- A module document **MAY** define, per entity, at most one **summary representation**: a strict field-subset of the canonical representation for list/embedding use. It **MUST** be declared once, next to the canonical representation, and **MUST NOT** introduce fields absent from the canonical form.
- Visibility conditions (§10.6) apply identically to summary and canonical forms. A summary is never a visibility bypass.

### 10.5 Batch and Multi-Outcome Responses

Where a contract accepts a list of independent operations (§9.8), the response **MUST** report per-item outcomes positionally, each item being either a `result` or an `error` (§12 structure). Partial success is therefore explicit; contracts **MUST NOT** define all-or-nothing semantics across aggregates.

### 10.6 Reference Expansion Rules

- **Cross-module references stay references.** A response field referring to another module's entity carries the `uuid` (and, where helpful, a display label the owning module's Query already publishes for that audience). A contract **MUST NOT** embed another module's entity representation inside its own responses; consumers compose by calling the owning module's Queries (§4.3).
- **Within-aggregate expansion is permitted:** a root's representation **MAY** embed its own child entities (Doc-2 §2 aggregate composition), declared in the same document.
- No transitive expansion: an embedded child does not expand its own cross-module references.
- **Display labels are bounded, not representations.** A display label carried alongside a cross-module `uuid` reference **MUST** be a single human-readable name or title — the label the owning module's Query publishes for the requesting audience. A display label **MUST NOT** include, encode, or imply: entity lifecycle state; any governance signal (Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer Vendor Status — Master Architecture §1.5); verification or trust indicators; computed scores or Matching Confidence outputs; financial tier or capacity profile data; or any protected fact (§7.5). Carrying a display label **MUST NOT** become a substitute for calling the owning module's Query, and **MUST NOT** be used to construct shadow representations that reconstruct what only the owning module may return (§4.3; One Entity = One Owner principle). Where the owning module's non-disclosure rules would withhold the label for the requesting audience, the cross-module reference carries only the `uuid`; label-absent and label-present response shapes **MUST** be indistinguishable to the caller as an omission signal — the label field is simply absent, not signaled as redacted.

### 10.7 Exclusion Consistency and Visibility

- Items, counts, totals, aggregates, and facets in any response **MUST** apply the same exclusion set: soft-deleted rows (ADR-012), rows outside the requester's tenancy/grants (§7), and rows excluded by protected facts (§7.5) are absent from **all** of them identically. A count that includes what the list omits is a disclosure leak and a conformance failure.
- Every `conditional` field in a representation names its visibility condition by pointer (tenancy class, grant table/party column, or published-by-design state — §7.2/§7.3). Conditions **MUST** be expressible as the requester's own context and grants; a condition **MUST NOT** depend on a protected fact in a way that makes field presence reveal it (§7.5: response channel).
- Redaction-aware fields (Master Architecture §14.3 doctrine): where a field may be redacted under compliance policy, the representation **MUST** declare the redacted form (field absent vs placeholder) so consumers and AI agents handle it deterministically.

### 10.8 Derived Data Declaration

Responses exposing derived data (read-models, matching outputs, computed indicators; Doc-2 §6 derived class) **MUST** declare the field `derived` in the constraint position, with: the authoritative source(s) by pointer, the regenerability statement, and the visibility inheritance per §7.2. Derived fields **MUST NOT** be presented as authoritative entity attributes, **MUST NOT** be writable, and **MUST NOT** widen visibility beyond their sources. Matching Confidence outputs follow the §4B.1 carve-out: surfaced only as Doc-3 §6 defines, never persisted as authoritative.

---

## §11 — Validation Standard

### 11.1 Validation Declaration Grammar

The Validation Rules field of every mutating contract (Template 21.1) is an **ordered list** of rule lines:

```
V<n> : <CATEGORY> : <condition, stated testably> : <source pointer> : <error class per §12>
```

- Rules execute in declared order; order **MUST** follow the §11.2 category sequence. Within a category, rule order is the declared order.
- Every rule **MUST** be testable: a reviewer or AI agent can construct a passing and a failing input from the rule line alone. Vague conditions ("must be valid", "must be reasonable") are nonconforming.
- Every rule **MUST** cite its source: a corpus pointer, a POLICY key, or a Doc-4A section. A rule with no source is invented business logic and is rejected (§0.2).

### 11.2 Validation Categories and Canonical Order

The categories, their fixed order, and their nature:

| Order | Category | Nature | Checks |
|---|---|---|---|
| 1 | SYNTAX | syntactic | Field presence, types, bounds, enum membership (§9); allowlisted filter/sort fields (§9.6) |
| 2 | CONTEXT | authorization | Actor type permitted (§5.2); active organization context valid (§5.3); admin scope declared and satisfied (§5.6) |
| 3 | AUTHZ | authorization | Membership + slug per §6.1/§6.3 |
| 4 | SCOPE | authorization | Resource ownership / grant-based scope per §6.1 and §7.3 |
| 5 | DELEGATION | authorization | The full §6B.2 five-condition check, where the contract is delegation-eligible |
| 6 | STATE | workflow | The entity is in a state from which the declared transition/operation is legal (Doc-2 §5 by pointer; §13) |
| 7 | REF | semantic | Cross-module reference validity via owning module's service (§4.5); version-bound reference correctness (§9.5) |
| 8 | BUSINESS | semantic | Corpus-defined business rules, each cited by pointer (e.g., one-active-quotation rule, Master Architecture §7.4) |
| 9 | POLICY | semantic | POLICY-bounded limits, each referencing its `core.system_configuration` key (§18); entitlement gates by entitlement key |

**Category 9 — dual error class mapping.** Category 9 (POLICY) maps to two distinct error classes (§12.2), distinguished by the nature of the limit:

- A **quota-type limit** — a finite entitlement that has been consumed (§19; §6B.3 quota attribution) — maps to `QUOTA` (`retryable: false`; retry cannot succeed until the quota state changes by an external action such as a plan upgrade or a platform-actor reset).
- A **throughput-type limit** — a rate window governed by a POLICY key that resets on a declared schedule (§19) — maps to `RATE_LIMITED` (`retryable: true`; the contract declares the reset interval in its Error Behavior block).

A contract **MUST** declare, per V\<n> rule in Category 9, whether the limit is quota-type or throughput-type, so that the correct error class is unambiguous to AI agents and reviewers.

**Cross-reference to error classification.** The `error class per §12` position of each V\<n> rule (§11.1 grammar) **MUST** be populated from the closed class set in §12.2. The `Maps from §11 category` column in §12.2 defines the binding. Where a category maps to more than one error class (Category 4/5: `NOT_FOUND` or `AUTHORIZATION` per §12.4; Category 9: `QUOTA` or `RATE_LIMITED` per the dual mapping above), the V\<n> rule **MUST** name the specific class applicable to that rule, not the category-level default. Errors outside the §12.2 closed set are nonconforming and require escalation (§0.6; §12.6).

- Failure terminates evaluation at the first failing category. SYNTAX **MAY** aggregate multiple field errors into one failure; categories 2–9 fail singly.
- The ordering is a disclosure control: authorization (2–5) **MUST** be established before any semantic processing (6–9), so that semantic error detail never reaches unauthorized callers, and protected-fact gating resolves inside the uniform paths required by §7.5.

### 11.3 Validation Is Not a Workflow

- A validation failure has **no effect**: no state change, no partial write, no audit record of the business action (the failed attempt **MAY** be logged per the corpus's audit/abuse rules, cited by pointer — never as a new audit action type), no event emission, no quota consumption unless the corpus explicitly defines attempt-based consumption.
- Validation failures **MUST NOT** create alternate workflows: no auto-saving rejected input as a draft, no auto-transition to a "rejected" or "pending-fix" state, no queuing for review — unless that exact behavior is a corpus-defined transition (e.g., moderation rejection to `draft` is a platform-actor transition per Doc-2 §5.4, not a validation outcome).
- Validation **MUST NOT** invent states, statuses, or reason codes: structured reasons used in validation errors come from corpus-defined reason sets or the error-code namespace (§12.3, Appendix B).

### 11.4 Cross-Module and Delegation Validation Notes

- REF-category checks call the owning module's Query/Service (§4.5); the validating module **MUST NOT** implement another module's validity logic locally (no ownership leakage through validation).
- **DELEGATION-category error classification** is governed by the §12.4 boundary rule and §7.5 non-disclosure requirements. Two cases apply per failure point:

  - **Case A — protected-fact risk:** Where the DELEGATION check fails in a way that would disclose a protected fact — including: revealing that an entity exists which the representative's grant no longer covers; distinguishing "no such entity" from "entity exists but you lack delegation"; or exposing grant existence or scope to a party that has no independent right to know — the error **MUST** be `NOT_FOUND` with the same code, message, and shape as the entity-never-existed response (§12.4 protected-fact collapse rule). Case A is the safe default where case assignment is ambiguous (§12.6).

  - **Case B — established resource, slug gap:** Where the resource's existence and the grant's existence are both established as non-protected facts already visible to the caller through their legitimate scope (neither constitutes a protected-fact disclosure), and the DELEGATION check fails solely because the required slug is absent from the grant's permission_set (§6B.2, condition 3), the error **MUST** be `AUTHORIZATION`. In Case B, only the permission gap is disclosed; resource and grant existence are already known.

  Contracts that declare delegation eligibility **MUST** identify, per failure point, the applicable case in their Error Boundary block (§12.4).

---

## §12 — Error Contract Standard

### 12.1 Canonical Error Structure

One error shape for the entire platform:

```
error_class  : enum(§12.2)        : always
error_code   : string             : always   : namespaced per Appendix B; stable; machine-readable
message      : string             : always   : from the module's fixed message catalog (§12.4)
field_errors : list<object{field, error_code, message}> : conditional (VALIDATION only)
retryable    : boolean            : always   : per §12.2 defaults; §14 governs retry semantics
reference_id : uuid               : always   : correlation identifier for support/audit lookup;
                                               reveals nothing about the failure cause
```

No module document may add, remove, or rename envelope fields; extension requires a Doc-4A patch.

### 12.2 Error Classification

The closed set of error classes (no module may add classes):

| Class | Meaning | Maps from §11 category | Retryable default |
|---|---|---|---|
| `VALIDATION` | Request fails SYNTAX rules | 1 | false (fix input) |
| `AUTHORIZATION` | Caller lacks context/membership/slug for an operation on a resource it legitimately knows exists | 2, 3 | false |
| `NOT_FOUND` | Resource does not exist **or** caller has no right to know whether it exists | 4, 5 (and protected-fact cases of any category) | false |
| `STATE` | Operation illegal from the entity's current state | 6 | false (state must change first) |
| `REFERENCE` | A supplied cross-module/version reference failed validation | 7 | false |
| `BUSINESS` | A cited business rule rejected the operation | 8 | false |
| `QUOTA` | Entitlement/quota exhausted (consumption per §19/§6B.3 attribution) | 9 | false until quota changes |
| `RATE_LIMITED` | Throughput control engaged (POLICY-bound; §19) | 9 | true, after the contract-declared interval semantics |
| `CONFLICT` | Concurrency precondition failed (stale token, duplicate non-idempotent submission) | — (§14) | true, after re-read |
| `ASYNC_PENDING` | Result not yet available for an accepted async operation (§15) | — | true |
| `DEPENDENCY` | An owning module's service required for REF/composition was unavailable | — | true |
| `SYSTEM` | Platform fault | — | true |

**QUOTA vs RATE_LIMITED distinction.** `QUOTA` signals a finite entitlement whose supply is exhausted; time passing alone does not restore it — retry without an external state change (plan upgrade, platform-actor quota reset) is meaningless (`retryable: false`). `RATE_LIMITED` signals a throughput window that resets on a policy-declared schedule; retry is meaningful after the declared interval (`retryable: true`). Contracts **MUST NOT** return `RATE_LIMITED` for quota exhaustion, or `QUOTA` for throughput-limit engagement. The §11.2 Category 9 dual mapping note defines which validation rule maps to which class.

### 12.3 Error Codes and Messages

- `error_code` values are allocated within the module's reserved namespace (Appendix B), are stable across contract versions (§20 by pointer), and **MUST NOT** encode protected facts, other tenants' data, or internal module structure.
- Reason codes carried in errors come only from corpus-defined reason sets (cited by pointer) or the module's registered code namespace. Errors **MUST NOT** mint ad-hoc reason strings.
- `message` strings come from a fixed per-module catalog declared in the module document; messages **MUST NOT** interpolate data the caller could not otherwise read (no other-tenant names, counts, states, or existence facts). Messages are developer/user-readable but never the machine contract — agents and clients **MUST** branch on `error_class`/`error_code` only.

### 12.4 Non-Disclosure Error Behavior (binding application of §7.5)

- **Protected-fact collapse rule.** Wherever an operation fails because of, or in the presence of, a protected fact (blacklist status, routing exclusion, private CRM relationship, Buyer Vendor Status, protected visibility decisions, private-link facts), the error **MUST** be exactly the error that an entity-never-existed or never-matched case would produce — same `error_class` (`NOT_FOUND` for resource access; the uniform declared class for other surfaces), same `error_code`, same message, same `field_errors` shape, same declared timing path (§7.5).
- **AUTHORIZATION vs NOT_FOUND boundary.** `AUTHORIZATION` is returned **only** when the caller's right to know the resource exists is already established by its own tenancy/grants (e.g., a member lacking a slug for their own organization's record). If existence itself is not the caller's to know, the error is `NOT_FOUND` — with no distinguishing detail. Each contract's error declaration **MUST** state, per failure point, which side of this boundary it falls on.
- **Lookup parity.** Lookup-by-`human_ref` (§8.2) returns the identical `NOT_FOUND` for "no such reference" and "reference not visible to you" (closes Pass 2 finding P2-m3).
- **No protected enrichment.** `field_errors`, `DEPENDENCY` details, `RATE_LIMITED` metadata, and `QUOTA` details **MUST NOT** reveal protected facts, other tenants' activity, or routing-pipeline internals (Doc-3 §12.1 non-disclosure FIXED rules, by pointer).
- **Timing-Uniformity declaration (contract assertion).** A contract that applies the protected-fact collapse rule **MUST** carry a `Timing-Uniformity` assertion in its Error Boundary block (see below):

  ```
  Timing-Uniformity: asserted | not-applicable
  ```

  `asserted` declares that the protected-fact case and the standard (no protected fact) case for the same operation travel the same processing path with no timing signature distinguishable between them — as required by §7.5. `not-applicable` declares that the contract handles no protected-fact scenarios. The `Timing-Uniformity` assertion is a contract-level commitment reviewable by humans and AI agents and is a conformance check (Appendix A). It does **not** prescribe the implementation mechanism for achieving timing uniformity; implementation choices (queue design, padding, async paths) belong in development documents (§2.2).
- **Error Boundary block — canonical location.** The per-failure-point AUTHORIZATION/NOT_FOUND boundary declarations required by §12.4 (second bullet), the per-delegation-failure case assignment required by §11.4, and the `Timing-Uniformity` assertion required above, **MUST** all appear in a dedicated **Error Boundary** block within the contract's Error Behavior declaration (§21 template). The block form is:

  ```
  Error-Boundary:
    V<n> : NOT_FOUND | AUTHORIZATION | collapse-rule   (repeated for each failure point)
    Timing-Uniformity : asserted | not-applicable
  ```

  The `V<n>` identifiers reference the corresponding validation rules (§11.1 grammar). This block is machine-readable, AI-reviewable, and is checked by Appendix A. A contract with protected-fact exposure and a missing or incomplete Error Boundary block is nonconforming. The safe default for any ambiguous failure point is `NOT_FOUND | collapse-rule` (§12.6).

### 12.5 Class-Specific Rules

- `STATE` errors **MAY** name the entity's current state and the legal transitions **only** to callers whose scope already includes reading that state (§10.6); otherwise the protected-fact collapse rule applies.
- `CONFLICT` errors **MUST** carry enough to retry correctly (the current concurrency token) and nothing about the competing actor.
- `QUOTA` errors are attributed per §6B.3 (controlling organization for delegated actions); the error **MUST** state which party's quota is exhausted only to parties entitled to see that quota.
- `DEPENDENCY` errors name the failed dependency only as the caller-visible operation that could not complete — never internal module/service topology.
- `SYSTEM` errors carry no cause detail beyond `reference_id`.

### 12.6 Escalation Behavior

- If a module contract cannot express a failure within the closed class set and registered codes, the author **MUST NOT** invent a class or stretch a code's meaning; flag-and-halt (§0.6) applies — for codes, via an Appendix B registration request (Doc-4A patch path).
- If an author cannot determine which side of the §12.4 AUTHORIZATION/NOT_FOUND boundary a failure point falls on, the safe default is `NOT_FOUND` (non-disclosure-preserving), and the ambiguity **MUST** be recorded for review.
- Implementations and AI agents encountering an undeclared failure path at build time **MUST** treat it as a contract gap (escalate), not improvise an error.

---

*End of Doc-4A Content v1.0 — Pass 3 (§9, §10, §11, §12). Self-review findings recorded in Doc-4A_Review_Log.md (non-normative); all BLOCKER and MAJOR findings resolved in this text. Next pass: §13–§17 per the frozen structure.*
