# Doc-4F — Business Operations Engine — Pass-B (Hardening) Part 1 v1.0 — BC-OPS-1 Buyer Private CRM

## BC-OPS-1 — Buyer Private CRM Hardening (§F4)

| Field | Value |
|---|---|
| Document | Doc-4F — **Pass-B Part 1 v1.0** — Module 4 Business Operations Engine (`operations` schema, `ops_` namespace) |
| Part scope | **BC-OPS-1 — Buyer Private CRM (§F4)** — the Pass-A §F4 contracts (Private Vendor Record + Buyer–Supplier Relationship aggregates), hardened to implementation grade |
| Status | **Pass-B Part 1 draft — implementation-grade contract specification for BC-OPS-1.** Independently reviewable. Authorized next stage after review/patch: **Doc-4F_PassB_Part2 (BC-OPS-2).** |
| Contract authority | `Doc-4F_Content_v1.0_PassA_FROZEN.md` (sole contract authority; **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4F_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F_Structure_v1.0_FROZEN, Doc-4F_Content_v1.0_PassA_FROZEN — all FROZEN |
| Parts (sequence) | **Part 1 — BC-OPS-1 Buyer Private CRM** · Part 2 — BC-OPS-2 Engagement & Commercial Documents · Part 3 — BC-OPS-3 Vendor Lead Pipeline · Part 4 — BC-OPS-4 Document Generation & Templates · Part 5 — BC-OPS-5 Finance Records |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 1).** Convert the Pass-A BC-OPS-1 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices bound to the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement (allowed/forbidden source states + concurrency), audit bindings, error registers (Doc-4A §12 closed class set), and idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A. The **non-disclosure invariant** (Doc-4A §7.5; Doc-2 §6/§10.5/§10.11) is the load-bearing control of this bounded context and is enforced on **every** surface. Carried dependencies **DF-1, DF-2, DF-3, DF-5, DF-8** (the BC-OPS-1 seams) and the markers **`[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 1.

---

## §H — Part-1 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; the canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is always established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, the **source authority**, the **rule**, and the **failure outcome** (error class from H.4).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `numeric` (Doc-2 §10.4 `NUMERIC`), `string[]`/`uuid[]` (arrays; cardinality stated), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, **not** internal field schema, which is development-doc scope), `timestamptz`, `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B five-condition check, stage 5). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement source for every check is Identity's `check_permission` (Doc-4C §C3/§C8, consumed; no shadow authorization). **BC-OPS-1 scope = the buyer organization (`organization_id`) of the target row**; BC-OPS-1 is **buyer-side only** and is **not delegation-eligible** (no vendor representative acts on a buyer's private CRM).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes follow **`ops_<domain>_<code>`** (Appendix B namespace `ops_`); **specific numeric codes are assigned at the development-document stage** — Pass-B fixes the **class + trigger + retryable** per error, not the integer. **Protected-fact failures collapse to `NOT_FOUND`** (§7.5; §12.4) — for BC-OPS-1 this collapse is mandatory wherever a caller is not the owning buyer org. Category 4/5 → `NOT_FOUND` or `AUTHORIZATION` per §12.4 (the **Error Boundary block**, §12.4/§12.6, is stated per contract). No POLICY-limit (Category 9) applies in Part 1.
- **H.5 — State machine (Doc-2 §3.5/§10.5; Doc-4A §13).** The BC-OPS-1 lifecycles are: `private_vendor_records` → `active | archived`; `buyer_vendor_statuses` → `none → approved | conditional | blacklisted → cleared` (append-only **history rows**; current = `effective_to NULL`); `private_vendor_notes`/`private_vendor_ratings` → simple; `buyer_supplier_relationships` → simple (container); `vendor_favorites` → flag rows; `link_status` column on `private_vendor_records` → `none → suggested → linked` (or → `none` on dismiss). Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all others → `STATE`). Concurrency: optimistic — update commands assert the expected row revision; a lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified** — Pass-B enforces the frozen Pass-A/Doc-2 edges only.
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User` for all BC-OPS-1 mutations), **object scope** (the `operations.*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B write mechanism). Reads are not audited (§17.1). The only **separately-enumerated** §9 actions BC-OPS-1 binds directly are **Buyer CRM** "vendor status set/changed/cleared" and **Admin** "link confirm/dismiss"; all other BC-OPS-1 mutations (private-record create/edit/archive, notes, ratings, favorites) carry **`[ESC-OPS-AUDIT]`** (interim: nearest §9 Buyer-CRM action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §F4/§F13.
- **H.7 — Events (Doc-2 §8).** **BC-OPS-1 emits NO domain event.** Every BC-OPS-1 mutation (record/note/rating/status/favorite/link) is **state + §9 audit only** (Pass-A §F11 non-events; Doc-4A §16.4 — no event coined). The CRM status read-service is a read (no event). Buyer-facing notification, where any, is Communication's (DF-7) and is not authored here.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key). **No `operations`/`ops` dedup-window key is registered in Doc-3 §12.2** → the window key is carried under **`[ESC-OPS-POLICY]`** (interim: reference the platform default dedup-window key by name; **no key invented** — Doc-3 §12.2 additive channel). Replay within the window → same result, **no duplicate audit**. Queries (21.3) are idempotent and side-effect-free by nature (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Non-disclosure enforcement (Doc-4A §7.5; Doc-2 §6/§10.5/§10.11 — the BC-OPS-1 master control).** `private_vendor_records`(+notes/ratings), `buyer_supplier_relationships`, `buyer_vendor_statuses`, and `vendor_favorites` are **tenant-owned, `organization_id`-scoped, and never disclosed** in any vendor-facing surface, view, log, or error. A **Blacklisted** Buyer-Vendor Status must be **indistinguishable from a non-match** wherever RFQ consumes it (Doc-2 §10.11). Consequences enforced per contract: (a) every read/mutate is scoped to the caller's `organization_id`; (b) a cross-org reference collapses to `NOT_FOUND` (never `AUTHORIZATION`, which would confirm existence — §12.4 Error Boundary); (c) `error_code`/`message`/`field_errors` never encode another tenant's data or existence (§12.5); (d) the **only** sanctioned egress of `buyer_vendor_statuses` is the internal CRM status read-service to RFQ routing (§F4.6), never a vendor or general-buyer surface.

- **H.10 — `operations` BC-OPS-1 field source (Doc-2 §10.5).** The hardened schemas bind to the frozen Doc-2 §10.5 columns; **Pass-B introduces no column** — it binds existing ones:
  - `private_vendor_records`: `organization_id` (buyer), `linked_vendor_profile_id` (nullable), `name`, `email`, `phone`, `details_jsonb`, `source enum<manual|email_list|excel>`, `link_status enum<none|suggested|linked>`, `link_confidence`, `linked_at`, `link_confirmed_by` (+ standard columns; lifecycle `active|archived`).
  - `private_vendor_notes`: → `private_vendor_records`; `organization_id`; free-text note.
  - `private_vendor_ratings`: → `private_vendor_records`; `organization_id`; private score + comment.
  - `buyer_supplier_relationships`: `organization_id` (buyer), `vendor_profile_id`; `UNIQUE(organization_id, vendor_profile_id)`; relationship container.
  - `buyer_vendor_statuses`: → `buyer_supplier_relationships`; `status enum<approved|conditional|blacklisted>`, `caveat_note`, `effective_from`, `effective_to`; current = `effective_to NULL`; history rows (set/cleared).
  - `vendor_favorites`: → `buyer_supplier_relationships`; `organization_id`; flag rows.
  - *(referenced, not owned)* `admin.link_suggestions`: `match_basis enum<email|phone|trade_license>`, `confidence`, `state enum<suggested|confirmed|dismissed>` — Admin-owned (DF-5); confirmation writes the link columns on `private_vendor_records` via the Operations service.

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.** Grouped CRUD families share section 1 and split the records where the schema differs.

---

## §F4.1 — `ops.create_private_vendor.v1` — Create Private Vendor Record

**1. Contract Metadata** — Contract ID `ops.create_private_vendor.v1` · Template **21.4 Command** · Owned aggregate **Private Vendor Record** (`private_vendor_records` AR) · Actor types **User** (buyer member) · Bounded context **BC-OPS-1** (§F4).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes (source) |
|---|---|---|---|---|---|
| `name` | `string` | yes | no | 1 | Doc-2 §10.5 `name` |
| `email` | `string` | no | yes | 1 | Doc-2 §10.5 `email` |
| `phone` | `string` | no | yes | 1 | Doc-2 §10.5 `phone` |
| `details_jsonb` | `jsonb` | no | yes | 1 | Doc-2 §10.5 `details_jsonb` (shape = dev-doc scope) |
| `source` | `enum<manual\|email_list\|excel>` | yes | no | 1 | Doc-2 §10.5 `source` (fixed enum; do not extend) |

**3. Response Schema** — `private_vendor_record_id : uuid (1)`, `link_status : enum<none|suggested|linked> (1) = none`, `state : enum<active|archived> (1) = active`, `reference_id : uuid (1)` (Doc-4A §22.1 C-05).

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `name`, `source` typed fields | 1 SYNTAX | Doc-4A §9 | presence/type; `source` ∈ frozen enum | `VALIDATION` (aggregated) |
| actor + active org | 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active buyer-org context valid | `AUTHORIZATION` |
| `can_manage_private_vendors` | 3 AUTHZ | Doc-2 §7; Doc-4A §6 | membership holds slug | `AUTHORIZATION` |
| target org scope | 4 SCOPE | Doc-4A §6.1/§7.3 | create scoped to creator's active buyer org | `AUTHORIZATION` |
| (delegation) | 5 DELEGATION | Doc-4A §6B | n/a — BC-OPS-1 not delegation-eligible (H.3) | — |
| (state) | 6 STATE | Doc-2 §3.5 | n/a — create has no prior state | — |
| (reference) | 7 REFERENCE | — | n/a — no cross-module reference at create (link is a separate contract) | — |
| (business) | 8 BUSINESS | Doc-2 §10.5 | none beyond enum/tenancy | — |
| (policy) | 9 POLICY | Doc-3 §12.2 | none | — |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_private_vendors`** (Doc-2 §7) · Scope = creator's active buyer org (`organization_id`) · Delegation **not eligible** (H.3) · Enforcement Identity `check_permission` (Doc-4C §C3/§C8).

**6. State Machine Enforcement** — Allowed source states **none** (creation) · Target **`active`** (Doc-2 §3.5 entry; claim lifecycle excluded — PATCH-02) · Forbidden: n/a · Concurrency: new row; no `human_ref` allocated (Doc-2 §10.5 — `private_vendor_records` carry none).

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** — nearest Doc-2 §9 **Buyer CRM** action by pointer (private-record create not separately enumerated; channel Doc-2 §9 additive; **no action invented**) · Attribution **User** · Object scope new `private_vendor_records` row · Timing same transaction · Source Doc-2 §9 + Doc-4B `core.append_audit_record.v1`.

**8. Event Binding** — Emitted **none** (H.7 — BC-OPS-1 emits no event; state + audit only) · Consumed none · Idempotency: replay → one row, no duplicate audit.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (missing `name`/`source`; bad enum) | false |
| `AUTHORIZATION` | actor/context/slug/scope fail (stages 2–4), caller is a member of the org but lacks the slug | false |
| `DEPENDENCY` | Doc-4B audit-write transiently unavailable | true |
| `SYSTEM` | unexpected failure | true |

**Error Boundary block (Doc-4A §12.4/§12.6):** `create` instantiates a new row owned by the caller's own org → no cross-tenant existence question arises; stages 2–4 failures return `AUTHORIZATION` (the caller legitimately knows its own org). No protected-fact collapse applies at create. `Timing-Uniformity`: not applicable (no existence probe).

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window under **`[ESC-OPS-POLICY]`** (H.8); replay within window → same `private_vendor_record_id`, no duplicate audit; concurrent duplicate creates with the same idempotency key → one row (the second returns the first's result). Business-duplicate prevention (same vendor twice with different keys) is **not** an idempotency concern (Doc-4A §14.6) — Doc-2 §10.5 places no uniqueness constraint on `private_vendor_records`, so duplicates are permitted.

**11. Cross-Module References** — **Identity (DF-1):** active-org/membership resolution, `check_permission`. **Platform Core (DF-8):** audit-write. Marketplace/Admin: none at create. Non-disclosure (H.9): record is buyer-private from creation.

**12. AI-Agent Implementation Notes** — a private vendor record is **not** a Marketplace `vendor_profiles` row — never create/mutate vendor data here (DF-2). `source` is the fixed enum (Doc-2 §10.5); never extend. No `human_ref` for private records. Record is never vendor-facing (§7.5).

---

## §F4.2 — `ops.update_private_vendor.v1` — Edit Private Vendor Record

**1. Contract Metadata** — Contract ID `ops.update_private_vendor.v1` · Template **21.4 Command** · Owned aggregate **Private Vendor Record** · Actor **User** (buyer) · BC-OPS-1 (§F4).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `private_vendor_record_id` | `uuid` | yes | no | 1 | target record |
| `expected_revision` | `numeric` | yes | no | 1 | optimistic-concurrency assertion (H.5) |
| `name` | `string` | no | yes | 1 | edited attribute (Doc-2 §10.5) |
| `email` | `string` | no | yes | 1 | edited attribute |
| `phone` | `string` | no | yes | 1 | edited attribute |
| `details_jsonb` | `jsonb` | no | yes | 1 | edited attribute |

**3. Response Schema** — `private_vendor_record_id : uuid (1)`, `state : enum<active|archived> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `private_vendor_record_id`, `expected_revision` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_manage_private_vendors` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| record belongs to active org | 4 SCOPE | Doc-4A §7.3; §7.5 | the buyer org owns the record | `NOT_FOUND` (collapse, H.9) |
| editable state | 6 STATE | Doc-2 §3.5 | record is `active` (not `archived`) | `STATE` |
| revision match | 6 STATE / concurrency | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| `source` immutability | 8 BUSINESS | Doc-2 §10.5 | `source` is set at create; not editable | `BUSINESS` (if attempted) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_private_vendors`** · Scope = buyer org owning the record · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`active`** · Target **`active`** (attribute change) · Forbidden: `archived` → `STATE` · Concurrency: optimistic on row revision; lost race → `CONFLICT`.

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** (nearest §9 Buyer-CRM action by pointer; edit not separately enumerated; channel Doc-2 §9 additive) · Attribution User · Object scope `private_vendor_records` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7) · Consumed none · Idempotency: replay → one applied edit.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | context/slug fail (caller's own-org record) | false |
| `NOT_FOUND` | record not owned by active org (protected-fact collapse, H.9) | false |
| `STATE` | record `archived`, or `source`-mutation attempt | false |
| `CONFLICT` | `expected_revision` ≠ current (lost race) | true (re-read then retry) |
| `BUSINESS` | immutable-field (`source`) violation | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a record outside the caller's org is reported as `NOT_FOUND` with no distinguishing detail (never `AUTHORIZATION`, which would confirm existence). `Timing-Uniformity`: the not-owned and not-exist paths return identical timing/shape (§12.4).

**10. Idempotency Rules** — `Idempotency: required`; `expected_revision` makes retries safe (a replayed edit that already applied returns the same state; a stale revision → `CONFLICT`). No duplicate audit on replay within the dedup window (`[ESC-OPS-POLICY]`).

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Platform Core (DF-8):** audit-write. Non-disclosure (H.9): own-org only.

**12. AI-Agent Implementation Notes** — never expose whether a record exists outside the caller's org (collapse to `NOT_FOUND`). `source` is immutable post-create. Use `expected_revision` for optimistic concurrency (Doc-4A §14).

---

## §F4.3 — `ops.archive_private_vendor.v1` — Archive Private Vendor Record

**1. Contract Metadata** — Contract ID `ops.archive_private_vendor.v1` · Template **21.4 Command** · Owned aggregate **Private Vendor Record** · Actor **User** (buyer) · BC-OPS-1 (§F4).

**2. Request Schema** — `private_vendor_record_id : uuid (1, required)`; `expected_revision : numeric (1, required)` (concurrency).

**3. Response Schema** — `private_vendor_record_id : uuid (1)`, `state : enum<active|archived> (1) = archived`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `private_vendor_record_id`, `expected_revision` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_manage_private_vendors` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| record belongs to active org | 4 SCOPE | Doc-4A §7.3; §7.5 | buyer org owns the record | `NOT_FOUND` (collapse, H.9) |
| state = `active` | 6 STATE | Doc-2 §3.5 | archive legal only from `active` | `STATE` |
| revision match | 6 STATE / concurrency | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_private_vendors`** · Scope = buyer org owning the record · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`active`** · Target **`archived`** (Doc-2 §3.5) · Forbidden: `archived` (idempotent no-op or `STATE`) · Concurrency: optimistic; lost race → `CONFLICT`. *(Reactivation `archived → active` is not a Pass-A contract; not authored here — no edge added.)*

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** (nearest §9 Buyer-CRM action by pointer; archive not separately enumerated; channel Doc-2 §9 additive) · Attribution User · Object scope the record · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7) · Consumed none · Idempotency: replay → record stays `archived`, no duplicate audit.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | context/slug fail (own-org) | false |
| `NOT_FOUND` | record not owned by active org (collapse, H.9) | false |
| `STATE` | record already `archived` | false |
| `CONFLICT` | `expected_revision` ≠ current | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. `Timing-Uniformity`: not-owned and not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; replay → `archived` (no duplicate audit); `expected_revision` guards a concurrent edit.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Platform Core (DF-8):** audit-write.

