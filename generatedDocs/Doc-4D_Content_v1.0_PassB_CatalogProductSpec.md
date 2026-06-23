# Doc-4D — Pass-B — Part B: Catalog & Taxonomy (§D7.1); Product & Specification (§D7.2)

| Field | Value |
|---|---|
| Part | B of E — hardened contract blocks for Pass-A §D7.1–§D7.2 |
| Master | `Doc-4D_Content_v1.0_PassB.md` (§B conventions govern; defaults cited as §B.x) |
| Status | DRAFT — ready for Independent Hard Review |
| Conforms To | Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D_Structure_v1.0_FROZEN (FROZEN); Pass-A (closed) |
| Scope | Category lifecycle (DD-4 — Admin approval) + assignment; product lifecycle + spec linkage; spec library + documents. ESC-MKT-AUDIT where §9 unenumerated. |

Lifecycles bind to **Doc-2 §3.3** (categories `draft→active→retired`; assignments `proposed→active→removed`; products `draft→published→unpublished`; spec docs versioned). Defaults per master **§B**.

---

## §D7.1 — Catalog & Taxonomy (`categories`, `category_assignments`)

#### `marketplace.create_category.v1` — Create Category · 21.6 Admin · Actor: Admin · *(DD-4)*

- **Authorization (§B.9):** Membership n/a; **no active org context** (§5.6); Slug `staff_can_manage_categories` (Doc-2 §7); Delegation not eligible. **DD-4:** category approval governance is Admin's; entity Marketplace-owned.
- **Request Contract:** `name : string : required`; `parent_id : uuid : optional` (self-FK; ≤4 levels); `slug : string : required` (unique); `level : integer : required` (1–4 CHECK).
- **Response Contract (§B.3):** `{ category_id : uuid, level, status : enum(=draft) } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (name/slug/level; level 1–4) → CONTEXT (Admin; §5.6) → AUTHZ (`staff_can_manage_categories`) → SCOPE (catalog) → REFERENCE (`parent_id` exists if given) → BUSINESS (≤4-level tree CHECK + service; slug unique).
- **Error Register (§B.5):** `marketplace_category_invalid_input` (VALIDATION, no), `marketplace_category_forbidden` (AUTHORIZATION, no), `marketplace_category_not_found` (REFERENCE, no — parent), `marketplace_category_depth_exceeded` (BUSINESS, no), `marketplace_category_slug_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §3.3 `→ draft`. **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Admin "category approve/delete" (§9) by pointer; attribution standard (Admin); Correlation both.
- **Events:** none (§8 designates none for categories). **Reference Validation (§B.10):** `parent_id` existence + level integrity.
- **AI-Agent Notes:** platform-staff only; category approval is Admin-governed (DD-4); enforce ≤4 levels; do not couple category create to vendor assignment.

#### `marketplace.update_category.v1` — Update Category · 21.6 Admin · Actor: Admin · *(DD-4)*

