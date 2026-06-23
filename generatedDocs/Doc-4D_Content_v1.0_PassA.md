# Doc-4D — Marketplace & Discovery — API & Integration Contracts — Content v1.0, Pass-A

| Field | Value |
|---|---|
| Document | Doc-4D — Marketplace & Discovery (Module 2 — `marketplace` schema) |
| Pass | A of N — **contract authoring structure**: contract inventory, ownership / lifecycle / authorization / audit / event / integration bindings, source pointers. **No payloads** (request/response schemas, validation matrices, error registers, idempotency, pagination, query detail are Pass-B). |
| Status | **DRAFT — ready for Independent Hard Review** |
| Module | Module 2 — Marketplace & Discovery (`marketplace` schema) |
| Structure | Conforms to `Doc-4D_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0 (all FROZEN) |
| Contains | Pass-A contract-authoring records for Module 2 only — **no new entity, contract, event, permission slug, audit action, POLICY key, or template coined; no ownership / state-machine / actor / dependency change** |
| Audience | Claude Code, Cursor, backend, QA, AI development agents |

**Pass-A scope note (read first).** This Pass authors the **contract-authoring structure** for the capabilities defined by the frozen Doc-4D structure: for each capability a working Contract-ID (`marketplace.<operation>.v1`), the owned entity, the Doc-4A template, the actor, and the ownership / lifecycle / authorization / audit / event / integration bindings **by pointer** — plus the per-contract **source pointers** (ownership / authority / lifecycle / audit / event) required for AI-agent implementation without architectural assumptions. **Request/Response payloads, per-field validation matrices, error registers, idempotency declarations, pagination, and query detail are deliberately not instantiated here (Pass-B).** Where a frozen lower-layer artifact is needed it is **referenced by pointer, never restated** (Doc-4A §0.3). DD-1…DD-7 and `[ESC-MKT-AUDIT]` are carried **verbatim** from the frozen structure; none is resolved. This document performs **no self-review and contains no findings or commentary**. **Scope guard:** no RFQ functionality, procurement workflow, or matching/routing logic is authored — those are Doc-4E (Module 3).

---

## §B — Pass-A Cross-Cutting Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate and avoid duplication, the following apply to **every** contract; per-contract records cite specifics and reference these by pointer.

- **B.1 — Contract-ID & templates (Doc-4A §21).** Contract-ID `marketplace.<operation>.v1` (prefix = schema `marketplace`; Appendix B namespace `marketplace_`). Templates: **21.3 Query** (reads), **21.4 Command** (mutations/state-transitions), **21.6 Admin** (platform-staff; no active org context, §5.6), **21.5 System** (Phase-2 timers/sweeps and inbound event-consumer effects). **Template 21.2 (Integration) is NOT instantiated here** — per Doc-4A §4.4 the event-delivery integration contract is authored by the **emitting** module; Marketplace authors only its own command (emit) and its consumer effects on its own entities (single-authorship). No template invented.
- **B.2 — Actor types (Doc-4A §5; Doc-2 §9 actor set User|Admin|System|AI Agent).** **User** (tenant member acting in a server-validated active-org context, §5.3 — the controlling organization for vendor-owned data); **Admin** (platform-staff, no active org context, §5.6 — moderation/governance); **System** (Phase-2 timers and inbound event consumers); **internal-service** (D-1 composition; 21.3 reads consumed cross-module). No actor category invented.
- **B.3 — Identifiers (Doc-4A §8; Doc-2 §0.1).** UUIDv7 is the only canonical machine ID; `vendor_profiles` carry `human_ref` (display/lookup convenience, allocated via Doc-4B `core.allocate_human_reference.v1`). Cross-module references (`controlling_organization_id`, `purchaser_organization_id`, `platform_invoice_id`, etc.) are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3).
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B). **Slugs only** (§6.2), from the Doc-2 §7 catalog; **no slug invented**. Marketplace **consumes** Identity's `check_permission` and org/membership resolution (Doc-4C §C3/§C8, FROZEN) and the §6B **delegation grant** path for a representative org acting on a vendor profile it does not control — **no shadow authorization** is implemented. Vendor-owned write scope = the **controlling organization** of the target `vendor_profiles` row.
- **B.5 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Audited mutations bind to the **Doc-2 §9 Vendor-profile** and **Profile-experience** domains by pointer (attribution standard for User/Admin, system for System; mutation-scope = the `marketplace.*` table; written in-transaction via the Doc-4B mechanism, never re-implemented). **Reads are not audited** (§17.1). A mutation whose audit action is **not separately enumerated in Doc-2 §9** carries **`[ESC-MKT-AUDIT]`** (interim: nearest §9 action by pointer; channel: Doc-2 §9 additive; **no audit action invented**).
- **B.6 — Events (Doc-2 §8 via Doc-4B outbox-write).** Emitted events are **only** those in the Doc-2 §8 Marketplace catalog, written transactionally via Doc-4B `core.write_outbox_event.v1`; **no event coined** (§16.4). Inbound consumer effects bind to the Doc-2 §8 events emitted by **other** modules (Trust, Admin); the delivery integration is the emitter's (§4.4).
- **B.7 — Governance-signal firewall (Doc-4A §4B / §18.3).** Marketplace **owns the declared Financial Tier signal** (`declared_financial_tiers`) and writes `financial_tier_history` for **declared** changes directly and **verified** changes only as an idempotent consumer of Trust's `VendorTierChanged[verified]` (Doc-2 §8/§10.3 — Trust never writes it). Marketplace **projects** trust/performance/verified-tier bands into the **derived** `vendor_matching_attributes` read-model (DD-2). It **never lets one governance signal mutate another**, never computes matching/eligibility, and **no paid plan / entitlement / flag gates any signal, verification, eligibility, routing, or matching** (§4B). Per-contract firewall notes appear where a signal is written (declared tier) or projected (matching rebuild); all other contracts touch no signal.
- **B.8 — AI-agent source rule.** Every contract record states its **ownership / authority / lifecycle / audit / event source** by pointer, so Claude Code / Cursor / backend / QA implement without architectural assumptions. Global constraints: consume frozen Doc-4B/Doc-4C services (never re-derive auth/membership/delegation/audit); honor the Doc-2 §5.3/§5.8 machines verbatim; never expose a protected fact (§7.5); never author RFQ/matching logic (DD-2); never coin an entity/event/slug/audit-action/POLICY-key/template (escalate via DD / `[ESC-MKT-AUDIT]`).

---

## §D0 — Governance & Scope

Doc-4D Pass-A authors the contracts of **Module 2 — Marketplace & Discovery only**, subordinate to the frozen corpus and Doc-4A. It introduces no standard, entity, state, event, slug, audit action, POLICY key, or template, and overrides nothing higher. **Precedence:** Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D. **Conflict → flag-and-halt** (Doc-4A §0.6); never resolve locally. Effective versions: Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0. **Carried freeze-gate dependency / escalation markers (verbatim from the frozen structure §D0; carried, not resolved):** DD-1 (verification ownership — Trust), DD-2 (matching/routing logic — RFQ; Marketplace owns the read-model), DD-3 (ban authority — Admin), DD-4 (category approval — Admin staff), DD-5 (ad/custom-domain entitlement — Billing), DD-6 (`marketplace.*` POLICY keys — Doc-3 §12.2 additive), DD-7 (`vendor_claim_records` tenancy — Doc-2 §6/§3.3 reconciliation), `[ESC-MKT-AUDIT]` (audit-action gaps — Doc-2 §9 additive). Family-map: **Doc-4D = Marketplace & Discovery (Module 2)** (Doc-4A §1.3; RFQ = Doc-4E/Module 3, not authored here).

---

## §D1 — Module Mission

Module 2 is the platform's **public vendor identity, catalog, discovery, and presentation layer**. It owns the authoritative vendor capability/geography/category/declared-tier/capacity **data** and the **derived `vendor_matching_attributes` read-model** that the RFQ routing moat consumes — it **feeds** the moat, it does **not** run it (DD-2). Positioning per Architecture (40% B2B Marketplace · 30% Procurement · 20% ERP-Lite · 10% Vendor Network); marketplace-maturity staging (Stage A→C) governs seeding/discovery posture (Doc-3 §0). *Source:* Architecture (platform identity, marketplace, microsites, advertising); Doc-2 §2; Doc-3 §0.

---

## §D2 — Ownership Model

**Owned (Doc-2 §2/§3.3/§10.3, by pointer):** Vendor Profile aggregate (`vendor_profiles` + `vendor_capacity_profiles`, `declared_financial_tiers`, `financial_tier_history`, `category_assignments`, `vendor_matching_attributes`, `vendor_ownership_history`, `vendor_claim_records` (**tenancy ambiguity — DD-7; ownership not finalized**), `profile_sections`, `branding_assets`, `seo_settings`, `custom_domains`); Category (`categories`, `category_assignments`); Product (`products`, `product_spec_links`); Specification Library (`spec_library_entries`, `spec_documents`); Microsite (`microsites`); Advertisement (`advertisements`); Showcase Project (`showcase_projects`); Catalog Favorite (`catalog_favorites`).

**Explicitly NOT owned (reference by UUID only; consume by service/event):** `organizations`/`memberships`/`delegation_grants` (Identity / Doc-4C); `verification_records`/`trust_scores`/`performance_scores`/`verified_financial_tiers` (Trust / Doc-4G — DD-1); `rfqs`/`quotations`/matching+routing logic (RFQ / Doc-4E — DD-2); `private_vendor_records`/`vendor_favorites`/`engagements` (Operations / Doc-4F); `ban_actions` (Admin / Doc-4J — DD-3); `subscriptions`/`entitlements`/`platform_invoices` (Billing / Doc-4I — DD-5); all `core.*` (Platform Core / Doc-4B). **One Entity = One Owner; One Business Truth = One Source** (Doc-4A §4.1). *Source:* Doc-2 §2/§3.3/§6/§10.3; ADR-005/ADR-017; Architecture Patch v1.0.1 (PATCH-01/02/05).

---

## §D3 — Bounded Context Model (Pass-A grouping)

Contract records below are grouped by the frozen structure's bounded contexts: **Vendor Profile & Identity-Anchor** (§D4/§D5 — profile, claim, ownership, capacity, declared tier), **Catalog & Taxonomy** (§D7 — categories, assignments), **Product & Specification** (§D7 — products, spec library), **Profile Experience & Presentation** (§D6 — microsites, sections, branding, SEO, custom domains, showcase), **Advertising** (§D7 — advertisements), **Discovery & Read-Model** (§D6 — search/directory/public reads, `vendor_matching_attributes` exposure). All contexts are within Marketplace; cross-module interactions are §D8. *Source:* frozen Doc-4D structure §D3.

---

## §D4–§D5 — Vendor Profile, Capacity, Declared Tier & Ownership (`vendor_profiles` aggregate)

Vendor-owned data is written by the **controlling organization** (User actor, active-org context); platform-governance status is Admin. State transitions bind to **Doc-2 §5.3** (claim + status dimensions; legal edges only, §13 — none invented). Cross-module legs (verification, ownership-transfer Trust freeze, ban) are **[DD-1]/[DD-3]**.

#### `marketplace.create_vendor_profile.v1` — Create Vendor Profile · 21.4 Command · Actor: User

- *Capability:* create a vendor profile via direct registration (claim dimension → `claimed`); one profile per org (`UNIQUE(controlling_organization_id)`).
- *Owned entity:* `vendor_profiles` (AR) · *Authority:* owner = Marketplace (controlling org = creator's active org); non-owners = Identity (org), Trust (verification). Slug **`can_manage_vendor_profile`** (Doc-2 §7); Scope = active org; not delegation-eligible at create.
- *Lifecycle:* Doc-2 §5.3 claim `→ claimed` (direct registration). Allocates `human_ref` via Doc-4B `core.allocate_human_reference.v1`.
- *Authorization:* §6 three-layer; Doc-2 §7. · *Audit:* yes → Doc-2 §9 Vendor-profile "create" (via Doc-4B). · *Events:* `VendorClaimed` (Doc-2 §8) via Doc-4B outbox-write. · *Integration:* none cross-module at create.
- *Sources:* ownership Doc-2 §2/§3.3; authority Doc-2 §7 / Doc-4A §6; lifecycle Doc-2 §5.3; audit Doc-2 §9; event Doc-2 §8.

#### `marketplace.claim_vendor_profile.v1` — Claim Vendor Profile · 21.4 Command · Actor: User

- *Capability:* a controlling org claims a seeded/invited profile (`invited → claimed`); tracked in `vendor_claim_records`.
- *Owned entity:* `vendor_profiles` (+ `vendor_claim_records` — **DD-7 tenancy ambiguity; mutation ownership not finalized**) · *Authority:* owner = Marketplace (claiming org); Slug **`can_manage_vendor_profile`**; Scope = active org; claim requires a controlling org (Doc-2 §5.3 guard).
- *Lifecycle:* Doc-2 §5.3 claim `invited → claimed`. · *Authorization:* §6; Doc-2 §7. · *Audit:* yes → Doc-2 §9 Vendor-profile "claim". · *Events:* `VendorClaimed` (§8). · *Integration:* seeding/invitation source is platform import (Admin / Module 8); claim is Marketplace-owned.
- *Sources:* ownership Doc-2 §2/§3.3 (DD-7); authority §7/§6; lifecycle §5.3; audit §9; event §8.

#### `marketplace.update_vendor_profile.v1` — Update Vendor Profile · 21.4 Command · Actor: User

- *Capability:* edit profile attributes — capability flags (`can_supply/service/fabricate/consult`), geography, `vendor_type_preset`, presentation anchor (Doc-2 §10.3).
- *Owned entity:* `vendor_profiles` · *Authority:* owner = controlling org; Slug **`can_manage_vendor_profile`**; Scope = controlling org; representative org may act **only** via a §6B delegation grant (consumed from Doc-4C).
- *Lifecycle:* none (attribute edit; not a §5.3 transition). · *Authorization:* §6/§6B; Doc-2 §7; Doc-4C `check_permission` consumed. · *Audit:* yes → Doc-2 §9 Vendor-profile "capability/override change". · *Events:* none (a capability/geography change triggers an internal `vendor_matching_attributes` rebuild — §D8/§D9; not a domain event). · *Firewall:* capability/geography are matching **inputs** Marketplace owns; no governance-signal mutation (§4B).
- *Sources:* ownership Doc-2 §3.3; authority §7/§6/§6B + Doc-4C; lifecycle §3.3; audit §9; event §8 (none).

#### `marketplace.transfer_vendor_ownership.v1` — Transfer Vendor Ownership · 21.4 Command · Actor: User (controlling org; approval-based)

- *Capability:* transfer the controlling organization of a vendor profile — approval-based, audited, versioned (ADR-005); appends `vendor_ownership_history`; **triggers the Trust Protection Workflow** (trust freeze → compliance review → reactivation) — **[DD-1]**.
- *Owned entity:* `vendor_profiles` (+ `vendor_ownership_history`, append-only) · *Authority:* owner = Marketplace (current controlling org initiates; approval per ADR-005); Slug **`can_manage_vendor_profile`** + approval business rule (ADR-005); ownership-class action — **not delegation-eligible**.
- *Lifecycle:* `vendor_ownership_history` append (Doc-2 §10.3); no `vendor_profiles` §5.3 transition (controlling_organization_id change). · *Authorization:* §6; Doc-2 §7; ADR-005. · *Audit:* yes → Doc-2 §9 Vendor-profile "ownership transfer (full workflow)". · *Events:* `VendorOwnershipTransferred` (§8) — consumed by Trust (freeze), matching refresh, analytics. · *Integration:* Trust Protection Workflow is **Trust-owned** (DD-1); Marketplace emits the event, does not author the freeze.
- *Sources:* ownership Doc-2 §3.3 + ADR-005; authority §7/§6 + ADR-005; lifecycle §10.3; audit §9; event §8.

#### `marketplace.set_vendor_profile_status.v1` — Suspend / Reinstate Vendor Profile · 21.6 Admin · Actor: Admin · *(platform governance)*

- *Capability:* platform-staff suspend/reinstate of a vendor profile (`active ⇄ suspended`, Doc-2 §5.3).
- *Owned entity:* `vendor_profiles` · *Authority:* owner = Marketplace (status transition); **no active org context** (§5.6); Slug **`staff_can_ban`** (Doc-2 §7 — nearest existing platform vendor-moderation staff slug; suspend is a lesser moderation action within that authority; a dedicated least-privilege staff slug is a future Doc-2 §7 additive per D-2 — **not invented**); not delegation-eligible.
- *Lifecycle:* Doc-2 §5.3 status `active ⇄ suspended` (admin). The **`banned`** status (`active → banned`) is set by the **Admin ban action** (`ban_actions`, `VendorBanned`) — **[DD-3]**, reflected via the consumer (§D8), not authored here. Cascade-suspend from an Identity org soft-delete is **[DD-1/DC-1]** (Identity side; carried).
- *Authorization:* §5.6; Doc-2 §7 (DD-3 staff authority). · *Audit:* yes → Doc-2 §9 Vendor-profile "suspend". · *Events:* `VendorSuspended` (§8). · *Integration:* ban decision is Admin-owned (DD-3).
- *Sources:* ownership Doc-2 §3.3; authority §7/§5.6 (DD-3); lifecycle §5.3; audit §9; event §8.

#### `marketplace.get_vendor_profile.v1` — Get Vendor Profile · 21.3 Query (internal-service + public) · Actor: User / internal-service / public

- *Capability:* read a vendor profile by id/`human_ref` (public presentation projection; internal full projection for entitled consumers).
- *Owned entity:* `vendor_profiles` · *Authority:* public read of published fields; tenancy/non-disclosure per §7; consumed cross-module (the canonical vendor-profile read — no direct table access by other modules). · *Lifecycle:* reads §5.3 (no transition). · *Audit:* no (read). · *Events:* none. · *Integration:* expose (read) to all modules; `TrustIndicators` in the projection are a **read-model from Trust** (DD-1), not a Marketplace-owned signal.
- *Sources:* ownership Doc-2 §3.3; authority Doc-4A §7; lifecycle §5.3.

#### `marketplace.upsert_vendor_capacity_profile.v1` — Create / Update Vendor Capacity · 21.4 Command · Actor: User

- *Capability:* create/update the capacity profile (1:1 with vendor profile) — manufacturing/service/project/commercial capacity, `max_project_value`, `max_monthly_rfq_capacity`, etc. (Doc-2 §10.3).
- *Owned entity:* `vendor_capacity_profiles` (Vendor Profile child) · *Authority:* owner = controlling org; Slug **`can_manage_vendor_profile`**; Scope = controlling org; representative via §6B delegation.
- *Lifecycle:* simple (1:1 upsert). · *Authorization:* §6/§6B; Doc-2 §7. · *Audit:* yes → Doc-2 §9 Vendor-profile "capability/override change". · *Events:* none (capacity change → internal matching rebuild). · *Firewall:* `verified_fields_jsonb` records **which claims Trust verified** — capacity **verification is Trust-owned (DD-1)**; Marketplace stores the declared capacity + the verified-field markers, never decides verification.
- *Sources:* ownership Doc-2 §3.3; authority §7/§6/§6B; lifecycle §3.3; audit §9; event §8 (none).

#### `marketplace.get_vendor_capacity_profile.v1` — Get Vendor Capacity · 21.3 Query · Actor: User / public

- *Capability:* read capacity display fields (public read of displayed parts; full to controlling org). · *Owned entity:* `vendor_capacity_profiles` · *Authority:* public/owning-org read (§7). · *Lifecycle:* read. · *Audit:* no. · *Events:* none. · *Sources:* ownership §3.3; authority §7.

#### `marketplace.set_declared_financial_tier.v1` — Set Declared Financial Tier · 21.4 Command · Actor: User

- *Capability:* set/change the **declared** financial tier (A–E) for a vendor profile (0..1 per profile; Doc-2 §10.3).
- *Owned entity:* `declared_financial_tiers` (+ `financial_tier_history` declared row) · *Authority:* owner = controlling org; Slug **`can_manage_vendor_profile`** (Doc-2 §7 — "tier change additionally audited"); Scope = controlling org; representative via §6B.
- *Lifecycle:* `declared` head record + `financial_tier_history` append (`tier_type='declared'`, Doc-2 §10.3 — **Marketplace writes declared changes directly**). · *Authorization:* §6/§6B; Doc-2 §7. · *Audit:* yes → Doc-2 §9 Vendor-profile "tier change (declared)". · *Events:* `VendorTierChanged[tier_type='declared']` (§8). · *Firewall:* **writes the declared Financial Tier signal Marketplace owns**; the verified tier is Trust's (DD-1); declared tier never gates/mutates trust/performance/verified-tier and is never gated by a paid plan (§4B).
- *Sources:* ownership Doc-2 §3.3/§10.3; authority §7/§6; lifecycle §10.3; audit §9; event §8.

#### `marketplace.get_declared_financial_tier.v1` — Get Declared Financial Tier · 21.3 Query · Actor: User / public

- *Capability:* read the current declared tier. · *Owned entity:* `declared_financial_tiers` · *Authority:* public read (§7). · *Lifecycle:* read. · *Audit:* no. · *Events:* none. · *Sources:* ownership §3.3; authority §7.

#### `marketplace.get_financial_tier_history.v1` — Get Financial Tier History · 21.3 Query · Actor: User / internal-service

- *Capability:* read the append-only tier history (declared + verified rows). · *Owned entity:* `financial_tier_history` (append-only; **written exclusively by Marketplace**, Doc-2 §10.3) · *Authority:* entitled read (§7). · *Lifecycle:* read (append-only). · *Audit:* no. · *Events:* none. · *Sources:* ownership Doc-2 §10.3; authority §7.

#### `marketplace.sync_verified_financial_tier.v1` — Sync Verified Financial Tier *(event consumer)* · 21.5 System · Actor: System

- *Capability:* on Trust's `VendorTierChanged[tier_type='verified']`, write the corresponding `financial_tier_history` (verified) row as the **idempotent exclusive consumer** — **Trust never writes `financial_tier_history`** (Doc-2 §8/§10.3).
- *Owned entity:* `financial_tier_history` · *Authority:* System; platform scope; not user-invocable. · *Lifecycle:* `financial_tier_history` append (`tier_type='verified'`). · *Authorization:* System (§5.2). · *Audit:* yes → Doc-2 §9 Vendor-profile "tier change (verified)"; attribution system. · *Events:* consumes Trust `VendorTierChanged[verified]` (§8); emits none. · *Integration:* **consume** (the 21.2 delivery contract is Trust's per §4.4 — **[DD-1]**); Marketplace owns the history write only. · *Firewall:* projects the Trust-owned verified-tier signal into history; does not mutate the verified signal.
- *Sources:* ownership Doc-2 §10.3; authority §5.2; lifecycle §10.3; audit §9; event §8 (Trust emitter).

#### `marketplace.reflect_verified_claim_status.v1` — Reflect Verified Claim Status *(event consumer)* · 21.5 System · Actor: System

- *Capability:* on Trust's `VendorVerified`, update the vendor-profile **claim** dimension `claimed → verified` — Marketplace **reflects** the verification outcome and **does not decide verification** (m-01 / **[DD-1]**).
- *Owned entity:* `vendor_profiles` (claim dimension) · *Authority:* System; platform scope; not user-invocable. · *Lifecycle:* Doc-2 §5.3 claim `claimed → verified` (literal edge; consumer-driven; no edge invented). · *Authorization:* System (§5.2). · *Audit:* yes → Doc-2 §9 Vendor-profile "verify"; attribution system. · *Events:* consumes Trust `VendorVerified` (§8); emits none. · *Integration:* **consume** (delivery contract is Trust's, §4.4 — **[DD-1]**); verification **decision** is Trust-owned, never authored here.
- *Sources:* ownership Doc-2 §3.3; authority §5.2; lifecycle §5.3; audit §9; event §8 (Trust emitter).

---

## §D7 — Catalog & Taxonomy (`categories`, `category_assignments`)

`categories` is Marketplace-owned, but **category approval/governance is a platform-staff action — [DD-4]** (`staff_can_manage_categories`). Vendor↔category **assignment** is a controlling-org action.

#### `marketplace.create_category.v1` · `marketplace.update_category.v1` · `marketplace.set_category_status.v1` — Category Lifecycle · 21.6 Admin · Actor: Admin

- *Capability:* create/edit a category and drive its lifecycle (`draft → active → retired`); approval (`draft → active`) is the platform-staff governance act (DD-4).
- *Owned entity:* `categories` (AR; self-referencing 4-level tree, ≤4 levels — Doc-2 §10.3) · *Authority:* owner = Marketplace (entity + lifecycle states); **no active org context** (§5.6); Slug **`staff_can_manage_categories`** (Doc-2 §7); approval governance is Admin (**DD-4**).
- *Lifecycle:* Doc-2 §3.3 categories `draft → active → retired` (4-level CHECK + service). · *Authorization:* §5.6; Doc-2 §7. · *Audit:* yes → Doc-2 §9 Admin "category approve/delete". · *Events:* none (§8 designates none for categories). · *Integration:* category approval boundary is Admin-governed (DD-4); Marketplace owns the entity.
- *Sources:* ownership Doc-2 §3.3; authority §7/§5.6 (DD-4); lifecycle §3.3; audit §9; event §8 (none).

#### `marketplace.assign_category.v1` · `marketplace.update_category_assignment.v1` · `marketplace.remove_category_assignment.v1` — Category Assignment Lifecycle · 21.4 Command · Actor: User

- *Capability:* assign/maintain a vendor profile's categories (`proposed → active → removed`); service enforces ≤10 total, ≤5 primary; primary/secondary + `is_specialized` (Doc-2 §10.3).
- *Owned entity:* `category_assignments` (Vendor Profile child) · *Authority:* owner = controlling org; Slug **`can_manage_vendor_profile`** (Doc-2 §7); Scope = controlling org; representative via §6B.
- *Lifecycle:* Doc-2 §3.3 category_assignments `proposed → active → removed`. · *Authorization:* §6/§6B; Doc-2 §7. · *Audit:* yes → Doc-2 §9 Vendor-profile "category change". · *Events:* none (a category change triggers an internal `vendor_matching_attributes` rebuild — §D9). · *Integration:* references `categories` (Marketplace-owned) by id.
- *Sources:* ownership Doc-2 §3.3; authority §7/§6/§6B; lifecycle §3.3; audit §9; event §8 (none).

#### `marketplace.list_categories.v1` · `marketplace.get_category_assignments.v1` — Catalog Reads · 21.3 Query · Actor: public / User

- *Capability:* read the public taxonomy tree; read a profile's category assignments. · *Owned entity:* `categories`, `category_assignments` · *Authority:* public read (§7). · *Lifecycle:* read. · *Audit:* no. · *Events:* none. · *Sources:* ownership §3.3; authority §7.

---

## §D7 — Product & Specification (`products`, `product_spec_links`, `spec_library_entries`, `spec_documents`)

#### `marketplace.create_product.v1` · `marketplace.update_product.v1` · `marketplace.set_product_status.v1` — Product Lifecycle · 21.4 Command · Actor: User

- *Capability:* create/edit a vendor product and drive its lifecycle (`draft → published → unpublished`).
- *Owned entity:* `products` (AR) · *Authority:* owner = controlling org; Slug **`can_manage_products`** (Doc-2 §7); Scope = controlling org; representative via §6B.
- *Lifecycle:* Doc-2 §3.3 products `draft → published → unpublished`. · *Authorization:* §6/§6B; Doc-2 §7. · *Audit:* product publish/unpublish is **not separately enumerated** in Doc-2 §9 (the §9 Profile-experience domain covers theme/layout/section/branding/SEO/domain, not product-level publish) → **`[ESC-MKT-AUDIT]`** (interim: nearest §9 action by pointer; channel Doc-2 §9 additive; no action invented). · *Events:* none (§8 designates none for products). · *Integration:* none cross-module.
- *Sources:* ownership Doc-2 §3.3; authority §7/§6/§6B; lifecycle §3.3; audit §9 + `[ESC-MKT-AUDIT]`; event §8 (none).

#### `marketplace.link_product_spec.v1` · `marketplace.unlink_product_spec.v1` — Product↔Spec Linkage · 21.4 Command · Actor: User

- *Capability:* link/unlink a product to a specification library entry (`product_spec_links`, N:N). · *Owned entity:* `product_spec_links` · *Authority:* controlling org; Slug **`can_manage_products`**; Scope = controlling org. · *Lifecycle:* simple. · *Audit:* yes → Doc-2 §9 (documents/spec linkage) by pointer; where unenumerated → `[ESC-MKT-AUDIT]`. · *Events:* none. · *Sources:* ownership §3.3; authority §7/§6; lifecycle §3.3; audit §9.

#### `marketplace.create_spec_library_entry.v1` · `marketplace.update_spec_library_entry.v1` — Spec Library Entry Lifecycle · 21.4 Command · Actor: User

- *Capability:* create/edit a Product Specification Library entry (URS/datasheet/checklist/drawing/standard). · *Owned entity:* `spec_library_entries` (AR) · *Authority:* controlling org; Slug **`can_manage_products`** / **`can_upload_spec_documents`** (Doc-2 §7); Scope = controlling org. · *Lifecycle:* Doc-2 §3.3 simple. · *Audit:* yes → Doc-2 §9 "documents" (spec new revision family) by pointer. · *Events:* none. · *Sources:* ownership §3.3; authority §7/§6; lifecycle §3.3; audit §9.

#### `marketplace.add_spec_document.v1` · `marketplace.supersede_spec_document.v1` — Spec Document Lifecycle · 21.4 Command · Actor: User

- *Capability:* add a versioned specification document and supersede it with a new revision (`version_no`, `revision_label`, `revision_reason`, `supersedes_id`; **versioned, never overwritten** — Doc-2 §10.3).
- *Owned entity:* `spec_documents` (Spec Library child) · *Authority:* controlling org; Slug **`can_upload_spec_documents`** (Doc-2 §7); Scope = controlling org.
- *Lifecycle:* versioned (never overwritten); new revision supersedes prior. · *Authorization:* §6; Doc-2 §7. · *Audit:* yes → Doc-2 §9 "spec/document new revision (with reason)". · *Events:* none. · *Integration:* **boundary** — a buyer-uploaded `spec_documents` row attached to an RFQ becomes readable to invited vendors **only** through `rfq.rfq_document_grants` (**RFQ-owned, Doc-4E**); Marketplace authors no document-grant contract.
- *Sources:* ownership Doc-2 §3.3/§10.3; authority §7/§6; lifecycle §10.3; audit §9; event §8 (none).

#### `marketplace.get_product.v1` · `marketplace.list_products.v1` · `marketplace.get_spec_library_entry.v1` · `marketplace.get_spec_document.v1` — Product/Spec Reads · 21.3 Query · Actor: public / User

- *Capability:* public reads of products, spec entries, and (public) spec documents. · *Owned entity:* `products`, `spec_library_entries`, `spec_documents` · *Authority:* public read (§7); buyer-uploaded documents are gated by `rfq.rfq_document_grants` (RFQ-owned). · *Lifecycle:* read. · *Audit:* no. · *Events:* none. · *Sources:* ownership §3.3/§10.3; authority §7.

---

## §D6 — Profile Experience & Presentation (`microsites`, `profile_sections`, `branding_assets`, `seo_settings`, `showcase_projects`, `custom_domains`)

Profile-experience publishing is gated by **`can_publish_profile`** (Doc-2 §7); changes emit the Doc-2 §8 profile-experience events.

#### `marketplace.create_microsite.v1` · `marketplace.update_microsite.v1` — Microsite Lifecycle · 21.4 Command · Actor: User

- *Capability:* create/edit a branded company microsite (layout template A–E, theme; Doc-2 §10.3). · *Owned entity:* `microsites` (AR; UNIQUE per profile) · *Authority:* controlling org; Slug **`can_manage_vendor_profile`** / **`can_publish_profile`**; Scope = controlling org; representative via §6B. · *Lifecycle:* Doc-2 §3.3 microsites `draft → published → unpublished`. · *Audit:* yes → Doc-2 §9 Profile-experience (layout/theme) by pointer. · *Events:* none on edit (publish emits below). · *Sources:* ownership §3.3; authority §7/§6/§6B; lifecycle §3.3; audit §9; event §8.

#### `marketplace.publish_microsite.v1` · `marketplace.unpublish_microsite.v1` · `marketplace.set_microsite_domain.v1` — Microsite Publication · 21.4 Command · Actor: User

- *Capability:* publish/unpublish a microsite and bind/change its custom domain. · *Owned entity:* `microsites` (+ `custom_domains` binding) · *Authority:* controlling org; Slug **`can_publish_profile`**; Scope = controlling org. · *Lifecycle:* microsites `draft ↔ published → unpublished`. · *Audit:* yes → Doc-2 §9 Profile-experience publish/unpublish. · *Events:* `MicrositePublished`, `MicrositeDomainChanged` (§8). · *Integration:* custom-domain binding is **entitlement-gated — [DD-5]** (consume Billing entitlement). · *Sources:* ownership §3.3; authority §7/§6; lifecycle §3.3; audit §9; event §8.

#### `marketplace.update_profile_sections.v1` · `marketplace.update_branding_assets.v1` · `marketplace.update_seo_settings.v1` — Profile Experience Edits · 21.4 Command · Actor: User

- *Capability:* edit section builder config, branding assets (logo/banner/colors/video/brochure/gallery), and SEO settings (title/meta/OG/canonical/schema). · *Owned entity:* `profile_sections`, `branding_assets`, `seo_settings` (Vendor Profile children; draft tenant-owned, published shared) · *Authority:* controlling org; Slug **`can_publish_profile`** / **`can_manage_vendor_profile`**; Scope = controlling org. · *Lifecycle:* Doc-2 §3.3 `draft → published`. · *Audit:* yes → Doc-2 §9 Profile-experience "theme/layout/section/branding/SEO changes (old + new configuration)". · *Events:* `ProfileLayoutChanged` (sections), `ProfileThemeChanged` (branding) (§8); SEO change has no dedicated §8 event (no event emitted). · *Sources:* ownership §3.3; authority §7/§6; lifecycle §3.3; audit §9; event §8.

#### `marketplace.publish_profile.v1` · `marketplace.unpublish_profile.v1` — Profile Publish Lifecycle · 21.4 Command · Actor: User

- *Capability:* publish/unpublish the vendor profile experience (the "publish lifecycle" of the Vendor Profile presentation). · *Owned entity:* `vendor_profiles` profile-experience publish state (+ children publish_state) · *Authority:* controlling org; Slug **`can_publish_profile`**; Scope = controlling org. · *Lifecycle:* profile-experience publish state (Doc-2 §3.3 published/unpublished). · *Audit:* yes → Doc-2 §9 Profile-experience "publish/unpublish". · *Events:* `ProfilePublished`, `ProfileUnpublished` (§8). · *Sources:* ownership §3.3; authority §7/§6; lifecycle §3.3; audit §9; event §8.

#### `marketplace.create_custom_domain.v1` · `marketplace.confirm_custom_domain_verification.v1` · `marketplace.activate_custom_domain.v1` · `marketplace.release_custom_domain.v1` — Custom Domain Lifecycle · 21.4 Command / 21.5 System · Actor: User / System

- *Capability:* register and drive a custom domain (`pending → verified → active → released`); **entitlement-gated — [DD-5]**. The DNS/ownership-**verification mechanism** is infrastructure; the state transition is Marketplace-owned (`confirm_custom_domain_verification` = 21.5 System on infra signal).
- *Owned entity:* `custom_domains` (Vendor Profile child; `domain UNIQUE(partial)`) · *Authority:* controlling org (User legs) / System (verification-confirm leg); Slug **`can_publish_profile`** / **`can_manage_vendor_profile`** (User legs); Scope = controlling org; **entitlement check consumed from Billing — [DD-5]** (no billing contract authored).
- *Lifecycle:* Doc-2 §3.3 custom_domains `pending → verified → active → released`. · *Authorization:* §6 (User); §5.2 (System). · *Audit:* yes → Doc-2 §9 Profile-experience (domain changes) by pointer; where unenumerated → `[ESC-MKT-AUDIT]`. · *Events:* `MicrositeDomainChanged` where bound to a microsite (§8). · *Integration:* entitlement gating = Billing (DD-5); DNS verification = infrastructure (not a Doc-4D contract).
- *Sources:* ownership Doc-2 §3.3; authority §7/§6/§5.2; lifecycle §3.3; audit §9; event §8.

#### `marketplace.create_showcase_project.v1` · `marketplace.update_showcase_project.v1` · `marketplace.publish_showcase_project.v1` — Showcase Project Lifecycle · 21.4 Command · Actor: User

- *Capability:* create/edit/publish vendor portfolio projects (`draft → published`). · *Owned entity:* `showcase_projects` (AR) · *Authority:* controlling org; Slug **`can_manage_vendor_profile`**; Scope = controlling org. · *Lifecycle:* Doc-2 §3.3 `draft → published`. · *Audit:* yes → Doc-2 §9 Profile-experience by pointer; where unenumerated → `[ESC-MKT-AUDIT]`. · *Events:* none (§8 designates none). · *Sources:* ownership §3.3; authority §7/§6; lifecycle §3.3; audit §9; event §8 (none).

#### `marketplace.get_microsite.v1` · `marketplace.get_profile_experience.v1` · `marketplace.get_showcase_project.v1` · `marketplace.get_custom_domain.v1` — Profile-Experience Reads · 21.3 Query · Actor: public / User

- *Capability:* public reads of microsite/profile-experience/showcase/custom-domain (published surfaces). · *Authority:* public read of published; owning-org read of drafts (§7). · *Lifecycle:* read. · *Audit:* no. · *Events:* none. · *Sources:* ownership §3.3; authority §7.

---

## §D7 — Advertising (`advertisements`)

Advertisement **purchase** is a `billing.platform_invoice` — **[DD-5]** (Billing-owned); Marketplace owns the **creative/placement/review/publish lifecycle**. Advertisement-lifecycle audit actions are **not enumerated** in Doc-2 §9 → **`[ESC-MKT-AUDIT]`** throughout.

#### `marketplace.create_advertisement.v1` · `marketplace.submit_advertisement.v1` — Advertisement Create & Submit · 21.4 Command · Actor: User

- *Capability:* create an ad creative/placement (`draft`) and submit for review (`draft → pending_review`). Placement ∈ {landing, bottom, search, vendor_profile} (Doc-2 §10.3).
- *Owned entity:* `advertisements` (AR) · *Authority:* controlling/purchaser org; Slug **`can_manage_ads`** (Doc-2 §7); Scope = controlling org. · *Lifecycle:* Doc-2 §5.8 `draft → pending_review`. · *Authorization:* §6; Doc-2 §7. · *Audit:* **`[ESC-MKT-AUDIT]`** (ad lifecycle not enumerated in §9). · *Events:* none (§8 designates none for advertisements). · *Integration:* purchase/invoice = Billing (**[DD-5]**; `platform_invoice_id` is a bare UUID ref).
- *Sources:* ownership Doc-2 §3.3/§10.3; authority §7/§6; lifecycle §5.8; audit §9 + `[ESC-MKT-AUDIT]`; event §8 (none).

#### `marketplace.review_advertisement.v1` — Advertisement Approve / Reject · 21.6 Admin · Actor: Admin · *(platform governance)*

- *Capability:* platform-staff ad review (`pending_review → scheduled` approve / `pending_review → rejected`).
- *Owned entity:* `advertisements` · *Authority:* owner = Marketplace (review transition); **no active org context** (§5.6); Slug **`staff_super_admin`** (Doc-2 §7 — nearest existing platform-staff slug; §7 names no dedicated ad-review slug; a least-privilege ad-review slug is a future Doc-2 §7 additive per D-2 — **not invented**).
- *Lifecycle:* Doc-2 §5.8 `pending_review → scheduled` / `pending_review → rejected`. · *Authorization:* §5.6; Doc-2 §7. · *Audit:* **`[ESC-MKT-AUDIT]`**. · *Events:* none (§8). · *Integration:* none.
- *Sources:* ownership Doc-2 §3.3; authority §7/§5.6; lifecycle §5.8; audit §9 + `[ESC-MKT-AUDIT]`; event §8 (none).

#### `marketplace.set_advertisement_state.v1` — Advertisement Publish Lifecycle · 21.4 Command (User) / 21.5 System · Actor: User / System

- *Capability:* run the ad publish lifecycle — `active ⇄ paused` (User pause/resume), `scheduled → active` (System start date), `active → completed` (System end date / budget exhausted).
- *Owned entity:* `advertisements` · *Authority:* controlling org (`can_manage_ads`) for pause/resume; **System** for date/budget transitions (§5.2). · *Lifecycle:* Doc-2 §5.8 `active ⇄ paused`, `scheduled → active`, `active → completed`. · *Authorization:* §6 (User legs); §5.2 (System legs). · *Audit:* **`[ESC-MKT-AUDIT]`**. · *Events:* none (§8). · *Integration:* budget exhaustion references the Billing invoice (DD-5); the creative/placement lifecycle is Marketplace's.
- *Sources:* ownership Doc-2 §3.3; authority §7/§6/§5.2; lifecycle §5.8; audit §9 + `[ESC-MKT-AUDIT]`; event §8 (none).

#### `marketplace.get_advertisement.v1` · `marketplace.list_advertisements.v1` — Advertisement Reads · 21.3 Query · Actor: public / User

- *Capability:* read ads (public when active; owning-org otherwise). · *Authority:* public/owning-org read (§7). · *Lifecycle:* read. · *Audit:* no. · *Events:* none. · *Sources:* ownership §3.3; authority §7.

---

## §D6 — Catalog Favorites (`catalog_favorites`)

#### `marketplace.add_catalog_favorite.v1` · `marketplace.remove_catalog_favorite.v1` · `marketplace.list_catalog_favorites.v1` — Catalog Favorite Lifecycle · 21.4 Command / 21.3 Query · Actor: User

- *Capability:* add/remove/list an organization's public-catalog bookmarks (`target_type` ∈ {product, category}, `target_id` — polymorphic, **no FK**, service-validated; Doc-2 §10.3). **CRM vendor favorites are Operations (`operations.vendor_favorites`), not here.**
- *Owned entity:* `catalog_favorites` (tenant-owned) · *Authority:* owner = the organization; active **Membership** + org Scope (**§7 names no dedicated slug** — a low-stakes org bookmark gated by active membership; no slug invented); representative via §6B not applicable.
- *Lifecycle:* simple (add/remove). · *Authorization:* §6 (membership + scope). · *Audit:* not a Doc-2 §9 MUST-audit action (operational bookmark) → no audit (or `[ESC-MKT-AUDIT]` if a §9 action is later required). · *Events:* none (§8). · *Integration:* polymorphic `target_id` validated via service (no cross-schema FK, Doc-2 §0.3).
- *Sources:* ownership Doc-2 §3.3/§10.3; authority §6/§7; lifecycle §3.3; audit §9; event §8 (none).

---

## §D6 — Discovery, Visibility & Read-Model (`vendor_matching_attributes`, public reads)

Public discovery surfaces honor the **non-disclosure invariant** (no blacklist/private-CRM/Buyer-Vendor-Status exposure — §7.5) and **soft-delete/retire exclusion** (Doc-2 §0.2). The **matching/routing engine is RFQ's (Doc-4E) — [DD-2]**; Marketplace owns and exposes only the **derived read-model**.

#### `marketplace.search_catalog.v1` · `marketplace.list_vendor_directory.v1` · `marketplace.get_public_vendor_profile.v1` — Public Discovery Reads · 21.3 Query · Actor: public

- *Capability:* public search and directory over vendor profiles / products / categories; public vendor-profile read (presentation, capability flags, geography, categories, public `TrustIndicators`).
- *Owned entity:* `vendor_profiles`, `products`, `categories` (+ public profile-experience) · *Authority:* public read; **non-disclosure (§7.5)** and soft-delete exclusion enforced; `TrustIndicators` are a **read-model from Trust** (DD-1), not Marketplace-owned. · *Lifecycle:* read. · *Audit:* no (read). · *Events:* none. · *Integration:* expose (public).
- *Sources:* ownership Doc-2 §3.3; authority Doc-4A §7/§7.5; lifecycle §3.3.

#### `marketplace.get_vendor_matching_attributes.v1` — Expose Matching Read-Model · 21.3 Query (internal-service) · Actor: internal-service

- *Capability:* expose the **single derived read-model** the RFQ engine reads (denormalized capability flags, tier, geography, category sets, trust band, performance band, probation flag — Doc-2 §10.3) — **[DD-2]**.
- *Owned entity:* `vendor_matching_attributes` (derived; Marketplace-owned, rebuilt) · *Authority:* internal-service; consumed by RFQ (Doc-4E) by service; **Marketplace owns the attributes, RFQ owns the matching logic** (DD-2 — no matching/routing computed here). · *Lifecycle:* derived (read). · *Audit:* no (read). · *Events:* none. · *Integration:* **expose** read-model to RFQ; no matching logic authored (DD-2).
- *Sources:* ownership Doc-2 §3.3/§10.3; authority Doc-4A §7 / DD-2.

#### `marketplace.rebuild_vendor_matching_attributes.v1` — Rebuild Matching Read-Model *(internal / event consumer)* · 21.5 System · Actor: System

- *Capability:* rebuild the derived `vendor_matching_attributes` from authoritative sources — on internal Marketplace changes (capability/geography/category/capacity/declared-tier) and on consumed Trust events (`TrustScoreUpdated`, `PerformanceScoreUpdated`, `VendorTierChanged[verified]`). **Projection only — not matching logic ([DD-2]).**
- *Owned entity:* `vendor_matching_attributes` (derived; rebuilt, hard-refreshable) · *Authority:* System; platform scope; not user-invocable. · *Lifecycle:* derived (rebuild). · *Authorization:* System (§5.2). · *Audit:* no (derived rebuild; not a §9 business action). · *Events:* consumes Trust `TrustScoreUpdated`/`PerformanceScoreUpdated`/`VendorTierChanged[verified]` (§8); emits none. · *Integration:* **consume** (delivery contracts are Trust's per §4.4); **expose** the result via `get_vendor_matching_attributes` to RFQ. · *Firewall:* **projects** trust/performance/verified-tier signals (Trust-owned) + Marketplace-owned capability/geo/category/declared-tier into the read-model; it **does not compute matching/eligibility, does not mutate any signal**, and no paid plan influences it (§4B / DD-2).
- *Sources:* ownership Doc-2 §3.3/§10.3; authority §5.2 / DD-2; event §8 (Trust emitter); audit §9 (none — derived).

---

## §D8 — Integration Surface (Pass-A consolidation)

Per-contract integration bindings are stated in the records above; consolidated here (single-authorship, Doc-4A §4.4; **no Template 21.2 instantiated** — emitting modules author delivery contracts):

- **Identity (Doc-4C, FROZEN) — consume:** org/membership resolution, `check_permission`, and **§6B delegation grants** for representative action on a vendor profile (used by every controlling-org write).
- **Trust (Doc-4G) — consume:** `VendorVerified` (→ `reflect_verified_claim_status`, DD-1), `VendorTierChanged[verified]` (→ `sync_verified_financial_tier`, exclusive history writer), `TrustScoreUpdated`/`PerformanceScoreUpdated` (→ `rebuild_vendor_matching_attributes`); **submit** verification subjects (vendor profile / capacity / declared tier) — verification **decision** is Trust's (DD-1). `TrustIndicators` read-model surfaced in public profile reads.
- **Communication (Doc-4H) — emit only:** Marketplace state changes emit outbox events; **Communication owns notification fan-out and authors all notification contracts (§4.4). Marketplace authors no notification/Communication contract** — the outbox event is the only crossing product (single-authorship).
- **Billing (Doc-4I) — consume:** entitlement checks for advertisements and custom domains; advertisement purchase is a `billing.platform_invoice` — **[DD-5]** (no billing contract authored).
- **RFQ (Doc-4E) — expose:** `vendor_matching_attributes` read-model by service — **[DD-2]** (matching/routing logic is RFQ's; not authored here).
- **Operations (Doc-4F) — expose:** public vendor profile referenced by private-vendor linking (Operations owns the link, `private_vendor_records`).
- **Admin (Doc-4J) — consume/reflect:** `VendorBanned` (→ `reflect_vendor_ban`, DD-3); category approval governance (DD-4). Ban/category-approval **decisions** are Admin's.
- **Platform Core (Doc-4B, FROZEN) — consume:** audit-write (`core.append_audit_record.v1`), outbox-write (`core.write_outbox_event.v1`), UUIDv7 + human-reference (`core.allocate_human_reference.v1`), POLICY resolution (`core.config_value_query.v1`), feature-flag evaluation.

#### `marketplace.reflect_vendor_ban.v1` — Reflect Vendor Ban *(event consumer)* · 21.5 System · Actor: System

- *Capability:* on Admin's `VendorBanned`, set the vendor-profile status to `banned` — Marketplace **reflects** the Admin ban decision (**[DD-3]**; does not decide/author the ban).
- *Owned entity:* `vendor_profiles` (status dimension) · *Authority:* System; platform scope. · *Lifecycle:* Doc-2 §5.3 status `active → banned` (reflected). · *Audit:* yes → Doc-2 §9 Vendor-profile "ban/lift" by pointer; attribution system. · *Events:* consumes Admin `VendorBanned` (§8); emits none. · *Integration:* **consume** (delivery contract is Admin's per §4.4 — DD-3); `ban_actions` is Admin-owned.
- *Sources:* ownership Doc-2 §3.3; authority §5.2 / DD-3; lifecycle §5.3; audit §9; event §8 (Admin emitter).

---

## §D9 — Event & Dependency Map (Pass-A consolidation)

- **Emitted (Doc-2 §8, via Doc-4B outbox-write; no event coined):** `VendorClaimed` (create/claim), `VendorSuspended` (suspend), `VendorTierChanged[declared]` (declared tier), `VendorOwnershipTransferred` (ownership transfer), `ProfileThemeChanged` (branding), `ProfileLayoutChanged` (sections), `ProfilePublished`/`ProfileUnpublished` (profile publish), `MicrositePublished`/`MicrositeDomainChanged` (microsite).
- **Consumed (Doc-2 §8, emitted by other modules; delivery authored by emitter per §4.4):** `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated` (Trust); `VendorBanned` (Admin).
- **Carried markers (verbatim):** DD-1…DD-7, `[ESC-MKT-AUDIT]` — none resolved. *Source:* Doc-2 §8; Doc-4A §16; Doc-4B outbox-write.

---

## §D10 — Authorization Surface (Pass-A consolidation)

- **Tenant slugs (Doc-2 §7; controlling-org scope):** `can_manage_vendor_profile`, `can_publish_profile`, `can_manage_products`, `can_manage_ads`, `can_upload_spec_documents`. **Membership-only (no dedicated slug):** catalog favorites.
- **Platform-staff slugs (Doc-2 §7; no active org context, §5.6):** `staff_can_manage_categories` (category lifecycle — DD-4); `staff_can_ban` (vendor suspend — nearest moderation slug); `staff_super_admin` (advertisement review — nearest; no dedicated ad-review slug). Least-privilege staff slugs for vendor-suspend / ad-review are **future Doc-2 §7 additives (D-2)** — none invented.
- **Resolution:** three-layer (Membership + Slug + Scope) OR **§6B delegation grant** for representative action on a non-controlled vendor profile — resolved via Identity `check_permission` (Doc-4C, consumed); **no shadow authorization** (Doc-4A §6/§6B/§4.1). *Source:* Doc-2 §7; Doc-4A §6/§6B; Doc-4C §C3/§C8.

---

## §D11 — Audit Surface (Pass-A consolidation)

- **Bound (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`):** Vendor-profile domain (create, seed, claim, verify, suspend, ban/lift, tier change [declared + verified], category change, capability/override change, ownership transfer) and Profile-experience domain (theme/layout/section/branding/SEO/domain changes, publish/unpublish); spec/document new revision (documents domain).
- **`[ESC-MKT-AUDIT]` (carried; Doc-2 §9 additive channel; no action invented):** advertisement lifecycle (submit/review/approve/reject/publish), product publish/unpublish, showcase/custom-domain transitions where unenumerated. Reads not audited (§17.1). *Source:* Doc-2 §9; Doc-4A §17; Doc-4B audit-write.

