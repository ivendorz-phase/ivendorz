# Independent Architecture Review — Doc-4A Content v1.0, Pass 4 (§13–§17)

**Reviewer roles:** Principal Enterprise Architect · Principal DDD Architect · Principal Event-Driven Architecture Architect · Principal Security Architect · Principal Multi-Tenant SaaS Architect · Principal Audit & Compliance Architect · Principal AI-Agent Governance Reviewer  
**Corpus consulted:** Master_System_Architecture_v1.0_FINAL.md; ADR_Compendium_v1.md; Doc-2 v1.0.3 (incl. Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3); Doc-3 v1.0.2 (Doc-3_Patch_v1.0.2); Doc-4A Pass 1 (§0–§3, FROZEN), Pass 2 (§4–§8, FROZEN), Pass 3 (§9–§12, FROZEN, Patch v1.0.1 applied)  
**Review scope:** §13 State Machine Interaction Standard; §14 Idempotency & Concurrency Standard; §15 Asynchronous Operation Standard; §16 Event Contract Standard; §17 Audit Declaration Standard  
**Not reviewed:** structure, completeness, features, or anything outside the five sections above  
**Reviewer status:** Independent — not the author of the reviewed document

---

## Review Summary

Pass 4 is the strongest pass of the series to date. The author's self-review resolved all five BLOCKERs and four MAJORs declared in the self-review log before delivery. The core doctrines — command-driven state transitions, transactional outbox, at-least-once delivery, idempotent consumers, fact-only events, and four-attribution delegation audit — are correctly specified and internally consistent.

The independent review identifies **0 BLOCKERs, 6 MAJORs, 10 MINORs, and 4 NITPICKs.** The six MAJORs are all patchable without structural change. The most consequential: a missing grammar field that prevents §7.5 privacy compliance from being enforced at the event layer (F-004), a Phase-2 contract-identity ambiguity that will produce inconsistent module contracts across Doc-4B–4K (F-003), an in-flight race condition not addressed by the idempotency joint rule (F-002), and a Correlation grammar gap that leaves Phase-2 audit attribution undeclarable (F-005).

---

## Section A — State Transition Review (§13)

### Review Summary

§13 is well-constructed. The prohibited patterns table in §13.9 is comprehensive and machine-testable. The terminal-state, version-bound, and actor-restriction rules are precise. Three gaps were identified.

---

**F-001 | MAJOR | §13.2 — No Grammar for Multi-Entity State Machine Effects Blocks**

**Description:** §13.2 states: "A single command that transitions multiple entities within the same aggregate MUST declare one State Machine Effects block per entity." This obligation is normative. However, §13.2 defines a single-entity grammar block and provides no format for declaring multiple blocks. The grammar is:

```
Entity:          <...>
Pre-states:      <...>
Post-state:      <...>
Conditional:     <...>
Actor:           <...>
Transition-Ref:  <...>
```

There is no declared construct for repeating this block per entity — no numbered block prefix, no list wrapper, no separator notation. For any command that transitions more than one entity, AI agents must invent a declaration format, producing inconsistent multi-block structures across Doc-4B through Doc-4K.

This gap is immediately activated by real corpus commands. RFQ award (`closed_won`) transitions at minimum: the RFQ entity (state transition), the winning Quotation entity (QuotationSelected implies a state change on the quotation), and potentially the losing Quotations (their state changes on closure). All three entity transitions must be declared per §13.2, with no declared format for doing so.

**Risk:** AI agents authoring module contracts for RFQ Engine (Doc-4E), Business Operations (Doc-4F), and Trust (Doc-4G) will produce incompatible multi-entity block formats. Cross-document conformance checking (Appendix A) cannot verify multi-entity declarations without a canonical format. The review gate breaks on every multi-entity command.

**Recommended change:** Add to §13.2 after the grammar block: "When a command transitions multiple entities, the State Machine Effects field MUST repeat the block once per entity, labeled with a sequential index prefix: `[1]`, `[2]`, etc. The block order is informative; the Transition-Ref for each block determines its corpus anchor. All blocks are mandatory; a command with N entity transitions and fewer than N blocks is nonconforming."

---

**F-002 | MINOR | §13.8 — "Scope Permits Reading That State" Is Under-Specified**

**Description:** §13.8 states: "The STATE error MAY disclose the entity's current state and the legal transitions only to callers whose scope already permits reading that state." The standard imposes a permission-gating obligation on STATE error content, but "scope already permits reading that state" is not operationalized. No standard defines which Query contract establishes read-permission for each entity's state field, nor which permission slug governs it.

AI agents authoring module contracts must determine per-entity whether the STATE error can include current state, but have no standard to apply. They will either always redact current state (over-conservative, reducing operational usability) or always disclose it (under-conservative, potentially leaking protected-pre-state information beyond what §12.4 collapses).

§12.5 is referenced for "disclosure gating rules" but the relationship between "scope permits reading" and a specific permission check is not drawn in §13.8.

**Risk:** Inconsistent STATE error content across module contracts, with some disclosing current state to callers who should not see it and others redacting it from callers who should.

**Recommended change:** Add to §13.8: "For the purpose of this section, 'scope already permits reading that state' is satisfied when the calling actor's contract scope (§6.1) includes the entity's canonical Query contract for that entity. If no Query contract exists in scope for the entity, STATE error content MUST be redacted to only the machine-readable error class and code, without current state or legal transitions."

