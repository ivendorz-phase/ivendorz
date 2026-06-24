# Doc-5B — Platform Core (M0 `core`) API Realization — Content v1.0, Pass 4 (§6–§7 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5B — Platform Core / Shared Kernel (Module 0) — API Realization |
| Pass | 4 of N — Sections §6, §7 and Appendix A (final content pass) |
| Status | ACTIVE — Content Pass 4 of N; §6/§7/Appendix A only; pending Independent Hard Review → then Doc-5B Freeze Audit |
| Structure | Conforms to `Doc-5B_Structure_v1.0_FROZEN.md` |
| Realizes | The Doc-4B **out-of-wire** boundary (`§B6` G3, `§B7` G4, `§B10` G7, `§B8/§B9` internal reads) + the Doc-5A **Appendix A** conformance attestation for the caller-facing M0 surface (§2–§5) |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5B Content Pass-1 (§0–§2), Pass-2 (§3), Pass-3 (§4–§5; register resolved, B-01/M-03 board-ruled) |
| Contains | The out-of-wire boundary declaration (no realization) + the conformance attestation (freeze evidence) + the one open carried item. No new endpoint, status, header, error class, slug, or POLICY key |
| Audience | Architecture / API Governance Boards · Doc-5B authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** §6 declares — it does not realize — the M0 mechanisms that have **no caller-facing wire** (Structure R1); each is bound to its frozen Doc-4B contract by pointer. §7 + Appendix A attest the realized surface (§2–§5) against the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`), the freeze gate. Nothing is coined; every result cites its evidence.

**Dependency realization path:** `Doc-5A §1.3/§10.5/§11`, **Appendix A**; `Doc-4B §B6/§B7/§B8/§B9/§B10`.

---

## §6 — Out-of-Wire Boundary (G3 · G4 · G7 · G5/G6 internal reads)

### 6.1 The Boundary (Structure R1)

- Doc-5B realizes **only** the caller-facing HTTP surface (G1/G2/G5/G6 commands — §2–§5). The mechanisms below have **no HTTP wire**: they are System-actor background workers or in-process services invoked **within a consuming module's transaction**, never reached by an API caller. They are declared here, **not realized** — their implementation is code / Doc-6 (`Doc-5A §1.3` — transport-implementation deferred; `§5` — HTTP endpoints only).
- This is the **precedent-setting out-of-wire boundary** (Structure R1): every Doc-5x module with internal mechanisms documents them the same way — bound to its Doc-4x contract, given no wire.
- **Binds:** `Doc-5A §1.3`; Structure R1.

### 6.2 G3 — Outbox Dispatcher / Archiver (`Doc-4B §B6`)

- `core.phase2_dispatch_outbox_events.v1` and `core.phase2_archive_dispatched_events.v1` are **System-actor Phase-2 workers** (Template 21.5, `Response: none`; `Doc-4B §B6` per FreezeAudit Patch v1.0.1 PATCH-FA-01 — exempt from the `reference_id` Response mandate). They are scheduler-triggered, **not** caller-triggered; the dispatcher **is** the outbox delivery mechanism (`Doc-4B §B6`; outbox ownership = Doc-2/Doc-4B/Doc-4J/Doc-4L, by pointer).
- **No wire:** no path, method, status, or request/response envelope is realized. Delivery, retry, dead-letter, and reconciliation are operational concerns owned by `Doc-4B §B6` (§15.6/§16.2/§16.8). The per-event *integration* contracts (21.2) are authored by **producing** modules (`Doc-4A §4.4`), never here.
- **Binds:** `Doc-4B §B6`; `Doc-5A §11` (event surface is internal-only; no external push).

### 6.3 G4 — ID Sequence / Human-Reference Allocation (`Doc-4B §B7`)

- **UUIDv7 machine IDs** — algorithmic, in-process at entity creation; no table, no contract, no wire (`Doc-4B §B7`; Architecture §17.2). Consuming contracts declare `uuid` fields per `Doc-5A §3`.
- **`core.allocate_human_reference.v1`** — an internal-service (Template 21.4 composition, `Audience: internal-service`) invoked **inside the owning module's create-entity transaction** (`Doc-4B §B7`); it inherits the caller's context and exposes no independent idempotency key or wire. Reference prefixes/formats are owned by Doc-2 §0.1 + the Doc-4A Appendix B human-ref registry (by pointer; a new prefix is a Doc-4A patch, never invented).
- **No wire:** human-ref allocation is realized only as a downstream effect of another module's create command — which is that **module's** Doc-5x surface, never an M0 endpoint (§1.3 dependency boundary).
- **Binds:** `Doc-4B §B7`; `Doc-5A §3` (identifier types).

### 6.4 G5 / G6 — Internal Configuration & Flag Reads (`Doc-4B §B8/§B9`)

- **`core.config_value_query.v1`** (`Doc-4B §B8`) and **`core.feature_flag_evaluate.v1`** (`Doc-4B §B9`) are **internal-service runtime reads** (Template 21.3, `Audience: internal-service`): owning engines resolve POLICY values / evaluate flags **in-process by key** at runtime (`Doc-4B §B8/§B9`; Architecture §17.3). `Idempotency: not-applicable`, `Audit-Required: no`, `Events-Produced: none`.
- **No wire:** the **only** caller-facing config/flag surface is the two Admin **change/set commands** realized in §5 (`POST`). The reads are never exposed as a `GET` — an engine reading a POLICY value is not an API caller. **Proposing a read endpoint for either is an architecture change → flag-and-halt (§6.6).**
- **Binds:** `Doc-4B §B8/§B9` (internal reads); Structure R1.

### 6.5 G7 — Supporting Internal Infrastructure (`Doc-4B §B10`)

- **`core.append_audit_record.v1`** (the target of every mutating contract's §17 Audit Requirements) and **`core.write_outbox_event.v1`** (the target of every §16.2 Events Produced block) are **Internal Infrastructure Services** ([D-1] composition; closest Template 21.4, `Audience: internal-service`), invoked **within the caller's transaction** (`Doc-4B §B10`; §14.3 joint rule). They are infrastructure primitives, not standalone business commands.
- **No wire:** neither is callable over HTTP; both participate in the originating command's single transaction. A Doc-5B caller never invokes them directly — they are the in-process realization of the audit/event obligations that the §3–§5 endpoints already declare by pointer.
- **Binds:** `Doc-4B §B10`; `Doc-5A §10.5` (no synchronous facade over in-process mechanisms).

### 6.6 Flag-and-Halt Clause

- If any future work proposes an **HTTP wire** for G3, G4, G7, or the G5/G6 internal reads, that is an **architecture-affecting change** (it would create a caller surface the frozen Doc-4B contracts do not declare) — **flag-and-halt** and escalate for human/Board approval (`Doc-5_Program_Governance_Note_v1.0 §7`; CLAUDE.md Red-Flag list). Doc-5B does not, and may not, grant them a wire.
- **Binds:** `Doc-5_Program_Governance_Note_v1.0 §7`; Structure R1 / Fences.

---

## §7 — Conformance & Carried Items

### 7.1 Conformance Obligation

- Before Doc-5B may freeze it **MUST** pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`, binary pass/fail) for **every** caller-facing endpoint (§2–§5). A contract with any unresolved **`[B]`** check **MUST NOT** freeze; **`[M]`** must be resolved or deferred with escalation; **`[m]`** accepted with recorded justification (`Doc-5A Appendix A §A.0`; `Doc-5_Program_Governance_Note_v1.0 §6`). The attestation is **Appendix A** of this document.
- **Binds:** `Doc-5A Appendix A`; Gov-Note §6.

