# Architecture Board Assessment

## Document Under Review

```text
Requested identifier: Doc-5A_API_Realization_Standards_v1.0_Pass2
On-disk artifact reviewed: Doc-5A_Content_v1.0_Pass2.md
Declared document: Doc-5A — API Realization Standards — Content v1.0, Pass 2 (§3–§4)
```

**Review nature:** Independent Hard Review presented in the standard Architecture Board Assessment format. Defect-discovery review only; not a patch, patch verification, freeze audit, or review of Pass-3 content.

**Scope reviewed:** §3 Wire Naming & Serialization Standard and §4 Standard Header Set. Later sections were inspected only where Pass 2 assigns ownership to them or changes their frozen semantics.

**Authority applied:** Master Architecture (FROZEN) → ADR Compendium (FROZEN) → Doc-2 v1.0.3 (FROZEN) → Doc-3 v1.0.2 (FROZEN) → Doc-4A–4M v1.0 (FROZEN) → Doc-5 Program Governance Note → Doc-5A Structure v1.0 (FROZEN).

No draft or previous review report was used as authority.

---

# Executive Verdict

```text
BLOCKER: 0
MAJOR: 5
MINOR: 5
NITPICK: 1
```

### Status

```text
PATCH REQUIRED
```

Pass 2 remains within the API-realization layer and does not redesign the architecture. It is not ready for Pass-3 Authoring because five MAJOR findings alter or omit frozen realization obligations that would propagate into Doc-5B–5M. The defects are locally patchable; no reauthoring or architecture reopening is required.

---

# Finding M-01

### Severity

```text
MAJOR
```

### Affected Section

```text
§3 opening scope
§4 heading and scope
```

### Issue

Pass 2 does not fully instantiate the frozen scope of §3–§4. The frozen §3 requires realization of `Doc-4A §§3, 8, 9, 10`, but the Pass-2 opening binds only §§3, 8, and 9. The frozen §4 is titled **Transport Envelope & Standard Header Set** and requires the one transport envelope; Pass 2 retitles it **Standard Header Set** and defines only header-registry governance. No transport-envelope realization appears.

### Impact

The canonical response-side realization and transport-envelope boundary remain undefined. Later endpoint and error passes could therefore create incompatible envelope assumptions, while Doc-5B–5M would lack a complete frozen rule to instantiate.

### Evidence

```text
Doc-5A Structure §3:
"Realize Doc-4A §§3, 8, 9, 10 at the wire."

Doc-5A Structure §4:
"Transport Envelope & Standard Header Set"
"Define the one envelope and the closed set of standard headers."

Pass 2 §3:
"Realizes Doc-4A §3 ... §8 ... §9 ..."

Pass 2 §4:
"§4 — Standard Header Set"
```

### Recommended Resolution

Restore the frozen §4 title and add the missing transport-envelope obligation. Complete §3's binding to Doc-4A §10 for response-side serialization semantics. Keep endpoint selection and error behavior in their later owning sections; do not introduce endpoint examples or new envelope fields.

---

# Finding M-02

### Severity

```text
MAJOR
```

### Affected Section

```text
§4.3 Allocation & Reserved-Namespace Policy
§4.4 Header Classification
§4.5 Registry Structure
```

### Issue

The header registry does not conform to the frozen closed inventory or required detail level. It omits the frozen **pagination cursors** slot, adds a separate **Trace propagation (inbound)** slot not present in the closed set, and defers every concrete header name to Appendix B even though frozen §4 requires a full registry containing names, meanings, and owning sections. The body also introduces `Conditional` as a fourth classification while its own heading and opening scope declare only mandatory, optional, and forbidden classifications.

### Impact

Doc-5B–5M cannot instantiate one stable header vocabulary from Pass 2. Agents may invent names, disagree about cursor carriage, or treat the unratified trace slot as frozen. Deferring names also moves a normative §4 obligation into an appendix contrary to the frozen structure.

### Evidence

```text
Frozen §4 closed set:
correlation/trace id; authentication carrier; active-organization context carrier;
idempotency key; concurrency precondition; surface version; pagination cursors.

Pass 2 actual set:
correlation/trace id; authentication carrier; active-organization context carrier;
idempotency key; concurrency precondition; surface-version; trace propagation (inbound).

Pass 2 §4.3:
"The concrete header token for each slot below is allocated only in Appendix B."

Frozen §4 detail level:
"Full normative header registry (names + meaning + owning section)."
```

