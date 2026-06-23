# Doc-4E — RFQ Procurement Engine — Content v1.0, Pass-B (Hardening) — Part 3 of 5

## BC-3 Routing, Selection & Distribution + BC-7 Routing Governance & Control Plane Hardening (§E6)

| Field | Value |
|---|---|
| Document | Doc-4E Content v1.0 — **Pass-B (hardening), Part 3 of 5** — Module 3 RFQ Procurement Engine (`rfq` schema) |
| Part scope | **BC-3 (Routing/Selection/Distribution) + BC-7 (Routing Governance & Control Plane), §E6** — the 8 contracts of `Doc-4E_PassA_v1.0_FROZEN` §E6, hardened to implementation grade |
| Lifecycle step | Content Pass-B authoring → (next) Independent Hard Review → Pass-B Patch → Patch Verification → Freeze Audit → FROZEN |
| Contract authority | `Doc-4E_PassA_v1.0_FROZEN.md` (sole contract authority; **not revisited, not redesigned, not reopened**) |
| Frozen precedents | `Doc-4E_Structure_v1.0_FROZEN`; `Doc-4E_PassB_Part1_v1.0_FROZEN`; `Doc-4E_PassB_Part2_v1.0_FROZEN` (Parts 1–2 frozen; not reopened) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1_v1.0_FROZEN, Doc-4E_PassB_Part2_v1.0_FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-1 RFQ Lifecycle (FROZEN) · Part 2 — BC-2 Matching Pipeline (FROZEN) · **Part 3 — BC-3+BC-7 Routing & Governance** · Part 4 — BC-4 Quotation Management · Part 5 — BC-5+BC-6 Evaluation, Comparison, Award |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 3).** Convert the 8 Pass-A BC-3/BC-7 contracts into **implementation-grade** contracts at the depth established in Parts 1–2: field-level schemas, validation matrices on the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement, audit/event bindings, error registers (Doc-4A §12 closed class set), idempotency. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. **The selection/fairness/wave/throttle/capacity math is owned by Doc-3 §3.3–§3.6/§4/§5/§7 and bound by pointer — never re-derived.** **Routing, invitation, fairness, and supplier-selection ownership remain RFQ's** (Module 3); Marketplace acquires **no** routing authority. Carried dependencies **DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 3.

**Slug-authority note (carried, not invented).** Doc-2 §7 enumerates platform-staff slugs (`staff_can_moderate_rfq`, `staff_can_verify`, `staff_can_support`, `staff_can_ban`, `staff_can_manage_categories`, `staff_can_redact_audit`, `staff_super_admin`) but **no dedicated routing-rule or human-assisted-routing slug**. Per Pass-A §E6 (which bound these to generic **§5.6 platform-staff** authority, not a specific slug) and the never-invent rule, `rfq.assist_routing.v1` and `rfq.manage_routing_rule.v1` bind to **§5.6 platform-staff context** with **`staff_super_admin`** as the nearest enumerated platform-governance authority (every action audited+flagged, Doc-2 §7); a dedicated least-privilege routing-governance slug is a **future Doc-2 §7 additive** carried under **`[ESC-RFQ-POLICY]`-adjacent escalation `[ESC-RFQ-SLUG]`** (Doc-2 §7 additive channel) — **no slug invented here**. This mirrors the Doc-4C `[ESC-IDN-SLUG]` / Doc-4D `staff_can_ban`-nearest-slug pattern.

**BC-3/BC-7 character (templates).** Three **21.5 System** (`Response: none`): `assemble_and_route_wave`, `replenish_wave`, `drain_deferred_queue`. One **21.4 Command**: `respond_to_invitation` (vendor). Two **21.6 Admin** (§5.6 platform governance): `assist_routing`, `manage_routing_rule`. Three **21.3 Query** (bundled in one §E6 record): `get_routing_log`, `get_invitation`, `list_invitations`. **FIXED invariants binding every BC-3/BC-7 contract:** no public RFQ board (RFQs distributed, never published — Doc-3 §5.1); selection never always-same and never pure-random (Doc-3 §3.3); vendor self-throttle never penalized (Doc-3 §4.1); deferral invisible to the buyer (Doc-3 §4.2); human-assist may never bypass blacklist/eligibility/verification/trust (Doc-3 §3.6/§0.1.1 forbidden-actions wall); `VendorInvited` fires only at invitation `delivered` (Doc-2 §8/§10.4); the non-disclosure invariant on every surface (Doc-2 §10.11; §7.5); the governance-signal firewall — no plan/entitlement gates routing fairness or selection (Doc-4A §4B; Doc-3 §11.8/§12.1).

---

## §H — Part-3 Hardening Conventions (stated once; bound by pointer per contract)

