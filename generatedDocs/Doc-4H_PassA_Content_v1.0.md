# Doc-4H — Communication Engine — API & Integration Contracts — Content Pass-A v1.0

| Field | Value |
|---|---|
| Document | Doc-4H — **Content Pass-A v1.0** — contract-structure pass for Module 6 — Communication (`communication` schema, `comm_` namespace) — the **delivery & interaction layer** |
| Status | **Pass-A draft — contract surface for Independent Hard Review.** Authored against `Doc-4H_Structure_v1.0_FROZEN` (sole structure authority; §H1–§H17, as amended by `Doc-4H_Structure_Patch_v0.1`). Next stage after review/patch: **Doc-4H Pass-B.** |
| Structure authority | `Doc-4H_Structure_v1.0_FROZEN` (4 bounded contexts, 4 aggregates) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G v1.0, Doc-4H_Structure_v1.0_FROZEN — all FROZEN |
| Pass-A depth | Per contract: Purpose · Owning BC · Aggregate · Operation Type · Actor · Permission family · Lifecycle impact · Audit · Events · Cross-Module · Sources — all **by pointer**. **High-level only** — field-level payloads, validation rules, and business logic are Pass-B scope. |
| Audience | Doc-4H content-pass authors; Claude Code / Cursor / OpenAI Codex / backend / frontend / QA / AI coding agents |

**Pass-A baseline scope.** This document is the proposed contract surface of Module 6 against the frozen structure: it names each contract, binds it to a Doc-4A §21 template, fixes its owning BC / aggregate / actor / permission-family / lifecycle / audit / event / cross-module pointers. It **does not** author field-level payloads, validation order, or business rules (Pass-B), and it **modifies no frozen structure decision** (no bounded-context, aggregate-ownership, dependency-ownership, event-ownership, escalation-marker, or module-responsibility change). Every binding is by pointer to the frozen corpus; **no entity, state, permission slug, event, audit action, POLICY key, or template is invented.** Carried markers **DH-1…DH-8**, `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`, `[ESC-COMM-SLUG]`, `[ESC-COMM-EVENT]` are referenced by name only and **never resolved here**.

**Reading note.** Communication is a **delivery and interaction layer**: it transports information and owns the conversation/notification/delivery/support artifacts; it **never decides, approves, scores, evaluates, ranks, routes, matches, selects, or awards** — business authority remains with the originating module. Per the integration **single-authorship rule (Doc-4A §4.4)**, the emitting module authors event production; **Communication authors notification dispatch/fan-out** (its own consumer effects). **Communication produces NO Doc-2 §8 domain event.** Push/email/SMS/WhatsApp are **delivery channels only** — never the source of truth (Doc-4A §4A). On any conflict with a higher/frozen document: **flag-and-halt** (Doc-4A §0.6) — none was encountered in this pass.

---

## §B — Pass-A Cross-Cutting Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3) and avoid duplication, the following apply to **every** contract; per-contract records cite specifics and reference these by pointer.

