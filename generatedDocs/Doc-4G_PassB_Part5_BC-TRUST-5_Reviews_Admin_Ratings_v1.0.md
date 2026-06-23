# Doc-4G — Trust & Verification Engine — Pass-B (Hardening) Part 5 v1.0 — BC-TRUST-5 Reviews & Admin Ratings

| Field | Value |
|---|---|
| Document | Doc-4G — **Pass-B Part 5 v1.0** — Module 5 Trust & Verification (`trust` schema, `trust_` namespace) |
| Part scope | **BC-TRUST-5 — Reviews & Admin Ratings (§G8)** — the Pass-A §G8 contracts (Public Review + Admin Rating aggregates), hardened to implementation grade |
| Status | **Pass-B Part 5 draft — implementation-grade contract specification for BC-TRUST-5 (the final BC-TRUST Pass-B part).** Independently reviewable. After review/patch/freeze: Module-5 Pass-B is complete. |
| Contract authority | `Doc-4G_PassA_v1.0_FROZEN` (sole contract authority — **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4G_Structure_v1.0_FROZEN` (F4G-M2 single-writer; F4G-M3 Buyer-Feedback dual-path) |
| Carry-forward | `Doc-4G_PassB_Part1/2/3/4_v1.0_FROZEN` (frozen conventions honored: canonical nine-stage validation; single publisher-of-record discipline; staff-only non-disclosure; F4G-M2 single-writer; F4G-M3 dual-path; firewall postures) |
| Authority | Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN, Doc-4G Pass-A FROZEN, Doc-4G PassB Part1/2/3/4 FROZEN — all FROZEN |
| Parts (sequence) | Part 1 — BC-TRUST-1 · Part 2 — BC-TRUST-2 · Part 3 — BC-TRUST-3 · Part 4 — BC-TRUST-4 · **Part 5 — BC-TRUST-5 Reviews & Admin Ratings** |
| Audience | Claude Code / Cursor / Codex / backend / frontend / QA / AI coding agents — implementation-ready, no architecture interpretation required |

**Pass-B mission (Part 5).** Convert the Pass-A BC-TRUST-5 contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices in the canonical Pass-B nine-stage presentation (Doc-4A §11.2 enforcement authority), authorization matrices, state-machine enforcement, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), and idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A §G8. **Reviews and Admin Ratings are SEPARATE authorities and are never merged.** **Public Review** (`public_reviews`): **buyer-authored, staff-moderated, publicly visible only after the approved lifecycle** (`submitted → approved → published`), following Doc-2 review ownership; displayed by Marketplace **via service** (never table access). **Admin Rating** (`admin_ratings`): **staff-owned, internal-only, never public, never tenant-visible, never exposed externally.** Their separation is preserved on every surface. **Performance Score integration preserves F4G-M2 (single-writer) and F4G-M3 (Buyer-Feedback dual-path):** a published review may feed `performance_inputs` (Buyer Feedback, Path B) **ONLY by invoking the approved BC-TRUST-3 ingestion service** — **BC-TRUST-5 may NOT write `performance_inputs` directly.** Reviews and Admin Ratings **may NOT mutate Trust Score, Performance Score, Verification, Fraud Signals, or Financial Tier** — published reviews provide approved inputs only; admin ratings are internal signals only. The **procurement moat** holds — reviews are **informational signals only**; BC-TRUST-5 owns no matching/routing/ranking/evaluation/supplier-selection/award; RFQ authoritative. Carried dependencies **DG-1, DG-2, DG-4, DG-8** (the BC-TRUST-5 seams) + the intra-module BC-TRUST-3 ingestion seam, and the markers **`[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt** — none encountered in Part 5.

---

## §H — Part-5 Hardening Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3), the following apply to **every** contract in this Part; per-contract records cite specifics and reference these by pointer.

- **H.1 — Validation stages (canonical Pass-B presentation; Doc-4A §11.2 is the enforcement authority).** The single canonical stage vocabulary used by **every** Validation Matrix in this Part is `1 SYNTAX → 2 SHAPE → 3 SEMANTIC → 4 AUTHENTICATION → 5 AUTHORIZATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY` (the frozen Part-1…4 presentation). **Enforcement authority (Doc-4A §11.2, FROZEN — order and logic unchanged):** `1 SYNTAX` + `2 SHAPE` enforce §11.2 SYNTAX; `3 SEMANTIC` and `8 BUSINESS` enforce §11.2 BUSINESS; `4 AUTHENTICATION` enforces §11.2 CONTEXT (§5.2/§5.3/§5.6); `5 AUTHORIZATION` enforces §11.2 AUTHZ + SCOPE + DELEGATION (§6/§6B); `6 STATE` / `7 REFERENCE` / `9 POLICY` enforce the identically-named §11.2 stages. Order is exactly §11.2, never reordered. Failure terminates at the first failing stage; SYNTAX/SHAPE MAY aggregate field errors, later stages fail singly. Each row names **stage · source authority · rule (validation) · failure outcome (failure class)**; where a stage does not apply, an explicit **N/A (stage not applicable)** row is shown (frozen Part-3/4 presentation precedent).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source — never extended), `numeric`, `string`, `text`, `timestamptz`, `bool`. **Required** = present + non-null (absence → SYNTAX). **Nullable** stated per field. `rating` is `numeric` constrained 1–5 (Doc-2 §10.6). Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** **Confirmed Doc-2 §7 slugs used in this Part:** **`can_submit_review`** (O,D,M — buyer side, **engagement required**) for public-review submission; **platform-staff** authority for review moderation/publish/remove and for admin-rating set (the Doc-2 §7 staff family — `staff_can_verify` / `staff_super_admin` per role seed). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C, consumed; no shadow authorization). **Buyer submission scope** = the buyer's active organization (the `author_organization_id`); **staff actions** are platform-staff (no active-org context, §5.6) and **not delegation-eligible**. Where a required staff action lacks a §7 slug (a dedicated review-moderation or admin-rating slug) → **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive; no slug invented).
- **H.4 — Error model (Doc-4A §12; closed twelve-class set, Annexure B).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes `trust_<domain>_<code>` (namespace `trust_`); numeric codes are dev-doc stage — Pass-B fixes **class + trigger + retryable**. **Mandatory separations (never conflated):** **REFERENCE** (Domain, 422 — an `engagement_id`/`vendor_profile_id` is syntactically valid but does not resolve) ≠ **DEPENDENCY** (Infrastructure, 503, retryable — a consumed service/ingestion-service is transiently unavailable); **STATE** (Domain, 409 — review not in a valid pre-state for the transition) ≠ **CONFLICT** (Concurrency, 409, retryable after re-read — optimistic-concurrency token mismatch). **Protected-fact collapse to `NOT_FOUND`** (§7.5): **admin ratings** are staff-internal — a non-staff caller must not learn one exists; an `engagement_id` outside the caller's org on submit collapses to `NOT_FOUND`. The **Error Boundary block** (§12.4/§12.6) is stated per contract.
- **H.5 — State machines (Doc-2 §3.6/§10.6; Doc-4A §13).** Two **separate** lifecycles: **Public Review** (`public_reviews`): **`submitted → approved → published | rejected | removed`** (entry `submitted`; submit writes `submitted`; moderate `submitted → approved | rejected`; publish `approved → published`; remove `→ removed` = hidden soft-delete, Doc-2 §10.6 SD=YES). **Admin Rating** (`admin_ratings`): **simple** (no multi-state machine; Doc-2 §3.6) — set/update with soft-delete (SD=YES). Every review mutation cites allowed **source state(s)**, **target state**, **forbidden source states** (→ `STATE`). `published`/`rejected`/`removed` terminal-or-hidden per Doc-2. Concurrency: optimistic — mutating commands assert the expected row revision; lost race → `CONFLICT`. **No edge added or modified; no state invented.**
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User` for buyer submit; `Admin` for moderation/publish/remove + admin-rating set), **object scope** (the `trust.public_reviews`/`trust.admin_ratings` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B). Reads are not audited (§17.1). The **separately-enumerated Doc-2 §9 Reviews** actions this Part binds directly are **"review submit"**, **"moderation decision"**, **"publish"**, **"remove"** (all review mutations are §9-enumerated). **Admin-rating set is NOT separately enumerated in Doc-2 §9** → carries **`[ESC-TRUST-AUDIT]`** (interim: nearest §9 action by pointer; channel Doc-2 §9 additive; **no action invented**), exactly as frozen in Pass-A §G8/§G12/§G14.
- **H.7 — Events (Doc-2 §8); publisher/consumer ownership preserved.** **Doc-2 §8 enumerates NO Trust review or admin-rating event.** Therefore **BC-TRUST-5 emits NO domain event** — every review/rating mutation is **state + §9 audit only** (no event coined, §16.4). **On publish**, the Buyer-Feedback performance contribution (Path B) is delivered by **invoking the BC-TRUST-3 performance-input ingestion service in-module** (F4G-M2) — this is an **in-module service call, NOT a cross-module event** and **not** a BC-TRUST-5 publication; BC-TRUST-3 remains the sole writer of `performance_inputs`. Marketplace **displays published reviews via service** (DG-2, never table access) — a read projection, not an event. No publisher ambiguity; no cross-context event ownership.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key). **No `trust` dedup-window key is registered in Doc-3 §12.2** → carried under **`[ESC-TRUST-POLICY]`** (reference the platform default by name; no key invented). Replay within the window → same result, no duplicate audit; **a publish replay invokes the BC-TRUST-3 ingestion service idempotently** (the ingestion service dedups the Path-B input — F4G-M2/M3) so no duplicate `performance_inputs` row results. `expected_revision` guards concurrent races (lost race → `CONFLICT`). Queries (21.3) are side-effect-free (`Idempotency: not-applicable`, §14.1).
- **H.9 — Trust-firewall, separation & moat enforcement (Architecture §1.5/Invariant 6; Doc-4A §4B/§7.5; Doc-3 §11.8/§12.1 FIXED — load-bearing per contract).** (a) **Reviews and Admin Ratings are separate authorities — never merged:** Public Review is buyer-authored/staff-moderated/publicly visible after the approved lifecycle; Admin Rating is staff-owned/internal-only/never public/never tenant-visible/never exposed externally. (b) **Neither may mutate Trust Score, Performance Score, Verification, Fraud Signals, or Financial Tier** — a published review provides an **approved input only** (Path B, via the BC-TRUST-3 ingestion service); an admin rating is an **internal signal only**. (c) **F4G-M2 single-writer:** `performance_inputs` is BC-TRUST-3-owned; **BC-TRUST-5 invokes the ingestion service on publish, never writes `performance_inputs` directly.** (d) **F4G-M3 dual-path:** the published-review Buyer-Feedback (Path B) and the Operations `BuyerFeedbackRecorded` (Path A) are distinct `performance_inputs` rows feeding one component, de-duped at BC-TRUST-3 computation — BC-TRUST-5 contributes Path B only. (e) **No paid plan/entitlement/flag gates or influences a review/rating** (Doc-4A §4B; DG-7 — Billing has no input). (f) **Non-disclosure (Doc-4A §7.5; Doc-2 §3.6):** admin ratings are **staff-internal — never tenant-visible/public**; only **`published`** reviews are public (and only via the Marketplace service projection). (g) **Procurement moat:** BC-TRUST-5 computes no matching/routing/ranking/evaluation/selection/award; reviews are **informational signals only**; RFQ authoritative.
- **H.10 — `trust` BC-TRUST-5 field source (Doc-2 §10.6).** The hardened schemas bind to the frozen Doc-2 §10.6 columns; **Pass-B introduces no column**:
  - `public_reviews`: `vendor_profile_id`, `author_organization_id`, `engagement_id`, `rating` (1–5), `body`, `status enum<submitted|approved|published|rejected|removed>`, `moderated_by`, `moderated_at` (+ standard columns; SD=YES, removed = hidden; lifecycle `submitted → approved → published | rejected | removed`).
  - `admin_ratings`: `vendor_profile_id`, `rated_by` (staff) (+ standard columns; **internal only, never public, never cross-tenant**; SD=YES; simple lifecycle).
  - *(referenced, not owned)* Operations `engagement_id` (DG-4, read-only/service-validated — post-award gate); Marketplace display service (DG-2, projection of `published` reviews); BC-TRUST-3 `trust.ingest_performance_input.v1` (in-module, Path B on publish).

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Machine Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Implementation Notes.** Grouped families share section 1 and split the records where the schema differs.

---

## §G8.1 — `trust.submit_review.v1` — Submit Public Review (post-award; engagement-gated)

**1. Contract Metadata** — Contract ID `trust.submit_review.v1` · Template **21.4 Command** · Owned aggregate **Public Review** (`public_reviews` AR) · Actor types **User** (buyer member, active-org context §5.3) · Bounded context **BC-TRUST-5** (§G8) · **Buyer-authored; engagement-gated; review ≠ admin rating (H.9a).**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes (source) |
|---|---|---|---|---|---|
| `vendor_profile_id` | `uuid` | yes | no | 1 | Doc-2 §10.6 `vendor_profile_id` (subject; Marketplace ref) |
| `engagement_id` | `uuid` | yes | no | 1 | Doc-2 §10.6 `engagement_id` (post-award gate; Operations ref, service-validated) |
| `rating` | `numeric` | yes | no | 1 | Doc-2 §10.6 `rating` 1–5 (range BUSINESS rule) |
| `body` | `text` | no | yes | 1 | Doc-2 §10.6 `body` |

*(`author_organization_id` is set from the authenticated buyer's active org — not a caller-supplied field.)*

**3. Response Schema** — `public_review_id : uuid (1)`, `status : enum<submitted|approved|published|rejected|removed> (1) = submitted`, `reference_id : uuid (1)` (Doc-4A §22.1 C-05).

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id`/`engagement_id`/`rating` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` (aggregated) |
| UUID shapes; `rating` numeric | 2 SHAPE | Doc-2 §10.6 | shape | `VALIDATION` |
| `rating` ∈ 1–5 | 3 SEMANTIC | Doc-2 §10.6 | rating within the 1–5 domain | `BUSINESS` |
| actor + active buyer org | 4 AUTHENTICATION | Doc-4A §5.2/§5.3 | actor is User; active buyer-org context valid | `AUTHORIZATION` |
| `can_submit_review` | 5 AUTHORIZATION | Doc-2 §7; Doc-4A §6 | membership holds `can_submit_review` (O,D,M) | `AUTHORIZATION` |
| (state) | 6 STATE | Doc-2 §3.6/§10.6 | **N/A (stage not applicable)** — submit has no prior state (entry `submitted`) | — |
| `engagement_id`/`vendor_profile_id` resolve; **post-award gate** | 7 REFERENCE | Doc-2 §10.6; DG-4/DG-2 | engagement resolves + is the caller-org's completed engagement with the vendor (service-validated); profile resolves | `REFERENCE` (unresolved) / `NOT_FOUND` (engagement not caller-org's — protected-fact collapse) ; `DEPENDENCY` (resolver down) |
| post-award + one-review rule | 8 BUSINESS | Doc-2 §10.6 | engagement is post-award; review eligibility per Doc-2 (engagement required) | `BUSINESS` |
| (policy) | 9 POLICY | Doc-3 §12.2 | none beyond dedup window (`[ESC-TRUST-POLICY]`, H.8) | — |

**5. Authorization Matrix** — Actor **User** (buyer) · Slug **`can_submit_review`** (Doc-2 §7; O,D,M; **engagement required**) · Scope = the buyer's active org (`author_organization_id`) · Delegation n/a (buyer-side) · Enforcement Identity `check_permission`.

**6. State Machine Enforcement** — Allowed source **none** (submission) · Target **`submitted`** (Doc-2 §3.6/§10.6 entry) · Forbidden: n/a (entry) · Concurrency: dedup window guards duplicate submit (§10); the post-award engagement gate (§7/§8) prevents an ungated review.

**7. Audit Binding** — Action **Doc-2 §9 Reviews "review submit"** (separately enumerated) · Attribution **User** (`author_organization_id`) · Object scope new `public_reviews` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **Emits NO event** (H.7 — Doc-2 §8 has no review event) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX/SHAPE failure (missing field) | false |
| `AUTHORIZATION` | actor/context/`can_submit_review` fail | false |
| `NOT_FOUND` | `engagement_id` not the caller-org's (protected-fact collapse, H.4) | false |
| `REFERENCE` | `vendor_profile_id`/`engagement_id` syntactically valid but unresolved | false |
| `BUSINESS` | `rating` out of 1–5; not post-award; review-eligibility rule | false |
| `DEPENDENCY` | Operations/Marketplace resolver or Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** an `engagement_id` outside the caller's org → `NOT_FOUND` (protected-fact collapse, §7.5), never `AUTHORIZATION` (which would confirm the engagement). **REFERENCE vs DEPENDENCY:** unresolved ref → `REFERENCE`; resolver outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-TRUST-POLICY]`**, H.8); replay within window → same `public_review_id`, no duplicate audit. Business-duplicate (a second review for the same engagement) is a `BUSINESS` rule (§8), not an idempotency concern (Doc-4A §14.6).

