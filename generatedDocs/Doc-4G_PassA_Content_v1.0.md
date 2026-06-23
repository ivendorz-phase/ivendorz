# Doc-4G — Trust & Verification Engine — API & Integration Contracts — Pass-A v1.0

| Field | Value |
|---|---|
| Document | Doc-4G — **Pass-A Content v1.0** — Module-5 Trust & Verification contract inventory (`trust` schema, `trust_` namespace) — the governance-signal authority |
| Status | **Pass-A — Contract Inventory.** Defines contracts, commands/queries, ownership, and pointer-only references (lifecycle/permission/event/audit/dependency). **Request/response schemas, validation matrices, error matrices, and idempotency rules are Pass-B.** |
| Module | Module 5 — Trust & Verification (`trust` schema) — sole authority for Trust Score, Verification, Verified Financial Tier, Performance Score, Fraud Signals, Admin Ratings, Public Reviews |
| Structure baseline | `Doc-4G_Structure_v1.0_FROZEN` (Structure Proposal v0.1 + Patch v0.1) — 5 bounded contexts BC-TRUST-1…5; 7 aggregates (Doc-2 §2, Module 5) |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN — all FROZEN |
| Precedence | Architecture → ADR → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-4F → Doc-4G Structure FROZEN; conflict → FLAG-AND-HALT |
| Audience | Doc-4G Pass-B authors; Claude Code / Cursor / Codex / backend / frontend / QA |

---

## §B — Pass-A Cross-Cutting Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3) and avoid duplication, the following apply to **every** contract; per-contract records cite specifics and reference these by pointer.

- **B.1 — Contract-ID & templates (Doc-4A §21).** Contract-ID `trust.<operation>.v1` (prefix = schema `trust`; Appendix B namespace `trust_`). Templates: **21.3 Query** (reads), **21.4 Command** (tenant/staff mutations & state transitions), **21.6 Admin** (platform-staff; no active-org context, §5.6 — verification decisions, moderation, fraud triage, admin ratings), **21.5 System** (`Response: none` — score computation, freeze/review sweeps, and inbound event-consumer effects). **Template 21.2 (Integration) is NOT instantiated here** — per Doc-4A §4.4 the event-delivery integration contract is authored by the **emitting** module; Trust authors its own commands (emit) and its consumer effects on its own entities (single-authorship). No template invented.
- **B.2 — Actor types (Doc-4A §5; Doc-2 §9 actor set User|Admin|System|AI Agent).** **User** (tenant member in a server-validated active-org context, §5.3 — buyer controlling org for public-review submission); **Admin** (platform-staff, no active-org context, §5.6 — Verification Admin via `verification_tasks`, ban/fraud triage, review moderation, admin ratings); **System** (score computation, freeze/review timers, and inbound event consumers — performance-input ingestion); **internal-service** (synchronous in-module Trust read-services and cross-module reads consumed, e.g., Marketplace declared-tier/vendor-profile reference). No actor category invented.
- **B.3 — Identifiers (Doc-4A §8; Doc-2 §0.1).** UUIDv7 is the only canonical machine ID. Cross-module references (`vendor_profile_id`, `organization_id`, staff `user_id`, `rfq_invitation_id`, `quotation_id`, `engagement_id`, `wcc` ref) and the in-module subject refs are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3, §10.11). Human references allocated via Doc-4B `core.allocate_human_reference.v1` where a display ref is required (DG-8).
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** for tenant actions; **platform-staff slug** for §5.6 staff actions. **Slugs only** (§6.2), from the Doc-2 §7 catalog; **no slug invented**. Trust **consumes** Identity's `check_permission` and org/membership/active-org resolution and the platform-staff slugs (Doc-4C, FROZEN — DG-1); **no shadow authorization** implemented. The Doc-2 §7 Trust slugs are `staff_can_verify` (Verification Admin), `staff_can_ban` (ban/fraud), `can_submit_review` (buyer post-award review; engagement required). **Score computation runs under the System actor — no tenant slug** (scores are auto-calculated, never hand-edited; Doc-4A §5.2). Where a required staff action lacks a §7 slug, carry **`[ESC-TRUST-SLUG]`** (Doc-2 §7 additive channel; **no slug invented**).
- **B.5 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Audited mutations bind to the **Doc-2 §9 Trust** domain (verification request/decision/revoke/expiry; trust/performance freeze + reactivation; recalculation; formula version change; admin tier override) and the **Doc-2 §9 Reviews** domain (review submit, moderation decision, publish, remove) by pointer (attribution per actor; written in-transaction via the Doc-4B mechanism, never re-implemented). **Reads are not audited** (§17.1). Performance-input corrections are audited (Doc-2 §3.6 `performance_inputs` "corrections audited"). A mutation whose audit action is **not separately enumerated in Doc-2 §9** carries **`[ESC-TRUST-AUDIT]`** (interim: nearest §9 action by pointer; channel: Doc-2 §9 additive; **no audit action invented**) — specifically: fraud-signal create/review/action/dismiss; verified-tier set/confirm/downgrade/suspend/expire as distinct from the §9 "verification … " and "admin tier override" actions; admin-rating set; performance-input ingestion rows.
- **B.6 — Events (Doc-2 §8 via Doc-4B outbox-write).** Emitted events are **only** those in the Doc-2 §8 Trust catalog (`VendorVerified`; `VendorTierChanged` with payload `tier_type='verified'`; `TrustScoreUpdated`; `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen`), written transactionally via Doc-4B `core.write_outbox_event.v1` (business write + event insert one transaction); **no event coined** (§16.4). **Trust never writes `marketplace.financial_tier_history`** — it emits `VendorTierChanged[verified]` and Marketplace consumes it (Doc-2 §8). Inbound consumer effects bind to Doc-2 §8 events emitted by **other** modules — the Operations performance-input events (`DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`) and the RFQ `QuotationSubmitted` (response-leg performance input); the delivery integration is the emitter's (§4.4). **Non-events (Doc-2 §8):** invitation `decline`/`non_response` performance inputs have **no** domain event — they are Doc-2 §10.6 source-ref-derived rows (`source_type=invitation`; "only delivered invitations generate response/non_response inputs"); `non_response` is an absence and **no event may be invented**. The within-Trust public-review → performance-input feed is **not** a cross-module event (in-module ingestion-service call; B.9).
- **B.7 — Governance-signal firewall (Doc-4A §4B / §18.3; Architecture §1.5/Invariant 6; Doc-3 §11.8/§12.1 FIXED).** Trust is the **sole** owner/computer of Trust Score, Verification, Verified Financial Tier, Performance Score, Fraud Signals, Admin Ratings, Public Reviews; **no other module calculates, mutates, or owns a score**. The five governance dimensions are firewalled — Financial Tier never feeds Trust/Performance Score; Buyer-Vendor Status never mutates platform scores; **no paid plan / entitlement / flag gates trust, verification, eligibility, routing, or matching** (DG-7). Trust **reads** verification/performance/fraud signals as score-computation inputs via **same-module read-services (read-only)** — never mutating a source signal from another (B.9). Score bands/badges are public unless frozen; `admin_ratings` are internal-only, never public, never cross-tenant (Doc-2 §3.6).
- **B.8 — Procurement-moat boundary (Architecture §1.5; Doc-4E FROZEN — DG-3).** Trust owns **none** of matching/routing/ranking/quotation-evaluation/supplier-selection/award (RFQ / Doc-4E). It publishes signals RFQ consumes as gate/scoring inputs and references `rfq_invitation_id`/`quotation_id` **read-only** as performance-input sources; it makes **no procurement decision**. RFQ ownership remains intact.
- **B.9 — Intra-module seams (Doc-4G Structure FROZEN, F4G-MA2/F4G-M2).** Within `trust`: (a) **BC-TRUST-2 score-computation inputs** — BC-TRUST-2 obtains verification status (BC-TRUST-1), performance score (BC-TRUST-3), and fraud-signal state (BC-TRUST-4) via **same-module Trust read-services** (read-only; no cross-context write; no ownership transfer); (b) **`performance_inputs` single writer** — BC-TRUST-3 owns `performance_inputs` and is its **sole writer**; in-module contributors (BC-TRUST-5 published-review Buyer-Feedback) **invoke the BC-TRUST-3 performance-input ingestion service** rather than writing `performance_inputs` directly (no cross-context aggregate mutation).
- **B.10 — AI-agent source rule.** Every contract record states its **ownership / authority / lifecycle / audit / event source** by pointer, so Pass-B authors and AI coding agents implement without architectural assumptions. Global constraints: consume frozen Doc-4B/Doc-4C services (never re-derive auth/membership/delegation/audit/human-ref/outbox); honor the Doc-2 §5.6/§3.6 machines verbatim; bind every operational rule to Doc-3 by pointer; never expose a protected fact (§7.5); never coin an entity/event/slug/audit-action/POLICY-key/template (escalate via DG-* / `[ESC-TRUST-AUDIT]` / `[ESC-TRUST-POLICY]` / `[ESC-TRUST-SLUG]`).

