# Doc-5C — Identity & Organization (M1 `identity`) API Realization — Content v1.0, Pass 1 (§0–§3 + inventory)

| Field | Value |
|---|---|
| Document | Doc-5C — Identity & Organization (Module 1) — API Realization |
| Pass | 1 of 2 — §0, §1, §2 (inventory) and §3 (cross-cutting wire model) |
| Status | ACTIVE — Content Pass 1 of 2; §0–§3 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5C_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Module | Module 1 — Identity & Organization (`identity` schema) |
| Realizes | `Doc-4C` (M1 contracts, FROZEN — 42 contracts, PassB Appendix A) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN), Doc-4C v1.0 (FROZEN), Doc-4M v1.0 (FROZEN), Doc-5A v1.0 (FROZEN) |
| Contains | Document control + scope/surface-partition + the **35-endpoint** caller-facing inventory + the §3 cross-cutting authorization/context **wire model** (mechanism only). No §5.7 template instantiations (Pass-2), no out-of-wire realization detail, no schemas, no contract bodies restated |
| Audience | Architecture / API Governance Boards · Doc-5C content authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4C fixed *what* each M1 contract declares (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Pass-1 fixes Doc-5C's precedence/scope, the **caller-facing endpoint inventory** (method, path, actor, active-org applicability, success) for the **35** caller-facing M1 endpoints, and the **§3 cross-cutting wire model** that §4–§6 endpoints depend on — all bound to Doc-5A / Doc-4C by pointer. It instantiates no full endpoint template (that is §4–§6), realizes no out-of-wire mechanism (§7), and coins no endpoint/status/header/error-class/slug/POLICY key. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §0/§1/§5/§7` · `Doc-4C §C0–§C3/§C8/§C12` · Appendix B.1 (`identity`).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence

- Doc-5C sits one realization level below Doc-5A in the chain Doc-5A fixes (`Doc-5A §0.1`):
  ```
  Master Architecture → ADR Compendium → Doc-2 · Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-5A → Doc-5C → Code
  ```
- Doc-5C **MUST NOT** override, reinterpret, or weaken any higher document. On conflict, the higher document prevails automatically and Doc-5C is patched (`Doc-5A §0.1`; flag-and-halt, `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Binds:** `Doc-5A §0.1`. **Rationale:** the realization layer inherits, never re-opens, the frozen decisions above it.

### 0.2 Scope of Authority

- Doc-5C governs **how the FROZEN Doc-4C contracts of Module 1 are realized as concrete HTTP APIs on the bound transport** — the wire realization layer only.
- Doc-5C does **not** govern: *what* a contract declares (owned by Doc-4C / Doc-4A, by pointer); domain facts (Doc-2/Doc-3); the state-machine definitions (Doc-4M); persistence (Doc-6); framework/transport implementation; the **authentication mechanism** (Supabase Auth — DC-4); or the M1 in-process mechanisms that have no wire (§7, out-of-wire).
- **Binds:** `Doc-5A §0.2`; Doc-4C §C0/§C1. **Rationale:** one realization document, one wire surface; everything else is bound by pointer.

### 0.3 Conformance Obligation

- Before Doc-5C may freeze, it **MUST** pass the Doc-5A **Appendix A** conformance checklist (`CHK-5A-xxx`) in full (`Doc-5_Program_Governance_Note_v1.0 §6`). A failing check blocks freeze. Doc-5C coins **no** endpoint, status, header, error class, permission slug, or POLICY key (`CHK-5A-121`, `CHK-5A-154`; `Doc-4A §6.4`).
- **Binds:** `Doc-5A §0.5`, Appendix A. **Rationale:** conformance is an obligation; the checklist is the gate (attested in §8 / Appendix A, Pass-2).

### 0.4 Realize-Never-Redecide

- Doc-5C binds each realized point to its Doc-4C / Doc-5A / corpus owner by pointer and **MUST NOT** copy, paraphrase-with-change, or re-decide it. A purely transport-level detail on which Doc-4A/Doc-5A are silent **MAY** be fixed as a **[realization convention]** that contradicts nothing upstream. Missing authority for a declared element ⇒ flag-and-halt (`Doc-5A §0.3`).
- **Binds:** `Doc-5A §0.3`.

---

## §1 — Scope, Audience & M1 Surface Partition

### 1.1 What Doc-5C Governs

- Doc-5C is the **HTTP realization of Module 1's caller-facing contracts** — user/organization/membership/role/delegation/buyer-profile/workflow-settings operations and the active-organization context surface. It contains no other module's surface.
- M1's primary actor is the **User** acting inside a **server-validated active organization** (`Doc-4C §C12.1`; `Doc-5A §7.3` — R2); a platform-governance **Admin** subset (21.6) carries **no** org context (`Doc-5A §7.3`); **System** timers and the **§C3 authorization-resolution reads** are **out-of-wire** (§7, R1).
- **Binds:** `Doc-5A §1`, §7; Doc-4C §C1/§C12.

### 1.2 M1 Surface Partition

The 42 Doc-4C contracts partition by wire-realizability (structure R1) — **35 caller-facing**, **7 out-of-wire**:

| Doc-4C contracts | Doc-5C treatment |
|---|---|
| §C4/§C5 user + org commands (incl. Admin governance) · §C6 membership commands · §C7 role commands + reads · §C8 context (switch + reads) · §C9 delegation commands + party reads · §C10/§C11 profile/settings commands + owning-org reads | **Caller-facing HTTP** — realized here (inventory §2; full template §4–§6) |
| §C3 `get_user`/`get_organization`/`get_membership`/`check_permission` (internal-service authorization root) · §C6/§C9 System timers (`activate_membership`, `expire_invitation`, `expire_delegation_grant`) · the dual-audience reads' internal-service (M3/M6) leg · DC-1 cross-module cascade/teardown | **Out-of-wire** — no HTTP surface (§7); implementation is code / Doc-6 |

- **Binds:** Doc-4C PassB Appendix A (partition); `Doc-5A §1.3`. **Rationale:** only contracts with a caller-facing wire are realized; the authorization root, timers, and cross-module integration are fenced (§7), never given a wire.

### 1.3 Dependency Boundary

- **M1 owns realization only for M1 surfaces.** Cross-module realization belongs to the owning module's Doc-5x (Marketplace → Doc-5D; RFQ → Doc-5E). Doc-5C references other modules **by ID / public contract only** and realizes no other module's surface. The §C3 authorization reads are consumed by other modules **in-process** (out-of-wire), never as an M1 HTTP endpoint.
- **Binds:** `Doc-5A §1` (scope allocation); structure §1.x.

### 1.4 Audience & Carried Items

- **Audience:** Architecture / API Governance Boards; Doc-5C content authors (human + AI); AI Coding Supervisor; backend and QA engineers.
- **Carried (Doc-4C Appendix C — by pointer; resolved only via named channels, never here):** **DC-1** (no `identity` event — cross-module cascade out-of-wire, R6), **DC-2** (verification ownership = Trust), **DC-3** (`staff_*` admin slugs), **DC-4** (auth mechanism = infrastructure), **DC-5** (`identity.*` POLICY-key registration — `[DC-5]`-keyed contracts not finalized until registered), `[ESC-IDN-SLUG]`, `[ESC-IDN-AUDIT]`, `[ESC-IDN-DELEG-EXPIRY]` (`reinstate_delegation_grant` not finalized until Doc-2 §5.10 resolves).
- **Binds:** Doc-4C §C12, Appendix C; Doc-2 §7.

---

## §2 — Realized Endpoint Inventory

### 2.1 Namespace & Path Grammar

- All M1 caller-facing endpoints live under the reserved **`identity`** route prefix (Appendix B.1; `Doc-2 §0.3`) and follow the §5.3 grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`. Resource segments are the owning entity tables (Doc-2 §3.2), rendered **plural** **[realization convention]**.
- Command tokens are the **exact `snake_case` operation names from the Doc-4C PassB Appendix A Contract-ID column** (`identity.<operation>.v1`), used verbatim as the `{command-name}` segment (`Doc-5A §5.3`) — no shortening, substitution, or invention.
- **Binds:** `Doc-5A §5.2/§5.3`, Appendix B.1; Doc-2 §0.3, §3.2.

### 2.2 Inventory — §4 User & Organization Surface (11)

| # | Doc-4C Contract-ID | Actor | Method | Path | Active-Org | Success |
|---|---|---|---|---|---|---|
| 1 | `identity.update_user_profile.v1` | User (self) | `POST` | `/identity/users/{id}/update_user_profile` | N (self) | `200` |
| 2 | `identity.update_user_2fa_settings.v1` | User (self) | `POST` | `/identity/users/{id}/update_user_2fa_settings` | N (self) | `200` |
| 3 | `identity.deactivate_own_account.v1` | User (self) | `POST` | `/identity/users/{id}/deactivate_own_account` | N (self) | `200` |
| 4 | `identity.set_user_account_status.v1` | Admin | `POST` | `/identity/users/{id}/set_user_account_status` | N (admin) | `200` |
| 5 | `identity.create_organization.v1` | User | `POST` | `/identity/organizations/create_organization` | N (bootstrap) | `201` |
| 6 | `identity.update_organization_profile.v1` | User | `POST` | `/identity/organizations/{id}/update_organization_profile` | Y | `200` |
| 7 | `identity.transfer_ownership.v1` | User (Owner) | `POST` | `/identity/organizations/{id}/transfer_ownership` | Y | `200` |
| 8 | `identity.soft_delete_organization.v1` | User (Owner) | `POST` | `/identity/organizations/{id}/soft_delete_organization` | Y | `200` |
| 9 | `identity.restore_organization.v1` | User (Owner) / Admin | `POST` | `/identity/organizations/{id}/restore_organization` | Y / N (admin) | `200` |
| 10 | `identity.set_organization_status.v1` | Admin | `POST` | `/identity/organizations/{id}/set_organization_status` | N (admin) | `200` |
| 11 | `identity.admin_recover_ownership.v1` | Admin | `POST` | `/identity/organizations/{id}/admin_recover_ownership` | N (admin) | `200` |

### 2.3 Inventory — §5 Membership, Role & Delegation Surface (17)

| # | Doc-4C Contract-ID | Actor | Method | Path | Active-Org | Success |
|---|---|---|---|---|---|---|
| 12 | `identity.invite_member.v1` | User | `POST` | `/identity/memberships/invite_member` | Y | `201` |
| 13 | `identity.accept_invitation.v1` | User (invitee) | `POST` | `/identity/memberships/{id}/accept_invitation` | N (pre-membership) | `200` |
| 14 | `identity.set_membership_status.v1` | User | `POST` | `/identity/memberships/{id}/set_membership_status` | Y | `200` |
| 15 | `identity.remove_member.v1` | User | `POST` | `/identity/memberships/{id}/remove_member` | Y | `200` |
| 16 | `identity.revoke_invitation.v1` | User | `POST` | `/identity/memberships/{id}/revoke_invitation` | Y | `200` |
| 17 | `identity.list_permissions.v1` | User / int-svc | `GET` | `/identity/permissions` | N (platform catalog) | `200` |
| 18 | `identity.list_roles.v1` | User | `GET` | `/identity/roles` | Y | `200` |
| 19 | `identity.create_role.v1` | User | `POST` | `/identity/roles/create_role` | Y | `201` |
| 20 | `identity.update_role.v1` | User | `POST` | `/identity/roles/{id}/update_role` | Y | `200` |
| 21 | `identity.set_role_permissions.v1` | User | `POST` | `/identity/roles/{id}/set_role_permissions` | Y | `200` |
| 22 | `identity.delete_role.v1` | User | `POST` | `/identity/roles/{id}/delete_role` | Y | `200` |
| 23 | `identity.create_delegation_grant.v1` | User (controlling) | `POST` | `/identity/delegation_grants/create_delegation_grant` | Y | `201` |
| 24 | `identity.suspend_delegation_grant.v1` | User (controlling) | `POST` | `/identity/delegation_grants/{id}/suspend_delegation_grant` | Y | `200` |
| 25 | `identity.reinstate_delegation_grant.v1` | User (controlling) | `POST` | `/identity/delegation_grants/{id}/reinstate_delegation_grant` | Y | `200` *(`[ESC-IDN-DELEG-EXPIRY]` — not finalized)* |
| 26 | `identity.revoke_delegation_grant.v1` | User (controlling) | `POST` | `/identity/delegation_grants/{id}/revoke_delegation_grant` | Y | `200` |
| 27 | `identity.get_delegation_grant.v1` | User (party) | `GET` | `/identity/delegation_grants/{id}` | Y (party scope) | `200` |
| 28 | `identity.list_delegation_grants.v1` | User (party) | `GET` | `/identity/delegation_grants` | Y (party scope) | `200` |

### 2.4 Inventory — §6 Context, Buyer-Profile & Workflow-Settings Surface (7)

| # | Doc-4C Contract-ID | Actor | Method | Path | Active-Org | Success |
|---|---|---|---|---|---|---|
| 29 | `identity.switch_active_organization.v1` | User | `POST` | `/identity/memberships/switch_active_organization` | establishes context | `200` |
| 30 | `identity.get_active_context.v1` | User | `GET` | `/identity/active_context` | principal-scoped | `200` |
| 31 | `identity.list_my_organizations.v1` | User | `GET` | `/identity/organizations` *(principal-scoped, server-derived)* | principal-scoped | `200` |
| 32 | `identity.upsert_buyer_profile.v1` | User | `POST` | `/identity/buyer_profiles/upsert_buyer_profile` | Y | `200` |
| 33 | `identity.get_buyer_profile.v1` | User / int-svc | `GET` | `/identity/buyer_profiles` *(owning-org)* | Y (owning-org) | `200` |
| 34 | `identity.update_workflow_settings.v1` | User | `POST` | `/identity/organization_workflow_settings/update_workflow_settings` | Y | `200` |
| 35 | `identity.get_workflow_settings.v1` | User / int-svc | `GET` | `/identity/organization_workflow_settings` *(owning-org)* | Y (owning-org) | `200` |

### 2.5 Inventory Notes

- **Methods (§5.2):** reads are `GET` (safe); state-changing operations are `POST` to a **named command sub-resource** (`{command-name}`), never arbitrary field replacement (§5.1/§5.2).
- **Success (§5.5):** resource-creating commands (`create_organization`, `invite_member`, `create_role`, `create_delegation_grant`) realize `201`; all other commands and reads realize `200` (synchronous; no async — none returns `202`/`204`). `Doc-4A §10.2/§10.3`.
- **Active-Org column** records, by pointer, whether the §3 `Iv-Active-Organization` mechanism applies; the **rule is §3** and the per-endpoint application is finalized in §4–§6. Self-user ops (1–3) act on the platform-owned `users` record (no org); Admin ops (4, 10, 11; admin leg of 9) carry no org context (§7.3); `create_organization` (5) is the bootstrap (no prior org); `accept_invitation` (13) is pre-membership (the invitation scopes it server-side); the context surface (29–31) establishes/reads principal context.
- **⚠ Context-surface addressing [realization convention] — flagged for Hard Review:** endpoints 29–31 do not address a single entity row. Realized as: `switch_active_organization` = a collection-level command on `memberships` with the target `organization_id` in the **body** (server-validated per §3, never trusted); `get_active_context` = a principal-scoped context singleton `GET /identity/active_context`; `list_my_organizations` = a principal-scoped `GET /identity/organizations` whose scope is **server-derived from the principal's memberships** (not a client filter — `Doc-4A §9.7`). Surfaced, not silently fixed.
- The full §5.7 template instantiation (request/response binding, error-status set, idempotency/concurrency, audit) for each endpoint is authored in **§4 (user/org), §5 (membership/role/delegation), §6 (context/profile/settings)** — not here.
- **Binds:** `Doc-5A §5.1/§5.2/§5.5/§5.7`, §7.3; Doc-4C PassB Appendix A.

---

## §3 — Cross-Cutting Authorization & Context Wire Model *(mechanism only — owns no endpoint)*

> §3 realizes the **mechanism** every §4–§6 endpoint depends on. It binds `Doc-5A §7.1–§7.6` (the identity/context/authorization wire-carriage standard) **by pointer** and states the M1-specific application. It **instantiates no endpoint** — the §C8 context endpoints are realized in §6.

### 3.1 Authentication Carriage (§7.1)

- The authenticated principal is carried in the **`Authorization`** header (Bearer scheme), conveying **authentication only** — never authorization (`Doc-5A §7.1`; `Doc-4A §5.1`). Credential format, issuance, validation, session, and login/2FA-challenge mechanics are **out of scope** (DC-4 — Supabase Auth infrastructure; `Doc-5A §7.1`). A contract assumes an already-authenticated principal.
- **Binds:** `Doc-5A §7.1`; `Doc-4A §5.1`; Doc-4C §C1 (auth boundary, DC-4).

### 3.2 Actor-Type Determination (§7.2)

- M1's actor types — **User** (primary), **Admin** (`staff_*`, governance subset), **System** (out-of-wire timers) — are **determined server-side** from the authenticated principal (`Doc-5A §7.2`; `Doc-4A §5.2`). A request **MUST NOT** carry a field/header asserting its actor type (forbidden input, §4.4 / `Doc-4A §9.7`). Admin vs User is distinguished by the server from the platform-role basis (`Master Architecture §13.5`; `Doc-2 §7` slug catalog), never by the wire.
- **Binds:** `Doc-5A §7.2`; `Doc-4A §5.2`; Doc-4C §C12.1.

### 3.3 Active-Organization Context (§7.3) — R2

- A User-actor tenant business operation executes within a **server-validated active organization context** carried in the **`Iv-Active-Organization`** header (the org `UUIDv7`) — a **context selector, not a trusted assertion**: the server **MUST** validate that the principal holds an **active membership** in the named organization **before** any business processing (CONTEXT category, §3.6; `Doc-5A §7.3`; `Doc-4A §5.3`). A client-supplied organization identifier is **never** trusted.
- The **active organization is owned by the Identity context state model** (`Doc-4C §C8`); the `Iv-Active-Organization` header **carries selected context only and never establishes authority independently** — the server resolves it against the §C8-owned state. No "act as organization X" payload/path/query field exists outside this mechanism (`Doc-4A §9.7`; `Doc-5A §7.3`).
- **Absence / Admin:** an org-scoped operation with absent/unvalidated context is a CONTEXT failure (§3.6); **Admin** governance contracts carry **no** active-org context (`Doc-5A §7.3`; `Doc-4A §5.6`), scope deriving solely from `staff_*` + declared admin scope (DC-3). Every record created is owned by the **active organization**, never the user personally (`Master Architecture` Invariant 5).
- **Binds:** `Doc-5A §7.3`; `Doc-4A §5.3/§5.6/§9.7`; `Master Architecture §6.1`, Invariant 5; Doc-4C §C8.

### 3.4 Delegation Context (§7.4) — R5

- Delegation is **resolved server-side, never asserted on the wire.** A request carries the principal (§3.1), active-org context (§3.3), and the target resource (path); from these the server resolves any applicable Delegation Grant via the **§6B five-condition delegated-access check** (`Doc-5A §7.4`; `Doc-4A §6B.2`). **No delegation header or delegation request field exists** (R4 — none added). A grant id, `permission_set`, or "acting under grant X" assertion is a **forbidden input** (`Doc-4A §9.7`).
- The five-condition check and four-attribution rule are computed inside **`identity.check_permission.v1`**, which is the authorization-resolution engine — **out-of-wire** (§7, R1). Attribution is server-populated (`Doc-4A §6B.3`); Doc-5C carries no attribution input.
- **Binds:** `Doc-5A §7.4`; `Doc-4A §6B.1/§6B.2/§6B.3`; Doc-4C §C9 (grant lifecycle, realized §5) / §C3 (check_permission, out-of-wire §7).

### 3.5 Authorization Realization (§7.5)

- Authorization is **computed server-side** as the three-layer check — active Membership **+** Permission Slug **+** Resource Scope, **OR** an active Delegation Grant — from the §3.1–§3.4 context (`Doc-5A §7.5`; `Doc-4A §6.1`; `Master Architecture §13.2`). The wire carries **no authorization vocabulary**: roles, permission slugs, membership, grants, scopes are **never** request inputs (`Doc-4A §6.2` slugs-only; §9.7). This resolution is M1's authoritative responsibility (Doc-4C §C3 authoritative-source rule) and is performed in the out-of-wire `check_permission` / `get_membership` reads (§7) — **no consuming module re-derives it** (no shadow authorization).
- Authorization outcomes surface **only** as the §6 error classes — `AUTHORIZATION` (403) where existence is the caller's to know, otherwise the `NOT_FOUND` (404) **collapse** under non-disclosure (`Doc-5A §6.3`; `Doc-4A §12.4/§7`). A response never echoes the caller's slugs, grants, or authorization decision beyond what §5.6 representation permits.
- **Binds:** `Doc-5A §7.5`, §6.2/§6.3; `Doc-4A §6.1/§6.2/§9.7`; Doc-4C §C3 (authoritative-source rule).

### 3.6 Context Validation Position (§7.6)

- Carried context is validated in the fixed **CONTEXT category** of the universal validation order (`Doc-5A §7.6`; `Doc-4A §11.2`, position 2): actor type permitted, active-org context valid, admin scope satisfied — established **before** AUTHZ / SCOPE / DELEGATION (positions 3–5) and any semantic processing. Doc-5C maps the resulting failure to its §6 status and **MUST NOT** reorder, merge, or short-circuit the categories — the order is a disclosure control owned by `Doc-4A §11.2`.
- **Binds:** `Doc-5A §7.6`; `Doc-4A §11.2`.

---

*End of Doc-5C Content v1.0, Pass 1 (§0–§3 + inventory). Document control, scope/surface-partition, the 35-entry caller-facing inventory, and the §3 cross-cutting authorization/context wire model (mechanism only) — no §5.7 template instantiation, no out-of-wire realization (§7), no schemas, no contract bodies; one context-surface addressing realization flagged for review; nothing coined. §4 (user/org), §5 (membership/role/delegation), §6 (context/profile/settings), §7 (out-of-wire) and §8 + Appendix A follow in Pass-2, conforming to `Doc-5C_Structure_v1.0_FROZEN.md`.*
