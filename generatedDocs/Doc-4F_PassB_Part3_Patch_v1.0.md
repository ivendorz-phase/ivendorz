# Doc-4F_PassB_Part3_Patch_v1.0 — Remediation Patch (BC-OPS-3 Vendor Lead Pipeline)

| Field | Value |
|---|---|
| Document | Doc-4F_PassB_Part3_Patch_v1.0 — minimal remediation patch for `Doc-4F_PassB_Part3_BC-OPS-3_Vendor_Lead_Pipeline_v1.0` |
| Nature | **Remediation patch — not redesign, not refactor, not content expansion.** Applies only the Board-approved findings. |
| Sole review authority | `Doc-4F_PassB_Part3_Hard_Review_v1.0` |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; corpus precedence; on conflict FLAG-AND-HALT |
| Applies to | `Doc-4F_PassB_Part3_BC-OPS-3_Vendor_Lead_Pipeline_v1.0.md` |
| Scope discipline | No new ownership, aggregate, lifecycle stage, event, permission, or audit action. Ownership, lead lifecycle, event model, authorization/delegation model, audit ownership, procurement moat, Trust firewall preserved. |
| Approved scope | P-01 (AD-01) · P-02 (AD-02, reduced scope) · P-03 (IR-01) · P-04 (IR-02) · P-05 (IR-03) · P-06 (IR-04) |

---

## P-01 — AD-01 · §F6.1 · remove null Stage-8 BUSINESS row

**Finding:** AD-01. **Location:** §F6.1 `ops.create_lead_on_invitation.v1` · Validation Matrix · Stage 8 BUSINESS.

**Issue:** the Stage-8 BUSINESS row states "no local re-check" — a null validation rule appearing as a validation stage.

**Original Text**

```
| delivered-invitation precondition | 8 BUSINESS | Doc-2 §8/§10.5 | `VendorInvited` fires only at invitation `delivered`; undelivered (`selected`/`deferred`) never create a lead | — (guaranteed by the event; no local re-check beyond the event identity) |
```

**Replacement Text** (row removed; implementation note added immediately after the Validation Matrix)

```
> **Implementation note (no local BUSINESS validation).** `VendorInvited` is produced only after invitation delivery per RFQ authority (Doc-2 §8/§10.5; `VendorInvited` fires only at invitation `delivered`). No additional local BUSINESS validation exists. Idempotency and event identity remain the local guards (§6/§10, dedup on `invitation_id`).
```

**Rationale.** Removes the null validation rule (no synthetic rule, no invented failure outcome); the delivered-only fact is RFQ-side authority, restated as a note outside the matrix. No behavior change.

**Authority:** Doc-2 §8/§10.5 (`VendorInvited` at `delivered`); Doc-4A §11.1 (every rule testable — a null rule is nonconforming); Doc-4A §16.7 (idempotent consumer).

---

## P-02 — AD-02 (reduced scope) · §F6.3 · add explicit Stage-6 STATE applicability statement

**Finding:** AD-02 (reduced). **Location:** §F6.3 `ops.add_lead_activity.v1` · Validation Matrix.

**Issue:** missing state-applicability declaration for the append-only child; no STATE row. Approved scope **limited** — no terminal/won/lost/follow_up restriction invented; no lifecycle rule added.

**Original Text**

```
| lead controlling-org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org = the parent lead's `controlling_organization_id` | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | vendor representative via §6B grant where applicable | `AUTHORIZATION`/`NOT_FOUND` |
| parent lead exists | 7 REFERENCE | Doc-4A §4.5 (in-aggregate) | the parent `vendor_leads` row resolves within the controlling org | `NOT_FOUND` (collapse) |
```

**Replacement Text**

```
| lead controlling-org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org = the parent lead's `controlling_organization_id` | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | vendor representative via §6B grant where applicable | `AUTHORIZATION`/`NOT_FOUND` |
| parent-stage applicability | 6 STATE | Doc-2 §10.5 | `lead_activities` is append-only; Doc-2 authority defines **no** parent-lead-stage restriction — no lead-stage validation applies (an activity may be logged in any `vendor_leads` stage) | — (no failure outcome) |
| parent lead exists | 7 REFERENCE | Doc-4A §4.5 (in-aggregate) | the parent `vendor_leads` row resolves within the controlling org | `NOT_FOUND` (collapse) |
```

