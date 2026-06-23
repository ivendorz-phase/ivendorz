# Doc-4C — Identity & Organization — API & Integration Contracts — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN — canonical Table of Contents for Doc-4C** |
| Module | Module 1 — Identity & Organization (`identity` schema) |
| Supersedes | Doc-4C_Structure_Proposal_v0.1.md (Architecture Board structure review and patch applied; authoring history removed per Board decision) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 — Platform Core / Shared Kernel (Board-authorized authoritative corpus: `Doc-4B_Content_v1.0_PassB.md` + `Doc-4B_Freeze_Patch_v1.0.1.md` + `Doc-3_Policy_Key_Registration_Patch_v1.0.md`; canonical freeze status as declared by the Architecture Board) |
| Contains | Structure only — no contracts, no endpoints, no payloads, no implementation detail |
| Family-map basis | Doc-4A §1.3: **Doc-4C = Identity & Organization (Module 1)** |
| Audience | Claude Code, Cursor, backend, QA, AI development agents |

Three governing rules shape this document:

1. **Reference, never restate (Doc-4A §0.3).** Entity definitions (Doc-2 §3.2), the Organization/Membership/Delegation state machines (Doc-2 §5.1/§5.2/§5.10), permission slugs (Doc-2 §7), audit actions (Doc-2 §9), and POLICY keys (Doc-3 §12) have owners. Doc-4C binds to them by pointer; it never copies them.
2. **Consume frozen lower layers; redefine nothing.** Doc-4C **consumes** the Doc-4A standards (templates §21, authorization §6, delegation §6B, context §5) and the **Doc-4B Platform Core / Shared Kernel services** (audit-write §17, transactional-outbox-write §16, UUIDv7 + human-reference allocation §8, POLICY resolution §18, feature-flag evaluation) **by pointer**. It does **not** redefine any Doc-4A standard or any Doc-4B Platform Core responsibility.
3. **Templates are mandatory (Doc-4A §21).** Every contract authored in the content passes uses the applicable frozen template (21.3 Query, 21.4 Command, 21.6 Admin, 21.2 Integration; 21.5 System where a Phase-2 worker applies). This document maps each capability to its template; it does not instantiate them.

---

## §C0 — Document Control, Precedence & Conformance Obligation

- **Purpose:** Establish Doc-4C as the contract document for Module 1 only, subordinate to the frozen corpus and to Doc-4A; restate the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C); bind the flag-and-halt obligation (Doc-4A §0.6) and the patch-based amendment rule; name the exact corpus versions conformed to. Affirm that Doc-4C adds no standards, overrides nothing, and does not reopen any frozen document.
- **Why this section:** A module document must declare, once, that conformance is an obligation and that it neither redefines Doc-4A standards nor redefines Doc-4B Platform Core responsibilities.
- **Source bindings:** Doc-4_Governance_Note_v1.0; Doc-4A §0.
- **Detail level:** Short, fully normative.

## §C1 — Module Scope & Boundary

- **Purpose:** Fix the contract surface of Module 1. Enumerate the nine owned entities exactly as named in Doc-2 §3.2 — `users`, `organizations`, `memberships`, `roles`, `permissions`, `role_permissions`, `organization_workflow_settings`, `buyer_profiles`, `delegation_grants` — with their tenancy class (Doc-2 §6) and lifecycle. State what Doc-4C owns and authors, and — critically — what it does **not** own and must reference by UUID only: `vendor_profiles` (Module 2), `verification_records` (Module 5 / Trust), `subscriptions`/entitlements (Module 7), `rfqs`/`quotations` (Module 3/2), and all `core.*` infrastructure (Module 0 / Doc-4B). State the **authentication boundary**: Supabase Auth performs authentication only (Doc-4A §5); login/password/2FA/session mechanics are infrastructure (development documents), not Doc-4C business contracts — Doc-4C owns the user identity record, preferences, and the post-authentication authorization context.
- **Why this section:** Identity is the platform's authorization root and is referenced by every other module; the boundary between "Identity owns" (users, orgs, memberships, roles, permissions, delegation, buyer profile, workflow settings) and "Identity only references" (vendor profile, verification, subscription, RFQ) must be unambiguous to prevent ownership leakage.
- **Source bindings:** Architecture §5, §16.2; ADR-015 (Identity & Organization Model, Redline v0.3.1); Doc-2 §3.2, §6, §10.2; Doc-4A §1.3, §4.1, §5.
- **Detail level:** Normative scope statement + owned-entity table + explicit not-owned table (pointer-level).

## §C2 — Conformance & Template Binding

