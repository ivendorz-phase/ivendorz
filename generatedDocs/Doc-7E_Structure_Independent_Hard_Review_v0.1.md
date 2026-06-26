# Doc-7E — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7E_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Doc-5C/5I actor-leg conformance |
| Verdict | **NOT YET FREEZE-READY** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Structure Patch → short closure check → Structure Freeze Audit |

---

## Anchors verified CORRECT

- **Doc-5C management surface** §C4–§C7/§C9/§C10/§C11 (User commands/queries) — verified vs `Doc-5C_Structure_v1.0_FROZEN` lines 36–43. CORRECT.
- **§C8 = Doc-7C's** (org-switcher/context) — ER5 seam correctly excludes it. CORRECT (no double-ownership).
- **Doc-5I account-facing** BC-BILL-1…6 (User reads/commands) — verified lines 60–70. CORRECT.
- **R6 platform-invoice ≠ trade-invoice** firewall; **R10** entitlement out-of-wire; **R5** delegated-access check server-side — all correctly applied (ER6/ER4).
- **`[ESC-IDN-DELEG-EXPIRY]`** (reinstate not finalized) correctly carried from Doc-5C. CORRECT.

0 BLOCKER, 0 MAJOR. Three actor-leg/scope-precision refinements + one nit.

### MINOR-1 — ER6 conflates user-initiated commands with System-issued records
ER6 binds `issue_platform_invoice`/`update_invoice_status` (BC-BILL-5) and `credit_lead_account`/`debit_lead_account` (BC-BILL-4) as "User leg." But these are **User/System actor-branched (R11)** — a **platform invoice is typically System-issued** (the platform bills the org; the user **reads** it), and **`debit_lead_account` is System** (a lead consumed), while the user-initiated leg is **buying** credits.
**Required fix:** ER6 distinguish — **user-initiated commands** (`purchase_subscription`, `cancel_subscription`, `activate_plan`, `credit_lead_account` = buy credits) the account shell **invokes**; **System-issued records** (platform invoices, `debit_lead_account`) the shell **reads** (`get_/list_*`). Confirm each BC-BILL-4/5 User leg at content; bind the user-action commands, read-only the System-issued — don't assume the user issues invoices.

### MINOR-2 — ER2 signup user-record creation is not bound (no verified `create_user`)
ER2 says "account-creation effects bind the relevant frozen Doc-5C command (bind-or-ESC)" but no **user-creation** command is verified in the Doc-5C surface (§C4 has `update_user_profile`, not a create). Signup creates a user record.
**Required fix:** ER2 state explicitly — signup's **user-record creation** must bind a **frozen Doc-5C user-creation command** if one exists, else **`[ESC-7-API]`** (the record may be created via Supabase Auth + an M1 provisioning path — confirm at content; never assume/coin a `create_user`). Org creation binds the verified `create_organization` (§C5).

### MINOR-3 — ER10 marks `CHK-7-012` APPLIES; it is N/A for the account shell
`CHK-7-012` = "Hybrid mounts Buyer+Vendor; Admin no active-org." The account shell is **neither** a Buyer/Vendor workspace **nor** Admin — Hybrid surface-mounting is Doc-7C's/the workspaces' concern.
**Required fix:** ER10 reclassify `CHK-7-012` **N/A** (account shell is not a participation-mounted workspace); `CHK-7-010/011` apply in `(app)` (active-org management is org-scoped), N/A in `(auth)`.

### NITPICK-1 — ER9 over-generalizes "own-org reads only"; plan catalog is shared
ER9 says "own-org reads only," but **`get_plan`/`list_plans` (BC-BILL-1) is a User/Admin catalog read** — the **plan catalog is shared** (every user browses plans to choose), not own-org-restricted. Subscription/usage/invoice/lead/reward **are** own-org.
**Required fix:** ER9 distinguish — **plan catalog reads are shared** (not own-org); **subscription/usage/invoice/lead/reward reads are own-org** (cross-org → `NOT_FOUND`).

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 ER6 user-action vs System-issued | MINOR | Structure Patch — split commands/reads |
| MINOR-2 ER2 signup user-creation bind-or-ESC | MINOR | Structure Patch — bind or `[ESC-7-API]` |
| MINOR-3 ER10 CHK-7-012 N/A | MINOR | Structure Patch — reclassify |
| NITPICK-1 ER9 plan catalog shared | NIT | Structure Patch — distinguish |

**Gate:** freeze only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Structure Patch required**, then short closure check, then Structure Freeze Audit.

*End of Doc-7E Structure Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — surface scope sound; three actor-leg/scope-precision defects (invoice issuance, signup user-creation, Hybrid check) caught against Doc-5C/5I actor branching.*
