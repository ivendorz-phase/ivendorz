# Doc-4E — RFQ Procurement Engine — Pass-B (Hardening) Part 4 v1.0 (FROZEN) — BC-4 Quotation Management

## BC-4 — Quotation Management Hardening (§E7)

| Field | Value |
|---|---|
| Document | Doc-4E — **Pass-B Part 4 v1.0 (FROZEN)** — final immutable Part-4 baseline — Module 3 RFQ Procurement Engine (`rfq` schema) |
| Part scope | **BC-4 — Quotation Management (§E7)** — the 5 contracts of `Doc-4E_PassA_v1.0_FROZEN` §E7, hardened to implementation grade |
| Status | **Part-4 FROZEN — final immutable baseline.** Consolidates `Doc-4E_Content_v1.0_PassB_Part4_QuotationManagement.md` as amended by `Doc-4E_PassB_Part4_Patch_v1.0.md`; certified by `Doc-4E_PassB_Part4_Freeze_Audit_v1.0.md`. Authorized next stage: **Doc-4E_PassB_Part5_v1.0** (BC-5+BC-6, final part). |
| Contract authority | `Doc-4E_PassA_v1.0_FROZEN.md` (sole contract authority; **not revisited, not redesigned, not reopened**) |
| Frozen precedents | `Doc-4E_Structure_v1.0_FROZEN`; `Doc-4E_PassB_Part1_v1.0_FROZEN`; `Doc-4E_PassB_Part2_v1.0_FROZEN`; `Doc-4E_PassB_Part3_v1.0_FROZEN` (Parts 1–3 frozen; not reopened) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1/2/3_v1.0_FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-1 RFQ Lifecycle (FROZEN) · Part 2 — BC-2 Matching Pipeline (FROZEN) · Part 3 — BC-3+BC-7 Routing & Governance (FROZEN) · **Part 4 — BC-4 Quotation Management** · Part 5 — BC-5+BC-6 Evaluation, Comparison, Award |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 4).** Convert the 5 Pass-A BC-4 contracts into **implementation-grade** contracts at the depth of Parts 1–3: field-level schemas, validation matrices on the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement, audit/event bindings, error registers (Doc-4A §12 closed class set), idempotency. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. **The quotation workflow rules are owned by Doc-3 §8 and the three-instrument quota identity by Doc-3 §4.1.1 — bound by pointer, never re-derived.** Carried dependencies **DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`, `[ESC-RFQ-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 4.

**Quota-window note (carried, consistent with Part-3 PB3-M2).** The quotation contracts that require idempotency dedup windows reference a window whose **authority is unresolved — carried as `[ESC-RFQ-POLICY]`**: **no `rfq.*` dedup-window POLICY key exists** in Doc-3 §12.2 (the `core.*_dedup_window` keys are Module-0 infrastructure, firewalled from RFQ use — Doc-3 §12.1 / Doc-4A §18.3). **No key/value invented**; dedup-window value implementation-blocked until resolved via the Doc-3 §12.2 additive channel. (The quotation-submission **quota** itself — `monthly_rfq_limit` — is a Billing entitlement, DE-7, distinct from the idempotency dedup window.)

**BC-4 character (templates).** Four **21.4 Command**: `submit_quotation`, `revise_quotation`, `withdraw_quotation`, `request_late_extension` (vendor-side; or representative via §6B delegation). One **21.3 Query** (bundled): `get_quotation`, `list_quotations_for_rfq`. **FIXED invariants binding every BC-4 contract:** one active quotation per vendor per RFQ (`partial UNIQUE(rfq_id, vendor_profile_id) WHERE state IN ('draft','submitted')`, Doc-2 §10.4); quotations bind to `rfq_version_id`, never the mutable head (Doc-2 §5.5); revisions never overwrite (new `quotation_version`, prior superseded — Doc-2 §5.5); the **three-instrument quota identity** — entitlement vs delivery vs quotation-submission quota, no single event consumes more than one (Doc-3 §4.1.1, PATCH-D3-01); quota consumed **only at submission**, attributed to the controlling org regardless of acting representative (Doc-2 §5.5 guard); no silent late acceptance / no private per-vendor windows (Doc-3 §8.5 FIXED); a formal decline is recorded on `rfq_invitations`, not as a quotation state (Doc-2 §5.5 guard — the decline contract is `respond_to_invitation`, Part 3); the governance-signal firewall — payment buys quota/volume, never matching/eligibility/fairness (Doc-4A §4B; Doc-3 §11.8/§12.1).

---

## §H — Part-4 Hardening Conventions (stated once; bound by pointer per contract)

Identical convention basis to Parts 1–3 §H (reference-never-restate, Doc-4A §0.3). Per-contract records reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage. All BC-4 commands are vendor-side (User actor, active vendor-org context) and **delegation-eligible** (§6B for representative orgs), so stage 5 DELEGATION is populated. The **quota check** is stage 9 POLICY → **`QUOTA`** error class (finite entitlement; `retryable:false` until quota state changes — Doc-4A §11.2 dual mapping).
- **H.2 — Field type vocabulary.** As Parts 1–3: `uuid`, `enum<…>`, `numeric`, `jsonb` (presence/shape boundary only — internal price/terms schema is dev-doc scope), `timestamptz`, `uuid[]` (cardinality stated). **Required/nullable/cardinality** + **source authority** per field.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check OR §6B delegation grant. Vendor-side slugs from Doc-2 §7: **`can_submit_quote`** (submit/revise), **`can_withdraw_quote`** (withdraw), **`can_respond_to_rfq`** (late-extension request, vendor side). Buyer late-extension approval uses the buyer authority on the RFQ (`can_create_rfq`). Scope = the quoting vendor's **controlling organization** (`controlling_organization_id` anchor, Doc-2 §10.4) or §6B grant. Enforcement Identity `check_permission`. **No slug invented.**
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`; codes `rfq_<domain>_<code>` (integer at dev-doc stage). Quota exhaustion → **`QUOTA`** (`retryable:false`); a second active quotation → **`CONFLICT`** (partial-unique violation); protected-fact failures → `NOT_FOUND` collapse (§7.5).
- **H.5 — State machine (Doc-2 §5.5 Quotation; Doc-4A §13).** The **Quotation lifecycle** `draft → submitted`; `submitted → submitted` (revise, new version); `submitted → withdrawn`; `submitted → selected`; `submitted → not_selected`; `submitted → expired`; `draft → discard` (soft-delete) is **owned by BC-4** — its transitions are enforced here, **except** `submitted → selected` (owned by `award_rfq`, Part 5/§E8), `submitted → not_selected` (owned by `close_lost_rfq`/award, Part 5), and `submitted → expired` (owned by `expire_rfq`/`cancel_rfq` cascade, Part 1) — those terminal transitions are **cross-referenced, not authored here**. BC-4 owns `draft → submitted`, `submitted → submitted` (revise), `submitted → withdrawn`, `draft → discard`. **No edge invented.**
- **H.6 — Audit (Doc-2 §9 Quotation domain via Doc-4B `core.append_audit_record.v1`).** BC-4 audit actions (Doc-2 §9 Quotation domain): **create, edit (new version), submit, withdraw** (select/reject are Part-5-owned). Attribution **User** (vendor; representative recorded against its org). Object scope the `quotations`/`quotation_versions` row. Timing same transaction as the state write. Reads not audited (§17.1). No audit action invented.
- **H.7 — Events (Doc-2 §8 RFQ catalog via Doc-4B outbox-write).** Emitted: **`QuotationSubmitted`** (submit), **`QuotationWithdrawn`** (withdraw) (Doc-2 §8). **`QuotationSelected`** is emitted by `award_rfq` (Part 5), not here. **Quotation revision has NO Doc-2 §8 event** (state + audit only — verified in Part 1 §E10 / Pass-A). Consumed: none in BC-4. `QuotationSubmitted` → comparison refresh (Part 5) + performance inputs (Trust) + usage-ledger (Billing) are **consumers' legs** (single-authorship; not authored here). **No event coined** (§16.4).
- **H.8 — Idempotency (Doc-4A §14).** Every BC-4 command carries `Idempotency: required` + a deduplication window whose **authority is `[ESC-RFQ-POLICY]`** (quota-window note above; no `rfq.*` key; no value invented). Replay within the (to-be-authorized) window → same result, no duplicate audit/event. Optimistic concurrency on `current_version_no` where versioned (`CONFLICT` on lost race). Queries side-effect-free.
- **H.9 — Field source (Doc-2 §10.4).** `quotations` (`human_ref QTN-…`, `state(§5.5)`, `current_version_no`, `vendor_profile_id`, `submitting_user_id`, `controlling_organization_id` (vendor-side RLS anchor + quota attribution); **partial UNIQUE(rfq_id, vendor_profile_id) WHERE state IN ('draft','submitted') AND deleted_at IS NULL**); `quotation_versions` (`version_no`, `rfq_version_id` (in-module FK binding to `rfq_versions`), `price_breakdown_jsonb`, `delivery_terms`, `warranty_terms`, `attachments_refs`, `revision_reason`, `supersedes_version_no`; immutable); `quotation_visibility` (`PK(quotation_id, grantee_organization_id)`; grant row). **Pass-B introduces no column.**
- **H.10 — Quota identity & firewall (Doc-3 §4.1.1/§11.8/§12.1; Doc-4A §4B; DE-7).** The **three-instrument identity** (Doc-3 §4.1.1, PATCH-D3-01): (1) lead **entitlement** (guarantee accounting), (2) lead **delivery** accounting (at invitation `delivered`), (3) **quotation-submission quota** (`monthly_rfq_limit`, consumed at submission). **No single event consumes more than one instrument.** Quota is a **Billing entitlement** (DE-7) — RFQ **reads** it (delivery ceiling) and consumes it at submission; the usage-ledger write is Billing's (consumer of `QuotationSubmitted`). **Payment buys quota/volume, never matching/eligibility/fairness/confidence** (§4B). The non-disclosure invariant binds quotation reads (buyer-private columns never vendor-exposed; cross-vendor quotes never exposed pre-close).

---

## §E7.1 — `rfq.submit_quotation.v1` — Submit Quotation

**1. Contract Metadata** — Contract ID `rfq.submit_quotation.v1` · Template **21.4 Command** · Owned aggregate **Quotation** (`quotations` + `quotation_versions`) · Actor **User** (vendor controlling org; or representative via §6B delegation grant) · Bounded context **BC-4** (§E7).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `invitation_id` | `uuid` | yes | no | 1 | Doc-3 §8.1 (a delivered invitation is the precondition); Doc-2 §10.4 |
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 (`quotations → rfqs`) |
| `rfq_version_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 (`quotation_versions.rfq_version_id` binding); Doc-3 §8.1 (priced against current version) |
| `price_breakdown` | `jsonb` | yes | no | 1 | Doc-2 §10.4 `price_breakdown_jsonb` (internal schema = dev-doc) |
| `delivery_terms` | `jsonb` | yes | no | 1 | Doc-2 §10.4 `delivery_terms` |
| `warranty_terms` | `jsonb` | no | yes | 0..1 | Doc-2 §10.4 `warranty_terms` |
| `spec_compliance_declaration` | `jsonb` | yes | no | 1 | Doc-3 §8.1 (spec-compliance per attached spec revision) |
| `attachments_refs` | `uuid[]` | no | yes | 0..N | Doc-2 §10.4 `attachments_refs` |

**3. Response Schema** — `quotation_id : uuid (1)`, `human_ref : human_ref (1, "QTN-…")`, `version_no : numeric (1)`, `state : enum (1) = submitted`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields | 1 SYNTAX | Doc-4A §9 | presence/type; completeness floor (price, validity, delivery, spec-compliance) | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; vendor active-org context | `AUTHORIZATION` |
| `can_submit_quote` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| controlling-org scope | 4 SCOPE | Doc-4A §7.3; Doc-2 §10.4 | scope = quoting vendor's `controlling_organization_id` | `NOT_FOUND` (collapse, §7.5) |
| delegation (representative) | 5 DELEGATION | Doc-4A §6B | §6B five-condition grant for a representative org | `AUTHORIZATION` |
| RFQ quotable + invitation delivered | 6 STATE | Doc-2 §3.4/§5.4; Doc-3 §8.1 | a `delivered` invitation grantee row; RFQ ∈ {`vendors_notified`,`quotations_received`,`buyer_reviewing`} pre-window-close; one-active-per-vendor (partial UNIQUE) | `STATE` / `CONFLICT` (second active quote) |
| `invitation_id` resolves | 7 REFERENCE | Doc-4A §4.5/§9.5; Doc-2 §10.4 (RFQ Invitation aggregate) | `invitation_id` MUST resolve to an existing `rfq_invitations` record for the (RFQ, vendor) | `NOT_FOUND` (protected-fact collapse, §7.5) |
| version binding | 7 REFERENCE | Doc-2 §5.5; Doc-3 §8.1 | priced against the **current** `rfq_version_id`; a quote opened against an older version forces re-confirm | `REFERENCE` (stale version) |
| completeness floor | 8 BUSINESS | Doc-3 §8.1 | floor blocks only the truly empty (Quote Quality scored, not gated) | `BUSINESS` |
| quotation-submission quota | 9 POLICY | Doc-3 §4.1.1; DE-7 | controlling-org quota available (`monthly_rfq_limit`); **finite entitlement** | `QUOTA` (`retryable:false`) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_submit_quote`** (Doc-2 §7) · Scope = vendor controlling org (`controlling_organization_id`) · Delegation **eligible** — representative via §6B grant · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`draft`** (or first submit creating the quotation) · Target **`submitted`** (Doc-2 §5.5) · **RFQ-head transition owned by this contract:** when the submitted quotation is the **first** for the RFQ and the RFQ is in `vendors_notified`, `rfq.submit_quotation.v1` drives **`vendors_notified → quotations_received`** (Doc-2 §5.4) **within the same transaction** as the quotation write + `QuotationSubmitted` outbox insert (Doc-4A §16 / Doc-2 §10.11.4; bound to Pass-A §E7). This edge is **owned by `submit_quotation.v1`** (not Part 1). · Forbidden: submitting against an already-`submitted`/terminal quotation → `STATE`/`CONFLICT` · Concurrency: **partial `UNIQUE(rfq_id, vendor_profile_id) WHERE state IN ('draft','submitted')`** enforces one active quotation per vendor (Doc-2 §10.4); the invitation advances `→ accepted` on submit (Doc-3 §8.1); a second representative attempting a parallel quote is shown the existing draft/quote (replace/revise/withdraw), conflict surfaced inside the vendor's own house, never to the buyer (Doc-3 §2.8). **No edge invented** (the `vendors_notified → quotations_received` edge is the existing Doc-2 §5.4 edge; only its owning contract is fixed here).

**7. Audit Binding** — Action **Doc-2 §9 Quotation "submit"** (and "create" on first version) · Attribution **User** (vendor; representative recorded against its org) · Object scope `quotations` + `quotation_versions` row · Timing same transaction as the state write + outbox insert + quota consumption signal · Source Doc-2 §9 + Doc-4B. *(The quota-ledger entry itself is Billing's write — see Cross-Module; not an RFQ audit action — Pass-A PA-19.)*

**8. Event Binding** — Emitted **`QuotationSubmitted`** (Doc-2 §8) via Doc-4B outbox-write, same transaction · Consumed none · Trigger: successful submit · Idempotency: replay → one quotation/version, one `QuotationSubmitted`. Primary consumers (Doc-2 §8): comparison refresh (Part 5), Trust performance inputs, Billing usage-ledger — consumers' legs, not authored here.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / completeness floor empty | false |
| `AUTHORIZATION` | context/slug/delegation fail | false |
| `NOT_FOUND` | not the controlling org / no grantee (collapse, §7.5) | false |
| `STATE` | RFQ not quotable / window closed / invitation not delivered | false |
| `CONFLICT` | second active quotation (partial-unique violation) | false (resolve via existing draft) |
| `REFERENCE` | priced against a stale `rfq_version_id` | false (re-confirm against current) |
| `QUOTA` | quotation-submission quota exhausted | false (until quota changes) |
| `DEPENDENCY` | Billing quota read or Doc-4B unavailable | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-RFQ-POLICY]`** — H.8); replay → same `quotation_id`/version, no duplicate `QuotationSubmitted`/audit, **quota consumed once** (replay does not double-consume). Concurrent duplicate submits resolve to one via the partial-unique index (loser → `CONFLICT`).

