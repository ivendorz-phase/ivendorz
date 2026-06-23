# Doc-4E — RFQ Procurement Engine — Content v1.0, Pass-B (Hardening) — Part 5 of 5 (FINAL)

## BC-5 Buyer Evaluation & Comparison + BC-6 Procurement Decision & Closure Hardening (§E8)

| Field | Value |
|---|---|
| Document | Doc-4E Content v1.0 — **Pass-B (hardening), Part 5 of 5 — FINAL** — Module 3 RFQ Procurement Engine (`rfq` schema) |
| Part scope | **BC-5 (Buyer Evaluation & Comparison) + BC-6 (Procurement Decision & Closure), §E8** — the 6 contracts of `Doc-4E_PassA_v1.0_FROZEN` §E8, hardened to implementation grade |
| Lifecycle step | Content Pass-B authoring → (next) Independent Hard Review → Pass-B Patch → Patch Verification → Freeze Audit → FROZEN (completes Pass-B; then full-module Doc-4E freeze) |
| Contract authority | `Doc-4E_PassA_v1.0_FROZEN.md` (sole contract authority; **not revisited, not redesigned, not reopened**) |
| Frozen precedents | `Doc-4E_Structure_v1.0_FROZEN`; `Doc-4E_PassB_Part1/2/3/4_v1.0_FROZEN` (Parts 1–4 frozen; not reopened); Cross-Part Consistency Audit v1.0 = CONSISTENT |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1/2/3/4_v1.0_FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-1 (FROZEN) · Part 2 — BC-2 (FROZEN) · Part 3 — BC-3+BC-7 (FROZEN) · Part 4 — BC-4 (FROZEN) · **Part 5 — BC-5+BC-6 (FINAL)** |
| Audience | Claude Code / Cursor / backend / frontend / QA / AI coding agents — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 5 — final).** Convert the 6 Pass-A BC-5/BC-6 contracts into **implementation-grade** contracts at the depth established in Parts 1–4: field-level schemas, validation matrices on the Doc-4A §11.2 nine-stage order, authorization matrices, state-machine enforcement, audit/event bindings, error registers (Doc-4A §12 closed class set), idempotency. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. **Evaluation/comparison/award behavior is owned by Doc-3 §9 and the Doc-2 §5.4 RFQ machine, bound by pointer — never re-derived.** Carried dependencies **DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`, `[ESC-RFQ-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 5.

**Special-focus invariants (Doc-3 §9; Doc-2 §5.4 — FIXED, bound by pointer).** **Decision-support, never auto-decision:** the platform **never auto-recommends or auto-picks a winner pre-award** (Doc-3 §9.1 FIXED) — the comparison statement summarizes; humans decide; the future AI layer may summarize but holds no authority. **Single award:** exactly one selected quotation → `closed_won` → engagement (Doc-2 §5.4 1:1 cardinality); split needs are a re-issue (BC-1, Part 1), never multi-award. **Buyer decision authority:** shortlist (`can_approve_vendor_selection`), award (`can_award_rfq`), close (per slug) — with ORG award-threshold approval where configured (Doc-3 §9.4). **Buyer-preference firewall:** Approved-vendor preference is **buyer-scoped only** — it floats in that buyer's own comparison sorting, never crosses tenants, never feeds platform scores, never affects other buyers' routing (Doc-3 §7.5/§9.1 FIXED; Doc-4A §4B). **Quotation confidentiality:** the comparison shows vendor-standing bands and buyer-private columns (buyer-only); it never exposes one vendor's quotation to another (vendor isolation, Part 4). **Loss handling:** uniform closure notification; banded (never exact) loss feedback, off by default (Doc-3 §9.5); expiry-without-buyer-action penalizes vendors nothing (FIXED).

**Cross-part / cross-module ownership boundary.** **Comparison-statement display data** is sourced from `matching_results` (the scored bands from BC-2, Part 2) — the authoritative display source, firewall-preserving (Pass-A PA-04). **Clarification / best-and-final threads** are a **Communication-owned channel (DE-6)** — Part 5 orchestrates the evaluation step and references the thread by pointer; it authors no thread entity or Communication contract. **The post-award engagement** is **Operations-owned (DE-4)** — created by Operations on the `RFQClosedWon` event; Part 5 emits the event, never authors the engagement. The quotation `submitted → selected` / `→ not_selected` transitions (Doc-2 §5.5) are driven here by award/close (BC-6) on the quotations the buyer selected/did-not-select; this is the Part-5-owned side of those edges (Part 4 explicitly deferred them here).

---

## §H — Part-5 Hardening Conventions (stated once; bound by pointer per contract)

Identical convention basis to Parts 1–4 §H (reference-never-restate, Doc-4A §0.3). Per-contract records reference these by pointer.

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage. The buyer-side commands are **not** delegation-eligible (buyer decision authority is the buyer org's own membership — Doc-3 §9.4); the System comparison-generator collapses stages 2–5 to trigger-authenticity. Each row names **stage · source authority · rule · failure outcome**.
- **H.2 — Field type vocabulary.** As Parts 1–4: `uuid`, `enum<…>`, `numeric`, `text`, `jsonb` (`matrix_jsonb` presence/shape boundary only — internal matrix schema is dev-doc scope), `uuid[]` (cardinality stated), `timestamptz`. **Required/nullable/cardinality** + **source authority** per field.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** (buyer controlling org of the target `rfqs`). **Slugs only**, from Doc-2 §7; **no slug invented**: `can_approve_vendor_selection` (shortlist/close-lost), `can_award_rfq` (award), `can_view_rfq`/`can_view_all_rfqs` (comparison read), `can_create_rfq` (clarification/best-and-final orchestration where it re-uses RFQ-owner authority). Buyer decision commands are **not delegation-eligible** (§6B not populated — the decision is the buyer org's). ORG award-threshold approval is consumed from Identity (Doc-3 §9.4). Enforcement = Identity `check_permission`; no shadow authorization.
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`; codes `rfq_<domain>_<code>` (integer at dev-doc stage). **>1 selected quotation at award → `BUSINESS`** (single-award cardinality, Doc-2 §5.4). **ORG-threshold approval missing → `BUSINESS`**. Protected-fact failures → `NOT_FOUND` collapse (§7.5).
- **H.5 — State machine (Doc-2 §5.4 RFQ + §5.5 Quotation; Doc-4A §13).** BC-5/BC-6 own these RFQ-head edges: **`quotations_received → buyer_reviewing`** (first comparison open or window-close auto-advance — Pass-A PA-16), **`buyer_reviewing → shortlisted`** (shortlist), **`shortlisted → closed_won`** (award), **`shortlisted → closed_lost`** (close without award). On award/close, the corresponding quotation edges fire (Doc-2 §5.5): the selected quotation **`submitted → selected`**, all others **`submitted → not_selected`** — the Part-5-owned side (Part 4 deferred them here). Forbidden source states → STATE; terminals never reopen (re-issue is BC-1). Concurrency: optimistic; single-award atomicity (RFQ + quotation transitions one transaction — modular monolith, Doc-2 §10.11.4). **No edge invented.**
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** RFQ-domain actions: **shortlist · close won/lost** (Doc-2 §9 RFQ). Quotation-domain actions: **select · reject** (Doc-2 §9 Quotation — fired on award/close as the buyer selects / does-not-select). Comparison generation is a derived-artifact refresh (not a separately enumerated §9 action — reads/derived not audited). Attribution **User** (buyer); System for the auto-advance/auto-generate. Reads not audited (§17.1). No audit action invented.
- **H.7 — Events (Doc-2 §8 RFQ catalog via Doc-4B outbox-write).** BC-6 emits **`RFQClosedWon`** + **`QuotationSelected`** (award) and **`RFQClosedLost`** (close without award), written transactionally; **no event coined** (§16.4). Shortlist is **state + audit only** (no Doc-2 §8 shortlist event); comparison generation emits nothing (consumes quotation events). Primary consumers (engagement creation, performance inputs, transaction intelligence, closure notification) author their own legs (single-authorship).
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + dedup window — **authority `[ESC-RFQ-POLICY]`** (no `rfq.*` dedup-window key in Doc-3 §12.2; Module-0 `core.*_dedup_window` keys firewalled from RFQ use; **no key/value invented**; carried consistently with Parts 3–4). Replay within the (to-be-authorized) window → same result, no duplicate audit/event. The System comparison-generator is inherently idempotent. Queries side-effect-free. Award/close assert the expected state (`shortlisted`) — a replay returns the terminal result, never a double award/event.
- **H.9 — Field source (Doc-2 §10.4).** `comparison_statements` (`version_no`, `matrix_jsonb`, `generated_at`; FK → `rfqs`, → `rfq_versions`; tenant = buyer `organization_id`; versioned, append). Award/close operate on `rfqs` (`state §5.4`, award value snapshot) and the `quotations` rows (`state §5.5`). **Pass-B introduces no column.**
- **H.10 — Decision-support, fairness, firewall & moat (Architecture §1.5; Doc-4A §4B/§7.5; Doc-3 §7.5/§9; DE-2/DE-3/DE-4/DE-6).** **Decision-support never decision:** no contract auto-recommends or auto-selects a winner (Doc-3 §9.1 FIXED). **Buyer-preference firewall:** Approved-vendor preference is buyer-scoped only — never a platform signal, never cross-tenant (Doc-3 §7.5; §4B). **No plan/entitlement gates evaluation, comparison ranking, or award** (§4B; Doc-3 §11.8/§12.1). **Quotation confidentiality:** comparison shows bands + buyer-private columns; vendor isolation preserved (Part 4); display data sourced from `matching_results` (PA-04), not a live signal read. **Moat:** evaluation/comparison/award/supplier-selection are RFQ-owned; engagement is Operations' (DE-4); thread is Communication's (DE-6); vendor data is Marketplace's (DE-2, read-only) — no leakage. Non-disclosure on every surface (§7.5).

---

## §E8.1 — `rfq.generate_comparison_statement.v1` — Generate / Refresh Comparison

**1. Contract Metadata** — Contract ID `rfq.generate_comparison_statement.v1` · Template **21.5 System** (`Response: none`) · Owned aggregate **Comparison Statement** (`comparison_statements`, versioned) · Actor **System** (event consumer) · Bounded context **BC-5** (§E8).

**2. Request Schema** *(internal event trigger; no tenant request body)*

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 (`comparison_statements → rfqs`) |
| `rfq_version_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 (per-version comparison) |
| `trigger_event` | `enum<QuotationSubmitted\|QuotationWithdrawn\|quotation_revised>` | yes | no | 1 | Doc-3 §9.1 (re-version on every quotation event); Doc-2 §8 |

**3. Response Schema** — **none** (Template 21.5). Side effect: writes a new `comparison_statements` version (`matrix_jsonb`, `generated_at`).

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `rfq_version_id`, `trigger_event` | 1 SYNTAX | Doc-4A §9 | presence/type/enum | `VALIDATION` (internal) |
| trigger authenticity | 2–5 (collapsed) | Doc-4A §5.6; H.1 | invoked only by the quotation-event pipeline (verified inbound event) | `AUTHORIZATION` (internal) |
| RFQ pre-terminal | 6 STATE | Doc-2 §5.4 | comparison meaningful while the RFQ is active (≥1 quotation exists) | `STATE` (no-op if terminal) |
| display-data source | 7 REFERENCE | Doc-2 §10.4; Pass-A PA-04 | vendor-standing bands sourced from `matching_results` (the authoritative display source), not a live Trust/Marketplace read | `REFERENCE`/`DEPENDENCY` |
| no auto-winner | 8 BUSINESS | Doc-3 §9.1 FIXED | statement summarizes; **never marks/recommends a winner** | — (invariant; a recommend path is a defect) |

**5. Authorization Matrix** — Actor **System** · Slug **none** (system actor, §5.6) · Scope platform/internal · Delegation n/a · Enforcement: quotation-event-pipeline provenance.

**6. State Machine Enforcement** — `comparison_statements` versioned append (Doc-2 §3.4/§10.4) · No RFQ-head transition owned here (the `quotations_received → buyer_reviewing` advance is owned by the **read** contract §E8.6 on first buyer open, or the system window-close auto-advance — PA-16) · Forbidden: none (derived refresh) · Concurrency: a new version per triggering event; idempotent per (RFQ-version, event). **No edge invented.**

**7. Audit Binding** — Comparison generation is a **derived-artifact refresh** — **not** a separately enumerated Doc-2 §9 action (reads/derived not audited, §17.1); the triggering quotation events were already audited at their source. No audit action invented.

**8. Event Binding** — Emitted **none** (consumes quotation events; emits nothing) · Consumed **`QuotationSubmitted`** / **`QuotationWithdrawn`** (Doc-2 §8) + the quotation-revision trigger (revision is a non-event — Part 4 — surfaced as an internal trigger) · Idempotency: idempotent consumer (Doc-4A §16) — replay re-generates the same version content, no duplicate.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `STATE` | RFQ terminal (idempotent no-op) | n/a (system) |
| `DEPENDENCY` | `matching_results` / Doc-4B unavailable | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — Inherently idempotent (Doc-4A §14): a re-fire on the same (RFQ-version, triggering event) regenerates the same `comparison_statements` content with no duplicate; auto-generates at first quotation, re-versions on every quotation event (Doc-3 §9.1).

**11. Cross-Module References** — **(reads) `matching_results`** for vendor-standing display bands (BC-2, Part 2 — the authoritative display source, PA-04); **Trust/Marketplace (DE-2/DE-3)** signals are **not** read live here (they were consumed at pipeline run). **Platform Core (DE-8):** outbox consumption mechanism. **Firewall:** display = scored signal, no second read path (§4B).

**12. AI-Agent Implementation Notes** — **Never auto-recommend or mark a winner** (Doc-3 §9.1 FIXED) — the statement summarizes; humans decide. Bind vendor-standing columns to `matching_results` (PA-04), **not** a live Trust/Marketplace call. Buyer-private columns (own status/notes) are buyer-only (non-disclosure). Re-version on every quotation event; idempotent.

---

## §E8.2 — `rfq.shortlist_quotation.v1` — Shortlist

**1. Contract Metadata** — Contract ID `rfq.shortlist_quotation.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (`rfqs`; references quotations) · Actor **User** (buyer) · Bounded context **BC-5** (§E8).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 |
| `expected_version_no` | `numeric` | yes | no | 1 | Doc-4A §14 (optimistic concurrency on RFQ state) |
| `quotation_ids` | `uuid[]` | yes | no | 1..N (soft max POLICY `eval.shortlist_max`) | Doc-3 §9.2 |

**3. Response Schema** — `rfq_id : uuid (1)`, `state : enum (1) = shortlisted`, `shortlisted_quotation_ids : uuid[] (1..N)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `expected_version_no`, `quotation_ids` | 1 SYNTAX | Doc-4A §9 | presence/type; ≥1 quotation id | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; buyer active-org context | `AUTHORIZATION` |
| `can_approve_vendor_selection` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns the RFQ | `NOT_FOUND` (collapse, §7.5) |
| state = `buyer_reviewing` | 6 STATE | Doc-2 §5.4 | shortlist legal only from `buyer_reviewing` | `STATE` |
| version match | 6 STATE / concurrency | Doc-4A §14 | `expected_version_no` = current | `CONFLICT` |
| quotation refs | 7 REFERENCE | Doc-4A §9.5; Doc-2 §10.4 | each `quotation_id` is a `submitted` quotation on this RFQ | `REFERENCE`/`NOT_FOUND` |
| shortlist soft-max | 9 POLICY | Doc-3 §12.2 `eval.shortlist_max` | count ≤ soft max | `BUSINESS` (soft cap) |

**5. Authorization Matrix** — Actor **User** · Slug **`can_approve_vendor_selection`** (Doc-2 §7) · Scope = buyer controlling org · Delegation **not eligible** · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`buyer_reviewing`** · Target **`shortlisted`** (Doc-2 §5.4) · Forbidden: all other states → `STATE` · Concurrency: optimistic on `expected_version_no`; shortlist edits are free pre-award but audited (Doc-3 §9.2). **No edge invented.**

**7. Audit Binding** — Action **Doc-2 §9 RFQ "shortlist"** · Attribution **User** · Object scope `rfqs` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **none** (no Doc-2 §8 shortlist event; state + audit only) · Consumed none · Shortlisted-vendor notification is Communication's (DE-6); non-shortlisted are **not** notified at this stage (Doc-3 §1.2/§9.2) · Idempotency: replay → same shortlist set, no duplicate audit.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / empty id list | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | RFQ not owned (collapse) | false |
| `STATE` | not `buyer_reviewing` | false |
| `REFERENCE` | a `quotation_id` not a submitted quote on this RFQ | false |
| `CONFLICT` | version race | true |
| `BUSINESS` | shortlist soft-max exceeded | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-RFQ-POLICY]`** — H.8); replay returns the same `shortlisted` state + set, no duplicate audit; the state assertion makes a second shortlist from a non-`buyer_reviewing` state a `STATE` no-op. Starts the decision clock (Doc-3 §9.2 — Part-1 validity-clock interaction, referenced).

**11. Cross-Module References** — **Identity (DE-1):** context, `check_permission`. **Communication (DE-6):** shortlisted-vendor notification (consumer leg). **Platform Core (DE-8):** audit-write. Others: none.

**12. AI-Agent Implementation Notes** — Non-shortlisted vendors are notified **only at terminal close** (Doc-3 §1.2/§9.5) — premature loss signals create noise; shortlist churn is free pre-award but audited. Shortlist is **state + audit only** (no Doc-2 §8 event). Decision-support: shortlisting is the buyer's choice, never auto-suggested.

---

## §E8.3 — `rfq.manage_clarification.v1` · `rfq.invoke_best_and_final.v1` — Clarification & Best-and-Final

**1. Contract Metadata** — Contract IDs `rfq.manage_clarification.v1`, `rfq.invoke_best_and_final.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (evaluation orchestration; **the thread channel is Communication-owned, DE-6**) · Actor **User** (buyer) · Bounded context **BC-5** (§E8).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 |
| `action` | `enum<post_clarification\|broadcast_material\|invoke_best_and_final>` | yes | no | 1 | Doc-3 §9.3 |
| `clarification_ref` | `uuid` | no | yes | 0..1 | Doc-3 §9.3 (RFQ-scoped thread ref — Communication-owned) |
| `common_deadline` | `timestamptz` | no | yes (req for best-and-final) | 0..1 | Doc-3 §9.3 (simultaneous sealed revision deadline) |

**3. Response Schema** — `rfq_id : uuid (1)`, `action_outcome : enum<applied> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `action`, conditional `common_deadline` | 1 SYNTAX | Doc-4A §9 | presence/type/enum; deadline required for best-and-final | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; buyer active-org context | `AUTHORIZATION` |
| AUTHZ | 3 AUTHZ | Doc-2 §7 | `can_approve_vendor_selection` (evaluation authority) or `can_create_rfq` (RFQ-owner orchestration) | `AUTHORIZATION` |
| RFQ owned + pre-award | 4 SCOPE / 6 STATE | Doc-4A §7.3; Doc-2 §5.4; Doc-3 §9.3 | buyer owns RFQ; RFQ pre-award (evaluation phase) | `NOT_FOUND`/`STATE` |
| best-and-final cap | 9 POLICY | Doc-3 §12.2 `eval.baf_rounds_max` | best-and-final invoked ≤ cap | `BUSINESS` |
| fair-information rule | 8 BUSINESS | Doc-3 §9.3 FIXED | material clarifications broadcast (anonymized) to all active invitees | `BUSINESS` |

**5. Authorization Matrix** — Actor **User** (buyer) · Slugs **`can_approve_vendor_selection`** / **`can_create_rfq`** (per action; Doc-2 §7) · Scope = buyer controlling org · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — No RFQ-head edge (pre-award orchestration) · Best-and-final opens a **simultaneous sealed revision window** for shortlisted vendors (Doc-3 §9.3) — reuses the quotation-revision machine (Part 4 §E7.2); the revision edges are Part-4-owned · Forbidden: post-award invocation → `STATE` · Concurrency: best-and-final invoked once (cap). **No edge invented.**

**7. Audit Binding** — Clarification/round actions audited via Doc-4B where they change RFQ/quotation state; **thread-message audit is Communication's** (DE-6). Attribution **User**. No audit action invented (binds nearest RFQ §9 action by pointer where applicable; **`[ESC-RFQ-AUDIT]`** if an evaluation-orchestration action is not separately enumerated).

**8. Event Binding** — Emitted **none new** from RFQ (notification/thread dispatch is Communication's — DE-6) · Consumed none · Idempotency: `Idempotency: required`; replay → same outcome, no duplicate.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / missing best-and-final deadline | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | RFQ not owned (collapse) | false |
| `STATE` | post-award / not in evaluation phase | false |
| `BUSINESS` | best-and-final cap exceeded; fair-information rule violated | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-RFQ-POLICY]`** — H.8); replay → same `action_outcome`, no duplicate thread/round; best-and-final cap enforced across replays.

**11. Cross-Module References** — **Communication (DE-6):** **owns the clarification/best-and-final thread channel and authors its contracts** — RFQ MUST NOT author a thread entity or Communication contract; material-clarification broadcast is dispatched by Communication. **Identity (DE-1):** `check_permission`. **Platform Core (DE-8):** audit-write. Best-and-final sealed revisions reuse Part-4 quotation revision.

**12. AI-Agent Implementation Notes** — **Author no clarification-thread entity or Communication contract here** (DE-6) — orchestrate the evaluation step; the thread is Communication's. **Material clarifications MUST be broadcast (anonymized) to all active invitees** (Doc-3 §9.3 fair-information rule FIXED) — never create insider-vendor dynamics. Best-and-final is the sanctioned simultaneous sealed negotiation (cap `eval.baf_rounds_max`); per-vendor sequential price-hammering is discouraged by design. Sealed revisions reuse Part-4 `revise_quotation`.

---

## §E8.4 — `rfq.award_rfq.v1` — Award (→ closed_won)

**1. Contract Metadata** — Contract ID `rfq.award_rfq.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (`rfqs` terminal) + drives the selected/other `quotations` edges; engagement is **Operations-owned (DE-4)** · Actor **User** (buyer) · Bounded context **BC-6** (§E8).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 |
| `expected_version_no` | `numeric` | yes | no | 1 | Doc-4A §14 (optimistic concurrency) |
| `selected_quotation_id` | `uuid` | yes | no | **1 (exactly one)** | Doc-2 §5.4 single-award cardinality; Doc-3 §9.4 |

**3. Response Schema** — `rfq_id : uuid (1)`, `state : enum (1) = closed_won`, `selected_quotation_id : uuid (1)`, `award_value : numeric (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `expected_version_no`, `selected_quotation_id` | 1 SYNTAX | Doc-4A §9 | presence/type; **exactly one** `selected_quotation_id` | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; buyer active-org context | `AUTHORIZATION` |
| `can_award_rfq` | 3 AUTHZ | Doc-2 §7 | slug held | `AUTHORIZATION` |
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns RFQ | `NOT_FOUND` (collapse, §7.5) |
| state = `shortlisted` | 6 STATE | Doc-2 §5.4 | award legal only from `shortlisted` | `STATE` |
| version match | 6 STATE / concurrency | Doc-4A §14 | `expected_version_no` = current | `CONFLICT` |
| selected-quote ref | 7 REFERENCE | Doc-4A §9.5; Doc-2 §10.4 | `selected_quotation_id` is a `submitted`/shortlisted quotation on this RFQ | `REFERENCE`/`NOT_FOUND` |
| single award | 8 BUSINESS | Doc-2 §5.4 FIXED | exactly one selected quotation (multi-award foreclosed — split = re-issue) | `BUSINESS` |
| ORG award threshold | 8 BUSINESS | Doc-3 §9.4; Identity ORG | value above org threshold requires Director/Owner approval (consumed from Identity) | `BUSINESS` |

**5. Authorization Matrix** — Actor **User** · Slug **`can_award_rfq`** (Doc-2 §7) · Scope = buyer controlling org · Delegation **not eligible** · ORG award-threshold rule consumed from Identity (Doc-3 §9.4) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`shortlisted`** · Target **`closed_won`** (Doc-2 §5.4; terminal) · The selected `quotations` row **`submitted → selected`**; all other open quotations **`submitted → not_selected`** (Doc-2 §5.5) — **Part-5-owned side** of these edges (Part 4 deferred them) · Forbidden: award from any non-`shortlisted` state, or >1 selected → `STATE`/`BUSINESS` · Concurrency: **one transaction** — RFQ `closed_won` + selected `selected` + others `not_selected` + `RFQClosedWon`/`QuotationSelected` outbox inserts atomic (modular monolith, Doc-2 §10.11.4). Terminal — never reopens (re-issue is BC-1). **No edge invented** (1:1 award cardinality).

**7. Audit Binding** — Action **Doc-2 §9 RFQ "close won"** + Quotation **"select"** (the selected quote) · Attribution **User** (buyer) · Object scope `rfqs` + selected `quotations` row · Timing same transaction · Source Doc-2 §9 + Doc-4B. Award records deal value (transaction intelligence).

**8. Event Binding** — Emitted **`RFQClosedWon`** + **`QuotationSelected`** (Doc-2 §8) via Doc-4B outbox-write, same transaction · Consumed none · Primary consumers: **engagement creation (Operations, DE-4)**, performance inputs (Trust, DE-3), transaction intelligence (Doc-2 §8) — author their own legs · Idempotency: replay → one `closed_won`, one `RFQClosedWon`/`QuotationSelected`.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / not exactly one selected | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | RFQ not owned (collapse) | false |
| `STATE` | not `shortlisted` | false |
| `REFERENCE` | `selected_quotation_id` not valid on this RFQ | false |
| `CONFLICT` | version/state race (double award) | true |
| `BUSINESS` | >1 selected; ORG award-threshold approval missing | false |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-RFQ-POLICY]`** — H.8); the state assertion (`shortlisted`) + `expected_version_no` make a replayed award return the `closed_won` result with **no second engagement, no duplicate `RFQClosedWon`/`QuotationSelected`, no duplicate audit**; concurrent awards resolve to one (loser → `CONFLICT`).

**11. Cross-Module References** — **Operations (DE-4):** `RFQClosedWon` → Operations **creates the engagement** (RFQ does **not** author it). **Trust (DE-3):** consumes for performance inputs. **Communication (DE-6):** closure notifications (consumer leg). **Identity (DE-1):** `check_permission` + ORG award-threshold config. **Platform Core (DE-8):** audit-write, outbox-write. **Firewall:** no plan/entitlement gates award (§4B).

**12. AI-Agent Implementation Notes** — **Single award only** (Doc-2 §5.4 cardinality FIXED) — exactly one `selected_quotation_id`; split needs are a **re-issue** (BC-1, Part 1 `reissue_rfq`), never multi-award. The **engagement is Operations'** (DE-4), created off `RFQClosedWon` — never authored here. RFQ + quotation transitions are **one atomic transaction** (Doc-2 §10.11.4). Award records deal value. Terminal — never reopen. No plan influence on award (§4B).

---

## §E8.5 — `rfq.close_lost_rfq.v1` — Close Without Award (→ closed_lost)

**1. Contract Metadata** — Contract ID `rfq.close_lost_rfq.v1` · Template **21.4 Command** · Owned aggregate **RFQ** (`rfqs` terminal) + drives open `quotations` `→ not_selected` · Actor **User** (buyer) · Bounded context **BC-6** (§E8).

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Source authority |
|---|---|---|---|---|---|
| `rfq_id` | `uuid` | yes | no | 1 | Doc-2 §10.4 |
| `expected_version_no` | `numeric` | yes | no | 1 | Doc-4A §14 |
| `reason_code` | `enum` (POLICY-managed list: budget_dropped\|requirement_changed\|no_suitable_quotes\|sourced_off_platform\|other) | yes | no | 1 | Doc-3 §1.2/§9.5 (structured reason) |
| `reason_text` | `text` | no | yes (req iff other) | 0..1 | Doc-3 §9.5 |

**3. Response Schema** — `rfq_id : uuid (1)`, `state : enum (1) = closed_lost`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `expected_version_no`, `reason_code`, conditional `reason_text` | 1 SYNTAX | Doc-4A §9 | presence/type/enum; `reason_text` required when `reason_code=other` | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; buyer active-org context | `AUTHORIZATION` |
| AUTHZ | 3 AUTHZ | Doc-2 §7 | `can_approve_vendor_selection` (close from `shortlisted`) — or `can_award_rfq` where the org binds closure to award authority | `AUTHORIZATION` |
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns RFQ | `NOT_FOUND` (collapse, §7.5) |
| state = `shortlisted` (or active per §1.2) | 6 STATE | Doc-2 §5.4 | close-without-award legal from `shortlisted` | `STATE` |
| version match | 6 STATE / concurrency | Doc-4A §14 | `expected_version_no` = current | `CONFLICT` |

**5. Authorization Matrix** — Actor **User** · Slugs **`can_approve_vendor_selection`** (close-without-award) / **`can_award_rfq`** (where org binds closure to award authority) (Doc-2 §7) · Scope = buyer controlling org · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **`shortlisted`** · Target **`closed_lost`** (Doc-2 §5.4; terminal) · Open `quotations` rows **`submitted → not_selected`** (Doc-2 §5.5) — Part-5-owned side · Forbidden: close from a non-eligible state → `STATE`; terminals never reopen · Concurrency: one transaction (RFQ `closed_lost` + open quotations `not_selected` + `RFQClosedLost` outbox insert atomic — Doc-2 §10.11.4). **No edge invented.**

**7. Audit Binding** — Action **Doc-2 §9 RFQ "close won/lost"** (lost branch) + Quotation **"reject"** (the not-selected quotes, where §9 "reject" applies) · Attribution **User** · Object scope `rfqs` + open `quotations` rows · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`RFQClosedLost`** (Doc-2 §8) via Doc-4B outbox-write · Consumed none · Primary consumer: uniform closure notification (Communication, DE-6) · Idempotency: replay → one `closed_lost`, one `RFQClosedLost`.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX / missing reason (or `reason_text` on other) | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | RFQ not owned (collapse) | false |
| `STATE` | not in an eligible close state / terminal | false |
| `CONFLICT` | version/state race | true |
| `SYSTEM` | unexpected | true |

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-RFQ-POLICY]`** — H.8); the state assertion makes a replayed close return `closed_lost` with no duplicate `RFQClosedLost`/audit and no double quotation-reject; a second close from a terminal state is a `STATE` no-op.