- **Purpose:** Declare which frozen Doc-4A templates Doc-4C uses and for what: **21.3 Query** (Get User, Get Organization, Get Membership, Check Permission, list/read surfaces), **21.4 Command** (create/update/state-transition on identity entities), **21.6 Admin** (platform-governance actions — organization suspension, ownership-succession recovery), **21.2 Integration** (cross-module integrations Identity is the source of, per §4.4), **21.5 System** (only if a Phase-2 worker applies — e.g., membership-invite expiry, delegation-grant expiry timers). Bind the `identity_` error-code namespace (Doc-4A Appendix B §B.2). State the Appendix A conformance-checklist obligation. Internal services (if any) use the **D-1 composition convention** (governance status: **Board Decision Pending**; applied as the interim composition approach consistent with the Doc-4B precedent — 21.3/21.4 with `Audience: internal-service`, no new Doc-4A template). Doc-4C neither relies on nor asserts a final D-1 ratification; should the D-1 decision change the convention, affected internal-service sections are updated then.
- **Template 21.2 applicability under DC-1 (content-pass guardrail):** while dependency DC-1 (Appendix C) is unresolved, Template 21.2 (Integration) **MUST NOT** be instantiated for the DC-1-dependent cross-module legs — the org soft-delete cascade to Modules 2/3 and the delegation-revocation grantee/visibility teardown in Module 3. Those legs remain blocked at DC-1 pending the Board decision. Template 21.2 may be used only for integrations that are **not** DC-1-dependent. This guardrail neither resolves DC-1, introduces an event, nor authors any integration contract.
- **Why this section:** Identity's Check Permission and context services are consumed platform-wide; template selection must be fixed up front so every consuming module binds to a consistent contract shape.
- **Source bindings:** Doc-4A §21 (templates + selection guide), §22.3 (rules), Appendix A, Appendix B; Doc-4B D-1 composition precedent (D-1 governance status: Board Decision Pending).
- **Detail level:** Normative template-selection table for Module 1 + namespace binding + the DC-1 guardrail.

## §C3 — Shared Identity Services (consumed platform-wide)

- **Purpose:** Define the foundational Identity public services that every other module depends on (Architecture §16.2): **Get User**, **Get Organization**, **Get Membership**, and **Check Permission**. These are the Identity-side resolution of the Doc-4A §6 three-layer authorization contract (Membership + Permission Slug + Resource Scope, OR active Delegation Grant) and the §5.3 active-organization context. State that Doc-4C **implements** these services and that Doc-4A §6/§6B **define how** consumers declare authorization — Doc-4C does not redefine the standard. State the non-disclosure and tenancy obligations on these reads (§7).
- **Authoritative-source rule:** Identity's permission-resolution contracts (Check Permission and the Get-Membership / Role / Permission reads) are the **single authoritative authorization-resolution source** for the platform. Other modules **consume** these contracts to resolve the Doc-4A §6 three-layer check; no other module may implement a parallel or shadow authorization-resolution path (One Entity = One Owner; Doc-4A §4.1, §6). Where such a read is internal-service composed (§C2), the `Audience: internal-service` marker identifies the consumption channel only — it does not reduce the contract's authoritativeness.
- **Why this section:** Check Permission and the Get-* services are the single most consumed contracts on the platform; defining them once, here, prevents every other module from re-deriving authorization resolution.
- **Source bindings:** Architecture §16.2; Doc-4A §5, §6, §6B, §7; Doc-2 §3.2 (users, organizations, memberships, roles, permissions).
- **Detail level:** Per-service purpose + template (21.3) + the authorization-resolution binding. No payloads.

## §C4 — User Contracts (`users`)

- **Purpose:** Define the surface over the `users` entity (platform-owned; personal-data rules apply): user profile and preferences, notification settings, 2FA settings (settings only — the authentication mechanism is Supabase Auth, §C1 boundary); user lifecycle (`active` / `suspended` / `soft-deleted`, anonymizable on departure per Architecture §5.7). State the personal-data handling pointer (Doc-2 §3.2 "personal data rules apply").
- **Why this section:** The user identity record is distinct from the organization tenant; its lifecycle and anonymization-on-departure rules are Identity-owned and must not be conflated with membership or organization lifecycle.
- **Source bindings:** Architecture §5.1, §5.7; Doc-2 §3.2, §10.2; Doc-4A §5 (authentication boundary).
- **Detail level:** Per-subsection purpose + template (21.3/21.4) + source pointer.

## §C5 — Organization Contracts (`organizations`)