- **Authorization (§B.9):** Admin; §5.6; `staff_can_manage_categories`. **Request:** `category_id : uuid : required`; `name : string : optional`; `slug : string : optional`; `updated_at : timestamp : required`. **Response (§B.3):** `{ category_id, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX → CONTEXT (Admin §5.6) → AUTHZ (`staff_can_manage_categories`) → SCOPE → REFERENCE (`category_id` exists) → BUSINESS (slug unique).
- **Error Register (§B.5):** `marketplace_category_invalid_input` (VALIDATION, no), `marketplace_category_forbidden` (AUTHORIZATION, no), `marketplace_category_not_found` (NOT_FOUND, no), `marketplace_category_slug_conflict` (CONFLICT, no), `marketplace_category_update_conflict` (CONFLICT, no — stale token).
- **State Effects:** none (attribute edit). **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** yes; Admin "category approve/delete". **Events:** none. **AI-Agent Notes:** DD-4 Admin authority; no reparenting beyond ≤4-level CHECK.

#### `marketplace.set_category_status.v1` — Category Status (Approve / Retire) · 21.6 Admin · Actor: Admin · *(DD-4)*

- **Authorization (§B.9):** Admin; §5.6; `staff_can_manage_categories`. **Request:** `category_id : uuid : required`; `target_status : enum(active|retired) : required`; `updated_at : timestamp : required`. **Response (§B.3):** `{ category_id, status, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (enum) → CONTEXT (Admin §5.6) → AUTHZ (`staff_can_manage_categories`) → SCOPE → STATE (Doc-2 §3.3 `draft → active → retired`) → BUSINESS (approval governance, DD-4).
- **Error Register (§B.5):** `marketplace_category_forbidden` (AUTHORIZATION, no), `marketplace_category_not_found` (NOT_FOUND, no), `marketplace_category_state_invalid` (STATE, no), `marketplace_category_update_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §3.3 `draft → active → retired`. **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** yes; Admin "category approve/delete". **Events:** none. **AI-Agent Notes:** approval (`draft→active`) is the DD-4 platform-staff governance act; retired is terminal-for-discovery (excluded from search).

#### `marketplace.assign_category.v1` — Assign Category to Vendor · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_vendor_profile` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B).
- **Request Contract:** `vendor_profile_id : uuid : required`; `category_id : uuid : required`; `level : enum(primary|secondary) : required`; `is_specialized : boolean : optional`.
- **Response Contract (§B.3):** `{ category_assignment_id : uuid, status : enum(=proposed|active) } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (uuids; enum) → CONTEXT (active org) → AUTHZ (`can_manage_vendor_profile`) → SCOPE (caller controls profile) → DELEGATION (§6B) → REFERENCE (`vendor_profile_id` + `category_id` exist; category `active`) → BUSINESS (≤10 total, ≤5 primary — service rule, Doc-2 §10.3).
- **Error Register (§B.5):** `marketplace_category_invalid_input` (VALIDATION, no), `marketplace_category_forbidden` (AUTHORIZATION, no), `marketplace_category_not_found` (REFERENCE, no), `marketplace_category_limit_exceeded` (BUSINESS, no — >10/>5), `marketplace_category_assignment_conflict` (CONFLICT, no — duplicate).
- **State Effects (§13):** Doc-2 §3.3 `proposed → active`. **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Vendor-profile "category change" (§9); attribution standard.
- **Events:** none (category change → internal matching rebuild, Part E). **Reference Validation (§B.10):** profile (controlling org) + category (`active`) existence.
- **AI-Agent Notes:** enforce ≤10/≤5 caps in service; references an `active` category (Marketplace-owned); trigger attribute rebuild via Part E, not an event.

#### `marketplace.update_category_assignment.v1` · `marketplace.remove_category_assignment.v1` — Assignment Maintenance · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; `can_manage_vendor_profile`; Scope = controlling org; Delegation eligible (§6B). **Request:** `category_assignment_id : uuid : required`; (update) `level/is_specialized : optional`; `updated_at : timestamp : required`. **Response (§B.3):** `{ category_assignment_id, status } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX → CONTEXT → AUTHZ (`can_manage_vendor_profile`) → SCOPE (caller controls the profile) → DELEGATION (§6B) → STATE (Doc-2 §3.3 `active → removed` for remove) → BUSINESS (≤10/≤5 on update).
- **Error Register (§B.5):** `marketplace_category_invalid_input` (VALIDATION, no), `marketplace_category_forbidden` (AUTHORIZATION, no), `marketplace_category_not_found` (NOT_FOUND, no), `marketplace_category_limit_exceeded` (BUSINESS, no), `marketplace_category_update_conflict` (CONFLICT, no).
- **State Effects (§13):** `active → removed` (remove). **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** yes; Vendor-profile "category change". **Events:** none (→ matching rebuild). **AI-Agent Notes:** removal is the §3.3 `removed` state (soft); re-enforce caps on update.

#### `marketplace.list_categories.v1` · `marketplace.get_category_assignments.v1` — Catalog Reads · 21.3 Query · Actor: public / User

- **Authorization (§B.9):** public read of the taxonomy; assignments readable per tenancy (§7). **Request:** (list) `parent_id/level : optional` filters, pagination; (assignments) `vendor_profile_id : uuid : required`. **Response (§B.3):** `{ items : list, page_info } + reference_id`.
- **Validation Matrix (§B.4, query):** SYNTAX → CONTEXT → AUTHZ(public) → SCOPE. **Error:** `marketplace_category_invalid_input` (VALIDATION, no), `marketplace_category_not_found` (NOT_FOUND, no — assignments target).
- **Query semantics (§B.6):** filter `parent_id/level/status(active)`; sort `level,slug` (tiebreaker id); cursor pagination; **exclude `retired`** from public reads (§0.2). **Idempotency:** n/a. **Audit:** no. **Events:** none.
- **AI-Agent Notes:** public taxonomy excludes retired; assignments respect tenancy.

---

