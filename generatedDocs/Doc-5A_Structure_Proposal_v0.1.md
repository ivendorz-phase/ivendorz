# Doc-5A Structure Proposal v0.1 — Canonical Structure for "API Realization Standards"

| Field | Value |
|---|---|
| **Status** | PROPOSED — for structure freeze, not content |
| **Produces** | The frozen Table of Contents for Doc-5A (the API Realization Metastandard) |
| **Scope** | Defines *what sections Doc-5A must contain, why each belongs, what is deferred elsewhere, and the review risks before structure freeze*. Structure only. |
| **Conforms To** | `Master_System_Architecture_v1.0_FINAL` · `ADR_Compendium_v1` · Doc-2 **v1.0.3** · Doc-3 **v1.0.2** · Doc-4A effective state (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6) · Doc-4B…4M v1.0 (`Doc-4_SERIES_FROZEN_v1.0`) — all FROZEN — and `Doc-5_Program_Governance_Note_v1.0` **(APPROVED)** |
| **Contains** | No API contracts, no endpoints, no request/response definitions, no status-code tables, no schemas, no transport implementation, no framework code — structure only |
| **Does Not Contain** | API endpoints · request/response examples · schemas · HTTP status mappings · header definitions · transport implementation · Next.js / Prisma / framework implementation · POLICY values |
| **Audience** | Architecture Board · API Governance Board · Claude Code / Cursor / AI development agents · backend · frontend · QA |

> **Authoring posture — Realize-never-redecide.** Doc-4A already fixed *what every contract must declare* (transport-neutral). Doc-5A fixes *how those declarations become concrete, callable API contracts on a chosen transport*. Every abstract rule is bound to its Doc-4A (or corpus) owner **by pointer**; Doc-5A adds only the realization layer and re-decides nothing frozen upstream.

---

## Part I — Role of Doc-5A in the Document Corpus

Doc-5A is the **API realization metastandard**. It does not define any module's API; it defines how every Doc-5 module document (Doc-5B…5M) turns its abstract Doc-4 contract into a concrete, wire-level API, so that ten module documents authored separately (by humans or AI agents, possibly in parallel) realize the same transport, serialization, status, header, pagination, idempotency, and versioning behavior, conform to the frozen corpus, and are mechanically reviewable.

### I.1 — Position in the Authority Chain

- **Purpose:** Fix Doc-5A's place: *below* Doc-4A, *above* all later Doc-5 module contracts and below nothing it may override. Extends the chain ratified in `Doc-5_Program_Governance_Note_v1.0 §3`: Master → ADRs → Doc-2 · Doc-3 → Doc-4A → Doc-4B…4M → **Doc-5A → Doc-5B…5M** [sibling programs: Doc-6 DB · Doc-7 Frontend · Doc-8 Tests] → Code.
- **Why it belongs in Doc-5A:** A realization metastandard with no ratified precedence is treated as advisory; module authors then bind transport decisions locally and diverge. The position must be stated once, here.
- **Dependencies:** `Doc-5_Program_Governance_Note_v1.0 §§1–3`; `00_AUTHORITY_MAP.md`.
- **Detail level:** Short, fully normative — precedence statement + conformance obligation. No restatement of the authority map (pointer only).

### I.2 — Relationship to Doc-4A (the load-bearing boundary)

- **Purpose:** State the abstract↔realization split precisely: Doc-4A owns *what a contract declares* (ownership, authorization, validation order, error taxonomy, event/audit declarations, canonical templates — `Doc-4A §§0–21`, transport-neutral by `Doc-4A §2`); Doc-5A owns *how each declaration is realized on the wire*. Doc-5A binds Doc-4A by pointer and **never restates or re-decides** it.
- **Why it belongs in Doc-5A:** This boundary is the single largest drift/duplication risk (Doc-5A could silently become a second source of truth). It must be the governing rule of the whole document.
- **Dependencies:** `Doc-4A §0` (precedence/conformance), `Doc-4A §2` (implementation neutrality).
- **Detail level:** Normative boundary statement + a per-section "realizes Doc-4A §X" mapping (Appendix C). No copied Doc-4A content.

### I.3 — Relationship to Doc-5 Module Contracts (Doc-5B…5M)