**Rationale.** Adds the explicit Stage-6 STATE applicability statement (removes the ambiguity of an implicit/absent STATE handling), declaring that no parent-stage restriction exists per Doc-2 — **no** terminal/won/lost/follow_up restriction invented, **no** new behavior, no failure outcome.

**Authority:** Doc-2 §10.5 (`lead_activities` append-only; no parent-stage restriction); Doc-4A §11.2 (STATE category).

---

## P-03 — IR-01 · §F6.1 Stage-2 CONTEXT · correct authority citation

**Finding:** IR-01. **Location:** §F6.1 · Validation Matrix · Stage 2 CONTEXT.

**Issue:** the Stage-2 CONTEXT row (validating Phase-2 consumer origin) cites `Doc-4A §5.2/§15.5`; Phase-2 origin authority is §15.5.

**Original Text**

```
| system actor | 2 CONTEXT | Doc-4A §5.2/§15.5 | actor is System (Phase-2 consumer; no active org context) | `AUTHORIZATION` |
```

**Replacement Text**

```
| system actor | 2 CONTEXT | Doc-4A §15.5 | actor is System (Phase-2 consumer; no active org context) | `AUTHORIZATION` |
```

**Rationale.** Citation correction only (Phase-2 consumer-origin authority = §15.5). No behavior change. *(The §F6.1 Authorization Matrix retains `§5.2/§15.5` — §5.2 is the actor-type authority there, correct and out of scope of this finding.)*

**Authority:** Doc-4A §15.5 (Phase-2 origin/attribution).

---

## P-04 — IR-02 · §F6.2 · separate STATE from CONFLICT (clarify evaluation order)

**Finding:** IR-02. **Location:** §F6.2 `ops.update_lead_stage.v1` · Validation Matrix.

**Issue:** the two rows both label "6 STATE" — lifecycle legality and optimistic concurrency must be distinct, evaluation order explicit.

**Original Text**

```
| transition legal | 6 STATE | Doc-2 §3.5 | `target_stage` reachable from current per `received → quoted → negotiation → won | lost → follow_up` | `STATE` |
| stage match | 6 STATE / concurrency | Doc-4A §14 | `expected_stage` = current stage | `CONFLICT` |
```

**Replacement Text**

```
| transition legal (state) | 6 STATE | Doc-2 §3.5 | `target_stage` reachable from current per `received → quoted → negotiation → won | lost → follow_up` (lifecycle legality checked first) | `STATE` |
| stage match (concurrency) | 6 STATE → concurrency sub-check | Doc-4A §14 | after lifecycle legality passes, optimistic-concurrency: `expected_stage` = current stage | `CONFLICT` |
```

**Rationale.** Separates lifecycle legality (`STATE`) from optimistic concurrency (`CONFLICT`) into distinct, ordered checks — lifecycle legality first, then the concurrency sub-check. Behavior preserved (same two outcomes); evaluation order clarified.

**Authority:** Doc-2 §3.5 (lead machine — STATE); Doc-4A §14 (optimistic concurrency — `CONFLICT`); Doc-4A §11.2 (STATE category 6).

---

## P-05 — IR-03 · §F6.4 `list_leads` · clarify query-scope semantics

**Finding:** IR-03. **Location:** §F6.4 · Validation Matrix · Stage 4 SCOPE (the `list_leads` scope row reads like a single-row lookup).

**Issue:** the SCOPE row wording ("the target lead(s) belong to the active vendor controlling org") resembles a single-row lookup rather than a list-query scope restriction.

**Original Text**

```
| lead controlling-org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | the target lead(s) belong to the active vendor controlling org | `NOT_FOUND` (collapse, H.9) |
```

**Replacement Text**

```
| lead controlling-org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | **`get_lead`:** the target lead belongs to the active controlling org (else `NOT_FOUND` collapse). **`list_leads`:** results are restricted to the active `controlling_organization_id` through RLS enforcement (only the caller's own leads are enumerated; no cross-tenant row appears) | `NOT_FOUND` (collapse, H.9) — get; scoped result set — list |
```

**Rationale.** Clarifies the list-query scope as an RLS-enforced result-set restriction (vs the single-row `get` lookup); authorization and visibility rules unchanged — clarification only.

**Authority:** Doc-4A §7.3 (resource scope); §7.5 (non-disclosure collapse); Doc-2 §6/§10.5 (vendor-side RLS).

---

## P-06 — IR-04 · §F6.1 · relocate idempotency note out of Error Register

