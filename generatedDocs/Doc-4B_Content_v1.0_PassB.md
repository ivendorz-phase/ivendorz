# Doc-4B — Platform Core / Shared Kernel — API & Integration Contracts — Content v1.0, Pass-B

| Field | Value |
|---|---|
| Document | Doc-4B — Platform Core / Shared Kernel (Module 0) |
| Pass | B of N — combined maturity of traditional Pass-4 + Pass-5 (contract / governance / cross-reference / implementation hardening; AI-agent execution safety; freeze-readiness preparation) |
| Status | **DRAFT — ready for Independent Architecture Review** |
| Supersedes | `Doc-4B_Content_v1.0_PassA.md`, integrating `Doc-4B_PassA_Patch_v1.0.1.md` (PA-B01, PA-m01, PA-m02, PA-m03) and `Doc-4B_PassA_Consistency_Patch_v1.0.2.md` (C-01 version normalization). Pass-B is the authoritative Module 0 contract document. |
| Objective | Hardening, not expansion. No new contracts, entities, events, permissions, templates, or domains are introduced relative to Pass-A. |
| Structure | Conforms to the frozen Doc-4B Structure = `Doc-4B_Structure_Proposal_v0.1.md` as amended by `Doc-4B_Structure_Patch_v0.1.1.md` (Board-frozen) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (base `…v1.0.2.md` + Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3), Doc-3 v1.0.2 (base `…v1.0.1.md` + Doc-3_Patch_v1.0.2), Doc-4A v1.0 (FROZEN: Pass1–Pass6 + Pass3 Patch v1.0.1 + Pass4 Patch v1.0.1 + Pass5 Patch v1.0.1 + Pass6 Patch v1.0.1 + FreezeAudit Patch v1.0.1) |
| Audience | Claude Code, Cursor, backend, QA, AI development agents |

---

## §B0 — Document Control & Conformance

Doc-4B authors the contracts of Module 0 (Platform Core / Shared Kernel) and **no other module**. It defines no standards (Doc-4A), no entities/states/events/permissions/POLICY keys (Doc-2/Doc-3), and overrides nothing in a higher-precedence document. On any conflict, the higher document prevails and this document is flagged for patch (Doc-4A §0.6; precedence Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B).

**Pass-B integration ledger** (what changed from Pass-A, by applied patch — no behavioral expansion):

| Applied | Effect integrated into Pass-B |
|---|---|
| PA-Patch v1.0.1 / PA-B01 | `core.admin_update_config_value.v1`: `formula_version_bump` request field **removed**; service-side responsibility note added; `formula_version_bumped` response field added. Formula-version ownership remains in Trust (Doc-2 §10.6). |
| PA-Patch v1.0.1 / PA-m01 | `core.audit_correlation_lookup.v1`: Firewall-Compliance Declaration added (identical to the sibling query). |
| PA-Patch v1.0.1 / PA-m02 | both audit reads: `Access-Flagging` declaration added (middleware obligation for Doc-2 §9 "Super Admin access (flagged)"). |
| PA-Patch v1.0.1 / PA-m03 | `core.audit_correlation_lookup.v1`, `core.admin_redact_audit_field.v1`, `core.admin_update_config_value.v1`, `core.admin_set_feature_flag.v1`: `Entitlement References / Entitlements: none` added. |
| Consistency Patch v1.0.2 / C-01 | canonical effective version identifiers used throughout (Doc-2 v1.0.3, Doc-3 v1.0.2). |

Reference-never-restate (Doc-4A §0.3) is applied throughout: the audit field set (Doc-2 §9), event catalog (Doc-2 §8), POLICY key inventory (Doc-3 §12.2), human-reference formats (Doc-2 §0.1), and permission slugs (Doc-2 §7) are bound by pointer, never copied. Every Response Contract carries the mandatory `reference_id : uuid : always` line (Doc-4A §22.1 C-05 as amended by Pass 6 Patch v1.0.1 P6-B01); Template 21.5 Phase-2 contracts are exempt and carry `Response: none` (FreezeAudit Patch v1.0.1 PATCH-FA-01).

---

## §B1 — Module 0 Scope & Contract Model

Module 0 owns exactly five entities (Doc-2 §3.1, §10.1), all platform-owned, none a business aggregate (Doc-2 §2: "no aggregates… by rule"):

| Entity | Lifecycle (Doc-2 §10.1) | Nature |
|---|---|---|
| `core.audit_records` | append-only; never deleted (soft archive) | immutable audit stream |
| `core.outbox_events` | `pending → dispatched → archived` (status column; **not** a Doc-2 §5 state machine — Structure Patch F-03) | transactional outbox stream |
| `core.id_sequences` | simple | year-scoped human-reference counters |
| `core.system_configuration` | simple (changes audited) | keyed POLICY value store |
| `core.feature_flags` | simple | keyed rollout control |

**Contract vs obligation (Structure §3).** Module 0 is consumed (a) as **callable contracts** — audit reads, audit redaction, outbox dispatcher/archiver, configuration/flag reads and changes; and (b) as **cross-cutting infrastructure obligations** that *other* modules' contracts declare against Module 0 mechanisms — the audit-write (§17), the transactional-outbox-write (§16.2), UUIDv7 assignment + human-reference allocation (§8), POLICY resolution (§18), feature-flag evaluation. §B10 specifies the Module-0 mechanisms behind those obligations. Per the integration single-authorship rule (§4.4), per-event integration contracts (21.2) are authored by producing modules (Doc-4C…4K), **not here**.

