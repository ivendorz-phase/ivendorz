# Doc-4I_PassA_Patch_v1.0 — Corrective Pass-A Patch (Module-7 Billing / Monetization)

| Field | Value |
|---|---|
| Document | Doc-4I_PassA_Patch_v1.0 — corrective patch for `Doc-4I_PassA_Content_v1.0` |
| Nature | **Pass-A patch only.** Applies the accepted findings **F4I-PA-M1 (MINOR)** and **F4I-PA-M2 (MINOR)**. Minimal, clarification/correction only. Not a redesign, not a structure change, not Pass-B. |
| Applies to | `Doc-4I_PassA_Content_v1.0.md` |
| Finding source | `Doc-4I_PassA_Independent_Hard_Review_v1.0` (Open BLOCKER = 0 · MAJOR = 0 · MINOR = 2 · NITPICK = 0) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs; on conflict **FLAG-AND-HALT** |
| Scope | A4.2 (`expire_subscription` audit), A4.4 / A4.5 / A4.6 (six dual-template entries), A8 (subscription audit row). **No other section changed.** |
| Preserved unchanged (frozen governance) | module identity, `billing` schema/`billing_` namespace, BC inventory (BC-BILL-1…6), aggregate inventory (7), ownership matrix, monetization authority, procurement moat, trust firewall, produced events (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired`), DF-BILL-1…8, escalation markers, A12 contract counts |

---

## 1. Patch Summary

Two MINOR Pass-A findings closed by inline clarification/correction; no contract-ID added, no ownership/BC/event change, no count change.

- **F4I-PA-M1** — six A4 entries carried dual template/actor designations ("21.4 Command / 21.5 System · Actor: User / System"). Each is disambiguated as **one contract-ID with actor-branched authorization** (a single 12-section Pass-B record per Doc-4A §21, with actor-specific authorization branches) — Board resolution option (a). No entry is split; **no new contract-ID is created and A12 counts are unchanged.**
- **F4I-PA-M2** — `billing.expire_subscription.v1` carried the audit binding "§9 ('subscription renewal') by pointer," a misidentification (expiry `active → expired` ≠ renewal `active → active`; Doc-2 §9 Financial enumerates "subscription purchase/renewal/cancel," not expiry). Corrected to **`[ESC-BILL-AUDIT]`** (nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented); renewal's own §9 binding is preserved and the A8 subscription row is split accordingly.

**Impact:** Ownership = NONE · BC = NONE · Aggregate = NONE · Event Ownership = NONE · Procurement Moat = NONE · Trust Firewall = NONE · A12 counts = UNCHANGED (all six dual-template entries resolve to one contract each).

---

## 2. Applied Findings

| Finding | Severity | Resolution | Location |
|---|---|---|---|
| F4I-PA-M1 | MINOR | Six dual-template entries → "one contract-ID; actor-branched (Doc-4A §21 — single 12-section Pass-B record with actor-specific authorization branches)" | A4.4, A4.5, A4.6 |
| F4I-PA-M2 | MINOR | `expire_subscription.v1` audit → `[ESC-BILL-AUDIT]` (expiry not §9-enumerated); A8 subscription row split (renew = §9 Financial; expire = `[ESC-BILL-AUDIT]`) | A4.2, A8 |

---

## 3. Exact Before/After Changes

### F4I-PA-M1 — dual-template disambiguation (6 entries; "one contract-ID, actor-branched")

**Change M1-a — A4.4 `credit_lead_account.v1` · `debit_lead_account.v1` (record header)**

*Before*
```
#### `billing.credit_lead_account.v1` · `billing.debit_lead_account.v1` — Lead-Credit Movement · 21.4 Command / 21.5 System · Actor: User / System
```
*After*
```
#### `billing.credit_lead_account.v1` · `billing.debit_lead_account.v1` — Lead-Credit Movement · 21.4 Command / 21.5 System · Actor: User / System
```
> **Disambiguation (F4I-PA-M1):** each of `billing.credit_lead_account.v1` and `billing.debit_lead_account.v1` is **one contract-ID with actor-branched authorization** — a single 12-section Pass-B record per Doc-4A §21, with actor-specific authorization branches (org-initiated `21.4 Command` under `can_manage_billing`; System effect `21.5 System` with no slug). **Not split into separate contract-IDs; A12 Part-4 count unchanged.**

**Change M1-b — A4.5 `issue_platform_invoice.v1` (record header)**

*Before*
```
#### `billing.issue_platform_invoice.v1` — Issue Platform Invoice · 21.4 Command · Actor: User / System
```
*After*
```
#### `billing.issue_platform_invoice.v1` — Issue Platform Invoice · 21.4 Command · Actor: User / System
```
> **Disambiguation (F4I-PA-M1):** `billing.issue_platform_invoice.v1` is **one contract-ID with actor-branched authorization** — a single 12-section Pass-B record per Doc-4A §21 (org self-serve `can_manage_billing` branch; System subscription/ad/microsite-driven branch). **Not split; A12 Part-5 count unchanged.**

**Change M1-c — A4.5 `update_invoice_status.v1` (record header)**

*Before*
```
#### `billing.update_invoice_status.v1` — Update Invoice Status · 21.4 Command / 21.5 System · Actor: User / System
```
*After*
```
#### `billing.update_invoice_status.v1` — Update Invoice Status · 21.4 Command / 21.5 System · Actor: User / System
```
> **Disambiguation (F4I-PA-M1):** `billing.update_invoice_status.v1` is **one contract-ID with actor-branched authorization** — a single 12-section Pass-B record per Doc-4A §21 (org `can_manage_billing` void branch; System paid/overdue branch). **Not split; A12 Part-5 count unchanged.**

**Change M1-d — A4.6 `credit_reward.v1` (record header)**

*Before*
```
#### `billing.credit_reward.v1` — Credit Reward Points · 21.4 Command / 21.5 System · Actor: User / System
```
*After*
```
#### `billing.credit_reward.v1` — Credit Reward Points · 21.4 Command / 21.5 System · Actor: User / System
```
> **Disambiguation (F4I-PA-M1):** `billing.credit_reward.v1` is **one contract-ID with actor-branched authorization** — a single 12-section Pass-B record per Doc-4A §21 (System milestone-driven branch; org redemption `can_manage_billing`/`[ESC-BILL-SLUG]` branch). **Not split; A12 Part-6 count unchanged.**

**Change M1-e — A4.6 `track_referral.v1` · `advance_referral.v1` (record header)**

*Before*
```
#### `billing.track_referral.v1` · `billing.advance_referral.v1` — Referral Tracking · 21.4 Command / 21.5 System · Actor: User / System
```
*After*
```
#### `billing.track_referral.v1` · `billing.advance_referral.v1` — Referral Tracking · 21.4 Command / 21.5 System · Actor: User / System
```
> **Disambiguation (F4I-PA-M1):** each of `billing.track_referral.v1` and `billing.advance_referral.v1` is **one contract-ID with actor-branched authorization** — a single 12-section Pass-B record per Doc-4A §21 (org self `can_manage_billing` branch; System qualification/reward-milestone branch). **Not split; A12 Part-6 count unchanged.**

*(The six affected contract-IDs are `credit_lead_account`, `debit_lead_account`, `issue_platform_invoice`, `update_invoice_status`, `credit_reward`, `track_referral` — the accepted F4I-PA-M1 set. The header lines are unchanged in text; the disambiguation note is appended to each record to fix the documentation ambiguity without altering the design or the authorization values.)*

---

### F4I-PA-M2 — `expire_subscription.v1` audit binding correction

**Change M2-a — A4.2 `renew_subscription.v1` · `expire_subscription.v1` record (Audit field only)**

*Before*
```
**Audit:** §9 ("subscription renewal") by pointer.
```
*After*
```
**Audit:** renew → §9 Financial ("subscription renewal") by pointer; **expire → `[ESC-BILL-AUDIT]`** (subscription expiry is **not** separately enumerated in Doc-2 §9 Financial — "subscription purchase/renewal/cancel" enumerated; expiry is not — nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented).
```

**Change M2-b — A8 Audit Dependency Inventory (subscription row split)**

*Before*
```
| Subscription purchase/cancel/renew/expire (BC-BILL-2) | §9 **Financial** / **Organization** (by pointer) | Billing | yes (every mutation) |
```
*After*
```
| Subscription purchase/cancel/renew (BC-BILL-2) | §9 **Financial** / **Organization** (by pointer) | Billing | yes (every mutation) |
| Subscription expire (BC-BILL-2) | **`[ESC-BILL-AUDIT]`** (expiry not enumerated in Doc-2 §9 Financial; nearest §9 action by pointer; §9 additive) | Billing | yes |
```

---

## 4. Patch Completeness Verification

| Check | Result |
|---|---|
| F4I-PA-M1 — all six accepted entries disambiguated | ✓ (`credit_lead_account`, `debit_lead_account`, `issue_platform_invoice`, `update_invoice_status`, `credit_reward`, `track_referral` — each "one contract-ID, actor-branched") |
| F4I-PA-M1 — resolution is Board option (a); no split, no new contract-ID | ✓ (zero new IDs; A12 Part-4/5/6 counts unchanged) |
| F4I-PA-M2 — A4.2 `expire_subscription` audit corrected to `[ESC-BILL-AUDIT]` | ✓ (renewal binding preserved for renew; expiry no longer mapped to "subscription renewal") |
| F4I-PA-M2 — A8 subscription row split consistently | ✓ (renew = §9 Financial; expire = `[ESC-BILL-AUDIT]`) |
| No audit action invented | ✓ (`[ESC-BILL-AUDIT]` is the carried Doc-2 §9-additive marker; nearest action by pointer) |
| No ownership / BC / aggregate / event-ownership change | ✓ (NONE) |
| No new BC introduced | ✓ |
| Procurement moat / trust firewall preserved | ✓ (untouched) |
| Sections edited = A4.2, A4.4, A4.5, A4.6, A8 only | ✓ (no unrelated edit, no formatting cleanup, no wording modernization, no scope expansion) |
| `billing.advance_referral.v1` (paired with `track_referral` on the same header line) — clarified in the same note | ✓ (disambiguated identically; it was already a single contract-ID — note confirms it) |

```text
Findings applied        = 2 (F4I-PA-M1, F4I-PA-M2)
New contract-IDs         = 0
A12 count change          = 0
Ownership/BC/Aggregate/Event-Ownership/Moat/Firewall impact = NONE
Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0   (post-patch, pending Patch Verification)
```

---

*End of Doc-4I_PassA_Patch_v1.0. Pass-A patch only — applies F4I-PA-M1 (six dual-template entries → one contract-ID, actor-branched; no split, no new ID) and F4I-PA-M2 (`expire_subscription.v1` audit → `[ESC-BILL-AUDIT]`; A8 subscription row split). Minimal, clarification/correction only; sections A4.2/A4.4/A4.5/A4.6/A8 only. No redesign, no new BC, no ownership invented, no audit action invented; frozen governance (ownership, moat, firewall, produced events, DF/ESC markers, A12 counts) preserved. Authorized next stage: Patch Verification → Pass-A FROZEN → Pass-B.*