**11. Cross-Module References** — **Operations (DG-4):** `engagement_id` reference, **read-only/service-validated** (post-award gate). **Marketplace (DG-2):** `vendor_profile_id` reference (read). **Identity (DG-1):** buyer membership/scope, `check_permission`. **Platform Core (DG-8):** audit/human-ref.

**12. AI-Agent Implementation Notes** — post-award only — the `engagement_id` gate is mandatory and **service-validated** (the engagement is Operations-owned, referenced by UUID — DG-4); collapse a non-caller-org engagement to `NOT_FOUND` (§7.5). `rating` ∈ 1–5 (Doc-2 §10.6). `public_reviews` is **shared** tenancy (author org writes; public only when `published`). This is a **Public Review**, never an Admin Rating (separate aggregate, H.9a). Emits no event.

---

## §G8.2 — `trust.moderate_review.v1` — Moderate Review (approve / reject)

**1. Contract Metadata** — Contract ID `trust.moderate_review.v1` · Template **21.6 Admin** · Owned aggregate **Public Review** (`public_reviews` AR) · Actor types **Admin** (platform-staff, §5.6) · BC-TRUST-5 (§G8). **Moderation is platform-staff; the buyer authored the content.**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `public_review_id` | `uuid` | yes | no | 1 | target review |
| `expected_revision` | `numeric` | yes | no | 1 | optimistic-concurrency assertion (H.5) |
| `decision` | `enum<approve\|reject>` | yes | no | 1 | moderation outcome (maps to `approved`/`rejected`) |
| `moderation_note` | `text` | conditional | yes | 1 | required on reject (BUSINESS) |

