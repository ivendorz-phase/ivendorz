# Doc-6H — M6 Communication (`communication`) Schema Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1 → effective v0.2** — Independent Hard Review applied (1 MAJOR + 3 MINOR + 1 NITPICK dispositioned; §Review Disposition). For Structure Freeze Audit → FROZEN |
| Module | **M6 — Communication** (`communication` schema). **Delivery-only** — chat/RFQ threads (participant-grant RLS) + notifications + email/SMS/WhatsApp **delivery logs (append-only)** + support. M6 transmits; it **does not own business content** |
| Realizes | **Doc-2 §10.7** — **9 tables / 4 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4H (M6 contracts, consumed); Doc-3 v1.0.2 **+ v1.5 (`communication.*` POLICY — registered, 2 keys)**; Doc-6B (`core`); Doc-6C/6E (UUID + event); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.5), Doc-4A v1.0, Doc-4H v1.0 (FROZEN), Doc-4L/4M, Doc-6A/6B/6C/6D/6E/6F/6G v1.0 (FROZEN) |
| Contains | Structure only — section map, 9-table partition, ratified decisions (CM-CR1–CR12), participant-grant RLS model, state machines, delivery-only firewall, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Delivery-only:** M6 owns the **transmission** (chat threads, notification fan-out, channel delivery logs), not the authoritative business content (that is the source module). Logs are **append-only**. **Schema name = `communication`** (Doc-2 §10.7 + Doc-3 v1.5 binding; the CLAUDE.md `comms` shorthand is a non-authoritative orientation slip → flag for patch). RLS = backstop |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.7 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions proposed at structure freeze (CM-CR-set)