---

## §D12 — AI-Agent Implementation Considerations (Pass-A consolidation)

Every contract record states its **ownership / authority / lifecycle / audit / event source** by pointer. Cross-cutting constraints for Claude Code / Cursor / backend / QA: consume frozen Doc-4B/Doc-4C services (never re-derive auth/membership/delegation/audit/IDs); honor the Doc-2 §5.3/§5.8 machines verbatim (no edge invented); **declared tier ≠ verified tier** (DD-1); **matching attributes are a read-model, not the engine** (DD-2 — never author matching/routing); ban/category-approval **reflect** Admin decisions (DD-3/DD-4); ad/custom-domain gated by **Billing** entitlement (DD-5); `vendor_claim_records` tenancy is **unsettled** (DD-7 — do not finalize mutation ownership); `marketplace.catalog_favorites` = public bookmarks only (CRM favorites are Operations); never expose a protected fact (§7.5); never coin an entity/event/slug/audit-action/POLICY-key/template (escalate via DD / `[ESC-MKT-AUDIT]`). *Source:* Doc-4A §0.6/§4.1/§7.5; Doc-4B/Doc-4C (consumed); frozen Doc-4D structure §D12.

---

## Appendix A — Module 2 Contract Inventory (Pass-A)

Working contract names grouped by area; each carries a full record above. Markers: DD-1…DD-7, `[ESC-MKT-AUDIT]` (A), `[ESC-MKT-SLUG-note]` = nearest-slug binding (no slug invented). Templates per Doc-4A §21. *(Read contracts are 21.3 Query; reads omitted from the marker column.)*

