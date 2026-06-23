# Doc-4A — API Standards & Conventions — Content v1.0, Pass 6 (Finalization, Consistency & Annexures)

| Field | Value |
|---|---|
| Document | Doc-4A — API Standards & Conventions |
| Pass | 6 of 6 — FINAL — §22, Annexures A–I |
| Structure | Conforms to Doc-4A_Structure_v1.0_FROZEN.md |
| Builds On | Pass 1 (§0–§3), Pass 2 (§4–§8), Pass 3 (§9–§12, Patch v1.0.1), Pass 4 (§13–§17, Patch v1.0.1), Pass 5 (§18–§21, Appendices A–C, Patch v1.0.1) — all FROZEN |
| Authority | Doc-4_Governance_Note_v1.0.md |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2 — all FROZEN |
| Pass Type | Finalization, Consistency Correction & Annexure Creation — no redesign, no new architecture |
| Audience | Claude Code, Cursor, AI development agents, backend, frontend, QA engineers |
| Doc-4A Status | **FREEZE CANDIDATE** — all six passes complete |

---

## §22 — Pass 6 Consistency Corrections

This section records corrections identified during the internal consistency audit (Objective 1), cross-document alignment audit (Objective 2), and Claude Code readiness audit (Objective 3). All corrections are authoritative. Where a correction supplements prior pass content, this section takes precedence for the specific item corrected. All prior pass content not addressed here is confirmed consistent and unchanged.

---

### 22.1 Terminology and Naming Consistency Corrections

The following terms are normalized across all Doc-4A passes. Where these corrections conflict with any prior pass text on the specific term or pattern, this section governs.

**Correction C-01 — "unsafe" operation terminology**

Prior usage (Pass 4 §14.1, Pass 5 Template 21.1, Pass 5 CHK-151): "unsafe operations" as the class of commands requiring idempotency.

Normalized form: **mutating operation** (creates, updates, soft-deletes, or state-transitions an entity). "Unsafe" is an HTTP-protocol concept (§2 — implementation-neutral); the Doc-4A term is "mutating operation" or "command contract" (per Template 21.4). CHK-151 reads: "Mutating operations declare `Idempotency: required`." All template annotations referencing "unsafe operations" are interpreted as "mutating operations."

**Correction C-02 — `field_errors` sub-shape**

The canonical error envelope (§12.1) declares `field_errors` as a field but does not specify its element shape. Normalized shape:

```
field_errors: list<{
  field:   string   -- dot-path to the failing field (e.g., "contact.email")
  code:    string   -- module-namespaced error code for this field (Appendix B §B.2)
  message: string   -- human-readable description; no protected facts; no interpolation
}>
```

`field_errors` is absent (not an empty list) when no field-level breakdown is available (e.g., BUSINESS or STATE failures). An absent `field_errors` and an empty `field_errors: []` are not equivalent; absent means the error is not field-addressable.

**Correction C-03 — "escalate" procedure normalization**

"Apply flag-and-halt (§0.6) and escalate" appears throughout all passes. Normalized meaning (for Claude Code and AI agent consumers): halt the current authoring or code-generation task; record the conflict as a structured finding citing both documents and sections; do not proceed with the conflicting change; surface the finding to a human reviewer. The specific escalation path (ticket, PR comment, document finding) is an implementation concern and belongs in development documents.

**Correction C-04 — AI Agent actor description consistency**

Pass 2 §5 and Pass 4 §13.5 both describe the AI Agent actor as read-only/advisory. Normalized statement: the AI Agent actor type is **advisory only** — it MAY submit read queries and advisory requests; it MUST NOT drive any state transition directly. Any write side effect of an AI Agent advisory output is attributed to the User or System actor that accepted and executed the advisory (§17.3, CHK-194). This applies uniformly regardless of the AI agent's capabilities or the contract surface it calls.

**Correction C-05 — "reference_id" field consistent presence**

The `reference_id` field appears in both the error envelope (§12.1) and audit requirements (§17.2). Normalized: `reference_id` is a platform-assigned UUID (UUIDv7) present in **every** contract response — success and error — generated at request acceptance. It is the primary linkage between the API response, the audit record, and the idempotency key. Contracts MUST NOT use a caller-supplied value as the `reference_id`.

**Response Contract mandate (P6-B01):** Every contract's Response Contract block (Template 21.1 §Response Contract) MUST include the following line as a mandatory field, regardless of actor type, operation type, or response shape:

```
reference_id : uuid : always : platform-assigned UUIDv7; generated at request acceptance; links response to audit record and idempotency key
```

This line is binding on all contracts authored against Templates 21.1 through 21.6. Its absence from a contract's Response Contract is a conformance failure.

---

### 22.2 Appendix A Supplement — Template Conformance Checks (CHK-231 through CHK-236)

These checks complete the reference made in §21: "Deviation from a template's field set, field order, or fill grammar is a conformance failure (Appendix A, CHK-231 through CHK-236)." They are additive to Appendix A and carry the same authority and format.

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-231 | Every endpoint contract uses Template 21.1 as its base (directly or via a 21.3–21.6 specialization) | §21 | B |
| CHK-232 | The correct specialization template is applied per the §21 selection guide: Query → 21.3; Command → 21.4; System Actor (Phase-2) → 21.5; Admin → 21.6 | §21 | B |
| CHK-233 | No mandatory template field is absent without a `none` or `not-applicable` declaration | §21 (per-template mandatory annotations) | B |
| CHK-234 | Template field sections appear in the declared order: Header → Permissions → Delegation → Firewall → Request → Response → Validation → Error Behavior → State Machine → Idempotency → Concurrency → Async → Events Produced → Events Consumed → Audit → Entitlements → Stage → Rate Limits | §21.1 | M |
| CHK-235 | CONDITIONAL fields are included when their stated condition is met and excluded otherwise; their presence or absence is not discretionary | §21 (CONDITIONAL annotations) | B |
| CHK-236 | OMIT-IF-NONE fields carry the exact literal declaration `none` when inapplicable — a field's absence is nonconforming even when the value would be `none` | §21 (OMIT-IF-NONE annotations) | M |

---

### 22.3 Claude Code and AI Agent Readiness Clarifications

The following decision rules resolve the most likely ambiguity points for AI coding agents authoring Doc-4B–4N contracts.

**Rule R-01 — Template selection when uncertain**

