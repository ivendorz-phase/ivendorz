# Independent Architecture Review — Doc-4A Content v1.0, Pass 6 (Final Freeze Candidate)

**Review Board:** Principal Enterprise Architect · Principal API Governance Architect · Principal Security Architect · Principal Multi-Tenant SaaS Architect · Principal AI-Agent Systems Reviewer · Principal Conformance Framework Reviewer  
**Corpus consulted:** Master_System_Architecture_v1.0_FINAL.md; ADR_Compendium_v1.md; Doc-2 v1.0.3; Doc-3 v1.0.2; Doc-4A Passes 1–5 (all FROZEN with patches applied)  
**Review scope:** §22 (Consistency Corrections + CHK-231–236 + AI Readiness Rules); Annexures A–I  
**Posture:** Defect-finding only. No praise. Every ambiguity treated as technical debt for production AI-generated code.

---

## Executive Summary

Pass 6 is the finalization pass for Doc-4A. It resolves the Pass 5 BLOCKER (CHK-231–236 missing), adds five useful consistency corrections (C-01 through C-05), six AI-agent decision rules (R-01 through R-06), and nine implementation-reference Annexures. The intent is sound. The execution contains two new BLOCKERs, five MAJORs, ten MINORs, and four NITPICKs.

The two BLOCKERs are structural contradictions introduced by Pass 6 itself. First: Correction C-05 mandates `reference_id` in every success response but the examples place it in two irreconcilable locations — inside the entity body for command responses and at the response-envelope level for list responses. Template 21.1 is not updated. AI coding agents will produce structurally inconsistent APIs across all ten modules before a single implementation test is run. Second: Rule R-04 introduces a TBD placeholder that literally contains the string "TBD", which fails CHK-012 [BLOCKER] — a frozen conformance check that has no stated exceptions. The exception for R-04 is buried in non-normative Annexure H. The conformance mechanism is internally contradictory on a scenario that will occur in every module that encounters a POLICY key gap.

Neither BLOCKER is a design failure. Both are patchable. The five MAJORs — incomplete protected-fact filter list, undefined filter evaluation semantics, a compound-CRUD authorization verb, the still-unresolved audit scope gap from Pass 5 F-015, and `retry_after` extending the frozen error envelope with no template or CHK coverage — are all patchable without structural change. Pass 6 is close to freeze-ready but must not be frozen with these two BLOCKERs open.

---

## Freeze Recommendation

**APPROVE WITH PATCHES**

Do not freeze until B-01 and B-02 are resolved. All five MAJORs should be resolved in the same patch.

---

## Counts

| Severity | Count |
|---|---|
| BLOCKER | 2 |
| MAJOR | 5 |
| MINOR | 10 |
| NITPICK | 4 |
| **Total** | **21** |

---

## Findings

---

### B-01 | BLOCKER | §22.1 C-05 + Annexure C | `reference_id` Location in Success Responses Is Inconsistent; Template 21.1 Not Updated

**Problem:** C-05 mandates that `reference_id` is present in **every** contract response — success and error. Annexure C's examples show two irreconcilable placements:

- **Example C.1 (command response):** `reference_id` is a field inside the entity representation body, at the same level as `vendor_profile_id`, `display_name`, and `updated_at`.
- **Example C.6 (list response):** `reference_id` is at the response-envelope level, alongside `items` and `page_info`.
- **Example C.7 (async Phase-1 response):** `reference_id` is again inside the entity-like body.
- **Error responses (§12.1, frozen):** `reference_id` is in the error envelope.

These are three different structural positions. No canonical rule specifies where `reference_id` belongs: inside entity representations, at the response envelope level, or only in the error envelope. Template 21.1's Response Contract grammar contains no `reference_id` field. An AI agent filling in the template will not declare `reference_id` in any contract's Response Contract because the template provides no instruction to do so.

**Why it matters:** Every Doc-4B through Doc-4K module contract will implement `reference_id` in a different location depending on which example the authoring agent consulted. Frontend engineers implementing I-FE-02 ("capture the `reference_id` from every response") will need module-specific parsing logic. The inconsistency cannot be corrected by a later development document — it is baked into the contracts at authoring time.

