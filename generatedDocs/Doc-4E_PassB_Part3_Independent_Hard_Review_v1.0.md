# Doc-4E Pass-B Part-3 Independent Hard Review

**Report ID:** Doc-4E_PassB_Part3_Independent_Hard_Review_v1.0  
**Document Under Review:** Doc-4E_Content_v1.0_PassB_Part3_RoutingGovernance.md  
**Scope:** BC-3 (Routing, Selection & Distribution) + BC-7 (Routing Governance & Control Plane) — §E6 (8 contracts)  
**Reviewer Role:** Architecture Board Independent Hard Reviewer · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Governance Auditor  
**Review Date:** 2026-06-17  
**Authoritative Corpus:** Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1_v1.0_FROZEN, Doc-4E_PassB_Part2_v1.0_FROZEN — all FROZEN

---

## Executive Verdict

Part 3 is a well-formed, high-quality Pass-B hardening document. The eight §E6 contracts are correctly scoped, the FIXED invariants for BC-3/BC-7 are comprehensively stated and consistently enforced, the governance and fairness architecture is sound, the procurement moat is intact, and the AI-agent safety posture is materially stronger than prior parts. No BLOCKER. No MAJOR. Two MINORs require patch: an implicit rather than explicit entity-existence check in §E6.4's validation matrix, and an unnamed POLICY key for the respond_to_invitation idempotency dedup window. Two NITPICKs are flagged (cosmetic/low-risk).

**APPROVE WITH PATCH** — 0 BLOCKERs · 0 MAJORs · 2 MINORs · 2 NITPICKs.

---

## Area-by-Area Findings

### Area 1 — Contract Identity & Template Compliance

**Result: PASS**

Eight contracts declared in the header and confirmed present: 3×21.5 System (`assemble_and_route_wave`, `replenish_wave`, `drain_deferred_queue`), 1×21.4 Command (`respond_to_invitation`), 2×21.6 Admin (`assist_routing`, `manage_routing_rule`), 3×21.3 Query (bundled `get_routing_log`, `get_invitation`, `list_invitations`). Template assignments match the Pass-A baseline. All 21.5 System contracts declare `Response: none`. 21.6 Admin contracts declare no active org context (§5.6). The query bundle correctly uses a single §E6 record for three read contracts. No contract invented, none omitted.

---

### Area 2 — Validation Matrix (Nine-Stage Order & Completeness)

**Result: PASS WITH FINDING (PB3-M1)**

**Stages 2–5 collapse:** Correctly applied to all three 21.5 System contracts (§E6.1, §E6.2, §E6.3) as a single trigger-authenticity check per Doc-4A §11.2 and H.1. Semantic stages 6–9 carry the weight. ✓

**§E6.5 Admin and §E6.6 Admin:** Stages 2 (CONTEXT), 3 (AUTHZ), 8 (BUSINESS), 9 (POLICY) populated. §E6.6 adds stage 7 (REFERENCE) for `rule_id` on update/set_status. Both correct. ✓

**§E6.7 Query bundle:** Stages 1 (SYNTAX), 2 (CONTEXT), 3 (AUTHZ), 4 (SCOPE), 7 (REFERENCE) populated. No stage 6 state precondition (reads are stateless). No stage 8/9 (no mutation). Correct. ✓

**§E6.4 (21.4 Command) — PB3-M1:** The validation matrix contains no explicit stage 7 REFERENCE row for `invitation_id → rfq_invitations`. The invitation entity existence check is implicitly absorbed into the stage 4 SCOPE check: a `rfq_invitation_grantees` row can only exist if the underlying invitation exists, so grantee-row absence collapses to `NOT_FOUND` (§7.5). This is logically sound but creates implementation ambiguity: (a) an implementer reading only the matrix may omit the invitation entity existence check entirely, relying solely on the grantee row; (b) the coupling between grantee-row absence and invitation non-existence is implicit rather than stated; (c) Doc-4A §9.5 requires a REFERENCE stage check for entity existence. The absence of an explicit stage 7 row for `invitation_id` leaves a gap between the matrix and the implementation-grade standard established in Parts 1 and 2. Severity: **MINOR (PB3-M1)**.

---

### Area 3 — Authorization Model

**Result: PASS**

