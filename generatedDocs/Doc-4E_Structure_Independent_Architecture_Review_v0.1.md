# Doc-4E — RFQ Procurement Engine — Independent Architecture Review
## Structure Proposal v0.1 (`Doc-4E_Structure_Proposal_v0.1-05847f4b.md`)

| Field | Value |
|---|---|
| Review Type | Independent Hard Review — Structure Phase |
| Document Under Review | Doc-4E_Structure_Proposal_v0.1 (hash 05847f4b) |
| Review Objective | Determine whether Doc-4E Structure is ready for Structure Freeze and Pass-A Authoring |
| Reviewer Role | Virtual CTO & Architecture Board |
| Review Date | 2026-06-16 |
| Corpus Frozen At | Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A v1.0 · Doc-4B v1.0 · Doc-4C v1.0 · Doc-4D v1.0 · Architecture v1.0 FINAL · ADR Compendium v1 |
| Review Posture | Consumed by Claude Code / Cursor / Backend / Frontend / QA / AI Coding Agents |

**Scope declaration.** This review covers the structure document only — section presence, purpose, dependencies, excluded scope, corpus conformance, and structural sufficiency for Pass-A authoring. It does not assess any contract, payload, event, or business-rule content (none is instantiated). The frozen corpus is the sole benchmark. No prior review report is referenced or compared.

**Flag-and-halt posture.** Any conflict with a frozen document is recorded as a finding and escalated; no local resolution is attempted.

---

## Review Domains & Methodology

Ten domains reviewed:

1. Family Map Conformance
2. Module Boundary Integrity
3. Structure Completeness
4. RFQ Governance Coverage
5. State Machine Coverage
6. Event Coverage
7. Audit & Authorization Coverage
8. Cross-Module Dependency Integrity
9. AI-Agent Authoring Safety
10. Structure Freeze Readiness

Severity definitions:

- **BLOCKER** — corpus conflict or ownership violation; blocks Structure Freeze outright
- **MAJOR** — material structural gap that would cause Pass-A authors to invent or misplace contracts
- **MINOR** — structural imprecision or omitted pointer that would create ambiguity during Pass-A authoring
- **NITPICK** — stylistic or presentational issue; no authoring risk

---

## Per-Finding Register

### Domain 1 — Family Map Conformance

**Checks:**
- Doc-4E = RFQ Procurement Engine, Module 3, `rfq` schema → Doc-4A §1.3 / Appendix B confirms `rfq_` namespace ✓
- Header cites effective corpus versions (Doc-2 v1.0.3 = v1.0.2 + Patch v1.0.3; Doc-3 v1.0.2 = v1.0.1 + Patch v1.0.2 + Policy Key Registration Patch v1.0) ✓
- Family-map confirmation note is present and accurate (references the Doc-4D reconciliation — Module 2 mislabeled RFQ, Board-reconciled; Doc-4E occupies the reserved slot) ✓
- Governing rules #1–#3 correctly cite PATCH-D2-01/02, reference-never-restate, and structure-only constraint ✓
- Deliverables A–F present ✓

**Findings:** None.

---

### Domain 2 — Module Boundary Integrity

**Checks:**

**Owned aggregates (Doc-2 §2, Module 3):**
- RFQ (`rfqs`, `rfq_versions`, `rfq_invitations`, `rfq_invitation_grantees`, `rfq_document_grants`, `rfq_routing_log`) ✓
- Quotation (`quotations`, `quotation_versions`, `quotation_visibility`) ✓
- Comparison Statement (`comparison_statements`) ✓
- Routing Rule (`routing_rules`) ✓
- Matching Result (`matching_results`, derived/regenerable) ✓

