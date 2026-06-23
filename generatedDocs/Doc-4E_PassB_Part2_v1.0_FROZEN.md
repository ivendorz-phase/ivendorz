# Doc-4E — RFQ Procurement Engine — Pass-B (Hardening) Part 2 v1.0 (FROZEN) — BC-2 Matching Pipeline

## BC-2 — Eligibility & Matching Pipeline Hardening (§E5)

| Field | Value |
|---|---|
| Document | Doc-4E — **Pass-B Part 2 v1.0 (FROZEN)** — final immutable Part-2 baseline — Module 3 RFQ Procurement Engine (`rfq` schema) |
| Part scope | **BC-2 — Eligibility & Matching Pipeline (§E5)** — the 4 contracts of `Doc-4E_PassA_v1.0_FROZEN` §E5, hardened to implementation grade |
| Status | **Part-2 FROZEN — final immutable baseline.** Consolidates `Doc-4E_Content_v1.0_PassB_Part2_MatchingPipeline.md` as amended by `Doc-4E_PassB_Part2_Patch_v1.0.md`; certified by `Doc-4E_PassB_Part2_Freeze_Audit_v1.0.md`. Authorized next stage: **Doc-4E_PassB_Part3_v1.0** (BC-3+BC-7). |
| Contract authority | `Doc-4E_PassA_v1.0_FROZEN.md` (sole contract authority; **not revisited, not redesigned, not reopened**) |
| Frozen precedents | `Doc-4E_Structure_v1.0_FROZEN.md`; `Doc-4E_PassB_Part1_v1.0_FROZEN.md` (Part 1 frozen; not reopened) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1_v1.0_FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-1 RFQ Lifecycle (FROZEN) · **Part 2 — BC-2 Matching Pipeline** · Part 3 — BC-3+BC-7 Routing & Governance · Part 4 — BC-4 Quotation Management · Part 5 — BC-5+BC-6 Evaluation, Comparison, Award |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 2).** Convert the 4 Pass-A BC-2 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices bound to the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement, audit/event bindings, error registers (Doc-4A §12 closed class set), and idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. **The matching/routing/ranking math is owned by Doc-3 §3/§6 and bound by pointer — never re-derived here.** The procurement moat is preserved (RFQ owns matching / eligibility determination / routing inputs / ranking inputs; Marketplace owns vendor discovery / profiles / attributes — DE-2). Carried dependencies **DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 2.

**BC-2 character (why most contracts are 21.5 System).** The pipeline runs **asynchronously** on entry to `matching` (Doc-3 §1.2). Three of the four contracts are **Template 21.5 System** (`Response: none` — internal execution and inbound event-consumers): `run_matching_pipeline`, `rematch_incremental`, `regenerate_matching_results`. One is **Template 21.3 Query** (`get_matching_results`). None is tenant-callable as a command; none mutates a vendor signal. **FIXED invariants binding every BC-2 contract:** Phase order and gate-before-score (Doc-3 §3.1); blacklist-before-everything + self-match exclusion (Doc-3 §2.1); **no gate-excluded vendor ever written into `matching_results`, leads, counts, or logs** (Doc-2 §10.4 / §10.11.10; non-disclosure §7.5); governance-signal firewall — signals are scoring **inputs**, never mutated, and **no paid plan/entitlement gates eligibility or confidence** (Doc-4A §4B; Doc-3 §11.8/§12.1).

---

## §H — Part-2 Hardening Conventions (stated once; bound by pointer per contract)

