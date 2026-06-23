# Doc-4F — Business Operations Engine — Pass-B (Hardening) Part 5 v1.0 (FROZEN) — BC-OPS-5 Finance Records

## BC-OPS-5 — Finance Records (§F8) — FROZEN

| Field | Value |
|---|---|
| Document | Doc-4F — **Pass-B Part 5 v1.0 (FROZEN)** — final immutable Part-5 baseline — Module 4 Business Operations Engine (`operations` schema, `ops_` namespace) |
| Part scope | **BC-OPS-5 — Finance Records (§F8)** — the Pass-A §F8 contracts (one aggregate: Finance Record), hardened to implementation grade. Emits **no domain event**. |
| Status | **Pass-B Part 5 FROZEN — sole authoritative BC-OPS-5 Pass-B artifact.** Consolidates `Doc-4F_PassB_Part5_BC-OPS-5_Finance_Records_v1.0` as amended by `Doc-4F_PassB_Part5_Patch_v1.0` (AD-01/AD-02/IR-01…IR-04 applied); certified by `Doc-4F_PassB_Part5_Freeze_Audit_v1.0` (APPROVE FOR FREEZE). Supersedes the authoring draft, the patch document, and the patch verification report. Authorized next stage: **Module-4 (Doc-4F) consolidated freeze**. |
| Contract authority | `Doc-4F_Content_v1.0_PassA_FROZEN.md` §F8 (sole contract authority; not revisited, not redesigned, not reopened) |
| Structure authority | `Doc-4F_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F_Structure_v1.0_FROZEN, Doc-4F_Content_v1.0_PassA_FROZEN, Doc-4F_PassB_Part1/2/3/4_FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-OPS-1 (FROZEN) · Part 2 — BC-OPS-2 (FROZEN) · Part 3 — BC-OPS-3 (FROZEN) · Part 4 — BC-OPS-4 (FROZEN) · **Part 5 — BC-OPS-5 Finance Records (FROZEN)** |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Frozen scope.** BC-OPS-5 (`operations` schema) hardens the Pass-A §F8 contracts to implementation grade. **No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template created or changed** — ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §F8. BC-OPS-5 owns **one** aggregate — **Finance Record** (`finance_records`, no children); `finance_records` is **simple — no lifecycle**; `record_type` is the fixed four-value enum `{tax, ait, payment, expense}` set at create and structurally excluded from update (immutable). It emits **no domain event** and consumes none; the sole slug is **`can_manage_finance_records`** (Doc-2 §7); every mutation carries **`[ESC-OPS-AUDIT]`** (Doc-2 §9 enumerates no `finance_records` action; no action invented). Finance records are **structured text only — no funds, no file uploads, no Billing/payment/subscription ownership** (DF-6; `finance_records` ≠ `billing.platform_invoices` ≠ BC-OPS-2 trade invoices/payment records); BC-OPS-5 owns **no** RFQ/quotation/matching/routing/ranking/award (DF-3 — does not absorb RFQ authority) and computes/mutates **no** Trust/Verification/Performance/Governance score (DF-4 — may consume Trust outputs only). Carried dependencies **DF-1, DF-6, DF-8** and the markers **`[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]`** travel unchanged. Any change to this frozen baseline requires Architecture Board approval (Doc-4_Governance_Note_v1.0).

---
## §H — Part-5 Hardening Conventions (stated once; bound by pointer per contract)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) established before semantic processing (6–9) — disclosure control (§7.5). Each row names the **stage**, **authority**, **rule (validation)**, and **failure class**.
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `numeric` (Doc-2 §10.5 amount), `date`/`timestamptz` (Doc-4A §9 timestamp standard), `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR §6B delegation (stage 5). Slugs only, Doc-2 §7; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C §C3/§C8; no shadow authorization). **BC-OPS-5 scope = the owning organization** (`organization_id`) of the target `finance_records` row. The sole Doc-2 §7 slug is **`can_manage_finance_records`** (O,D). BC-OPS-5 is org-internal; **delegation not eligible** (Doc-4A §6B — own-org finance records; no representative-org scenario).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Codes `ops_<domain>_<code>` (Appendix B namespace `ops_`); numeric codes are development-document scope. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable: false`) is distinct from `DEPENDENCY` (owning service transiently unavailable; `retryable: true`)**; **`STATE` (operation illegal from current state) is distinct from `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4; FROZEN Part-1…4 P-03/P-01 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract). No POLICY-limit (Category 9) applies in Part 5 unless a contract states one.
- **H.5 — State machine (Doc-2 §3.5/§10.5; Doc-4A §13).** `finance_records` is **simple — no state machine** (Doc-2 §3.5 "simple"; no lifecycle states, no transitions). Mutating contracts declare `State-Machine-Effects: none` (Doc-4A §13.1 — a non-state-transitioning mutation). Concurrency on update is optimistic — `update_finance_record` asserts `expected_revision`; a lost race → `CONFLICT` (Doc-4A §14). **No lifecycle defined or redefined** (none exists in the corpus).
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User`), **object scope** (`finance_records` row), **timing** (same transaction as the write — Doc-2 §10.11.4), **authority** (Doc-2 §9 + Doc-4B). Reads not audited (§17.1). **Doc-2 §9 Financial does NOT separately enumerate a `finance_records` action** (it names platform-invoice / trade-invoice / payment-record actions) → **every** BC-OPS-5 mutation carries **`[ESC-OPS-AUDIT]`** (interim: nearest §9 Financial action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §F8.
- **H.7 — Events (Doc-2 §8).** **BC-OPS-5 emits NO domain event** and **consumes none** (Pass-A §F8/§F11 — finance-record mutations are state + §9-audit only; Doc-4A §16.4 — no event coined). No 21.2 integration contract authored.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key). **No `operations`/`ops` dedup-window key is registered in Doc-3 §12.2** → carried under **`[ESC-OPS-POLICY]`** (interim: platform default dedup-window key by name; **no key invented** — Doc-3 §12.2 additive channel). Replay within the window → same result, **no duplicate audit**. Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Tenancy & boundary (Doc-2 §6/§10.5; Doc-4A §7.3/§7.5).** `finance_records` are **tenant-owned** (`organization_id`) and RLS-scoped — a non-owned reference collapses to `NOT_FOUND` (§7.5; §12.4). **Structured text only** (Doc-2 §10.5): no file uploads, **no funds movement**. **Strict separations:** a finance record is **not** a `billing.platform_invoice` (Billing, DF-6), **not** a BC-OPS-2 `trade_invoice`/`payment_record`, and references no Billing/RFQ entity — it is an org-internal finance text entry. BC-OPS-5 **may consume Trust outputs** (read-only) but **never calculates or mutates** any Trust/Verification/Performance/Governance score (DF-4).
- **H.10 — `operations` BC-OPS-5 field source (Doc-2 §10.5).** Hardened schemas bind to the frozen Doc-2 §10.5 columns; **Pass-B introduces no column**:
  - `finance_records`: `organization_id`, `record_type enum<tax|ait|payment|expense>`, `period`, `amount numeric`, `currency`, `note` — structured text; no file uploads; no funds.

**Per-contract record shape (Pass-B).** Each contract is recorded in 13 sections: **1 Contract Metadata · 2 Endpoint Definition · 3 Request Schema · 4 Response Schema · 5 Validation Matrix · 6 Authorization Matrix · 7 State Enforcement · 8 Audit Binding · 9 Event Binding · 10 Error Register · 11 Idempotency Rules · 12 Cross-Module References · 13 AI-Agent Notes.**

---

## §F8.1 — `ops.create_finance_record.v1` · `ops.update_finance_record.v1` — Finance Record Management

**1. Contract Metadata** — Contract Name: Finance Record Management (`ops.create_finance_record.v1`, `ops.update_finance_record.v1`) · Aggregate Owner: **Finance Record** (`finance_records`, Operations / BC-OPS-5) · Bounded Context: **BC-OPS-5** (§F8) · Template **21.4 Command** · Actor: **User** (org member) · Lifecycle State Impact: **none** (`finance_records` is simple — no state machine; Doc-2 §3.5) · Authorization Requirement: **`can_manage_finance_records`** (Doc-2 §7) · Idempotency Requirement: **required** (Doc-4A §14).

**2. Endpoint Definition** *(navigation only; non-normative — Doc-4A implementation-neutral)* — **create:** Method `POST` · URI `/operations/finance-records` · Purpose: create a structured finance text record. **update:** Method `PATCH` · URI `/operations/finance-records/{finance_record_id}` · Purpose: edit an existing finance record.

**3. Request Schema**

**Create — `ops.create_finance_record.v1`:**

| Field | Type | Required | Validation notes |
|---|---|---|---|
| `record_type` | `enum<tax\|ait\|payment\|expense>` | yes | Doc-2 §10.5 fixed four-value enum; set at create, **immutable thereafter** |
| `period` | `string` | yes | Doc-2 §10.5 `period` (reporting period text) |
| `amount` | `numeric` | yes | Doc-2 §10.5 `amount` (record value; no funds movement) |
| `currency` | `enum<BDT>` | no | Doc-2 §10.5 `currency` (optional; corpus default BDT — Doc-4A §9.2) |
| `note` | `text` | no | Doc-2 §10.5 `note` (structured text) |

**Update — `ops.update_finance_record.v1`:**

| Field | Type | Required | Validation notes |
|---|---|---|---|
| `finance_record_id` | `uuid` | yes | target record |
| `expected_revision` | `numeric` | yes | optimistic-concurrency assertion (H.5) |
| `period` | `string` | no | Doc-2 §10.5 `period` (editable) |
| `amount` | `numeric` | no | Doc-2 §10.5 `amount` (editable; no funds movement) |
| `currency` | `enum<BDT>` | no | Doc-2 §10.5 `currency` (editable) |
| `note` | `text` | no | Doc-2 §10.5 `note` (editable) |

> **`record_type` immutability (deterministic enforcement).** `record_type` is set at create and is **structurally excluded from the update request schema** — update requests do **not** accept `record_type`. There is no update-time `record_type` mutation path; immutability is enforced by schema exclusion (a supplied `record_type` on update is an unknown field → SYNTAX `VALIDATION` failure, Doc-4A §9).

**4. Response Schema**

| Field | Type | Source authority |
|---|---|---|
| `finance_record_id` | `uuid` | Operations `finance_records` (UUIDv7, Doc-4A §8) |
| `record_type` | `enum<tax\|ait\|payment\|expense>` | Doc-2 §10.5 |
| `revision` | `numeric` | Operations `finance_records` row revision (optimistic-concurrency token, Doc-4A §14) — the value to supply as the next `expected_revision`; not a lifecycle state |
| `reference_id` | `uuid` | Doc-4A §22.1 C-05 (every response) |

**5. Validation Matrix**

| Stage | Authority | Validation | Failure Class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `record_type` ∈ fixed four-value enum; `amount` numeric | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; Doc-4A §6 | membership holds `can_manage_finance_records` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the record is the active org's (create scoped to active org; update → existing own-org row) | `NOT_FOUND` (collapse, H.9) |
| 5 DELEGATION | Doc-4A §6B | not eligible — own-org finance records; no representative-org scenario | — |
| 6 STATE | Doc-2 §3.5; Doc-4A §13 | `finance_records` is simple — no state machine; `State-Machine-Effects: none` (no transition gate) | — |
| 6 STATE → concurrency sub-check (**update-only**) | Doc-4A §14 | **update only** — optimistic-concurrency: `expected_revision` = current revision. **Create executes no concurrency sub-check** (no prior row exists). | `CONFLICT` (update only) |
| 7 REFERENCE | Doc-4A §4.5 | none — `finance_records` references no cross-module/cross-aggregate entity (org-internal) | — |
| 8 BUSINESS | Doc-2 §10.5 | structured text only — no funds movement, no file uploads (a finance record is org-internal text; not a Billing invoice or a BC-OPS-2 trade invoice/payment record) | `BUSINESS` (if a funds/file-upload operation is attempted) |
| 9 POLICY | Doc-3 §12.2 | none | — |

**6. Authorization Matrix**

| Actor | Permission | Allowed / Denied | Authority |
|---|---|---|---|
| User (org member, owning org) | `can_manage_finance_records` | **Allowed** — create/update own-org finance records | Doc-2 §7 |
| User (org member) without `can_manage_finance_records` | — | **Denied** → `AUTHORIZATION` | Doc-2 §7; Doc-4A §6 |
| User (any org) on another org's record | — | **Denied** → `NOT_FOUND` (collapse) | Doc-4A §7.3/§7.5 |
| Representative org via delegation | n/a | **Denied** — delegation not eligible (own-org finance records) | Doc-4A §6B |

Enforcement = Identity `check_permission` (Doc-4C §C3/§C8); no shadow authorization.

**7. State Enforcement** — Allowed States: **n/a** — `finance_records` is **simple** (Doc-2 §3.5; no lifecycle states) · Forbidden States: **n/a** (no states defined) · State Violations: **none** (`State-Machine-Effects: none`, Doc-4A §13.1) · Concurrency: update is optimistic on `expected_revision`; lost race → `CONFLICT`. **No lifecycle defined or redefined.**

**8. Audit Binding** — Audit Event: **`[ESC-OPS-AUDIT]`** — Doc-2 §9 **Financial** does not separately enumerate a `finance_records` create/edit action (it enumerates platform-invoice/trade-invoice/payment-record actions); nearest §9 Financial action bound by pointer (channel Doc-2 §9 additive; **no action invented**) · Audit Payload: actor (`User`), `organization_id`, `entity_type=finance_records`, `entity_id`, action, old/new value, timestamp (Doc-2 §9 record fields) · Audit Authority: Doc-2 §9 + Doc-4B `core.append_audit_record.v1` (in-transaction). Every mutating operation (create, update) is audited.

**9. Event Binding** — Event Name: **none** · Publisher: n/a · Consumers: n/a · Trigger: n/a. BC-OPS-5 emits **no** domain event (Doc-2 §8; H.7 — state + audit only). **No event invented.**

**10. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `record_type` enum; non-numeric `amount`; missing required) | false |
| `AUTHORIZATION` | actor/context/slug fail (own-org member without slug) | false |
| `NOT_FOUND` | record not owned by active org (update; protected-fact collapse, H.9) | false |
| `STATE` | not applicable — `finance_records` has no state machine (no `STATE` failure arises) | n/a |
| `CONFLICT` | (update) `expected_revision` ≠ current (lost race) — **distinct from `STATE`** | true (re-read then retry) |
| `BUSINESS` | `record_type` mutation attempt, or any funds/file-upload operation (structured text only) | false |
| `DEPENDENCY` | Doc-4B (audit-write) transiently unavailable — **distinct from `REFERENCE`** | true |
| `SYSTEM` | unexpected internal failure | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a record outside the caller's org is `NOT_FOUND`, never `AUTHORIZATION`. `REFERENCE` and `DEPENDENCY` are distinct (no `REFERENCE` check here; `DEPENDENCY` = Doc-4B transient); `STATE` and `CONFLICT` are distinct (no `STATE` machine; `CONFLICT` = concurrency). `Timing-Uniformity`: not-owned / not-exist identical.

**11. Idempotency Rules** — Key source: client-supplied idempotency key + dedup window (POLICY key — `[ESC-OPS-POLICY]`, H.8). Replay behavior: a replay within the window returns the same `finance_record_id` with **no duplicate row and no duplicate audit** (create); a replayed update that already applied returns the same result. Conflict behavior: (update) a stale `expected_revision` → `CONFLICT` (re-read then retry); business-duplicate (two distinct keys creating the same record) is permitted (Doc-2 §10.5 places no uniqueness constraint; Doc-4A §14.6 — never `CONFLICT` for business-uniqueness).

**12. Cross-Module References** — Source authority / consuming authority: **Identity (DF-1)** — active-org/membership resolution + `check_permission` (consumed). **Platform Core (DF-8)** — audit-write (consumed). **Billing (DF-6)** — **strict separation**: no `billing.platform_invoice`/subscription/payment entity referenced; `finance_records` ≠ Billing; **no funds**. **No ownership leakage** — BC-OPS-5 references no other Operations context's aggregate and no RFQ/Marketplace/Trust entity.

**13. AI-Agent Implementation Notes** — Validation execution order (Doc-4A §11.2, canonical, never reordered): `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`; failure terminates at the first failing stage. For these contracts: stage 5 DELEGATION is not eligible (own-org), stage 6 STATE applies no transition gate (`finance_records` has no state machine) and carries the update-only optimistic-concurrency sub-check, stage 7 REFERENCE is not exercised (org-internal), stage 9 POLICY is not exercised. State enforcement: **`finance_records` has no lifecycle** — never synthesize states or transitions; mutations declare `State-Machine-Effects: none`. Audit requirements: every create/update writes an audit record via Doc-4B in the same transaction (carried `[ESC-OPS-AUDIT]`). `record_type` is the **fixed four-value enum** (tax/ait/payment/expense) — never extend; set at create and **structurally excluded from update** (immutable). Finance records are **structured text only** (Doc-2 §10.5) — **never** link to Billing (`platform_invoices` = Doc-4I, DF-6), **never** treat as a BC-OPS-2 trade invoice/payment record, **never** move funds. Own-org scope only; collapse to `NOT_FOUND` for non-owners. May read Trust outputs but **never** compute/mutate a Trust score (DF-4).

---

## §F8.2 — `ops.get_finance_record.v1` · `ops.list_finance_records.v1` — Finance Record Reads

**1. Contract Metadata** — Contract Name: Finance Record Reads (`ops.get_finance_record.v1`, `ops.list_finance_records.v1`) · Aggregate Owner: **Finance Record** (`finance_records`, Operations / BC-OPS-5) · Bounded Context: **BC-OPS-5** (§F8) · Template **21.3 Query** · Actor: **User** (org member) · Lifecycle State Impact: **none** (read) · Authorization Requirement: **`can_manage_finance_records`** (Doc-2 §7) · Idempotency Requirement: **not-applicable** (pure query, Doc-4A §14.1).

**2. Endpoint Definition** *(navigation only; non-normative)* — **get:** Method `GET` · URI `/operations/finance-records/{finance_record_id}` · Purpose: read one own-org finance record. **list:** Method `GET` · URI `/operations/finance-records` · Purpose: list own-org finance records (filter + pagination).

**3. Request Schema**

| Field | Type | Required | Validation notes |
|---|---|---|---|
| `finance_record_id` | `uuid` | yes (get) | target record |
| `filter` | `object{ record_type?, period? }` | no (list) | allowlisted filter fields only (Doc-4A §9.6) |
| `page_size` | `numeric` | no (list) | bounded by POLICY key (§18 — `[ESC-OPS-POLICY]`); default by POLICY key |
| `page_token` | `string` | no (list) | opaque pagination token (Doc-4A §22.3) |

**4. Response Schema**

| Field | Type | Source authority |
|---|---|---|
| `record` / `items` | `object` / `list<object{ finance_record_id, record_type, period, amount, currency, note }>` | Doc-2 §10.5 `finance_records` |
| `next_page_token` | `string` (nullable) | Doc-4A §22.3 |
| `reference_id` | `uuid` | Doc-4A §22.1 C-05 |

**5. Validation Matrix**

| Stage | Authority | Validation | Failure Class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_manage_finance_records` (read under the finance slug; no separate read slug in Doc-2 §7 — carry `[ESC-OPS-SLUG]` only if a distinct read slug is later required) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | **get:** the record is the active org's (else `NOT_FOUND` collapse). **list:** results restricted to the active `organization_id` through RLS enforcement (only own-org rows enumerated) | `NOT_FOUND` (collapse, H.9) — get; scoped result set — list |
| 5 DELEGATION | Doc-4A §6B | not eligible — own-org reads | — |
| 6 STATE | Doc-2 §3.5 | none (read; no state machine) | — |
| 7 REFERENCE | Doc-4A §4.5 | none | — |
| 8 BUSINESS | — | none | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-OPS-POLICY]`) | `VALIDATION` |

**6. Authorization Matrix**

| Actor | Permission | Allowed / Denied | Authority |
|---|---|---|---|
| User (org member, owning org) | `can_manage_finance_records` | **Allowed** — read own-org finance records | Doc-2 §7 |
| User without `can_manage_finance_records` | — | **Denied** → `AUTHORIZATION` | Doc-2 §7 |
| User (any org) on another org's record | — | **Denied** → `NOT_FOUND` (collapse); `list` never enumerates cross-tenant rows | Doc-4A §7.3/§7.5 |

Enforcement = Identity `check_permission` (Doc-4C); no shadow authorization.

**7. State Enforcement** — None (read). `finance_records` has no state machine.

**8. Audit Binding** — Audit Event: **none** — reads are **not audited** (Doc-4A §17.1). Audit Payload: n/a. Audit Authority: Doc-4A §17.1.

**9. Event Binding** — Event Name: **none** · Publisher/Consumers/Trigger: n/a. No event emitted or consumed.

**10. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter/sort field; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | record not owned by active org (get; collapse, H.9) | false |
| `SYSTEM` | unexpected internal failure | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a record outside the caller's org is `NOT_FOUND`; `list` returns **only** own-org rows. `Timing-Uniformity`: not-owned / not-exist identical.

**11. Idempotency Rules** — Key source: n/a (`Idempotency: not-applicable`, Doc-4A §14.1). Replay behavior: side-effect-free; identical inputs return identical results. Conflict behavior: n/a (read). Pagination per Doc-4A §22.3.

**12. Cross-Module References** — Source authority / consuming authority: **Identity (DF-1)** — context + `check_permission` (consumed). **Platform Core (DF-8)** — none beyond read infrastructure. **No ownership leakage**; org-internal only.

**13. AI-Agent Implementation Notes** — Validation execution order: SYNTAX → CONTEXT → AUTHZ → SCOPE → (no STATE/REFERENCE/BUSINESS) → POLICY (`page_size`). State enforcement: none (read). Audit: none (reads not audited, Doc-4A §17.1). Strictly **own-org** finance text; never cross-tenant; the `list` surface enumerates only the caller's rows. Not a financial-transaction surface (records only — Doc-2 §10.5).

---

## Appendix A — BC-OPS-5 Contract Register (Pass-B Part 5)

| § | Contract-ID(s) | Template | Owned entity (Doc-2) | Actor | Emits event | Audit (Doc-2 §9) |
|---|---|---|---|---|---|---|
| §F8.1 | `ops.create_finance_record.v1` · `ops.update_finance_record.v1` | 21.4 | `finance_records` | User | none | `[ESC-OPS-AUDIT]` (nearest §9 Financial) |
| §F8.2 | `ops.get_finance_record.v1` · `ops.list_finance_records.v1` | 21.3 | Finance Record | User | none | none (read) |

**Part-5 invariants (held):** BC-OPS-5 owns exactly **one** aggregate (Finance Record: `finance_records`, no children); **emits zero domain events** and consumes none (state + audit only — Doc-2 §8; Pass-A §F8/§F11); binds the single Doc-2 §7 slug `can_manage_finance_records` (no slug invented); **every mutation carries `[ESC-OPS-AUDIT]`** (Doc-2 §9 enumerates no `finance_records` action; no action invented); carries `[ESC-OPS-POLICY]` for dedup-window/page-size keys and `[ESC-OPS-SLUG]` for the read-slug question; `finance_records` is **simple — no lifecycle** (no state/transition invented); `record_type` is the fixed four-value enum; **structured text only — no funds, no file uploads, no Billing/payment/subscription ownership** (DF-6); owns **no** RFQ/quotation/matching/routing/ranking/award (DF-3 — does not absorb RFQ authority) and computes/mutates **no** Trust score (DF-4 — may consume Trust outputs only). **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/aggregate created.**

---

## Appendix B — Carried Markers (Part 5; unchanged)

- **DF-1** (Identity — `check_permission`/org-context, consumed), **DF-6** (Billing — strict separation; `finance_records` ≠ `platform_invoices`/subscriptions/payments; no funds), **DF-8** (Platform Core — audit-write).
- **`[ESC-OPS-AUDIT]`** (Doc-2 §9 additive) — every BC-OPS-5 mutation (`finance_records` create/update): Doc-2 §9 Financial enumerates no `finance_records` action; nearest action bound by pointer; no action invented.
- **`[ESC-OPS-POLICY]`** (Doc-3 §12.2 additive) — idempotency dedup-window key and list `page_size` bound (no `operations` POLICY namespace registered; platform default referenced by name; no key invented).
- **`[ESC-OPS-SLUG]`** (Doc-2 §7 additive) — only if a distinct finance **read** slug is later required (current reads bind `can_manage_finance_records`).

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4F — Pass-B (Hardening) Part 5 v1.0 (FROZEN) — BC-OPS-5 Finance Records — final immutable Part-5 baseline. Authored against `Doc-4F_Content_v1.0_PassA_FROZEN.md` §F8 (sole contract authority). BC-OPS-5 owns one aggregate (Finance Record); emits no domain event; `finance_records` is simple (no lifecycle); `record_type` fixed four-value enum (immutable); structured text only — no funds, no Billing/payment/subscription ownership (DF-6); owns no RFQ/quotation/matching/routing/ranking/award (DF-3) and computes no Trust score (DF-4); the procurement moat, Marketplace boundary, and Trust firewall are preserved; nothing invented. Carried markers DF-1/DF-6/DF-8, `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Authorized next stage: Module-4 (Doc-4F) consolidated freeze.*