If the operation type is ambiguous:
1. Does the contract create, update, delete, or transition an entity state? → Template 21.4 (Command).
2. Does the contract only read data with no write side effect? → Template 21.3 (Query).
3. Is the actor always System and triggered by an event? → Template 21.5 (System Actor).
4. Is the actor always Admin? → Template 21.6 (Admin).
5. Is the contract an event-driven integration between two modules? → Template 21.2 (Integration).
6. None of the above → Template 21.1 (base Endpoint).

Do not apply multiple templates to a single contract. If a contract appears to require two templates, it is two contracts — split it.

**Phase-2 exception — one contract, not two:** A command contract (Template 21.4) that triggers Phase-2 async work uses a single Template 21.4 contract with an Async Declaration block (§15.2) declaring `Execution: async` and a `Phase-2:` navigation pointer. Do not apply Template 21.5 to the same Phase-1 contract. Template 21.5 is a separate, independent contract for the Phase-2 worker itself, authored by the Phase-2 owning module in that module's document (Rule R-02). Two separate contracts result: the Phase-1 command (Template 21.4, async) in the originating module's document, and the Phase-2 worker (Template 21.5) in the Phase-2 owning module's document.

**Rule R-02 — Phase-2 contract location**

A Phase-2 async contract belongs in the **Phase-2 owning module's document** (Doc-4B–4N), not in the Phase-1 originating module's document. The Phase-1 contract declares only the `Phase-2:` navigation pointer field. If the Phase-2 owning module document has not yet been authored, the Phase-2 contract is a placeholder stub in that module's future document — it is not declared inline in the Phase-1 contract.

**Rule R-03 — Protected-fact failure path**

When implementing the Error Boundary: if the resource existence depends on information the caller must not know (blacklist, routing exclusion, Buyer Vendor Status, private CRM, grant state), the failure path MUST produce a `NOT_FOUND` response regardless of the actual reason. Do not distinguish "not found" from "found but hidden" by any surface channel — error code, field_errors, timing, or count. If uncertain whether a fact is protected: treat it as protected.

**Rule R-04 — POLICY key gap handling**

If a contract requires a limit value but no `core.system_configuration.<key>` exists for it in Doc-3 §12.2: do not invent the key; do not hardcode the value. Apply the following procedure:

1. **Omit** the Rate-Limit block for the affected V\<n\> rule entirely.
2. **Add a BLOCKER self-review finding** in the contract's self-review section with the text: `POLICY key required for V<n> <description of limit> — key absent from Doc-3 §12.2 — escalate per §0.6 before freeze`.
3. **Apply flag-and-halt** (§0.6): halt authoring of dependent sections; do not submit the contract for freeze until the Doc-3 §12.2 patch establishing the key is approved and the Rate-Limit block is completed.

A contract with an unresolved BLOCKER self-review finding MUST NOT be frozen. This procedure is CHK-012 compliant: no field in the contract document carries a prohibited term.

**Rule R-05 — Idempotency key source**

The idempotency key is supplied by the caller in a transport-level mechanism (header, metadata field) defined in development documents — it is never a field in the contract's Request Contract. If an agent generates a request contract with an `idempotency_key` field in the Request Contract body, that is a conformance violation (CHK-153). The contract declares idempotency requirements; the transport binding determines how the key is carried.

**Rule R-06 — Single-aggregate-root rule**

A contract operates on exactly one aggregate root (§9.8, CHK-088). If a business operation appears to require modifying two aggregate roots in one call, it requires two separate contracts coordinated via events. Do not create a compound contract. Flag the multi-root requirement and escalate for a workflow design decision.

---

## Annexures

Annexures A–I are implementation reference material. They do not define new standards. All examples use iVendorz domain terminology and conform to the standards defined in Passes 1–5. Where examples show JSON-like payloads, the notation is representation-neutral unless otherwise stated — transport and serialization bindings are defined in development documents.

---

## Annexure A — Permission Naming Convention Reference

### A.1 Naming Structure

All permission slugs follow a fixed namespace and pattern. No slug may be used in a contract unless it is registered in Doc-2 §7.

| Namespace | Prefix | Actor type | Registration |
|---|---|---|---|
| Organization permission space | `can_` | User | Doc-2 §7 patch required |
| Platform staff permission space | `staff_` | Admin | Doc-2 §7 patch required |

**Pattern within `can_` namespace:**

```
can_<verb>_<entity>
can_<verb>_<entity>_<qualifier>
```

**Pattern within `staff_` namespace:**

```
staff_<verb>_<entity>
staff_<verb>_<entity>_<qualifier>
staff_access_<domain>
```

### A.2 Verb Vocabulary

Slugs MUST use verbs from this closed list. Introducing a new verb requires a Doc-2 §7 patch; it is not permitted within a Doc-4 document.

| Verb | Meaning | Example slug |
|---|---|---|
| `create` | Initiate a new entity instance | `can_create_rfq` |
| `view` | Read an entity | `can_view_vendor_profile` |
| `edit` | Update a mutable field | `can_edit_company_details` |
| `submit` | Submit a draft for processing | `can_submit_quote` |
| `withdraw` | Retract a submitted item | `can_withdraw_rfq` |
| `approve` | Accept or authorize | `can_approve_vendor_registration` |
| `reject` | Decline | `can_reject_quote` |
| `cancel` | Abort an active process | `can_cancel_rfq` |
| `manage` | Lifecycle management of a bounded sub-resource collection within the holder's organization context — covers create, update, and remove operations on the sub-resource instances; does not imply top-level entity creation, deletion, or ownership transfer. The specific operations a `can_manage_*` slug governs MUST be enumerated in the Required Permissions declaration of every contract that uses it. | `can_manage_team_members` |
| `delegate` | Grant delegation rights | `can_delegate_vendor_profile` |
| `export` | Retrieve data in bulk form | `can_export_analytics` |
| `access` | Generic access right (use when no specific verb fits) | `staff_access_trust_data` |

### A.3 Allowed Patterns

```
can_create_rfq
can_view_rfq
can_submit_quote
can_withdraw_rfq
can_manage_team_members
can_view_vendor_profile
can_edit_company_details
can_delegate_vendor_profile
can_export_analytics_reports
staff_access_trust_data
staff_manage_verification
staff_view_audit_log
staff_approve_vendor_registration
```

### A.4 Prohibited Patterns