**3. Response Schema** — `public_review_id : uuid (1)`, `status : enum<…> (1)` (`approved`|`rejected`), `moderated_by`/`moderated_at` set, `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `public_review_id`, `expected_revision`, `decision` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| `decision` ∈ `{approve,reject}`; UUID shape | 2 SHAPE | Doc-2 §10.6 | enum membership; shape | `VALIDATION` |
| moderation semantics | 3 SEMANTIC | Doc-2 §3.6 | moderation acts on a submitted review | `BUSINESS` |
| actor authenticity (platform-staff) | 4 AUTHENTICATION | Doc-4A §5.6 | actor is Admin; admin scope declared | `AUTHORIZATION` |
| platform-staff moderation authority | 5 AUTHORIZATION | Doc-2 §7 | staff moderation authority (Doc-2 §7 staff family); dedicated slug → `[ESC-TRUST-SLUG]` | `AUTHORIZATION` |
| review in `submitted` | 6 STATE | Doc-2 §3.6/§10.6 | source = `submitted` | `STATE` |
| revision match | 6 STATE (concurrency) | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| review resolves | 7 REFERENCE | Doc-2 §10.6 | `public_review_id` resolves | `NOT_FOUND` (read miss) ; `DEPENDENCY` |
| `moderation_note` on reject | 8 BUSINESS | Doc-2 §10.6 | mandatory reason for reject | `BUSINESS` |

**5. Authorization Matrix** — Actor **Admin** · **platform-staff moderation authority** (Doc-2 §7 staff family — review moderation is platform-staff per Doc-4G Structure §G12); if a dedicated moderation slug is required beyond the §7 staff set → **`[ESC-TRUST-SLUG]`** (no slug invented) · Scope = platform · Delegation n/a · Enforcement `check_permission`.

**6. State Machine Enforcement** — Allowed source **`submitted`** · Targets **`approved`** (approve) / **`rejected`** (reject) (Doc-2 §3.6/§10.6) · Forbidden: any non-`submitted` source → `STATE`; `rejected` is terminal · Concurrency: optimistic; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Reviews "moderation decision"** (separately enumerated) · Attribution **Admin** (`moderated_by`) · Object scope `public_reviews` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **Emits NO event** (H.7) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX/SHAPE failure (bad `decision`) | false |
| `AUTHORIZATION` | non-staff / lacks moderation authority | false |
| `NOT_FOUND` | review does not exist | false |
| `STATE` | review not in `submitted` | false |
| `CONFLICT` | `expected_revision` ≠ current | true (re-read then retry) |
| `BUSINESS` | `moderation_note` missing on reject | false |
| `DEPENDENCY` | Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** staff surface — missing review → `NOT_FOUND` on identity. **STATE vs CONFLICT:** wrong source state → `STATE`; stale `expected_revision` → `CONFLICT`.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); replay of an applied moderation → same status, no duplicate audit; a moderation against a non-`submitted` review → `STATE`. `expected_revision` guards races.

**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission`. **Platform Core (DG-8):** audit. (No Operations/Marketplace ref at moderation.)

