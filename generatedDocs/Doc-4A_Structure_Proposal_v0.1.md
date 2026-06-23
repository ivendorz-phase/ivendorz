# Doc-4A Structure Proposal v0.1 — Canonical Structure for "API Standards & Conventions"

| Field | Value |
|---|---|
| Status | PROPOSED — for structure freeze, not content |
| Produces | The frozen Table of Contents for Doc-4A |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (v1.0.2 + patches), Doc-3 v1.0.2 (v1.0.1 + patch) — all FROZEN |
| Contains | No API contracts, no endpoints, no implementation detail — structure only |
| Audience | Claude Code, Cursor, backend, frontend, QA, AI development agents |

---

## Part I — Role of Doc-4A in the Document Corpus

Doc-4A is the **metastandard**: it does not define any module's API; it defines how every module's API document (Doc-4B…4N) must be written, so that ten module documents authored separately (by humans or AI agents, possibly in parallel) are mutually consistent, conform to the frozen corpus, and are mechanically reviewable.

Two governing rules shape the entire structure:

1. **Reference, never restate.** Permission slugs, event catalogs, audit matrices, state machines, and POLICY keys already have owners (Doc-2 §5/§7/§8/§9, Doc-3 §12). Doc-4A defines how contracts *bind to* those sources — it must not copy their content, or it becomes a second source of truth.
2. **Templates are the product.** Doc-4 Authoring Rules 7 and 8 enumerate the mandatory fields of every endpoint and integration contract. Doc-4A's deepest-detail sections are the normative templates and the conformance checklist that make those rules executable.

---

## Part II — Proposed Canonical Structure

### §0 — Document Control, Precedence & Conformance Obligation

- **Purpose:** Establish Doc-4A's position in the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B…4N), the conformance obligation on all downstream Doc-4 documents, the change-management rule for amending Doc-4A after freeze, and the reference-never-restate rule.
- **Why Doc-4A:** Without an explicit conformance obligation, module documents may treat Doc-4A as advisory. The precedence extension must be ratified once, here.
- **Dependencies:** None (root section).
- **Detail level:** Short, fully normative. Precedence table, conformance statement, amendment procedure. ~1 page.

### §1 — Scope, Audience & Doc-4 Family Map

- **Purpose:** Define what Doc-4A governs and explicitly does not govern; enumerate the planned Doc-4 family and each document's scope, mirroring module ownership (proposal: 4B Platform Core/Shared Kernel services, 4C Identity & Organization, 4D Marketplace & Discovery, 4E RFQ Procurement Engine, 4F Business Operations, 4G Trust & Verification, 4H Communication, 4I Monetization, 4J Admin Operations, 4K AI Layer, 4L Cross-Module Integration & Event Flow Index). State what is deferred to development documents (transport binding, framework conventions, migrations, testing tooling, observability).
- **Why Doc-4A:** Scope allocation is itself a consistency standard — the family map prevents two module docs from claiming the same contract, and the deferral list prevents Doc-4A from absorbing implementation detail.
- **Dependencies:** §0.
- **Detail level:** Normative scope table + family map table. No content for the family documents themselves.

### §2 — Contract Design Philosophy & Implementation Neutrality

- **Purpose:** Translate Architecture §23 principles and §22.7 Build Governance into contract-authoring doctrine: contract-first; implementation-neutral (no REST-only/GraphQL-only assumptions, per Authoring Rule 9); deterministic and explainable behavior; auditable by construction; internally complete (no "TBD"); written for AI-agent consumption (flag conflicts, never work around invariants).
- **Why Doc-4A:** Every downstream author (human or agent) needs the doctrine once, in one place, expressed as contract-level consequences rather than architecture prose.
- **Dependencies:** §0, §1.
- **Detail level:** Compressed — pointers to Architecture §23 plus the Doc-4-specific consequences only. Must NOT restate the principles at length.

### §3 — Canonical Terminology, Naming & Notation Standard

