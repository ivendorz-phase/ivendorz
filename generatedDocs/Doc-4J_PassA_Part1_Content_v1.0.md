# Doc-4J — Admin Operations — API & Integration Contracts — Content Pass-A Part 1 v1.0

| Field | Value |
|---|---|
| Document | Doc-4J — **Content Pass-A Part 1 v1.0** — contract inventory + governance records for Module 8 — Admin Operations (`admin` schema, `admin_` namespace), bounded contexts **BC-ADM-1 / BC-ADM-2 / BC-ADM-3** |
| Status | **Pass-A Part 1 — contract structure (inventory + governance records), pre-hardening.** Not structure design, not a freeze audit, not Pass-B. Next stage: Independent Hard Review → Pass-A Patch → Patch Verification → Pass-A FROZEN → Pass-B. |
| Structure authority | `Doc-4J_Structure_FROZEN_v1.0` (FROZEN; sole structural authority; **not revisited, not redesigned, not reopened**) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4I v1.0, Doc-4J_Structure_FROZEN_v1.0 — all FROZEN |
| Part scope (this Part) | **BC-ADM-1 Moderation** (Moderation Case) · **BC-ADM-2 Enforcement** (Ban Action) · **BC-ADM-3 Suggestions** (Suggestion — 3 roots). **Not authored here:** BC-ADM-4 Data Import, BC-ADM-5 Verification Workflow, BC-ADM-6 Vendor Outreach (Part 2). |
| Contains | Pass-A depth: BC overviews, aggregate definitions, **contract inventory** (no 12-section per-contract hardening — that is Pass-B), authorization/audit/event/dependency matrices, error model, AI-agent notes. |
| Audience | Doc-4J Pass-B authors; Claude Code / Cursor / OpenAI Codex / backend / frontend / QA |

**Family-map confirmation (recorded).** **Doc-4J = Admin Operations (Module 8, `admin` schema)** — per `Doc-4J_Structure_FROZEN_v1.0` (Doc-4A §1.3). Cross-module event-flow is Doc-4L (non-normative); events stay owned per producing module (single-authorship). No event re-ownership introduced.

## §B — Pass-A Cross-Cutting Conventions (stated once; bound by pointer per contract)