---

**F-003 | NITPICK | §13.2 — `Pre-states: any non-corpus-terminal` Has No Grammar Field for the Corpus Basis Citation**

**Description:** §13.2 permits the `any non-corpus-terminal` shorthand "only where the Doc-2 §5 transition explicitly applies to all non-terminal states for that entity" and requires the contract to "cite the corpus basis for this claim." However, the State Machine Effects grammar has no field for this citation. The citation would appear in the `Transition-Ref` field alongside the transition pointer, but the grammar doesn't define a `Basis:` or `Non-Terminal-Justification:` extension. AI agents will either add a free-text note (non-normative per §3.3) or omit the citation entirely.

**Risk:** Contracts using the shorthand without a verifiable citation will pass Appendix A grammar checks while the corpus basis remains unverifiable.

**Recommended change:** Add to the shorthand rule in §13.2: "The corpus basis citation MUST appear in the Transition-Ref field as a second pointer, e.g.: `Transition-Ref: Doc-2 §5.4; non-terminal basis: Doc-2 §5.<subsection>`."

---

## Section B — Idempotency Review (§14)

### Review Summary

§14 is rigorous. The joint rule (§14.3), the four-scenario table (§14.4), and the business-uniqueness separation (§14.6) are well-designed. The retry/error-class alignment (§14.7) correctly references the Pass 3 error taxonomy. Two gaps were identified, one of which is a real implementation risk.

---

**F-004 | MAJOR | §14.3 — Joint Rule Does Not Address the In-Flight Original Scenario**

**Description:** §14.3 states: "Idempotency deduplication MUST be applied at the application layer before any transaction begins. A replay is detected and the stored result returned without initiating a new write transaction." This correctly addresses the most common replay scenario (original committed, replay arrives later).

However, the rule does not address the in-flight original scenario: the original request has begun execution but has not yet committed its transaction when the replay arrives. In this case:
- The deduplication check finds no stored result (the original has not committed)
- The replay proceeds as a new execution
- Both the original and the replay commit, each producing distinct outcomes, audit records, and outbox events

This violates the joint rule (§14.3 joint rule conditions 1, 2, and 3) but passes the application-layer deduplication check as stated. The scenario is not covered by any of the four §14.4 scenario definitions either: it is neither a safe replay (key exists in store), a duplicate submission (different keys), a concurrent submission (the concurrency model applies to update commands, not creation commands), nor a stale replay (key not found, not expired).

This is most dangerous for creation commands — two concurrent requests with the same idempotency key can both create an RFQ, a Quotation, or an Engagement if the original's transaction is still in-flight.

**Risk:** Duplicate RFQs, Quotations, or Engagements can be created under realistic network conditions (client retry on timeout while server is processing). This violates Doc-3 §12.1 FIXED — "one active quotation per vendor per RFQ" — at the contract-standard level, since the contract layer doesn't prevent it.

**Recommended change:** Add to §14.3 after the implementation-neutral constraint: "In-flight original handling: if the deduplication store indicates the key is registered but has no committed result (the original execution is in progress), the platform MUST treat the replay as a safe replay and return an in-progress acknowledgment rather than beginning a new execution. The specific in-progress state representation is a development-document concern; the contract obligation is that no second execution begins while the first is in-flight. This is a contract-layer assertion, not an infrastructure mechanism."

---

**F-005 | MINOR | §14.1 — "Either/Or" Framing Excludes Contracts Needing Both Idempotency Key and Optimistic Concurrency**

**Description:** §14.1 states that unsafe operations MUST declare "either an idempotency key declaration (§14.2) for operations where the same request may be safely replayed, or an optimistic-concurrency declaration (§14.5) for update commands where concurrent writes must be prevented."

The "or" framing is exclusive and not qualified. A command that both (a) could be safely replayed using an idempotency key AND (b) modifies an existing entity's fields where concurrent writes could produce a lost update needs both mechanisms. The "or" excludes this case.

An example: an RFQ Update command (update fields before submission) — it is an update command that could be retried (network timeout), so it needs idempotency key for replay safety, AND it modifies an existing entity's fields where a concurrent editor could clobber changes, so it needs optimistic concurrency.

**Risk:** AI agents authoring update-with-replay-safety contracts will pick one mechanism and omit the other, either losing idempotency safety or concurrency protection.

**Recommended change:** Amend §14.1 to: "...or an optimistic-concurrency declaration (§14.5) for update commands where concurrent writes must be prevented. A contract MAY declare both, where replay safety AND concurrent write prevention are both required; the two mechanisms are complementary and MUST NOT be conflated (§14.5, last rule)."

---

**F-006 | MINOR | §14.5 — `Concurrency: none` Justification Has No Grammar Field**

**Description:** §14.5 requires that `Concurrency: none` be accompanied by "an explicit, documented justification for why concurrent writes cannot produce an inconsistency." However, the grammar is:

```
Concurrency:     optimistic | none
Token:           updated_at | <named field>
```