| Area | Contracts (`marketplace.<op>.v1`) | Templates | Actors | Markers |
|---|---|---|---|---|
| Vendor Profile | create_vendor_profile, claim_vendor_profile, update_vendor_profile, transfer_vendor_ownership, set_vendor_profile_status, get_vendor_profile | 21.4 / 21.6 / 21.3 | User / Admin / public | DD-7 (claim), DD-1 (transfer), DD-1/DD-3 (status) |
| Vendor Capacity | upsert_vendor_capacity_profile, get_vendor_capacity_profile | 21.4 / 21.3 | User / public | DD-1 (verified fields) |
| Declared Tier | set_declared_financial_tier, get_declared_financial_tier, get_financial_tier_history, sync_verified_financial_tier, reflect_verified_claim_status | 21.4 / 21.3 / 21.5 | User / System | DD-1 (verified sync, claim reflect) |
| Category & Taxonomy | create_category, update_category, set_category_status, assign_category, update_category_assignment, remove_category_assignment, list_categories, get_category_assignments | 21.6 / 21.4 / 21.3 | Admin / User / public | DD-4 (lifecycle) |
| Product & Spec | create_product, update_product, set_product_status, link_product_spec, unlink_product_spec, create_spec_library_entry, update_spec_library_entry, add_spec_document, supersede_spec_document, get_product, list_products, get_spec_library_entry, get_spec_document | 21.4 / 21.3 | User / public | A (product publish) |
| Profile Experience | create_microsite, update_microsite, publish_microsite, unpublish_microsite, set_microsite_domain, update_profile_sections, update_branding_assets, update_seo_settings, publish_profile, unpublish_profile, get_microsite, get_profile_experience | 21.4 / 21.3 | User / public | DD-5 (domain) |
| Custom Domains | create_custom_domain, confirm_custom_domain_verification, activate_custom_domain, release_custom_domain, get_custom_domain | 21.4 / 21.5 / 21.3 | User / System / public | DD-5, A |
| Showcase | create_showcase_project, update_showcase_project, publish_showcase_project, get_showcase_project | 21.4 / 21.3 | User / public | A |
| Advertising | create_advertisement, submit_advertisement, review_advertisement, set_advertisement_state, get_advertisement, list_advertisements | 21.4 / 21.6 / 21.5 / 21.3 | User / Admin / System / public | DD-5, A, `[ESC-MKT-SLUG-note]` (review) |
| Catalog Favorites | add_catalog_favorite, remove_catalog_favorite, list_catalog_favorites | 21.4 / 21.3 | User | membership-only |
| Discovery & Read-Model | search_catalog, list_vendor_directory, get_public_vendor_profile, get_vendor_matching_attributes, rebuild_vendor_matching_attributes | 21.3 / 21.5 | public / internal-service / System | DD-2 |
| Event consumers | reflect_vendor_ban (+ sync_verified_financial_tier, reflect_verified_claim_status, rebuild_vendor_matching_attributes above) | 21.5 System | System | DD-1, DD-3 |