**11. Cross-Module References** — **Communication (DE-6):** uniform closure notification to non-selected responders (consumer leg); banded (never exact) loss feedback opt-in (Doc-3 §9.5). **Identity (DE-1):** `check_permission`. **Platform Core (DE-8):** audit-write, outbox-write. Others: none.

**12. AI-Agent Implementation Notes** — Loss feedback is **banded, not exact, off by default** (Doc-3 §9.5 — exact deltas train quote dumping); **expiry-without-buyer-action feeds nothing negative for vendors** (FIXED fairness: buyer silence ≠ vendor failure). Structured `reason_code` from the POLICY-managed list (Doc-3 §1.2/§9.5) — bound by the list, not invented. Terminal — never reopen.

---

## §E8.6 — `rfq.get_comparison_statement.v1` — Read Comparison

**1. Contract Metadata** — Contract ID `rfq.get_comparison_statement.v1` · Template **21.3 Query** · Owned aggregate **Comparison Statement** (`comparison_statements`) · Actor **User** (buyer) · Bounded context **BC-5** (§E8).

**2. Request Schema** — `rfq_id : uuid (1, required)`; `version_no : numeric (0..1, nullable — omitted ⇒ current)`.

**3. Response Schema** — `comparison : comparison_projection (1)` (`matrix` bands per scope + **buyer-private columns for the buyer only**); `version_no : numeric (1)`; `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id` / `version_no` | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| actor + active org | 2 CONTEXT | Doc-4A §5.3 | User; buyer active-org context | `AUTHORIZATION` |
| read authority | 3 AUTHZ | Doc-2 §7 | `can_view_rfq` / `can_view_all_rfqs` + evaluation visibility | `AUTHORIZATION` |
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3/§7.5 | buyer controlling org owns the RFQ; buyer-private columns buyer-only | `NOT_FOUND` (collapse, §7.5) |
| reference | 7 REFERENCE | Doc-4A §9.5 | `rfq_id`/`version_no` exists | `NOT_FOUND` |