**Not-owned entities correctly disclaimed:**
- Identity entities / `check_permission` → DE-1 ✓
- Marketplace vendor data / `vendor_matching_attributes` → DE-2 ✓
- Trust scores / `verified_financial_tiers` → DE-3 ✓
- Operations CRM / `buyer_vendor_statuses` / `engagements` / `vendor_leads` → DE-4 ✓
- Admin `ban_actions` / moderation authority → DE-5 ✓
- Communication notification fan-out → DE-6 ✓
- Billing entitlement / quota / credits → DE-7 ✓
- Core `audit`, `outbox`, `id_sequences` etc. → DE-8 ✓

**Moat seam:**
- Doc-4D DD-2 mirror (DE-2): RFQ runs matching, Marketplace supplies the read-model — stated symmetrically ✓
- No-ownership-leakage clause stated explicitly ✓

**Governance-signal firewall (Doc-4A §4B / Doc-3 §12.1 FIXED):**
- Stated in §E0 (DE-7), §E5 (Excluded scope), §E6 (Excluded scope), §E7 (Excluded scope), §E13 ✓
- "Payment never influences gates/scores/confidence/fairness" explicitly carried ✓

**Non-disclosure invariant (Doc-4A §7.5 / Doc-3 §12.1):**
- Blacklist floor + deferral indistinguishability stated in §E5 (excluded scope: non-disclosure), §E6 (excluded scope: deferral and blacklist exclusion invisible), §E13 ✓

**Findings:**

| ID | Severity | Affected Section | Explanation | Recommended Resolution |
|---|---|---|---|---|
| F-01 | MINOR | Deliverable B / §E2 | `buyer_supplier_relationships` aggregate root is not named when `buyer_vendor_statuses` is disclaimed to Operations. Doc-2 §3.5 defines `buyer_supplier_relationships` as the aggregate owning `buyer_vendor_statuses`. Omitting the root means a Pass-A author reading §E2 must independently locate the correct aggregate root to place cross-module references. | In Deliverable B §E2 "Explicitly NOT owned" entry for DE-4, add the aggregate root: `buyer_vendor_statuses` (root: `buyer_supplier_relationships`, owned by Operations / Doc-4F — DE-4). This is a pointer clarification; no ownership change. |

---

### Domain 3 — Structure Completeness

**Checks:**
- §E0–§E14 present (15 sections) ✓
- Deliverables A–F present ✓
- Each section carries all four quads: Purpose · Expected content scope · Dependencies · Excluded scope ✓
- No "TBD" found anywhere ✓
- No contract/payload/event/slug/audit-action/validation/business-rule instantiated ✓
- Appendix inventory (§E14) identifies five appendices A–E ✓

**Appendix E (Doc-3 Operational-Rule Binding Index) justification check:**
- §E14 and Deliverable E both justify Appendix E as structure-specific because Doc-3 centrality to Module 3 creates a re-derivation risk absent for Doc-4D. Rationale is sound and is characterized as a pointer-table (no rules authored) ✓

**Section-count vs Doc-4D:**
- Doc-4D used §D0–§D13 (14 sections); Doc-4E uses §E0–§E14 (15 sections). The single addition is §E14 Appendices, which is explicit and justified in Deliverable E. ✓

**Findings:**

