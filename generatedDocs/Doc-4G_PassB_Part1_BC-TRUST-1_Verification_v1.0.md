# Doc-4G — Trust & Verification Engine — Pass-B (Hardening) Part 1 v1.0 — BC-TRUST-1 Verification & Verified Tier

| Field | Value |
|---|---|
| Document | Doc-4G — **Pass-B Part 1 v1.0** — Module 5 Trust & Verification (`trust` schema, `trust_` namespace) |
| Part scope | **BC-TRUST-1 — Verification & Verified Tier (§G4)** — the Pass-A §G4 contracts (Verification Case + Verified Financial Tier aggregates), hardened to implementation grade |
| Status | **Pass-B Part 1 draft — implementation-grade contract specification for BC-TRUST-1.** Independently reviewable. Authorized next stage after review/patch: **Doc-4G_PassB_Part2 (BC-TRUST-2 Trust Scoring).** |
| Contract authority | `Doc-4G_PassA_Content_v1.0` as amended by `Doc-4G_PassA_Patch_v1.0` (FROZEN; sole contract authority — **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4G_Structure_v1.0_FROZEN` |
| Authority | Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN, Doc-4G Pass-A FROZEN — all FROZEN |
| Parts (sequence) | **Part 1 — BC-TRUST-1 Verification & Verified Tier** · Part 2 — BC-TRUST-2 Trust Scoring · Part 3 — BC-TRUST-3 Performance Scoring · Part 4 — BC-TRUST-4 Fraud & Risk Signals · Part 5 — BC-TRUST-5 Reviews & Admin Ratings |
| Audience | Claude Code / Cursor / Codex / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Pass-B mission (Part 1).** Convert the Pass-A BC-TRUST-1 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices bound to the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement (allowed/forbidden source states + concurrency), audit bindings, event bindings, error registers (Doc-4A §12 closed class set), and idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §G4. The **trust firewall** (Trust is the sole authority/computer of Verification, Verified Tier, Trust Score, Performance Score, Fraud Signals — no external ownership or mutation; no Billing influence) and the **procurement moat** (Trust owns no matching/routing/ranking/quotation-evaluation/supplier-selection/award; RFQ authoritative) hold on every surface. Carried dependencies **DG-1, DG-2, DG-5, DG-6, DG-8** (the BC-TRUST-1 seams) and the markers **`[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 1.

---

## §H — Part-1 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; the canonical nine-stage order, FROZEN, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. **Board label mapping (this Part):** the authoring-standard labels map onto the frozen §11.2 pipeline with no reordering — **SYNTAX** = §11.2 SYNTAX (presence/type/bounds/enum, §9); **SHAPE** = the field-shape aspect of §11.2 SYNTAX (cardinality/nullable/structural shape); **SEMANTIC** = §11.2 BUSINESS (domain-meaning rules); **AUTHENTICATION** = §11.2 CONTEXT (actor type + active-org/admin-scope authenticity, §5.2/§5.3/§5.6); **AUTHORIZATION** = §11.2 AUTHZ + SCOPE + DELEGATION (§6/§6B); then **STATE → REFERENCE → BUSINESS → POLICY** identical. Doc-4A is FROZEN and authoritative on stage order; this Part binds to it. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is always established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, the **source authority**, the **rule (validation)**, and the **failure outcome (failure class)**.
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source — never extended), `string`, `text`, `numeric`, `uuid[]`/`string[]` (arrays; cardinality stated), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, not internal field schema, which is development-doc scope), `timestamptz`, `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Tenant commands check active **Membership + Permission Slug + Resource Scope**; platform-staff commands check a **platform-staff slug** with **no active-org context** (§5.6). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement source for every check is Identity's `check_permission` (Doc-4C, consumed; no shadow authorization). **Confirmed Doc-2 §7 slugs used in this Part:** `can_submit_verification` (Owner-only — "Ownership transfer / org delete / verification submission" row), `staff_can_verify` (Verification Admin), `staff_can_ban` (compliance/ban-driven revoke). Score computation does not occur in this Part (it is BC-TRUST-2/3 — System actor). **Verification submission scope** = the organization that owns the subject (vendor profile/organization/declared tier); verification **decisions/tier management** are platform-staff (no tenant scope). BC-TRUST-1 staff actions are **not delegation-eligible** (§6B n/a). Where a required staff action lacks a §7 slug → **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive channel; no slug invented).
- **H.4 — Error model (Doc-4A §12; closed twelve-class set, Annexure B).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id` (§12.1/Annexure B.2). Error codes follow **`trust_<domain>_<code>`** (Appendix B namespace `trust_`); **specific numeric codes are assigned at the development-document stage** — Pass-B fixes the **class + trigger + retryable** per error, not the integer. **Mandatory separations (never conflated):** **REFERENCE** (Domain, 422 — a cross-module/in-module reference ID is syntactically valid but does not resolve to an existing entity) is distinct from **DEPENDENCY** (Infrastructure, 503, retryable — a consumed service is transiently unavailable); **STATE** (Domain, 409 — entity not in a valid pre-state) is distinct from **CONFLICT** (Concurrency, 409, retryable after re-read — optimistic-concurrency token mismatch). **Protected-fact failures collapse to `NOT_FOUND`** (§7.5; §12.4) — applied on the verification-submission scope check (a caller acting on a subject its org does not own must not learn the subject/case exists). The **Error Boundary block** (§12.4/§12.6) is stated per contract.
- **H.5 — State machines (Doc-2 §5.6 + §3.6/§10.6; Doc-4A §13).** The BC-TRUST-1 lifecycles are exactly: **Verification** (`verification_records`) — `requested → in_review` (assign), `in_review → approved | rejected` (decide), `in_review → requested` (request more info), `approved → expired` (lapse/document expiry), `approved → revoked` (fraud/compliance) [Doc-2 §5.6]; **Verified Financial Tier** (`verified_financial_tiers`) — `pending_verification → verified → suspended | expired`; "Declared Only" = **absence** of a row [Doc-2 §3.6/§10.6]; **`verification_decisions`** — append-only child. Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all others → `STATE`). Concurrency: optimistic — mutating commands assert the expected row revision; a lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified** — Pass-B enforces the frozen Doc-2 §5.6/§3.6 edges only.
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`Admin` for staff actions; `System` for system transitions; `User` for submission), **object scope** (the `trust.*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B write mechanism). Reads are not audited (§17.1). The **separately-enumerated** Doc-2 §9 **Trust** actions this Part binds directly are: **"verification request"**, **"verification … decision"**, **"verification … revoke"**, **"verification … expiry"**, **"admin tier override"**. Verified-tier **status transitions** (set/confirm/downgrade/suspend/expire) beyond "admin tier override", and **case assignment**, are **not** separately enumerated → carry **`[ESC-TRUST-AUDIT]`** (interim: nearest §9 Trust action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §G4/§G12/§G14.
- **H.7 — Events (Doc-2 §8 via Doc-4B `core.write_outbox_event.v1`).** The BC-TRUST-1 emitted set is **only**: **`VendorVerified`** (`trust.verification_records`, on approve) and **`VendorTierChanged`** with payload `tier_type='verified'` (`trust.verified_financial_tiers`, on tier status change). Emitted transactionally (business write + event insert one transaction); **no event coined** (§16.4). **Trust never writes `marketplace.financial_tier_history`** — it emits `VendorTierChanged[verified]` and Marketplace consumes it (Doc-2 §8 ownership note). **Non-events (Doc-2 §8):** case open (request), assignment, request-more-info, reject, revoke, and verification expiry emit **no** domain event (state + §9 audit only); downstream eligibility/tier consumers read state by service or react to the verified-tier event. Notification fan-out of emitted events is Communication's (DG-6), not authored here.
- **H.8 — Idempotency (Doc-4A §14).** Every command carries `Idempotency: required` + a dedup window (POLICY key). **No `trust` dedup-window key is registered in Doc-3 §12.2** → the window key is carried under **`[ESC-TRUST-POLICY]`** (interim: reference the platform default dedup-window key by name; **no key invented** — Doc-3 §12.2 additive channel). Replay within the window → same result, **no duplicate audit, no duplicate event** (outbox dedup on event identity). System transitions (21.5) are idempotent on the target state (re-running an expiry on an already-expired record is a no-op). Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Trust-firewall & moat enforcement (Architecture §1.5/Invariant 6; Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED — load-bearing per contract).** (a) Verification and verified-tier are **platform-owned**, decided by platform-staff/System; no tenant and no other module mutates them. (b) A verified-tier change **validates the declared tier without owning it** (Architecture Patch v1.0.1 PATCH-01) — the declared tier stays in `marketplace.declared_financial_tiers`; Trust never writes `marketplace.financial_tier_history`. (c) **Financial Tier never feeds Trust/Performance Score** (Invariant 6) — no scoring occurs in this Part, and the verified-tier value is published, never cross-wired into a score. (d) **No paid plan/entitlement/flag gates verification, verified-tier, eligibility, routing, or matching** (Doc-4A §4B; DG-7). (e) **Procurement moat:** this Part computes no matching/routing/ranking/evaluation/selection/award; the verified-tier band and verification status are signals RFQ consumes (DG-3), never decisions Trust makes.
- **H.10 — `trust` BC-TRUST-1 field source (Doc-2 §10.6).** The hardened schemas bind to the frozen Doc-2 §10.6 columns; **Pass-B introduces no column** — it binds existing ones:
  - `verification_records`: `subject_id` + `subject_type enum<vendor_profile|organization|capacity_claim|declared_tier>`, `verification_type enum<contact|business|factory|organization|tier|capacity>`, `state` (§5.6), `evidence_document_refs[]`, `requested_by`, `expires_at` (+ standard columns).
  - `verification_decisions`: → `verification_records`; `decision enum<approve|reject|confirm|downgrade|request_info>`, `reason`, `decided_by` (staff user), `verification_task_id` (admin ref), `decided_at` (append-only).
  - `verified_financial_tiers`: `vendor_profile_id` (UNIQUE partial), `tier enum<A|B|C|D|E>`, `status enum<pending_verification|verified|suspended|expired>`, `verified_at`, `next_review_at` (+24mo), `basis_jsonb`.
  - *(referenced, not owned)* `marketplace.declared_financial_tiers` (DG-2, read), `vendor_profiles` (DG-2, read by UUID), `admin` verification-task queue (DG-5, `verification_task_id` read-only).

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.** Grouped families share section 1 and split the records where the schema differs.

---

## §G4.1 — `trust.request_verification.v1` — Request Verification Case

**1. Contract Metadata** — Contract ID `trust.request_verification.v1` · Template **21.4 Command** · Owned aggregate **Verification Case** (`verification_records` AR) · Actor types **User** (Owner of the subject-owning org) · Bounded context **BC-TRUST-1** (§G4) · Lifecycle entry Doc-2 §5.6 `requested`.

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes (source) |
|---|---|---|---|---|---|
| `subject_id` | `uuid` | yes | no | 1 | Doc-2 §10.6 `subject_id` (the vendor_profile/organization/etc.) |
| `subject_type` | `enum<vendor_profile\|organization\|capacity_claim\|declared_tier>` | yes | no | 1 | Doc-2 §10.6/§5.6 (fixed enum; do not extend) |
| `verification_type` | `enum<contact\|business\|factory\|organization\|tier\|capacity>` | yes | no | 1 | Doc-2 §10.6 `verification_type` (fixed enum) |
| `evidence_document_refs` | `uuid[]` | no | yes | 0..n | Doc-2 §10.6 `evidence_document_refs[]` (document IDs; Platform Core storage refs) |

**3. Response Schema** — `verification_record_id : uuid (1)`, `state : enum<requested|in_review|approved|rejected|expired|revoked> (1) = requested`, `reference_id : uuid (1)` (Doc-4A §22.1 C-05).

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `subject_id`, `subject_type`, `verification_type` typed; enums ∈ frozen sets | 1 SYNTAX (incl. SHAPE) | Doc-4A §9; Doc-2 §10.6 | presence/type/cardinality; enums ∈ Doc-2 §10.6 sets | `VALIDATION` (aggregated) |
| actor + authenticity | 2 CONTEXT (AUTHENTICATION) | Doc-4A §5.2/§5.3 | actor is User; active org context valid | `AUTHORIZATION` |
| `can_submit_verification` | 3 AUTHZ | Doc-2 §7; Doc-4A §6 | membership holds the Owner-only slug | `AUTHORIZATION` |
| subject owned by caller's org | 4 SCOPE | Doc-4A §6.1/§7.3/§7.5 | the submitting org owns `subject_id` | `NOT_FOUND` (protected-fact collapse, H.4/H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| (state) | 6 STATE | Doc-2 §5.6 | n/a — case open has no prior state | — |
| `subject_id` resolves (Marketplace/Identity) | 7 REFERENCE | Doc-2 §10.6; DG-2/DG-1 | `subject_id` resolves to an existing entity via service | `REFERENCE` (unresolved ref) ; `DEPENDENCY` (resolver service down) |
| duplicate open case guard | 8 BUSINESS | Doc-2 §10.6 | no existing open case for same subject+type (business rule) | `BUSINESS` |
| (policy) | 9 POLICY | Doc-3 §12.2 | none | — |

**5. Authorization Matrix** — Actor **User** · Slug **`can_submit_verification`** (Doc-2 §7, Owner-only) · Scope = the org owning `subject_id` · Delegation **not eligible** (H.3) · Enforcement Identity `check_permission` (Doc-4C).

**6. State Machine Enforcement** — Allowed source states **none** (case open) · Target **`requested`** (Doc-2 §5.6 entry) · Forbidden: n/a · Concurrency: new row; business guard prevents a second open case for the same subject+type (→ `BUSINESS`, not `CONFLICT`).

**7. Audit Binding** — Action **Doc-2 §9 Trust "verification request"** (separately enumerated) · Attribution **User** (`requested_by`) · Object scope new `verification_records` row · Timing same transaction · Source Doc-2 §9 + Doc-4B `core.append_audit_record.v1`.

**8. Event Binding** — Emitted **none** (H.7 — case open emits no event) · Consumed none · Idempotency: replay → one case, no duplicate audit.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (missing field; enum out of set) | false |
| `AUTHORIZATION` | actor/context/slug fail (stages 2–3), caller is a member but lacks `can_submit_verification` | false |
| `NOT_FOUND` | subject not owned by caller's org (protected-fact collapse, stage 4) | false |
| `REFERENCE` | `subject_id` syntactically valid but unresolved (stage 7) | false |
| `BUSINESS` | open case already exists for subject+type (stage 8) | false |
| `DEPENDENCY` | Marketplace/Identity resolver or Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected failure | true |

**Error Boundary block (Doc-4A §12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a `subject_id` outside the caller's org is reported as `NOT_FOUND`, identical code/message/shape to subject-never-existed (never `AUTHORIZATION`, which would confirm the subject exists). `Timing-Uniformity`: not-owned and not-exist paths return identical timing/shape. **REFERENCE vs DEPENDENCY:** an unresolved-but-syntactically-valid `subject_id` → `REFERENCE` (422, non-retryable); a resolver-service outage → `DEPENDENCY` (503, retryable).

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window under **`[ESC-TRUST-POLICY]`** (H.8); replay within window → same `verification_record_id`, no duplicate audit; concurrent duplicates with same key → one row. Business-duplicate prevention (a second case for the same subject+type) is a `BUSINESS` rule (stage 8), **not** an idempotency concern (Doc-4A §14.6).

**11. Cross-Module References** — **Identity (DG-1):** active-org/membership resolution, `check_permission`. **Marketplace (DG-2):** resolve `subject_id`/vendor profile + declared tier by UUID, **read-only** (no vendor-data mutation). **Platform Core (DG-8):** audit-write, evidence document storage refs. Inbound carried: **DC-2/DD-1** (org/vendor verification submission boundary now owned here).

**12. AI-Agent Implementation Notes** — the subject is **owned by another module** (Marketplace/Identity) — reference by UUID, never create/mutate it (DG-2/firewall H.9). `subject_type`/`verification_type` are fixed Doc-2 §10.6 enums; never extend. Verification is platform-owned from open; the submitter only requests it. Collapse cross-org subject access to `NOT_FOUND` (§7.5).

---

## §G4.2 — `trust.assign_verification.v1` — Assign Verification Case (→ in_review)

**1. Contract Metadata** — Contract ID `trust.assign_verification.v1` · Template **21.6 Admin** · Owned aggregate **Verification Case** (`verification_records` AR) · Actor types **Admin** (Verification Admin, no active-org context, §5.6) · BC-TRUST-1 (§G4).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `verification_record_id` | `uuid` | yes | no | 1 | target case |
| `expected_revision` | `numeric` | yes | no | 1 | optimistic-concurrency assertion (H.5) |
| `verification_task_id` | `uuid` | no | yes | 1 | Admin task-queue ref (Doc-2 §10.6; DG-5 read-only) |

**3. Response Schema** — `verification_record_id : uuid (1)`, `state : enum<…> (1) = in_review`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `verification_record_id`, `expected_revision` typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor authenticity (platform-staff, no org) | 2 CONTEXT | Doc-4A §5.6 | actor is Admin; admin scope declared | `AUTHORIZATION` |
| `staff_can_verify` | 3 AUTHZ | Doc-2 §7 | staff slug held | `AUTHORIZATION` |
| (scope) | 4 SCOPE | Doc-4A §5.6 | platform-staff; no tenant resource scope | — |
| case in assignable state | 6 STATE | Doc-2 §5.6 | source = `requested` (not other) | `STATE` |
| revision match | 6 STATE / concurrency | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| `verification_task_id` resolves (if present) | 7 REFERENCE | Doc-2 §10.6; DG-5 | task ref resolves via Admin service | `REFERENCE` ; `DEPENDENCY` (Admin service down) |

**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_verify`** (Doc-2 §7 platform-staff) · Scope = platform (no tenant scope) · Delegation n/a · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`requested`** · Target **`in_review`** (Doc-2 §5.6 `requested ──assign──▶ in_review`) · Forbidden: `in_review`/`approved`/`rejected`/`expired`/`revoked` → `STATE` · Concurrency: optimistic on row revision; lost race → `CONFLICT`.

**7. Audit Binding** — Action **`[ESC-TRUST-AUDIT]`** — nearest Doc-2 §9 Trust action by pointer (case **assignment** not separately enumerated in §9; channel Doc-2 §9 additive; **no action invented**) · Attribution **Admin** · Object scope `verification_records` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7) · Consumed none · Idempotency: re-assign of an already-`in_review` case is a no-op (state target idempotent).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | actor/staff-slug fail (stages 2–3) | false |
| `NOT_FOUND` | `verification_record_id` does not exist | false |
| `STATE` | case not in `requested` | false |
| `CONFLICT` | `expected_revision` ≠ current (lost race) | true (re-read then retry) |
| `REFERENCE` | `verification_task_id` unresolved (stage 7) | false |
| `DEPENDENCY` | Admin task service / Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** verification cases are platform-staff-visible (not tenant-protected at the staff surface), so a missing case returns `NOT_FOUND` on identity, not a collapse. **STATE vs CONFLICT:** wrong source state → `STATE` (409, non-retryable); stale revision on the correct state → `CONFLICT` (409, retryable after re-read). **REFERENCE vs DEPENDENCY:** unresolved `verification_task_id` → `REFERENCE`; Admin service outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`, H.8); `expected_revision` makes retries safe; replayed assign that already applied → same state, no duplicate audit.

**11. Cross-Module References** — **Identity (DG-1):** staff identity, membership, `check_permission`. **Admin (DG-5):** `verification_task_id` / admin task-queue reference (Admin/Doc-4J owns the queue; Trust references read-only). **Platform Core (DG-8):** audit-write.

**12. AI-Agent Implementation Notes** — assignment is a Trust case-state transition; the admin task queue is **referenced via DG-5 (Admin)**, not DG-1 and not owned. Do not emit an event (H.7). Use `expected_revision` for concurrency.

---

## §G4.3 — `trust.decide_verification.v1` — Record Verification Decision

**1. Contract Metadata** — Contract ID `trust.decide_verification.v1` · Template **21.6 Admin** · Owned aggregate **Verification Case** (`verification_records` AR + `verification_decisions` append-only child) · Actor types **Admin** (Verification Admin, §5.6) · BC-TRUST-1 (§G4).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `verification_record_id` | `uuid` | yes | no | 1 | target case |
| `expected_revision` | `numeric` | yes | no | 1 | concurrency assertion |
| `decision` | `enum<approve\|reject\|confirm\|downgrade\|request_info>` | yes | no | 1 | Doc-2 §10.6 `decision` (fixed enum) |
| `reason` | `text` | conditional | yes | 1 | Doc-2 §10.6 `reason` (required for reject/downgrade/request_info — BUSINESS rule) |

**3. Response Schema** — `verification_record_id : uuid (1)`, `verification_decision_id : uuid (1)`, `state : enum<…> (1)` (resulting: `approved`|`rejected`|`requested`), `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `verification_record_id`, `decision` typed; `decision` ∈ frozen enum | 1 SYNTAX | Doc-4A §9; Doc-2 §10.6 | presence/type; enum membership | `VALIDATION` |
| actor authenticity (staff) | 2 CONTEXT | Doc-4A §5.6 | Admin; admin scope | `AUTHORIZATION` |
| `staff_can_verify` | 3 AUTHZ | Doc-2 §7 | staff slug held | `AUTHORIZATION` |
| case decidable | 6 STATE | Doc-2 §5.6 | source = `in_review` | `STATE` |
| revision match | 6 STATE / concurrency | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| declared-tier ref (confirm/downgrade) | 7 REFERENCE | Doc-2 §10.6; DG-2 | for tier-affecting decisions, declared-tier subject resolves (read) | `REFERENCE` ; `DEPENDENCY` |
| `reason` presence for reject/downgrade/request_info | 8 BUSINESS | Doc-2 §10.6 | mandatory structured reason for non-approve outcomes | `BUSINESS` |

