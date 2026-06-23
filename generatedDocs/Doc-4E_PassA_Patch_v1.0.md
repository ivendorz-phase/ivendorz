# Doc-4E_PassA_Patch_v1.0.md

## Status

**Approved Pass-A Patch** — applies the Architecture-Board-adjudicated findings of `Doc-4E_PassA_Independent_Hard_Review_v1.0` to `Doc-4E_Content_v1.0_PassA.md`.

| Field | Value |
|---|---|
| Applies to | `Doc-4E_Content_v1.0_PassA.md` |
| Produces | `Doc-4E_Content_v1.0_PassA.md` as amended by this patch (canonical input to Pass-A Patch Verification → Pass-A APPROVED/CLOSED) |
| Review source | `Doc-4E_PassA_Independent_Hard_Review_v1.0` |
| Board adjudication | **Accepted:** PA-01, PA-04, PA-07, PA-08, PA-10, PA-12, PA-14, PA-19. **Optional (apply if trivial):** PA-02, PA-06, PA-15, PA-17, PA-18. **Verify-first:** PA-05, PA-09, PA-11, PA-13, PA-16. |
| Scope | Additive clarifications, one new appendix (Appendix E), two corpus-authorized state-machine notes (PA-07 transition; PA-16 dual trigger), and field relocations. **No rewrite, no architecture redesign, no unaffected-contract edits.** |
| Conforms To | Architecture FINAL, ADRs v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, `Doc-4E_Structure_v1.0_FROZEN` — all FROZEN |
| Application model | Additive amendment document (Board-applied). Each change quotes the exact **Before** text present verbatim in the base Pass-A and gives the **After**. Verify-first items record the corpus check and the resulting action (which may be "retain wording — no invention"). |