**11. Cross-Module References** — **Identity (DE-1):** active-org context, `check_permission`, §6B delegation grant. **Billing (DE-7):** **read** quotation-submission quota at the precondition (delivery ceiling) and consume it at submission; **the usage-ledger entry on the controlling org is a Billing-owned write driven by Billing's consumption of `QuotationSubmitted`** (`usage_ledger.source = rfq_response`, Doc-2 §10.8) — RFQ emits the event, Billing records the ledger (single-authorship; Pass-A PA-19). **Platform Core (DE-8):** `core.allocate_human_reference.v1` (`QTN-…`), audit-write, outbox-write. **Firewall:** quota is a submission gate, never a matching input; payment never affects matching (§4B). Trust/Marketplace/Communication: consumers' legs only.

**12. AI-Agent Implementation Notes** — **Quota consumed only at submission** (Doc-3 §4.1.1 FIXED — never at delivery, never the entitlement); **one event = one instrument**. Bind to the **current** `rfq_version_id` (never the mutable head, Doc-2 §5.5) — stale-version submit forces re-confirm. **One active quotation per vendor** (partial UNIQUE, Doc-2 §10.4) — a second representative sees replace/revise/withdraw, never a parallel quote (Doc-3 §2.8). The usage-ledger write is **Billing's** (consumer of `QuotationSubmitted`) — RFQ does not write it (PA-19). Completeness floor blocks only the truly empty; quote quality is **scored**, not gated.