### Recommended Resolution

Make §4 contain the exact frozen slot set and each slot's concrete header name, meaning, classification, and owning section. Cross-register those names in Appendix B rather than deferring their first allocation there. Remove the unratified slot or obtain an approved additive structure patch before retaining it. Reconcile the classification vocabulary with the frozen §4 model.

---

# Finding M-03

### Severity

```text
MAJOR
```

### Affected Section

```text
§4.4 Header Classification — Idempotency key and Concurrency precondition rows
```

### Issue

The two conditional rows strengthen and change Doc-4A's frozen contract semantics. Pass 2 makes the idempotency-key header required for all unsafe/mutating operations and the concurrency-precondition header required for all updates. Doc-4A §14.1 instead requires an unsafe operation to declare an idempotency model that may be either an idempotency key or optimistic concurrency for the applicable update case. Doc-4A §14.5 states that update commands **SHOULD** use optimistic concurrency and expressly permits `Concurrency: none` with recorded justification.

### Impact

Downstream module documents would be forced to over-constrain contracts and contradict valid Doc-4A declarations. Because Doc-5A is intended to gate every module realization, the changed normative strength would become a family-wide conformance defect.

### Evidence

```text
Pass 2 §4.4:
"Idempotency key — required for unsafe/mutating operations."
"Concurrency precondition — required for updates."

Doc-4A §14.1:
"either an idempotency key declaration ... or an optimistic-concurrency declaration"

Doc-4A §14.5:
"Update commands ... SHOULD declare optimistic concurrency"
"Concurrency: none is permitted" with explicit justification.
```

### Recommended Resolution

Classify each header as required only when the contract declares its corresponding Doc-4A model. Preserve Doc-4A's key-versus-concurrency distinction, its `SHOULD` strength, and its justified `Concurrency: none` path. Leave duplicate-request and stale-token behavior to §9.

---

# Finding M-04

### Severity

```text
MAJOR
```

### Affected Section

```text
§4.4 Request correlation / trace id
§4.4 Trace propagation (inbound)
```

### Issue

Both trace-related rows assign behavior to `§10 / observability`, but no such normative owner exists. Frozen Doc-5A §10 owns asynchronous-operation realization, while the frozen structure explicitly defers observability to development documents. The rows also leave request-correlation origin undefined and conflate the Doc-4A `reference_id` correlation obligation with distributed trace propagation.

### Impact

An AI agent cannot determine whether the caller or server creates the mandatory correlation value, whether it is the same value as the response/audit `reference_id`, or which section controls validation and propagation. Assigning the rule to an absent authority creates hidden ownership and invites incompatible implementations.

### Evidence

```text
Pass 2 §4.4:
"Request correlation / trace id ... §10 / observability"
"Trace propagation (inbound) ... §10 / observability"

Frozen Doc-5A §10:
"Asynchronous Operation Realization Standard"

Frozen Doc-5A §1:
observability is deferred to development documents.

Doc-4A §12.1 / §17.7:
reference_id is the response/audit correlation identifier.
```

### Recommended Resolution

Bind the frozen correlation slot to an existing authorized normative owner and state, at slot level, whether its value is caller-supplied, server-generated, or propagated. Keep distributed tracing distinct from the platform `reference_id`. Do not create an observability owner or additional semantic slot without an approved structure amendment.

---

# Finding M-05

### Severity

```text
MAJOR
```

### Affected Section

```text
§3.10 Deterministic Ordering Requirements
```

### Issue

Pass 2 applies Doc-4A §9.6's paginated-result sort rule to every ordered list. It requires any ordered list to be a total order with the entity `id` as tiebreaker. Doc-4A §9.3 only requires an ordered collection to declare what its order means; the entity-ID tiebreaker is imposed by §9.6 specifically for stable sorting across paginated entity results.

### Impact

Ordered value-object arrays, workflow sequences, or other non-entity collections may have no entity `id` and may use position or domain order. Doc-5B–5M agents would either invent IDs, incorrectly reorder payloads, or violate the canonical standard.

### Evidence