- **Purpose:** Fix the vocabulary all Doc-4 documents use: entity names exactly as in Doc-2 §3, state names exactly as in Doc-2 §5 (+ patches), module names as in ADR-017; field naming convention (casing, plurals, booleans, enum value sourcing); operation naming verbs; the contract notation used throughout Doc-4 (schema-like notation that is transport-neutral); RFC-2119-style keyword definitions (MUST/NEVER/SHOULD).
- **Why Doc-4A:** Workflow Rules forbid alternate names for existing concepts. Ten documents authored in parallel will drift without a single naming and notation authority.
- **Dependencies:** §0; feeds every later section.
- **Detail level:** Full normative rules + a worked naming example per rule category. No entity lists (pointer to Doc-2 §3).

### §4 — Module Ownership & API Surface Topology

- **Purpose:** Map module ownership (ADR-017, Architecture §16) onto API surface rules: only the owning module exposes contracts over its entities; the three legal cross-module channels (Services, Events, Public Contracts) and when each is appropriate; cross-module reads happen via the owning module's service, never by reshaping another module's data; **integration contract ownership rule** — every integration is authored once, in the *source* module's document; the target document references it (prevents duplicate sources of truth); cross-module reference validation expectations (bare UUID references validated by owning service, per Doc-2 §0.3).
- **Why Doc-4A:** "One Entity = One Owner" must be enforced at the contract layer, and the integration-ownership rule is the single most important guard against duplicated truth across Doc-4B…4N.
- **Dependencies:** §1, §3.
- **Detail level:** Full normative rules + module-to-surface mapping table (pointer-level, no endpoints).

### §5 — Identity, Actor & Request Context Standard

- **Purpose:** Define the request context every contract assumes: authentication boundary (Supabase Auth = authentication only); the server-validated **active organization context** (Users act; Organizations own — every business operation executes in an explicit org context, never client-asserted); the four actor types (User, Admin, System, AI Agent) and how each enters a contract; delegation-grant context for representative organizations; platform-staff context separation.
- **Why Doc-4A:** Every endpoint in every module document presupposes this context model; defining it per-module would fragment the tenancy guarantee.
- **Dependencies:** §3, §4.
- **Detail level:** Full normative context model + context-propagation rules. No session implementation detail.

### §6 — Authorization Declaration Standard

- **Purpose:** Standardize how every endpoint declares Required Permissions (Authoring Rule 7): three-layer check (Membership + Permission Slug + Resource Scope, OR active Delegation Grant) as the universal authorization contract; slugs only, never role or plan names; binding to the slug inventory in Doc-2 §7 by pointer; platform-staff slug space separation; the declaration syntax module docs must use.
- **Why Doc-4A:** Authorization is the most repeated contract element; one declaration grammar prevents per-module invention and guarantees the three-layer check is never abbreviated.
- **Dependencies:** §5; references Doc-2 §7.
- **Detail level:** Full normative declaration grammar + one worked declaration example (using an existing slug, no new endpoint).

### §7 — Multi-Tenancy, Visibility & Non-Disclosure Standard

- **Purpose:** Define tenant behavior at the API surface: the four tenancy classes (tenant-owned / platform-owned / shared / derived, Doc-2 §0.4) and the visibility behavior each implies; grant-based shared access (invitation grantees, document grants, delegation grants) as the only cross-tenant read paths; RLS as defense-in-depth backstop, never the authorization model; and — **normative home** — the platform-wide **non-disclosure indistinguishability invariant**: blacklist/exclusion/private-CRM facts must be undetectable through *any* surface channel — error responses, list contents, counts, ordering, pagination totals, and timing. Buyer Vendor Status data is never vendor-facing through any contract.
- **Why Doc-4A:** Non-disclosure is a hard security invariant (ADR-007 Amendment C, Doc-3 §12.1 FIXED). If it lives only in the error section, list endpoints leak it through counts. It must be defined once as a surface-wide invariant that §10 and §12 reference.
- **Dependencies:** §5, §6; referenced by §10, §12.
- **Detail level:** Full normative rules including the indistinguishability test ("an excluded vendor's observable responses must be identical to a never-matched vendor's").

### §8 — Identifier & Entity Reference Standard