| ID | Severity | Affected Section | Explanation | Recommended Resolution |
|---|---|---|---|---|
| F-02 | MINOR | §E8 Excluded scope | §E8 (Buyer Evaluation & Comparison) covers BC-5 and BC-6 jointly (Buyer Evaluation & Comparison and Procurement Decision & Closure) in a single section without formally acknowledging BC-6 absorption. The Excluded scope list does not call out that "no clarification thread entity is authored here (Communication — DE-6)" even though §E8 mentions "RFQ-scoped clarification threads." A Pass-A author would need to know that the communication channel (chat threads) is Communication-owned and not within scope of any contract in §E8. The exclusion is implicit but not stated. | Add to §E8 Excluded scope: "No clarification-thread entity or Communication contract authored (Communication — DE-6)." One line, no structural change. |
| F-03 | MINOR | Deliverable C / §E3 | BC-5 (Buyer Evaluation & Comparison) and BC-6 (Procurement Decision & Closure) both map to §E8. BC-7 (Routing Governance & Control Plane) maps to §E6 (noted in §E6 content scope: "Routing governance & telemetry"). Neither §E3 nor Deliverable C explicitly states which sections absorb BC-6 and BC-7. Appendix A (§E14) promises contract placement by BC-1…BC-7. Without explicit mapping, Pass-A authors assigning contracts to BCs may produce inconsistent assignments for BC-6 and BC-7. | In §E3 Expected content scope (or in a table within §E3), explicitly state: BC-5 → §E8; BC-6 → §E8 (absorbed, terminal-state and closure contracts); BC-7 → §E6 (routing governance and control-plane contracts). This resolves the ambiguity at structure time before Pass-A authors encounter Appendix A skeleton. |
| F-04 | NITPICK | Document title | The title reads "Canonical Structure Proposal v0.1". The word "Canonical" is premature — the document is a proposal pre-review, not yet frozen. The Doc-4D precedent used "Structure Proposal" without the qualifier. This is a presentational inconsistency; no authoring risk. | Remove "Canonical" from the title. After freeze the frozen document acquires canonical status; a proposal should not self-describe as canonical. |

---

### Domain 4 — RFQ Governance Coverage

**Checks:**

**Procurement moat doctrine (Doc-3 §3.3 FIXED — four balanced objectives):**
- Stated in §E1, §E2 Deliverable B, §E6, §E13 ✓

**No-pay-to-win invariant (Doc-3 §11.8 / §12.1 FIXED):**
- Stated in Deliverable A, §E0 (DE-7), §E5, §E6, §E13, Deliverable E §4 ✓

**POLICY keys (Doc-3 §12.2 / `[ESC-RFQ-POLICY]` via Doc-4A §18.2):**
- `[ESC-RFQ-POLICY]` marker present in §E0 and propagated to §E5, §E6 Excluded scope ✓
- No POLICY value hardcoded anywhere ✓
- Correct channel identified (Doc-3 §12.2 additive registration) ✓

**Moderation hand-off governance (PATCH-D2-01 / PATCH-D3-04):**
- `under_review → draft` edge cited in §E0 governing rule #1, §E4, §E12 `[ESC-RFQ-AUDIT]`, Deliverable F readiness table ✓

**Coverage-exhausted expiry (PATCH-D2-02 / PATCH-D3-05):**
- `matching → expired` edge cited in §E0 governing rule #1, §E4, §E12 `[ESC-RFQ-AUDIT]`, Deliverable F ✓

**Buyer-directed invitation path (PATCH-D3-02):**
- Cited in §E4 (invitation lifecycle), §E6 (exclusions from valid-lead/guarantee/fairness/wave accounting), §E10 (consumed events, `VendorClaimed`), §E12 `[ESC-RFQ-AUDIT]`, §E13 ambiguity prevention ✓

**Three-instrument accounting identity (PATCH-D3-01 / Doc-3 §4.1.1):**
- Cited in §E7 Expected content scope (quota accounting identity, three-instrument separation, FIXED), §E13 ambiguity prevention ✓

**Incremental rematch (PATCH-D3-03 / Doc-3 §11.4):**
- Cited in §E5 (matching result projection, incremental-rematch appends), §E6 (routing governance: `incremental_rematch` flag), §E10 (`VendorClaimed` consumed event with incremental-rematch trigger note), §E12 `[ESC-RFQ-AUDIT]` ✓

**Operating-stage behavior (Doc-3 §0.1):**
- Cited in §E1 (staging note), §E5, §E6 (per-cell operating-stage behavior, human-assist hooks), §E9 ✓

**Non-public RFQ board (Doc-3 §5.1 FIXED):**
- Stated in §E6 Excluded scope ✓

**Single-award cardinality / no auto-decision (Doc-3 §9.1 FIXED):**
- Stated in §E8 Expected content scope and Excluded scope ✓

**Findings:** None.

---