Identical convention basis to Part 1/Part 2 §H (reference-never-restate, Doc-4A §0.3). Per-contract records reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. For **21.5 System** contracts, stages 2–5 collapse to a single **trigger-authenticity** check (invoked only by the platform scheduler/pipeline or a verified inbound event — never a tenant); semantic stages (6–9) carry the weight. For **21.4 Command** (`respond_to_invitation`) and **21.6 Admin**, all applicable stages are populated.
- **H.2 — Field type vocabulary.** As Parts 1–2: `uuid`, `enum<…>`, `numeric`, `jsonb` (presence/shape boundary only), `timestamptz`, `bool`, `uuid[]` (cardinality stated). **Required/nullable/cardinality** and a **source authority** per field.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** System contracts: no slug (system actor). `respond_to_invitation`: vendor slug **`can_respond_to_rfq`** (Doc-2 §7) + §6B delegation grant for representative orgs. Admin contracts: **§5.6 platform-staff context**, nearest slug `staff_super_admin` (slug-authority note above; `[ESC-RFQ-SLUG]` carried). Enforcement source = Identity `check_permission` (Doc-4C §C3/§C8). No slug invented.
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`; codes `rfq_<domain>_<code>` (integer at dev-doc stage). Protected-fact failures → `NOT_FOUND` collapse (§7.5). The **forbidden-action attempt** in human-assist maps to `BUSINESS` (`retryable:false`) — a rule violation, not an authZ failure.
- **H.5 — State machine (Doc-2 §3.4 invitation lifecycle; §5.4 RFQ; Doc-4A §13).** The **invitation lifecycle** `draft → selected → deferred → delivered → accepted | declined | expired` (Doc-2 §3.4) is **owned by BC-3** — its transitions are enforced here. The RFQ-head transition a deliverable wave drives, **`matching → vendors_notified`** (Doc-2 §5.4), is **owned by the wave-routing contract (§E6.1)** — stated explicitly. Other RFQ transitions are Part-1-owned (`expire_rfq`) or later-part-owned and are not touched. `routing_rules` carries a simple lifecycle (Doc-2 §3.4); `rfq_routing_log` is append-only. **No edge invented.**
- **H.6 — Audit (Doc-2 §9 RFQ domain via Doc-4B `core.append_audit_record.v1`).** BC-3 audit actions: **"routing run (mode, filter reference)"** (recorded in `rfq_routing_log`) and the invitation transitions **`InvitationDelivered` / `InvitationAccepted` / `InvitationDeclined` / `InvitationExpired`** (Doc-2 §9). BC-7 routing-rule changes audit as **Platform "system_configuration change"** where they bind POLICY (Doc-2 §9). Attribution per actor (System/User/Admin). Reads not audited (§17.1). `rfq_routing_log` **never stores vendor-visible blacklist traces** (Doc-2 §10.4). The `incremental_rematch` flag (Part 2) and any human-assist annotation carry **`[ESC-RFQ-AUDIT]`** where not separately enumerated (interim nearest-§9 pointer; no action invented).
- **H.7 — Events (Doc-2 §8 RFQ catalog via Doc-4B outbox-write).** Emitted: `RFQRouted` (PATCH-06) and `VendorInvited` (**only** at invitation `delivered` — never on `selected`/`deferred`, Doc-2 §8/§10.4). Consumed: none directly in BC-3/BC-7 (the pipeline/signal consumers are BC-2). `VendorInvited` → Communication dispatch (DE-6) + Operations `vendor_leads` (DE-4) are the **consumers'** legs (single-authorship; not authored here). **No event coined** (§16.4).
- **H.8 — Idempotency (Doc-4A §14).** System contracts inherently idempotent (re-fire safe): a replay produces the same invitation/`matching_results`/`rfq_routing_log` state with no duplicate `VendorInvited`/audit. `respond_to_invitation` carries `Idempotency: required` + dedup window (POLICY); replay → same invitation state, no duplicate. Admin mutations (`manage_routing_rule`) carry `Idempotency: required`. Queries are side-effect-free.
- **H.9 — Field source (Doc-2 §10.4).** `rfq_invitations` (`state(draft/selected/deferred/delivered/accepted/declined/expired)`, `throttle_window`, `delivered_at`, `responded_at`; `UNIQUE(rfq_id, vendor_profile_id)`; undelivered excluded from response-rate inputs; `VendorInvited` only at `delivered`); `rfq_invitation_grantees` (`access_type(controlling_org/representative_org)`; materialized at delivery; the vendor-side RLS anchor; rows removed on delegation-grant revocation, removal audited); `rfq_document_grants` (per-org spec-doc access; written at delivery; removal audited); `routing_rules` (rule definitions; params from `core.system_configuration`); `rfq_routing_log` (`routing_mode`, `pipeline_counts_jsonb`, `executed_at`; never blacklist traces). **Pass-B introduces no column.**
- **H.10 — Moat, fairness & firewall (Architecture §1.5; Doc-4A §4B; Doc-3 §3.3/§11.8/§12.1; DE-2/DE-3).** **Routing, invitation, fairness, and supplier-selection are RFQ-owned** (Doc-3 §3/§5/§7, bound by pointer) — **Marketplace acquires no routing authority** (it supplies vendor data read-only via DE-2). Selection permanently balances buyer-outcome quality, vendor fairness, marketplace growth, capacity utilization (Doc-3 §3.3 FIXED). **No governance signal is mutated; no paid plan / entitlement / flag gates eligibility, verification, routing fairness, matching confidence, or selection** (§4B; Doc-3 §11.8/§12.1) — payment may influence lead **volume**/visibility products only, never fairness or rank. The non-disclosure invariant binds every surface (deferral + blacklist exclusion indistinguishable from non-match; `rfq_routing_log` discloses per disclosure rules only — Doc-2 §10.11; §7.5).

---

## §E6.1 — `rfq.assemble_and_route_wave.v1` — Selection, Throttling & Wave Routing

**1. Contract Metadata** — Contract ID `rfq.assemble_and_route_wave.v1` · Template **21.5 System** (`Response: none`) · Owned aggregate **RFQ Invitation** (`rfq_invitations` + `rfq_invitation_grantees` + `rfq_document_grants`) + writes `rfq_routing_log` · Actor **System** (async; first wave at routing completion) · Bounded context **BC-3** (§E6).

**2. Request Schema** *(internal trigger; no tenant request body — Template 21.5)*

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 (`rfq_invitations → rfqs`) |
| `rfq_version_id` | `uuid` | yes | no | 1 | Doc-2 §10.4; Doc-3 §3.1 (wave for the current version) |
| `wave_params` | `jsonb` | no | yes | 0..1 | Doc-3 §5.2 (`target_quotes`/`expected_rr`/clamps resolved from POLICY) |

**3. Response Schema** — **none** (Template 21.5). Side effects: writes `rfq_invitations` (Phase D–F selection→throttle→route), materializes `rfq_invitation_grantees` + `rfq_document_grants` at delivery; writes `rfq_routing_log`; emits `RFQRouted` + per-delivered `VendorInvited`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `rfq_version_id` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` (internal) |
| trigger authenticity | 2–5 (collapsed) | Doc-4A §5.6; H.3 | invoked only by the routing pipeline (no tenant) | `AUTHORIZATION` (internal) |
| RFQ state = `matching` | 6 STATE | Doc-2 §5.4; Doc-3 §3.1 | wave routed only from `matching` | `STATE` (no-op otherwise) |
| `matching_results` present | 7 REFERENCE | Doc-2 §10.4 | a scored candidate set exists for the version | `STATE`/no-op (empty pool → coverage path, not error) |
| selection & fair distribution | 8 BUSINESS | Doc-3 §3.3/§3.1 D | equivalence-band LRR rotation; exposure ceiling/ratio; probation allocation; anti-starvation; salted tie-break | — |
| capacity throttle | 8 BUSINESS | Doc-3 §4 | per-vendor metering; A7-exhausted vendors deferred not excluded; self-throttle honored | — |
| relevance floor | 8 BUSINESS | Doc-3 §5.5 | never deliver below the relevance floor even if the wave is short | — |
| runway | 8 BUSINESS | Doc-3 §4.2 | never deliver sub-min-runway (POLICY `capacity.min_response_runway_hours`) | — |
| wave-size / per-buyer / fairness limits | 9 POLICY | Doc-3 §12.2 (`distribution.*`, `fairness.*`, `routing.probation_share`) | thresholds resolved by key | — |

