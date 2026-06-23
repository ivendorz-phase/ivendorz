# Doc-4A — API Standards & Conventions — Content v1.0, Pass 2 (§4–§8)

| Field | Value |
|---|---|
| Document | Doc-4A — API Standards & Conventions |
| Pass | 2 of N — §4, §4B, §5, §6, §6B, §7, §8 only |
| Structure | Conforms to Doc-4A_Structure_v1.0_FROZEN.md |
| Builds On | Doc-4A_Content_v1.0_Pass1.md (§0–§3, APPROVED) — notation per §3.3, keywords per §3.4, citations per §3.5 |
| Authority | Doc-4_Governance_Note_v1.0.md |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2 — all FROZEN |
| Contains | Standards only — no entities, no workflows, no endpoints |

---

## §4 — Module Ownership & API Surface Topology

### 4.1 Ownership Rules

- Every entity has exactly one Owner Module (Master Architecture §16; ADR-017; ownership assignments per Doc-2 §3). Doc-4 documents **MUST NOT** reassign, share, split, or duplicate ownership of any entity.
- Every contract has exactly one Owner Module: the module that owns the entity (or aggregate root) the contract primarily mutates or exposes. The Owner Module field of Template 21.1 **MUST** name it.
- A contract **MUST** appear only in its Owner Module's document (§1.3).
- Aggregate discipline: child entities are modified only through their aggregate root's contracts (Doc-2 §0.4, §2). A Doc-4 document **MUST NOT** define a contract that mutates a child entity outside its root.

### 4.2 API Surface Composition

Each module exposes exactly three surface kinds (Master Architecture §16.4):

| Surface | Meaning | Doc-4 treatment |
|---|---|---|
| **Commands** | Mutating operations on the module's own entities | Template 21.1 (MANDATORY) |
| **Queries** | Read operations over the module's own entities (including its derived read-models) | Template 21.1 (MANDATORY) |
| **Events** | Facts emitted via the transactional outbox, per the catalog (Doc-2 §8) | §16 declaration; Template 21.4 (RECOMMENDED) |

Cross-module interaction uses only **Services, Events, and Public Contracts** (Master Architecture §16). Synchronous cross-module calls are service calls to the owning module's Commands/Queries (Template 21.3 RECOMMENDED for their declaration).

### 4.3 Prohibited Interaction Patterns

The following are conformance failures in any Doc-4 document, with no exceptions:

- A contract by which one module **mutates another module's entity** — directly, via "helper" endpoints, via shared tables, or via batch jobs. Cross-module effects occur only by the target module consuming an event or receiving a service call to its own contract.
- A contract that **reads another module's tables** or reshapes another module's entity representation (§10). Reads cross modules only via the owning module's Queries.
- A contract that introduces a **cross-schema foreign key** or assumes one (Doc-2 §0.3).
- A contract placed in the **Shared Kernel (Module 0)** that contains business logic. Module 0 contracts are infrastructure only — audit, outbox, ID generation, system configuration, feature flags (Master Architecture §17.1). Placing a business rule in Doc-4B because it is "shared" is shared-kernel abuse and **MUST** be rejected at review.
- A contract that creates an **alternate workflow** around an owning module's contract (e.g., a convenience endpoint that combines another module's command with local writes in one operation). Composition across modules is expressed as events or as explicitly declared service-call sequences, never as merged contracts.

### 4.4 Integration Single-Authorship Rule

- Every integration (event-driven or service-call) is authored **once**, in the **source module's** document, using Template 21.2 with all eight Authoring-Rule-8 fields.
- The target module's document **MUST** reference the integration by pointer and **MUST NOT** restate its payload, trigger, or failure handling.
- For event integrations, the source is the emitting module per Doc-2 §8. For service-call integrations, the source is the calling module; the called contract itself remains authored by its Owner Module under Template 21.1/21.3.
- Doc-4L indexes integrations and is non-normative (§1.3).

### 4.5 Cross-Module Reference Expectations

Contracts that accept or return references to another module's entities **MUST** declare:

- The reference as a bare identifier (per §8), named for the target entity (Doc-2 §0.3).
- **Write-time validation**: the referenced ID is validated against the owning module's Query/Service before the write commits (Master Architecture §16.4). The Validation Rules field **MUST** name this check.
- Tolerance of asynchronous repair: referential integrity across modules is reconciled by the periodic integrity audit job (Master Architecture §16.4); contracts **MUST NOT** assume database-enforced cross-module integrity.

### 4.6 AI-Agent Boundary Rule

Code generated against Doc-4 contracts **MUST** live inside the Owner Module; agents **MUST NOT** generate cross-module table access, entity modification, or contract bypass — such output fails CI and review (Master Architecture §16.4, §22.7).

---

## §4B — Governance Signal Firewall Standard

### 4B.1 Protected Signals and Ownership

The five governance signals, their owners, and scope are fixed by Master Architecture §1.5 (by pointer). Doc-4 documents **MUST** use exactly these five signal names (§3.6): Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer Vendor Status. The set is exhaustive; no Doc-4 document may introduce a sixth signal or a composite signal.

**Carve-out — Matching Confidence.** Matching Confidence (Master Architecture §12.6; Doc-3 §6, by pointer) is a frozen, architecture-defined composite *computation* that consumes governance signals as weighted inputs inside the RFQ routing pipeline. It is not a sixth governance signal and is not prohibited by this rule. Contracts **MAY** bind to Matching Confidence exactly as Doc-3 §6 defines it; they **MUST NOT** define any other composite over governance signals, and **MUST NOT** persist Matching Confidence outputs as authoritative signal values (they are derived data per §7.2).

### 4B.2 Firewall Rules (contract obligations)

Restated as binding contract rules (sources: Master Architecture §1.5, §12.4, §22.2; Doc-3 §12.1 FIXED; ADR-006 Amendments F–G; ADR-007 Amendment E):