| Prohibited pattern | Reason | Correct form |
|---|---|---|
| `admin_create_rfq` | `admin_` is not a registered namespace prefix | `staff_create_rfq` |
| `can_rfq_create` | Verb must precede entity | `can_create_rfq` |
| `canCreateRFQ` | camelCase not permitted; use snake_case | `can_create_rfq` |
| `can_create` (no entity) | Entity qualifier required | `can_create_rfq` |
| `can_view_rfq_if_owner` | Conditional logic not embedded in slug; resource scope is declared separately (§6.3 Scope field) | `can_view_rfq` |
| `can_full_access` | "full_access" is not a registered verb | Use `can_manage_<entity>` |
| `buyer_can_view` | Role prefix not permitted | `can_view_rfq` |
| `can_view_rfq_v2` | Version suffix not permitted | `can_view_rfq` (slug is version-stable) |

### A.5 Multi-Slug Authorization

When an operation requires multiple slugs, they are combined with `AND` in the Slugs field. OR-based slug logic is not expressible at the slug level; if either of two slugs grants access, model it as two separate contracts or use resource scope to distinguish. Examples:

```
Slugs: can_submit_quote AND can_view_rfq
Slugs: staff_manage_verification AND staff_access_trust_data
```

---

## Annexure B — Error Catalog Reference

### B.1 Error Class Reference

Complete catalog of the twelve closed error classes. No module may extend this catalog; changes require a Doc-4A §12 patch.

| Class | Category | HTTP mapping (non-normative) | Retryable | `field_errors` | Client recovery |
|---|---|---|---|---|---|
| `VALIDATION` | Input | 400 | false | present — one entry per failing field | Fix input per `field_errors` entries |
| `AUTHORIZATION` | Access | 403 | false | absent | Caller lacks the required permission slug or membership |
| `NOT_FOUND` | Access / Non-disclosure | 404 | false | absent | Resource absent or protected — no distinguishable path |
| `STATE` | Domain | 409 | false | absent | Entity not in a valid pre-state for this operation |
| `REFERENCE` | Domain | 422 | false | present — identifying the invalid reference field | Verify cross-module reference IDs |
| `BUSINESS` | Domain | 422 | false | absent (or present if field-attributable) | Resolve the named business condition |
| `QUOTA` | Limit | 429 | false | absent | Plan change or platform-actor quota reset required |
| `RATE_LIMITED` | Limit | 429 | true — after reset interval | absent | Retry after the declared reset interval per the contract's `Reset-Interval` POLICY key |
| `CONFLICT` | Concurrency | 409 | true — after re-read | absent | Re-read entity for current concurrency token, then retry |
| `ASYNC_PENDING` | Async | 202 | true | absent | Poll or observe via declared Observation contract |
| `DEPENDENCY` | Infrastructure | 503 | true — with backoff | absent | Retry with exponential backoff; log `reference_id` |
| `SYSTEM` | Infrastructure | 500 | true — with backoff | absent | Retry with exponential backoff; log `reference_id` for support |

> **Note:** HTTP status codes are non-normative (§2). Contracts are transport-neutral. The column above reflects conventional REST mapping for documentation purposes only.

### B.2 Error Envelope Shape

Full canonical shape incorporating the `field_errors` sub-shape correction from §22.1 C-02:

```
{
  error_class:   string    -- from closed 12-class set (§12.2)
  error_code:    string    -- module-namespaced: <module_prefix>_<domain>_<code>
  message:       string    -- human-readable; from module's fixed catalog; no protected facts
  field_errors:  list<{    -- present for VALIDATION and field-attributable REFERENCE/BUSINESS only
    field:   string        -- dot-path to failing field (e.g., "items.0.quantity")
    code:    string        -- module-namespaced error code for this field
    message: string        -- human-readable field-level description
  }> | absent
  retryable:     boolean   -- per B.1 table; MUST match the error class's default
  reference_id:  uuid      -- platform-assigned UUIDv7; present in all responses (§22.1 C-05)
}
```

### B.3 RATE_LIMITED Retry Guidance

The canonical error envelope (§12.1) is sufficient for `RATE_LIMITED` responses. The `Reset-Interval` POLICY key declared in the contract's Rate-Limit block defines the authoritative reset window. Runtime derivation of a retry delay from `core.system_configuration.<reset_key>` is an implementation concern declared in development documents.

```
{
  error_class:  "RATE_LIMITED"
  error_code:   "<module_prefix>_rate_window_exceeded"
  message:      "<human-readable>"
  retryable:    true
  reference_id: uuid
}
```

A transport-level hint carrying the actual seconds-to-reset value (e.g., a `Retry-After` header in REST implementations) MAY be provided by development documents as a non-normative implementation convenience. Its presence or absence does not affect contract conformance.

### B.4 Module Error Code Prefix Reference

Error codes follow the format `<prefix><domain>_<code>`. See Appendix B §B.2 for the full prefix table. Example codes by module:

| Module | Prefix | Example error_code |
|---|---|---|
| Platform Core | `core_` | `core_config_key_not_found` |
| Identity & Org | `identity_` | `identity_org_inactive`, `identity_membership_required` |
| Marketplace | `marketplace_` | `marketplace_vendor_not_discoverable` |
| RFQ Engine | `rfq_` | `rfq_submission_window_closed`, `rfq_vendor_ineligible` |
| Business Operations | `ops_` | `ops_document_version_mismatch` |
| Trust | `trust_` | `trust_verification_pending` |
| Communication | `comm_` | `comm_channel_unavailable` |
| Monetization | `billing_` | `billing_quota_exhausted`, `billing_plan_required` |
| Admin | `admin_` | `admin_scope_insufficient` |
| AI Layer | `ai_` | `ai_advisory_not_available` |

---

## Annexure C — Response Envelope Examples

All examples use iVendorz domain context. JSON-like notation — representation-neutral. The `reference_id` values shown are illustrative UUIDv7 strings.

### C.1 — Success: Command Response

A vendor profile update command returns the entity in its post-command state.

```json
{
  "vendor_profile_id": "01927a3b-c7d2-7a4e-91f5-2b8c3d4e5f6a",
  "organization_id":   "01927a3b-0001-7a4e-91f5-2b8c3d4e5f6b",
  "display_name":      "Apex Industrial Supplies Ltd.",
  "status":            "active",
  "updated_at":        "2026-06-13T10:42:00Z",
  "reference_id":      "01927a3b-f000-7a4e-91f5-aabbccddeeff"
}
```

