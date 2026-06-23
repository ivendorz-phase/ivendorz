# Doc-5A — API Realization Standards — Content v1.0, Pass 1 (§0–§2)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 1 of N — Sections §0–§2 only |
| **Status** | ACTIVE — Content Pass 1 of N; §0–§2 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Contains | Realization standards only — no entities, no workflows, no endpoints, no status tables, no headers, no schemas, no module contracts |
| Audience | Architecture Board · API Governance Board (ratification and review) · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · Claude Code, Cursor, AI development agents · backend, frontend, QA engineers |

> **Realize, never re-decide.** Doc-4A fixed *what every contract must declare* (transport-neutral). Doc-5A fixes *how each declaration becomes a concrete, callable API on the bound transport*. Every abstract rule is bound to its owner **by pointer**; Doc-5A never restates or re-decides it.

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Authority and Precedence

Doc-5A derives its authority from **`Doc-5_Program_Governance_Note_v1.0`**, which places the Implementation Contracts program below the frozen corpus and extends the precedence chain by one realization level:

```
Master Architecture → ADR Compendium → Doc-2 · Doc-3 → Doc-4A → Doc-4B…4M → Doc-5A → Doc-5B…5M → Code
                                                                         (sibling programs: Doc-6 DB · Doc-7 Frontend · Doc-8 Tests)
```

- Doc-5A **MUST NOT** override, reinterpret, or weaken any rule in a higher-precedence document. On conflict, the higher document prevails automatically and Doc-5A **MUST** be patched.
- Every Doc-5 descendant (Doc-5B…5M) **MUST** conform to Doc-5A in full. A descendant **MUST NOT** locally deviate from, restate-with-modification, or "extend for convenience" any Doc-5A standard.
- A descendant that fails any conformance check (Appendix A) **MUST NOT** be frozen.

### 0.2 Scope of Authority

Doc-5A governs **how the abstract Doc-4 contracts are realized as concrete APIs on the bound transport** for every Doc-5 module document. It governs the wire realization layer only.

Doc-5A **does NOT** govern:
- *What* a contract declares — owned by **Doc-4A §§0–21** (Doc-5A realizes, never re-decides).
- Domain facts — entities (Doc-2 §§2–3), permission slugs (Doc-2 §7), events (Doc-2 §8 / Doc-4J), audit actions (Doc-2 §9), state machines (Doc-4M), POLICY keys (Doc-3 §12). These are bound **by pointer**.
- Persistence (Doc-6), frontend consumption (Doc-7), test cases (Doc-8), and framework/transport implementation code (development documents).

### 0.3 Realize-Never-Redecide Rule

- Doc-5A **MUST** bind each abstract standard to its Doc-4A (or corpus) owner by pointer (Appendix C) and **MUST NOT** copy, paraphrase-with-change, or re-decide it.
- Where Doc-4A and the corpus are **silent on a purely transport-level realization detail**, Doc-5A **MAY** fix a realization convention — this is a convention, not an architecture change, and **MUST** contradict nothing upstream.
- Where authority for a *declared* element is **missing** (a slug, event, transition, audit action, POLICY key, entity, or contract field that does not exist in the frozen corpus), Doc-5A **MUST** **flag and halt** and escalate per `Doc-5_Program_Governance_Note_v1.0 §7`. Doc-5A **MUST NOT** invent it.

### 0.4 Amendment After Freeze

- After freeze, Doc-5A changes **only through an approved additive patch** of minimal scope (`Doc-5_Program_Governance_Note_v1.0 §5`). A frozen Doc-5A is never reopened or rewritten.
- Reserved API-surface namespaces (route/namespace prefixes, error-code mappings, surface-version identifiers, standard-header names) are allocated **only by Doc-5A amendment** (Appendix B), never by module-document invention.
- Downstream documents **MUST** cite patched sources explicitly (e.g. base document pointer + patch identifier — format to be established by §3 canonical terminology).

### 0.5 Conformance Obligation

Before any Doc-5B…5M document may freeze, it **MUST** pass the **Doc-5 API Conformance Checklist (Appendix A)** in full. The checklist is machine-executable (`CHK-5A-xxx` IDs, binary pass/fail) and is the review gate for every downstream document; a failing check blocks freeze.

---

## §1 — Scope, Audience & Doc-5 Family Map

### 1.1 What Doc-5A Governs

Doc-5A is the **single, platform-wide realization metastandard** for the Doc-5 API family. It fixes the transport binding, wire serialization, standard header set, endpoint realization template, error→status mapping, identity/context carriage, pagination/filter/sort wire grammar, idempotency/concurrency carriage, async realization pattern, caller-observable event surface, and API surface versioning — together with the conformance checklist and reserved-namespace registry that make them enforceable.

Doc-5A **does NOT** contain any module's endpoints, integration flows, or per-entity state-machine surfaces; those are realized by the module documents below.