- **B.1 — Contract-ID & templates (Doc-4A §21).** Contract-ID `admin.<operation>.v1` (prefix = schema `admin`; Appendix B namespace `admin_`). Templates: **21.6 Admin** (platform-staff mutations/decisions without active org context — §5.6), **21.3 Query** (platform-staff reads), **21.5 System** (`Response: none` — System-actor effects, e.g., ban expiry job). **Template 21.2 (Integration)** is instantiated only where Admin **authors its own event production** (the `VendorBanned` delivery contract — single-authorship, Doc-4A §4.4); consumers do not instantiate it. No template invented.
- **B.2 — Actor types (Doc-4A §5; Doc-2 §9 actor set User|Admin|System|AI Agent).** **Admin** (platform-staff, no active org context — §5.6; the primary Module-8 actor) and **System** (jobs — e.g., ban expiry). **No User (tenant) actor** authors Admin governance decisions (suggestions are *submitted* by tenant users in their owning modules; Admin *decides* them as platform-staff). No actor category invented.
- **B.3 — Identifiers (Doc-4A §8; Doc-2 §0.1).** UUIDv7 is the only canonical machine ID. Cross-module references (`subject_id`+`subject_type`, `assigned_to`, `issued_by`, `confirmed_by`, `suggested_by_organization_id`, `proposed_parent_category_id`, `category_id`, `private_vendor_record_id`, `vendor_profile_id`, `organization_id`) are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3, §10.9).
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — for **platform-staff slugs (separate space; §5.6 no active org context)**. **Slugs only** (§6.2), from the Doc-2 §7 platform-staff catalog; **no slug invented**. Admin **consumes** Identity's `check_permission` + staff-slug resolution (Doc-4C, FROZEN). The Doc-2 §7 platform-staff slugs in this Part: **`staff_can_moderate_rfq`** (BC-ADM-1), **`staff_can_ban`** (BC-ADM-2), **`staff_can_manage_categories`** (BC-ADM-3 category-suggestion decisions ONLY). Missing-vendor and link-candidate decisions have **no enumerated §7 staff slug → `[ESC-ADM-SLUG]`** (Doc-2 §7 additive; no slug invented). `staff_super_admin` is the audited-and-flagged override. Verification Admins hold no finance slugs; Support Admins hold no private-RFQ slugs (separation preserved).
- **B.5 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** **Doc-2 §9 enumerates an Admin audit domain** — "ban issue/lift, category approve/delete, suggestion decisions, import job execution, moderation decisions, link confirm/dismiss." Every audited Admin mutation in this Part binds the **named §9 Admin action by pointer** (no `[ESC-ADM-AUDIT]` is required for these — §9 covers them); only an Admin mutation genuinely absent from §9 would carry `[ESC-ADM-AUDIT]`. Written in-transaction via the Doc-4B mechanism. **Reads are not audited** (§17.1); **`staff_super_admin` actions are additionally flagged** (Doc-2 §7).
- **B.6 — Events (Doc-2 §8 via Doc-4B outbox-write/consume).** **Admin produces exactly one Doc-2 §8 domain event — `VendorBanned`** (producer `admin` / `ban_actions`, BC-ADM-2; single-authorship — Admin owns and **authors its production/delivery**, Doc-4A §4.4). Downstream consumers own their effects (Marketplace `reflect_vendor_ban` `active→banned` — DD-3; Communication ban notification; Trust Protection freeze). **No other Admin event exists in Doc-2 §8** — moderation/suggestion state changes are Admin-owned entity transitions, **not** §8 events. **No event invented; events absent from Doc-2 §8 are not added** (`[ESC-ADM-EVENT]` carries any future need — none today).
- **B.7 — Admin-governance neutrality & firewall (Doc-4A §4.4/§4B; ADR; Doc-2).** **Admin decides; the owning module stores.** Admin owns **none** of matching/routing/ranking/quotation-evaluation/supplier-selection/award/procurement-eligibility (procurement moat) and computes/owns **no** Trust/Performance/Verification/Governance score and **no** verification record (trust firewall — Trust stores). Category-suggestion approval **writes the category via the Marketplace service** (Marketplace owns categories); link-candidate confirmation **writes the link columns on `operations.private_vendor_records` via the Operations service** (Operations owns the private record); **link-suggestion content is never vendor-visible** (non-disclosure). A ban is Admin's enforcement decision; the vendor-profile status reflection is Marketplace's consumer effect.
- **B.8 — AI-agent source rule.** Every contract record states its **owning BC / aggregate / actor / permission-family / lifecycle / audit / event source** by pointer, so AI agents implement without architectural assumptions. Global constraints: consume frozen Doc-4B/Doc-4C services; honor the Doc-2 §3.9/§10.9 lifecycles verbatim; decide governance but never procure/score; reference target entities by UUID and write other modules' stores only via their services; produce only `VendorBanned`; never invent an entity/event/slug/audit-action/POLICY-key/template (escalate via DR / `[ESC-ADM-*]`).

**Per-contract record shape (Pass-A).** Each contract below is recorded as: **Purpose · Owning BC · Aggregate · Operation (template) · Actor · Permission family · Lifecycle impact · Audit · Events · Cross-Module · Sources.** This is inventory + governance depth only — **no 12-section hardening (Pass-B).**

---

# BC-ADM-1 — Moderation (Moderation Case aggregate)

## J1A-1 — BC Overview

- **Purpose:** Operate the RFQ/content moderation queue — the manual-review arm of the Doc-3 moderation pipeline. Platform-staff review and decide moderation cases.
- **Responsibilities:** moderation-case lifecycle (open/assign/decide), moderation decisions (approve / reject / escalate). **Reviews; the moderated RFQ remains RFQ-owned.**
- **Ownership:** `moderation_cases` (platform-owned). Admin owns the case record; the RFQ is referenced by `subject_id`+`subject_type` (DR-ADM-RFQ); the moderation decision feeds the Doc-3 pipeline.
- **Dependencies:** **DR-ADM-RFQ** (the moderated RFQ by reference), **DR-ADM-1** (Identity `staff_can_moderate_rfq` + `check_permission`), **DR-ADM-PC** (Platform Core audit/POLICY).

## J1A-2 — Aggregate Definition

- **Moderation Case** — root `moderation_cases`; VO SubjectRef (`subject_id`+`subject_type` ∈ `rfq` etc.); fields `state(open/approved/rejected/escalated)`, `reason`, `assigned_to` (Doc-2 §10.9). **State machine:** `open → approved / rejected / escalated` (Doc-2 §3.9). Platform-owned.

## J1A-3 — Contract Inventory (BC-ADM-1)