### 7.2 Attestation Summary

- The five M0 caller-facing endpoints (audit query, audit correlation lookup, audit redaction, config change, flag set) are attested in **Appendix A**. Result: **all applicable `[B]` and `[M]` checks PASS; no `[m]` deviation taken.** Checks that do not apply to a sync, non-disclosure-or-not, no-money, Admin-only surface are marked **N/A** with the reason cited (async A.9; money CHK-5A-012; org-context CHK-5A-061; etc.).
- The two Pass-3 escalations are **closed** (board ruling, OPTION A, 2026-06-24): **B-01** addressing → UUIDv7 path per `Doc-5A §5.3`; **M-03** §B9 V8 → non-wire firewall invariant, no `BUSINESS` wire row (`governanceReviews/Doc-5B_Pass3_Escalation_B01_M03.md`, CLOSED). No open BLOCKER / MAJOR / MINOR remains in the realized surface.
- **Binds:** `Doc-5A Appendix A`; Appendix A (this document).

### 7.3 Carried Item (one, open)

| ID (Doc-4B) | Item | Doc-5B handling | Gate? |
|---|---|---|---|
| **D-2** | No least-privilege `staff_*` slug for config / flag / audit-read | Binds the existing `staff_super_admin` (audit-read, config, flag) and `staff_can_redact_audit` (redaction — this slug **exists**); a least-privilege slug for the other three awaits a Doc-2 §7 additive patch (`Doc-4B §B2` [D-2], **CARRY FORWARD** per `Doc-4B_Freeze_Patch_v1.0.1 §2`) | **No** — not a freeze gate; an additive future enhancement |

