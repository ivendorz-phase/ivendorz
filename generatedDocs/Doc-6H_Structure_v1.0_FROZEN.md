# Doc-6H — M6 Communication (`communication`) Schema Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the `communication` schema realization |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6H_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied, 1 MAJOR + 3 MINOR + 1 NIT; history retained there). Certified by `Doc-6H_Structure_Freeze_Audit_v1.0.md` |
| Module | **M6 — Communication** (`communication` schema). **Delivery-only** — chat/RFQ threads (participant-grant RLS) + notifications + email/SMS/WhatsApp delivery logs (append-only) + support. M6 transmits; owns no business content |
| Realizes | **Doc-2 §10.7** — **9 tables / 4 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4H (consumed); Doc-3 v1.5 (`communication.*` POLICY — registered, 2 keys); Doc-6B (`core`); Doc-6C/6E (UUID + event); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.5), Doc-4A v1.0, Doc-4H v1.0 (FROZEN), Doc-4L/4M, Doc-6A…6G v1.0 (FROZEN) |
| Contains | Structure only — section map, 9-table partition, ratified decisions (CM-CR1–CR12), participant-grant RLS model, state machines, delivery-only firewall, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Delivery-only:** M6 owns the **transmission**, not the authoritative business content. Logs **append-only**. **Schema = `communication`** (Doc-2 §10.7 + Doc-3 v1.5 binding; CLAUDE.md `comms` = non-authoritative slip → patch). RLS = backstop |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.7 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions ratified at structure freeze (CM-CR-set)

