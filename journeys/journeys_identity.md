# Journeys — Identity & Organization (M1)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File A — Identity & Organization
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M1 Identity & Organization (`identity` · Doc-4C)
**Journeys:** J-ORG · J-MEM · J-CTX · J-DEL · J-SUC (registered in atlas §5; presented here in
reading order)
**Legend/notation:** atlas §2 (never redefined here) · **Actor journeys composed:** `J-BUY`
(marketplace_ux.md §3), `J-VND` (§5)

> **Authority stance.** Non-authoritative companion. States/enums resolve to **Doc-2 §5.1/§5.2/
> §5.10 + §3**; contracts to **Doc-4C** (42-contract inventory, Appendix A); permissions to
> **Doc-2 §7**. Escalation markers carried verbatim: **`[ESC-IDN-SLUG]`**, **`[ESC-IDN-AUDIT]`**,
> **`[ESC-IDN-DELEG-EXPIRY]`**. **M1 emits no domain events** (Doc-4C §C12.7:
> `core.write_outbox_event.v1` not consumed) — no journey below claims one. On any conflict the
> frozen corpus wins and this file is patched.

---

## A1. Organization Onboarding Journey — `J-ORG`

**Breadcrumb:** Atlas ▸ Identity ▸ Organization Onboarding Journey

| Ownership | |
|---|---|
| Owner Module | M1 Identity (Doc-4C §C5) |
| Participating Modules | M0 (`core.allocate_human_reference.v1`, audit); M7 (optional billing leg → J-SUB) |
| Authoritative Documents | Doc-2 §5.1, §3 (`identity.organizations`); Doc-4C §C5/§C10/§C11 |
| Read-only References | Doc-7E (account surface); Doc-7C §4 (context) |

**Actors:** Primary — User (founder). Supporting — invited members. ⚙ System — none (all steps user-driven).

**Intent arc:** Onboarding → Configuration → Readiness (inherits `J-BUY`).
**Goal:** stand up an organization as the tenant root so every business record has an owner
(*Users act; Organizations own*, Invariant #5).

**Entry:** authenticated session (Supabase Auth), user has zero or more existing orgs.
**Exit:** organization `[active]` **and** active-org context resolved (→ J-CTX); team optionally
seeded (→ J-MEM).

```
Sign up → create organization [active] → profile → buyer profile / workflow settings → invite team → ready
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.1) | Outcome / governance |
|---|---|---|---|---|
| J-ORG-01 | Authenticate | Supabase Auth (auth boundary, Doc-4C §C4) | — | Session only — no business record yet |
| J-ORG-02 | Create org | `identity.create_organization.v1` (+ founding membership; consumes `core.allocate_human_reference.v1` → `ORG-…`) | `[active]` | Every user ≥1 org; founder = Owner |
| J-ORG-03 | Profile | `identity.update_organization_profile.v1` | `[active]` | Carries `[ESC-IDN-SLUG]` (interim slug binding) |
| J-ORG-04 | Buyer profile / workflow | `identity.upsert_buyer_profile.v1`, `identity.update_workflow_settings.v1` | `[active]` | Approval chain + award threshold consumed later by M3 (Doc-4C §C10/§C11) |
| J-ORG-05 | Team | → J-MEM (`identity.invite_member.v1`) | `[active]` | Roles/permissions → J-DEL |
| J-ORG-06 | Ready | context resolved → J-CTX | `[active]` | Hands off to `J-PROC` / `J-VND` loops |

**Governance rails:** organization is the tenant boundary (default-private); `[suspended]` /
`[soft_deleted]` legs belong to J-SUC (owner) and J-ADM (platform governance) — onboarding never
touches them; audit on every mutation (`core.append_audit_record.v1`); no domain events.
**Success:** ✔ org `[active]` with `ORG-…` human ref; ✔ founding Owner membership `[active]`;
✔ workflow settings persisted; ✔ immutable audit recorded.

**Related:** upstream `J-GST` (conversion) · downstream J-CTX, J-MEM, J-DEL; `J-BUY-02/03/04`
composes this journey; billing leg → J-SUB.

---

## A2. Membership Lifecycle — `J-MEM`

**Breadcrumb:** Atlas ▸ Identity ▸ Membership Lifecycle

| Ownership | |
|---|---|
| Owner Module | M1 Identity (Doc-4C §C6) |
| Participating Modules | M6 (invitation notification delivery — DC-1 marker) |
| Authoritative Documents | Doc-2 §5.2, §3 (`identity.memberships`); Doc-4C §C6 |
| Read-only References | Doc-7E (members screens) |

**Actors:** Primary — inviting User (`«can_manage_users»`). Supporting — invitee. ⚙ System —
`identity.activate_membership.v1`, `identity.expire_invitation.v1`.

**Intent arc:** Invite → Join → Participate.
**Goal:** attach a user to an organization with a role, under the access formula in which **only
`[active]` participates**.

**Entry:** organization `[active]`; inviter holds `«can_manage_users»`.
**Exit:** membership `[active]` (participating) — or terminal `[removed]`.

```
[invited] → accept → [pending] → verification complete (⚙) → [active] ⇄ [suspended] → [removed]
   └─ expire / revoke → [removed]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.2) | Outcome / governance |
