# Doc-4G — Trust & Verification Engine — Pass-B (Hardening) Part 2 v1.0 — BC-TRUST-2 Trust Scoring

| Field | Value |
|---|---|
| Document | Doc-4G — **Pass-B Part 2 v1.0** — Module 5 Trust & Verification (`trust` schema, `trust_` namespace) |
| Part scope | **BC-TRUST-2 — Trust Scoring (§G5)** — the Pass-A §G5 contracts (Trust Score aggregate), hardened to implementation grade |
| Status | **Pass-B Part 2 draft — implementation-grade contract specification for BC-TRUST-2.** Independently reviewable. Authorized next stage after review/patch: **Doc-4G_PassB_Part3 (BC-TRUST-3 Performance Scoring).** |
| Contract authority | `Doc-4G_PassA_v1.0_FROZEN` (sole contract authority — **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4G_Structure_v1.0_FROZEN` |
| Part-1 carry-forward | `Doc-4G_PassB_Part1_v1.0_FROZEN` (frozen conventions honored: canonical nine-stage validation presentation; System-actor scoring; firewall postures) |
| Authority | Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN, Doc-4G Pass-A FROZEN, Doc-4G PassB Part1 FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-TRUST-1 Verification & Verified Tier · **Part 2 — BC-TRUST-2 Trust Scoring** · Part 3 — BC-TRUST-3 Performance Scoring · Part 4 — BC-TRUST-4 Fraud & Risk Signals · Part 5 — BC-TRUST-5 Reviews & Admin Ratings |
| Audience | Claude Code / Cursor / Codex / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Pass-B mission (Part 2).** Convert the Pass-A BC-TRUST-2 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices in the canonical Pass-B nine-stage presentation (Doc-4A §11.2 enforcement authority), authorization matrices, state-machine enforcement, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), and idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §G5. **BC-TRUST-2 is consumer-only of its score inputs** — Trust Score **consumes** Verification status (BC-TRUST-1), Performance score (BC-TRUST-3), and Fraud-signal state (BC-TRUST-4) read-only, and **may not mutate** any of them; source ownership stays with BC-TRUST-1/3/4. **Trust Score computation is System-actor only** — no staff-, vendor-, or buyer-triggered score edit; no manual score mutation. The **Trust Score aggregate owns `TrustScoreUpdated`** — no publisher ambiguity, no ownership leakage. The **procurement moat** holds — Trust Score is a **signal only**; BC-TRUST-2 owns no matching/routing/ranking/evaluation/supplier-selection/award; RFQ authoritative. Carried dependencies **DG-2, DG-3, DG-8** (the BC-TRUST-2 seams) and the markers **`[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 2.

---

## §H — Part-2 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (canonical Pass-B presentation; Doc-4A §11.2 is the enforcement authority).** The single canonical stage vocabulary used by **every** Validation Matrix in this Part is `1 SYNTAX → 2 SHAPE → 3 SEMANTIC → 4 AUTHENTICATION → 5 AUTHORIZATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY` (the frozen Part-1 presentation). **Enforcement authority (Doc-4A §11.2, FROZEN — order and logic unchanged):** `1 SYNTAX` + `2 SHAPE` enforce §11.2 SYNTAX (presence/type/bounds/enum + cardinality/nullable/shape, §9); `3 SEMANTIC` and `8 BUSINESS` enforce §11.2 BUSINESS (domain-meaning rules); `4 AUTHENTICATION` enforces §11.2 CONTEXT (actor type + active-org/admin-scope authenticity, §5.2/§5.3/§5.6); `5 AUTHORIZATION` enforces §11.2 AUTHZ + SCOPE + DELEGATION (§6/§6B); `6 STATE` / `7 REFERENCE` / `9 POLICY` enforce the identically-named §11.2 stages. Order is exactly §11.2, never reordered. Failure terminates at the first failing stage; SYNTAX/SHAPE MAY aggregate field errors, later stages fail singly. For **System contracts (21.5)** with no tenant, stages 4–5 collapse to a single **trigger-authenticity** check (Doc-4A §21.5/§11.2). Each row names **stage · source authority · rule (validation) · failure outcome (failure class)**.
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source — never extended), `numeric`, `string`, `jsonb` (opaque; Pass-B fixes presence/shape boundary, not internal field schema), `timestamptz`, `bool`. **Required** = present + non-null (absence → SYNTAX). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** **Trust Score computation carries NO slug — it is System-actor only** (auto-calculated, never hand-edited; Doc-4A §5.2; Doc-2 §3.6). The only tenant/staff-authorized BC-TRUST-2 actions are **freeze/reactivate** (platform-staff governance) and **history read** (staff). **Confirmed Doc-2 §7 slugs used in this Part:** `staff_can_verify`, `staff_can_ban` (freeze/reactivate governance; history read uses `staff_can_verify`). The **trust-score band read is public** (Doc-2 §3.6 "band published unless frozen") — no slug. Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C, consumed; no shadow authorization). BC-TRUST-2 staff actions are platform-staff (no active-org context, §5.6) and **not delegation-eligible**. Where a required staff action lacks a §7 slug → **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive; no slug invented).
- **H.4 — Error model (Doc-4A §12; closed twelve-class set, Annexure B).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes `trust_<domain>_<code>` (namespace `trust_`); numeric codes are dev-doc stage — Pass-B fixes **class + trigger + retryable**. **Mandatory separations (never conflated):** **REFERENCE** (Domain, 422 — a reference ID is syntactically valid but does not resolve to an existing entity) ≠ **DEPENDENCY** (Infrastructure, 503, retryable — a consumed service/read-service is transiently unavailable); **STATE** (Domain, 409 — entity not in a valid pre-state) ≠ **CONFLICT** (Concurrency, 409, retryable after re-read — optimistic-concurrency token mismatch). The **Error Boundary block** (§12.4/§12.6) is stated per contract; the trust-score **band is public**, so the read surface carries no protected-fact collapse (the history/internal surface is staff-gated).
- **H.5 — State machine (Doc-2 §3.6/§10.6; Doc-4A §13).** The BC-TRUST-2 lifecycle is exactly **Trust Score** (`trust_scores`): **`computed | frozen`** — "freeze suspends publication and ranking effect only" (Doc-2 §3.6/§10.6). `trust_score_history` is **append-only** (snapshots with formula version). Transitions: compute writes/updates the `computed` score (and a history snapshot); `freeze` sets `freeze_state=frozen`; `reactivate` returns `freeze_state=none` (→ `computed` publication resumes). Every mutation cites allowed **source state(s)**, **target state**, **forbidden source states** (→ `STATE`). Concurrency: optimistic — mutating commands assert the expected row revision; lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified** — Pass-B enforces the frozen Doc-2 §3.6 edges only.
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 Trust audit action**, **actor attribution** (`System` for computation; `Admin` for freeze/reactivate), **object scope** (the `trust.trust_scores`/`trust_score_history` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B). Reads are not audited (§17.1). The **separately-enumerated** Doc-2 §9 **Trust** actions this Part binds directly are: **"recalculation"**, **"formula version change"** (computation), and **"trust/performance freeze + reactivation"** (freeze/reactivate). No verified-tier or verification action applies here. **No `[ESC-TRUST-AUDIT]` is required for the BC-TRUST-2 mutations** (all three audit actions are separately enumerated in §9); the marker is carried at Part level only as the standing no-invention guardrail for any action a content pass finds unmapped — none in Part 2.
- **H.7 — Events (Doc-2 §8 via Doc-4B `core.write_outbox_event.v1`).** **The Trust Score aggregate owns and emits exactly one event: `TrustScoreUpdated`** (Doc-2 §8 — `trust.trust_scores`), written transactionally (business write + event insert one transaction); **no event coined** (§16.4); **no publisher ambiguity** — `trust.compute_trust_score.v1` is the publisher of record, and freeze/reactivate **trigger** a publication-state change reflected via the same `TrustScoreUpdated` (the freeze/reactivate contract is not a separate publisher). **Consumed (Doc-2 §8, other modules):** `VendorOwnershipTransferred` (Marketplace — Trust Protection freeze trigger). BC-TRUST-2 **emits no Marketplace/RFQ effect** — those modules consume `TrustScoreUpdated` and author their own effects (single-authorship, Doc-4A §4.4). Notification fan-out is Communication's (DG-6), not authored here.
- **H.8 — Idempotency (Doc-4A §14).** Computation (21.5 System) is **idempotent on inputs+formula_version**: re-running with unchanged inputs and unchanged `trust_formula_version` yields the same score and **emits no new `TrustScoreUpdated`** (publish-on-change only); a genuine input/formula change produces one new snapshot + one event. Freeze/reactivate (21.6) carry `Idempotency: required` + a dedup window (POLICY key) — re-freeze of a `frozen` score / re-reactivate of a `none` score is a no-op (idempotent target); replay within the window → same result, no duplicate audit/event. **No `trust` dedup-window key is registered in Doc-3 §12.2** → carried under **`[ESC-TRUST-POLICY]`** (reference the platform default by name; no key invented). Queries (21.3) are side-effect-free (`Idempotency: not-applicable`, §14.1).
- **H.9 — Trust-firewall & moat enforcement (Architecture §1.5/Invariant 6; Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED — load-bearing per contract).** (a) **Trust Score is platform-owned, System-computed; no tenant, no staff, and no other module mutates the score** — only `trust.compute_trust_score.v1` writes it, under the System actor. (b) **BC-TRUST-2 is consumer-only of its inputs** — it reads Verification status (BC-TRUST-1), Performance score (BC-TRUST-3), and Fraud-signal state (BC-TRUST-4) via **same-module read-services, read-only**, and **never mutates Verification, Performance, or Fraud**; source ownership stays with BC-TRUST-1/3/4. (c) **Financial Tier never increases/feeds Trust Score; Buyer-Vendor Status never mutates it; secondary signals never dominate trust calculation** (Architecture §1.5 firewall FIXED; Invariant 6). (d) **No paid plan/entitlement/flag gates or influences the Trust Score** (Doc-4A §4B; DG-7 — Billing has no input). (e) **Procurement moat:** BC-TRUST-2 computes no matching/routing/ranking/evaluation/selection/award; the trust band/score is a **signal** RFQ consumes (DG-3), never a decision Trust makes. (f) **Absence-of-history never scores as zero** (Doc-3 §12.1 FIXED) — a vendor lacking inputs is unscored/banded per formula, not zeroed.
- **H.10 — `trust` BC-TRUST-2 field source (Doc-2 §10.6).** The hardened schemas bind to the frozen Doc-2 §10.6 columns; **Pass-B introduces no column** — it binds existing ones:
  - `trust_scores`: `vendor_profile_id` (UNIQUE), `score` (0–100), `band`, `trust_formula_version`, `trust_score_updated_at`, `freeze_state enum<none|frozen>`, `freeze_reason`, `frozen_at` (+ standard columns; lifecycle `computed | frozen`).
  - `trust_score_history`: → `trust_scores`; append-only snapshots with `formula_version`.
  - *(read-only inputs, owned elsewhere — same module, never mutated)* Verification status (BC-TRUST-1 `verification_records`/`verified_financial_tiers`), Performance score (BC-TRUST-3 `performance_scores`), Fraud-signal state (BC-TRUST-4 `fraud_signals`) — obtained via same-module Trust read-services (B.9a).
  - *(referenced, not owned)* Marketplace `VendorOwnershipTransferred` event (DG-2, consumed); the Marketplace directory read-model (DG-2, projection target of `TrustScoreUpdated`).

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.** Grouped families share section 1 and split the records where the schema differs.

