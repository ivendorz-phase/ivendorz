# Doc-4F_PassB_Part2_Independent_Hard_Review_v1.0 — Independent Architecture Review Board

| Field | Value |
|---|---|
| Document | Doc-4F_PassB_Part2_Independent_Hard_Review_v1.0 — adversarial hard review of `Doc-4F_PassB_Part2_BC-OPS-2_Procurement_Engagements_v1.0` |
| Posture | **Independent review board — attempting to break the document.** Not the author; not defending it. Findings derived from frozen authority only. |
| Authority used | Architecture (FROZEN), ADRs (FROZEN), Doc-2 v1.0.3 (FROZEN), Doc-3 v1.0.2 (FROZEN), Doc-4A v1.0 (FROZEN), Doc-4B/4C/4D/4E v1.0 (FROZEN), `Doc-4F_Structure_v1.0_FROZEN`, `Doc-4F_Content_v1.0_PassA_FROZEN`, `Doc-4F_PassB_Part1_BC-OPS-1_FROZEN`. Prior review reports were **not** used as authority. |
| Subject | `Doc-4F_PassB_Part2_BC-OPS-2_Procurement_Engagements_v1.0.md` — 8 §F5 contract groups (14 contract IDs), BC-OPS-2 Engagement & Commercial Documents |
| Method | Every state/event/slug/audit claim was re-derived from the frozen corpus; the document's own rationale was treated as untrusted. Severities: BLOCKER / MAJOR / MINOR / NITPICK. Architecture Defects are separated from Implementation Risks. On a genuine corpus conflict: flag-and-halt (none required — see Regression Audit). |

**Scope of attack.** Priority was given to the surfaces where Pass-B necessarily made authoring choices the corpus under-specifies: the engagement state edges (especially `close_engagement`), the emit-trigger transitions for the five performance-input events (Doc-2 §8 binds none), the `record_delivery` source-state precondition, the Doc-4A §13/§16.3 declaration grammar, and escalation provenance. Ownership, moat, firewall, slug-set, REFERENCE/DEPENDENCY separation, and non-disclosure were audited and found clean (Regression Audit below).

---

# Executive Verdict

**PASS WITH PATCH.**

The document faithfully preserves frozen ownership, the procurement moat, the Trust firewall, event ownership, and the authorization/audit authorities; it is structurally complete (12 sections × 8 contracts) and AI-agent-readable. **However, two MAJOR defects** must be patched before freeze: (1) `close_engagement` asserts a state edge (`→ closed` from a non-terminal state) that the frozen engagement machine (Doc-2 §3.5) does not define; (2) the `EngagementCompleted` (and, inconsistently, `DisputeRecorded`) **emit-trigger transition is asserted as fact** where Doc-2 §8 binds no trigger and Doc-2 §5 defines no engagement machine — an unbacked authoring decision, asymmetrically hedged. Three MINOR and one NITPICK accompany. No BLOCKER; no FAIL-class drift.

---

# Architecture Defects

### AD-P2-01 — `close_engagement` asserts an unsupported state edge (`→ closed` from a non-terminal state)

- **Finding ID:** AD-P2-01
- **Severity:** **MAJOR**
- **Location:** §F5.2 `ops.close_engagement.v1` · Section 6 State Machine Enforcement — *"(and `close_engagement`: → `closed` from a non-terminal state per the machine)"*.
- **Issue:** The frozen engagement lifecycle is **strictly sequential** — Doc-2 §3.5 and §10.5 define `engagements.status` as `open → in_delivery → completed → closed`, in which the **only** edge into `closed` is `completed → closed`. The document's `close_engagement` allows `→ closed` from "a non-terminal state," i.e. potentially from `open` or `in_delivery`, which is **not an edge the frozen machine defines.** Doc-4A §13 (the `Pre-states: any non-corpus-terminal` rule) permits a broad-close shorthand **only where Doc-2 §5 explicitly applies the transition to all non-terminal states, and the contract MUST cite the corpus basis** — here no such basis exists, and §3.5 actively contradicts it. The §10.5 "YES (close/archive)" column denotes a soft-delete/archive capability, **not** an additional state edge (Doc-2 §6 tenancy class, not a §3.5/§5 transition).
- **Governance Impact:** **Lifecycle drift / state-machine defect.** Two competent implementers will diverge: one permits closing an `open`/`in_delivery` engagement, another rejects it as illegal — a non-deterministic state machine. It also risks suppressing `EngagementCompleted` (if an engagement can jump to `closed` without passing `completed`, the performance input to Trust is silently skipped — a Trust-firewall side effect).
- **Required Fix:** Bind `close_engagement` to the **frozen edge only** — `completed → closed` (the sole §3.5 edge into `closed`) — and enumerate the legal pre-state(s) verbatim; remove "from a non-terminal state." If a broader close is genuinely intended, it is **absent from frozen authority** and must be carried as a corpus escalation to **Doc-2 §3.5** (engagement-lifecycle owning document), never asserted locally (Doc-4A §0.6 / §13).

