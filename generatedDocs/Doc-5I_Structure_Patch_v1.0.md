# Doc-5I — Monetization / Billing (M7 `billing`) — Structure Patch v1.0

| Field | Value |
|---|---|
| Document | Doc-5I Structure Patch v1.0 |
| Patches | `Doc-5I_Structure_Proposal_v0.1.md` → effective **v0.2** |
| Based On | `Doc-5I_Structure_Independent_Hard_Review_v1.0.md` |
| Findings resolved | **M-01 · M-02 · m-01 · m-02 · m-03 · NP-01 · NP-02 · NP-03** |
| Findings deferred | None |
| Result | 0 open BLOCKER · 0 open MAJOR · 0 open MINOR · 0 open NITPICK |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` |

---

## Changes Applied

### M-01 — §3 plans machine authority + Controlling Organization added

**Problem:** §3 declared only the subscription machine (Doc-2 §5.7); plans machine (`draft → active → retired`; Doc-2 §3.8) absent, leaving `retire_plan` in §4 without a §3 anchor. Controlling Organization concept (DF-BILL-1) absent from §3.

**Changes to `Doc-5I_Structure_Proposal_v0.1.md`:**
- §3 Purpose: added plans state machine authority declaration (`draft → active → retired`; `Doc-2 §3.8`; Doc-4M = index; R7).
- §3 Purpose: added Controlling Organization declaration (DF-BILL-1; `Doc-4C §C8`; `Doc-4I §H.3`; anchors all billing ownership fields).
- §3 Dependencies: added `Doc-2 §3.8/§5.7/§10.8`.

---

### M-02 — R7 subscription machine edge attribution corrected

**Problem:** R7 stated "purchase → `pending_payment → active`" implying `purchase_subscription` drives both edges. Correct attribution: `purchase_subscription` → creates at `pending_payment`; `record_payment` gateway callback (R8/§10) → `pending_payment → active`.

**Changes:**
- R7 rewritten with per-contract edge attribution for all 5 subscription contracts (`purchase_subscription`, `record_payment`, `renew_subscription`, `cancel_subscription`, `expire_subscription`).
- R7 explicitly states `record_payment` (§10/R8) drives `pending_payment → active`.

---

### m-01 — Partition table: enforce_quota + resolve_entitlements annotated

**Problem:** Both rows showed "21.3 Query / User/System" without distinguishing them from the caller-facing `get_usage` (also 21.3/User). Readers could question why User/System Queries are out-of-wire.

**Changes:**
- Partition table: added "**internal-service authority; R10 — no HTTP caller wire**" to both `billing.enforce_quota.v1` and `billing.resolve_entitlements.v1` Nature cells.

---

### m-02 — DF-BILL-5 restated as boundary-guard dependency

**Problem:** DF-BILL-5 described the fence rule ("≠"), not the actual cross-module boundary dependency (what M7 must not do re: M4 tables).

**Changes:**
- DF-BILL-5 Item restated: "boundary guard — `billing.platform_invoices` (M7-owned) and `operations.trade_invoices` (M4-owned) are disjoint aggregates; M7 realizes no trade-invoice surface, accesses no M4 tables".

---

### m-03 + NP-01 — §5 event attribution corrected; R9 per-contract attribution added

**Problem (m-03):** §5 lumped all 3 events (SubscriptionPurchased/Renewed/Expired) into §5. Only `SubscriptionPurchased` is a §5 caller-facing emission; the other two are §10 System jobs.

**Problem (NP-01):** R9 said "BC-BILL-2 producer" without per-contract attribution.

**Changes:**
- §5 Purpose: per-contract event attribution — `purchase_subscription` → `SubscriptionPurchased`; `cancel_subscription` → no event; Renewed/Expired → §10 System jobs.
- R9: per-contract attribution added for all 3 events (purchase, renew, expire).

---

### NP-02 — §9 referral machine cites Doc-2 §10.8

**Problem:** §9 cited only `Doc-4I §HB-6.2` for referral machine edges; missing the Doc-2 source per cross-module state-map authority pattern.

**Changes:**
- §9 Purpose: referral machine citation updated to "edges `Doc-2 §10.8` / `Doc-4I §HB-6.2`; `Doc-4M` = index".

---

### NP-03 — Controlling Organization folded into M-01

NP-03 (Controlling Organization anchor in §3) resolved as part of the M-01 patch above.

---

*End of Doc-5I Structure Patch v1.0. All 8 findings resolved; proposal effective v0.2. Ready for Structure Freeze Audit.*
