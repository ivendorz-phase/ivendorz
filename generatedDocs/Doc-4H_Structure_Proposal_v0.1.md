# Doc-4H — Communication Engine — API & Integration Contracts — Structure Proposal v0.1

| Field | Value |
|---|---|
| Document | Doc-4H — **Structure Proposal v0.1** — canonical Table of Contents proposal for Module 6 — Communication (`communication` schema, `comm_` namespace) — the **delivery & interaction layer** |
| Status | **Structure Proposal — pre-freeze.** Defines the complete Module-6 structure (bounded contexts, aggregates, events, dependencies, maps) before contract authoring. **Not Pass-A; not Pass-B.** Next stage: Independent Hard Review → Structure Patch → Structure FROZEN → Pass-A. |
| Module | Module 6 — Communication (`communication` schema) — the **delivery and interaction layer**; transports information, owns no business authority |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G v0.1 (proposed) — Doc-4A…4F FROZEN |
| Family-map basis | Doc-4A §1.3: **Doc-4H = Communication (Module 6)**; Appendix B namespace `comm_` (communication) |
| Contains | Structure only — section, bounded-context purpose/ownership/aggregates/services/dependencies, maps. **No contracts, commands, queries, payloads, API definitions, validation matrices, state-machine details, audit actions, or events beyond the structure-level production/consumption maps.** |
| Audience | Doc-4H content-pass authors; Claude Code / Cursor / backend / frontend / QA / AI coding agents |

**Family-map confirmation (recorded).** **Doc-4H = Communication (Module 6, `communication` schema)** — confirmed against Doc-4A §1.3, Doc-4A Appendix B (`comm_` → Doc-4H), Doc-2 §0.3 (`communication` = Module 6), and Context Pack v3 §3 (Module 6, `communication`). No family-map conflict; no flag-and-halt.

**Three governing rules shape this document** (inherited from Doc-4A §0.3; Doc-4D/4E/4F/4G precedent):

1. **Reference, never restate (Doc-4A §0.3).** Entity definitions (Doc-2 §3.7), state machines (Doc-2 §3.7/§10.7 lifecycles), permission slugs (Doc-2 §7), events (Doc-2 §8), audit actions (Doc-2 §9), and POLICY keys (Doc-3 §12.2) have owners; Doc-4H binds to them by pointer and copies none. This is a **structure** document — it names the section homes for those bindings; the content passes instantiate them.
2. **Consume frozen lower layers; redefine nothing.** Doc-4H consumes Doc-4A standards and the frozen services of **Doc-4B Platform Core** (audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags), **Doc-4C Identity** (org/membership/user resolution, `check_permission`, **the user `NotificationPreferences` VO and the org `notification_rules_jsonb` on `organization_workflow_settings` — both Identity-owned, consumed read-only for fan-out**), and the event-producing modules (**Doc-4D Marketplace, Doc-4E RFQ, Doc-4F Operations, Doc-4G Trust, Doc-4I Billing, Doc-4J Admin**) whose Doc-2 §8 events Communication consumes for notification dispatch — all by pointer.
3. **Structure only.** This document maps sections and bounded contexts; it instantiates no contract, command, query, payload, validation, state-machine detail, or audit action. Those are the content passes' work, authored against this structure once frozen.

**Communication-neutrality boundary (the delivery seam).** Module 6 is a **delivery and interaction layer**: it **transports** information and owns the conversation/notification/delivery/support artifacts (Thread, Notification, Outbound Log, Support Ticket). **Communication never decides, approves, scores, evaluates, ranks, routes, or awards** — business authority remains with the originating module. Per the integration **single-authorship rule (Doc-4A §4.4)**: the **emitting module authors event production**; **Communication authors notification dispatch/fan-out** (its own consumer effects on its own entities). Push/email/SMS/WhatsApp are **delivery channels only** — never an authoritative data source; a notification is derived from authoritative DB state and **MUST NOT** substitute for the owning module's Query (Doc-4A §4A push-channel rule). Communication owns **none** of: RFQ decisions/matching/routing/ranking/award (RFQ/Doc-4E); Trust/Performance/Verification/Governance scores (Trust/Doc-4G); Billing decisions (Billing/Doc-4I); workflow/business-approval decisions (Identity ORG settings / the originating module); procurement outcomes (RFQ/Operations); vendor data (Marketplace/Doc-4D). **A paid plan/entitlement/flag never gates message delivery in a way that touches trust/verification/eligibility/routing/matching** (Doc-4A §4B).

---

## §H1 — Module Overview

