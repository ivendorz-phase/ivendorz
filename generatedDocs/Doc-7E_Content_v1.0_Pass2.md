# Doc-7E — Account & Identity Shell — **Content Pass-2 (§5–§9 + Appendix)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §5–§9 + Appendix of `Doc-7E_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7E FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7E_Structure_v1.0_FROZEN` §5–§9 + Appendix; ER6 (§5) · ER7 (§6) · ER8/ER9 (§7) · ER9/ER10 (§8) · ER10/ER11 (§9) |
| Carries forward | Pass-1 §3/§4 (management/delegation) · `[ESC-IDN-DELEG-EXPIRY]` |
| Posture | Reference-never-restate; mechanism only. Coins **nothing** |

> **Scope:** account & billing views (§5), state-machine UI (§6), active-org/authz/non-disclosure (§7), data access & baseline (§8), conformance & carried items (§9), view/contract-binding skeleton (Appendix).

---

## §5 — Account & Billing Views *(mechanism only; `Doc-5I`; R6/R10/R11)*

### §5.1 Binding by actor leg (`Doc-5I R11`)
| View | Binds (frozen Doc-5I) | Kind |
|---|---|---|
| **Plan catalog** | `get_plan`, `list_plans` (BC-BILL-1) | **shared** read (User/Admin) |
| **Subscription** | `purchase_subscription`, `cancel_subscription`, `activate_plan` (BC-BILL-2) · `get_subscription`, `list_subscription_events` | **user-initiated** commands + own-org reads |
| **Usage** | `get_usage` (BC-BILL-3) | own-org read |
| **Lead credits** | `credit_lead_account` = **buy** (User leg) · `get_lead_balance`, `list_lead_transactions` (BC-BILL-4) | user-initiated buy + own-org reads (`debit_lead_account` = System; surfaced via `list_lead_transactions`) |
| **Platform invoices** | `get_platform_invoice`, `list_platform_invoices` (BC-BILL-5) | **read-only** (issuance System in normal flow) |
| **Rewards / referrals** | `get_reward_balance`, `list_referrals` (BC-BILL-6) | own-org reads |

Actor legs (User vs System) are confirmed at this pass; the shell **invokes user-initiated commands** and **reads** System-issued records. No issuance assumed as a user action.

### §5.2 Platform-fee invoices only (R6 firewall)
The billing views show **platform-fee invoices only** — **never trade invoices, no escrow / wallet / fund custody / buyer↔vendor settlement** (`Doc-5I R6`; `billing.platform_invoices ≠ operations.trade_invoices`). Trade invoices are M4 (Buyer/Vendor workspace, Doc-7F/7G). The platform never handles buyer↔vendor money.