---

## §E7.2 — `rfq.revise_quotation.v1` — Revise Quotation

**1. Contract Metadata** — Contract ID `rfq.revise_quotation.v1` · Template **21.4 Command** · Owned aggregate **Quotation** (`quotations` + `quotation_versions` append) · Actor **User** (vendor controlling org; or representative via §6B grant) · Bounded context **BC-4** (§E7).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `quotation_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 |
| `expected_version_no` | `numeric` | yes | no | 1 | optimistic concurrency (H.8) |
| `rfq_version_id` | `uuid` | yes | no | 1 | Doc-2 §5.5 (priced against current RFQ version) |
| `changed_terms` | `jsonb` | yes | no | 1 | Doc-2 §10.4 (price/delivery/warranty subset) |
| `revision_reason` | `text` | yes | no | 1 | Doc-2 §10.4 `revision_reason` |

**3. Response Schema** — `quotation_id : uuid (1)`, `new_version_no : numeric (1)`, `supersedes_version_no : numeric (1)`, `state : enum (1) = submitted`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `quotation_id`, `expected_version_no`, `revision_reason` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; vendor active-org | `AUTHORIZATION` |
| `can_submit_quote` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| controlling-org scope | 4 SCOPE | Doc-4A §7.3 | scope = controlling org | `NOT_FOUND` (collapse) |
| delegation | 5 DELEGATION | Doc-4A §6B | §6B grant for representative | `AUTHORIZATION` |
| quotation `submitted`, pre-award, window open | 6 STATE | Doc-2 §5.5; Doc-3 §8.2 | revise legal only while `submitted` + RFQ pre-award + window open | `STATE` |
| version match | 6 STATE / concurrency | Doc-4A §14 | `expected_version_no` = `current_version_no` | `CONFLICT` |
| version binding | 7 REFERENCE | Doc-2 §5.5 | priced against current `rfq_version_id` | `REFERENCE` |
| revision soft-cap | 9 POLICY | Doc-3 §8.2; POLICY `quote.max_revisions` | beyond cap requires clarification-thread justification | `BUSINESS` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_submit_quote`** (Doc-2 §7) · Scope = controlling org · Delegation **eligible** (§6B) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`submitted`** · Target **`submitted`** (new `quotation_version`; prior **superseded**, never overwritten — Doc-2 §5.5) · Forbidden: revising a terminal/withdrawn quotation, or after window close (except buyer best-and-final / buyer window-reopen — Doc-3 §8.2/§8.5) → `STATE` · Concurrency: optimistic on `current_version_no`; lost race → `CONFLICT`; append `version_no+1` with `supersedes_version_no`. **No edge invented.**

