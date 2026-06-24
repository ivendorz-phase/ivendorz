# Doc-5A — API Realization Standards — Content v1.0, Pass 11 (Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 11 of N — Appendix A only |
| Status | ACTIVE — Content Pass 11 of N; Appendix A only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1…Pass-10 (§0–§12 + Appendix B) |
| Contains | The machine-executable Doc-5 API Conformance Checklist only — stable `CHK-5A-xxx` IDs, binary pass/fail, each citing its authoritative source. The freeze gate every Doc-5B…5M document passes. Mirrors `Doc-4A Appendix A`. **Restates no rule** — every check binds an **existing** §0–§12 / Appendix B / Doc-4A obligation as a binary test. No new token, status, header, error class, POLICY key, or behavior |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers · Doc-8 test authors |

> **Realize, never re-decide.** This checklist is an **enforcement surface, not a source of obligations.** Every `CHK-5A-xxx` row converts an obligation already fixed in §0–§12, Appendix B, or the frozen corpus into a binary pass/fail test and **cites that source**; it introduces no new requirement. It **mirrors `Doc-4A Appendix A`** discipline and **defers** contract-level checks already owned there (e.g. module ownership/structure CHK-002…009) by pointer rather than duplicating them. Where a check needs a frozen authority that does not exist, it is **not invented** — flag-and-halt (`Doc-5_Program_Governance_Note_v1.0 §7`).

**Dependency realization path:** all of §0–§12 + Appendix B; `Doc-4A Appendix A` (mirrored discipline); `Doc-5_Program_Governance_Note_v1.0 §6` (conformance gate).

---

## Appendix A — Doc-5 API Conformance Checklist (Machine-Executable)

### A.0 Purpose, Severity & Usage

- **Purpose.** Every check has a stable ID (`CHK-5A-xxx`), a binary pass/fail criterion, and a source pointer. AI review agents and human reviewers run this checklist against **every Doc-5B…5M contract before freeze** (`Doc-5_Program_Governance_Note_v1.0 §6`). Non-passing checks are reported by ID.
- **Freeze gate.** A contract with any unresolved **`[B]`** check **MUST NOT** be frozen. **`[M]`** must be resolved or explicitly deferred with escalation. **`[m]`** should be resolved; accepted with recorded justification.
- **Severity legend** — the `Doc-4A Appendix A` model, by pointer (three tiers, no more):
  - **`[B]`** = BLOCKER — contract must not freeze until resolved.
  - **`[M]`** = MAJOR — must be resolved or explicitly deferred with escalation.
  - **`[m]`** = MINOR — should be resolved; accept with recorded justification.
- **NITPICK is not a checklist tier.** The conformance severity model of this machine-executable checklist is **exactly** `Doc-4A Appendix A`'s `[B]/[M]/[m]`. NITPICK-level observations are a **review-methodology** concern, recorded in the review record — never as a `CHK-5A-xxx` severity. (No corpus authority defines an N conformance tier.)
- **ID range.** `CHK-5A-001` through `CHK-5A-009` are **intentionally unused**: ownership of the corresponding module-ownership/structure governance checks remains with `Doc-4A Appendix A` (CHK-002…009) and is referenced by pointer (see A.14), not duplicated. This checklist's IDs begin at `CHK-5A-010`. Supplementary groups A.13–A.15 (no direct §N counterpart) reserve the `X×10+0` slot (`130`/`140`/`150`); their checks begin at `X×10+1` (`131`, `141`, `151`).
- **No new obligation.** A reviewer **MUST NOT** read any check as a normative rule in its own right; the rule lives in the cited source. A check whose source cannot be cited is a checklist defect, escalated (Gov-Note §7), not enforced.

---

### A.1 Naming & Serialization (§3)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-010 | Request/response bodies serialized as JSON, UTF-8 | §3 | B |
| CHK-5A-011 | Field names are `snake_case` | §3 | M |
| CHK-5A-012 | Money rendered as `{amount, currency}` (no bare scalar) | §3; `Doc-4A §9` | B |
| CHK-5A-013 | Timestamps in the §3 canonical wire form | §3; `Doc-4A §9` | M |
| CHK-5A-014 | Payload identifier references are `UUIDv7`; `human_ref` only for a declared lookup/display | §3; `Doc-4A §8` | B |
| CHK-5A-015 | Enum values drawn from Doc-2 (no invented enum value) | §3; Doc-2 | B |

