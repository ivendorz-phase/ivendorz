# Doc-4C — Identity & Organization — API & Integration Contracts — Content v1.0, Pass-A

| Field | Value |
|---|---|
| Document | Doc-4C — Identity & Organization (Module 1) |
| Pass | A of N — contract authoring structure: capability decomposition, contract boundaries, actor mapping, template assignment, authorization / state-machine / audit bindings, integration-dependency markers, source references. **No payloads** (deferred to Pass-B hardening). |
| Status | **DRAFT — ready for Independent Architecture Review** |
| Module | Module 1 — Identity & Organization (`identity` schema) |
| Structure | Conforms to `Doc-4C_Structure_v1.0_FROZEN.md` (Board-frozen canonical Table of Contents) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (base `…v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`), Doc-3 v1.0.2 (base `…v1.0.1.md` + `Doc-3_Patch_v1.0.2.md` + `Doc-3_Policy_Key_Registration_Patch_v1.0.md`), Doc-4A v1.0 (FROZEN), Doc-4B v1.0 — Platform Core / Shared Kernel (`Doc-4B_Content_v1.0_PassB.md` + `Doc-4B_Freeze_Patch_v1.0.1.md`) |
| Contains | Pass-A contract-authoring records for Module 1 only — no contracts/endpoints from any other module; no entity, state, event, permission slug, audit action, template, or POLICY key coined |
| Audience | Claude Code, Cursor, backend, QA, AI development agents |

**Pass-A scope note (read first).** Per the Architecture Board directive and the frozen structure's per-section detail levels (§C3 and Appendix A: "No payloads"), this Pass authors the *contract-authoring structure* — for each capability: a working Contract-ID, the owned entity, the Doc-4A template, the actor, the authorization / state-machine / audit / event bindings (by pointer), idempotency posture, integration-dependency markers, and the authoritative source pointers. **Request/Response payload field lists, per-field validation tables, per-contract error-code registers, and concrete idempotency-window values are Pass-B hardening and are deliberately not instantiated here.** This document performs **no self-review and emits no BLOCKER/MAJOR/MINOR findings** (Board directive); freeze-gate dependencies and newly surfaced binding gaps are carried as inline **escalation markers** routed to their named channels (Appendix C), consistent with flag-and-halt (Doc-4A §0.6) — never resolved here, never invented around.

---

## §C0 — Document Control, Precedence & Conformance Obligation

Doc-4C authors the contracts of **Module 1 — Identity & Organization** and **no other module**. It introduces no standard (those are Doc-4A), no entity / state / event / permission slug / audit action / POLICY key (those are Doc-2 / Doc-3), and overrides nothing in a higher-precedence document. Conformance is an **obligation**, not an aspiration.

**Precedence (higher governs on conflict):** Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C. On any conflict with a higher or frozen document, this document **halts, records both citations, and escalates** for the owning document's patch (Doc-4A §0.6 flag-and-halt); it never silently overrides and never invents (§0.6).

**Conformed corpus versions (effective identifiers; cite base § + patch ID where material, Doc-4A §3.5):** Doc-2 **v1.0.3**, Doc-3 **v1.0.2**, Doc-4A **v1.0**, Doc-4B **v1.0**.

**This document does not redefine** any Doc-4A standard (templates §21, authorization §6/§6B, context §5/§5.3/§5.6, validation order §11.2, error model §12, idempotency §14, events §16, audit §17, FIXED/POLICY/ORG §18) and does not redefine any **Doc-4B Platform Core / Shared Kernel** responsibility (audit-write §17, transactional-outbox-write §16, UUIDv7 + human-reference allocation §8, POLICY resolution §18, feature-flag evaluation). It **consumes** all of these **by pointer**.

*Source bindings:* Doc-4_Governance_Note_v1.0; Doc-4A §0. *Detail level:* short, fully normative.

---

## §C1 — Module Scope & Boundary

Module 1 is the platform's **authorization root**: *Users act; Organizations own* (Architecture §5; Doc-4A §5.3). Its active-organization context is **server-validated, never client-asserted**. Module 1 owns exactly the **nine** entities below and authors contracts over them alone.

### C1.1 — Owned entities (Doc-2 §3.2, §6, §10.2 — by pointer)

| Entity | Tenancy class (Doc-2 §6) | Aggregate (Doc-2 §2) | Lifecycle |
|---|---|---|---|
| `users` | platform-owned (personal-data rules apply) | User (AR) | `active / suspended / soft-deleted` (anonymizable on departure) — simple lifecycle (Doc-2 §3.2) |
| `organizations` | tenant root | Organization (AR) | **Doc-2 §5.1** Organization state machine |
| `memberships` | tenant-owned | Organization child (own §5.2 machine) | **Doc-2 §5.2** Membership state machine |
| `roles` | tenant-owned (platform seeds defaults) | Role (AR) | simple |
| `permissions` | platform-owned | catalog (reference data; not an aggregate) | simple — **read/list only here** |
| `role_permissions` | tenant-owned | Role child (N:N) | simple (row removal = revoked, audited) |
| `organization_workflow_settings` | tenant-owned | Organization child | simple — **ORG** settings (§18.4) |
| `buyer_profiles` | tenant-owned | Organization child | simple — optional |
| `delegation_grants` | **shared** (both party orgs read; controlling org manages) | Delegation Grant (AR) | **Doc-2 §5.10** Delegation Grant state machine |

### C1.2 — Explicitly NOT owned (referenced by bare UUID only; service-validated, no cross-schema FK — Doc-2 §0.3)

| Referenced concept | Owning module / doc | Identity's relationship |
|---|---|---|
| `vendor_profiles` | Module 2 — Marketplace / Doc-4D | `delegation_grants.vendor_profile_id` is a bare UUID ref validated against the Vendor Service at issue time (Doc-2 §10.2); org soft-delete cascades to vendor-profile **suspension** (Module 2) — **DC-1** |
| `verification_records` | Module 5 — Trust / Doc-4G | Identity owns `can_submit_verification` (Doc-2 §7) but **authors no verification contract** — **DC-2** |
| `subscriptions` / entitlements | Module 7 — Billing / Doc-4I | referenced by UUID; never gates trust/eligibility/routing (§4B); subscription-change audit is Billing's |
| `rfqs` / `quotations` / `rfq_invitation_grantees` | Module 3 — RFQ / Doc-4E | org soft-delete → RFQs archived; delegation revoke/expire → grantee/visibility teardown — both **DC-1** |
| all `core.*` (audit, outbox, id_sequences, system_configuration, feature_flags) | Module 0 — Platform Core / Doc-4B | consumed by pointer as infrastructure services (Appendix B) |

### C1.3 — Authentication boundary (**DC-4**)

**Supabase Auth performs authentication only** (Doc-4A §5). Login, password, 2FA *challenge*, and session mechanics are **infrastructure** (development documents) — **not** Doc-4C business contracts. Doc-4C owns the **user identity record, preferences, 2FA *settings*, and the post-authentication authorization context** (membership, role, permission resolution, active-org context). The Membership `pending → active` "verification complete" transition (Doc-2 §5.2) is effected by an Identity contract but predicated on the infra account-verification signal (DC-4).

*Source bindings:* Architecture §5, §5.7, §16.2; ADR-015 (Identity & Organization Model, Redline v0.3.1); ADR-005 (Vendor Identity, Ownership & Representation Model); Doc-2 §3.2, §6, §10.2; Doc-4A §1.3, §4.1, §5. *Detail level:* normative scope statement + owned/not-owned tables (pointer-level).

---

## §C2 — Conformance & Template Binding

### C2.1 — Template selection for Module 1 (Doc-4A §21; selection guide §21 + §22.3)

| Template | Used for (Module 1) |
|---|---|
| **21.3 Query** | Get User, Get Organization, Get Membership, **Check Permission**, list/read surfaces (roles, permissions catalog, delegation grants, buyer profile, workflow settings, active context, my organizations) |
| **21.4 Command** | create / update / state-transition on identity entities (organization, membership, role, role_permissions, delegation grant, buyer profile, workflow settings, user self-service, active-org switch) |
| **21.6 Admin** | platform-governance actions with **no active org context** (§5.6): organization suspend/reinstate (§5.1), ownership-succession recovery (§5.5), user account suspend/reinstate |
| **21.5 System** | Phase-2 timers: membership-invite expiry (§5.2 `invited → expire`), delegation-grant expiry (§5.10 `valid_to`); `Response: none` (reference_id-mandate exempt, FreezeAudit Patch v1.0.1) |
| **21.2 Integration** | **None instantiated in Pass-A** — see the DC-1 guardrail (C2.3). Per §4.4 integrations are authored by the source module; Identity's only cross-module legs are DC-1-dependent and therefore blocked. |

**Internal-service composition (D-1).** Services consumed cross-module (the §C3 shared services, plus `get_workflow_settings`, `get_buyer_profile`) carry `Audience: internal-service` and are composed as **21.3 Query** with `Audience: internal-service` (no new Doc-4A template), consistent with the **Doc-4B D-1 precedent**. **D-1 governance status: Board Decision Pending** — Doc-4C neither relies on nor asserts a final D-1 ratification; if D-1 changes the convention, the affected internal-service records are updated then. The `internal-service` marker identifies the **consumption channel only**; it does **not** reduce a contract's authoritativeness (see §C3 authoritative-source rule).

### C2.2 — Namespaces & conformance obligation