**Coverage:** all required-coverage areas and all owned `marketplace.*` aggregates are covered; no contract authored over a non-Marketplace entity; no RFQ/procurement/matching contract authored.

---

## Appendix B — Conformance Binding Map (Pass-A)

| Doc-4D § | Doc-4A standards (governing) | Doc-4B / Doc-4C consumed | Doc-2/Doc-3 bindings |
|---|---|---|---|
| §B / §D0–§D3 | §0.3, §1.3, §4.1, §21, App B | — | Doc-2 §0.3, §2, §3.3 |
| §D4–§D5 (profile/capacity/tier) | §5.3, §6/§6B, §13, §17, §4B | Doc-4B audit/outbox/ID; Doc-4C `check_permission`/delegation | Doc-2 §3.3/§5.3/§7/§8/§9/§10.3 |
| §D7 (catalog/product/spec) | §6, §13, §17 | Doc-4B audit/outbox | Doc-2 §3.3/§7/§8/§9; DD-4 |
| §D6 (profile experience/domains/showcase) | §6, §13, §17, §18 | Doc-4B audit/outbox/POLICY/flags; Billing (DD-5) | Doc-2 §3.3/§7/§8/§9 |
| §D7 (advertising) | §5.6, §6, §13, §17 | Doc-4B audit/outbox; Billing (DD-5) | Doc-2 §5.8/§7/§8/§9; `[ESC-MKT-AUDIT]` |
| §D6 (discovery/read-model) | §7/§7.5, §22.3 | Doc-4B (consume); RFQ expose (DD-2) | Doc-2 §3.3/§10.3 |
| §D8–§D11 (integration/event/authz/audit) | §4/§4.4, §16, §6/§6B, §17, §4B | Doc-4B/Doc-4C consumed | Doc-2 §7/§8/§9 |

