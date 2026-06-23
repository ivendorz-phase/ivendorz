# Doc-5A — API Realization Standards — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | FROZEN — canonical Table of Contents for Doc-5A |
| Supersedes | `Doc-5A_Structure_Proposal_v0.1.md` (Architecture Board review applied; authoring history removed per board decision) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` — governs all Doc-5 descendants |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective state (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Contains | Structure only — no contracts, no endpoints, no status tables, no headers, no schemas, no implementation detail |
| Audience | Architecture Board, API Governance Board, Claude Code, Cursor, backend, frontend, QA, AI development agents |

Two governing rules shape the document:

1. **Realize, never re-decide.** Doc-4A fixed *what every contract must declare* (transport-neutral, `Doc-4A §§0–21`). Doc-5A fixes *how each declaration becomes a concrete, callable API on the bound transport*. Every abstract rule is bound to its owner **by pointer** (Appendix C); Doc-5A never restates or re-decides it.
2. **Templates and the checklist are the product.** Doc-5A's deepest sections are the endpoint realization template (§5) and the machine-executable conformance checklist (Appendix A) that make the realization rules enforceable across Doc-5B…5M.

## Decisions ratified at structure freeze

- **Doc-5 family map (ratified):** `5A` realization metastandard; `5B…5K` per module M0…M9 (`core`/`identity`/`marketplace`/`rfq`/`operations`/`trust`/`comms`/`billing`/`admin`/`ai`); `5L` API Integration Index (realizes `Doc-4L`); `5M` API State-Machine Surface (realizes `Doc-4M`). Mirrors the Doc-4 letter precedent.
- **Transport binding (ratified):** HTTP, consistent with the `ADR-001` technology stack and `Architecture §19`. The in-HTTP surface style (resource- vs action-oriented) is a §5 content decision, not re-opened here.
- **Normative-home assignments (ratified):** non-disclosure lives in `Doc-4A §7` and is bound by §6 (status/body/timing) and §8 (counts/totals); idempotency/concurrency = §9; async pattern + status resource = §10; caller-observable event completion = §11 (outbox stays with `Doc-2 §8`/`Doc-4J`).
- **No external webhook surface (ratified exclusion):** the frozen corpus defines no outbound webhook / third-party push API. Doc-5A must not invent one; it is introduced only by an architecture patch (escalation per `Doc-5_Program_Governance_Note_v1.0 §7`).

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Establish Doc-5A's precedence (Master → ADRs → Doc-2 · Doc-3 → Doc-4A → Doc-4B…4M → Doc-5A → Doc-5B…5M → Code); the conformance obligation on every Doc-5B…5M document; the post-freeze additive-patch amendment rule (`Doc-5_Program_Governance_Note_v1.0 §5`); the realize-never-redecide rule.
- **Why Doc-5A:** Conformance must be an obligation, not advice; the precedence extension is ratified once and bound here.
- **Dependencies:** `Doc-5_Program_Governance_Note_v1.0 §§1–3`.
- **Detail level:** Short, fully normative. ~1 page.

## §1 — Scope, Audience & Doc-5 Family Map
- **Purpose:** Define what Doc-5A governs and does not; carry the ratified Doc-5 family map (above); list what is deferred to development documents (framework binding, migrations, UI, test tooling, observability).
- **Why Doc-5A:** Scope allocation prevents two module docs claiming the same surface and keeps implementation detail out of Doc-5A.
- **Dependencies:** §0; `Doc-5_Program_Governance_Note_v1.0 §4`.
- **Detail level:** Normative scope table + family-map table.

## §2 — API Realization Philosophy & Transport Binding
- **Purpose:** Translate `Doc-4A §2` (implementation neutrality) into realization doctrine; ratify the HTTP transport binding; state the realization principles (deterministic surface, security-safe by construction, contract-first, internally complete, AI-agent-authored). The in-HTTP style is realized in §5.
- **Why Doc-5A:** Every later section presupposes the bound transport; binding it per-module fragments the surface.
- **Dependencies:** §0, §1; `Doc-4A §2`; `ADR-001`; `Architecture §19`.
- **Detail level:** Compressed doctrine + transport-binding decision. Pointers, not restatement.

## §3 — Wire Naming & Serialization Standard
- **Purpose:** Realize `Doc-4A §§3, 8, 9, 10` at the wire: JSON serialization, field casing, money `{amount, currency}` and timestamp wire form bound to `Doc-4A §9`, UUIDv7-only payload references with `human_ref` display/lookup, enum values from Doc-2.
- **Why Doc-5A:** Serialization drift is the most common realization failure; money/time/identifier shape must be identical everywhere.
- **Dependencies:** §2; `Doc-4A §§3, 8, 9, 10`; Doc-2 §§0.1, 0.4, 3.
- **Detail level:** Full normative wire conventions + field-shape micro-notation. No endpoints.

## §4 — Transport Envelope & Standard Header Set
- **Purpose:** Define the one envelope and the closed set of standard headers (correlation/trace id, authentication carrier, active-organization context carrier, idempotency key, concurrency precondition, surface version, pagination cursors), each bound to its owning standard.
- **Why Doc-5A:** Headers appear in every endpoint; without one registry they drift.
- **Dependencies:** §3, §7, §8, §9, §12; Appendix B.
- **Detail level:** Full normative header registry (names + meaning + owning section). No values.

## §5 — Endpoint Realization Standard
- **Purpose:** Realize the `Doc-4A §21.1` Endpoint Contract Template and `Doc-4A §4` surface topology as a concrete HTTP operation: method selection, URL/path grammar, input placement, success-status families, request/response envelope binding. Includes the ratified in-HTTP surface style.
- **Why Doc-5A:** Consistent module docs come only from a fixed realization template with controlled vocabulary.
- **Dependencies:** §2, §3, §4; `Doc-4A §§4, 21.1`.
- **Detail level:** Maximum — complete realization template + one illustrative, non-normative instantiation using an existing Doc-2 entity. No real endpoints.

## §6 — Error Realization & Status Mapping Standard
- **Purpose:** Make normative what `Doc-4A §12` left transport-neutral: the error-class → HTTP-status mapping, the wire error envelope, per-module error-code namespaces (Appendix B), and rate/quota responses (realizing `Doc-4A §19`). Preserves `Doc-4A §7` non-disclosure on the wire (no-access/not-found indistinguishable in status, body, timing).
- **Why Doc-5A:** Error semantics are where transport binding and non-disclosure most often erode.
- **Dependencies:** §5; `Doc-4A §§7, 12, 19`.
- **Detail level:** Full normative mapping + wire envelope. Non-disclosure indistinguishability restated as a wire assertion (bound to `Doc-4A §7`).

## §7 — Identity, Context & Authorization Realization Standard
- **Purpose:** Realize `Doc-4A §§5, 6` on the wire: authentication carriage (Supabase Auth bearer = authentication only), server-validated active-organization context carriage, actor-type and delegation-grant context. Org context is **never client-trusted** (`Doc-4A §5`).
- **Why Doc-5A:** Every endpoint presupposes this context carriage; realizing it per-module fractures the tenancy guarantee.
- **Dependencies:** §4, §6; `Doc-4A §§5, 6`; `ADR-001`.
- **Detail level:** Full normative context-carriage rules. No session/token implementation detail.

## §8 — Pagination, Filtering & Sort Wire Grammar
- **Purpose:** Realize the `Doc-4A §10` list grammar: pagination model, query-parameter names, sort/filter syntax, page-size bounds referenced by POLICY key (`Doc-4A §18`/`Doc-3 §12`), and the exclusion-consistency rule (items/counts/totals exclude soft-deleted / non-disclosed / routing-excluded rows identically — `Doc-4A §§7, 10`).
- **Why Doc-5A:** Ten modules inventing ten pagination schemes is the canonical list-surface failure.
- **Dependencies:** §3, §6; `Doc-4A §§7, 10, 18`; `Doc-3 §12`.
- **Detail level:** Full normative wire grammar + parameter micro-notation. No POLICY values.

## §9 — Idempotency & Concurrency Realization Standard
- **Purpose:** Realize `Doc-4A §14`: idempotency-key carriage and duplicate-request behavior (same result, no duplicate audit record, no duplicate outbox event — joint with §11 and `Doc-4A §§16, 17`); optimistic-concurrency precondition carriage; retry semantics aligned to the §6 retryability signal.
- **Why Doc-5A:** Async-by-default plus retrying clients makes idempotency a platform wire property.
- **Dependencies:** §4, §6, §11; `Doc-4A §§14, 16, 17`.
- **Detail level:** Full normative carriage + behavior rules.

## §10 — Asynchronous Operation Realization Standard
- **Purpose:** Realize `Doc-4A §15`: accepted-then-processing wire pattern, status-resource representation, no synchronous facades over async engines. Carries the no-fabricated-activity rule (`Doc-3 §12.1`); Supabase Realtime is a delivery channel only.
- **Why Doc-5A:** Every module has async flows; without one pattern each invents its own job-status idiom.
- **Dependencies:** §5, §6, §11; `Doc-4A §15`; `Doc-3 §12.1`.
- **Detail level:** Full normative pattern + status-resource shape. Job infrastructure (Inngest) deferred to dev/code.

## §11 — Event Surface Realization & Delivery Notes
- **Purpose:** Realize the surface-relevant parts of `Doc-4A §16`: how event-driven completion is observed by API callers (binds §10); event catalog and outbox ownership remain with `Doc-2 §8`/`Doc-4J`/`Doc-4L` and are not restated. External webhooks excluded (ratified exclusion above).
- **Why Doc-5A:** The caller-observable event-completion surface needs one realization; the internal outbox is not a wire API and the webhook gap must be fenced, not filled.
- **Dependencies:** §10; `Doc-4A §16`; `Doc-2 §8`; `Doc-4J`, `Doc-4L`.
- **Detail level:** Thin — pointer + one observation rule + explicit no-webhook exclusion.

## §12 — API Versioning & Evolution Realization Standard
- **Purpose:** Realize `Doc-4A §20`: how the API surface version is expressed (surface-version identifier from Appendix B), backward-compatible vs breaking change rules, deprecation signalling. API surface version ≠ domain version (entities/state machines change only via corpus patches — `Doc-2 §5`, `Doc-4A §20`).
- **Why Doc-5A:** Without one evolution rule, module docs invent ad-hoc URL versioning or silent breaking changes.
- **Dependencies:** §0, §5, §11; `Doc-4A §§16, 20`.
- **Detail level:** Short, fully normative.

## Appendix A — Doc-5 API Conformance Checklist (Machine-Executable)
- **Purpose:** The review gate every Doc-5B…5M document passes before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`): stable `CHK-5A-xxx` IDs, binary pass/fail, each naming its authoritative source (every endpoint instantiates §5; status mapping from §6; non-disclosure wire test passes; pagination bounds by POLICY key; idempotency/concurrency carried; no restated upstream normative content; no invented webhook surface). Mirrors `Doc-4A Appendix A`.
- **Why Doc-5A:** A realization metastandard without a gate decays; the checklist makes Doc-5A enforceable and feeds Doc-8.
- **Dependencies:** All sections.
- **Detail level:** Complete, mechanically checkable list.