**12. AI-Agent Implementation Notes** — moderation is **platform-staff**; the buyer authored the content (separation of authorship vs moderation). `decision` maps to the frozen `approved`/`rejected` states — never invent a status. `rejected` is terminal. Emits no event.

---

## §G8.3 — `trust.publish_review.v1` · `trust.remove_review.v1` — Publish / Remove Review

**1. Contract Metadata** — Contract IDs `trust.publish_review.v1` · `trust.remove_review.v1` · Template **21.6 Admin** · Owned aggregate **Public Review** (`public_reviews` AR) · Actor types **Admin** (platform-staff, §5.6) · BC-TRUST-5 (§G8). **Publish feeds Buyer-Feedback (Path B) by invoking the BC-TRUST-3 ingestion service — never a direct `performance_inputs` write (F4G-M2).**

**2. Request Schema** — `public_review_id : uuid (1, required)`; `expected_revision : numeric (1, required)`; (remove) `removal_reason : text (0..1)`.

**3. Response Schema** — `public_review_id : uuid (1)`, `status : enum<…> (1)` (`published` | `removed`), `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `public_review_id`, `expected_revision` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| field shapes | 2 SHAPE | Doc-4A §9 | UUID/numeric shape | `VALIDATION` |
| lifecycle semantics | 3 SEMANTIC | Doc-2 §3.6 | publish acts on an approved review; remove on a non-terminal review | `BUSINESS` |
| actor authenticity (platform-staff) | 4 AUTHENTICATION | Doc-4A §5.6 | actor is Admin; admin scope | `AUTHORIZATION` |
| platform-staff review-lifecycle authority | 5 AUTHORIZATION | Doc-2 §7 | staff authority (Doc-2 §7 staff family); dedicated slug → `[ESC-TRUST-SLUG]` | `AUTHORIZATION` |
| review in valid pre-state | 6 STATE | Doc-2 §3.6/§10.6 | publish: source `approved`; remove: source per Doc-2 (→ `removed`, hidden) | `STATE` |
| revision match | 6 STATE (concurrency) | Doc-4A §14 | `expected_revision` = current | `CONFLICT` |
| review resolves | 7 REFERENCE | Doc-2 §10.6 | `public_review_id` resolves | `NOT_FOUND` ; `DEPENDENCY` |
| Path-B ingestion-service availability (publish) | 7 REFERENCE / DEPENDENCY | B.9b; F4G-M2 | the BC-TRUST-3 ingestion service is invocable | `DEPENDENCY` (ingestion service down) |
| firewall: no direct performance_inputs write | 8 BUSINESS | F4G-M2; H.9c | publish invokes the ingestion service; it does **not** write `performance_inputs` | `BUSINESS` |

**5. Authorization Matrix** — Actor **Admin** · **platform-staff review-lifecycle authority** (Doc-2 §7 staff family); dedicated slug beyond §7 → **`[ESC-TRUST-SLUG]`** (no slug invented) · Scope = platform · Delegation n/a · Enforcement `check_permission`.

**6. State Machine Enforcement** — `publish`: allowed source **`approved`** → **`published`** (public via Marketplace service; feeds Buyer-Feedback Path B) · `remove`: → **`removed`** (hidden, soft-delete; Doc-2 §10.6 SD=YES) · Forbidden: publish on a non-`approved` review → `STATE`; `published`/`removed` per Doc-2 lifecycle · Concurrency: optimistic; lost race → `CONFLICT`.

**7. Audit Binding** — Action **Doc-2 §9 Reviews "publish"** (publish) / **"remove"** (remove) — both separately enumerated · Attribution **Admin** · Object scope `public_reviews` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **Emits NO cross-module event** (H.7 — Doc-2 §8 has no review event) · **On publish:** invoke **`trust.ingest_performance_input.v1`** (BC-TRUST-3) **in-module** to append the Buyer-Feedback input (**Path B**, F4G-M3) — an **in-module service call, not a cross-module event**; **BC-TRUST-3 remains the sole writer of `performance_inputs`** (F4G-M2). Marketplace **displays `published` reviews via service** (DG-2, never table access) — a read projection, not an event. No publisher ambiguity.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX/SHAPE failure | false |
| `AUTHORIZATION` | non-staff / lacks review-lifecycle authority | false |
| `NOT_FOUND` | review does not exist | false |
| `STATE` | publish on non-`approved` review; invalid pre-state | false |
| `CONFLICT` | `expected_revision` ≠ current | true (re-read then retry) |
| `BUSINESS` | firewall violation (direct `performance_inputs` write attempt) | false |
| `DEPENDENCY` | BC-TRUST-3 ingestion service / Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** staff surface — missing review → `NOT_FOUND` on identity. **STATE vs CONFLICT:** publish on non-`approved` → `STATE`; stale revision → `CONFLICT`. **REFERENCE vs DEPENDENCY:** an **unavailable ingestion service** is `DEPENDENCY` (retryable) — never `REFERENCE`; a missing review is `NOT_FOUND`.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); a publish replay re-invokes the BC-TRUST-3 ingestion service **idempotently** (the ingestion service dedups the Path-B input on its key — F4G-M2/M3), so **no duplicate `performance_inputs` row** and no duplicate audit; re-publish of a `published` review / re-remove of a `removed` review is a no-op. `expected_revision` guards races.

**11. Cross-Module References** — **Intra-module (B.9b / F4G-M2):** `trust.ingest_performance_input.v1` (BC-TRUST-3) on publish — Path B Buyer-Feedback; **BC-TRUST-5 never writes `performance_inputs`**. **Marketplace (DG-2):** displays `published` reviews **via service** (never table access). **Identity (DG-1):** staff identity + `check_permission`. **Platform Core (DG-8):** audit.

**12. AI-Agent Implementation Notes** — **on publish, invoke the BC-TRUST-3 ingestion service; do NOT write `performance_inputs` directly** (F4G-M2 — BC-TRUST-3 is the sole writer). This is **Path B** of the Buyer-Feedback dual-path (Path A = Operations `BuyerFeedbackRecorded`); both feed one component, **de-dup at BC-TRUST-3 computation** (F4G-M3) — never naive-sum. An unavailable ingestion service is `DEPENDENCY` (retryable), not `REFERENCE`. Marketplace reads `published` reviews **via service**, never by direct table access. Emits no cross-module event.

---

## §G8.4 — `trust.set_admin_rating.v1` — Set Admin Rating (internal-only)

**1. Contract Metadata** — Contract ID `trust.set_admin_rating.v1` · Template **21.6 Admin** · Owned aggregate **Admin Rating** (`admin_ratings` AR) · Actor types **Admin** (platform-staff, §5.6) · BC-TRUST-5 (§G8). **Admin Rating is a SEPARATE authority from Public Review (H.9a) — staff-owned, internal-only, never public/tenant-visible/externally exposed.**

**2. Request Schema**

| Field | Type | Required | Nullable | Cardinality | Notes |
|---|---|---|---|---|---|
| `vendor_profile_id` | `uuid` | yes | no | 1 | Doc-2 §10.6 `vendor_profile_id` (subject) |
| `expected_revision` | `numeric` | conditional | yes | 1 | optimistic concurrency on update of an existing rating |
| `rating_value` | `numeric`/`enum` | yes | no | 1 | the internal staff rating (membership/shape per Doc-2 §10.6) |
| `rating_note` | `text` | no | yes | 1 | internal note (staff-only) |

*(`rated_by` is set from the authenticated staff user — not a caller-supplied field.)*

**3. Response Schema** — `admin_rating_id : uuid (1)`, `reference_id : uuid (1)`. **No public/tenant projection of any kind** (internal-only).

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| `vendor_profile_id`/`rating_value` present + typed | 1 SYNTAX | Doc-4A §9 | presence/type | `VALIDATION` |
| field shapes / `rating_value` membership | 2 SHAPE | Doc-2 §10.6 | shape | `VALIDATION` |
| rating semantics | 3 SEMANTIC | Doc-2 §10.6 | rating value within its domain | `BUSINESS` |
| actor authenticity (platform-staff) | 4 AUTHENTICATION | Doc-4A §5.6 | actor is Admin; admin scope declared | `AUTHORIZATION` |
| platform-staff admin-rating authority | 5 AUTHORIZATION | Doc-2 §7 | staff authority (`staff_can_verify`/`staff_super_admin` per role seed); dedicated admin-rating slug → `[ESC-TRUST-SLUG]` | `AUTHORIZATION` |
| state (update only) | 6 STATE | Doc-2 §3.6 | simple lifecycle; update asserts `expected_revision` | `CONFLICT` (stale revision on update) |
| `vendor_profile_id` resolves | 7 REFERENCE | Doc-2 §10.6; DG-2 | profile resolves (read) | `REFERENCE` ; `DEPENDENCY` |
| firewall: not a platform score | 8 BUSINESS | H.9b | admin rating is an internal signal; it mutates no Trust/Performance/Verification/Fraud/Tier | `BUSINESS` |

**5. Authorization Matrix** — Actor **Admin** · **platform-staff admin-rating authority** (Doc-2 §7 staff family — `staff_can_verify`/`staff_super_admin` per role seed); a dedicated admin-rating slug is not in §7 → carry **`[ESC-TRUST-SLUG]`** for that case (no slug invented) · Scope = platform · Delegation n/a · Enforcement `check_permission`. **No vendor/buyer path.**

**6. State Machine Enforcement** — **Simple** (no multi-state machine; Doc-2 §3.6) — set creates the `admin_ratings` row; update asserts `expected_revision`; soft-delete supported (Doc-2 §10.6 SD=YES) · Forbidden: no public/tenant write path · Concurrency: optimistic on update; lost race → `CONFLICT`.

**7. Audit Binding** — Action **`[ESC-TRUST-AUDIT]`** — admin-rating set is **not** separately enumerated in Doc-2 §9 → nearest §9 Trust action by pointer (channel Doc-2 §9 additive; **no action invented**) · Attribution **Admin** (`rated_by`) · Object scope `admin_ratings` row · Timing same transaction · Source Doc-2 §9 + Doc-4B.

**8. Event Binding** — **Emits NO event** (H.7 — Doc-2 §8 has no admin-rating event) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX/SHAPE failure | false |
| `AUTHORIZATION` | non-staff / lacks admin-rating authority | false |
| `NOT_FOUND` | (non-staff caller — protected-fact collapse, H.9f) ; rating row absent on update | false |
| `REFERENCE` | `vendor_profile_id` unresolved | false |
| `CONFLICT` | `expected_revision` ≠ current (update race) | true (re-read then retry) |
| `BUSINESS` | firewall violation (score/verification/tier mutation attempt) | false |
| `DEPENDENCY` | Marketplace resolver / Doc-4B audit transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** admin ratings are **staff-internal** — a non-staff caller receives `NOT_FOUND` (protected-fact collapse, §7.5), never `AUTHORIZATION`. **STATE/CONFLICT:** update race → `CONFLICT`. **REFERENCE vs DEPENDENCY:** unresolved profile → `REFERENCE`; resolver outage → `DEPENDENCY`.

**10. Idempotency Rules** — `Idempotency: required` + dedup window (`[ESC-TRUST-POLICY]`); replay within window → same `admin_rating_id`, no duplicate audit; `expected_revision` guards update races.

**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission`. **Marketplace (DG-2):** `vendor_profile_id` reference (read). **Platform Core (DG-8):** audit. **No Operations/Path-B/Marketplace-display** — admin ratings are internal-only and feed nothing public.