*The `reference_id` in a success response is the same platform-assigned identifier that appears in the audit record for this operation.*

### C.2 — Validation Error

An RFQ submission fails because a required field is absent and a list bound is exceeded.

```json
{
  "error_class":  "VALIDATION",
  "error_code":   "rfq_submission_invalid_input",
  "message":      "The RFQ submission request contains invalid input.",
  "field_errors": [
    {
      "field":   "delivery_location",
      "code":    "rfq_field_required",
      "message": "Delivery location is required."
    },
    {
      "field":   "items",
      "code":    "rfq_field_list_bound_exceeded",
      "message": "Item count exceeds the configured maximum."
    }
  ],
  "retryable":    false,
  "reference_id": "01927a3b-f001-7a4e-91f5-aabbccddeef0"
}
```

### C.3 — Business Rule Violation

A quote submission is rejected because the RFQ is no longer in a state that accepts quotes.

```json
{
  "error_class":  "STATE",
  "error_code":   "rfq_state_not_accepting_quotes",
  "message":      "This RFQ is no longer accepting quote submissions.",
  "retryable":    false,
  "reference_id": "01927a3b-f002-7a4e-91f5-aabbccddeef1"
}
```

*Note: STATE errors do not include `field_errors`. The resolution path is observing the RFQ lifecycle state via the owning module's Query contract.*

### C.4 — Authorization Failure

A user attempts to withdraw an RFQ without holding the required permission slug.

```json
{
  "error_class":  "AUTHORIZATION",
  "error_code":   "rfq_permission_slug_missing",
  "message":      "You do not have permission to withdraw RFQs.",
  "retryable":    false,
  "reference_id": "01927a3b-f003-7a4e-91f5-aabbccddeef2"
}
```

*The message names the operation category, not the specific slug. Disclosing slug names in error messages is permitted; disclosing internal permission tables or role hierarchies is not.*

### C.5 — Protected-Fact NOT_FOUND (Collapse Rule Applied)

A buyer requests details for a vendor profile that exists but is on the buyer's routing exclusion list. The response is indistinguishable from a genuine not-found.

```json
{
  "error_class":  "NOT_FOUND",
  "error_code":   "marketplace_vendor_not_found",
  "message":      "The requested vendor profile was not found.",
  "retryable":    false,
  "reference_id": "01927a3b-f004-7a4e-91f5-aabbccddeef3"
}
```

*The `error_code` and `message` are identical to the genuine not-found case. Same timing path. No `field_errors`. This is the Non-Disclosure Indistinguishability invariant (§7.5) applied at the error layer.*

### C.6 — Paginated List Response

A buyer queries their open RFQs. The result set has more pages.

```json
{
  "items": [
    {
      "rfq_id":       "01927a3b-e001-7a4e-91f5-111111111111",
      "title":        "Industrial Fasteners — Q3 2026",
      "status":       "published",
      "created_at":   "2026-06-01T09:00:00Z"
    },
    {
      "rfq_id":       "01927a3b-e002-7a4e-91f5-222222222222",
      "title":        "Safety Equipment Restock",
      "status":       "evaluating",
      "created_at":   "2026-06-05T14:30:00Z"
    }
  ],
  "page_info": {
    "has_more":    true,
    "next_cursor": "eyJyZnFfaWQiOiIwMTkyN2EzYi1lMDAyIn0",
    "total_count": null
  },
  "reference_id": "01927a3b-f005-7a4e-91f5-aabbccddeef4"
}
```

*`total_count` is null when the contract does not declare totals (§7.5 compliance check required for totals). `next_cursor` is opaque — clients MUST NOT parse or construct cursor values.*

### C.7 — Async Accepted (Phase-1 Response)

An RFQ submission is accepted for async processing. Phase-1 completes synchronously; Phase-2 executes in the background.

```json
{
  "rfq_id":       "01927a3b-e003-7a4e-91f5-333333333333",
  "status":       "processing",
  "submitted_at": "2026-06-13T10:42:00Z",
  "reference_id": "01927a3b-f006-7a4e-91f5-aabbccddeef5"
}
```

*The `status: "processing"` reflects the Phase-1 post-state. The caller observes Phase-2 completion via the declared Observation contract using `rfq_id`. The `reference_id` links Phase-1 and Phase-2 audit records.*

---

## Annexure D — Pagination, Filtering & Sorting Examples

### D.1 Request Shape

All list queries use cursor-based pagination with an explicit allowlist for filters and sort fields (§9.6).

```
page_size : integer : optional : bounded by core.system_configuration.rfq.list_page_size_max
cursor    : string  : optional : opaque cursor from prior page_info.next_cursor
filter    : object  : optional : keys limited to declared allowlist
sort      : list<object{field: string, direction: "asc"|"desc"}> : optional : fields limited to allowlist; tiebreaker always id
```

**Example request body (JSON representation):**

```json
{
  "page_size": 20,
  "cursor":    "eyJyZnFfaWQiOiIwMTkyN2EzYi1lMDAyIn0",
  "filter": {
    "status":            ["published", "evaluating"],
    "category_id":       "01927a3b-c001-7a4e-91f5-000000000001",
    "created_after":     "2026-01-01T00:00:00Z"
  },
  "sort": [
    { "field": "created_at", "direction": "desc" },
    { "field": "id",         "direction": "asc"  }
  ]
}
```

### D.2 Filter Object Rules

- Filter keys MUST appear in the contract's declared `Filterable:` allowlist.
- Filter values for a single field accept a list of values; the contract MUST declare in its `Filterable:` specification whether the list is evaluated as inclusion-any (results matching any supplied value are included) or inclusion-all (results matching all supplied values are included). The default, when not explicitly declared, is inclusion-any.
- Filters declared across different fields are cumulative: results must satisfy all declared field filters simultaneously. The evaluation mechanism is implementation-defined in development documents.
- Protected fact fields MUST NOT appear in the filter allowlist. The complete set of protected facts is defined in §7.5 and includes: (1) blacklist membership and status; (2) routing exclusion conditions; (3) Buyer Vendor Status; (4) private CRM data (buyer notes, private ratings, and private tags on vendor records); (5) link facts (the existence or absence of a buyer–vendor relationship). Any field whose value or presence would expose or allow inference of any of these five categories is a protected-fact field and MUST be excluded from the `Filterable:` declaration.
- Range filters (e.g., `created_after`, `created_before`) use ISO-8601 UTC timestamp values.
- Text search filters MUST be declared explicitly in the allowlist with their match semantics (exact, prefix, full-text). Implicit text search on any field is prohibited.