### Domain 5 — State Machine Coverage

**Checks:**

**RFQ machine (Doc-2 §5.4 + PATCH-D2-01/02):**

All edges verified:
- `draft → submitted` (internal approval not required) ✓
- `draft → pending_internal_approval` ✓
- `pending_internal_approval → submitted` (approve) ✓
- `pending_internal_approval → draft` (reject) ✓
- `submitted → under_review` (moderation pass) ✓
- `under_review → matching` (cleared) ✓
- `under_review → draft` (moderation reject; PATCH-D2-01; platform-moderation actor; `rfq_correction_required`) ✓
- `matching → vendors_notified` (pipeline complete) ✓
- `matching → expired` (coverage exhausted; PATCH-D2-02; system actor; `no_eligible_vendors_found`) ✓
- `vendors_notified → quotations_received` (first quotation) ✓
- `quotations_received → buyer_reviewing` (buyer opens comparison) ✓
- `buyer_reviewing → shortlisted` ✓
- `shortlisted → closed_won` / `closed_lost` ✓
- `any active → expired` (validity window lapse; system actor) ✓ (stated in §E4 as "multi-source → expired")
- `any active → cancelled` (audited reason) ✓

Terminal states identified: `closed_won`, `closed_lost`, `cancelled`, `expired` ✓
No-reopen rule cited (Doc-3 §1.6 FIXED, re-issue as recovery) ✓

**Quotation machine (Doc-2 §5.5):**
- `draft → submitted` ✓
- `submitted → submitted` (revise; new version; prior superseded) ✓
- `submitted → withdrawn` ✓
- `submitted → selected` ✓
- `submitted → not_selected` ✓
- `submitted → expired` ✓
- `draft → discard` ✓

One-active-per-vendor-per-RFQ guard (partial unique index, Doc-2 §10.4) ✓
Quotation binds to `rfq_version_id`, not mutable head ✓
Formal decline recorded on `rfq_invitations`, not a quotation state ✓

**Invitation lifecycle (Doc-2 §3.4):**
- `draft → selected → deferred → delivered → accepted | declined | expired` ✓
- `buyer_directed`-flagged path bound as delivery variant (pointer), not new state ✓
- `VendorInvited` fires only on `delivered` transition ✓

**Verification machine (Doc-2 §5.6) correctly excluded:**
- Trust-owned (DE-3); §E4 Excluded scope explicitly states this ✓

**Findings:** None.

---

### Domain 6 — Event Coverage

**Checks:**

**Emitted events (Doc-2 §8):**
- `RFQCreated` ✓
- `RFQSubmitted` ✓
- `RFQApproved` ✓
- `RFQClosedWon` ✓
- `RFQClosedLost` ✓
- `RFQMatched` (Architecture Patch v1.0.1 PATCH-06) ✓
- `RFQRouted` (Architecture Patch v1.0.1 PATCH-06) ✓
- `VendorInvited` (fires on `delivered` only; FIXED guard stated) ✓
- `QuotationSubmitted` ✓
- `QuotationWithdrawn` ✓
- `QuotationSelected` ✓

**Consumed events:**
- `VendorClaimed` (Marketplace; incremental-rematch trigger noted) ✓
- `VendorSuspended` (Marketplace) ✓
- `VendorTierChanged[tier_type='declared']` (Marketplace) ✓
- `VendorTierChanged[tier_type='verified']` (Trust) ✓
- `VendorVerified` (Trust) ✓
- `TrustScoreUpdated` (Trust) ✓
- `PerformanceScoreUpdated` (Trust) ✓
- `VendorBanned` (Admin) ✓
- `VendorOwnershipTransferred` (Marketplace) ✓

**Single-authorship (Doc-4A §4.4):**
- RFQ emits; Communication, Operations, Trust author their own consumers ✓
- §E9 explicitly states "RFQ MUST NOT author any notification-dispatch or Communication contract" ✓