Separately: placing `reference_id` inside entity representations (C.1) contaminates the canonical entity shape. Entity representations are defined once by the Owner Module (§10.1, CHK-095). `reference_id` is not an entity attribute — it is transport/operational metadata. Every entity representation across all modules would permanently carry this field, making it ambiguous whether `reference_id` is an entity field or a response-envelope field.

**Recommended fix:** Add a mandatory `reference_id` field to Template 21.1's Response Contract at the response-envelope level (not inside entity representations). Define the canonical rule: "`reference_id` is always returned at the top-level response envelope alongside the entity payload (for scalar commands) or alongside `items`/`page_info` (for list queries). It is never part of the entity's canonical representation as defined in Doc-2 §3. The error envelope carries it per §12.1." Update all three Annexure C examples to reflect the canonical envelope position. Add CHK item for `reference_id` presence and position.

---

### B-02 | BLOCKER | §22.3 R-04 vs Appendix A CHK-012 [B] | TBD Placeholder Rule Contradicts Frozen BLOCKER Conformance Check Without Amending It

**Problem:** Rule R-04 (§22.3) defines a TBD placeholder for POLICY key gaps:

```
Policy-Key: TBD — <description of required limit> — escalate per §0.6
```

CHK-012 [BLOCKER] (Appendix A, frozen in Pass 5) states: "No field carries 'TBD', 'to be defined', 'implementation-specific', or equivalent."

R-04 explicitly instructs contract authors to write the literal string "TBD" in a contract field. CHK-012 marks this as a BLOCKER failure, which means "MUST NOT be frozen." The exception is stated only in Annexure H H-34 ("exception: POLICY key TBD placeholder per Rule R-04") — non-normative implementation reference material. Appendix A's CHK-012 has no corresponding exception.

The conformance mechanism (Appendix A) and the authoring guidance (§22.3 R-04 + Annexure H H-34) directly contradict each other for a scenario that will occur routinely: every Doc-4 module contract where a POLICY key has not yet been defined in Doc-3 §12.2. An AI agent or human reviewer running the Appendix A checklist against a contract using the R-04 TBD placeholder will:

1. Reach CHK-012 [B].
2. Find "TBD" in a contract field.
3. Mark the contract as non-conforming / cannot freeze.

This is the correct outcome per CHK-012. But it defeats the entire purpose of R-04. The document cannot simultaneously say "use TBD for POLICY key gaps" (R-04) and "TBD is always a BLOCKER failure" (CHK-012) without one of them being wrong.

**Why it matters:** The conformance checklist is the primary quality gate for Doc-4B–4K contracts. An internally contradictory conformance mechanism undermines the entire governance layer. Development teams will either ignore CHK-012 selectively (defeating the check) or refuse to use R-04 (leaving POLICY key gaps undeclared and invisible).

**Recommended fix:** Amend CHK-012 in Appendix A to: "No field carries 'TBD', 'to be defined', 'implementation-specific', or equivalent — **exception: the POLICY key TBD placeholder defined in §22.1 R-04 is permitted in Rate-Limit `Policy-Key` fields only, and is a [M] (MAJOR) finding rather than [B] (BLOCKER), requiring escalation before freeze.**" Move the exception from Annexure H H-34 into the normative Appendix A check. The severity of a TBD POLICY key should be [M] (must resolve or escalate before freeze) rather than [B] (hard block) because the TBD placeholder is explicitly designed to permit incremental contract authoring.

---

### M-01 | MAJOR | Annexure B.3 | `retry_after` Extends the Frozen Error Envelope Without a §12 Patch, Template Update, or CHK Item

**Problem:** Annexure B.3 extends the canonical error envelope for `RATE_LIMITED` responses with a `retry_after: integer` field (seconds until window reset). The canonical error envelope is defined in §12.1 (Pass 3, FROZEN) and re-stated in Annexure B.2 with six fields. `retry_after` becomes a mandatory seventh field for RATE_LIMITED — but:

1. §12.1 (frozen) is not patched. B.3 modifies frozen content without the §3.5 patch mechanism.
2. Template 21.1's Error Behavior section has no `retry_after` field.
3. Template 21.1's Rate Limits section declares `Reset-Interval: core.system_configuration.<reset_key>` but provides no rule for how that POLICY key translates to a runtime `retry_after` seconds value.
4. No CHK item requires `retry_after` presence or validates its value. Appendix A CHK-125 through CHK-132 cover the six-field error envelope — none covers the seventh field.

