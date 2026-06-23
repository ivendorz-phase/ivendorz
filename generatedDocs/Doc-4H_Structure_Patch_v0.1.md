# Doc-4H_Structure_Patch_v0.1 — Corrective Structure Patch (Module-6 Communication)

| Field | Value |
|---|---|
| Document | Doc-4H_Structure_Patch_v0.1 — corrective patch for `Doc-4H_Structure_Proposal_v0.1` |
| Nature | **Corrective patch — not a redesign.** Applies only the Board-approved findings (F4H-MA1, F4H-M1, F4H-M2, F4H-N1 optional). **F4H-M3 rejected — not patched.** |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; corpus precedence; on conflict FLAG-AND-HALT |
| Applies to | `Doc-4H_Structure_Proposal_v0.1.md` |
| Preserved unchanged | Module Charter, BC count (BC-COMM-1…4), aggregate count (4), ownership matrix, dependency ownership, procurement-moat boundaries, trust-firewall boundaries, escalation markers (`ESC-COMM-AUDIT`/`POLICY`/`SLUG`/`EVENT`), event ownership (Communication produces **no** Doc-2 §8 domain event) |
| Scope | Patch 1 (F4H-MA1) · Patch 2 (F4H-M1) · Patch 3 (F4H-M2) · Patch 4 (F4H-N1, optional — applied) |

---

## Patch 1 — F4H-MA1 · Outbound Log aggregate-root ambiguity (§H5, §H9, §H13, §H17)

**Resolution:** Outbound Log **remains ONE aggregate**; `email_logs`/`sms_logs`/`whatsapp_logs` are **channel-specific storage structures owned by the Outbound Log aggregate**, not three aggregate roots. Module-6 aggregate count stays **4**. No ownership change.

### §H5 (Aggregate Inventory)

**Original**

```
  - **Outbound Log** — roots `email_logs` / `sms_logs` / `whatsapp_logs` (AR each); VO DeliveryStatus → **BC-COMM-3**.
```

**Replacement**

```
  - **Outbound Log** — **single aggregate root `Outbound Log`**; `email_logs` / `sms_logs` / `whatsapp_logs` are **channel-specific storage structures owned by this one aggregate** (per channel: in-app-adjacent email/SMS/WhatsApp delivery records), not separate aggregate roots; VO DeliveryStatus → **BC-COMM-3**.
```

### §H9 (Ownership Matrix)

**Original**

```
  - **Owned (Communication / `communication` schema), by Doc-2 §2/§3.7/§10.7 — one owning BC-COMM each:** `threads`(+`messages`/`thread_participants`) → BC-COMM-1; `notifications` → BC-COMM-2; `email_logs`/`sms_logs`/`whatsapp_logs` → BC-COMM-3; `support_tickets`(+`ticket_messages`) → BC-COMM-4.
```

**Replacement**

```
  - **Owned (Communication / `communication` schema), by Doc-2 §2/§3.7/§10.7 — one owning BC-COMM each:** `threads`(+`messages`/`thread_participants`) → BC-COMM-1; `notifications` → BC-COMM-2; **the Outbound Log aggregate (its channel-specific storage structures `email_logs`/`sms_logs`/`whatsapp_logs`)** → BC-COMM-3; `support_tickets`(+`ticket_messages`) → BC-COMM-4.
```

### §H13 (State Machine Inventory)

**Original**

```
  - **Outbound Delivery** — `email_logs`/`sms_logs`/`whatsapp_logs`: `queued → sent → delivered | failed` (append-only) — BC-COMM-3 (Doc-2 §10.7).
```

**Replacement**

```
  - **Outbound Delivery** — the Outbound Log aggregate's channel-specific storage structures (`email_logs`/`sms_logs`/`whatsapp_logs`): `queued → sent → delivered | failed` (one delivery-status machine, append-only, applied per channel record) — BC-COMM-3 (Doc-2 §10.7).
```

### §H17 (Structure Summary)

**Original**

```
State machines inventoried: Thread (`open→closed`), Message (append-only), Thread Participant (`active→removed`), Notification (`unread→read→archived`), Outbound Delivery (`queued→sent→delivered/failed`), Support Ticket (`open→in_progress→resolved→closed`), Ticket Message (append-only).
```

**Replacement**

```
State machines inventoried: Thread (`open→closed`), Message (append-only), Thread Participant (`active→removed`), Notification (`unread→read→archived`), Outbound Delivery (`queued→sent→delivered/failed`, on the Outbound Log aggregate's per-channel storage structures), Support Ticket (`open→in_progress→resolved→closed`), Ticket Message (append-only).
```