**No event coined (Doc-2 §8 owns the catalog):**
- Excluded scope in §E10 states this explicitly ✓

**`VendorClaimed` correctly classified as consumed (not emitted):**
- §E10 Excluded scope: "`VendorClaimed` is consumed, never emitted by RFQ (it is Marketplace's — DE-2)" ✓

**Findings:**

| ID | Severity | Affected Section | Explanation | Recommended Resolution |
|---|---|---|---|---|
| F-05 | MINOR | §E10 | `RFQCancelled` is not listed in the emitted events. Doc-2 §8 includes cancellation events; `any active → cancelled` is a valid RFQ machine edge (§E4). If `RFQCancelled` exists in Doc-2 §8, its absence from the §E10 emitted list is a structural gap that would cause a Pass-A author to skip authoring the cancellation event contract. If it does not exist in §8, the absence is correct and no finding applies. **FLAG-AND-HALT:** This reviewer does not invent. Verify Doc-2 §8 RFQ event catalog against `cancelled` terminal edge. If `RFQCancelled` is registered in §8 but absent from §E10, add it to the emitted list by pointer. If it is absent from §8, carry it in `[ESC-RFQ-AUDIT]` as a gap alongside the four already carried. | Verify Doc-2 §8. If `RFQCancelled` is in the catalog: add to §E10 emitted list. If not: add as a fifth gap in `[ESC-RFQ-AUDIT]` marker text (§E0 / §E12 / Deliverable F). |
| F-06 | MINOR | §E10 | `QuotationRevised` (or equivalent event for a quotation revision) is not listed in emitted events. §E7 Expected content scope states "revise (new version, never overwrite)" and a revision is a business event; if Doc-2 §8 registers a `QuotationRevised` event, its omission from §E10 is a structural gap. **FLAG-AND-HALT:** same posture as F-05 — reviewer does not invent. | Verify Doc-2 §8 quotation event catalog against revision. If registered: add to §E10 emitted list. If absent: confirm whether a revision-event gap should be carried in `[ESC-RFQ-AUDIT]`. |

---

### Domain 7 — Audit & Authorization Coverage

**AUDIT checks:**

**Doc-2 §9 domains covered (by pointer):**
- RFQ domain: create, edit, submit, internal approve/reject, moderation pass/fail, cancel, expire (system), shortlist, close won/lost ✓
- Routing run audit (mode, filter reference) ✓
- Invitation transitions: `InvitationDelivered`, `InvitationAccepted`, `InvitationDeclined`, `InvitationExpired` ✓
- Quotation domain: create, edit, submit, withdraw, select, reject ✓

**`[ESC-RFQ-AUDIT]` marker (four gaps):**
- `under_review → draft` moderation-reject (PATCH-D2-01) ✓
- `matching → expired` coverage-exhausted (PATCH-D2-02) ✓
- Incremental-rematch routing-log entries (PATCH-D3-03) ✓
- `buyer_directed`-flagged invitation creation (PATCH-D3-02) ✓

**No audit action coined:**
- Stated in §E12 Excluded scope ✓

**Interim binding rule stated:**
- "Bind nearest §9 action by pointer; no audit action invented" ✓

**Channel identified:**
- Doc-2 §9 additive (analogous to `[ESC-IDN-AUDIT]` / `[ESC-MKT-AUDIT]`) ✓

**AUTHORIZATION checks:**

**Buyer-side slugs (Doc-2 §7):**
- `can_create_rfq` ✓
- `can_approve_rfq` ✓
- `can_view_rfq` / `can_view_all_rfqs` ✓
- `can_cancel_rfq` ✓
- `can_approve_vendor_selection` ✓
- `can_award_rfq` ✓

**Vendor-side slugs (Doc-2 §7):**
- `can_submit_quote` ✓
- `can_respond_to_rfq` (accept / formal decline) ✓
- `can_withdraw_quote` ✓

**Platform-staff slug:**
- `staff_can_moderate_rfq` ✓

