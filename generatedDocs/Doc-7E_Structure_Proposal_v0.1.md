# Doc-7E — Account & Identity Shell — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-7E artifact. Next: Independent Hard Review (Board) → Structure Patch → short closure check → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Program | **Doc-7 — Frontend Realization**; Doc-7E = the **Account & Identity Shell** — auth-entry + identity/membership/role/delegation **management screens** + account/subscription/invoice views |
| Realizes | the frozen **Doc-5C** User management surface (§C4 profile · §C5 org · §C6 membership · §C7 roles · §C9 delegation · §C10/§C11 settings) + the frozen **Doc-5I** account-facing User surface (plans/subscription/usage/lead-credits/platform-invoices/rewards), on the Doc-7C `(auth)` + `(app)` route groups, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (ER10) |
| Authority | Conforms to `Doc-7A`/`7B`/`7C` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5C/Doc-5I surfaces |
| Contains | Structure only — scope, R-set (`ER1…ER11`), section spine, view/contract-binding skeleton, carried dependencies. **No JSX/page/route code** — those land in Doc-7E content passes |
| Coins | **Nothing** — binds frozen Doc-5C/Doc-5I contracts by pointer; carries `[ESC-IDN-DELEG-EXPIRY]` (from Doc-5C); view/route names are presentation vocabulary |

**Governing rule:** Doc-7E is the authenticated user's **account & identity** home (plus the unauthenticated auth-entry). It owns the **management screens** — **never** the active-org context/switcher mechanism (that is Doc-7C — the seam) — binds only frozen Doc-5C/Doc-5I contracts, shows **platform-fee invoices only** (never trade invoices), and never performs a delegated-access resolution client-side. Realizes Doc-7A/7B/7C; coins nothing.

---

## Decisions proposed for ratification (R-set `ER1…ER11`)
*(`ERn` = Doc-7E realization decisions — distinct from `DR-7-*`.)*

