# Doc-4I_PassB_Part2_Patch_v1.0 — Corrective Pass-B Patch (Module-7 Billing, Part 2 — BC-BILL-4/5/6)

| Field | Value |
|---|---|
| Document | Doc-4I_PassB_Part2_Patch_v1.0 — corrective patch for `Doc-4I_PassB_Part2_BC-BILL-4_5_6_v1.0` |
| Nature | **Pass-B patch only.** Applies the accepted findings **F4I-PB2-M1 (MINOR)**, **F4I-PB2-M2 (MINOR)**, **F4I-PB2-N1 (NITPICK)**. Minimal, clarification/correction only. Not a redesign. |
| Applies to | `Doc-4I_PassB_Part2_BC-BILL-4_5_6_v1.0.md` |
| Finding source | `Doc-4I_PassB_Part2_Independent_Hard_Review_v1.0` (PASS WITH PATCH; Open BLOCKER = 0 · MAJOR = 0 · MINOR = 2 · NITPICK = 1) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs; on conflict **FLAG-AND-HALT** |
| Scope | `billing.update_invoice_status.v1` (§HB-5.2) · `billing.advance_referral.v1` (§HB-6.2). No other contract changed. |
| Preserved unchanged | ownership (BC-BILL-4 Lead Credit Account / BC-BILL-5 Platform Invoice / BC-BILL-6 Reward Account), aggregate boundaries, event ownership, authorization ownership (Doc-2 §7 slugs; no new slug), lifecycle definitions, dependencies (DF-BILL-1…8), procurement moat, trust firewall. No new contract/aggregate/permission/event/audit-action/POLICY-key. |

---

## Section 1 — Executive Summary

| Finding | Resolution | Affected Contract |
|---|---|---|
| **F4I-PB2-M1** (MINOR) — `advance_referral` Stage-2 permits User + System but Stage-3 AUTHZ defines only the System branch → authorization ambiguity. | Board option (b): the User-advance path is the referrer org advancing its **own** referral → Stage-3 states the User branch as **`can_manage_billing`** (existing Doc-2 §7 slug; matches the paired `track_referral`). No new slug; authorization is now deterministic for both branches. | `billing.advance_referral.v1` (§HB-6.2) |
| **F4I-PB2-M2** (MINOR) — `update_invoice_status` and `advance_referral` Stage-7 list `REFERENCE / DEPENDENCY` without distinguishing the User branch (user-scoped → `NOT_FOUND` protected-fact) from the System branch (platform-scope → `REFERENCE`). | Stage-7 disambiguated by actor branch: **User branch → `NOT_FOUND`** (protected-fact collapse, §7.5/§12.4); **System branch → `REFERENCE` / `DEPENDENCY`** (definitive negative on a platform-scope lookup). `REFERENCE ≠ DEPENDENCY` preserved; error registers already carry both `NOT_FOUND` and `REFERENCE` (no change). | `billing.update_invoice_status.v1` (§HB-5.2) · `billing.advance_referral.v1` (§HB-6.2) |
| **F4I-PB2-N1** (NITPICK) — `update_invoice_status` audit pointer "§9 Financial ('payment status change')" blurs invoice-level status changes with payment-record status changes. | Board option (b): §HB-5.2 audit binding changed to **`[ESC-BILL-AUDIT]`** (invoice status change is not separately enumerated in Doc-2 §9 Financial; nearest §9 action by pointer; no action invented). §HB-5.3's "payment status change" pointer for `platform_payments` is correct and unchanged. | `billing.update_invoice_status.v1` (§HB-5.2) |

---

## Section 2 — Patch Details

### F4I-PB2-M1 — `billing.advance_referral.v1` (§HB-6.2) Stage-3 AUTHZ

**Before**
```
| 3 AUTHZ | Doc-2 §7 | track: `can_manage_billing`; advance System branch: System authority (no slug) | `AUTHORIZATION` |
```

**After**
```
| 3 AUTHZ | Doc-2 §7 | track: `can_manage_billing`; advance User branch: `can_manage_billing` (the referrer org advances its own referral); advance System branch: System authority (no slug) | `AUTHORIZATION` |
```

### F4I-PB2-M2 (a) — `billing.update_invoice_status.v1` (§HB-5.2) Stage-7

**Before**
```
| 7 REFERENCE | Doc-4A §4.5 | `invoice_id` resolves | `REFERENCE` / `DEPENDENCY` |
```

**After**
```
| 7 REFERENCE | Doc-4A §4.5; §7.5 | `invoice_id` resolves — **User (void) branch:** the invoice is the debtor org's own resource (user-scoped; protected-fact collapse) → `NOT_FOUND`; **System (paid/overdue) branch:** platform-scope lookup → `REFERENCE` (definitive) / `DEPENDENCY` (transient) | `NOT_FOUND` (User branch) / `REFERENCE` / `DEPENDENCY` (System branch) |
```

### F4I-PB2-M2 (b) — `billing.advance_referral.v1` (§HB-6.2) Stage-7

**Before**
```
| 7 REFERENCE | Doc-4A §4.5 | `referred_organization_id` resolves (track); `referral_id` resolves (advance) | `REFERENCE` / `DEPENDENCY` |
```