- **Contract-ID:** `identity.<operation>.v1` (module prefix = schema `identity`; Doc-4A §3.2, §20.3).
- **Error codes:** `identity_<domain>_<code>` (Doc-4A Appendix B §B.2 format `<module_prefix>_<domain>_<code>`; prefix `identity_`). Concrete code registers are **Pass-B**.
- **Response mandate:** every non-21.5 Response Contract carries `reference_id : uuid : always` (Doc-4A §22.1 C-05 / P6-B01); 21.5 System contracts are exempt (`Response: none`). Field-level payloads are Pass-B.
- **Conformance checklist:** every contract is subject to the Doc-4A Appendix A checklist at Pass-B; Appendix B of this document maps each section to its governing Doc-4A check IDs.

### C2.3 — Template 21.2 applicability under DC-1 (content-pass guardrail — carried, unchanged)

While **DC-1** (Appendix C) is unresolved, **Template 21.2 (Integration) MUST NOT be instantiated** for the DC-1-dependent cross-module legs:

1. the **organization soft-delete cascade** to Modules 2/3 (vendor profile → suspended; RFQs → archived), and
2. the **delegation revocation/expiry teardown** in Module 3 (`rfq_invitation_grantees` + visibility rows).

Template 21.2 may be used only for integrations that are **not** DC-1-dependent — of which Module 1 currently has none. This guardrail neither resolves DC-1, coins an event, nor authors any integration contract.

*Source bindings:* Doc-4A §21 (templates + selection), §22.3 (rules), Appendix A, Appendix B; Doc-4B D-1 composition precedent (D-1 status: Board Decision Pending). *Detail level:* normative template-selection table + namespace binding + DC-1 guardrail.

---

## §C3 — Shared Identity Services (consumed platform-wide)

The foundational Identity services every other module depends on (Architecture §16.2). All are **21.3 Query**, `Audience: internal-service` (D-1 composition, §C2.1).

**Authoritative-source rule (One Entity = One Owner; Doc-4A §4.1, §6).** Identity's permission-resolution contracts — **Check Permission** and the **Get-Membership / Role / Permission** reads — are the **single authoritative authorization-resolution source** for the platform. Other modules **consume** these to resolve the Doc-4A §6 three-layer check; **no module may implement a parallel or shadow authorization-resolution path** (prevents duplicated permission resolution). The `internal-service` marker is a consumption-channel label only; it does not reduce authoritativeness.

**`identity.get_user.v1`** — Get User

- *Capability:* resolve a `users` record by UUID for cross-module display/validation (no personal-data fields beyond what the caller is entitled to; Doc-2 §3.2 personal-data rules).
- *Entity:* `users` (platform-owned) · *Template:* 21.3 Query (internal-service) · *Actor:* internal-service / System context.
- *AuthZ:* caller-context resolution; no tenant slug (platform-owned read); non-disclosure per §7.5.
- *State:* none (read). · *Audit:* no (pure read; §17.1). · *Events:* none. · *Idempotency:* not-applicable.
- *Source:* Architecture §16.2; Doc-2 §3.2; Doc-4A §5, §7.

**`identity.get_organization.v1`** — Get Organization

- *Capability:* resolve an `organizations` record by UUID (tenant root metadata: name, slug, status, verification_level, participation flags — Doc-2 §10.2).
- *Entity:* `organizations` · *Template:* 21.3 Query (internal-service) · *Actor:* internal-service.
- *AuthZ:* caller-context; tenancy honored (§7); no shadow re-implementation by consumers.
- *State:* none (read). · *Audit:* no. · *Events:* none. · *Idempotency:* not-applicable.
- *Source:* Architecture §16.2; Doc-2 §3.2/§5.1/§10.2; Doc-4A §5, §7.

**`identity.get_membership.v1`** — Get Membership

- *Capability:* resolve the (user × organization) membership — state, `role_id`, department — for access evaluation (only `active` participates in the access formula, §6.1).
- *Entity:* `memberships` (tenant-owned) · *Template:* 21.3 Query (internal-service) · *Actor:* internal-service.
- *AuthZ:* caller-context; tenancy `organization_id` scoped (§7).
- *State:* reads §5.2 state (no transition). · *Audit:* no. · *Events:* none. · *Idempotency:* not-applicable.
- *Source:* Architecture §16.2; Doc-2 §3.2/§5.2; Doc-4A §6.1, §7.

**`identity.check_permission.v1`** — Check Permission *(platform authorization root)*

- *Capability:* the Identity-side resolution of the **Doc-4A §6 three-layer check** — active **Membership + Permission Slug + Resource Scope**, OR an active **Delegation Grant** (§6B). Returns an allow/deny decision with the satisfied path; **slugs only** (§6.2), never role or plan names.
- *Entity:* `memberships`, `roles`, `role_permissions`, `permissions`, `delegation_grants` (read) · *Template:* 21.3 Query (internal-service) · *Actor:* internal-service.
- *AuthZ:* this contract **is** the resolution authority; it binds to §6/§6B and **does not redefine** them (§C8). Authoritative-source rule applies — no consumer may re-derive.
- *State:* reads §5.2 / §5.10 states (active-only participates). · *Audit:* no (resolution read). · *Events:* none. · *Idempotency:* not-applicable.
- *Source:* Architecture §16.2; Doc-4A §5, §6, §6B, §7; Doc-2 §3.2, §7.

*Source bindings:* Architecture §16.2; Doc-4A §5/§6/§6B/§7; Doc-2 §3.2 (users, organizations, memberships, roles, permissions). *Detail level:* per-service capability + template (21.3) + authorization-resolution binding. No payloads.

---

## §C4 — User Contracts (`users`)

The `users` entity is **platform-owned** (personal-data rules apply, Doc-2 §3.2) and distinct from the organization tenant; its lifecycle and anonymization-on-departure (Architecture §5.7) are Identity-owned and must not be conflated with membership or organization lifecycle. The **authentication mechanism is out of scope (DC-4)** — these contracts cover the identity record, preferences, and 2FA *settings* only.

**`identity.update_user_profile.v1`** — Update User Profile & Preferences

- *Capability:* edit own profile fields, personal settings, and notification preferences (Doc-2 §3.2 `preferences_jsonb`).
- *Entity:* `users` · *Template:* 21.4 Command · *Actor:* User (self; no org context required for self-service).
- *AuthZ:* authenticated self (the acting user = subject); no tenant slug (personal record); not delegation-eligible.
- *State:* none (simple lifecycle; no §5 machine). · *Audit:* no — preference/profile edits are operational, not a Doc-2 §9 MUST-audit action.
- *Events:* none (§8). · *Idempotency:* required; dedup window `core.system_configuration.identity.user_update_dedup_window` [DC-5].
- *Source:* Architecture §5.1; Doc-2 §3.2/§10.2; Doc-4A §5, §14.

**`identity.update_user_2fa_settings.v1`** — Update 2FA Settings *(settings only — DC-4)*

- *Capability:* enable/disable the 2FA *preference* and recovery settings on the user record. **The 2FA challenge/verification mechanism is Supabase Auth infrastructure (DC-4) — not authored here.**
- *Entity:* `users` (`two_fa` settings, Doc-2 §10.2) · *Template:* 21.4 Command · *Actor:* User (self).
- *AuthZ:* authenticated self; not delegation-eligible.
- *State:* none. · *Audit:* account-security setting change — **no enumerated Doc-2 §9 user action** → bind to nearest by pointer; **[ESC-IDN-AUDIT]** (Appendix C). · *Events:* none.
- *Idempotency:* required [DC-5]. · *Source:* Architecture §5.1; Doc-2 §3.2; Doc-4A §5 (auth boundary), §14, §17.

**`identity.deactivate_own_account.v1`** — Deactivate / Depart (anonymize)

- *Capability:* user-initiated departure → `users` soft-delete + anonymization on departure (Architecture §5.7); requires prior ownership-succession on any org where the user is the last Owner (Last Owner Protection cross-check, §5.5).
- *Entity:* `users` · *Template:* 21.4 Command · *Actor:* User (self).
- *AuthZ:* authenticated self; guard: no org left without an active Owner (§5.5).
- *State:* `active → soft-deleted` (simple lifecycle; anonymizable). · *Audit:* yes → anonymization follows the §14.3 / Architecture §14.3 compliance-redaction model; **no enumerated §9 user action** → **[ESC-IDN-AUDIT]**.
- *Events:* none (§8); any membership/ownership consequence is in-module (memberships) — cross-module effects, if any, are **[DC-1]**. · *Idempotency:* required [DC-5].
- *Source:* Architecture §5.7, §5.5; Doc-2 §3.2; Doc-4A §14, §17.

**`identity.set_user_account_status.v1`** — Suspend / Reinstate User *(platform governance)*

- *Capability:* platform-staff suspension/reinstatement of a user account (`active ⇄ suspended`).
- *Entity:* `users` · *Template:* **21.6 Admin** (no active org context, §5.6) · *Actor:* Admin.
- *AuthZ:* `staff_super_admin` (Doc-2 §7, existing) as the authoritative interim per **DC-3 / D-2**; finer `staff_*` slug is a future Doc-2 §7 additive — not invented.
- *State:* `active ⇄ suspended` (simple lifecycle). · *Audit:* yes → Doc-2 §9 Platform ("Super Admin access (flagged)" / "service-role sensitive operations") by pointer; user-status action not separately enumerated → **[ESC-IDN-AUDIT]**.
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.1; Doc-4A §5.6, §14, §17; Doc-2 §7, §9.

