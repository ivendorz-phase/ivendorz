# Doc-4C — Identity & Organization — API & Integration Contracts — Content v1.0, Pass-B

| Field | Value |
|---|---|
| Document | Doc-4C — Identity & Organization (Module 1) |
| Pass | B of N — **implementation hardening** of the closed Pass-A contract structure: Request/Response contracts, validation matrices, error registers, idempotency declarations, query contracts, reference validation, audit/authorization declarations, and AI-agent implementation notes. **Not a redesign.** |
| Status | **DRAFT — ready for Independent Hard Review** |
| Module | Module 1 — Identity & Organization (`identity` schema) |
| Base | `Doc-4C_Content_v1.0_PassA.md` **as amended by `Doc-4C_PassA_Patch_v1.0.1.md`** — **CLOSED / FROZEN** per `Doc-4C_PassA_Patch_Verification_Report_v1.0.md` (Board verdict: Pass-A CLOSED, Pass-B AUTHORIZED) |
| Structure | Conforms to `Doc-4C_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 |
| Contains | Hardened contracts for Module 1 only — **no new entity, contract, event, permission slug, audit action, template, or module responsibility; no ownership / state-machine / actor / escalation / dependency change** |
| Audience | Claude Code, Cursor, backend, QA, AI development agents |

**Pass-B scope note (read first).** This Pass **hardens what Pass-A already established** — it adds the implementation detail (payload field lists, per-field constraints, the canonical-order validation matrix, error registers, idempotency declarations, query semantics, reference-validation rules, and AI-agent constraints) for the **42 contracts** in the closed Pass-A Appendix A. It **creates nothing new** and **changes no** ownership, state machine, actor assignment, escalation marker, or freeze-gate dependency. The contract inventory, template assignments, actor designations, authorization/state/audit/event bindings, and the markers **`[DC-1…DC-5]`**, **`[ESC-IDN-SLUG]`**, **`[ESC-IDN-AUDIT]`**, **`[ESC-IDN-DELEG-EXPIRY]`** are carried **verbatim** from the closed base. Where a frozen lower-layer artifact is needed it is **referenced by pointer, never restated** (Doc-4A §0.3). This document performs **no self-review and contains no findings or review commentary** (Board directive).

**Pass-B entry conditions carried from the Verification Report §6 (honored throughout, not resolved here):**

1. **DC-1** — no Template 21.2 Integration Contract is instantiated for any identity→downstream leg; cross-module cascade/teardown legs remain blocked.
2. **DC-5** — every idempotency-window / timer / sweep binding references its **intended `identity.*` POLICY key by name** (`[DC-5]`); **no concrete value is set and no key is registered** (registration is the Doc-3 §12.2 additive channel). Contracts referencing `[DC-5]` keys are **not finalized** until registration.
3. **`[ESC-IDN-SLUG]` / `[ESC-IDN-AUDIT]`** — carried on the affected contracts (interim bindings to nearest existing slug / nearest §9 action); routed to their Doc-2 §7 / §9 additive channels concurrently; not resolved here.
4. **`[ESC-IDN-DELEG-EXPIRY]`** — the `suspended`-at-validity-expiry disposition is **unresolved**; the validation and error-boundary tables of `expire_delegation_grant` and `reinstate_delegation_grant` carry the marker on that leg and bind only the literal Doc-2 §5.10 `active → expired` edge.

---

## §B — Pass-B Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate and avoid duplication, the following apply to **every** contract below; per-contract blocks state only contract-specific detail and reference these by pointer.

### B.1 — Contract block grammar (Doc-4A §21)

Each contract is presented as: **Header** · **Authorization** (Doc-4A §6/§6B) · **Firewall** (§4B) · **Request Contract** · **Response Contract** (§22.1) · **Validation Matrix** (§11.2) · **Error Register** (§12) · **State Effects** (§13) · **Idempotency** (§14) · **Audit** (§17) · **Events** (§16) · **Query semantics** (§22.3, queries only) · **Reference Validation** · **AI-Agent Implementation Notes**. Fields that are the cross-cutting default below are cited as "(§B default)" rather than repeated.

### B.2 — Identifiers, payload typing, field ownership

- **IDs:** UUIDv7 is the only canonical machine identifier in payloads (Doc-4A §8; Architecture §17.2). `human_ref` (e.g., `ORG-…`) is a display/lookup convenience only (Doc-2 §0.1) — never an authorization key.
- **Timestamps:** ISO-8601 UTC (Doc-4A §9.8). **Concurrency token:** `updated_at` on mutable entities (Doc-2 §0.2; Doc-4A §10.2), optimistic concurrency on updates.
- **Field ownership:** every request field is owned by the `identity` entity it targets (Doc-2 §3.2/§10.2). Cross-module identifiers (`vendor_profile_id`, etc.) are **bare UUID references, service-validated, never FKs** (Doc-2 §0.3) — Identity stores/echoes them but never owns them.
- **Server-populated fields** (`created_by`, `updated_by`, `created_at`, `updated_at`, `organization_id`) are **never client-asserted** (Doc-2 §0.2; active-org context server-validated, Doc-4A §5.3).

### B.3 — Response & reference_id (Doc-4A §22.1 C-05 / P6-B01)

Every non-21.5 Response Contract carries **`reference_id : uuid : always`** (platform-assigned UUIDv7; support/audit correlation). **Template 21.5 (System) contracts carry `Response: none`** and are exempt (FreezeAudit Patch v1.0.1 PATCH-FA-01). Entity projections return only fields the caller is entitled to (§7); soft-deleted rows are excluded from default reads (Doc-2 §0.2).

### B.4 — Validation matrix (Doc-4A §11.2 — fixed order)

Mutations declare validation stages in the **canonical order** (omitting only structurally inapplicable stages, never reordering): **SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → STATE → REFERENCE → BUSINESS → POLICY**. Stage→error-class mapping (§12): SYNTAX→`VALIDATION`; CONTEXT→`AUTHORIZATION`; AUTHZ→`AUTHORIZATION`; SCOPE→`NOT_FOUND` (disclosure collapse, §7.5/§12.4); DELEGATION→`AUTHORIZATION` (or `NOT_FOUND` on protected facts); STATE→`STATE`; REFERENCE→`REFERENCE`; BUSINESS→`BUSINESS`; POLICY→`QUOTA`/`RATE_LIMITED`/`BUSINESS`. **AUTHZ precedes semantics** (disclosure control). Queries validate SYNTAX → CONTEXT → AUTHZ → SCOPE.

### B.5 — Error model (Doc-4A §12 — closed class set; nothing invented)

- **Closed class set (no class invented):** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`.
- **Envelope:** `error_class, error_code, message, field_errors, retryable, reference_id`.
- **Code namespace:** `identity_<domain>_<code>` (Doc-4A Appendix B §B.2; prefix `identity_` registered). Domain segments used: `user, membership, org, role, permission, delegation, context, buyer_profile, workflow`. Codes are **registrations within the existing `identity_` prefix** (Doc-4A §12.3) — **no new error class**.
- **Protected-fact rule:** existence/authorization failures over non-disclosable facts collapse to `NOT_FOUND` with timing uniformity (§7.5, §12.4). Identity carries no governance-signal protected facts (§B.7), but delegation/membership existence beyond a caller's scope is collapsed.
- **`retryable`** is `true` only for transient classes (`RATE_LIMITED`, `DEPENDENCY`, `SYSTEM`, `ASYNC_PENDING`); `false` for deterministic rejections (`VALIDATION`, `AUTHORIZATION`, `NOT_FOUND`, `STATE`, `REFERENCE`, `BUSINESS`, `CONFLICT`).

### B.6 — Idempotency (Doc-4A §14; joint rule §14.3)

Every **mutation** declares `Idempotency: required` with a **client-supplied idempotency key** and a **dedup window bound to an intended `identity.*` POLICY key `[DC-5]`** (no concrete value — entry condition 2). **Replay (same key) → cached response; no duplicate audit record; no duplicate side effect** (§14.3 joint rule). System Phase-2 contracts (21.5) are **platform-scope idempotent** (a row already transitioned is not re-transitioned). Queries declare `Idempotency: not-applicable`.

### B.7 — Firewall (Doc-4A §4B / §18.3) — default `none`

**Identity contracts touch no governance signal** (Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer-Vendor Status). The **Firewall-Compliance Declaration is `none`** for every contract: `Signals-Read: none · Signals-Written: none · Mutation-Inputs: none · Monetization-Inputs: none · Routing-Impact: none · Disclosure: per §7 tenancy`. **No paid plan / entitlement / config / flag gates any identity authorization, membership, role, or delegation** (§18.3). Per-contract blocks omit the firewall block and cite "(§B.7 default: none)".

### B.8 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`)

Audited mutations declare: `Audit-Required: yes` · **Domain** (Doc-2 §9 by pointer) · **Attribution** (`standard` for User/Admin; `system` for System, §17.3) · **Mutation-Scope** (the `identity.*` table) · **Correlation** (`both`, or `phase2-origin` for 21.5). Audit is **immutable, written within the contract's transaction** via the Doc-4B mechanism (never re-implemented). **Reads are not audited** (operational, §17.1). Contracts carrying **`[ESC-IDN-AUDIT]`** bind to the nearest enumerated §9 action by pointer (interim) — **no audit action invented** (entry condition 3).

### B.9 — Reference validation (no new integration; entry condition 1)

- **UUID validation:** every UUID field is syntactically validated (SYNTAX) and existence-validated against its **owning service** (REFERENCE), never by cross-schema FK (Doc-2 §0.3).
- **Ownership validation:** in-module references (`role_id`, `organization_id`) are validated for **same-tenant ownership** (Doc-2 §6 RLS) at SCOPE/REFERENCE.
- **Cross-module references** (`vendor_profile_id`, `user_id` where platform-owned) are validated via the **owning module's read service** (e.g., `vendor_profile_id` → Vendor Service at delegation issue, Doc-2 §10.2) — a **read-validation only**; **no integration/event is authored** (DC-1 unaffected). A missing cross-module referent yields `REFERENCE` (or `NOT_FOUND` collapse where disclosure applies).

### B.10 — Authorization declaration (Doc-4A §6/§6B)

Each contract declares **Membership** (active / n/a), **Permission** (slug per Doc-2 §7, or `[ESC-IDN-SLUG]` interim where §7's minimal set names none), **Scope** (active-org / platform / entity), **Delegation eligibility** (§6B; `not eligible` unless the contract is a vendor-profile act-as path — none in Identity are, except where a delegated slug applies to a consuming module, not to Identity's own management). **Slugs only** (§6.2); roles are never checked. Admin (21.6) contracts declare **no active org context** (§5.6) and bind to existing `staff_*` slugs per **DC-3**. System (21.5) contracts declare **no slug** (FIXED System actor).

### B.11 — AI-agent global constraints (apply to every contract; per-contract notes add specifics)

- **One owner:** implement each contract **only** in Module 1; never re-derive identity authorization, membership, role, or delegation state in a consuming module (consume `identity.check_permission.v1` / the §C3 reads). **No shadow authorization.**
- **No invention at runtime:** an unknown slug, audit action, POLICY key, or event is a **conformance gap → escalate**, never a runtime fabrication (Doc-4A §0.6, §6.4, §16.4, §18.2).
- **Server-validated context:** never trust client-asserted active-org, actor, or ownership (Doc-4A §5.3).
- **Non-disclosure:** never reveal cross-tenant or beyond-scope existence (membership/delegation/org) through response, error, count, ordering, or timing (§7.5).
- **Firewall:** never let a plan/entitlement/flag/config influence an identity authorization decision (§4B).

---

## §C0 — Document Control, Precedence & Conformance Obligation (hardened)

Doc-4C Pass-B hardens the contracts of **Module 1 — Identity & Organization** and **no other module**. It introduces no standard, entity, state, event, slug, audit action, POLICY key, or template, and overrides nothing in a higher document. **Precedence:** Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C Structure → Doc-4C Content (Pass-A closed). **Conflict → flag-and-halt** (Doc-4A §0.6): halt, record both citations, escalate to the owning document's patch channel; never override, never invent. Effective corpus versions: Doc-2 **v1.0.3**, Doc-3 **v1.0.2**, Doc-4A **v1.0**, Doc-4B **v1.0**. The Pass-A closure (base + Patch v1.0.1) is authoritative; Pass-B adds detail only.

---

## §C1 — Module Scope & Boundary (hardened — unchanged ownership)