**5. Authorization Matrix** — Actor **User** (buyer) · Slugs **`can_view_rfq`** / **`can_view_all_rfqs`** (Doc-2 §7) · Scope = buyer controlling org · Delegation not eligible · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — **The first buyer open drives `quotations_received → buyer_reviewing`** (Doc-2 §5.4); the system also auto-advances at quotation-window close — **whichever is first** (Doc-3 §1.2; Pass-A PA-16). Vendor-facing status shows "under evaluation" only from `buyer_reviewing`. The read itself is otherwise side-effect-free; the first-open transition is audited via the lifecycle. **No edge invented** (the `quotations_received → buyer_reviewing` edge is the existing Doc-2 §5.4 edge).

**7. Audit Binding** — The **first-open state transition** is audited via the lifecycle (Doc-2 §9 RFQ; the transition, not the read); the read itself is **not** audited (§17.1).

**8. Event Binding** — None (read; emits/consumes nothing).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed `rfq_id`/`version_no` | false |
| `AUTHORIZATION` | actor/slug fail | false |
| `NOT_FOUND` | RFQ/version not visible to caller (no-access ≡ not-found, §7.5) | false |

**10. Idempotency Rules** — The read is side-effect-free **except** the one-time first-open `quotations_received → buyer_reviewing` transition (idempotent — once in `buyer_reviewing`, subsequent opens do not re-transition); no `Idempotency` header required (the transition is naturally idempotent on state).