- **Purpose:** Define the surface over the `organizations` entity (tenant root): create (including the **Solo Trader Rule** auto-created Personal Organization, Architecture §5.2); the §5.1 state machine (`active ⇄ suspended`; `→ soft_deleted → active` restore) declared as legal transitions only (Doc-4A §13, no transition invented); **Last Owner Protection** and **Ownership Succession** (Architecture §5.5 — audit + reason code + approver) as validation/business rules bound by pointer; the **cascade-on-soft-delete** (Doc-2 §5.1: memberships → soft-deleted [own module]; vendor profile → suspended [Module 2]; RFQs → archived [Module 3]) — the cross-module legs are tracked as integration dependency DC-1 (Appendix C). Organization suspension is a **platform-governance** action (21.6 Admin, §5.1).
- **Why this section:** The organization is the tenant boundary; its lifecycle, owner-protection invariants, and cross-module cascade are the highest-stakes identity workflows.
- **Source bindings:** Architecture §5.2, §5.5, §5.7; Doc-2 §5.1, §3.2, §9 (Organization audit domain); Doc-4A §13.
- **Detail level:** Per-subsection purpose + template + state-machine binding (no restatement) + cascade-integration reference (DC-1).

## §C6 — Membership Contracts (`memberships`)

- **Purpose:** Define the surface over the `memberships` entity (tenant-owned): the §5.2 state machine (`invited → pending → active`; `active ⇄ suspended`; `→ removed` terminal; `invited → expire/revoke → removed`); invitation, acceptance, activation, suspension, reinstatement, removal; the access-formula gate (only `active` membership participates — Doc-4A §6.1); team management (`can_manage_users`, Doc-2 §7). Membership-invite expiry (the `invited → expire` transition) is a System-actor timer (21.5) bound to a POLICY key (DC-5).
- **Why this section:** Membership is the link entity that gates all tenant access; its lifecycle directly drives the authorization model (§C3/§C8).
- **Source bindings:** Architecture §5.4; Doc-2 §5.2, §3.2, §9 (Organization audit domain); Doc-4A §6.1, §13.
- **Detail level:** Per-subsection purpose + template + state-machine binding.

## §C7 — Role & Permission Contracts (`roles`, `role_permissions`, `permissions`)

- **Purpose:** Define the surface over role bundles and the permission catalog: `roles` (tenant-owned bundles — Owner/Director/Manager/Officer + org-custom; platform seeds defaults), `role_permissions` (N:N bundle composition, tenant-owned), and `permissions` (platform-owned slug catalog — read/list only; the slug catalog is owned by Doc-2 §7 and is never extended here, Doc-4A §6.4). State that roles are bundles and authorization checks use slugs only (Doc-4A §6.2); a role is never a permission.
- **Why this section:** Role/permission management is Identity-owned and feeds Check Permission (§C3/§C8); the bundle-vs-slug distinction (Doc-4A §6.2) must be enforced at the contract surface.
- **Source bindings:** Architecture §13.3 (role bundles); Doc-2 §3.2, §7, §9; Doc-4A §6.2, §6.4.
- **Detail level:** Per-subsection purpose + template + the slug-only authorization binding.

## §C8 — Authorization & Active-Organization Context

- **Purpose:** Define the **Check Permission** resolution (the Identity-side authority for the Doc-4A §6 three-layer check: active Membership + Permission Slug + Resource Scope, OR active Delegation Grant per §6B) and the **active-organization context-switch mechanism owned by Identity** (Doc-4A §5.3 — "owned by Identity (Doc-4C)"): organization switching; server-validated active-org context (never client-asserted, Architecture §5; Doc-4A §5.3). State that this section **binds to** Doc-4A §5/§6/§6B and does not redefine them; it authors Identity's implementation surface. The authoritative-source rule of §C3 applies to the Check Permission resolution defined here.
- **Why this section:** This is Identity's defining responsibility — the authorization and tenancy-context root the entire platform depends on; it must be specified once, here, conformant to the frozen §5/§6/§6B standards.
- **Source bindings:** Architecture §5, §16.2; Doc-4A §5, §5.3, §6, §6B, §7.
- **Detail level:** Full per-subsection purpose + template + binding to the frozen authorization/context standards. No reimplementation of the standard.

## §C9 — Delegation Grant Contracts (`delegation_grants`)