|---|---|---|---|---|
| J-MEM-01 | Invite | `identity.invite_member.v1` (notify via M6, DC-1) | `[invited]` | Grants **no access** |
| J-MEM-02 | Accept | `identity.accept_invitation.v1` (invitee) | `[invited] → [pending]` | Grants **no business access** |
| J-MEM-03 | Activate | ⚙ `identity.activate_membership.v1` (verification complete) | `[pending] → [active]` | Only `[active]` enters the access formula |
| J-MEM-04 | Suspend / reinstate | `identity.set_membership_status.v1` | `[active] ⇄ [suspended]` | Reversible governance |
| J-MEM-05 | Remove | `identity.remove_member.v1` | `→ [removed]` | Terminal; audit retained; **last-owner guard in service** |
| J-MEM-06 | Revoke / expire invite | `identity.revoke_invitation.v1` · ⚙ `identity.expire_invitation.v1` | `[invited] → [removed]` | Stale invitations never linger |

**Governance rails:** role assignment rides `memberships.role_id` (→ J-DEL); an org must always
keep ≥1 active Owner (Last Owner Protection — removal blocked until J-SUC runs); no domain events.
**Success:** ✔ member `[active]` with role bound; ✔ no access before `[active]`; ✔ removals
audited.

**Related:** upstream J-ORG · downstream J-CTX (member resolves context), J-DEL (role content);
composed by `J-BUY-05`.

---

## A3. Active-Org Context Journey — `J-CTX`

**Breadcrumb:** Atlas ▸ Identity ▸ Active-Org Context Journey

| Ownership | |
|---|---|
| Owner Module | M1 Identity (Doc-4C §C8) |
| Participating Modules | every authenticated surface (consumer) |
| Authoritative Documents | Doc-4C §C8/§C3; Invariant #5 |
| Read-only References | Doc-7C §4 (shell context resolution) |

**Actors:** Primary — User (multi-org member). ⚙ System — none (server resolution is in-wire).

**Intent arc:** Login → Orient → Operate.
**Goal:** every business action executes under exactly one **server-validated** active
organization — the client-supplied org ID is never trusted.

**Entry:** user holds ≥1 membership `[active]`.
**Exit:** requests carry a server-validated active-org; permission checks resolve against it.