---

## §G5.1 — `trust.compute_trust_score.v1` — Compute / Recalculate Trust Score

**1. Contract Metadata** — Contract ID `trust.compute_trust_score.v1` · Template **21.5 System** (Response: none) · Owned aggregate **Trust Score** (`trust_scores` AR + `trust_score_history` append-only) · Actor types **System** (recompute trigger on input-signal change or recalculation sweep; §5.2) · Bounded context **BC-TRUST-2** (§G5) · **Computation is System-actor only — no staff/vendor/buyer trigger; no manual mutation (H.3/H.9).**

**2. Request Schema** *(System trigger; no tenant request body)* — internal trigger parameters: `vendor_profile_id : uuid (1, required)` (subject), `trigger : enum<input_signal_change|scheduled_recalc|formula_version_change> (1, required)`. No caller-supplied authorization or score fields (the score is **computed**, never supplied — System trigger-authenticity only, Doc-4A §21.5).

**3. Response Schema** — **none** (21.5 System; Doc-4A §21.5). Internal effect: updated `trust_scores` row (`score`, `band`, `trust_formula_version`, `trust_score_updated_at`) + one `trust_score_history` snapshot **iff** the score/band/formula changed; `reference_id : uuid` recorded on the audit record.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id`, `trigger` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` (internal) |
| `trigger` ∈ frozen enum; `vendor_profile_id` shape | 2 SHAPE | Doc-4A §9; Doc-2 §10.6 | enum membership; UUID shape | `VALIDATION` |
| recompute is meaningful (inputs/formula present) | 3 SEMANTIC | Doc-2 §3.6/§10.6 | a score may be (re)computed for the subject | `BUSINESS` |
| trigger authenticity | 4 AUTHENTICATION / 4–5 collapse (System) | Doc-4A §21.5/§11.2 | System actor; trusted trigger (no tenant context/authz/scope/delegation) | `AUTHORIZATION` (untrusted trigger) |
| (authorization) | 5 AUTHORIZATION | Doc-4A §5.2 | **none — System actor, no slug** (H.3) | — |
| score-row state | 6 STATE | Doc-2 §3.6/§10.6 | row is `computed` or absent (create); a `frozen` score is **not republished** (compute still snapshots, publication suppressed) | `STATE` only on revision race (see CONFLICT) |
| input read-services resolve | 7 REFERENCE | Doc-2 §10.6; B.9a | Verification/Performance/Fraud read-services resolve the subject's inputs | `REFERENCE` (input subject unresolved) ; `DEPENDENCY` (read-service transiently down) |
| firewall + threshold rules | 8 BUSINESS | Architecture §1.5; Doc-3 §12.1 | Financial Tier never feeds score; no signal dominates; absence-of-history ≠ zero | `BUSINESS` |
| formula tunables | 9 POLICY | Doc-3 §12.2 | formula thresholds/weights absent from §12.2 → `[ESC-TRUST-POLICY]`; `formula_version` bump on change (§12.4) | `BUSINESS` (policy-derived) |

