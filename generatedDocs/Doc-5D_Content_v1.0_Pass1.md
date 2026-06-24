# Doc-5D — Marketplace & Discovery (M2 `marketplace`) API Realization — Content v1.0, Pass 1 (§0–§3)

| Field | Value |
|---|---|
| Document | Doc-5D — Marketplace & Discovery (Module 2) — API Realization |
| Pass | 1 of 3 — §0, §1, §2 (the 64-endpoint caller-facing inventory) and §3 (cross-cutting wire model) |
| Status | ACTIVE — Content Pass 1 of 3; §0–§3. Conforms to `Doc-5D_Structure_v1.0_FROZEN.md` |
| Module | Module 2 — Marketplace & Discovery (`marketplace` schema) — first large public/anonymous read surface |
| Realizes | `Doc-4D` (M2 contracts, FROZEN — 71 contracts: 64 caller-facing + 7 out-of-wire) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4M v1.0, Doc-5A v1.0 (all FROZEN) |
| Contains | Document control + scope/surface-partition + the **64-endpoint** caller-facing inventory + the §3 cross-cutting tri-actor/visibility/non-disclosure **wire model** (mechanism only). No §5.7 template instantiation (Pass-2/3), no out-of-wire realization detail (§9, Pass-3), no schemas, no Doc-4D contract body restated |
| Audience | Architecture / API Governance Boards · Doc-5D content authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4D fixed *what* each M2 contract declares (FROZEN); Doc-5A fixed *how* a contract becomes HTTP. Pass-1 fixes Doc-5D's precedence/scope, the **caller-facing endpoint inventory** (method, path, actor, active-org, success) for the **64** caller-facing M2 endpoints, and the **§3 cross-cutting wire model** §4–§8 depend on. It instantiates no full endpoint template (§4–§8), realizes no out-of-wire mechanism (§9), and coins no endpoint/status/header/error-class/slug/POLICY key/event. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §0/§1/§5/§6.3/§7/§10` · `Doc-4D §D0/§D4–§D8`, Appendix C · `Doc-4C §C3` (consumed) · Appendix B.1 (`marketplace`).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence
- Doc-5D sits one realization level below Doc-5A (`Doc-5A §0.1`):
  ```
  Master → ADR → Doc-2 · Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-5A → Doc-5D → Code
  ```
