# Doc-4D — Pass-B — Part D: Advertising (§D7.4); Catalog Favorites (§D7.5)

| Field | Value |
|---|---|
| Part | D of E — hardened contract blocks for Pass-A §D7.4–§D7.5 |
| Master | `Doc-4D_Content_v1.0_PassB.md` (§B conventions govern; defaults cited as §B.x) |
| Status | DRAFT — ready for Independent Hard Review |
| Conforms To | Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D_Structure_v1.0_FROZEN (FROZEN); Pass-A (closed) |
| Scope | Advertisement creative/placement/review/publish lifecycle (DD-5 — Billing purchase; ESC-MKT-AUDIT throughout); catalog favorites (membership-only). |

Advertisement transitions bind to **Doc-2 §5.8** (`draft→pending_review→scheduled→active`; `pending_review→rejected`; `active⇄paused`; `active→completed`). **Purchase = `billing.platform_invoice` (DD-5)**; ad-lifecycle audit actions are **§9-unenumerated → `[ESC-MKT-AUDIT]`**. Defaults per master **§B**.

---

## §D7.4 — Advertising (`advertisements`)

#### `marketplace.create_advertisement.v1` — Create Advertisement · 21.4 Command · Actor: User · *(DD-5)*

- **Authorization (§B.9):** Membership active; Slug `can_manage_ads` (Doc-2 §7); Scope = purchaser/controlling org; Delegation eligible (§6B where representing a vendor profile).
- **Firewall:** §B.11 — none (ads are visibility/placement, never gate trust/eligibility/routing/matching, §18.3).
- **Request Contract:** `vendor_profile_id : uuid : optional` (the advertised profile); `placement : enum(landing|bottom|search|vendor_profile) : required`; `creative_ref : string : required`; `schedule : object{start, end} : optional`; `platform_invoice_id : uuid : optional` (Billing purchase ref — **DD-5**, bare UUID).
- **Response Contract (§B.3):** `{ advertisement_id : uuid, status : enum(=draft) } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (enum/refs) → CONTEXT (active org) → AUTHZ (`can_manage_ads`) → SCOPE (caller's org) → DELEGATION (§6B if `vendor_profile_id` is a non-controlled profile) → REFERENCE (`vendor_profile_id` exists; `platform_invoice_id` → Billing, DD-5) → BUSINESS (placement valid).
- **Error Register (§B.5):** `marketplace_ad_invalid_input` (VALIDATION, no), `marketplace_ad_forbidden` (AUTHORIZATION, no), `marketplace_vendor_not_found` (REFERENCE, no), `marketplace_ad_invoice_invalid` (REFERENCE, no — Billing ref).
- **State Effects (§13):** Doc-2 §5.8 `→ draft`. **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** **`[ESC-MKT-AUDIT]`** (ad lifecycle not enumerated in §9); attribution standard.
- **Events:** none (§8 designates none for advertisements). **Reference Validation (§B.10):** profile existence; **`platform_invoice_id` via Billing (DD-5; no billing contract authored)**.
- **AI-Agent Notes:** purchase/invoice is Billing's (DD-5 — consume); carry `[ESC-MKT-AUDIT]`; ads never affect trust/eligibility/routing/matching (§18.3).

#### `marketplace.submit_advertisement.v1` — Submit Advertisement for Review · 21.4 Command · Actor: User · *(ESC-MKT-AUDIT)*

- **Authorization (§B.9):** Membership active; `can_manage_ads`; Scope = purchaser org; Delegation eligible (§6B). **Request:** `advertisement_id : uuid : required`; `updated_at : timestamp : required`. **Response (§B.3):** `{ advertisement_id, status : enum(=pending_review), updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX → CONTEXT → AUTHZ (`can_manage_ads`) → SCOPE → DELEGATION (§6B) → STATE (Doc-2 §5.8 `draft → pending_review`) → BUSINESS (creative complete; entitlement/invoice present per DD-5).
- **Error Register (§B.5):** `marketplace_ad_forbidden` (AUTHORIZATION, no), `marketplace_ad_not_found` (NOT_FOUND, no), `marketplace_ad_state_invalid` (STATE, no), `marketplace_ad_update_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §5.8 `draft → pending_review`. **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** **`[ESC-MKT-AUDIT]`**. **Events:** none. **AI-Agent Notes:** submission gates on Billing entitlement (DD-5); carry `[ESC-MKT-AUDIT]`.

#### `marketplace.review_advertisement.v1` — Approve / Reject Advertisement · 21.6 Admin · Actor: Admin · *(platform governance; ESC-MKT-AUDIT)*

- **Authorization (§B.9):** Membership n/a; **no active org context** (§5.6); Slug `staff_super_admin` (Doc-2 §7 — nearest existing platform-staff slug; §7 names no dedicated ad-review slug; least-privilege ad-review slug is a future Doc-2 §7 additive, D-2 — **not invented**); Delegation not eligible.
- **Request Contract:** `advertisement_id : uuid : required`; `decision : enum(approve|reject) : required`; `reason : string : required` (on reject); `updated_at : timestamp : required`.
- **Response Contract (§B.3):** `{ advertisement_id, status : enum(scheduled|rejected), updated_at } + reference_id`.
- **Validation Matrix (§B.4):** SYNTAX (enum/reason) → CONTEXT (Admin; §5.6) → AUTHZ (`staff_super_admin`) → SCOPE (ad resolvable under Admin-Scope) → STATE (Doc-2 §5.8 `pending_review → scheduled` | `pending_review → rejected`) → BUSINESS (reason on reject).
- **Error Register (§B.5):** `marketplace_ad_forbidden` (AUTHORIZATION, no), `marketplace_ad_not_found` (NOT_FOUND, no), `marketplace_ad_state_invalid` (STATE, no), `marketplace_ad_update_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §5.8 `pending_review → scheduled` / `pending_review → rejected`. **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** **`[ESC-MKT-AUDIT]`**; attribution standard (Admin). **Events:** none.
- **AI-Agent Notes:** platform-staff only (nearest slug, no invention); carry `[ESC-MKT-AUDIT]`.

#### `marketplace.set_advertisement_state.v1` — Advertisement Publish Lifecycle · 21.4 Command (User) / 21.5 System · Actor: User / System · *(ESC-MKT-AUDIT)*

- **Authorization (§B.9):** controlling/purchaser org (`can_manage_ads`) for pause/resume; **System** for date/budget transitions (§5.2); Scope = purchaser org (User legs).
- **Request Contract:** (User) `advertisement_id : uuid : required`, `action : enum(pause|resume) : required`, `updated_at : timestamp : required`; (System) [Phase-2] start-date / end-date / budget-exhaustion signal.
- **Response Contract (§B.3):** User `{ advertisement_id, status, updated_at } + reference_id`; **System legs `Response: none`** (21.5).
- **Validation Matrix (§B.4):** SYNTAX (enum) → CONTEXT (active org / System §5.2) → AUTHZ (`can_manage_ads` / System) → SCOPE → STATE (Doc-2 §5.8 `active ⇄ paused`; `scheduled → active`; `active → completed`) → BUSINESS (budget/schedule).
- **Error Register (§B.5):** `marketplace_ad_forbidden` (AUTHORIZATION, no), `marketplace_ad_not_found` (NOT_FOUND, no), `marketplace_ad_state_invalid` (STATE, no), `marketplace_ad_update_conflict` (CONFLICT, no).
- **State Effects (§13):** Doc-2 §5.8 `active ⇄ paused`, `scheduled → active`, `active → completed`. **Idempotency (§B.7):** required (User); platform-scope (System — dedup on ad state). **Audit (§B.8):** **`[ESC-MKT-AUDIT]`**; attribution standard (User) / system (System legs).
- **Events:** none. **Integration:** budget exhaustion references the Billing invoice (DD-5); creative/placement lifecycle is Marketplace's. **AI-Agent Notes:** System drives date/budget transitions; pause/resume is the purchaser's; carry `[ESC-MKT-AUDIT]`.

#### `marketplace.get_advertisement.v1` · `marketplace.list_advertisements.v1` — Advertisement Reads · 21.3 Query · Actor: public / User

- **Authorization (§B.9):** public read when `active`; owning-org read otherwise (§7). **Request:** id or `vendor_profile_id`/`placement` filter + pagination. **Response (§B.3):** `{ entity|items, page_info? } + reference_id`.
- **Validation Matrix (§B.4, query):** SYNTAX → CONTEXT → AUTHZ(public/owning) → SCOPE. **Error:** `marketplace_ad_not_found` (NOT_FOUND, no), `marketplace_ad_invalid_input` (VALIDATION, no).
- **Query semantics (§B.6):** filter `placement`, `status=active` (public), `vendor_profile_id`; sort `created_at` (tiebreaker id); cursor pagination; **public read = active ads only** (§0.2). **Idempotency:** n/a. **Audit:** no. **Events:** none.
- **AI-Agent Notes:** public reads expose active ads only; owning-org sees all states.

---

## §D7.5 — Catalog Favorites (`catalog_favorites`)

#### `marketplace.add_catalog_favorite.v1` · `marketplace.remove_catalog_favorite.v1` — Catalog Favorite Add/Remove · 21.4 Command · Actor: User · *(membership-only)*

- **Authorization (§B.9):** active **Membership** + org Scope; **Slug: none** — Doc-2 §7 names no dedicated slug (low-stakes org bookmark gated by active membership; **no slug invented**); Delegation not eligible. **CRM vendor favorites are Operations (`operations.vendor_favorites`), not here.**
- **Request Contract:** `target_type : enum(product|category) : required`; `target_id : uuid : required` (polymorphic, **no FK**, service-validated, Doc-2 §10.3).
- **Response Contract (§B.3):** `{ catalog_favorite_id : uuid, target_type, target_id } + reference_id` (add) / `{ removed : boolean } + reference_id` (remove).
- **Validation Matrix (§B.4):** SYNTAX (enum/uuid) → CONTEXT (active org membership) → AUTHZ (n/a — membership-only) → SCOPE (org-scoped) → REFERENCE (`target_id` exists for `target_type` — service-validated) → BUSINESS (no duplicate favorite).
- **Error Register (§B.5):** `marketplace_favorite_invalid_input` (VALIDATION, no), `marketplace_favorite_target_not_found` (REFERENCE, no), `marketplace_favorite_conflict` (CONFLICT, no — duplicate).
- **State Effects:** simple (add/remove; tenant-owned). **Idempotency (§B.7):** required; dedup [DD-6].
- **Audit (§B.8):** **no** — an operational bookmark, not a Doc-2 §9 MUST-audit action (or `[ESC-MKT-AUDIT]` if a §9 action is later required).
- **Events:** none (§8). **Reference Validation (§B.10):** polymorphic `target_id` validated via service for the declared `target_type` (no cross-schema FK, Doc-2 §0.3).
- **AI-Agent Notes:** membership-only (no slug — do not invent); polymorphic target validated by service; **not** CRM favorites (those are Operations).

#### `marketplace.list_catalog_favorites.v1` — List Catalog Favorites · 21.3 Query · Actor: User

- **Authorization (§B.9):** active Membership + org Scope (org-scoped read). **Request:** `target_type : enum : optional` filter; pagination. **Response (§B.3):** `{ items : list<favorite>, page_info } + reference_id`. **Validation (query):** SYNTAX → CONTEXT (active org) → AUTHZ (membership-only) → SCOPE (org-scoped). **Error:** `marketplace_favorite_invalid_input` (VALIDATION, no). **Query semantics (§B.6):** filter `target_type`; sort `created_at` (tiebreaker id); cursor pagination; **org-scoped visibility only** (§7). **Idempotency:** n/a. **Audit:** no. **Events:** none. **AI-Agent Notes:** lists only the caller's org's bookmarks; never cross-tenant.

---

*End of Doc-4D Pass-B — Part D (Advertising §D7.4; Catalog Favorites §D7.5). Hardened per the master §B. DD-5 (Billing purchase/entitlement) and `[ESC-MKT-AUDIT]` (ad lifecycle) carried; catalog favorites membership-only (no slug invented); no entity/event/slug/audit-action/POLICY-key/template invented. Ready for Independent Hard Review.*