There is no `Justification:` field. Per §3.3, "prose MAY connect rules but MUST NOT carry a normative requirement that is absent from a rule line or contract block." A required justification with no grammar position is either carried in non-normative prose (insufficient) or omitted. §14.5 says absence of justification is a SHOULD-violation that "MUST be noted in the contract's rationale (§3.4)" — but §3.4 defines normative keywords, not a rationale section; Template 21.1 may or may not have a rationale field (§21 is not yet authored).

**Risk:** AI agents will declare `Concurrency: none` without justification and pass Appendix A grammar checks, producing contracts with unjustified concurrency suppression.

**Recommended change:** Add `Justification:` as a conditional grammar field: "When `Concurrency: none`, the grammar block MUST include: `Justification: <cite the commutative, append-only, or other corpus-grounded reason>`. Absence of the Justification field when `Concurrency: none` is a conformance failure (Appendix A)."

---

## Section C — Async Processing Review (§15)

### Review Summary

§15 is well-grounded in the corpus doctrine. The accepted-then-processing pattern is correctly specified, the no-fabricated-activity rule is correctly bound to Doc-3 §12.1 FIXED, and the delivery-channel rules correctly prevent push channels from substituting for the authoritative Query. Two significant gaps were identified.

---

**F-007 | MAJOR | §15.2 + §15.5 — Phase-2 Contract Identity Ambiguity**

**Description:** §15.2 declares the async operation grammar as fields within Template 21.1:

```
Execution:   async | sync
Phase-1:     <...>
Phase-2:     <owning module; triggered by which event per Doc-2 §8>
Observation: <...>
```

The position of these fields within Template 21.1 implies the Phase-2 declaration is part of the Phase-1 contract — i.e., a single contract describes both Phase-1 and Phase-2 work.

However, §15.5 states: "Phase-2 async workers execute under the System actor type. Their contracts are System-actor contracts with their own State Machine Effects declarations (§13) and Audit Requirements declarations (§17)."

"Their contracts" is plural-possessive and implies Phase-2 contracts are distinct, standalone Template 21.1 contracts authored by the Phase-2-owning module — not embedded declarations within the Phase-1 contract.

This contradiction is the most consequential AI-agent implementation ambiguity in this pass. There are two materially different design patterns at stake:

**Pattern A (embedded):** A single contract for the Phase-1 command, with a `Phase-2:` declaration field that describes the async work. Phase-2 state transitions and audit requirements are not declared separately.

**Pattern B (separate):** A Phase-1 contract that declares `Phase-2: see System-actor contract [name]`. A separate Phase-2 System-actor contract with its own State Machine Effects block and Audit Requirements block, owned by the Phase-2-executing module.

