# Independent Architecture Review — Doc-4A Content v1.0, Pass 3 (§9–§12)

**Reviewer role:** Principal API Governance Architect · Principal Security Architect · Principal Multi-Tenant SaaS Architect · Principal DDD Architect · Principal AI-Agent Systems Reviewer  
**Corpus consulted:** Master_System_Architecture_v1.0_FINAL.md; ADR_Compendium_v1.md; Doc-2 v1.0.2 (incl. Doc2_Patch_v1.0.2); Doc-2 v1.0.3 (Doc-2_Patch_v1.0.3); Doc-3 v1.0.2 (Doc-3_Patch_v1.0.2); Doc-4A Pass 1 (§0–§3, APPROVED); Doc-4A Pass 2 (§4–§8, APPROVED FOR FREEZE)  
**Review scope:** §9 Request Contract Standard; §10 Response Contract Standard; §11 Validation Standard; §12 Error Contract Standard  
**Not reviewed:** structure, completeness, features, or anything outside the four sections above

---

## Section A — Request Contract Review (§9)

### Review Summary

§9 is the strongest section in this pass. The field notation is deterministic and machine-readable. The prohibition table in §9.7 is comprehensive. The opaque-cursor mandate in §9.6 is a well-executed security control. Three gaps were identified.

---

**F-001 | MINOR | §9.2 — Absence Semantics Not Differentiated by Operation Type**

**Description:** §9.2 states: "An omitted field means 'no change / use default'." This conflates the semantics of two distinct operation types. For a CREATE command, an omitted optional field means "use server default" — the record is new, there is no prior value to preserve. For an UPDATE (PATCH-style) command, "no change" is the correct semantic — the field retains its existing value. If an AI agent authors a CREATE contract following §9.2 literally, it might correctly use "use default" semantics. If it authors an UPDATE contract, "no change" is correct. But §9.2 presents both as one rule without distinguishing them.

This gap matters because the contract's field constraint position (§9.1) must state the absence behavior ("server default by POLICY key, or 'no effect'"). An AI agent writing "no effect" for an optional field on a CREATE contract would produce a contract where omitting the field on creation has no effect — i.e., the field is not set at all — which may conflict with the schema's NOT NULL constraints or business rules.

**Risk:** AI agents generate ambiguous absence-behavior declarations for CREATE contracts, producing runtime schema violations or contracts where optional fields are silently not initialized on creation.

**Recommended change:** Add to §9.2: "For CREATE contracts, absent optional fields resolve to their server default (POLICY key or corpus-defined default — MUST be stated in the constraint position). For UPDATE contracts, absent optional fields mean 'no change to the existing value.' The contract's header (Template 21.1 operation type) determines which semantics apply; the constraint position MUST state the applicable absence behavior unambiguously using one of these two forms."

---

**F-002 | MINOR | §9.4 — State-Based Filter Fields in Query Contracts May Be Inadvertently Prohibited**

**Description:** §9.4 states: "A request MUST NOT accept an entity's lifecycle state as an input field; state changes occur only through commands whose State Machine Effects declare the transition." The rule's intent is to prevent client-side state-setting (bypassing the state machine on mutation commands). However, the wording — "a request MUST NOT accept an entity's lifecycle state as an input field" — applies to all request contracts, including Query contracts. A Query contract with a filter field `filter.state: enum(Doc-2 §5)` is a legitimate, corpus-grounded construct (listing RFQs in `matching` state for admin monitoring, or filtering quotations by `submitted` state for a buyer's dashboard). The state is read as a filter criterion, not written to the entity.

**Risk:** AI agents authoring Doc-4E or Doc-4J Query contracts may refuse to include state-based filters, citing §9.4, producing contracts with incomplete filtering capabilities. Alternatively, agents may include state filters and be flagged as nonconforming during review without a clear resolution path.

**Recommended change:** Add to §9.4: "This prohibition applies to mutating request contracts only (Commands). Query contracts MAY declare state values as filterable dimensions in the contract's explicit allowlist (§9.6). Filtering on state in a Query is a read assertion, not a state-setting input, and is not governed by this rule."

---

**F-003 | MINOR | §9.7 — No General Principle for Server-Assigned Business Flags**

**Description:** §9.7 provides an explicit enumerated list of prohibited request fields. The list correctly covers attribution, audit, tenant-selection, authorization, ownership, lifecycle state, governance signal, soft-delete, human_ref, and POLICY-override fields. However, it does not establish a general principle for other server-assigned business-domain flags that fall outside these categories.

A concrete example from the frozen corpus: the `buyer_directed` flag on invitation records (PATCH-D3-02). This flag is server-determined at the point of invitation creation (based on whether the originating vendor came from a buyer-supplied record). A request contract for buyer-directed invitation delivery must never accept `buyer_directed` as a client input — but §9.7 does not cover it, and no other section establishes the general principle.

**Risk:** AI agents authoring Doc-4E (invitation delivery contracts) or other module contracts encounter server-assigned business flags not in §9.7's enumeration and decide independently whether they are prohibited. Some will permit them as optional fields; others will prohibit them without justification. Inconsistency across module contracts will follow.