**Actor profile.** No tenant-user business operations. Contracts are **Admin** (platform-staff, no active organization context — §5.6), **System** (Phase-2 workers and internal mechanisms — §5.2), or internal **service** reads. No contract below is delegation-eligible (§6B.1); none touches a tenant aggregate.

**Contract inventory (authoritative; 13 items; unchanged count from Pass-A):**

| Group | Contract / Service | Template | Actor | Entity |
|---|---|---|---|---|
| 1 Audit Queries | `core.audit_record_query.v1` | 21.6 | Admin | core.audit_records |
| 1 | `core.audit_correlation_lookup.v1` | 21.6 | Admin | core.audit_records |
| 2 Audit Admin | `core.admin_redact_audit_field.v1` | 21.6 (mutating) | Admin | core.audit_records |
| 3 Outbox Dispatcher | `core.phase2_dispatch_outbox_events.v1` | 21.5 | System | core.outbox_events |
| 3 | `core.phase2_archive_dispatched_events.v1` | 21.5 | System | core.outbox_events |
| 4 ID Sequence | UUIDv7 generation | capability (no contract) | System | — |
| 4 | `core.allocate_human_reference.v1` | 21.4 (internal, D-1) | System/internal | core.id_sequences |
| 5 System Config | `core.config_value_query.v1` | 21.3 (internal, D-1) | internal | core.system_configuration |
| 5 | `core.admin_update_config_value.v1` | 21.6 (mutating) | Admin | core.system_configuration |
| 6 Feature Flags | `core.feature_flag_evaluate.v1` | 21.3 (internal, D-1) | internal | core.feature_flags |
| 6 | `core.admin_set_feature_flag.v1` | 21.6 (mutating) | Admin | core.feature_flags |
| 7 Supporting Infra | `core.append_audit_record.v1` | 21.4 (internal, D-1) | internal | core.audit_records |
| 7 | `core.write_outbox_event.v1` | 21.4 (internal, D-1) | internal | core.outbox_events |

---

## §B2 — Governance Tracking (carried forward; not resolved by invention)

The following items remain open and are tracked explicitly. Pass-B applies the documented **interim bindings** from Pass-A/patch and **invents no interim architecture** (Doc-4A §0.6). Each is resolved only through its named channel; freeze of an affected contract is gated where noted.

| ID | Item | Status | Interim binding in Pass-B | Freeze gate |
|---|---|---|---|---|
| **D-1** | Template Composition Convention | `BOARD DECISION PENDING` | Internal services composed from 21.3/21.4 with `Audience: internal-service` + non-recursion notes (Structure D-1 Option b) | No — contracts authorable |
| **D-2** | Permission Granularity | `DOC-2 PATCH PENDING` | Audit read / config change / flag change bind to existing `staff_super_admin` (Doc-2 §7) | No — `staff_super_admin` valid interim |
| **D-4** | Configuration Governance Boundary | `BOARD DECISION PENDING` | `core.admin_update_config_value.v1` authored in Doc-4B per frozen Structure §7.2; Doc-2 §16.2 ("system configuration policy" → Module 8) flagged | No — interim Doc-4B ownership documented |
| **D-5** | Outbox Audit Granularity | `BOARD DECISION PENDING` | Outbox workers bind `Action-Ref` to Doc-2 §9 "service-role sensitive operations" at dispatch-run/batch granularity | **Yes** — Action-Ref decision gates outbox-worker freeze |
| **PA-M3** | Infrastructure Key Registration | `DOC-3 PATCH PENDING` | All `core.system_configuration.core.*` keys cited by intended name with `[PA-E1]` markers | **Yes** — Doc-3 §12.2 registration gates affected-contract freeze |

No item above is silently resolved. `[D-4]`, `[D-5]`, `[PA-E1]` markers appear inline at every affected point so AI agents and reviewers can locate the open dependency.

---

## §B3 — Conventions Applied

- **Contract-ID:** `core.<operation>.v1` (module prefix = schema `core`; §3.2, §20.3).
- **Error codes:** `core_<domain>_<code>` (Doc-4A Appendix B §B.2 format `<module_prefix>_<domain>_<code>`; prefix `core_` registered). Individual codes are defined within the registered prefix (§12.3).
- **Timestamps:** ISO-8601 UTC (§9.8). **Identifiers:** UUIDv7 only in payloads; `human_ref` as lookup convenience only (§8).
- **Error envelope (every error response):** `error_class : enum(§12.2) : always`; `error_code : string : always`; `message : string : always`; `field_errors : list : conditional (VALIDATION only)`; `retryable : boolean : always`; `reference_id : uuid : always` (§12.1). Per-contract error lines below name the contract-specific `error_class`/`error_code` pairs; the envelope shape is the §12.1 platform shape and is not restated per contract.
- **Non-disclosure (§7.5/§7.6):** audit read surfaces carry an explicit §7.5 compliance statement and Error Boundary; audit records for protected-fact-gated operations are never served to a gated-out party.
- **Reference-never-restate:** `Action-Ref`, `Source-Ref`, POLICY keys, and slugs are pointers to Doc-2/Doc-3; no catalog content is reproduced.

---

## §B4 — Group 1: Audit Record Queries (`core.audit_records`)

The audit read surface. Module 0 owns `core.audit_records` and defines its canonical representation here; Doc-4J and owning modules compose tenant-facing views over this read (§17.8). Both contracts are **Admin-actor reads** → Template **21.6** (the §5.6 Admin-Scope + Compliance-Basis fields are required; 21.3 Query does not provide them — selection confirmed by the Pass-A review, which dismissed the 21.3-vs-21.6 concern). `State-Machine-Effects: none` and `Idempotency: not-applicable` are declared as for a read.

