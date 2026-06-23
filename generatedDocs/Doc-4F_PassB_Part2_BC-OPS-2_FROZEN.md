# Doc-4F — Business Operations Engine — Pass-B (Hardening) Part 2 v1.0 (FROZEN) — BC-OPS-2 Engagement & Commercial Documents

## BC-OPS-2 — Procurement Engagements & Commercial Documents (§F5) — FROZEN

| Field | Value |
|---|---|
| Document | Doc-4F — **Pass-B Part 2 v1.0 (FROZEN)** — final immutable Part-2 baseline — Module 4 Business Operations Engine (`operations` schema, `ops_` namespace) |
| Part scope | **BC-OPS-2 — Engagement & Commercial Documents (§F5)** — the Pass-A §F5 contracts (Procurement Engagement aggregate), hardened to implementation grade. The **only** Operations context that emits domain events. |
| Status | **Pass-B Part 2 FROZEN — sole authoritative BC-OPS-2 Pass-B artifact.** Consolidates `Doc-4F_PassB_Part2_BC-OPS-2_Procurement_Engagements_v1.0` as amended by `Doc-4F_PassB_Part2_Patch_v1.0` (P-01…P-04 applied); certified by `Doc-4F_PassB_Part2_Freeze_Audit_v1.0` (APPROVE FOR BC-OPS-2 FREEZE). Authorized next stage: **Doc-4F_PassB_Part3 (BC-OPS-3 Vendor Lead Pipeline)**. |
| Contract authority | `Doc-4F_Content_v1.0_PassA_FROZEN.md` §F5 (sole contract authority; not revisited, not redesigned, not reopened) |
| Structure authority | `Doc-4F_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F_Structure_v1.0_FROZEN, Doc-4F_Content_v1.0_PassA_FROZEN, Doc-4F_PassB_Part1_BC-OPS-1_FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-OPS-1 Buyer Private CRM (FROZEN) · **Part 2 — BC-OPS-2 Engagement & Commercial Documents (FROZEN)** · Part 3 — BC-OPS-3 Vendor Lead Pipeline · Part 4 — BC-OPS-4 Document Generation & Templates · Part 5 — BC-OPS-5 Finance Records |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Frozen scope.** BC-OPS-2 (`operations` schema) hardens the Pass-A §F5 contracts to implementation grade: field-level request/response schemas, per-field validation matrices on the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement, audit bindings, event bindings (the five performance-input events + the `RFQClosedWon` consumer), error registers (Doc-4A §12 closed class set), idempotency rules. **No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template created or changed** — ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §F5. The **post-award seam** is load-bearing: Operations executes the relationship after the RFQ award; it owns **no** RFQ/quotation/matching/award (DF-3), **no** vendor data (DF-2), **no** trust/performance score (DF-4 — emits performance *inputs* only); `trade_invoices`/`payment_records` ≠ Billing platform invoices and hold no funds (DF-6); document bodies reference BC-OPS-4 templates with no ownership overlap. Carried dependencies **DF-1, DF-2, DF-3, DF-4, DF-6, DF-7, DF-8** and the markers **`[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]`** travel unchanged. **Unresolved corpus escalations carried unchanged to Doc-2 §8 (event-catalog owning document):** **AD-P2-02** (event emit-trigger authority), **IR-02** (`DeliveryRecorded` emission cardinality on versioned `challans`), **IR-03** (`WorkCompletionIssued` emission cardinality on versioned WCC) — the emit-trigger / emission-cardinality for the operations events is absent from Doc-2 §8; proposed bindings are carried, never resolved or invented locally. Any change to this frozen baseline requires Architecture Board approval (Doc-4_Governance_Note_v1.0).

---
## §H — Part-2 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; the canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is always established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, the **source authority**, the **rule**, and the **failure outcome** (error class from H.4).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `human_ref` (string, Doc-2 §0.1 — `DOC-…` for documents, `INV-…` for trade invoices), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `numeric` (Doc-2 §10.4/§10.5 `NUMERIC`/amount), `uuid[]` (arrays; cardinality stated), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, **not** internal field schema, which is development-doc scope), `timestamptz`, `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B five-condition check, stage 5). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement source for every check is Identity's `check_permission` (Doc-4C §C3/§C8, consumed; no shadow authorization). **BC-OPS-2 scope = a party of the target engagement** — the **buyer organization** (`buyer_organization_id`) for buyer-side actions; the **vendor controlling organization** (`vendor_controlling_org_id`) for vendor-side actions; a representative org acts via a §6B **delegation grant** where the action is vendor-side and the actor's org does not control the vendor profile. Party scope is enforced on the engagement party columns (Doc-2 §10.5; never cross-schema traversal).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes follow **`ops_<domain>_<code>`** (Appendix B namespace `ops_`); **specific numeric codes are assigned at the development-document stage** — Pass-B fixes the **class + trigger + retryable** per error, not the integer. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable: false`) is kept distinct from `DEPENDENCY` (the owning service is transiently unavailable / no definitive answer; `retryable: true`) — never conflated** (Doc-4A §12.2/§12.4; the FROZEN Part-1 P-03 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract). No POLICY-limit (Category 9) applies in Part 2 unless a contract states one.
- **H.5 — State machine (Doc-2 §3.5/§10.5; Doc-4A §13).** The BC-OPS-2 lifecycles are: **`engagements` → `open → in_delivery → completed → closed`** (Doc-2 §3.5/§10.5; `closed` terminal — close/archive); **`trade_invoices` → `issued → partially_paid → paid | disputed | cancelled`**; **`payment_records` → `recorded → confirmed`**; **`lois`/`purchase_orders`/`challans`/`work_completion_certificates` → versioned documents** (no status machine; revision rows `version_no`/`is_active_revision`). Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all others → `STATE`). **Terminal `closed` engagement never transitions** (Doc-4A §13). Concurrency: optimistic — mutating commands assert the expected row revision (and engagement `expected_status` where a transition is requested); a lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified** — Pass-B enforces the frozen Doc-2 §3.5/§10.5 edges only. **There is NO `on_hold`, `active`, or `disputed` ENGAGEMENT state** (the engagement machine is exactly `open/in_delivery/completed/closed`); "dispute" is an **engagement-level audit action + the `DisputeRecorded` event**, and `disputed` is a **`trade_invoices` status** — neither is an engagement state (see §F5.6/§F5.8 and the AI-Agent notes).
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User` for party actions; `System` for the inbound event consumer), **object scope** (the `operations.*` row), **timing** (same transaction as the state write + any outbox insert — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B write mechanism). Reads are not audited (§17.1). BC-OPS-2 binds the **separately-enumerated** Doc-2 §9 domains directly: **Engagement** (open, status change, close; LOI/PO/challan/WCC issue + revision; dispute recorded; buyer feedback submitted) and **Financial** (trade invoice issue/status change; payment record entries). Any mutation lacking a separately-enumerated §9 action carries **`[ESC-OPS-AUDIT]`** (interim: nearest §9 action by pointer; channel Doc-2 §9 additive; **no action invented**).
- **H.7 — Events (Doc-2 §8 operations catalog via Doc-4B `core.write_outbox_event.v1`).** BC-OPS-2 is the **sole** Operations event emitter. Emitted events are **only** the Doc-2 §8 operations catalog — **`DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`** — written transactionally (business write + event insert one transaction); **no event coined** (§16.4). All five are **consumed idempotently by Trust into `performance_inputs`** (Delivery Performance, Buyer Feedback, Dispute Record — DF-4); **Operations computes no score.** BC-OPS-2 **consumes** the RFQ event **`RFQClosedWon`** (Doc-2 §8) to create the engagement (its own effect on its own entity — single-authorship; idempotent on event identity, §16). The **event-delivery integration is the emitter's** (RFQ for `RFQClosedWon`; §4.4) — BC-OPS-2 authors no 21.2 integration contract. Per-event **idempotency key** = the originating mutation's idempotency key (emit rides the same transaction; replay → one event); for the consumer, dedup on the inbound `RFQClosedWon` event identity.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key). **No `operations`/`ops` dedup-window key is registered in Doc-3 §12.2** → the window key is carried under **`[ESC-OPS-POLICY]`** (interim: reference the platform default dedup-window key by name; **no key invented** — Doc-3 §12.2 additive channel). Replay within the window → same result, **no duplicate audit, no duplicate event**. System (21.5) consumer/job contracts are inherently idempotent (re-fire safe; dedup on event/job identity). Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Tenancy & boundary (Doc-2 §6/§10.5; Doc-4A §7.3).** `engagements` and their document children (`lois`/`purchase_orders`/`challans`/`trade_invoices`/`payment_records`/`work_completion_certificates`) are **shared between the two parties** (buyer org + vendor side) via **party columns + RLS** — never disclosed to a non-party; a non-party reference collapses to `NOT_FOUND` (§7.5; §12.4). **Strict separations:** `trade_invoices`/`payment_records` are **Operations-owned inter-party records, ≠ `billing.platform_invoices`** (DF-6) and hold **no funds**; vendor profile/attributes are **Marketplace-owned, reference-by-UUID only** (DF-2); RFQ/quotation/award are **RFQ-owned** (DF-3) — referenced by `rfq_id`/`vendor_profile_id` UUID, never owned; document **generation/rendering** is **BC-OPS-4**'s (Document Generation & Templates) — BC-OPS-2 **references** a `template_version_id` for a document body but owns no template/generated-document aggregate (no ownership overlap with BC-OPS-4).
- **H.10 — `operations` BC-OPS-2 field source (Doc-2 §10.5).** The hardened schemas bind to the frozen Doc-2 §10.5 columns; **Pass-B introduces no column** — it binds existing ones:
  - `engagements`: `rfq_id`, `buyer_organization_id`, `vendor_profile_id`, `vendor_controlling_org_id`, `human_ref`, `status enum<open|in_delivery|completed|closed>`, award value snapshot, `currency` (shared by parties + RLS).
  - `lois` / `purchase_orders` / `challans` / `work_completion_certificates`: → `engagements`; `template_version_id` (in-module ref to BC-OPS-4), counterparty ids; each `human_ref DOC-…`, `version_no`, `content_jsonb`, `storage_ref`, `revision_reason`, `is_active_revision`, `issued_by`, `issued_at` (versioned documents).
  - `trade_invoices`: → `engagements`; `human_ref INV-…`, `amount`, `currency`, `status enum<issued|partially_paid|paid|disputed|cancelled>`, `due_date` — **≠ `billing.platform_invoices`**.
  - `payment_records`: → `trade_invoices` (optional), → `engagements`; `amount`, `currency`, `paid_at`, `method_note`, `status enum<recorded|confirmed>` — records only; no funds custody.

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.** Grouped families share section 1 and split the records where the schema differs.