**5. Authorization Matrix** — Actor **System** · Slug **none** (System actor; **no tenant/staff slug** — scores auto-calculated, never hand-edited; Doc-4A §5.2; Doc-2 §3.6) · Scope = platform/system · Delegation n/a · Enforcement = trigger-authenticity (Doc-4A §21.5). **No staff-, vendor-, or buyer-triggered computation path exists.**

**6. State Machine Enforcement** — Target **`computed`** (Doc-2 §3.6/§10.6); creates the `trust_scores` row if absent, else updates it + appends a `trust_score_history` snapshot on change · A **`frozen`** score: computation MAY recompute the underlying value and snapshot it, but **publication/ranking effect stays suspended** (freeze semantics, H.5) — no `TrustScoreUpdated` publish of a band while frozen · Forbidden: no manual/`hand-edited` write path exists (firewall) · Concurrency: optimistic on row revision; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Trust "recalculation"** (every compute) and **"formula version change"** (when `trust_formula_version` changes) — both separately enumerated · Attribution **System** · Object scope `trust_scores` + appended `trust_score_history` row · Timing same transaction · Source Doc-2 §9 + Doc-4B `core.append_audit_record.v1`.

**8. Event Binding** — Emitted **`TrustScoreUpdated`** (Doc-2 §8 — `trust.trust_scores`; **the Trust Score aggregate owns this event; this contract is the publisher of record**) via Doc-4B outbox-write (business write + event one transaction), **publish-on-change only** (no event when score/band unchanged) · Suppressed while `frozen` (no band publication) · Consumed: this contract is the **effect of a System trigger** (input-signal change / recalc) — not itself a Doc-2 §8 consumer · Consumers of `TrustScoreUpdated`: Marketplace (`vendor_matching_attributes` rebuild / directory re-rank), RFQ (matching refresh) — each owns its own effect (single-authorship); Communication fan-out (DG-6).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | malformed internal trigger (missing/typed; bad enum) | false |
| `AUTHORIZATION` | untrusted/forged trigger (trigger-authenticity fail) | false |
| `REFERENCE` | input subject unresolved by a read-service (syntactically valid, no entity) | false |
| `STATE` | (rare) row-state inconsistency at write | false |
| `CONFLICT` | optimistic-revision lost race on the `trust_scores` row | true (re-read then retry) |
| `BUSINESS` | firewall/threshold rule violated (would never zero absence-of-history) | false |
| `DEPENDENCY` | a Verification/Performance/Fraud read-service or Doc-4B outbox/audit transiently unavailable | true |
| `SYSTEM` | unexpected failure | true |