- **B.1 — Contract-ID & templates (Doc-4A §21).** Contract-ID `comm.<operation>.v1` (prefix = schema `communication`; Appendix B namespace `comm_`). Templates: **21.3 Query** (reads), **21.4 Command** (mutations/state-transitions), **21.5 System** (`Response: none` — inbound event-consumer effects: notification creation from a consumed §8 event, outbound-delivery dispatch logging, delivery retry job). **Template 21.6 (Admin)** is used where a platform-staff action without active org context applies (Support-Admin ticket handling, §5.6). **Template 21.2 (Integration) is NOT instantiated here** — per Doc-4A §4.4 the event-delivery integration contract is authored by the **emitting** module; Communication authors its own consumer effects on its own entities (single-authorship). No template invented.
- **B.2 — Actor types (Doc-4A §5; Doc-2 §9 actor set User|Admin|System|AI Agent).** **User** (tenant member in a server-validated active-org context, §5.3 — thread participants, notification recipients, ticket openers); **Admin** (platform-staff, no active org context, §5.6 — Support-Admin ticket handling via `staff_can_support`); **System** (inbound event consumers — notification creation from consumed §8 events; outbound-delivery dispatch + retry jobs). No actor category invented; "internal-service" composition notation used for synchronous cross-module reads consumed (e.g., the RFQ scrub-rule read — DH-3).
- **B.3 — Identifiers (Doc-4A §8; Doc-2 §0.1).** UUIDv7 is the only canonical machine ID. Cross-module references (`context_id`/`rfq_id`, `recipient_user_id`/`recipient_organization_id`, `source_event_id`, `sender_user_id`/`sender_organization_id`, `participant_organization_id`/`participant_user_id`, `organization_id`/`opened_by`) are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3, §10.7).
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B). **Slugs only** (§6.2), from the Doc-2 §7 catalog; **no slug invented**. Communication **consumes** Identity's `check_permission` and org/membership/active-org resolution (Doc-4C, FROZEN). The Doc-2 §7 communication slugs are: **`can_use_messaging`** (all active members; participation via `thread_participants`), **`can_raise_support_ticket`** (all active members), and the platform-staff **`staff_can_support`** (Support Admin; no private-RFQ read). Notification read/archive is recipient-scoped (no distinct §7 slug enumerated → `[ESC-COMM-SLUG]` if a distinct slug is later required). No shadow authorization.
- **B.5 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** **Doc-2 §9 enumerates no separate Communication / Thread / Message / Notification / Delivery / Support-Ticket audit domain** → every audited Communication mutation carries **`[ESC-COMM-AUDIT]`** (interim: nearest enumerated §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**), written in-transaction via the Doc-4B mechanism. **Reads are not audited** (§17.1).
- **B.6 — Events (Doc-2 §8 via Doc-4B outbox-write/consume).** **Communication emits NO Doc-2 §8 domain event** (single-authorship — emitters own event production; Communication owns consumer/fan-out effects; Doc-4A §16.4 — no event coined). Communication **consumes** the Doc-2 §8 catalog events for notification fan-out (the §H11 enumeration): RFQ (`RFQCreated`/`RFQSubmitted`/`RFQApproved`/`RFQClosedWon`/`RFQClosedLost`/`RFQMatched`/`RFQRouted`/`VendorInvited`/`QuotationSubmitted`/`QuotationWithdrawn`/`QuotationSelected`), Marketplace (`VendorClaimed`/`VendorSuspended`/`VendorTierChanged[declared]`/`ProfileThemeChanged`/`ProfileLayoutChanged`/`ProfilePublished`/`ProfileUnpublished`/`MicrositePublished`/`MicrositeDomainChanged`/`VendorOwnershipTransferred`), Trust (`VendorVerified`/`VendorTierChanged[verified]`/`TrustScoreUpdated`/`PerformanceScoreUpdated`/`PerformanceReviewTriggered`/`PerformanceFrozen`), Operations (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`), Admin (`VendorBanned`), Billing (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired`). Each consumer is idempotent (Doc-4A §16); the producing module owns the event, Communication owns the notification/delivery effect only. **No event invented; events absent from Doc-2 §8 are not added.** `VendorInvited` is co-consumed independently by Operations (vendor_leads creation) — the two consumers are independent.
- **B.7 — Communication-neutrality & firewall (Doc-4A §4.4/§4A/§4B).** Communication **transports, never decides** — no business approval, score, evaluation, ranking, routing, matching, supplier-selection, or award. It owns **none** of the governance signals (Trust/Performance/Verification/Governance scores — Trust/Doc-4G) and computes none; it owns **no** RFQ decision/matching/award (RFQ/Doc-4E), **no** Billing decision (Billing/Doc-4I), **no** vendor data (Marketplace/Doc-4D), **no** notification preferences (Identity-owned, consumed read-only — DH-1). Push is delivery-only and **never substitutes for the owning module's Query** (Doc-4A §4A). A paid plan/entitlement/flag never gates delivery in a way touching trust/verification/eligibility/routing/matching (Doc-4A §4B). On an `rfq_clarification` thread, the RFQ-owned raw-contact-scrub rule is **read via the RFQ service (DH-3) and applied content-side** — the rule definition stays in RFQ (Communication holds no copy, makes no procurement decision).
- **B.8 — AI-agent source rule.** Every contract record states its **owning BC / aggregate / actor / permission-family / lifecycle / audit / event source** by pointer, so AI agents implement without architectural assumptions. Global constraints: consume frozen Doc-4B/Doc-4C services and the producing modules' §8 events; honor the Doc-2 §3.7/§10.7 lifecycles verbatim; never decide/score/award; produce no event; never invent an entity/event/slug/audit-action/POLICY-key/template (escalate via DH / `[ESC-COMM-*]`).

**Per-contract record shape (Pass-A).** Each contract below is recorded as: **Purpose · Owning BC · Aggregate · Operation (template) · Actor · Permission family · Lifecycle impact · Audit · Events · Cross-Module · Sources.** Where several contracts share an aggregate, they are grouped; each still carries its own record.

---

## HA-1 — Module Overview

Module 6 — **Communication Engine** owns the `communication` schema (namespace `comm_`) and is the **delivery and interaction layer** of iVendorz — it transports information across the platform and hosts the conversation, notification, delivery-tracking, and support artifacts.

- **Purpose:** carry every module's signals to users (notifications fanned out from the §8 events), host participant-gated messaging threads (direct + RFQ-clarification), track outbound channel delivery, and run user↔platform-staff support — **without becoming a business authority**.
- **Responsibilities:** Conversation Threads, Messages, Notifications, Delivery Tracking, Support Communication Records (the four Module-6 aggregates: Thread, Notification, Outbound Log, Support Ticket).
- **Non-Responsibilities:** RFQ decisions, Trust decisions, Billing decisions, procurement decisions, vendor decisions, buyer decisions, workflow/business approvals, notification-preference ownership (Identity-owned, consumed read-only). Communication owns no matching/routing/ranking/quotation-evaluation/supplier-selection/award; computes no Trust/Performance/Verification/Governance score; produces no Doc-2 §8 domain event.

The precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-4F → Doc-4G → Doc-4H), the flag-and-halt obligation (§0.6), and the patch-based amendment rule apply.

---

## HA-2 — Bounded Context Inventory

Per the frozen `Doc-4H_Structure_v1.0_FROZEN` §H3/§H5 — 4 bounded contexts owning 4 aggregates, each aggregate in exactly one context.

| Bounded context | Purpose | Owned aggregate(s) | Pass-A contract section |
|---|---|---|---|
| **BC-COMM-1 — Messaging** | host participant-gated direct/rfq_clarification threads + messages | Thread (`threads` + `messages` + `thread_participants`) | **HA-4.1** |
| **BC-COMM-2 — Notifications** | derive + deliver in-app notifications from consumed §8 events | Notification (`notifications`) | **HA-4.2** |
| **BC-COMM-3 — Delivery Tracking** | record outbound channel delivery + status | Outbound Log (single aggregate; channel structures `email_logs`/`sms_logs`/`whatsapp_logs`) | **HA-4.3** |
| **BC-COMM-4 — Support Communications** | user↔platform-staff support tickets + ticket messages | Support Ticket (`support_tickets` + `ticket_messages`) | **HA-4.4** |

