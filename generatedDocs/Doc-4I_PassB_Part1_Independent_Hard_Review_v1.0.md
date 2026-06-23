# Doc-4I_PassB_Part1_Independent_Hard_Review_v1.0 — Architecture Board Hard Review (Module 7 — Billing / Monetization — Pass-B Part 1)

| Field | Value |
|---|---|
| Document | Doc-4I_PassB_Part1_Independent_Hard_Review_v1.0 |
| Nature | **Independent Architecture Board Hard Review.** Defect Discovery Review. Not a Patch Review, Patch Verification, Freeze Audit, Architecture Redesign, or Pass-A Review. |
| Document Reviewed | `Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0` |
| Part Scope | BC-BILL-1 (Plans & Entitlements) · BC-BILL-2 (Subscriptions) · BC-BILL-3 (Usage & Quota) |
| Contracts in Scope | 18 contract-IDs: BC-BILL-1 (8), BC-BILL-2 (7), BC-BILL-3 (3) |
| Authority (precedence) | Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4H (FROZEN) · Doc-4I_Structure_v1.0 (FROZEN) · Doc-4I_PassA_Content_v1.0 (FROZEN) · Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0 |
| Conflict rule | FLAG-AND-HALT on any corpus conflict — never resolved locally |
| Standing constraints | No slug invented · No structural change · No ownership change · No lifecycle change · No event invented · No redesign · No new BCs · No new aggregates · No reopening frozen decisions |

---

## Architecture Board Assessment

### Document Reviewed: `Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0`

---

## Executive Verdict

```
BLOCKER   = 0
MAJOR     = 0
MINOR     = 3  (F4I-PB1-M1, F4I-PB1-M2, F4I-PB1-M3)
NITPICK   = 1  (F4I-PB1-N1)

Status: PASS WITH PATCH
```

The document hardens 18 frozen Pass-A contract-IDs to implementation grade across BC-BILL-1, BC-BILL-2, and BC-BILL-3. Ownership is disjoint and frozen; authority separation (entitlement / subscription+resolution / quota-enforcement) is correctly maintained; the procurement moat and trust firewall are intact; all three produced events are correctly attributed; and the nine-stage validation order is followed throughout. Three MINOR defects and one NITPICK require correction before Freeze Audit.

---

## What Was Fixed Successfully

The following corpus issues from prior review stages are correctly reflected in Pass-B Part 1:

- **F4I-MA1 (structure MAJOR — CLOSED):** BC-BILL-2↔BC-BILL-3 entitlement-read seam is fully specified. `billing.resolve_entitlements.v1` (§HB-2.4) names BC-BILL-2 as the entitlement-resolution authority; §HB-3.2 states BC-BILL-3 consumes from BC-BILL-2 by intra-module read; enforcement-read binding carried `[ESC-BILL-POLICY]` (H.9 preamble, §HB-2.4 Stage 9, §HB-3.2 Stage 9, Section 12). ✓
- **F4I-MA2 (structure MAJOR — CLOSED):** DF-BILL-2 (Marketplace) and DF-BILL-4 (Operations) signals (`ad_launch`/`lead_access`) correctly marked `[ESC-BILL-EVENT]` in §HB-3.1 and Appendix B. `QuotationSubmitted` (DF-BILL-3) correctly named as RFQ-owned, BC-BILL-3-consumed. ✓
- **F4I-PA-M2 (Pass-A MINOR — CLOSED):** `billing.expire_subscription.v1` audit correctly set to `[ESC-BILL-AUDIT]` at §HB-2.3 Section 9 and Appendix A. `billing.renew_subscription.v1` retains §9 Financial ("subscription renewal") binding. The split is clean and consistent with the frozen Pass-A patch. ✓
- **Inventory reconciliation (user-confirmed before authoring):** Brief-vs-frozen delta (renamed/added contract-IDs) resolved correctly. Frozen Pass-A governs; no contract invented, renamed, or omitted. Reconciliation record is present and explicit (Recorded Reconciliation section). ✓

---

## Findings

---

### F4I-PB1-M1 (MINOR)

**Location:** `billing.record_usage.v1` (§HB-3.1) — Section 6 Validation, Stage 7 REFERENCE

