# Doc-4A — API Standards & Conventions — Content v1.0, Pass 5 (§18–§21, Appendices A–C)

| Field | Value |
|---|---|
| Document | Doc-4A — API Standards & Conventions |
| Pass | 5 of N — §18, §18B, §19, §20, §21, Appendix A, Appendix B, Appendix C only |
| Structure | Conforms to Doc-4A_Structure_v1.0_FROZEN.md |
| Builds On | Pass 1 (§0–§3, FROZEN), Pass 2 (§4–§8, FROZEN), Pass 3 (§9–§12, FROZEN, Patch v1.0.1 applied), Pass 4 (§13–§17, FROZEN, Patch v1.0.1 applied) — notation per §3.3, keywords per §3.4, citations per §3.5 |
| Authority | Doc-4_Governance_Note_v1.0.md |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2 — all FROZEN |
| Contains | Standards only — no entities, no workflows, no endpoints |
| Audience | Claude Code, Cursor, AI development agents, backend, frontend, QA engineers |
| Review Findings | Recorded below; all BLOCKER/MAJOR resolved in this text |

---

## §18 — Policy, Configuration & Entitlement Binding Standard

### 18.1 The FIXED / POLICY / ORG Trichotomy

Platform behavior governed by the contract layer is classified into exactly three categories (Doc-3 §12, by pointer). Contracts **MUST** declare which category governs each tunable aspect of their behavior. These categories are not interchangeable:

| Category | Definition | Contract declaration | Override authority |
|---|---|---|---|
| **FIXED** | Invariant platform rule; enforced in code and CI. No operational override. | Stated as a non-negotiable precondition; the contract MUST NOT treat it as configurable | None — escalation (§0.6) required to change |
| **POLICY** | Platform-wide tunable value, stored in `core.system_configuration`. Changes require a platform operator decision, not a tenant action | Referenced by `core.system_configuration.<key_name>` key; never by value | Platform operator via configuration deployment |
| **ORG** | Per-organization setting, stored under the owning entity's organization record (Doc-2 §0.4). Read from the organization's context at execution time | Referenced by the organization setting key, cited by pointer to its owning module's configuration contract | Organization owner/admin within limits set by POLICY |

### 18.2 POLICY Key Referencing Rules

Contracts that bind to tunable limits **MUST** reference them as POLICY keys. This applies without exception to: quota limits, rate windows, retention periods, collection bounds, deduplication windows, feature gates, and any other limit whose value changes per environment, plan, or platform configuration.

**POLICY key referencing format:**

```
core.system_configuration.<domain>.<key_name>
```

Where `<domain>` is the owning policy domain (per Doc-3 §12.2 key catalog, by pointer) and `<key_name>` is the specific key. Contracts **MUST** use the exact key name defined in Doc-3 §12.2; inventing key names in a Doc-4 document is nonconforming.

**Rules:**

- A contract **MUST NOT** hardcode a numeric value for any limit. The literal value appears only in `core.system_configuration` and only platform operators may change it.
- A contract **MUST NOT** interpolate or compute a limit value inline from other values. Each limit is a single named key.
- Where two contracts depend on the same limit, they reference the same POLICY key independently. Key sharing is expected; key duplication (creating a parallel key for the same semantic limit) is nonconforming.
- If a required limit has no key in Doc-3 §12.2, the contract author **MUST** apply flag-and-halt (§0.6) and escalate for a Doc-3 patch — inventing POLICY keys in Doc-4 is a conformance failure.

### 18.3 Entitlement Referencing Rules

Plan-based feature gating uses entitlement keys, not plan names. Contracts **MUST NOT** condition behavior on a plan name (`"growth_plan"`, `"enterprise_plan"`, etc.); entitlement checks are expressed as:

```
Entitlement-Gate: <entitlement_key> via Monetization service (Doc-4I)
```

Where `<entitlement_key>` is a key defined in the Monetization module's entitlement catalog (Doc-4I, by pointer when authored). The entitlement check is a runtime call to the Monetization service; the calling contract declares the key it checks and nothing about plan structures or price points.

**Entitlements MAY gate only** (ADR-011; Doc-3 §12.1; §4B.2):
- Feature availability (access to a contract surface or module capability)
- Visibility volume (number of records shown per result set)
- Analytics depth or reporting export
- Advertising and sponsored placement surfaces
- Microsite capabilities and customization

**Entitlements MUST NOT gate** (invariants — FIXED, not POLICY):
- Trust evaluation, verification decisions, or trust score components
- Vendor eligibility for routing
- Routing fairness or matching probability
- Matching Confidence computation (§4B.1 carve-out)
- Access to the platform's non-disclosure obligations (§7.5)

A contract that conditions trust, eligibility, routing, or verification on any entitlement key is nonconforming and **MUST** be escalated (§0.6).

### 18.4 ORG Setting References

ORG settings are per-organization configuration values owned by the organization and stored in its configuration record (Doc-2, by pointer). A contract that reads an ORG setting **MUST** declare:

- The setting name, by pointer to its owning module's configuration contract
- Whether the setting is bounded by a POLICY key (most ORG settings have POLICY-defined ceiling and floor values)
- The read behavior when the setting is absent (server default, cited by POLICY key)

ORG settings **MUST NOT** be used as substitutes for POLICY keys. The distinction: a POLICY key applies platform-wide and changes only by platform operator action; an ORG setting applies per-tenant and changes by organization owner action within POLICY-defined bounds.

### 18.5 FIXED Rule Declaration

Contracts that apply FIXED invariants (Doc-3 §12.1 FIXED; §4B.2 firewall invariants; §15.4 no-fabricated-activity) **MUST** declare them as non-overridable preconditions. The declaration in a contract's Validation Rules **MUST** cite the FIXED source:

```
V<n> : BUSINESS : <condition — FIXED per Doc-3 §12.1 by pointer; no POLICY override> : Doc-3 §12.1 : BUSINESS
```

A contract **MUST NOT** treat a FIXED rule as a POLICY key, provide an override mechanism, or include the FIXED condition in an entitlement gate. FIXED rules are CI-enforced invariants; they apply regardless of plan, environment, stage, or configuration.

---

## §18B — Platform Operating Stage Contract Behavior Standard

### 18B.1 Operating Stage Model

The iVendorz platform operates across three maturity stages, each reflecting a different degree of marketplace automation (Doc-3 §0, by pointer):

| Stage value | Name | Characterization |
|---|---|---|
| `stage_a` | Founder-Assisted Marketplace | High human involvement in routing, matching, and operational decisions |
| `stage_b` | Assisted Marketplace | Partial automation; human oversight of high-stakes decisions |
| `stage_c` | Autonomous Marketplace | Full automation; human intervention is exception-handling only |

The current platform operating stage is determined by the POLICY key `platform.operating_stage`. This is a platform-operator decision, not a tenant configuration.

### 18B.2 Stage Declaration Grammar

A contract that is not available at all operating stages **MUST** declare its availability. A contract with no stage declaration is assumed available at all stages (`all`):

```
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b | stage_c
Stage-Behavior:     core.system_configuration.<key> | none
```

- `Stage-Availability` declares the operating stage(s) at which the contract is activated. `stage_b | stage_c` declares availability at Stage B and Stage C only (not Stage A). A contract not available at the current stage returns `BUSINESS` error with a corpus-defined code (not a 404 pattern — the endpoint exists, it is not activated).
- `Stage-Behavior` names a POLICY key whose value changes between stages, if the contract's behavior (not its existence) varies. If the contract behavior is stage-invariant, declare `none`.

### 18B.3 What Stage Declarations Govern

Stage declarations govern **activation and availability only**. They **MUST NOT** alter:

- Entity ownership or module ownership assignments
- Workflow definitions or state machine transitions
- Authorization requirements (slugs, memberships, scopes)
- Non-disclosure obligations (§7.5 — FIXED across all stages)
- Trust, verification, eligibility, or routing rules (§4B — FIXED across all stages)

A Stage-A contract performing human-assisted routing applies all identical: blacklist/exclusion rules (§7.5), trust firewall rules (§4B.2), delegation attribution rules (§6B.3), and audit obligations (§17). Human assistance never creates a bypass of platform invariants.

### 18B.4 Stage Transition Rules

Stage transitions are platform decisions executed by a platform operator through a configuration deployment updating `platform.operating_stage`. Stage transitions:

- **MUST NOT** be triggerable by any tenant action or through any tenant-facing contract
- **MUST NOT** be triggerable by any Admin contract (stage transitions are operational, not moderation)
- **MUST NOT** create or destroy entities, states, or workflows — they activate or deactivate contract surfaces and adjust POLICY-bound behavior values
- **MUST** be atomic with respect to the POLICY key change: no contract surface is in an indeterminate activation state

No Doc-4 module document **MAY** define a "stage-switch" command or a contract whose purpose is to advance or revert the platform operating stage. Such a contract would be a platform-operator concern, not a module contract concern.

### 18B.5 Stage-Sensitive POLICY Binding

Where a contract's behavior varies by stage (e.g., automated routing engagement, matching confidence threshold), the variation **MUST** be expressed as a POLICY key whose value the platform operator sets per stage configuration. The contract declares the POLICY key; the platform operator sets its value for each stage deployment.

A contract **MUST NOT** embed stage-conditional logic inline (no `if stage_a then … else …`). Stage-sensitive behavior is POLICY-bound; stage-conditional code is an implementation concern, not a contract concern.

---

## §19 — Rate Limiting, Quota & Abuse Control Declaration Standard

### 19.1 Scope

This section defines how contracts declare throughput controls and quota limits. Actual limit values are POLICY-governed (§18.2); this section defines only the declaration format, the attribution model, the error alignment, and the retry semantics.

### 19.2 Quota vs Throughput Distinction

All limit-based validation (§11.2 Category 9) is classified as one of two types. Contracts **MUST** declare the type for every V\<n\> rule in Category 9:

| Type | Definition | Error class | Retryable default | Example |
|---|---|---|---|---|
| **quota** | A finite entitlement consumed from an allocation; time passing alone does not restore it | `QUOTA` | false (requires external state change: plan upgrade, platform-actor reset) | Number of active vendor profiles per organization |
| **throughput** | A rate window that resets on a POLICY-declared schedule | `RATE_LIMITED` | true, after the declared reset interval | API calls per minute; quotation submissions per hour |

A contract **MUST NOT** return `QUOTA` for a throughput limit or `RATE_LIMITED` for a quota limit. The declaration drives the error class, the retryability flag, and the client's recovery guidance.

### 19.3 Rate Limit Declaration Grammar

Every contract with a Category 9 validation rule **MUST** include a Rate-Limit block for each V\<n\> limit rule:

```
Rate-Limit:
  V<n>-Type:      quota | throughput
  Policy-Key:     core.system_configuration.<key>
  Attribution:    organization | delegation-controlling-organization | platform
  Reset-Interval: core.system_configuration.<reset_key> | not-applicable
  Error-Class:    QUOTA | RATE_LIMITED
```

- `V<n>-Type` identifies the corresponding validation rule by its V\<n\> identifier (§11.1).
- `Policy-Key` names the `core.system_configuration` key governing the limit (§18.2). Absent a defined key → escalate.
- `Attribution` declares who the consumption is charged to. Three values:
  - `organization` — the active organization in the request context
  - `delegation-controlling-organization` — for delegated operations (§6B.3): quota charged to the vendor profile's Controlling Organization, not the acting representative organization
  - `platform` — platform-wide limit with no per-organization attribution (rare; must cite corpus basis)
- `Reset-Interval` for throughput limits: the POLICY key governing the window duration (e.g., `core.system_configuration.auth.api_rate_window_seconds`). For quota limits: `not-applicable`.
- `Error-Class` must match V\<n\>-Type: `quota` → `QUOTA`; `throughput` → `RATE_LIMITED`.

### 19.4 Quota Attribution and Delegation

For delegation-eligible contracts (§6B), quota attribution follows the principle: **representatives act; owners pay** (Master Architecture §7.4). Specifically:

- Quota consumed by a delegated action is charged to the **Controlling Organization** of the vendor profile under which the action is taken — not to the acting representative organization.
- The `attribution: delegation-controlling-organization` value in the Rate-Limit block declares this. It binds the `QUOTA` error (when triggered) to the correct party: the error **MUST** reference the Controlling Organization's quota state, not the representative's.
- `QUOTA` error details: quota party disclosed only to parties entitled to see it (§12.5). The Controlling Organization (the quota owner) **MAY** be told they are at limit; the representative **MUST NOT** see quota state of the Controlling Organization unless their grants authorize it.

### 19.5 Hardcoded Limits Prohibition

The following are conformance failures in any Doc-4 document:

| Prohibited | Governing rule |
|---|---|
| Hardcoded numeric quota value (e.g., `max_quotations: 5`) | §18.2 |
| Hardcoded rate window value (e.g., `60 requests per minute`) | §18.2 |
| Hardcoded retention period (e.g., `30 days`) | §18.2 |
| Hardcoded collection bound (e.g., `max items: 100`) | §9.3; §18.2 |
| Plan name as the limit condition (e.g., `if plan == "growth"`) | §6.2; §18.3 |
| Limit type misclassification (RATE_LIMITED for a quota; QUOTA for a throughput) | §19.2; §12.2 |

---

## §20 — Contract Versioning & Evolution Standard

### 20.1 Contract Version vs Domain Version

Contract versioning governs changes to how a module exposes its entities (the contract surface). It is distinct from domain versioning — changes to entities, state machines, events, or permissions, which require Doc-2 or Doc-3 patch processes. Mixing the two is the primary evolution failure mode:

- A **contract change** is a change to a Doc-4 document's field declarations, validation rules, error behavior, or template fields, without altering any underlying entity, state, event, or permission in Doc-2 or Doc-3.
- A **domain change** is a change that requires a Doc-2 or Doc-3 patch first, then a corresponding Doc-4 update reflecting the expanded corpus.

A Doc-4 contract update that references an entity, state, event, permission slug, or POLICY key that does not yet exist in the frozen corpus is nonconforming. Domain changes always precede the contract updates that surface them.

### 20.2 Change Classification

Every change to a frozen Doc-4 contract is classified before the patch is written. The classification determines the version bump requirement and the migration window:

| Change type | Classification | Version bump | Consumer migration |
|---|---|---|---|
| Typo/wording correction with no semantic change | Editorial | None | None |
| New optional response field (backward-compatible) | Additive | None | None (consumers tolerate unknown optional fields) |
| New optional request field | Additive | None | None |
| Add a new Event to Events Produced (new contract emission) | Additive | None | New consumer declarations required |
| New optional enum value for a filter/sort parameter | Additive | None | Consumers must declare tolerance (§16.7 analogous) |
| New required request field | Breaking | Bump | POLICY-bounded migration window |
| Remove any field (request or response) | Breaking | Bump | POLICY-bounded migration window |
| Change field type or semantics | Breaking | Bump | POLICY-bounded migration window |
| Add new error code within existing class | Additive (namespace registration required) | None | Clients branch on error_class, not error_code |
| Change error_code value (rename) | Breaking | Bump | All consumers updated |
| New enum value in entity state (affects state machine) | Domain change | N/A — Doc-2 §5 patch first | Post-patch contract update |
| New entity or aggregate | Domain change | N/A — Doc-2 patch first | Post-patch contract update |
| New state transition | Domain change | N/A — Doc-2 §5 patch first | Post-patch contract update |
| New permission slug | Domain change | N/A — Doc-2 §7 patch first | Post-patch contract update |
| New event name | Domain change | N/A — Doc-2 §8 patch first | Post-patch contract update |
| New POLICY key | Domain change | N/A — Doc-3 §12 patch first | Post-patch contract update |
| New error class | Architecture change | N/A — Doc-4A §12 patch first | All module documents updated |
| New template field | Doc-4A change | N/A — Doc-4A §21 patch first | All module documents conform |
| Mark a contract as deprecated | Additive (withdrawal declared) | None | Deprecation notice; migration window begins |
| Remove deprecated contract after migration window closes | Breaking (scheduled) | N/A at removal — window preceded it | Migration window complete before removal |

**Decision rule:** if in doubt whether a change is a contract change or a domain change, apply flag-and-halt (§0.6) and escalate. A Doc-4 change that silently extends the domain is the highest-risk evolution error.

### 20.3 Version Bump Mechanics

- Contract versions are integers ≥ 1. The first frozen version of any contract is `1`.
- A version bump is applied by incrementing the `Version:` field in Template 21.1. The Contract-ID **SHOULD** encode the version (e.g., `rfq.submit_rfq.v2`).
- Breaking changes create a new contract version, not a new contract name. The prior version remains in the document as a deprecated entry until the migration window closes and consumers have migrated.
- Editorial and additive changes do not bump the version. The contract ID and version are stable.

### 20.4 Deprecation Pattern

A deprecated contract **MUST** carry a `Deprecated:` header field with exactly:

```
Deprecated:       true
Deprecated-At:    <ISO-8601 date of deprecation decision>
Removal-Window:   core.system_configuration.<deprecation_window_key>
Successor:        <Contract-ID of the replacement> | none (no successor — operation removed)
```

A deprecated contract is still conforming and still enforced. Removal before the declared `Removal-Window` closes is a breaking change requiring escalation (§0.6). After the window closes and consumers have migrated, the contract is removed via a Doc-4 patch.

A contract surface that still has active callers **MUST NOT** be removed at window-close without escalation, regardless of elapsed time.

### 20.5 AI-Agent and Freeze Compatibility

The evolution rules above are absolute constraints for AI coding agents operating on Doc-4 documents:

- An AI agent **MUST NOT** make domain changes (new entity, event, state, slug, POLICY key) as part of a Doc-4 contract update. Domain changes require a human-initiated corpus change process.
- An AI agent **MUST NOT** remove or rename a stable field, error_code, or contract in a FROZEN document — only additive or editorial changes are permitted without a breaking-change flag.
- Any generated contract update that cannot be classified against the table in §20.2 **MUST** be flagged as an escalation (§0.6) rather than merged.

---

## §21 — Canonical Contract Templates

> **Governance Note — Template Registry Extension (Pass 5 Patch v1.0.1, PATCH-01):** The frozen Structure (Doc-4A_Structure_v1.0_FROZEN.md §21) registers four templates: 21.1 Endpoint Contract (MANDATORY), 21.2 Integration Contract (MANDATORY), 21.3 Internal Service Contract (RECOMMENDED), and 21.4 Event Schema Declaration (RECOMMENDED). Pass 5 introduces Templates 21.3 Query, 21.4 Command, 21.5 System Actor, and 21.6 Admin as **normative specializations of Template 21.1**. These specializations extend the template registry. They introduce no new entities, state machines, state transitions, permission slugs, events, workflows, POLICY keys, or ownership assignments. The Structure's RECOMMENDED templates (Internal Service Contract and Event Schema Declaration) are deferred to a future Doc-4A patch; they are not superseded by this extension. A Structure patch formalizing the extended registry is recommended as a follow-on action before the Doc-4A final freeze.

Templates in this section are **normative**. All Doc-4B through Doc-4N documents **MUST** use the applicable template(s) for every contract they define. Deviation from a template's field set, field order, or fill grammar is a conformance failure (Appendix A, CHK-231 through CHK-236).

**Template selection guide:**

| Contract purpose | Mandatory template |
|---|---|
| Any endpoint (base — all mutations and queries) | 21.1 |
| Event-driven integration (source module authoring event production or consumption) | 21.2 |
| Pure query (no mutations, no write side effects) | 21.3 (specializes 21.1) |
| Mutating command (creates, updates, or state-transitions an entity) | 21.4 (specializes 21.1) |
| Phase-2 async worker (System-actor execution under background processing) | 21.5 (specializes 21.4) |
| Admin operation (platform-staff action) | 21.6 (specializes 21.1) |