**Three-layer + delegation model:**
- Active Membership + Permission Slug + Resource Scope OR delegation grant → `check_permission` ✓
- No shadow authorization ✓
- Delegation grant for vendor-representative action via Doc-4C §C9 ✓

**No slug invented (Doc-2 §7 owns catalog):**
- Stated in §E11 Excluded scope ✓

**Findings:**

| ID | Severity | Affected Section | Explanation | Recommended Resolution |
|---|---|---|---|---|
| F-07 | MINOR | §E11 | `can_view_rfq` and `can_view_all_rfqs` are listed as a slash-separated pair. Doc-2 §7 may treat these as two distinct slugs with different scope semantics (single-RFQ vs. all-RFQs within org). If they are two distinct slugs, the slash notation could lead a Pass-A author to treat them as a single slug, incorrectly applying both on one authorization check. If they are aliases or one slug with a scope variant, the notation is correct. **FLAG-AND-HALT.** | Verify Doc-2 §7 slug catalog. If they are two distinct slugs, list them on separate lines in §E11. If they are one slug (with a scope parameter), note the scope parameter explicitly. |

---

### Domain 8 — Cross-Module Dependency Integrity

**Checks:**

**DE-1 (Identity):** direction = consume; `check_permission`, delegation grants, org/membership context; no Identity contract authored ✓  
**DE-2 (Marketplace / moat seam):** direction = read; `vendor_matching_attributes` read-model + vendor profile/capability data via service; never write; DD-2 mirror ✓  
**DE-3 (Trust):** direction = consume events and scoring inputs; firewall: read-only, never mutate; governance-signal firewall explicitly applied ✓  
**DE-4 (Operations):** direction = read CRM/blacklist via service + emit events triggering Operations to create `engagements` and `vendor_leads`; non-disclosure invariant applied ✓  
**DE-5 (Admin):** direction = reflect; moderation transitions surfaced, decision authority Admin's; `VendorBanned` reflected not owned ✓  
**DE-6 (Communication):** direction = emit outbox event only; single-authorship enforced; no notification contract authored ✓  
**DE-7 (Billing):** direction = read quota/entitlement; payment firewall; three-instrument identity; no billing contract authored ✓  
**DE-8 (Platform Core):** direction = consume audit-write, outbox-write, UUIDv7, POLICY read, feature flags; nothing re-implemented ✓  

**§E9 integration surface:**
- Each counterpart correctly classified as "consume" or "expose"
- Single-authorship side stated per DE entry ✓
- "No Template 21.2 integration instantiated in the structure" ✓

**Findings:** None.

---

### Domain 9 — AI-Agent Authoring Safety

**Checks:**

**§E13 guardrails:**
- Implementation constraints: consume frozen Doc-4B/4C services and Doc-4D read-model by pointer ✓
- Ownership protections: all DE-1…DE-8 firewalls restated ✓
- Ambiguity prevention: non-disclosure invariant, no auto-winner, three-instrument quota identity, no event/slug/audit-action/POLICY-key invention, escalation channels ✓
- Audience named: Claude Code, Cursor, backend, frontend, QA ✓

**Per-section Excluded scope:**
- Every section (§E0–§E14) carries an Excluded scope clause ✓
- Excluded scope clauses are actionable (a coding agent can check a proposed contract against them) ✓

**Flag-and-halt obligation:**
- §0.6 cited in §E0, Deliverable A, §E13 ✓

**No architectural assumption permitted:**
- "All bindings by pointer" stated in §E13 Excluded scope ✓
- "No operating-number hardcoding" stated ✓

**Findings:**

| ID | Severity | Affected Section | Explanation | Recommended Resolution |
|---|---|---|---|---|
| F-08 | NITPICK | §E13 | §E13 lists audience as "Claude Code, Cursor, backend, frontend, QA" but does not name AI coding agents in the body text, only in the header (Deliverable A). The Doc-4D precedent explicitly names "AI coding agents" in the AI-agent constraints section body. This is a consistency gap with no authoring risk (§E13 is structurally complete), but a future AI coding agent reading only §E13 might not identify itself as an addressed consumer. | Add "AI coding agents" to the audience list in §E13 body text. |