- **Purpose:** Establish Doc-4H as the contract document for **Module 6 — Communication only**, the delivery/interaction layer that transports information across the platform. State the schema (`communication`), the namespace (`comm_`), the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-4F → Doc-4G → Doc-4H), and the communication-neutrality seam.
- **Expected content scope:** Module identity (delivery & interaction layer of iVendorz); the `communication` schema and `comm_` namespace; the position in the module map (consumes the §8 events all modules emit, fans out notifications, hosts threads/support); the structure-only nature of this document; the conformed frozen corpus versions; the single-authorship rule (emitters author events, Communication authors fan-out).
- **Owned aggregates (Doc-2 §2, Module 6):** Thread, Notification, Outbound Log, Support Ticket.
- **Dependencies:** Doc-4A §0/§1.3/§4.4/Appendix B; Doc-2 §0.3, §2 (Module 6); Architecture §16 (module map), ADR-017 (module ownership); ASSUMPTION A-04 (support tickets are Module 6).
- **Excluded scope:** No business authority (no RFQ/Trust/Billing/workflow/approval/procurement decision); no module other than Module 6; no notification-preference ownership (Identity-owned, consumed read-only).

---

## §H2 — Business Objectives

- **Purpose:** State, once, the business purpose and strategic role of Module 6 within the platform positioning.
- **Expected content scope:** The delivery/interaction objectives the module serves — **messaging** (direct + RFQ-clarification threads, participant-gated; the sanctioned pre-award clarification channel, Doc-3), **notifications** (in-app notifications derived from the §8 events, fanned out per Identity-owned notification rules across in-app/email/SMS/WhatsApp), **delivery tracking** (outbound channel logs with delivery status), **support communications** (user↔platform-staff tickets). Strategic role: the connective layer that carries every module's signals to users **without becoming an authority** — preserving the procurement moat and trust firewall by transporting, never deciding. Maturity staging (Stage A→C) as it affects channel availability.
- **Dependencies:** Architecture (platform identity); Doc-3 (RFQ clarification channel = sanctioned, raw-contact scrubbed pre-award); Doc-2 §2 (Module 6 aggregates).
- **Excluded scope:** No business-decision logic; no re-derivation of architecture; no operating-number hardcoding (POLICY by key).

---

## §H3 — Bounded Context Landscape

- **Purpose:** Enumerate the bounded contexts **within** Module 6, each mapped to one or more owned aggregates; every planned contract lands in exactly one context (no aggregate in two contexts).
- **Expected content scope (candidate contexts, derived from the Doc-2 §2 Module-6 aggregates):**
  - **BC-COMM-1 — Messaging** (Thread aggregate): conversation threads (direct / rfq_clarification), their messages, and the `thread_participants` access grant.
  - **BC-COMM-2 — Notifications** (Notification aggregate): in-app notifications derived from consumed §8 events, recipient-scoped, with read/archive lifecycle.
  - **BC-COMM-3 — Delivery Tracking** (Outbound Log aggregate): the **single Outbound Log aggregate** whose channel-specific storage structures (`email_logs`/`sms_logs`/`whatsapp_logs`) record outbound delivery with queued→sent→delivered/failed status (one aggregate, multiple channel structures — not three aggregates).
  - **BC-COMM-4 — Support Communications** (Support Ticket aggregate): user↔platform-staff support tickets and their append-only ticket messages.
  - *(**Communication Preferences is NOT a Module-6 bounded context or aggregate** — see §H3 reconciliation note.)*
- **Dependencies:** Doc-2 §2 (Module 6 aggregates), §3.7 (entities); Doc-4D §D3 / Doc-4E §E3 / Doc-4F §F3 / Doc-4G §G3 (within-module context precedent).
- **Excluded scope:** No cross-module context ownership; no aggregate split across contexts; no notification-preference context (Identity-owned).