Templates 21.3–21.6 are specializations of 21.1. A contract authored against 21.3–21.6 satisfies the 21.1 requirement; a contract that does not conform to the applicable specialization is nonconforming even if it conforms to 21.1.

---

### Template 21.1 — Endpoint Contract (MANDATORY)

All contract fields are mandatory unless annotated `[CONDITIONAL]` (include only when the stated condition applies) or `[OMIT-IF-NONE]` (may be replaced by the "none" declaration when inapplicable).

```
## Contract: <Human-Readable Contract Name>

### Header
Contract-ID:     <module-prefix>.<operation-name>.v<integer>
Contract-Name:   <Human-readable name — operation verb + entity noun>
Owner-Module:    <module name per §1.3>
Actor-Types:     <User | Admin | System | AI Agent — from closed set §5.2>
Version:         <integer ≥ 1>
Status:          draft | approved | deprecated

### Required Permissions
Actor:        <User | Admin | System | AI Agent>
Membership:   <active membership required in active organization | n/a>
Slugs:        <slug1 AND slug2; from Doc-2 §7 by pointer> | n/a
Scope:        <resource-scope condition citing owning entity's organization_id or
               governing grant table per §7.3>
Delegation:   not eligible |
              eligible — grant check per §6B.2; vendor-profile scope; <grant type>

### Delegation Declaration [CONDITIONAL — include only if Delegation: eligible]
Grant-Type:      <grant type per Doc-2 §5.10, by pointer>
Permission-Set:  <required slugs in the grant's permission_set, from Doc-2 §7>
Vendor-Scope:    <vendor profile anchor — the grant's target entity per §6B.2 rule 4>
Attribution:     all four §6B.3 attributions apply: acting user + representative org +
                 vendor profile + controlling organization

### Firewall-Compliance Declaration [CONDITIONAL — include only if contract touches any governance signal]
Signals-Read:         <signal name(s) via <owner module> Query | none>
Signals-Written:      <signal name(s) — this contract's Owner Module only | none>
Mutation-Inputs:      none | <enumerated inputs with Doc-2/Doc-3 source pointers>
Monetization-Inputs:  none | <entitlement key(s), gating visibility/volume/feature only per §18.3>
Routing-Impact:       none | <pipeline binding per Doc-3 §<section>; no-single-signal-dominance declared>
Disclosure:           none | <each surface; audience class §7.2; §7.5 compliance statement>

### Request Contract
<field_name> : <type>      : required  : <constraint or source pointer or POLICY key>
<field_name> : <type>      : optional  : <absence semantics per §9.2 — create-context or update-context>
<field_name> : <type>      : optional  : nullable — <null semantics declared explicitly>
<list_field> : list<<type>> : required : bounded by core.system_configuration.<key>; ordered | unordered
<money_field> : money      : required  : {amount: decimal, currency: string (BDT default)}
<ts_field>   : timestamp   : required  : ISO-8601 UTC per §9.8
[Pagination fields — Query contracts §9.6]
page_size    : integer     : optional  : bounded by core.system_configuration.<page_size_key>
cursor       : string      : optional  : opaque per §9.6
filter       : object      : optional  : filterable fields per allowlist below
sort         : list<object{field, direction}> : optional : sortable fields per allowlist below
Filterable:  <field list — protected facts excluded; source pointer per field>
Sortable:    <field list with declared tiebreaker: id>

### Response Contract
<field_name> : <type> : always     : <source pointer or §10 rule binding>
<field_name> : <type> : conditional : <visibility condition per §10.6 — stated against requester's context>
[List shape — Query contracts §10.3]
items       : list<<representation>> : always : exclusion-consistent per §10.7
page_info   : object                 : always
  next_cursor : string  : conditional (has_more: true) : opaque
  has_more    : boolean : always
  total_count : integer : conditional : only if this contract declares totals; §7.5 compliant stated

### Validation Rules
V1  : SYNTAX     : <condition — field presence, type, bound, enum membership> : §9 : VALIDATION
V2  : CONTEXT    : <actor type permitted; active org context valid; admin scope if applicable> : §5 : AUTHORIZATION
V3  : AUTHZ      : <membership held; slug held per Doc-2 §7.<n>> : Doc-2 §7.<n> : AUTHORIZATION
V4  : SCOPE      : <resource belongs to active org or is grant-accessible per §7.3> : §7.3 : NOT_FOUND | AUTHORIZATION
V5  : DELEGATION : <§6B.2 five-condition check — include only if Delegation: eligible> : §6B.2 : NOT_FOUND | AUTHORIZATION
V6  : STATE      : <entity in declared Pre-states per Doc-2 §5.<n>> : Doc-2 §5.<n> : STATE
V7  : REF        : <cross-module reference valid per owning module's Query> : §4.5 : REFERENCE
V8  : BUSINESS   : <corpus-defined business rule cited by pointer> : <Doc-2|Doc-3 §<n>> : BUSINESS
V9  : POLICY     : [quota-type | throughput-type] <limit per core.system_configuration.<key>> : core.system_configuration.<key> : QUOTA | RATE_LIMITED
[Additional V<n> rules follow same grammar; category order is enforced]

### Error Behavior
Error-Boundary:
  V4  : NOT_FOUND | AUTHORIZATION | collapse-rule
  V5  : NOT_FOUND | AUTHORIZATION | collapse-rule   [if delegation-eligible]
  [One line per failure point with protected-fact exposure]
  Timing-Uniformity: asserted | not-applicable

### State Machine Effects [OMIT-IF-NONE for queries]
State-Machine-Effects: none
[OR for transitioning contracts:]
# <entity name>
Entity:          <entity name per §3.1>
Pre-states:      <verbatim from Doc-2 §5.<n>>
Post-state:      <verbatim from Doc-2 §5.<n>> | see Conditional
Conditional:     per Doc-2 §5.<n> | omit if not applicable
Actor:           <User | Admin | System | AI Agent>
Transition-Ref:  Doc-2 §5.<n> [as amended by <PATCH-ID> per §3.5]
[Additional entity blocks for multi-entity aggregates, ordered root-first, each preceded by # <entity name>]

### Idempotency
Idempotency: not-applicable
[OR for unsafe operations:]
Idempotency:     required
Key-Scope:       organization | platform
Window:          core.system_configuration.<dedup_window_key>
Replay-Result:   cached-response | acknowledged

### Concurrency [CONDITIONAL — Update commands only]
Concurrency: optimistic
Token:       updated_at | <named field>
[OR where justified:]
Concurrency: none — <documented justification per §14.5>

### Async Declaration
Execution: sync
[OR for async contracts:]
Execution:    async
Phase-1:      <validation categories satisfied; state reached; events emitted (by name); audit recorded>
Phase-2:      <navigation pointer — owning module name; triggering event per Doc-2 §8;
               State Machine Effects, Audit Requirements, and Events Produced for Phase-2
               work declared in Phase-2 module's own System-actor contract>
Observation:  <Query contract name | push channel POLICY key | poll interval POLICY key>

### Events Produced [OMIT-IF-NONE]
Events-Produced: none
[OR:]
Event:          <event_name — per Doc-2 §8; never coined here>
Version:        <integer ≥ 1>
Trigger:        <operation in this contract causing emission>
Payload:        <field : type : always|conditional : source pointer — thin per §16.5>
Outbox:         yes
Source-Ref:     Doc-2 §8.<event_entry> [as amended by <PATCH-ID> per §3.5]
Privacy-Review: §7.5 compliant
[Repeat Event block for each event produced]

### Events Consumed [CONDITIONAL — Integration contracts in source module document only]
Event:            <event_name per Doc-2 §8>
Version:          <integer | ≥ n>
Source-Module:    <emitting module per Doc-2 §8>
Consumer-Effect:  <this module's own entity effects only; no cross-module mutation>
Idempotency:      <how duplicate delivery handled — stated testably>
Out-Of-Order:     <read-repair guard per §16.8 — stated testably>
Failure:          retry per core.system_configuration.<retry_policy_key> | DLQ per core.system_configuration.<dlq_key> | skip with audit

### Audit Requirements
Audit-Required: no
[OR:]
Audit-Required:  yes
Actor-Types:     <User | Admin | System | AI Agent>
Action-Ref:      Doc-2 §9.<action> [as amended by <PATCH-ID> per §3.5]
Attribution:     standard | delegated | system | ai-agent
Mutation-Scope:  <entity name(s) per §3.1 — all modified entities listed>
Correlation:     reference_id | idempotency_key | both | phase2-origin

### Entitlement References [OMIT-IF-NONE]
Entitlements: none
[OR:]
Entitlement-Gate:  <entitlement_key> via Monetization service (Doc-4I)
Policy-Refs:       core.system_configuration.<key1>; [core.system_configuration.<key2>; ...]

### Operating Stage [CONDITIONAL — include only if contract is not available at all stages]
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b | stage_c
Stage-Behavior:     core.system_configuration.<stage_behavior_key> | none

### Rate Limits [OMIT-IF-NONE]
Rate-Limits: none
[OR:]
V<n>-Type:      quota | throughput
Policy-Key:     core.system_configuration.<key>
Attribution:    organization | delegation-controlling-organization | platform
Reset-Interval: core.system_configuration.<reset_key> | not-applicable
Error-Class:    QUOTA | RATE_LIMITED
[Repeat block for each V<n> limit rule]
```

---

### Template 21.2 — Integration Contract (MANDATORY)

Authored **once**, by the source module, per the integration single-authorship rule (§4.4). The target module **MUST NOT** restate this contract; it references by pointer only.

