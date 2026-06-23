# Doc-4E Pass-B Part-4 Independent Hard Review

**Report ID:** Doc-4E_PassB_Part4_Independent_Hard_Review_v1.0  
**Document Under Review:** Doc-4E_Content_v1.0_PassB_Part4_QuotationManagement.md  
**Scope:** BC-4 — Quotation Management (§E7 — 5 contracts)  
**Reviewer Role:** Architecture Board Independent Hard Reviewer · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Governance Auditor  
**Review Date:** 2026-06-17  
**Authoritative Corpus:** Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1/2/3_v1.0_FROZEN — all FROZEN

---

## Executive Verdict

Part 4 is a competent Pass-B hardening document with correct field schemas, sound authorization, solid event and audit integrity, and well-stated vendor isolation. However, two MAJORs demand patch before this document can proceed to freeze.

The first MAJOR is a state-machine ownership gap: the `vendors_notified → quotations_received` RFQ-head transition — explicitly assigned to `submit_quotation.v1` in Pass-A §E7 — is missing from §E7.1's State Machine Enforcement section, and the Conformance Summary incorrectly labels it "Part-1-owned." An implementer reading only the contract body will not implement this transition; it is only visible in a footnote with a wrong ownership attribution.

The second MAJOR is a procurement integrity gap: the quotation-read contract (§E7.5) makes no reference to `abuse.sealed_until_close` (Doc-3 §12.2 POLICY key), which may restrict buyer visibility of price breakdowns pre-close in sealed-bid mode. No AI-agent guidance on this POLICY-gated behavior is provided. An AI agent implementing buyer quotation reads may expose price breakdowns before the submission window closes — a serious procurement fairness breach.

Both MAJORs are targeted, non-architectural fixes. Two MINORs and two NITPICKs are also flagged.

**APPROVE WITH PATCH** — 0 BLOCKERs · 2 MAJORs · 2 MINORs · 2 NITPICKs.

---

## Area-by-Area Findings

### Area 1 — Pass-A Conformance

**Result: PASS WITH FINDING (PB4-MA1)**

**Contract inventory:** 5 contracts per Pass-A §E7 baseline — `submit_quotation.v1`, `revise_quotation.v1`, `withdraw_quotation.v1`, `request_late_extension.v1`, and the query bundle (`get_quotation.v1` / `list_quotations_for_rfq.v1`). All present; none extra; none missing. ✓

**Pass-B mission:** Correctly stated — hardens Pass-A contracts to implementation grade without redesign. No entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. ✓

**PB4-MA1 — `vendors_notified → quotations_received` transition ownership error:** Pass-A §E7 `submit_quotation.v1` State-Machine entry explicitly states: *"If the RFQ is in `vendors_notified` and this is the first submitted quotation, the RFQ advances `vendors_notified → quotations_received` (Doc-2 §5.4) within the same transaction as the quotation write and `QuotationSubmitted` outbox insert (single-transaction rule, Doc-4A §16 / Doc-2 §10.11.4)."* This is unambiguous: Pass-A assigns the `vendors_notified → quotations_received` RFQ-head transition to `submit_quotation.v1` (BC-4/Part 4).

Part 4 §E7.1 §6 State Machine Enforcement is silent on this transition — it covers only the quotation-level edge (`draft → submitted`) and the partial UNIQUE constraint. The transition appears only in the Conformance Summary footnote, labeled **"Part-1-owned edge"** — which directly contradicts Pass-A. Part 1 (BC-1) does not own this transition; Doc-2 §5.4 shows it is triggered by the first quotation, an event in BC-4.

**Impact:** An implementer reading §E7.1's State Machine section will not implement the `vendors_notified → quotations_received` transition. The footnote note is insufficient — it misstates ownership and is separated from the normative section. An AI coding agent will almost certainly miss it. Severity: **MAJOR (PB4-MA1)**.

---

### Area 2 — BC-4 Contract Inventory Completeness

**Result: PASS**

Five contracts correctly enumerate the BC-4 scope per Pass-A §E7. The command contracts cover the full quotation mutation surface (submit, revise, withdraw, late extension). The query bundle covers vendor-own and buyer-via-visibility reads. No contracts missing; no extra contracts invented. The formal decline (`respond_to_invitation`, `can_respond_to_rfq`) is correctly kept in Part 3 (BC-3) as stated in H (Part 4 header, BC-4 character note). ✓

---

### Area 3 — Request Schema Completeness

**Result: PASS WITH FINDING (PB4-M1)**

**§E7.1 `submit_quotation.v1`:** `invitation_id`, `rfq_id`, `rfq_version_id` (version-binding), `price_breakdown`, `delivery_terms`, `warranty_terms` (optional), `spec_compliance_declaration`, `attachments_refs` (optional). All sourced to Doc-2 §10.4 or Doc-3 §8.1. ✓ `spec_compliance_declaration` required per Doc-3 §8.1 completeness floor. ✓ `rfq_version_id` correctly named for version-binding (never the mutable head). ✓

**`validity_period` gap (PB4-N1):** Doc-3 §8.1 completeness floor lists "price, validity period, delivery terms; spec-compliance declaration." Validity period is not a named field in the request schema; it is presumably embedded within `delivery_terms` jsonb. The document does not explicitly note this embedding. See PB4-N1.

**`invitation_id` REFERENCE stage gap (PB4-M1):** `invitation_id` is in the request schema and is a foundational precondition for quotation submission (Doc-3 §8.1: "delivered invitation"). The validation matrix has no explicit stage 7 REFERENCE row for `invitation_id → rfq_invitations`. The grantee-row SCOPE check (stage 4) and the STATE check (stage 6: "a `delivered` invitation grantee row") collectively imply invitation existence, but not explicitly via a stage 7 REFERENCE check as required by Doc-4A §9.5. This is the same structural gap as PB3-M1. Severity: **MINOR (PB4-M1)**.