> **Recorded reconciliation — Communication Preferences (no Flag-and-Halt; frozen authority governs).** The Module-6 authoring brief lists "**Communication Preferences**" as an expected area. The **frozen corpus owns notification preferences in Identity (Module 1), not Communication:** the **user-level** `NotificationPreferences` (JSONB value object on `users`, Doc-2 §2/§3.2) and the **org-level** `notification_rules_jsonb` on `identity.organization_workflow_settings` (Doc-2 §10.2/§10.7; the ORG leg of FIXED/POLICY/ORG, "consumed by Module 6 for notifications" — Doc-4C Pass-B). Communication therefore **consumes these preferences read-only** when it fans out (DH-1 Identity) and **owns no preferences aggregate** — "Communication Preferences" is a **consumed reference, not a Module-6 bounded context.** Module 6 owns exactly four aggregates (Thread, Notification, Outbound Log, Support Ticket); **no preferences aggregate is introduced** (the brief's "do not invent business domains" instruction resolves to consuming the Identity-owned preferences).

---

## §H4 — Context Responsibilities

- **Purpose:** For each BC-COMM context, fix its responsibilities, internal ownership boundary, and the lifecycles it drives (by pointer to Doc-2 §3.7) — so content passes place each contract unambiguously.
- **Expected content scope (per context — purpose · ownership · aggregate list · service list · dependencies):**
  - **BC-COMM-1 Messaging** — *purpose:* host participant-gated threads + messages; *ownership:* `threads` (+`messages`, `thread_participants`); *services:* thread open/close, message send (append-only; soft-delete=hidden), participant grant/remove, RFQ-clarification thread hosting (context_id = `rfq_id`); *raw-contact-scrub seam (one mechanism):* on an `rfq_clarification` thread, BC-COMM-1 **reads the RFQ-owned scrub rule via the RFQ service (DH-3)** and **applies it content-side at message-write time** — the rule **definition is owned by RFQ/Doc-3** (Communication holds no copy, defines no scrub policy, and makes no procurement decision); *dependencies:* Identity (participant org/user resolution — DH-1), RFQ (clarification thread context reference + scrub-rule read — DH-3), Platform Core (audit/Realtime backing — DH-8). **Hosts the thread + applies the RFQ-owned rule; owns neither the rule nor any RFQ decision.**
  - **BC-COMM-2 Notifications** — *purpose:* derive + deliver in-app notifications from consumed §8 events; *ownership:* `notifications`; *services:* notification creation (from a `source_event_id`), read/archive, channel fan-out orchestration (in-app + email/SMS/WhatsApp via BC-COMM-3) per Identity-owned notification rules; *dependencies:* all event-producing modules (consume §8 events — DH-2…DH-7), Identity (notification preferences/rules read — DH-1), Platform Core (outbox consumption — DH-8). **Derives from authoritative state; never the source of truth.**
  - **BC-COMM-3 Delivery Tracking** — *purpose:* record outbound channel delivery; *ownership:* `email_logs`/`sms_logs`/`whatsapp_logs`; *services:* outbound dispatch logging, delivery-status tracking (queued→sent→delivered/failed), provider-ref capture; *dependencies:* external channel providers (delivery; infra), Platform Core (audit — DH-8). **Append-only logs; transports, does not decide.**
  - **BC-COMM-4 Support Communications** — *purpose:* user↔platform-staff support; *ownership:* `support_tickets` (+`ticket_messages`); *services:* ticket open/progress/resolve/close, ticket-message append, Support-Admin staff access; *dependencies:* Identity (org-context + Support-Admin `staff_can_support` — DH-1), Platform Core (audit — DH-8).
- **Dependencies:** Doc-2 §3.7 (entity lifecycles), §10.7 (blueprint); Doc-4A §4.4 (single-authorship); Doc-3 (clarification channel); ASSUMPTION A-04.
- **Excluded scope:** No business approval/decision (originating module); no score/evaluation/award; no notification-preference ownership.

---

## §H5 — Aggregate Inventory

- **Purpose:** Enumerate the four Module-6 aggregates (Doc-2 §2), each assigned to exactly one bounded context — the machine-readable ownership ledger for content passes.
- **Expected content scope (aggregate → root → children/value-objects → owning BC-COMM, by pointer to Doc-2 §2/§3.7):**
  - **Thread** — root `threads`; children `messages`, `thread_participants` (grant); VO ThreadContext (type: direct / rfq_clarification; context_id) → **BC-COMM-1**.
  - **Notification** — root `notifications`; VO Channel / Payload → **BC-COMM-2**.
  - **Outbound Log** — **single aggregate root `Outbound Log`**; `email_logs` / `sms_logs` / `whatsapp_logs` are **channel-specific storage structures owned by this one aggregate** (per channel: email/SMS/WhatsApp delivery records), not separate aggregate roots; VO DeliveryStatus → **BC-COMM-3**.
  - **Support Ticket** — root `support_tickets`; child `ticket_messages` → **BC-COMM-4**.
- **Dependencies:** Doc-2 §2 (Module 6 aggregate design), §3.7 (entity catalog), §10.7 (`communication` blueprint); ASSUMPTION A-04.
- **Excluded scope:** **No aggregate belongs to more than one context**; no aggregate added beyond the Doc-2 §2 Module-6 set (no preferences aggregate); no aggregate from another module.

---

## §H6 — Domain Service Inventory

- **Purpose:** Name the structure-level domain services per context (the service *surfaces*, not contracts) — so content passes know where each capability lands without inventing service names.
- **Expected content scope (service surface → owning BC-COMM; capability-level only, no contract IDs):** thread + message + participant service (BC-COMM-1); notification-derivation + read/archive + fan-out-orchestration service (BC-COMM-2); outbound-dispatch-logging + delivery-status service (BC-COMM-3); support-ticket + ticket-message service (BC-COMM-4). Each service consumes the frozen Doc-4B (audit/outbox/human-ref/POLICY/Realtime) and Doc-4C (`check_permission`, notification preferences/rules) services by pointer; the **notification-consumer effects** are authored here per single-authorship (emitters author event production).
- **Dependencies:** Doc-2 §3.7 (capabilities implied by entities); Doc-4B/Doc-4C (consumed services); Doc-4A §4.4/§16; Architecture §16.
- **Excluded scope:** No command/query/contract instantiated (content-pass work); no service that performs an RFQ/Trust/Billing decision, scoring, evaluation, or award; no shadow authorization/audit path; no notification-preference mutation (Identity-owned).

---

## §H7 — Communication Authority Matrix

- **Purpose:** State, explicitly, what Communication **decides/produces/consumes**, and the interaction boundary with each adjacent module — the structure-level guarantee that Communication never becomes a business authority.
- **Expected content scope:**
  - **Communication-owned decisions (delivery/interaction only):** thread open/close; message send/soft-delete; participant grant/remove; notification create/read/archive; channel fan-out orchestration (which channel, per Identity-owned rules); outbound delivery-status recording; support-ticket open/progress/resolve/close. **None of these is a business decision** — no approval, score, evaluation, ranking, routing, or award.
  - **Communication-produced outputs:** in-app `notifications` (derived from `source_event_id`); outbound channel deliveries (`email_logs`/`sms_logs`/`whatsapp_logs`); thread/message artifacts; support-ticket artifacts. **No domain event is produced by Communication in Doc-2 §8** (Communication is a consumer/fan-out layer — single-authorship; emitters own event production). *(Any future Communication-emitted event would require a Doc-2 §8 additive — `[ESC-COMM-EVENT]`; none exists today.)*
  - **Communication-consumed inputs (events; Doc-2 §8):** the §8 events of the producing modules, routed to Communication per the Doc-2 §8 consumer mapping — e.g., `VendorInvited` (RFQ → "Communication dispatch (notification fan-out: in-app/email/SMS/WhatsApp per org notification rules)"), and the notification-bearing events from Marketplace/RFQ/Operations/Trust/Billing/Admin; plus the Identity-owned notification preferences/rules (read).
  - **Interaction boundaries (counterpart → boundary rule):** **Identity (Doc-4C)** — consume org/user/membership resolution, `check_permission`, notification preferences/rules; author none. **Marketplace/RFQ/Operations/Trust/Billing/Admin** — consume their §8 events for fan-out; **author no business decision, no event of theirs, no score**; reference their entities by UUID only for notification context. **The originating module retains all business authority**; Communication transports.
  - **Communication MUST NEVER:** decide, approve, score, evaluate, rank, route, match, select a supplier, or award. **Push is delivery-only; never the source of truth.**
- **Dependencies:** Doc-4A §4.4 (single-authorship), §4A (push-channel rule), §4B (firewall); Doc-2 §8 (event ownership + consumers), §10.2/§10.7 (notification rules); Doc-3 (clarification channel).
- **Excluded scope:** No business decision/score/award absorbed; no event of another module authored; no notification-preference ownership.

---

## §H8 — External Dependency Map

- **Purpose:** State every cross-module dependency explicitly, with direction and consumption pattern (per Doc-4A §4 single-authorship, §4.4 integration) — the structure-level seam list the content passes bind to. Carried dependency markers **DH-* identified structurally — carried, not resolved here; analogous to Doc-4F `DF-*` / Doc-4G `DG-*`.**
  - **DH-1 — Identity boundary.** `organizations`/`memberships`/`users`/`check_permission`/`staff_*` and the **notification preferences** (`users.NotificationPreferences`, `organization_workflow_settings.notification_rules_jsonb`) are Identity's (Doc-4C, FROZEN). Communication consumes org/user/membership/active-org resolution, `check_permission`, the Support-Admin `staff_can_support` slug, and the notification preferences/rules (read) by pointer; authors/owns none. **Channel:** consume Doc-4C.
  - **DH-2 — Marketplace boundary.** Marketplace (Doc-4D, FROZEN) emits §8 events (profile/microsite/ad lifecycle, `VendorClaimed`/`VendorSuspended`, etc.). Communication **consumes** the notification-bearing ones for fan-out; references vendor data by UUID for context only; owns no vendor data. **Channel:** consume events.
  - **DH-3 — RFQ boundary (the moat seam).** RFQ (Doc-4E, FROZEN) emits §8 events and **owns the clarification-channel raw-contact-scrub rule** (Doc-3). Communication **consumes** the RFQ §8 notification events (§H11) for fan-out, **hosts** the rfq_clarification thread (context_id = `rfq_id`), and **reads the RFQ-owned scrub rule via the RFQ service and applies it content-side at message-write** — **the rule definition stays in RFQ; Communication holds no copy** and makes **no procurement decision**. **Channel:** consume events; host thread; **read RFQ scrub rule by service (no ownership transfer)**; no RFQ decision.
  - **DH-4 — Operations boundary.** Operations (Doc-4F, FROZEN) emits engagement/document events; Communication **consumes** the notification-bearing ones for party fan-out; owns no Operations entity. **Channel:** consume events.
  - **DH-5 — Trust boundary.** Trust (Doc-4G) emits `VendorVerified`/`TrustScoreUpdated`/`PerformanceScoreUpdated`/etc.; Communication **consumes** the notification-bearing ones for fan-out; **computes/owns no score**. **Channel:** consume events; firewall — no score.
  - **DH-6 — Billing boundary.** Billing (Doc-4I) emits subscription/invoice events; Communication **consumes** the notification-bearing ones for fan-out; **makes no Billing decision**; a paid plan never gates trust/eligibility delivery (firewall). **Channel:** consume events.
  - **DH-7 — Admin boundary.** Admin (Doc-4J) emits ban/moderation events; Communication **consumes** the notification-bearing ones for fan-out; the moderation/ban decision is Admin's. **Channel:** consume events.
  - **DH-8 — Platform Core boundary.** All `core.*` services (audit-write, outbox-write/dispatch, UUIDv7 + human-reference, POLICY, feature flags, Realtime backing) are Platform Core's (Doc-4B, FROZEN). Communication consumes them by pointer; re-implements none. **Channel:** consume Doc-4B services.
- **Dependencies:** Doc-4A §4/§4.4/§16; Doc-2 §8 (event ownership); Doc-4B/4C/4D/4E/4F (consumed, FROZEN); Doc-4G/4I/4J (event producers).
- **Excluded scope:** No ownership transfer in any direction; no dependency resolved here (carried as `DH-*`); no integration contract authored on the emitter's behalf (single-authorship); structure only.

---

## §H9 — Ownership Matrix

- **Purpose:** Fix the machine-readable ownership ledger — every Module-6 aggregate/entity to its owning BC-COMM, and every not-owned reference to its owning module — so no hidden, shared, or duplicate ownership survives into Pass-A.
- **Expected content scope:**
  - **Owned (Communication / `communication` schema), by Doc-2 §2/§3.7/§10.7 — one owning BC-COMM each:** `threads`(+`messages`/`thread_participants`) → BC-COMM-1; `notifications` → BC-COMM-2; **the Outbound Log aggregate (its channel-specific storage structures `email_logs`/`sms_logs`/`whatsapp_logs`)** → BC-COMM-3; `support_tickets`(+`ticket_messages`) → BC-COMM-4.
  - **NOT owned (reference by UUID / service / event only):** Identity entities + `check_permission` + `staff_*` + **notification preferences/rules** (Doc-4C — DH-1); Marketplace vendor data (Doc-4D — DH-2); `rfqs`/matching/award + clarification-scrub rule (Doc-4E — DH-3); `engagements`/post-award (Doc-4F — DH-4); `trust.*` scores/verification (Doc-4G — DH-5); `plans`/`entitlements`/invoices (Doc-4I — DH-6); `ban_actions`/moderation (Doc-4J — DH-7); all `core.*` (Doc-4B — DH-8).
  - **Tenancy class (Doc-2 §6/§10.7, by pointer):** `threads`/`messages`/`thread_participants` are **shared (participants by grant)**; `notifications` are **tenant-owned (recipient org)**; `email_logs`/`sms_logs`/`whatsapp_logs` are **platform-owned (append-only)**; `support_tickets`(+`ticket_messages`) are **tenant-owned + platform-staff access** (ASSUMPTION A-04).
- **Dependencies:** Doc-2 §2, §3.7, §6, §10.7; ASSUMPTION A-04.
- **Excluded scope:** **No shared ownership across BCs, no duplicate ownership, no hidden ownership**; no aggregate in two contexts; every ownership claim justified by a Doc-2 pointer; no preferences ownership.

---

## §H10 — Event Production Map

- **Purpose:** Structure the events Module 6 **produces** (Doc-2 §8, by pointer) — at structure level only.
- **Expected content scope:** **Communication produces NO domain event in the Doc-2 §8 catalog.** Per the integration single-authorship rule (Doc-4A §4.4) and the Doc-2 §8 ownership map, Communication is a **consumer / notification-fan-out** layer: emitting modules own event production; Communication owns its own consumer effects (notification creation, dispatch logging) on its own entities. Notification delivery is **not** a domain event — it is an effect derived from authoritative state. *(If a Communication-emitted domain event is ever required, it is a Doc-2 §8 additive carried under `[ESC-COMM-EVENT]` — none exists today; no event coined.)*
- **Dependencies:** Doc-2 §8 (event ownership map); Doc-4A §4.4/§16; Doc-4B outbox (consumed).
- **Excluded scope:** **No event coined** (Doc-2 §8 owns the catalog); Communication authors no other module's event production.

---

## §H11 — Event Consumption Map

- **Purpose:** Structure the events Module 6 **consumes** (Doc-2 §8, by pointer) — producer, consuming context, ownership direction — at structure level only; consumers are idempotent (Doc-4A §16).
- **Expected content scope (consumed event → producing module → consuming BC-COMM):**
  - **`VendorInvited`** (producer: RFQ / Doc-4E; fires only at invitation `delivered`) → **BC-COMM-2** dispatches the notification fan-out (in-app/email/SMS/WhatsApp per org notification rules; Doc-2 §8 primary consumer). **Co-consumed independently by Operations** (vendor_leads creation, Doc-4F BC-OPS-3) — the two consumers are independent and idempotent (Doc-4A §16); Communication owns only the notification effect (single-authorship).
  - **The Doc-2 §8 authoritative events consumed by BC-COMM-2 for notification fan-out** (Producer · Consumer BC · Ownership Direction — the producing module owns the event, Communication owns only the notification effect, single-authorship Doc-4A §4.4; no event invented):
    - **RFQ (Doc-4E) → BC-COMM-2:** `RFQCreated`, `RFQSubmitted`, `RFQApproved`, `RFQClosedWon`, `RFQClosedLost`, `RFQMatched`, `RFQRouted`, `VendorInvited` (the primary notification trigger — fan-out also stated above), `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected`.
    - **Marketplace (Doc-4D) → BC-COMM-2:** `VendorClaimed`, `VendorSuspended`, `VendorTierChanged[tier_type='declared']`, `ProfileThemeChanged`, `ProfileLayoutChanged`, `ProfilePublished`, `ProfileUnpublished`, `MicrositePublished`, `MicrositeDomainChanged`, `VendorOwnershipTransferred`.
    - **Trust (Doc-4G) → BC-COMM-2:** `VendorVerified`, `VendorTierChanged[tier_type='verified']`, `TrustScoreUpdated`, `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen`.
    - **Operations (Doc-4F) → BC-COMM-2:** `DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded`.
    - **Admin (Doc-4J) → BC-COMM-2:** `VendorBanned`.
    - **Billing (Doc-4I) → BC-COMM-2:** `SubscriptionPurchased`, `SubscriptionRenewed`, `SubscriptionExpired`.
    Ownership direction for every row: the **producing module owns the event**; **Communication owns the notification/delivery effect only** (its own idempotent consumer — Doc-4A §16). The precise per-event channel/recipient matrix binds to the Doc-2 §8 consumer mapping + Identity `notification_rules_jsonb` at content authoring. **These are the Doc-2 §8 catalog events verbatim — none invented; events absent from Doc-2 §8 are not added.**
  - *(Structure-level note — confirmed at content authoring against Doc-2 §8:)* the precise per-event notification matrix (which event → which channel/recipient) binds to the Doc-2 §8 consumer mapping + Identity `notification_rules_jsonb`; **no event coined**, no consumer logic authored for another module's effect.
- **Dependencies:** Doc-2 §8 (event catalog + primary consumers); Doc-4A §16 (idempotent consumer), §4.4 (single-authorship); Doc-4B outbox (consumed); Doc-4C notification rules (consumed).
- **Excluded scope:** **No event invented**; no consumer logic for events owned by other modules beyond Communication's own notification/delivery effect; the delivery integration consumer is Communication's, the event production is the emitter's (§4.4).

---

## §H12 — Permission Surface Map

- **Purpose:** Identify the high-level permission **families** the module's contracts will bind (Doc-2 §7, by pointer) — **not** endpoint permissions (Pass-A work).
- **Expected content scope (permission family → applicable BC-COMM; by pointer to Doc-2 §7):**
  - **Messaging family — `can_use_messaging`** (all active members; participation via `thread_participants`; Doc-2 §7) → BC-COMM-1 (thread/message participation).
  - **Support family — `can_raise_support_ticket`** (all active members; Doc-2 §7) → BC-COMM-4 (ticket creation/messaging). Platform-staff support access via the **Support-Admin `staff_can_support`** slug (Doc-2 §7; Support Admins hold no private-RFQ read).
  - **Notification read/archive** — recipient-scoped (the notification's recipient user/org); no distinct §7 slug enumerated for in-app notification read → carried under **`[ESC-COMM-SLUG]`** if a distinct slug is later required (Doc-2 §7 additive channel). **No slug invented.**
  - **Outbound delivery logging = system-actor** (the fan-out job writes `email_logs`/etc. under the System actor; no tenant slug).
- **Dependencies:** Doc-2 §7 (`can_use_messaging`, `can_raise_support_ticket`, `staff_can_support`); Doc-4A §6/§6B; Doc-4C (`check_permission`).
- **Excluded scope:** **No endpoint permission defined** (Pass-A); no slug invented; no role bundle authored (Identity-seeded).

---

## §H13 — State Machine Inventory

- **Purpose:** Inventory all Communication-owned state machines (Doc-2 §3.7/§10.7 lifecycles, by pointer) — **inventory only**, no contract or transition detail (Pass-A/Pass-B work).
- **Expected content scope (machine → owning aggregate/BC-COMM → source pointer):**
  - **Thread** — `threads`: `open → closed` — BC-COMM-1 (Doc-2 §3.7/§10.7).
  - **Message** — `messages`: **append-only** (soft delete = hidden) — BC-COMM-1 (Doc-2 §3.7/§10.7).
  - **Thread Participant** — `thread_participants`: `active → removed` (grant) — BC-COMM-1 (Doc-2 §3.7/§10.7).
  - **Notification** — `notifications`: `unread → read → archived` — BC-COMM-2 (Doc-2 §3.7/§10.7).
  - **Outbound Delivery** — the Outbound Log aggregate's channel-specific storage structures (`email_logs`/`sms_logs`/`whatsapp_logs`): `queued → sent → delivered | failed` (one delivery-status machine, append-only, applied per channel record) — BC-COMM-3 (Doc-2 §10.7).
  - **Support Ticket** — `support_tickets`: `open → in_progress → resolved → closed` — BC-COMM-4 (Doc-2 §3.7/§10.7).
  - **Ticket Message** — `ticket_messages`: **append-only** — BC-COMM-4 (Doc-2 §10.7).
- **Dependencies:** Doc-2 §3.7/§10.7 (lifecycles); Doc-4A §13 (state-machine standard, applied at Pass-A).
- **Excluded scope:** **No transition contract instantiated** (inventory only); no state/transition invented; the machines are exactly the Doc-2 §3.7/§10.7 set.

---

## §H14 — Escalation Inventory

- **Purpose:** Carry the structurally-identified escalation markers (`ESC-COMM-*` / `DH-*`) for gaps where the frozen corpus may lack a Module-6 binding — carried, never resolved here; analogous to Doc-4F `[ESC-OPS-*]` / Doc-4G `[ESC-TRUST-*]`.
- **Expected content scope:**
  - **`[ESC-COMM-AUDIT]`** — **Doc-2 §9 enumerates no separate Communication / Thread / Message / Notification / Delivery / Support-Ticket audit domain.** Any Communication mutation discovered during Pass-A lacking explicit Doc-2 §9 coverage MUST carry the marker and halt until resolved via the Doc-2 §9 additive channel (interim: nearest enumerated §9 action by pointer); **no audit action invented**. (Audit coverage for messaging/notification/support mutations is the principal Module-6 escalation.)
  - **`[ESC-COMM-POLICY]`** — any Communication runtime tunable requiring a POLICY key absent from Doc-3 §12.2 (e.g., notification dedup window, channel retry/backoff, rate limits). Reference an existing key by name; if absent, carry the marker — **never invent the key in Doc-4H**. **Channel:** Doc-3 §12.2 additive.
  - **`[ESC-COMM-SLUG]`** — Communication uses Doc-2 §7 `can_use_messaging`/`can_raise_support_ticket`/`staff_can_support`; if a content pass finds a required action lacks a §7 slug (e.g., a distinct notification-read slug), carry the marker — **no slug invented**. **Channel:** Doc-2 §7 additive.
  - **`[ESC-COMM-EVENT]`** — Communication produces no Doc-2 §8 event today; if a Communication-emitted domain event is ever required, carry the marker to the Doc-2 §8 additive channel — **never coin an event in Doc-4H**.
- **Dependencies:** Doc-2 §7/§8/§9 (slug/event/audit catalogs); Doc-3 §12.2 (POLICY); Doc-4A §6.4/§16.4/§17 (no-invention rules); Doc-4F/4G escalation-marker precedent.
- **Excluded scope:** No marker resolved here (carried only); no entity/slug/event/audit-action/POLICY-key invented; markers route to their owning-document channels.

---

## §H15 — Cross-Module Reference Inventory

- **Purpose:** State, per counterpart module, the references Communication holds (by UUID/service/event) and the boundary direction — the structure-level guarantee that no frozen ownership leaks into or out of Communication, with **no ownership transfer**.
- **Expected content scope (counterpart → reference → boundary rule, binding DH-1…DH-8):**
  - **Identity (Doc-4C, FROZEN) — DH-1:** reference `organization_id`/`user_id`/staff `user_id`; consume `check_permission`, `staff_can_support`, and notification preferences/rules (read); author/own none.
  - **Marketplace (Doc-4D, FROZEN) — DH-2:** reference vendor/profile context by UUID for notification text; consume §8 events; own no vendor data.
  - **RFQ (Doc-4E, FROZEN) — DH-3:** reference `rfq_id`/`rfq_invitation_id` as thread context / notification context; consume §8 events; make no procurement decision.
  - **Operations (Doc-4F, FROZEN) — DH-4:** reference `engagement_id` as notification context; consume §8 events; own no Operations entity.
  - **Trust (Doc-4G) — DH-5:** reference score/verification context by UUID for notification text; consume §8 events; compute/own no score.
  - **Billing (Doc-4I) — DH-6:** reference subscription/invoice context for notification text; consume §8 events; make no Billing decision.
  - **Admin (Doc-4J) — DH-7:** reference ban/moderation context for notification text; consume §8 events; the decision is Admin's.
  - **Platform Core (Doc-4B, FROZEN) — DH-8:** consume audit/outbox/UUIDv7+human-ref/POLICY/flags/Realtime.
- **Dependencies:** Doc-4A §4 (module ownership), §4.4 (single-authorship); Doc-2 §8 (events), §6 (tenancy), §10.7 (refs); Doc-4B/4C/4D/4E/4F (FROZEN).
- **Excluded scope:** No ownership crosses a boundary; no shared ownership; the procurement moat and trust firewall are preserved — Communication transports context, never owns the decision/score/vendor-data.

---

## §H16 — AI-Agent Safety Notes

- **Purpose:** Structure the cross-cutting constraints that keep AI-assisted implementation of Module 6 unambiguous and neutrality-safe — machine-readable boundaries enabling Pass-A authoring without reinterpretation.
- **Expected content scope:** **Authority boundaries** — Communication owns only the delivery/interaction artifacts (Thread, Notification, Outbound Log, Support Ticket), each aggregate in exactly one BC-COMM (§H5/§H9); business authority remains with the originating module; every responsibility/aggregate has an explicit owner. **Delivery-only responsibilities** — notifications are **derived from authoritative DB state**; push/email/SMS/WhatsApp are **delivery channels only, never the source of truth**, and **never substitute for the owning module's Query** (Doc-4A §4A). **Ownership restrictions** — Communication **never** decides/approves/scores/evaluates/ranks/routes/matches/selects/awards; it produces **no Doc-2 §8 event** (consumer/fan-out only — single-authorship §4.4; emitters own event production); it owns **no notification preferences** (Identity-owned, consumed read-only). **Communication-governance rules** — consume §8 events idempotently (Doc-4A §16); on an `rfq_clarification` thread, **read the RFQ-owned scrub rule via the RFQ service (DH-3) and apply it content-side at message-write** — the rule definition is RFQ's (Doc-3); Communication holds no copy, defines no scrub policy, and makes no procurement decision (one mechanism, ownership stays RFQ); no paid plan gates delivery in a way touching trust/eligibility/routing (Doc-4A §4B); no event/slug/audit-action/POLICY-key invention — escalate via `ESC-COMM-*` (§H14). Audience: Claude Code, Cursor, OpenAI Codex, backend, frontend, QA.
- **Dependencies:** Doc-4A §0.6 (flag-and-halt), §4.1 (one owner), §4.4 (single-authorship), §4A (push-channel), §4B (firewall); Doc-2 §8; ASSUMPTION A-04.
- **Excluded scope:** No implementation code; no architectural assumption (all bindings by pointer); no resolution of `DH-*`/`ESC-COMM-*` markers.

---

## §H17 — Structure Summary

- **Purpose:** Close the structure with the section inventory and the freeze-readiness posture (no findings, no commentary — a structure ledger).
- **Expected content scope:** Module 6 — Communication (`communication` schema, `comm_` namespace) decomposes into **4 bounded contexts** (BC-COMM-1 Messaging · BC-COMM-2 Notifications · BC-COMM-3 Delivery Tracking · BC-COMM-4 Support Communications) owning **4 aggregates** (Doc-2 §2, Module 6 — Thread, Notification, Outbound Log, Support Ticket), each aggregate in exactly one context. **Communication Preferences is not a Module-6 aggregate/context** — it is Identity-owned (`users.NotificationPreferences`, `organization_workflow_settings.notification_rules_jsonb`), consumed read-only (DH-1). Cross-module dependencies **DH-1…DH-8** (Identity, Marketplace, RFQ, Operations, Trust, Billing, Admin, Platform Core) are explicit with direction + single-authorship side. **Produced events: none** (Communication is a consumer/fan-out layer — single-authorship; Doc-2 §8 owns the catalog). Consumed events: `VendorInvited` (RFQ, co-consumed independently with Operations) and the notification-bearing §8 events of every producing module → BC-COMM-2 fan-out. State machines inventoried: Thread (`open→closed`), Message (append-only), Thread Participant (`active→removed`), Notification (`unread→read→archived`), Outbound Delivery (`queued→sent→delivered/failed`, on the Outbound Log aggregate's per-channel storage structures), Support Ticket (`open→in_progress→resolved→closed`), Ticket Message (append-only). Escalation markers carried: `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`, `[ESC-COMM-SLUG]`, `[ESC-COMM-EVENT]`. **Communication neutrality** is preserved (transports, never decides/approves/scores/evaluates/awards); the **procurement moat** is preserved (Communication absorbs no matching/routing/ranking/quotation-evaluation/supplier-selection/award); the **trust firewall** is preserved (Communication computes no Trust/Performance/Verification/Governance score); DDD integrity holds (no boundary leakage; no preferences ownership); event integrity holds (no ownership conflict; no event coined; single-authorship intact). Business authority remains with the originating modules; nothing invented. **Structure is ready for Independent Hard Review → Structure Patch → Structure FROZEN → Pass-A authoring.**
- **Dependencies:** §H1–§H16; the frozen corpus.
- **Excluded scope:** No contract/command/query/payload/validation/state-machine-detail/audit-action instantiated; no review/commentary/roadmap.

---

*End of Doc-4H — Communication Engine — Structure Proposal v0.1. Structure only — no contract, command, query, payload, validation matrix, state-machine detail, or audit action instantiated. Module 6 (`communication` schema, `comm_` namespace) decomposes into 4 bounded contexts (BC-COMM-1…4) owning 4 aggregates (Doc-2 §2 — Thread, Notification, Outbound Log, Support Ticket), each in exactly one context; Communication Preferences is Identity-owned (consumed read-only, DH-1), not a Module-6 aggregate. Cross-module dependencies DH-1…DH-8 explicit; produced events none (consumer/fan-out layer — single-authorship, Doc-4A §4.4); consumed events `VendorInvited` (RFQ, co-consumed with Operations) + the notification-bearing §8 events of every producing module → BC-COMM-2 fan-out; escalation markers `[ESC-COMM-AUDIT]`/`[ESC-COMM-POLICY]`/`[ESC-COMM-SLUG]`/`[ESC-COMM-EVENT]` carried. Bound by pointer to Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A/4B/4C/4D/4E/4F v1.0 (FROZEN); Communication neutrality, the procurement moat, and the trust firewall preserved; Communication transports, never decides; business authority remains with the originating modules; nothing invented. Next: Independent Hard Review.*
