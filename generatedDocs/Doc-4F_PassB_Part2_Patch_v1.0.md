# Doc-4F_PassB_Part2_Patch_v1.0 — Remediation Patch (BC-OPS-2 Procurement Engagements)

| Field | Value |
|---|---|
| Document | Doc-4F_PassB_Part2_Patch_v1.0 — minimal governance-compliant remediation patch for `Doc-4F_PassB_Part2_BC-OPS-2_Procurement_Engagements_v1.0` |
| Nature | **Remediation patch — not a redesign, not a refactor, not a content expansion.** Applies only the findings classified **VALID** by the verification report. |
| Sole review authority | `Doc-4F_PassB_Part2_Patch_Verification_v1.0` (the VALID/INVALID/ESCALATION classification is the patch authorization) |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; corpus precedence applies; on conflict **FLAG-AND-HALT** |
| Applies to | `Doc-4F_PassB_Part2_BC-OPS-2_Procurement_Engagements_v1.0.md` |
| Scope discipline | No new contract, aggregate, bounded context, ownership change, authorization redesign, event, slug, audit action, or POLICY key. Ownership, lifecycle, events, permissions, audit model, escalation model, procurement moat, Trust firewall, and non-disclosure guarantees preserved. |
| Escalations | `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` carried unchanged. The **Doc-2 §8 escalation cluster (AD-P2-02, IR-02, IR-03)** carried unchanged as an unresolved corpus authority gap — **not resolved, not reinterpreted, no authority invented.** |

**Patch posture.** Four authorized VALID patches (P-01…P-04) are applied as minimal, exact-anchored edits: **AD-P2-01** (P-01), **AD-02** (P-02), **IR-01** (P-03), **IR-07** (P-04). The five INVALID findings (AD-03, IR-04, IR-05, IR-06, IR-08) are **not** touched. The corpus-escalation cluster (AD-P2-02, IR-02, IR-03) is **not** resolved here — it remains a Doc-2 §8 owning-document gap, carried. No verification or freeze audit is performed (patch only).

---

## P-01 — Resolve AD-P2-01 · `ops.close_engagement.v1` · bind close to the frozen `completed → closed` edge only

**Finding ID:** AD-P2-01 (VALID). **Location:** §F5.2 `ops.update_engagement_status.v1` · `ops.close_engagement.v1` · Section 6 State Machine Enforcement.

**Issue (per verification report):** the engagement lifecycle (Doc-2 §3.5) is strictly `open → in_delivery → completed → closed`; the **only** edge into `closed` is `completed → closed`. The contract's "→ `closed` from a non-terminal state" introduces unsupported edges (`open→closed`, `in_delivery→closed`). Doc-4A §13.2 requires a corpus basis for any broad-close shorthand; none exists.

**Original Text**

```
**6. State Machine Enforcement** — Allowed transitions (Doc-2 §3.5): `open → in_delivery`, `in_delivery → completed`, `completed → closed` (and `close_engagement`: → `closed` from a non-terminal state per the machine) · Target one of `in_delivery|completed|closed` · **Forbidden:** any transition out of terminal **`closed`** → `STATE`; any non-adjacent/illegal edge → `STATE`; **no `on_hold`/`active`/`disputed` engagement state exists** (binding only `open/in_delivery/completed/closed`) · Concurrency: optimistic on `expected_status`; lost race → `CONFLICT`.
```

**Replacement Text**

```
**6. State Machine Enforcement** — Allowed transitions (Doc-2 §3.5, verbatim sequential machine): `open → in_delivery`, `in_delivery → completed`, `completed → closed`. **`close_engagement` is bound to the single frozen close edge `completed → closed` only** — its legal pre-state is **`completed`** (the only §3.5 edge entering `closed`); `update_engagement_status` drives the two prior adjacent edges. Target one of `in_delivery|completed|closed`. **Forbidden:** **`open → closed` and `in_delivery → closed` are NOT authorized by Doc-2 §3.5** (no corpus edge; close from a non-terminal pre-state other than `completed` → `STATE`); any transition out of terminal **`closed`** → `STATE`; any non-adjacent/illegal edge → `STATE`; **no `on_hold`/`active`/`disputed` engagement state exists** (binding only `open/in_delivery/completed/closed`). Concurrency: optimistic on `expected_status`; lost race → `CONFLICT`. *(A broader close from any non-terminal state is absent from Doc-2 §3.5; if ever required it is a Doc-2 §3.5 escalation, never asserted locally.)*
```

**Rationale.** Binds `close_engagement` to the **single frozen edge `completed → closed`**, enumerates the legal pre-state (`completed`) verbatim, and explicitly marks `open → closed` / `in_delivery → closed` as **not authorized** (removing the "from a non-terminal state" broadening). No new lifecycle edge; no reinterpretation; the broader-close possibility is recorded as a Doc-2 §3.5 escalation, not resolved.

