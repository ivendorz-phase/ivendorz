# Doc-4H_PassB_Part1_Independent_Hard_Review_v1.0

## Architecture Board — Independent Hard Review

**Document Under Review:** `Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0`
**Module:** Module 6 — Communication Engine · BC-COMM-1 Messaging
**Contracts Reviewed:** `comm.create_thread.v1` · `comm.get_thread.v1` · `comm.list_threads.v1` · `comm.send_message.v1` · `comm.get_messages.v1`
**Review Type:** Pass-B Hard Review — defect-discovery only.

**Corpus Precedence:** Architecture → ADR → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B v1.0 → Doc-4C v1.0 → Doc-4D v1.0 → Doc-4E v1.0 → Doc-4F v1.0 → Doc-4G v1.0 → Doc-4H_Structure_v1.0_FROZEN → Doc-4H_PassA_v1.0_FROZEN.

**Conflict policy:** FLAG-AND-HALT — no conflict requiring halt encountered.

---

## Executive Summary

**APPROVED WITH PATCH REQUIRED**

`Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0` is implementation-grade in all material respects. The five contracts carry complete 12-section records, correct nine-stage validation matrices (for mutation contracts), correct authorization, correct state enforcement, correct audit bindings, correct event posture (BC-COMM-1 emits nothing), correct idempotency, correct error-model separation (REFERENCE/DEPENDENCY, STATE/CONFLICT), and correct procurement-moat and trust-firewall postures. One structural defect prevents direct freeze:

- **F4H-PB2-M1 (MINOR):** `comm.get_thread.v1` / `comm.list_threads.v1` (§HB-1.2) and `comm.get_messages.v1` (§HB-1.4) omit Stage 8 BUSINESS from their Validation Matrices. Doc-4A §11.2 mandates the canonical nine-stage order be present in full; FROZEN Pass-B precedents (Doc-4F) carry Stage 8 as an explicit "n/a — read" row in every query contract. The omission is a structural incompleteness, not a logic error.

No BLOCKER. One MINOR. Rest of document is clean.

---

## Domain 1 — Pass-B Completeness

**PASS**

All 5 contracts carry all 12 required sections:

| Contract | §1 Meta | §2 Req | §3 Resp | §4 Val | §5 Authz | §6 State | §7 Audit | §8 Event | §9 Error | §10 Idem | §11 Cross | §12 AI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `create_thread.v1` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `get_thread.v1` / `list_threads.v1` | ✓ | ✓ | ✓ | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `send_message.v1` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `get_messages.v1` | ✓ | ✓ | ✓ | ✓* | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

*Stage 8 BUSINESS absent — F4H-PB2-M1 (see Domain 3).

Field-level request/response schemas present and bound to Doc-2 §10.7 columns. Error Boundary blocks present in every contract. Idempotency rules present. AI-Agent Notes present. No Pass-A content (pointer-only) mistakenly absent at Pass-B depth.

---

## Domain 2 — Pass-A Conformance

**PASS**

| Dimension | Pass-A frozen value | Pass-B declared value | Match |
|---|---|---|---|
| Owning BC | BC-COMM-1 | BC-COMM-1 | ✓ |
| Aggregate | Thread (`threads` / `messages` / `thread_participants`) | Thread (`threads` / `messages`) | ✓ |
| Operation templates | 21.4 Command (mutations) · 21.3 Query (reads) | same | ✓ |
| Actor | User | User | ✓ |
| Permission family | `can_use_messaging` (Doc-2 §7) | `can_use_messaging` | ✓ |
| Lifecycle | `open → closed` · append-only · `active → removed` | same | ✓ |
| Events emitted | none | none | ✓ |
| Events consumed | none (BC-COMM-1) | none | ✓ |
| Audit | `[ESC-COMM-AUDIT]` on mutations; reads unaudited | same | ✓ |
| DH dependencies | DH-1, DH-3, DH-8 | same | ✓ |

No ownership drift. No actor drift. No lifecycle drift. No permission drift. No event drift.

---

## Domain 3 — Validation Integrity

**FAIL** → finding F4H-PB2-M1

