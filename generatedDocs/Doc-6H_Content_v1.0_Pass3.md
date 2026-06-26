# Doc-6H — M6 Communication (`communication`) Schema Realization — Content v1.0 **Pass-3** (§3.4 Support · §4–§8 · Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 (FINAL) — Independent Hard Review applied** (0 BLOCKER + 2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Completes §3.4 + §4–§8 + Appendix A (37/37). Next: Content Hard Review (cross-pass) → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes | **Support** (`support_tickets` org+staff + `ticket_messages` append-only); §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A |
| Authority | `Doc-2 §8/§10.7` (the *what*); `Doc-6A` (Appendix A gate); `Doc-6B §4` (consumed); `Doc-4H/4L/4M`; `Doc-3 v1.5`; `Doc-5H` |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.7; `support_ticket_status` set verbatim; `priority` = text (Doc-2 enumerates no values). Carried: `[ESC-COMM-AUDIT]` |
| DDL note | PostgreSQL 15+; Prisma `@@schema("communication")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.4 — Support

### §3.4.1 `communication.support_tickets` (org + staff; status) · §3.4.2 `communication.ticket_messages` (append-only)
Realizes Doc-2 §10.7. `support_tickets` `organization_id` + staff; `status`; `priority`; YES SD. `ticket_messages` → `support_tickets`; `author_id` (user **or** staff); **NO SD append-only**.

```sql
CREATE TYPE communication.support_ticket_status AS ENUM ('open','in_progress','resolved','closed');  -- [Doc-2 §10.7 binding]

CREATE TABLE communication.support_tickets (
  id uuid NOT NULL, organization_id uuid NOT NULL,            -- [Doc-2 §10.7] tenant
  opened_by uuid,                                            -- [Doc-2 §10.7] bare UUID → M1
  status communication.support_ticket_status NOT NULL DEFAULT 'open',  -- [Doc-2 §10.7]
  subject text NOT NULL,                                     -- [Doc-2 §10.7]
  priority text,                                             -- [Doc-2 §10.7] (no values declared → text [§2.5])
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id)
);
CREATE INDEX support_tickets_org_status_idx ON communication.support_tickets (organization_id, status) WHERE deleted_at IS NULL;  -- [§2.5]

CREATE TABLE communication.ticket_messages (
  id uuid NOT NULL, support_ticket_id uuid NOT NULL,         -- [Doc-6A §5.2] in-module FK
  author_id uuid,                                            -- [Doc-2 §10.7] bare UUID → M1 (user OR staff)
  body text NOT NULL,                                        -- [Doc-2 §10.7]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.7] (NO SD — append-only)
  CONSTRAINT ticket_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ticket_messages_ticket_fk FOREIGN KEY (support_ticket_id) REFERENCES communication.support_tickets(id)
);
CREATE TRIGGER ticket_messages_immutable BEFORE UPDATE OR DELETE ON communication.ticket_messages FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','support_ticket_id','author_id','body','created_at','created_by');  -- [Doc-6B §4] append-only
```
- **Two-party (CM-CR8):** the **org** (buyer/vendor) + **platform staff** both participate; `author_id` records either. **RLS:** org-tenant + staff (§3.x). **Prisma [§2.5]:** `SupportTicket` (enum `SupportTicketStatus`), `TicketMessage`.

```sql
-- support_tickets: org tenant + staff
ALTER TABLE communication.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_tickets_party ON communication.support_tickets FOR ALL
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ticket_messages: via parent ticket (org or staff); append-only
ALTER TABLE communication.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY ticket_messages_party ON communication.ticket_messages FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM communication.support_tickets t WHERE t.id = ticket_messages.support_ticket_id
                      AND t.organization_id = current_setting('app.active_org', true)::uuid))
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM communication.support_tickets t WHERE t.id = ticket_messages.support_ticket_id
                      AND t.organization_id = current_setting('app.active_org', true)::uuid));