All frozen ownership boundaries, DDD boundaries, lifecycle/state machines, event catalog, audit catalog, authorization model, and the procurement moat are preserved. This patch invents nothing and resolves no carried dependency (DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]` carried unchanged).

---

# 1. Patch Summary

| Finding | Class | Location | Disposition |
|---|---|---|---|
| **PA-01** | Accepted | Appendices | **APPLIED** — added **Appendix E — Doc-3 Operational-Rule Binding Index** (pointer table only; no rule restated/derived). |
| **PA-04** | Accepted | `rfq.generate_comparison_statement.v1` | **APPLIED** — declared `matching_results` as the authoritative vendor-standing display source (firewall-preserving); added AI-agent note. |
| **PA-07** | Accepted | `rfq.submit_quotation.v1` | **APPLIED** — added `vendors_notified → quotations_received` on first submitted quotation, same transaction (Doc-2 §5.4). |
| **PA-08** | Accepted | `rfq.expire_rfq.v1`, `rfq.cancel_rfq.v1` | **APPLIED** — added quotation-expiry cascade note (`submitted → expired`, Doc-2 §5.5); no new event/audit action. |
| **PA-10** | Accepted | `rfq.close_lost_rfq.v1` | **APPLIED** — replaced generic authority wording with explicit Doc-2 §7 slugs (`can_approve_vendor_selection` / `can_award_rfq`). |
| **PA-12** | Accepted | `rfq.submit_rfq.v1` | **APPLIED** — clarified self-approval emits `RFQSubmitted` + `RFQApproved`, same transaction (existing Doc-2 §8 events). |
| **PA-14** | Accepted | §E9 DE-7 Billing | **APPLIED** — added note: `QuotationSubmitted` consumed by Billing usage-ledger processing; Billing consumer-owner, RFQ emitter only. |
| **PA-19** | Accepted | `rfq.submit_quotation.v1` | **APPLIED** — moved quota-ledger behavior from Audit → Cross-Module (DE-7); Audit now Doc-2 §9 actions only. |
| **PA-02** | Optional | invitation expiry | **APPLIED (trivial)** — clarified invitation expiry is absorbed into `rfq.expire_rfq.v1` / `drain_deferred_queue.v1`; no new contract. |
| **PA-06** | Optional | `award_rfq`, `close_lost_rfq` | **APPLIED (trivial)** — clarified RFQ + quotation transitions occur in one DB transaction (modular monolith, single `rfq` schema). |
| **PA-15** | Optional | `rfq.expire_rfq.v1` | **APPLIED (trivial)** — documented the two expiry triggers (validity lapse / coverage exhausted) and dispatch; no contract split. |
| **PA-17** | Optional | `rfq.reissue_rfq.v1` | **APPLIED (trivial)** — clarified re-issue creates a new RFQ and never reopens the source. |
| **PA-18** | Optional | `rfq.regenerate_matching_results.v1` | **APPLIED (trivial)** — clarified re-ranking only, not Phase-A eligibility re-evaluation. |
| **PA-05** | Verify-first | moderation event | **VERIFIED → RETAIN.** No RFQ-moderation event in Doc-2 §8; already bound state+audit only. No change; no invention. |
| **PA-09** | Verify-first | `buyer_directed` invitation | **VERIFIED → CLARIFY.** Bound to `VendorInvited` (delivered) with accounting exclusions; flag audit carried under `[ESC-RFQ-AUDIT]`. No invention. |
| **PA-11** | Verify-first | quota/usage-ledger event | **VERIFIED → CLARIFY (= PA-14).** Billing consumes `QuotationSubmitted`; no separate event. No invention. |
| **PA-13** | Verify-first | `InvitationExpired` | **VERIFIED → RETAIN.** Exists as Doc-2 §9 audit action, not a §8 event; already bound correctly. No invention. |
| **PA-16** | Verify-first | comparison → `buyer_reviewing` | **VERIFIED → APPLY.** Doc-3 §1.2 authorizes dual trigger (first open **or** auto at window close). Added the window-close auto-advance. |

All accepted findings applied; all five optional items applied as trivial; all five verify-first items resolved by corpus check (three clarify/apply, two retain). No finding deferred; nothing invented.

---

# 2. Corpus Verification Results

Mandatory per the request: **PA-05, PA-09, PA-11, PA-13, PA-16 verified against the frozen corpus before any action.**

### PA-05 — RFQ moderation pass/clear event?

| Item | Result |
|---|---|
| **Source checked** | Doc-2 §8 (`rfq` emitting rows). |
| **Result** | **No moderation event exists.** The `rfqs` row is `RFQCreated, RFQSubmitted, RFQApproved, RFQClosedWon, RFQClosedLost`; moderation is a §5.4 transition (`submitted → under_review → matching`) + a §9 audit action ("moderation pass/fail"). |
| **Action taken** | **Retain current wording** (`rfq.moderate_rfq.v1` already binds state + audit only, B.6). No event invented. |

### PA-09 — `buyer_directed` invitation distinct event/audit action?

| Item | Result |
|---|---|
| **Source checked** | `Doc-3_Patch_v1.0.2` PATCH-D3-02 (Conversion-to-quotable rule); Doc-2 §8 (`VendorInvited` rule); Doc-2 §9. |
| **Result** | PATCH-D3-02 creates a **delivered** invitation flagged `buyer_directed`; therefore **`VendorInvited` fires** (Doc-2 §8 — "only at `delivered`"), but the record is **excluded** from valid-lead (11.6), guarantee (11.7), exposure-fairness (3.3), and wave/replenishment (5.2–5.3) accounting. No distinct event and no separately-enumerated §9 audit action exist for the flag. |
| **Action taken** | **Clarify** in `rfq.assemble_and_route_wave.v1`: `buyer_directed` delivery emits `VendorInvited` with the accounting exclusions; the flag's audit is carried under **`[ESC-RFQ-AUDIT]`** (nearest §9 invitation action by pointer). No event/audit action invented. |

### PA-11 — Quota / usage-ledger consumption event?

| Item | Result |
|---|---|
| **Source checked** | Doc-2 §8 (Primary consumers); §10.8 (`billing.usage_ledger`). |
| **Result** | `billing.usage_ledger` is written by **Billing consuming `QuotationSubmitted`** ("`QuotationSubmitted` → … usage ledger"; `usage_ledger.source = rfq_response`). No dedicated quota/usage event exists; the consumption is Billing-owned. |
| **Action taken** | **Clarify** (this is the PA-14 fix): §E9 DE-7 records `QuotationSubmitted` → Billing usage-ledger processing; Billing is consumer-owner, RFQ is emitter only (single-authorship). No event invented. |

### PA-13 — `InvitationExpired` event and/or audit action?

| Item | Result |
|---|---|
| **Source checked** | Doc-2 §9 (RFQ audit domain); §8 (`rfq` rows). |
| **Result** | `InvitationExpired` **exists as a Doc-2 §9 audit action** (invitation transitions: `InvitationDelivered`/`InvitationAccepted`/`InvitationDeclined`/`InvitationExpired`); it is **not** a §8 event. |
| **Action taken** | **Retain** — `rfq.drain_deferred_queue.v1` already binds `InvitationExpired` as a §9 audit action; PA-08's cascade note binds quotation expiry to §5.5 + audit, no event. No invention. |

### PA-16 — `quotations_received → buyer_reviewing` trigger(s)?

| Item | Result |
|---|---|
| **Source checked** | Doc-2 §5.4 (`quotations_received ──buyer opens comparison──▶ buyer_reviewing`); Doc-3 §1.2 (Transition row). |
| **Result** | Doc-3 §1.2 explicitly authorizes **both** triggers: "`buyer_reviewing` begins when the buyer **first opens the comparison statement, or automatically at window close — whichever first**." The Pass-A `get_comparison_statement` recorded only the first-open trigger. |
| **Action taken** | **Apply** — add the **window-close auto-advance** (system actor) as the second authorized trigger in `rfq.get_comparison_statement.v1` (and note it on `generate_comparison_statement` context). Corpus-authorized; no invention. |

---

# 3. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4E_Content_v1.0_PassA.md` and gives the **After**. Anchors verified verbatim against the base.