- **Resolved at Doc-4B freeze, not Doc-5B's to carry** (provenance only): D-1 (internal-service template — realized out-of-wire, §6), D-4 (config governance ownership — Module 0 stores, Module 8 governs), D-5 (outbox audit granularity), PA-E1 (POLICY-key registration), PA-E2 (config-change governance ownership) (`Doc-4B_Freeze_Patch_v1.0.1 §2`; by pointer).
- **Binds:** `Doc-4B §B2`; `Doc-4B_Freeze_Patch_v1.0.1 §2`; Doc-2 §7.

### 7.4 Doc-5B Coins Nothing

- Doc-5B realizes the wire face of frozen Doc-4B contracts and **coins no** endpoint identity, HTTP status, header token, error class, `error_code`, permission slug, or POLICY key (`CHK-5A-121`, `CHK-5A-154`; `Doc-4A §6.4` / §20.1). Every path segment, status, header, code, and key resolves to an existing Doc-5A / Doc-4B / Doc-2 / Doc-3 owner by pointer. Where a declared element lacked a wire authority (Pass-3 B-01/M-03), Doc-5B **escalated** rather than invented (`CHK-5A-123`).
- **Binds:** `Doc-5A Appendix A` (CHK-5A-121/123/154); `Doc-4A §6.4/§20.1`.

---

## Appendix A — Doc-5B Conformance Attestation

Per-band attestation of the realized M0 caller-facing surface (§2–§5) against the Doc-5A **Appendix A** checklist. **PASS** = satisfied for every endpoint to which the check applies; **N/A** = the check's precondition is absent on this surface (reason cited). No `[B]`/`[M]` is unresolved; no `[m]` deviation is taken. Evidence cites the Doc-5B section that realizes the check.