```
## Integration: <Integration Name>

### Header
Integration-ID:    <source-module>→<target-module>.<event-or-call-name>.v<integer>
Integration-Name:  <Human-readable description>
Source-Module:     <emitting/calling module per §4.4>
Target-Module:     <consuming/called module>
Integration-Type:  event-driven | service-call
Version:           <integer ≥ 1>

### Trigger
Trigger-Contract:  <Contract-ID of the producing contract (Template 21.1/21.4)>
Triggering-Event:  <event_name per Doc-2 §8 | n/a for service-call>
Trigger-Condition: <business condition under which this integration fires>

### Event Produced / Service Called
[Event-driven:]
Event:          <event_name — per Doc-2 §8>
Version:        <integer ≥ 1>
Payload:        <field : type : always|conditional : source pointer — thin per §16.5>
Outbox:         yes
Source-Ref:     Doc-2 §8.<event_entry> [as amended by <PATCH-ID> per §3.5]
Privacy-Review: §7.5 compliant
[Service-call:]
Called-Contract: <Contract-ID of target module's contract>
Service-Actor:   <actor type under which the call is made>
Context-Carried: <originating organization + user context; per §5.5>

### Consumer Effect
Consumer-Module:  <consuming module name>
Consumer-Effect:  <consuming module's own entity effects only — no cross-module mutations>
Idempotency:      <how duplicate delivery handled — stated testably>
Out-Of-Order:     <how out-of-sequence delivery handled; read-repair guard per §16.8>

### Failure Handling
Failure:          retry per core.system_configuration.<retry_key> | DLQ per core.system_configuration.<dlq_key> | skip with audit
Retry-Limit:      core.system_configuration.<retry_limit_key>
Dead-Letter:      <DLQ behavior and alerting per development-document policy | n/a>

### Ownership
Emitter-Ownership: <Owner Module of the emitting entity per §4.1; binds per §16.6>
Consumer-Scope:    <consuming module's own entities only per §4.3>
```

---

### Template 21.3 — Query Contract (MANDATORY for all read operations)

Specialization of Template 21.1. The following fields are **pre-declared** and **MUST NOT** be overridden:

```
## Contract: <Query Name>

### Header [as 21.1]
Contract-ID:     <module-prefix>.<entity>_query.v<integer>
[...all 21.1 Header fields...]

### Required Permissions [as 21.1]
[...all 21.1 Required Permissions fields...]
[Note: Query contracts are rarely delegation-eligible for full entity data; declare explicitly]

### Request Contract [as 21.1, with pagination grammar §9.6]

### Response Contract [as 21.1]

### Validation Rules
V1 : SYNTAX     : [field presence, type, filter/sort allowlist membership] : §9 : VALIDATION
V2 : CONTEXT    : [actor type permitted; active org context valid] : §5 : AUTHORIZATION
V3 : AUTHZ      : [membership + slug per Doc-2 §7.<n>] : Doc-2 §7.<n> : AUTHORIZATION
V4 : SCOPE      : [resource scoped to active org or grant-accessible] : §7.3 : NOT_FOUND
[V5 DELEGATION — include only if delegation-eligible]
[V6 STATE, V7 REF — include only if the query is state-gated or reference-validated]
[V8 BUSINESS — include only if a corpus business rule applies to read access]

### Error Behavior [as 21.1]
Error-Boundary:
  V4: NOT_FOUND | collapse-rule
  Timing-Uniformity: asserted | not-applicable

### State Machine Effects
State-Machine-Effects: none                          ← MANDATORY; never overridden

### Idempotency
Idempotency: not-applicable                          ← MANDATORY; never overridden

### Concurrency
[Omit — not applicable to queries]

### Async Declaration
Execution: sync                                      ← default; declare async only if the query
                                                        triggers background computation

### Events Produced [OMIT-IF-NONE — queries rarely emit; cite corpus basis if they do]

### Audit Requirements
Audit-Required: no                                   ← default for read-only queries
[Override to yes with full §17.2 grammar if the query has a write side effect (§17.1)]

### Entitlement References [OMIT-IF-NONE — entitlement-gated query access declared here]

### Operating Stage [CONDITIONAL]

### Rate Limits [OMIT-IF-NONE]
```

---

### Template 21.4 — Command Contract (MANDATORY for all mutating operations)

Specialization of Template 21.1. Commands create, update, soft-delete, or state-transition entities. The following fields are **required and MUST be populated** (not set to "none" or "not-applicable"):

```
## Contract: <Command Name>

### Header [as 21.1]
Contract-ID:     <module-prefix>.<verb>_<entity>.v<integer>
[...all 21.1 Header fields...]

### Required Permissions [as 21.1]

### Delegation Declaration [CONDITIONAL]

### Firewall-Compliance Declaration [CONDITIONAL]

### Request Contract [as 21.1]

### Response Contract [as 21.1 — returns canonical entity in post-command state]

### Validation Rules [all nine categories declared as applicable; no category omitted without justification]
V1–V9 : [full §11.2 grammar; every V<n> rule testable and source-cited]

### Error Behavior [as 21.1 — Error Boundary required if any protected-fact exposure]

### State Machine Effects                            ← MANDATORY for state-transitioning commands
[Entity blocks per §13.2 grammar; multi-entity blocks ordered root-first]
[OR: State-Machine-Effects: none — only for field-only updates with no state transition; rare for commands]

### Idempotency                                      ← MANDATORY for all commands
Idempotency:     required
Key-Scope:       organization | platform
Window:          core.system_configuration.<dedup_window_key>
Replay-Result:   cached-response | acknowledged

### Concurrency                                      ← REQUIRED for update commands
Concurrency: optimistic | none — <justification>
Token:       updated_at | <named field>

### Async Declaration [declare async if command triggers Phase-2 work]

### Events Produced                                  ← MANDATORY; populate or declare "none"
[All Doc-2 §8 events for this transition declared; Privacy-Review: §7.5 compliant on each]

### Audit Requirements                               ← MANDATORY for all commands
Audit-Required:  yes
Actor-Types:     <actor type>
Action-Ref:      Doc-2 §9.<action> [as amended by <PATCH-ID>]
Attribution:     standard | delegated | system | ai-agent
Mutation-Scope:  <all modified entity types>
Correlation:     reference_id | idempotency_key | both

### Entitlement References [OMIT-IF-NONE]

### Operating Stage [CONDITIONAL]

### Rate Limits [OMIT-IF-NONE]                       ← MANDATORY to declare if any V9 rule present
```

---

### Template 21.5 — System Actor Contract (MANDATORY for all Phase-2 async workers)

Specialization of Template 21.4. System-actor contracts are authored by the **Phase-2 owning module** (§15.5; §4.4). The following fields are **pre-declared** and **MUST NOT** be overridden:

```
## Contract: <Phase-2 Worker Name>

### Header
Contract-ID:     <module-prefix>.phase2_<operation>.v<integer>
[...all 21.1 Header fields...]
Actor-Types:     System                               ← FIXED; System actor only

### Required Permissions
Actor:        System
Membership:   n/a                                    ← System actor has no organization membership
Slugs:        n/a                                    ← System actor has no slug check
Scope:        <organization_id of the entity being acted upon; inherited from Phase-1 trigger context>
Delegation:   not eligible                           ← System-actor contracts are never delegation-eligible

### Request Contract
[Phase-2 context — inputs are the triggering event's payload fields, not a user-supplied request]
<triggering_event_field> : <type> : required : sourced from <event_name> payload per Doc-2 §8
[Other Phase-2 inputs derived from internal state, not from a user request]

### Response Contract [OMIT — Phase-2 workers do not return a synchronous response]
Response: none — Phase-2 execution is asynchronous; outcome observed via owning module's Query contract

### Validation Rules
V1 : SYNTAX   : [triggering event payload field validation] : §9 : VALIDATION
V2 : CONTEXT  : [system actor type confirmed; organization context from trigger] : §5.2 : AUTHORIZATION
V6 : STATE    : [target entity in expected pre-state per Doc-2 §5.<n>] : Doc-2 §5.<n> : STATE
[V7 REF, V8 BUSINESS — as applicable; no AUTHZ, SCOPE, DELEGATION categories]

### Error Behavior
Error-Boundary:
  V6: STATE — Phase-2 failure handled by corpus-defined failure state transition (§15.6)
  Timing-Uniformity: not-applicable                  ← System actor; no caller-facing timing surface

### State Machine Effects                            ← MANDATORY — Phase-2 owns its own transitions
# <entity name>
Entity:          <entity name per §3.1>
Pre-states:      <verbatim from Doc-2 §5.<n>>
Post-state:      <verbatim from Doc-2 §5.<n>>
Actor:           System
Transition-Ref:  Doc-2 §5.<n> [as amended by <PATCH-ID>]

### Idempotency                                      ← MANDATORY
Idempotency:     required
Key-Scope:       platform                            ← Phase-2 workers operate platform-scoped
Window:          core.system_configuration.<dedup_window_key>
Replay-Result:   acknowledged

### Async Declaration
Execution: sync                                      ← Phase-2 contract itself is synchronous within the worker

### Events Produced                                  ← MANDATORY; declared per Phase-2 module
[Phase-2 completion or failure events; Privacy-Review: §7.5 compliant on each]

### Audit Requirements                               ← MANDATORY; phase2-origin required
Audit-Required:  yes
Actor-Types:     System
Action-Ref:      Doc-2 §9.<action> [as amended by <PATCH-ID>]
Attribution:     system                              ← FIXED for System actor
Mutation-Scope:  <all entity types modified by Phase-2>
Correlation:     phase2-origin                       ← MANDATORY for Phase-2 System-actor contracts

### Rate Limits [OMIT-IF-NONE]
```

---

### Template 21.6 — Admin Contract (MANDATORY for all Admin-actor operations)

Specialization of Template 21.1. Admin contracts operate without an active organization context (§5.6). The following fields are **pre-declared**:

```
## Contract: <Admin Operation Name>

### Header
Contract-ID:     <module-prefix>.admin_<operation>.v<integer>
[...all 21.1 Header fields...]
Actor-Types:     Admin                               ← FIXED for Admin contracts

### Required Permissions
Actor:        Admin
Membership:   n/a                                    ← Admin actors have no org membership
Slugs:        <staff_* slug(s) from Doc-2 §7; only staff_* — no can_* slugs>
Scope:        platform-wide | entity-scoped — <entity reference> | tenant-data-access — <compliance basis by pointer>
Delegation:   not eligible                           ← Admin contracts are never delegation-eligible

Admin-Scope:   platform-wide | entity-scoped | tenant-data-access   ← MANDATORY
[If tenant-data-access:]
Compliance-Basis: <corpus pointer: Doc-2 §9 / Master Architecture §14 — must have corpus basis; admin convenience is not a basis>

### Firewall-Compliance Declaration [CONDITIONAL — Admin contracts that read governance signals]

### Request Contract [as 21.1]
[Note: No organization_id field as "act as organization X" — Admin acts with its own attribution]
[Entity scope declared via explicit entity ID or scope parameter, not via ambient org context]

### Response Contract [as 21.1]

### Validation Rules
V1 : SYNTAX   : [field presence, type, bound] : §9 : VALIDATION
V2 : CONTEXT  : [actor type Admin confirmed; staff_* slug held] : §5.6 : AUTHORIZATION
V3 : AUTHZ    : [required staff_* slug(s) per Doc-2 §7.<n>] : Doc-2 §7.<n> : AUTHORIZATION
[V4 SCOPE — entity-scoped and tenant-data-access contracts declare resource scope check]
[V6 STATE through V9 POLICY — as applicable]

### Error Behavior [as 21.1]

### State Machine Effects [MANDATORY if transitioning — Admin transitions carry Admin actor]
[OR: State-Machine-Effects: none]

### Idempotency [MANDATORY for mutating Admin contracts]
Idempotency: required | not-applicable

### Audit Requirements                              ← MANDATORY; every Admin mutation is audited
Audit-Required:  yes
Actor-Types:     Admin
Action-Ref:      Doc-2 §9.<action> [as amended by <PATCH-ID>]
Attribution:     standard                           ← Admin attribution per §17.3
Mutation-Scope:  <all modified entity types>
Correlation:     reference_id | idempotency_key | both

### Operating Stage [CONDITIONAL — Admin contracts not available during certain stages]

### Rate Limits [OMIT-IF-NONE]
```

---

## Appendix A — Doc-4 Conformance Checklist (Machine-Executable)

Every check has a stable ID (CHK-xxx), a binary pass/fail criterion, and a source pointer. AI review agents and human reviewers run this checklist against every Doc-4B–4N contract before freeze. Non-passing checks are reported by ID; a contract with any unresolved BLOCKER check **MUST NOT** be frozen.

**Severity:** **[B]** = BLOCKER (contract must not freeze until resolved), **[M]** = MAJOR (must be resolved or explicitly deferred with escalation), **[m]** = MINOR (should be resolved; accept with recorded justification).

---

### Module Ownership and Structure

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-001 | Contract-ID field present in format `<module-prefix>.<operation>.v<n>` | §3 | B |
| CHK-002 | Owner-Module field names a recognized module per §1.3 | §4.1 | B |
| CHK-003 | Contract appears only in its Owner Module's document | §4.1 | B |
| CHK-004 | Contract does not mutate another module's entity | §4.3 | B |
| CHK-005 | Contract does not define a read of another module's entity (cross-module reads use owning module's Query) | §4.3 | B |
| CHK-006 | Integration contracts authored by source module; target module references by pointer only | §4.4 | B |
| CHK-007 | No business logic placed in Module 0 (Shared Kernel) contracts | §4.3 | B |
| CHK-008 | Child entities mutated only through their aggregate root's contracts | §4.1 | M |
| CHK-009 | No new entities, states, transitions, events, permissions, or POLICY keys invented in this Doc-4 document | §20.1 | B |
| CHK-010 | Template type correctly selected per §21 selection guide | §21 | B |
| CHK-011 | All source pointers in citation format per §3.5 (base document + patch ID where amended) | §3.5 | M |
| CHK-012 | No field carries "TBD", "to be defined", "implementation-specific", or equivalent | §2.2 | B |
| CHK-013 | Version field is integer ≥ 1 | §20.3 | m |

---

### Governance Signal Firewall

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-020 | Signal-touching contracts include Firewall-Compliance Declaration | §4B.4 | B |
| CHK-021 | Every field in Firewall-Compliance Declaration carries enumerated values or literal `none` (no free-text assertions) | §4B.4 | B |
| CHK-022 | Signals-Read lists source module Query for each signal read | §4B.4 | M |
| CHK-023 | Signals-Written names only this contract's Owner Module (no other-module signal write) | §4B.2 | B |
| CHK-024 | Monetization-Inputs gates visibility/volume/analytics/advertising/microsite only — never trust, verification, eligibility, routing, or matching confidence | §4B.2; §18.3 | B |
| CHK-025 | Routing-Impact declares no-single-signal-dominance constraint where routing is affected | §4B.2 | B |
| CHK-026 | Buyer Vendor Status absent from all vendor-facing and third-party-facing contract surfaces | §4B.2; §7.5 | B |
| CHK-027 | Matching Confidence not persisted as an authoritative signal value | §4B.1 | B |
| CHK-028 | No Financial Tier input that influences Trust Score or Performance Score | §4B.2 | B |

---

### Authorization and Delegation

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-030 | Required Permissions field present with all five sub-fields (Actor, Membership, Slugs, Scope, Delegation) | §6.3 | B |
| CHK-031 | Actor value from closed set: User, Admin, System, AI Agent | §5.2 | B |
| CHK-032 | All slugs in Slugs field exist in Doc-2 §7 — no invented slugs | §6.2; §6.4 | B |
| CHK-033 | No plan names or role names in authorization declaration | §6.2 | B |
| CHK-034 | Delegation field explicitly declares "not eligible" or full §6B.2 check | §6B.1 | B |
| CHK-035 | Never-delegation-eligible operations (ownership transfer, billing, profile deletion, verification, grant management) declared "not eligible" | §6B.1 | B |
| CHK-036 | Delegation-eligible contracts declare all four §6B.3 attributions | §6B.3 | B |
| CHK-037 | Delegated quota attribution points to delegation-controlling-organization (§19.3) | §6B.3; §19.4 | B |
| CHK-038 | §6B.2 five-condition check declared for each delegation-eligible contract | §6B.2 | B |
| CHK-039 | Admin contracts: Slugs field uses staff_* only — no can_* slugs | §5.6; §6.2 | B |
| CHK-040 | Admin contracts: Admin-Scope declared (platform-wide | entity-scoped | tenant-data-access) | §5.6 | B |
| CHK-041 | tenant-data-access Admin contracts cite compliance basis (not admin convenience) | §5.6 | B |

---

### Tenancy and Non-Disclosure

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-050 | Tenancy class declared for each entity type returned | §7.1; §7.2 | B |
| CHK-051 | Tenant-owned entities scoped to active organization (never enumerable cross-tenant) | §7.1 | B |
| CHK-052 | Shared-access contracts name the governing grant table or party column | §7.3 | B |
| CHK-053 | No cross-tenant visibility via flags, query logic, or computed access | §7.3 | B |
| CHK-054 | Protected-fact collapse rule applied: failure on protected-fact reveals same shape as entity-never-existed | §12.4 | B |
| CHK-055 | Error Boundary block present for every failure point with protected-fact exposure | §12.4 | B |
| CHK-056 | Error Boundary block declares `Timing-Uniformity: asserted | not-applicable` | §12.4 | B |
| CHK-057 | AUTHORIZATION/NOT_FOUND boundary declared per failure point in Error Boundary | §12.4 | B |
| CHK-058 | Lookup-by-human_ref returns identical NOT_FOUND for "no such reference" and "not visible" | §12.4 | M |
| CHK-059 | field_errors, DEPENDENCY details, QUOTA details, RATE_LIMITED metadata contain no protected facts | §12.4; §12.5 | B |
| CHK-060 | Cursor-based pagination only (no offset/index-based pagination) | §9.6 | B |
| CHK-061 | Filter and sort fields exclude protected facts as dimensions | §9.6 | B |
| CHK-062 | total_count declared only where §7.5 compliance is stated | §10.3 | M |
| CHK-063 | conditional field's visibility condition stateable from requester's own context (no protected-fact dependency) | §10.6 | B |

---

### Identifiers and References

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-070 | All entity references in request and response payloads are uuid (UUIDv7) | §8.1 | B |
| CHK-071 | human_ref appears only as lookup input in explicitly declared lookup contracts | §8.2 | M |
| CHK-072 | Version-bound references carry the version_id explicitly (§9.5) | §9.5 | B |
| CHK-073 | Cross-module references named for target entity (§8.3 convention) | §8.3 | m |
| CHK-074 | Documents/files referenced by document/version ID only (no URLs, no blob content) | §8.5 | B |

---

### Request Contract

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-075 | All field lines carry four positions: name : type : required\|optional : constraint | §9.1 | B |
| CHK-076 | Types from abstract type set only (§9.1); no framework-specific or transport-specific types | §9.1 | B |
| CHK-077 | Constraint position never empty | §9.1 | B |
| CHK-078 | optional fields declare absence semantics (create-context or update-context per §9.2) | §9.2 | B |
| CHK-079 | nullable fields declare null semantics explicitly | §9.2 | B |
| CHK-080 | Absent and explicit null not treated as equivalent in update-command context | §9.2 | B |
| CHK-081 | Enum fields declared as enum(<source pointer>); no new enums defined | §9.4 | B |
| CHK-082 | Lifecycle state not writable in mutating contracts | §9.4; §13.3 | B |
| CHK-083 | Collection fields carry bound in constraint (POLICY key or corpus pointer) | §9.3 | B |
| CHK-084 | Pagination grammar uses canonical form from §9.6 | §9.6 | M |
| CHK-085 | Filter and sort on explicit allowlist only | §9.6 | B |
| CHK-086 | Every sort declares tiebreaker (entity id) | §9.6 | m |
| CHK-087 | No prohibited request fields (attribution, audit, tenant-selection, authorization, ownership-change, lifecycle-state, governance signals, soft-delete as direct writes, human_ref as reference, inline tunable limits) | §9.7 | B |
| CHK-088 | One command, one aggregate root (no cross-aggregate transactions) | §9.8 | B |
| CHK-089 | No transport-specific constructs (URLs, verbs, headers, status codes) | §9.8; §2.2 | B |
| CHK-090 | Money fields use money type {amount, currency} with BDT default | §9.8 | M |
| CHK-091 | Timestamps use ISO-8601 UTC; dates use ISO-8601 calendar date | §9.8 | M |