**Mutation contracts** (`comm.create_thread.v1`, `comm.send_message.v1`) — all 9 stages present with stage number, authority, rule, and failure class. ✓

**Query contracts** (`comm.get_thread.v1` / `comm.list_threads.v1`, `comm.get_messages.v1`) — **Stage 8 BUSINESS absent** (no row, no explicit "n/a"). Stages 1–7, 9 present with correct content.

Doc-4A §11.2 fixes the nine-stage canonical order as **FIXED, "never reordered"** — the stage order is a structural invariant. FROZEN Doc-4F Pass-B read contracts carry Stage 8 as an explicit "n/a — read" row. The omission is not a logic error (reads cannot trigger a BUSINESS rule failure) but is a structural incompleteness that violates the canonical-completeness requirement: every matrix must represent all nine stages.

All other stage attributes are correct: stage order for present stages is 1→2→3→4→5→6→7→(8 absent)→9; authorities cited; failure classes correct; no stage reordering.

---

## Domain 4 — Authorization Integrity

**PASS**

`can_use_messaging` is a Doc-2 §7 catalog slug. ✓

**Participant scope:** enforced at Stage 4 SCOPE via `thread_participants` grant (`active`) in all applicable contracts. ✓

**Cross-tenant handling:** non-participant → `NOT_FOUND` collapse (§7.5/§12.4). Stated in H.3, H.9, per-contract Stage 4 SCOPE, Error Boundary blocks. ✓

**NOT_FOUND collapse:** consistently applied: non-participant is `NOT_FOUND`, not `AUTHORIZATION` — existence not disclosed. ✓

**Identity authority:** `check_permission` (Doc-4C) cited in H.3 and Authorization Matrices. ✓

**No shadow authorization.** No slug invented. No delegation (correctly excluded — H.3 cites Doc-4A §6B; messaging is membership-scoped, not delegation-eligible). ✓

---

## Domain 5 — State Integrity

**PASS**

| Lifecycle | Declared | Doc-2 §3.7/§10.7 | Match |
|---|---|---|---|
| `threads` | `open → closed` (`closed` terminal) | ✓ | ✓ |
| `messages` | append-only (soft-delete = hidden) | ✓ | ✓ |
| `thread_participants` | `active → removed` | ✓ | ✓ |

State enforcement in `comm.send_message.v1` correctly forbids send to `closed` thread (→ `STATE`). ✓

`comm.get_messages.v1` correctly states messages are readable by participants on both `open` and `closed` threads — consistent with append-only immutability. ✓

Concurrency model: message append is additive (no row-revision race); `close_thread` (not in this Part) is designated for optimistic `expected_status` — documented in H.5 for later Part. ✓

No invented state. No invented transition. Sequences unchanged.

---

## Domain 6 — Audit Integrity

**PASS**

| Contract | Audit | Correct |
|---|---|---|
| `comm.create_thread.v1` | `[ESC-COMM-AUDIT]` — attribution User, org, entity_type=threads, entity_id, timestamp, in-transaction | ✓ |
| `comm.get_thread.v1` / `comm.list_threads.v1` | None (reads not audited — §17.1) | ✓ |
| `comm.send_message.v1` | `[ESC-COMM-AUDIT]` — attribution User, org, entity_type=messages, entity_id, timestamp, in-transaction | ✓ |
| `comm.get_messages.v1` | None (reads not audited — §17.1) | ✓ |

`[ESC-COMM-AUDIT]` correctly carried (Doc-2 §9 enumerates no Communication action; no action invented). ✓ Doc-4B `core.append_audit_record.v1` cited as the mechanism. ✓

---

## Domain 7 — Event Integrity

**PASS**

**BC-COMM-1 emits NO Doc-2 §8 event.** All 5 contracts declare `Produced: none`. ✓

H.7 explicitly states: "BC-COMM-1 emits NO Doc-2 §8 domain event and consumes none." ✓

**Message notification handling:** §HB-1.3 Section 8 states: "recipient notification is a **BC-COMM-2 effect derived from state, not a BC-COMM-1 event**." H.7 restates this. Appendix A invariants restate this. Three independent locations — correct and unambiguous. ✓