- **Purpose:** Define the surface over `delegation_grants` (shared dual-party record; controlling org manages): the §5.10 state machine (`draft → active`; `active ⇄ suspended`; `→ revoked` terminal; `→ expired` terminal); issuance/suspension/reinstatement/revocation by the controlling organization (`can_manage_delegations`, Doc-2 §7); grant-expiry as a System-actor timer (21.5; DC-5); the **revocation/expiry effect** that removes derived `rfq_invitation_grantees` and visibility rows (Doc-2 §5.10 — a cross-module effect, tracked as DC-1). Bind to the **Doc-4A §6B Delegation Grant Declaration Standard** (eligibility, the five-condition delegated-access check, four-attribution rule, suspension/revocation behavior) — Doc-4C does not redefine §6B.
- **Why this section:** Delegation is the platform's most unusual authorization path (one org acts for a vendor profile it does not control); the grant entity is Identity-owned and its lifecycle binds tightly to §6B and to cross-module visibility teardown.
- **Source bindings:** Architecture §6.5, §7.3–7.4; ADR-005; Doc-2 §5.10, §3.2, §6, §9; Doc-4A §6B.
- **Detail level:** Per-subsection purpose + template + §5.10 state-machine binding + §6B delegation binding + revocation-teardown reference (DC-1).

## §C10 — Buyer Profile Contracts (`buyer_profiles`)

- **Purpose:** Define the surface over `buyer_profiles` (tenant-owned; optional, organization-owned): procurement preferences, industry, factory information, delivery locations, approval settings (Architecture §5.3). State that the buyer profile enhances matching/procurement (read by Module 3) but is owned and edited only by the organization.
- **Why this section:** The buyer profile is the Identity-owned procurement-preference record consumed by the RFQ engine; its ownership (Identity, not RFQ) must be explicit.
- **Source bindings:** Architecture §5.3; Doc-2 §3.2, §6, §9.
- **Detail level:** Per-subsection purpose + template (21.3/21.4) + source pointer.

## §C11 — Organization Workflow Settings Contracts (`organization_workflow_settings`)

- **Purpose:** Define the surface over `organization_workflow_settings` (tenant-owned; **ORG** settings per Doc-4A §18.4 / Doc-3 §12.3): RFQ approval mode and chain, financial/award approval thresholds, notification rules, default routing mode, buyer-courtesy options. State that these are **ORG** settings (read per-organization at runtime, bounded by POLICY where Doc-3 §12.3 defines), consumed by other modules (RFQ approval gate, Communication notification rules); a workflow setting may add required approvals but never remove a required slug (Doc-4A §6.2).
- **Why this section:** Workflow settings are the ORG leg of the FIXED/POLICY/ORG trichotomy (Doc-4A §18); they are Identity-owned configuration consumed cross-module and must not be confused with POLICY (Module 0) or FIXED rules.
- **Source bindings:** Architecture §13.4; Doc-3 §12.3; Doc-2 §3.2, §6, §9; Doc-4A §18.4, §6.2.
- **Detail level:** Per-subsection purpose + template + ORG-setting binding.

## §C12 — Cross-Cutting Declarations for Identity Contracts

- **Purpose:** State, once, the declaration defaults every Doc-4C contract uses: the actor model — **User** (primary; tenant business operations within an active org context, §5.3), **Admin** (platform governance — organization suspension §5.1, ownership-succession recovery §5.5; 21.6, no active org context per §5.6), **System** (membership-invite and delegation-grant expiry timers, §5.2/§5.10); tenancy per entity (Doc-2 §6 — users/permissions platform-owned; memberships/roles/role_permissions/buyer_profiles/organization_workflow_settings tenant-owned; delegation_grants shared); **audit** binding to Doc-2 §9 (Organization domain + delegation actions) via the Doc-4B `core.append_audit_record` mechanism; **events** — Module 1 produces **no domain events** (Doc-2 §8 designates no `identity` emitter); identity is query-driven (§C3) — `Events-Produced: none` is the default, and any required cross-module notification is integration dependency DC-1, never an invented event; idempotency (§14) and the `identity_` error namespace; firewall — identity contracts touch **no governance signal** (§4B), so the Firewall-Compliance Declaration is `none` unless a contract reads a signal via its owner.
- **Why this section:** Identity's actor profile (tenant User primary, plus platform-governance Admin and System timers) and its no-events posture are atypical and must be stated once to prevent per-contract drift.
- **Source bindings:** Doc-4A §5, §5.6, §7, §14, §16, §17, §4B; Doc-2 §6, §8, §9; Doc-4B (audit-write, outbox, ID services — consumed by pointer).
- **Detail level:** Normative declaration defaults. No restatement of Doc-4A grammar.

---

## Appendix A — Module 1 Contract Inventory (skeleton)

- **Purpose:** The content-pass authoring worklist: one row per planned contract — capability, working contract name, owned entity, frozen template, actor type, and authoritative source pointer (Architecture / Doc-2 / Doc-3 / ADR / Doc-4A). Contract IDs use the `identity.` module prefix; error codes the `identity_` prefix (Doc-4A Appendix B). Skeleton only; no contract is instantiated in the Structure.
- **Why this appendix:** Converts the section map into a countable, reviewable authoring plan.
- **Detail level:** Table; pointer-heavy; no payloads.

