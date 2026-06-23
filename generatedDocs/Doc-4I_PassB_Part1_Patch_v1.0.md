# Doc-4I_PassB_Part1_Patch_v1.0 — Corrective Pass-B Patch (Module-7 Billing, Part 1 — BC-BILL-1/2/3)

| Field | Value |
|---|---|
| Document | Doc-4I_PassB_Part1_Patch_v1.0 — corrective patch for `Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0` |
| Nature | **Pass-B patch only.** Applies the accepted findings **F4I-PB1-M1 (MINOR)**, **F4I-PB1-M2 (MINOR)**, **F4I-PB1-M3 (MINOR)**, **F4I-PB1-N1 (NITPICK)**. Minimal, clarification/correction only. Not a redesign, not Pass-A, not a freeze audit. |
| Applies to | `Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0.md` |
| Finding source | `Doc-4I_PassB_Part1_Independent_Hard_Review_v1.0` (Open BLOCKER = 0 · MAJOR = 0 · MINOR = 3 · NITPICK = 1) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs; on conflict **FLAG-AND-HALT** |
| Scope | `billing.record_usage.v1` (§HB-3.1) · `billing.cancel_subscription.v1` (§HB-2.2) · `billing.purchase_subscription.v1` (§HB-2.1) · `billing.enforce_quota.v1` (§HB-3.2). No other contract changed. |
| Preserved unchanged | BC boundaries, aggregate ownership (BILL-1 Plan+Entitlement / BILL-2 Subscription / BILL-3 Usage Ledger), event ownership (`SubscriptionPurchased`/`Renewed`/`Expired` Billing-owned; `QuotationSubmitted` RFQ-owned), dependencies (DF-BILL-1…8), procurement moat, trust firewall, lifecycle definitions, validation ordering (1→9). No new contract/aggregate/event/permission/audit-action/POLICY-key. |

---

## 1. Patch Summary

Four accepted findings closed by minimal inline correction; no new contract-ID, field, aggregate, event, slug, audit action, or POLICY key; no ownership/event/moat/firewall change.

