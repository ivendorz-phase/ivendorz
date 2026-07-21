-- Doc-6H — M6 Communication (`communication`) Schema Realization — `communication_channel_logs`
-- (forward-only; Doc-6A §11). W3-COMM-GRW-1 (B2-1) — the BC-COMM-3 Outbound Log channel structures:
-- `communication.email_logs` / `sms_logs` / `whatsapp_logs` (append-only delivery records).
-- Realizes Doc-6H §3.3 (FROZEN, Content Pass-2) VERBATIM — columns Doc-2 §10.7; the
-- `delivery_log_status` set verbatim (`queued`/`sent`/`delivered`/`failed`); the three tables
-- structurally identical ("sms_logs / whatsapp_logs: identical table + trigger"). COINS NOTHING —
-- no column, enum value, lifecycle state, or policy beyond the frozen Doc-6H DDL.
--
-- This slice realizes ONLY what the `comm.dispatch_invitation_delivery.v1` path (Doc-4H
-- GrowthDelivery Patch v1.0.1 §HB-3.6) + the §2 invitation retry guard need: the three channel-log
-- tables. BC-COMM-1 (threads/messages) and BC-COMM-2 (notifications) stay deferred to their own
-- M6 slices (the W3-COMM-1 deferral note stands for them).
--
-- SELF-CONTAINED (Doc-6A §5.2): the logs ref identity/core by BARE UUID only
-- (`recipient_organization_id` → M1; `source_event_id` → M0 `core.outbox_events`) — no cross-schema
-- FK. NO `human_ref` (Doc-2 §10.7 declares none). NO soft-delete tuple (permanent delivery audit).
--
-- Tables/columns are realized by Prisma (schema.prisma); the enum, the partial retry-queue index,
-- the column-scoped immutability triggers, and RLS are raw SQL here.
--
-- Order (Doc-6H §7 forward-only): enum → tables (Prisma-managed; created here since this migration
-- IS the realization) → indexes → immutability triggers → RLS. Forward-only, idempotent-guarded
-- where repeatable.
--
-- NOTE: `[Doc-2 §10.7 binding]` = column/type/constraint verbatim; `[§2.5 choice]` = physical realization.

CREATE SCHEMA IF NOT EXISTS "communication";

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enum — the delivery lifecycle status set (Doc-2 §10.7 / Doc-6H §3.3 verbatim):
--     queued → sent → delivered | failed (+ frozen retry failed → queued — a re-entry, no new state).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE communication.delivery_log_status AS ENUM ('queued','sent','delivered','failed');  -- [Doc-2 §10.7 binding]

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables — representative shape communication.email_logs (Doc-6H §3.3);
--     sms_logs / whatsapp_logs structurally identical.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE communication.email_logs (
  id uuid NOT NULL,
  recipient_ref text NOT NULL,                              -- [Doc-2 §10.7] email address / channel recipient (GI-3: the ONLY M6 surface the external address lands on — Doc-4H GrowthDelivery §5)
  recipient_organization_id uuid,                           -- [Doc-2 §10.7] bare UUID → M1 (where applicable; NULL for an external invitee)
  source_event_id uuid,                                     -- [Doc-2 §10.7] bare UUID → M0 core.outbox_events (= the consumed event_id on the invitation path — §HB-3.6)
  template text NOT NULL,                                   -- [Doc-2 §10.7] provider template id; referenced only (infra-owned configuration)
  status communication.delivery_log_status NOT NULL DEFAULT 'queued',  -- [Doc-2 §10.7]
  provider_ref text,                                        -- [Doc-2 §10.7] gateway message id
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT email_logs_pkey PRIMARY KEY (id)
);
CREATE INDEX email_logs_event_idx ON communication.email_logs (source_event_id);  -- [§2.5]
CREATE INDEX email_logs_status_idx ON communication.email_logs (status) WHERE status IN ('queued','failed');  -- [§2.5] retry queue

CREATE TABLE communication.sms_logs (
  id uuid NOT NULL,
  recipient_ref text NOT NULL,
  recipient_organization_id uuid,
  source_event_id uuid,
  template text NOT NULL,
  status communication.delivery_log_status NOT NULL DEFAULT 'queued',
  provider_ref text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT sms_logs_pkey PRIMARY KEY (id)
);
CREATE INDEX sms_logs_event_idx ON communication.sms_logs (source_event_id);
CREATE INDEX sms_logs_status_idx ON communication.sms_logs (status) WHERE status IN ('queued','failed');

CREATE TABLE communication.whatsapp_logs (
  id uuid NOT NULL,
  recipient_ref text NOT NULL,
  recipient_organization_id uuid,
  source_event_id uuid,
  template text NOT NULL,
  status communication.delivery_log_status NOT NULL DEFAULT 'queued',
  provider_ref text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT whatsapp_logs_pkey PRIMARY KEY (id)
);
CREATE INDEX whatsapp_logs_event_idx ON communication.whatsapp_logs (source_event_id);
CREATE INDEX whatsapp_logs_status_idx ON communication.whatsapp_logs (status) WHERE status IN ('queued','failed');

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) Column-scoped immutability (Doc-6H §3.3 / Doc-6B §4): the delivery FACTS are frozen; only
--     `status` (queued→sent→delivered/failed + the frozen failed→queued retry) and `provider_ref`
--     (set once the gateway returns) advance; DELETE blocked (permanent delivery audit — no SD).
--     Reuses the M0 shared-kernel function (consumed like core.allocate_human_ref — not a
--     cross-module data access).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER email_logs_immutable BEFORE UPDATE OR DELETE ON communication.email_logs FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','recipient_ref','recipient_organization_id','source_event_id','template','created_at','created_by');  -- [Doc-6B §4] status/provider_ref/updated_at/updated_by mutable; DELETE blocked
CREATE TRIGGER sms_logs_immutable BEFORE UPDATE OR DELETE ON communication.sms_logs FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','recipient_ref','recipient_organization_id','source_event_id','template','created_at','created_by');
CREATE TRIGGER whatsapp_logs_immutable BEFORE UPDATE OR DELETE ON communication.whatsapp_logs FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','recipient_ref','recipient_organization_id','source_event_id','template','created_at','created_by');

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) RLS (Doc-6H §3.x verbatim) — platform-internal delivery records: admin READ; NO in-band write
--     policy (only the delivery worker [owner-role/SECURITY DEFINER] writes; UPDATE/DELETE further
--     constrained by the column-scoped immutability trigger). GUC `app.is_platform_staff`
--     server-set; unset → NULL → `IS TRUE` false → fail-closed.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE communication.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_logs_admin_read ON communication.email_logs FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

ALTER TABLE communication.sms_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY sms_logs_admin_read ON communication.sms_logs FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

ALTER TABLE communication.whatsapp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY whatsapp_logs_admin_read ON communication.whatsapp_logs FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
