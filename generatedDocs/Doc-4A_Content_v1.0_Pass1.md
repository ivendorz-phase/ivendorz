# Doc-4A — API Standards & Conventions — Content v1.0, Pass 1 (§0–§3)

| Field | Value |
|---|---|
| Document | Doc-4A — API Standards & Conventions |
| Pass | 1 of N — Sections §0–§3 only |
| Structure | Conforms to Doc-4A_Structure_v1.0_FROZEN.md (canonical TOC; structural change requires patch) |
| Authority | Doc-4_Governance_Note_v1.0.md |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (v1.0.2 + Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3), Doc-3 v1.0.2 (v1.0.1 + Doc-3_Patch_v1.0.2) — all FROZEN |
| Contains | Standards only — no entities, no workflows, no endpoints, no module contracts |
| Audience | Claude Code, Cursor, AI development agents, backend, frontend, QA engineers |

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Authority and Precedence

Doc-4A derives its authority from **Doc-4_Governance_Note_v1.0**, which ratifies the extended precedence chain:

```
Master Architecture → ADR Compendium → Doc-2 → Doc-3 → Doc-4A → Doc-4B…4N
```

- Doc-4A **MUST NOT** override, reinterpret, or weaken any rule in a higher-precedence document. On conflict, the higher document prevails automatically and Doc-4A **MUST** be patched.
- Every Doc-4 descendant (Doc-4B…4N) **MUST** conform to Doc-4A in full. A descendant document **MUST NOT** locally deviate from, restate-with-modification, or "extend for convenience" any Doc-4A standard.
- A descendant document that fails any conformance check (Appendix A) **MUST NOT** be frozen.

### 0.2 Scope of Authority

Doc-4A defines **standards only**. Doc-4A:

- **MUST NOT** define business entities, workflows, states, transitions, permissions, events, audit actions, or POLICY keys. Those are owned by Doc-2 and Doc-3.
- **MUST NOT** define endpoints, service contracts, or integrations. Those are owned by the module documents (Doc-4B…4K) under the family map in §1.3.

### 0.3 Reference-Never-Restate Doctrine

Normative content owned by a higher document **MUST** be incorporated by pointer, never by copy.

- A Doc-4 document **MUST NOT** reproduce the permission catalog (Doc-2 §7), the event catalog (Doc-2 §8), the audit matrix (Doc-2 §9), any state machine (Doc-2 §5), or any POLICY key inventory or value (Doc-3 §12).
- A Doc-4 document **MAY** quote a single named item (one slug, one event name, one state name) verbatim where a contract binds to it, and **MUST** cite its source when doing so.
- Illustrative examples **MUST** be marked non-normative and **MUST** use only items that exist in the frozen corpus.
- Rationale: a restated catalog desynchronizes at the first upstream patch and becomes a competing source of truth, violating the One-Business-Truth-One-Source principle (Master Architecture §23, Principle 2).

### 0.4 Change Management

- After freeze, Doc-4A changes only through approved patch documents with minimal additive scope, following the corpus patch convention (see the patch citation rule, §3.5).
- A change that alters the domain (new entity, state, transition, permission, event, POLICY key) is **never** a Doc-4A change: it **MUST** be escalated as a Doc-2/Doc-3 change-management decision. The normative boundary is defined by the Contract Change vs Domain Change Decision Table (§20).
- Reserved namespaces (Appendix B) are allocated only by Doc-4A patch (Governance Note, rule 5).

### 0.5 Internal Completeness

Every Doc-4 document **MUST** be internally complete. The phrases "to be defined later", "implementation specific", and "TBD" (and equivalents) **MUST NOT** appear in normative content. Where detail is legitimately owned elsewhere, the document **MUST** state the owning document by pointer instead.

### 0.6 Conflict Handling (Flag-and-Halt)

Any author — human engineer or AI agent — who discovers that a Doc-4A rule cannot be satisfied without violating a higher-precedence document **MUST**:

1. Halt authoring of the affected contract.
2. Record the conflict (both citations, by pointer).
3. Escalate for a change-management decision.

