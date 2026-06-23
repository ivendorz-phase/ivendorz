# Doc-4F — Business Operations Engine — Pass-B (Hardening) Part 4 v1.0 (FROZEN) — BC-OPS-4 Document Generation & Templates

## BC-OPS-4 — Document Generation & Templates (§F7) — FROZEN

| Field | Value |
|---|---|
| Document | Doc-4F — **Pass-B Part 4 v1.0 (FROZEN)** — final immutable Part-4 baseline — Module 4 Business Operations Engine (`operations` schema, `ops_` namespace) |
| Part scope | **BC-OPS-4 — Document Generation & Templates (§F7)** — the Pass-A §F7 contracts (**two** aggregates: Document Template + Generated Document), hardened to implementation grade. Emits **no domain event**. |
| Status | **Pass-B Part 4 FROZEN — sole authoritative BC-OPS-4 Pass-B artifact.** Supersedes the authoring draft, the patch document, and the patch verification report for all future authoring/review/implementation. Authorized next stage: **Doc-4F_PassB_Part5 (BC-OPS-5 Finance Records)**. |
| Contract authority | `Doc-4F_Content_v1.0_PassA_FROZEN.md` §F7 (sole contract authority; not revisited, not redesigned, not reopened) |
| Structure authority | `Doc-4F_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F_Structure_v1.0_FROZEN, Doc-4F_Content_v1.0_PassA_FROZEN, Doc-4F_PassB_Part1_BC-OPS-1_FROZEN, Doc-4F_PassB_Part2_BC-OPS-2_FROZEN, Doc-4F_PassB_Part3_BC-OPS-3_FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-OPS-1 (FROZEN) · Part 2 — BC-OPS-2 (FROZEN) · Part 3 — BC-OPS-3 (FROZEN) · **Part 4 — BC-OPS-4 Document Generation & Templates (FROZEN)** · Part 5 — BC-OPS-5 Finance Records |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Frozen scope.** BC-OPS-4 (`operations` schema) hardens the Pass-A §F7 contracts to implementation grade: field-level request/response schemas, per-field validation matrices on the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), idempotency rules. **No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template created or changed** — ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §F7. **BC-OPS-4 owns two aggregates** — Document Template (`document_templates` + `template_versions`) and Generated Document (`generated_documents`), each in this one context. The template machine is exactly **Doc-2 §5.9** (`draft → active → archived`, `active → active` new version, `archived → active` reactivate); **`template_versions` are immutable** (guard-enforced; never overwritten; generated documents record the `template_version` used). The async generation job (21.5 System) **dedups on `generation_job_id`** (no duplicate-generation); **`ASYNC_PENDING`** signals in-progress; generated documents hold **storage refs only** and are visible to the **owning org + granted counterparty only** (grant/revoke is the sole sharing channel; revoke removes counterparty visibility). Slugs are **`can_manage_templates`** and **`can_create_documents`** (Doc-2 §7); delegation-not-eligible is cited to **Doc-4A §6B** (own-org actions). BC-OPS-4 **emits no domain event**; it owns **no** RFQ/quotation/matching/routing/ranking/award (DF-3), **no** vendor discovery/profiles/attributes (DF-2), **no** trust/performance score (DF-4), and has **no ownership overlap with BC-OPS-2** (which only references a `template_version_id`). Carried dependencies **DF-1, DF-2, DF-3, DF-8** and the markers **`[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]`** travel unchanged. Any change to this frozen baseline requires Architecture Board approval (Doc-4_Governance_Note_v1.0).

---
## §H — Part-4 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, **source authority**, **rule**, and **failure outcome** (error class from H.4).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `human_ref` (string, Doc-2 §0.1 — `DOC-…` for generated documents), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `numeric` (Doc-2 §10.5), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, not internal field schema, which is development-doc scope), `timestamptz`, `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B five-condition check, stage 5). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement source for every check is Identity's `check_permission` (Doc-4C §C3/§C8, consumed; no shadow authorization). **BC-OPS-4 scope = the owning organization** (`organization_id`) of the target `document_templates`/`template_versions`/`generated_documents` row; a granted **counterparty** org reads a shared `generated_documents` under the grant only. The Doc-2 §7 slugs are **`can_manage_templates`** (O,D,M — templates) and **`can_create_documents`** (O,D,M,F — generated-document creation/sharing).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes follow **`ops_<domain>_<code>`** (Appendix B namespace `ops_`); specific numeric codes are assigned at the development-document stage — Pass-B fixes the **class + trigger + retryable**. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable: false`) is kept distinct from `DEPENDENCY` (the owning service / storage / engine is transiently unavailable; `retryable: true`) — never conflated** (Doc-4A §12.2/§12.4; the FROZEN Part-1/2/3 P-03 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract). `ASYNC_PENDING` applies to the async generation job where a result is not yet available (Doc-4A §12.2). No POLICY-limit (Category 9) applies in Part 4 unless a contract states one.
- **H.5 — State machine (Doc-2 §5.9/§10.5; Doc-4A §13).** The BC-OPS-4 lifecycles are: **`document_templates` → `draft → active → archived`**, with **`active → active`** on a new version (edit) and **`archived → active`** on reactivate (Doc-2 §5.9, verbatim); **`template_versions` → immutable rows** (no status machine; `version_no`, never overwritten); **`generated_documents` → versioned rows** (no status machine). Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all others → `STATE`). Concurrency: optimistic — template lifecycle commands assert `expected_status`; a lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified** — Pass-B enforces the frozen Doc-2 §5.9 edges only. **Historical `template_versions` are never mutated** (Doc-2 §5.9 "Never overwritten"); editing creates a new version; generated documents **record the `template_version` used**.
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User` for org actions; `System` for the async generation job), **object scope** (the `operations.*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B). Reads are not audited (§17.1). BC-OPS-4 binds the **separately-enumerated** Doc-2 §9 **Documents** domain directly: "template create/activate/archive/new version" and "generated document creation". The **`generated_documents` counterparty grant** is not separately enumerated for the Operations side (§9 names `rfq_document_grant create/remove`, an RFQ-side grant) → it carries **`[ESC-OPS-AUDIT]`** (interim: nearest §9 Documents grant action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §F7.
- **H.7 — Events (Doc-2 §8).** **BC-OPS-4 emits NO domain event** (Pass-A §F7/§F11 — every template/generated-document mutation is state + §9-audit only; Doc-4A §16.4 — no event coined). BC-OPS-4 **consumes** no domain event (the async generation job is an internal Operations job, not an event consumer). No 21.2 integration contract is authored.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key). **No `operations`/`ops` dedup-window key is registered in Doc-3 §12.2** → the window key is carried under **`[ESC-OPS-POLICY]`** (interim: reference the platform default dedup-window key by name; **no key invented** — Doc-3 §12.2 additive channel). Replay within the window → same result, **no duplicate audit**. The async generation job (21.5) dedups on the **`generation_job_id`** (a replayed generation request for the same job produces no duplicate `generated_documents` row — no duplicate-generation ambiguity). Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Tenancy, disclosure & boundary (Doc-2 §6/§10.5; Doc-4A §7.3/§7.5).** `document_templates`/`template_versions`/`generated_documents` are **tenant-owned** (`organization_id`) and RLS-scoped to the owning org — a non-owned reference collapses to `NOT_FOUND` (§7.5; §12.4). `generated_documents` add a **counterparty grant**: a shared generated document is visible to the **owning org and the granted counterparty only** — never broader; revocation removes counterparty visibility. **Storage-ref only** (Doc-2 §10.5): generated documents hold a `storage_ref` (Doc-4B storage — DF-8), never an in-row blob. **Strict boundary / no ownership overlap:** the Document Template and Generated Document aggregates stay in BC-OPS-4; **BC-OPS-2** only *references* a `template_version_id` for an engagement-document body (no template/generated-document ownership in BC-OPS-2); `generated_documents.source_entity_id` references an rfq/quotation/engagement-doc by **bare UUID** (RFQ/quotation = RFQ-owned, DF-3; engagement doc = BC-OPS-2) — generation **reads** the source, never owns or mutates it; the Operations `generated_documents` counterparty grant is **distinct from RFQ's `rfq_document_grant`** (RFQ-owned, Doc-4E).
- **H.10 — `operations` BC-OPS-4 field source (Doc-2 §10.5).** The hardened schemas bind to the frozen Doc-2 §10.5 columns; **Pass-B introduces no column** — it binds existing ones:
  - `document_templates`: `organization_id`, `format enum<challan|bill|letterhead|quotation|wcc>`, `name`, `status` (§5.9: `draft|active|archived`), `current_version_no` (archive-capable).
  - `template_versions`: → `document_templates`; `organization_id`; `version_no`, `layout_jsonb`, `brand_binding_jsonb` — **immutable**.
  - `generated_documents`: → `template_versions` (nullable); `organization_id`, `source_entity_id` (rfq/quotation/engagement doc); `human_ref DOC-…`, `doc_kind`, `version_no`, `storage_ref`, `generated_by`, `generation_job_id` — versioned; +counterparty grant where shared.

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.** Grouped families share section 1 and split the records where the schema differs.