**Finding:** Stage 7 asserts: "`quota_key` resolves to a BC-BILL-1 entitlement (read)" with failure class `REFERENCE / DEPENDENCY`. The H.10 field-source authority defines `usage_ledger.quota_key` as a plain `string` — not a foreign-key reference to `entitlements`. Doc-2 §10.8 does not specify a record-time entitlement lookup for usage recording. The enforcement-time lookup occurs at `billing.enforce_quota.v1` (§HB-3.2 Stage 7: "the BC-BILL-2 entitlement resolution + `usage_ledger` balance resolve"). Claiming a definitive-negative `REFERENCE` failure at record time — meaning a usage event with an unrecognized `quota_key` hard-fails metering with `retryable:false` — is an unanchored over-constraint. It is also inconsistent with the enforcement-time pattern established by §HB-3.2.

**Impact:** If implemented as written, any metered signal carrying a `quota_key` not yet registered in the BC-BILL-1 entitlement catalog would fail metering definitively and non-retryably, silently dropping usage data. If this is deliberate design intent, it requires an explicit Doc-2 §10.8 / Doc-4A authority anchor stating that `quota_key` must resolve at record time. If it is not deliberate, the `REFERENCE` check on `quota_key` at Stage 7 must be removed (or softened to a `DEPENDENCY`-class transient path if the lookup is optional-on-best-effort).

**Required action:** Either (a) cite the Doc-2 §10.8 / Doc-4A authority that mandates `quota_key` resolution at record time and update the Stage 7 note accordingly, or (b) remove the `quota_key → BC-BILL-1 entitlement` REFERENCE check from Stage 7 and confirm that `quota_key` is a free-form string at metering time, with entitlement binding evaluated only at `enforce_quota` time. Either resolution must be consistent with H.10 field-source definitions. No new field, aggregate, or event may be invented.

---

### F4I-PB1-M2 (MINOR)

**Location:** `billing.cancel_subscription.v1` (§HB-2.2) — Section 6 Validation Stage 7; Section 11 Error Register

**Finding:** Section 6 Stage 7 lists `REFERENCE / DEPENDENCY` as the failure class for "`subscription_id` resolves." Section 11 Error Register has no `REFERENCE` class; it contains `VALIDATION`, `AUTHORIZATION`, `NOT_FOUND`, `STATE`, `CONFLICT`, `DEPENDENCY`, `SYSTEM`. `REFERENCE` is absent from the error register but present in Stage 7. The failure class in the validation matrix and the error register must match.

