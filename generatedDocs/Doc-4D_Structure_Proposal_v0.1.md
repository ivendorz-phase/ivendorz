# Doc-4D — Marketplace & Discovery — API & Integration Contracts — Structure Proposal v0.1

| Field | Value |
|---|---|
| Document | Doc-4D — Marketplace & Discovery (Module 2 — `marketplace` schema) |
| Type | **Structure Proposal (v0.1)** — structural blueprint only. **Not** a content document, implementation contract, or API design. |
| Status | **DRAFT — ready for Independent Architecture Board review** |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0 (FROZEN), Doc-4C v1.0 (FROZEN) |
| Family-map basis | Doc-4A §1.3: **Doc-4D = Marketplace & Discovery (Module 2)**; Appendix B namespace `marketplace_` |
| Contains | Section map only — section number, title, purpose, expected content scope, dependencies, excluded scope. **No contracts, endpoints, payloads, events, permissions, audit actions, or implementation detail.** |
| Audience | Architecture Board; subsequent Doc-4D content-pass authors; Claude Code / Cursor / backend / QA |

**Family-map reconciliation (flag-and-halt resolved).** The authoring request labeled this work *"Doc-4D — Module 2 — RFQ / Procurement Engine."* That descriptor conflicted with the frozen, unanimous corpus: **Doc-4A §1.3** assigns **Doc-4D = Marketplace & Discovery (Module 2)** and **Doc-4E = RFQ Procurement Engine (Module 3)**; **Doc-4A Appendix B** reserves `marketplace_` → Doc-4D and `rfq_` → Doc-4E; **Doc-2 §0.3** maps `marketplace` = Module 2, `rfq` = Module 3. Per Doc-4A §1.3 ("changes to the family map MUST be made by Doc-4A patch, never informally") and §0.6 (flag-and-halt), authoring was halted and escalated. The Architecture Board reconciled it by confirming **Doc-4D = Marketplace & Discovery (Module 2)** — the "RFQ / Procurement Engine" descriptor was a label slip. This proposal is authored accordingly; the RFQ Procurement Engine remains **Doc-4E (Module 3)**, unaffected.

**Three governing rules shape this document** (same discipline as the frozen Doc-4B/Doc-4C structures):

1. **Reference, never restate (Doc-4A §0.3).** Entity definitions (Doc-2 §3.3), the Vendor Profile / Advertisement state machines (Doc-2 §5.3/§5.8), permission slugs (Doc-2 §7), events (Doc-2 §8), audit actions (Doc-2 §9), and POLICY keys (Doc-3 §12) have owners; Doc-4D binds to them by pointer.
2. **Consume frozen lower layers; redefine nothing.** Doc-4D consumes the Doc-4A standards (templates §21, authorization §6/§6B, context §5) and the frozen services/contracts of **Doc-4B Platform Core** (audit-write §17, outbox-write §16, UUIDv7 + human-reference §8, POLICY §18, feature flags) and **Doc-4C Identity** (org/membership resolution, `check_permission`, delegation grants) — by pointer. It redefines none of them.
3. **Structure only.** This proposal maps sections; it instantiates no contract, payload, event, slug, or audit action. Those are the content passes' work, authored against this structure once frozen.

---

## §D0 — Governance & Scope

- **Purpose:** Establish Doc-4D as the contract document for **Module 2 — Marketplace & Discovery only**, subordinate to the frozen corpus and Doc-4A. Declare the ownership boundary, the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D), the flag-and-halt obligation (§0.6) and patch-based amendment rule, the conformed corpus versions, and the **carried freeze-gate dependency / escalation markers** (DD-1…DD-6, §D0.x below) that content passes will carry through their named channels.
- **Expected content scope:** A short, fully normative control section: ownership declaration (Module 2 owns the `marketplace` schema entities and no others); authority boundaries (what Marketplace governs vs. what it only references/consumes); corpus bindings (effective versions: Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0); escalation-marker register (DD-1…DD-6); the family-map reconciliation note.
- **Dependencies:** Doc-4_Governance_Note_v1.0; Doc-4A §0, §1.3, Appendix B; Doc-2 §0.3.
- **Excluded scope:** No standards introduced (Doc-4A owns them); no resolution of any DD marker (carried only); no module other than Module 2.

