# Doc-4E — RFQ Procurement Engine — API & Integration Contracts — Pass-A APPROVED v1.0 (Authoritative Baseline)

| Field | Value |
|---|---|
| Document | Doc-4E — **Pass-A APPROVED v1.0** (authoritative Pass-A baseline) for Module 3 — RFQ Procurement Engine (`rfq` schema) — **the procurement moat** |
| Status | **Pass-A APPROVED — authoritative baseline** (`Doc-4E_Content_v1.0_PassA.md` as amended by `Doc-4E_PassA_Patch_v1.0.md`). Authorized next stage: **Pass-A Freeze Audit.** |
| Structure authority | `Doc-4E_Structure_v1.0_FROZEN.md` (sole structure authority; §E0–§E14) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (`…v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`), Doc-3 v1.0.2 (`…v1.0.1.md` + `Doc-3_Patch_v1.0.2.md` + `Doc-3_Policy_Key_Registration_Patch_v1.0.md`), Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0 — all FROZEN |
| Pass-A depth | Per contract: Purpose · Ownership · Actor Types · Preconditions · High-Level Request Schema · High-Level Response Schema · State-Machine Dependencies · Authorization Dependencies · Audit Dependencies · Event Dependencies · Cross-Module Dependencies · Error Categories · AI-Agent Implementation Notes. **High-level only** — field-level payloads, validation rules, and business logic are Pass-B / development-document scope. |
| Audience | Doc-4E content-pass authors; Claude Code / Cursor / backend / frontend / QA / AI coding agents |