Authors **MUST NOT** resolve such conflicts by local interpretation, silent workaround, or invention. This applies the Build Governance rule for AI agents (Master Architecture §22.7) to document authoring.

---

## §1 — Scope, Audience & Doc-4 Family Map

### 1.1 What Doc-4A Governs

Doc-4A governs, for every Doc-4 descendant: terminology, naming, and notation (§3); module ownership and API surface topology (§4, §4B); request context, authorization, delegation, and tenancy declaration (§5–§7); identifiers (§8); request, response, and list conventions (§9–§10); validation order (§11); error taxonomy (§12); state-machine interaction (§13); idempotency and concurrency (§14); asynchronous operation patterns (§15); event and audit declaration grammars (§16–§17); policy, entitlement, and operating-stage binding (§18, §18B); rate-limit and quota declaration (§19); contract evolution (§20); contract templates (§21); and the conformance gate (Appendix A).

### 1.2 What Doc-4A Does Not Govern

Doc-4A **MUST NOT** be read as governing, and Doc-4 descendants **MUST NOT** cite it for:

| Out of Doc-4A scope | Owner |
|---|---|
| Actual endpoint and integration contracts | Doc-4B…4K module documents |
| Transport binding (HTTP/REST/GraphQL specifics, OpenAPI), framework conventions (route handlers, server actions), ORM/migration standards, contract-test tooling, observability and health endpoints | Development Decomposition / development documents |
| POLICY default values and tuning | `core.system_configuration` ratification track (Doc-3 §12) |
| Notification policy matrix (ADR Compendium §E, open item 5) | Doc-4H Communication. Until Doc-4H is authored, no Doc-4 document may invent interim notification contracts; events route to Communication per Doc-2 §8 consumer mapping. |
| Frontend consumption patterns and UI contracts | Frontend development documents |
| Operational playbooks and marketplace stage operations | Doc-3 (Sections 0, 10–12) |

### 1.3 Doc-4 Family Map

The Doc-4 family mirrors module ownership (ADR-017; Master Architecture §16). Each module document owns the contracts of exactly one module; the integration single-authorship rule (§4) governs cross-module material.

| Document | Scope (Module) |
|---|---|
| **Doc-4A** | API Standards & Conventions (this document) |
| **Doc-4B** | Platform Core / Shared Kernel service contracts (Module 0: audit, outbox, ID generation, system configuration, feature flags) |
| **Doc-4C** | Identity & Organization (Module 1) |
| **Doc-4D** | Marketplace & Discovery (Module 2) |
| **Doc-4E** | RFQ Procurement Engine (Module 3) |
| **Doc-4F** | Business Operations Engine (Module 4) |
| **Doc-4G** | Trust & Verification (Module 5) |
| **Doc-4H** | Communication (Module 6) |
| **Doc-4I** | Monetization (Module 7; includes the entitlement key catalog) |
| **Doc-4J** | Admin Operations (Module 8) |
| **Doc-4K** | AI Layer contracts (Module 9; advisory-only per Master Architecture §18) |
| **Doc-4L** | Cross-Module Integration & Event Flow Index — a non-normative index assembled from source-module-owned contracts; it defines nothing and **MUST NOT** be cited as a contract source |

Rules:

- A contract **MUST** appear in exactly one module document — the document of its Owner Module.
- Changes to this family map (splitting or merging documents) **MUST** be made by Doc-4A patch, never informally.

### 1.4 Audience Contract

Doc-4 documents are written to be executed by AI coding agents and reviewed by humans. Therefore every Doc-4 document **MUST**: use the normative keywords of §3.4 exactly; use the templates of §21 with fixed field order; satisfy the machine-executable checklist (Appendix A) before review submission; and prefer enumerated rules over prose where a rule is checkable.

---

## §2 — Contract Design Philosophy & Implementation Neutrality

This section translates the frozen doctrine (Master Architecture §22.7, §23) into contract-authoring rules. It adds no new principles; each rule cites its source.

### 2.1 Contract-First