*Source bindings:* Architecture §5.1, §5.5, §5.7; Doc-2 §3.2, §10.2; Doc-4A §5 (authentication boundary), §5.6, §14, §17. *Detail level:* per-capability purpose + template + source pointer.

---

## §C5 — Organization Contracts (`organizations`)

The `organizations` entity is the **tenant root** (Doc-2 §3.2). Its §5.1 state machine, owner-protection invariants, and cross-module cascade are the highest-stakes identity workflows. State transitions are declared as **legal transitions only** (Doc-4A §13 — none invented). The cross-module cascade legs are **[DC-1]**.

**`identity.create_organization.v1`** — Create Organization

- *Capability:* create a tenant organization; includes the **Solo Trader Rule** auto-created Personal Organization (Architecture §5.2 — every user has ≥1 organization). Allocates `human_ref` (`ORG-…`) via Doc-4B `core.allocate_human_reference.v1`.
- *Entity:* `organizations` (+ founding `memberships` Owner row) · *Template:* 21.4 Command · *Actor:* User.
- *AuthZ:* authenticated user (creator becomes Owner); no pre-existing org slug required (bootstrap); not delegation-eligible.
- *State:* `→ active` (Doc-2 §5.1 entry). · *Audit:* yes → Doc-2 §9 Organization "create" via `core.append_audit_record.v1`.
- *Events:* none (§8). · *Idempotency:* required; dedup window [DC-5]. · *Consumes:* Doc-4B `core.allocate_human_reference.v1` (within this command's transaction).
- *Source:* Architecture §5.2; Doc-2 §3.2/§5.1/§9/§10.2; ADR-015; Doc-4A §8, §13, §14.

**`identity.update_organization_profile.v1`** — Update Organization Profile

- *Capability:* edit org details (name, address, contact, brand-asset references; Doc-2 §2 value objects).
- *Entity:* `organizations` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* active Membership + active-org Scope + organization-administration slug. **Doc-2 §7 minimal set names no `can_manage_organization` slug → [ESC-IDN-SLUG]** (Appendix C); interim Owner/Director authority. Not delegation-eligible.
- *State:* none (attribute edit; not a §5.1 transition). · *Audit:* yes → Doc-2 §9 Organization domain (org-profile change) by pointer.
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.1; Doc-2 §3.2/§9; Doc-4A §6.2, §13, §14.

**`identity.transfer_ownership.v1`** — Transfer Ownership / Succession

- *Capability:* ownership succession/transfer with **Last Owner Protection** (≥1 active Owner always) and audit + reason code + approver (Architecture §5.5) bound as validation/business rules by pointer.
- *Entity:* `organizations`, `memberships` (Owner role reassignment) · *Template:* 21.4 Command · *Actor:* User (Owner).
- *AuthZ:* active Membership + **`can_transfer_ownership`** (Doc-2 §7, Owner-only) + active-org Scope; not delegation-eligible (ownership-class action never delegable — §5.10 guard).
- *State:* no `organizations` §5.1 transition; reassigns membership Owner (§5.2 context). · *Audit:* yes → Doc-2 §9 Organization "ownership change/succession".
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.5; Doc-2 §3.2/§5.2/§7/§9; ADR-015; Doc-4A §13, §14.

**`identity.soft_delete_organization.v1`** — Soft-Delete Organization

- *Capability:* Owner-initiated soft-delete with cascade (Doc-2 §5.1). **In-module leg (authored):** memberships → soft-deleted. **Cross-module legs (BLOCKED):** vendor profile → suspended (Module 2); RFQs → archived (Module 3) — **[DC-1]**; quotations preserved.
- *Entity:* `organizations` (+ in-module `memberships`) · *Template:* 21.4 Command · *Actor:* User (Owner).
- *AuthZ:* active Membership + **`can_delete_organization`** (Doc-2 §7, Owner-only) + active-org Scope.
- *State:* `active|suspended → soft_deleted` (Doc-2 §5.1). · *Audit:* yes → Doc-2 §9 Organization "soft delete/restore".
- *Events:* **none — §8 designates no `identity` event**; the cross-module cascade therefore has no emitter → **[DC-1]** (Template 21.2 not instantiated, §C2.3). · *Idempotency:* required [DC-5].
- *Source:* Architecture §5.7; Doc-2 §5.1/§9; Doc-4A §13, §14, §16.

**`identity.restore_organization.v1`** — Restore Organization

- *Capability:* restore a soft-deleted organization (`soft_deleted → active`); restore-conflict rule regenerates reused slugs (Doc-2 §5.1).
- *Entity:* `organizations` · *Template:* 21.4 Command · *Actor:* User (Owner) or Admin recovery.
- *AuthZ:* `can_delete_organization` (Owner) for self-restore, or Admin path (`staff_super_admin`, DC-3); not delegation-eligible.
- *State:* `soft_deleted → active` (Doc-2 §5.1). · *Audit:* yes → Doc-2 §9 Organization "soft delete/restore".
- *Events:* none (§8); reactivation of cross-module dependents is **[DC-1]**. · *Idempotency:* required [DC-5].
- *Source:* Architecture §5.7; Doc-2 §5.1/§9; Doc-4A §13, §14.

**`identity.set_organization_status.v1`** — Suspend / Reinstate Organization *(platform governance)*

- *Capability:* platform-governance suspension/reinstatement (`active ⇄ suspended`, Doc-2 §5.1).
- *Entity:* `organizations` · *Template:* **21.6 Admin** (no active org context, §5.6) · *Actor:* Admin.
- *AuthZ:* `staff_super_admin` (Doc-2 §7, existing) — authoritative interim per **DC-3 / D-2**; finer `staff_*` slug is a future Doc-2 §7 additive — not invented.
- *State:* `active ⇄ suspended` (Doc-2 §5.1). · *Audit:* yes → Doc-2 §9 Organization domain + Platform "Super Admin access (flagged)"; org suspend/reinstate not separately enumerated → **[ESC-IDN-AUDIT]**.
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.1; Doc-4A §5.6, §13, §14, §17; Doc-2 §7, §9.

**`identity.admin_recover_ownership.v1`** — Ownership-Succession Recovery *(platform governance)*

- *Capability:* admin recovery of organization ownership where no active Owner can act (Architecture §5.5 recovery path).
- *Entity:* `organizations`, `memberships` · *Template:* **21.6 Admin** (§5.6) · *Actor:* Admin.
- *AuthZ:* `staff_super_admin` (existing) — interim per **DC-3 / D-2**; not invented.
- *State:* membership Owner reassignment (§5.2). · *Audit:* yes → Doc-2 §9 Organization "ownership change/succession".
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.5; Doc-2 §5.2/§9; Doc-4A §5.6, §14, §17.

*Source bindings:* Architecture §5.2, §5.5, §5.7; Doc-2 §5.1, §3.2, §9; Doc-4A §13. *Detail level:* per-capability purpose + template + §5.1 state-machine binding (no restatement) + cascade-integration reference (DC-1).

---

## §C6 — Membership Contracts (`memberships`)

`memberships` (tenant-owned) is the link entity that gates all tenant access; its §5.2 lifecycle directly drives the authorization model (§C3 / §C8). Only `active` membership participates in the access formula (Doc-4A §6.1).

**`identity.invite_member.v1`** — Invite Member

- *Capability:* issue a membership invitation → state `invited`.
- *Entity:* `memberships` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* active Membership + **`can_manage_users`** (Doc-2 §7) + active-org Scope; not delegation-eligible.
- *State:* Doc-2 §5.2 `→ invited` (legal transition only; §13). · *Audit:* yes → Doc-2 §9 Organization "membership invite".
- *Events:* none (§8 — no `identity` emitter); notification fan-out is **not** an identity event → **[DC-1]** if cross-module dispatch is required. · *Idempotency:* required; window `…identity.membership_invite_dedup_window` [DC-5].
- *Source:* Architecture §5.4; Doc-2 §5.2/§3.2/§9; Doc-4A §6.1, §13, §14.

**`identity.accept_invitation.v1`** — Accept Invitation

- *Capability:* invitee accepts → `invited → pending`.
- *Entity:* `memberships` · *Template:* 21.4 Command · *Actor:* User (the invitee).
- *AuthZ:* authenticated invitee bound to the invitation (token/identity match); not a slug-gated org action.
- *State:* Doc-2 §5.2 `invited → pending`. · *Audit:* yes → Doc-2 §9 Organization "membership accept".
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.4; Doc-2 §5.2/§9; Doc-4A §13, §14.

**`identity.activate_membership.v1`** — Activate Membership

- *Capability:* `pending → active` on "verification complete" (Doc-2 §5.2). The account-verification *signal* is infra (DC-4); this contract effects the Identity-side transition.
- *Entity:* `memberships` · *Template:* 21.4 Command · *Actor:* System or User context (per verification source; DC-4 boundary).
- *AuthZ:* predicated on the verification-complete precondition; no tenant slug for the subject's own activation.
- *State:* Doc-2 §5.2 `pending → active`. · *Audit:* yes → Doc-2 §9 Organization (membership activation) by pointer.
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.4; Doc-2 §5.2; Doc-4A §5 (auth boundary), §13, §14.

**`identity.set_membership_status.v1`** — Suspend / Reinstate Membership

- *Capability:* `active ⇄ suspended` (Doc-2 §5.2).
- *Entity:* `memberships` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* active Membership + **`can_manage_users`** (Doc-2 §7) + active-org Scope.
- *State:* Doc-2 §5.2 `active ⇄ suspended`. · *Audit:* yes → Doc-2 §9 Organization "membership suspend".
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.4; Doc-2 §5.2/§9; Doc-4A §6.1, §13, §14.

**`identity.remove_member.v1`** — Remove Member

- *Capability:* `active|suspended → removed` (terminal; audit retained). Last Owner Protection guard (§5.5) — cannot remove the last active Owner without succession.
- *Entity:* `memberships` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* active Membership + **`can_manage_users`** (Doc-2 §7) + active-org Scope; terminal state never reopens (§13).
- *State:* Doc-2 §5.2 `→ removed` (terminal). · *Audit:* yes → Doc-2 §9 Organization "membership remove".
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.4, §5.5; Doc-2 §5.2/§9; Doc-4A §13, §14.

**`identity.revoke_invitation.v1`** — Revoke Invitation

- *Capability:* `invited → revoke → removed` (terminal) before acceptance.
- *Entity:* `memberships` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* active Membership + **`can_manage_users`** (Doc-2 §7) + active-org Scope.
- *State:* Doc-2 §5.2 `invited → removed`. · *Audit:* yes → Doc-2 §9 Organization "membership remove".
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Doc-2 §5.2/§9; Doc-4A §13, §14.

**`identity.expire_invitation.v1`** — Expire Invitation *(System timer)*

- *Capability:* `invited → expire → removed` when the invite window lapses.
- *Entity:* `memberships` · *Template:* **21.5 System** (`Response: none`) · *Actor:* System.
- *AuthZ:* System actor; platform scope; not user-invocable (§13 System transitions).
- *State:* Doc-2 §5.2 `invited → removed` (via expire). · *Audit:* yes → Doc-2 §9 Organization "membership remove" (System attribution, §17.3).
- *Events:* none (§8). · *Idempotency:* required (platform scope). · *Timer window:* `core.system_configuration.identity.membership_invite_expiry_window` **[DC-5]**.
- *Source:* Architecture §5.4; Doc-2 §5.2/§9; Doc-4A §13, §14, §18.2.

*Source bindings:* Architecture §5.4; Doc-2 §5.2, §3.2, §9; Doc-4A §6.1, §13. *Detail level:* per-capability purpose + template + §5.2 state-machine binding.

---

## §C7 — Role & Permission Contracts (`roles`, `role_permissions`, `permissions`)

`roles` and `role_permissions` are **tenant-owned** bundles; `permissions` is the **platform-owned slug catalog** (read/list only — owned by Doc-2 §7, **never extended here**, Doc-4A §6.4). Roles are **bundles**; authorization checks use **slugs only** (Doc-4A §6.2) — *a role is never a permission*. Role *assignment to a member* is carried on `memberships.role_id` (managed under §C6 `can_manage_users`); this section governs role *bundles* and the *catalog read*.

**`identity.list_permissions.v1`** — List Permission Catalog

- *Capability:* read the platform permission slug catalog (`slug`, `description`, `space` tenant/staff; Doc-2 §10.2). **Read/list only** — the catalog is never extended by Module 1 (§6.4).
- *Entity:* `permissions` (platform-owned) · *Template:* 21.3 Query · *Actor:* User / internal-service.
- *AuthZ:* authenticated; catalog is reference data. · *State:* none. · *Audit:* no (read). · *Events:* none. · *Idempotency:* n/a.
- *Source:* Doc-2 §3.2/§7/§10.2; Doc-4A §6.2, §6.4.

**`identity.list_roles.v1`** — List Roles

- *Capability:* list an organization's role bundles (system seeds + org-custom; Doc-2 §10.2 `is_system_bundle`).
- *Entity:* `roles` (tenant-owned) · *Template:* 21.3 Query · *Actor:* User (active org context).
- *AuthZ:* active Membership + active-org Scope (read). · *State:* none. · *Audit:* no. · *Events:* none. · *Idempotency:* n/a.
- *Source:* Architecture §13.3; Doc-2 §3.2/§10.2; Doc-4A §6.2, §7.

**`identity.create_role.v1`** — Create Role Bundle

- *Capability:* create an org-custom role bundle (Owner/Director/Manager/Officer are platform seeds; Architecture §13.3).
- *Entity:* `roles` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* active Membership + active-org Scope + access-administration slug. **Bound to `can_manage_users` interim** (team/access administration, O,D); a dedicated least-privilege `can_manage_roles` is a future Doc-2 §7 additive → **[ESC-IDN-SLUG]**. Not delegation-eligible.
- *State:* simple (create). · *Audit:* yes → Doc-2 §9 Organization "role/permission change". · *Events:* none (§8). · *Idempotency:* required [DC-5].
- *Source:* Architecture §13.3; Doc-2 §3.2/§7/§9; Doc-4A §6.2, §6.4, §14.

**`identity.update_role.v1`** — Update Role Bundle

- *Capability:* edit a custom role's metadata (name); system bundles are protected.
- *Entity:* `roles` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* `can_manage_users` interim + **[ESC-IDN-SLUG]** (`can_manage_roles` additive); system-bundle edit guarded.
- *State:* simple. · *Audit:* yes → Doc-2 §9 Organization "role/permission change". · *Events:* none. · *Idempotency:* required [DC-5].
- *Source:* Architecture §13.3; Doc-2 §3.2/§9; Doc-4A §6.2, §14.

**`identity.set_role_permissions.v1`** — Compose Role Permissions

- *Capability:* add/remove permission slugs in a role bundle (`role_permissions` N:N; row removal = revoked, audited; Doc-2 §10.2). Slugs must exist in the catalog (§6.4) — never coined.
- *Entity:* `role_permissions` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* `can_manage_users` interim + **[ESC-IDN-SLUG]**; assigned slugs validated against the platform catalog (REFERENCE; §6.4).
- *State:* simple (rows added/removed). · *Audit:* yes → Doc-2 §9 Organization "role/permission change". · *Events:* none. · *Idempotency:* required [DC-5].
- *Source:* Doc-2 §3.2/§7/§9/§10.2; Doc-4A §6.2, §6.4, §14.

**`identity.delete_role.v1`** — Delete Role Bundle

- *Capability:* soft-delete an org-custom role (system bundles protected; members reassigned per service guard).
- *Entity:* `roles` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* `can_manage_users` interim + **[ESC-IDN-SLUG]**; guard against deleting a role still bound to active members.
- *State:* simple (soft-delete). · *Audit:* yes → Doc-2 §9 Organization "role/permission change". · *Events:* none. · *Idempotency:* required [DC-5].
- *Source:* Doc-2 §3.2/§9/§10.2; Doc-4A §6.2, §14.

*Source bindings:* Architecture §13.3 (role bundles); Doc-2 §3.2, §7, §9; Doc-4A §6.2, §6.4. *Detail level:* per-capability purpose + template + slug-only authorization binding.

---

## §C8 — Authorization & Active-Organization Context

This is Identity's **defining responsibility**: the authorization and tenancy-context root the entire platform depends on. It **binds to** Doc-4A §5/§6/§6B and **does not redefine** them — it authors Identity's *implementation surface*. The authoritative-source rule (§C3) applies to the Check Permission resolution.

**Check Permission resolution** is authored once in **§C3 (`identity.check_permission.v1`)** — the Identity-side authority for the §6 three-layer check (active Membership + Permission Slug + Resource Scope, OR active Delegation Grant per §6B). It is **referenced, not duplicated**, here (prevents duplicated permission resolution / shadow authorization).

**`identity.switch_active_organization.v1`** — Switch Active Organization

- *Capability:* the **active-organization context-switch mechanism owned by Identity** (Doc-4A §5.3 — "owned by Identity (Doc-4C)"): set the session's active organization. Context is **server-validated, never client-asserted** (Architecture §5).
- *Entity:* `memberships` (validates active membership in target org) · *Template:* 21.4 Command · *Actor:* User.
- *AuthZ:* must hold an **active** membership in the target organization (§6.1); server validates and binds context (§5.3); not delegation-eligible (context selection, not an act-as path).
- *State:* none (session context; no entity §5 transition). · *Audit:* no — context selection is operational, not a Doc-2 §9 business action.
- *Events:* none (§8). · *Idempotency:* not-applicable (idempotent by nature; setting the same context is a no-op).
- *Source:* Architecture §5; Doc-4A §5.3, §6.1.

**`identity.get_active_context.v1`** — Get Active Context

- *Capability:* resolve the caller's current active-org context + effective authorization summary for the session (server-validated).
- *Entity:* `memberships`, `roles`, `role_permissions` (read) · *Template:* 21.3 Query · *Actor:* User.
- *AuthZ:* authenticated; returns only the caller's own context (§7). · *State:* none. · *Audit:* no (read). · *Events:* none. · *Idempotency:* n/a.
- *Source:* Architecture §5; Doc-4A §5.3, §6, §7.

**`identity.list_my_organizations.v1`** — List My Organizations

- *Capability:* list organizations in which the caller holds an active membership (the context-switcher source list; Solo Trader guarantees ≥1).
- *Entity:* `memberships`, `organizations` (read) · *Template:* 21.3 Query · *Actor:* User.
- *AuthZ:* authenticated self; tenancy-respecting (§7). · *State:* none. · *Audit:* no. · *Events:* none. · *Idempotency:* n/a.
- *Source:* Architecture §5.2, §5.3; Doc-2 §5.2; Doc-4A §5.3, §7.

*Source bindings:* Architecture §5, §16.2; Doc-4A §5, §5.3, §6, §6B, §7. *Detail level:* full per-capability purpose + template + binding to the frozen authorization/context standards. No reimplementation of the standard.

---

## §C9 — Delegation Grant Contracts (`delegation_grants`)

`delegation_grants` is a **shared dual-party record** (both party orgs read; **only the controlling organization manages** — Doc-2 §10.2). Delegation is the platform's most unusual authorization path: one org acts for a vendor profile it does not control. All grant management **binds to the Doc-4A §6B Delegation Grant Declaration Standard** (eligibility, the five-condition delegated-access check, four-attribution rule, suspension/revocation behavior) — **Doc-4C does not redefine §6B**. The §5.10 state machine is declared as legal transitions only. **Grants delegate authority; they never create it** and never cover ownership-class actions (Doc-2 §5.10 guard).

**`identity.create_delegation_grant.v1`** — Issue Delegation Grant

- *Capability:* `draft → active` (grant) by the controlling org, scoped to a `vendor_profile_id` with a `permission_set` (JSONB array of slugs; Doc-2 §2). `controlling_organization_id` validated at issue against the Vendor Service (Doc-2 §10.2). Grant validity defaults are POLICY **[DC-5]**.
- *Entity:* `delegation_grants` (shared) · *Template:* 21.4 Command · *Actor:* User (controlling org context).
- *AuthZ:* active Membership + **`can_manage_delegations`** (Doc-2 §7, O,D) + active-org Scope = controlling org; bound to §6B eligibility. `vendor_profile_id` is a bare UUID ref (not owned — §C1.2).
- *State:* Doc-2 §5.10 `draft → active`. · *Audit:* yes → Doc-2 §9 **Vendor profile** domain "delegation grant issue" (pointer) via `core.append_audit_record.v1`.
- *Events:* none (§8). · *Idempotency:* required; validity-default + dedup windows **[DC-5]**.
- *Source:* Architecture §6.5, §7.3–7.4; ADR-005; Doc-2 §5.10/§3.2/§6/§9/§10.2; Doc-4A §6B, §13, §14.

**`identity.suspend_delegation_grant.v1`** — Suspend Delegation Grant

- *Capability:* `active → suspended` by the controlling org (§6B suspension behavior).
- *Entity:* `delegation_grants` · *Template:* 21.4 Command · *Actor:* User (controlling org).
- *AuthZ:* active Membership + **`can_manage_delegations`** + Scope = controlling org (§6B).
- *State:* Doc-2 §5.10 `active → suspended`. · *Audit:* yes → Doc-2 §9 Vendor profile "delegation grant suspend".
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* ADR-005; Doc-2 §5.10/§9; Doc-4A §6B, §13.

**`identity.reinstate_delegation_grant.v1`** — Reinstate Delegation Grant

- *Capability:* `suspended → active` by the controlling org.
- *Entity:* `delegation_grants` · *Template:* 21.4 Command · *Actor:* User (controlling org).
- *AuthZ:* active Membership + **`can_manage_delegations`** + Scope = controlling org (§6B).
- *State:* Doc-2 §5.10 `suspended → active`. · *Audit:* yes → Doc-2 §9 Vendor profile (delegation suspend/reinstate pair) by pointer.
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* ADR-005; Doc-2 §5.10/§9; Doc-4A §6B, §13.

**`identity.revoke_delegation_grant.v1`** — Revoke Delegation Grant

- *Capability:* `active|suspended → revoked` (terminal) by the controlling org. **Revocation effect** removes derived `rfq_invitation_grantees` + visibility rows for that representative (Doc-2 §5.10) — a **Module 3 cross-module teardown → [DC-1]** (Template 21.2 not instantiated, §C2.3). In-module: grant status → revoked.
- *Entity:* `delegation_grants` · *Template:* 21.4 Command · *Actor:* User (controlling org).
- *AuthZ:* active Membership + **`can_manage_delegations`** + Scope = controlling org; terminal state never reopens (§13).
- *State:* Doc-2 §5.10 `→ revoked` (terminal). · *Audit:* yes → Doc-2 §9 Vendor profile "delegation grant revoke" (teardown removals audited, §5.10).
- *Events:* **none — §8 designates no `identity` event**; cross-module teardown has no emitter → **[DC-1]**. · *Idempotency:* required [DC-5].
- *Source:* ADR-005; Doc-2 §5.10/§9; Doc-4A §6B, §13, §14, §16.

**`identity.expire_delegation_grant.v1`** — Expire Delegation Grant *(System timer)*

- *Capability:* `active → expired` (terminal) when `valid_to` passes; same grantee/visibility teardown as revocation → **[DC-1]**.
- *Entity:* `delegation_grants` · *Template:* **21.5 System** (`Response: none`) · *Actor:* System.
- *AuthZ:* System actor; platform scope; not user-invocable (§13). · *State:* Doc-2 §5.10 `active → expired` (terminal).
- *Audit:* yes → Doc-2 §9 Vendor profile (delegation revoke/expiry family) by pointer (System attribution, §17.3).
- *Events:* none (§8); teardown → **[DC-1]**. · *Idempotency:* required (platform scope). · *Timer window:* `core.system_configuration.identity.delegation_validity_default` / expiry sweep cadence **[DC-5]**.
- *Source:* ADR-005; Doc-2 §5.10/§9; Doc-4A §6B, §13, §18.2.

**`identity.get_delegation_grant.v1`** — Get Delegation Grant

- *Capability:* read a single grant (dual-party — both controlling and representative orgs may read; Doc-2 §10.2 RLS `organization_id IN (controlling, representative)`).
- *Entity:* `delegation_grants` · *Template:* 21.3 Query · *Actor:* User (either party org).
- *AuthZ:* active Membership in a party org + Scope; non-disclosure beyond parties (§7). · *State:* reads §5.10 (no transition). · *Audit:* no (read). · *Events:* none. · *Idempotency:* n/a.
- *Source:* ADR-005; Doc-2 §5.10/§6/§10.2; Doc-4A §6B, §7.

**`identity.list_delegation_grants.v1`** — List Delegation Grants

- *Capability:* list grants where the active org is controlling or representative (dual-party scope).
- *Entity:* `delegation_grants` · *Template:* 21.3 Query · *Actor:* User (party org).
- *AuthZ:* active Membership + Scope (party-org filter; §7). · *State:* none. · *Audit:* no. · *Events:* none. · *Idempotency:* n/a.
- *Source:* ADR-005; Doc-2 §5.10/§6/§10.2; Doc-4A §6B, §7.

*Source bindings:* Architecture §6.5, §7.3–7.4; ADR-005; Doc-2 §5.10, §3.2, §6, §9; Doc-4A §6B. *Detail level:* per-capability purpose + template + §5.10 state-machine binding + §6B delegation binding + revocation-teardown reference (DC-1).

---

## §C10 — Buyer Profile Contracts (`buyer_profiles`)

`buyer_profiles` is **tenant-owned and optional** (Doc-2 §3.2): procurement preferences, industry, factory information, delivery locations, approval settings (Architecture §5.3). It **enhances matching/procurement** (read by Module 3) but is **owned and edited only by the organization** — Module 3 reads it via an Identity service, never by direct table access (One Entity = One Owner; no cross-module ownership).

**`identity.upsert_buyer_profile.v1`** — Create / Update Buyer Profile

- *Capability:* create or update the organization's buyer profile (`industry`, `factory_info`, `delivery_locations`, `procurement_preferences` — Doc-2 §10.2).
- *Entity:* `buyer_profiles` (tenant-owned) · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* active Membership + active-org Scope + buyer-profile-administration slug. **Doc-2 §7 minimal set names no dedicated buyer-profile slug → [ESC-IDN-SLUG]**; interim Owner/Director authority. Not delegation-eligible.
- *State:* simple (upsert). · *Audit:* yes → Doc-2 §9 Organization domain (buyer-profile change) by pointer; not separately enumerated → **[ESC-IDN-AUDIT]**.
- *Events:* none (§8). · *Idempotency:* required [DC-5]. · *Source:* Architecture §5.3; Doc-2 §3.2/§6/§9/§10.2; Doc-4A §14.

**`identity.get_buyer_profile.v1`** — Get Buyer Profile

- *Capability:* read the buyer profile; consumed by Module 3 (RFQ matching/procurement) **via this Identity service** (Audience: internal-service, D-1) and by the owning org.
- *Entity:* `buyer_profiles` · *Template:* 21.3 Query (internal-service) · *Actor:* User / internal-service.
- *AuthZ:* owning-org Scope for org reads; internal-service caller-context for Module 3 (§7); no shadow ownership in the consumer. · *State:* none. · *Audit:* no (read). · *Events:* none. · *Idempotency:* n/a.
- *Source:* Architecture §5.3; Doc-2 §3.2/§6/§10.2; Doc-4A §7.

*Source bindings:* Architecture §5.3; Doc-2 §3.2, §6, §9. *Detail level:* per-capability purpose + template + source pointer.

---

## §C11 — Organization Workflow Settings Contracts (`organization_workflow_settings`)

`organization_workflow_settings` is **tenant-owned** and is the **ORG** leg of the FIXED/POLICY/ORG trichotomy (Doc-4A §18.4 / Doc-3 §12.3): RFQ approval mode and chain, financial/award approval thresholds, notification rules, default routing mode, buyer-courtesy options. These are **ORG settings** read per-organization at runtime (bounded by POLICY where Doc-3 §12.3 defines), **consumed by other modules** (RFQ approval gate — Module 3; notification rules — Module 6). A workflow setting **may add required approvals but never remove a required slug** (Doc-4A §6.2) — it cannot weaken a FIXED authorization requirement. ORG settings are distinct from POLICY (Module 0) and FIXED rules.

**`identity.get_workflow_settings.v1`** — Get Workflow Settings

- *Capability:* read an organization's workflow settings for runtime consumption (RFQ approval gate, notification fan-out). The **mechanism is frozen** (Doc-3 §12.3); the *values* are ORG-tunable within POLICY bounds.
- *Entity:* `organization_workflow_settings` · *Template:* 21.3 Query (internal-service) · *Actor:* User / internal-service (Modules 3, 6).
- *AuthZ:* owning-org Scope; internal-service caller-context for consumers (§7); consumers read, never own. · *State:* none. · *Audit:* no (read). · *Events:* none. · *Idempotency:* n/a.
- *Source:* Architecture §13.4; Doc-3 §12.3; Doc-2 §3.2/§10.2; Doc-4A §18.4.

**`identity.update_workflow_settings.v1`** — Update Workflow Settings

- *Capability:* edit RFQ approval mode/chain, financial/award thresholds, notification rules, default routing mode, buyer-courtesy options (Doc-2 §10.2 `rfq_approval_mode`, `approval_chain_jsonb`, `financial_permissions_jsonb`, `notification_rules_jsonb`).
- *Entity:* `organization_workflow_settings` · *Template:* 21.4 Command · *Actor:* User (active org context).
- *AuthZ:* active Membership + **`can_manage_workflow_settings`** (Doc-2 §7, O,D) + active-org Scope; ORG values must stay within POLICY bounds (§18.4) and may strengthen but never weaken FIXED authz (§6.2).
- *State:* simple. · *Audit:* yes → Doc-2 §9 Organization "workflow settings change". · *Events:* none (§8). · *Idempotency:* required [DC-5].
- *Source:* Architecture §13.4; Doc-3 §12.3, §12.4; Doc-2 §3.2/§9/§10.2; Doc-4A §6.2, §18.4, §14.

*Source bindings:* Architecture §13.4; Doc-3 §12.3; Doc-2 §3.2, §6, §9; Doc-4A §18.4, §6.2. *Detail level:* per-capability purpose + template + ORG-setting binding.

---

## §C12 — Cross-Cutting Declarations for Identity Contracts

Stated **once**, these are the declaration defaults every Doc-4C contract above inherits (preventing per-contract drift). They restate **no** Doc-4A grammar — they bind to it.

### C12.1 — Actor model

- **User** (primary): tenant business operations within a **server-validated active organization context** (Doc-4A §5.3). The default actor for §C4–§C11 commands/queries.
- **Admin** (platform governance): organization suspend/reinstate (§5.1), ownership-succession recovery (§5.5), user account suspend/reinstate — **Template 21.6**, **no active org context** (§5.6). Binds to existing `staff_*` slugs per **DC-3 / D-2** (`staff_super_admin` interim; finer slugs are a future Doc-2 §7 additive — not invented).
- **System** (Phase-2 timers): membership-invite expiry (§5.2) and delegation-grant expiry (§5.10) — **Template 21.5**, `Response: none`, not user-invocable (§13). Timer windows are `identity.*` POLICY keys **[DC-5]**.
- **internal-service** (D-1 composition): the §C3 shared services + `get_workflow_settings` + `get_buyer_profile`, consumed cross-module as 21.3 with `Audience: internal-service` (consumption channel only; authoritativeness undiminished).

### C12.2 — Tenancy per entity (Doc-2 §6 — by pointer)

`users`, `permissions` = **platform-owned**; `organizations` = **tenant root**; `memberships`, `roles`, `role_permissions`, `buyer_profiles`, `organization_workflow_settings` = **tenant-owned** (RLS `organization_id = active org`); `delegation_grants` = **shared** (RLS `organization_id IN (controlling, representative)`). Cross-module references (`vendor_profile_id`, etc.) are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3).