-- (UPDATE/DELETE blocked by the immutability trigger.)
```

## §4 — State Machine Realization
| Machine | Table | Owner |
|---|---|---|
| `threads.status` (open/closed) · `thread_participants.status` (active/removed) | Pass-1 | service |
| `support_tickets.status` (open/in_progress/resolved/closed) | §3.4 | org + staff service |
| delivery-log `status` (queued/sent/delivered/failed) | Pass-2 | delivery worker (gateway callback) |

**Transition = outbox (Doc-2 §8):** emitter transitions write the row + `core.outbox_events` where §8 lists one; **notifications + delivery logs are M0-event consumers** (`source_event_id` → `core.outbox_events`). Event slugs bound to Doc-2 §8/Doc-4L; none coined. `[ESC-COMM-AUDIT]` for comms audit actions.

## §5 — Cross-Module Reads & Firewalls (DD-CORE/RFQ)
Bare-UUID + service + event. **DD-CORE:** notifications/logs **consume M0 outbox events** (`source_event_id`); the source business fact is the owning module's. **DD-RFQ:** thread `context_id` → M3 (delivery-only — M6 transmits the clarification, M3 owns the RFQ). Identity refs → M1. **Delivery-only firewall:** M6 owns no business content. No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4H`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5H lists; thread-participant anchor index; `messages(thread_id, sent_at)`; `notifications(recipient_organization_id, read_at)`; logs `(source_event_id)`/`(status)`; `support_tickets(organization_id, status)`; partial `WHERE deleted_at IS NULL` (SD tables); page-size via `communication.*` POLICY. **Deps:** `Doc-5H`; `Doc-6A §10/§12`; `Doc-3 v1.5`.

## §7 — POLICY & Forward-Only Migration
**POLICY = Doc-3 v1.5 (CLEARED):** 2 `communication.*` keys in `core.system_configuration`; M6 reads, coins none.
**Forward-only order:** (assume core/identity/marketplace/rfq/operations/trust migrated) `CREATE SCHEMA communication` → enums → threads → messages → thread_participants → notifications → email_logs → sms_logs → whatsapp_logs → support_tickets → ticket_messages → indexes → triggers (immutability) → RLS → seeds (none owned by M6). Forward-only, idempotent.

## §8 — Conformance & Carried Items
Coins nothing; every element traces to Doc-2 §10.7 or a §2.5 attribution. Carried: **`[ESC-COMM-AUDIT]`** (comms audit actions — bind nearest Doc-2 §9 by pointer) · DD-CORE/RFQ · delivery-only firewall · **schema-name slip** (CLAUDE `comms`→`communication` — orientation patch). `[ESC-6-POLICY]` **CLEARED**.

## Appendix A — Doc-6H Conformance Attestation (Doc-6A `CHK-6-001…093`, 37 checks)