**Canonical representation — `audit_record`** (bound to the Doc-2 §9 field set by pointer; not restated): `audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent`. `ip_address`/`user_agent` are redaction-aware (§10.7/§14.3; absent when redacted, not signaled).

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
Slugs:        staff_super_admin            ← Doc-2 §7 (existing). [D-2] no dedicated staff_can_read_audit slug; staff_super_admin governs (DOC-2 PATCH PENDING)
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
  V4 : NOT_FOUND | collapse-rule   (audit of a protected-fact operation never confirmed to a non-compliance party; §12.4)
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
Audit-Required: no    ← no business audit record is produced by this read endpoint (§17.1)
Access-Flagging: yes  ← Doc-2 §9 (Platform) "Super Admin access (flagged)": the API middleware/gateway layer writes a core.audit_records row when a staff_super_admin token is used, independently of and BEFORE this endpoint executes; actor_type=Admin, action="Super Admin access (flagged)". This is an infrastructure obligation (operational), distinct from a contract-level business Audit Requirements declaration (§17.1). No new audit event or action is introduced — the action already exists in Doc-2 §9. [PA-m02]

### Entitlement References
Entitlements: none    ← Module 0 platform-infrastructure access is permission-slug-controlled only; not entitlement-gated (Doc-4A §18.3)

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
Slugs:        staff_super_admin            ← Doc-2 §7 (existing); [D-2] (DOC-2 PATCH PENDING)
Scope:        tenant-data-access
Delegation:   not eligible
Admin-Scope:  tenant-data-access
Compliance-Basis: Doc-2 §9 / Master Architecture §14, by pointer

### Firewall-Compliance Declaration                 [added per PA-m01 — identical to sibling query]
Signals-Read:        none-as-input (audit records may contain historical governance-signal values as recorded facts; surfaced to compliance only per §7.5; never used as a computation input)
Signals-Written:     none
Mutation-Inputs:     none
Monetization-Inputs: none
Routing-Impact:      none
Disclosure:          audit content to platform-compliance / Super Admin audience only; §7.5 compliant

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
Audit-Required: no    ← no business audit record produced by this read endpoint (§17.1)
Access-Flagging: yes  ← Doc-2 §9 (Platform) "Super Admin access (flagged)": recorded by the API middleware/gateway layer on staff_super_admin use, before this endpoint executes; infrastructure obligation, not a business Audit Requirements declaration (§17.1). [PA-m02]

### Entitlement References                          [added per PA-m03]
Entitlements: none    ← not entitlement-gated (Doc-4A §18.3)

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

## §B5 — Group 2: Audit Administration (`core.audit_records`)

`core.audit_records` is immutable and never deleted (Architecture §14.3–14.4; §17.5). The **only** permitted mutation is compliance-ordered **field redaction**, which blanks specific sensitive fields and records a **new** audit event. Template **21.6 Admin** (mutating). The redaction slug `staff_can_redact_audit` **exists** in Doc-2 §7 (no D-2 dependency here).

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
(The approval flow authorizing redaction — Architecture §14.3 — is an operational/compliance process; it is NOT modeled as a new entity. Authorization = staff_can_redact_audit slug + recorded reason + compliance basis.)

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
(Audit redaction blanks fields and appends a new audit record; `core.audit_records` is an append-only stream with no Doc-2 §5 state machine — §13 / Structure Patch F-03. Captured under Mutation-Scope, not as a state transition.)

### Idempotency
Idempotency:     required
Key-Scope:       platform
Window:          core.system_configuration.core.redaction_dedup_window       [PA-E1]
Replay-Result:   cached-response
(Replay safety — §14.3 joint rule: a replay within the window returns the original redaction result; no second redaction, no duplicate redaction audit record, no duplicate outbox event.)

### Concurrency
Concurrency: optimistic
Token:       updated_at

### Async Declaration
Execution: sync

### Events Produced
Events-Produced: none
(Doc-2 §8 designates no event for audit redaction; recorded as a new audit record, not a domain event. A consumer-facing event would require a Doc-2 §8 addition — escalation; none required.)

### Audit Requirements
Audit-Required:  yes
Actor-Types:     Admin
Action-Ref:      Doc-2 §9 (Platform) — "audit redaction (event)" (by pointer)
Attribution:     standard            ← Admin per §17.3
Mutation-Scope:  core.audit_records  (field redaction on target record + new redaction audit record)
Correlation:     both                ← reference_id + idempotency_key (§17.7)

### Entitlement References                          [added per PA-m03]
Entitlements: none    ← not entitlement-gated (Doc-4A §18.3)

### Operating Stage
Stage-Availability: all