Ownership is **unchanged** from the closed Pass-A §C1: Module 1 owns exactly the nine `identity` entities (`users`, `organizations`, `memberships`, `roles`, `permissions`, `role_permissions`, `organization_workflow_settings`, `buyer_profiles`, `delegation_grants`; tenancy/lifecycle per Doc-2 §3.2/§6/§10.2 — bound by pointer, not restated). **Not owned, referenced by UUID only:** `vendor_profiles` (M2), `verification_records` (M5/DC-2), `subscriptions` (M7), `rfqs`/`quotations`/`rfq_invitation_grantees` (M3), all `core.*` (M0). **Authentication boundary (DC-4):** Supabase Auth = authentication only; login/password/2FA-challenge/session = infrastructure; Identity owns the user record, preferences, 2FA *settings*, and the post-authentication authorization context. Pass-B authors **no** contract over a non-owned entity.

---

## §C2 — Conformance & Template Binding (hardened — unchanged assignments)

Template assignments are **unchanged** from the closed Pass-A §C2 (reflecting Patch v1.0.1): **21.3 Query**, **21.4 Command**, **21.6 Admin** (no active org context, §5.6), **21.5 System** (`Response: none`; membership-invite expiry, delegation-grant expiry, **and membership activation on verification-complete** per Patch v1.0.1). **Internal-service** reads (the §C3 services + `get_workflow_settings` + `get_buyer_profile`) compose 21.3 with `Audience: internal-service` (D-1; Board Decision Pending — consumption channel only). **Template 21.2 (Integration) is NOT instantiated** in Pass-B for any identity→downstream leg (entry condition 1 / DC-1 guardrail). Namespaces: Contract-ID `identity.<operation>.v1`; error codes `identity_<domain>_<code>` (§B.5). Every applicable Response carries `reference_id` (§B.3).

---

## §C3 — Shared Identity Services (hardened)

All four are **21.3 Query**, `Audience: internal-service` (D-1). **Authoritative-source rule (carried):** these are the single authoritative authorization-resolution reads; no consuming module re-derives them (no shadow authorization — §B.11). All are reads: `Idempotency: not-applicable`, `Audit-Required: no` (§17.1), `Events: none`.

#### `identity.get_user.v1` — Get User · 21.3 Query (internal-service) · Actor: internal-service

- **Authorization:** Membership n/a; Slug none (platform-owned read); Scope caller-context; Delegation n/a. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `user_id : uuid : required :` the user to resolve (UUIDv7, §B.2).
- **Response Contract:** `user : object : always` — projection `{ user_id, status, display_name, preferences_summary }`, personal-data minimized (Doc-2 §3.2); **never** password/2FA-secret fields (DC-4). `reference_id : uuid : always` (§B.3).
- **Validation Matrix (§B.4, query):** SYNTAX (`user_id` uuid) → CONTEXT (internal-service caller) → AUTHZ (caller entitled to user reads) → SCOPE (existence; `NOT_FOUND` collapse if not disclosable).
- **Error Register (§B.5):** `identity_user_invalid_input` (VALIDATION, no) · `identity_user_not_found` (NOT_FOUND, no).
- **Query semantics:** single-entity read; no list/pagination. **Projection:** entitled fields only (§7).
- **Reference Validation (§B.9):** `user_id` existence via this owning service (no cross-schema FK).
- **AI-Agent Notes:** canonical user read — consumers MUST call this, never read `identity.users` directly; never return auth-mechanism fields (DC-4); do not infer org membership from this read (use `get_membership`).

#### `identity.get_organization.v1` — Get Organization · 21.3 Query (internal-service) · Actor: internal-service

- **Authorization:** Membership n/a; Slug none; Scope caller-context (tenancy honored, §7); Delegation n/a.
- **Request Contract:** `organization_id : uuid : required`.
- **Response Contract:** `organization : object : always` — `{ organization_id, human_ref, name, slug, org_status, verification_level, participation_flags }` (Doc-2 §10.2); `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX (`organization_id` uuid) → CONTEXT (caller) → AUTHZ (entitled) → SCOPE (existence; `NOT_FOUND` collapse).
- **Error Register:** `identity_org_invalid_input` (VALIDATION, no) · `identity_org_not_found` (NOT_FOUND, no).
- **Query semantics:** single-entity read. **Projection:** public/tenant-entitled fields; `verification_level` is read-through of the org record (Trust owns verification *records* — DC-2; this is the org's own derived level field per Doc-2 §10.2, not a Trust contract).
- **Reference Validation (§B.9):** `organization_id` existence via this service.
- **AI-Agent Notes:** canonical org read; do not read `identity.organizations` cross-module; `verification_level` here is the org attribute, not a `verification_records` projection (DC-2).

#### `identity.get_membership.v1` — Get Membership · 21.3 Query (internal-service) · Actor: internal-service

- **Authorization:** Membership n/a (this *is* the membership resolver); Slug none; Scope `organization_id`-scoped (§7); Delegation n/a.
- **Request Contract:** `user_id : uuid : required` · `organization_id : uuid : required` (resolve the (user × org) link).
- **Response Contract:** `membership : object : always` — `{ membership_id, user_id, organization_id, state, role_id, department }` (Doc-2 §10.2); `reference_id : uuid : always`. Only `active` participates in the access formula (§6.1) — the `state` field is authoritative for that gate.
- **Validation Matrix (query):** SYNTAX (both uuids) → CONTEXT (caller) → AUTHZ (entitled) → SCOPE (tenancy; `NOT_FOUND` collapse beyond scope).
- **Error Register:** `identity_membership_invalid_input` (VALIDATION, no) · `identity_membership_not_found` (NOT_FOUND, no).
- **Query semantics:** single-link read. **Visibility:** never disclose a membership beyond its tenant scope (§7.5).
- **Reference Validation (§B.9):** `user_id` + `organization_id` existence + same-tenant link.
- **AI-Agent Notes:** the access-formula input — consumers read `state` here, never cache stale membership; do not re-derive role→permission mapping (use `check_permission`).

#### `identity.check_permission.v1` — Check Permission · 21.3 Query (internal-service) · Actor: internal-service · *(platform authorization root)*

- **Authorization:** Membership n/a (this *is* the resolver); Slug none; Scope: resolves within the asserted active-org/resource scope; Delegation: evaluates the §6B delegation path as one of the two satisfiable paths. This contract **implements** the Doc-4A §6 three-layer check and §6B delegation check; it **does not redefine** them. (§B.10, §B.11)
- **Firewall:** §B.7 default (none) — authorization resolution reads no governance signal.
- **Request Contract:**
  - `user_id : uuid : required` — acting user
  - `organization_id : uuid : required` — server-validated active-org context (Doc-4A §5.3)
  - `permission_slug : string : required` — slug to check; MUST exist in the Doc-2 §7 catalog (REFERENCE; never a role/plan name, §6.2)
  - `resource_scope : object : optional` — resource identifiers for scope evaluation (e.g., target entity id); absent → org-level check
  - `vendor_profile_id : uuid : optional` — present only when evaluating a delegated act-as path (§6B); bare UUID ref (not owned)
- **Response Contract:** `decision : enum(allow|deny) : always` · `satisfied_by : enum(membership|delegation|none) : always` (the path that granted, for auditability; never leaks *why* a deny beyond scope) · `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX (uuids; slug format) → CONTEXT (active-org server-validated) → AUTHZ (caller entitled to resolve) → SCOPE (tenancy) → REFERENCE (`permission_slug` exists in §7 catalog; `vendor_profile_id` via Vendor Service if present).
- **Error Register:** `identity_permission_invalid_input` (VALIDATION, no) · `identity_permission_slug_unknown` (REFERENCE, no — an unknown slug is a conformance gap, never a runtime grant, §6.4) · `identity_context_not_found` (NOT_FOUND, no — org/scope not resolvable for caller).
- **Query semantics:** decision read; deterministic; no list. **Disclosure:** a `deny` reveals no protected fact (uniform shape; §7.5).
- **Reference Validation (§B.9):** `permission_slug` ∈ Doc-2 §7 catalog (REFERENCE, not invention); `organization_id` active membership (via `get_membership` resolution); `vendor_profile_id` (when present) via the Vendor Service (read-validation only; DC-1 unaffected).
- **AI-Agent Notes:** **the single authorization-resolution source** — every consuming module MUST call this (or the §C3 reads it composes) and MUST NOT implement a parallel/shadow check (§6, §4.1); slugs only (never check a role or plan); the delegation path is evaluated here, not re-implemented per module (§6B); never let any plan/entitlement influence the decision (§4B).

---

## §C4 — User Contracts (`users`) — hardened

`users` is platform-owned (personal-data rules, Doc-2 §3.2). The authentication *mechanism* is out of scope (DC-4); these contracts cover the identity record, preferences, and 2FA *settings*. Self-service contracts act on the authenticated subject (no org slug).

#### `identity.update_user_profile.v1` — Update User Profile & Preferences · 21.4 Command · Actor: User (self)

- **Authorization:** Membership n/a (self, no org context required); Slug none (subject = actor); Scope self; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:**
  - `display_name : string : optional : bounded`
  - `phone : string : optional : E.164; uniqueness not enforced here (auth-managed identifiers are infra, DC-4)`
  - `preferences : object : optional : `preferences_jsonb` (Doc-2 §10.2) — notification + personal settings; schema-validated keys only`
  - `updated_at : timestamp : required : optimistic-concurrency token (§B.2)`
- **Response Contract:** `user_id : uuid : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (field types/bounds; `preferences` keys allowlisted) → CONTEXT (authenticated self) → BUSINESS (no protected/auth-managed field mutated here — DC-4) → POLICY (none).
- **Error Register:** `identity_user_invalid_input` (VALIDATION, no) · `identity_user_update_conflict` (CONFLICT, no — stale `updated_at`).
- **State Effects:** none (simple lifecycle; no §5 machine).
- **Idempotency (§B.6):** required; dedup `…identity.user_update_dedup_window` [DC-5]. Concurrency: optimistic on `updated_at`.
- **Audit (§B.8):** **no** — profile/preference edits are operational, not a Doc-2 §9 MUST-audit action (§17.1).
- **Events:** none (§8).
- **Reference Validation:** none cross-module.
- **AI-Agent Notes:** never write auth-managed fields (password, 2FA secret) here (DC-4 — separate infra); `preferences` is a bounded schema, not arbitrary JSON; self-only — never accept a target `user_id` ≠ session user.

#### `identity.update_user_2fa_settings.v1` — Update 2FA Settings · 21.4 Command · Actor: User (self) · *(settings only — DC-4)*

- **Authorization:** Membership n/a; Slug none (self); Scope self; Delegation: not eligible.
- **Firewall:** §B.7 default (none).
- **Request Contract:** `two_fa_enabled : boolean : required` · `recovery_method : enum : optional` · `updated_at : timestamp : required` (concurrency). **The 2FA challenge/verification mechanism is Supabase Auth infrastructure (DC-4) — not represented here.**
- **Response Contract:** `user_id : uuid : always` · `two_fa_enabled : boolean : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (types) → CONTEXT (authenticated self) → BUSINESS (settings-only; no challenge state mutated here — DC-4).
- **Error Register:** `identity_user_invalid_input` (VALIDATION, no) · `identity_user_update_conflict` (CONFLICT, no).
- **State Effects:** none. **Idempotency (§B.6):** required; dedup `…identity.user_update_dedup_window` [DC-5].
- **Audit (§B.8):** account-security setting change — **`[ESC-IDN-AUDIT]`** (no enumerated Doc-2 §9 user-2FA-settings action; interim bind nearest by pointer; entry condition 3). Attribution standard.
- **Events:** none (§8).
- **AI-Agent Notes:** this toggles the *preference/setting*, not the auth challenge — never implement the 2FA verification flow here (DC-4); audit binding is interim pending the §9 additive (carry `[ESC-IDN-AUDIT]`).

#### `identity.deactivate_own_account.v1` — Deactivate / Depart (anonymize) · 21.4 Command · Actor: User (self)