- No contract **MAY** accept one signal as an input that mutates another signal. Specifically: Financial Tier **MUST NOT** influence Trust Score or Performance Score; Buyer Vendor Status **MUST NOT** mutate any platform-wide score. (Internal composition rules of the Trust Score engine — e.g., weighting of secondary signals — are owned by ADR-003 and the Trust module's documents, not by this contract standard.)
- No contract **MAY** allow payment state, subscription, plan, entitlement, or any monetization input to influence trust, verification, eligibility, routing fairness, or matching confidence (ADR-011; Doc-3 §12.1). Entitlements gate visibility, volume, analytics, advertising, and microsite capability only (§18).
- No contract **MAY** introduce routing bias from any single signal: no single governance signal may dominate matching decisions (Master Architecture §1.5).
- Signal values are written **only** by the owner module's own contracts. All other modules read signals via the owner's Queries (§4.3) and **MUST** treat them as opaque values: no recomputation, no caching as authoritative data, no derivation of new persistent scores (derived read-models per Doc-2 §6 are regenerable and non-authoritative).
- Buyer Vendor Status is buyer-private (owner: Business Operations, Vendor CRM). It is readable cross-module **only** by the RFQ routing pipeline as a binary pre-gate via service (ADR-007), and **MUST NOT** appear in any vendor-facing or third-party-facing contract surface (§7).

### 4B.3 Event-Synchronized Signal Data

Where signal-adjacent data is synchronized across modules by events (e.g., `VendorTierChanged` with `tier_type` discriminator; Doc-2 §8), contracts **MUST** preserve the ownership split exactly as the catalog defines it. A consuming module writes only the tables it owns; a contract **MUST NOT** shortcut event synchronization with a direct write (the canonical example: Trust never writes `marketplace.financial_tier_history`; Doc-2 §8, by pointer).

### 4B.4 Firewall-Compliance Declaration

Every contract that reads, writes, displays, or routes on any governance signal **MUST** include a firewall-compliance declaration with exactly these fields:

```
Signals-Read:         <signal name(s)> via <owner module> Query | none
Signals-Written:      <signal name(s)> (owner module's own contracts only) | none
Mutation-Inputs:      none | <enumerate every input that influences a signal write,
                      each with its Doc-2/Doc-3 source pointer>
Monetization-Inputs:  none | <entitlement key(s), gating visibility/volume/feature only, per §18>
Routing-Impact:       none | <pipeline binding per Doc-3 (cited by section), with the
                      no-single-signal-dominance constraint stated>
Disclosure:           none | <each surface on which a signal value appears, with its
                      audience class per §7.2 and §7.5 compliance statement>
```

Every field is mandatory for a signal-touching contract. Free-text assertions (e.g., "compliant by design") are nonconforming; each field **MUST** carry either the literal `none` or the enumerated, pointer-cited values above, so conformance is mechanically checkable (Appendix A).

A contract touching no signal omits the declaration. A signal-touching contract without it is nonconforming (Appendix A).

---

## §5 — Identity, Actor & Request Context Standard

### 5.1 Authentication Boundary

Authentication (login, sessions, OTP) is platform infrastructure (Master Architecture §1.3) and establishes only **who the user is**. Authorization is never derived from authentication alone; it is established per §6. Doc-4 contracts **MUST NOT** embed authentication mechanics; they assume an authenticated principal where the actor type requires one.

### 5.2 Actor Types

Every contract **MUST** declare which actor types may invoke it. The actor types are exactly those of the audit model (Master Architecture §14.2): **User**, **Admin**, **System**, **AI Agent**. No Doc-4 document may add actor types.

- **User** — an authenticated person acting within an active organization context (§5.3). All tenant business operations use this actor.
- **Admin** — platform staff. This actor space is internally differentiated by platform-staff permission bundles (Master Architecture §13.5): **Support Admin** (no private-RFQ read), **Verification Admin** (no finance-record read), **Super Admin** (all access; every action audited and flagged), plus operational staff bundles. Contracts for staff operations **MUST** declare the required `staff_*` slugs (Doc-2 §7), never staff role names.
- **System** — the platform acting on its own behalf (scheduled jobs, state-machine timers such as expiry, the outbox dispatcher, integrity audits). System-actor contracts are never user-invocable (§13); they carry no organization context unless operating on a specific tenant's record, in which case the record's own `organization_id` provides attribution scope.
- **AI Agent** — AI services and agents. AI-Agent contracts are advisory only (Master Architecture §18, Invariant 12): they **MUST NOT** write authoritative business data, **MUST** read only data the requesting organization can already access (Master Architecture §6.6), and are audited under the AI Agent actor type.

### 5.3 Active Organization Context

- Every User-actor business operation executes within a **server-validated active organization context**. Client-supplied organization identifiers are **never** trusted (Master Architecture §6.3).
- Contracts **MUST** treat the active organization as ambient, validated context — not as a client-controlled request field. A request contract **MUST NOT** include a field whose effect is "act as organization X" outside the validated context-switch mechanism owned by Identity (Doc-4C).
- Users act; organizations own (Master Architecture, Invariant 5): every record created through a contract is owned by the active organization (or, for delegated actions, attributed per §6B), never by the user personally. Solo traders operate through their auto-created organization (Master Architecture §5.2).

### 5.4 Attribution Expectations

Every mutating contract **MUST** record attribution per the standard columns (Doc-2 §0.2): `created_by`/`updated_by` (acting user), `organization_id` (owning organization), and the audit record's `actor_id`/`actor_type`/`organization_id` (Doc-2 §9, by pointer). Attribution fields are server-populated; request contracts **MUST NOT** accept them as inputs.

### 5.5 Context Propagation

- When a contract triggers asynchronous work (§15) or emits events (§16), the originating actor and organization context **MUST** propagate into the resulting audit records and event metadata, so downstream effects remain attributable to the originating action.
- Service-to-service calls between modules carry the originating context; a called module **MUST** re-verify authorization against that context (no transitive trust). Infrastructure-privileged execution paths (e.g., service-role database access) **MUST** still apply organization scope filtering, explicit authorization checks, and audit logging (Master Architecture §6.3).

### 5.6 Admin Context Model

Admin-actor contracts operate under a distinct context model:

- **No active organization context.** Admin actors do not act within a tenant organization and **MUST NOT** be modeled as members of one. An Admin contract's scope derives solely from `staff_*` slugs (Doc-2 §7) plus the contract's declared admin scope.
- **Declared admin scope.** Every Admin contract **MUST** declare one of: `platform-wide` (e.g., category management, configuration), `entity-scoped` (acting on one named entity, e.g., a verification decision on one vendor profile), or `tenant-data-access` (reading or correcting a tenant's records under a compliance basis). For `tenant-data-access`, the contract **MUST** cite its compliance basis in the corpus (Doc-2 §9 / Master Architecture §14, by pointer) — admin convenience is not a basis.
- **Bundle boundaries are binding.** Contracts **MUST** respect the staff separation rules (Master Architecture §13.5; Doc-2 §7): Support Admin contracts never read private RFQs; Verification Admin contracts never read finance records; Super Admin access is permitted by contract but every invocation is audited and flagged.
- **No impersonation.** Admin contracts **MUST NOT** allow an admin to act *as* an organization or user (no context assumption, no on-behalf-of mutation through tenant contracts). Where the corpus requires platform action on tenant data (moderation, ban, tier override, redaction), it is an Admin contract on the admin surface with Admin attribution — never a borrowed tenant context. Operations with no such corpus basis are escalated (§0.6), not invented.
- **Attribution.** Admin mutations record actor type Admin with the acting staff user as `actor_id`; where they touch a tenant's record, the record's `organization_id` provides the tenant scope in audit (§5.4 applies unchanged).

---

## §6 — Authorization Declaration Standard

### 6.1 The Universal Authorization Contract

Every User-actor contract **MUST** declare its authorization as the three-layer check (Master Architecture §13.2):

```
Active Membership (in the active organization)
+ Permission Slug(s) (held by the user in that organization)
+ Resource Ownership / Scope (the resource belongs to, or is granted to, that organization)
        OR
Active Delegation Grant path (§6B)
= Access
```

All three layers are mandatory; a Doc-4 contract **MUST NOT** abbreviate the check to membership-only or slug-only. Scope distinctions (e.g., own-records vs all-org-records slugs) **MUST** be declared explicitly where Doc-2 §7 defines them.

### 6.2 Slugs Are the Only Authorization Vocabulary

- Required Permissions **MUST** be expressed as permission slugs that exist in Doc-2 §7 (organization space `can_*`; platform space `staff_*`). Citations by pointer; the catalog is never restated (§0.3).
- **Roles are not permissions.** Role bundles are per-organization convenience presets (Master Architecture §13.3); a contract **MUST NOT** condition on a role name, and **MUST NOT** assume any slug-to-role mapping beyond "the slug is held".
- **Plans are not permissions.** A contract **MUST NOT** condition on plan or subscription names; entitlement gating uses entitlement keys via the Monetization service (§18; ADR-011).
- **Organizations do not bypass permissions.** Organization Workflow Settings (Master Architecture §13.4) configure approval chains and thresholds; they **MUST NOT** be declared as substitutes for slug checks. A workflow setting may add required approvals; it may never remove a required slug.
- Platform-staff contracts use `staff_*` slugs only; the organization and staff slug spaces **MUST NOT** be mixed in one declaration.

### 6.3 Declaration Syntax

The Required Permissions field of Template 21.1 **MUST** be declared as:

```
Actor:        <User | Admin | System | AI Agent>
Membership:   <active membership required in active organization | n/a per actor type>
Slugs:        <slug list, source Doc-2 §7; AND/OR composition stated explicitly>
Scope:        <resource-scope condition, stated against the owning entity's organization_id
               or the governing grant table (§7.3)>
Delegation:   <not eligible | eligible per §6B declaration>
```

### 6.4 Missing-Permission Escalation Rule

If an operation has no suitable slug in Doc-2 §7:

1. The author (human or AI agent) **MUST NOT** invent a slug, reuse a semantically wrong slug, or widen an existing slug's meaning.
2. The author **MUST** apply flag-and-halt (§0.6) and escalate for a Doc-2 patch decision.
3. The contract remains unauthored until the decision; a placeholder slug is a conformance failure (also §0.5).

---

## §6B — Delegation Grant Declaration Standard

Delegation Grants (Master Architecture §6.5, §7.3; ADR-005; entity per Doc-2 §3 / state machine per Doc-2 §5.10, all by pointer) are the only mechanism by which one organization acts for a vendor profile it does not control.

### 6B.1 Delegation Eligibility Declaration

- Every contract **MUST** declare whether it is delegation-eligible (§6.3 `Delegation:` field). Eligibility is restrictive by default: a contract is **not** delegation-eligible unless its declaration says so.
- Only operations within the representative scope defined by the frozen corpus **MAY** be declared eligible (indicatively: viewing routed RFQs, responding to invitations, submitting quotations, managing leads — Master Architecture §7.3; slugs marked "also via delegation grant" in Doc-2 §7).
- **Never delegation-eligible** (ownership-class actions; Master Architecture §7.3; Doc-2 §10 grant constraints): ownership transfer, subscription and billing management, vendor profile deletion, verification record modification, delegation grant issuance/revocation for the profile. A Doc-4 document declaring any of these delegation-eligible is nonconforming.

### 6B.2 The Delegated Access Check (no permission inheritance)

A delegated invocation **MUST** satisfy **all** of the following — the grant does not replace the acting user's own authorization inside the representative organization:

1. The acting user holds an **active membership** in the representative organization (the active context).
2. The acting user holds the required **slug** within the representative organization.
3. The representative organization holds an **active Delegation Grant** on the target vendor profile whose `permission_set` includes that slug, and whose validity window covers the invocation time, and whose status is active (Doc-2 §5.10).
4. The operation's resource scope resolves against the **vendor profile** named by the grant — never against the representative organization's own records, and never against any other vendor profile.
5. The target **vendor profile is itself in a state permitting the operation** (per its lifecycle, Doc-2 §5): an active grant **MUST NOT** authorize operations on a suspended or banned vendor profile beyond what the profile's own state permits. A delegation grant never overrides profile state.

A grant conveys exactly the slugs in its `permission_set`; nothing is inherited from the controlling organization's roles, bundles, or entitlements. (Basis: the access formula and worked delegation example, Master Architecture §13.2; Doc-2 §7 delegation annotations.)

### 6B.3 Attribution (mandatory, unambiguous)

Every delegated mutation **MUST** record, and its contract **MUST** declare, all four attributions:

| Attribution | Recorded as |
|---|---|
| Acting user | `created_by`/`updated_by`; audit `actor_id` (actor type User) |
| Acting (representative) organization | audit `organization_id`; the membership context of the action |
| Represented vendor profile | the operation's `vendor_profile_id` anchor; business ownership of the produced record follows the frozen ownership rules (e.g., quotations belong to the Vendor Profile — Master Architecture §7.4) |
| Controlling organization | quota/usage consumption and billing attribution (Master Architecture §7.4: representatives act, owners pay); party anchor columns per Doc-2 §6 |

Contracts **MUST NOT** attribute a delegated action to the controlling organization as actor, and **MUST NOT** attribute quota to the representative. The audit trail must allow full reconstruction: who acted, for which profile, under which grant.

### 6B.4 Cross-Representative Consistency

Delegation never multiplies business records: one vendor profile = one active quotation per RFQ regardless of how many representatives act (Master Architecture §7.4, as accounted by Doc-3 §10 as amended by PATCH-D3-01, by pointer). Contracts for delegated submission **MUST** declare their behavior against an existing active quotation strictly in terms of the legal options (replace draft, revise, withdraw-then-submit) — never a second active quotation.

### 6B.5 Suspension and Revocation Behavior

- Grant suspension/revocation takes effect at the authorization check: subsequent invocations under the grant **MUST** fail the §6B.2 check (no grace period unless the corpus defines one).
- Revocation **MUST** trigger removal of the representative's materialized access rows (grantee and visibility rows; Doc-2 §6, §10), with removals audited. Contracts **MUST NOT** leave delegated visibility standing after revocation.
- Records produced before revocation are unaffected: they belong to the vendor profile and survive with their original attribution (identity persists; Master Architecture §7.5–7.6 doctrine).
- Disclosure: a revoked representative's subsequent access failures **MUST** follow §7 non-disclosure semantics with respect to any facts the organization no longer has a right to see.

---

## §7 — Multi-Tenancy, Visibility & Non-Disclosure Standard

### 7.1 Default-Private Doctrine

Everything is private unless declared shared (by grant) or public (by design) (Master Architecture §6.1; tenancy classes per Doc-2 §0.4 with the entity classification in Doc-2 §6, by pointer). Every contract **MUST** state, for each entity representation it returns, which tenancy class governs it; a contract returning tenant-owned data **MUST** scope it to the active organization.

### 7.2 Tenancy Classes at the Surface

| Class (Doc-2 §0.4) | Contract behavior |
|---|---|
| **tenant-owned** | Readable/writable only within the owning organization's context (or platform compliance under `staff_*` slugs where Doc-2 §9 provides). Never enumerable across tenants. |
| **shared** | Readable by the granted/party organizations only, through the governing grant table or party columns (§7.3). Grant existence is itself access-controlled. |
| **platform-owned** | Exposed only through platform/staff contracts or as the corpus explicitly publishes (e.g., categories). |
| **derived** | Regenerable read-models; **MUST NOT** be exposed as authoritative; exposure inherits the visibility of their authoritative sources — a derived model **MUST NOT** widen visibility. |

### 7.3 Shared Access Is Grant-Shaped

- Cross-tenant visibility exists **only** through explicit grant rows or party columns (Master Architecture §6.2; canonical anchors per Doc-2 §6: invitation grantee rows, visibility rows, thread participants, party columns on dual-party entities). Contracts **MUST** name the governing grant table or party column in their Scope declaration (§6.3).
- Contracts **MUST NOT** create cross-tenant visibility via flags, query logic, "public unless private" defaults, or computed access.
- Vendor-side access anchors are materialized rows maintained by services; access rules **MUST NOT** depend on cross-schema ownership traversal (Doc-2 §6, §11 rule 9).
- RLS is defense-in-depth behind application-layer authorization (Master Architecture §6.3); a Doc-4 contract **MUST NOT** cite RLS as its authorization mechanism.

### 7.4 Cross-Tenant Communication

Cross-tenant interaction flows only through controlled channels owned by the Communication module or through the shared business entities the corpus defines (Master Architecture §6.4). No contract may expose private notes, internal ratings, internal scores, or finance data across the tenant boundary.

### 7.5 Non-Disclosure Indistinguishability Invariant (normative home)

The following facts **MUST** be undiscoverable by any party other than the owning buyer organization and platform compliance: blacklist status, routing exclusion and exclusion decisions, private CRM relationship existence and content, Buyer Vendor Status, and private-public link facts (`link_suggestions`) (ADR-007 Amendment C; Doc-2 §6 hard rules; Doc-3 §12.1 FIXED).

**The indistinguishability test:** for any excluded/blacklisted/privately-recorded vendor, every observable surface behavior **MUST** be identical to that for a vendor that simply never matched. This invariant binds across **all** channels:

| Channel | Obligation |
|---|---|
| Responses | No field, flag, or omission pattern reveals exclusion or private status. |
| Errors | No-access and not-found are indistinguishable for protected facts (§12); error text never names a protected cause. |
| Counts & totals | Aggregates, dashboards, and pagination totals **MUST** apply exclusions identically to item lists (§10); no count may differ in a way that reveals an exclusion. |
| Pagination & sorting | Page boundaries, ordering, and stable cursors **MUST NOT** shift in vendor-observable ways attributable to protected facts. |
| Timing | Contracts **MUST NOT** specify behavior whose processing path differs observably for protected facts (e.g., synchronous early-exit on blacklist); protected gating occurs inside asynchronous or uniform paths. |
| Ranking & recommendations | Ordering positions, ranking outputs, recommendation lists, "similar vendor" surfaces, and AI suggestions **MUST NOT** reveal protected facts: a vendor excluded by a protected fact appears (or is absent) exactly as a never-matched vendor would; recommendation contracts **MUST** declare that protected facts are not features of their inputs. |
| Logs, events, notifications | Protected facts never appear in vendor-facing notifications, event payloads readable by non-owners, or any exported artifact. |

Disclosure to the deciding buyer and platform compliance follows the corpus rules (Master Architecture §14.6); that disclosure path **MUST** itself be declared and audited.

### 7.6 Review Obligation

Every list, count, search, and analytics contract in every module document **MUST** carry an explicit statement of how §7.5 is satisfied (or a statement that no protected facts are in scope). Absence of the statement is a conformance failure (Appendix A).

---

## §8 — Identifier & Entity Reference Standard

### 8.1 UUIDv7 Authority

- The machine identifier of every business entity is **UUIDv7**, generated by the Shared Kernel ID service (Master Architecture §17.2; Doc-2 §0.1). In every contract payload, **UUIDv7 is the only canonical reference**: all entity references, cross-module references, event payload references, and audit entity references **MUST** be UUIDv7 values.
- Identifiers never change. Contracts **MUST NOT** define identifier mutation, re-issue, or aliasing.

### 8.2 Human References

- `human_ref` (Doc-2 §0.1) is display and lookup convenience only. Lookup contracts **MAY** accept a `human_ref` to resolve an entity; every other use **MUST** carry UUIDv7.
- Contracts **MUST NOT**: use `human_ref` as a reference field in payloads, events, or stored cross-references; treat `human_ref` as unique across entity types or years beyond what Doc-2 §0.1 guarantees; or mint, predict, or reserve `human_ref` values client-side.
- Human references are never reused, including after soft delete and restore (Master Architecture §17.2); no contract may imply otherwise.

### 8.3 Entity Reference Rules

- Reference fields are named for the target entity (`vendor_profile_id`, `organization_id`, …; Doc-2 §0.3). Generic names (`ref`, `target_id`, `parent_id` without entity meaning) are prohibited in contract payloads.
- A reference **MUST** point at the entity the field names — never at a sibling, a version when the entity is meant, or vice versa. Where the corpus binds to a **version** (e.g., quotations bind to an RFQ version by ID; ADR-010), the contract **MUST** reference the version identifier explicitly and name it as such.

### 8.4 Cross-Module References

Cross-module references are bare UUIDv7 values (no cross-schema FKs; Doc-2 §0.3) and carry the §4.5 obligations: write-time validation via the owning module's service, and reconciliation by the integrity audit job. Contracts **MUST NOT** define cascading behavior across module boundaries (no cross-module cascade delete/update); lifecycle coupling across modules is expressed through events only.

### 8.5 Document and File References

- Documents, files, and generated artifacts are referenced **only** by document ID and, where versioned, document-version ID (ADR-010; Master Architecture §19). Contracts **MUST NOT** reference content by storage URL, path, or inline blob; URLs are ephemeral delivery mechanisms issued by the owning module's contracts, never stored references.
- Audit and event payloads reference document versions by ID; large objects never enter audit or event records (Master Architecture §14.4; §16 by pointer).

### 8.6 No Alternate Reference Paths

A contract **MUST NOT** establish any identifier scheme beyond UUIDv7 + `human_ref` (e.g., slugs-as-keys, composite natural keys, external IDs as primary references). Where external systems require stable references (future scope), they map to UUIDv7 inside the platform; defining such mappings requires escalation (§0.6), not local invention.

---

*End of Doc-4A Content v1.0 — Pass 2 (§4, §4B, §5, §6, §6B, §7, §8). Board patches of review 4 applied (F-002, F-003, F-004, F-005, F-008, F-009, F-010). Review findings extracted to Doc-4A_Review_Log.md (non-normative). Next pass: §9–§12.*