### Rate Limits
Rate-Limits: none
```

Error codes: `core_audit_record_not_found` (NOT_FOUND), `core_audit_field_not_redactable` (BUSINESS), `core_audit_invalid_redaction_input` (VALIDATION), `core_audit_redaction_conflict` (CONFLICT).

---

## §B6 — Group 3: Outbox Dispatcher Contracts (`core.outbox_events`)

The transactional outbox is owned by Module 0; per-event *integration* contracts (21.2) are authored by producing modules (§4.4) and are **not** here. Module 0 authors the **delivery mechanism**: a dispatcher worker and an archival worker. Both are System-actor Phase-2 workers → Template **21.5** (`Response: none`; exempt from the `reference_id` Response mandate per FreezeAudit Patch v1.0.1 PATCH-FA-01).

**F-03 framing (frozen via Structure Patch v0.1.1):** `core.outbox_events` is an append-only stream with **no Doc-2 §5 state machine** (Doc-2 §2). The `pending → dispatched → archived` status values are defined in the Doc-2 §10.1 table schema; the workers declare **`State-Machine-Effects: none`** and capture status changes under **Mutation-Scope** (§17). No status value is invented.

**[D-5] Outbox Audit Granularity — `BOARD DECISION PENDING`:** the `Action-Ref` below binds to the generic Doc-2 §9 "service-role sensitive operations" at **dispatch-run/batch granularity** (never per delivered event — per-event audit would recursively audit the delivery of audit events). This interim binding is conformant with Template 21.5's mandatory audit; the run-vs-event granularity and a possible dedicated Doc-2 §9 action await the Board decision (§B2). Freeze of these two workers is gated on D-5.

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
this worker IS the delivery mechanism for outbox events (conformant 21.5 System/Phase-2; the
scheduled-vs-single-event shape is noted under D-1 friction, §B2).

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
(Delivery is at-least-once; consumers are idempotent per §16.7. The worker MUST NOT re-mark or double-deliver a row already in `dispatched`; the status transition is the dedup guard.)

### Async Declaration
Execution: sync       ← the worker is synchronous within itself (§15.5)

### Delivery, Retry & Reconciliation (operational — §15.6, §16.2, §16.8)
- Ordering: at-least-once delivery; causal-emission order is design intent only — consumers MUST tolerate any cross-aggregate order and duplicate delivery (§16.8). The dispatcher asserts no stronger ordering guarantee.
- Retry: on delivery failure, increment core.outbox_events.attempts (Doc-2 §10.1) and retry with backoff per core.system_configuration.core.outbox_dispatch_backoff [PA-E1].
- Dead-letter: after core.system_configuration.core.outbox_dispatch_max_attempts [PA-E1], park the row (retain in `pending` with attempts at max) and raise an ops alert per core.system_configuration.core.outbox_dlq_policy [PA-E1]. Never silently drop (§15.6 — handled within the infra status/attempts columns; no invented failure state).
- Reconciliation: a periodic sweep detects rows stuck in `pending` beyond the expected dispatch latency (attempts < max, no progress) and re-enqueues or alerts; this is operational telemetry, not a business audit action (§17.1). Bound to core.system_configuration.core.outbox_dispatch_backoff / _max_attempts [PA-E1]; no new entity or state.

### Events Produced
Events-Produced: none
(The dispatcher DELIVERS existing outbox events to declared consumers; it produces no new domain event. §16.6: "none" where Doc-2 §8 designates no event.)

### Audit Requirements
Audit-Required:  yes
Actor-Types:     System
Action-Ref:      Doc-2 §9 (Platform) — "service-role sensitive operations" (by pointer)   [D-5 — BOARD DECISION PENDING; bound at dispatch-RUN/batch granularity, never per event]
Attribution:     system
Mutation-Scope:  core.outbox_events (status column: pending → dispatched)
Correlation:     phase2-origin     ← carries the originating Phase-1 reference linkage of delivered events (§17.2)

### Entitlement References
Entitlements: none

### Operating Stage
Stage-Availability: all

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

### Failure Handling (operational)
Archival failure leaves the row in `dispatched` (idempotent retry on the next sweep); never deletes a non-archived row; no business event emitted (§15.6).

### Events Produced
Events-Produced: none

### Audit Requirements
Audit-Required:  yes
Actor-Types:     System
Action-Ref:      Doc-2 §9 (Platform) — "service-role sensitive operations" (by pointer)   [D-5 — BOARD DECISION PENDING; run/batch granularity]
Attribution:     system
Mutation-Scope:  core.outbox_events (status column: dispatched → archived)
Correlation:     phase2-origin

### Entitlement References
Entitlements: none

### Operating Stage
Stage-Availability: all

### Rate Limits
Rate-Limits: none
```

Error codes (internal): `core_outbox_archive_failed` (SYSTEM; retryable).

---

## §B7 — Group 4: ID Sequence Contracts (`core.id_sequences`)

Two identifier capabilities (Architecture §17.2; Doc-2 §0.1, §10.1): **UUIDv7 machine IDs** (algorithmic; no table, no contract) and **human-reference allocation** (`core.id_sequences`). Both are consumed within other modules' create commands — infrastructure primitives, not tenant-facing endpoints.

### Capability: UUIDv7 Machine Identifier Generation (no contract)

UUIDv7 is the only canonical machine identifier (§8.1; Architecture §17.2). Generation is algorithmic (time-ordered UUIDv7), invoked in-process at entity creation; it touches no table and exposes no callable contract. Identifiers never change and are never re-issued (§8.1). Consuming contracts simply declare `uuid` fields per §8. *(Documented for completeness; not a contract.)*

### Internal Infrastructure Service: Allocate Human Reference (D-1 composition)

Closest template: **21.4 Command** (`Audience: internal-service`). **[D-1] composition (BOARD DECISION PENDING):** an infrastructure primitive invoked inside the owning module's create-entity transaction, not a standalone business command; 21.4's mandatory business-audit and Events-Produced fields do not apply and are declared `none`/`n/a` with justification (non-recursion).

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
Bound to the caller's create transaction: a replayed create (same caller idempotency key, §14.3 joint rule) MUST NOT draw a second reference. Allocation participates in the caller's single transaction; on caller replay, no new allocation occurs. The service exposes no independent idempotency key.

### Audit / Events (non-recursion — [D-1])
Audit-Required: no  — allocation is part of the caller's audited create action (§17.1 operational-vs-business distinction); it produces no separate business audit record.
Events-Produced: none — the created entity's own command emits its corpus-defined events.

