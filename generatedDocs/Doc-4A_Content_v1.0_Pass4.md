# Doc-4A — API Standards & Conventions — Content v1.0, Pass 4 (§13–§17)

| Field | Value |
|---|---|
| Document | Doc-4A — API Standards & Conventions |
| Pass | 4 of N — §13, §14, §15, §16, §17 only |
| Structure | Conforms to Doc-4A_Structure_v1.0_FROZEN.md |
| Builds On | Pass 1 (§0–§3, FROZEN), Pass 2 (§4–§8, FROZEN), Pass 3 (§9–§12, FROZEN, Patch v1.0.1 applied) — notation per §3.3, keywords per §3.4, citations per §3.5 |
| Authority | Doc-4_Governance_Note_v1.0.md |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2 — all FROZEN |
| Contains | Standards only — no entities, no workflows, no endpoints |
| Audience | Claude Code, Cursor, AI development agents, backend, frontend, QA engineers |
| Review Findings | Recorded in Doc-4A_Review_Log.md (non-normative), per Board decision; all BLOCKER/MAJOR resolved in this text |

---

## §13 — State Machine Interaction Standard

### 13.1 Authoritative State Machine Source

The state machines for all platform entities are defined exclusively in Doc-2 §5 (and as amended by Doc-2 patches, cited per §3.5). They are the sole authoritative source. Doc-4 contracts do not extend, modify, redefine, rename, or restate them. A contract in any Doc-4 document that contradicts or supplements a Doc-2 §5 state machine is nonconforming and **MUST** be escalated (§0.6).

Every contract that drives a state transition **MUST** declare a State Machine Effects block as part of its endpoint contract (Template 21.1). The declaration expresses: which entity transitions, the legal pre-state(s), the resulting post-state, the actor constraint, and the authoritative source pointer. The declaration **binds** the contract to the frozen state machine; it does not define or create any transition.

A contract that causes no state transition (a pure Query, or a mutation of non-state fields) **MUST** declare `State-Machine-Effects: none` in Template 21.1. Absence of the field is a conformance failure (Appendix A).

### 13.2 State Machine Effects Declaration Grammar

The State Machine Effects field of Template 21.1 **MUST** use the following form for every state-transitioning contract:

```
Entity:          <entity name per §3.1>
Pre-states:      <list of legal pre-states, quoted verbatim from Doc-2 §5 per §3.1>
Post-state:      <resulting state, verbatim from Doc-2 §5> | see Conditional
Conditional:     <branching logic cited by pointer: "per Doc-2 §5.<n>"> | omit if not applicable
Actor:           <User | Admin | System | AI Agent — MUST match §5.2 declaration>
Transition-Ref:  Doc-2 §5.<subsection> [as amended by <PATCH-ID> per §3.5]
```

Rules:

- `Pre-states` and `Post-state` values **MUST** be quoted verbatim from the cited Doc-2 §5 source. Paraphrases, renamed states, and re-ordered state lists are nonconforming (§3.1).
- `Conditional` is populated only when Doc-2 §5 defines branching outcomes for the same command (e.g., a review decision that may produce different post-states based on context). The branching conditions **MUST** be cited by pointer; they **MUST NOT** be restated.
- `Pre-states: any non-corpus-terminal` is permitted only where the Doc-2 §5 transition explicitly applies to all non-terminal states for that entity (e.g., a hard-cancel command); the contract **MUST** cite the corpus basis for this claim. This shorthand is not a license to avoid enumerating known pre-states.
- A single command that transitions multiple entities within the same aggregate (e.g., a parent and its dependent child per Doc-2 §2) **MUST** declare one State Machine Effects block per entity. When multiple blocks are declared, they are sequenced one after the other within the State Machine Effects field, each block using the full grammar above, separated by a blank line. A comment line (beginning with `#` followed by the entity name) **SHOULD** precede each block to aid review navigation; the entity name in the comment **MUST** match the `Entity:` field value in that block. Blocks are ordered by aggregate mutation sequence — aggregate root first, then dependent children per Doc-2 §2 composition.
- A contract whose action has conditional state effect (transitions some entities, not others, based on business rules) **MUST** declare a block for each conditional outcome, with the condition cited by pointer.

### 13.3 Command-Driven Transitions Only

State transitions occur **only** through contracts that explicitly declare State Machine Effects with a valid, corpus-sourced transition. The following are absolute conformance failures in any Doc-4 document:

- A request contract accepting an entity's lifecycle state as a writable input (§9.4).
- Achieving a state transition as a side effect of a field update — no "setting field X to value Y causes an implicit state change" patterns (§9.4 read-assertion clarification, PATCH-03).
- Defining a state transition in narrative prose without a State Machine Effects block — prose is non-normative; the block is the contract.
- A batch-update, scheduled-job, or trigger contract causing a state transition without itself being a declared command (with a State Machine Effects block and an appropriate actor declaration).

Field mutations and state transitions are orthogonal. A contract that mutates fields **and** triggers a transition **MUST** declare both independently: the request payload fields (§9) and the State Machine Effects block.

### 13.4 Transition Ownership

Transitions on an entity are owned exclusively by the entity's Owner Module (§4.1). This rule binds at the contract layer:

- Only the Owner Module's contracts may declare State Machine Effects on that entity. A contract authored by any other module **MUST NOT** declare, imply, or trigger a state transition on an entity it does not own.
- Cross-module events may carry facts that cause a consuming module's own entities to transition; this is permissible. The emitting contract does not declare the consuming module's transition: the consuming module's own System-actor or command contract declares and executes its own transition in response to the event. The emitting contract declares only the events it produces (§16.3).
- A consuming module **MUST NOT** write another module's entity state field directly in response to an event. Consumer effects are limited to the consuming module's own entities (§4.3; §16.7).

### 13.5 Actor-Restricted Transitions

Every declared transition carries an Actor constraint that **MUST** match the contract's §5.2 actor declaration and the Doc-2 §5 actor designation for that transition.

- **System-actor transitions** (state-machine timers, expiry processors, scheduled integrity jobs) are **never user-invocable**. A User-actor or Admin-actor contract **MUST NOT** invoke, replicate, or approximate a System-actor transition by any alternative path.
- **Admin-actor transitions** (moderation decisions, verification outcomes, ban operations, tier overrides) **MUST** carry `staff_*` slugs with declared Admin scope (§5.6). They **MUST NOT** be triggerable by User-actor contracts through elevated assertions or ambient context elevation.
- **AI-Agent-actor contracts** (Master Architecture §18, Invariant 12) **MUST NOT** drive state transitions on authoritative business entities. An AI-Agent contract is read-only or advisory with respect to the state machine; any AI-advisory-informed transition is authored as a command under the User or System actor that accepted and acted on the advisory — never directly under the AI Agent actor.

### 13.6 Terminal States

Terminal states — those from which no further corpus-defined transitions exist per Doc-2 §5 (cited by pointer for each entity) — are permanent:

