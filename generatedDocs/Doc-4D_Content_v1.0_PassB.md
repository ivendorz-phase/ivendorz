# Doc-4D — Marketplace & Discovery — API & Integration Contracts — Content v1.0, Pass-B (Master / Index)

| Field | Value |
|---|---|
| Document | Doc-4D — Marketplace & Discovery (Module 2 — `marketplace` schema) — **Pass-B master/index** |
| Pass | B of N — **implementation hardening** of the closed Pass-A contract structure: Request/Response contracts, validation matrices, error registers, idempotency, query semantics, reference validation, audit/authorization/event declarations, AI-agent notes. **Not a redesign.** |
| Status | **DRAFT — ready for Independent Hard Review** |
| Base | `Doc-4D_Content_v1.0_PassA.md` **as amended by** `Doc-4D_PassA_Patch_v1.0.1.md` — **APPROVED / CLOSED** per `Doc-4D_PassA_Patch_Verification_Report_v1.0.md` |
| Structure | Conforms to `Doc-4D_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0 (all FROZEN) |
| Contains | Hardened contracts for Module 2 only — **no new entity, contract, event, permission slug, audit action, POLICY key, or template; no ownership / authority / state-machine / actor / lifecycle / integration / DD / ESC change** |
| Delivery | **Split by area** (Board-authorized): this master holds §B conventions + cross-cutting consolidations + appendices; per-area contract hardening is in the **Part files** (manifest below). |
| Audience | Claude Code, Cursor, backend, QA, AI development agents |

**Pass-B scope note (read first).** This Pass **hardens what Pass-A established** — it adds the implementation detail (payload field lists, the canonical-order validation matrix, error registers, idempotency declarations, query semantics, reference-validation rules, and per-contract event/audit/authz declarations) for **every** Pass-A contract. It **creates nothing new** and **changes no** ownership, authority boundary, state machine, actor assignment, lifecycle binding, integration ownership, DD marker, or escalation marker. The contract inventory, template/actor/authz/state/audit/event bindings, and the markers **DD-1…DD-8** and **`[ESC-MKT-AUDIT]`** are carried **verbatim** from the closed base. Frozen lower-layer artifacts are **referenced by pointer, never restated** (Doc-4A §0.3). This document performs **no self-review and contains no findings or commentary**. **Scope guard:** no RFQ / procurement / matching-routing logic (DD-2); no `VendorBanLifted` event (DD-8); no verification decision (Trust); no notification contract (Communication).

---

## Part-File Manifest

The hardened per-contract blocks are delivered in five Part files, each conforming to the §B conventions in this master:

| Part | File | Covers (Pass-A §) | Contracts |
|---|---|---|---|
| A | `Doc-4D_Content_v1.0_PassB_VendorProfile.md` | §D4–§D5 — Vendor Profile, Capacity, Declared Tier, Ownership (+ Trust consumers) | create/claim/update/transfer/suspend/get vendor profile; capacity upsert/get; declared tier set/get/history; sync_verified_financial_tier; reflect_verified_claim_status |
| B | `Doc-4D_Content_v1.0_PassB_CatalogProductSpec.md` | §D7.1–§D7.2 — Catalog & Taxonomy; Product & Specification | category create/update/status; assignment assign/update/remove; product create/update/status; product-spec link/unlink; spec entry + document lifecycle; reads |
| C | `Doc-4D_Content_v1.0_PassB_ProfileExperience.md` | §D7.3 — Profile Experience, Custom Domains, Showcase | microsite lifecycle/publish/domain; profile sections/branding/SEO; publish/unpublish profile; custom-domain lifecycle; showcase lifecycle; reads |
| D | `Doc-4D_Content_v1.0_PassB_AdvertisingFavorites.md` | §D7.4–§D7.5 — Advertising; Catalog Favorites | ad create/submit/review/set_state; ad reads; catalog favorite add/remove/list |
| E | `Doc-4D_Content_v1.0_PassB_Discovery.md` | §D6 — Discovery & Read-Model (+ event consumers) | search/directory/public-profile reads; get/rebuild vendor_matching_attributes; reflect_vendor_ban; reflect_vendor_ban_lift (DD-8 placeholder) |

Every contract carries the **eleven Pass-B deliverables** (Request, Response, Validation Matrix, Error Register, Idempotency, Query semantics [reads], Reference Validation, Audit, Authorization, Events, AI-Agent Notes), with cross-cutting elements bound by pointer to §B.

---

## §B — Pass-B Hardening Conventions (stated once; bound by pointer per contract in every Part)

### B.1 — Contract block grammar (Doc-4A §21)

Each contract presents: **Header** (Contract-ID, name, owner-module, actor, version, status) · **Authorization** (§6/§6B) · **Firewall** (§4B, where a signal is touched) · **Request Contract** · **Response Contract** (§22.1) · **Validation Matrix** (§11.2, mutations) · **Error Register** (§12) · **State Effects** (§13) · **Idempotency** (§14, mutations) · **Audit** (§17) · **Events** (§16) · **Query semantics** (§22.3, reads) · **Reference Validation** · **AI-Agent Notes**. Defaults below are cited as "(§B.x)" rather than repeated. Contract-ID = `marketplace.<operation>.v1`; namespace `marketplace_` (Doc-4A Appendix B).

### B.2 — Identifiers, payload typing, field ownership

- **IDs:** UUIDv7 only in payloads (Doc-4A §8). `vendor_profiles` carry `human_ref` (display/lookup; allocated via Doc-4B `core.allocate_human_reference.v1`). Cross-module IDs (`controlling_organization_id`, `purchaser_organization_id`, `platform_invoice_id`, `category_id` refs, `vendor_profile_id`) are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3).
- **Timestamps:** ISO-8601 UTC (§9.8). **Concurrency token:** `updated_at` on mutable entities; optimistic concurrency on updates (CONFLICT on stale token).
- **Server-populated (never client-asserted):** `created_by`, `updated_by`, `created_at`, `updated_at`, `controlling_organization_id` (from validated active-org context, §5.3).
- **Field ownership:** every request field is owned by the `marketplace` entity it targets (Doc-2 §3.3/§10.3); cross-module fields are echoed refs, never owned.

### B.3 — Response & reference_id (Doc-4A §22.1 C-05 / P6-B01)

Every non-21.5 Response carries **`reference_id : uuid : always`** (platform-assigned UUIDv7; support/audit correlation). **21.5 System** contracts carry `Response: none` (FreezeAudit Patch v1.0.1). **Success response** = entity projection (entitled fields only, §7) + `reference_id`. **Error response** = the §12 envelope (B.5). **Entity projection rules:** public reads return published/public fields; owning-org reads return full; soft-deleted/retired rows excluded from default reads (Doc-2 §0.2). **Metadata** (pagination `page_info`, etc.) per B.6.

### B.4 — Validation matrix (Doc-4A §11.2 — fixed order)

Mutations declare stages in the **canonical order** (omitting only structurally inapplicable stages, never reordering): **SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → STATE → REFERENCE → BUSINESS → POLICY**. Stage→error-class map (§12): SYNTAX→`VALIDATION`; CONTEXT→`AUTHORIZATION`; AUTHZ→`AUTHORIZATION`; SCOPE→`NOT_FOUND` (disclosure collapse, §7.5); DELEGATION→`AUTHORIZATION`; STATE→`STATE`; REFERENCE→`REFERENCE`; BUSINESS→`BUSINESS`; POLICY→`QUOTA`/`RATE_LIMITED`/`BUSINESS`. **AUTHZ precedes semantics.** Self-service / membership-only contracts mark AUTHZ "n/a (no slug)"; public reads validate SYNTAX → CONTEXT → AUTHZ(public) → SCOPE.

### B.5 — Error model (Doc-4A §12 — closed class set; nothing invented)

- **Closed classes (none invented):** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`.
- **Envelope:** `error_class, error_code, message, field_errors, retryable, reference_id`.
- **Code namespace:** `marketplace_<domain>_<code>` (Doc-4A Appendix B §B.2; prefix `marketplace_` registered). Domain segments: `vendor, capacity, tier, category, product, spec, microsite, profile, domain, showcase, ad, favorite, discovery, attr`. Codes are **registrations within the existing `marketplace_` prefix** (§12.3) — **no new class**.
- **`retryable`:** `true` only for transient classes (`RATE_LIMITED, DEPENDENCY, SYSTEM, ASYNC_PENDING`); `false` for deterministic (`VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, CONFLICT`).
- **User-facing behavior:** `VALIDATION/STATE/BUSINESS/CONFLICT` → actionable message (fix input / refresh / resolve conflict); `AUTHORIZATION/NOT_FOUND` → uniform "not available" (no protected-fact disclosure, §7.5); `RATE_LIMITED/DEPENDENCY/SYSTEM` → retry-after / transient.
- **Protected-fact rule:** existence/authorization failures over non-disclosable facts collapse to `NOT_FOUND` with timing uniformity (§7.5/§12.4).