---

## §F5.1 — `ops.create_engagement_on_award.v1` — Engagement Creation (RFQ `RFQClosedWon` consumer) — *the DF-3 post-award seam*

**1. Contract Metadata** — Contract ID `ops.create_engagement_on_award.v1` · Template **21.5 System** (inbound event consumer) · Owned aggregate **Procurement Engagement** (`engagements` AR) · Authority: Doc-2 §5.4 (`closed_won` "triggers engagement creation"), §8 (primary consumer "engagement creation"), §10.5; ADR-002 (1:1 award→engagement) · Actor types **System** (inbound event consumer) · Bounded context **BC-OPS-2** (§F5).

**2. Request Schema** *(internal trigger; `Response: none` per 21.5)*

| Field | Type | Required | Nullable | Cardinality | Notes (source) |
|---|---|---|---|---|---|
| `event_ref` | `uuid` | yes | no | 1 | the inbound `RFQClosedWon` outbox event identity (dedup key — §16) |
| `rfq_id` | `uuid` | yes | no | 1 | from the event payload (RFQ reference, DF-3; bare UUID) |
| `buyer_organization_id` | `uuid` | yes | no | 1 | from the event payload (Identity ref, DF-1) |
| `vendor_profile_id` | `uuid` | yes | no | 1 | from the event payload (Marketplace ref, DF-2) |
| `vendor_controlling_org_id` | `uuid` | yes | no | 1 | from the event payload (Identity ref, DF-1) |
| `award_value_snapshot` | `numeric` | no | yes | 1 | award value snapshot (Doc-2 §10.5); `currency` per payload |

**3. Response Schema** — **none** (System actor, 21.5 — `Response: none`). Side effect: writes `engagements` at `open` with an allocated `human_ref`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| event payload fields | 1 SYNTAX | Doc-4A §9 | presence/type of the payload references | `VALIDATION` (consumer drops malformed event to DLQ per outbox POLICY) |
| system actor | 2 CONTEXT | Doc-4A §5.2/§15.5 | actor is System (Phase-2 consumer; no active org context) | `AUTHORIZATION` |
| (authz/scope/delegation) | 3–5 | — | n/a — System-actor consumer; no tenant slug/scope/delegation | — |
| one engagement per award (uniqueness) | 8 BUSINESS | ADR-002; Doc-2 §4.1 (1:1) | exactly one `engagements` row per awarded `rfq_id`; a **same-event replay** (same `RFQClosedWon` identity) is an **idempotent no-op** (dedup on event identity — no error, Doc-4A §16.7); a **distinct event asserting an already-existing `rfq_id`** is a business-uniqueness violation | `BUSINESS` (distinct-duplicate); **no error** (same-event replay) — **never `CONFLICT`** (Doc-4A §14.6) |
| `rfq_id`/party UUIDs resolve | 7 REFERENCE | Doc-4A §4.5; DF-1/DF-2/DF-3 | references validated by the owning services (RFQ/Identity/Marketplace) | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| (business) | 8 BUSINESS | Doc-2 §5.4 | award already happened in RFQ; no procurement decision re-made here | — |

