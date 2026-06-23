# Doc-4A — API Standards & Conventions — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | FROZEN — canonical Table of Contents for Doc-4A |
| Supersedes | Doc-4A_Structure_Proposal_v0.1.md (Architecture Board review applied; authoring history removed per board decision) |
| Authority | Doc-4_Governance_Note_v1.0.md — Doc-4A governs all Doc-4 descendants |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2 — all FROZEN |
| Contains | Structure only — no contracts, no endpoints, no implementation detail |
| Audience | Claude Code, Cursor, backend, frontend, QA, AI development agents |

Two governing rules shape the document:

1. **Reference, never restate.** Permission slugs, event catalogs, audit matrices, state machines, and POLICY keys have owners (Doc-2 §5/§7/§8/§9, Doc-3 §12). Doc-4A defines how contracts bind to those sources; it never copies their content.
2. **Templates are the product.** Doc-4 Authoring Rules 7 and 8 enumerate the mandatory contract fields; Doc-4A's deepest sections are the normative templates and the conformance checklist that make those rules executable.

---

## §0 — Document Control, Precedence & Conformance Obligation

- **Purpose:** Establish Doc-4A's authority on the basis of Doc-4_Governance_Note_v1.0 (extended precedence chain: Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B…4N); the conformance obligation on all downstream Doc-4 documents; the patch-based amendment rule after freeze; the reference-never-restate rule.
- **Why Doc-4A:** Conformance must be an obligation, not advice; the authority basis is ratified once, by the Governance Note, and bound here.
- **Dependencies:** Doc-4_Governance_Note_v1.0.
- **Detail level:** Short, fully normative. ~1 page.

## §1 — Scope, Audience & Doc-4 Family Map

- **Purpose:** Define what Doc-4A governs and does not govern; enumerate the Doc-4 family and each document's scope, mirroring module ownership (4B Platform Core/Shared Kernel services, 4C Identity & Organization, 4D Marketplace & Discovery, 4E RFQ Procurement Engine, 4F Business Operations, 4G Trust & Verification, 4H Communication, 4I Monetization, 4J Admin Operations, 4K AI Layer, 4L Cross-Module Integration & Event Flow Index); list what is deferred to development documents (transport binding, framework conventions, migrations, test tooling, observability). Explicitly assign the notification policy matrix (ADR §E-5) to Doc-4H and forbid interim invention.
- **Why Doc-4A:** Scope allocation prevents two documents claiming the same contract and keeps implementation detail out of Doc-4A.
- **Dependencies:** §0.
- **Detail level:** Normative scope table + family map table.

## §2 — Contract Design Philosophy & Implementation Neutrality

- **Purpose:** Translate Architecture §23 and §22.7 Build Governance into contract-authoring doctrine: contract-first; implementation-neutral (no REST-only/GraphQL-only, per Authoring Rule 9); deterministic, explainable, auditable; internally complete (no "TBD"); written for AI-agent consumption (agents flag conflicts, never work around invariants).
- **Why Doc-4A:** The doctrine is stated once, as contract-level consequences, not restated architecture prose.
- **Dependencies:** §0, §1.
- **Detail level:** Compressed — pointers to Architecture §23 plus Doc-4-specific consequences only.

## §3 — Canonical Terminology, Naming & Notation Standard

- **Purpose:** Fix vocabulary for all Doc-4 documents: entity names exactly as in Doc-2 §3, state names exactly as in Doc-2 §5 (+ patches), module names as in ADR-017; field naming conventions; operation naming verbs; the transport-neutral contract notation; RFC-2119-style keyword definitions (MUST/NEVER/SHOULD/RECOMMENDED); **patch terminology guidance** — how Doc-4 documents cite patched sources (always cite the base document + patch ID, e.g., "Doc-2 §5.4 as amended by PATCH-D2-01"), so contract references survive future patch integration.
- **Why Doc-4A:** Workflow Rules forbid alternate names; parallel authoring drifts without a single naming, notation, and citation authority.
- **Dependencies:** §0; feeds all later sections.
- **Detail level:** Full normative rules + worked naming and citation examples. No entity lists (pointer to Doc-2 §3).