### Reference-format binding
Prefixes/formats bound to Doc-2 §0.1 and the Appendix B human_ref prefix registry; a new prefix requires a Doc-4A patch (Governance Note rule 5) — never invented here.
```

Error codes (internal): `core_idseq_unknown_entity_type` (VALIDATION — an entity_type absent from the Doc-2 §0.1 / Appendix B registry is a contract gap → escalate, never a runtime invention).

---

## §B8 — Group 5: System Configuration Contracts (`core.system_configuration`)

Module 0 owns the `core.system_configuration` **store**; **POLICY key definitions and values are owned by Doc-3 §12.2** — Module 0 stores, it never defines keys or values (§18.2). Two contracts: an internal runtime read and an Admin change.

**[D-4] Configuration Governance Boundary — `BOARD DECISION PENDING`:** Doc-2 §16.2 assigns "system configuration policy" to Module 8 (Admin Operations / Doc-4J); the frozen Doc-4B Structure §7.2 places the change contract in Doc-4B. Pass-B authors it here per the frozen Structure and flags the governance-ownership split (Module 8 *decides*; Module 0 *stores*) for the Board (§B2). No ownership is moved.

### Internal Infrastructure Service: Resolve Configuration Value (D-1 composition)

Closest template: **21.3 Query** (`Audience: internal-service`). Owning engines read POLICY values at runtime by key (§18.1–18.2; Architecture §17.3).

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

*PA-B01 integrated: the caller-supplied `formula_version_bump` field is removed; scoring relevance and the formula-version increment are service-determined; `formula_version_bumped` is returned for ops-dashboard visibility. Formula-version ownership remains with Trust (`trust.trust_scores.trust_formula_version`, Doc-2 §10.6) — not Module 0.*

```
## Contract: Change Configuration Value

### Header
Contract-ID:     core.admin_update_config_value.v1
Contract-Name:   Change Configuration Value
Owner-Module:    Platform Core / Shared Kernel (Module 0)   [D-4 — BOARD DECISION PENDING: governance authority may belong to Doc-4J per Doc-2 §16.2]
Actor-Types:     Admin
Version:         1
Status:          draft

### Required Permissions
Actor:        Admin
Membership:   n/a
Slugs:        staff_super_admin           ← Doc-2 §7 (existing). [D-2 — DOC-2 PATCH PENDING]: recommend staff_can_manage_system_configuration for least privilege
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
(Doc-3 §12.4 requires a formula_version increment for POLICY keys that affect scoring. Scoring relevance is determined SERVICE-SIDE from the key's metadata in the Doc-3 §12.2 registry — it is NOT a caller-supplied parameter. The service MUST determine whether the changed key is a scoring-formula input and, if so, trigger the Trust module's formula_version increment (trust.trust_scores.trust_formula_version, Doc-2 §10.6) through the integration single-authorship channel (domain event or service call) declared in Doc-4G/Doc-4E per Doc-4A §4. Formula-version ownership remains with Trust; Module 0 neither owns nor mutates it.)

### Response Contract
key                  : string    : always : the changed key
value_type           : string    : always
formula_version_bumped : boolean : conditional (key is scoring-relevant) : true if the service determined this change triggered a Trust formula_version increment per Doc-3 §12.4; absent when the key is not scoring-relevant
updated_by           : uuid      : always : acting staff user (Doc-2 §10.1 updated_by; server-populated)
updated_at           : timestamp : always : change time (concurrency token §10.2)
reference_id         : uuid      : always : platform-assigned UUIDv7 (§22.1 C-05 / P6-B01)

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
(Replay safety — §14.3 joint rule: a replay within the window returns the original result; no second config write, no duplicate audit record, no duplicate Trust formula-version trigger.)

### Concurrency
Concurrency: optimistic
Token:       updated_at

### Async Declaration
Execution: sync
(The Trust formula_version increment, where triggered, is a downstream effect via the §4 integration channel — declared in Doc-4G/Doc-4E, not here. This Phase-1 contract records only its own config write and audit.)

### Events Produced
Events-Produced: none
(Doc-2 §8 designates no event for configuration change; engines read values at runtime per Architecture §17.3. The Trust formula-version trigger, where applicable, uses the integration channel authored by the owning module per §4 — Doc-4B coins no event.)

### Audit Requirements
Audit-Required:  yes
Actor-Types:     Admin
Action-Ref:      Doc-2 §9 (Platform) — "system_configuration change" (by pointer)
Attribution:     standard
Mutation-Scope:  core.system_configuration
Correlation:     both                ← reference_id + idempotency_key (§17.7)

### Entitlement References                          [added per PA-m03]
Entitlements: none    ← not entitlement-gated (Doc-4A §18.3)

### Operating Stage
Stage-Availability: all

### Rate Limits
Rate-Limits: none
```

Error codes: `core_config_key_not_found` (REFERENCE), `core_config_value_out_of_bounds` (BUSINESS), `core_config_fixed_rule_not_settable` (BUSINESS), `core_config_invalid_input` (VALIDATION), `core_config_change_conflict` (CONFLICT).

---

## §B9 — Group 6: Feature Flag Contracts (`core.feature_flags`)

Module 0 owns `core.feature_flags` (Architecture §17.1; Doc-2 §3.1, §10.1). Doc-2 §16.2 does not assign flag management elsewhere, so flag management is cleanly a Module 0 surface (no D-4-type ownership flag). Two contracts: an internal evaluation read and an Admin set.

### Internal Infrastructure Service: Evaluate Feature Flag (D-1 composition)

Closest template: **21.3 Query** (`Audience: internal-service`). Modules evaluate flags at runtime to gate controlled rollout.

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
V8 : BUSINESS : unknown flag_key resolves to disabled (fail-safe), not an error : Architecture §17.1 : (no error; default disabled)

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
Slugs:        staff_super_admin           ← Doc-2 §7 (existing). [D-2 — DOC-2 PATCH PENDING]: recommend staff_can_manage_feature_flags for least privilege
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
flag_key      : string  : required : flag identifier (Doc-2 §10.1 flag_key)
enabled       : boolean : required : target state
scope         : object  : optional : scope_jsonb (Doc-2 §10.1); absent → global scope
change_reason : string  : required : structured reason; min length core.system_configuration.core.flag_change_reason_min_chars  [PA-E1]

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
(Doc-2 §8 designates no event for feature-flag change; modules evaluate flags at runtime. A change-notification event would require a Doc-2 §8 addition — escalation; none required.)

### Audit Requirements
Audit-Required:  yes
Actor-Types:     Admin
Action-Ref:      Doc-2 §9 (Platform) — "feature flag change" (by pointer)
Attribution:     standard
Mutation-Scope:  core.feature_flags
Correlation:     both                ← reference_id + idempotency_key (§17.7)

### Entitlement References
Entitlements: none

### Operating Stage
Stage-Availability: all

### Rate Limits
Rate-Limits: none
```