---

## Patch 2 — F4H-M1 · Explicit consumed-event enumeration (§H11)

**Resolution:** Replace the generic "notification-bearing events" wording with an explicit structure-level enumeration of the **Doc-2 §8 authoritative events** consumed for fan-out, each with Producer · Consumer BC · Ownership Direction; single-authorship preserved; no event invented.

### §H11 Event Consumption Map — second bullet

**Original**

```
  - **The notification-bearing §8 events of every producing module** (Marketplace DH-2, RFQ DH-3, Operations DH-4, Trust DH-5, Billing DH-6, Admin DH-7) → **BC-COMM-2** derives + fans out notifications per the Doc-2 §8 consumer mapping and the Identity-owned notification rules. Ownership direction: the producing module owns the event; Communication owns the notification effect (its own consumer).
```

**Replacement**

```
  - **The Doc-2 §8 authoritative events consumed by BC-COMM-2 for notification fan-out** (Producer · Consumer BC · Ownership Direction — the producing module owns the event, Communication owns only the notification effect, single-authorship Doc-4A §4.4; no event invented):
    - **RFQ (Doc-4E) → BC-COMM-2:** `RFQCreated`, `RFQSubmitted`, `RFQApproved`, `RFQClosedWon`, `RFQClosedLost`, `RFQMatched`, `RFQRouted`, `VendorInvited` (fan-out duplicated above; the primary notification trigger), `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected`.
    - **Marketplace (Doc-4D) → BC-COMM-2:** `VendorClaimed`, `VendorSuspended`, `VendorTierChanged[tier_type='declared']`, `ProfileThemeChanged`, `ProfileLayoutChanged`, `ProfilePublished`, `ProfileUnpublished`, `MicrositePublished`, `MicrositeDomainChanged`, `VendorOwnershipTransferred`.
    - **Trust (Doc-4G) → BC-COMM-2:** `VendorVerified`, `VendorTierChanged[tier_type='verified']`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen`.
    - **Operations (Doc-4F) → BC-COMM-2:** `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`.
    - **Admin (Doc-4J) → BC-COMM-2:** `VendorBanned`.
    - **Billing (Doc-4I) → BC-COMM-2:** `SubscriptionPurchased`, `SubscriptionRenewed`, `SubscriptionExpired`.
    Ownership direction for every row: the **producing module owns the event**; **Communication owns the notification/delivery effect only** (its own idempotent consumer — Doc-4A §16). The precise per-event channel/recipient matrix binds to the Doc-2 §8 consumer mapping + Identity `notification_rules_jsonb` at content authoring. **These are the Doc-2 §8 catalog events verbatim — none invented; events absent from Doc-2 §8 are not added.**