- **Purpose:** Define Doc-5A as the metastandard every module API document instantiates: module docs realize concrete endpoints **using Doc-5A's realization templates and the conformance checklist**, and may never locally deviate (`Doc-5_Program_Governance_Note_v1.0 §§5–6`).
- **Why it belongs in Doc-5A:** Ten module API documents are mutually consistent only if the realization grammar and the review gate live above them in one place.
- **Dependencies:** `Doc-5_Program_Governance_Note_v1.0 §4` (family pattern); Doc-4B…4M (the abstract contracts being realized).
- **Detail level:** Normative — the family map (Part II §1) and the conformance gate (Appendix A). No module endpoints.

### I.4 — Relationship to Doc-6 / Doc-7 / Doc-8

- **Purpose:** Draw the downstream boundaries: Doc-6 (Database) realizes persistence behind the API surface; Doc-7 (Frontend) consumes the API surface; Doc-8 (Tests) validates conformance against Doc-5A's checklist. Doc-5A defines the **API contract**, not storage, UI, or tests, and not the framework code that implements the transport.
- **Why it belongs in Doc-5A:** Without explicit downstream boundaries, Doc-5A absorbs schema, UI, or framework detail and stops being a contract.
- **Dependencies:** `Doc-5_Program_Governance_Note_v1.0 §2` (sub-program ordering).
- **Detail level:** Short — a deferral statement; the full allocation is Part III.

---

## Part II — Proposed Canonical Structure

> The user's candidate list (0–11) was reviewed. Result: all twelve are retained; three are renamed/rescoped; **four sections/appendices are added** (Standard Header Set, Conformance Checklist, Reserved-Namespace Registry, Cross-Reference Index). The candidate→proposed mapping and the rationale for each change are recorded in Part IV. Proposed numbering follows the Doc-4A precedent.

### §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Establish Doc-5A's precedence (Part I.1), the conformance obligation binding every Doc-5B…5M document, the post-freeze amendment rule (`Doc-5_Program_Governance_Note_v1.0 §5`), and the realize-never-redecide rule.
- **Why Doc-5A owns it:** The conformance obligation and precedence extension must be ratified once, at the root of the realization family.
- **Dependencies:** None (root section).
- **Detail level:** Short, fully normative. Precedence statement + conformance statement + amendment procedure. ~1 page.

### §1 — Scope, Audience & Doc-5 Family Map
- **Purpose:** Define what Doc-5A governs and explicitly does not; **propose the Doc-5 family allocation** the governance note deferred here — `5A` metastandard; `5B…5K` per module M0…M9 (`core`/`identity`/`marketplace`/`rfq`/`operations`/`trust`/`comms`/`billing`/`admin`/`ai`); `5L` API Integration Index (realizes `Doc-4L`); `5M` API State-Machine Surface (realizes `Doc-4M`) — mirroring the Doc-4 letter precedent. State the deferral list (framework binding, migrations, UI, test tooling, observability).
- **Why Doc-5A owns it:** Scope allocation is itself a consistency standard; the family map prevents two module docs claiming the same surface, and the deferral list keeps Doc-5A out of implementation.
- **Dependencies:** §0; `Doc-5_Program_Governance_Note_v1.0 §4`.
- **Detail level:** Normative scope + family-map table. The exact letter allocation is ratified at this structure freeze; no module content.

### §2 — API Realization Philosophy & Transport Binding
- **Purpose:** Translate `Doc-4A §2` (implementation neutrality) into the realization doctrine: Doc-5A is the **one place** transport is bound. Fix the transport family (HTTP, consistent with `ADR-001 (Technology Stack)` and `Architecture §19` infrastructure) and the realization principles (deterministic surface, security-safe by construction, contract-first, internally complete, authored for AI-agent consumption). **FLAG:** the *style within HTTP* (resource-oriented vs action-oriented surface) is a Doc-5A **content** decision to be ratified when content is authored — the structure only reserves the section.
- **Why Doc-5A owns it:** Every later section presupposes a chosen transport; binding it per-module fragments the surface.
- **Dependencies:** §0, §1; `Doc-4A §2`; `ADR-001 (Technology Stack)`; `Architecture §19`.
- **Detail level:** Compressed doctrine + the transport-binding decision. Pointers to `Doc-4A §2`/`ADR-001`, not restatement.

