# Doc-4H_PassB_Part1b_Independent_Hard_Review_v1.0

## Architecture Board — Independent Hard Review

**Document Under Review:** `Doc-4H_PassB_Part1b_BC-COMM-1_Participant_And_Close_v1.0`
**Module:** Module 6 — Communication Engine · BC-COMM-1 Messaging (deferred contracts)
**Contracts Reviewed:** `comm.add_thread_participant.v1` · `comm.remove_thread_participant.v1` · `comm.close_thread.v1`
**Review Type:** Pass-B Hard Review — defect-discovery only.

**Corpus Precedence:** Architecture → ADR → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B v1.0 → Doc-4C v1.0 → Doc-4D v1.0 → Doc-4E v1.0 → Doc-4F v1.0 → Doc-4G v1.0 → Doc-4H_Structure_v1.0_FROZEN → Doc-4H_PassA_v1.0_FROZEN → Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0_FROZEN → BC-COMM-2 (FROZEN) → BC-COMM-3 (FROZEN) → BC-COMM-4 (FROZEN).

**Conflict policy:** FLAG-AND-HALT — no conflict requiring halt encountered.

---

# Governance Defects

*None.*

---

# Implementation Risks

*None.*

---

# Executive Summary

**APPROVED FOR FREEZE AUDIT**

`Doc-4H_PassB_Part1b_BC-COMM-1_Participant_And_Close_v1.0` is clean across all 14 review domains. All three deferred BC-COMM-1 contracts carry complete 12-section Pass-B records. The contract inventory exactly matches the frozen Pass-A HA-4.1 deferred set — `comm.add_thread_participant.v1`, `comm.remove_thread_participant.v1`, `comm.close_thread.v1` — no addition, no omission, no rename. Aggregate ownership is exclusively Thread (`thread_participants` / `threads`) under BC-COMM-1 with no drift. Validation matrices are canonical nine-stage throughout; Stage 8 BUSINESS is explicitly present on all three mutation contracts. Authorization is correctly unified under `can_use_messaging` (Doc-2 §7) with no slug invented; non-participant actor collapses to `NOT_FOUND` across all three contracts. The lifecycle is exactly `thread_participants active → removed` (removal retains audit; no hard delete) and `threads open → closed` (terminal; no re-open edge). `close_thread` carries `expected_status` with a lost race → `CONFLICT`, explicitly distinguished from `STATE` at Stage 6, Section 6 State Enforcement, Error Boundary block, and AI-Agent Notes. CONFLICT is correctly absent from the `add`/`remove` error register — those contracts carry no optimistic-concurrency assertion. REFERENCE/DEPENDENCY separated throughout. All three mutations bind `[ESC-COMM-AUDIT]` in-transaction; no audit action invented. BC-COMM-1 emits and consumes no Doc-2 §8 event; notification of a participant change or thread close is correctly characterised as a BC-COMM-2 derived effect. DH-1 and DH-8 are the only active dependencies; DH-3 and DH-5 appear only as negative assertions. Procurement moat and Trust firewall intact. With this Part frozen, BC-COMM-1 is contract-complete (7 of 7) and F-MOD6-M1 is cleared pending the freeze pipeline. No defects found.

| Severity | Count |
|---|---|
| Open BLOCKER | 0 |
| Open MAJOR | 0 |
| Open MINOR | 0 |
| Open NITPICK | 0 |

---

## Domain 1 — Contract Inventory Integrity

**PASS**

Frozen expected inventory (Pass-A HA-4.1, deferred set):

| Expected | Present | Match |
|---|---|---|
| `comm.add_thread_participant.v1` | §HB-1b.1 | ✓ |
| `comm.remove_thread_participant.v1` | §HB-1b.1 (paired per HA-4.1) | ✓ |
| `comm.close_thread.v1` | §HB-1b.2 | ✓ |

No addition. No omission. No rename. No merge beyond the Pass-A pairing. Appendix A register confirms all three exactly. Contract-inventory gate present; traces to frozen Pass-A HA-4.1. ✓

---

