# Doc-4D — Pass-B — Part C: Profile Experience, Custom Domains & Showcase (§D7.3)

| Field | Value |
|---|---|
| Part | C of E — hardened contract blocks for Pass-A §D7.3 |
| Master | `Doc-4D_Content_v1.0_PassB.md` (§B conventions govern; defaults cited as §B.x) |
| Status | DRAFT — ready for Independent Hard Review |
| Conforms To | Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D_Structure_v1.0_FROZEN (FROZEN); Pass-A (closed) |
| Scope | Microsites, profile sections/branding/SEO, profile publish, custom domains (DD-5 entitlement), showcase. Profile-experience events per Doc-2 §8. |

Lifecycles bind to **Doc-2 §3.3** (microsites/sections `draft→published→unpublished`; custom_domains `pending→verified→active→released`; showcase `draft→published`). Publishing gated by `can_publish_profile` (Doc-2 §7). Defaults per master **§B**.

---

#### `marketplace.create_microsite.v1` · `marketplace.update_microsite.v1` — Microsite Create/Edit · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile` / `can_publish_profile` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B).
- **Request Contract:** (create) `vendor_profile_id : uuid : required`, `layout_template : enum(A|B|C|D|E) : required`, `theme : object : optional`; (update) `microsite_id : uuid : required`, fields optional, `updated_at : timestamp : required`.
- **Response Contract (§B.3):** `{ microsite_id : uuid, status : enum(=draft) [create] | updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (enum/types) → CONTEXT (active org) → AUTHZ (slug) → SCOPE (caller controls profile) → DELEGATION (§6B) → REFERENCE (`vendor_profile_id` exists) → BUSINESS (UNIQUE microsite per profile, Doc-2 §10.3).
- **Error Register (§B.5):** `marketplace_microsite_invalid_input` (VALIDATION, no), `marketplace_microsite_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (REFERENCE, no), `marketplace_microsite_not_found` (NOT_FOUND, no), `marketplace_microsite_conflict` (CONFLICT, no — exists / stale token).
- **State Effects (§13):** `→ draft` (create); none (update). **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Profile-experience (layout/theme) by pointer (§9); attribution standard.
- **Events:** none on edit (publish/domain emit below). **Reference Validation (§B.10):** profile existence + controlling-org/grantee authority.
- **AI-Agent Notes:** one microsite per profile; reuses profile-experience children; representative via §6B.

#### `marketplace.publish_microsite.v1` · `marketplace.unpublish_microsite.v1` — Microsite Publication · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_publish_profile` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B). **Request:** `microsite_id : uuid : required`; `updated_at : timestamp : required`. **Response (§B.3):** `{ microsite_id, status, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX → CONTEXT → AUTHZ (`can_publish_profile`) → SCOPE → DELEGATION (§6B) → STATE (Doc-2 §3.3 `draft ↔ published → unpublished`) → BUSINESS (publishable).
- **Error Register (§B.5):** `marketplace_microsite_forbidden` (AUTHORIZATION, no), `marketplace_microsite_not_found` (NOT_FOUND, no), `marketplace_microsite_state_invalid` (STATE, no), `marketplace_microsite_update_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §3.3 `draft ↔ published → unpublished`. **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Profile-experience "publish/unpublish" (§9); attribution standard; Correlation both.
- **Events:** `MicrositePublished` (§8) on publish. **AI-Agent Notes:** publish gated by `can_publish_profile`; emits `MicrositePublished` (Communication fans out — Marketplace authors no notification).

#### `marketplace.set_microsite_domain.v1` — Microsite Domain Binding · 21.4 Command · Actor: User · *(DD-5)*

- **Authorization (§B.9):** Membership active; `can_publish_profile`; Scope = controlling org; Delegation eligible (§6B). **DD-5:** custom-domain binding is **entitlement-gated** (consume Billing entitlement).
- **Request Contract:** `microsite_id : uuid : required`; `custom_domain_id : uuid : required` (an `active` domain).
- **Response Contract (§B.3):** `{ microsite_id, custom_domain_id } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (uuids) → CONTEXT → AUTHZ (`can_publish_profile`) → SCOPE → DELEGATION (§6B) → REFERENCE (`custom_domain_id` exists, `active`, same controlling org) → BUSINESS (**entitlement check consumed from Billing — DD-5**).
- **Error Register (§B.5):** `marketplace_microsite_forbidden` (AUTHORIZATION, no), `marketplace_domain_not_found` (REFERENCE, no), `marketplace_domain_state_invalid` (STATE, no — domain not active), `marketplace_microsite_entitlement_denied` (BUSINESS, no — DD-5 entitlement).
- **State Effects:** binding update. **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** yes; Profile-experience (domain change) by pointer; where unenumerated → `[ESC-MKT-AUDIT]`. **Events:** `MicrositeDomainChanged` (§8).
- **Reference Validation (§B.10):** domain existence/`active`/ownership; **entitlement from Billing (DD-5; no billing contract authored)**.
- **AI-Agent Notes:** entitlement gate is Billing's (DD-5) — consume, never author; bind only an `active` same-org domain.