```

---

## Patch 3 — F4H-M2 · Explicit raw-contact-scrub seam (§H4, §H8, §H16)

**Resolution:** State **one** explicit structural mechanism — **BC-COMM-1 obtains the raw-contact-scrub rule from RFQ by service-read (the DH-3 seam) and applies it content-side at message-write time; RFQ retains ownership of the rule (the rule definition stays in RFQ/Doc-3; Communication holds no copy and makes no procurement decision)** — preserving RFQ ownership, Communication neutrality, and the procurement moat. One mechanism only; no redesign.

### §H4 BC-COMM-1 record

**Original**

```
  - **BC-COMM-1 Messaging** — *purpose:* host participant-gated threads + messages; *ownership:* `threads` (+`messages`, `thread_participants`); *services:* thread open/close, message send (append-only; soft-delete=hidden), participant grant/remove, RFQ-clarification thread hosting (context_id = `rfq_id`; raw-contact scrubbing is RFQ/Doc-3's rule, applied content-side); *dependencies:* Identity (participant org/user resolution — DH-1), RFQ (clarification thread context reference — DH-3), Platform Core (audit/Realtime backing — DH-8). **Hosts the thread; owns no RFQ decision.**
```

**Replacement**

```
  - **BC-COMM-1 Messaging** — *purpose:* host participant-gated threads + messages; *ownership:* `threads` (+`messages`, `thread_participants`); *services:* thread open/close, message send (append-only; soft-delete=hidden), participant grant/remove, RFQ-clarification thread hosting (context_id = `rfq_id`); *raw-contact-scrub seam (one mechanism):* on an `rfq_clarification` thread, BC-COMM-1 **reads the RFQ-owned scrub rule via the RFQ service (DH-3)** and **applies it content-side at message-write time** — the rule **definition is owned by RFQ/Doc-3** (Communication holds no copy, defines no scrub policy, and makes no procurement decision); *dependencies:* Identity (participant org/user resolution — DH-1), RFQ (clarification thread context reference + scrub-rule read — DH-3), Platform Core (audit/Realtime backing — DH-8). **Hosts the thread + applies the RFQ-owned rule; owns neither the rule nor any RFQ decision.**
```

### §H8 DH-3 record

**Original**

```
  - **DH-3 — RFQ boundary (the moat seam).** RFQ (Doc-4E, FROZEN) emits §8 events and owns the clarification-channel rule. Communication **consumes** `VendorInvited` (and other RFQ notification events) for fan-out, and **hosts** the rfq_clarification thread (context_id = `rfq_id`); it makes **no procurement decision** and applies RFQ's raw-contact-scrub rule content-side. **Channel:** consume events; host thread; no RFQ decision.
```

**Replacement**

```
  - **DH-3 — RFQ boundary (the moat seam).** RFQ (Doc-4E, FROZEN) emits §8 events and **owns the clarification-channel raw-contact-scrub rule** (Doc-3). Communication **consumes** the RFQ §8 notification events (§H11) for fan-out, **hosts** the rfq_clarification thread (context_id = `rfq_id`), and **reads the RFQ-owned scrub rule via the RFQ service and applies it content-side at message-write** — **the rule definition stays in RFQ; Communication holds no copy** and makes **no procurement decision**. **Channel:** consume events; host thread; **read RFQ scrub rule by service (no ownership transfer)**; no RFQ decision.
```

### §H16 AI-Agent Safety Notes — scrub clause

**Original**

```
apply RFQ's raw-contact-scrub rule content-side on rfq_clarification threads;
```

**Replacement**

```
on an `rfq_clarification` thread, **read the RFQ-owned scrub rule via the RFQ service (DH-3) and apply it content-side at message-write** — the rule definition is RFQ's (Doc-3); Communication holds no copy, defines no scrub policy, and makes no procurement decision (one mechanism, ownership stays RFQ);
```

---

## Patch 4 (optional, applied) — F4H-N1 · Outbound Log multi-channel clarification (§H3, §H17)

**Resolution:** Add a brief clarification that the Outbound Log is one aggregate spanning multiple channel storage structures (naturally aligned with the F4H-MA1 resolution).

### §H3 BC-COMM-3 candidate-context line

**Original**

```
  - **BC-COMM-3 — Delivery Tracking** (Outbound Log aggregate): outbound channel logs (`email_logs`/`sms_logs`/`whatsapp_logs`) with queued→sent→delivered/failed status.
```

**Replacement**

```
  - **BC-COMM-3 — Delivery Tracking** (Outbound Log aggregate): the **single Outbound Log aggregate** whose channel-specific storage structures (`email_logs`/`sms_logs`/`whatsapp_logs`) record outbound delivery with queued→sent→delivered/failed status (one aggregate, multiple channel structures — not three aggregates).
```

### §H17 Structure Summary — aggregate line

**Original**

```
owning **4 aggregates** (Doc-2 §2, Module 6 — Thread, Notification, Outbound Log, Support Ticket), each aggregate in exactly one context.
```

**Replacement**

```
owning **4 aggregates** (Doc-2 §2, Module 6 — Thread, Notification, Outbound Log, Support Ticket), each aggregate in exactly one context (the Outbound Log is **one** aggregate whose channel-specific storage structures are `email_logs`/`sms_logs`/`whatsapp_logs`).
```

---

## Regression Audit

| Area | Result |
|---|---|
| Module Charter | UNCHANGED |
| BC Count | UNCHANGED (BC-COMM-1/2/3/4) |
| Aggregate Count | UNCHANGED (4) |
| Ownership Matrix | UNCHANGED (clarified Outbound Log wording only; no owner change) |
| Dependency Map | UNCHANGED except the explicit DH-3 scrub-rule seam clarification |
| Procurement Moat | UNCHANGED |
| Trust Firewall | UNCHANGED |
| Escalation Inventory | UNCHANGED (`ESC-COMM-AUDIT`/`POLICY`/`SLUG`/`EVENT`) |
| Event Ownership | UNCHANGED — Communication still produces **NO Doc-2 §8 domain event**; consumed events enumerated from the Doc-2 §8 catalog verbatim (none invented) |

**F4H-M3 — REJECTED:** not patched. No Doc-4G freeze-state / conditional-dependency / review-state caveat added.

---

*End of Doc-4H_Structure_Patch_v0.1.*
