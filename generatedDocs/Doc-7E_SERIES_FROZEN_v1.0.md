# Doc-7E — Account & Identity Shell — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26) — structure + content + Appendix. Independent Hard Reviews + Structure Freeze Audit + Content Freeze Audit all PASS (0 open BLOCKER/MAJOR/MINOR) |
| Document | **Doc-7E** — the Account & Identity Shell |
| Program | **Doc-7 — Frontend Realization** |
| Realizes | frozen **Doc-5C** User management (§C4–§C7/§C9/§C10/§C11) + **Doc-5I** account-facing User (BC-BILL-1…6, minus Admin `activate_plan`), on Doc-7C `(auth)`+`(app)`, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (ER10) |
| Coins | **Nothing** — `[ESC-7-API-SIGNUP]` resolved (no frontend `create_user`); `[ESC-IDN-DELEG-EXPIRY]` carried |

---

## Effective set (read these)

| Layer | Artifact(s) |
|---|---|
| Structure | `Doc-7E_Structure_v1.0_FROZEN` (= Proposal v0.1 + Patch v0.1.1) |
| Content §0–§4 | `Doc-7E_Content_v1.0_Pass1` + `Doc-7E_Content_Pass1_Patch_v1.0.1` |
| Content §5–§9 + Appendix | `Doc-7E_Content_v1.0_Pass2` + `Doc-7E_Content_Pass2_Patch_v1.0.1` |
| Freeze gates | `Doc-7E_Structure_Freeze_Audit_v1.0` · `Doc-7E_Content_Freeze_Audit_v1.0` |
| Provenance | `Doc-7E_Structure_Independent_Hard_Review_v0.1` · `Doc-7E_Content_Pass{1,2}_Independent_Hard_Review_v1.0` |

---

## What Doc-7E fixes (summary — authoritative text is the effective set)

**Two areas (ER1):** `(auth)` (login/signup/recovery — Supabase Auth; **signup creates no user record / coins no `create_user`** — M1 materialization out of Doc-7E scope) + `(app)` (management screens + account/billing).

**Seam (ER5):** owns the **management screens**; **§C8 org-switcher = Doc-7C** (not realized here).

**Identity management (ER3, Doc-5C):** user profile (§C4) · organization (§C5; **soft-delete only**, DC-1 cross-module cascade is System/out-of-wire) · membership (§C6) · roles (§C7) · settings (§C10/§C11). Invitation flow spans `(auth)`→`(app)`.

**Delegation (ER4, §C9, R5):** grant management (create/suspend/revoke + dual-party reads); the **delegated-access check is server-side inside `check_permission` (out-of-wire)** — never client-side; **`reinstate_delegation_grant` deferred/pending** (`[ESC-IDN-DELEG-EXPIRY]`, Doc-2 §5.10).

**Account & billing (ER6, Doc-5I; R6/R10/R11):** plan catalog (shared read) · subscription (**`purchase_subscription`/`cancel_subscription`** + own-org reads — **`activate_plan` is Admin/Doc-7H, NOT here**) · usage · lead credits (buy-flow + reads) · **platform-fee invoices only** (read; ≠ trade invoices) · rewards. The **billing indicator** reads entitlement state via wired reads, **never** `resolve_entitlements` (out-of-wire).

**State-machine UI (ER7, Doc-4M):** subscription `purchase→active→(renew|expire|cancel)` — user edges `purchase`/`cancel`; `renew`/`expire` System (display); membership/delegation/org per Doc-4M.

**Authz/non-disclosure (ER8/ER9):** org-scoped (user acts, org owns); UI gating = UX over server enforcement; **plan catalog shared, subscription/usage/invoice/lead/reward own-org** (cross-org → `NOT_FOUND`). Data via the Doc-7C server-side wired client; currency-per-field default BDT on money fields.

**Conformance (ER10):** APPLIES `CHK-7-001/002/003/004/005/010(app)/011(app)/020/021/030/031/040/041/042/060–063/070/071/080/081`; **N/A** `CHK-7-012` (not a participation workspace/Admin), `CHK-7-050/051` (no AI).

---

## Carried into Doc-7F…7H

`DR-7-SHELL` · `DR-7-API` · `DR-7-STATE` · **`[ESC-IDN-DELEG-EXPIRY]`** (reinstate UI deferred — Doc-2 §5.10) · `[ESC-7-API]` · `[ESC-7-POLICY]` · `[ESC-7-DESIGN]`. **Flag for Doc-7H:** `activate_plan` (BC-BILL-1 Admin catalog `draft→active`). Resolved only via named channels.

**Next deliverable:** **Doc-7F — Buyer Workspace** (the moat surface) — discovery → RFQ authoring → routing/invitations → quotation comparison → award → post-award operations → buyer-private CRM (realizes `Doc-5E` buyer-leg + `Doc-5F` buyer ops + `Doc-5D` discovery), through the Board loop.

*End of Doc-7E SERIES FROZEN v1.0. Effective set above is authoritative; this manifest only points. Doc-7E realizes the Account & Identity shell over the frozen Doc-5C/5I surfaces; management screens (not the switcher); platform-fee invoices only; `activate_plan` correctly excluded (Admin/Doc-7H); coins nothing.*