- A contract **MUST NOT** declare a `Pre-states` value that is terminal for the entity. Doing so is a conformance failure (Appendix A).
- A contract **MUST NOT** define a "reopen" or "reactivate" path from a terminal state without a corresponding Doc-2 §5 transition. Inventing such a path without a corpus change requires escalation (§0.6), never local invention.
- Where Doc-2 §5 defines a recovery path from a non-terminal suspended or restricted state (e.g., a platform-actor reinstatement), the contract may declare that transition; it is not terminal. The distinction is determined by the corpus, not by the contract author.

### 13.7 Version-Bound State Machines

For entities with versioned variants (ADR-010; e.g., RFQ versions, document versions per Doc-2 §5):

- The version entity carries its own state machine, separate from the base entity's.
- Contracts operating on a versioned entity **MUST** reference the version entity's state machine via its `Transition-Ref`. Using the base entity's transition reference for a version-level operation is nonconforming.
- A contract **MUST NOT** use a base-entity state transition to imply a version-level outcome, or apply a version-entity transition declaration to the base entity.

### 13.8 Illegal-Transition Rejection Semantics

When a command arrives with the target entity not in a declared `Pre-states` value:

- The contract **MUST** return a `STATE` error class (§12.2), at validation Category 6 (§11.2, V6).
- The `STATE` error **MAY** disclose the entity's current state and the legal transitions **only** to callers whose scope already permits reading that state (§12.5). Where the entity's state is itself governed by non-disclosure rules (the state's existence constitutes a protected fact from the requester's perspective), the protected-fact collapse rule (§12.4) applies in place of the standard `STATE` error — the response **MUST** be `NOT_FOUND` with the entity-never-existed shape.
- Contracts whose Pre-state set includes states that are non-disclosable to the requesting actor **MUST** declare an Error Boundary block (§12.4) specifying, per failure point, whether a STATE rejection for a protected pre-state maps to `NOT_FOUND | collapse-rule` or `STATE`.

### 13.9 Prohibited State-Interaction Patterns

The following are conformance failures in any Doc-4 document:

| Prohibited pattern | Governing rule |
|---|---|
| State field accepted as request input in a mutating contract | §9.4; §13.3 |
| State transition declared without a State Machine Effects block | §13.2 |
| State Machine Effects declared on another module's entity | §13.4 |
| Terminal state value appearing in Pre-states | §13.6 |
| User-actor or Admin-actor contract replicating a System-actor transition | §13.5 |
| AI-Agent contract declaring a state transition | §13.5 |
| Inline state machine definition (states or transitions listed in a Doc-4 contract body) | §0.3; §13.1 |
| "Field update implies transition" design pattern | §13.3 |
| Reopening a terminal state without a Doc-2 §5 corpus basis | §13.6; §0.6 |
| Cross-module contract directly writing another module's entity state | §13.4; §4.3 |

---

## §14 — Idempotency & Concurrency Standard

### 14.1 Idempotency Requirement

An operation is **unsafe** if it has non-idempotent side effects: it creates a new entity, drives a state transition, consumes quota, records an audit entry, or emits an outbox event. All unsafe operations **MUST** declare an idempotency model: either an idempotency key declaration (§14.2) for operations where the same request may be safely replayed, or an optimistic-concurrency declaration (§14.5) for update commands where concurrent writes must be prevented.

A pure Query contract (no mutations, no state side effects) **MUST** declare `Idempotency: not-applicable` to make the absence of the requirement explicit. Absence of the `Idempotency` field entirely is a conformance failure (Appendix A).

This requirement is motivated by the realities of distributed clients: network timeouts, browser retries, mobile application restarts, API retry libraries, and queue redelivery all produce repeated submissions that the contract layer must handle safely without relying on client coordination.

### 14.2 Idempotency Key Declaration

Contracts that require an idempotency key **MUST** declare:

```
Idempotency:     required
Key-Scope:       organization | platform
Window:          <POLICY key (§18) governing the deduplication window duration>
Replay-Result:   cached-response | acknowledged
```

Rules:

- `Key-Scope: organization` — the key must be unique within the caller's active organization context for the declared deduplication window. Appropriate for operations that create or mutate tenant-owned entities.
- `Key-Scope: platform` — the key must be globally unique for the declared window. Reserved for operations that cross organizational scope or provision platform-wide resources; use is restricted and must cite the corpus basis.
- The deduplication window duration **MUST** reference a POLICY key (§18); hardcoded duration values are nonconforming.
- `Replay-Result: cached-response` — the stored outcome of the original execution is returned verbatim without re-execution. Used for synchronous commands where the original response is deterministic and safely cacheable.
- `Replay-Result: acknowledged` — for async commands (§15), the original Phase-1 acceptance acknowledgment is returned. The Phase-2 background work is not re-triggered.
- The idempotency key is a client-generated opaque string whose format, character set, and length constraints are development-document concerns. Doc-4 contracts declare only scope and window.
- The idempotency key **MUST** be declared as a metadata field of the contract's idempotency block — not as a business input in the request payload (§9.7). It is a replay-safety mechanism, not a business field.

### 14.3 Replay Behavior — The Joint Rule

When a request is replayed using the same idempotency key within the deduplication window, the platform **MUST** enforce all three of the following conditions jointly:

1. **Same result** — The contract returns the same outcome as the original execution (or `acknowledged` per §14.2 for async commands). The platform **MUST NOT** re-execute the command's business logic, state transitions, or side effects.
2. **No duplicate audit record** — The replayed request **MUST NOT** produce a second audit record for the business action (§17). The original audit record stands. System-level deduplication activity **MAY** be recorded per development-document policy, but this is not a business audit record.
3. **No duplicate outbox event** — The replayed request **MUST NOT** write a second event to the transactional outbox (§16.2). The original event stands; no second emission occurs.

**Implementation-neutral constraint**: Idempotency deduplication **MUST** be applied at the application layer before any transaction begins. A replay is detected and the stored result returned without initiating a new write transaction; the transactional outbox is not involved in the replay path. This is a contract-layer assertion checkable in design review; the implementation mechanism belongs in development documents.

**In-flight protection**: The joint rule applies regardless of whether the original execution has completed. A replay arriving while the original execution is still in-flight **MUST NOT** begin a second execution of the command's business logic. The platform **MUST** treat the in-flight original as the single execution for this idempotency key; duplicate business outcomes — a second state transition, a second audit record, a second outbox event — are prohibited under all timing conditions (completed, in-progress, or concurrent). The response the replaying client receives depends on implementation: it may receive the cached result once the original completes, or a response consistent with the contract's declared `Replay-Result` (§14.2). The specific detection and handling mechanism belongs in development documents.

This is the platform-wide replay safety invariant. Contracts **MUST** declare their idempotency model in terms that make this invariant verifiable by review and by Appendix A conformance checks.

### 14.4 Request Scenario Definitions

Contracts **MUST** be designed to handle all four scenarios deterministically. Authors and AI agents **MUST** verify their contract design against each:

| Scenario | Definition | Required contract behavior |
|---|---|---|
| **Safe replay** | The same request re-submitted with the same idempotency key within the deduplication window, after the original succeeded or failed definitively | Return stored result; no re-execution; no duplicate audit record or outbox event (§14.3 joint rule) |
| **Duplicate submission** | The same logical operation submitted twice with different idempotency keys (or without idempotency keys), or re-submitted after the deduplication window expires | Two independent executions; each produces its own outcome, audit record, and outbox events; business-level duplicate prevention is a BUSINESS-category validation rule (§11.2, Category 8), not an idempotency concern |
| **Concurrent submission** | Two in-flight requests for the same resource overlapping within the concurrency window | Handled by the concurrency model (§14.5); the losing request receives `CONFLICT` error (§12.2) |
| **Stale replay** | A replay attempted after the deduplication window has elapsed | The request executes against current state; if the entity has since transitioned to an incompatible state, `STATE` error (§12.2) applies per §13.8 |

### 14.5 Optimistic Concurrency Declaration

Update commands — commands that modify an existing entity's fields without necessarily driving a state transition — **SHOULD** declare optimistic concurrency to prevent lost updates:

```
Concurrency:     optimistic | none
Token:           updated_at | <named field>
```

- `updated_at` is the canonical concurrency token (§10.2); the canonical entity representation always includes it and it serves as the entity version for this purpose. Contracts **MUST NOT** define a separate version counter field when `updated_at` is available.
- A caller submits the token value it last read; the platform checks it matches the entity's current stored value before executing the write. If the values differ, `CONFLICT` (§12.2; retryable: true, after re-read) is returned.
- `Concurrency: none` is permitted only where the contract provides an explicit, documented justification for why concurrent writes cannot produce an inconsistency — for example, the mutated field has commutative semantics, or the operation is append-only with no constraint-bearing fields. Absence of such a justification is a SHOULD-violation and **MUST** be noted in the contract's rationale (§3.4).
- Idempotency keys and concurrency tokens serve distinct purposes and **MUST NOT** be conflated: the idempotency key prevents duplicate execution of the same request; the concurrency token prevents a write that would silently clobber a concurrent writer's change.

### 14.6 Idempotency vs Business Uniqueness

The idempotency system prevents duplicate execution of the same request. It does not prevent two different requests — each with a unique idempotency key — that happen to create the same business-logical duplicate (e.g., two independent users in the same organization submitting the same vendor without knowledge of each other).

Business uniqueness is a BUSINESS-category validation rule (§11.2, Category 8), declared in the Validation Rules field, citing its corpus basis (typically a Doc-2 §5 uniqueness constraint or a Doc-3 §10 operational rule, by pointer). The error class is `BUSINESS` (§12.2).

Contracts **MUST NOT** use idempotency keys as a substitute for business-uniqueness checks, and **MUST NOT** return `CONFLICT` (the concurrency class) for business-uniqueness violations. These are distinct failure modes with distinct error classes.

### 14.7 Retry and Error-Class Alignment

Contracts **MUST** declare, in their Error Boundary block (§12.4), which error classes are retryable for this contract and under what conditions. The declaration aligns with the §12.2 retryable defaults and **MUST** state the reason for any override of a default.

The following alignment rules apply:

- A contract that declares `Idempotency: required` **MUST** also declare `CONFLICT: retryable: true` where CONFLICT is possible — so that retrying a conflicting request is safe (the replay idempotency mechanism handles the idempotency invariant).
- A contract that declares `Concurrency: optimistic` **MUST** declare `CONFLICT: retryable: true, after re-read` — the caller re-reads the entity to get the current concurrency token before retrying.
- A contract that returns `QUOTA` **MUST** declare `QUOTA: retryable: false until quota changes` — consistent with §12.2 and the §11.2 Category 9 dual mapping.
- A contract that returns `RATE_LIMITED` **MUST** declare the reset interval POLICY key in its Error Behavior block — consistent with §12.2 and the §11.2 Category 9 dual mapping.

---

## §15 — Asynchronous Operation Standard

### 15.1 Accepted-Then-Processing Pattern

The canonical platform pattern for operations whose execution extends beyond the synchronous request lifecycle is **accepted-then-processing**:

**Phase 1 — Synchronous acceptance.** The contract executes all validation (§11.2 categories 1–9 in declared order), applies synchronous side effects — the entity transitions to the state Doc-2 §5 designates as the result of this command (which may be a processing, queued, or pending state) — records the audit entry (§17), emits the event(s) via the transactional outbox (§16.2), and returns the entity in its true post-Phase-1 state as determined by the state machine. Phase-1 always produces an authoritative, committed result.

**Phase 2 — Background execution.** The platform's async infrastructure processes the outbox event, executing further business logic, additional state transitions, downstream effects, and cross-module fan-out — all attributable to the originating actor and organization (§15.5). Phase-2 is owned and contracted by the module responsible for the background work.

Contracts **MUST** conform to this pattern for all async operations. Phase-1 validation **MUST NOT** be deferred into Phase-2. A contract **MUST NOT** claim synchronous completion of work that is actually async (§15.4).

### 15.2 Async Operation Declaration

Contracts with async execution **MUST** declare:

```
Execution:   async | sync
Phase-1:     <what happens synchronously: validation categories satisfied; state reached;
              events emitted (by name); audit recorded>
Phase-2:     <navigation pointer — owning module name; triggering event per Doc-2 §8;
              State Machine Effects, Audit Requirements, and Events Produced for Phase-2
              work are declared in the Phase-2 module's own System-actor contract, not here>
Observation: <how the caller observes the outcome: Query contract name | push channel | poll interval POLICY key>
```

Rules:

- `Execution: sync` is the default. A contract without async background work declares `sync` and omits Phase-2 and Observation.
- Phase-2 always belongs to a named owning module. The `Phase-2` field is a **navigation pointer only**: it names the owning module and triggering event so that reviewers and AI agents can locate the Phase-2 contract. The Phase-1 contract **MUST NOT** declare State Machine Effects (§13), Audit Requirements (§17), or Events Produced (§16.3) for Phase-2 work belonging to another module — those declarations are authored in the Phase-2 module's own System-actor contract, following the integration single-authorship rule (§4.4) and the One Entity = One Owner principle (§4.1). Where Phase-2 effects cross module boundaries via events, each module's Phase-2 contract declares its own async work independently.
- `Observation` names the interface through which the caller may observe progress — it is a contract-level declaration of observability, not an implementation instruction. It **MUST** name the owning module's Query contract as at minimum the authoritative observation path. A push channel **MAY** be listed as an additional delivery path (§15.7) but **MUST NOT** replace the Query.
- Contracts **MUST NOT** require the caller to observe progress for Phase-2 to complete. Phase-2 completion is not dependent on caller activity.

### 15.3 Progress and Outcome Observation

