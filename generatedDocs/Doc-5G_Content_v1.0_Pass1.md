# Doc-5G — Trust & Verification (M5 `trust`) API Realization — Content v1.0, Pass 1 (§0–§3)

| Field | Value |
|---|---|
| Document | Doc-5G — Trust & Verification (Module 5) — API Realization |
| Pass | 1 of 3 — §0, §1, §2 (the 34-endpoint caller-facing inventory) and §3 (cross-cutting wire model) |
| Status | ACTIVE — Content Pass 1 of 3; §0–§3. Plan-review (M5G-01/02, m5G-01…04, N5G-01…03) + Pass-1 review (m-01/02/03, N-01…05) folded in. **Independent Hard Review applied:** MINOR-01 §2.6 `+Location` on create corrected; MINOR-02 §2.6 cursor-pagination statement + O-01 `submit_review` engagement-gate resolution added; MINOR-03 §0.4 candidate-count clarified to four; MINOR-04 §3.6 disclosure-scope mutual-exclusivity + exactly-one rule added; MINOR-05 rows 3/5 event tokens replaced with pure `Doc-2 §8` pointer; O-02 §3.4 `staff_can_verify` slug replaced with `[ESC-TRUST-SLUG]` pointer; NP-01 row 14 "suppressed while frozen"; NP-02 §0.3 Pass-1 scope sentence added; NP-03 §2 header inventory-completeness clause added; NP-04 §3.7 service-interface-only constraint added. **0 open BLOCKER/MAJOR/MINOR.** Conforms to `Doc-5G_Structure_v1.0_FROZEN.md` |
| Module | Module 5 — Trust & Verification (`trust` schema) — the governance-signal owner |
| Realizes | `Doc-4G` (M5 contracts, FROZEN — 40 contracts: 34 caller-facing + 6 out-of-wire) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4G v1.0, Doc-4M v1.0, Doc-5A v1.0 (all FROZEN) |
| Contains | Document control + scope/surface-partition + the **34-endpoint** caller-facing inventory + the §3 cross-cutting actor / score-firewall / non-disclosure **wire model** (mechanism only). No §5.7 template instantiation (Pass-2/3), no out-of-wire realization detail (§8, Pass-3), no schemas, no Doc-4G contract body restated, no **score value/formula/threshold** |
| Audience | Architecture / API Governance Boards · Doc-5G content authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4G fixed *what* each M5 contract declares (FROZEN); Doc-5A fixed *how* a contract becomes HTTP. Pass-1 fixes Doc-5G's precedence/scope, the **caller-facing endpoint inventory** (method, path, actor, active-org, success, disclosure-scope) for the **34** caller-facing M5 endpoints, and the **§3 cross-cutting wire model** §4–§7 depend on. It instantiates no full endpoint template (§4–§7), realizes no out-of-wire mechanism (§8), and coins no endpoint/status/header/error-class/slug/POLICY key/event/**score**. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §0/§1/§5/§6.3/§7/§10` · `Doc-4G §G0/§G3–§G8`, Appendix · `Doc-4C §C3/§C8` (consumed) · Appendix B.1 (`trust`).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence
- Doc-5G sits one realization level below Doc-5A (`Doc-5A §0.1`):
  ```
  Master → ADR → Doc-2 · Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4G → Doc-5A → Doc-5G → Code
  ```