Error codes: `core_flag_invalid_input` (VALIDATION), `core_flag_change_conflict` (CONFLICT).

---

## §B10 — Group 7: Supporting Internal Infrastructure Contracts

The two cross-cutting Module-0 mechanisms every other module's contracts declare obligations against (Structure §3): the **audit-write** (target of every §17 Audit Requirements block) and the **transactional-outbox-write** (target of every §16.2 Events Produced block). Both are **Internal Infrastructure Services ([D-1] composition; closest template 21.4 Command, `Audience: internal-service`)**, invoked **within the caller's transaction**. They are infrastructure primitives — not standalone business commands — so 21.4's mandatory business-audit and Events-Produced fields are declared `none`/`n/a` with justification (non-recursion). UUIDv7 generation (§B7) and the config/flag reads (§B8/§B9) complete the §3 obligation set.

### Internal Infrastructure Service: Append Audit Record (D-1 composition)

```
## Internal Service: Append Audit Record
Audience:        internal-service (the mechanism every mutating contract's §17 Audit Requirements resolves to)
Service-ID:      core.append_audit_record.v1
Owner-Module:    Platform Core / Shared Kernel (Module 0)
Invoked-By:      any module's mutating contract, within that contract's transaction (§17.1)

### Inputs
Writes the Doc-2 §9 audit field set (by pointer; canonical representation defined in §B4) — actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent — populated from the caller's audited action. Field names/semantics owned by Doc-2 §9 (never restated).

### Effect (Mutation-Scope)
core.audit_records : append exactly one immutable row (Doc-2 §10.1; partitioned by month, time-ordered UUIDv7 PK). Append-only; never updated or deleted (§17.5; redaction is the separate core.admin_redact_audit_field contract).

### Idempotency (joint rule §14.3)
Bound to the caller's transaction: a safe replay of the caller's command MUST produce exactly one audit record — the original (§14.3 condition 2). No independent dedup; participates in the caller's single transaction.

### Audit / Events (non-recursion — [D-1])
Audit-Required: n/a — this IS the audit mechanism; it does not recursively audit itself.
Events-Produced: none — appending audit does not emit a domain event (audit ≠ events, §17.6).

### Non-disclosure
The caller is responsible for not placing protected facts in fields beyond what Doc-2 §9 and §7.5 permit; redaction (§B5) governs later field blanking.
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
core.outbox_events : insert exactly one row with status = `pending` (Doc-2 §10.1 — event_name, event_version, payload_jsonb, status, attempts) inside the caller's transaction. Delivery is asynchronous via the dispatcher (§B6).

### Idempotency (joint rule §14.3)
Bound to the caller's transaction: a safe replay of the caller's command MUST NOT write a second outbox event — the original stands (§14.3 condition 3). No independent dedup key.

### Audit / Events (non-recursion — [D-1])
Audit-Required: n/a — writing the outbox is the emit mechanism; the business action is audited by the caller (§17), not by this service.
Events-Produced: n/a — this service IS the event-write primitive; it does not itself "produce" a further event.

### Ownership / validation
Persists the row structurally; does not validate business semantics. The caller (owning module per §16.6) is responsible for event ownership, thin-payload compliance (§16.5), and the Privacy-Review assertion (§16.3). A non-existent event_name is a caller-side conformance failure (§16.4 escalation), not a runtime invention.
```