## §4 — Module Ownership & API Surface Topology

- **Purpose:** Map module ownership (ADR-017, Architecture §16) onto API surface rules: only the owning module exposes contracts over its entities; the three legal cross-module channels (Services, Events, Public Contracts); cross-module reads via owning module's service only; **integration single-authorship rule** — every integration is authored once, in the source module's document, referenced by the target; cross-module reference validation expectations (Doc-2 §0.3).
- **Why Doc-4A:** Enforces One Entity = One Owner at the contract layer; the single-authorship rule is the primary guard against duplicated truth.
- **Dependencies:** §1, §3.
- **Detail level:** Full normative rules + module-to-surface mapping table (pointer-level).

## §4B — Governance Signal Firewall Standard

- **Purpose:** Make the Governance Signal Matrix firewalls (Architecture §1.5, Doc-3 §12.1 FIXED) explicit contract obligations: Trust Score, Performance Score, Financial Tier, Capacity Profile, and Buyer Vendor Status are independent signals with fixed owner modules; no contract may accept, expose, or propagate one signal as an input that mutates another (tier ↛ trust, tier ↛ performance, buyer status ↛ platform scores, payment/entitlement ↛ matching); contracts that read signals must declare which signal, from which owner, for what purpose; Buyer Vendor Status is buyer-private through every contract surface (binds to §7). Module documents must include a firewall-compliance declaration for any endpoint touching a governance signal.
- **Why Doc-4A:** The firewalls are platform-wide hard invariants spanning four modules; without a declaration standard, firewall compliance is unreviewable per endpoint.
- **Dependencies:** §4, §7; references Architecture §1.5, §12.4, Doc-3 §12.1.
- **Detail level:** Full normative rules + declaration syntax for the firewall-compliance statement.

## §5 — Identity, Actor & Request Context Standard

- **Purpose:** Define the request context every contract assumes: authentication boundary (Supabase Auth = authentication only); the server-validated active organization context (Users act; Organizations own; never client-asserted); the four actor types (User, Admin, System, AI Agent) and how each enters a contract; platform-staff context separation.
- **Why Doc-4A:** Every endpoint presupposes this context model; per-module definition would fragment the tenancy guarantee.
- **Dependencies:** §3, §4.
- **Detail level:** Full normative context model + propagation rules. No session implementation detail.

## §6 — Authorization Declaration Standard

- **Purpose:** Standardize how every endpoint declares Required Permissions (Authoring Rule 7): the three-layer check (Membership + Permission Slug + Resource Scope, OR active Delegation Grant) as the universal authorization contract; slugs only, never role or plan names; binding to Doc-2 §7 by pointer; platform-staff slug space separation; the declaration syntax. **AI-Agent escalation rule:** if a contract requires a permission with no existing slug in Doc-2 §7, the author (human or agent) MUST escalate for a Doc-2 patch decision — inventing slugs in a Doc-4 document is a conformance failure.
- **Why Doc-4A:** One declaration grammar prevents per-module invention; the escalation rule closes the most likely AI-agent failure path.
- **Dependencies:** §5; references Doc-2 §7.
- **Detail level:** Full normative grammar + one worked declaration example using an existing slug.

## §6B — Delegation Grant Declaration Standard