---

### Domain 10 — Structure Freeze Readiness

**Summary assessment across all 10 domains:**

| Review Domain | Status | Open Findings |
|---|---|---|
| 1. Family Map Conformance | PASS | None |
| 2. Module Boundary Integrity | PASS WITH FINDING | F-01 (MINOR) |
| 3. Structure Completeness | PASS WITH FINDINGS | F-02 (MINOR), F-03 (MINOR), F-04 (NITPICK) |
| 4. RFQ Governance Coverage | PASS | None |
| 5. State Machine Coverage | PASS | None |
| 6. Event Coverage | PASS WITH FINDINGS | F-05 (MINOR), F-06 (MINOR) |
| 7. Audit & Authorization Coverage | PASS WITH FINDING | F-07 (MINOR) |
| 8. Cross-Module Dependency Integrity | PASS | None |
| 9. AI-Agent Authoring Safety | PASS WITH FINDING | F-08 (NITPICK) |
| 10. Structure Freeze Readiness | See below | — |

**Finding severity summary:**

| Severity | Count | IDs |
|---|---|---|
| BLOCKER | 0 | — |
| MAJOR | 0 | — |
| MINOR | 6 | F-01, F-02, F-03, F-05, F-06, F-07 |
| NITPICK | 2 | F-04, F-08 |

---

## Consolidated Finding Register

| ID | Severity | Affected Section | Explanation | Recommended Resolution |
|---|---|---|---|---|
| F-01 | MINOR | Deliverable B / §E2 | `buyer_supplier_relationships` aggregate root not named when `buyer_vendor_statuses` is disclaimed to Operations (DE-4). Pass-A authors must independently locate the aggregate root. | Add root name: `buyer_vendor_statuses` (root: `buyer_supplier_relationships`, Operations / Doc-4F — DE-4). |
| F-02 | MINOR | §E8 Excluded scope | No explicit exclusion clause for clarification-thread entity / Communication contract, despite §E8 mentioning "RFQ-scoped clarification threads." | Add to §E8 Excluded scope: "No clarification-thread entity or Communication contract authored (Communication — DE-6)." |
| F-03 | MINOR | Deliverable C / §E3 | BC-5 and BC-6 both map to §E8; BC-7 maps to §E6. Mappings not stated in §E3 or Deliverable C. Appendix A skeleton uses BC-1…BC-7 for contract placement. Ambiguity at structure time creates inconsistent Pass-A assignments. | State BC-5 → §E8, BC-6 → §E8 (absorbed, terminal/closure contracts), BC-7 → §E6 (routing governance) explicitly in §E3 or Deliverable C. |
| F-04 | NITPICK | Document title | "Canonical Structure Proposal" — "Canonical" is premature for a pre-freeze proposal; inconsistent with Doc-4D precedent. | Remove "Canonical" from title. |
| F-05 | MINOR | §E10 | `RFQCancelled` absent from emitted events. `any active → cancelled` is a valid RFQ machine edge. If Doc-2 §8 registers this event, the omission is a structural gap for Pass-A authors. **Flagged and halted — verify Doc-2 §8.** | Verify Doc-2 §8: if registered, add to §E10 emitted list; if absent, add as fifth gap in `[ESC-RFQ-AUDIT]`. |
| F-06 | MINOR | §E10 | `QuotationRevised` (or revision event) absent from emitted events. §E7 describes revision as a business action. **Flagged and halted — verify Doc-2 §8.** | Verify Doc-2 §8: if registered, add to §E10 emitted list; if absent, confirm whether to carry in `[ESC-RFQ-AUDIT]`. |
| F-07 | MINOR | §E11 | `can_view_rfq` / `can_view_all_rfqs` slash-notation is ambiguous if these are two distinct Doc-2 §7 slugs. Single-slug treatment of two distinct slugs would cause incorrect authorization checks in Pass-A contracts. **Flagged and halted — verify Doc-2 §7.** | Verify Doc-2 §7: if two slugs, list separately; if one slug with scope variant, clarify notation. |
| F-08 | NITPICK | §E13 | "AI coding agents" not named in §E13 body audience list; named in Deliverable A header only. | Add "AI coding agents" to §E13 audience list in body text. |