**Per-contract record shape (Pass-A).** Each contract below is recorded as: **Contract ID · Contract Name · Type · Purpose · Aggregate Owner · Lifecycle References · Permission References · Event References · Audit References · Dependency References · Notes (ownership-safe / AI-agent-safe / boundary-safe).** Request/response schemas, validation matrices, error matrices, and idempotency rules are **Pass-B** and are not stated here.

---

## §G0 — Governance & Scope (Pass-A consolidation)

Doc-4G Pass-A converts the frozen Module-5 structure into an implementation-ready contract inventory. Precedence: Architecture → ADR → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A/4B/4C/4D/4E/4F v1.0 → Doc-4G Structure FROZEN. On any conflict with a frozen source: **FLAG-AND-HALT** (Doc-4A §0.6) — cite both sources, escalate; never resolve locally, never invent authority. This pass instantiates contracts only — no request/response schema, validation matrix, error matrix, or idempotency rule (all Pass-B). The trust firewall (B.7) and procurement moat (B.8) bind every contract. No corpus conflict was encountered authoring this pass.

## §G1 — Module Mission (Pass-A consolidation)

Module 5 owns and computes the platform's governance signals: verification cases + staff decisions; the verified financial tier (validating the declared tier without owning it — Architecture Patch v1.0.1 PATCH-01); the trust score (auto-computed, formula-versioned); the performance score (auto-computed from six weighted components, Not Rated until threshold); fraud signals (feeding Admin ban management); admin ratings (internal-only); and public reviews (post-award, moderated, feeding Buyer-Feedback performance and displayed by Marketplace via service). Scores are auto-calculated under the System actor, never hand-edited; only `performance_inputs`/underlying data are correctable (corrections audited). Trust underwrites the procurement moat by supplying signals RFQ consumes — it never makes a procurement decision.

## §G2 — Ownership Model (Pass-A consolidation)

| Aggregate (Doc-2 §2, Module 5) | Root + children (Doc-2 §3.6/§10.6) | Owning BC-TRUST |
|---|---|---|
| Verification Case | `verification_records` (AR) + `verification_decisions` | BC-TRUST-1 |
| Verified Financial Tier | `verified_financial_tiers` (AR) | BC-TRUST-1 |
| Trust Score | `trust_scores` (AR) + `trust_score_history` | BC-TRUST-2 |
| Performance Score | `performance_scores` (AR) + `performance_score_history`, `performance_inputs` | BC-TRUST-3 |
| Fraud Signal | `fraud_signals` (AR) | BC-TRUST-4 |
| Admin Rating | `admin_ratings` (AR) | BC-TRUST-5 |
| Public Review | `public_reviews` (AR) | BC-TRUST-5 |

Seven aggregates, **each in exactly one bounded context** (Doc-2 §2; Doc-4G Structure FROZEN §G5/§G9). **NOT owned (reference by UUID/service/event only):** Identity (`organizations`/`memberships`/`check_permission`/`staff_*` — DG-1); Marketplace (`vendor_profiles`/`declared_financial_tiers`/attributes — DG-2); RFQ (`rfqs`/matching/award — DG-3); Operations (`engagements`/post-award — DG-4); Admin (`ban_actions`/moderation — DG-5); Communication (notification fan-out — DG-6); Billing (`plans`/`entitlements` — DG-7); Platform Core (`core.*` — DG-8).

## §G3 — Bounded Context Model (Pass-A grouping)

| BC | Section | Aggregates | Contract group |
|---|---|---|---|
| BC-TRUST-1 Verification & Verified Tier | §G4 | Verification Case; Verified Financial Tier | verification-case lifecycle, staff decisions, verified-tier management |
| BC-TRUST-2 Trust Scoring | §G5 | Trust Score | trust-score computation, freeze/reactivate, history, publication |
| BC-TRUST-3 Performance Scoring | §G6 | Performance Score (+ `performance_inputs`) | input ingestion, score computation, freeze/reactivate, review trigger, publication |
| BC-TRUST-4 Fraud & Risk Signals | §G7 | Fraud Signal | signal create/review/action/dismiss |
| BC-TRUST-5 Reviews & Admin Ratings | §G8 | Public Review; Admin Rating | review submit/moderate/publish/remove, Buyer-Feedback feed, admin ratings |

---

## §G4 — Verification & Verified-Tier Contracts (BC-TRUST-1; Verification Case + Verified Financial Tier aggregates)

#### `trust.request_verification.v1` — Request Verification Case · 21.4 Command · Actor: User

- **Contract ID:** `trust.request_verification.v1`
- **Contract Name:** Request Verification Case
- **Type:** 21.4 Command
- **Purpose:** Open a verification case for a subject (vendor profile / organization / capacity claim / declared tier), entering `requested` for staff assignment.
- **Aggregate Owner:** Verification Case (BC-TRUST-1) — `verification_records` (AR); subject by `subject_id`+`subject_type` (Doc-2 §10.6).
- **Lifecycle References:** Doc-2 §5.6 Verification — entry `requested`.
- **Permission References:** Doc-2 §7 `can_submit_verification` (Owner-only verification submission). *(Subject is org/vendor-owned; submission is the tenant boundary inbound dep DC-2/DD-1 now owned here.)*
- **Event References:** none at request (Doc-2 §8 — no event for case open).
- **Audit References:** Doc-2 §9 Trust "verification request".
- **Dependency References:** DG-1 (Identity — `check_permission`, org/membership); DG-2 (Marketplace — vendor-profile/declared-tier reference by UUID, read); DG-8 (Platform Core — audit/human-ref).
- **Notes:** Ownership-safe — Trust owns the case; the subject (vendor profile/declared tier) stays in its owning module, referenced by UUID. AI-agent-safe — subject set is exactly the Doc-2 §5.6/§10.6 four subjects; never invent a subject type. Boundary-safe — no Marketplace mutation.

#### `trust.assign_verification.v1` — Assign Case to Reviewer · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.assign_verification.v1`
- **Contract Name:** Assign Verification Case (→ in_review)
- **Type:** 21.6 Admin
- **Purpose:** Verification Admin takes/assigns a case; `requested → in_review`.
- **Aggregate Owner:** Verification Case (BC-TRUST-1) — `verification_records`.
- **Lifecycle References:** Doc-2 §5.6 — `requested ──assign──▶ in_review`.
- **Permission References:** Doc-2 §7 `staff_can_verify` (Verification Admin; platform-staff slug, §5.6 no active-org context). Verification Admins hold no finance-read slugs (Doc-2 §7).
- **Event References:** none (Doc-2 §8).
- **Audit References:** Doc-2 §9 Trust "verification … decision" family (assignment as a case-state action); if assignment is not separately enumerated, carry `[ESC-TRUST-AUDIT]` (nearest §9 action by pointer; no audit action invented).
- **Dependency References:** DG-1 (staff identity, `verification_tasks` admin ref — Admin/Doc-4J relationship via §10.6 `verification_task_id`); DG-8 (audit).
- **Notes:** Boundary-safe — assignment is a Trust case-state action; the admin task queue is referenced (`verification_task_id`), not owned.

#### `trust.decide_verification.v1` — Record Verification Decision · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.decide_verification.v1`
- **Contract Name:** Record Verification Decision (approve / reject / confirm / downgrade / request_info)
- **Type:** 21.6 Admin
- **Purpose:** Staff decision on a case: `in_review → approved | rejected`, `in_review → requested` (request more info). Decision row persisted with decider.
- **Aggregate Owner:** Verification Case (BC-TRUST-1) — `verification_records` + `verification_decisions` (append-only child, Doc-2 §3.6).
- **Lifecycle References:** Doc-2 §5.6 — `in_review ──approve──▶ approved`, `in_review ──reject──▶ rejected`, `in_review ──request more info──▶ requested`. Decision enum `approve/reject/confirm/downgrade/request_info` (Doc-2 §10.6).
- **Permission References:** Doc-2 §7 `staff_can_verify`.
- **Event References:** `VendorVerified` (Doc-2 §8 — `trust.verification_records`) on an approve outcome, via Doc-4B outbox-write. A tier-affecting decision (confirm/downgrade of declared tier) is realized through verified-tier contracts (below), which emit `VendorTierChanged[verified]` — not emitted here.
- **Audit References:** Doc-2 §9 Trust "verification … decision".
- **Dependency References:** DG-1 (staff identity); DG-2 (Marketplace — declared-tier reference for confirm/downgrade subject, read); DG-6 (Communication consumes `VendorVerified` for notification fan-out); DG-8 (audit/outbox).
- **Notes:** Ownership-safe — a verification record may validate/confirm/reject/downgrade a declared tier **without owning it** (PATCH-01); the declared tier stays in `marketplace`. AI-agent-safe — decision enum is exactly Doc-2 §10.6; never invent a decision. Firewall-safe — no score mutated here.