Identical convention basis to Part 1 §H (reference-never-restate, Doc-4A §0.3). Per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage. For **21.5 System** contracts there is no external caller, so stages 2–5 (CONTEXT/AUTHZ/SCOPE/DELEGATION) collapse to a single **trigger-authenticity** check (the contract is invoked only by the platform scheduler/pipeline or a verified inbound event, never a tenant) — recorded explicitly per contract; the semantic stages (6 STATE → 9 POLICY) carry the real validation weight.
- **H.2 — Field type vocabulary.** As Part 1 §H.2: `uuid` (UUIDv7, Doc-4A §8), `enum<…>`, `numeric` (Doc-2 §10.4 `NUMERIC`), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, not internal field schema), `timestamptz`, `string[]`/`uuid[]` (cardinality stated). **Required**/**nullable**/**cardinality** stated per field; every field cites a **source authority**.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** System contracts carry **no permission slug** (system actor, no org context); their "authorization" is invocation provenance (scheduler/pipeline/verified event). The Query contract (`get_matching_results`) is **internal-service / Admin** scoped (never tenant-vendor exposed — non-disclosure). No slug invented; enforcement source is Identity `check_permission` where a slug applies (Admin read).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`; codes `rfq_<domain>_<code>` (integer assigned at dev-doc stage). System contracts surface `DEPENDENCY` (consumed service unavailable → scheduler retry), `STATE` (idempotent no-op if precondition not met), and `SYSTEM`; they do not return `AUTHORIZATION`/`VALIDATION` to a tenant (no tenant caller). Protected-fact handling → `NOT_FOUND` collapse on the Query (§7.5).
- **H.5 — State machine (Doc-2 §5.4 RFQ; Doc-4A §13).** BC-2 contracts **do not own an RFQ state transition by themselves** — the pipeline executes *within* `matching`; a deliverable wave's `matching → vendors_notified` transition is owned by the **routing contract (BC-3/§E6, Part 3)**, and the coverage-exhausted `matching → expired` is owned by **`rfq.expire_rfq.v1` (BC-1/§E4, Part 1, FROZEN)**. Each BC-2 contract states the RFQ **state precondition** it requires and explicitly records that it **adds/modifies no edge**. `matching_results` is **derived/regenerable** (Doc-2 §6/§10.4) — not a state machine.
- **H.6 — Audit (Doc-2 §9 RFQ domain via Doc-4B `core.append_audit_record.v1`).** The auditable BC-2 action is **"routing run (mode, filter reference)"** (Doc-2 §9 RFQ domain), recorded in `rfq_routing_log` (append-only; per-step in/out counts; **never** vendor-visible blacklist traces — Doc-2 §10.4). Attribution **System**. Reads (`get_matching_results`) are not audited (§17.1). The `incremental_rematch` routing-log entry carries **`[ESC-RFQ-AUDIT]`** (interim: nearest §9 "routing run" by pointer; no action invented).
- **H.7 — Events (Doc-2 §8 RFQ catalog via Doc-4B outbox-write).** Emitted: only `RFQMatched` / `RFQRouted` (Doc-2 §8; Architecture Patch v1.0.1 PATCH-06), written transactionally; **no event coined** (§16.4). Consumed (idempotent, Doc-4A §16): `VendorClaimed` (Marketplace — incremental-rematch trigger), `VendorVerified` / `VendorTierChanged[verified]` / `TrustScoreUpdated` / `PerformanceScoreUpdated` (Trust — re-rank trigger), `VendorTierChanged[declared]` / `VendorOwnershipTransferred` (Marketplace — re-rank trigger). No consumer logic for other modules' internal effects.
- **H.8 — Idempotency (Doc-4A §14).** All BC-2 System contracts are **inherently idempotent** (re-fire safe): a replay produces the same `matching_results` state with no duplicate audit/event; event-consumers dedupe on event identity (Doc-4A §16 at-least-once → idempotent consumer). The pipeline-run retry/backoff is POLICY `matching.max_retries` (Doc-3 §12.2). The Query is side-effect-free.
- **H.9 — `matching_results` / `routing_rules` / `rfq_routing_log` field source (Doc-2 §10.4).** `matching_results` (`confidence_score numeric`, `breakdown_jsonb(tier/capacity/performance/trust/geography)`, `formula_version`; **contains only vendors that passed every gate**); `routing_rules` (rule definitions; parameters resolve from `core.system_configuration`); `rfq_routing_log` (`routing_mode`, `pipeline_counts_jsonb(per-step in/out)`, `executed_at`; never stores vendor-visible blacklist traces). **Pass-B introduces no column** — it binds existing ones.
- **H.10 — Moat & firewall (Architecture §1.5; Doc-4A §4B; Doc-3 §11.8/§12.1; DE-2/DE-3).** RFQ **runs** the matching/eligibility/ranking computation (Doc-3 §3/§6, bound by pointer); Marketplace **supplies** vendor discovery/profile/attribute data via the `vendor_matching_attributes` read-model and vendor services (DE-2, read-only — RFQ never writes vendor data, never re-derives the read-model). Trust **supplies** verified-tier/trust/performance signals (DE-3, read-only). **No governance signal is mutated; no paid plan/entitlement/flag gates eligibility, verification, routing fairness, or matching confidence** (§4B). The non-disclosure invariant binds every BC-2 surface (blacklist/gate-exclusion indistinguishable from non-match — Doc-2 §10.11.5/§10.11.10; §7.5).

---

## §E5.1 — `rfq.run_matching_pipeline.v1` — Execute Eligibility & Matching Pipeline

**1. Contract Metadata** — Contract ID `rfq.run_matching_pipeline.v1` · Template **21.5 System** (`Response: none`) · Owned aggregate **Matching Result** (`matching_results`, derived/regenerable) + reads **Routing Rule** (`routing_rules`) · Actor **System** (async pipeline) · Bounded context **BC-2** (§E5).

**2. Request Schema** *(internal trigger; no tenant-facing request body — Template 21.5)*

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 `matching_results → rfqs` |
| `rfq_version_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 (`matching_results` per version); Doc-3 §3.1 A0 (valid version) |
| `trigger` | `enum<matching_entry\|retry>` | yes | no | 1 | Doc-3 §1.2 (entry to `matching`) / §3.1 retry (POLICY `matching.max_retries`) |

