# Doc-4J_Structure_FROZEN_v1.0 — Admin Operations — API & Integration Contracts — Structure (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** |
| Version | v1.0 |
| Module | Doc-4J |
| Module Name | Admin Operations |
| Schema | `admin` |
| Namespace | `admin_` |
| Source | `Doc-4J_Structure_Proposal_v0.1` as amended by `Doc-4J_Structure_Patch_v1.0` |
| Freeze Authority | `Doc-4J_Structure_Freeze_Audit_v1.0` (APPROVE FOR FREEZE) |
| Patch Verification | `Doc-4J_Structure_Patch_Verification_v1.0` (PATCH VERIFIED) |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4I v1.0 — all FROZEN |
| Family-map basis | Doc-4A §1.3: **Doc-4J = Admin Operations (Module 8)**; **Doc-4L = Cross-Module Integration & Event-Flow Index (non-normative — defines nothing; MUST NOT be cited as a contract source)**; Appendix B namespace `admin_` |
| Sole authority for | `Doc-4J_PassA_Content_v1.0` (the authoritative Module-8 structure source) |

**Family-map confirmation (recorded — FLAG-AND-HALT resolved).** **Doc-4J = Admin Operations (Module 8, `admin` schema)** — confirmed against Doc-4A §1.3 ("4J Admin Operations"), Doc-4A Appendix B (`admin_` → Doc-4J; Doc-4A Pass-5 "Admin Operations | Doc-4J | `admin_`"), Doc-2 §0.3 (`admin` = Module 8), and the Program Roadmap §3.5 (Doc-4J — Admin Operations). *(Recorded reconciliation: the authoring brief titled this document "Module 8 — Event Contracts" and asked it to define authoritative event ownership for all bounded contexts. The **frozen Doc-4A §1.3 family map** assigns **Doc-4J = Admin Operations** and assigns the **cross-module event-flow architecture to Doc-4L** — "Cross-Module Integration & Event-Flow Index," which is **non-normative** and "defines nothing; MUST NOT be cited as a contract source." Event ownership is already fixed per producing module (Doc-2 §8; Doc-4D…4I, FROZEN) under the single-authorship rule (Doc-4A §4/§4.4). Per the user's confirmation, this document is authored as **Doc-4J = Admin Operations** — its frozen identity; the event-contract index is Doc-4L's future scope and is not authored here. No family-map conflict survives; no event re-ownership introduced.)*

**Three governing rules shape this document** (inherited from Doc-4A §0.3; Doc-4D/4E/4F/4G/4H/4I precedent):

1. **Reference, never restate (Doc-4A §0.3).** Entity definitions (Doc-2 §2/§3.9), state machines (Doc-2 §3.9/§10.9 lifecycles), permission slugs (Doc-2 §7), events (Doc-2 §8), audit actions (Doc-2 §9), and POLICY keys (Doc-3 §12.2) have owners; Doc-4J binds to them by pointer and copies none. This is a **structure** document — it names the section homes for those bindings; the content passes instantiate them.
2. **Consume frozen lower layers; redefine nothing.** Doc-4J consumes Doc-4A standards and the frozen services of **Doc-4B Platform Core** (audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags, `core.system_configuration` store), **Doc-4C Identity** (org/membership/user resolution, `check_permission`, the platform-staff slug space), and the modules whose state Admin governs by reference — **Doc-4D Marketplace** (vendor profiles / categories the ban/suggestion decisions act on), **Doc-4E RFQ** (RFQ moderation), **Doc-4F Operations** (private↔public link confirmation writes), **Doc-4G Trust** (verification workflow → Trust stores the decision) — all by pointer.
3. **Structure only.** This document maps sections and bounded contexts; it instantiates no contract, command, query, payload, validation, state-machine detail, or audit action. Those are the content passes' work, authored against this structure once frozen.

**Admin-governance boundary (the decision seam — moat + firewall preserved).** Module 8 is the **platform-staff governance and operations layer**: it owns moderation cases, ban actions, suggestion decisions, import jobs, verification-workflow tasks, and outreach campaigns. **Admin decides; the owning module stores.** Per the frozen ownership separations: a **verification task** is Admin **workflow** that references `trust.verification_records` by ID — **Trust stores the verification decision; Admin owns no Trust/Performance/Verification/Governance score** (trust firewall). A **link suggestion** is an Admin match-candidate queue — **confirmation writes the link columns on `operations.private_vendor_records` via the Operations service; Admin owns no private vendor data**, and **link-suggestion content is never exposed to vendors** (non-disclosure). A **category/vendor suggestion** decision approves into Marketplace's catalog — **Marketplace owns the category; Admin decides approval**. A **ban action** is Admin's enforcement decision — Admin emits `VendorBanned`; downstream modules (Trust freeze, Communication notification) consume it. **Admin makes no procurement/matching/routing/ranking/supplier-selection/award decision (procurement moat)** and **computes/owns no governance score (trust firewall)** — it governs operations, never the marketplace's matching outcome.

---

## §J1 — Module Overview