- **F4I-PB1-M1** — `billing.record_usage.v1` (§HB-3.1) Stage 7 over-constrained `quota_key` as a definitive `REFERENCE` to a BC-BILL-1 entitlement at record time. Per H.10 (`usage_ledger.quota_key` is a plain `string`, not a FK) and Doc-2 §10.8 (no record-time entitlement lookup), the `quota_key→entitlement` REFERENCE check is **removed**; `quota_key` is free-form at metering, with entitlement binding evaluated only at `billing.enforce_quota.v1` (§HB-3.2). Controlling-Org resolution stays at Stage 7. Board option (b).
- **F4I-PB1-M2** — `billing.cancel_subscription.v1` (§HB-2.2) Stage 7 failure class corrected from `REFERENCE / DEPENDENCY` to **`NOT_FOUND` / DEPENDENCY** (a user-scoped `subscription_id` that does not resolve collapses to `NOT_FOUND` — protected-fact, matching §HB-2.5 and the contract's own error register). Error register already correct (no change).
- **F4I-PB1-M3** — `billing.purchase_subscription.v1` (§HB-2.1) `CONFLICT` removed from Stage 6 (→ `STATE` only) and from the Section 11 Error Register (no `expected_status` input exists; concurrent-purchase contention resolves via the partial-UNIQUE constraint → `STATE`).
- **F4I-PB1-N1** — `billing.enforce_quota.v1` (§HB-3.2) Section 10 Outputs conditional ("if surfaced as an error class per the caller") removed; `QUOTA` return is stated deterministically.

**Regression:** Governance = none · Ownership = none · Authorization = none · Event = none · Moat = none · Trust-Firewall = none (detail in §6).

---

## 2. Applied Finding — F4I-PB1-M1

**Original Finding.** Stage 7 of `billing.record_usage.v1` asserts "`quota_key` resolves to a BC-BILL-1 entitlement (read)" with failure class `REFERENCE / DEPENDENCY`. H.10 defines `usage_ledger.quota_key` as a plain `string` (not a FK to `entitlements`); Doc-2 §10.8 specifies no record-time entitlement lookup. A definitive `REFERENCE` (`retryable:false`) at record time would silently drop metering for an unregistered `quota_key`, and is inconsistent with the enforcement-time lookup at §HB-3.2.

**Affected Location.** `billing.record_usage.v1` (§HB-3.1) — Section 6 Validation, Stage 7.

**Before**
```
| 7 REFERENCE | Doc-4A §4.5 | `quota_key` resolves to a BC-BILL-1 entitlement (read); Controlling Org resolves (DF-BILL-1) | `REFERENCE` / `DEPENDENCY` |
```

**After**
```
| 7 REFERENCE | Doc-4A §4.5 | Controlling Org resolves (DF-BILL-1). `quota_key` is a free-form `string` at metering time (H.10; Doc-2 §10.8 — `usage_ledger.quota_key` is not a foreign key and no record-time entitlement lookup is specified); entitlement binding for `quota_key` is evaluated only at `billing.enforce_quota.v1` (§HB-3.2), not here | `REFERENCE` (Controlling-Org definitive negative) / `DEPENDENCY` (transient) |
```

**Rationale.** Board option (b): the `quota_key→entitlement` REFERENCE check is removed and `quota_key` is confirmed free-form at metering, consistent with H.10 field-source definitions, Doc-2 §10.8, and the §HB-3.2 enforcement-time pattern. Stage 7 retains only the Controlling-Org resolution (a genuine cross-service reference). No metering data is silently dropped on an unregistered `quota_key`. No new field, aggregate, or event introduced; Section 11 (which already lists `REFERENCE` for Controlling-Org / `DEPENDENCY`) needs no change. **CLOSED.**

---

## 3. Applied Finding — F4I-PB1-M2

**Original Finding.** Section 6 Stage 7 of `billing.cancel_subscription.v1` lists `REFERENCE / DEPENDENCY` for "`subscription_id` resolves," but Section 11 Error Register has no `REFERENCE` class (it has `NOT_FOUND`). `subscription_id` is a user-scoped resource (the actor's own Controlling-Org subscription); a non-resolving id collapses to `NOT_FOUND` (protected-fact), not `REFERENCE`. The validation-matrix class must match the error register.

**Affected Location.** `billing.cancel_subscription.v1` (§HB-2.2) — Section 6 Validation, Stage 7.

**Before**
```
| 7 REFERENCE | Doc-4A §4.5 | `subscription_id` resolves | `REFERENCE` / `DEPENDENCY` |
```

**After**
```
| 7 REFERENCE | Doc-4A §4.5; §7.5 | `subscription_id` resolves within the actor's Controlling Org (user-scoped; protected-fact collapse) | `NOT_FOUND` / `DEPENDENCY` |
```

**Rationale.** `subscription_id` is the actor's own scoped resource (guarded at Stage 4 SCOPE). A non-existent or out-of-org id collapses to `NOT_FOUND` in both cases (Doc-4A §12.4/§7.5 protected-fact), matching §HB-2.5's correct pattern and the contract's own Section 11 (which already has `NOT_FOUND`, no `REFERENCE`). Only Stage 7 changes; the error register is already correct and is unchanged. No new error class; no ownership change. **CLOSED.**

---

## 4. Applied Finding — F4I-PB1-M3

**Original Finding.** Section 6 Stage 6 of `billing.purchase_subscription.v1` lists `STATE / CONFLICT`, and Section 11 registers `CONFLICT` ("optimistic-concurrency lost race on the subscription row"), but Section 5 Inputs defines **no `expected_status`** (or any optimistic-concurrency assertion token). Without an assertion token there is no basis for `CONFLICT` (Doc-4A §12.4). Concurrent purchases for the same org race the partial UNIQUE(`organization_id`) WHERE state='active' → the loser hits the Stage 6 STATE guard → `STATE`.

**Affected Location.** `billing.purchase_subscription.v1` (§HB-2.1) — Section 6 Validation Stage 6; Section 11 Error Register.

**Before (Stage 6)**
```
| 6 STATE | Doc-2 §5.7 | no `active` subscription exists for the org (partial UNIQUE); new row enters `pending_payment` | `STATE` / `CONFLICT` |
```

**After (Stage 6)**
```
| 6 STATE | Doc-2 §5.7 | no `active` subscription exists for the org (partial UNIQUE WHERE state='active'); new row enters `pending_payment`; a concurrent second purchase finds an existing `active` subscription → `STATE` (illegal-from-state; no optimistic-concurrency assertion token, so no `CONFLICT`) | `STATE` |
```

**Before (Section 11 Error Register row)**
```
| `CONFLICT` | optimistic-concurrency lost race on the subscription row | false |
```

**After (Section 11 Error Register row)**
```
(row removed — `purchase_subscription.v1` carries no `expected_status` assertion; concurrent-purchase contention resolves to `STATE` via the partial-UNIQUE constraint, Doc-4A §12.4)
```

**Rationale.** `CONFLICT` requires an optimistic-concurrency assertion token on the input (Doc-4A §12.4); `purchase_subscription.v1` has none. Concurrent-purchase contention is `STATE` (illegal-from-state via the partial-UNIQUE constraint), consistently distinguished from `CONFLICT` per H.4. Stage 6 and the Error Register are now mutually consistent and §12-compliant. No new field, no optimistic-concurrency mechanism, no lifecycle change; the §HB-2.1 Error Boundary note ("`STATE` (already-active) ≠ `CONFLICT` (lost race)") remains valid as the general H.4 separation statement. **CLOSED.**

---

## 5. Applied Finding — F4I-PB1-N1

**Original Finding.** Section 10 Outputs of `billing.enforce_quota.v1` reads "Failure: Doc-4A §12 envelope (incl. `QUOTA` when over limit, **if surfaced as an error class per the caller**)." The conditional "if surfaced as an error class per the caller" makes the contract behavior caller-dependent and non-deterministic. `QUOTA` is a canonical Doc-4A §12 class; the contract must define its own return unconditionally.

**Affected Location.** `billing.enforce_quota.v1` (§HB-3.2) — Section 10 Outputs.

**Before**
```
**10. Outputs** — **Success:** `allowed : bool`, `quota_key : string`, `limit : numeric`, `used : numeric`, `remaining : numeric`, `reference_id`. **Failure:** Doc-4A §12 envelope (incl. `QUOTA` when over limit, if surfaced as an error class per the caller).
```

**After**
```
**10. Outputs** — **Success:** `allowed : bool`, `quota_key : string`, `limit : numeric`, `used : numeric`, `remaining : numeric`, `reference_id`. **Failure:** Doc-4A §12 envelope. `QUOTA` is returned when `requested_amount` exceeds the entitlement-bounded quota (see Section 11).
```

**Rationale.** Wording only — the conditional is removed and the `QUOTA` return stated deterministically, consistent with Section 11 (which lists `QUOTA`) and the Stage 8 BUSINESS rule. No behavioral redesign, no new error class, no moat change (quota denial remains an entitlement check, never a routing/eligibility signal). **CLOSED.**

---

## 6. Patch Completeness Verification

| Check | Result |
|---|---|
| F4I-PB1-M1 — `record_usage` Stage 7 `quota_key` REFERENCE removed; free-form per H.10/Doc-2 §10.8; Controlling-Org resolution retained | ✓ CLOSED |
| F4I-PB1-M2 — `cancel_subscription` Stage 7 → `NOT_FOUND` / `DEPENDENCY`; matches error register + §HB-2.5 | ✓ CLOSED |
| F4I-PB1-M3 — `purchase_subscription` `CONFLICT` removed from Stage 6 (→ `STATE`) and Error Register | ✓ CLOSED |
| F4I-PB1-N1 — `enforce_quota` Outputs conditional removed; `QUOTA` deterministic | ✓ CLOSED |
| No new contract / aggregate / event / permission / audit action / POLICY key | ✓ |
| Validation ordering (1→9) unchanged | ✓ (only failure-class / rule text edited within Stage rows; no stage added/reordered) |
| BC boundaries + aggregate ownership unchanged (BILL-1 Plan+Entitlement / BILL-2 Subscription / BILL-3 Usage Ledger) | ✓ NONE |
| Event ownership unchanged (`SubscriptionPurchased`/`Renewed`/`Expired` Billing-owned; `QuotationSubmitted` RFQ-owned) | ✓ NONE |
| Dependencies (DF-BILL-1…8) unchanged | ✓ NONE |
| Procurement moat unchanged (quota = entitlement check, never routing/eligibility; subscription status never supplier-selection) | ✓ NONE |
| Trust firewall unchanged (no score owned/computed/modified) | ✓ NONE |
| Lifecycle definitions unchanged (`plans draft→active→retired`; subscriptions §5.7; `usage_ledger` append-only) | ✓ NONE |
| Sections edited = §HB-3.1, §HB-2.2, §HB-2.1, §HB-3.2 only | ✓ (no unrelated edit) |

```text
Findings applied = 4 (F4I-PB1-M1, F4I-PB1-M2, F4I-PB1-M3, F4I-PB1-N1) — all CLOSED
Governance / Ownership / Authorization / Event / Moat / Trust-Firewall regression = NONE
Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0   (post-patch, pending Patch Verification)
```

---

*End of Doc-4I_PassB_Part1_Patch_v1.0. Pass-B patch only — applies F4I-PB1-M1 (`record_usage` Stage-7 `quota_key` free-form per H.10/Doc-2 §10.8; REFERENCE entitlement check removed), F4I-PB1-M2 (`cancel_subscription` Stage-7 → `NOT_FOUND`), F4I-PB1-M3 (`purchase_subscription` `CONFLICT` removed — no assertion token; concurrent purchase → `STATE`), F4I-PB1-N1 (`enforce_quota` Outputs `QUOTA` deterministic). Minimal, clarification/correction only; sections §HB-3.1/§HB-2.2/§HB-2.1/§HB-3.2 only. No new contract/aggregate/event/permission/audit-action/POLICY-key; BC boundaries, aggregate ownership, event ownership, dependencies, procurement moat, trust firewall, lifecycle definitions, and validation ordering all preserved. Authorized next stage: Patch Verification → Freeze Audit.*