**After**
```
| 7 REFERENCE | Doc-4A §4.5; §7.5 | `referred_organization_id` resolves (track); `referral_id` resolves (advance) — **User branch:** `referral_id` is the referrer org's own resource (user-scoped; protected-fact collapse) → `NOT_FOUND`; **System branch:** platform-scope lookup → `REFERENCE` (definitive) / `DEPENDENCY` (transient) | `NOT_FOUND` (User branch) / `REFERENCE` / `DEPENDENCY` (System branch) |
```

### F4I-PB2-N1 — `billing.update_invoice_status.v1` (§HB-5.2) Section 9 Audit

**Before**
```
**9. Audit** — Trigger: invoice status change · owner Billing · **§9 Financial ("payment status change") by pointer** · `entity_type=platform_invoices`, `entity_id`, attribution `User`/`System`, via Doc-4B (in-transaction).
```

**After**
```
**9. Audit** — Trigger: invoice status change · owner Billing · **`[ESC-BILL-AUDIT]`** (invoice-level status change is not separately enumerated in Doc-2 §9 Financial — "platform invoice created" / "payment status change" enumerated; invoice status transition is not — nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented) · `entity_type=platform_invoices`, `entity_id`, attribution `User`/`System`, via Doc-4B (in-transaction). *(§HB-5.3 `record_payment.v1` retains §9 Financial "payment status change" for `platform_payments` records — unchanged.)*
```

---

## Section 3 — Regression Check

| Surface | Result |
|---|---|
| Ownership | UNCHANGED — BC-BILL-4 Lead Credit Account / BC-BILL-5 Platform Invoice / BC-BILL-6 Reward Account; disjoint; no aggregate added/moved. |
| Authorization ownership | UNCHANGED — Doc-2 §7 slugs only; M1 binds the existing `can_manage_billing` to the User-advance path (no new slug, no invented permission). |
| Event ownership | UNCHANGED — these three BCs emit no Doc-2 §8 event (the three subscription events stay BC-BILL-2's); `[ESC-BILL-EVENT]` consumption seams unchanged. |
| Lifecycle | UNCHANGED — `platform_invoices issued→paid/overdue/void`; `referrals pending→qualified→rewarded`; no state/transition added or removed (M1/M2 touch authorization + Stage-7 failure-class wording only). |
| Dependencies | UNCHANGED — DF-BILL-1/DF-BILL-2/DF-BILL-4/DF-BILL-8 carried as before. |
| Procurement moat | UNCHANGED — no lead-credit/invoice/reward/referral action influences matching/routing/ranking/supplier-selection/award/eligibility; credits/rewards never procurement standing. |
| Trust firewall | UNCHANGED — no BC computes/owns/modifies any Trust/Performance/Verification/Governance score. |

Additional invariants confirmed: validation ordering (1→9) unchanged (only Stage-3 and Stage-7 cell text edited within existing rows; no stage added/reordered); `REFERENCE ≠ DEPENDENCY` and `STATE ≠ CONFLICT` preserved; protected-fact collapse (`NOT_FOUND`) now correctly applied on the User branches; error registers unchanged (already carry `NOT_FOUND`, `REFERENCE`, `AUTHORIZATION`); `billing.platform_invoices ≠ operations.trade_invoices` (FIXED) unchanged; no audit action invented (`[ESC-BILL-AUDIT]` is the carried Doc-2 §9-additive marker). Sections edited = §HB-5.2 and §HB-6.2 only; §HB-5.3 unchanged.

---

## Section 4 — Patch Completion Statement

```text
All approved findings addressed.

  F4I-PB2-M1 = CLOSED  (advance_referral User-advance branch → `can_manage_billing`; deterministic; no new slug)
  F4I-PB2-M2 = CLOSED  (update_invoice_status + advance_referral Stage-7 disambiguated: User → NOT_FOUND, System → REFERENCE/DEPENDENCY)
  F4I-PB2-N1 = CLOSED  (update_invoice_status audit → [ESC-BILL-AUDIT]; §HB-5.3 payment pointer unchanged)

No architectural redesign performed.
No ownership / aggregate / event-ownership / authorization-ownership / lifecycle / dependency / moat / firewall change.
No new contract / aggregate / permission / event / audit action / POLICY key.

Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0   (post-patch, pending Patch Verification)

Ready for:
Doc-4I_PassB_Part2_Patch_Verification_v1.0
```

---

*End of Doc-4I_PassB_Part2_Patch_v1.0. Pass-B patch only — applies F4I-PB2-M1 (`advance_referral` User-advance authorization → `can_manage_billing`), F4I-PB2-M2 (`update_invoice_status` + `advance_referral` Stage-7 disambiguated by actor branch: User → `NOT_FOUND`, System → `REFERENCE`/`DEPENDENCY`), F4I-PB2-N1 (`update_invoice_status` audit → `[ESC-BILL-AUDIT]`). Minimal, clarification/correction only; sections §HB-5.2 / §HB-6.2 only. No redesign; ownership, aggregate boundaries, event ownership, authorization ownership, lifecycle, dependencies, procurement moat, and trust firewall all preserved; no new contract/aggregate/permission/event/audit-action/POLICY-key. Authorized next stage: Patch Verification → Freeze Audit.*
