# Doc-4A — Pass 6 Patch v1.0.1

| Field | Value |
|---|---|
| Patch ID | Doc-4A-Pass6-Patch-v1.0.1 |
| Applies To | Doc-4A_Content_v1.0_Pass6.md |
| Base | Doc-4A Content v1.0 Pass 6 (Freeze Candidate) |
| Authority | Independent Architecture Review of Pass 6; Doc-4_Governance_Note_v1.0.md |
| Patches Applied | P6-B01, P6-B02, P6-M01, P6-M02, P6-M03, P6-M04, P6-Min03, P6-Min04, P6-Min06, P6-Min10 |
| Patch Type | Defect resolution only — no new architecture, no redesign |
| Status | **DOC-4A FINAL FREEZE CANDIDATE** |

---

## §1 — Patch Summary

| Patch ID | Severity | Section(s) | Description |
|---|---|---|---|
| P6-B01 | BLOCKER | §22.1 C-05 | Add explicit Response Contract mandate for `reference_id` — correction C-05 normalizes the field but does not bind it to template declarations |
| P6-B02 | BLOCKER | §22.3 Rule R-04; Annexure H H-25, H-34 | Remove `TBD` placeholder syntax that contradicts CHK-012; replace with BLOCKER self-review approach |
| P6-M01 | MAJOR | Annexure B §B.1, §B.3; Annexure I I-FE-03 | Downgrade `retry_after` from mandatory envelope field to implementation-defined transport hint; remove ungrounded corpus claim |
| P6-M02 | MAJOR | Annexure A §A.2 | Narrow `manage` verb definition — "Full CRUD" scope is unbounded; replace with scoped definition requiring explicit declaration |
| P6-M03 | MAJOR | Annexure D §D.2 | Complete the protected-fact filter exclusion list — three items listed; §7.5 defines five categories |
| P6-M04 | MAJOR | Annexure D §D.2 | Replace implementation-prescribing filter semantics ("OR within / AND across") with implementation-neutral language |
| P6-Min03 | MINOR | Annexure D §D.4 | Replace "undefined" cursor-reuse behavior with "implementation-defined" and a conforming MUST |
| P6-Min04 | MINOR | Annexure D §D.5 | Expand filter repetition rule to cover the filter-change case |
| P6-Min06 | MINOR | §22.3 Rule R-01 | Clarify template selection for Phase-2 async commands — one contract, not two |
| P6-Min10 | MINOR | Annexure F §F.4 | Promote consumer unknown-field tolerance from implied fact to normative requirement |

---

## §2 — Patches

---

### P6-B01

**Patch-ID:** P6-B01

**Affected Section(s):** `§22.1 Correction C-05`

**Problem Summary:** Correction C-05 normalizes `reference_id` as present in every contract response — success and error. It does not bind this requirement to Template 21.1's Response Contract block. Contract authors following the template will not include `reference_id` in their Response Contract declarations unless the mandate is explicit at the template level. The gap creates contracts that satisfy C-05's intent in prose but fail to declare `reference_id` as a response field.

**Patch Content:**

Replace the existing C-05 text:

> The `reference_id` field appears in both the error envelope (§12.1) and audit requirements (§17.2). Normalized: `reference_id` is a platform-assigned UUID (UUIDv7) present in **every** contract response — success and error — generated at request acceptance. It is the primary linkage between the API response, the audit record, and the idempotency key. Contracts MUST NOT use a caller-supplied value as the `reference_id`.

With:

> The `reference_id` field appears in both the error envelope (§12.1) and audit requirements (§17.2). Normalized: `reference_id` is a platform-assigned UUID (UUIDv7) present in **every** contract response — success and error — generated at request acceptance. It is the primary linkage between the API response, the audit record, and the idempotency key. Contracts MUST NOT use a caller-supplied value as the `reference_id`.
>
> **Response Contract mandate:** Every contract's Response Contract block (Template 21.1 §Response Contract) MUST include the following line as a mandatory field, regardless of actor type, operation type, or response shape:
>
> ```
> reference_id : uuid : always : platform-assigned UUIDv7; generated at request acceptance; links response to audit record and idempotency key
> ```
>
> This line is binding on all contracts authored against Templates 21.1 through 21.6. Its absence from a contract's Response Contract is a conformance failure (CHK-095 analogue — one Owner Module representation must include it).

