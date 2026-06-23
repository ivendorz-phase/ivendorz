# Doc-4G — Trust & Verification Engine — Pass-B (Hardening) Part 3 v1.0 — BC-TRUST-3 Performance Scoring

| Field | Value |
|---|---|
| Document | Doc-4G — **Pass-B Part 3 v1.0** — Module 5 Trust & Verification (`trust` schema, `trust_` namespace) |
| Part scope | **BC-TRUST-3 — Performance Scoring (§G6)** — the Pass-A §G6 contracts (Performance Score aggregate + `performance_inputs`), hardened to implementation grade |
| Status | **Pass-B Part 3 draft — implementation-grade contract specification for BC-TRUST-3.** Independently reviewable. Authorized next stage after review/patch: **Doc-4G_PassB_Part4 (BC-TRUST-4 Fraud & Risk Signals).** |
| Contract authority | `Doc-4G_PassA_v1.0_FROZEN` (sole contract authority — **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4G_Structure_v1.0_FROZEN` (F4G-M2 single-writer; F4G-M3 Buyer-Feedback dual-path) |
| Carry-forward | `Doc-4G_PassB_Part1_v1.0_FROZEN` + `Doc-4G_PassB_Part2_v1.0_FROZEN` (frozen conventions honored: canonical nine-stage validation; System-actor scoring; single publisher of record per event; frozen-state = recompute allowed / publication suppressed; public badge-only reads; single input-ownership expression) |
| Authority | Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN, Doc-4G Pass-A FROZEN, Doc-4G PassB Part1 FROZEN, Doc-4G PassB Part2 FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-TRUST-1 Verification & Verified Tier · Part 2 — BC-TRUST-2 Trust Scoring · **Part 3 — BC-TRUST-3 Performance Scoring** · Part 4 — BC-TRUST-4 Fraud & Risk Signals · Part 5 — BC-TRUST-5 Reviews & Admin Ratings |
| Audience | Claude Code / Cursor / Codex / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Pass-B mission (Part 3).** Convert the Pass-A BC-TRUST-3 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices in the canonical Pass-B nine-stage presentation (Doc-4A §11.2 enforcement authority), authorization matrices, state-machine enforcement, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), and idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §G6. **Performance Score is owned exclusively by BC-TRUST-3.** It **may consume** operational completion outcomes, buyer-feedback inputs, and verified operational signals (the Operations performance-input events + the RFQ `QuotationSubmitted` response leg + the in-module published-review Buyer-Feedback); it **may NOT mutate Trust Score, Verification, or Fraud** — BC-TRUST-3 is **owner only of Performance Score** and consumer of its inputs. **Performance Score is System-computed** — no vendor/buyer/staff score edit; no manual mutation; administrative action may **freeze/reactivate publication only**, as authorized by the frozen corpus. `performance_inputs` has a **single writer** (`trust.ingest_performance_input.v1`, F4G-M2). The **procurement moat** holds — Performance Score is a **signal only**; BC-TRUST-3 owns no matching/routing/ranking/evaluation/supplier-selection/award; RFQ authoritative. Carried dependencies **DG-2, DG-3, DG-4, DG-6, DG-8** (the BC-TRUST-3 seams) and the markers **`[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 3.

---

## §H — Part-3 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (canonical Pass-B presentation; Doc-4A §11.2 is the enforcement authority).** The single canonical stage vocabulary used by **every** Validation Matrix in this Part is `1 SYNTAX → 2 SHAPE → 3 SEMANTIC → 4 AUTHENTICATION → 5 AUTHORIZATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY` (the frozen Part-1/Part-2 presentation). **Enforcement authority (Doc-4A §11.2, FROZEN — order and logic unchanged):** `1 SYNTAX` + `2 SHAPE` enforce §11.2 SYNTAX (presence/type/bounds/enum + cardinality/nullable/shape, §9); `3 SEMANTIC` and `8 BUSINESS` enforce §11.2 BUSINESS (domain-meaning rules); `4 AUTHENTICATION` enforces §11.2 CONTEXT (§5.2/§5.3/§5.6); `5 AUTHORIZATION` enforces §11.2 AUTHZ + SCOPE + DELEGATION (§6/§6B); `6 STATE` / `7 REFERENCE` / `9 POLICY` enforce the identically-named §11.2 stages. Order is exactly §11.2, never reordered. Failure terminates at the first failing stage; SYNTAX/SHAPE MAY aggregate field errors, later stages fail singly. For **System contracts (21.5)** with no tenant, stages 4–5 collapse to a single **trigger-authenticity** check (Doc-4A §21.5/§11.2). Each row names **stage · source authority · rule (validation) · failure outcome (failure class)**.
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source — never extended), `numeric`, `string`, `jsonb` (opaque; Pass-B fixes presence/shape boundary, not internal field schema), `timestamptz`, `bool`. **Required** = present + non-null (absence → SYNTAX). **Nullable** stated per field — note `performance_scores.score` is **NULLABLE** (NULL = Not Rated). Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** **Performance Score computation and `performance_inputs` ingestion carry NO slug — System-actor / internal-service only** (auto-calculated, never hand-edited; Doc-4A §5.2; Doc-2 §3.6). The only tenant/staff-authorized BC-TRUST-3 actions are **freeze/reactivate** (platform-staff governance) and **inputs/history reads** (staff). **Confirmed Doc-2 §7 slugs used in this Part:** `staff_can_verify`, `staff_can_ban` (freeze/reactivate governance; inputs/history reads use `staff_can_verify`). The **performance badge read is public** (Doc-2 §3.6 "badge published unless frozen") — no slug. Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C, consumed; no shadow authorization). Staff actions are platform-staff (no active-org context, §5.6), **not delegation-eligible**. Where a required staff action lacks a §7 slug → **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive; no slug invented). **Same System-actor authorization model as the frozen Part-1 §G4.5 / Part-2 §G5.1 System contracts** (Authorization = none; enforcement = trigger-authenticity).
- **H.4 — Error model (Doc-4A §12; closed twelve-class set, Annexure B).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes `trust_<domain>_<code>` (namespace `trust_`); numeric codes are dev-doc stage — Pass-B fixes **class + trigger + retryable**. **Mandatory separations (never conflated):** **REFERENCE** (Domain, 422 — a reference ID is syntactically valid but does not resolve to an existing entity, e.g. an unresolved `source_entity_id`) ≠ **DEPENDENCY** (Infrastructure, 503, retryable — a consumed event-source/read-service is transiently unavailable); **STATE** (Domain, 409 — entity not in a valid pre-state, e.g. freeze/reactivate on the wrong `freeze_state`) ≠ **CONFLICT** (Concurrency, 409, retryable after re-read — optimistic-concurrency token mismatch). The **Error Boundary block** (§12.4/§12.6) is stated per contract; the performance **badge is public**, so the badge read carries no protected-fact collapse (the inputs/history surface is staff-gated).
- **H.5 — State machine (Doc-2 §3.6/§10.6; Doc-4A §13).** The BC-TRUST-3 lifecycles are exactly: **Performance Score** (`performance_scores`): **`not_rated → computed | frozen`** — `not_rated` until `min_threshold_met` (**5 responses OR 2 projects**, Doc-2 §10.6); freeze "suspends publication and ranking effect only" (Doc-2 §3.6, frozen-corpus rule); **`performance_score_history`** append-only; **`performance_inputs`** append-only (correctable; corrections audited). Transitions: ingest appends a `performance_inputs` row; compute writes/updates the score (NULL while `not_rated`) + a history snapshot on change; freeze sets `freeze_state=frozen`; reactivate clears it. **Frozen-state behavior (authoritative, Doc-2 §3.6 "publication and ranking effect only"):** under `freeze_state=frozen`, **recomputation is ALLOWED, history-snapshot creation is ALLOWED, publication is SUPPRESSED** (the underlying score stays current; only badge/ranking effect is withheld until reactivation) — identical to the frozen Part-2 §G5.1 ruling. Every mutation cites allowed **source state(s)**, **target state**, **forbidden source states** (→ `STATE`). Concurrency: optimistic — mutating commands assert the expected row revision; lost race → `CONFLICT`. **No edge added or modified.**
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 Trust audit action**, **actor attribution** (`System` for ingestion/computation/review-trigger; `Admin` for freeze/reactivate), **object scope** (the `trust.performance_*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B). Reads are not audited (§17.1). The **separately-enumerated** Doc-2 §9 **Trust** actions this Part binds directly are: **"recalculation"** and **"formula version change"** (computation); **"trust/performance freeze + reactivation"** (freeze/reactivate). **`performance_inputs` ingestion rows** and the **review-trigger** are **not** separately enumerated in §9 → carry **`[ESC-TRUST-AUDIT]`** (interim: nearest §9 Trust action — "recalculation" — by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §G6/§G12/§G14. Performance-input **corrections** are audited (Doc-2 §3.6 `performance_inputs` "corrections audited").
- **H.7 — Events (Doc-2 §8 via Doc-4B `core.write_outbox_event.v1`); single publisher of record per event (frozen Part-2 discipline).** The Performance Score aggregate owns exactly three events: **`PerformanceScoreUpdated`**, **`PerformanceReviewTriggered`**, **`PerformanceFrozen`** (Doc-2 §8 — `trust.performance_scores`), each written transactionally (business write + event insert one transaction); **no event coined** (§16.4). **Single publisher of record per event (authoritative; no publisher ambiguity):** `PerformanceScoreUpdated` → publisher of record **`trust.compute_performance_score.v1`** (emitted on a score change, and on a reactivation-driven publication-state change); `PerformanceReviewTriggered` → publisher of record **`trust.trigger_performance_review.v1`**; `PerformanceFrozen` → publisher of record **`trust.freeze_performance_score.v1`** (emitted on freeze). **Reactivate (`trust.reactivate_performance_score.v1`) emits no event directly** — it **requests** the resumed publication, which the `PerformanceScoreUpdated` publisher of record performs. **`trust.ingest_performance_input.v1` emits NO event** (it appends inputs; computation publishes). **Consumed (Doc-2 §8, other modules):** the Operations five (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`), the RFQ `QuotationSubmitted` (response leg), and Marketplace `VendorOwnershipTransferred` (Trust-Protection freeze trigger). BC-TRUST-3 **emits no Marketplace/RFQ effect** — those modules consume `PerformanceScoreUpdated` and author their own effects (single-authorship, Doc-4A §4.4). Notification fan-out is Communication's (DG-6).
- **H.8 — Idempotency (Doc-4A §14).** **Ingestion** (`trust.ingest_performance_input.v1`, 21.5) is an **idempotent consumer**: dedup on event identity (Doc-2 §8 event id) for the Operations/RFQ events, and on `(source_type, source_entity_id, input_type)` for source-ref/in-module inputs — at-least-once delivery never produces a duplicate `performance_inputs` row. **Computation** (21.5) is idempotent on inputs+`performance_formula_version`: unchanged inputs/formula → same score, **no new `PerformanceScoreUpdated`, no new snapshot** (publish-on-change). **Review-trigger** (21.5) dedups on the trigger condition window. **Freeze/reactivate** (21.6) carry `Idempotency: required` + dedup window — re-freeze of a `frozen` / re-reactivate of a non-`frozen` score is a no-op. **No `trust` dedup-window key is registered in Doc-3 §12.2** → carried under **`[ESC-TRUST-POLICY]`** (reference platform default by name; no key invented). Queries (21.3) are side-effect-free (`Idempotency: not-applicable`, §14.1).
- **H.9 — Trust-firewall & moat enforcement (Architecture §1.5/Invariant 6; Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED — load-bearing, single authoritative statement).** (a) **Performance Score is platform-owned, System-computed; no tenant, no staff, no vendor, no buyer, and no other module mutates the score** — only `trust.compute_performance_score.v1` writes it, under the System actor; **administrative action may freeze/reactivate publication only** (never edit the score). (b) **`performance_inputs` has a single writer** — `trust.ingest_performance_input.v1` (F4G-M2); BC-TRUST-5 (and any other in-module contributor) **invokes** it, never writes `performance_inputs` directly. (c) **BC-TRUST-3 is owner-only of Performance Score and consumer of its inputs** — it consumes operational completion outcomes, buyer-feedback inputs, and verified operational signals, and **may NOT mutate Trust Score (BC-TRUST-2), Verification (BC-TRUST-1), or Fraud (BC-TRUST-4)**; those stay owned by their source contexts. (d) **Financial Tier never affects Performance Score; Buyer-Vendor Status never mutates it; no signal dominates** (Architecture §1.5 firewall FIXED; Invariant 6). (e) **No paid plan/entitlement/flag gates or influences the Performance Score** (Doc-4A §4B; DG-7 — Billing has no input). (f) **Not Rated, never zero:** below `min_threshold_met` (5 responses OR 2 projects) the score is **`not_rated` (NULL)** — **absence-of-history is never scored as 0** (Doc-3 §12.1 FIXED); **expiry/freeze never penalizes a vendor** (Doc-3 §12.1 FIXED). (g) **Procurement moat:** BC-TRUST-3 computes no matching/routing/ranking/evaluation/selection/award; the performance badge/score is a **signal** RFQ consumes (DG-3), never a decision Trust makes.
- **H.10 — Buyer-Feedback dual-path (Doc-4G Structure FROZEN F4G-M3; single authoritative statement).** The Buyer-Feedback performance component is fed by **two distinct sources**, recorded as **distinct `performance_inputs` rows with distinct `source_type`**: **Path A** = `BuyerFeedbackRecorded` (Operations event; `source_type=engagement`, `input_type=feedback`); **Path B** = published `public_reviews` (BC-TRUST-5, in-module, via the ingestion service; `source_type` distinguishes it). Both feed the **same** Buyer-Feedback component; **de-duplication and weighting are performed at computation** (`trust.compute_performance_score.v1`, Doc-2 §10.6 component renormalization) — the two rows are **never naively summed**; one feedback contribution per engagement/review. No double-count.
- **H.11 — `trust` BC-TRUST-3 field source (Doc-2 §10.6).** The hardened schemas bind to the frozen Doc-2 §10.6 columns; **Pass-B introduces no column**:
  - `performance_scores`: `vendor_profile_id` (UNIQUE), `score` (0–100, **NULLABLE** = Not Rated), `level`, `components_jsonb` (6 weighted; renormalized), `performance_formula_version`, `performance_score_updated_at`, `freeze_state`, `min_threshold_met` (5 responses OR 2 projects) (+ standard columns; lifecycle `not_rated | computed | frozen`).
  - `performance_score_history`: → `performance_scores`; append-only snapshots.
  - `performance_inputs`: `vendor_profile_id`, `source_entity_id` + `source_type enum<invitation|quotation|engagement|wcc>`, `input_type enum<response|decline|non_response|delivery|feedback|dispute|completion>`, `occurred_at`, `value_jsonb` (append-only; corrections audited).
  - *(read-only, owned elsewhere — never mutated)* Trust Score (BC-TRUST-2), Verification (BC-TRUST-1), Fraud (BC-TRUST-4); Operations events (DG-4, consumed); RFQ `QuotationSubmitted` + invitation source refs (DG-3, read); Marketplace `VendorOwnershipTransferred` (DG-2, consumed) + directory read-model (DG-2, projection target).

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.** Grouped families share section 1 and split the records where the schema differs.