---

## §F7.1 — `ops.create_template.v1` · `ops.activate_template.v1` · `ops.archive_template.v1` · `ops.reactivate_template.v1` — Template Lifecycle

**1. Contract Metadata** — Contract IDs `ops.create_template.v1`, `ops.activate_template.v1`, `ops.archive_template.v1`, `ops.reactivate_template.v1` · Template **21.4 Command** · Owned aggregate **Document Template** (`document_templates` AR) · Authority: Doc-2 §5.9 (Document Template machine), §10.5, §9 (Documents) · Actor types **User** (org member) · Bounded context **BC-OPS-4** (§F7).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `format` | `enum<challan\|bill\|letterhead\|quotation\|wcc>` | yes (create) | no | 1 | Doc-2 §10.5 fixed five-format enum (create only) |
| `name` | `string` | yes (create) | no | 1 | Doc-2 §10.5 `name` |
| `document_template_id` | `uuid` | yes (activate/archive/reactivate) | no | 1 | target template |
| `expected_status` | `enum<draft\|active\|archived>` | yes (activate/archive/reactivate) | no | 1 | optimistic-concurrency assertion (H.5) |

**3. Response Schema** — `document_template_id : uuid (1)`, `status : enum<draft|active|archived> (1)`, `current_version_no : numeric (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields | 1 SYNTAX | Doc-4A §9 | presence/type; `format` ∈ fixed five-format enum (create) | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active org context valid | `AUTHORIZATION` |
| `can_manage_templates` | 3 AUTHZ | Doc-2 §7 | membership holds slug | `AUTHORIZATION` |
| template org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | the template is the active org's (create scoped to active org) | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | n/a — template management is not delegation-eligible | — |
| transition legal (state) | 6 STATE | Doc-2 §5.9 | `draft → active` (activate); `active → archived` (archive); `archived → active` (reactivate); create enters `draft` (lifecycle legality checked first) | `STATE` |
| status match (concurrency) | 6 STATE → concurrency sub-check | Doc-4A §14 | after lifecycle legality passes, optimistic-concurrency: `expected_status` = current status (activate/archive/reactivate) | `CONFLICT` |
| (reference/business/policy) | 7–9 | Doc-2 §5.9/§10.5 | none beyond the machine and the format enum | — |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (Doc-2 §7) · Scope = owning org (`organization_id`) · Delegation **not eligible** (Doc-4A §6B — own-org template management; no representative-org scenario) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — `document_templates`: create → `draft`; `draft → active` (activate); `active → archived` (archive); `archived → active` (reactivate) (Doc-2 §5.9) · **Forbidden:** any non-§5.9 edge → `STATE` (e.g., `draft → archived` direct, or activating an already-`active` template) · Concurrency: optimistic on `expected_status`; lost race → `CONFLICT`. *(The `active → active` new-version edge is driven by `add_template_version` (§F7.2), not by this contract.)*

**7. Audit Binding** — Action **Doc-2 §9 Documents** "template create/activate/archive" · Attribution **User** · Object scope the `document_templates` row · Timing same transaction · Source Doc-2 §9 + Doc-4B. *(Reactivate binds the nearest §9 Documents template action by pointer — "template … activate" — no action invented.)*

**8. Event Binding** — Emitted **none** (H.7 — no Doc-2 §8 operations event for template lifecycle; state + audit only) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `format` enum; missing required) | false |
| `AUTHORIZATION` | context/slug fail (own-org) | false |
| `NOT_FOUND` | template not owned by active org (collapse, H.9) | false |
| `STATE` | illegal §5.9 transition | false |
| `CONFLICT` | `expected_status` ≠ current (lost race) | true (re-read then retry) |
| `DEPENDENCY` | Doc-4B (audit/human-ref) transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a template outside the caller's org is `NOT_FOUND`, never `AUTHORIZATION`. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-OPS-POLICY]`); `expected_status` makes lifecycle transitions safe to retry (a replayed transition already applied returns the same status; a stale assertion → `CONFLICT`). Replay within window → one transition, **no duplicate audit**.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Platform Core (DF-8):** audit-write. No event; no RFQ/Marketplace/Trust touch.