---

### Response Contract

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-095 | Entity representation defined once in Owner Module's document; no other module redefines it | §10.1 | B |
| CHK-096 | Mutation response returns canonical entity in post-command state | §10.2 | M |
| CHK-097 | List response uses canonical shape (items, page_info, next_cursor, has_more) | §10.3 | M |
| CHK-098 | Exclusion-consistency applied: items, counts, totals, facets use identical exclusion set | §10.7 | B |
| CHK-099 | Cross-module reference in response carries uuid only (no embedded other-module representation) | §10.6 | B |
| CHK-100 | Display labels are bounded (no governance signals, entity states, or derived scores in labels) | §10.6 | B |
| CHK-101 | Derived data carries `derived` annotation with source pointer and regenerability | §10.8 | M |

---

### Validation

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-110 | Validation Rules field present in all mutating contracts | §11.1 | B |
| CHK-111 | Validation rules in canonical nine-category order (SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → STATE → REF → BUSINESS → POLICY) | §11.2 | B |
| CHK-112 | Every rule testable (passing and failing input constructable from rule line alone) | §11.1 | B |
| CHK-113 | Every rule cites source (corpus pointer, POLICY key, or Doc-4A section) | §11.1 | B |
| CHK-114 | Category 9 rules declare quota-type or throughput-type | §11.2 | B |
| CHK-115 | Error class per rule is from closed §12.2 set | §11.2 | B |
| CHK-116 | Category 4/5 rules resolve multiple-class mapping to specific class (NOT_FOUND or AUTHORIZATION) | §11.2 | B |
| CHK-117 | Category 9 rules resolve dual mapping to QUOTA or RATE_LIMITED | §11.2 | B |
| CHK-118 | Authorization categories 2–5 precede semantic categories 6–9 | §11.2 | B |
| CHK-119 | Validation failure produces no state change, no business audit record, no event | §11.3 | B |
| CHK-120 | No auto-state, auto-save, or auto-transition on validation failure (unless corpus-defined) | §11.3 | B |
| CHK-121 | DELEGATION V<n> rule identifies Case A or Case B per §11.4 | §11.4 | B |

---

### Error Behavior

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-125 | Error envelope uses canonical shape (error_class, error_code, message, field_errors, retryable, reference_id) | §12.1 | B |
| CHK-126 | error_class from closed twelve-class set (§12.2) | §12.2 | B |
| CHK-127 | error_code in module's registered namespace (Appendix B §B.2) | §12.3; App-B | B |
| CHK-128 | error_code does not encode protected facts, other-tenant data, or internal service topology | §12.3; §12.5 | B |
| CHK-129 | message from fixed module catalog; no interpolation of protected/tenant data | §12.3 | B |
| CHK-130 | STATE error discloses current state only to callers who can already read it; otherwise collapse rule | §12.5 | B |
| CHK-131 | CONFLICT error carries current concurrency token only (no competing-actor data) | §12.5 | M |
| CHK-132 | QUOTA error reveals exhausted party only to entitled parties | §12.5 | B |

---

### State Machine

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-135 | State-Machine-Effects field present (value or "none") — absence is nonconforming | §13.1 | B |
| CHK-136 | Pre-states and Post-state values verbatim from Doc-2 §5 | §13.2 | B |
| CHK-137 | Transition-Ref cites Doc-2 §5.<n> with patch ID where amended | §13.2 | B |
| CHK-138 | "any non-corpus-terminal" shorthand used only with explicit corpus basis | §13.2 | M |
| CHK-139 | Multi-entity aggregate: one block per entity, ordered aggregate-root-first | §13.2 | M |
| CHK-140 | AI-Agent contracts declare no state transitions | §13.5 | B |
| CHK-141 | System-actor transitions not invocable by User or Admin actor contracts | §13.5 | B |
| CHK-142 | Lifecycle state not accepted as writable request field in mutating contract | §13.3 | B |
| CHK-143 | "Field update implies transition" pattern absent | §13.3 | B |
| CHK-144 | No terminal state in Pre-states | §13.6 | B |
| CHK-145 | No reopen of terminal state without Doc-2 §5 corpus basis | §13.6 | B |
| CHK-146 | State Machine Effects not declared on another module's entity | §13.4 | B |

---

### Idempotency and Concurrency

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-150 | Idempotency field present (required or not-applicable) — absence is nonconforming | §14.1 | B |
| CHK-151 | Unsafe operations declare Idempotency: required | §14.1 | B |
| CHK-152 | Deduplication window references POLICY key (no hardcoded duration) | §14.2 | B |
| CHK-153 | Idempotency key NOT in request payload as a business field | §14.2 | B |
| CHK-154 | Joint Rule declared: same result + no duplicate audit + no duplicate outbox event | §14.3 | B |
| CHK-155 | In-flight protection: no second execution while original in-flight (§14.3 Pass4-Patch-PATCH-01) | §14.3 | B |
| CHK-156 | Update commands declare Concurrency: optimistic or provide documented justification for "none" | §14.5 | M |

---

### Async Declaration

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-160 | Async Declaration field present (Execution: async \| sync) | §15.2 | B |
| CHK-161 | Phase-2 field is navigation pointer only — no State Machine Effects, Audit, or Events for Phase-2 work in Phase-1 contract (Pass4-Patch-PATCH-02) | §15.2 | B |
| CHK-162 | Observation names owning module's Query as minimum authoritative path | §15.2 | M |
| CHK-163 | Phase-1 response does not fabricate Phase-2 completion (Doc-3 §12.1 FIXED) | §15.4 | B |
| CHK-164 | No fabricated progress events (event emitted before corresponding work begins) | §15.4 | B |
| CHK-165 | ASYNC_PENDING applied only to dedicated result-observation queries, not general entity queries | §15.3 | M |
| CHK-166 | Phase-2 failure handled within corpus-defined failure state machine (no invented compensating commands) | §15.6 | B |

---

### Events

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-170 | Events-Produced field present (or "none") — absence is nonconforming for mutating contracts | §16.2 | B |
| CHK-171 | Event names exist in Doc-2 §8 — no coined event names | §16.4 | B |
| CHK-172 | Events Produced grammar: all 7 fields present (Event, Version, Trigger, Payload, Outbox: yes, Source-Ref, Privacy-Review) | §16.3 | B |
| CHK-173 | Privacy-Review field carries literal "§7.5 compliant" (Pass4-Patch-PATCH-03) | §16.3; §16.5 | B |
| CHK-174 | Outbox: yes present in every Events Produced declaration | §16.2 | B |
| CHK-175 | Event payload carries no protected facts (blacklist, routing exclusion, Buyer Vendor Status, private CRM, routing-exclusion data) | §16.5; §7.5 | B |
| CHK-176 | Event payload carries no other-tenant data | §16.5 | B |
| CHK-177 | Event payload size governed by POLICY key (§18.2) | §16.5 | M |
| CHK-178 | Events Consumed grammar: all 7 fields present (Event, Version, Source-Module, Consumer-Effect, Idempotency, Out-Of-Order, Failure) | §16.3 | B |
| CHK-179 | Consumer-Effect limited to consuming module's own entities | §16.7 | B |
| CHK-180 | Out-Of-Order field declares read-repair guard (stated testably) | §16.8 | B |
| CHK-181 | Consumer declares Failure behavior (no silent failure) | §16.7 | B |
| CHK-182 | Event emitted only by Owner Module (no other-module emissions) | §16.6 | B |
| CHK-183 | Event version bumped only on breaking payload changes per §16.4 definition | §16.4 | M |

---

### Audit

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-186 | Audit Requirements field present in all mutating contracts — absence is nonconforming | §17.1 | B |
| CHK-187 | Action-Ref cites Doc-2 §9 action (no invented audit actions) | §17.2 | B |
| CHK-188 | Mutation-Scope lists every entity type the contract modifies | §17.2 | B |
| CHK-189 | Correlation value from closed set: reference_id \| idempotency_key \| both \| phase2-origin | §17.2 | B |
| CHK-190 | phase2-origin used exclusively by System-actor Phase-2 contracts (Pass4-Patch-PATCH-04) | §17.2 | B |
| CHK-191 | Attribution: delegated contracts carry all four §6B.3 attributions | §17.4 | B |
| CHK-192 | Phase-2 System-actor contracts declare Correlation: phase2-origin (Pass4-Patch-PATCH-04) | §17.3 | B |
| CHK-193 | Audit records not modifiable by any contract (immutability — redaction only, with compliance basis) | §17.5 | B |
| CHK-194 | AI-agent write side effects attributed to User or System actor that accepted advisory (not to AI Agent actor) | §17.3 | B |

---

### Policy, Entitlement, Stage, Rate Limits

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-200 | All limit values referenced by core.system_configuration.<key> — no hardcoded numerics | §18.2 | B |
| CHK-201 | Entitlement checks use entitlement keys via Monetization service (not plan names) | §18.3 | B |
| CHK-202 | Entitlements gate visibility/volume/feature only — never trust, verification, eligibility, routing, or matching confidence | §18.3; §4B.2 | B |
| CHK-203 | FIXED rules declared as non-overridable; not treated as POLICY-tunable | §18.1 | B |
| CHK-204 | POLICY keys exist in Doc-3 §12.2 — no invented keys | §18.2 | B |
| CHK-210 | Stage declarations govern availability only — no ownership, workflow, or permission changes | §18B.3 | B |
| CHK-211 | Stage-specific behavior bound to POLICY key (not inline branching logic) | §18B.5 | B |
| CHK-215 | Rate limit type declared (quota \| throughput) per V<n> Category 9 rule | §19.2; §11.2 | B |
| CHK-216 | Quota attribution uses delegation-controlling-organization for delegated operations | §19.4 | B |
| CHK-217 | QUOTA error retryable: false; RATE_LIMITED error retryable: true | §19.2; §12.2 | B |

