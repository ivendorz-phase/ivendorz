# Doc-4B — Platform Core / Shared Kernel — API & Integration Contracts — Content v1.0, Pass-A

| Field | Value |
|---|---|
| Document | Doc-4B — Platform Core / Shared Kernel (Module 0) |
| Pass | A of N — combined maturity of traditional Pass 1–3 (contracts + validation + error/audit/event/idempotency completeness) |
| Status | **DRAFT — ready for Independent Architecture Review** |
| Module | Module 0 — Platform Core / Shared Kernel (`core` schema) |
| Structure | Conforms to the frozen Doc-4B Structure = `Doc-4B_Structure_Proposal_v0.1.md` as amended by `Doc-4B_Structure_Patch_v0.1.1.md` (Board-frozen; the `Doc-4B_Structure_v1.0_FROZEN.md` re-issue is the integration of these two) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN: Pass1–Pass6 + Pass3 Patch v1.0.1 + Pass4 Patch v1.0.1 + Pass5 Patch v1.0.1 + Pass6 Patch v1.0.1 + FreezeAudit Patch v1.0.1) |
| Contains | Implementation-ready contracts for Module 0 only — no business logic, no entities/events/permissions coined |
| Audience | Claude Code, Cursor, backend, QA, AI development agents |

---

## §A0 — Document Control & Conformance

Doc-4B authors the contracts of Module 0 (Platform Core / Shared Kernel) and **no other module**. It defines no standards (those are Doc-4A), no entities/states/events/permissions/POLICY keys (those are Doc-2/Doc-3), and overrides nothing in a higher-precedence document. On any conflict, the higher document prevails and this document is flagged for patch (Doc-4A §0.6 flag-and-halt; precedence Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B).

Every contract below is authored against the Doc-4A frozen templates (§21): **21.3 Query**, **21.4 Command**, **21.5 System Actor**, **21.6 Admin** (all specializations of 21.1), and the request/response/validation/error/state/idempotency/event/audit/policy standards (§5–§18B). Reference-never-restate (§0.3) is applied throughout: the audit field set (Doc-2 §9), event catalog (Doc-2 §8), POLICY key inventory (Doc-3 §12.2), human-reference formats (Doc-2 §0.1), and permission slugs (Doc-2 §7) are bound by pointer, never copied. Every Response Contract carries the mandatory `reference_id : uuid : always` line (Doc-4A §22.1 C-05 as amended by Pass 6 Patch v1.0.1 P6-B01); Template 21.5 Phase-2 contracts are exempt and carry `Response: none` (FreezeAudit Patch v1.0.1 PATCH-FA-01).

---

## §A1 — Module 0 Scope & Contract-vs-Obligation Model

Module 0 owns exactly five entities (Doc-2 §3.1, §10.1), all platform-owned, none a business aggregate (Doc-2 §2: "no aggregates… by rule"):

| Entity | Lifecycle (Doc-2 §10.1) | Nature |
|---|---|---|
| `core.audit_records` | append-only, never deleted (soft archive) | immutable audit stream |
| `core.outbox_events` | `pending → dispatched → archived` (status column; **not** a Doc-2 §5 state machine) | transactional outbox stream |
| `core.id_sequences` | simple | year-scoped human-reference counters |
| `core.system_configuration` | simple (changes audited) | keyed POLICY value store |
| `core.feature_flags` | simple | keyed rollout control |

**Contract vs obligation.** Module 0 is consumed two ways (frozen structure §3): (a) as **callable contracts** — audit reads, audit redaction, the outbox dispatcher/archiver, configuration/flag reads and changes; and (b) as **cross-cutting infrastructure obligations** that *other* modules' contracts declare against Module 0 mechanisms — the audit-write (§17), the transactional-outbox-write (§16.2), UUIDv7 assignment and human-reference allocation (§8), POLICY resolution (§18), and feature-flag evaluation. Group 7 specifies the Module-0 mechanisms behind those obligations. Per the integration single-authorship rule (§4.4), per-event integration contracts (21.2) are authored by producing modules (Doc-4C…4K), **not here**.

**Actor profile.** Module 0 contracts carry no tenant-user business operations. They are **Admin** (platform-staff, no active organization context — §5.6), **System** (Phase-2 workers and internal mechanisms — §5.2), or internal **service** reads. No contract below is delegation-eligible (§6B.1); none touches a tenant aggregate.

---

## §A2 — Dependencies & Escalations (surfaced for the Independent Review)

Per the dependency-handling rules, the following are surfaced explicitly; **no template, permission slug, event, or POLICY key is invented**.