| ID | Sev | Result | Evidence / scope |
|---|---|---|---|
| **A.1 Naming & Serialization** ||||
| CHK-5A-010 | B | PASS | JSON/UTF-8 envelope — §3/§4/§5 (`Doc-5A §3`) |
| CHK-5A-011 | M | PASS | Field names `snake_case`, from Doc-4B contracts by pointer |
| CHK-5A-012 | B | **N/A** | No money field on the M0 audit/config/flag surface |
| CHK-5A-013 | M | PASS | `updated_at` etc. in §3 canonical wire form |
| CHK-5A-014 | B | PASS | `audit_id` / `{id}` = UUIDv7; no `human_ref` on these surfaces — §3.4/§4.1/§5.1 |
| CHK-5A-015 | B | PASS | `actor_type`/`action`/`value_type` enums owned by Doc-2; none invented |
| **A.2 Transport Envelope & Headers** ||||
| CHK-5A-020 | M | PASS | Single §4 envelope across all five endpoints |
| CHK-5A-021 | B | PASS | Only registered standard headers; tokens per §4.4 / App B.4 |
| CHK-5A-022 | M | PASS | No `Iv-` token used beyond the registered set |
| CHK-5A-023 | B | PASS | No identity/role/tenant-assertion/POLICY-override header — authorization server-side (§3.7/§4.5/§5.5) |
| CHK-5A-024 | B | PASS | `Authorization` present; `Iv-Active-Organization` correctly **absent** (Admin carries no org context — §7.3) |
| CHK-5A-025 | M | PASS | Reads carry no `Idempotency-Key`/`If-Match`; commands carry both; `Iv-Api-Version` per §12 — §3.8/§4.2/§5.3 |
| **A.3 Endpoint Realization** ||||
| CHK-5A-030 | B | PASS | Every endpoint instantiates the §5.7 template — §3.1/§4.1/§5.1 |
| CHK-5A-031 | B | PASS | `GET` reads, `POST` commands per §5.2 — §2.3 |
| CHK-5A-032 | B | PASS | Paths follow the §5.3 grammar — §2.1 |
| CHK-5A-033 | B | PASS | Mutations are named command sub-resources (`admin_*`), never field replacement — §4.1/§5.1 |
| CHK-5A-034 | B | PASS | Input placement per §5.4; no prohibited field (org-context/authz never an input) — §3.2/§4.1/§5.1 |
| CHK-5A-035 | M | PASS | All five return `200` (§5.5 family) — §2.3 |
| CHK-5A-036 | m | PASS | Command tokens are compound operation names, not abstract `get`/`update` — §2.1 |
| **A.4 Error & Status Mapping** ||||
| CHK-5A-040 | B | PASS | class→status mapping realized — §3.6/§4.4/§5.4 |
| CHK-5A-041 | B | PASS | §6 canonical error envelope |
| CHK-5A-042 | B | PASS | Top-level `reference_id` on every body-bearing response (`Doc-4A §22.1 C-05` per `PATCH-D4A-C05-204`) — §3.4/§4.1/§5.1 |
| CHK-5A-043 | B | PASS | All codes within the registered `core_` namespace — §3.6/§4.4/§5.4 |
| CHK-5A-044 | M | PASS | `RATE_LIMITED` carries `Retry-After` (read); commands non-retryable — §3.6 |
| CHK-5A-045 | M | PASS / N/A | Read realizes `Doc-4A §19` rate response; commands declare no rate limit (N/A) — §3.6 |
| **A.5 Non-Disclosure (Wire)** ||||
| CHK-5A-050 | B | PASS / N/A | PASS audit read + redaction (404 collapse); N/A config·flag (`Timing-Uniformity: not-applicable`) — §3.5/§4.3 |
| CHK-5A-051 | B | PASS / N/A | Body indistinguishable — §3.5/§4.3; N/A config·flag |
| CHK-5A-052 | B | PASS / N/A | Timing indistinguishable — §3.5/§4.3; N/A config·flag |
| CHK-5A-053 | B | PASS / N/A | No leak via count/total/error (audit); N/A config·flag — §3.5 |
| **A.6 Identity, Context & Authorization** ||||
| CHK-5A-060 | B | PASS | `Authorization` = authentication only — §3.7/§4.5/§5.5 |
| CHK-5A-061 | B | N/A | No active-organization context on the Admin surface; nothing client-trusted (§7.3) |
| CHK-5A-062 | B | PASS | No authz assertion accepted from client input — §3.7/§5.5 |
| CHK-5A-063 | M | PASS | Actor-type server-resolved; no delegation (not eligible) — §3.7 |
| **A.7 Pagination, Filter & Sort** ||||
| CHK-5A-070 | B | PASS / N/A | Cursor-only for `audit_record_query.v1`; correlation-lookup + commands non-paginated (N/A) — §3.3 |
| CHK-5A-071 | M | PASS / N/A | Page-size via POLICY key (audit query); N/A elsewhere — §3.3 |
| CHK-5A-072 | M | PASS / N/A | Filter/sort allowlist (audit query); N/A elsewhere — §3.2/§3.3 |
| CHK-5A-073 | B | PASS / N/A | Counts exclude non-disclosed rows identically (audit); N/A commands — §3.4/§3.5 |
| **A.8 Idempotency & Concurrency** ||||
| CHK-5A-080 | B | PASS | `Idempotency-Key` mandatory on redaction/config/flag (`required`); reads `not-applicable` — §4.2/§5.3 |
| CHK-5A-081 | B | PASS | Replay → same result, no duplicate audit record (redaction outbox leg N/A; config no duplicate downstream) — §4.2/§5.3 |
| CHK-5A-082 | M | PASS | `If-Match` (`updated_at`) on the three commands (`optimistic`); reads N/A — §4.2/§5.3 |
| CHK-5A-083 | m | PASS | Retry aligned to the §6 `retryable` signal — §3.6 |
| **A.9 Asynchronous Operations** ||||
| CHK-5A-090…095 | B/M | **N/A** | All five M0 caller contracts declare `Execution: sync` (no async; no `202`) — `Doc-4B §B4/§B5/§B8/§B9` |
| **A.10 Event Surface** ||||
| CHK-5A-100 | B | N/A | No event-driven completion on these surfaces (sync; `Events-Produced: none`) |
| CHK-5A-101 | B | PASS | No external webhook / SSE / socket push surface defined — §6.2 (event surface internal-only) |
| CHK-5A-102 | M | N/A | No event surface on these endpoints |
| CHK-5A-103 | m | PASS | Event catalog/payloads not restated (`Events-Produced: none`, by pointer) |
| **A.11 Versioning & Evolution** ||||
| CHK-5A-110 | B | PASS | No URL-path/query versioning; surface version via `Iv-Api-Version` (conditional, §12) — §2.1 |
| CHK-5A-111 | M | N/A | Initial `v1` realization; no breaking change to bump |
| CHK-5A-112 | B | PASS | Contract identity stable; no `…V2`-named resource |
| CHK-5A-113 | M | N/A | No deprecation declared |
| CHK-5A-114 | B | PASS | No domain change expressed as a surface-version bump |
| **A.12 Anti-Restatement / Realize-Never-Redecide** ||||
| CHK-5A-120 | B | PASS | No upstream normative content restated; bound by pointer throughout |
| CHK-5A-121 | B | PASS | No entity/state/event/permission/POLICY key/error class/status/header coined — §7.4 |
| CHK-5A-122 | m | PASS | Transport choices marked `[realization convention]` — §2.1/§4.1/§5.1 |
| CHK-5A-123 | B | PASS | B-01/M-03 escalated (flag-and-halt), not invented — §5.1/§5.4; escalation record |
| CHK-5A-124 | B | PASS | No invented external webhook/push surface — §6.2 |
| **A.13 Contract Identity & Traceability** ||||
| CHK-5A-131 | B | PASS | `Owner-Module` = Module 0 on every endpoint |
| CHK-5A-132 | B | PASS | Each traces to a frozen Doc-4B contract (§B4/§B5/§B8/§B9) — §2.2 |
| CHK-5A-133 | B | PASS | No undefined aggregate/entity referenced |
| CHK-5A-134 | B | PASS | Contract identity stable under §12 — CHK-5A-112 |
| **A.14 Ownership & Boundary Integrity** ||||
| CHK-5A-141 | B | PASS | Resources appear only under the `core` namespace — §2.1 |
| CHK-5A-142 | B | PASS | No foreign-aggregate read/mutate on the wire; scoring-key effect is out-of-wire — §5.2 |
| CHK-5A-143 | B | PASS | Cross-module interaction via approved channel (Trust integration service, out-of-wire), no foreign-namespace endpoint — §5.2/§6 |
| CHK-5A-144 | B | PASS | No ownership contradiction; contract-level ownership defers to `Doc-4A Appendix A` |
| **A.15 Registry Synchronization** ||||
| CHK-5A-151 | B | PASS | `core` route prefix in App B.1 (canonical, Doc-2 §0.3) — §2.1 |
| CHK-5A-152 | B | PASS | `core_` `error_code` prefix in `Doc-4A Appendix B.2` — §3.6/§4.4/§5.4 |
| CHK-5A-153 | B | PASS | Standard-header tokens exist in App B.4 and agree with §4.4 — §4 |
| CHK-5A-154 | B | PASS | No self-assigned namespace/registry token — §7.4 |

**Attestation result:** all applicable `[B]` and `[M]` checks **PASS**; `[m]` checks PASS with no deviation. `CHK-5A-001…009` are owned by `Doc-4A Appendix A` (not in Doc-5B's scope). **No unresolved check blocks the Doc-5B freeze.**

---

*End of Doc-5B Content v1.0, Pass 4 (§6–§7 + Appendix A) — the final content pass. §6 declares the out-of-wire boundary (G3 outbox, G4 ID/human-ref, G7 internal infrastructure, G5/G6 internal reads) with no realization and a flag-and-halt clause; §7 attests conformance and carries the one open item (D-2); Appendix A is the per-band `CHK-5A-xxx` freeze evidence — all applicable `[B]`/`[M]` PASS, no `[m]` deviation, nothing coined. Doc-5B content (§0–§7 + Appendix A) is complete; next is the Doc-5B Freeze Readiness Audit, conforming to `Doc-5B_Structure_v1.0_FROZEN.md`.*
