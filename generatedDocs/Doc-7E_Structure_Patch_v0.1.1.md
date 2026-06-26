# Doc-7E — Structure **Patch v0.1.1** (applies Independent Hard Review v0.1) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7E_Structure_Proposal_v0.1.md` |
| Applies | `Doc-7E_Structure_Independent_Hard_Review_v0.1.md` (3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Proposal v0.1 **+ this patch** = freeze-ready structure |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Structure Freeze Audit → `Doc-7E_Structure_v1.0_FROZEN` |
| Discipline | Additive; nothing coined; no frozen document edited |

---

## Changes

### C-1 — closes **MINOR-1** (ER6 user-action vs System-issued)
ER6 amended to split by actor leg (`Doc-5I R11` actor-branching):
- **User-initiated commands** the shell invokes: `purchase_subscription`, `cancel_subscription`, `activate_plan` (BC-BILL-2); `credit_lead_account` = **buy** lead credits (BC-BILL-4 User leg).
- **System-issued records** the shell **reads only**: platform invoices (`get_platform_invoice`/`list_platform_invoices`; `issue_platform_invoice`/`update_invoice_status` are System-issued in normal flow — the user reads), `debit_lead_account` (System lead-consumption — read via `list_lead_transactions`).
- Each BC-BILL-4/5 User-vs-System leg is **confirmed at content**; the shell binds user-action commands and read-only the System-issued records. No issuance assumed as a user action.

### C-2 — closes **MINOR-2** (signup user-creation)
ER2 amended: signup's **user-record creation** binds a **frozen Doc-5C user-creation command if one exists**, else **`[ESC-7-API-SIGNUP]`** — the user record may be provisioned via **Supabase Auth + an M1 provisioning path** (confirm at content); **no `create_user` is assumed or coined**. **Org creation** binds the verified `create_organization` (§C5); `accept_invitation` (§C6) handles join. `[ESC-7-API-SIGNUP]` added to carried items.

### C-3 — closes **MINOR-3** (CHK-7-012 N/A)
ER10 reclassified: **`CHK-7-012` N/A** — the account shell is neither a Buyer/Vendor participation-mounted workspace nor Admin (Hybrid surface-mounting is Doc-7C's/the workspaces'). `CHK-7-010/011` **APPLY in `(app)`** (active-org management is org-scoped), **N/A in `(auth)`** (unauthenticated).

### C-4 — closes **NITPICK-1** (plan catalog shared)
ER9 amended: **plan catalog reads (`get_plan`/`list_plans`, BC-BILL-1) are shared** (every user browses plans — not own-org-restricted); **subscription/usage/invoice/lead/reward reads are own-org** (cross-org/protected → `NOT_FOUND`, `Doc-5A §6.3`).

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MINOR-1 user-action vs System-issued | MINOR | C-1: split commands (invoke) / records (read); confirm legs at content | **CLOSED** |
| MINOR-2 signup user-creation | MINOR | C-2: bind frozen create or `[ESC-7-API-SIGNUP]`; no create_user assumed | **CLOSED** |
| MINOR-3 CHK-7-012 N/A | MINOR | C-3: reclassified; 010/011 (app)-only | **CLOSED** |
| NITPICK-1 plan catalog shared | NIT | C-4: catalog shared vs own-org reads | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** No new finding; no anchor regressed; nothing coined. Actor-leg bindings now respect `Doc-5I R11`; signup user-creation is bind-or-ESC; conformance subset corrected.

**Next:** Structure Freeze Audit → `Doc-7E_Structure_v1.0_FROZEN` → Doc-7E content passes, through the same loop.

*End of Doc-7E Structure Patch v0.1.1 + Short Closure Check. Effective structure = Proposal v0.1 + this patch. Additive; nothing coined; no frozen document edited.*