**12. AI-Agent Implementation Notes** — Admin Rating is a **SEPARATE aggregate from Public Review** (H.9a) — never merge them. **Internal-only, never public, never tenant-visible, never exposed externally** (Doc-2 §3.6; §7.5) — collapse non-staff access to `NOT_FOUND`. An admin rating is **not a platform score** and **mutates no** Trust/Performance/Verification/Fraud/Tier (H.9b). Carries `[ESC-TRUST-AUDIT]` (no §9 admin-rating action). Soft-delete supported. Emits no event.

---

## §G8.5 — `trust.get_review.v1` · `trust.list_reviews.v1` · `trust.list_admin_ratings.v1` — Review / Admin-Rating Reads

**1. Contract Metadata** — Contract IDs `trust.get_review.v1` · `trust.list_reviews.v1` (Public Review reads) · `trust.list_admin_ratings.v1` (Admin Rating reads — **staff-only**) · Template **21.3 Query** · Owned aggregates **Public Review** + **Admin Rating** (read-only) · Actor types **User / internal-service** (published reviews via public projection) · **Admin** (admin ratings) · BC-TRUST-5 (§G8).

**2. Request Schema** — *get_review:* `public_review_id : uuid (1, required)`. *list_reviews:* `vendor_profile_id : uuid (1, required)`, pagination + allowlisted filters (Doc-4A §9.6) — returns **`published` reviews only** on the public projection. *list_admin_ratings:* `vendor_profile_id : uuid (1, required)`, pagination — **staff-only**.