- Doc-5D **MUST NOT** override, reinterpret, or weaken any higher document; on conflict the higher prevails and Doc-5D is patched (flag-and-halt, `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Binds:** `Doc-5A §0.1`.

### 0.2 Scope of Authority
- Doc-5D governs **how the FROZEN Doc-4D contracts of Module 2 are realized as concrete HTTP APIs** — the wire layer only (Public + User + Admin caller surfaces).
- It does **not** govern: *what* a contract declares (Doc-4D/Doc-4A); the state machines (Doc-4M); **matching/routing/ranking logic** (RFQ/Doc-4E — DD-2); **verification** (Trust/Doc-4G — DD-1); **ban decisions** (Admin/Doc-4J — DD-3); **entitlement/billing** (Doc-4I — DD-5); persistence (Doc-6); framework/transport; or the M2 in-process/System mechanisms with no wire (§9).
- **Binds:** `Doc-5A §0.2`; `Doc-4D §D0`.

### 0.3 Conformance Obligation
- Before freeze, Doc-5D **MUST** pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) in full. It coins **no** endpoint, status, header, error class, slug, POLICY key, or event (`CHK-5A-121/154`; `Doc-4A §6.4/§16.4`).
- **DD-6 content-freeze gate:** the `marketplace.*` POLICY keys referenced by the realization MUST be registered in Doc-3 §12.2 (additive registration patch — precedent `core.*` v1.0 / `rfq.*` v1.1; `Doc-4A §18.2`) before the content Freeze Audit (`CHK-5A-121`).
- **Binds:** `Doc-5A §0.5`, Appendix A; `Doc-4A §18.2`.

### 0.4 Realize-Never-Redecide
- Each realized point binds its Doc-4D / Doc-5A / corpus owner by pointer; no copy, paraphrase-with-change, or re-decide. Transport-level silence → a `[realization convention]` contradicting nothing upstream. Missing authority ⇒ flag-and-halt (`Doc-5A §0.3`).
- **Binds:** `Doc-5A §0.3`.

---

## §1 — Scope, Audience & M2 Surface Partition

### 1.1 What Doc-5D Governs
- Doc-5D is the **HTTP realization of Module 2's caller-facing contracts** — vendor profile/capacity/declared-tier, catalog/product/spec, profile-experience/presentation, advertising/favorites, and the public discovery surface. No other module's surface.
- Actors (R2): **Public** (anonymous — no `Authorization`, no org context); **User** (server-validated active-org context); **Admin** (governance subset, no org context); **System** (out-of-wire, §9).
- **Binds:** `Doc-5A §1`, §7; Doc-4D §D4–§D8.

### 1.2 M2 Surface Partition
The 71 Doc-4D contracts partition by wire-realizability (structure R1) — **64 caller-facing**, **7 out-of-wire** (System event consumers + System read-model rebuild + infra domain-verify + internal-service matching read + DD-8 blocked ban-lift):

| Doc-4D contracts | Doc-5D treatment |
|---|---|
| BC-MKT-1 vendor profile/capacity/declared-tier commands + reads + `set_vendor_profile_status` (Admin) · BC-MKT-2/3 catalog/product/spec · BC-MKT-4 profile-experience/presentation · BC-MKT-5/7 advertising + favorites · BC-MKT-6 public discovery reads | **Caller-facing HTTP** — realized here (inventory §2; full template §4–§8) |
| BC-MKT-1 `sync_verified_financial_tier`, `reflect_verified_claim_status` · BC-MKT-4 `confirm_custom_domain_verification` · BC-MKT-6 `get_vendor_matching_attributes` (internal-service), `rebuild_vendor_matching_attributes`, `reflect_vendor_ban`, `reflect_vendor_ban_lift` (DD-8) | **Out-of-wire** — no HTTP surface (§9); code / Doc-6 |

- **Section ownership (structure § column) is authoritative; §2 inventory grouping is informational.** Partition independently verified: §4(11)+§5(21)+§6(20)+§7(9)+§8(3)=64 caller-facing; §9=7; total 71.
- **Binds:** `Doc-5D_Structure_v1.0_FROZEN` (partition); Doc-4D PassB; `Doc-5A §1.3`.

### 1.3 Dependency Boundary
- **M2 owns realization only for M2 surfaces.** Cross-module realization belongs to the owning module's Doc-5x (Identity → Doc-5C; RFQ → Doc-5E; Trust → Doc-5G; Billing → Doc-5I; Admin → Doc-5J). Doc-5D references other modules **by ID / public contract only**; consumes Identity `check_permission` and Billing entitlement **in-process** (out-of-wire, §9), never as an M2 HTTP endpoint.
- **Binds:** `Doc-5A §1`; structure §1.x.

### 1.4 Audience & Carried Items
- **Audience:** Architecture / API Governance Boards; Doc-5D authors (human + AI); AI Coding Supervisor; backend, QA.
- **Carried (Doc-4D Appendix C — by pointer; resolved only via named channels):** **DD-1** Trust verification · **DD-2** RFQ matching logic (M2 owns read-model only) · **DD-3** Admin ban decision · **DD-4** Admin category governance · **DD-5** Billing entitlement · **DD-6** `marketplace.*` POLICY keys (**content-freeze gate** — additive Doc-3 §12.2 patch) · **DD-7** `vendor_claim_records` tenancy (**cross-frozen-doc, Board-gated**; blocks `claim_vendor_profile` content finalization only) · **DD-8** ban-lift non-implementable (no `VendorBanLifted` event) · `[ESC-MKT-AUDIT]` (nearest Doc-2 §9 action).
- **Binds:** Doc-4D §D0, Appendix C; Doc-2 §7/§8/§9; Doc-3 §12.2.

---

## §2 — Realized Endpoint Inventory

### 2.1 Namespace, Path Grammar & Method Mapping
- All M2 caller-facing endpoints live under the reserved **`marketplace`** route prefix (Appendix B.1; `Doc-2 §0.3`) and follow the §5.3 grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`. Resource segments are the owning entity tables (`vendor_profiles`, `categories`, `category_assignments`, `products`, `spec_library_entries`, `spec_documents`, `microsites`, `profile_experiences`, `custom_domains`, `showcase_projects`, `advertisements`, `catalog_favorites`, plus the public read resources), plural **[realization convention]**.
- **Method mapping (`Doc-5A §5.2`, strict — `CHK-5A-031` [B]):** create → `POST` collection (`201` + `Location`); partial non-state update → `PATCH` item; state-transition / domain command → `POST` named sub-resource; ADR-012 soft-delete → `DELETE` item; read → `GET`. No `PUT`. Command tokens are the **exact `marketplace.<operation>` operation names verbatim from the Doc-4D PassB per-Contract-ID blocks** (`marketplace.<operation>.v1`).
- **Async (§10):** **no caller endpoint returns `202`.** Each caller command commits synchronously (`200`/`201`); the System event consumers / read-model rebuild / infra domain-verify are downstream (§9), observed via reads. Domain events emit to the M0 outbox (R10), never a wire field.
- **Nested / singleton / search addressing [realization convention §0.4]:** Doc-5A §5.3 is **silent** on nested child resources (capacity profile, profile-experience sub-sections, spec documents), org-singletons, and search-as-read; the conventions shown below contradict nothing upstream and are **finalized in the §4–§8 content passes**.
- **Per-read projection (§3 binding rule):** every read names its projection class (Public / Controlling-Org / Internal-Service) in its §5.7 block (content pass).
- **Binds:** `Doc-5A §5.2/§5.3/§10`, Appendix B.1; Doc-2 §0.3; Doc-4D PassB.

### 2.2 Inventory — §4 Vendor Profile, Capacity & Financial-Tier (BC-MKT-1, 11)

| # | Doc-4D Contract-ID | Actor | Method · Path | Active-Org | Success |
|---|---|---|---|---|---|
| 1 | `marketplace.create_vendor_profile.v1` | User | `POST /marketplace/vendor_profiles` | Y | `201` |
| 2 | `marketplace.claim_vendor_profile.v1` | User | `POST /marketplace/vendor_profiles/{id}/claim_vendor_profile` *(DD-7 content-blocker)* | Y | `200` |
| 3 | `marketplace.update_vendor_profile.v1` | User | `PATCH /marketplace/vendor_profiles/{id}` | Y | `200` |
| 4 | `marketplace.transfer_vendor_ownership.v1` | User | `POST /marketplace/vendor_profiles/{id}/transfer_vendor_ownership` | Y | `200` |
| 5 | `marketplace.set_vendor_profile_status.v1` | Admin | `POST /marketplace/vendor_profiles/{id}/set_vendor_profile_status` | N (admin) | `200` |
| 6 | `marketplace.get_vendor_profile.v1` | User | `GET /marketplace/vendor_profiles/{id}` | Y | `200` |
| 7 | `marketplace.upsert_vendor_capacity_profile.v1` | User | `PATCH /marketplace/vendor_profiles/{id}/capacity_profile` *(nested singleton — §0.4)* | Y | `200` |
| 8 | `marketplace.get_vendor_capacity_profile.v1` | User | `GET /marketplace/vendor_profiles/{id}/capacity_profile` | Y | `200` |
| 9 | `marketplace.set_declared_financial_tier.v1` | User | `POST /marketplace/vendor_profiles/{id}/set_declared_financial_tier` | Y | `200` |
| 10 | `marketplace.get_declared_financial_tier.v1` | User | `GET /marketplace/vendor_profiles/{id}/declared_financial_tier` | Y | `200` |
| 11 | `marketplace.get_financial_tier_history.v1` | User | `GET /marketplace/vendor_profiles/{id}/financial_tier_history` | Y | `200` |

### 2.3 Inventory — §5 Catalog, Product & Specification (BC-MKT-2 + BC-MKT-3, 21)

| # | Doc-4D Contract-ID | Actor | Method · Path | Active-Org | Success |
|---|---|---|---|---|---|
| 12 | `marketplace.create_category.v1` | Admin | `POST /marketplace/categories` | N (admin) | `201` |
| 13 | `marketplace.update_category.v1` | Admin | `PATCH /marketplace/categories/{id}` | N (admin) | `200` |
| 14 | `marketplace.set_category_status.v1` | Admin | `POST /marketplace/categories/{id}/set_category_status` | N (admin) | `200` |
| 15 | `marketplace.assign_category.v1` | User | `POST /marketplace/category_assignments` | Y | `201` |
| 16 | `marketplace.update_category_assignment.v1` | User | `PATCH /marketplace/category_assignments/{id}` | Y | `200` |
| 17 | `marketplace.remove_category_assignment.v1` | User | `DELETE /marketplace/category_assignments/{id}` *(removal — §2.5 flag)* | Y | `200` |
| 18 | `marketplace.list_categories.v1` | Public | `GET /marketplace/categories` *(public taxonomy)* | N (public) | `200` |
| 19 | `marketplace.get_category_assignments.v1` | User | `GET /marketplace/category_assignments` *(controlling-org-scoped)* | Y | `200` |
| 20 | `marketplace.create_product.v1` | User | `POST /marketplace/products` | Y | `201` |
| 21 | `marketplace.update_product.v1` | User | `PATCH /marketplace/products/{id}` | Y | `200` |
| 22 | `marketplace.set_product_status.v1` | User | `POST /marketplace/products/{id}/set_product_status` | Y | `200` |
| 23 | `marketplace.link_product_spec.v1` | User | `POST /marketplace/products/{id}/link_product_spec` *(N:N link — §2.5)* | Y | `200` |
| 24 | `marketplace.unlink_product_spec.v1` | User | `POST /marketplace/products/{id}/unlink_product_spec` *(N:N unlink — §2.5)* | Y | `200` |
| 25 | `marketplace.create_spec_library_entry.v1` | User | `POST /marketplace/spec_library_entries` | Y | `201` |
| 26 | `marketplace.update_spec_library_entry.v1` | User | `PATCH /marketplace/spec_library_entries/{id}` | Y | `200` |
| 27 | `marketplace.add_spec_document.v1` | User | `POST /marketplace/spec_library_entries/{id}/documents` *(versioned add — §2.5)* | Y | `201` |
| 28 | `marketplace.supersede_spec_document.v1` | User | `POST /marketplace/spec_documents/{id}/supersede_spec_document` *(new version, never overwrite — §2.5)* | Y | `200` |
| 29 | `marketplace.get_product.v1` | Public / User | `GET /marketplace/products/{id}` *(projection-gated)* | Y / N | `200` |
| 30 | `marketplace.list_products.v1` | Public / User | `GET /marketplace/products` *(public = published only)* | Y / N | `200` |
| 31 | `marketplace.get_spec_library_entry.v1` | User | `GET /marketplace/spec_library_entries/{id}` | Y | `200` |
| 32 | `marketplace.get_spec_document.v1` | User | `GET /marketplace/spec_documents/{id}` *(RFQ-gated leg)* | Y | `200` |

### 2.4 Inventory — §6 Profile Experience & Presentation (BC-MKT-4, 20)

| # | Doc-4D Contract-ID | Actor | Method · Path | Active-Org | Success |
|---|---|---|---|---|---|
| 33 | `marketplace.create_microsite.v1` | User | `POST /marketplace/microsites` | Y | `201` |
| 34 | `marketplace.update_microsite.v1` | User | `PATCH /marketplace/microsites/{id}` | Y | `200` |
| 35 | `marketplace.publish_microsite.v1` | User | `POST /marketplace/microsites/{id}/publish_microsite` | Y | `200` |
| 36 | `marketplace.unpublish_microsite.v1` | User | `POST /marketplace/microsites/{id}/unpublish_microsite` | Y | `200` |
| 37 | `marketplace.set_microsite_domain.v1` | User | `POST /marketplace/microsites/{id}/set_microsite_domain` | Y | `200` |
| 38 | `marketplace.update_profile_sections.v1` | User | `PATCH /marketplace/profile_experiences/{id}/sections` *(nested singleton — §0.4)* | Y | `200` |
| 39 | `marketplace.update_branding_assets.v1` | User | `PATCH /marketplace/profile_experiences/{id}/branding_assets` *(nested singleton)* | Y | `200` |
| 40 | `marketplace.update_seo_settings.v1` | User | `PATCH /marketplace/profile_experiences/{id}/seo_settings` *(nested singleton)* | Y | `200` |
| 41 | `marketplace.publish_profile.v1` | User | `POST /marketplace/profile_experiences/{id}/publish_profile` | Y | `200` |
| 42 | `marketplace.unpublish_profile.v1` | User | `POST /marketplace/profile_experiences/{id}/unpublish_profile` | Y | `200` |
| 43 | `marketplace.create_custom_domain.v1` | User | `POST /marketplace/custom_domains` *(entitlement-gated — DD-5/R8)* | Y | `201` |
| 44 | `marketplace.activate_custom_domain.v1` | User | `POST /marketplace/custom_domains/{id}/activate_custom_domain` | Y | `200` |
| 45 | `marketplace.release_custom_domain.v1` | User | `POST /marketplace/custom_domains/{id}/release_custom_domain` | Y | `200` |
| 46 | `marketplace.create_showcase_project.v1` | User | `POST /marketplace/showcase_projects` | Y | `201` |
| 47 | `marketplace.update_showcase_project.v1` | User | `PATCH /marketplace/showcase_projects/{id}` | Y | `200` |
| 48 | `marketplace.publish_showcase_project.v1` | User | `POST /marketplace/showcase_projects/{id}/publish_showcase_project` | Y | `200` |
| 49 | `marketplace.get_microsite.v1` | Public / User | `GET /marketplace/microsites/{id}` *(projection-gated)* | Y / N | `200` |
| 50 | `marketplace.get_profile_experience.v1` | Public / User | `GET /marketplace/profile_experiences/{id}` *(draft=Controlling-Org / published=Public — R5)* | Y / N | `200` |
| 51 | `marketplace.get_showcase_project.v1` | Public / User | `GET /marketplace/showcase_projects/{id}` *(projection-gated)* | Y / N | `200` |
| 52 | `marketplace.get_custom_domain.v1` | User | `GET /marketplace/custom_domains/{id}` | Y | `200` |

### 2.5 Inventory — §7 Advertising & Catalog-Favorites (BC-MKT-5 + BC-MKT-7, 9) · §8 Discovery (BC-MKT-6, 3)

| # | Doc-4D Contract-ID | Actor | Method · Path | Active-Org | Success | § |
|---|---|---|---|---|---|---|
| 53 | `marketplace.create_advertisement.v1` | User | `POST /marketplace/advertisements` *(entitlement-gated — DD-5/R8)* | Y | `201` | §7 |
| 54 | `marketplace.submit_advertisement.v1` | User | `POST /marketplace/advertisements/{id}/submit_advertisement` | Y | `200` | §7 |
| 55 | `marketplace.review_advertisement.v1` | Admin | `POST /marketplace/advertisements/{id}/review_advertisement` | N (admin) | `200` | §7 |
| 56 | `marketplace.set_advertisement_state.v1` | User | `POST /marketplace/advertisements/{id}/set_advertisement_state` *(User leg; System auto-transition → §9)* | Y | `200` | §7 |
| 57 | `marketplace.get_advertisement.v1` | Public / User | `GET /marketplace/advertisements/{id}` *(public when active)* | Y / N | `200` | §7 |
| 58 | `marketplace.list_advertisements.v1` | Public / User | `GET /marketplace/advertisements` *(public = active only)* | Y / N | `200` | §7 |
| 59 | `marketplace.add_catalog_favorite.v1` | User | `POST /marketplace/catalog_favorites` *(membership-only, no slug)* | Y | `201` | §7 |
| 60 | `marketplace.remove_catalog_favorite.v1` | User | `DELETE /marketplace/catalog_favorites/{id}` *(removal — §2.6)* | Y | `200` | §7 |
| 61 | `marketplace.list_catalog_favorites.v1` | User | `GET /marketplace/catalog_favorites` *(controlling-org-scoped)* | Y | `200` | §7 |
| 62 | `marketplace.search_catalog.v1` | Public | `GET /marketplace/catalog_search` *(anonymous read — §0.4 search-as-read)* | N (public) | `200` | §8 |
| 63 | `marketplace.list_vendor_directory.v1` | Public | `GET /marketplace/vendor_directory` *(anonymous)* | N (public) | `200` | §8 |
| 64 | `marketplace.get_public_vendor_profile.v1` | Public | `GET /marketplace/public_vendor_profiles/{id}` *(anonymous; non-disclosure — R9)* | N (public) | `200` | §8 |

### 2.6 Inventory Notes
- **Methods (§5.2):** create → `POST` collection (`201`+`Location`); partial update (`update_*`) → `PATCH` item; state/domain command → `POST` named; read → `GET`. **Removals (`remove_category_assignment`, `remove_catalog_favorite`)** are realized `DELETE` on the item — the assignment/favorite row is the addressed resource; whether these are ADR-012 soft-deletes or relationship-row removals is confirmed against Doc-4D PassB `State Effects` in the §5/§7 content pass. **N:N link/unlink (`link_product_spec`/`unlink_product_spec`)** are relationship-mutation **named commands** (`POST`), not item `DELETE` (the product aggregate is unchanged; only the link row toggles).
- **Success (§5.5):** creates + `add_spec_document` (new versioned document) → `201`; all other commands + reads → `200`. **No `202`** (§2.1 — System consumers/rebuild/infra are out-of-wire, observed via reads).
- **Active-Org:** **Public** reads carry no `Authorization`/`Iv-Active-Organization` (anonymous); **User** ops carry the server-validated `Iv-Active-Organization` (§3.3); **Admin** ops (`set_vendor_profile_status`, category lifecycle, `review_advertisement`) carry **none** (§3.3). Mixed `Y/N` reads (`get_product`, `get_microsite`, `get_profile_experience`, ads reads, …) serve a Public projection (anonymous) or a Controlling-Org projection (User), resolved by the §3 projection rule (R5).
- **Nested / singleton / search [realization convention §0.4]:** `capacity_profile`, profile-experience `sections`/`branding_assets`/`seo_settings`, spec `documents` sub-collection, and `catalog_search` are addressed per §0.4 (Doc-5A §5.3 silent on nested children, org-singletons, and search-as-read). **These are the selected realization; alternatives are historical-review only** unless an architecture review reopens (`Doc-5_Program_Governance_Note_v1.0 §5`). The full §5.7 instantiation is authored in **§4–§8** (Pass-2/3).
- **Binds:** `Doc-5A §5.1/§5.2/§5.5/§5.7`, §7.3, §10; Doc-4D PassB.

---

## §3 — Cross-Cutting Actor, Visibility & Context Wire Model *(mechanism only — owns no endpoint)*

> §3 realizes the **tri-actor + visibility mechanism** every §4–§8 endpoint depends on; it binds `Doc-5A §7.1–§7.6` + §6.3 by pointer and states the M2-specific application. **Instantiates no endpoint.** Section-form authority = the frozen `Doc-5C §3` precedent ([realization convention] — prevents five-way restatement across §4–§8).

### 3.1 Authentication Carriage (§7.1) — tri-actor
- **Public/anonymous** caller carries **no `Authorization`** — discovery/directory/public-profile and published catalog reads are open (`Doc-5A §7.1`; R2). **User** carries the **`Authorization`** bearer — **authentication only** (credential/session mechanics out of scope — Identity/Supabase Auth, DD-1). **Admin** carries the bearer; actor type is server-determined (§3.2).
- **Binds:** `Doc-5A §7.1`; `Doc-4A §5.1`.

### 3.2 Actor-Type Determination (§7.2)
- M2 actor types — **Public** (unauthenticated), **User**, **Admin** (`staff_*`), **System** (out-of-wire) — are **server-determined**; no field/header asserts actor type (`Doc-5A §7.2`; `Doc-4A §9.7`). The public-vs-authenticated split is determined by presence of a valid bearer, server-side; an anonymous caller never reaches a User/Admin surface.
- **Binds:** `Doc-5A §7.2`; `Doc-4A §5.2`; Doc-4D §D8.

### 3.3 Active-Organization Context (§7.3) — R2
- A **User** operation executes within a **server-validated active organization** carried in **`Iv-Active-Organization`** (org `UUIDv7`) — a **context selector, never a trusted assertion**: the server validates the principal's active membership before any business processing (CONTEXT category, §3.7; `Doc-5A §7.3`; `Doc-4A §5.3`). Records are owned by the active org (`Master Architecture` Invariant 5). **Public** operations carry **no** org context. **Admin** governance carries **no** org context (`Doc-5A §7.3`/§5.6).
- **Binds:** `Doc-5A §7.3`; `Doc-4A §5.3/§5.6/§9.7`; Doc-4D §D8.

### 3.4 Visibility Classes & Per-Read Projection (R5 — binding)
- Every M2 entity read resolves to exactly one of **three visibility classes**: **Public** (published projection — anonymous-safe), **Controlling-Org** (draft/private projection — active-org-scoped), **Internal-Service** (out-of-wire, §9). **Content ≠ Presentation** (Invariant #9): the draft and published projections are **distinct wire surfaces**; `publish_*`/`unpublish_*` drive the literal transition (**Doc-4M**); **no single read merges draft and published state**. **Binding per-read projection rule:** every read in §4–§8 **declares its projection class** in its §5.7 block (content pass); an undeclared/ambiguous projection is a **content-authoring blocker**.
- **Binds:** `Doc-5A §6.3`; `Doc-4A §7.5`; `Doc-2 §0.2` (exclusion of soft-deleted/unpublished/retired); Doc-4D §D6/§D7.3.

### 3.5 Authorization Realization (§7.5) — single root
- Authorization is **server-side** — three-layer check (active Membership + Permission Slug + Resource Scope) **OR** an active delegation grant — resolved from §3.1–§3.3 context via Identity **`check_permission`** (consumed; `Doc-5A §7.5`; `Doc-4A §6.1`). **`check_permission` is the sole authorization authority consumed by M2; no parallel or shadow authorization path is permitted** (`Doc-4A §5.3/§6`). Slugs (`staff_can_manage_categories`, vendor/profile slugs, …) are **never** wire inputs (`Doc-4A §6.2`); favorites are **membership-only (no slug)** (DD-6 note). `[ESC-MKT-AUDIT]` / `staff_*` gaps (DD-3/DD-4) bound by pointer (R4).
- **Binds:** `Doc-5A §7.5`; `Doc-4A §6.1/§6.2/§9.7`; `Doc-4C §C3` (consumed root); Doc-2 §7.

### 3.6 Non-Disclosure Firewall & Entitlement Gating (§6.3) — R9/R8
- **Non-disclosure (R9):** no blacklist / private-CRM / Buyer-Vendor-Status / banned / suspended / soft-deleted fact is ever surfaced on a Marketplace-facing read; a protected-fact-gated read collapses to a uniform **`NOT_FOUND`** identical in status, body, and timing to genuinely-absent (no side-channel). Banned/suspended profiles drop from §8 discovery reads. **Entitlement gating (R8):** the advertisement and custom-domain surfaces **consume** Billing (`Doc-4I`) entitlement checks at the gate; **denial collapses to `NOT_FOUND`** (not a distinguishable `403` that would leak the gated resource's existence). Doc-5D authors no Billing contract; ad purchase is Billing-owned, referenced by bare UUID (`Doc-4D §D7.4`; DD-5).
- **Binds:** `Doc-5A §6.3`; `Doc-4A §7.5`; `Doc-2 §0.2/§10.11`; `Doc-4D §D6`; `Doc-4I` (consumed — DD-5).

### 3.7 Context Validation Position (§7.6)
- Carried context validated in the fixed **CONTEXT category** of the universal order (`Doc-5A §7.6`; `Doc-4A §11.2`, position 2) — before AUTHZ/SCOPE/STATE/REF/BUSINESS and any semantic processing; Doc-5D maps the resulting failure to its §6 status and **MUST NOT** reorder/merge/short-circuit (disclosure control — R9).
- **Binds:** `Doc-5A §7.6`; `Doc-4A §11.2`.

---

*End of Doc-5D Content v1.0, Pass 1 (§0–§3). Document control, scope/surface-partition, the 64-entry caller-facing inventory (methods per the strict §5.2 mapping — creates `POST`/`201`, updates `PATCH`, state/domain commands `POST` named, removals `DELETE`, reads `GET`; nested/singleton/search addressing per §0.4 [realization convention]), and the §3 cross-cutting tri-actor/visibility/non-disclosure wire model (mechanism only) — no §5.7 template instantiation, no out-of-wire realization (§9), no schemas, no Doc-4D contract restated; no caller `202`; projection class per read deferred to §5.7; nothing coined. §4 (vendor profile), §5 (catalog/product/spec), §6 (profile experience) follow in Pass-2; §7 (advertising/favorites), §8 (discovery), §9 (out-of-wire), §10 (conformance) + Appendix A in Pass-3, each conforming to `Doc-5D_Structure_v1.0_FROZEN.md`. DD-6 `marketplace.*` POLICY-key registration is a content-freeze prerequisite (CHK-5A-121).*