**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_verify`** · Scope = platform · Delegation n/a · Enforcement `check_permission`.

**6. State Machine Enforcement** — Allowed source **`in_review`** · Targets **`approved`** (approve), **`rejected`** (reject), **`requested`** (request_info) [Doc-2 §5.6]; `confirm`/`downgrade` record a decision affecting the **declared-tier validation** (realized via the verified-tier contracts §G4.6, which own the tier state + event) · Forbidden sources: `requested`/`approved`/`rejected`/`expired`/`revoked` → `STATE` · Concurrency: optimistic; lost race → `CONFLICT` · Appends one `verification_decisions` row (immutable).

**7. Audit Binding** — Action **Doc-2 §9 Trust "verification … decision"** (separately enumerated) · Attribution **Admin** (`decided_by`) · Object scope `verification_records` + appended `verification_decisions` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`VendorVerified`** (Doc-2 §8 — `trust.verification_records`) **on an `approve` outcome only**, via Doc-4B outbox-write (business write + event one transaction) · A tier-affecting `confirm`/`downgrade` does **not** emit here — the verified-tier contract (§G4.6) emits `VendorTierChanged[verified]` · `reject`/`request_info` emit **none** (H.7) · Consumed none · Consumers of `VendorVerified`: Marketplace/RFQ/Communication (DG-6 fan-out), each owns its own effect.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (missing/`decision` not in enum) | false |
| `AUTHORIZATION` | actor/staff-slug fail | false |
| `NOT_FOUND` | case does not exist | false |
| `STATE` | case not in `in_review` | false |
| `CONFLICT` | `expected_revision` ≠ current | true (re-read then retry) |
| `REFERENCE` | declared-tier subject unresolved for confirm/downgrade | false |
| `BUSINESS` | `reason` missing for reject/downgrade/request_info | false |
| `DEPENDENCY` | Doc-4B outbox/audit or Marketplace resolver transiently down | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** staff surface — missing case → `NOT_FOUND` on identity. **STATE vs CONFLICT** and **REFERENCE vs DEPENDENCY** separated as in H.4. The `VendorVerified` emission is in the **same transaction** as the state write (no event without commit; no commit without event — outbox rule).

**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); replay of an applied decision → same `state`, **no duplicate `verification_decisions` row, no duplicate `VendorVerified` event** (outbox dedup on event identity, Doc-4A §16); `expected_revision` guards races.

**11. Cross-Module References** — **Identity (DG-1):** staff identity + `check_permission`. **Marketplace (DG-2):** declared-tier/vendor-profile reference for confirm/downgrade subjects, **read-only**. **Communication (DG-6):** consumes `VendorVerified` for notification fan-out (Communication owns dispatch). **Platform Core (DG-8):** audit + outbox.

**12. AI-Agent Implementation Notes** — `decision` enum is exactly Doc-2 §10.6; never invent a decision value. `VendorVerified` fires **only** on `approve`. Tier confirm/downgrade affects the **declared-tier validation without owning the declared tier** (PATCH-01) and is realized through the verified-tier contract — do not write `marketplace.financial_tier_history` here. No score is computed or mutated (firewall H.9).

---

## §G4.4 — `trust.revoke_verification.v1` — Revoke Verification (fraud/compliance)

**1. Contract Metadata** — Contract ID `trust.revoke_verification.v1` · Template **21.6 Admin** · Owned aggregate **Verification Case** (`verification_records` AR) · Actor types **Admin** (Verification/Compliance staff, §5.6) · BC-TRUST-1 (§G4).

**2. Request Schema** — `verification_record_id : uuid (1, required)`; `expected_revision : numeric (1, required)`; `reason : text (1, required)` (Doc-2 §10.6 — mandatory revoke reason, BUSINESS).

**3. Response Schema** — `verification_record_id : uuid (1)`, `state : enum<…> (1) = revoked`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `verification_record_id`, `expected_revision`, `reason` typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor authenticity (staff) | 2 CONTEXT | Doc-4A §5.6 | Admin; admin scope | `AUTHORIZATION` |
| `staff_can_verify` or `staff_can_ban` | 3 AUTHZ | Doc-2 §7 | staff slug held (verification or compliance/ban) | `AUTHORIZATION` |
| case revocable | 6 STATE | Doc-2 §5.6 | source = `approved` | `STATE` |
| revision match | 6 STATE / concurrency | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| `reason` present | 8 BUSINESS | Doc-2 §10.6 | mandatory revoke reason | `BUSINESS` |

**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_verify`** and/or **`staff_can_ban`** (Doc-2 §7 platform-staff; compliance-driven revoke may require ban authority) · Scope = platform · Delegation n/a · Enforcement `check_permission` · **If a distinct revoke-specific slug is required → `[ESC-TRUST-SLUG]`** (Doc-2 §7 additive; no slug invented).

