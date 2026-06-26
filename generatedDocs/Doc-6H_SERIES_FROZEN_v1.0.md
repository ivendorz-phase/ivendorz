# Doc-6H — M6 Communication (`communication`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6H Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M6 — Communication** (`communication` schema) — **delivery-only**: chat/RFQ threads (participant-grant RLS) + notifications + email/SMS/WhatsApp delivery logs (append-only) + support. M6 transmits; owns no business content |
| Realizes | **Doc-2 §10.7** — **9 tables / 4 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with Doc-5H; consumes Doc-6B (`core`) + Doc-6C/6E (UUID + event) |
| Freeze evidence | `Doc-6H_Content_Freeze_Audit_v1.0.md` — PASS; 0 open BLOCKER/MAJOR/MINOR; 7 phases PASS. Cross-pass `Doc-6H_Content_Hard_Review_v1.0.md` — 0 BLOCKER/MAJOR; participant-grant + delivery-only verified |

---

## Effective set (the authoritative Doc-6H)

| Artifact | Role |
|---|---|
| `Doc-6H_Structure_v1.0_FROZEN.md` | Frozen structure — CM-CR1–CR12, 9-table partition, participant-grant RLS model, delivery-only firewall, Appendix-A map |
| `Doc-6H_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6H_Content_v1.0_Pass1.md` | §0–§2 participant-grant model · Messaging (threads/messages Realtime/thread_participants anchor) |
| `Doc-6H_Content_v1.0_Pass2.md` | Notifications (recipient-tenant; M0-event source) · Delivery Logs (email/sms/whatsapp — append-only; column-scoped status; System-written) |
| `Doc-6H_Content_v1.0_Pass3.md` | Support (org+staff tickets + append-only ticket_messages) · §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A (37/37, 0 FAIL) |
| `Doc-6H_Content_Hard_Review_v1.0.md` | Cross-pass review — 0 BLOCKER/MAJOR; participant-grant RLS termination + delivery-only + append-only verified; 2 OBSERVATION by-design |
| `Doc-6H_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6H realizes (the `communication` schema)

- **9 tables / 4 groupings** (Doc-2 §10.7), columns verbatim: Messaging (threads/messages/participants), Notifications, Delivery Logs (email/sms/whatsapp), Support (tickets/messages).
- **Delivery-only** — M6 carries **transmission** (who/when/channel/delivery-status), not the authoritative business content; thread `context_id`(→M3) + `source_event_id`(→M0) are bare references.
- **Participant-grant RLS** (third grant pattern) — `threads`/`messages` shared via `thread_participants` (`participant_organization_id = active org`, the simple anchor; nested RLS terminates, non-defeatable); message write sender-anchored; thread/participant creation service-mediated.
- **Append-only delivery logs** — `email_logs`/`sms_logs`/`whatsapp_logs` column-scoped immutability (facts frozen; only `status` queued→sent→delivered/failed + `provider_ref` advance via gateway callback); **System-written** (no in-band write policy); `source_event_id` → M0 outbox.
- **Notifications** — recipient-tenant; `in_app` channel; M0-outbox-event source (`source_event_id`); `read_at`. **Support** — two-party (org + staff); append-only `ticket_messages`.
- **Realtime-backed `messages`** (Supabase Realtime source; SD=hidden, retained for audit).
- **No `human_ref`** (Doc-2 §10.7 declares none — CHK-6-002 N/A); cross-module = bare UUID; coins nothing. **Schema = `communication`** (Doc-2 + Doc-3 v1.5 binding; CLAUDE.md `comms` = orientation slip patched).

## Carried items

`DR-6-CORE` (consumed) · `DR-6-STATE` (machines) · `DR-6-API` (Doc-5H Band H) · DD-CORE/RFQ · **delivery-only firewall** (M6 owns no business content) · **`[ESC-COMM-AUDIT]`** (comms audit actions vs Doc-2 §9 — bind nearest by pointer) · **schema-name slip** (CLAUDE `comms`→`communication` — orientation patch) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.5). Carry-forward to **Doc-8**: RLS positive/negative/cross-tenant + participant-grant + append-only-log tests (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (1 MAJOR — schema-name binding) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1/2/3 each per-pass-reviewed (sender anchor, nested-RLS, log immutability, log write-forge, ticket-message immutability, two-party RLS) · **cross-pass Content Hard Review** (0 BLOCKER/MAJOR — passes proactively applied prior lessons; participant-grant + delivery-only verified; 2 OBSERVATION by-design) · Content Freeze Audit (PASS).

---

*Doc-6H (M6 `communication` schema) is FROZEN. Realizes Doc-2 §10.7's 9 tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A — delivery-only (M6 transmits, owns no business content); participant-grant RLS (third grant pattern); append-only System-written delivery logs; notifications/logs as M0-event consumers; coins nothing. Carried: delivery-only firewall + `[ESC-COMM-AUDIT]` + schema-name slip (CLAUDE `comms`→`communication`). On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6I (M7 `billing`) — the platform's own revenue (`platform_invoices ≠ trade_invoices`); the billing firewall; entitlement-not-plan checks.*