**Error Boundary block (Doc-4A §12.4/§12.6):** System contract — no tenant-facing surface, so no protected-fact collapse; stages 4–5 collapse to a single trigger-authenticity check (§21.5). **REFERENCE vs DEPENDENCY:** an unresolved input *subject* → `REFERENCE` (422); a read-service *outage* → `DEPENDENCY` (503, retryable). **STATE vs CONFLICT:** a row-state inconsistency → `STATE`; an optimistic-revision race → `CONFLICT` (retryable after re-read).

**10. Idempotency Rules** — `Idempotency: required` on **inputs + `trust_formula_version`** (Doc-4A §14): a recompute with unchanged inputs and unchanged formula yields the same `score`/`band` and **emits no new `TrustScoreUpdated`, writes no new snapshot** (publish-on-change). A genuine input/formula change → exactly one snapshot + one event. Concurrent recomputes are serialized by the optimistic revision (loser → `CONFLICT`, re-read). No dedup-window key in Doc-3 §12.2 → **`[ESC-TRUST-POLICY]`** (platform default by name; no key invented).

**11. Cross-Module References** — **Intra-module (B.9a, read-only):** Verification status (BC-TRUST-1), Performance score (BC-TRUST-3), Fraud-signal state (BC-TRUST-4) via same-module Trust read-services — **never mutated**. **Marketplace (DG-2):** consumes `TrustScoreUpdated` into the directory read-model. **RFQ (DG-3):** consumes `TrustScoreUpdated` (matching refresh) — Trust makes no procurement decision. **Platform Core (DG-8):** outbox + audit. **Billing (DG-7):** **no input** (firewall).