### C12.3 — Audit binding (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`)

Identity audit binds to the **Doc-2 §9 Organization domain** (create, membership invite/accept/suspend/remove, role/permission change, ownership change/succession, workflow settings change, soft delete/restore) **plus the delegation actions enumerated in the §9 Vendor profile domain** (delegation grant issue/suspend/revoke). Audit is **immutable and never bypassed** (Architecture §14; Doc-4A §17), written **within the contract's transaction** via the Doc-4B mechanism (never re-implemented — no duplicated audit definitions). Audit ≠ events. **Reads are not audited** (operational; §17.1). **[ESC-IDN-AUDIT]** (Appendix C): Doc-2 §9 does not separately enumerate user-account suspend/reinstate, user anonymization-on-departure, organization suspend/reinstate, 2FA-settings change, or buyer-profile change — interim bound to the nearest §9 domain/Platform action by pointer; escalated for a Doc-2 §9 additive; **not invented**.

### C12.4 — Events posture (Doc-2 §8)

**Module 1 produces no domain events** — Doc-2 §8 designates **no `identity` emitter**. The default on every contract is **`Events-Produced: none`**, and Identity is **query-driven** (§C3). Identity authors **no `Events-Consumed`** in Pass-A. Any required cross-module synchronization (organization soft-delete cascade to Modules 2/3; delegation revocation/expiry teardown in Module 3) is integration dependency **[DC-1]** — resolved only by a Board decision (service-call integration per §4.2/§4.4, or a Doc-2 §8 identity-event addition), **never an invented event** (§16.4). Template 21.2 is not instantiated for these legs (§C2.3).