## Domain 2 — Aggregate Ownership Integrity

**PASS**

BC-COMM-1 owns the **Thread** aggregate (`threads` root; `messages` child; `thread_participants` child). `comm.add_thread_participant.v1` / `comm.remove_thread_participant.v1` bind the `thread_participants` child; `comm.close_thread.v1` binds the `threads` root. H.10 carries the same frozen Doc-2 §10.7 field table as FROZEN Part 1.

No new aggregate declared. No Support Ticket ownership. No Notification ownership. No ownership drift. BC-COMM-1 owns no other module's entity. ✓

---

## Domain 3 — Pass-A Conformance

**PASS**

| Dimension | Pass-A frozen value (HA-4.1) | Part 1b declared value | Match |
|---|---|---|---|
| Owning BC | BC-COMM-1 | BC-COMM-1 | ✓ |
| Aggregate (participant ops) | Thread (`thread_participants`) | Thread (`thread_participants`) | ✓ |
| Aggregate (close) | Thread (`threads`) | Thread (`threads`) | ✓ |
| Operation template | 21.4 Command | 21.4 Command | ✓ |
| Actor | User (thread owner / authorized participant) | User (thread owner / authorized participant) | ✓ |
| Permission family | `can_use_messaging` | `can_use_messaging` | ✓ |
| Lifecycle (participant) | `thread_participants active → removed` | same | ✓ |
| Lifecycle (close) | `threads open → closed` | same | ✓ |
| Events emitted | none | none | ✓ |
| Events consumed | none | none | ✓ |
| Audit | `[ESC-COMM-AUDIT]` on all three mutations | same | ✓ |
| Dependencies | DH-1 (participant); DH-8 (close) | DH-1 / DH-8 (active); DH-3/DH-5 negative-asserted | ✓ |

No ownership drift. No actor drift. No lifecycle drift. No permission drift. No event drift. No audit-model change. ✓

---

## Domain 4 — Validation Integrity

**PASS**

All three contracts carry all nine canonical stages in canonical order (1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY). Every row carries stage, authority, validation, failure class.

| Contract | Stages present | Stage 8 treatment | Stage 7 treatment | Correct |
|---|---|---|---|---|
| `add_thread_participant.v1` | 1–9 | BUSINESS: "participant grant carries no procurement/business decision (transports, never decides)" | REFERENCE: grantee resolution via Identity — definitive vs transient | ✓ |
| `remove_thread_participant.v1` | 1–9 (shared matrix) | same | same | ✓ |
| `close_thread.v1` | 1–9 | BUSINESS: "closing a thread carries no procurement/business decision" | "none (in-aggregate; `thread_id` resolved at SCOPE)" | ✓ |

Stage 5 DELEGATION: "n/a — messaging not delegation-eligible (H.3)" with dash for failure class — consistent with frozen Part 1 treatment of non-applicable stages. ✓

No stage omitted. No stage reordered. No stage invented. ✓

---

## Domain 5 — Authorization Integrity

**PASS**

**Slug:** `can_use_messaging` (Doc-2 §7) — the sole slug. No slug invented. `[ESC-COMM-SLUG]` carried for the module (Appendix B) but not required for these three contracts (all bind `can_use_messaging`). ✓

**NOT_FOUND collapse:** Stage 4 SCOPE for both contract groups: actor's org/user must have an `active` `thread_participants` grant on `thread_id`; else → `NOT_FOUND` collapse. H.9 explicit: "a non-participant reference collapses to `NOT_FOUND` (§7.5; §12.4)." Error Boundary blocks for both contract groups: "a non-participant actor is `NOT_FOUND`, never `AUTHORIZATION` (which would confirm the thread's existence)." ✓

**Timing-Uniformity:** stated in both Error Boundary blocks: "not-participant / not-exist identical." ✓

**Cross-tenant protection:** Section 5 Authorization Matrix for both groups: "Cross-tenant: a non-participant actor → `NOT_FOUND` (collapse; existence not disclosed)." ✓

