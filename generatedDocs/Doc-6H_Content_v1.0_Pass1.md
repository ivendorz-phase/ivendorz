# Doc-6H — M6 Communication (`communication`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 Messaging)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §0–§2 + §3.1. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | the **Messaging grouping** — `threads` (status; polymorphic context) + `messages` (Realtime-backed; SD=hidden) + `thread_participants` (the participant-grant RLS anchor). The participant-grant RLS model |
| Authority | `Doc-2 §6/§10.7/§10.11` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (consumed); `Doc-6C/6E` (by UUID); `Doc-4H` (M6 ownership); `Doc-3 v1.5` (`communication.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.7; `thread_type`/`status`/`participant_status` sets verbatim; **no human_ref**; schema = `communication`; physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("communication")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6H realizes Doc-2 §10.7 against frozen Doc-6A; passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.5 — 2 `communication.*` keys). Carried: `[ESC-COMM-AUDIT]` (Pass-3); schema-name slip (CLAUDE `comms`→`communication`). Coins nothing.

## §1 — Scope & the `communication` Table Partition (Pass-1 slice)
Pass-1 realizes the **Messaging grouping** (§3.1) + the **participant-grant RLS model** (§2). **Deferred:** Notifications + Delivery Logs → Pass-2; Support + §4–§8 + Appendix A → Pass-3. **Delivery-only:** the thread/message carry transmission, not the authoritative business content (the RFQ thread context → M3).

## §2 — Participant-Grant Tenancy & RLS Model *(the load-bearing section)*
| Class | Pass-1 tables | RLS |
|---|---|---|
| **Participant-grant** | `threads`, `messages` | a thread participant (`EXISTS thread_participants WHERE participant_organization_id = active_org AND status='active'`) reads; the **sender** writes a message |
| **Grant anchor** | `thread_participants` | `participant_organization_id = active_org` (self) **OR** admin |

**Nested-RLS note (HQ-003 class):** the thread/message read anchors on `thread_participants` whose own RLS is the **simple** `participant_organization_id = active_org` — a single indexed predicate, non-defeatable. Authorization is app-layer (Doc-4H); RLS = backstop. Grant rows materialized + `status='removed'` on departure (refresh-on-removal). Tests = Doc-8.

---

## §3.1 — The Messaging grouping

### §3.1.1 `communication.threads` (polymorphic context; status; SD=close)
Realizes Doc-2 §10.7. Polymorphic `context_id`+`context_type` (bare UUID + discriminator, no FK); `thread_type`; `status`; YES SD.

```sql
CREATE TYPE communication.thread_type AS ENUM ('direct','rfq_clarification');  -- [Doc-2 §10.7 binding]
CREATE TYPE communication.thread_status AS ENUM ('open','closed');             -- [Doc-2 §10.7 binding]

CREATE TABLE communication.threads (
  id uuid NOT NULL,                                            -- [Doc-6A §3.1] PK UUIDv7
  thread_type communication.thread_type NOT NULL,             -- [Doc-2 §10.7]
  context_id uuid,                                            -- [Doc-2 §10.7] polymorphic bare UUID (rfq etc. → M3)
  context_type text,                                          -- [Doc-2 §10.7] discriminator
  status communication.thread_status NOT NULL DEFAULT 'open', -- [Doc-2 §10.7]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT threads_pkey PRIMARY KEY (id)
);
CREATE INDEX threads_context_idx ON communication.threads (context_type, context_id) WHERE deleted_at IS NULL;  -- [§2.5]
```
- **Delivery-only (CM-CR2):** the thread is the **conversation transport**; the business object it discusses (an RFQ) lives in M3 — `context_id` is a bare reference. **RLS:** participant-grant (§3.x). **Prisma [§2.5]:** `Thread`, enums.

### §3.1.2 `communication.messages` (Realtime-backed; SD=hidden)
Realizes Doc-2 §10.7. In-module FK → `threads`; `sender_user_id`/`sender_organization_id` → M1; YES SD (=hidden).

```sql
CREATE TABLE communication.messages (
  id uuid NOT NULL, thread_id uuid NOT NULL,                  -- [Doc-6A §5.2] in-module FK
  sender_user_id uuid, sender_organization_id uuid,           -- [Doc-2 §10.7] bare UUID → M1 (sender_organization_id = write anchor)
  body text, attachments_refs jsonb,                          -- [Doc-2 §10.7] ([§2.5] jsonb refs)
  sent_at timestamptz NOT NULL DEFAULT now(),                 -- [Doc-2 §10.7] (Realtime-backed)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.7] SD = hidden
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_thread_fk FOREIGN KEY (thread_id) REFERENCES communication.threads(id)
);
CREATE INDEX messages_thread_sent_idx ON communication.messages (thread_id, sent_at) WHERE deleted_at IS NULL;  -- [§2.5] Realtime feed + history
```
- **Realtime-backed (CM-CR6):** Supabase Realtime streams from this table; SD = **hidden** (a deleted message is suppressed, retained for audit). **RLS:** participant read; sender write (§3.x). **Prisma [§2.5]:** `Message`.

### §3.1.3 `communication.thread_participants` (the grant anchor; composite PK; removed-state)
Realizes Doc-2 §10.7. In-module FK → `threads`; `participant_organization_id` = the RLS anchor; PK (thread_id, participant_organization_id); **NO SD** (removed state).

```sql
CREATE TYPE communication.participant_status AS ENUM ('active','removed');  -- [Doc-2 §10.7 binding]