**Finding:** IR-04. **Location:** §F6.1 · Error Register parenthetical (idempotency note).

**Issue:** the Error Register carries an idempotent-replay note; the Error Register should contain only error outcomes — replay behavior belongs in §10 Idempotency Rules.

**Original Text** (Error Register parenthetical, removed)

```
*(No `CONFLICT` on the per-invitation uniqueness path: a replayed `VendorInvited` for an existing `invitation_id` is an **idempotent no-op** (dedup on event identity, Doc-4A §16.7), never `CONFLICT` — consistent with the FROZEN Part-2 P-03 / Doc-4A §14.6 convention.)*
```

**Replacement Text** (parenthetical removed from Error Register; §10 Idempotency Rules amended to carry the behavior)

§10 original:

```
**10. Idempotency Rules** — inherently idempotent (Doc-4A §14 / §16.7): **dedup on the inbound `VendorInvited` event identity / `invitation_id`** — a replayed event creates **no** duplicate lead and **no** duplicate audit; at-least-once delivery is expected and absorbed.
```

§10 replacement:

```
**10. Idempotency Rules** — inherently idempotent (Doc-4A §14 / §16.7): **dedup on the inbound `VendorInvited` event identity / `invitation_id`** — a replayed event creates **no** duplicate lead and **no** duplicate audit; at-least-once delivery is expected and absorbed. A replayed `VendorInvited` for an existing `invitation_id` is an **idempotent no-op** — **never `CONFLICT`, never a `BUSINESS` failure** (dedup on event identity, Doc-4A §16.7; consistent with the FROZEN Part-2 P-03 / Doc-4A §14.6 convention).
```

**Rationale.** Documentation relocation only — the replay-is-no-op fact moves from the Error Register (error outcomes only) to §10 Idempotency Rules (its home). Behavior unchanged (no error / no CONFLICT / no BUSINESS on replay).

**Authority:** Doc-4A §14 / §16.7 (idempotency; at-least-once; no-op replay); §12 (Error Register = error outcomes); §14.6 (no `CONFLICT` for business-uniqueness).

---

# Patch Summary

| Patch ID | Finding | Disposition |
|---|---|---|
| P-01 | AD-01 | Applied — null Stage-8 BUSINESS row removed → implementation note (§F6.1) |
| P-02 | AD-02 (reduced) | Applied — explicit Stage-6 STATE applicability statement, append-only, no parent-stage restriction (§F6.3) |
| P-03 | IR-01 | Applied — Stage-2 CONTEXT citation `§5.2/§15.5` → `§15.5` (§F6.1) |
| P-04 | IR-02 | Applied — STATE / CONFLICT separated, evaluation order clarified (§F6.2) |
| P-05 | IR-03 | Applied — `list_leads` query-scope (RLS result-set) clarified (§F6.4) |
| P-06 | IR-04 | Applied — idempotency note relocated Error Register → §10 (§F6.1) |

---

# Completion Statement

1. **Findings patched (6):** AD-01 (P-01), AD-02 reduced scope (P-02), IR-01 (P-03), IR-02 (P-04), IR-03 (P-05), IR-04 (P-06).
2. **Findings intentionally not modified:** none outside approved scope was touched. Explicitly NOT patched: ownership, aggregates, lead lifecycle, event model, authorization/delegation model, audit ownership, procurement moat, Trust firewall. **No** `won`/`lost` terminal-state, `follow_up` restriction, additional validation stage, new audit action, new event, or new permission introduced.
3. **Regression audit result:** Ownership Drift = NONE · Aggregate Drift = NONE · Lifecycle Drift = NONE · Event Drift = NONE · Authorization Drift = NONE · Procurement Moat Drift = NONE · Trust Firewall Drift = NONE. (All six patches are clarification / citation / relocation / null-rule-removal; no governance object created or changed.)
4. **Patch Verification now required?** **Yes** — this patch edits the Part-3 spec; it SHOULD pass a Patch Verification step before Part-3 proceeds to Freeze Audit. **Not performed here** (patch only).

---

*End of Doc-4F_PassB_Part3_Patch_v1.0. Remediation patch only — no review, no verification, no freeze audit. Six findings patched (AD-01, AD-02 reduced, IR-01…IR-04); all changes are clarification/citation/relocation/null-rule-removal. No ownership/aggregate/lifecycle/event/authorization/moat/firewall drift; nothing invented. Patch Verification required next; not performed here.*