---

## §G6.1 — `trust.ingest_performance_input.v1` — Performance-Input Ingestion (sole writer)

**1. Contract Metadata** — Contract ID `trust.ingest_performance_input.v1` · Template **21.5 System** (Response: none) · Owned aggregate **Performance Score** (`performance_inputs` append-only child) · Actor types **System / internal-service** (Doc-2 §8 event consumer + in-module ingestion service) · Bounded context **BC-TRUST-3** (§G6) · **Sole writer of `performance_inputs` (F4G-M2); no tenant/staff/vendor/buyer write path.**

**2. Request Schema** *(System / internal-service trigger; no tenant body)* — internal parameters: `vendor_profile_id : uuid (1, required)`, `source_type : enum<invitation|quotation|engagement|wcc> (1, required)`, `source_entity_id : uuid (1, required)`, `input_type : enum<response|decline|non_response|delivery|feedback|dispute|completion> (1, required)`, `occurred_at : timestamptz (1, required)`, `value_jsonb : jsonb (0..1)`, `source_event_id : uuid (0..1)` (the Doc-2 §8 event id for dedup, when event-sourced). Enums are exactly Doc-2 §10.6 — never extended.

**3. Response Schema** — **none** (21.5 System; Doc-4A §21.5). Internal effect: one appended `performance_inputs` row (or no-op on idempotent replay); `reference_id : uuid` recorded on the audit record.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| required params present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` (internal) |
| `source_type`/`input_type` ∈ frozen enums; UUID/timestamp shape | 2 SHAPE | Doc-2 §10.6 | enum membership; field shape | `VALIDATION` |
| input semantics valid | 3 SEMANTIC | Doc-2 §10.6 | `input_type` consistent with `source_type` (e.g. `response/decline/non_response` only with `source_type=invitation` — "only delivered invitations generate response/non_response inputs"); `feedback` with `engagement`/review source | `BUSINESS` |
| trigger authenticity | 4 AUTHENTICATION / 4–5 collapse (System) | Doc-4A §21.5/§11.2 | System/internal-service; **Authorization = none (no slug)**; enforcement = trigger-authenticity | `AUTHORIZATION` (untrusted trigger) |
| 5 AUTHORIZATION (System-actor) | 5 AUTHORIZATION | Doc-4A §5.2/§21.5 | **none — System/internal-service, no slug** (H.3); collapsed into §4 | — |
| append-only target | 6 STATE | Doc-2 §3.6/§10.6 | `performance_inputs` is append-only (no update/delete; corrections are new audited rows) | `STATE` (mutation attempt) |
| `source_entity_id` resolves | 7 REFERENCE | Doc-2 §10.6; DG-3/DG-4 | the invitation/quotation/engagement/wcc ref resolves (read) | `REFERENCE` (unresolved ref) ; `DEPENDENCY` (source/read-service down) |
| firewall / not-from-Billing | 8 BUSINESS | Architecture §1.5; Doc-4A §4B | input is an operational/feedback signal; no Billing-derived input | `BUSINESS` |
| (policy) | 9 POLICY | Doc-3 §12.2 | dedup-window key absent → `[ESC-TRUST-POLICY]` | `BUSINESS` (policy-derived) |

**5. Authorization Matrix** — Actor **System / internal-service** · **Authorization = none** (System actor; **no slug** — no tenant/staff/vendor/buyer slug; Doc-4A §5.2) · Scope = platform/system · Delegation n/a · **Enforcement = trigger-authenticity** (Doc-4A §21.5; stages 4–5 collapse). In-module invocation by BC-TRUST-5 (Path B) is an internal-service call, not a tenant action.

**6. State Machine Enforcement** — Target: append one `performance_inputs` row (Doc-2 §10.6 append-only) · A **correction** is a **new audited row**, never an in-place update/delete (Doc-2 §3.6 "corrections audited") · Forbidden: any update/delete of an existing `performance_inputs` row → `STATE`; any write by a context other than BC-TRUST-3's ingestion service → forbidden (F4G-M2 single writer) · Concurrency: idempotent append (see §10) — no `CONFLICT` on duplicate delivery (deduped).

**7. Audit Binding** — Action **`[ESC-TRUST-AUDIT]`** — `performance_inputs` ingestion is not separately enumerated in Doc-2 §9 → nearest §9 Trust action ("recalculation") by pointer (channel Doc-2 §9 additive; **no action invented**) · **Corrections audited** (Doc-2 §3.6) · Attribution **System** · Object scope `performance_inputs` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **Emits NO event** (H.7 — ingestion appends inputs; computation publishes) · **Consumed (Doc-2 §8):** `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` (Operations → delivery/completion/dispute/feedback rows), `QuotationSubmitted` (RFQ → response row) · **Non-events:** invitation `decline`/`non_response` are Doc-2 §10.6 source-ref-derived (`source_type=invitation`; only delivered invitations) — **no event, none may be invented** (`non_response` is an absence); the BC-TRUST-5 published-review Buyer-Feedback feed is an **in-module ingestion-service call** (Path B, H.10), not a cross-module event.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed params / enum out of Doc-2 §10.6 set | false |
| `AUTHORIZATION` | untrusted/forged trigger | false |
| `STATE` | attempt to update/delete an existing input (append-only) | false |
| `REFERENCE` | `source_entity_id` syntactically valid but unresolved | false |
| `BUSINESS` | `input_type`/`source_type` inconsistency; Billing-derived input | false |
| `DEPENDENCY` | event source / read-service / Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** System contract — no tenant-facing surface; stages 4–5 collapse to trigger-authenticity. **REFERENCE vs DEPENDENCY:** unresolved `source_entity_id` → `REFERENCE` (422); event-source/read-service outage → `DEPENDENCY` (503, retryable). No `CONFLICT` — duplicate deliveries are deduped (§10), not raced.

**10. Idempotency Rules** — `Idempotency: required` — **idempotent consumer**: dedup on `source_event_id` (Doc-2 §8 event identity) for the Operations/RFQ events, and on `(source_type, source_entity_id, input_type)` for source-ref/in-module inputs; at-least-once redelivery → **one** `performance_inputs` row, no duplicate. A correction is a distinct audited row (not a replay). Dedup-window key absent from Doc-3 §12.2 → **`[ESC-TRUST-POLICY]`** (platform default by name; no key invented).

**11. Cross-Module References** — **Operations (DG-4):** owns the five events; Trust owns the `performance_inputs` effect (its own consumer). **RFQ (DG-3):** owns `QuotationSubmitted` and the invitation/quotation source refs (read-only). **Intra-module (B.9b):** BC-TRUST-5 invokes this contract on review publish (Path B). **Platform Core (DG-8):** outbox/audit. **Billing (DG-7):** no input (firewall).

**12. AI-Agent Implementation Notes** — **`performance_inputs` has exactly one writer — this contract** (F4G-M2); BC-TRUST-5 **invokes** it, never writes the table directly; no tenant/staff/vendor/buyer write path. `input_type`/`source_type` enums are exactly Doc-2 §10.6 — never extend; `non_response` is a **derived absence** (no event, no POLICY key — never invent). Idempotent consumer (dedup on event id / source-ref triple). Corrections are **new audited rows**, never in-place edits. Computes no procurement decision from these refs (moat).

---

## §G6.2 — `trust.compute_performance_score.v1` — Compute Performance Score

**1. Contract Metadata** — Contract ID `trust.compute_performance_score.v1` · Template **21.5 System** (Response: none) · Owned aggregate **Performance Score** (`performance_scores` AR + `performance_score_history` append-only) · Actor types **System** (recompute on input change / scheduled / formula-version change; §5.2) · BC-TRUST-3 (§G6) · **System-actor only — no vendor/buyer/staff/manual score edit (H.9).** **Publisher of record for `PerformanceScoreUpdated` (H.7).**

**2. Request Schema** *(System trigger; no tenant body)* — internal parameters: `vendor_profile_id : uuid (1, required)`, `trigger : enum<input_change|scheduled_recalc|formula_version_change> (1, required)`. No caller-supplied score (the score is **computed**, never supplied — trigger-authenticity only, Doc-4A §21.5).

**3. Response Schema** — **none** (21.5 System). Internal effect: updated `performance_scores` (`score` NULL while `not_rated`, else 0–100; `level`, `components_jsonb`, `performance_formula_version`, `min_threshold_met`, `performance_score_updated_at`) + one `performance_score_history` snapshot **iff** changed; `reference_id : uuid` on the audit record.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id`, `trigger` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` (internal) |
| `trigger` ∈ enum; UUID shape | 2 SHAPE | Doc-4A §9 | enum membership; shape | `VALIDATION` |
| recompute meaningful | 3 SEMANTIC | Doc-2 §3.6/§10.6 | a score may be (re)computed for the subject over its `performance_inputs` | `BUSINESS` |
| trigger authenticity | 4 AUTHENTICATION / 4–5 collapse (System) | Doc-4A §21.5/§11.2 | System actor; **Authorization = none (no slug)**; enforcement = trigger-authenticity | `AUTHORIZATION` (untrusted trigger) |
| 5 AUTHORIZATION (System-actor) | 5 AUTHORIZATION | Doc-4A §5.2/§21.5 | **none — System actor, no slug** (H.3); collapsed into §4 | — |
| score-row state | 6 STATE | Doc-2 §3.6/§10.6 | `not_rated`/`computed` (create if absent); a `frozen` score recomputes but publication is suppressed (H.5) | `STATE` only on revision race (see CONFLICT) |
| `performance_inputs` readable | 7 REFERENCE | Doc-2 §10.6 | the subject's `performance_inputs` are readable | `REFERENCE` (subject unresolved) ; `DEPENDENCY` (store down) |
| threshold + firewall + dual-path | 8 BUSINESS | Doc-2 §10.6; Architecture §1.5; Doc-3 §12.1 | `not_rated` until `min_threshold_met` (5 responses OR 2 projects); Financial Tier never feeds; **absence ≠ 0**; Buyer-Feedback Path A/B de-duped (H.10) | `BUSINESS` |
| formula tunables | 9 POLICY | Doc-3 §12.2 | component weights / threshold / renormalization absent from §12.2 → `[ESC-TRUST-POLICY]`; `performance_formula_version` bump (§12.4) | `BUSINESS` (policy-derived) |

**5. Authorization Matrix** — Actor **System** · **Authorization = none** (System actor; **no slug**; scores auto-calculated, never hand-edited; Doc-4A §5.2; Doc-2 §3.6) · Scope = platform/system · Delegation n/a · **Enforcement = trigger-authenticity** (Doc-4A §21.5; stages 4–5 collapse). **No vendor-, buyer-, or staff-triggered computation path exists.**

**6. State Machine Enforcement** — Targets **`not_rated`** (NULL score, below threshold) or **`computed`** (≥ threshold) (Doc-2 §3.6/§10.6); creates the `performance_scores` row if absent, else updates it + appends a `performance_score_history` snapshot on change · **Threshold gate:** `score` stays NULL/`not_rated` until `min_threshold_met` (**5 responses OR 2 projects**) — **never 0** (Doc-3 §12.1 FIXED) · **Frozen-state (authoritative, Doc-2 §3.6 "publication and ranking effect only"):** under `freeze_state=frozen`, **recompute ALLOWED, snapshot ALLOWED, publication SUPPRESSED** (no `PerformanceScoreUpdated` until reactivation) · Forbidden: no manual/hand-edited write path (firewall) · Concurrency: optimistic on row revision; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Trust "recalculation"** (every compute) and **"formula version change"** (when `performance_formula_version` changes) — both separately enumerated · Attribution **System** · Object scope `performance_scores` + appended `performance_score_history` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`PerformanceScoreUpdated`** (Doc-2 §8 — `trust.performance_scores`; **this contract is the publisher of record — H.7**) via Doc-4B outbox-write (one transaction), **publish-on-change only** (no event when score/level unchanged) · **Publication SUPPRESSED while `frozen`** — recompute + snapshot still occur, no event until reactivation · Also emitted by this publisher of record on a **reactivation-driven** change (requested by `trust.reactivate_performance_score.v1`) · Consumed: this contract is the **effect of a System trigger** — not itself a Doc-2 §8 consumer · Consumers of `PerformanceScoreUpdated`: Marketplace (badge read-model rebuild), RFQ (matching refresh) — each owns its own effect; Communication fan-out (DG-6).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed trigger / bad enum | false |
| `AUTHORIZATION` | untrusted/forged trigger | false |
| `REFERENCE` | subject `performance_inputs` unresolved | false |
| `STATE` | (rare) row-state inconsistency at write | false |
| `CONFLICT` | optimistic-revision lost race on the `performance_scores` row | true (re-read then retry) |
| `BUSINESS` | firewall/threshold rule violated (would never zero a sub-threshold vendor) | false |
| `DEPENDENCY` | `performance_inputs` store / Doc-4B outbox/audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** System contract — no tenant surface; stages 4–5 collapse. **REFERENCE vs DEPENDENCY:** unresolved subject → `REFERENCE`; store outage → `DEPENDENCY`. **STATE vs CONFLICT:** row-state inconsistency → `STATE`; optimistic-revision race → `CONFLICT`.

**10. Idempotency Rules** — `Idempotency: required` on **inputs + `performance_formula_version`**: recompute with unchanged inputs/formula → same `score`/`level`, **no new `PerformanceScoreUpdated`, no new snapshot** (publish-on-change). A genuine change → one snapshot + one event. Concurrent recomputes serialized by optimistic revision (loser → `CONFLICT`). No dedup-window key in Doc-3 §12.2 → **`[ESC-TRUST-POLICY]`** (platform default by name; no key invented).

**11. Cross-Module References** — reads own `performance_inputs`. **Marketplace (DG-2):** consumes `PerformanceScoreUpdated` into the badge read-model. **RFQ (DG-3):** consumes `PerformanceScoreUpdated` (matching refresh) — Trust makes no procurement decision. **Platform Core (DG-8):** outbox + audit. **Billing (DG-7):** no input (firewall). **Intra-module:** does **not** mutate Trust Score / Verification / Fraud (owner-only of Performance Score, H.9c).

**12. AI-Agent Implementation Notes** — **System actor only**; never expose a vendor/buyer/staff endpoint to compute or edit a score; the score is **computed, never supplied**. **Not Rated (NULL) below 5 responses OR 2 projects — never 0** (Doc-3 §12.1 FIXED). **Buyer-Feedback Path A (`BuyerFeedbackRecorded`/Operations) and Path B (`public_reviews`/BC-TRUST-5) are distinct `performance_inputs` rows feeding one component — de-dup at computation, never naive-sum** (H.10). Financial Tier never feeds the score (H.9d). Emit `PerformanceScoreUpdated` **only on change**; this contract is the sole publisher of record (H.7). Formula tunables carry `[ESC-TRUST-POLICY]`; bump `performance_formula_version` — never invent a key.

---

## §G6.3 — `trust.freeze_performance_score.v1` · `trust.reactivate_performance_score.v1` — Performance-Score Freeze / Reactivate

**1. Contract Metadata** — Contract IDs `trust.freeze_performance_score.v1` · `trust.reactivate_performance_score.v1` · Template **21.6 Admin** · Owned aggregate **Performance Score** (`performance_scores` AR — `freeze_state`) · Actor types **Admin** (platform-staff governance, §5.6) · BC-TRUST-3 (§G6). **Freeze/reactivate is publication governance, NOT a score edit (H.9a). Freeze is publisher of record for `PerformanceFrozen`; reactivate requests `PerformanceScoreUpdated` (H.7).**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `vendor_profile_id` | `uuid` | yes | no | 1 | subject (Doc-2 §10.6 `performance_scores.vendor_profile_id` UNIQUE) |
| `expected_revision` | `numeric` | yes | no | 1 | optimistic-concurrency assertion (H.5) |
| `freeze_reason` | `text` | conditional | yes | 1 | required on freeze (BUSINESS); e.g. dispute hold / ownership-transfer Trust Protection |

**3. Response Schema** — `vendor_profile_id : uuid (1)`, `freeze_state : enum<none|frozen> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id`, `expected_revision` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| field shapes | 2 SHAPE | Doc-4A §9 | UUID/numeric shape | `VALIDATION` |
| governance semantics | 3 SEMANTIC | Doc-2 §3.6 | freeze/reactivate is a publication-governance action on an existing score | `BUSINESS` |
| actor authenticity (platform-staff) | 4 AUTHENTICATION | Doc-4A §5.6 | actor is Admin; admin scope declared | `AUTHORIZATION` |
| `staff_can_verify` or `staff_can_ban` | 5 AUTHORIZATION | Doc-2 §7; Doc-4A §6 | staff slug held (OR) | `AUTHORIZATION` |
| score-row state | 6 STATE | Doc-2 §3.6/§10.6 | freeze: source `computed`/`not_rated` (`freeze_state=none`); reactivate: source `frozen` | `STATE` |
| revision match | 6 STATE (concurrency) | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| score row resolves | 7 REFERENCE | Doc-2 §10.6 | `performance_scores` row exists for `vendor_profile_id` | `NOT_FOUND` (read miss) ; `DEPENDENCY` |
| `freeze_reason` present on freeze | 8 BUSINESS | Doc-2 §10.6 | mandatory reason for freeze; freeze never penalizes the score value | `BUSINESS` |
| freeze-window tunable | 9 POLICY | Doc-3 §12.2 | window absent → `[ESC-TRUST-POLICY]` | `BUSINESS` (policy-derived) |

**5. Authorization Matrix** — Actor **Admin** · **Authorization rule = OR (either slug authorizes):** caller MUST hold **`staff_can_verify`** OR **`staff_can_ban`** (Doc-2 §7 platform-staff); holding either is sufficient; the operation is identical regardless of which authorized it · Scope = platform · Delegation n/a · Enforcement Identity `check_permission` evaluates the OR · A distinct freeze-specific slug → `[ESC-TRUST-SLUG]` (no slug invented; not needed today).

**6. State Machine Enforcement** — `freeze`: allowed source **`computed`** or **`not_rated`** (`freeze_state=none`) → **`frozen`** (set `freeze_reason`/`frozen_at`); suspends publication/ranking effect only — underlying `score` retained · `reactivate`: allowed source **`frozen`** → **`none`** (publication resumes; recompute/republish via the `PerformanceScoreUpdated` publisher of record) · Forbidden: reactivate on non-`frozen` / freeze on already-`frozen` → `STATE` (or idempotent no-op, §10) · Concurrency: optimistic; lost race → `CONFLICT`. **No score value is written by this contract** (governance only; **freeze never penalizes a vendor**, Doc-3 §12.1 FIXED).

**7. Audit Binding** — Action **Doc-2 §9 Trust "trust/performance freeze + reactivation"** (separately enumerated) · Attribution **Admin** · Object scope `performance_scores` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — `freeze`: **emits `PerformanceFrozen`** (Doc-2 §8 — `trust.performance_scores`; **this freeze contract is the publisher of record for `PerformanceFrozen` — H.7**) via outbox-write · `reactivate`: **emits no event directly** — it **requests** the resumed publication, which the `PerformanceScoreUpdated` publisher of record (`trust.compute_performance_score.v1`) performs · **Consumed: `VendorOwnershipTransferred`** (Marketplace, Doc-2 §8) as a Trust-Protection freeze trigger · Consumers of emitted events: Marketplace/RFQ read-model + matching refresh, Communication fan-out (DG-6).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX/SHAPE failure | false |
| `AUTHORIZATION` | neither `staff_can_verify` nor `staff_can_ban` | false |
| `NOT_FOUND` | no `performance_scores` row for `vendor_profile_id` | false |
| `STATE` | freeze on already-`frozen`, or reactivate on non-`frozen` (when not idempotent no-op) | false |
| `CONFLICT` | `expected_revision` ≠ current | true (re-read then retry) |
| `BUSINESS` | `freeze_reason` missing on freeze | false |
| `DEPENDENCY` | Doc-4B outbox/audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** staff surface — missing score row → `NOT_FOUND` on identity (the badge is otherwise public; no protected-fact collapse on this governance write). **STATE vs CONFLICT:** wrong freeze/reactivate pre-state → `STATE`; stale `expected_revision` → `CONFLICT` (retryable). **REFERENCE vs DEPENDENCY:** subject is the score row → `NOT_FOUND`; Doc-4B outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-TRUST-POLICY]`**, H.8); re-freeze of a `frozen` / re-reactivate of a `none` score is a **no-op** (idempotent target — same result, no duplicate audit/event); a genuine change writes once and emits one event (freeze → one `PerformanceFrozen`; reactivate → the publisher of record emits one `PerformanceScoreUpdated` on a resulting change). `expected_revision` guards races. Freeze-window tunable absent from Doc-3 §12.2 → `[ESC-TRUST-POLICY]`.

