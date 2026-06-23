# Doc-4G — Trust & Verification Engine — Pass-B (Hardening) Part 4 v1.0 — BC-TRUST-4 Fraud & Risk Signals

| Field | Value |
|---|---|
| Document | Doc-4G — **Pass-B Part 4 v1.0** — Module 5 Trust & Verification (`trust` schema, `trust_` namespace) |
| Part scope | **BC-TRUST-4 — Fraud & Risk Signals (§G7)** — the Pass-A §G7 contracts (Fraud Signal aggregate), hardened to implementation grade |
| Status | **Pass-B Part 4 draft — implementation-grade contract specification for BC-TRUST-4.** Independently reviewable. Authorized next stage after review/patch: **Doc-4G_PassB_Part5 (BC-TRUST-5 Reviews & Admin Ratings).** |
| Contract authority | `Doc-4G_PassA_v1.0_FROZEN` (sole contract authority — **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4G_Structure_v1.0_FROZEN` |
| Carry-forward | `Doc-4G_PassB_Part1/2/3_v1.0_FROZEN` (frozen conventions honored: canonical nine-stage validation; System-actor generation; single publisher-of-record discipline; staff-only non-disclosure; firewall postures) |
| Authority | Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN, Doc-4G Pass-A FROZEN, Doc-4G PassB Part1 FROZEN, Doc-4G PassB Part2 FROZEN, Doc-4G PassB Part3 FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-TRUST-1 Verification & Verified Tier · Part 2 — BC-TRUST-2 Trust Scoring · Part 3 — BC-TRUST-3 Performance Scoring · **Part 4 — BC-TRUST-4 Fraud & Risk Signals** · Part 5 — BC-TRUST-5 Reviews & Admin Ratings |
| Audience | Claude Code / Cursor / Codex / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Pass-B mission (Part 4).** Convert the Pass-A BC-TRUST-4 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices in the canonical Pass-B nine-stage presentation (Doc-4A §11.2 enforcement authority), authorization matrices, state-machine enforcement, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), and idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §G7. **Fraud & Risk Signals are owned exclusively by BC-TRUST-4.** A fraud signal **may consume** Identity signals, Verification outcomes, Marketplace activity, RFQ activity, Operations activity, and Communication activity (as detection inputs); it **may NOT mutate Trust Score, Performance Score, Verification, or Financial Tier** — **fraud signals provide inputs only; ownership of downstream decisions (the ban) remains external (Admin / Doc-4J)**. **Fraud signals are System-generated** (system-detected) or staff-reported — **no vendor-generated, no buyer-generated fraud state; no manual fraud-score editing**; administrative action is limited to the **frozen-corpus fraud lifecycle** (`open → reviewed → actioned | dismissed`) — the corpus defines **no** fraud freeze/reactivate/acknowledge state, so none is authored (the `reviewed` transition is the corpus investigation step; **no state invented**). The **Fraud Signal aggregate owns only its approved events** — and Doc-2 §8 enumerates **no** Trust fraud event, so **BC-TRUST-4 emits no domain event** (Admin consumes signal state by service); **no publisher ambiguity, no cross-context event ownership.** The **procurement moat** holds — fraud is a **signal source only**; BC-TRUST-4 owns no matching/routing/ranking/evaluation/supplier-selection/award; RFQ authoritative. Carried dependencies **DG-1, DG-2, DG-3, DG-4, DG-5, DG-6, DG-8** (the BC-TRUST-4 detection-input + Admin seams) and the markers **`[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 4.

---

## §H — Part-4 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (canonical Pass-B presentation; Doc-4A §11.2 is the enforcement authority).** The single canonical stage vocabulary used by **every** Validation Matrix in this Part is `1 SYNTAX → 2 SHAPE → 3 SEMANTIC → 4 AUTHENTICATION → 5 AUTHORIZATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY` (the frozen Part-1/2/3 presentation). **Enforcement authority (Doc-4A §11.2, FROZEN — order and logic unchanged):** `1 SYNTAX` + `2 SHAPE` enforce §11.2 SYNTAX; `3 SEMANTIC` and `8 BUSINESS` enforce §11.2 BUSINESS; `4 AUTHENTICATION` enforces §11.2 CONTEXT (§5.2/§5.3/§5.6); `5 AUTHORIZATION` enforces §11.2 AUTHZ + SCOPE + DELEGATION (§6/§6B); `6 STATE` / `7 REFERENCE` / `9 POLICY` enforce the identically-named §11.2 stages. Order is exactly §11.2, never reordered. Failure terminates at the first failing stage; SYNTAX/SHAPE MAY aggregate field errors, later stages fail singly. For **System contracts (21.5)** with no tenant, stages 4–5 collapse to a single **trigger-authenticity** check (Doc-4A §21.5/§11.2). Each row names **stage · source authority · rule (validation) · failure outcome (failure class)**. Where a stage does not apply, an explicit **N/A** row is shown (frozen Part-3 §G6.4 presentation precedent).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source — never extended), `numeric`, `string`, `text`, `jsonb` (opaque; presence/shape boundary only), `timestamptz`, `bool`. **Required** = present + non-null (absence → SYNTAX). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** **Confirmed Doc-2 §7 slug used in this Part: `staff_can_ban`** (the fraud/ban platform-staff family) — for staff-reported creation and all triage (review/action/dismiss) and reads. **System-detected creation carries NO slug — System actor** (Doc-4A §5.2). **No vendor/buyer/tenant authorization path exists** for any fraud-signal operation (no vendor- or buyer-generated fraud state). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C, consumed; no shadow authorization). Staff actions are platform-staff (no active-org context, §5.6), **not delegation-eligible**. Where a required staff action lacks a §7 slug → **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive; no slug invented). Same System-actor model as the frozen Part-1/2/3 System contracts (Authorization = none; enforcement = trigger-authenticity).
- **H.4 — Error model (Doc-4A §12; closed twelve-class set, Annexure B).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes `trust_<domain>_<code>` (namespace `trust_`); numeric codes are dev-doc stage — Pass-B fixes **class + trigger + retryable**. **Mandatory separations (never conflated):** **REFERENCE** (Domain, 422 — a `subject_id`/source-activity reference is syntactically valid but does not resolve) ≠ **DEPENDENCY** (Infrastructure, 503, retryable — a consumed detection-input/read-service is transiently unavailable); **STATE** (Domain, 409 — signal not in a valid pre-state for the triage transition) ≠ **CONFLICT** (Concurrency, 409, retryable after re-read — optimistic-concurrency token mismatch). **Protected-fact collapse to `NOT_FOUND`** (§7.5) applies to the **entire fraud surface** — fraud signals are staff-internal; a non-staff caller must not learn a signal exists (H.9). The **Error Boundary block** (§12.4/§12.6) is stated per contract.
- **H.5 — State machine (Doc-2 §3.6/§10.6; Doc-4A §13).** The BC-TRUST-4 lifecycle is exactly **Fraud Signal** (`fraud_signals`): **`open → reviewed → actioned | dismissed`** (entry `open`; Doc-2 §3.6/§10.6). Transitions: create writes the signal at `open`; review `open → reviewed`; action `reviewed → actioned`; dismiss `reviewed → dismissed`. `actioned`/`dismissed` are terminal. **The frozen corpus defines NO freeze/reactivate/acknowledge state for fraud signals** — none is authored; the `reviewed` transition is the corpus investigation/acknowledgement step. Every mutation cites allowed **source state(s)**, **target state**, **forbidden source states** (→ `STATE`). Concurrency: optimistic — mutating commands assert the expected row revision; lost race → `CONFLICT`. **No edge added or modified; no state invented.**
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`System` for system-detected create; `Admin` for staff create + all triage), **object scope** (the `trust.fraud_signals` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B). Reads are not audited (§17.1). **The Doc-2 §9 Trust domain does NOT separately enumerate any fraud-signal action** (it enumerates verification/score-freeze/recalculation/formula/tier actions only); therefore **every** BC-TRUST-4 mutation (create/review/action/dismiss) carries **`[ESC-TRUST-AUDIT]`** (interim: bind the nearest §9 Trust action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §G7/§G12/§G14.
- **H.7 — Events (Doc-2 §8); the Fraud Signal aggregate owns only its approved events.** **Doc-2 §8 enumerates NO Trust fraud event.** Therefore **BC-TRUST-4 emits NO domain event** — every fraud-signal mutation is **state + §9 audit only** (no event coined, §16.4). Admin (Doc-4J) **consumes the signal state by service** for ban management — there is no fraud event to publish, **no publisher ambiguity, and no cross-context event ownership**. BC-TRUST-4 **consumes no Doc-2 §8 event for state transitions** either: detection inputs (Identity/Verification/Marketplace/RFQ/Operations/Communication activity) are read as **signals/refs** to inform a signal, not as state-driving event consumptions; where a detection rule keys off an existing Doc-2 §8 event, it binds that existing event only (no event coined). Notification fan-out, where any, is Communication's (DG-6).
- **H.8 — Idempotency (Doc-4A §14).** **System-detected create** is idempotent on the detection key `(subject_id, subject_type, signal_type, detection_window)` — at-least-once detection never produces a duplicate `open` signal for the same indicator within the window. **Staff create** carries `Idempotency: required` + a dedup window. **Triage** (review/action/dismiss, 21.6) carries `Idempotency: required` — replay of the same transition on an already-advanced signal is a no-op on the terminal/target state (or → `STATE` if the source is wrong, per §6). **No `trust` dedup-window key is registered in Doc-3 §12.2** → carried under **`[ESC-TRUST-POLICY]`** (reference the platform default by name; no key invented). Replay within the window → same result, no duplicate audit. Queries (21.3) are side-effect-free (`Idempotency: not-applicable`, §14.1).
- **H.9 — Trust-firewall, non-disclosure & moat enforcement (Architecture §1.5/Invariant 6; Doc-4A §4B/§7.5; Doc-3 §11.8/§12.1 FIXED — load-bearing per contract).** (a) **Fraud & Risk Signals are owned exclusively by BC-TRUST-4** — platform-owned, System-generated or staff-reported; **no vendor/buyer/tenant-generated fraud state; no manual fraud-score editing**. (b) **Fraud signals provide inputs only** — a signal **may consume** Identity/Verification/Marketplace/RFQ/Operations/Communication activity as detection inputs, and **may NOT mutate Trust Score (BC-TRUST-2), Performance Score (BC-TRUST-3), Verification (BC-TRUST-1), or Financial Tier (BC-TRUST-1 verified tier / Marketplace declared tier)**. (c) **Ownership of downstream decisions remains external** — the **ban decision is Admin's** (Doc-4J, DG-5); BC-TRUST-4 records/triages and surfaces `actioned` signals; it **never issues a ban**. (d) **Fraud state is a read-only input to BC-TRUST-2** (the trust-score firewall, B.9a/Part-2) — Trust Score reads fraud state; BC-TRUST-4 never writes a score. (e) **No paid plan/entitlement/flag gates or influences fraud signals** (Doc-4A §4B; DG-7 — Billing has no input). (f) **Non-disclosure (Doc-4A §7.5; Doc-2 §3.6):** fraud signals are **staff-internal — never tenant-visible, never vendor/buyer-facing**; every read/mutate is staff-gated (`staff_can_ban`), and a non-staff caller's reference collapses to `NOT_FOUND` (never `AUTHORIZATION`, which would confirm existence). (g) **Procurement moat:** BC-TRUST-4 computes no matching/routing/ranking/evaluation/selection/award; fraud is a **signal source only** RFQ/Admin consume, never a decision Trust makes.
- **H.10 — `trust` BC-TRUST-4 field source (Doc-2 §10.6).** The hardened schemas bind to the frozen Doc-2 §10.6 columns; **Pass-B introduces no column**:
  - `fraud_signals`: `subject_id` + `subject_type`, `signal_type`, `severity`, `state enum<open|reviewed|actioned|dismissed>`, `reported_by` (+ standard columns; lifecycle `open → reviewed → actioned | dismissed`).
  - *(read-only detection inputs / refs, owned elsewhere — never mutated)* Identity (DG-1), Verification (BC-TRUST-1, in-module read), Marketplace (DG-2), RFQ (DG-3), Operations (DG-4), Communication (DG-6) activity/signals — consumed as detection inputs only.
  - *(referenced, not owned)* Admin `ban_actions`/moderation (DG-5) — Admin consumes `actioned` signals; the ban decision is Admin's.

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.** Grouped families share section 1 and split the records where the schema differs.

---

## §G7.1 — `trust.create_fraud_signal.v1` — Create Fraud Signal

**1. Contract Metadata** — Contract ID `trust.create_fraud_signal.v1` · Template **21.6 Admin** (staff-reported) · **21.5 System** (system-detected) · Owned aggregate **Fraud Signal** (`fraud_signals` AR) · Actor types **Admin** (platform-staff, §5.6) **/ System** (system-detected; §5.2) · Bounded context **BC-TRUST-4** (§G7) · **System-generated or staff-reported only — no vendor/buyer/tenant creation path (H.9a).**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes (source) |
|---|---|---|---|---|---|
| `subject_id` | `uuid` | yes | no | 1 | Doc-2 §10.6 `subject_id` (the suspected entity) |
| `subject_type` | `string`/`enum` | yes | no | 1 | Doc-2 §10.6 `subject_type` (subject discriminator; membership per Doc-2 — not extended) |
| `signal_type` | `string`/`enum` | yes | no | 1 | Doc-2 §10.6 `signal_type` (fixed by Doc-2; do not extend) |
| `severity` | `string`/`enum` | yes | no | 1 | Doc-2 §10.6 `severity` |
| `detection_ref` | `jsonb` | no | yes | 1 | the detection input/evidence ref (shape = dev-doc scope); for system-detected signals |

*(`reported_by` is set from the authenticated actor — Admin staff user, or the System detector — not a caller-supplied field.)*

**3. Response Schema** — `fraud_signal_id : uuid (1)`, `state : enum<open|reviewed|actioned|dismissed> (1) = open`, `reference_id : uuid (1)`. *(For the 21.5 System variant: Response **none**; the created `fraud_signal_id`/`reference_id` are recorded on the audit record.)*

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `subject_id`/`subject_type`/`signal_type`/`severity` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` (aggregated) |
| enums ∈ Doc-2 §10.6 sets; UUID shape | 2 SHAPE | Doc-2 §10.6 | enum membership; shape | `VALIDATION` |
| signal semantics valid | 3 SEMANTIC | Doc-2 §10.6 | `signal_type`/`severity`/`subject_type` form a coherent indicator | `BUSINESS` |
| actor authenticity | 4 AUTHENTICATION | Doc-4A §5.6 (Admin) / §21.5 (System) | Admin staff (no active org) **or** System trigger-authenticity | `AUTHORIZATION` |
| `staff_can_ban` (Admin) / none (System) | 5 AUTHORIZATION | Doc-2 §7; Doc-4A §6/§5.2 | staff holds `staff_can_ban`; System actor carries no slug | `AUTHORIZATION` |
| (state) | 6 STATE | Doc-2 §3.6/§10.6 | N/A — create has no prior state (entry `open`) | — |
| `subject_id` resolves | 7 REFERENCE | Doc-2 §10.6; DG-1/2/3/4 | the subject resolves via the owning module's service | `REFERENCE` (unresolved) ; `DEPENDENCY` (resolver down) |
| firewall: signal-only, no score write | 8 BUSINESS | Architecture §1.5; H.9 | the signal records an indicator; it mutates no score/verification/tier | `BUSINESS` |
| dedup window | 9 POLICY | Doc-3 §12.2 | detection dedup-window key absent → `[ESC-TRUST-POLICY]` | `BUSINESS` (policy-derived) |

**5. Authorization Matrix** — *staff-reported:* Actor **Admin** · Slug **`staff_can_ban`** (Doc-2 §7) · Scope = platform · Delegation n/a · Enforcement `check_permission`. *system-detected:* Actor **System** · **Authorization = none** (no slug; Doc-4A §5.2) · Enforcement = trigger-authenticity (§21.5). **No vendor/buyer path.**

**6. State Machine Enforcement** — Allowed source **none** (creation) · Target **`open`** (Doc-2 §3.6/§10.6 entry) · Forbidden: n/a (entry) · Concurrency: idempotent create on the detection key (system-detected) / dedup window (staff) — see §10; a duplicate indicator within the window → no second `open` row.

**7. Audit Binding** — Action **`[ESC-TRUST-AUDIT]`** — fraud-signal create is **not** separately enumerated in Doc-2 §9 → nearest §9 Trust action by pointer (channel Doc-2 §9 additive; **no action invented**) · Attribution **System** (system-detected) / **Admin** (staff) · Object scope new `fraud_signals` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **Emits NO event** (H.7 — Doc-2 §8 has no Trust fraud event; Admin consumes signal state by service) · Consumed: a system-detected create may be **triggered** by an existing Doc-2 §8 event from a source module (detection rule), but binds that existing event only — **no event coined**; no fraud event published.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX/SHAPE failure (missing field; enum out of Doc-2 §10.6 set) | false |
| `AUTHORIZATION` | non-staff/untrusted actor; staff lacks `staff_can_ban` | false |
| `NOT_FOUND` | (non-staff caller — protected-fact collapse, H.9f) | false |
| `REFERENCE` | `subject_id` syntactically valid but unresolved | false |
| `BUSINESS` | incoherent indicator; firewall violation (score/verification/tier mutation attempt) | false |
| `DEPENDENCY` | subject resolver / Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** the **entire fraud surface is staff-internal** — a non-staff caller receives `NOT_FOUND` (protected-fact collapse, §7.5), never `AUTHORIZATION` (which would confirm the surface/subject). System variant: stages 4–5 collapse to trigger-authenticity. **REFERENCE vs DEPENDENCY:** unresolved `subject_id` → `REFERENCE`; resolver outage → `DEPENDENCY`.

**10. Idempotency Rules** — *system-detected:* `Idempotency: required` — idempotent on `(subject_id, subject_type, signal_type, detection_window)`; at-least-once detection → one `open` signal, no duplicate. *staff:* `Idempotency: required` + dedup window. Dedup-window key absent from Doc-3 §12.2 → **`[ESC-TRUST-POLICY]`** (platform default by name; no key invented). Replay within window → same `fraud_signal_id`, no duplicate audit.

**11. Cross-Module References** — **Detection inputs (read-only; never mutated):** Identity (DG-1), Verification (BC-TRUST-1 in-module read), Marketplace (DG-2), RFQ (DG-3), Operations (DG-4), Communication (DG-6) activity. **Admin (DG-5):** consumes `actioned` signals for ban management; **the ban decision is Admin's**. **Platform Core (DG-8):** audit. **Billing (DG-7):** no input (firewall).

**12. AI-Agent Implementation Notes** — **System-generated or staff-reported only** — never expose a vendor/buyer/tenant creation path (H.9a). `signal_type`/`severity`/`subject_type` enums are exactly Doc-2 §10.6 — never extend. The signal **records an indicator** and **mutates no score/verification/tier** (inputs only, H.9b). **Emits no event** (Doc-2 §8 has none — never coin one). The **ban decision is Admin's** (DG-5) — never issue a ban here. Entire surface is **staff-internal** — collapse non-staff access to `NOT_FOUND` (§7.5).

---

## §G7.2 — `trust.review_fraud_signal.v1` · `trust.action_fraud_signal.v1` · `trust.dismiss_fraud_signal.v1` — Fraud-Signal Triage

**1. Contract Metadata** — Contract IDs `trust.review_fraud_signal.v1` · `trust.action_fraud_signal.v1` · `trust.dismiss_fraud_signal.v1` · Template **21.6 Admin** · Owned aggregate **Fraud Signal** (`fraud_signals` AR) · Actor types **Admin** (platform-staff, §5.6) · BC-TRUST-4 (§G7). **Staff triage only; no score/ban mutation (H.9b/c).**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `fraud_signal_id` | `uuid` | yes | no | 1 | target signal |
| `expected_revision` | `numeric` | yes | no | 1 | optimistic-concurrency assertion (H.5) |
| `triage_note` | `text` | no | yes | 1 | reviewer note (action/dismiss rationale; shape dev-doc) |

**3. Response Schema** — `fraud_signal_id : uuid (1)`, `state : enum<open|reviewed|actioned|dismissed> (1)`, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `fraud_signal_id`, `expected_revision` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| field shapes | 2 SHAPE | Doc-4A §9 | UUID/numeric shape | `VALIDATION` |
| triage semantics | 3 SEMANTIC | Doc-2 §3.6 | the requested transition is a valid triage step | `BUSINESS` |
| actor authenticity (platform-staff) | 4 AUTHENTICATION | Doc-4A §5.6 | actor is Admin; admin scope declared | `AUTHORIZATION` |
| `staff_can_ban` | 5 AUTHORIZATION | Doc-2 §7 | staff slug held | `AUTHORIZATION` |
| signal in valid pre-state | 6 STATE | Doc-2 §3.6/§10.6 | review: source `open`; action/dismiss: source `reviewed` | `STATE` |
| revision match | 6 STATE (concurrency) | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| signal resolves | 7 REFERENCE | Doc-2 §10.6 | `fraud_signal_id` resolves | `NOT_FOUND` (read miss / non-staff collapse) ; `DEPENDENCY` |
| firewall: no score/ban mutation | 8 BUSINESS | Architecture §1.5; H.9 | triage changes only `fraud_signals.state`; no score/verification/tier write; no ban issued | `BUSINESS` |

**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_ban`** (Doc-2 §7 platform-staff) · Scope = platform · Delegation n/a · Enforcement `check_permission`. **No vendor/buyer path.**

**6. State Machine Enforcement** — `review`: source **`open`** → **`reviewed`** · `action`: source **`reviewed`** → **`actioned`** (terminal) · `dismiss`: source **`reviewed`** → **`dismissed`** (terminal) (Doc-2 §3.6/§10.6) · Forbidden: any other source → `STATE`; `actioned`/`dismissed` are terminal (never reopen) · **No freeze/reactivate/acknowledge state exists in the corpus — the `reviewed` step is the investigation/acknowledgement transition; none invented** · Concurrency: optimistic; lost race → `CONFLICT`.

**7. Audit Binding** — Action **`[ESC-TRUST-AUDIT]`** — fraud triage transitions are **not** separately enumerated in Doc-2 §9 → nearest §9 Trust action by pointer (channel Doc-2 §9 additive; **no action invented**) · Attribution **Admin** · Object scope `fraud_signals` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **Emits NO event** (H.7 — no Trust fraud event in Doc-2 §8) · Consumed: Admin (DG-5) **reads** `actioned` signals by service for ban management — there is no fraud event published; **no publisher ambiguity.**

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX/SHAPE failure | false |
| `AUTHORIZATION` | non-staff / lacks `staff_can_ban` | false |
| `NOT_FOUND` | signal absent, or non-staff caller (protected-fact collapse, H.9f) | false |
| `STATE` | wrong source state (e.g. action on `open`; transition on a terminal signal) | false |
| `CONFLICT` | `expected_revision` ≠ current (lost race) | true (re-read then retry) |
| `BUSINESS` | firewall violation (score/ban mutation attempt) | false |
| `DEPENDENCY` | Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** staff-internal surface — a non-staff caller receives `NOT_FOUND` (protected-fact collapse, §7.5). **STATE vs CONFLICT:** wrong source state → `STATE`; stale `expected_revision` → `CONFLICT` (retryable). **REFERENCE vs DEPENDENCY:** missing signal → `NOT_FOUND`; Doc-4B outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-TRUST-POLICY]`**, H.8); replay of the same transition that already applied → same state, no duplicate audit; a transition against a terminal/wrong source → `STATE` (not idempotency-absorbed). `expected_revision` guards races.

**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission`. **Admin (DG-5):** consumes `actioned` signals; **the ban decision is Admin's**. **Platform Core (DG-8):** audit. **Billing (DG-7):** no input (firewall).

**12. AI-Agent Implementation Notes** — triage changes **only `fraud_signals.state`** — never a score/verification/tier, never a ban (H.9b/c; the ban is Admin's, DG-5). `actioned`/`dismissed` are terminal — never reopen (Doc-2 §3.6). **No freeze/reactivate/acknowledge state exists** — do not invent one; `reviewed` is the investigation step. **Emits no event** (Doc-2 §8 has none). Staff-internal — collapse non-staff access to `NOT_FOUND` (§7.5).

---

## §G7.3 — `trust.get_fraud_signal.v1` · `trust.list_fraud_signals.v1` — Fraud-Signal Reads

**1. Contract Metadata** — Contract IDs `trust.get_fraud_signal.v1` · `trust.list_fraud_signals.v1` · Template **21.3 Query** · Owned aggregate **Fraud Signal** (`fraud_signals`, read-only) · Actor types **Admin** (platform-staff, §5.6) — **staff-only; never tenant-visible (H.9f)** · BC-TRUST-4 (§G7).

**2. Request Schema** — *get_fraud_signal:* `fraud_signal_id : uuid (1, required)`. *list_fraud_signals:* filter fields `state? : enum<open|reviewed|actioned|dismissed>`, `severity? : enum`, `subject_type? : enum`, pagination — allowlisted filter/sort fields only (Doc-4A §9.6).

**3. Response Schema** — *get_fraud_signal:* the `fraud_signals` row (`subject_id`, `subject_type`, `signal_type`, `severity`, `state`, `reported_by`) — **staff view**. *list_fraud_signals:* page of signal summaries (staff triage queue). Every response carries `reference_id : uuid (1)`. **No tenant/public projection of any kind.**

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| identifier typed; allowlisted filters | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; filter+sort fields allowlisted | `VALIDATION` |
| field shapes | 2 SHAPE | Doc-4A §9 | UUID/pagination shape | `VALIDATION` |
| (semantic) | 3 SEMANTIC | Doc-2 §3.6 | a signal/queue may be read by staff | — |
| actor authenticity (platform-staff) | 4 AUTHENTICATION | Doc-4A §5.6 | actor is Admin; admin scope | `AUTHORIZATION` |
| `staff_can_ban` | 5 AUTHORIZATION | Doc-2 §7 | staff slug held (**staff-only; never tenant-visible**) | `AUTHORIZATION` / `NOT_FOUND` (non-staff collapse, H.9f) |
| (state) | 6 STATE | — | N/A — reads do not mutate state | — |
| reference resolves | 7 REFERENCE | Doc-2 §10.6 | `fraud_signal_id` resolves | `NOT_FOUND` (read miss) ; `DEPENDENCY` (store down) |
| (business) | 8 BUSINESS | — | N/A — no business rule beyond staff-gating | — |

**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_ban`** (Doc-2 §7) · Scope = platform · Visibility **staff-only — never tenant-visible, never public** (Doc-2 §3.6; Doc-4A §7.5) · Delegation n/a · Enforcement `check_permission`. **No vendor/buyer/public read path exists.** **No query mutates state (CQRS).**

**6. State Machine Enforcement** — n/a — **queries do not mutate state** (read-only).

**7. Audit Binding** — **none — reads are not audited** (Doc-4A §17.1).

**8. Event Binding** — Emitted **none** (reads) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | bad identifier / non-allowlisted filter or sort field | false |
| `AUTHORIZATION` | (rare — staff actor lacking `staff_can_ban`; otherwise collapses to `NOT_FOUND`) | false |
| `NOT_FOUND` | signal absent, **or any non-staff caller** (protected-fact collapse, H.9f) | false |
| `DEPENDENCY` | read-store transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** the **entire fraud surface is staff-internal** — **any** non-staff caller receives `NOT_FOUND` (protected-fact collapse, §7.5), never a disclosure of signal existence; the not-staff and not-exist paths return identical code/message/shape/timing. No write path; no `STATE`/`CONFLICT`. **REFERENCE vs DEPENDENCY:** missing signal → `NOT_FOUND`; read-store outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: not-applicable` (Doc-4A §14.1 — queries are side-effect-free and naturally idempotent).

**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission`. **Admin (DG-5):** the Admin ban-management surface reads `actioned` signals by service (staff-scoped). **Platform Core (DG-8):** read-store/observability.

**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). Fraud signals are **staff-internal — never tenant-visible, never public** (Doc-2 §3.6; §7.5); collapse **any** non-staff access to `NOT_FOUND`. There is no public or tenant projection of a fraud signal. Admin reads `actioned` signals **by service**, staff-scoped.

---

## §G7.Z — Part-4 Conformance & Carried-Marker Ledger (BC-TRUST-4)

**Contract roster (hardened this Part — exactly the Pass-A §G7 set; none added/removed):**

| § | Contract ID(s) | Template | Owned aggregate | Actor |
|---|---|---|---|---|
| §G7.1 | `trust.create_fraud_signal.v1` | 21.6 Admin / 21.5 System | Fraud Signal (`fraud_signals`) | Admin / System |
| §G7.2 | `trust.review_fraud_signal.v1` · `trust.action_fraud_signal.v1` · `trust.dismiss_fraud_signal.v1` | 21.6 Admin | Fraud Signal | Admin |
| §G7.3 | `trust.get_fraud_signal.v1` · `trust.list_fraud_signals.v1` | 21.3 Query | Fraud Signal | Admin (staff-only) |

**Authority binding (all by pointer; nothing invented):**

| Binding | Authoritative source |
|---|---|
| Lifecycle | Doc-2 §3.6/§10.6 — Fraud Signal `open → reviewed → actioned | dismissed` (entry `open`; `actioned`/`dismissed` terminal); **no freeze/reactivate/acknowledge state in corpus** |
| Entities / fields | Doc-2 §10.6 (`fraud_signals`: `subject_id`+`subject_type`, `signal_type`, `severity`, `state`, `reported_by`) |
| Permissions | Doc-2 §7 — `staff_can_ban` (create staff-reported + all triage + reads); system-detected create = System actor, no slug; **no vendor/buyer path** |
| Events | Doc-2 §8 — **none** (no Trust fraud event in catalog); BC-TRUST-4 emits no event; Admin consumes signal state by service; nothing coined |
| Audit | Doc-2 §9 Trust — **no fraud action enumerated** → **every** create/review/action/dismiss carries `[ESC-TRUST-AUDIT]` (nearest §9 by pointer) |
| Validation order | canonical Pass-B nine-stage (frozen Part-1/2/3 presentation; explicit N/A rows); Doc-4A §11.2 enforcement authority |
| Error model | Doc-4A §12 / Annexure B closed twelve-class set; REFERENCE≠DEPENDENCY, STATE≠CONFLICT enforced per contract |
| Idempotency | Doc-4A §14; system-detected create idempotent on detection key; triage dedup window → `[ESC-TRUST-POLICY]` |
| Non-disclosure | Doc-4A §7.5; Doc-2 §3.6 — fraud signals **staff-internal, never tenant-visible**; non-staff access → `NOT_FOUND` collapse |
| Firewall / moat | Architecture §1.5 / Invariant 6; Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED — fraud is a signal source only |

**Carried dependencies (unchanged):** DG-1 (Identity — staff `check_permission` + detection input), DG-2 (Marketplace — detection input/activity), DG-3 (RFQ — detection input/activity), DG-4 (Operations — detection input/activity), DG-5 (Admin — consumes `actioned` signals for ban management; **the ban decision is Admin's**), DG-6 (Communication — detection input + any fan-out), DG-8 (Platform Core — audit). DG-7 (Billing) referenced only as the **firewall** (no input). Intra-module: Verification (BC-TRUST-1) read as a detection input; BC-TRUST-2 reads fraud state as a trust-score input (B.9a) — BC-TRUST-4 mutates **no** score/verification/tier.

**Carried escalation markers (unchanged; never resolved here):** `[ESC-TRUST-AUDIT]` (Doc-2 §9 additive — **all** fraud-signal create/review/action/dismiss actions, none §9-enumerated; nearest §9 by pointer), `[ESC-TRUST-POLICY]` (Doc-3 §12.2 additive — detection dedup window, triage dedup window), `[ESC-TRUST-SLUG]` (Doc-2 §7 additive — any distinct fraud slug beyond `staff_can_ban` if later required; not needed today).

**Firewall, non-disclosure & moat (Part-4 posture):** Fraud & Risk Signals are owned exclusively by BC-TRUST-4 — **System-generated or staff-reported only** (no vendor/buyer/tenant fraud state; no manual fraud-score editing); **fraud signals provide inputs only** — they mutate **no** Trust Score / Performance Score / Verification / Financial Tier; **ownership of downstream decisions (the ban) remains external** (Admin / Doc-4J, DG-5); fraud state is a **read-only input** to BC-TRUST-2 (B.9a); no Billing influence; fraud signals are **staff-internal, never tenant-visible** (non-staff → `NOT_FOUND`); the Fraud Signal aggregate owns **no event** (Doc-2 §8 has none — no publisher ambiguity, no cross-context event ownership); fraud is a **signal source only** — no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. **No flag-and-halt triggered; no corpus conflict.**

---

*End of Doc-4G — Trust & Verification Engine — Pass-B Part 4 v1.0 — BC-TRUST-4 Fraud & Risk Signals. Hardens the frozen Pass-A §G7 contract set (6 contract IDs: create fraud signal (Admin/System); review/action/dismiss triage; fraud-signal reads) to implementation grade — request/response schemas, canonical Pass-B nine-stage validation matrices (authority · validation · failure class per row; explicit N/A rows; Doc-4A §11.2 enforcement), authorization matrices (Doc-2 §7 `staff_can_ban` only; system-detected create System-actor no-slug; no vendor/buyer path), state-machine enforcement (Doc-2 §3.6 `open → reviewed → actioned | dismissed`; terminal states; no invented freeze/acknowledge state; STATE vs CONFLICT separated), audit bindings (Doc-2 §9 has no fraud action → every mutation `[ESC-TRUST-AUDIT]`), event bindings (Doc-2 §8 has no Trust fraud event → BC-TRUST-4 emits none; Admin consumes by service; nothing coined), error registers (Doc-4A §12 closed class; REFERENCE vs DEPENDENCY separated; staff-internal `NOT_FOUND` collapse), and idempotency rules (system-detected idempotent on detection key; `[ESC-TRUST-POLICY]` windows). Ownership, aggregate, permissions, lifecycle, events, and bounded context unchanged from Pass-A. Fraud signals provide inputs only (mutate no Trust Score / Performance Score / Verification / Financial Tier); the ban decision is Admin's (DG-5); fraud signals are staff-internal (never tenant-visible); trust firewall and procurement moat preserved; nothing invented; no corpus conflict; no flag-and-halt. Scope: BC-TRUST-4 only — BC-TRUST-1/2/3/5 belong to other Pass-B parts. Next: Doc-4G_PassB_Part5 (BC-TRUST-5 Reviews & Admin Ratings).*
