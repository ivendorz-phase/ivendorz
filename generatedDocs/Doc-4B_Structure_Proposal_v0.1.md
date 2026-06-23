# Doc-4B — Platform Core / Shared Kernel — API & Integration Contracts — Canonical Structure (Proposal v0.1)

| Field | Value |
|---|---|
| Status | **DRAFT — Phase 1 deliverable; submitted for Architecture Board freeze decision** |
| Module | Module 0 — Platform Core / Shared Kernel (`core` schema) |
| Supersedes | — (first Doc-4B structure proposal) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, **Doc-4A v1.0 (FROZEN: Pass1–Pass6 + FreezeAudit Patch v1.0.1)** |
| Contains | Structure only — no contracts, no endpoints, no payloads, no implementation detail |
| Family-map basis | Doc-4A §1.3: **Doc-4B = Platform Core / Shared Kernel (Module 0)** (per Board resolution, Doc-4_FamilyMap_Conflict_Escalation_v0.1, Option B) |
| Audience | Claude Code, Cursor, backend, QA, AI development agents |

Three governing rules shape this document:

1. **Reference, never restate (Doc-4A §0.3).** The audit field set (Doc-2 §9), the event catalog (Doc-2 §8), the POLICY key inventory (Doc-3 §12.2), the human-reference format (Doc-2 §0.1), and all permission slugs (Doc-2 §7) have owners. Doc-4B binds to them by pointer; it never copies them.
2. **Infrastructure only — no business logic (Architecture §17; ADR Module 0; Doc-4A §4.3; CHK-007).** Module 0 contracts cover audit, outbox/event delivery, ID and reference allocation, system configuration, and feature flags. Any RFQ, Vendor, Trust, or Billing rule placed here is shared-kernel abuse and is rejected at review.
3. **Templates are mandatory (Doc-4A §21).** Every contract authored in Pass-A uses the applicable frozen template (21.3 Query, 21.4 Command, 21.5 System Actor, 21.6 Admin — all specializations of 21.1; 21.2 for integrations). This document maps each capability to its template; it does not instantiate them.

---

## §0 — Document Control, Precedence & Conformance Obligation

- **Purpose:** Establish Doc-4B as the contract document for Module 0 only, subordinate to the frozen corpus and to Doc-4A; restate the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B); bind the flag-and-halt obligation (Doc-4A §0.6) and patch-based amendment rule; name the exact corpus versions conformed to (header table).
- **Why this section:** A module document must declare, once, that it adds no standards and overrides nothing; conformance is an obligation, not advice.
- **Source bindings:** Doc-4_Governance_Note_v1.0; Doc-4A §0.
- **Detail level:** Short, fully normative. ~½ page.

## §1 — Module Scope & Boundary

- **Purpose:** Fix the contract surface of Module 0. Enumerate the five owned entities exactly as named in Doc-2 §3.1 — `core.audit_records`, `core.outbox_events`, `core.id_sequences`, `core.system_configuration`, `core.feature_flags` — and state that Doc-4B owns the contracts of these and no others. State the infrastructure-only rule and the shared-kernel-abuse prohibition (Architecture §17; ADR Module 0 Redline Amendment A; Doc-4A §4.3; CHK-007). State what Doc-4B does **not** contain: any business entity, workflow, or state machine (those belong to Doc-4C…4K); the per-event integration contracts (authored by producing modules under the integration single-authorship rule, Doc-4A §4.4); POLICY values and tuning (the `core.system_configuration` ratification track, Doc-3 §12).
- **Why this section:** Module 0 is unusual — most of its value is consumed by other modules as cross-cutting obligations rather than as callable endpoints. The boundary must be explicit to prevent both shared-kernel abuse and accidental duplication of integrations owned elsewhere.
- **Source bindings:** Architecture §16.2, §17.1; ADR Module 0; Doc-2 §3.1, §10.1; Doc-4A §1.3, §4.3, §4.4.
- **Detail level:** Normative scope statement + owned-entity table (pointer-level).

## §2 — Conformance & Template Binding

