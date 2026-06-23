# Doc-4H Structure — Independent Architecture Board Hard Review
**Document ID:** Doc-4H_Structure_Independent_Hard_Review_v0.1
**Review Date:** 2026-06-18
**Status:** FINAL

---

## Review Header

| Field | Value |
|---|---|
| Document Under Review | `Doc-4H_Structure_Proposal_v0.1` |
| Module | Module 6 — Communication (`communication` schema, `comm_` namespace) |
| Operating Context | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · Principal Platform Architect · AI-Agent Governance Auditor |
| Review Posture | Independent. Adversarial. Defects assumed until disproved. No authoring. No redesign. Structure only. |
| Authoritative Corpus | Master_System_Architecture_v1.0_FINAL; ADR_Compendium_v1.md; Doc-2 v1.0.3; Doc-3 v1.0.2; Doc-4A v1.0; Doc-4B v1.0; Doc-4C v1.0; Doc-4D v1.0; Doc-4E v1.0; Doc-4F v1.0; Doc-4G v1.0 (mandate corpus) — Doc-4A…4F FROZEN; Doc-4G mandate-listed as FROZEN |
| Special Focus | Outbound Log aggregate-root plurality; RFQ clarification scrub-rule seam; consumed-event enumeration completeness; Doc-4G freeze status in dependency map; Communication neutrality throughout |

---

## Executive Summary

Doc-4H_Structure_Proposal_v0.1 is architecturally sound at the module boundary level. Communication neutrality is upheld throughout: the module never decides, approves, scores, evaluates, ranks, routes, matches, or awards. The four aggregate-to-BC-COMM assignments are correct. Cross-module dependencies DH-1…DH-8 are directionally correct and single-authorship-compliant. The procurement moat and trust firewall are not breached. No entity, slug, event, audit action, or POLICY key is invented. Communication Preferences is correctly resolved as Identity-owned and not a Module-6 aggregate.

One MAJOR defect and three MINOR defects require patch before structure freeze.

**MAJOR defect:**

- **F4H-MA1 (MAJOR):** §H5 declares "Outbound Log" as a single aggregate with "roots `email_logs` / `sms_logs` / `whatsapp_logs` (**AR each**)" — three aggregate roots. An aggregate has exactly one root entity; three separate aggregate roots means three separate aggregates, not one. The "(AR each)" qualifier creates a structural contradiction: either Outbound Log is one aggregate (one root, three sub-type tables — the "AR each" language is wrong) or there are three separate aggregates (email-log, SMS-log, WhatsApp-log — aggregate count becomes 6, not 4, violating the Doc-2 §2 Module-6 aggregate count). The contradiction propagates into §H9 (owns three root tables, but maps to a single BC-COMM-3 entry), §H13 (one state machine entry for three "AR each" roots), and §H17 ("4 aggregates"). Content-pass authors for BC-COMM-3 cannot determine from the structure whether to implement one tri-type service or three separate aggregate services. This must be resolved at structure level.

**MINOR defects:**

- **F4H-M1 (MINOR):** §H11 Event Consumption Map names only `VendorInvited` by its Doc-2 §8 name; all other consumed events are bundled as "the notification-bearing §8 events of every producing module." Prior structure precedents (Doc-4F §F10/§F11, Doc-4G §G11) named consumed events individually by Doc-2 §8 entry. The blanket statement is not anchored to any specific Doc-2 §8 row beyond `VendorInvited`. Content-pass authors cannot determine from the structure which events BC-COMM-2 must wire as consumers, and any unverified event name could silently cause a consumed event to be invented at Pass-A.

- **F4H-M2 (MINOR):** §H4 and §H16 state that BC-COMM-1 "applies RFQ's raw-contact-scrub rule content-side" on rfq_clarification threads but provide no structural seam for how Communication receives or accesses this rule. Does BC-COMM-1 call a Doc-4E service at message-send? Does the thread context carry the rule at thread-open? Does Communication read the rule from the RFQ entity by UUID? The mechanism is unspecified. Without it, an agent implementing BC-COMM-1 message-send for rfq_clarification threads has no structural basis for the scrub enforcement — the rule is stated but its delivery mechanism is absent.

