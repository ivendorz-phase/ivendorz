# Doc-4I_PassB_Part2_Independent_Hard_Review_v1.0 — Architecture Board Hard Review (Module 7 — Billing / Monetization — Pass-B Part 2)

| Field | Value |
|---|---|
| Document | Doc-4I_PassB_Part2_Independent_Hard_Review_v1.0 |
| Nature | **Independent Architecture Board Hard Review.** Defect Discovery Review. Not a Patch Review, Patch Verification, Freeze Audit, Architecture Redesign, or Pass-A Review. |
| Document Reviewed | `Doc-4I_PassB_Part2_BC-BILL-4_5_6_v1.0` |
| Part Scope | BC-BILL-4 (Lead Credits) · BC-BILL-5 (Platform Invoicing & Payments) · BC-BILL-6 (Rewards & Referrals) |
| Contracts in Scope | 14 contract-IDs: BC-BILL-4 (4), BC-BILL-5 (5), BC-BILL-6 (5) |
| Authority (precedence) | Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4H (FROZEN) · Doc-4I_Structure_v1.0 (FROZEN) · Doc-4I_PassA_Content_v1.0 (FROZEN) · Doc-4I_PassB_Part1_v1.0 (FROZEN) · Doc-4I_PassB_Part2_BC-BILL-4_5_6_v1.0 |
| Conflict rule | FLAG-AND-HALT on any corpus conflict — never resolved locally |
| Standing constraints | No slug invented · No structural change · No ownership change · No lifecycle change · No event invented · No redesign · No new BCs · No new aggregates · No reopening frozen decisions |

---

## Architecture Board Assessment

### Document Reviewed: `Doc-4I_PassB_Part2_BC-BILL-4_5_6_v1.0`

---

## Executive Verdict

```
BLOCKER   = 0
MAJOR     = 0
MINOR     = 2  (F4I-PB2-M1, F4I-PB2-M2)
NITPICK   = 1  (F4I-PB2-N1)

Status: PASS WITH PATCH
```

The document hardens 14 frozen Pass-A contract-IDs to implementation grade across BC-BILL-4, BC-BILL-5, and BC-BILL-6. Ownership is disjoint and frozen; `billing.platform_invoices ≠ operations.trade_invoices` is correctly asserted throughout; no Doc-2 §8 events are emitted; the procurement moat and trust firewall are intact; and the nine-stage validation order is followed throughout. Two MINOR defects and one NITPICK require correction before Freeze Audit.

---

## What Was Fixed Successfully

The following corpus decisions and prior-session findings are correctly reflected in Pass-B Part 2:

- **F4I-PA-M1 (Pass-A MINOR — CLOSED):** All six actor-branched contracts (`credit_lead_account`, `debit_lead_account`, `issue_platform_invoice`, `update_invoice_status`, `credit_reward`, `track_referral`) are correctly recorded as one contract-ID each with actor-branched authorization. No split; no new contract-ID; counts consistent. ✓
- **F4I-PA-M2 correction carry:** No subscription events in scope for Part 2; the three subscription events remain BC-BILL-2-owned (Part 1 frozen; not reopened). BC-BILL-4/5/6 correctly emit no Doc-2 §8 events. ✓
- **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED):** Asserted in H.9 preamble, §HB-5.1 Purpose and Stage 8, §HB-5.2, Appendix A invariants, and colophon. BC-BILL-5 owns no trade invoice, payment record, escrow, wallet, fund custody, or settlement. ✓
- **`CONFLICT` discipline (Part 1 F4I-PB1-M3 precedent applied):** BC-BILL-4 (`credit_lead_account`/`debit_lead_account`) has no `expected_status` input and correctly carries no `CONFLICT` in the error register (append-only ledger, no optimistic-concurrency assertion). H.4 states explicitly: "`CONFLICT` only where an `expected_status`/row-version assertion token exists on the input." ✓
- **`NOT_FOUND` collapse discipline (Part 1 F4I-PB1-M2 precedent, partially applied):** H.4 correctly states user-scoped resources collapse to `NOT_FOUND`. BC-BILL-4 reads, §HB-5.4, and §HB-6.3 consistently apply this. Actor-branched mutation contracts carry `NOT_FOUND` in their error registers. The Stage 7 labeling for actor-branched mutation contracts (§HB-5.2, §HB-6.2) remains inconsistent — covered under F4I-PB2-M2. ✓ (partial)
- **Lead-credit `leads.credit_value` POLICY key:** Named Doc-3 §6 key correctly cited in §HB-4.1 Stage 9 and Appendix B. No `billing.*` key invented. ✓
- **Intra-BC seams documented:** §HB-5.3 → §HB-5.2 (record_payment drives invoice → paid) and §HB-6.2 → §HB-6.1 (advance_referral → rewarded triggers separate credit_reward movement) both explicitly noted in Section 12 of the respective contracts. ✓