**12. AI-Agent Implementation Notes** — `format` is the **fixed five-format enum** (Doc-2 §10.5 challan/bill/letterhead/quotation/wcc) — **never extend it**; honor the §5.9 machine **verbatim** (templates are **never overwritten** — new versions are added via `add_template_version`). Own-org scope only; collapse to `NOT_FOUND` for non-owners.

---

## §F7.2 — `ops.add_template_version.v1` — New Template Version (immutable)

**1. Contract Metadata** — Contract ID `ops.add_template_version.v1` · Template **21.4 Command** · Owned child **`template_versions`** (immutable child of the Document Template AR) · Authority: Doc-2 §5.9 ("edit → active (new template_version; prior versions retained)"), §10.5 · Actor types **User** (org member) · BC-OPS-4 (§F7).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `document_template_id` | `uuid` | yes | no | 1 | parent template (must be `active`) |
| `layout_jsonb` | `jsonb` | yes | no | 1 | Doc-2 §10.5 `layout_jsonb` (shape = dev-doc scope) |
| `brand_binding_jsonb` | `jsonb` | no | yes | 1 | Doc-2 §10.5 `brand_binding_jsonb` |
| `expected_template_status` | `enum<draft\|active\|archived>` | yes | no | 1 | concurrency/state assertion of the parent template |