**6. State Machine Enforcement** — Allowed source **`approved`** · Target **`revoked`** (Doc-2 §5.6 `approved ──revoke [fraud/compliance]──▶ revoked`) · Forbidden: `requested`/`in_review`/`rejected`/`expired`/`revoked` → `STATE` · Concurrency: optimistic; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Trust "verification … revoke"** (separately enumerated) · Attribution **Admin** · Object scope `verification_records` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** from this contract (H.7 — revoke emits no dedicated event; Doc-2 §8 has no revoke event) · A follow-on verified-tier **suspension** (if compliance requires it) is a separate verified-tier contract (§G4.7) that emits `VendorTierChanged[verified]` · Consumed none · Eligibility/ban consumers read the revoked state by service (DG-5).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | actor/staff-slug fail (verification or ban) | false |
| `NOT_FOUND` | case does not exist | false |
| `STATE` | case not in `approved` | false |
| `CONFLICT` | `expected_revision` ≠ current | true (re-read then retry) |
| `BUSINESS` | `reason` missing | false |
| `DEPENDENCY` | Doc-4B audit transiently down | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** staff surface — missing case → `NOT_FOUND` on identity. **STATE vs CONFLICT** separated. No protected-fact collapse at the staff surface (cases are staff-visible).

**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); re-revoke of an already-`revoked` case is a no-op (idempotent target); no duplicate audit on replay; `expected_revision` guards races.