**5. Authorization Matrix** — Actor **System** · Slug **none** (system actor, §5.6) · Scope platform/internal · Delegation n/a · Enforcement: routing-pipeline provenance (H.3).

**6. State Machine Enforcement** — RFQ **state precondition** `matching`; **this contract OWNS the `matching → vendors_notified` transition** on the first delivered wave (Doc-2 §5.4) · `rfq_invitations` advance `draft → selected → deferred → delivered` (Doc-2 §3.4) · Forbidden: routing outside `matching` → no-op; deferral never blocks wave fill (Doc-3 §4.2 FIXED) · Concurrency: single wave-assembly per (RFQ, version) generation; grantee/doc-grant rows materialized atomically with delivery; `UNIQUE(rfq_id, vendor_profile_id)` enforces one invitation per vendor ever. **No edge invented** (the `matching → vendors_notified` edge is the existing Doc-2 §5.4 edge).

**7. Audit Binding** — Action **Doc-2 §9 RFQ "routing run (mode, filter reference)"** (in `rfq_routing_log`) + invitation **`InvitationDelivered`** per delivered row · Attribution **System** · Object scope `rfq_routing_log` + `rfq_invitations`/grantee/doc-grant rows · Timing same transaction as delivery · Source Doc-2 §9 + Doc-4B. `rfq_routing_log` stores per-step in/out counts, **never blacklist traces** (Doc-2 §10.4).

**8. Event Binding** — Emitted **`RFQRouted`** (Doc-2 §8; PATCH-06) + **`VendorInvited`** per transition to `delivered` (Doc-2 §8 — never on `selected`/`deferred`) · Consumed none · Trigger: routing-pipeline completion · Idempotency: replay → same invitation set, one `VendorInvited` per delivered invitation, no duplicate.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `STATE` | RFQ not in `matching` / empty pool (no-op → coverage path) | n/a (system) |
| `DEPENDENCY` | Marketplace/Operations/Billing read or Doc-4B unavailable | true (backoff) |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — Inherently idempotent (Doc-4A §14): a re-fire reproduces the same selected/delivered invitation set (the `UNIQUE(rfq_id, vendor_profile_id)` index prevents duplicate invitations; `VendorInvited` fires once per delivery), with no duplicate `rfq_routing_log` audit. Empty-pool is not an error (zero deliveries → coverage path, Doc-3 §11.4); terminal disposition is `rfq.expire_rfq.v1`'s (Part 1).

**11. Cross-Module References** — **Marketplace (DE-2):** read vendor attrs (already scored in BC-2; re-read only as needed) — read-only, no routing authority transferred. **Operations (DE-4):** `VendorInvited` → Operations creates `vendor_leads` (consumer leg, not authored here); buyer CRM floor read under non-disclosure. **Communication (DE-6):** `VendorInvited` → notification dispatch (consumer leg). **Identity (DE-1):** grantee materialization resolves controlling org + active delegation grants → representative orgs (consumed). **Billing (DE-7):** read intake quota ceiling; `buyer_directed`-flagged invitations excluded from valid-lead/guarantee/fairness/wave accounting (Doc-3 §2.11 + PATCH-D3-02). **Platform Core (DE-8):** audit-write, outbox-write, POLICY read. **Firewall:** all reads; no signal mutated; no plan gates fairness/selection (§4B).

**12. AI-Agent Implementation Notes** — Selection doctrine is **FIXED** (Doc-3 §3.3): equivalence-band rotation + exposure ceiling/ratio + anti-starvation + salted tie-break — **never always-same, never pure-random**. **Deferral is invisible to the buyer** (Doc-3 §4.2) and never blocks the wave from filling. **Never deliver below the relevance floor** (Doc-3 §5.5) or sub-runway (Doc-3 §4.2). `VendorInvited` fires **only** at `delivered`. Grantee rows are the vendor-side RLS anchor — materialize them atomically at delivery (Doc-2 §10.4). **Routing authority stays in RFQ** — Marketplace supplies data only (DE-2); never let payment/plan influence selection (§4B).

---

## §E6.2 — `rfq.replenish_wave.v1` — Replenishment Wave

**1. Contract Metadata** — Contract ID `rfq.replenish_wave.v1` · Template **21.5 System** (`Response: none`) · Owned aggregate **RFQ Invitation** (appends `rfq_invitations` + grantee/doc-grant rows) + `rfq_routing_log` · Actor **System** (checkpoint timer) · Bounded context **BC-3** (§E6).

**2. Request Schema** *(internal timer trigger; no tenant request body)*

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 |
| `checkpoint` | `enum<scheduled>` | yes | no | 1 | Doc-3 §5.3 (POLICY `distribution.replenish_check_hours`) |

