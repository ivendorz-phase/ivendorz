# Architecture Board — Pass-B Patch Verification (Module 7 — Billing, Part 1: BC-BILL-1/2/3)

**Document Reviewed:** `Doc-4I_PassB_Part1_Patch_v1.0`
**Verification Date:** 2026-06-19
**Status:** FINAL

| Field | Value |
|---|---|
| Patch Document | `Doc-4I_PassB_Part1_Patch_v1.0` |
| Base Document | `Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0` |
| Review Authority | `Doc-4I_PassB_Part1_Independent_Hard_Review_v1.0` |
| Findings Under Verification | F4I-PB1-M1 (MINOR), F4I-PB1-M2 (MINOR), F4I-PB1-M3 (MINOR), F4I-PB1-N1 (NITPICK) |
| Authoritative Corpus | Architecture (FROZEN), ADR (FROZEN), Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4H v1.0 (all FROZEN), `Doc-4I_Structure_v1.0` (FROZEN), `Doc-4I_PassA_Content_v1.0` (FROZEN), `Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0`, `Doc-4I_PassB_Part1_Independent_Hard_Review_v1.0` |
| Posture | Defect-closure verification only. No new hard review. No new findings unless the patch creates a direct governance regression, corpus conflict, or patch-introduced defect. Resolved findings not reopened. Assume PASS absent a corpus conflict. |
| Clears | **F4I-PB1-FR-MIN1** of `Doc-4I_PassB_Part1_Freeze_Audit_v1.0` (the missing Patch-Verification record) |

---

## Executive Verdict

```text
PATCH VERIFICATION
= PASS
```

All four approved findings (F4I-PB1-M1, F4I-PB1-M2, F4I-PB1-M3, F4I-PB1-N1) are closed. No regression found. No corpus conflict found. No patch-introduced defect found. The patch confines its edits to the four named contracts (§HB-3.1, §HB-2.2, §HB-2.1, §HB-3.2) and introduces no ownership, bounded-context, aggregate, event-ownership, dependency, moat, firewall, lifecycle, or validation-ordering change.

---

## Finding Closure Verification

---

### F4I-PB1-M1 — `billing.record_usage.v1` (§HB-3.1) Stage-7 `quota_key` over-constraint

**Required action (Hard Review):** Either (a) cite the Doc-2 §10.8 / Doc-4A authority that mandates `quota_key` resolution at record time, or (b) remove the `quota_key → BC-BILL-1 entitlement` REFERENCE check from Stage 7 and confirm `quota_key` is free-form at metering, with entitlement binding evaluated only at `enforce_quota`. Consistent with H.10; no new field/aggregate/event.

**Patch Result — CLOSED.** The patch takes Board option (b): Stage-7 now reads "Controlling Org resolves (DF-BILL-1). `quota_key` is a free-form `string` at metering time (H.10; Doc-2 §10.8 — `usage_ledger.quota_key` is not a foreign key and no record-time entitlement lookup is specified); entitlement binding for `quota_key` is evaluated only at `billing.enforce_quota.v1` (§HB-3.2), not here," with failure class "`REFERENCE` (Controlling-Org definitive negative) / `DEPENDENCY` (transient)." Verified consistent with H.10 field-source (`usage_ledger.quota_key` = plain `string`), Doc-2 §10.8 (no record-time lookup), and the §HB-3.2 enforcement-time pattern. The over-constraint that would silently drop metering on an unregistered `quota_key` is removed; Stage 7 retains only the genuine Controlling-Org cross-service reference. No new field/aggregate/event; Section 11 unchanged (already carries `REFERENCE` for Controlling-Org / `DEPENDENCY`). ✓

---

### F4I-PB1-M2 — `billing.cancel_subscription.v1` (§HB-2.2) Stage-7 failure-class mismatch

**Required action (Hard Review):** Correct Stage 7 failure class from `REFERENCE / DEPENDENCY` to `NOT_FOUND` / `DEPENDENCY`; error register requires no change (already has `NOT_FOUND`; `REFERENCE` correctly absent). Only Stage 7 changes.

**Patch Result — CLOSED.** The patch changes §HB-2.2 Stage-7 to "`subscription_id` resolves within the actor's Controlling Org (user-scoped; protected-fact collapse)" with failure class "`NOT_FOUND` / `DEPENDENCY`" (authority `Doc-4A §4.5; §7.5`). Verified: `subscription_id` is the actor's own scoped resource (Stage-4 SCOPE guarded); a non-resolving id collapses to `NOT_FOUND` (Doc-4A §12.4/§7.5 protected-fact) in both the absent-from-DB and out-of-org cases — matching the correct §HB-2.5 pattern and the contract's own Section 11 (which has `NOT_FOUND`, no `REFERENCE`). Only Stage 7 changed; the error register is already correct and unchanged. No new error class; no ownership change; the validation matrix and error register now agree. ✓

---

### F4I-PB1-M3 — `billing.purchase_subscription.v1` (§HB-2.1) `CONFLICT` without assertion token

**Required action (Hard Review):** Remove `CONFLICT` from Stage 6 failure class (→ `STATE` only) and from Section 11 Error Register. No new error class, field, or mechanism.