### §3 — Wire Naming & Serialization Standard
- **Purpose:** Realize `Doc-4A §3` (naming/notation), `§8` (identifiers), `§9` (request), `§10` (response) at the wire: serialization format (JSON), field-casing on the wire, the wire representation of money `{amount, currency}` and timestamps **exactly as fixed by `Doc-4A §9`** (bind, never re-fix), UUIDv7 as the only identifier in payloads with `human_ref` as display/lookup only, enum values sourced from Doc-2.
- **Why Doc-5A owns it:** Serialization drift across ten documents is the most common realization failure; money/time/identifier wire shape must be identical everywhere.
- **Dependencies:** §2; `Doc-4A §§3, 8, 9, 10`; Doc-2 §§0.1, 0.4, 3.
- **Detail level:** Full normative wire conventions + field-shape micro-notation (no endpoints).

### §4 — Transport Envelope & Standard Header Set **[ADDED]**
- **Purpose:** Define the one envelope and the closed set of standard headers every endpoint uses — request correlation/trace id, authentication carrier, active-organization context carrier, idempotency key (§9), concurrency precondition (§9), API surface version (§12), and pagination cursors (§8) — each bound to its owning standard.
- **Why Doc-5A owns it:** Headers appear in every endpoint of every module; without one registry they drift exactly as error-code namespaces would. (Resolves finding D5A-R3.)
- **Dependencies:** §3, §7, §8, §9, §12; Appendix B.
- **Detail level:** Full normative header registry (names + meaning + owning section). No values.

### §5 — Endpoint Realization Standard
- **Purpose:** The executable heart — realize the `Doc-4A §21.1` Endpoint Contract Template and `Doc-4A §4` surface topology as a concrete HTTP operation: method selection, URL/path grammar, placement of inputs (path/query/body), success-status families, and the request/response envelope binding. Every module endpoint is realized by instantiating this standard.
- **Why Doc-5A owns it:** AI agents and parallel authors produce consistent module docs only from a fixed realization template with controlled vocabulary.
- **Dependencies:** §2, §3, §4; `Doc-4A §§4, 21.1`.
- **Detail level:** Maximum — complete realization template + one *illustrative, non-normative* instantiation using an existing Doc-2 entity (not a real contract). No real endpoints.

### §6 — Error Realization & Status Mapping Standard
- **Purpose:** Make normative what `Doc-4A §12` left transport-neutral: the **error-class → HTTP-status mapping**, the wire error envelope (code, message, field errors, retryability), per-module error-code namespaces (Appendix B), and rate/quota responses (429 + retry signalling, realizing `Doc-4A §19`). **Preserves `Doc-4A §7` non-disclosure on the wire:** no-access and not-found are indistinguishable (status, body, timing) wherever §7 requires.
- **Why Doc-5A owns it:** Error semantics are where transport binding and non-disclosure most often erode; one mapping prevents per-module divergence and inference leaks.
- **Dependencies:** §5; `Doc-4A §§7, 12, 19`.
- **Detail level:** Full normative mapping + wire envelope. The non-disclosure indistinguishability invariant (`Doc-4A §7`) is **realized** as a wire assertion: no-access and not-found responses must be indistinguishable in status, body, and timing (bound to `Doc-4A §7` — never restated).

### §7 — Identity, Context & Authorization Realization Standard *(candidate "Authentication", rescoped)*
- **Purpose:** Realize `Doc-4A §5` (identity/actor/request context) and `§6` (authorization) on the wire: how authentication is carried (Supabase Auth bearer = authentication only), how the **server-validated active-organization context** is transported and validated against membership, how the four actor types and delegation-grant context enter a request. **Binds the normative rule (`Doc-4A §5`):** the org context, even if transported, is **never client-trusted** — the server validates it.
- **Why Doc-5A owns it:** Every endpoint presupposes this context carriage; realizing it per-module would fracture the tenancy guarantee.
- **Dependencies:** §4, §6; `Doc-4A §§5, 6`; `ADR-001 (Technology Stack)`.
- **Detail level:** Full normative context-carriage rules. No session/token implementation detail (deferred to dev/code).