- Where a caller needs to observe the outcome of an async operation, the Owner Module **MUST** provide a Query contract that returns the entity's current state, which is the authoritative outcome indicator per the state machine (§13).
- The Phase-1 response carries the entity in its post-Phase-1 state — the state the corpus defines for the transition, which reflects Phase-1 completion accurately. This is the authoritative starting point; callers **MUST NOT** cache the Phase-1 response as the final outcome.
- When a caller queries the entity before Phase-2 completes, the Query returns the entity's current true state per the state machine (e.g., a processing or queued state). If the contract is a dedicated result-observation Query that delivers a result **only** upon completion, it **MUST** return the `ASYNC_PENDING` error class (§12.2) with `retryable: true` when Phase-2 is still in progress — not a fabricated partial result.
- The `ASYNC_PENDING` class applies only to dedicated result-observation queries, not to the general entity Query. The general entity Query always returns the entity's current authoritative state.

### 15.4 No-Fabricated-Activity Rule

Doc-3 §12.1 FIXED rules prohibit fabricated activity. This prohibition binds at the API contract layer as follows, with no POLICY-based override:

- A Phase-1 response **MUST NOT** claim that Phase-2 work has completed when it has not. The response reflects the entity's true committed state after Phase-1.
- A contract **MUST NOT** emit progress events or push notifications about async work that has not actually occurred (§15.7). No "processing started" event before processing begins, no "completed" notification before completion.
- Analytics counters, engagement metrics, activity feeds, and view counts **MUST NOT** be incremented by system-generated or AI-generated async work attributed as genuine user activity (Doc-3 §12.1 FIXED, by pointer).
- AI-generated advisory outputs (§5.2 AI Agent actor) **MUST NOT** be recorded in the system as authoritative business data, user-created content, verified platform facts, or user-attributed activity.

Any contract design that requires fabricating state to function correctly is a nonconforming design and **MUST** be escalated (§0.6). Doc-3 §12.1 is a FIXED invariant — it is not tunable by POLICY and admits no exception.

### 15.5 Async Ownership and Attribution

- Phase-2 async workers execute under the **System actor type** (§5.2). Their State Machine Effects (§13), Audit Requirements (§17), and Events Produced (§16.3) are declared in their own System-actor contracts, authored by the Phase-2 owning module under the integration single-authorship rule (§4.4). The Phase-1 contract declares the triggering event and observation interface only; it **MUST NOT** declare Phase-2 state effects belonging to another module.
- The originating actor and organization context from Phase-1 **MUST** propagate into all Phase-2 audit records. Phase-2 audit records declare: System as the executing actor, and the originating user and organization as the business-attribution context — a correlation linkage, not the System record's primary attribution (§17.3).
- Async workers **MUST NOT** create or modify records in violation of ownership rules. Cross-module entity creation is prohibited (§4.3). Records created in Phase-2 follow the corpus ownership rules of the created entity (e.g., records produced by the matching engine belong to their corpus-defined owners per Doc-2 §6, by pointer).
- Async workers **MUST** apply the same tenant-scope filtering as synchronous contracts. Phase-2 **MUST NOT** access records outside the tenancy scope of the triggering context.

### 15.6 Async Failure Handling

When Phase-2 execution fails:

- The Phase-2 worker transitions the entity to the appropriate failure or rejection state per Doc-2 §5 (by pointer for each entity). There is no universal "async error" state; failure states are entity-specific and corpus-defined.
- **No cross-module rollback**: Phase-1 effects — state transitions, audit records, emitted events — are not rolled back when Phase-2 fails. The transaction committed; its effects are permanent. Phase-2 failure is handled within the state machine.
- **Compensation is event-driven**: the failure state transition emits its own corpus-defined event (Doc-2 §8, by pointer); consuming modules react to the failure event. A contract **MUST NOT** define manual rollback paths that bypass the state machine.
- **No invented failure commands**: where an operation must be "undone," the corpus defines a compensating command (e.g., withdraw, cancel, reject) that drives its own corpus-defined state transition. The compensating command is declared as a separate contract by the Owner Module. A Doc-4 document **MUST NOT** invent compensating commands that have no Doc-2 §5 basis.
- Phase-2 infrastructure retry behavior (redelivery attempts, dead-letter queuing) is governed by the transactional outbox retry policy; contracts **MUST NOT** describe infrastructure retry behavior. Contracts describe state machine outcomes only.

### 15.7 Delivery Channels

Where the platform's push infrastructure delivers notifications of state changes (currently Supabase Realtime, per Master Architecture; cited by any ADR that binds to it):

- Push channels are **delivery channels only**: they deliver notifications derived from the authoritative database state. They are not authoritative data sources and **MUST NOT** be cited in any contract as the source of truth.
- A contract **MUST NOT** substitute a push notification for the owning module's Query contract. Clients obtain authoritative entity state by calling the Query; push is a convenience notification path.
- Push channel payload shapes **MUST** follow the event payload rules of §16 (thin payloads, no protected facts per §7.5, no other-tenant data).
- A push channel declaration in a contract is supplementary; it **MUST NOT** replace the Events Produced declaration (§16.3) for the same triggering mutation.
- Push delivery is not guaranteed (connectivity may be absent). Where the caller requires outcome confirmation, the owning module's Query contract is the authoritative fallback.

---

## §16 — Event Contract Standard

### 16.1 Events Are Facts

Events are **past-tense facts about things that happened** in the platform. This definition is normative and determines every rule in this section:

- Events **MUST** be named as past-tense facts in PascalCase (§3.2): `RFQSubmitted`, `QuotationWithdrawn`, `VendorProfileSuspended`.
- An event records what occurred; it does not issue instructions. Consumers **react** to facts; they do not obey commands.
- Events are **immutable**: once an event is recorded in the transactional outbox and delivered, it is never modified, retracted, or re-emitted with changed semantics. Corrections to a prior fact are new events.
- Events **MUST NOT** be used as an alternative mechanism to drive state transitions or business logic in a consuming module directly. A consuming module uses an event as a trigger to invoke its own authorized contracts, which then apply their own validation and state-machine rules (§13). The event does not bypass the consuming module's authorization, validation, or state checks.

### 16.2 Transactional Outbox Requirement

The transactional outbox pattern (Master Architecture §19; Module 0 infrastructure per Doc-4B) is **mandatory** for all events declared in Doc-4 contracts:

- The business write (entity mutation, state transition) and the event record **MUST** be committed atomically in the same database transaction. Events are **never** emitted after the transaction commits; emission is accomplished by writing to the outbox table within the transaction.
- This guarantees: no lost events (the business write cannot commit without the event record committing) and no phantom events (if the business write fails, the event record is rolled back with it).
- Every event in a contract's Events Produced declaration **MUST** carry `Outbox: yes`. An event declared without this field is nonconforming.
- The outbox dispatcher (a System-actor job owned by Module 0, per Doc-4B) delivers events with **at-least-once semantics** to all declared consumers. Consumers **MUST** be idempotent (§16.7) precisely because of this delivery guarantee. The dispatcher implementation is infrastructure; contracts bind only to the outbox write obligation, not to dispatcher internals.

### 16.3 Event Declaration Grammar