#### `admin.create_moderation_case.v1` — Open Moderation Case · 21.6 Admin / 21.5 System · Actor: Admin / System
- **Purpose:** open a moderation case for a subject (RFQ/content) entering the manual queue. **Owning BC:** BC-ADM-1. **Aggregate:** Moderation Case (`moderation_cases`). **Operation/Actor:** 21.6 Admin (staff open) / 21.5 System (auto-queued from the Doc-3 pipeline). **Permission family:** `staff_can_moderate_rfq` (Doc-2 §7) / System (auto-queue). **Lifecycle:** creates `moderation_cases` at `open` (Doc-2 §3.9). **Audit:** §9 Admin ("moderation decisions" domain — case open) by pointer. **Events:** none emitted; consumes the Doc-2 §8 governance-surfacing events that route items into the queue (Doc-3 pipeline). **Cross-Module:** RFQ subject reference (DR-ADM-RFQ); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9; Doc-3 (moderation pipeline).
#### `admin.assign_moderation_case.v1` — Assign Moderation Case · 21.6 Admin · Actor: Admin
- **Purpose:** assign a case to a moderating staff member (`assigned_to`). **Owning BC:** BC-ADM-1. **Aggregate:** Moderation Case. **Permission family:** `staff_can_moderate_rfq`. **Lifecycle:** no state change (assignment within `open`). **Audit:** §9 Admin ("moderation decisions") by pointer. **Events:** none. **Cross-Module:** Identity (DR-ADM-1). **Sources:** Doc-2 §10.9.
#### `admin.decide_moderation_case.v1` — Decide Moderation Case (approve / reject / escalate) · 21.6 Admin · Actor: Admin
- **Purpose:** record the moderation decision — `open → approved / rejected / escalated` (with `reason`). **Owning BC:** BC-ADM-1. **Aggregate:** Moderation Case (`moderation_cases`). **Permission family:** `staff_can_moderate_rfq` (Doc-2 §7). **Lifecycle:** `open → approved / rejected / escalated` (Doc-2 §3.9). **Audit:** §9 Admin ("moderation decisions") by pointer. **Events:** none emitted (the decision feeds the Doc-3 RFQ pipeline; the RFQ state transition is RFQ-owned). **Cross-Module:** RFQ subject reference (DR-ADM-RFQ; decision feeds the pipeline, RFQ owns its state); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9; Doc-3.
#### `admin.get_moderation_case.v1` · `admin.list_moderation_cases.v1` — Moderation Reads · 21.3 Query · Actor: Admin
- **Purpose:** read a case / list the moderation queue. **Owning BC:** BC-ADM-1. **Aggregate:** Moderation Case. **Permission family:** `staff_can_moderate_rfq`. **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Identity (DR-ADM-1). **Sources:** Doc-2 §10.9.

---

# BC-ADM-2 — Enforcement (Ban Action aggregate)

## J2A-1 — BC Overview