---

## Positive Findings (Structural Strengths)

The following are explicitly noted as structural achievements relative to the governance baseline:

1. **All four Doc-3 Patch v1.0.2 behaviors fully propagated.** PATCH-D3-01 (three-instrument quota identity), PATCH-D3-02 (buyer_directed invitation path), PATCH-D3-03 (incremental rematch), PATCH-D3-04/05 (moderation-reject and coverage-exhausted edges via PATCH-D2-01/02) each appear in every section where they are relevant.

2. **`[ESC-RFQ-AUDIT]` is pre-populated at structure time.** Rather than leaving four Doc-3-patch audit-action gaps to be discovered during Pass-A, the proposal identifies them explicitly with interim binding rule and resolution channel. This is above the Doc-4D/4C precedent.

3. **Moat seam stated symmetrically.** DE-2 is the exact mirror of Doc-4D DD-2 — the boundary is locked in both modules simultaneously at structure time.

4. **No event coined, no slug coined, no audit action coined.** Every emitted and consumed event, every permission slug, and every auditable action is bound to the owning catalog by pointer.

5. **Governance firewalls are structural, not aspirational.** The no-pay-to-win invariant, governance-signal firewall, and non-disclosure invariant each have a named home and an Excluded scope clause that a coding agent can check a proposed contract against.

6. **Appendix E justification is sound.** The Doc-3 Operational-Rule Binding Index is justified as structure-specific to the moat because Doc-3's centrality creates a re-derivation risk absent for Marketplace.

7. **`VendorClaimed` correctly classified as consumed (not emitted).** The §E10 Excluded scope explicitly identifies the source module, preventing a common module-boundary error.

8. **`VendorInvited` FIXED guard is structural.** The "fires only on transition to `delivered`" constraint is stated at structure time, foreclosing a class of undelivered-invitation visibility bugs in Pass-A.

---

## Final Decision

**DECISION: APPROVE WITH STRUCTURE PATCH**

Zero BLOCKERs. Zero MAJORs. Six MINORs (F-01, F-02, F-03, F-05, F-06, F-07). Two NITPICKs (F-04, F-08).

The document is structurally sound and demonstrates complete corpus conformance across state machines, events, audit, authorization, governance firewalls, cross-module boundaries, and AI-agent safety guardrails. The six MINOR findings are pointer-clarification and verification items — none invents new architecture, none creates an ownership conflict, and none requires a re-review. F-05 and F-06 are flag-and-halt items requiring Doc-2 §8 verification before the patch; the patch applies one of two specified resolutions per finding depending on what the catalog contains.

**Structure Freeze Readiness: YES — conditional on Structure Patch addressing F-01 through F-07 (F-04 and F-08 may be deferred to patch at the author's discretion as NITPICKs).**

**Recommended next lifecycle step: Structure Patch → patch verification → Structure FROZEN → Pass-A Authoring.**

The patch is scoped to pointer additions, notation clarifications, one explicit BC-to-section mapping, and two flag-and-halt verifications. No section is re-authored; no architectural decision is reconsidered; no frozen document is reopened.

---

*End of Doc-4E Independent Architecture Review — Structure Proposal v0.1 (hash 05847f4b). Corpus frozen at: Architecture v1.0 FINAL · ADR Compendium v1 · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A/4B/4C/4D v1.0 (all FROZEN). Decision: APPROVE WITH STRUCTURE PATCH. Freeze readiness: YES conditional on patch.*