### C12.5 — Idempotency (Doc-4A §14)

Every **mutating** contract declares `Idempotency: required` with a dedup-window POLICY key (`core.system_configuration.identity.*` **[DC-5]**); the §14.3 joint rule holds on replay (same result, no duplicate audit record, no duplicate side effect). Queries declare `not-applicable`; the active-org switch is idempotent by nature.

### C12.6 — Error namespace & firewall

- **Error codes:** `identity_<domain>_<code>` (Doc-4A Appendix B §B.2); protected-fact failures collapse to NOT_FOUND (indistinguishability, §7.5/§12.4). Concrete registers are Pass-B.
- **Governance-signal firewall (§4B):** Identity contracts touch **no governance signal** (Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer-Vendor Status). The **Firewall-Compliance Declaration default is `none`** — no identity contract reads, writes, or gates any signal, and **no paid plan / entitlement / config gates identity authorization, membership, or delegation** (§18.3, §4B).

### C12.7 — Doc-4B Platform Core consumption (by pointer; never re-implemented)

| Doc-4B service | Consumed by Identity for |
|---|---|
| `core.append_audit_record.v1` (audit-write §17) | every mutating contract's audit (§C12.3) |
| `core.allocate_human_reference.v1` (§8) | `create_organization` (`ORG-…` allocation) only — no other identity entity carries `human_ref` |
| UUIDv7 generation (algorithmic; §8 — no contract) | every create (machine IDs) |
| `core.config_value_query.v1` (POLICY resolution §18) | dedup windows, invite/grant validity timers, ORG-setting POLICY bounds **[DC-5 keys pending]** |
| `core.feature_flag_evaluate.v1` | optional rollout gating (visibility only; never a firewall concern, §18.3) |
| `core.write_outbox_event.v1` (§16) | **not consumed** — Module 1 emits no events (§C12.4) |