**Rationale:** Without a template-level declaration, `reference_id` remains a prose normalization that AI coding agents and contract authors may not apply. Binding it to the Response Contract grammar ensures it appears in every generated contract surface and every generated API response object.

**Implementation Impact:** All Doc-4B–4N contracts must include `reference_id : uuid : always : ...` in their Response Contract blocks. Contracts already authored without it require an additive amendment (no version bump — additive per §20.2).

---

### P6-B02

**Patch-ID:** P6-B02

**Affected Section(s):** `§22.3 Rule R-04`; `Annexure H H-25`; `Annexure H H-34`

**Problem Summary:** Rule R-04 introduces the placeholder syntax `Policy-Key: TBD — <description> — escalate per §0.6`. CHK-012 (Appendix A, Pass 5) prohibits any field containing "TBD", "to be defined", or equivalent. Rule R-04 and CHK-012 are directly contradictory. Annexure H H-34 acknowledges this with a stated exception to CHK-012, which is itself nonconforming — CHK-012 is a BLOCKER check with no defined exception mechanism.

**Patch Content:**

Replace the existing Rule R-04 text:

> **Rule R-04 — POLICY key gap handling**
>
> If a contract requires a limit value but no `core.system_configuration.<key>` exists for it in Doc-3 §12.2: do not invent the key; do not hardcode the value; declare the limit using a `<TBD-policy-key>` placeholder and flag-and-halt. The placeholder syntax is:
>
> ```
> Policy-Key: TBD — <description of required limit> — escalate per §0.6
> ```
>
> This placeholder makes the gap visible to reviewers without blocking the rest of the contract from being drafted.

With:

> **Rule R-04 — POLICY key gap handling**
>
> If a contract requires a limit value but no `core.system_configuration.<key>` exists for it in Doc-3 §12.2: do not invent the key; do not hardcode the value. Apply the following procedure:
>
> 1. **Omit** the Rate-Limit block for the affected V\<n\> rule entirely.
> 2. **Add a BLOCKER self-review finding** in the contract's self-review section with the text: `POLICY key required for V<n> <description of limit> — key absent from Doc-3 §12.2 — escalate per §0.6 before freeze`.
> 3. **Apply flag-and-halt** (§0.6): halt authoring of dependent sections; do not submit the contract for freeze until the Doc-3 §12.2 patch establishing the key is approved and the Rate-Limit block is completed.
>
> A contract with an unresolved BLOCKER self-review finding MUST NOT be frozen (CHK-037 through CHK-039 analogously apply; the BLOCKER is visible to freeze reviewers). This procedure is CHK-012 compliant: no field in the contract document carries a prohibited term.

Replace Annexure H H-25:

> - [ ] **H-25** Every POLICY key referenced exists in Doc-3 §12.2. If it does not: use the TBD placeholder (Rule R-04 in §22.3) and escalate.

With:

> - [ ] **H-25** Every POLICY key referenced exists in Doc-3 §12.2. If any key is absent: omit the Rate-Limit block, add a BLOCKER self-review finding, and escalate per Rule R-04 in §22.3. Do not use any placeholder value in the Policy-Key field.

Replace Annexure H H-34:

> - [ ] **H-34** No field contains "TBD", "to be defined", "implementation-specific", or equivalent (exception: POLICY key TBD placeholder per Rule R-04).

With:

> - [ ] **H-34** No field contains "TBD", "to be defined", "implementation-specific", or equivalent. No exceptions. Missing POLICY keys are handled by omission and a BLOCKER self-review finding per Rule R-04 — not by a TBD placeholder.

**Rationale:** CHK-012 is a BLOCKER check; it admits no exceptions. The TBD placeholder approach was well-intentioned but nonconforming. The replacement procedure achieves the same goal — making gaps visible and blocking freeze — using only conforming mechanisms (omission + self-review BLOCKER).

**Implementation Impact:** AI coding agents must not generate `TBD` values in any contract field. For missing POLICY keys, agents must generate a BLOCKER self-review entry. No change to any frozen contract content.

---