**Authority Reference.** Doc-2 §3.5 (`engagements` `open → in_delivery → completed → closed`, sequential; only `completed → closed` enters `closed`); Doc-2 §10.5 ("YES (close/archive)" = soft-delete capability, not a state edge); Doc-4A §13.2 (`Pre-states` quoted verbatim; broad-close shorthand requires corpus basis).

---

## P-02 — Resolve AD-02 · `ops.update_trade_invoice_status.v1` · bind the §9 Engagement "dispute recorded" audit action on `→ disputed`

**Finding ID:** AD-02 (VALID). **Location:** §F5.5 `ops.issue_trade_invoice.v1` · `ops.update_trade_invoice_status.v1` · Section 7 Audit Binding.

**Issue (per verification report):** a trade invoice transitioning `→ disputed` realizes **two** Doc-2 §9 audit facts — Financial "trade invoice issue/status change" **and** Engagement "dispute recorded" (§9 Engagement: "...; dispute recorded; ... (dispute evidence requires the full chain)"). The contract binds **only** Financial, omitting the §9 Engagement action.

**Original Text**

```
**7. Audit Binding** — Action **Doc-2 §9 Financial** "trade invoice issue/status change" · Attribution **User** · Object scope the `trade_invoices` row + parent engagement ref · Timing same transaction · Source Doc-2 §9 + Doc-4B.
```

**Replacement Text**

```
**7. Audit Binding** — **(a) Issue / non-dispute status change:** Action **Doc-2 §9 Financial** "trade invoice issue/status change" · Attribution **User** · Object scope the `trade_invoices` row + parent engagement ref · Timing same transaction · Source Doc-2 §9 + Doc-4B. **(b) Dispute transition (`→ disputed`): bind BOTH §9 actions in the same transaction** — **Doc-2 §9 Financial** "trade invoice issue/status change" (the invoice status mutation) **AND Doc-2 §9 Engagement** "dispute recorded" (the dispute fact; "dispute evidence requires the full chain", Doc-2 §9 Engagement) · Attribution **User** · Object scope the `trade_invoices` row + parent `engagements` ref · Timing same transaction · Source Doc-2 §9 (both actions) + Doc-4B. *(Both are separately-enumerated §9 actions — no `[ESC-OPS-AUDIT]`; no audit action invented.)*
```

**Rationale.** Preserves the existing §9 Financial binding and **adds** the missing §9 Engagement "dispute recorded" action specifically on the `→ disputed` transition, so the dispute path writes both corpus-enumerated audit facts. Event ownership and the trade-invoice lifecycle are unchanged (the dispute *event* `DisputeRecorded` and its emit-trigger remain governed by the carried AD-P2-02 escalation; this patch touches **audit binding only**).

**Authority Reference.** Doc-2 §9 Engagement ("...; dispute recorded; buyer feedback submitted (dispute evidence requires the full chain)"); Doc-2 §9 Financial ("...; trade invoice issue/status change, payment record entries"); Doc-2 §10.5 (`trade_invoices` `disputed` status).

---

## P-03 — Resolve IR-01 · `ops.create_engagement_on_award.v1` · remove `CONFLICT` for engagement uniqueness (Doc-4A §14.6)

**Finding ID:** IR-01 (VALID). **Location:** §F5.1 `ops.create_engagement_on_award.v1` · Section 4 Validation Matrix, Section 9 Error Register (and consistency in Sections 6/10).

**Issue (per verification report):** Doc-4A §14.6 prohibits returning `CONFLICT` (concurrency class) for a business-uniqueness violation. The engagement 1:1-per-award rule (ADR-002) is a business-uniqueness invariant. A **same-event replay** is pure idempotency (dedup → no-op, **no error**); a **genuine duplicate** (a distinct event asserting the same business duplicate) is **`BUSINESS`**, never `CONFLICT`.

### P-03a — §F5.1 Validation Matrix (Section 4)

**Original Text**

```
| no existing engagement for `rfq_id` | 6 STATE | ADR-002; Doc-2 §4.1 (1:1) | engagement is created once per award; a duplicate `rfq_id` is an idempotent no-op | `CONFLICT` (collapses to idempotent no-op on replay) |
```

**Replacement Text**

```
| one engagement per award (uniqueness) | 8 BUSINESS | ADR-002; Doc-2 §4.1 (1:1) | exactly one `engagements` row per awarded `rfq_id`; a **same-event replay** (same `RFQClosedWon` identity) is an **idempotent no-op** (dedup on event identity — no error, Doc-4A §16.7); a **distinct event asserting an already-existing `rfq_id`** is a business-uniqueness violation | `BUSINESS` (distinct-duplicate); **no error** (same-event replay) — **never `CONFLICT`** (Doc-4A §14.6) |
```