**12. AI-Agent Implementation Notes** — **System actor only**; never expose a staff/vendor/buyer endpoint to compute or edit a score (H.9). The score is **computed, never supplied** — ignore any caller-provided score value. Inputs are **read-only**; **never write** `verification_records`/`performance_scores`/`fraud_signals` (consumer-only). **Financial Tier never feeds the score; no signal dominates; absence-of-history is never scored as 0** (Doc-3 §12.1 FIXED). Emit `TrustScoreUpdated` **only on change**, transactionally; the Trust Score aggregate is the sole publisher. Formula thresholds carry `[ESC-TRUST-POLICY]`; bump `trust_formula_version` on change — never invent a POLICY key.

---

## §G5.2 — `trust.freeze_trust_score.v1` · `trust.reactivate_trust_score.v1` — Trust-Score Freeze / Reactivate

**1. Contract Metadata** — Contract IDs `trust.freeze_trust_score.v1` · `trust.reactivate_trust_score.v1` · Template **21.6 Admin** · Owned aggregate **Trust Score** (`trust_scores` AR — `freeze_state`, `freeze_reason`, `frozen_at`) · Actor types **Admin** (platform-staff governance, §5.6) · BC-TRUST-2 (§G5). **Freeze/reactivate is governance, NOT a score edit — the underlying score value is retained (H.9).**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `vendor_profile_id` | `uuid` | yes | no | 1 | subject (Doc-2 §10.6 `trust_scores.vendor_profile_id` UNIQUE) |
| `expected_revision` | `numeric` | yes | no | 1 | optimistic-concurrency assertion (H.5) |
| `freeze_reason` | `text` | conditional | yes | 1 | required on freeze (Doc-2 §10.6 `freeze_reason`); BUSINESS rule |

**3. Response Schema** — `vendor_profile_id : uuid (1)`, `freeze_state : enum<none|frozen> (1)`, `frozen_at : timestamptz (0..1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id`, `expected_revision` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| field shapes | 2 SHAPE | Doc-4A §9; Doc-2 §10.6 | UUID/numeric shape | `VALIDATION` |
| (semantic) | 3 SEMANTIC | Doc-2 §3.6 | freeze/reactivate is a governance action on an existing score | `BUSINESS` |
| actor authenticity (platform-staff, no org) | 4 AUTHENTICATION | Doc-4A §5.6 | actor is Admin; admin scope declared | `AUTHORIZATION` |
| `staff_can_verify` or `staff_can_ban` | 5 AUTHORIZATION | Doc-2 §7; Doc-4A §6 | staff slug held (governance) | `AUTHORIZATION` |
| score-row state | 6 STATE | Doc-2 §3.6/§10.6 | freeze: source `computed`/`none`; reactivate: source `frozen` | `STATE` |
| revision match | 6 STATE (concurrency) | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| score row resolves | 7 REFERENCE | Doc-2 §10.6 | `trust_scores` row exists for `vendor_profile_id` | `NOT_FOUND` (read miss) ; `DEPENDENCY` |
| `freeze_reason` present on freeze | 8 BUSINESS | Doc-2 §10.6 | mandatory reason for freeze | `BUSINESS` |
| freeze-window tunable | 9 POLICY | Doc-3 §12.2 | window absent from §12.2 → `[ESC-TRUST-POLICY]` | `BUSINESS` (policy-derived) |

**5. Authorization Matrix** — Actor **Admin** · **Authorization rule = OR (either slug authorizes):** caller MUST hold **`staff_can_verify`** OR **`staff_can_ban`** (Doc-2 §7 platform-staff); holding either is sufficient; the operation is identical regardless of which authorized it · Scope = platform (no tenant scope) · Delegation n/a · Enforcement Identity `check_permission` evaluates the OR · If a distinct freeze-specific slug is later required → `[ESC-TRUST-SLUG]` (no slug invented; not needed today).

**6. State Machine Enforcement** — `freeze`: allowed source **`computed`** (or `freeze_state=none`) → **`frozen`** (`freeze_state=frozen`, set `freeze_reason`/`frozen_at`); suspends publication/ranking effect only — underlying `score` retained · `reactivate`: allowed source **`frozen`** → **`none`** (`computed` publication resumes) · Forbidden: reactivate on a non-`frozen` score / freeze on an already-`frozen` score → `STATE` (or idempotent no-op per §10) · Concurrency: optimistic on row revision; lost race → `CONFLICT`. **No score value is written by this contract** (governance only).