**3. Response Schema** — **none** (Template 21.5 `Response: none`). Side effects: writes `matching_results` rows; writes `rfq_routing_log` entry; MAY emit `RFQMatched`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `rfq_version_id`, `trigger` | 1 SYNTAX | Doc-4A §9 | presence/type/enum | `VALIDATION` (internal) |
| trigger authenticity | 2–5 (collapsed) | Doc-4A §5.6; H.3 | invoked only by platform scheduler/pipeline (no tenant actor) | `AUTHORIZATION` (internal) |
| RFQ state = `matching` | 6 STATE | Doc-2 §5.4; Doc-3 §1.2 | pipeline runs only while RFQ ∈ `matching` | `STATE` (idempotent no-op otherwise) |
| RFQ-eligibility A0 | 6 STATE / 8 BUSINESS | Doc-3 §3.1 A0 | RFQ itself routable: cleared moderation, valid version, value present, window set, buyer org in good standing | `STATE` / `BUSINESS` |
| `rfq_version_id` validity | 7 REFERENCE | Doc-4A §9.5 | version exists + is the current routable version | `REFERENCE` |
| vendor-data reads | 7 REFERENCE | Doc-4A §4.5; DE-2/DE-3/DE-4 | Marketplace `vendor_matching_attributes` + vendor attrs; Trust signals; Operations CRM status — via owning-module services | `DEPENDENCY` (service unavailable → retry) |
| Phase A hard gates A1–A7 | 8 BUSINESS | Doc-3 §2 / §3.1 | blacklist floor + self-match (A1), category (A2), capability (A3), work-nature (A4), verification value-band + probation (A5), tier ceiling (A6), capacity pre-gate/defer (A7) — **gate-before-score, order FIXED** | (no error — gate-failed vendors are simply excluded; never an error, never written) |
| Phase B/C scoring | 8 BUSINESS | Doc-3 §6 | geography modifier; confidence per survivor; `formula_version` stamped | — |
| retry bound | 9 POLICY | Doc-3 §12.2 `matching.max_retries` | retry/backoff on pipeline error; then park with ops alert | `DEPENDENCY` (retryable) |

**5. Authorization Matrix** — Actor **System** · Slug **none** (system actor, no org context, Doc-4A §5.6) · Scope **platform/internal** (not tenant-callable) · Delegation **n/a** · Enforcement source: invoked only by the platform scheduler/pipeline (provenance check, H.3).

**6. State Machine Enforcement** — RFQ **state precondition**: `matching` (Doc-2 §5.4) · Target: **no RFQ transition owned by this contract** — a deliverable wave's `matching → vendors_notified` is owned by the routing contract (BC-3/§E6, Part 3); coverage-exhausted `matching → expired` is owned by `rfq.expire_rfq.v1` (Part 1) · Forbidden: running outside `matching` → idempotent no-op · Concurrency: single in-flight pipeline run per (RFQ, version); a concurrent duplicate trigger is deduped (idempotent); `matching_results` writes are derived (regenerable). **No edge added or modified.**

**7. Audit Binding** — Action **Doc-2 §9 RFQ "routing run (mode, filter reference)"** · Attribution **System** · Object scope `rfq_routing_log` (append-only; per-step in/out counts) + `matching_results` rows · Timing same transaction as the routing-log write · Source authority Doc-2 §9 + Doc-4B `core.append_audit_record.v1`. **`rfq_routing_log` never stores vendor-visible blacklist traces** (Doc-2 §10.4).