- Doc-5G **MUST NOT** override, reinterpret, or weaken any higher document; on conflict the higher prevails and Doc-5G is patched (flag-and-halt, `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Binds:** `Doc-5A §0.1`.

### 0.2 Scope of Authority
- Doc-5G governs **how the FROZEN Doc-4G contracts of Module 5 are realized as concrete HTTP APIs** — the wire layer only (Public + User + Admin caller surfaces).
- It does **not** govern: *what* a contract declares (Doc-4G/Doc-4A); the score **computation / formula / thresholds / weights** (Doc-4G/Doc-3, **out-of-wire §8, bound by pointer, never on a wire**); the state machines (Doc-2 edges + Doc-4M index); matching/ranking (RFQ/Doc-4E — DG-3); the Marketplace tier write (Doc-4D — R8/DG-2); the ban decision (Admin/Doc-4J — DG-5); commercial gating (Doc-4I — DG-7); persistence (Doc-6); or the M5 System mechanisms with no wire (§8).
- **Binds:** `Doc-5A §0.2`; `Doc-4G §G0`.

### 0.3 Conformance Obligation
- **Pass-1 scope (binding):** Pass-1 realizes only caller-facing surfaces — the 34-endpoint inventory (§2) and the §3 cross-cutting wire model. Out-of-wire contracts are inventory-owned by §8; no out-of-wire contract acquires any wire surface via Pass-1 or any subsequent content-pass editing.
- Before freeze, Doc-5G **MUST** pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) in full. It coins **no** endpoint, status, header, error class, slug, POLICY key, event, or **score value/threshold** (`CHK-5A-121/154`; `Doc-4A §6.4/§16.4`).
- **Two content-freeze obligations stated up front:**
  - **`reference_id` (C-05):** every body-bearing response carries a top-level `reference_id` (`Doc-4A §22.1 C-05`, clarified by **`PATCH-D4A-C05-204`** — the ratified additive Doc-4A §22.1 C-05 patch (2026-06-24): C-05 applies to body-bearing responses only, `204` no-body responses exempt); **nominated declaration point = §4** (Pass-2), cross-cutting to §5–§7 (`CHK-5A-042` [B]).
  - **`[ESC-TRUST-POLICY]` wire-referenced keys:** the `trust.*` idempotency-dedup-window + list page-size keys MUST be registered in Doc-3 §12.2 (additive patch — precedent `core.*` v1.0 / `rfq.*` v1.1 / `marketplace.*` v1.2; `Doc-4A §18.2`) **before the content Freeze Audit** (`CHK-5A-121`). Out-of-wire keys (score thresholds/weights, expiry/review windows) are tracked, not a wire-conformance gate.
- **Binds:** `Doc-5A §0.5`, Appendix A; `Doc-4A §18.2/§22.1`; `PATCH-D4A-C05-204`.

### 0.4 Realize-Never-Redecide & Realization-Authority Rule (M5G-01)
- Each realized point binds its Doc-4G / Doc-5A / corpus owner by pointer; no copy, paraphrase-with-change, or re-decide. **Transport-level silence** (Doc-5A §5.3 silent on nested / singleton / subject-keyed addressing) → a `[realization convention]` contradicting nothing upstream.
- **Realization-authority rule (binding):** where a method/path realization depends on **contract authority** (create-vs-command, soft-delete-vs-state, cardinality), it is **resolved only from a frozen Doc-4G source (`State Effects` / Request Schema / State Machine)** — **if it cannot be resolved from a frozen source, FLAG-AND-HALT; do not choose a realization convention.** The Pass-1 §2 method/path set is **single-source binding on Pass-2/3** (no per-pass re-decision). *(Four method/path resolutions appear in §2.6, each with a frozen-source authority citation. Items 1–3 — `remove_review → DELETE`, `set_admin_rating → PATCH`, `create_fraud_signal` dual-template — required frozen-source resolution per the realization-authority rule. Item 4 — subject-keyed addressing for score/tier reads — is a `[realization convention §0.4]` (Doc-5A §5.3 silent) additionally confirmed by the frozen Doc-4G request schema; it is a convention, not a flag-and-halt candidate. No halt was triggered on any of the four.)*
- **Binds:** `Doc-5A §0.3`; `Doc-4G` PassB.

---

## §1 — Scope, Audience & M5 Surface Partition

### 1.1 What Doc-5G Governs
- Doc-5G is the **HTTP realization of Module 5's caller-facing contracts** — verification & verified-tier, trust & performance score governance, fraud & risk signals, reviews & admin ratings. No other module's surface.
- Actors (R2): **Public** (anonymous badge / published-review reads — no `Authorization`, no org context); **User** (only `request_verification` + `submit_review`, server-validated active-org context); **Admin** (the governance bulk, no org context); **System** (out-of-wire, §8).
- **Binds:** `Doc-5A §1`, §7; Doc-4G §G3/§G4.

### 1.2 M5 Surface Partition
The 40 Doc-4G contracts partition by wire-realizability (structure R1) — **34 caller-facing**, **6 out-of-wire**:

| Doc-4G contracts | Doc-5G treatment |
|---|---|
| BC-TRUST-1 verification + verified-tier commands & reads · BC-TRUST-2/3 score governance (freeze/reactivate) + reads · BC-TRUST-4 fraud triage + staff reads · BC-TRUST-5 reviews + admin-rating + reads | **Caller-facing HTTP** — realized here (inventory §2; full template §4–§7) |
| `compute_trust_score`, `compute_performance_score` (score firewall), `ingest_performance_input` (sole writer), `trigger_performance_review`, `expire_verification`, `expire_verified_tier` (all 21.5 System) · + the dual-audience reads' internal-service leg + the System-detected leg of `create_fraud_signal` (mechanisms) | **Out-of-wire** — no HTTP surface (§8); code / Doc-6 |

- **Section ownership (structure § column) is authoritative; §2 inventory grouping is informational.** Partition verified: §4(11)+§5(9)+§6(6)+§7(8)=34 caller-facing; §8=6; **section counts reconcile to the global 34+6=40** (m5G-01).
- **Binds:** `Doc-5G_Structure_v1.0_FROZEN` (partition); Doc-4G PassB; `Doc-5A §1.3`.

### 1.3 Dependency Boundary
- **M5 realizes only M5 surfaces.** Cross-module realization belongs to the owning module's Doc-5x (Identity → Doc-5C; Marketplace → Doc-5D; RFQ → Doc-5E; Operations → Doc-5F; Billing → Doc-5I; Admin → Doc-5J). **M5 consumes/emits, never realizes, those surfaces.** Identity `check_permission` + org-context are consumed in-process (`Doc-4C §C3/§C8`); cross-module events emit to the M0 outbox (R11), consumed by M2/M3/M6 — no M5 HTTP endpoint for any of these.
- **Binds:** `Doc-5A §1`; structure §1.x.

### 1.4 Audience & Carried Items
- **Audience:** Architecture / API Governance Boards; Doc-5G authors (human + AI); AI Coding Supervisor; backend, QA.
- **Carried (Doc-4G Appendix — by pointer; resolved only via named channels):** **DG-1** Identity · **DG-2** Marketplace (declared-tier ref; consumes tier/score events) · **DG-3** RFQ (`QuotationSubmitted` perf input; Trust owns no matching) · **DG-4** Operations (5 perf-input events) · **DG-5** Admin (fraud triage; **ban decision Admin-owned**) · **DG-6** Communication (notification fan-out) · **DG-7** Billing (**firewall** — no signal gated by commercial state) · **DG-8** Platform Core (audit/outbox/timers/IDs/POLICY) · `[ESC-TRUST-SLUG]` (Doc-2 §7) · `[ESC-TRUST-AUDIT]` (Doc-2 §9) · `[ESC-TRUST-POLICY]` (Doc-3 §12.2 — **wire-referenced keys = content-freeze gate**; out-of-wire score/expiry keys = tracked).
- **Binds:** Doc-4G §G0, Appendix; Doc-2 §7/§8/§9; Doc-3 §12.2.

---

## §2 — Realized Endpoint Inventory

> **Inventory completeness is authoritative:** every caller-facing M5 endpoint appears in this table — no endpoint may be added to §4–§7 unless it first appears here. **Inventory order conveys no dependency, execution order, or lifecycle order** (m5G-03) — it is **descriptive aggregation; the §4–§7 contract sections remain authoritative** (N5G-03). Section ownership (the structure partition table) is authoritative; on conflict the partition table wins. **The disclosure-scope column declared here is normative and binding (M5G-02): a later section MAY narrow but MUST NEVER widen a read's disclosure scope.**

### 2.1 Namespace, Path Grammar & Method Mapping
- All M5 caller-facing endpoints live under the reserved **`trust`** route prefix (Appendix B.1; `Doc-2 §0.3`) and follow the §5.3 grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`. Resource segments are the owning entity tables (`verifications`, `verified_tiers`, `trust_scores`, `performance_scores`, `fraud_signals`, `reviews`, `admin_ratings`), plural **[realization convention]**. **All resource names bind to Doc-4G owned-aggregate tables and are immutable after freeze** (a rename is a Doc-5G amendment, never a content-pass edit — N-02).
- **Method mapping (`Doc-5A §5.2`, strict — `CHK-5A-031` [B]):** create → `POST` collection (`201`+`Location`); partial non-state update / upsert → `PATCH` item; state-transition / domain command → `POST` named sub-resource; ADR-012 soft-delete → `DELETE` item; read → `GET`. No `PUT`. Command tokens are the **exact `trust.<operation>` names verbatim from the Doc-4G PassB per-Contract-ID blocks**.
- **Async (§10):** **no caller endpoint returns `202`.** Each caller command commits synchronously (`200`/`201`); the score computation, ingestion, performance-review trigger, and expiry timers are downstream System mechanisms (§8), observed via reads. Domain events emit to the M0 outbox (R11), never a wire field.
- **Score firewall on the wire (R5; m-01 clarified):** a **computed score display value MAY be returned by an approved Public-Badge read** (band/score, suppressed while frozen — Doc-4G §G5.3/§G6.5); but **score computation inputs, formulas, thresholds, and weights are never exposed**, and **no score value is ever a caller write or wire input** (N5G-01/02). `list_performance_inputs` (raw inputs) is **Staff-Internal**, never public.
- **Subject-keyed / nested addressing [realization convention §0.4]:** scores and verified-tier are addressed by the **subject `vendor_profile_id`** (one per subject — Doc-4G §G5.3/§G4.8 request schema); history/inputs are nested sub-collections. Doc-5A §5.3 is silent on subject-keyed and nested reads; the conventions contradict nothing upstream.
- **Binds:** `Doc-5A §5.2/§5.3/§10`, Appendix B.1; Doc-2 §0.3; Doc-4G PassB.

### 2.2 Inventory — §4 Verification & Verified-Tier (BC-TRUST-1, 11)

| # | Doc-4G Contract-ID | Actor | Method · Path | Active-Org | Success | Disclosure |
|---|---|---|---|---|---|---|
| 1 | `trust.request_verification.v1` | User | `POST /trust/verifications` | Y | `201` | — (command) |
| 2 | `trust.assign_verification.v1` | Admin | `POST /trust/verifications/{id}/assign_verification` | N | `200` | — |
| 3 | `trust.decide_verification.v1` | Admin | `POST /trust/verifications/{id}/decide_verification` *(emits the corresponding `Doc-2 §8` trust-domain event — R7; by pointer, not restated here)* | N | `200` | — |
| 4 | `trust.revoke_verification.v1` | Admin | `POST /trust/verifications/{id}/revoke_verification` | N | `200` | — |
| 5 | `trust.set_verified_tier.v1` | Admin | `POST /trust/verified_tiers/{vendor_profile_id}/set_verified_tier` *(emits the corresponding `Doc-2 §8` trust-domain event — R8; by pointer, not restated here)* | N | `200` | — |
| 6 | `trust.confirm_verified_tier.v1` | Admin | `POST /trust/verified_tiers/{vendor_profile_id}/confirm_verified_tier` | N | `200` | — |
| 7 | `trust.suspend_verified_tier.v1` | Admin | `POST /trust/verified_tiers/{vendor_profile_id}/suspend_verified_tier` | N | `200` | — |
| 8 | `trust.downgrade_verified_tier.v1` | Admin | `POST /trust/verified_tiers/{vendor_profile_id}/downgrade_verified_tier` | N | `200` | — |
| 9 | `trust.get_verification.v1` | Admin | `GET /trust/verifications/{id}` | N | `200` | **Staff-Internal** |
| 10 | `trust.list_verifications.v1` | Admin | `GET /trust/verifications` | N | `200` | **Staff-Internal** |
| 11 | `trust.get_verified_tier.v1` | Public | `GET /trust/verified_tiers/{vendor_profile_id}` | N | `200` | **Public-Badge** *(+ Internal-Service leg → §8; current known consumers: M2 verified-tier seam DG-2, M3 eligibility DG-3)* |

**Section count = 11** (§4 caller-facing).

### 2.3 Inventory — §5 Trust & Performance Score Governance (BC-TRUST-2 + BC-TRUST-3, 9)

| # | Doc-4G Contract-ID | Actor | Method · Path | Active-Org | Success | Disclosure |
|---|---|---|---|---|---|---|
| 12 | `trust.freeze_trust_score.v1` | Admin | `POST /trust/trust_scores/{vendor_profile_id}/freeze_trust_score` *(publication/ranking only — R5)* | N | `200` | — |
| 13 | `trust.reactivate_trust_score.v1` | Admin | `POST /trust/trust_scores/{vendor_profile_id}/reactivate_trust_score` | N | `200` | — |
| 14 | `trust.get_trust_score.v1` | Public | `GET /trust/trust_scores/{vendor_profile_id}` *(band/display score; suppressed while frozen; no inputs/formula/thresholds/weights — §2.1/§3.5)* | N | `200` | **Public-Badge** *(+ Internal-Service → §8; current known consumers: M2 badge display DG-2, M3 matching confidence DG-3)* |
| 15 | `trust.list_trust_score_history.v1` | Admin | `GET /trust/trust_scores/{vendor_profile_id}/history` | N | `200` | **Staff-Internal** |
| 16 | `trust.freeze_performance_score.v1` | Admin | `POST /trust/performance_scores/{vendor_profile_id}/freeze_performance_score` | N | `200` | — |
| 17 | `trust.reactivate_performance_score.v1` | Admin | `POST /trust/performance_scores/{vendor_profile_id}/reactivate_performance_score` | N | `200` | — |
| 18 | `trust.get_performance_score.v1` | Public | `GET /trust/performance_scores/{vendor_profile_id}` *(band/display score; no inputs/formula — §2.1/§3.5)* | N | `200` | **Public-Badge** *(+ Internal-Service → §8; current known consumer: M3 matching DG-3)* |
| 19 | `trust.list_performance_inputs.v1` | Admin | `GET /trust/performance_scores/{vendor_profile_id}/inputs` *(raw inputs — staff only; N5G-01)* | N | `200` | **Staff-Internal** |
| 20 | `trust.list_performance_score_history.v1` | Admin | `GET /trust/performance_scores/{vendor_profile_id}/history` | N | `200` | **Staff-Internal** |

**Section count = 9** (§5 caller-facing).

### 2.4 Inventory — §6 Fraud & Risk Signals (BC-TRUST-4, 6)

| # | Doc-4G Contract-ID | Actor | Method · Path | Active-Org | Success | Disclosure |
|---|---|---|---|---|---|---|
| 21 | `trust.create_fraud_signal.v1` | Admin | `POST /trust/fraud_signals` *(staff-reported leg; System-detected leg → §8 — R12)* | N | `201` | **Staff-Internal** |
| 22 | `trust.review_fraud_signal.v1` | Admin | `POST /trust/fraud_signals/{id}/review_fraud_signal` | N | `200` | — |
| 23 | `trust.action_fraud_signal.v1` | Admin | `POST /trust/fraud_signals/{id}/action_fraud_signal` | N | `200` | — |
| 24 | `trust.dismiss_fraud_signal.v1` | Admin | `POST /trust/fraud_signals/{id}/dismiss_fraud_signal` | N | `200` | — |
| 25 | `trust.get_fraud_signal.v1` | Admin | `GET /trust/fraud_signals/{id}` | N | `200` | **Staff-Internal** |
| 26 | `trust.list_fraud_signals.v1` | Admin | `GET /trust/fraud_signals` | N | `200` | **Staff-Internal** |

**Section count = 6** (§6 caller-facing).

### 2.5 Inventory — §7 Reviews & Admin Ratings (BC-TRUST-5, 8)

| # | Doc-4G Contract-ID | Actor | Method · Path | Active-Org | Success | Disclosure |
|---|---|---|---|---|---|---|
| 27 | `trust.submit_review.v1` | User | `POST /trust/reviews` *(engagement-gated)* | Y | `201` | — (command) |
| 28 | `trust.moderate_review.v1` | Admin | `POST /trust/reviews/{id}/moderate_review` | N | `200` | — |
| 29 | `trust.publish_review.v1` | Admin | `POST /trust/reviews/{id}/publish_review` *(invokes §8 ingestion — R9; never writes `performance_inputs`)* | N | `200` | — |
| 30 | `trust.remove_review.v1` | Admin | `DELETE /trust/reviews/{id}` *(soft-delete — Doc-2 §10.6 SD=YES)* | N | `200` | — |
| 31 | `trust.set_admin_rating.v1` | Admin | `PATCH /trust/admin_ratings/{vendor_profile_id}` *(upsert; §2.6)* | N | `200` | **Staff-Internal** *(internal-only — never public/tenant-visible)* |
| 32 | `trust.get_review.v1` | Public | `GET /trust/reviews/{id}` *(published only)* | N | `200` | **Public-Badge** *(+ Internal-Service → §8; current known consumer: M2 review display DG-2)* |
| 33 | `trust.list_reviews.v1` | Public | `GET /trust/reviews` *(published only)* | N | `200` | **Public-Badge** *(+ Internal-Service → §8; current known consumer: M2 review display DG-2)* |
| 34 | `trust.list_admin_ratings.v1` | Admin | `GET /trust/admin_ratings` | N | `200` | **Staff-Internal** |

**Section count = 8** (§7 caller-facing).

**Global reconciliation (m5G-01):** §4(11) + §5(9) + §6(6) + §7(8) = **34 caller-facing**; + §8 out-of-wire = 6 → **40** (= Doc-4G PassB inventory). No duplication.

### 2.6 Inventory Notes — method resolutions (M5G-01, frozen-sourced)
- **Methods (§5.2):** create → `POST` collection (`201`+`Location`); state/domain command → `POST` named; soft-delete → `DELETE`; upsert → `PATCH`; read → `GET`. No caller `202`.
- **`remove_review` → `DELETE`.** **Resolved-from authority: `Doc-4G §G8.3` §6 State Machine** = "`remove`: → `removed` (hidden, **soft-delete**; Doc-2 §10.6 SD=YES)" → ADR-012 soft-delete (`Doc-5A §5.2`). Not a guess.
- **`set_admin_rating` → `PATCH` upsert.** **Resolved-from authority: `Doc-4G §G8.4` §2/§6** = keyed by `vendor_profile_id`; "set creates the row; update asserts `expected_revision`" → subject-scoped **upsert** → `PATCH` (Doc-5C/5D upsert-singleton precedent); subject-keyed addressing `[realization convention §0.4]`.
- **Score/tier read addressing → subject `vendor_profile_id`.** **Resolved-from authority: `Doc-4G §G5.3` / `§G6.5` / `§G4.8`** request schemas key on `vendor_profile_id` (one score/tier per subject) → `GET …/{vendor_profile_id}`; history/inputs nested `[realization convention §0.4]`.
- **`create_fraud_signal` dual-template.** **Resolved-from authority: `Doc-4G §G7.1`** (21.6 Admin staff-reported / 21.5 System-detected) — caller leg = Admin staff-reported (`POST` collection `201`+`Location`); the **System-detected leg is out-of-wire §8** (dual-audience fence).
- **`submit_review` engagement gate.** **Resolved-from authority: `Doc-4G §G8.1`** (BC-TRUST-5 state machine — `submit` transition permitted only when the engagement precondition is satisfied; exact precondition terms owned by `§G8.1`, never re-decided here).
- **List pagination:** all 7 `list_*` endpoints (`list_verifications`, `list_trust_score_history`, `list_performance_inputs`, `list_performance_score_history`, `list_fraud_signals`, `list_reviews`, `list_admin_ratings`) use **cursor-based pagination only — no offset** (`CHK-5A-070` [B]; `Doc-5A §8`); page-size bound by a `trust.*` list-page-size POLICY key (referenced by intended name only, registration not implied — part of the `[ESC-TRUST-POLICY]` wire-referenced batch, content-freeze gate; `CHK-5A-071` [M]).
- **Active-Org:** **Public** reads carry no `Authorization`/`Iv-Active-Organization`; **User** legs (`request_verification`, `submit_review`) carry the server-validated `Iv-Active-Organization`; **Admin** ops carry **none** (§3.3).
- **Internal-Service legs (m5G-04 / m-02):** every Public-Badge read above names its **current known** consuming workflow in its row (M2 DG-2 / M3 DG-3 — *current known consumers, not an exclusivity claim; a future consumer is added by amendment*); the internal-service leg is realized **exclusively in §8** (dual-audience fence), never an additional HTTP surface. No orphan internal API.
- **Binds:** `Doc-5A §5.1/§5.2/§5.5/§5.7`, §7.3, §10; Doc-4G §G4.8/§G5.3/§G6.5/§G7.1/§G8.1/§G8.3/§G8.4.

---

## §3 — Cross-Cutting Actor, Score-Firewall & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*

> §3 realizes the **mechanism** every §4–§7 endpoint depends on; it binds `Doc-5A §7.1–§7.6` + §6.3 by pointer and states the M5-specific application. **Instantiates no endpoint.** Section-form authority = the frozen `Doc-5C §3` / `Doc-5D §3` precedent ([realization convention] — prevents four-way restatement).

### 3.1 Authentication Carriage (§7.1) — tri-actor
- **Public/anonymous** badge & published-review reads carry **no `Authorization`** (R2). **User** (`request_verification`, `submit_review`) and **Admin** carry the **`Authorization`** bearer — **authentication only** (credential/session mechanics out of scope — Identity, DG-1). Actor type is server-determined (§3.2).
- **Binds:** `Doc-5A §7.1`; `Doc-4A §5.1`.

### 3.2 Actor-Type Determination (§7.2)
- M5 actor types — **Public**, **User**, **Admin** (`staff_*`), **System** (out-of-wire) — are **server-determined**; no field/header asserts actor type (`Doc-5A §7.2`; `Doc-4A §9.7`).
- **Binds:** `Doc-5A §7.2`; `Doc-4A §5.2`; Doc-4G §G3.

### 3.3 Active-Organization Context (§7.3) — R2
- The two **User** legs execute within a **server-validated active organization** carried in **`Iv-Active-Organization`** (org `UUIDv7`) — a **context selector, never a trusted assertion**. **Validation authority is M1 Identity** (`check_permission` / `Doc-4C §C8`; m5G-02) — the server validates the principal's active membership before any business processing (CONTEXT category, §3.8; `Doc-5A §7.3`; `Doc-4A §5.3`). **Public** reads carry no org context; **Admin** governance carries **none** (`Doc-5A §7.3`/§5.6).
- **Binds:** `Doc-5A §7.3`; `Doc-4A §5.3/§5.6/§9.7`; `Doc-4C §C8`; Doc-4G §G3.

### 3.4 Authorization Realization (§7.5) — single root
- Authorization is **server-side** — three-layer check (active Membership + Permission Slug + Resource Scope) — resolved from §3.1–§3.3 context via Identity **`check_permission`** (consumed; `Doc-5A §7.5`; `Doc-4A §6.1`). **`check_permission` is the sole authorization authority consumed by M5; NO PARALLEL OR SHADOW AUTHORIZATION PATH IS PERMITTED** (governance-critical — `Doc-4A §5.3/§6`). Slugs (bound by pointer via `[ESC-TRUST-SLUG]` until confirmed in Doc-2 §7 — never named until registered; all M5 staff slugs are tracked via `[ESC-TRUST-SLUG]`) are **never** wire inputs (`Doc-4A §6.2`); gaps carry `[ESC-TRUST-SLUG]` by pointer (R4, never invented).
- **Binds:** `Doc-5A §7.5`; `Doc-4A §6.1/§6.2/§9.7`; `Doc-4C §C3` (consumed root); Doc-2 §7.

### 3.5 Score-Computation & Governance/Billing Firewall (R5/R6) — wire constraints
- **Score-value-never-writable, computation-never-exposed (R5; m-01):** a **computed score display value MAY be returned by an approved Public-Badge read** (band/score, suppressed while frozen); but **no caller action mutates a score value**, and **no score computation input, formula, threshold, or weight is ever a wire input or a read field** (N5G-01/02). `compute_*` are System-only, out-of-wire (§8). `freeze_*` / `reactivate_*` govern **publication/ranking effect only** — never edit the computed value. **Not-Rated ≠ zero**.
- **Governance/Billing firewall (R6 — DG-7 verbatim, binding):** *No entitlement, subscription, plan, payment, credit, quota, or commercial state may influence Trust Score, Performance Score, Verification, or Verified Tier.* Realized as a wire constraint — **no commercial value is ever a gating header/param on any M5 endpoint** (`Doc-4A §4B`). No cross-signal write (Financial Tier ⇏ Trust Score; Financial Tier ≠ Performance).
- **Binds:** `Doc-5A §6.3`; `Doc-4A §4B`; Doc-4G §G5/§G6; structure R5/R6.

### 3.6 Non-Disclosure on the Wire (§6.3) — R10
- Verification case detail (beyond status), fraud signals, and admin ratings are **staff-internal only** — never tenant-visible, never public (R10). A cross-org or protected-fact-gated read collapses to a uniform **`NOT_FOUND`** identical in status, body, and timing to genuinely-absent (no side-channel). **The §2 disclosure-scope is binding: a §4–§7 read MAY narrow but MUST NEVER widen it** (M5G-02) — no Public-Badge read may surface a Staff-Internal field.
- **Disclosure-scope rules (binding for all of §4–§7):** (1) every read surface declares **exactly one** disclosure scope; (2) the three scopes — **Public-Badge** / **Staff-Internal** / **Internal-Service** — are **mutually exclusive**: a read holds one scope only; (3) the `(+ Internal-Service → §8)` notation on Public-Badge rows is a **mechanism pointer** (the out-of-wire consumption leg, §3.7) — **not a second disclosure scope**.
- **Binds:** `Doc-5A §6.3`; `Doc-4A §7.5`; `Doc-2 §10.11`; Doc-4G §G7/§G8.

### 3.7 Dual-Audience Fence & AI Rule
- **Dual-audience fence (R1):** where a contract has **both** a caller-facing leg and an Internal-Service consumption leg (the Public-Badge reads + `create_fraud_signal`), **Doc-5G realizes only the caller-facing wire leg; the Internal-Service consumption is realized exclusively in §8 and creates no additional HTTP surface** (in-process via `trust/contracts/`, never HTTP — frozen Doc-5C/5D precedent). Every such leg names its consuming workflow (§2.6 — m5G-04). **Internal-Service consumers access the `trust/contracts/` service interface only — no direct table or schema access is implied or permitted.**
- **AI rule (R12):** System/AI-detected fraud signals are **observational inputs only; administrative disposition (`review`/`action`/`dismiss`) remains authoritative.** No AI authoritative write on any wire.
- **Binds:** structure §1 (dual-path); `Doc-4A §4.1/§4.3`; `Doc-5A §1.3`; structure R12.

### 3.8 Context Validation Position (§7.6)
- Carried context validated in the fixed **CONTEXT category** of the universal order (`Doc-5A §7.6`; `Doc-4A §11.2`, position 2) — before AUTHZ/SCOPE/STATE/REF/BUSINESS and any semantic processing; Doc-5G maps the failure to its §6 status and **MUST NOT** reorder/merge/short-circuit (disclosure control — R10).
- **Binds:** `Doc-5A §7.6`; `Doc-4A §11.2`.

---

*End of Doc-5G Content v1.0, Pass 1 (§0–§3). Document control + the 34-entry caller-facing inventory (strict §5.2 methods; three ambiguities resolved from frozen Doc-4G sources — no halt; disclosure-scope normative/binding, narrow-never-widen; per-section counts reconcile to 40; Internal-Service legs name current-known consumers) + the §3 cross-cutting actor / score-firewall / non-disclosure wire model. No §5.7 instantiation, no §8 realization, no schemas, no Doc-4G rule or score restated; no caller `202`; nothing coined. §4–§5 follow in Pass-2; §6–§9 + Appendix A in Pass-3, conforming to `Doc-5G_Structure_v1.0_FROZEN.md`. (Closing summary trimmed; full per-section detail lives in the sections above — N-05.)*