- **CM-CR1 — 9 tables / 4 groupings (Doc-2 §10.7), coin nothing.** Messaging (`threads`+`messages`+`thread_participants`) · Notifications (`notifications`) · Delivery Logs (`email_logs`+`sms_logs`+`whatsapp_logs`) · Support (`support_tickets`+`ticket_messages`). *(The §10.7 email/sms/whatsapp-logs row = 3 tables.)* A 10th is non-conformant.
- **CM-CR2 — Delivery-only (M6 transmits, owns no business content).** The thread/message/notification/log tables carry **transmission** facts (who, when, channel, delivery status), not the authoritative business record — that stays in the source module (RFQ thread context → M3, etc.). Delivery logs are **append-only delivery records**.
- **CM-CR3 — Participant-grant RLS (third grant pattern).** `threads`/`messages` are **shared via `thread_participants`** (grant rows; `participant_organization_id = active org` — the anchor); message read = a participant of the thread; write = the sender. **Never cross-schema ownership traversal** (Doc-2 §10.11 #9). (M3 used invitation-grantees; M4 used party columns; M6 uses thread-participant grant rows.)
- **CM-CR4 — Append-only delivery logs (`email_logs`/`sms_logs`/`whatsapp_logs`).** **NO SD**; `status(queued/sent/delivered/failed)` tracked; column-scoped immutability (the delivery facts — recipient/template/provider_ref — frozen; only `status` advances). `source_event_id` → M0 outbox event (the trigger).
- **CM-CR5 — State machines.** `threads.status`(open/closed) · `thread_participants.status`(active/removed) · `support_tickets.status`(open/in_progress/resolved/closed) · log `status`(queued/sent/delivered/failed); enum + CHECK; service transitions; thread/notification/log creation consumes M0 outbox events.
- **CM-CR6 — Messages (Realtime-backed; soft-delete = hidden).** `messages` is the Supabase-Realtime source; `body`/`attachments_refs`/`sent_at`; YES SD (= hidden). `sender_user_id`/`sender_organization_id` → M1 (bare UUID).
- **CM-CR7 — Notifications (recipient-tenant; in_app).** `recipient_user_id`/`recipient_organization_id` tenant; `channel(in_app)`; `title`/`body`/`payload_jsonb`/`read_at`; `source_event_id` → M0; YES SD (archive).
- **CM-CR8 — Support (two-party org + staff).** `support_tickets` `organization_id` + platform staff; `status` machine; `priority`. `ticket_messages` append-only (`author_id` = user **or** staff).
- **CM-CR9 — Polymorphic context + event refs (bare UUID, no FK).** `threads.context_id`+`context_type` (rfq etc.); `source_event_id` → M0 (`core.outbox_events`); all cross-module = bare UUID.
- **CM-CR10 — POLICY: registered (Doc-3 v1.5); `[ESC-6-POLICY]` CLEARED.** 2 `communication.*` keys; read from `core.system_configuration`, never literals.
- **CM-CR11 — No `human_ref`; schema-name binding.** No human_ref carrier (Doc-2 §10.7 declares none — CHK-6-002 N/A). **Schema = `communication`** (binding; CLAUDE.md `comms` = orientation slip to patch).
- **CM-CR12 — Indexing + carried DD.** Cursor sort-key indexes (Band H); thread-participant anchor index; partial `WHERE deleted_at IS NULL` (SD tables); `notifications`/logs consume M0 outbox events. Carried: DD-CORE (outbox events drive notifications/logs), DD-RFQ (thread context), **`[ESC-COMM-AUDIT]`** (comms audit actions vs Doc-2 §9 — confirm at content).

## The `communication` schema partition (the structural spine)

| Doc-2 §10.7 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `threads` | Messaging | shared via `thread_participants` | YES (close) | `status` | §3.1 |
| `messages` | ↳ | participants (Realtime-backed) | YES (=hidden) | — | §3.1 |
| `thread_participants` | ↳ | **grant row** (`participant_organization_id = active org`) | NO (removed state) | `status` | §3.1 |
| `notifications` | Notifications | recipient `organization_id` | YES (archive) | `read_at` | §3.2 |
| `email_logs` · `sms_logs` · `whatsapp_logs` | Delivery Logs | platform-internal (delivery) | NO (append-only) | `status` | §3.3 |
| `support_tickets` | Support | `organization_id` + staff | YES | `status` | §3.4 |
| `ticket_messages` | ↳ | as ticket | NO (append-only) | — | §3.4 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4H → Doc-6A → Doc-6B…6G → **Doc-6H** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried: DD-CORE/RFQ, `[ESC-COMM-AUDIT]`; `[ESC-6-POLICY]` CLEARED (v1.5). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.7`; `Doc-4H`.

## §1 — Scope & the `communication` Table Partition
Governs 9 tables / not (RFQ/thread business content = M3; notification *source* events = owning modules; identity = M1 — by UUID/event/service). Delivery-only; participant-grant RLS; append-only logs. **Deps:** `Doc-2 §2/§10.7`; `Doc-4H`; `Doc-6A §1`.

## §2 — Participant-Grant Tenancy & RLS Model *(load-bearing)*
Classes: **participant-grant** (`threads`/`messages` via `thread_participants.participant_organization_id = active org`); **recipient-tenant** (`notifications`); **platform-internal** (delivery logs); **org+staff** (`support_tickets`/`ticket_messages`). Grant rows materialized by the messaging service; refresh-on-removal (`status='removed'`). Never cross-schema traversal. RLS = backstop; authz app-layer (Doc-4H). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.7/§10.11`; `Doc-6A §4`; `Doc-4H`.

## §3 — Per-Aggregate Realization
§3.1 Messaging (threads/messages/thread_participants; participant-grant RLS; Realtime) · §3.2 Notifications (recipient-tenant; M0 event source) · §3.3 Delivery Logs (append-only; column-scoped status; M0 event source) · §3.4 Support (org+staff; ticket_messages append-only). **Deps:** `Doc-2 §10.7`; `Doc-4H`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization
`threads.status` · `thread_participants.status` · `support_tickets.status` · log `status`; enum + CHECK; service transitions; thread/notification/log creation consumes M0 outbox events (Doc-2 §8); transitions → `core.outbox_events` where Doc-2 §8 lists an emitter. **Deps:** `Doc-2 §8/§10.7`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-CORE/RFQ)
Bare-UUID + service + event: notifications/logs **consume M0 outbox events** (`source_event_id` → `core.outbox_events`); thread `context_id` → the source module (M3 etc.); identity refs → M1. **Delivery-only firewall:** M6 owns no business content; it transmits. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4H`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5H lists; thread-participant anchor index (`participant_organization_id`); `messages(thread_id, sent_at)`; notifications `(recipient_organization_id, read_at)`; logs `(source_event_id)`/`(status)`; partial `WHERE deleted_at IS NULL` (SD tables); page-size via `communication.*` POLICY. **Deps:** `Doc-5H`; `Doc-6A §10/§12`; `Doc-3 v1.5`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → threads → messages → thread_participants → notifications → email/sms/whatsapp_logs → support_tickets → ticket_messages → indexes → triggers → RLS); POLICY = Doc-3 v1.5 (CLEARED). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.5`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C participant-grant + recipient-tenant + platform-internal; Band D append-only logs/ticket_messages; CHK-6-002 N/A no human_ref); carried register (DD-CORE/RFQ, `[ESC-COMM-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.7`.

## Appendix A — Doc-6H Conformance Attestation map (Doc-6A `CHK-6-001…093`)
Highlights: **Band C PASS** (participant-grant RLS [`thread_participants`]; recipient-tenant notifications; platform-internal logs; org+staff support; CHK-6-020/021/023) · Band D PASS (append-only delivery logs + `ticket_messages`; column-scoped log status; messages SD=hidden) · Band E PASS (CHK-6-040 thread/ticket transitions+outbox; CHK-6-041 notifications/logs consume M0 events; `[ESC-COMM-AUDIT]` at 043) · **CHK-6-002 N/A** (no human_ref) · CHK-6-050 N/A (no monetary column) · CHK-6-005 PASS (thread_participants PK; partial-uniques). **Deps:** `Doc-6A Appendix A`; `Doc-5H`.

---

## Open Carried Items
| ID | Item | Doc-6H handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / machines / Doc-5H persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-CORE / DD-RFQ | outbox events drive notifications/logs / thread context | consume events; bare UUID | No |
| **Delivery-only firewall** | M6 owns no business content | transmission facts only; logs append-only | No (binding) |
| **`[ESC-COMM-AUDIT]`** | comms audit actions vs Doc-2 §9 | bind nearest §9 by pointer; none invented | No (content: bind) |
| **Schema-name slip** | CLAUDE.md `comms` vs Doc-2 `communication` | realize `communication` (binding); flag CLAUDE for patch | No (orientation erratum) |
| `[ESC-6-POLICY]` | `communication.*` keys | **CLEARED** — Doc-3 v1.5 | No |

## Fences / Out of scope
Any non-`communication` table · RFQ/thread business content (M3) · notification source authority (owning modules) · coining any element · a cross-schema FK · cross-schema RLS traversal · M6 owning a business record · DDL/Prisma/migration bodies (content passes).

---

## Review Disposition (Independent Hard Review — Structure)

Reviewer: independent. Field-traced to Doc-2 §10.7/§10.11. Verified CORRECT: 9-table set (email/sms/whatsapp = 3), thread/participant/support/log status sets verbatim, the participant-grant pattern, delivery-only, the 2 `communication.*` keys (Doc-3 v1.5), schema name `communication`, no human_ref, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **SCHEMA-NAME** CLAUDE.md says `comms`; Doc-2 §10.7 + Doc-3 v1.5 say `communication` | MAJOR | **FIXED (binding `communication`)** — CM-CR11: realize `communication` (the authoritative name); the CLAUDE.md `comms` is a non-authoritative orientation slip, **flagged for patch**, not reopened. |
| **LOG-IMM** delivery logs "append-only" with a mutable `status` | MINOR | **CONFIRMED column-scoped** — §3.3: facts frozen; only `status` (queued→sent→delivered→failed) advances; content-pass realizes the trigger. |
| **PART-GRANT** participant-grant nested RLS (HQ-003 class) | MINOR | **CONFIRMED** — anchor `thread_participants.participant_organization_id = active org` is a simple predicate; non-defeatable; content + Doc-8 assert. |
| **CTX-POLY** `threads.context_id` polymorphic | MINOR | **CONFIRMED bare-UUID** — `context_type` discriminator; no FK; service-validated. |
| **COMM-AUDIT** comms audit actions vs §9 | NIT | **CONFIRMED carried** — `[ESC-COMM-AUDIT]`. |

**Net:** 1 MAJOR (schema name — binding `communication`, CLAUDE flagged) + 3 MINOR + 1 NIT fixed/confirmed. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6H Structure Proposal v0.1 (effective v0.2 — Independent Hard Review applied). For Structure Freeze Audit → FROZEN. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6H realizes the 9 `communication` tables verbatim from Doc-2 §10.7 against frozen Doc-6A — delivery-only (M6 transmits, owns no business content); participant-grant RLS; append-only delivery logs; coins nothing. Next: Structure Freeze Audit.*