### PATCH-4E-PA-01 — PA-01 — Add Appendix E (Doc-3 Operational-Rule Binding Index)

**Location:** Appendices — insert a new **Appendix E** immediately after **Appendix D — Cross-Reference Index (Pass-A)** (before the document footer).

**Before** (the footer immediately follows Appendix D):

```
| Consumed services | Doc-4B (audit/outbox/UUIDv7/human-ref/POLICY/flags), Doc-4C (`check_permission`/delegation), Doc-4D (`vendor_matching_attributes`) |

---

*End of Doc-4E — RFQ Procurement Engine — Content v1.0, Pass-A (contract structure).
```

**After:**

```
| Consumed services | Doc-4B (audit/outbox/UUIDv7/human-ref/POLICY/flags), Doc-4C (`check_permission`/delegation), Doc-4D (`vendor_matching_attributes`) |

---

## Appendix E — Doc-3 Operational-Rule Binding Index (Pass-A)

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

*End of Doc-4E — RFQ Procurement Engine — Content v1.0, Pass-A (contract structure).
```

---

### PATCH-4E-PA-04 — PA-04 — Comparison vendor-standing authoritative source

**Location:** `rfq.generate_comparison_statement.v1` — Cross-Module line.

**Before:**

```
- **Cross-Module:** vendor-standing columns (trust band, performance badge, verification depth, tier) read from Trust/Marketplace by service (DE-2/DE-3, read-only, buyer-scoped display).
```

**After:**