**§E7.2 `revise_quotation.v1`:** `quotation_id`, `expected_version_no` (optimistic concurrency), `rfq_version_id`, `changed_terms`, `revision_reason`. All sourced. ✓

**§E7.3 `withdraw_quotation.v1`:** `quotation_id`, `expected_version_no`, `withdrawal_reason`. Reason required per Doc-3 §8.3. ✓

**§E7.4 `request_late_extension.v1`:** `rfq_id`, `invitation_id`, `buyer_decision` (conditional — buyer step). Correctly nullable for the vendor-request step. ✓

**§E7.5 Query bundle:** `quotation_id` (get), `rfq_id` (list), `filters` (allowlisted), `page`. All sourced. ✓

---

### Area 4 — Response Schema Completeness

**Result: PASS**

**§E7.1:** `quotation_id`, `human_ref` (`QTN-…`), `version_no`, `state = submitted`, `reference_id`. ✓ `human_ref` is sourced to `core.allocate_human_reference.v1` via DE-8. ✓

**§E7.2:** `quotation_id`, `new_version_no`, `supersedes_version_no`, `state = submitted`, `reference_id`. ✓ `supersedes_version_no` is critical for version-chain integrity and is correctly present. ✓

**§E7.3:** `quotation_id`, `state = withdrawn`, `reference_id`. ✓ Terminal state explicit. ✓

**§E7.4:** `rfq_id`, `window_state = enum<reopened|denied>`, `reference_id`. ✓ Clear outcome signal. ✓

**§E7.5:** `quotation_projection` (`state`, `current_version_no`, version terms per scope) for get; paginated `items` for list; `page_info`, `reference_id`. ✓ "Version terms per scope" correctly defers detail to disclosure rules without over-specifying.

---

### Area 5 — Validation Matrix Correctness

**Result: PASS WITH FINDINGS (PB4-MA2, PB4-M1)**

**§E7.1 submit_quotation:**
- Stages 1–9 all populated. ✓ Stage 9 POLICY (`monthly_rfq_limit` quota check → `QUOTA` error class) per H.1 dual-mapping. ✓
- Stage 7 REFERENCE: absent for `invitation_id` — see PB4-M1.
- Stage 6 STATE correctly includes the partial-UNIQUE one-active-per-vendor check alongside the RFQ quotable state check. ✓
- Stage 8 BUSINESS: completeness floor (blocks only truly empty; quality is scored). ✓

**§E7.2 revise_quotation:**
- Stages 1–7 populated; stage 9 POLICY for revision soft-cap. ✓
- Stage 6 STATE covers two checks (quotation state + version concurrency). The version-concurrency check is labeled "6 STATE / concurrency" rather than a separate stage — defensible per Doc-4A §14, which treats optimistic concurrency as a state assertion. ✓
- No stage 8 BUSINESS row, which is correct: the only business-level check is the revision-cap (at stage 9) and there is no independent BUSINESS precondition. ✓

**§E7.3 withdraw_quotation:**
- Stages 1–6 populated. ✓ No REFERENCE stage needed (quotation_id visibility checked via SCOPE + NOT_FOUND collapse). ✓ No POLICY stage needed (no POLICY key governs withdrawal eligibility). ✓

**§E7.4 request_late_extension — PB4-MA2 context and PB4-M2:**
- Stage 3 AUTHZ combines both actors (vendor `can_respond_to_rfq` + buyer `can_create_rfq`) in a single row. The two-actor flow means this contract has two distinct call sites (vendor request call, buyer approval call), but the validation matrix does not separate them. An implementer cannot determine from the matrix which stages apply to the vendor call and which to the buyer call. See PB4-M2.
- Stage 7 REFERENCE present for `invitation_id` (correctly). ✓
- Stage 9 POLICY for extension bound (`quote.late_extension_max_days`). ✓

**§E7.5 query bundle:**
- Stages 1–5 and 7 populated. No stages 6, 8, 9 (reads — correct). ✓ Allowlisted filter/sort fields (§9.6). ✓

---

### Area 6 — Authorization Integrity

**Result: PASS**

All slugs verified against Doc-2 §7:
- `can_submit_quote`: confirmed (§7 row: "Quotation create/submit"). ✓ Also governs revise (same slug, confirmed in Pass-A §E7.2). ✓
- `can_withdraw_quote`: confirmed (§7 row: "Quotation withdraw"). ✓
- `can_respond_to_rfq`: confirmed (§7 row: "RFQ invitation response (accept / formal decline)"). ✓ Used for late-extension request per Pass-A §E7.
- `can_create_rfq`: confirmed in Doc-2 §7 (buyer authority for extension approval). ✓
- `can_view_rfq` / `can_view_all_rfqs`: confirmed (§7 RFQ read slugs). ✓
- No slug invented. ✓
- §6B delegation eligible for all Command contracts. ✓
- `controlling_organization_id` as the vendor-side scope anchor (vendor isolation). ✓
- Scope = vendor controlling org; buyer scope = own RFQ + `quotation_visibility`. ✓

---

### Area 7 — Quotation Confidentiality

**Result: PASS WITH FINDING (PB4-MA2)**

**Vendor isolation:** A vendor reads only its own quotation via `controlling_organization_id` anchor + grantee/visibility rows. NOT_FOUND collapse for no-access (§7.5). ✓ "No vendor ever sees another vendor's quotation" stated explicitly in §E7.5 AI-Agent Notes. ✓