- **Purpose:** Establish Doc-4J as the contract document for **Module 8 — Admin Operations only**, the platform-staff governance/operations layer (`admin` schema, `admin_` namespace). State the schema, the namespace, the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-4F → Doc-4G → Doc-4H → Doc-4I → Doc-4J), and the admin-governance seam ("Admin decides; the owning module stores").
- **Expected content scope:** Module identity (platform-governance layer); the `admin` schema and `admin_` namespace; the position in the module map (governs moderation/ban/suggestion/import/verification-workflow/outreach by platform-staff actors); the structure-only nature of this document; the conformed frozen corpus versions; the carried markers pointed at Admin that this document resolves as the owning module (DC-3, DD-3, DD-4, DF-5 — see §J14).
- **Owned aggregates (Doc-2 §2, Module 8):** Moderation Case, Ban Action, Suggestion, Import Job, Verification Task, Outreach Campaign.
- **Dependencies:** Doc-4A §0/§1.3/§4.4/Appendix B; Doc-2 §0.3, §2 (Module 8), §3.9; Architecture §16 (module map), ADR-017 (module ownership); ASSUMPTION A-03 (link = columns on the private record; candidates in `admin.link_suggestions`).
- **Excluded scope:** No business/procurement decision (no matching/routing/ranking/supplier-selection/award); no Trust/Performance/Verification/Governance score (Trust stores, Admin decides workflow); no vendor/private data ownership (Marketplace/Operations); no module other than Module 8; **no event-contract architecture for other modules (that is Doc-4L, non-normative; events owned per producing module).**

---

## §J2 — Business Objectives