### P-03b — §F5.1 Error Register (Section 9)

**Original Text**

```
| `CONFLICT` | engagement already exists for `rfq_id` (1:1) → resolved as idempotent no-op | false (no-op) |
```

**Replacement Text**

```
| `BUSINESS` | a **distinct** event asserts an already-existing engagement for `rfq_id` (business-uniqueness violation, ADR-002 1:1) — **not `CONFLICT`** (Doc-4A §14.6) | false |
```

*(Note: a same-event replay produces **no** error-register entry — it is an idempotent no-op handled in Section 10, dedup on event identity. `CONFLICT` is removed entirely from this contract.)*

### P-03c — §F5.1 State Machine Enforcement (Section 6) — consistency

**Original Text**

```
**6. State Machine Enforcement** — Allowed source states **none** (creation) · Target **`open`** (Doc-2 §3.5 entry) · Forbidden: an engagement already existing for `rfq_id` → idempotent no-op (ADR-002 1:1) · Concurrency: dedup on the inbound `RFQClosedWon` event identity; `human_ref` allocated row-locked via Doc-4B `core.allocate_human_reference.v1`.
```

**Replacement Text**

```
**6. State Machine Enforcement** — Allowed source states **none** (creation) · Target **`open`** (Doc-2 §3.5 entry) · **Uniqueness (ADR-002 1:1):** a **same-event replay** for an existing `rfq_id` is an idempotent no-op (dedup on event identity — §10); a **distinct duplicate** is a `BUSINESS` violation (§9), **never `CONFLICT`** (Doc-4A §14.6) · Concurrency: dedup on the inbound `RFQClosedWon` event identity; `human_ref` allocated row-locked via Doc-4B `core.allocate_human_reference.v1`.
```

**Rationale (P-03).** Removes `CONFLICT` from the engagement-uniqueness path entirely (Doc-4A §14.6: `CONFLICT` MUST NOT be returned for business-uniqueness). A same-event replay is an idempotent no-op with no error class (dedup on event identity, §16.7 — already stated in Section 10, unchanged); a distinct-event business duplicate is `BUSINESS` (Category 8). The uniqueness check is relocated from a Stage-6 STATE row to the **Stage-8 BUSINESS** category, which is the correct §11.2 category for a business-uniqueness rule (§14.6). Section 10 (Idempotency Rules) already correctly describes dedup-on-event-identity and needs no change.

**Authority Reference.** Doc-4A §14.6 (business-uniqueness → `BUSINESS`; MUST NOT use `CONFLICT`); §16.7 (at-least-once delivery; idempotent consumer; same-event replay = no-op); §11.2 (Category 8 BUSINESS); §12.2 (`CONFLICT` = concurrency class); ADR-002 / Doc-2 §4.1 (engagement 1:1 with award).

---

## P-04 — Resolve IR-07 · `ops.issue_engagement_document.v1` / `ops.revise_engagement_document.v1` · explicit Stage-1 SYNTAX mutual-exclusion rule

**Finding ID:** IR-07 (VALID). **Location:** §F5.4 · Section 4 Validation Matrix (Stage 1 SYNTAX).

**Issue (per verification report):** the per-operation field requirement (issue vs revise) is implicit; Doc-4A §11.1 requires testable rules. Add an explicit Stage-1 SYNTAX rule (consistent with the frozen Part-1 P-04 one-of precedent): issue MUST NOT supply `document_id`; revise MUST supply `document_id` + `revision_reason`.

**Original Text**

```
| `engagement_id`, `doc_kind`, `content_jsonb`, `expected_engagement_status`; `document_id`+`revision_reason` (revise) | 1 SYNTAX | Doc-4A §9 | presence/type; `doc_kind` ∈ {loi,po,wcc} | `VALIDATION` |
```

**Replacement Text**

```
| `engagement_id`, `doc_kind`, `content_jsonb`, `expected_engagement_status` | 1 SYNTAX | Doc-4A §9 | presence/type; `doc_kind` ∈ {loi,po,wcc} | `VALIDATION` |
| issue vs revise field cardinality (mutual exclusion) | 1 SYNTAX | Doc-4A §9 (field presence); §11.1 (testable) | **`ops.issue_engagement_document.v1`:** `document_id` MUST NOT be supplied (issue creates version 1). **`ops.revise_engagement_document.v1`:** `document_id` MUST be supplied AND `revision_reason` MUST be supplied. Violation of either per-operation rule → `VALIDATION` | `VALIDATION` |
```

**Rationale.** Adds an explicit, testable Stage-1 SYNTAX rule fixing the per-operation field cardinality — issue MUST NOT carry `document_id`; revise MUST carry `document_id` + `revision_reason` — removing the implicit/inferred behavior (Doc-4A §11.1 testability), consistent with the FROZEN Part-1 P-04 one-of-identifier SYNTAX convention. No schema field added or removed; the two contract IDs and their owned entities are unchanged.