**11. Cross-Module References** — **Identity (DG-1):** staff identity + `check_permission`. **Admin (DG-5):** compliance/ban relationship consumes the revoked verification output; **the ban decision is Admin's**, not Trust's. **Communication (DG-6):** fan-out of any follow-on tier event. **Platform Core (DG-8):** audit.

**12. AI-Agent Implementation Notes** — Trust **revokes the verification only**; it never issues a ban (DG-5 — Admin owns the ban decision). Revoke requires a reason. If compliance also requires tier suspension, call the verified-tier suspend contract (§G4.7); do not couple the two writes implicitly.

---

## §G4.5 — `trust.expire_verification.v1` — Expire Verification (lapse / document expiry)

**1. Contract Metadata** — Contract ID `trust.expire_verification.v1` · Template **21.5 System** (Response: none) · Owned aggregate **Verification Case** (`verification_records` AR) · Actor types **System** (timer/sweep; §5.2) · BC-TRUST-1 (§G4).

**2. Request Schema** *(system trigger; no tenant request body)* — internal trigger parameters: `verification_record_id : uuid (1)` (the lapsing case), `trigger : enum<periodic_review_lapse|document_expiry> (1)`. No caller-supplied authorization fields (System trigger-authenticity only, Doc-4A §21.5/§11.2 stage collapse).