**Anticipated freeze-gate dependency / escalation markers (identified structurally; carried — not resolved here):**

- **DD-1 — Vendor verification ownership boundary.** Vendor-profile / capacity / declared-tier *verification* is owned by **Trust (Module 5 / Doc-4G; `verification_records`, Doc-2 §5.6)**. Marketplace owns the vendor profile, capacity, and *declared* tier but **not** verification records/decisions; it submits/triggers and consumes verified outcomes. **Channel:** confirm the submission/consumption boundary against the Trust contract.
- **DD-2 — Matching/routing engine boundary.** Marketplace owns `vendor_matching_attributes` (the **derived read-model** the RFQ engine reads via service), but the matching-confidence and routing **logic** are owned by **RFQ (Module 3 / Doc-4E; Doc-3 §3/§6)**. **Channel:** the attribute read-model is exposed by service; no matching/routing logic is authored in Doc-4D.
- **DD-3 — Vendor ban authority boundary.** `ban_actions` and the ban decision are owned by **Admin (Module 8 / Doc-4J; `VendorBanned`)**. The vendor-profile `banned` status (Doc-2 §5.3) **reflects** the Admin action. **Channel:** Marketplace consumes/reflects the ban; it does not author the ban action.
- **DD-4 — Category approval authority boundary.** `categories` is marketplace-owned, but category approval/governance is a platform-staff action (`staff_can_manage_categories`; Admin oversight per Doc-2 §Module 8 "category approve/delete"). **Channel:** confirm the category-lifecycle approval boundary — Marketplace owns the entity + lifecycle states; Admin governs approval.
- **DD-5 — Entitlement gating boundary (advertisements & custom domains).** Advertisement purchase is a `billing.platform_invoice`; custom domains are entitlement-gated (**Billing, Module 7 / Doc-4I**). Marketplace owns the creative/placement/domain *lifecycle*; Billing owns purchase/entitlement. **Channel:** entitlement checks consumed from Billing; no billing contract authored in Doc-4D.
- **DD-6 — `marketplace.*` POLICY key registration.** Marketplace runtime tunables (e.g., category-tree limits, assignment caps, ad-placement caps, domain-verification windows, profile-experience limits) may require POLICY keys; Doc-3 §12.2 has no dedicated `marketplace.*` block. **Channel:** Doc-3 §12.2 additive registration (the channel used for the Doc-4B `core.*` and the anticipated `identity.*` blocks); reference intended keys by name, never invent (Doc-4A §18.2).

---

## §D1 — Module Mission

- **Purpose:** State, once, the business purpose, strategic role, and procurement-moat contribution of Module 2.
- **Expected content scope:** Business purpose (the public vendor identity, catalog, discovery, and presentation layer of iVendorz); strategic role within the **40% B2B Marketplace · 30% Procurement · 20% ERP-Lite · 10% Vendor Network** positioning; **procurement-moat contribution** — Marketplace owns the authoritative vendor capability/geography/category/tier/capacity *data* and the **derived matching attributes** the RFQ routing moat consumes (it feeds the moat; it does not run it — DD-2); marketplace-maturity staging (Stage A→C) as it affects discovery/seeding.
- **Dependencies:** Architecture (platform identity, marketplace positioning, vendor network); Doc-3 §0 (operating context, creation vs. optimization); Doc-2 §2 (Module 2 aggregates).
- **Excluded scope:** No RFQ routing/matching logic (Doc-4E); no procurement workflow; no narrative that re-derives architecture.

---

## §D2 — Ownership Model