- **Purpose:** Declare which frozen Doc-4A templates Doc-4B uses and for what: **21.3 Query** (audit read/correlation lookup, configuration read surfaces exposed to staff), **21.4 Command** (none expected for tenant users; reserved), **21.5 System Actor** (outbox dispatcher, archival/retention workers — Phase-2, `Correlation: phase2-origin`), **21.6 Admin** (configuration change, feature-flag management, audit redaction — platform-staff). Bind the `core_` error-code namespace (Doc-4A Appendix B). State the Appendix A conformance-checklist obligation (run before freeze; report check IDs). Record the **deferred-template dependency** (see Appendix C, D-1): the originally-registered Internal Service Contract and Event Schema Declaration templates are deferred (Doc-4A Pass5 §21 PATCH-01 note) and are the natural fit for several Module 0 contracts.
- **Why this section:** Module 0 is the single most template-sensitive module; selecting templates wrong here propagates into every consumer. The deferred-template gap must be visible at the top, not discovered mid-authoring.
- **Source bindings:** Doc-4A §21 (template registry + selection guide), §22.3 (rules R-01…R-07), Appendix A, Appendix B.
- **Detail level:** Normative template-selection table for Module 0 + namespace binding + dependency pointer.

## §3 — Shared Infrastructure Obligations (consumed by all modules)

- **Purpose:** Define the dual nature of Module 0 — it owns mechanisms (the five entities) **and** it is the target of cross-cutting contract obligations that every other module's contracts declare. Enumerate, by pointer, the obligations Doc-4B is the home mechanism for: the audit-write obligation every mutating contract satisfies (Doc-4A §17), the transactional-outbox-write obligation every event-emitting contract satisfies (Doc-4A §16), UUIDv7 + human-reference assignment (Doc-4A §8), POLICY resolution by key (Doc-4A §18), and feature-flag evaluation. State clearly that these obligations are **declared in the consumer's contract** (in Doc-4C…4K), while Doc-4B defines the underlying owned mechanism. The `reference_id` linkage (Doc-4A §12/§17, P6-B01) is the connective tissue and is described here as a Module 0 concern.
- **Why this section:** Without this framing, a reader expects Module 0 to expose an "append audit" or "write outbox" endpoint and mis-models the architecture. The obligations are infrastructure; the contracts that invoke them live in the consuming modules.
- **Source bindings:** Architecture §14, §15, §17; Doc-4A §8, §14, §16, §17, §18; Doc-2 §8, §9.
- **Detail level:** Conceptual + normative pointer map. No restated field sets.

## §4 — Audit Service Contracts (`core.audit_records`)

- **Purpose:** Define the Module-0 surface over the immutable audit trail.
  - **4.1 Audit record model binding** — bind to the Doc-2 §9 field set and the four actor types (User · Admin · System · AI Agent) by pointer; never restate the field list.
  - **4.2 Audit append obligation** — how a mutating contract's `Audit Requirements` block (Doc-4A §17) resolves against `core.audit_records`; same-transaction guarantee; no-duplicate-record rule under idempotency (Doc-4A §14). Whether a callable internal append service is formally specified depends on D-1 (Appendix C).
  - **4.3 Audit query contracts** — 21.3 Query; access-controlled and compliance-scoped; the `reference_id` correlation lookup must itself be access-controlled (it is otherwise an oracle — Doc-4A Review Log P3-m3); non-disclosure behavior per Doc-4A §7 (an audit query must not leak cross-tenant or excluded-vendor facts).
  - **4.4 Audit redaction contract** — 21.6 Admin; bound to `staff_can_redact_audit` (Doc-2 §7); record permanence vs field redaction (Architecture §14.3); every redaction writes a **new** audit event; approval flow.
  - **4.5 Audit retention / soft-archive** — 21.5 System Actor; "never deleted, soft archive only" (Architecture §14.4); monthly partitioning by time-ordered UUIDv7 PK (Doc-2 §10.1).
- **Why this section:** Audit is the one service "no module may bypass" (Architecture §14); its read and redaction surfaces are genuine Module-0 endpoints with sharp non-disclosure and permission constraints.
- **Source bindings:** Architecture §14; Doc-2 §9, §10.1, §7 (`staff_can_redact_audit`); Doc-4A §7, §14, §17.
- **Detail level:** Per-subsection purpose + template + source pointer. No field-set restatement.