**12. AI-Agent Implementation Notes** — archive is the only terminal state (no delete in Doc-2 §3.5); reactivation is not a Pass-A contract — do not synthesize one. Own-org only; collapse to `NOT_FOUND` otherwise.

---

## §F4.4 — `ops.add_private_vendor_note.v1` · `ops.set_private_vendor_rating.v1` — Notes & Ratings

**1. Contract Metadata** — Contract IDs `ops.add_private_vendor_note.v1`, `ops.set_private_vendor_rating.v1` · Template **21.4 Command** · Owned children **`private_vendor_notes`**, **`private_vendor_ratings`** (of the Private Vendor Record AR) · Actor **User** (buyer) · BC-OPS-1 (§F4).

**2. Request Schema** — *`add_private_vendor_note`:* `private_vendor_record_id : uuid (1, required)`; `note : text (1, required)` (Doc-2 §10.5 free-text note). *`set_private_vendor_rating`:* `private_vendor_record_id : uuid (1, required)`; `score : numeric (1, required)` (private score; bound range = dev-doc scope); `comment : text (0..1, nullable)` (Doc-2 §10.5 private score + comment).

**3. Response Schema** — `child_id : uuid (1)` (`note_id` / `rating_id`), `private_vendor_record_id : uuid (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields | 1 SYNTAX | Doc-4A §9 | presence/type (`note`/`score` required) | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_manage_private_vendors` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| parent record in active org | 4 SCOPE | Doc-4A §7.3; §7.5 | parent `private_vendor_records` owned by the buyer org | `NOT_FOUND` (collapse, H.9) |
| parent `active` (state) | 6 STATE | Doc-2 §3.5 | parent record is `active` (notes/ratings on an active record) | `STATE` |
| parent exists/readable | 7 REFERENCE | Doc-4A §4.5 (in-schema) | parent record id resolves within the org | `NOT_FOUND` (collapse) |
| `score` bound (rating only) | 8 BUSINESS | Doc-2 §10.5 (`private_vendor_ratings` = private score + comment); **`[ESC-OPS-POLICY]`** (Doc-3 §12.2 additive — no authoritative score bound registered) | the `score` numeric range/precision is **POLICY-bound**; the corpus fixes **no** score range — the bound key is carried as `[ESC-OPS-POLICY]` and referenced by name, **never invented** here | `VALIDATION` (when the resolved POLICY bound is violated) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_private_vendors`** (Doc-2 §7 — notes/ratings fall under the private-vendor CRM slug) · Scope = buyer org owning the parent record · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source: parent record `active` · Target: child row appended (`private_vendor_notes` simple; `private_vendor_ratings` simple — Doc-2 §3.5) · Forbidden: parent `archived` → `STATE` · Concurrency: child append; no row-revision race (additive).

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** (nearest §9 Buyer-CRM action by pointer; private notes/ratings not separately enumerated; channel Doc-2 §9 additive) · Attribution User · Object scope the note/rating row + parent ref · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7) · Consumed none · Idempotency: replay → one child row.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (missing `note`/`score`) | false |
| `AUTHORIZATION` | context/slug fail (own-org) | false |
| `NOT_FOUND` | parent record not owned by active org (collapse, H.9) | false |
| `STATE` | parent `archived` | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`; `V7 (reference) : NOT_FOUND | collapse-rule` — a parent outside the caller's org is `NOT_FOUND`, never `AUTHORIZATION`. `Timing-Uniformity`: identical for not-owned / not-exist parent.