---

## Findings

---

### F4I-PB2-M1 (MINOR)

**Affected contracts:** `billing.advance_referral.v1` (§HB-6.2)

**Finding:** Section 6 Stage 2 CONTEXT states "advance: System (milestone) or User" — establishing that both System and User actors may advance a referral. Stage 3 AUTHZ covers only one branch: "advance System branch: System authority (no slug)." The User-branch authorization slug for `advance_referral` is entirely absent from Stage 3. No slug is stated, no `[ESC-BILL-SLUG]` is carried, and no note defers the question. Stage 2 and Stage 3 are therefore contradictory: Stage 2 permits a User actor to advance a referral; Stage 3 provides no authorization rule for that actor.

This creates a binary implementation ambiguity: if only System can advance, Stage 2 must remove "User" from the advance path. If Users can advance, the authorization slug (or `[ESC-BILL-SLUG]` where no §7 slug exists) must be stated in Stage 3. Either resolution is a correction, not a design change — but the current state is indeterminate and cannot be implemented deterministically.

Note: `billing.track_referral.v1` (the paired contract in §HB-6.2) is correctly specified: track = User + `can_manage_billing`. The defect is isolated to the advance path.

**Impact:** AI-agent consumers cannot determine what authorization check to apply when a User calls `advance_referral`. Any implementation will guess; the guess may be wrong. A contract reviewer cannot verify authorization completeness for this path.

**Required action:** Either (a) remove "User" from Stage 2 CONTEXT for the advance path and confirm that `advance_referral` is System-only (no User actor can advance a referral directly), or (b) state the User-advance authorization slug at Stage 3 (`can_manage_billing` if the referrer org manages its own referral advancement, or `[ESC-BILL-SLUG]` if no §7 slug covers this action). No slug may be invented; if no enumerated §7 slug applies, `[ESC-BILL-SLUG]` must be carried. The error register requires no change (it already carries `AUTHORIZATION`). No design change may be made.

---

### F4I-PB2-M2 (MINOR)

**Affected contracts:** `billing.update_invoice_status.v1` (§HB-5.2), `billing.advance_referral.v1` (§HB-6.2)

**Finding:** Both contracts are actor-branched (User + System). In both, Section 6 Stage 7 lists `REFERENCE / DEPENDENCY` as the failure class for a resource lookup that is a **user-scoped resource** on the User branch. Per H.4: "A user-scoped resource that does not resolve collapses to `NOT_FOUND` (protected-fact, §7.5/§12.4) — not `REFERENCE`." The error registers for both contracts correctly include `NOT_FOUND`; Stage 7 does not include `NOT_FOUND` and does not disambiguate by actor branch.

- **§HB-5.2:** Stage 7 — "`invoice_id` resolves | `REFERENCE` / `DEPENDENCY`". For the User (void) branch: `invoice_id` is the debtor org's own invoice (guarded at Stage 4 SCOPE); non-resolution must collapse to `NOT_FOUND`. For the System (paid/overdue) branch: a System-scope invoice lookup is not user-scoped; non-resolution is `REFERENCE`. Stage 7 must state both.
- **§HB-6.2:** Stage 7 — "`referral_id` resolves (advance) | `REFERENCE` / `DEPENDENCY`". For the User advance branch: `referral_id` is the referrer org's own referral (guarded at Stage 4 SCOPE); non-resolution must collapse to `NOT_FOUND`. For the System advance branch: `REFERENCE`. Stage 7 must state both.

This finding follows the same pattern as Part 1 F4I-PB1-M2 (`cancel_subscription.v1`) and should be corrected consistently.