#### `trust.revoke_verification.v1` — Revoke Verification · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.revoke_verification.v1`
- **Contract Name:** Revoke Verification (fraud/compliance)
- **Type:** 21.6 Admin
- **Purpose:** Revoke an approved verification on fraud/compliance grounds; `approved → revoked`.
- **Aggregate Owner:** Verification Case (BC-TRUST-1) — `verification_records`.
- **Lifecycle References:** Doc-2 §5.6 — `approved ──revoke [fraud/compliance]──▶ revoked`.
- **Permission References:** Doc-2 §7 `staff_can_verify` (and/or `staff_can_ban` where compliance-driven; both are §7 platform-staff slugs). If a distinct revoke slug is required, carry `[ESC-TRUST-SLUG]` (no slug invented).
- **Event References:** Doc-2 §8 — no dedicated revoke event; verified-tier suspension (if it follows) emits `VendorTierChanged[verified]` via the verified-tier contract. *(Eligibility refresh consumers read the revoked verification state by service.)*
- **Audit References:** Doc-2 §9 Trust "verification … revoke".
- **Dependency References:** DG-5 (Admin — compliance/ban relationship consumes verification outputs); DG-6 (Communication fan-out); DG-8 (audit/outbox).
- **Notes:** Boundary-safe — the ban decision is Admin's (DG-5); Trust revokes the verification only.

#### `trust.expire_verification.v1` — Expire Verification (lapse/document expiry) · 21.5 System · Actor: System

- **Contract ID:** `trust.expire_verification.v1`
- **Contract Name:** Expire Verification (periodic-review lapse / document expiry)
- **Type:** 21.5 System (Response: none)
- **Purpose:** System transition of an approved verification on review lapse or evidence-document expiry; `approved → expired`.
- **Aggregate Owner:** Verification Case (BC-TRUST-1) — `verification_records`.
- **Lifecycle References:** Doc-2 §5.6 — `approved ──periodic review lapse / document expiry──▶ expired`; `expires_at` (Doc-2 §10.6).
- **Permission References:** none (System actor; §5.2). No tenant slug.
- **Event References:** Doc-2 §8 — no dedicated expiry event; downstream verified-tier expiry emits `VendorTierChanged[verified]` via its own contract.
- **Audit References:** Doc-2 §9 Trust "verification … expiry" (System actor attribution).
- **Dependency References:** DG-8 (Platform Core — timer/sweep + audit). Runtime cadence/window for review lapse is a tunable absent from Doc-3 §12.2 → carry `[ESC-TRUST-POLICY]` (no key invented).
- **Notes:** AI-agent-safe — expiry never penalizes the vendor's scores directly; it changes verification/verified-tier state only (firewall).

#### `trust.set_verified_tier.v1` · `trust.confirm_verified_tier.v1` · `trust.downgrade_verified_tier.v1` — Verified-Tier Establishment · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.set_verified_tier.v1` · `trust.confirm_verified_tier.v1` · `trust.downgrade_verified_tier.v1`
- **Contract Name:** Verified Financial Tier — set / confirm / downgrade
- **Type:** 21.6 Admin
- **Purpose:** Establish or adjust the verified financial tier off an approved tier verification: create the row at `pending_verification → verified`, confirm at periodic review, or downgrade the band — validating the declared tier **without owning it** (PATCH-01).
- **Aggregate Owner:** Verified Financial Tier (BC-TRUST-1) — `verified_financial_tiers` (AR); `tier(A–E)`, `status`, `verified_at`, `next_review_at(+24mo)`, `basis_jsonb` (Doc-2 §10.6).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `pending_verification → verified → suspended | expired`; 24-month review; "Declared Only" = absence of a row.
- **Permission References:** Doc-2 §7 `staff_can_verify`.
- **Event References:** `VendorTierChanged` with payload `tier_type='verified'` (Doc-2 §8 — `trust.verified_financial_tiers`) via Doc-4B outbox-write. **Trust never writes `marketplace.financial_tier_history`** — Marketplace consumes the event and writes it.
- **Audit References:** Doc-2 §9 Trust "admin tier override" / "verification … decision"; verified-tier status transitions not separately enumerated carry `[ESC-TRUST-AUDIT]` (nearest §9 by pointer; no audit action invented).
- **Dependency References:** DG-2 (Marketplace — declared-tier reference, read; consumes `VendorTierChanged[verified]` for `financial_tier_history` + read-model band); DG-6 (Communication fan-out); DG-8 (audit/outbox).
- **Notes:** Firewall-safe — declared tier stays Marketplace's; verified tier is Trust's. Financial Tier never feeds Trust/Performance Score (Architecture Invariant 6). Value-band thresholds for tier are RFQ-consumption POLICY (`tier.use_verified_when_present`, "verification value-band thresholds", Doc-3 §12.2) — read by RFQ, not owned here.

#### `trust.suspend_verified_tier.v1` · `trust.expire_verified_tier.v1` — Verified-Tier Suspension/Expiry · 21.6 Admin / 21.5 System · Actor: Admin / System

- **Contract ID:** `trust.suspend_verified_tier.v1` (Admin) · `trust.expire_verified_tier.v1` (System)
- **Contract Name:** Verified Financial Tier — suspend / expire
- **Type:** 21.6 Admin (suspend) · 21.5 System (expire on 24-month review lapse)
- **Purpose:** Suspend a verified tier (compliance/fraud) or expire it on review lapse; `verified → suspended | expired`.
- **Aggregate Owner:** Verified Financial Tier (BC-TRUST-1) — `verified_financial_tiers`.
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `verified → suspended | expired`; `next_review_at(+24mo)`.
- **Permission References:** `staff_can_verify` (suspend); none for System expiry (§5.2).
- **Event References:** `VendorTierChanged[verified]` (Doc-2 §8) via outbox-write (Marketplace consumes).
- **Audit References:** Doc-2 §9 Trust "admin tier override"; status transition specifics carry `[ESC-TRUST-AUDIT]` if not separately enumerated.
- **Dependency References:** DG-2 (Marketplace consumes event); DG-5 (Admin compliance); DG-8 (audit/outbox/timer). 24-month review window tunable absent from Doc-3 §12.2 → `[ESC-TRUST-POLICY]`.
- **Notes:** Boundary-safe — matching eligibility consumes the tier band via RFQ; Trust changes state and emits, never re-ranks.

#### `trust.get_verification.v1` · `trust.list_verifications.v1` · `trust.get_verified_tier.v1` — Verification/Tier Reads · 21.3 Query · Actor: Admin / internal-service

- **Contract ID:** `trust.get_verification.v1` · `trust.list_verifications.v1` · `trust.get_verified_tier.v1`
- **Contract Name:** Verification & Verified-Tier Reads
- **Type:** 21.3 Query
- **Purpose:** Read a verification case / list cases (staff queue) / read the verified tier (badge + status) for a vendor profile.
- **Aggregate Owner:** Verification Case + Verified Financial Tier (BC-TRUST-1) — read-only.
- **Lifecycle References:** Doc-2 §5.6/§3.6 (state read).
- **Permission References:** Doc-2 §7 `staff_can_verify` (case detail/queue, staff); verified-tier badge is public read (Doc-2 §3.6 "public badge read") — public projection via service.
- **Event References:** none (reads).
- **Audit References:** none — reads are not audited (Doc-4A §17.1).
- **Dependency References:** DG-1 (staff identity); DG-2 (Marketplace displays verified badge via service; never table access); DG-8 (Platform Core).
- **Notes:** Boundary-safe — verified-tier badge public; full case detail is staff-only. Non-disclosure: internal case detail never exposed to counterparties (Doc-4A §7.5).

---

## §G5 — Trust-Scoring Contracts (BC-TRUST-2; Trust Score aggregate)

#### `trust.compute_trust_score.v1` — Compute / Recalculate Trust Score · 21.5 System · Actor: System