**3. Response Schema** — **none** (Template 21.5). Side effects: appends `rfq_invitations` for next-band vendors (incl. drained deferred queues); writes `rfq_routing_log`; emits per-delivered `VendorInvited`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `checkpoint` | 1 SYNTAX | Doc-4A §9 | presence/type/enum | `VALIDATION` (internal) |
| trigger authenticity | 2–5 (collapsed) | Doc-4A §5.6; H.3 | invoked only by the checkpoint scheduler | `AUTHORIZATION` (internal) |
| RFQ open (pre-terminal, window live) | 6 STATE | Doc-2 §5.4; Doc-3 §5.3 | RFQ ∈ {`vendors_notified`,`quotations_received`} with live window | `STATE` (no-op otherwise) |
| projected quotes < target | 8 BUSINESS | Doc-3 §5.3 | replenish only when projection below target (declines+expiries+silence) | — (no-op if target met) |
| stop conditions | 8 BUSINESS | Doc-3 §5.3 | stop when target met / pool exhausted / remaining window < min runway | — |
| relevance floor / runway / fairness | 8–9 | Doc-3 §5.5/§4.2/§3.3/§12.2 | same floors as the initial wave | — |

**5. Authorization Matrix** — Actor **System** · Slug **none** · Scope platform/internal · Delegation n/a · Enforcement: checkpoint-scheduler provenance.

**6. State Machine Enforcement** — RFQ **state precondition** `vendors_notified`/`quotations_received` (window live) · Target: **no RFQ-head transition** (stays in its current state) · `rfq_invitations` new rows `→ delivered` (Doc-2 §3.4) · Forbidden: replenishing a terminal/closed-window RFQ → no-op · Concurrency: idempotent append; the `UNIQUE` index prevents re-inviting an already-invited vendor. **No edge invented.**

**7. Audit Binding** — Action **Doc-2 §9 RFQ "routing run"** + **`InvitationDelivered`** per delivered row · Attribution **System** · Object scope `rfq_routing_log` + new `rfq_invitations`/grantee rows · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`VendorInvited`** per newly-delivered invitation (Doc-2 §8) · (Re-emits `RFQRouted` per replenishment run where applicable, PATCH-06) · Consumed none · Trigger: checkpoint with projected quotes < target · Idempotency: replay → no duplicate invitations/events.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `STATE` | RFQ terminal/window closed (no-op) | n/a (system) |
| `DEPENDENCY` | service/Doc-4B unavailable | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — Inherently idempotent: a re-fire at the same checkpoint adds no duplicate invitations (UNIQUE index) and emits no duplicate `VendorInvited`/audit. Pool-exhausted + below-target → **honest buyer notification** (Communication, DE-6) with options (extend/widen/relax) — never silent failure, never fabricated activity (Doc-3 §5.3/§1.2 FIXED).

**11. Cross-Module References** — As §E6.1: **Identity (DE-1)** grantee resolution; **Operations (DE-4)** `vendor_leads` consumer + CRM floor; **Communication (DE-6)** dispatch + honest pool-exhausted notification; **Billing (DE-7)** quota; **Platform Core (DE-8)** audit/outbox/POLICY. **Firewall:** reads only; no plan gating (§4B).

**12. AI-Agent Implementation Notes** — Waves beat blast (Doc-3 §5.3) — replenish from the next band, drawing drained deferred queues, until target/pool/runway stops. **Pool-exhausted-below-target → honest notification, never silent failure or fake activity** (Doc-3 §5.3 FIXED). Same floors as the initial wave (relevance, runway, fairness). `VendorInvited` only at `delivered`.

---

## §E6.3 — `rfq.drain_deferred_queue.v1` — Deferred-Queue Drain (capacity recovery)

**1. Contract Metadata** — Contract ID `rfq.drain_deferred_queue.v1` · Template **21.5 System** (`Response: none`) · Owned aggregate **RFQ Invitation** (advances `rfq_invitations` `deferred → delivered`) · Actor **System** (slot-free trigger) · Bounded context **BC-3** (§E6).

**2. Request Schema** *(internal slot-free trigger; no tenant request body)*

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `vendor_profile_id` | `uuid` | yes | no | 1 | Doc-3 §4.3 (the vendor whose capacity slot freed) |
| `slot_free_cause` | `enum<response\|invitation_expiry\|rfq_terminal>` | yes | no | 1 | Doc-3 §4.3 (recovery causes) |

**3. Response Schema** — **none** (Template 21.5). Side effects: advances highest-priority deferred invitations to `delivered` (re-checking liveness + runway); emits per-delivered `VendorInvited`; or expires undelivered deferred rows if runway-starved.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `vendor_profile_id`, `slot_free_cause` | 1 SYNTAX | Doc-4A §9 | presence/type/enum | `VALIDATION` (internal) |
| trigger authenticity | 2–5 (collapsed) | Doc-4A §5.6; H.3 | invoked only on a capacity-slot-free event | `AUTHORIZATION` (internal) |
| freed slot exists | 6 STATE | Doc-3 §4.3 | a deferred invitation present for the vendor; active-capacity slot freed | `STATE` (no-op if none) |
| RFQ live + runway | 8 BUSINESS | Doc-3 §4.2/§4.3 | deliver only if RFQ live and runway ≥ min; else auto-expire undelivered | — |
| priority order | 8 BUSINESS | Doc-3 §4.2 | drain highest-priority first (window-end then confidence) | — |

**5. Authorization Matrix** — Actor **System** · Slug **none** · Scope platform/internal · Delegation n/a · Enforcement: slot-free-event provenance.

**6. State Machine Enforcement** — `rfq_invitations` `deferred → delivered` (Doc-2 §3.4); runway-starved deferred → `expired` (Doc-2 §3.4) · No RFQ-head transition · Forbidden: delivering a sub-runway invitation (manufactures non-response — Doc-3 §4.2 FIXED) · Concurrency: idempotent drain; one delivery per deferred row. **No edge invented.**