**10. Idempotency Rules** — `Idempotency: required`; replay within window → one child row, no duplicate audit. A rating is a child row append per Doc-2 §10.5 (`private_vendor_ratings`); whether a re-`set` updates-in-place or appends is a development-doc detail (Doc-2 fixes neither) — the contract returns the resulting `rating_id` either way.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Platform Core (DF-8):** audit-write. Non-disclosure (H.9): buyer-private; never feeds any score (distinct from Trust `public_reviews`, DF-4).

**12. AI-Agent Implementation Notes** — notes/ratings are **buyer-private** (§7.5) and are **not** Trust performance inputs and **not** `public_reviews` (DF-4) — never surface them publicly or route them to any score. Own-org parent only; collapse to `NOT_FOUND` otherwise.

---

## §F4.5 — `ops.set_buyer_vendor_status.v1` · `ops.clear_buyer_vendor_status.v1` — Buyer-Vendor Status (non-disclosure-critical)

**1. Contract Metadata** — Contract IDs `ops.set_buyer_vendor_status.v1`, `ops.clear_buyer_vendor_status.v1` · Template **21.4 Command** · Owned child **`buyer_vendor_statuses`** (history child of Buyer–Supplier Relationship); creates the `buyer_supplier_relationships` container if absent · Actor **User** (buyer) · BC-OPS-1 (§F4).

