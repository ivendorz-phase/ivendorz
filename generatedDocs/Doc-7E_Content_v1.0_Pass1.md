# Doc-7E — Account & Identity Shell — **Content Pass-1 (§0–§4)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§4 of `Doc-7E_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9 + Appendix) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7E_Structure_v1.0_FROZEN` §0–§4; ER1/ER5 (§1) · ER2 (§2) · ER3 (§3) · ER4 (§4) |
| Authority | Conforms to `Doc-7A`/`7B`/`7C` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5C surface |
| Posture | Reference-never-restate; **mechanism only — no JSX/page/route code**. Coins **nothing**; gaps → `[ESC-7-*]` |

> **Scope:** control & gating (§0), scope & the 7C seam (§1), auth-entry screens (§2 — resolves `[ESC-7-API-SIGNUP]`), identity management screens (§3), delegation management (§4). §5–§9 + Appendix in Pass-2.

---

## §0 — Document Control, Precedence & Gating

### §0.1 Precedence & conformance
Doc-7E is a Doc-7 **surface** document. It **conforms to** `Doc-7A`/`Doc-7B`/`Doc-7C` and to Doc-4M/Doc-2 (upstream); it is **consistent with** the frozen **Doc-5C** (identity) and **Doc-5I** (account) surfaces. On any conflict the higher document wins; Doc-7E is corrected.

### §0.2 Realize-never-redecide
Doc-7E binds **frozen Doc-5C/Doc-5I contracts** to views; it re-authors none and invents none. Where a view needs a contract not present (or with the wrong actor), the gap is **`[ESC-7-API]`** (additive Doc-5x patch, Board) — never coined.

### §0.3 Freeze obligation
Doc-7E passes the **full** `Doc-7A` Appendix A applicable per ER10 (`(auth)`/`(app)` conditional) and clears/tracks any carried `[ESC-7-*]` (`[ESC-IDN-DELEG-EXPIRY]`, `[ESC-7-API-SIGNUP]`) before freeze (governance §8 rules 1, 3).

---

## §1 — Scope & the Shell's Place (two areas; the Doc-7C seam) *(authors no kit/shell/switcher)*

### §1.1 Two areas
Doc-7E spans **(a) `(auth)` unauthenticated** — login / signup / password-recovery — and **(b) `(app)` authenticated** — identity/membership/role/delegation **management screens** + account/subscription/invoice views (§5, Pass-2). Both route groups are Doc-7C's; Doc-7E authors the screens that mount in them.

### §1.2 The seam — 7E owns management screens, NOT the switcher
Doc-7E **owns the management screens**. It **does not own** the active-org context boundary or the **org-switcher** (`Doc-5C §C8` — `switch_active_organization`/`get_active_context`/`list_my_organizations`) — those are **Doc-7C's** mechanism (`Doc-7C` SR3; ER5). No `§C8` contract is realized here (no double-ownership). Doc-7E consumes the active-org context the shell resolves (§3).

---

## §2 — Auth-Entry Screens *(mechanism only)*

### §2.1 Authentication via Supabase Auth (no active-org)
Login / signup / password-recovery render in the Doc-7C `(auth)` group and use the **Supabase Auth boundary — authentication only** (`Doc-7C §3`; CLAUDE.md §2). There is **no active-org** during auth-entry (ER2). The screens collect credentials and invoke Supabase Auth; they perform no Doc-5 business mutation.