**Responsibilities (per BC):** BC-COMM-1 — thread/message/participant management + RFQ-clarification hosting (RFQ-owned scrub rule read+applied, DH-3). BC-COMM-2 — notification creation (from `source_event_id`), read/archive, channel fan-out orchestration per Identity-owned notification rules. BC-COMM-3 — outbound dispatch logging + delivery-status tracking + retry. BC-COMM-4 — ticket lifecycle + ticket-message append + Support-Admin staff access. **No bounded context modified from the frozen structure.**

---

## HA-3 — Aggregate Inventory

Per the frozen `Doc-4H_Structure_v1.0_FROZEN` §H5/§H9 — 4 aggregates (Doc-2 §2 Module 6), each in exactly one BC; **no ownership change**.

| Aggregate | Owning BC | Purpose | Ownership rationale (Doc-2 pointer) |
|---|---|---|---|
| **Thread** — root `threads`; children `messages`, `thread_participants`; VO ThreadContext (direct/rfq_clarification; context_id) | BC-COMM-1 | participant-gated conversation threads + messages | Doc-2 §2 Module 6; §3.7/§10.7 (shared by participants via grant) |
| **Notification** — root `notifications`; VO Channel/Payload | BC-COMM-2 | recipient-scoped in-app notifications derived from `source_event_id` | Doc-2 §2 Module 6; §3.7/§10.7 (tenant-owned recipient org) |
| **Outbound Log** — single aggregate root; channel structures `email_logs`/`sms_logs`/`whatsapp_logs`; VO DeliveryStatus | BC-COMM-3 | outbound channel delivery records + status (one aggregate, per-channel structures) | Doc-2 §2 Module 6; §3.7/§10.7 (platform-owned, append-only) |
| **Support Ticket** — root `support_tickets`; child `ticket_messages` | BC-COMM-4 | user↔platform-staff support records | Doc-2 §2 Module 6 (ASSUMPTION A-04); §3.7/§10.7 (tenant-owned + staff access) |

**No aggregate added beyond the Doc-2 §2 Module-6 set; no aggregate in two contexts; Communication Preferences is Identity-owned (consumed read-only, DH-1), not a Module-6 aggregate.**

---

## HA-4 — Contract Inventory

### HA-4.1 — BC-COMM-1 Messaging (Thread aggregate)

> Binds Doc-2 §3.7/§10.7 (`threads`/`messages`/`thread_participants`), Doc-3 (rfq_clarification channel; RFQ-owned scrub rule, DH-3). Threads are **shared by participants via grant**.

#### `comm.create_thread.v1` — Create Thread · 21.4 Command · Actor: User
- **Purpose:** open a `direct` or `rfq_clarification` thread (context_id = `rfq_id` for clarification). **Owning BC:** BC-COMM-1. **Aggregate:** Thread (`threads`). **Permission family:** `can_use_messaging` (Doc-2 §7). **Lifecycle:** creates `threads` at `open` (Doc-2 §3.7). **Audit:** `[ESC-COMM-AUDIT]` (no §9 Communication action; nearest by pointer). **Events:** none emitted (B.6); none consumed. **Cross-Module:** Identity participant resolution (DH-1); RFQ clarification-context reference + scrub-rule read by service (DH-3); Platform Core (DH-8). **Sources:** Doc-2 §3.7/§10.7; Doc-3 (clarification channel).

#### `comm.get_thread.v1` · `comm.list_threads.v1` — Thread Reads · 21.3 Query · Actor: User
- **Purpose:** read a thread head / list the actor's participant threads. **Owning BC:** BC-COMM-1. **Aggregate:** Thread. **Permission family:** `can_use_messaging`; participant-scoped (`thread_participants` grant). **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Identity (DH-1). **Sources:** Doc-2 §6/§10.7 (shared-by-participants).

#### `comm.send_message.v1` — Send Message · 21.4 Command · Actor: User
- **Purpose:** append a message to a thread (append-only; soft-delete = hidden); on an `rfq_clarification` thread the RFQ-owned scrub rule is read via the RFQ service (DH-3) and applied content-side at write. **Owning BC:** BC-COMM-1. **Aggregate:** Thread (`messages`). **Permission family:** `can_use_messaging`; participant-scoped. **Lifecycle:** appends a `messages` row (Doc-2 §3.7 append-only). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none emitted (B.6 — message send is not a Doc-2 §8 event; notification of the recipient is a Notifications effect, HA-4.2). **Cross-Module:** RFQ scrub-rule read by service (DH-3, content-side; no procurement decision); Platform Core Realtime/audit (DH-8). **Sources:** Doc-2 §3.7/§10.7; Doc-3 (scrub rule, RFQ-owned).

#### `comm.get_messages.v1` — Get Messages · 21.3 Query · Actor: User
- **Purpose:** read a thread's messages (participant-scoped; soft-deleted hidden). **Owning BC:** BC-COMM-1. **Aggregate:** Thread (`messages`). **Permission family:** `can_use_messaging`; participant-scoped. **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Platform Core (DH-8). **Sources:** Doc-2 §6/§10.7.