**8. Event Binding** — Emitted **`RFQMatched`** (Doc-2 §8; PATCH-06) via Doc-4B outbox-write on a successful run · Consumed none (this is the executor; consumers are §E5.2/§E5.4) · Trigger: entry to `matching` (Doc-3 §1.2) · Idempotency: replay → same `matching_results`, at most one `RFQMatched` per run generation.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `STATE` | RFQ not in `matching` (idempotent no-op) | n/a (system) |
| `REFERENCE` | `rfq_version_id` invalid / not current | false |
| `DEPENDENCY` | Marketplace/Trust/Operations service or Doc-4B unavailable; pipeline error within `matching.max_retries` | true (backoff retry; then park + ops alert) |
| `BUSINESS` | RFQ-eligibility A0 fails (not routable) | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — Inherently idempotent (Doc-4A §14): a re-fire on the same (RFQ, version) regenerates `matching_results` to the same state with no duplicate `rfq_routing_log` audit and at most one `RFQMatched`; pipeline error → retry/backoff up to POLICY `matching.max_retries`, then park in `matching` with an ops alert (never silently drop — Doc-3 §1.2). Empty-pool is **not** an error: it yields zero `matching_results` rows and triggers the coverage path (Doc-3 §1.2 + §11.4), with terminal disposition owned by `rfq.expire_rfq.v1` (Part 1).

**11. Cross-Module References** — **Marketplace (DE-2):** read `vendor_matching_attributes` + vendor capability/geography/category/tier/capacity (read-only service). **Trust (DE-3):** read verified-tier/trust/performance signals (read-only). **Operations (DE-4):** read buyer CRM status (Buyer Filter universe + blacklist floor) via CRM service under non-disclosure. **Billing (DE-7):** read quota as a delivery-ceiling input. **Platform Core (DE-8):** audit-write, outbox-write, POLICY read (`matching.max_retries`). **Firewall:** all reads; no signal mutated; no plan/entitlement gates eligibility/confidence (§4B). Identity/Communication: none here.

**12. AI-Agent Implementation Notes** — **Phase order is FIXED** (Doc-3 §3.1): A0 RFQ-eligibility → A1 blacklist+self-match → A2 category → A3 capability → A4 work-nature → A5 verification+probation → A6 tier → A7 capacity-defer → B geography → C scoring. **Gate-before-score; blacklist first.** A gate-failed vendor must **never** appear in `matching_results`, leads, counts, or logs (Doc-2 §10.4/§10.11.10; §7.5) — exclusion is silent, never an error. **Never author the matching math anew** — bind Doc-3 §6 (band functions, group weights, dominance cap, `formula_version`); absence-of-history never scores as zero (Doc-3 §6.4). **Never let payment/entitlement influence eligibility or confidence** (§4B). Vendor attributes are Marketplace-owned reads (DE-2) — never re-derive or write them. Empty-pool ≠ error; park-not-drop on pipeline failure.

---

## §E5.2 — `rfq.rematch_incremental.v1` — Incremental Rematch (coverage recovery)

**1. Contract Metadata** — Contract ID `rfq.rematch_incremental.v1` · Template **21.5 System** (`Response: none`) · Owned aggregate **Matching Result** (`matching_results`, append) + writes **`rfq_routing_log`** (`incremental_rematch` flag) · Actor **System** (event-triggered) · Bounded context **BC-2** (§E5).

**2. Request Schema** *(internal/event trigger; no tenant request body)*

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-3 §11.4 (affected RFQ of the open coverage case) |
| `vendor_profile_id` | `uuid` | yes | no | 1 | Doc-3 §11.4 / PATCH-D3-03 (the newly-eligible vendor) |
| `coverage_case_ref` | `uuid` | yes | no | 1 | Doc-3 §11.4 (triggering coverage-recovery case) |
| `trigger_event` | `enum<VendorClaimed\|gate_relevant_change>` | yes | no | 1 | Doc-2 §8 `VendorClaimed`; Doc-3 §11.4 (gate-relevant state change). **Note:** `gate_relevant_change` is an **internal trigger-class** defined by `Doc-3_Patch_v1.0.2` PATCH-D3-03 — **not a Doc-2 §8 outbox event name**. Implement via internal trigger mapping; **do not treat as a literal outbox event**. `VendorClaimed` (Doc-2 §8) is the one literal outbox event in this enum. |