**11. Cross-Module References** — **(reads)** vendor-standing display bands from `matching_results` via the stored comparison (PA-04 — not a live Trust/Marketplace read). **Identity (DE-1):** `check_permission`. Others: none.

**12. AI-Agent Implementation Notes** — The comparison shows standing bands but **never an auto-recommended winner** (Doc-3 §9.1 FIXED). **Buyer-private columns are never exposed to vendors** (non-disclosure). The first buyer open (or window-close, whichever first) advances `quotations_received → buyer_reviewing` — the only side effect of this read (PA-16). Display data is from `matching_results` (PA-04), never a live signal read.

---

## Part-5 Conformance Summary (BC-5 + BC-6 — 6 contracts)

| Contract | Template | RFQ / quotation transition | Emitted | Audit action (Doc-2 §9) | Carried marker |
|---|---|---|---|---|---|
| `rfq.generate_comparison_statement.v1` | 21.5 System | none (versioned comparison refresh) | none | none (derived; not audited) | DE-8 (reads `matching_results`) |
| `rfq.shortlist_quotation.v1` | 21.4 Command | `buyer_reviewing → shortlisted` | none | RFQ "shortlist" | DE-1/DE-6/DE-8 · `[ESC-RFQ-POLICY]` |
| `rfq.manage_clarification.v1` / `invoke_best_and_final.v1` | 21.4 Command | none (orchestration; best-and-final reuses Part-4 revise) | none | (nearest §9 / `[ESC-RFQ-AUDIT]`) | DE-1/DE-6/DE-8 · `[ESC-RFQ-POLICY]` |
| `rfq.award_rfq.v1` | 21.4 Command | `shortlisted → closed_won`; selected `submitted → selected`, others `→ not_selected` | `RFQClosedWon`, `QuotationSelected` | RFQ "close won" + Quotation "select" | DE-1/DE-3/DE-4/DE-6/DE-8 · `[ESC-RFQ-POLICY]` |
| `rfq.close_lost_rfq.v1` | 21.4 Command | `shortlisted → closed_lost`; open quotations `→ not_selected` | `RFQClosedLost` | RFQ "close won/lost" + Quotation "reject" | DE-1/DE-6/DE-8 · `[ESC-RFQ-POLICY]` |
| `rfq.get_comparison_statement.v1` | 21.3 Query | first open drives `quotations_received → buyer_reviewing` (PA-16) | none | (transition audited via lifecycle; read not audited) | DE-1 |

