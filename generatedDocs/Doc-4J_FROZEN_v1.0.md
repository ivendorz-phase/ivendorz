# Doc-4J_FROZEN_v1.0 — Admin Operations — API & Integration Contracts — Module (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** |
| Version | v1.0 |
| Module | Doc-4J |
| Module Name | Admin Operations |
| Schema | `admin` |
| Namespace | `admin_` |
| Governance base | `Doc-4J_PassA_FROZEN_v1.0` (FROZEN) |
| Implementation base | `Doc-4J_PassB_Content_v1.0`, as amended by `Doc-4J_PassB_Patch_v1.0` (F4J-PB1-M1 applied inline) |
| Structure authority | `Doc-4J_Structure_FROZEN_v1.0` (FROZEN) |
| Freeze authority | `Doc-4J_Final_Freeze_Audit_v1.0` (FINAL FREEZE APPROVED) |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4I v1.0, Doc-4J_Structure_FROZEN_v1.0, Doc-4J_PassA_FROZEN_v1.0 — all FROZEN |
| Scope | All six bounded contexts: BC-ADM-1 Moderation · BC-ADM-2 Enforcement · BC-ADM-3 Suggestions · BC-ADM-4 Data Import · BC-ADM-5 Verification Workflow · BC-ADM-6 Vendor Outreach |
| Authoritative module specification | Module 8 — Admin Operations — implementation-grade, frozen |