**3. Response Schema** — `template_version_id : uuid (1)`, `version_no : numeric (1)`, `document_template_id : uuid (1)`, `current_version_no : numeric (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `document_template_id`, `layout_jsonb`, `expected_template_status` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; org context | `AUTHORIZATION` |
| `can_manage_templates` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| template org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | parent template is the active org's | `NOT_FOUND` (collapse, H.9) |
| template active (state) | 6 STATE | Doc-2 §5.9 | parent template is `active` (a new version is added on the `active → active` edit edge; lifecycle legality checked first) | `STATE` |
| status match (concurrency) | 6 STATE → concurrency sub-check | Doc-4A §14 | after lifecycle legality passes, optimistic-concurrency: `expected_template_status` = current (`active`) | `CONFLICT` |
| immutable-version guard | 8 BUSINESS | Doc-2 §5.9 | a request that targets or mutates an existing `template_versions` row (any overwrite of a prior `version_no`) is rejected — `template_versions` are immutable; a version may only be appended as a new `version_no` | `BUSINESS` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (Doc-2 §7) · Scope = owning org · Delegation **not eligible** (Doc-4A §6B — own-org template versioning; no representative-org scenario) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — parent `document_templates` stays **`active`** (the §5.9 `active → active` edit edge); appends an **immutable** `template_versions` row (`version_no = current+1`; Doc-2 §5.9/§10.5) · **Forbidden:** adding a version to a `draft`/`archived` template → `STATE`; overwriting an existing version → `BUSINESS` · Concurrency: optimistic on `expected_template_status`; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Documents** "template … new version" · Attribution **User** · Object scope the new `template_versions` row + parent template ref · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | context/slug fail (own-org) | false |
| `NOT_FOUND` | template not owned by active org (collapse, H.9) | false |
| `STATE` | template not `active` | false |
| `CONFLICT` | `expected_template_status` ≠ current | true |
| `BUSINESS` | overwrite of an existing immutable version | false |
| `DEPENDENCY` | Doc-4B transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; replay within window → one new version, **no duplicate audit**. (A genuinely new edit is a new `version_no` by design — Doc-2 §5.9.)

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Platform Core (DF-8):** audit-write. No event; no cross-module ownership.

**12. AI-Agent Implementation Notes** — versions are **immutable** (Doc-2 §5.9) — **never overwrite**; a new version appends `version_no+1` and prior versions are retained; generated documents must **record the `template_version` they used** (Doc-2 §5.9). A version may be added only to an `active` template. Own-org scope only.

---

## §F7.3 — `ops.generate_document.v1` — Generate Document (template engine; async job)

**1. Contract Metadata** — Contract ID `ops.generate_document.v1` · Template **21.5 System** (async generation job) · Owned aggregate **Generated Document** (`generated_documents` AR) · Authority: Doc-2 §3.5/§10.5 (`generated_documents`; `generation_job_id`), §9 (Documents "generated document creation") · Actor types **System** (async job; enqueued by a user action in BC-OPS-2/BC-OPS-4) · BC-OPS-4 (§F7). *(Pass-A §F7 fixed the owned entity/ownership/bindings as invariant whether the trigger is modeled async (21.5) or synchronous (21.4); this Part hardens it as the async job per Doc-2 §10.5 `generation_job_id`.)*

**2. Request Schema** *(internal job input; `Response: none` per 21.5)*

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `generation_job_id` | `uuid` | yes | no | 1 | the job identity (dedup key — H.8; Doc-2 §10.5 `generation_job_id`) |
| `source_entity_id` | `uuid` | yes | no | 1 | rfq / quotation / engagement-doc reference (bare UUID; DF-3 / BC-OPS-2) |
| `doc_kind` | `string` | yes | no | 1 | Doc-2 §10.5 `doc_kind` |
| `template_version_id` | `uuid` | no | yes | 1 | optional template version for the body (must be active; BC-OPS-4 in-aggregate) |
| `owning_organization_id` | `uuid` | yes | no | 1 | the org the generated document belongs to (`generated_by` captured) |

**3. Response Schema** — **none** (System actor, 21.5 — `Response: none`). Side effect: writes `generated_documents` with `human_ref DOC-…` + `storage_ref` + recorded `template_version`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| job input fields | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` (malformed job → DLQ per POLICY) |
| system actor | 2 CONTEXT | Doc-4A §5.2/§15.5 | actor is System (async job; the enqueuing user action carried `can_create_documents`/`can_manage_templates`) | `AUTHORIZATION` |
| (authz/scope/delegation) | 3–5 | — | n/a at the job — the enqueuing command enforced the slug; the job runs as System on the owning org's entity | — |
| no completed document for `generation_job_id` | 6 STATE | Doc-2 §10.5 (per-job) | a generated document is produced once per `generation_job_id`; a duplicate job is dedup-handled (see §10 Idempotency Rules) | — |
| `source_entity_id` resolves | 7 REFERENCE | Doc-4A §4.5; DF-3 / BC-OPS-2 | the source (rfq/quotation/engagement doc) exists via its owning service/aggregate | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| `template_version_id` active (if present) | 7 REFERENCE | Doc-4A §4.5; Doc-2 §5.9 | the template version exists and belongs to an `active` template (in-aggregate) | `REFERENCE` / `DEPENDENCY` |
| storage available | 7 REFERENCE | Doc-4B storage (DF-8); Doc-4A §4.5 | the storage backend is available to write the `storage_ref` | `DEPENDENCY` (transient; retry) |
| generation completion | 8 BUSINESS | Doc-4A §12.2 (async result lifecycle) | the async generation result is available; while in progress the contract returns the in-progress signal | `ASYNC_PENDING` (poll until complete) |