#### `marketplace.update_profile_sections.v1` · `marketplace.update_branding_assets.v1` · `marketplace.update_seo_settings.v1` — Profile Experience Edits · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_publish_profile` / `can_manage_vendor_profile` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B).
- **Request Contract:** `vendor_profile_id : uuid : required`; (sections) `sections : list<object{section_type, display_order, is_visible, content_json}>`; (branding) `branding : object{logo, banner, colors, video, brochure, gallery refs}`; (seo) `seo : object{title, meta, keywords, og_image, canonical, schema_jsonb}`; `updated_at : timestamp : required`.
- **Response Contract (§B.3):** `{ vendor_profile_id, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (shapes) → CONTEXT → AUTHZ (slug) → SCOPE (caller controls profile) → DELEGATION (§6B) → BUSINESS (Doc-2 §3.3 `draft → published` config; old+new captured for audit).
- **Error Register (§B.5):** `marketplace_profile_invalid_input` (VALIDATION, no), `marketplace_profile_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (NOT_FOUND, no), `marketplace_profile_update_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §3.3 `draft → published` (config). **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Profile-experience "theme/layout/section/branding/SEO changes (old + new configuration)" (§9); attribution standard.
- **Events:** `ProfileLayoutChanged` (sections), `ProfileThemeChanged` (branding) (§8); **SEO change has no §8 event** (emit none). **Reference Validation (§B.10):** profile existence + controlling-org/grantee authority.
- **AI-Agent Notes:** capture old+new config for audit; only sections/branding emit §8 events (SEO does not — do not coin one); representative via §6B.

#### `marketplace.publish_profile.v1` · `marketplace.unpublish_profile.v1` — Profile Publish Lifecycle · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_publish_profile` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B). **Request:** `vendor_profile_id : uuid : required`; `updated_at : timestamp : required`. **Response (§B.3):** `{ vendor_profile_id, publish_state, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX → CONTEXT → AUTHZ (`can_publish_profile`) → SCOPE → DELEGATION (§6B) → STATE (Doc-2 §3.3 profile-experience published/unpublished) → BUSINESS (publishable).
- **Error Register (§B.5):** `marketplace_profile_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (NOT_FOUND, no), `marketplace_profile_state_invalid` (STATE, no), `marketplace_profile_update_conflict` (CONFLICT, no).
- **State Effects (§13):** profile-experience publish state. **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Profile-experience "publish/unpublish" (§9); attribution standard; Correlation both.
- **Events:** `ProfilePublished` / `ProfileUnpublished` (§8). **AI-Agent Notes:** the "publish lifecycle" of the Vendor Profile presentation; emits §8 events (Communication fans out — no notification contract here).

#### `marketplace.create_custom_domain.v1` · `marketplace.confirm_custom_domain_verification.v1` · `marketplace.activate_custom_domain.v1` · `marketplace.release_custom_domain.v1` — Custom Domain Lifecycle · 21.4 Command / 21.5 System · Actor: User / System · *(DD-5)*