**Buyer visibility:** Gated by `quotation_visibility` grant table (Doc-2 §10.4). ✓ `quotation_visibility(PK: quotation_id, grantee_organization_id)` confirmed. ✓

**Cross-vendor secrecy:** One active quotation per vendor (partial UNIQUE). ✓ Vendor reads scope-restricted. ✓ Buyer sees only the quotations on their own RFQ via visibility grant. ✓

**`abuse.sealed_until_close` gap — PB4-MA2:** Doc-3 §12.2 includes `abuse.sealed_until_close` in the POLICY key inventory under "Abuse/Econ" controls. This key governs whether buyers can view price breakdowns before the quotation window closes (sealed-bid protection). Part 4 §E7.5 Quotation Read contract (response schema: "version terms per scope") makes no reference to this POLICY key, does not acknowledge a sealed-submission mode, and provides no AI-agent guidance on POLICY-gated buyer visibility restrictions. In sealed mode, a buyer API call for quotation terms before window close must be restricted — a failure to implement this risks exposing vendors' pricing to the buyer pre-close, allowing price discovery that corrupts procurement fairness. This is a material procurement integrity gap. No reference to `abuse.sealed_until_close` appears anywhere in Part 4. Severity: **MAJOR (PB4-MA2)**.

---

### Area 8 — Quotation Revision Governance

**Result: PASS**

Revisions never overwrite — always `version_no+1` with `supersedes_version_no` (Doc-2 §5.5 FIXED). ✓ Stated in §E7.2 §6 State Machine, §12 AI-Agent Notes. ✓  
`revision_reason` required. ✓  
`expected_version_no` optimistic concurrency. ✓  
Revision does not consume quota (Doc-3 §4.1.1). ✓ Billing: none in §E7.2 cross-module. ✓  
Soft-cap POLICY `quote.max_revisions` [start: 3] confirmed in Doc-3 §12.2. ✓ Beyond cap requires clarification-thread justification. ✓  
Post-close lock: "revision locked except buyer best-and-final or buyer window-reopen." ✓ No private per-vendor extensions. ✓  
No event on revision: H.7 verifies "quotation revision has NO Doc-2 §8 event." ✓ Confirmed in Pass-A §E7 (B.6 non-event). ✓  
Audit: "Quotation edit (new version)" (Doc-2 §9). ✓

---

### Area 9 — Withdrawal Governance

**Result: PASS**

Withdrawal: pre-award only, from `submitted` state. ✓  
`withdrawal_reason` required and non-empty. ✓  
`expected_version_no` for optimistic concurrency. ✓  
`submitted → withdrawn` (Doc-2 §5.5, terminal for that quotation). ✓  
Forbidden: withdrawing a selected/not_selected/expired/withdrawn quotation → `STATE`. ✓  
Withdrawal frees active-capacity slot → triggers `drain_deferred_queue` (Part 3, §E6.3). ✓  
`QuotationWithdrawn` emitted (Doc-2 §8). ✓ Idempotent: second withdraw is `STATE` no-op. ✓  
Withdrawal counts as a response (vendor engaged — Doc-3 §8.3). ✓ Never penalized as non-response. ✓  
Habitual late withdrawal (after `buyer_reviewing`) carries Quote-Quality discount (analytics, not state). ✓  
Withdrawal-after-shortlist → buyer alert + optional replenishment wave (Communication/Part 3 consumer legs). ✓  
Audit: "Quotation withdraw" (Doc-2 §9). ✓

---

### Area 10 — Late Submission Governance

**Result: PASS WITH FINDING (PB4-M2)**

**No silent late acceptance:** FIXED. ✓ Stated at H (BC-4 character block), §E7.4 §6 State Machine, §12 AI-Agent Notes. ✓  
**No per-vendor private windows:** FIXED. ✓ Window reopen applies to all un-responded invitees. ✓  
**Extension bound:** POLICY `quote.late_extension_max_days` confirmed in Doc-3 §12.2. ✓  
**Buyer approval required:** vendor requests → buyer one-tap approve → window reopens. ✓  
**Shortlist case:** explicit buyer action + re-notification of shortlisted (Doc-3 §8.5 confirmed). ✓

**Two-actor implementation ambiguity — PB4-M2:** The contract handles two distinct call sites in one contract ID: (a) vendor sends `rfq_id + invitation_id` to request the extension; (b) buyer sends `rfq_id + buyer_decision` to approve or deny. The validation matrix combines both actors at stage 3 AUTHZ in a single row without separating which stages and fields apply to which call site. The `buyer_decision` field is nullable (required only on the buyer step), but neither the validation matrix nor the AI-Agent Notes explicitly describe the two-step flow — how the system routes between the vendor-request call and the buyer-approval call, which fields are validated at each step, and how the contract is gated between them. An AI agent implementing this contract may conflate the two call sites or incorrectly require `buyer_decision` on the vendor request step. Severity: **MINOR (PB4-M2)**.

---

### Area 11 — Event Integrity

**Result: PASS**

`QuotationSubmitted` (Doc-2 §8): emitted by `submit_quotation.v1` at submission, via Doc-4B outbox-write in the same transaction as the quotation write. ✓ One emission per submit; idempotent on replay (no duplicate). ✓ Primary consumers: comparison refresh (Part 5 — `generate_comparison_statement.v1`), Trust performance inputs, Billing usage-ledger. ✓ Single-authorship: RFQ emits, consumers handle their own legs. ✓  

`QuotationWithdrawn` (Doc-2 §8): emitted by `withdraw_quotation.v1`. ✓ Idempotent: second withdraw is `STATE` no-op with no duplicate event. ✓  

