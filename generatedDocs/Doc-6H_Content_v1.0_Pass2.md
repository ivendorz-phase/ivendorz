# Doc-6H — M6 Communication (`communication`) Schema Realization — Content v1.0 **Pass-2** (§3.2 Notifications · §3.3 Delivery Logs)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §3.2 + §3.3. Next: Pass-3 |
| Date | 2026-06-26 |
| Realizes | **Notifications** (`notifications` — recipient-tenant; M0-event source) + **Delivery Logs** (`email_logs`/`sms_logs`/`whatsapp_logs` — append-only; column-scoped status; delivery-only) |
| Authority | `Doc-2 §8/§10.7` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (`core.outbox_events` + `core.raise_immutable_violation` consumed); `Doc-4H` (M6 ownership); `Doc-3 v1.5` (`communication.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.7; `channel`/`delivery_log_status` sets verbatim; physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("communication")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.2 — `communication.notifications` (recipient-tenant; M0-event source; in_app)
Realizes Doc-2 §10.7. `recipient_user_id`/`recipient_organization_id` (M1, tenant); `source_event_id` → M0 (`core.outbox_events`); `channel(in_app)`; YES SD.

```sql
CREATE TYPE communication.notification_channel AS ENUM ('in_app');  -- [Doc-2 §10.7 `channel(in_app)`] only value

CREATE TABLE communication.notifications (
  id uuid NOT NULL,
  recipient_user_id uuid, recipient_organization_id uuid NOT NULL,  -- [Doc-2 §10.7] bare UUID → M1 (org = RLS tenant)
  source_event_id uuid,                                      -- [Doc-2 §10.7] bare UUID → M0 core.outbox_events (the trigger)
  channel communication.notification_channel NOT NULL DEFAULT 'in_app',  -- [Doc-2 §10.7]
  title text, body text, payload_jsonb jsonb,               -- [Doc-2 §10.7]
  read_at timestamptz,                                      -- [Doc-2 §10.7]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.7] SD = archive
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE INDEX notifications_recipient_idx ON communication.notifications (recipient_organization_id, read_at) WHERE deleted_at IS NULL;  -- [§2.5] inbox feed
```
- **M0-event source (CM-CR7):** a notification is created by M6 as a **consumer** of an M0 outbox event (`source_event_id` → `core.outbox_events`); the recipient sees it. `read_at` tracks read state (recipient-mutable). **Delivery-only:** the notification transmits; the business fact is the source module's. **RLS:** recipient-tenant (§3.x). **Prisma [§2.5]:** `Notification`, enum `NotificationChannel`.

## §3.3 — Delivery Logs (`email_logs` · `sms_logs` · `whatsapp_logs`; append-only)
Realizes Doc-2 §10.7. `recipient` refs + `source_event_id` → M0; `template`/`status`/`provider_ref`; **NO SD; append-only** (column-scoped — only `status` advances). Identical shape for all three channels.

```sql
CREATE TYPE communication.delivery_log_status AS ENUM ('queued','sent','delivered','failed');  -- [Doc-2 §10.7 binding]

-- representative: communication.email_logs (sms_logs / whatsapp_logs structurally identical)
CREATE TABLE communication.email_logs (
  id uuid NOT NULL,
  recipient_ref text NOT NULL,                              -- [Doc-2 §10.7] email address / channel recipient
  recipient_organization_id uuid,                          -- [Doc-2 §10.7] bare UUID → M1 (where applicable)
  source_event_id uuid,                                    -- [Doc-2 §10.7] bare UUID → M0 core.outbox_events
  template text NOT NULL,                                  -- [Doc-2 §10.7]
  status communication.delivery_log_status NOT NULL DEFAULT 'queued',  -- [Doc-2 §10.7]
  provider_ref text,                                       -- [Doc-2 §10.7] gateway message id
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT email_logs_pkey PRIMARY KEY (id)
);
CREATE INDEX email_logs_event_idx ON communication.email_logs (source_event_id);  -- [§2.5]
CREATE INDEX email_logs_status_idx ON communication.email_logs (status) WHERE status IN ('queued','failed');  -- [§2.5] retry queue
-- append-only delivery record: facts frozen; only status advances (queued→sent→delivered/failed) (column-scoped):
CREATE TRIGGER email_logs_immutable BEFORE UPDATE OR DELETE ON communication.email_logs FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','recipient_ref','recipient_organization_id','source_event_id','template','created_at','created_by');  -- [Doc-6B §4] status/provider_ref/updated_at mutable; DELETE blocked
-- sms_logs / whatsapp_logs: identical table + trigger (s/email_logs/<table>/).
```
- **Append-only delivery record (CM-CR4):** a delivery log is **immutable** except `status` (the gateway-callback advance `queued→sent→delivered`/`failed`) + `provider_ref` (set once the gateway returns). **No SD** (permanent delivery audit). **Platform-internal delivery** (Doc-2 tenant `—`): admin/System read; the delivery worker (owner-role/`SECURITY DEFINER`) writes. **RLS:** admin read; System write (§3.x). **Prisma [§2.5]:** `EmailLog`/`SmsLog`/`WhatsappLog`, enum `DeliveryLogStatus`.

## §3.x — Consolidated RLS DDL (Pass-2)
```sql
-- notifications: recipient-tenant + admin
ALTER TABLE communication.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_recipient ON communication.notifications FOR ALL
  USING (recipient_organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (recipient_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- email_logs / sms_logs / whatsapp_logs: platform-internal — admin READ; System write (delivery worker); append-only
ALTER TABLE communication.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_logs_admin_read ON communication.email_logs FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (no in-band write policy on the logs = only the delivery worker [owner-role/SECURITY DEFINER] writes; UPDATE/DELETE further
--  constrained by the column-scoped immutability trigger. sms_logs / whatsapp_logs: identical.)
```

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent. Verified CORRECT: the 4-table set + columns (Doc-2 §10.7), `channel`/`delivery_log_status` sets verbatim, M0-event source pattern, append-only logs, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **LOG-IMM** delivery logs "append-only" with mutable `status` but no guard | BLOCKER | **FIXED** — column-scoped trigger via `core.raise_immutable_violation` (facts frozen; `status`/`provider_ref` mutable; DELETE blocked); applied to all three log tables. |
| **LOG-WRITE** delivery logs writable in-band would let a user forge a delivery status | MAJOR | **FIXED** — §3.x: admin **read-only**; **no in-band write policy**; the delivery worker (owner-role/`SECURITY DEFINER`) writes. |
| **NOTIF-EVT** notification source-event link unclear | MAJOR | **CONFIRMED** — §3.2: `source_event_id` → M0 `core.outbox_events`; M6 consumes the event, creates the notification; bare UUID (no cross-schema FK). |
| **CHAN-ENUM** `channel(in_app)` single-value enum | MINOR | **CONFIRMED** — Doc-2 §10.7 declares only `in_app`; single-value enum (no extra value coined). |
| **READ-AT** `read_at` recipient-mutable on an otherwise tenant row | MINOR | **CONFIRMED** — notifications are recipient-owned (no immutability); `read_at` toggled by the recipient. |

**Net:** 1 BLOCKER (log immutability) + 2 MAJOR (log write-forge, event-source) fixed/confirmed; 2 MINOR confirmed. Delivery logs append-only + System-written; notifications recipient-tenant. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6H Content Pass-2 (§3.2 Notifications · §3.3 Delivery Logs) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the recipient-tenant notifications (M0-outbox-event source; `read_at`) and the append-only delivery logs (email/sms/whatsapp; column-scoped status; System-written delivery worker; no in-band write). Columns verbatim Doc-2 §10.7; states verbatim; coins nothing. Next: Pass-3 (Support `support_tickets`/`ticket_messages` + §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A).*