## Appendix B — Doc-4A + Doc-4B Conformance Binding Map

- **Purpose:** One table mapping each Doc-4C section to the Doc-4A standard(s) and conformance check IDs that govern it (authorization §6/§6B, context §5/§5.3/§5.6, templates §21, audit §17, events §16, tenancy §7, state machines §13, ORG/POLICY §18), **and** to the Doc-4B Platform Core services it consumes by pointer (audit-write, outbox-write, UUIDv7 + human-reference allocation, POLICY resolution, feature-flag evaluation). Explicitly affirms Doc-4C redefines none of them.
- **Why this appendix:** Makes Doc-4C's conformance to the frozen Doc-4A standard and its consumption of frozen Doc-4B services auditable section-by-section.
- **Detail level:** Pointer table with check IDs.

## Appendix C — Carried Freeze-Gate Dependencies

These dependencies are **documented and carried forward**. They remain open and are resolved only through their named channels during content authoring; none may be silently resolved (Doc-4A §0.6). No dependency is resolved by this structure.

- **DC-1 — Identity cross-module cascade with no identity event.** Doc-2 §8 designates **no `identity` domain event**. The org soft-delete cascade (Doc-2 §5.1: vendor profile → suspended [Module 2], RFQs → archived [Module 3]) and the delegation revocation teardown (Doc-2 §5.10: remove `rfq_invitation_grantees`/visibility rows [Module 3]) cross module boundaries. **Resolution channel:** a Board decision selecting **service-call integrations** authored by the source (Identity) per §4.2/§4.4, or a **Doc-2 §8 identity event** addition via change management. No event is coined and no DC-1-dependent integration is authored until resolved (§C2 Template 21.2 guardrail).
- **DC-2 — Organization verification ownership boundary.** Organization Verification (Architecture §5.6) is a subject of `verification_records`, which are **owned by Trust (Module 5 / Doc-4G; Doc-2 §5.6)**. Doc-4C owns the `organizations` entity and the `can_submit_verification` permission (Doc-2 §7) but **not** `verification_records`. **Resolution channel:** confirm the submission-contract boundary — the identity-side trigger integrates with the Trust-owned verification contract per §4 single-authorship; Doc-4C authors no `verification_record` contract.
- **DC-3 — Platform-governance Admin slugs.** Organization suspension (§5.1 platform governance) and ownership-succession recovery (§5.5 admin recovery) are Admin (21.6) actions. Per the standing **D-2** decision (CARRY FORWARD), they bind to existing `staff_*` slugs (`staff_super_admin`) as the authoritative interim; least-privilege identity-admin slugs (e.g., `staff_can_manage_organizations`) remain a **future Doc-2 §7 additive enhancement**. No slug is invented.
- **DC-4 — Authentication boundary.** Supabase Auth performs authentication only (Doc-4A §5). Login, password, 2FA challenge, and session mechanics are infrastructure (development documents) — **not** Doc-4C business contracts. Doc-4C authors the user identity record, preferences, 2FA *settings*, and the post-authentication authorization context.
- **DC-5 — `identity.*` POLICY key registration.** Identity commands reference tunable values with no `identity.*` block in Doc-3 §12.2 — e.g., membership-invite expiry window (§5.2 `invited → expire`), delegation-grant validity defaults (§5.10), succession-reminder cadence (§5.5), and idempotency dedup windows. **Resolution channel:** the content pass enumerates the required keys and registers them via a **Doc-3 §12.2 additive patch** (the channel used for the Doc-4B `core.*` block); contracts reference intended key names with markers; escalate, do not invent (Doc-4A §18.2).

## Appendix D — Cross-Reference Index

- **Purpose:** Pointer table from every Doc-4C binding point to its authoritative source (Architecture §, ADR, Doc-2 §, Doc-3 §, Doc-4A §, Doc-4B service, patch ID per §3.5), so content-pass authors and agents resolve references without searching and reference-never-restate is auditable. Version identifiers canonical (Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0).
- **Why this appendix:** Operationalizes the precedence chain for AI agents.
- **Detail level:** Pointer table only.

---

*End of Doc-4C Canonical Structure v1.0 — FROZEN. Content-pass authoring proceeds against this structure; DC-1…DC-5 are carried as documented freeze-gate dependencies, resolved through their named channels and never silently. Any structural change requires a patch under Doc-4_Governance_Note_v1.0.*