**7. Audit Binding** — Action **Doc-2 §9 Quotation "edit (new version)"** · Attribution **User** · Object scope `quotations` + new `quotation_versions` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** — quotation revision has **no Doc-2 §8 domain event** (H.7 non-event; verified) · Consumed none · Comparison refresh + buyer diff notification are downstream effects (Part 5 comparison + Communication DE-6) · Idempotency: replay → one new version, no duplicate.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / missing reason | false |
| `AUTHORIZATION` | context/slug/delegation fail | false |
| `NOT_FOUND` | not controlling org (collapse) | false |
| `STATE` | not `submitted` / awarded / window closed | false |
| `CONFLICT` | `expected_version_no` ≠ current (lost race) | true (re-read then retry) |
| `REFERENCE` | stale `rfq_version_id` | false |
| `BUSINESS` | revision soft-cap exceeded without justification | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-RFQ-POLICY]`**); the `expected_version_no` assertion makes replays safe (a replayed revise that already applied returns the same `new_version_no`; a stale version → `CONFLICT`). No duplicate version/audit on replay. **No event to dedup** (revision is event-free).

**11. Cross-Module References** — **Identity (DE-1):** context, `check_permission`, §6B delegation. **Communication (DE-6):** buyer diff notification (consumer leg, not authored here). **Platform Core (DE-8):** audit-write. Billing: **none** (revision does not consume quota — quota is submission-only, Doc-3 §4.1.1). Others: none.

**12. AI-Agent Implementation Notes** — **Never overwrite** a prior version (Doc-2 §5.5; Doc-3 §8.2) — always append `version_no+1` with `supersedes_version_no`. **Revision consumes no quota** (quota is submission-only — Doc-3 §4.1.1). Do **not** coin a quotation-revision event (verified absent from Doc-2 §8). After window close, revision is locked except buyer best-and-final or buyer window-reopen (Doc-3 §8.2/§8.5 — **no private windows**). Use `expected_version_no` for optimistic concurrency.

---

## §E7.3 — `rfq.withdraw_quotation.v1` — Withdraw Quotation

**1. Contract Metadata** — Contract ID `rfq.withdraw_quotation.v1` · Template **21.4 Command** · Owned aggregate **Quotation** (`quotations`) · Actor **User** (vendor controlling org; or representative via §6B delegation) · Bounded context **BC-4** (§E7).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `quotation_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 `quotations` |
| `expected_version_no` | `numeric` | yes | no | 1 | Doc-4A §14 (optimistic concurrency) |
| `withdrawal_reason` | `text` | yes | no | 1 | Doc-3 §8.3 (reason-coded withdrawal) |