### P6-M01

**Patch-ID:** P6-M01

**Affected Section(s):** `Annexure B §B.1` (RATE_LIMITED row); `Annexure B §B.3`; `Annexure I I-FE-03`

**Problem Summary:** Annexure B §B.3 introduces `retry_after` as a mandatory field in the `RATE_LIMITED` error envelope. This field has no basis in the canonical error envelope defined in §12.1 (Pass 3, FROZEN). Mandating an envelope extension in Pass 6 reference material without a Pass 3 patch creates a contract conformance conflict: contracts authored from §12.1 do not declare `retry_after`, yet §B.3 says it MUST be present. The canonical reset window is already declared via the Rate-Limit block's `Reset-Interval: core.system_configuration.<reset_key>` — `retry_after` at runtime is an implementation concern, not a contract concern.

**Patch Content:**

In `Annexure B §B.1` (RATE_LIMITED row), replace the Client recovery column value:

> Retry after `retry_after` (see §B.3)

With:

> Retry after the declared reset interval per the contract's `Reset-Interval` POLICY key

Replace the entire §B.3 section:

**Before:**

> ### B.3 RATE_LIMITED Retry Guidance
>
> `RATE_LIMITED` responses MUST include a `retry_after` value at the envelope level (in addition to the standard fields). This is an extension to the canonical envelope specific to `RATE_LIMITED` only:
>
> ```
> {
>   error_class:  "RATE_LIMITED"
>   error_code:   "<module_prefix>_rate_window_exceeded"
>   message:      "<human-readable>"
>   retryable:    true
>   retry_after:  integer   -- seconds until the rate window resets; sourced from
>                           -- core.system_configuration.<reset_key> at runtime
>   reference_id: uuid
> }
> ```

**After:**

> ### B.3 RATE_LIMITED Retry Guidance
>
> The canonical error envelope (§12.1) is sufficient for `RATE_LIMITED` responses. The `Reset-Interval` POLICY key declared in the contract's Rate-Limit block defines the authoritative reset window. Runtime derivation of a `retry_after` duration from `core.system_configuration.<reset_key>` is an implementation concern declared in development documents.
>
> ```
> {
>   error_class:  "RATE_LIMITED"
>   error_code:   "<module_prefix>_rate_window_exceeded"
>   message:      "<human-readable>"
>   retryable:    true
>   reference_id: uuid
> }
> ```
>
> A transport-level hint carrying the actual seconds-to-reset value (e.g., a `Retry-After` header in REST implementations) MAY be provided by development documents as a non-normative implementation convenience. Its presence or absence does not affect contract conformance.

In `Annexure I I-FE-03`, replace:

> RATE_LIMITED respects `retry_after`

With:

> RATE_LIMITED waits for the reset interval declared in the contract's Rate-Limit block before retrying (the transport layer MAY provide a runtime hint per development documents)

**Rationale:** The canonical error envelope is frozen in Pass 3. Adding a mandatory field to it via a Pass 6 reference annex is a scope violation. The reset window is already machine-readable via the POLICY key in the contract; runtime clients with the contract spec do not need a separate `retry_after` field.

**Implementation Impact:** No contract conformance changes. Development documents may still implement a `retry_after` transport hint; they are not prohibited from doing so. Client implementations that already use the POLICY key reset interval are unaffected.

---

### P6-M02

**Patch-ID:** P6-M02

**Affected Section(s):** `Annexure A §A.2` (manage row)

**Problem Summary:** The `manage` verb is defined as "Full CRUD administration of a sub-resource." "Full CRUD" implies unlimited create, read, update, and delete operations without bound. This is too broad: (1) it suggests a single slug grants blanket write access, (2) "full" does not identify which specific operations are permitted, and (3) different contracts using the same `can_manage_*` slug may apply it to different operation sets without a declaration requirement. The ambiguity creates slug overloading and authorization surface confusion for AI agents authoring contracts.

**Patch Content:**

In `Annexure A §A.2` verb table, replace the `manage` row:

| `manage` | Full CRUD administration of a sub-resource | `can_manage_team_members` |

With:

| `manage` | Lifecycle management of a bounded sub-resource collection within the holder's organization context — covers create, update, and remove operations on the sub-resource instances; does not imply top-level entity creation, deletion, or ownership transfer. The specific operations a `can_manage_*` slug governs MUST be enumerated in the Required Permissions declaration of every contract that uses it. | `can_manage_team_members` |

**Rationale:** A slug is not self-documenting about its operation set. Requiring explicit enumeration in each contract's Required Permissions declaration ensures that AI agents, reviewers, and implementers know exactly what `can_manage_team_members` covers in a given context, rather than assuming "everything."

**Implementation Impact:** Contracts already using `can_manage_*` slugs must add an explicit operation enumeration to their Required Permissions declarations at their next amendment. This is an additive change; no slug values change, no permission checks change.

---

### P6-M03

**Patch-ID:** P6-M03

**Affected Section(s):** `Annexure D §D.2`

**Problem Summary:** The filter allowlist exclusion rule names only three protected fact categories: "blacklist flags, routing scores, Buyer Vendor Status." The complete protected fact list defined in §7.5 (Pass 2, FROZEN) covers five distinct categories. The incomplete list creates a false sense of completeness: contract authors who follow the literal text of §D.2 may inadvertently expose private CRM data or link facts through filter dimensions.

**Patch Content:**

In `Annexure D §D.2`, replace:

> - Protected fact fields (blacklist flags, routing scores, Buyer Vendor Status) MUST NOT appear in the allowlist.

With:

> - Protected fact fields MUST NOT appear in the filter allowlist. The complete set of protected facts is defined in §7.5 and includes: (1) blacklist membership and status; (2) routing exclusion conditions; (3) Buyer Vendor Status; (4) private CRM data (buyer notes, private ratings, and private tags on vendor records); (5) link facts (the existence or absence of a buyer–vendor relationship). Any field whose value or presence would expose or allow inference of any of these five categories is a protected-fact field and MUST be excluded from the `Filterable:` declaration.

**Rationale:** The filter allowlist is a non-disclosure surface. An incomplete exclusion list teaches authors to apply partial protection. The complete §7.5 list is the authoritative source; the filter rule must reference it in full.

**Implementation Impact:** Contract authors must audit their `Filterable:` allowlists against all five categories, not just the three previously named. Contracts that already exclude all five are unaffected.

---

### P6-M04

**Patch-ID:** P6-M04

**Affected Section(s):** `Annexure D §D.2`

**Problem Summary:** The filter semantics rule states "OR semantics within the field; AND semantics across fields." This is an implementation prescription: it specifies the logical evaluation mechanism (OR, AND) that the server must use — a transport-specific and execution-engine concern that belongs in development documents, not in a contract standard (§2 implementation-neutrality). It also does not address whether multi-value filter behavior is mandatory or recommended for all field types.

**Patch Content:**

In `Annexure D §D.2`, replace:

> - Filter values for enum fields accept a list (OR semantics within the field; AND semantics across fields).

With:

> - Filter values for a single field accept a list of values; the contract MUST declare in its `Filterable:` specification whether the list is evaluated as inclusion-any (results matching any supplied value are included) or inclusion-all (results matching all supplied values are included). The default, when not explicitly declared, is inclusion-any.
> - Filters declared across different fields are cumulative: results must satisfy all declared field filters simultaneously. The evaluation mechanism is implementation-defined in development documents.

**Rationale:** "OR" and "AND" are implementation-layer concepts. The contract layer declares the behavioral contract (inclusion-any or inclusion-all; cumulative across fields) using implementation-neutral language. The actual evaluation algorithm is an implementation concern.

**Implementation Impact:** Existing `Filterable:` allowlist declarations should be updated to specify inclusion-any or inclusion-all per field at the next contract amendment. Contracts that do not declare it inherit the inclusion-any default.

---

### P6-Min03

**Patch-ID:** P6-Min03

**Affected Section(s):** `Annexure D §D.4`

**Problem Summary:** The cursor reuse rule states "Platform behavior for reused cursors is undefined." "Undefined" is not a safe contract term: it permits any behavior including data corruption, silent duplicate results, or server-side errors that are not surfaced to clients. Clients need a conforming posture (MUST NOT rely on reuse) and a predictable server response range (error or fresh results — not silent data loss).