An AI coding agent implementing RATE_LIMITED errors will produce the six-field canonical envelope (per the template and §12.1) with no `retry_after`. The client implementing I-FE-03 ("RATE_LIMITED respects `retry_after`") will look for a field that is never emitted.

**Why it matters:** RATE_LIMITED errors without `retry_after` are useless to clients — they know to retry but not when. This is the primary operational value of the field. Its absence produces unnecessary thundering-herd retries with no backoff coordination.

**Recommended fix:** Issue a §12.1 patch (citing §22.1 as the authority) formally adding `retry_after` to the RATE_LIMITED error envelope variant. Computation rule: "sourced from `core.system_configuration.<reset_key>` declared in the contract's Rate Limits block — the runtime value is the remaining seconds in the current window at the time of the error response." Add `retry_after` to Template 21.1's Rate Limits block annotation for throughput-type limits. Add CHK item: "RATE_LIMITED responses include `retry_after: integer` computed from the contract's declared `Reset-Interval` POLICY key" [B].

---

### M-02 | MAJOR | Annexure A.2 | `manage` Verb Defined as "Full CRUD" Creates Compound Authorization Semantics Without Doc-2 §7 Scope Alignment

**Problem:** Annexure A.2 defines the `manage` verb as: "Full CRUD administration of a sub-resource." Example: `can_manage_team_members`. This means a single slug grants create + read + update + delete on the sub-resource.

Annexure A.5 simultaneously states: "OR-based slug logic is not expressible at the slug level." The `manage` verb is exactly OR-based slug semantics — one slug grants the same access as `can_create_team_member OR can_view_team_member OR can_edit_team_member OR can_delete_team_member`. The document prohibits OR-based slug logic in A.5 and then defines a verb that implements it in A.2.

The compound semantics mean that once `can_manage_<entity>` is registered in Doc-2 §7, the authorization check for that slug is ambiguous: does it mean "can perform management operations (unspecified subset)" or "can perform ALL CRUD operations"? Doc-2 §7 defines the slug scope — but Annexure A.2 pre-claims the scope as "Full CRUD," potentially conflicting with whatever Doc-2 §7 actually registers for specific `can_manage_*` slugs.

**Why it matters:** AI agents authoring authorization checks will interpret `can_manage_<entity>` as full CRUD by definition. If Doc-2 §7's `can_manage_team_members` slug was registered with a narrower scope (e.g., "can add and remove members, but not create the team"), the Annexure A.2 claim will produce over-privileged authorization implementations across all modules using `can_manage_*` slugs.

**Recommended fix:** Change the `manage` verb description to: "Scope is defined by the specific slug's Doc-2 §7 registration. Annexure A does not pre-define the scope of `manage` slugs — contract authors MUST check Doc-2 §7 for the exact operations a `can_manage_<entity>` slug permits." Add a note to A.5: "`can_manage_*` slugs appear to grant compound access. Their actual scope is defined by Doc-2 §7 registration only — do not assume Full CRUD from the verb name alone."

---

### M-03 | MAJOR | Annexure D.2 | Protected-Fact Filter Prohibition List Is Incomplete Relative to §7.5

**Problem:** Annexure D.2 states: "Protected fact fields (blacklist flags, routing scores, Buyer Vendor Status) MUST NOT appear in the allowlist." This list has three items. §7.5 (Pass 2, frozen) defines protected facts as: blacklist status, routing exclusion state, Buyer Vendor Status, **private CRM data** (buyer-org-scoped vendor records), and **grant state** (whether a delegation grant exists between specific parties). Additionally, the five governance signals firewalled by §4B.2 — Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer Vendor Status — are protected from filter exposure.

The Annexure omits:
- Private CRM data (buyer-org-scoped vendor records)
- Grant state
- Trust Score (governance signal)
- Performance Score (governance signal)
- Financial Tier (governance signal)

An AI agent authoring a Marketplace query contract (Doc-4D) will use Annexure D.2's three-item list to check its filter allowlist. Private CRM fields and grant state fields will pass this check and be included as filterable dimensions, violating §7.5 and CHK-061.