CREATE TABLE communication.thread_participants (
  thread_id uuid NOT NULL, participant_organization_id uuid NOT NULL,  -- [Doc-2 §10.7] composite PK; org = RLS anchor
  participant_user_id uuid,                                   -- [Doc-2 §10.7] bare UUID → M1
  status communication.participant_status NOT NULL DEFAULT 'active',  -- [Doc-2 §10.7]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  CONSTRAINT thread_participants_pkey PRIMARY KEY (thread_id, participant_organization_id)  -- [Doc-2 §10.7] composite PK
);
CREATE INDEX thread_participants_org_idx ON communication.thread_participants (participant_organization_id) WHERE status = 'active';  -- [§2.5] the RLS-anchor index
```
- **Grant anchor (CM-CR3):** the messaging service writes a participant row per org in the thread; **removal = `status='removed'`** (the row retained for audit). **RLS:** self (`participant_organization_id = active_org`) + admin (§3.x). **Prisma [§2.5]:** `ThreadParticipant`, `@@id([threadId, participantOrganizationId])`, enum.

## §3.x — Consolidated RLS DDL (Pass-1 — participant-grant)
```sql
-- threads: participant read | admin; create/close by service/participant
ALTER TABLE communication.threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY threads_participant ON communication.threads FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM communication.thread_participants p
                     WHERE p.thread_id = threads.id
                       AND p.participant_organization_id = current_setting('app.active_org', true)::uuid
                       AND p.status = 'active'))
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM communication.thread_participants p
                     WHERE p.thread_id = threads.id
                       AND p.participant_organization_id = current_setting('app.active_org', true)::uuid
                       AND p.status = 'active'));

-- messages: participant read | sender write | admin
ALTER TABLE communication.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_participant_read ON communication.messages FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE
         OR EXISTS (SELECT 1 FROM communication.thread_participants p
                     WHERE p.thread_id = messages.thread_id
                       AND p.participant_organization_id = current_setting('app.active_org', true)::uuid
                       AND p.status = 'active'));
CREATE POLICY messages_sender_write ON communication.messages FOR INSERT
  WITH CHECK (sender_organization_id = current_setting('app.active_org', true)::uuid
              AND EXISTS (SELECT 1 FROM communication.thread_participants p
                           WHERE p.thread_id = messages.thread_id
                             AND p.participant_organization_id = current_setting('app.active_org', true)::uuid
                             AND p.status = 'active'));
CREATE POLICY messages_admin ON communication.messages FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- thread_participants: self (own org) read | admin write (grant/remove)
ALTER TABLE communication.thread_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY thread_participants_self ON communication.thread_participants FOR SELECT
  USING (participant_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY thread_participants_admin ON communication.thread_participants FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (participant grant/removal runs under the messaging service path; users don't write their own grants.)
```

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent. Verified CORRECT: the 3-table set + columns (Doc-2 §10.7), `thread_type`/`thread_status`/`participant_status` sets verbatim, composite PK on `thread_participants`, the participant-grant anchor, polymorphic context, no human_ref, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **MSG-SENDER** message write not anchored on the sender → a non-participant could post | BLOCKER | **FIXED** — `messages_sender_write`: `sender_organization_id = active_org` AND participant-EXISTS; only a participant sender writes. |
| **NEST-RLS** thread/message read via nested `EXISTS` on `thread_participants` (HQ-003 class) | MAJOR | **FIXED/verified** — the anchor RLS is the simple `participant_organization_id = active_org`; non-defeatable; documented. |
| **CTX-FK** polymorphic `context_id` cross-entity FK | MAJOR | **CONFIRMED bare-UUID** — `context_type` discriminator; no FK; service-validated; delivery-only (the business object is M3's). |
| **MSG-HIDE** `messages` SD semantics | MINOR | **CONFIRMED** — SD = hidden (suppressed, retained for audit); not a hard delete. |
| **PART-PK** `participant_user_id` vs composite PK | MINOR | **CONFIRMED** — PK = (thread_id, participant_organization_id) per Doc-2; `participant_user_id` is an attribute (one org-grant per thread; the acting user recorded). |

**Net:** 1 BLOCKER (sender anchor) + 2 MAJOR (nested-RLS verify, context bare-UUID) fixed/confirmed; 2 MINOR confirmed. Participant-grant RLS non-defeating; delivery-only. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6H Content Pass-1 (§0–§2 · §3.1 Messaging) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the participant-grant RLS (third grant pattern; thread/message read via the simple `thread_participants` anchor; sender-anchored write), the Realtime-backed messages (SD=hidden), and the polymorphic thread context (delivery-only — the business object is the source module's). Columns verbatim Doc-2 §10.7; states verbatim; no human_ref; coins nothing. Next: Pass-2 (Notifications + Delivery Logs — append-only; M0 outbox-event source; column-scoped log status).*