**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission`. **Marketplace (DG-2):** consumes events; **emits `VendorOwnershipTransferred`** consumed here (Trust-Protection freeze). **Platform Core (DG-8):** audit + outbox. **Billing (DG-7):** no input (firewall).

**12. AI-Agent Implementation Notes** — freeze/reactivate is **publication governance, not a score edit** — never modify `score`/`level`/`components_jsonb`; only `freeze_state`/`freeze_reason`/`frozen_at`. Authorization is an **OR** over `staff_can_verify`/`staff_can_ban`. Freeze **emits `PerformanceFrozen`** (its own event, publisher of record); **reactivate emits no event** — it requests the `PerformanceScoreUpdated` publisher of record to republish (do **not** add an outbox-write for `PerformanceScoreUpdated` in the reactivate handler). **Freeze never penalizes a vendor** (Doc-3 §12.1 FIXED). `VendorOwnershipTransferred` is a **consume**, never a Trust emission.

---

## §G6.4 — `trust.trigger_performance_review.v1` — Trigger Performance Review

**1. Contract Metadata** — Contract ID `trust.trigger_performance_review.v1` · Template **21.5 System** (Response: none) · Owned aggregate **Performance Score** (`performance_scores`) · Actor types **System** (threshold crossing / periodic cadence / dispute pattern; §5.2) · BC-TRUST-3 (§G6). **Publisher of record for `PerformanceReviewTriggered` (H.7); never auto-edits a score.**

**2. Request Schema** *(System trigger; no tenant body)* — internal parameters: `vendor_profile_id : uuid (1, required)`, `trigger_reason : enum<threshold_crossing|periodic_cadence|dispute_pattern> (1, required)`. No caller-supplied authorization fields (trigger-authenticity only).

**3. Response Schema** — **none** (21.5 System). Internal effect: a published `PerformanceReviewTriggered` event for staff attention; `reference_id : uuid` on the audit record. **No score value written.**

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| params present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` (internal) |
| `trigger_reason` ∈ enum; UUID shape | 2 SHAPE | Doc-4A §9 | enum membership; shape | `VALIDATION` |
| review condition holds | 3 SEMANTIC | Doc-2 §3.6/§10.6 | a review-trigger condition is satisfied for the subject | `BUSINESS` |
| trigger authenticity | 4 AUTHENTICATION / 4–5 collapse (System) | Doc-4A §21.5/§11.2 | System actor; **Authorization = none (no slug)**; enforcement = trigger-authenticity | `AUTHORIZATION` (untrusted trigger) |
| 5 AUTHORIZATION (System-actor) | 5 AUTHORIZATION | Doc-4A §5.2/§21.5 | **none — System actor, no slug** (H.3); collapsed into §4 | — |
| score row resolves | 7 REFERENCE | Doc-2 §10.6 | `performance_scores` row exists for the subject | `REFERENCE` (unresolved) ; `DEPENDENCY` (store down) |
| review-cadence tunable | 9 POLICY | Doc-3 §12.2 | cadence/window absent → `[ESC-TRUST-POLICY]` | `BUSINESS` (policy-derived) |