### D.3 Sort Object Rules

- Sort fields MUST appear in the contract's declared `Sortable:` allowlist.
- Every sort request MUST include `{ "field": "id", "direction": "asc" }` as the final sort entry to ensure stable ordering across pages. A contract MAY enforce this implicitly (if the tiebreaker is applied server-side regardless), but MUST declare it in its `Sortable:` specification.
- Sort direction values: `"asc"` or `"desc"` only. No other values.
- Maximum number of sort fields: declared by the contract; default is 2 (primary field + tiebreaker).

### D.4 Cursor Semantics

- Cursors are opaque encoded values generated server-side.
- Clients MUST NOT decode, parse, construct, or modify cursor values.
- Cursors encode the position of the last item on the current page and any active sort/filter context required to reproduce consistent ordering on the next page.
- Cursors are single-use: a cursor from page N delivers page N+1. Callers MUST treat each cursor as single-use and MUST NOT reuse a cursor after it has been submitted. The platform's behavior on cursor reuse is implementation-defined: it MAY return a `VALIDATION` error with an appropriate module-namespaced `error_code`, or MAY return results as if the cursor were fresh. Callers MUST NOT rely on either behavior.
- Cursor validity is bounded by `core.system_configuration.<cursor_ttl_key>`. An expired cursor returns a `VALIDATION` error with an appropriate `error_code`.
- There is no "page 1" cursor; the first request omits the `cursor` field entirely.

### D.5 First Page / Next Page Pattern

**First request (no cursor):**

```json
{ "page_size": 20, "filter": { "status": ["published"] } }
```

**Response:**

```json
{
  "items": [ ... 20 items ... ],
  "page_info": { "has_more": true, "next_cursor": "<opaque>", "total_count": null }
}
```

**Second request (using next_cursor):**

```json
{ "page_size": 20, "cursor": "<opaque>", "filter": { "status": ["published"] } }
```

*The filter object MUST be repeated on each subsequent request with the same field values used to initialize the pagination sequence. Changing filter values between paginated requests is nonconforming: the resulting page set is not guaranteed to be consistent with prior pages. Callers that require a different filter MUST start a new pagination sequence by omitting the cursor and submitting the revised filter.*

---

## Annexure E — Audit Metadata Reference

### E.1 Required Audit Fields

Every business audit record (Audit-Required: yes) MUST capture the following fields. Field names are defined in Doc-2 §9 (by pointer); this table describes their purpose and population rule.

| Field | Required for all actors | Population rule |
|---|---|---|
| `action` | yes | Verbatim action name from Doc-2 §9 — never coined in Doc-4 |
| `actor_type` | yes | From closed set: User, Admin, System, AI Agent |
| `actor_id` | yes | Identity of the performing actor (User: user_id; Admin: admin_user_id; System: service identity; AI Agent: session identifier) |
| `organization_id` | yes (except System actor for platform ops) | Organization in whose context the action occurred |
| `reference_id` | yes | Platform-assigned UUIDv7 from the request/response pair (§22.1 C-05) |
| `idempotency_key` | when Idempotency: required | Caller-supplied deduplication key |
| `entity_type` | yes | Entity type per Doc-2 §3 naming |
| `entity_id` | yes | UUIDv7 of the primary entity affected |
| `timestamp` | yes | ISO-8601 UTC timestamp of the action |
| `pre_state` | when State Machine Effects declared | Verbatim state value per Doc-2 §5 immediately before the transition |
| `post_state` | when State Machine Effects declared | Verbatim state value per Doc-2 §5 immediately after the transition |

### E.2 Delegation Attribution Fields

For delegated actions (Delegation: eligible contracts), four additional fields are MANDATORY (§6B.3, CHK-191):

| Field | Population rule |
|---|---|
| `acting_user_id` | The user performing the action as a representative |
| `representative_organization_id` | The organization the representative belongs to |
| `vendor_profile_id` | The vendor profile being acted upon |
| `controlling_organization_id` | The organization that owns the vendor profile (quota bearer) |

These fields supplement — they do not replace — the standard `actor_id` and `organization_id` fields. Standard fields carry the representative's identity; delegation fields carry the full four-party chain.

### E.3 Phase-2 System Actor Audit Attribution

Phase-2 audit records use `Correlation: phase2-origin` (§17.2, CHK-192). This populates correlation linkage fields (per Doc-2 §9, by pointer) with:

| Linkage field | Value |
|---|---|
| Phase-2 execution's own `reference_id` | Unique to this Phase-2 execution |
| Phase-1 originating `reference_id` | From the Phase-1 response that triggered this Phase-2 work |
| Phase-1 idempotency key | Where applicable |
| Originating actor identity | The User or System actor that submitted the Phase-1 command |
| Originating organization | The organization context of the Phase-1 command |

This enables full chain reconstruction: originating user action → Phase-1 acceptance record → Phase-2 execution record.

### E.4 Audit Immutability Rules

- Business audit records are immutable after creation (CHK-193).
- Redaction (removal of sensitive field content) is permitted only with a compliance basis cited in Doc-2 §9 or Master Architecture §14.
- No contract may update, delete, or replace a written audit record.
- A correction to an erroneous audit record is expressed as a new corrective audit record (citing the original `reference_id`), not a mutation of the original.

### E.5 Audit vs Operational Telemetry

Business audit records and operational telemetry are distinct (§17.1). An `Audit-Required: yes` declaration governs business audit only. Operational telemetry (latency, error rates, trace spans) is not a substitute for business audit and is not declared in contracts.

---

## Annexure F — Event Naming Convention Reference

### F.1 Naming Structure

Event names are defined in Doc-2 §8 and referenced by Doc-4 contracts. They are never coined in Doc-4 documents.

**Canonical naming pattern:**

```
<entity_name>.<past_tense_verb>
```

Where `<entity_name>` is the entity type in snake_case per Doc-2 §3, and `<past_tense_verb>` is the business fact in past tense.

**Examples:**