Pattern B is consistent with §15.5 and the module ownership rules (§4.1 — only the owner module's contracts may declare State Machine Effects on its entities). But Pattern B is not derivable from the §15.2 grammar, which presents the async declaration as fields in one contract.

**Risk:** Doc-4E (RFQ Engine) will describe Phase-1 RFQ submission and Phase-2 matching in one contract (Pattern A). Doc-4G (Trust & Verification) will separately describe Phase-2 score recalculation in its own contract (Pattern B). The module contracts will be structurally inconsistent, Appendix A cannot define a single conformance check for async contracts, and the cross-module integration index (Doc-4L) will be unassemblable.

**Recommended change:** Disambiguate in §15.1 or §15.2: "A Phase-1 contract declares its async execution pattern, Phase-1 effects, the Phase-2-triggering event, and the observation interface. Phase-2 work that transitions the Phase-2-owning module's own entities MUST be declared as a separate System-actor contract (Template 21.1) in the Phase-2-owning module's document (§4.4 integration single-authorship rule). The Phase-1 contract's Phase-2 field names the Phase-2-owning module and the triggering event; it does not declare the Phase-2 effects. Phase-2 contracts that execute entirely within the Phase-1 module's own entities MAY be declared as a continuation block within the same module document."

---

**F-008 | MINOR | §15.7 — "Follow Event Payload Rules of §16" May Apply Full Grammar to Push Notifications**

**Description:** §15.7 states: "Push channel payload shapes MUST follow the event payload rules of §16 (thin payloads, no protected facts per §7.5, no other-tenant data)."

The phrase "event payload rules of §16" could be read as requiring the full §16.3 Events Produced grammar (including `Outbox: yes`, `Source-Ref`, `Version`, `Trigger`) for push channel payload declarations. But push channels (Supabase Realtime) are database-change delivery channels, not transactional outbox events. Applying the full §16.3 grammar to push notifications is both incorrect (they are not events with versions and source refs) and potentially confusing to AI agents.

§15.7 itself says "push channels are delivery channels only: they deliver notifications derived from the authoritative database state" — clearly distinguishing them from events. The "follow §16" reference should be scoped to the content rules, not the declaration grammar.

**Risk:** AI agents authoring module contracts with push channel declarations will attempt to apply the §16.3 Events Produced grammar to push payloads, producing malformed declarations.

**Recommended change:** Amend to: "Push channel payload content MUST comply with the thin-payload and non-disclosure rules of §16.5 (no full entity representations, no protected facts, no other-tenant data). The §16.3 Events Produced declaration grammar does NOT apply to push channel declarations; push channels are not events and carry no Outbox, Version, or Source-Ref fields."

---

## Section D — Event Contract Review (§16)

### Review Summary

§16 is the strongest section in Pass 4. The events-as-facts principle is rigorously enforced. The consumer obligations — idempotency, no cross-module mutation, forward compatibility, failure declaration, out-of-order guard — are each specific and testable. The ordering guarantee declaration (§16.8) correctly identifies what the platform does and does not guarantee, and the read-repair pattern is the right normative solution. Four gaps were identified.

---

**F-009 | MAJOR | §16.5 — §7.5 Privacy Compliance Statement Has No Grammar Field in Events Produced Declaration**

**Description:** §16.5 states: "Payload privacy: producers MUST include a §7.5 compliance statement in their Events Produced declaration confirming that the payload contains no protected facts. Absence of the statement is a conformance failure (Appendix A; §7.6)."

This is a normative security obligation with an Appendix A enforcement binding. However, the Events Produced grammar in §16.3 has exactly six fields:

```
Event:        <...>
Version:      <...>
Trigger:      <...>
Payload:      <...>
Outbox:       yes
Source-Ref:   <...>
```

There is no `Privacy-Compliance:` or `Section-7.5-Statement:` field. The obligation is normative; the grammar is the machine-executable declaration format. A declaration satisfying all six grammar fields is syntactically conforming but does not include the required compliance statement. Appendix A can only check what the grammar defines; if the compliance statement has no field, Appendix A cannot enforce §16.5's "absence is nonconforming" rule.

This is the highest-priority gap in Pass 4. Without a grammar field, AI agents generating events across Doc-4B through Doc-4K will produce Events Produced declarations that are conforming by grammar but non-compliant by §16.5. Event payloads could carry protected facts (Buyer Vendor Status, blacklist exclusion decisions, private CRM content) without triggering a conformance failure, violating the non-disclosure invariant (Master Architecture §22.3; Doc-3 §12.1 FIXED).

**Risk:** Protected facts leak into event payloads in AI-generated contracts without triggering any conformance check. The non-disclosure invariant is weakened at the event layer by a grammar omission.

**Recommended change:** Add `Privacy-Compliance:` as a mandatory field to the Events Produced grammar in §16.3:

```
Event:               <...>
Version:             <...>
Trigger:             <...>
Payload:             <...>
Outbox:              yes
Source-Ref:          <...>
Privacy-Compliance:  confirmed — payload reviewed against §7.5; no protected facts present
                     | protected-fact risk present: <field names> — excluded per §16.5
```

The field must be present and its value must be one of the declared forms. Absence of the field is a conformance failure (Appendix A). The second form acknowledges a risk was identified and records how it was resolved.

---

**F-010 | MINOR | §16.3 — Events Consumed `Failure` Field References an Unspecified POLICY Key**

**Description:** §16.3's Events Consumed grammar defines the `Failure` field as: `retry per outbox retry POLICY key | DLQ per POLICY key | skip with audit`. Each of the retry and DLQ options requires referencing a POLICY key. However, no outbox retry POLICY key appears in the Doc-3 §12.2 POLICY key inventory. The inventory lists keys for lifecycle, moderation, matching, routing, probation, fairness, capacity, distribution, confidence, quotation, abuse, operating context, quality, and leads — but not for outbox retry behavior.

AI agents authoring Events Consumed declarations will write `Failure: retry per <unknown>` or invent a POLICY key name, producing undeclared POLICY references that cannot be resolved by Appendix A conformance checks.

**Risk:** Consumer failure declarations cite non-existent POLICY keys, producing unresolvable conformance errors in all consumer contracts across Doc-4C through Doc-4K.

**Recommended change:** Either: (a) identify the POLICY key name in §16.3 (e.g., `core.outbox_retry_max_attempts`, `core.outbox_dlq_after_attempts`) and request a Doc-3 patch to add them to §12.2; or (b) state that the outbox retry and DLQ parameters are Module 0 infrastructure configuration (Doc-4B), not POLICY keys governed by §18, and revise the grammar to cite the Doc-4B infrastructure reference instead: `retry per Doc-4B outbox retry policy | DLQ per Doc-4B dead-letter policy | skip with audit`.

---

**F-011 | MINOR | §16.4 + §16.5 — Two Unnamed POLICY Keys Referenced in Mandatory Declarations**

**Description:** §16.4 states: "Producers MUST emit the declared version(s) for the migration window defined by the relevant POLICY key (§18)." §16.5 states: "The maximum payload size is POLICY-bounded; contracts MUST declare the governing POLICY key (§18)."

Both obligations require citing a specific POLICY key by name. Neither key appears in Doc-3 §12.2. AI agents authoring Events Produced declarations cannot fulfill these obligations — there is no key to cite.

The self-review (P4-n3 confirmed as "normatively required citation field") shows awareness of citation requirements but does not flag the absence of the underlying keys.

**Risk:** Every Events Produced declaration in Doc-4B through Doc-4K that declares versioned events will have an unfulfillable migration-window citation. Every payload declaration will have an unfulfillable payload-size citation. Both are stated as MUST requirements.

**Recommended change:** Add to the Doc-3 §12.2 POLICY key inventory (via Doc-3 patch): `events.version_migration_window_days` (governing how long multi-version emission continues after a breaking change) and `events.max_payload_bytes` (governing the payload size ceiling). Until patched, add a note to §16.4 and §16.5: "The POLICY keys for migration window and payload size are reserved in the Doc-3 §12.2 inventory as `events.version_migration_window_days` and `events.max_payload_bytes`; formal values are established by Doc-3 patch."

---

**F-012 | MINOR | §16.6 — Conditional Emission Has No Grammar Field in Events Produced Declaration**

**Description:** §16.6 states: "Conditional emission ('emit only if X') is permitted only where the corpus explicitly designates conditionality for that event in Doc-2 §8 (by pointer); otherwise emission is unconditional."

The Events Produced grammar (§16.3) has a `Trigger:` field defined as "the operation in this contract that causes emission." This field can carry the trigger condition in prose, but no formal sub-grammar or `Condition:` field is defined for declaring conditional emission. Without a grammar position:

- AI agents may embed the condition in the `Trigger:` field as free text (potentially non-normative)
- There is no Appendix A check for whether a declared condition has a corpus basis
- Reviewers cannot mechanically verify that a condition is corpus-designated vs invented

**Risk:** AI agents invent conditional emission rules and embed them in the `Trigger:` field without corpus pointers, producing contracts where events may silently not emit for invented conditions. This violates the unconditional-emission-default principle and §0.3 (Reference-Never-Restate — the condition must come from the corpus, not be invented in a Doc-4 document).

**Recommended change:** Add to the Events Produced grammar: "When emission is conditional per the corpus, the `Trigger:` field MUST use the form: `<triggering operation>; conditional per <Doc-2 §8 pointer>`. An unconditional emission omits the conditional clause entirely. A condition without a Doc-2 §8 pointer is nonconforming."

---

## Section E — Event Ordering Review (§16.8)

### Review Summary

§16.8 is precise on what guarantees the platform provides and what it does not. The at-least-once / causal-intent / no-global-order structure correctly maps to the transactional outbox + Inngest architecture. The mandatory consumer obligations are specific and testable. One gap was identified.

---

**F-013 | MINOR | §16.8 — `Out-Of-Order` Field Must Be "Stated Testably" But Has No Sub-Grammar for the Read-Repair Guard**

**Description:** §16.8 states: "The `Out-Of-Order` field in the Events Consumed grammar MUST declare this guard, stated testably." The guard is described as: "before applying the event's effect, check the entity's current state via the owning module's Query, and apply the effect only if the event's pre-conditions are still valid."

"Stated testably" imposes a quality standard on the field's content but provides no sub-grammar for what testable means. The read-repair guard requires: (a) identifying the owning module's Query contract to call; (b) identifying the pre-conditions to check; (c) stating the skip behavior when pre-conditions fail. A field saying "check entity state before applying" is not testable. A field saying "call Doc-4E:GetRFQ; verify state ∈ {vendors_notified, quotations_received}; skip with audit if not" is testable.

Without a sub-grammar, the `Out-Of-Order` field will carry inconsistent levels of specification across Doc-4C through Doc-4K, with some modules declaring testable guards and others declaring vague prose.

**Risk:** Consumer contracts with vague out-of-order declarations produce unverifiable guard implementations. Appendix A cannot check whether the guard will actually prevent duplicate application of out-of-order events.

**Recommended change:** Add to §16.8: "The `Out-Of-Order` field MUST use the form: `read-repair: call <owning module's Query contract name>; precondition: <entity state or field assertion, verbatim from corpus>; on-fail: skip with audit`. Deviations from this form are nonconforming. The owning module's Query contract is named by the Doc-4 module document for the entity's owner module (§1.3 Doc-4 family map)."

---

## Section F — Audit Review (§17)

### Review Summary

§17 is thorough and its attribution model is the best-developed of any section in the pass series to date. The four-attribution delegation model (§17.4) is correctly bound to Doc-2 §9 by pointer, avoiding Reference-Never-Restate violations. The non-disclosure binding in §17.8 correctly extends to audit access contracts. Three significant gaps were identified.

---

**F-014 | MAJOR | §17.2 + §15.5 — Correlation Grammar Cannot Express Phase-2 Originating Context**

**Description:** §17.2 defines the `Correlation` field grammar as: `reference_id | idempotency_key | both`.

§15.5 requires: "Phase-2 audit records declare: System as the executing actor, and the originating user and organization as the business-attribution context — a correlation linkage, not the System record's primary attribution."

§17.3 repeats: "System actor audit records MUST carry the originating business context (originating user and organization from the Phase-1 triggering contract) as a correlation linkage in the Correlation field."

The `Correlation` field as declared can carry `reference_id` (the per-request correlation ID from §12.1) or `idempotency_key`. Neither of these is the originating user ID or originating organization ID. The `reference_id` is the Phase-1 request's `reference_id` — this is a useful correlation anchor for tracing Phase-2 back to Phase-1 — but it is not the originating actor or organization, which are separate attribution fields.

The obligation in §15.5 and §17.3 creates a Phase-2 audit record structure that requires:
- Primary attribution: System actor
- Correlation: originating Phase-1 reference_id (to trace back to the triggering request)
- Attribution context: originating user ID + originating organization ID

The `Correlation` grammar supports only the second item. The third item has no grammar position. AI agents generating Phase-2 System-actor contracts will declare `Correlation: reference_id` (satisfying the grammar) while omitting the originating user/org context (violating §15.5 and §17.3). Future auditors cannot reconstruct "which user and organization triggered this Phase-2 work" from a contract-compliant audit record.

**Risk:** Phase-2 audit records are contractually compliant by grammar but missing the business-attribution context that §15.5 and §17.3 require. Audit reconstructibility — "who acted, under what authority, under which organization" — is lost for all async work at the contract layer. The audit trail for matching engine decisions, document generation, trust score recalculations, and engagement lifecycle cannot be traced to originating users without implementation-specific additions not governed by any contract.

**Recommended change:** Extend the `Correlation` field grammar in §17.2 to:

```
Correlation:          reference_id | idempotency_key | both | phase-2-origin
```

Add: "`Correlation: phase-2-origin` applies to System-actor Phase-2 contracts. It declares that the audit record carries: the Phase-1 `reference_id` for tracing; the originating Phase-1 user ID (field name per Doc-2 §9, by pointer); and the originating Phase-1 organization ID (field name per Doc-2 §9, by pointer). This triple is the mandatory attribution context for all System-actor Phase-2 audit records per §15.5."

---

**F-015 | MAJOR | §17.1 — "Full Audit" for ALL Write Side Effects Conflicts with Doc-2 §9 Business-Critical Audit Scope**

**Description:** §17.1 states: "A Query that has write side effects (e.g., recording a 'viewed' event, updating a `last_accessed_at` column) is a mutating contract by this rule and MUST carry full audit."

"Full audit" is defined by §17.2 as requiring `Audit-Required: yes`, `Actor-Types`, `Action-Ref` (a Doc-2 §9 pointer), `Attribution`, `Mutation-Scope`, and `Correlation`. The `Action-Ref` must point to a Doc-2 §9 action entry.

Doc-2 §9 (per Master Architecture §14.1 and ADR-009) defines audit coverage for business-critical actions: RFQ lifecycle, Quotation lifecycle, Vendor events, Organization events, Financial events, Admin actions, Routing, Scores. `last_accessed_at` updates are operational telemetry, not business-critical audit events. Doc-2 §9 does not contain an action entry for `last_accessed_at` updates (and should not).

§17.1's "full audit" obligation for any write side effect — regardless of business criticality — requires Doc-2 §9 action entries for telemetry operations that have no business-critical audit justification. Either: (a) AI agents will add `Audit-Required: yes` with a fabricated Action-Ref (violating §0.6 — no suitable Doc-2 §9 action exists), or (b) they will escalate every Query-with-side-effect to a Doc-2 §9 patch request (creating unsustainable Doc-2 churn for housekeeping operations).

Additionally, generating business audit records for every `last_accessed_at` update creates:
- Audit table volume not designed for by Master Architecture §14.4 ("audit logs are never deleted")
- Compliance audit noise that degrades the signal quality of the audit trail for actual business-critical actions
- A potential disclosure risk: audit queries (Doc-4J) that surface access patterns as compliance-grade records may reveal information about platform usage patterns not intended for audit disclosure

**Risk:** AI agents generating module contracts will either escalate housekeeping mutations (unsustainable) or fabricate Doc-2 §9 action pointers (nonconforming). The audit standard overreaches beyond Doc-2 §9's business-critical scope.

**Recommended change:** Amend §17.1 to: "A Query that has write side effects is categorized as one of two types: (a) a business-critical side effect — the write records a business action that must appear in Doc-2 §9 (e.g., recording an engagement action, updating a Quotation field as a result of a view-and-accept workflow) — MUST carry full Audit Requirements per §17.2; (b) an operational side effect — the write updates telemetry or housekeeping data not in Doc-2 §9 (e.g., `last_accessed_at`, view counter increments) — declares `Audit-Required: operational` and MUST NOT use a Doc-2 §9 Action-Ref. Operational audit records are governed by development documents; they are not business audit records and MUST NOT appear in the business audit trail."

---

**F-016 | MINOR | §17.3 — `organization_id: absent` for Platform-Wide Admin Contracts Is Ambiguous**

**Description:** §17.3 states for Admin actor: "`organization_id` = the tenant organization whose record is affected for entity-scoped and `tenant-data-access` contracts (§5.6); absent for platform-wide Admin contracts."

"Absent" has three possible interpretations in a database audit record: `NULL` (field present, value null), `omitted` (field not written), or a platform-sentinel value. These have materially different implications for audit query correctness:

- `NULL` with no index makes platform-wide Admin action queries slow
- `omitted` creates a sparse schema (some audit records have the column, some don't)  
- A sentinel (e.g., `organization_id = PLATFORM`) enables efficient querying

The implementation choice should follow from the contract standard. Using "absent" without specifying which representation is an implementation ambiguity that will produce inconsistent audit record schemas across the modules.

**Risk:** Module contracts will declare Admin audit attribution inconsistently (some NULL, some sentinel), making audit query contracts in Doc-4J ambiguous.

**Recommended change:** Replace "absent for platform-wide Admin contracts" with "a designated platform-scope sentinel value defined in Doc-2 §9 (by pointer). The sentinel enables audit queries to distinguish platform-wide Admin actions from entity-scoped Admin actions without NULL semantics."

---

**F-017 | MINOR | §17.5 — Validation Failure Audit Behavior Only Specified for Categories 1–5**

**Description:** §17.5 states: "A validation failure at Category 1–5 (§11.2) produces no business audit record." This leaves the audit behavior for Category 6–9 failures unspecified:

- Category 6 (STATE): illegal transition attempt
- Category 7 (REF): cross-module reference invalid
- Category 8 (BUSINESS): business rule violation
- Category 9 (POLICY): policy limit exceeded

State-transition failures (Category 6) and business rule violations (Category 8) may be relevant for abuse monitoring (unauthorized state manipulation attempts, business rule boundary testing) — but whether they are recorded is left to implementations. AI agents authoring module contracts for commands with known STATE/BUSINESS failure modes don't know whether to declare audit requirements for the failure case.

The Master Architecture §14.1 covers "what actions generate audit records" for success paths. For failure paths, the only corpus rule is Doc-3 §12.1 FIXED — "never shown fake matching activity" — which applies to async success, not synchronous validation failures.

**Risk:** Some module contracts will record Category 6–8 failures in the business audit trail (audit pollution); others won't (audit gap). Abuse pattern detection using audit records will be inconsistent across modules.

**Recommended change:** Add to §17.5: "Validation failures at Categories 6–9 produce no business audit record. The contract MUST declare `Audit-Required: no` for validation failure paths. Category 6–9 failures MAY be recorded per module-specific abuse-monitoring configuration (cited by corpus pointer if such a pointer exists, omitted if not). These abuse-monitoring records are not business audit actions and MUST NOT use Doc-2 §9 Action-Ref values."

---

## Section G — AI-Agent Consumption Review

### Review Summary

Pass 4 is written with AI-agent audiences clearly in mind: grammar blocks are structured, rules are enumerated, the prohibited patterns tables in §13.9 and §16.9 are machine-checkable, and the self-review resolved its own AI-agent ambiguities. The independent review finds six sources of AI-agent implementation risk not resolved by the self-review: the multi-entity block format gap (F-001, MAJOR), the Phase-2 contract identity ambiguity (F-007, MAJOR), the privacy compliance statement grammar gap (F-009, MAJOR), the Correlation attribution gap (F-014, MAJOR), the full-audit overreach (F-015, MAJOR), and the in-flight idempotency race (F-004, MAJOR). The MINORs compound the effect.

Three specific AI-agent failure modes are highlighted:

**Failure mode 1 — Grammar compliance ≠ rule compliance.** F-004 (§14.3 in-flight), F-009 (§16.5 privacy statement), F-006 (§14.5 `Concurrency: none` justification) all share the structure: a MUST obligation exists but has no grammar field, so a syntactically conforming declaration silently omits the obligation. AI agents that generate to the grammar (which is the correct behavior) will systematically miss these requirements. Appendix A will pass them. This class of gap is the highest-risk category for long-lived document consumption.

**Failure mode 2 — Pointer obligations with no pointed-to content.** F-010 (outbox retry POLICY key), F-011 (migration window and payload size POLICY keys) all require AI agents to cite POLICY keys that don't exist in Doc-3 §12.2. AI agents will either invent key names (nonconforming) or halt (correct per §0.6 but produces escalation overhead for every module contract in the system).

**Failure mode 3 — Contract identity uncertainty.** F-007 (Phase-2 contract identity) means AI agents don't know whether to produce one contract per async operation or two. Since both Pattern A (embedded) and Pattern B (separate) are derivable from different sections of §15, agents will produce mixed patterns across modules, making Doc-4L (the cross-module integration index) unassemblable.

---

## Adversarial Workflow Integrity Tests

The following scenarios were tested against §13–§17 standards:

| Attack path | Standard response | Gap? |
|---|---|---|
| Client submits command with state field in payload | §13.3 + §9.4 prohibition; rejected at SYNTAX (Category 1) | No gap |
| Client submits command in terminal state | §13.6 + §13.8; STATE error or NOT_FOUND if protected | No gap |
| AI agent drives state transition directly | §13.5 explicit prohibition; nonconforming at contract layer | No gap |
| Same idempotency key submitted twice, original committed | §14.3 joint rule; replay returns cached result | No gap |
| Same idempotency key submitted twice, original in-flight | §14.3 joint rule does NOT cover this case | **F-004** |
| Event payload carries Buyer Vendor Status | §16.5 + §7.5 prohibit; but compliance statement has no grammar field | **F-009** |
| Consumer writes to emitting module's entity on event receipt | §16.7; nonconforming; out-of-scope for consumer effects | No gap |
| Event consumer builds ordering dependency without read-repair | §16.8; design defect requiring escalation | No gap |
| Phase-2 worker uses originating user ID as primary actor | §15.5 + §17.3; System actor is primary; originating user is correlation | No gap |
| Blacklist audit record served to gated-out vendor via audit API | §17.8 non-disclosure binding requires Error Boundary on audit access contract | No gap (forward dependency on Doc-4J) |
| Fabricated engagement recorded as user activity by async worker | §15.4 Doc-3 §12.1 FIXED citation; prohibited with no POLICY override | No gap |

---

## Finding Inventory

| ID | Severity | Section | Short Description |
|---|---|---|---|
| F-001 | MAJOR | §13.2 | No grammar for multi-entity State Machine Effects blocks |
| F-002 | MINOR | §13.8 | "Scope permits reading that state" not operationalized |
| F-003 | NITPICK | §13.2 | `any non-corpus-terminal` corpus-basis citation has no grammar field |
| F-004 | MAJOR | §14.3 | Joint rule does not address in-flight original race condition |
| F-005 | MINOR | §14.1 | "Either/or" framing excludes contracts needing both idempotency and concurrency |
| F-006 | MINOR | §14.5 | `Concurrency: none` justification has no grammar field |
| F-007 | MAJOR | §15.2 + §15.5 | Phase-2 contract identity ambiguity: embedded vs standalone |
| F-008 | MINOR | §15.7 | "Follow §16 event payload rules" may apply full grammar to push notifications |
| F-009 | MAJOR | §16.5 | §7.5 compliance statement required but has no grammar field in Events Produced |
| F-010 | MINOR | §16.3 | Failure field references outbox retry POLICY key absent from Doc-3 §12.2 |
| F-011 | MINOR | §16.4 + §16.5 | Two POLICY keys referenced in MUST obligations absent from Doc-3 §12.2 |
| F-012 | MINOR | §16.6 | Conditional emission permitted but has no grammar field in Events Produced |
| F-013 | MINOR | §16.8 | `Out-Of-Order` field must be "stated testably" but has no sub-grammar |
| F-014 | MAJOR | §17.2 + §15.5 | Correlation grammar cannot express Phase-2 originating actor/org attribution |
| F-015 | MAJOR | §17.1 | "Full audit" for all write side effects conflicts with Doc-2 §9 scope |
| F-016 | MINOR | §17.3 | `organization_id: absent` for platform-wide Admin contracts is ambiguous |
| F-017 | MINOR | §17.5 | Category 6–9 validation failure audit behavior unspecified |
| F-018 | NITPICK | §16.8 | `Out-Of-Order` "stated testably" — no sub-grammar (overlaps with F-013 body) |
| F-019 | NITPICK | §17.4 | Delegation audit anchor field pointers depend on Doc-2 §9 completeness not verified |
| F-020 | NITPICK | §15.4 | Boundary between System-actor audit records and prohibited "system activity" not drawn |

---

## Final Assessment

### Architecture Quality Score: 83 / 100

The module-ownership boundaries, command-driven state machine discipline, and event-as-fact doctrine are correctly specified and mutually reinforcing. The multi-entity block gap (F-001) is the main architectural risk. Deduction for: F-001 (multi-entity block format, -8), F-007 (Phase-2 contract identity, -5), minor deductions for the MINOR findings (-4).

### Workflow Integrity Score: 80 / 100

The async accepted-then-processing pattern, failure compensation model, and no-fabricated-activity binding are sound. The in-flight idempotency gap (F-004) is a real correctness risk for creation commands under concurrent load. Deduction for: F-004 (-8), F-007 (-7), F-015 audit overreach (-5).

### Event Governance Score: 78 / 100

The events-as-facts principle, thin-payload rules, consumer idempotency obligations, and ordering guarantees are the strongest governance framework in the document series. The privacy compliance statement grammar gap (F-009) is the most significant risk — it undermines non-disclosure enforcement at the event layer across all module contracts. Deduction for: F-009 (-12), F-010 and F-011 unnamed POLICY keys (-6), F-012 conditional emission gap (-4).

### Auditability Score: 79 / 100

The four-attribution delegation model (§17.4) is correct and well-bounded. The System-actor Phase-2 originating-context obligation (§15.5/§17.3) is conceptually right but the Correlation grammar gap (F-014) makes it undeclarable at the contract layer. The "full audit for write side effects" overreach (F-015) degrades audit trail quality. Deduction for: F-014 (-11), F-015 (-7), F-016 (-3).

### AI-Agent Readiness Score: 74 / 100

The prohibited patterns tables (§13.9, §16.9) are machine-checkable. The grammar blocks are structured and enumerable. However, six grammar-compliance-without-rule-compliance gaps, three missing POLICY key citations, and one Phase-2 contract-identity ambiguity collectively produce a document that AI agents can consume syntactically while missing significant normative obligations. Deduction for the six MAJORs across the grammar-gap failure mode cluster (-18), MINOR pointer gaps (-8).

---

### Freeze Recommendation: **Minor Revision Required**

The six MAJORs are patchable without structural change:

- **F-001** (§13.2): Add a numbered-block format for multi-entity State Machine Effects.
- **F-004** (§14.3): Add an in-flight original handling obligation to the joint rule.
- **F-007** (§15.2 + §15.5): Clarify whether Phase-2 contracts are standalone or embedded declarations.
- **F-009** (§16.5): Add `Privacy-Compliance:` as a mandatory grammar field in the Events Produced declaration.
- **F-014** (§17.2): Extend the Correlation field to support `phase-2-origin` attribution.
- **F-015** (§17.1): Distinguish business-critical write side effects from operational write side effects.

None of the findings require module ownership changes, new entities, new events, new POLICY keys (beyond the two missing POLICY keys for event governance), or architectural redesign.

Patch F-009 first — it is the highest-risk gap and the simplest fix: one grammar field addition and one Appendix A check.

---

*End of Doc-4A Content v1.0 — Pass 4 Independent Architecture Review. Next pass: §18, §18B, §19, §20, §21, Appendices A–C per the frozen structure.*