**5. Authorization Matrix** — Actor **System** · **Authorization = none** (System actor; **no slug**; Doc-4A §5.2) · Scope = platform/system · Delegation n/a · **Enforcement = trigger-authenticity** (Doc-4A §21.5; stages 4–5 collapse).

**6. State Machine Enforcement** — **No score-state transition** — the trigger is a review signal over `performance_scores`, not a lifecycle change; it **never edits the score** (computation is the only score writer, H.9a) · Concurrency: idempotent on the trigger-condition window (§10).

**7. Audit Binding** — Action **`[ESC-TRUST-AUDIT]`** — review-trigger not separately enumerated in Doc-2 §9 → nearest §9 Trust action ("recalculation") by pointer (channel Doc-2 §9 additive; **no action invented**) · Attribution **System** · Object scope `performance_scores` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`PerformanceReviewTriggered`** (Doc-2 §8 — `trust.performance_scores`; **this contract is the publisher of record — H.7**) via Doc-4B outbox-write · Consumed: effect of a System trigger (threshold/cadence/dispute pattern) — not itself a Doc-2 §8 consumer · Consumers: Communication (fan-out of the trigger notification, DG-6), analytics.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed trigger / bad enum | false |
| `AUTHORIZATION` | untrusted/forged trigger | false |
| `REFERENCE` | subject `performance_scores` unresolved | false |
| `DEPENDENCY` | store / Doc-4B outbox transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** System contract — no tenant surface; stages 4–5 collapse. **REFERENCE vs DEPENDENCY:** unresolved subject → `REFERENCE`; store/outbox outage → `DEPENDENCY`. No `STATE`/`CONFLICT` — no score-state mutation.