**Affirmation:** Doc-4D consumes the Doc-4A standards and the frozen Doc-4B/Doc-4C contracts **by pointer only**; it coins no template, slug, event, audit action, or POLICY key, and re-implements no Doc-4B/Doc-4C mechanism (single owner per capability).

---

## Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers (UNCHANGED)

Carried **verbatim** from `Doc-4D_Structure_v1.0_FROZEN.md` §D0/Appendix C. Pass-A **does not resolve, redesign around, or invent workarounds** for any of these.

- **DD-1** — Vendor verification ownership = Trust (Doc-4G); Marketplace submits/consumes (`VendorVerified`, `VendorTierChanged[verified]`). Channel: Trust contract boundary.
- **DD-2** — Matching/routing **logic** = RFQ (Doc-4E); Marketplace owns/exposes the `vendor_matching_attributes` read-model. Channel: read-model by service; no matching authored.
- **DD-3** — Vendor ban = Admin (Doc-4J; `ban_actions`, `VendorBanned`); Marketplace reflects `banned`. Channel: Admin-owned decision.
- **DD-4** — Category approval = Admin staff (`staff_can_manage_categories`); category entity Marketplace-owned. Channel: category-lifecycle approval boundary.
- **DD-5** — Ad/custom-domain entitlement = Billing (Doc-4I; ad purchase = `platform_invoice`). Channel: entitlement consumed from Billing.
- **DD-6** — `marketplace.*` POLICY keys absent in Doc-3 §12.2. Channel: Doc-3 §12.2 additive registration; intended keys referenced by name, never invented.
- **DD-7** — `vendor_claim_records` tenancy (Doc-2 §6 platform-owned vs §3.3/§10.3 Marketplace child). Channel: Doc-2 §6/§3.3 reconciliation; mutation ownership not finalized.
- **`[ESC-MKT-AUDIT]`** — Marketplace audit-action gaps (advertisement lifecycle, product publish/unpublish, showcase/custom-domain transitions) not enumerated in Doc-2 §9. Channel: Doc-2 §9 additive; interim nearest §9 action by pointer; no action invented.