## §5 — Event Delivery & Outbox Contracts (`core.outbox_events`)

- **Purpose:** Define the Module-0 surface over the transactional outbox and its dispatcher.
  - **5.1 Transactional-outbox-write obligation** — business write + event insert in one transaction (Architecture §15.1; Doc-4A §16); no duplicate emit under idempotency (Doc-4A §14, joint rule with §16/§17).
  - **5.2 Outbox dispatcher** — 21.5 System Actor; at-least-once delivery; retry-with-backoff and attempt accounting; declares State Machine Effects over the **existing** `core.outbox_events` lifecycle `pending → dispatched → archived` (Doc-2 §3.1, §10.1) — introduces no new transition (Doc-4A §13); `Correlation: phase2-origin`; no fabricated activity (Doc-3 §12.1 FIXED via Doc-4A §15).
  - **5.3 Event envelope binding** — `event_name` + `event_version`, thin payloads (IDs + minimal metadata), consumer idempotency, tolerant-reader obligation (Doc-4A §16 as patched), `Privacy-Review: §7.5 compliant`. Binds to the Doc-2 §8 catalog; **does not enumerate events** (owned by producing modules).
  - **5.4 Dispatch failure / dead-letter handling** — 21.5 System Actor; failure handled within corpus-defined failure semantics (Doc-4A §15.6); never silently drop.
  - **5.5 Integration single-authorship note** — per Doc-4A §4.4, each event integration is authored once by the producing/consuming module (Doc-4C…4K), not here; Doc-4B owns the delivery mechanism, not the per-event 21.2 contracts.
- **Why this section:** The outbox is the backbone of all cross-module automation; the dispatcher is a real Module-0 Phase-2 worker. Misplacing per-event integrations here would violate single-authorship.
- **Source bindings:** Architecture §15; Doc-2 §3.1, §8, §10.1; Doc-4A §13, §14, §15, §16, §4.4.
- **Detail level:** Per-subsection purpose + template + source pointer. No catalog restatement.

## §6 — Identifier & Reference Allocation Contracts (`core.id_sequences`)

- **Purpose:** Define the Module-0 surface over identifier and human-reference allocation.
  - **6.1 UUIDv7 assignment** — the only canonical machine identifier (Doc-4A §8; Architecture §17.2); time-ordered; identifiers never change; algorithmic capability (no table).
  - **6.2 Human-reference allocation** — `core.id_sequences`; year-scoped, gap-tolerant, never reused (including after soft-delete/restore), concurrency-safe via row-locked allocation (Doc-2 §0.1, §10.1; Architecture §17.2); consumed within other modules' create commands.
  - **6.3 Reference-format registry binding** — bind to the human-reference prefixes (Doc-2 §0.1; Doc-4A Appendix B); never invent a new prefix here (new prefixes require a Doc-4A patch — Governance Note rule 5).
  - **Terminology note (Appendix C, D-3):** Architecture §17.1 labels this capability `id_generation`; the Doc-2 entity is `core.id_sequences`. Per Doc-4A §3.1, Doc-4B uses the Doc-2 name `core.id_sequences`.
- **Why this section:** Reference allocation is infrastructure consumed everywhere; its uniqueness and never-reused guarantees are contract-relevant and must be stated once.
- **Source bindings:** Architecture §17.2; Doc-2 §0.1, §10.1; Doc-4A §8, Appendix B; §3.1 (naming).
- **Detail level:** Per-subsection purpose + source pointer. Mostly internal; few staff-facing endpoints.

## §7 — System Configuration Contracts (`core.system_configuration`)

- **Purpose:** Define the Module-0 surface over tunable operating policy.
  - **7.1 Configuration read / resolution** — POLICY values resolved **by key**, never inlined (Doc-4A §18; Doc-3 §12.2); read by owning engines at runtime; internal read surface.
  - **7.2 Configuration change** — 21.6 Admin; audited with old/new values (Architecture §17.3; Doc-3 §12.4); `formula_version` bump where the change affects scoring (Doc-3 §12.4); the **firewall restatement** — configuration tunes POLICY values only, never FIXED rules, and never trust, verification, eligibility, routing fairness, or matching confidence (Doc-4A §4B, §18; Doc-3 §12.1). Permission slug to be confirmed against Doc-2 §7 (Appendix C, D-2).
  - **7.3 FIXED / POLICY / ORG boundary binding** — Module 0 stores POLICY values; Doc-3 §12 owns the key inventory and the FIXED set; ORG settings are per-organization and owned by Identity (Doc-4C), not here.
  - **7.4 Per-cell override handling** — global + per-cell keys with explicit override records (Doc-3 §12.4); read semantics for `platform.operating_stage` and per-cell overrides.