- **Purpose:** Fix identifier usage in contracts: UUIDv7 as the only canonical identifier in payloads and cross-references; `human_ref` as display/lookup convenience (lookup endpoints MAY accept it; payload references MUST use UUIDv7); identifiers never change, human refs never reused; cross-module references carry the entity-named UUID column convention (Doc-2 §0.3); document and file references are by document/version ID, never by URL or blob.
- **Why Doc-4A:** Two-identifier systems breed a second reference path if the rule isn't fixed centrally; document-by-version-ID is required by ADR-010 and audit rules.
- **Dependencies:** §3; references Architecture §17.2, Doc-2 §0.1.
- **Detail level:** Short, fully normative.

### §9 — Request Contract Standard

- **Purpose:** Standardize request payload conventions: required/optional notation; timestamps (single platform standard — proposed ISO-8601 UTC, with the note that the frozen corpus is silent and Doc-4A must fix this); money as `{amount, currency}` with `BDT` default (Doc-2 §0.4); enums sourced only from Doc-2 states/values; structured-reason fields where state machines demand them (e.g., revision reasons, moderation rejection codes); input size and file-reference constraints; no tunable values inline (POLICY keys per §18).
- **Why Doc-4A:** Payload-shape drift is the most common cross-module inconsistency; money and time must be identical in all ten documents.
- **Dependencies:** §3, §8, §18.
- **Detail level:** Full normative conventions + micro-examples (field shapes only, no endpoints).

### §10 — Response & List Contract Standard

- **Purpose:** Standardize response shape: the standard response envelope; entity representation rule (the owning module defines its entity's representation once; consumers never reshape it); list contracts — pagination, filtering, sorting grammar; the **exclusion-consistency rule**: soft-deleted rows, non-disclosed rows, and routing-excluded rows are absent from items, counts, and totals identically (joins §7's invariant); derived/computed field disclosure (e.g., scores shown per visibility rules); redaction-aware field representation.
- **Why Doc-4A:** Ten modules inventing ten pagination schemes is the canonical Doc-4 failure mode; the exclusion-consistency rule is where tenancy meets list mechanics.
- **Dependencies:** §3, §7, §9.
- **Detail level:** Full normative grammar + envelope/list micro-examples.

### §11 — Validation Standard