#### `comm.add_thread_participant.v1` · `comm.remove_thread_participant.v1` — Participant Grant · 21.4 Command · Actor: User
- **Purpose:** grant/remove thread access (`thread_participants` grant). **Owning BC:** BC-COMM-1. **Aggregate:** Thread (`thread_participants`). **Permission family:** `can_use_messaging` (thread owner/authorized participant). **Lifecycle:** `thread_participants` `active → removed` (Doc-2 §3.7/§10.7). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Identity participant resolution (DH-1). **Sources:** Doc-2 §3.7/§10.7.

#### `comm.close_thread.v1` — Close Thread · 21.4 Command · Actor: User
- **Purpose:** close a thread. **Owning BC:** BC-COMM-1. **Aggregate:** Thread (`threads`). **Permission family:** `can_use_messaging`. **Lifecycle:** `threads` `open → closed` (Doc-2 §3.7). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Platform Core (DH-8). **Sources:** Doc-2 §3.7/§10.7.

### HA-4.2 — BC-COMM-2 Notifications (Notification aggregate)

> Binds Doc-2 §3.7/§10.7 (`notifications`), §8 (consumed events), Doc-4C (notification preferences/rules, read — DH-1). Notifications are **derived from authoritative state; never the source of truth** (Doc-4A §4A).

#### `comm.create_notification.v1` — Create Notification (consumed-event effect) · 21.5 System · Actor: System
- **Purpose:** on a consumed Doc-2 §8 event (§B.6 enumeration), create the in-app `notifications` row (recipient-scoped; `source_event_id` = the inbound event), then orchestrate channel fan-out (in-app + email/SMS/WhatsApp via BC-COMM-3) per the Identity-owned notification rules. **Owning BC:** BC-COMM-2. **Aggregate:** Notification (`notifications`). **Permission family:** none (System actor; no active org context — Doc-4A §5.2/§15.5). **Lifecycle:** creates `notifications` at `unread` (Doc-2 §3.7). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** **consumes** the §8 catalog events (B.6 — producing module owns the event; Communication owns the notification effect, idempotent §16); **emits none**. **Cross-Module:** every producing module's §8 events (DH-2…DH-7); Identity notification preferences/rules read (DH-1); Platform Core outbox/audit (DH-8). **Sources:** Doc-2 §8/§10.7; Doc-4A §4.4/§16; Doc-4C notification rules.

#### `comm.get_notification.v1` · `comm.list_notifications.v1` — Notification Reads · 21.3 Query · Actor: User
- **Purpose:** read one / list the recipient's notifications. **Owning BC:** BC-COMM-2. **Aggregate:** Notification. **Permission family:** recipient-scoped (no distinct §7 read slug → `[ESC-COMM-SLUG]` if later required). **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Identity (DH-1). **Sources:** Doc-2 §6/§10.7.

#### `comm.mark_notification_read.v1` · `comm.archive_notification.v1` — Notification State · 21.4 Command · Actor: User
- **Purpose:** mark a notification read / archive it. **Owning BC:** BC-COMM-2. **Aggregate:** Notification (`notifications`). **Permission family:** recipient-scoped. **Lifecycle:** `notifications` `unread → read → archived` (Doc-2 §3.7). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Identity (DH-1). **Sources:** Doc-2 §3.7/§10.7.

### HA-4.3 — BC-COMM-3 Delivery Tracking (Outbound Log aggregate)

