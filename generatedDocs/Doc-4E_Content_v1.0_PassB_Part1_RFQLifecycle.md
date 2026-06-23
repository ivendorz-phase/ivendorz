# Doc-4E — RFQ Procurement Engine — Content v1.0, Pass-B (Hardening) — Part 1 of 5

## BC-1 — RFQ Authoring & Lifecycle Hardening (§E4)

| Field | Value |
|---|---|
| Document | Doc-4E Content v1.0 — **Pass-B (hardening), Part 1 of 5** — Module 3 RFQ Procurement Engine (`rfq` schema) |
| Part scope | **BC-1 — RFQ Authoring & Lifecycle (§E4)** — the 9 lifecycle contracts of `Doc-4E_PassA_v1.0_FROZEN` §E4, hardened to implementation grade |
| Lifecycle step | Content Pass-B authoring → (next) Independent Hard Review → Pass-B Patch → Patch Verification → Freeze Audit → FROZEN |
| Contract authority | `Doc-4E_PassA_v1.0_FROZEN.md` (sole contract authority; **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4E_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN — all FROZEN |
| Parts (sequence) | **Part 1 — BC-1 RFQ Lifecycle** · Part 2 — BC-2 Matching Pipeline · Part 3 — BC-3+BC-7 Routing & Governance · Part 4 — BC-4 Quotation Management · Part 5 — BC-5+BC-6 Evaluation, Comparison, Award |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 1).** Convert the 9 Pass-A BC-1 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices bound to the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement (allowed/forbidden source states + concurrency), audit/event bindings, error registers (Doc-4A §12 closed class set), and idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A. The procurement moat is preserved (RFQ owns lifecycle/matching/routing/ranking/comparison/selection; Marketplace owns vendor discovery/profiles/attributes). Carried dependencies **DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 1.

---