**Why it matters:** Filter allowlists that include private CRM data or grant state expose cross-tenant information — a buyer could filter by a field that reveals whether vendor X is in their private CRM, confirming information that should be non-disclosed. This is a direct multi-tenant RLS violation.

**Recommended fix:** Replace D.2's prohibited field list with the full §7.5 reference: "Protected fact fields defined in §7.5 MUST NOT appear as filter dimensions. This includes: blacklist status, routing exclusion state, Buyer Vendor Status, private CRM data, grant state, and the five governance signals (Trust Score, Performance Score, Financial Tier, Capacity Profile — see §4B.2). If uncertain whether a field is a protected fact: treat it as protected and exclude it from the allowlist. The full protected-fact scope is defined in §7.5 — this list is illustrative only."

---

### M-04 | MAJOR | Annexure D.2 | Filter Evaluation Semantics (AND/OR) Introduced Without Normative §9.6 Update or Template Mechanism

**Problem:** Annexure D.2 introduces: "Filter values for enum fields accept a list (OR semantics within the field; AND semantics across fields)." This is new normative behavior — it defines how filter fields are evaluated at runtime. §9.6 (Pass 3, frozen) defines the filter grammar (allowlist, fields, cursor interaction) but contains no evaluation semantics rule. The AND/OR semantics are implementation-critical: without knowing whether multi-field filters are AND or OR, implementing a query contract is impossible.

The problem is threefold:
1. Runtime filter semantics belong in §9.6 (normative), not in an Annexure (reference material). The Annexure can illustrate; the section must specify.
2. There is no mechanism for a contract to declare non-default filter semantics. If a contract needs OR-across-fields semantics (e.g., "match RFQs where status is published OR buyer is X"), there is no template field or grammar to express it. All filters are locked to AND-across-fields with no override path.
3. No CHK item verifies that implementations match the declared semantics.

**Why it matters:** Multiple module teams will implement filters without consulting Annexure D. Each will make an independent decision about AND vs OR semantics. Cross-module filter behavior will be inconsistent. A buyer searching for RFQs across two filter dimensions will get different result counts depending on which module serves the query.

**Recommended fix:** Add a §22.1 correction (or §9.6 amendment): "Filter fields within a single request are combined with AND semantics (all filter conditions must be satisfied). Filter values within a single filter field that accepts a list are combined with OR semantics (any value match satisfies that field's condition). Example: `filter: {status: ['published', 'evaluating'], category_id: 'X'}` returns entities that match (status=published OR status=evaluating) AND (category_id=X). Non-default filter composition is not expressible in contracts; escalate if required." Add a corresponding CHK item.

---

### M-05 | MAJOR | Annexure E.5 | Pass 5 F-015 Still Unresolved — Operational Entity Field Writes Remain Unclarified

**Problem:** Pass 5 F-015 (MAJOR, independent review): CHK-186 [B] requires `Audit-Required: yes` in all mutating contracts, and CHK-188 [B] requires Mutation-Scope to list every entity type modified. Together, these apply full Doc-2 §9 business audit to every entity write — including operational writes like `last_accessed_at`, view counters, and derived telemetry fields.

Annexure E.5 (Pass 6) adds: "Business audit records and operational telemetry are distinct (§17.1). An `Audit-Required: yes` declaration governs business audit only. Operational telemetry (latency, error rates, trace spans) is not a substitute for business audit and is not declared in contracts."

This addresses the audit-vs-telemetry distinction (observability data) but NOT the gap: what about a contract whose only write side effect is an operational entity field update — updating `last_accessed_at` on a Vendor Profile, or incrementing a `view_count` on an RFQ? These are entity mutations (not telemetry). CHK-186/188 require full Doc-2 §9 audit for them. But Doc-2 §9's scope covers business-critical actions, not operational field bookkeeping. The conflict remains unresolved.

No CHK-195 or CHK-196 were added (as recommended by Pass 5 review F-015). Template 21.1's Audit Requirements section was not amended. Contracts that update only operational entity fields have no pattern to follow.