*Source bindings:* Doc-4A §5, §5.6, §7, §14, §16, §17, §4B; Doc-2 §6, §8, §9; Doc-4B (audit-write, ID allocation, POLICY resolution, flag evaluation — consumed by pointer). *Detail level:* normative declaration defaults. No restatement of Doc-4A grammar.

---

## Appendix A — Module 1 Contract Inventory (Pass-A authoring worklist)

One row per planned contract: working Contract-ID, owned entity, frozen template, actor, primary authoritative source, and dependency/escalation markers. Contract IDs use the `identity.` prefix; error codes the `identity_` prefix (Doc-4A Appendix B). **Skeleton + bindings only — no payloads** (Pass-B). **42 contracts across the 9 owned entities.**

**§C3 — Shared Identity Services**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.get_user.v1` | users | 21.3 (internal-svc) | internal-service | Arch §16.2; Doc-2 §3.2 | — |
| `identity.get_organization.v1` | organizations | 21.3 (internal-svc) | internal-service | Arch §16.2; Doc-2 §3.2 | — |
| `identity.get_membership.v1` | memberships | 21.3 (internal-svc) | internal-service | Doc-4A §6.1; Doc-2 §5.2 | — |
| `identity.check_permission.v1` | memberships/roles/role_permissions/permissions/delegation_grants | 21.3 (internal-svc) | internal-service | Doc-4A §6/§6B | authoritative-source rule |

**§C4 — User Contracts**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.update_user_profile.v1` | users | 21.4 | User (self) | Arch §5.1; Doc-2 §3.2 | DC-5 |
| `identity.update_user_2fa_settings.v1` | users | 21.4 | User (self) | Doc-4A §5; Arch §5.1 | DC-4, ESC-IDN-AUDIT, DC-5 |
| `identity.deactivate_own_account.v1` | users | 21.4 | User (self) | Arch §5.7, §5.5 | ESC-IDN-AUDIT, DC-5 |
| `identity.set_user_account_status.v1` | users | 21.6 Admin | Admin | Arch §5.1; Doc-4A §5.6 | DC-3, ESC-IDN-AUDIT, DC-5 |