**Recommended change:** Add a closing rule to §9.7: "General principle: any field whose value the server determines unilaterally at write time — based on context, state, or corpus-defined logic rather than direct client input — MUST NOT appear as a writable request field. If a contract author identifies a server-assigned flag not covered by the rows above, the field is prohibited by this general principle; no escalation is required to exclude it, but escalation (§0.6) is required if the author believes the flag should be client-supplying."

---

**F-004 | NITPICK | §9.1 — `none` Constraint Permitted on All Field Types Including Numeric and Money**

**Description:** §9.1 requires the constraint position to carry "the literal `none`" when no constraint applies. `none` as a declared constraint means "no validation binding" — the field is accepted as-is. For `string` fields this is potentially acceptable (some string fields legitimately have no corpus-defined constraint). For `integer`, `decimal`, and `money` fields, `none` permits any value: negative amounts, zero amounts, amounts exceeding any business maximum, zero-precision decimals, or amounts denominated in an unexpected currency. These are not simply "no constraint" situations — they are security-relevant: negative amounts could trigger financial computation errors; zero-amounts could bypass quota gates; unconstrained money fields undermine the BDT-denomination discipline.

**Risk:** AI agents generating contracts for monetary or numeric fields will write `none` in the constraint position if the corpus doesn't cite an explicit POLICY key, producing nominally conforming contracts that accept financially dangerous values.

**Recommended change:** Add: "`none` is not permitted for `integer`, `decimal`, or `money` type fields. These fields MUST declare at minimum: a lower bound (e.g., `> 0` for positive amounts, `>= 0` for non-negative), an upper bound (POLICY key or corpus-defined maximum), and for `money`, the accepted currency set (§9.8 BDT default). If no corpus pointer or POLICY key exists for the bound, escalate (§0.6) — do not write `none`."

---

## Section B — Response Contract Review (§10)

### Review Summary

§10 is well-constructed. The exclusion-consistency rule (§10.7) is tight and correctly positioned as the non-disclosure enforcement point in the response layer. The derived-data declaration (§10.8) is complete. Two significant gaps were identified: an undefined concept in §10.6, and an insufficiently strong keyword in §10.3.

---

**F-005 | MAJOR | §10.6 — "Display Label" Concept Is Undefined and Creates a Representation-Smuggling Path**

**Description:** §10.6 permits a cross-module reference field to carry "a display label the owning module's Query already publishes for that audience" alongside the UUID. This is a practical necessity — consumers need a human-readable label. However, the term "display label" is not defined anywhere in Doc-4A. There is no specification of:

- What fields a "display label" may contain (name only? name + status? name + verified badge? name + financial tier?)
- Whether a display label is itself a representation (subject to §10.1 rules) or something else
- Whether a display label is conditional on the viewing party's grants
- Whether a display label is subject to §10.7 exclusion-consistency rules

Without a definition, the "display label" carve-out in §10.6 is an undefined exception to the canonical representation rule of §10.1. An AI agent authoring Doc-4E response contracts could embed a `vendor_profile_summary` object (including name, verification status, financial tier, and trust band) as a "display label," which is functionally a full summary representation embedded in a non-owning module — a direct §10.1 violation, dressed as a label.

The surface risk is concrete: the RFQ module (Doc-4E) embeds vendor-profile data in routing result responses. Without a definition of "display label," this module can expand the label to include governance signal values (trust band, financial tier), bypassing the governance firewall's prohibition on governance signals appearing outside the owner module's contracts.

**Risk:** Doc-4E, Doc-4F, and Doc-4H response contracts embed extended vendor or organization data as "display labels," gradually creating informal shadow representations of cross-module entities. Over time, these accumulate into competing sources of truth for entity data, violating One-Entity-One-Owner and the governance firewall.

**Recommended change:** Define "display label" in §10.6 as a bounded construct: "A display label is a single string field containing only the entity's human-readable name (or equivalent primary identifier) as returned by the owning module's published Query for that entity type. It MUST NOT include status flags, governance signal values, verification indicators, computed scores, or any field that varies by a protected fact. A display label is always `always` visibility (it is public or the consumer already has the entity's UUID, implying the entity is in scope). If more than a name is required, the consumer calls the owning module's Query directly."

---

**F-006 | MAJOR | §10.3 — `total_count` SHOULD NOT Is Insufficient for Protected-Fact Exclusion Surfaces**

**Description:** §10.3 states: "Contracts SHOULD NOT declare totals on surfaces where protected-fact exclusions apply, unless they can state §7.5 compliance." The non-disclosure invariant (Architecture §22.3, §7.5) is a security invariant with absolute scope — it has no permitted exceptions where a disclosure might be acceptable. Yet SHOULD NOT (RFC-2119: "default expectation; deviation requires a recorded, reviewable justification") permits a module document author to declare totals on an exclusion surface by providing a justification, even if that justification amounts to "we apply the same exclusion to totals as to items."