**3. Response Schema** — `quotation_id : uuid (1)`, `state : enum (1) = withdrawn`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `quotation_id`, `expected_version_no`, `withdrawal_reason` | 1 SYNTAX | Doc-4A §9 | presence/type; reason non-empty | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; vendor active-org context | `AUTHORIZATION` |
| `can_withdraw_quote` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| controlling-org scope | 4 SCOPE | Doc-4A §7.3/§7.5; Doc-2 §10.4 | scope = quoting vendor's `controlling_organization_id` (vendor isolation) | `NOT_FOUND` (collapse, §7.5) |
| delegation (representative) | 5 DELEGATION | Doc-4A §6B | §6B five-condition grant | `AUTHORIZATION` |
| state = `submitted`, pre-award | 6 STATE | Doc-2 §5.5; Doc-3 §8.3 | withdraw legal only from `submitted`, pre-award | `STATE` |
| version match | 6 STATE / concurrency | Doc-4A §14 | `expected_version_no` = `current_version_no` | `CONFLICT` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_withdraw_quote`** (Doc-2 §7) · Scope = vendor controlling org · Delegation **eligible** (§6B) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`submitted`** · Target **`withdrawn`** (Doc-2 §5.5; terminal for that quotation) · Forbidden: all other states → `STATE` (cannot withdraw a `selected`/`not_selected`/`expired`/`withdrawn` quotation) · Concurrency: optimistic on `current_version_no`; the active-capacity slot frees on withdraw → triggers `drain_deferred_queue` (Part 3, §E6.3). **No edge invented.**

**7. Audit Binding** — Action **Doc-2 §9 Quotation "withdraw"** · Attribution **User** (representative recorded against its org, Doc-3 §2.8) · Object scope `quotations` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`QuotationWithdrawn`** (Doc-2 §8) via Doc-4B outbox-write · Consumed none · Trigger: vendor withdraws pre-award · Idempotency: replay → same `withdrawn` state, at most one `QuotationWithdrawn`. Withdrawal-after-shortlist → buyer alert + optional replenishment (Communication/routing consumer legs, DE-6/Part 3 — not authored here).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / missing reason | false |
| `AUTHORIZATION` | context/slug/delegation fail | false |
| `NOT_FOUND` | quotation not owned by actor's org (collapse, §7.5) | false |
| `STATE` | not `submitted` / already terminal | false |
| `CONFLICT` | version race | true (re-read then retry) |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-RFQ-POLICY]`** — H.8); replay after withdraw returns `withdrawn` with no duplicate audit/event; the state assertion makes a second withdraw a `STATE` no-op. The response still **counts as a response** (the vendor engaged — Doc-3 §8.3); habitual late withdrawal (after `buyer_reviewing`) carries a Quote-Quality discount (analytics effect, not a state concern).