`QuotationSelected` (Doc-2 §8): emitted by `award_rfq` (Part 5). Correctly NOT authored in Part 4. ✓  

Quotation revision: no domain event — H.7 confirms "verified." ✓ AI-Agent Notes explicitly instruct: "do not coin a quotation-revision event." ✓  

No event coined. ✓ All emitted events are pre-existing Doc-2 §8 entries.

---

### Area 12 — Audit Integrity

**Result: PASS**

All audit actions are from the Doc-2 §9 Quotation domain:
- `submit_quotation.v1`: "Quotation submit" (and "create" on first version). ✓
- `revise_quotation.v1`: "Quotation edit (new version)." ✓
- `withdraw_quotation.v1`: "Quotation withdraw." ✓
- `request_late_extension.v1`: "RFQ edit (new version)" (window change). ✓ Matches Pass-A: "Doc-2 §9 RFQ 'edit (new version)' / routing-run as applicable." ✓
- Query bundle: no audit (reads not audited per Doc-4A §17.1). ✓

No audit action invented. ✓ `[ESC-RFQ-AUDIT]` not needed in Part 4 (all actions are enumerated in Doc-2 §9). ✓ Attribution to User (vendor; representative recorded against its org per Doc-3 §2.8). ✓

The quota-ledger entry is Billing's write (consumer of `QuotationSubmitted`) — correctly not an RFQ audit action. ✓ PA-19 correctly referenced. ✓

---

### Area 13 — Procurement Fairness Integrity

**Result: PASS WITH FINDING (PB4-MA2)**

No vendor may see another vendor's quotation at any stage (vendor isolation via `controlling_organization_id` + `quotation_visibility`). ✓  
No paid plan or entitlement gates quotation eligibility, submission, or consideration. ✓  
Quota is a submission gate only — it is a volume entitlement, never a ranking input (§4B). ✓  
Revision soft-cap (POLICY) prevents unlimited silent revisions that would enable price-signaling games (Doc-3 §10.7). ✓  
No per-vendor private windows on late extension. ✓  

**Sealed-bid fairness gap (PB4-MA2):** The `abuse.sealed_until_close` POLICY key (Doc-3 §12.2) protects procurement fairness by preventing buyers from viewing price breakdowns pre-close in sealed mode. The absence of this POLICY reference in §E7.5 means the buyer-read contract does not honor a potentially active platform-level sealed-bid protection. If `abuse.sealed_until_close` is true, an unrestricted buyer read of quotation terms pre-close gives the buyer competitive pricing intelligence that undermines the sealed procurement process. This fairness breach is the procurement-integrity dimension of PB4-MA2.

---

### Area 14 — Procurement Moat Protection

**Result: PASS**

Quotation lifecycle (submit/revise/withdraw/read) is RFQ-owned (Module 3 BC-4). ✓  
Quotation visibility is RFQ-owned (`quotation_visibility` grant; buyer-scoped). ✓  
Quotation governance (version immutability, one-per-vendor, soft-cap) is RFQ-owned via Doc-2 §5.5 + Doc-3 §8 — bound by pointer, not re-derived. ✓  
Marketplace acquires no quotation authority at any point. ✓  
Comparison statement refresh is a consumer leg of `QuotationSubmitted` (Part 5) — correctly not authored in Part 4. ✓  
`QuotationSelected` is Part 5's (award_rfq). ✓

---

### Area 15 — Governance Signal Firewall

**Result: PASS**

No Trust, Performance, or Verification signal is read or mutated by any BC-4 contract. ✓  
No plan/entitlement gates quotation eligibility, fairness, or visibility (§4B). ✓  
Quota is a submission volume entitlement (DE-7 read); it is never a matching/selection input. ✓  
The vendor-standing display columns in the comparison statement (Part 5) are sourced from `matching_results` (already governed by the firewall in Part 2/3); BC-4 does not re-read Trust/Marketplace. ✓  
Governance-signal firewall confirmed intact across all 5 Part 4 contracts.

---

### Area 16 — Cross-Module Integrity

**Result: PASS**

| Module | Usage in Part 4 | Assessment |
|---|---|---|
| **DE-1 Identity** | All Command contracts: active-org context, `check_permission`, §6B delegation. ✓ | Correct |
| **DE-2 Marketplace** | None (vendor profile not re-read at quotation stage — already in matching_results). ✓ | Correct |
| **DE-3 Trust** | None (signals already embedded in matching_results). ✓ | Correct |
| **DE-4 Operations** | None in Part 4. ✓ | Correct |
| **DE-5** | N/A | N/A |
| **DE-6 Communication** | Consumer legs: buyer diff notification (revise), buyer alert (withdraw-after-shortlist), re-notification on late extension. All consumer legs, not authored by BC-4. ✓ | Correct |
| **DE-7 Billing** | Read quota at submit precondition; quota consumed via `QuotationSubmitted` consumer (Billing writes ledger). ✓ Single-authorship (PA-19). ✓ Revision: no Billing touch. ✓ | Correct |
| **DE-8 Platform Core** | `core.allocate_human_reference.v1` (QTN-…), audit-write, outbox-write, POLICY read. ✓ | Correct |

---

### Area 17 — DDD Boundary Integrity

**Result: PASS**