## §H — Part-1 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; the canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is always established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, the **source authority** (the frozen doc/section that owns the rule), the **rule**, and the **failure outcome** (error class from H.4).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `human_ref` (string, Doc-2 §0.1), `enum<…>` (membership fixed by the cited Doc-2/Doc-3 source), `string`, `text`, `numeric` (Doc-2 §10.4 `NUMERIC`), `string[]`/`uuid[]` (arrays; cardinality stated), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, **not** internal field schema, which is development-doc scope), `timestamptz`, `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B five-condition check, stage 5). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement source for every check is Identity's `check_permission` (Doc-4C §C3/§C8, consumed; no shadow authorization). Buyer-side scope = the buyer **controlling organization** of the target `rfqs` row.
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes follow `rfq_<domain>_<code>` (Appendix B namespace `rfq_`); **specific numeric codes are assigned at the development-document stage** — Pass-B fixes the **class + trigger + retryable** per error, not the integer. Protected-fact failures collapse to `NOT_FOUND` (§7.5). Category 4/5 → `NOT_FOUND` or `AUTHORIZATION` per §12.4; Category 9 → `QUOTA` (finite entitlement) or `RATE_LIMITED` (throughput) per §11.2 dual mapping.
- **H.5 — State machine (Doc-2 §5.4 RFQ, as amended by `Doc-2_Patch_v1.0.3` PATCH-D2-01/02; Doc-4A §13).** Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all other states → STATE error). Terminal states (`closed_won`, `closed_lost`, `cancelled`, `expired`) never transition (§13; Doc-3 §1.6 FIXED). Concurrency: optimistic — a transition asserts the expected current state (and `current_version_no` where versioned); a lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified** — Pass-B enforces the frozen edges only.
- **H.6 — Audit (Doc-2 §9 RFQ domain via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User`/`Admin`/`System`/`AI Agent`, Doc-2 §9), **object scope** (the `rfq.*` row), **timing** (in the same transaction as the state write + outbox insert — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B write mechanism). Reads are not audited (§17.1). Actions not separately enumerated in §9 carry **`[ESC-RFQ-AUDIT]`** (interim: nearest §9 action by pointer; no action invented).
- **H.7 — Events (Doc-2 §8 RFQ catalog via Doc-4B `core.write_outbox_event.v1`).** Emitted events are only the Doc-2 §8 RFQ catalog; written transactionally (business write + event insert one transaction); **no event coined** (§16.4). Consumers are idempotent (Doc-4A §16). Non-events (cancellation, expiry, moderation, internal reject, shortlist) are state+audit only.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key, Doc-3 §12.2 — `[ESC-RFQ-POLICY]` if a referenced key is absent; none required in Part 1). Replay within the window → same result, **no duplicate audit, no duplicate event**. System (21.5) contracts are inherently idempotent (re-fire safe). Queries (21.3) are idempotent and side-effect-free by nature.
- **H.9 — `rfqs`/`rfq_versions` field source (Doc-2 §10.4).** The hardened schemas bind to the frozen Doc-2 §10.4 columns: `rfqs` (`human_ref RFQ-…`, `state §5.4`, `routing_mode enum<approved_only|approved_conditional|approved_open|open_market>`, `work_nature[] CHECK ⊆ {supply,service,fabricate,consult}`, `category_id`, `estimated_value NUMERIC` (NOT NULL at submit), `currency DEFAULT 'BDT'`, delivery geography, `current_version_no`); `rfq_versions` (`version_no`, `content_jsonb`, `spec_document_ids[]`, `revision_reason`, `is_immutable` set on first quotation, `created_by`). **Pass-B introduces no column** — it binds existing ones.

---

## §E4.1 — `rfq.create_rfq.v1` — Create RFQ (draft)

**1. Contract Metadata** — Contract ID `rfq.create_rfq.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (`rfqs` AR + initial `rfq_versions`) · Actor types **User** (buyer member) · Bounded context **BC-1** (§E4).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes (source) |
|---|---|---|---|---|---|
| `category_id` | `uuid` | yes | no | 1 | Marketplace category reference (DE-2; service-validated, bare UUID) |
| `work_nature` | `enum<supply\|service\|fabricate\|consult>[]` | yes | no | 1..4 (set; no dup) | Doc-2 §10.4 `work_nature[] CHECK ⊆ {…}` |
| `estimated_value` | `numeric` | no (draft) | yes (until submit) | 1 | Doc-2 §10.4 `NUMERIC`; required at submit not create (A-05) |
| `currency` | `enum<BDT>` | no | no | 1 | Doc-2 §10.4 `DEFAULT 'BDT'` |
| `delivery_geography` | `jsonb` | no (draft) | yes | 1 | ≥ district at submit (Doc-3 §1.2); shape = dev-doc scope |
| `routing_mode` | `enum<approved_only\|approved_conditional\|approved_open\|open_market>` | no (draft) | yes (until submit) | 1 | Doc-2 §10.4 enum |
| `scope_text` | `text` | no | yes | 1 | draft scope; min length enforced at submit (POLICY `rfq.min_scope_chars`) |
| `spec_document_ids` | `uuid[]` | no | yes | 0..N | buyer-uploaded spec doc refs → `rfq_versions.spec_document_ids[]` |
| `no_formal_spec` | `bool` | no | no | 1 | the "no formal spec" flag (Doc-3 §1.2 submission gate) |

**3. Response Schema** — `rfq_id : uuid (1)`, `human_ref : human_ref (1, "RFQ-…")`, `state : enum (1) = draft`, `current_version_no : numeric (1) = 1`, `reference_id : uuid (1)` (Doc-4A §22.1 C-05).

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| all typed fields | 1 SYNTAX | Doc-4A §9 | presence/type/enum membership; `work_nature` ⊆ frozen set, no dup | `VALIDATION` (aggregated) |
| actor + active org | 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active buyer-org context valid | `AUTHORIZATION` |
| `can_create_rfq` | 3 AUTHZ | Doc-2 §7; Doc-4A §6 | membership holds slug | `AUTHORIZATION` |
| target org scope | 4 SCOPE | Doc-4A §6.1/§7.3 | create scoped to creator's active org | `AUTHORIZATION` |
| (delegation) | 5 DELEGATION | Doc-4A §6B | n/a — create not delegation-eligible | — |
| (state) | 6 STATE | Doc-2 §5.4 | n/a — create has no prior state | — |
| `category_id` | 7 REFERENCE | Doc-4A §4.5; DE-2 | category exists + active via Marketplace service | `REFERENCE` |
| draft permissiveness | 8 BUSINESS | Doc-3 §1.2 (draft) | no submission-gate rule applied at draft | — (pass) |
| (policy) | 9 POLICY | Doc-3 §12.2 | none at create | — |

**5. Authorization Matrix** — Actor **User** · Slug **`can_create_rfq`** (Doc-2 §7) · Scope = creator's active buyer org · Delegation **not eligible** · Enforcement source Identity `check_permission` (Doc-4C §C3/§C8).

**6. State Machine Enforcement** — Allowed source states **none** (creation) · Target **`draft`** (Doc-2 §5.4 entry) · Forbidden: n/a · Concurrency: new row; `human_ref` allocated row-locked via Doc-4B `core.allocate_human_reference.v1` (Doc-2 §10.11.8).

**7. Audit Binding** — Action **Doc-2 §9 RFQ "create"** · Attribution **User** · Object scope new `rfqs` row · Timing same transaction as the row write · Source authority Doc-2 §9 + Doc-4B `core.append_audit_record.v1`.

**8. Event Binding** — Emitted **`RFQCreated`** (Doc-2 §8) via Doc-4B outbox-write, same transaction · Consumed none · Trigger row created in `draft` · Idempotency: replay → one row, one `RFQCreated`.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (missing/typed/enum) | false |
| `AUTHORIZATION` | actor/context/slug/scope fail (stages 2–4) | false |
| `REFERENCE` | `category_id` not found/inactive (Marketplace service) | false (true if service transiently `DEPENDENCY`) |
| `DEPENDENCY` | Marketplace/Doc-4B service transiently unavailable | true |
| `SYSTEM` | unexpected failure | true |

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (POLICY); replay within window → same `rfq_id`, no duplicate audit/event; concurrent duplicate create requests with the same idempotency key → one row (the second returns the first's result).

**11. Cross-Module References** — **Identity (DE-1):** active-org/membership resolution, `check_permission`. **Marketplace (DE-2):** `category_id` validation (read-only service). **Platform Core (DE-8):** `core.allocate_human_reference.v1`, audit-write, outbox-write. Others: none.

**12. AI-Agent Implementation Notes** — Draft is permissive (Doc-3 §1.2) — do **not** enforce the submission FIXED-set here. `category_id` is a Marketplace UUID, service-validated, **no cross-schema FK** (Doc-2 §0.3) — never re-model the category. Allocate `human_ref` via Doc-4B only (never self-generate).

---

## §E4.2 — `rfq.update_rfq.v1` — Edit RFQ (versioning)

**1. Contract Metadata** — Contract ID `rfq.update_rfq.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (`rfqs` + `rfq_versions` append) · Actor **User** (buyer) · BC-1 (§E4).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | target RFQ |
| `expected_version_no` | `numeric` | yes | no | 1 | optimistic-concurrency assertion (H.5) |
| `changed_fields` | `jsonb` | yes | no | 1 | the edited attributes (shape = dev-doc scope; subset of §E4.1 editable fields) |
| `revision_reason` | `text` | yes | no | 1 | mandatory (Doc-2 §10.4 `rfq_versions.revision_reason`) |

**3. Response Schema** — `rfq_id : uuid (1)`, `new_version_no : numeric (1)`, `current_version_no : numeric (1)`, `state : enum (1)` (unchanged), `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `expected_version_no`, `revision_reason` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_create_rfq` (edit authority) | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| RFQ belongs to active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns the RFQ | `NOT_FOUND` (collapse, §7.5) |
| editable state | 6 STATE | Doc-2 §5.4; §13 | RFQ not terminal; version-immutability honored (Doc-2 §5.4 guard) | `STATE` |
| version match | 6 STATE / concurrency | Doc-4A §14 | `expected_version_no` = `current_version_no` | `CONFLICT` |
| immutability | 8 BUSINESS | Doc-2 §5.4; §10.11.6 | once a quotation exists vs version X, edit creates X+1; X stays immutable | `BUSINESS` (if attempting to mutate an immutable version) |
| material-edit re-notify | 9 POLICY | Doc-3 §1.2; POLICY `rfq.edit_clock_reset` | material edit resets response clock for un-responded invitees | — (effect; not a failure) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_create_rfq`** · Scope = buyer controlling org · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source: any **non-terminal** RFQ state · Target: **same state** (attribute/version change, not a §5.4 transition) · Forbidden: `closed_won`, `closed_lost`, `cancelled`, `expired` → `STATE` · Concurrency: optimistic on `current_version_no`; lost race → `CONFLICT`; append creates `rfq_versions.version_no = current+1`.

**7. Audit Binding** — Action **Doc-2 §9 RFQ "edit (new version)"** · Attribution User · Object scope `rfqs` + new `rfq_versions` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** at edit (H.7; re-notification is a routing effect, §E6, not an event) · Consumed none · Idempotency: replay → one new version, no duplicate.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | RFQ not owned by active org (protected-fact collapse) | false |
| `STATE` | RFQ terminal, or mutate-immutable-version attempt | false |
| `CONFLICT` | `expected_version_no` ≠ current (lost race) | true (re-read then retry) |
| `BUSINESS` | immutability rule violation | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required`; the `expected_version_no` assertion makes retries safe (a replayed edit that already applied returns the same `new_version_no`; a stale version → `CONFLICT`). No duplicate audit/version on replay within the dedup window.

**11. Cross-Module References** — **Identity (DE-1):** context + `check_permission`. **Platform Core (DE-8):** audit-write. **Communication (DE-6):** material-edit re-notification is dispatched by Communication off the routing path — **not authored here**. Others: none.

**12. AI-Agent Implementation Notes** — **Never overwrite a quoted version** (Doc-2 §5.4 immutability; CI trigger §10.11.6) — edits always append `version_no+1`. Material-edit re-notification + response-clock reset is a routing/Communication effect (§E6/DE-6), not an event and not authored here. Use `expected_version_no` for optimistic concurrency (Doc-4A §14).

---

## §E4.3 — `rfq.submit_rfq.v1` — Submit RFQ (→ approval or moderation)

**1. Contract Metadata** — Contract ID `rfq.submit_rfq.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (`rfqs`) · Actor **User** (buyer) · BC-1 (§E4).

**2. Request Schema** — `rfq_id : uuid (1, required)`; `expected_version_no : numeric (1, required)` (concurrency); `approval_routing_hint : jsonb (0..1, nullable)` (optional ORG-chain hint).

**3. Response Schema** — `rfq_id : uuid (1)`, `state : enum<submitted|pending_internal_approval> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix** *(submission FIXED-set is the BUSINESS stage, bound to Doc-3 §1.2 / Doc-2 §5.4 — not re-derived)*

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `expected_version_no` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_create_rfq` (submit) or `can_approve_rfq` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer org owns RFQ | `NOT_FOUND` (collapse) |
| state = `draft` | 6 STATE | Doc-2 §5.4 | submit legal only from `draft` | `STATE` |
| submission FIXED-set | 8 BUSINESS | Doc-3 §1.2; Doc-2 §5.4 (A-05) | category active; `work_nature` non-empty; `estimated_value`>0 BDT; delivery ≥ district; `routing_mode` set; spec attachment OR `no_formal_spec` + scope ≥ min; specs reference an active doc revision | `BUSINESS` (or `VALIDATION` for the value>0 numeric bound) |
| min scope length | 9 POLICY | Doc-3 §12.2 `rfq.min_scope_chars` | scope_text length ≥ key value (when `no_formal_spec`) | `BUSINESS` |

**5. Authorization Matrix** — Actor **User** · Slugs **`can_create_rfq`** (submit) / **`can_approve_rfq`** (self-approve path) · Scope = buyer controlling org · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`draft`** only · Target **`submitted`** (no approval required) **or** **`pending_internal_approval`** (ORG `rfq_approval_mode ≠ none`) · Forbidden: all non-`draft` states → `STATE` · Concurrency: optimistic on `current_version_no`; the submit asserts state=`draft`; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 RFQ "submit"** · Attribution User (self-approval records the actor as both creator and approver, Doc-3 §1.2) · Object scope `rfqs` · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`RFQSubmitted`** on the `submitted` branch (Doc-2 §8). **Self-approval path** (submitter holds `can_approve_rfq`): emits **`RFQSubmitted` + `RFQApproved`** (both Doc-2 §8) in the same transaction (Pass-A PA-12). No event on the `pending_internal_approval` branch. Idempotency: replay → one transition, no duplicate events.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX, or `estimated_value` ≤ 0 numeric bound | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | RFQ not owned (collapse) | false |
| `STATE` | not in `draft` | false |
| `BUSINESS` | submission FIXED-set failure (Doc-3 §1.2) | false |
| `CONFLICT` | version/state race | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required`; replay after a successful submit returns the resulting state with no second `RFQSubmitted`/`RFQApproved`; the state assertion (`draft`) guarantees a re-submit of an already-submitted RFQ → `STATE` (or the idempotent same-result within the dedup window).

**11. Cross-Module References** — **Identity (DE-1):** context, `check_permission`, ORG `organization_workflow_settings.approval_chain` (consumed for the approval-required branch). **Platform Core (DE-8):** audit-write, outbox-write, POLICY read (`rfq.min_scope_chars`). **Admin (DE-5):** downstream moderation (not invoked here). Others: none.

**12. AI-Agent Implementation Notes** — The submission FIXED-set is enforced at the **BUSINESS** stage by pointer to Doc-3 §1.2 / Doc-2 §5.4 — do **not** invent additional gates. `RFQSubmitted` fires only on the `submitted` branch; the self-approval dual-emit is same-transaction (PA-12). Silence never auto-approves (Doc-3 §1.2 FIXED) — there is no timeout path in this contract.

---

## §E4.4 — `rfq.approve_rfq.v1` · `rfq.reject_internal_rfq.v1` — Internal Approval Decision

**1. Contract Metadata** — Contract IDs `rfq.approve_rfq.v1`, `rfq.reject_internal_rfq.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (`rfqs`) · Actor **User** (buyer approver) · BC-1 (§E4).

**2. Request Schema** — `rfq_id : uuid (1, required)`; `expected_version_no : numeric (1, required)`; `decision : enum<approve|reject> (1, required)`; `reject_reason : text (0..1, required iff decision=reject, nullable otherwise)`.

**3. Response Schema** — `rfq_id : uuid (1)`, `state : enum<submitted|draft> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `decision`, conditional `reject_reason` | 1 SYNTAX | Doc-4A §9 | presence/type; `reject_reason` required when `decision=reject` | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_approve_rfq` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer org owns RFQ | `NOT_FOUND` (collapse) |
| state = `pending_internal_approval` | 6 STATE | Doc-2 §5.4 | decision legal only from pending | `STATE` |
| approval chain | 8 BUSINESS | Doc-3 §1.2; Identity ORG `approval_chain` | approver is the configured next holder (consumed from Identity) | `BUSINESS` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_approve_rfq`** (Doc-2 §7) · Scope = buyer controlling org · Delegation not eligible · Enforcement Identity `check_permission`; ORG approval-chain is Identity-owned config (DE-1, consumed).

**6. State Machine Enforcement** — Allowed source **`pending_internal_approval`** only · Target **`submitted`** (approve) / **`draft`** (reject) · Forbidden: all other states → `STATE` · Concurrency: optimistic; a stale decision (state already advanced) → `CONFLICT`; multi-step chains escalate stepwise (Doc-3 §1.2) — each step is a separate invocation.

**7. Audit Binding** — Action **Doc-2 §9 RFQ "internal approve/reject"** · Attribution User (approver) · Object scope `rfqs` · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`RFQApproved`** (Doc-2 §8) on approve; **reject emits no event** (state + audit only, H.7) · Consumed none · Idempotency: replay → one transition, at most one `RFQApproved`.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX, or missing `reject_reason` on reject | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | RFQ not owned (collapse) | false |
| `STATE` | not in `pending_internal_approval` | false |
| `BUSINESS` | approver not in the configured chain | false |
| `CONFLICT` | decision race (state advanced) | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required`; the state assertion makes a replayed approve/reject return the resulting state with no second `RFQApproved`/no duplicate audit; concurrent approvals resolve to one (the loser → `CONFLICT`).

**11. Cross-Module References** — **Identity (DE-1):** context, `check_permission`, ORG `organization_workflow_settings.approval_chain` (consumed). **Platform Core (DE-8):** audit-write, outbox-write. Others: none.

**12. AI-Agent Implementation Notes** — **Silence never auto-approves** (Doc-3 §1.2 FIXED) — reminders/escalation on a stale pending approval are Communication effects (DE-6), not part of this contract and never an auto-approve. The approval chain is Identity-owned ORG config — consume it, never re-model it. Reject requires a reason; reject has no event.

---

## §E4.5 — `rfq.moderate_rfq.v1` — Moderation Decision (pass / reject)

**1. Contract Metadata** — Contract ID `rfq.moderate_rfq.v1` · Template **21.6 Admin** (no active org context, Doc-4A §5.6) · Owned aggregate **RFQ** (`rfqs` state transition; **moderation decision authority = Admin, DE-5**) · Actor **Admin** (platform-staff) or **System** (per `moderation.mode`) · BC-1 (§E4).

**2. Request Schema** — `rfq_id : uuid (1, required)`; `decision : enum<pass|reject> (1, required)`; `reject_reason_code : enum<rfq_correction_required> (0..1, required iff decision=reject)` (Doc-2 §5.4 PATCH-D2-01 structured reason); `reject_reason_text : text (0..1, nullable)`.

**3. Response Schema** — `rfq_id : uuid (1)`, `state : enum<matching|draft> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `decision`, conditional `reject_reason_code` | 1 SYNTAX | Doc-4A §9 | presence/type; reason code from the frozen set on reject | `VALIDATION` |
| Admin scope declared | 2 CONTEXT | Doc-4A §5.6 | platform-staff context; **no active org** | `AUTHORIZATION` |
| `staff_can_moderate_rfq` | 3 AUTHZ | Doc-2 §7 | staff slug held | `AUTHORIZATION` |
| (scope) | 4 SCOPE | Doc-4A §5.6 | platform scope (not org-scoped) | `AUTHORIZATION` |
| state ∈ {`submitted`,`under_review`} | 6 STATE | Doc-2 §5.4 (+PATCH-D2-01) | pass: `submitted→under_review→matching`; reject: `under_review→draft` | `STATE` |
| moderation checks | 8 BUSINESS | Doc-3 §1.2; §10 | contact-leak scrub, duplicate detection, value plausibility, prohibited content (Doc-3 §1.2) | `BUSINESS` (reject path is a decision outcome, not a request error) |

**5. Authorization Matrix** — Actor **Admin** (or **System** per `moderation.mode`) · Slug **`staff_can_moderate_rfq`** (Doc-2 §7) · Scope = platform (no org context, §5.6) · Delegation **n/a** · Enforcement Identity `check_permission` (platform-staff space).

**6. State Machine Enforcement** — Allowed source **`submitted`** / **`under_review`** · Target **`matching`** (cleared) or **`draft`** (reject; Doc-2 §5.4 **PATCH-D2-01**, platform-moderation actor) · Forbidden: all other states → `STATE` · Concurrency: optimistic on state; buyers cannot trigger this transition (actor-type gate at CONTEXT).

**7. Audit Binding** — Action **Doc-2 §9 RFQ "moderation pass/fail"** · Attribution **Admin** (or **System**) · Object scope `rfqs` · Timing same transaction · Source Doc-2 §9 + Doc-4B. **The `under_review → draft` reject action carries `[ESC-RFQ-AUDIT]`** (interim: bind §9 "moderation pass/fail" by pointer; channel Doc-2 §9 additive; no action invented).

**8. Event Binding** — Emitted **none** (no Doc-2 §8 moderation event; state + audit only, H.7) · Consumed none · Buyer "correction-required" notification is Communication's (DE-6), triggered off the state change · Idempotency: replay → one transition.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX, or missing/invalid reason code on reject | false |
| `AUTHORIZATION` | non-staff actor / missing `staff_can_moderate_rfq` / org-context present | false |
| `STATE` | RFQ not in `submitted`/`under_review` | false |
| `BUSINESS` | moderation business-rule failure (where surfaced as an error vs a reject outcome) | false |
| `CONFLICT` | concurrent moderation race | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required`; replay of a completed moderation returns the resulting state with no duplicate audit; System auto-pass (per `moderation.mode`) is idempotent on re-fire.

**11. Cross-Module References** — **Admin (DE-5):** moderation **decision authority** is Admin's; this contract is the RFQ-side state transition surface that **reflects** that authority. **Identity (DE-1):** platform-staff `check_permission`. **Platform Core (DE-8):** audit-write. **Communication (DE-6):** buyer correction-required notification (not authored here). Others: none.

**12. AI-Agent Implementation Notes** — Buyers **cannot** trigger this (actor-type + `staff_can_moderate_rfq` gate). Resubmission after reject re-enters the submission gate (`submit_rfq`), never bypasses it (PATCH-D2-01 rule). The reject edge is Doc-2 §5.4 PATCH-D2-01 exactly — platform-moderation actor, reason `rfq_correction_required`; its audit carries `[ESC-RFQ-AUDIT]`. Repeated rejects feed buyer abuse scoring (Doc-3 §10.2) — an analytics effect, not part of this contract.

---

## §E4.6 — `rfq.cancel_rfq.v1` — Cancel RFQ

**1. Contract Metadata** — Contract ID `rfq.cancel_rfq.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (`rfqs`; cascades to `quotations`/`rfq_invitations`) · Actor **User** (buyer) · BC-1 (§E4).

**2. Request Schema** — `rfq_id : uuid (1, required)`; `expected_version_no : numeric (1, required)`; `cancellation_reason : text (1, required)`.

**3. Response Schema** — `rfq_id : uuid (1)`, `state : enum (1) = cancelled`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `cancellation_reason` | 1 SYNTAX | Doc-4A §9 | presence/type; reason non-empty | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_cancel_rfq` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer org owns RFQ | `NOT_FOUND` (collapse) |
| non-terminal state | 6 STATE | Doc-2 §5.4 | cancel legal from any active (non-terminal) state | `STATE` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_cancel_rfq`** (Doc-2 §7) · Scope = buyer controlling org · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **any active state** (`draft`, `pending_internal_approval`, `submitted`, `under_review`, `matching`, `vendors_notified`, `quotations_received`, `buyer_reviewing`, `shortlisted`) · Target **`cancelled`** (terminal) · Forbidden source: the four terminals (`closed_won`, `closed_lost`, `cancelled`, `expired`) → `STATE` · Concurrency: optimistic; **cascade in one transaction** — open `submitted` quotations → `expired` (Doc-2 §5.5), open invitations → `expired` (Doc-2 §3.4) (Pass-A PA-08).

**7. Audit Binding** — Action **Doc-2 §9 RFQ "cancel"** · Attribution User · Object scope `rfqs` (+ cascaded invitation `InvitationExpired` audit rows, Doc-2 §9) · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** — RFQ cancellation has **no Doc-2 §8 domain event** (H.7 non-event; verified absent) · Consumed none · Responded-vendor "cancelled by buyer" closure notification is Communication's (DE-6), triggered off the state change · Idempotency: replay → one terminal transition.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX, or missing reason | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | RFQ not owned (collapse) | false |
| `STATE` | RFQ already terminal | false |
| `CONFLICT` | concurrent terminal transition race | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required`; replay after cancel returns `cancelled` with no duplicate audit and no duplicate cascade; the terminal-state assertion makes a second cancel a `STATE` no-op (or idempotent same-result within the dedup window).

**11. Cross-Module References** — **Identity (DE-1):** context, `check_permission`. **Platform Core (DE-8):** audit-write. **Communication (DE-6):** responded-vendor closure notification (not authored here). **Operations (DE-4):** habitual post-quote cancellation feeds the buyer abuse score (Operations/analytics consumer; not authored here). Others: none.

**12. AI-Agent Implementation Notes** — Do **not** coin an `RFQCancelled` event (verified absent from Doc-2 §8). Terminal — never reopen; the recovery path is re-issue (`reissue_rfq`). The quotation/invitation expiry cascade is **state + audit only**, in the same transaction (PA-08) — no new event, no new audit action.

---

## §E4.7 — `rfq.reissue_rfq.v1` — Re-issue RFQ (from prior)

**1. Contract Metadata** — Contract ID `rfq.reissue_rfq.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (new `rfqs` + `rfq_versions`) · Actor **User** (buyer) · BC-1 (§E4).

**2. Request Schema** — `source_rfq_id : uuid (1, required)`; `overrides : jsonb (0..1, nullable)` (changed attributes vs the source); `routing_mode : enum<approved_only|approved_conditional|approved_open|open_market> (0..1, nullable)`.

**3. Response Schema** — `rfq_id : uuid (1)` (new), `human_ref : human_ref (1)`, `state : enum (1) = draft`, `reissued_from : uuid (1)` (= `source_rfq_id`), `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `source_rfq_id` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-org context | `AUTHORIZATION` |
| `can_create_rfq` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| source readable by active org | 4 SCOPE | Doc-4A §7.3 | source RFQ owned by active org | `NOT_FOUND` (collapse) |
| source reference | 7 REFERENCE | Doc-4A §4.5/§9.5 | `source_rfq_id` exists | `REFERENCE` |
| reissue-won block | 8 BUSINESS | Doc-3 §1.6; POLICY `rfq.reissue_won_block_days` | re-issue from `closed_won` for same scope blocked within window unless engagement cancelled | `BUSINESS` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_create_rfq`** (Doc-2 §7) · Scope = buyer controlling org · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source states: **n/a for the new RFQ** (creation) · Target **`draft`** (new RFQ, Doc-2 §5.4 entry) · **No transition on the source RFQ** — the source remains in its terminal state (Pass-A PA-17; Doc-3 §1.6: history is evidence) · Concurrency: new row; `human_ref` row-locked allocation.

**7. Audit Binding** — Action **Doc-2 §9 RFQ "create"** (the new RFQ); `reissued_from` recorded · Attribution User · Object scope new `rfqs` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`RFQCreated`** for the new RFQ (Doc-2 §8) · Consumed none · No event on the source · Idempotency: replay → one new RFQ.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | source not owned (collapse) | false |
| `REFERENCE` | `source_rfq_id` not found | false |
| `BUSINESS` | reissue-won block window | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required`; replay within the dedup window returns the same new `rfq_id` (no second RFQ); without an idempotency key, a re-issue produces a distinct new RFQ by design (re-issue is intentionally repeatable).

**11. Cross-Module References** — **Identity (DE-1):** context, `check_permission`. **Platform Core (DE-8):** `core.allocate_human_reference.v1`, audit-write, outbox-write, POLICY read. Others: none.

**12. AI-Agent Implementation Notes** — Re-issue is the **only** reopening mechanism (Doc-3 §1.6 FIXED) — **never transition a terminal RFQ back**; the source is read-only here and keeps its terminal state (PA-17). Record `reissued_from` for analytics.

---

## §E4.8 — `rfq.get_rfq.v1` · `rfq.list_rfqs.v1` · `rfq.get_rfq_version.v1` — RFQ Reads

**1. Contract Metadata** — Contract IDs `rfq.get_rfq.v1`, `rfq.list_rfqs.v1`, `rfq.get_rfq_version.v1` · Template **21.3 Query** · Owned aggregate **RFQ** (reads over `rfqs`/`rfq_versions`) · Actor **User** (buyer) / **internal-service** · BC-1 (§E4).

**2. Request Schema** — get: `rfq_id : uuid (1, required)` (+ `version_no : numeric (0..1)` for `get_rfq_version`); list: `filters : jsonb (0..1, allowlisted fields only — Doc-4A §9.6)`, `page : {cursor|offset, limit} (1, required)` (Doc-4A §22.3).

**3. Response Schema** — get: RFQ projection (`rfq_id`, `human_ref`, `state`, `current_version_no`, scope-appropriate version content), `reference_id`. list: `items : RFQ-projection[] (0..N)`, `page_info`, `reference_id`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id` / filter+page | 1 SYNTAX | Doc-4A §9/§9.6/§22.3 | presence/type; **allowlisted** filter/sort fields only | `VALIDATION` |
| actor + context | 2 CONTEXT | Doc-4A §5 | User (buyer) or internal-service | `AUTHORIZATION` |
| `can_view_rfq` / `can_view_all_rfqs` | 3 AUTHZ | Doc-2 §7 | own-RFQ scope vs all-org scope (two distinct slugs) | `AUTHORIZATION` |
| read scope | 4 SCOPE | Doc-4A §7.3; Doc-2 §6/§10.4 | buyer: own-RFQ or all-org per slug; **vendor-side read requires an `rfq_invitation_grantees` row** (post-distribution RLS anchor) | `NOT_FOUND` (collapse, §7.5) |
| reference (version) | 7 REFERENCE | Doc-4A §9.5 | `version_no` exists for the RFQ | `NOT_FOUND` |

**5. Authorization Matrix** — Actor **User** / **internal-service** · Slugs **`can_view_rfq`** (own-RFQ scope; all active members) / **`can_view_all_rfqs`** (all-org scope; O,D,M) — two distinct Doc-2 §7 slugs · Scope: buyer = own/all-org; vendor-side = `rfq_invitation_grantees` row only · Delegation: vendor-side grantee resolution consumes Identity org context (DE-1) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — None (read; no transition).

**7. Audit Binding** — **None** — reads are not audited (Doc-4A §17.1).

**8. Event Binding** — None (read).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | bad filter/sort (non-allowlisted), malformed page | false |
| `AUTHORIZATION` | actor/context/slug fail | false |
| `NOT_FOUND` | RFQ/version not visible to caller (no-access ≡ not-found, §7.5) | false |

**10. Idempotency Rules** — Reads are inherently idempotent and side-effect-free (no `Idempotency` header required; Doc-4A §14 applies to mutations).

**11. Cross-Module References** — **Identity (DE-1):** vendor-side org resolution for grantee checks, `check_permission`. Others: none (reads are RFQ-owned data only).

**12. AI-Agent Implementation Notes** — **There is no public RFQ board** (Doc-3 §5.1 FIXED) — vendor reads are grant-scoped to `rfq_invitation_grantees` only; never expose an RFQ list to un-invited vendors. No-access and not-found are **indistinguishable** (`NOT_FOUND` collapse, §7.5). Filter/sort fields are allowlisted (§9.6) — reject unknown fields at SYNTAX.

---

## §E4.9 — `rfq.expire_rfq.v1` — RFQ Expiry (validity clock / coverage-exhausted)

**1. Contract Metadata** — Contract ID `rfq.expire_rfq.v1` · Template **21.5 System** (`Response: none`) · Owned aggregate **RFQ** (`rfqs`; cascades to `quotations`/`rfq_invitations`) · Actor **System** (Phase-2 timer / pipeline bound) · BC-1 (§E4).

**2. Request Schema** — Internal trigger (no caller request body): `rfq_id : uuid` + `trigger : enum<validity_lapse|coverage_exhausted>` (dispatch selector, Pass-A PA-15). System contract — no external request schema.

**3. Response Schema** — **none** (Template 21.5 `Response: none`).

**4. Validation Matrix**

| Check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| trigger precondition | 6 STATE | Doc-2 §5.4 (+PATCH-D2-02) | validity-lapse: RFQ ∈ {`vendors_notified`,`quotations_received`,`buyer_reviewing`}; coverage-exhausted: RFQ ∈ {`matching`} with hold-bound elapsed | `STATE` (idempotent no-op if already terminal) |
| reason binding | 8 BUSINESS | Doc-3 §1.2/§1.4; PATCH-D3-05 | coverage-exhausted records reason `no_eligible_vendors_found` | — |

**5. Authorization Matrix** — Actor **System** (no org context) · No slug (system actor) · Enforcement: invoked only by the platform scheduler/pipeline (not a tenant-callable surface).

**6. State Machine Enforcement** — Allowed source: **`vendors_notified` / `quotations_received` / `buyer_reviewing`** (validity lapse) **or** **`matching`** (coverage exhausted) · Target **`expired`** (terminal) · Forbidden: all other states (incl. already-terminal) → idempotent no-op · Concurrency: **cascade in one transaction** — open `submitted` quotations → `expired` (Doc-2 §5.5), open invitations → `expired` (Doc-2 §3.4) (PA-08); idempotent re-fire.

**7. Audit Binding** — Action **Doc-2 §9 RFQ "expire (system actor)"** · Attribution **System** · Object scope `rfqs` (+ cascaded invitation `InvitationExpired` rows) · Timing same transaction · Source Doc-2 §9 + Doc-4B. **The `matching → expired` coverage-exhausted action carries `[ESC-RFQ-AUDIT]`** (interim: bind §9 "expire" by pointer; channel Doc-2 §9 additive; no action invented).

**8. Event Binding** — Emitted **none** (no Doc-2 §8 expiry event; state + audit only, H.7) · Consumed none · Buyer notification (honest, before/at expiry) is Communication's (DE-6) · Idempotency: re-fire safe (already-terminal → no-op, no duplicate audit).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `STATE` | RFQ not in an expirable source state (idempotent no-op) | n/a (system) |
| `DEPENDENCY` | Doc-4B audit/outbox transiently unavailable | true (scheduler retry) |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — Inherently idempotent (System, Doc-4A §14): a re-fire on an already-`expired` RFQ is a no-op with no duplicate audit and no duplicate cascade; the two triggers are mutually exclusive per the source state.

**11. Cross-Module References** — **Platform Core (DE-8):** audit-write, outbox (for nothing emitted, but the transaction discipline applies). **Communication (DE-6):** buyer expiry notification (not authored here). **(Coverage recovery** for the cell continues independently — Doc-3 §11.4 — not part of this contract.) Others: none.

**12. AI-Agent Implementation Notes** — Bound **exactly** to the two Doc-2 §5.4 system-actor edges (validity lapse + coverage-exhausted PATCH-D2-02); **no fake matching activity** ever shown (Doc-3 §1.2 FIXED). Two dispatch triggers, **one contract, no split** (PA-15). Idempotent re-fire. The coverage-exhausted action's audit carries `[ESC-RFQ-AUDIT]`.

---

## Part-1 Conformance Summary (BC-1 — 9 contracts)

| Contract | Template | Source states → target | Emitted events | Audit action (Doc-2 §9) | Carried marker |
|---|---|---|---|---|---|
| `rfq.create_rfq.v1` | 21.4 | — → `draft` | `RFQCreated` | RFQ "create" | DE-1/DE-2/DE-8 |
| `rfq.update_rfq.v1` | 21.4 | non-terminal → (same) | none | RFQ "edit (new version)" | DE-1/DE-6/DE-8 |
| `rfq.submit_rfq.v1` | 21.4 | `draft` → `submitted`/`pending_internal_approval` | `RFQSubmitted` (+`RFQApproved` self-approve) | RFQ "submit" | DE-1/DE-5/DE-8 |
| `rfq.approve_rfq.v1` / `reject_internal_rfq.v1` | 21.4 | `pending_internal_approval` → `submitted`/`draft` | `RFQApproved` (approve only) | RFQ "internal approve/reject" | DE-1/DE-8 |
| `rfq.moderate_rfq.v1` | 21.6 | `submitted`/`under_review` → `matching`/`draft` | none | RFQ "moderation pass/fail" | DE-5/DE-1/DE-8 · **`[ESC-RFQ-AUDIT]`** (reject edge) |
| `rfq.cancel_rfq.v1` | 21.4 | any active → `cancelled` | none | RFQ "cancel" | DE-1/DE-4/DE-6/DE-8 |
| `rfq.reissue_rfq.v1` | 21.4 | — → `draft` (new); source unchanged | `RFQCreated` | RFQ "create" | DE-1/DE-8 |
| `rfq.get_rfq.v1` / `list_rfqs.v1` / `get_rfq_version.v1` | 21.3 | — (read) | none | none (reads not audited) | DE-1 |
| `rfq.expire_rfq.v1` | 21.5 | `vendors_notified`/`quotations_received`/`buyer_reviewing`/`matching` → `expired` | none | RFQ "expire (system actor)" | DE-6/DE-8 · **`[ESC-RFQ-AUDIT]`** (coverage-exhausted) |

**Governance confirmation (Part 1).** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template was created or changed; all bindings are by pointer to `Doc-4E_PassA_v1.0_FROZEN` and the frozen corpus. Ownership and the procurement moat are preserved (RFQ owns the lifecycle; Marketplace vendor data is referenced read-only via DE-2 at `create_rfq`/reads). Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]` are referenced by name and unresolved. No corpus detail was absent; **no flag-and-halt triggered**.

---

*End of Doc-4E — RFQ Procurement Engine — Content v1.0, Pass-B (hardening), Part 1 of 5 — BC-1 RFQ Authoring & Lifecycle. The 9 §E4 contracts hardened to implementation grade (metadata · request/response schemas · validation matrix · authorization matrix · state-machine enforcement · audit binding · event binding · error register · idempotency · cross-module references · AI-agent notes), bound by pointer to Doc-4E_PassA_v1.0_FROZEN and the frozen corpus; nothing invented. Next: Part 2 — BC-2 Matching Pipeline Hardening.*