**3. Response Schema** — **none** (21.5 System; Doc-4A §21.5). Internal effect: `state = expired`; `reference_id` recorded on the audit record.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| trigger payload typed | 1 SYNTAX | Doc-4A §9 | `verification_record_id`/`trigger` present, typed | `VALIDATION` (internal) |
| trigger authenticity | 2–5 collapse | Doc-4A §21.5/§11.2 | System actor; trigger-authenticity check (no tenant context/authz/scope/delegation) | `AUTHORIZATION` (untrusted trigger) |
| case expirable | 6 STATE | Doc-2 §5.6 | source = `approved` | `STATE` (skip/no-op if not `approved`) |
| `expires_at` reached / document expired | 8 BUSINESS | Doc-2 §10.6 | `expires_at` elapsed or evidence document expired | `BUSINESS` (not yet due → no transition) |

**5. Authorization Matrix** — Actor **System** · Slug **none** (System actor; no tenant slug — §5.2) · Scope = platform/system · Delegation n/a · Enforcement = trigger-authenticity (Doc-4A §21.5).

**6. State Machine Enforcement** — Allowed source **`approved`** · Target **`expired`** (Doc-2 §5.6 `approved ──periodic review lapse / document expiry──▶ expired`) · Forbidden: any non-`approved` source → no transition (idempotent skip) · Concurrency: system sweep is idempotent on the target (`expired` re-run = no-op).

**7. Audit Binding** — Action **Doc-2 §9 Trust "verification … expiry"** (separately enumerated; **System** actor attribution) · Object scope `verification_records` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7 — verification expiry emits no dedicated event) · A downstream verified-tier **expiry** (24-month review lapse) is a separate verified-tier contract (§G4.7) that emits `VendorTierChanged[verified]` · Consumed: this contract is the **effect of a system timer** (not a Doc-2 §8 event consumer) · Idempotency: re-run on `expired` = no-op.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed internal trigger payload | false |
| `AUTHORIZATION` | untrusted/forged trigger (trigger-authenticity fail) | false |
| `STATE` | case not in `approved` (handled as no-op skip, not surfaced to a tenant) | false |
| `BUSINESS` | `expires_at` not yet reached (no transition) | false |
| `DEPENDENCY` | Doc-4B audit transiently down | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** System contract — no tenant-facing surface, so no protected-fact collapse applies; stages 2–5 collapse to a single trigger-authenticity check (Doc-4A §21.5). **STATE** here is a no-op skip (the sweep moves on), never a `CONFLICT`.

**10. Idempotency Rules** — `Idempotency: required` on the target state (Doc-4A §14); a verification already `expired` is unchanged on re-run; no duplicate audit. The review-lapse **cadence/window** is a runtime tunable **absent from Doc-3 §12.2** → carried under **`[ESC-TRUST-POLICY]`** (reference the platform default by name; no key invented).

**11. Cross-Module References** — **Platform Core (DG-8):** the system timer/sweep + audit-write. No Identity authorization (System actor). No Marketplace mutation.

**12. AI-Agent Implementation Notes** — expiry is **System-actor only**; never expose a tenant-facing endpoint for it. It changes **verification state only** and **never penalizes a vendor's scores** (Doc-3 §12.1 FIXED — expiry never penalizes; firewall H.9). Carry `[ESC-TRUST-POLICY]` for the lapse window; do not invent a key. The verified-tier expiry is a distinct contract (§G4.7).

---

## §G4.6 — `trust.set_verified_tier.v1` · `trust.confirm_verified_tier.v1` · `trust.downgrade_verified_tier.v1` — Verified-Tier Establishment

**1. Contract Metadata** — Contract IDs `trust.set_verified_tier.v1` · `trust.confirm_verified_tier.v1` · `trust.downgrade_verified_tier.v1` · Template **21.6 Admin** · Owned aggregate **Verified Financial Tier** (`verified_financial_tiers` AR) · Actor types **Admin** (Verification Admin, §5.6) · BC-TRUST-1 (§G4). *(Three contracts share this record; the request differs only by the establishing transition.)*

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `vendor_profile_id` | `uuid` | yes | no | 1 | Doc-2 §10.6 `vendor_profile_id` (UNIQUE partial; Marketplace ref, read) |
| `verification_record_id` | `uuid` | yes | no | 1 | the approved tier-verification basis (Doc-2 §10.6) |
| `expected_revision` | `numeric` | conditional | yes | 1 | required for confirm/downgrade (existing row); absent for set (create) |
| `tier` | `enum<A\|B\|C\|D\|E>` | yes | no | 1 | Doc-2 §10.6 `tier` (fixed band) |
| `basis_jsonb` | `jsonb` | no | yes | 1 | Doc-2 §10.6 `basis_jsonb` (shape = dev-doc scope) |