```
- **Cross-Module:** vendor-standing display columns (trust band, performance badge, verification depth, tier) are sourced from the RFQ's **`matching_results`** rows (the confidence breakdown already computed at pipeline run, §E5) — **the authoritative display source** — never via an uncontrolled live read of Trust/Marketplace at comparison time. This preserves the governance-signal firewall (the signal a buyer sees equals the signal the pipeline scored) and avoids a second read path (DE-2/DE-3 were consumed once, at pipeline run; §4B).
- **AI-Agent Notes (PA-04):** bind vendor-standing columns to `matching_results` (§E5), **not** to a live Trust/Marketplace service call inside the comparison contract — one controlled read path, firewall-preserving (Doc-4A §4B); the comparison statement displays signals, never recomputes or mutates them.
```

---

### PATCH-4E-PA-07 — PA-07 — First-quotation lifecycle transition

**Location:** `rfq.submit_quotation.v1` — State-Machine line.

**Before:**

```
- **State-Machine:** `quotations` `draft → submitted` (Doc-2 §5.5); invitation `→ accepted` (Doc-3 §8.1); one-active-per-vendor-per-RFQ enforced (Doc-2 §10.4 partial unique index).
```

**After:**

```
- **State-Machine:** `quotations` `draft → submitted` (Doc-2 §5.5); invitation `→ accepted` (Doc-3 §8.1); one-active-per-vendor-per-RFQ enforced (Doc-2 §10.4 partial unique index). **If the RFQ is in `vendors_notified` and this is the first submitted quotation, the RFQ advances `vendors_notified → quotations_received` (Doc-2 §5.4) within the same transaction** as the quotation write and `QuotationSubmitted` outbox insert (single-transaction rule, Doc-4A §16 / Doc-2 §10.11.4).
```

---

### PATCH-4E-PA-08 — PA-08 — Quotation-expiry cascade (expire + cancel)

**Location 1:** `rfq.expire_rfq.v1` — Events line.

**Before:**

```
- **Events:** none defined in Doc-2 §8 for expiry (state + audit only — B.6); buyer notification is Communication's (DE-6); open invitations/quotations → `expired` with no vendor performance penalty (Doc-3 §1.2 expired FIXED).
```

**After:**

```
- **Events:** none defined in Doc-2 §8 for expiry (state + audit only — B.6); buyer notification is Communication's (DE-6).
- **State-Machine (cascade, PA-08):** on RFQ terminal expiry, open `submitted` quotations cascade `submitted → expired` (Doc-2 §5.5) and open invitations → `expired` (Doc-2 §3.4) within the same terminal-transition path — **no vendor performance penalty** (the buyer went silent, not the vendor — Doc-3 §1.2 expired FIXED). Cascade is state + audit only (invitation `InvitationExpired`, Doc-2 §9); **no new event, no new audit action.**
```

**Location 2:** `rfq.cancel_rfq.v1` — Events line.

**Before:**

```
- **Events:** **none** — RFQ cancellation has no Doc-2 §8 domain event (B.6 non-event); responded vendors' closure notification is Communication's (DE-6), triggered off the state change.
```

**After:**

```
- **Events:** **none** — RFQ cancellation has no Doc-2 §8 domain event (B.6 non-event); responded vendors' closure notification is Communication's (DE-6), triggered off the state change.
- **State-Machine (cascade, PA-08):** on cancellation, open `submitted` quotations cascade `submitted → expired` (Doc-2 §5.5) and open invitations → `expired` (Doc-2 §3.4) within the same terminal-transition path; cascade is state + audit only (Doc-2 §9 invitation `InvitationExpired`); **no new event, no new audit action.**
```

---

### PATCH-4E-PA-10 — PA-10 — close_lost authorization slug specificity

**Location:** `rfq.close_lost_rfq.v1` — Authorization line.

**Before:**

```
- **Authorization:** §6; buyer authority (Doc-2 §7).
```

**After:**

```
- **Authorization:** §6 three-layer; **`can_approve_vendor_selection`** (close-without-award from `shortlisted`) — or **`can_award_rfq`** where the org binds closure to award authority (Doc-2 §7; both are existing buyer-side slugs); scope = buyer controlling org. No slug invented.
```