**No shadow permissions.** Identity `check_permission` (Doc-4C §C3/§C8) is the sole enforcement mechanism, consumed via DH-1. ✓

---

## Domain 6 — Lifecycle Integrity

**PASS**

**`thread_participants`:** lifecycle `active → removed`. `add_thread_participant` creates a grant row at `active`; `remove_thread_participant` transitions `active → removed`. `removed` retains audit row (Doc-2 §10.7 "NO (removed state)"; not hard-deleted). Cannot grant on a `closed` thread → `STATE`. ✓

**`threads`:** lifecycle `open → closed`. `close_thread` transitions `open → closed`. `closed` is terminal; no re-open edge exists (Doc-2 §3.7). ✓

**STATE ≠ CONFLICT:** `close_thread` Section 6 and Error Boundary block: "`STATE` (close illegal from current state) is distinct from `CONFLICT` (optimistic-concurrency lost race on `expected_status`)` — never merged." AI-Agent Notes: "a lost race is `CONFLICT`, never `STATE` (and never merged)." ✓

**No state invented. No transition invented. No lifecycle drift.** ✓

**Note on CONFLICT absence from `add`/`remove`:** `comm.add_thread_participant.v1` and `comm.remove_thread_participant.v1` do not carry `CONFLICT` in their error registers. This is correct — those contracts carry no `expected_status` optimistic-concurrency assertion. The PK-uniqueness on `(thread_id, participant_organization_id)` governs duplicate grant attempts (idempotent no-op, not a race). CONFLICT would only arise from an optimistic-concurrency assertion, which these contracts do not use. The omission is accurate. ✓

---

## Domain 7 — Audit Integrity

**PASS**

| Contract | Audit trigger | Attribution | Entity scope | In-transaction | Escalation marker | Correct |
|---|---|---|---|---|---|---|
| `comm.add_thread_participant.v1` | participant grant | User | `entity_type=thread_participants`, entity_id (PK) | Doc-4B `core.append_audit_record.v1` | `[ESC-COMM-AUDIT]` | ✓ |
| `comm.remove_thread_participant.v1` | participant removal | User | `entity_type=thread_participants`, entity_id (grant row/PK) | Doc-4B (in-transaction) | `[ESC-COMM-AUDIT]` | ✓ |
| `comm.close_thread.v1` | thread close | User | `entity_type=threads`, entity_id | Doc-4B (in-transaction) | `[ESC-COMM-AUDIT]` | ✓ |

Removal is individually auditable — Doc-2 §10.7 "removed retains audit" explicitly cited. ✓

`[ESC-COMM-AUDIT]` correctly carried (Doc-2 §9 enumerates no Communication action; no action invented; nearest by pointer). ✓

---

## Domain 8 — Event Integrity

**PASS**

**BC-COMM-1 emits NO Doc-2 §8 event and consumes none.** All three contracts declare `Produced: none, Consumed: none`. H.7: "BC-COMM-1 emits NO Doc-2 §8 domain event and consumes none." ✓

Section 8 of both contract groups explicitly characterises the derivative notification effect: "notification of a granted/removed participant [or a thread close] is a BC-COMM-2 effect derived from state, not a BC-COMM-1 event." Two independent locations per contract group. ✓

No event invented. No ownership leakage. No hidden producer. Single-authorship (Doc-4A §4.4) intact. ✓

---

## Domain 9 — Dependency Integrity

**PASS**

| DH | Owner | Direction | Active / Negative? | Part 1b declaration | Correct |
|---|---|---|---|---|---|
| DH-1 | Identity (Doc-4C) | consume | Active | org/membership/`check_permission` + grantee org/user resolution | ✓ |
| DH-8 | Platform Core (Doc-4B) | consume | Active | audit-write (in-transaction); Realtime backing | ✓ |
| DH-3 | RFQ | — | Negative assertion | "no scrub-rule read here" (participant grant/remove); "no procurement decision" (close) | ✓ |
| DH-5 | Trust | — | Negative assertion | "Messaging computes/references no score (firewall)" | ✓ |

