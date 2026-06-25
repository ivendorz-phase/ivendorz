# Doc-5I — Structure Additive Patch v1.0 (Board Gates 1 & 2)

| Field | Value |
|---|---|
| Patch | Doc-5I Structure Additive Patch v1.0 |
| Type | **Additive** — layers on `Doc-5I_Structure_v1.0_FROZEN.md`; the frozen structure is **not edited in place** |
| Disposition | Board dispositions in `Doc-5I_ESC_Board_Escalation_v1.0.md`: **Gate 1 → Option A**, **Gate 2 → Option A** (human-approved) |
| Depends on | `Doc-4I_ActivatePlan_Additive_Patch_v1.0.md` (the new `billing.activate_plan.v1` contract) |
| Conforms to | Frozen `Doc-4I` (+ ActivatePlan patch), `Doc-5A_SERIES_FROZEN_v1.0`, authority order |

---

## Patch 1 — Gate 1: re-scope the §3 "Admin reads any org" grant to catalog reads only

**Board Gate 1 → Option A:** *"Re-scope the structure wording to catalog reads only. Preserves Doc-4I actor authority and tenant isolation without reopening frozen contracts."*

- **§3 per-read disclosure-scope rule — superseded clause.** The frozen structure §3 sentence granting Admin a cross-org read on **all** reads is **re-scoped**: the **Admin read actor applies ONLY to the platform-owned catalog reads** `billing.get_plan.v1` / `billing.list_plans.v1` (`Doc-4I §HB-1.4` Actor = User/Admin).
- The **nine org-scoped reads** — `get_subscription`, `list_subscription_events` (§HB-2.5), `get_usage` (§HB-3.3), `get_lead_balance`, `list_lead_transactions` (§HB-4.2), `get_platform_invoice`, `list_platform_invoices` (§HB-5.4), `get_reward_balance`, `list_referrals` (§HB-6.3) — are **User-only** per frozen Doc-4I; **no Admin read actor**. Cross-org → `404 NOT_FOUND` (non-disclosure).
- Rationale: frozen Doc-4I (rank 0) outranks the Doc-5I structure; this patch aligns the structure wording to Doc-4I and preserves tenant isolation (`Doc-4A §9.7` — no `org_id` tenant-selection; Invariant #5). **No Doc-4I contract reopened.**
- **`[ESC-BILL-ADMINSCOPE]` → RESOLVED** (structure wording corrected; no admin singleton-read mechanism is introduced; Doc-5I content already realizes User-only).

## Patch 2 — Gate 2: add `billing.activate_plan.v1` to the partition

**Board Gate 2 → Option A:** additive `activate_plan` contract (see `Doc-4I_ActivatePlan_Additive_Patch_v1.0.md`).

- **Surface partition — additive row (BC-BILL-1, §4):** `billing.activate_plan.v1` — Admin command (21.6; plans `draft → active`, R7) — **§4 `POST`**. Caller-facing.
- **Count reconciliation — superseded totals:**

| § | BC | Caller-facing | Out-of-wire | Total |
|---|---|---|---|---|
| §4 | BC-BILL-1 | **9** (was 8) | 0 | **9** |
| §5 | BC-BILL-2 | 4 | 3 | 7 |
| §6 | BC-BILL-3 | 1 | 2 | 3 |
| §7 | BC-BILL-4 | 4 | 0 | 4 |
| §8 | BC-BILL-5 | 4 | 1 | 5 |
| §9 | BC-BILL-6 | 5 | 0 | 5 |
| **Total** | | **27** (was 26) | **6** | **33** (was 32) |

- **R7 plans machine (structure §3 / decisions) — clarified realization:** `create_plan → draft`; **`activate_plan → active` (new owner)**; `retire_plan → retired`. `update_plan` = marketing-config mutation (no status edge); `is_active` = marketing-visibility bool (≠ `status`).
- **`[ESC-BILL-ACTIVATE]` → RESOLVED** (explicit owning contract added via the Doc-4I additive patch).

---

## Net effect on Doc-5I

- Realized caller-facing surface: **27** (was 26). Out-of-wire: **6**. Total: **33** (was 32).
- Both content-freeze gates **RESOLVED**; no remaining `[ESC-BILL-ADMINSCOPE]` / `[ESC-BILL-ACTIVATE]` open.
- Doc-5I content (Pass-1 §2 inventory + §3.4 + §3.6; Pass-2 §4; Pass-3 §11 closure) updated additively to match (this patch is the structure authority for those content edits).

---

*Additive structure patch, human-approved (Board Gates 1 & 2 → Option A). Frozen `Doc-5I_Structure_v1.0_FROZEN.md` not edited in place; this patch is read alongside it. Fold into the corpus index under architecture governance.*
