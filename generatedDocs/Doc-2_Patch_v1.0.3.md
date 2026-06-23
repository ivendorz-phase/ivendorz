# Doc-2_Patch_v1.0.3.md

## Status

Approved Patch

| Field | Value |
|---|---|
| Applies to | Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md |
| Produces | Doc-2 v1.0.3 (v1.0.2 + this patch) |
| Scope | Two additive edges in the RFQ state machine (§5.4) — nothing else. No entity changes, no ownership changes, no schema changes, no event-catalog changes beyond the audit reasons named below. |
| Purpose | Provide the legal transitions required by Doc-3 review findings B-1 (moderation rejection path) and B-2 (matching dead-end). |

All frozen architecture decisions, aggregate boundaries, ownership rules, and tenancy rules are preserved. The freeze on Doc-2 remains in force; this patch is the minimal additive exception, approved through change management.

---

# PATCH-D2-01 — Moderation Rejection Edge (resolves B-1)

**Location:** §5.4 RFQ state machine code block — insert the following line immediately after:

```
submitted ──moderation pass──▶ under_review ──cleared──▶ matching
```

**Exact new line:**

```
under_review ──moderation reject [platform moderation actor (admin, or system per moderation.mode); mandatory structured reason; audited]──▶ draft
```

**Rules:**

- Reason is a structured code (`rfq_correction_required` plus free text) recorded in the audit trail; the buyer corrects the RFQ and resubmits through the normal submission gate.
- The transition is platform-actor only (moderation queue); buyers cannot trigger it, and it never bypasses the submission gate on resubmission.
- Versioning rules are unchanged: no quotation can exist before `matching`, so no version-immutability interaction arises.
- Repeated rejections feed buyer abuse scoring (Doc-3 §10.2) — operational consequence, not a state-machine concern.

---

# PATCH-D2-02 — Matching Expiry Edge (resolves B-2)

**Location:** §5.4 RFQ state machine code block — insert the following line immediately after:

```
matching ──pipeline complete──▶ vendors_notified
```

**Exact new line:**

```
matching ──coverage exhausted [system actor; reason = no_eligible_vendors_found; audited]──▶ **expired**
```

**Rules:**

- System actor only. Fired when the operational hold defined in Doc-3 (§1.2 `matching`, POLICY `matching.empty_hold_days`) elapses without the pipeline producing a deliverable wave — empty-pool and pipeline-failure parking included.
- Terminal reason `no_eligible_vendors_found` is recorded; the buyer is notified honestly before and at expiry (Doc-3 FIXED: no fake matching activity).
- `expired` remains terminal (never reopens); the recovery path is re-issue (Doc-3 §1.6). Coverage recovery for the *cell* (Doc-3 §11.4) continues independently of the individual RFQ's expiry.
- The Quotation machine (§5.5) is unaffected: no quotation can exist while the RFQ is in `matching`.

---

# Resulting §5.4 state machine (full replacement block)

```
draft ──submit [internal approval not required]──────────────▶ submitted
draft ──submit [approval required]──▶ pending_internal_approval
pending_internal_approval ──approve [can_approve_rfq]──▶ submitted
pending_internal_approval ──reject──▶ draft
submitted ──moderation pass──▶ under_review ──cleared──▶ matching
under_review ──moderation reject [platform moderation actor (admin, or system per moderation.mode); mandatory structured reason; audited]──▶ draft
matching ──pipeline complete──▶ vendors_notified
matching ──coverage exhausted [system actor; reason = no_eligible_vendors_found; audited]──▶ **expired**
vendors_notified ──first quotation──▶ quotations_received
quotations_received ──buyer opens comparison──▶ buyer_reviewing
buyer_reviewing ──shortlist──▶ shortlisted
shortlisted ──award──▶ **closed_won**        shortlisted ──no award──▶ **closed_lost**
vendors_notified|quotations_received|buyer_reviewing ──validity window lapses [system actor; window in system_configuration]──▶ **expired**
any active state ──cancel [audited reason]──▶ **cancelled**
```

Guards section: unchanged.

---

*End of Doc-2_Patch_v1.0.3 — downstream consumers: Doc-3 v1.0.2 (binds to both new edges), Doc-4 (encodes both edges as API contracts with the actors and reasons stated above).*