Contracts are authored, frozen, and reviewed before implementation. Implementation **MUST** conform to the frozen contract; a contract **MUST NOT** be retrofitted to match code. (Master Architecture §22.7; Doc-4 Authoring Rules 10, 12.)

### 2.2 Implementation Neutrality

- Contracts **MUST** be expressed transport-neutrally: no assumption of REST-only, GraphQL-only, RPC-only, or any framework behavior (Doc-4 Authoring Rule 9).
- Contracts **MUST** specify behavior in terms of: operation purpose, owner module, actor and context, inputs, outputs, validation order, state effects, audit, and events — never in terms of URLs, verbs, status codes, or wire formats.
- A non-normative transport-mapping annex is permitted only where §12 allows it, and **MUST** be marked non-normative.

### 2.3 Determinism and Explainability

- Contract behavior **MUST** be deterministic: identical inputs in identical state produce identical outcomes. Where behavior is policy-tuned, the contract **MUST** name the POLICY key (§18) so the variability is explicit and auditable (Doc-3 §12.4; Master Architecture §23, Principle 19).
- Routing-, matching-, and scoring-adjacent contracts **MUST** preserve explainability: every decision a contract surfaces must be reconstructible from recorded data (Master Architecture §14.6; Doc-3 §3, by pointer). No magic scoring; no hidden business logic.

### 2.4 Auditable by Construction

Every mutating contract **MUST** declare its audit obligations (§17) and event emissions (§16) as first-class contract fields, not as implementation afterthoughts. A mutating contract with no audit declaration is nonconforming (Doc-2 §9 binding; Master Architecture §14).

### 2.5 AI-Agent Authoring Rules

For Claude Code, Cursor, and other AI agents authoring or implementing against Doc-4 documents:

- Agents **MUST** treat frozen-corpus invariants as hard constraints and **MUST** apply flag-and-halt (§0.6) on conflict; agents **MUST NOT** work around invariants (Master Architecture §22.7).
- Agents **MUST NOT** invent names: every entity, state, permission slug, event, or POLICY key referenced must already exist in the frozen corpus; missing items are escalated (§6 escalation rule; §0.4).
- Agents **MUST** run Appendix A and report check IDs before submitting any Doc-4 document or implementation for review.
- Agents **SHOULD** prefer the smallest conforming construction; clever-but-opaque solutions are nonconforming by doctrine (Project AI Development Rules; Master Architecture §23, Principle 21).

### 2.6 Smallest-Change Doctrine

Where a contract need can be met either by composing existing standards or by proposing a new standard, authors **MUST** compose. New standards enter only by Doc-4A patch, and only when composition demonstrably fails (Change Management Rule).

---

## §3 — Canonical Terminology, Naming & Notation Standard

### 3.1 Vocabulary Sourcing

- **Entity names** **MUST** be used exactly as defined in Doc-2 §3 (Entity Catalog), including table naming (`schema.table_name`). No synonyms, abbreviations, or alternate names.
- **State names** **MUST** be quoted verbatim from Doc-2 §5 (as amended; cite per §3.5). Contracts **MUST NOT** rename, alias, or paraphrase states (e.g., the state after moderation pass is exactly `under_review`, never "in review").
- **Module names and numbers** **MUST** follow ADR-017 / Master Architecture §16; schema names **MUST** follow Doc-2 §0.3.
- **Tenancy class terms** (`tenant-owned`, `platform-owned`, `shared`, `derived`) **MUST** follow Doc-2 §0.4.
- **Marketplace terms** (operating stages, routing modes, value bands, quality bands, FIXED/POLICY/ORG) **MUST** follow Doc-3 (Sections 0, 3, 5, 12, by pointer).
- Where the corpus offers no term for a concept a contract needs, the author **MUST** escalate (§0.6) rather than coin one. Doc-4 documents introduce no business terminology.

### 3.2 Naming Conventions