**10. Idempotency Rules** — `Idempotency: required` — dedup on the trigger-condition window: the same review condition does not raise duplicate `PerformanceReviewTriggered` within the window. Review-cadence tunable absent from Doc-3 §12.2 → **`[ESC-TRUST-POLICY]`** (platform default by name; no key invented).

**11. Cross-Module References** — **Communication (DG-6):** fan-out of the trigger notification (Communication owns dispatch). **Platform Core (DG-8):** outbox + audit. No score mutation; no Marketplace/RFQ effect authored here.

**12. AI-Agent Implementation Notes** — the trigger is a **System review signal**; it **never auto-edits a score** (computation is the only writer, H.9a). Publisher of record for `PerformanceReviewTriggered`. Dedup on the trigger window; cadence carries `[ESC-TRUST-POLICY]` — never invent a key.

---

## §G6.5 — `trust.get_performance_score.v1` · `trust.list_performance_inputs.v1` · `trust.list_performance_score_history.v1` — Performance Reads

**1. Contract Metadata** — Contract IDs `trust.get_performance_score.v1` · `trust.list_performance_inputs.v1` · `trust.list_performance_score_history.v1` · Template **21.3 Query** · Owned aggregate **Performance Score** (`performance_scores` / `performance_inputs` / `performance_score_history`, read-only) · Actor types **internal-service / any caller via public projection** (current badge) · **Admin** (inputs ledger, history) · BC-TRUST-3 (§G6).