The deeper issue: whether a total count is exclusion-consistent is an implementation claim, not a contract claim. A contract author can declare `total_count` with a §7.5 compliance statement: "total_count applies the same exclusions as items" — and the contract is technically conforming. But the claim's truth is verifiable only in the implementation. For the non-disclosure invariant to hold at the contract layer, the prohibition must be stronger than SHOULD NOT.

Furthermore: §10.7 already mandates "a count that includes what the list omits is a disclosure leak and a conformance failure." This MUST-level rule already covers the exclusion-consistency requirement. If §10.7 is satisfied, why is §10.3's SHOULD NOT needed at all? The tension between §10.3 (permissive, SHOULD NOT) and §10.7 (mandatory, MUST) creates ambiguity: an author declaring totals on an exclusion surface is conforming if they state §7.5 compliance (§10.3) but nonconforming if they fail §10.7 in implementation. The lines of defense are inconsistent.

**Risk:** Contract authors declare `total_count` on routing result surfaces, invitation list surfaces, or any list where protected-fact exclusions apply, justified by a boilerplate §7.5 compliance statement. The implementation may or may not correctly apply exclusions to the count. The non-disclosure invariant is weakened at the contract definition layer.

**Recommended change:** Promote the prohibition to MUST NOT: "Contracts MUST NOT declare `total_count` on any list surface where protected-fact exclusions under §7.5 apply. If a total count is operationally necessary for a surface with exclusions (e.g., an admin-only analytics surface visible only to parties who can see the exclusion facts), the contract MUST declare the elevated access requirement (the `staff_*` slug or compliance-tier grant) explicitly in its Required Permissions, and MUST state that total counts on this surface are visible only under that elevated access. No other exception to this rule exists." This eliminates the SHOULD NOT/MUST NOT tension and closes the boilerplate-compliance loophole.

---

**F-007 | MINOR | §10.2 — Success Response State Disclosure to Parties Who Can Mutate But Not Read Full State**

**Description:** §10.2 mandates: "A mutating contract's response returns the canonical representation of the aggregate root after the mutation, including its current state value." The state value is returned to every successful caller of a mutating contract.

Consider: a vendor representative who holds `can_submit_quotation` (a delegation-eligible slug) submits a quotation against an RFQ. The mutation succeeds; the response includes the quotation's canonical representation, including `state: "submitted"`. This is expected. But the RFQ's state post-submission (e.g., `quotations_received`) might also appear in the quotation representation as a related field or embedded in the response context. Does the vendor representative have the right to read the RFQ's current state label? The corpus (Architecture §9.5) states "Decisions are explainable to the decider, not to the excluded" — routing and state information belongs to the buyer.