- **Purpose:** Fix the contract surface of Module 2 — enumerate the owned entities, aggregates, lifecycle ownership, and authority ownership, and — critically — what Marketplace does **not** own and references by UUID only.
- **Expected content scope:**
  - **Owned aggregates (Doc-2 §2):** Vendor Profile (`vendor_profiles` + children: `vendor_capacity_profiles`, `declared_financial_tiers`, `financial_tier_history`, `category_assignments`, `vendor_matching_attributes`, `vendor_ownership_history`, `vendor_claim_records`, `profile_sections`, `branding_assets`, `seo_settings`, `custom_domains`), Category, Product (+`product_spec_links`), Specification Library Entry (+`spec_documents`), Microsite, Advertisement, Showcase Project, Catalog Favorite.
  - **Owned entities (Doc-2 §3.3):** the ~21 `marketplace.*` entities, each with tenancy class (Doc-2 §6) and lifecycle (Doc-2 §3.3/§5.3/§5.8).
  - **Lifecycle ownership:** Vendor Profile (§5.3 claim + status), Advertisement (§5.8), and the simple/versioned/append-only lifecycles of the remaining entities.
  - **Authority ownership:** which mutations/state transitions only Marketplace may perform (profile edit/publish, category/tier/capacity assignment, product/spec/microsite/ad management) — by pointer to §D10.
  - **Explicitly NOT owned (reference by UUID only):** `organizations`/`memberships`/`delegation_grants` (Identity / Doc-4C), `verification_records`/`trust_scores`/`performance_scores`/`verified_financial_tiers` (Trust / Doc-4G — DD-1), `rfqs`/`quotations`/matching+routing logic (RFQ / Doc-4E — DD-2), `private_vendor_records`/`vendor_favorites`/`engagements` (Operations / Doc-4F), `ban_actions` (Admin / Doc-4J — DD-3), `subscriptions`/`entitlements`/`platform_invoices` (Billing / Doc-4I — DD-5), all `core.*` (Platform Core / Doc-4B).
- **Dependencies:** Doc-2 §2, §3.3, §6, §10.3; Architecture §16 (module map); ADR-005 (vendor identity/ownership/representation), ADR-017 (module ownership), Architecture Patch v1.0.1 (PATCH-01/02/05: tier-as-attribute, claim lifecycle scope, Vendor Master Identity as logical concept).
- **Excluded scope:** No ownership of any non-`marketplace` entity; no aggregate boundary change; **Vendor Master Identity is a logical concept, not an entity** (Architecture Patch v1.0.1 PATCH-05) — not re-modeled here.

---

## §D3 — Bounded Context Model

- **Purpose:** Define the bounded contexts **within** Module 2, their responsibilities, internal ownership boundaries, and interactions — so content passes place each contract in exactly one context.
- **Expected content scope:** The candidate contexts (to be confirmed at content authoring): **Vendor Profile & Identity-Anchor** (profile, capability flags, geography, claim/ownership, declared tier, capacity), **Catalog & Taxonomy** (categories, category assignments), **Product & Specification** (products, spec library entries, spec documents, links), **Profile Experience & Presentation** (microsites, profile sections, branding, SEO, custom domains, showcase projects), **Advertising** (advertisements/placements), **Discovery & Read-Model** (public catalog/search/directory surfaces, `vendor_matching_attributes` projection). For each: responsibilities, ownership boundary, and inter-context interactions (all within Marketplace; cross-module interactions deferred to §D8).
- **Dependencies:** Doc-2 §2 (aggregates), §3.3 (entities); Architecture (microsites, advertising, discovery); Doc-3 §0.2 (creation vs. optimization).
- **Excluded scope:** No cross-module context ownership; the matching/routing *engine* context belongs to RFQ (Doc-4E), not here (DD-2).

---

## §D4 — Vendor Profile & Catalog Lifecycle Model

*(Module-2 domain section — the Marketplace analogue of a lifecycle model; adapted from the request's "RFQ Lifecycle Model" to Marketplace ownership per the Board's family-map reconciliation.)*