---

### PATCH-4E-PA-12 — PA-12 — Self-approval event behavior

**Location:** `rfq.submit_rfq.v1` — Events line.

**Before:**

```
- **Events:** `RFQSubmitted` (Doc-2 §8) on transition to `submitted` (drives moderation/matching).
```

**After:**

```
- **Events:** `RFQSubmitted` (Doc-2 §8) on transition to `submitted` (drives moderation/matching). **Self-approval path (a submitter holding `can_approve_rfq`):** emits **`RFQSubmitted` + `RFQApproved`** (both existing Doc-2 §8 events) within the **same transaction** (creator and approver recorded as one actor, Doc-3 §1.2); no event invented.
```

---

### PATCH-4E-PA-14 — PA-14 — Billing usage-ledger consumes QuotationSubmitted (§E9 DE-7)

**Location:** §E9 Integration Surface — the Billing (DE-7) table row.

**Before:**

```
| **Billing (Doc-4I)** | DE-7 | consume (read) | read quotation-submission quota (delivery ceiling + at submission), guarantee/credit entitlement | Billing owns quota/entitlement/credits (firewall: payment never influences matching) |
```

**After:**

```
| **Billing (Doc-4I)** | DE-7 | consume (read) + emit | read quotation-submission quota (delivery ceiling + at submission), guarantee/credit entitlement; **emit `QuotationSubmitted`** | Billing owns quota/entitlement/credits; **Billing consumes `QuotationSubmitted` into usage-ledger processing** (`usage_ledger.source = rfq_response`, Doc-2 §8 primary consumers / §10.8) — Billing is consumer-owner, RFQ is emitter only (single-authorship); firewall: payment never influences matching |
```

---

### PATCH-4E-PA-19 — PA-19 — Move quota-ledger from Audit to Cross-Module (DE-7)

**Location:** `rfq.submit_quotation.v1` — Audit line and Cross-Module line.

**Before (Audit line):**

```
- **Audit:** yes → Doc-2 §9 Quotation "submit"; quotation-submission quota ledger entry on the controlling org (Doc-3 §4.1.1).
```

**After (Audit line):**

```
- **Audit:** yes → Doc-2 §9 Quotation "submit" (via Doc-4B). *(Audit section is Doc-2 §9 audit actions only; quota-ledger behavior relocated to Cross-Module — PA-19.)*
```

**Before (Cross-Module line):**

```
- **Cross-Module:** **reads + consumes** Billing quotation-submission quota at submission (DE-7; three-instrument identity — no other instrument decremented); usage-ledger consumption is Billing's consumer of `QuotationSubmitted`; delegation grant consumed from Identity (DE-1). **Firewall:** quota is a submission gate, never a matching input; payment never affects matching (§4B).
```

**After (Cross-Module line):**

```
- **Cross-Module:** **reads + consumes** Billing quotation-submission quota at submission (DE-7; three-instrument identity — no other instrument decremented). **The quotation-submission quota ledger entry on the controlling org (Doc-3 §4.1.1) is a Billing-owned write driven by Billing's consumption of `QuotationSubmitted`** — RFQ emits the event; Billing records the ledger entry (`usage_ledger.source = rfq_response`, Doc-2 §10.8); single-authorship preserved. Delegation grant consumed from Identity (DE-1). **Firewall:** quota is a submission gate, never a matching input; payment never affects matching (§4B).
```

---

### PATCH-4E-PA-02 — PA-02 (optional) — Invitation-expiry responsibility

**Location:** `rfq.expire_rfq.v1` — AI-Agent Notes line.

**Before:**

```
- **AI-Agent Notes:** bound exactly to the two Doc-2 §5.4 system-actor edges; **no fake matching activity** ever shown (Doc-3 §1.2 FIXED). Idempotent (re-fire safe).
```

**After:**