System contracts: no slug. ✓  
§E6.4 `respond_to_invitation`: `can_respond_to_rfq` (Doc-2 §7 confirmed present). ✓ Stage 5 DELEGATION for representative org via §6B grant. ✓  
§E6.5/§E6.6 Admin: `staff_super_admin` as nearest enumerated platform-governance slug (Doc-2 §7 confirmed present); `[ESC-RFQ-SLUG]` carried per H.3 and the slug-authority note. No slug invented. ✓ Pattern mirrors Doc-4C `[ESC-IDN-SLUG]` and Doc-4D `staff_can_ban`-nearest-slug precedent. ✓  
§E6.7 Query: buyer slugs `can_view_rfq`/`can_view_all_rfqs` (Doc-2 §7 confirmed). Vendor-side read access via grantee row (no slug; grantee row is the access mechanism). ✓  
The slug-authority note in the document header correctly explains the gap and the carry mechanism. All authorization bindings are pointer-bound; no authorization invented.

---

### Area 4 — State Machine Fidelity

**Result: PASS**

§E6.1 explicitly owns the `matching → vendors_notified` transition (Doc-2 §5.4). ✓ This is the only contract in Part 3 that owns an RFQ-head transition; no other contract claims it. ✓  
`rfq_invitations` lifecycle: `draft → selected → deferred → delivered` (§E6.1, §E6.2) and `deferred → delivered|expired` (§E6.3) and `delivered → accepted|declined` (§E6.4). These are all existing Doc-2 §3.4 edges. No edge invented. ✓  
`routing_rules` simple lifecycle (`create → active`; set_status transitions): §E6.6 correctly limits itself to this. ✓  
UNIQUE(rfq_id, vendor_profile_id) enforces one invitation per vendor per RFQ. ✓ A formal decline at §E6.4 correctly triggers `drain_deferred_queue` (§E6.3) — the capacity slot is freed and the consumer chain is initiated. ✓  
Deferral: A7-exhausted vendors deferred, not excluded (Doc-3 §4 FIXED). ✓ Drain on slot-free confirmed. ✓  
No transition owned by Part 3 contracts conflicts with Part 1 (`expire_rfq` owns `matching → expired` via PATCH-D3-05) or Part 2 (matching/re-ranking). ✓

---

### Area 5 — Event Binding

**Result: PASS WITH FINDING (PB3-N1)**