**5. Authorization Matrix** — Actor **System** (async generation job) · Slug **none** at the job (the enqueuing user command carried `can_create_documents` / `can_manage_templates`; Doc-2 §7) · Scope = the owning org's `generated_documents` · Delegation **not eligible** · Enforcement: Phase-2 origin attribution (Doc-4A §15.5); the job effect is limited to Operations' own entity (Doc-4A §16.7/§4.3).

**6. State Machine Enforcement** — writes a **versioned** `generated_documents` row (Doc-2 §10.5; no status machine) recording the `template_version` used (Doc-2 §5.9) · **Forbidden:** a second row for the same completed `generation_job_id` → idempotent no-op · Concurrency: **dedup on `generation_job_id`** (no duplicate-generation).

**7. Audit Binding** — Action **Doc-2 §9 Documents** "generated document creation" · Attribution **System** · Object scope the new `generated_documents` row · Timing same transaction · Source Doc-2 §9 + Doc-4B `core.append_audit_record.v1`.

**8. Event Binding** — Emitted **none** (H.7 — no Doc-2 §8 operations event for generation; state + audit only) · Consumed none (internal job, not an event consumer).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed job input → DLQ per POLICY | false |
| `AUTHORIZATION` | the job runs without a valid Phase-2 System-actor origin (Doc-4A §15.5) — the enqueuing user command must have carried `can_create_documents`/`can_manage_templates` | false |
| `REFERENCE` | `source_entity_id` or `template_version_id` does not resolve (definitive negative) | false |
| `DEPENDENCY` | storage/template-engine/Doc-4B transiently unavailable / no definitive answer (retry) | true |
| `ASYNC_PENDING` | generation in progress; result not yet available (Doc-4A §12.2) | true (poll) |
| `SYSTEM` | unexpected failure | true |

**Error Boundary block (§12.4/§12.6):** System-actor job; no tenant caller at the job surface, so no protected-fact disclosure question arises here. `REFERENCE` (definitive) and `DEPENDENCY` (transient) distinct (H.4). `Timing-Uniformity`: not applicable.

**10. Idempotency Rules** — inherently idempotent (Doc-4A §14 / §16.7): **dedup on `generation_job_id`** — a replayed generation request produces **no** duplicate `generated_documents` row and **no** duplicate audit (no duplicate-generation ambiguity). A replayed job for an existing `generation_job_id` is an **idempotent no-op** — **never `CONFLICT`** (dedup on job identity, Doc-4A §16.7; FROZEN Part-2/Part-3 / Doc-4A §14.6 convention). `ASYNC_PENDING` is the in-progress signal; the completed row is written once.