**2. Request Schema** — *`set_buyer_vendor_status`:* `vendor_profile_id : uuid (1, required)` (Marketplace reference, DF-2); `status : enum<approved|conditional|blacklisted> (1, required)` (Doc-2 §10.5); `caveat_note : text (0..1, nullable)` (Doc-2 §10.5 `caveat_note`). *`clear_buyer_vendor_status`:* `vendor_profile_id : uuid (1, required)` **or** `buyer_supplier_relationship_id : uuid (1, required)` (one of); closes the current open status.

**3. Response Schema** — `buyer_supplier_relationship_id : uuid (1)`, `current_status : enum<approved|conditional|blacklisted|none> (1)` (`none` after clear), `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields | 1 SYNTAX | Doc-4A §9 | presence/type; `status` ∈ frozen enum | `VALIDATION` |
| `clear` identifier cardinality (one-of) | 1 SYNTAX | Doc-4A §9 (field presence) | (CLEAR path) **exactly one** of (`vendor_profile_id` \| `buyer_supplier_relationship_id`) MUST be supplied — both → `VALIDATION`; neither → `VALIDATION` | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_manage_vendor_status` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| relationship/target in active org | 4 SCOPE | Doc-4A §7.3; §7.5 | the relationship (if any) is the buyer org's | `NOT_FOUND` (collapse, H.9) |
| status precondition (set) | 6 STATE | Doc-2 §3.5/§10.5 | **applicable** — SET is legal from any current relationship status (`none` or an existing open status); a SET that supersedes an open status appends a new history row and closes the prior (`effective_to` set) — all SET source states are legal per the Doc-2 §3.5 machine (`none → approved\|conditional\|blacklisted` and supersede) | — (pass; no `STATE` failure on the SET path) |
| open status precondition (clear) | 6 STATE | Doc-2 §3.5/§10.5 | clear requires an open current status (`effective_to NULL`) | `STATE` |
| `vendor_profile_id` | 7 REFERENCE | Doc-4A §4.5; DF-2 | vendor profile exists via Marketplace service (read-only) | `REFERENCE` |
| append-only history | 8 BUSINESS | Doc-2 §10.5 | set appends a new row; clear closes current (`effective_to` set); never overwrite | `BUSINESS` (if overwrite attempted) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_vendor_status`** (Doc-2 §7) · Scope = buyer org (`organization_id`) · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — `buyer_vendor_statuses`: `none → approved | conditional | blacklisted` (set) / `approved|conditional|blacklisted → cleared` (clear) (Doc-2 §3.5) · **Append-only history** — set inserts a new row, clear sets `effective_to` on the current row; current = `effective_to NULL` (Doc-2 §10.5) · Forbidden: overwriting/deleting a history row → `BUSINESS` · Concurrency: a concurrent set/clear on the same relationship is serialized; a stale clear (no open row) → `STATE`.

**7. Audit Binding** — Action **Doc-2 §9 Buyer CRM** "vendor status set/changed/cleared (visible only to buyer org + platform compliance; never vendor-facing)" · Attribution **User** · Object scope `buyer_vendor_statuses` row + relationship · Timing same transaction · Source Doc-2 §9 + Doc-4B. *(This is a separately-enumerated §9 action — no `[ESC-OPS-AUDIT]` needed.)*

**8. Event Binding** — Emitted **none** (H.7 — status changes are state + audit only; **a blacklist/exclusion never emits a vendor-detectable signal**, §7.5) · Consumed none · Idempotency: replay → one history row.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `status` enum) | false |
| `AUTHORIZATION` | context/slug fail (own-org relationship) | false |
| `NOT_FOUND` | relationship not owned by active org (collapse, H.9) | false |
| `REFERENCE` | `vendor_profile_id` does not exist / does not resolve at the Marketplace service (a definitive negative answer) | false |
| `STATE` | clear with no open status | false |
| `BUSINESS` | overwrite/delete of a history row | false |
| `DEPENDENCY` | Marketplace or Doc-4B service transiently unavailable / no definitive answer (retry per outbox/Doc-4A retry semantics) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. The status is a protected fact (§7.5): a relationship outside the caller's org is `NOT_FOUND`. `Timing-Uniformity`: not-owned / not-exist identical. **`vendor_profile_id` REFERENCE check is performed against Marketplace existence only — it never reveals any other buyer's status for that vendor** (status is per-(buyer org, vendor), Doc-2 §10.5).

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-OPS-POLICY]`); replay within window → one appended history row (set) or one close (clear), **no duplicate audit**. Re-setting the same status value within the window is a replay (same result); a genuinely new set after the window appends a new history row by design (Doc-2 §10.5 history semantics).

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Marketplace (DF-2):** `vendor_profile_id` existence (read-only service). **Platform Core (DF-8):** audit-write. **RFQ (DF-3):** consumes the resulting status **only** via the CRM status read-service (§F4.7) — never pushed. **Firewall (§4B):** buyer-private status; never a paid signal; never mutated by or mutating a Trust signal.