**3. Response Schema** — *get_review / list_reviews (public via service):* `published` review fields (`rating`, `body`, `vendor_profile_id`, published timestamp) — **only `published` reviews are public**; non-published states are not exposed publicly. *list_admin_ratings (staff only):* `admin_ratings` rows (`rating_value`, `rated_by`, note) — **staff view; never tenant-visible**. Every response carries `reference_id : uuid (1)`.

**4. Validation Matrix**

| Field / check | Stage | Source authority | Rule (validation) | Failure outcome (class) |
|---|---|---|---|---|
| identifier typed; allowlisted filters | 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; filter+sort fields allowlisted | `VALIDATION` |
| field shapes | 2 SHAPE | Doc-4A §9 | UUID/pagination shape | `VALIDATION` |
| (semantic) | 3 SEMANTIC | Doc-2 §3.6 | a published review / staff rating may be read | — |
| actor authenticity | 4 AUTHENTICATION | Doc-4A §5.3/§5.6 | User/internal-service (published reviews) ; Admin (admin ratings) | `AUTHORIZATION` |
| authorization | 5 AUTHORIZATION | Doc-2 §7 | published reviews = public via service (no slug) ; admin ratings = `staff_can_verify` (staff-only) | `AUTHORIZATION` / `NOT_FOUND` (non-staff admin-rating access collapse) |
| (state) | 6 STATE | — | N/A — reads do not mutate state | — |
| reference resolves | 7 REFERENCE | Doc-2 §10.6 | identifier resolves | `NOT_FOUND` (read miss) ; `DEPENDENCY` (store down) |
| (business) | 8 BUSINESS | Doc-2 §10.6 | public projection returns only `published` reviews | — |