BC-4 correctly limits itself to: `draft → submitted`, `submitted → submitted` (revise), `submitted → withdrawn`, `draft → discard` (implicit), and reads via `quotation_visibility`. ✓  
Cross-owned transitions correctly cross-referenced, not authored:
- `submitted → selected` (award_rfq, Part 5/BC-6). ✓
- `submitted → not_selected` (Part 5). ✓
- `submitted → expired` (expire_rfq cascade, Part 1/BC-1 — confirmed in Pass-A §E4 cancel_rfq/expire_rfq cascade). ✓
- `vendors_notified → quotations_received` — see PB4-MA1: this transition is incorrectly omitted from §E7.1 §6 and misattributed in the Conformance Summary. **MAJOR.**

No BC-4 contract leaks into BC-1 (RFQ lifecycle), BC-2 (Matching), BC-3 (Routing), BC-5 (Evaluation), BC-6 (Award), or BC-7 (Governance). ✓

---

### Area 18 — AI-Agent Safety

**Result: PASS WITH FINDINGS (PB4-MA1, PB4-MA2, PB4-M2)**

**§E7.1 AI-Agent Notes:** Quota consumed only at submission (FIXED). Bind to current `rfq_version_id` (never mutable head). One active quotation per vendor (second representative sees replace/revise/withdraw). ✓ Usage-ledger write is Billing's. ✓ Completeness floor vs. quote quality distinction. ✓

**PB4-MA1 AI-agent risk:** The absence of the `vendors_notified → quotations_received` transition from §E7.1 §6 means an AI coding agent implementing `submit_quotation.v1` will not implement this critical RFQ-head promotion. The RFQ will stay in `vendors_notified` indefinitely after the first quotation is submitted, breaking the buyer's evaluation flow.

**§E7.2 AI-Agent Notes:** Never overwrite. Revision consumes no quota. No event to emit. After window close, locked except buyer-authorized cases. ✓

**§E7.3 AI-Agent Notes:** Withdrawal = response (not penalized). Slot frees immediately. ✓

**§E7.4 AI-Agent Notes:** No silent late acceptance; no private windows. Window reopen applies to all un-responded invitees. ✓

**PB4-M2 AI-agent risk:** AI-Agent Notes for §E7.4 do not clarify the two-step call pattern (vendor request vs. buyer approval). An AI agent may send `buyer_decision` on the vendor-request call, or may not know how to route between the two steps.

**§E7.5 AI-Agent Notes:** Vendor isolation absolute. One vendor = one active quotation. ✓

**PB4-MA2 AI-agent risk:** §E7.5 AI-Agent Notes make no mention of `abuse.sealed_until_close`. An AI coding agent implementing buyer quotation reads will expose price terms to the buyer regardless of the sealed-bid POLICY setting.

---

### Area 19 — Corpus Compliance

**Result: PASS WITH FINDINGS**

All contract behaviors are pointer-bound to Doc-3 §8, §4.1.1; Doc-2 §5.5; Doc-4A §11.2, §12, §14. ✓  
POLICY keys referenced in Part 4: `quote.max_revisions` (Doc-3 §12.2 confirmed), `quote.late_extension_max_days` (Doc-3 §12.2 confirmed). ✓  
`[ESC-RFQ-POLICY]` correctly carried for the idempotency dedup window (consistent with Part 3 PB3-M2). ✓  
`abuse.sealed_until_close` (Doc-3 §12.2 confirmed) is NOT referenced — see PB4-MA2. ✗  
No POLICY key invented. ✓  
Quota-window note in header correctly pre-flags the dedup-window gap. ✓

---

### Area 20 — Pass-A Event & Dependency Map Conformance

**Result: PASS**

Pass-A §E10 Event & Dependency Map (confirmed via prior review context):
- `QuotationSubmitted` → comparison refresh (Part 5), Trust performance inputs, Billing usage-ledger. ✓ All consumer legs correctly not authored in Part 4. ✓
- `QuotationWithdrawn` → comparison update, buyer alert (Communication). ✓ Consumer legs not authored. ✓
- `QuotationSelected` → Part 5 (award). ✓ Not in Part 4. ✓
- Revision: no event (verified in Pass-A B.6). ✓

---

## Findings Detail

### PB4-MA1 (MAJOR) — §E7.1 `submit_quotation.v1`: `vendors_notified → quotations_received` transition missing from State Machine section; Conformance Summary misattributes ownership

**Location:** §E7.1 — section **6. State Machine Enforcement**; and Part-4 Conformance Summary footnote.

**Description:** Pass-A §E7 `submit_quotation.v1` explicitly assigns the `vendors_notified → quotations_received` RFQ-head transition to this contract: *"If the RFQ is in `vendors_notified` and this is the first submitted quotation, the RFQ advances `vendors_notified → quotations_received` (Doc-2 §5.4) within the same transaction as the quotation write and `QuotationSubmitted` outbox insert (single-transaction rule, Doc-4A §16 / Doc-2 §10.11.4)."*

Part 4 §E7.1 §6 State Machine Enforcement is silent on this transition. It covers only the quotation-level edge (`draft → submitted`) and the one-active-per-vendor constraint. The transition is mentioned only in the Conformance Summary footnote — as a "Part-1-owned edge" — which is a direct contradiction of Pass-A. Part 1 (BC-1) does not own this transition; Doc-2 §5.4 shows `vendors_notified ──first quotation──▶ quotations_received` is triggered by the first quotation (a BC-4 event), and Pass-A assigns it to `submit_quotation.v1`.

**Corpus reference:** Pass-A §E7 `submit_quotation.v1` State-Machine; Doc-2 §5.4; Doc-4A §16.

**Impact:** An implementer or AI coding agent reading the §E7.1 State Machine section will not implement the `vendors_notified → quotations_received` transition. The RFQ will remain stuck in `vendors_notified` after the first quotation is submitted, breaking the buyer's evaluation workflow. The Conformance Summary footnote does not substitute for a normative State Machine section entry and additionally states wrong ownership.