---

### Contract Evolution

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-220 | Breaking changes produce a version bump | §20.3 | B |
| CHK-221 | Domain changes (new entity, event, permission, state, POLICY key) preceded by corpus patch | §20.1 | B |
| CHK-222 | Deprecated contracts carry Deprecated field with Removal-Window POLICY key | §20.4 | M |
| CHK-223 | error_code values stable across contract versions (not renamed without breaking-change declaration) | §20.2 | M |

---

*Run all checks against every contract before freeze submission. Report results as: `CHK-xxx: PASS | FAIL | N/A — <one-line reason if FAIL>`. A contract with any BLOCKER [B] failure MUST NOT be frozen. All MAJOR [M] failures must be resolved or escalated. MINOR [m] failures must be recorded.*

---

## Appendix B — Standard Error Catalog & Reserved Namespace Registry

> **Governance Note — Appendix Registry Alignment (Pass 5 Patch v1.0.1, PATCH-02):** The frozen Structure (Doc-4A_Structure_v1.0_FROZEN.md) registers Appendix B as "Reserved Namespace Registry." This appendix satisfies that obligation in full (§B.2–B.4) while also providing the Standard Error Catalog (§B.1) required for complete contract conformance. The combined scope represents the minimal set required to make conformance reviewable. No architectural meaning, error class definitions, or namespace authority changes. A Structure patch updating the Appendix B registration title is recommended as a follow-on action.

### B.1 Standard Error Classes

The closed set of twelve platform error classes (§12.2). No module may add, remove, or rename classes; changes require a Doc-4A §12 patch.

| Class | Meaning | Maps from §11 | Retryable default | Recovery guidance |
|---|---|---|---|---|
| `VALIDATION` | Request fails SYNTAX rules (field presence, type, bound, enum) | Category 1 | false | Fix input per field_errors |
| `AUTHORIZATION` | Caller lacks context, membership, or slug for an operation on a resource it legitimately knows exists | Categories 2, 3 | false | Acquire the required permission |
| `NOT_FOUND` | Resource does not exist **or** caller has no right to know whether it exists | Categories 4, 5 (and all protected-fact cases) | false | No distinguishable recovery path — treat as non-existent |
| `STATE` | Operation illegal from the entity's current state | Category 6 | false | Wait for corpus-defined state change |
| `REFERENCE` | A supplied cross-module or version reference failed validation | Category 7 | false | Verify reference IDs before retrying |
| `BUSINESS` | A corpus-defined business rule rejected the operation | Category 8 | false | Resolve the business condition (corpus-defined) |
| `QUOTA` | Finite entitlement exhausted; time alone does not restore it | Category 9 (quota-type) | false (requires external state change) | Plan upgrade or platform-actor quota reset |
| `RATE_LIMITED` | Throughput window engaged; resets on POLICY-declared schedule | Category 9 (throughput-type) | true (after reset interval per contract) | Retry after declared reset interval |
| `CONFLICT` | Concurrency precondition failed (stale token, non-idempotent duplicate submission) | — (§14) | true (after re-read) | Re-read entity for current concurrency token, then retry |
| `ASYNC_PENDING` | Result not yet available for an accepted async operation | — (§15) | true | Poll or observe via declared Observation contract |
| `DEPENDENCY` | Owning module service required for REF/composition was unavailable | — | true | Retry with backoff |
| `SYSTEM` | Platform fault | — | true | Retry with backoff; log reference_id for support |

**QUOTA vs RATE_LIMITED — enforcement distinction (§12.2, §19.2):**

- `QUOTA`: A finite stock that has been fully consumed. The `retryable: false` flag signals that retrying immediately or later in the same window accomplishes nothing. The client **MUST** await an external quota-restoration event (plan change, platform-actor reset). Contracts **MUST NOT** return `QUOTA` for a reset-able throughput window.
- `RATE_LIMITED`: A throughput gate that resets on a POLICY-governed schedule. The `retryable: true` flag signals that retrying after the declared reset interval is meaningful. The contract's Error Behavior **MUST** declare the reset-interval POLICY key. Contracts **MUST NOT** return `RATE_LIMITED` for an exhausted quota allocation.

**Protected-fact collapse binding (§12.4):**

Any failure that would disclose a protected fact **MUST** produce a `NOT_FOUND` response indistinguishable from the entity-never-existed case: same `error_class`, same `error_code`, same `message`, same `field_errors` shape (absent), same timing path. This applies regardless of the actual §11.2 validation category that triggered the failure.

**AUTHORIZATION/NOT_FOUND boundary (§12.4):**

`AUTHORIZATION` is returned only when the resource's existence is already established as a non-protected fact from the requester's perspective (e.g., the requester is a member of the organization owning the resource but lacks the required slug). When existence itself is not the requester's to know, the error is `NOT_FOUND`.

---

### B.2 Module Error Code Namespace Registry

`error_code` values **MUST** be allocated within the declaring module's registered namespace prefix, per the format: `<module_prefix>_<domain>_<code>`. New prefix registrations require a Doc-4A patch; no module may self-assign a prefix.

| Module | Document | Prefix |
|---|---|---|
| Platform Core / Shared Kernel | Doc-4B | `core_` |
| Identity & Organization | Doc-4C | `identity_` |
| Marketplace & Discovery | Doc-4D | `marketplace_` |
| RFQ Procurement Engine | Doc-4E | `rfq_` |
| Business Operations | Doc-4F | `ops_` |
| Trust & Verification | Doc-4G | `trust_` |
| Communication | Doc-4H | `comm_` |
| Monetization | Doc-4I | `billing_` |
| Admin Operations | Doc-4J | `admin_` |
| AI Layer | Doc-4K | `ai_` |

**Rules:**
- `error_code` values within a module's namespace are stable once registered; they **MUST NOT** be renamed or repurposed after a contract is frozen (§20.2).
- `error_code` values **MUST NOT** encode protected facts, other tenants' data, or internal module/service topology (§12.3).
- `error_code` values are machine-readable stable identifiers; `message` strings are human-readable and may be updated editorially (§20.2 editorial change).

---

### B.3 Permission Slug Space Registry

Permission slugs occupy two protected namespaces (Doc-2 §7, by pointer):

| Namespace | Prefix | Used by | Registration |
|---|---|---|---|
| Organization space | `can_` | User-actor authorization (§6.2) | Doc-2 §7 patch required |
| Platform staff space | `staff_` | Admin-actor authorization (§5.6) | Doc-2 §7 patch required |

Slugs **MUST** be declared in Doc-2 §7 before being referenced in any Doc-4 contract. Inventing slugs in Doc-4 documents is a conformance failure requiring escalation (§6.4).

---

### B.4 POLICY Key Domain Registry

POLICY keys occupy the `core.system_configuration.<domain>.<key>` namespace (§18.2). Key definitions reside in Doc-3 §12.2 (by pointer). Doc-4 contracts reference keys by name; they do not define them.

| Domain | Key prefix | Governing document |
|---|---|---|
| Platform / global | `core.system_configuration.platform.*` | Doc-3 §12.2 |
| Per-module limits | `core.system_configuration.<module>.*` | Doc-3 §12.2 |
| Rate windows | `core.system_configuration.*.rate_window_*` | Doc-3 §12.2 |
| Quota allocations | `core.system_configuration.*.quota_*` | Doc-3 §12.2 |
| Retention periods | `core.system_configuration.*.retention_*` | Doc-3 §12.2 |
| Deprecation windows | `core.system_configuration.deprecation.*` | Doc-3 §12.2 |

New POLICY key registrations require a Doc-3 §12.2 patch. No Doc-4 document may coin a POLICY key.

---

## Appendix C — Contract Authoring Checklist

> **Governance Note — Appendix Registry Alignment (Pass 5 Patch v1.0.1, PATCH-02):** The frozen Structure (Doc-4A_Structure_v1.0_FROZEN.md) registers Appendix C as "Cross-Reference Index." This appendix serves as the Contract Authoring Checklist — a pre-authoring and pre-freeze guide for contract authors and AI coding agents. The cross-reference intent of the Structure's Appendix C is partially satisfied by the CHK-xxx source pointers in Appendix A; a full cross-reference index table is deferred to a future Doc-4A patch. No architectural meaning, governance behavior, or conformance obligation changes. A Structure patch updating the Appendix C registration title is recommended as a follow-on action.

This checklist guides contract authors (human and AI agent) through a pre-authoring and pre-freeze review. Complete it in order before submitting any contract for freeze. Record the result of each step: ✓ (complete), ✗ (failed — resolve before proceeding), N/A (not applicable with stated reason).

---

### C.1 Pre-Authoring: Ownership and Scope Verification

Before writing a single field, verify the following:

1. **Entity ownership confirmed.** The entity this contract operates on has an identified Owner Module in Doc-2 §3. That module **IS** the module in whose document this contract will appear. If the contract's entity has no Owner Module assigned, escalate (§0.6) — do not proceed.

2. **Operation scope bounded to this module.** The contract's effects are limited to entities this module owns. List every entity this contract creates, updates, or deletes. For each: confirm it appears in Doc-2 §3 under this module. Any entity owned by another module → escalate.

3. **No alternate workflow invented.** Verify the operation this contract describes exists in Doc-3 or can be naturally derived from Doc-2 state machines. If the operation is not corpus-defined, escalate (§0.6) — do not invent a new workflow.

4. **Template type selected.** Identify which of Templates 21.1–21.6 applies to this contract (per §21 selection guide). Record the selection.

5. **Contract-ID formed.** Compose `<module-prefix>.<verb>_<entity>.v1` per §3.2 and §20.3. Confirm it is unique in this module's document.

---

### C.2 Authorization and Tenancy Review

6. **Slugs exist.** For every slug in the Required Permissions declaration: confirm it exists in Doc-2 §7. If any slug is missing from the corpus, stop and escalate per §6.4. Do not invent, borrow, or widen a slug.