### §8 — Pagination, Filtering & Sort Wire Grammar
- **Purpose:** Realize the `Doc-4A §10` list grammar on the wire: pagination model (cursor/offset), query-parameter names, sort and filter syntax, and page-size **bounds referenced by POLICY key, never hardcoded** (`Doc-4A §18` / `Doc-3 §12`). Enforces the **exclusion-consistency rule** at the wire: items, counts, and totals exclude soft-deleted / non-disclosed / routing-excluded rows identically (`Doc-4A §§7, 10`).
- **Why Doc-5A owns it:** Ten modules inventing ten pagination schemes is the canonical list-surface failure; exclusion-consistency is where tenancy meets wire mechanics.
- **Dependencies:** §3, §6; `Doc-4A §§7, 10, 18`; `Doc-3 §12`.
- **Detail level:** Full normative wire grammar + parameter micro-notation. No POLICY values.

### §9 — Idempotency & Concurrency Realization Standard
- **Purpose:** Realize `Doc-4A §14`: the idempotency-key header and duplicate-request behavior (same result, **no duplicate audit record, no duplicate outbox event** — joint rule with §11 and Doc-4A §§16/17), and the optimistic-concurrency precondition carriage (version / precondition header) for updates, with retry semantics aligned to the §6 retryability signal.
- **Why Doc-5A owns it:** Async-by-default plus retrying clients makes idempotency a platform wire property; the no-double-emit rule is unstateable per-module without divergence.
- **Dependencies:** §4, §6, §11; `Doc-4A §§14, 16, 17`.
- **Detail level:** Full normative carriage + behavior rules.

### §10 — Asynchronous Operation Realization Standard
- **Purpose:** Realize `Doc-4A §15`: the accepted-then-processing wire pattern (202-style), the status-resource representation callers poll, and the rule that synchronous facades over async engines are forbidden. **Carries the no-fabricated-activity rule** (`Doc-3 §12.1` FIXED) onto the surface. **FLAG:** Supabase Realtime's role as a delivery channel vs. a contract surface (e.g., for M6 real-time notification delivery) must be ratified during content authoring; §10 must not define a Realtime contract without a prior architecture decision establishing it.
- **Why Doc-5A owns it:** Every module has async flows; without one realized pattern each document invents its own job-status idiom.
- **Dependencies:** §5, §6, §11; `Doc-4A §15`; `Doc-3 §12.1`.
- **Detail level:** Full normative pattern + status-resource shape. Job infrastructure (Inngest wiring) deferred to dev/code.

### §11 — Event Surface Realization & Delivery Notes *(candidate "Event & Webhook", rescoped)*
- **Purpose:** Realize the *surface-relevant* parts of `Doc-4A §16` (event contract): how event-driven completion is observed by API callers (binds to §10), reaffirming that the event catalog and outbox ownership remain with their owners (`Doc-2 §8` / `Doc-4J` authoritative catalog / `Doc-4L` integration index) and are **not** restated. **FLAG AND HALT — external webhooks:** the frozen corpus defines **no outbound webhook / third-party push API surface**. Doc-5A must **not invent one**; an external webhook surface is out of scope until introduced by an architecture patch (escalation per `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Why Doc-5A owns it:** The *caller-observable* event-completion surface needs one realization; the internal outbox is not a wire API and the webhook gap must be explicitly fenced, not filled.
- **Dependencies:** §10; `Doc-4A §16`; `Doc-2 §8`; `Doc-4J`, `Doc-4L`.
- **Detail level:** Thin — pointer + one observation rule + explicit no-webhook exclusion flag.

### §12 — API Versioning & Evolution Realization Standard
- **Purpose:** Realize `Doc-4A §20`: how the API **surface** version is expressed on the wire (surface-version identifier from Appendix B), backward-compatible vs breaking change rules, and deprecation signalling. **Clamp:** API surface versioning ≠ domain versioning — entities and state machines change only via approved corpus patches (`Doc-4A §20`, `Doc-2 §5`).
- **Why Doc-5A owns it:** Without one evolution rule, module docs invent ad-hoc URL versioning or silent breaking changes.
- **Dependencies:** §0, §5, §11; `Doc-4A §§16, 20`.
- **Detail level:** Short, fully normative.

### Appendix A — Doc-5 API Conformance Checklist (Machine-Executable) **[ADDED — BLOCKER-resolving]**
- **Purpose:** The review gate every Doc-5B…5M document passes before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`): stable `CHK-5A-xxx` IDs, binary pass/fail, each check naming its authoritative source (every endpoint instantiates §5; status mapping from §6; non-disclosure wire test passes; pagination bounds by POLICY key; idempotency/concurrency carried; no restated upstream normative content; no invented webhook surface). Mirrors `Doc-4A Appendix A`.
- **Why Doc-5A owns it:** A realization metastandard without a gate decays; the checklist is what makes Doc-5A enforceable by CI-style review and feeds Doc-8.
- **Dependencies:** All sections.
- **Detail level:** Complete, mechanically checkable list.