```
Login → list my organizations → switch / confirm active org → permissions loaded → operate
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-CTX-01 | List | `identity.list_my_organizations.v1` | Memberships `[active]` only |
| J-CTX-02 | Switch | `identity.switch_active_organization.v1` | Server-side context change; `Iv-Active-Organization` **server-validated, never client-trusted** (Doc-7C §4) |
| J-CTX-03 | Resolve | `identity.get_active_context.v1` | Role + permission bundle for the active org |
| J-CTX-04 | Gate | `identity.check_permission.v1` (internal-service, authoritative source) | Every module's authz question answers here — app-layer authorization (RLS = backstop) |

**Governance rails:** a Hybrid org runs buyer and vendor loops under **one** active org
(Invariant #2); context switching changes scope, never permissions content; no domain events.
**Success:** ✔ active org resolved server-side; ✔ `check_permission` sourced authoritatively;
✔ zero client-trusted org IDs.

**Related:** upstream J-ORG/J-MEM · consumed by **every** operational journey; composed by
`J-BUY-03`.

---

## A4. Roles, Permissions & Delegation Journey — `J-DEL`

**Breadcrumb:** Atlas ▸ Identity ▸ Roles, Permissions & Delegation Journey

| Ownership | |
|---|---|
| Owner Module | M1 Identity (Doc-4C §C7 roles · §C9 delegation) |
| Participating Modules | M3 (reads `rfq_invitation_grantees` derived rows); M2 (vendor profile scope of a grant) |
| Authoritative Documents | Doc-2 §5.10, §3 (`roles`/`role_permissions`/`permissions`/`delegation_grants`); Doc-4C §C7/§C9 |
| Read-only References | Doc-4L §L3 (permission authority matrix — navigation); Doc-7E |

**Actors:** Primary — org admin User (`«can_manage_users»` interim per `[ESC-IDN-SLUG]`).
Supporting — representative org (delegation counter-party). ⚙ System —
`identity.expire_delegation_grant.v1`.

**Intent arc:** Compose → Assign → Delegate → Govern.
**Goal:** compose org-scoped permission bundles, assign them to members, and (where a vendor
profile is represented by another org) delegate authority **without ever creating it**.

**Entry:** org `[active]`; actor membership `[active]` with role-management authority.
**Exit:** members hold role bundles; any delegation grant reaches a terminal `[revoked]`/`[expired]`
or stays governed `[active]`.

```
Roles:      list permissions (platform catalog, read-only) → create/update role → compose slugs → assign via membership
Delegation: [draft] → grant → [active] ⇄ [suspended] → [revoked]   ·   [active] → [expired]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.10) | Outcome / governance |
|---|---|---|---|---|
| J-DEL-01 | Browse catalog | `identity.list_permissions.v1` | — | Platform-owned slug catalog — **read/list only, never extended** (Doc-4A §6.4) |
| J-DEL-02 | Create / update role | `identity.create_role.v1`, `identity.update_role.v1`, `identity.delete_role.v1` | — | Custom roles org-scoped; **system seeds (Owner/Director/Manager/Officer) never recreated/renamed**; carries `[ESC-IDN-SLUG]` |
| J-DEL-03 | Compose | `identity.set_role_permissions.v1` | — | Bundle rows added/removed (removal = revoked, audited); checks use **slugs only** |
| J-DEL-04 | Assign | membership `role_id` (Doc-4C §C6, `«can_manage_users»`) | — | Two role dimensions stay distinct (Invariant #2) |
| J-DEL-05 | Grant delegation | `identity.create_delegation_grant.v1` (controlling org) | `[draft] → [active]` | Dual-party record scoped to a vendor profile; **only the controlling org manages** |
| J-DEL-06 | Suspend / reinstate | `identity.suspend_delegation_grant.v1`, `identity.reinstate_delegation_grant.v1` | `[active] ⇄ [suspended]` | Carries `[ESC-IDN-DELEG-EXPIRY]` |
| J-DEL-07 | Revoke / expire | `identity.revoke_delegation_grant.v1` · ⚙ `identity.expire_delegation_grant.v1` | `→ [revoked]` / `[active] → [expired]` | Removes derived `rfq_invitation_grantees` rows + visibility records (removals audited) |
| J-DEL-08 | Review access | `identity.get_delegation_grant.v1`, `identity.list_delegation_grants.v1` | any | Dual-party read |

**Governance rails:** *grants delegate authority; they do not create it* — the acting user must
hold an active membership + the relevant permission **within the representative organization**
AND an `[active]` covering grant (Doc-2 §5.10 guards); role management has **no dedicated slug**
in Doc-2 §7's minimal set → `[ESC-IDN-SLUG]` interim binding, routed additively — never invent a
slug; no domain events.
**Success:** ✔ bundles composed from catalog slugs only; ✔ seeds untouched; ✔ every grant
terminal or governed; ✔ derived grantee rows cleaned on revocation.

**Related:** upstream J-ORG/J-MEM · downstream J-RINV (grantee rows feed vendor-side invitation
access); composed by `J-BUY-05`; cross-module authority seams navigated via Doc-4L §L5-2.

---

## A5. Organization Ownership & Succession Journey — `J-SUC`

**Breadcrumb:** Atlas ▸ Identity ▸ Organization Ownership & Succession Journey

| Ownership | |
|---|---|
| Owner Module | M1 Identity (Doc-4C §C5) |
| Participating Modules | M8 (admin recovery/status legs); cascade touches M2/M3 records **by rule, not by write** (owning modules execute) |
| Authoritative Documents | Doc-2 §5.1 (+ guards), §3; Doc-4C §C5 |
| Read-only References | Doc-7E · Doc-7H (admin legs) |

**Actors:** Primary — Owner. Supporting — successor member. Admin — recovery/status legs only.

**Intent arc:** Continuity → Transfer → (if needed) Wind-down → Restore.
**Goal:** keep the tenant root owned and recoverable for its whole life — ownership never orphans.

**Entry:** org `[active]` (transfer) or `[active]`/`[suspended]` (soft delete).
**Exit:** ownership transferred (org stays `[active]`), or org `[soft_deleted]` (recoverable), or
restored to `[active]`.

```
transfer: Owner → transfer_ownership → new Owner   (org stays [active])
wind-down: [active]|[suspended] → soft delete → [soft_deleted] → restore → [active]
governance: [active] ⇄ [suspended]  (platform/admin — J-ADM leg)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.1) | Outcome / governance |
|---|---|---|---|---|
| J-SUC-01 | Transfer | `identity.transfer_ownership.v1` (Owner) | `[active]` | **Succession must run before owner removal/disablement** (Doc-2 §5.1 guard) |
| J-SUC-02 | Guard | Last Owner Protection | any | ≥1 active Owner always; J-MEM-05 removal blocked otherwise |
| J-SUC-03 | Suspend / reinstate | `identity.set_organization_status.v1` (Admin, 21.6) | `[active] ⇄ [suspended]` | Platform governance leg (→ `J-ADM-06`) |
| J-SUC-04 | Soft delete | `identity.soft_delete_organization.v1` (Owner) | `→ [soft_deleted]` | **Cascade by rule:** memberships → soft-deleted; vendor profile → `[suspended]`; RFQs → archived; quotations → **preserved** (Doc-2 §5.1) |
| J-SUC-05 | Restore | `identity.restore_organization.v1` (Owner/Admin) | `[soft_deleted] → [active]` | Restore-conflict rule: reused slugs regenerated |
| J-SUC-06 | Admin recovery | `identity.admin_recover_ownership.v1` (Admin, 21.6) | `[active]` | Break-glass ownership recovery; audited |

**Governance rails:** nothing authoritative is hard-deleted (Invariant #8) — soft delete is
recoverable and the cascade **preserves quotations**; admin legs act ON the org by ID, never AS
the org; no domain events.
**Success:** ✔ ownership continuous (≥1 active Owner at every instant); ✔ wind-down reversible;
✔ cascade effects executed by owning modules, recorded in audit.

**Related:** upstream J-ORG · guards J-MEM-05 · admin legs composed by `J-ADM-06`; vendor-side
ownership transfer of a **profile** is J-VOT (different thing — M2/M5).

---

## Not Covered (File A ledger)

| Item | Why | Pointer |
|---|---|---|
| Buyer/organization verification flow | `identity.organizations` carries a `verification_level` field (Doc-2 §3: `unverified/verified/enhanced_verified`) but **no buyer-facing verification contract or flow is ratified** (vendor-side only, Doc-4G) | **ESC-JRN-BUYER-VERIF** (atlas §8) |
| User account lifecycle (2FA, deactivation, admin status) | Doc-4C §C4 contracts exist but are account hygiene, not an org journey; fold into a future extension only if a surface needs it | Doc-4C §C4 |
| Identity domain events | None exist — M1 consumes no outbox | Doc-4C §C12.7 |

*Cross-links:* actor journeys [`../marketplace_ux.md`](../marketplace_ux.md) §3 (`J-BUY`), §5
(`J-VND`) · registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-A.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*