**Authority Reference.** Doc-4A §9 / §9.2 (field presence is a SYNTAX concern; required/optional distinction); Doc-4A §11.1 (rules MUST be testable; passing/failing inputs constructible) and §11.2 (Category 1 SYNTAX); `Doc-4F_PassB_Part1_BC-OPS-1_FROZEN` P-04 precedent (explicit one-of SYNTAX rule).

---

## Findings NOT patched (recorded for completeness)

| Finding | Classification | Reason / channel | Action |
|---|---|---|---|
| **AD-P2-02** | CORPUS ESCALATION | Doc-2 §8 — event emit-trigger/cardinality absent | **Not patched; carried.** Emit-triggers remain proposed-and-carried; authority gap routes to Doc-2 §8. *(This patch touches audit binding for the dispute path (P-02) only; it does **not** define the `DisputeRecorded`/`EngagementCompleted` emit-trigger.)* |
| **IR-02** | CORPUS ESCALATION | Doc-2 §8 — `DeliveryRecorded` revision cardinality absent | **Not patched; carried** (consolidated under AD-P2-02). |
| **IR-03** | CORPUS ESCALATION | Doc-2 §8 — `WorkCompletionIssued` revision cardinality absent | **Not patched; carried** (consolidated under AD-P2-02). |
| **AD-03** | INVALID | Doc-2 §7 unambiguous; document already correct | **Not patched.** |
| **IR-04** | INVALID | Doc-4A §9.2 permits optional-with-default create pattern | **Not patched.** |
| **IR-05** | INVALID | Doc-4A §11.1 requires ordered list of applicable rules, not per-stage/N/A | **Not patched.** |
| **IR-06** | INVALID | Same basis as IR-05; delegation eligibility already declared | **Not patched.** |
| **IR-08** | INVALID | Audit binding uses frozen §9 compound token by pointer; compliant | **Not patched.** |

---

# Patch Summary

| Patch ID | Finding | Disposition |
|---|---|---|
| P-01 | AD-P2-01 | Applied — `close_engagement` bound to frozen `completed → closed` only; `open→closed`/`in_delivery→closed` marked not authorized (§F5.2) |
| P-02 | AD-02 | Applied — `→ disputed` binds BOTH §9 Financial "trade invoice status change" AND §9 Engagement "dispute recorded" (§F5.5) |
| P-03 | IR-01 | Applied — `CONFLICT` removed from engagement-uniqueness path; same-event replay = idempotent no-op, distinct duplicate = `BUSINESS` (§F5.1) |
| P-04 | IR-07 | Applied — explicit Stage-1 SYNTAX mutual-exclusion rule for issue vs revise (§F5.4) |

---

# Completion Statement

1. **VALID findings patched (4):** **AD-P2-01** (P-01 — close-edge bound to `completed → closed`), **AD-02** (P-02 — dispute path binds both §9 Financial + §9 Engagement audit actions), **IR-01** (P-03 — `CONFLICT` removed; idempotent-no-op / `BUSINESS` per §14.6), **IR-07** (P-04 — explicit issue/revise Stage-1 SYNTAX rule).
2. **Findings rejected (no patch — INVALID):** **AD-03**, **IR-04**, **IR-05**, **IR-06**, **IR-08** (each contradicted by frozen authority per the verification report).
3. **Findings remaining CORPUS ESCALATION (carried, unresolved):** **AD-P2-02** (master), **IR-02**, **IR-03** — the Doc-2 §8 event emit-trigger / emission-cardinality authority gap. **Carried unchanged; not resolved, not reinterpreted, no authority invented.** Escalation markers `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` carried unchanged.
4. **Is Patch Verification now required?** **Yes** — this patch introduces edits to the Part-2 contract specification and SHOULD pass a Patch Verification step (confirming each applied edit binds only to the cited frozen authority, no Pass-A decision changed, no entity/event/slug/audit-action/POLICY-key invented, the §8 escalation cluster intact) before Part-2 proceeds to its Freeze Audit. **Verification is not performed in this document** (patch only).

---

*End of Doc-4F_PassB_Part2_Patch_v1.0. Remediation patch only — no verification, no freeze audit, no redesign. Four VALID findings patched (AD-P2-01, AD-02, IR-01, IR-07); five INVALID rejected (AD-03, IR-04, IR-05, IR-06, IR-08); the Doc-2 §8 escalation cluster (AD-P2-02, IR-02, IR-03) carried unresolved. Ownership, aggregates, lifecycle, permissions, events, audit model, escalation model, procurement moat, Trust firewall, and non-disclosure guarantees preserved; no contract/aggregate/bounded-context/slug/event/audit-action/POLICY-key created. Escalation markers carried unchanged. Patch verification required next; not performed here.*