```
- **AI-Agent Notes:** bound exactly to the two Doc-2 §5.4 system-actor edges; **no fake matching activity** ever shown (Doc-3 §1.2 FIXED). Idempotent (re-fire safe). **(PA-02)** Invitation expiry is **absorbed here** (RFQ-terminal cascade → invitations `expired`) and in `rfq.drain_deferred_queue.v1` (runway-starved deferred → `InvitationExpired`) — **no separate invitation-expiry contract** is created; `rfq_invitations` `→ expired` (Doc-2 §3.4) is a state+audit effect of these two contracts.
```

---

### PATCH-4E-PA-06 — PA-06 (optional) — Single-transaction note (award / close_lost)

**Location:** `rfq.award_rfq.v1` — AI-Agent Notes line.

**Before:**

```
- **AI-Agent Notes:** single award only (Doc-2 §5.4 cardinality FIXED) — split needs are a re-issue (§E4 `reissue_rfq`), never multi-award; the engagement is Operations' (DE-4), created off the event, never authored here.
```

**After:**

```
- **AI-Agent Notes:** single award only (Doc-2 §5.4 cardinality FIXED) — split needs are a re-issue (§E4 `reissue_rfq`), never multi-award; the engagement is Operations' (DE-4), created off the event, never authored here. **(PA-06)** The RFQ transition (`shortlisted → closed_won`) and the quotation transitions (selected `→ selected`, others `→ not_selected`) plus the `RFQClosedWon`/`QuotationSelected` outbox inserts occur in **one database transaction** — both aggregates live in the single `rfq` schema (modular monolith), so the multi-aggregate write is atomic (Doc-2 §10.11.4). The same single-transaction rule applies to `rfq.close_lost_rfq.v1` (`shortlisted → closed_lost` + open quotations `→ not_selected`).
```

---

### PATCH-4E-PA-15 — PA-15 (optional) — Two expiry triggers + dispatch

**Location:** `rfq.expire_rfq.v1` — Purpose line.

**Before:**

```
- **Purpose:** System-actor expiry on the validity clock lapse, or on the coverage-exhausted hold-bound in `matching` (Doc-3 §1.4; §1.2 + PATCH-D3-05; Doc-2 §5.4 PATCH-D2-02).
```

**After:**

```
- **Purpose:** System-actor expiry with **two dispatch triggers within this one contract (no split — PA-15):** (1) **validity-clock lapse** from `vendors_notified`/`quotations_received`/`buyer_reviewing` (Doc-3 §1.4; Doc-2 §5.4 multi-source `→ expired`); (2) **coverage-exhausted** hold-bound in `matching` (reason `no_eligible_vendors_found`; Doc-3 §1.2 + `Doc-3_Patch_v1.0.2` PATCH-D3-05; Doc-2 §5.4 PATCH-D2-02). The contract dispatches on which precondition fired; both are system-actor, both terminal.
```

---

### PATCH-4E-PA-17 — PA-17 (optional) — Re-issue never reopens source

**Location:** `rfq.reissue_rfq.v1` — AI-Agent Notes line.

**Before:**

```
- **AI-Agent Notes:** re-issue is the **only** reopening mechanism (Doc-3 §1.6 FIXED); never transition a terminal RFQ back.
```

**After:**

```
- **AI-Agent Notes:** re-issue is the **only** reopening mechanism (Doc-3 §1.6 FIXED); never transition a terminal RFQ back. **(PA-17)** Re-issue **creates a new RFQ** (new identity, new version chain, fresh routing) and records `reissued_from`; it **never reopens or mutates the source RFQ** — the source remains in its terminal state (the state history is evidence, Doc-3 §1.6).
```

---

### PATCH-4E-PA-18 — PA-18 (optional) — Re-ranking, not re-eligibility

**Location:** `rfq.regenerate_matching_results.v1` — AI-Agent Notes line.

**Before:**

```
- **AI-Agent Notes:** idempotent consumer (Doc-4A §16); absence-of-history never scored as zero (Doc-3 §6.4 FIXED); never re-open gates a signal change doesn't affect.
```