> Binds Doc-2 §10.7 (`email_logs`/`sms_logs`/`whatsapp_logs`, the single Outbound Log aggregate's channel structures). **Append-only logs; transports, does not decide.** Push is delivery-only (Doc-4A §4A).

#### `comm.create_delivery_record.v1` — Create Delivery Record (dispatch) · 21.5 System · Actor: System
- **Purpose:** on a notification fan-out, write the outbound channel delivery record (`email_logs`/`sms_logs`/`whatsapp_logs`) at `queued` and dispatch to the channel provider. **Owning BC:** BC-COMM-3. **Aggregate:** Outbound Log. **Permission family:** none (System job). **Lifecycle:** creates the channel-structure row at `queued` (Doc-2 §10.7). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none emitted/consumed (the trigger is the BC-COMM-2 fan-out, internal). **Cross-Module:** external channel providers (infra; delivery); Platform Core (DH-8). **Sources:** Doc-2 §10.7.

#### `comm.update_delivery_status.v1` — Update Delivery Status · 21.5 System · Actor: System
- **Purpose:** advance delivery status on provider callback (`queued → sent → delivered | failed`), capturing `provider_ref`. **Owning BC:** BC-COMM-3. **Aggregate:** Outbound Log. **Permission family:** none (System). **Lifecycle:** `queued → sent → delivered | failed` (Doc-2 §10.7). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** channel providers (infra); Platform Core (DH-8). **Sources:** Doc-2 §10.7.

#### `comm.retry_delivery.v1` — Retry Delivery · 21.5 System · Actor: System
- **Purpose:** retry a `failed` outbound delivery (per retry/backoff POLICY — `[ESC-COMM-POLICY]` if absent). **Owning BC:** BC-COMM-3. **Aggregate:** Outbound Log. **Permission family:** none (System). **Lifecycle:** `failed → queued` re-dispatch (Doc-2 §10.7; no new state). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** channel providers (infra); Platform Core (DH-8). **Sources:** Doc-2 §10.7; Doc-3 §12.2 (`[ESC-COMM-POLICY]`).

#### `comm.get_delivery_status.v1` — Get Delivery Status · 21.3 Query · Actor: User / Admin
- **Purpose:** read delivery status for an outbound record. **Owning BC:** BC-COMM-3. **Aggregate:** Outbound Log. **Permission family / access scope (governing escalation marker `[ESC-COMM-SLUG]` — no slug invented):** **Recipient (User):** may read **own delivery records only** (records whose recipient is the active org/user); **Support Staff (Admin):** **`staff_can_support`** (Doc-2 §7) may read delivery records (§5.6, no active org context); **cross-tenant access: prohibited**. **Protected-fact rule:** unauthorized access → **`NOT_FOUND`** (Doc-4A §12.4/§7.5 protected-fact collapse; existence not disclosed). **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Platform Core (DH-8); Identity scope/`staff_can_support` (DH-1). **Sources:** Doc-2 §10.7; Doc-2 §7 (`staff_can_support`); Doc-4A §7.5/§12.4; carried `[ESC-COMM-SLUG]` (Doc-2 §7 additive — recipient-read slug, if a distinct one is later required).

### HA-4.4 — BC-COMM-4 Support Communications (Support Ticket aggregate)

> Binds Doc-2 §3.7/§10.7 (`support_tickets`/`ticket_messages`), ASSUMPTION A-04 (Module-6-owned; Support-Admin staff access).

#### `comm.create_ticket.v1` — Create Ticket · 21.4 Command · Actor: User
- **Purpose:** open a support ticket (subject/priority). **Owning BC:** BC-COMM-4. **Aggregate:** Support Ticket (`support_tickets`). **Permission family:** `can_raise_support_ticket` (Doc-2 §7). **Lifecycle:** creates `support_tickets` at `open` (Doc-2 §3.7). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Identity org-context (DH-1); Platform Core (DH-8). **Sources:** Doc-2 §3.7/§10.7; A-04.

#### `comm.update_ticket.v1` — Update Ticket (status/progress) · 21.4 Command · Actor: User / Admin
- **Purpose:** advance a support ticket per the Doc-2 §3.7 lifecycle. **Owning BC:** BC-COMM-4. **Aggregate:** Support Ticket. **Permission family / explicit actor→transition authority (Doc-2 §7; lifecycle unchanged):** **User (`can_raise_support_ticket`, own-org ticket only):** may add ticket messages and **close own ticket** (`resolved → closed`) — User performs no `open → in_progress` or `in_progress → resolved` transition. **Support Staff (`staff_can_support`, §5.6):** **`open → in_progress`**, **`in_progress → resolved`**, **`resolved → closed`**. **Lifecycle:** `open → in_progress → resolved → closed` (Doc-2 §3.7; no state added, sequence unchanged). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Identity + Support-Admin slug (DH-1). **Sources:** Doc-2 §3.7/§10.7; Doc-2 §7 (`can_raise_support_ticket`/`staff_can_support`).

#### `comm.add_ticket_message.v1` — Add Ticket Message · 21.4 Command · Actor: User / Admin
- **Purpose:** append a ticket message (append-only). **Owning BC:** BC-COMM-4. **Aggregate:** Support Ticket (`ticket_messages`). **Permission family:** `can_raise_support_ticket` (opener) / `staff_can_support` (staff). **Lifecycle:** appends `ticket_messages` (Doc-2 §10.7 append-only). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Identity (DH-1). **Sources:** Doc-2 §10.7.

#### `comm.close_ticket.v1` — Close Ticket · 21.4 Command · Actor: User / Admin
- **Purpose:** close a resolved ticket (terminal). **Owning BC:** BC-COMM-4. **Aggregate:** Support Ticket. **Permission family:** `can_raise_support_ticket` / `staff_can_support`. **Lifecycle:** `resolved → closed` (Doc-2 §3.7; terminal). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Identity (DH-1). **Sources:** Doc-2 §3.7/§10.7.

#### `comm.get_ticket.v1` · `comm.list_tickets.v1` — Ticket Reads · 21.3 Query · Actor: User / Admin
- **Purpose:** read one / list tickets (own-org for User; staff scope for Support-Admin). **Owning BC:** BC-COMM-4. **Aggregate:** Support Ticket. **Permission family:** `can_raise_support_ticket` (own-org) / `staff_can_support` (staff). **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Identity (DH-1). **Sources:** Doc-2 §6/§10.7.

---

## HA-5 — Permission Surface (Pass-A consolidation)

Three-layer check (active Membership + Permission Slug + Resource Scope) resolved via Identity `check_permission` (consumed; no shadow authorization). **Slugs (Doc-2 §7; none invented):**

| Permission family | Space | Actor | Contracts | Ownership boundary |
|---|---|---|---|---|
| `can_use_messaging` | tenant (all active members; via `thread_participants`) | User | all BC-COMM-1 contracts | thread participation only; owns no RFQ decision |
| recipient-scope (notifications) | tenant (recipient user/org) | User | BC-COMM-2 reads + state (`[ESC-COMM-SLUG]` if a distinct slug is later required) | recipient's own notifications only |
| (System) | platform (no active org) | System | `create_notification`, `create_delivery_record`, `update_delivery_status`, `retry_delivery` | consumer/job effects on Communication's own entities only |
| delivery-status read (`comm.get_delivery_status.v1`) — governing marker `[ESC-COMM-SLUG]` (no slug invented) | tenant (recipient) / platform-staff | User / Admin | `comm.get_delivery_status.v1` | **Recipient:** own delivery records only; **Support Staff:** `staff_can_support` (Doc-2 §7) may read delivery records; **cross-tenant prohibited**; unauthorized → `NOT_FOUND` (Doc-4A §7.5/§12.4) |
| `can_raise_support_ticket` | tenant (all active members) | User | BC-COMM-4 user-side | own-org tickets |
| `staff_can_support` | platform-staff (§5.6; Support Admin) | Admin | BC-COMM-4 staff handling | Support Admin; **no private-RFQ read** (Doc-2 §7) |

Notification read/archive carries `[ESC-COMM-SLUG]` only if a distinct §7 slug is later required; outbound-delivery logging is System-actor. **No role bundle authored** (Identity-seeded); **no slug invented** (§6.4).

---

## HA-6 — Lifecycle Inventory (Pass-A consolidation)

Per the frozen `Doc-4H_Structure_v1.0_FROZEN` §H13 (Doc-2 §3.7/§10.7) — inventory only; no state-machine hardening (Pass-B).

| Aggregate | Lifecycle (state inventory) | Terminal state(s) |
|---|---|---|
| Thread (`threads`) | `open → closed` | `closed` |
| Thread — `messages` | append-only (soft-delete = hidden) | n/a (append-only) |
| Thread — `thread_participants` | `active → removed` | `removed` |
| Notification (`notifications`) | `unread → read → archived` | `archived` |
| Outbound Log (`email_logs`/`sms_logs`/`whatsapp_logs`) | `queued → sent → delivered | failed` (append-only records) | `delivered`, `failed` |
| Support Ticket (`support_tickets`) | `open → in_progress → resolved → closed` *(actor→transition, Doc-2 §7: Support Staff `staff_can_support` drives `open → in_progress`, `in_progress → resolved`, `resolved → closed`; User `can_raise_support_ticket` may `resolved → closed` on own-org ticket only — lifecycle/sequence unchanged, no state added)* | `closed` |
| Support Ticket — `ticket_messages` | append-only | n/a (append-only) |

**No lifecycle defined or redefined; the machines are exactly the Doc-2 §3.7/§10.7 set.**

---

## HA-7 — Event Inventory (Pass-A consolidation)

**Emitted (Doc-2 §8):** **NONE.** Communication produces no Doc-2 §8 domain event (single-authorship — emitters own event production; Communication owns consumer/fan-out effects; Doc-4A §16.4 — no event coined). *(If a Communication-emitted event is ever required: `[ESC-COMM-EVENT]` → Doc-2 §8 additive; none exists today.)*

**Consumed (Doc-2 §8; idempotent — Doc-4A §16; → `comm.create_notification.v1` / BC-COMM-2 fan-out):**

| Producer (owner) | Events |
|---|---|
| RFQ (Doc-4E) | `RFQCreated`, `RFQSubmitted`, `RFQApproved`, `RFQClosedWon`, `RFQClosedLost`, `RFQMatched`, `RFQRouted`, `VendorInvited`, `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected` |
| Marketplace (Doc-4D) | `VendorClaimed`, `VendorSuspended`, `VendorTierChanged[declared]`, `ProfileThemeChanged`, `ProfileLayoutChanged`, `ProfilePublished`, `ProfileUnpublished`, `MicrositePublished`, `MicrositeDomainChanged`, `VendorOwnershipTransferred` |
| Trust (Doc-4G) | `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen` |
| Operations (Doc-4F) | `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` |
| Admin (Doc-4J) | `VendorBanned` |
| Billing (Doc-4I) | `SubscriptionPurchased`, `SubscriptionRenewed`, `SubscriptionExpired` |

**Event owner = the producing module** for every row; **Communication owns the notification/delivery effect only** (its own consumer). `VendorInvited` is co-consumed independently by Operations (vendor_leads creation). **No event invented; events absent from Doc-2 §8 are not added; the delivery integration is the emitter's (§4.4).**

---

## HA-8 — Dependency Inventory (Pass-A consolidation)

Per the frozen `Doc-4H_Structure_v1.0_FROZEN` §H8/§H15 — DH-1…DH-8 carried, not resolved.

| Marker | Owner (module) | Direction | Purpose |
|---|---|---|---|
| **DH-1** | Identity (Doc-4C, FROZEN) | consume | org/user/membership/active-org resolution, `check_permission`, `staff_can_support`, notification preferences/rules (read) |
| **DH-2** | Marketplace (Doc-4D, FROZEN) | consume (events) | consume Marketplace §8 events for fan-out; vendor data by UUID context only; own no vendor data |
| **DH-3** | RFQ (Doc-4E, FROZEN) | consume (events) + read (rule) | consume RFQ §8 events for fan-out; host rfq_clarification thread; **read RFQ-owned scrub rule by service, apply content-side** (no ownership transfer; no procurement decision) |
| **DH-4** | Operations (Doc-4F, FROZEN) | consume (events) | consume Operations §8 events for party fan-out; own no Operations entity |
| **DH-5** | Trust (Doc-4G, FROZEN) | consume (events) | consume Trust §8 events for fan-out; **compute/own no score** (firewall) |
| **DH-6** | Billing (Doc-4I) | consume (events) | consume Billing §8 events for fan-out; make no Billing decision; no paid-plan gating of delivery touching trust/eligibility |
| **DH-7** | Admin (Doc-4J) | consume (events) | consume Admin §8 events for fan-out; the moderation/ban decision is Admin's |
| **DH-8** | Platform Core (Doc-4B, FROZEN) | consume | audit-write, outbox-write/dispatch, UUIDv7 + human-ref, POLICY, feature flags, Realtime backing |

**No ownership transfer in any direction; no dependency resolved here (carried as DH-*); no integration contract authored on an emitter's behalf (single-authorship).**

---

## HA-9 — Audit Inventory (Pass-A consolidation)

All audited mutations bind via Doc-4B `core.append_audit_record.v1` (in-transaction); reads not audited (§17.1).

**Doc-2 §9 enumerates no separate Communication / Thread / Message / Notification / Delivery / Support-Ticket audit domain** → **every BC-COMM mutation carries `[ESC-COMM-AUDIT]`** (interim: nearest enumerated §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**). Audit ownership = Communication (its own mutations); the audit-action *registration* is the principal Module-6 escalation.

| Contract group | Audit domain | Audit ownership | Audit requirement |
|---|---|---|---|
| BC-COMM-1 mutations (create/close thread, send message, participant grant/remove) | `[ESC-COMM-AUDIT]` (Doc-2 §9 additive) | Communication | yes (every mutation) |
| BC-COMM-2 mutations (create notification, mark read, archive) | `[ESC-COMM-AUDIT]` | Communication | yes |
| BC-COMM-3 mutations (create/update/retry delivery) | `[ESC-COMM-AUDIT]` | Communication | yes |
| BC-COMM-4 mutations (create/update/close ticket, add ticket message) | `[ESC-COMM-AUDIT]` | Communication | yes |
| all reads | — | n/a | no (reads not audited, §17.1) |

---

## HA-10 — Escalation Inventory (Pass-A consolidation)

Carried unchanged from the frozen structure; resolved only via owning-document channels (additive; do not reopen the frozen structure).

- **`[ESC-COMM-AUDIT]`** (Doc-2 §9 additive) — every Communication mutation (no §9 Communication domain enumerated); nearest §9 action bound by pointer; **no audit action invented**.
- **`[ESC-COMM-POLICY]`** (Doc-3 §12.2 additive) — Communication runtime tunables absent from Doc-3 §12.2 (notification dedup window, channel retry/backoff, rate limits); reference an existing key by name; **no key invented**.
- **`[ESC-COMM-SLUG]`** (Doc-2 §7 additive) — only if a required action lacks a §7 slug (e.g., a distinct notification-read slug); **no slug invented**.
- **`[ESC-COMM-EVENT]`** (Doc-2 §8 additive) — Communication produces no §8 event today; if a Communication-emitted domain event is ever required, carry the marker; **never coin an event in Doc-4H**.

**Carried, never resolved here, never renamed, never reinterpreted.**

---

## HA-11 — AI-Agent Notes (Pass-A consolidation)

- **Ownership boundaries:** Communication owns only the four delivery/interaction aggregates (Thread, Notification, Outbound Log, Support Ticket), each in exactly one BC (HA-2/HA-3); every contract has an explicit owning BC + aggregate + actor + permission family (HA-4/HA-5); business authority remains with the originating module.
- **Communication neutrality:** Communication **transports, never decides/approves/scores/evaluates/ranks/routes/matches/selects/awards**. Notifications are **derived from authoritative DB state**; push/email/SMS/WhatsApp are **delivery channels only, never the source of truth, and never substitute for the owning module's Query** (Doc-4A §4A).
- **Dependency restrictions:** consume Identity (DH-1), the producing modules' §8 events (DH-2…DH-7), and Platform Core (DH-8) by pointer; own no other module's entity; on rfq_clarification threads, read the RFQ-owned scrub rule by service and apply content-side (DH-3) — ownership stays RFQ.
- **Event restrictions:** **produce no Doc-2 §8 event** (single-authorship — emitters own event production; Communication owns consumer/fan-out effects); consume the §8 catalog idempotently (Doc-4A §16); coin no event (escalate via `[ESC-COMM-EVENT]`).
- **Procurement-moat protection:** Communication absorbs **no** matching/routing/ranking/quotation-evaluation/supplier-selection/award (RFQ/Doc-4E); it references RFQ context by UUID only and makes no procurement decision.
- **Trust-firewall protection:** Communication computes/owns **no** Trust/Performance/Verification/Governance score (Trust/Doc-4G); it consumes Trust outputs (events) for notification text only; a paid plan never gates delivery in a way touching trust/verification/eligibility/routing/matching (Doc-4A §4B).
- **No event/slug/audit-action/POLICY-key invention** — escalate via DH / `[ESC-COMM-*]`. Audience: Claude Code, Cursor, OpenAI Codex, backend, frontend, QA.

---

## Appendix A — Module 6 Contract Inventory (Pass-A)

| # | Contract-ID | Name | Owning BC | Aggregate | Operation (template) | Actor | Permission family |
|---|---|---|---|---|---|---|---|
| 1 | `comm.create_thread.v1` | Create Thread | BC-COMM-1 | Thread (`threads`) | 21.4 Command | User | `can_use_messaging` |
| 2 | `comm.get_thread.v1` / `comm.list_threads.v1` | Thread reads | BC-COMM-1 | Thread | 21.3 Query | User | `can_use_messaging` |
| 3 | `comm.send_message.v1` | Send Message | BC-COMM-1 | Thread (`messages`) | 21.4 Command | User | `can_use_messaging` |
| 4 | `comm.get_messages.v1` | Get Messages | BC-COMM-1 | Thread (`messages`) | 21.3 Query | User | `can_use_messaging` |
| 5 | `comm.add_thread_participant.v1` / `comm.remove_thread_participant.v1` | Participant grant | BC-COMM-1 | Thread (`thread_participants`) | 21.4 Command | User | `can_use_messaging` |
| 6 | `comm.close_thread.v1` | Close Thread | BC-COMM-1 | Thread (`threads`) | 21.4 Command | User | `can_use_messaging` |
| 7 | `comm.create_notification.v1` | Create Notification (event consumer) | BC-COMM-2 | Notification (`notifications`) | 21.5 System | System | none (System) |
| 8 | `comm.get_notification.v1` / `comm.list_notifications.v1` | Notification reads | BC-COMM-2 | Notification | 21.3 Query | User | recipient-scope (`[ESC-COMM-SLUG]`) |
| 9 | `comm.mark_notification_read.v1` / `comm.archive_notification.v1` | Notification state | BC-COMM-2 | Notification (`notifications`) | 21.4 Command | User | recipient-scope |
| 10 | `comm.create_delivery_record.v1` | Create Delivery Record | BC-COMM-3 | Outbound Log | 21.5 System | System | none (System) |
| 11 | `comm.update_delivery_status.v1` | Update Delivery Status | BC-COMM-3 | Outbound Log | 21.5 System | System | none (System) |
| 12 | `comm.retry_delivery.v1` | Retry Delivery | BC-COMM-3 | Outbound Log | 21.5 System | System | none (System) |
| 13 | `comm.get_delivery_status.v1` | Get Delivery Status | BC-COMM-3 | Outbound Log | 21.3 Query | User / Admin | Recipient: own records only · Support Staff: `staff_can_support` · cross-tenant prohibited · unauthorized → `NOT_FOUND` · `[ESC-COMM-SLUG]` (recipient-read slug) |
| 14 | `comm.create_ticket.v1` | Create Ticket | BC-COMM-4 | Support Ticket (`support_tickets`) | 21.4 Command | User | `can_raise_support_ticket` |
| 15 | `comm.update_ticket.v1` | Update Ticket | BC-COMM-4 | Support Ticket | 21.4 Command | User / Admin | `can_raise_support_ticket` / `staff_can_support` |
| 16 | `comm.add_ticket_message.v1` | Add Ticket Message | BC-COMM-4 | Support Ticket (`ticket_messages`) | 21.4 Command | User / Admin | `can_raise_support_ticket` / `staff_can_support` |
| 17 | `comm.close_ticket.v1` | Close Ticket | BC-COMM-4 | Support Ticket | 21.4 Command | User / Admin | `can_raise_support_ticket` / `staff_can_support` |
| 18 | `comm.get_ticket.v1` / `comm.list_tickets.v1` | Ticket reads | BC-COMM-4 | Support Ticket | 21.3 Query | User / Admin | `can_raise_support_ticket` / `staff_can_support` |

*Skeleton inventory — working contract names (Doc-4A §21 namespace `comm_`). Pass-B finalizes per-Contract-ID payloads, validation order, error codes, and any contract split. No contract instantiated beyond this Pass-A record. No 21.2 (Integration) contract appears — the emitter authors event-delivery integration (§4.4). Communication produces no Doc-2 §8 domain event.*

---

## Appendix B — Carried Markers (Pass-A; UNCHANGED)

**DH-1** (Identity), **DH-2** (Marketplace), **DH-3** (RFQ — events + scrub-rule read), **DH-4** (Operations), **DH-5** (Trust — firewall), **DH-6** (Billing), **DH-7** (Admin), **DH-8** (Platform Core); `[ESC-COMM-AUDIT]` (Doc-2 §9 additive — every Communication mutation), `[ESC-COMM-POLICY]` (Doc-3 §12.2 additive — dedup/retry/rate keys), `[ESC-COMM-SLUG]` (Doc-2 §7 additive — notification-read slug), `[ESC-COMM-EVENT]` (Doc-2 §8 additive — none today). **Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen the frozen structure.

---

*End of Doc-4H — Communication Engine — Content Pass-A v1.0. Authored against `Doc-4H_Structure_v1.0_FROZEN` (sole structure authority; §H1–§H17 as amended by `Doc-4H_Structure_Patch_v0.1`). Module 6 (`communication` schema, `comm_` namespace) operationalizes 4 bounded contexts (BC-COMM-1 Messaging · BC-COMM-2 Notifications · BC-COMM-3 Delivery Tracking · BC-COMM-4 Support Communications) owning 4 aggregates (Doc-2 §2 — Thread, Notification, Outbound Log, Support Ticket), each in exactly one context; 18 contract records. Every contract bound by pointer to the frozen corpus; no entity, state, permission slug, event, audit action, POLICY key, or template invented. **Communication produces NO Doc-2 §8 domain event** (single-authorship; consumer/fan-out only); consumed events are the Doc-2 §8 catalog of every producing module → BC-COMM-2 fan-out. Slugs `can_use_messaging`/`can_raise_support_ticket`/`staff_can_support` (Doc-2 §7) only; every mutation carries `[ESC-COMM-AUDIT]` (Doc-2 §9 enumerates no Communication domain). Carried markers DH-1…DH-8, `[ESC-COMM-AUDIT]`/`[ESC-COMM-POLICY]`/`[ESC-COMM-SLUG]`/`[ESC-COMM-EVENT]` unchanged. Communication neutrality, the procurement moat, and the trust firewall are preserved; Communication transports, never decides; business authority remains with the originating modules; nothing invented. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Authorized next stage after Hard Review → Pass-A Patch → Patch Verification: Doc-4H Pass-B.*
