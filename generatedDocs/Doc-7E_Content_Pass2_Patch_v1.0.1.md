# Doc-7E — Content Pass-2 **Patch v1.0.1** (applies Pass-2 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7E_Content_v1.0_Pass2.md` (§5–§9 + Appendix) |
| Applies | `Doc-7E_Content_Pass2_Independent_Hard_Review_v1.0.md` (1 MAJOR + 2 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-2 **+ this patch** = clean §5–§9 + Appendix |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Freeze Audit → Doc-7E FROZEN |
| Discipline | Additive; nothing coined; actor/ownership corrected against the frozen surface |

---

## Changes

### C-1 — closes **MAJOR-1** (`activate_plan` misbound → removed; belongs to Doc-7H)
**Verified:** `activate_plan` realizes the **plan `draft→active`** edge (`Doc-4I ActivatePlan` additive; `Doc-2 §3.8`); plans are **BC-BILL-1 Admin catalog governance** (`Doc-5I` line 60). §5.1 + Appendix amended:
> **`activate_plan` is REMOVED from Doc-7E.** The account shell's **Subscription** view binds **`purchase_subscription` / `cancel_subscription`** (BC-BILL-2 **User**) + own-org reads (`get_subscription`/`list_subscription_events`) **only**. **`activate_plan` (plan catalog `draft→active`) is realized in Doc-7H (Admin console)**, with `create_plan`/`update_plan`/`retire_plan` (BC-BILL-1 Admin). The user **purchases a subscription**; the user **never activates a plan**.

### C-2 — closes **MINOR-1** (`credit_lead_account` actor leg)
§5.1 lead-credits row amended:
> Lead-credit **purchase** is a user-initiated buy that may be realized as a **purchase flow → System `credit_lead_account`** (BC-BILL-4 actor-branched); the UI binds the **user-facing buy action** and **reads** `get_lead_balance`/`list_lead_transactions`. `credit_lead_account` is bound **as a direct user command only if its BC-BILL-4 User leg is caller-facing**; `debit_lead_account` is **System** (read via `list_lead_transactions`). Confirmed at content; no System action assumed as user-initiated.

### C-3 — closes **MINOR-2** (subscription Doc-4M transition set)
§6.1 amended: the subscription UI offers **only the Doc-4M-permitted, User-actor transitions** — **`purchase_subscription`** and **`cancel_subscription`** (BC-BILL-2 User) — bound to the **Doc-4M subscription machine** by pointer; **`renew_subscription`/`expire_subscription` are System** (`Doc-5I` §10 out-of-wire), **displayed not invoked**. The `cancel` edge is confirmed against Doc-4M at content; no edge invented.

### C-4 — closes **NITPICK-1** (activate_plan → Doc-7H note)
§9.2 cross-reference added: `activate_plan` (plan catalog `draft→active`) is **Doc-7H's** binding (Admin console), **not carried by Doc-7E** — Doc-7H picks it up with the BC-BILL-1 Admin catalog commands.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 activate_plan misbound | MAJOR | C-1: removed from Doc-7E; → Doc-7H Admin; subscription = purchase/cancel only | **CLOSED** — wrong-actor binding eliminated |
| MINOR-1 credit_lead_account leg | MINOR | C-2: buy-flow + read; direct command only if User leg caller-facing | **CLOSED** |
| MINOR-2 subscription Doc-4M edges | MINOR | C-3: purchase/cancel user edges bound to Doc-4M; renew/expire System-display | **CLOSED** |
| NITPICK-1 activate_plan → Doc-7H | NIT | C-4 | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** The wrong-actor misbinding is eliminated (`activate_plan` is Admin/Doc-7H); subscription is purchase/cancel-only bound to Doc-4M; actor legs respect `Doc-5I R11`. Nothing coined.

**Doc-7E content (§0–§9 + Appendix) is now complete across Pass-1/2, both loops PASS.** Next: **Content Freeze Audit** → consolidate Doc-7E FROZEN.

*End of Content Pass-2 Patch v1.0.1 + Short Closure Check. Effective §5–§9 + Appendix = Pass-2 + this patch. Additive; nothing coined; actor/ownership corrected.*