7. **Delegation eligibility correct.** Check the operation type against the §6B.1 never-delegation-eligible list. Declare `not eligible` unless the corpus explicitly permits delegation for this operation type.

8. **Tenancy class declared.** For every entity returned: identify its Doc-2 §0.4 tenancy class and declare it in the response contract.

9. **Protected-fact surfaces identified.** List every scenario where a protected fact (§7.5) could influence the contract's response. For each: confirm the protected-fact collapse rule will be applied. Draft the Error Boundary block.

10. **Firewall-compliance applicable?** Does this contract read, write, display, or route on any of the five governance signals? If yes, draft the Firewall-Compliance Declaration now (§4B.4).

---

### C.3 State Machine and Business Logic Review

11. **Pre-states verified.** For every entity state transition: confirm the Pre-states values appear verbatim in Doc-2 §5. Do not paraphrase or combine.

12. **Transition-Ref valid.** Confirm Doc-2 §5.\<n\> citation is correct and, if the transition was amended by a patch, the patch ID is cited per §3.5.

13. **Terminal states not in Pre-states.** For every Pre-state value: confirm it is not a terminal state per Doc-2 §5. If a terminal state appears, escalate — do not proceed with that transition.

14. **No transition invented.** Every State Machine Effects block must bind to a transition defined in Doc-2 §5. If a needed transition does not exist in the corpus, escalate (§0.6) — do not invent it.

15. **AI Agent actor check.** If Actor-Types includes AI Agent: confirm the contract has no State Machine Effects (advisory/read only). If it does, escalate — AI-Agent contracts MUST NOT drive state transitions.

---

### C.4 Event and Audit Declarations

16. **Event names in Doc-2 §8.** For every event in Events Produced: confirm the event_name exists in Doc-2 §8. If it does not, escalate before proceeding.

17. **Privacy-Review completed.** Review every field in every Events Produced payload against the §7.5 protected-fact list. Confirm no protected facts, Buyer Vendor Status, routing-exclusion data, private CRM content, or governance signal values beyond the emitting module's own authoritative state. Then declare `Privacy-Review: §7.5 compliant`.

18. **Outbox: yes present.** Confirm every Events Produced declaration carries `Outbox: yes`.

19. **Audit action in Doc-2 §9.** For Audit-Required: yes contracts: confirm the Action-Ref exists in Doc-2 §9. If it does not, escalate.

20. **Correlation correctly typed.** If this is a Phase-2 System-actor contract: confirm Correlation is `phase2-origin`. If this is any other contract: confirm Correlation is not `phase2-origin`.

21. **Phase-2 attribution chain complete.** If this contract is Phase-2 async: confirm Audit Attribution is `system`, Correlation is `phase2-origin`, and the originating Phase-1 reference is declared as the linkage source (per §17.3).

---

### C.5 Policy, Limits, and Conformance Closure

22. **No hardcoded limits.** Scan every field and validation rule for numeric values that represent limits (quotas, rates, periods, bounds). For each: replace with `core.system_configuration.<key>` citation. Confirm the key exists in Doc-3 §12.2.

23. **No plan names.** Scan for any plan or subscription name in the contract. For each: replace with an entitlement key via Monetization service (§18.3), or remove if the check is not corpus-defined.

24. **FIXED rules protected.** For every FIXED invariant the contract enforces (Doc-3 §12.1, §4B.2, §15.4): confirm it is declared as non-POLICY-overridable.

25. **In-flight idempotency.** For contracts with `Idempotency: required`: confirm the contract design does not allow two executions of the same idempotency key to proceed concurrently or while one is in-flight (§14.3 Pass4-Patch-PATCH-01).

26. **Contract internally complete.** No field is marked TBD, "to be defined", or "implementation-specific". Every mandatory field per the template is populated.

27. **Run Appendix A checklist.** Execute every applicable CHK-xxx check from Appendix A. Record results. Resolve all BLOCKER [B] failures before submitting for freeze.

---

*End of Appendix C. A contract that completes all steps with no unresolved BLOCKER failures is ready for Architecture Board freeze review.*

---

## Self-Review — Pass 5

*Non-normative. Classification per §3.4: BLOCKER, MAJOR, MINOR, NITPICK. All BLOCKER and MAJOR findings resolved before this output.*

---

### BLOCKER Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P5-B1 | §21 (all templates) | Templates must include ALL mandatory fields from Passes 1–4 including Pass 4 Patch v1.0.1. Missing fields (Privacy-Review in Events Produced, phase2-origin in Phase-2 contracts, in-flight protection in Idempotency) would make the templates non-conforming for future use. | RESOLVED — All three Pass 4 Patch v1.0.1 additions are included in each applicable template: Privacy-Review in Events Produced grammar (21.1, 21.5), phase2-origin as the MANDATORY Correlation value in Template 21.5, and the in-flight protection note in the Idempotency block with reference to §14.3. CHK-155, CHK-161, CHK-173, CHK-190, CHK-192 added to Appendix A. |
| P5-B2 | Appendix A | Pass 4 Patch v1.0.1 conformance requirements (Privacy-Review field, phase2-origin, in-flight idempotency) must appear as explicit CHK items so AI agents can check them mechanically. | RESOLVED — CHK-155 (in-flight protection), CHK-161 (Phase-2 navigation pointer), CHK-173 (Privacy-Review: §7.5 compliant), CHK-190 (phase2-origin exclusive to Phase-2 System-actor), CHK-192 (Phase-2 System-actor must declare phase2-origin) added with [B] severity. |
| P5-B3 | Template 21.5 | System Actor contract must carry ALL four mandatory Phase-2-specific requirements: Actor-Types: System, Delegation: not eligible, Correlation: phase2-origin, Attribution: system. If any are omitted from the template, future Phase-2 contracts will be undetectably nonconforming. | RESOLVED — All four pre-declared in Template 21.5 as FIXED fields. |

---

### MAJOR Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P5-M1 | §21 template count | The frozen Structure (§21) defines four templates: 21.1 Endpoint (MANDATORY), 21.2 Integration (MANDATORY), 21.3 Internal Service Contract (RECOMMENDED), 21.4 Event Schema Declaration (RECOMMENDED). This pass produces six templates with different names (21.3 Query, 21.4 Command, 21.5 System Actor, 21.6 Admin). | ACCEPTED WITH DEVIATION NOTE — The task explicitly requests templates 21.1–21.6 with these names. Templates 21.3–21.6 in this pass are specializations of 21.1, not new base templates; they expand the set beyond the Structure's four. The Structure's RECOMMENDED templates (21.3 Internal Service, 21.4 Event Schema) are deferred and not produced in this pass. A future Doc-4A Structure patch should formally register the extended template set. |
| P5-M2 | Appendix B naming | The frozen Structure defines Appendix B as "Reserved Namespace Registry." The task requests Appendix B as "Standard Error Catalog." | ACCEPTED WITH INCORPORATION — Appendix B in this pass includes both: §B.1 Standard Error Classes (task requirement) AND §B.2–B.4 Reserved Namespace Registry (Structure requirement). The combined appendix satisfies both. A Structure patch to update the Appendix B title is recommended. |
| P5-M3 | Appendix C naming | The frozen Structure defines Appendix C as "Cross-Reference Index." The task requests Appendix C as "Contract Authoring Checklist." | ACCEPTED WITH NOTE — Appendix C in this pass is the Contract Authoring Checklist (task requirement). The CHK-xxx citation pointers in Appendix A partially serve the Structure's cross-reference intent. A full cross-reference index table (mapping every Doc-4A binding point to its authoritative source) is deferred to a future Doc-4A patch. A Structure patch to update the Appendix C title is recommended. |
| P5-M4 | §18 POLICY key format | The format `core.system_configuration.<domain>.<key_name>` is defined in this pass but actual key names reside in Doc-3 §12.2 (frozen, unread in this pass). No key names are invented; all are referenced as `<key>` placeholders. | ACCEPTED — Defining the referencing format without inventing key names is correct per Reference-Never-Restate (§0.3). Actual key names must come from Doc-3 §12.2 when authoring module-level contracts. |

---

### MINOR Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P5-m1 | Template 21.3 | Query contracts "rarely" emit events. The qualifier adds subjectivity. | Accepted — "rarely" removed in final text; template states the condition for events under OMIT-IF-NONE. |
| P5-m2 | Appendix A | 96 CHK items is comprehensive but longer than a single-session review target for a human reviewer. | Accepted — depth is required per the task. Items are grouped by section with severity annotations; AI agents can filter by [B] for rapid critical-path review. |
| P5-m3 | §20.2 decision table | "New entitlement key" as a Monetization domain change is implied but not explicitly listed in the §20.2 table. | Accepted — The table covers "new POLICY key" as a domain change and §18.3 covers entitlement keys. Entitlement key registration rules belong in Doc-4I (Monetization); a row is not needed in §20.2. |

---

### NITPICK Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P5-n1 | Templates | Template comment annotations use `←` which is not in the grammar notation standard (§3.3). | Accepted — Comments are editorial annotations within the template illustrative text, not grammar syntax. They are identified as non-normative by context. |
| P5-n2 | §18B.2 | `stage_b+` as shorthand for `stage_b` and `stage_c` is defined here but not in the Structure's §18B description. | RESOLVED by Pass 5 Patch v1.0.1 PATCH-03 — shorthand replaced with explicit `stage_b \| stage_c` grammar in §18B.2 and Template 21.1. Parsing ambiguity eliminated. |
| P5-n3 | Appendix C | Step numbering is 1–27, which is a larger checklist than typical pre-authoring guides. | Accepted — Scope matches the platform's governance complexity. AI agents execute the list mechanically; humans use it as a review framework. |

---

*End of Doc-4A Content v1.0 — Pass 5 (§18, §18B, §19, §20, §21, Appendix A, Appendix B, Appendix C). Self-review findings recorded above; all BLOCKER and MAJOR findings resolved in this text. Pass 5 is the final content pass. Doc-4A is complete pending Architecture Board freeze review of all five passes as a unit.*