- **Contract ID:** `trust.compute_trust_score.v1`
- **Contract Name:** Compute / Recalculate Trust Score
- **Type:** 21.5 System (Response: none)
- **Purpose:** Auto-compute the trust score (0–100, band, `trust_formula_version`) from its inputs; write current + history snapshot; publish on change. Runs on input-signal change or recalculation trigger.
- **Aggregate Owner:** Trust Score (BC-TRUST-2) — `trust_scores` (AR) + `trust_score_history` (append-only, Doc-2 §3.6/§10.6).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `computed | frozen`; `score 0–100, band, trust_formula_version, freeze_state`.
- **Permission References:** none — System actor; **auto-calculated, never hand-edited** (Doc-4A §5.2; Doc-2 §3.6). No tenant slug.
- **Event References:** `TrustScoreUpdated` (Doc-2 §8 — `trust.trust_scores`) via Doc-4B outbox-write.
- **Audit References:** Doc-2 §9 Trust "recalculation" and "formula version change".
- **Dependency References:** **Intra-module (B.9a):** reads verification status (BC-TRUST-1), performance score (BC-TRUST-3), fraud-signal state (BC-TRUST-4) via same-module read-services (read-only). DG-2/DG-3 (Marketplace/RFQ consume `TrustScoreUpdated` for read-model rebuild / matching refresh); DG-8 (outbox/audit). Formula thresholds/weights are tunables absent from Doc-3 §12.2 → `[ESC-TRUST-POLICY]` (no key invented; `formula_version` bump on change per Doc-3 §12.4).
- **Notes:** Firewall-safe — Financial Tier never increases Trust Score; Buyer-Vendor Status never mutates it; secondary signals never dominate (Architecture §1.5 FIXED). AI-agent-safe — inputs are read-only; computation never writes BC-TRUST-1/3/4.

#### `trust.freeze_trust_score.v1` · `trust.reactivate_trust_score.v1` — Trust-Score Freeze / Reactivate · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.freeze_trust_score.v1` · `trust.reactivate_trust_score.v1`
- **Contract Name:** Trust Score — freeze / reactivate
- **Type:** 21.6 Admin
- **Purpose:** Freeze (suspend publication/ranking effect only) or reactivate a trust score (e.g., Trust Protection during ownership-transfer workflow).
- **Aggregate Owner:** Trust Score (BC-TRUST-2) — `trust_scores` (`freeze_state(none/frozen)`, `freeze_reason`, `frozen_at`).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `computed | frozen`; "freeze suspends publication and ranking effect only".
- **Permission References:** Doc-2 §7 `staff_can_verify` / `staff_can_ban` (platform-staff governance); if a distinct freeze slug is required, `[ESC-TRUST-SLUG]`.
- **Event References:** `TrustScoreUpdated` (Doc-2 §8) on freeze-state change (band publication suppressed while frozen) via outbox-write.
- **Audit References:** Doc-2 §9 Trust "trust/performance freeze + reactivation".
- **Dependency References:** consumes Marketplace `VendorOwnershipTransferred` (Doc-2 §8) as a freeze trigger (Trust Protection) via service/event; DG-8 (audit/outbox). Freeze-window tunable absent from §12.2 → `[ESC-TRUST-POLICY]`.
- **Notes:** Boundary-safe — freeze affects publication/ranking effect only; underlying score retained. Firewall-safe — freeze is governance, not a score edit.

#### `trust.get_trust_score.v1` · `trust.list_trust_score_history.v1` — Trust-Score Reads · 21.3 Query · Actor: internal-service / Admin

- **Contract ID:** `trust.get_trust_score.v1` · `trust.list_trust_score_history.v1`
- **Contract Name:** Trust-Score Reads (current + history)
- **Type:** 21.3 Query
- **Purpose:** Read current trust score/band for a vendor profile (public band unless frozen) and the versioned history (staff).
- **Aggregate Owner:** Trust Score (BC-TRUST-2) — read-only.
- **Lifecycle References:** Doc-2 §3.6/§10.6 (band public unless frozen).
- **Permission References:** band public read (Doc-2 §3.6); history `staff_can_verify` (staff).
- **Event References:** none (reads).
- **Audit References:** none (reads not audited, §17.1).
- **Dependency References:** DG-2 (Marketplace projects band into directory read-model via service); DG-8.
- **Notes:** Boundary-safe — band public unless frozen; history staff-only.

---

## §G6 — Performance-Scoring Contracts (BC-TRUST-3; Performance Score aggregate + `performance_inputs`)

#### `trust.ingest_performance_input.v1` — Performance-Input Ingestion (sole writer) · 21.5 System · Actor: System / internal-service

- **Contract ID:** `trust.ingest_performance_input.v1`
- **Contract Name:** Performance-Input Ingestion (single write path for `performance_inputs`)
- **Type:** 21.5 System (Response: none)
- **Purpose:** The **sole writer** of `performance_inputs`. Append a normalized input fact from (a) consumed Operations events, (b) the RFQ `QuotationSubmitted` response-leg event, (c) Doc-2 §10.6 source-ref-derived invitation inputs, and (d) in-module BC-TRUST-5 published-review Buyer-Feedback (B.9b).
- **Aggregate Owner:** Performance Score (BC-TRUST-3) — `performance_inputs` (append-only; corrections audited, Doc-2 §3.6/§10.6); `input_type(response/decline/non_response/delivery/feedback/dispute/completion)`, `source_entity_id`+`source_type(invitation/quotation/engagement/wcc)`, `occurred_at`, `value_jsonb`.
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `performance_inputs` append-only (correctable; corrections audited).
- **Permission References:** none — System/internal-service (event consumer + in-module ingestion service). No tenant slug.
- **Event References:** **Consumed (Doc-2 §8, other modules):** `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` (Operations → delivery/completion/dispute/feedback rows); `QuotationSubmitted` (RFQ → response row). **No event emitted.** **Non-events:** invitation `decline`/`non_response` are Doc-2 §10.6 source-ref-derived (`source_type=invitation`; only delivered invitations) — **no event; none may be invented** (`non_response` is an absence). The BC-TRUST-5 published-review feed is an **in-module service call** (B.9b), not an event.
- **Audit References:** performance-input write/correction → Doc-2 §9 Trust domain; ingestion rows not separately enumerated carry `[ESC-TRUST-AUDIT]` (nearest §9 by pointer; no audit action invented). Corrections audited (Doc-2 §3.6).
- **Dependency References:** DG-4 (Operations owns the five events; Trust owns the `performance_inputs` effect — its own consumer); DG-3 (RFQ owns `QuotationSubmitted` and the invitation source refs, read-only); DG-8 (outbox/audit). **Intra-module (B.9b):** invoked by BC-TRUST-5 on review publish.
- **Notes:** Ownership-safe — **`performance_inputs` is BC-TRUST-3-owned; this is the only write path; BC-TRUST-5 invokes it, never writes directly** (Doc-4G Structure FROZEN F4G-M2). AI-agent-safe — idempotent consumer (dedup on event identity; window rules Pass-B); `input_type`/`source_type` enums are exactly Doc-2 §10.6 — never invent. Boundary-safe — Trust computes no procurement decision from these refs (B.8).

#### `trust.compute_performance_score.v1` — Compute Performance Score · 21.5 System · Actor: System

- **Contract ID:** `trust.compute_performance_score.v1`
- **Contract Name:** Compute Performance Score (six weighted components; threshold gate)
- **Type:** 21.5 System (Response: none)
- **Purpose:** Auto-compute the performance score (0–100 nullable; NULL = Not Rated until threshold) from the six weighted components over `performance_inputs`; write current + history; publish on change.
- **Aggregate Owner:** Performance Score (BC-TRUST-3) — `performance_scores` (AR) + `performance_score_history` (append-only).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `not_rated → computed | frozen`; `score 0–100 NULLABLE, level, components_jsonb(6 weighted; renormalized), performance_formula_version, min_threshold_met(5 responses OR 2 projects)`.
- **Permission References:** none — System actor; **auto-calculated, never hand-edited** (Doc-2 §3.6). No tenant slug.
- **Event References:** `PerformanceScoreUpdated` (Doc-2 §8 — `trust.performance_scores`) via outbox-write.
- **Audit References:** Doc-2 §9 Trust "recalculation", "formula version change".
- **Dependency References:** reads own `performance_inputs`; DG-2/DG-3 (Marketplace/RFQ consume `PerformanceScoreUpdated`); DG-8 (outbox/audit). Component weights / `min_threshold_met` values / renormalization are tunables; the `5 responses OR 2 projects` threshold is a Doc-2 §3.6 structural value, formula thresholds absent from Doc-3 §12.2 → `[ESC-TRUST-POLICY]` (`formula_version` bump per §12.4).
- **Notes:** Firewall-safe — Financial Tier never affects Performance Score (Architecture Invariant 6 FIXED); absence-of-history never scores as zero (Doc-3 §12.1 FIXED — Not Rated, not 0). **Buyer-Feedback dual path (Doc-4G Structure FROZEN F4G-M3):** Path A = `BuyerFeedbackRecorded` (Operations event) and Path B = published `public_reviews` (BC-TRUST-5, in-module) are **distinct `performance_inputs` rows** (distinct `source_type`) feeding the **same** Buyer-Feedback component; de-dup/weighting is performed here at computation (Doc-2 §10.6 renormalization) — no double count.