**Patch Content:**

In `Annexure D §D.4`, replace:

> - Cursors are single-use: a cursor from page N delivers page N+1; once used, it should not be reused. Platform behavior for reused cursors is undefined.

With:

> - Cursors are single-use: a cursor from page N delivers page N+1. Callers MUST treat each cursor as single-use and MUST NOT reuse a cursor after it has been submitted. The platform's behavior on cursor reuse is implementation-defined: it MAY return a `VALIDATION` error with an appropriate module-namespaced `error_code`, or MAY return results as if the cursor were fresh. Callers MUST NOT rely on either behavior.

**Rationale:** "Undefined" behavior cannot be safely implemented. "Implementation-defined" is the correct term for behavior that is intentionally left to the platform implementation while bounding the possible outcomes to a safe set.

**Implementation Impact:** No change to existing implementations. Client implementations must already treat cursors as single-use; this correction strengthens the requirement.

---

### P6-Min04

**Patch-ID:** P6-Min04

**Affected Section(s):** `Annexure D §D.5`

**Problem Summary:** The filter repetition rule states "The filter object MUST be repeated on subsequent requests" but does not address the case where a caller changes filter values mid-sequence. A caller could interpret the rule as requiring repetition of any filter object, including a modified one, which would produce inconsistent page sets. The conforming behavior for filter-change mid-sequence is not defined.

**Patch Content:**

In `Annexure D §D.5`, replace the italicized note:

> *The filter object MUST be repeated on subsequent requests. The cursor does not carry forward the filter.*

With:

> *The filter object MUST be repeated on each subsequent request with the same field values used to initialize the pagination sequence. Changing filter values between paginated requests is nonconforming: the resulting page set is not guaranteed to be consistent with the prior pages. Callers that require a different filter MUST start a new pagination sequence by omitting the cursor and submitting the revised filter.*

**Rationale:** Clarifying the filter-change case eliminates a source of silent data inconsistency. Clients that change filters mid-sequence receive pages from an undefined intersection; the rule must prohibit this positively.

**Implementation Impact:** Client implementations that correctly treat pagination as a single-filter sequence are unaffected. Clients that mutate filters mid-sequence must be updated.

---

### P6-Min06

**Patch-ID:** P6-Min06

**Affected Section(s):** `§22.3 Rule R-01`

**Problem Summary:** Rule R-01 states "If a contract appears to require two templates, it is two contracts (one query, one command) — split it." A command contract (Template 21.4) that triggers Phase-2 async work uses the Async Declaration block within Template 21.4 — it does not require Template 21.5 as a second template on the same contract. Without explicit guidance, agents may: (a) attempt to apply both 21.4 and 21.5 to a single contract, or (b) incorrectly split the Phase-1 command from its Async Declaration.

**Patch Content:**

In `§22.3 Rule R-01`, replace:

> Do not apply multiple templates to a single contract. If a contract appears to require two templates, it is two contracts (one query, one command) — split it.

With:

> Do not apply multiple templates to a single contract. If a contract appears to require two templates, it is two contracts — split it.
>
> **Phase-2 exception — one contract, not two:** A command contract (Template 21.4) that triggers Phase-2 async work uses a single Template 21.4 contract with an Async Declaration block (§15.2) declaring `Execution: async` and a `Phase-2:` navigation pointer. Do not apply Template 21.5 to the same Phase-1 contract. Template 21.5 is a separate, independent contract for the Phase-2 worker itself, authored by the Phase-2 owning module in that module's document (Rule R-02). Two separate contracts result: the Phase-1 command (Template 21.4, async) in the originating module's document, and the Phase-2 worker (Template 21.5) in the Phase-2 owning module's document.

**Rationale:** The Phase-1 + Phase-2 pattern is the most common async pattern in the platform and the most likely source of template selection errors. Making the correct split explicit prevents both the "one mega-contract" error and the "unnecessary split of Phase-1" error.

**Implementation Impact:** No existing contracts are affected. AI agents authoring async command contracts must produce two contracts (21.4 in originating module + 21.5 in Phase-2 module) rather than attempting a combined contract.

---

### P6-Min10

**Patch-ID:** P6-Min10