- **Purpose:** Define the explicit declaration syntax for delegation-authorized operations (Architecture §6.5, §7.3, ADR-005): which endpoints are delegation-eligible and which never are; how a contract declares the grant requirements (active grant, permission_set coverage, validity window, vendor-profile scope); attribution rules as contract assertions — actions record the acting representative organization AND the represented vendor profile; quota consumption attributed to the vendor profile's Controlling Organization; audit attribution for delegated actions; grant suspension/revocation effects on in-flight operations (e.g., document-grant removal per PATCH-02).
- **Why Doc-4A:** Delegation is the platform's most unusual authorization path; without one declaration syntax, each module document encodes grants differently and attribution rules diverge.
- **Dependencies:** §5, §6, §17, §19; references Architecture §6.5/§7.3–7.4, Doc-2 delegation entities.
- **Detail level:** Full normative declaration syntax + attribution rules.

## §7 — Multi-Tenancy, Visibility & Non-Disclosure Standard

- **Purpose:** Define tenant behavior at the API surface: the four tenancy classes (Doc-2 §0.4) and the visibility behavior each implies; grant-based shared access as the only cross-tenant read paths; RLS as backstop, never the authorization model; and — normative home — the platform-wide **non-disclosure indistinguishability invariant**: blacklist/exclusion/private-CRM facts must be undetectable through any surface channel — errors, list contents, counts, ordering, pagination totals, timing. Buyer Vendor Status is never vendor-facing through any contract.
- **Why Doc-4A:** A hard security invariant (ADR-007 Amendment C, Doc-3 §12.1) must be defined once, surface-wide; §10 and §12 bind to it.
- **Dependencies:** §5, §6; referenced by §4B, §10, §12.
- **Detail level:** Full normative rules including the indistinguishability test ("an excluded vendor's observable responses must be identical to a never-matched vendor's").

## §8 — Identifier & Entity Reference Standard

- **Purpose:** UUIDv7 as the only canonical identifier in payloads and cross-references; `human_ref` as display/lookup convenience (lookup MAY accept it; payload references MUST use UUIDv7); identifiers never change, human refs never reused; cross-module references use entity-named UUID columns (Doc-2 §0.3); documents and files referenced by document/version ID, never by URL or blob.
- **Why Doc-4A:** Prevents a second reference path; version-ID referencing is required by ADR-010 and audit rules.
- **Dependencies:** §3; references Architecture §17.2, Doc-2 §0.1.
- **Detail level:** Short, fully normative.

## §9 — Request Contract Standard

- **Purpose:** Standardize request payloads: required/optional notation; **timestamp standard (normative): all timestamps in contracts are ISO-8601 with explicit UTC offset, stored and exchanged in UTC; date-only fields are ISO-8601 calendar dates; the platform clock reference is server time** (the frozen corpus is silent; Doc-4A fixes this as a convention, consistent with the Change Management Rule); money as `{amount, currency}` with `BDT` default (Doc-2 §0.4); enums sourced only from Doc-2 states/values; structured-reason fields where state machines require them; input size and file-reference constraints; no tunable values inline (POLICY keys per §18).
- **Why Doc-4A:** Money and time must be identical in all module documents.
- **Dependencies:** §3, §8, §18.
- **Detail level:** Full normative conventions + micro-examples (field shapes only).

## §10 — Response & List Contract Standard

