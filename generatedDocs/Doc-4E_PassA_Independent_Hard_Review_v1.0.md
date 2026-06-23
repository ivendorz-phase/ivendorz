# Doc-4E — RFQ Procurement Engine — Pass-A Independent Hard Review

| Field | Value |
|---|---|
| Review Type | Independent Hard Review — Content Pass-A |
| Document Under Review | `Doc-4E_Content_v1.0_PassA.md` |
| Review Objective | Determine whether Doc-4E Pass-A is sufficiently correct, complete, and governance-compliant to proceed toward Pass-A Approval, Pass-A Freeze, and Pass-B Authoring |
| Reviewer Roles | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Governance Auditor |
| Review Date | 2026-06-17 |
| Structure Authority | `Doc-4E_Structure_v1.0_FROZEN.md` |
| Corpus Frozen At | Architecture v1.0 FINAL · ADR Compendium v1 · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A v1.0 · Doc-4B v1.0 · Doc-4C v1.0 · Doc-4D v1.0 |
| Review Posture | Consumed by Claude Code · Cursor · Backend Engineers · Frontend Engineers · QA Engineers · AI Coding Agents |

**Review posture.** This review is aggressive: defects are assumed to exist until proven otherwise. The reviewer acts as independent evaluator only — does not redesign, invent, or suggest architectural changes. On any corpus conflict: FLAG-AND-HALT. No prior review report is referenced.

---

## Domain 1 — Structure Conformance

**Checks:**

§E0–§E14 present and serving correct purposes? ✓ All 15 frozen sections present with appropriate Pass-A content.

Pass-A scope statement correct and binding? ✓ Per-contract shape declared; "no entity, state, transition, permission slug, event, audit action, POLICY key, or template is invented" — stated and honored.

§B cross-cutting conventions correct? ✓ B.1 (templates), B.2 (actors), B.3 (identifiers), B.4 (authorization), B.5 (audit), B.6 (events), B.7 (firewall), B.8 (AI-agent source rule) — all present, correctly bound.

Appendices A–E presence: Appendix A (Contract Inventory) ✓, Appendix B (Conformance Binding Map) ✓, Appendix C (Carried Markers) ✓, Appendix D (Cross-Reference Index) ✓. **Appendix E (Doc-3 Operational-Rule Binding Index) is absent.** The frozen structure §E14 explicitly lists Appendix E as a required deliverable for the content passes to populate.

BC→section mapping honored? ✓ BC-1→§E4, BC-2→§E5, BC-3→§E6, BC-4→§E7, BC-5→§E8, BC-6→§E8 (absorbed), BC-7→§E6 — all placements correct per the frozen Domain Map.

No unauthorized sections added. ✓

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-01 | MINOR | §E14 / Appendix section | **Appendix E missing.** The frozen structure §E14 names "Appendix E — Doc-3 Operational-Rule Binding Index" as a required appendix, described as a pointer table from each procurement behavior to its Doc-3 §. The Pass-A document contains Appendices A–D but omits Appendix E entirely. The structure rationale (Deliverable E of the frozen structure) explicitly justified Appendix E as structure-specific to the moat, keeping Pass-A authors binding by pointer rather than re-deriving. Its absence deprives Pass-B authors of the promised pointer table. | `Doc-4E_Structure_v1.0_FROZEN.md` §E14 Appendix E (required) | Populate Appendix E with the Doc-3 Operational-Rule Binding Index — a pointer table from lifecycle/eligibility/pipeline/fairness/capacity/distribution/confidence/quotation/evaluation/abuse/economics to the governing Doc-3 §. Pass-A depth is a pointer table only; no rule derivation. |

---

## Domain 2 — Contract Inventory Completeness

**Checks:**

31 contracts across Appendix A. Review against functional coverage required:

**RFQ lifecycle (BC-1/§E4):**
- Create draft ✓ | Edit/version ✓ | Submit ✓ | Internal approve/reject ✓ | Moderation pass/reject ✓ | Cancel ✓ | Re-issue ✓ | Reads (get/list/version) ✓ | System expiry ✓

**Matching pipeline (BC-2/§E5):**
- Run pipeline ✓ | Incremental rematch ✓ | Read results ✓ | Regenerate (re-rank on signal change) ✓

**Routing/selection/distribution (BC-3/§E6):**
- Assemble and route wave ✓ | Replenishment wave ✓ | Deferred-queue drain ✓ | Invitation response ✓ | Routing/invitation reads ✓

**Routing governance (BC-7/§E6 absorbed):**
- Human-assisted routing ✓ | Manage routing rule ✓

**Quotation management (BC-4/§E7):**
- Submit ✓ | Revise ✓ | Withdraw ✓ | Late extension ✓ | Reads ✓

**Buyer evaluation / comparison (BC-5/§E8):**
- Generate/refresh comparison ✓ | Shortlist ✓ | Clarification & best-and-final ✓ | Read comparison ✓

**Procurement decision & closure (BC-6/§E8 absorbed):**
- Award (→ closed_won) ✓ | Close without award (→ closed_lost) ✓