**3. Response Schema** — **none** (Template 21.5). Side effects: appends `matching_results` for the newly-eligible vendor(s); writes `rfq_routing_log` (`incremental_rematch`).

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `vendor_profile_id`, `coverage_case_ref`, `trigger_event` | 1 SYNTAX | Doc-4A §9 | presence/type/enum | `VALIDATION` (internal) |
| trigger authenticity | 2–5 (collapsed) | Doc-4A §5.6; H.3 | invoked only by the event pipeline (verified inbound event) | `AUTHORIZATION` (internal) |
| open coverage case | 6 STATE | Doc-3 §11.4 | a coverage-recovery case for `rfq_id` is open | `STATE` (no-op if none) |
| RFQ in a rematchable state | 6 STATE | Doc-2 §5.4; Doc-3 §11.4 | RFQ still active (e.g., `matching`/post-`matching` per the case) | `STATE` |
| `vendor_profile_id` validity | 7 REFERENCE | Doc-4A §4.5; DE-2 | vendor profile exists; attrs readable via Marketplace service | `DEPENDENCY` (service) / `REFERENCE` |
| full Phase A gates (newcomer) | 8 BUSINESS | Doc-3 §3.1; §11.4 | the newly-eligible vendor passes **every** Phase A gate against the current version — blacklist/self-match absolute | (gate-fail → no append; never an error) |
| append-only | 8 BUSINESS | Doc-3 §11.4 / PATCH-D3-03 | append to `matching_results`; **never recompute or revoke existing results** | `BUSINESS` (if a recompute path is attempted) |

**5. Authorization Matrix** — Actor **System** · Slug **none** · Scope platform/internal · Delegation n/a · Enforcement: verified inbound event / pipeline provenance (H.3).

**6. State Machine Enforcement** — RFQ **state precondition**: an open coverage case with the RFQ active (Doc-3 §11.4) · Target: first successful delivery drives **`matching → vendors_notified`** — **owned by the routing/delivery contract (BC-3/§E6, Part 3)**, not this contract · Forbidden: re-routing or revoking existing results (PATCH-D3-03 FIXED) · Concurrency: append-only writes; existing `matching_results`/invitations never recomputed; idempotent per (RFQ, vendor, case). **No edge added.**

**7. Audit Binding** — Action **Doc-2 §9 RFQ "routing run"** · Attribution **System** · Object scope `rfq_routing_log` entry flagged `incremental_rematch` + appended `matching_results` rows · Timing same transaction · Source Doc-2 §9 + Doc-4B. **The `incremental_rematch` routing-log entry carries `[ESC-RFQ-AUDIT]`** (interim: nearest §9 "routing run" by pointer; channel Doc-2 §9 additive; no action invented).

**8. Event Binding** — Emitted **`RFQMatched` / `RFQRouted`** as applicable on a deliverable wave (Doc-2 §8) · Consumed **`VendorClaimed`** (Marketplace, Doc-2 §8 — the primary trigger) · Trigger: a vendor becomes newly eligible (claim completed / gate-relevant change) with an open coverage case · Idempotency: idempotent consumer (Doc-4A §16) — replay of the same `VendorClaimed`/case → one append, no duplicate.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `STATE` | no open coverage case, or RFQ not rematchable (idempotent no-op) | n/a (system) |
| `REFERENCE` | `vendor_profile_id` not found | false |
| `DEPENDENCY` | Marketplace/Doc-4B service unavailable | true |
| `BUSINESS` | attempted recompute/revoke of existing results (forbidden) | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — Idempotent consumer (Doc-4A §16): at-least-once `VendorClaimed` delivery is deduped on event identity; a replay appends nothing new and emits no duplicate; concurrency is append-only (no lost-update risk on existing rows). The newcomer is re-gated every run (no cached eligibility).

**11. Cross-Module References** — **Marketplace (DE-2):** consume `VendorClaimed`; re-read vendor attributes for the newcomer (read-only). **Trust (DE-3):** read newcomer's signals for scoring. **Operations (DE-4):** blacklist/CRM floor under non-disclosure. **Platform Core (DE-8):** audit-write, outbox-write. **Firewall:** reads only; no signal mutation; no plan gating (§4B). Identity/Communication/Billing: none directly (delivery effects belong to Part 3).