**Required Fix:** Add to §E7.1 §6 State Machine Enforcement: "When the RFQ is in `vendors_notified` and this is the first submitted quotation, the RFQ advances `vendors_notified → quotations_received` (Doc-2 §5.4) within the same transaction as the quotation write and `QuotationSubmitted` outbox insert — single-transaction rule (Doc-4A §16 / Doc-2 §10.11.4). This RFQ-head transition is **owned by this contract** (Pass-A §E7). Cross-referenced: not in Part 1."  
Correct the Conformance Summary footnote to remove "Part-1-owned" and replace with "owned by `submit_quotation.v1` per Pass-A §E7."

---

### PB4-MA2 (MAJOR) — §E7.5 Quotation Read: Missing `abuse.sealed_until_close` POLICY reference; no sealed-bid visibility control

**Location:** §E7.5 — sections **3. Response Schema**, **4. Validation Matrix**, **9. POLICY stage**, **12. AI-Agent Implementation Notes**.

**Description:** Doc-3 §12.2 includes `abuse.sealed_until_close` in the confirmed POLICY key inventory ("Abuse/Econ" group). This key governs whether buyers can view price breakdowns before the quotation window closes — a sealed-bid control. Doc-3 §10.1 (competitive intel abuse scenario) and the POLICY key confirm that the platform supports a sealed-submission mode to prevent buyer price-discovery before window close.

Part 4 §E7.5 quotation-read contract makes no reference to `abuse.sealed_until_close` anywhere — not in the response schema, not in the validation matrix (which has no stage 9 POLICY row), and not in the AI-Agent Notes. The response schema describes "version terms per scope" without distinguishing pre-close vs. post-close buyer visibility. An AI agent implementing buyer quotation reads will return full price terms to the buyer regardless of the sealed-bid POLICY setting.

**Corpus reference:** Doc-3 §12.2 POLICY key `abuse.sealed_until_close`; Doc-3 §10.1.

**Impact:** In sealed mode, a buyer reading quotation price terms before window close gains pricing intelligence that corrupts the sealed procurement process — vendors' prices are exposed before they are finalized. This is a material procurement fairness and integrity breach. The omission is particularly concerning because the quotation-read contract is the only surface through which this POLICY must be enforced; there is no other enforcement point.

**Required Fix:** Add to §E7.5:
- Stage 9 POLICY row in the validation matrix: `abuse.sealed_until_close` POLICY key — if `true`, buyer reads of price breakdown terms are restricted until the quotation window closes; full terms returned only at/after window close or after `buyer_reviewing` begins.
- Response Schema note: "version terms per scope" expands to: buyer-read of `price_breakdown` and `delivery_terms` is restricted by `abuse.sealed_until_close` (POLICY) pre-window-close; post-close: full terms visible.
- AI-Agent Notes: "Respect `abuse.sealed_until_close` (Doc-3 §12.2): if true, restrict buyer reads of price breakdown fields before the quotation window closes. Post-close (or after `buyer_reviewing` begins), full terms are visible."
- Add `[ESC-RFQ-POLICY]` carry marker to §E7.5 if `abuse.sealed_until_close` is not explicitly in the confirmed POLICY key inventory for this contract (it is in Doc-3 §12.2 so it can be named directly).

---

### PB4-M1 (MINOR) — §E7.1 `submit_quotation.v1`: Missing REFERENCE stage row for `invitation_id`

**Location:** §E7.1 — section **4. Validation Matrix**.

**Description:** `invitation_id` is in the request schema and is the foundational access precondition for quotation submission (Doc-3 §8.1: "delivered invitation"). The validation matrix has no explicit stage 7 REFERENCE row verifying `invitation_id → rfq_invitations` exists. The SCOPE check (stage 4) checks for a `rfq_invitation_grantees` row (which implies the invitation exists) and the STATE check (stage 6) checks for a `delivered` grantee row, both of which implicitly cover invitation existence. However, Doc-4A §9.5 requires an explicit REFERENCE stage check for entity existence. This is the same structural gap as PB3-M1, now appearing at §E7.1.

**Corpus reference:** Doc-4A §9.5; Doc-3 §8.1.

**Required Fix:** Add a stage 7 REFERENCE row: `invitation_id` → `rfq_invitations` exists → `NOT_FOUND` (§7.5 collapse). May be annotated: "grantee-row SCOPE check (stage 4) implies invitation existence; REFERENCE row makes this explicit per Doc-4A §9.5."

---

### PB4-M2 (MINOR) — §E7.4 `request_late_extension.v1`: Two-actor flow not separated in validation matrix or AI-Agent Notes

**Location:** §E7.4 — sections **4. Validation Matrix**, **12. AI-Agent Implementation Notes**.

**Description:** This contract handles two distinct call sites: (a) the vendor-request call (sends `rfq_id + invitation_id`, no `buyer_decision`); (b) the buyer-approval call (sends `rfq_id + buyer_decision`, approves/denies). The validation matrix merges both actors at stage 3 AUTHZ in a single row ("vendor `can_respond_to_rfq` to request; buyer `can_create_rfq` to approve") without separating which fields and stages apply to each call site. The `buyer_decision` field is nullable — its conditionality is defined in the request schema but not operationalized in the validation matrix. The AI-Agent Notes address the fairness invariants (no silent acceptance, no private windows) but do not explain the two-step flow.

**Corpus reference:** Doc-3 §8.5; Doc-4A §11.2.