### Appendix B — Reserved API-Surface Namespace Registry **[ADDED — BLOCKER-resolving]**
- **Purpose:** Central registry preventing cross-document collisions (`Doc-5_Program_Governance_Note_v1.0 §5`): API namespace/route prefixes, per-module error-code prefixes (pointer to `Doc-4A Appendix B`), surface-version identifiers, and standard-header names (§4). New registrations require **Doc-5A amendment**, never module-doc invention.
- **Why Doc-5A owns it:** Ten module documents authored in parallel collide on prefixes/codes/headers without one registry.
- **Dependencies:** §4, §5, §6, §12; `Doc-4A Appendix B`.
- **Detail level:** Registry table, pointer-heavy.

### Appendix C — Cross-Reference Index (Doc-5A → Doc-4A / corpus) **[ADDED]**
- **Purpose:** One table mapping every Doc-5A realization point to the abstract standard it realizes (`Doc-4A §X`, Doc-2/Doc-3 section, ADR), so realize-never-redecide is auditable and agents resolve references without searching.
- **Why Doc-5A owns it:** Operationalizes the abstract↔realization boundary (Part I.2); cheap insurance against restatement drift.
- **Dependencies:** All sections.
- **Detail level:** Pointer table only.

---

## Part III — Standards Allocation

### Belongs in Doc-5A (platform-wide API realization)

Transport binding doctrine; wire naming & serialization; standard header set & transport envelope; endpoint realization template (method/URL/status binding); error→status mapping & wire error envelope; identity/context/authorization carriage; pagination/filter/sort wire grammar; idempotency & concurrency carriage; async realization pattern & status resource; caller-observable event-completion surface; API surface versioning; conformance checklist; reserved API-surface namespace registry; cross-reference index.

### Belongs Elsewhere

| Standard / Content | Owner | Reason |
|---|---|---|
| *What* a contract declares (ownership, authz, validation order, error taxonomy, event/audit declaration grammar, templates) | **Doc-4A** (upstream) | Abstract metastandard — Doc-5A realizes, never re-decides |
| Concrete per-module endpoint catalogs | **Doc-5B…5K** | Module realization, gated by Doc-5A Appendix A |
| Concrete cross-module API integration flows | **Source module's Doc-5 doc**, indexed in **Doc-5L** | Single-authorship (mirrors `Doc-4A §4`) |
| Per-entity API state-machine endpoint surfaces | **Doc-5M / module docs** | Realizes `Doc-4M`; legal transitions only |
| Module endpoints / Database schema, migrations, indexes, Prisma | **Doc-6 / code** | Persistence ≠ API contract; no schema in Doc-5A |
| Frontend consumption, view-models, screens | **Doc-7** | UI consumes the surface |
| Conformance / behavior test cases | **Doc-8** | Doc-5A defines the checklist, not the tests |
| Route handler API contracts (method, path, inputs, outputs, authorization, error mapping, event/audit declarations) | **Doc-5B…5K** (in scope — this is the API contract surface Doc-5 governs) | Route handlers realize the contract; the contract itself belongs in Doc-5 module documents |
| Next.js route handler implementation (middleware wiring, request parsing, error handling, framework conventions) | **Development docs / code** | Implementation detail, not contract |
| Server Actions (Next.js RSC mutations / form submission pattern) — **explicitly excluded from Doc-5 API contract scope**: server actions are not part of the HTTP route-handler surface; they are a Next.js-internal invocation mechanism. No Doc-5 module document defines a server action contract. | **Out of Doc-5 scope** | Server Actions are not an API surface governed by Doc-5A; they are a framework invocation mechanism. If a server action IS the only interface for a business operation, that operation's contract must be defined as a route handler contract instead, or the scope decision is escalated. |
| Inngest job infra, Supabase client wiring, transport implementation, observability/health endpoints | **Development docs / code** | Implementation, not contract |
| POLICY values (max page size, rate limits) | **`core.system_configuration`** (`Doc-3 §12` ops) | Referenced by key, never valued in Doc-5A |
| External webhook / third-party push surface | **None — out of corpus** | **FLAG:** not architecturally defined; introduce only by patch, never invent |