| Element | Convention | Source of truth for instances |
|---|---|---|
| Field names | `snake_case`, singular noun (collections plural); booleans phrased as predicates (`is_…`, `has_…`, or domain flags as defined in Doc-2) | Doc-2 §3, §10 |
| Identifier fields | `id` (own key); cross-references named for the target entity, e.g. `vendor_profile_id`, `organization_id` — never generic `ref` suffixes | Doc-2 §0.1, §0.3 |
| Human references | `human_ref` field; uppercase prefixed format (e.g., `RFQ-2026-000123`) | Doc-2 §0.1 |
| State / enum values | lowercase `snake_case`, verbatim from Doc-2 §5 / entity definitions | Doc-2 §5, §3 |
| Event names | `PascalCase`, past-tense fact (e.g., `RFQSubmitted`); existence and ownership per catalog | Doc-2 §8 |
| Permission slugs | `can_*` (organization space), `staff_*` (platform space); existence per catalog | Doc-2 §7 |
| POLICY keys | dotted lowercase `domain.key_name`; existence per inventory | Doc-3 §12.2 |
| Operation names (contract titles) | imperative verb + owned entity, using only corpus verbs for state transitions (submit, approve, withdraw, cancel, claim, verify, suspend…) | Doc-2 §5 transition labels |
| Error codes | namespaced per module prefix | Appendix B |

Doc-4 documents **MUST NOT** define new instances in any "source of truth" column above; they bind to existing instances by pointer (§0.3).

### 3.3 Contract Notation

All Doc-4 contracts use one transport-neutral notation:

- **Contract blocks** are structured field tables in the fixed field order of the governing template (§21). Field order **MUST NOT** vary between contracts or documents.
- **Payload shapes** are expressed as field lists: `field_name : type : required|optional : constraint/source pointer`. Types are the abstract set `string, integer, decimal, boolean, timestamp, date, uuid, enum(<source pointer>), money, object, list<…>` — never language- or wire-format types. `money` is the `{amount, currency}` pair of Doc-2 §0.4. `timestamp`/`date` follow §9.
- **Pointers** are written as `<Document> §<section>` (e.g., `Doc-2 §7`), with patch citation per §3.5.
- **Examples** **MUST** be fenced, labeled `Example — non-normative`, and use only frozen-corpus items.
- Prose **MAY** connect rules but **MUST NOT** carry a normative requirement that is absent from a rule line or contract block.

### 3.4 Normative Keywords

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **RECOMMENDED** are normative and carry their RFC-2119 meanings:

- **MUST / MUST NOT** — absolute requirement/prohibition; violation is a conformance failure (Appendix A).
- **SHOULD / SHOULD NOT** — default expectation; deviation requires a recorded, reviewable justification in the deviating document.
- **RECOMMENDED** — as SHOULD; additionally used as a template status marker (§21.3, §21.4): a RECOMMENDED template is not required by the Authoring Rules, but **if used, its rules are MUST-level**.

Lowercase forms of these words are non-normative. No other emphasis (bold, capitals) creates a requirement.

### 3.5 Patch Citation Rule

References to patched sources **MUST** cite the base document section **and** the patch ID where the patch is material to the cited content:

```
Example — non-normative:
"Doc-2 §5.4 as amended by PATCH-D2-01 (moderation rejection edge)"
"Doc-3 §10 as amended by PATCH-D3-01"
```

- When a patched base document is reissued with patches integrated, citations to "base + patch ID" remain resolvable; citation-by-version-only is **NOT RECOMMENDED** in contract bodies.
- Doc-4 documents **MUST** name the exact corpus versions they conform to in their header table, in the form used by this document's header.

### 3.6 Prohibited Terminology

Doc-4 documents **MUST NOT** use: role names as authorization conditions (use slugs; Doc-2 §7); plan names as entitlement conditions (use entitlement keys; ADR-011); "delete" for soft-delete semantics (use the Doc-2 §0.2 soft-delete vocabulary); "blacklist visibility", "excluded vendor list", or any phrasing implying disclosure of exclusion facts (see §7); and informal synonyms for governance signals (the five signal names of Master Architecture §1.5 are canonical and exhaustive).

---

*End of Doc-4A Content v1.0 — Pass 1 (§0–§3). Review findings extracted to Doc-4A_Review_Log.md (non-normative).*