**7. Audit Binding** — Action **`InvitationDelivered`** (or **`InvitationExpired`** if runway-starved) (Doc-2 §9) · Attribution **System** · Object scope `rfq_invitations` rows · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`VendorInvited`** on delivery (Doc-2 §8) · Consumed none · Trigger: capacity slot frees (response/expiry/terminal — Doc-3 §4.3) · Idempotency: replay → no duplicate delivery/event.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `STATE` | no deferred invitation / no freed slot (no-op) | n/a (system) |
| `DEPENDENCY` | service/Doc-4B unavailable | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — Inherently idempotent: re-fire on an already-drained queue is a no-op (no duplicate delivery/`VendorInvited`/audit). Delivering an impossible deadline manufactures a non-response — **auto-expire undelivered rather than deliver sub-runway** (Doc-3 §4.2 FIXED).

**11. Cross-Module References** — **Communication (DE-6):** delivery dispatch (consumer leg). **Operations (DE-4):** `vendor_leads` on delivery (consumer leg). **Identity (DE-1):** grantee resolution. **Platform Core (DE-8):** audit/outbox. **Firewall:** self-throttling vendors are routed around, **never penalized** (Doc-3 §4.1) — no signal mutation.

**12. AI-Agent Implementation Notes** — Capacity is flow-control (Doc-3 §4): a freed slot drains the deferred queue **highest-priority-first**, re-checking RFQ liveness + runway before each delivery. **Auto-expire undelivered rather than deliver sub-runway** (Doc-3 §4.2 FIXED). Vendor self-throttle is a **good** signal — route around, never penalize (Doc-3 §4.1). `VendorInvited` only at `delivered`.

---

## §E6.4 — `rfq.respond_to_invitation.v1` — Invitation Response (accept / formal decline)

**1. Contract Metadata** — Contract ID `rfq.respond_to_invitation.v1` · Template **21.4 Command** · Owned aggregate **RFQ Invitation** (`rfq_invitations`, vendor-side via grantee rows) · Actor **User** (vendor controlling org; or representative via §6B delegation grant) · Bounded context **BC-3** (§E6).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `invitation_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 `rfq_invitations` |
| `decision` | `enum<accept\|decline>` | yes | no | 1 | Doc-3 §5.4/§8.4 |
| `decline_reason_code` | `enum<too_busy\|out_of_scope\|value_too_low\|geography\|other>` | no | yes (required iff decline) | 0..1 | Doc-3 §5.4 (reason-coded decline) |

**3. Response Schema** — `invitation_id : uuid (1)`, `state : enum<accepted\|declined> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `invitation_id`, `decision`, conditional reason | 1 SYNTAX | Doc-4A §9 | presence/type/enum; reason required on decline | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; vendor active-org context | `AUTHORIZATION` |
| `can_respond_to_rfq` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| grantee scope | 4 SCOPE | Doc-4A §7.3; Doc-2 §10.4 | a `rfq_invitation_grantees` row exists for the actor's org (controlling or representative) | `NOT_FOUND` (collapse, §7.5) |
| delegation (representative) | 5 DELEGATION | Doc-4A §6B | §6B five-condition grant for a representative org | `AUTHORIZATION` |
| invitation state = `delivered` | 6 STATE | Doc-2 §3.4 | response legal only from `delivered` | `STATE` |
| window open | 8 BUSINESS | Doc-3 §8.1/§8.5 | RFQ quotation window open (decline allowed any time before close) | `STATE`/`BUSINESS` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_respond_to_rfq`** (Doc-2 §7) · Scope = vendor controlling org (grantee row) · Delegation **eligible** — representative org via §6B grant · Enforcement Identity `check_permission` (consumed).

**6. State Machine Enforcement** — Allowed source **`delivered`** · Target **`accepted`** or **`declined`** (Doc-2 §3.4) · Forbidden: all other invitation states → `STATE` · Concurrency: optimistic on invitation state; a decline is recorded on `rfq_invitations` (`declined`), **not** as a quotation state (Doc-2 §5.5 guard); a formal decline/response frees the active-capacity slot → triggers `drain_deferred_queue` (§E6.3). **No edge invented.**

**7. Audit Binding** — Action **`InvitationAccepted`** / **`InvitationDeclined`** (Doc-2 §9) · Attribution **User** (vendor; representative recorded against its org) · Object scope `rfq_invitations` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** defined in Doc-2 §8 for accept/decline (state + audit only — H.7) · Consumed none · Trigger: vendor decision · Idempotency: replay → same invitation state, no duplicate audit.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX, or missing decline reason | false |
| `AUTHORIZATION` | context/slug/delegation fail | false |
| `NOT_FOUND` | no grantee row for actor's org (collapse, §7.5) | false |
| `STATE` | invitation not `delivered` / window closed | false |
| `CONFLICT` | concurrent response race | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (POLICY); replay after a response returns the resulting invitation state with no duplicate audit; the state assertion (`delivered`) makes a second response a `STATE` no-op (or idempotent same-result within the window).

**11. Cross-Module References** — **Identity (DE-1):** active-org context, `check_permission`, §6B delegation grant for representative response. **Platform Core (DE-8):** audit-write. A formal decline frees a capacity slot → internal `drain_deferred_queue` trigger (§E6.3). Others: none.

**12. AI-Agent Implementation Notes** — **Make declining easier than ignoring** (Doc-3 §8.4): a formal decline counts as a **response** (protects the response-rate health metric), frees the slot instantly, and carries **zero** negative performance effect (Doc-3 §8.4 FIXED). A decline is recorded on the invitation, never as a quotation. Representative responses go through §6B delegation (DE-1) and attribute to the vendor profile (the market identity) plus the representative org (Doc-3 §2.8).

---

## §E6.5 — `rfq.assist_routing.v1` — Human-Assisted Routing Action

**1. Contract Metadata** — Contract ID `rfq.assist_routing.v1` · Template **21.6 Admin** (no active org context, §5.6; Stage-gated) · Owned aggregate **RFQ** (annotates `rfq_routing_log`; may queue candidates into the pipeline, which re-gates them) · Actor **Admin** (platform-staff/founder) · Bounded context **BC-7** (§E6).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 |
| `action` | `enum<suggest_vendor\|validate_release\|trigger_sourcing\|request_clarification>` | yes | no | 1 | Doc-3 §3.6 (allowed human actions) |
| `suggested_vendor_profile_ids` | `uuid[]` | no | yes (req iff suggest_vendor) | 0..N | Doc-3 §3.6 (suggested vendors must still pass every gate) |
| `rationale` | `text` | yes | no | 1 | Doc-3 §3.6 (every human action audited with rationale) |

**3. Response Schema** — `rfq_id : uuid (1)`, `action_outcome : enum<applied\|rejected> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `action`, conditional vendor list, `rationale` | 1 SYNTAX | Doc-4A §9 | presence/type/enum; rationale non-empty | `VALIDATION` |
| Admin scope declared | 2 CONTEXT | Doc-4A §5.6 | platform-staff/founder context; **no active org** | `AUTHORIZATION` |
| platform-staff authority | 3 AUTHZ | Doc-2 §7 (slug-authority note); §5.6 | `staff_super_admin` (nearest enumerated; `[ESC-RFQ-SLUG]` for a dedicated routing-governance slug) | `AUTHORIZATION` |
| human-assist criteria | 8 BUSINESS | Doc-3 §3.6; POLICY `human_routing.criteria_thresholds` | criteria met (high-value/strategic/first-time-buyer/empty-pool/low-confidence) | `BUSINESS` |
| operating stage permits | 9 POLICY | Doc-3 §0.1; POLICY `platform.operating_stage` | stage permits human-assist | `BUSINESS`/`POLICY` |
| **forbidden-actions wall** | 8 BUSINESS | Doc-3 §3.6/§0.1.1 FIXED | **never bypass blacklist/eligibility/verification/trust**; suggested vendors must pass every gate | `BUSINESS` (forbidden action → reject) |