**Root cause:** `subscription_id` is a user-scoped resource (the actor's own Controlling-Org subscription, guarded at Stage 4 SCOPE via `NOT_FOUND` protected-fact collapse). A `subscription_id` that does not exist — whether absent from the DB entirely or outside the actor's org — collapses to `NOT_FOUND` in both cases (the actor must not be told which scenario applies). `REFERENCE` (Doc-4A §12.2 definitive negative, `retryable:false`) applies to cross-aggregate external resource lookups (e.g., `plan_id` → BC-BILL-1 Plan in `purchase_subscription`), not to the actor's own scoped resources. The correct failure class for Stage 7 here is `NOT_FOUND`.

Compare: §HB-2.5 `get_subscription`/`list_subscription_events` Stage 7 correctly reads "`subscription_id` resolves (else `NOT_FOUND`)" with failure class `NOT_FOUND` in both the validation table and the error register. `cancel_subscription` should match this pattern.

**Required action:** Correct `billing.cancel_subscription.v1` Stage 7 failure class from `REFERENCE / DEPENDENCY` to `NOT_FOUND` / `DEPENDENCY`. Verify the error register (Section 11) requires no change (it already has `NOT_FOUND`; `REFERENCE` is absent — which is correct; no change needed there). Only Stage 7 requires correction.

---

### F4I-PB1-M3 (MINOR)

**Location:** `billing.purchase_subscription.v1` (§HB-2.1) — Section 6 Validation Stage 6; Section 11 Error Register

**Finding:** Section 6 Stage 6 includes `CONFLICT` in the failure class ("new row enters `pending_payment`; `STATE` / `CONFLICT`"). Section 11 Error Register lists `CONFLICT` ("optimistic-concurrency lost race on the subscription row"). However, `billing.purchase_subscription.v1` Section 5 Inputs defines no `expected_status` field. Without an `expected_status` input (or equivalent optimistic-concurrency assertion), there is no basis for a `CONFLICT` class. `CONFLICT` (Doc-4A §12.4 optimistic-concurrency lost race) requires an assertion token on the input; the comparison fails when the token mismatches the current state.

**Concurrent-purchase behavior:** Two simultaneous purchase requests for the same `organization_id` race against the partial UNIQUE constraint (`organization_id` WHERE state='active'). The losing request finds an `active` subscription already exists → Stage 6 STATE guard fires → `STATE` ("an active subscription already exists"). This is `STATE` (illegal-from-state), not `CONFLICT` (lost-race on an optimistic-concurrency assertion). The distinction is required by Doc-4A §12.4 and H.4.

**Required action:** Remove `CONFLICT` from Stage 6 failure class (corrected: `STATE` only) and remove `CONFLICT` from Section 11 Error Register. No new error class, field, or mechanism may be added.

---

### F4I-PB1-N1 (NITPICK)

**Location:** `billing.enforce_quota.v1` (§HB-3.2) — Section 10 Outputs

**Finding:** Outputs Section reads: "Failure: Doc-4A §12 envelope (incl. `QUOTA` when over limit, **if surfaced as an error class per the caller**)." The parenthetical "if surfaced as an error class per the caller" introduces conditional ambiguity into a contract that must be fully deterministic for AI-agent consumers. `QUOTA` is a canonical Doc-4A §12 closed-class error. Whether the **calling system** treats an over-limit response as a hard stop or a soft advisory is the caller's implementation concern; the **contract** must define its own behavior unconditionally. The current phrasing implies the `QUOTA` class may or may not be returned depending on caller preference, which is incorrect.

**Required action:** Rephrase to remove the conditional. E.g.: "Failure: Doc-4A §12 envelope. `QUOTA` is returned when `requested_amount` exceeds the entitlement-bounded quota (see Section 11)." No design change; wording only.

---

## Domain Assessment

| Domain | Result | Notes |
|---|---|---|
| 1. Ownership Integrity | PASS | BC-BILL-1 Plan+Entitlement · BC-BILL-2 Subscription · BC-BILL-3 Usage Ledger — disjoint, no leakage, no shared ownership. Cross-BC reads (§HB-2.4, §HB-3.2) are reads, not ownership transfers. |
| 2. Authorization Integrity | PASS | No slug invented. `[ESC-BILL-SLUG]` on BC-BILL-1 catalog. `can_manage_billing` on BC-BILL-2 mutations. `can_view_billing` on BC-BILL-2/3 reads. System authority (no slug) on 21.5 contracts. Three-layer check and `check_permission` (DF-BILL-1/Doc-4C) named per mutating contract. |
| 3. Validation Integrity | MINOR | Nine-stage order correct throughout. Stage 8 BUSINESS sentinel phrase present on all query contracts. **F4I-PB1-M1** (§HB-3.1 Stage 7 over-constraint), **F4I-PB1-M2** (§HB-2.2 Stage 7 failure-class mismatch), **F4I-PB1-M3** (§HB-2.1 Stage 6 / error register `CONFLICT` without assertion). |
| 4. Event Integrity | PASS | `SubscriptionPurchased` (§HB-2.1) · `SubscriptionRenewed` / `SubscriptionExpired` (§HB-2.3) — BC-BILL-2-owned, single-authorship, outbox, Communication (DF-BILL-6). BC-BILL-1 emits none. BC-BILL-3 consumes `QuotationSubmitted` (RFQ-owned; no ownership transfer) + `[ESC-BILL-EVENT]` signals; emits none. No event coined. |
| 5. Audit Integrity | PASS | Plan/entitlement catalog mutations: `[ESC-BILL-AUDIT]`. Subscription purchase/cancel/renew: §9 Financial/Organization (by pointer). Subscription expire: `[ESC-BILL-AUDIT]` (F4I-PA-M2 correction applied correctly). Usage recording: `[ESC-BILL-AUDIT]`. Reads: none (§17.1). All via Doc-4B in-transaction. No audit action invented. |
| 6. POLICY Integrity | PASS | `[ESC-BILL-POLICY]` on page_size, dedup windows, metering window, quota reset, payment-retry/grace, entitlement enforcement-read binding. No `billing.*` POLICY key invented. |
| 7. Dependency Integrity | PASS | DF-BILL-1…8 carried correctly. DF-BILL-5 (Trust) as negative assertion only. `REFERENCE ≠ DEPENDENCY` (definitive negative vs. transient) separated consistently across all contracts — except the Stage 7 label in §HB-2.2 (covered under F4I-PB1-M2; error register is already correct). Intra-module BC-BILL-3→BC-BILL-2 seam correctly labeled `DEPENDENCY` (transient) in §HB-3.2. |
| 8. Lifecycle Integrity | PASS | Plan `draft → active → retired` (terminal), correct. Entitlement/plan_entitlements: simple/upsert, correct. Subscription §5.7 `pending_payment → active → expired` with cancel (`auto_renew=false`, no state change) and renew (`active → active`) correct. Usage Ledger append-only. No edge added or modified. |
| 9. Procurement Moat | PASS | Module-wide assertion in H.9 and Appendix A invariants. Per-contract spot checks confirm: quota enforcement is an entitlement check, never routing/eligibility/supplier-selection; subscription status is never supplier-selection authority. No moat breach. |
| 10. Trust Firewall | PASS | H.9 asserts firewall. All Section 12 Dependencies entries close with "no Trust score (firewall)." No contract reads, writes, derives, or references any Trust/Performance/Verification/Governance score. |
| 11. AI-Agent Determinism | MINOR | H.1–H.10 conventions establish canonical patterns; the 12-section record shape is consistently applied. Residual ambiguities are the three MINOR defects (F4I-PB1-M1 leaves record-time `quota_key` resolution undefined; F4I-PB1-M2 leaves a Stage 7 label inconsistent with the error register; F4I-PB1-M3 introduces an undefined error class). **F4I-PB1-N1** (§HB-3.2 conditional phrasing on `QUOTA`). All correctable by patch without design change. |

---

## Final Assessment

```
Open BLOCKER  = 0
Open MAJOR    = 0
Open MINOR    = 3  (F4I-PB1-M1 · F4I-PB1-M2 · F4I-PB1-M3)
Open NITPICK  = 1  (F4I-PB1-N1)
```

---

## Approval Question

**Can `Doc-4I_PassB_Part1_BC-BILL-1_2_3_v1.0` proceed directly to `Doc-4I_PassB_Part1_Freeze_Audit_v1.0`?**

**NO**

**Justification.** Three MINOR findings require correction before Freeze Audit. F4I-PB1-M1: Stage 7 REFERENCE on `quota_key` in `record_usage.v1` is either unanchored (requiring corpus authority cite) or incorrect (requiring removal) — the over-constraint as written could silently drop metering data. F4I-PB1-M2: Stage 7 failure class in `cancel_subscription.v1` lists `REFERENCE` but the error register (correctly) omits it; user-scoped `subscription_id` resolution failure is `NOT_FOUND`, not `REFERENCE`. F4I-PB1-M3: `purchase_subscription.v1` registers `CONFLICT` in Stage 6 and Section 11 but has no `expected_status` input; concurrent-purchase contention resolves via the partial-UNIQUE constraint → `STATE`, not `CONFLICT`. The NITPICK (F4I-PB1-N1: conditional `QUOTA` phrasing) should be corrected in the same patch pass. Required path: **Patch → Patch Verification → Freeze Audit**.

---

*End of Doc-4I_PassB_Part1_Independent_Hard_Review_v1.0. Defect Discovery Review — BC-BILL-1/2/3 Pass-B Part 1. Open BLOCKER = 0 · MAJOR = 0 · MINOR = 3 (F4I-PB1-M1 · F4I-PB1-M2 · F4I-PB1-M3) · NITPICK = 1 (F4I-PB1-N1). Status: PASS WITH PATCH. Proceed to Freeze Audit: NO. Required path: Patch → Patch Verification → Freeze Audit. Corpus authority: Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4H · Doc-4I_Structure_v1.0 · Doc-4I_PassA_Content_v1.0 — all FROZEN.*