**11. Cross-Module References** — **RFQ (DF-3):** `source_entity_id` may reference an rfq/quotation by UUID — **read-only; generation never mutates the source; owns no RFQ/quotation** (consumer of a reference only). **BC-OPS-2 (within Operations):** `source_entity_id` may reference an engagement doc; `template_version_id` references a BC-OPS-4-owned version — **no ownership crosses** (H.9). **Platform Core (DF-8):** Doc-4B storage (writes `storage_ref`), `human_ref` (`DOC-…`), audit-write.

**12. AI-Agent Implementation Notes** — the generated document **records its `template_version`** (Doc-2 §5.9); it holds a **storage ref, not a blob** (Doc-2 §10.5). Generating from an RFQ/quotation/engagement-doc source **reads** that source by UUID and **never mutates it** (DF-3 / BC-OPS-2). **Dedup on `generation_job_id`** — never produce a duplicate document for the same job. `ASYNC_PENDING` signals in-progress; the result row is written exactly once.

---

## §F7.4 — `ops.grant_generated_document.v1` · `ops.revoke_generated_document_grant.v1` — Counterparty Grant Sharing

**1. Contract Metadata** — Contract IDs `ops.grant_generated_document.v1`, `ops.revoke_generated_document_grant.v1` · Template **21.4 Command** · Owned **counterparty grant on `generated_documents`** · Authority: Doc-2 §10.5 ("sharable to counterparty by grant") · Actor types **User** (owning org member) · BC-OPS-4 (§F7).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `generated_document_id` | `uuid` | yes | no | 1 | target generated document (owning org's) |
| `counterparty_organization_id` | `uuid` | yes | no | 1 | the engagement counterparty org (grant target) |
| `decision` | `enum<grant\|revoke>` | yes | no | 1 | grant or revoke counterparty access |

**3. Response Schema** — `generated_document_id : uuid (1)`, `grant_state : enum<granted|revoked> (1)`, `counterparty_organization_id : uuid (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields | 1 SYNTAX | Doc-4A §9 | presence/type; `decision` ∈ {grant,revoke} | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; owning-org context | `AUTHORIZATION` |
| `can_create_documents` | 3 AUTHZ | Doc-2 §7 | slug held — generated-document sharing is authorized under `can_create_documents` (document-creation authority) | `AUTHORIZATION` |
| document org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | the `generated_documents` row is the active org's | `NOT_FOUND` (collapse, H.9) |
| counterparty resolves | 7 REFERENCE | Doc-4A §4.5; DF-1 | the `counterparty_organization_id` exists (Identity) and is the engagement counterparty | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| grant transition | 8 BUSINESS | Doc-2 §10.5 | grant adds / revoke removes counterparty visibility on the document (the only sharing channel) | `BUSINESS` (illegal grant target) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_create_documents`** (Doc-2 §7; authoritative for generated-document sharing) · Scope = owning org · Delegation **not eligible** (Doc-4A §6B — generated-document sharing is an own-org action, not delegation-eligible) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — grant flag on `generated_documents` (Doc-2 §10.5; no root lifecycle change) · grant = counterparty visibility on; revoke = off · Concurrency: idempotent flag (grant-grant / revoke-revoke are no-ops returning current state).

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** — §9 **Documents** enumerates "generated document creation" and "rfq_document_grant create/remove" (an **RFQ-side** grant); the **Operations `generated_documents` counterparty grant** binds the nearest §9 Documents grant action by pointer (channel Doc-2 §9 additive; **no action invented**) · Attribution **User** · Object scope the grant on the `generated_documents` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `decision`) | false |
| `AUTHORIZATION` | context/slug fail (own-org) | false |
| `NOT_FOUND` | document not owned by active org (collapse, H.9) | false |
| `REFERENCE` | `counterparty_organization_id` does not resolve (definitive negative) | false |
| `BUSINESS` | illegal grant target (not the engagement counterparty) | false |
| `DEPENDENCY` | Identity / Doc-4B transiently unavailable (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a document outside the caller's org is `NOT_FOUND`. The counterparty `REFERENCE` check reveals only Identity existence (the engagement party), never another org's documents. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; grant/revoke is naturally idempotent (grant→granted, revoke→revoked); replay → same grant state, no duplicate audit.

**11. Cross-Module References** — **Identity (DF-1):** `counterparty_organization_id` resolution (read-only). **Platform Core (DF-8):** audit-write. The grant is the **only** sharing channel (Doc-2 §10.5); the document stays Operations-owned.

**12. AI-Agent Implementation Notes** — sharing is a **grant**, not a copy or a tenancy change — the document stays Operations-owned (Doc-2 §10.5); a shared generated document is visible to the **owning org + granted counterparty only**, and **revoke removes counterparty visibility** — never broaden. Generated-document sharing is authorized under `can_create_documents` (Doc-2 §7). Distinct from RFQ's `rfq_document_grant` (RFQ-owned — Doc-4E). Own-org scope only; collapse to `NOT_FOUND` for non-owners.

---

## §F7.5 — `ops.get_template.v1` · `ops.list_templates.v1` · `ops.get_generated_document.v1` · `ops.list_generated_documents.v1` — Template / Generated-Document Reads

**1. Contract Metadata** — Contract IDs `ops.get_template.v1`, `ops.list_templates.v1`, `ops.get_generated_document.v1`, `ops.list_generated_documents.v1` · Template **21.3 Query** · Reads over `document_templates`(+`template_versions`), `generated_documents` · Authority: Doc-2 §6/§10.5 (tenancy; counterparty grant) · Actor types **User** (owning org member; counterparty for granted generated documents) · BC-OPS-4 (§F7).

**2. Request Schema** — *`get_template`:* `document_template_id : uuid (1, required)`. *`get_generated_document`:* `generated_document_id : uuid (1, required)`. *`list_templates`:* `filter : object{ format?, status? } (0..1, nullable; allowlisted fields only, Doc-4A §9.6)`; `page_size : numeric (0..1)` (`[ESC-OPS-POLICY]`); `page_token : string (0..1, nullable)`. *`list_generated_documents`:* `filter : object{ doc_kind?, source_entity_id? } (0..1, nullable; allowlisted)`; `page_size`/`page_token` as above.

**3. Response Schema** — *`get_template`:* `template : object{ document_template_id, format, name, status, current_version_no }`, `versions : list<object{ template_version_id, version_no }>`, `reference_id`. *`get_generated_document`:* `document : object{ generated_document_id, human_ref, doc_kind, version_no, storage_ref, template_version_id, source_entity_id }`, `reference_id`. *lists:* `items : list<…>`, `next_page_token : string (0..1)`, `reference_id`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields / filter | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; org context | `AUTHORIZATION` |
| authorization slug | 3 AUTHZ | Doc-2 §7 | **templates:** `can_manage_templates`. **generated documents:** `can_create_documents` (owning org) **or** an active counterparty grant (granted org). No separate read slug in Doc-2 §7 — carry `[ESC-OPS-SLUG]` only if a distinct read slug is later required | `AUTHORIZATION` |
| scope (owning org / grant) | 4 SCOPE | Doc-4A §7.3; §7.5 | **`get_*`:** the row is the active org's (templates) or the active org's **or** granted to it (generated docs); else `NOT_FOUND` collapse. **`list_*`:** RLS restricts results to the active `organization_id` plus generated documents granted to it — no broader row appears | `NOT_FOUND` (collapse, H.9) — get; scoped result set — list |
| `page_size` bound | 9 POLICY | Doc-4A §18 | within POLICY bound (`[ESC-OPS-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_templates`** (template reads) / **`can_create_documents`** (generated-document reads, owning org) **or counterparty grant** (granted org) (Doc-2 §7) · Scope = owning org, plus granted counterparty for shared generated documents · Delegation **not eligible** (Doc-4A §6B — own-org / counterparty-grant reads; no representative-org scenario) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — None (read).

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Emitted **none** · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter/sort field; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | row not owned/granted to the active org (collapse, H.9) | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a template/generated document outside the caller's org (and, for generated docs, not granted to it) is `NOT_FOUND`. `list` returns **only** the caller's own-org rows plus generated documents granted to it; no broader row is enumerated. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure queries, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3. Storage-ref retrieval for a generated document is via Doc-4B (DF-8).

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + counterparty resolution. **Platform Core (DF-8):** Doc-4B storage retrieval for the `storage_ref`. Non-disclosure (H.9): owning org + granted counterparty only.

**12. AI-Agent Implementation Notes** — a generated document is visible to the **owning org and granted counterparty only** (Doc-2 §10.5) — **never broaden**; templates are **own-org only**. The `list` surfaces enumerate only the caller's rows (plus generated docs granted to it). Storage refs are retrieved via Doc-4B (DF-8) — never an in-row blob.

---

## Appendix A — BC-OPS-4 Contract Register (Pass-B Part 4)

| § | Contract-ID(s) | Template | Owned entity (Doc-2) | Actor | Emits event | Audit (Doc-2 §9) |
|---|---|---|---|---|---|---|
| §F7.1 | `ops.create_template.v1` · `ops.activate_template.v1` · `ops.archive_template.v1` · `ops.reactivate_template.v1` | 21.4 | `document_templates` | User | none | §9 Documents "template create/activate/archive" |
| §F7.2 | `ops.add_template_version.v1` | 21.4 | `template_versions` | User | none | §9 Documents "template … new version" |
| §F7.3 | `ops.generate_document.v1` | 21.5 | `generated_documents` | System | none | §9 Documents "generated document creation" |
| §F7.4 | `ops.grant_generated_document.v1` · `ops.revoke_generated_document_grant.v1` | 21.4 | grant on `generated_documents` | User | none | `[ESC-OPS-AUDIT]` (nearest §9 Documents grant) |
| §F7.5 | `ops.get_template.v1` · `ops.list_templates.v1` · `ops.get_generated_document.v1` · `ops.list_generated_documents.v1` | 21.3 | Document Template; Generated Document | User | none | none (read) |

**Part-4 invariants (held):** BC-OPS-4 owns exactly **two** aggregates (Document Template: `document_templates`+`template_versions`; Generated Document: `generated_documents`), each in this one context; **emits zero domain events** (state + audit only — Doc-2 §8); binds Doc-2 §7 slugs `can_manage_templates`/`can_create_documents` only (no slug invented); binds Doc-2 §9 Documents actions directly (template lifecycle/new-version/generated-document creation) or carries `[ESC-OPS-AUDIT]` for the counterparty grant (no action invented); carries `[ESC-OPS-POLICY]` for dedup-window/page-size keys and `[ESC-OPS-SLUG]` for the generated-document-share/read-slug questions; the template machine is exactly **§5.9** `draft/active/archived` with `active→active` (new version) and `archived→active` (reactivate) — **no state/transition invented**; **`template_versions` are immutable** (never overwritten — Doc-2 §5.9); the async generation job **dedups on `generation_job_id`** (no duplicate-generation); generated documents hold **storage refs only** and are visible to **owning org + granted counterparty only**; owns **no** RFQ/quotation/matching/routing/ranking/award (DF-3), **no** vendor data (DF-2), and has **no ownership overlap with BC-OPS-2** (which only references `template_version_id`). **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

---

## Appendix B — Carried Markers (Part 4; unchanged)

- **DF-1** (Identity — `check_permission`/org-context/counterparty resolution, consumed), **DF-2** (Marketplace — vendor data owned there; not touched here beyond UUID source refs), **DF-3** (RFQ — `source_entity_id` rfq/quotation refs read-only; owns RFQ/quotation/award), **DF-8** (Platform Core — Doc-4B storage/`human_ref`/audit-write).
- **`[ESC-OPS-AUDIT]`** (Doc-2 §9 additive) — the `generated_documents` counterparty grant (§9 enumerates the RFQ-side `rfq_document_grant`; nearest Documents grant action bound by pointer; no action invented).
- **`[ESC-OPS-POLICY]`** (Doc-3 §12.2 additive) — idempotency dedup-window key and list `page_size` bound (no `operations` POLICY namespace registered; platform default referenced by name; no key invented).
- **`[ESC-OPS-SLUG]`** (Doc-2 §7 additive) — only if a distinct generated-document **share** slug (vs `can_create_documents`) or a distinct **read** slug is later required.

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4F — Pass-B (Hardening) Part 4 v1.0 (FROZEN) — BC-OPS-4 Document Generation & Templates — final immutable Part-4 baseline. Authored against `Doc-4F_Content_v1.0_PassA_FROZEN.md` §F7 (sole contract authority) and `Doc-4F_Structure_v1.0_FROZEN.md`. BC-OPS-4 owns two aggregates (Document Template + Generated Document) across 5 §F7 records (12 contract IDs); emits no domain event; the template machine is exactly Doc-2 §5.9 with guard-enforced immutable `template_versions`; the async generation job dedups on `generation_job_id`; generated documents hold storage refs only, record their `template_version`, and are visible to owning org + granted counterparty only; slugs `can_manage_templates`/`can_create_documents`; delegation-not-eligible cited to Doc-4A §6B. No entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed; the procurement moat, Marketplace boundary, Trust firewall, and no-overlap-with-BC-OPS-2 seam are preserved; nothing invented. Carried markers DF-1/DF-2/DF-3/DF-8, `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Authorized next stage: Doc-4F_PassB_Part5 (BC-OPS-5 Finance Records).*