```text
Pass 2 §3.10:
"For an ordered list contract, the serialized order MUST be a total order
including the declared tiebreaker (the entity id)."

Doc-4A §9.3:
"Ordering significance MUST be declared ...; if ordered, the contract states
what order means."

Doc-4A §9.6:
the entity-id tiebreaker is part of pagination/filter/sort request determinism.
```

### Recommended Resolution

Restrict total-order and entity-ID tiebreaker requirements to paginated entity-result sorting governed by Doc-4A §9.6. For general ordered arrays, require preservation of the order meaning declared under §9.3.

---

# Finding N-01

### Severity

```text
MINOR
```

### Affected Section

```text
§3.6 Money Realization
```

### Issue

`amount` is described as a string in "canonical decimal notation," but the canonical grammar is incomplete. The rule prohibits exponent notation and thousands separators but does not settle leading plus signs, leading/trailing zeros, required fractional scale, decimal-point edge cases, or negative zero.

### Impact

Multiple byte-distinct strings can represent the same monetary value. Backend, frontend, tests, signatures, caches, and audit comparisons may implement different normalizers despite all claiming conformance.

### Evidence

```text
Pass 2 §3.6:
"amount serializes as a JSON string in canonical decimal notation
(no exponent, no thousands separators)."
```

### Recommended Resolution

Define one bounded decimal lexical grammar and normalization rule, including sign, integer-part, fractional-part, zero, and scale handling. Keep currency precision and business limits bound to their owning corpus/POLICY authorities.

---

# Finding N-02

### Severity

```text
MINOR
```

### Affected Section

```text
§3.6 Money Realization — currency
```

### Issue

Pass 2 states that Doc-2 §0.4 owns a valid currency-code set, but that section only requires an explicit currency column and establishes `BDT` as the default. It does not define a valid-code catalog. The Master Architecture states that the current platform currency is BDT and that broader multi-currency support is future-facing.

### Impact

Downstream agents cannot determine whether the current wire accepts only `BDT`, any arbitrary string, or a separate external code set. The pointer presents authority that its source does not contain.

### Evidence

```text
Pass 2 §3.6:
"The valid-code set is owned by Doc-2 §0.4."

Doc-2 §0.4:
"all monetary amounts are NUMERIC with an explicit currency column
defaulting to 'BDT'."

Master Architecture:
"The platform currency is BDT"; multi-currency support is future-facing.
```

### Recommended Resolution

Bind the current accepted currency behavior to the actual frozen authority and remove the unsupported valid-set claim. Any broader accepted-code set must come from its proper additive authority before Doc-5A realizes it.

---

# Finding N-03

### Severity

```text
MINOR
```

### Affected Section

```text
§3.5 Timestamp & Date Realization
```

### Issue

The timestamp rule permits optional fractional seconds without fixing precision or normalization. It nevertheless describes the result as a single lexical form that removes parsing ambiguity.

### Impact

Conforming producers may emit second, millisecond, microsecond, or differently trimmed values. This is especially risky when `updated_at` is later carried as the optimistic-concurrency token and compared across clients and persistence boundaries.

### Evidence

```text
Pass 2 §3.5:
"Fractional seconds, if present, use a . separator."
"the single lexical form ... removes parsing ambiguity"
```

### Recommended Resolution

Fix one wire precision and normalization rule, or explicitly bind precision to a single owning implementation standard while requiring lossless round-trip of concurrency tokens. Preserve UTC `Z` and ISO-8601 date requirements.

---

# Finding N-04

### Severity

```text
MINOR
```

### Affected Section

```text
§4.2 Ownership & Governance
§4.3 Allocation & Reserved-Namespace Policy
§4.4 Forbidden headers
```

### Issue

The prohibition on any unregistered header carrying semantic meaning does not define whether the registry governs only iVendorz application headers or also standard HTTP protocol headers. Under the literal wording, unlisted headers such as `Content-Type` and `Accept` could be rejected even though §3.1 mandates JSON over HTTP.

### Impact

Agents can produce two incompatible implementations: one that bans all unlisted semantic HTTP headers and another that treats the Doc-5A registry as application-header-only. The ambiguity weakens both interoperability and the intended closed-namespace protection.

### Evidence

```text
Pass 2 §4.2:
"MUST NOT introduce a non-registered header that carries semantic meaning."

Pass 2 §4.4:
"Unregistered header carrying semantic meaning" is forbidden.

Pass 2 §3.1:
all request and response bodies are JSON over the §2 HTTP binding.
```