**3. Response Schema** — `verified_financial_tier_id : uuid (1)`, `tier : enum<A|B|C|D|E> (1)`, `status : enum<pending_verification|verified|suspended|expired> (1)`, `next_review_at : timestamptz (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id`, `tier` typed; `tier` ∈ A–E | 1 SYNTAX | Doc-4A §9; Doc-2 §10.6 | presence/type; band membership | `VALIDATION` |
| actor authenticity (staff) | 2 CONTEXT | Doc-4A §5.6 | Admin; admin scope | `AUTHORIZATION` |
| `staff_can_verify` | 3 AUTHZ | Doc-2 §7 | staff slug held | `AUTHORIZATION` |
| tier row state (confirm/downgrade) | 6 STATE | Doc-2 §3.6/§10.6 | confirm/downgrade require existing `verified`; set requires no existing active row | `STATE` |
| revision match (confirm/downgrade) | 6 STATE / concurrency | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| `vendor_profile_id` + `verification_record_id` resolve | 7 REFERENCE | Doc-2 §10.6; DG-2 | profile resolves (read); basis verification exists + `approved` | `REFERENCE` ; `DEPENDENCY` (resolver down) |
| basis is an approved **tier** verification | 8 BUSINESS | Doc-2 §5.6/§10.6 | `verification_record_id` is `approved` and `verification_type=tier` | `BUSINESS` |
| UNIQUE(vendor_profile_id) on set | 8 BUSINESS | Doc-2 §10.6 | no existing active verified-tier row for the profile (set only) | `BUSINESS` (or `CONFLICT` on concurrent create race) |