**5. Authorization Matrix** — Actor **Admin** (platform-staff/founder, §5.6) · Slug **`staff_super_admin`** (nearest enumerated platform-governance slug; a dedicated routing-governance slug is carried under **`[ESC-RFQ-SLUG]`** — Doc-2 §7 additive; **no slug invented**) · Scope = platform (no org context) · Delegation **n/a** · Enforcement Identity `check_permission` (platform-staff space). Bound by the FIXED forbidden-actions wall.

**6. State Machine Enforcement** — May trigger routing (→ `vendors_notified` via the wave contract §E6.1; the transition is the wave contract's) · No new edge · Forbidden: any action that would bypass blacklist/eligibility/verification/trust → rejected (Doc-3 §3.6/§0.1.1) · Concurrency: human-assist annotations append to `rfq_routing_log`; suggested vendors enter the pipeline which **re-gates** them (never a gate bypass).

**7. Audit Binding** — Action **Doc-2 §9 RFQ "routing run"** with **actor + rationale** (every human routing action audited; runs flagged in telemetry — Doc-3 §3.6) · Attribution **Admin** · Object scope `rfq_routing_log` · Timing same transaction · Source Doc-2 §9 + Doc-4B. Human-assist annotation carries **`[ESC-RFQ-AUDIT]`** where not separately enumerated (interim nearest-§9 pointer; no action invented).

**8. Event Binding** — Emitted **none new** (routing events fire from the wave contract §E6.1) · Consumed none · Trigger: platform/founder action · Idempotency: `Idempotency: required`; replay → same outcome, no duplicate annotation.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / missing rationale | false |
| `AUTHORIZATION` | non-staff / missing platform-governance authority / org-context present | false |
| `BUSINESS` | **forbidden action attempted** (bypass blacklist/eligibility/verification/trust), or human-assist criteria/stage not met | false |
| `STATE` | RFQ not in a human-assist-eligible state | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required`; replay → same `action_outcome`, no duplicate routing-log annotation/audit; suggested-vendor queuing is idempotent (re-gating yields the same result).

**11. Cross-Module References** — **Identity (DE-1):** platform-staff `check_permission`. **Marketplace (DE-2):** suggested vendors re-read + re-gated (read-only). **Communication (DE-6):** `request_clarification` dispatched by Communication. **Platform Core (DE-8):** audit-write, POLICY read. **Firewall:** humans may improve routing quality, **never violate the rules** (§4B; Doc-3 §3.6).

**12. AI-Agent Implementation Notes** — **Forbidden-actions wall is FIXED** (Doc-3 §3.6/§0.1.1): no stage, founder included, may bypass blacklist/eligibility/verification/trust or breach non-disclosure. Suggested vendors **pass every Phase-A gate** (re-gated via the pipeline) — human-assist never injects an ungated vendor. Every action is audited with actor + rationale and flagged in telemetry. The routing transition is the wave contract's (§E6.1), not this contract's. **Authority binds to §5.6 platform-staff (`staff_super_admin` nearest; `[ESC-RFQ-SLUG]` carried) — no slug invented.**

---

## §E6.6 — `rfq.manage_routing_rule.v1` — Routing-Rule Control Plane

**1. Contract Metadata** — Contract ID `rfq.manage_routing_rule.v1` · Template **21.6 Admin** (no active org context, §5.6) · Owned aggregate **Routing Rule** (`routing_rules`, platform-owned) · Actor **Admin** (platform-staff) · Bounded context **BC-7** (§E6).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rule_id` | `uuid` | no | yes (null = create) | 0..1 | Doc-2 §10.4 `routing_rules` |
| `operation` | `enum<create\|update\|set_status>` | yes | no | 1 | Doc-2 §3.4 (`routing_rules` simple lifecycle) |
| `rule_definition` | `jsonb` | no | yes (req on create/update) | 0..1 | Doc-2 §10.4 (rule definitions; **parameters resolve from `core.system_configuration` — referenced by POLICY key, never inlined**) |
| `change_reason` | `text` | yes | no | 1 | Doc-2 §9 (config-governance audit) |

**3. Response Schema** — `rule_id : uuid (1)`, `version : numeric (1)`, `status : enum (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `operation`, conditional `rule_definition`, `change_reason` | 1 SYNTAX | Doc-4A §9 | presence/type/enum | `VALIDATION` |
| Admin scope declared | 2 CONTEXT | Doc-4A §5.6 | platform-staff; no active org | `AUTHORIZATION` |
| platform-staff authority | 3 AUTHZ | Doc-2 §7 (slug-authority note); §5.6 | `staff_super_admin` (nearest; `[ESC-RFQ-SLUG]`) | `AUTHORIZATION` |
| rule reference (update/set_status) | 7 REFERENCE | Doc-4A §9.5 | `rule_id` exists | `NOT_FOUND` |
| POLICY-by-key | 9 POLICY | Doc-4A §18.2; Doc-3 §12.2 | parameters referenced by `core.system_configuration` key; **`[ESC-RFQ-POLICY]` if a referenced key is absent** (none currently) | `BUSINESS`/`REFERENCE` |

**5. Authorization Matrix** — Actor **Admin** (§5.6) · Slug **`staff_super_admin`** (nearest enumerated; dedicated routing-governance slug carried under **`[ESC-RFQ-SLUG]`**; no slug invented) · Scope = platform · Delegation n/a · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — `routing_rules` simple lifecycle (Doc-2 §3.4): create → active; set_status transitions per the simple machine · No RFQ-head transition · Forbidden: inlining POLICY values (must reference by key) · Concurrency: optimistic on rule version; `Idempotency: required`. **No edge invented.**

**7. Audit Binding** — Action **Doc-2 §9 Platform "system_configuration change"** (config-governance; old/new + reason) where the rule binds POLICY; routing-rule edits audited via Doc-4B · Attribution **Admin** · Object scope `routing_rules` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (control-plane config change; no Doc-2 §8 event) · Consumed none · Trigger: platform-operator rule change · Idempotency: `Idempotency: required`; replay → same rule version, no duplicate audit.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / missing reason or definition | false |
| `AUTHORIZATION` | non-staff / missing platform-governance authority | false |
| `NOT_FOUND` | `rule_id` not found (update/set_status) | false |
| `BUSINESS` | POLICY value inlined instead of keyed; `[ESC-RFQ-POLICY]` for an absent key | false |
| `CONFLICT` | concurrent rule-version edit | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required`; replay → same rule version with no duplicate config-change audit; concurrent edits resolve optimistically (loser → `CONFLICT`).

**11. Cross-Module References** — **Identity (DE-1):** platform-staff `check_permission`. **Platform Core (DE-8):** POLICY read/write is `core.system_configuration`; audit-write — both consumed (Doc-4B). **Firewall:** routing rules tune fairness/selection mechanics within POLICY bounds; **paid plans never gate routing fairness** (§4B; Doc-3 §11.8/§12.1). Others: none.

**12. AI-Agent Implementation Notes** — **Numbers are POLICY, mechanisms are architecture** (Doc-3 operating doctrine) — **never hardcode a threshold; reference the Doc-3 §12.2 key** (`[ESC-RFQ-POLICY]` if a referenced key is absent). Routing-rule changes are audited as config-governance (old/new + reason). **Paid plans never gate routing fairness or selection** (§4B). Authority binds §5.6 platform-staff (`staff_super_admin` nearest; `[ESC-RFQ-SLUG]` carried) — no slug invented.

---

## §E6.7 — `rfq.get_routing_log.v1` · `rfq.get_invitation.v1` · `rfq.list_invitations.v1` — Routing/Invitation Reads

**1. Contract Metadata** — Contract IDs `rfq.get_routing_log.v1`, `rfq.get_invitation.v1`, `rfq.list_invitations.v1` · Template **21.3 Query** · Owned aggregate **RFQ Invitation** / `rfq_routing_log` (reads) · Actor **User** (vendor via grantee / buyer via own RFQ) / **Admin** / **internal-service** · Bounded context **BC-3** (§E6).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes (routing-log / list) | no | 1 | Doc-2 §10.4 |
| `invitation_id` | `uuid` | yes (get_invitation) | no | 1 | Doc-2 §10.4 `rfq_invitations` |
| `filters` | `jsonb` | no | yes | 0..1 | Doc-4A §9.6 (allowlisted fields only) |
| `page` | `{cursor\|offset, limit}` | no | no | 1 | Doc-4A §22.3 |

**3. Response Schema**

| Field | Type | Cardinality | Source authority |
|---|---|---|---|
| (routing-log) `items` | `routing_log_row[]` (`routing_mode`, `pipeline_counts`, `executed_at`) | 0..N | Doc-2 §10.4 |
| (invitation) `invitation` / `items` | `invitation_projection` (`state`, `delivered_at`, `responded_at`) | 1 / 0..N | Doc-2 §10.4 |
| `page_info` | `jsonb` | 1 | Doc-4A §22.3 |
| `reference_id` | `uuid` | 1 | Doc-4A §22.1 |

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id` / `invitation_id` / `filters` / `page` | 1 SYNTAX | Doc-4A §9/§9.6/§22.3 | presence/type; **allowlisted** filter/sort fields only | `VALIDATION` |
| actor context | 2 CONTEXT | Doc-4A §5 | User (buyer/vendor) / Admin / internal-service | `AUTHORIZATION` |
| read authority | 3 AUTHZ | Doc-2 §7 | invitation: vendor grantee or buyer `can_view_rfq`/`can_view_all_rfqs`; routing-log: platform/ops scope | `AUTHORIZATION` |
| read scope | 4 SCOPE | Doc-4A §7.5; Doc-2 §10.4/§10.11 | vendor = `rfq_invitation_grantees` row; buyer = own RFQ; routing-log = buyer+compliance visibility only; **non-disclosure invariant** | `NOT_FOUND` (collapse, §7.5) |
| reference | 7 REFERENCE | Doc-4A §9.5 | `rfq_id`/`invitation_id` exists + visible | `NOT_FOUND` |

**5. Authorization Matrix** — Actor **User** (vendor via grantee row / buyer via own RFQ) / **Admin** / **internal-service** · Slugs **`can_view_rfq`** / **`can_view_all_rfqs`** (buyer invitation reads, Doc-2 §7); routing-log read is platform/ops-scoped · Scope: vendor = grantee row; buyer = own RFQ; routing-log = buyer+compliance only · Delegation: vendor grantee resolution consumes Identity (DE-1) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — None (read; no transition).

**7. Audit Binding** — **None** — reads are not audited (Doc-4A §17.1).

**8. Event Binding** — None (read).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | non-allowlisted filter/sort; malformed page | false |
| `AUTHORIZATION` | actor/context/slug fail | false |
| `NOT_FOUND` | RFQ/invitation/log not visible to caller (no-access ≡ not-found, §7.5) | false |

**10. Idempotency Rules** — Reads are inherently idempotent and side-effect-free (no `Idempotency` header; Doc-4A §14 applies to mutations only).

**11. Cross-Module References** — **Identity (DE-1):** vendor grantee/org resolution, `check_permission`. Others: none (reads are RFQ-owned data only).

**12. AI-Agent Implementation Notes** — **`rfq_routing_log` discloses per disclosure rules only** (Doc-2 §10.4 — buyer + compliance visibility) and **never stores or exposes vendor-visible blacklist/deferral traces** (Doc-2 §10.11; §7.5). A deferred or gate-excluded vendor is indistinguishable from non-match. Vendor invitation reads are **grant-scoped** to `rfq_invitation_grantees` only — **no public RFQ board** (Doc-3 §5.1 FIXED). No-access ≡ not-found (§7.5). Filter/sort fields are allowlisted (§9.6).

---

## Part-3 Conformance Summary (BC-3 + BC-7 — 8 contracts)

| Contract | Template | RFQ-head transition / invitation transition | Emitted | Audit action (Doc-2 §9) | Carried marker |
|---|---|---|---|---|---|
| `rfq.assemble_and_route_wave.v1` | 21.5 System | **owns `matching → vendors_notified`**; invitation `→ delivered` | `RFQRouted`, `VendorInvited` | "routing run" + `InvitationDelivered` | DE-1/2/4/6/7/8 |
| `rfq.replenish_wave.v1` | 21.5 System | none (head); invitation `→ delivered` | `VendorInvited` (`RFQRouted` per run) | "routing run" + `InvitationDelivered` | DE-1/4/6/7/8 |
| `rfq.drain_deferred_queue.v1` | 21.5 System | none (head); `deferred → delivered`/`expired` | `VendorInvited` | `InvitationDelivered`/`InvitationExpired` | DE-1/4/6/8 |
| `rfq.respond_to_invitation.v1` | 21.4 Command | none (head); `delivered → accepted`/`declined` | none | `InvitationAccepted`/`InvitationDeclined` | DE-1/8 |
| `rfq.assist_routing.v1` | 21.6 Admin | none (transition is the wave contract's) | none new | "routing run" (+rationale) · **`[ESC-RFQ-AUDIT]`** | DE-1/2/6/8 · **`[ESC-RFQ-SLUG]`** |
| `rfq.manage_routing_rule.v1` | 21.6 Admin | none; `routing_rules` simple lifecycle | none | Platform "system_configuration change" | DE-1/8 · **`[ESC-RFQ-SLUG]`** · `[ESC-RFQ-POLICY]` |
| `rfq.get_routing_log.v1` / `get_invitation.v1` / `list_invitations.v1` | 21.3 Query | none (read) | none | none (reads not audited) | DE-1 |

**Governance confirmation (Part 3).** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template was created or changed; all bindings are by pointer to `Doc-4E_PassA_v1.0_FROZEN` and the frozen corpus. **The selection/fairness/wave/throttle/capacity math is Doc-3 §3.3–§3.6/§4/§5/§7, bound by pointer — not re-derived.** **Routing, invitation, fairness, and supplier-selection remain RFQ-owned; Marketplace acquires no routing authority** (vendor data read-only via DE-2). **No governance signal is mutated; no paid plan/entitlement gates routing fairness or selection (§4B; Doc-3 §11.8/§12.1).** The non-disclosure invariant holds on every surface (deferral/blacklist exclusion indistinguishable from non-match; `rfq_routing_log` never stores blacklist traces). The human-assist forbidden-actions wall is FIXED (never bypass blacklist/eligibility/verification/trust). **Slug-authority gap for routing-governance is carried as `[ESC-RFQ-SLUG]` (Doc-2 §7 additive) — no slug invented.** Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]` referenced by name and unresolved. No corpus detail was absent; **no flag-and-halt triggered** (the routing-governance slug gap is carried per the established escalation-marker pattern, not a corpus-authority failure).

---

*End of Doc-4E — RFQ Procurement Engine — Content v1.0, Pass-B (hardening), Part 3 of 5 — BC-3 Routing/Selection/Distribution + BC-7 Routing Governance & Control Plane. The 8 §E6 contracts hardened to implementation grade (metadata · request/response schemas · validation matrix · authorization matrix · state-machine enforcement · audit binding · event binding · error register · idempotency · cross-module references · AI-agent notes), bound by pointer to Doc-4E_PassA_v1.0_FROZEN and the frozen corpus; the routing/fairness math bound to Doc-3 §3–§7, never re-derived; routing/invitation/fairness/selection ownership remains RFQ's; nothing invented. New escalation marker carried: `[ESC-RFQ-SLUG]` (Doc-2 §7 additive — routing-governance slug). Next: Part 4 — BC-4 Quotation Management Hardening.*