| Event name | Entity | Fact |
|---|---|---|
| `rfq.submitted` | rfq | submitted |
| `rfq.published` | rfq | published |
| `rfq.cancelled` | rfq | cancelled |
| `quote.submitted` | quote | submitted |
| `quote.accepted` | quote | accepted |
| `vendor_profile.verified` | vendor_profile | verified |
| `vendor_profile.suspended` | vendor_profile | suspended |
| `organization.created` | organization | created |
| `delegation_grant.revoked` | delegation_grant | revoked |
| `trust_score.updated` | trust_score | updated |

### F.2 Naming Rules

- Event names use snake_case for the entity part and snake_case for the verb part, separated by a `.` (period).
- The verb MUST be past tense — events announce a fact that has already occurred.
- Event names are stable. Once registered in Doc-2 §8, they MUST NOT be renamed; renaming is a breaking domain change (§20.2).
- Compound entity names use underscore: `vendor_profile.verified`, not `vendorProfile.verified` or `vendor-profile.verified`.
- One event per business fact. Do not combine two distinct facts into one event name.

### F.3 Prohibited Patterns

| Prohibited | Reason | Correct form |
|---|---|---|
| `rfq_submitted` | Missing period separator | `rfq.submitted` |
| `RFQ.Submitted` | PascalCase not permitted | `rfq.submitted` |
| `rfq.submit` | Present tense — events are past facts | `rfq.submitted` |
| `rfq.status_changed` | "status_changed" is not a business fact — it is an implementation artifact | Use specific state facts: `rfq.published`, `rfq.cancelled` |
| `rfq.submitted.v2` | Version suffix not in event name | Version is on the envelope Version field (integer) |
| `marketplace.rfq.submitted` | Module prefix not permitted in event name | `rfq.submitted` |

### F.4 Event Versioning

Event versions are integers on the event envelope's `Version:` field — they are not embedded in the event name.

- Version `1` is the initial version of any event.
- A version bump is required only for **breaking payload changes**: removing a field, changing a field type, or changing a field's semantics.
- Adding a new optional payload field is additive — no version bump required. Event consumers across all Doc-4B–4N documents MUST implement the Tolerant Reader pattern: they MUST NOT fail, error, or discard a message when encountering fields in the event payload that are not declared in the version they were authored against. Failure to implement consumer tolerance is a conformance violation in the consuming module's document (applies under CHK-178 — Events Consumed grammar completeness obligation).
- The `Source-Ref` in the Events Produced declaration cites `Doc-2 §8.<event_entry>` and, where a payload change was made by a corpus patch, `[as amended by <PATCH-ID> per §3.5]`.

### F.5 Event Payload Thin-Payload Rule

Event payloads carry identifying fields only (§16.5):
- Entity ID (UUIDv7)
- The state or fact that changed
- The organization_id context
- Timestamps

Event payloads MUST NOT carry: governance signal values, protected facts, full entity representations, or data that requires consumer-specific access control. Consumers who need full entity data fetch it via the emitting module's Query contract.

---

## Annexure G — Idempotency Reference

### G.1 Required Use Cases

All mutating operations (commands) declare `Idempotency: required`. The following operation types are explicitly required to implement idempotency; this list is illustrative of the required scope, not exhaustive:

| Operation type | Why idempotency is critical |
|---|---|
| RFQ submission | Network retry must not create a duplicate RFQ |
| Quote submission | Network retry must not submit a duplicate quote |
| Vendor profile creation | Network retry must not create two profiles for the same entity |
| Organization registration | Network retry must not create two organizations |
| Delegation grant creation | Network retry must not grant permissions twice |
| Document upload / attachment | Network retry must not create duplicate document records |
| Payment / billing event | Network retry must not trigger duplicate charges |
| Status transition command | Network retry on a transitioning command must not apply the transition twice |
| Phase-2 async worker execution | Worker re-dispatch must not execute the business logic twice |

### G.2 Idempotency Key Format

The idempotency key is generated by the **caller** and carried in a transport-level mechanism (defined in development documents — not a request body field). Recommended format (non-normative guidance for development documents):

```
<operation_name>/<organization_id>/<caller_generated_uuid>
```

Example:
```
rfq.submit/01927a3b-0001-7a4e-91f5-2b8c3d4e5f6b/01927a3c-1234-7a4e-91f5-aabb11223344
```

The key MUST be unique per unique intent. If the caller intends a fresh operation (not a retry), they MUST generate a new key. Using the same key for different intents is a misuse that will return a cached prior result.

### G.3 Deduplication Window

The deduplication window is governed by `core.system_configuration.<dedup_window_key>` per contract. Within the window:

- A replay of a completed operation returns the cached result (`Replay-Result: cached-response`) or an acknowledgment (`Replay-Result: acknowledged`), as declared in the contract.
- A replay arriving **while the original is in-flight** MUST NOT start a second execution (§14.3, CHK-155). The platform holds the in-flight original as the single execution; the replay receives a result consistent with `Replay-Result` once the original completes.
- After the window expires, the same key is treated as a fresh operation.

### G.4 The Joint Rule

For any idempotency-required operation (§14.3):

| Condition | Requirement |
|---|---|
| Same result | A replay MUST return a result indistinguishable from the original execution's result |
| No duplicate audit record | A replay MUST NOT write a second business audit record |
| No duplicate outbox event | A replay MUST NOT emit a second event to the transactional outbox |

All three conditions apply together under all timing scenarios: original completed, original in-flight, or original and replay arriving concurrently.

### G.5 Replay-Result Values

| Value | Meaning | When to declare |
|---|---|---|
| `cached-response` | The platform caches the original response and returns it verbatim to the replaying caller | Commands where the original response contains entity state the caller needs |
| `acknowledged` | The platform returns a stable acknowledgment (accepted, no duplicate processing) without necessarily returning the original payload | Phase-2 async workers; operations where the original response is not semantically needed on replay |

---

## Annexure H — API Design Checklist

This checklist is **mandatory** for all Doc-4B through Doc-4N contract authors (human and AI agent) before submitting a contract section for freeze. It is a design-time checklist, not a conformance-verification checklist (that is Appendix A). Complete each phase in order; a finding in an earlier phase may require revisiting the prior phase before continuing.

---

### Phase 1 — Ownership Confirmation

Before writing a single contract field:

- [ ] **H-01** The entity this contract operates on has an identified Owner Module in Doc-2 §3. Write it down.
- [ ] **H-02** This contract will appear in that Owner Module's document (Doc-4B–4N). Not any other document.
- [ ] **H-03** Every entity this contract creates, updates, or deletes belongs to this module's Doc-2 §3 ownership. For any entity that does not: stop and escalate.
- [ ] **H-04** The operation exists in Doc-3 or follows from Doc-2 state machines. No new workflow is being invented. If the operation is new: escalate.
- [ ] **H-05** The applicable template is selected per §21 selection guide (Rule R-01 in §22.3 for ambiguous cases).

---

### Phase 2 — Authorization Design

- [ ] **H-06** Every permission slug referenced exists in Doc-2 §7. No slug is invented in this document.
- [ ] **H-07** Slugs use the correct namespace (`can_` for User, `staff_` for Admin) and pattern (Annexure A).
- [ ] **H-08** Delegation eligibility is confirmed or denied against the §6B.1 never-delegation-eligible list.
- [ ] **H-09** Resource scope is defined without relying on protected facts as a scope dimension.
- [ ] **H-10** If Admin actor: `staff_` slugs only; `Admin-Scope` is declared; tenant-data-access has a compliance basis.

---

### Phase 3 — Tenancy and Non-Disclosure Design

- [ ] **H-11** Every protected fact surface (blacklist, routing exclusion, Buyer Vendor Status, private CRM, link facts) is identified.
- [ ] **H-12** The Error Boundary block is drafted for each protected-fact exposure point.
- [ ] **H-13** `total_count` is only included where §7.5 compliance can be asserted. Exclusion-consistency is confirmed for items, counts, and facets.
- [ ] **H-14** Filter and sort allowlists exclude all protected fact fields.

---

### Phase 4 — State Machine and Business Logic Design

- [ ] **H-15** Pre-states and Post-states are verbatim from Doc-2 §5. No paraphrase.
- [ ] **H-16** The Doc-2 §5 transition reference is identified and cited with patch ID where amended.
- [ ] **H-17** No terminal state appears in Pre-states.
- [ ] **H-18** The AI Agent actor check is applied: if this contract is AI-actor-eligible, it has no State Machine Effects.

---

### Phase 5 — Events and Audit Design

- [ ] **H-19** Every event name in Events Produced exists in Doc-2 §8. No event is coined here.
- [ ] **H-20** The privacy review of each event payload is complete: no protected facts, no governance signals beyond the module's own state, no other-tenant data.
- [ ] **H-21** `Privacy-Review: §7.5 compliant` is declared for each event after H-20 passes.
- [ ] **H-22** The audit action exists in Doc-2 §9. If mutating: Audit-Required is yes.
- [ ] **H-23** Correlation type is correctly assigned: `phase2-origin` for Phase-2 System-actor contracts; one of `reference_id | idempotency_key | both` for all others.

---

### Phase 6 — Policy, Limits, and Evolution Design

- [ ] **H-24** Every limit value is a `core.system_configuration.<key>` reference. No hardcoded number.
- [ ] **H-25** Every POLICY key referenced exists in Doc-3 §12.2. If any key is absent: omit the Rate-Limit block, add a BLOCKER self-review finding, and escalate per Rule R-04 in §22.3. Do not use any placeholder value in the Policy-Key field.
- [ ] **H-26** Every entitlement gate uses a key via the Monetization service. No plan name appears anywhere.
- [ ] **H-27** FIXED rules are declared as non-overridable.
- [ ] **H-28** If this contract is not available at all operating stages: Stage-Availability is declared.
- [ ] **H-29** Every limit Category 9 rule is classified as quota-type or throughput-type, with matching error class (QUOTA or RATE_LIMITED).

---

### Phase 7 — Idempotency and Concurrency Design

- [ ] **H-30** If mutating: Idempotency is declared (`required`). The deduplication window references a POLICY key.
- [ ] **H-31** The Joint Rule is satisfied by design: same result + no duplicate audit + no duplicate outbox event on replay.
- [ ] **H-32** In-flight protection is considered: no two executions of the same idempotency key proceed concurrently.
- [ ] **H-33** If update command: Concurrency is declared (`optimistic` or `none` with justification).

---

### Phase 8 — Freeze Readiness

- [ ] **H-34** No field contains "TBD", "to be defined", "implementation-specific", or equivalent. No exceptions. Missing POLICY keys are handled by omission and a BLOCKER self-review finding per Rule R-04 — not by a TBD placeholder.
- [ ] **H-35** All template CONDITIONAL fields are present where their condition is met (CHK-235).
- [ ] **H-36** All template OMIT-IF-NONE fields carry the literal `none` declaration when inapplicable (CHK-236).
- [ ] **H-37** Appendix A conformance checklist (CHK-001 through CHK-236) has been run. All BLOCKER [B] findings are resolved.
- [ ] **H-38** No cross-module mutation exists in the contract.
- [ ] **H-39** Integration contracts (Template 21.2) are authored in the source module's document only. Target module references by pointer.

---

## Annexure I — Implementation Readiness Checklist

This checklist is for the moment implementation (coding) begins. It is not a design checklist (that is Annexure H) and not a conformance checklist (that is Appendix A). It ensures the implementer has everything they need to write correct, consistent code.

---

### I.1 — Backend Engineer Checklist

Before writing the first line of code for a contract:

- [ ] **I-BE-01** The frozen contract document for this module (Doc-4B–4N) is available and at least at APPROVED status.
- [ ] **I-BE-02** The entity schema in Doc-2 §3 for every entity this contract touches is confirmed. State machine transitions per Doc-2 §5 are mapped.
- [ ] **I-BE-03** The permission slugs required are implemented in the platform's permission evaluation layer. If any slug is missing: escalate before coding.
- [ ] **I-BE-04** The POLICY keys referenced in this contract are present in `core.system_configuration` in the target environment. Confirm the keys return expected values before running tests.
- [ ] **I-BE-05** The idempotency key deduplication store is configured and the deduplication window POLICY key is set.
- [ ] **I-BE-06** The transactional outbox is configured for this module. Outbox-side event emission and business write occur in the same database transaction.
- [ ] **I-BE-07** The audit record writer for this module's audit actions (Doc-2 §9) is implemented and tested. Audit records are written as part of the same transaction as the business write (not via a separate async call).
- [ ] **I-BE-08** Protected-fact collapse logic is implemented: the Error Boundary behavior for this contract is coded, not assumed.
- [ ] **I-BE-09** The `reference_id` (platform-assigned UUIDv7) is generated at request acceptance and included in both the response and the audit record.
- [ ] **I-BE-10** Concurrency token (`updated_at` or named field) is validated before update commits. The `CONFLICT` error is returned on mismatch.
- [ ] **I-BE-11** For delegated operations: the §6B.2 five-condition grant check is implemented. Quota attribution is charged to the Controlling Organization, not the representative.
- [ ] **I-BE-12** For Phase-2 contracts: the worker is idempotent, reads the entity's current state before acting, and handles the case where Phase-2 is re-dispatched after a prior partial execution.