`VendorInvited` fires only at invitation `delivered` across all wave contracts (§E6.1, §E6.2, §E6.3). The FIXED invariant is stated in H.7 and repeated in each AI-Agent Notes section. ✓  
`RFQRouted` (PATCH-06) emitted at §E6.1 per routing run. ✓  
§E6.2 `replenish_wave` Event Binding states: "`RFQRouted` per replenishment run where applicable" — the condition for applicability is not defined. Does "applicable" mean at least one invitation was delivered? Does it emit on every replenishment run regardless of delivery outcome? PATCH-06 defines the event but does not define the applicability condition for replenishment runs. This vagueness may cause inconsistent emission across implementations. Severity: **NITPICK (PB3-N1)** — low risk given the event is observational (consumer legs don't gate on it), but precision is expected at implementation grade.  
§E6.4: emitted none — correct; accept/decline generates audit only, not a domain event (H.7). ✓  
§E6.5/§E6.6/§E6.7: none emitted. Correct. ✓  
No event coined. ✓ Single-authorship: Communication/Operations handle consumer legs; RFQ does not author their effects. ✓

---

### Area 6 — Audit Binding

**Result: PASS**

§E6.1: "routing run (mode, filter reference)" in `rfq_routing_log` + `InvitationDelivered` per row. ✓ Doc-2 §9 anchors. ✓  
§E6.2: same pattern. ✓  
§E6.3: `InvitationDelivered` or `InvitationExpired` (runway-starved). ✓  
§E6.4: `InvitationAccepted`/`InvitationDeclined`. ✓ Representative response attributed against the vendor profile + representative org. ✓  
§E6.5: "routing run" + actor + rationale + telemetry flag (Doc-3 §3.6). `[ESC-RFQ-AUDIT]` carried for human-assist annotation not separately enumerated in Doc-2 §9 — correct carry-marker protocol; no action invented. ✓  
§E6.6: "system_configuration change" (old/new + reason) (Doc-2 §9 Platform). ✓  
§E6.7: no audit. Reads are not audited per Doc-4A §17.1. ✓  
`rfq_routing_log` never stores blacklist traces — stated in H.6, §E6.1 audit binding, and §E6.7 AI-Agent Notes. ✓ Three-point confirmation for a critical non-disclosure invariant.

---

### Area 7 — Idempotency

**Result: PASS WITH FINDING (PB3-M2)**

System contracts: inherently idempotent per H.8. Re-fire produces same invitation/routing-log state; no duplicate `VendorInvited` or audit rows. ✓ The UNIQUE(rfq_id, vendor_profile_id) index is the mechanical enforcement. ✓  
§E6.6 `manage_routing_rule`: `Idempotency: required`. Replay → same rule version, no duplicate config-change audit. ✓ CONFLICT on concurrent edit (optimistic). ✓  
§E6.7 Query: reads are inherently idempotent; no `Idempotency` header required per Doc-4A §14. ✓  

**§E6.4 `respond_to_invitation` — PB3-M2:** §10 states `Idempotency: required` + "dedup window (POLICY)" but does not name a specific Doc-3 §12.2 POLICY key for the dedup window. Doc-3 §12.2 POLICY key inventory (confirmed via Doc-3 v1.0.1 + Doc-3_Patch_v1.0.2) does not contain a named key for the respond_to_invitation dedup window. The document should either (a) name the key if it exists in the corpus, or (b) carry `[ESC-RFQ-POLICY]` per the established pattern for absent POLICY keys. An AI agent implementing idempotency on this contract cannot resolve the dedup window to a configuration value. This is the same class of defect that produced POLICY-key gaps in earlier parts. Severity: **MINOR (PB3-M2)**.

---

### Area 8 — Error Register

**Result: PASS**

All error classes are drawn from the Doc-4A §12 closed class set. No class invented. ✓  
§E6.5: `BUSINESS` for forbidden-action attempt (H.4 maps this correctly — a rule violation, not an authZ failure). ✓  
§E6.6: `CONFLICT` for concurrent rule-version edit (optimistic locking). ✓  
§E6.4: `CONFLICT` for concurrent response race. ✓  
System contracts (§E6.1–§E6.3): errors are `STATE` (no-op path for non-matching conditions), `DEPENDENCY`, `SYSTEM`. Correct — no human actor means no authZ/BUSINESS forbidden-action path. ✓  
No QUOTA class in routing contracts — correct: quota metering is at the quotation submission layer (Doc-3 §4.1.1 accounting identity per PATCH-D3-01). Routing never decrements quota. ✓  
§E6.7: VALIDATION, AUTHORIZATION, NOT_FOUND. Correct for a read contract. ✓

---

### Area 9 — Field Schema & Source Authority

**Result: PASS**

All fields carry a source authority pointer per H.2. ✓  
`wave_params` (§E6.1): jsonb, nullable, source Doc-3 §5.2. ✓  
`checkpoint` (§E6.2): `enum<scheduled>`, source Doc-3 §5.3. ✓  
`slot_free_cause` (§E6.3): `enum<response|invitation_expiry|rfq_terminal>`, source Doc-3 §4.3. ✓  
`decline_reason_code` (§E6.4): conditional required (required iff decline), enum source Doc-3 §5.4. ✓  
`action` (§E6.5): `enum<suggest_vendor|validate_release|trigger_sourcing|request_clarification>`, source Doc-3 §3.6. ✓ No action invented beyond what Doc-3 §3.6 allows. ✓  
`rule_definition` (§E6.6): jsonb, required on create/update, parameters resolved from `core.system_configuration` by POLICY key — never inlined. ✓  
`filters` (§E6.7): jsonb, allowlisted fields only (§9.6). ✓  
Pass-B introduces no column (H.9). ✓

---

### Area 10 — Routing Fairness & Selection Doctrine

**Result: PASS**

§E6.1 stage 8 BUSINESS matrix explicitly enumerates: equivalence-band LRR rotation, exposure ceiling/ratio, probation allocation, anti-starvation, salted tie-break — all bound to Doc-3 §3.3. ✓  
"Never always-same, never pure-random" stated in the BC-3/BC-7 character block (line 21) and §E6.1 AI-Agent Notes. ✓  
Probation share bound to POLICY `routing.probation_share` (Doc-3 §12.2 confirmed). ✓  
Distribution limits bound to POLICY `distribution.*`; fairness limits to POLICY `fairness.*`. ✓  
Anti-starvation: stated in the selection doctrine pointer. ✓  
Salted tie-break: stated. ✓  
The fairness doctrine is bound by pointer to Doc-3 §3.3, never re-derived. ✓

---

### Area 11 — Supplier Distribution & Anti-Gaming Controls

**Result: PASS**

UNIQUE(rfq_id, vendor_profile_id): one invitation per vendor per RFQ. No repeated invitation to the same vendor. ✓  
`buyer_directed`-flagged invitations excluded from: valid-lead accounting (§E6.1 DE-7 cross-module, PATCH-D3-02), guarantee accounting, exposure-fairness ratios, and wave/replenishment counts. ✓ This is the correct application of PATCH-D3-02. ✓  
Deferral invisible to buyer (Doc-3 §4.2 FIXED). ✓ Stated in character block, §E6.1 AI-Agent Notes, §E6.3 state machine. ✓  
Pool-exhausted → honest buyer notification with options (extend/widen/relax), never silent failure, never fabricated activity (Doc-3 §5.3 FIXED). ✓  
Payment/plan does not influence selection or exposure-fairness ratios (§4B). ✓ Paid plans may influence lead volume/visibility products only. ✓  
No "always-same" path exists (selection always uses LRR + salted tie-break). ✓  
No "pure-random" path (equivalence-band rotation is deterministic under the salted tie-break). ✓

---

### Area 12 — Anti-Abuse Controls

**Result: PASS**

The human-assist forbidden-actions wall (Doc-3 §3.6/§0.1.1 FIXED) is enforced with exceptional thoroughness:

- Stated in BC-3/BC-7 character block as a FIXED invariant applying to every contract. ✓
- §E6.5 validation matrix: dedicated stage 8 BUSINESS row for the forbidden-actions wall, explicitly stating the five forbidden actions (bypass blacklist, eligibility, verification, trust restrictions, non-disclosure). ✓
- §E6.5 authorization matrix: wall stated. ✓
- §E6.5 state machine: "forbidden: any action that would bypass blacklist/eligibility/verification/trust → rejected". ✓
- §E6.5 error register: `BUSINESS` for forbidden action attempted. ✓
- §E6.5 AI-Agent Notes: wall explicitly stated including founder. ✓
- Suggested vendors re-gate via the pipeline (never injected without gate pass). ✓
- Every human-assist action audited with actor + rationale + telemetry flag (Doc-3 §3.6). ✓

No bypass path exists; the wall is multiply stated and enforced at every relevant section. Founder authority does not override the wall (explicitly confirmed).

---

### Area 13 — Governance Overrides & Manual Intervention Paths

**Result: PASS**

§E6.5 action enum bound to Doc-3 §3.6 allowed actions. No action invented. ✓  
`validate_release`: allows human validation of a sourcing release — not a bypass. ✓  
`trigger_sourcing`: initiates coverage recovery — not a selection bypass. ✓  
`request_clarification`: dispatched via Communication (DE-6). ✓  
`suggest_vendor`: suggested vendors enter the pipeline and re-gate through every Phase-A gate. Human never injects an ungated vendor. ✓  
The routing transition (`matching → vendors_notified`) remains the wave contract's (§E6.1), not §E6.5's. §E6.5 may queue candidates or annotate; it does not own any RFQ-head transition. ✓  
§E6.6 routing-rule changes: rule parameters are always referenced by POLICY key from `core.system_configuration`, never inlined. `[ESC-RFQ-POLICY]` carried for any absent key. ✓ Config changes audited as "system_configuration change" with old/new + reason. ✓

---

### Area 14 — Governance Signal Firewall

**Result: PASS**

H.10 states the firewall explicitly and comprehensively. ✓  
No governance signal (trust score, performance score, verification status) is mutated by any BC-3/BC-7 contract. All are read-only inputs (DE-2/DE-3). ✓  
No paid plan, entitlement flag, or tier gates eligibility, verification status, routing fairness, matching confidence, or selection. ✓  
"Payment may influence lead volume/visibility products only, never fairness or rank" (H.10). ✓  
The firewall is restated in §E6.1 cross-module references, §E6.2, §E6.6 AI-Agent Notes, and H.10. ✓  
No pay-to-win path introduced anywhere in Part 3. ✓

---

### Area 15 — Non-Disclosure Invariant

**Result: PASS**

H.10: deferral + blacklist exclusion indistinguishable from non-match. ✓  
§E6.7 §12 AI-Agent Notes: "A deferred or gate-excluded vendor is indistinguishable from non-match." ✓  
`rfq_routing_log` never stores blacklist traces: stated at H.6 (convention level), §E6.1 audit binding (contract level), and §E6.7 AI-Agent Notes (read surface level). ✓ Three-layer confirmation. ✓  
SCOPE stage 4 + NOT_FOUND collapse (§7.5) on all read contracts. ✓  
`rfq_routing_log` disclosed to buyer + compliance only (Doc-2 §10.4); routing-log AUTHZ enforces platform/ops scope. ✓  
No surface in Part 3 permits a vendor to infer they were deferred, excluded, or on any blacklist.

---

### Area 16 — Routing Replays & Notification Replays

**Result: PASS**

§E6.1 idempotency: replay produces same invitation set; one `VendorInvited` per delivery; no duplicate `rfq_routing_log` audit. Mechanical enforcement: UNIQUE(rfq_id, vendor_profile_id). ✓  
§E6.2: no duplicate invitations/events on re-fire at same checkpoint. ✓  
§E6.3: re-fire on already-drained queue is no-op. ✓  
§E6.4: replay after response returns same invitation state; no duplicate audit; state assertion (`delivered`) makes second response a STATE no-op or idempotent same-result within dedup window. ✓  
§E6.6: replay → same rule version, no duplicate config-change audit. ✓  
`VendorInvited` is authored once per delivered invitation; Communication's notification dispatch is a consumer leg under Communication's idempotency responsibility (single-authorship, DE-6). The document correctly does not claim notification replay protection — that is the Communication module's concern. ✓

---

### Area 17 — Procurement Moat

**Result: PASS**

Routing/invitation/fairness/selection: RFQ-owned throughout. ✓  
Marketplace (DE-2): vendor attributes read-only; no routing authority transferred to Marketplace at any point. Explicitly stated in §E6.1, §E6.2, H.10. ✓  
Operations (DE-4): `vendor_leads` consumer leg (DE-4 creates leads from `VendorInvited`); RFQ does not author Operations' effects. ✓  
Communication (DE-6): notification dispatch consumer. ✓  
Billing/Commercial (DE-7): quota ceiling read at intake; `buyer_directed` exclusion consumed. ✓ Billing never influences selection. ✓  
Trust (DE-3): governance signals read-only inputs to BC-2 matching; BC-3 does not consume trust signals directly (they are already embedded in `matching_results`). ✓  
DDD boundary integrity: confirmed across all 8 contracts. No module boundary crossed or shifted.

---

### Area 18 — DDD Boundary & Single-Authorship

**Result: PASS**

`VendorInvited` authored by RFQ (emitter); Communication and Operations handle consumer legs. ✓  
`RFQRouted` authored by RFQ. ✓  
`InvitationDelivered`/`InvitationAccepted`/`InvitationDeclined`/`InvitationExpired` authored by RFQ. ✓  
No audit action authored on behalf of another module. ✓  
`core.system_configuration` POLICY writes (§E6.6) are via Platform Core (DE-8) — RFQ calls the Platform Core audit/config channel. ✓  
No cross-schema FK write introduced. ✓  
`rfq_routing_log` append-only; `routing_rules` owned by platform; both consumed by the appropriate module. ✓

---

### Area 19 — Conformance Summary

**Result: PASS**

7 table rows cover 8 contracts (query bundle correctly counted as one row). ✓  
All columns populated: template, RFQ-head transition/invitation transition, emitted, audit action, carried marker. ✓  
Governance confirmation paragraph is comprehensive and accurate: no entity invented, no slug invented, no event coined, no POLICY key invented, no template changed, selection math bound to Doc-3 by pointer, moat preserved, firewall, non-disclosure invariant, forbidden-actions wall, slug gap carried under `[ESC-RFQ-SLUG]`, flag-and-halt not triggered. ✓  
Carried markers per contract correctly reflect DE-1…DE-8 dependencies. ✓  
`[ESC-RFQ-SLUG]` and `[ESC-RFQ-POLICY]` correctly attributed to the contracts that use them. ✓

---

### Area 20 — AI-Agent Safety Assessment

**Result: PASS**

Part 3 has the strongest AI-agent safety posture seen in the Doc-4E series. Each contract's §12 section is specific, actionable, and reinforces the FIXED invariants.

**§E6.1:** Selection doctrine FIXED (never always-same, never pure-random). Deferral invisible to buyer. `VendorInvited` only at `delivered`. Grantee rows materialize atomically at delivery. Payment never influences selection. All stated explicitly. ✓  
**§E6.2:** Pool-exhausted → honest notification, never silent failure, never fake activity (FIXED). ✓  
**§E6.3:** Auto-expire undelivered rather than deliver sub-runway (FIXED). Vendor self-throttle never penalized. ✓  
**§E6.4:** Make declining easier than ignoring. Formal decline = response (protects response-rate health metric). Zero negative performance effect. ✓  
**§E6.5:** Forbidden-actions wall is FIXED — no stage, founder included, may bypass blacklist/eligibility/verification/trust or breach non-disclosure. Suggested vendors pass every Phase-A gate (re-gated). Every action audited with actor + rationale + telemetry flag. Routing transition belongs to the wave contract. `[ESC-RFQ-SLUG]` carried; no slug invented. ✓  
**§E6.6:** Never hardcode a threshold — reference the Doc-3 §12.2 key. Paid plans never gate routing fairness or selection. `[ESC-RFQ-POLICY]` carry for absent keys. ✓  
**§E6.7:** Routing log per disclosure rules only. Deferred/excluded vendor indistinguishable from non-match. Vendor reads are grant-scoped; no public RFQ board. ✓

An AI agent implementing from this document will be correctly directed away from every major routing-governance failure mode.

---

## Routing Governance Analysis

The routing governance architecture in Part 3 is structurally sound. The separation of wave routing (System contracts), human-assisted intervention (Admin contract with a hard forbidden-actions wall), and control-plane configuration (manage_routing_rule with POLICY-key-only binding) is correctly layered. The wave contract (§E6.1) is the sole owner of the `matching → vendors_notified` head transition; §E6.5 (human-assist) explicitly routes through the wave contract's transition rather than owning one itself. Routing rules tune fairness/selection mechanics within POLICY bounds; they do not circumvent the selection doctrine.

The slug gap for routing-governance authority is handled consistently: `[ESC-RFQ-SLUG]` is a well-understood carry marker established for this document, mirroring the Doc-4C/Doc-4D precedent. The `staff_super_admin` nearest-slug binding is appropriate in the absence of a dedicated least-privilege slug.

---

## Fairness Analysis

The fairness doctrine is enforced at multiple layers: the selection doctrine (Doc-3 §3.3, bound by pointer) governs initial wave selection; the same floors apply to replenishment waves (explicitly confirmed at §E6.2); the drain queue (§E6.3) respects priority order (window-end then confidence), not FIFO or arbitrary ordering; buyer-directed invitations are excluded from fairness ratios (PATCH-D3-02, correctly applied). The governance-signal firewall prevents any commercial signal from influencing selection. The "never always-same, never pure-random" invariant is multiply stated and the salted tie-break ensures determinism without predictability. The non-disclosure invariant prevents vendor gaming via exclusion inference.

---

## Procurement Moat Analysis

The RFQ module retains full ownership of routing, invitation, fairness, and supplier selection. Marketplace supplies vendor data read-only via DE-2 and acquires no routing authority at any point in Part 3. Operations creates `vendor_leads` as a consumer (DE-4) but does not influence routing decisions. Communication dispatches notifications as a consumer (DE-6) but does not gate routing. Billing supplies a quota ceiling read at intake (DE-7) but does not gate selection — only delivery volume. Trust/Performance signals (DE-3) are read-only inputs already embedded in `matching_results` by BC-2; BC-3 does not re-read or re-process them. The moat boundary is intact across all 8 contracts.

---

## Drift Analysis

| Dimension | Result | Evidence |
|---|---|---|
| **Ownership Drift** | NONE | No entity/aggregate ownership shifted. Routing/invitation/fairness remain RFQ-owned. Marketplace acquires no routing authority. |
| **Lifecycle Drift** | NONE | No state or transition added. All edges are existing Doc-2 §3.4/§5.4 edges. `matching → vendors_notified` ownership confirmed as §E6.1's. PATCH-D3-05 (`matching → expired`) unaffected. |
| **Authorization Drift** | NONE | No slug invented. `[ESC-RFQ-SLUG]` carry marker used correctly. System contracts have no slug. `can_respond_to_rfq` confirmed in Doc-2 §7. |
| **Event Drift** | NONE | No event coined. `VendorInvited` and `RFQRouted` are existing Doc-2 §8 events (PATCH-06 confirmed). `VendorInvited` fires only at `delivered`. |
| **Audit Drift** | NONE | All audit actions are existing Doc-2 §9 entries (`InvitationDelivered/Accepted/Declined/Expired`, "routing run", "system_configuration change"). `[ESC-RFQ-AUDIT]` carry used for human-assist annotation. |
| **POLICY Drift** | NONE | No POLICY key invented. `routing.probation_share`, `distribution.*`, `fairness.*`, `capacity.min_response_runway_hours` are confirmed Doc-3 §12.2 keys. `[ESC-RFQ-POLICY]` carried where appropriate. |
| **Moat Drift** | NONE | Procurement moat intact. RFQ owns routing; Marketplace owns vendor data (read-only). |
| **Firewall Drift** | NONE | Governance-signal firewall intact. No signal mutated. No plan/entitlement gates routing fairness or selection. |
| **DDD Boundary Drift** | NONE | No module boundary crossed. Single-authorship preserved across all events. |

---

## Findings Detail

### PB3-M1 (MINOR) — §E6.4 `respond_to_invitation.v1`: Missing REFERENCE Stage Row for `invitation_id`

**Location:** §E6.4 — section **4. Validation Matrix**.

**Description:** The validation matrix for `respond_to_invitation.v1` contains no explicit stage 7 REFERENCE row for `invitation_id → rfq_invitations`. The invitation entity existence check is implicitly absorbed into the stage 4 SCOPE check: a `rfq_invitation_grantees` row can only exist if the underlying `rfq_invitations` row exists, so grantee-row absence collapses to `NOT_FOUND` (§7.5). This is logically sound but leaves a gap between the matrix and Doc-4A §9.5, which requires a REFERENCE stage check for entity existence.

**Risk:** An implementer reading only the matrix may resolve the invitation entity existence check solely via the grantee-row lookup, potentially missing the case where an `invitation_id` UUID is syntactically valid but does not exist in `rfq_invitations` at all (e.g., a spoofed ID with no grantee row, which the current matrix handles correctly but only implicitly). More critically, the coupling between grantee-row absence and invitation non-existence is implicit: the implementation must know that the grantee row lookup inherently resolves the invitation entity existence. This is a documentation-grade gap at the matrix level; an AI agent may not infer the coupling.

**Required Patch:** Add an explicit stage 7 REFERENCE row: `invitation_id` → `rfq_invitations` exists → `NOT_FOUND` (§7.5 collapse). This can be stated as naturally subsumed by the SCOPE check (note: "grantee row check implies invitation existence; both resolve to NOT_FOUND") to maintain implementation coherence.

---

### PB3-M2 (MINOR) — §E6.4 `respond_to_invitation.v1`: Unnamed POLICY Key for Idempotency Dedup Window

**Location:** §E6.4 — section **10. Idempotency Rules**.

**Description:** §10 states "`Idempotency: required` + dedup window (POLICY)" but does not name a specific Doc-3 §12.2 POLICY key for the dedup window. The Doc-3 §12.2 POLICY key inventory (confirmed against Doc-3 v1.0.1 + Doc-3_Patch_v1.0.2) does not contain a named key for this window (no `respond_to_invitation.dedup_window` or equivalent). The document should either (a) cite the key if it exists in the corpus, or (b) carry `[ESC-RFQ-POLICY]` per the established pattern for absent POLICY keys.

**Risk:** An AI agent implementing idempotency on this contract cannot resolve the dedup window to a configuration value without a POLICY key reference. The dedup window is an implementation-critical parameter: too short risks missing retries; too long risks masking replay attacks. Without a named key, implementation will diverge across teams.

**Required Patch:** Either (a) identify and name the Doc-3 §12.2 POLICY key for the dedup window if it exists, or (b) add `[ESC-RFQ-POLICY]` carry and note "dedup window → `[ESC-RFQ-POLICY]` (key not yet enumerated in Doc-3 §12.2; use standard idempotency dedup window pending additive definition)" per the established carry-marker protocol.

---

### PB3-N1 (NITPICK) — §E6.2 `replenish_wave.v1`: Undefined `RFQRouted` Applicability Condition

**Location:** §E6.2 — section **8. Event Binding**.

**Description:** Event Binding states `VendorInvited` per newly-delivered invitation and "`RFQRouted` per replenishment run where applicable (PATCH-06)". The condition for "where applicable" is undefined. PATCH-06 registers `RFQRouted` but does not define a per-replenishment-wave emission condition. Implementations may emit on every run, only when deliveries occur, or only when the wave meets a threshold — all ambiguous.

**Recommendation:** Clarify: "Emits `RFQRouted` per replenishment run that results in at least one delivered invitation" (or whatever the correct condition is per PATCH-06 intent). If no emission condition is defined in the corpus for replenishment runs, carry `[ESC-RFQ-POLICY]` or add a note. Non-blocking: `RFQRouted` is observational (no consumer gates on it for routing decisions).

---

### PB3-N2 (NITPICK) — Document Header: Inaccurate Description of `[ESC-RFQ-SLUG]` as "`[ESC-RFQ-POLICY]`-adjacent"

**Location:** Document header, slug-authority note (line 19).

**Description:** The slug-authority note describes the `[ESC-RFQ-SLUG]` marker as "`[ESC-RFQ-POLICY]`-adjacent escalation." This framing is inaccurate: `[ESC-RFQ-SLUG]` addresses missing permission slugs (Doc-2 §7 additive channel), while `[ESC-RFQ-POLICY]` addresses missing POLICY keys (Doc-3 §12.2 additive channel). They are distinct carry channels with different resolution paths. The contracts themselves use the markers correctly; the inaccuracy is in the header description only.

**Recommendation:** Replace "adjacent" framing. State: "`[ESC-RFQ-SLUG]` is a Doc-2 §7 additive escalation marker for a missing routing-governance permission slug — distinct from `[ESC-RFQ-POLICY]` (Doc-3 §12.2 additive, POLICY key gap). The two channels are independent." Cosmetic; zero implementation risk.

---

## Summary Table

| ID | Severity | Location | Description | Status |
|---|---|---|---|---|
| **PB3-M1** | **MINOR** | §E6.4 Validation Matrix | Missing explicit stage 7 REFERENCE row for `invitation_id → rfq_invitations`; entity existence check implicitly absorbed into SCOPE (defensible but creates matrix-level documentation gap and AI-agent ambiguity) | **REQUIRES PATCH** |
| **PB3-M2** | **MINOR** | §E6.4 §10 Idempotency | "dedup window (POLICY)" cited without a named Doc-3 §12.2 POLICY key; no carry marker; AI agent cannot resolve dedup window to a configuration value | **REQUIRES PATCH** |
| **PB3-N1** | **NITPICK** | §E6.2 §8 Event Binding | `RFQRouted` emission condition "where applicable" undefined for replenishment runs; may cause inconsistent emission | Discretionary |
| **PB3-N2** | **NITPICK** | Document Header (slug-authority note) | `[ESC-RFQ-SLUG]` incorrectly described as "`[ESC-RFQ-POLICY]`-adjacent"; the two carry markers address distinct additive channels | Discretionary |

**Counts:** 0 BLOCKERs · 0 MAJORs · 2 MINORs · 2 NITPICKs

---

## Final Decision

**APPROVE WITH PATCH**

Part 3 is implementation-grade in all material respects. The routing governance architecture, fairness doctrine, anti-abuse controls, procurement moat, governance-signal firewall, and non-disclosure invariant are all sound and comprehensively stated. No BLOCKER. No MAJOR. The two MINORs (PB3-M1 and PB3-M2) are documentation-grade gaps in §E6.4's validation matrix and idempotency section — both require patch before freeze. They do not implicate any cross-cutting architectural defect. The two NITPICKs are discretionary.

---

## Approval Question

**Can Part-3 proceed to Doc-4E_PassB_Part3_Patch?**

**YES — conditional on patch of PB3-M1 and PB3-M2.**

**Justification:**

The document is architecturally correct, governance-compliant, and implementation-ready subject to two patch items in §E6.4. Both are documentation-grade gaps, not behavioral defects: PB3-M1 makes an implicit entity-existence check explicit at the matrix level; PB3-M2 names or carries a POLICY key for the idempotency dedup window. Neither requires a redesign, a Pass-A reopening, or a change to any FIXED invariant. On closure of PB3-M1 and PB3-M2 (with PB3-N1 and PB3-N2 at Board discretion), Part 3 is ready for Patch Verification and Freeze Audit.

---

*End of Doc-4E_PassB_Part3_Independent_Hard_Review_v1.0 — Decision: APPROVE WITH PATCH — 0 BLOCKERs · 0 MAJORs · 2 MINORs (PB3-M1: §E6.4 missing REFERENCE stage row; PB3-M2: §E6.4 unnamed idempotency dedup window POLICY key) · 2 NITPICKs (PB3-N1: §E6.2 RFQRouted applicability condition; PB3-N2: header carry-marker description). Scope: BC-3 Routing/Selection/Distribution + BC-7 Routing Governance & Control Plane (§E6, 8 contracts). Next: Doc-4E_PassB_Part3_Patch_v1.0.*