## §H — Pass-B Hardening Conventions (stated once; bound by pointer per BC)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. **Platform-staff authorization (2–4)** is established before semantic processing (6–9). Each Stage-Validation row names the **allowed source state(s)**, **forbidden source state(s)**, the **validation gate**, and the **STATE/failure class**. **Query contracts: Stage 8 BUSINESS present** — where no business rule applies, stated `n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract`.
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `numeric`, `bool`, `jsonb`, `timestamptz`. **Required** = present and non-null (absence → SYNTAX, Doc-4A §9). **Immutability:** `at-create` (set once, never updated), `mutable` (updatable within lifecycle), `system-set` (server-assigned). **Source:** `request` / `system` / `cross-module-ref` (bare UUID, service-validated). **Owner:** the owning BC (Admin); cross-module refs name the owning module.
- **H.3 — Authorization (Doc-4A §6; Doc-2 §7; Doc-4C consumed).** Three-layer check — active platform-staff **Membership + Permission Slug + Resource Scope** — for the **platform-staff slug space (§5.6, no active org context)**. Slugs only, from Doc-2 §7; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C). Frozen slugs: `staff_can_moderate_rfq` (BC-ADM-1), `staff_can_ban` (BC-ADM-2), `staff_can_manage_categories` (BC-ADM-3 category-suggestion decisions ONLY), `staff_can_verify` (BC-ADM-5); `[ESC-ADM-SLUG]` for missing-vendor + link decisions (BC-ADM-3), import (BC-ADM-4), outreach (BC-ADM-6). `staff_super_admin` is the audited-and-flagged override. **Admin actions are not delegation-eligible** (platform-staff; no representative-org scenario) — Stage 5 DELEGATION is n/a throughout.
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes `admin_<domain>_<code>` (Appendix B namespace `admin_`). **`REFERENCE` (a supplied cross-module reference does not exist / definitive negative; `retryable:false`) ≠ `DEPENDENCY` (an owning service transiently unavailable; `retryable:true`)**; **`STATE` (operation illegal from current state) ≠ `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4). A platform-staff-scoped record that does not resolve → `NOT_FOUND`. **Non-disclosure (§7.5):** link-suggestion content is never served to a vendor; an unauthorized read collapses to `NOT_FOUND`.
- **H.5 — State machines (Doc-2 §3.9/§10.9; Doc-4A §13; frozen Pass-A).** The eight frozen lifecycles: `moderation_cases open → approved / rejected / escalated`; `ban_actions active → lifted → expired`; `category_suggestions submitted → approved / rejected`; `missing_vendor_suggestions submitted → triaged → closed`; `link_suggestions suggested → confirmed / dismissed`; `import_jobs queued → processing → completed / failed`; `verification_tasks queued → in_review → decided`; `outreach_campaigns draft → running → completed`. Every transition cites allowed source / forbidden source / target; all others → `STATE`. **No edge added or modified.**
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the §9 action / marker, actor attribution (`Admin`/`System`), object scope, in-transaction timing. Reads not audited (§17.1). Doc-2 §9 Admin domain enumerated actions bind by pointer (moderation decisions / ban issue/lift / category approve-delete / suggestion decisions / import job execution / link confirm-dismiss); **ban expiry, verification-task workflow, and outreach are not separately enumerated → `[ESC-ADM-AUDIT]`** (nearest §9 action by pointer; no action invented). `staff_super_admin` actions additionally flagged (Doc-2 §7).
- **H.7 — Events (Doc-2 §8).** **`VendorBanned` is the sole Admin-owned Doc-2 §8 event** — producer `admin`/`ban_actions`, **BC-ADM-2**, trigger `admin.issue_ban.v1` (single-authorship; Admin authors production/delivery, Doc-4A §4.4; consumers — Marketplace reflect DD-3, Communication notify, Trust Protection freeze — own their effects). **BC-ADM-1, BC-ADM-3, BC-ADM-4, BC-ADM-5, BC-ADM-6 produce NO Doc-2 §8 event.** Where a contract emits nothing, **No Event** is the binding. No event coined; no 21.2 integration contract authored except the `VendorBanned` delivery (Admin's).
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + dedup window (`[ESC-ADM-POLICY]`; no `admin` dedup key registered — no key invented). System-triggered effects (auto-queue, process job, expiry) are idempotent on their source signal/`job_id`. Replay within window → same result, no duplicate row, no duplicate audit. Queries (21.3) `Idempotency: not-applicable` (§14.1).
- **H.9 — Concurrency (Doc-4A §14).** State-transition mutations use **optimistic concurrency** via `expected_state` (or a row `version`); a lost race → `CONFLICT` (distinct from `STATE`). Append-child writes (`import_rows`, `outreach_contacts`) are additive (no row-revision race). Read models are eventually consistent with the owning aggregate.
- **H.10 — Data retention & indexing (Doc-2 §10.9; Doc-4B; ADR).** All `admin.*` entities are **platform-owned**; retention/archive/purge follow platform governance (Doc-2 §10.11 soft-delete where applicable; audit records immutable per Doc-2 §9). Specific retention/purge windows that are runtime-tunable carry **`[ESC-ADM-POLICY]`** (no key invented). Indexing binds the Doc-2 §10.9 anchor columns (subject/assignee/issuer/state) + audit-time; concrete index DDL is development-document scope (Doc-4A §0) — Pass-B fixes the **index intent** (primary / search / audit), not the physical DDL.

**Per-BC record shape (Pass-B).** Each bounded context below is hardened with: **Field Registry · Value Objects · Read Models · Idempotency · Concurrency · Stage Validation · Data Retention · Index Strategy · Contract Precision (request/response/error matrix/authorization matrix/audit binding/dependency touchpoints) · AI-Agent Precision.** Contract groups and their Pass-A operations/actors/permissions/lifecycles/events are exactly as frozen.

---

# BC-ADM-1 — Moderation (Moderation Case aggregate)

**Pass-A binding.** Owning BC BC-ADM-1 · aggregate Moderation Case (`moderation_cases`) · slug `staff_can_moderate_rfq` · lifecycle `open → approved / rejected / escalated` · audit §9 "moderation decisions" by pointer · events: No Event · deps DR-ADM-RFQ / DR-ADM-1 / DR-ADM-PC. Contracts: `create_moderation_case` · `assign_moderation_case` · `decide_moderation_case` · `get_moderation_case` / `list_moderation_cases`.

**Field Registry — `moderation_cases`** (Doc-2 §10.9)

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create (system-set) | system (UUIDv7) | BC-ADM-1 |
| `subject_id` | `uuid` | yes | at-create | request (cross-module-ref) | RFQ (DR-ADM-RFQ) — referenced |
| `subject_type` | `enum<rfq\|…>` | yes | at-create | request | BC-ADM-1 (discriminator) |
| `assigned_to` | `uuid` | no (nullable) | mutable | request (staff user) | Identity (DR-ADM-1) — referenced |
| `state` | `enum<open\|approved\|rejected\|escalated>` | yes | system-set (transition-only) | system | BC-ADM-1 |
| `reason` | `text` | conditional (on decide) | mutable | request | BC-ADM-1 |
| `created_at` / `updated_at` | `timestamptz` | yes | system-set | system | BC-ADM-1 |

**Value Objects.** **SubjectRef** (`subject_id` + `subject_type`) — the moderated subject; an opaque cross-module reference (RFQ), never an RFQ entity copy. **ModerationDecision** (the `state`∈{approved,rejected,escalated} + `reason` recorded at decide) — a value of the case, not a separate entity.

**Read Models.** *list view* (`id`, `subject_type`, `state`, `assigned_to`, `created_at` — the moderation queue); *detail view* (full case + `reason`); *admin search view* (filter by `state`/`subject_type`/`assigned_to`); *audit view* (the §9 "moderation decisions" trail — staff-only). All platform-staff-scoped (`staff_can_moderate_rfq`).

**Idempotency.** `create` keyed on (`subject_id`,`subject_type`) within the dedup window (`[ESC-ADM-POLICY]`) → one case, no duplicate; `assign`/`decide` keyed on (`id`, target) → terminal-idempotent (re-deciding a decided case within the window returns the same result, no second transition/audit).

**Concurrency.** `decide`/`assign` assert `expected_state`; a lost race → `CONFLICT`. `open` is the only mutable-from state for `decide`.

**Stage Validation** (per transition; Doc-4A §11.2 order; H.5)

| Transition | Allowed source | Forbidden source (→ `STATE`) | Validation gate (Stage) | Failure class |
|---|---|---|---|---|
| create → `open` | n/a (create) | (already-existing case for subject is idempotent, not new) | 1 SYNTAX subject ids; 2–3 staff+`staff_can_moderate_rfq`; 7 REFERENCE `subject_id` resolves at RFQ | `VALIDATION`/`AUTHORIZATION`/`REFERENCE`(def.)·`DEPENDENCY`(transient) |
| assign (within `open`) | `open` | `approved`/`rejected`/`escalated` | 3 AUTHZ; 7 REFERENCE `assigned_to` resolves at Identity | `STATE`/`AUTHORIZATION`/`REFERENCE` |
| decide → `approved`/`rejected`/`escalated` | `open` | `approved`/`rejected`/`escalated` (terminal) | 6 STATE `open`; `expected_state` match else `CONFLICT`; 8 BUSINESS decision feeds Doc-3 pipeline (no procurement decision — moat) | `STATE`/`CONFLICT` |

**Data Retention.** Moderation cases retained per platform governance; closed (`approved`/`rejected`) cases archivable after the retention window (`[ESC-ADM-POLICY]`); the §9 audit trail is immutable (Doc-2 §9). No hard purge of decided cases while their audit references persist.

**Index Strategy.** *primary* (`id`); *search* (`state`, `subject_type`, `assigned_to`, `created_at`); *audit* (audit-record `entity_id`=`moderation_cases.id`, time-ordered).

**Contract Precision.**
- `admin.create_moderation_case.v1` — **Request:** `subject_id:uuid`, `subject_type:enum` (System auto-queue variant carries the pipeline source). **Response:** `case_id:uuid`, `state=open`, `reference_id`. **Authorization:** Admin · `staff_can_moderate_rfq` / System · platform scope. **Audit:** §9 "moderation decisions" by pointer, `entity_type=moderation_cases`. **Errors:** `VALIDATION`/`AUTHORIZATION`/`REFERENCE`/`DEPENDENCY`/`SYSTEM`. **Dependency touchpoints:** DR-ADM-RFQ (subject), DR-ADM-1, DR-ADM-PC.
- `admin.assign_moderation_case.v1` — **Request:** `case_id`, `assigned_to`. **Response:** `case_id`, `assigned_to`, `reference_id`. **Authz:** `staff_can_moderate_rfq`. **Audit:** §9 by pointer. **Errors:** `NOT_FOUND`(case)/`STATE`/`REFERENCE`(assignee)/`DEPENDENCY`/`SYSTEM`.
- `admin.decide_moderation_case.v1` — **Request:** `case_id`, `decision:enum<approved|rejected|escalated>`, `reason:text`, `expected_state`. **Response:** `case_id`, `state`, `reference_id`. **Authz:** `staff_can_moderate_rfq`. **Audit:** §9 "moderation decisions" by pointer. **Errors:** `NOT_FOUND`/`STATE`/`CONFLICT`/`VALIDATION`/`DEPENDENCY`/`SYSTEM`. **Error Boundary:** `STATE`≠`CONFLICT`; `REFERENCE`≠`DEPENDENCY`. **Dependency touchpoints:** decision feeds the Doc-3 RFQ pipeline; RFQ owns its state (DR-ADM-RFQ).
- `admin.get_moderation_case.v1` / `admin.list_moderation_cases.v1` — **Request:** `case_id` (get) / `filter`+pagination (list). **Response:** detail / list view. **Authz:** `staff_can_moderate_rfq`. **Audit:** none (read, §17.1). **Stage 8:** n/a — read.

**AI-Agent Precision.** *Ownership boundary:* BC-ADM-1 owns `moderation_cases`; the RFQ is a bare-UUID reference (DR-ADM-RFQ), never owned. *Forbidden actions:* no RFQ state write (RFQ owns its lifecycle); no matching/routing/ranking/award (moat); no score (firewall). *Cross-module restrictions:* read/reference RFQ by service; the decision feeds the Doc-3 pipeline, it does not transition the RFQ here. *Non-authority surfaces:* moderation approves/rejects/escalates the **case**, never a procurement outcome.

---

# BC-ADM-2 — Enforcement (Ban Action aggregate) — sole `VendorBanned` producer

**Pass-A binding.** Owning BC BC-ADM-2 · aggregate Ban Action (`ban_actions`) · slug `staff_can_ban` · lifecycle `active → lifted → expired` (expiry only from `lifted`) · audit §9 "ban issue/lift" by pointer; **ban expiry → `[ESC-ADM-AUDIT]`** · **events: emits `VendorBanned` (sole Admin §8 event)** · deps DR-ADM-MKT / DR-ADM-1 / DR-ADM-PC. Contracts: `issue_ban` · `lift_ban` · `expire_ban` (System) · `get_ban_action` / `list_ban_actions`.

**Field Registry — `ban_actions`** (Doc-2 §10.9)

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create (system-set) | system | BC-ADM-2 |
| `subject_id` | `uuid` | yes | at-create | request (cross-module-ref) | Marketplace (DR-ADM-MKT) — referenced |
| `subject_type` | `enum<vendor_profile\|organization>` | yes | at-create | request | BC-ADM-2 (discriminator) |
| `scope` | `string` | yes | at-create | request | BC-ADM-2 |
| `reason` | `text` | yes | at-create | request | BC-ADM-2 |
| `public_banner` | `bool` | yes | mutable | request | BC-ADM-2 (banner public projection) |
| `state` | `enum<active\|lifted\|expired>` | yes | system-set (transition-only) | system | BC-ADM-2 |
| `issued_by` | `uuid` | yes | at-create | system (staff user) | Identity (DR-ADM-1) — referenced |
| `created_at` / `updated_at` | `timestamptz` | yes | system-set | system | BC-ADM-2 |

**Value Objects.** **SubjectRef** (`subject_id`+`subject_type`) — the banned vendor/org (Marketplace reference). **BanScope** (`scope`) — the ban's reach. **PublicBannerFlag** (`public_banner`) — the one public projection of an admin record. **BanReason** (`reason`) — value of the action.

**Read Models.** *list view* (`id`, `subject_type`, `state`, `public_banner`, `created_at`); *detail view* (full action); *admin search view* (filter by `state`/`subject_type`); *audit view* (§9 "ban issue/lift" trail). *(The public-banner projection is served read-side by Marketplace; BC-ADM-2 owns the `ban_actions` record.)*

**Idempotency.** `issue` keyed on (`subject_id`,`subject_type`,active-ban) within the dedup window → one active ban + one `VendorBanned` emission, no duplicate event; `lift`/`expire` terminal-idempotent.

**Concurrency.** `lift`/`expire` assert `expected_state`; a lost race → `CONFLICT`. `active → lifted` (lift); `lifted → expired` (expire, System); `expired` terminal.

**Stage Validation**

| Transition | Allowed source | Forbidden source (→ `STATE`) | Validation gate | Failure class |
|---|---|---|---|---|
| issue → `active` | n/a (create) | duplicate active ban for subject = idempotent | 1 SYNTAX; 3 AUTHZ `staff_can_ban`; 7 REFERENCE `subject_id` resolves at Marketplace; 8 BUSINESS enforcement decision (no procurement) | `VALIDATION`/`AUTHORIZATION`/`REFERENCE`·`DEPENDENCY` |
| lift → `lifted` | `active` | `lifted`/`expired` | 6 STATE `active`; `expected_state`; 8 BUSINESS DD-8 blocked-ban-lift governed Marketplace-side | `STATE`/`CONFLICT` |
| expire → `expired` (System) | `lifted` | `active`/`expired` (**expiry only from `lifted`**) | 6 STATE `lifted`; `expected_state` | `STATE`/`CONFLICT` |

**Data Retention.** Ban actions retained per platform governance; `expired`/`lifted` actions archivable after the retention window (`[ESC-ADM-POLICY]`); §9 audit immutable. The public-banner flag is cleared on lift/expire (Marketplace reflection).

**Index Strategy.** *primary* (`id`); *search* (`subject_id`, `subject_type`, `state`, `public_banner`); *audit* (`entity_id`=`ban_actions.id`).

**Contract Precision.**
- `admin.issue_ban.v1` — **Request:** `subject_id`, `subject_type:enum<vendor_profile|organization>`, `scope`, `reason`, `public_banner:bool`. **Response:** `ban_id`, `state=active`, `reference_id`. **Authz:** Admin · `staff_can_ban` · platform scope. **Audit:** §9 "ban issue/lift" by pointer, `entity_type=ban_actions`. **Events:** **emits `VendorBanned`** (Doc-2 §8; single-authorship; Admin authors delivery — DD-3; consumers Marketplace/Communication/Trust-Protection). **Errors:** `VALIDATION`/`AUTHORIZATION`/`REFERENCE`(subject)/`DEPENDENCY`/`SYSTEM`. **Dependency touchpoints:** DR-ADM-MKT (subject + reflect consumer), DR-ADM-1, DR-ADM-PC (outbox).
- `admin.lift_ban.v1` — **Request:** `ban_id`, `expected_state`. **Response:** `ban_id`, `state=lifted`, `reference_id`. **Authz:** `staff_can_ban`. **Audit:** §9 "ban issue/lift" by pointer. **Events:** No Event (lift-reflection is DD-8, Marketplace-side). **Errors:** `NOT_FOUND`/`STATE`/`CONFLICT`/`DEPENDENCY`/`SYSTEM`.
- `admin.expire_ban.v1` (System) — **Request:** `ban_id`, `expected_state=lifted`. **Response:** `Response: none` (21.5 System) / `state=expired`. **Authz:** System (no slug). **Audit:** **`[ESC-ADM-AUDIT]`** (ban expiry not separately §9-enumerated; nearest by pointer; no action invented). **Events:** No Event. **Errors:** `STATE`(not `lifted`)/`CONFLICT`/`DEPENDENCY`/`SYSTEM`. **Error Boundary:** `STATE`(illegal-from-state) ≠ `CONFLICT`.
- `admin.get_ban_action.v1` / `admin.list_ban_actions.v1` — **Request:** `ban_id` / `filter`+pagination. **Response:** detail / list view. **Authz:** `staff_can_ban`. **Audit:** none (read). **Stage 8:** n/a — read.

**AI-Agent Precision.** *Ownership boundary:* BC-ADM-2 owns `ban_actions`; the banned vendor/org is a Marketplace reference. *Forbidden actions:* no vendor-profile status write (Marketplace's `reflect_vendor_ban` consumer effect, DD-3); no score (firewall); no procurement decision (moat). *Cross-module restrictions:* emit `VendorBanned` via the Doc-4B outbox; Admin authors the delivery contract (single-authorship), consumers own their effects. *Non-authority surfaces:* a ban enforces; the vendor-status reflection and any notification are downstream consumers' — Admin never writes them.

---

# BC-ADM-3 — Suggestions (Suggestion aggregate — 3 roots; one aggregate, one BC, no split)

**Pass-A binding.** Owning BC BC-ADM-3 · aggregate Suggestion (roots `category_suggestions` / `missing_vendor_suggestions` / `link_suggestions`; **one aggregate, no split — Doc-2 §2**) · slugs **category → `staff_can_manage_categories` (category-suggestion decisions ONLY); missing-vendor → `[ESC-ADM-SLUG]`; link → `[ESC-ADM-SLUG]`** · lifecycles `category submitted → approved / rejected`, `missing-vendor submitted → triaged → closed`, `link suggested → confirmed / dismissed` · audit §9 "category approve/delete" / "suggestion decisions" / "link confirm/dismiss" by pointer · events: No Event · deps DR-ADM-MKT / DR-ADM-OPS / DR-ADM-1 / DR-ADM-PC. **Non-disclosure: link-suggestion content is never vendor-visible.** Contracts: `decide_category_suggestion` · `triage_missing_vendor_suggestion` / `close_missing_vendor_suggestion` · `confirm_link_suggestion` / `dismiss_link_suggestion` · `get_suggestion` / `list_suggestions`.

**Field Registry** (Doc-2 §10.9)

*`category_suggestions`:*

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create | system | BC-ADM-3 |
| `suggested_by_organization_id` | `uuid` | yes | at-create | request (cross-module-ref) | Identity org — referenced |
| `proposed_parent_category_id` | `uuid` | no | at-create | request (cross-module-ref) | Marketplace (DR-ADM-MKT) — referenced |
| `state` | `enum<submitted\|approved\|rejected>` | yes | system-set | system | BC-ADM-3 |

*`missing_vendor_suggestions`:*

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create | system | BC-ADM-3 |
| `suggested_by_organization_id` | `uuid` | yes | at-create | request | Identity org — referenced |
| `category_id` | `uuid` | no | at-create | request | Marketplace (DR-ADM-MKT) — referenced |
| `vendor_name` | `string` | yes | at-create | request | BC-ADM-3 |
| `contact_hint` | `string` | no | at-create | request | BC-ADM-3 |
| `state` | `enum<submitted\|triaged\|closed>` | yes | system-set | system | BC-ADM-3 |

*`link_suggestions`* (**never vendor-visible**):

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create | system | BC-ADM-3 |
| `private_vendor_record_id` | `uuid` | yes | at-create | request (cross-module-ref) | Operations (DR-ADM-OPS) — referenced |
| `vendor_profile_id` | `uuid` | yes | at-create | request (cross-module-ref) | Marketplace (DR-ADM-MKT) — referenced |
| `match_basis` | `enum<email\|phone\|trade_license>` | yes | at-create | system | BC-ADM-3 |
| `confidence` | `numeric` | yes | at-create | system | BC-ADM-3 |
| `confirmed_by` | `uuid` | no | mutable | system (staff user) | Identity — referenced |
| `state` | `enum<suggested\|confirmed\|dismissed>` | yes | system-set | system | BC-ADM-3 |

**Value Objects.** **SuggestionRef** (the root + `id`) — identifies which of the three suggestion roots. **LinkMatchBasis** (`match_basis` + `confidence`) — the candidate-match evidence (**never vendor-visible**). The three roots are **one Suggestion aggregate** (Doc-2 §2; no split at any pass).

**Read Models.** *list view* per root (category queue / missing-vendor queue / link-candidate queue); *detail view* per root; *admin search view* (by `state`); *audit view* (§9 trail). **Non-disclosure:** the link-candidate list/detail/search are **platform-staff-only**; link content is never served to a vendor through any read surface (unauthorized read → `NOT_FOUND`, §7.5).

**Idempotency.** Each decision keyed on (`root`,`id`,target) within the dedup window → terminal-idempotent (re-deciding a decided suggestion returns the same result, no second transition/audit; link confirmation re-applied is a no-op, no duplicate Operations link-write).

**Concurrency.** Each decision asserts `expected_state`; a lost race → `CONFLICT`.

**Stage Validation**

| Transition | Allowed source | Forbidden source (→ `STATE`) | Validation gate | Failure class |
|---|---|---|---|---|
| category decide → `approved`/`rejected` | `submitted` | `approved`/`rejected` | 3 AUTHZ `staff_can_manage_categories`; on approve, 7 REFERENCE category write via Marketplace service; 8 BUSINESS no procurement decision | `STATE`/`CONFLICT`/`AUTHORIZATION`/`REFERENCE`·`DEPENDENCY` |
| missing-vendor triage → `triaged` | `submitted` | `triaged`/`closed` | 3 AUTHZ `[ESC-ADM-SLUG]` | `STATE`/`AUTHORIZATION` |
| missing-vendor close → `closed` | `triaged` | `submitted` / `closed` | 6 STATE; `expected_state` | `STATE`/`CONFLICT` |
| link confirm → `confirmed` | `suggested` | `confirmed`/`dismissed` | 3 AUTHZ `[ESC-ADM-SLUG]`; 7 REFERENCE link-column write on the private record via Operations service; non-disclosure | `STATE`/`CONFLICT`/`REFERENCE`·`DEPENDENCY` |
| link dismiss → `dismissed` | `suggested` | `confirmed`/`dismissed` | 6 STATE; `expected_state` | `STATE`/`CONFLICT` |

**Data Retention.** Suggestions retained per platform governance; decided suggestions archivable after the retention window (`[ESC-ADM-POLICY]`); **link-suggestion records and their content remain platform-staff-only at all times** (never exposed on purge/archive surfaces); §9 audit immutable.

**Index Strategy.** *primary* (`id` per root); *search* (`state`, `suggested_by_organization_id`/`category_id` (cat/mv), `vendor_profile_id`/`private_vendor_record_id` (link — staff-only)); *audit* (`entity_id`).

**Contract Precision.**
- `admin.decide_category_suggestion.v1` — **Request:** `suggestion_id`, `decision:enum<approved|rejected>`, `expected_state`. **Response:** `suggestion_id`, `state`, `reference_id`. **Authz:** Admin · **`staff_can_manage_categories`** (category-suggestion decisions ONLY) · platform scope. **Audit:** §9 "category approve/delete" / "suggestion decisions" by pointer. **Events:** No Event. **Errors:** `NOT_FOUND`/`STATE`/`CONFLICT`/`REFERENCE`/`DEPENDENCY`/`SYSTEM`. **Dependency touchpoints:** on approve, write the category via the Marketplace service (DR-ADM-MKT; Marketplace owns the category).
- `admin.triage_missing_vendor_suggestion.v1` / `admin.close_missing_vendor_suggestion.v1` — **Request:** `suggestion_id`, `expected_state`. **Response:** `suggestion_id`, `state`, `reference_id`. **Authz:** Admin · **`[ESC-ADM-SLUG]`**. **Audit:** §9 "suggestion decisions" by pointer. **Errors:** `NOT_FOUND`/`STATE`/`CONFLICT`/`DEPENDENCY`/`SYSTEM`.
- `admin.confirm_link_suggestion.v1` / `admin.dismiss_link_suggestion.v1` — **Request:** `suggestion_id`, `expected_state`. **Response:** `suggestion_id`, `state`, `reference_id`. **Authz:** Admin · **`[ESC-ADM-SLUG]`**. **Audit:** §9 "link confirm/dismiss" by pointer. **Events:** No Event. **Errors:** `NOT_FOUND`/`STATE`/`CONFLICT`/`REFERENCE`/`DEPENDENCY`/`SYSTEM`. **Dependency touchpoints:** on confirm, write the link columns on `operations.private_vendor_records` via the Operations service (DR-ADM-OPS; A-03; Operations owns the private record). **Non-disclosure:** link content never vendor-visible.
- `admin.get_suggestion.v1` / `admin.list_suggestions.v1` — **Request:** `root`,`suggestion_id` / `root`+`filter`+pagination. **Response:** detail / list view (per root). **Authz:** `staff_can_manage_categories` (category) / `[ESC-ADM-SLUG]` (missing-vendor, link — link staff-only). **Audit:** none (read). **Stage 8:** n/a — read. **Non-disclosure:** link reads never served to a vendor.

**AI-Agent Precision.** *Ownership boundary:* BC-ADM-3 owns the three Suggestion roots (one aggregate); the category is Marketplace's, the private record is Operations'. *Forbidden actions:* no direct category write (Marketplace service only); no direct private-record write (Operations service only); **never expose link-suggestion content to vendors**; no procurement decision (moat); no score (firewall). *Cross-module restrictions:* category approval → Marketplace service; link confirmation → Operations service; both reference targets by UUID. *Non-authority surfaces:* Admin decides the suggestion; it does not own the resulting category or link.

---

# BC-ADM-4 — Data Import (Import Job aggregate)

**Pass-A binding.** Owning BC BC-ADM-4 · aggregate Import Job (`import_jobs` + child `import_rows`) · slug `[ESC-ADM-SLUG]` (no §7 import slug) · lifecycle `queued → processing → completed / failed` · audit §9 "import job execution" by pointer · events: No Event · deps DR-ADM-MKT / DR-ADM-1 / DR-ADM-PC. Contracts: `submit_import_job` · `process_import_job` (System) · `get_import_job` / `list_import_jobs` / `list_import_rows`.

**Field Registry** (Doc-2 §10.9)

*`import_jobs`:*

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create | system | BC-ADM-4 |
| `job_type` | `enum<categories\|vendor_seed>` | yes | at-create | request | BC-ADM-4 |
| `file_ref` | `string` | yes | at-create | request (storage ref, DR-ADM-PC) | Platform Core — referenced |
| `state` | `enum<queued\|processing\|completed\|failed>` | yes | system-set | system | BC-ADM-4 |
| `stats_jsonb` | `jsonb` | no | mutable (system) | system | BC-ADM-4 |
| `initiated_by` | `uuid` | yes | at-create | system (staff user) | Identity — referenced |

*`import_rows`* (append-only child):

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create | system | BC-ADM-4 |
| `import_job_id` | `uuid` | yes | at-create | system (FK → `import_jobs`) | BC-ADM-4 |
| `created_entity_id` | `uuid` | no | at-create | system (cross-module-ref) | Marketplace (DR-ADM-MKT) — referenced |
| (per-row outcome + errors) | `jsonb` | yes | at-create | system | BC-ADM-4 (VO RowError) |

**Value Objects.** **RowError** (the per-row outcome + error detail in `import_rows`). **ImportRowRef** (`import_job_id` + row `id`). Seeded entities (`created_entity_id`) are **Marketplace-owned**, created via the Marketplace service — referenced, never owned by Admin.

**Read Models.** *list view* (`id`, `job_type`, `state`, `initiated_by`, created_at); *detail view* (job + `stats_jsonb`); *admin search view* (by `state`/`job_type`); *audit view* (§9 "import job execution"); plus a *row view* (`list_import_rows`: per-row outcomes). Platform-staff-scoped (`[ESC-ADM-SLUG]`).

**Idempotency.** `submit` keyed on (`job_type`,`file_ref`) within the dedup window → one job, no duplicate; `process` idempotent on `job_id` (re-processing a `completed`/`failed` job within the window is a no-op; seeded-entity creation idempotent at the Marketplace service).

**Concurrency.** `process` advances `queued → processing → completed/failed` under optimistic concurrency (`expected_state`); a lost race → `CONFLICT`. Forward-only; `completed`/`failed` terminal. `import_rows` appended additively (no row-revision race).

**Stage Validation**

| Transition | Allowed source | Forbidden source (→ `STATE`) | Validation gate | Failure class |
|---|---|---|---|---|
| submit → `queued` | n/a (create) | duplicate (`job_type`,`file_ref`) idempotent | 1 SYNTAX `job_type`∈enum, `file_ref`; 3 AUTHZ `[ESC-ADM-SLUG]`; 7 REFERENCE `file_ref` resolves at storage | `VALIDATION`/`AUTHORIZATION`/`REFERENCE`·`DEPENDENCY` |
| process → `processing` | `queued` | `processing`/`completed`/`failed` | 6 STATE `queued`; `expected_state` | `STATE`/`CONFLICT` |
| process → `completed`/`failed` | `processing` | `queued`/`completed`/`failed` | 6 STATE `processing`; 8 BUSINESS seeded entities created via Marketplace service (no procurement decision) | `STATE`/`CONFLICT`/`DEPENDENCY` |

**Data Retention.** Jobs + rows retained per platform governance; `completed`/`failed` jobs archivable after the retention window (`[ESC-ADM-POLICY]`); `file_ref` storage lifecycle is Platform Core's; §9 audit immutable.

**Index Strategy.** *primary* (`id`; `import_rows.id`); *search* (`state`, `job_type`, `initiated_by`, `import_rows.import_job_id`); *audit* (`entity_id`=`import_jobs.id`).

**Contract Precision.**
- `admin.submit_import_job.v1` — **Request:** `job_type:enum<categories|vendor_seed>`, `file_ref:string`. **Response:** `job_id`, `state=queued`, `reference_id`. **Authz:** Admin · `[ESC-ADM-SLUG]` · platform scope. **Audit:** §9 "import job execution" by pointer, `entity_type=import_jobs`. **Events:** No Event. **Errors:** `VALIDATION`/`AUTHORIZATION`/`REFERENCE`(file)/`DEPENDENCY`/`SYSTEM`. **Dependency touchpoints:** DR-ADM-PC (file-ref), DR-ADM-1, DR-ADM-MKT (seed target).
- `admin.process_import_job.v1` (System) — **Request:** `job_id`, `expected_state`. **Response:** `Response: none` (21.5 System) / terminal `state`. **Authz:** System (no slug). **Audit:** §9 "import job execution" by pointer. **Events:** No Event. **Errors:** `STATE`/`CONFLICT`/`REFERENCE`(seed target)/`DEPENDENCY`(Marketplace service)/`SYSTEM`. **Error Boundary:** `STATE`≠`CONFLICT`; `REFERENCE`≠`DEPENDENCY`. **Dependency touchpoints:** seeded entities via Marketplace service (DR-ADM-MKT; Marketplace owns them).
- `admin.get_import_job.v1` / `admin.list_import_jobs.v1` / `admin.list_import_rows.v1` — **Request:** `job_id` / filter+pagination / `job_id`+pagination. **Response:** detail / list / row view. **Authz:** `[ESC-ADM-SLUG]`. **Audit:** none (read). **Stage 8:** n/a — read.

**AI-Agent Precision.** *Ownership boundary:* BC-ADM-4 owns `import_jobs`/`import_rows`; seeded entities are Marketplace-owned. *Forbidden actions:* no direct Marketplace-entity creation (Marketplace service only); no procurement decision (moat); no score (firewall). *Cross-module restrictions:* seeding via the owning Marketplace service; `created_entity_id` is a reference. *Non-authority surfaces:* import loads data; it does not own the seeded categories/vendors.

---

# BC-ADM-5 — Verification Workflow (Verification Task aggregate) — firewall: Admin decides, Trust stores

**Pass-A binding.** Owning BC BC-ADM-5 · aggregate Verification Task (`verification_tasks`, **workflow only**) · slug `staff_can_verify` · lifecycle `queued → in_review → decided` · audit **`[ESC-ADM-AUDIT]`** (verification-task workflow not §9-enumerated) · events: No Event · deps DR-ADM-TRUST / DR-ADM-1 / DR-ADM-PC. **Firewall: `verification_tasks ≠ trust.verification_records` and `≠ trust.verification_decisions`; the decision content is Trust-stored; Admin owns no verification record, computes no score.** Contracts: `queue_verification_task` · `assign_verification_task` · `decide_verification_task` · `get_verification_task` / `list_verification_tasks`.

**Field Registry — `verification_tasks`** (Doc-2 §10.9; workflow only)

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create | system | BC-ADM-5 |
| `verification_record_id` | `uuid` | yes | at-create | request (cross-module-ref) | **Trust (DR-ADM-TRUST) — referenced (Trust owns the record)** |
| `assigned_to` | `uuid` | no | mutable | request (staff user) | Identity — referenced |
| `state` | `enum<queued\|in_review\|decided>` | yes | system-set | system | BC-ADM-5 |
| `created_at` / `updated_at` | `timestamptz` | yes | system-set | system | BC-ADM-5 |

*(The approve/reject **decision content** is NOT a field here — it lives in `trust.verification_decisions`, Trust-owned. The task carries only workflow state + the `verification_record_id` reference.)*

**Value Objects.** **DecisionRef** (`verification_record_id`) — the Trust-owned verification record the workflow references. **No `VerificationDecision` value is owned here** — the decision is Trust's (firewall); a "VerificationDecisionRef" is exactly this `DecisionRef` pointer, never the decision content.

**Read Models.** *list view* (`id`, `state`, `assigned_to`, `verification_record_id`, created_at — the verification queue); *detail view* (task workflow + the `verification_record_id` reference; the decision content is read from Trust, not stored here); *admin search view* (by `state`/`assigned_to`); *audit view* (`[ESC-ADM-AUDIT]` workflow trail). Platform-staff-scoped (`staff_can_verify`); Verification Admins hold no finance slugs (Doc-2 §7).

**Idempotency.** `queue` keyed on `verification_record_id` within the dedup window → one task, no duplicate; `assign`/`decide` terminal-idempotent (re-deciding a `decided` task within the window is a no-op, no second workflow transition/audit, no second Trust write).

**Concurrency.** `assign`/`decide` assert `expected_state`; a lost race → `CONFLICT`. `queued → in_review` (assign); `in_review → decided` (decide); `decided` terminal.

**Stage Validation**

| Transition | Allowed source | Forbidden source (→ `STATE`) | Validation gate | Failure class |
|---|---|---|---|---|
| queue → `queued` | n/a (create) | duplicate `verification_record_id` idempotent | 1 SYNTAX; 3 AUTHZ `staff_can_verify`/System; 7 REFERENCE `verification_record_id` resolves at Trust | `VALIDATION`/`AUTHORIZATION`/`REFERENCE`·`DEPENDENCY` |
| assign → `in_review` | `queued` | `in_review`/`decided` | 3 AUTHZ `staff_can_verify`; 6 STATE `queued`; `expected_state`; 7 REFERENCE `assigned_to` at Identity | `STATE`/`CONFLICT`/`REFERENCE` |
| decide → `decided` | `in_review` | `queued`/`decided` | 6 STATE `in_review`; `expected_state`; 8 BUSINESS the verification decision is recorded into `trust.verification_decisions` via the Trust service (**Trust stores; Admin owns no record/score — firewall**) | `STATE`/`CONFLICT`/`DEPENDENCY`(Trust service) |

**Data Retention.** Workflow tasks retained per platform governance; `decided` tasks archivable after the retention window (`[ESC-ADM-POLICY]`); **the verification record/decision is retained by Trust (not here)**; `[ESC-ADM-AUDIT]` workflow audit immutable.

**Index Strategy.** *primary* (`id`); *search* (`state`, `assigned_to`, `verification_record_id`); *audit* (`entity_id`=`verification_tasks.id`).

**Contract Precision.**
- `admin.queue_verification_task.v1` — **Request:** `verification_record_id:uuid` (System auto-queue variant carries the verification-request source). **Response:** `task_id`, `state=queued`, `reference_id`. **Authz:** Admin · `staff_can_verify` / System · platform scope. **Audit:** **`[ESC-ADM-AUDIT]`** (verification-task workflow not separately §9-enumerated; nearest §9 action by pointer; no action invented), `entity_type=verification_tasks`. **Events:** No Event. **Errors:** `VALIDATION`/`AUTHORIZATION`/`REFERENCE`(record)/`DEPENDENCY`/`SYSTEM`. **Dependency touchpoints:** DR-ADM-TRUST (record reference), DR-ADM-1, DR-ADM-PC.
- `admin.assign_verification_task.v1` — **Request:** `task_id`, `assigned_to`, `expected_state`. **Response:** `task_id`, `state=in_review`, `reference_id`. **Authz:** `staff_can_verify`. **Audit:** **`[ESC-ADM-AUDIT]`**. **Errors:** `NOT_FOUND`/`STATE`/`CONFLICT`/`REFERENCE`(assignee)/`DEPENDENCY`/`SYSTEM`.
- `admin.decide_verification_task.v1` — **Request:** `task_id`, `decision` (passed to Trust; not stored here), `expected_state`. **Response:** `task_id`, `state=decided`, `reference_id`. **Authz:** `staff_can_verify`. **Audit:** **`[ESC-ADM-AUDIT]`** (workflow transition; the decision content is audited by Trust where Trust stores it). **Events:** No Event. **Errors:** `NOT_FOUND`/`STATE`/`CONFLICT`/`DEPENDENCY`(Trust service)/`SYSTEM`. **Error Boundary:** `STATE`≠`CONFLICT`; `REFERENCE`≠`DEPENDENCY`. **Dependency touchpoints:** decision recorded via the Trust service (DR-ADM-TRUST; **Trust stores the record/decision and any score — firewall**).
- `admin.get_verification_task.v1` / `admin.list_verification_tasks.v1` — **Request:** `task_id` / filter+pagination. **Response:** detail / list view. **Authz:** `staff_can_verify`. **Audit:** none (read). **Stage 8:** n/a — read.

**AI-Agent Precision.** *Ownership boundary:* BC-ADM-5 owns `verification_tasks` (workflow only); **Trust owns `verification_records` / `verification_decisions` and any Trust/Performance/Verification/Governance score**. *Forbidden actions:* **never store a verification decision/score in `verification_tasks`** (firewall — Trust stores via service); no procurement decision (moat). *Cross-module restrictions:* the decision is recorded via the Trust service; the task references the record by UUID. *Non-authority surfaces:* Admin decides the **workflow**; Trust owns the verification record/decision and any score.

---

# BC-ADM-6 — Vendor Outreach (Outreach Campaign aggregate) — moat: informational only, no procurement routing

**Pass-A binding.** Owning BC BC-ADM-6 · aggregate Outreach Campaign (`outreach_campaigns` + child `outreach_contacts`) · slug `[ESC-ADM-SLUG]` (no §7 outreach slug) · lifecycle `draft → running → completed` · audit **`[ESC-ADM-AUDIT]`** (outreach not §9-enumerated) · events: No Event · deps DR-ADM-MKT / DR-ADM-1 / DR-ADM-PC. **Moat: vendor outreach is informational acquisition only — no matching/routing/ranking/supplier-selection/award/eligibility.** Contracts: `create_outreach_campaign` · `run_outreach_campaign` / `complete_outreach_campaign` · `add_outreach_contact` / `update_outreach_contact` · `get_outreach_campaign` / `list_outreach_campaigns`.

**Field Registry** (Doc-2 §10.9)

*`outreach_campaigns`:*

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create | system | BC-ADM-6 |
| `state` | `enum<draft\|running\|completed>` | yes | system-set | system | BC-ADM-6 |
| `created_at` / `updated_at` | `timestamptz` | yes | system-set | system | BC-ADM-6 |

*`outreach_contacts`* (child):

| field_name | type | required | immutability | source | owner |
|---|---|---|---|---|---|
| `id` | `uuid` | yes | at-create | system | BC-ADM-6 |
| `outreach_campaign_id` | `uuid` | yes | at-create | system (FK → `outreach_campaigns`) | BC-ADM-6 |
| `vendor_claim_record_id` / `vendor_profile_id` | `uuid` | no | mutable | request (cross-module-ref) | Marketplace (DR-ADM-MKT) — referenced |
| (invite pipeline state) | `jsonb` | no | mutable | system | BC-ADM-6 |

**Value Objects.** **OutreachContactRef** (`outreach_campaign_id` + contact `id`; target `vendor_claim_record_id`/`vendor_profile_id` Marketplace reference). The target vendor is **Marketplace-owned** — referenced, never owned by Admin.

**Read Models.** *list view* (`id`, `state`, created_at); *detail view* (campaign + contacts); *admin search view* (by `state`); *audit view* (`[ESC-ADM-AUDIT]` trail). Platform-staff-scoped (`[ESC-ADM-SLUG]`).

**Idempotency.** `create` keyed on the campaign request within the dedup window; `run`/`complete` terminal-idempotent; `add_contact` keyed on (`campaign_id`,target) → no duplicate contact.

**Concurrency.** `run`/`complete` assert `expected_state`; a lost race → `CONFLICT`. `draft → running` (run); `running → completed` (complete); `completed` terminal. Contacts appended additively.

**Stage Validation**

| Transition | Allowed source | Forbidden source (→ `STATE`) | Validation gate | Failure class |
|---|---|---|---|---|
| create → `draft` | n/a (create) | — | 1 SYNTAX; 3 AUTHZ `[ESC-ADM-SLUG]` | `VALIDATION`/`AUTHORIZATION` |
| run → `running` | `draft` | `running`/`completed` | 6 STATE `draft`; `expected_state`; 8 BUSINESS informational outreach only (no procurement routing — moat) | `STATE`/`CONFLICT` |
| complete → `completed` | `running` | `draft`/`completed` | 6 STATE `running`; `expected_state` | `STATE`/`CONFLICT` |
| add/update contact | campaign `draft`/`running` | campaign `completed` | 7 REFERENCE target `vendor_*_id` resolves at Marketplace | `STATE`/`REFERENCE`·`DEPENDENCY` |

**Data Retention.** Campaigns + contacts retained per platform governance; `completed` campaigns archivable after the retention window (`[ESC-ADM-POLICY]`); §9/`[ESC-ADM-AUDIT]` audit immutable.

**Index Strategy.** *primary* (`id`; `outreach_contacts.id`); *search* (`state`, `outreach_contacts.outreach_campaign_id`, target `vendor_*_id`); *audit* (`entity_id`).

**Contract Precision.**
- `admin.create_outreach_campaign.v1` — **Request:** campaign attributes. **Response:** `campaign_id`, `state=draft`, `reference_id`. **Authz:** Admin · `[ESC-ADM-SLUG]` · platform scope. **Audit:** **`[ESC-ADM-AUDIT]`** (outreach not §9-enumerated; nearest by pointer; no action invented), `entity_type=outreach_campaigns`. **Events:** No Event. **Errors:** `VALIDATION`/`AUTHORIZATION`/`DEPENDENCY`/`SYSTEM`.
- `admin.run_outreach_campaign.v1` / `admin.complete_outreach_campaign.v1` — **Request:** `campaign_id`, `expected_state`. **Response:** `campaign_id`, `state`, `reference_id`. **Authz:** `[ESC-ADM-SLUG]`. **Audit:** **`[ESC-ADM-AUDIT]`**. **Errors:** `NOT_FOUND`/`STATE`/`CONFLICT`/`DEPENDENCY`/`SYSTEM`. **Moat:** informational only — no matching/routing/ranking/award.
- `admin.add_outreach_contact.v1` / `admin.update_outreach_contact.v1` — **Request:** `campaign_id`, target `vendor_*_id`, contact fields. **Response:** `contact_id`, `reference_id`. **Authz:** `[ESC-ADM-SLUG]`. **Audit:** **`[ESC-ADM-AUDIT]`**. **Errors:** `NOT_FOUND`/`STATE`(campaign completed)/`REFERENCE`(target)/`DEPENDENCY`/`SYSTEM`. **Dependency touchpoints:** Marketplace target reference (DR-ADM-MKT).
- `admin.get_outreach_campaign.v1` / `admin.list_outreach_campaigns.v1` — **Request:** `campaign_id` / filter+pagination. **Response:** detail / list view. **Authz:** `[ESC-ADM-SLUG]`. **Audit:** none (read). **Stage 8:** n/a — read.

**AI-Agent Precision.** *Ownership boundary:* BC-ADM-6 owns `outreach_campaigns`/`outreach_contacts`; the target vendor is Marketplace-owned. *Forbidden actions:* **outreach is informational acquisition only — never procurement routing, matching, ranking, supplier-selection, award, or eligibility (moat)**; no score (firewall). *Cross-module restrictions:* target vendor referenced by UUID (DR-ADM-MKT). *Non-authority surfaces:* outreach contacts vendors for acquisition; it never influences a procurement outcome.

---

## Appendix A — Pass-B Contract Register (all six BCs)

| BC | Contracts (Pass-A frozen, hardened here) | Emits event | Audit |
|---|---|---|---|
| BC-ADM-1 Moderation | `create_moderation_case` · `assign_moderation_case` · `decide_moderation_case` · `get`/`list_moderation_cases` | No Event | §9 "moderation decisions" / read none |
| BC-ADM-2 Enforcement | `issue_ban` · `lift_ban` · `expire_ban`(System) · `get`/`list_ban_actions` | **`VendorBanned`** (issue_ban; sole Admin §8 event) | §9 "ban issue/lift"; **expiry `[ESC-ADM-AUDIT]`** |
| BC-ADM-3 Suggestions | `decide_category_suggestion` · `triage`/`close_missing_vendor_suggestion` · `confirm`/`dismiss_link_suggestion` · `get`/`list_suggestions` | No Event | §9 "category approve/delete" / "suggestion decisions" / "link confirm/dismiss" |
| BC-ADM-4 Data Import | `submit_import_job` · `process_import_job`(System) · `get`/`list_import_jobs` / `list_import_rows` | No Event | §9 "import job execution" |
| BC-ADM-5 Verification Workflow | `queue`/`assign`/`decide_verification_task` · `get`/`list_verification_tasks` | No Event | **`[ESC-ADM-AUDIT]`** (workflow) |
| BC-ADM-6 Vendor Outreach | `create`/`run`/`complete_outreach_campaign` · `add`/`update_outreach_contact` · `get`/`list_outreach_campaigns` | No Event | **`[ESC-ADM-AUDIT]`** (outreach) |

**Pass-B invariants (held):** the hardened contracts are the verbatim frozen Pass-A set across all six BCs; no BC/aggregate/ownership/slug/event/audit-action/dependency-marker/lifecycle created or changed. **`VendorBanned` is the sole Admin-owned Doc-2 §8 event (BC-ADM-2); BC-ADM-1/3/4/5/6 produce No Event.** The eight frozen lifecycles are verbatim (`moderation_cases open→approved/rejected/escalated`; `ban_actions active→lifted→expired` (expiry only from `lifted`); `category_suggestions submitted→approved/rejected`; `missing_vendor_suggestions submitted→triaged→closed`; `link_suggestions suggested→confirmed/dismissed`; `import_jobs queued→processing→completed/failed`; `verification_tasks queued→in_review→decided`; `outreach_campaigns draft→running→completed`). Authorization binds the frozen platform-staff slugs (`staff_can_moderate_rfq`/`staff_can_ban`/`staff_can_manage_categories` [category ONLY]/`staff_can_verify`) + `[ESC-ADM-SLUG]` (missing-vendor + link + import + outreach); no slug invented; `staff_super_admin` flagged. Audit binds the §9 Admin domain by pointer where enumerated; ban expiry + verification-task workflow + outreach carry `[ESC-ADM-AUDIT]` (no action invented). Dependencies DR-ADM-1/MKT/OPS/PC/RFQ/TRUST only — **`DR-ADM-COMM` does not exist**. `STATE ≠ CONFLICT` and `REFERENCE ≠ DEPENDENCY` separated throughout; user-scoped/non-disclosure surfaces collapse to `NOT_FOUND`. **Admin governs; Admin does not procure** (no matching/routing/ranking/supplier-selection/award/eligibility — moat); **Admin decides workflow; Trust stores decisions** (`verification_tasks ≠ trust.verification_records`/`≠ trust.verification_decisions`; no score — firewall); **link-suggestion content never vendor-visible** (non-disclosure). **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/dependency-marker created.**

## Appendix B — Carried Markers (Pass-B; unchanged)

- **DR-ADM-1** (Identity — `check_permission` + platform-staff slug resolution), **DR-ADM-MKT** (Marketplace — ban subject + `VendorBanned` reflect DD-3; category write DD-4; import seed; outreach target), **DR-ADM-RFQ** (RFQ — moderation subject), **DR-ADM-OPS** (Operations — link-column write A-03), **DR-ADM-TRUST** (Trust — verification record reference + decision via service; **Trust stores; Admin no record/score**), **DR-ADM-PC** (Platform Core — audit/outbox/UUIDv7/file-ref/POLICY). *(**`DR-ADM-COMM` does not exist in the frozen corpus — not used**.)*
- **`[ESC-ADM-SLUG]`** (Doc-2 §7 additive) — missing-vendor + link decisions, import, outreach (no §7 staff slug; no slug invented).
- **`[ESC-ADM-AUDIT]`** (Doc-2 §9 additive) — ban expiry, verification-task workflow, outreach (not §9-enumerated; nearest by pointer; no action invented).
- **`[ESC-ADM-POLICY]`** (Doc-3 §12.2 additive) — dedup windows, retention/purge windows, import batch limits, outreach cadence; `moderation.*` is the named registered key set; others carried; no key invented.
- **`[ESC-ADM-EVENT]`** (Doc-2 §8 additive) — none coined; `VendorBanned` is the only Admin §8 event.

**Carried, never resolved here**; resolution is an additive patch to the owning document through its named Doc-2 channel.

---
---

## Final Freeze Certificate

```text
Doc-4J_FROZEN_v1.0