## §D7.2 — Product & Specification (`products`, `product_spec_links`, `spec_library_entries`, `spec_documents`)

#### `marketplace.create_product.v1` · `marketplace.update_product.v1` — Product Create/Edit · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_products` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B).
- **Request Contract:** (create) `vendor_profile_id : uuid : required`, `name : string : required`, `description : string : optional`, `images : list<ref> : optional`; (update) `product_id : uuid : required`, fields optional, `updated_at : timestamp : required`.
- **Response Contract (§B.3):** `{ product_id : uuid, status : enum(=draft) [create] | updated_at [update] } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX → CONTEXT (active org) → AUTHZ (`can_manage_products`) → SCOPE (caller controls profile) → DELEGATION (§6B) → REFERENCE (`vendor_profile_id` exists) → BUSINESS (product belongs to the profile).
- **Error Register (§B.5):** `marketplace_product_invalid_input` (VALIDATION, no), `marketplace_product_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (REFERENCE, no), `marketplace_product_not_found` (NOT_FOUND, no — update), `marketplace_product_update_conflict` (CONFLICT, no).
- **State Effects (§13):** `→ draft` (create); none (update). **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Vendor-profile domain (product create/edit) by pointer — where unenumerated → **`[ESC-MKT-AUDIT]`**; attribution standard.
- **Events:** none (§8 designates none for products). **Reference Validation (§B.10):** profile existence + controlling-org/grantee authority.
- **AI-Agent Notes:** products are controlling-org-owned; product audit actions are §9-unenumerated → carry `[ESC-MKT-AUDIT]` (no action invented).

#### `marketplace.set_product_status.v1` — Product Publish Lifecycle · 21.4 Command · Actor: User · *(ESC-MKT-AUDIT)*

- **Authorization (§B.9):** Membership active; `can_manage_products`; Scope = controlling org; Delegation eligible (§6B). **Request:** `product_id : uuid : required`; `target_status : enum(published|unpublished) : required`; `updated_at : timestamp : required`. **Response (§B.3):** `{ product_id, status, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (enum) → CONTEXT → AUTHZ (`can_manage_products`) → SCOPE → DELEGATION (§6B) → STATE (Doc-2 §3.3 `draft → published → unpublished`).
- **Error Register (§B.5):** `marketplace_product_forbidden` (AUTHORIZATION, no), `marketplace_product_not_found` (NOT_FOUND, no), `marketplace_product_state_invalid` (STATE, no), `marketplace_product_update_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §3.3 `draft → published → unpublished`. **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** **`[ESC-MKT-AUDIT]`** — product publish/unpublish is **not enumerated** in Doc-2 §9 (interim nearest §9 action by pointer; channel Doc-2 §9 additive; no action invented).
- **Events:** none. **AI-Agent Notes:** carry `[ESC-MKT-AUDIT]` for publish/unpublish; published products surface in public catalog (excluded when unpublished/soft-deleted).

#### `marketplace.link_product_spec.v1` · `marketplace.unlink_product_spec.v1` — Product↔Spec Linkage · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; `can_manage_products`; Scope = controlling org; Delegation eligible (§6B). **Request:** `product_id : uuid : required`; `spec_entry_id : uuid : required`. **Response (§B.3):** `{ product_id, spec_entry_id, linked : boolean } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (uuids) → CONTEXT → AUTHZ (`can_manage_products`) → SCOPE → DELEGATION (§6B) → REFERENCE (`product_id` + `spec_entry_id` exist, same controlling org) → BUSINESS (N:N PK uniqueness).
- **Error Register (§B.5):** `marketplace_product_invalid_input` (VALIDATION, no), `marketplace_product_forbidden` (AUTHORIZATION, no), `marketplace_spec_not_found` (REFERENCE, no), `marketplace_product_link_conflict` (CONFLICT, no — duplicate link).
- **State Effects:** simple (link/unlink). **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** yes; Documents domain (spec linkage) by pointer; where unenumerated → `[ESC-MKT-AUDIT]`. **Events:** none. **Reference Validation (§B.10):** both refs exist + same controlling org. **AI-Agent Notes:** link only same-org product/spec; N:N.