- **Authorization:** Membership n/a; Slug none (self); Scope self; Delegation: not eligible. Guard: no organization may be left without an active Owner (Last Owner Protection cross-check, §5.5).
- **Firewall:** §B.7 default (none).
- **Request Contract:** `confirmation : boolean : required : explicit departure confirmation` · `updated_at : timestamp : required`.
- **Response Contract:** `user_id : uuid : always` · `status : enum : always` (= soft-deleted) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (confirmation true) → CONTEXT (authenticated self) → STATE (`active|suspended → soft-deleted`; simple lifecycle) → BUSINESS (Last Owner Protection: user is not the sole active Owner of any org without prior succession, §5.5) → POLICY (none).
- **Error Register:** `identity_user_invalid_input` (VALIDATION, no) · `identity_user_last_owner_block` (BUSINESS, no — succession required first) · `identity_user_update_conflict` (CONFLICT, no).
- **State Effects:** `users` → soft-deleted + anonymization on departure (Architecture §5.7); in-module membership consequences only; any cross-module effect is **[DC-1]** (none authored).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes — anonymization follows the §14.3 / Architecture §14.3 compliance-redaction model; **`[ESC-IDN-AUDIT]`** (no enumerated §9 user-anonymization action; interim nearest by pointer). Attribution standard.
- **Events:** none (§8).
- **AI-Agent Notes:** block departure if it would orphan an org (run §5.5 succession first); anonymization is irreversible — implement via the compliance-redaction path, not a hard delete; emit no cross-module event (DC-1).

#### `identity.set_user_account_status.v1` — Suspend / Reinstate User · 21.6 Admin · Actor: Admin · *(platform governance)*

- **Authorization:** Membership n/a; **no active org context** (§5.6); Slug `staff_super_admin` (Doc-2 §7, existing) — interim per **DC-3 / D-2**; Admin-Scope platform/tenant-data; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `user_id : uuid : required` · `target_status : enum(suspended|active) : required` · `reason : string : required : structured admin reason` · `updated_at : timestamp : required`.
- **Response Contract:** `user_id : uuid : always` · `status : enum : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (enum/reason present) → CONTEXT (Admin actor; no org context; Admin-Scope, §5.6) → AUTHZ (`staff_super_admin`, DC-3) → STATE (`active ⇄ suspended`; simple lifecycle) → BUSINESS (reason recorded).
- **Error Register:** `identity_user_invalid_input` (VALIDATION, no) · `identity_user_forbidden` (AUTHORIZATION, no) · `identity_user_not_found` (NOT_FOUND, no) · `identity_user_status_conflict` (CONFLICT, no).
- **State Effects:** `users` `active ⇄ suspended`.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Platform ("Super Admin access (flagged)" / "service-role sensitive operations", §9) by pointer — **`[ESC-IDN-AUDIT]`** (no separately enumerated user-status action); attribution standard (Admin); Correlation both.
- **Events:** none (§8).
- **AI-Agent Notes:** platform-staff only (no tenant slug, no org context); bind to `staff_super_admin` until a least-privilege slug is registered (DC-3 — do not invent); record the structured reason; carry `[ESC-IDN-AUDIT]`.

---

## §C5 — Organization Contracts (`organizations`) — hardened

`organizations` is the tenant root (Doc-2 §3.2). State transitions bind to the **Doc-2 §5.1** machine (legal transitions only, §13 — none invented). Cross-module cascade legs are **[DC-1]** (no Template 21.2 instantiated — entry condition 1).

#### `identity.create_organization.v1` — Create Organization · 21.4 Command · Actor: User

- **Authorization:** Membership n/a (bootstrap — creator becomes Owner); Slug none (self-service creation); Scope authenticated user; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:**
  - `name : string : required : org legal/display name; length-bounded`
  - `org_type : enum : optional : business classification (Doc-2 §10.2); default standard`
  - `is_personal_org : boolean : optional : default false; server-set on Solo Trader auto-create (Architecture §5.2), not client-trusted`
  - `address : object(Address VO) : optional` · `contact_info : object(ContactInfo VO) : optional` (Doc-2 §2)
- **Response Contract:** `organization_id : uuid : always` · `human_ref : string : always` (`ORG-…`, via Doc-4B `core.allocate_human_reference.v1`) · `org_status : enum : always` (= active) · `owner_membership_id : uuid : always` · `reference_id : uuid : always` (§B.3).
- **Validation Matrix (§B.4):** SYNTAX (`name` present/bounded; enums) → CONTEXT (authenticated user) → BUSINESS (Solo Trader invariant — user ends with ≥1 org; duplicate-personal-org guard) → POLICY (per-user org-count cap if configured `[DC-5]`).
- **Error Register (§B.5):** `identity_org_invalid_input` (VALIDATION, no) · `identity_org_personal_exists` (CONFLICT, no) · `identity_org_quota_exceeded` (QUOTA, no).
- **State Effects:** Doc-2 §5.1 `→ active`; founding `memberships` Owner row created **in the same transaction**.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5]; human-ref allocation participates in the single transaction (no second ref on replay).
- **Audit (§B.8):** yes; Domain Organization "create" (§9); attribution standard; Mutation-Scope `identity.organizations` (+ founding membership); Correlation both.
- **Events:** none (§8). **Reference Validation:** none cross-module (creator from session).
- **AI-Agent Notes:** enforce the Solo Trader Rule (every user ends with ≥1 org); create the founding Owner membership atomically — never split into two contracts; `human_ref` is display-only (never an authz key); allocate the ref via Module 0, not locally.

#### `identity.update_organization_profile.v1` — Update Organization Profile · 21.4 Command · Actor: User

- **Authorization:** Membership active (target org); **Slug `[ESC-IDN-SLUG]`** — Doc-2 §7's minimal set names no `can_manage_organization`; interim Owner/Director authority (entry condition 3); Scope active-org; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `name : string : optional : bounded` · `address : object(Address VO) : optional` · `contact_info : object(ContactInfo VO) : optional` · `brand_assets_ref : object : optional : BrandAssets reference (Doc-2 §2)` · `updated_at : timestamp : required`.
- **Response Contract:** `organization_id : uuid : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (field types/bounds) → CONTEXT (active-org server-validated) → AUTHZ (org-administration authority — `[ESC-IDN-SLUG]` interim) → SCOPE (caller's active org owns the target) → BUSINESS (no §5.1 transition; attribute edit only).
- **Error Register:** `identity_org_invalid_input` (VALIDATION, no) · `identity_org_forbidden` (AUTHORIZATION, no) · `identity_org_not_found` (NOT_FOUND, no) · `identity_org_update_conflict` (CONFLICT, no).
- **State Effects:** none (attribute edit; not a §5.1 transition).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5]; optimistic on `updated_at`.
- **Audit (§B.8):** yes; Domain Organization (org-profile change) by pointer — **`[ESC-IDN-AUDIT]`** (no enumerated §9 org-profile-change action); attribution standard.
- **Events:** none (§8). **Reference Validation:** target org same-tenant (§B.9).
- **AI-Agent Notes:** carry `[ESC-IDN-SLUG]` (do not invent `can_manage_organization`) and `[ESC-IDN-AUDIT]`; this contract never transitions the §5.1 machine (use the status/delete contracts); never mutate `verification_level` here (org-attribute owned via the org record, changed through verification flows — DC-2).

#### `identity.transfer_ownership.v1` — Transfer Ownership / Succession · 21.4 Command · Actor: User (Owner)

- **Authorization:** Membership active; **Slug `can_transfer_ownership`** (Doc-2 §7, Owner-only); Scope active-org; **Delegation: not eligible** (ownership-class action never delegable — Doc-2 §5.10 guard). (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `new_owner_user_id : uuid : required : must hold an active membership in the org` · `reason_code : string : required : structured succession reason (Architecture §5.5)` · `approver_membership_id : uuid : optional : where org workflow requires an approver` · `updated_at : timestamp : required`.
- **Response Contract:** `organization_id : uuid : always` · `new_owner_membership_id : uuid : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuids; reason present) → CONTEXT (active-org) → AUTHZ (`can_transfer_ownership`, Owner) → SCOPE (org owns both memberships) → REFERENCE (`new_owner_user_id` has active membership) → BUSINESS (Last Owner Protection — org retains ≥1 active Owner; succession runs before any Owner removal, §5.5).
- **Error Register:** `identity_org_invalid_input` (VALIDATION, no) · `identity_org_forbidden` (AUTHORIZATION, no) · `identity_membership_not_found` (REFERENCE, no — target not an active member) · `identity_org_last_owner_block` (BUSINESS, no) · `identity_org_update_conflict` (CONFLICT, no).
- **State Effects:** no `organizations` §5.1 transition; reassigns the Owner role on `memberships` (§5.2 context) in-transaction.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "ownership change/succession" (§9); attribution standard; Mutation-Scope `identity.organizations` + `identity.memberships`; Correlation both.
- **Events:** none (§8). **Reference Validation:** `new_owner_user_id` active membership (§B.9).
- **AI-Agent Notes:** enforce Last Owner Protection atomically (never leave the org ownerless); ownership transfer is never a delegated action (reject any delegation path); succession-reminder cadence is `…identity.ownership_succession_reminder_cadence` [DC-5].

#### `identity.soft_delete_organization.v1` — Soft-Delete Organization · 21.4 Command · Actor: User (Owner)

- **Authorization:** Membership active; **Slug `can_delete_organization`** (Doc-2 §7, Owner-only); Scope active-org; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `confirmation : boolean : required` · `reason : string : required` · `updated_at : timestamp : required`.
- **Response Contract:** `organization_id : uuid : always` · `org_status : enum : always` (= soft_deleted) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (confirmation true; reason) → CONTEXT (active-org) → AUTHZ (`can_delete_organization`, Owner) → SCOPE (caller owns target) → STATE (Doc-2 §5.1 `active|suspended → soft_deleted`) → BUSINESS (cascade preconditions).
- **Error Register:** `identity_org_invalid_input` (VALIDATION, no) · `identity_org_forbidden` (AUTHORIZATION, no) · `identity_org_not_found` (NOT_FOUND, no) · `identity_org_state_invalid` (STATE, no) · `identity_org_update_conflict` (CONFLICT, no).
- **State Effects:** Doc-2 §5.1 `→ soft_deleted`. **In-module cascade (authored):** `memberships → soft-deleted`. **Cross-module legs (BLOCKED — [DC-1]):** vendor profile → suspended (M2); RFQs → archived (M3); quotations preserved. **No Template 21.2 instantiated** (entry condition 1).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "soft delete/restore" (§9); attribution standard; Mutation-Scope `identity.organizations` + in-module `identity.memberships`; Correlation both.
- **Events:** **none — §8 designates no `identity` emitter**; cross-module cascade has no emitter → **[DC-1]**.
- **Reference Validation:** target org same-tenant (§B.9).
- **AI-Agent Notes:** apply only the **in-module** membership cascade; do **not** synthesize an event or call M2/M3 (DC-1 — blocked); preserve quotations; the cross-module cascade is finalized only after DC-1 resolution.

#### `identity.restore_organization.v1` — Restore Organization · 21.4 Command · Actor: User (Owner) or Admin

- **Authorization:** self-restore — Membership context + `can_delete_organization` (Owner); admin path — `staff_super_admin` (DC-3), no org context (§5.6); Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `organization_id : uuid : required` · `reason : string : optional` · `updated_at : timestamp : required`.
- **Response Contract:** `organization_id : uuid : always` · `org_status : enum : always` (= active) · `slug_regenerated : boolean : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (Owner context or Admin §5.6) → AUTHZ (`can_delete_organization` or `staff_super_admin`) → SCOPE (target resolvable) → STATE (Doc-2 §5.1 `soft_deleted → active`) → BUSINESS (restore-conflict rule: regenerate any reused slug, §5.1).
- **Error Register:** `identity_org_invalid_input` (VALIDATION, no) · `identity_org_forbidden` (AUTHORIZATION, no) · `identity_org_not_found` (NOT_FOUND, no) · `identity_org_state_invalid` (STATE, no — not soft-deleted).
- **State Effects:** Doc-2 §5.1 `soft_deleted → active`; reused slugs regenerated. Cross-module reactivation of dependents is **[DC-1]** (not authored).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "soft delete/restore" (§9); attribution standard (or system/Admin for admin path); Correlation both.
- **Events:** none (§8). **Reference Validation:** target existence (§B.9).
- **AI-Agent Notes:** apply the slug restore-conflict rule (regenerate, never collide); restore reactivates only the org + in-module rows — cross-module dependents await DC-1.

#### `identity.set_organization_status.v1` — Suspend / Reinstate Organization · 21.6 Admin · Actor: Admin · *(platform governance)*

- **Authorization:** Membership n/a; **no active org context** (§5.6); **Slug `staff_super_admin`** (DC-3 interim); Admin-Scope tenant-data; Delegation: not eligible.
- **Firewall:** §B.7 default (none).
- **Request Contract:** `organization_id : uuid : required` · `target_status : enum(suspended|active) : required` · `reason : string : required` · `updated_at : timestamp : required`.
- **Response Contract:** `organization_id : uuid : always` · `org_status : enum : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (enum/reason) → CONTEXT (Admin; no org context; Admin-Scope §5.6) → AUTHZ (`staff_super_admin`, DC-3) → SCOPE (target resolvable under Admin-Scope) → STATE (Doc-2 §5.1 `active ⇄ suspended`) → BUSINESS (reason recorded).
- **Error Register:** `identity_org_invalid_input` (VALIDATION, no) · `identity_org_forbidden` (AUTHORIZATION, no) · `identity_org_not_found` (NOT_FOUND, no) · `identity_org_state_invalid` (STATE, no) · `identity_org_status_conflict` (CONFLICT, no).
- **State Effects:** Doc-2 §5.1 `active ⇄ suspended` (platform governance).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization + Platform ("Super Admin access (flagged)", §9) by pointer — **`[ESC-IDN-AUDIT]`** (org suspend/reinstate not separately enumerated); attribution standard (Admin); Correlation both.
- **Events:** none (§8). **Reference Validation:** target existence under Admin-Scope (§B.9).
- **AI-Agent Notes:** platform-staff only; no tenant slug, no org context (§5.6); bind `staff_super_admin` (DC-3); carry `[ESC-IDN-AUDIT]`.

#### `identity.admin_recover_ownership.v1` — Ownership-Succession Recovery · 21.6 Admin · Actor: Admin · *(platform governance)*

- **Authorization:** Membership n/a; **no active org context** (§5.6); **Slug `staff_super_admin`** (DC-3 interim); Admin-Scope tenant-data; Delegation: not eligible.
- **Firewall:** §B.7 default (none).
- **Request Contract:** `organization_id : uuid : required` · `new_owner_user_id : uuid : required` · `reason_code : string : required : recovery justification (Architecture §5.5)` · `updated_at : timestamp : required`.
- **Response Contract:** `organization_id : uuid : always` · `new_owner_membership_id : uuid : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuids; reason) → CONTEXT (Admin; §5.6) → AUTHZ (`staff_super_admin`, DC-3) → SCOPE (org resolvable under Admin-Scope) → REFERENCE (`new_owner_user_id` exists; membership creatable/active) → BUSINESS (recovery only where no active Owner can act, §5.5; result satisfies Last Owner Protection).
- **Error Register:** `identity_org_invalid_input` (VALIDATION, no) · `identity_org_forbidden` (AUTHORIZATION, no) · `identity_org_not_found` (NOT_FOUND, no) · `identity_user_not_found` (REFERENCE, no) · `identity_org_recovery_invalid` (BUSINESS, no).
- **State Effects:** membership Owner (re)assignment (§5.2); no `organizations` §5.1 transition.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "ownership change/succession" (§9); attribution standard (Admin); Correlation both.
- **Events:** none (§8). **Reference Validation:** `new_owner_user_id` existence (§B.9).
- **AI-Agent Notes:** recovery path is for orphaned-ownership only (not a routine transfer — use `transfer_ownership`); result must satisfy Last Owner Protection; platform-staff only (DC-3).