**2. Request Schema** — *get_performance_score:* `vendor_profile_id : uuid (1, required)`. *list_performance_inputs:* `vendor_profile_id : uuid (1, required)`, pagination + allowlisted filters (`source_type?`, `input_type?`) (Doc-4A §9.6). *list_performance_score_history:* `vendor_profile_id : uuid (1, required)`, pagination.

**3. Response Schema** — *get_performance_score (public badge only):* `level/badge : string (1; suppressed while frozen)`, `performance_score_updated_at : timestamptz (1)`, `freeze_state : enum<none|frozen> (1)`, `rated : bool (1)` (false = **Not Rated**) — **public BADGE only** (Doc-2 §3.6 "badge published unless frozen"); the numeric `score` is **not** exposed on the public read. *list_performance_inputs (staff only):* page of `performance_inputs` rows (`source_type`, `input_type`, `occurred_at`) — staff view. *list_performance_score_history (staff only):* page of snapshots (`score`, `level`, `formula_version`, timestamp) — staff view; the numeric `score` appears **only** in the staff surfaces. Every response carries `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id` typed; allowlisted filters | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; filter+sort fields allowlisted | `VALIDATION` |
| field shapes | 2 SHAPE | Doc-4A §9 | UUID/pagination shape | `VALIDATION` |
| (semantic) | 3 SEMANTIC | Doc-2 §3.6 | a score/inputs/history may be read for the subject | — |
| actor authenticity | 4 AUTHENTICATION | Doc-4A §5.6 | internal-service/public (badge) ; Admin (inputs/history) | `AUTHORIZATION` |
| authorization | 5 AUTHORIZATION | Doc-2 §7 | badge = **public**, no slug ; inputs/history = `staff_can_verify` | `AUTHORIZATION` (staff surface without slug) |
| (state) | 6 STATE | — | reads do not mutate state | — |
| reference resolves | 7 REFERENCE | Doc-2 §10.6 | subject resolves to a `performance_scores` row | `NOT_FOUND` (read miss) ; `DEPENDENCY` (store down) |