### §2.2 Signup — no frontend user-creation command (`[ESC-7-API-SIGNUP]` resolved)
**Verified vs `Doc-5C_Structure_v1.0_FROZEN`:** the M1 caller-facing surface exposes **no `create_user` / `register` / signup command** (only `create_organization` §C5, `create_role` §C7, `create_delegation_grant` §C9). Therefore:
> The **signup screen calls Supabase Auth only**; the **M1 user record is provisioned out-of-band by M1** (the auth boundary is Doc-7C; user-record provisioning is M1's, not a frontend-callable command). The frontend **assumes no `create_user`** and **coins none**. **`[ESC-7-API-SIGNUP]` is RESOLVED** — there is no frontend user-creation contract to bind; if a future onboarding step requires a wired M1 command, it is `[ESC-7-API]` (additive Doc-5C patch, Board).

### §2.3 Onboarding: org creation & invitation join
Post-authentication onboarding binds the **verified** frozen commands: **`create_organization`** (`Doc-5C §C5`) for a new org, and **`accept_invitation`** (`Doc-5C §C6`) for joining an existing org by invitation. These run in `(app)` (authenticated), not `(auth)`.

---

## §3 — Identity Management Screens *(mechanism only; `Doc-5C` User)*

### §3.1 Binding (each view ↔ a frozen Doc-5C User command/query)
| Management screen | Binds (frozen Doc-5C) |
|---|---|
| **User profile / security** | `update_user_profile`, `update_user_2fa_settings`, `deactivate_own_account` (§C4) |
| **Organization** | `create_organization`, `update_organization_profile`, `transfer_ownership`, `soft_delete_organization`, `restore_organization` (§C5) |
| **Membership** | `invite_member`, `accept_invitation`, `set_membership_status`, `remove_member`, `revoke_invitation` (§C6) |
| **Roles & permissions** | `create_role`, `update_role`, `set_role_permissions`, `delete_role` · `list_roles`, `list_permissions` (§C7) |
| **Account settings** | `upsert_buyer_profile` (§C10), `update_workflow_settings` (§C11) |

### §3.2 Org-scoped; users act, organizations own (Invariant #5)
Org/membership/role/delegation/settings management operates **inside the server-resolved active org** (`Doc-7C` SR3; §7 Pass-2): the **user acts, the organization owns**; the client org ID is never trusted. Writes are **server actions** to the bound commands with a stable idempotency key (`Doc-7A §5.6`); state transitions (membership/org lifecycles) render per Doc-4M (§6 Pass-2).

### §3.3 Authz gating is UX
Each management action is gated in the UI on its Doc-5C permission slug **for UX only**; the **server re-validates** inside the bound contract (`Doc-7A §4.3`). The UI reads permission via contract, never a role-name string (Invariant #10).

---

## §4 — Delegation Management *(mechanism only; `Doc-5C §C9`; R5)*

### §4.1 Grant management + dual-party reads
Bind the delegation grant-management commands — `create_delegation_grant`, `suspend_delegation_grant`, `revoke_delegation_grant` — and the dual-party reads `get_delegation_grant`, `list_delegation_grants` (`Doc-5C §C9`). The UI lets an authorized user create/suspend/revoke grants and view grants where they are a party.

### §4.2 The access *check* is server-side (R5) — never client-side
The **delegated-access check** (five-condition resolution, four-attribution rule) is performed **server-side inside `check_permission` (out-of-wire — `Doc-5C R5`/§6B)**. Doc-7E **manages grants** (create/suspend/revoke/read); it **never resolves or evaluates delegated access** in the client. No grant, scope, or attribution is ever a wire input the UI constructs.

### §4.3 `reinstate_delegation_grant` — deferred/pending (`[ESC-IDN-DELEG-EXPIRY]`)
**`reinstate_delegation_grant` is not finalized** (`Doc-5C` carried `[ESC-IDN-DELEG-EXPIRY]`; Doc-2 §5.10 silent on `suspended`-at-validity-expiry). Therefore the **reinstate UI is rendered as deferred/pending** — marked not-final, not offered as a confirmed transition — **until the Doc-2 §5.10 change-management channel resolves the edge**. No edge or error boundary is invented; the marker is carried to §9.

---

## Pass-1 self-check (pre-review)

- **`[ESC-7-API-SIGNUP]` resolved:** verified no `create_user` in Doc-5C → signup = Supabase Auth only; M1 provisions the record; nothing coined.
- **Seam honored:** §1.2 — §C8 switcher is Doc-7C's; not realized here.
- **Bindings verified:** §3 table ↔ Doc-5C §C4–§C7/§C10/§C11 (verified lines 36–41); §4 ↔ §C9.
- **R5 server-side check:** §4.2 — no client-side delegated-access resolution.
- **Coins nothing:** 0 new module/contract/route-as-API/field/slug/state/POLICY key.
- **Open for review:** confirm `transfer_ownership` (§C5) UX guardrails (irreversible-ish org action) are a content concern not a structural gap; confirm `deactivate_own_account`/`soft_delete_organization` render with appropriate confirmation (presentation, not a new contract).

*End of Content Pass-1 (§0–§4) — DRAFT. Realizes `Doc-7E_Structure_v1.0_FROZEN` §0–§4. Nothing coined; `[ESC-7-API-SIGNUP]` resolved; `[ESC-IDN-DELEG-EXPIRY]` carried. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9 + Appendix).*