**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_verify`** · Scope = platform · Delegation n/a · Enforcement `check_permission`.

**6. State Machine Enforcement** — `set`: source **none** (or absence-of-row "Declared Only") → target **`verified`** (via `pending_verification → verified`, Doc-2 §3.6/§10.6) · `confirm`: source **`verified`** → **`verified`** (renew; `next_review_at` +24mo) · `downgrade`: source **`verified`** → **`verified`** at a lower `tier` band · Forbidden: operating on `suspended`/`expired` rows without re-establishment → `STATE` · Concurrency: optimistic on row revision for confirm/downgrade; UNIQUE(vendor_profile_id) guards a duplicate set → `CONFLICT`/`BUSINESS`.

**7. Audit Binding** — Action **Doc-2 §9 Trust "admin tier override"** (separately enumerated, covers tier set/confirm/downgrade by staff) · for status-transition specifics beyond "admin tier override" carry **`[ESC-TRUST-AUDIT]`** (nearest §9 Trust action by pointer; no action invented) · Attribution **Admin** · Object scope `verified_financial_tiers` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`VendorTierChanged`** with payload `tier_type='verified'` (+ old/new tier) (Doc-2 §8 — `trust.verified_financial_tiers`) via Doc-4B outbox-write (one transaction) · **Trust never writes `marketplace.financial_tier_history`** — Marketplace consumes the event and writes the history rows + read-model band (Doc-2 §8 ownership note) · Consumed none · Consumers: Marketplace (history + matching refresh), Communication (DG-6 fan-out).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (missing field; `tier` not A–E) | false |
| `AUTHORIZATION` | actor/staff-slug fail | false |
| `NOT_FOUND` | tier row (confirm/downgrade) does not exist | false |
| `STATE` | wrong tier-row pre-state for the transition | false |
| `CONFLICT` | stale `expected_revision`, or concurrent duplicate `set` (UNIQUE race) | true (re-read then retry) |
| `REFERENCE` | `vendor_profile_id`/`verification_record_id` unresolved | false |
| `BUSINESS` | basis not an `approved` tier verification; or duplicate active row on `set` | false |
| `DEPENDENCY` | Marketplace resolver / Doc-4B outbox transiently down | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** staff surface — missing tier row → `NOT_FOUND` on identity. **STATE vs CONFLICT:** wrong pre-state → `STATE`; stale revision/duplicate-create race → `CONFLICT`. **REFERENCE vs DEPENDENCY:** unresolved profile/basis ID → `REFERENCE`; resolver outage → `DEPENDENCY`. The `VendorTierChanged[verified]` emission is in the same transaction as the tier write.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); replay of an applied set/confirm/downgrade → same row state, **no duplicate `VendorTierChanged` event** (outbox dedup); `expected_revision` guards confirm/downgrade races; UNIQUE(vendor_profile_id) guards set.

**11. Cross-Module References** — **Identity (DG-1):** staff identity + `check_permission`. **Marketplace (DG-2):** `vendor_profile_id` + `declared_financial_tiers` reference, **read-only**; consumes `VendorTierChanged[verified]` to write `financial_tier_history` + read-model. **Communication (DG-6):** fan-out. **Platform Core (DG-8):** audit + outbox.

**12. AI-Agent Implementation Notes** — the **declared tier stays Marketplace's**; the **verified tier is Trust's** (PATCH-01) — **never write `marketplace.financial_tier_history`**; emit the event and let Marketplace write it. `tier` is the fixed A–E band; never extend. Financial Tier **never feeds Trust/Performance Score** (Invariant 6 — no scoring here). Value-band thresholds (`tier.use_verified_when_present`, "verification value-band thresholds", Doc-3 §12.2) are **RFQ-consumption** keys — read by RFQ, not owned or applied here.

---

## §G4.7 — `trust.suspend_verified_tier.v1` · `trust.expire_verified_tier.v1` — Verified-Tier Suspension / Expiry

**1. Contract Metadata** — Contract IDs `trust.suspend_verified_tier.v1` (Template **21.6 Admin**, Actor **Admin**) · `trust.expire_verified_tier.v1` (Template **21.5 System**, Actor **System**, Response: none) · Owned aggregate **Verified Financial Tier** (`verified_financial_tiers` AR) · BC-TRUST-1 (§G4).

**2. Request Schema** — *suspend:* `verified_financial_tier_id : uuid (1, required)`, `expected_revision : numeric (1, required)`, `reason : text (1, required)`. *expire (System):* internal trigger `verified_financial_tier_id : uuid (1)`, `trigger : enum<review_lapse> (1)`; no caller authorization fields (trigger-authenticity only).

**3. Response Schema** — *suspend:* `verified_financial_tier_id : uuid (1)`, `status : enum<…> (1) = suspended`, `reference_id : uuid (1)`. *expire:* **none** (21.5 System).

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| typed fields (suspend) | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor authenticity | 2 CONTEXT / 2–5 collapse (System) | Doc-4A §5.6 / §21.5 | Admin staff (suspend) ; System trigger-authenticity (expire) | `AUTHORIZATION` |
| `staff_can_verify` (suspend) | 3 AUTHZ | Doc-2 §7 | staff slug held | `AUTHORIZATION` |
| tier row state | 6 STATE | Doc-2 §3.6/§10.6 | source = `verified` | `STATE` (expire: no-op skip if not `verified`) |
| revision match (suspend) | 6 STATE / concurrency | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| `next_review_at` reached (expire) | 8 BUSINESS | Doc-2 §10.6 | 24-month review elapsed | `BUSINESS` (not due → no transition) |
| `reason` present (suspend) | 8 BUSINESS | Doc-2 §10.6 | mandatory suspension reason | `BUSINESS` |

**5. Authorization Matrix** — *suspend:* Actor **Admin** · Slug **`staff_can_verify`** · Scope platform · Enforcement `check_permission`. *expire:* Actor **System** · Slug **none** (§5.2) · Enforcement trigger-authenticity (§21.5).

**6. State Machine Enforcement** — Allowed source **`verified`** · Targets **`suspended`** (suspend) / **`expired`** (expire on review lapse) [Doc-2 §3.6/§10.6 `verified → suspended | expired`] · Forbidden: `pending_verification`/`suspended`/`expired` sources → `STATE` (expire: no-op skip) · Concurrency: optimistic on suspend; expire idempotent on target.

**7. Audit Binding** — Action **Doc-2 §9 Trust "admin tier override"** (suspend, Admin) · status-transition specifics beyond "admin tier override" carry **`[ESC-TRUST-AUDIT]`** (nearest §9 by pointer; no action invented); expire = **System** attribution under the same binding · Object scope `verified_financial_tiers` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`VendorTierChanged`** `tier_type='verified'` (Doc-2 §8) on both suspend and expire, via outbox-write · **Trust never writes `marketplace.financial_tier_history`** (Marketplace consumes) · Consumed: expire is a **system-timer effect** (not a Doc-2 §8 consumer); suspend may follow a compliance revoke (§G4.4) by service · Consumers: Marketplace (history/read-model), RFQ (matching refresh), Communication (DG-6).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (suspend) / malformed trigger (expire) | false |
| `AUTHORIZATION` | staff-slug fail (suspend) / forged trigger (expire) | false |
| `NOT_FOUND` | tier row does not exist (suspend) | false |
| `STATE` | tier not in `verified` | false |
| `CONFLICT` | stale `expected_revision` (suspend) | true (re-read then retry) |
| `BUSINESS` | `reason` missing (suspend) / review not yet due (expire) | false |
| `DEPENDENCY` | Doc-4B outbox/audit transiently down | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** suspend = staff surface (missing row → `NOT_FOUND` on identity); expire = System contract (stages 2–5 collapse; STATE = no-op skip). **STATE vs CONFLICT** separated.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); suspend replay on `suspended` = no-op; expire on `expired` = no-op; no duplicate event/audit. The **24-month review window** is a runtime tunable **absent from Doc-3 §12.2** → carried under **`[ESC-TRUST-POLICY]`** (reference platform default by name; no key invented).

**11. Cross-Module References** — **Identity (DG-1):** staff identity + `check_permission` (suspend). **Marketplace (DG-2):** consumes `VendorTierChanged[verified]`. **Admin (DG-5):** compliance relationship (a compliance suspend may follow a revoke). **Platform Core (DG-8):** audit + outbox + system timer (expire).

**12. AI-Agent Implementation Notes** — both transitions emit `VendorTierChanged[verified]`; **never write `marketplace.financial_tier_history`**. Expire is **System-actor only** (24-month review lapse) — no tenant endpoint. Suspension/expiry **never penalizes scores** (firewall H.9); they change tier state and publish. Carry `[ESC-TRUST-POLICY]` for the review window.

---

## §G4.8 — `trust.get_verification.v1` · `trust.list_verifications.v1` · `trust.get_verified_tier.v1` — Verification / Verified-Tier Reads

**1. Contract Metadata** — Contract IDs `trust.get_verification.v1` · `trust.list_verifications.v1` · `trust.get_verified_tier.v1` · Template **21.3 Query** · Owned aggregates **Verification Case** + **Verified Financial Tier** (read-only) · Actor types **Admin** (case detail / queue) · **internal-service** / public projection (verified-tier badge) · BC-TRUST-1 (§G4).

**2. Request Schema** — *get_verification:* `verification_record_id : uuid (1, required)`. *list_verifications:* filter fields `state? : enum<…>`, `subject_type? : enum<…>`, `assigned? : bool`, pagination (`limit`, `cursor`) — allowlisted filter/sort fields only (Doc-4A §9.6). *get_verified_tier:* `vendor_profile_id : uuid (1, required)`.

**3. Response Schema** — *get_verification:* the `verification_records` row + its `verification_decisions` (staff view). *list_verifications:* page of case summaries. *get_verified_tier:* `tier : enum<A|B|C|D|E>`, `status : enum<…>`, `verified_at`, `next_review_at` (public **badge** projection — band/status only, no internal basis). Every response carries `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| typed identifiers / allowlisted filters | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; filter+sort fields allowlisted | `VALIDATION` |
| actor authenticity | 2 CONTEXT | Doc-4A §5.6 | Admin (case detail/queue) ; internal-service/public (verified-tier badge) | `AUTHORIZATION` |
| `staff_can_verify` (case detail/queue) | 3 AUTHZ | Doc-2 §7 | staff slug held for internal case data | `AUTHORIZATION` |
| (scope) verified-tier badge is public | 4 SCOPE | Doc-2 §3.6 | verified-tier badge = public read (band/status); case detail = staff-only | — / `NOT_FOUND` if a non-staff caller requests internal case detail |
| reference resolves | 7 REFERENCE | Doc-2 §10.6 | `verification_record_id`/`vendor_profile_id` resolves | `NOT_FOUND` (read miss) ; `DEPENDENCY` (read-store down) |

**5. Authorization Matrix** — *case detail / list:* Actor **Admin** · Slug **`staff_can_verify`** · Scope platform. *verified-tier badge:* public read (Doc-2 §3.6 "public badge read") via service projection (no slug; band/status only). Enforcement `check_permission` for staff reads.

**6. State Machine Enforcement** — n/a — **queries do not mutate state** (read-only; no transition). The verified-tier read reflects current `status`; "Declared Only" = absence of a verified-tier row (Doc-2 §3.6/§10.6) and is reported as such (no row), never fabricated.

**7. Audit Binding** — **none — reads are not audited** (Doc-4A §17.1).

**8. Event Binding** — Emitted **none** (reads) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | bad identifier / non-allowlisted filter or sort field | false |
| `AUTHORIZATION` | non-staff caller requests internal case data (where existence is non-protected at the staff surface) | false |
| `NOT_FOUND` | record/profile absent, or internal case detail requested by a non-entitled caller (protected-fact collapse) | false |
| `DEPENDENCY` | read-store transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** the **verified-tier badge** is public (band/status), but **internal verification case detail is staff-only**; a non-entitled caller requesting case detail receives `NOT_FOUND` (protected-fact collapse, §7.5) — never a disclosure of case existence. No write path; no `STATE`/`CONFLICT` applies.