Error codes (internal): `core_outbox_write_failed` (SYSTEM; the caller's transaction rolls back — the business write cannot commit without the outbox row, §16.2).

---

## §B11 — Operational Readiness (cross-cutting hardening; no new contracts)

This section consolidates the operational behavior already specified per-contract; it introduces no new contract, entity, event, or state. It is the Pass-4/5 operational-maturity view for implementers and reviewers.

**O-1 — Idempotency replay determinism (§14.3 joint rule).** Every mutating contract (`core.admin_redact_audit_field`, `core.admin_update_config_value`, `core.admin_set_feature_flag`) and every Phase-2 worker (`core.phase2_dispatch_outbox_events`, `core.phase2_archive_dispatched_events`) declares `Idempotency: required` with a `[PA-E1]` dedup-window key. A safe replay within the window returns the original result and produces **no** second state effect, **no** duplicate audit record, and **no** duplicate outbox event. Dedup is applied at the application layer before any transaction begins (§14.3). The internal primitives (`core.append_audit_record`, `core.write_outbox_event`, `core.allocate_human_reference`) inherit the caller's transaction and emit nothing on replay.

**O-2 — Outbox processing & ordering.** At-least-once delivery; consumers MUST be idempotent (§16.7) and tolerant of any cross-aggregate order and duplicate delivery (§16.8). The dispatcher (§B6) asserts no stronger ordering. Causal-emission order is design intent only.

**O-3 — Retry, dead-letter & reconciliation (outbox).** Retry-with-backoff on the `attempts` column; park-with-ops-alert after max attempts (no silent drop, §15.6); periodic reconciliation sweep for stuck-`pending` rows. All thresholds bind to `core.system_configuration.core.outbox_*` keys `[PA-E1]`. No invented failure state; behavior lives in the existing `status`/`attempts` columns (Doc-2 §10.1).

**O-4 — Failure handling discipline (§15.6).** Phase-1 effects are never rolled back when a downstream/async step fails; there is no universal "error" state; no compensating command is invented — Module 0 has no Doc-2 §5 state machine, so failures are handled in the infrastructure `status`/`attempts` columns (outbox) or by the caller's transaction rollback (internal primitives). Operational telemetry (§17.1) — not business audit — records infrastructure failures.

**O-5 — Configuration governance behavior (Doc-3 §12.4).** Every config change via `core.admin_update_config_value` is admin-permissioned, audited (old/new) under Doc-2 §9 "system_configuration change", and — where the key is scoring-relevant — triggers a Trust `formula_version` increment **service-side** via the §4 integration channel (Doc-4G/Doc-4E), surfaced through `formula_version_bumped`. Effective-date and ops-dashboard visibility are Doc-3 §12.4 operational obligations satisfied by the audit record + response field. Per-cell overrides (Doc-3 §12.4) are read via `core.config_value_query` by key; Module 0 stores, Doc-3 governs.

**O-6 — Feature-flag governance behavior.** Flag changes are admin-permissioned and audited (Doc-2 §9 "feature flag change"); evaluation is fail-safe (unknown flag → disabled); the firewall holds — flags gate rollout/visibility only, never trust/eligibility/routing/matching (§18.3, §4B).

**O-7 — Audit integrity.** Audit is append-only and never bypassed (Architecture §14; §17.1); the only mutation is compliance redaction (§B5), itself audited; Super-Admin read access is flagged at the middleware layer (§B4, `Access-Flagging`). The audit-write primitive (§B10) is atomic with each caller's mutation.

---

## §B12 — Cross-Reference Index (canonical pointers)

Every Pass-B binding point resolves to a frozen source. Version identifiers are canonical (Consistency Patch v1.0.2): Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 FROZEN.

| Binding point (Pass-B) | Authoritative source |
|---|---|
| Module 0 entities & lifecycles | Doc-2 §3.1, §10.1; Architecture §17.1 |
| "Infrastructure only / no aggregates" | Doc-2 §2; Architecture §17; Doc-4A §4.3 (CHK-007) |
| Audit field set & actor types | Doc-2 §9; Architecture §14.2 |
| Audit redaction (permanence vs field blanking) | Architecture §14.3; Doc-4A §17.5 |
| Audit actions (`audit redaction (event)`, `system_configuration change`, `feature flag change`, `service-role sensitive operations`, `Super Admin access (flagged)`) | Doc-2 §9 (Platform row) |
| Outbox mechanism & status lifecycle | Doc-2 §10.1; Architecture §15.1; Doc-4A §16.2 |
| Outbox = no §5 state machine (Mutation-Scope framing) | Doc-2 §2; Doc-4A §13; Structure Patch v0.1.1 F-03 |
| 21.5 `Response: none` carve-out | Doc-4A FreezeAudit Patch v1.0.1 PATCH-FA-01 |
| `reference_id` Response mandate | Doc-4A §22.1 C-05 as amended by Pass 6 Patch v1.0.1 P6-B01 |
| UUIDv7 + human_ref allocation | Architecture §17.2; Doc-2 §0.1, §10.1, §11 rule 8; Doc-4A §8 |
| human_ref prefixes | Doc-2 §0.1; Doc-4A Appendix B |
| POLICY key referencing (`core.system_configuration.<domain>.<key>`) | Doc-4A §18.2; Doc-3 §12.2 ([PA-E1]: `core.*` block unregistered → PA-M3) |
| FIXED/POLICY/ORG; firewall (config/flag never gate trust/routing) | Doc-3 §12.1–12.4; Doc-4A §4B, §18.3, §18.5 |
| Formula-version ownership | `trust.trust_scores.trust_formula_version`, Doc-2 §10.6; Doc-3 §12.4 |
| Permission slugs (`staff_can_redact_audit`, `staff_super_admin`) | Doc-2 §7 ([D-2]: config/flag/audit-read least-privilege slugs pending) |
| Admin context (no org; Admin-Scope; Compliance-Basis) | Doc-4A §5.6 |
| Error taxonomy & envelope | Doc-4A §12.1–12.2; `core_` namespace Appendix B §B.2 |
| Validation order (V1–V9) | Doc-4A §11.2 |
| Idempotency joint rule | Doc-4A §14.3 |
| Audit / event declaration grammar | Doc-4A §16.3, §17.2 |
| Templates 21.3/21.4/21.5/21.6 | Doc-4A §21 (+ Pass5 Patch v1.0.1 registry extension) |
| Config governance ownership tension | Doc-2 §16.2 ([D-4] pending) |

---

## §B13 — Self-Review (pre–Independent-Architecture-Review)

*Non-normative. Pass-B is hardening, not expansion: all Pass-A in-document findings are integrated; the carried governance/upstream items are tracked (§B2), not resolved by invention (Doc-4A §0.6).*

### B13.1 — Validation across the ten required dimensions

| Dimension | Result | Notes |
|---|---|---|
| Ownership integrity | PASS | Only `core.*` entities. PA-B01 integration **removes** any implied Module-0→Trust formula trigger; formula-version ownership stays in Trust (Doc-2 §10.6). Config-governance ownership tracked ([D-4]), not moved. |
| Module boundary integrity | PASS | Per-event 21.2 integrations deferred to producing modules (§4.4); no non-Module-0 entity created or transitioned; the Trust formula bump is via the §4 integration channel, declared in Doc-4G/Doc-4E. |
| Contract completeness | PASS | All 13 contracts/services carry the full applicable template field set: request, response (with `reference_id`), error envelope (§12.1) + Error-Boundary, validation (V1–V9 as applicable), idempotency, audit, entitlement (`Entitlements: none` on all five Admin contracts — PA-m03 integrated), firewall (both audit reads now declare it — PA-m01 integrated), operating stage, rate limits. Pagination grammar present on the list query. |
| Template correctness | PASS | 21.6 Admin (audit reads/redaction/config/flag), 21.5 System (outbox workers; `Response: none` per PATCH-FA-01), 21.3/21.4 [D-1] composition for internal services. Pass-A review dismissed the 21.3-vs-21.6 concern (21.6 correct for Admin reads). |
| Audit correctness | PASS (w/ tracked BLOCKER) | Mutating contracts audited with existing Doc-2 §9 actions; redaction → "audit redaction (event)"; config → "system_configuration change"; flag → "feature flag change"; Super-Admin read flagging declared (PA-m02). Outbox worker `Action-Ref` interim-bound at run granularity — **[D-5] BOARD DECISION PENDING** (freeze gate). |
| Event correctness | PASS | No event coined (§16.4); `Events-Produced: none` where Doc-2 §8 designates none; outbox-write primitive honors §16.2 atomicity; dispatcher delivers, does not produce; per-event integrations deferred (§4.4). |
| Idempotency correctness | PASS (w/ tracked BLOCKER) | All commands `Idempotency: required`; queries `not-applicable`; workers platform-scope; joint rule §14.3 honored and consolidated in O-1; internal primitives bound to caller's transaction. Dedup-window keys are `core.*` — **[PA-E1]/PA-M3 DOC-3 PATCH PENDING** (freeze gate). |
| AI-agent safety | PASS | No invented slug/POLICY key/event/template/entity. Open dependencies surfaced inline ([D-1], [D-2], [D-4], [D-5], [PA-E1]) — no hidden assumptions or silent resolutions. Non-canonical citations eliminated; `reference_id` mandate satisfied (21.5 exempt). No unresolved `TBD`/placeholder. |
| Cross-reference correctness | PASS | Canonical version identifiers (Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0) per Consistency Patch v1.0.2; §B12 indexes every binding to its frozen source; all audit-action, slug, and template bindings resolve (the only unregistered binding is the `core.*` POLICY block, explicitly tracked as PA-M3). |
| Freeze-readiness progress | ADVANCED | Pass-4+5 maturity achieved: operational readiness (§B11), cross-reference index (§B12), and AI-agent execution safety hardened. In-document findings closed; freeze gated only on the tracked upstream/governance items. |

### B13.2 — Findings classification

**No new in-document findings are introduced by Pass-B.** All Pass-A in-document findings (PA-B01, PA-m01, PA-m02, PA-m03) are integrated and closed. Outstanding items are the **carried, tracked** governance/upstream dependencies (§B2):

| ID | Severity | Status | Channel | Freeze gate |
|---|---|---|---|---|
| PA-M3 — Infrastructure Key Registration | BLOCKER | DOC-3 PATCH PENDING | Doc-3 §12.2 additive patch (`core.*` key block) | Yes — affected contracts |
| D-5 — Outbox Audit Granularity | BLOCKER | BOARD DECISION PENDING | Board decision (run-granularity / dedicated Doc-2 §9 action / Doc-4A clarification) | Yes — outbox workers |
| D-1 — Template Composition Convention | MAJOR | BOARD DECISION PENDING | Board decision (ratify composition / accelerate Internal Service Template) | No |
| D-2 — Permission Granularity | MAJOR | DOC-2 PATCH PENDING | Doc-2 §7 additive patch (least-privilege `staff_*` slugs) | No (interim `staff_super_admin` valid) |
| D-4 — Configuration Governance Boundary | MAJOR | BOARD DECISION PENDING | Board decision (Doc-4B end-to-end vs Doc-4J governance + Doc-4B write) | No |

### B13.3 — Constraint compliance

No architecture redesign; no module/ownership boundary modified; no new entity, aggregate, event, workflow, state machine, permission, template, or domain created; Doc-4A not reopened; Family Map unchanged. All five `core` entities are covered; no contract outside Module 0. Reference-never-restate applied throughout.

**Disposition:** Pass-B is **ready for Independent Architecture Review**. It carries 2 BLOCKER and 3 MAJOR items as explicitly tracked governance/upstream dependencies (resolved only through their named channels); it introduces no new findings and resolves all Pass-A in-document findings. Contract freeze is gated solely on PA-M3 (Doc-3 §12.2 registration) and D-5 (outbox audit-action decision).

---

*End of Doc-4B Content v1.0 — Pass-B (Module 0 — Platform Core / Shared Kernel). Combined Pass-4 + Pass-5 maturity: contract / governance / cross-reference / operational hardening, AI-agent execution safety, freeze-readiness. Supersedes Pass-A with PA-Patch v1.0.1 and Consistency Patch v1.0.2 integrated. Tracked: PA-M3, D-5 (BLOCKER, freeze-gated); D-1, D-2, D-4 (MAJOR). No new findings; ready for Independent Architecture Review.*