**11. Cross-Module References** — **Identity (DE-1):** context, `check_permission`, §6B delegation. **Communication (DE-6):** withdrawal-after-shortlist buyer alert (consumer leg). **Platform Core (DE-8):** audit-write, outbox-write. A withdraw frees a capacity slot → internal `drain_deferred_queue` trigger (Part 3). Billing: none. Others: none.

**12. AI-Agent Implementation Notes** — Withdraw is **pre-award only** (Doc-3 §8.3); the slot frees immediately on withdraw (→ deferred-queue drain, Part 3). The withdrawal **counts as a response** — never penalize it as a non-response. Vendor isolation: scope strictly to the quoting `controlling_organization_id` (§7.5 collapse). Use `expected_version_no` for concurrency.

---

## §E7.4 — `rfq.request_late_extension.v1` — Late-Quote Extension Request

**1. Contract Metadata** — Contract ID `rfq.request_late_extension.v1` · Template **21.4 Command** · Owned aggregate **RFQ / Quotation window** (reopens the RFQ quotation window; affects `quotations` quotability) · Actor **User** (vendor requests → buyer one-tap approves) · Bounded context **BC-4** (§E7).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 |
| `invitation_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 (the late vendor's invitation) |
| `buyer_decision` | `enum<approve\|deny>` | no | yes | 0..1 | Doc-3 §8.5. **Two-step flow:** **Phase 1 — Vendor Request:** late vendor invokes with `rfq_id`+`invitation_id`, `buyer_decision` **null** — records the request only; no window change. **Phase 2 — Buyer Approval/Denial:** RFQ-owning buyer invokes with `buyer_decision = approve\|deny` — `approve` reopens the window for **all** un-responded invitees, `deny` closes with no change. `buyer_decision` **required Phase 2, null Phase 1**. Actors: vendor (`can_respond_to_rfq`, grantee) Phase 1; buyer (`can_create_rfq`, RFQ owner) Phase 2. |

**3. Response Schema** — `rfq_id : uuid (1)`, `window_state : enum<reopened\|denied> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `invitation_id` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + context | 2 CONTEXT | Doc-4A §5.3 | vendor requests (active-org); buyer approves (RFQ owner) | `AUTHORIZATION` |
| AUTHZ (two roles) | 3 AUTHZ | Doc-2 §7 | vendor `can_respond_to_rfq` to request; buyer `can_create_rfq` (RFQ-owner authority) to approve | `AUTHORIZATION` |
| scope | 4 SCOPE | Doc-4A §7.3 | vendor: grantee row for the invitation; buyer: owns the RFQ | `NOT_FOUND` (collapse) |
| delegation (representative) | 5 DELEGATION | Doc-4A §6B | §6B grant for representative request | `AUTHORIZATION` |
| state = window closed | 6 STATE | Doc-2 §5.4; Doc-3 §8.5 | window closed (extension only meaningful post-close); RFQ pre-award | `STATE` |
| reference | 7 REFERENCE | Doc-4A §9.5 | `invitation_id` resolves to a `rfq_invitations` record for the RFQ | `NOT_FOUND` |
| extension bound | 9 POLICY | Doc-3 §12.2 `quote.late_extension_max_days` | extension within the POLICY max | `BUSINESS` |

**5. Authorization Matrix** — Actors **User (vendor)** → **User (buyer)** · Slugs **`can_respond_to_rfq`** (vendor request) / **`can_create_rfq`** (buyer approval — RFQ-owner authority; Doc-2 §7) · Scope: vendor = invitation grantee; buyer = RFQ controlling org · Delegation **eligible** (vendor request via §6B) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — No RFQ-head terminal change · On buyer approve, **the quotation window reopens for ALL un-responded invitees** (Doc-3 §8.5 FIXED — no per-vendor private window); if the buyer already shortlisted, late entry requires explicit buyer action + re-notification of shortlisted (Doc-3 §8.5) · Forbidden: silent late acceptance; per-vendor private windows · Concurrency: a single window-reopen per approval; idempotent. **No edge invented** (window reopen is an operational property of the RFQ quotation window, not a §5.4 state edge).