- **Purpose:** Define the universal validation order every mutating contract declares (Authoring Rule 7's "Validation Rules" field): schema validation → context/membership → permission slug → tenancy/scope → state-machine gate → business rules → POLICY-bound limits; the expression format module docs use to write validation rules; the rule that POLICY-derived limits are referenced by key (Doc-3 §12.2), never by value.
- **Why Doc-4A:** A fixed validation order makes contract behavior deterministic and makes the "Validation Rules" template field fillable in one consistent way.
- **Dependencies:** §6, §7, §13, §18.
- **Detail level:** Full normative ordering + expression format. Defines *what is validated and in what order*; §12 owns *how rejection is expressed*; §13 owns *state-gate semantics*.

### §12 — Error Taxonomy & Status Semantics Standard

- **Purpose:** Define the platform error model transport-neutrally: canonical error classes (validation failure, authorization failure, not-found/no-access, state-transition rejection, conflict/concurrency, quota/rate exceeded, async-pending, system failure); structured error payload (code, message, field errors, retryability); per-module error-code namespaces (registered in Appendix B); the **security-safe error policy**: no-access and not-found are indistinguishable where §7 requires it; state-transition rejections carry the legal-transition context without leaking other tenants' facts. A non-normative annex MAY map error classes to HTTP statuses.
- **Why Doc-4A:** Error semantics are where implementation-neutrality and non-disclosure most often erode; one taxonomy with reserved namespaces prevents collisions across Doc-4B…4N.
- **Dependencies:** §7, §11; Appendix B.
- **Detail level:** Full normative taxonomy + payload shape. HTTP mapping explicitly non-normative.

### §13 — State Machine Interaction Standard

- **Purpose:** Standardize how contracts interact with the frozen state machines (Doc-2 §5 + Patches v1.0.2/v1.0.3): every mutating endpoint declares its State Machine Effects (Authoring Rule 7) as legal transitions only — no contract may introduce a transition; illegal-transition rejection semantics; version-immutability consequences (RFQ versions once quoted; quotation binding to RFQ version by ID); terminal states never reopened by any contract; system-actor transitions (expiry, matching timeout) are never user-invocable endpoints; actor-restricted transitions (e.g., moderation rejection = platform actor only) must be declared.
- **Why Doc-4A:** The state machines are frozen; this section is the firewall that stops Doc-4B…4N from quietly extending them.
- **Dependencies:** §3, §11, §12; references Doc-2 §5.
- **Detail level:** Full normative rules + the declaration syntax for the State Machine Effects template field. No state machine restatement.

### §14 — Idempotency & Concurrency Standard

- **Purpose:** Define mutation safety: idempotency-key requirement for unsafe operations and the duplicate-request behavior (same result, **no duplicate audit record, no duplicate outbox event** — joint rule with §16/§17); optimistic-concurrency convention (version/updated_at precondition) for updates; retry semantics aligned with error retryability flags (§12).
- **Why Doc-4A:** Async-by-default architecture plus retrying clients makes idempotency a platform property; the no-double-emit rule is unstateable per-module without divergence.
- **Dependencies:** §12, §16, §17.
- **Detail level:** Full normative rules.

### §15 — Asynchronous Operation Standard

- **Purpose:** Define the contract pattern for async-by-default work (matching, routing, notifications, document generation, imports — Architecture §15.2): accepted-then-processing response pattern; how callers observe progress/outcome (status representation, event-driven completion); the rule that synchronous facades over async engines are forbidden; the **no-fabricated-activity rule** (Doc-3 §12.1 FIXED: buyer is never shown fake matching activity) as an async-surface constraint; Supabase Realtime positioned as a delivery channel only, never a source of truth or a contract substitute.
- **Why Doc-4A:** Every module has at least one async flow; without one pattern, each document invents its own job-status idiom.
- **Dependencies:** §10, §12, §16.
- **Detail level:** Full normative pattern + status representation shape. Job infrastructure detail deferred to development docs.

### §16 — Event Contract Standard

- **Purpose:** Standardize the event-side contract obligations: transactional outbox as a contract requirement (business write + event insert in one transaction); event naming and `event_name`/`event_version` rules; thin payloads (IDs + minimal metadata; consumers fetch via owning service); consumer idempotency as a contract obligation; the declaration syntax for Events Produced / Events Consumed (Authoring Rule 7) and the integration fields (Authoring Rule 8: trigger, payload, failure handling, idempotency); event additions only under the owning module per Doc-2 §8 — Doc-4 documents declare bindings to the catalog, never extend it.
- **Why Doc-4A:** Events are the integration fabric; the declaration grammar must be identical in all documents or the integration index (Doc-4L) cannot be assembled.
- **Dependencies:** §4, §14; references Doc-2 §8.
- **Detail level:** Full normative grammar + payload schema notation. No catalog restatement.

### §17 — Audit Declaration Standard

- **Purpose:** Standardize how endpoints declare Audit Requirements (Authoring Rule 7): binding to the Doc-2 §9 audit matrix by pointer; minimum audit fields and actor-type attribution as contract assertions; audit ≠ events (both declared, separately); redaction interaction (audited fields may be redacted later — contracts must not promise field permanence, only record permanence); audit rows reference document versions by ID, never blobs.
- **Why Doc-4A:** "No module may bypass audit" becomes enforceable only if every contract carries an explicit, uniformly-formatted audit declaration that review can check against Doc-2 §9.
- **Dependencies:** §5, §14, §16; references Doc-2 §9, Architecture §14.
- **Detail level:** Normative declaration grammar. No audit matrix restatement.

### §18 — Policy, Configuration & Entitlement Binding Standard

- **Purpose:** Define how contracts bind to tunable behavior: the FIXED / POLICY / ORG trichotomy (Doc-3 §12) at the contract surface — FIXED rules appear as invariant contract behavior; POLICY values referenced by `core.system_configuration` key, never by value; ORG settings read per-organization; entitlement checks expressed as entitlement keys via the Monetization service, never plan names; the firewall restated as a contract rule: entitlements may gate visibility/volume/features, never trust, verification, eligibility, routing fairness, or matching confidence.
- **Why Doc-4A:** Hardcoded tunables and plan-name checks are the two most likely agent-authoring errors; this section makes both mechanically detectable in review.
- **Dependencies:** §6, §11; references Doc-3 §12, ADR-011.
- **Detail level:** Full normative binding rules + reference syntax.

### §19 — Rate Limiting, Quota & Abuse Control Declaration Standard

- **Purpose:** Define the declaration pattern for contract-relevant throughput controls: where rate limits and quotas attach (e.g., quotation quota consumed from the vendor profile's Controlling Organization, including via delegation); quota-exceeded and rate-limited as standard error classes; abuse-related limits bound to POLICY keys (§18) only; suspension/lockout surface behavior consistent with §7 disclosure rules.
- **Why Doc-4A:** Quota attribution crosses modules (Identity/Marketplace/Monetization/RFQ) and must be declared identically everywhere it appears.
- **Dependencies:** §7, §12, §18.
- **Detail level:** Normative declaration pattern only. No limit values (POLICY).

### §20 — Contract Versioning & Evolution Standard

- **Purpose:** Define how Doc-4 contracts evolve after freeze: contract versioning ≠ domain versioning — entities and state machines change only via approved corpus patches; backward-compatible vs breaking contract changes; deprecation declaration pattern; alignment with event versioning (§16) and document versioning (ADR-010).
- **Why Doc-4A:** Without one evolution rule, module docs will invent URL-versioning or silent breaking changes; with the corpus frozen, the boundary between "contract change" and "domain change" must be explicit.
- **Dependencies:** §0, §13, §16.
- **Detail level:** Short, fully normative.

### §21 — Canonical Contract Templates (Normative)

- **Purpose:** The executable heart of Doc-4A — fixed-field-order, controlled-vocabulary templates every Doc-4 document must instantiate verbatim:
  - **21.1 Endpoint Contract Template** — the ten mandatory fields of Authoring Rule 7 (Purpose, Owner Module, Required Permissions, Request Contract, Response Contract, Validation Rules, State Machine Effects, Audit Requirements, Events Produced, Events Consumed), each with its fill-in grammar defined in §§6–17.
  - **21.2 Integration Contract Template** — the eight mandatory fields of Authoring Rule 8 (Source Module, Target Module, Trigger, Event Payload, Failure Handling, Idempotency Rules + source-module authorship per §4).
  - **21.3 Internal Service Contract Template** — for synchronous cross-module service calls (the "Services" channel), with the same authorization/tenancy/audit declaration obligations.
  - **21.4 Event Schema Declaration Template** — name, version, payload shape, emitter, consumers, idempotency note.
- **Why Doc-4A:** AI agents and parallel authors produce consistent documents only from templates with fixed field order and controlled vocabulary; free-form sections guarantee drift.
- **Dependencies:** All of §§3–20 (it is their composition).
- **Detail level:** Maximum — complete templates with per-field fill instructions and one fully worked *illustrative* instantiation using an existing Doc-2 entity (marked non-normative, not a real contract definition).

### Appendix A — Doc-4 Conformance Checklist

- **Purpose:** The review gate applied to every Doc-4B…4N document before freeze: a checkable list derived from §§0–21 (every endpoint uses Template 21.1; no new entities/states/transitions; permissions are slugs from Doc-2 §7; events exist in Doc-2 §8; audit rows exist in Doc-2 §9; POLICY referenced by key; non-disclosure test passes; integration authored by source module; etc.). Doubles as QA's contract-acceptance baseline and the AI agent's self-check.
- **Why Doc-4A:** Standards without a gate decay; the checklist is what makes Doc-4A enforceable by CI-style review.
- **Dependencies:** All sections.
- **Detail level:** Complete, mechanically checkable list.

### Appendix B — Reserved Namespace Registry

- **Purpose:** Central registry preventing cross-document collisions: per-module error-code prefixes, event-name ownership (pointer to Doc-2 §8), permission-slug prefixes (`can_*` org space, `staff_*` platform space), human_ref prefixes (pointer to Doc-2 §0.1), POLICY key domains (pointer to Doc-3 §12.2). New registrations require Doc-4A amendment, not module-doc invention.
- **Why Doc-4A:** Ten documents authored in parallel will collide on identifiers without one registry; pointer-style entries avoid duplicating the owning sources.
- **Dependencies:** §3, §12, §16; Doc-2 §§0.1, 7, 8; Doc-3 §12.2.
- **Detail level:** Registry table, pointer-heavy.

### Appendix C — Cross-Reference Index

- **Purpose:** One table mapping every Doc-4A binding point to its authoritative source (Architecture section, ADR, Doc-2 section, Doc-3 section, patch), so authors and agents resolve references without searching, and so reference-never-restate is auditable.
- **Why Doc-4A:** Operationalizes the precedence chain for AI agents; cheap insurance against drift.
- **Dependencies:** All sections.
- **Detail level:** Pointer table only.

---

## Part III — Standards Allocation

### Belongs in Doc-4A (platform-wide, cross-module)

Conformance/precedence; naming and notation; ownership and surface topology; identity/actor/context; authorization declaration; tenancy/visibility/non-disclosure; identifiers; request/response/list conventions; validation order; error taxonomy; state-machine interaction rules; idempotency/concurrency; async pattern; event/audit declaration grammars; policy/entitlement binding; rate-limit/quota declaration; contract evolution; templates; conformance checklist; namespace registry.

### Moved to later documents

| Standard / Content | Destination |
|---|---|
| Module endpoint catalogs (all actual contracts) | Doc-4B…4K per module |
| Concrete integration flows | Source module's Doc-4 document (per §4 rule); indexed in Doc-4L |
| Notification policy matrix (ADR §E open item 5) | Doc-4H Communication — Doc-4A defines only the dispatch-declaration pattern |
| Shared Kernel service contracts (audit, outbox, ID, config, flags) | Doc-4B Platform Core |
| Entitlement key catalog | Doc-4I Monetization |
| HTTP/OpenAPI binding, route-handler & server-action conventions, Prisma/migration standards, contract-test tooling, observability/health endpoints | Development Decomposition / development documents |
| POLICY default values | `core.system_configuration` ratification (Doc-3 §12 ops track) |
| Frontend consumption patterns, UI contracts | Frontend development documents |

---

## Part IV — Structural Review (Expert Critic Pass)

### Missing Sections (resolved into the structure above, or flagged)

| ID | Class | Finding |
|---|---|---|
| R-1 | BLOCKER | **Namespace registry was absent from the naive TOC.** Parallel authoring of ten module documents without reserved error-code/identifier namespaces guarantees collisions and rework. Resolved: Appendix B. Structure must not freeze without it. |
| R-2 | BLOCKER | **Integration contract ownership rule.** Every integration touches two modules; without the single-authorship rule (source module owns, target references), the same integration gets written twice and diverges — violating One Business Truth = One Source. Resolved: §4 + Template 21.2. Must be in the frozen structure. |
| R-3 | MAJOR | **Timestamp/timezone standard does not exist anywhere in the frozen corpus.** Doc-4A must fix it (a convention, not an architecture change — consistent with the Change Management Rule). Resolved: §9. If left unfixed, ten documents will assume three formats. |
| R-4 | MAJOR | **Communication contract gap is a known open item** (ADR §E-5: notification policy matrix deferred). Risk: module docs invent ad-hoc notification contracts to fill the void. Mitigation: §15/§16 define the dispatch-declaration pattern; §1 explicitly assigns the matrix to Doc-4H and forbids interim invention. |
| R-5 | MINOR | Supabase Realtime had no home. Resolved with one rule in §15 (delivery channel, never source of truth); detail deferred to Doc-4H. |
| R-6 | MINOR | File/media upload conventions. Resolved minimally: §8/§9 (reference by document/version ID); media-pipeline contract detail deferred to Doc-4D Marketplace. |
| R-7 | NITPICK | Localization (Bangla/English content fields) is out of the frozen corpus. Record in Doc-4A's assumptions, do not add a section. |

### Redundant / Overlapping Sections

| ID | Class | Finding |
|---|---|---|
| R-8 | MAJOR | **Validation (§11) / Errors (§12) / State Machines (§13) overlap** on "rejected request" behavior — the classic three-way drift zone. Resolution embedded in structure: §11 owns *what is checked and in what order*, §12 owns *how rejection is expressed*, §13 owns *state-gate semantics*; each cross-references, none restates. The freeze should ratify this normative-home assignment explicitly. |
| R-9 | MINOR | §6 (authorization) and §7 (tenancy) share the three-layer check. Assignment: §6 owns the check; §7 owns scope/visibility semantics. |
| R-10 | MINOR | §19 (abuse/quota) is largely POLICY binding (§18). Kept separate only because quota *attribution* (Controlling Organization, delegation path) is contract-structural; §19 must reference §18 keys, never define values. |
| R-11 | NITPICK | §2 risks restating Architecture §23. Constrained to pointers + Doc-4-specific consequences; reviewers should reject prose duplication. |

### Architecture Risks

| ID | Class | Finding |
|---|---|---|
| R-12 | MAJOR | **Restatement drift.** If Doc-4A copies permission tables, event catalogs, or audit matrices from Doc-2, it becomes a competing source of truth that will desynchronize at the first patch. The reference-never-restate rule (§0) plus Appendix C is the structural defense; the conformance checklist must include a "no restated normative content" check. |
| R-13 | MAJOR | **Implementation-neutrality erosion in §12.** Error semantics naturally drift toward HTTP-specific design, violating Authoring Rule 9. Structural defense: transport-neutral error classes normative; HTTP mapping in an explicitly non-normative annex. |
| R-14 | MAJOR | **Non-disclosure as error-handling-only.** If indistinguishability lives only in §12, list endpoints leak exclusions via counts/totals/timing. Structural defense: §7 is the single normative home; §10 and §12 bind to it. This placement should be explicitly ratified at freeze. |
| R-15 | MINOR | §20 could be misread as licence to evolve frozen entities/states. The section's first rule must be: contract versioning ≠ domain versioning; domain change goes through corpus patches only. |

### Implementation Risks

| ID | Class | Finding |
|---|---|---|
| R-16 | MAJOR | **Template ambiguity defeats AI-agent authoring.** Claude Code/Cursor produce consistent Doc-4B…4N only if §21 templates have fixed field order, controlled vocabulary, and machine-checkable structure, and Appendix A is executable as a review gate. Free-text template fields are the single largest drift source. |
| R-17 | MAJOR | **Idempotent retry vs outbox double-emit.** A retried mutation must not produce a second audit record or outbox event. This rule spans §14/§16/§17 and must be stated once as a joint rule (placed in §14) or three documents will implement it three ways. |
| R-18 | MINOR | **Pagination × soft-delete × non-disclosure interaction.** Items, counts, and totals must apply exclusions identically (§10 exclusion-consistency rule); divergence is both an inconsistency and an inference leak. |
| R-19 | MINOR | **human_ref as a second identifier path.** Permitting human_ref lookups without mandating UUIDv7 in payload references creates dual referencing. §8 fixes this; the checklist should test for it. |
| R-20 | NITPICK | The Doc-4 family map (§1) assigns letters before any module doc exists; if the split changes (e.g., Operations splits documents), the map must be amended in Doc-4A, not forked informally. |

---

## Part V — Freeze Recommendation

The structure is ready to freeze once three decisions are ratified explicitly (all already embedded above): the normative-home assignments (R-8, R-14), the integration single-authorship rule (R-2), and the inclusion of Appendix B (R-1). No finding requires new entities, new workflows, or any change to the frozen corpus.

---

*End of Doc-4A Structure Proposal v0.1 — structure only; no contracts, endpoints, or implementation detail defined.*