- **CM-CR1 — 9 tables / 4 groupings (Doc-2 §10.7), coin nothing.** Messaging (`threads`+`messages`+`thread_participants`) · Notifications (`notifications`) · Delivery Logs (`email_logs`+`sms_logs`+`whatsapp_logs`) · Support (`support_tickets`+`ticket_messages`). *(email/sms/whatsapp = 3 tables.)* A 10th is non-conformant.
- **CM-CR2 — Delivery-only (M6 transmits, owns no business content).** Transmission facts (who/when/channel/delivery-status), not the authoritative business record (source module owns it). Delivery logs = append-only.
- **CM-CR3 — Participant-grant RLS (third grant pattern).** `threads`/`messages` shared via `thread_participants` (`participant_organization_id = active org` anchor); message read = a thread participant; write = sender. **Never cross-schema traversal** (Doc-2 §10.11 #9). (M3 = invitation-grantees; M4 = party columns; M6 = thread-participant grant rows.)
- **CM-CR4 — Append-only delivery logs.** `email_logs`/`sms_logs`/`whatsapp_logs` **NO SD**; `status(queued/sent/delivered/failed)`; column-scoped immutability (delivery facts frozen; only `status` advances); `source_event_id` → M0 outbox.
- **CM-CR5 — State machines.** `threads.status`(open/closed) · `thread_participants.status`(active/removed) · `support_tickets.status`(open/in_progress/resolved/closed) · log `status`(queued/sent/delivered/failed); enum + CHECK; service transitions; thread/notification/log creation consumes M0 outbox events.
- **CM-CR6 — Messages (Realtime-backed; SD = hidden).** Supabase-Realtime source; `body`/`attachments_refs`/`sent_at`; YES SD; `sender_user_id`/`sender_organization_id` → M1.
- **CM-CR7 — Notifications (recipient-tenant; in_app).** `recipient_user_id`/`recipient_organization_id` tenant; `channel(in_app)`; `title`/`body`/`payload_jsonb`/`read_at`; `source_event_id` → M0; YES SD.
- **CM-CR8 — Support (org + staff).** `support_tickets` `organization_id` + staff; `status`; `priority`. `ticket_messages` append-only (`author_id` = user or staff).
- **CM-CR9 — Polymorphic context + event refs (bare UUID, no FK).** `threads.context_id`+`context_type`; `source_event_id` → `core.outbox_events`; cross-module = bare UUID.
- **CM-CR10 — POLICY: registered (Doc-3 v1.5); `[ESC-6-POLICY]` CLEARED.** 2 `communication.*` keys.
- **CM-CR11 — No `human_ref`; schema = `communication`** (binding; CLAUDE.md `comms` slip → patch). CHK-6-002 N/A.
- **CM-CR12 — Indexing + carried DD.** Cursor/anchor indexes; partial `WHERE deleted_at IS NULL` (SD tables); notifications/logs consume M0 events. Carried: DD-CORE/RFQ, **`[ESC-COMM-AUDIT]`**.

## The `communication` schema partition (the structural spine)

| Doc-2 §10.7 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `threads` | Messaging | shared via `thread_participants` | YES (close) | `status` | §3.1 |
| `messages` | ↳ | participants (Realtime-backed) | YES (=hidden) | — | §3.1 |
| `thread_participants` | ↳ | **grant row** (`participant_organization_id = active org`) | NO (removed) | `status` | §3.1 |
| `notifications` | Notifications | recipient `organization_id` | YES (archive) | `read_at` | §3.2 |
| `email_logs`·`sms_logs`·`whatsapp_logs` | Delivery Logs | platform-internal (delivery) | NO (append-only) | `status` | §3.3 |
| `support_tickets` | Support | `organization_id` + staff | YES | `status` | §3.4 |
| `ticket_messages` | ↳ | as ticket | NO (append-only) | — | §3.4 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4H → Doc-6A → Doc-6B…6G → **Doc-6H** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried: DD-CORE/RFQ, `[ESC-COMM-AUDIT]`, schema-name slip; `[ESC-6-POLICY]` CLEARED (v1.5). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.7`; `Doc-4H`.

## §1 — Scope & the `communication` Table Partition
Governs 9 tables / not (RFQ/thread business content = M3; notification source events = owning modules; identity = M1). Delivery-only; participant-grant RLS; append-only logs. **Deps:** `Doc-2 §2/§10.7`; `Doc-4H`; `Doc-6A §1`.

## §2 — Participant-Grant Tenancy & RLS Model *(load-bearing)*
Classes: participant-grant (`threads`/`messages` via `thread_participants`); recipient-tenant (`notifications`); platform-internal (logs); org+staff (`support_tickets`/`ticket_messages`). Grant rows materialized by the messaging service; refresh-on-removal. Never cross-schema traversal. RLS = backstop; authz app-layer (Doc-4H). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.7/§10.11`; `Doc-6A §4`; `Doc-4H`.

## §3 — Per-Aggregate Realization
§3.1 Messaging (participant-grant RLS; Realtime) · §3.2 Notifications (recipient-tenant; M0 event source) · §3.3 Delivery Logs (append-only; column-scoped status; M0 event source) · §3.4 Support (org+staff; ticket_messages append-only). **Deps:** `Doc-2 §10.7`; `Doc-4H`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization
`threads.status` · `thread_participants.status` · `support_tickets.status` · log `status`; enum + CHECK; service transitions; thread/notification/log creation consumes M0 outbox events (Doc-2 §8); transitions → `core.outbox_events` where §8 lists an emitter. **Deps:** `Doc-2 §8/§10.7`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-CORE/RFQ)
Bare-UUID + service + event: notifications/logs consume M0 outbox events (`source_event_id`); thread `context_id` → source module; identity refs → M1. Delivery-only: M6 owns no business content. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4H`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H); thread-participant anchor index; `messages(thread_id, sent_at)`; `notifications(recipient_organization_id, read_at)`; logs `(source_event_id)`/`(status)`; partial `WHERE deleted_at IS NULL` (SD tables); page-size via `communication.*` POLICY. **Deps:** `Doc-5H`; `Doc-6A §10/§12`; `Doc-3 v1.5`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → threads → messages → thread_participants → notifications → email/sms/whatsapp_logs → support_tickets → ticket_messages → indexes → triggers → RLS); POLICY = Doc-3 v1.5 (CLEARED). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.5`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C participant-grant/recipient-tenant/platform-internal; Band D append-only logs/ticket_messages; CHK-6-002 N/A); carried register (DD-CORE/RFQ, `[ESC-COMM-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.7`.

## Appendix A — Doc-6H Conformance Attestation (Doc-6A `CHK-6-001…093`)
Highlights: **Band C PASS** (participant-grant RLS; recipient-tenant; platform-internal logs; org+staff support) · Band D PASS (append-only delivery logs + `ticket_messages`; column-scoped log status; messages SD=hidden) · Band E PASS (CHK-6-040/041; M0-event consumption; `[ESC-COMM-AUDIT]` at 043) · **CHK-6-002 N/A** (no human_ref) · CHK-6-050 N/A (no money) · CHK-6-005 PASS (PK/partial-uniques). **Deps:** `Doc-6A Appendix A`; `Doc-5H`.

---

## Open Carried Items
| ID | Item | Doc-6H handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / machines / Doc-5H persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-CORE / DD-RFQ | outbox events drive notifications/logs / thread context | consume events; bare UUID | No |
| **Delivery-only firewall** | M6 owns no business content | transmission facts only; logs append-only | No (binding) |
| **`[ESC-COMM-AUDIT]`** | comms audit actions vs Doc-2 §9 | bind nearest §9 by pointer | No (content: bind) |
| **Schema-name slip** | CLAUDE.md `comms` vs Doc-2 `communication` | realize `communication`; flag CLAUDE for patch | No (orientation erratum) |
| `[ESC-6-POLICY]` | `communication.*` keys | **CLEARED** — Doc-3 v1.5 | No |

## Fences / Out of scope
Any non-`communication` table · RFQ/thread business content (M3) · notification source authority · coining any element · a cross-schema FK · cross-schema RLS traversal · M6 owning a business record · DDL/Prisma/migration bodies (content passes).

---

*End of Doc-6H Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes the Proposal (v0.2, 1 MAJOR + 3 MINOR + 1 NIT applied); certified by `Doc-6H_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6H realizes the 9 `communication` tables verbatim from Doc-2 §10.7 against frozen Doc-6A — delivery-only (M6 transmits, owns no business content); participant-grant RLS; append-only delivery logs; coins nothing. Carried: delivery-only firewall + `[ESC-COMM-AUDIT]` + schema-name slip (CLAUDE `comms`→`communication`). Next: content passes → Content Hard Review → Content Freeze Audit → `Doc-6H_SERIES_FROZEN`.*