FINAL FREEZE APPROVED

Open BLOCKER = 0
Open MAJOR   = 0
Open MINOR   = 0
Open NITPICK = 0
```

Certified:

- Structure Integrity Preserved (6 BCs: BC-ADM-1 Moderation · BC-ADM-2 Enforcement · BC-ADM-3 Suggestions · BC-ADM-4 Data Import · BC-ADM-5 Verification Workflow · BC-ADM-6 Vendor Outreach)
- Aggregate Integrity Preserved (6 aggregates: Moderation Case · Ban Action · Suggestion [one aggregate, three roots, one BC, no split] · Import Job · Verification Task · Outreach Campaign; one aggregate = one BC = one owner)
- Lifecycle Integrity Preserved (Moderation Case `open → approved / rejected / escalated`; Ban Action `active → lifted → expired`; Category Suggestion `submitted → approved / rejected`; Missing Vendor Suggestion `submitted → triaged → closed`; Link Suggestion `suggested → confirmed / dismissed`; Import Job `queued → processing → completed / failed`; Verification Task `queued → in_review → decided`; Outreach Campaign `draft → running → completed`; F4J-PB1-M1 resolved — no `submitted → closed` shortcut)
- Ownership Integrity Preserved (Admin owns the governance/workflow records; the decision-target stores remain their owners' — RFQ / Marketplace / Operations / Trust; no ownership leakage)
- Authorization Integrity Preserved (`staff_can_moderate_rfq` · `staff_can_ban` · `staff_can_manage_categories` [category-suggestion decisions ONLY] · `staff_can_verify`; `[ESC-ADM-SLUG]` for missing-vendor + link decisions, import, and outreach; no slug invented; `staff_super_admin` flagged)
- Audit Governance Preserved (Doc-2 §9 Admin domain by pointer where enumerated; `expire_ban.v1` → `[ESC-ADM-AUDIT]`; verification-workflow contracts → `[ESC-ADM-AUDIT]`; outreach → `[ESC-ADM-AUDIT]`; no dual-option; no audit action invented)
- Dependency Integrity Preserved (DR-ADM-1 · DR-ADM-MKT · DR-ADM-OPS · DR-ADM-PC · DR-ADM-RFQ · DR-ADM-TRUST; DR-ADM-COMM does not exist)
- Event Governance Preserved (`VendorBanned` is the sole Admin-owned Doc-2 §8 event — sole producer, sole owner, BC-ADM-2; BC-ADM-1/3/4/5/6 Produced Events = NONE; no event invented)
- Procurement Moat Preserved (Admin governs; Admin does not procure — no contract matches/routes/ranks/selects/awards or determines procurement eligibility; vendor outreach is informational only)
- Trust Firewall Preserved (Admin decides workflow; Trust stores decisions; `verification_tasks ≠ trust.verification_records` and `≠ trust.verification_decisions`; no Trust/Performance/Verification/Governance score owned)
- Pass-B Completeness Confirmed (every BC carries Field Registry · Value Objects · Read Models · Idempotency · Concurrency · Stage Validation · Data Retention · Index Strategy · Contract Precision · AI-Agent Precision)
- AI-Agent Readiness Confirmed (deterministic ownership / authorization / lifecycle / audit / dependency handling; `REFERENCE ≠ DEPENDENCY`; `STATE ≠ CONFLICT`)

---

*Doc-4J_FROZEN_v1.0 — authoritative frozen specification for Module 8 (Admin Operations). Governance base Doc-4J_PassA_FROZEN_v1.0; implementation base Doc-4J_PassB_Content_v1.0 with Doc-4J_PassB_Patch_v1.0 applied inline; approved by Doc-4J_Final_Freeze_Audit_v1.0 (FINAL FREEZE APPROVED). FROZEN.*