**10. Idempotency Rules** — `Idempotency: not-applicable` (Doc-4A §14.1 — queries are side-effect-free and naturally idempotent).

**11. Cross-Module References** — **Identity (DG-1):** staff identity + `check_permission` for case reads. **Marketplace (DG-2):** the **verified-tier badge is displayed by Marketplace via service** (never table access) — Doc-2 §10.6. **Platform Core (DG-8):** read-store/observability.

**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). The **verified-tier badge is public**; **internal case detail is staff-only** — collapse non-entitled case-detail reads to `NOT_FOUND` (§7.5). "Declared Only" is the **absence** of a verified-tier row (one business state, one source — the Marketplace declared tier); never synthesize a verified-tier row. Marketplace reads the badge **via service**, never by direct table access.

---

## §G4.Z — Part-1 Conformance & Carried-Marker Ledger (BC-TRUST-1)

**Contract roster (hardened this Part — exactly the Pass-A §G4 set; none added/removed):**

| § | Contract ID(s) | Template | Owned aggregate | Actor |
|---|---|---|---|---|
| §G4.1 | `trust.request_verification.v1` | 21.4 Command | Verification Case | User |
| §G4.2 | `trust.assign_verification.v1` | 21.6 Admin | Verification Case | Admin |
| §G4.3 | `trust.decide_verification.v1` | 21.6 Admin | Verification Case (+`verification_decisions`) | Admin |
| §G4.4 | `trust.revoke_verification.v1` | 21.6 Admin | Verification Case | Admin |
| §G4.5 | `trust.expire_verification.v1` | 21.5 System | Verification Case | System |
| §G4.6 | `trust.set_verified_tier.v1` · `trust.confirm_verified_tier.v1` · `trust.downgrade_verified_tier.v1` | 21.6 Admin | Verified Financial Tier | Admin |
| §G4.7 | `trust.suspend_verified_tier.v1` · `trust.expire_verified_tier.v1` | 21.6 Admin / 21.5 System | Verified Financial Tier | Admin / System |
| §G4.8 | `trust.get_verification.v1` · `trust.list_verifications.v1` · `trust.get_verified_tier.v1` | 21.3 Query | Verification Case; Verified Financial Tier | Admin / internal-service |

**Authority binding (all by pointer; nothing invented):**

| Binding | Authoritative source |
|---|---|
| Lifecycle | Doc-2 §5.6 (Verification machine) + §3.6/§10.6 (Verified Tier `pending_verification→verified→suspended/expired`; `verification_decisions` append-only) |
| Entities / fields | Doc-2 §10.6 (`verification_records`, `verification_decisions`, `verified_financial_tiers`) |
| Permissions | Doc-2 §7 — `can_submit_verification` (Owner-only), `staff_can_verify`, `staff_can_ban` (compliance revoke) |
| Events | Doc-2 §8 — `VendorVerified` (approve), `VendorTierChanged[verified]` (tier status change); nothing coined |
| Audit | Doc-2 §9 Trust — "verification request / decision / revoke / expiry", "admin tier override" (separately enumerated); assignment + verified-tier status transitions → `[ESC-TRUST-AUDIT]` |
| Validation order | Doc-4A §11.2 nine-stage canonical (FROZEN; board labels mapped in H.1) |
| Error model | Doc-4A §12 / Annexure B closed twelve-class set; REFERENCE≠DEPENDENCY, STATE≠CONFLICT enforced per contract |
| Idempotency | Doc-4A §14; dedup window → `[ESC-TRUST-POLICY]` (no `trust` key in Doc-3 §12.2) |
| Firewall / moat | Architecture §1.5 / Invariant 6; Architecture Patch v1.0.1 PATCH-01; Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED |

**Carried dependencies (unchanged):** DG-1 (Identity — staff/`check_permission`), DG-2 (Marketplace — vendor-profile/declared-tier read; consumes tier events; never writes `financial_tier_history`), DG-5 (Admin — `verification_task_id` task queue read-only; ban decision is Admin's), DG-6 (Communication — fan-out of `VendorVerified`/`VendorTierChanged[verified]`), DG-8 (Platform Core — audit/outbox/timer/storage). Inbound carried now owned: DC-2, DD-1.

**Carried escalation markers (unchanged; never resolved here):** `[ESC-TRUST-AUDIT]` (Doc-2 §9 additive — case assignment, verified-tier status transitions beyond "admin tier override"); `[ESC-TRUST-POLICY]` (Doc-3 §12.2 additive — verification review-lapse window, 24-month verified-tier review window, dedup window); `[ESC-TRUST-SLUG]` (Doc-2 §7 additive — any distinct revoke-specific slug if required).

**Firewall & moat (Part-1 posture):** Trust is the sole authority for Verification + Verified Tier; no external ownership/mutation; no Billing influence; verified-tier validates the declared tier without owning it (PATCH-01) and Trust never writes `marketplace.financial_tier_history`; Financial Tier never feeds a score (no scoring in this Part); no matching/routing/ranking/evaluation/selection/award — RFQ ownership authoritative. **No flag-and-halt triggered; no corpus conflict.**

---

*End of Doc-4G — Trust & Verification Engine — Pass-B Part 1 v1.0 — BC-TRUST-1 Verification & Verified Tier. Hardens the frozen Pass-A §G4 contract set (9 records: request/assign/decide/revoke/expire verification; verified-tier set/confirm/downgrade/suspend/expire; verification/verified-tier reads) to implementation grade — request/response schemas, Doc-4A §11.2 nine-stage validation matrices (authority · validation · failure class per row), authorization matrices (Doc-2 §7 slugs only), state-machine enforcement (Doc-2 §5.6/§3.6 edges; STATE vs CONFLICT separated), audit bindings (Doc-2 §9 Trust + `[ESC-TRUST-AUDIT]`), event bindings (Doc-2 §8 `VendorVerified`/`VendorTierChanged[verified]`; nothing coined), error registers (Doc-4A §12 closed class; REFERENCE vs DEPENDENCY separated), and idempotency rules (`[ESC-TRUST-POLICY]` dedup/review windows). Ownership, aggregates, permissions, lifecycle, events, and bounded contexts unchanged from Pass-A. Trust firewall and procurement moat preserved; PATCH-01 honored (verified tier validates declared without owning it; never writes `marketplace.financial_tier_history`); nothing invented; no corpus conflict; no flag-and-halt. Scope: BC-TRUST-1 only — BC-TRUST-2…5 are future Pass-B parts. Next: Doc-4G_PassB_Part2 (BC-TRUST-2 Trust Scoring).*
