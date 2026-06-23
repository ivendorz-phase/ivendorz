# Doc-4D — Pass-B — Part A: Vendor Profile, Capacity, Declared Tier & Ownership (§D4–§D5)

| Field | Value |
|---|---|
| Part | A of E — hardened contract blocks for Pass-A §D4–§D5 |
| Master | `Doc-4D_Content_v1.0_PassB.md` (§B conventions govern; defaults cited as §B.x) |
| Status | DRAFT — ready for Independent Hard Review |
| Conforms To | Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D_Structure_v1.0_FROZEN (all FROZEN); Pass-A (closed) |
| Scope | Vendor Profile aggregate writes/reads + Trust-event consumers. No matching logic (DD-2); Trust decides / Marketplace reflects (DD-1). |

State transitions bind to **Doc-2 §5.3** (claim + status; literal edges only, §13). All defaults per the master **§B**.

---

#### `marketplace.create_vendor_profile.v1` — Create Vendor Profile · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile` (Doc-2 §7); Scope = creator's active org (becomes controlling org); Delegation not eligible.
- **Firewall:** §B.11 — none (capability flags are matching inputs Marketplace owns; no signal mutation).
- **Request Contract:** `name : string : required` (bounded); `vendor_type_preset : enum : optional`; `capability_flags : object{can_supply, can_service, can_fabricate, can_consult : boolean} : required`; `geography : object{country, division, district, industrial_zone} : required`; (server-set: `controlling_organization_id` from active-org context §5.3; `human_ref` via Doc-4B §B.2).
- **Response Contract (§B.3):** `{ vendor_profile_id : uuid, human_ref : string, claim_state : enum(=claimed), status : enum(=active), controlling_organization_id : uuid } + reference_id : uuid`.
- **Validation Matrix (§B.4):** SYNTAX (name/flags/geography present, types, enums) → CONTEXT (authenticated user; active org) → AUTHZ (`can_manage_vendor_profile`) → SCOPE (creator's org) → BUSINESS (one profile per org — `UNIQUE(controlling_organization_id)`, Doc-2 §10.3).
- **Error Register (§B.5):** `marketplace_vendor_invalid_input` (VALIDATION, no), `marketplace_vendor_forbidden` (AUTHORIZATION, no), `marketplace_vendor_already_exists` (CONFLICT, no — org already has a profile).
- **State Effects (§13):** Doc-2 §5.3 claim `→ claimed`.
- **Idempotency (§B.7):** required; client key; replay → cached; dedup `marketplace.command_dedup_window` [DD-6]; human-ref allocation participates in the single transaction.
- **Audit (§B.8):** yes; Vendor-profile "create"; attribution standard; Mutation-Scope `vendor_profiles`; Correlation both.
- **Events (§B.6/§16):** `VendorClaimed` (Doc-2 §8) via outbox-write.
- **Reference Validation (§B.10):** `controlling_organization_id` → Identity Org service (existence).
- **AI-Agent Notes:** enforce one-profile-per-org; `human_ref` display-only (allocate via Module 0, never local); do not set verified claim state (Trust-driven, DD-1).

#### `marketplace.claim_vendor_profile.v1` — Claim Vendor Profile · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile`; Scope = claiming org; Delegation not eligible. Claim requires a controlling org (Doc-2 §5.3 guard).
- **Request Contract:** `vendor_profile_id : uuid : required` (a seeded/invited profile); `claim_token : string : optional` (binds claimant to the invitation). (`vendor_claim_records` updated — **DD-7 tenancy unsettled; mutation ownership not finalized**.)
- **Response Contract (§B.3):** `{ vendor_profile_id, claim_state : enum(=claimed), controlling_organization_id } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (uuid; token) → CONTEXT (active org) → AUTHZ (`can_manage_vendor_profile`) → SCOPE (profile resolvable; claimant authorized to claim) → STATE (Doc-2 §5.3 claim `invited → claimed`) → REFERENCE (`vendor_profile_id` exists; claim record present) → BUSINESS (profile claimable; one controlling org).
- **Error Register (§B.5):** `marketplace_vendor_invalid_input` (VALIDATION, no), `marketplace_vendor_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (NOT_FOUND, no), `marketplace_vendor_state_invalid` (STATE, no — not in `invited`), `marketplace_vendor_claim_conflict` (CONFLICT, no — already claimed).
- **State Effects (§13):** Doc-2 §5.3 claim `invited → claimed`.
- **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Vendor-profile "claim"; attribution standard; Correlation both.
- **Events:** `VendorClaimed` (§8).
- **Reference Validation (§B.10):** `vendor_profile_id` existence + claim-record state (DD-7 boundary on the record's tenancy).
- **AI-Agent Notes:** seeding/invitation is Admin/Module 8 (import) — claim is Marketplace-side; do not author the seed (Admin); `vendor_claim_records` mutation ownership is DD-7-unsettled — do not finalize.

#### `marketplace.update_vendor_profile.v1` — Update Vendor Profile · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile`; Scope = controlling org; **Delegation eligible** (representative org via Doc-4C §6B delegation grant, consumed).
- **Firewall:** §B.11 — none (capability/geography are Marketplace-owned matching inputs).
- **Request Contract:** `vendor_profile_id : uuid : required`; `name : string : optional`; `capability_flags : object : optional`; `geography : object : optional`; `vendor_type_preset : enum : optional`; `updated_at : timestamp : required` (concurrency token).
- **Response Contract (§B.3):** `{ vendor_profile_id, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (types) → CONTEXT (active org) → AUTHZ (`can_manage_vendor_profile`) → SCOPE (caller controls the profile) → DELEGATION (§6B controller-or-grantee check via `check_permission`) → REFERENCE (`vendor_profile_id` exists) → BUSINESS (attribute edit; not a §5.3 transition).
- **Error Register (§B.5):** `marketplace_vendor_invalid_input` (VALIDATION, no), `marketplace_vendor_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_controller` (AUTHORIZATION, no — neither controlling org nor a valid §6B grantee), `marketplace_vendor_not_found` (NOT_FOUND, no), `marketplace_vendor_update_conflict` (CONFLICT, no — stale `updated_at`).
- **State Effects:** none (attribute edit). **Idempotency (§B.7):** required; dedup [DD-6]; optimistic on `updated_at`.
- **Audit (§B.8):** yes; Vendor-profile "capability/override change"; attribution standard; Correlation both.
- **Events:** none (a capability/geography change triggers an internal `vendor_matching_attributes` rebuild — Part E; not a domain event).
- **Reference Validation (§B.10):** profile existence + controlling-org/grantee authority (§6B).
- **AI-Agent Notes:** representative edits go through the §6B delegation grant (consume `check_permission`); never re-implement delegation; trigger the attribute rebuild via the internal rebuild path (Part E), not a new event.

#### `marketplace.transfer_vendor_ownership.v1` — Transfer Vendor Ownership · 21.4 Command · Actor: User (controlling org; approval-based)

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile` + approval business rule (ADR-005); Scope = current controlling org; **Delegation not eligible** (ownership-class action).
- **Request Contract:** `vendor_profile_id : uuid : required`; `new_controlling_organization_id : uuid : required`; `transfer_reason : string : required`; `approved_by : uuid : required` (approver per ADR-005); `updated_at : timestamp : required`.
- **Response Contract (§B.3):** `{ vendor_profile_id, new_controlling_organization_id, ownership_history_id : uuid, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (uuids; reason) → CONTEXT (active org = current controlling) → AUTHZ (`can_manage_vendor_profile`) → SCOPE (caller controls the profile) → REFERENCE (`new_controlling_organization_id` exists — Identity Org service) → BUSINESS (approval-based, ADR-005; `vendor_ownership_history` append; **triggers Trust Protection Workflow — DD-1**) → (no §5.3 transition; `controlling_organization_id` change).
- **Error Register (§B.5):** `marketplace_vendor_invalid_input` (VALIDATION, no), `marketplace_vendor_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_controller` (AUTHORIZATION, no), `marketplace_org_not_found` (REFERENCE, no — new org), `marketplace_vendor_transfer_invalid` (BUSINESS, no — approval/precondition), `marketplace_vendor_update_conflict` (CONFLICT, no).
- **State Effects (§13):** `vendor_ownership_history` append (Doc-2 §10.3); controlling-org reassignment.
- **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Vendor-profile "ownership transfer (full workflow)"; attribution standard; Mutation-Scope `vendor_profiles` + `vendor_ownership_history`; Correlation both.
- **Events:** `VendorOwnershipTransferred` (§8) — consumed by Trust (freeze), matching refresh, analytics.
- **Reference Validation (§B.10):** `new_controlling_organization_id` existence; caller controls the profile.
- **AI-Agent Notes:** **Trust Protection Workflow (freeze→review→reactivation) is Trust-owned (DD-1)** — Marketplace emits the event, never authors the freeze; ownership transfer is never a delegated action; approval is a hard precondition (ADR-005).

#### `marketplace.set_vendor_profile_status.v1` — Suspend / Reinstate Vendor Profile · 21.6 Admin · Actor: Admin · *(platform governance)*

- **Authorization (§B.9):** Membership n/a; **no active org context** (§5.6); Slug `staff_can_ban` (Doc-2 §7 — nearest platform vendor-moderation staff slug; least-privilege suspend slug is a future Doc-2 §7 additive, D-2 — **not invented**); Delegation not eligible.
- **Request Contract:** `vendor_profile_id : uuid : required`; `target_status : enum(suspended|active) : required`; `reason : string : required`; `updated_at : timestamp : required`.
- **Response Contract (§B.3):** `{ vendor_profile_id, status : enum, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (enum/reason) → CONTEXT (Admin; no org context; Admin-Scope §5.6) → AUTHZ (`staff_can_ban`) → SCOPE (profile resolvable under Admin-Scope) → STATE (Doc-2 §5.3 status `active ⇄ suspended`) → BUSINESS (reason recorded).
- **Error Register (§B.5):** `marketplace_vendor_invalid_input` (VALIDATION, no), `marketplace_vendor_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (NOT_FOUND, no), `marketplace_vendor_state_invalid` (STATE, no), `marketplace_vendor_status_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §5.3 status `active ⇄ suspended`. The **`banned`** status is set by the Admin ban action (`VendorBanned` → `reflect_vendor_ban`, **DD-3**) and lifted only via **DD-8** (`reflect_vendor_ban_lift`, blocked) — not by this contract.
- **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Vendor-profile "suspend"; attribution standard (Admin); Correlation both.
- **Events:** `VendorSuspended` (§8).
- **Reference Validation (§B.10):** profile existence under Admin-Scope.
- **AI-Agent Notes:** platform-staff only (no tenant slug/org context); this contract does **not** ban or lift-ban (ban = DD-3 consumer; lift = DD-8 blocked); cascade-suspend from Identity org soft-delete is DC-1 (Identity side).

#### `marketplace.get_vendor_profile.v1` — Get Vendor Profile · 21.3 Query (internal-service + public) · Actor: User / internal-service / public

- **Authorization (§B.9):** public read of published fields; internal-service full projection for entitled consumers; non-disclosure (§7.5).
- **Request Contract:** `vendor_profile_id : uuid : optional` XOR `human_ref : string : optional` (one required).
- **Response Contract (§B.3):** `{ vendor_profile : object (projection per §B.3 — public: name, human_ref, capability_flags, geography, claim_state(public), status(public), public TrustIndicators [read-model from Trust, DD-1]) } + reference_id`.
- **Validation Matrix (§B.4, query):** SYNTAX (one identifier present) → CONTEXT (caller) → AUTHZ (public/entitled) → SCOPE (existence; `NOT_FOUND` collapse).
- **Error Register (§B.5):** `marketplace_vendor_invalid_input` (VALIDATION, no), `marketplace_vendor_not_found` (NOT_FOUND, no).
- **Query semantics (§B.6):** single-entity read; no list. **Projection:** entitled fields only; `TrustIndicators` are Trust's read-model (not Marketplace-owned). **Idempotency:** not-applicable. **Audit:** no.
- **Events:** none. **Reference Validation:** identifier existence.
- **AI-Agent Notes:** canonical vendor-profile read — consumers MUST use this, not direct table access; never expose protected facts (§7.5); `TrustIndicators` are read-through from Trust (DD-1).

#### `marketplace.upsert_vendor_capacity_profile.v1` — Create / Update Vendor Capacity · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile`; Scope = controlling org; Delegation eligible (§6B).
- **Firewall:** §B.11 — `verified_fields_jsonb` records **which capacity claims Trust verified**; capacity **verification is Trust-owned (DD-1)** — Marketplace stores declared capacity + verified-field markers, never decides verification.
- **Request Contract:** `vendor_profile_id : uuid : required`; `manufacturing/service/project/commercial capacity fields : object : optional`; `max_project_value : numeric : optional`; `max_monthly_rfq_capacity : integer : optional`; `employee_count_range / factory_size_range / annual_turnover_range : enum : optional`; `updated_at : timestamp : optional` (on update).
- **Response Contract (§B.3):** `{ vendor_capacity_profile_id : uuid, vendor_profile_id, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (types/bounds) → CONTEXT (active org) → AUTHZ (`can_manage_vendor_profile`) → SCOPE (caller controls profile) → DELEGATION (§6B) → REFERENCE (`vendor_profile_id` exists) → BUSINESS (1:1 with profile; upsert).
- **Error Register (§B.5):** `marketplace_capacity_invalid_input` (VALIDATION, no), `marketplace_capacity_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (NOT_FOUND, no), `marketplace_capacity_conflict` (CONFLICT, no — stale token).
- **State Effects:** simple (1:1 upsert). **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Vendor-profile "capability/override change"; attribution standard.
- **Events:** none (capacity change → internal matching rebuild, Part E).
- **Reference Validation (§B.10):** profile existence + controlling-org/grantee authority.
- **AI-Agent Notes:** never set/derive `verified_fields_jsonb` from Marketplace logic — those markers reflect Trust's verification (DD-1); do not compute matching (DD-2).

#### `marketplace.get_vendor_capacity_profile.v1` — Get Vendor Capacity · 21.3 Query · Actor: User / public

- **Authorization (§B.9):** public read of displayed capacity fields; full to controlling org. **Request:** `vendor_profile_id : uuid : required`. **Response (§B.3):** `{ vendor_capacity_profile : object (display projection) } + reference_id`. **Validation (query):** SYNTAX → CONTEXT → AUTHZ(public/owning) → SCOPE. **Error:** `marketplace_capacity_not_found` (NOT_FOUND, no), `marketplace_capacity_invalid_input` (VALIDATION, no). **Query (§B.6):** single read; public display fields. **Idempotency:** n/a. **Audit:** no. **Events:** none. **AI-Agent Notes:** public display fields only; verified markers are Trust-owned read-through.

#### `marketplace.set_declared_financial_tier.v1` — Set Declared Financial Tier · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile` (Doc-2 §7 — "tier change additionally audited"); Scope = controlling org; Delegation eligible (§6B).
- **Firewall:** §B.11 — **writes the declared Financial Tier signal Marketplace owns**; verified tier is Trust's (DD-1); declared tier never gates/mutates trust/performance/verified-tier and is never gated by a paid plan (§4B).
- **Request Contract:** `vendor_profile_id : uuid : required`; `tier : enum(A|B|C|D|E) : required`; `declared_at : timestamp : optional` (server default now); `updated_at : timestamp : optional`.
- **Response Contract (§B.3):** `{ vendor_profile_id, tier : enum, financial_tier_history_id : uuid } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (tier enum) → CONTEXT (active org) → AUTHZ (`can_manage_vendor_profile`) → SCOPE (caller controls profile) → DELEGATION (§6B) → REFERENCE (`vendor_profile_id` exists) → BUSINESS (0..1 declared per profile; `financial_tier_history` append `tier_type='declared'`, Doc-2 §10.3).
- **Error Register (§B.5):** `marketplace_tier_invalid_input` (VALIDATION, no), `marketplace_tier_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (NOT_FOUND, no), `marketplace_tier_conflict` (CONFLICT, no).
- **State Effects (§13):** `declared_financial_tiers` head + `financial_tier_history` append (declared).
- **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Vendor-profile "tier change (declared)"; attribution standard; Correlation both.
- **Events:** `VendorTierChanged[tier_type='declared']` (§8).
- **Reference Validation (§B.10):** profile existence + controlling-org/grantee authority.
- **AI-Agent Notes:** declared tier ≠ verified tier (Trust, DD-1); Marketplace writes declared `financial_tier_history` directly; never gate the declared tier by a plan (§4B).

#### `marketplace.get_declared_financial_tier.v1` — Get Declared Financial Tier · 21.3 Query · Actor: User / public

- **Authorization (§B.9):** public read. **Request:** `vendor_profile_id : uuid : required`. **Response (§B.3):** `{ tier : enum, declared_at } + reference_id`. **Validation (query):** SYNTAX → CONTEXT → AUTHZ(public) → SCOPE. **Error:** `marketplace_tier_not_found` (NOT_FOUND, no). **Query (§B.6):** single read. **Idempotency:** n/a. **Audit:** no. **Events:** none. **AI-Agent Notes:** the declared tier; verified tier is a separate Trust-owned record.

#### `marketplace.get_financial_tier_history.v1` — Get Financial Tier History · 21.3 Query · Actor: User / internal-service

- **Authorization (§B.9):** entitled read (owning org / internal-service). **Request:** `vendor_profile_id : uuid : required`; filters `tier_type : enum(declared|verified) : optional`; pagination (§B.6). **Response (§B.3):** `{ items : list<tier_history_row>, page_info } + reference_id`. **Validation (query):** SYNTAX → CONTEXT → AUTHZ(entitled) → SCOPE. **Error:** `marketplace_tier_invalid_input` (VALIDATION, no), `marketplace_vendor_not_found` (NOT_FOUND, no). **Query (§B.6):** filter `tier_type`; sort `effective_from` (tiebreaker id); cursor pagination. **Idempotency:** n/a. **Audit:** no. **Events:** none. **AI-Agent Notes:** `financial_tier_history` is **written exclusively by Marketplace** (declared directly; verified via the consumer below) — this is a read; never write verified rows except via `sync_verified_financial_tier`.

#### `marketplace.sync_verified_financial_tier.v1` — Sync Verified Financial Tier *(event consumer)* · 21.5 System · Actor: System

- **Authorization (§B.9):** System; platform scope; not user-invocable. **Firewall:** §B.11 — projects the Trust-owned verified-tier signal into history; does not mutate the verified signal.
- **Trigger / inputs:** Trust `VendorTierChanged[tier_type='verified']` (Doc-2 §8) — inputs are the event payload (vendor_profile_id, old/new verified tier).
- **Response Contract:** `Response: none` (21.5; §B.3).
- **Validation Matrix (§B.4):** SYNTAX (payload well-formed) → CONTEXT (System; platform scope, §5.2) → REFERENCE (`vendor_profile_id` exists) → BUSINESS (idempotent: write one `financial_tier_history` row `tier_type='verified'`; Trust never writes this table — Doc-2 §10.3).
- **Error Register (internal, §B.5):** `marketplace_tier_sync_failed` (DEPENDENCY, yes), `marketplace_tier_payload_invalid` (VALIDATION, no).
- **State Effects (§13):** `financial_tier_history` append (`tier_type='verified'`).
- **Idempotency (§B.7):** required (platform scope) — dedup source = the event identity / existing history row; an already-synced event is not re-applied.
- **Audit (§B.8):** yes; Vendor-profile "tier change (verified)"; attribution system; Correlation phase2-origin.
- **Events:** consumes Trust `VendorTierChanged[verified]` (§8); emits none. **Integration:** consume (delivery contract is Trust's per §4.4 — **DD-1**).
- **Reference Validation (§B.10):** `vendor_profile_id` existence.
- **AI-Agent Notes:** Marketplace is the **exclusive writer** of `financial_tier_history` (Trust never writes it); this consumer reflects Trust's verified tier — it never decides verification (DD-1); idempotent on replay.

#### `marketplace.reflect_verified_claim_status.v1` — Reflect Verified Claim Status *(event consumer)* · 21.5 System · Actor: System

- **Authorization (§B.9):** System; platform scope; not user-invocable.
- **Trigger / inputs:** Trust `VendorVerified` (Doc-2 §8) — inputs are the event payload (vendor_profile_id).
- **Response Contract:** `Response: none` (21.5).
- **Validation Matrix (§B.4):** SYNTAX (payload) → CONTEXT (System; §5.2) → STATE (Doc-2 §5.3 claim `claimed → verified`; literal edge) → BUSINESS (idempotent; profile in `claimed`).
- **Error Register (internal):** `marketplace_vendor_state_invalid` (STATE, no), `marketplace_vendor_payload_invalid` (VALIDATION, no).
- **State Effects (§13):** Doc-2 §5.3 claim `claimed → verified` (reflected; no edge invented).
- **Idempotency (§B.7):** required (platform scope) — dedup source = target row already `verified`.
- **Audit (§B.8):** yes; Vendor-profile "verify"; attribution system; Correlation phase2-origin.
- **Events:** consumes Trust `VendorVerified` (§8); emits none. May trigger an internal `vendor_matching_attributes` rebuild (Part E) — *(N-01: dual `VendorVerified` consumer; Pass-B subscription detail — this consumer updates claim status; `rebuild_vendor_matching_attributes` handles the attribute rebuild; both subscribe to `VendorVerified`; event flow unchanged)*.
- **Integration:** consume (delivery is Trust's per §4.4 — **DD-1**). **Reference Validation:** `vendor_profile_id` existence.
- **AI-Agent Notes:** **Marketplace reflects, never decides, verification** (DD-1); the verification decision/workflow is Trust-owned; idempotent on replay; do not author a Marketplace "verify" command.

---

*End of Doc-4D Pass-B — Part A (Vendor Profile, Capacity, Declared Tier & Ownership, §D4–§D5). 13 contracts hardened per the master §B conventions. No entity/event/slug/audit-action/POLICY-key/template invented; DD-1 (Trust decides/Marketplace reflects), DD-6 (intended POLICY keys), DD-7 (`vendor_claim_records` tenancy) carried. No matching logic (DD-2). Ready for Independent Hard Review.*