**12. AI-Agent Implementation Notes** — **non-disclosure is absolute** (§7.5; Doc-2 §10.11): a `blacklisted` status surfaces to RFQ routing **only** as an eligibility exclusion via the read-service, indistinguishable from a non-match — never as a vendor-detectable or buyer-list-detectable fact, never in any error/log. Status history is **append-only evidence** — never overwrite or delete a row (Doc-2 §10.5). The status is buyer-private and per-vendor; never a platform-wide signal, never crosses the §4B firewall.

---

## §F4.6 — `ops.set_vendor_favorite.v1` · `ops.clear_vendor_favorite.v1` — CRM Favorites

**1. Contract Metadata** — Contract IDs `ops.set_vendor_favorite.v1`, `ops.clear_vendor_favorite.v1` · Template **21.4 Command** · Owned child **`vendor_favorites`** (of Buyer–Supplier Relationship) · Actor **User** (buyer) · BC-OPS-1 (§F4).

**2. Request Schema** — `vendor_profile_id : uuid (1, required)` **or** `buyer_supplier_relationship_id : uuid (1, required)` (one of); creates the relationship container if absent (set).

**3. Response Schema** — `buyer_supplier_relationship_id : uuid (1)`, `is_favorite : bool (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| identifier cardinality (one-of) | 1 SYNTAX | Doc-4A §9 (field presence) | **exactly one** of (`vendor_profile_id` \| `buyer_supplier_relationship_id`) MUST be supplied — both → `VALIDATION`; neither → `VALIDATION` | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_manage_private_vendors` | 3 AUTHZ | Doc-2 §7 | slug held (CRM favorites under the private-vendor slug) | `AUTHORIZATION` |
| relationship in active org | 4 SCOPE | Doc-4A §7.3; §7.5 | the relationship (if any) is the buyer org's | `NOT_FOUND` (collapse, H.9) |
| `vendor_profile_id` | 7 REFERENCE | Doc-4A §4.5; DF-2 | vendor profile exists via Marketplace service | `REFERENCE` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_private_vendors`** (Doc-2 §7 — CRM favorites fall under the private-vendor CRM slug, PATCH-02) · Scope = buyer org · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — `vendor_favorites` are **flag rows** (Doc-2 §10.5 — no lifecycle) · set = flag on, clear = flag off · Concurrency: idempotent flag (set-set / clear-clear are no-ops returning current).

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** (nearest §9 Buyer-CRM action by pointer; favorite set/clear not separately enumerated; channel Doc-2 §9 additive) · Attribution User · Object scope the `vendor_favorites` row + relationship · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7) · Consumed none · Idempotency: replay → flag unchanged.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | context/slug fail (own-org) | false |
| `NOT_FOUND` | relationship not owned by active org (collapse, H.9) | false |
| `REFERENCE` | `vendor_profile_id` not found (Marketplace service) | false (true if transient `DEPENDENCY`) |
| `DEPENDENCY` | Marketplace/Doc-4B transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; flag operation is naturally idempotent (set→on, clear→off); replay → same flag, no duplicate audit.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Marketplace (DF-2):** `vendor_profile_id` existence (read-only). **Platform Core (DF-8):** audit-write. Non-disclosure (H.9): buyer-private.

**12. AI-Agent Implementation Notes** — these are **CRM** favorites (`operations.vendor_favorites`, PATCH-02) — never conflate with `marketplace.catalog_favorites` (public catalog bookmarks, Doc-4D); buyer-private, never vendor-facing (§7.5).

---

## §F4.7 — `ops.confirm_vendor_link.v1` · `ops.dismiss_vendor_link.v1` — Private↔Public Link (link-not-merge)

**1. Contract Metadata** — Contract IDs `ops.confirm_vendor_link.v1`, `ops.dismiss_vendor_link.v1` · Template **21.4 Command** · Owned column-set **on `private_vendor_records`** (`linked_vendor_profile_id`, `link_status`, `link_confidence`, `linked_at`, `link_confirmed_by`) · Actor **User** (buyer) · BC-OPS-1 (§F4). The **suggestion entity is Admin-owned** (`admin.link_suggestions` — DF-5).

**2. Request Schema** — `private_vendor_record_id : uuid (1, required)`; `vendor_profile_id : uuid (1, required)` (Marketplace reference, DF-2); `decision : enum<confirm|dismiss> (1, required)`; `link_suggestion_id : uuid (0..1, nullable)` (optional originating Admin `link_suggestions` candidate, DF-5); `expected_revision : numeric (1, required)` (concurrency).

**3. Response Schema** — `private_vendor_record_id : uuid (1)`, `link_status : enum<none|suggested|linked> (1)`, `linked_vendor_profile_id : uuid (0..1, nullable)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields | 1 SYNTAX | Doc-4A §9 | presence/type; `decision` ∈ {confirm,dismiss} | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_manage_private_vendors` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| record in active org | 4 SCOPE | Doc-4A §7.3; §7.5 | the `private_vendor_records` row is the buyer org's | `NOT_FOUND` (collapse, H.9) |
| `vendor_profile_id` | 7 REFERENCE | Doc-4A §4.5; DF-2 | vendor profile exists via Marketplace service | `REFERENCE` |
| `link_suggestion_id` (if present) | 7 REFERENCE | Doc-4A §4.5; DF-5 | suggestion candidate resolves (Admin service) | `REFERENCE` |
| link transition legal | 6 STATE | Doc-2 §10.5 | `link_status` `none→suggested→linked` (confirm) / `→none` (dismiss) | `STATE` |
| revision match | 6 STATE / concurrency | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| link-not-merge | 8 BUSINESS | ADR-003; PATCH-05 | confirm writes only the link columns; never merges/moves data | `BUSINESS` (if a merge is attempted) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_private_vendors`** (Doc-2 §7) · Scope = buyer org owning the `private_vendor_records` row · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — `link_status` column on `private_vendor_records`: `none → suggested → linked` (confirm) / any → `none` (dismiss) (Doc-2 §10.5) · no aggregate-root (`active/archived`) change · Forbidden: confirming an already-`linked` record to a different profile without dismiss first → `STATE` · Concurrency: optimistic on `expected_revision`; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Admin** "link confirm/dismiss" (the link decision is the §9 Admin-enumerated action; the Operations service performs the column write, attribution = the executing **User**, Doc-4A §17) · Object scope the `private_vendor_records` link columns · Timing same transaction · Source Doc-2 §9 + Doc-4B. *(Pass-A §F4 records this primary §9 Admin binding; the conditional `[ESC-OPS-AUDIT]` fallback applies only if a reviewer reads §9 "link confirm/dismiss" as Admin-actor-exclusive — carried, not resolved here.)*