DH-3 scrub-rule seam is correctly scoped to message-write only (Part 1 §HB-1.3). It does not apply to participant management or thread close. Appendix B confirms this explicitly. ✓

No dependency inversion. No ownership transfer. No circular dependency. ✓

---

## Domain 10 — Error Model Integrity

**PASS**

Doc-4A §12 closed class set used throughout. All error classes in all registers are from the enumerated set.

| Contract group | Classes used | REFERENCE ≠ DEPENDENCY | STATE ≠ CONFLICT | Protected-fact | Correct |
|---|---|---|---|---|---|
| `add` / `remove` | VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, DEPENDENCY, SYSTEM | ✓ Error Boundary | ✓ (CONFLICT absent — correct; no optimistic assertion) | NOT_FOUND collapse stated | ✓ |
| `close_thread` | VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, CONFLICT, DEPENDENCY, SYSTEM | ✓ (REFERENCE absent — correct; no external ref beyond in-aggregate `thread_id`) | ✓ Error Boundary explicit | NOT_FOUND collapse stated | ✓ |

**REFERENCE correctly absent from `close_thread` error register:** `close_thread` takes only `thread_id` (resolved as part of SCOPE/NOT_FOUND) and `expected_status` (in-aggregate optimistic guard); there is no external reference to resolve — no grantee org/user, no `context_id`. REFERENCE would arise only for an external reference that definitively does not exist; none exists here. The omission is accurate. ✓

Timing-Uniformity stated in both Error Boundary blocks. ✓

---

## Domain 11 — Idempotency Integrity

**PASS**

| Contract | Idempotency | Key / Window | Replay behavior | Duplicate prevention | Correct |
|---|---|---|---|---|---|
| `comm.add_thread_participant.v1` | required | `idempotency_key` + `[ESC-COMM-POLICY]` | same result; no duplicate row (PK-guarded on `(thread_id, participant_organization_id)`); no duplicate audit | terminal-idempotent: re-adding `active` grant → no-op within window | ✓ |
| `comm.remove_thread_participant.v1` | required | `idempotency_key` + `[ESC-COMM-POLICY]` | same result; no second `active → removed` transition; no duplicate audit | terminal-idempotent: re-removing `removed` grant → no-op within window | ✓ |
| `comm.close_thread.v1` | required | `idempotency_key` + `[ESC-COMM-POLICY]` | same result; one `open → closed` transition; no duplicate audit | terminal-idempotent: re-closing `closed` thread → no-op within window; `expected_status` guard distinguishes genuine concurrent advance (`CONFLICT`) from idempotent replay | ✓ |

`[ESC-COMM-POLICY]` correctly carried (no `communication` dedup-window key in Doc-3 §12.2; platform default referenced by name; no key invented). ✓

---

## Domain 12 — Procurement Moat Audit

**PASS**

BC-COMM-1 owns none of: matching, routing, ranking, quotation evaluation, supplier selection, awards. Document mission block, H.9, Section 11 cross-module references, and AI-Agent Notes for all three contracts are explicit: these contracts make no procurement decision; `context_id` is an opaque UUID; DH-3 is a negative assertion only. ✓

---

## Domain 13 — Trust Firewall Audit

**PASS**

BC-COMM-1 computes, owns, and modifies no Trust, Performance, Verification, or Governance score. Document mission block, H.9, Section 11 cross-module references, and AI-Agent Notes for all three contracts are explicit: DH-5 is a negative assertion only; Messaging references Trust/RFQ context by UUID only. ✓

---

## Domain 14 — AI-Agent Determinism

**PASS**

**Ownership determinism:** All three contracts name BC-COMM-1 as owning BC and Thread as the aggregate; child structure (`thread_participants` vs `threads`) is explicit per contract. Grantee `participant_organization_id`/`participant_user_id` are bare UUID references (DH-1), never copied entities. ✓

**Authorization determinism:** `can_use_messaging`; actor must be an `active` participant; non-participant → `NOT_FOUND`. No implementer judgment required. ✓

**Lifecycle determinism:** `add` creates `active` grant; `remove` is `active → removed` (never hard-delete, `removed` retains audit); `close` is `open → closed` (terminal, no re-open). No ambiguity. ✓