---

## Part IV — Structural Review (Expert Critic Pass)

### Candidate-list deltas

| Candidate | Disposition |
|---|---|
| 0 Control/Precedence/Conformance | Kept → §0 |
| 1 Scope & Doc-5 Family Map | Kept → §1 (now also proposes the family allocation deferred from the governance note) |
| 2 API Realization Philosophy | Kept → §2 (+ explicit transport binding) |
| 3 Naming/Serialization | Kept → §3 |
| 4 Endpoint Realization | Kept → §5 |
| 5 Error Realization | Kept → §6 (+ normative status mapping) |
| 6 Authentication Realization | **Rescoped → §7** Identity, Context & Authorization Realization (authentication alone is too narrow; org-context carriage + actor types + delegation must be here) |
| 7 Pagination/Filter/Sort | Kept → §8 |
| 8 Idempotency & Concurrency | Kept → §9 |
| 9 Async Operations | Kept → §10 |
| 10 Event & Webhook Surface | **Rescoped → §11** Event Surface Realization (internal-only; external webhook explicitly excluded) |
| 11 API Versioning | Kept → §12 |
| — | **Added §4** Transport Envelope & Standard Header Set |
| — | **Added Appendix A** Conformance Checklist |
| — | **Added Appendix B** Reserved API-Surface Namespace Registry |
| — | **Added Appendix C** Cross-Reference Index |

### Missing sections

| ID | Class | Finding |
|---|---|---|
| D5A-R1 | BLOCKER | **Conformance Checklist absent from the candidate list.** `Doc-5_Program_Governance_Note_v1.0 §6` requires a machine-executable `CHK-5A-xxx` checklist to gate every Doc-5B…5M freeze. Without it Doc-5A is unenforceable. Resolved: Appendix A. Structure must not freeze without it. |
| D5A-R2 | BLOCKER | **Reserved API-Surface Namespace Registry absent.** `Doc-5_Program_Governance_Note_v1.0 §5` reserves route prefixes / error-code maps / surface-version identifiers to Doc-5A amendment only. Parallel authoring without it guarantees collisions. Resolved: Appendix B. |
| D5A-R3 | MAJOR | **No home for the standard header set.** Auth, org-context, idempotency-key, correlation-id, surface-version, and pagination cursors appear in every endpoint; without one section they drift. Resolved: §4. |
| D5A-R4 | MINOR | **Cross-reference index absent.** Realize-never-redecide is auditable only with a Doc-5A→Doc-4A pointer map. Resolved: Appendix C. |

### Redundant / overlapping sections

| ID | Class | Finding |
|---|---|---|
| D5A-R5 | MAJOR | **Overlap with Doc-4A (restatement drift).** Doc-5A could copy Doc-4A's abstract rules and become a second source of truth. Structural defense: Part I.2 boundary + Appendix C + an Appendix-A check "no restated upstream normative content." Each §X realizes a named `Doc-4A §Y` and adds only the wire layer. |
| D5A-R6 | MINOR | **§9 idempotency / §10 async / §11 events overlap** on "in-flight work." Assignment: §9 owns idempotency & concurrency carriage; §10 owns the accepted-then-processing pattern + status resource; §11 owns only the caller-observable event-completion surface (outbox stays with `Doc-2 §8`/`Doc-4J`). Freeze should ratify these homes. |
| D5A-R7 | MINOR | **§6 errors / §8 pagination** both touch the non-disclosure invariant. Assignment: `Doc-4A §7` is the single normative home; §6 and §8 bind to it (status/body/timing in §6; counts/totals in §8). |

### Architecture & realization risks