- **F4H-M3 (MINOR):** §H8 DH-5 references "Trust (Doc-4G)" and §H1 "Conforms To" lists "Doc-4G v0.1 (proposed)." The mandate's authoritative corpus lists Doc-4G v1.0 as FROZEN (item 11). At the time of this review, Doc-4G is under structure review and not yet frozen. The document should carry a dependency caveat for DH-5: Trust events consumed by Communication are subject to the Doc-4G structure freeze completing and being confirmed. Referencing an unfrozen module without a carried caveat may cause content-pass authors to treat Doc-4G events as authoritatively settled when they are not. The correct posture is to note the freeze-dependency explicitly and carry DH-5 with a conditional anchor.

One NITPICK:

- **F4H-N1 (NITPICK):** §H3 Bounded Context Landscape does not note that BC-COMM-3 Delivery Tracking owns an unusual structure (one aggregate with multiple physical root tables — or three separate aggregate-typed entities, pending F4H-MA1 resolution). Regardless of how F4H-MA1 resolves, a one-line note explaining the multi-table nature of BC-COMM-3's ownership would prevent first-pass reader confusion, consistent with F4F-N1 and F4G-N1 in prior structure reviews.

Open findings at review: **0B · 1MA · 3M · 1N**

---

# Structure Defects

---

## SD-01 / F4H-MA1

**Finding ID:** F4H-MA1
**Severity:** MAJOR
**Location:** §H5 — Aggregate Inventory, Outbound Log entry; §H9 — Ownership Matrix; §H13 — State Machine Inventory; §H17 — Structure Summary

**Issue:**
§H5 states:

> **Outbound Log** — roots `email_logs` / `sms_logs` / `whatsapp_logs` (**AR each**); VO DeliveryStatus → **BC-COMM-3**.

The term "AR each" means each of `email_logs`, `sms_logs`, and `whatsapp_logs` is an aggregate root. By definition, an aggregate has exactly one aggregate root entity — its identity anchor, consistency boundary, and the entity through which all reads/mutations route. Three aggregate roots = three aggregates.

The document simultaneously claims one aggregate ("Outbound Log") with three roots — a structural impossibility in DDD. The contradiction propagates:

- **§H9 Ownership Matrix:** lists `email_logs`/`sms_logs`/`whatsapp_logs` as one owned entry for BC-COMM-3, without resolving whether they are three co-owned roots of one aggregate or three separate aggregates.
- **§H13 State Machine Inventory:** one entry ("Outbound Delivery") covers all three tables — consistent with a single aggregate, inconsistent with "AR each."
- **§H17 Structure Summary:** states "4 aggregates (Doc-2 §2 — Thread, Notification, Outbound Log, Support Ticket)" — if there are three separate log ARs, the aggregate count is 6, not 4.

The two candidate resolutions:

**Option A (one aggregate):** Outbound Log is one aggregate with one root (e.g., a polymorphic `outbound_logs` root or a channelled sub-type design) and three physical table implementations (`email_logs`/`sms_logs`/`whatsapp_logs`) as child entities or sub-type tables of that root — not separate ARs. Remove "(AR each)"; replace with the correct description. Aggregate count stays 4.

**Option B (three aggregates):** `email_logs`, `sms_logs`, and `whatsapp_logs` are three separate aggregates with three separate AR roots. Doc-2 §2 Module-6 aggregate count must be reconciled (if Doc-2 §2 already enumerates them as separate aggregates, update the count; if not, carry `[ESC-COMM-AUDIT]` noting the discrepancy and proceed as three separate aggregates with three BC-COMM-3-owned ARs).

Pick one option; remove the ambiguity from §H5, §H9, §H13, and §H17. The choice must be consistent with Doc-2 §2 Module-6 aggregate design — cite the binding row.

**Governance Impact:**
Doc-4A §4.1 (one owner per entity); DDD aggregate-root principle (one root per aggregate). Content-pass authors for BC-COMM-3 cannot determine whether to implement one polymorphic delivery service or three separate aggregate services. An agent reading §H5 will find contradictory signals: "one aggregate" but "three ARs." If the agent implements Option B (three services) against a structure that intends Option A (one service), the BC-COMM-3 contracts will be mis-scoped from the first Pass-A contract attempt.