The deeper architectural question: the canonical representation of a quotation might include a reference to the RFQ (as a UUID). If the response also includes the RFQ's `state` (embedded or as a display label), this may over-disclose state to the vendor. §10.6 prohibits embedding another module's entity representation — which covers this. But the issue is in the response of the OWNING module (the quotation's response from Module 3), which might include RFQ state as a convenience field.

**Risk:** Module document authors embed RFQ state values in quotation response contracts or vice versa, citing §10.2's "current state value" requirement as justification, without evaluating whether the state is visible to the caller's scope.

**Recommended change:** Add a clarification to §10.2: "The 'current state value' returned is the state of the aggregate root the mutation operated on — not the state of related entities referenced in the representation. State values of cross-module entities follow §10.6 cross-module reference rules (UUID and display label only). If the caller's scope includes reading the entity's state (§10.6 visibility conditions), the state is a conditional field; otherwise it is absent."

---

**F-008 | MINOR | §10.7 — No Guidance on "Absent vs Placeholder" Choice for Redacted Fields**

**Description:** §10.7 states: "where a field may be redacted under compliance policy, the representation MUST declare the redacted form (field absent vs placeholder) so consumers and AI agents handle it deterministically." The rule correctly requires a declared redacted form, but provides no guidance on which form to choose.

The choice has security implications. "Field absent" (the field simply doesn't appear in the response) is less disclosing — the consumer can't tell if the field was redacted or simply not populated (for an optional field). But this creates a determinism problem for consumers: an optional field that might or might not appear creates branching logic. "Placeholder" (e.g., `null` with a `redacted: true` companion field, or a fixed redacted-value string) is more disclosing — the consumer knows the field exists but was redacted — but is more deterministic.

Without guidance, AI agents will choose inconsistently: some contracts will use "absent," others will use placeholder strings, others will use `null`. The resulting inconsistency makes cross-module API consumers brittle.

**Risk:** Module documents define redacted forms inconsistently. AI agent consumers (Doc-4K AI Layer) and frontend clients write brittle null-handling code that breaks when modules switch redaction form.

**Recommended change:** Add: "The RECOMMENDED redacted form is a fixed null value accompanied by a sibling boolean field `<field_name>_redacted: boolean : conditional (redaction applies) : always true when present`. This form is deterministic (the field always appears in the schema, null with a companion flag), auditable (the companion flag confirms intentional redaction), and consistent across modules. 'Field absent' is permitted for fields whose mere existence is itself sensitive (e.g., a compliance-investigation annotation field whose presence would reveal an investigation is underway); this is the exception, not the default."

---

## Section C — Validation Review (§11)

### Review Summary

The nine-category ordered validation model in §11.2 is the document's strongest architectural contribution. The disclosure-control principle embedded in the ordering (authorization before semantics) is correctly stated and well-reasoned. Two cross-section issues require resolution.

---

**F-009 | MAJOR | §11.2 + §12.2 — Category 9 (POLICY) Maps to Two Error Classes with No Sub-Type Guidance**

**Description:** §11.2's POLICY category (order 9) covers both "POLICY-bounded limits" (e.g., `monthly_rfq_limit` exhausted) and "entitlement gates by entitlement key." §12.2 maps category 9 to two distinct error classes: QUOTA ("entitlement/quota exhausted") with `retryable: false` and RATE_LIMITED ("throughput control engaged") with `retryable: true`. These two classes have opposite retry behavior and different client handling semantics — returning the wrong one produces incorrect client behavior.

However, §11.2's category 9 definition does not distinguish between the two sub-types, and §12.2's "Maps from §11 category" column shows "9" for both QUOTA and RATE_LIMITED without specifying which POLICY failures map to which class. An AI agent implementing error handling for category 9 failures must somehow determine whether to return QUOTA or RATE_LIMITED — but §11 gives no guidance.

The distinction is: QUOTA is about a finite resource being exhausted (a quota balance reaches zero; restoring requires action by the account holder or admin), while RATE_LIMITED is about a throughput window (the limit resets automatically after a time interval). Both are triggered by POLICY-bounded validation failures, but their semantics are fundamentally different.

**Risk:** AI agents return QUOTA for rate-limit violations (preventing clients from retrying, causing user-visible failures) or return RATE_LIMITED for quota exhaustion (prompting unnecessary retries against a quota that won't reset on its own). The incorrect retryable flag causes cascading behavior: a client retrying against an exhausted quota generates load against a validation that will always fail; a client not retrying against a rate limit provides a degraded user experience.

**Recommended change:** Split §11.2's category 9 into two sub-categories, or add a note: "Category 9 failures map to two error classes based on the type of POLICY limit violated: (a) if the failure is against a finite quota instrument (entitlement key, usage ledger balance — examples: `monthly_rfq_limit`, lead credits) → QUOTA class, `retryable: false until quota is restored by account action or admin`. (b) if the failure is against a throughput window (requests per time unit — examples: API call rate limits, bulk-operation rate limits) → RATE_LIMITED class, `retryable: true after the declared interval`. The contract's Validation Rules field MUST identify which sub-type applies for each category-9 rule."

---

**F-010 | MAJOR | §11.4 + §12.2 — Delegation Category Error Class Is Ambiguous Between NOT_FOUND and AUTHORIZATION**

**Description:** §12.2's classification table maps category 5 (DELEGATION) to NOT_FOUND: "Resource does not exist OR caller has no right to know whether it exists | 4, 5 (and protected-fact cases of any category)." This notation implies ALL category 5 failures return NOT_FOUND regardless of context.

§11.4 qualifies this: "DELEGATION-category failure semantics follow §7.5 where the failure would otherwise reveal a protected fact." This qualifier limits the NOT_FOUND collapse to cases involving protected facts. For delegation failures that do NOT involve protected facts — specifically, failures at §6B.2 condition 2 (the acting user lacks the required slug within the representative organization) — the resource is known to exist (the representative has a valid grant), the grant is known to exist (they hold it), and the failure is purely "you hold this grant but not this slug." This is equivalent to a category 3 (AUTHZ) failure: the caller's right to know the resource exists is established, but they lack the required permission. The correct error class for this case is AUTHORIZATION, not NOT_FOUND.

An AI agent reading §12.2 alone will always return NOT_FOUND for category 5. An agent reading §11.4 alone will conditionally return NOT_FOUND. The two sections produce conflicting implementation guidance.

**Risk:** All delegation failures return NOT_FOUND universally (following §12.2). Representatives whose grants are correctly configured but who lack the specific slug for an operation receive NOT_FOUND instead of AUTHORIZATION. This makes debugging impossible — the representative cannot distinguish "you have no grant" (genuine NOT_FOUND) from "you have a grant but not this slug" (AUTHORIZATION). The platform's delegation model becomes opaque to legitimate operators.

The inverse risk: an agent following §11.4 returns AUTHORIZATION for non-protected delegation failures, contradicting §12.2, producing a nonconforming contract that fails Appendix A.

**Recommended change:** Reconcile the two sections explicitly in §12.2: change the NOT_FOUND row's category mapping to "4 (all cases); 5 (only cases where the failure would reveal a protected fact per §11.4 and §7.5)." Add a note: "DELEGATION category failures that do not involve a protected fact — specifically, condition 2 failures (slug not held in representative org) on a resource the representative's grant unambiguously covers — return AUTHORIZATION. The contract's error declaration MUST state, per delegation failure point, which class applies and why, per §12.4's per-failure-point requirement."

---

**F-011 | MINOR | §11.4 — DEPENDENCY Error for Failed REF Validation Service Call: Idempotency Interaction Undefined**

**Description:** §11.4 states: "REF-category checks call the owning module's Query/Service; the validating module MUST NOT implement another module's validity logic locally." If the owning module's service is unavailable during REF validation, the caller receives a DEPENDENCY error (§12.2: "An owning module's service required for REF/composition was unavailable," `retryable: true`). The caller is advised to retry.

However, §11.3 establishes that validation failures have no effect. If a mutating contract fails REF validation due to DEPENDENCY, the mutation was not applied — retry is correct. But the caller cannot distinguish between: (a) REF validation failed due to DEPENDENCY, mutation not applied, and (b) mutation applied successfully but the response was lost. This is the classic at-least-once vs at-most-once delivery problem in distributed systems. §14 (by pointer, not yet authored) governs idempotency. The interaction between REF DEPENDENCY failures and idempotency is unaddressed in §11.

**Risk:** AI agents implementing the server side of a contract that fails REF validation with DEPENDENCY don't know whether to declare the contract as idempotent (to make retry safe) or accept the ambiguity. Module documents author inconsistent idempotency declarations on REF-heavy contracts.

**Recommended change:** Add to §11.4: "If a REF-category check fails due to an owning module service being unavailable, the contract returns DEPENDENCY (§12.2) without applying the mutation. No partial write occurs. Contracts whose REF checks can fail with DEPENDENCY MUST declare idempotency semantics (§14 by pointer) so that callers can retry safely. A contract that is not idempotent MUST document the risk of duplicate submission on retry in its Validation Rules."

---

**F-012 | MINOR | §9.8 + §10.5 — Batch Operations: Per-Item Audit Record Requirement Not Stated**

**Description:** §9.8 defines batch mutations as "a list of independent single-aggregate operations with per-item outcomes." §10.5 requires "per-item outcomes" in the response. Neither section states whether each per-item operation within a batch must generate its own independent audit record and event emission.

Architecture §14 ("all business-critical actions generate immutable audit records") and §15 ("every important business action emits a domain event") apply to all mutating operations. But "batch mutation" as a container is not itself an operation — the constituent items are. The silence on this creates room for an AI agent to generate one batch-level audit record instead of per-item records, or to emit one aggregate event rather than per-item events.

**Risk:** Batch contracts generate single audit records that lose item-level traceability. Compliance audit queries for individual entity mutations return no results if those mutations were executed as part of a batch. The audit completeness guarantee from ADR-009 is compromised at the batch layer.

**Recommended change:** Add to §9.8 or §10.5: "Each item in a batch is an independent single-aggregate operation: it has its own transaction, its own audit record, its own event emission (if applicable), and its own per-item outcome in the response. A batch contract MUST NOT define a shared transaction spanning items, a single audit record for the batch, or aggregate event emission. The batch container is a transport convenience only — it introduces no new audit action type and no aggregate business effect."

---

## Section D — Error Contract Review (§12)

### Review Summary

§12 is the highest-priority section and is largely excellent. The non-disclosure collapse rule in §12.4 is well-specified and covers all six §7.5 channels across error responses. Adversarial testing of thirteen disclosure paths found all covered. Two significant issues were found: a timing-channel obligation that is referenced but not actionable in contract notation, and a missing template field for the per-failure-point boundary declaration.

**Adversarial Testing Summary — Non-Disclosure Invariant:**

| Attack Vector | Result |
|---|---|
| Blacklist via VALIDATION field error | COVERED: §12.4 prohibits protected facts in field_errors |
| Blacklist via AUTHORIZATION vs NOT_FOUND boundary | COVERED: §12.4 boundary rule; §12.2 NOT_FOUND definition |
| Blacklist via REFERENCE error (cross-module) | COVERED: REF check verifies entity existence, not routing eligibility |
| Blacklist via STATE error | COVERED: §11.2 ordering ensures authorization/scope fails before STATE is reached |
| Blacklist via QUOTA error | COVERED: §12.5 discloses quota only to entitled parties |
| Blacklist via DEPENDENCY error details | COVERED: §12.5 prohibits internal topology in DEPENDENCY errors |
| Blacklist via field_errors shape | COVERED: §12.4 explicitly named |
| Blacklist via error_code namespace | COVERED: §12.3 prohibits encoding protected facts in codes |
| Blacklist via message interpolation | COVERED: §12.3 prohibits interpolating data caller cannot read |
| Blacklist via CONFLICT token | COVERED: §12.5 no competing actor information |
| Blacklist via RATE_LIMITED metadata | COVERED: §12.4 explicitly named |
| Blacklist via SYSTEM error | COVERED: §12.5 reference_id only |
| Blacklist via ASYNC_PENDING path | COVERED: blacklisted vendors fail at SCOPE before any async operation is accepted |

---

**F-013 | MAJOR | §12.4 — "Same Declared Timing Path (§7.5)" Is Referenced But Not Actionable in Contract Notation**

**Description:** §12.4 states that for protected-fact collapse, the error must have "same `error_class`, same `error_code`, same message, same `field_errors` shape, same declared timing path (§7.5)." The first four are concrete fields in the §12.1 error structure — declarable, reviewable, and verifiable in the contract. "Same declared timing path" is not a field in §12.1. It is a reference to §7.5's channel requirement that "protected gating occurs inside asynchronous or uniform paths."

An AI agent implementing a contract's error handling will produce code that: returns the specified error_class, error_code, message, and field_errors shape — all verifiable. For the timing path, the agent has no actionable instruction. "Uniform path" is an implementation requirement, not a contract field. The contract notation (§3.3) has no field type or constraint syntax for declaring processing path uniformity.

The result is a gap in the enforcement chain: §12.4 declares four verifiable properties and one unverifiable reference. An AI agent satisfying all four verifiable properties (passing Appendix A's conformance check) may still produce a timing-channel leak (fast path on blacklist, slow path on genuine not-found) without the contract being marked nonconforming.

This is the only remaining open vector for the non-disclosure timing channel — the document correctly identifies the channel in §7.5 and acknowledges it in §12.4, but the bridge from declaration to implementation is incomplete.

**Risk:** AI agents implementing error handling for protected-fact collapse produce code that passes all contract-layer checks (correct class, code, message, field_errors) while implementing a timing-channel leak through the error response path. The timing difference between "blacklisted vendor not found" (gated synchronously at routing, fast exit) and "genuinely non-existent entity not found" (requires a database lookup, slower) is observable to an adversary with repeated probing.

**Recommended change:** Two changes:
1. Add a concrete declaration to §12.1's error structure or to §12.4: "timing_path: enum(uniform | async_gated) — always present on contracts that are subject to the protected-fact collapse rule. `uniform` means the implementation MUST process protected-fact and genuine-not-found paths identically in elapsed time (e.g., both paths execute the same database lookup regardless of an early gate trigger). `async_gated` means the protected gate executes asynchronously inside the processing path so timing is not observable at the contract surface." This makes the timing path a declarable field in the contract.
2. Add to §12.4: "Contracts subject to the protected-fact collapse rule MUST declare their `timing_path`. A contract that cannot declare `uniform` or `async_gated` timing MUST escalate (§0.6) before authoring — it cannot safely implement the non-disclosure invariant."

---

**F-014 | MINOR | §12.4 — Per-Failure-Point AUTHORIZATION/NOT_FOUND Boundary Declaration Has No Template Field**

**Description:** §12.4 mandates: "Each contract's error declaration MUST state, per failure point, which side of this [AUTHORIZATION vs NOT_FOUND] boundary it falls on." This is a strong and important rule. However, Template 21.1 (referenced throughout for contract structure) has no designated field for this per-failure-point boundary declaration.

Module document authors will place this declaration in the Validation Rules field (most likely), the Error Handling field (if one exists), or inline in prose. The result will be inconsistent placement across 10+ module documents, making automated review (Appendix A) and AI agent consumption unreliable.

**Risk:** AI agents authoring module contracts cannot consistently locate the AUTHORIZATION/NOT_FOUND boundary declaration when reviewing another module's contract. Cross-module contract review misses undeclared failure points. Appendix A cannot check the presence of this declaration because it has no defined field location.

**Recommended change:** Either: (a) add a named field to Template 21.1 for "Error Boundary Declarations" with the format: `<failure point description> : <AUTHORIZATION | NOT_FOUND> : <reason referencing §12.4>`, OR (b) add a mandatory subsection to each contract's Validation Rules field: "Error Boundary: [list each authorization/scope failure point and its class]." Define the location in §12.4 explicitly so authors and Appendix A reviewers know where to find and check it.

---

**F-015 | MINOR | §12.5 — STATE Error: "Scope Includes Reading That State" Not Distinguished from "Scope to Perform Transition"**

**Description:** §12.5 states: "STATE errors MAY name the entity's current state and the legal transitions only to callers whose scope already includes reading that state; otherwise the protected-fact collapse rule applies." This rule correctly limits STATE disclosure. However, "scope already includes reading that state" is not defined relative to mutation scope.

A concrete case: a vendor representative who holds `can_submit_quotation` (and the active delegation grant) can invoke the quotation submission command. If the RFQ is in `closed_won` state and the submission fails with STATE error, the question is: does the representative's scope include reading the RFQ's current state? They hold a mutation permission (`can_submit_quotation`), but do they hold a READ permission for the RFQ's state value? The Architecture (§9.5) states that routing decisions are "explainable to the decider, not to the excluded" — suggesting RFQ state is primarily a buyer-visible attribute, not a vendor-visible one.

If the answer is "no, the representative's scope does not include reading `closed_won`," then the STATE error must collapse to NOT_FOUND per §12.5. If the answer is "yes, because they have a mutation scope," then the STATE error can name the state. The standard doesn't define which.

**Risk:** AI agents authoring Doc-4E (quotation submission contracts) include `state` and `legal_transitions` in STATE error responses, reasoning that the representative has mutation scope and therefore can read the state. The result is that representatives can infer RFQ award status (closed_won / closed_lost) through failed submission attempts — information the buyer may prefer to control.

**Recommended change:** Add to §12.5: "'Scope includes reading that state' means the requesting party holds an explicit READ permission for the entity (a `can_view_*` slug that covers the entity's state attribute) — not merely a mutation permission. Mutation scope does not imply read scope for the STATE error's current-state disclosure. If the caller holds only mutation permissions and no read permission for the entity, the STATE error MUST NOT name the current state."

---

**F-016 | MINOR | §12.4 — "The Uniform Declared Class for Other Surfaces" Is Underspecified**

**Description:** §12.4 states: "Protected-fact collapse rule: same `error_class` (`NOT_FOUND` for resource access; the uniform declared class for other surfaces)." "Other surfaces" is not defined. This matters because non-resource-access surfaces — analytics endpoints, list/search endpoints, aggregate endpoints — can also be vectors for protected-fact disclosure, and the error class on these surfaces may not be NOT_FOUND.

For example: a vendor calls an analytics endpoint to retrieve their own lead delivery statistics. The endpoint might return an empty analytics response (not an error) rather than NOT_FOUND when protected facts are in scope. Or it might return a BUSINESS error if no data is available. The "uniform declared class" for this surface is not NOT_FOUND — it should be whatever empty-or-no-data response the endpoint declares for non-protected cases.

The rule correctly identifies that non-resource surfaces need their own uniform class. But without defining what qualifies as "declared" or how the class is chosen, authors will set the uniform class to NOT_FOUND by default (the only named class in §12.4), which may be semantically wrong for analytics or aggregate surfaces.

**Risk:** Analytics and aggregate contracts declare NOT_FOUND as their uniform protected-fact class, producing confusing semantics (analytics endpoints that return NOT_FOUND instead of empty results when exclusions apply). Alternatively, contracts skip declaring the uniform class entirely, leaving the non-disclosure behavior undefined.

**Recommended change:** Add to §12.4: "'Other surfaces' means any contract surface that does not return a single resource entity — including list/search (which returns empty items list, not NOT_FOUND), analytics (which returns zero-valued metrics), and aggregate endpoints (which return zero counts). For these surfaces, the 'uniform declared class' MUST be: the same class and shape the contract returns for a genuine zero-result case (no error — the response itself is uniform, not the error class). The contract MUST declare in its Validation Rules that protected-fact exclusions produce the same response as a genuine zero-result. If the surface has no valid zero-result case (i.e., it MUST always return at least one item for authorized callers), then NOT_FOUND applies."

---

**F-017 | NITPICK | §11.2 — Category Table Has No "Maps to Error Class" Column; Cross-Section Lookup Required**

**Description:** §11.2 defines the nine validation categories with columns: Order, Category, Nature, Checks. There is no "Error Class" column. To implement error handling for a validation failure in category N, an AI agent must cross-reference §12.2's classification table, which has a "Maps from §11 category" column. This cross-section dependency is not mentioned in §11.2 — an AI agent reading §11 alone has no indication that the error class determination requires reading §12.

**Risk:** AI agents authoring module contracts implement validation logic (§11) and error handling (§12) separately, without connecting the two. Error class assignments in module contracts are made by intuition rather than by following the §11.2 → §12.2 mapping, producing inconsistency.

**Recommended change:** Add a note to §11.2: "Error class determination for each category: see §12.2 (Maps from §11 category column). §11 and §12 are coupled — authors MUST consult both sections when declaring validation rules and error responses."

---

**F-018 | NITPICK | §10.3 — `has_more` Semantics Under Empty-List Edge Case Not Specified**

**Description:** §10.3 declares `has_more: boolean : always`. This field is `always` present, meaning it must be returned in all list responses. Its purpose is to indicate whether additional items exist beyond the current page. The edge case: a list response where ALL items were excluded (by protected-fact filtering, tenancy, or soft-delete) — the `items` list is empty, `has_more` is false, `total_count` (if declared) is zero. This response is correctly indistinguishable from "no items of this type exist for this caller."

However, `has_more: false` with an empty items list has two interpretations: (a) there are no more items AND there are no items, and (b) there are no more items (after the current page), but the current page has items. The combination `items: [], has_more: false` is unambiguous. But what about: the cursor from a previous request is presented, all remaining items are excluded, items is empty, has_more is... what? True would leak that there are more items (even if excluded); false would be correct but might confuse clients that received a non-empty page_info on the previous request.

This is a very narrow edge case but matters for robustness of cursor-based pagination under exclusion filtering.

**Recommended change:** Add: "`has_more: false` when the items list is empty — regardless of whether items were excluded or never existed. Cursors that return an empty items list with `has_more: false` terminate pagination correctly. Clients MUST NOT interpret an empty items response on a non-first page as a cursor error; they MUST treat it as a normal page-exhaustion signal."

---

## Section E — AI-Agent Consumption Review

### Summary Assessment

The document is substantially well-structured for AI-agent consumption. The field notation (§9.1), the category ordering table (§11.2), and the error classification table (§12.2) are all machine-readable constructs that AI coding agents can process deterministically. The prohibited-request-fields table (§9.7) and the exclusion-consistency rule (§10.7) are checkable by Appendix A.

**AI-agent risks identified:**

1. **§12.2 DELEGATION ambiguity (F-010):** AI agents reading the category mapping table will implement NOT_FOUND universally for category 5. This is the most dangerous AI-agent misimplementation — it causes all delegation errors to be opaque, but passes conformance checking.

2. **§12.4 timing path (F-013):** AI agents cannot translate "same declared timing path (§7.5)" into a contract declaration. They will satisfy the four concrete fields and skip the timing path, producing a technically conforming but timing-leaky implementation.

3. **§10.6 display label (F-005):** Without a definition, AI agents will interpret "display label" as broadly as needed to avoid multiple service calls, embedding more data than intended.

4. **§9.2 absence semantics (F-001):** AI agents generating UPDATE contracts will apply CREATE absence semantics ("use default") producing contracts where optional fields are reset to defaults on every partial update.

5. **§9.4 state filter (F-002):** AI agents may refuse to generate state-based filters in Query contracts, producing contracts with degraded filtering capability.

6. **§11.2/§12.2 category 9 split (F-009):** AI agents will coin their own logic for QUOTA vs RATE_LIMITED distinction, producing inconsistent retry-behavior declarations across module contracts.

---

## Final Assessment

### Architecture Quality Score: 83 / 100

The document's architectural foundations are strong. The validation category ordering (§11.2) is an elegant and correct disclosure-control mechanism. The request grammar (§9.1) is deterministic. The exclusion-consistency rule (§10.7) is tight. Deductions are concentrated in: two MAJOR cross-section inconsistencies (§11.4/§12.2 delegation class and §10.3 total_count keyword), one undefined concept (§10.6 display label), and the category-9 error class split guidance gap. None require section redesign — all are targeted additions or clarifications.

### Security Quality Score: 88 / 100

The non-disclosure invariant is the best-specified security control in any pass of this document. All thirteen adversarial disclosure paths tested were covered. §12.4's protected-fact collapse rule is correct and complete for four of its five requirements. The single deduction comes from the timing-path obligation (F-013), which is present and correctly referenced but not actionable in contract notation — a gap that an adversary with repeated probing capability could exploit if implementation does not independently enforce §7.5. The SHOULD NOT keyword for total_count (F-006) is a secondary deduction.

### AI-Agent Readiness Score: 78 / 100

The document's machine-readable structures (tables, enumerated rules, explicit allowlists) are well-suited to AI-agent consumption. Deductions are for: the §12.2 category 5 ambiguity that produces a simpler but incorrect implementation path for AI agents; the timing-path reference that cannot be translated to implementation; the undefined display label; and the category-9 split gap. The absence-semantics ambiguity (F-001) is a recurring implementation mistake waiting to happen. These are all targeted fixes.

---

### Freeze Recommendation: **Minor Revision Required**

No BLOCKERs. No section requires redesign. The document is architecturally sound and the non-disclosure invariant is well-served by the four-section design.

**Required before freeze:**

- **F-010 (MAJOR):** Reconcile §11.4 and §12.2 on the delegation failure error class. The ambiguity produces an incorrect implementation path for AI agents.
- **F-013 (MAJOR):** Make the timing-path obligation in §12.4 actionable. Either add a declarable `timing_path` field to the error structure, or explicitly state it is an implementation constraint (not a contract declaration) with a cross-reference to the Development Decomposition.
- **F-005 (MAJOR):** Define "display label" scope boundaries in §10.6 before module document authoring begins. Without this, Doc-4D, Doc-4E, and Doc-4F will embed inconsistent cross-module data in responses.
- **F-006 (MAJOR):** Promote total_count from SHOULD NOT to MUST NOT for protected-fact exclusion surfaces. SHOULD NOT weakens the non-disclosure invariant at the contract layer.

**Strongly recommended before freeze:**

- F-009 (MAJOR): Add QUOTA vs RATE_LIMITED guidance to §11.2 category 9.
- F-002 (MINOR): Clarify that §9.4's state-field prohibition is for mutation contracts only.
- F-001 (MINOR): Differentiate CREATE vs UPDATE absence semantics in §9.2.
- F-014 (MINOR): Designate a template field location for the per-failure-point boundary declaration.
- F-012 (MINOR): State per-item audit record requirement explicitly for batch operations.

**May carry forward to Development Decomposition:**

- F-011, F-003, F-007, F-008, F-015, F-016, F-017, F-018 (MINORs and NITPICKs)

---

*End of Independent Architecture Review — Doc-4A Content v1.0 Pass 3 (§9–§12). 18 findings: 0 BLOCKER · 5 MAJOR · 9 MINOR · 4 NITPICK.*