**D-1 — Deferred internal-service / event-schema templates (carried from frozen structure; composition applied).** Doc-4A's Internal Service Contract and Event Schema Declaration templates are deferred (Doc-4A Pass5 §21 PATCH-01). Module 0's synchronous internal mechanisms (audit-append, outbox-write, human-reference allocation, configuration read, flag evaluation) have no dedicated template. **Composition strategy applied (frozen structure D-1 Option b):** internal reads are composed as **21.3 Query** and internal writes as **21.4 Command**, each marked `Audience: internal-service` and bound to the consuming-contract transaction. **Composition friction (finding PA-M1, §A11):** Template 21.4 mandates business-audit + events + idempotency declarations that do not map cleanly onto pure infrastructure primitives (an audit-append does not itself audit; the outbox dispatcher's delivery is operational, not a business action). Group 7 contracts therefore carry explicit non-recursion notes; the review is asked to confirm composition vs. accelerating the deferred Internal Service Contract template (D-1 Option a).

**D-2 — Permission-slug authority (carried from frozen structure; escalation note).** Doc-2 §7 defines `staff_can_redact_audit` (compliance-scoped) and `staff_super_admin` (all access, flagged) but **no dedicated `staff_*` slug for system-configuration change, feature-flag management, or audit read**. Contracts requiring those bind to the **existing** `staff_super_admin` slug (a valid existing slug — not invented). **Escalation (finding PA-M2, §A11):** for least-privilege, the Board should consider a Doc-2 §7 patch adding `staff_can_manage_system_configuration`, `staff_can_manage_feature_flags`, and `staff_can_read_audit`. Until then `staff_super_admin` governs. No slug is invented in this document (Doc-4A §6.4).

**PA-E1 — Missing POLICY keys for outbox/audit infrastructure (escalation per §18.2).** The outbox dispatcher and audit/outbox archival workers require deduplication-window, retry-limit, backoff, dead-letter, and retention values. Doc-3 §12.2 enumerates no `core.system_configuration.outbox.*`, `core.system_configuration.audit.*`, or `core.system_configuration.core.*` keys for these. Contracts reference the keys they require **by intended name** and flag them for a **Doc-3 §12.2 patch** (Doc-4A §18.2 forbids inventing keys). Listed in §A11 (PA-M3).

**PA-E2 — Ownership note: configuration-change governance (Doc-2 §16.2).** Doc-2 §16.2 assigns "system configuration policy" to **Module 8 — Admin Operations** (Doc-4J), while Module 0 owns the `core.system_configuration` store. The frozen Doc-4B structure §7.2 placed "configuration change (21.6 Admin)" in Doc-4B. Pass-A authors the change contract here per the frozen structure, but flags the governance-ownership question for the review to adjudicate (finding PA-M4): the platform-staff *decision/ratification* authority may belong to Doc-4J even though the `core.system_configuration` *store and write mechanism* belong to Doc-4B ("Admin decides; the kernel stores"). No ownership is moved by this document.

---

## §A3 — Conventions Applied in This Document

- **Contract-ID:** `core.<operation>.v1` (module prefix = schema `core`; §3.2, §20.3).
- **Error codes:** `core_<domain>_<code>` (Doc-4A Appendix B §B.2 format `<module_prefix>_<domain>_<code>`; prefix `core_`). Codes used are listed per contract; all are new code *registrations within the existing `core_` prefix* (the prefix is registered; individual codes are this document's to define within it, §12.3).
- **Timestamps:** ISO-8601 UTC (§9.8). **Identifiers:** UUIDv7 only in payloads; `human_ref` as lookup convenience only (§8).
- **Non-disclosure (§7.5/§7.6):** audit read surfaces carry an explicit §7.5 compliance statement and Error Boundary; audit records for protected-fact-gated operations are never served to a gated-out party.
- **Reference-never-restate:** `Action-Ref`, `Source-Ref`, POLICY keys, and slugs are pointers to Doc-2/Doc-3; no catalog content is reproduced.

---

## §A4 — Group 1: Audit Record Queries (`core.audit_records`)

The audit read surface. Module 0 owns `core.audit_records` and defines its canonical representation here; Doc-4J (Admin Operations) and owning modules compose tenant-facing audit views over this canonical read (§17.8). Both contracts are **Admin-actor reads** → Template **21.6** (carries the §5.6 Admin context + Compliance-Basis declarations that §17.8 requires). State-Machine-Effects and Idempotency are declared as for a read. *(Selection note PA-m1, §A11: 21.3-vs-21.6 for Admin reads.)*

**Canonical representation — `audit_record` (defined once here; bound to Doc-2 §9 field set by pointer, not restated):** `audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent`. `ip_address`/`user_agent` are redaction-aware (§10.7; absent when redacted, not signaled).

### Contract: Query Audit Records

```
## Contract: Query Audit Records

### Header
Contract-ID:     core.audit_record_query.v1
Contract-Name:   Query Audit Records
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Actor-Types:     Admin
Version:         1
Status:          draft

### Required Permissions
Actor:        Admin
Membership:   n/a
Slugs:        staff_super_admin            ← Doc-2 §7 (existing). D-2: no dedicated staff_can_read_audit slug; staff_super_admin governs (least-privilege slug recommended — PA-M2)
Scope:        tenant-data-access — audit records across tenant contexts under compliance basis
Delegation:   not eligible
Admin-Scope:  tenant-data-access
Compliance-Basis: Doc-2 §9 (audit trail) / Master Architecture §14 (audit & compliance model), by pointer — admin convenience is not a basis (§5.6)

### Firewall-Compliance Declaration
Signals-Read:        none-as-input (audit rows may contain historical governance-signal values as recorded facts; surfaced to compliance only per §7.5; never used as a computation input)
Signals-Written:     none
Mutation-Inputs:     none
Monetization-Inputs: none
Routing-Impact:      none
Disclosure:          audit content to platform-compliance / Super Admin audience only; §7.5 compliant (protected-fact-gated records never served to a gated-out party)

### Request Contract
entity_type     : enum(Doc-2 §3 entity names) : optional : filter (allowlisted); absent → no entity_type filter
entity_id       : uuid     : optional : filter; audited entity (UUIDv7 §8)
actor_id        : uuid     : optional : filter
actor_type      : enum(Doc-2 §9: User|Admin|System|AI Agent) : optional : filter
action          : string   : optional : filter; audit action name per Doc-2 §9 (by pointer)
organization_id : uuid     : optional : filter over recorded audit context (NOT an act-as-org field; §9.7)
occurred_from   : timestamp: optional : ISO-8601 UTC (§9.8); range lower bound
occurred_to     : timestamp: optional : ISO-8601 UTC (§9.8); range upper bound
page_size       : integer  : optional : bounded by core.system_configuration.core.audit_query_page_size_max  [PA-E1]
cursor          : string   : optional : opaque (§9.6)
sort            : list<object{field, direction}> : optional : sortable allowlist below
Filterable:  entity_type, entity_id, actor_id, actor_type, action, organization_id, occurred_from, occurred_to  (no protected facts; §7.5)
Sortable:    timestamp  (tiebreaker: audit_id — total order §9.6)

### Response Contract
items        : list<audit_record> : always : exclusion-consistent §10.7; §7.5-compliant projection
page_info    : object             : always
  next_cursor : string  : conditional (has_more: true) : opaque
  has_more    : boolean : always
  total_count : integer : conditional : compliance scope only; §7.5 compliant
reference_id : uuid               : always : platform-assigned UUIDv7; correlation for support/audit (§22.1 C-05 / P6-B01)

### Validation Rules
V1 : SYNTAX  : field presence/type/bounds; filter & sort fields in allowlist; enum membership : §9 : VALIDATION
V2 : CONTEXT : actor type Admin; no org context; Admin-Scope declared (§5.6) : §5.6 : AUTHORIZATION
V3 : AUTHZ   : staff_super_admin held : Doc-2 §7 : AUTHORIZATION
V4 : SCOPE   : tenant-data-access compliance basis satisfied : §5.6 : NOT_FOUND

### Error Behavior
Error-Boundary:
  V4 : NOT_FOUND | collapse-rule   (audit of a protected-fact operation is never confirmed to a non-compliance party; §12.4)
  Timing-Uniformity: asserted

### State Machine Effects
State-Machine-Effects: none

### Idempotency
Idempotency: not-applicable

### Async Declaration
Execution: sync

### Events Produced
Events-Produced: none

### Audit Requirements
Audit-Required: no    ← pure read; Super Admin access flagging is operational per Doc-2 §9 ("Super Admin access (flagged)"), not a business audit record (§17.1)

### Entitlement References
Entitlements: none

### Operating Stage
Stage-Availability: all

### Rate Limits
V-Type:         throughput
Policy-Key:     core.system_configuration.core.audit_query_rate_window      [PA-E1]
Attribution:    platform
Reset-Interval: core.system_configuration.core.audit_query_rate_reset       [PA-E1]
Error-Class:    RATE_LIMITED
```

Error codes: `core_audit_invalid_query_input` (VALIDATION), `core_audit_not_found` (NOT_FOUND), `core_audit_rate_window_exceeded` (RATE_LIMITED).

### Contract: Look Up Audit Records by Correlation ID

Resolves the audit chain bound to a response `reference_id` (Phase-1 + Phase-2 via `phase2-origin` correlation, §17.2). Access-controlled — an open correlation lookup is an oracle (Doc-4A Review Log P3-m3).

```
## Contract: Look Up Audit Records by Correlation ID

### Header
Contract-ID:     core.audit_correlation_lookup.v1
Contract-Name:   Look Up Audit Records by Correlation ID
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Actor-Types:     Admin
Version:         1
Status:          draft

### Required Permissions
Actor:        Admin
Membership:   n/a
Slugs:        staff_super_admin            ← Doc-2 §7 (existing); D-2 (PA-M2)
Scope:        tenant-data-access
Delegation:   not eligible
Admin-Scope:  tenant-data-access
Compliance-Basis: Doc-2 §9 / Master Architecture §14, by pointer

### Request Contract
reference_id : uuid : required : platform-assigned correlation id to resolve (§12.1)

### Response Contract
items        : list<audit_record> : always : records sharing this reference_id; exclusion/§7.5-consistent
reference_id : uuid               : always : the platform-assigned correlation id of THIS response

### Validation Rules
V1 : SYNTAX  : reference_id present and uuid : §9 : VALIDATION
V2 : CONTEXT : Admin actor; no org context; Admin-Scope (§5.6) : §5.6 : AUTHORIZATION
V3 : AUTHZ   : staff_super_admin held : Doc-2 §7 : AUTHORIZATION
V4 : SCOPE   : compliance basis satisfied : §5.6 : NOT_FOUND

### Error Behavior
Error-Boundary:
  V4 : NOT_FOUND | collapse-rule   (existence of a protected-fact-gated record never confirmed to a non-compliance party)
  Timing-Uniformity: asserted

### State Machine Effects
State-Machine-Effects: none

### Idempotency
Idempotency: not-applicable

### Async Declaration
Execution: sync

### Events Produced
Events-Produced: none

### Audit Requirements
Audit-Required: no    ← pure read; access flagging operational per Doc-2 §9 (§17.1)

### Operating Stage
Stage-Availability: all

### Rate Limits
V-Type:         throughput
Policy-Key:     core.system_configuration.core.audit_lookup_rate_window     [PA-E1]
Attribution:    platform
Reset-Interval: core.system_configuration.core.audit_lookup_rate_reset      [PA-E1]
Error-Class:    RATE_LIMITED
```

Error codes: `core_audit_reference_not_found` (NOT_FOUND), `core_audit_invalid_query_input` (VALIDATION), `core_audit_rate_window_exceeded` (RATE_LIMITED).

---

## §A5 — Group 2: Audit Administration (`core.audit_records`)

`core.audit_records` is immutable and never deleted (Architecture §14.3–14.4; §17.5). The **only** permitted mutation is compliance-ordered **field redaction**, which blanks specific sensitive fields and records a **new** audit event. Template **21.6 Admin** (mutating). The redaction slug `staff_can_redact_audit` **exists** in Doc-2 §7 (no D-2 here).

### Contract: Redact Audit Record Field

```
## Contract: Redact Audit Record Field

### Header
Contract-ID:     core.admin_redact_audit_field.v1
Contract-Name:   Redact Audit Record Field
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Actor-Types:     Admin
Version:         1
Status:          draft

### Required Permissions
Actor:        Admin
Membership:   n/a
Slugs:        staff_can_redact_audit       ← Doc-2 §7 (existing; compliance-scoped)
Scope:        entity-scoped — the target audit record
Delegation:   not eligible
Admin-Scope:  tenant-data-access
Compliance-Basis: Master Architecture §14.3 (redaction under approved privacy policy) / Doc-2 §9 (audit redaction event), by pointer

### Request Contract
audit_id         : uuid         : required : target audit record (UUIDv7)
fields_to_redact : list<string> : required : redactable sensitive fields per Architecture §14.3 (e.g., ip_address, user_agent); names within the Doc-2 §9 field set (by pointer); bounded by core.system_configuration.core.audit_redactable_fields_max  [PA-E1]
redaction_reason : string       : required : structured compliance reason; min length core.system_configuration.core.audit_redaction_reason_min_chars  [PA-E1]
(Note: the approval flow that authorizes redaction — Architecture §14.3 — is an operational/compliance process; it is NOT modeled as a new entity here. Authorization is the staff_can_redact_audit slug + recorded reason + compliance basis.)

### Response Contract
audit_id          : uuid      : always : target record id (record persists; identity unchanged)
redaction_audit_id: uuid      : always : id of the NEW audit record recording this redaction (§14.3)
redacted_fields   : list<string> : always : fields now blanked
updated_at        : timestamp : always : redaction timestamp (concurrency token §10.2)
reference_id      : uuid      : always : platform-assigned UUIDv7 (§22.1 C-05 / P6-B01)

### Validation Rules
V1 : SYNTAX   : field presence/type; fields_to_redact ⊆ redactable allowlist; reason ≥ min length : §9 : VALIDATION
V2 : CONTEXT  : Admin actor; no org context; Admin-Scope tenant-data-access; Compliance-Basis cited : §5.6 : AUTHORIZATION
V3 : AUTHZ    : staff_can_redact_audit held : Doc-2 §7 : AUTHORIZATION
V4 : SCOPE    : target audit record exists under compliance basis : §5.6 : NOT_FOUND
V8 : BUSINESS : requested fields are redactable and not already redacted (re-redaction is a no-op, not an error) — Architecture §14.3 by pointer : Master Architecture §14.3 : BUSINESS

### Error Behavior
Error-Boundary:
  V4 : NOT_FOUND | collapse-rule   (audit record existence not disclosed beyond compliance scope)
  Timing-Uniformity: asserted

### State Machine Effects
State-Machine-Effects: none
(Audit redaction blanks fields and appends a new audit record; `core.audit_records` is an append-only stream with no Doc-2 §5 state machine — §13 / Structure Patch F-03. The mutation is captured below under Mutation-Scope, not as a state transition.)

### Idempotency
Idempotency:     required
Key-Scope:       platform
Window:          core.system_configuration.core.redaction_dedup_window       [PA-E1]
Replay-Result:   cached-response

### Concurrency
Concurrency: optimistic
Token:       updated_at

### Async Declaration
Execution: sync

### Events Produced
Events-Produced: none
(Doc-2 §8 designates no event for audit redaction; the redaction is recorded as a new audit record, not a domain event. A consumer-facing event would require a Doc-2 §8 addition — escalation; none required now.)

### Audit Requirements
Audit-Required:  yes
Actor-Types:     Admin
Action-Ref:      Doc-2 §9 (Platform) — "audit redaction (event)" (by pointer)
Attribution:     standard            ← Admin per §17.3
Mutation-Scope:  core.audit_records  (field redaction on target record + new redaction audit record)
Correlation:     both

### Operating Stage
Stage-Availability: all

### Rate Limits
Rate-Limits: none
```

Error codes: `core_audit_record_not_found` (NOT_FOUND), `core_audit_field_not_redactable` (BUSINESS), `core_audit_invalid_redaction_input` (VALIDATION), `core_audit_redaction_conflict` (CONFLICT).

---

## §A6 — Group 3: Outbox Dispatcher Contracts (`core.outbox_events`)

The transactional outbox (`core.outbox_events`) is owned by Module 0; per-event *integration* contracts (21.2) are authored by producing modules (§4.4) and are **not** here. Module 0 authors the **delivery mechanism**: a dispatcher worker and an archival worker. Both are System-actor Phase-2 workers → Template **21.5** (`Response: none`; exempt from the `reference_id` Response mandate per FreezeAudit Patch v1.0.1 PATCH-FA-01).

**F-03 framing (frozen via Structure Patch v0.1.1):** `core.outbox_events` is an append-only stream with **no Doc-2 §5 state machine** (Doc-2 §2). The `pending → dispatched → archived` status values are defined in the Doc-2 §10.1 table schema; the workers declare **`State-Machine-Effects: none`** and capture status changes under **Mutation-Scope** (§17). No status value is invented; a new status value would require a Doc-2 patch.

*Selection/trigger note (PA-m2, §A11): unlike a typical 21.5 worker triggered by one domain event, these workers are scheduled/continuous infrastructure that operate over the outbox table itself — reinforcing the D-1 internal-service-template friction (PA-M1).*

### Contract: Dispatch Outbox Events

```
## Contract: Dispatch Outbox Events

### Header
Contract-ID:     core.phase2_dispatch_outbox_events.v1
Contract-Name:   Dispatch Outbox Events
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Actor-Types:     System                       ← FIXED (21.5)
Version:         1
Status:          draft

### Required Permissions
Actor:        System
Membership:   n/a
Slugs:        n/a
Scope:        platform — operates over core.outbox_events platform-wide
Delegation:   not eligible

### Trigger
Scheduled/continuous System invocation (infrastructure scheduler). NOT a domain-event trigger:
this worker IS the delivery mechanism for outbox events. (Deviation from typical 21.5 event-trigger
shape — PA-m2.)

### Request Contract
[Phase-2 context — inputs are core.outbox_events rows, not a user request]
outbox_rows : (internal selection) : required : rows where status = `pending`, ordered by id (time-ordered UUIDv7); fields per Doc-2 §10.1 (event_name, event_version, payload_jsonb, status, attempts)

### Response Contract
Response: none — Phase-2 worker; asynchronous; outcome observed via consumer effects and ops telemetry (21.5; PATCH-FA-01 — no reference_id Response field)

### Validation Rules
V1 : SYNTAX   : outbox row well-formed (event_name, event_version, payload present per Doc-2 §10.1) : §9 : VALIDATION
V2 : CONTEXT  : System actor confirmed; platform scope (§5.2) : §5.2 : AUTHORIZATION
V8 : BUSINESS : row status = `pending` AND attempts < core.system_configuration.core.outbox_dispatch_max_attempts [PA-E1] : Doc-2 §10.1 : BUSINESS

### Error Behavior
Error-Boundary:
  Timing-Uniformity: not-applicable        ← System actor; no caller-facing timing surface
(No synchronous caller; error classes below are for internal classification / DLQ routing.)

### State Machine Effects
State-Machine-Effects: none
(core.outbox_events is an append-only stream; no Doc-2 §5 state machine — §13 / Structure Patch F-03. The pending → dispatched status-column change is captured under Mutation-Scope.)

### Idempotency
Idempotency:     required
Key-Scope:       platform
Window:          core.system_configuration.core.outbox_dispatch_dedup_window  [PA-E1]
Replay-Result:   acknowledged
(Delivery is at-least-once; consumers are idempotent per §16.7. The worker MUST NOT re-mark or double-deliver a row already dispatched.)

### Async Declaration
Execution: sync       ← the worker is synchronous within itself (§15.5)

### Failure Handling (infrastructure)
On delivery failure: increment core.outbox_events.attempts (Doc-2 §10.1); retry with backoff per core.system_configuration.core.outbox_dispatch_backoff [PA-E1]; after core.system_configuration.core.outbox_dispatch_max_attempts [PA-E1], park with ops alert per core.system_configuration.core.outbox_dlq_policy [PA-E1]. Never silently drop (§15.6 — handled within the infra status/attempts columns).

### Events Produced
Events-Produced: none
(The dispatcher DELIVERS existing outbox events to declared consumers; it produces no new domain event. §16.6: "none" where Doc-2 §8 designates no event.)

### Audit Requirements
Audit-Required:  yes
Actor-Types:     System
Action-Ref:      Doc-2 §9 (Platform) — "service-role sensitive operations" (by pointer)   [PA-M5: no dedicated outbox-dispatch audit action; bound at dispatch-RUN/batch granularity — see §A11]
Attribution:     system
Mutation-Scope:  core.outbox_events (status column: pending → dispatched)
Correlation:     phase2-origin     ← carries the originating Phase-1 reference linkage of delivered events (§17.2)

### Rate Limits
Rate-Limits: none      ← infrastructure worker; throughput governed by the scheduler, not a caller rate limit
```

Error codes (internal/DLQ classification): `core_outbox_dispatch_failed` (DEPENDENCY; retryable), `core_outbox_row_invalid` (VALIDATION).

### Contract: Archive Dispatched Outbox Events

```
## Contract: Archive Dispatched Outbox Events

### Header
Contract-ID:     core.phase2_archive_dispatched_events.v1
Contract-Name:   Archive Dispatched Outbox Events
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Actor-Types:     System                       ← FIXED (21.5)
Version:         1
Status:          draft

### Required Permissions
Actor:        System
Membership:   n/a
Slugs:        n/a
Scope:        platform
Delegation:   not eligible

### Trigger
Scheduled System invocation (retention sweep).

### Request Contract
[Phase-2 context]
outbox_rows : (internal selection) : required : rows where status = `dispatched` AND dispatched_at older than core.system_configuration.core.outbox_archive_retention [PA-E1]

### Response Contract
Response: none — Phase-2 worker (21.5; PATCH-FA-01)

### Validation Rules
V1 : SYNTAX   : row well-formed per Doc-2 §10.1 : §9 : VALIDATION
V2 : CONTEXT  : System actor; platform scope (§5.2) : §5.2 : AUTHORIZATION
V8 : BUSINESS : status = `dispatched` AND retention window elapsed (core.system_configuration.core.outbox_archive_retention [PA-E1]) : Doc-2 §10.1 : BUSINESS

### Error Behavior
Error-Boundary:
  Timing-Uniformity: not-applicable

### State Machine Effects
State-Machine-Effects: none
(Status dispatched → archived is an infra mutation captured under Mutation-Scope; no Doc-2 §5 state machine — §13 / Structure Patch F-03.)

### Idempotency
Idempotency:     required
Key-Scope:       platform
Window:          core.system_configuration.core.outbox_archive_dedup_window  [PA-E1]
Replay-Result:   acknowledged

### Async Declaration
Execution: sync

### Events Produced
Events-Produced: none

### Audit Requirements
Audit-Required:  yes
Actor-Types:     System
Action-Ref:      Doc-2 §9 (Platform) — "service-role sensitive operations" (by pointer)   [PA-M5]
Attribution:     system
Mutation-Scope:  core.outbox_events (status column: dispatched → archived)
Correlation:     phase2-origin

### Rate Limits
Rate-Limits: none
```

Error codes (internal): `core_outbox_archive_failed` (SYSTEM; retryable).

---

## §A7 — Group 4: ID Sequence Contracts (`core.id_sequences`)

Module 0 provides two identifier capabilities (Architecture §17.2; Doc-2 §0.1, §10.1): **UUIDv7 machine IDs** (algorithmic; no table, no contract) and **human-reference allocation** (`core.id_sequences`). Both are consumed *within other modules' create commands* — infrastructure primitives, not tenant-facing endpoints.

### Capability: UUIDv7 Machine Identifier Generation (no contract)

UUIDv7 is the only canonical machine identifier (§8.1; Architecture §17.2). Generation is algorithmic (time-ordered UUIDv7), invoked in-process at entity creation; it touches no table and exposes no callable contract. Identifiers never change and are never re-issued (§8.1). No Doc-4B contract is authored; consuming contracts simply declare `uuid` fields per §8. *(Documented for completeness; not a contract.)*

### Internal Infrastructure Service: Allocate Human Reference (D-1 composition)

Closest template: **21.4 Command** (internal-audience). **D-1 composition applied (PA-M1, §A11):** an infrastructure primitive invoked inside the owning module's create-entity transaction, not a standalone business command. 21.4's mandatory business-audit and Events-Produced fields do not apply and are declared `none` with justification rather than mis-declared — surfaced for the review.

```
## Internal Service: Allocate Human Reference
Audience:        internal-service (invoked within the owning module's create-entity transaction; not tenant-facing)
Service-ID:      core.allocate_human_reference.v1
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Invoked-By:      the owning module's create command (e.g., identity create-organization), within its transaction
Actor-Context:   inherits the caller's actor/organization context (§5.5); allocation itself is System-level infrastructure

### Inputs
entity_type : enum(Doc-2 §0.1 / Appendix B human_ref prefixes) : required : entity type whose sequence is drawn (e.g., ORG, RFQ, QTN, INV, DOC)
year        : integer : required : server-clock year (UTC, §9.8); the year scope of the sequence (Doc-2 §0.1)

### Output
human_ref : string : always : formatted reference per Doc-2 §0.1 (e.g., `ORG-2026-000001`); prefix from the Appendix B registry (never invented here)

### Effect (Mutation-Scope)
core.id_sequences : atomically increment next_value for (entity_type, year) under row lock (Doc-2 §10.1; §11 rule 8 — concurrency-safe, gap-tolerant); allocate and format the next value. Never reused, including after soft-delete/restore (§8.2; Architecture §17.2).

### Idempotency
Bound to the caller's create transaction: a replayed create (same caller idempotency key, §14.3 joint rule) MUST NOT draw a second reference. Allocation participates in the caller's single transaction; on caller replay, no new allocation occurs. The service exposes no independent idempotency key — it is not independently callable as a business command.

### Audit / Events (non-recursion — D-1 / PA-M1)
Audit-Required: no  — the allocation is part of the caller's audited create action (§17.1 operational-vs-business distinction); it produces no separate business audit record.
Events-Produced: none — the created entity's own command emits its corpus-defined events.

### Reference-format binding
Prefixes/formats bound to Doc-2 §0.1 and the Appendix B human_ref prefix registry; a new prefix requires a Doc-4A patch (Governance Note rule 5) — never invented here.
```

Error codes (internal): `core_idseq_unknown_entity_type` (VALIDATION — an entity_type absent from the Doc-2 §0.1 / Appendix B registry is a contract gap → escalate, never a runtime invention).

---

## §A8 — Group 5: System Configuration Contracts (`core.system_configuration`)

Module 0 owns the `core.system_configuration` **store**; **POLICY key definitions and values are owned by Doc-3 §12.2** — Module 0 stores, it never defines keys or values (§18.2). Two contracts: an internal runtime read and an Admin change.

**PA-E2 ownership note (PA-M4, §A11):** Doc-2 §16.2 assigns "system configuration policy" to Module 8 (Admin Operations / Doc-4J). The frozen Doc-4B structure §7.2 placed "configuration change (21.6 Admin)" in Doc-4B; this Pass authors it here per the frozen structure and flags the governance-ownership split (Module 8 *decides*; Module 0 *stores*) for the review.

### Internal Infrastructure Service: Resolve Configuration Value (D-1 composition)

Closest template: **21.3 Query** (internal-audience). Owning engines read POLICY values at runtime by key (§18.1–18.2; Architecture §17.3).

```
## Internal Service: Resolve Configuration Value
Audience:        internal-service (runtime read by owning engines; §18)
Service-ID:      core.config_value_query.v1
Owner-Module:    Platform Core / Shared Kernel (Module 0)

### Inputs
key : string : required : POLICY key name; MUST exist in Doc-3 §12.2 (by pointer); format core.system_configuration.<domain>.<key_name> (§18.2)

### Output
value      : object : always : value_jsonb (Doc-2 §10.1), interpreted per value_type
value_type : string : always : per Doc-2 §10.1

### Validation
V1 : SYNTAX   : key present; well-formed core.system_configuration.<domain>.<key> (§18.2) : §9 : VALIDATION
V8 : BUSINESS : key registered in Doc-3 §12.2 — an unknown key is a contract gap (escalate §18.2), never a runtime invention : Doc-3 §12.2 : REFERENCE

### State Machine / Idempotency / Audit / Events
State-Machine-Effects: none ; Idempotency: not-applicable ; Audit-Required: no (read) ; Events-Produced: none
```

Error codes: `core_config_key_not_found` (REFERENCE — cf. corpus example `core_config_key_not_found`, Pass6 Annexure B §B.4), `core_config_invalid_key` (VALIDATION).

### Contract: Change Configuration Value

```
## Contract: Change Configuration Value

### Header
Contract-ID:     core.admin_update_config_value.v1
Contract-Name:   Change Configuration Value
Owner-Module:    Platform Core / Shared Kernel (Module 0)   [PA-M4: governance authority may belong to Doc-4J per Doc-2 §16.2 — flagged for review]
Actor-Types:     Admin
Version:         1
Status:          draft

### Required Permissions
Actor:        Admin
Membership:   n/a
Slugs:        staff_super_admin           ← Doc-2 §7 (existing). D-2 (PA-M2): recommend staff_can_manage_system_configuration for least privilege
Scope:        platform-wide
Delegation:   not eligible
Admin-Scope:  platform-wide

### Firewall-Compliance Declaration
Signals-Read:        none
Signals-Written:     none    ← configuration MUST NOT write or gate any governance signal
Mutation-Inputs:     none
Monetization-Inputs: none
Routing-Impact:      none    ← config tunes POLICY values only; never alters FIXED rules, trust, verification, eligibility, routing fairness, or matching confidence (§18.3, §18.5, §4B)
Disclosure:          none

### Request Contract
key            : string  : required : POLICY key; MUST exist in Doc-3 §12.2 (by pointer); §18.2 — a new key requires a Doc-3 patch (escalation), never created here
new_value      : object  : required : value_jsonb; type/bounds per the key's Doc-3 §12.2 definition (by pointer)
value_type     : string  : required : per Doc-2 §10.1; MUST match the key's declared type
change_reason  : string  : required : structured reason; min length core.system_configuration.core.config_change_reason_min_chars  [PA-E1]
formula_version_bump : boolean : optional : default false; true where the key affects scoring and Doc-3 §12.4 requires a formula_version increment (by pointer)

### Response Contract
key          : string    : always : the changed key
value_type   : string    : always
updated_by   : uuid      : always : acting staff user (Doc-2 §10.1 updated_by; server-populated)
updated_at   : timestamp : always : change time (concurrency token §10.2)
reference_id : uuid      : always : platform-assigned UUIDv7 (§22.1 C-05 / P6-B01)

### Validation Rules
V1 : SYNTAX   : key/new_value/value_type/reason present; reason ≥ min length; value_type matches key : §9 : VALIDATION
V2 : CONTEXT  : Admin actor; no org context; Admin-Scope platform-wide (§5.6) : §5.6 : AUTHORIZATION
V3 : AUTHZ    : staff_super_admin held : Doc-2 §7 : AUTHORIZATION
V7 : REF      : key exists in Doc-3 §12.2 (registered POLICY key) : Doc-3 §12.2 / §18.2 : REFERENCE
V8 : BUSINESS : key is a POLICY key (FIXED rules are never settable via config — §18.5; Doc-3 §12.1) AND new_value within the key's declared bounds (Doc-3 §12.2 by pointer) : Doc-3 §12.1/§12.2; §18.5 : BUSINESS

### Error Behavior
Error-Boundary:
  Timing-Uniformity: not-applicable     ← platform config; no protected-fact surface

### State Machine Effects
State-Machine-Effects: none     ← core.system_configuration lifecycle is "simple" (Doc-2 §3.1); no Doc-2 §5 state machine

### Idempotency
Idempotency:     required
Key-Scope:       platform
Window:          core.system_configuration.core.config_change_dedup_window  [PA-E1]
Replay-Result:   cached-response

### Concurrency
Concurrency: optimistic
Token:       updated_at

### Async Declaration
Execution: sync

### Events Produced
Events-Produced: none
(Doc-2 §8 designates no event for configuration change; engines read values at runtime per Architecture §17.3. A change-notification event would require a Doc-2 §8 addition — escalation; none required now.)

### Audit Requirements
Audit-Required:  yes
Actor-Types:     Admin
Action-Ref:      Doc-2 §9 (Platform) — "system_configuration change" (by pointer)
Attribution:     standard
Mutation-Scope:  core.system_configuration
Correlation:     both

### Operating Stage
Stage-Availability: all

### Rate Limits
Rate-Limits: none
```

Error codes: `core_config_key_not_found` (REFERENCE), `core_config_value_out_of_bounds` (BUSINESS), `core_config_fixed_rule_not_settable` (BUSINESS), `core_config_invalid_input` (VALIDATION), `core_config_change_conflict` (CONFLICT).

---

## §A9 — Group 6: Feature Flag Contracts (`core.feature_flags`)

Module 0 owns `core.feature_flags` (Architecture §17.1; Doc-2 §3.1, §10.1). Unlike configuration (PA-M4), Doc-2 §16.2 does not assign flag management elsewhere, so flag management is cleanly a Module 0 surface. Two contracts: an internal evaluation read and an Admin set.

### Internal Infrastructure Service: Evaluate Feature Flag (D-1 composition)

Closest template: **21.3 Query** (internal-audience). Modules evaluate flags at runtime to gate controlled rollout.

```
## Internal Service: Evaluate Feature Flag
Audience:        internal-service (runtime evaluation by any module)
Service-ID:      core.feature_flag_evaluate.v1
Owner-Module:    Platform Core / Shared Kernel (Module 0)

### Inputs
flag_key   : string : required : the flag identifier (Doc-2 §10.1 flag_key)
scope      : object : optional : evaluation scope per Doc-2 §10.1 scope_jsonb (e.g., organization_id, environment); absent → default/global evaluation

### Output
enabled : boolean : always : the resolved flag state for the supplied scope (Doc-2 §10.1 enabled + scope_jsonb)

### Validation
V1 : SYNTAX   : flag_key present; scope well-formed per scope_jsonb shape : §9 : VALIDATION
V8 : BUSINESS : unknown flag_key resolves to disabled (fail-safe), not an error — flags gate rollout, absence = not rolled out : Architecture §17.1 : (no error; default disabled)

### State Machine / Idempotency / Audit / Events
State-Machine-Effects: none ; Idempotency: not-applicable ; Audit-Required: no (read) ; Events-Produced: none

### Firewall note
Flag evaluation MAY gate feature visibility / rollout only; it MUST NOT gate trust, verification, eligibility, routing fairness, or matching confidence (§18.3, §4B).
```

Error codes: `core_flag_invalid_input` (VALIDATION). *(Unknown `flag_key` is not an error — it resolves disabled, fail-safe.)*

### Contract: Set Feature Flag

```
## Contract: Set Feature Flag

### Header
Contract-ID:     core.admin_set_feature_flag.v1
Contract-Name:   Set Feature Flag
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Actor-Types:     Admin
Version:         1
Status:          draft

### Required Permissions
Actor:        Admin
Membership:   n/a
Slugs:        staff_super_admin           ← Doc-2 §7 (existing). D-2 (PA-M2): recommend staff_can_manage_feature_flags for least privilege
Scope:        platform-wide
Delegation:   not eligible
Admin-Scope:  platform-wide

### Firewall-Compliance Declaration
Signals-Read:        none
Signals-Written:     none
Mutation-Inputs:     none
Monetization-Inputs: none
Routing-Impact:      none    ← flags gate feature rollout/visibility only; never trust, verification, eligibility, routing fairness, or matching confidence (§18.3, §4B)
Disclosure:          none

### Request Contract
flag_key   : string  : required : flag identifier (Doc-2 §10.1 flag_key)
enabled    : boolean : required : target state
scope      : object  : optional : scope_jsonb (Doc-2 §10.1); absent → global scope
change_reason : string : required : structured reason; min length core.system_configuration.core.flag_change_reason_min_chars  [PA-E1]

### Response Contract
flag_key     : string    : always
enabled      : boolean    : always : resulting state
updated_by   : uuid      : always : acting staff user (server-populated)
updated_at   : timestamp : always : concurrency token (§10.2)
reference_id : uuid      : always : platform-assigned UUIDv7 (§22.1 C-05 / P6-B01)

### Validation Rules
V1 : SYNTAX   : flag_key/enabled/reason present; scope well-formed; reason ≥ min length : §9 : VALIDATION
V2 : CONTEXT  : Admin actor; no org context; Admin-Scope platform-wide (§5.6) : §5.6 : AUTHORIZATION
V3 : AUTHZ    : staff_super_admin held : Doc-2 §7 : AUTHORIZATION
V8 : BUSINESS : the flag gates rollout/visibility only (never a firewall-protected concern — §18.3, §4B) : §18.3/§4B : BUSINESS

### Error Behavior
Error-Boundary:
  Timing-Uniformity: not-applicable

### State Machine Effects
State-Machine-Effects: none     ← core.feature_flags lifecycle is "simple" (Doc-2 §3.1); no Doc-2 §5 state machine

### Idempotency
Idempotency:     required
Key-Scope:       platform
Window:          core.system_configuration.core.flag_change_dedup_window  [PA-E1]
Replay-Result:   cached-response

### Concurrency
Concurrency: optimistic
Token:       updated_at

### Async Declaration
Execution: sync

### Events Produced
Events-Produced: none
(Doc-2 §8 designates no event for feature-flag change; modules evaluate flags at runtime. A change-notification event would require a Doc-2 §8 addition — escalation; none required now.)

### Audit Requirements
Audit-Required:  yes
Actor-Types:     Admin
Action-Ref:      Doc-2 §9 (Platform) — "feature flag change" (by pointer)
Attribution:     standard
Mutation-Scope:  core.feature_flags
Correlation:     both

### Operating Stage
Stage-Availability: all

### Rate Limits
Rate-Limits: none
```

Error codes: `core_flag_invalid_input` (VALIDATION), `core_flag_change_conflict` (CONFLICT).

---

## §A10 — Group 7: Supporting Internal Infrastructure Contracts

The two cross-cutting Module-0 mechanisms every other module's contracts declare obligations against (frozen structure §3): the **audit-write** (target of every §17 Audit Requirements block) and the **transactional-outbox-write** (target of every §16.2 Events Produced block). Both are **Internal Infrastructure Services (D-1 composition; closest template 21.4 Command, internal-audience)**, invoked **within the caller's transaction**. They are infrastructure primitives — not standalone business commands — so 21.4's mandatory business-audit and Events-Produced fields are declared `none` with justification (PA-M1). UUIDv7 generation (§A7) and the config/flag reads (§A8/§A9) complete the §3 obligation set.

### Internal Infrastructure Service: Append Audit Record (D-1 composition)

```
## Internal Service: Append Audit Record
Audience:        internal-service (the mechanism every mutating contract's §17 Audit Requirements resolves to)
Service-ID:      core.append_audit_record.v1
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Invoked-By:      any module's mutating contract, within that contract's transaction (§17.1)

### Inputs
Writes the Doc-2 §9 audit field set (by pointer; canonical representation defined in §A4) — actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent — populated from the caller's audited action. Field names and semantics are owned by Doc-2 §9 (never restated here).

### Effect (Mutation-Scope)
core.audit_records : append exactly one immutable row (Doc-2 §10.1; partitioned by month, time-ordered UUIDv7 PK). Append-only; never updated or deleted (§17.5; redaction is the separate core.admin_redact_audit_field contract).

### Idempotency (joint rule §14.3)
Bound to the caller's transaction: a safe replay of the caller's command (same idempotency key) MUST produce exactly one audit record — the original (§14.3 condition 2). The service performs no independent dedup; it participates in the caller's single transaction.

### Audit / Events (non-recursion — D-1 / PA-M1)
Audit-Required: n/a — this IS the audit mechanism; it does not recursively audit itself.
Events-Produced: none — appending audit does not emit a domain event (audit ≠ events, §17.6).

### Non-disclosure
The caller is responsible for not placing protected facts in fields beyond what Doc-2 §9 and §7.5 permit; redaction (§A5) governs later field blanking.
```

Error codes (internal): `core_audit_append_failed` (SYSTEM; the caller's transaction rolls back — audit failure fails the business write, since audit is mandatory and atomic for mutations, §17.1).

### Internal Infrastructure Service: Write Outbox Event (D-1 composition)

```
## Internal Service: Write Outbox Event
Audience:        internal-service (the mechanism every emitting contract's §16.2 Events Produced resolves to)
Service-ID:      core.write_outbox_event.v1
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Invoked-By:      any module's event-emitting contract, in the SAME transaction as the business write (§16.2 — atomic)

### Inputs
event_name    : string  : required : MUST exist in Doc-2 §8 (by pointer); never coined (§16.4). The owning (emitting) module is the only legal caller for its events (§16.6)
event_version : integer : required : ≥ 1 (§16.4)
aggregate_id  : uuid    : required : the aggregate root id the event concerns (Doc-2 §10.1 aggregate_id; §16.5 thin payload)
payload       : object  : required : thin payload per §16.5 (IDs + minimal metadata); Privacy-Review: §7.5 compliant (caller's assertion — no protected facts, §16.3)

### Effect (Mutation-Scope)
core.outbox_events : insert exactly one row with status = `pending` (Doc-2 §10.1 — event_name, event_version, payload_jsonb, status, attempts) inside the caller's transaction. Delivery is performed asynchronously by the dispatcher (§A6).

### Idempotency (joint rule §14.3)
Bound to the caller's transaction: a safe replay of the caller's command MUST NOT write a second outbox event — the original stands (§14.3 condition 3). No independent dedup key.

### Audit / Events (non-recursion — D-1 / PA-M1)
Audit-Required: n/a — writing the outbox is the emit mechanism; the business action is audited by the caller (§17), not by this service.
Events-Produced: n/a — this service IS the event-write primitive; it does not itself "produce" a further event.

### Ownership / validation
The service persists the row structurally; it does not validate business semantics. The caller (the owning module per §16.6) is responsible for event ownership, thin-payload compliance (§16.5), and the Privacy-Review assertion (§16.3). A non-existent event_name is a caller-side conformance failure (§16.4 escalation), not a runtime invention.
```

Error codes (internal): `core_outbox_write_failed` (SYSTEM; the caller's transaction rolls back — the business write cannot commit without the outbox row, §16.2).

---

## §A11 — Self-Review (pre–Independent-Architecture-Review)

*Non-normative. Classification per Doc-4A §3.4 / project Documentation Rules: BLOCKER, MAJOR, MINOR. "BLOCKER" here means **freeze of the specific affected contract is blocked pending an upstream Doc-2/Doc-3/Doc-4A decision** — Pass-A's purpose is to surface these for the review, not to invent around them (§0.6).*

### A11.1 — Validation across the eight required dimensions

| Dimension | Result | Notes |
|---|---|---|
| Ownership integrity | PASS | Only `core.*` entities (Doc-2 §3.1). Config-governance ownership flagged (PA-M4), not moved. No ownership reassigned. |
| Module boundary integrity | PASS | Per-event integration (21.2) contracts correctly deferred to producing modules (§4.4); no non-Module-0 entity created, read-as-owner, or transitioned. |
| Template correctness | PASS (w/ notes) | 21.6 Admin (audit reads/redaction, config/flag change), 21.5 System (dispatcher/archiver), 21.3/21.4 composed for internal services (D-1). Notes: PA-m1 (21.3-vs-21.6 for Admin reads), PA-m2 (dispatcher 21.5 deviation), PA-M1 (D-1 composition friction). |
| Audit requirements | PASS (w/ BLOCKER) | Redaction → Doc-2 §9 "audit redaction (event)"; config → "system_configuration change"; flag → "feature flag change" (all exist). Dispatcher/archiver audit Action-Ref unresolved → **PA-M5 (BLOCKER)**. Internal primitives correctly non-recursive (no self-audit). |
| Idempotency requirements | PASS (w/ BLOCKER) | All commands `Idempotency: required`; queries `not-applicable`; workers platform-scope; joint rule §14.3 honored; internal primitives bound to caller's transaction. Dedup-window POLICY keys unregistered → **PA-M3 (BLOCKER)**. |
| Event requirements | PASS | No event coined (§16.4). `Events-Produced: none` where Doc-2 §8 designates none. Outbox-write mechanism honors §16.2 atomicity; dispatcher delivers (does not produce). Per-event integrations deferred (§4.4). |
| AI-agent authoring safety | PASS | No invented slug/POLICY key/event/template/entity. Flag-and-halt applied (D-1, D-2, PA-E1, PA-E2). Reference-never-restate throughout; every binding by pointer; `reference_id` mandate satisfied (21.5 exempt). |
| Cross-reference correctness | PASS (w/ BLOCKER) | Slugs → Doc-2 §7 (existing); audit actions → Doc-2 §9 (exist except PA-M5); templates → Doc-4A §21; error codes within `core_` (Appendix B §B.2). POLICY keys → Doc-3 §12.2 **unregistered** (PA-M3). |

### A11.2 — Findings classified

**BLOCKER (freeze of affected contracts blocked pending upstream decision):**

| ID | Affected | Finding & required resolution |
|---|---|---|
| PA-M3 | `core.audit_record_query`, `core.audit_correlation_lookup`, `core.admin_redact_audit_field`, both outbox workers, `core.admin_update_config_value`, `core.admin_set_feature_flag` | These reference POLICY keys not registered in Doc-3 §12.2: `core.audit_query_page_size_max`, `core.audit_query_rate_window`/`_reset`, `core.audit_lookup_rate_window`/`_reset`, `core.audit_redactable_fields_max`, `core.audit_redaction_reason_min_chars`, `core.redaction_dedup_window`, `core.outbox_dispatch_dedup_window`/`_max_attempts`/`_backoff`, `core.outbox_dlq_policy`, `core.outbox_archive_retention`/`_dedup_window`, `core.config_change_reason_min_chars`/`_dedup_window`, `core.flag_change_reason_min_chars`/`_dedup_window`. Per §18.2, inventing keys is a conformance failure. **Resolution: Doc-3 §12.2 additive patch registering the `core.system_configuration.core.*` key block.** (PA-E1.) |
| PA-M5 | `core.phase2_dispatch_outbox_events`, `core.phase2_archive_dispatched_events` | Template 21.5 mandates `Audit-Required: yes` with a Doc-2 §9 `Action-Ref`, but no dedicated outbox-dispatch audit action exists; per-event delivery is arguably operational telemetry (§17.1), not business audit. Interim binding: Doc-2 §9 "service-role sensitive operations" at dispatch-run/batch granularity. **Resolution (review to choose): (a) a dedicated Doc-2 §9 audit action for outbox lifecycle; or (b) a Doc-4A clarification that pure-infrastructure delivery workers record operational telemetry rather than per-event business audit; or (c) confirm the generic action at batch granularity.** |

**MAJOR (authorable with documented interim binding; Board decision/patch recommended before freeze):**

| ID | Finding & recommendation |
|---|---|
| PA-M1 | **D-1 composition friction.** The internal infrastructure primitives (`core.allocate_human_reference`, `core.append_audit_record`, `core.write_outbox_event`) and the runtime reads (`core.config_value_query`, `core.feature_flag_evaluate`) do not fit Templates 21.3/21.4 cleanly — 21.4 mandates business-audit/Events-Produced that misrepresent infrastructure primitives. Composition (frozen structure D-1 Option b) applied with explicit non-recursion notes. **Recommendation:** the review ratifies the composition convention, **or** accelerates the deferred Internal Service Contract template (D-1 Option a) via a Doc-4A patch — which would make these declarations native rather than annotated. |
| PA-M2 | **D-2 least-privilege slugs.** Config change, flag management, and audit read bind to the existing `staff_super_admin` (valid; not invented). **Recommendation:** Doc-2 §7 additive patch introducing `staff_can_manage_system_configuration`, `staff_can_manage_feature_flags`, `staff_can_read_audit` for least privilege. Not a freeze-blocker (`staff_super_admin` governs in the interim). |
| PA-M4 | **Config-change governance ownership.** Doc-2 §16.2 assigns "system configuration policy" to Module 8 (Doc-4J); the frozen Doc-4B structure §7.2 placed config change in Doc-4B. Authored here per the frozen structure. **Recommendation:** the review adjudicates — confirm the "Module 8 decides; Module 0 stores" split (governance contract → Doc-4J, storage write → Doc-4B), or confirm Doc-4B ownership and note it against Doc-2 §16.2. No ownership moved by this Pass. |

**MINOR:**

| ID | Finding |
|---|---|
| PA-m1 | Template selection for **Admin-actor reads** (audit query/lookup): chose 21.6 Admin (for the §5.6 Admin-Scope/Compliance-Basis fields) over 21.3 Query. Doc-4A §22.3 R-01/R-07 should be checked to confirm the canonical selection for Admin reads. |
| PA-m2 | The outbox **dispatcher/archiver** are scheduled/continuous infrastructure operating over the outbox table itself, deviating from the typical 21.5 single-event-triggered worker shape. Conformant (System actor, Phase-2), but reinforces the PA-M1 case for an internal-infrastructure template. |

### A11.3 — Contract inventory (instantiated)

| Group | Contract / Service | Template | Actor | Entity |
|---|---|---|---|---|
| 1 Audit Queries | `core.audit_record_query.v1` | 21.6 | Admin | core.audit_records |
| 1 | `core.audit_correlation_lookup.v1` | 21.6 | Admin | core.audit_records |
| 2 Audit Admin | `core.admin_redact_audit_field.v1` | 21.6 (mutating) | Admin | core.audit_records |
| 3 Outbox Dispatcher | `core.phase2_dispatch_outbox_events.v1` | 21.5 | System | core.outbox_events |
| 3 | `core.phase2_archive_dispatched_events.v1` | 21.5 | System | core.outbox_events |
| 4 ID Sequence | UUIDv7 generation | (capability — no contract) | System | — |
| 4 | `core.allocate_human_reference.v1` | 21.4 (internal, D-1) | System/internal | core.id_sequences |
| 5 System Config | `core.config_value_query.v1` | 21.3 (internal, D-1) | internal | core.system_configuration |
| 5 | `core.admin_update_config_value.v1` | 21.6 (mutating) | Admin | core.system_configuration |
| 6 Feature Flags | `core.feature_flag_evaluate.v1` | 21.3 (internal, D-1) | internal | core.feature_flags |
| 6 | `core.admin_set_feature_flag.v1` | 21.6 (mutating) | Admin | core.feature_flags |
| 7 Supporting Infra | `core.append_audit_record.v1` | 21.4 (internal, D-1) | internal | core.audit_records |
| 7 | `core.write_outbox_event.v1` | 21.4 (internal, D-1) | internal | core.outbox_events |

### A11.4 — Constraint compliance & readiness

No architecture redesign; no module/ownership boundary modified; no new entity, aggregate, event, workflow, state machine, permission, or template created. All five `core` entities are covered; no contract outside Module 0 is authored. Reference-never-restate is applied throughout (Doc-2 §7/§8/§9, Doc-3 §12.2, Doc-4A bound by pointer).

**Disposition:** Pass-A is **ready for Independent Architecture Review**. Two BLOCKER findings (PA-M3, PA-M5) require small additive upstream patches (Doc-3 §12.2 POLICY keys; a Doc-2 §9 action or Doc-4A clarification) and are routed accordingly; three MAJOR and two MINOR findings are recorded for the review's adjudication. No finding requires redesign of Module 0.

---

*End of Doc-4B Content v1.0 — Pass-A (Module 0 — Platform Core / Shared Kernel). Combined Pass 1–3 maturity. Ready for Independent Architecture Review. Findings: 2 BLOCKER (upstream-dependency), 3 MAJOR, 2 MINOR — all routed; none resolved by invention (§0.6).*