**5. Authorization Matrix (per query — independent authority):**

- **`trust.get_performance_score.v1`** — Actor **internal-service / any caller via public projection** · Authorization **none** (public badge read, Doc-2 §3.6 "badge published unless frozen") · Scope **public** (per `vendor_profile_id`) · Visibility **public BADGE only** (level/badge + `freeze_state` + `rated`; badge suppressed while `frozen`; **Not Rated surfaces as Not Rated, never 0** — Doc-3 §12.1 FIXED); **the numeric `score` is NOT exposed publicly**, no inputs, no history.
- **`trust.list_performance_inputs.v1`** — Actor **Admin** (platform-staff, §5.6) · Authorization **`staff_can_verify`** (Doc-2 §7) · Scope **platform** · Visibility **staff-only** — normalized inputs ledger; allowlisted filter/sort (Doc-4A §9.6); non-entitled caller → `NOT_FOUND` (protected-fact collapse, §7.5).
- **`trust.list_performance_score_history.v1`** — Actor **Admin** (platform-staff, §5.6) · Authorization **`staff_can_verify`** (Doc-2 §7) · Scope **platform** · Visibility **staff-only** — versioned snapshots incl. numeric `score`; non-entitled caller → `NOT_FOUND`.

Enforcement: Identity `check_permission` for the two staff queries; the public badge read requires no slug. **No query mutates state (CQRS).**

**6. State Machine Enforcement** — n/a — **queries do not mutate state** (read-only). A `frozen` score is reported with `freeze_state=frozen` and its badge publication suppressed (Doc-2 §3.6); a sub-threshold score is reported **Not Rated** (`rated=false`), never fabricated, never 0.

**7. Audit Binding** — **none — reads are not audited** (Doc-4A §17.1).

**8. Event Binding** — Emitted **none** (reads) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | bad identifier / non-allowlisted filter or sort field | false |
| `AUTHORIZATION` | inputs/history requested without `staff_can_verify` (where existence non-protected at the staff surface) | false |
| `NOT_FOUND` | no `performance_scores` row, or inputs/history requested by a non-entitled caller (protected-fact collapse) | false |
| `DEPENDENCY` | read-store transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** the **current badge is public**; the **inputs ledger and history are staff-only** — a non-entitled caller requesting them receives `NOT_FOUND` (protected-fact collapse, §7.5), never a disclosure. No write path; no `STATE`/`CONFLICT`. **REFERENCE vs DEPENDENCY:** missing row → `NOT_FOUND` (read miss); read-store outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: not-applicable` (Doc-4A §14.1 — queries are side-effect-free and naturally idempotent).

**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission` for inputs/history. **Marketplace (DG-2):** the **performance badge is projected into the directory read-model via service** (never table access) — Doc-2 §10.6. **Platform Core (DG-8):** read-store/observability.

**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). The **current public read is the BADGE only** (suppressed while `frozen`); the numeric `score` is **never** public — it appears only in **staff-only** inputs/history. **Not Rated surfaces as Not Rated, never 0** (Doc-3 §12.1 FIXED). Collapse non-entitled inputs/history reads to `NOT_FOUND` (§7.5). Marketplace reads the badge **via service projection**, never by direct table access.

---

## §G6.Z — Part-3 Conformance & Carried-Marker Ledger (BC-TRUST-3)

**Contract roster (hardened this Part — exactly the Pass-A §G6 set; none added/removed):**

| § | Contract ID(s) | Template | Owned aggregate | Actor |
|---|---|---|---|---|
| §G6.1 | `trust.ingest_performance_input.v1` | 21.5 System | Performance Score (`performance_inputs`) | System / internal-service |
| §G6.2 | `trust.compute_performance_score.v1` | 21.5 System | Performance Score (`performance_scores`,`performance_score_history`) | System |
| §G6.3 | `trust.freeze_performance_score.v1` · `trust.reactivate_performance_score.v1` | 21.6 Admin | Performance Score | Admin |
| §G6.4 | `trust.trigger_performance_review.v1` | 21.5 System | Performance Score | System |
| §G6.5 | `trust.get_performance_score.v1` · `trust.list_performance_inputs.v1` · `trust.list_performance_score_history.v1` | 21.3 Query | Performance Score | internal-service / Admin |