**8. Event Binding** — Emitted **none** (H.7 — linking is state + audit only) · Consumed none (the Admin `link_suggestions` candidate is read synchronously, not event-consumed) · Idempotency: replay → same `link_status`.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `decision`) | false |
| `AUTHORIZATION` | context/slug fail (own-org record) | false |
| `NOT_FOUND` | record not owned by active org (collapse, H.9) | false |
| `REFERENCE` | `vendor_profile_id` (Marketplace) or `link_suggestion_id` (Admin) does not exist / does not resolve (a definitive negative answer) | false |
| `STATE` | illegal link transition (e.g., re-link without dismiss) | false |
| `CONFLICT` | `expected_revision` ≠ current | true |
| `BUSINESS` | merge attempt (link-not-merge violation) | false |
| `DEPENDENCY` | Marketplace, Admin, or Doc-4B service transiently unavailable / no definitive answer (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — the private record is buyer-private; a non-owned record is `NOT_FOUND`. The `vendor_profile_id` REFERENCE check reveals only Marketplace existence (public), never another buyer's link. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; `expected_revision` guards concurrent links; replay → same `link_status`/`linked_vendor_profile_id`, no duplicate audit.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Marketplace (DF-2):** `vendor_profile_id` existence (read-only). **Admin (DF-5):** `link_suggestions` candidate read (the suggestion entity stays Admin-owned; confirmation writes the Operations link columns — Doc-2 §10.9). **Platform Core (DF-8):** audit-write.

**12. AI-Agent Implementation Notes** — **link-not-merge** (ADR-003; PATCH-05): confirm writes only the `private_vendor_records` link columns — the public profile stays Marketplace-owned (DF-2), the private data stays private (§7.5), no data is merged or moved. The *suggestion* is Admin's (DF-5); Operations writes only its own link columns. Own-org record only; collapse to `NOT_FOUND` otherwise.

---

## §F4.8 — `ops.read_crm_status_for_routing.v1` — CRM Status Read-Service (RFQ routing; non-disclosure) — *the DF-3 seam*

**1. Contract Metadata** — Contract ID `ops.read_crm_status_for_routing.v1` · Template **21.3 Query** · Read over **`buyer_vendor_statuses`** (current rows) · Actor types **internal-service** (RFQ matching/routing composition; Doc-4A §5 internal-service composition notation, per the frozen Doc-4E precedent) · BC-OPS-1 (§F4). **Never a tenant-facing surface.**

**2. Request Schema** — `buyer_organization_id : uuid (1, required)`; `vendor_profile_ids : uuid[] (1..N, required)` (the candidate set for one routing run; the array's maximum cardinality is **POLICY-bound** and carried as **`[ESC-OPS-POLICY]`** — Doc-3 §12.2 additive; **no numeric limit is invented here**, the bound key is referenced by name once registered, per Doc-4A §9.4 bounded-collection rule).

**3. Response Schema** — `statuses : list<object{ vendor_profile_id : uuid, current_status : enum<approved|conditional|blacklisted|none> }> (0..N)`, `reference_id : uuid (1)`. *(Returns the buyer's current per-vendor status for the requested candidates; `none` where no open status exists.)*

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `buyer_organization_id`, `vendor_profile_ids` | 1 SYNTAX | Doc-4A §9 | presence/type; non-empty bounded array | `VALIDATION` |
| internal-service caller | 2 CONTEXT | Doc-4A §5 (internal-service) | caller is the RFQ routing internal-service context (not a tenant actor) | `AUTHORIZATION` |
| (slug) | 3 AUTHZ | — | internal-service composition read; no tenant slug (the consuming RFQ contract holds its own authority) | — |
| boundary scope | 4 SCOPE | Doc-4A §7.3; §7.5 | the read is for the named `buyer_organization_id`'s own statuses only | `AUTHORIZATION` |
| (reference) | 7 REFERENCE | — | candidate `vendor_profile_ids` taken as given (already validated upstream by RFQ) | — |

**5. Authorization Matrix** — Actor **internal-service** (RFQ routing composition) · Slug **none** (internal-service boundary; **not** a tenant-slug surface — the consuming RFQ contract enforces its own authorization) · Scope = the named buyer org's statuses · Delegation not eligible · Enforcement: internal-service-to-Operations boundary; **not exposed to any tenant actor**.

**6. State Machine Enforcement** — None (read). Returns only **current** rows (`effective_to NULL`, Doc-2 §10.5).

**7. Audit Binding** — **None** (read; Doc-4A §17.1 — reads not audited).

**8. Event Binding** — Emitted **none** · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (empty/unbounded array) | false |
| `AUTHORIZATION` | caller is not the internal-service routing context | false |
| `DEPENDENCY` | Doc-4B / internal status-store transiently unavailable / no definitive answer (retry); this query performs **no** `REFERENCE` validation — candidate `vendor_profile_ids` are validated upstream by RFQ (Section 4), so no `REFERENCE`/`DEPENDENCY` conflation arises | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** this is the **single sanctioned egress** of `buyer_vendor_statuses` and it is **internal-service-only** — a non-internal caller receives `AUTHORIZATION` with no status data; the surface is never tenant-vendor or general-buyer exposed. The **consuming RFQ contract** is responsible for the downstream non-disclosure collapse (a `blacklisted` status becomes an eligibility exclusion **indistinguishable from a non-match**, Doc-2 §10.11.10; §7.5) — Operations supplies the fact only to the sanctioned internal caller.

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure query, Doc-4A §14.1); side-effect-free.

**11. Cross-Module References** — **RFQ (DF-3):** the consumer — RFQ routing reads this service per matching run; **Operations owns the data, RFQ holds no copy.** **Platform Core (DF-8):** none beyond read infrastructure. **Firewall (§4B):** buyer-private status as an eligibility input; never a paid signal, never mutated by or mutating a Trust signal.

**12. AI-Agent Implementation Notes** — this is the **only** sanctioned disclosure path for Buyer-Vendor Status, and only to RFQ routing under non-disclosure (Doc-2 §10.5/§10.11; §7.5). Never widen this surface; never expose it to a vendor, to a general buyer read, or in any log/error. The blacklist becomes routing exclusion only — never a vendor-detectable fact. Returns current rows only.

---

## §F4.9 — `ops.get_private_vendor.v1` · `ops.list_private_vendors.v1` · `ops.get_buyer_supplier_relationship.v1` — Buyer CRM Reads

**1. Contract Metadata** — Contract IDs `ops.get_private_vendor.v1`, `ops.list_private_vendors.v1`, `ops.get_buyer_supplier_relationship.v1` · Template **21.3 Query** · Reads over `private_vendor_records`(+notes/ratings), `buyer_supplier_relationships`(+statuses/favorites) · Actor types **User** (buyer member, own org only) · BC-OPS-1 (§F4).

**2. Request Schema** — *`get_private_vendor`:* `private_vendor_record_id : uuid (1, required)`. *`get_buyer_supplier_relationship`:* `buyer_supplier_relationship_id : uuid (1, required)` **or** `vendor_profile_id : uuid (1, required)`. *`list_private_vendors`:* `filter : object{ link_status?, source?, is_favorite? } (0..1, nullable; allowlisted fields only, Doc-4A §9.6)`; `page_size : numeric (0..1)` (bounded by POLICY key §18 — `[ESC-OPS-POLICY]`; default by POLICY key); `page_token : string (0..1, nullable)` (Doc-4A §22.3).

**3. Response Schema** — *`get_private_vendor`:* `record : object{ private_vendor_record_id, name, email, phone, details_jsonb, source, link_status, linked_vendor_profile_id, state }`, `notes : list<object{note_id, note}>`, `ratings : list<object{rating_id, score, comment}>`, `reference_id`. *`get_buyer_supplier_relationship`:* `relationship : object{ buyer_supplier_relationship_id, vendor_profile_id, current_status, is_favorite }`, `reference_id`. *`list_private_vendors`:* `items : list<object{ private_vendor_record_id, name, link_status, state }>`, `next_page_token : string (0..1)`, `reference_id`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields / filter | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_manage_private_vendors` | 3 AUTHZ | Doc-2 §7 | slug held (CRM read under the private-vendor slug; **no separate read slug in Doc-2 §7** — carry `[ESC-OPS-SLUG]` only if a distinct read slug is later required) | `AUTHORIZATION` |
| `get_buyer_supplier_relationship` identifier cardinality (one-of) | 1 SYNTAX | Doc-4A §9 (field presence) | **exactly one** of (`buyer_supplier_relationship_id` \| `vendor_profile_id`) MUST be supplied — both → `VALIDATION`; neither → `VALIDATION` | `VALIDATION` |
| record/relationship in active org | 4 SCOPE | Doc-4A §7.3; §7.5 | the target is the buyer org's | `NOT_FOUND` (collapse, H.9) |
| `filter.is_favorite` semantics | 1 SYNTAX | Doc-2 §3.5/§10.5 (`vendor_favorites` is a child of `buyer_supplier_relationships`) | `is_favorite` filters on the **`buyer_supplier_relationships` → `vendor_favorites` flag**, which keys on `vendor_profile_id`; it therefore matches **only records whose `link_status = linked`** (an unlinked `private_vendor_records` row has no `vendor_profile_id` and thus no `buyer_supplier_relationships`/`vendor_favorites` row) — unlinked records are **never** returned by an `is_favorite = true` filter; `is_favorite = false`/absent applies no favorite constraint | `VALIDATION` (malformed filter value) |
| `page_size` bound | 9 POLICY | Doc-4A §18 | within POLICY bound (`[ESC-OPS-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_private_vendors`** (Doc-2 §7) · Scope = **own buyer org only** · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — None (read).

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Emitted **none** · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter/sort field; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (own-org) | false |
| `NOT_FOUND` | record/relationship not owned by active org (collapse, H.9) | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a record/relationship outside the caller's org is `NOT_FOUND`; the vendor never learns it is recorded/rated/statused/favorited (§7.5). `list` returns **only** the caller's own-org rows; cross-tenant rows are never enumerated. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure queries, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Marketplace (DF-2):** linked public-profile display columns read by service (read-only) where a record is `linked`. **Platform Core (DF-8):** none beyond read infrastructure. Non-disclosure (H.9): own-org only.

**12. AI-Agent Implementation Notes** — strictly **own-org** CRM data; never cross-tenant; the `list` surface enumerates only the caller's records. A vendor never sees that they are recorded, rated, statused, or favorited (§7.5). Linked public-profile fields are read from Marketplace by service (DF-2) — never re-modeled.

---

## Appendix A — BC-OPS-1 Contract Register (Pass-B Part 1)

| § | Contract-ID(s) | Template | Owned entity (Doc-2) | Actor | Emits event | Audit (Doc-2 §9) |
|---|---|---|---|---|---|---|
| §F4.1 | `ops.create_private_vendor.v1` | 21.4 | `private_vendor_records` | User | none | `[ESC-OPS-AUDIT]` (Buyer CRM) |
| §F4.2 | `ops.update_private_vendor.v1` | 21.4 | `private_vendor_records` | User | none | `[ESC-OPS-AUDIT]` (Buyer CRM) |
| §F4.3 | `ops.archive_private_vendor.v1` | 21.4 | `private_vendor_records` | User | none | `[ESC-OPS-AUDIT]` (Buyer CRM) |
| §F4.4 | `ops.add_private_vendor_note.v1` · `ops.set_private_vendor_rating.v1` | 21.4 | `private_vendor_notes` · `private_vendor_ratings` | User | none | `[ESC-OPS-AUDIT]` (Buyer CRM) |
| §F4.5 | `ops.set_buyer_vendor_status.v1` · `ops.clear_buyer_vendor_status.v1` | 21.4 | `buyer_vendor_statuses` | User | none | **§9 Buyer CRM** "vendor status set/changed/cleared" |
| §F4.6 | `ops.set_vendor_favorite.v1` · `ops.clear_vendor_favorite.v1` | 21.4 | `vendor_favorites` | User | none | `[ESC-OPS-AUDIT]` (Buyer CRM) |
| §F4.7 | `ops.confirm_vendor_link.v1` · `ops.dismiss_vendor_link.v1` | 21.4 | link columns on `private_vendor_records` | User | none | **§9 Admin** "link confirm/dismiss" |
| §F4.8 | `ops.read_crm_status_for_routing.v1` | 21.3 | `buyer_vendor_statuses` (read) | internal-service | none | none (read) |
| §F4.9 | `ops.get_private_vendor.v1` · `ops.list_private_vendors.v1` · `ops.get_buyer_supplier_relationship.v1` | 21.3 | Private Vendor Record; Buyer–Supplier Relationship | User | none | none (read) |

**Part-1 invariants (held):** BC-OPS-1 owns exactly two aggregates (Private Vendor Record, Buyer–Supplier Relationship); **emits zero domain events** (state + audit only — Doc-2 §8); binds Doc-2 §7 slugs `can_manage_private_vendors`/`can_manage_vendor_status` only (no slug invented); binds Doc-2 §9 Buyer-CRM/Admin actions or carries `[ESC-OPS-AUDIT]` (no action invented); carries `[ESC-OPS-POLICY]` for the dedup-window/page-size keys (no key invented) and `[ESC-OPS-SLUG]` for the read-slug question (no slug invented); the **non-disclosure invariant** is enforced on every surface (own-org scope + `NOT_FOUND` collapse + the single sanctioned read-service egress). **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

---

## Appendix B — Carried Markers (Part 1; unchanged)

- **DF-1** (Identity — `check_permission`/org-context, consumed), **DF-2** (Marketplace — `vendor_profile_id` existence, read-only), **DF-3** (RFQ — consumes the CRM status read-service §F4.8), **DF-5** (Admin — `link_suggestions` candidate, Admin-owned), **DF-8** (Platform Core — audit-write).
- **`[ESC-OPS-AUDIT]`** (Doc-2 §9 additive) — private-record create/edit/archive, notes, ratings, favorites (nearest Buyer-CRM action bound by pointer).
- **`[ESC-OPS-POLICY]`** (Doc-3 §12.2 additive) — idempotency dedup-window key and list `page_size` bound (no `operations` POLICY namespace registered; platform default referenced by name; no key invented).
- **`[ESC-OPS-SLUG]`** (Doc-2 §7 additive) — only if a distinct CRM **read** slug is later required (current reads bind `can_manage_private_vendors`).

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4F — Pass-B (Hardening) Part 1 v1.0 — BC-OPS-1 Buyer Private CRM. Authored against `Doc-4F_Content_v1.0_PassA_FROZEN.md` (sole contract authority) and `Doc-4F_Structure_v1.0_FROZEN.md`. Hardens the §F4 contracts to implementation grade (field-level schemas, Doc-4A §11.2 nine-stage validation matrices, authorization matrices, state-machine enforcement, audit bindings, error registers with §12.4 Error Boundary blocks, idempotency) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. BC-OPS-1 emits no domain event; the non-disclosure invariant (§7.5; Doc-2 §10.11) is enforced on every surface; carried markers DF-1/DF-2/DF-3/DF-5/DF-8, `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Authorized next stage: Doc-4F_PassB_Part2 (BC-OPS-2).*