**Why it matters:** AI agents implementing view-tracking, access-logging, or analytics-field-update contracts will be unable to correctly declare audit requirements. They will either (a) declare `Audit-Required: yes` with a `last_accessed_at` Mutation-Scope (producing millions of spurious audit records), or (b) declare `Audit-Required: no` (failing CHK-186 [B]).

**Recommended fix:** Amend §17.1 (via §22.1 correction): "Operational entity field writes — field updates that are not Doc-2 §9 business actions (e.g., `last_accessed_at`, `view_count`, derived analytics fields) — do not trigger the §17.2 audit declaration obligation. The contract MUST identify which writes are business-critical (Doc-2 §9 actions) and which are operational. If all writes in a contract are operational, declare `Audit-Required: no` with the annotation `operational writes only — no Doc-2 §9 action triggered`." Add CHK-195 and CHK-196 as specified in the Pass 5 independent review.

---

### Min-01 | MINOR | Annexure C.3 | Section Title "Business Rule Violation" Contradicts `error_class: "STATE"` in the Example Body

**Problem:** Annexure C.3 is titled "Business Rule Violation" but the example shows `"error_class": "STATE"`. STATE (Category 6) and BUSINESS (Category 8) are distinct error classes with different recovery guidance and different §11.2 validation categories. The title directly contradicts the content. An AI agent using C.3 as a reference for BUSINESS errors will produce STATE-classed responses; one using it as a reference for STATE errors will find the title wrong.

**Recommended fix:** Retitle C.3 as "State Pre-Condition Failure." Add a separate example for BUSINESS errors (e.g., a quote submitted after the single-quotation-per-vendor FIXED rule fires).

---

### Min-02 | MINOR | Annexure E.1 | "Platform Ops" Exception for System Actor `organization_id` Is Undefined

**Problem:** E.1 marks `organization_id` as: "yes (except System actor for platform ops)." "Platform ops" is used here without definition. No prior pass defines the scope of "platform ops" or provides criteria to distinguish a platform-level System actor action from a module-level System actor action. System actor operations include Phase-2 async workers (always module-scoped, should always have `organization_id` from the triggering event) and platform-wide operations (stage transitions, configuration deployments — may not have an `organization_id`).

**Recommended fix:** Define "platform ops" explicitly: "System actor operations initiated by platform-wide configuration events (e.g., operating stage transitions, global quota resets) rather than by a tenant-initiated command. A System actor contract whose triggering event carries an `organization_id` MUST include it in the audit record; one triggered by platform-level events (no tenant context in the triggering event) is exempt."

---

### Min-03 | MINOR | Annexure D.4 | Cursor Reuse Behavior Is Declared "Undefined"

**Problem:** D.4 states: "Cursors are single-use... Platform behavior for reused cursors is undefined." "Undefined behavior" in an implementation guide for production AI-generated systems is unacceptable. Each module implementation will independently decide whether to return a VALIDATION error, return stale/fresh data, or treat the reused cursor as valid. The resulting inconsistency cannot be tested (QA I-QA checklist has no cursor-reuse test).

**Recommended fix:** Define cursor reuse behavior: "A reused cursor (same cursor value submitted twice) MUST return a `VALIDATION` error with `error_code: <module_prefix>_cursor_already_consumed`. The cursor MAY carry an expiry (per `core.system_configuration.<cursor_ttl_key>`) after which it is treated as expired and also returns VALIDATION with `<module_prefix>_cursor_expired`. Add to I-QA: 'Cursor reuse within validity window returns VALIDATION.'"

---

### Min-04 | MINOR | Annexure D.5 | "Filter MUST Be Repeated on Subsequent Requests" Is a Normative Pagination Rule Hidden in an Annexure Footnote

**Problem:** Annexure D.5's example footnote states: "The filter object MUST be repeated on subsequent requests. The cursor does not carry forward the filter." This is a critical, implementation-affecting rule that determines query result consistency across pages. If a client omits the filter on page 2, they receive a different result set — a data consistency failure. This rule belongs in §9.6 (frozen, normative) or as a §22.1 correction. As an Annexure footnote, it has no CHK enforcement and will be missed by AI agents who do not read example footnotes.