#### `trust.freeze_performance_score.v1` · `trust.reactivate_performance_score.v1` — Performance-Score Freeze / Reactivate · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.freeze_performance_score.v1` · `trust.reactivate_performance_score.v1`
- **Contract Name:** Performance Score — freeze / reactivate
- **Type:** 21.6 Admin
- **Purpose:** Freeze (suspend publication/ranking effect only) or reactivate a performance score (e.g., dispute hold, ownership-transfer Trust Protection).
- **Aggregate Owner:** Performance Score (BC-TRUST-3) — `performance_scores` (`freeze_state`).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `computed | frozen` (freeze suspends publication/ranking effect only).
- **Permission References:** Doc-2 §7 `staff_can_verify` / `staff_can_ban`; distinct freeze slug → `[ESC-TRUST-SLUG]`.
- **Event References:** `PerformanceFrozen` (Doc-2 §8 — `trust.performance_scores`) on freeze; `PerformanceScoreUpdated` on reactivation-driven change, via outbox-write.
- **Audit References:** Doc-2 §9 Trust "trust/performance freeze + reactivation".
- **Dependency References:** consumes Marketplace `VendorOwnershipTransferred` as a freeze trigger; DG-8 (audit/outbox). Freeze-window tunable absent from §12.2 → `[ESC-TRUST-POLICY]`.
- **Notes:** Boundary-safe — freeze affects publication/ranking only; underlying score retained; expiry/freeze never penalizes vendors (Doc-3 §12.1 FIXED).

#### `trust.trigger_performance_review.v1` — Trigger Performance Review · 21.5 System · Actor: System

- **Contract ID:** `trust.trigger_performance_review.v1`
- **Contract Name:** Trigger Performance Review
- **Type:** 21.5 System (Response: none)
- **Purpose:** Raise a performance-review trigger (e.g., threshold crossing, periodic cadence, dispute pattern) for staff attention; publishes the trigger event.
- **Aggregate Owner:** Performance Score (BC-TRUST-3) — `performance_scores`.
- **Lifecycle References:** Doc-2 §3.6/§10.6 (review trigger over `performance_scores`).
- **Permission References:** none — System actor.
- **Event References:** `PerformanceReviewTriggered` (Doc-2 §8 — `trust.performance_scores`) via outbox-write.
- **Audit References:** Doc-2 §9 Trust "recalculation" family; if review-trigger is not separately enumerated, `[ESC-TRUST-AUDIT]`.
- **Dependency References:** DG-6 (Communication fan-out of the trigger notification); DG-8 (outbox/audit). Review cadence tunable absent from §12.2 → `[ESC-TRUST-POLICY]`.
- **Notes:** AI-agent-safe — trigger is a System event; it never auto-edits a score (computation is the only score writer).

#### `trust.get_performance_score.v1` · `trust.list_performance_inputs.v1` · `trust.list_performance_score_history.v1` — Performance Reads · 21.3 Query · Actor: internal-service / Admin

- **Contract ID:** `trust.get_performance_score.v1` · `trust.list_performance_inputs.v1` · `trust.list_performance_score_history.v1`
- **Contract Name:** Performance Reads (current score / inputs ledger / history)
- **Type:** 21.3 Query
- **Purpose:** Read current performance score/level (public badge unless frozen), the normalized inputs ledger (staff), and versioned history (staff).
- **Aggregate Owner:** Performance Score (BC-TRUST-3) — read-only.
- **Lifecycle References:** Doc-2 §3.6/§10.6 (badge public unless frozen; Not Rated when NULL).
- **Permission References:** badge public read (Doc-2 §3.6); inputs/history `staff_can_verify` (staff).
- **Event References:** none (reads).
- **Audit References:** none (reads not audited).
- **Dependency References:** DG-2 (Marketplace projects badge into read-model); DG-8.
- **Notes:** Boundary-safe — badge public unless frozen; Not Rated surfaces as Not Rated, never 0 (Doc-3 §12.1 FIXED).

---

## §G7 — Fraud & Risk-Signal Contracts (BC-TRUST-4; Fraud Signal aggregate)

#### `trust.create_fraud_signal.v1` — Create Fraud Signal · 21.6 Admin · Actor: Admin / System