**Required Fix:** Either (a) split the contract into two phases within the validation matrix, with a clear table section for "Phase 1 — Vendor Request" and "Phase 2 — Buyer Approval," or (b) add an AI-Agent Notes entry: "This contract has two call sites. Call 1 (vendor): provide `rfq_id` + `invitation_id`; no `buyer_decision`. Validated at stages 1–6 (vendor CONTEXT/AUTHZ/SCOPE). Call 2 (buyer): provide `rfq_id` + `buyer_decision`; buyer AUTHZ at stage 3. The platform routes between the two phases by actor context; stage 3 AUTHZ fails if the wrong actor submits the wrong fields."

---

### PB4-N1 (NITPICK) — §E7.1 `submit_quotation.v1`: `validity_period` not named as a distinct field

**Location:** §E7.1 — section **2. Request Schema**.

**Description:** Doc-3 §8.1 completeness floor includes "price, validity period, delivery terms; spec-compliance declaration per attached spec revision." `validity_period` is not a named field in the request schema — it is presumably embedded in `delivery_terms` (jsonb). The document does not note this embedding explicitly.

**Recommendation:** Add a note to the `delivery_terms` row: "includes validity period (Doc-3 §8.1 completeness floor — embedded in terms jsonb per doc-doc schema)."

---

### PB4-N2 (NITPICK) — §E7.2 `revise_quotation.v1`: Stage 9 POLICY check yields `BUSINESS` error class

**Location:** §E7.2 — section **4. Validation Matrix**, **9. Error Register**.

**Description:** The revision soft-cap check is placed at stage 9 POLICY, but the failure yields `BUSINESS` (not `QUOTA` or a POLICY-class error). The justification is that the soft-cap is not an absolute limit — it requires clarification-thread justification to proceed, making the failure a BUSINESS-precondition failure. This is defensible per H.4, but the unconventional combination (stage 9 with BUSINESS outcome) may confuse implementers who expect stage 9 to yield `QUOTA` or a POLICY error.

**Recommendation:** Add a brief explanatory note in the validation matrix: "Soft-cap (stage 9 POLICY): yields `BUSINESS` because the cap is not absolute — justification (clarification-thread) allows override; the failure is a missing BUSINESS precondition, not a hard quota."

---

## Summary Table

| ID | Severity | Location | Description | Status |
|---|---|---|---|---|
| **PB4-MA1** | **MAJOR** | §E7.1 §6 State Machine + Conformance Summary | `vendors_notified → quotations_received` RFQ-head transition absent from State Machine section; Conformance Summary misattributes ownership as "Part-1-owned" — Pass-A assigns it to `submit_quotation.v1` | **REQUIRES PATCH** |
| **PB4-MA2** | **MAJOR** | §E7.5 Response Schema, Validation Matrix, AI-Agent Notes | `abuse.sealed_until_close` POLICY key (Doc-3 §12.2) not referenced; no sealed-bid visibility control; buyer reads may expose price breakdowns pre-close | **REQUIRES PATCH** |
| **PB4-M1** | **MINOR** | §E7.1 Validation Matrix | Missing stage 7 REFERENCE row for `invitation_id → rfq_invitations`; entity existence check absorbed into SCOPE (same pattern as PB3-M1) | **REQUIRES PATCH** |
| **PB4-M2** | **MINOR** | §E7.4 Validation Matrix + AI-Agent Notes | Two-actor flow (vendor request → buyer approval) not separated; single-contract dual-actor call sites create implementation ambiguity | **REQUIRES PATCH** |
| **PB4-N1** | **NITPICK** | §E7.1 Request Schema | `validity_period` (Doc-3 §8.1 completeness floor) not named as a field; presumably embedded in `delivery_terms` jsonb — not noted | Discretionary |
| **PB4-N2** | **NITPICK** | §E7.2 Validation Matrix | Stage 9 POLICY check yields `BUSINESS` error class — unconventional but defensible; lacks explanatory note | Discretionary |

**Counts:** 0 BLOCKERs · 2 MAJORs · 2 MINORs · 2 NITPICKs

---

## Quotation Governance Analysis

BC-4's quotation governance architecture is structurally sound: three-instrument quota identity enforced (no double-consumption), version immutability preserved (append-only with supersedes chain), one-active-per-vendor enforced at the index level, and the forbidden revision/withdrawal behaviors are comprehensively stated. The weak point is the `vendors_notified → quotations_received` transition ownership gap (PB4-MA1) — a pass-through transition that is easy to miss in a focused quotation contract but critical to the RFQ lifecycle. The rest of the governance mechanism (soft-caps, pre-award-only withdrawal, no private windows) is correctly implemented.

---

## Confidentiality Analysis

Vendor isolation is robust: `controlling_organization_id` anchor, NOT_FOUND collapse for no-access, explicit AI-agent prohibition on cross-vendor exposure. The `quotation_visibility` grant table correctly mediates buyer access. The critical gap is sealed-bid confidentiality (PB4-MA2): the `abuse.sealed_until_close` POLICY key exists in the confirmed corpus but is not honored in the quotation-read contract. In sealed mode, early buyer visibility of price terms is a confidentiality breach at the procurement-process level — it undermines the integrity of the sealed-bid mechanism and gives the buyer unfair leverage over vendors.

---

## Procurement Fairness Analysis

The procurement fairness controls are comprehensive for the in-scope behavior: no per-vendor private windows (FIXED), revision soft-cap prevents price-signaling games (Doc-3 §10.7), withdrawal counts as response (not penalized), quota is a volume gate not a ranking input. The sealed-bid gap (PB4-MA2) is the one fairness risk: if `abuse.sealed_until_close` is active and the quotation-read contract is implemented without honoring it, the buyer gains pre-close pricing intelligence that corrupts the sealed procurement process.