- **Purpose:** Provide the structural home for Marketplace's state machines and lifecycles, bound to the literal Doc-2 §5 edges — declared as legal transitions only (Doc-4A §13), never invented.
- **Expected content scope:**
  - **Vendor Profile (Doc-2 §5.3)** — the two orthogonal dimensions: **claim** (`seeded → invited → claimed → verified`; direct registration creates `claimed`) and **operational status** (`active ⇄ suspended`; `active → banned → active`). Authority/actor per transition (claim requires a controlling org; suspend/ban are platform-governance — DD-3); the **ownership-transfer → Trust Protection Workflow** trigger (trust freeze → compliance review → reactivation) bound by pointer (DD-1).
  - **Advertisement (Doc-2 §5.8)** — `draft → pending_review → scheduled → active`; `pending_review → rejected`; `active ⇄ paused`; `active → completed`.
  - **Simple/versioned/append-only lifecycles** (Doc-2 §3.3): categories (`draft → active → retired`), category_assignments (`proposed → active → removed`), products (`draft → published → unpublished`), microsites/profile_sections (`draft → published → unpublished`), custom_domains (`pending → verified → active → released`), showcase_projects (`draft → published`), spec_documents (versioned, never overwritten), vendor_claim_records (`seeded → invited → claimed`), vendor_ownership_history / financial_tier_history (append-only).
  - **Terminal states** identified per machine (e.g., `retired`, `removed`, `released`, `completed`); terminal states never reopen (§13).
- **Dependencies:** Doc-2 §5.3, §5.8, §3.3; Doc-4A §13 (state-machine declaration); ADR-005 (ownership transfer); Trust Protection Workflow (Architecture; Trust / Doc-4G — DD-1).
- **Excluded scope:** No transition invented or modified; **verified-tier** state and the verification machine (§5.6) are **Trust-owned** (DD-1), not modeled here; the `banned` status is set via the Admin ban action (DD-3), reflected not authored.

---

## §D5 — Profile Ownership, Representation & Authority Model

*(Module-2 domain section — the Marketplace analogue of an authority model; adapted from "Procurement Authority Model".)*

- **Purpose:** Structure how control of a vendor profile is established, transferred, and represented — the Marketplace authority surface — binding to the frozen Identity authorization and delegation models without redefining them.
- **Expected content scope:** **Controlling-organization ownership** (one vendor profile = one controlling org, `UNIQUE(controlling_organization_id)`, Doc-2 §10.3; ADR-005); **claim authority** (who may claim a seeded/invited profile; direct-registration path); **ownership transfer** (approval-based, audited, versioned via `vendor_ownership_history`; triggers the Trust Protection Workflow — DD-1); **representation** — an org acting for a vendor profile it does **not** control does so **only** via a **delegation grant owned by Identity (Doc-4C, FROZEN; §6B)** — Marketplace **consumes** the grant + `check_permission`, it does **not** own or author delegation; **verification submission authority** (`can_submit_verification` is Identity-owned; verification records are Trust-owned — DD-1).
- **Dependencies:** ADR-005 (vendor identity, ownership & representation; Redline v0.3.1); Architecture §6.5/§7.3–7.4 (representation); Doc-2 §10.3 (controlling-org cardinality), §5.3 (ownership transfer); Doc-4C §C9 (delegation grants — consumed), §C3/§C8 (`check_permission`, context); Doc-4A §6/§6B.
- **Excluded scope:** No delegation-grant entity or contract authored (Identity / Doc-4C owns it); no ownership-class authority invented; no verification-record contract (Trust / Doc-4G — DD-1).

---

## §D6 — Discovery, Visibility & Participation Model

*(Module-2 domain section — adapted from "Supplier Participation Model"; in Marketplace, "participation" = catalog presence, discoverability, and presentation, not RFQ invitation.)*

- **Purpose:** Structure the public discovery surface and the visibility rules governing what is exposed, to whom, and when — including the read-model surface the RFQ engine consumes.
- **Expected content scope:** **Discovery/search/directory** read surfaces over public catalog (vendor profiles, products, categories, microsites, showcase projects); **visibility constraints** — public-vs-draft (profile experience publish states), soft-delete/retire exclusion from search (Doc-2 §0.2), entitlement-gated visibility (custom domains, advertisements — DD-5), and the **non-disclosure invariant** (no exposure of blacklist/private-CRM/Buyer-Vendor-Status facts in any marketplace-facing surface — Architecture §1.5; Doc-4A §7.5); **advertisement placement** (landing/bottom/search/vendor_profile) as a discovery-adjacent surface; **the `vendor_matching_attributes` read-model** as the single service surface the RFQ engine reads (DD-2) — its projection rules and what it exposes, without authoring matching logic.
- **Dependencies:** Doc-2 §3.3 (public entities), §6 (tenancy/visibility), §10.3; Doc-4A §7 (tenancy/non-disclosure), §22.3 (query rules); Doc-3 §5.1 (no public RFQ board — a discovery consequence to respect); Architecture §1.5 (non-disclosure firewall).
- **Excluded scope:** No RFQ invitation/quotation participation (Doc-4E); no matching/routing computation (DD-2); no exposure of any protected fact (§7.5).