- **ER1 — Scope: the Account & Identity shell (two areas).** Spans **(a) `(auth)` unauthenticated** — login / signup / password-recovery — and **(b) `(app)` authenticated** — identity/membership/role/delegation **management screens** + account/subscription/invoice views. Owns the **management screens**; **does not own** the active-org context/switcher (Doc-7C seam — ER5). Consumes the Doc-7B kit + Doc-7C server-side wired client by reference; authors its own views only.
- **ER2 — Auth-entry screens (`(auth)` group; Supabase Auth boundary).** Login / signup / password-recovery render in the Doc-7C `(auth)` group (`Doc-7C` SR2), using the **Supabase Auth boundary** (authentication only — `Doc-7C §3`); **no active-org** during auth-entry. `accept_invitation` (`Doc-5C §C6`) is part of the join/signup flow. Login/signup themselves are Supabase Auth, **not** a Doc-5C wired command; account-creation effects bind the relevant frozen Doc-5C command (bind-or-ESC).
- **ER3 — Identity management screens (authenticated; `Doc-5C` User).** Bind: **user profile** (`update_user_profile`, `update_user_2fa_settings`, `deactivate_own_account` — §C4); **organization** (`create_organization`, `update_organization_profile`, `transfer_ownership`, `soft_delete_organization`, `restore_organization` — §C5); **membership** (`invite_member`, `accept_invitation`, `set_membership_status`, `remove_member`, `revoke_invitation` — §C6); **roles** (`create_role`, `update_role`, `set_role_permissions`, `delete_role` · `list_roles`, `list_permissions` — §C7); **settings** (`upsert_buyer_profile` §C10, `update_workflow_settings` §C11). Each binds the frozen Doc-5C User command/query by pointer.
- **ER4 — Delegation management (`Doc-5C §C9`; R5; carried ESC).** Bind the grant-management commands (`create_delegation_grant`, `suspend_delegation_grant`, `reinstate_delegation_grant`, `revoke_delegation_grant`) + dual-party reads (`get_delegation_grant`, `list_delegation_grants`). **The delegated-access *check* is server-side inside `check_permission` (out-of-wire — `Doc-5C R5`/§6B); 7E manages grants, never performs the access resolution.** **Carries `[ESC-IDN-DELEG-EXPIRY]`** (`Doc-5C` tracked): `reinstate_delegation_grant` is **not finalized** (Doc-2 §5.10 open) → the **reinstate UI is deferred/marked pending**, not rendered as final, until resolved (additive Doc-2 §5.10 channel). No edge invented.
- **ER5 — Active-org seam (Doc-7C SR3/C-2) — 7E does NOT own the switcher.** Doc-7E **does not realize `Doc-5C §C8`** (`switch_active_organization` / `get_active_context` / `list_my_organizations`) — that is **Doc-7C's** org-switcher/context mechanism. No §C8 contract is realized here (no double-ownership). 7E owns the **management screens**; 7C owns the **context boundary + switcher**.
- **ER6 — Account & billing views (`Doc-5I` account-facing User; R6 firewall).** Bind: **plan catalog** (`get_plan`, `list_plans` — BC-BILL-1, User read); **subscription** (`purchase_subscription`, `cancel_subscription`, `activate_plan` — BC-BILL-2 + ActivatePlan; `get_subscription`, `list_subscription_events`); **usage** (`get_usage` — BC-BILL-3); **lead credits** (`get_lead_balance`, `list_lead_transactions`; `credit_lead_account`/`debit_lead_account` User leg — BC-BILL-4); **platform invoices** (`get_platform_invoice`, `list_platform_invoices`; `issue_platform_invoice`/`update_invoice_status` User leg — BC-BILL-5); **rewards/referrals** (`get_reward_balance`, `list_referrals` — BC-BILL-6). **Platform-fee invoices ONLY — never trade invoices, no escrow/wallet/settlement** (`Doc-5I R6`; trade invoices are M4 — Buyer/Vendor workspace). The Doc-7B **billing indicator** reads entitlement *state* via these wired reads, **never** the out-of-wire `resolve_entitlements`/`enforce_quota` (`Doc-5I R10`; `Doc-7A §3.7`).
- **ER7 — State-machine UI (Doc-4M; `Doc-5I R7`).** The **subscription lifecycle** (purchase → active → renew/expire/cancel) and the membership / delegation / org state machines render **only Doc-4M-permitted transitions** (`Doc-7A §7`); the UI offers no transition the machine forbids; STATE/CONFLICT (409) → reconcile. Plan catalog `draft→active→retired` is Admin (Doc-7H), not 7E.
- **ER8 — Active-org context for authenticated management (Invariant #5).** The authenticated management screens operate **inside the server-resolved active org** (`Doc-7C` SR3); membership/role/delegation/settings management is for the **active org**; the user acts, the organization owns (Invariant #5; client org ID never trusted). Auth-entry (ER2) has no active-org.
- **ER9 — Data via the Doc-7C client; authz UX; own-org non-disclosure.** All reads/writes flow through the **Doc-7C server-side wired client** (`Doc-7C §5`); writes are server actions with a stable idempotency key. UI gating on the relevant slugs (e.g. `can_view_billing`/`can_manage_billing` — `Doc-5I`; membership/role-management slugs — `Doc-5C`) is **UX over server enforcement** (`Doc-7A §4.3`), read via contract not name-string (Invariant #10). **Own-org reads only** (subscription/usage/invoice/lead/reward are own-org — `Doc-5I`); a cross-org/protected read collapses to `NOT_FOUND` (`Doc-5A §6.3`).
- **ER10 — Applicable Appendix A subset (full surface).** **APPLIES:** `CHK-7-001/002/003/004` (binding/pagination/idempotency/error — reads **and** commands), `CHK-7-005` (billing indicator + trust badge composition), `CHK-7-010/011/012` (authenticated management is org-scoped; UX gating; Hybrid n/a here), `CHK-7-020/021` (Content≠Presentation of account data), `CHK-7-030/031` (subscription/membership/delegation lifecycle UI), `CHK-7-040/041/042` (own-org non-disclosure; NOT_FOUND collapse), `CHK-7-060/061/062/063` (baseline; **currency** on invoices/plans — `Doc-2 §0.4`), `CHK-7-070/071` (out-of-frontend), `CHK-7-080/081` (realize-never-redecide). **N/A (reason):** `CHK-7-050/051` (no AI advisory on the account shell — `Doc-5K` none); **`CHK-7-010/012`** are **N/A in the `(auth)` area** (unauthenticated — ER2), APPLIES in `(app)`.
- **ER11 — Coins nothing.** Binds frozen Doc-5C/Doc-5I contracts by pointer; carries `[ESC-IDN-DELEG-EXPIRY]`. On any gap → flag-and-halt (`[ESC-7-API]`), never invent.

---

## The Doc-7E section spine (authored in content passes)

| § | Title | Realizes | Detail |
|---|---|---|---|
| §0 | Document Control, Precedence & Gating | governance §3; Doc-7A §0 | conforms 7A/7B/7C; consistency with Doc-5C/5I; flag-and-halt |
| §1 | Scope & the Shell's Place (two areas; the 7C seam) | ER1/ER5 | management screens, not the switcher |
| §2 | Auth-Entry Screens | ER2; Doc-7C §3 | login/signup/recovery; Supabase Auth; no active-org |
| §3 | Identity Management Screens | ER3; Doc-5C §C4–§C7/§C10/§C11 | user/org/membership/role/settings |
| §4 | Delegation Management | ER4; Doc-5C §C9; R5 | grant management; access-check server-side; `[ESC-IDN-DELEG-EXPIRY]` |
| §5 | Account & Billing Views | ER6; Doc-5I; R6 | plans/subscription/usage/lead/invoice/reward; platform-fee only |
| §6 | State-Machine UI | ER7; Doc-4M; Doc-5I R7 | subscription/membership/delegation lifecycles |
| §7 | Active-Org Context & App-Layer Authz | ER8/ER9 | org-scoped management; UX gating; own-org non-disclosure |
| §8 | Data Access via the Doc-7C Client & Baseline | ER9; ER10 baseline | wired client; currency; a11y/i18n/responsive |
| §9 | Conformance (full Appendix A) & Carried Items | ER10/ER11 | applicable `CHK-7-xxx` + reasons; `DR-7-*`/`[ESC-7-*]`/`[ESC-IDN-DELEG-EXPIRY]` |
| Appendix | View / Contract-Binding Skeleton | ER3/ER4/ER6 | view **names** + bound Doc-5C/5I contracts (at content) |

*Doc-7E authors no kit/shell, no org-switcher (Doc-7C), and no other surface. §2–§8 are the account/identity views; actual pages realized in content passes.*

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7E handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Consumes frozen Doc-7B kit + Doc-7C `(auth)`/`(app)` shell | By reference; never re-authored | No |
| **DR-7-API** | Views bind frozen Doc-5C/Doc-5I contracts | Consistency cross-check (ER3/ER4/ER6); `[ESC-7-API]` on a gap | Possible |
| **DR-7-STATE** | Subscription/membership/delegation UI driven by Doc-4M | Bound by pointer (ER7) | No |
| **`[ESC-IDN-DELEG-EXPIRY]`** | `reinstate_delegation_grant` not finalized (Doc-2 §5.10 open) | Reinstate UI deferred/marked pending; channel: Doc-2 §5.10 (carried from Doc-5C) | **Tracked** |
| `[ESC-7-API]` | A view needs a non-existent/wrong-actor contract | Flag-and-halt; additive Doc-5x patch (Board) | Possible |

## Fences / out of scope

Authoring the kit/shell (Doc-7B/7C) · the **org-switcher / active-org context mechanism / `Doc-5C §C8`** (Doc-7C) · any other surface (Doc-7D/7F/7G/7H) · **trade invoices / escrow / wallet / settlement** (M4 — `Doc-5I R6`) · performing a **delegated-access resolution** client-side (server-side `check_permission` — `Doc-5C R5`) · finalizing the `reinstate_delegation_grant` edge (`[ESC-IDN-DELEG-EXPIRY]`) · coining any contract/route-as-API/field/slug/state/POLICY key · the e2e / auth **test** obligation (Doc-8).

---

## Provenance & next steps

- **Provenance:** grounded in `Doc-5C` (User management surface — §C4–§C11 verified; §C8 = Doc-7C's; `[ESC-IDN-DELEG-EXPIRY]` carried) + `Doc-5I` (account-facing User surface — BC-BILL-1…6 verified; R6 platform-invoice firewall; R10 entitlement out-of-wire) + `Doc-7A/7B/7C` (frozen) + `Doc-2 §0.4` (currency). No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. R-set `ER1…ER11`; section spine §0–§9 + skeleton.
- **Next (Board-directed loop):** Independent Hard Review → Structure Patch → short closure check → Structure Freeze Audit → `Doc-7E_Structure_v1.0_FROZEN` → Doc-7E content passes → then Doc-7F (Buyer) / Doc-7G (Vendor) / Doc-7H (Admin).

*End of Doc-7E Canonical Structure **Proposal v0.1** — structure only. On any conflict, Doc-7A/7B/7C + the frozen corpus win; flag-and-halt. Doc-7E realizes the Account & Identity shell over the frozen Doc-5C/Doc-5I surfaces; management screens (not the switcher); platform-fee invoices only; coins nothing. Next: Independent Hard Review.*