| ID | Class | Finding |
|---|---|---|
| D5A-R8 | MAJOR | **Transport binding is a realization decision, not an architecture change — but it must be made.** §2 binds HTTP (grounded in `ADR-001` stack); the in-HTTP *style* is content, ratified when content is authored. **FLAG:** confirm at freeze that binding HTTP does not over-constrain `Doc-4A §2` neutrality (it does not — Doc-5A is by definition the transport-bound layer). |
| D5A-R9 | MAJOR | **Error→HTTP status becomes normative in Doc-5A.** Correct (this is the realization layer) but it must preserve `Doc-4A §7` indistinguishability on the wire (403/404 and timing). Structural home: §6 binds `Doc-4A §§7, 12`. Ratify at freeze. |
| D5A-R10 | MAJOR | **External webhook invention risk.** The frozen corpus has no outbound webhook surface. §11 must fence, not fill: flag-and-halt, defer to an architecture patch (`Doc-5_Program_Governance_Note_v1.0 §7`). A conformance check must reject any invented external push surface. |
| D5A-R11 | MINOR | **POLICY values leaking onto the wire.** Page-size maxima and rate limits must be referenced by `core.system_configuration` key (`Doc-4A §18` / `Doc-3 §12`), never hardcoded in §8/§6. Checklist must test for literal values. |
| D5A-R12 | MINOR | **Client-trusted org context.** §7 must realize org-context carriage as server-validated only (`Doc-4A §5`); transporting an org id must never imply trusting it. |
| D5A-R13 | MINOR | **Versioning misread as domain-change license.** §12's first rule: API surface version ≠ domain version; entities/state machines change only via corpus patches (`Doc-2 §5`, `Doc-4A §20`). |
| D5A-R14 | NITPICK | **Timestamp/money wire format.** §3 must bind the format **as fixed by `Doc-4A §9`** (Doc-4A content resolved it), never re-fix. Verify the exact `Doc-4A §9` resolution when authoring §3 content. |
| D5A-R15 | NITPICK | **Content-language / localization headers** (Bangla/English) are out of the frozen corpus. Record in Doc-5A assumptions; do not add a section (mirrors `Doc-4A` R-7). |

### Overlap with downstream documents

| Boundary | Resolution |
|---|---|
| vs Doc-6 (Database) | Doc-5A defines the wire contract; Doc-6 defines storage. No schema/migrations/Prisma in Doc-5A. |
| vs Doc-7 (Frontend) | Doc-5A defines the API surface; Doc-7 consumes it. No UI/view-models in Doc-5A. |
| vs Doc-8 (Tests) | Doc-5A Appendix A is the checklist; Doc-8 authors the test cases. No test cases in Doc-5A. |

---

## Part V — Author's Pre-Review Assessment

**Sections ready for freeze:** §0, §1, §2, §3, §4, §5, §6, §7, §8, §9, §10, §12, and Appendices A, B, C — as structured above, with their normative-home assignments.

**Sections requiring explicit ratification at freeze (already embedded):**
- The two BLOCKER additions — Appendix A (conformance checklist) and Appendix B (reserved-namespace registry) — must be in the frozen TOC (D5A-R1, D5A-R2).
- The added §4 Standard Header Set (D5A-R3).
- The normative-home assignments (D5A-R6, D5A-R7, D5A-R9).
- The HTTP transport binding in §2 (D5A-R8), with the in-HTTP style deferred to content.

**Section requiring refinement:** §11 Event Surface Realization — kept deliberately thin and **conditional on accepting the no-external-webhook exclusion** (D5A-R10). If the board wishes to expose an external event/push surface, that is an architecture patch first; §11 cannot create it.

**Risks before freeze:** restatement drift vs Doc-4A (D5A-R5), POLICY values on the wire (D5A-R11), client-trusted org context (D5A-R12). All have structural defenses above; none requires any change to the frozen corpus.

**Authority check:** No finding requires a new module, ownership change, event, state transition, permission model, or governance invariant. One genuine gap was found and **flagged, not filled** — the absent external webhook surface (D5A-R10).

### Author's Assessment

> **Author judges structure ready for Independent Hard Review** — conditional on the board ratifying the four embedded resolutions (Appendix A, Appendix B, §4 Standard Header Set, the HTTP transport binding) and accepting the §11 no-external-webhook exclusion. No corpus change is required. Structure freeze authority belongs to the Architecture Board following Independent Hard Review.

---

*End of Doc-5A Structure Proposal v0.1 — structure only; no API contracts, endpoints, request/response definitions, status tables, schemas, transport, or framework implementation defined.*