**Concurrency determinism:** `close_thread` asserts `expected_status`; a lost race is `CONFLICT` — never `STATE`, never merged. Labeled in four locations (Stage 6, Section 6, Error Boundary block, AI-Agent Notes). `add`/`remove` carry no optimistic assertion — no `expected_status`, CONFLICT correctly absent. ✓

**Event determinism:** "No event emitted" for all three contracts. Notification of a participant change or thread close = BC-COMM-2 derived effect — implementer knows exactly where the notification contract lives (not here). ✓

**Dependency determinism:** DH-1 and DH-8 only (active); DH-3/DH-5 negative-asserted; no RFQ scrub-rule read on participant ops or close. ✓

**Validation determinism:** All rows carry stage/authority/validation/failure class. No step requires implementer judgment. ✓

No ownership ambiguity, lifecycle ambiguity, authorization ambiguity, validation ambiguity, or dependency ambiguity detected.

---

# Final Verdict

**APPROVED FOR FREEZE AUDIT**

Document is implementation-grade, governance-safe, moat-intact, firewall-intact, and correctly hardened across all 14 domains. Zero findings.

---

# Approval Question

**Can the document proceed directly to `Doc-4H_PassB_Part1b_Freeze_Audit_v1.0`?**

**YES**

No findings. All 14 domains pass. `Doc-4H_PassB_Part1b_BC-COMM-1_Participant_And_Close_v1.0` may proceed directly to `Doc-4H_PassB_Part1b_Freeze_Audit_v1.0`.

**Justification.** The document hardens the three frozen BC-COMM-1 contracts deferred by Part 1 exactly as routed by F-MOD6-M1 — no redesign, no new contract, no new aggregate, no new slug, no new event, no new audit action, no new POLICY key. All three contracts carry complete 12-section Pass-B records conforming to the frozen Part 1 structural precedent. The frozen Thread lifecycle (`thread_participants active → removed`; `threads open → closed`; `closed` terminal) is enforced without modification. Authorization is unified under `can_use_messaging` with correct NOT_FOUND collapse and Timing-Uniformity. The STATE/CONFLICT separation on `close_thread` is explicit in four locations. CONFLICT is correctly absent from the `add`/`remove` error registers. All mutations bind `[ESC-COMM-AUDIT]` in-transaction. BC-COMM-1 emits and consumes no §8 event; notification derivation is correctly routed to BC-COMM-2. DH-1/DH-8 are the only active dependencies; DH-3/DH-5 are correctly negative-asserted. No defect at any severity level was identified. On freeze, BC-COMM-1 becomes contract-complete (7 of 7) and the Module 6 Consolidation Review may be re-run to clear F-MOD6-M1 and gate `Doc-4H_Final_Freeze_Audit_v1.0`.

---

*End of Doc-4H_PassB_Part1b_Independent_Hard_Review_v1.0. Zero findings. All 14 domains PASS. BC-COMM-1 Part 1b correctly hardens `comm.add_thread_participant.v1`, `comm.remove_thread_participant.v1`, and `comm.close_thread.v1` to implementation grade; emits no event, consumes no event; lifecycle `thread_participants active → removed` (removal retains audit; no hard delete) and `threads open → closed` (`closed` terminal; no re-open edge); `close_thread` separates CONFLICT from STATE; REFERENCE/DEPENDENCY separated throughout; `can_use_messaging` sole slug; NOT_FOUND protected-fact collapse uniform; procurement moat and Trust firewall intact; conforms fully to `Doc-4H_PassA_v1.0_FROZEN` HA-4.1 and `Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0_FROZEN` structural precedent. APPROVED FOR FREEZE AUDIT — proceed directly to `Doc-4H_PassB_Part1b_Freeze_Audit_v1.0`. On freeze, re-run `Doc-4H_Module6_Consolidated_PassB_Review_v1.0` to close F-MOD6-M1 and gate `Doc-4H_Final_Freeze_Audit_v1.0`.*