No event invented. No ownership leakage. No hidden event production. No 21.2 Integration contract authored. ✓

---

## Domain 8 — Dependency Integrity

**PASS**

| DH | Owner | Direction | Pass-B declaration | Correct |
|---|---|---|---|---|
| DH-1 | Identity (Doc-4C) | consume | active-org/membership resolution, `check_permission`, participant org resolution | ✓ |
| DH-3 | RFQ (Doc-4E) | consume (rule read) | `context_id` reference for `rfq_clarification`; **read RFQ-owned scrub rule by service, apply content-side** — rule stays RFQ; Communication holds no copy; no procurement decision | ✓ |
| DH-8 | Platform Core (Doc-4B) | consume | audit-write, storage (`attachments_refs`), Realtime backing | ✓ |

**DH-3 RFQ scrub seam:** correctly authored in H.9, §HB-1.3 Sections 2/4/5/8/11/12, Appendix A invariants, Appendix B. Seam is one-directional (read only); rule definition stays in RFQ/Doc-3; Communication makes no procurement decision and holds no copy. ✓

No dependency inversion. No ownership transfer. All directions inbound (consume). No hidden dependency.

---

## Domain 9 — Error Model Integrity

**PASS**

Doc-4A §12 closed class set used throughout. All classes present in registers are from the enumerated set. ✓

**REFERENCE vs DEPENDENCY separation:** H.4 defines the distinction explicitly. `comm.create_thread.v1` and `comm.send_message.v1` Error Registers and Boundary blocks separate them correctly — `REFERENCE` (definitive negative, `retryable: false`) vs `DEPENDENCY` (transient unavailability, `retryable: true`). ✓

**STATE vs CONFLICT separation:** H.5 states the distinction. `comm.send_message.v1` Error Boundary block explicitly notes "STATE (closed thread) is distinct from CONFLICT." ✓

**Protected-fact handling:** non-participant → `NOT_FOUND` (never `AUTHORIZATION`) in all three read/write participant-scoped contracts. Error Boundary blocks state "not-participant / not-exist identical" (Timing-Uniformity). ✓

No Category 9 POLICY-limit error class used in Part 1. ✓

---

## Domain 10 — Idempotency Integrity

**PASS**

| Contract | Idempotency | Correct |
|---|---|---|
| `comm.create_thread.v1` | required + `[ESC-COMM-POLICY]` dedup window; replay → same `thread_id`, no duplicate row/audit | ✓ |
| `comm.get_thread.v1` / `comm.list_threads.v1` | not-applicable (pure query) | ✓ |
| `comm.send_message.v1` | required + `[ESC-COMM-POLICY]` dedup window; replay → one `messages` row, no duplicate audit | ✓ |
| `comm.get_messages.v1` | not-applicable (pure query) | ✓ |

`[ESC-COMM-POLICY]` correctly carried for dedup-window key (no `communication` namespace key registered in Doc-3 §12.2; platform default referenced by name; no key invented). ✓

---

## Domain 11 — Procurement Moat Audit

**PASS**

BC-COMM-1 owns none of: matching, routing, ranking, quotation evaluation, supplier selection, awards. ✓

DH-3 scrub-rule seam is the only RFQ touch-point. The rule is read from the RFQ service by pointer; Communication applies it content-side only; makes no procurement decision. The seam is explicitly documented at every applicable location. ✓

`context_id` is a bare UUID reference — Messaging owns no RFQ entity. ✓

---

## Domain 12 — Trust Firewall Audit

**PASS**

BC-COMM-1 computes/owns no Trust, Performance, Verification, or Governance score. DH-5 is listed as "none" in §HB-1.3 Cross-Module ("Trust (DH-5): none — Messaging computes/references no score (firewall)"). No score mutation path exists in any contract. ✓

`context_id` references RFQ context by bare UUID — no Trust authority accessed. ✓

---

## Domain 13 — AI-Agent Determinism

**PASS WITH CAVEAT** (F4H-PB2-M1 creates a structural gap)

**Ownership determinism:** All 5 contracts name their owning BC (BC-COMM-1) and aggregate (Thread). ✓