### AD-P2-02 — Performance-input event emit-triggers asserted as fact where Doc-2 §8 binds none (asymmetric hedging)

- **Finding ID:** AD-P2-02
- **Severity:** **MAJOR**
- **Location:** §F5.2 Section 8 (`EngagementCompleted` — *"trigger transition = `in_delivery → completed`"* asserted as fact) and Appendix B Event Binding Map; contrasted with §F5.5 Section 8 (`DisputeRecorded` — *"the exact emitting surface is carried for confirmation"*, hedged).
- **Issue:** Doc-2 §8 lists the five operations events (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`) and their **consumer** (Trust `performance_inputs`, §10.6), but **binds none of them to a specific emitting transition**, and Doc-2 §5 contains **no engagement state machine** to bind to (the §5 machines are Organization/Membership/Vendor-Profile/RFQ/Quotation/Verification/Subscription/Advertisement/Document-Template/Delegation — engagement is absent; the lifecycle exists only as the §3.5/§10.5 column). The document therefore **asserts** `EngagementCompleted` fires on `in_delivery → completed` as if corpus-grounded, while **hedging** the analogous `DisputeRecorded` surface. This asymmetry is the defect: the same corpus silence governs both, so both must be treated identically — either both grounded (they are not) or both carried for confirmation. Asserting an unbacked emit-trigger is precisely the kind of hidden authoring decision Pass-B review must catch (Doc-4A §16.3 — the producing contract declares its Events Produced, but the **emit condition must trace to corpus authority**, not be invented).
- **Governance Impact:** **Event-authority precision defect.** Two implementers diverge on *when* each event fires (e.g., does `EngagementCompleted` fire at `completed` or at `closed`? does `DisputeRecorded` fire on the trade-invoice `disputed` transition or on a distinct engagement dispute action?). Because Trust scores off these inputs (DF-4), divergent emit-conditions produce divergent performance signals — a downstream Trust-firewall correctness risk, though no ownership is breached.
- **Required Fix:** Apply **consistent treatment** to all five emit-triggers: where Doc-2 §8/§3.5 does not bind the emitting transition, state the **proposed** binding and carry it for confirmation against Doc-2 §8/§3.5 (the existing `[ESC-OPS-AUDIT]`-style "confirm at owning doc" carry), or escalate the emit-trigger definition to **Doc-2 §8** as the owning channel. Do **not** assert `in_delivery → completed` (or any single transition) as established fact while hedging the others. The events themselves are correct and authorized (Doc-2 §8) — only the **emit-trigger precision** is the issue.

---

# Implementation Risks

### IR-P2-01 — `record_delivery` STATE precondition is non-testable ("as the machine permits")

- **Finding ID:** IR-P2-01
- **Severity:** **MINOR**
- **Location:** §F5.3 `ops.record_delivery.v1` · Section 4 Validation Matrix (Stage 6 STATE) and Section 6 — *"engagement is `in_delivery` ... **or as the machine permits**"*.
- **Issue:** Doc-4A §11.1 requires every validation rule to be **testable** ("a reviewer or AI agent can construct a passing and a failing input from the rule line alone"); "or as the machine permits" is an open-ended qualifier from which no deterministic pass/fail input can be constructed. The frozen machine does not state from which engagement state(s) a challan/delivery may be recorded, so the rule must enumerate the exact allowed set (e.g., `in_delivery` only, or `open|in_delivery`) with a corpus pointer, or carry the under-specification.
- **Governance Impact:** AI-agent ambiguity — one agent permits delivery only in `in_delivery`, another in `open` too. Low blast radius (challan is a versioned document, not a gated state edge), hence MINOR.
- **Required Fix:** Replace "or as the machine permits" with the **enumerated** legal source state(s) for delivery recording, cited to Doc-2 §3.5; if Doc-2 does not fix this, carry it explicitly (do not leave an open qualifier).

### IR-P2-02 — Events Produced declarations omit the mandatory `Privacy-Review: §7.5 compliant` (and `Outbox: yes`) assertions

- **Finding ID:** IR-P2-02
- **Severity:** **MINOR**
- **Location:** Every Section 8 Event Binding that emits an event (§F5.2/§F5.3/§F5.4/§F5.5/§F5.7) and Appendix B.
- **Issue:** Doc-4A §16.3 requires every Events Produced declaration to carry **`Outbox: yes`** and a **`Privacy-Review: §7.5 compliant`** assertion (the latter machine-reviewable confirmation that the event payload contains no protected facts / Buyer-Vendor-Status / private-CRM content; absence is a stated conformance failure). Part 2 emits five events whose thin payloads carry engagement/party references, so the `Privacy-Review` assertion is **materially relevant** here — yet it is absent. **Mitigating context (stated for fairness, not as a defense):** the FROZEN `Doc-4E_PassB_Part1_v1.0` — which also emits events — uses the same prose "Event Binding" style and likewise omits `Privacy-Review`/`Outbox` assertions, and was Board-frozen; this is therefore a **convention gap shared with frozen precedent**, not a Part-2-specific regression. That precedent caps the severity at MINOR but does not eliminate the gap, because Part-2's payloads are the first Operations payloads to leave the module toward Trust.
- **Governance Impact:** Conformance/privacy-assertion gap; the §7.5 payload-privacy confirmation is not machine-checkable as written. No actual disclosure is present (payloads are thin refs), so this is an assertion-completeness issue, not a live leak.
- **Required Fix:** Add `Outbox: yes` and `Privacy-Review: §7.5 compliant` to each emitting Event Binding (and the Event Binding Map), confirming the thin payloads carry no protected facts. *(Board may also consider a consolidated corpus-wide note applying the same to the frozen Doc-4E precedent — out of scope for this Part's patch.)*

### IR-P2-03 — Prior-review finding ID ("AD-02-class") cited inside a corpus-only Pass-B document

- **Finding ID:** IR-P2-03
- **Severity:** **MINOR**
- **Location:** §F5.5 Section 8 — *"see ... the cross-reference to AD-02-class engagement-dispute escalation if a reviewer finds the surface under-specified."*
- **Issue:** "AD-02" is a **prior review finding identifier** (from the Part-1 review cycle). Pass-B is authored against frozen corpus authority only; review reports are explicitly **not** authority (and this very review was instructed not to use them). Embedding a prior-review finding ID inside the contract document couples it to a non-authoritative artifact and confuses escalation provenance — the correct carry is the named **corpus** channel (`[ESC-OPS-*]` → owning document), not a review-finding cross-reference.
- **Governance Impact:** Escalation-provenance hygiene; risks an implementer treating a review finding as binding corpus authority. MINOR.
- **Required Fix:** Remove the "AD-02-class" cross-reference; if the dispute-emit surface is under-specified, carry it via the corpus channel (Doc-2 §8/§10.5 additive, consistent with AD-P2-02's fix), naming the owning document, not a prior finding.

### IR-P2-04 — `DisputeRecorded` Event-Binding note is verbose and could read as two emit paths

- **Finding ID:** IR-P2-04
- **Severity:** **NITPICK**
- **Location:** §F5.5 Section 8 — the parenthetical discussing "whether disputes may also be recorded via a distinct engagement action."
- **Issue:** The note simultaneously fixes the emit on the trade-invoice `→ disputed` transition **and** muses about "a distinct engagement action," which a hasty implementer could read as licensing **two** producer paths for the same event (a duplicate-producer risk the Event Governance audit warns against). The intent (single producer, surface to be confirmed) is correct but the wording is loose.
- **Governance Impact:** Minor readability/duplicate-producer-ambiguity; no actual second path is defined.
- **Required Fix:** Tighten to a single declared producer path with the confirmation carried once (folds into the AD-P2-02 consistent-treatment fix).

---

# Regression Audit

| Area | Result |
|---|---|
| Ownership Drift | **PASS** — BC-OPS-2 owns exactly the Procurement Engagement aggregate (`engagements` + `lois`/`purchase_orders`/`challans`/`trade_invoices`/`payment_records`/`work_completion_certificates`); no other aggregate claimed; 14 contract IDs all ⊆ Pass-A §F5. |
| Aggregate Drift | **PASS** — no aggregate added/renamed/split; document bodies reference BC-OPS-4 `template_version_id` with no template/generated-document ownership (no overlap). |
| DDD Boundary Drift | **PASS** — engagement is the single owned aggregate; cross-context refs are by UUID; no aggregate crosses a context. |
| Procurement Moat Drift | **PASS** — owns no RFQ/quotation/matching/routing/ranking/evaluation/supplier-selection/award; `RFQClosedWon` is **consumer-only** (System actor, 1:1 award→engagement, ADR-002); `rfq_id`/`vendor_profile_id` are bare UUIDs. |
| Event Ownership Drift | **PASS (with AD-P2-02 on emit-trigger precision, not ownership)** — emits **only** the five Doc-2 §8 operations events; consumes only `RFQClosedWon`; single-authorship preserved (no 21.2 integration authored; emitter owns delivery); **no event coined**. The defect is *trigger precision*, not ownership. |
| Authorization Drift | **PASS** — slugs `can_manage_engagements`/`can_create_documents`/`can_approve_po`/`can_record_payments`/`can_approve_payment` all ∈ Doc-2 §7; `can_approve_po`/`can_approve_payment` correctly required *in addition* to their base slugs; `can_submit_review` correctly excluded as a non-owned Trust surface; Identity `check_permission` sole authority; §6B delegation used only on vendor-side actions. No invented slug; no shadow authorization. |
| Audit Drift | **PASS** — binds Doc-2 §9 **Engagement** (open/status-change/close; LOI/PO/challan/WCC issue+revision; buyer feedback submitted) and **Financial** (trade-invoice issue/status-change; payment-record entries); no audit action invented; reads not audited. |
| Trust Firewall Drift | **PASS** — emits performance-input events only; **computes no trust/performance/verification score**; does not mutate Trust aggregates; `public_reviews` correctly left Trust-owned. |

**No FAIL-class drift in any regression area.** The two MAJOR findings are *precision/lifecycle* defects within otherwise-correct ownership and firewall boundaries.

---

# AI-Agent Readiness

**MEDIUM.**

The document is field-level, machine-readable, and mostly deterministic, but **two emit/transition ambiguities (AD-P2-01 close edge, AD-P2-02 emit-triggers) and one non-testable STATE rule (IR-P2-01)** would let two competent agents implement materially different behavior on engagement closing and performance-event emission — the most governance-sensitive surfaces in this Part (they feed Trust). Readiness rises to **HIGH** once the patch binds the close edge to `completed → closed`, applies consistent emit-trigger treatment across all five events, and enumerates the delivery source state(s).

---

# Final Assessment

| Severity | Count |
|---|---|
| BLOCKER | 0 |
| MAJOR | 2 |
| MINOR | 3 |
| NITPICK | 1 |

---

# Final Decision

**PASS WITH PATCH.**

No BLOCKER and no ownership/moat/firewall/event-ownership drift → not FAIL. Two MAJOR defects (AD-P2-01 unsupported close edge; AD-P2-02 asserted emit-triggers) plus three MINOR and one NITPICK must be remediated before the Freeze Audit. The patch scope is **minimal and bounded** — bind the close edge to the frozen `completed → closed`, harmonize the five emit-trigger declarations (proposed-and-carried, not asserted), enumerate the delivery source state, add the `Privacy-Review`/`Outbox` event assertions, and remove the prior-finding cross-reference. No redesign; no ownership change; carried markers `[ESC-OPS-AUDIT]`/`[ESC-OPS-POLICY]`/`[ESC-OPS-SLUG]` and DF-1…DF-8 unchanged.

---

# Next Recommended Artifact

**`Doc-4F_PassB_Part2_Patch_v1.0`** — author the remediation patch for the two MAJOR + three MINOR + one NITPICK findings above (VALID findings only; AD-P2-02's residual emit-trigger gap and any close-edge broadening are corpus escalations to Doc-2 §3.5/§8, carried not resolved). Then proceed `Doc-4F_PassB_Part2_Patch_Verification_v1.0` → `Doc-4F_PassB_Part2_Freeze_Audit_v1.0`.

---

*End of Doc-4F_PassB_Part2_Independent_Hard_Review_v1.0. Independent adversarial review against frozen authority only; prior review reports not used as authority. Verdict: PASS WITH PATCH (0 BLOCKER, 2 MAJOR, 3 MINOR, 1 NITPICK). Architecture Defects (AD-P2-01 close edge; AD-P2-02 emit-trigger assertion) separated from Implementation Risks (IR-P2-01 non-testable delivery STATE; IR-P2-02 missing Privacy-Review/Outbox; IR-P2-03 prior-finding cross-reference; IR-P2-04 dispute-note verbosity). No ownership/moat/firewall/event-ownership/authorization/audit drift. Next artifact: Doc-4F_PassB_Part2_Patch_v1.0.*