**Required Fix:**
Resolve in §H5: either remove "(AR each)" and confirm one root with three sub-type tables (Option A), or confirm three separate aggregates with the correct Doc-2 §2 count (Option B). Update §H9, §H13, and §H17 consistently. Cite the Doc-2 §2 Module-6 entry binding the choice.

---

## SD-02 / F4H-M1

**Finding ID:** F4H-M1
**Severity:** MINOR
**Location:** §H11 — Event Consumption Map

**Issue:**
§H11 names `VendorInvited` explicitly by its Doc-2 §8 name with the co-consumer note. For all remaining consumed events it states:

> "**the notification-bearing §8 events of every producing module** (Marketplace DH-2, RFQ DH-3, Operations DH-4, Trust DH-5, Billing DH-6, Admin DH-7) → BC-COMM-2 derives + fans out notifications per the Doc-2 §8 consumer mapping."

No individual event is named beyond `VendorInvited`. The precedent established in Doc-4F (§F10/§F11 named all five produced events and both consumed events by Doc-2 §8 entry) and Doc-4G (§G10/§G11 named all six produced events and all five consumed events) requires individual event naming at structure level. A blanket reference to "notification-bearing events of every producing module" is not anchored to any specific Doc-2 §8 row.

The consequence: content-pass authors for BC-COMM-2 must themselves enumerate the consumed event list from Doc-2 §8 without a structure-level anchor. An unverified event name at Pass-A could cause a coined event — the precise defect `[ESC-COMM-EVENT]` is intended to prevent. The structure document should close this before Pass-A begins.

**Governance Impact:**
Doc-2 §8 (event catalog as sole event authority); Doc-4A §4.4 (single-authorship; consumer effects authored by the consumer — must know which events to consume). Structure-level enumeration of consumed events is the mechanism that verifies "no event coined" before Pass-A.

**Required Fix:**
§H11: enumerate the specific Doc-2 §8 events Communication consumes for notification fan-out, by name, per producing module, citing the Doc-2 §8 primary-consumer row for each. For each event, note: producing module, consuming BC-COMM, and ownership direction (producing module owns the event; Communication owns the notification effect). Where a producing module's events are not yet fully enumerated (e.g., Doc-4G not yet frozen, Doc-4I/Doc-4J not yet authored), carry the carry-forward note explicitly rather than the blanket "notification-bearing" statement.

---

# Implementation Risks

---

## IR-01 / F4H-M2

**Finding ID:** F4H-M2
**Severity:** MINOR
**Location:** §H4 — Context Responsibilities, BC-COMM-1 entry; §H8 DH-3; §H16 — AI-Agent Safety Notes

**Issue:**
§H4 BC-COMM-1 states: "RFQ-clarification thread hosting (context_id = `rfq_id`; **raw-contact scrubbing is RFQ/Doc-3's rule, applied content-side**)."
§H16 repeats: "apply RFQ's raw-contact-scrub rule content-side on rfq_clarification threads."
§H8 DH-3 states Communication "applies RFQ's raw-contact-scrub rule content-side" with no further mechanism.