**Authorization determinism:** Participant scope explicit; `NOT_FOUND` collapse rule stated; no delegation. ✓

**Lifecycle determinism:** Send-to-closed → `STATE`; append-only stated; reads on open/closed threads both permitted. ✓

**Dependency determinism:** DH-3 scrub-rule seam fully articulated — AI coding agent cannot misinterpret ownership. ✓

**Event determinism:** BC-COMM-1 emits nothing; BC-COMM-2 notification effect stated. ✓

**Caveat:** The absence of Stage 8 BUSINESS rows in the two read-contract Validation Matrices (F4H-PB2-M1) means an AI agent implementing the matrix line-by-line will not encounter an explicit "n/a" confirmation at that stage position. While the logic is correct (reads have no BUSINESS rule), the structural gap could lead an agent to introduce a stage-8 check by inference.

---

## Findings

---

### Governance Defects

---

**Finding F4H-PB2-M1**

**Severity:** MINOR

**Location:** §HB-1.2 `comm.get_thread.v1` / `comm.list_threads.v1` Validation Matrix (Section 4); §HB-1.4 `comm.get_messages.v1` Validation Matrix (Section 4).

**Issue:** Stage 8 BUSINESS is absent from the Validation Matrices of both read contracts. The Doc-4A §11.2 canonical nine-stage order is FIXED and "never reordered" — this is a structural invariant, not a per-stage optional. FROZEN Doc-4F Pass-B read contracts carry Stage 8 as an explicit "n/a — read" row in every query matrix. The omission is a structural incompleteness: the stage must appear (with `—` or "n/a") to confirm it was considered and deliberately excluded, not overlooked.

**Governance Impact:** Low risk at runtime (reads cannot trigger a BUSINESS rule violation), but violates the canonical-completeness requirement of Doc-4A §11.2. An AI coding agent implementing the matrix may introduce a stage-8 check by inference from the gap, or a future reviewer may treat the absence as an open question rather than a deliberate exclusion. Structural incompleteness could propagate to later Part documents as a false precedent.

**Required Fix:** In both affected Validation Matrices, add Stage 8 BUSINESS with a "n/a — read" (or equivalent) row, citing Doc-4A §11.2 as authority and failure class "—" (not applicable). No logic change required; this is a structural completeness patch only.

---

### Implementation Risks

*(No additional implementation risks beyond the governance defect above. F4H-PB2-M1 creates a minor AI-agent ambiguity but no authorization, lifecycle, or business-logic implementation risk.)*

---

## Final Assessment

| Severity | Count |
|---|---|
| Open BLOCKER | 0 |
| Open MAJOR | 0 |
| Open MINOR | 1 — F4H-PB2-M1 (Stage 8 BUSINESS absent from two read-contract Validation Matrices) |
| Open NITPICK | 0 |

---

## Pass-B Readiness

**APPROVED WITH PATCH REQUIRED**

Document is implementation-grade, governance-safe, moat-intact, firewall-intact, and correctly hardened. One structural completeness gap must be patched before freeze.

---

## Approval Question

**Can this document proceed directly to `Doc-4H_PassB_Part1_Freeze_Audit_v1.0`?**

**NO**

F4H-PB2-M1 must be patched first. The defect is localized (two Validation Matrix rows, no logic change) and patchable without structural change. Required path: `Doc-4H_PassB_Part1_Patch_v1.0` → `Doc-4H_PassB_Part1_Patch_Verification_v1.0` → `Doc-4H_PassB_Part1_Freeze_Audit_v1.0`.

---

*End of Doc-4H_PassB_Part1_Independent_Hard_Review_v1.0. One finding: F4H-PB2-M1 (MINOR — Stage 8 BUSINESS absent from §HB-1.2 and §HB-1.4 Validation Matrices). All other domains PASS. BC-COMM-1 emits no event, owns no scores, holds no procurement authority, correctly separates REFERENCE/DEPENDENCY and STATE/CONFLICT, carries all escalation markers, and conforms fully to `Doc-4H_PassA_v1.0_FROZEN`. APPROVED WITH PATCH REQUIRED — proceed to Doc-4H_PassB_Part1_Patch_v1.0.*