**7. Audit Binding** — Action **Doc-2 §9 RFQ "edit (new version)"** (window change audited via Doc-4B) where the reopen alters the RFQ window; routing-run telemetry as applicable · Attribution **User** (buyer for the approval) · Object scope `rfqs` (window) · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none new** (re-notification of un-responded invitees is dispatched via the routing/Communication path — DE-6, not authored here) · Consumed none · Trigger: late vendor requests → buyer approves · Idempotency: replay → same `window_state`, no duplicate reopen.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX | false |
| `AUTHORIZATION` | vendor/buyer role/scope/delegation fail | false |
| `NOT_FOUND` | invitation/RFQ not visible (collapse) | false |
| `STATE` | window still open / RFQ awarded | false |
| `BUSINESS` | extension beyond `quote.late_extension_max_days` | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-RFQ-POLICY]`** — H.8); a replayed approval reopens the window once (idempotent); a second identical request returns the same `window_state`. **No silent late acceptance, no private per-vendor windows** (Doc-3 §8.5 FIXED) — reopening always applies to all un-responded invitees.

**11. Cross-Module References** — **Identity (DE-1):** vendor + buyer `check_permission`, §6B delegation. **Communication (DE-6):** re-notify all un-responded invitees on reopen (consumer leg). **Platform Core (DE-8):** audit-write, POLICY read (`quote.late_extension_max_days`). Others: none.

**12. AI-Agent Implementation Notes** — **No silent late acceptance; no per-vendor private windows** (Doc-3 §8.5 FIXED) — a buyer extension reopens the window for **all** un-responded invitees; fairness here is cheap to enforce and corrupting to lose. If the buyer already shortlisted, late entry requires explicit buyer action + re-notification of shortlisted. The window reopen is an operational window property, not a §5.4 state edge.

---

## §E7.5 — `rfq.get_quotation.v1` · `rfq.list_quotations_for_rfq.v1` — Quotation Reads

**1. Contract Metadata** — Contract IDs `rfq.get_quotation.v1`, `rfq.list_quotations_for_rfq.v1` · Template **21.3 Query** · Owned aggregate **Quotation** (reads over `quotations`/`quotation_versions`, gated by `quotation_visibility`) · Actor **User** (vendor controlling org / representative; buyer via visibility grant) · Bounded context **BC-4** (§E7).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `quotation_id` | `uuid` | yes (get) | no | 1 | Doc-2 §10.4 `quotations` |
| `rfq_id` | `uuid` | yes (list) | no | 1 | Doc-2 §10.4 (buyer list of quotations on own RFQ) |
| `filters` | `jsonb` | no | yes | 0..1 | Doc-4A §9.6 (allowlisted fields only) |
| `page` | `{cursor\|offset, limit}` | no | no | 1 | Doc-4A §22.3 |

**3. Response Schema**

| Field | Type | Cardinality | Source authority |
|---|---|---|---|
| `quotation` / `items` | `quotation_projection` (`state`, `current_version_no`, version terms per scope) | 1 / 0..N | Doc-2 §10.4 |
| *(sealed-cell note)* | when `abuse.sealed_until_close = true` for the RFQ's cell and the window is **open**, the **buyer-facing** projection **omits** price breakdowns and protected commercial terms (Doc-3 §10.1); the vendor's own read is unaffected | — | Doc-3 §10.1; §12.2 |
| `page_info` | `jsonb` | 1 | Doc-4A §22.3 |
| `reference_id` | `uuid` | 1 | Doc-4A §22.1 |

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `quotation_id`/`rfq_id`/`filters`/`page` | 1 SYNTAX | Doc-4A §9/§9.6/§22.3 | presence/type; **allowlisted** filter/sort fields only | `VALIDATION` |
| actor + context | 2 CONTEXT | Doc-4A §5.3 | User (vendor or buyer) | `AUTHORIZATION` |
| read authority | 3 AUTHZ | Doc-2 §7 | vendor: own quotation (controlling org); buyer: `can_view_rfq`/`can_view_all_rfqs` on the RFQ | `AUTHORIZATION` |
| visibility scope | 4 SCOPE | Doc-4A §7.5; Doc-2 §10.4 | vendor = `controlling_organization_id` (+ representatives via grantee/visibility); buyer = `quotation_visibility` grant; **vendor isolation** | `NOT_FOUND` (collapse, §7.5) |
| delegation (representative) | 5 DELEGATION | Doc-4A §6B | §6B grant for representative read | `AUTHORIZATION` |
| reference | 7 REFERENCE | Doc-4A §9.5 | `quotation_id`/`rfq_id` exists + visible | `NOT_FOUND` |
| sealed-until-close (buyer reads) | 9 POLICY | Doc-3 §10.1; §12.2 `abuse.sealed_until_close` (per cell) | when `abuse.sealed_until_close = true` for the RFQ's cell, **buyer** quotation reads MUST NOT expose price breakdowns or protected commercial terms before quotation-window close | `BUSINESS` (sealed fields redacted from the projection; an explicit demand for sealed fields pre-close → `BUSINESS`) |

**5. Authorization Matrix** — Actor **User** (vendor / buyer) · Slugs: vendor reads own (controlling-org scope, no extra slug beyond active membership); buyer reads via **`can_view_rfq`** / **`can_view_all_rfqs`** (Doc-2 §7) gated by `quotation_visibility` · Scope: vendor = controlling-org anchor (+ representatives); buyer = `quotation_visibility` row · Delegation **eligible** (§6B representative read) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — None (read; no transition).

**7. Audit Binding** — **None** — reads are not audited (Doc-4A §17.1).

**8. Event Binding** — None (read).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | non-allowlisted filter/sort; malformed page | false |
| `AUTHORIZATION` | actor/slug/delegation fail | false |
| `NOT_FOUND` | quotation/RFQ not visible to caller (no-access ≡ not-found, §7.5 — vendor isolation) | false |

**10. Idempotency Rules** — Reads are inherently idempotent and side-effect-free (no `Idempotency` header; Doc-4A §14 applies to mutations only).

**11. Cross-Module References** — **Identity (DE-1):** controlling-org / representative resolution, `check_permission`, §6B delegation. Others: none (reads are RFQ-owned quotation data only).

**12. AI-Agent Implementation Notes** — **Vendor isolation is absolute:** a vendor reads only its own quotation (`controlling_organization_id` anchor + grantee/visibility); a buyer reads only via `quotation_visibility`; **no vendor ever sees another vendor's quotation** and no-access ≡ not-found (§7.5). One vendor = one active quotation regardless of representative count (Doc-3 §2.8). Filter/sort fields allowlisted (§9.6). **Sealed-until-close:** when `abuse.sealed_until_close = true` for the RFQ's cell (POLICY per cell — Doc-3 §12.2; behavior §10.1), the **buyer-facing** projection MUST withhold price breakdowns and protected commercial terms **until window close** (anti-farming). Read-projection redaction, not a new state or visibility change; vendor's own read unaffected; **bind POLICY by key, never hardcode**.

---

## Part-4 Conformance Summary (BC-4 — 5 contracts)

| Contract | Template | Quotation transition | Emitted | Audit action (Doc-2 §9) | Carried marker |
|---|---|---|---|---|---|
| `rfq.submit_quotation.v1` | 21.4 Command | `draft → submitted`; **owns `vendors_notified → quotations_received`** on first quotation (Doc-2 §5.4; same transaction) | `QuotationSubmitted` | Quotation "submit" | DE-1/DE-7/DE-8 · `[ESC-RFQ-POLICY]` (dedup) |
| `rfq.revise_quotation.v1` | 21.4 Command | `submitted → submitted` (new version) | none (non-event) | Quotation "edit (new version)" | DE-1/DE-6/DE-8 · `[ESC-RFQ-POLICY]` |
| `rfq.withdraw_quotation.v1` | 21.4 Command | `submitted → withdrawn` | `QuotationWithdrawn` | Quotation "withdraw" | DE-1/DE-6/DE-8 · `[ESC-RFQ-POLICY]` |
| `rfq.request_late_extension.v1` | 21.4 Command | none (window reopen; not a §5.5 edge) | none | RFQ "edit (new version)" (window) | DE-1/DE-6/DE-8 · `[ESC-RFQ-POLICY]` |
| `rfq.get_quotation.v1` / `list_quotations_for_rfq.v1` | 21.3 Query | none (read) | none | none (reads not audited) | DE-1 |

**Cross-part transitions referenced, not owned (Doc-2 §5.5):** `submitted → selected` (award — BC-6/Part 5), `submitted → not_selected` (close-without-selection — BC-6/Part 5), `submitted → expired` (RFQ cancel/expire cascade — BC-1/Part 1, FROZEN). BC-4 owns submit/revise/withdraw/discard/reads only.

**Governance confirmation (Part 4).** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template was created or changed; all bindings are by pointer to `Doc-4E_PassA_v1.0_FROZEN` and the frozen corpus. **Quotation behavior is Doc-3 §8 (+ §4.1.1) and the Doc-2 §5.5 machine, bound by pointer — not re-derived.** Quotation ownership, visibility, confidentiality, and **vendor isolation** are preserved (controlling-org anchor + `quotation_visibility`; one active quote per vendor; no vendor sees another's quote). Revision never overwrites (immutable versions); withdrawal is pre-award and counts as a response; late-submission governance is FIXED (no silent acceptance, no private windows). The quota firewall holds (submission-only consumption; payment never influences matching/selection — §4B). Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`, `[ESC-RFQ-SLUG]` referenced by name and unresolved (`[ESC-RFQ-POLICY]` actively carried for the dedup-window authority, consistent with Part 3 PB3-M2). No corpus detail was absent; **no flag-and-halt triggered**.

---

*End of Doc-4E — RFQ Procurement Engine — Pass-B (Hardening) Part 4 v1.0 (FROZEN) — BC-4 Quotation Management. Final immutable Part-4 baseline (PB4-MA1/MA2/M1/M2 integrated; PB4-N1/N2 not applied; certified by Doc-4E_PassB_Part4_Freeze_Audit_v1.0). The 5 §E7 contracts hardened to implementation grade (metadata · request/response schemas · validation matrix · authorization matrix · state-machine enforcement · audit binding · event binding · error register · idempotency · cross-module references · AI-agent notes), bound by pointer to Doc-4E_PassA_v1.0_FROZEN and the frozen corpus; quotation behavior bound to Doc-3 §8/§4.1.1 + Doc-2 §5.5, never re-derived; vendor isolation and the quota firewall preserved; nothing invented. Next: Part 5 — BC-5 + BC-6 Evaluation, Comparison & Award Hardening (final Pass-B part).*