The rule is correctly attributed to RFQ/Doc-3 (not Communication's to own). But the structural seam by which BC-COMM-1 receives and enforces this rule is absent. Candidate mechanisms:

1. BC-COMM-1 calls a Doc-4E service at message-send to validate/scrub the message content.
2. The rule is encoded in Communication via a POLICY key (Doc-3 §12.2); Communication applies it without a runtime call to Doc-4E.
3. The thread-open operation passes scrub-rule parameters from the RFQ context, carried on the thread entity.
4. Communication applies a static rule (no runtime reference to Doc-4E) sourced from Doc-3 at build time.

These four options produce materially different implementation architectures: options 1/3 create a runtime BC-COMM-1 ↔ Doc-4E dependency not currently in DH-3; options 2/4 make Communication self-sufficient at runtime with the rule encoded at build/config time. DH-3 says Communication "consumes events" and "hosts thread; no RFQ decision" — it does not mention a scrub-rule service call. If option 1 is intended, DH-3 must be updated to add the service-call dependency. If options 2/3/4 are intended, the mechanism must be stated.

**Governance Impact:**
Doc-4A §4.4 (single-authorship; Communication must not author RFQ rule logic — it may enforce a rule it receives/reads, but not define it). AI-agent implementation ambiguity: an agent implementing BC-COMM-1 `message_send` for rfq_clarification threads has no structural basis for the scrub enforcement. This is the one BC-COMM-1 contract where message-send behavior differs from the direct-thread case; without the structural seam, the agent will produce either no scrub enforcement (security gap) or an invented enforcement mechanism.

**Required Fix:**
§H4 BC-COMM-1 and §H8 DH-3: state the scrub-rule mechanism explicitly. If a runtime Doc-4E service call, add the service reference to DH-3. If a POLICY-key-governed static rule, add the POLICY pointer (or `[ESC-COMM-POLICY]` if the key is absent from Doc-3 §12.2). If encoded at thread-open from the RFQ context, state that the rfq_clarification thread entity carries the scrub parameter at creation. One mechanism; one structural statement; no ambiguity for BC-COMM-1 implementers.

---

## IR-02 / F4H-M3

**Finding ID:** F4H-M3
**Severity:** MINOR
**Location:** §H1 "Conforms To"; §H8 DH-5; §H11 Event Consumption Map; §H17

**Issue:**
The document lists in its header: "Doc-4G v0.1 (proposed)" under "Conforms To." §H8 DH-5 references "Trust (Doc-4G)" and its emitted events (`VendorVerified`/`TrustScoreUpdated`/`PerformanceScoreUpdated`/etc.) as consumed by Communication for fan-out, with no caveat on Doc-4G's freeze status.

The mandate's authoritative corpus (item 11) lists "Doc-4G v1.0 (FROZEN)" — meaning this review is conducted against a corpus assumption that Doc-4G is frozen. However, the document under review itself notes Doc-4G is "v0.1 (proposed)" — an unfrozen structure proposal. The structure review for Doc-4G produced findings F4G-MA1 and F4G-MA2 which are currently open. Specifically, F4G-MA1 may affect whether certain Trust events require an additive Doc-2 §8 event — which would directly affect what Communication consumes from Trust.

The document's DH-5 and §H11 treat Doc-4G events as authoritatively settled when Doc-4G is not yet frozen. This creates a structural dependency hazard: if Doc-4G's structure changes under its patch cycle (e.g., an event is added or confirmed absent), Doc-4H's consumed-event list for Trust is stale before it is frozen.

**Governance Impact:**
Doc-4A §0.6 (flag-and-halt on corpus conflicts) — not triggered because this is a documentation caveat gap, not an ownership conflict. But the absence of a carried-dependency caveat means the hazard is invisible to content-pass authors. The correct posture for a downstream module referencing an upstream module under active review is to carry the dependency as conditional, pending freeze.

**Required Fix:**
§H1 "Conforms To": retain "Doc-4G v0.1 (proposed)" and add a note: "DH-5 Trust event consumption is conditional on Doc-4G structure freeze — carried pending `Doc-4G_Structure_FROZEN`; content-pass authoring for Trust-event fan-out must verify against the frozen Doc-4G structure." §H8 DH-5: add the same conditional caveat. This is a one-line addition per section; no structural change.

---

## IR-03 / F4H-N1

**Finding ID:** F4H-N1
**Severity:** NITPICK
**Location:** §H3 — Bounded Context Landscape, BC-COMM-3 entry; §H17 — Structure Summary

**Issue:**
§H3 BC-COMM-3 Delivery Tracking is described as owning the Outbound Log aggregate without calling out the multi-table structure of its ownership (`email_logs`/`sms_logs`/`whatsapp_logs`). After F4H-MA1 resolves, whichever option is chosen (one aggregate with sub-type tables or three aggregates), a one-line note in §H3/§H17 explaining the physical table structure would prevent reader confusion — consistent with F4F-N1 (BC-OPS-4 two-aggregate note) and F4G-N1 (BC-TRUST-5 two-aggregate note) from prior structure reviews.

**Corpus Reference:** Doc-2 §2 Module 6 aggregate design; §H5 Aggregate Inventory.

**Required Fix:**
§H3 BC-COMM-3 entry: add one line noting the multi-table nature of the Outbound Log aggregate (or multi-aggregate structure if Option B chosen for F4H-MA1). Clarifies the aggregate count distribution across BCs for first-pass readers.

---

# Domain-by-Domain Assessment

---

## Domain 1 — Module Charter Integrity

**PASS**

Doc-4H correctly claims Module 6, `communication` schema, `comm_` namespace. Family-map confirmation recorded against Doc-4A §1.3, Doc-4A Appendix B, Doc-2 §0.3, and Context Pack v3 §3. Communication-neutrality seam stated in the preamble, §H7, §H16, §H17. Module purpose ("delivery & interaction layer; transports information, owns no business authority") is correct and consistently stated. No authority or decision-making claim anywhere in the document. No flag-and-halt condition triggered.

---

## Domain 2 — Bounded Context Integrity

**PASS** (subject to F4H-MA1)

- **BC-COMM-1 Messaging:** Thread aggregate (threads + messages + thread_participants). Coherent — participant-gated conversation hosting is a distinct subdomain. No procurement decision or business approval claimed. The rfq_clarification thread type is correctly described as hosting (not deciding). **CLEAN** subject to F4H-M2 scrub-rule seam.
- **BC-COMM-2 Notifications:** Notification aggregate. Coherent — event-derived in-app notification fan-out is a distinct subdomain. Fan-out orchestration correctly described as orchestrating channel dispatch, not deciding. Identity-owned notification rules consumed read-only. **CLEAN.**
- **BC-COMM-3 Delivery Tracking:** Outbound Log aggregate. Coherent purpose — append-only outbound log. **F4H-MA1: aggregate-root plurality unresolved.** Pending fix.
- **BC-COMM-4 Support Communications:** Support Ticket aggregate. Coherent — user↔platform-staff support is a distinct subdomain. ASSUMPTION A-04 correctly cited. **CLEAN.**

No overlap between contexts. No aggregate split across BCs.

---

## Domain 3 — Aggregate Ownership Integrity

**MAJOR DEFECT (F4H-MA1)**

| Aggregate | Root | Owning BC | Status |
|---|---|---|---|
| Thread | `threads`+`messages`+`thread_participants` | BC-COMM-1 | CLEAN |
| Notification | `notifications` | BC-COMM-2 | CLEAN |
| Outbound Log | `email_logs`/`sms_logs`/`whatsapp_logs` ("AR each") | BC-COMM-3 | DEFECTIVE — F4H-MA1 |
| Support Ticket | `support_tickets`+`ticket_messages` | BC-COMM-4 | CLEAN |

Three of four aggregate assignments are unambiguous. The Outbound Log aggregate is structurally ambiguous due to the "AR each" language — see F4H-MA1.

---

## Domain 4 — Communication Preferences Authority

**PASS — CLEAN**

The Communication Preferences reconciliation is the most carefully handled section in the document. §H3 carries an explicit reconciliation note: the Module-6 authoring brief lists "Communication Preferences" as an expected area; the frozen corpus locates notification preferences in Identity (Doc-2 §2/§3.2 — `users.NotificationPreferences`; Doc-2 §10.2/§10.7 — `organization_workflow_settings.notification_rules_jsonb`). Communication consumes these read-only via DH-1; it owns no preferences aggregate.

The ownership claim is:
- **User-level:** `NotificationPreferences` VO on `users` — Identity/Doc-4C owned. Confirmed by Doc-4C Pass-B reference ("consumed by Module 6 for notifications"). Correct.
- **Org-level:** `notification_rules_jsonb` on `organization_workflow_settings` — Identity/Doc-4C owned (Doc-2 §10.2/§10.7 FIXED/POLICY/ORG). Correct.

No flag-and-halt triggered. Resolution to consume-only is correct. The document does not introduce a preferences aggregate or context. **CLEAN.**

---

## Domain 5 — Dependency Integrity

**PASS** (subject to F4H-M3)

| Marker | Direction | Single-Authorship | Assessment |
|---|---|---|---|
| DH-1 Identity | consume org/user/membership/`check_permission`/`staff_can_support`/notification prefs+rules (read) | Identity authors; Communication consumes | **CLEAN** |
| DH-2 Marketplace | consume notification-bearing §8 events; reference UUID for context | Marketplace authors events; Communication authors fan-out effect | **CLEAN** |
| DH-3 RFQ | consume §8 events; host rfq_clarification thread (context only); no procurement decision | RFQ emits; Communication hosts + fans out | **CLEAN** — F4H-M2 scrub-rule seam noted |
| DH-4 Operations | consume §8 events; reference `engagement_id` for context | Operations emits; Communication fans out | **CLEAN** |
| DH-5 Trust | consume §8 events; no score owned or computed | Trust emits; Communication fans out | **CLEAN** — F4H-M3 freeze-status caveat noted |
| DH-6 Billing | consume §8 events; no Billing decision; paid plan never gates delivery touching trust/eligibility | Billing emits; Communication fans out | **CLEAN** |
| DH-7 Admin | consume §8 events; moderation/ban decision is Admin's | Admin emits; Communication fans out | **CLEAN** |
| DH-8 Platform Core | consume audit/outbox/UUIDv7+human-ref/POLICY/flags/Realtime | Platform Core authors; Communication consumes | **CLEAN** |

All eight DH markers are directionally correct and single-authorship-compliant. **CLEAN** (F4H-M2 and F4H-M3 are description completeness gaps, not boundary violations).

---

## Domain 6 — Event Integrity

**MINOR DEFECT (F4H-M1)**

**Event production:** Communication produces no Doc-2 §8 domain event. Correctly stated in §H10 and §H7. `[ESC-COMM-EVENT]` correctly carried for future needs. No event coined. **CLEAN.**

**Event consumption:** `VendorInvited` correctly named and anchored (Doc-2 §8; co-consumer note for Operations BC-OPS-3 included — consistent with the F4F-M1 fix in Doc-4F). All other consumed events bundled as "notification-bearing §8 events" without individual naming — **F4H-M1.**

**Single-authorship:** The emitting modules author event production; Communication authors the notification effect on its own entities. Single-authorship invariant preserved throughout. **CLEAN.**

**Event topology:** No event loop possible (Communication produces no events; all consumption flows are emitter→Communication). **CLEAN.**

---

## Domain 7 — Procurement Moat Audit

**PASS — CLEAN**

Communication owns zero moat concerns. Specific checks:
- RFQ clarification thread: Communication **hosts** the thread (the conversation artifact is Communication's); RFQ owns the clarification-channel rule and the procurement decision. The hosting/deciding distinction is correctly maintained in §H4 and §H8 DH-3.
- No matching, routing, ranking, quotation evaluation, supplier selection, or award capability is described, implied, or referenced as Communication-owned anywhere in the document.
- Fan-out orchestration (which channel to use) is determined by Identity-owned notification rules — Communication executes the fan-out, the rule owner (Identity) decides the channel policy. This is correctly framed as delivery execution, not channel routing in the procurement sense.

**Procurement moat verdict: CLEAN.**

---

## Domain 8 — Trust Firewall Audit

**PASS — CLEAN**

Communication computes, owns, and stores no trust, verification, performance, or governance score. DH-5 correctly states "firewall — no score." §H7 explicitly lists Trust/Performance/Verification/Governance scores as not owned. §H16 names the constraint directly.

Paid-plan firewall (Doc-4A §4B): stated in §H7 and §H16 — "a paid plan never gates message delivery in a way that touches trust/eligibility/routing."

Push-channel rule (Doc-4A §4A): stated in §H7 and §H16 — notifications are derived from authoritative DB state; push/email/SMS/WhatsApp are delivery channels only; never substitute for the owning module's Query.

**Trust firewall verdict: CLEAN.**

---

## Domain 9 — Escalation Integrity

**PASS — CLEAN**

| Marker | Purpose | Usage | Status |
|---|---|---|---|
| `[ESC-COMM-AUDIT]` | Doc-2 §9 has no Communication/Thread/Message/Notification/Delivery/Support-Ticket audit domain | Any Communication mutation lacking Doc-2 §9 coverage carries the marker; halt until Doc-2 §9 additive channel resolves; no action invented | **CLEAN — correctly identified as principal Module-6 escalation** |
| `[ESC-COMM-POLICY]` | Doc-3 §12.2 runtime tunables for Communication (dedup window, retry, rate limits) | Carry if absent; reference existing key by name if present; never invent | **CLEAN** |
| `[ESC-COMM-SLUG]` | Doc-2 §7 slug gaps (e.g., distinct notification-read slug) | Identified candidate: notification read/archive may lack a §7 slug; carried, not invented | **CLEAN** |
| `[ESC-COMM-EVENT]` | Communication produces no Doc-2 §8 event today; future need requires additive | Novel marker for this module; correctly patterned; no event coined | **CLEAN — structurally appropriate for a pure-consumer module** |

No marker renamed, removed, misused, or silently resolved. The four-marker set is complete and correctly channels all Module-6 gap types. **CLEAN.**

---

## Domain 10 — State Machine Inventory Integrity

**PASS** (subject to F4H-MA1 resolution for BC-COMM-3)

| Machine | Root | BC | Source Pointer | Status |
|---|---|---|---|---|
| Thread | `threads`: `open → closed` | BC-COMM-1 | Doc-2 §3.7/§10.7 | **CLEAN** |
| Message | `messages`: append-only (soft-delete = hidden) | BC-COMM-1 | Doc-2 §3.7/§10.7 | **CLEAN** |
| Thread Participant | `thread_participants`: `active → removed` | BC-COMM-1 | Doc-2 §3.7/§10.7 | **CLEAN** |
| Notification | `notifications`: `unread → read → archived` | BC-COMM-2 | Doc-2 §3.7/§10.7 | **CLEAN** |
| Outbound Delivery | `email_logs`/`sms_logs`/`whatsapp_logs`: `queued → sent → delivered \| failed` | BC-COMM-3 | Doc-2 §10.7 | **Pending F4H-MA1** — if three ARs, three entries needed |
| Support Ticket | `support_tickets`: `open → in_progress → resolved → closed` | BC-COMM-4 | Doc-2 §3.7/§10.7 | **CLEAN** |
| Ticket Message | `ticket_messages`: append-only | BC-COMM-4 | Doc-2 §10.7 | **CLEAN** |

Seven state machines inventoried. No state or transition invented. All machines bound to Doc-2 §3.7/§10.7 by pointer. BC-COMM-3 entry is consistent internally but contingent on F4H-MA1 resolution.

---

## Domain 11 — AI-Agent Determinism Review

**PASS with observations**

§H16 correctly states:
- Communication owns only delivery/interaction artifacts — four aggregates, one per BC-COMM.
- Notifications are derived from authoritative DB state; push is delivery-only; never substitute for the owning module's Query (Doc-4A §4A).
- Communication never decides/approves/scores/evaluates/ranks/routes/matches/selects/awards.
- Communication produces no Doc-2 §8 event.
- Notification preferences are Identity-owned; consumed read-only.
- No event/slug/audit-action/POLICY-key invention — escalate via `ESC-COMM-*`.

**Gap (F4H-M2 co-located):** §H16 states Communication "apply RFQ's raw-contact-scrub rule content-side on rfq_clarification threads" — but the mechanism is absent. An agent implementing BC-COMM-1 `message_send` for the rfq_clarification thread type reaches §H16 and knows a rule must be applied, but has no structural seam for how. Without this, the scrub may be implemented incorrectly (or not at all) by an AI agent operating from the structure document alone.

**Gap:** §H16 does not surface the BC-COMM-3 AR plurality question — if an agent reads §H16 and then §H5, it encounters contradictory signals ("one aggregate" vs. "AR each") with no resolution guidance. This amplifies F4H-MA1.

**AI-agent determinism verdict: PASS with observations** (both observations co-covered by F4H-MA1 and F4H-M2).

---

## Domain 12 — Structure Completeness

**PASS**

All required structural elements present per mandate checklist:

| Required Element | Section | Status |
|---|---|---|
| Module Charter | §H1 | ✓ |
| BC Map | §H3 | ✓ |
| Aggregate Map | §H5 | ✓ (F4H-MA1 in entry) |
| Authority Matrix | §H7 | ✓ |
| Dependency Map | §H8 | ✓ |
| Event Map (production) | §H10 | ✓ |
| Event Map (consumption) | §H11 | ✓ (F4H-M1 in completeness) |
| Permission Surface | §H12 | ✓ |
| State Inventory | §H13 | ✓ |
| Escalation Inventory | §H14 | ✓ |
| Cross-Module References | §H15 | ✓ |
| AI-Agent Notes | §H16 | ✓ |

All 12 required sections are present. **Structure skeleton is complete.** Three content defects (F4H-MA1, F4H-M1, F4H-M2) and one dependency caveat (F4H-M3) require patch.

---

## Structure Freeze Readiness

| Area | Result | Notes |
|---|---|---|
| 1. Module charter integrity | PASS | Delivery/interaction layer correctly bounded; no authority claim |
| 2. Bounded context integrity | PASS (F4H-MA1) | 4 BCs coherent; BC-COMM-3 AR plurality defective |
| 3. Aggregate ownership integrity | MAJOR (F4H-MA1) | 3 of 4 aggregates clean; Outbound Log contradicts DDD one-root rule |
| 4. Communication Preferences authority | PASS | Identity-owned; consumed read-only; correctly resolved with reconciliation note |
| 5. Dependency integrity | PASS (F4H-M3) | DH-1…DH-8 directional and single-authorship-compliant; Doc-4G freeze caveat missing |
| 6. Event integrity | MINOR (F4H-M1) | No events produced — CLEAN; consumed event enumeration incomplete |
| 7. Procurement moat | PASS | No moat concern absorbed; hosting ≠ deciding correctly maintained |
| 8. Trust firewall | PASS | No score computed, owned, or stored; push-channel rule stated |
| 9. Escalation integrity | PASS | Four markers correctly patterned; `[ESC-COMM-EVENT]` novel and correct |
| 10. State machine inventory | PASS (F4H-MA1) | 6 of 7 machines clean; BC-COMM-3 entry contingent on AR resolution |
| 11. AI-agent determinism | PASS | §H16 complete; scrub-rule seam and AR ambiguity amplify open findings |
| 12. Structure completeness | PASS | All 12 required sections present |
| 13. Structure freeze readiness | PATCH REQUIRED | 1 MAJOR (F4H-MA1) blocks freeze |

---

# Final Verdict

## Executive Summary

```
Open BLOCKER  = 0
Open MAJOR    = 1
Open MINOR    = 3
Open NITPICK  = 1
```

Doc-4H_Structure_Proposal_v0.1 is architecturally sound at the module boundary level. Communication neutrality is correctly stated and upheld throughout. The procurement moat and trust firewall are intact. The Communication Preferences ownership question is the best-handled cross-module ownership reconciliation in the module family to date. No entity, event, slug, audit action, or POLICY key is invented. The escalation marker set is complete and correctly patterned. Three of four BCs are clean.

One MAJOR defect blocks structure freeze: the Outbound Log aggregate-root plurality (F4H-MA1) creates a structural contradiction that prevents content-pass authors from implementing BC-COMM-3 contracts deterministically. Three MINORs (consumed-event enumeration, scrub-rule seam, Doc-4G freeze caveat) require patch in the same pass.

## Structure Readiness

```
APPROVED WITH PATCH REQUIRED
```

## Approval Question

```
Can this document proceed directly to:
Doc-4H_Structure_Freeze_Audit_v1.0 ?

NO
```

**Required next step:** `Doc-4H_Structure_Patch_v0.1` — resolve F4H-MA1, F4H-M1, F4H-M2, F4H-M3 (and F4H-N1 at Board discretion) → patch verification → `Doc-4H_Structure_FROZEN`.

**Justification:** F4H-MA1 is a load-bearing structural defect. The "(AR each)" language in §H5 creates a direct DDD contradiction — one aggregate cannot have three aggregate roots. A content-pass author implementing BC-COMM-3 contracts has two architecturally incompatible readings of the structure: one service with sub-type tables or three separate aggregate services. This ambiguity will produce mis-scoped Pass-A contracts from the first authoring attempt and cannot be resolved by a content-pass author without structural authority to reinterpret the aggregate design. The patch is minimal: choose one option, update §H5/§H9/§H13/§H17 consistently, and cite the Doc-2 §2 Module-6 binding row.

---

*Review conducted under Doc-4A §0.6 (flag-and-halt), §0.3 (reference-never-restate). No corpus conflict requiring flag-and-halt encountered. No authoring performed. Independent reviewer posture maintained throughout.*
