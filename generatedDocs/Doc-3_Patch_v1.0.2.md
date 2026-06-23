# Doc-3_Patch_v1.0.2.md

## Status

Approved Patch

| Field | Value |
|---|---|
| Applies to | Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md |
| Produces | Doc-3 v1.0.2 (v1.0.1 + this patch) |
| Requires | Doc-2_Patch_v1.0.3.md (PATCH-D2-01, PATCH-D2-02) |
| Scope | Resolutions for accepted findings B-1, B-2 (alignment to Doc-2 v1.0.3 edges), M-4, M-6, M-7. No new modules, no new entities, no new POLICY keys. |

All frozen architecture decisions, ownership boundaries, permission boundaries, and marketplace doctrines preserved.

---

# PATCH-D3-00 — Header Alignment (administrative)

**Location:** Doc-3 header table.

**Replace:**

```
| Version | 1.0.1 |
```

**With:**

```
| Version | 1.0.2 |
```

**Replace:**

```
| Supersedes | Doc-3 v1.0 (Doc-3_Patch_v1.0.1, PATCH-04A Vendor Selection, and Doc-3_Patch_v1.0.1_Extension fully integrated) |
```

**With:**

```
| Supersedes | Doc-3 v1.0.1 (Doc-3_Patch_v1.0.2 integrated) |
```

**Replace:**

```
| Conforms To | Master_System_Architecture_v1.0_FINAL.md (+ Architecture Patch v1.0.1) and Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md — both FROZEN, immutable constraints |
```

**With:**

```
| Conforms To | Master_System_Architecture_v1.0_FINAL.md (+ Architecture Patch v1.0.1) and Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md + Doc-2_Patch_v1.0.3.md — FROZEN, immutable constraints |
```

---

# PATCH-D3-01 — Quota Accounting Identity (resolves M-4)

## D3-01a — New subsection §4.1.1

**Location:** Insert immediately after the §4.1 bullet list (after the *System throttle* bullet), before the §4.2 heading.

**Exact new text:**

> #### 4.1.1 Entitlement vs Delivery vs Quotation Quota (accounting identity)
>
> Three instruments, three counting events, no overlap:
>
> 1. **Lead entitlement (guaranteed leads)** — commercial guarantee accounting only (11.6–11.7). A guarantee is settled against *valid leads delivered* in the period. The entitlement is never consumed by quoting and never meters delivery or submission.
> 2. **Lead delivery accounting** — a lead is counted at invitation `delivered`, subject to the valid-lead tests of 11.6. Delivery is metered by capacity (4.1) — never by the quotation quota balance and never by the entitlement.
> 3. **Quotation submission quota (`monthly_rfq_limit`)** — consumed only at quotation submission (frozen Doc-2 §5.5 guard), attributed to the controlling organization regardless of acting representative. Never consumed at delivery.
>
> **FIXED:** no single event may consume more than one instrument. The `entitlement_quota` term in the 4.1 intake formula is a *read* of the remaining quotation submission quota, used as a delivery ceiling (an organization is never delivered more open invitations than it could still quote); reading the balance is not consumption.

## D3-01b — §4.1 bullet replacement

**Location:** §4.1, second bullet under the capacity table.

**Replace:**

```
- *Entitlement quota* is the monetization layer's `monthly_rfq_limit` (frozen) — consumption attributed to the controlling organization.
```

**With:**

```
- *Entitlement quota* is the remaining quotation submission quota (`monthly_rfq_limit`, frozen) of the controlling organization, read as a delivery ceiling only — consumption occurs solely at quotation submission (4.1.1); delivery never decrements it.
```

## D3-01c — §8.1 wording alignment

**Location:** §8.1 Preconditions.

**Replace:**

```
quota available on the controlling org
```

**With:**

```
quotation submission quota available on the controlling organization (4.1.1)
```

**Location:** §8.1 Effects.

**Replace:**

```
quota ledger entry on controlling org
```

**With:**

```
quotation submission quota ledger entry on the controlling organization (4.1.1)
```

## D3-01d — §12.1 FIXED list addition

**Location:** §12.1, append to the end of the FIXED inventory paragraph.

**Exact new text (appended sentence):**

```
Additionally: lead entitlement, lead delivery accounting, and quotation submission quota are distinct instruments — no single event consumes more than one (4.1.1).
```

---

# PATCH-D3-02 — Buyer-Supplied Vendor Conversion (resolves M-6)

## D3-02a — §2.11 flow block replacement

**Location:** §2.11, the flow code block.

**Replace:**

```
Buyer adds vendor (email/contact/company info, at RFQ creation or in CRM)
→ Email validation → Private vendor record created (buyer-org scoped)
→ Buyer-directed invitation sent (outreach channel, carrying the RFQ opportunity)
→ Vendor registration opportunity → Claim/link opportunity (link, never merge)
→ Marketplace participation:  Private record → Invited → Registered → Claimed → Verified
```

**With:**

```
Buyer adds vendor (email/contact/company info, at RFQ creation or in CRM)
→ Email validation → Private vendor record created (buyer-org scoped)
→ Buyer-directed outreach sent (outreach channel, carrying the RFQ opportunity)
→ Vendor registration opportunity → Claim/link opportunity (link, never merge)
→ [if originating RFQ still active AND quotation window open with minimum runway
   AND vendor profile passes every Phase A hard gate]
   → buyer-directed invitation record created → delivered → quotable (Section 8)
→ Marketplace participation:  Private record → Invited → Registered → Claimed → Verified
```

## D3-02b — §2.11 new reconciliation bullet

**Location:** §2.11 "Reconciliation rules (binding)" — insert as a new bullet after the first bullet ("A buyer-directed outreach invitation is **not platform routing**…").

**Exact new text:**