### §5.3 Entitlement state via wired reads (R10)
The Doc-7B **billing/entitlement indicator** (composed here, ER6/`CHK-7-005`) reads entitlement/quota **state** via the wired reads (`get_subscription`/`get_usage`/`get_lead_balance`) — **never** the out-of-wire `resolve_entitlements`/`enforce_quota` (`Doc-5I R10`; `Doc-7A §3.7`). It branches on **boolean/numeric/enum** entitlement values, never a plan-name string (Invariant #10).

---

## §6 — State-Machine UI *(mechanism only; Doc-4M; `Doc-5I R7`)*

### §6.1 Subscription lifecycle
The subscription view renders state + permitted transitions **strictly from Doc-4M** (`Doc-7A §7`): `purchase → active → (renew | expire | cancel)`. The UI offers only machine-permitted, actor-permitted transitions; **`renew_subscription`/`expire_subscription` are System period-end jobs** (`Doc-5I` §10 out-of-wire) — the UI **displays** their resulting state, never invokes them. A stale/illegal transition returns STATE/CONFLICT (409) → reconcile (`Doc-7A §7.2`).

### §6.2 Membership / delegation / org lifecycles
Membership status, delegation grant lifecycle, and org soft-delete/restore render state + transitions from Doc-4M; the reinstate-delegation transition is **deferred/pending** (`[ESC-IDN-DELEG-EXPIRY]` — Pass-1 §4.3). No state/edge/label invented.

---

## §7 — Active-Org Context & App-Layer Authz *(mechanism only)*

### §7.1 Org-scoped management (Invariant #5)
Authenticated management + account views operate **inside the server-resolved active org** (`Doc-7C` SR3; the org-switcher is Doc-7C's — Pass-1 §1.2). The **user acts, the organization owns**; the client org ID is never trusted (CLAUDE.md §5).

### §7.2 Authz gating is UX over server enforcement
UI gating on slugs — `can_view_billing` / `can_manage_billing` (`Doc-5I`), membership/role-management slugs (`Doc-5C`) — is **UX only**; the **server re-validates** inside each wired contract (`Doc-7A §4.3`). The UI reads permission/entitlement via contract, **never a plan-/role-name string** (Invariant #10).

### §7.3 Non-disclosure — shared catalog vs own-org
**Plan catalog reads are shared** (every user browses plans). **Subscription / usage / invoice / lead / reward reads are own-org**; a cross-org or protected read collapses to a uniform **`NOT_FOUND`** (`Doc-5A §6.3`; `Doc-5C`/`Doc-5I` own-org reads). No org's billing/usage is visible to another.

---

## §8 — Data Access via the Doc-7C Client & Baseline *(mechanism only)*

### §8.1 Data access
All reads/writes flow through the **Doc-7C server-side wired client** (`Doc-7C §5`): reads via Server Components, writes via server actions with a **stable idempotency key** (`Doc-7A §5.6`); cursor pagination + POLICY `page_size` for lists (`Doc-5A §8`); error→state by `error_class` (`Doc-7A §5.3`). The browser holds no credential (`Doc-7C §5.1`).

### §8.2 Baseline (from Doc-7B §7)
WCAG-AA; i18n-ready; **currency-per-field, default BDT, never assumed** on **plans, invoices, lead/reward balances** (`Doc-2 §0.4`); responsive (`CHK-7-060/061/062/063`). Money fields render the `{amount, currency}` pair from the contract.

---

## §9 — Conformance & Carried Items

### §9.1 Applicable `CHK-7-xxx` (ER10)
| CHK | Status | Reason |
|---|---|---|
| `CHK-7-001/002/003/004` | **APPLIES** | reads + commands (binding/pagination/idempotency/error) |
| `CHK-7-005` | **APPLIES** | billing indicator + trust badge composition |
| `CHK-7-010/011` | **APPLIES `(app)`** | active-org management; **N/A in `(auth)`** |
| `CHK-7-012` | **N/A** | not a participation-mounted workspace nor Admin |
| `CHK-7-020/021` | **APPLIES** | Content≠Presentation of account data |
| `CHK-7-030/031` | **APPLIES** | subscription/membership/delegation lifecycle UI |
| `CHK-7-040/041/042` | **APPLIES** | own-org non-disclosure; NOT_FOUND collapse |
| `CHK-7-060/061/062/063` | **APPLIES** | baseline; currency on money fields |
| `CHK-7-070/071` | **APPLIES** | out-of-frontend (reads via shell client; no client authoritative state) |
| `CHK-7-080/081` | **APPLIES** | realize-never-redecide |
| `CHK-7-050/051` | **N/A** | no AI advisory on the account shell |

### §9.2 Carried items
| ID | Item | Channel |
|---|---|---|
| **`[ESC-IDN-DELEG-EXPIRY]`** | `reinstate_delegation_grant` not finalized | reinstate UI deferred/pending; Doc-2 §5.10 change-management (from Doc-5C) |
| **`[ESC-7-API-SIGNUP]`** | **RESOLVED (frontend side)** — no frontend `create_user`; signup = Supabase Auth; M1 materialization out of scope | future wired onboarding = `[ESC-7-API]` |
| **DR-7-API** | views bind frozen Doc-5C/5I | consistency cross-check; `[ESC-7-API]` on a gap |
| **DR-7-STATE** | subscription/membership/delegation per Doc-4M | bound by pointer |

### §9.3 Coins nothing
Binds frozen Doc-5C/5I by pointer; view/route names are presentation vocabulary (Appendix). No domain/API element introduced (ER11).

---

## Appendix — View / Contract-Binding Skeleton *(names = presentation vocabulary; bound contracts frozen)*

| View | Bound frozen contract(s) | Area / kind |
|---|---|---|
| Login / signup / recovery | Supabase Auth (no Doc-5 command) | `(auth)` |
| Onboarding: create org / accept invite | `create_organization` (§C5) / `accept_invitation` (§C6) | `(app)` |
| User profile / security | `update_user_profile`/`update_user_2fa_settings`/`deactivate_own_account` (§C4) | `(app)` |
| Organization | §C5 commands (soft-delete only; DC-1 cascade System) | `(app)` |
| Membership | §C6 commands | `(app)` |
| Roles & permissions | §C7 commands/queries | `(app)` |
| Delegation | §C9 (create/suspend/revoke + reads; **reinstate deferred**) | `(app)` |
| Plan catalog | `get_plan`/`list_plans` (BC-BILL-1) | shared read |
| Subscription | `purchase_/cancel_/activate_` + `get_subscription`/`list_subscription_events` (BC-BILL-2) | own-org |
| Usage / lead credits / invoices / rewards | BC-BILL-3/4/5/6 reads (+ user-initiated buy) | own-org; platform-fee only |
| Embedded | billing indicator (BC-BILL reads) · trust badge (`Doc-5G` Public read) | composed from Doc-7B |

Exact pages/routes realized with the implementation; Doc-7E fixes the **view inventory + bindings**.

---

## Pass-2 self-check (pre-review)

- **§9.1 vs ER10:** matches (CHK-7-012 N/A; 010/011 `(app)`-only; 050/051 N/A).
- **R6 firewall:** §5.2 — platform-fee invoices only; no trade invoice/escrow/wallet.
- **R10 entitlement:** §5.3 — billing indicator via wired reads, never resolve_entitlements.
- **State machine:** §6 — System period-end jobs displayed not invoked; reinstate deferred.
- **Coins nothing:** Appendix names presentation vocabulary; bound contracts frozen.
- **Open for review:** confirm `activate_plan` (additive Doc-4I patch) is User-actor on the account shell vs an Admin/owner-only action; confirm `cancel_subscription` lifecycle edge exists in Doc-4M.

*End of Content Pass-2 (§5–§9 + Appendix) — DRAFT. Realizes `Doc-7E_Structure_v1.0_FROZEN` §5–§9 + Appendix. Nothing coined. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7E FROZEN.*