**Pass-A baseline scope.** This document is the approved contract surface of Module 3 against the frozen structure: it names each contract, binds it to a Doc-4A §21 template, fixes its ownership/actor/authorization/state/audit/event/cross-module pointers, and gives high-level request/response shapes and error categories. It **does not** author field-level payloads, validation order, or business rules (Pass-B), and it **redesigns nothing**. Every binding is by pointer to the frozen corpus; **no entity, state, transition, permission slug, event, audit action, POLICY key, or template is invented.** Carried dependencies **DE-1…DE-8**, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]` are referenced by name only and **never resolved here**.

**Reading note.** Operational rules (gates, pipeline order, fairness, capacity, distribution, scoring, quotation, evaluation, abuse) are owned by **Doc-3 v1.0.2** and bound by pointer; this document encodes them as **contract obligations**, never re-derives them. On any conflict with a higher/frozen document: **flag-and-halt** (Doc-4A §0.6) — none was encountered in this pass.

---

## Pass-A Approval Statement

| Field | Value |
|---|---|
| **Pass-A Status** | **APPROVED** |
| **Approval basis** | Hard Review completed · Patch applied (`Doc-4E_PassA_Patch_v1.0`) · Patch Verification passed |
| **Open findings** | BLOCKER = 0 · MAJOR = 0 · MINOR = 0 |
| **Authoritative baseline** | `Doc-4E_Content_v1.0_PassA.md` as amended by `Doc-4E_PassA_Patch_v1.0.md`, re-issued as this document |
| **Authorized next stage** | **Pass-A Freeze Audit** |
| **Carried forward (unchanged; resolved only via named channels)** | DE-1…DE-8; `[ESC-RFQ-AUDIT]`; `[ESC-RFQ-POLICY]` |

---

## §B — Pass-A Cross-Cutting Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3) and avoid duplication, the following apply to **every** contract; per-contract records cite specifics and reference these by pointer.

- **B.1 — Contract-ID & templates (Doc-4A §21).** Contract-ID `rfq.<operation>.v1` (prefix = schema `rfq`; Appendix B namespace `rfq_`). Templates: **21.3 Query** (reads), **21.4 Command** (mutations/state-transitions), **21.6 Admin** (platform-staff; no active org context, §5.6 — moderation), **21.5 System** (`Response: none` — Phase-2 timers/sweeps: validity clock, matching pipeline execution, replenishment checks, deferred-queue drain, and inbound event-consumer effects). **Template 21.2 (Integration) is NOT instantiated here** — per Doc-4A §4.4 the event-delivery integration contract is authored by the **emitting** module; RFQ authors its own command (emit) and its consumer effects on its own entities (single-authorship). No template invented.
- **B.2 — Actor types (Doc-4A §5; Doc-2 §9 actor set User|Admin|System|AI Agent).** **User** (tenant member in a server-validated active-org context, §5.3 — buyer controlling org for RFQ-owned data; vendor controlling org for quotation-owned data); **Admin** (platform-staff, no active org context, §5.6 — RFQ moderation); **System** (Phase-2 timers/pipeline and inbound event consumers — validity clock, routing pipeline, replenishment, deferred-queue drain); **internal-service** (synchronous cross-module reads consumed, e.g., Marketplace `vendor_matching_attributes`, Operations CRM status, Billing quota). No actor category invented.
- **B.3 — Identifiers (Doc-4A §8; Doc-2 §0.1).** UUIDv7 is the only canonical machine ID; `rfqs`, `quotations`, and engagement/document references carry `human_ref` (display/lookup; allocated via Doc-4B `core.allocate_human_reference.v1`). Cross-module references (`vendor_profile_id`, `controlling_organization_id`, `buyer_organization_id`, `rfq_version_id`, `invitation_id`, `category_id`) are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3, §10.11).
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B). **Slugs only** (§6.2), from the Doc-2 §7 catalog; **no slug invented**. RFQ **consumes** Identity's `check_permission` and org/membership/active-org resolution (Doc-4C §C3/§C8, FROZEN) and the §6B **delegation grant** path for a representative org acting for a vendor profile it does not control (quotation/response) — **no shadow authorization** implemented. Buyer-side write scope = the **buyer controlling organization** of the target `rfqs` row; vendor-side write scope = the **controlling organization** of the quoting `vendor_profiles`.
- **B.5 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Audited mutations bind to the **Doc-2 §9 RFQ** and **Quotation** domains by pointer (attribution: User/Admin per actor, system for System; mutation-scope = the `rfq.*` table; written in-transaction via the Doc-4B mechanism, never re-implemented). **Reads are not audited** (§17.1). A mutation whose audit action is **not separately enumerated in Doc-2 §9** carries **`[ESC-RFQ-AUDIT]`** (interim: nearest §9 action by pointer; channel: Doc-2 §9 additive; **no audit action invented**) — specifically the `under_review→draft` moderation-reject, the `matching→expired` coverage-exhausted expiry, incremental-rematch routing-log entries, and `buyer_directed` invitation creation.
- **B.6 — Events (Doc-2 §8 via Doc-4B outbox-write).** Emitted events are **only** those in the Doc-2 §8 RFQ catalog (`RFQCreated`, `RFQSubmitted`, `RFQApproved`, `RFQMatched`, `RFQRouted`, `VendorInvited`, `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected`, `RFQClosedWon`, `RFQClosedLost`), written transactionally via Doc-4B `core.write_outbox_event.v1` (business write + event insert one transaction); **no event coined** (§16.4). `VendorInvited` fires **only** on transition to `delivered`. Inbound consumer effects bind to Doc-2 §8 events emitted by **other** modules (Marketplace `VendorClaimed`/`VendorSuspended`/`VendorTierChanged[declared]`/`VendorOwnershipTransferred`; Trust `VendorVerified`/`VendorTierChanged[verified]`/`TrustScoreUpdated`/`PerformanceScoreUpdated`; Admin `VendorBanned`); the delivery integration is the emitter's (§4.4). **Non-events (Doc-2 §8):** RFQ cancellation and quotation revision have **no** domain event — bound as §5.4/§5.5 transitions + §9 audit actions only.
- **B.7 — Governance-signal firewall (Doc-4A §4B / §18.3; Doc-3 §11.8/§12.1 FIXED).** RFQ **reads** governance signals as gate/scoring inputs (verified tier, trust band, performance score — Trust; declared tier, capability, capacity, category — Marketplace; Buyer-Vendor Status — Operations, buyer-scoped) and **never mutates one signal from another, and never lets any paid plan / entitlement / flag gate eligibility, verification, routing fairness, or matching confidence** (§4B). Per-contract firewall notes appear where a contract consumes a signal (matching, selection) or reads quota/entitlement (quotation submit, distribution ceiling). The **non-disclosure invariant** (blacklist/deferral/Buyer-Vendor-Status indistinguishable from non-match) binds every routing/eligibility/comparison surface (Doc-4A §7.5; Doc-2 §10.11).
- **B.8 — AI-agent source rule.** Every contract record states its **ownership / authority / lifecycle / audit / event source** by pointer, so Claude Code / Cursor / backend / frontend / QA implement without architectural assumptions. Global constraints: consume frozen Doc-4B/Doc-4C services and the Doc-4D read-model (never re-derive auth/membership/delegation/audit/vendor-attributes); honor the Doc-2 §5.4/§5.5 machines (incl. PATCH-D2-01/02 edges) verbatim; bind every operational rule to Doc-3 by pointer; never expose a protected fact (§7.5); never coin an entity/event/slug/audit-action/POLICY-key/template (escalate via DE / `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]`).

**Per-contract record shape (Pass-A).** Each contract below is recorded as: **Purpose · Ownership · Actor Types · Preconditions · Request (high-level) · Response (high-level) · State-Machine · Authorization · Audit · Events · Cross-Module · Error Categories · AI-Agent Notes.** Where several contracts share a lifecycle, they are grouped; each still carries its own record.

---

## §E0 — Governance & Scope (Pass-A consolidation)

Pass-A inherits the frozen §E0 ownership declaration and carried-marker register verbatim; no change. **Module 3 owns the `rfq` schema** (RFQ, Quotation, Comparison Statement, Routing Rule, Matching Result aggregates) and exposes contracts over those only. The precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E), the flag-and-halt obligation (§0.6), and the patch-based amendment rule apply. **Carried markers (referenced, never resolved): DE-1 (Identity), DE-2 (Marketplace vendor-data / moat seam), DE-3 (Trust signals/firewall), DE-4 (Operations CRM + post-award + vendor CRM), DE-5 (Admin moderation & ban), DE-6 (Communication single-authorship), DE-7 (Billing entitlement & quota/firewall), DE-8 (Platform Core); `[ESC-RFQ-AUDIT]`; `[ESC-RFQ-POLICY]`.**

---

## §E1 — Module Mission (Pass-A consolidation)

No contracts. Pass-A affirms the frozen mission: RFQ is the **matched-and-metered procurement engine and platform moat** — it sells matched, metered, high-intent leads (not exposure); it permanently balances buyer-outcome quality, vendor fairness, marketplace growth, and capacity utilization (Doc-3 §3.3 FIXED); and **no paid plan influences eligibility, scores, confidence, or the routing fairness ceiling** (Doc-3 §11.8/§12.1; Doc-4A §4B). Operating-stage behavior (Stage A→C, per-cell) is POLICY-bound (Doc-3 §0.1; Doc-4A §18B).

---

## §E2 — Ownership Model (Pass-A consolidation)

No standalone contracts; this section fixes the ownership pointers every contract cites. **Owned aggregates (Doc-2 §2 Module 3):** RFQ (`rfqs` + `rfq_versions`, `rfq_invitations`, `rfq_invitation_grantees`, `rfq_document_grants`, `rfq_routing_log`), Quotation (`quotations` + `quotation_versions`, `quotation_visibility`), Comparison Statement (`comparison_statements`), Routing Rule (`routing_rules`), Matching Result (`matching_results`). **Not owned (UUID/service/event only):** Identity (DE-1), Marketplace vendor data + `vendor_matching_attributes` (DE-2), Trust scores/verification (DE-3), Operations CRM/`engagements`/`vendor_leads` (DE-4), Admin moderation/`ban_actions` (DE-5), Communication fan-out (DE-6), Billing entitlement/quota (DE-7), `core.*` (DE-8). **Two non-RFQ-actor transitions** RFQ surfaces but does not decide: moderation pass/reject (Admin actor — DE-5) and system-actor expiry (validity clock + coverage-exhausted — Doc-2 §5.4).

---

## §E3 — Bounded Context Model (Pass-A grouping)

Pass-A groups contracts by the seven frozen bounded contexts, placed per the frozen BC→section mapping: **BC-1 → §E4** (RFQ Authoring & Lifecycle), **BC-2 → §E5** (Eligibility & Matching Pipeline), **BC-3 → §E6** (Routing/Selection & Distribution), **BC-4 → §E7** (Quotation Management), **BC-5 → §E8** (Buyer Evaluation & Comparison), **BC-6 → §E8** (Procurement Decision & Closure, absorbed), **BC-7 → §E6** (Routing Governance & Control Plane). Each contract below lands in exactly one bounded context. Cross-cutting surfaces are consolidated in §E9 (Integration), §E10 (Events), §E11 (Authorization), §E12 (Audit), §E13 (AI-agent).

---

## §E4 — RFQ & Quotation Lifecycle Contracts (BC-1; RFQ aggregate)

> Binds Doc-2 §5.4 (RFQ machine, incl. `Doc-2_Patch_v1.0.3` PATCH-D2-01/02) and Doc-3 §1. Quotation lifecycle contracts live in §E7 (BC-4); this section owns the RFQ head/version/lifecycle and the system-actor transitions. Error categories use the Doc-4A §12 closed class set with `rfq_`-prefixed codes (Pass-B assigns exact codes).

#### `rfq.create_rfq.v1` — Create RFQ (draft) · 21.4 Command · Actor: User

- **Purpose:** Create an RFQ in `draft` (deliberately permissive — friction at draft kills demand, Doc-3 §1.2 draft).
- **Ownership:** owner = RFQ (Module 3); `rfqs` (AR) + initial `rfq_versions` row. Buyer controlling org = creator's active org.
- **Actor Types:** User (buyer member, active-org context §5.3).
- **Preconditions:** active membership; `can_create_rfq`; category exists (leaf or any level, Doc-3 §1.3). No submission-gate validation at draft.
- **Request (high-level):** category reference (UUID), `work_nature` set, draft scope/spec attachment refs, estimated value (amount+BDT), delivery geography, routing mode — high-level only; field rules Pass-B.
- **Response (high-level):** created `rfq_id` (UUIDv7), `human_ref`, state `draft`, `reference_id` (Doc-4A §22.1 C-05).
- **State-Machine:** creates `rfqs` at `draft` (Doc-2 §5.4 entry).
- **Authorization:** §6 three-layer; `can_create_rfq` (Doc-2 §7); scope = buyer active org.
- **Audit:** yes → Doc-2 §9 RFQ "create" (via Doc-4B `core.append_audit_record.v1`).
- **Events:** `RFQCreated` (Doc-2 §8) via Doc-4B outbox-write.
- **Cross-Module:** allocate `human_ref` via Doc-4B `core.allocate_human_reference.v1` (DE-8); category reference validated against Marketplace by service (DE-2, read-only).
- **Error Categories:** VALIDATION (malformed input), AUTHORIZATION, REFERENCE (category not found — service-validated), SYSTEM.
- **AI-Agent Notes:** draft is permissive; do **not** enforce the submission FIXED-set here (that is `submit_rfq`). Category is a Marketplace reference (UUID), never re-modeled (DE-2).

#### `rfq.update_rfq.v1` — Edit RFQ (versioning) · 21.4 Command · Actor: User

- **Purpose:** Edit an RFQ; pre-quote edits create a new `rfq_versions` row with a revision reason; once any quotation exists, the prior version is immutable and the edit creates version X+1 (Doc-2 §5.4 guard; Doc-3 §1.2 `vendors_notified` buyer edits).
- **Ownership:** owner = RFQ; `rfqs` + `rfq_versions` (append; immutable-once-quoted).
- **Actor Types:** User (buyer; creator/authorized editor).
- **Preconditions:** active membership; `can_create_rfq` (edit authority within the buyer org); RFQ in an editable state (not terminal); version-immutability rule honored.
- **Request (high-level):** target `rfq_id`, changed fields, mandatory `revision_reason`.
- **Response (high-level):** new `rfq_version_id`, version number, `reference_id`.
- **State-Machine:** no RFQ state change by itself; may trigger re-notification + response-clock reset for un-responded invitees when material (Doc-3 §1.2; POLICY `rfq.edit_clock_reset` — `[ESC-RFQ-POLICY]` namespace, key exists in Doc-3 §12.2).
- **Authorization:** §6; `can_create_rfq` (Doc-2 §7).
- **Audit:** yes → Doc-2 §9 RFQ "edit (new version)".
- **Events:** none at edit (re-notification handled in routing/distribution, §E6; no event coined).
- **Cross-Module:** none direct (re-notification dispatch is Communication's via the routing event — DE-6).
- **Error Categories:** VALIDATION, AUTHORIZATION, STATE (terminal/locked version), CONFLICT (concurrent version), SYSTEM.
- **AI-Agent Notes:** never overwrite a quoted version (Doc-2 §5.4 immutability; CI trigger §10.11.6). Material-edit re-notification is a routing effect, not a new event.

#### `rfq.submit_rfq.v1` — Submit RFQ (→ approval or moderation) · 21.4 Command · Actor: User

- **Purpose:** Submit a draft through the submission gate; routes to `pending_internal_approval` if the org workflow requires approval, else to `submitted` (Doc-3 §1.2 draft exit).
- **Ownership:** owner = RFQ; `rfqs`.
- **Actor Types:** User (buyer). A holder of `can_approve_rfq` who submits self-approves in one step (recorded as creator+approver).
- **Preconditions:** state `draft`; submission FIXED-set satisfied (category active; `work_nature` non-empty; `estimated_value` > 0 BDT — Doc-2 §5.4 ASSUMPTION A-05; delivery ≥ district; routing mode; spec attachment or no-formal-spec flag with min scope — POLICY `rfq.min_scope_chars`); `can_create_rfq` (submit) or `can_approve_rfq`.
- **Request (high-level):** target `rfq_id`; optional approval-routing hint.
- **Response (high-level):** new state (`submitted` | `pending_internal_approval`), `reference_id`.
- **State-Machine:** `draft → submitted` or `draft → pending_internal_approval` (Doc-2 §5.4).
- **Authorization:** §6; `can_create_rfq` (Doc-2 §7); approval path uses `can_approve_rfq`.
- **Audit:** yes → Doc-2 §9 RFQ "submit".
- **Events:** `RFQSubmitted` (Doc-2 §8) on transition to `submitted` (drives moderation/matching). **Self-approval path (a submitter holding `can_approve_rfq`):** emits **`RFQSubmitted` + `RFQApproved`** (both existing Doc-2 §8 events) within the **same transaction** (creator and approver recorded as one actor, Doc-3 §1.2); no event invented.
- **Cross-Module:** none direct; downstream moderation is Admin (DE-5).
- **Error Categories:** VALIDATION (submission-gate failure), AUTHORIZATION, STATE (not `draft`), BUSINESS (org workflow), SYSTEM.
- **AI-Agent Notes:** the submission FIXED-set is enforced here, by pointer to Doc-3 §1.2 / Doc-2 §5.4; do not invent additional gates. `RFQSubmitted` fires only on the `submitted` branch.

#### `rfq.approve_rfq.v1` · `rfq.reject_internal_rfq.v1` — Internal Approval Decision · 21.4 Command · Actor: User

- **Purpose:** Org-internal approver approves (`→ submitted`) or rejects (`→ draft`, mandatory reason) a pending RFQ (Doc-3 §1.2 `pending_internal_approval`).
- **Ownership:** owner = RFQ; `rfqs`.
- **Actor Types:** User (buyer approver per the org approval chain).
- **Preconditions:** state `pending_internal_approval`; `can_approve_rfq`; approver in the configured chain (`organization_workflow_settings.approval_chain` — Identity/ORG, consumed).
- **Request (high-level):** `rfq_id`; decision; reject reason (mandatory on reject).
- **Response (high-level):** new state, `reference_id`.
- **State-Machine:** `pending_internal_approval → submitted` (approve) / `→ draft` (reject) (Doc-2 §5.4).
- **Authorization:** §6; `can_approve_rfq` (Doc-2 §7); ORG approval-chain rule (consumed from Identity).
- **Audit:** yes → Doc-2 §9 RFQ "internal approve/reject".
- **Events:** `RFQApproved` (Doc-2 §8) on approve; reject has no domain event (state + audit only — B.6).
- **Cross-Module:** approval-chain config is Identity/ORG (DE-1, consumed).
- **Error Categories:** AUTHORIZATION, STATE (not pending), VALIDATION (missing reject reason), BUSINESS (chain), SYSTEM.
- **AI-Agent Notes:** silence never auto-approves (Doc-3 §1.2 FIXED) — there is no timeout auto-approve path; reminders/escalation are notification effects (Communication, DE-6).

#### `rfq.moderate_rfq.v1` — Moderation Decision (pass / reject) · 21.6 Admin · Actor: Admin · *(platform governance)*

- **Purpose:** Platform moderation clears (`under_review → matching`) or rejects (`under_review → draft`) a submitted RFQ — the demand-side quality gate (Doc-3 §1.2; §10).
- **Ownership:** owner = RFQ (state transition); **moderation decision authority = Admin (DE-5)**.
- **Actor Types:** Admin (platform-staff, no active org context §5.6); or System per `moderation.mode` (auto-pass/auto-flag, Doc-3 §1.2).
- **Preconditions:** state `submitted`/`under_review`; `staff_can_moderate_rfq` (Doc-2 §7); for reject, mandatory structured reason `rfq_correction_required` (Doc-2 §5.4 PATCH-D2-01).
- **Request (high-level):** `rfq_id`; decision (pass/reject); reject reason code + free text.
- **Response (high-level):** new state (`matching` | `draft`), `reference_id`.
- **State-Machine:** `submitted → under_review → matching` (cleared) or **`under_review → draft`** (moderation reject; platform actor; Doc-2 §5.4 **PATCH-D2-01**).
- **Authorization:** §5.6 (no active org); `staff_can_moderate_rfq` (Doc-2 §7).
- **Audit:** yes → Doc-2 §9 RFQ "moderation pass/fail"; the **`under_review→draft` reject action** carries **`[ESC-RFQ-AUDIT]`** (nearest §9 "moderation pass/fail" by pointer; channel Doc-2 §9 additive; no action invented).
- **Events:** none defined in Doc-2 §8 for moderation (state + audit only — B.6); buyer notification is Communication's (DE-6).
- **Cross-Module:** moderation is Admin-owned (DE-5); buyer correction-required notification dispatched by Communication (DE-6).
- **Error Categories:** AUTHORIZATION, STATE (not in moderation), VALIDATION (missing reject reason), SYSTEM.
- **AI-Agent Notes:** buyers cannot trigger this; resubmission re-enters the submission gate (`submit_rfq`), never bypasses it (PATCH-D2-01 rule). Repeated rejects feed buyer abuse scoring (Doc-3 §10.2) — an analytics effect, not a state concern.

#### `rfq.cancel_rfq.v1` — Cancel RFQ · 21.4 Command · Actor: User

- **Purpose:** Buyer cancels an RFQ from any active state, mandatory audited reason (Doc-3 §1.2 cancelled).
- **Ownership:** owner = RFQ; `rfqs`.
- **Actor Types:** User (buyer).
- **Preconditions:** RFQ in any active (non-terminal) state; `can_cancel_rfq`; mandatory reason.
- **Request (high-level):** `rfq_id`; cancellation reason.
- **Response (high-level):** state `cancelled`, `reference_id`.
- **State-Machine:** `any active state → cancelled` (Doc-2 §5.4; terminal — never reopens).
- **Authorization:** §6; `can_cancel_rfq` (Doc-2 §7).
- **Audit:** yes → Doc-2 §9 RFQ "cancel".
- **Events:** **none** — RFQ cancellation has no Doc-2 §8 domain event (B.6 non-event); responded vendors' closure notification is Communication's (DE-6), triggered off the state change.
- **State-Machine (cascade):** on cancellation, open `submitted` quotations cascade `submitted → expired` (Doc-2 §5.5) and open invitations → `expired` (Doc-2 §3.4) within the same terminal-transition path; cascade is state + audit only (Doc-2 §9 invitation `InvitationExpired`); **no new event, no new audit action.**
- **Cross-Module:** Communication notifies already-responded vendors ("cancelled by buyer") (DE-6); habitual post-quote cancellation feeds buyer abuse score (Doc-3 §10.2).
- **Error Categories:** AUTHORIZATION, STATE (terminal), VALIDATION (missing reason), SYSTEM.
- **AI-Agent Notes:** do **not** coin an `RFQCancelled` event (verified absent from Doc-2 §8). Terminal — no reopen; recovery is re-issue (`reissue_rfq`).

#### `rfq.reissue_rfq.v1` — Re-issue RFQ (from prior) · 21.4 Command · Actor: User

- **Purpose:** Create a new RFQ pre-filled from a prior one (new identity, new version chain, fresh routing), recording `reissued_from` (Doc-3 §1.6; §9.4 split-award path).
- **Ownership:** owner = RFQ; new `rfqs` + `rfq_versions`.
- **Actor Types:** User (buyer).
- **Preconditions:** `can_create_rfq`; source RFQ readable; re-issue-from-`closed_won` block window honored for same scope (POLICY `rfq.reissue_won_block_days`) unless the engagement was cancelled (Doc-3 §1.6).
- **Request (high-level):** source `rfq_id`; overrides; routing mode.
- **Response (high-level):** new `rfq_id`, `human_ref`, state `draft`, `reissued_from` reference.
- **State-Machine:** new `rfqs` at `draft` (Doc-2 §5.4); no transition on the source (terminal state preserved).
- **Authorization:** §6; `can_create_rfq` (Doc-2 §7).
- **Audit:** yes → Doc-2 §9 RFQ "create" (the new RFQ); `reissued_from` recorded.
- **Events:** `RFQCreated` (Doc-2 §8) for the new RFQ.
- **Cross-Module:** Doc-4B `human_ref` allocation (DE-8).
- **Error Categories:** AUTHORIZATION, BUSINESS (reissue-won block window), REFERENCE (source not found), SYSTEM.
- **AI-Agent Notes:** re-issue is the **only** reopening mechanism (Doc-3 §1.6 FIXED); never transition a terminal RFQ back. Re-issue **creates a new RFQ** (new identity, new version chain, fresh routing) and records `reissued_from`; it **never reopens or mutates the source RFQ** — the source remains in its terminal state (the state history is evidence, Doc-3 §1.6).

#### `rfq.get_rfq.v1` · `rfq.list_rfqs.v1` · `rfq.get_rfq_version.v1` — RFQ Reads · 21.3 Query · Actor: User / internal-service

- **Purpose:** Read an RFQ head/version or list a buyer org's RFQs (own vs all-org per slug).
- **Ownership:** owner = RFQ; reads over `rfqs`/`rfq_versions`.
- **Actor Types:** User (buyer; vendor side only via materialized grantee rows after distribution); internal-service (composition).
- **Preconditions:** `can_view_rfq` (own-RFQ scope) or `can_view_all_rfqs` (all-org scope); vendor-side read requires an `rfq_invitation_grantees` row (post-distribution; Doc-2 §6/§10.4 RLS anchor).
- **Request (high-level):** `rfq_id` / filter+pagination (Doc-4A §22.3).
- **Response (high-level):** RFQ projection (state, version, scope per grant), list page; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** §6; `can_view_rfq` / `can_view_all_rfqs` (Doc-2 §7 — two distinct slugs); vendor-side scope = grantee row only.
- **Audit:** no (reads not audited, §17.1).
- **Events:** none.
- **Cross-Module:** none (vendor identity/org resolution consumed from Identity for grantee checks — DE-1).
- **Error Categories:** AUTHORIZATION, NOT_FOUND (collapse with no-access per §7.5 where the RFQ is not visible), VALIDATION (bad filter).
- **AI-Agent Notes:** there is **no public RFQ board** (Doc-3 §5.1 FIXED) — vendor reads are grant-scoped only; never expose an RFQ list to un-invited vendors; NOT_FOUND/no-access indistinguishable (§7.5).

#### `rfq.expire_rfq.v1` — RFQ Expiry (validity clock / coverage-exhausted) · 21.5 System · Actor: System

- **Purpose:** System-actor expiry with **two dispatch triggers within this one contract:** (1) **validity-clock lapse** from `vendors_notified`/`quotations_received`/`buyer_reviewing` (Doc-3 §1.4; Doc-2 §5.4 multi-source `→ expired`); (2) **coverage-exhausted** hold-bound in `matching` (reason `no_eligible_vendors_found`; Doc-3 §1.2 + `Doc-3_Patch_v1.0.2` PATCH-D3-05; Doc-2 §5.4 PATCH-D2-02). The contract dispatches on which precondition fired; both are system-actor, both terminal.
- **Ownership:** owner = RFQ; `rfqs`.
- **Actor Types:** System (Phase-2 timer / pipeline bound).
- **Preconditions:** validity window lapsed (from `vendors_notified`/`quotations_received`/`buyer_reviewing`), or `matching` hold-bound elapsed without a deliverable wave (POLICY `matching.empty_hold_days`).
- **Request (high-level):** none (timer/sweep; `Response: none` per 21.5).
- **Response (high-level):** none (system).
- **State-Machine:** `vendors_notified|quotations_received|buyer_reviewing → expired` (validity lapse, system actor); **`matching → expired`** (coverage exhausted; reason `no_eligible_vendors_found`; Doc-2 §5.4 **PATCH-D2-02**). Terminal.
- **Authorization:** system actor (no org context).
- **Audit:** yes → Doc-2 §9 RFQ "expire (system actor)"; the **`matching→expired` coverage-exhausted action** carries **`[ESC-RFQ-AUDIT]`** (nearest §9 "expire" by pointer; channel Doc-2 §9 additive).
- **Events:** none defined in Doc-2 §8 for expiry (state + audit only — B.6); buyer notification is Communication's (DE-6).
- **State-Machine (cascade):** on RFQ terminal expiry, open `submitted` quotations cascade `submitted → expired` (Doc-2 §5.5) and open invitations → `expired` (Doc-2 §3.4) within the same terminal-transition path — **no vendor performance penalty** (the buyer went silent, not the vendor — Doc-3 §1.2 expired FIXED). Cascade is state + audit only (invitation `InvitationExpired`, Doc-2 §9); **no new event, no new audit action.**
- **Cross-Module:** Communication notifies buyer honestly before/at expiry (DE-6); cell coverage recovery continues independently (Doc-3 §11.4).
- **Error Categories:** SYSTEM; STATE (idempotent no-op if already terminal).
- **AI-Agent Notes:** bound exactly to the two Doc-2 §5.4 system-actor edges; **no fake matching activity** ever shown (Doc-3 §1.2 FIXED). Idempotent (re-fire safe). Invitation expiry is **absorbed here** (RFQ-terminal cascade → invitations `expired`) and in `rfq.drain_deferred_queue.v1` (runway-starved deferred → `InvitationExpired`) — **no separate invitation-expiry contract** is created; `rfq_invitations` `→ expired` (Doc-2 §3.4) is a state+audit effect of these two contracts.

---

## §E5 — Eligibility & Matching Pipeline Contracts (BC-2; Matching Result aggregate)

> Binds Doc-3 §2 (eligibility), §3.1 (canonical pipeline Phase A–F), §6 (matching confidence). The pipeline runs **asynchronously** (Doc-3 §1.2 `matching`) — its contracts are predominantly **21.5 System** (internal execution / event-consumer) and **21.3 Query** (read `matching_results`). **FIXED:** phase order, gate-before-score, blacklist-before-everything, and no gate-failed vendor in any downstream artifact (non-disclosure). No matching/routing math is re-derived — Doc-3 §3/§6 owns it; these contracts encode the obligation only.

#### `rfq.run_matching_pipeline.v1` — Execute Eligibility & Matching Pipeline · 21.5 System · Actor: System

- **Purpose:** Run the canonical pipeline (Phase A hard gates → B geography → C scoring) for an RFQ version, producing `matching_results`; triggered on entry to `matching` (Doc-3 §3.1).
- **Ownership:** owner = RFQ; writes `matching_results` (derived/regenerable), reads `routing_rules`.
- **Actor Types:** System (async; backoff retry — POLICY `matching.max_retries`).
- **Preconditions:** RFQ in `matching`; current `rfq_version` valid; value present; window set; buyer org in good standing (Phase A0).
- **Request (high-level):** `rfq_id` + `rfq_version_id` (internal trigger; `Response: none` per 21.5).
- **Response (high-level):** none (system; writes `matching_results`, may emit `RFQMatched`).
- **State-Machine:** no RFQ transition on success by itself; on a deliverable wave the routing contract drives `matching → vendors_notified`; on hold-bound exhaustion the system expiry drives `matching → expired` (§E4 `expire_rfq`, PATCH-D2-02). Pipeline error → retry then park with ops alert (Doc-3 §1.2; PATCH-D3-05 bound parking).
- **Authorization:** system actor.
- **Audit:** yes → Doc-2 §9 RFQ "routing run (mode, filter reference)" (recorded in `rfq_routing_log`).
- **Events:** `RFQMatched` (Doc-2 §8; Architecture Patch v1.0.1 PATCH-06) via Doc-4B outbox-write.
- **Cross-Module:** **reads** Marketplace `vendor_matching_attributes` + vendor profile/capability/geography/category/tier/capacity by service (DE-2, read-only); **reads** Trust verified-tier/trust/performance signals (DE-3); **reads** Operations buyer CRM status (Buyer Filter universe + blacklist floor) by CRM service under non-disclosure (DE-4); **reads** Billing quota as a delivery ceiling input (DE-7). **Firewall:** consumes signals; mutates none; no paid plan affects any gate/score (§4B).
- **Error Categories:** SYSTEM, DEPENDENCY (a consumed service unavailable → retry/park), STATE (not in `matching`).
- **AI-Agent Notes:** Phase order is FIXED (Doc-3 §3.1) — gates before score, blacklist first; a gate-failed vendor must never appear in `matching_results`, leads, counts, or logs (Doc-2 §10.11.10; §7.5). **Never author the matching math anew** — bind Doc-3 §6; never let payment/entitlement influence eligibility or confidence (§4B). Empty-pool / coverage handling per Doc-3 §1.2 + §11.4 (PATCH-D3-03/05).

#### `rfq.rematch_incremental.v1` — Incremental Rematch (coverage recovery) · 21.5 System · Actor: System

- **Purpose:** When a vendor becomes newly eligible while a coverage-recovery case is open, run an incremental pipeline scoped to the affected RFQ(s) and the newly-eligible vendor(s) only — append to `matching_results`, never recompute existing results (Doc-3 §11.4 + `Doc-3_Patch_v1.0.2` PATCH-D3-03).
- **Ownership:** owner = RFQ; appends `matching_results`; writes `rfq_routing_log` (`incremental_rematch` flag).
- **Actor Types:** System (event-triggered: `VendorClaimed` / gate-relevant state change with an open coverage case).
- **Preconditions:** an open coverage-recovery case for the RFQ; the newly-eligible vendor passes every Phase A gate against the current version.
- **Request (high-level):** `rfq_id`, newly-eligible `vendor_profile_id`, coverage-case reference (internal; `Response: none`).
- **Response (high-level):** none (system).
- **State-Machine:** first successful delivery transitions `matching → vendors_notified` (frozen machine); existing invitations/results never recomputed or revoked.
- **Authorization:** system actor.
- **Audit:** yes → Doc-2 §9 RFQ "routing run"; the `incremental_rematch` routing-log entry carries **`[ESC-RFQ-AUDIT]`** (nearest §9 "routing run" by pointer; channel Doc-2 §9 additive).
- **Events:** `RFQMatched` / `RFQRouted` as applicable (Doc-2 §8) on a deliverable wave; consumes `VendorClaimed` (Marketplace, Doc-2 §8 — DE-2) as a trigger.
- **Cross-Module:** consumes Marketplace `VendorClaimed` and re-reads vendor attributes (DE-2); same signal reads as the full pipeline (DE-3/DE-4/DE-7).
- **Error Categories:** SYSTEM, DEPENDENCY, STATE (no open coverage case → no-op).
- **AI-Agent Notes:** **append-only** — never re-route or revoke existing results (PATCH-D3-03 FIXED). Full Phase A gates still apply to the newcomer; blacklist/self-match absolute.

#### `rfq.get_matching_results.v1` — Read Matching Results · 21.3 Query · Actor: internal-service / Admin

- **Purpose:** Read the per-vendor confidence breakdown for an RFQ version (explainability / ops; routing consumes it internally).
- **Ownership:** owner = RFQ; `matching_results` (derived).
- **Actor Types:** internal-service (routing/selection composition); Admin (ops telemetry, §5.6).
- **Preconditions:** internal-service context or `staff`-scoped ops read; never a vendor-facing surface.
- **Request (high-level):** `rfq_id` / `rfq_version_id`.
- **Response (high-level):** `matching_results` rows (confidence breakdown, `formula_version`); `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** internal-service / Admin (§5.6); never tenant-vendor exposed (non-disclosure).
- **Audit:** no (read).
- **Events:** none.
- **Cross-Module:** none (the read-model inputs were already consumed at pipeline run — DE-2/DE-3).
- **Error Categories:** AUTHORIZATION, NOT_FOUND, VALIDATION.
- **AI-Agent Notes:** `matching_results` is **regenerable/derived** (Doc-2 §6) — never the source of truth for a vendor signal; never expose a gate-excluded vendor (it isn't in the table by construction — §10.11.10).

#### `rfq.regenerate_matching_results.v1` — Regenerate Matching Results (signal-change consumer) · 21.5 System · Actor: System

- **Purpose:** Re-score an RFQ's surviving candidates when a consumed governance signal changes (verified tier, trust, performance) before terminal close — a refresh, not a re-gate from scratch (Doc-3 §6; Doc-2 §8 primary consumers: `VendorTierChanged`/`TrustScoreUpdated`/`PerformanceScoreUpdated` → matching refresh/re-rank).
- **Ownership:** owner = RFQ; rewrites `matching_results` (regenerable).
- **Actor Types:** System (event consumer; idempotent).
- **Preconditions:** RFQ pre-terminal; a consumed signal-change event received for a candidate vendor.
- **Request (high-level):** triggering event reference (internal; `Response: none`).
- **Response (high-level):** none (system).
- **State-Machine:** none (re-ranking does not move the RFQ state).
- **Authorization:** system actor.
- **Audit:** routing-run telemetry → Doc-2 §9 RFQ "routing run" (re-rank recorded in `rfq_routing_log`).
- **Events:** consumes `VendorTierChanged[verified]`/`TrustScoreUpdated`/`PerformanceScoreUpdated` (Trust, Doc-2 §8 — DE-3) and `VendorTierChanged[declared]`/`VendorOwnershipTransferred` (Marketplace — DE-2); emits none new.
- **Cross-Module:** Trust signal events (DE-3); Marketplace declared-tier/ownership events (DE-2). **Firewall:** signal is a scoring input only; never mutated (§4B).
- **Error Categories:** SYSTEM, DEPENDENCY, STATE (terminal → no-op).
- **AI-Agent Notes:** idempotent consumer (Doc-4A §16); absence-of-history never scored as zero (Doc-3 §6.4 FIXED). This contract is **re-ranking only** (re-score surviving candidates on a signal change, Doc-3 §6) — it is **not** a Phase-A eligibility re-evaluation; it never re-gates, never adds or removes a candidate from the eligible set, and never re-runs the hard gates (that is `run_matching_pipeline` / `rematch_incremental`).

---

## §E6 — Routing, Selection & Distribution + Routing Governance Contracts (BC-3 + BC-7; Invitation aggregate, Routing Rule)

> Binds Doc-3 §3.3–§3.6 (fairness, capacity-aware routing, human-assist), §4 (capacity), §5 (distribution/waves), §7 (prioritization), §0.1/§18B (operating-stage). Contracts: **21.5 System** (wave assembly, replenishment, deferred-queue drain, delivery), **21.4 Command** (invitation response; human-assist actions), **21.6 Admin** (routing-rule control plane), **21.3 Query** (routing-log/invitation reads). **FIXED:** no public RFQ board; selection never always-same and never pure-random; vendor self-throttle never penalized; deferral invisible to buyer.

#### `rfq.assemble_and_route_wave.v1` — Selection, Throttling & Wave Routing · 21.5 System · Actor: System

- **Purpose:** Run Phase D–F (selection & fair distribution → throttling → routing): assemble a wave from `matching_results`, apply capacity/fairness/probation, materialize invitations + grantee/document-grant rows at delivery (Doc-3 §3.1 Phase D–F; §5.2–§5.4).
- **Ownership:** owner = RFQ; writes `rfq_invitations`, `rfq_invitation_grantees`, `rfq_document_grants`, `rfq_routing_log`.
- **Actor Types:** System (async; first wave at routing completion; replenishment at checkpoints).
- **Preconditions:** `matching_results` present; relevance floor honored; per-vendor capacity not exhausted (A7 defers exhausted); runway sufficient (POLICY `capacity.min_response_runway_hours`).
- **Request (high-level):** `rfq_id`, `rfq_version_id`, wave parameters (internal; `Response: none`).
- **Response (high-level):** none (system; invitations delivered → events fire per delivered invitation).
- **State-Machine:** first delivered wave drives `matching → vendors_notified` (Doc-2 §5.4); `rfq_invitations` advance `draft → selected → deferred → delivered` (Doc-2 §3.4); deferred never blocks a wave from filling (Doc-3 §4.2 FIXED).
- **Authorization:** system actor.
- **Audit:** yes → Doc-2 §9 RFQ "routing run (mode, filter reference)" + invitation transition `InvitationDelivered` (Doc-2 §9).
- **Events:** `RFQRouted` (Doc-2 §8; PATCH-06); `VendorInvited` **only** on each transition to `delivered` (Doc-2 §8 — never on `selected`/`deferred`).
- **Cross-Module:** `VendorInvited` → Communication dispatch (DE-6) + Operations `vendor_leads` creation (DE-4); grantee rows enable vendor-side reads via Identity-resolved orgs + delegation grants (DE-1); reads Billing quota as intake ceiling (DE-7). **`buyer_directed`-flagged invitation:** created and `delivered` per `Doc-3_Patch_v1.0.2` PATCH-D3-02, so **`VendorInvited` fires** (Doc-2 §8 — only at `delivered`), but the record is **excluded** from valid-lead (Doc-3 §11.6), guarantee (§11.7), exposure-fairness (§3.3), and wave/replenishment (§5.2–§5.3) accounting; its flag-specific audit is carried under **`[ESC-RFQ-AUDIT]`** (nearest Doc-2 §9 invitation action by pointer). No event or audit action invented.
- **Error Categories:** SYSTEM, DEPENDENCY, STATE.
- **AI-Agent Notes:** selection doctrine FIXED (Doc-3 §3.3) — equivalence-band rotation + exposure ceiling/ratio + anti-starvation + salted tie-break; never deliver below the relevance floor (Doc-3 §5.5); deferral is invisible to the buyer (§4.2). `VendorInvited` fires only at `delivered`.

#### `rfq.replenish_wave.v1` — Replenishment Wave · 21.5 System · Actor: System

- **Purpose:** At checkpoints, if projected quotes < target, draw the next-band vendors (incl. drained deferred queues) until target met / pool exhausted / runway too short (Doc-3 §5.3).
- **Ownership:** owner = RFQ; appends `rfq_invitations` + grantee/grant rows; `rfq_routing_log`.
- **Actor Types:** System (checkpoint timer — POLICY `distribution.replenish_check_hours`).
- **Preconditions:** RFQ open (pre-terminal, window live); projected quotes below target; runway ≥ min.
- **Request (high-level):** `rfq_id` (internal; `Response: none`).
- **Response (high-level):** none (system).
- **State-Machine:** no RFQ transition (stays `vendors_notified`/`quotations_received`); new invitations `→ delivered`.
- **Authorization:** system actor.
- **Audit:** yes → Doc-2 §9 RFQ "routing run" + `InvitationDelivered`.
- **Events:** `VendorInvited` per newly-delivered invitation (Doc-2 §8).
- **Cross-Module:** same as wave routing (DE-6/DE-4/DE-1/DE-7).
- **Error Categories:** SYSTEM, DEPENDENCY, STATE.
- **AI-Agent Notes:** pool-exhausted + below-target → honest buyer notification (Communication, DE-6) with options (extend/widen/relax) — never silent failure; never fabricate activity (Doc-3 §5.3, §1.2 FIXED).

#### `rfq.drain_deferred_queue.v1` — Deferred-Queue Drain (capacity recovery) · 21.5 System · Actor: System

- **Purpose:** On a vendor capacity slot freeing (response/expiry/terminal), drain the per-vendor deferred queue highest-priority-first, re-checking RFQ liveness + runway before delivery (Doc-3 §4.3).
- **Ownership:** owner = RFQ; advances `rfq_invitations` `deferred → delivered`.
- **Actor Types:** System (event/slot-free trigger).
- **Preconditions:** a freed active-capacity slot; deferred invitation present; RFQ live; runway ≥ min.
- **Request (high-level):** `vendor_profile_id` (slot context) (internal; `Response: none`).
- **Response (high-level):** none (system).
- **State-Machine:** `rfq_invitations` `deferred → delivered`; deferred invitations auto-expire undelivered if runway would be insufficient (Doc-3 §4.2).
- **Authorization:** system actor.
- **Audit:** yes → Doc-2 §9 `InvitationDelivered` (or `InvitationExpired` if runway-starved).
- **Events:** `VendorInvited` on delivery (Doc-2 §8).
- **Cross-Module:** Communication dispatch (DE-6); Operations lead (DE-4).
- **Error Categories:** SYSTEM, STATE.
- **AI-Agent Notes:** delivering an impossible deadline manufactures a non-response — auto-expire undelivered rather than deliver sub-runway (Doc-3 §4.2 FIXED). Self-throttling vendors are routed around, never penalized (§4.1).

#### `rfq.respond_to_invitation.v1` — Invitation Response (accept / formal decline) · 21.4 Command · Actor: User

- **Purpose:** Vendor accepts (implicit on quote) or formally declines an invitation (reason-coded); a formal decline frees the slot instantly, counts as a response, zero performance penalty (Doc-3 §5.4, §8.4).
- **Ownership:** owner = RFQ; `rfq_invitations` (vendor-side via grantee rows).
- **Actor Types:** User (vendor controlling org; or representative via §6B delegation grant).
- **Preconditions:** a `delivered` invitation grantee row for the actor's org; window open; `can_respond_to_rfq` (Doc-2 §7).
- **Request (high-level):** `invitation_id`; decision (accept/decline); decline reason code.
- **Response (high-level):** invitation new state (`accepted`/`declined`); `reference_id`.
- **State-Machine:** `rfq_invitations` `delivered → accepted | declined` (Doc-2 §3.4). A decline is recorded on `rfq_invitations`, not as a quotation state (Doc-2 §5.5 guard).
- **Authorization:** §6/§6B; `can_respond_to_rfq` (Doc-2 §7); scope = vendor controlling org or delegation grant.
- **Audit:** yes → Doc-2 §9 `InvitationAccepted` / `InvitationDeclined`.
- **Events:** none defined in Doc-2 §8 for accept/decline (state + audit only — B.6).
- **Cross-Module:** delegation grant consumed from Identity (DE-1); decline frees a capacity slot → triggers deferred-queue drain (internal).
- **Error Categories:** AUTHORIZATION, STATE (window closed / not delivered), VALIDATION (missing reason), SYSTEM.
- **AI-Agent Notes:** make declining easier than ignoring (Doc-3 §8.4) — decline counts as a response (protects the response-rate health metric); never penalize a formal decline.

#### `rfq.assist_routing.v1` — Human-Assisted Routing Action · 21.6 Admin · Actor: Admin · *(platform governance; Stage-gated)*

- **Purpose:** Platform/founder human-assist: suggest additional vendors (who must still pass every gate), validate routing results before release, trigger sourcing, request buyer clarification (Doc-3 §3.6; Stage-A founder review §0.1).
- **Ownership:** owner = RFQ; annotates `rfq_routing_log`; may queue additional candidates into the pipeline (which re-gates them).
- **Actor Types:** Admin (platform-staff/founder, §5.6).
- **Preconditions:** human-assist criteria met (POLICY `human_routing.criteria_thresholds`); operating stage permits (Doc-3 §0.1); `staff`-scoped authority.
- **Request (high-level):** `rfq_id`; action (suggest/validate/source/clarify); rationale (mandatory).
- **Response (high-level):** action outcome; `reference_id`.
- **State-Machine:** may trigger routing (→ `vendors_notified` via the wave contract); no new edge.
- **Authorization:** §5.6 platform-staff; bound by the FIXED forbidden-actions wall (never bypass blacklist/eligibility/verification/trust — Doc-3 §3.6/§0.1.1).
- **Audit:** yes → Doc-2 §9 RFQ "routing run" with actor + rationale (every human routing action audited; runs flagged in telemetry).
- **Events:** none new (routing events fire from the wave contract).
- **Cross-Module:** suggested vendors re-read from Marketplace and re-gated (DE-2); buyer clarification dispatched by Communication (DE-6).
- **Error Categories:** AUTHORIZATION, BUSINESS (forbidden action attempted → reject), STATE, SYSTEM.
- **AI-Agent Notes:** humans may improve routing quality, never violate the rules (Doc-3 §3.6 FIXED forbidden-actions wall) — suggested vendors pass every gate; no founder/stage bypasses blacklist/eligibility/verification/trust.

#### `rfq.manage_routing_rule.v1` — Routing-Rule Control Plane · 21.6 Admin · Actor: Admin · *(platform governance)*

- **Purpose:** Define/update control-plane routing rules (`routing_rules`, platform-owned) — the operator surface for routing configuration (BC-7; Doc-2 §3.4 `routing_rules`).
- **Ownership:** owner = RFQ; `routing_rules` (platform-owned).
- **Actor Types:** Admin (platform-staff, §5.6).
- **Preconditions:** `staff`-scoped authority; POLICY values referenced by key only (Doc-3 §12.2 — `[ESC-RFQ-POLICY]` if a referenced key is absent; none currently).
- **Request (high-level):** rule definition/update payload (control-plane; high-level).
- **Response (high-level):** rule id/version; `reference_id`.
- **State-Machine:** `routing_rules` simple lifecycle (Doc-2 §3.4).
- **Authorization:** §5.6 platform-staff.
- **Audit:** yes → Doc-2 §9 Platform "system_configuration change" (config-governance) where the rule binds POLICY; routing-rule edits audited via the Doc-4B mechanism.
- **Events:** none.
- **Cross-Module:** POLICY read/write is Doc-4B `core.system_configuration` (DE-8); operating-stage behavior POLICY-bound (Doc-4A §18B).
- **Error Categories:** AUTHORIZATION, VALIDATION, SYSTEM.
- **AI-Agent Notes:** numbers are POLICY, mechanisms are architecture (Doc-3 operating doctrine) — never hardcode a threshold; reference the Doc-3 §12.2 key. Paid plans never gate routing fairness (§4B).

#### `rfq.get_routing_log.v1` · `rfq.get_invitation.v1` · `rfq.list_invitations.v1` — Routing/Invitation Reads · 21.3 Query · Actor: User / Admin / internal-service

- **Purpose:** Read routing-log explainability (ops/Admin) and invitation state (vendor sees own; buyer sees own RFQ's invitations within disclosure rules).
- **Ownership:** owner = RFQ; reads over `rfq_routing_log`, `rfq_invitations`.
- **Actor Types:** Admin/internal-service (routing log); User (invitation — vendor via grantee row; buyer via own RFQ).
- **Preconditions:** routing-log read is platform/ops-scoped (disclosed per disclosure rules); invitation read scoped to grantee (vendor) or buyer org; non-disclosure invariant applies.
- **Request (high-level):** `rfq_id` / `invitation_id` / filter+pagination.
- **Response (high-level):** routing-log rows / invitation projection / list page; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** §6; vendor scope = grantee row; buyer scope = own RFQ; routing log = platform/ops.
- **Audit:** no (read).
- **Events:** none.
- **Cross-Module:** Identity org resolution for grantee checks (DE-1).
- **Error Categories:** AUTHORIZATION, NOT_FOUND (no-access collapse §7.5), VALIDATION.
- **AI-Agent Notes:** `rfq_routing_log` discloses per disclosure rules only (Doc-2 §3.4) — never expose blacklist/deferral facts (a deferred or gate-excluded vendor is indistinguishable from non-match; Doc-2 §10.11; §7.5).

---

## §E7 — Quotation Management Contracts (BC-4; Quotation aggregate)

> Binds Doc-2 §5.5 (Quotation machine) and Doc-3 §8 (quotation workflow) + §4.1.1 (three-instrument quota identity, PATCH-D3-01). Contracts: **21.4 Command** (submit/revise/withdraw/decline-via-invitation/late-extension), **21.3 Query** (quotation reads). **FIXED:** one active quotation per vendor per RFQ; version-binding to `rfq_version_id`; no overwrite on revise; no silent late acceptance / no private windows; quota consumed only at submission.

#### `rfq.submit_quotation.v1` — Submit Quotation · 21.4 Command · Actor: User

- **Purpose:** Vendor submits a quotation against the current RFQ version; consumes the quotation-submission quota; refreshes the comparison (Doc-3 §8.1; Doc-2 §5.5).
- **Ownership:** owner = Quotation (Module 3); `quotations` (AR) + `quotation_versions`; vendor side anchored on `controlling_organization_id`.
- **Actor Types:** User (vendor controlling org; or representative via §6B delegation grant).
- **Preconditions:** a `delivered` invitation grantee row; RFQ in a quotable state (`vendors_notified`/`quotations_received`/`buyer_reviewing` pre-window-close); priced against the current `rfq_version` (re-confirm if a newer version exists — Doc-2 §5.5 guard); completeness floor (price, validity, delivery terms, spec-compliance declaration); **quotation-submission quota available** on the controlling org (Doc-3 §4.1.1); `can_submit_quote`.
- **Request (high-level):** `rfq_id`, `rfq_version_id`, price breakdown, delivery/warranty terms, spec-compliance declaration (high-level; field rules Pass-B).
- **Response (high-level):** `quotation_id`, version, state `submitted`; `reference_id`.
- **State-Machine:** `quotations` `draft → submitted` (Doc-2 §5.5); invitation `→ accepted` (Doc-3 §8.1); one-active-per-vendor-per-RFQ enforced (Doc-2 §10.4 partial unique index). **If the RFQ is in `vendors_notified` and this is the first submitted quotation, the RFQ advances `vendors_notified → quotations_received` (Doc-2 §5.4) within the same transaction** as the quotation write and `QuotationSubmitted` outbox insert (single-transaction rule, Doc-4A §16 / Doc-2 §10.11.4).
- **Authorization:** §6/§6B; `can_submit_quote` (Doc-2 §7); scope = vendor controlling org / delegation grant.
- **Audit:** yes → Doc-2 §9 Quotation "submit" (via Doc-4B).
- **Events:** `QuotationSubmitted` (Doc-2 §8) via Doc-4B outbox-write → comparison refresh + performance inputs + usage ledger (primary consumers, Doc-2 §8).
- **Cross-Module:** **reads + consumes** Billing quotation-submission quota at submission (DE-7; three-instrument identity — no other instrument decremented). **The quotation-submission quota ledger entry on the controlling org (Doc-3 §4.1.1) is a Billing-owned write driven by Billing's consumption of `QuotationSubmitted`** — RFQ emits the event; Billing records the ledger entry (`usage_ledger.source = rfq_response`, Doc-2 §10.8); single-authorship preserved. Delegation grant consumed from Identity (DE-1). **Firewall:** quota is a submission gate, never a matching input; payment never affects matching (§4B).
- **Error Categories:** AUTHORIZATION, STATE (window closed / not quotable), QUOTA (submission quota exhausted), VALIDATION (completeness floor / version mismatch), CONFLICT (second active quote), SYSTEM.
- **AI-Agent Notes:** quota consumption is **only** at submission (Doc-3 §4.1.1 FIXED — never at delivery, never the entitlement); bind to the current `rfq_version` (never the mutable head, Doc-2 §5.5); one active quote per vendor (the second representative sees replace/revise/withdraw, never a parallel quote — Doc-3 §2.8).

#### `rfq.revise_quotation.v1` — Revise Quotation · 21.4 Command · Actor: User

- **Purpose:** Vendor revises a quotation pre-award while the window is open — new version, never overwrite, reason-coded, buyer notified with a diff (Doc-3 §8.2; Doc-2 §5.5).
- **Ownership:** owner = Quotation; `quotations` + `quotation_versions` (append).
- **Actor Types:** User (vendor controlling org / delegation grant).
- **Preconditions:** existing `submitted` quotation; RFQ pre-award, window open; revision soft-cap (POLICY `quote.max_revisions`) — beyond it requires clarification-thread justification; priced against the current `rfq_version`.
- **Request (high-level):** `quotation_id`, changed terms, `revision_reason`.
- **Response (high-level):** new `quotation_version`; `reference_id`.
- **State-Machine:** `quotations` `submitted → submitted` (new version; prior superseded — Doc-2 §5.5).
- **Authorization:** §6/§6B; `can_submit_quote` (Doc-2 §7).
- **Audit:** yes → Doc-2 §9 Quotation "edit (new version)".
- **Events:** **none** — quotation revision has no Doc-2 §8 domain event (B.6 non-event); comparison refresh + buyer diff notification are downstream effects (comparison contract §E8 + Communication DE-6).
- **Cross-Module:** buyer diff notification dispatched by Communication (DE-6).
- **Error Categories:** AUTHORIZATION, STATE (window closed / awarded), BUSINESS (revision cap), VALIDATION (version mismatch), SYSTEM.
- **AI-Agent Notes:** **never overwrite** a prior version (Doc-2 §5.5; Doc-3 §8.2); do **not** coin a quotation-revision event (verified absent from Doc-2 §8); after window close, revision is locked except buyer best-and-final or buyer window-reopen (Doc-3 §8.2/§8.5 — no private windows).

#### `rfq.withdraw_quotation.v1` — Withdraw Quotation · 21.4 Command · Actor: User

- **Purpose:** Vendor withdraws a quotation pre-award; reason-coded; frees the slot; comparison updates; withdrawal-after-shortlist alerts the buyer (Doc-3 §8.3).
- **Ownership:** owner = Quotation; `quotations`.
- **Actor Types:** User (vendor controlling org / delegation grant).
- **Preconditions:** `submitted` quotation; pre-award; `can_withdraw_quote`.
- **Request (high-level):** `quotation_id`; withdrawal reason.
- **Response (high-level):** state `withdrawn`; `reference_id`.
- **State-Machine:** `quotations` `submitted → withdrawn` (Doc-2 §5.5; terminal for that quotation). The response still counts as a response (the vendor engaged).
- **Authorization:** §6; `can_withdraw_quote` (Doc-2 §7).
- **Audit:** yes → Doc-2 §9 Quotation "withdraw".
- **Events:** `QuotationWithdrawn` (Doc-2 §8).
- **Cross-Module:** withdrawal-after-shortlist → buyer alert (Communication, DE-6) + optional replenishment wave if comparison depth drops (internal, §E6).
- **Error Categories:** AUTHORIZATION, STATE (awarded / not submitted), VALIDATION (reason), SYSTEM.
- **AI-Agent Notes:** habitual late withdrawal (after `buyer_reviewing`) carries a Quote-Quality discount (Doc-3 §8.3) — an analytics effect, not a state concern; the slot frees immediately on withdraw.

#### `rfq.request_late_extension.v1` — Late-Quote Extension Request · 21.4 Command · Actor: User (vendor) → buyer one-tap

- **Purpose:** A late vendor requests a buyer window extension; on buyer one-tap approve, the window reopens for **all** un-responded invitees (no per-vendor private windows — Doc-3 §8.5 FIXED).
- **Ownership:** owner = RFQ/Quotation; reopens the RFQ quotation window (affects `quotations` quotability).
- **Actor Types:** User (vendor requests; buyer approves — `can_create_rfq`/buyer authority on the RFQ).
- **Preconditions:** window closed; late-extension within POLICY `quote.late_extension_max_days`; buyer approval required; if shortlisted, explicit buyer action + re-notification of shortlisted (Doc-3 §8.5).
- **Request (high-level):** `rfq_id`/`invitation_id`; extension request → buyer decision.
- **Response (high-level):** window reopened (all un-responded) or denied; `reference_id`.
- **State-Machine:** no RFQ terminal change; reopens the quotation window (Doc-3 §8.5); no private edge.
- **Authorization:** §6; vendor `can_respond_to_rfq` to request; buyer authority to approve.
- **Audit:** yes → Doc-2 §9 RFQ "edit (new version)" / routing-run as applicable (window change audited via Doc-4B).
- **Events:** none new (re-notification via the routing/Communication path — DE-6).
- **Cross-Module:** Communication re-notifies all un-responded invitees (DE-6).
- **Error Categories:** AUTHORIZATION, STATE (already awarded), BUSINESS (extension cap), SYSTEM.
- **AI-Agent Notes:** **no silent late acceptance, no private per-vendor windows** (Doc-3 §8.5 FIXED) — reopening always applies to all un-responded invitees; fairness here is cheap to enforce.

#### `rfq.get_quotation.v1` · `rfq.list_quotations_for_rfq.v1` — Quotation Reads · 21.3 Query · Actor: User

- **Purpose:** Read a quotation (vendor sees own; buyer sees quotations on own RFQ via `quotation_visibility`).
- **Ownership:** owner = Quotation; reads over `quotations`/`quotation_versions`, gated by `quotation_visibility`.
- **Actor Types:** User (vendor controlling org / delegation grant; buyer via visibility grant).
- **Preconditions:** vendor scope = `controlling_organization_id` (+ representatives); buyer scope = `quotation_visibility` grant (Doc-2 §3.4/§6).
- **Request (high-level):** `quotation_id` / `rfq_id` (buyer list).
- **Response (high-level):** quotation projection / list; `reference_id`.
- **State-Machine:** none (read).
- **Authorization:** §6/§6B; scope via `quotation_visibility` + controlling-org anchor.
- **Audit:** no (read).
- **Events:** none.
- **Cross-Module:** delegation/representation resolved from Identity (DE-1).
- **Error Categories:** AUTHORIZATION, NOT_FOUND (no-access collapse §7.5), VALIDATION.
- **AI-Agent Notes:** one vendor = one active quotation regardless of representative count (Doc-3 §2.8); buyer reads are visibility-grant-scoped only.

---

## §E8 — Buyer Evaluation, Comparison & Procurement Decision/Closure Contracts (BC-5 + BC-6 absorbed; Comparison Statement aggregate + RFQ terminal)

> Binds Doc-3 §9 (evaluation/comparison/award/loss) and Doc-2 §5.4 (shortlist/award/close edges). Contracts: **21.4 Command** (shortlist/award/close/clarification/best-and-final), **21.5 System** (comparison auto-generation/refresh), **21.3 Query** (comparison reads). **FIXED:** the platform never auto-recommends a winner pre-award (decision-support, not decision); single award; buyer-preference firewall (buyer-scoped only); expiry-without-buyer-action never penalizes vendors.

#### `rfq.generate_comparison_statement.v1` — Generate / Refresh Comparison · 21.5 System · Actor: System

- **Purpose:** Auto-generate the comparison statement at first quotation and re-version on every quotation event (Doc-3 §9.1; Doc-2 §3.4 versioned).
- **Ownership:** owner = RFQ; `comparison_statements` (versioned).
- **Actor Types:** System (event consumer: `QuotationSubmitted`/`QuotationWithdrawn` and quotation revisions).
- **Preconditions:** ≥1 quotation exists / a quotation event occurred.
- **Request (high-level):** `rfq_id`, triggering quotation event (internal; `Response: none`).
- **Response (high-level):** none (system; writes a new `comparison_statements` version).
- **State-Machine:** `comparison_statements` versioned append (Doc-2 §3.4); no RFQ transition.
- **Authorization:** system actor.
- **Audit:** comparison generation is a derived-artifact refresh; not a separately enumerated Doc-2 §9 action (reads/derived not audited) — no audit action invented.
- **Events:** none (consumes quotation events; emits none).
- **Cross-Module:** vendor-standing display columns (trust band, performance badge, verification depth, tier) are sourced from the RFQ's **`matching_results`** rows (the confidence breakdown already computed at pipeline run, §E5) — **the authoritative display source** — never via an uncontrolled live read of Trust/Marketplace at comparison time. This preserves the governance-signal firewall (the signal a buyer sees equals the signal the pipeline scored) and avoids a second read path (DE-2/DE-3 were consumed once, at pipeline run; §4B).
- **AI-Agent Notes (display source):** bind vendor-standing columns to `matching_results` (§E5), **not** to a live Trust/Marketplace service call inside the comparison contract — one controlled read path, firewall-preserving (Doc-4A §4B); the comparison statement displays signals, never recomputes or mutates them.
- **Error Categories:** SYSTEM, DEPENDENCY.
- **AI-Agent Notes:** **never auto-recommend a winner** (Doc-3 §9.1 FIXED) — the statement summarizes; humans decide; the future AI layer may summarize but holds no authority. Buyer-private columns (own status/notes) are buyer-only (non-disclosure).

#### `rfq.shortlist_quotation.v1` — Shortlist · 21.4 Command · Actor: User

- **Purpose:** Buyer marks ≥1 quotation shortlisted (positive signal to those vendors; starts the decision clock) (Doc-3 §9.2; Doc-2 §5.4).
- **Ownership:** owner = RFQ; `rfqs` (shortlist), references quotations.
- **Actor Types:** User (buyer).
- **Preconditions:** RFQ in `buyer_reviewing`; `can_approve_vendor_selection`; ≥1 quotation; soft max (POLICY `eval.shortlist_max`).
- **Request (high-level):** `rfq_id`, quotation id(s).
- **Response (high-level):** state `shortlisted`; `reference_id`.
- **State-Machine:** `buyer_reviewing → shortlisted` (Doc-2 §5.4).
- **Authorization:** §6; `can_approve_vendor_selection` (Doc-2 §7).
- **Audit:** yes → Doc-2 §9 RFQ "shortlist".
- **Events:** none defined in Doc-2 §8 for shortlist (state + audit only); shortlisted-vendor notification is Communication's (DE-6); non-shortlisted are **not** notified at this stage (Doc-3 §1.2 shortlisted).
- **Cross-Module:** Communication notifies shortlisted (DE-6).
- **Error Categories:** AUTHORIZATION, STATE (not `buyer_reviewing`), VALIDATION, SYSTEM.
- **AI-Agent Notes:** non-shortlisted vendors are notified only at terminal close (Doc-3 §1.2/§9.5) — premature loss signals create noise; shortlist edits are free pre-award but audited.

#### `rfq.manage_clarification.v1` · `rfq.invoke_best_and_final.v1` — Clarification & Best-and-Final · 21.4 Command · Actor: User

- **Purpose:** Buyer runs RFQ-scoped clarification (material clarifications broadcast/anonymized with optional revision window) and may invoke one best-and-final round (simultaneous sealed revision) (Doc-3 §9.3).
- **Ownership:** owner = RFQ (evaluation orchestration); the **thread channel is Communication-owned (DE-6)** — RFQ references it, authors no thread entity/contract (frozen structure §E8 excluded scope).
- **Actor Types:** User (buyer).
- **Preconditions:** RFQ pre-award; shortlisted vendors for best-and-final; best-and-final cap (POLICY `eval.baf_rounds_max`).
- **Request (high-level):** `rfq_id`; clarification content / best-and-final invocation; common deadline.
- **Response (high-level):** clarification/round status; `reference_id`.
- **State-Machine:** no RFQ edge (pre-award orchestration); best-and-final opens a sealed revision window (Doc-3 §9.3) — reuses the quotation-revision machine (§E7).
- **Authorization:** §6; buyer authority (`can_approve_vendor_selection` / `can_create_rfq` per the action).
- **Audit:** clarification/round actions audited via Doc-4B where they change RFQ/quotation state; thread-message audit is Communication's.
- **Events:** none new from RFQ (notification/thread dispatch is Communication's — DE-6).
- **Cross-Module:** **Communication owns the clarification/best-and-final thread channel and authors its contracts (DE-6)** — RFQ MUST NOT author a thread entity or Communication contract; fair-information broadcast is dispatched by Communication.
- **Error Categories:** AUTHORIZATION, STATE (awarded), BUSINESS (round cap), SYSTEM.
- **AI-Agent Notes:** material clarifications must be broadcast (anonymized) to all active invitees (Doc-3 §9.3 fair-information rule) — never create insider-vendor dynamics; per-vendor sequential price-hammering is discouraged by design; **author no clarification-thread entity here** (DE-6).

#### `rfq.award_rfq.v1` — Award (→ closed_won) · 21.4 Command · Actor: User

- **Purpose:** Buyer awards exactly one quotation → `closed_won`; records award value; hands off to engagement creation (Operations) (Doc-3 §9.4; Doc-2 §5.4 single-award).
- **Ownership:** owner = RFQ; `rfqs` (terminal). Engagement is **Operations-owned** (DE-4) — created by Operations on the event.
- **Actor Types:** User (buyer; `can_award_rfq`; value above org threshold may require Director/Owner ORG approval).
- **Preconditions:** RFQ in `shortlisted`; exactly one selected quotation; `can_award_rfq`; ORG award-threshold approval if configured (Doc-3 §9.4).
- **Request (high-level):** `rfq_id`, selected `quotation_id`.
- **Response (high-level):** state `closed_won`, award value recorded; `reference_id`.
- **State-Machine:** `shortlisted → closed_won` (Doc-2 §5.4; terminal); the selected `quotations` → `selected`, others → `not_selected` (Doc-2 §5.5).
- **Authorization:** §6; `can_award_rfq` (Doc-2 §7); ORG threshold rule.
- **Audit:** yes → Doc-2 §9 RFQ "close won" (+ Quotation "select").
- **Events:** `RFQClosedWon` + `QuotationSelected` (Doc-2 §8) → engagement creation (Operations), performance inputs (Trust), transaction intelligence (primary consumers, Doc-2 §8).
- **Cross-Module:** **Operations** creates the `engagement` on `RFQClosedWon` (DE-4 — RFQ does not author the engagement); **Trust** consumes for performance inputs (DE-3); Communication sends closure notifications (DE-6).
- **Error Categories:** AUTHORIZATION, STATE (not `shortlisted` / >1 selected), BUSINESS (ORG threshold), SYSTEM.
- **AI-Agent Notes:** single award only (Doc-2 §5.4 cardinality FIXED) — split needs are a re-issue (§E4 `reissue_rfq`), never multi-award; the engagement is Operations' (DE-4), created off the event, never authored here. The RFQ transition (`shortlisted → closed_won`) and the quotation transitions (selected `→ selected`, others `→ not_selected`) plus the `RFQClosedWon`/`QuotationSelected` outbox inserts occur in **one database transaction** — both aggregates live in the single `rfq` schema (modular monolith), so the multi-aggregate write is atomic (Doc-2 §10.11.4). The same single-transaction rule applies to `rfq.close_lost_rfq.v1` (`shortlisted → closed_lost` + open quotations `→ not_selected`).

#### `rfq.close_lost_rfq.v1` — Close Without Award (→ closed_lost) · 21.4 Command · Actor: User

- **Purpose:** Buyer closes without award → `closed_lost`, structured reason code; uniform loss notification to non-selected responders (Doc-3 §9.5; Doc-2 §5.4).
- **Ownership:** owner = RFQ; `rfqs` (terminal).
- **Actor Types:** User (buyer; `can_approve_vendor_selection`/`can_award_rfq` per the close authority).
- **Preconditions:** RFQ in `shortlisted` (or active per Doc-3 §1.2); structured reason code (POLICY-managed list).
- **Request (high-level):** `rfq_id`, structured reason code (+ text if "other").
- **Response (high-level):** state `closed_lost`; `reference_id`.
- **State-Machine:** `shortlisted → closed_lost` (Doc-2 §5.4; terminal); open quotations → `not_selected` (Doc-2 §5.5).
- **Authorization:** §6 three-layer; **`can_approve_vendor_selection`** (close-without-award from `shortlisted`) — or **`can_award_rfq`** where the org binds closure to award authority (Doc-2 §7; both are existing buyer-side slugs); scope = buyer controlling org. No slug invented.
- **Audit:** yes → Doc-2 §9 RFQ "close won/lost" (lost branch).
- **Events:** `RFQClosedLost` (Doc-2 §8) → uniform closure notification (Communication, DE-6).
- **Cross-Module:** Communication dispatches uniform closure to non-selected responders (DE-6); banded (never exact) loss feedback opt-in (Doc-3 §9.5).
- **Error Categories:** AUTHORIZATION, STATE (terminal), VALIDATION (missing reason), SYSTEM.
- **AI-Agent Notes:** loss feedback is banded, not exact, and off by default (Doc-3 §9.5 — trains quote dumping otherwise); expiry-without-buyer-action feeds **nothing** negative for vendors (FIXED fairness: buyer silence ≠ vendor failure).

#### `rfq.get_comparison_statement.v1` — Read Comparison · 21.3 Query · Actor: User (buyer)

- **Purpose:** Buyer reads the comparison statement for an RFQ (the decision-support surface); opening it first transitions `quotations_received → buyer_reviewing` (Doc-3 §9.1/§1.2).
- **Ownership:** owner = RFQ; `comparison_statements`.
- **Actor Types:** User (buyer).
- **Preconditions:** buyer scope on the RFQ; `can_view_rfq`/`can_view_all_rfqs` + evaluation authority.
- **Request (high-level):** `rfq_id` (+ version).
- **Response (high-level):** comparison matrix projection (incl. buyer-private columns for the buyer only); `reference_id`.
- **State-Machine:** `quotations_received → buyer_reviewing` (Doc-2 §5.4) fires on **either** trigger, **whichever is first (Doc-3 §1.2):** (a) the buyer **first opens** the comparison statement (this read contract), or (b) **automatically at quotation-window close** (system actor). Vendor-facing status shows "under evaluation" only from `buyer_reviewing`. The window-close auto-advance is a system-actor transition (Doc-3 §1.2); no new edge — the Doc-2 §5.4 `quotations_received → buyer_reviewing` edge already exists.
- **Authorization:** §6; buyer scope (Doc-2 §7).
- **Audit:** the state transition (first open) is audited via the lifecycle; the read itself is not (§17.1).
- **Events:** none.
- **Cross-Module:** vendor-standing display columns read from Trust/Marketplace by service (DE-2/DE-3).
- **Error Categories:** AUTHORIZATION, NOT_FOUND, STATE, VALIDATION.
- **AI-Agent Notes:** the comparison shows standing but **never an auto-recommended winner** (Doc-3 §9.1 FIXED); buyer-private columns are never exposed to vendors (non-disclosure).

---

## §E9 — Integration Surface (Pass-A consolidation)

Per Doc-4A §4.4 single-authorship, RFQ authors **its own** commands (which emit events) and **its own** consumer effects on **its own** entities; it authors no other module's contract. **Template 21.2 is not instantiated** (the emitter authors the delivery integration; consumers author their legs). Direction per counterpart:

| Counterpart | Marker | Direction | RFQ surface (authored here) | Other side (authored there) |
|---|---|---|---|---|
| **Identity (Doc-4C, FROZEN)** | DE-1 | consume | `check_permission`, org/membership/active-org resolution, §6B delegation grants (vendor representative action) | Identity owns all of these (consumed by pointer) |
| **Marketplace (Doc-4D, FROZEN)** | DE-2 | consume (read) | read `vendor_matching_attributes` + vendor profile/capability/geo/category/tier/capacity by service; consume `VendorClaimed`/`VendorSuspended`/`VendorTierChanged[declared]`/`VendorOwnershipTransferred` | Marketplace owns vendor data + read-model (the moat seam: RFQ runs matching, Marketplace supplies data) |
| **Trust (Doc-4G)** | DE-3 | consume | consume `VendorVerified`/`VendorTierChanged[verified]`/`TrustScoreUpdated`/`PerformanceScoreUpdated` as gate/scoring inputs + re-rank triggers | Trust owns scores/verification/verified-tier (firewall: read, never mutate) |
| **Operations (Doc-4F)** | DE-4 | consume (read) + emit | read buyer CRM status (Buyer Filter + blacklist floor) via CRM service under non-disclosure; emit `RFQClosedWon`/`VendorInvited` | Operations creates `engagements` (on `RFQClosedWon`) and `vendor_leads` (on `VendorInvited`); owns CRM |
| **Communication (Doc-4H)** | DE-6 | emit only | emit outbox events (`VendorInvited`, `QuotationSubmitted`, `RFQClosedWon`/`RFQClosedLost`, etc.) | **Communication owns notification fan-out and authors all notification/Communication contracts — RFQ authors none** (single-authorship); clarification/best-and-final thread channel is Communication's |
| **Billing (Doc-4I)** | DE-7 | consume (read) + emit | read quotation-submission quota (delivery ceiling + at submission), guarantee/credit entitlement; **emit `QuotationSubmitted`** | Billing owns quota/entitlement/credits; **Billing consumes `QuotationSubmitted` into usage-ledger processing** (`usage_ledger.source = rfq_response`, Doc-2 §8 primary consumers / §10.8) — Billing is consumer-owner, RFQ is emitter only (single-authorship); firewall: payment never influences matching |
| **Admin (Doc-4J)** | DE-5 | reflect / consume | expose the moderation transition surface (`staff_can_moderate_rfq`); reflect `VendorBanned` | Admin owns the moderation **decision** + `ban_actions` |
| **Platform Core (Doc-4B, FROZEN)** | DE-8 | consume | audit-write (`core.append_audit_record.v1`), outbox-write (`core.write_outbox_event.v1`), UUIDv7 + `core.allocate_human_reference.v1`, POLICY read, feature flags | Platform Core owns all `core.*` services |

**Excluded:** no ownership transfer in any direction; emitting the outbox event is the boundary — RFQ authors no consumer's contract; no clarification-thread/Communication contract authored (DE-6).

---

## §E10 — Event & Dependency Map (Pass-A consolidation)

**Emitted (Doc-2 §8 RFQ catalog; via Doc-4B outbox-write; no event coined):** `RFQCreated` (`create_rfq`/`reissue_rfq`), `RFQSubmitted` (`submit_rfq`), `RFQApproved` (`approve_rfq`), `RFQMatched` (`run_matching_pipeline`/`rematch_incremental`), `RFQRouted` (`assemble_and_route_wave`/`replenish_wave`/`rematch_incremental`), `VendorInvited` (delivery — **only** at invitation `delivered`), `QuotationSubmitted` (`submit_quotation`), `QuotationWithdrawn` (`withdraw_quotation`), `QuotationSelected` (`award_rfq`), `RFQClosedWon` (`award_rfq`), `RFQClosedLost` (`close_lost_rfq`).

**Consumed (Doc-2 §8, other modules' events; idempotent — Doc-4A §16):** `VendorClaimed`, `VendorSuspended`, `VendorTierChanged[declared]`, `VendorOwnershipTransferred` (Marketplace — DE-2); `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated` (Trust — DE-3); `VendorBanned` (Admin — DE-5). Effects: eligibility/standing refresh, matching/re-rank (`regenerate_matching_results`), incremental rematch trigger (`VendorClaimed`).

**Non-events (verified absent from Doc-2 §8 — bound as state + audit only):** RFQ **cancellation** (`any active → cancelled` + §9 "cancel"); **quotation revision** (`submitted → submitted` + §9 "edit (new version)"); moderation pass/reject, internal reject, shortlist, expiry (state + audit only). **No event coined** (Doc-4A §16.4).

**Dependency markers (carried; not resolved):** DE-1…DE-8 (§E0), each to its named channel; `[ESC-RFQ-AUDIT]` (Doc-2 §9 additive), `[ESC-RFQ-POLICY]` (Doc-3 §12.2 additive).

---

## §E11 — Authorization Surface (Pass-A consolidation)

Three-layer check (active Membership + Permission Slug + Resource Scope) OR active §6B delegation grant; resolved via Identity `check_permission` (consumed, no shadow authorization). **Slugs (Doc-2 §7; none invented):**

| Slug | Space | Contracts |
|---|---|---|
| `can_create_rfq` | tenant (buyer) | create/update/submit/reissue RFQ; buyer best-and-final/extension approval |
| `can_approve_rfq` | tenant (buyer) | internal approve/reject; self-approve-on-submit |
| `can_view_rfq` (own-RFQ scope) / `can_view_all_rfqs` (all-org scope) | tenant (buyer) | RFQ/version/comparison reads — **two distinct slugs, never merged** |
| `can_cancel_rfq` | tenant (buyer) | cancel RFQ |
| `can_approve_vendor_selection` | tenant (buyer) | shortlist; close-lost |
| `can_award_rfq` | tenant (buyer) | award (→ closed_won) |
| `can_submit_quote` | tenant (vendor; + delegation) | submit/revise quotation |
| `can_respond_to_rfq` | tenant (vendor; + delegation) | invitation accept / formal decline; request late extension |
| `can_withdraw_quote` | tenant (vendor; + delegation) | withdraw quotation |
| `staff_can_moderate_rfq` | platform-staff (§5.6) | moderation pass/reject; (routing-rule/human-assist use platform-staff authority) |

Vendor-side write scope = quoting vendor's controlling org (or §6B delegation grant); buyer-side write scope = buyer controlling org; system-actor transitions (pipeline, validity clock, coverage-exhausted) carry no org context; routing-rule/human-assist are platform-staff (§5.6). **No role bundle authored** (Identity-seeded); **no slug invented** (§6.4).

---

## §E12 — Audit Surface (Pass-A consolidation)

All audited mutations bind to Doc-2 §9 via Doc-4B `core.append_audit_record.v1` (in-transaction; never re-implemented); reads not audited (§17.1).

**Doc-2 §9 RFQ domain:** create, edit (new version), submit, internal approve/reject, moderation pass/fail, cancel, expire (system actor), shortlist, close won/lost; routing run (mode, filter reference); invitation transitions `InvitationDelivered`/`InvitationAccepted`/`InvitationDeclined`/`InvitationExpired`. **Doc-2 §9 Quotation domain:** create, edit (new version), submit, withdraw, select, reject.

**`[ESC-RFQ-AUDIT]` (carried; interim = nearest §9 action by pointer; channel Doc-2 §9 additive; no action invented):** `under_review→draft` moderation-reject (PATCH-D2-01); `matching→expired` coverage-exhausted expiry (PATCH-D2-02); `incremental_rematch` routing-log entries (PATCH-D3-03); `buyer_directed` invitation creation (PATCH-D3-02). Each binds the nearest enumerated §9 action (moderation pass/fail; expire; routing run) until the additive patch lands.

---

## §E13 — AI-Agent Implementation Considerations (Pass-A consolidation)

- **Consume, never re-derive:** Doc-4B services (audit/outbox/UUIDv7/human-ref/POLICY/flags — DE-8), Doc-4C authorization/membership/delegation (DE-1), Doc-4D `vendor_matching_attributes` read-model + vendor data (DE-2). Honor Doc-2 §5.4/§5.5 machines (incl. PATCH-D2-01/02) verbatim; bind every operational rule to Doc-3 by pointer.
- **Moat protection:** Marketplace owns vendor discovery/profiles/attributes — RFQ reads, never re-models (DE-2); RFQ owns matching/routing/ranking/selection/comparison/decision-support — no shadow re-implementation. Trust signals read-only, never mutated (DE-3, firewall); buyer CRM/blacklist read under non-disclosure (DE-4); moderation/ban are Admin's, reflected (DE-5); notification fan-out is Communication's, never authored (DE-6); entitlement/quota is Billing's, read-only, and **payment never influences gates/scores/confidence/fairness** (DE-7, firewall).
- **Ambiguity prevention:** non-disclosure invariant (blacklist/deferral indistinguishable from non-match; no protected-fact exposure in any surface/count/log — Doc-2 §10.11; §7.5); no auto-winner pre-award (decision-support boundary); three-instrument quota identity (no cross-consumption); single award; terminal states never reopen (re-issue only). **No event/slug/audit-action/POLICY-key invention** — escalate via DE / `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]`.
- **Self-check before review:** run the Doc-4A Appendix A conformance checklist (CHK-xxx) — every command/query/system contract uses 21.4/21.3/21.5, every admin uses 21.6; no new entity/state/transition; slugs in Doc-2 §7; events in Doc-2 §8; audit actions in Doc-2 §9; POLICY by key; non-disclosure + firewall declarations present; integration authored by source module. Audience: Claude Code, Cursor, backend, frontend, QA, AI Coding Agents.

---

## Appendix A — Module 3 Contract Inventory (Pass-A)

| # | Contract-ID | Capability | Template | Owned aggregate/entity | Actor | BC / §E | Authoritative source |
|---|---|---|---|---|---|---|---|
| 1 | `rfq.create_rfq.v1` | Create RFQ draft | 21.4 | RFQ (`rfqs`,`rfq_versions`) | User | BC-1/§E4 | Doc-2 §5.4; Doc-3 §1.2 |
| 2 | `rfq.update_rfq.v1` | Edit/version RFQ | 21.4 | RFQ (`rfq_versions`) | User | BC-1/§E4 | Doc-2 §5.4; Doc-3 §1.2 |
| 3 | `rfq.submit_rfq.v1` | Submit RFQ | 21.4 | RFQ (`rfqs`) | User | BC-1/§E4 | Doc-2 §5.4; Doc-3 §1.2 |
| 4 | `rfq.approve_rfq.v1` / `rfq.reject_internal_rfq.v1` | Internal approval decision | 21.4 | RFQ (`rfqs`) | User | BC-1/§E4 | Doc-2 §5.4; Doc-3 §1.2 |
| 5 | `rfq.moderate_rfq.v1` | Moderation pass/reject | 21.6 | RFQ (`rfqs`) | Admin | BC-1/§E4 | Doc-2 §5.4 PATCH-D2-01; Doc-3 §1.2 (DE-5) |
| 6 | `rfq.cancel_rfq.v1` | Cancel RFQ | 21.4 | RFQ (`rfqs`) | User | BC-1/§E4 | Doc-2 §5.4; Doc-3 §1.2 |
| 7 | `rfq.reissue_rfq.v1` | Re-issue RFQ | 21.4 | RFQ (`rfqs`) | User | BC-1/§E4 | Doc-3 §1.6 |
| 8 | `rfq.get_rfq.v1` / `rfq.list_rfqs.v1` / `rfq.get_rfq_version.v1` | RFQ reads | 21.3 | RFQ | User/internal-service | BC-1/§E4 | Doc-2 §6/§10.4; Doc-3 §5.1 |
| 9 | `rfq.expire_rfq.v1` | System expiry (validity / coverage-exhausted) | 21.5 | RFQ (`rfqs`) | System | BC-1/§E4 | Doc-2 §5.4 PATCH-D2-02; Doc-3 §1.4/§1.2 |
| 10 | `rfq.run_matching_pipeline.v1` | Execute pipeline → `matching_results` | 21.5 | Matching Result | System | BC-2/§E5 | Doc-3 §3.1/§6 |
| 11 | `rfq.rematch_incremental.v1` | Incremental rematch | 21.5 | Matching Result; `rfq_routing_log` | System | BC-2/§E5 | Doc-3 §11.4 PATCH-D3-03 |
| 12 | `rfq.get_matching_results.v1` | Read matching results | 21.3 | Matching Result | internal-service/Admin | BC-2/§E5 | Doc-2 §3.4/§6 |
| 13 | `rfq.regenerate_matching_results.v1` | Re-rank on signal change | 21.5 | Matching Result | System | BC-2/§E5 | Doc-2 §8; Doc-3 §6 (DE-2/DE-3) |
| 14 | `rfq.assemble_and_route_wave.v1` | Selection/throttle/route wave | 21.5 | Invitation (`rfq_invitations`,grantees,grants); `rfq_routing_log` | System | BC-3/§E6 | Doc-3 §3.1 D–F/§5 |
| 15 | `rfq.replenish_wave.v1` | Replenishment wave | 21.5 | Invitation | System | BC-3/§E6 | Doc-3 §5.3 |
| 16 | `rfq.drain_deferred_queue.v1` | Deferred-queue drain | 21.5 | Invitation | System | BC-3/§E6 | Doc-3 §4.3 |
| 17 | `rfq.respond_to_invitation.v1` | Accept / formal decline | 21.4 | Invitation (`rfq_invitations`) | User | BC-3/§E6 | Doc-2 §3.4; Doc-3 §5.4/§8.4 |
| 18 | `rfq.assist_routing.v1` | Human-assisted routing | 21.6 | RFQ; `rfq_routing_log` | Admin | BC-7/§E6 | Doc-3 §3.6/§0.1 |
| 19 | `rfq.manage_routing_rule.v1` | Routing-rule control plane | 21.6 | Routing Rule (`routing_rules`) | Admin | BC-7/§E6 | Doc-2 §3.4; Doc-3 §12 |
| 20 | `rfq.get_routing_log.v1` / `rfq.get_invitation.v1` / `rfq.list_invitations.v1` | Routing/invitation reads | 21.3 | `rfq_routing_log`, Invitation | User/Admin/internal-service | BC-3/§E6 | Doc-2 §3.4; §10.11 |
| 21 | `rfq.submit_quotation.v1` | Submit quotation | 21.4 | Quotation (`quotations`,`quotation_versions`) | User | BC-4/§E7 | Doc-2 §5.5; Doc-3 §8.1/§4.1.1 |
| 22 | `rfq.revise_quotation.v1` | Revise quotation | 21.4 | Quotation (`quotation_versions`) | User | BC-4/§E7 | Doc-2 §5.5; Doc-3 §8.2 |
| 23 | `rfq.withdraw_quotation.v1` | Withdraw quotation | 21.4 | Quotation (`quotations`) | User | BC-4/§E7 | Doc-2 §5.5; Doc-3 §8.3 |
| 24 | `rfq.request_late_extension.v1` | Late-quote extension | 21.4 | RFQ/Quotation window | User | BC-4/§E7 | Doc-3 §8.5 |
| 25 | `rfq.get_quotation.v1` / `rfq.list_quotations_for_rfq.v1` | Quotation reads | 21.3 | Quotation; `quotation_visibility` | User | BC-4/§E7 | Doc-2 §3.4/§6 |
| 26 | `rfq.generate_comparison_statement.v1` | Generate/refresh comparison | 21.5 | Comparison Statement | System | BC-5/§E8 | Doc-3 §9.1; Doc-2 §3.4 |
| 27 | `rfq.shortlist_quotation.v1` | Shortlist | 21.4 | RFQ (`rfqs`) | User | BC-5/§E8 | Doc-2 §5.4; Doc-3 §9.2 |
| 28 | `rfq.manage_clarification.v1` / `rfq.invoke_best_and_final.v1` | Clarification & best-and-final | 21.4 | RFQ (orchestration; thread = Communication) | User | BC-5/§E8 | Doc-3 §9.3 (DE-6) |
| 29 | `rfq.award_rfq.v1` | Award → closed_won | 21.4 | RFQ (`rfqs`) terminal | User | BC-6/§E8 | Doc-2 §5.4; Doc-3 §9.4 |
| 30 | `rfq.close_lost_rfq.v1` | Close without award | 21.4 | RFQ (`rfqs`) terminal | User | BC-6/§E8 | Doc-2 §5.4; Doc-3 §9.5 |
| 31 | `rfq.get_comparison_statement.v1` | Read comparison (→ buyer_reviewing) | 21.3 | Comparison Statement | User | BC-5/§E8 | Doc-3 §9.1; Doc-2 §5.4 |

*Skeleton inventory — working contract names (Doc-4A §21 namespace `rfq_`); Pass-B finalizes per-Contract-ID payloads, validation order, error codes, and any contract split. No contract instantiated beyond this Pass-A record.*

---

## Appendix B — Conformance Binding Map (Pass-A)

| §E section | Governing Doc-4A standard(s) | Consumed frozen services / read-models |
|---|---|---|
| §E4 RFQ lifecycle | §21.4/§21.5/§21.3, §13 (state), §11 (validation), §12 (errors), §17 (audit), §16 (events) | Doc-4B audit/outbox/human-ref (DE-8) |
| §E5 pipeline | §21.5/§21.3, §4B (firewall), §16, §17 | Doc-4D `vendor_matching_attributes` (DE-2); Trust signals (DE-3); Operations CRM (DE-4); Billing quota (DE-7) |
| §E6 routing/governance | §21.5/§21.4/§21.6/§21.3, §18/§18B (POLICY/stage), §7.5 (non-disclosure) | Doc-4B outbox (DE-8); Communication (DE-6); Operations leads (DE-4); Identity grants (DE-1) |
| §E7 quotation | §21.4/§21.3, §6B (delegation), §14 (idempotency), §19 (quota) | Billing quota (DE-7); Identity delegation (DE-1) |
| §E8 evaluation/closure | §21.4/§21.5/§21.3, §4B (buyer-preference firewall) | Operations engagement (DE-4); Trust/Marketplace standing (DE-2/DE-3); Communication (DE-6) |
| §E9–§E13 cross-cutting | §4/§4.4 (single-authorship), §5/§6/§6B, §16/§17, Appendix A/B | Doc-4B/Doc-4C/Doc-4D (consumed) |

Doc-4E redefines none of the above; all bindings are by pointer.

---

## Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers (UNCHANGED)

DE-1 (Identity), DE-2 (Marketplace vendor-data / moat seam), DE-3 (Trust signals / firewall), DE-4 (Operations CRM + post-award + vendor CRM), DE-5 (Admin moderation & ban), DE-6 (Communication single-authorship), DE-7 (Billing entitlement & quota / firewall), DE-8 (Platform Core); `[ESC-RFQ-AUDIT]` (Doc-2 §9 additive — moderation-reject, coverage-exhausted expiry, incremental-rematch, buyer_directed invitation); `[ESC-RFQ-POLICY]` (Doc-3 §12.2 additive — referenced-key-must-exist obligation, satisfied today). **Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Doc-4E.

---

## Appendix D — Cross-Reference Index (Pass-A)

| Binding point | Authoritative source (with patch ID per Doc-4A §3) |
|---|---|
| RFQ state machine | Doc-2 §5.4 as amended by `Doc-2_Patch_v1.0.3` PATCH-D2-01 (moderation reject) + PATCH-D2-02 (coverage-exhausted expiry) |
| Quotation state machine | Doc-2 §5.5 |
| RFQ/Quotation entities | Doc-2 §2 (Module 3), §3.4, §10.4 |
| Permissions | Doc-2 §7 (`can_*_rfq`, `can_*_quote`, `can_respond_to_rfq`, `staff_can_moderate_rfq`) |
| Events | Doc-2 §8 (RFQ catalog; consumed Marketplace/Trust/Admin events) |
| Audit actions | Doc-2 §9 (RFQ + Quotation domains) |
| POLICY keys | Doc-3 §12.2 (`rfq.*`,`moderation.*`,`matching.*`,`routing.*`,`fairness.*`,`capacity.*`,`distribution.*`,`confidence.*`,`quote.*`,`eval.*`,`abuse.*`,`leads.*`) |
| Operational rules | Doc-3 v1.0.2 §1–§11 (+ `Doc-3_Patch_v1.0.2` PATCH-D3-01…05) |
| Pipeline / events patch | Architecture Patch v1.0.1 PATCH-06 (`RFQMatched`/`RFQRouted`) |
| Standards / templates | Doc-4A v1.0 §4/§4.4/§4B/§5/§6/§6B/§7/§8/§11/§12/§13/§14/§16/§17/§18/§18B/§21 |
| Consumed services | Doc-4B (audit/outbox/UUIDv7/human-ref/POLICY/flags), Doc-4C (`check_permission`/delegation), Doc-4D (`vendor_matching_attributes`) |

---

## Appendix E — Doc-3 Operational-Rule Binding Index

Pointer-only mapping from each procurement behavior to its governing Doc-3 v1.0.2 section(s) (+ patch IDs). **No rule is restated or derived here** — content-pass authors bind by pointer; Doc-3 owns the rules.

| Behavior | Governing Doc-3 section(s) | Bound in §E |
|---|---|---|
| Lifecycle | §1 (RFQ lifecycle), §1.2 (state-by-state), §1.4 (validity clock), §1.6 (reopening/re-issue); + `Doc-3_Patch_v1.0.2` PATCH-D3-04/05 | §E4 |
| Matching | §2 (eligibility), §3.1 (canonical pipeline Phase A–C), §6 (matching confidence) | §E5 |
| Routing | §3.1 (Phase D–F), §3.2 (telemetry), §3.6 (human-assisted), §0.1 (operating stage) | §E6 |
| Fairness | §3.3 (equivalence bands, exposure ceiling/ratio, anti-starvation, salted tie-break, selection doctrine) | §E6 |
| Capacity | §4 (three capacities, exhaustion/defer, recovery, adjustment, firewall §4.5) | §E6 |
| Distribution | §5 (no public board, wave sizing, waves/replenishment, invitation rules, anti-spam) | §E6 |
| Quotation | §8 (submit/revise/withdraw/decline/late) + §4.1.1 three-instrument quota (`Doc-3_Patch_v1.0.2` PATCH-D3-01) | §E7 |
| Evaluation | §9.1 (comparison), §9.2 (shortlist), §9.3 (clarification/best-and-final) | §E8 |
| Closure | §9.4 (award/single-award/split), §9.5 (loss); §1.2 terminal states | §E8 |
| Abuse controls | §10 (farming, fake RFQs, vendor spam, quote dumping, capacity/tier gaming, review manipulation, collusion) | §E5/§E6/§E8 (as obligations) |
| Economic controls | §11 (vendor/buyer fairness, growth balance, coverage recovery §11.4, lead qualification §11.6, guarantee accounting §11.7, commercial-entitlement boundary §11.8) | §E6/§E8 (+ DE-7 firewall) |

*Pointer index only; bound by reference, never restated (Doc-4A §0.3).*

---

*End of Doc-4E — RFQ Procurement Engine — Pass-A APPROVED v1.0 (authoritative baseline). Consolidates `Doc-4E_Content_v1.0_PassA.md` as amended by `Doc-4E_PassA_Patch_v1.0.md`. Authored against `Doc-4E_Structure_v1.0_FROZEN.md` (sole structure authority). Every contract bound by pointer to the frozen corpus; no entity, state, transition, permission slug, event, audit action, POLICY key, or template invented. Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]` referenced by name and never resolved. Authorized next stage: Pass-A Freeze Audit.*