**5. Authorization Matrix (per query — independent authority):**

- **`trust.get_review.v1` / `trust.list_reviews.v1`** — Actor **User / internal-service via public projection** · Authorization **none** (published reviews are public via the Marketplace service projection; Doc-2 §10.6) · Scope **public** (per `vendor_profile_id`) · Visibility **`published` reviews only** — non-published states never exposed publicly; served via service, never direct table access.
- **`trust.list_admin_ratings.v1`** — Actor **Admin** (platform-staff, §5.6) · Authorization **`staff_can_verify`** (Doc-2 §7) · Scope **platform** · Visibility **staff-only — admin ratings are internal-only, never tenant-visible, never public** (Doc-2 §3.6; §7.5); non-staff access collapses to `NOT_FOUND`.

Enforcement: Identity `check_permission` for the admin-rating read; the published-review read requires no slug. **No query mutates state (CQRS).**

**6. State Machine Enforcement** — n/a — **queries do not mutate state** (read-only). Only `published` reviews surface on the public projection; non-published states (`submitted`/`approved`/`rejected`/`removed`) are not publicly exposed.

**7. Audit Binding** — **none — reads are not audited** (Doc-4A §17.1).

**8. Event Binding** — Emitted **none** (reads) · Consumed none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | bad identifier / non-allowlisted filter or sort field | false |
| `AUTHORIZATION` | admin-rating read without `staff_can_verify` (otherwise collapses to `NOT_FOUND`) | false |
| `NOT_FOUND` | resource absent; non-published review on public read; **non-staff admin-rating access** (protected-fact collapse) | false |
| `DEPENDENCY` | read-store transiently unavailable | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** **published reviews are public** (via service); **admin ratings are staff-only** — any non-staff caller receives `NOT_FOUND` (protected-fact collapse, §7.5), never a disclosure of an admin rating's existence. A non-published review is not exposed on the public read (returns `NOT_FOUND` for that identifier on the public projection). No write path; no `STATE`/`CONFLICT`.

**10. Idempotency Rules** — `Idempotency: not-applicable` (Doc-4A §14.1 — queries are side-effect-free and naturally idempotent).

**11. Cross-Module References** — **Marketplace (DG-2):** displays `published` reviews **via service** (never table access) — Doc-2 §10.6. **Identity (DG-1 via Doc-4C):** staff identity + `check_permission` for admin-rating reads. **Platform Core (DG-8):** read-store/observability.

**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). **Reviews and Admin Ratings are separate** (H.9a): published reviews are **public via service** (only `published` state); admin ratings are **staff-only, never tenant-visible** — collapse non-staff admin-rating access to `NOT_FOUND` (§7.5). Marketplace reads `published` reviews **via service projection**, never by direct table access. A non-published review is not exposed on the public read.

---

## §G8.Z — Part-5 Conformance & Carried-Marker Ledger (BC-TRUST-5)

**Contract roster (hardened this Part — exactly the Pass-A §G8 set; none added/removed):**

| § | Contract ID(s) | Template | Owned aggregate | Actor |
|---|---|---|---|---|
| §G8.1 | `trust.submit_review.v1` | 21.4 Command | Public Review (`public_reviews`) | User (buyer) |
| §G8.2 | `trust.moderate_review.v1` | 21.6 Admin | Public Review | Admin |
| §G8.3 | `trust.publish_review.v1` · `trust.remove_review.v1` | 21.6 Admin | Public Review | Admin |
| §G8.4 | `trust.set_admin_rating.v1` | 21.6 Admin | Admin Rating (`admin_ratings`) | Admin |
| §G8.5 | `trust.get_review.v1` · `trust.list_reviews.v1` · `trust.list_admin_ratings.v1` | 21.3 Query | Public Review; Admin Rating | User/internal-service / Admin |

**Authority binding (all by pointer; nothing invented):**