**Impact:** An implementor reading Stage 7 in isolation would raise `REFERENCE` for a User-branch lookup that must return `NOT_FOUND`. This leaks protected-fact information (confirming a resource's non-existence to an unauthorized user) and violates the §7.5/§12.4 protected-fact collapse rule.

**Required action:** For each affected contract, update Stage 7 to disambiguate the failure class by actor branch. The corrected form should state both failure paths: User branch → `NOT_FOUND` (protected-fact collapse); System branch → `REFERENCE / DEPENDENCY` (definitive negative on a platform-scope lookup). No design change; wording only.

---

### F4I-PB2-N1 (NITPICK)

**Affected contract:** `billing.update_invoice_status.v1` (§HB-5.2)

**Finding:** Section 9 Audit: "§9 Financial ('payment status change') by pointer." This pointer is used for mutations to `platform_invoices.status` (i.e., the invoice record transitioning between `issued`, `paid`, `overdue`, `void`). The §9 Financial enumeration's "payment status change" is most precisely anchored to payment-gateway record transitions (`platform_payments.status` — as used in §HB-5.3 `record_payment.v1`). For invoice-level status changes, the closest enumerated §9 Financial action is "platform invoice created" (the only other named §9 action for the invoice entity), or, if "invoice status change" is not separately enumerated, `[ESC-BILL-AUDIT]` by pointer would be more precise.

Using "payment status change" for invoice-level status changes (§HB-5.2) and for payment-record status changes (§HB-5.3) creates an ambiguous pointer that equates two distinct entity types under the same §9 label.

**Required action:** Clarify the §HB-5.2 audit binding. Either (a) retain "payment status change" and add a parenthetical explicitly stating this pointer covers invoice-level state changes driven by payment outcomes (or dunning, or void), acknowledging that "invoice status change" is not separately §9-enumerated; or (b) change §HB-5.2 to `[ESC-BILL-AUDIT]` (nearest §9 action by pointer; no action invented) since "invoice status change" is not in the Doc-2 §9 Financial enumeration. §HB-5.3's "payment status change" pointer for `platform_payments` records remains correct and must not change. Wording only; no design change.

---

## Domain Assessment

| Domain | Result | Notes |
|---|---|---|
| 1. Ownership Integrity | PASS | BC-BILL-4 Lead Credit Account · BC-BILL-5 Platform Invoice · BC-BILL-6 Reward Account — disjoint, no leakage. Cross-BC reads (source_invoice_id, subscription_id) are reads, not ownership transfers. Intra-BC seams documented in Section 12. `billing.platform_invoices ≠ operations.trade_invoices` correctly asserted throughout. |
| 2. Authorization Integrity | MINOR | No slug invented. `can_manage_billing` / `can_view_billing` / `[ESC-BILL-SLUG]` / System correctly applied across BC-BILL-4 and BC-BILL-5. **F4I-PB2-M1:** `advance_referral.v1` User-branch slug absent from Stage 3. All other authorization rules complete and correctly stated. |
| 3. Validation Integrity | MINOR | Nine-stage order correct throughout. Stage 8 BUSINESS sentinel phrase present on all query contracts. Authority column present per row. **F4I-PB2-M2:** Stage 7 failure class omits `NOT_FOUND` for User-branch resource lookups in two actor-branched contracts (§HB-5.2, §HB-6.2). All other validation rows correct. |
| 4. Event Integrity | PASS | BC-BILL-4/5/6 emit no Doc-2 §8 events. BC-BILL-4 consumes lead-access (DF-BILL-4, `[ESC-BILL-EVENT]`). BC-BILL-5 consumes advertising/microsite (DF-BILL-2, `[ESC-BILL-EVENT]`). BC-BILL-6 consumes internal milestone triggers only (no §8 emission event). No event coined; no event ownership transferred; subscription events remain BC-BILL-2-owned (Part 1 frozen). |
| 5. Audit Integrity | NITPICK | Lead-credit/reward/referral mutations: `[ESC-BILL-AUDIT]` ✓. Invoice create: §9 Financial ("platform invoice created") ✓. Payment record changes: §9 Financial ("payment status change"/"refund") ✓. Reads: none (§17.1) ✓. No audit action invented. **F4I-PB2-N1:** §HB-5.2 "payment status change" pointer for invoice-status mutations is imprecise. |
| 6. POLICY Integrity | PASS | `[ESC-BILL-POLICY]` on dedup windows, page_size, dunning window, payment-retry/refund, reward values, referral reward / qualification window. `leads.credit_value` (Doc-3 §6) correctly named. No `billing.*` POLICY key invented. |
| 7. Dependency Integrity | PASS | DF-BILL-1/2/4/8 correctly scoped. DF-BILL-3/6/7 correctly absent from Part 2 seams. DF-BILL-5 Trust as negative assertion only. `REFERENCE ≠ DEPENDENCY` consistently separated throughout error registers. Intra-BC seams (§HB-5.3→§HB-5.2; §HB-6.2→§HB-6.1) correctly documented in Section 12. |
| 8. Lifecycle Integrity | PASS | Lead-credit/reward transactions append-only ✓. Platform invoices `issued → paid\|overdue\|void`; `overdue → paid\|void`; terminals `paid`/`void` ✓. Platform payments `initiated → succeeded\|failed\|refunded`; `succeeded → refunded`; gateway-callback idempotency (no-op on repeat) ✓. Referrals `pending → qualified → rewarded` ✓. No edge added or modified. |
| 9. Procurement Moat | PASS | H.9 module-wide assertion. Per-contract: lead credits = commercial balance, never procurement standing; platform invoices = platform fees, never trade invoice; reward points = promotional, never procurement standing; referral rewards = promotional. No influence on matching/routing/ranking/supplier-selection/award/eligibility. No violation found. |
| 10. Trust Firewall | PASS | H.9 asserts firewall. All Section 12 Dependencies close with "no Trust score (firewall)." No contract reads, writes, derives, or references any Trust/Performance/Verification/Governance score. |
| 11. AI-Agent Determinism | MINOR | H.1–H.10 conventions correct and consistently applied. Actor-branch patterns explicit. 12-section record shape consistent. Residual ambiguities: F4I-PB2-M1 leaves `advance_referral` User-branch authorization indeterminate; F4I-PB2-M2 leaves Stage 7 failure class ambiguous for two actor-branched contracts. Both correctable by patch without design change. |

---

## Final Assessment

```
Open BLOCKER  = 0
Open MAJOR    = 0
Open MINOR    = 2  (F4I-PB2-M1 · F4I-PB2-M2)
Open NITPICK  = 1  (F4I-PB2-N1)
```

---

## Approval Question

**Can `Doc-4I_PassB_Part2_BC-BILL-4_5_6_v1.0` proceed directly to `Doc-4I_PassB_Part2_Freeze_Audit_v1.0`?**

**NO**

**Justification.** Two MINOR findings require correction before Freeze Audit. F4I-PB2-M1: `advance_referral.v1` Stage 2 CONTEXT permits a User actor on the advance path, but Stage 3 AUTHZ provides no authorization rule for that branch — the contract cannot be deterministically implemented as written. F4I-PB2-M2: Stage 7 failure class in two actor-branched contracts (§HB-5.2, §HB-6.2) lists `REFERENCE / DEPENDENCY` without distinguishing the User branch (`NOT_FOUND`, protected-fact) from the System branch (`REFERENCE`) — the same pattern as Part 1 F4I-PB1-M2 and correctable by the same disambiguation technique. The NITPICK (F4I-PB2-N1: §HB-5.2 audit pointer ambiguity) should be resolved in the same patch pass. Required path: **Patch → Patch Verification → Freeze Audit**.

---

*End of Doc-4I_PassB_Part2_Independent_Hard_Review_v1.0. Defect Discovery Review — BC-BILL-4/5/6 Pass-B Part 2. Open BLOCKER = 0 · MAJOR = 0 · MINOR = 2 (F4I-PB2-M1 · F4I-PB2-M2) · NITPICK = 1 (F4I-PB2-N1). Status: PASS WITH PATCH. Proceed to Freeze Audit: NO. Required path: Patch → Patch Verification → Freeze Audit. Corpus authority: Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4H · Doc-4I_Structure_v1.0 · Doc-4I_PassA_Content_v1.0 · Doc-4I_PassB_Part1_v1.0 — all FROZEN.*