**§C5 — Organization Contracts**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.create_organization.v1` | organizations (+founding membership) | 21.4 | User | Arch §5.2; Doc-2 §5.1; ADR-015 | DC-5; consumes `core.allocate_human_reference.v1` |
| `identity.update_organization_profile.v1` | organizations | 21.4 | User | Arch §5.1; Doc-2 §3.2 | ESC-IDN-SLUG, DC-5 |
| `identity.transfer_ownership.v1` | organizations/memberships | 21.4 | User (Owner) | Arch §5.5; Doc-2 §7 `can_transfer_ownership` | DC-5 |
| `identity.soft_delete_organization.v1` | organizations (+in-module memberships) | 21.4 | User (Owner) | Arch §5.7; Doc-2 §5.1; §7 `can_delete_organization` | DC-1 (cascade), DC-5 |
| `identity.restore_organization.v1` | organizations | 21.4 | User (Owner)/Admin | Arch §5.7; Doc-2 §5.1 | DC-1, DC-5 |
| `identity.set_organization_status.v1` | organizations | 21.6 Admin | Admin | Arch §5.1; Doc-2 §5.1 | DC-3, ESC-IDN-AUDIT, DC-5 |
| `identity.admin_recover_ownership.v1` | organizations/memberships | 21.6 Admin | Admin | Arch §5.5; Doc-2 §5.2 | DC-3, DC-5 |

**§C6 — Membership Contracts**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.invite_member.v1` | memberships | 21.4 | User | Arch §5.4; Doc-2 §5.2; §7 `can_manage_users` | DC-1 (notify), DC-5 |
| `identity.accept_invitation.v1` | memberships | 21.4 | User (invitee) | Doc-2 §5.2 | DC-5 |
| `identity.activate_membership.v1` | memberships | 21.4 | System/User | Doc-2 §5.2; Doc-4A §5 | DC-4, DC-5 |
| `identity.set_membership_status.v1` | memberships | 21.4 | User | Doc-2 §5.2; §7 `can_manage_users` | DC-5 |
| `identity.remove_member.v1` | memberships | 21.4 | User | Arch §5.5; Doc-2 §5.2; §7 `can_manage_users` | DC-5 |
| `identity.revoke_invitation.v1` | memberships | 21.4 | User | Doc-2 §5.2; §7 `can_manage_users` | DC-5 |
| `identity.expire_invitation.v1` | memberships | 21.5 System | System | Doc-2 §5.2; Doc-4A §18.2 | DC-5 (timer key) |

**§C7 — Role & Permission Contracts**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.list_permissions.v1` | permissions | 21.3 | User/internal | Doc-2 §7; Doc-4A §6.4 | read/list-only (catalog never extended) |
| `identity.list_roles.v1` | roles | 21.3 | User | Arch §13.3; Doc-2 §10.2 | — |
| `identity.create_role.v1` | roles | 21.4 | User | Arch §13.3; Doc-2 §7 | ESC-IDN-SLUG, DC-5 |
| `identity.update_role.v1` | roles | 21.4 | User | Arch §13.3; Doc-2 §9 | ESC-IDN-SLUG, DC-5 |
| `identity.set_role_permissions.v1` | role_permissions | 21.4 | User | Doc-2 §7; Doc-4A §6.4 | ESC-IDN-SLUG, DC-5 |
| `identity.delete_role.v1` | roles | 21.4 | User | Doc-2 §9/§10.2 | ESC-IDN-SLUG, DC-5 |

**§C8 — Authorization & Active-Organization Context**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.check_permission.v1` | *(authored in §C3)* | 21.3 (internal-svc) | internal-service | Doc-4A §5.3/§6/§6B | bound here; not duplicated |
| `identity.switch_active_organization.v1` | memberships (context) | 21.4 | User | Doc-4A §5.3; Arch §5 | — |
| `identity.get_active_context.v1` | memberships/roles/role_permissions | 21.3 | User | Doc-4A §5.3, §6 | — |
| `identity.list_my_organizations.v1` | memberships/organizations | 21.3 | User | Arch §5.2; Doc-4A §5.3 | — |

**§C9 — Delegation Grant Contracts**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.create_delegation_grant.v1` | delegation_grants | 21.4 | User (controlling) | ADR-005; Doc-2 §5.10; §7 `can_manage_delegations`; Doc-4A §6B | DC-5 (validity defaults) |
| `identity.suspend_delegation_grant.v1` | delegation_grants | 21.4 | User (controlling) | Doc-2 §5.10; Doc-4A §6B | DC-5 |
| `identity.reinstate_delegation_grant.v1` | delegation_grants | 21.4 | User (controlling) | Doc-2 §5.10; Doc-4A §6B | DC-5 |
| `identity.revoke_delegation_grant.v1` | delegation_grants | 21.4 | User (controlling) | Doc-2 §5.10; Doc-4A §6B | DC-1 (teardown), DC-5 |
| `identity.expire_delegation_grant.v1` | delegation_grants | 21.5 System | System | Doc-2 §5.10; Doc-4A §18.2 | DC-1 (teardown), DC-5 |
| `identity.get_delegation_grant.v1` | delegation_grants | 21.3 | User (party) | Doc-2 §5.10/§10.2; Doc-4A §6B | dual-party read |
| `identity.list_delegation_grants.v1` | delegation_grants | 21.3 | User (party) | Doc-2 §5.10/§6; Doc-4A §6B | dual-party scope |

**§C10 — Buyer Profile Contracts**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.upsert_buyer_profile.v1` | buyer_profiles | 21.4 | User | Arch §5.3; Doc-2 §3.2 | ESC-IDN-SLUG, ESC-IDN-AUDIT, DC-5 |
| `identity.get_buyer_profile.v1` | buyer_profiles | 21.3 (internal-svc) | User/internal | Arch §5.3; Doc-2 §6 | consumed by Module 3 (read-only) |

**§C11 — Organization Workflow Settings Contracts**

| Contract-ID | Entity | Template | Actor | Primary source | Markers |
|---|---|---|---|---|---|
| `identity.get_workflow_settings.v1` | organization_workflow_settings | 21.3 (internal-svc) | User/internal | Arch §13.4; Doc-3 §12.3; Doc-4A §18.4 | consumed by Modules 3, 6 |
| `identity.update_workflow_settings.v1` | organization_workflow_settings | 21.4 | User | Doc-2 §7 `can_manage_workflow_settings`; Doc-3 §12.3; Doc-4A §18.4 | DC-5 |

*§C12 authors cross-cutting declaration defaults; it instantiates no contract.*

---

## Appendix B — Doc-4A + Doc-4B Conformance Binding Map

Each Doc-4C section maps to the Doc-4A standard(s) and conformance-check families that govern it, and to the Doc-4B Platform Core services it consumes by pointer. **Doc-4C redefines none of them.**

| Doc-4C § | Doc-4A standards (governing check families) | Doc-4B services consumed (by pointer) |
|---|---|---|
| §C0 Control | §0 (precedence, flag-and-halt §0.6), §3.5 (citation) | — |
| §C1 Scope | §1.3 (family map), §4.1 (one-owner), §5 (auth boundary) | — |
| §C2 Templates | §21 (templates), §22.1 (reference_id mandate), §22.3 (selection rules), App A (checklist), App B (namespaces) | D-1 composition precedent |
| §C3 Shared services | §5, §6, §6B (authz resolution), §7 (non-disclosure/tenancy) | — (reads) |
| §C4 Users | §5 (auth boundary, DC-4), §5.6 (admin), §14 (idempotency), §17 (audit) | `core.append_audit_record.v1` |
| §C5 Organizations | §13 (state machines), §5.6 (admin), §14, §16 (events/DC-1), §17 | `core.append_audit_record.v1`, `core.allocate_human_reference.v1` |
| §C6 Memberships | §6.1 (access formula), §13, §14, §17 | `core.append_audit_record.v1`, `core.config_value_query.v1` (timer/dedup) |
| §C7 Roles & Permissions | §6.2 (slug-only), §6.4 (catalog not extended), §14, §17 | `core.append_audit_record.v1` |
| §C8 Authz & Context | §5.3 (active-org context, Identity-owned), §6/§6B, §7 | — (reads) |
| §C9 Delegation | §6B (delegation standard), §13 (§5.10 machine), §14, §16 (DC-1), §17 | `core.append_audit_record.v1`, `core.config_value_query.v1` |
| §C10 Buyer Profiles | §7 (tenancy/ownership), §14, §17 | `core.append_audit_record.v1` |
| §C11 Workflow Settings | §18.4 (ORG settings), §6.2 (never weaken FIXED authz), §14, §17 | `core.append_audit_record.v1`, `core.config_value_query.v1` (POLICY bounds) |
| §C12 Cross-cutting | §5/§5.6 (actors), §7, §14, §16, §17, §4B (firewall), App B (namespaces) | audit-write, ID allocation, POLICY resolution, flag evaluation |

**Affirmation:** Doc-4C consumes the Doc-4A standards and Doc-4B Platform Core services **by pointer only**. It coins no template, slug, event, audit action, or POLICY key, and re-implements no Doc-4B mechanism (no duplicated audit/policy/state/permission definitions; single owner per capability).

---

## Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers

These dependencies are **carried forward unchanged** from `Doc-4C_Structure_v1.0_FROZEN.md` Appendix C (authoritative). They remain **open**, are resolved **only** through their named channels, and **none is resolved, worked around, or invented around** in this Pass (Doc-4A §0.6). Escalation markers used inline in the body are listed after the DC set. *This appendix carries dependencies and routes escalations; it is **not** a review-findings section and contains no severity classification or disposition.*