---

## Procurement Moat Analysis

BC-4 ownership is correctly bounded to quotation lifecycle (submit/revise/withdraw), visibility (reads), and window management (late extension). Marketplace acquires no quotation authority. Comparison statement refresh is correctly a Part 5 consumer leg of `QuotationSubmitted`. The three-instrument quota identity (PATCH-D3-01) is correctly implemented: quota read at precondition, consumed at submission (Billing's write), never at delivery, never the entitlement. Moat intact.

---

## Drift Analysis

| Dimension | Result | Evidence |
|---|---|---|
| **Ownership Drift** | NONE | Quotation aggregate owned by BC-4. Cross-owned transitions correctly cross-referenced. PB4-MA1 is a documentation gap, not an ownership claim. |
| **Lifecycle Drift** | ANOMALY (PB4-MA1) | `vendors_notified → quotations_received` absent from §E7.1 State Machine section; misattributed in Conformance Summary. Transition ownership is correct in Pass-A; Part 4 fails to reflect it. |
| **Authorization Drift** | NONE | No slug invented. All slugs confirmed in Doc-2 §7. No unauthorized delegation path. |
| **Event Drift** | NONE | `QuotationSubmitted` and `QuotationWithdrawn` are confirmed Doc-2 §8 events. `QuotationSelected` not authored in Part 4. Revision non-event confirmed. |
| **Audit Drift** | NONE | All audit actions from Doc-2 §9 Quotation domain. No audit action invented. |
| **POLICY Drift** | GAP (PB4-MA2) | `abuse.sealed_until_close` (Doc-3 §12.2) not referenced in §E7.5. No unauthorized POLICY key invented, but a required POLICY key is absent. |
| **Moat Drift** | NONE | Quotation ownership, visibility, governance all RFQ-owned. Marketplace no authority. |
| **Firewall Drift** | NONE | No governance signal mutated. No plan gates eligibility. Quota is volume-only gate. |
| **DDD Boundary Drift** | NONE | No BC-4 contract leaks into other bounded contexts. |
| **Confidentiality Drift** | GAP (PB4-MA2) | Sealed-bid POLICY key not enforced in quotation reads. |

---

## AI-Agent Safety Assessment

**High-risk gaps:**

1. **PB4-MA1:** An AI coding agent implementing `submit_quotation.v1` from the State Machine section alone will not promote the RFQ from `vendors_notified` to `quotations_received` on the first quotation. This will cause the buyer's workflow to stall and no buyer evaluation to begin.

2. **PB4-MA2:** An AI coding agent implementing §E7.5 buyer reads will return full price terms regardless of the sealed-bid POLICY setting, exposing vendors' pricing to buyers pre-close in sealed mode.

3. **PB4-M2:** An AI coding agent implementing §E7.4 may conflate the vendor-request step and the buyer-approval step, either sending `buyer_decision` on the vendor's call or failing to distinguish the two actors.

**Well-handled:**
- Quota-consumption timing is unambiguous (submission only; not delivery; not entitlement). ✓
- No-overwrite rule is multiply stated. ✓
- No event on revision is explicitly stated and reinforced. ✓
- Vendor isolation is explicitly stated and strongly bounded. ✓
- No private windows on late extension is FIXED and stated in three locations. ✓
- Withdrawal = response (not penalized) is clearly stated. ✓

---

## Final Decision

**APPROVE WITH PATCH**

Part 4 has two MAJORs that must be patched before freeze. Both are targeted documentation-level gaps that do not require redesign: PB4-MA1 requires adding the `vendors_notified → quotations_received` transition to §E7.1 State Machine (owned by `submit_quotation.v1` per Pass-A) and correcting the Conformance Summary; PB4-MA2 requires adding `abuse.sealed_until_close` POLICY handling to §E7.5. The two MINORs (REFERENCE stage row for `invitation_id` in §E7.1; two-step flow clarification in §E7.4) are targeted additions. The two NITPICKs are discretionary.

---

## Approval Question

**Can Doc-4E_PassB_Part4_v1.0 proceed toward Patch / Freeze workflow?**

**YES — conditional on patch of PB4-MA1, PB4-MA2, PB4-M1, and PB4-M2.**

**Justification:** All four patch items are targeted, non-architectural fixes to specific sections of two contracts (§E7.1 and §E7.5 for the MAJORs; §E7.1 and §E7.4 for the MINORs). No redesign, no Pass-A reopening, no FIXED invariant change required. The quotation governance, vendor isolation, quota identity, event model, and moat are all sound. On closure of the four accepted findings (PB4-MA1, PB4-MA2, PB4-M1, PB4-M2), with PB4-N1 and PB4-N2 at Board discretion, Part 4 is ready for Patch Verification and Freeze Audit.

---

*End of Doc-4E_PassB_Part4_Independent_Hard_Review_v1.0 — Decision: APPROVE WITH PATCH — 0 BLOCKERs · 2 MAJORs (PB4-MA1: `vendors_notified → quotations_received` transition absent from §E7.1 State Machine, misattributed in Conformance Summary; PB4-MA2: `abuse.sealed_until_close` POLICY not referenced in §E7.5, sealed-bid visibility gap) · 2 MINORs (PB4-M1: §E7.1 missing REFERENCE stage for `invitation_id`; PB4-M2: §E7.4 two-actor flow not separated) · 2 NITPICKs (PB4-N1: validity_period not named; PB4-N2: stage 9 POLICY → BUSINESS outcome unexplained). Scope: BC-4 Quotation Management (§E7, 5 contracts). Next: Doc-4E_PassB_Part4_Patch_v1.0.*