### B.6 — Query semantics (Doc-4A §22.3; reads)

Reads declare: **Filters** (allowlisted), **Sorting** (allowlisted field + tiebreaker = id for total order), **Pagination** (cursor-based; `page_info { next_cursor, has_more, total_count? }`; `page_size` bounded by an intended `marketplace.*` POLICY key **[DD-6]**), **Projection** (entitled fields, B.3), **Visibility** (tenancy §7; public vs owning-org; non-disclosure §7.5; soft-delete/retire exclusion §0.2). **Search constraints:** public catalog search excludes soft-deleted/banned/retired and never exposes protected facts.

### B.7 — Idempotency (Doc-4A §14; joint rule §14.3)

Every **mutation** declares `Idempotency: required` with a **client-supplied idempotency key** and a **dedup window bound to an intended `marketplace.*` POLICY key [DD-6]** (no concrete value, no key registered). **Replay (same key) → cached response; no duplicate audit record; no duplicate outbox event; no duplicate side effect** (§14.3). **Duplicate handling:** uniqueness collisions on client-deterministic keys (e.g., one profile per org, domain uniqueness) → `CONFLICT`. **System (21.5) consumers** are **platform-scope idempotent** — an already-applied event/transition is not re-applied (dedup source = the consumed event's identity / target row state). Queries declare `Idempotency: not-applicable`.

### B.8 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`)

Audited mutations declare `Audit-Required: yes` · **Domain** (Doc-2 §9 Vendor-profile / Profile-experience / Documents, by pointer) · **Attribution** (`standard` for User/Admin; `system` for System, §17.3) · **Mutation-Scope** (the `marketplace.*` table) · **Correlation** (`both`, or `phase2-origin` for 21.5) · **Audit-Source-Reference** (the §9 action name pointer). Written **in-transaction** via the Doc-4B mechanism (never re-implemented). **Reads not audited** (§17.1). A mutation whose audit action is **not separately enumerated in Doc-2 §9** carries **`[ESC-MKT-AUDIT]`** (interim: nearest §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented; no action created to bypass escalation**). **Seed** audit is **Admin-authored** (Module 8 import job, Doc-4J) — not a Marketplace write (Pass-A Patch m-02).

### B.9 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed)

Each contract declares **Membership** (active / n/a), **Permission** (slug per Doc-2 §7, or membership-only / nearest-staff-slug binding where §7 names none — **no slug invented**), **Scope** (controlling-org / public / platform), **Delegation eligibility** (§6B — eligible only for vendor-profile representative action via a Doc-4C delegation grant; otherwise `not eligible`). Resolution **consumes** Identity `check_permission` + org/membership (Doc-4C §C3/§C8) and the §6B delegation path — **no shadow authorization**. Admin (21.6) contracts declare **no active org context** (§5.6). System (21.5) declare no slug (FIXED System actor).

### B.10 — Reference validation (no new integration)

- **UUID validation:** every UUID field syntactically validated (SYNTAX) and existence-validated against its **owning service** (REFERENCE), never by cross-schema FK (Doc-2 §0.3).
- **Ownership validation:** in-module refs (`vendor_profile_id` child links, `category_id`) validated for **same-tenant/controlling-org ownership** at SCOPE/REFERENCE.
- **Existence + lifecycle validation:** target row exists and is in a legal state for the requested transition (STATE, Doc-2 §5.3/§5.8); terminal states never reopen (§13).
- **Cross-module refs:** `controlling_organization_id`/`purchaser_organization_id` → Identity Org service; `platform_invoice_id` → Billing (DD-5); `vendor_profile_id` (delegation) → already owned. **Read-validation only; no integration/event authored** (DD-1/DD-2/DD-3/DD-5 boundaries intact).

### B.11 — Governance-signal firewall (Doc-4A §4B / §18.3)

Marketplace **owns the declared Financial Tier signal** and writes `financial_tier_history` (declared directly; verified only as Trust's idempotent consumer — Doc-2 §10.3). It **projects** trust/performance/verified-tier bands into the **derived `vendor_matching_attributes` read-model** (DD-2). It **never lets one signal mutate another**, **never computes matching/eligibility**, and **no paid plan/entitlement/flag gates any signal, verification, eligibility, routing, or matching** (§4B). Per-contract firewall notes appear only where a signal is written (declared tier) or projected (matching rebuild); all other contracts touch no signal.

### B.12 — AI-agent globals (every Part cites; per-contract notes add specifics)

Consume frozen Doc-4B/Doc-4C services (never re-derive auth/membership/delegation/audit/IDs/outbox); honor Doc-2 §5.3/§5.8 machines **verbatim** (no edge invented); **DD-2** — never author matching/routing/ranking/supplier-selection/RFQ-matching logic (`vendor_matching_attributes` is a projection, not a decision surface); **DD-8** — `reflect_vendor_ban_lift.v1` stays conditional / non-implementable / blocked, no `VendorBanLifted` coined; **Trust decides, Marketplace reflects** (never author verification decisions); **Marketplace emits, Communication authors notifications** (never author notification contracts); declared tier ≠ verified tier (DD-1); ad/domain gated by Billing entitlement (DD-5); `vendor_claim_records` tenancy unsettled (DD-7 — do not finalize mutation ownership); never expose a protected fact (§7.5); never coin an entity/event/slug/audit-action/POLICY-key/template (escalate via DD / `[ESC-MKT-AUDIT]`).

---

## §D0–§D3 — Governance / Scope / Ownership / Contexts (carried from Pass-A by pointer)

Unchanged from the closed Pass-A (as amended by Patch v1.0.1): **§D0** governance & scope + carried markers DD-1…DD-8, `[ESC-MKT-AUDIT]` (family-map: Doc-4D = Marketplace & Discovery, Module 2); **§D1** mission (public vendor identity/catalog/discovery layer; feeds the RFQ moat via the read-model, does not run it — DD-2); **§D2** ownership (the `marketplace` aggregates owned; Identity/Trust/RFQ/Operations/Admin/Billing/Core entities referenced by UUID only); **§D3** bounded contexts (Vendor Profile & Identity-Anchor; Catalog & Taxonomy; Product & Specification; Profile Experience & Presentation; Advertising; Discovery & Read-Model). Pass-B adds no scope, ownership, or context change.

---

## §D8 — Integration Surface (Pass-B consolidation)

Carried from Pass-A §D8 (single-authorship, Doc-4A §4.4; **no Template 21.2 instantiated** — emitting modules author delivery contracts). Per-contract integration bindings are in the Parts. Summary: **Identity (Doc-4C, consume)** — `check_permission`/membership/§6B delegation; **Trust (Doc-4G, consume)** — `VendorVerified`/`VendorTierChanged[verified]`/score events (Part A/E consumers); submit verification subjects (decision is Trust's, DD-1); **Communication (Doc-4H, emit only)** — outbox events; **Marketplace authors no notification contract**; **Billing (Doc-4I, consume)** — entitlement for ads/domains (DD-5); **RFQ (Doc-4E, expose)** — `vendor_matching_attributes` read-model (DD-2); **Operations (Doc-4F, expose)** — public profile for private-vendor linking; **Admin (Doc-4J, consume/reflect)** — `VendorBanned` (DD-3), category approval (DD-4), and the **blocked** ban-lift (DD-8); **Platform Core (Doc-4B, consume)** — audit/outbox/ID/POLICY/flags.

---

## §D9 — Event & Dependency Map (Pass-B consolidation)

- **Emitted (Doc-2 §8; via Doc-4B outbox-write; no event coined):** `VendorClaimed`, `VendorSuspended`, `VendorTierChanged[declared]`, `VendorOwnershipTransferred`, `ProfileThemeChanged`, `ProfileLayoutChanged`, `ProfilePublished`, `ProfileUnpublished`, `MicrositePublished`, `MicrositeDomainChanged`.
- **Consumed (Doc-2 §8; emitter authors delivery per §4.4):** `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated` (Trust); `VendorBanned` (Admin). **Ban-lift has no consumer — no `VendorBanLifted` event ([DD-8]); `reflect_vendor_ban_lift.v1` is the conditional, non-implementable placeholder.** *(N-01: `VendorVerified` drives multiple Marketplace consumers — `reflect_verified_claim_status` (claim status) and `rebuild_vendor_matching_attributes` (attribute rebuild); Pass-B subscription detail per the respective Part blocks; event flow unchanged.)*
- **Carried markers:** DD-1…DD-8, `[ESC-MKT-AUDIT]` — none resolved.

---

## §D10 — Authorization Surface (Pass-B consolidation)

- **Tenant slugs (Doc-2 §7; controlling-org scope):** `can_manage_vendor_profile`, `can_publish_profile`, `can_manage_products`, `can_manage_ads`, `can_upload_spec_documents`. **Membership-only:** catalog favorites.
- **Platform-staff slugs (Doc-2 §7; §5.6 no org context):** `staff_can_manage_categories` (category lifecycle — DD-4); `staff_can_ban` (vendor suspend — nearest moderation slug); `staff_super_admin` (advertisement review — nearest). Least-privilege staff slugs for vendor-suspend / ad-review = future Doc-2 §7 additives (D-2) — **none invented**.
- **Resolution:** three-layer (Membership + Slug + Scope) OR §6B delegation grant for representative action on a non-controlled vendor profile, via Identity `check_permission` (consumed) — **no shadow authorization**.

---

## §D11 — Audit Surface (Pass-B consolidation)

- **Bound (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`):** Vendor-profile domain (create, **seed** [Admin-authored — Module 8 import; not a Marketplace write], claim, verify, suspend, **ban/lift** [ban = `reflect_vendor_ban`; **lift carrier pending DD-8**], tier change [declared + verified], category change, capability/override change, ownership transfer) and Profile-experience domain (theme/layout/section/branding/SEO/domain changes, publish/unpublish); spec/document new revision (Documents domain).
- **`[ESC-MKT-AUDIT]` (carried; Doc-2 §9 additive; no action invented, none created to bypass escalation):** advertisement lifecycle (submit/review/approve/reject/publish), product publish/unpublish, showcase/custom-domain transitions where unenumerated. Reads not audited (§17.1).

---

## §D12 — AI-Agent Implementation Considerations (Pass-B consolidation)

Per-contract AI-Agent Notes are in the Parts; the §B.12 globals govern all. Cross-cutting: consume frozen Doc-4B/Doc-4C; honor §5.3/§5.8 verbatim; DD-2 (no matching logic); DD-8 (placeholder non-implementable); DD-1 (Trust decides, Marketplace reflects); DD-3/DD-4 (reflect Admin decisions); DD-5 (Billing entitlement); DD-7 (`vendor_claim_records` tenancy unsettled); Communication single-authorship; non-disclosure (§7.5); no coinage (escalate via DD / `[ESC-MKT-AUDIT]`).

---

## Appendix A — Module 2 Contract Inventory (Pass-B)

The Pass-A inventory (~70 contracts) is hardened in the Part files; the inventory grouping (areas, templates, actors, markers) is carried from Pass-A Appendix A unchanged. Per-contract hardened blocks: **Part A** (§D4–§D5), **Part B** (§D7.1–§D7.2), **Part C** (§D7.3), **Part D** (§D7.4–§D7.5), **Part E** (§D6 + consumers). No contract added or removed; templates/actors/entities/markers unchanged from the closed Pass-A.

## Appendix B — Conformance Binding Map (Pass-B)

Carried from Pass-A Appendix B (as amended by Patch v1.0.1 REP-8: one §D6 row, one §D7 row with §D7.1–§D7.5). Each section binds to its Doc-4A standards and consumes the frozen Doc-4B/Doc-4C contracts **by pointer**; **Doc-4D redefines none and re-implements no Doc-4B/Doc-4C mechanism** (single owner per capability). The §B conventions add the §11.2/§12/§14/§22.1/§22.3/§19.3 hardening standards uniformly.

## Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers (UNCHANGED)

Carried **verbatim** from the closed Pass-A Appendix C (as amended by Patch v1.0.1). Pass-B **does not resolve, redesign around, or invent workarounds**:

- **DD-1** verification = Trust (Doc-4G); Marketplace submits/consumes. **DD-2** matching/routing logic = RFQ (Doc-4E); Marketplace owns/exposes the read-model. **DD-3** vendor ban = Admin (Doc-4J). **DD-4** category approval = Admin staff. **DD-5** ad/domain entitlement = Billing (Doc-4I). **DD-6** `marketplace.*` POLICY keys = Doc-3 §12.2 additive (idempotency/pagination windows referenced by intended name only). **DD-7** `vendor_claim_records` tenancy = Doc-2 §6/§3.3 reconciliation. **DD-8** vendor ban-lift event gap = Doc-2 §8 additive (`reflect_vendor_ban_lift.v1` conditional/non-implementable; no `VendorBanLifted` coined). **`[ESC-MKT-AUDIT]`** audit-action gaps = Doc-2 §9 additive.

## Appendix D — Cross-Reference Index (Pass-B)

Carried from Pass-A Appendix D: owned entities/tenancy/lifecycle/schema (Doc-2 §2/§3.3/§6/§10.3); Vendor Profile / Advertisement machines (Doc-2 §5.3/§5.8); slugs (Doc-2 §7); events (Doc-2 §8); audit domains (Doc-2 §9); workflows (Doc-3 §2.9–§2.11); templates/authz/context/events/audit/firewall/validation/error/idempotency/rate-limit (Doc-4A §21/§6/§6B/§5/§16/§17/§4B/§11.2/§12/§14/§19.3); Identity consumed (Doc-4C §C3/§C8/§C9); Platform Core consumed (Doc-4B services); ADR-005; carried markers (`Doc-4D_Structure_v1.0_FROZEN.md` §D0/Appendix C + Pass-A Patch DD-8).

---

*End of Doc-4D Content v1.0 — Pass-B (Master / Index). §B conventions + §D8–§D13 consolidations + appendices; per-area hardened contract blocks in Part files A–E (manifest above). DD-1…DD-8 and `[ESC-MKT-AUDIT]` carried unchanged; no entity, event, permission slug, audit action, POLICY key, or template invented; no RFQ/matching logic (DD-2); no `VendorBanLifted` (DD-8). No payloads beyond hardening; no self-review; no findings. Ready for Independent Hard Review.*