**After:**

```
- **AI-Agent Notes:** idempotent consumer (Doc-4A §16); absence-of-history never scored as zero (Doc-3 §6.4 FIXED). **(PA-18)** This contract is **re-ranking only** (re-score surviving candidates on a signal change, Doc-3 §6) — it is **not** a Phase-A eligibility re-evaluation; it never re-gates, never adds or removes a candidate from the eligible set, and never re-runs the hard gates (that is `run_matching_pipeline` / `rematch_incremental`).
```

---

### PATCH-4E-PA-09 — PA-09 (verified) — `buyer_directed` invitation binding

**Location:** `rfq.assemble_and_route_wave.v1` — Cross-Module line.

**Before:**

```
- **Cross-Module:** `VendorInvited` → Communication dispatch (DE-6) + Operations `vendor_leads` creation (DE-4); grantee rows enable vendor-side reads via Identity-resolved orgs + delegation grants (DE-1); reads Billing quota as intake ceiling (DE-7). `buyer_directed`-flagged invitations excluded from valid-lead/guarantee/fairness/wave accounting (Doc-3 §2.11 + PATCH-D3-02 — DE-7).
```

**After:**

```
- **Cross-Module:** `VendorInvited` → Communication dispatch (DE-6) + Operations `vendor_leads` creation (DE-4); grantee rows enable vendor-side reads via Identity-resolved orgs + delegation grants (DE-1); reads Billing quota as intake ceiling (DE-7). **`buyer_directed`-flagged invitation (verified, PA-09):** created and `delivered` per `Doc-3_Patch_v1.0.2` PATCH-D3-02, so **`VendorInvited` fires** (Doc-2 §8 — only at `delivered`), but the record is **excluded** from valid-lead (Doc-3 §11.6), guarantee (§11.7), exposure-fairness (§3.3), and wave/replenishment (§5.2–§5.3) accounting; its flag-specific audit is carried under **`[ESC-RFQ-AUDIT]`** (nearest Doc-2 §9 invitation action by pointer). No event or audit action invented.
```

---

### PATCH-4E-PA-16 — PA-16 (verified) — Comparison dual trigger

**Location:** `rfq.get_comparison_statement.v1` — State-Machine line.

**Before:**

```
- **State-Machine:** first buyer open drives `quotations_received → buyer_reviewing` (Doc-2 §5.4) — vendor-facing status shows "under evaluation" only from `buyer_reviewing`.
```

**After:**

```
- **State-Machine:** `quotations_received → buyer_reviewing` (Doc-2 §5.4) fires on **either** trigger, **whichever is first (verified, PA-16; Doc-3 §1.2):** (a) the buyer **first opens** the comparison statement (this read contract), or (b) **automatically at quotation-window close** (system actor). Vendor-facing status shows "under evaluation" only from `buyer_reviewing`. The window-close auto-advance is a system-actor transition (Doc-3 §1.2); no new edge — the Doc-2 §5.4 `quotations_received → buyer_reviewing` edge already exists.
```

---

# 4. Impact Analysis