- **Why this section:** Configuration is where hardcoded-tunable and firewall-violation authoring errors are most likely; the contract surface must make POLICY-by-key and the firewall mechanical.
- **Source bindings:** Architecture §17.3; Doc-3 §12.1–12.4; Doc-4A §4B, §18; Doc-2 §10.1, §7.
- **Detail level:** Per-subsection purpose + template + source pointer. No POLICY value or key-inventory restatement.

## §8 — Feature Flag Contracts (`core.feature_flags`)

- **Purpose:** Define the Module-0 surface over rollout control.
  - **8.1 Flag evaluation** — internal read; `flag_key`, `enabled`, `scope_jsonb` (Doc-2 §10.1).
  - **8.2 Flag management** — 21.6 Admin; audited (Doc-2 §9 Platform row); the firewall restatement — flags may gate feature visibility and rollout, never trust, verification, eligibility, routing fairness, or matching confidence (Doc-4A §4B, §18). Permission slug to be confirmed against Doc-2 §7 (Appendix C, D-2).
- **Why this section:** Feature flags are a controlled-rollout mechanism, not a business-logic switch; the firewall and audit obligations must be explicit so flags are never used to bypass gates.
- **Source bindings:** Architecture §17.1; Doc-2 §9, §10.1, §7; Doc-4A §4B, §18.
- **Detail level:** Per-subsection purpose + template + source pointer.

## §9 — Cross-Cutting Declarations for Module 0 Contracts

- **Purpose:** State, once, the declaration defaults every Module-0 contract uses: the actor model is predominantly **System** (Phase-2 workers) and **platform-staff/Admin** (21.6, no active organization context per Doc-4A §5.6) — tenant-user commands are not expected; tenancy is platform-owned (Doc-2 §6) and the audit `organization_id` is conditional for System platform operations (Doc-4A §17 as amended by FreezeAudit PATCH-FA-07); idempotency/concurrency per Doc-4A §14; error codes in the `core_` namespace (Doc-4A Appendix B); async pattern per Doc-4A §15. Confirm no contract declares a governance-signal input (Doc-4A §4B firewall-compliance) — Module 0 neither owns nor mutates any of the five governance signals.
- **Why this section:** Module 0's actor and tenancy profile is atypical (no tenant org context for most operations); stating it once prevents per-contract drift.
- **Source bindings:** Doc-4A §5, §5.6, §7, §14, §15, §4B, Appendix B; Doc-2 §6; FreezeAudit PATCH-FA-07.
- **Detail level:** Normative declaration defaults. No restatement of Doc-4A grammar.

---

## Appendix A — Module 0 Contract Inventory (skeleton)

- **Purpose:** The Pass-A authoring worklist: one row per planned contract — capability, working contract name, owned entity, frozen template, actor type, and authoritative source pointer (Architecture / Doc-2 / Doc-3 / ADR). Contract IDs use the `core.` module prefix (Doc-4A Appendix B). This is a **skeleton inventory only**; no contract is instantiated in the Structure.
- **Why this appendix:** Converts the section map into a countable, reviewable authoring plan and lets the Board scope Pass-A.
- **Detail level:** Table; pointer-heavy; no payloads.

## Appendix B — Doc-4A Conformance Binding Map

- **Purpose:** One table mapping each Doc-4B section to the Doc-4A standard(s) and conformance check IDs (Appendix A) that govern it — at minimum CHK-007 (no business logic in Module 0), the §16/§17/§8/§18 bindings, the §13 no-new-transition rule for the outbox lifecycle, and the `core_` namespace (Appendix B). Doubles as the agent self-check map before Pass-A freeze.
- **Why this appendix:** Makes Doc-4B's conformance to the frozen standard auditable section-by-section.
- **Detail level:** Pointer table with check IDs.