**Recommended fix:** Add to §22.1 as Correction C-06: "Filter consistency across pages: cursor-based pagination does not carry filter context. Callers MUST repeat the identical filter object on every paginated request. A paginated response without a filter is not equivalent to the same filter across all pages."

---

### Min-05 | MINOR | Annexure D.3 | "Default 2 Sort Fields" Is a Hardcoded Limit

**Problem:** D.3 states: "Maximum number of sort fields: declared by the contract; default is 2 (primary field + tiebreaker)." §18.2 (frozen) forbids hardcoded limit values; all limits must reference `core.system_configuration.<key>`. "Default is 2" is a hardcoded numeric limit. It is not FIXED (it could reasonably be changed per environment) and no POLICY key is cited.

**Recommended fix:** Replace with: "Maximum number of sort fields: bounded by `core.system_configuration.platform.max_sort_fields` (or a module-specific override key). Contract authors declare the applicable POLICY key in the sort allowlist specification. If no key exists in Doc-3 §12.2: escalate per §0.6."

---

### Min-06 | MINOR | §22.3 R-01 Step 2 vs Template 21.3 | Template Selection Rule Contradicts Template's Own Override Annotation

**Problem:** R-01 step 2: "Does the contract only read data **with no write side effect**? → Template 21.3 (Query)." Template 21.3 itself contains the annotation: "Override to yes with full §17.2 grammar if the query has a write side effect (§17.1)." Template 21.3 explicitly accommodates write-side-effect queries. R-01 explicitly excludes them from Template 21.3.

An AI agent following R-01 encounters a read-with-side-effect contract (e.g., a query that records a `last_accessed_at` write): step 2 says "not Template 21.3" (has write side effect); steps 1/3/4/5 don't fit; step 6 (Template 21.1 base) is selected. But Template 21.1 as the base doesn't have Template 21.3's query-specific pre-declarations (State-Machine-Effects: none MANDATORY; Idempotency: not-applicable MANDATORY).

**Recommended fix:** Amend R-01 step 2: "Does the contract read data? → Template 21.3 (Query). If the query has a write side effect (e.g., access tracking), declare `Audit-Required: yes` per the Template 21.3 override annotation. Write-side-effect queries still use Template 21.3, not Template 21.4 (Command)."

---

### Min-07 | MINOR | Annexure E.1 | `pre_state` / `post_state` Not Captured for Field-Only Update Commands

