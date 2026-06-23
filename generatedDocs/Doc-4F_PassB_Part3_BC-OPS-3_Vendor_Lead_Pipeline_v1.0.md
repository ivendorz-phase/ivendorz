# Doc-4F — Business Operations Engine — Pass-B (Hardening) Part 3 v1.0 — BC-OPS-3 Vendor Lead Pipeline

## BC-OPS-3 — Vendor Lead Pipeline Hardening (§F6)

| Field | Value |
|---|---|
| Document | Doc-4F — **Pass-B Part 3 v1.0** — Module 4 Business Operations Engine (`operations` schema, `ops_` namespace) |
| Part scope | **BC-OPS-3 — Vendor Lead Pipeline (§F6)** — the Pass-A §F6 contracts (Vendor Lead aggregate), hardened to implementation grade. The vendor-side CRM pipeline; **emits no domain event**. |
| Status | **Pass-B Part 3 draft — implementation-grade contract specification for BC-OPS-3.** Independently reviewable. Suitable for Hard Review → Patch → Patch Verification → Freeze Audit. |
| Contract authority | `Doc-4F_Content_v1.0_PassA_FROZEN.md` §F6 (sole contract authority; not revisited, not redesigned, not reopened) |
| Structure authority | `Doc-4F_Structure_v1.0_FROZEN.md` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F_Structure_v1.0_FROZEN, Doc-4F_Content_v1.0_PassA_FROZEN, Doc-4F_PassB_Part1_BC-OPS-1_FROZEN, Doc-4F_PassB_Part2_BC-OPS-2_FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-OPS-1 Buyer Private CRM (FROZEN) · Part 2 — BC-OPS-2 Engagement & Commercial Documents (FROZEN) · **Part 3 — BC-OPS-3 Vendor Lead Pipeline** · Part 4 — BC-OPS-4 Document Generation & Templates · Part 5 — BC-OPS-5 Finance Records |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Pass-B mission (Part 3).** Convert the Pass-A BC-OPS-3 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices on the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement (allowed/forbidden source states + concurrency), audit bindings, event bindings, error registers (Doc-4A §12 closed class set), idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §F6. The **post-routing seam** is load-bearing: BC-OPS-3 runs the **vendor-side** lead pipeline **after** RFQ routing delivers the invitation; it owns **no** RFQ/quotation/matching/routing/ranking/supplier-selection/award (DF-3), **no** vendor discovery/search/profiles/attributes (DF-2 / Marketplace), **no** lead generation (RFQ generates the invitation; Operations creates the lead row as the consumer effect), and **no** trust/performance score (DF-4). Carried dependencies **DF-1, DF-2, DF-3, DF-7, DF-8** (the BC-OPS-3 seams) and the markers **`[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt**.

**Recorded reconciliation — validation-stage vocabulary (no Flag-and-Halt breach; frozen authority governs).** The Part-3 authoring brief restated the canonical validation order as "`1 SYNTAX · 2 SHAPE · 3 SEMANTIC · 4 AUTHENTICATION · 5 AUTHORIZATION · 6 STATE · 7 REFERENCE · 8 BUSINESS · 9 POLICY`." The **frozen authority** Doc-4A §11.2 fixes the canonical nine-stage order as **`1 SYNTAX · 2 CONTEXT · 3 AUTHZ · 4 SCOPE · 5 DELEGATION · 6 STATE · 7 REFERENCE · 8 BUSINESS · 9 POLICY`** (the order is FIXED and "never reordered"). On a conflict between a restated list and the frozen source, **the frozen Doc-4A §11.2 order governs** (Doc-4A §0.6 flag-and-halt). This Part uses the **frozen §11.2 stage names**, exactly as the FROZEN Part-1 and Part-2 precedents did. No stage invented, none reordered.

**Recorded reconciliation — lead lifecycle (no Flag-and-Halt breach; frozen authority governs).** The Part-3 authoring brief listed candidate lead states "`assigned · viewed · contacted · responded · converted · rejected · expired (or frozen-authority equivalent)`." The **frozen authority** Doc-2 §3.5/§10.5 defines the `vendor_leads` lifecycle verbatim as **`received → quoted → negotiation → won / lost → follow_up`** (`stage(received/quoted/negotiation/won/lost/follow_up)`). This Part binds the **frozen** machine; the brief's candidate states are **not** in the corpus and are **not** invented (the "or frozen-authority equivalent" clause resolves to the frozen `received/quoted/negotiation/won/lost/follow_up` set). No state or transition invented.

---

## §H — Part-3 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; the canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is always established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, the **source authority**, the **rule**, and the **failure outcome** (error class from H.4).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `numeric` (Doc-2 §10.5 amount), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, not internal field schema, which is development-doc scope), `timestamptz`, `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B five-condition check, stage 5). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement source for every check is Identity's `check_permission` (Doc-4C §C3/§C8, consumed; no shadow authorization). **BC-OPS-3 scope = the vendor controlling organization** (`controlling_organization_id`) of the target `vendor_leads` row; a representative org acts via a §6B **delegation grant** where it does not control the vendor profile. BC-OPS-3 is **vendor-side only**. The sole Doc-2 §7 slug is **`can_manage_leads`** (O,D,M,F — vendor side).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes follow **`ops_<domain>_<code>`** (Appendix B namespace `ops_`); specific numeric codes are assigned at the development-document stage — Pass-B fixes the **class + trigger + retryable**, not the integer. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable: false`) is kept distinct from `DEPENDENCY` (the owning service is transiently unavailable / no definitive answer; `retryable: true`) — never conflated** (Doc-4A §12.2/§12.4; the FROZEN Part-1/Part-2 P-03 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract). No POLICY-limit (Category 9) applies in Part 3 unless a contract states one.
- **H.5 — State machine (Doc-2 §3.5/§10.5; Doc-4A §13).** The BC-OPS-3 lifecycles are: **`vendor_leads` → `received → quoted → negotiation → won | lost → follow_up`** (Doc-2 §3.5/§10.5, verbatim); **`lead_activities` → append-only** (no status machine). Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all others → `STATE`). Concurrency: optimistic — `update_lead_stage` asserts `expected_stage`; a lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified** — Pass-B enforces the frozen Doc-2 §3.5 stages only. **There is no `assigned`/`viewed`/`contacted`/`responded`/`converted`/`rejected`/`expired` lead state** (the brief's candidates are absent from Doc-2 §3.5); the frozen stages are exactly `received/quoted/negotiation/won/lost/follow_up`.
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User` for vendor-side actions; `System` for the inbound event consumer), **object scope** (the `operations.*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B). Reads are not audited (§17.1). **Doc-2 §9 enumerates NO separate `vendor_leads`/`lead_activities` audit action** → **every** BC-OPS-3 mutation (lead create, stage change, activity append) carries **`[ESC-OPS-AUDIT]`** (interim: nearest §9 action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §F6/§F13.
- **H.7 — Events (Doc-2 §8).** **BC-OPS-3 emits NO domain event** (Pass-A §F11 — every vendor-lead mutation is state + §9-audit only; Doc-4A §16.4 — no event coined). BC-OPS-3 **consumes** the RFQ event **`VendorInvited`** (Doc-2 §8 — produced by RFQ, fires **only** at invitation `delivered`) to create the `vendor_leads` row (its own effect on its own entity — single-authorship; idempotent on event identity, §16). The **same `VendorInvited` event is independently co-consumed by Communication** for notification fan-out (DF-7) — the two consumers are independent and idempotent; neither depends on the other. The **event-delivery integration is the emitter's** (RFQ; §4.4) — BC-OPS-3 authors no 21.2 integration contract.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key). **No `operations`/`ops` dedup-window key is registered in Doc-3 §12.2** → the window key is carried under **`[ESC-OPS-POLICY]`** (interim: reference the platform default dedup-window key by name; **no key invented** — Doc-3 §12.2 additive channel). Replay within the window → same result, **no duplicate audit**. The System (21.5) consumer is inherently idempotent (re-fire safe; **dedup on the inbound `VendorInvited` event identity / `invitation_id`**). Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Tenancy, non-disclosure & boundary (Doc-2 §6/§10.5; Doc-4A §7.3/§7.5).** `vendor_leads` and `lead_activities` are **tenant-owned by the vendor controlling org** (`controlling_organization_id`) and RLS-scoped to it — never cross-tenant; a non-owned reference collapses to `NOT_FOUND` (§7.5; §12.4). **Non-disclosure (highest priority):** the lead exposes only the vendor's **own** pipeline data; it carries `rfq_id`/`invitation_id`/`vendor_profile_id` as **bare UUIDs** and is **not a window into RFQ-owned data** (DF-3) — a vendor **cannot infer hidden routing decisions, competitor activity, ranking/matching signals, deferral, or any other invited vendor's existence** through the lead surface (Doc-2 §10.11; §7.5; the lead is created only at invitation `delivered`, never on `selected`/`deferred`, so undelivered/withheld invitations leave no trace). **Strict separations:** RFQ/quotation/matching/routing/ranking/award are **RFQ-owned** (DF-3); vendor discovery/profiles/attributes are **Marketplace-owned** (DF-2); both referenced by UUID only, never owned or mutated.
- **H.10 — `operations` BC-OPS-3 field source (Doc-2 §10.5).** The hardened schemas bind to the frozen Doc-2 §10.5 columns; **Pass-B introduces no column** — it binds existing ones:
  - `vendor_leads`: `vendor_profile_id`, `controlling_organization_id` (tenant — vendor side), `rfq_id`, `invitation_id`, `stage enum<received|quoted|negotiation|won|lost|follow_up>`, `value_estimate`, `next_action_at`; created on `VendorInvited` (fires only at invitation `delivered`).
  - `lead_activities`: → `vendor_leads`; `actor_user_id`; `controlling_organization_id`; append-only activity log.

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.**

---

## §F6.1 — `ops.create_lead_on_invitation.v1` — Vendor Lead Creation (RFQ `VendorInvited` consumer) — *the DF-3 seam; co-consumer with Communication*

**1. Contract Metadata** — Contract ID `ops.create_lead_on_invitation.v1` · Template **21.5 System** (inbound event consumer) · Owned aggregate **Vendor Lead** (`vendor_leads` AR) · Authority: Doc-2 §8 (primary consumer "vendor_leads creation (operations)"), §10.5, §3.5 (entry `received`) · Actor types **System** (inbound event consumer) · Bounded context **BC-OPS-3** (§F6).

**2. Request Schema** *(internal trigger; `Response: none` per 21.5)*

| Field | Type | Required | Nullable | Cardinality | Notes (source) |
|---|---|---|---|---|---|
| `event_ref` | `uuid` | yes | no | 1 | the inbound `VendorInvited` outbox event identity (dedup key — §16) |
| `invitation_id` | `uuid` | yes | no | 1 | from the event payload (RFQ invitation ref, DF-3; the per-lead uniqueness key) |
| `rfq_id` | `uuid` | yes | no | 1 | from the event payload (RFQ ref, DF-3; bare UUID) |
| `vendor_profile_id` | `uuid` | yes | no | 1 | from the event payload (Marketplace ref, DF-2) |
| `controlling_organization_id` | `uuid` | yes | no | 1 | from the event payload (vendor controlling org, DF-1) |

**3. Response Schema** — **none** (System actor, 21.5 — `Response: none`). Side effect: writes `vendor_leads` at `received`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| event payload fields | 1 SYNTAX | Doc-4A §9 | presence/type of the payload references | `VALIDATION` (consumer drops malformed event to DLQ per outbox POLICY) |
| system actor | 2 CONTEXT | Doc-4A §15.5 | actor is System (Phase-2 consumer; no active org context) | `AUTHORIZATION` |
| (authz/scope/delegation) | 3–5 | — | n/a — System-actor consumer; no tenant slug/scope/delegation | — |
| no existing lead for `invitation_id` | 6 STATE | Doc-2 §10.5 (per-invitation lead) | a lead is created once per delivered invitation; a duplicate `invitation_id` is an idempotent no-op (dedup on event identity) | idempotent no-op (no error) |
| `invitation_id`/`rfq_id`/party UUIDs resolve | 7 REFERENCE | Doc-4A §4.5; DF-1/DF-2/DF-3 | references validated by the owning services (RFQ/Identity/Marketplace) | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |

> **Implementation note (no local BUSINESS validation).** `VendorInvited` is produced only after invitation delivery per RFQ authority (Doc-2 §8/§10.5; `VendorInvited` fires only at invitation `delivered`; undelivered `selected`/`deferred` never create a lead). No additional local BUSINESS validation exists. Idempotency and event identity remain the local guards (§6/§10, dedup on `invitation_id`).

**5. Authorization Matrix** — Actor **System** (Phase-2 inbound consumer) · Slug **none** (System actor; no active org context — Doc-4A §5.2/§15.5) · Scope = n/a (consumer effect on Operations' own `vendor_leads`) · Delegation **not eligible** · Enforcement: Phase-2 origin attribution (Doc-4A §15.5); the consumer effect is limited to Operations' own entity (Doc-4A §16.7/§4.3).

**6. State Machine Enforcement** — Allowed source states **none** (creation) · Target **`received`** (Doc-2 §3.5 entry) · Forbidden: a lead already existing for `invitation_id` → idempotent no-op · Concurrency: **dedup on the inbound `VendorInvited` event identity / `invitation_id`** (at-least-once delivery absorbed).

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** — Doc-2 §9 enumerates **no** `vendor_leads` create action (interim: nearest §9 action by pointer; channel Doc-2 §9 additive; **no action invented**) · Attribution **System** · Object scope the new `vendor_leads` row · Timing same transaction · Source Doc-2 §9 + Doc-4B `core.append_audit_record.v1`.

**8. Event Binding** — Emitted **none** (H.7 — BC-OPS-3 emits no domain event; the invitation event was RFQ's) · **Consumed `VendorInvited`** (producer: RFQ / Doc-4E, Doc-2 §8; trigger: RFQ invitation `→ delivered`; payload authority: Doc-2 §8 / Doc-4E; idempotency key: the inbound event identity / `invitation_id`) · the same event is independently co-consumed by Communication for fan-out (DF-7).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed event payload (missing/typed reference) → DLQ per outbox POLICY | false |
| `REFERENCE` | a payload reference does not resolve at its owning service (definitive negative) | false |
| `DEPENDENCY` | RFQ/Identity/Marketplace/Doc-4B service transiently unavailable / no definitive answer (retry per outbox retry POLICY) | true |
| `SYSTEM` | unexpected failure | true |

**Error Boundary block (Doc-4A §12.4/§12.6):** System-actor consumer; no tenant caller, so no protected-fact disclosure question arises at this surface. `REFERENCE` (definitive) and `DEPENDENCY` (transient) are distinct (H.4). `Timing-Uniformity`: not applicable.

**10. Idempotency Rules** — inherently idempotent (Doc-4A §14 / §16.7): **dedup on the inbound `VendorInvited` event identity / `invitation_id`** — a replayed event creates **no** duplicate lead and **no** duplicate audit; at-least-once delivery is expected and absorbed. A replayed `VendorInvited` for an existing `invitation_id` is an **idempotent no-op** — **never `CONFLICT`, never a `BUSINESS` failure** (dedup on event identity, Doc-4A §16.7; consistent with the FROZEN Part-2 P-03 / Doc-4A §14.6 convention).

**11. Cross-Module References** — **RFQ (DF-3):** consumes `VendorInvited`; references `rfq_id`/`invitation_id` by UUID; **owns no RFQ/quotation/matching/routing/award** (consumer-only). **Identity (DF-1):** `controlling_organization_id` resolution (read-only). **Marketplace (DF-2):** `vendor_profile_id` existence (read-only). **Communication (DF-7):** independently consumes the same `VendorInvited` for fan-out (authored by Communication, not here). **Platform Core (DF-8):** audit-write, outbox dispatch (inbound delivery).

**12. AI-Agent Implementation Notes** — the lead is created **only** at invitation `delivered` (Doc-2 §8 — `VendorInvited` never fires on `selected`/`deferred`; undelivered/withheld invitations leave **no** lead and **no** trace — a non-disclosure guarantee, H.9); **idempotent on `invitation_id`** (no duplicate on replay); the Operations consumer is **independent** of the Communication consumer (neither depends on the other). **Consumer-only:** never assume RFQ/routing/award ownership; `rfq_id`/`vendor_profile_id`/`invitation_id` are bare UUIDs (DF-3/DF-2), never re-modeled.

---

## §F6.2 — `ops.update_lead_stage.v1` — Advance Lead Pipeline Stage

**1. Contract Metadata** — Contract ID `ops.update_lead_stage.v1` · Template **21.4 Command** · Owned aggregate **Vendor Lead** (`vendor_leads` AR) · Authority: Doc-2 §3.5/§10.5 (`vendor_leads` machine) · Actor types **User** (vendor controlling org; or §6B representative) · BC-OPS-3 (§F6).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `vendor_lead_id` | `uuid` | yes | no | 1 | target lead |
| `expected_stage` | `enum<received\|quoted\|negotiation\|won\|lost\|follow_up>` | yes | no | 1 | optimistic-concurrency assertion of current stage (H.5) |
| `target_stage` | `enum<received\|quoted\|negotiation\|won\|lost\|follow_up>` | yes | no | 1 | the requested next stage (Doc-2 §3.5) |
| `value_estimate` | `numeric` | no | yes | 1 | Doc-2 §10.5 `value_estimate` |
| `next_action_at` | `timestamptz` | no | yes | 1 | Doc-2 §10.5 `next_action_at` |

**3. Response Schema** — `vendor_lead_id : uuid (1)`, `stage : enum<received|quoted|negotiation|won|lost|follow_up> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `vendor_lead_id`, `expected_stage`, `target_stage` | 1 SYNTAX | Doc-4A §9 | presence/type; stages ∈ frozen enum | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active org is a vendor controlling org | `AUTHORIZATION` |
| `can_manage_leads` | 3 AUTHZ | Doc-2 §7 | membership holds slug | `AUTHORIZATION` |
| lead controlling-org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org = the lead's `controlling_organization_id` | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | where the actor org is a representative, the §6B grant covers the action | `AUTHORIZATION` / `NOT_FOUND` (per §12.4) |
| transition legal (state) | 6 STATE | Doc-2 §3.5 | `target_stage` reachable from current per `received → quoted → negotiation → won | lost → follow_up` (lifecycle legality checked first) | `STATE` |
| stage match (concurrency) | 6 STATE → concurrency sub-check | Doc-4A §14 | after lifecycle legality passes, optimistic-concurrency: `expected_stage` = current stage | `CONFLICT` |
| (reference/business/policy) | 7–9 | Doc-2 §3.5 | none beyond the machine | — |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_leads`** (Doc-2 §7) · Scope = the lead's vendor controlling org (`controlling_organization_id`) · Delegation **eligible** (§6B) for a vendor representative · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed transitions (Doc-2 §3.5): `received → quoted`, `quoted → negotiation`, `negotiation → won`, `negotiation → lost`, and `→ follow_up` per the frozen machine (`won | lost → follow_up`) · Target one of `quoted|negotiation|won|lost|follow_up` · **Forbidden:** any non-corpus edge → `STATE`; the brief's `assigned`/`viewed`/`contacted`/`responded`/`converted`/`rejected`/`expired` are **not** stages (H.5) · Concurrency: optimistic on `expected_stage`; lost race → `CONFLICT`.

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** (Doc-2 §9 enumerates no `vendor_leads` stage-change action; nearest §9 action by pointer; channel Doc-2 §9 additive; **no action invented**) · Attribution **User** · Object scope the `vendor_leads` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7 — no Doc-2 §8 operations event for lead stage changes; state + audit only) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad stage enum) | false |
| `AUTHORIZATION` | context/slug/delegation fail (vendor actor) | false |
| `NOT_FOUND` | active org is not the lead's controlling org (protected-fact collapse, H.9) | false |
| `STATE` | illegal stage transition | false |
| `CONFLICT` | `expected_stage` ≠ current (lost race) | true (re-read then retry) |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a lead outside the caller's controlling org is `NOT_FOUND`, never `AUTHORIZATION`. `V5 (delegation) : NOT_FOUND | AUTHORIZATION | collapse-rule` per §12.4. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-OPS-POLICY]`); `expected_stage` makes retries safe (a replayed transition already applied returns the same stage; a stale assertion → `CONFLICT`). Replay within window → one transition, **no duplicate audit**.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + §6B delegation resolution. The lead `stage` is **vendor-private CRM** — it does **not** affect RFQ/quotation/award state (DF-3) and is **not** a governance signal (§4B firewall). **Platform Core (DF-8):** audit-write.

**12. AI-Agent Implementation Notes** — the lead pipeline is **vendor-side CRM only** — advancing a lead never mutates an RFQ, quotation, routing decision, or award (DF-3); **`won`/`lost` here is the vendor's private pipeline outcome, NOT the RFQ award decision** (RFQ owns award — Doc-4E). Honor the Doc-2 §3.5 stage machine verbatim; never introduce a non-corpus stage. Controlling-org scope only; collapse to `NOT_FOUND` for non-owners.

---

## §F6.3 — `ops.add_lead_activity.v1` — Log Lead Activity

**1. Contract Metadata** — Contract ID `ops.add_lead_activity.v1` · Template **21.4 Command** · Owned child **`lead_activities`** (append-only child of the Vendor Lead AR) · Authority: Doc-2 §3.5/§10.5 (`lead_activities` append-only) · Actor types **User** (vendor controlling org; or §6B representative) · BC-OPS-3 (§F6).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `vendor_lead_id` | `uuid` | yes | no | 1 | parent lead |
| `activity_jsonb` | `jsonb` | yes | no | 1 | activity content (shape = dev-doc scope); `actor_user_id` captured server-side (Doc-2 §10.5) |

**3. Response Schema** — `activity_id : uuid (1)`, `vendor_lead_id : uuid (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `vendor_lead_id`, `activity_jsonb` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; vendor controlling-org context | `AUTHORIZATION` |
| `can_manage_leads` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| lead controlling-org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | active org = the parent lead's `controlling_organization_id` | `NOT_FOUND` (collapse, H.9) |
| (delegation) | 5 DELEGATION | Doc-4A §6B | vendor representative via §6B grant where applicable | `AUTHORIZATION`/`NOT_FOUND` |
| parent-stage applicability | 6 STATE | Doc-2 §10.5 | `lead_activities` is append-only; Doc-2 authority defines **no** parent-lead-stage restriction — no lead-stage validation applies (an activity may be logged in any `vendor_leads` stage) | — (no failure outcome) |
| parent lead exists | 7 REFERENCE | Doc-4A §4.5 (in-aggregate) | the parent `vendor_leads` row resolves within the controlling org | `NOT_FOUND` (collapse) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_leads`** (Doc-2 §7) · Scope = the parent lead's vendor controlling org · Delegation **eligible** (§6B) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — `lead_activities` is **append-only** (Doc-2 §10.5 — no lifecycle) · Forbidden: mutating/deleting a logged activity → not an authorized operation (append-only) · Concurrency: append is additive (no row-revision race).

**7. Audit Binding** — Action **`[ESC-OPS-AUDIT]`** (Doc-2 §9 enumerates no `lead_activities` action; nearest §9 action by pointer; channel Doc-2 §9 additive; **no action invented**) · Attribution **User** · Object scope the `lead_activities` row + parent lead ref · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (H.7) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | context/slug/delegation fail (vendor actor) | false |
| `NOT_FOUND` | active org not the parent lead's controlling org (collapse, H.9) | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule`; `V7 (reference) : NOT_FOUND | collapse-rule` — a parent lead outside the caller's controlling org is `NOT_FOUND`. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required`; replay within window → one activity row, no duplicate audit. (Append-only; a genuinely new activity is a new row by design, Doc-2 §10.5.)

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + delegation. **Platform Core (DF-8):** audit-write. No event; no Trust/RFQ/Marketplace mutation.

**12. AI-Agent Implementation Notes** — **append-only** — never mutate or delete a logged activity (Doc-2 §10.5); `actor_user_id` is captured server-side. Controlling-org scope only; collapse to `NOT_FOUND` for non-owners.

---

## §F6.4 — `ops.get_lead.v1` · `ops.list_leads.v1` — Vendor Lead Reads

**1. Contract Metadata** — Contract IDs `ops.get_lead.v1`, `ops.list_leads.v1` · Template **21.3 Query** · Reads over `vendor_leads`(+`lead_activities`) · Authority: Doc-2 §6/§10.5 (vendor-side tenancy; RLS) · Actor types **User** (vendor controlling org; or §6B representative) · BC-OPS-3 (§F6).

**2. Request Schema** — *`get_lead`:* `vendor_lead_id : uuid (1, required)`. *`list_leads`:* `filter : object{ stage?, has_next_action? } (0..1, nullable; allowlisted fields only, Doc-4A §9.6)`; `page_size : numeric (0..1)` (bounded by POLICY key §18 — `[ESC-OPS-POLICY]`; default by POLICY key); `page_token : string (0..1, nullable)` (Doc-4A §22.3).

**3. Response Schema** — *`get_lead`:* `lead : object{ vendor_lead_id, stage, value_estimate, next_action_at, rfq_id, invitation_id, vendor_profile_id }`, `activities : list<object{ activity_id, activity_jsonb, actor_user_id }>`, `reference_id`. *`list_leads`:* `items : list<object{ vendor_lead_id, stage, next_action_at }>`, `next_page_token : string (0..1)`, `reference_id`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| typed fields / filter | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5 | User; vendor controlling-org context | `AUTHORIZATION` |
| `can_manage_leads` | 3 AUTHZ | Doc-2 §7 | slug held (lead read under the lead slug; **no separate read slug in Doc-2 §7** — carry `[ESC-OPS-SLUG]` only if a distinct read slug is later required) | `AUTHORIZATION` |
| lead controlling-org scope | 4 SCOPE | Doc-4A §7.3; §7.5 | **`get_lead`:** the target lead belongs to the active controlling org (else `NOT_FOUND` collapse). **`list_leads`:** results are restricted to the active `controlling_organization_id` through RLS enforcement (only the caller's own leads are enumerated; no cross-tenant row appears) | `NOT_FOUND` (collapse, H.9) — get; scoped result set — list |
| `page_size` bound | 9 POLICY | Doc-4A §18 | within POLICY bound (`[ESC-OPS-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_manage_leads`** (Doc-2 §7) · Scope = **own vendor controlling org only** · Delegation **eligible** (§6B, vendor representative read) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — None (read).

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Emitted **none** · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter/sort field; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (vendor actor) | false |
| `NOT_FOUND` | lead(s) not owned by the active controlling org (collapse, H.9) | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a lead outside the caller's controlling org is `NOT_FOUND`; `list` returns **only** the caller's own-controlling-org leads, never another vendor's. **The lead surface never discloses routing decisions, competitor activity, ranking/matching signals, or other invited vendors** (H.9; Doc-2 §10.11; §7.5) — `rfq_id`/`invitation_id` are opaque UUIDs, not a window into RFQ data. `Timing-Uniformity`: not-owned / not-exist identical.

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure queries, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3.

**11. Cross-Module References** — **Identity (DF-1):** context + `check_permission` + §6B delegation resolution. **RFQ (DF-3):** `rfq_id`/`invitation_id` are bare UUIDs; **any RFQ detail beyond the vendor's grant is NOT read here** (RFQ owns RFQ reads — Doc-4E grantee-scoped). **Platform Core (DF-8):** none beyond read infrastructure. Non-disclosure (H.9): own controlling-org only.

**12. AI-Agent Implementation Notes** — strictly **own controlling-org** leads; never cross-tenant; the `list` surface enumerates only the caller's leads. The lead **references the RFQ by UUID but is not a window into RFQ-owned data** (DF-3) — never resolve routing/ranking/competitor/award detail through it (non-disclosure, H.9). No separate read slug exists (Doc-2 §7) — bind `can_manage_leads`.

---

## Appendix A — BC-OPS-3 Contract Register (Pass-B Part 3)

| § | Contract-ID(s) | Template | Owned entity (Doc-2) | Actor | Emits event | Consumes event | Audit (Doc-2 §9) |
|---|---|---|---|---|---|---|---|
| §F6.1 | `ops.create_lead_on_invitation.v1` | 21.5 | `vendor_leads` | System | none | `VendorInvited` (RFQ) | `[ESC-OPS-AUDIT]` |
| §F6.2 | `ops.update_lead_stage.v1` | 21.4 | `vendor_leads` | User | none | none | `[ESC-OPS-AUDIT]` |
| §F6.3 | `ops.add_lead_activity.v1` | 21.4 | `lead_activities` | User | none | none | `[ESC-OPS-AUDIT]` |
| §F6.4 | `ops.get_lead.v1` · `ops.list_leads.v1` | 21.3 | Vendor Lead | User | none | none | none (read) |

**Part-3 invariants (held):** BC-OPS-3 owns exactly one aggregate (Vendor Lead: `vendor_leads` + `lead_activities`); **emits zero domain events** (state + audit only — Doc-2 §8; Pass-A §F11); **consumes `VendorInvited` only** (System actor, idempotent on `invitation_id`, co-consumed independently by Communication — DF-7); binds the single Doc-2 §7 slug `can_manage_leads` (no slug invented); **every mutation carries `[ESC-OPS-AUDIT]`** (Doc-2 §9 enumerates no vendor-lead action; no action invented); carries `[ESC-OPS-POLICY]` for dedup-window/page-size keys; owns **no** RFQ/quotation/matching/routing/ranking/award (DF-3) and **no** vendor discovery/profiles/attributes (DF-2) — referenced by UUID only; the lead machine is exactly `received/quoted/negotiation/won/lost/follow_up` — **no `assigned`/`viewed`/`contacted`/`responded`/`converted`/`rejected`/`expired` state invented**; the non-disclosure invariant (vendor cannot infer routing/competitor/ranking/deferral) is enforced on every surface. **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

---

## Appendix B — Carried Markers (Part 3; unchanged)

- **DF-1** (Identity — `check_permission`/org-context/§6B delegation, consumed), **DF-2** (Marketplace — `vendor_profile_id` existence, read-only; owns vendor discovery/profiles/attributes), **DF-3** (RFQ — consumes `VendorInvited`; owns matching/routing/ranking/quotation/evaluation/selection/award; referenced by UUID only), **DF-7** (Communication — independently consumes the same `VendorInvited` for fan-out; authored there), **DF-8** (Platform Core — audit-write, outbox dispatch).
- **`[ESC-OPS-AUDIT]`** (Doc-2 §9 additive) — **every** BC-OPS-3 mutation (lead create, stage change, activity append): Doc-2 §9 enumerates no `vendor_leads`/`lead_activities` action; nearest §9 action bound by pointer; no action invented.
- **`[ESC-OPS-POLICY]`** (Doc-3 §12.2 additive) — idempotency dedup-window key and list `page_size` bound (no `operations` POLICY namespace registered; platform default referenced by name; no key invented).
- **`[ESC-OPS-SLUG]`** (Doc-2 §7 additive) — only if a distinct lead **read** slug is later required (current reads bind `can_manage_leads`).

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4F — Pass-B (Hardening) Part 3 v1.0 — BC-OPS-3 Vendor Lead Pipeline. Authored against `Doc-4F_Content_v1.0_PassA_FROZEN.md` §F6 (sole contract authority) and `Doc-4F_Structure_v1.0_FROZEN.md`. Hardens the §F6 contracts to implementation grade (field-level schemas, Doc-4A §11.2 nine-stage validation matrices, authorization matrices, state-machine enforcement, audit bindings, event bindings, error registers with §12.4 Error Boundary blocks + REFERENCE/DEPENDENCY separation, idempotency) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. BC-OPS-3 owns one aggregate (Vendor Lead); emits no domain event; consumes `VendorInvited` (DF-3, System actor, idempotent on `invitation_id`, co-consumed by Communication — DF-7) to create the lead, owning no RFQ/quotation/matching/routing/ranking/award; the lead machine is exactly `received/quoted/negotiation/won/lost/follow_up` (no brief-candidate state invented); the post-routing seam, procurement moat, Marketplace boundary, Trust firewall, and non-disclosure invariant (vendor cannot infer routing/competitor/ranking) are preserved; nothing invented. Carried markers DF-1/DF-2/DF-3/DF-7/DF-8, `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN.*