- **Contract ID:** `trust.create_fraud_signal.v1`
- **Contract Name:** Create Fraud Signal
- **Type:** 21.6 Admin (staff-reported) · 21.5 System (system-detected)
- **Purpose:** Record a fraud indicator (subject + type + severity) at `open`, feeding Admin ban management.
- **Aggregate Owner:** Fraud Signal (BC-TRUST-4) — `fraud_signals` (AR); `signal_type, severity, state`, `subject_id`+`subject_type`, `reported_by` (Doc-2 §10.6).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `open → reviewed → actioned | dismissed` (entry `open`).
- **Permission References:** Doc-2 §7 `staff_can_ban` (fraud/ban family, platform-staff). System-detected creation runs under System actor.
- **Event References:** Doc-2 §8 — **no Trust fraud event in the §8 catalog**; the signal is consumed at the Admin boundary by service. No event coined.
- **Audit References:** fraud-signal create not separately enumerated in Doc-2 §9 → carry `[ESC-TRUST-AUDIT]` (nearest §9 action by pointer; no audit action invented).
- **Dependency References:** DG-5 (Admin — `ban_actions`/moderation consume actioned signals; the ban decision is Admin's); DG-8 (audit).
- **Notes:** Boundary-safe — Trust records/triages the signal; the **ban decision is Admin's** (DG-5). Firewall-safe — fraud state is an input BC-TRUST-2 reads (B.9a), never a cross-module mutation.

#### `trust.review_fraud_signal.v1` · `trust.action_fraud_signal.v1` · `trust.dismiss_fraud_signal.v1` — Fraud-Signal Triage · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.review_fraud_signal.v1` · `trust.action_fraud_signal.v1` · `trust.dismiss_fraud_signal.v1`
- **Contract Name:** Fraud Signal — review / action / dismiss
- **Type:** 21.6 Admin
- **Purpose:** Advance a fraud signal through triage: `open → reviewed`, `reviewed → actioned | dismissed`.
- **Aggregate Owner:** Fraud Signal (BC-TRUST-4) — `fraud_signals`.
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `open → reviewed → actioned | dismissed`.
- **Permission References:** Doc-2 §7 `staff_can_ban`.
- **Event References:** Doc-2 §8 — none (Admin consumes actioned signals by service); no event coined.
- **Audit References:** triage transitions not separately enumerated in Doc-2 §9 → `[ESC-TRUST-AUDIT]`.
- **Dependency References:** DG-5 (Admin ban management consumes `actioned`); DG-8 (audit).
- **Notes:** Boundary-safe — `actioned` informs Admin; Trust never issues the ban.

#### `trust.get_fraud_signal.v1` · `trust.list_fraud_signals.v1` — Fraud-Signal Reads · 21.3 Query · Actor: Admin

- **Contract ID:** `trust.get_fraud_signal.v1` · `trust.list_fraud_signals.v1`
- **Contract Name:** Fraud-Signal Reads
- **Type:** 21.3 Query
- **Purpose:** Read a fraud signal / list signals (staff triage queue).
- **Aggregate Owner:** Fraud Signal (BC-TRUST-4) — read-only.
- **Lifecycle References:** Doc-2 §3.6/§10.6 (state read).
- **Permission References:** Doc-2 §7 `staff_can_ban` (staff-only; never tenant-visible).
- **Event References:** none (reads).
- **Audit References:** none (reads not audited).
- **Dependency References:** DG-5 (Admin); DG-8.
- **Notes:** Non-disclosure-safe — fraud signals are staff-internal; never exposed to any tenant (Doc-4A §7.5).

---

## §G8 — Reviews & Admin-Rating Contracts (BC-TRUST-5; Public Review + Admin Rating aggregates)

#### `trust.submit_review.v1` — Submit Public Review · 21.4 Command · Actor: User

- **Contract ID:** `trust.submit_review.v1`
- **Contract Name:** Submit Public Review (post-award; engagement-gated)
- **Type:** 21.4 Command
- **Purpose:** A buyer submits a post-award public review of a vendor; enters `submitted` for moderation. Engagement reference required (service-validated).
- **Aggregate Owner:** Public Review (BC-TRUST-5) — `public_reviews` (AR); `rating 1–5, body, status, vendor_profile_id, author_organization_id, engagement_id` (Doc-2 §10.6).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `submitted → approved → published | rejected | removed` (entry `submitted`).
- **Permission References:** Doc-2 §7 `can_submit_review` (O,D,M — buyer side; **engagement required**).
- **Event References:** Doc-2 §8 — no review submission event in the catalog; no event coined.
- **Audit References:** Doc-2 §9 Reviews "review submit".
- **Dependency References:** DG-4 (Operations — `engagement_id` reference, read-only/service-validated; post-award gate); DG-1 (Identity — buyer membership/scope); DG-8 (audit/human-ref).
- **Notes:** Boundary-safe — post-award only (engagement reference required); the engagement is Operations-owned, referenced by UUID. Tenancy — `public_reviews` is shared (author org writes; public when published, Doc-2 §3.6).

#### `trust.moderate_review.v1` — Moderate Review (approve / reject) · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.moderate_review.v1`
- **Contract Name:** Moderate Review (approve / reject)
- **Type:** 21.6 Admin
- **Purpose:** Platform-staff moderation decision on a submitted review; `submitted → approved | rejected`.
- **Aggregate Owner:** Public Review (BC-TRUST-5) — `public_reviews` (`status`, `moderated_by`, `moderated_at`).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `submitted → approved | rejected`.
- **Permission References:** Doc-2 §7 platform-staff (review moderation is platform-staff per Doc-4G Structure §G12). If a dedicated moderation slug is required beyond the §7 staff set, carry `[ESC-TRUST-SLUG]` (no slug invented).
- **Event References:** Doc-2 §8 — none; no event coined.
- **Audit References:** Doc-2 §9 Reviews "moderation decision".
- **Dependency References:** DG-1 (staff identity); DG-8 (audit).
- **Notes:** Boundary-safe — moderation is platform-staff; the buyer authored the content.

#### `trust.publish_review.v1` · `trust.remove_review.v1` — Publish / Remove Review · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.publish_review.v1` · `trust.remove_review.v1`
- **Contract Name:** Publish / Remove Review
- **Type:** 21.6 Admin
- **Purpose:** Publish an approved review (`approved → published`) — making it public and feeding Buyer-Feedback performance — or remove a review (`→ removed`, soft-delete = hidden).
- **Aggregate Owner:** Public Review (BC-TRUST-5) — `public_reviews` (`status`; removed = hidden, soft-delete, Doc-2 §10.6).
- **Lifecycle References:** Doc-2 §3.6/§10.6 — `approved → published | removed`.
- **Permission References:** Doc-2 §7 platform-staff (review lifecycle); dedicated slug beyond §7 → `[ESC-TRUST-SLUG]`.
- **Event References:** Doc-2 §8 — none cross-module; **on publish, invoke the BC-TRUST-3 performance-input ingestion service** (B.9b) to append the Buyer-Feedback input (in-module, **not** a cross-module event).
- **Audit References:** Doc-2 §9 Reviews "publish", "remove".
- **Dependency References:** **Intra-module (B.9b):** `trust.ingest_performance_input.v1` (BC-TRUST-3) on publish — Path B Buyer-Feedback. DG-2 (Marketplace displays published reviews via service — never table access); DG-8 (audit).
- **Notes:** Ownership-safe — **BC-TRUST-5 does NOT write `performance_inputs`; it invokes the BC-TRUST-3 ingestion service** (Doc-4G Structure FROZEN F4G-M2). Dual-path-safe — this is Path B (vs Path A `BuyerFeedbackRecorded`/Operations); both feed the same component, de-dup at computation (F4G-M3). Marketplace displays via service only (Doc-2 §10.6).

#### `trust.set_admin_rating.v1` — Set Admin Rating (internal-only) · 21.6 Admin · Actor: Admin

- **Contract ID:** `trust.set_admin_rating.v1`
- **Contract Name:** Set Admin Rating (internal staff rating)
- **Type:** 21.6 Admin
- **Purpose:** Record an internal-only staff rating of a vendor; never public, never tenant-visible.
- **Aggregate Owner:** Admin Rating (BC-TRUST-5) — `admin_ratings` (AR); `vendor_profile_id, rated_by` (Doc-2 §10.6).
- **Lifecycle References:** Doc-2 §3.6 — simple (no multi-state machine).
- **Permission References:** Doc-2 §7 platform-staff (`staff_can_verify`/`staff_super_admin` per role seed); dedicated admin-rating slug → `[ESC-TRUST-SLUG]`.
- **Event References:** Doc-2 §8 — none; no event coined.
- **Audit References:** admin-rating set not separately enumerated in Doc-2 §9 → carry `[ESC-TRUST-AUDIT]` (nearest §9 by pointer; no audit action invented).
- **Dependency References:** DG-1 (staff identity); DG-8 (audit).
- **Notes:** Non-disclosure-safe — `admin_ratings` are **internal-only, never public, never cross-tenant** (Doc-2 §3.6); soft-delete supported (Doc-2 §10.6 SD=YES). Firewall-safe — admin ratings are not a platform score and never mutate one.

#### `trust.get_review.v1` · `trust.list_reviews.v1` · `trust.list_admin_ratings.v1` — Review/Rating Reads · 21.3 Query · Actor: User / Admin / internal-service

- **Contract ID:** `trust.get_review.v1` · `trust.list_reviews.v1` · `trust.list_admin_ratings.v1`
- **Contract Name:** Review & Admin-Rating Reads
- **Type:** 21.3 Query
- **Purpose:** Read a published review / list published reviews for a vendor (public via service) and list admin ratings (staff-only).
- **Aggregate Owner:** Public Review + Admin Rating (BC-TRUST-5) — read-only.
- **Lifecycle References:** Doc-2 §3.6/§10.6 (published reviews public; admin ratings internal).
- **Permission References:** published reviews public read (service projection); `admin_ratings` staff-only (`staff_can_verify`).
- **Event References:** none (reads).
- **Audit References:** none (reads not audited).
- **Dependency References:** DG-2 (Marketplace displays published reviews via service — never table access); DG-8.
- **Notes:** Non-disclosure-safe — admin ratings never surface to tenants; only `published` reviews are public; Marketplace reads via service only (Doc-2 §10.6).

---

## §G9 — Integration Surface (Pass-A consolidation)

Trust authors its own **commands** (emit side) and its own **consumer effects** on its own entities (single-authorship, Doc-4A §4.4). It instantiates **no 21.2 Integration template** — the event-delivery integration contract belongs to the emitting module. Inbound: Trust consumes the five Operations performance-input events and the RFQ `QuotationSubmitted` into `performance_inputs` (via `trust.ingest_performance_input.v1`), and consumes Marketplace `VendorOwnershipTransferred` as a Trust-Protection freeze trigger. Outbound: Trust emits the six Doc-2 §8 Trust events via Doc-4B outbox-write; Marketplace/RFQ/Communication consume them and author their own effects. All cross-module identifiers are bare UUIDs, service-validated (B.3); all `core.*` services (audit/outbox/human-ref/POLICY/flags) are consumed from Doc-4B and re-implemented by none (DG-8).

## §G10 — Event & Dependency Map (Pass-A consolidation)

**Produced (Doc-2 §8 Trust catalog; emitter Trust; each consumer owns its own effect):**

| Event | Emitting contract / BC | Primary consumers (own their effect) |
|---|---|---|
| `VendorVerified` | `trust.decide_verification.v1` / BC-TRUST-1 | Marketplace (verified-status reflect), RFQ (eligibility refresh), Communication (fan-out, DG-6), analytics |
| `VendorTierChanged` `tier_type='verified'` | `trust.set/confirm/downgrade/suspend/expire_verified_tier.v1` / BC-TRUST-1 | Marketplace (writes `financial_tier_history` + read-model — Trust never writes it), RFQ (matching refresh), Communication (DG-6) |
| `TrustScoreUpdated` | `trust.compute_trust_score.v1` / BC-TRUST-2 | Marketplace (`vendor_matching_attributes` rebuild, directory re-rank), RFQ (matching refresh), Communication (DG-6) |
| `PerformanceScoreUpdated` | `trust.compute_performance_score.v1` / BC-TRUST-3 | Marketplace (read-model rebuild), RFQ (matching refresh), Communication (DG-6) |
| `PerformanceReviewTriggered` | `trust.trigger_performance_review.v1` / BC-TRUST-3 | Communication (fan-out, DG-6), analytics |
| `PerformanceFrozen` | `trust.freeze_performance_score.v1` / BC-TRUST-3 | Marketplace (read-model rebuild), RFQ (matching refresh), Communication (DG-6) |

**Consumed (Doc-2 §8, other modules; Trust owns the `performance_inputs`/freeze effect):**

| Event | Producer | Consuming contract / effect |
|---|---|---|
| `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` | Operations (Doc-4F) | `trust.ingest_performance_input.v1` → `performance_inputs` (delivery/completion/dispute/feedback) |
| `QuotationSubmitted` | RFQ (Doc-4E) | `trust.ingest_performance_input.v1` → `performance_inputs` (response leg) |
| `VendorOwnershipTransferred` | Marketplace (Doc-4D) | `trust.freeze_*_score.v1` (Trust-Protection freeze trigger) |

**Non-events (Doc-2 §8):** invitation `decline`/`non_response` (Doc-2 §10.6 source-ref-derived; `non_response` is an absence — no event, none invented); within-Trust published-review Buyer-Feedback feed (in-module ingestion-service call, B.9b); fraud-signal lifecycle and admin-rating set (no §8 event).

**Dependencies:** DG-1 Identity · DG-2 Marketplace · DG-3 RFQ · DG-4 Operations · DG-5 Admin · DG-6 Communication · DG-7 Billing · DG-8 Platform Core — each directional and ownership-safe (Appendix C; Doc-4G Structure FROZEN §G8/§G15).

## §G11 — Authorization Surface (Pass-A consolidation)

Tenant write actions check **Membership + Slug + Scope** (Doc-4A §6); platform-staff actions check a **platform-staff slug** (§5.6, no active-org context). Doc-2 §7 slugs used: `can_submit_verification` (verification submission, Owner-only), `can_submit_review` (post-award review, engagement required), `staff_can_verify` (verification decisions, verified-tier, review moderation/lifecycle, history reads, freeze governance), `staff_can_ban` (fraud triage, ban-driven revoke/freeze). **Score computation runs under the System actor — no tenant slug** (auto-calculated, never hand-edited, Doc-4A §5.2). Trust **consumes** Identity `check_permission` + active-org resolution (Doc-4C, FROZEN — DG-1); it implements no shadow authorization. Where a required staff action lacks a §7 slug (e.g., a dedicated review-moderation, score-freeze, or admin-rating slug), carry **`[ESC-TRUST-SLUG]`** — **no slug invented**.

## §G12 — Audit Surface (Pass-A consolidation)

Audited mutations bind to the Doc-2 §9 **Trust** domain (verification request/decision/revoke/expiry; trust/performance freeze + reactivation; recalculation; formula version change; admin tier override) and **Reviews** domain (review submit, moderation decision, publish, remove) via Doc-4B `core.append_audit_record.v1` (in-transaction; actor attribution User/Admin/System). **Reads are not audited** (Doc-4A §17.1). Performance-input corrections are audited (Doc-2 §3.6). Mutations whose audit action is **not separately enumerated in Doc-2 §9** carry **`[ESC-TRUST-AUDIT]`** (interim: nearest §9 action by pointer; channel: Doc-2 §9 additive; **no audit action invented**): fraud-signal create/review/action/dismiss; verified-tier status transitions (set/confirm/downgrade/suspend/expire) beyond "admin tier override"; admin-rating set; performance-input ingestion rows; verification assignment.

## §G13 — AI-Agent Implementation Considerations (Pass-A consolidation)

Every contract states ownership/authority/lifecycle/audit/event by pointer; Pass-B authors instantiate schemas/validation/errors/idempotency against these. Determinism rules: (1) **scores are System-actor, never hand-edited** — only `performance_inputs`/underlying data corrected (audited); (2) **`performance_inputs` has one writer** (`trust.ingest_performance_input.v1`); BC-TRUST-5 invokes it, never writes directly (F4G-M2); (3) **BC-TRUST-2 reads its inputs read-only** via same-module read-services (F4G-MA2) — never mutating BC-TRUST-1/3/4; (4) **Buyer-Feedback has two distinct source paths** (A `BuyerFeedbackRecorded`/Operations; B `public_reviews`/BC-TRUST-5), de-dup at computation (F4G-M3); (5) `non_response` is a §10.6-derived absence — **never invent** an event or POLICY key; (6) **firewall** — Financial Tier/Buyer-Vendor-Status/paid plans never feed any score, eligibility, routing, or matching; (7) **moat** — Trust makes no matching/routing/ranking/evaluation/selection/award decision; (8) never coin an entity/event/slug/audit-action/POLICY-key/template — escalate via DG-* / `[ESC-TRUST-AUDIT]` / `[ESC-TRUST-POLICY]` / `[ESC-TRUST-SLUG]`.

---

## Appendix A — Module 5 Contract Inventory (Pass-A)

| # | Contract-ID | Capability | Template | Owned aggregate/entity | Actor | BC / §G | Authoritative source |
|---|---|---|---|---|---|---|---|
| 1 | `trust.request_verification.v1` | Open verification case | 21.4 | Verification Case (`verification_records`) | User | BC-TRUST-1/§G4 | Doc-2 §5.6; §10.6 |
| 2 | `trust.assign_verification.v1` | Assign case → in_review | 21.6 | Verification Case | Admin | BC-TRUST-1/§G4 | Doc-2 §5.6 |
| 3 | `trust.decide_verification.v1` | Verification decision | 21.6 | Verification Case (`verification_records`,`verification_decisions`) | Admin | BC-TRUST-1/§G4 | Doc-2 §5.6; §10.6; PATCH-01 |
| 4 | `trust.revoke_verification.v1` | Revoke (fraud/compliance) | 21.6 | Verification Case | Admin | BC-TRUST-1/§G4 | Doc-2 §5.6 |
| 5 | `trust.expire_verification.v1` | Expire (lapse/doc expiry) | 21.5 | Verification Case | System | BC-TRUST-1/§G4 | Doc-2 §5.6; §10.6 |
| 6 | `trust.set_verified_tier.v1` / `confirm` / `downgrade` | Verified-tier establish/adjust | 21.6 | Verified Financial Tier (`verified_financial_tiers`) | Admin | BC-TRUST-1/§G4 | Doc-2 §3.6/§10.6; PATCH-01 |
| 7 | `trust.suspend_verified_tier.v1` / `expire_verified_tier.v1` | Verified-tier suspend/expire | 21.6 / 21.5 | Verified Financial Tier | Admin / System | BC-TRUST-1/§G4 | Doc-2 §3.6/§10.6 |
| 8 | `trust.get_verification.v1` / `list_verifications.v1` / `get_verified_tier.v1` | Verification/tier reads | 21.3 | Verification Case; Verified Financial Tier | Admin/internal-service | BC-TRUST-1/§G4 | Doc-2 §6/§10.6 |
| 9 | `trust.compute_trust_score.v1` | Compute/recalc trust score | 21.5 | Trust Score (`trust_scores`,`trust_score_history`) | System | BC-TRUST-2/§G5 | Doc-2 §3.6/§10.6; Arch §1.5 |
| 10 | `trust.freeze_trust_score.v1` / `reactivate_trust_score.v1` | Trust-score freeze/reactivate | 21.6 | Trust Score | Admin | BC-TRUST-2/§G5 | Doc-2 §3.6/§10.6 |
| 11 | `trust.get_trust_score.v1` / `list_trust_score_history.v1` | Trust-score reads | 21.3 | Trust Score | internal-service/Admin | BC-TRUST-2/§G5 | Doc-2 §3.6/§10.6 |
| 12 | `trust.ingest_performance_input.v1` | Performance-input ingestion (sole writer) | 21.5 | Performance Score (`performance_inputs`) | System/internal-service | BC-TRUST-3/§G6 | Doc-2 §8; §10.6 |
| 13 | `trust.compute_performance_score.v1` | Compute performance score | 21.5 | Performance Score (`performance_scores`,`performance_score_history`) | System | BC-TRUST-3/§G6 | Doc-2 §3.6/§10.6 |
| 14 | `trust.freeze_performance_score.v1` / `reactivate_performance_score.v1` | Perf-score freeze/reactivate | 21.6 | Performance Score | Admin | BC-TRUST-3/§G6 | Doc-2 §3.6/§10.6 |
| 15 | `trust.trigger_performance_review.v1` | Trigger performance review | 21.5 | Performance Score | System | BC-TRUST-3/§G6 | Doc-2 §3.6/§10.6 |
| 16 | `trust.get_performance_score.v1` / `list_performance_inputs.v1` / `list_performance_score_history.v1` | Performance reads | 21.3 | Performance Score | internal-service/Admin | BC-TRUST-3/§G6 | Doc-2 §3.6/§10.6 |
| 17 | `trust.create_fraud_signal.v1` | Create fraud signal | 21.6 / 21.5 | Fraud Signal (`fraud_signals`) | Admin / System | BC-TRUST-4/§G7 | Doc-2 §3.6/§10.6 |
| 18 | `trust.review_fraud_signal.v1` / `action` / `dismiss` | Fraud triage | 21.6 | Fraud Signal | Admin | BC-TRUST-4/§G7 | Doc-2 §3.6/§10.6 |
| 19 | `trust.get_fraud_signal.v1` / `list_fraud_signals.v1` | Fraud reads | 21.3 | Fraud Signal | Admin | BC-TRUST-4/§G7 | Doc-2 §3.6/§10.6 |
| 20 | `trust.submit_review.v1` | Submit public review | 21.4 | Public Review (`public_reviews`) | User | BC-TRUST-5/§G8 | Doc-2 §3.6/§10.6 |
| 21 | `trust.moderate_review.v1` | Moderate review | 21.6 | Public Review | Admin | BC-TRUST-5/§G8 | Doc-2 §3.6/§10.6 |
| 22 | `trust.publish_review.v1` / `remove_review.v1` | Publish/remove review (+ Path-B feed) | 21.6 | Public Review | Admin | BC-TRUST-5/§G8 | Doc-2 §3.6/§10.6; F4G-M2/M3 |
| 23 | `trust.set_admin_rating.v1` | Set admin rating (internal) | 21.6 | Admin Rating (`admin_ratings`) | Admin | BC-TRUST-5/§G8 | Doc-2 §3.6/§10.6 |
| 24 | `trust.get_review.v1` / `list_reviews.v1` / `list_admin_ratings.v1` | Review/rating reads | 21.3 | Public Review; Admin Rating | User/Admin/internal-service | BC-TRUST-5/§G8 | Doc-2 §3.6/§10.6 |

*Skeleton inventory — working contract names (Doc-4A §21 namespace `trust_`); Pass-B finalizes per-Contract-ID payloads, validation order, error codes, idempotency, and any contract split. No contract instantiated beyond this Pass-A record.*

---

## Appendix B — Conformance Binding Map (Pass-A)

| §G section | Governing Doc-4A standard(s) | Consumed frozen services / read-models |
|---|---|---|
| §G4 verification & verified tier | §21.4/§21.6/§21.5/§21.3, §13 (state), §17 (audit), §16 (events) | Doc-4B audit/outbox/human-ref (DG-8); Doc-4C `check_permission`/staff slugs (DG-1); Doc-4D declared-tier/vendor-profile reference (DG-2) |
| §G5 trust scoring | §21.5/§21.6/§21.3, §4B (firewall), §5.2 (System actor), §16, §17 | intra-module read-services (B.9a); Doc-4B outbox/audit (DG-8) |
| §G6 performance scoring | §21.5/§21.6/§21.3, §4B (firewall), §14 (idempotent consumer, applied Pass-B), §16, §17 | Operations events (DG-4); RFQ `QuotationSubmitted` + source refs (DG-3); Doc-4B outbox/audit (DG-8) |
| §G7 fraud & risk | §21.6/§21.5/§21.3, §7.5 (non-disclosure), §17 | Admin ban management (DG-5); Doc-4B audit (DG-8) |
| §G8 reviews & admin ratings | §21.4/§21.6/§21.3, §6 (authz), §7.5 (non-disclosure), §17 | Operations engagement reference (DG-4); intra-module ingestion service (B.9b); Marketplace display service (DG-2); Doc-4B audit (DG-8) |
| §G9–§G13 cross-cutting | §4/§4.4 (single-authorship), §5/§6, §16/§17, Appendix A/B | Doc-4B/Doc-4C/Doc-4D (consumed) |

Doc-4G redefines none of the above; all bindings are by pointer.

---

## Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers (UNCHANGED)

DG-1 (Identity), DG-2 (Marketplace vendor-data / declared-tier / moat-adjacent display), DG-3 (RFQ matching/award — moat seam; signals published, refs read-only), DG-4 (Operations post-award events + engagement reference), DG-5 (Admin ban management consumes fraud/verification outputs), DG-6 (Communication single-authorship fan-out), DG-7 (Billing entitlement firewall — no plan gates any signal), DG-8 (Platform Core). Inbound carried dependencies now owned here: DC-2 (Identity org/vendor verification = Trust submission boundary), DD-1 (Marketplace vendor verification = Trust contract boundary), DD-2 (matching/routing = RFQ; Trust owns the signals, not matching), DF-4 (Operations emits performance inputs; Trust consumes). Escalation markers: `[ESC-TRUST-AUDIT]` (Doc-2 §9 additive — fraud-signal lifecycle, verified-tier status transitions, admin-rating set, performance-input rows, verification assignment), `[ESC-TRUST-POLICY]` (Doc-3 §12.2 additive — trust/performance formula thresholds & weights, review cadence, freeze/review windows; reference an existing key by name, else carry — never invent), `[ESC-TRUST-SLUG]` (Doc-2 §7 additive — any required staff action lacking a §7 slug). **Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen any frozen module.

---

## Appendix D — Cross-Reference Index (Pass-A)

| Binding point | Authoritative source |
|---|---|
| Verification state machine | Doc-2 §5.6 (`requested→in_review→approved/rejected`, `→requested`, `approved→expired/revoked`) |
| Verified-tier / score / fraud / review lifecycles | Doc-2 §3.6 + §10.6 (`pending_verification→verified→suspended/expired`; trust `computed/frozen`; performance `not_rated→computed/frozen`; `performance_inputs` append-only; fraud `open→reviewed→actioned/dismissed`; review `submitted→approved→published/rejected/removed`; admin rating simple) |
| Aggregates / entities | Doc-2 §2 (Module 5), §3.6, §10.6 |
| Permissions | Doc-2 §7 (`can_submit_verification`, `can_submit_review`, `staff_can_verify`, `staff_can_ban`) |
| Events | Doc-2 §8 (Trust catalog: `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen`; consumed Operations five + RFQ `QuotationSubmitted` + Marketplace `VendorOwnershipTransferred`) |
| Audit actions | Doc-2 §9 (Trust + Reviews domains) |
| POLICY keys | Doc-3 §12.2 (RFQ-side consumption: `tier.use_verified_when_present`, verification value-band thresholds); Trust scoring/cadence/window keys absent → `[ESC-TRUST-POLICY]` |
| Tier-without-ownership rule | Architecture Patch v1.0.1 PATCH-01 (verified tier validates declared without owning it) |
| Governance-signal firewall | Architecture §1.5 + Invariant 6 (five firewalled dimensions); Doc-3 §11.8/§12.1 FIXED |
| Standards / templates | Doc-4A v1.0 §4/§4.4/§4B/§5/§5.2/§6/§7/§7.5/§8/§13/§16/§17/§21 |
| Consumed services | Doc-4B (audit/outbox/UUIDv7/human-ref/POLICY/flags), Doc-4C (`check_permission`/staff slugs), Doc-4D (declared-tier/vendor-profile reference + display service) |
| Structure baseline | `Doc-4G_Structure_v1.0_FROZEN` (§G1–§G17; F4G-MA1/MA2/M1/M2/M3/N1 incorporated) |

---

*End of Doc-4G — Trust & Verification Engine — Pass-A Content v1.0. Module 5 (`trust` schema, `trust_` namespace) contract inventory: 24 contract records across BC-TRUST-1…5 (Verification & Verified Tier · Trust Scoring · Performance Scoring · Fraud & Risk Signals · Reviews & Admin Ratings), 7 aggregates each in exactly one context. Commands/queries with ownership and pointer-only references (lifecycle Doc-2 §5.6/§3.6; permissions Doc-2 §7; events Doc-2 §8; audit Doc-2 §9; POLICY Doc-3 §12.2); no request/response schema, validation matrix, error matrix, or idempotency rule (Pass-B). Trust firewall preserved (sole score authority; Financial Tier/Buyer-Vendor-Status/paid-plan never feed a score; scores System-actor auto-calculated); procurement moat preserved (no matching/routing/ranking/evaluation/selection/award; RFQ ownership intact); `performance_inputs` single-writer; Buyer-Feedback dual-path distinguished; escalation markers `[ESC-TRUST-AUDIT]`/`[ESC-TRUST-POLICY]`/`[ESC-TRUST-SLUG]` carried; nothing invented; no corpus conflict; no flag-and-halt. Next: Doc-4G Pass-B.*
