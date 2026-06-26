# Doc-7E — Account & Identity Shell — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **STRUCTURE FROZEN v1.0** (2026-06-26). Effective = `Doc-7E_Structure_Proposal_v0.1` + `Doc-7E_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-7 — Frontend Realization**; Doc-7E = the **Account & Identity Shell** |
| Realizes | frozen **Doc-5C** User management surface (§C4–§C7/§C9/§C10/§C11) + frozen **Doc-5I** account-facing User surface (BC-BILL-1…6), on the Doc-7C `(auth)` + `(app)` route groups, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (ER10) |
| Coins | **Nothing** — binds frozen Doc-5C/Doc-5I by pointer; carries `[ESC-IDN-DELEG-EXPIRY]` + `[ESC-7-API-SIGNUP]` |

**Governing rule:** Doc-7E is the user's account & identity home (+ unauthenticated auth-entry). It owns the **management screens** — **not** the active-org context/switcher (Doc-7C seam) — shows **platform-fee invoices only**, never performs a delegated-access resolution client-side, and binds only frozen Doc-5C/5I contracts. Coins nothing.

---

## Ratified decisions (ER1–ER11)
*(`ERn` = Doc-7E realization decisions — distinct from `DR-7-*`.)*

- **ER1 — Scope: two areas.** `(auth)` unauthenticated (login/signup/recovery) + `(app)` authenticated (identity/membership/role/delegation **management** + account/subscription/invoice views). Owns the management screens; **not** the switcher (ER5). Consumes 7B kit + 7C client by reference.
- **ER2 — Auth-entry (`(auth)`; Supabase Auth).** Login/signup/recovery via the Supabase Auth boundary (authentication only — `Doc-7C §3`); no active-org. `accept_invitation` (§C6) = join flow. **Signup user-record creation binds a frozen Doc-5C user-creation command if one exists, else `[ESC-7-API-SIGNUP]`** (may be Supabase Auth + M1 provisioning — confirm at content; no `create_user` assumed). **Org creation** = `create_organization` (§C5).
- **ER3 — Identity management (authenticated; `Doc-5C` User).** user profile (`update_user_profile`/`update_user_2fa_settings`/`deactivate_own_account` §C4); org (`create_organization`/`update_organization_profile`/`transfer_ownership`/`soft_delete_organization`/`restore_organization` §C5); membership (`invite_member`/`accept_invitation`/`set_membership_status`/`remove_member`/`revoke_invitation` §C6); roles (`create_role`/`update_role`/`set_role_permissions`/`delete_role`·`list_roles`/`list_permissions` §C7); settings (`upsert_buyer_profile` §C10, `update_workflow_settings` §C11).
- **ER4 — Delegation management (`Doc-5C §C9`; R5; carried ESC).** grant commands (`create_/suspend_/reinstate_/revoke_delegation_grant`) + dual-party reads (`get_/list_delegation_grants`). **The delegated-access *check* is server-side inside `check_permission` (out-of-wire — R5/§6B); 7E manages grants, never resolves access.** **`[ESC-IDN-DELEG-EXPIRY]`:** `reinstate_delegation_grant` not finalized (Doc-2 §5.10 open) → **reinstate UI deferred/marked pending**, not final. No edge invented.
- **ER5 — Active-org seam — 7E does NOT own the switcher.** Doc-7E **does not realize `Doc-5C §C8`** (`switch_active_organization`/`get_active_context`/`list_my_organizations`) — that is **Doc-7C's** mechanism. No §C8 contract realized here.
- **ER6 — Account & billing views (`Doc-5I`; R6 firewall; R11 actor legs).** **User-initiated commands** (shell invokes): `purchase_subscription`/`cancel_subscription`/`activate_plan` (BC-BILL-2); `credit_lead_account` = buy credits (BC-BILL-4). **System-issued records** (shell reads): platform invoices (`get_/list_platform_invoices`; issuance System in normal flow), `debit_lead_account` (System; via `list_lead_transactions`). **Shared reads:** plan catalog (`get_plan`/`list_plans` BC-BILL-1). **Own-org reads:** `get_subscription`/`list_subscription_events`, `get_usage`, `get_lead_balance`/`list_lead_transactions`, `get_platform_invoice`/`list_platform_invoices`, `get_reward_balance`/`list_referrals`. **Platform-fee invoices ONLY — never trade invoices / escrow / wallet / settlement** (R6; trade invoices = M4). The Doc-7B **billing indicator** reads entitlement state via these wired reads, **never** out-of-wire `resolve_entitlements`/`enforce_quota` (R10; `Doc-7A §3.7`). Actor legs confirmed at content.
- **ER7 — State-machine UI (Doc-4M; `Doc-5I R7`).** Subscription lifecycle (purchase→active→renew/expire/cancel) + membership/delegation/org machines render **only Doc-4M-permitted transitions** (`Doc-7A §7`); STATE/CONFLICT (409) → reconcile. Plan `draft→active→retired` is Admin (Doc-7H).
- **ER8 — Active-org context for authenticated management (Invariant #5).** Management screens operate inside the server-resolved active org (`Doc-7C` SR3); the user acts, the org owns; client org ID never trusted. Auth-entry has no active-org.
- **ER9 — Data via the Doc-7C client; authz UX; non-disclosure.** Reads/writes via the Doc-7C server-side wired client; writes = server actions + stable idempotency key. UI gating on slugs (`can_view_billing`/`can_manage_billing` — `Doc-5I`; membership/role slugs — `Doc-5C`) is **UX over server enforcement** (`Doc-7A §4.3`), read via contract not name-string (Invariant #10). **Plan catalog reads are shared; subscription/usage/invoice/lead/reward reads are own-org** (cross-org → `NOT_FOUND`).
- **ER10 — Applicable Appendix A subset (full surface).** **APPLIES:** `CHK-7-001/002/003/004` (binding/pagination/idempotency/error — reads + commands), `CHK-7-005` (billing indicator + trust badge), `CHK-7-010/011` (active-org management — **`(app)` only**, N/A in `(auth)`), `CHK-7-020/021` (Content≠Presentation), `CHK-7-030/031` (subscription/membership/delegation lifecycle UI), `CHK-7-040/041/042` (own-org non-disclosure), `CHK-7-060/061/062/063` (baseline; **currency** on invoices/plans — `Doc-2 §0.4`), `CHK-7-070/071` (out-of-frontend), `CHK-7-080/081` (realize-never-redecide). **N/A:** `CHK-7-012` (not a participation-mounted workspace nor Admin), `CHK-7-050/051` (no AI on the account shell).
- **ER11 — Coins nothing.** Binds frozen Doc-5C/5I by pointer; carries `[ESC-IDN-DELEG-EXPIRY]` + `[ESC-7-API-SIGNUP]`. On any gap → flag-and-halt, never invent.

---

## Section spine (authored in content passes)

§0 Control/Precedence/Gating · §1 Scope & the Shell's Place (two areas; 7C seam) · §2 Auth-Entry Screens (ER2) · §3 Identity Management Screens (ER3) · §4 Delegation Management (ER4) · §5 Account & Billing Views (ER6) · §6 State-Machine UI (ER7) · §7 Active-Org Context & App-Layer Authz (ER8/ER9) · §8 Data Access via the Doc-7C Client & Baseline · §9 Conformance (full Appendix A) & Carried Items · Appendix View/Contract-Binding Skeleton.

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7E handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Consumes frozen Doc-7B kit + Doc-7C `(auth)`/`(app)` shell | By reference | No |
| **DR-7-API** | Views bind frozen Doc-5C/5I contracts | Consistency cross-check; `[ESC-7-API]` on a gap | Possible |
| **DR-7-STATE** | Subscription/membership/delegation UI driven by Doc-4M | Bound by pointer (ER7) | No |
| **`[ESC-IDN-DELEG-EXPIRY]`** | `reinstate_delegation_grant` not finalized (Doc-2 §5.10) | Reinstate UI deferred/pending; channel Doc-2 §5.10 (from Doc-5C) | **Tracked** |
| **`[ESC-7-API-SIGNUP]`** | Signup user-record creation command unconfirmed | Bind frozen Doc-5C create or Supabase-Auth+M1 provisioning; additive Doc-5C patch if needed | Possible |
| `[ESC-7-API]` | A view needs a non-existent/wrong-actor contract | Flag-and-halt; additive Doc-5x patch (Board) | Possible |

## Fences / out of scope

The kit/shell (Doc-7B/7C) · the **org-switcher / `Doc-5C §C8`** (Doc-7C) · any other surface (Doc-7D/7F/7G/7H) · **trade invoices / escrow / wallet / settlement** (M4 — R6) · **delegated-access resolution** client-side (server-side `check_permission` — R5) · finalizing `reinstate_delegation_grant` (`[ESC-IDN-DELEG-EXPIRY]`) · coining any contract/route-as-API/field/slug/state/POLICY key · the e2e / auth **test** obligation (Doc-8).

---

*End of Doc-7E Canonical Structure **v1.0 FROZEN**. Effective = Proposal v0.1 + Patch v0.1.1; Independent Hard Review + Structure Freeze Audit PASS. Doc-7E realizes the Account & Identity shell over the frozen Doc-5C/5I surfaces; management screens (not the switcher); platform-fee invoices only; coins nothing; two ESC carried. Next: Doc-7E content passes.*