---

## Appendix D — Cross-Reference Index (Pass-A)

| Binding point | Authoritative source |
|---|---|
| Owned entities, tenancy, lifecycle, schema | Doc-2 §2, §3.3, §6, §10.3 |
| Vendor Profile / Advertisement state machines | Doc-2 §5.3 / §5.8 |
| Permission slugs (`can_manage_vendor_profile`, `can_publish_profile`, `can_manage_products`, `can_manage_ads`, `can_upload_spec_documents`; `staff_can_manage_categories`, `staff_can_ban`, `staff_super_admin`) | Doc-2 §7 |
| Event ownership (Marketplace emitter + consumed) | Doc-2 §8 |
| Audit domains (Vendor profile; Profile experience; Documents; Admin category) | Doc-2 §9 |
| Marketplace schema (capability flags, claim_state, status, UNIQUE controlling_organization_id, financial_tier_history exclusive writer) | Doc-2 §10.3 |
| Vendor claim & ownership workflow (operational) | Doc-3 §2.9–§2.11 |
| Templates / authorization / context / events / audit / firewall | Doc-4A §21 / §6/§6B / §5/§5.6 / §16 / §17 / §4B |
| Identity contracts consumed (`check_permission`, delegation grants) | Doc-4C §C3/§C8/§C9 (FROZEN) |
| Platform Core services consumed | Doc-4B (`core.append_audit_record.v1`, `core.write_outbox_event.v1`, `core.allocate_human_reference.v1`, `core.config_value_query.v1`, feature flags) (FROZEN) |
| Vendor identity/ownership/representation | ADR-005; Architecture §5–§7 |
| Carried dependencies & escalation markers | `Doc-4D_Structure_v1.0_FROZEN.md` §D0 / Appendix C |

---

*End of Doc-4D Content v1.0 — Pass-A (Module 2 — Marketplace & Discovery). Contract-authoring structure for all frozen-structure capabilities: ~70 contracts across the Marketplace aggregates, mapped to Doc-4A templates and bound by pointer to Doc-2 / Doc-3 / Doc-4A / Doc-4B / Doc-4C. DD-1…DD-7 and `[ESC-MKT-AUDIT]` carried unchanged; no entity, event, permission slug, audit action, POLICY key, or template invented; no RFQ / procurement / matching-routing logic authored (Doc-4E). No payloads (Pass-B); no self-review; no findings. Ready for Independent Hard Review.*