**Authority binding (all by pointer; nothing invented):**

| Binding | Authoritative source |
|---|---|
| Lifecycle | Doc-2 §3.6/§10.6 — Performance Score `not_rated → computed | frozen` (threshold 5 responses OR 2 projects; freeze suspends publication/ranking only); `performance_score_history` + `performance_inputs` append-only |
| Entities / fields | Doc-2 §10.6 (`performance_scores`, `performance_score_history`, `performance_inputs`) |
| Permissions | Doc-2 §7 — `staff_can_verify`, `staff_can_ban` (freeze/reactivate OR; inputs/history `staff_can_verify`); badge read public (no slug); **computation + ingestion = System actor, no slug** |
| Events | Doc-2 §8 — `PerformanceScoreUpdated` (publisher of record = `trust.compute_performance_score.v1`), `PerformanceReviewTriggered` (publisher of record = `trust.trigger_performance_review.v1`), `PerformanceFrozen` (publisher of record = `trust.freeze_performance_score.v1`); consumed Ops 5 + `QuotationSubmitted` + `VendorOwnershipTransferred`; nothing coined |
| Audit | Doc-2 §9 Trust — "recalculation", "formula version change" (compute), "trust/performance freeze + reactivation" (freeze/reactivate); ingestion + review-trigger → `[ESC-TRUST-AUDIT]` (nearest §9 by pointer) |
| Validation order | canonical Pass-B nine-stage (frozen Part-1/Part-2 presentation); Doc-4A §11.2 enforcement authority |
| Error model | Doc-4A §12 / Annexure B closed twelve-class set; REFERENCE≠DEPENDENCY, STATE≠CONFLICT enforced per contract |
| Idempotency | Doc-4A §14; ingestion = idempotent consumer (event-id / source-ref dedup); compute = publish-on-change; freeze/reactivate + review-trigger dedup window → `[ESC-TRUST-POLICY]` |
| Firewall / moat | Per §H.9 (authoritative): Architecture §1.5 / Invariant 6 (Financial Tier never feeds Performance Score; no signal dominates; absence ≠ zero → Not Rated); Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED |
| Buyer-Feedback dual-path | Per §H.10 (authoritative): Path A `BuyerFeedbackRecorded`/Operations vs Path B `public_reviews`/BC-TRUST-5 — distinct rows, de-dup at compute (F4G-M3) |

**Carried dependencies (unchanged):** DG-2 (Marketplace — consumes `PerformanceScoreUpdated` into badge read-model; emits `VendorOwnershipTransferred` consumed as freeze trigger), DG-3 (RFQ — owns `QuotationSubmitted` + invitation source refs read-only; consumes `PerformanceScoreUpdated` as a matching signal; Trust makes no procurement decision), DG-4 (Operations — owns the five performance-input events; Trust owns the `performance_inputs` effect), DG-6 (Communication — fan-out of `PerformanceReviewTriggered`/score events), DG-8 (Platform Core — audit/outbox). DG-7 (Billing) referenced only as the **firewall** (no input). Intra-module (read-only / invoke): Trust Score (BC-TRUST-2), Verification (BC-TRUST-1), Fraud (BC-TRUST-4) — **never mutated**; BC-TRUST-5 **invokes** the ingestion service (Path B), never writes `performance_inputs`.

**Carried escalation markers (unchanged; never resolved here):** `[ESC-TRUST-AUDIT]` (Doc-2 §9 additive — `performance_inputs` ingestion, review-trigger; nearest §9 "recalculation" by pointer), `[ESC-TRUST-POLICY]` (Doc-3 §12.2 additive — performance-formula component weights/threshold/renormalization, review cadence, freeze window, dedup window), `[ESC-TRUST-SLUG]` (Doc-2 §7 additive — any distinct freeze-specific slug if later required; not needed today).

**Firewall & moat (Part-3 posture) — authoritative statement at §H.9:** Performance Score is platform-owned, **System-computed only** — no vendor/buyer/staff/manual mutation; administrative action **freezes/reactivates publication only**; **`performance_inputs` has a single writer** (F4G-M2); **BC-TRUST-3 is owner-only of Performance Score and consumer of its inputs** — it mutates **no** Trust Score / Verification / Fraud; Financial Tier never feeds the score; no Billing influence; **Not Rated, never zero** below threshold (Doc-3 §12.1 FIXED); the Performance Score aggregate owns `PerformanceScoreUpdated`/`PerformanceReviewTriggered`/`PerformanceFrozen` with a single publisher of record each (H.7); Buyer-Feedback Path A/B de-duped at compute (H.10); Performance Score is a **signal only** — no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. **No flag-and-halt triggered; no corpus conflict.**

---

*End of Doc-4G — Trust & Verification Engine — Pass-B Part 3 v1.0 — BC-TRUST-3 Performance Scoring. Hardens the frozen Pass-A §G6 contract set (7 contract IDs: performance-input ingestion (sole writer); compute performance score; freeze/reactivate; trigger review; performance reads — score badge / inputs ledger / history) to implementation grade — request/response schemas, canonical Pass-B nine-stage validation matrices (authority · validation · failure class per row; Doc-4A §11.2 enforcement), authorization matrices (Doc-2 §7 slugs only; computation + ingestion System-actor no-slug), state-machine enforcement (Doc-2 §3.6 `not_rated|computed|frozen`; threshold 5 responses OR 2 projects; frozen-state recompute-allowed/publication-suppressed; STATE vs CONFLICT separated), audit bindings (Doc-2 §9 recalculation / formula version change / freeze + reactivation; ingestion + review-trigger `[ESC-TRUST-AUDIT]`), event bindings (Doc-2 §8 `PerformanceScoreUpdated`/`PerformanceReviewTriggered`/`PerformanceFrozen` owned by the Performance Score aggregate, single publisher of record each; consumed Ops 5 + `QuotationSubmitted` + `VendorOwnershipTransferred`; nothing coined), error registers (Doc-4A §12 closed class; REFERENCE vs DEPENDENCY separated), and idempotency rules (ingestion idempotent consumer; compute publish-on-change; `[ESC-TRUST-POLICY]` windows). `performance_inputs` single writer (F4G-M2); Buyer-Feedback dual-path A/B de-duped at compute (F4G-M3). Ownership, aggregate, permissions, lifecycle, events, and bounded context unchanged from Pass-A. BC-TRUST-3 is owner-only of Performance Score and consumer of its inputs (mutates no Trust Score / Verification / Fraud); Performance Score is System-computed; trust firewall and procurement moat preserved; nothing invented; no corpus conflict; no flag-and-halt. Scope: BC-TRUST-3 only — BC-TRUST-1/2/4/5 belong to other Pass-B parts. Next: Doc-4G_PassB_Part4 (BC-TRUST-4 Fraud & Risk Signals).*