### Recommended Resolution

State the registry boundary explicitly: distinguish protocol-standard HTTP headers from Doc-5A-allocated application headers, while preserving the ban on module-invented application semantics.

---

# Finding N-05

### Severity

```text
MINOR
```

### Affected Section

```text
Pass-2 realization-convention declarations
§3.7–§3.10
§4.4
```

### Issue

The document promises that every transport convention introduced where the corpus is silent is marked `[realization convention]`, but several wire choices are unmarked: boolean lexical encoding, omission-versus-null mapping, empty-array encoding, object-order behavior, and the added header classification/trace choices.

### Impact

Reviewers and AI agents cannot reliably distinguish inherited frozen requirements from new Doc-5A realization decisions. This obscures authority traceability and makes future amendment analysis harder.

### Evidence

```text
Pass-2 preamble:
"each such convention is marked [realization convention] with its rationale."

§3.7–§3.10 rationales contain no such marker.
§4.4 introduces classifications and an extra trace slot without one.
```

### Recommended Resolution

Mark every genuine wire-level convention consistently and leave corpus-derived rules unmarked but precisely bound. Do not use the marker to legitimize a rule that conflicts with the frozen structure or upstream corpus.

---

# Finding NP-01

### Severity

```text
NITPICK
```

### Affected Section

```text
§3.4 Identifier Serialization
```

### Issue

The UUIDv7 string is described as using the canonical `RFC-4122` textual form. RFC 9562 is the current UUID specification, defines UUIDv7, and obsoletes RFC 4122. The stated lowercase hyphenated representation remains technically understandable, so this is a citation-precision defect rather than a behavioral one.

### Impact

Low. Implementers are unlikely to serialize the value incorrectly, but the canonical standard should cite the specification that actually defines UUIDv7.

### Evidence

```text
Pass 2 §3.4:
"canonical RFC-4122 textual form"

RFC 9562:
current UUID specification; includes UUID Version 7 and obsoletes RFC 4122.
```

### Recommended Resolution

Update the supporting specification reference to RFC 9562 while retaining the explicitly chosen lowercase `8-4-4-4-12` wire convention.

---

# Positive Findings

## P-01

```text
No architecture redesign, new module, domain authority, endpoint, DTO, event,
permission slug, state transition, audit action, or POLICY key was introduced.
```

## P-02

```text
JSON UTF-8 binding, snake_case property preservation, string enum tokens,
UUIDv7 payload references, human_ref restrictions, JSON booleans, and the
required/optional/nullable distinction are directionally sound and mostly
trace cleanly to Doc-4A.
```

## P-03

```text
The prohibition on Doc-5B–5M redefining or extending application-header
standards is strong and appropriate once the registry itself is corrected.
```

## P-04

```text
Pass 2 appropriately avoids defining endpoint contracts, authentication
behavior, error mappings, pagination grammar, versioning behavior, or module APIs.
```

---

# Review Domain Assessment

| Domain | Result |
| --- | --- |
| Architecture Conformance | PATCH |
| Authority Traceability | PATCH |
| Serialization Integrity | PATCH |
| Header Governance | PATCH |
| Cross-Document Consistency | PATCH |
| AI-Agent Safety | PATCH |
| Future Module Authoring Safety | PATCH |

---

# Risk Assessment

### Implementation Risk

```text
HIGH
```

The missing envelope/response realization, incomplete header registry, and changed idempotency/concurrency rules would propagate across every module API.

### Architecture Risk

```text
MEDIUM
```

No architectural redesign is present, but the draft does not fully conform to its frozen structure and assigns normative ownership to a nonexistent realization section.

### AI-Agent Misinterpretation Risk

```text
HIGH
```

Multiple compliant-looking implementations remain possible for ordered arrays, decimal and timestamp canonicalization, correlation/trace behavior, base HTTP headers, and conditional safety headers.

---

# Board Decision

## Ready For Next Pass?

```text
NO
```

## Required Actions

```text
Apply M-01 through M-05 and N-01 through N-05 in a separate, minimal Pass-2 patch.
Carry NP-01 as a deferrable citation correction if it is not included in that patch.
Complete independent patch verification before beginning Pass-3 Authoring.
```

---

# Final Recommendation

```text
PATCH REQUIRED BEFORE PASS-3
```