**Patch Result — CLOSED.** The patch removes `CONFLICT` from both locations. Stage-6 now reads "no `active` subscription exists for the org (partial UNIQUE WHERE state='active'); new row enters `pending_payment`; a concurrent second purchase finds an existing `active` subscription → `STATE` (illegal-from-state; no optimistic-concurrency assertion token, so no `CONFLICT`)" with failure class "`STATE`"; the Section 11 `CONFLICT` row is removed with the note that concurrent-purchase contention resolves to `STATE` via the partial-UNIQUE constraint. Verified against Section 5 Inputs: `purchase_subscription.v1` defines no `expected_status` (or any optimistic-concurrency token), so `CONFLICT` (Doc-4A §12.4) had no basis; concurrent purchase is correctly `STATE` (illegal-from-state via partial UNIQUE), consistent with H.4 and Doc-4A §12.4. No new field, no optimistic-concurrency mechanism, no lifecycle change; Stage 6 and the Error Register are now mutually consistent. ✓

---

### F4I-PB1-N1 — `billing.enforce_quota.v1` (§HB-3.2) conditional `QUOTA` wording

**Required action (Hard Review):** Rephrase Section 10 Outputs to remove the conditional "if surfaced as an error class per the caller"; state the `QUOTA` return unconditionally. Wording only.

**Patch Result — CLOSED.** Section 10 now reads "**Failure:** Doc-4A §12 envelope. `QUOTA` is returned when `requested_amount` exceeds the entitlement-bounded quota (see Section 11)." Verified: the caller-dependent conditional is removed; the `QUOTA` return is deterministic and consistent with Section 11 (which lists `QUOTA`) and the Stage-8 BUSINESS rule. Wording only — no behavioral redesign, no new error class, no moat change (quota denial remains an entitlement check, never a routing/eligibility signal). ✓

---

## Regression Guard (unchanged surfaces confirmed)

| Surface | Result |
|---|---|
| Contract inventory (18 IDs across BC-BILL-1/2/3) | UNCHANGED (no contract added/renamed/removed) |
| Aggregate ownership | UNCHANGED (BC-BILL-1 Plan+Entitlement / BC-BILL-2 Subscription / BC-BILL-3 Usage Ledger — disjoint) |
| BC boundaries | UNCHANGED |
| Event ownership | UNCHANGED (`SubscriptionPurchased`/`Renewed`/`Expired` Billing-owned; `QuotationSubmitted` RFQ-owned, consumed) |
| Dependencies (DF-BILL-1…8) | UNCHANGED |
| Validation ordering (1→9) | UNCHANGED (only failure-class / rule text edited within existing Stage rows; no stage added/reordered) |
| Audit bindings | UNCHANGED (`[ESC-BILL-AUDIT]` / named §9 by pointer; reads unaudited) |
| Lifecycle definitions | UNCHANGED (`plans draft→active→retired`; subscriptions §5.7; `usage_ledger` append-only) |
| Procurement moat | UNCHANGED (quota = entitlement check, never routing/eligibility/supplier-selection) |
| Trust firewall | UNCHANGED (no Trust/Performance/Verification/Governance score owned/computed/modified) |
| Escalation markers | UNCHANGED (`[ESC-BILL-AUDIT]`/`[ESC-BILL-POLICY]`/`[ESC-BILL-SLUG]`/`[ESC-BILL-EVENT]`) |

No new contract/aggregate/event/permission/audit-action/POLICY-key. No section outside the four named contracts (§HB-3.1, §HB-2.2, §HB-2.1, §HB-3.2) modified. The §HB-2.3 renew/expire record (which legitimately carries `expected_status`) and §HB-2.5 reads were not edited and were not in scope.

---

## Final Assessment

```text
Findings verified closed = 4 (F4I-PB1-M1, F4I-PB1-M2, F4I-PB1-M3, F4I-PB1-N1)
Regressions found        = 0
Corpus conflicts found    = 0
Patch-introduced defects  = 0

Open BLOCKER = 0
Open MAJOR   = 0
Open MINOR   = 0
Open NITPICK = 0
```

## Verification Decision

```text
PATCH VERIFICATION = PASS
```

`Doc-4I_PassB_Part1_Patch_v1.0` correctly and completely closes F4I-PB1-M1, F4I-PB1-M2, F4I-PB1-M3, and F4I-PB1-N1 with no regression, no corpus conflict, and no patch-introduced defect; ownership / BC / aggregate / event-ownership / dependency / moat / trust-firewall / lifecycle / validation-ordering impact = NONE. This record clears **F4I-PB1-FR-MIN1** of `Doc-4I_PassB_Part1_Freeze_Audit_v1.0` — `Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0` (as amended by `Doc-4I_PassB_Part1_Patch_v1.0`) is verified ready to be declared **PASS-B PART1 FROZEN**.

---

*End of Doc-4I_PassB_Part1_Patch_Verification_v1.0. Defect-closure verification only — no redesign, no new contracts/aggregates/events, no ownership reassignment, no reopening of resolved findings. F4I-PB1-M1/M2/M3/N1 verified CLOSED; regression guard clean; Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0. PATCH VERIFICATION = PASS. Clears F4I-PB1-FR-MIN1. Decided on the frozen corpus, the Part-1 base, the hard review, and the patch.*