> - **Conversion-to-quotable rule.** When a buyer-supplied vendor completes registration and claim while the originating RFQ is still active and its quotation window remains open with at least `capacity.min_response_runway_hours` of runway, and the resulting vendor profile passes every Phase A hard gate (3.1) against the current RFQ version — blacklist floor and self-match exclusion absolute, as always — the system creates the invitation record for (RFQ, vendor profile), flagged `buyer_directed`, and delivers it immediately. It is quotable under the normal quotation workflow (Section 8) and occupies a normal active-capacity slot (Section 4), respecting invitation uniqueness (one per RFQ–vendor ever). It is **not** platform routing: it is excluded from valid-lead accounting (11.6), guarantee accounting (11.7), exposure-fairness ratios (3.3), and wave/replenishment counts (5.2–5.3). If any condition fails, no invitation is created; the vendor enters normal eligibility for *future* routed RFQs only.

## D3-02c — §11.6 invalid-lead wording alignment

**Location:** §11.6, "Invalid leads" sentence.

**Replace:**

```
buyer-directed outreach invitations (2.11)
```

**With:**

```
buyer-directed outreach invitations and buyer-directed (`buyer_directed`-flagged) invitation records (2.11)
```

---

# PATCH-D3-03 — Coverage Recovery Incremental Rematch (resolves M-7)

**Location:** §11.4, insert immediately after the Coverage Recovery Workflow code block (`RFQ created → … → Coverage improved`), before the "System actions:" sentence.

**Exact new text:**

> **Incremental rematch (binding).** When a vendor becomes newly eligible (claim completed, or a gate-relevant state change) while a coverage recovery case is open, the system triggers an incremental rematch scoped to the affected RFQ(s) of that case and to the newly eligible vendor(s) only — never a re-route of existing results. The incremental run executes the full canonical pipeline (3.1): every hard gate applies, scoring appends to `matching_results`, and delivery follows normal wave, throttle, relevance-floor, and runway rules. First successful delivery transitions the RFQ `matching → vendors_notified` (frozen machine); existing invitations and prior pipeline results are never recomputed or revoked. Incremental runs are recorded in the routing log flagged `incremental_rematch` with the triggering coverage case reference.

---

# PATCH-D3-04 — §1.2 Moderation Rejection Alignment (binds B-1 to Doc-2 PATCH-D2-01)

**Location:** §1.2, `submitted → under_review` table, "Outcomes" row.

**Replace:**

```
Cleared → `matching`. Rejected → returned to `draft` with reason (audited); repeated rejections feed the buyer abuse score (Section 10.2).
```

**With:**

```
Cleared → `matching`. Rejected → `draft` via the moderation-reject transition (Doc-2 §5.4 per Doc-2_Patch_v1.0.3 PATCH-D2-01; platform moderation actor, mandatory structured reason `rfq_correction_required` + free text, audited). The buyer corrects and resubmits through the normal submission gate; repeated rejections feed the buyer abuse score (Section 10.2).
```

---

# PATCH-D3-05 — §1.2 Matching Exit Alignment (binds B-2 to Doc-2 PATCH-D2-02)

## D3-05a — §1.2 `matching` table, "Failure handling" row

**Replace:**

```
Pipeline error → retry with backoff; after POLICY `matching.max_retries` *[start: 3]*, park the RFQ in `matching` with an ops alert. Never silently drop.
```

**With:**

```
Pipeline error → retry with backoff; after POLICY `matching.max_retries` *[start: 3]*, park the RFQ in `matching` with an ops alert. Never silently drop. Parking is bounded: an RFQ may not remain in `matching` beyond POLICY `matching.empty_hold_days` — at the bound it transitions `matching → expired` (system actor, reason `no_eligible_vendors_found`, Doc-2_Patch_v1.0.3 PATCH-D2-02) with buyer notification.
```

## D3-05b — §1.2 `matching` table, "Empty-pool outcome" row

**Replace:**

```
If zero vendors survive the gates: (a) in restricted modes (Approved Only / Approved+Conditional) the buyer is notified immediately with the offer to widen the mode — the RFQ holds in `matching` for POLICY `matching.empty_hold_days` *[start: 3]* before auto-expiry warning; (b) in Open Market, the empty cell triggers the Coverage Recovery Workflow (Section 11.4): coverage gap record, vendor recruitment tasks, buyer notified honestly ("we are sourcing suppliers for this requirement"). **FIXED:** the buyer is never shown fake matching activity.
```

**With:**

```
If zero vendors survive the gates: (a) in restricted modes (Approved Only / Approved+Conditional) the buyer is notified immediately with the offer to widen the mode — the RFQ holds in `matching` for POLICY `matching.empty_hold_days` *[start: 3]*; if the buyer widens, the pipeline re-runs in the wider mode; (b) in Open Market, the empty cell triggers the Coverage Recovery Workflow (Section 11.4): coverage gap record, vendor recruitment tasks, incremental rematch on newly eligible vendors (11.4), buyer notified honestly ("we are sourcing suppliers for this requirement"), with the same hold bound. In both branches, if the hold elapses without a deliverable wave, the RFQ transitions `matching → expired` (system actor, reason `no_eligible_vendors_found`, Doc-2_Patch_v1.0.3 PATCH-D2-02); the buyer is notified, re-issue (1.6) is the recovery path, and cell-level coverage recovery continues independently of the expired RFQ. **FIXED:** the buyer is never shown fake matching activity, and an RFQ never remains in `matching` beyond the hold bound.
```

---

*End of Doc-3_Patch_v1.0.2 — apply with Doc-2_Patch_v1.0.3. Downstream consumer: Doc-4 encodes the new edges, the `buyer_directed` invitation flag semantics, the incremental-rematch routing-log flag, and the three-instrument accounting identity as API contracts.*