## Appendix C — Open Structural Dependencies (Board decisions for the freeze gate)

- **Purpose:** Record the structural questions the Board must resolve at or before the Phase-1 freeze. No workaround is invented (Doc-4A §0.6); each is routed for decision.
  - **D-1 — Deferred templates (MAJOR).** The Internal Service Contract and Event Schema Declaration templates registered in the frozen Structure are **deferred** (Doc-4A Pass5 §21 PATCH-01: "deferred to a future Doc-4A patch… not superseded"). Module 0's synchronous internal services (audit append, human-reference allocation, configuration read) and its event-envelope schema are the primary use case for these templates. **Decision:** either (a) apply the recommended follow-on Doc-4A Structure patch to formalize the two deferred templates before Doc-4B Pass-A, or (b) direct Doc-4B to **compose** existing templates (model internal services as access-controlled 21.3/21.4 contracts with an internal-audience annotation; declare event envelopes within §16 Events Produced blocks) per the smallest-change doctrine (Doc-4A §2.6). Recommendation: (b) compose, unless the Board wants a uniform internal-service grammar across Doc-4C…4K, in which case (a) first.
  - **D-2 — Configuration / feature-flag management permission slug (MAJOR).** Doc-2 §7 lists `staff_can_redact_audit` and `staff_super_admin` explicitly but no dedicated `staff_*` slug for system-configuration change or feature-flag management, while Doc-2 §9 records both as audited Platform actions. Per Doc-4A §6, a Doc-4 document MUST NOT invent a slug. **Decision:** confirm these operations are gated by `staff_super_admin`, or escalate a Doc-2 §7 patch to add explicit slugs. To be resolved before the §7/§8 contracts are authored in Pass-A.
  - **D-3 — Identifier capability naming (NITPICK).** Architecture §17.1 `id_generation` vs Doc-2 `core.id_sequences`. Resolved by Doc-4A §3.1 (use the Doc-2 name); recorded here for Pass-A authors. No Board action required.
- **Why this appendix:** Phase 1 exists to surface exactly these shape-determining dependencies before content authoring; resolving them at the freeze gate prevents rework in Pass-A.
- **Detail level:** One entry per dependency: issue, citations, decision options, recommendation.

## Appendix D — Cross-Reference Index

- **Purpose:** Pointer table from every Doc-4B binding point to its authoritative source (Architecture §, ADR, Doc-2 §, Doc-3 §, Doc-4A §, patch ID per Doc-4A §3.5), so Pass-A authors and agents resolve references without searching and reference-never-restate is auditable.
- **Why this appendix:** Operationalizes the precedence chain for AI agents.
- **Detail level:** Pointer table only.

---

## Self-Review (Structure proposal)

| Criterion | Result |
|---|---|
| Structure only — no contracts, endpoints, or payloads | PASS |
| Covers only Module 0 entities; no business logic (CHK-007) | PASS |
| No new entity / workflow / state / transition / permission / event introduced | PASS |
| Entity names exact per Doc-2 §3.1 (`core.audit_records`, `core.outbox_events`, `core.id_sequences`, `core.system_configuration`, `core.feature_flags`) | PASS |
| Binds to frozen Doc-4A standards by pointer (reference-never-restate) | PASS |
| Per-event integrations correctly deferred to producing modules (Doc-4A §4.4) | PASS |
| Outbox lifecycle referenced as existing (Doc-2); no transition invented (Doc-4A §13) | PASS |
| Conflicts/gaps flagged, not worked around (Doc-4A §0.6): D-1, D-2 recorded | PASS |
| Document identifier consistent with Board resolution (Doc-4B = Module 0) | PASS |
| Internally complete — no "TBD"; open items routed to named owners/decisions | PASS |

---

*End of Doc-4B Canonical Structure — Proposal v0.1. Submitted for Architecture Board Phase-1 review and freeze decision. On freeze, reissue as `Doc-4B_Structure_v1.0_FROZEN.md` (per the Doc-4A precedent); Pass-A authoring then proceeds against the frozen structure. Two dependencies (D-1, D-2) request a Board decision at the freeze gate; no frozen document is amended by this proposal.*