| Binding | Authoritative source |
|---|---|
| Lifecycle | Doc-2 §3.6/§10.6 — Public Review `submitted → approved → published | rejected | removed` (SD=YES, removed=hidden); Admin Rating **simple** (SD=YES) |
| Entities / fields | Doc-2 §10.6 (`public_reviews`: `rating 1–5`, `body`, `status`, `vendor_profile_id`, `author_organization_id`, `engagement_id`, `moderated_by/at`; `admin_ratings`: `vendor_profile_id`, `rated_by`) |
| Permissions | Doc-2 §7 — `can_submit_review` (buyer submit, engagement required); platform-staff (moderation/publish/remove + admin-rating set; `staff_can_verify`/`staff_super_admin` per role seed); published-review read public (no slug); dedicated moderation/admin-rating slug → `[ESC-TRUST-SLUG]` |
| Events | Doc-2 §8 — **none** (no Trust review/admin-rating event); BC-TRUST-5 emits no event; publish invokes BC-TRUST-3 ingestion **in-module** (Path B, not an event); Marketplace displays via service; nothing coined |
| Audit | Doc-2 §9 Reviews — "review submit", "moderation decision", "publish", "remove" (all enumerated); admin-rating set **not** enumerated → `[ESC-TRUST-AUDIT]` |
| Validation order | canonical Pass-B nine-stage (frozen Part-1…4 presentation; explicit N/A rows); Doc-4A §11.2 enforcement authority |
| Error model | Doc-4A §12 / Annexure B closed twelve-class set; REFERENCE≠DEPENDENCY, STATE≠CONFLICT enforced per contract |
| Idempotency | Doc-4A §14; dedup window → `[ESC-TRUST-POLICY]`; publish re-invokes BC-TRUST-3 ingestion idempotently (no duplicate Path-B input) |
| Performance integration | F4G-M2 (BC-TRUST-3 sole writer; BC-TRUST-5 invokes the ingestion service, never writes `performance_inputs`); F4G-M3 (Path B; de-dup at BC-TRUST-3 compute) |
| Non-disclosure | Doc-4A §7.5; Doc-2 §3.6 — admin ratings staff-internal (never tenant-visible/public); only `published` reviews public, via Marketplace service |
| Firewall / moat | Architecture §1.5 / Invariant 6; Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED — reviews/ratings mutate no score/verification/fraud/tier; reviews informational signals only |

**Carried dependencies (unchanged):** DG-1 (Identity — buyer membership/scope + staff `check_permission`), DG-2 (Marketplace — `vendor_profile_id` ref + **displays `published` reviews via service**, never table access), DG-4 (Operations — `engagement_id` post-award gate, read-only/service-validated), DG-8 (Platform Core — audit/human-ref). **Intra-module (F4G-M2/M3):** `trust.ingest_performance_input.v1` (BC-TRUST-3) invoked on publish (Path B) — BC-TRUST-5 never writes `performance_inputs`. DG-7 (Billing) referenced only as the **firewall** (no input).

**Carried escalation markers (unchanged; never resolved here):** `[ESC-TRUST-AUDIT]` (Doc-2 §9 additive — admin-rating set, not §9-enumerated; nearest §9 by pointer), `[ESC-TRUST-POLICY]` (Doc-3 §12.2 additive — review/rating dedup windows), `[ESC-TRUST-SLUG]` (Doc-2 §7 additive — a dedicated review-moderation or admin-rating slug if later required; the §7 staff family covers it today).

**Firewall, separation & moat (Part-5 posture):** **Reviews and Admin Ratings are separate authorities — never merged** (Public Review: buyer-authored, staff-moderated, public after approved lifecycle, displayed by Marketplace via service; Admin Rating: staff-owned, internal-only, never public/tenant-visible/externally exposed); neither mutates Trust Score / Performance Score / Verification / Fraud Signals / Financial Tier; **published reviews feed `performance_inputs` only by invoking the BC-TRUST-3 ingestion service (F4G-M2, Path B), never a direct write; de-dup at BC-TRUST-3 compute (F4G-M3)**; no Billing influence; admin ratings staff-internal (non-staff → `NOT_FOUND`); **BC-TRUST-5 emits no event** (Doc-2 §8 has none); reviews are **informational signals only** — no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. **No flag-and-halt triggered; no corpus conflict.**

---

*End of Doc-4G — Trust & Verification Engine — Pass-B Part 5 v1.0 — BC-TRUST-5 Reviews & Admin Ratings. Hardens the frozen Pass-A §G8 contract set (7 contract IDs: submit review; moderate review; publish/remove review; set admin rating; review/admin-rating reads) to implementation grade — request/response schemas, canonical Pass-B nine-stage validation matrices (authority · validation · failure class per row; explicit N/A rows; Doc-4A §11.2 enforcement), authorization matrices (Doc-2 §7 `can_submit_review` buyer + platform-staff; published-review read public; per-query split), state-machine enforcement (Public Review `submitted → approved → published | rejected | removed`; Admin Rating simple; STATE vs CONFLICT separated), audit bindings (Doc-2 §9 Reviews submit/moderation/publish/remove; admin-rating set `[ESC-TRUST-AUDIT]`), event bindings (Doc-2 §8 has no review/admin-rating event → BC-TRUST-5 emits none; publish invokes BC-TRUST-3 ingestion in-module Path B; Marketplace displays via service; nothing coined), error registers (Doc-4A §12 closed class; REFERENCE vs DEPENDENCY separated; admin-rating staff-internal `NOT_FOUND` collapse), and idempotency rules (publish re-invokes ingestion idempotently; `[ESC-TRUST-POLICY]` windows). **Reviews and Admin Ratings preserved as separate authorities (never merged); F4G-M2 single-writer and F4G-M3 dual-path preserved (BC-TRUST-5 invokes the BC-TRUST-3 ingestion service, never writes `performance_inputs`).** Ownership, aggregate, permissions, lifecycle, events, and bounded context unchanged from Pass-A. Reviews/ratings mutate no Trust Score / Performance Score / Verification / Fraud Signals / Financial Tier; admin ratings internal-only; trust firewall and procurement moat preserved; nothing invented; no corpus conflict; no flag-and-halt. Scope: BC-TRUST-5 only. **This completes Module-5 (Trust & Verification) Pass-B authoring across BC-TRUST-1…5.***