**Problem:** E.1 requires `pre_state` and `post_state` only "when State Machine Effects declared." Field-only update commands (e.g., editing a vendor profile's contact details while status remains `active`) declare `State-Machine-Effects: none` and therefore omit pre/post state. An audit record for a field update on a stateful entity contains no information about which lifecycle state the entity was in when the update occurred. A compliance reviewer auditing field changes to a vendor profile cannot determine whether the change was made while the profile was `active`, `suspended`, or `under_review`.

**Recommended fix:** Add to E.1: "For field-only update commands (State Machine Effects: none) on entities with lifecycle states: `entity_state` (current state at time of operation) is RECOMMENDED in the audit record. It is not required by CHK-188 but provides audit context that cannot be reconstructed from later records if the state subsequently changes."

---

### Min-08 | MINOR | Annexure F.5 | Timestamps Listed as Unconditionally Valid Event Payload Fields

**Problem:** F.5 lists "Timestamps" as a category of always-valid event payload fields. Certain timestamps carry governance-signal-equivalent sensitivity. For example: `verified_at` on a `vendor_profile.verified` event reveals the exact time of trust verification — implicit information about the trust workflow that consumers downstream of Module 5 (Trust & Verification) are not entitled to. `suspended_at` reveals suspension timing that may be protected. The thin-payload rule's Privacy-Review requirement (CHK-173) should catch this, but F.5's unconditional inclusion of timestamps may cause AI agents to treat timestamp fields as exempt from §7.5 review.

**Recommended fix:** Qualify the timestamps entry: "Timestamps that record the occurrence of the event itself (e.g., `submitted_at`, `created_at`) are generally safe payload fields. Timestamps that record a separate upstream fact (e.g., `verified_at`, `suspended_at`, `last_trust_review_at`) require §7.5 privacy review — they may carry implicit governance signal information. Apply the `Privacy-Review: §7.5 compliant` declaration only after reviewing each timestamp field against the protected-fact list."

---

### Min-09 | MINOR | Annexure G.2 | Idempotency Key Format Recommendation Unsuitable for Platform-Scoped Keys and Ambiguous for Delegation

**Problem:** G.2 recommends: `<operation_name>/<organization_id>/<caller_generated_uuid>`. This format embeds `organization_id` — appropriate for Key-Scope: organization contracts but incorrect for Key-Scope: platform contracts (Phase-2 System actors, platform-level operations). Platform-scoped keys should not embed an organization identifier since they are platform-level, not tenant-level.

Additionally, for delegation-eligible contracts: which `organization_id` should be embedded — the representative's (acting) organization or the controlling organization (quota owner)? §6B.3 says quota is attributed to the controlling organization. If the representative's `organization_id` is in the key, the key scope does not match the quota scope.

**Recommended fix:** Provide two format recommendations: "For Key-Scope: organization: `<operation_name>/<controlling_org_id>/<caller_uuid>` (use controlling organization for delegated operations, active organization otherwise). For Key-Scope: platform: `<operation_name>/platform/<caller_uuid>` (no organization embedding)."

---

### Min-10 | MINOR | Annexure F.4 vs §16.7 (Frozen) | Consumer Tolerance Stated as Automatic; §16.7 Requires Declaration

**Problem:** F.4 states: "Adding a new optional payload field is additive — no version bump required (consumers tolerate unknown fields)." §16.7 (Pass 4, frozen) requires that consumers explicitly DECLARE tolerance for unknown fields in their Events Consumed contract. Tolerance is not automatic — it is a declared contract obligation. If a consumer's Events Consumed declaration does not declare tolerance, adding a new optional field IS breaking for that consumer, regardless of F.4's general claim.

F.4's phrasing as a universal rule will lead AI agents to add payload fields without checking whether consuming contracts declare tolerance — producing silent breaking changes for non-declaring consumers.

**Recommended fix:** Amend F.4: "Adding a new optional payload field is additive for consumers that have declared tolerance in their Events Consumed block per §16.7. For consumers that do not declare tolerance, the addition is a breaking change requiring the normal breaking-change process (§20.2). Producers MUST verify all known consumers have declared tolerance before treating a new optional field as additive."

---

### N-01 | NITPICK | Annexure I I-AI-12 | Incorrect Cross-Reference for Escalation Rule

**Problem:** I-AI-12 instructs AI agents to: "halt, record the ambiguity with a specific citation, and escalate (Rule R-03 in §22.3)." Rule R-03 in §22.3 is the protected-fact failure path implementation rule ("When implementing the Error Boundary..."). The escalation procedure is defined in §22.1 C-03 (flag-and-halt normalization). The cross-reference is wrong.

**Recommended fix:** Change "(Rule R-03 in §22.3)" to "(§22.1 C-03 escalation procedure)."

---

### N-02 | NITPICK | Annexure B.1 | HTTP Status Code Table Maps Three Unrelated Error Classes to 429

**Problem:** The non-normative HTTP status table maps QUOTA and RATE_LIMITED both to HTTP 429. Additionally, STATE and CONFLICT both map to 409. For REST implementors reading the non-normative guidance, the distinguishing signal (the `retryable` field and `retry_after` for RATE_LIMITED) is not visible from the HTTP status alone. The table could note the distinguishing mechanism.

**Recommended fix:** Add a column or footnote to B.1: "Where two error classes share an HTTP status, clients distinguish them via `error_class` and `retryable`: QUOTA (retryable: false) vs RATE_LIMITED (retryable: true) both at 429; STATE (retryable: false) vs CONFLICT (retryable: true) both at 409."

---

### N-03 | NITPICK | Annexure C.6 | `total_count: null` Should Be Absent, Not Null

**Problem:** Example C.6 shows `"total_count": null` with the explanation that it is null when totals are not declared. §22.1 C-02 establishes that `absent` and `null` are not equivalent (specifically for `field_errors`). The same principle applies to `total_count`: a `null` present value signals "the server knows a count exists but chose not to return it." An absent field signals "totals are not applicable to this contract." For non-disclosure purposes, including a null `total_count` could imply to a sophisticated client that a countable set exists — leaking information.

**Recommended fix:** Remove `total_count` from the example when it is not declared. The canonical list response for a contract without totals should be: `{"items": [...], "page_info": {"has_more": true, "next_cursor": "..."}}` — no `total_count` key at all.

---

### N-04 | NITPICK | Annexure B.2 | `field_errors.field` Dot-Path Notation Grammar Not Specified

**Problem:** C-02 normalizes `field` as "dot-path to the failing field." Examples in B.2 and C.2 show `"items.0.quantity"` (integer array indexing). The canonical grammar for dot-paths is not defined: is array indexing zero-based? Is it `items.0.quantity` or `items[0].quantity`? How are nested objects inside arrays expressed? Without a canonical grammar, different module implementations will produce different field path formats, and frontends handling `field_errors` will need module-specific parsing logic.

**Recommended fix:** Define the dot-path grammar: "Dot-path notation uses period-separated property names. Array elements are referenced by zero-based integer index as a path segment: `items.0.quantity` (not `items[0].quantity`). Nested object fields continue the path: `address.city`. No spaces, no bracket notation, no negative indices."

---

## Mandatory Patch List

### BLOCKER Patches (must resolve before freeze)

**Patch P6-B01 — `reference_id` Response Envelope Standard**
- Define canonical `reference_id` location: response-envelope level (not inside entity body) for all response types (command, list, async).
- Add `reference_id : uuid : always : platform-assigned UUIDv7 per §22.1 C-05` to Template 21.1 Response Contract grammar as a mandatory envelope field.
- Update Annexure C.1, C.7 to show `reference_id` at envelope level, NOT inside entity representation.
- Add CHK item: "`reference_id` present at response envelope level in all contract responses (success and error)" [B].

**Patch P6-B02 — CHK-012 Exception for R-04 TBD Placeholder**
- Amend Appendix A CHK-012 to: severity [M] (not [B]) when the only TBD occurrence is a `Policy-Key: TBD — ...` placeholder per §22.1 R-04. All other TBD occurrences remain [B].
- OR: change R-04's placeholder to use a non-TBD marker (e.g., `Policy-Key: ESCALATE:<description>`) that does not trigger CHK-012.
- Remove the exception from Annexure H H-34 and move it to Appendix A's CHK-012 entry.

---

### MAJOR Patches (resolve before freeze; deferral requires Architecture Board escalation)

**Patch P6-M01 — `retry_after` Envelope Formalization**
- Issue §12.1 patch (or §22.1 C-06 correction) formally adding `retry_after: integer (seconds)` to the RATE_LIMITED error envelope variant.
- Define computation rule: remaining seconds in the current window computed from `core.system_configuration.<reset_key>`.
- Add `retry_after` to Template 21.1's Rate Limits section annotation for throughput-type limits.
- Add CHK item for `retry_after` presence [B].

**Patch P6-M02 — `manage` Verb Scope Clarification**
- Remove "Full CRUD administration" from Annexure A.2's `manage` verb description.
- Replace with: "Scope defined by Doc-2 §7 registration; verify slug scope before use."
- Add warning note to A.5 that `can_manage_*` slugs appear compound but scope is corpus-defined only.

**Patch P6-M03 — D.2 Protected-Fact Filter List Completion**
- Replace three-item list with full §7.5 reference as described in M-03 recommended fix.
- Explicitly name all seven protected-fact categories.

**Patch P6-M04 — Filter Evaluation Semantics Normalization**
- Add §22.1 correction defining AND-across-fields / OR-within-field filter semantics as normative.
- Add CHK item verifying filter semantics are implemented per this standard.

**Patch P6-M05 — Pass 5 F-015 Resolution**
- Amend §17.1 via §22.1 correction to distinguish business-critical writes from operational entity field writes.
- Add CHK-195 and CHK-196 as specified in the Pass 5 independent architecture review.
- Add step to Annexure H Phase 5 checklist.

---

*End of Doc-4A Pass 6 Independent Architecture Review. Recommendation: APPROVE WITH PATCHES. Resolve B-01 and B-02 before freeze. All five MAJOR patches are editorial corrections requiring no structural redesign and can be completed in a single P6-Patch-v1.0.1 document.*