**12. AI-Agent Implementation Notes** — **Append-only** — never re-route or revoke existing `matching_results`/invitations (PATCH-D3-03 FIXED). The newcomer passes the **full Phase A gate set** against the current version (blacklist/self-match absolute) before any append. The `matching → vendors_notified` transition on first delivery is the **routing contract's** (Part 3), not this contract's. `VendorClaimed` is **consumed**, never emitted by RFQ (it is Marketplace's — DE-2). The routing-log entry is flagged `incremental_rematch` and its audit carries `[ESC-RFQ-AUDIT]`.

---

## §E5.3 — `rfq.get_matching_results.v1` — Read Matching Results

**1. Contract Metadata** — Contract ID `rfq.get_matching_results.v1` · Template **21.3 Query** · Owned aggregate **Matching Result** (`matching_results`, derived) · Actor **internal-service** / **Admin** · Bounded context **BC-2** (§E5).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 `matching_results → rfqs` |
| `rfq_version_id` | `uuid` | no | yes | 0..1 | Doc-2 §10.4 (per-version results); omitted ⇒ current version |
| `page` | `{cursor\|offset, limit}` | no | no | 1 | Doc-4A §22.3 (list pagination) |

**3. Response Schema**

| Field | Type | Cardinality | Source authority |
|---|---|---|---|
| `items` | `matching_result[]` | 0..N | Doc-2 §10.4 |
| `items[].vendor_profile_id` | `uuid` | 1 | Doc-2 §10.4 |
| `items[].confidence_score` | `numeric` | 1 | Doc-2 §10.4 |
| `items[].breakdown` | `jsonb` (tier/capacity/performance/trust/geography) | 1 | Doc-2 §10.4 `breakdown_jsonb` |
| `items[].formula_version` | `string` | 1 | Doc-2 §10.4; Doc-3 §6.3 |
| `page_info` | `jsonb` | 1 | Doc-4A §22.3 |
| `reference_id` | `uuid` | 1 | Doc-4A §22.1 |

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id` / `page` | 1 SYNTAX | Doc-4A §9/§22.3 | presence/type; allowlisted page params | `VALIDATION` |
| actor context | 2 CONTEXT | Doc-4A §5.6 | internal-service composition or Admin (ops); **never tenant-vendor** | `AUTHORIZATION` |
| read authority | 3 AUTHZ | Doc-2 §7; Doc-4A §6 | Admin path holds a `staff_*` ops read scope; internal-service path is module composition | `AUTHORIZATION` |
| read scope | 4 SCOPE | Doc-4A §7.5; Doc-2 §10.4 | platform/ops scope; non-disclosure invariant applies (no vendor-facing exposure) | `NOT_FOUND` (collapse, §7.5) |
| version ref | 7 REFERENCE | Doc-4A §9.5 | `rfq_version_id` (if given) exists for the RFQ | `NOT_FOUND` |

**5. Authorization Matrix** — Actor **internal-service** (routing/selection composition) / **Admin** (ops telemetry, §5.6) · Slug: Admin path uses an existing `staff_*` ops scope (no new slug); internal-service path is in-process composition (no tenant slug) · Scope **platform/internal only — never tenant-vendor** · Delegation **n/a** · Enforcement Identity `check_permission` for the Admin path.

**6. State Machine Enforcement** — None (read; no transition; `matching_results` is derived, not a state machine).

**7. Audit Binding** — **None** — reads are not audited (Doc-4A §17.1).

**8. Event Binding** — None (read; emits/consumes nothing).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed `rfq_id` / page params | false |
| `AUTHORIZATION` | non-internal/non-Admin caller (incl. any tenant-vendor attempt) | false |
| `NOT_FOUND` | RFQ/version not visible to caller (no-access ≡ not-found, §7.5) | false |

**10. Idempotency Rules** — Reads are inherently idempotent and side-effect-free (no `Idempotency` header; Doc-4A §14 applies to mutations only).

**11. Cross-Module References** — None at read time (the read-model inputs were consumed once, at pipeline run — DE-2/DE-3). Identity `check_permission` for the Admin path (DE-1). No other module consumed.

**12. AI-Agent Implementation Notes** — `matching_results` is **regenerable/derived** (Doc-2 §6) — it is the explainability surface, **never the source of truth** for any vendor signal (tier/trust/performance live in their owning modules — DE-2/DE-3). **Never expose this to a tenant vendor** (non-disclosure); a gate-excluded vendor is absent by construction (Doc-2 §10.4/§10.11.10), so the read cannot leak exclusion facts. No-access and not-found are indistinguishable (§7.5).

---

## §E5.4 — `rfq.regenerate_matching_results.v1` — Regenerate Matching Results (signal-change consumer)

**1. Contract Metadata** — Contract ID `rfq.regenerate_matching_results.v1` · Template **21.5 System** (`Response: none`) · Owned aggregate **Matching Result** (`matching_results`, regenerable rewrite) · Actor **System** (event consumer) · Bounded context **BC-2** (§E5).

**2. Request Schema** *(inbound-event trigger; no tenant request body)*

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 (`matching_results → rfqs`) |
| `vendor_profile_id` | `uuid` | yes | no | 1 | Doc-2 §8 (the vendor whose signal changed) |
| `trigger_event` | `enum<VendorTierChanged_verified\|TrustScoreUpdated\|PerformanceScoreUpdated\|VendorTierChanged_declared\|VendorOwnershipTransferred\|VendorVerified>` | yes | no | 1 | Doc-2 §8 (primary consumers: matching refresh / re-rank); `VendorVerified` = Trust verification-record event (Doc-2 §8 trust) |

**3. Response Schema** — **none** (Template 21.5). Side effect: rewrites the affected `matching_results` rows (re-score) with an updated `formula_version` where applicable.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `vendor_profile_id`, `trigger_event` | 1 SYNTAX | Doc-4A §9 | presence/type/enum | `VALIDATION` (internal) |
| trigger authenticity | 2–5 (collapsed) | Doc-4A §5.6; H.3 | verified inbound event (Trust/Marketplace) via the pipeline | `AUTHORIZATION` (internal) |
| RFQ pre-terminal | 6 STATE | Doc-2 §5.4 | RFQ not terminal (re-rank meaningless after close) | `STATE` (no-op if terminal) |
| candidate present | 7 REFERENCE | Doc-2 §10.4 | the vendor is a current `matching_results` candidate for the RFQ | `STATE`/no-op (vendor not a candidate ⇒ nothing to re-score) |
| re-rank only | 8 BUSINESS | Doc-3 §6; PA-18 | **re-score surviving candidates only — never a Phase-A re-gate; never add/remove a candidate** | `BUSINESS` (if a re-gate path is attempted) |
| signal read | 7 REFERENCE | DE-2/DE-3 | re-read the changed signal from its owning module | `DEPENDENCY` (service) |

**5. Authorization Matrix** — Actor **System** · Slug **none** · Scope platform/internal · Delegation n/a · Enforcement: verified inbound event provenance (H.3).

**6. State Machine Enforcement** — RFQ **state precondition**: pre-terminal (Doc-2 §5.4) · Target: **no RFQ transition** (re-ranking does not move RFQ state) · Forbidden: re-gating / adding / removing candidates (PA-18) · Concurrency: regenerable rewrite of the affected rows; idempotent per (RFQ, vendor, event); last-writer-wins on `matching_results` is safe (derived data). **No edge added.**

**7. Audit Binding** — Action **Doc-2 §9 RFQ "routing run"** (re-rank recorded in `rfq_routing_log`) · Attribution **System** · Object scope `rfq_routing_log` + rewritten `matching_results` rows · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (re-rank emits no new domain event) · Consumed **`VendorTierChanged[verified]`**, **`TrustScoreUpdated`**, **`PerformanceScoreUpdated`**, **`VendorVerified`** (Trust — DE-3); **`VendorTierChanged[declared]`**, **`VendorOwnershipTransferred`** (Marketplace — DE-2) · Trigger: a consumed governance-signal change for a current candidate (incl. `VendorVerified` altering verification-derived scoring inputs) · Idempotency: idempotent consumer (Doc-4A §16) — replay re-scores to the same result, no duplicate.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `STATE` | RFQ terminal, or vendor not a current candidate (idempotent no-op) | n/a (system) |
| `DEPENDENCY` | Trust/Marketplace signal service or Doc-4B unavailable | true |
| `BUSINESS` | attempted Phase-A re-gate (forbidden — re-rank only) | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — Idempotent consumer (Doc-4A §16): at-least-once signal-event delivery deduped on event identity; replay re-scores to the same `matching_results` state with no duplicate audit; concurrent signal changes resolve last-writer-wins on derived rows (safe — regenerable). Absence-of-history never scored as zero (Doc-3 §6.4).

**11. Cross-Module References** — **Trust (DE-3):** consume `VendorVerified`-family / score events; re-read the changed signal (read-only). **Marketplace (DE-2):** consume declared-tier / ownership-transfer events; re-read declared attrs (read-only). **Platform Core (DE-8):** audit-write, outbox (none emitted, transaction discipline applies). **Firewall:** signal is a scoring **input** only — never mutated; no plan gating (§4B). Identity/Operations/Communication/Billing: none directly.

**12. AI-Agent Implementation Notes** — **Re-ranking only** (Doc-3 §6; PA-18) — re-score the surviving candidate set; **never re-gate, never add or remove a candidate, never re-run Phase A** (that is `run_matching_pipeline` / `rematch_incremental`). Idempotent consumer; bump `formula_version` only where the band/weight basis actually changed (Doc-3 §6.3). The signal is a **read-only input** from its owning module (DE-2/DE-3) — never mutated; payment never affects it (§4B). **`VendorVerified` (Trust / DE-3) is a re-rank trigger:** it may alter verification-derived scoring inputs, so it re-scores existing candidates — **re-rank only. Never perform Phase-A re-gating. Never add candidates. Never remove candidates.** (Consistent with PA-18: a verification change that would make a *new* vendor eligible is handled by `run_matching_pipeline` / `rematch_incremental` — Phase-A — not by this re-rank contract.)

---

## Part-2 Conformance Summary (BC-2 — 4 contracts)

| Contract | Template | RFQ state precondition / transition | Emitted | Consumed | Audit action (Doc-2 §9) | Carried marker |
|---|---|---|---|---|---|---|
| `rfq.run_matching_pipeline.v1` | 21.5 System | precondition `matching`; **no transition owned** (delivery→`vendors_notified` is Part 3; coverage→`expired` is Part 1) | `RFQMatched` | none | RFQ "routing run" | DE-2/DE-3/DE-4/DE-7/DE-8 |
| `rfq.rematch_incremental.v1` | 21.5 System | precondition open coverage case + active RFQ; **no transition owned** | `RFQMatched`/`RFQRouted` (on delivery) | `VendorClaimed` | RFQ "routing run" · **`[ESC-RFQ-AUDIT]`** (`incremental_rematch`) | DE-2/DE-3/DE-4/DE-8 |
| `rfq.get_matching_results.v1` | 21.3 Query | none (read) | none | none | none (reads not audited) | DE-1 (Admin path) |
| `rfq.regenerate_matching_results.v1` | 21.5 System | precondition pre-terminal; **no transition** (re-rank) | none | `VendorTierChanged[verified/declared]`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `VendorVerified`, `VendorOwnershipTransferred` | RFQ "routing run" | DE-2/DE-3/DE-8 |

**Governance confirmation (Part 2).** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template was created or changed; all bindings are by pointer to `Doc-4E_PassA_v1.0_FROZEN` and the frozen corpus. **The matching/eligibility/ranking math is Doc-3 §3/§6, bound by pointer — not re-derived.** The procurement moat is preserved: RFQ runs matching/eligibility-determination/routing-inputs/ranking-inputs; Marketplace vendor discovery/profiles/attributes are read-only via DE-2; Trust signals are read-only via DE-3; **no governance signal is mutated and no paid plan gates eligibility or confidence (§4B)**; the non-disclosure invariant holds on every surface (gate-excluded vendors never written; `matching_results` never tenant-exposed). Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]` referenced by name and unresolved. No corpus detail was absent; **no flag-and-halt triggered**.

---

*End of Doc-4E — RFQ Procurement Engine — Pass-B (Hardening) Part 2 v1.0 (FROZEN) — BC-2 Eligibility & Matching Pipeline. Final immutable Part-2 baseline: the 4 §E5 contracts hardened to implementation grade, consolidating the Part-2 base as amended by Doc-4E_PassB_Part2_Patch_v1.0 (PB2-M1 + PB2-N1 integrated; PB2-N2 deferred non-gating); certified by Doc-4E_PassB_Part2_Freeze_Audit_v1.0. Matching math bound to Doc-3 §3/§6 by pointer, never re-derived; bound to Doc-4E_PassA_v1.0_FROZEN and the frozen corpus; nothing invented. Carried: DE-1…DE-8, [ESC-RFQ-AUDIT], [ESC-RFQ-POLICY]. Any change requires Architecture Board approval. Next: Doc-4E_PassB_Part3_v1.0 (BC-3+BC-7 Routing & Governance).*