**7. Audit Binding** — Action **Doc-2 §9 Trust "trust/performance freeze + reactivation"** (separately enumerated) · Attribution **Admin** · Object scope `trust_scores` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — Emitted **`TrustScoreUpdated`** (Doc-2 §8) on freeze-state change (band publication suppressed on freeze / resumed on reactivate), via outbox-write — **the Trust Score aggregate owns the event; the freeze/reactivate contract triggers a publication-state change reflected via `TrustScoreUpdated`, it is not a separate publisher** (publisher of record = the aggregate; H.7) · **Consumed: `VendorOwnershipTransferred`** (Marketplace, Doc-2 §8) as a **Trust-Protection freeze trigger** (an admin/automated freeze on ownership transfer) · Consumers of the emitted event: Marketplace/RFQ read-model + matching refresh, Communication fan-out (DG-6).

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX/SHAPE failure (missing field) | false |
| `AUTHORIZATION` | actor/staff-slug fail (neither `staff_can_verify` nor `staff_can_ban`) | false |
| `NOT_FOUND` | no `trust_scores` row for `vendor_profile_id` | false |
| `STATE` | freeze on already-`frozen`, or reactivate on non-`frozen` (when not treated as idempotent no-op) | false |
| `CONFLICT` | `expected_revision` ≠ current (lost race) | true (re-read then retry) |
| `BUSINESS` | `freeze_reason` missing on freeze | false |
| `DEPENDENCY` | Doc-4B outbox/audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** staff surface — a missing score row returns `NOT_FOUND` on identity (the band is otherwise public; no protected-fact collapse on this governance write). **STATE vs CONFLICT:** wrong freeze/reactivate pre-state → `STATE`; stale `expected_revision` → `CONFLICT` (retryable). **REFERENCE vs DEPENDENCY:** N/A reference here (subject is the score row itself → `NOT_FOUND`); a Doc-4B outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-TRUST-POLICY]`**, H.8); re-freeze of a `frozen` score / re-reactivate of a `none` score is a **no-op** (idempotent target — same result, no duplicate audit/event); a genuine state change writes once and emits one `TrustScoreUpdated`. `expected_revision` guards races. The freeze-window tunable is absent from Doc-3 §12.2 → carried under `[ESC-TRUST-POLICY]` (platform default by name; no key invented).

**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission`. **Marketplace (DG-2):** consumes `TrustScoreUpdated`; **emits `VendorOwnershipTransferred`** which this contract consumes (Trust-Protection freeze). **Platform Core (DG-8):** audit + outbox. **Billing (DG-7):** no input (firewall).

**12. AI-Agent Implementation Notes** — freeze/reactivate is **governance, not a score edit** — never modify `score`/`band`; only `freeze_state`/`freeze_reason`/`frozen_at`. Authorization is an **OR** over `staff_can_verify`/`staff_can_ban`. The emitted `TrustScoreUpdated` is owned by the Trust Score aggregate (publisher of record); this contract **triggers** the publication-state change, it is not a second publisher. `VendorOwnershipTransferred` is a **consume** (Trust-Protection freeze), never a Trust emission. Freeze suspends publication/ranking only — the score persists.

---

## §G5.3 — `trust.get_trust_score.v1` · `trust.list_trust_score_history.v1` — Trust-Score Reads

**1. Contract Metadata** — Contract IDs `trust.get_trust_score.v1` · `trust.list_trust_score_history.v1` · Template **21.3 Query** · Owned aggregate **Trust Score** (`trust_scores` + `trust_score_history`, read-only) · Actor types **internal-service / any caller via public projection** (current band) · **Admin** (history) · BC-TRUST-2 (§G5).

**2. Request Schema** — *get_trust_score:* `vendor_profile_id : uuid (1, required)`. *list_trust_score_history:* `vendor_profile_id : uuid (1, required)`, pagination (`limit`, `cursor`) — allowlisted filter/sort fields only (Doc-4A §9.6).