| Band | Check | Verdict | Evidence |
|---|---|---|---|
| **A** | 001 | PASS | every table `id uuid` PK (thread_participants composite PK + own id) |
| | 002 | **N/A** | **no `human_ref`** — Doc-2 §10.7 declares none |
| | 003 | PASS | timestamps; append-only tables omit `updated_at` |
| | 004 | PASS | SD tuple on threads/messages/notifications/support_tickets; logs/participants/ticket_messages correctly no SD (participants = removed-state) |
| | 005 | PASS | `thread_participants` composite PK; partial-live indexes |
| **B** | 010 | PASS | physical `communication` namespace; one Prisma `@@schema` |
| | 011 | PASS | **no cross-schema FK** — context/source-event/recipient/sender all bare UUID |
| | 012 | PASS | refs entity-named, service-validated, orphan-scan |
| | 013 | PASS | no cross-schema JOIN/traversal; participant RLS intra-schema |
| **C** | 020 | PASS | RLS on every table; participant/recipient/org+staff anchors server-set, fail-closed |
| | 021 | PASS | **participant-grant** anchor (`thread_participants`); refresh-on-removal (status) |
| | 022 | PASS | non-disclosure N/A-by-shape (no blacklist here); message read strictly participant; logs platform-internal |
| | 023 | PASS | authz app-layer (Doc-4H); RLS = backstop; logs System-write only |
| **D** | 030 | PASS | no hard-DELETE of authoritative rows; messages SD=hidden |
| | 031 | PASS | append-only delivery logs (column-scoped status) + `ticket_messages` (full) |
| | 032 | PASS | logs INSERT-only under System; no derived-cache hard-delete |
| | 033 | **N/A** | no `ai.*` cache |
| **E** | 040 | PASS | thread/ticket transitions + outbox (§4) |
| | 041 | PASS | no event coined; notifications/logs **consume** M0 outbox events; bound Doc-2 §8/4L |
| | 042 | PASS | audit via `core.audit_records` |
| | 043 | **PASS-with-carry** | comms audit gap = **`[ESC-COMM-AUDIT]`** |
| **F** | 050 | **N/A** | no monetary column in `communication` |
| **G** | 060 | PASS | reads `core.system_configuration`; 2 `communication.*` keys (Doc-3 v1.5) |
| | 061 | PASS | page-size/idempotency from POLICY, never literals |
| | 062 | **N/A** | no role seed in M6 |
| **H** | 070 | PASS | Doc-5H reads/lists persistable (threads, messages, notifications, logs, tickets) |
| | 071 | PASS | composite sort-key indexes (§6) |
| | 072 | PASS | idempotency persisted where Doc-5H declares; `communication.idempotency_dedup_window` |
| | 073 | PASS | no non-persistable Doc-5H surface |
| **I** | 080 | PASS | nothing coined; every element traces to Doc-2 §10.7 |
| | 081 | PASS | physical specifics §2.5-attributed (participant anchor, polymorphic context, log column-scoped, text priority) |
| | 082 | PASS | `[ESC-COMM-AUDIT]` + schema-name slip via named channels |
| | 083 | PASS | no Doc-2 decision re-opened |
| **J** | 090 | PASS | extends B.1 base + B.2 types |
| | 091 | PASS | coins no shared enum; reuses B.3 (`actor_type`/outbox `status`); M6 enums module-owned |
| | 092 | PASS | B.4 naming followed |
| | 093 | PASS | B.5 conventions realized |

**37/37 — 0 FAIL.** N/A: 002 (no human_ref), 033 (no ai), 050 (no money), 062 (no role seed) — each justified. PASS-with-carry: 043.

---

## Review Disposition (Independent Hard Review — Pass-3)

Reviewer: independent. Verified CORRECT: the 2-table set + columns (Doc-2 §10.7), `support_ticket_status` set verbatim, append-only `ticket_messages`, two-party org+staff, the 37/37 Appendix A (4 justified N/A), coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **TM-IMM** `ticket_messages` "append-only" without a guard | MAJOR | **FIXED** — full append-only trigger via `core.raise_immutable_violation` (all cols); DELETE blocked. |
| **TICKET-PARTY** support two-party (org + staff) RLS | MAJOR | **FIXED** — `support_tickets`: org-tenant OR staff; `ticket_messages`: via parent ticket (org or staff). |
| **PRIO-TEXT** `priority` enum values not in Doc-2 | MINOR | **CONFIRMED text** — Doc-2 §10.7 names the column, enumerates no values; `text` (no coined enum). |
| **CHK-NA** the four N/A checks (002/033/050/062) | MINOR | **CONFIRMED justified** — no human_ref / no ai / no money / no role-seed in `communication`. |
| **AUTHOR** `author_id` user-or-staff | NIT | **CONFIRMED** — single bare-UUID `author_id` (→ M1) records either a user or a staff actor (Doc-2 §10.7). |

**Net:** 0 BLOCKER; 2 MAJOR (ticket-message immutability, two-party RLS) fixed; 2 MINOR + 1 NIT confirmed. 37/37 Appendix A; delivery-only + append-only intact. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6H Content Pass-3 (FINAL) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Completes the `communication` realization: the two-party support tickets (org + staff) + append-only ticket messages, the §4 state consolidation (notifications/logs as M0-outbox-event consumers), the §5 delivery-only firewall (M6 owns no business content), §6 indexing, §7 forward-only migration, and §8 + Appendix A (37/37, 0 FAIL; 4 justified N/A). Coins nothing; carried `[ESC-COMM-AUDIT]` + schema-name slip. Next: Content Hard Review (cross-pass) → Content Freeze Audit → `Doc-6H_SERIES_FROZEN`.*