- **Authorization (§B.9):** controlling org (User legs) — Slug `can_publish_profile` / `can_manage_vendor_profile`; System (verification-confirm leg, §5.2); Scope = controlling org; Delegation eligible (§6B, User legs). **DD-5:** entitlement-gated (consume Billing).
- **Request Contract:** (create) `vendor_profile_id : uuid : required`, `domain : string : required` (unique); (confirm) [Phase-2] inputs = the infra DNS/ownership-verification signal for a `pending` domain; (activate/release) `custom_domain_id : uuid : required`, `updated_at : timestamp : required`.
- **Response Contract (§B.3):** User legs `{ custom_domain_id : uuid, status : enum, updated_at } + reference_id`; **confirm leg `Response: none`** (21.5).
- **Validation Matrix (§B.4):** SYNTAX (domain format/uuid) → CONTEXT (active org / System §5.2) → AUTHZ (slug / System) → SCOPE (caller controls profile) → DELEGATION (§6B, User) → STATE (Doc-2 §3.3 `pending → verified → active → released`) → REFERENCE (`vendor_profile_id`) → BUSINESS (**entitlement check from Billing — DD-5**; `domain UNIQUE(partial)`).
- **Error Register (§B.5):** `marketplace_domain_invalid_input` (VALIDATION, no), `marketplace_domain_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (REFERENCE, no), `marketplace_domain_state_invalid` (STATE, no), `marketplace_domain_entitlement_denied` (BUSINESS, no — DD-5), `marketplace_domain_conflict` (CONFLICT, no — duplicate domain / stale token).
- **State Effects (§13):** Doc-2 §3.3 `pending → verified → active → released`. **Idempotency (§B.7):** required (User legs); platform-scope (confirm System leg — dedup on domain state); dedup [DD-6].
- **Audit (§B.8):** yes; Profile-experience (domain change) by pointer; where unenumerated → `[ESC-MKT-AUDIT]`; attribution standard (User) / system (confirm).
- **Events:** `MicrositeDomainChanged` (§8) where bound to a microsite. **Integration:** **entitlement gating = Billing (DD-5)**; **DNS/ownership verification = infrastructure** (the confirm leg reacts to the infra signal; not a Doc-4D business contract). **Reference Validation (§B.10):** profile existence; entitlement (Billing); domain uniqueness.
- **AI-Agent Notes:** the DNS-verification mechanism is infra (the confirm leg is a System reflection of it); entitlement is Billing's (DD-5 — consume, never author); the state machine is Marketplace's.

#### `marketplace.create_showcase_project.v1` · `marketplace.update_showcase_project.v1` · `marketplace.publish_showcase_project.v1` — Showcase Project Lifecycle · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B). **Request:** (create) `vendor_profile_id : uuid : required`, project fields; (update/publish) `showcase_project_id : uuid : required`, `updated_at : timestamp : required`. **Response (§B.3):** `{ showcase_project_id : uuid, status, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX → CONTEXT → AUTHZ (`can_manage_vendor_profile`) → SCOPE → DELEGATION (§6B) → STATE (Doc-2 §3.3 `draft → published`) → REFERENCE (`vendor_profile_id`).
- **Error Register (§B.5):** `marketplace_showcase_invalid_input` (VALIDATION, no), `marketplace_showcase_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (REFERENCE, no), `marketplace_showcase_not_found` (NOT_FOUND, no), `marketplace_showcase_state_invalid` (STATE, no), `marketplace_showcase_update_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §3.3 `draft → published`. **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Profile-experience by pointer; where unenumerated → `[ESC-MKT-AUDIT]`; attribution standard.
- **Events:** none (§8 designates none for showcase). **AI-Agent Notes:** controlling-org-owned portfolio; showcase publish has no §8 event — do not coin one; carry `[ESC-MKT-AUDIT]` if a §9 action is required.

#### `marketplace.get_microsite.v1` · `marketplace.get_profile_experience.v1` · `marketplace.get_showcase_project.v1` · `marketplace.get_custom_domain.v1` — Profile-Experience Reads · 21.3 Query · Actor: public / User

- **Authorization (§B.9):** public read of published surfaces; owning-org read of drafts (§7). **Request:** id or `vendor_profile_id` filter + pagination. **Response (§B.3):** `{ entity|items, page_info? } + reference_id`.
- **Validation Matrix (§B.4, query):** SYNTAX → CONTEXT → AUTHZ(public/owning) → SCOPE. **Error:** `marketplace_microsite_not_found` / `marketplace_profile_not_found` / `marketplace_showcase_not_found` / `marketplace_domain_not_found` (NOT_FOUND, no), `*_invalid_input` (VALIDATION, no).
- **Query semantics (§B.6):** filter `vendor_profile_id`, `status=published`; sort `display_order`/`created_at` (tiebreaker id); cursor pagination; **exclude unpublished/draft from public** (§0.2). **Idempotency:** n/a. **Audit:** no. **Events:** none.
- **AI-Agent Notes:** public reads expose published experience only; drafts are owning-org-scoped.

---

*End of Doc-4D Pass-B — Part C (Profile Experience, Custom Domains & Showcase, §D7.3). Hardened per the master §B. DD-5 (Billing entitlement for domains), `[ESC-MKT-AUDIT]` (profile-experience/domain/showcase where §9-unenumerated) carried; profile-experience events bound to Doc-2 §8 (SEO/showcase emit none — not coined); no entity/event/slug/audit-action/POLICY-key/template invented. Ready for Independent Hard Review.*