## Appendix B — Reserved API-Surface Namespace Registry
- **Purpose:** Central registry preventing cross-document collisions (`Doc-5_Program_Governance_Note_v1.0 §5`): API namespace/route prefixes, per-module error-code prefixes (pointer to `Doc-4A Appendix B`), surface-version identifiers, standard-header names (§4). New registrations require Doc-5A amendment, never module-doc invention.
- **Why Doc-5A:** Ten module documents authored in parallel collide on prefixes/codes/headers without one registry.
- **Dependencies:** §4, §5, §6, §12; `Doc-4A Appendix B`.
- **Detail level:** Registry table, pointer-heavy.

## Appendix C — Cross-Reference Index (Doc-5A → Doc-4A / corpus)
- **Purpose:** One table mapping every Doc-5A realization point to the abstract standard it realizes (`Doc-4A §X`, Doc-2/Doc-3 section, ADR), so realize-never-redecide is auditable.
- **Why Doc-5A:** Operationalizes the abstract↔realization boundary; cheap insurance against restatement drift.
- **Dependencies:** All sections.
- **Detail level:** Pointer table only.

---

*End of Doc-5A Canonical Structure v1.0 (FROZEN) — structure only; no API contracts, endpoints, status tables, headers, schemas, transport, or framework implementation defined. Authoring history retained in `Doc-5A_Structure_Proposal_v0.1.md`.*