### C.1 — Carried freeze-gate dependencies (unchanged)

- **DC-1 — Identity cross-module cascade with no identity event.** Doc-2 §8 designates no `identity` domain event. The org soft-delete cascade (vendor profile → suspended [Module 2]; RFQs → archived [Module 3]) and the delegation revocation/expiry teardown (`rfq_invitation_grantees` / visibility rows [Module 3]) cross boundaries. **Channel:** Board decision selecting service-call integrations authored by the source (Identity) per §4.2/§4.4, **or** a Doc-2 §8 identity-event addition via change management. **No event coined; no DC-1-dependent 21.2 integration authored** (§C2.3 guardrail). *Affects:* `soft_delete_organization`, `restore_organization`, `revoke_delegation_grant`, `expire_delegation_grant`, `invite_member` (notification dispatch).
- **DC-2 — Organization verification ownership boundary.** `verification_records` are owned by Trust (Module 5 / Doc-4G; Doc-2 §5.6). Identity owns `organizations` and `can_submit_verification` (Doc-2 §7) but **not** `verification_records`. **Channel:** confirm the submission-contract boundary — the identity-side trigger integrates with the Trust-owned verification contract (single authorship, §4). **Doc-4C authors no `verification_record` contract.**
- **DC-3 — Platform-governance Admin slugs.** Organization suspension (§5.1), ownership-succession recovery (§5.5), and user account status (this Pass) are Admin (21.6) actions. Per standing **D-2** (CARRY FORWARD), they bind to existing `staff_*` slugs (`staff_super_admin`) as the authoritative interim; least-privilege identity-admin slugs (e.g., `staff_can_manage_organizations`) remain a future Doc-2 §7 additive. **No slug invented.** *Affects:* `set_organization_status`, `admin_recover_ownership`, `set_user_account_status`, `restore_organization` (admin path).
- **DC-4 — Authentication boundary.** Supabase Auth performs authentication only (Doc-4A §5). Login, password, 2FA challenge, and session mechanics are infrastructure — **not** Doc-4C contracts. Doc-4C authors the user identity record, preferences, 2FA *settings*, and the post-authentication authorization context. *Affects:* `update_user_2fa_settings`, `activate_membership` (verification-complete precondition).
- **DC-5 — `identity.*` POLICY key registration.** Identity commands reference tunable values with **no `identity.*` block in Doc-3 §12.2** (confirmed against the inventory: domains are `rfq.*`, `moderation.*`, `matching.*`, `routing.*`, `tier.*`, `probation.*`, `fairness.*`, `capacity.*`, `distribution.*`, `confidence.*`, `quote.*`, `eval.*`, `abuse.*`, `suspension.*`, `econ.*`, `platform.*`, `quality.*`, `coverage.*`, `leads.*`, and `core.*`). **Channel:** the content pass enumerates the required keys (C.3 below) and registers them via a **Doc-3 §12.2 additive patch** — the same channel used for the Doc-4B `core.*` block (`Doc-3_Policy_Key_Registration_Patch_v1.0.md`). Contracts reference intended key names with the `[DC-5]` marker; **escalate, do not invent** (Doc-4A §18.2).

### C.2 — Escalation markers raised during authoring (routed to existing channels; not resolved here)

- **`[ESC-IDN-SLUG]` — tenant org-administration slugs absent from the Doc-2 §7 minimal set.** Doc-2 §7 is, by its own statement, the "minimal set implied by the role-bundle definitions." It names no dedicated slug for (a) organization-profile administration, (b) role-bundle management beyond `can_manage_users`, or (c) buyer-profile administration. **Interim binding:** the nearest existing slug / Owner-Director authority (`can_manage_users` for role bundles; Owner/Director for org/buyer profile). **Channel:** the **D-2 least-privilege principle** extended to tenant space — a future **Doc-2 §7 additive** (e.g., `can_manage_organization`, `can_manage_roles`, `can_manage_buyer_profile`). **No slug invented** (Doc-4A §6.4). *Affects:* `update_organization_profile`, `create_role`, `update_role`, `set_role_permissions`, `delete_role`, `upsert_buyer_profile`.
- **`[ESC-IDN-AUDIT]` — identity audit actions not separately enumerated in Doc-2 §9.** The §9 Organization domain enumerates org/membership/role/ownership/workflow/soft-delete actions, and the Vendor profile domain enumerates the delegation actions, but §9 does not separately name: user-account suspend/reinstate, user anonymization-on-departure, organization suspend/reinstate, 2FA-settings change, or buyer-profile change. **Interim binding:** the nearest §9 domain/Platform action by pointer (admin status changes → Platform "Super Admin access (flagged)" / "service-role sensitive operations"; anonymization → the §14.3 compliance-redaction model; org/buyer changes → Organization domain). **Channel:** a future **Doc-2 §9 additive** enumerating the identity user-account, org-status, and buyer-profile audit actions. **No audit action invented.** *Affects:* `set_user_account_status`, `deactivate_own_account`, `set_organization_status`, `update_user_2fa_settings`, `upsert_buyer_profile`.

### C.3 — `identity.*` POLICY keys enumerated for the DC-5 registration patch (intended names; not registered here)

Referenced by intended name with the `[DC-5]` marker; registration is a **Doc-3 §12.2 additive patch** (full reference form `core.system_configuration.identity.<key_name>`, Doc-4A §18.2). All are **POLICY** (tunable; changes audited per Doc-3 §12.4) and **none** influences any governance signal (§18.3, §4B).

| Intended key (`identity` domain) | Purpose | Referenced by |
|---|---|---|
| `identity.membership_invite_expiry_window` | `invited → expire` timer window | `expire_invitation` |
| `identity.membership_invite_dedup_window` | invite idempotency dedup | `invite_member` |
| `identity.delegation_validity_default` | default `valid_to` span at grant issue | `create_delegation_grant`, `expire_delegation_grant` |
| `identity.ownership_succession_reminder_cadence` | succession-reminder cadence (§5.5) | `transfer_ownership`, `admin_recover_ownership` |
| `identity.user_update_dedup_window` | user self-service idempotency dedup | `update_user_profile`, `update_user_2fa_settings` |
| `identity.command_dedup_window` (per-domain) | generic mutating-command idempotency dedup window | all 21.4 / 21.6 / 21.5 mutations |

*(Concrete start values and any additional Pass-B keys are determined at hardening; this is the Pass-A enumeration required by Doc-4A §18.2.)*

---

## Appendix D — Cross-Reference Index

Pointer table from each Doc-4C binding point to its authoritative source (canonical versions: Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0). Reference-never-restate is auditable through this index.

| Binding point | Authoritative source |
|---|---|
| Owned entities, tenancy, lifecycle | Doc-2 §3.2, §6, §10.2 |
| Organization / Membership / Delegation state machines | Doc-2 §5.1 / §5.2 / §5.10 (as amended; Doc-2 v1.0.3) |
| Permission slugs (`can_manage_users`, `can_manage_workflow_settings`, `can_transfer_ownership`, `can_delete_organization`, `can_manage_delegations`, `can_submit_verification`; `staff_super_admin`) | Doc-2 §7 |
| Audit domains (Organization; delegation under Vendor profile) | Doc-2 §9 |
| Event ownership (no `identity` emitter) | Doc-2 §8 |
| Identity schema (columns, RLS anchors, dual-party rule) | Doc-2 §10.2 |
| FIXED / POLICY / ORG; ORG workflow settings; config governance | Doc-3 §12.1 / §12.2 / §12.3 / §12.4 |
| Templates 21.2 / 21.3 / 21.4 / 21.5 / 21.6; selection | Doc-4A §21, §22.3 |
| Authorization model (three-layer) & delegation standard | Doc-4A §6, §6B |
| Context model (active-org, server-validated, Identity-owned) | Doc-4A §5, §5.3, §5.6 |
| Validation order; error model; reference_id mandate | Doc-4A §11.2, §12, §22.1 (C-05 / P6-B01) |
| Idempotency; events; audit; FIXED/POLICY/ORG; firewall | Doc-4A §14, §16, §17, §18, §4B |
| Identity model; ownership/succession; buyer profile | Architecture §5–§5.7, §13.3–§13.4, §16.2; ADR-015 |
| Vendor representation / delegation rationale | Architecture §6.5, §7.3–7.4; ADR-005 |
| Platform Core services consumed | Doc-4B v1.0 (`core.append_audit_record.v1`, `core.allocate_human_reference.v1`, `core.config_value_query.v1`, `core.feature_flag_evaluate.v1`; UUIDv7 §8) |
| Carried dependencies (DC-1…DC-5) | `Doc-4C_Structure_v1.0_FROZEN.md` Appendix C |

---

*End of Doc-4C Content v1.0 — Pass-A (Module 1 — Identity & Organization). Contract-authoring structure for all frozen-structure sections §C0–§C12 + Appendices A–D: 42 contracts across 9 owned entities, mapped to Doc-4A templates and bound by pointer to Doc-2 / Doc-3 / Doc-4A / Doc-4B. DC-1…DC-5 carried unchanged; `[ESC-IDN-SLUG]` / `[ESC-IDN-AUDIT]` raised and routed to existing channels; no entity, slug, event, audit action, template, or POLICY key invented. No self-review, no findings, not frozen — ready for Independent Architecture Review.*