---

## §D7 — Catalog Curation & Vendor Lifecycle Workflow Model

*(Module-2 domain section — adapted from "Workflow & Decision Model"; in Marketplace, the workflows are curation/onboarding/publishing, not procurement evaluation/decision.)*

- **Purpose:** Structure the operational workflows Marketplace owns end-to-end, binding to Doc-3 operational specs and the frozen state machines.
- **Expected content scope:** **Vendor claim & ownership workflow** (seeding → invitation → claim → verification handoff; ownership transfer; Doc-3 §2.10); **profile publishing workflow** (draft → published experience: sections/branding/SEO/microsite/custom-domain activation); **declared-tier & capacity declaration** (declared tier A–E and capacity evidence — Marketplace-owned; verified tier is Trust's — DD-1); **category assignment & approval** (assignment by controlling org; category-tree approval governed by Admin staff — DD-4); **product & specification-library curation** (product publishing; spec library/document versioning); **advertisement submission/review** (§5.8 — review/approval boundary). Each workflow: the actors, the literal state transitions it drives (by pointer to §D4), and the cross-module handoffs (by pointer to §D8).
- **Dependencies:** Doc-3 §2.9–§2.11 (financial tier lifecycle, vendor claim & ownership, buyer-supplied vendor workflow), §0.2 (creation vs. optimization); Doc-2 §5.3/§5.8 (machines), §9 (audit domains); Architecture (microsites, advertising, vendor onboarding).
- **Excluded scope:** No procurement **evaluation/recommendation/award decision** workflow (those are RFQ / Doc-4E and Operations / Doc-4F); no verification *decision* workflow (Trust / Doc-4G); no ban *decision* workflow (Admin / Doc-4J — DD-3).

---

## §D8 — Integration Surface

- **Purpose:** Structure Marketplace's cross-module interactions **without transferring ownership** — for each counterpart module, the direction, trigger, and contract-consumption pattern (per Doc-4A §4 single-authorship and §4.4 integration rules).
- **Expected content scope:** Interaction surfaces with **Identity (Doc-4C, FROZEN)** — consume org/membership resolution, `check_permission`, and **delegation grants** for representation; **Communication (Doc-4H)** — Marketplace events trigger notification dispatch (Communication authors the integration per §4.4); **Trust (Doc-4G)** — submit verification subjects, consume `VendorVerified` / `VendorTierChanged[verified]` / score events to rebuild attributes (DD-1); **Billing (Doc-4I)** — consume entitlement checks for advertisements/custom domains; advertisement purchase is a billing invoice (DD-5); **RFQ (Doc-4E)** — expose `vendor_matching_attributes` read-model by service (DD-2); **Operations (Doc-4F)** — public profile referenced by private-vendor linking (Operations owns the link); **Admin (Doc-4J)** — reflect ban actions and category approvals (DD-3/DD-4); **Platform Core (Doc-4B, FROZEN)** — consume audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags. Each entry states "consume" vs "expose" and the single-authorship side; **no Template 21.2 integration is instantiated in the structure.**
- **Dependencies:** Doc-4A §4, §4.4, §16 (events); Doc-4B (Platform Core services), Doc-4C (Identity contracts) — both FROZEN; Doc-2 §8 (event ownership).
- **Excluded scope:** No ownership transfer in any direction; no integration contract authored (structure only); Communication/Trust/Billing/RFQ author their own side per single-authorship.

---

## §D9 — Event & Dependency Map

- **Purpose:** Structure the event surface (emitted/consumed) and the dependency markers, bound to Doc-2 §8 — Marketplace **is** a domain-event emitter (unlike Identity), so both directions are populated.
- **Expected content scope:** **Emitted events (Doc-2 §8, by pointer):** `VendorClaimed`, `VendorSuspended` (vendor_profiles); `VendorTierChanged[tier_type='declared']` (declared_financial_tiers); `ProfileThemeChanged`, `ProfileLayoutChanged`, `ProfilePublished`, `ProfileUnpublished`, `MicrositePublished`, `MicrositeDomainChanged` (profile experience); `VendorOwnershipTransferred` (vendor_ownership_history). **Consumed events:** `VendorTierChanged[tier_type='verified']` (from Trust → Marketplace writes `financial_tier_history` as the **exclusive** writer, idempotent consumer — Doc-2 §8 note), `VendorVerified`, `TrustScoreUpdated`/`PerformanceScoreUpdated` (→ rebuild `vendor_matching_attributes`), `VendorBanned` (from Admin → reflect status — DD-3). **Dependency markers:** DD-1…DD-6 (§D0), each routed to its named channel. **Unresolved dependencies:** the open DD markers, carried — none resolved in the structure.
- **Dependencies:** Doc-2 §8 (event ownership map), §10.3 (financial_tier_history exclusive-writer rule); Doc-4A §16 (events/outbox); Doc-4B outbox-write (consumed).
- **Excluded scope:** **No event coined** (Doc-2 §8 owns the catalog; Doc-4A §16.4); no consumer logic for events owned by other modules; transactional-outbox mechanism is Doc-4B's (consumed, not redefined).

---

## §D10 — Authorization Surface

- **Purpose:** Structure the authorization model for Marketplace contracts, bound to Doc-4A §6/§6B and the Doc-2 §7 slug catalog — slugs only, never coined here.
- **Expected content scope:** **Permissions (Doc-2 §7, by pointer):** `can_manage_vendor_profile`, `can_publish_profile`, `can_manage_products`, `can_manage_ads`, `can_upload_spec_documents` (tenant space, controlling org); platform-staff `staff_can_manage_categories` (category approval — DD-4), `staff_can_ban` (ban — Admin-owned, DD-3). **Roles:** bundle defaults are Identity-seeded; checks use slugs only (Doc-4A §6.2). **Scopes:** controlling-org scope for write; public scope for read; entitlement scope for ads/domains (DD-5). **Ownership checks:** the three-layer check (Membership + Slug + Resource Scope) OR a **delegation grant** (§6B) for representative action on a non-controlled profile — resolved via Identity's `check_permission` (consumed; no shadow authorization). Note any tier-change/override actions that are "additionally audited" (Doc-2 §7).
- **Dependencies:** Doc-2 §7 (slugs); Doc-4A §6, §6B, §6.2, §6.4; Doc-4C §C3/§C8 (`check_permission`, context — consumed); ADR-005 (representation).
- **Excluded scope:** **No permission slug invented** (Doc-2 §7 owns the catalog; Doc-4A §6.4); no role bundle authored (Identity-owned); no parallel/shadow authorization resolution (consume `check_permission`).

---

## §D11 — Audit Surface

- **Purpose:** Structure the audit bindings for Marketplace mutations, bound to Doc-2 §9 via the Doc-4B audit-write mechanism — no audit action coined.
- **Expected content scope:** **Auditable actions (Doc-2 §9, by pointer):** the **Vendor profile** domain (create, seed, claim, verify, suspend, ban/lift, tier change [declared + verified], category change, capability/override change, ownership transfer [full workflow]) and the **Profile experience** domain (theme/layout/section/branding/SEO/domain changes, publish/unpublish). **Audit bindings:** `Audit-Required` per mutation; domain + action pointer; attribution; mutation-scope; correlation — all via Doc-4B `core.append_audit_record.v1` (consumed, never re-implemented). **Escalation points:** any Marketplace mutation whose audit action is not separately enumerated in Doc-2 §9 is flagged for a Doc-2 §9 additive (escalation marker, analogous to the Identity `[ESC-IDN-AUDIT]` pattern) — identified at content authoring, never invented.
- **Dependencies:** Doc-2 §9 (audit domains); Doc-4A §17 (audit); Doc-4B audit-write (consumed); Architecture §14 (audit & compliance).
- **Excluded scope:** **No audit action coined** (Doc-2 §9 owns them); reads not audited (§17.1); audit mechanism is Doc-4B's (consumed).

---

## §D12 — AI-Agent Implementation Considerations

- **Purpose:** Structure the cross-cutting constraints that keep AI-assisted implementation of Module 2 unambiguous and ownership-safe.
- **Expected content scope:** **Implementation constraints** (consume frozen Doc-4B/Doc-4C services by pointer; never re-derive authorization, org/membership, delegation, or audit; honor the §5.3 machines verbatim). **Ownership protections** (one vendor profile = one controlling org; declared tier ≠ verified tier — DD-1; matching attributes are a read-model, not the engine — DD-2; ban/category-approval reflect Admin decisions — DD-3/DD-4; ad/domain gated by Billing entitlement — DD-5; `marketplace.catalog_favorites` = public bookmarks only, CRM favorites are Operations). **Ambiguity prevention** (non-disclosure invariant; soft-delete exclusion; no protected-fact exposure; no event/slug/audit-action invention — escalate via the DD channels). Audience: Claude Code, Cursor, backend, QA.
- **Dependencies:** Doc-4A §0.6 (flag-and-halt), §4.1 (one owner), §7.5 (non-disclosure); Doc-4B/Doc-4C (consumed); Architecture Patch v1.0.1 (tier/claim/Vendor-Master-Identity notes).
- **Excluded scope:** No implementation code; no architectural assumption permitted (all bindings by pointer); no resolution of DD markers.

---

## §D13 — Appendices

- **Purpose:** Inventory the appendices the content passes will build (pointer-level), so the structure is complete and reviewable.
- **Expected content scope (appendix inventory only):**
  - **Appendix A — Module 2 Contract Inventory (skeleton).** One row per planned contract: capability, working contract name (`marketplace.<operation>.v1`), owned entity, frozen template (Doc-4A §21), actor type, authoritative source pointer. Skeleton only; no contract instantiated.
  - **Appendix B — Doc-4A + Doc-4B + Doc-4C Conformance Binding Map.** Each Doc-4D section → governing Doc-4A standard(s) + consumed Doc-4B/Doc-4C services, by pointer; affirms Doc-4D redefines none.
  - **Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers.** DD-1…DD-6 (+ any `[ESC-MKT-*]` raised at content authoring), with named resolution channels; carried, never silently resolved (§0.6).
  - **Appendix D — Cross-Reference Index.** Pointer table from every Doc-4D binding point to its authoritative source (Architecture §, ADR, Doc-2 §, Doc-3 §, Doc-4A §, Doc-4B/Doc-4C service), with canonical versions.
- **Dependencies:** Doc-4A §21, Appendix A/B; Doc-2/Doc-3/Doc-4B/Doc-4C (pointers).
- **Excluded scope:** No appendix content authored in the structure; appendices are populated by the content passes.

---

## Structure Quality Self-Check (non-normative)

| Quality rule | Result |
|---|---|
| Supports future Pass-A / Pass-B authoring | Section map covers ownership, contexts, lifecycles, authority, discovery, workflow, integration, events, authz, audit, AI-agent, appendices. |
| Supports AI-assisted implementation | §D12 + per-section excluded-scope + DD markers prevent architectural assumptions. |
| Prevents ownership leakage | §D2 owned/not-owned + DD-1…DD-5 fix every cross-module boundary (Trust, RFQ, Admin, Billing, Operations, Identity). |
| Prevents architecture drift | Family-map reconciled to Doc-4D=Marketplace; everything bound by pointer; nothing coined. |
| Consistent with frozen corpus | Conforms to Architecture/ADRs/Doc-2 v1.0.3/Doc-3 v1.0.2/Doc-4A/Doc-4B/Doc-4C; no contract/API/event/permission/audit-action created. |

---

*End of Doc-4D — Marketplace & Discovery — Structure Proposal v0.1. Structure only: §D0–§D13 with purpose, expected content scope, dependencies, and excluded scope per section; DD-1…DD-6 carried freeze-gate markers identified (none resolved). No contract, API, event, permission slug, or audit action is created. Family-map conflict reconciled by Board decision (Doc-4D = Marketplace & Discovery, Module 2). Ready for Independent Architecture Board review.*