Every contract that produces or consumes events **MUST** declare them using the following grammars as part of the respective templates.

**Events Produced** (Template 21.1 field — declared by the producing contract):

```
Event:          <event_name — MUST exist in Doc-2 §8; never coined in a Doc-4 document>
Version:        <integer ≥ 1>
Trigger:        <the operation in this contract that causes emission>
Payload:        <field list in §9.1 notation; thin per §16.5>
Outbox:         yes
Source-Ref:     Doc-2 §8.<event_entry> [as amended by <PATCH-ID> per §3.5]
Privacy-Review: §7.5 compliant
```

**Events Consumed** (Template 21.2 Integration field — declared by the consuming module's integration contract):

```
Event:            <event_name>
Version:          <integer; or "≥ n" for declared forward compatibility>
Source-Module:    <emitting module per Doc-2 §8 — the authoritative owner>
Consumer-Effect:  <what this module does within its own entities on receipt;
                   MUST NOT mutate another module's entities>
Idempotency:      <how duplicate delivery is handled, stated testably>
Out-Of-Order:     <how an event arriving before its causal predecessor is handled — §16.8>
Failure:          <consumer failure behavior: retry per outbox retry POLICY key | DLQ per POLICY key | skip with audit>
```

All fields in both grammars are mandatory. A declaration with an empty or missing field is nonconforming (Appendix A). The `Privacy-Review` field carries the literal assertion `§7.5 compliant` — the contract author's declaration that the payload has been reviewed against §7.5 and contains no protected facts, Buyer Vendor Status values, routing-exclusion data, private CRM content, or governance signal values beyond what the emitting module's own authoritative state legitimately contains. Any value other than `§7.5 compliant` is nonconforming; absence of the field is a conformance failure (§7.6).

### 16.4 Event Naming, Versioning, and Catalog Binding

- Event names **MUST** exist in Doc-2 §8. No event may be coined in a Doc-4 document. A contract referencing an event not in Doc-2 §8 **MUST** apply flag-and-halt (§0.6) and escalate for a Doc-2 change-management decision. The contract **MUST NOT** be frozen until the Doc-2 event catalog is updated.
- `event_version` is a monotonically increasing integer. It is bumped only on **breaking changes** to the event payload: removing a field, changing a field's type, changing a field's semantics, or making an optional field required. Adding a new optional field is non-breaking and does not require a version bump.
- Producers **MUST** emit the declared version(s) for the migration window defined by the relevant POLICY key (§18), then decommission older versions through a Doc-2 patch process. Producers **MUST NOT** unilaterally drop a version without a Doc-2 patch and declared consumer migration completion.
- Consumers **MUST** declare which version(s) they consume. A consumer that silently accepts unknown event versions without a declared compatibility statement is nonconforming.
- The owning module (the emitter per Doc-2 §8) is the **only** module that may modify an event's definition. Consumer modules declare their consumption; they **MUST NOT** alter the event payload definition or emit events they do not own.

### 16.5 Payload Rules

Event payloads carry the facts necessary for consumers to react — no more. Payloads are **thin by design**:

- **MUST** include: the aggregate root's `id` (UUIDv7 per §8), the event name and version, sufficient context for idempotent consumer identification, and the fields materially changed or significant to the triggering operation.
- **MUST NOT** include: full canonical entity representations (consumers that need full state call the owning module's Query per §4.3); other-tenant data; protected facts (§7.5) — no blacklist status, routing exclusion decisions, Buyer Vendor Status, private CRM content, or protected-link facts may appear in any event payload; derived or computed values (§10.8) presented as authoritative; large documents, files, or blobs (reference by document-version ID per §8.5 only).
- Payload fields are declared in §9.1 field notation (type and source pointer required; the required/optional position is replaced by `always | conditional`). Every payload field **MUST** have a type and a source pointer or stated origin.
- The maximum payload size is POLICY-bounded; contracts **MUST** declare the governing POLICY key (§18). A payload exceeding the bound is a conformance failure; large data is always referenced by ID.
- Payload privacy: producers **MUST** declare `Privacy-Review: §7.5 compliant` in their Events Produced grammar (§16.3). This machine-reviewable assertion confirms that the payload has been reviewed against §7.5 and contains no protected facts, Buyer Vendor Status values, routing-exclusion data, or private CRM content. Absence of the `Privacy-Review` field is a conformance failure (Appendix A; §7.6).

### 16.6 Producer Responsibilities

- The producing module is the entity's Owner Module (§4.1). Only the Owner Module may define and emit events for its entities.
- A contract that declares State Machine Effects for a transition **MUST** also declare all Events Produced by that transition per the Doc-2 §8 binding for that transition. Where Doc-2 §8 designates no event for a given transition, the contract declares `Events-Produced: none` for that transition. Missing event declarations for corpus-defined emissions are a conformance failure.
- Producers **MUST NOT** defer event emission: the event enters the outbox in the same transaction as the triggering mutation (§16.2). Conditional emission ("emit only if X") is permitted only where the corpus explicitly designates conditionality for that event in Doc-2 §8 (by pointer); otherwise emission is unconditional.
- Producers **MUST NOT** emit an event they do not own (whose `Source-Ref` names a different module). An emitter mismatch is a cross-module ownership violation (§4.1; §4.3).
- Producer responsibility ends at correct, timely outbox insertion. Producers are not responsible for consumer idempotency, consumer filtering, or consumer processing outcomes.

### 16.7 Consumer Responsibilities

- **Idempotency (mandatory)**: Consumers **MUST** be designed so that receiving the same event ID more than once produces no additional side effects beyond those of the first application. The canonical implementation pattern — check entity state before acting; skip if the effect has already been applied — **MUST** be stated in the Events Consumed `Idempotency` field, declared testably.
- **No cross-module mutation**: A consumer **MUST NOT** write another module's entity in response to an event. All consumer effects are limited to the consuming module's own entities (§4.3). Where a consumed fact requires a cross-module state change, the consuming module invokes the owning module's command via a declared service call (§4.2); the event is the trigger, not the authorization or execution vehicle.
- **Version compatibility**: Consumers **MUST** declare the version(s) they consume. Within a declared-compatible version series, consumers **MUST** tolerate unknown optional fields without failing (forward compatibility). Consumers **MUST NOT** fail on fields they do not recognize in a backward-compatible version update.
- **Failure declaration (mandatory)**: Consumers **MUST** declare their failure behavior in the `Failure` field: retry until success, park in a dead-letter queue (governed by a POLICY key), or skip with audit record. A consumer **MUST NOT** fail silently — unprocessed events **MUST** be audited.
- **Consumer does not validate producer**: A consumer **MUST NOT** re-validate another module's business rules as a gate before applying consumer effects. Consumer pre-conditions are limited to the consuming module's own entity states.

### 16.8 Ordering Guarantees and Consumer Obligations

**Ordering guarantees the platform provides:**

- **At-least-once delivery** (guaranteed): every event emitted via the transactional outbox will be delivered to each declared consumer at least once.
- **Causal intent within an aggregate root** (design intent, not a hard consumer guarantee): events for a single aggregate root instance are emitted in the causal order of the mutations that produced them. However, parallel dispatcher processing, redelivery, and concurrent consumer execution mean that consumers **MUST NOT** rely on receiving events for the same aggregate root in emission order.
- **No global ordering guarantee**: the platform does not guarantee any ordering of events across different aggregate root instances or across modules. Event E1 from aggregate A and event E2 from aggregate B carry no ordering relationship.

**Consumer obligations — all mandatory:**

- Consumers **MUST** be correct under **any delivery order** of events across different aggregate root instances.
- Consumers **MUST** be idempotent under **duplicate delivery** of the same event (§16.7).
- Where a consumer's correct behavior depends on processing events for the same aggregate root in causal order (e.g., consuming a `ProfileActivated` event that logically followed a `ProfileDraftSubmitted` event), the consumer **MUST** implement a read-repair guard: before applying the event's effect, check the entity's current state via the owning module's Query, and apply the effect only if the event's pre-conditions are still valid. The `Out-Of-Order` field in the Events Consumed grammar (§16.3) **MUST** declare this guard, stated testably.
- Consumers **MUST NOT** use wall-clock arrival time as a proxy for event causality.
- Consumers **MUST NOT** build correctness assumptions on ordering that has not been declared as a platform guarantee above. Any such assumption is a correctness defect surfaced by the Appendix A conformance check.

Ordering guarantees are intentionally bounded to allow platform scalability. A consumer that cannot function correctly without stronger ordering guarantees has a design defect and requires escalation (§0.6), not a contract relaxation.

### 16.9 Event Evolution, Compatibility, and Prohibited Patterns

**Backward-compatible changes** (no version bump, no migration window):
- Adding a new optional field to an event payload.
- Adding a new event to Doc-2 §8 via change management.
- Adding context metadata that carries no semantic obligation for consumers.

**Breaking changes** (version bump required; migration window governed by a POLICY key):
- Removing a field.
- Changing a field's data type.
- Changing a field's semantics (meaning of existing values).
- Making an optional field required.

**Event removal** (deprecating an event from Doc-2 §8): follows Doc-2 change management exclusively, not Doc-4 patching. A Doc-4 document referencing a deprecated event **MUST** be updated before the deprecation window closes.

**Prohibited event patterns** — conformance failures in any Doc-4 document:

| Prohibited pattern | Governing rule |
|---|---|
| Coining a new event name in a Doc-4 document | Doc-2 §8 owns the catalog; escalate (§0.6) |
| Emitting an event outside the transactional outbox | §16.2 |
| Breaking an event payload without a version bump | §16.4 |
| Event payload carrying a protected fact | §7.5; §16.5 |
| Consumer modifying another module's entity on event receipt | §4.3; §16.7 |
| Using events to transfer data between modules as a Query alternative | §4.3; §16.1 |
| Treating an event as a command that the consumer must obey without validation | §16.1 |
| Emitting an event owned by a different module | §16.6; §4.1 |
| Consumer declaring no failure behavior | §16.7 |
| Consumer relying on event ordering without a read-repair guard | §16.8 |
| Missing `Privacy-Review` field in Events Produced declaration | §16.3; §16.5; §7.6 |

---

## §17 — Audit Declaration Standard

### 17.1 Audit Is Mandatory for Mutations

Every contract that produces a mutation — creates, updates, drives a state transition on, or soft-deletes an entity — **MUST** declare Audit Requirements in Template 21.1. This is not optional and has no exception:

- A mutating contract with no Audit Requirements declaration is nonconforming and **MUST NOT** be frozen (Appendix A).
- A pure Query contract (no mutations, no write side effects) **MUST** declare `Audit-Required: no`. This declaration must be present and correct. A Query that has write side effects (e.g., recording a "viewed" event, updating a `last_accessed_at` column) is a mutating contract by this rule and **MUST** carry full audit.
- Audit records are permanent governance and compliance records, not debugging artifacts (Master Architecture §14; Doc-2 §9 by pointer). They are authored as first-class contract obligations.
- **Business audit vs. operational telemetry**: The Audit Requirements declaration governs **business audit records** only — records of named actors performing business actions on business entities, for governance and compliance. **Operational telemetry** (infrastructure metrics, health checks, timing data, service logs) and **abuse-monitoring logs** (records of suspicious activity, rejected authentication attempts, rate-limit events) are distinct categories governed by their own policies in development documents. A contract **MUST NOT** conflate these: `Audit-Required: yes` does not imply operational telemetry is produced, and operational telemetry does not satisfy business audit obligations.

### 17.2 Audit Declaration Grammar

The Audit Requirements field of Template 21.1 **MUST** use the following form:

```
Audit-Required:  yes | no
Actor-Types:     <User | Admin | System | AI Agent — MUST match §5.2 declaration>
Action-Ref:      Doc-2 §9.<action> [as amended by <PATCH-ID> per §3.5]
Attribution:     standard | delegated | system | ai-agent
Mutation-Scope:  <entity name(s) per §3.1 that are created, updated, or transitioned>
Correlation:     reference_id | idempotency_key | both | phase2-origin
```

Rules:

- `Action-Ref` is a pointer to the audit action name in Doc-2 §9. Doc-4 documents **MUST NOT** restate, paraphrase, or supplement the audit action definition; they bind to it by pointer. If no suitable action exists in Doc-2 §9, the author **MUST** apply flag-and-halt (§0.6) and escalate for a Doc-2 patch — inventing audit actions in Doc-4 is a conformance failure.
- `Attribution: standard` — the §5.4 standard attribution columns apply: `actor_id`, `actor_type`, `organization_id`.
- `Attribution: delegated` — the §6B.3 four-attribution set applies (§17.4).
- `Attribution: system` — System actor with originating-context propagation per §15.5 (§17.3).
- `Attribution: ai-agent` — AI Agent actor per §17.3.
- `Mutation-Scope` lists every entity type the contract modifies; a mutated entity not listed in `Mutation-Scope` is an undeclared audit gap and a conformance failure.
- `Correlation: phase2-origin` is used **exclusively** by System-actor Phase-2 contracts (§15). It declares that the audit record carries: this Phase-2 execution's own `reference_id`; the originating Phase-1 `reference_id` (and idempotency key where applicable); and the originating actor (user) and organization identifiers — as correlation linkage fields per Doc-2 §9 (by pointer). This enables full chain reconstruction: originating user action → Phase-1 acceptance → Phase-2 System execution. The specific linkage field names are defined in Doc-2 §9 and **MUST NOT** be restated in Doc-4 documents.
- Where a contract triggers async Phase-2 work (§15), the Phase-2 audit declaration belongs in the Phase-2 System-actor contract, not in the Phase-1 contract. The Phase-1 contract declares its own audit requirements and references the async trigger in its context note.

### 17.3 Actor Attribution Requirements

The audit record **MUST** reflect the actual executing actor type with the following precision:

- **User actor**: `actor_id` = authenticated user (UUIDv7); `actor_type` = `user`; `organization_id` = server-validated active organization (never client-supplied, per §5.3). All records produced by the mutation record ownership under this organization.

- **Admin actor**: `actor_id` = authenticated staff user (UUIDv7); `actor_type` = `admin`; `organization_id` = the tenant organization whose record is affected for entity-scoped and `tenant-data-access` contracts (§5.6); absent for platform-wide Admin contracts. The `staff_*` slug(s) authorizing the action are recorded in the audit record's permission context per Doc-2 §9 (by pointer).

- **System actor**: `actor_id` = the platform's stable system actor identifier (Doc-2 §9, by pointer); `actor_type` = `system`; `organization_id` = the owning organization of the entity being acted upon. Phase-2 System-actor audit records **MUST** declare `Correlation: phase2-origin` (§17.2) to carry the originating user, originating organization, and Phase-1 reference linkage as correlation fields — not as primary actor attribution. This is what makes Phase-2 audit records reconstructible to their originating user action (§15.5; §17.7).

- **AI Agent actor**: `actor_id` = the AI service or agent identifier (stable, per Doc-2 §9, by pointer); `actor_type` = `ai_agent`; `organization_id` = the organization in whose context the AI advisory was requested. Per Master Architecture §18 Invariant 12: AI-Agent contracts are read-only or advisory with respect to authoritative business data. Any write side effect triggered by an AI advisory is executed under a User or System actor contract — attributed to the User or System actor that accepted and acted on the advisory, not to the AI Agent. The AI Agent audit record covers the advisory or read action itself; downstream writes are attributed to the authoritative actor that executed them.

### 17.4 Delegation Attribution

Where a contract declares `Attribution: delegated` (contracts that are delegation-eligible per §6B.1), the audit record **MUST** carry all four attributions defined in §6B.3:

| Attribution | Audit binding |
|---|---|
| Acting user | `actor_id` (user's UUIDv7) + `actor_type` = `user` |
| Acting (representative) organization | `organization_id` = representative organization's UUIDv7 |
| Represented vendor profile | vendor profile anchor field per Doc-2 §9 delegation audit binding (by pointer) |
| Controlling organization | controlling organization anchor field per Doc-2 §9 delegation audit binding (by pointer); this is the quota and billing attribution anchor |

Contracts **MUST NOT** abbreviate delegation attribution. An audit record for a delegated action that omits any of the four attributions is nonconforming: the full delegation chain **MUST** be reconstructible from the audit record alone (§6B.3 principle). The specific field names for the delegate anchors are defined in Doc-2 §9 (by pointer) and **MUST NOT** be restated in Doc-4 documents.

### 17.5 Audit Permanence and Immutability

- Audit records are **immutable** once written. No Doc-4 contract **MAY** define operations that modify, overwrite, or delete an audit record.
- **Redaction** under compliance policy (Master Architecture §14.3): a compliance-ordered redaction blanks the content of specific fields within an audit record's payload while the audit record itself persists permanently. The redaction action is itself audited. Contracts that expose a redaction capability **MUST** cite the compliance basis by corpus pointer (Doc-2 §9 / Master Architecture §14, by pointer); administrative convenience is not a compliance basis.
- **Soft-deleted entities** retain their full audit history. Audit records referencing a soft-deleted entity are not affected by the deletion; they persist under the audit retention rules. If a compliance policy requires field-level blanking of a soft-deleted entity's references, that is a redaction action — not a deletion of the audit record.
- A mutation that succeeds **MUST** produce exactly one audit record for that execution. A validation failure at Category 1–5 (§11.2) produces no business audit record; the failed attempt **MAY** be recorded per the corpus's abuse-monitoring rules (cited by pointer, never invented) — but this is not a business audit action.

### 17.6 Audit vs Events

Audit records and events are both produced by mutations but serve distinct purposes and **MUST** be declared separately in every contract:

| Dimension | Audit record | Event |
|---|---|---|
| Purpose | Permanent governance and compliance record of who did what | Signal to async consumers about what happened |
| Durability | Immutable; permanently retained | At-least-once delivered; consumed and processed |
| Audience | Platform compliance; organization members per slug; Admin under `staff_*` | Module-declared consumers per Doc-2 §8 |
| Payload | Corpus-defined attribution fields + full mutation context | Thin fact payload (§16.5) — no full representations |
| Source of truth | Doc-2 §9 (by pointer) | Doc-2 §8 (by pointer) |
| Declared in | Audit Requirements field (Template 21.1) | Events Produced field (Template 21.1) |

A contract **MUST** declare both Audit Requirements and Events Produced independently. Emitting an event does not satisfy audit obligations. Recording an audit entry does not emit an event. A contract that omits either declaration when required is nonconforming (Appendix A).

### 17.7 Correlation Requirements

Every contract **MUST** declare which correlation mechanism(s) bind audit records to the originating request (the `Correlation` field of §17.2):

- `reference_id` (§12.1): the correlation identifier returned in every response envelope (including error envelopes) is present in the audit record for that execution, enabling support lookup and tracing.
- `idempotency_key` (§14.2): where the contract declares `Idempotency: required`, the idempotency key appears in the audit record, enabling deduplication verification — a reviewer can confirm that a safe replay produced exactly one audit record.
- `Correlation: both` is required for any contract that carries both a `reference_id` and an idempotency key.

Uniqueness rule (§14.3 joint rule): a safe replay **MUST** produce exactly one audit record — the original. The idempotency key in the audit record is the evidence that the second request was a replay, not a second execution.

### 17.8 Prohibited Audit Gaps and Non-Disclosure Binding

**Required audit coverage — the following contract types MUST produce audit records:**

| Contract type | Audit obligation |
|---|---|
| Any creation command | Full attribution + created entity ID + Action-Ref |
| Any update command | Full attribution + changed field context + Action-Ref |
| Any state-transition command | Full attribution + pre-state + post-state + Action-Ref |
| Any delegation grant issuance, modification, or revocation | All four §17.4 attributions + Action-Ref |
| Any permission or slug assignment | Attribution per actor type + Action-Ref (Doc-2 §9, by pointer) |
| Any verification decision | Admin attribution + `staff_*` slug(s) + Action-Ref |
| Admin tenant-data-access operations | Attribution + compliance basis reference (§5.6) |
| AI-Agent advisory reads | AI Agent actor attribution + Action-Ref (Doc-2 §9, by pointer) |
| System-actor async Phase-2 transitions | System attribution + originating context correlation (§17.3) |

**Non-disclosure binding**: Audit records are accessible to the deciding buyer organization (for their own records), to platform compliance (for all records), and to Admin actors under the appropriate `staff_*` slugs. Audit query surfaces in Doc-4J (Admin Operations) and any module-level audit access contract **MUST** include a §7.5 compliance statement (§7.6) confirming that no protected fact is revealed to a party without the right to see it. Specifically: an audit record for a protected-fact-gated operation (e.g., a blacklist decision) **MUST NOT** be served through any contract surface in a way that reveals the protected fact to the party who was gated out. The audit access contract declares this compliance, per §7.5, with the same Error Boundary obligations (§12.4).

---

*End of Doc-4A Content v1.0 — Pass 4 (§13, §14, §15, §16, §17). Self-review findings recorded below; all BLOCKER and MAJOR findings resolved in this text. Next pass: §18, §18B, §19, §20, §21, Appendices A–C per the frozen structure.*

---

## Self-Review — Pass 4

*Non-normative. Classification per §3.4: BLOCKER, MAJOR, MINOR, NITPICK. All BLOCKER and MAJOR findings resolved before this output.*

---

### BLOCKER Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P4-B1 | §13.8 | State errors for protected pre-states could reveal protected facts if the standard STATE error format is returned. | RESOLVED — §13.8 explicitly states: where a pre-state is itself governed by non-disclosure rules, the protected-fact collapse rule (§12.4) applies; the response MUST be NOT_FOUND. Cross-reference to §12.5 provides the disclosure gating rule. Error Boundary block (§12.4) declared mandatory for contracts with protected pre-states. |
| P4-B2 | §14.3 | Without specifying that deduplication happens before the transaction, an implementation could interpret the joint rule as requiring outbox-level deduplication (which would not prevent double audit writes). | RESOLVED — §14.3 explicitly states: "Idempotency deduplication MUST be applied at the application layer before any transaction begins. A replay is detected and the stored result returned without initiating a new write transaction; the transactional outbox is not involved in the replay path." |
| P4-B3 | §15.4 | Doc-3 §12.1 FIXED invariant on fabricated activity must be cited normatively, not paraphrased, to avoid restating (§0.3) while also making the contract binding clear. | RESOLVED — §15.4 cites "Doc-3 §12.1 FIXED, by pointer" and explicitly states this is not POLICY-overridable, preventing the most dangerous AI-agent interpretation error (treating a FIXED rule as POLICY-tunable). |
| P4-B4 | §16.2 | The "Outbox: yes" field in Events Produced is the only mechanical check enforcing the transactional outbox requirement. If the grammar did not make this mandatory, contracts could silently omit it. | RESOLVED — §16.3 grammar declares `Outbox: yes` as a mandatory field; §16.2 states "An event declared without this field is nonconforming." Appendix A will check for its presence. |
| P4-B5 | §17.4 | Naming specific delegation audit field names in §17.4 would constitute restating Doc-2 §9 schema (Reference-Never-Restate violation). | RESOLVED — §17.4 uses pointer language throughout: "vendor profile anchor field per Doc-2 §9 delegation audit binding (by pointer)" and "controlling organization anchor field per Doc-2 §9 delegation audit binding (by pointer)." No field names are restated. |

---

### MAJOR Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P4-M1 | §13.5 | AI-Agent actor could be interpreted as never permitted to participate in any workflow if the prohibition on state transitions was stated too broadly. | RESOLVED — §13.5 clarifies precisely: AI-Agent contracts MUST NOT drive state transitions directly; any AI-advisory-triggered transition is executed under a User or System actor that accepted and acted on the advisory. The AI Agent actor covers only advisory and read operations. Cites Master Architecture §18 Invariant 12. |
| P4-M2 | §16.8 | "Causal intent within an aggregate root" could be misread as a platform ordering guarantee, causing consumers to build incorrectly on it. | RESOLVED — §16.8 explicitly distinguishes between "design intent" (causal emission order) and "hard consumer guarantee" (there is none). The consumer obligation section follows immediately: "consumers MUST NOT rely on receiving events for the same aggregate root in emission order." The read-repair pattern is the normative solution. Added: "A consumer that cannot function correctly without stronger ordering guarantees has a design defect and requires escalation, not a contract relaxation." |
| P4-M3 | §17.3 | AI Agent attribution rule needed an explicit corpus citation for the "no authoritative writes" principle to prevent re-invention. | RESOLVED — §17.3 AI Agent attribution block cites "Master Architecture §18 Invariant 12" explicitly. The implication chain (advisory-only → write attributed to accepting actor) is stated as a direct consequence of that invariant. |
| P4-M4 | §16.6 | "MUST also declare all Events Produced by that transition" could be misread as requiring Doc-4 contracts to define events that don't exist in the corpus. | RESOLVED — §16.6 adds the explicit constraint: "per the Doc-2 §8 binding for that transition. Where Doc-2 §8 designates no event for a given transition, the contract declares Events-Produced: none for that transition." |

---

### MINOR Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P4-m1 | §13.2 | "any non-corpus-terminal" shorthand needed restriction to prevent over-broad Pre-states claims. | RESOLVED — §13.2 restricts to "where the Doc-2 §5 transition explicitly applies to all non-terminal states for that entity" and requires a corpus basis citation. |
| P4-m2 | §15.1 | "initial async-pending state" was too prescriptive — not all async commands necessarily produce a dedicated pending state; some commands may leave the entity in its current state while queuing background work. | RESOLVED — §15.1 generalized to: "the entity transitions to the state Doc-2 §5 designates as the result of this command (which may be a processing, queued, or pending state)." |
| P4-m3 | §16.3 | `Out-Of-Order` handling declaration in Events Consumed grammar needed to be cross-referenced to §16.8 rather than standing alone. | RESOLVED — §16.3 `Out-Of-Order` field description references §16.8. |
| P4-m4 | §15.3 | ASYNC_PENDING error class applies to dedicated result-observation Queries, not to general entity Queries. This distinction needed to be explicit. | RESOLVED — §15.3 distinguishes: general entity Query always returns current state; dedicated result-observation Query returns ASYNC_PENDING when Phase-2 is in progress. |

---

### NITPICK Findings

| ID | Section | Finding | Disposition |
|---|---|---|---|
| P4-n1 | All grammar blocks | Field label casing: standardized to Capitalized-kebab-case (e.g., `Pre-states:`, `Post-state:`, `Transition-Ref:`, `Replay-Result:`, `Source-Ref:`, `Actor-Types:`, `Action-Ref:`, `Mutation-Scope:`, `Out-Of-Order:`) consistent with §4B.4, §12.4 patterns. | Accepted |
| P4-n2 | §14.2 | `Replay-Result: acknowledged` term clarified to mean "the original Phase-1 acceptance acknowledgment is returned" to prevent confusion with broader "acknowledged" usage. | Resolved in §14.2 definition |
| P4-n3 | §16.3 | `Source-Ref` field in Events Produced grammar forward-references Doc-2 §8 consistently with §3.5 patch citation rule. | Accepted — normatively required citation field |
| P4-n4 | §15.7 | "Supabase Realtime" named by product — consistent with Pass 2 §5.1 style ("Supabase Auth") and Master Architecture reference. | Accepted — consistent with established doc style |
| P4-n5 | §17.6 | Audit vs Events comparison table repeats information implicit in §16 and §17 individually. Duplication is intentional: AI agents consuming §17 in isolation need the distinction stated in-section. | Accepted — duplication serves AI-agent completeness |