**Gap analysis — invitation expiry contract:**
The frozen structure §E4 identifies `InvitationExpired` as an audit action (Doc-2 §9). Doc-2 §3.4 defines the invitation lifecycle as `draft → selected → deferred → delivered → accepted | declined | expired`. The expiry of an invitation (runway exhaustion, RFQ terminal) must be system-executed. No contract covers the system-actor invitation-expiry sweep (advancing `delivered → expired` or `deferred → expired` when the RFQ closes/expires or runway is exhausted). The `rfq.expire_rfq.v1` contract covers RFQ-level expiry and states "open invitations/quotations → expired with no vendor performance penalty" — but this describes an **effect**, not an authored contract. There is no explicit 21.5 System contract for the invitation-expiry sweep itself, and no deferred-expiry-on-insufficient-runway contract separate from `drain_deferred_queue`.

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-02 | MINOR | §E6 / Appendix A | **Invitation-expiry sweep not a named contract.** When an RFQ reaches a terminal state (`cancelled`, `expired`, `closed_won`, `closed_lost`), all `delivered`/`accepted` invitations and any `deferred` invitations must transition to `expired` (Doc-2 §3.4 invitation lifecycle terminal path; Doc-2 §9 `InvitationExpired` audit action). This is a system-actor operation. The current Pass-A handles it only as a side-effect note inside `rfq.expire_rfq.v1` and `rfq.drain_deferred_queue.v1`, without a named contract. Pass-B authors have no contract to implement the invitation-expiry sweep against. The audit action `InvitationExpired` (Doc-2 §9) is listed in §E12 but has no owning contract that fires it. | Doc-2 §3.4 (invitation lifecycle — `expired` state); Doc-2 §9 (`InvitationExpired` audit action); Doc-3 §5.4 (slot frees on response/expiry) | Either: (a) add a named 21.5 System contract `rfq.expire_invitations.v1` covering the system-actor sweep of open/deferred invitations to `expired` on RFQ terminal events, with audit `InvitationExpired`; or (b) explicitly absorb this responsibility into `rfq.expire_rfq.v1` with a clear statement that the expiry contract also fires the invitation sweep. Option (b) is simpler and avoids a new contract entry. |
| PA-03 | NITPICK | Appendix A row 4 | `rfq.approve_rfq.v1` and `rfq.reject_internal_rfq.v1` are listed as a single Appendix A row (#4) but represent two separate commands with different state transitions, different audit actions, and different event behaviors (`RFQApproved` fires on approve; nothing fires on reject). This is consistent with the per-contract record body (which correctly handles them together with separate outcome descriptions), but Appendix A treating them as one entry may cause Pass-B to assign them a single Contract-ID rather than splitting them at the right time. | Doc-4A §21.4 (each command is a distinct contract); Doc-2 §5.4 (`pending_internal_approval → submitted` vs `→ draft`) | Either note explicitly in Appendix A that these will be split into two Contract-IDs at Pass-B, or split them now. No corpus violation at Pass-A; this is a Pass-B risk marker. |

---

## Domain 3 — Ownership Integrity

**Checks:**

Marketplace owns only vendor discovery, profiles, attributes — RFQ never re-models them:
- Every cross-module read of vendor data is via service (DE-2 consume). ✓
- No `vendor_profiles` or `vendor_matching_attributes` entity authored. ✓
- Comparison statement vendor-standing columns ("trust band, performance badge, verification depth, tier") are read from Trust/Marketplace "by service (DE-2/DE-3, read-only)" — §E8 `generate_comparison_statement` ✓

RFQ owns matching/routing/ranking/selection/comparison/decision-support:
- All pipeline contracts (BC-2, BC-3) owned by RFQ. ✓
- No other module is described as performing matching logic. ✓
- DD-2 mirror confirmed in §E0 DE-2. ✓

Post-award engagement ownership:
- `rfq.award_rfq.v1`: "Operations creates the `engagement` on `RFQClosedWon` (DE-4 — RFQ does not author the engagement)" ✓

Moderation decision authority:
- `rfq.moderate_rfq.v1`: "moderation decision authority = Admin (DE-5)" ✓

Communication single-authorship:
- §E9 table: "Communication owns notification fan-out and authors all notification/Communication contracts — RFQ authors none" ✓
- `rfq.manage_clarification.v1`: "RFQ MUST NOT author a thread entity or Communication contract" ✓

Billing quota firewall:
- All quota reads are read-only (DE-7 consume); "payment never influences matching" stated in B.7 and per-contract ✓

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-04 | MAJOR | §E8 `rfq.generate_comparison_statement.v1` Cross-Module | **Comparison statement reads Trust/Marketplace data directly without clear service-boundary framing.** The contract states: "vendor-standing columns (trust band, performance badge, verification depth, tier) read from Trust/Marketplace by service (DE-2/DE-3, read-only, buyer-scoped display)." This is correct in intent. However, the statement "read from Trust/Marketplace by service" introduces ambiguity for an AI coding agent: it is unclear whether these reads happen at comparison generation time (synchronous service call) or whether `matching_results` already carries cached signal values from the pipeline run (the pipeline reads them; the comparison references the stored result). If the comparison makes synchronous reads from Trust/Marketplace at generation time — outside the pipeline run — this could create a second uncontrolled read path for governance signals that bypasses the pipeline's FIXED gate-before-score order and could expose stale/inconsistent signal values. This is an AI-agent safety risk: an agent implementing the comparison statement could author a direct cross-module read of Trust/Marketplace outside the controlled pipeline context. The governance-signal firewall must be explicit about **which** read path is authoritative and whether the comparison reads cached `matching_results` signal values or makes live service calls. | Doc-4A §4B (governance-signal firewall); Doc-3 §6 (matching-confidence framework — signals consumed at pipeline run); Doc-4A §0.6 (flag-and-halt on ambiguity) | Clarify in `rfq.generate_comparison_statement.v1` Cross-Module entry whether vendor-standing display columns are (a) drawn from `matching_results` (the stored pipeline output, already firewalled) or (b) require a live service read at comparison generation. If (a), state "read from `matching_results` (pipeline output; signals already consumed by the pipeline under the firewall — DE-2/DE-3)". If (b), state the read path explicitly and confirm it is within the governance-signal firewall. An AI coding agent must not be left to choose between these two behaviors. |
| PA-05 | MINOR | §E6 `rfq.assist_routing.v1` Preconditions | **`staff`-scoped authority asserted but no explicit slug named.** The contract states "Preconditions: human-assist criteria met (POLICY `human_routing.criteria_thresholds`); operating stage permits (Doc-3 §0.1); `staff`-scoped authority." Authorization states "§5.6 platform-staff; bound by the FIXED forbidden-actions wall." No specific permission slug is named for the human-assist action, unlike `rfq.moderate_rfq.v1` which names `staff_can_moderate_rfq`. `rfq.manage_routing_rule.v1` similarly states "§5.6 platform-staff" without naming a slug. Doc-2 §7 enumerates platform-staff slugs; if `staff_can_moderate_rfq` is the only RFQ-domain staff slug in the catalog, the assist-routing and routing-rule management actions implicitly use it (or `staff_super_admin`), which is ambiguous for a Pass-B author. If a distinct slug is required, its absence is an `[ESC-RFQ-AUDIT]`-pattern issue (carry marker, not invent). | Doc-2 §7 (platform-staff slugs: `staff_can_moderate_rfq`, `staff_super_admin` listed; no `staff_can_manage_routing` or equivalent visible); Doc-4A §6.4 (no slug invention) | Verify Doc-2 §7 platform-staff slug catalog. If `staff_can_moderate_rfq` is the authorizing slug for routing-assist and routing-rule management, state it explicitly (scope note: "routing governance actions use `staff_can_moderate_rfq` or `staff_super_admin`"). If a distinct slug is absent from §7, carry a new `[ESC-RFQ-SLUG]` or extend `[ESC-RFQ-AUDIT]` channel; never invent. |

---

## Domain 4 — DDD Boundary Integrity

**Checks:**

**Aggregate ownership:**
- RFQ (AR: `rfqs`) → children `rfq_versions`, `rfq_invitations`, `rfq_invitation_grantees`, `rfq_document_grants`, `rfq_routing_log` ✓
- Quotation (AR: `quotations`) → children `quotation_versions`, `quotation_visibility` ✓
- Comparison Statement (AR: `comparison_statements`) ✓
- Routing Rule (AR: `routing_rules`) ✓
- Matching Result (`matching_results`, derived) ✓

**Bounded-context contract placement:**
- All 31 contracts land in the declared BC per §E3 and Appendix A ✓

**No cross-aggregate direct writes without going through AR:**
- `rfq.award_rfq.v1` writes `rfqs` (AR) and transitions `quotations → selected/not_selected` (across aggregate roots). This is a domain-level business action (award closes both the RFQ and the quotations simultaneously). Doc-2 §5.4/§5.5 defines both machines as transitioning together on award. The contract does not explain the transactional scope — whether this is a single transaction across both aggregates or coordinated in sequence. For a modular monolith with one PostgreSQL schema, a single transaction across `rfqs` and `quotations` is feasible and correct, but the contract must be explicit since AI coding agents will implement this.
- `rfq.close_lost_rfq.v1` same cross-aggregate pattern (RFQ → `closed_lost`; quotations → `not_selected`).

**Lifecycle ownership (no unauthorized state transition):**
- `rfq.expire_rfq.v1` correctly handles both expiry edges (validity-lapse + coverage-exhausted) ✓
- Moderation-reject edge correctly attributed to Admin actor ✓

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-06 | MINOR | §E8 `rfq.award_rfq.v1` / `rfq.close_lost_rfq.v1` State-Machine | **Cross-aggregate transactional scope not declared.** `rfq.award_rfq.v1` drives two aggregate state transitions simultaneously: `rfqs → closed_won` (RFQ aggregate) and `quotations → selected` / others `→ not_selected` (Quotation aggregate). `rfq.close_lost_rfq.v1` similarly drives `rfqs → closed_lost` and `quotations → not_selected`. Neither contract declares the transactional scope (single DB transaction? saga?). In a modular monolith (one `rfq` schema), this is a single-transaction operation and must be stated as such; an AI agent left to choose between a single transaction and a two-step operation may produce incorrect implementations where the quotation states are updated non-atomically with the RFQ state. | Doc-2 §5.4/§5.5 (both machines transition on award/close); Doc-4A §16 (transactional outbox — business write + event insert one transaction); Architecture §15 (transactional consistency) | Add to the State-Machine entry of both contracts: "Award/close drives both `rfqs` and `quotations` state transitions in a single database transaction (modular monolith, single `rfq` schema — Doc-2 §10.4); outbox events (`RFQClosedWon`/`QuotationSelected` etc.) inserted in the same transaction (Doc-4A §16)." |

---

## Domain 5 — State Machine Compliance

**Checks against Doc-2 §5.4 (RFQ) + PATCH-D2-01/02 and §5.5 (Quotation):**

**RFQ machine — all edges accounted for:**
- `draft → submitted` ✓ (`submit_rfq`)
- `draft → pending_internal_approval` ✓ (`submit_rfq`)
- `pending_internal_approval → submitted` ✓ (`approve_rfq`)
- `pending_internal_approval → draft` ✓ (`reject_internal_rfq`)
- `submitted → under_review` (moderation pass, implicit in moderate_rfq — the contract covers `submitted/under_review` → either `matching` or `draft`) ✓
- `under_review → matching` ✓ (`moderate_rfq`)
- `under_review → draft` (PATCH-D2-01) ✓ (`moderate_rfq`)
- `matching → vendors_notified` ✓ (`assemble_and_route_wave`)
- `matching → expired` (PATCH-D2-02) ✓ (`expire_rfq`)
- `vendors_notified → quotations_received` — **gap**: No contract drives this transition.
- `quotations_received → buyer_reviewing` ✓ (`get_comparison_statement` — first open drives this)
- `buyer_reviewing → shortlisted` ✓ (`shortlist_quotation`)
- `shortlisted → closed_won` ✓ (`award_rfq`)
- `shortlisted → closed_lost` ✓ (`close_lost_rfq`)
- `vendors_notified|quotations_received|buyer_reviewing → expired` (validity lapse) ✓ (`expire_rfq`)
- `any active → cancelled` ✓ (`cancel_rfq`)

**Gap found: `vendors_notified → quotations_received`**

Doc-2 §5.4 states this transition is triggered by "first quotation." This is a system-actor transition that should fire when the first `QuotationSubmitted` is received while the RFQ is in `vendors_notified`. The `rfq.submit_quotation.v1` contract does not mention this RFQ state transition as a side effect. The RFQ machine currently has no contract or side-effect note responsible for advancing `vendors_notified → quotations_received`. An AI coding agent implementing `submit_quotation` would have no instruction to also advance the parent RFQ state.

**Quotation machine — all edges:**
- `draft → submitted` ✓ (`submit_quotation`)
- `submitted → submitted` (revise/new version) ✓ (`revise_quotation`)
- `submitted → withdrawn` ✓ (`withdraw_quotation`)
- `submitted → selected` ✓ (`award_rfq`)
- `submitted → not_selected` ✓ (`award_rfq` / `close_lost_rfq`)
- `submitted → expired` (RFQ terminal) — side effect of `expire_rfq`; not explicitly authored
- `draft → discard` — no contract; correctly treated as a soft-delete operation on a draft quotation

**Invitation lifecycle:**
- `draft → selected → deferred → delivered` ✓ (wave assembly)
- `delivered → accepted | declined` ✓ (`respond_to_invitation`)
- `delivered → expired` / `deferred → expired` — see PA-02 (invitation-expiry sweep)

**Terminal states:**
- RFQ: `closed_won`, `closed_lost`, `cancelled`, `expired` — all correctly terminal, no reopen ✓
- Quotation: `withdrawn`, `selected`, `not_selected`, `expired` — correctly terminal ✓

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-07 | MAJOR | §E7 `rfq.submit_quotation.v1` State-Machine | **`vendors_notified → quotations_received` transition not authored.** Doc-2 §5.4 defines "first quotation → `quotations_received`" as an explicit RFQ state transition triggered on first quotation submission. The `rfq.submit_quotation.v1` contract drives `quotations draft → submitted` and triggers `invitation → accepted`, but contains no mention of the RFQ-level state transition `vendors_notified → quotations_received`. An AI coding agent implementing `submit_quotation` will not know to advance the parent RFQ. This is a missing state-machine effect — not a design decision; Doc-2 §5.4 is explicit. | Doc-2 §5.4 (`vendors_notified ──first quotation──▶ quotations_received`); Doc-4A §13 (state-machine declaration — all transitions must be owned by a contract) | Add to `rfq.submit_quotation.v1` State-Machine entry: "If RFQ is in `vendors_notified` and this is the first `submitted` quotation for this RFQ, advance `rfqs` `vendors_notified → quotations_received` (Doc-2 §5.4) in the same transaction." This is a side-effect of the quotation-submit command on the parent aggregate. |
| PA-08 | MINOR | §E7 `rfq.expire_rfq.v1` State-Machine | **`quotations submitted → expired` not explicitly declared as a side-effect.** Doc-2 §5.5 includes `submitted ──rfq cancelled/expired──▶ expired` as a terminal edge. The `rfq.expire_rfq.v1` contract states "open invitations/quotations → expired" in the Events section but not in the State-Machine section. A Pass-B author reading only the State-Machine block would not know to sweep open quotations to `expired` on RFQ expiry. Similarly for `rfq.cancel_rfq.v1` (Doc-2 §5.5 same terminal edge). | Doc-2 §5.5 (`submitted ──rfq cancelled/expired──▶ expired`); Doc-4A §13 | Add to the State-Machine entry of `rfq.expire_rfq.v1` and `rfq.cancel_rfq.v1`: "On RFQ transition to terminal state, all `submitted` quotations → `expired` (Doc-2 §5.5 terminal-edge cascade), audited per Doc-2 §9 Quotation 'reject' (nearest §9 action; `[ESC-RFQ-AUDIT]`)." |
| PA-09 | MINOR | §E4 `rfq.moderate_rfq.v1` Preconditions | **Precondition states `submitted`/`under_review` ambiguity.** The Preconditions field reads: "state `submitted`/`under_review`." The Doc-2 §5.4 machine has `submitted → under_review` (moderation pass) and `under_review → draft` (moderation reject). The moderation pass clears `submitted → under_review → matching` as a combined path, but the actual actor checkpoint is at `under_review` state (the submission triggers automatic entry to `under_review`). The precondition `submitted` may lead a Pass-B author to implement the moderation action as triggerable from `submitted` state directly (bypassing `under_review`), which contradicts the machine. The machine has no `submitted → draft` edge; reject is only from `under_review`. | Doc-2 §5.4 (machine: `submitted ──moderation pass──▶ under_review ──cleared──▶ matching`; `under_review ──moderation reject──▶ draft`); Doc-2_Patch_v1.0.3 PATCH-D2-01 | Correct the Precondition to "state `under_review`" — that is the state from which both moderation outcomes are possible. The `submitted → under_review` transition is automatic (system or process-driven per Doc-3 §1.2 `moderation.mode`), not a platform-staff action. The moderator acts on `under_review` items only. |

---

## Domain 6 — Authorization Compliance

**Checks against Doc-2 §7:**

Slugs used in Pass-A vs. Doc-2 §7 catalog:

| Slug | In Pass-A | In Doc-2 §7 | Status |
|---|---|---|---|
| `can_create_rfq` | ✓ | ✓ | Verified |
| `can_approve_rfq` | ✓ | ✓ | Verified |
| `can_view_rfq` | ✓ (own-RFQ scope) | ✓ ("all" roles) | Verified |
| `can_view_all_rfqs` | ✓ (all-org scope) | ✓ (O,D,M) | Verified |
| `can_cancel_rfq` | ✓ | ✓ (O,D,M) | Verified |
| `can_approve_vendor_selection` | ✓ | ✓ (O,D,M) | Verified |
| `can_award_rfq` | ✓ | ✓ (O,D) | Verified |
| `can_submit_quote` | ✓ | ✓ (O,D,M,F — vendor side; delegation) | Verified |
| `can_respond_to_rfq` | ✓ | ✓ (O,D,M,F — vendor side; delegation) | Verified |
| `can_withdraw_quote` | ✓ | ✓ (O,D,M) | Verified |
| `staff_can_moderate_rfq` | ✓ | ✓ | Verified |

No slug invented. ✓

Three-layer + delegation model correct. ✓

`check_permission` consumed from Identity (Doc-4C §C3/§C8); no shadow authorization. ✓

**B.4 convention note on `rfq.request_late_extension.v1`:**
The contract notes buyer approval uses "buyer authority (`can_create_rfq`/buyer authority on the RFQ)". The phrasing "buyer authority" without a slug is imprecise but consistent with the overall pass-A depth. The slug `can_create_rfq` is named for the buyer approval side.

**`rfq.close_lost_rfq.v1` Authorization:**
The contract states "buyer authority (Doc-2 §7)" without naming a specific slug. The Preconditions note "RFQ in `shortlisted` (or active per Doc-3 §1.2)." The close-lost action is a procurement decision: in Doc-2 §7, `can_award_rfq` (O,D) or `can_approve_vendor_selection` (O,D,M) would be the candidate slugs. The per-contract record body states "User (buyer; `can_approve_vendor_selection`/`can_award_rfq` per the close authority)" but the Authorization field just says "§6; buyer authority (Doc-2 §7)" — incomplete for Pass-B authors who need a slug to implement against.

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-10 | MINOR | §E8 `rfq.close_lost_rfq.v1` Authorization | **Authorization field does not name specific slug(s).** The Actor Types section correctly names the slugs (`can_approve_vendor_selection`/`can_award_rfq`), but the Authorization field only says "§6; buyer authority (Doc-2 §7)" — insufficient for a Pass-B author implementing the authorization check. A Pass-B coding agent reading the Authorization field alone will not know which slug(s) apply and may invent or guess. | Doc-2 §7 (`can_approve_vendor_selection` / `can_award_rfq`); Doc-4A §6.2 (slugs only) | Set Authorization to: "§6; `can_approve_vendor_selection` (O,D,M) or `can_award_rfq` (O,D) per org configuration (Doc-2 §7); scope = buyer controlling org." |
| PA-11 | MINOR | §E6 `rfq.assist_routing.v1` / `rfq.manage_routing_rule.v1` Authorization | **Platform-staff authorization uses no named slug** (see also PA-05). Both routing-governance contracts name "§5.6 platform-staff" without a Doc-2 §7 slug. A Pass-B implementer will not know whether to check `staff_can_moderate_rfq`, `staff_super_admin`, or some unregistered slug. This is a slug-catalog lookup dependency; the resolution is not to invent but to verify and state. | Doc-2 §7 (platform-staff slugs catalog); Doc-4A §6.4 | Verify Doc-2 §7 for the applicable staff slug for routing governance. If `staff_can_moderate_rfq` covers it (broadest current RFQ-domain staff slug), state it. If a distinct slug is needed and absent, extend `[ESC-RFQ-AUDIT]` with a slug-gap sub-entry and carry. Do not leave "platform-staff" unresolved in Pass-A. |

---

## Domain 7 — Event Compliance

**Checks against Doc-2 §8:**

Emitted events verified against Doc-2 §8 RFQ catalog:

| Event | Claimed emitter | Doc-2 §8 status | Status |
|---|---|---|---|
| `RFQCreated` | `create_rfq` / `reissue_rfq` | ✓ in catalog | Verified |
| `RFQSubmitted` | `submit_rfq` | ✓ | Verified |
| `RFQApproved` | `approve_rfq` | ✓ | Verified |
| `RFQClosedWon` | `award_rfq` | ✓ | Verified |
| `RFQClosedLost` | `close_lost_rfq` | ✓ | Verified |
| `RFQMatched` | `run_matching_pipeline` / `rematch_incremental` | ✓ (Architecture Patch PATCH-06) | Verified |
| `RFQRouted` | `assemble_and_route_wave` / `replenish_wave` / `rematch_incremental` | ✓ (PATCH-06) | Verified |
| `VendorInvited` | wave / replenish / drain — delivery only | ✓ (FIXED: only at `delivered`) | Verified |
| `QuotationSubmitted` | `submit_quotation` | ✓ | Verified |
| `QuotationWithdrawn` | `withdraw_quotation` | ✓ | Verified |
| `QuotationSelected` | `award_rfq` | ✓ | Verified |

Non-events (verified absent from Doc-2 §8): RFQ cancellation, quotation revision ✓ — both correctly handled as state transitions + audit actions only.

Consumed events: `VendorClaimed`, `VendorSuspended`, `VendorTierChanged[declared]`, `VendorOwnershipTransferred` (Marketplace); `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated` (Trust); `VendorBanned` (Admin) — all correct; idempotency declared ✓

Single-authorship: RFQ authors no Communication or Operations integration contract ✓. Template 21.2 not instantiated ✓.

**Gap: `RFQApproved` fire condition**

`rfq.approve_rfq.v1` states: "`RFQApproved` (Doc-2 §8) on approve" — this is correct. However, `rfq.submit_rfq.v1` states "`RFQSubmitted` fires only on the `submitted` branch" and describes the self-approve path ("A holder of `can_approve_rfq` who submits self-approves in one step"). If a user with `can_approve_rfq` submits and self-approves, the RFQ goes directly `draft → submitted` (and the auto-pass kicks in). The question is whether `RFQApproved` should also fire in the self-approval case (it is not a pending-approval flow, but it is a semantic approval). Neither `submit_rfq` nor `approve_rfq` clarifies the self-approval event behavior. This is an ambiguity for AI coding agents.

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-12 | MINOR | §E4 `rfq.submit_rfq.v1` / `rfq.approve_rfq.v1` Events | **`RFQApproved` event behavior on self-approval path is ambiguous.** `submit_rfq` describes a self-approval variant ("A holder of `can_approve_rfq` who submits self-approves in one step, recorded as creator+approver"). The Events field of `submit_rfq` only lists `RFQSubmitted`. `approve_rfq` lists `RFQApproved`. It is unclear whether the self-approval path fires both `RFQSubmitted` and `RFQApproved`, or only `RFQSubmitted`. Doc-2 §8 emits `RFQApproved` for the approval event; if self-approval constitutes an approval, both should fire. AI coding agents implementing this split will produce inconsistent event sequences without clarification. | Doc-2 §8 (`RFQApproved` event; `rfqs` entity); Doc-4A §16 (transactional outbox — business write + event insert one transaction) | Add a note to `rfq.submit_rfq.v1` Events: "On the self-approval path (`draft → submitted` by a holder of `can_approve_rfq`), both `RFQSubmitted` and `RFQApproved` fire in the same transaction (Doc-2 §8); the internal approval is skipped but the approval event still records the semantic approval." |

---

## Domain 8 — Audit Compliance

**Checks against Doc-2 §9:**

Doc-2 §9 RFQ domain actions and their coverage in Pass-A:

| Audit action | Owner contract | Status |
|---|---|---|
| create | `create_rfq` / `reissue_rfq` | ✓ |
| edit (new version) | `update_rfq` | ✓ |
| submit | `submit_rfq` | ✓ |
| internal approve/reject | `approve_rfq` / `reject_internal_rfq` | ✓ |
| moderation pass/fail | `moderate_rfq` | ✓ |
| cancel | `cancel_rfq` | ✓ |
| expire (system actor) | `expire_rfq` | ✓ |
| shortlist | `shortlist_quotation` | ✓ |
| close won/lost | `award_rfq` / `close_lost_rfq` | ✓ |
| routing run (mode, filter reference) | `run_matching_pipeline` / `assemble_and_route_wave` / `replenish_wave` / `rematch_incremental` / `regenerate_matching_results` | ✓ |
| `InvitationDelivered` | `assemble_and_route_wave` / `replenish_wave` / `drain_deferred_queue` | ✓ |
| `InvitationAccepted` | `respond_to_invitation` | ✓ |
| `InvitationDeclined` | `respond_to_invitation` | ✓ |
| `InvitationExpired` | **No owning contract explicitly fires this** (see PA-02) | Gap |

Doc-2 §9 Quotation domain:

| Audit action | Owner contract | Status |
|---|---|---|
| create | `submit_quotation` (draft creation) | ✓ |
| edit (new version) | `revise_quotation` | ✓ |
| submit | `submit_quotation` | ✓ |
| withdraw | `withdraw_quotation` | ✓ |
| select | `award_rfq` | ✓ |
| reject | `award_rfq` / `close_lost_rfq` (not_selected = reject) | ✓ |

`[ESC-RFQ-AUDIT]` four gaps correctly carried ✓. Interim bindings stated ✓. No audit action invented ✓.

**`rfq.manage_routing_rule.v1` audit — potential mismatch:**
The contract states Audit: "Doc-2 §9 Platform 'system_configuration change' (config-governance)." Doc-2 §9 enumerates audit domains but the "Platform" category includes `system_configuration` changes (noted in §9 under "system_configuration changes audited"). However, `routing_rules` is a separate entity from `system_configuration` — it's the `routing_rules` table. Auditing a `routing_rules` edit as a `system_configuration change` may be the nearest §9 action, but it is worth carrying this as an `[ESC-RFQ-AUDIT]` gap rather than asserting a specific §9 action that may not precisely apply.

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-13 | MINOR | §E6 `rfq.manage_routing_rule.v1` Audit | **Routing-rule edit audit binds to `system_configuration change` without carrying `[ESC-RFQ-AUDIT]`.** `routing_rules` is a distinct entity from `core.system_configuration`. Doc-2 §9 enumerates audit domains by entity type; a `routing_rules` create/edit is not explicitly named. The contract asserts "Doc-2 §9 Platform 'system_configuration change'" without acknowledging the gap or carrying `[ESC-RFQ-AUDIT]`. This is the same pattern as the four currently-carried `[ESC-RFQ-AUDIT]` items. Asserting a §9 action that doesn't precisely match is a mild form of audit-action invention by assertion. | Doc-2 §9 (audit domain enumeration — `system_configuration` changes vs `routing_rules`); Frozen Structure §E0 `[ESC-RFQ-AUDIT]` (carry-not-invent rule) | Add `routing_rules` create/edit to the `[ESC-RFQ-AUDIT]` carry list as a fifth gap. Interim: bind nearest §9 action (system_configuration change); channel Doc-2 §9 additive. Update §E12 `[ESC-RFQ-AUDIT]` list accordingly. |

---

## Domain 9 — Integration Governance (DE-1 through DE-8)

**Checks:**

DE-1 (Identity): consumed only; `check_permission`/org/membership/delegation consumed ✓; no Identity entity authored ✓
DE-2 (Marketplace): consumed read-only ✓; moat seam explicit ✓; `VendorClaimed` correctly consumed not emitted ✓
DE-3 (Trust): consumed read-only as gate/scoring inputs; firewall declared ✓; signals never mutated ✓
DE-4 (Operations): CRM status read by service under non-disclosure ✓; `VendorInvited`→`vendor_leads` and `RFQClosedWon`→`engagements` authored by Operations ✓
DE-5 (Admin): moderation decision authority Admin ✓; `VendorBanned` reflected not authored ✓
DE-6 (Communication): single-authorship enforced throughout ✓; no Communication contract authored ✓; clarification thread explicitly excluded ✓
DE-7 (Billing): quota read only; entitlement facts consumed; firewall declared ✓; three-instrument identity stated ✓
DE-8 (Platform Core): audit-write / outbox-write / UUIDv7 / human-ref / POLICY consumed ✓

§E9 integration table: complete, correct directions, single-authorship sides stated ✓

**DE-4 gap — `QuotationSubmitted` → Operations:**

§E10 states: "`QuotationSubmitted` → comparison refresh + performance inputs + usage ledger." The "usage ledger" is Billing-owned (DE-7). The `QuotationSubmitted` event is listed as a primary consumer trigger for Billing's usage-ledger consumption. This is correct and single-authorship-compliant (Billing authors its own consumer). However, §E9 integration table entry for Billing (DE-7) does not mention that Billing consumes `QuotationSubmitted` — it only states "read quotation-submission quota (delivery ceiling + submission) and guarantee/credit entitlement." The `QuotationSubmitted` → usage-ledger path appears in §E10 but is absent from §E9. This is an internal consistency gap (not a corpus violation), but creates an AI-agent navigation issue: an agent reading §E9 for the Billing surface will not see the event-consumption side.

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-14 | MINOR | §E9 integration table (Billing / DE-7) | **`QuotationSubmitted` → Billing usage-ledger consumption not stated in §E9 DE-7 entry.** §E10 correctly identifies `QuotationSubmitted` as a primary-consumer trigger for "usage ledger" (Billing). §E9's DE-7 row only describes synchronous reads of quota balance/entitlement, omitting the event-consumption side. An AI agent reading §E9 for the Billing integration surface will miss that Billing is also an event consumer of `QuotationSubmitted`. Single-authorship is preserved (Billing authors its own consumer), but the §E9 entry must enumerate both directions to be complete. | Doc-4A §4.4 (single-authorship; §E9 should enumerate both consume-read and event-consumption directions per counterpart); §E10 (cross-reference) | Add to §E9 DE-7 row "RFQ surface" column: "Also emits `QuotationSubmitted` (Doc-2 §8) → Billing authors the usage-ledger consumer (DE-7; single-authorship)." |

---

## Domain 10 — Procurement Moat Protection

**Checks:**

Pay-to-win invariant (Doc-3 §11.8/§12.1 FIXED):
- B.7 states: "never lets any paid plan / entitlement / flag gate eligibility, verification, routing fairness, or matching confidence" ✓
- `run_matching_pipeline` AI-Agent Notes: "Never let payment/entitlement influence eligibility or confidence (§4B)" ✓
- `submit_quotation`: "Firewall: quota is a submission gate, never a matching input; payment never affects matching (§4B)" ✓
- `manage_routing_rule` AI-Agent Notes: "Paid plans never gate routing fairness (§4B)" ✓

Marketplace never performs matching/routing:
- DE-2 at every point is read-only ✓
- `run_matching_pipeline` cross-module: "reads Marketplace `vendor_matching_attributes` + vendor profile/capability/geography/category/tier/capacity by service (DE-2, read-only)" ✓
- No Marketplace entity performs any pipeline operation ✓

No public RFQ board:
- `get_rfq.v1` AI-Agent Notes: "there is no public RFQ board (Doc-3 §5.1 FIXED) — vendor reads are grant-scoped only" ✓
- `assemble_and_route_wave` AI-Agent Notes: implicitly covered by FIXED doctrine ✓

Non-disclosure invariant (blacklist/deferral invisible):
- B.7: "non-disclosure invariant binds every routing/eligibility/comparison surface" ✓
- `get_routing_log.v1` AI-Agent Notes: "never expose blacklist/deferral facts" ✓
- `run_matching_pipeline` AI-Agent Notes: "gate-failed vendor must never appear in `matching_results`, leads, counts, or logs" ✓

Decision-support, never auto-decision (Doc-3 §9.1 FIXED):
- `generate_comparison_statement` AI-Agent Notes: "never auto-recommend a winner" ✓
- `get_comparison_statement` AI-Agent Notes: "comparison shows standing but never an auto-recommended winner" ✓

**Findings:** None.

---

## Domain 11 — Governance Firewall Compliance

**Checks:**

**Trust firewall (trust signals read-only; never mutated by RFQ):**
- `regenerate_matching_results` Cross-Module: "Firewall: signal is a scoring input only; never mutated (§4B)" ✓
- `run_matching_pipeline` Cross-Module: "Firewall: consumes signals; mutates none" ✓

**Billing firewall (payment never influences matching):**
- B.7, `submit_quotation`, `run_matching_pipeline`, `manage_routing_rule` all state this ✓

**Buyer-preference firewall (buyer-scoped; never a platform signal):**
- §E5 structure conformance: buyer-preference signals "buyer-scoped only" ✓
- `generate_comparison_statement` AI-Agent Notes: "platform never auto-recommends" ✓
- `get_comparison_statement` Response: "buyer-private columns for the buyer only" ✓

**Governance-signal firewall (trust score ↛ performance ↛ matching tier influence):**
- B.7 covers the full FIXED prohibition ✓

**Buyer-Vendor Status (Approved/Conditional/Blacklisted) non-disclosure:**
- B.7 states: "non-disclosure invariant (blacklist/deferral/Buyer-Vendor-Status indistinguishable from non-match)" ✓
- `run_matching_pipeline` AI-Agent Notes: "gate-failed vendor must never appear in `matching_results`, leads, counts, or logs (Doc-2 §10.11.10; §7.5)" ✓

**`rfq.request_late_extension.v1` — potential fairness concern:**

The contract states "window reopens for all un-responded invitees (no per-vendor private windows)." This is correct. However, the contract does not explicitly state that the reopened window is visible to all current invitees (not just the requesting vendor). The AI-Agent Notes state "reopening always applies to all un-responded invitees; fairness here is cheap to enforce." This is sufficient, but the Cross-Module entry says only "Communication re-notifies all un-responded invitees (DE-6)" without stating whether the buyer-side decision to approve or deny is visible to the requesting vendor before Communication notifies. This is a minor authoring gap, not a firewall violation.

**Findings:** None in this domain at BLOCKER or MAJOR level.

---

## Domain 12 — AI-Agent Safety

**Checks:**

§E13 covers the full set of constraints:
- Consume frozen services; never re-derive ✓
- Honor state machines verbatim (incl. patched edges) ✓
- Bind operational rules to Doc-3 by pointer ✓
- No entity/event/slug/audit-action/POLICY-key invention ✓
- Non-disclosure invariant explicit ✓
- Three-instrument quota identity explicit ✓
- Single award; terminal states never reopen ✓
- Audience named: Claude Code, Cursor, backend, frontend, QA, AI Coding Agents ✓

B.8 source rule: every contract states its authority/lifecycle/audit/event source ✓

**Per-contract AI-Agent Notes quality:**
- Most contracts carry substantive, implementation-specific AI-agent notes ✓
- Several System contracts (21.5) carry notes that correctly direct agents to bind Doc-3 rather than re-derive ✓

**Ambiguity findings not already captured above:**

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-15 | MINOR | §E4 `rfq.expire_rfq.v1` Preconditions | **Two distinct expiry triggers conflated in one contract without clear dispatch logic.** The contract handles two fundamentally different triggers: (1) validity-window lapse (from `vendors_notified`/`quotations_received`/`buyer_reviewing`) and (2) coverage-exhausted hold-bound (`matching`). These are triggered by different conditions, different POLICY keys (`system_configuration.validity_window` vs. `matching.empty_hold_days`), and produce different side-effects (the coverage-exhausted path has a buyer notification and cell-recovery continuation; the validity-lapse path simply terminates). The Preconditions field lists both triggers but does not explain how a System implementation distinguishes between them or how two separate sweeps should be authored. An AI agent implementing this contract may produce a single sweep that applies the wrong trigger to the wrong state. | Doc-2 §5.4 (two distinct machine edges — validity lapse from post-`vendors_notified` states; coverage-exhausted from `matching`); Doc-3 §1.4 (validity window) vs PATCH-D3-05 (coverage-exhausted) | Either split `rfq.expire_rfq.v1` into two System contracts (`rfq.expire_rfq_validity.v1` and `rfq.expire_rfq_coverage_exhausted.v1`) with separate triggers, states, POLICY keys, and side-effects; or explicitly state in the Preconditions that two separate sweep jobs implement this contract — one polling for validity-lapse from post-notification states, one polling for hold-bound from `matching` state — with the distinct POLICY keys called out. |
| PA-16 | MINOR | §E7 `rfq.request_late_extension.v1` Actor Types / Request | **Two-party command (vendor requests; buyer approves) modeled as a single contract.** The contract describes a vendor → buyer asynchronous approval flow in a single 21.4 Command record. This is architecturally unusual: a 21.4 Command typically models a single actor performing a single action. The two-party flow (vendor submits request → buyer reviews → buyer approves/denies → system reopens window) should be two commands or a command+approval pattern, otherwise an AI agent will not know how to implement the state transitions, the intermediate pending state (if any), and the two separate authorization checks as a single contract. | Doc-4A §21.4 (Command template: one actor, one action, one authorization check); Doc-3 §8.5 (late extension — vendor request, buyer approval) | Either split into two contracts: `rfq.request_late_extension.v1` (vendor → request; 21.4 User) and `rfq.approve_late_extension.v1` (buyer → approve/deny; 21.4 User), or add a sub-section to the current contract explicitly describing the two-step state flow and the intermediate state (if any) so Pass-B authors have an unambiguous implementation path. |
| PA-17 | NITPICK | §E4 `rfq.reissue_rfq.v1` AI-Agent Notes | `rfq.reissue_rfq.v1` AI-Agent Notes says "re-issue is the **only** reopening mechanism (Doc-3 §1.6 FIXED); never transition a terminal RFQ back." This is correct but the note conflates "reopening" with "re-issue." Re-issue creates a new RFQ; it does not reopen the terminal one. The note could mislead an agent into thinking that `reissued_from` on the new RFQ allows reading the terminal source as if it were active. | Doc-3 §1.6 FIXED (re-issue = new identity; terminal source preserved) | Clarify: "Re-issue creates a new RFQ (new `rfq_id`) referencing `reissued_from`; the source RFQ remains terminal and is never reopened. The new RFQ follows the full lifecycle independently." |
| PA-18 | NITPICK | §E5 `rfq.regenerate_matching_results.v1` AI-Agent Notes | The note states "never re-open gates a signal change doesn't affect." This is correct but vague — it is unclear what "re-opening gates" means in context. Does it mean Phase A gates are not re-run? Or that a vendor who failed Phase A in the original run is not re-evaluated? The re-ranking contract is for scoring changes, not eligibility re-evaluation; this distinction should be explicit. | Doc-3 §6 (matching-confidence re-ranking on signal change — not a full re-gate); Doc-3 §3.1 (Phase A gates — only re-run in incremental rematch, not re-ranking) | Clarify: "Re-ranking applies to vendors already in `matching_results` (passed Phase A in the original run). This is a score refresh, not a Phase A re-gate. A vendor who failed Phase A in the original run is not reconsidered by this contract; that is incremental rematch (`rematch_incremental`)." |

---

## Domain 13 — Pass-A Readiness (per-contract element completeness)

**Required elements per contract (Pass-A depth):** Purpose · Ownership · Actor Types · Preconditions · Request · Response · State-Machine · Authorization · Audit · Events · Cross-Module · Error Categories · AI-Agent Notes.

**Sample check of all 31 contracts:**

All contracts carry all 13 required elements. ✓

**Quality observations:**

- Preconditions are high-level and consistently formatted ✓
- Request/Response correctly noted as "high-level only; field rules Pass-B" ✓
- Error Categories use the Doc-4A §12 closed class set ✓
- `reference_id` present in all Response entries (Doc-4A §22.1 C-05) ✓
- 21.5 System contracts correctly carry `Response: none` ✓
- 21.6 Admin contracts correctly use §5.6 framing ✓

**Idempotency declaration check (Doc-4A §14):**
Idempotency is declared for consumed inbound events (B.6: "idempotent — Doc-4A §16") ✓. The Quotation B section notes "§14 (idempotency)" in the Appendix B Conformance Binding Map for §E7. Individual mutation commands (21.4) do not individually declare idempotency or dedup windows in Pass-A, which is consistent with Pass-A depth (Pass-B will assign per Doc-4A §14 — "mutations `Idempotency: required` + dedup window (POLICY key)"). No violation at Pass-A depth.

**Rate-limit category check (Doc-4A §19.3 / CHK-215):**
Doc-4A §19.3 requires a Rate-Limit block when a Category 9 POLICY limit applies. None of the 31 contracts declares a RATE_LIMITED error category. A review of the Doc-4A §19.3 rule (Category 9 = public/unauthenticated read or high-frequency write) suggests that most RFQ contracts are authenticated tenant operations not in Category 9. However, `run_matching_pipeline`, `rematch_incremental`, and the wave/replenishment contracts are high-frequency System operations. Whether any trigger a Category 9 POLICY rate limit is a Doc-4A §19.3 determination to be made at Pass-B when exact frequency and POLICY keys are assigned. No finding at Pass-A depth.

**Findings:**

| ID | Severity | Location | Description | Corpus Reference | Required Fix |
|---|---|---|---|---|---|
| PA-19 | MINOR | §E7 `rfq.submit_quotation.v1` Audit | **Quota ledger entry cited in Audit field creates an ownership confusion.** The Audit entry states: "Doc-2 §9 Quotation 'submit'; quotation-submission quota ledger entry on the controlling org (Doc-3 §4.1.1)." The quota ledger entry is a Billing effect (DE-7 — the consumption is Billing's consumer of `QuotationSubmitted`), not a Doc-2 §9 audit action on the RFQ/Quotation module. Listing the quota ledger entry under Audit co-mingles the Doc-2 §9 RFQ/Quotation audit domain with a Billing-side accounting effect. This could cause a Pass-B author to implement the quota consumption inside the `submit_quotation` command's audit write (via Doc-4B), rather than as a Billing consumer of the `QuotationSubmitted` event. | Doc-2 §9 (Quotation audit domain: submit — the Doc-2 §9 audit action; no quota ledger action in §9); Doc-3 §4.1.1 (quota consumed at submission — accounting identity; Billing owns the ledger); Doc-4A §17 (audit vs event separation) | Remove the quota ledger entry from the Audit field. Move it to Cross-Module: "Billing consumes `QuotationSubmitted` to decrement the quotation-submission quota on the controlling org (DE-7; three-instrument identity, Doc-3 §4.1.1); RFQ reads the quota balance as a precondition gate but does not write the ledger." |

---

## Summary Table

| Severity | Count | Finding IDs |
|---|---|---|
| BLOCKER | 0 | — |
| MAJOR | 2 | PA-04, PA-07 |
| MINOR | 14 | PA-01, PA-02, PA-05, PA-06, PA-08, PA-09, PA-10, PA-11, PA-12, PA-13, PA-14, PA-15, PA-16, PA-19 |
| NITPICK | 4 | PA-03, PA-17, PA-18, PA-20 (see PA-02 sub-point on `rfq.approve_rfq`/`rfq.reject_internal_rfq` split) |

*(Note: PA-03 recounted here as NITPICK per its severity in Domain 2.)*

| Severity | Count |
|---|---|
| BLOCKER | 0 |
| MAJOR | 2 |
| MINOR | 14 |
| NITPICK | 3 |

---

## Consolidated Finding Register

| ID | Severity | Location | Core Issue |
|---|---|---|---|
| PA-01 | MINOR | Appendix section | Appendix E (Doc-3 Operational-Rule Binding Index) missing — required by frozen §E14 |
| PA-02 | MINOR | §E6 / Appendix A | Invitation-expiry sweep (→`InvitationExpired` audit action) has no owning contract |
| PA-03 | NITPICK | Appendix A row 4 | `approve_rfq` / `reject_internal_rfq` share one Appendix A row — Pass-B split risk |
| PA-04 | MAJOR | §E8 `generate_comparison_statement` Cross-Module | Vendor-standing reads ambiguous: `matching_results` cache vs live Trust/Marketplace service call — governance-signal firewall path not specified |
| PA-05 | MINOR | §E6 `assist_routing` / `manage_routing_rule` | No named Doc-2 §7 slug for routing-governance staff actions |
| PA-06 | MINOR | §E8 `award_rfq` / `close_lost_rfq` State-Machine | Cross-aggregate transactional scope not declared (RFQ + Quotation states in one transaction) |
| PA-07 | MAJOR | §E7 `submit_quotation` State-Machine | `vendors_notified → quotations_received` RFQ transition not authored as a side-effect |
| PA-08 | MINOR | §E4 `expire_rfq` / `cancel_rfq` State-Machine | `quotations submitted → expired` cascade not declared in State-Machine blocks |
| PA-09 | MINOR | §E4 `moderate_rfq` Preconditions | Precondition states `submitted`/`under_review` — correct state is `under_review` only |
| PA-10 | MINOR | §E8 `close_lost_rfq` Authorization | Authorization field does not name specific slug(s) |
| PA-11 | MINOR | §E6 `assist_routing` / `manage_routing_rule` Authorization | No named Doc-2 §7 slug for platform-staff routing governance |
| PA-12 | MINOR | §E4 `submit_rfq` / `approve_rfq` Events | `RFQApproved` event behavior on self-approval path is ambiguous |
| PA-13 | MINOR | §E6 `manage_routing_rule` Audit | `routing_rules` edit bound to `system_configuration change` without `[ESC-RFQ-AUDIT]` |
| PA-14 | MINOR | §E9 DE-7 row | `QuotationSubmitted` → Billing usage-ledger consumption absent from §E9 DE-7 entry |
| PA-15 | MINOR | §E4 `expire_rfq` Preconditions | Two distinct expiry triggers (validity-lapse vs coverage-exhausted) conflated without dispatch logic |
| PA-16 | MINOR | §E7 `request_late_extension` | Two-party command modeled as a single 21.4 Command — ambiguous implementation path |
| PA-17 | NITPICK | §E4 `reissue_rfq` AI-Agent Notes | "Re-issue is the only reopening mechanism" conflates re-issue with reopening |
| PA-18 | NITPICK | §E5 `regenerate_matching_results` AI-Agent Notes | "Never re-open gates" vague — re-ranking vs Phase A re-gate distinction unclear |
| PA-19 | MINOR | §E7 `submit_quotation` Audit | Quota ledger entry listed in Audit field — conflates Billing consumer effect with Doc-2 §9 audit action |

---

## Decision

**DECISION: APPROVE WITH PASS-A PATCH**

Zero BLOCKERs. Two MAJORs. Fourteen MINORs. Three NITPICKs.

The Pass-A document is structurally complete, governance-intent correct, and corpus-compliant in the vast majority of its 31 contracts. The two MAJOR findings must be resolved before Pass-A is approved:

- **PA-04** (governance-signal firewall ambiguity in comparison statement — synchronous live read vs `matching_results` cache) is a potential firewall violation that must be specified precisely; an AI coding agent left to choose will guess, and a wrong guess could route live Trust/Marketplace reads outside the pipeline's FIXED gate-before-score order.
- **PA-07** (missing `vendors_notified → quotations_received` transition in `submit_quotation`) is a missing state-machine obligation that will produce incorrect implementations for every quotation-submission event — a systematic defect with no floor.

Both MAJORs are precision additions to existing contracts, not redesigns. The MINOR findings are predominantly naming and cross-reference clarifications, audit-boundary corrections, and AI-agent ambiguity resolutions that prevent inconsistent Pass-B output. None opens a corpus conflict; none invents architecture.

---

## Pass-A Approval Question

**Can Doc-4E Pass-A proceed toward Pass-A Approval?**

**NO — conditional on Pass-A Patch resolving PA-04 and PA-07 (MAJOR), plus the MINOR findings PA-02, PA-06, PA-08, PA-09, PA-10, PA-11, PA-13, PA-15, PA-16, PA-19. PA-01 (Appendix E) should also be resolved in the patch to satisfy the frozen structure requirement. NITPICKs PA-03, PA-17, PA-18 may be deferred at the author's discretion.**

**After a Pass-A Patch and patch verification addressing all MAJOR and MINOR findings, Pass-A is suitable to proceed to Pass-A Approval → Pass-A Freeze → Pass-B Authoring.**

---

*End of Doc-4E Pass-A Independent Hard Review. Corpus frozen at: Architecture v1.0 FINAL · ADR Compendium v1 · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A v1.0 · Doc-4B v1.0 · Doc-4C v1.0 · Doc-4D v1.0 (all FROZEN). Structure authority: `Doc-4E_Structure_v1.0_FROZEN.md`. Decision: APPROVE WITH PASS-A PATCH. Pass-A Approval: NO — conditional on patch resolving PA-04 and PA-07 (MAJOR) plus MINOR findings.*