**5. Authorization Matrix** — Actor **System** (Phase-2 inbound consumer) · Slug **none** (System actor; no active org context — Doc-4A §5.2/§15.5) · Scope = n/a (consumer effect on Operations' own `engagements`) · Delegation **not eligible** · Enforcement: Phase-2 origin attribution (Doc-4A §15.5); the consumer effect is limited to Operations' own entity (Doc-4A §16.7/§4.3).

**6. State Machine Enforcement** — Allowed source states **none** (creation) · Target **`open`** (Doc-2 §3.5 entry) · **Uniqueness (ADR-002 1:1):** a **same-event replay** for an existing `rfq_id` is an idempotent no-op (dedup on event identity — §10); a **distinct duplicate** is a `BUSINESS` violation (§9), **never `CONFLICT`** (Doc-4A §14.6) · Concurrency: dedup on the inbound `RFQClosedWon` event identity; `human_ref` allocated row-locked via Doc-4B `core.allocate_human_reference.v1`.

**7. Audit Binding** — Action **Doc-2 §9 Engagement** "open" · Attribution **System** · Object scope the new `engagements` row · Timing same transaction as the row write · Source Doc-2 §9 + Doc-4B `core.append_audit_record.v1`.

**8. Event Binding** — Emitted **none** at creation (the award event was RFQ's; engagement `open` emits no operations event — H.7) · **Consumed `RFQClosedWon`** (producer: RFQ / Doc-4E, Doc-2 §8; trigger: RFQ `→ closed_won`; payload authority: Doc-2 §8 / Doc-4E; idempotency key: the inbound event identity) · downstream party notification is Communication's (DF-7).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed event payload (missing/typed reference) → DLQ per outbox POLICY | false |
| `BUSINESS` | a **distinct** event asserts an already-existing engagement for `rfq_id` (business-uniqueness violation, ADR-002 1:1) — **not `CONFLICT`** (Doc-4A §14.6) | false |
| `REFERENCE` | a payload reference does not resolve at its owning service (definitive negative) | false |
| `DEPENDENCY` | RFQ/Identity/Marketplace/Doc-4B service transiently unavailable / no definitive answer (retry per outbox retry POLICY) | true |
| `SYSTEM` | unexpected failure | true |

**Error Boundary block (Doc-4A §12.4/§12.6):** System-actor consumer; no tenant caller, so no protected-fact disclosure question arises at this surface. `REFERENCE` (definitive) and `DEPENDENCY` (transient) are distinct (H.4). `Timing-Uniformity`: not applicable (no existence probe by a tenant).

**10. Idempotency Rules** — inherently idempotent (Doc-4A §14 / §16.7): **dedup on the inbound `RFQClosedWon` event identity** — a replayed award event creates **no** duplicate engagement (ADR-002 1:1) and **no** duplicate audit; at-least-once delivery is expected and absorbed.

**11. Cross-Module References** — **RFQ (DF-3):** consumes `RFQClosedWon`; references `rfq_id` by UUID; **owns no RFQ/quotation/award** (consumer-only). **Identity (DF-1):** `buyer_organization_id`/`vendor_controlling_org_id` resolution (read-only). **Marketplace (DF-2):** `vendor_profile_id` existence (read-only). **Platform Core (DF-8):** `core.allocate_human_reference.v1`, audit-write, outbox dispatch (the inbound delivery). **Communication (DF-7):** notification of the new engagement (authored by Communication, not here).

**12. AI-Agent Implementation Notes** — the engagement is **created by the event consumer, never by a buyer command** (DF-3 seam) — there is **no** `create_engagement` user contract. **One award = one engagement** (ADR-002 1:1) — dedup on `rfq_id`/event identity; a replayed `RFQClosedWon` must not create a duplicate. **Consumer-only:** never assume RFQ or award ownership; `rfq_id`/`vendor_profile_id` are bare UUIDs (DF-3/DF-2), never re-modeled. No procurement decision is made here (the award already happened in RFQ).

---

## §F5.2 — `ops.update_engagement_status.v1` · `ops.close_engagement.v1` — Engagement Lifecycle

**1. Contract Metadata** — Contract IDs `ops.update_engagement_status.v1`, `ops.close_engagement.v1` · Template **21.4 Command** · Owned aggregate **Procurement Engagement** (`engagements` AR) · Authority: Doc-2 §3.5/§10.5 (engagement machine), §9 (Engagement audit), §8 (`EngagementCompleted`) · Actor types **User** (party) · BC-OPS-2 (§F5).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `engagement_id` | `uuid` | yes | no | 1 | target engagement |
| `expected_status` | `enum<open\|in_delivery\|completed\|closed>` | yes | no | 1 | optimistic-concurrency assertion of current status (H.5) |
| `target_status` | `enum<open\|in_delivery\|completed\|closed>` | yes (update) | no | 1 | the requested next status (`update_engagement_status`); `close_engagement` targets `closed` |
| `reason` | `text` | no | yes | 1 | optional reason where the transition warrants a recorded note |

**3. Response Schema** — `engagement_id : uuid (1)`, `status : enum<open|in_delivery|completed|closed> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `engagement_id`, `expected_status`, `target_status` | 1 SYNTAX | Doc-4A §9 | presence/type; statuses ∈ frozen enum | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active org is a party org | `AUTHORIZATION` |
| `can_manage_engagements` | 3 AUTHZ | Doc-2 §7 | membership holds slug | `AUTHORIZATION` |
| engagement party scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org is a party (`buyer_organization_id` or `vendor_controlling_org_id`) of the engagement | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | where vendor-side and the actor org is a representative, the §6B grant covers the action | `AUTHORIZATION` / `NOT_FOUND` (per §12.4) |
| transition legal | 6 STATE | Doc-2 §3.5 | `target_status` is reachable from current per `open→in_delivery→completed→closed`; `closed` terminal | `STATE` |
| status match | 6 STATE / concurrency | Doc-4A §14 | `expected_status` = current status | `CONFLICT` |
| (reference/business/policy) | 7–9 | Doc-2 §3.5 | none beyond the machine | — |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_engagements`** (Doc-2 §7) · Scope = a party org of the engagement (buyer org or vendor controlling org) · Delegation **eligible** (§6B) for a vendor-side representative · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed transitions (Doc-2 §3.5, verbatim sequential machine): `open → in_delivery`, `in_delivery → completed`, `completed → closed`. **`close_engagement` is bound to the single frozen close edge `completed → closed` only** — its legal pre-state is **`completed`** (the only §3.5 edge entering `closed`); `update_engagement_status` drives the two prior adjacent edges. Target one of `in_delivery|completed|closed`. **Forbidden:** **`open → closed` and `in_delivery → closed` are NOT authorized by Doc-2 §3.5** (no corpus edge; close from a non-terminal pre-state other than `completed` → `STATE`); any transition out of terminal **`closed`** → `STATE`; any non-adjacent/illegal edge → `STATE`; **no `on_hold`/`active`/`disputed` engagement state exists** (binding only `open/in_delivery/completed/closed`). Concurrency: optimistic on `expected_status`; lost race → `CONFLICT`. *(A broader close from any non-terminal state is absent from Doc-2 §3.5; if ever required it is a Doc-2 §3.5 escalation, never asserted locally.)*

**7. Audit Binding** — Action **Doc-2 §9 Engagement** "status change" (update) / "close" (`close_engagement`) · Attribution **User** · Object scope the `engagements` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **`EngagementCompleted`** (Doc-2 §8) emitted on the transition to **`completed`** (Trust performance input — DF-4) via Doc-4B outbox-write, same transaction; other transitions emit no operations event (H.7). Producer = BC-OPS-2; trigger transition = `in_delivery → completed`; payload authority = Doc-2 §8 (thin payload — engagement/party refs); idempotency key = the command's idempotency key. *(Whether `closed` carries any additional event: Doc-2 §8 names only `EngagementCompleted` for completion — `closed` emits none; no event coined.)* Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad status enum) | false |
| `AUTHORIZATION` | context/slug/delegation fail (party actor) | false |
| `NOT_FOUND` | active org is not a party (protected-fact collapse, H.9) | false |
| `STATE` | illegal transition / terminal `closed` | false |
| `CONFLICT` | `expected_status` ≠ current (lost race) | true (re-read then retry) |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a non-party caller is `NOT_FOUND`, never `AUTHORIZATION`. `V5 (delegation) : NOT_FOUND | AUTHORIZATION | collapse-rule` per §12.4. `Timing-Uniformity`: not-party / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-OPS-POLICY]`); `expected_status` makes retries safe (a replayed transition already applied returns the same status; a stale assertion → `CONFLICT`). Replay within window → one transition, **no duplicate audit, no duplicate `EngagementCompleted`**.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + §6B delegation resolution. **Trust (DF-4):** consumes `EngagementCompleted` as a performance input — **Operations emits, Trust scores**; no score computed here. **Communication (DF-7):** party notification (authored there). **Platform Core (DF-8):** audit-write, outbox-write.

**12. AI-Agent Implementation Notes** — honor the Doc-2 §3.5 engagement machine **verbatim**: `open → in_delivery → completed → closed`; **`closed` never reopens**; **never introduce `on_hold`/`active`/`disputed` as an engagement state** (dispute is an audit action + `DisputeRecorded` event, §F5.6/§F5.8; `disputed` is a trade-invoice status, §F5.7). `EngagementCompleted` is a **performance input** (DF-4) — emit it, never compute a Trust/Performance score. Party scope only (Doc-2 §6); collapse to `NOT_FOUND` for non-parties.

---

## §F5.3 — `ops.record_delivery.v1` — Record Delivery (challan / delivery event)

**1. Contract Metadata** — Contract ID `ops.record_delivery.v1` · Template **21.4 Command** · Owned child **`challans`** (versioned child of the Procurement Engagement AR) · Authority: Doc-2 §3.5/§10.5 (`challans` versioned document), §9 (Engagement "challan issue + revision"), §8 (`DeliveryRecorded`) · Actor types **User** (party) · BC-OPS-2 (§F5).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `engagement_id` | `uuid` | yes | no | 1 | parent engagement |
| `template_version_id` | `uuid` | no | yes | 1 | BC-OPS-4 template version for the challan body (in-module ref; DF — internal) |
| `content_jsonb` | `jsonb` | yes | no | 1 | challan content (delivery line items/quantities; shape = dev-doc scope) |
| `expected_engagement_status` | `enum<open\|in_delivery\|completed\|closed>` | yes | no | 1 | concurrency/state assertion of the parent engagement |

**3. Response Schema** — `challan_id : uuid (1)`, `human_ref : human_ref (1, "DOC-…")`, `version_no : numeric (1)`, `is_active_revision : bool (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `engagement_id`, `content_jsonb`, `expected_engagement_status` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; party-org context | `AUTHORIZATION` |
| `can_create_documents` | 3 AUTHZ | Doc-2 §7 | slug held (challan create = engagement-document creation) | `AUTHORIZATION` |
| engagement party scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org is a party of the engagement | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | vendor-side representative via §6B grant where applicable | `AUTHORIZATION`/`NOT_FOUND` |
| engagement deliverable state | 6 STATE | Doc-2 §3.5 | engagement is `in_delivery` (delivery recorded during delivery) or as the machine permits | `STATE` |
| `template_version_id` (if present) | 7 REFERENCE | Doc-4A §4.5; BC-OPS-4 | the template version exists and is active (in-module) | `REFERENCE` / `DEPENDENCY` |
| (business/policy) | 8–9 | Doc-2 §10.5 | none beyond versioned-document semantics | — |

**5. Authorization Matrix** — Actor **User** · Slug **`can_create_documents`** (Doc-2 §7) · Scope = a party org of the engagement · Delegation **eligible** (§6B, vendor-side) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Appends a `challans` **version** row (`version_no`, `is_active_revision`; Doc-2 §10.5) · may attend the engagement `in_delivery` state (no engagement transition by this contract unless paired with §F5.2) · **Forbidden:** recording against a terminal `closed` engagement → `STATE` · Concurrency: `expected_engagement_status` assertion; version append is additive (no row-revision race on the challan itself).

**7. Audit Binding** — Action **Doc-2 §9 Engagement** "challan issue + revision" · Attribution **User** · Object scope the `challans` row + parent engagement ref · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **`DeliveryRecorded`** (Doc-2 §8) emitted on the challan/delivery record (Trust performance input — Delivery Performance, DF-4) via Doc-4B outbox-write, same transaction. Producer = BC-OPS-2; trigger = challan issuance / delivery record; payload authority = Doc-2 §8 (thin — engagement/challan refs); idempotency key = the command's idempotency key. Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | context/slug/delegation fail (party actor) | false |
| `NOT_FOUND` | active org not a party (collapse, H.9) | false |
| `STATE` | engagement terminal `closed` | false |
| `REFERENCE` | `template_version_id` does not exist / not active (definitive negative) | false |
| `DEPENDENCY` | BC-OPS-4 template lookup / Doc-4B transiently unavailable (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. `REFERENCE` (template not found) distinct from `DEPENDENCY` (template service transient). `Timing-Uniformity`: not-party / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; replay within window → one challan version + one `DeliveryRecorded` (no duplicate audit/event). A genuinely new delivery is a new version by design (Doc-2 §10.5 versioned document).

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + delegation. **Trust (DF-4):** consumes `DeliveryRecorded`. **BC-OPS-4 (within Operations):** `template_version_id` reference for the challan body (read-only; BC-OPS-4 owns the template). **Platform Core (DF-8):** `human_ref`, audit-write, outbox-write.

**12. AI-Agent Implementation Notes** — `DeliveryRecorded` is a **performance input** (Trust, DF-4) — emit, never score. The challan is a **versioned** document (Doc-2 §10.5) — never overwrite a prior version. The template body comes from **BC-OPS-4** by `template_version_id` (no template ownership here — H.9). Party scope only; collapse to `NOT_FOUND` for non-parties.

---

## §F5.4 — `ops.issue_engagement_document.v1` · `ops.revise_engagement_document.v1` — LOI / PO / WCC Issue & Revision

**1. Contract Metadata** — Contract IDs `ops.issue_engagement_document.v1`, `ops.revise_engagement_document.v1` · Template **21.4 Command** · Owned children **`lois`** / **`purchase_orders`** / **`work_completion_certificates`** (versioned children of the Procurement Engagement AR) · Authority: Doc-2 §3.5/§10.5 (versioned documents), §9 (Engagement "LOI/PO/…/WCC issue + revision"), §8 (`WorkCompletionIssued` on WCC) · Actor types **User** (party) · BC-OPS-2 (§F5).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `engagement_id` | `uuid` | yes | no | 1 | parent engagement |
| `doc_kind` | `enum<loi\|po\|wcc>` | yes | no | 1 | which engagement document (the three this contract family owns; challan is §F5.3) |
| `template_version_id` | `uuid` | no | yes | 1 | BC-OPS-4 template version for the body (in-module ref) |
| `content_jsonb` | `jsonb` | yes | no | 1 | document content (shape = dev-doc scope) |
| `document_id` | `uuid` | yes (revise) | no | 1 | target document on `revise_engagement_document` |
| `revision_reason` | `text` | yes (revise) | no | 1 | mandatory on revise (Doc-2 §10.5 `revision_reason`) |
| `expected_engagement_status` | `enum<open\|in_delivery\|completed\|closed>` | yes | no | 1 | parent-engagement state assertion |

**3. Response Schema** — `document_id : uuid (1)`, `doc_kind : enum<loi|po|wcc> (1)`, `human_ref : human_ref (1, "DOC-…")`, `version_no : numeric (1)`, `is_active_revision : bool (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `engagement_id`, `doc_kind`, `content_jsonb`, `expected_engagement_status` | 1 SYNTAX | Doc-4A §9 | presence/type; `doc_kind` ∈ {loi,po,wcc} | `VALIDATION` |
| issue vs revise field cardinality (mutual exclusion) | 1 SYNTAX | Doc-4A §9 (field presence); §11.1 (testable) | **`ops.issue_engagement_document.v1`:** `document_id` MUST NOT be supplied (issue creates version 1). **`ops.revise_engagement_document.v1`:** `document_id` MUST be supplied AND `revision_reason` MUST be supplied. Violation of either per-operation rule → `VALIDATION` | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; party-org context | `AUTHORIZATION` |
| `can_create_documents` | 3 AUTHZ | Doc-2 §7 | slug held (engagement-document create/revise) | `AUTHORIZATION` |
| **PO/financial approval** | 3 AUTHZ | Doc-2 §7 | for `doc_kind = po` financial approval, **`can_approve_po`** additionally required (distinct slug; never collapsed into `can_create_documents`) | `AUTHORIZATION` |
| engagement party scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org is a party | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | vendor-side representative via §6B grant where applicable | `AUTHORIZATION`/`NOT_FOUND` |
| engagement non-terminal | 6 STATE | Doc-2 §3.5 | parent engagement not `closed`; revise targets an existing active revision | `STATE` |
| `template_version_id` (if present) | 7 REFERENCE | Doc-4A §4.5; BC-OPS-4 | template version exists/active (in-module) | `REFERENCE` / `DEPENDENCY` |
| versioned-document semantics | 8 BUSINESS | Doc-2 §10.5 | issue appends version 1; revise appends `version_no+1` and sets `is_active_revision`; prior versions retained (never overwrite) | `BUSINESS` (if overwrite attempted) |

**5. Authorization Matrix** — Actor **User** · Slugs **`can_create_documents`** (issue/revise) **+ `can_approve_po`** (additionally, for PO financial approval) (Doc-2 §7) · Scope = a party org of the engagement · Delegation **eligible** (§6B, vendor-side) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Appends a versioned row (`version_no`, `is_active_revision`; Doc-2 §10.5); no status machine on these documents · **Forbidden:** issuing/revising against a terminal `closed` engagement → `STATE`; overwriting a prior version → `BUSINESS` · Concurrency: revise asserts the current active revision; a stale revise → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Engagement** "LOI/PO/…/WCC issue + revision" · Attribution **User** · Object scope the document row + parent engagement ref · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **`WorkCompletionIssued`** (Doc-2 §8) emitted on **WCC issuance** (`doc_kind = wcc`) (Trust performance input — DF-4) via Doc-4B outbox-write, same transaction; **LOI/PO issuance/revision emit no operations event** (H.7 — state + audit only). Producer = BC-OPS-2; trigger = WCC issue; payload authority = Doc-2 §8 (thin — engagement/WCC refs); idempotency key = the command's idempotency key. Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `doc_kind`; missing `revision_reason` on revise) | false |
| `AUTHORIZATION` | missing `can_create_documents`, or missing `can_approve_po` for PO approval, or delegation fail | false |
| `NOT_FOUND` | active org not a party (collapse, H.9) | false |
| `STATE` | terminal `closed` engagement | false |
| `REFERENCE` | `template_version_id` does not exist / not active (definitive negative) | false |
| `CONFLICT` | stale revise (active revision moved) | true |
| `BUSINESS` | overwrite of a prior version (versioned-document violation) | false |
| `DEPENDENCY` | BC-OPS-4 template lookup / Doc-4B transiently unavailable (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. `REFERENCE` distinct from `DEPENDENCY`. `Timing-Uniformity`: not-party / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; replay within window → one version + (for WCC) one `WorkCompletionIssued` (no duplicate audit/event). Issue vs revise are distinct operations; a revise asserts the active revision for safe retry.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + delegation. **Trust (DF-4):** consumes `WorkCompletionIssued`. **BC-OPS-4 (within Operations):** `template_version_id` reference (read-only; BC-OPS-4 owns templates/generation — no overlap, H.9). **Platform Core (DF-8):** `human_ref`, audit-write, outbox-write.

**12. AI-Agent Implementation Notes** — **PO/financial approval requires `can_approve_po` in addition to `can_create_documents`** (Doc-2 §7) — never collapse the two slugs. **WCC issuance is a performance input** (`WorkCompletionIssued` → Trust, DF-4) — emit, never score. LOI/PO issuance/revision emit **no** event. All three are **versioned** documents — never overwrite a version (Doc-2 §10.5). Template bodies are BC-OPS-4's (H.9). Party scope only.

---

## §F5.5 — `ops.issue_trade_invoice.v1` · `ops.update_trade_invoice_status.v1` — Trade Invoice (inter-party; ≠ Billing)

**1. Contract Metadata** — Contract IDs `ops.issue_trade_invoice.v1`, `ops.update_trade_invoice_status.v1` · Template **21.4 Command** · Owned child **`trade_invoices`** (of the Procurement Engagement AR) · Authority: Doc-2 §3.5/§10.5 (`trade_invoices` machine; **≠ `billing.platform_invoices`**), §9 (Financial "trade invoice issue/status change"), §8 (`DisputeRecorded` on dispute) · Actor types **User** (party) · BC-OPS-2 (§F5). **DF-6 strict separation; no funds.**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `engagement_id` | `uuid` | yes (issue) | no | 1 | parent engagement |
| `amount` | `numeric` | yes (issue) | no | 1 | Doc-2 §10.5 `amount` |
| `currency` | `enum<BDT>` | no | no | 1 | Doc-2 §10.5 `currency` (default BDT) |
| `due_date` | `timestamptz` | no | yes | 1 | Doc-2 §10.5 `due_date` |
| `trade_invoice_id` | `uuid` | yes (update) | no | 1 | target invoice on `update_trade_invoice_status` |
| `target_status` | `enum<issued\|partially_paid\|paid\|disputed\|cancelled>` | yes (update) | no | 1 | requested next status (Doc-2 §10.5) |
| `expected_status` | `enum<issued\|partially_paid\|paid\|disputed\|cancelled>` | yes (update) | no | 1 | optimistic-concurrency assertion |

**3. Response Schema** — `trade_invoice_id : uuid (1)`, `human_ref : human_ref (1, "INV-…")`, `status : enum<issued|partially_paid|paid|disputed|cancelled> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| issue/update typed fields | 1 SYNTAX | Doc-4A §9 | presence/type; `status` ∈ frozen enum | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; party-org context | `AUTHORIZATION` |
| `can_record_payments` | 3 AUTHZ | Doc-2 §7 | slug held (trade invoices / payment records) | `AUTHORIZATION` |
| engagement party scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org is a party | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | vendor-side representative via §6B grant where applicable | `AUTHORIZATION`/`NOT_FOUND` |
| status transition legal | 6 STATE | Doc-2 §10.5 | `issued → partially_paid → paid` and `→ disputed`/`→ cancelled` per the frozen machine | `STATE` |
| status match (update) | 6 STATE / concurrency | Doc-4A §14 | `expected_status` = current | `CONFLICT` |
| (business/policy) | 8–9 | Doc-2 §10.5; DF-6 | no funds movement; not a Billing entity | — |

**5. Authorization Matrix** — Actor **User** · Slug **`can_record_payments`** (Doc-2 §7) · Scope = a party org of the engagement · Delegation **eligible** (§6B, vendor-side) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — `trade_invoices`: `issued → partially_paid → paid | disputed | cancelled` (Doc-2 §10.5) · **Forbidden:** illegal status jumps / mutating a terminal `paid`/`cancelled` per the machine → `STATE` · Concurrency: optimistic on `expected_status`; lost race → `CONFLICT`.

**7. Audit Binding** — **(a) Issue / non-dispute status change:** Action **Doc-2 §9 Financial** "trade invoice issue/status change" · Attribution **User** · Object scope the `trade_invoices` row + parent engagement ref · Timing same transaction · Source Doc-2 §9 + Doc-4B. **(b) Dispute transition (`→ disputed`): bind BOTH §9 actions in the same transaction** — **Doc-2 §9 Financial** "trade invoice issue/status change" (the invoice status mutation) **AND Doc-2 §9 Engagement** "dispute recorded" (the dispute fact; "dispute evidence requires the full chain", Doc-2 §9 Engagement) · Attribution **User** · Object scope the `trade_invoices` row + parent `engagements` ref · Timing same transaction · Source Doc-2 §9 (both actions) + Doc-4B. *(Both are separately-enumerated §9 actions — no `[ESC-OPS-AUDIT]`; no audit action invented.)*

**8. Event Binding** — **`DisputeRecorded`** (Doc-2 §8) emitted where a trade invoice transitions to **`disputed`** and a dispute is recorded against the engagement (Trust performance input — Dispute Record, DF-4) via Doc-4B outbox-write, same transaction; other status changes (`issued`/`partially_paid`/`paid`/`cancelled`) emit **no** operations event (H.7). Producer = BC-OPS-2; trigger transition = `→ disputed`; payload authority = Doc-2 §8 (thin — engagement/invoice refs); idempotency key = the command's idempotency key. *(Doc-2 §8 names `DisputeRecorded` for the dispute fact; whether disputes may also be recorded via a distinct engagement action is a Doc-2 §10.5 detail — the event is the existing `DisputeRecorded`, none coined. The exact emitting surface is carried for confirmation against Doc-2 §8/§10.5; see AI-Agent Notes and the cross-reference to AD-02-class engagement-dispute escalation if a reviewer finds the surface under-specified.)* Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `status` enum) | false |
| `AUTHORIZATION` | context/slug/delegation fail (party actor) | false |
| `NOT_FOUND` | active org not a party (collapse, H.9) | false |
| `STATE` | illegal status transition / terminal invoice | false |
| `CONFLICT` | `expected_status` ≠ current | true |
| `DEPENDENCY` | Doc-4B (audit/outbox/human-ref) transiently unavailable (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. No external REFERENCE check on a trade invoice (it references only the in-aggregate engagement); `REFERENCE`/`DEPENDENCY` are not conflated — only `DEPENDENCY` (Doc-4B transient) applies. `Timing-Uniformity`: not-party / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; `expected_status` makes status updates safe to retry; replay within window → one status change + (on `→ disputed`) one `DisputeRecorded` (no duplicate audit/event).

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + delegation. **Trust (DF-4):** consumes `DisputeRecorded`. **Billing (DF-6):** **strict separation** — `trade_invoices` are **≠ `billing.platform_invoices`**; no Billing entity referenced; **no funds movement**. **Platform Core (DF-8):** `human_ref` (`INV-…`), audit-write, outbox-write.

**12. AI-Agent Implementation Notes** — `trade_invoices` are **never** `billing.platform_invoices` (DF-6) — different owner, different schema, **no funds custody**; a trade invoice records a buyer↔vendor commercial obligation only. `disputed` is a **trade-invoice status** (Doc-2 §10.5), **not** an engagement state; the dispute fact emits **`DisputeRecorded`** (Trust input, DF-4), never a locally-computed score. Party scope only; collapse to `NOT_FOUND` for non-parties.

---

## §F5.6 — `ops.record_payment.v1` · `ops.confirm_payment.v1` — Payment Records (records only, no funds)

**1. Contract Metadata** — Contract IDs `ops.record_payment.v1`, `ops.confirm_payment.v1` · Template **21.4 Command** · Owned child **`payment_records`** (of the Procurement Engagement AR) · Authority: Doc-2 §3.5/§10.5 (`payment_records` machine `recorded → confirmed`; records only), §9 (Financial "payment record entries") · Actor types **User** (party) · BC-OPS-2 (§F5). **No funds custody (DF-6).**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `engagement_id` | `uuid` | yes (record) | no | 1 | parent engagement |
| `trade_invoice_id` | `uuid` | no | yes | 1 | optional link to a trade invoice (Doc-2 §10.5 "→ trade_invoices (optional)") |
| `amount` | `numeric` | yes (record) | no | 1 | Doc-2 §10.5 `amount` |
| `currency` | `enum<BDT>` | no | no | 1 | Doc-2 §10.5 `currency` |
| `paid_at` | `timestamptz` | no | yes | 1 | Doc-2 §10.5 `paid_at` |
| `method_note` | `text` | no | yes | 1 | Doc-2 §10.5 `method_note` (note only; no funds) |
| `payment_record_id` | `uuid` | yes (confirm) | no | 1 | target record on `confirm_payment` |
| `expected_status` | `enum<recorded\|confirmed>` | yes (confirm) | no | 1 | optimistic-concurrency assertion |

**3. Response Schema** — `payment_record_id : uuid (1)`, `status : enum<recorded|confirmed> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| record/confirm typed fields | 1 SYNTAX | Doc-4A §9 | presence/type; `status` ∈ frozen enum | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; party-org context | `AUTHORIZATION` |
| `can_record_payments` (record) | 3 AUTHZ | Doc-2 §7 | slug held to record | `AUTHORIZATION` |
| **`can_approve_payment` (confirm)** | 3 AUTHZ | Doc-2 §7 | confirm additionally requires `can_approve_payment` (distinct slug; never collapsed) | `AUTHORIZATION` |
| engagement party scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org is a party | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | vendor-side representative via §6B grant where applicable | `AUTHORIZATION`/`NOT_FOUND` |
| status transition (confirm) | 6 STATE | Doc-2 §10.5 | `recorded → confirmed` only | `STATE` |
| status match (confirm) | 6 STATE / concurrency | Doc-4A §14 | `expected_status` = current | `CONFLICT` |
| `trade_invoice_id` (if present) | 7 REFERENCE | Doc-4A §4.5 (in-aggregate) | the linked trade invoice exists under the same engagement | `REFERENCE` / `DEPENDENCY` |

**5. Authorization Matrix** — Actor **User** · Slugs **`can_record_payments`** (record) **/ `can_approve_payment`** (confirm) (Doc-2 §7) · Scope = a party org of the engagement · Delegation **eligible** (§6B, vendor-side) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — `payment_records`: `recorded → confirmed` (Doc-2 §10.5) · **Forbidden:** any other transition (e.g., `confirmed →` anything) → `STATE` · Concurrency: optimistic on `expected_status`; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Financial** "payment record entries" · Attribution **User** · Object scope the `payment_records` row + parent engagement (+ optional trade invoice) ref · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** — no Doc-2 §8 operations event for payment records (H.7; state + audit only); where a payment completes a trade invoice, the trade-invoice status update (§F5.5) carries its own audit. Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | missing `can_record_payments` (record) or `can_approve_payment` (confirm), or delegation fail | false |
| `NOT_FOUND` | active org not a party (collapse, H.9) | false |
| `STATE` | illegal transition (only `recorded → confirmed`) | false |
| `CONFLICT` | `expected_status` ≠ current | true |
| `REFERENCE` | linked `trade_invoice_id` does not exist under the engagement (definitive negative) | false |
| `DEPENDENCY` | Doc-4B transiently unavailable (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. `REFERENCE` (linked invoice not found) distinct from `DEPENDENCY` (Doc-4B transient). `Timing-Uniformity`: not-party / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; record and confirm are distinct; `expected_status` makes confirm safe to retry; replay within window → one record / one confirmation, no duplicate audit.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + delegation. **Billing (DF-6):** **strict separation** — `payment_records` are records only, **no funds movement**, no Billing entity. **Platform Core (DF-8):** audit-write. **(No event; no Trust emission here.)**

**12. AI-Agent Implementation Notes** — **records only** — Operations **never moves money** (DF-6); confirmation requires **`can_approve_payment` distinct from `can_record_payments`** (Doc-2 §7). **No payment event is coined** (verified absent from the Doc-2 §8 operations row). Party scope only; collapse to `NOT_FOUND` for non-parties.

---

## §F5.7 — `ops.record_buyer_feedback.v1` — Buyer Feedback (performance input)

**1. Contract Metadata** — Contract ID `ops.record_buyer_feedback.v1` · Template **21.4 Command** · Recorded against **`engagements`** (engagement-bound feedback as a performance input; the public review entity is Trust's `public_reviews` — DF-4, **not** owned here) · Authority: Doc-2 §9 (Engagement "buyer feedback submitted"; "dispute evidence requires the full chain"), §8 (`BuyerFeedbackRecorded`) · Actor types **User** (buyer-side party) · BC-OPS-2 (§F5).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `engagement_id` | `uuid` | yes | no | 1 | parent engagement (feedback requires the engagement — Doc-2 §9) |
| `feedback_jsonb` | `jsonb` | yes | no | 1 | feedback content (shape = dev-doc scope) |

**3. Response Schema** — `engagement_id : uuid (1)`, `feedback_ref : uuid (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `engagement_id`, `feedback_jsonb` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; buyer-side party-org context | `AUTHORIZATION` |
| authorization slug | 3 AUTHZ | Doc-2 §7 | `can_manage_engagements` for the engagement-bound feedback record; **if a content/review pass finds no precise §7 slug for engagement feedback distinct from `can_manage_engagements`, carry `[ESC-OPS-SLUG]`** (the public-review slug `can_submit_review` is a Trust/review surface, not an Operations-owned mutation) | `AUTHORIZATION` |
| buyer-side party scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org is the buyer party of the engagement | `NOT_FOUND` (collapse, H.9) |
| engagement precondition | 6 STATE | Doc-2 §9 | the engagement exists (no feedback without the post-award chain) | `STATE` |

**5. Authorization Matrix** — Actor **User** (buyer-side) · Slug **`can_manage_engagements`** (Doc-2 §7) **or carry `[ESC-OPS-SLUG]`** if a distinct engagement-feedback slug is later required · Scope = the buyer party org · Delegation **not eligible** (buyer-side own action) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — No engagement-root transition (feedback is a recorded input; no new machine) · the engagement must exist (precondition) · Concurrency: feedback record append; a duplicate is governed by idempotency.

**7. Audit Binding** — Action **Doc-2 §9 Engagement** "buyer feedback submitted" · Attribution **User** · Object scope the feedback record + parent engagement ref · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **`BuyerFeedbackRecorded`** (Doc-2 §8) emitted on feedback record (Trust performance input — Buyer Feedback, DF-4) via Doc-4B outbox-write, same transaction. Producer = BC-OPS-2; trigger = feedback submission; payload authority = Doc-2 §8 (thin — engagement/feedback refs); idempotency key = the command's idempotency key. Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | context/slug fail (buyer-side party) | false |
| `NOT_FOUND` | active org not the buyer party (collapse, H.9) | false |
| `STATE` | no engagement (feedback requires the post-award chain) | false |
| `DEPENDENCY` | Doc-4B (audit/outbox) transiently unavailable (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`. No external REFERENCE check (engagement is in-aggregate); only `DEPENDENCY` (Doc-4B transient) applies. `Timing-Uniformity`: not-party / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; replay within window → one feedback record + one `BuyerFeedbackRecorded` (no duplicate audit/event).

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission`. **Trust (DF-4):** consumes `BuyerFeedbackRecorded`; the **published public review** is Trust-owned (`trust.public_reviews`) and Marketplace-displayed — **Operations does not own or publish reviews**. **Platform Core (DF-8):** audit-write, outbox-write.

**12. AI-Agent Implementation Notes** — this records a **performance input** (`BuyerFeedbackRecorded` → Trust, DF-4); Operations **never computes a Trust/Performance score** and **never owns the public review** (`public_reviews` = Trust). Engagement is a **precondition** (no feedback without the post-award chain — Doc-2 §9). The feedback-slug question carries **`[ESC-OPS-SLUG]`** if a distinct slug is required — **never invent a slug**. Buyer-side party scope only.

---

## §F5.8 — `ops.get_engagement.v1` · `ops.list_engagements.v1` · `ops.get_engagement_document.v1` — Engagement Reads

**1. Contract Metadata** — Contract IDs `ops.get_engagement.v1`, `ops.list_engagements.v1`, `ops.get_engagement_document.v1` · Template **21.3 Query** · Reads over `engagements`(+document children) · Authority: Doc-2 §6/§10.5 (shared-by-parties; RLS) · Actor types **User** (a party org of the engagement) · BC-OPS-2 (§F5).

**2. Request Schema** — *`get_engagement`:* `engagement_id : uuid (1, required)`. *`get_engagement_document`:* `document_id : uuid (1, required)` (+ optional `doc_kind : enum<loi|po|challan|wcc|trade_invoice|payment_record>`). *`list_engagements`:* `filter : object{ status?, role? } (0..1, nullable; allowlisted fields only, Doc-4A §9.6)`; `page_size : numeric (0..1)` (bounded by POLICY key §18 — `[ESC-OPS-POLICY]`); `page_token : string (0..1, nullable)` (Doc-4A §22.3).

**3. Response Schema** — *`get_engagement`:* `engagement : object{ engagement_id, human_ref, status, buyer_organization_id, vendor_profile_id, vendor_controlling_org_id, award_value_snapshot, currency }`, `reference_id`. *`get_engagement_document`:* `document : object{ document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }`, `reference_id`. *`list_engagements`:* `items : list<object{ engagement_id, human_ref, status }>`, `next_page_token : string (0..1)`, `reference_id`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields / filter | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; party-org context | `AUTHORIZATION` |
| `can_manage_engagements` | 3 AUTHZ | Doc-2 §7 | slug held (engagement read under the engagement slug; **no separate read slug in Doc-2 §7** — carry `[ESC-OPS-SLUG]` only if a distinct read slug is later required) | `AUTHORIZATION` |
| engagement party scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org is a party (buyer org or vendor controlling org) | `NOT_FOUND` (collapse, H.9) |
| `page_size` bound | 9 POLICY | Doc-4A §18 | within POLICY bound (`[ESC-OPS-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_engagements`** (Doc-2 §7) · Scope = **a party org only** (buyer org sees its side; vendor controlling org sees its side — Doc-2 §6/§10.5 shared-by-parties) · Delegation **eligible** (§6B, vendor-side representative read) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — None (read).

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Emitted **none** · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter/sort field; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (party actor) | false |
| `NOT_FOUND` | active org not a party (collapse, H.9) | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a non-party caller is `NOT_FOUND`; `list` returns **only** the caller's party engagements, never another party's or a non-party's. `Timing-Uniformity`: not-party / not-exist identical.

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure queries, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + §6B delegation resolution. **Platform Core (DF-8):** none beyond read infrastructure (storage-ref retrieval for documents via Doc-4B). Non-disclosure (H.9): party scope only.

**12. AI-Agent Implementation Notes** — an engagement is **shared by the parties only** (Doc-2 §6) — never expose it to a non-party; RLS anchors on party columns, **never cross-schema traversal** (Doc-2 §10.11). `list` enumerates only the caller's party engagements. Document storage refs point at BC-OPS-4-generated artifacts where applicable — read-only.

---

## Appendix A — BC-OPS-2 Contract Register (Pass-B Part 2)

| § | Contract-ID(s) | Template | Owned entity (Doc-2) | Actor | Emits event (Doc-2 §8) | Audit (Doc-2 §9) |
|---|---|---|---|---|---|---|
| §F5.1 | `ops.create_engagement_on_award.v1` | 21.5 | `engagements` | System | none (consumes `RFQClosedWon`) | §9 Engagement "open" |
| §F5.2 | `ops.update_engagement_status.v1` · `ops.close_engagement.v1` | 21.4 | `engagements` | User | **`EngagementCompleted`** (→ completed) | §9 Engagement "status change"/"close" |
| §F5.3 | `ops.record_delivery.v1` | 21.4 | `challans` | User | **`DeliveryRecorded`** | §9 Engagement "challan issue + revision" |
| §F5.4 | `ops.issue_engagement_document.v1` · `ops.revise_engagement_document.v1` | 21.4 | `lois`/`purchase_orders`/`work_completion_certificates` | User | **`WorkCompletionIssued`** (WCC only) | §9 Engagement "LOI/PO/…/WCC issue + revision" |
| §F5.5 | `ops.issue_trade_invoice.v1` · `ops.update_trade_invoice_status.v1` | 21.4 | `trade_invoices` | User | **`DisputeRecorded`** (→ disputed) | §9 Financial "trade invoice issue/status change" |
| §F5.6 | `ops.record_payment.v1` · `ops.confirm_payment.v1` | 21.4 | `payment_records` | User | none | §9 Financial "payment record entries" |
| §F5.7 | `ops.record_buyer_feedback.v1` | 21.4 | `engagements` (feedback) | User | **`BuyerFeedbackRecorded`** | §9 Engagement "buyer feedback submitted" |
| §F5.8 | `ops.get_engagement.v1` · `ops.list_engagements.v1` · `ops.get_engagement_document.v1` | 21.3 | Procurement Engagement | User | none | none (read) |

**Part-2 invariants (held):** BC-OPS-2 owns exactly one aggregate (Procurement Engagement); it is the **sole** Operations event emitter, emitting **only** the five Doc-2 §8 operations events (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`), all consumed by Trust as performance inputs (DF-4); it **consumes** `RFQClosedWon` (DF-3, System actor) to create the engagement and owns **no** RFQ/quotation/award; binds Doc-2 §7 slugs `can_manage_engagements`/`can_create_documents`/`can_approve_po`/`can_record_payments`/`can_approve_payment` only (no slug invented; the buyer-feedback slug question carries `[ESC-OPS-SLUG]`); binds Doc-2 §9 Engagement/Financial actions or carries `[ESC-OPS-AUDIT]` (no action invented); carries `[ESC-OPS-POLICY]` for dedup-window/page-size keys; `trade_invoices`/`payment_records` are ≠ Billing and hold no funds (DF-6); document bodies reference BC-OPS-4 `template_version_id` with **no template/generated-document ownership** (no overlap with BC-OPS-4 — H.9). The engagement machine is exactly `open/in_delivery/completed/closed` — **no `on_hold`/`active`/`disputed` engagement state invented**. **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

---

## Appendix B — BC-OPS-2 Event Binding Map (Pass-B Part 2)

| Event (Doc-2 §8) | Direction | Emitting contract | Trigger transition / fact | Consumer | Payload authority | Idempotency key |
|---|---|---|---|---|---|---|
| `RFQClosedWon` | **consumed** | `ops.create_engagement_on_award.v1` | RFQ `→ closed_won` (RFQ-owned) | BC-OPS-2 (creates `engagements`) | Doc-2 §8 / Doc-4E | inbound event identity |
| `EngagementCompleted` | emitted | `ops.update_engagement_status.v1` | engagement `in_delivery → completed` | Trust (`performance_inputs`) | Doc-2 §8 | command idempotency key |
| `DeliveryRecorded` | emitted | `ops.record_delivery.v1` | challan/delivery record | Trust (Delivery Performance) | Doc-2 §8 | command idempotency key |
| `WorkCompletionIssued` | emitted | `ops.issue_engagement_document.v1` | WCC issuance (`doc_kind = wcc`) | Trust (`performance_inputs`) | Doc-2 §8 | command idempotency key |
| `DisputeRecorded` | emitted | `ops.update_trade_invoice_status.v1` | trade invoice `→ disputed` / dispute recorded | Trust (Dispute Record) | Doc-2 §8 | command idempotency key |
| `BuyerFeedbackRecorded` | emitted | `ops.record_buyer_feedback.v1` | buyer feedback submission | Trust (Buyer Feedback) | Doc-2 §8 | command idempotency key |

**Single-authorship (Doc-4A §4.4):** BC-OPS-2 authors its own emit-commands and its own `RFQClosedWon` consumer effect on its own entity; it authors **no** 21.2 integration contract (the emitter authors event delivery — RFQ for `RFQClosedWon`; Operations' own emits are delivered by the Doc-4B outbox). Trust authors its own consumer legs. **No event coined.**

---

## Appendix C — Carried Markers (Part 2; unchanged)

- **DF-1** (Identity — `check_permission`/org-context/§6B delegation, consumed), **DF-2** (Marketplace — `vendor_profile_id` existence, read-only), **DF-3** (RFQ — consumes `RFQClosedWon`; owns no RFQ/quotation/award), **DF-4** (Trust — emits the five performance-input events; computes no score), **DF-6** (Billing — `trade_invoices`/`payment_records` ≠ platform invoices; no funds), **DF-7** (Communication — engagement notifications authored there), **DF-8** (Platform Core — `human_ref`/audit/outbox/storage).
- **`[ESC-OPS-AUDIT]`** (Doc-2 §9 additive) — any BC-OPS-2 mutation lacking a separately-enumerated §9 action binds the nearest §9 Engagement/Financial action by pointer (none required beyond the enumerated set in this Part; carried as the standing rule).
- **`[ESC-OPS-POLICY]`** (Doc-3 §12.2 additive) — idempotency dedup-window key and list `page_size` bound (no `operations` POLICY namespace registered; platform default referenced by name; no key invented).
- **`[ESC-OPS-SLUG]`** (Doc-2 §7 additive) — the engagement buyer-feedback slug question (§F5.7), if a distinct slug is later required (current binding: `can_manage_engagements`).

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4F — Pass-B (Hardening) Part 2 v1.0 (FROZEN) — BC-OPS-2 Engagement & Commercial Documents — final immutable Part-2 baseline. Consolidates `Doc-4F_PassB_Part2_BC-OPS-2_Procurement_Engagements_v1.0` as amended by `Doc-4F_PassB_Part2_Patch_v1.0` (P-01 close-edge bound to `completed → closed`; P-02 dispute path binds both Doc-2 §9 Financial + Engagement audit actions; P-03 `CONFLICT` removed from engagement-uniqueness path per Doc-4A §14.6; P-04 explicit issue/revise Stage-1 SYNTAX rule); certified by `Doc-4F_PassB_Part2_Freeze_Audit_v1.0`. Authored against `Doc-4F_Content_v1.0_PassA_FROZEN.md` §F5 (sole contract authority). BC-OPS-2 owns one aggregate (Procurement Engagement) across 8 §F5 records (14 contract IDs); the sole Operations event emitter (the five Doc-2 §8 operations events → Trust performance inputs, DF-4) and consumer of `RFQClosedWon` (DF-3, System actor) owning no RFQ/quotation/award. No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template created or changed; the procurement moat, Marketplace boundary, and Trust firewall are preserved; nothing invented. Carried markers DF-1/DF-2/DF-3/DF-4/DF-6/DF-7/DF-8, `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]`, and the Doc-2 §8 escalation cluster (AD-P2-02, IR-02, IR-03) travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Authorized next stage: Doc-4F_PassB_Part3 (BC-OPS-3 Vendor Lead Pipeline).*