**3. Response Schema** — *get_trust_score:* `score : numeric (0..1; null/suppressed while frozen)`, `band : enum/string (1)`, `trust_score_updated_at : timestamptz (1)`, `freeze_state : enum<none|frozen> (1)` — **public band/score unless frozen** (Doc-2 §3.6); no internal formula internals beyond `trust_formula_version`. *list_trust_score_history:* page of snapshots (score, band, `formula_version`, timestamp) — **staff view**. Every response carries `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id` typed; allowlisted filters (history) | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; filter+sort fields allowlisted | `VALIDATION` |
| field shapes | 2 SHAPE | Doc-4A §9 | UUID/pagination shape | `VALIDATION` |
| (semantic) | 3 SEMANTIC | Doc-2 §3.6 | a score/history may be read for the subject | — |
| actor authenticity | 4 AUTHENTICATION | Doc-4A §5.6 | internal-service/public (current band) ; Admin (history) | `AUTHORIZATION` |
| authorization | 5 AUTHORIZATION | Doc-2 §7 | current band = **public**, no slug ; history = `staff_can_verify` | `AUTHORIZATION` (history without slug) |
| (state) | 6 STATE | — | reads do not mutate state | — |
| reference resolves | 7 REFERENCE | Doc-2 §10.6 | `vendor_profile_id` resolves to a `trust_scores` row | `NOT_FOUND` (read miss) ; `DEPENDENCY` (read-store down) |

**5. Authorization Matrix (per query — independent authority):**

- **`trust.get_trust_score.v1`** — Actor **internal-service / any caller via public projection** · Authorization **none** (public band/score read, Doc-2 §3.6 "band published unless frozen") · Scope **public** (per `vendor_profile_id`) · Visibility **public band + score (suppressed/absent while `frozen`)**; no history, no formula internals beyond `trust_formula_version`.
- **`trust.list_trust_score_history.v1`** — Actor **Admin** (platform-staff, §5.6) · Authorization **`staff_can_verify`** (Doc-2 §7) · Scope **platform** · Visibility **staff-only** — versioned snapshots; allowlisted filter/sort (Doc-4A §9.6); non-entitled caller → `NOT_FOUND` (protected-fact collapse on the internal history surface, §7.5).

Enforcement: Identity `check_permission` for the history query; the public band read requires no slug. **No query mutates state (CQRS).**

**6. State Machine Enforcement** — n/a — **queries do not mutate state** (read-only). A `frozen` score is reported with `freeze_state=frozen` and its band/score publication suppressed (Doc-2 §3.6) — never fabricated, never silently shown.

**7. Audit Binding** — **none — reads are not audited** (Doc-4A §17.1).

**8. Event Binding** — Emitted **none** (reads) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | bad identifier / non-allowlisted filter or sort field | false |
| `AUTHORIZATION` | history requested without `staff_can_verify` (where existence is non-protected at the staff surface) | false |
| `NOT_FOUND` | no `trust_scores` row, or history requested by a non-entitled caller (protected-fact collapse) | false |
| `DEPENDENCY` | read-store transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** the **current band/score is public** (band/score unless frozen); the **history is staff-only** — a non-entitled caller requesting history receives `NOT_FOUND` (protected-fact collapse, §7.5), never a disclosure of history existence. No write path; no `STATE`/`CONFLICT`. **REFERENCE vs DEPENDENCY:** a missing row → `NOT_FOUND` (read miss); a read-store outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: not-applicable` (Doc-4A §14.1 — queries are side-effect-free and naturally idempotent).

**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission` for history. **Marketplace (DG-2):** the **trust band is projected into the directory read-model via service** (never table access) — Doc-2 §10.6. **Platform Core (DG-8):** read-store/observability.

**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). The **current band/score is public** (suppressed while `frozen`); **history is staff-only** — collapse non-entitled history reads to `NOT_FOUND` (§7.5). Never fabricate a band for a `frozen` score; report `freeze_state`. Marketplace reads the band **via service projection**, never by direct table access.

---

## §G5.Z — Part-2 Conformance & Carried-Marker Ledger (BC-TRUST-2)

**Contract roster (hardened this Part — exactly the Pass-A §G5 set; none added/removed):**

| § | Contract ID(s) | Template | Owned aggregate | Actor |
|---|---|---|---|---|
| §G5.1 | `trust.compute_trust_score.v1` | 21.5 System | Trust Score (`trust_scores`,`trust_score_history`) | System |
| §G5.2 | `trust.freeze_trust_score.v1` · `trust.reactivate_trust_score.v1` | 21.6 Admin | Trust Score | Admin |
| §G5.3 | `trust.get_trust_score.v1` · `trust.list_trust_score_history.v1` | 21.3 Query | Trust Score | internal-service / Admin |

**Authority binding (all by pointer; nothing invented):**