- **Purpose:** State, once, the business purpose and strategic role of Module 8 within the platform positioning (40% B2B marketplace / 30% procurement / 20% ERP-lite / 10% industrial network — Project Instructions).
- **Expected content scope:** The platform-governance objectives the module serves — **moderation** (RFQ/content review queue; the manual-queue arm of the Doc-3 moderation pipeline), **ban enforcement** (vendor/org bans with a public-banner flag; emits `VendorBanned`), **suggestion decisions** (user-proposed categories, missing-vendor suggestions for empty cells, private↔public link candidates), **data import** (Excel category/vendor-seed jobs), **verification workflow** (the Admin queue that drives Trust's verification decisions — Admin decides, Trust stores), **vendor outreach** (acquisition CRM for empty-category recovery). Strategic role: the trust-and-safety + operational-control layer that keeps the marketplace clean and seeded **without becoming a business authority** — preserving the procurement moat (no matching/routing influence) and the trust firewall (no score ownership). Maturity staging (Stage A→C) as it affects manual-queue intensity (POLICY-gated, never tenant-set).
- **Dependencies:** Architecture (platform identity, trust-and-safety role); Doc-3 §1.x (moderation pipeline; `moderation.*` POLICY); Doc-2 §2 (Module 8 aggregates).
- **Excluded scope:** No procurement-decision logic; no re-derivation of architecture; no operating-number hardcoding (POLICY by key); no score computation.

---

## §J3 — Bounded Context Landscape

- **Purpose:** Enumerate the bounded contexts **within** Module 8, each mapped to one or more owned aggregates; every planned contract lands in exactly one context (no aggregate in two contexts).
- **Expected content scope (candidate contexts, derived from the Doc-2 §2 Module-8 aggregates):**
  - **BC-ADM-1 — Moderation** (Moderation Case aggregate): the RFQ/content moderation queue (`moderation_cases`); the manual-review arm of the Doc-3 moderation pipeline.
  - **BC-ADM-2 — Enforcement** (Ban Action aggregate): vendor/org ban actions (`ban_actions`) with the public-banner flag; **the sole producer of the Doc-2 §8 `VendorBanned` event**.
  - **BC-ADM-3 — Suggestions** (Suggestion aggregate — **3 roots:** `category_suggestions`, `missing_vendor_suggestions`, `link_suggestions`): user-proposed category decisions, missing-vendor triage, and private↔public link-candidate confirmation (link content never vendor-visible; confirmation writes link columns on the private record via the Operations service).
  - **BC-ADM-4 — Data Import** (Import Job aggregate): Excel import jobs (`import_jobs` + child `import_rows`) for category and vendor-seed loads.
  - **BC-ADM-5 — Verification Workflow** (Verification Task aggregate): the verification queue (`verification_tasks`) that references `trust.verification_records` by ID — **Admin decides the workflow; Trust stores the verification decision.**
  - **BC-ADM-6 — Vendor Outreach** (Outreach Campaign aggregate): the vendor-acquisition CRM (`outreach_campaigns` + child `outreach_contacts`).
- **Dependencies:** Doc-2 §2 (Module 8 aggregates), §3.9 (entities); Doc-4D §D3 / Doc-4E §E3 / Doc-4F §F3 / Doc-4G §G3 / Doc-4H §H3 / Doc-4I §I3 (within-module context precedent).
- **Excluded scope:** No cross-module context ownership; no aggregate split across contexts; no Trust/Marketplace/Operations entity context (those modules own their stores).

> **Recorded reconciliation — Suggestion aggregate (3 roots; no Flag-and-Halt; frozen authority governs).** Doc-2 §2 Module 8 lists "**Suggestion**" as one aggregate realized by **three aggregate roots** (`category_suggestions` / `missing_vendor_suggestions` / `link_suggestions` — "AR each"). BC-ADM-3 owns all three roots as the single Suggestion aggregate family; no fourth suggestion type is introduced, and the three roots are not split across contexts. Link-suggestion **content is never exposed to vendors** (Doc-2 §10.9; non-disclosure), and confirmation **writes the link columns on `operations.private_vendor_records` via the Operations service** (ASSUMPTION A-03) — Admin owns the candidate queue, not the private record.

---

## §J4 — Context Responsibilities

- **Purpose:** For each BC-ADM context, fix its responsibilities, internal ownership boundary, and the lifecycles it drives (by pointer to Doc-2 §3.9) — so content passes place each contract unambiguously.
- **Expected content scope (per context — purpose · ownership · aggregate list · service list · dependencies):**
  - **BC-ADM-1 Moderation** — *purpose:* review RFQ/content in the manual queue; *ownership:* `moderation_cases`; *services:* case open/assign, moderation decision (approve/reject/escalate); *dependencies:* RFQ (the moderated RFQ by reference — DR-ADM-RFQ), Identity (`staff_can_moderate_rfq` — DR-ADM-1), Platform Core (audit/POLICY — DR-ADM-PC). **Reviews; the RFQ remains RFQ-owned.**
  - **BC-ADM-2 Enforcement** — *purpose:* issue/lift vendor/org bans; *ownership:* `ban_actions`; *services:* ban issue/lift/expire, public-banner flag; **emits `VendorBanned` (Doc-2 §8)**; *dependencies:* Identity (`staff_can_ban` — DR-ADM-1), Marketplace (the banned vendor by reference — DR-ADM-MKT), Platform Core (outbox/audit — DR-ADM-PC). **The ban decision is Admin's; downstream consumers (Trust freeze, Communication notification) own their own effects.**
  - **BC-ADM-3 Suggestions** — *purpose:* decide category/vendor suggestions and confirm link candidates; *ownership:* `category_suggestions`/`missing_vendor_suggestions`/`link_suggestions`; *services:* category-suggestion approve/reject, missing-vendor triage/close, link-candidate confirm/dismiss; *dependencies:* Marketplace (category catalog the approval writes to — DR-ADM-MKT), Operations (link confirmation writes the private-record link columns via the Operations service — DR-ADM-OPS), Identity (`staff_can_manage_categories` — DR-ADM-1), Platform Core (audit — DR-ADM-PC). **Decides; Marketplace owns the category, Operations owns the private record; link content never vendor-visible.**
  - **BC-ADM-4 Data Import** — *purpose:* run Excel category/vendor-seed imports; *ownership:* `import_jobs` (+`import_rows`); *services:* import job submit/process, per-row outcome capture; *dependencies:* Marketplace (seeded categories/vendor profiles created via the owning services — DR-ADM-MKT), Identity (import authority — DR-ADM-1), Platform Core (file-ref/audit — DR-ADM-PC). **Imports via the owning modules' services; creates no Marketplace entity directly.**
  - **BC-ADM-5 Verification Workflow** — *purpose:* drive the verification queue; *ownership:* `verification_tasks` (workflow only); *services:* task queue/assign/decide (the decision is recorded into `trust.verification_records` via the Trust service); *dependencies:* Trust (the verification record the task references and the decision Trust stores — DR-ADM-TRUST), Identity (`staff_can_verify` — DR-ADM-1), Platform Core (audit — DR-ADM-PC). **Admin owns the workflow task; Trust owns/stores the verification decision and any score (firewall).**
  - **BC-ADM-6 Vendor Outreach** — *purpose:* run vendor-acquisition outreach; *ownership:* `outreach_campaigns` (+`outreach_contacts`); *services:* campaign draft/run/complete, contact pipeline; *dependencies:* Marketplace (target `vendor_claim_record_id`/`vendor_profile_id` by reference — DR-ADM-MKT), Identity (outreach authority — DR-ADM-1), Platform Core (audit — DR-ADM-PC). **CRM only; owns no vendor profile.**
- **Dependencies:** Doc-2 §3.9 (entity lifecycles), §10.9 (blueprint); Doc-4A §4.4 (single-authorship); Doc-3 (moderation pipeline); ASSUMPTION A-03.
- **Excluded scope:** No procurement/matching decision; no score computation/ownership; no vendor/private/category data ownership (owning modules); no event coined beyond `VendorBanned` (Doc-2 §8).

---

## §J5 — Aggregate Inventory

- **Purpose:** Enumerate the six Module-8 aggregates (Doc-2 §2), each assigned to exactly one bounded context — the machine-readable ownership ledger for content passes.
- **Expected content scope (aggregate → root → children/value-objects → owning BC-ADM, by pointer to Doc-2 §2/§3.9):**
  - **Moderation Case** — root `moderation_cases`; VO SubjectRef → **BC-ADM-1**.
  - **Ban Action** — root `ban_actions`; VO BanScope, PublicBannerFlag → **BC-ADM-2**.
  - **Suggestion** — roots `category_suggestions` / `missing_vendor_suggestions` / `link_suggestions` (AR each; the one Suggestion aggregate family) → **BC-ADM-3**. **Co-location guard:** the three Suggestion roots remain co-located in BC-ADM-3 at all pass stages — they **must not** be split into separate bounded contexts even though they carry distinct lifecycles (`submitted→approved/rejected`; `submitted→triaged→closed`; `suggested→confirmed/dismissed`) and distinct dependency sets (Marketplace; neither; Operations); the co-location is **mandated by Doc-2 §2** (one Suggestion aggregate, three ARs). No BC split at Pass-A or any later pass.
  - **Import Job** — root `import_jobs`; child `import_rows`; VO RowError → **BC-ADM-4**.
  - **Verification Task** — root `verification_tasks` (workflow only); VO DecisionRef (`verification_record_id`) → **BC-ADM-5**.
  - **Outreach Campaign** — root `outreach_campaigns`; child `outreach_contacts` → **BC-ADM-6**.
- **Dependencies:** Doc-2 §2 (Module 8 aggregate design), §3.9 (entity catalog), §10.9 (`admin` blueprint); ASSUMPTION A-03.
- **Excluded scope:** **No aggregate belongs to more than one context**; no aggregate added beyond the Doc-2 §2 Module-8 set; no aggregate from another module (verification record = Trust; private record = Operations; category = Marketplace).

---

## §J6 — Domain Service Inventory

- **Purpose:** Name the structure-level domain services per context (the service *surfaces*, not contracts) — so content passes know where each capability lands without inventing service names.
- **Expected content scope (service surface → owning BC-ADM; capability-level only, no contract IDs):** moderation-case + decision service (BC-ADM-1); ban-action + banner service (BC-ADM-2; the `VendorBanned` production authored here per single-authorship); suggestion-decision + link-confirmation service (BC-ADM-3; link confirmation calls the Operations service); import-job + row-outcome service (BC-ADM-4; seeding via the owning modules' services); verification-task service (BC-ADM-5; decision recorded via the Trust service); outreach-campaign + contact service (BC-ADM-6). Each service consumes the frozen Doc-4B (audit/outbox/POLICY/feature-flag/config-store) and Doc-4C (`check_permission`, platform-staff slug resolution) services by pointer.
- **Dependencies:** Doc-2 §3.9 (capabilities implied by entities); Doc-4B/Doc-4C (consumed services); Doc-4A §4.4/§16; Architecture §16.
- **Excluded scope:** No command/query/contract instantiated (content-pass work); no service that performs a procurement/matching/routing/award decision or computes a Trust score; no shadow authorization/audit path; no service that writes another module's store directly (uses the owning module's service).

---

## §J7 — Admin Authority Matrix

- **Purpose:** State, explicitly, what Admin **decides/produces/consumes**, and the interaction boundary with each adjacent module — the structure-level guarantee that Admin governs operations without becoming a business or scoring authority.
- **Expected content scope:**
  - **Admin-owned decisions (governance/operations only):** moderation approve/reject/escalate; ban issue/lift/expire + banner flag; category-suggestion approve/reject; missing-vendor triage/close; link-candidate confirm/dismiss; import job submit/process; verification-task queue/assign/decide (workflow); outreach campaign/contact management. **Each is a governance/operations decision — none is a procurement (matching/routing/ranking/award) decision, and none computes a Trust/Performance/Verification/Governance score.**
  - **Admin-produced outputs:** **Doc-2 §8 event — `VendorBanned` (producer: Admin / `ban_actions`, BC-ADM-2)**; plus the Admin-owned governance records (`moderation_cases`, suggestion rows, `import_jobs`/`import_rows`, `verification_tasks`, `outreach_campaigns`/`outreach_contacts`). **No event beyond `VendorBanned` exists in Doc-2 §8 for Admin** *(any future Admin-emitted event = Doc-2 §8 additive `[ESC-ADM-EVENT]`)*.
  - **Admin-consumed inputs (events; Doc-2 §8):** Admin consumes module events for governance context where the corpus maps them (e.g., RFQ events surfacing items into the moderation queue; the precise consumed set binds to the Doc-2 §8 consumer mapping at content authoring; **no event invented**).
  - **Interaction boundaries (counterpart → boundary rule):** **Identity (Doc-4C)** — consume org/user resolution, `check_permission`, the platform-staff slug space; author none. **Marketplace (Doc-4D)** — category-suggestion approval and import seeding write **via the Marketplace service**; ban references the vendor by UUID; Admin owns no vendor/category data. **Operations (Doc-4F)** — link confirmation writes the private-record link columns **via the Operations service**; Admin owns no private record. **Trust (Doc-4G)** — the verification decision is recorded **via the Trust service**; **Admin computes/owns no score (firewall)**. **RFQ (Doc-4E)** — moderation references the RFQ; the RFQ stays RFQ-owned. **The owning module retains its store and its scores**; Admin decides governance and emits `VendorBanned`.
  - **Admin MUST NEVER:** make a matching/routing/ranking/supplier-selection/award decision (procurement moat); compute/own/mutate a Trust/Performance/Verification/Governance score (trust firewall); own vendor/private/category data (owning modules); expose link-suggestion content to vendors (non-disclosure).
- **Dependencies:** Doc-4A §4.4 (single-authorship), §4B (firewall); Doc-2 §8 (event ownership — admin producer row), §9 (Admin audit domain); ADR (moat); ASSUMPTION A-03.
- **Excluded scope:** No procurement/matching/award decision absorbed; no Trust score computed/owned; no vendor/private/category data ownership; no event coined beyond `VendorBanned`.

---

## §J8 — External Dependency Map

- **Purpose:** State every cross-module dependency explicitly, with direction and consumption pattern (per Doc-4A §4 single-authorship, §4.4 integration) — the structure-level seam list the content passes bind to. Carried dependency markers **DR-ADM-* identified structurally — carried, not resolved here; analogous to Doc-4F `DF-*` / Doc-4I `DF-BILL-*`.**
  - **DR-ADM-1 — Identity boundary.** `organizations`/`memberships`/`users`/`check_permission` and the **platform-staff slug space** (`staff_can_moderate_rfq`/`staff_can_verify`/`staff_can_ban`/`staff_can_manage_categories`/`staff_can_redact_audit`/`staff_super_admin`) are Identity's (Doc-4C, FROZEN). Admin consumes resolution + `check_permission` + the staff slugs by pointer; authors/owns none. **Channel:** consume Doc-4C.
  - **DR-ADM-MKT — Marketplace boundary.** Marketplace (Doc-4D, FROZEN) owns vendor profiles + the category catalog. Admin **references** the banned/outreach vendor by UUID and **writes category-suggestion approvals + import seeding via the Marketplace service**; owns no vendor/category data. **Channel:** reference + write-via-service.
  - **DR-ADM-RFQ — RFQ boundary.** RFQ (Doc-4E, FROZEN) owns RFQs. Admin **references** the moderated RFQ; the moderation decision (approve/reject/escalate) feeds the Doc-3 pipeline; Admin owns no RFQ. **Channel:** reference; moderation decision.
  - **DR-ADM-OPS — Operations boundary.** Operations (Doc-4F, FROZEN) owns `private_vendor_records`. On **link confirmation**, Admin **writes the link columns on the private record via the Operations service** (ASSUMPTION A-03); link content is never vendor-visible; Admin owns no private record. **Channel:** write-via-service (link columns).
  - **DR-ADM-TRUST — Trust boundary (the firewall seam).** Trust (Doc-4G, FROZEN) owns `verification_records` and all scores. Admin's **verification task references the verification record by ID; the decision is recorded into Trust via the Trust service**; **Admin computes/owns no Trust/Performance/Verification/Governance score** (firewall). **Channel:** reference + record-via-service; firewall — no score.
  - **DR-ADM-PC — Platform Core boundary.** All `core.*` services (audit-write, outbox-write/dispatch, UUIDv7 + human-reference, POLICY, feature flags, `core.system_configuration` store) are Platform Core's (Doc-4B, FROZEN). Admin consumes them by pointer; **the system-configuration decision/ratification authority is Admin's, the store/write mechanism is Platform Core's** ("Admin decides; the kernel stores" — Doc-4B PA-E2); re-implements none. **Channel:** consume Doc-4B services.
- **Dependencies:** Doc-4A §4/§4.4/§16; Doc-2 §8 (event ownership); Doc-4B/4C/4D/4E/4F/4G (consumed/adjacent, FROZEN).
- **Excluded scope:** No ownership transfer in any direction; no dependency resolved here (carried as `DR-ADM-*`); no store written except via the owning module's service; structure only.

---

## §J9 — Ownership Matrix

- **Purpose:** Fix the machine-readable ownership ledger — every Module-8 aggregate/entity to its owning BC-ADM, and every not-owned reference to its owning module — so no hidden, shared, or duplicate ownership survives into Pass-A.
- **Expected content scope:**
  - **Owned (Admin / `admin` schema), by Doc-2 §2/§3.9/§10.9 — one owning BC-ADM each:** `moderation_cases` → BC-ADM-1; `ban_actions` → BC-ADM-2; `category_suggestions`/`missing_vendor_suggestions`/`link_suggestions` → BC-ADM-3; `import_jobs`(+`import_rows`) → BC-ADM-4; `verification_tasks` → BC-ADM-5; `outreach_campaigns`(+`outreach_contacts`) → BC-ADM-6.
  - **NOT owned (reference by UUID / service / event only):** Identity entities + `check_permission` + staff slugs (Doc-4C — DR-ADM-1); Marketplace vendor profiles + category catalog (Doc-4D — DR-ADM-MKT); `rfqs` (Doc-4E — DR-ADM-RFQ); `operations.private_vendor_records` + link columns (Doc-4F — DR-ADM-OPS); `trust.verification_records` + all scores (Doc-4G — DR-ADM-TRUST); all `core.*` incl. `system_configuration` store (Doc-4B — DR-ADM-PC).
  - **Tenancy class (Doc-2 §6/§10.9, by pointer):** all Module-8 entities are **platform-owned** (platform-staff actors; the `ban_actions` public-banner flag is the one public projection; `link_suggestions` content is never vendor-visible).
- **Dependencies:** Doc-2 §2, §3.9, §6, §10.9; ASSUMPTION A-03.
- **Excluded scope:** **No shared ownership across BCs, no duplicate ownership, no hidden ownership**; no aggregate in two contexts; every ownership claim justified by a Doc-2 pointer; **no Trust score / private record / category / vendor / RFQ ownership.**

---

## §J10 — Event Production Map

- **Purpose:** Structure the events Module 8 **produces** (Doc-2 §8, by pointer) — at structure level only.
- **Expected content scope:** **Admin produces exactly one Doc-2 §8 domain event — `VendorBanned`** (producer `admin` / `ban_actions`, BC-ADM-2; Doc-2 §8 catalog row "admin | ban_actions | `VendorBanned`"). Per single-authorship (Doc-4A §4.4), Admin owns the production of `VendorBanned`; downstream consumers (Trust Protection freeze workflow; Communication ban notification fan-out) own their own effects. **No other Admin event exists in Doc-2 §8** — moderation/suggestion/import/verification-task/outreach state changes are Admin-owned entity transitions, **not** §8 domain events. *(If an Admin-emitted domain event beyond `VendorBanned` is ever required, it is a Doc-2 §8 additive carried under `[ESC-ADM-EVENT]` — none exists today; no event coined.)*
- **Dependencies:** Doc-2 §8 (event ownership map — admin producer row); Doc-4A §4.4/§16; Doc-4B outbox (consumed for emission).
- **Excluded scope:** **No event coined beyond the Doc-2 §8 admin catalog** (`VendorBanned`); Admin authors no other module's event production; moderation/import/etc. changes are not §8 events.

---

## §J11 — Event Consumption Map

- **Purpose:** Structure the events / signals Module 8 **consumes** (Doc-2 §8, by pointer) — producer, consuming context, ownership direction — at structure level only; consumers are idempotent (Doc-4A §16).
- **Expected content scope (consumed event → producing module → consuming BC-ADM):** Admin consumes the Doc-2 §8 events that surface governance work — e.g., RFQ events routing items into the **moderation** queue (BC-ADM-1) where the Doc-2 §8 / Doc-3 pipeline maps them. The producing module owns the event; **Admin owns only the governance effect** (its moderation case / triage row) — single-authorship (Doc-4A §4.4). The precise consumed set binds to the Doc-2 §8 consumer mapping at content authoring. **These are the Doc-2 §8 catalog events verbatim — none invented; events absent from Doc-2 §8 are not added.** *(Any required-but-absent consumption seam carries `[ESC-ADM-EVENT]` — FLAG-AND-HALT; Doc-2 §8 additive channel.)*
- **Dependencies:** Doc-2 §8 (event catalog + consumers); Doc-4A §16 (idempotent consumer), §4.4 (single-authorship); Doc-4B outbox (consumed).
- **Excluded scope:** **No event invented**; no consumer logic for events owned by other modules beyond Admin's own governance effect.

---

## §J12 — Permission Surface Map

- **Purpose:** Identify the high-level permission **families** the module's contracts will bind (Doc-2 §7, by pointer) — **not** endpoint permissions (Pass-A work).
- **Expected content scope (permission family → applicable BC-ADM; by pointer to Doc-2 §7 platform-staff slug space):**
  - **`staff_can_moderate_rfq`** → BC-ADM-1 Moderation.
  - **`staff_can_ban`** → BC-ADM-2 Enforcement.
  - **`staff_can_manage_categories`** → BC-ADM-3 Suggestions — **category-suggestion decisions ONLY** (Doc-2 §7 scope: `staff_can_manage_categories` governs the category surface, consistent with the Doc-2 §9 Admin audit action "category approve/delete"; it does **not** extend to missing-vendor or link-candidate decisions). Authorization per Suggestion root:
    - `category_suggestions` decisions → **`staff_can_manage_categories`** (Doc-2 §7).
    - `missing_vendor_suggestions` decisions → **`[ESC-ADM-SLUG]`** — Doc-2 §7 enumerates no platform-staff slug for missing-vendor triage; carried (Doc-2 §7 additive); **no slug invented**.
    - `link_suggestions` confirm/dismiss → **`[ESC-ADM-SLUG]`** — Doc-2 §7 enumerates no platform-staff slug for link-candidate confirmation; carried (Doc-2 §7 additive); **no slug invented**.
    BC-ADM-3 therefore binds **one named §7 slug (`staff_can_manage_categories`) for the category-suggestion contract** and **`[ESC-ADM-SLUG]` for the missing-vendor and link-candidate contracts**; `staff_super_admin` remains the audited-and-flagged override per Doc-2 §7. No slug invented; no new authorization model.
  - **Import / outreach authority** — no distinct §7 staff slug is enumerated for import-job or outreach management → carried under **`[ESC-ADM-SLUG]`** (Doc-2 §7 additive; no slug invented) → BC-ADM-4 / BC-ADM-6.
  - **`staff_can_verify`** → BC-ADM-5 Verification Workflow.
  - **`staff_super_admin`** — all actions (every action audited + flagged); **`staff_can_redact_audit`** — compliance-scoped audit redaction (binds where an audit-redaction contract is authored).
  - All are **platform-staff slugs (separate space; §5.6 no active org context)**; Verification Admins hold no finance slugs, Support Admins hold no private-RFQ slugs (separation preserved).
- **Dependencies:** Doc-2 §7 (platform-staff slug space); Doc-4A §6/§6B; Doc-4C (`check_permission`).
- **Excluded scope:** **No endpoint permission defined** (Pass-A); no slug invented; no role bundle authored (Identity-seeded).

---

## §J13 — State Machine Inventory

- **Purpose:** Inventory all Admin-owned state machines (Doc-2 §3.9/§10.9 lifecycles, by pointer) — **inventory only**, no contract or transition detail (Pass-A/Pass-B work).
- **Expected content scope (machine → owning aggregate/BC-ADM → source pointer):**
  - **Moderation Case** — `moderation_cases`: `open → approved / rejected / escalated` — BC-ADM-1 (Doc-2 §3.9).
  - **Ban Action** — `ban_actions`: `active → lifted → expired` — BC-ADM-2 (Doc-2 §3.9).
  - **Category Suggestion** — `category_suggestions`: `submitted → approved / rejected` — BC-ADM-3 (Doc-2 §3.9).
  - **Missing-Vendor Suggestion** — `missing_vendor_suggestions`: `submitted → triaged → closed` — BC-ADM-3 (Doc-2 §3.9).
  - **Link Suggestion** — `link_suggestions`: `suggested → confirmed / dismissed` — BC-ADM-3 (Doc-2 §3.9).
  - **Import Job** — `import_jobs`: `queued → processing → completed / failed` — BC-ADM-4 (Doc-2 §3.9); `import_rows` per-row outcome.
  - **Verification Task** — `verification_tasks`: `queued → in_review → decided` — BC-ADM-5 (Doc-2 §3.9).
  - **Outreach Campaign** — `outreach_campaigns`: `draft → running → completed` — BC-ADM-6 (Doc-2 §3.9).
- **Dependencies:** Doc-2 §3.9/§10.9 (lifecycles); Doc-4A §13 (state-machine standard, applied at Pass-A).
- **Excluded scope:** **No transition contract instantiated** (inventory only); no state/transition invented; the machines are exactly the Doc-2 §3.9/§10.9 set.

---

## §J14 — Escalation Inventory

- **Purpose:** Carry the structurally-identified escalation markers (`ESC-ADM-*` / `DR-ADM-*`) and the **carried markers pointed at Admin from earlier modules** that Doc-4J resolves as the owning module — carried, never resolved here; analogous to Doc-4F `[ESC-OPS-*]` / Doc-4I `[ESC-BILL-*]`.
- **Expected content scope:**
  - **`[ESC-ADM-SLUG]`** (Doc-2 §7 additive) — where an Admin action lacks an enumerated §7 platform-staff slug (e.g., import-job or outreach management, or a distinct link/missing-vendor decision slug); reference an existing staff slug by name where one applies, else carry the marker — **no slug invented**.
  - **`[ESC-ADM-AUDIT]`** (Doc-2 §9 additive) — Doc-2 §9 **enumerates an Admin audit domain** (ban issue/lift, category approve/delete, suggestion decisions, import job execution, moderation decisions, link confirm/dismiss) and a Platform domain (system_configuration change, feature flag change, audit redaction, Super Admin access); where an Admin mutation maps to a named §9 action it binds by pointer, and only where a mutation lacks §9 coverage does it carry the marker — **no audit action invented**.
  - **`[ESC-ADM-POLICY]`** (Doc-3 §12.2 additive) — Doc-3 §12.2 registers `moderation.*` (mode/trusted_closure_rate/dup_window_days/sla_hours); any Admin tunable absent from §12.2 (import batch limits, outreach cadence, ban-expiry windows) carries the marker — **no key invented**.
  - **`[ESC-ADM-EVENT]`** (Doc-2 §8 additive) — Admin produces only `VendorBanned` today; any further Admin-emitted event or required consumption seam carries the marker — **never coin an event in Doc-4J**.
  - **Carried markers pointed at Admin (resolved by Doc-4J as the owning module, via additive contracts + named Doc-2 channels):** **DC-3** (platform-governance Admin slugs), **DD-3** (vendor ban), **DD-4** (category approval), **DF-5** (link suggestions) — per the Program Roadmap §3.5; resolution is an additive Doc-4J contract + the corresponding additive Doc-2 §7/§9 entry through its named channel, not a reopening of the frozen source.
- **Dependencies:** Doc-2 §7/§8/§9 (slug/event/audit catalogs); Doc-3 §12.2 (POLICY); Doc-4A §6.4/§16.4/§17 (no-invention rules); Doc-4F/4I escalation-marker precedent; Program Roadmap §3.5 (carried markers).
- **Excluded scope:** No marker resolved here (carried only); no entity/slug/event/audit-action/POLICY-key invented; markers route to their owning-document channels.

---

## §J15 — Cross-Module Reference Inventory

- **Purpose:** State, per counterpart module, the references Admin holds (by UUID/service/event) and the boundary direction — the structure-level guarantee that no frozen ownership leaks into or out of Admin, with **no ownership transfer**.
- **Expected content scope (counterpart → reference → boundary rule, binding DR-ADM-1…DR-ADM-PC):**
  - **Identity (Doc-4C, FROZEN) — DR-ADM-1:** reference `organization_id`/`user_id`/staff `user_id`; consume `check_permission` + the platform-staff slug space; author/own none.
  - **Marketplace (Doc-4D, FROZEN) — DR-ADM-MKT:** reference `vendor_profile_id`/`category_id` by UUID; write category-approval + import seeding via the Marketplace service; own no vendor/category data.
  - **RFQ (Doc-4E, FROZEN) — DR-ADM-RFQ:** reference `rfq_id` for moderation; own no RFQ; make no procurement decision.
  - **Operations (Doc-4F, FROZEN) — DR-ADM-OPS:** reference `private_vendor_record_id`; write the link columns via the Operations service on confirmation; own no private record; link content never vendor-visible.
  - **Trust (Doc-4G, FROZEN) — DR-ADM-TRUST:** reference `verification_record_id`; record the decision via the Trust service; **compute/own no score (firewall)**.
  - **Platform Core (Doc-4B, FROZEN) — DR-ADM-PC:** consume audit/outbox/UUIDv7+human-ref/POLICY/flags/`system_configuration` store (Admin decides config; the kernel stores).
- **Dependencies:** Doc-4A §4 (module ownership), §4.4 (single-authorship); Doc-2 §8 (events), §6 (tenancy), §10.9 (refs); Doc-4B/4C/4D/4E/4F/4G (FROZEN).
- **Excluded scope:** No ownership crosses a boundary; no shared ownership; the procurement moat and trust firewall are preserved — Admin governs by reference/service, never owns the decision-target's store or scores.

---

## §J16 — AI-Agent Safety Notes

- **Purpose:** Structure the cross-cutting constraints that keep AI-assisted implementation of Module 8 unambiguous and governance-safe — machine-readable boundaries enabling Pass-A authoring without reinterpretation.
- **Expected content scope:** **Authority boundaries** — Admin owns only the governance/operations artifacts (Moderation Case, Ban Action, Suggestion, Import Job, Verification Task, Outreach Campaign), each aggregate in exactly one BC-ADM (§J5/§J9); the decision-target's store remains its owner's; every responsibility/aggregate has an explicit owner. **Governance-only responsibilities** — "Admin decides; the owning module stores": a verification task is workflow (Trust stores the decision + score); a link suggestion is a candidate queue (Operations writes the private-record link columns via service; content never vendor-visible); a category-suggestion approval writes via the Marketplace service. **Ownership restrictions** — Admin **never** makes a matching/routing/ranking/supplier-selection/award decision (procurement moat); computes/owns/mutates **no** Trust/Performance/Verification/Governance score (firewall); owns **no** vendor/private/category/RFQ data; produces **only** `VendorBanned` in Doc-2 §8 (single-authorship). **Admin-governance rules** — platform-staff actors only (separate slug space, §5.6 no active org context); every `staff_super_admin` action is audited + flagged; no event/slug/audit-action/POLICY-key invention — escalate via `ESC-ADM-*` (§J14). Audience: Claude Code, Cursor, OpenAI Codex, backend, frontend, QA.
- **Dependencies:** Doc-4A §0.6 (flag-and-halt), §4.1 (one owner), §4.4 (single-authorship), §4B (firewall); Doc-2 §8; ASSUMPTION A-03.
- **Excluded scope:** No implementation code; no architectural assumption (all bindings by pointer); no resolution of `DR-ADM-*`/`ESC-ADM-*` markers.

---

## §J17 — Structure Summary

- **Purpose:** Close the structure with the section inventory and the freeze-readiness posture (no findings, no commentary — a structure ledger).
- **Expected content scope:** Module 8 — Admin Operations (`admin` schema, `admin_` namespace) decomposes into **6 bounded contexts** (BC-ADM-1 Moderation · BC-ADM-2 Enforcement · BC-ADM-3 Suggestions · BC-ADM-4 Data Import · BC-ADM-5 Verification Workflow · BC-ADM-6 Vendor Outreach) owning **6 aggregates** (Doc-2 §2, Module 8 — Moderation Case, Ban Action, Suggestion, Import Job, Verification Task, Outreach Campaign), each aggregate in exactly one context (the Suggestion aggregate's three roots — category/missing_vendor/link — co-located in BC-ADM-3; no aggregate split across contexts). Cross-module dependencies **DR-ADM-1 / DR-ADM-MKT / DR-ADM-RFQ / DR-ADM-OPS / DR-ADM-TRUST / DR-ADM-PC** (Identity, Marketplace, RFQ, Operations, Trust, Platform Core) are explicit with direction + single-authorship side. **Produced events:** `VendorBanned` (BC-ADM-2; Doc-2 §8 admin producer row — single-authorship). Consumed events: the Doc-2 §8 events that surface governance work (e.g., RFQ → moderation queue), bound at content authoring. State machines inventoried: Moderation Case (`open→approved/rejected/escalated`), Ban Action (`active→lifted→expired`), Category Suggestion (`submitted→approved/rejected`), Missing-Vendor Suggestion (`submitted→triaged→closed`), Link Suggestion (`suggested→confirmed/dismissed`), Import Job (`queued→processing→completed/failed`), Verification Task (`queued→in_review→decided`), Outreach Campaign (`draft→running→completed`). Escalation markers carried: `[ESC-ADM-SLUG]`, `[ESC-ADM-AUDIT]`, `[ESC-ADM-POLICY]`, `[ESC-ADM-EVENT]`; carried markers pointed at Admin (DC-3, DD-3, DD-4, DF-5) resolved as the owning module via additive contracts. **The procurement moat** is preserved (Admin makes no matching/routing/ranking/supplier-selection/award decision); the **trust firewall** is preserved (Admin computes/owns no Trust/Performance/Verification/Governance score — Trust stores, Admin decides workflow); **non-disclosure** holds (link-suggestion content never vendor-visible); "Admin decides; the owning module stores" holds (verification record = Trust; private record = Operations; category = Marketplace; RFQ = RFQ; config store = Platform Core); DDD integrity holds (no boundary leakage; one aggregate per context); event integrity holds (exactly `VendorBanned` produced; consumers idempotent; no event coined; single-authorship intact). Business authority for procurement/scoring remains with the originating modules; nothing invented. **This structure is FROZEN and is the authoritative Module-8 structure source for `Doc-4J_PassA_Content_v1.0`.**
- **Dependencies:** §J1–§J16; the frozen corpus.
- **Excluded scope:** No contract/command/query/payload/validation/state-machine-detail/audit-action instantiated.

---

## Freeze Certificate

```text
Structure Status:
FROZEN

Open BLOCKER = 0
Open MAJOR   = 0
Open MINOR   = 0
Open NITPICK = 0
```

Certified:

- Family Map Integrity Preserved (Doc-4J = Admin Operations; Doc-4L = Cross-Module Integration & Event-Flow Index, non-normative)
- Bounded Context Integrity Preserved (6 BCs: BC-ADM-1 Moderation · BC-ADM-2 Enforcement · BC-ADM-3 Suggestions · BC-ADM-4 Data Import · BC-ADM-5 Verification Workflow · BC-ADM-6 Vendor Outreach)
- Aggregate Integrity Preserved (6 aggregates: Moderation Case · Ban Action · Suggestion [one aggregate, three roots, one BC, no split] · Import Job · Verification Task · Outreach Campaign)
- Authorization Integrity Preserved (category_suggestions → `staff_can_manage_categories`; missing_vendor_suggestions → `[ESC-ADM-SLUG]`; link_suggestions → `[ESC-ADM-SLUG]`; no slug invented)
- Dependency Integrity Preserved (DR-ADM-1 / DR-ADM-MKT / DR-ADM-RFQ / DR-ADM-OPS / DR-ADM-TRUST / DR-ADM-PC)
- Event Governance Preserved (`VendorBanned` is the sole Admin-owned Doc-2 §8 event; single-authorship)
- Procurement Moat Preserved (Admin governs; Admin does not procure — no matching/routing/ranking/supplier-selection/award decision)
- Trust Firewall Preserved (Admin decides workflow; Trust stores decisions — Admin computes/owns no Trust/Performance/Verification/Governance score)
- AI-Agent Readiness Confirmed

---

*Doc-4J_Structure_FROZEN_v1.0 — authoritative Module-8 (Admin Operations) structure source for Doc-4J_PassA_Content_v1.0. Generated from Doc-4J_Structure_Proposal_v0.1 as amended by Doc-4J_Structure_Patch_v1.0, patch-verified (Doc-4J_Structure_Patch_Verification_v1.0) and approved for freeze (Doc-4J_Structure_Freeze_Audit_v1.0). FROZEN.*