**Affected Section(s):** `Annexure F §F.4`

**Problem Summary:** The statement "consumers tolerate unknown fields" is presented as a factual description of consumer behavior rather than a normative requirement. Consumers who do not implement the Tolerant Reader pattern are not identifiable as nonconforming under the current wording. Because additive event payload changes (new optional fields) depend on consumer tolerance to be safe, the tolerance requirement must be a binding obligation on all event consumers across Doc-4B–4N.

**Patch Content:**

In `Annexure F §F.4`, replace:

> - Adding a new optional payload field is additive — no version bump required (consumers tolerate unknown fields).

With:

> - Adding a new optional payload field is additive — no version bump required. Event consumers across all Doc-4B–4N documents MUST implement the Tolerant Reader pattern: they MUST NOT fail, error, or discard a message when encountering fields in the event payload that are not declared in the version they were authored against. Failure to implement consumer tolerance is a conformance violation in the consuming module's document (applies under CHK-178 — Events Consumed grammar completeness obligation).

**Rationale:** Additive events are only safe if consumer tolerance is guaranteed. Framing tolerance as an obligation (not a convention) makes it auditable and makes consuming-module contract authors responsible for declaring their tolerance posture.

**Implementation Impact:** Doc-4B–4N authors must verify that their Events Consumed declarations include explicit handling for unknown fields. Implementations that already use a schema-flexible event deserialization are unaffected in practice.

---

## §3 — Governance Impact Assessment

### 3.1 Architecture Integrity

No patch in this document modifies: the frozen corpus (Architecture, ADRs, Doc-2, Doc-3), the canonical error envelope (§12.1, Pass 3), any template field set or field order (Templates 21.1–21.6, Pass 5), Appendix A conformance checks (Pass 5 + Pass 6 §22.2 supplement), any ownership boundary, any state machine, any permission slug, or any event name.

| Invariant | Affected? | Assessment |
|---|---|---|
| Canonical error envelope (§12.1) | No | P6-M01 removes an unauthorized extension; the envelope remains as frozen |
| Template 21.1–21.6 field sets | No | P6-B01 supplements C-05 with a template-binding instruction; template field grammar unchanged |
| CHK-012 no-TBD rule | Resolved | P6-B02 removes the CHK-012 violation in Rule R-04; no exception to CHK-012 |
| §7.5 protected fact list | No | P6-M03 references §7.5 more completely; §7.5 itself is unchanged |
| §2 implementation-neutrality | Resolved | P6-M04 removes the OR/AND implementation prescription |
| All other Pass 1–5 frozen content | No | Unchanged |

### 3.2 Conformance Checklist Impact

No Appendix A or Pass 6 §22.2 CHK items are modified or removed. P6-B01's Response Contract mandate is enforced through CHK-095's analogue (Response Contract completeness). P6-B02 resolves a CHK-012 conflict without modifying CHK-012.

### 3.3 Self-Review

| ID | Finding | Disposition |
|---|---|---|
| R-01 | P6-B01 adds a Response Contract mandate via a Pass 6 correction, binding Pass 5 templates. This is within the authority of Pass 6 §22 corrections (stated as authoritative and superseding for specific items). | Accepted — no template field set is modified; the mandate is declared, not implemented in the template grammar |
| R-02 | P6-M01 removes a MUST from §B.3 (`retry_after` MUST be present). No existing conforming contract is broken because no contract was ever required to declare `retry_after` — the extension was in reference material only. | Accepted — net reduction in scope; additive changes only to allow a transport hint |
| R-03 | P6-Min10 uses CHK-178 as a conformance hook for consumer tolerance. CHK-178 covers Events Consumed grammar completeness — the tolerance requirement is a natural extension of this check, not a new check. | Accepted — no new CHK item; CHK-178 scope is appropriate |

**Result: 0 BLOCKER, 0 MAJOR, 3 MINOR (all accepted). Doc-4A_Pass6_Patch_v1.0.1.md is freeze-ready.**

---

*Doc-4A Content v1.0 Pass 6 Patch v1.0.1 — All ten patches applied. Doc-4A is complete across all six passes and their patches. Status: **DOC-4A FINAL FREEZE CANDIDATE.***