**Governance confirmation (Part 5).** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template was created or changed; all bindings are by pointer to `Doc-4E_PassA_v1.0_FROZEN` and the frozen corpus. **Evaluation/comparison/award behavior is Doc-3 §9 and the Doc-2 §5.4/§5.5 machines, bound by pointer — not re-derived.** **Decision-support never auto-decision** (no auto-winner); **single award** (1:1 cardinality; split = re-issue); **buyer-preference firewall** (buyer-scoped only); **quotation confidentiality** preserved (bands + buyer-private columns; vendor isolation); **clarification thread is Communication's** (DE-6, not authored); **engagement is Operations'** (DE-4, created off `RFQClosedWon`). No plan/entitlement gates evaluation/comparison/award (§4B). Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`, `[ESC-RFQ-SLUG]` referenced by name and unresolved. No corpus detail was absent; **no flag-and-halt triggered**.

**Pass-B completion note.** Part 5 is the **final Pass-B part**. With Parts 1–4 FROZEN and the Cross-Part Consistency Audit PASS, Part 5's freeze (after Review → Patch → Patch Verification → Freeze Audit) completes Doc-4E Pass-B across all six bounded contexts (BC-1…BC-7), enabling the full-module Doc-4E freeze.

---

*End of Doc-4E — RFQ Procurement Engine — Content v1.0, Pass-B (hardening), Part 5 of 5 (FINAL) — BC-5 Buyer Evaluation & Comparison + BC-6 Procurement Decision & Closure. The 6 §E8 contracts hardened to implementation grade (metadata · request/response schemas · validation matrix · authorization matrix · state-machine enforcement · audit binding · event binding · error register · idempotency · cross-module references · AI-agent notes), bound by pointer to Doc-4E_PassA_v1.0_FROZEN and the frozen corpus; evaluation/award behavior bound to Doc-3 §9 + Doc-2 §5.4/§5.5, never re-derived; decision-support-never-decision, single-award, buyer-preference firewall, and quotation confidentiality preserved; nothing invented. This completes Pass-B authoring (Parts 1–5); next: Part-5 review/patch/freeze cycle, then full-module Doc-4E freeze.*