#### `marketplace.create_spec_library_entry.v1` · `marketplace.update_spec_library_entry.v1` — Spec Library Entry · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_manage_products` / `can_upload_spec_documents` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B). **Request:** (create) `vendor_profile_id : uuid : required`, `name : string : required`, `summary : string : optional`, `category_id : uuid : optional`; (update) `spec_entry_id : uuid : required`, `updated_at : timestamp : required`. **Response (§B.3):** `{ spec_entry_id : uuid, updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX → CONTEXT → AUTHZ (`can_manage_products`/`can_upload_spec_documents`) → SCOPE → DELEGATION (§6B) → REFERENCE (`vendor_profile_id`; optional `category_id` exists) → BUSINESS (simple).
- **Error Register (§B.5):** `marketplace_spec_invalid_input` (VALIDATION, no), `marketplace_spec_forbidden` (AUTHORIZATION, no), `marketplace_spec_not_found` (NOT_FOUND, no), `marketplace_spec_update_conflict` (CONFLICT, no).
- **State Effects:** simple. **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** yes; Documents domain (spec new revision family) by pointer. **Events:** none. **AI-Agent Notes:** spec entries are controlling-org-owned.

#### `marketplace.add_spec_document.v1` · `marketplace.supersede_spec_document.v1` — Spec Document Lifecycle · 21.4 Command · Actor: User

- **Authorization (§B.9):** Membership active; Slug `can_upload_spec_documents` (Doc-2 §7); Scope = controlling org; Delegation eligible (§6B).
- **Request Contract:** `spec_entry_id : uuid : required`; `doc_type : enum(urs|datasheet|checklist|drawing|standard) : required`; `storage_ref : string : required`; (supersede) `supersedes_id : uuid : required`, `revision_label : string : required`, `revision_reason : string : required`.
- **Response Contract (§B.3):** `{ spec_document_id : uuid, version_no : integer, is_active_revision : boolean } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (enum; refs) → CONTEXT → AUTHZ (`can_upload_spec_documents`) → SCOPE → DELEGATION (§6B) → STATE (versioned — never overwritten; new revision supersedes prior, Doc-2 §10.3) → REFERENCE (`spec_entry_id`; `supersedes_id` exists) → BUSINESS (monotonic `version_no`).
- **Error Register (§B.5):** `marketplace_spec_invalid_input` (VALIDATION, no), `marketplace_spec_forbidden` (AUTHORIZATION, no), `marketplace_spec_not_found` (REFERENCE, no), `marketplace_spec_revision_conflict` (CONFLICT, no).
- **State Effects (§13):** versioned append; prior revision retained (never overwritten). **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** yes; Documents "spec/document new revision (with reason)" (§9); attribution standard.
- **Events:** none. **Reference Validation (§B.10):** entry + supersedes existence.
- **AI-Agent Notes:** documents are versioned, **never overwritten**; **boundary** — a buyer-uploaded `spec_documents` row attached to an RFQ is readable to invited vendors **only** via `rfq.rfq_document_grants` (RFQ-owned, Doc-4E); Marketplace authors no document-grant.

#### `marketplace.get_product.v1` · `marketplace.list_products.v1` · `marketplace.get_spec_library_entry.v1` · `marketplace.get_spec_document.v1` — Product/Spec Reads · 21.3 Query · Actor: public / User

- **Authorization (§B.9):** public read of published products/spec entries/public documents; buyer-uploaded documents gated by `rfq.rfq_document_grants` (RFQ-owned). **Request:** id or `vendor_profile_id` filter + pagination. **Response (§B.3):** `{ items|entity, page_info? } + reference_id`.
- **Validation Matrix (§B.4, query):** SYNTAX → CONTEXT → AUTHZ(public/entitled) → SCOPE. **Error:** `marketplace_product_not_found` / `marketplace_spec_not_found` (NOT_FOUND, no), `*_invalid_input` (VALIDATION, no).
- **Query semantics (§B.6):** filter `vendor_profile_id`, `status=published`; sort `created_at` (tiebreaker id); cursor pagination; **exclude unpublished/soft-deleted** (§0.2). **Idempotency:** n/a. **Audit:** no. **Events:** none.
- **AI-Agent Notes:** public reads exclude unpublished/soft-deleted; buyer-uploaded spec documents are RFQ-gated (do not expose outside `rfq_document_grants`).

---

*End of Doc-4D Pass-B — Part B (Catalog & Taxonomy §D7.1; Product & Specification §D7.2). Hardened per the master §B. DD-4 (Admin category approval) and `[ESC-MKT-AUDIT]` (product publish/unpublish; product/spec audit where §9-unenumerated) carried; no entity/event/slug/audit-action/POLICY-key/template invented. Ready for Independent Hard Review.*