### 1.2 Doc-5 Family Map (Ratified)

| Document | Realizes | Role |
|---|---|---|
| **Doc-5A** | Doc-4A | API realization metastandard (this document) |
| **Doc-5B** | Doc-4B (M0 `core`) | Platform Core API realization |
| **Doc-5C** | Doc-4C (M1 `identity`) | Identity & Organization API realization |
| **Doc-5D** | Doc-4D (M2 `marketplace`) | Marketplace & Discovery API realization |
| **Doc-5E** | Doc-4E (M3 `rfq`) | RFQ Procurement API realization |
| **Doc-5F** | Doc-4F (M4 `operations`) | Business Operations API realization |
| **Doc-5G** | Doc-4G (M5 `trust`) | Trust & Verification API realization |
| **Doc-5H** | Doc-4H (M6 `comms`) | Communication API realization |
| **Doc-5I** | Doc-4I (M7 `billing`) | Monetization API realization |
| **Doc-5J** | Doc-4J (M8 `admin`) | Admin Operations API realization |
| **Doc-5K** | Doc-4K (M9 `ai`) | AI Layer API realization |
| **Doc-5L** | Doc-4L | API Integration Index (cross-module surface) |
| **Doc-5M** | Doc-4M | API State-Machine Surface (legal-transition endpoints only) |

Letter-to-module mapping mirrors the Doc-4 precedent and is fixed by the structure freeze.

### 1.3 Deferral List (Out of Doc-5A)

The following are explicitly deferred and **MUST NOT** appear in Doc-5A:
- Framework binding and transport implementation (Next.js App Router route handlers, server actions, Inngest job wiring, Supabase client config) → development documents / code.
- Database schema, migrations, indexes, Prisma → Doc-6.
- Frontend consumption, view-models, screens → Doc-7.
- Conformance / behavior test cases → Doc-8 (Doc-5A supplies the checklist, not the tests).
- POLICY values (page-size maxima, rate limits) → `core.system_configuration` (`Doc-3 §12`), referenced by key.
- Any external webhook / third-party push surface → **not in the frozen corpus; excluded** (§11; introduce only by architecture patch).

### 1.4 Audience

Architecture Board and API Governance Board (ratification and review); contract authors (human + AI) of Doc-5B…5M; AI Coding Supervisor; backend, frontend, and QA engineers consuming or validating the realized surface.

---

## §2 — API Realization Philosophy & Transport Binding

### 2.1 Realization Doctrine

Every Doc-5 realization **MUST** be:
1. **Deterministic and explainable** — identical inputs yield identical wire behavior; no implicit, environment-dependent surface variation (stage variation is POLICY-bound only, per `Doc-4A §18B`).
2. **Security-safe by construction** — the non-disclosure indistinguishability invariant (`Doc-4A §7`) holds at the wire: status, body, ordering, counts, totals, and timing **MUST NOT** reveal blacklist/exclusion/private facts (realized in §6 and §8).
3. **Contract-first** — the realized contract is authored and reviewed before any implementation; implementation conforms to the contract, never the reverse.
4. **Internally complete** — no "TBD" in a frozen realization; gaps are flagged and escalated (§0.3), never left ambiguous.
5. **Authored for AI-agent consumption** — agents instantiate the realization templates and run the checklist; on any conflict with a higher document an agent **MUST** flag and halt, never work around an invariant.

### 2.2 Transport Binding (Ratified)

- The bound transport for the Doc-5 API family is **HTTP**, consistent with the `ADR-001` technology stack and `Architecture §19` (Infrastructure & Deployment).
- All Doc-5 module documents **MUST** realize their contracts over HTTP. A module document **MUST NOT** bind a different transport for any contract.
- This binding is the realization decision `Doc-4A §2` deliberately left open (Doc-4A is transport-neutral). Binding HTTP here neither overrides nor weakens `Doc-4A §2`; it is the realization layer `Doc-4A §2` anticipates.

### 2.3 In-HTTP Surface Style (Deferred to §5)

The specific in-HTTP surface style — resource-oriented vs action-oriented operation modelling, method selection, and URL/path grammar — is realized in **§5 (Endpoint Realization Standard)** and is **not** decided in this pass. Pass-1 binds only the transport family; module authors **MUST NOT** assume a style before §5 is frozen.

### 2.4 Implementation Neutrality Above the Transport

Below HTTP, Doc-5A remains neutral about server framework, language runtime, and deployment topology — those are development/code concerns (§1.3). Doc-5A fixes the **observable wire contract**, not the implementation that produces it.

---

*End of Doc-5A Content v1.0, Pass 1 (§0–§2). Realization standards only — no endpoints, status tables, headers, schemas, or framework implementation. Sections §3–§12 and Appendices A–C follow in subsequent passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