---

### A.2 Transport Envelope & Headers (§4)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-020 | The single §4 transport envelope is used | §4 | M |
| CHK-5A-021 | Only registered standard headers carried; tokens match §4.4 / Appendix B.4 | §4.4; App B.4 | B |
| CHK-5A-022 | `Iv-` application-header prefix used only for registered tokens | §4.3; App B.4 | M |
| CHK-5A-023 | No forbidden header (identity/role/permission/tenant-assertion/attribution/POLICY-override/payload-duplication) | §4.4; `Doc-4A §9.7` | B |
| CHK-5A-024 | Mandatory headers present per classification (`Authorization`; `Iv-Active-Organization` on org-scoped ops) | §4.4 | B |
| CHK-5A-025 | Conditional headers present exactly when their owning rule applies (`Idempotency-Key`, `If-Match`, `Iv-Api-Version`) | §4.4 | M |

---

### A.3 Endpoint Realization (§5)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-030 | Every endpoint instantiates the §5.7 Endpoint Realization Template | §5.7 | B |
| CHK-5A-031 | HTTP method selected per the §5.2 mapping | §5.2 | B |
| CHK-5A-032 | Path follows the §5.3 grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]` | §5.3 | B |
| CHK-5A-033 | State-changing operation is a named command sub-resource, not arbitrary field replacement | §5.1; §5.2 | B |
| CHK-5A-034 | Input placement per §5.4; no prohibited request field in path, query, body, or header | §5.4; `Doc-4A §9.7` | B |
| CHK-5A-035 | Success status from the §5.5 family (`200`/`201`/`202`/`204`) | §5.5 | M |
| CHK-5A-036 | No abstract verb (`get`/`update`) appears in a collection or item path | §5.3 | m |

---

### A.4 Error & Status Mapping (§6)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-040 | Every error maps its error-class → HTTP status per the §6 mapping | §6 | B |
| CHK-5A-041 | Wire error envelope is the §6 canonical shape | §6 | B |
| CHK-5A-042 | Top-level `reference_id` (platform-assigned UUIDv7) present in every response **that carries a body** (success and error) | `Doc-4A §22.1 C-05` (clarified by `PATCH-D4A-C05-204`); §6 | B |
| CHK-5A-043 | `error_code` is within the module's registered namespace | App B.2 → `Doc-4A Appendix B.2` | B |
| CHK-5A-044 | `retryable` signal set per the §6 class | §6 | M |
| CHK-5A-045 | Rate/quota responses realize `Doc-4A §19` | §6; `Doc-4A §19` | M |

> **CORPUS GAP `GAP-D5A-P11-01` — RESOLVED (`PATCH-D4A-C05-204`):** `Doc-4A §22.1 C-05` ("every response") vs §5.5/§4.0 (`204` = no-body) vs `reference_id` defined only as a body field left no-body carriage undefined. **Human ruling (2026-06-24):** Doc-4A C-05 is clarified to "every response **that carries a body**"; `204` is exempt (linkage maintained server-side via the audit record §17.2 + idempotency/correlation identifiers) — additive clarification `PATCH-D4A-C05-204` (**ratified 2026-06-24**, corpus-effective). `CHK-5A-042` (already scoped to body-bearing responses) now matches clarified C-05; Appendix A invented no mechanism. Record: `governanceReviews/Doc-5A_CORPUS_GAP_P11-01_reference_id_204.md`.

---

### A.5 Non-Disclosure (Wire) (§6.3 / §7)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-050 | No-access and not-found are **indistinguishable in status** | §6.3; `Doc-4A §7` | B |
| CHK-5A-051 | …indistinguishable in **response body** | §6.3; `Doc-4A §7` | B |
| CHK-5A-052 | …indistinguishable in **timing** (no timing oracle) | §6.3; `Doc-4A §7` | B |
| CHK-5A-053 | Excluded / blacklisted / routing-excluded rows undetectable (no leak via count, total, or error) | §6.3; §8; `Doc-4A §7` | B |

---

### A.6 Identity, Context & Authorization (§7)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-060 | `Authorization` carries **authentication only** (bearer); no authorization derived from it | §7 | B |
| CHK-5A-061 | Active-organization context is **server-validated, never client-trusted** | §7; `Doc-4A §5` | B |
| CHK-5A-062 | No authorization assertion accepted from any header or client input | §7; `Doc-4A §9.7` | B |
| CHK-5A-063 | Actor-type / delegation-grant context resolved server-side | §7; `Doc-4A §6` | M |

---

### A.7 Pagination, Filter & Sort (§8)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-070 | Cursor-based pagination only (opaque `cursor`); no offset/index-based pagination | §8; `Doc-4A §9.6` | B |
| CHK-5A-071 | Page-size bound referenced by **POLICY key**, never a literal | §8; `Doc-4A §18`; `Doc-3 §12` | M |
| CHK-5A-072 | Filter/sort fields drawn from the declared allowlist | §8; `Doc-4A §9.6` | M |
| CHK-5A-073 | Items, counts, and totals exclude soft-deleted / non-disclosed / routing-excluded rows **identically** | §8; `Doc-4A §7`/§10 | B |

---

### A.8 Idempotency & Concurrency (§9)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-080 | `Idempotency-Key` carried when the contract declares `Idempotency: required` | §9; `Doc-4A §14.2` | B |
| CHK-5A-081 | Duplicate request → **same result, no duplicate audit record, no duplicate outbox event** | §9.7; `Doc-4A §14.3`, §16, §17 | B |
| CHK-5A-082 | Optimistic concurrency carried via `If-Match` (`updated_at`) when `Concurrency: optimistic` | §9; `Doc-4A §14.5` | M |
| CHK-5A-083 | Retry semantics aligned to the §6 `retryable` signal | §9; §6 | m |

---

### A.9 Asynchronous Operations (§10)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-090 | Async operation realized as `202` accepted-then-processing; Phase-1 validation complete in the synchronous request | §10.1; `Doc-4A §15.1` | B |
| CHK-5A-091 | Status resource (owning Query) is the source of truth; the `202` body is not the final outcome | §10.2; `Doc-4A §15.3` | B |
| CHK-5A-092 | A result-only Query returns `ASYNC_PENDING` while pending; never a fabricated partial result | §10.3; `Doc-4A §12.2`/§15.3 | M |
| CHK-5A-093 | No fabricated activity, progress, or percentages | §10.4; `Doc-3 §12.1` | B |
| CHK-5A-094 | No synchronous facade over an async engine | §10.1; `Doc-4A §15.1` | M |
| CHK-5A-095 | No async-specific business state absent from the frozen state machine | §10.8; `Doc-2 §5`/`Doc-4M` | B |

---

### A.10 Event Surface (§11)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-100 | Event-driven completion is observed **only** via the §10 status resource | §11.2; `Doc-4A §15.3` | B |
| CHK-5A-101 | No external webhook / SSE / socket push surface defined | §11.3 | B |
| CHK-5A-102 | Event receipt is not treated as completion authority on the wire | §11.4 | M |
| CHK-5A-103 | Event catalog / payloads not restated (owned by `Doc-2 §8` / `Doc-4J`) | §11.1 | m |

---

### A.11 Versioning & Evolution (§12)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-110 | Surface version carried via `Iv-Api-Version`; no URL-path or query versioning | §12.2 | B |
| CHK-5A-111 | Breaking change bumps the surface version; additive/editorial does not | §12.3; `Doc-4A §20.2`/§20.3 | M |
| CHK-5A-112 | **Contract identity stable** — breaking change = new version, **not** a new resource/contract identity (no `…V2`-named resource) | §12.3; `Doc-4A §20.3` | B |
| CHK-5A-113 | Deprecation declared per `Doc-4A §20.4`; `Removal-Window` by POLICY key, never a literal | §12.4; `Doc-4A §20.4` | M |
| CHK-5A-114 | Domain change (entity/state/event/permission/POLICY) precedes the contract; never expressed as a surface-version bump | §12.1/§12.5; `Doc-4A §20.1` | B |

---

### A.12 Anti-Restatement / Realize-Never-Redecide (§0 / Gov-Note §6)

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-120 | No upstream normative content restated; every rule bound by pointer | §0; Gov-Note §6 | B |
| CHK-5A-121 | No new entity / state / transition / event / permission / POLICY key / error class / status / header coined | §0; `Doc-4A §20.1` | B |
| CHK-5A-122 | Transport-level choices marked `[realization convention]` | §0; §2 | m |
| CHK-5A-123 | Missing authority → flag-and-halt; nothing invented | Gov-Note §7 | B |
| CHK-5A-124 | No invented external webhook / push surface | §11.3 | B |

---

### A.13 Contract Identity & Traceability

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-131 | Every endpoint identifies its owning module (`Owner-Module`) | `Doc-4A §4.1`/§21.1; §5 | B |
| CHK-5A-132 | Every endpoint traces to a frozen Doc-4 capability/contract (no surface without a frozen owner) | `Doc-4A §20.1`; §0 | B |
| CHK-5A-133 | No endpoint references an undefined aggregate/entity | `Doc-4A §20.1`; Doc-2 | B |
| CHK-5A-134 | Contract identity remains stable under the §12 rules | §12.3 | B |

---

### A.14 Ownership & Boundary Integrity

> Binds — does not duplicate — the contract-level ownership checks already owned by `Doc-4A Appendix A` (CHK-002…009). The rows below test the **realized-surface** face (namespace placement, channel, wire ownership).

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-141 | Resource owner identified; the resource appears **only** under its owning module's route namespace | `Doc-4A §4.1`; App B.1; §5.3 | B |
| CHK-5A-142 | No foreign-aggregate ownership — the contract does not mutate or read another module's entity on the wire | `Doc-4A §4.3` | B |
| CHK-5A-143 | Cross-module interaction uses an approved channel (Services / Events / Public Contracts), never a foreign-namespace endpoint | `Doc-4A §4.2`; §5.3 | B |
| CHK-5A-144 | No ownership contradiction with Doc-2 / Doc-4; contract-level ownership defers to `Doc-4A Appendix A` (CHK-002…009), not re-decided here | Doc-2; `Doc-4A Appendix A` | B |

---

### A.15 Registry Synchronization

> Separate from usage checks: verifies that every token a contract uses is **registered and synchronized**, not merely well-formed.

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-5A-151 | Route prefix exists in Appendix B.1 (matches the canonical namespace, `Doc-2 §0.3`) | App B.1 | B |
| CHK-5A-152 | `error_code` prefix exists in `Doc-4A Appendix B.2` | App B.2 → `Doc-4A Appendix B.2` | B |
| CHK-5A-153 | Every standard-header token exists in Appendix B.4 and agrees with §4.4 | App B.4; §4.5 | B |
| CHK-5A-154 | No self-assigned namespace/registry token; new registrations via Doc-5A amendment only | App B.5; Gov-Note §5 | B |

---

*End of Doc-5A Content v1.0, Pass 11 (Appendix A). Machine-executable conformance checklist only — every `CHK-5A-xxx` binds an existing §0–§12 / Appendix B / Doc-4A obligation as a binary pass/fail test citing its source; no rule, token, status, header, error class, POLICY key, or behavior is coined. The conformance severity model is exactly `Doc-4A Appendix A`'s `[B]/[M]/[m]` (NITPICK is review-methodology, not a checklist tier). `CHK-5A-001…009` intentionally unused. Contract-level module-ownership checks are deferred to `Doc-4A Appendix A` (CHK-002…009) by pointer, not duplicated. One CORPUS GAP (`GAP-D5A-P11-01`, `reference_id` on no-body `204`) — **resolved** by `PATCH-D4A-C05-204` (Doc-4A C-05 clarified to body-bearing responses; `204` exempt; ratified 2026-06-24). Appendix C (Cross-Reference Index) follows in the final pass, conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