---

### I.2 — Frontend Engineer Checklist

Before implementing a UI feature that calls a contract:

- [ ] **I-FE-01** The contract's Response Contract defines every field the UI displays. No field is assumed beyond what the contract declares.
- [ ] **I-FE-02** The `reference_id` from every response is captured and surfaced in error states for user-directed support.
- [ ] **I-FE-03** All twelve error classes are handled gracefully. At minimum: VALIDATION shows `field_errors`; STATE shows a domain-appropriate message; RATE_LIMITED waits for the reset interval declared in the contract's Rate-Limit block before retrying (the transport layer MAY provide a runtime hint per development documents); SYSTEM shows a generic error with `reference_id`.
- [ ] **I-FE-04** Cursor-based pagination is implemented. No offset arithmetic. The `next_cursor` value is stored and replayed as-is; it is never parsed or constructed.
- [ ] **I-FE-05** Filter and sort fields sent to the API are limited to the contract's declared `Filterable:` and `Sortable:` allowlists. No undeclared fields are sent.
- [ ] **I-FE-06** The idempotency key (transport-level) is generated as a stable value per user intent. A retry uses the same key; a fresh submission generates a new key.
- [ ] **I-FE-07** Async operations (Phase-1 accepted; status `processing`) poll or observe via the declared Observation contract. The UI does not treat Phase-1 acceptance as Phase-2 completion.
- [ ] **I-FE-08** Protected-fact `NOT_FOUND` responses are treated as genuine not-found by the UI — no "you don't have access" messaging that would confirm the resource's existence.
- [ ] **I-FE-09** Empty `items` arrays and `has_more: false` are handled correctly as a valid end-of-results state, not as errors.

---

### I.3 — Claude Code and AI Agent Implementation Checklist

Before generating implementation code for a contract:

- [ ] **I-AI-01** The contract document is confirmed APPROVED or FROZEN. Do not generate implementation from a DRAFT contract without human confirmation.
- [ ] **I-AI-02** Every entity referenced in the contract exists in Doc-2 §3. No entity is inferred or invented.
- [ ] **I-AI-03** Every state referenced in State Machine Effects exists verbatim in Doc-2 §5. States are not paraphrased.
- [ ] **I-AI-04** Every permission slug exists in Doc-2 §7. If a slug does not exist: halt and report — do not invent a slug implementation.
- [ ] **I-AI-05** Every `core.system_configuration.<key>` key referenced in the contract has a corresponding configuration entry. If it does not: halt and report — do not hardcode a default value.
- [ ] **I-AI-06** All validation rules (V1–Vn) have corresponding implementation paths. Every failure path produces a response from the canonical error envelope (§12.1). No validation failure causes a partial write.
- [ ] **I-AI-07** The Error Boundary collapse logic is implemented for every protected-fact failure point. The `NOT_FOUND` path and the genuine not-found path produce identical responses.
- [ ] **I-AI-08** Idempotency deduplication is implemented before the business transaction begins (application-layer deduplication, not database constraint). The Joint Rule is met: same result, no duplicate audit record, no duplicate event.
- [ ] **I-AI-09** Business audit writes and event outbox writes occur in the same transaction as the business write. No fire-and-forget audit or event emission.
- [ ] **I-AI-10** The AI Agent actor type in this contract is advisory only. Generated code for an AI Agent contract MUST NOT include state transition logic. If the contract accidentally includes state transitions for an AI Agent actor: halt and report.
- [ ] **I-AI-11** For Phase-2 contracts: the System actor is confirmed; attribution fields for the originating User and organization are carried from the triggering event payload; `Correlation: phase2-origin` is populated.
- [ ] **I-AI-12** Any contract field or behavior that appears ambiguous, contradictory, or absent from the document: halt, record the ambiguity with a specific citation, and escalate (Rule R-03 in §22.3). Do not resolve ambiguity silently.

---

### I.4 — QA and Conformance Verification Checklist

Before signing off a contract's implementation as test-complete:

- [ ] **I-QA-01** A passing test exists for every `V<n>` validation rule in the contract, verifying the correct error class and error code on failure.
- [ ] **I-QA-02** Protected-fact collapse behavior is tested: the response shape for a protected-fact failure is verified to be byte-identical in structure (and timing within acceptable bounds) to a genuine not-found response.
- [ ] **I-QA-03** Idempotency is tested: the same idempotency key submitted twice within the deduplication window returns the same result and produces exactly one audit record and one outbox event.
- [ ] **I-QA-04** In-flight idempotency is tested: a retry arriving while the original is processing does not begin a second execution.
- [ ] **I-QA-05** State machine pre-state validation is tested: the operation fails with `STATE` error when the entity is not in a declared Pre-state.
- [ ] **I-QA-06** Concurrency conflict is tested: a stale concurrency token produces `CONFLICT`; the response contains the current token.
- [ ] **I-QA-07** Delegation scenarios are tested (for delegation-eligible contracts): each of the five §6B.2 conditions is tested as a failure case; quota is confirmed to be charged to the Controlling Organization.
- [ ] **I-QA-08** Paginated responses are tested for exclusion-consistency: `items` count, `has_more`, and `total_count` (where declared) reflect the same exclusion set.
- [ ] **I-QA-09** Event emission is tested: every declared Events Produced event is emitted under the correct trigger condition with the correct payload; no event is emitted on validation failures.
- [ ] **I-QA-10** Audit records are tested: the correct action, actor, entity, state transition, and correlation fields are present for every mutating operation.

---

*End of Doc-4A Content v1.0 Pass 6. This is the final pass. Doc-4A is complete across Passes 1–6 and is submitted as a FREEZE CANDIDATE for Architecture Board approval.*

*Pass 6 does not modify any section from Passes 1–5. It adds: §22 (Consistency Corrections), CHK-231 through CHK-236 (Appendix A supplement), and Annexures A through I.*