| Binding | Authoritative source |
|---|---|
| Lifecycle | Doc-2 §3.6/§10.6 — Trust Score `computed | frozen` (freeze suspends publication/ranking only); `trust_score_history` append-only |
| Entities / fields | Doc-2 §10.6 (`trust_scores`, `trust_score_history`) |
| Permissions | Doc-2 §7 — `staff_can_verify`, `staff_can_ban` (freeze/reactivate OR; history `staff_can_verify`); band read public (no slug); **computation = System actor, no slug** |
| Events | Doc-2 §8 — `TrustScoreUpdated` (owned + emitted by Trust Score aggregate; publisher of record = `trust.compute_trust_score.v1`); consumed `VendorOwnershipTransferred` (Marketplace → Trust-Protection freeze); nothing coined |
| Audit | Doc-2 §9 Trust — "recalculation", "formula version change" (compute), "trust/performance freeze + reactivation" (freeze/reactivate) — all separately enumerated; no `[ESC-TRUST-AUDIT]` required in Part 2 |
| Validation order | canonical Pass-B nine-stage (frozen Part-1 presentation); Doc-4A §11.2 enforcement authority |
| Error model | Doc-4A §12 / Annexure B closed twelve-class set; REFERENCE≠DEPENDENCY, STATE≠CONFLICT enforced per contract |
| Idempotency | Doc-4A §14; compute = publish-on-change (idempotent on inputs+formula_version); freeze/reactivate dedup window → `[ESC-TRUST-POLICY]` |
| Firewall / moat | Architecture §1.5 / Invariant 6 (Financial Tier never feeds Trust Score; no signal dominates; absence ≠ zero); Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED |

**Carried dependencies (unchanged):** DG-2 (Marketplace — consumes `TrustScoreUpdated` into read-model; emits `VendorOwnershipTransferred` consumed as freeze trigger), DG-3 (RFQ — consumes `TrustScoreUpdated` as a matching signal; Trust makes no procurement decision), DG-8 (Platform Core — audit/outbox). DG-7 (Billing) referenced only as the **firewall** (no input). Intra-module read-services (B.9a): Verification (BC-TRUST-1), Performance (BC-TRUST-3), Fraud (BC-TRUST-4) — **read-only, never mutated**.

**Carried escalation markers (unchanged; never resolved here):** `[ESC-TRUST-POLICY]` (Doc-3 §12.2 additive — trust-score formula thresholds/weights, freeze window, dedup window); `[ESC-TRUST-SLUG]` (Doc-2 §7 additive — any distinct freeze-specific slug if later required; not needed today). `[ESC-TRUST-AUDIT]` (Doc-2 §9 additive) is carried at Part level as the standing no-invention guardrail — **no BC-TRUST-2 mutation requires it** (all three §9 actions are enumerated).

**Firewall & moat (Part-2 posture):** Trust Score is platform-owned, **System-computed only** — no staff/vendor/buyer/manual mutation; **BC-TRUST-2 is consumer-only** of Verification/Performance/Fraud inputs and mutates none of them (source ownership stays BC-TRUST-1/3/4); Financial Tier never feeds the score; no Billing influence; absence-of-history never zeroed; the **Trust Score aggregate owns `TrustScoreUpdated`** (no publisher ambiguity); Trust Score is a **signal only** — no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. **No flag-and-halt triggered; no corpus conflict.**

---

*End of Doc-4G — Trust & Verification Engine — Pass-B Part 2 v1.0 — BC-TRUST-2 Trust Scoring. Hardens the frozen Pass-A §G5 contract set (4 contract IDs: compute/recalculate trust score; freeze/reactivate; trust-score reads + history) to implementation grade — request/response schemas, canonical Pass-B nine-stage validation matrices (authority · validation · failure class per row; Doc-4A §11.2 enforcement), authorization matrices (Doc-2 §7 slugs only; computation System-actor no-slug), state-machine enforcement (Doc-2 §3.6 `computed|frozen`; STATE vs CONFLICT separated), audit bindings (Doc-2 §9 recalculation / formula version change / freeze + reactivation), event bindings (Doc-2 §8 `TrustScoreUpdated` owned + emitted by the Trust Score aggregate; `VendorOwnershipTransferred` consumed; nothing coined), error registers (Doc-4A §12 closed class; REFERENCE vs DEPENDENCY separated), and idempotency rules (compute publish-on-change; `[ESC-TRUST-POLICY]` windows). Ownership, aggregate, permissions, lifecycle, events, and bounded context unchanged from Pass-A. BC-TRUST-2 is consumer-only of Verification/Performance/Fraud (mutates none); Trust Score computation is System-actor only; the Trust Score aggregate owns `TrustScoreUpdated`; trust firewall and procurement moat preserved; nothing invented; no corpus conflict; no flag-and-halt. Scope: BC-TRUST-2 only — BC-TRUST-1/3/4/5 belong to other Pass-B parts. Next: Doc-4G_PassB_Part3 (BC-TRUST-3 Performance Scoring).*