- **Purpose:** Standard response envelope; entity representation rule (owning module defines its entity's representation once; consumers never reshape); list contracts — pagination, filtering, sorting grammar; the **exclusion-consistency rule**: soft-deleted, non-disclosed, and routing-excluded rows are absent from items, counts, and totals identically (binds to §7); derived/computed field disclosure; redaction-aware representation.
- **Why Doc-4A:** One pagination scheme; exclusion consistency is where tenancy meets list mechanics.
- **Dependencies:** §3, §7, §9.
- **Detail level:** Full normative grammar + envelope/list micro-examples.

## §11 — Validation Standard

- **Purpose:** The universal validation order every mutating contract declares: schema → context/membership → permission slug → tenancy/scope → state-machine gate → business rules → POLICY-bound limits; the expression format for the Validation Rules template field; POLICY-derived limits referenced by key (Doc-3 §12.2), never by value.
- **Why Doc-4A:** A fixed order makes behavior deterministic and the template field fillable consistently. Normative-home rule: §11 owns *what is checked and in what order*; §12 owns *how rejection is expressed*; §13 owns *state-gate semantics*.
- **Dependencies:** §6, §7, §13, §18.
- **Detail level:** Full normative ordering + expression format.

## §12 — Error Taxonomy & Status Semantics Standard

- **Purpose:** Transport-neutral platform error model: canonical error classes (validation, authorization, not-found/no-access, state-transition rejection, conflict/concurrency, quota/rate exceeded, async-pending, system failure); structured error payload (code, message, field errors, retryability); per-module error-code namespaces (Appendix B); the security-safe error policy: no-access and not-found indistinguishable where §7 requires; transition rejections never leak other tenants' facts. A non-normative annex MAY map error classes to HTTP statuses.
- **Why Doc-4A:** One taxonomy with reserved namespaces; neutrality and non-disclosure most often erode here.
- **Dependencies:** §7, §11; Appendix B.
- **Detail level:** Full normative taxonomy + payload shape. HTTP mapping explicitly non-normative.

## §13 — State Machine Interaction Standard

- **Purpose:** How contracts interact with the frozen state machines (Doc-2 §5 + patches, cited per §3 patch-citation rule): State Machine Effects declared as legal transitions only — no contract may introduce a transition; illegal-transition rejection semantics; version-immutability consequences; terminal states never reopened; system-actor transitions never user-invocable; actor-restricted transitions declared.
- **Why Doc-4A:** The firewall stopping Doc-4B…4N from quietly extending frozen state machines.
- **Dependencies:** §3, §11, §12; references Doc-2 §5.
- **Detail level:** Full normative rules + declaration syntax for the State Machine Effects field. No state machine restatement.

## §14 — Idempotency & Concurrency Standard

- **Purpose:** Mutation safety: idempotency-key requirement for unsafe operations and duplicate-request behavior — same result, **no duplicate audit record, no duplicate outbox event** (joint rule with §16/§17); optimistic-concurrency convention for updates; retry semantics aligned with §12 retryability flags. Key format details deferred to development documents.
- **Why Doc-4A:** The no-double-emit rule is unstateable per-module without divergence.
- **Dependencies:** §12, §16, §17.
- **Detail level:** Full normative rules; no implementation formats.

## §15 — Asynchronous Operation Standard

- **Purpose:** The contract pattern for async-by-default work (matching, routing, notifications, document generation, imports): accepted-then-processing pattern; progress/outcome observation; synchronous facades over async engines forbidden; the no-fabricated-activity rule (Doc-3 §12.1 FIXED) as an async-surface constraint; Supabase Realtime positioned as a delivery channel only, never a source of truth or contract substitute.
- **Why Doc-4A:** Every module has async flows; one pattern prevents per-document job-status idioms.
- **Dependencies:** §10, §12, §16.
- **Detail level:** Full normative pattern + status representation shape. Job infrastructure deferred.

## §16 — Event Contract Standard

- **Purpose:** Event-side contract obligations: transactional outbox as contract requirement; event naming and `event_name`/`event_version` rules; thin payloads; consumer idempotency as contract obligation; declaration syntax for Events Produced / Events Consumed (Authoring Rule 7) and integration fields (Authoring Rule 8); event additions only under the owning module per Doc-2 §8 — Doc-4 documents bind to the catalog, never extend it.
- **Why Doc-4A:** The declaration grammar must be identical everywhere or the integration index (Doc-4L) cannot be assembled.
- **Dependencies:** §4, §14; references Doc-2 §8.
- **Detail level:** Full normative grammar + payload schema notation. No catalog restatement.

## §17 — Audit Declaration Standard

- **Purpose:** How endpoints declare Audit Requirements: binding to Doc-2 §9 by pointer; minimum fields and actor-type attribution (including delegated attribution per §6B) as contract assertions; audit ≠ events (both declared, separately); redaction interaction (record permanence, not field permanence); document versions referenced by ID, never blobs.
- **Why Doc-4A:** "No module may bypass audit" is enforceable only via a uniform, reviewable declaration.
- **Dependencies:** §5, §6B, §14, §16; references Doc-2 §9, Architecture §14.
- **Detail level:** Normative declaration grammar. No audit matrix restatement.

## §18 — Policy, Configuration & Entitlement Binding Standard

- **Purpose:** How contracts bind to tunable behavior: the FIXED / POLICY / ORG trichotomy (Doc-3 §12) at the contract surface — FIXED rules as invariant behavior; POLICY values referenced by `core.system_configuration` key, never by value; ORG settings read per-organization; entitlement checks by entitlement key via the Monetization service, never plan names; firewall restated: entitlements may gate visibility/volume/features, never trust, verification, eligibility, routing fairness, or matching confidence (binds to §4B).
- **Why Doc-4A:** Hardcoded tunables and plan-name checks are the two most likely authoring errors; this makes both detectable in review.
- **Dependencies:** §4B, §6, §11; references Doc-3 §12, ADR-011.
- **Detail level:** Full normative binding rules + reference syntax.

## §18B — Platform Operating Stage Contract Behavior Standard

- **Purpose:** Define how contracts declare stage-dependent behavior across the marketplace maturity model (Stage A Founder-Assisted, Stage B Assisted, Stage C Autonomous; Doc-3 §0, `platform.operating_stage` global + per-cell): stage variation is expressed only as POLICY-bound behavior (per §18), never as separate endpoints or alternate workflows; the declaration syntax for stage-sensitive contract behavior; the FIXED constraints restated as contract rules — stage transitions are platform decisions, never tenant decisions; human-assisted routing (any stage, founder included) never bypasses blacklist/eligibility/verification/trust; stage tuning touches POLICY values only, never FIXED rules.
- **Why Doc-4A:** Contracts must work identically across stages with only policy-tuned behavior differing; without a declaration standard, Stage-A operational shortcuts would leak into contract design as alternate workflows.
- **Dependencies:** §13, §18; references Doc-3 §0, §12.1–12.2.
- **Detail level:** Normative declaration syntax + the stage-invariance rules. No stage playbook content (Doc-3 owns operations).

## §19 — Rate Limiting, Quota & Abuse Control Declaration Standard

- **Purpose:** Declaration pattern for contract-relevant throughput controls: where rate limits and quotas attach (quotation quota consumed from the vendor profile's Controlling Organization, including via delegation per §6B); quota-exceeded and rate-limited as standard error classes; abuse limits bound to POLICY keys only; suspension/lockout surface behavior consistent with §7 disclosure rules.
- **Why Doc-4A:** Quota attribution crosses modules and must be declared identically everywhere.
- **Dependencies:** §6B, §7, §12, §18.
- **Detail level:** Normative declaration pattern only. No limit values (POLICY).

## §20 — Contract Versioning & Evolution Standard

- **Purpose:** How Doc-4 contracts evolve after freeze: contract versioning ≠ domain versioning; backward-compatible vs breaking change definitions; deprecation declaration pattern; alignment with event versioning (§16) and document versioning (ADR-010). Includes the normative **Contract Change vs Domain Change Decision Table**: for each change category (new optional field, new required field, new enum value, new state/transition, new entity, new permission slug, new event, new POLICY key, payload reshape, error-code change…), the table states whether it is a contract change (Doc-4 patch), a domain change (Doc-2/Doc-3 patch via change management), or forbidden — with the escalation route for each.
- **Why Doc-4A:** The decision table makes the contract/domain boundary mechanical for AI agents and reviewers; without it, "small" contract edits become silent domain changes.
- **Dependencies:** §0, §13, §16; references Doc-4_Governance_Note_v1.0.
- **Detail level:** Short normative rules + the complete decision table.

## §21 — Canonical Contract Templates

- **Purpose:** Fixed-field-order, controlled-vocabulary templates:
  - **21.1 Endpoint Contract Template (MANDATORY)** — the ten fields of Authoring Rule 7, each with fill-in grammar defined in §§6–18B (including, where applicable, the §4B firewall-compliance declaration and §6B delegation declaration).
  - **21.2 Integration Contract Template (MANDATORY)** — the eight fields of Authoring Rule 8, plus source-module authorship per §4.
  - **21.3 Internal Service Contract Template (RECOMMENDED)** — for synchronous cross-module service calls; carries the same authorization/tenancy/audit declaration obligations when used. RECOMMENDED, not mandatory: the Doc-4 Authoring Rules mandate only 21.1/21.2; this status may be elevated only by amending the Authoring Rules.
  - **21.4 Event Schema Declaration Template (RECOMMENDED)** — name, version, payload shape, emitter, consumers, idempotency note. Same RECOMMENDED status and rationale as 21.3.
- **Why Doc-4A:** Parallel authors and AI agents produce consistent documents only from templates with fixed field order and controlled vocabulary.
- **Dependencies:** Composition of §§3–20.
- **Detail level:** Maximum — complete templates with per-field fill instructions and one fully worked illustrative instantiation using an existing Doc-2 entity (marked non-normative).

## Appendix A — Doc-4 Conformance Checklist (Machine-Executable)

- **Purpose:** The review gate for every Doc-4B…4N document before freeze, **structured for AI-agent execution**: every check has a stable check ID (CHK-xxx), a binary pass/fail criterion, the Doc-4A section it derives from, and the authoritative source to verify against. Coverage includes: every endpoint uses Template 21.1; no new entities/states/transitions; permission slugs exist in Doc-2 §7 (else escalation per §6); events exist in Doc-2 §8; audit actions exist in Doc-2 §9; POLICY referenced by key; non-disclosure test passes; governance-signal firewall declarations present (§4B); delegation declarations present where applicable (§6B); stage behavior POLICY-bound only (§18B); integration authored by source module; no restated normative content. Doubles as QA's contract-acceptance baseline and the agent self-check protocol (run before submitting any Doc-4 document for review; report check IDs failed).
- **Why Doc-4A:** Standards without an executable gate decay; check IDs make conformance reportable and automatable.
- **Dependencies:** All sections.
- **Detail level:** Complete, mechanically checkable list with IDs, criteria, and source pointers.

## Appendix B — Reserved Namespace Registry

- **Purpose:** Central collision-prevention registry: per-module error-code prefixes; event-name ownership (pointer to Doc-2 §8); permission-slug prefixes (`can_*` org space, `staff_*` platform space); human_ref prefixes (pointer to Doc-2 §0.1); POLICY key domains (pointer to Doc-3 §12.2). New registrations require a Doc-4A patch, never module-document invention (per Governance Note rule 5).
- **Why Doc-4A:** Ten documents authored in parallel collide without one registry; pointer-style entries avoid duplicating owning sources.
- **Dependencies:** §3, §12, §16; Doc-2 §§0.1, 7, 8; Doc-3 §12.2.
- **Detail level:** Registry table, pointer-heavy.

## Appendix C — Cross-Reference Index

- **Purpose:** One table mapping every Doc-4A binding point to its authoritative source (Architecture section, ADR, Doc-2 section, Doc-3 section, patch ID per §3 citation rule), so authors and agents resolve references without searching and reference-never-restate is auditable.
- **Why Doc-4A:** Operationalizes the precedence chain for AI agents.
- **Dependencies:** All sections.
- **Detail level:** Pointer table only.

---

*End of Doc-4A Canonical Structure v1.0 — FROZEN. Doc-4A content authoring proceeds against this structure; any structural change requires a patch under Doc-4_Governance_Note_v1.0.*