---

## §C6 — Membership Contracts (`memberships`) — hardened

`memberships` (tenant-owned) gates all tenant access; only `active` participates in the access formula (Doc-4A §6.1). Transitions bind to **Doc-2 §5.2** (legal transitions only, §13). Management commands require `can_manage_users` (Doc-2 §7).

#### `identity.invite_member.v1` — Invite Member · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `can_manage_users`** (Doc-2 §7); Scope active-org; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `email : string(email) : required : invitee identifier (auth-managed; not an identity PII store beyond Doc-2 §3.2)` · `role_id : uuid : required : REF → identity.roles (same org)` · `department : string : optional`.
- **Response Contract:** `membership_id : uuid : always` · `state : enum : always` (= invited) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (email format; `role_id` uuid) → CONTEXT (active-org) → AUTHZ (`can_manage_users`) → SCOPE (caller's active org) → REFERENCE (`role_id` exists & same-tenant) → BUSINESS (not already an active/pending member; seat rules if configured).
- **Error Register (§B.5):** `identity_membership_invalid_input` (VALIDATION, no) · `identity_membership_forbidden` (AUTHORIZATION, no) · `identity_role_not_found` (REFERENCE, no) · `identity_membership_already_exists` (CONFLICT, no).
- **State Effects:** Doc-2 §5.2 `→ invited`.
- **Idempotency (§B.6):** required; dedup `…identity.membership_invite_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "membership invite" (§9); attribution standard; Mutation-Scope `identity.memberships`; Correlation both.
- **Events:** none (§8) — notification dispatch is **not** an identity event → **[DC-1]** if cross-module fan-out is required.
- **Reference Validation (§B.9):** `role_id` same-tenant existence.
- **AI-Agent Notes:** `invited` grants no access (∉ access formula); do **not** dispatch notifications from this contract (DC-1); `role_id` must be same-org (no cross-tenant role); email is an auth identifier (DC-4), validated for format only here.

#### `identity.accept_invitation.v1` — Accept Invitation · 21.4 Command · Actor: User (invitee)

- **Authorization:** Membership n/a (pre-membership); bound to the invitee identity (token/identity match); Slug none; Scope: the specific invitation; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `invitation_token : string : required : binds caller to the invitation` (or `membership_id` + identity match) · `updated_at : timestamp : optional`.
- **Response Contract:** `membership_id : uuid : always` · `state : enum : always` (= pending) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (token present) → CONTEXT (authenticated invitee) → SCOPE (invitation belongs to caller; `NOT_FOUND` collapse otherwise) → STATE (Doc-2 §5.2 `invited → pending`) → BUSINESS (invitation not expired/revoked).
- **Error Register:** `identity_membership_invalid_input` (VALIDATION, no) · `identity_membership_not_found` (NOT_FOUND, no — wrong/foreign invitation collapses) · `identity_membership_state_invalid` (STATE, no — already accepted/expired).
- **State Effects:** Doc-2 §5.2 `invited → pending`.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "membership accept" (§9); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** invitation→caller binding (§B.9).
- **AI-Agent Notes:** `pending` still grants no business access; collapse foreign-invitation existence to `NOT_FOUND` (§7.5); activation to `active` is a separate System step (`activate_membership`), not part of accept.

#### `identity.activate_membership.v1` — Activate Membership · 21.5 System · Actor: System

- **Authorization:** **System actor (FIXED)**; no slug; platform scope; **not user-invocable** (§13). **Trigger:** the infrastructure **account-verification-complete signal** (DC-4) — **not** a Doc-2 §8 event (no identity emitter; DC-1) and **not** a user command. (§B.10; Patch v1.0.1 PA-01)
- **Firewall:** §B.7 default (none).
- **Trigger / Request context:** [Phase-2] inputs are the `pending` membership row + the verification-complete signal for the bound user (DC-4 infra boundary); not a user request payload.
- **Response Contract:** `Response: none` — Phase-2 worker (21.5; PATCH-FA-01 — no `reference_id`).
- **Validation Matrix (§B.4):** SYNTAX (membership row well-formed) → CONTEXT (System actor; platform scope, §5.2) → STATE (Doc-2 §5.2 `pending → active`) → BUSINESS (verification-complete precondition satisfied; org/user not suspended).
- **Error Register (internal classification):** `identity_membership_state_invalid` (STATE, no) · `identity_membership_activation_precondition` (BUSINESS, no).
- **State Effects:** Doc-2 §5.2 `pending → active` (literal edge only; §13).
- **Idempotency (§B.6):** required (platform scope) — a membership already `active` is not re-activated.
- **Audit (§B.8):** yes; Domain Organization (membership activation, §9) by pointer — **`[ESC-IDN-AUDIT]`** (no enumerated "membership activate" action); **attribution system** (§17.3); Correlation phase2-origin.
- **Events:** none (§8).
- **AI-Agent Notes:** System-effected only — **never expose as a user-invocable endpoint** (§13); the trigger is the DC-4 infra verification signal, not an identity event (DC-1); attribution is System; carry `[ESC-IDN-AUDIT]`.

#### `identity.set_membership_status.v1` — Suspend / Reinstate Membership · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `can_manage_users`** (Doc-2 §7); Scope active-org; Delegation: not eligible.
- **Firewall:** §B.7 default (none).
- **Request Contract:** `membership_id : uuid : required` · `target_status : enum(suspended|active) : required` · `reason : string : optional` · `updated_at : timestamp : required`.
- **Response Contract:** `membership_id : uuid : always` · `state : enum : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid; enum) → CONTEXT (active-org) → AUTHZ (`can_manage_users`) → SCOPE (membership in caller's org) → STATE (Doc-2 §5.2 `active ⇄ suspended`) → BUSINESS (Last Owner Protection — cannot suspend the sole active Owner, §5.5).
- **Error Register:** `identity_membership_invalid_input` (VALIDATION, no) · `identity_membership_forbidden` (AUTHORIZATION, no) · `identity_membership_not_found` (NOT_FOUND, no) · `identity_membership_state_invalid` (STATE, no) · `identity_org_last_owner_block` (BUSINESS, no).
- **State Effects:** Doc-2 §5.2 `active ⇄ suspended`.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "membership suspend" (§9) — the suspend action records either direction (reinstate inverse-leg covered-by-suspend, per Patch v1.0.1 PA-02); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** membership same-tenant (§B.9).
- **AI-Agent Notes:** cannot suspend the last active Owner (run succession first); the suspend audit action covers reinstate (no separate action — do not invent); suspended membership ∉ access formula.

#### `identity.remove_member.v1` — Remove Member · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `can_manage_users`** (Doc-2 §7); Scope active-org; Delegation: not eligible.
- **Firewall:** §B.7 default (none).
- **Request Contract:** `membership_id : uuid : required` · `reason : string : optional` · `updated_at : timestamp : required`.
- **Response Contract:** `membership_id : uuid : always` · `state : enum : always` (= removed) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (`can_manage_users`) → SCOPE (membership in caller's org) → STATE (Doc-2 §5.2 `active|suspended → removed`; terminal, §13) → BUSINESS (Last Owner Protection, §5.5).
- **Error Register:** `identity_membership_invalid_input` (VALIDATION, no) · `identity_membership_forbidden` (AUTHORIZATION, no) · `identity_membership_not_found` (NOT_FOUND, no) · `identity_membership_state_invalid` (STATE, no) · `identity_org_last_owner_block` (BUSINESS, no).
- **State Effects:** Doc-2 §5.2 `→ removed` (terminal; audit retained; never reopens).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "membership remove" (§9); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** membership same-tenant (§B.9).
- **AI-Agent Notes:** `removed` is terminal — never reopen (re-invite creates a new membership); enforce Last Owner Protection; audit row retained after removal.

#### `identity.revoke_invitation.v1` — Revoke Invitation · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `can_manage_users`** (Doc-2 §7); Scope active-org; Delegation: not eligible.
- **Firewall:** §B.7 default (none).
- **Request Contract:** `membership_id : uuid : required : the invited (not yet accepted) membership` · `updated_at : timestamp : required`.
- **Response Contract:** `membership_id : uuid : always` · `state : enum : always` (= removed) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (`can_manage_users`) → SCOPE (invitation in caller's org) → STATE (Doc-2 §5.2 `invited → removed`).
- **Error Register:** `identity_membership_invalid_input` (VALIDATION, no) · `identity_membership_forbidden` (AUTHORIZATION, no) · `identity_membership_not_found` (NOT_FOUND, no) · `identity_membership_state_invalid` (STATE, no — already accepted/removed).
- **State Effects:** Doc-2 §5.2 `invited → removed` (terminal).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "membership remove" (§9); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** invitation same-tenant (§B.9).
- **AI-Agent Notes:** only valid on `invited` (use `remove_member` for active/suspended); terminal removed; audit retained.

#### `identity.expire_invitation.v1` — Expire Invitation · 21.5 System · Actor: System

- **Authorization:** **System actor (FIXED)**; no slug; platform scope; not user-invocable (§13).
- **Firewall:** §B.7 default (none).
- **Trigger / Request context:** [Phase-2] sweep over `invited` memberships whose invite window has lapsed (window POLICY key below).
- **Response Contract:** `Response: none` (21.5; PATCH-FA-01).
- **Validation Matrix (§B.4):** SYNTAX (row well-formed) → CONTEXT (System; platform scope, §5.2) → STATE (Doc-2 §5.2 `invited → removed` via expire) → BUSINESS (window elapsed).
- **Error Register (internal):** `identity_membership_state_invalid` (STATE, no).
- **State Effects:** Doc-2 §5.2 `invited → removed` (expire; terminal).
- **Idempotency (§B.6):** required (platform scope) — an already-removed invitation is not re-expired.
- **Audit (§B.8):** yes; Domain Organization "membership remove" (§9) by pointer; **attribution system** (§17.3); Correlation phase2-origin.
- **Events:** none (§8).
- **Timer window:** `core.system_configuration.identity.membership_invite_expiry_window` **[DC-5]**; sweep cadence `core.system_configuration.identity.delegation_expiry_sweep_cadence` is delegation-specific — membership-invite expiry uses its own window key only.
- **AI-Agent Notes:** System sweep; not user-invocable; window value pending DC-5 registration (no concrete value).

---

## §C7 — Role & Permission Contracts (`roles`, `role_permissions`, `permissions`) — hardened

`roles`/`role_permissions` are tenant-owned bundles; `permissions` is the **platform-owned slug catalog (read/list only — never extended here**, Doc-4A §6.4). Roles are bundles; checks use **slugs only** (§6.2). Role management has no dedicated slug in Doc-2 §7's minimal set → **`[ESC-IDN-SLUG]`** (interim `can_manage_users`; entry condition 3). Role *assignment to a member* is via `memberships.role_id` (§C6, `can_manage_users`).

#### `identity.list_permissions.v1` — List Permission Catalog · 21.3 Query · Actor: User / internal-service

- **Authorization:** Membership n/a; Slug none (reference data); Scope authenticated; Delegation n/a.
- **Request Contract:** `space : enum(tenant|staff) : optional : filter` · `cursor : string : optional` · `page_size : integer : optional` (bounded `[DC-5]`).
- **Response Contract:** `items : list<permission> : always` — `{ slug, description, space }` (Doc-2 §10.2); `page_info : object : always`; `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX (enum; pagination bounds) → CONTEXT (authenticated) → AUTHZ (entitled) → SCOPE (catalog is platform reference data).
- **Error Register:** `identity_permission_invalid_input` (VALIDATION, no).
- **Query semantics:** filter `space`; sort by `slug` (tiebreaker `slug`); cursor pagination. **Projection:** catalog fields only. **Read/list only — never a create/extend path** (§6.4).
- **Reference Validation:** none.
- **AI-Agent Notes:** **never** add/modify a slug here (catalog owned by Doc-2 §7; extension is a Doc-2 patch — do not invent); this is the lookup consumers use to validate slugs.

#### `identity.list_roles.v1` — List Roles · 21.3 Query · Actor: User

- **Authorization:** Membership active; Slug none (read); Scope active-org; Delegation n/a.
- **Request Contract:** `include_system : boolean : optional : default true` · `cursor : string : optional` · `page_size : integer : optional` (`[DC-5]`).
- **Response Contract:** `items : list<role> : always` — `{ role_id, name, is_system_bundle }` (Doc-2 §10.2); `page_info`; `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX → CONTEXT (active-org) → AUTHZ (member) → SCOPE (org-scoped; tenancy §7).
- **Error Register:** `identity_role_invalid_input` (VALIDATION, no).
- **Query semantics:** org-scoped list; sort by `name` (tiebreaker `role_id`); cursor pagination. **Visibility:** caller's org roles + platform seeds only (§7).
- **Reference Validation:** none.
- **AI-Agent Notes:** returns tenant bundles + system seeds; never expose another tenant's custom roles.

#### `identity.create_role.v1` — Create Role Bundle · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `[ESC-IDN-SLUG]`** (interim `can_manage_users`; no dedicated `can_manage_roles` in §7); Scope active-org; Delegation: not eligible.
- **Firewall:** §B.7 default (none).
- **Request Contract:** `name : string : required : bounded; unique-per-org` · `permission_slugs : list<string> : optional : initial bundle; each MUST exist in the §7 catalog`.
- **Response Contract:** `role_id : uuid : always` · `name : string : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (name; slug formats) → CONTEXT (active-org) → AUTHZ (role-administration — `[ESC-IDN-SLUG]`) → SCOPE (caller's org) → REFERENCE (each `permission_slug` ∈ §7 catalog) → BUSINESS (name unique-per-org; not a reserved system-bundle name).
- **Error Register:** `identity_role_invalid_input` (VALIDATION, no) · `identity_role_forbidden` (AUTHORIZATION, no) · `identity_permission_slug_unknown` (REFERENCE, no — unknown slug, never invented) · `identity_role_name_conflict` (CONFLICT, no).
- **State Effects:** simple (create); `role_permissions` rows created in-transaction if `permission_slugs` supplied.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "role/permission change" (§9); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** slugs ∈ catalog (§B.9, §6.4).
- **AI-Agent Notes:** custom roles are org-scoped; system bundles (Owner/Director/Manager/Officer) are platform seeds — never recreate/rename; carry `[ESC-IDN-SLUG]`; reject unknown slugs (REFERENCE), never auto-create them.

#### `identity.update_role.v1` — Update Role Bundle · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `[ESC-IDN-SLUG]`** (interim `can_manage_users`); Scope active-org; Delegation: not eligible.
- **Request Contract:** `role_id : uuid : required` · `name : string : optional : bounded; unique-per-org` · `updated_at : timestamp : required`.
- **Response Contract:** `role_id : uuid : always` · `name : string : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid; name) → CONTEXT (active-org) → AUTHZ (`[ESC-IDN-SLUG]`) → SCOPE (role in caller's org) → BUSINESS (system bundle not renamable; name unique-per-org).
- **Error Register:** `identity_role_invalid_input` (VALIDATION, no) · `identity_role_forbidden` (AUTHORIZATION, no) · `identity_role_not_found` (NOT_FOUND, no) · `identity_role_system_protected` (BUSINESS, no) · `identity_role_name_conflict` (CONFLICT, no).
- **State Effects:** simple. **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "role/permission change" (§9); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** role same-tenant (§B.9).
- **AI-Agent Notes:** system bundles are protected (metadata immutable); carry `[ESC-IDN-SLUG]`.

#### `identity.set_role_permissions.v1` — Compose Role Permissions · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `[ESC-IDN-SLUG]`** (interim `can_manage_users`); Scope active-org; Delegation: not eligible.
- **Request Contract:** `role_id : uuid : required` · `add_slugs : list<string> : optional` · `remove_slugs : list<string> : optional` (each slug MUST exist in the §7 catalog) · `updated_at : timestamp : required`.
- **Response Contract:** `role_id : uuid : always` · `effective_slugs : list<string> : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid; slug formats) → CONTEXT (active-org) → AUTHZ (`[ESC-IDN-SLUG]`) → SCOPE (role in caller's org) → REFERENCE (every add/remove slug ∈ §7 catalog) → BUSINESS (system-bundle composition policy; row removal = revoked, audited).
- **Error Register:** `identity_role_invalid_input` (VALIDATION, no) · `identity_role_forbidden` (AUTHORIZATION, no) · `identity_role_not_found` (NOT_FOUND, no) · `identity_permission_slug_unknown` (REFERENCE, no) · `identity_role_system_protected` (BUSINESS, no).
- **State Effects:** simple (`role_permissions` rows added/removed; removal = revoked).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "role/permission change" (§9); attribution standard; Mutation-Scope `identity.role_permissions`; Correlation both.
- **Events:** none (§8). **Reference Validation:** slugs ∈ catalog (§6.4); role same-tenant (§B.9).
- **AI-Agent Notes:** assign **slugs only** (a role is never a permission, §6.2); reject unknown slugs (never invent); removing a slug is an audited revocation; respect system-bundle protection.

#### `identity.delete_role.v1` — Delete Role Bundle · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `[ESC-IDN-SLUG]`** (interim `can_manage_users`); Scope active-org; Delegation: not eligible.
- **Request Contract:** `role_id : uuid : required` · `updated_at : timestamp : required`.
- **Response Contract:** `role_id : uuid : always` · `deleted : boolean : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (`[ESC-IDN-SLUG]`) → SCOPE (role in caller's org) → BUSINESS (system bundle not deletable; no active member still bound to the role).
- **Error Register:** `identity_role_invalid_input` (VALIDATION, no) · `identity_role_forbidden` (AUTHORIZATION, no) · `identity_role_not_found` (NOT_FOUND, no) · `identity_role_system_protected` (BUSINESS, no) · `identity_role_in_use` (BUSINESS, no — members still bound).
- **State Effects:** simple (soft-delete). **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization "role/permission change" (§9); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** role same-tenant; no active membership references it (§B.9).
- **AI-Agent Notes:** block deletion while members are bound (reassign first); system bundles undeletable; carry `[ESC-IDN-SLUG]`.

---

## §C8 — Authorization & Active-Organization Context — hardened

Identity's defining responsibility — the authorization/tenancy-context root. Binds to Doc-4A §5/§6/§6B; does not redefine them. **`identity.check_permission.v1` is authored once in §C3** (the §6/§6B resolution) and is **referenced, not duplicated, here** (no duplicated permission resolution — §B.11).

#### `identity.switch_active_organization.v1` — Switch Active Organization · 21.4 Command · Actor: User

- **Authorization:** Membership **active in the target org** (§6.1); Slug none (context selection, not a tenant action); Scope: the target org; Delegation: not eligible (context selection, not an act-as path). (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `organization_id : uuid : required : target active org`.
- **Response Contract:** `organization_id : uuid : always` (server-validated active context) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (authenticated user) → AUTHZ (caller holds **active** membership in target, §6.1) → SCOPE (membership active; `NOT_FOUND` collapse if not a member) → BUSINESS (org not suspended for the user's access).
- **Error Register:** `identity_context_invalid_input` (VALIDATION, no) · `identity_context_not_found` (NOT_FOUND, no — not an active member; collapse) · `identity_context_state_invalid` (BUSINESS, no).
- **State Effects:** none (session context; no entity §5 transition).
- **Idempotency (§B.6):** **idempotent by nature** — setting the same active org is a no-op; declare `Idempotency: required` (replay → same context), no side effect.
- **Audit (§B.8):** **no** — context selection is operational, not a Doc-2 §9 business action (§17.1).
- **Events:** none (§8). **Reference Validation:** active membership in target (§B.9).
- **AI-Agent Notes:** active-org context is **server-validated, never client-asserted** (§5.3); only an `active` membership permits the switch; this is the only sanctioned way to set tenant context — downstream contracts read the server context, never a client-supplied org.

#### `identity.get_active_context.v1` — Get Active Context · 21.3 Query · Actor: User

- **Authorization:** Membership active (current context); Slug none; Scope self/active-org; Delegation n/a.
- **Request Contract:** *(none — resolves the caller's session context)*.
- **Response Contract:** `organization_id : uuid : always` · `membership : object : always` (`state`, `role_id`) · `effective_permission_summary : list<string> : always` (resolved slugs for the active org; from `check_permission` resolution, not re-derived) · `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX (none) → CONTEXT (authenticated; active context set) → AUTHZ (self) → SCOPE (own context only).
- **Error Register:** `identity_context_not_found` (NOT_FOUND, no — no active context).
- **Query semantics:** single self-context read; no list. **Projection:** caller's own context only (§7). **Visibility:** never another user's context.
- **Reference Validation:** session context resolution.
- **AI-Agent Notes:** the permission summary is a **projection of `check_permission` resolution**, not an independent computation (no shadow authz); returns only the caller's context.

#### `identity.list_my_organizations.v1` — List My Organizations · 21.3 Query · Actor: User

- **Authorization:** Membership n/a (lists the caller's memberships); Slug none; Scope self; Delegation n/a.
- **Request Contract:** `state_filter : enum(active|all) : optional : default active` · `cursor : string : optional` · `page_size : integer : optional` (`[DC-5]`).
- **Response Contract:** `items : list<object> : always` — `{ organization_id, name, membership_state, role_id }` for orgs the caller belongs to; `page_info`; `reference_id : uuid : always`. Solo Trader guarantees ≥1.
- **Validation Matrix (query):** SYNTAX (enum; pagination) → CONTEXT (authenticated) → AUTHZ (self) → SCOPE (caller's memberships only).
- **Error Register:** `identity_context_invalid_input` (VALIDATION, no).
- **Query semantics:** filter by membership `state`; sort by org `name` (tiebreaker `organization_id`); cursor pagination. **Visibility:** only orgs where the caller has a membership (§7).
- **Reference Validation:** none.
- **AI-Agent Notes:** the context-switcher source list; never list orgs the caller has no membership in; default to `active` memberships.

---

## §C9 — Delegation Grant Contracts (`delegation_grants`) — hardened

`delegation_grants` is a **shared dual-party record** (both party orgs read; **only the controlling org manages** — Doc-2 §10.2). All management **binds to the Doc-4A §6B Delegation Grant Declaration Standard** (eligibility, the **five-condition delegated-access check**, the **four-attribution rule**, suspension/revocation behavior) — **not redefined here**. Transitions bind to **Doc-2 §5.10** (legal transitions only, §13). **Grants delegate authority; never create it**, and never cover ownership-class actions (§5.10 guard). Revocation/expiry teardown of `rfq_invitation_grantees`/visibility is a **Module 3 cross-module effect → [DC-1]** (no Template 21.2 instantiated). `vendor_profile_id` is a **bare UUID ref** validated via the Vendor Service (read-validation only; §B.9).

#### `identity.create_delegation_grant.v1` — Issue Delegation Grant · 21.4 Command · Actor: User (controlling org)

- **Authorization:** Membership active; **Slug `can_manage_delegations`** (Doc-2 §7, O,D); Scope = controlling org; bound to §6B eligibility (five-condition check). Delegation: this contract **issues** a grant (it is not itself a delegated act). (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:**
  - `representative_organization_id : uuid : required : the grantee org`
  - `vendor_profile_id : uuid : required : the controlled vendor profile (bare UUID ref; validated via Vendor Service — not owned, §C1)`
  - `permission_set : list<string> : required : PermissionSet (JSONB array of slugs, Doc-2 §2); each MUST exist in the §7 catalog; never ownership-class slugs (§5.10 guard)`
  - `valid_from : timestamp : optional : default now` · `valid_to : timestamp : optional : default per `…identity.delegation_validity_default` [DC-5]`
- **Response Contract:** `delegation_grant_id : uuid : always` · `status : enum : always` (= active) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuids; slug formats; valid_from < valid_to) → CONTEXT (active-org = controlling) → AUTHZ (`can_manage_delegations`) → SCOPE (caller is the controlling org of `vendor_profile_id`) → DELEGATION (§6B eligibility — controlling org controls the profile; representative is a distinct active org) → REFERENCE (`representative_organization_id` exists; `vendor_profile_id` via Vendor Service; each slug ∈ §7 catalog) → BUSINESS (no ownership-class slug; `controlling_organization_id` validated at issue, Doc-2 §10.2).
- **Error Register:** `identity_delegation_invalid_input` (VALIDATION, no) · `identity_delegation_forbidden` (AUTHORIZATION, no) · `identity_delegation_not_controller` (AUTHORIZATION, no — caller not the controlling org) · `identity_org_not_found` (REFERENCE, no) · `identity_delegation_vendor_ref_invalid` (REFERENCE, no) · `identity_permission_slug_unknown` (REFERENCE, no) · `identity_delegation_ownership_class_block` (BUSINESS, no).
- **State Effects:** Doc-2 §5.10 `draft → active`.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5]; validity default `…identity.delegation_validity_default` [DC-5].
- **Audit (§B.8):** yes; Domain **Vendor profile** "delegation grant issue" (§9) by pointer; attribution standard; Mutation-Scope `identity.delegation_grants`; Correlation both.
- **Events:** none (§8). **Reference Validation (§B.9):** `representative_organization_id` (Org service), `vendor_profile_id` (Vendor service, read-only), slugs (§7 catalog).
- **AI-Agent Notes:** controlling org pays/owns (four-attribution rule, §6B); grant never includes ownership-class slugs; `vendor_profile_id` is validated, not owned (no FK, no integration — DC-1 unaffected); evaluation of the grant at act-time is `check_permission` (§C8), not re-implemented.

#### `identity.suspend_delegation_grant.v1` — Suspend Delegation Grant · 21.4 Command · Actor: User (controlling org)

- **Authorization:** Membership active; **Slug `can_manage_delegations`**; Scope = controlling org (§6B); Delegation: not eligible.
- **Request Contract:** `delegation_grant_id : uuid : required` · `reason : string : optional` · `updated_at : timestamp : required`.
- **Response Contract:** `delegation_grant_id : uuid : always` · `status : enum : always` (= suspended) · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (`can_manage_delegations`) → SCOPE (caller is controlling org) → DELEGATION (§6B controller check) → STATE (Doc-2 §5.10 `active → suspended`).
- **Error Register:** `identity_delegation_invalid_input` (VALIDATION, no) · `identity_delegation_forbidden` (AUTHORIZATION, no) · `identity_delegation_not_found` (NOT_FOUND, no) · `identity_delegation_state_invalid` (STATE, no).
- **State Effects:** Doc-2 §5.10 `active → suspended`. (§6B suspension behavior: delegated access ceases while suspended.)
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Vendor profile "delegation grant suspend" (§9); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** grant exists; caller is controller (§B.9).
- **AI-Agent Notes:** suspension immediately removes effective delegated access (evaluated via `check_permission`); only the controlling org may suspend.

#### `identity.reinstate_delegation_grant.v1` — Reinstate Delegation Grant · 21.4 Command · Actor: User (controlling org)

- **Authorization:** Membership active; **Slug `can_manage_delegations`**; Scope = controlling org (§6B); Delegation: not eligible.
- **Request Contract:** `delegation_grant_id : uuid : required` · `updated_at : timestamp : required`.
- **Response Contract:** `delegation_grant_id : uuid : always` · `status : enum : always` (= active) · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (`can_manage_delegations`) → SCOPE (controlling org) → STATE (Doc-2 §5.10 `suspended → active`) → BUSINESS (**`[ESC-IDN-DELEG-EXPIRY]`** — whether reinstatement is permitted when `valid_to` has already lapsed is **unspecified in Doc-2 §5.10**; carried to the Doc-2 §5.10 channel, **not resolved here** — entry condition 4; interim: reinstatement does not extend an elapsed validity window).
- **Error Register:** `identity_delegation_invalid_input` (VALIDATION, no) · `identity_delegation_forbidden` (AUTHORIZATION, no) · `identity_delegation_not_found` (NOT_FOUND, no) · `identity_delegation_state_invalid` (STATE, no). *(The lapsed-window-reinstatement error disposition is **carried under `[ESC-IDN-DELEG-EXPIRY]`** and not finalized — entry condition 4.)*
- **State Effects:** Doc-2 §5.10 `suspended → active`.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Vendor profile (delegation suspend/reinstate pair) by pointer — reinstate covered-by-suspend (Patch v1.0.1 PA-02); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** grant exists; caller is controller (§B.9).
- **AI-Agent Notes:** carry **`[ESC-IDN-DELEG-EXPIRY]`** — do **not** assume reinstatement into an elapsed `valid_to` is valid (Doc-2 §5.10 silent; await clarification); never invent a `suspended → expired` edge; only the controlling org may reinstate.

#### `identity.revoke_delegation_grant.v1` — Revoke Delegation Grant · 21.4 Command · Actor: User (controlling org)

- **Authorization:** Membership active; **Slug `can_manage_delegations`**; Scope = controlling org; Delegation: not eligible.
- **Request Contract:** `delegation_grant_id : uuid : required` · `reason : string : optional` · `updated_at : timestamp : required`.
- **Response Contract:** `delegation_grant_id : uuid : always` · `status : enum : always` (= revoked) · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (uuid) → CONTEXT (active-org) → AUTHZ (`can_manage_delegations`) → SCOPE (controlling org) → DELEGATION (§6B controller) → STATE (Doc-2 §5.10 `active|suspended → revoked`; terminal, §13).
- **Error Register:** `identity_delegation_invalid_input` (VALIDATION, no) · `identity_delegation_forbidden` (AUTHORIZATION, no) · `identity_delegation_not_found` (NOT_FOUND, no) · `identity_delegation_state_invalid` (STATE, no).
- **State Effects:** Doc-2 §5.10 `→ revoked` (terminal). **Teardown (cross-module, BLOCKED — [DC-1]):** remove derived `rfq_invitation_grantees` + visibility rows for the representative (M3); removals audited (§5.10). **No Template 21.2 instantiated** (entry condition 1).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Vendor profile "delegation grant revoke" (§9); attribution standard; Correlation both.
- **Events:** **none — §8 designates no `identity` emitter**; teardown has no emitter → **[DC-1]**.
- **Reference Validation:** grant exists; caller is controller (§B.9).
- **AI-Agent Notes:** terminal revoked (never reopens); apply only the in-module status change — the M3 grantee/visibility teardown is **blocked on DC-1** (do not synthesize an event or call M3); removals are audited once DC-1 resolves.

#### `identity.expire_delegation_grant.v1` — Expire Delegation Grant · 21.5 System · Actor: System

- **Authorization:** **System actor (FIXED)**; no slug; platform scope; not user-invocable (§13).
- **Firewall:** §B.7 default (none).
- **Trigger / Request context:** [Phase-2] sweep over `active` grants whose `valid_to` has lapsed.
- **Response Contract:** `Response: none` (21.5; PATCH-FA-01).
- **Validation Matrix (§B.4):** SYNTAX (row well-formed) → CONTEXT (System; platform scope, §5.2) → STATE (Doc-2 §5.10 `active → expired`; **literal edge only**) → BUSINESS (**`[ESC-IDN-DELEG-EXPIRY]`** — the `suspended`-at-`valid_to`-lapse disposition is **unspecified in Doc-2 §5.10**; the sweep acts on the `active → expired` edge **only**; the suspended case is carried to the Doc-2 §5.10 channel, **not resolved here** — entry condition 4).
- **Error Register (internal):** `identity_delegation_state_invalid` (STATE, no). *(Suspended-at-expiry handling is **carried under `[ESC-IDN-DELEG-EXPIRY]`**, not finalized.)*
- **State Effects:** Doc-2 §5.10 `active → expired` (terminal; literal edge only). **Teardown (cross-module, BLOCKED — [DC-1]):** same `rfq_invitation_grantees`/visibility teardown as revocation (M3).
- **Idempotency (§B.6):** required (platform scope) — an already-terminal grant is not re-expired.
- **Audit (§B.8):** yes; Domain Vendor profile (delegation revoke/expiry family) by pointer — **`[ESC-IDN-AUDIT]`** (delegation expiry not separately enumerated, Patch v1.0.1 PA-02); **attribution system** (§17.3); Correlation phase2-origin.
- **Events:** none (§8); teardown → **[DC-1]**.
- **Timer/sweep:** `core.system_configuration.identity.delegation_validity_default` (validity span) + `core.system_configuration.identity.delegation_expiry_sweep_cadence` (sweep cadence) **[DC-5]** (Patch v1.0.1 PA-04).
- **AI-Agent Notes:** System sweep on the **literal `active → expired` edge only**; carry **`[ESC-IDN-DELEG-EXPIRY]`** — do not expire `suspended` grants until Doc-2 §5.10 clarifies; teardown blocked on DC-1; window/cadence values pending DC-5 registration.

#### `identity.get_delegation_grant.v1` — Get Delegation Grant · 21.3 Query · Actor: User (either party org)

- **Authorization:** Membership active in a **party org** (controlling or representative); Slug none (dual-party read); Scope party-org; Delegation n/a.
- **Request Contract:** `delegation_grant_id : uuid : required`.
- **Response Contract:** `delegation_grant : object : always` — `{ delegation_grant_id, controlling_organization_id, representative_organization_id, vendor_profile_id, permission_set, valid_from, valid_to, status }` (Doc-2 §10.2); `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX (uuid) → CONTEXT (authenticated; party-org context) → AUTHZ (caller in a party org) → SCOPE (RLS `organization_id IN (controlling, representative)`; `NOT_FOUND` collapse beyond parties, §7.5).
- **Error Register:** `identity_delegation_invalid_input` (VALIDATION, no) · `identity_delegation_not_found` (NOT_FOUND, no — non-party collapse).
- **Query semantics:** single-grant read. **Visibility:** parties only; never disclose a grant to a non-party (§7.5).
- **Reference Validation:** caller ∈ party orgs (§B.9).
- **AI-Agent Notes:** dual-party read (both orgs see it); collapse non-party access to `NOT_FOUND`; only the controlling org may *manage* (reads are dual-party, writes are controller-only).

#### `identity.list_delegation_grants.v1` — List Delegation Grants · 21.3 Query · Actor: User (party org)

- **Authorization:** Membership active; Slug none; Scope party-org (controlling or representative filter); Delegation n/a.
- **Request Contract:** `role_filter : enum(as_controlling|as_representative|any) : optional : default any` · `status_filter : enum : optional` · `vendor_profile_id : uuid : optional : filter` · `cursor : string : optional` · `page_size : integer : optional` (`[DC-5]`).
- **Response Contract:** `items : list<delegation_grant> : always`; `page_info : object : always`; `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX (enums; uuid; pagination) → CONTEXT (active-org) → AUTHZ (member of a party org) → SCOPE (party-org filter; RLS dual-party).
- **Error Register:** `identity_delegation_invalid_input` (VALIDATION, no).
- **Query semantics:** filters role/status/`vendor_profile_id`; sort by `valid_from` (tiebreaker `delegation_grant_id`); cursor pagination. **Visibility:** grants where the active org is a party only (§7).
- **Reference Validation:** active-org party scope (§B.9).
- **AI-Agent Notes:** scope strictly to the active org's party role; never surface a third-party grant; status/role filters never widen visibility beyond party scope.

---

## §C10 — Buyer Profile Contracts (`buyer_profiles`) — hardened

`buyer_profiles` is **tenant-owned and optional** (Doc-2 §3.2). It enhances matching (read by Module 3) but is **owned and edited only by the organization** — Module 3 reads via the Identity service, never the table (One Owner; no cross-module ownership).

#### `identity.upsert_buyer_profile.v1` — Create / Update Buyer Profile · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `[ESC-IDN-SLUG]`** — no dedicated buyer-profile slug in §7's minimal set; interim Owner/Director authority (entry condition 3); Scope active-org; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `industry : string : optional` · `factory_info : object : optional : factory_info_jsonb (Doc-2 §10.2)` · `delivery_locations : list<object> : optional : delivery_locations_jsonb` · `procurement_preferences : object : optional : procurement_preferences_jsonb` · `approval_settings : object : optional` · `updated_at : timestamp : optional : concurrency (on update)`.
- **Response Contract:** `buyer_profile_id : uuid : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (jsonb shapes; field bounds) → CONTEXT (active-org) → AUTHZ (buyer-profile administration — `[ESC-IDN-SLUG]`) → SCOPE (caller's org owns/creates the profile) → BUSINESS (one buyer profile per org; upsert semantics).
- **Error Register:** `identity_buyer_profile_invalid_input` (VALIDATION, no) · `identity_buyer_profile_forbidden` (AUTHORIZATION, no) · `identity_buyer_profile_conflict` (CONFLICT, no — stale `updated_at`).
- **State Effects:** simple (upsert).
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5]; optimistic on `updated_at` for updates.
- **Audit (§B.8):** yes; Domain Organization (buyer-profile change) by pointer — **`[ESC-IDN-AUDIT]`** (not separately enumerated); attribution standard.
- **Events:** none (§8). **Reference Validation:** owning-org scope (§B.9).
- **AI-Agent Notes:** owned/edited by the org only — Module 3 consumes via `get_buyer_profile`, never the table; carry `[ESC-IDN-SLUG]` + `[ESC-IDN-AUDIT]`; jsonb fields are bounded schemas, not arbitrary blobs.

#### `identity.get_buyer_profile.v1` — Get Buyer Profile · 21.3 Query (internal-service) · Actor: User / internal-service

- **Authorization:** owning-org Scope for org reads; internal-service caller-context for Module 3; Slug none; Delegation n/a. (§B.10)
- **Request Contract:** `organization_id : uuid : required` (the owning org).
- **Response Contract:** `buyer_profile : object : always` — `{ buyer_profile_id, organization_id, industry, factory_info, delivery_locations, procurement_preferences }`; `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX (uuid) → CONTEXT (caller — org member or internal-service) → AUTHZ (entitled) → SCOPE (owning-org; `NOT_FOUND` collapse otherwise).
- **Error Register:** `identity_buyer_profile_invalid_input` (VALIDATION, no) · `identity_buyer_profile_not_found` (NOT_FOUND, no).
- **Query semantics:** single read. **Projection:** owning-org / entitled consumer fields. **Visibility:** the owning org and entitled internal consumers (M3) only (§7).
- **Reference Validation:** `organization_id` existence + owning scope (§B.9).
- **AI-Agent Notes:** the **only** sanctioned read path for Module 3 (no direct table access — One Owner); never expose one org's buyer profile to another tenant.

---

## §C11 — Organization Workflow Settings Contracts (`organization_workflow_settings`) — hardened

`organization_workflow_settings` is **tenant-owned** and the **ORG** leg of FIXED/POLICY/ORG (Doc-4A §18.4 / Doc-3 §12.3): RFQ approval mode/chain, financial/award thresholds, notification rules, default routing mode, buyer-courtesy options. Consumed by Module 3 (approval gate) and Module 6 (notifications). A workflow setting **may add required approvals but never remove a required slug** (§6.2) — it cannot weaken FIXED authz. Distinct from POLICY (Module 0) and FIXED.

#### `identity.get_workflow_settings.v1` — Get Workflow Settings · 21.3 Query (internal-service) · Actor: User / internal-service

- **Authorization:** owning-org Scope; internal-service caller-context for consumers (M3, M6); Slug none; Delegation n/a.
- **Request Contract:** `organization_id : uuid : required`.
- **Response Contract:** `workflow_settings : object : always` — `{ rfq_approval_mode, approval_chain, financial_permissions, notification_rules, default_routing_mode, buyer_courtesy_options }` (Doc-2 §10.2; Doc-3 §12.3); `reference_id : uuid : always`.
- **Validation Matrix (query):** SYNTAX (uuid) → CONTEXT (caller — member or internal-service) → AUTHZ (entitled) → SCOPE (owning-org; `NOT_FOUND` collapse).
- **Error Register:** `identity_workflow_invalid_input` (VALIDATION, no) · `identity_workflow_not_found` (NOT_FOUND, no).
- **Query semantics:** single read. **Projection:** ORG-setting fields. **Visibility:** owning org + entitled consumers (M3 approval gate, M6 notifications) (§7).
- **Reference Validation:** `organization_id` existence + scope (§B.9).
- **AI-Agent Notes:** the ORG-setting read consumed cross-module — consumers read here, never the table; the **mechanism is frozen** (Doc-3 §12.3); values are ORG-tunable within POLICY bounds.

#### `identity.update_workflow_settings.v1` — Update Workflow Settings · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `can_manage_workflow_settings`** (Doc-2 §7, O,D); Scope active-org; Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none).
- **Request Contract:** `rfq_approval_mode : enum(none|single|multi_step) : optional` · `approval_chain : list<object> : optional : approval_chain_jsonb` · `financial_permissions : object : optional : financial_permissions_jsonb (thresholds)` · `notification_rules : object : optional : notification_rules_jsonb` · `default_routing_mode : enum : optional` · `buyer_courtesy_options : object : optional` · `updated_at : timestamp : required`.
- **Response Contract:** `organization_id : uuid : always` · `updated_at : timestamp : always` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (enums; jsonb shapes) → CONTEXT (active-org) → AUTHZ (`can_manage_workflow_settings`) → SCOPE (caller's org) → BUSINESS (ORG values within POLICY bounds, §18.4/§12.3; an approval setting may **add** required approvals but **never remove a required slug**, §6.2) → POLICY (bounds resolved via Doc-4B `core.config_value_query.v1` where Doc-3 §12.3 defines).
- **Error Register:** `identity_workflow_invalid_input` (VALIDATION, no) · `identity_workflow_forbidden` (AUTHORIZATION, no) · `identity_workflow_not_found` (NOT_FOUND, no) · `identity_workflow_policy_violation` (BUSINESS, no — out of POLICY bounds / would weaken FIXED authz) · `identity_workflow_conflict` (CONFLICT, no).
- **State Effects:** simple.
- **Idempotency (§B.6):** required; dedup `…identity.command_dedup_window` [DC-5]; optimistic on `updated_at`.
- **Audit (§B.8):** yes; Domain Organization "workflow settings change" (§9); attribution standard; Correlation both.
- **Events:** none (§8). **Reference Validation:** owning-org scope; POLICY bounds via Module 0 (§B.9).
- **AI-Agent Notes:** ORG settings **strengthen but never weaken** FIXED authz (§6.2 — never remove a required slug); resolve POLICY bounds via Module 0 (`core.config_value_query.v1`), never hard-code; consumed by M3/M6 — keep the contract the single write path.

---

## §C12 — Cross-Cutting Declarations for Identity Contracts (hardened)

The Pass-A §C12 declaration defaults (as amended by Patch v1.0.1) are **realized in Pass-B** through the §B conventions + per-contract blocks; they are **unchanged in substance** and bound here by pointer (no restatement, no drift).

- **C12.1 Actor model** (§B.10): **User** (primary; server-validated active-org context, §5.3); **Admin** (platform governance — org suspend/reinstate §5.1, ownership-succession recovery §5.5, user suspend/reinstate — 21.6, no active org context §5.6, `staff_*` per DC-3); **System** (21.5, `Response: none`, not user-invocable §13 — membership-invite expiry, delegation-grant expiry, **and membership activation on verification-complete** per Patch v1.0.1); **internal-service** (D-1 composition; §C3 + `get_workflow_settings` + `get_buyer_profile`).
- **C12.2 Tenancy** (§B.2): per Doc-2 §6 — `users`/`permissions` platform-owned; `organizations` tenant root; `memberships`/`roles`/`role_permissions`/`buyer_profiles`/`organization_workflow_settings` tenant-owned; `delegation_grants` shared (RLS `organization_id IN (controlling, representative)`). Cross-module refs are bare UUIDs, service-validated, no FK.
- **C12.3 Audit** (§B.8): binds to Doc-2 §9 (Organization domain + delegation actions in the Vendor profile domain) via Doc-4B `core.append_audit_record.v1`; immutable, in-transaction, never re-implemented; reads not audited; **`[ESC-IDN-AUDIT]`** carried (Patch v1.0.1 coverage) for org-profile change, user-account suspend/reinstate, anonymization, org suspend/reinstate, 2FA-settings change, buyer-profile change, membership activation, delegation expiry — reinstate inverse-legs covered-by-suspend; nothing invented.
- **C12.4 Events** (§B and §16): **Module 1 produces no domain events** (Doc-2 §8 — no `identity` emitter); `Events-Produced: none` on every contract; no `Events-Consumed` authored; cross-module synchronization is **[DC-1]**; Template 21.2 not instantiated (entry condition 1).
- **C12.5 Idempotency** (§B.6): every mutation `Idempotency: required` with an intended `identity.*` dedup-window key **[DC-5]** (no concrete value); §14.3 joint rule; System contracts platform-scope; queries `not-applicable`.
- **C12.6 Error namespace & firewall** (§B.5/§B.7): `identity_<domain>_<code>` (closed class set; protected-fact NOT_FOUND collapse); **Firewall-Compliance default `none`** — identity touches no governance signal; no plan/entitlement/flag/config gates identity authorization (§18.3, §4B).
- **C12.7 Doc-4B consumption** (Appendix B): `core.append_audit_record.v1` (every audited mutation); `core.allocate_human_reference.v1` (`create_organization` only); UUIDv7 generation (every create); `core.config_value_query.v1` (POLICY bounds, dedup/timer/sweep windows — `[DC-5]` keys pending); `core.feature_flag_evaluate.v1` (optional rollout; never a firewall concern); **`core.write_outbox_event.v1` not consumed** (no identity events). All by pointer; none re-implemented.

---

## Appendix A — Module 1 Contract Inventory (hardened)

The **42 contracts** of the closed Pass-A, each now carrying a full hardened block above (Request/Response, validation matrix, error register, idempotency, audit, authorization, reference validation, AI-agent notes). Templates/actors/entities/markers are **carried unchanged** from the closed Pass-A (reflecting Patch v1.0.1). Markers: `[DC-n]`, `[ESC-IDN-SLUG]` (S), `[ESC-IDN-AUDIT]` (A), `[ESC-IDN-DELEG-EXPIRY]` (E).

| § | Contract-ID | Entity | Template | Actor | Markers |
|---|---|---|---|---|---|
| C3 | `identity.get_user.v1` | users | 21.3 (int-svc) | internal-service | — |
| C3 | `identity.get_organization.v1` | organizations | 21.3 (int-svc) | internal-service | — |
| C3 | `identity.get_membership.v1` | memberships | 21.3 (int-svc) | internal-service | — |
| C3 | `identity.check_permission.v1` | memberships/roles/role_permissions/permissions/delegation_grants | 21.3 (int-svc) | internal-service | authoritative-source |
| C4 | `identity.update_user_profile.v1` | users | 21.4 | User (self) | DC-5 |
| C4 | `identity.update_user_2fa_settings.v1` | users | 21.4 | User (self) | DC-4, A, DC-5 |
| C4 | `identity.deactivate_own_account.v1` | users | 21.4 | User (self) | A, DC-5 |
| C4 | `identity.set_user_account_status.v1` | users | 21.6 Admin | Admin | DC-3, A, DC-5 |
| C5 | `identity.create_organization.v1` | organizations (+founding membership) | 21.4 | User | DC-5; consumes `core.allocate_human_reference.v1` |
| C5 | `identity.update_organization_profile.v1` | organizations | 21.4 | User | S, A, DC-5 |
| C5 | `identity.transfer_ownership.v1` | organizations/memberships | 21.4 | User (Owner) | DC-5 |
| C5 | `identity.soft_delete_organization.v1` | organizations (+in-module memberships) | 21.4 | User (Owner) | DC-1, DC-5 |
| C5 | `identity.restore_organization.v1` | organizations | 21.4 | User (Owner)/Admin | DC-1, DC-3, DC-5 |
| C5 | `identity.set_organization_status.v1` | organizations | 21.6 Admin | Admin | DC-3, A, DC-5 |
| C5 | `identity.admin_recover_ownership.v1` | organizations/memberships | 21.6 Admin | Admin | DC-3, DC-5 |
| C6 | `identity.invite_member.v1` | memberships | 21.4 | User | DC-1 (notify), DC-5 |
| C6 | `identity.accept_invitation.v1` | memberships | 21.4 | User (invitee) | DC-5 |
| C6 | `identity.activate_membership.v1` | memberships | 21.5 System | System | DC-4, A, DC-5 |
| C6 | `identity.set_membership_status.v1` | memberships | 21.4 | User | DC-5 |
| C6 | `identity.remove_member.v1` | memberships | 21.4 | User | DC-5 |
| C6 | `identity.revoke_invitation.v1` | memberships | 21.4 | User | DC-5 |
| C6 | `identity.expire_invitation.v1` | memberships | 21.5 System | System | DC-5 |
| C7 | `identity.list_permissions.v1` | permissions | 21.3 | User/int-svc | read/list-only |
| C7 | `identity.list_roles.v1` | roles | 21.3 | User | DC-5 (page bound) |
| C7 | `identity.create_role.v1` | roles | 21.4 | User | S, DC-5 |
| C7 | `identity.update_role.v1` | roles | 21.4 | User | S, DC-5 |
| C7 | `identity.set_role_permissions.v1` | role_permissions | 21.4 | User | S, DC-5 |
| C7 | `identity.delete_role.v1` | roles | 21.4 | User | S, DC-5 |
| C8 | `identity.check_permission.v1` | *(authored in §C3)* | 21.3 (int-svc) | internal-service | bound here; not duplicated |
| C8 | `identity.switch_active_organization.v1` | memberships (context) | 21.4 | User | DC-5 |
| C8 | `identity.get_active_context.v1` | memberships/roles/role_permissions | 21.3 | User | — |
| C8 | `identity.list_my_organizations.v1` | memberships/organizations | 21.3 | User | DC-5 (page bound) |
| C9 | `identity.create_delegation_grant.v1` | delegation_grants | 21.4 | User (controlling) | DC-5 |
| C9 | `identity.suspend_delegation_grant.v1` | delegation_grants | 21.4 | User (controlling) | DC-5 |
| C9 | `identity.reinstate_delegation_grant.v1` | delegation_grants | 21.4 | User (controlling) | E, DC-5 |
| C9 | `identity.revoke_delegation_grant.v1` | delegation_grants | 21.4 | User (controlling) | DC-1, DC-5 |
| C9 | `identity.expire_delegation_grant.v1` | delegation_grants | 21.5 System | System | DC-1, A, E, DC-5 |
| C9 | `identity.get_delegation_grant.v1` | delegation_grants | 21.3 | User (party) | dual-party read |
| C9 | `identity.list_delegation_grants.v1` | delegation_grants | 21.3 | User (party) | DC-5 (page bound) |
| C10 | `identity.upsert_buyer_profile.v1` | buyer_profiles | 21.4 | User | S, A, DC-5 |
| C10 | `identity.get_buyer_profile.v1` | buyer_profiles | 21.3 (int-svc) | User/int-svc | consumed by M3 |
| C11 | `identity.get_workflow_settings.v1` | organization_workflow_settings | 21.3 (int-svc) | User/int-svc | consumed by M3, M6 |
| C11 | `identity.update_workflow_settings.v1` | organization_workflow_settings | 21.4 | User | DC-5 |

**Coverage:** all 9 owned entities; 42 contracts hardened; no contract added or removed; templates/actors unchanged from closed Pass-A.

---

## Appendix B — Doc-4A + Doc-4B Conformance Binding Map (hardened)

Carried from the closed Pass-A; each section binds to the governing Doc-4A standards and consumes the listed Doc-4B services **by pointer only**. **Doc-4C redefines none of them; re-implements no Doc-4B mechanism.**

| Doc-4C § | Doc-4A standards (governing) | Doc-4B services consumed |
|---|---|---|
| §B Conventions | §0.3, §8, §9.8, §10.2, §11.2, §12, §14, §17, §21, §22.1, §4B | (cross-cutting) |
| §C3 Shared services | §5, §6, §6B, §7 | — (reads) |
| §C4 Users | §5 (auth boundary, DC-4), §5.6, §11.2, §12, §14, §17 | `core.append_audit_record.v1` |
| §C5 Organizations | §13, §5.6, §11.2, §12, §14, §16 (DC-1), §17 | `core.append_audit_record.v1`, `core.allocate_human_reference.v1` |
| §C6 Memberships | §6.1, §13, §5.2, §11.2, §12, §14, §17 | `core.append_audit_record.v1`, `core.config_value_query.v1` |
| §C7 Roles & Permissions | §6.2, §6.4, §11.2, §12, §14, §17 | `core.append_audit_record.v1` |
| §C8 Authz & Context | §5.3, §6, §6B, §7, §11.2, §12 | — (reads) |
| §C9 Delegation | §6B, §13 (§5.10), §11.2, §12, §14, §16 (DC-1), §17 | `core.append_audit_record.v1`, `core.config_value_query.v1` |
| §C10 Buyer Profiles | §7, §11.2, §12, §14, §17 | `core.append_audit_record.v1` |
| §C11 Workflow Settings | §18.4, §6.2, §11.2, §12, §14, §17 | `core.append_audit_record.v1`, `core.config_value_query.v1` |
| §C12 Cross-cutting | §5/§5.6, §7, §14, §16, §17, §4B, App B | audit-write, ID allocation, POLICY resolution, flag evaluation |

---

## Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers (UNCHANGED)

**Carried forward verbatim and unchanged** from the closed Pass-A Appendix C (as amended by `Doc-4C_PassA_Patch_v1.0.1.md`). Pass-B **does not resolve, redesign around, or invent workarounds** for any of these (Board directive; Verification Report §6 entry conditions). They remain open and are resolved only through their named channels.

- **DC-1 — Identity cross-module cascade with no identity event.** No `identity` §8 emitter; org soft-delete cascade (M2/M3) and delegation revoke/expiry teardown (M3) cross boundaries. **Channel:** Board decision (service-call per §4.2/§4.4) or a Doc-2 §8 identity-event addition. **No event coined; no Template 21.2 instantiated** (entry condition 1).
- **DC-2 — Organization verification ownership boundary.** `verification_records` owned by Trust (M5/Doc-4G); Identity owns `organizations` + `can_submit_verification` but authors no verification contract. **Channel:** confirm the identity-side submission boundary against the Trust contract.
- **DC-3 — Platform-governance Admin slugs.** Org suspend/reinstate, ownership-succession recovery, user status bind to `staff_super_admin` (interim) per D-2; least-privilege `staff_*` slugs are a future Doc-2 §7 additive. **No slug invented.**
- **DC-4 — Authentication boundary.** Supabase Auth = authentication only; login/password/2FA-challenge/session = infrastructure. Identity owns the user record, preferences, 2FA *settings*, post-auth authorization context, and the `pending → active` activation (System-effected on the infra verification signal).
- **DC-5 — `identity.*` POLICY key registration.** No `identity.*` block in Doc-3 §12.2. **Channel:** Doc-3 §12.2 additive patch (as for the `core.*` block). Pass-B references the intended keys by name (`[DC-5]`); **no key registered, no concrete value set** (entry condition 2) — contracts referencing `[DC-5]` keys are not finalized until registration. Intended keys: `identity.membership_invite_expiry_window`, `identity.membership_invite_dedup_window`, `identity.delegation_validity_default`, `identity.delegation_expiry_sweep_cadence`, `identity.ownership_succession_reminder_cadence`, `identity.user_update_dedup_window`, `identity.command_dedup_window` (per-domain).
- **`[ESC-IDN-SLUG]`** — tenant org-administration slugs absent from Doc-2 §7's minimal set (organization-profile, role-bundle, buyer-profile administration). Interim: nearest existing slug / Owner-Director authority. **Channel:** Doc-2 §7 additive (D-2 principle). **No slug invented.**
- **`[ESC-IDN-AUDIT]`** — identity audit actions not separately enumerated in Doc-2 §9 (organization-profile change, user-account suspend/reinstate, anonymization, organization suspend/reinstate, 2FA-settings change, buyer-profile change, membership activation, delegation expiry); reinstate inverse-legs covered-by-suspend. Interim: nearest §9 action by pointer. **Channel:** Doc-2 §9 additive. **No audit action invented.**
- **`[ESC-IDN-DELEG-EXPIRY]`** — Doc-2 §5.10 does not specify the `suspended`-at-validity-expiry disposition. Interim: the sweep acts on the literal `active → expired` edge only; reinstatement into a lapsed window is not assumed. **Channel:** Doc-2 §5.10 change management. **No transition invented.** Affects `expire_delegation_grant`, `reinstate_delegation_grant` (error-boundary/validation not finalized — entry condition 4).

---

## Appendix D — Cross-Reference Index (hardened)

Carried from the closed Pass-A; pointer table from each binding point to its authoritative source (canonical versions: Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0). Reference-never-restate is auditable through this index.

| Binding point | Authoritative source |
|---|---|
| Owned entities, tenancy, lifecycle, schema | Doc-2 §3.2, §6, §10.2 |
| Organization / Membership / Delegation state machines | Doc-2 §5.1 / §5.2 / §5.10 |
| Permission slugs (`can_manage_users`, `can_manage_workflow_settings`, `can_transfer_ownership`, `can_delete_organization`, `can_manage_delegations`, `can_submit_verification`; `staff_super_admin`) | Doc-2 §7 |
| Audit domains (Organization; delegation under Vendor profile) | Doc-2 §9 |
| Event ownership (no `identity` emitter) | Doc-2 §8 |
| FIXED / POLICY / ORG; ORG workflow settings; config governance | Doc-3 §12.1 / §12.2 / §12.3 / §12.4 |
| Templates; selection; reference_id mandate | Doc-4A §21, §22.1 (C-05 / P6-B01), §22.3 |
| Authorization (three-layer) & delegation standard | Doc-4A §6, §6B |
| Context model (active-org, server-validated, Identity-owned) | Doc-4A §5, §5.3, §5.6 |
| Validation order; error model; idempotency; events; audit; firewall | Doc-4A §11.2, §12, §14, §16, §17, §18, §4B |
| Identity model; ownership/succession; buyer profile; role bundles | Architecture §5–§5.7, §13.3–§13.4, §16.2, §17.2; ADR-015 |
| Vendor representation / delegation rationale | Architecture §6.5, §7.3–7.4; ADR-005 |
| Platform Core services consumed | Doc-4B v1.0 (`core.append_audit_record.v1`, `core.allocate_human_reference.v1`, `core.config_value_query.v1`, `core.feature_flag_evaluate.v1`; UUIDv7 §8) |
| Carried dependencies & escalation markers | `Doc-4C_Content_v1.0_PassA.md` (as amended by `Doc-4C_PassA_Patch_v1.0.1.md`) Appendix C |

---

*End of Doc-4C Content v1.0 — Pass-B (Module 1 — Identity & Organization). Implementation hardening of the 42 closed Pass-A contracts across 9 owned entities: Request/Response contracts, canonical-order validation matrices, error registers, idempotency declarations, query semantics, reference validation, audit/authorization declarations, and AI-agent implementation notes. No new entity, contract, event, permission slug, audit action, template, or module responsibility; no ownership / state-machine / actor / escalation / dependency change. DC-1…DC-5 and `[ESC-IDN-SLUG]` / `[ESC-IDN-AUDIT]` / `[ESC-IDN-DELEG-EXPIRY]` carried unchanged and unresolved. Ready for Independent Hard Review.*