- **Purpose:** Issue, lift, and expire vendor/org bans with a public-banner flag. **Sole producer of the Doc-2 §8 `VendorBanned` event.**
- **Responsibilities:** ban-action lifecycle (issue/lift/expire), public-banner flag, `VendorBanned` production. **The ban decision is Admin's; downstream consumers (Marketplace `reflect_vendor_ban`, Communication notification, Trust Protection freeze) own their own effects.**
- **Ownership:** `ban_actions` (platform-owned; banner flag public). Admin owns the ban-action record; the banned vendor/org is referenced by `subject_id`+`subject_type` ∈ `vendor_profile`/`organization` (DR-ADM-MKT).
- **Dependencies:** **DR-ADM-MKT** (the banned vendor by reference; the status reflection is Marketplace's consumer effect — DD-3), **DR-ADM-1** (Identity `staff_can_ban`), **DR-ADM-PC** (Platform Core outbox/audit).

## J2A-2 — Aggregate Definition

- **Ban Action** — root `ban_actions`; VO BanScope, PublicBannerFlag; fields `scope`, `reason`, `public_banner BOOL`, `state(active/lifted/expired)`, `issued_by`, `subject_id`+`subject_type` (Doc-2 §10.9). **State machine:** `active → lifted → expired` (Doc-2 §3.9). Platform-owned (banner public).

## J2A-3 — Contract Inventory (BC-ADM-2)

#### `admin.issue_ban.v1` — Issue Ban · 21.6 Admin · Actor: Admin
- **Purpose:** issue a ban against a vendor profile/organization (`scope`, `reason`, `public_banner`) at `active`; **emit `VendorBanned`**. **Owning BC:** BC-ADM-2. **Aggregate:** Ban Action (`ban_actions`). **Permission family:** `staff_can_ban` (Doc-2 §7). **Lifecycle:** creates `ban_actions` at `active` (Doc-2 §3.9). **Audit:** §9 Admin ("ban issue/lift") by pointer. **Events:** **emits `VendorBanned`** (Doc-2 §8; Admin-owned, single-authorship; Admin authors the delivery contract per §4.4 — DD-3); consumed by Marketplace (`reflect_vendor_ban` `active→banned`), Communication (notification), Trust Protection (freeze). **Cross-Module:** Marketplace vendor reference + consumer (DR-ADM-MKT, DD-3); Identity (DR-ADM-1); Platform Core (outbox/audit — DR-ADM-PC). **Sources:** Doc-2 §3.9/§8/§10.9.
#### `admin.lift_ban.v1` — Lift Ban · 21.6 Admin · Actor: Admin
- **Purpose:** lift an active ban (`active → lifted`). **Owning BC:** BC-ADM-2. **Aggregate:** Ban Action. **Permission family:** `staff_can_ban` (Doc-2 §7). **Lifecycle:** `active → lifted` (Doc-2 §3.9). **Audit:** §9 Admin ("ban issue/lift") by pointer. **Events:** none emitted at lift (the ban-lift reflection is governed by the carried DD-8 "blocked ban-lift" marker on the Marketplace side; Admin emits no lift event in Doc-2 §8). **Cross-Module:** Marketplace (DR-ADM-MKT; DD-8 carried); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
#### `admin.expire_ban.v1` — Expire Ban · 21.5 System · Actor: System
- **Purpose:** expire a ban at the end of its window (`active → expired` / `lifted → expired`). **Owning BC:** BC-ADM-2. **Aggregate:** Ban Action. **Permission family:** none (System; expiry job). **Lifecycle:** `→ expired` (Doc-2 §3.9). **Audit:** §9 Admin ("ban issue/lift" — expiry by pointer) / `[ESC-ADM-AUDIT]` if expiry is not covered by the §9 enumeration (nearest by pointer; no action invented). **Events:** none. **Cross-Module:** Marketplace (DR-ADM-MKT); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
#### `admin.get_ban_action.v1` · `admin.list_ban_actions.v1` — Ban Reads · 21.3 Query · Actor: Admin
- **Purpose:** read a ban action / list bans. **Owning BC:** BC-ADM-2. **Aggregate:** Ban Action. **Permission family:** `staff_can_ban`. **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Identity (DR-ADM-1). **Sources:** Doc-2 §10.9. *(The public-banner projection is a Marketplace-side public read; Admin owns the ban-action record.)*

---

# BC-ADM-3 — Suggestions (Suggestion aggregate — 3 roots; one aggregate, one BC, no split)

## J3A-1 — BC Overview

- **Purpose:** Decide user-submitted category suggestions, triage missing-vendor suggestions, and confirm/dismiss private↔public link candidates. **Admin decides; Marketplace owns categories; Operations owns private records.**
- **Responsibilities:** category-suggestion approve/reject, missing-vendor triage/close, link-candidate confirm/dismiss. **Co-location guard (frozen §J5):** the three roots remain **one Suggestion aggregate in BC-ADM-3 — no split at any pass** (Doc-2 §2 mandate).
- **Ownership:** `category_suggestions` / `missing_vendor_suggestions` / `link_suggestions` (all platform-owned). Admin owns the suggestion records; **category approval writes the category via the Marketplace service** (DR-ADM-MKT; Marketplace owns the category); **link confirmation writes the link columns on `operations.private_vendor_records` via the Operations service** (DR-ADM-OPS; Operations owns the private record); **link-suggestion content is never vendor-visible** (non-disclosure, Doc-2 §10.9).
- **Dependencies:** **DR-ADM-MKT** (category catalog write-via-service), **DR-ADM-OPS** (private-record link-column write-via-service), **DR-ADM-1** (Identity staff slugs), **DR-ADM-PC** (Platform Core audit).

## J3A-2 — Aggregate Definition

- **Suggestion** — one aggregate, three roots (Doc-2 §2 "AR each"; one BC, no split):
  - `category_suggestions` — fields `suggested_by_organization_id`, `proposed_parent_category_id`, `state(submitted/approved/rejected)`; **state machine** `submitted → approved / rejected` (Doc-2 §3.9).
  - `missing_vendor_suggestions` — fields `suggested_by_organization_id`, `category_id`, `vendor_name`, `contact_hint`, `state(submitted/triaged/closed)`; **state machine** `submitted → triaged → closed` (Doc-2 §3.9).
  - `link_suggestions` — fields `private_vendor_record_id`, `vendor_profile_id`, `confirmed_by`, `match_basis(email/phone/trade_license)`, `confidence`, `state(suggested/confirmed/dismissed)`; **never vendor-visible**; confirmation writes link columns on the private record via the Operations service; **state machine** `suggested → confirmed / dismissed` (Doc-2 §3.9).

## J3A-3 — Contract Inventory (BC-ADM-3)

#### `admin.decide_category_suggestion.v1` — Decide Category Suggestion (approve / reject) · 21.6 Admin · Actor: Admin
- **Purpose:** approve or reject a user-proposed category — `submitted → approved / rejected`; on approval, **write the category via the Marketplace service** (Marketplace owns the category). **Owning BC:** BC-ADM-3. **Aggregate:** Suggestion (`category_suggestions`). **Permission family:** **`staff_can_manage_categories`** (Doc-2 §7 — category-suggestion decisions ONLY). **Lifecycle:** `submitted → approved / rejected` (Doc-2 §3.9). **Audit:** §9 Admin ("category approve/delete" / "suggestion decisions") by pointer. **Events:** none emitted. **Cross-Module:** Marketplace category write-via-service (DR-ADM-MKT; Marketplace owns the category); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9; Doc-2 §7.
#### `admin.triage_missing_vendor_suggestion.v1` · `admin.close_missing_vendor_suggestion.v1` — Missing-Vendor Triage · 21.6 Admin · Actor: Admin
- **Purpose:** triage a missing-vendor suggestion (`submitted → triaged`) and close it (`triaged → closed`). **Owning BC:** BC-ADM-3. **Aggregate:** Suggestion (`missing_vendor_suggestions`). **Permission family:** **`[ESC-ADM-SLUG]`** — Doc-2 §7 enumerates no platform-staff slug for missing-vendor triage; carried (Doc-2 §7 additive); **no slug invented** (`staff_super_admin` override applies per §7). **Lifecycle:** `submitted → triaged → closed` (Doc-2 §3.9). **Audit:** §9 Admin ("suggestion decisions") by pointer. **Events:** none. **Cross-Module:** Marketplace (the missing vendor may feed outreach — BC-ADM-6, Part 2; reference only here); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
#### `admin.confirm_link_suggestion.v1` · `admin.dismiss_link_suggestion.v1` — Link-Candidate Decision · 21.6 Admin · Actor: Admin
- **Purpose:** confirm a private↔public link candidate (`suggested → confirmed`; on confirm, **write the link columns on the private record via the Operations service**) or dismiss it (`suggested → dismissed`). **Owning BC:** BC-ADM-3. **Aggregate:** Suggestion (`link_suggestions`). **Permission family:** **`[ESC-ADM-SLUG]`** — Doc-2 §7 enumerates no platform-staff slug for link-candidate confirmation; carried (Doc-2 §7 additive); **no slug invented**. **Lifecycle:** `suggested → confirmed / dismissed` (Doc-2 §3.9). **Audit:** §9 Admin ("link confirm/dismiss") by pointer. **Events:** none emitted. **Cross-Module:** Operations link-column write-via-service (DR-ADM-OPS; Operations owns `private_vendor_records`; ASSUMPTION A-03); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Non-disclosure:** link-suggestion content (match basis/confidence/candidate identity) is **never exposed to vendors** (Doc-2 §10.9). **Sources:** Doc-2 §3.9/§10.9; A-03.
#### `admin.get_suggestion.v1` · `admin.list_suggestions.v1` — Suggestion Reads · 21.3 Query · Actor: Admin
- **Purpose:** read a suggestion / list suggestions of a given root (category / missing-vendor / link). **Owning BC:** BC-ADM-3. **Aggregate:** Suggestion. **Permission family:** `staff_can_manage_categories` (category reads) / `[ESC-ADM-SLUG]` (missing-vendor / link reads — no enumerated §7 slug; **link reads are platform-staff-only; never vendor-visible**). **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Identity (DR-ADM-1). **Sources:** Doc-2 §10.9. **Non-disclosure:** link-suggestion content never served to a vendor through any read surface.

---

## J-A4 — Permission Surface (Pass-A consolidation, Part 1)

Three-layer check (platform-staff Membership + Permission Slug + Resource Scope) resolved via Identity `check_permission` (consumed; no shadow authorization). **Platform-staff slugs (Doc-2 §7; separate space; §5.6 no active org context; none invented):**

| Permission family | Actor | Contracts | Ownership boundary |
|---|---|---|---|
| `staff_can_moderate_rfq` | Admin | all BC-ADM-1 contracts | moderation queue only; RFQ stays RFQ-owned |
| `staff_can_ban` | Admin | all BC-ADM-2 mutations + reads | ban-action record only; vendor status reflection is Marketplace's |
| `staff_can_manage_categories` | Admin | `decide_category_suggestion`, category reads | **category-suggestion decisions ONLY** (Doc-2 §7); category owned by Marketplace |
| `[ESC-ADM-SLUG]` | Admin | `triage_missing_vendor_suggestion`/`close_missing_vendor_suggestion`, `confirm_link_suggestion`/`dismiss_link_suggestion`, missing-vendor/link reads | Doc-2 §7 enumerates no staff slug for these (additive; no slug invented); `staff_super_admin` override |
| (System) | System | `create_moderation_case` (auto-queue), `expire_ban` | job effects on Admin's own entities |

`staff_super_admin` is the audited-and-flagged override for any action (Doc-2 §7); **no slug invented; no role bundle authored** (Identity-seeded).

## J-A5 — Audit Surface (Pass-A consolidation, Part 1)

All audited mutations bind via Doc-4B `core.append_audit_record.v1` (in-transaction); reads not audited (§17.1). **Doc-2 §9 enumerates the Admin audit domain** (ban issue/lift, category approve/delete, suggestion decisions, import job execution, moderation decisions, link confirm/dismiss) → every Part-1 mutation binds the **named §9 Admin action by pointer**.

| Contract group | §9 Admin action (by pointer) | Audit ownership | Audit requirement |
|---|---|---|---|
| Moderation open/assign/decide (BC-ADM-1) | "moderation decisions" | Admin | yes (every mutation) |
| Ban issue/lift (BC-ADM-2) | "ban issue/lift" | Admin | yes |
| Ban expire (BC-ADM-2, System) | "ban issue/lift" by pointer (or `[ESC-ADM-AUDIT]` if expiry unenumerated; no action invented) | Admin | yes |
| Category-suggestion decision (BC-ADM-3) | "category approve/delete" / "suggestion decisions" | Admin | yes |
| Missing-vendor triage/close (BC-ADM-3) | "suggestion decisions" | Admin | yes |
| Link confirm/dismiss (BC-ADM-3) | "link confirm/dismiss" | Admin | yes |
| all reads | — | n/a | no (reads not audited, §17.1) |
| `staff_super_admin` actions | the relevant §9 action + **flagged** (Doc-2 §7) | Admin | yes + flagged |

## J-A6 — Event Surface (Pass-A consolidation, Part 1)

**Produced (Doc-2 §8):** exactly **`VendorBanned`** (producer `admin` / `ban_actions`, BC-ADM-2; trigger `admin.issue_ban.v1`; single-authorship — Admin authors production/delivery per Doc-4A §4.4). Consumers own their own effects: Marketplace `reflect_vendor_ban` (`active → banned`, DD-3), Communication ban notification, Trust Protection freeze.

| Event | Producer BC | Trigger contract | Consumers (own effects) |
|---|---|---|---|
| `VendorBanned` | BC-ADM-2 | `admin.issue_ban.v1` | Marketplace (reflect, DD-3) · Communication (notify) · Trust Protection (freeze) |

*(No other Admin §8 event exists. Moderation/suggestion state changes are Admin-owned entity transitions, not §8 events. `[ESC-ADM-EVENT]` carries any future need — none today; no event coined.)*

**Consumed:** the Doc-2 §8 governance-surfacing events that route items into the moderation queue (BC-ADM-1; bound to the Doc-2 §8 / Doc-3 mapping at content authoring). The producing module owns the event; Admin owns only its moderation-case effect (single-authorship).

## J-A7 — Dependency Surface (Pass-A consolidation, Part 1)

Per the frozen structure §J8 — DR-ADM-* carried; ownership unchanged.

| Marker | Owner (module) | Direction | Purpose (Part 1) |
|---|---|---|---|
| **DR-ADM-1** | Identity (Doc-4C, FROZEN) | consume | `check_permission` + platform-staff slug resolution |
| **DR-ADM-RFQ** | RFQ (Doc-4E, FROZEN) | reference | moderated RFQ subject (BC-ADM-1); RFQ owns its state |
| **DR-ADM-MKT** | Marketplace (Doc-4D, FROZEN) | reference + write-via-service + event-consumer | banned-vendor reference (BC-ADM-2; `VendorBanned` consumer, DD-3); category write-via-service (BC-ADM-3, DD-4) |
| **DR-ADM-OPS** | Operations (Doc-4F, FROZEN) | write-via-service | link-column write on the private record (BC-ADM-3; A-03); Operations owns the private record |
| **DR-ADM-PC** | Platform Core (Doc-4B, FROZEN) | consume | audit-write, outbox (for `VendorBanned`), UUIDv7, POLICY |

**No ownership transfer in any direction; no store written except via the owning module's service; `VendorBanned` delivery is Admin-authored (single-authorship).**

## J-A8 — Error Model (Pass-A consolidation, Part 1)

Doc-4A §12 closed class set only. **`REFERENCE` (definitive negative, `retryable:false`) ≠ `DEPENDENCY` (transient, `retryable:true`)**; **`STATE` (illegal-from-state) ≠ `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4). **Protected-fact handling:** where a moderation/ban/suggestion subject reference does not resolve, a definitive negative is `REFERENCE`; a platform-staff-scoped record that does not exist is `NOT_FOUND`. **Non-disclosure (§7.5):** link-suggestion content is never served to a vendor through any contract surface — an unauthorized read collapses to `NOT_FOUND` (no protected fact revealed). The hardened per-stage error registers are authored at Pass-B.

## J-A9 — AI-Agent Notes (Pass-A consolidation, Part 1)

- **Ownership boundaries:** Admin owns `moderation_cases` (BC-ADM-1), `ban_actions` (BC-ADM-2), and the three Suggestion roots (BC-ADM-3); each aggregate in exactly one BC; the decision-target's store remains its owner's (RFQ / Marketplace / Operations). The Suggestion three roots are **one aggregate in BC-ADM-3 — no split**.
- **Admin decides; the owning module stores:** category approval writes the category via the Marketplace service; link confirmation writes the link columns via the Operations service; a ban is Admin's decision, the vendor-profile status reflection is Marketplace's consumer effect.
- **Authorization:** `staff_can_moderate_rfq` (BC-ADM-1), `staff_can_ban` (BC-ADM-2), `staff_can_manage_categories` (category-suggestion decisions ONLY); missing-vendor + link decisions carry `[ESC-ADM-SLUG]` (no §7 staff slug; no slug invented); `staff_super_admin` override is flagged.
- **Event governance:** Admin produces **only `VendorBanned`** (single-authorship; Admin authors delivery); consumers own their effects; no event coined.
- **Procurement moat:** Admin makes **no** matching/routing/ranking/supplier-selection/award/procurement-eligibility decision.
- **Trust firewall:** Admin computes/owns **no** Trust/Performance/Verification/Governance score and **no** verification record (Trust stores; verification workflow is BC-ADM-5, Part 2).
- **Non-disclosure:** link-suggestion content is **never vendor-visible** through any contract surface.
- **No event/slug/audit-action/POLICY-key invention** — escalate via DR / `[ESC-ADM-*]`. Audience: Claude Code, Cursor, OpenAI Codex, backend, frontend, QA.

---

## Appendix A — BC-ADM-1/2/3 Part-1 Contract Inventory (Pass-A)

| # | Contract-ID | Name | Owning BC | Aggregate | Operation (template) | Actor | Permission family |
|---|---|---|---|---|---|---|---|
| 1 | `admin.create_moderation_case.v1` | Open Moderation Case | BC-ADM-1 | Moderation Case | 21.6 Admin / 21.5 System | Admin / System | `staff_can_moderate_rfq` / System |
| 2 | `admin.assign_moderation_case.v1` | Assign Moderation Case | BC-ADM-1 | Moderation Case | 21.6 Admin | Admin | `staff_can_moderate_rfq` |
| 3 | `admin.decide_moderation_case.v1` | Decide Moderation Case | BC-ADM-1 | Moderation Case | 21.6 Admin | Admin | `staff_can_moderate_rfq` |
| 4 | `admin.get_moderation_case.v1` / `admin.list_moderation_cases.v1` | Moderation reads | BC-ADM-1 | Moderation Case | 21.3 Query | Admin | `staff_can_moderate_rfq` |
| 5 | `admin.issue_ban.v1` | Issue Ban | BC-ADM-2 | Ban Action | 21.6 Admin | Admin | `staff_can_ban` |
| 6 | `admin.lift_ban.v1` | Lift Ban | BC-ADM-2 | Ban Action | 21.6 Admin | Admin | `staff_can_ban` |
| 7 | `admin.expire_ban.v1` | Expire Ban | BC-ADM-2 | Ban Action | 21.5 System | System | none (System) |
| 8 | `admin.get_ban_action.v1` / `admin.list_ban_actions.v1` | Ban reads | BC-ADM-2 | Ban Action | 21.3 Query | Admin | `staff_can_ban` |
| 9 | `admin.decide_category_suggestion.v1` | Decide Category Suggestion | BC-ADM-3 | Suggestion (`category_suggestions`) | 21.6 Admin | Admin | `staff_can_manage_categories` |
| 10 | `admin.triage_missing_vendor_suggestion.v1` / `admin.close_missing_vendor_suggestion.v1` | Missing-Vendor triage | BC-ADM-3 | Suggestion (`missing_vendor_suggestions`) | 21.6 Admin | Admin | `[ESC-ADM-SLUG]` |
| 11 | `admin.confirm_link_suggestion.v1` / `admin.dismiss_link_suggestion.v1` | Link-Candidate decision | BC-ADM-3 | Suggestion (`link_suggestions`) | 21.6 Admin | Admin | `[ESC-ADM-SLUG]` |
| 12 | `admin.get_suggestion.v1` / `admin.list_suggestions.v1` | Suggestion reads | BC-ADM-3 | Suggestion | 21.3 Query | Admin | `staff_can_manage_categories` / `[ESC-ADM-SLUG]` |

*Skeleton inventory — working contract names (Doc-4A §21 namespace `admin_`). Pass-B finalizes per-Contract-ID payloads, validation order, error codes, and any contract split. No contract instantiated beyond this Pass-A record. `VendorBanned` is the sole Admin-produced Doc-2 §8 event (BC-ADM-2). BC-ADM-4/5/6 are authored in Part 2.*

## Appendix B — Carried Markers (Pass-A Part 1; UNCHANGED)

**DR-ADM-1** (Identity), **DR-ADM-RFQ** (RFQ — moderation reference), **DR-ADM-MKT** (Marketplace — ban reference + `VendorBanned` consumer DD-3 + category write DD-4), **DR-ADM-OPS** (Operations — link-column write, A-03), **DR-ADM-PC** (Platform Core). Carried markers pointed at Admin resolved by this Part as the owning module: **DD-3** (vendor ban — `VendorBanned` production + Marketplace reflect consumer), **DD-4** (category approval), **DF-5** (link suggestions); **DD-8** (blocked ban-lift) carried on the Marketplace side. Escalation markers: **`[ESC-ADM-SLUG]`** (missing-vendor + link decisions — no §7 staff slug; no slug invented), **`[ESC-ADM-AUDIT]`** (only if a mutation is unenumerated in §9 — none required for Part-1 mutations; ban-expiry nearest-by-pointer), **`[ESC-ADM-POLICY]`** (Admin tunables absent from Doc-3 §12.2 — `moderation.*` named; others carried), **`[ESC-ADM-EVENT]`** (none coined; `VendorBanned` only). **Carried, never resolved here**; resolution is an additive patch to the owning document through its named Doc-2 channel.

---

*End of Doc-4J — Admin Operations — Content Pass-A Part 1 v1.0. Pass-A depth — BC overviews, aggregate definitions, contract **inventory** (no 12-section hardening), authorization/audit/event/dependency consolidations, error model, AI-agent notes — for BC-ADM-1 Moderation, BC-ADM-2 Enforcement, BC-ADM-3 Suggestions. Authored against `Doc-4J_Structure_FROZEN_v1.0` (sole structural authority) and the frozen corpus (Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4I FROZEN). BC-ADM-4/5/6 are Part 2. State machines verbatim Doc-2 §3.9 (`moderation_cases open→approved/rejected/escalated`; `ban_actions active→lifted→expired`; `category_suggestions submitted→approved/rejected`; `missing_vendor_suggestions submitted→triaged→closed`; `link_suggestions suggested→confirmed/dismissed`); the Suggestion aggregate's three roots remain one aggregate in BC-ADM-3 (no split — Doc-2 §2). Produced events: `VendorBanned` only (BC-ADM-2; single-authorship; Admin authors delivery — DD-3). Authorization: `staff_can_moderate_rfq` / `staff_can_ban` / `staff_can_manage_categories` (category-suggestion decisions ONLY) + `[ESC-ADM-SLUG]` for missing-vendor + link decisions (no slug invented); `staff_super_admin` flagged. Audit: Doc-2 §9 Admin domain by pointer. "Admin decides; the owning module stores" — category via Marketplace service, link columns via Operations service, ban status reflection is Marketplace's; link-suggestion content never vendor-visible (non-disclosure). The procurement moat (no matching/routing/ranking/supplier-selection/award/eligibility) and the trust firewall (no score, no verification record — Trust stores) are preserved; nothing invented. Authorized next stage after Hard Review → Pass-A Patch → Patch Verification: Doc-4J Pass-A Part 2 (BC-ADM-4/5/6) → Pass-A FROZEN → Pass-B.*