| Dimension | Assessment | Evidence |
|---|---|---|
| **Ownership unchanged** | **CONFIRMED** | No entity moved between modules. PA-14/PA-19 make explicit that the usage-ledger write is **Billing-owned** (RFQ emits only) — reinforces existing ownership, changes none. |
| **Lifecycle unchanged** | **CONFIRMED** | PA-07 (`vendors_notified → quotations_received`), PA-16 (`quotations_received → buyer_reviewing` window-close trigger), and PA-08 cascades (`submitted → expired`, invitations `→ expired`) all bind **existing** Doc-2 §5.4/§5.5/§3.4 edges; **no edge added or modified**. |
| **Authorization model unchanged** | **CONFIRMED** | PA-10 names two **existing** Doc-2 §7 slugs (`can_approve_vendor_selection`, `can_award_rfq`); no slug invented, removed, or rebound. |
| **Audit model unchanged** | **CONFIRMED** | No audit action coined. PA-19 relocates a quota-ledger description out of the Audit field (which now holds only Doc-2 §9 actions); PA-08/PA-09/PA-13 bind existing §9 actions (`InvitationExpired`) and carry `[ESC-RFQ-AUDIT]` where none is enumerated. |
| **Event catalog unchanged** | **CONFIRMED** | PA-12 uses existing `RFQSubmitted` + `RFQApproved`; PA-09/PA-11/PA-14 use existing `VendorInvited` / `QuotationSubmitted`; PA-05/PA-13 verified **no** new event. **Nothing coined** (Doc-4A §16.4). |
| **DDD boundaries unchanged** | **CONFIRMED** | No bounded context, aggregate, or section added/removed. Appendix E (PA-01) is a pointer index. PA-04 keeps the comparison's signal read inside one controlled path (firewall), tightening — not moving — a boundary. |
| **Procurement moat unchanged** | **CONFIRMED** | DE-1…DE-8 intact; PA-04 strengthens the governance-signal firewall (display = scored signal, no second read path); no pay-to-win path introduced; matching/routing logic stays RFQ-owned, vendor data stays Marketplace-owned. |

**Regression posture:** purely additive — one appendix (pointer table), two corpus-authorized state-machine clarifications binding pre-existing edges, field relocations, and AI-agent notes. No entity, event, permission, audit action, POLICY key, aggregate, bounded context, or section added; no ownership moved; no carried dependency resolved, modified, or reopened.

---

# 5. Pass-A Readiness

| Question | Answer |
|---|---|
| **Open BLOCKER** | **NO** — none raised; none introduced. |
| **Open MAJOR** | **NO** — all accepted findings (PA-01/04/07/08/10/12/14/19) applied; none was MAJOR-blocking and all are now closed. |
| **Open MINOR** | **NO** — all optional items (PA-02/06/15/17/18) applied as trivial; all verify-first items (PA-05/09/11/13/16) resolved by corpus check (apply/clarify or retain). No MINOR remains open. |
| **Ready for Pass-A Approval** | **YES** |

**Justification.** Every Board-accepted finding is applied as an additive clarification or a corpus-authorized state-machine note binding a pre-existing Doc-2 edge; every optional item was trivial and applied; every verify-first item was checked against the frozen corpus before action — yielding three corpus-authorized clarifications/applies (PA-09 `VendorInvited` binding + `[ESC-RFQ-AUDIT]`; PA-11 Billing consumes `QuotationSubmitted`; PA-16 dual `buyer_reviewing` trigger) and two retain-as-is outcomes (PA-05 no moderation event; PA-13 `InvitationExpired` is a §9 audit action, not an event), with **nothing invented**. Impact analysis confirms ownership, lifecycle, authorization, audit, event catalog, DDD boundaries, and the procurement moat are all unchanged. The amended Pass-A remains contract-structure-only (schemas high-level), conforms to `Doc-4E_Structure_v1.0_FROZEN` and the frozen corpus, and carries DE-1…DE-8 + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` unchanged. The document is **ready for Pass-A Patch Verification → Pass-A APPROVED/CLOSED**.

> No conflict with the frozen corpus was encountered during patch application or verification; no flag-and-halt was triggered.

---

*End of Doc-4E_PassA_Patch_v1.0 — applies PA-01/04/07/08/10/12/14/19 (accepted) + PA-02/06/15/17/18 (optional, trivial); resolves PA-05/09/11/13/16 by corpus verification (apply/clarify or retain — nothing invented). Additive clarifications + two corpus-authorized state-machine notes binding existing edges. No ownership, lifecycle, authorization, audit, event-catalog, DDD, or moat change. Decision: all findings closed; ready for Pass-A Approval. Canonical input: `Doc-4E_Content_v1.0_PassA.md` as amended by this patch.*