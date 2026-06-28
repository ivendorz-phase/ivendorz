-- Doc-6B — M0 Platform Core (`core`) Schema Realization — `core_init` (forward-only; Doc-6A §11).
--
-- Realizes the 5 platform-owned `core` tables (Doc-2 §10.1) verbatim from Doc-6B Content
-- Pass-1/Pass-2, plus the column-scoped immutability triggers (CR4′), the
-- `core.allocate_human_ref` SECURITY DEFINER allocator (§3.3), the platform-staff RLS backstop
-- (§2.2), and the 18 `core.*` POLICY-key seed (§5.2 / Doc-3 POLICY-Key-Registration-Patch-v1.0).
--
-- Tables are realized by Prisma (schema.prisma); functions / triggers / RLS / seed are raw SQL
-- here (Doc-6B §5.1). The `CREATE SCHEMA core` already ran in the Wave-0 baseline migration
-- (00000000000000_init_schemas); this migration adds objects inside it. Forward-only,
-- non-destructive (Doc-6A §11.2). Migration order per Doc-6B §5.1.

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Shared cross-cutting enums (Doc-6B §3.1 / §3.2; Appendix B.3 for actor_type)
-- ─────────────────────────────────────────────────────────────────────────────

-- [Doc-2 §9 binding] actor type; lowercase_underscored labels are a Doc-6A §3.4 binding.
-- 'user'=User, 'admin'=Admin, 'system'=System, 'ai_agent'=AI Agent.
CREATE TYPE "core"."ActorType" AS ENUM ('user', 'admin', 'system', 'ai_agent');

-- [Doc-2 §10.1 lifecycle binding] outbox status column (CR5; not a Doc-2 §5 state machine).
CREATE TYPE "core"."OutboxStatus" AS ENUM ('pending', 'dispatched', 'archived');

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) Shared infra functions (Doc-6B §4.1 / §3.3) — defined before the triggers/tables use them
-- ─────────────────────────────────────────────────────────────────────────────

-- [§2.5] M0-owned column-aware immutability function (Doc-6A §6.3; realized Doc-6B §4.1).
-- DELETE always forbidden; on UPDATE, any change to a protected (TG_ARGV) column raises.
-- Uses the `->` (native jsonb value) operator so jsonb payload columns compare by value (RR-F6).
CREATE FUNCTION "core".raise_immutable_violation() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE col text; o jsonb; n jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN                               -- DELETE branch first; on a DELETE-only trigger
    RAISE EXCEPTION 'core: % is append-only; DELETE forbidden (CR4'')', TG_TABLE_NAME;  -- (empty TG_ARGV) this raises and the FOREACH never runs
  END IF;
  o := to_jsonb(OLD); n := to_jsonb(NEW);               -- only reached on UPDATE (OLD/NEW both populated)
  FOREACH col IN ARRAY TG_ARGV LOOP
    IF (o -> col) IS DISTINCT FROM (n -> col) THEN
      RAISE EXCEPTION 'core: %.% is immutable (CR4'' payload/identity)', TG_TABLE_NAME, col;
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

-- [§2.5] outbox: forward-only status (RR-F5). pending→dispatched→archived; same-state idempotent.
CREATE FUNCTION "core".outbox_status_forward_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status <> OLD.status AND NOT (
       (OLD.status = 'pending'    AND NEW.status = 'dispatched') OR
       (OLD.status = 'dispatched' AND NEW.status = 'archived')
     ) THEN
    RAISE EXCEPTION 'core.outbox_events: illegal status transition % -> % (forward-only, CR4'')',
      OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END $$;

-- [§2.5] audit: archive flag is set-once (RR-F12). archived_at, once set, never changes/clears.
CREATE FUNCTION "core".audit_archive_set_once() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.archived_at IS NOT NULL AND NEW.archived_at IS DISTINCT FROM OLD.archived_at THEN
    RAISE EXCEPTION 'core.audit_records: archived_at is set-once (CR4'')';
  END IF;
  RETURN NEW;
END $$;

-- [§2.5] M0-owned human-reference allocator (Doc-4B §8 obligation realized as code; Doc-6B §3.3).
-- SECURITY DEFINER + pinned search_path (no injection — F-008/RR-P2-001). Row-locked,
-- gap-tolerant, never-reused allocation (Doc-2 §10.11). Format TYPE-YEAR-XXXXX, width 6.
CREATE FUNCTION "core".allocate_human_ref(p_entity_type text, p_year integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path = core, pg_temp AS $$
DECLARE v bigint;
BEGIN
  INSERT INTO core.id_sequences (entity_type, year) VALUES (p_entity_type, p_year)
    ON CONFLICT (entity_type, year) DO NOTHING;
  UPDATE core.id_sequences                              -- row lock via UPDATE … RETURNING
     SET next_value = next_value + 1, updated_at = now()
   WHERE entity_type = p_entity_type AND year = p_year
   RETURNING next_value - 1 INTO v;                      -- allocated = value before increment (first call → 1)
  IF v IS NULL THEN                                      -- RR-P2-002 guard: never emit a malformed ref
    RAISE EXCEPTION 'core.allocate_human_ref: no sequence row for (%, %)', p_entity_type, p_year;
  END IF;
  RETURN format('%s-%s-%s', p_entity_type, p_year, lpad(v::text, 6, '0'));  -- [§2.5] width 6 → ORG-2026-000001
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) Tables (Doc-2 §10.1 columns verbatim; physical specifics [§2.5])
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.1 — core.audit_records — immutable audit stream. PK audit_id (CR3, UUIDv7 time-ordered).
-- Monthly partitioning [§2.5/CR10]: PARTITION BY RANGE (audit_id) keeps PK = audit_id (CR3);
-- because audit_id is a time-ordered UUIDv7, range-by-audit_id = range-by-month. Partition
-- creation/rotation is a [§2.5] operational detail (native declarative / pg_partman, Doc-6B §3.1);
-- a DEFAULT partition is materialized here so the stream is writable from day one, with monthly
-- partitions provisioned operationally ahead of the default (boundaries are UUIDv7 month edges).
CREATE TABLE "core"."audit_records" (
  "audit_id"        uuid              NOT NULL,            -- [Doc-2 §9] PK; UUIDv7 time-ordered (CR3)
  "actor_id"        uuid,                                  -- [Doc-2 §9] nullable for System/automated actors
  "actor_type"      "core"."ActorType" NOT NULL,          -- [Doc-2 §9]
  "organization_id" uuid,                                  -- [Doc-2 §9] audit-context REFERENCE col, not RLS anchor (CR2)
  "entity_type"     text              NOT NULL,            -- [Doc-2 §9]
  "entity_id"       uuid              NOT NULL,            -- [Doc-2 §9]
  "action"          text              NOT NULL,            -- [Doc-2 §9]
  "old_value"       jsonb,                                 -- [Doc-2 §9]
  "new_value"       jsonb,                                 -- [Doc-2 §9]
  "event_time"      timestamptz       NOT NULL,            -- [Doc-2 §9] logical `timestamp`; physical name [§2.5] reserved-word-avoidance
  "ip_address"      inet,                                  -- [Doc-2 §9] ([§2.5] inet)
  "user_agent"      text,                                  -- [Doc-2 §9]
  "archived_at"     timestamptz,                           -- realizes Doc-2 §10.1 "soft archive flag" concept; name [§2.5]; CR4′ set-once
  "created_at"      timestamptz       NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"      timestamptz       NOT NULL DEFAULT now(), -- [Doc-6A R5] advances only on archive (CR4′)
  CONSTRAINT "audit_records_pkey" PRIMARY KEY ("audit_id")  -- [§2.5] name; PK col = [Doc-2/CR3]
) PARTITION BY RANGE ("audit_id");                          -- [§2.5/CR10] monthly via UUIDv7 time-order

-- [§2.5] DEFAULT partition — catch-all so the partitioned stream is writable; monthly
-- partitions are added operationally ahead of it (Doc-6B §3.1 — partition rotation is §2.5 infra).
CREATE TABLE "core"."audit_records_default" PARTITION OF "core"."audit_records" DEFAULT;

-- The platform-staff RLS backstop (Doc-6B §2.2/§5.1) MUST be enforced on every partition:
-- Postgres does NOT propagate RLS policies from the parent partitioned table to its partitions
-- (unlike the immutability/row triggers, which DO auto-propagate). A partition without its own
-- ENABLE ROW LEVEL SECURITY + platform-staff policy is a direct-to-partition RLS bypass of the
-- audit stream. Apply it to this DEFAULT partition here; operationally-provisioned future monthly
-- partitions MUST likewise ENABLE ROW LEVEL SECURITY + create this platform-staff policy.
ALTER TABLE "core"."audit_records_default" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_records_default_platform_staff" ON "core"."audit_records_default"
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- §3.2 — core.outbox_events — transactional outbox. PK id (UUIDv7).
CREATE TABLE "core"."outbox_events" (
  "id"            uuid                NOT NULL,            -- [Doc-6A §3.1] PK UUIDv7
  "aggregate_id"  uuid,                                    -- [Doc-2 §10.1 Ref] bare UUID, no cross-schema FK
  "event_name"    text                NOT NULL,            -- [Doc-2 §10.1/§8]
  "event_version" integer             NOT NULL,            -- [Doc-2 §10.1/§8]
  "payload_jsonb" jsonb               NOT NULL,            -- [Doc-2 §10.1] IDs + metadata, no blobs
  "status"        "core"."OutboxStatus" NOT NULL DEFAULT 'pending', -- [Doc-2 §10.1]
  "dispatched_at" timestamptz,                             -- [Doc-2 §10.1]
  "attempts"      integer             NOT NULL DEFAULT 0,  -- [Doc-2 §10.1]
  "created_at"    timestamptz         NOT NULL DEFAULT now(), -- [Doc-6A R5/§7.2]
  "updated_at"    timestamptz         NOT NULL DEFAULT now(), -- [Doc-6A R5]
  CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")       -- [§2.5] name
);

-- §3.3 — core.id_sequences — human-reference generator. Composite PK (entity_type, year) (CR3/CR6).
CREATE TABLE "core"."id_sequences" (
  "entity_type" text        NOT NULL,                      -- [Doc-2 §10.1] e.g. 'ORG','RFQ','QTN','INV','DOC'
  "year"        integer     NOT NULL,                      -- [Doc-2 §10.1] year scope
  "next_value"  bigint      NOT NULL DEFAULT 1,            -- [Doc-2 §10.1] monotonic counter
  "created_at"  timestamptz NOT NULL DEFAULT now(),        -- [Doc-6A R5]
  "updated_at"  timestamptz NOT NULL DEFAULT now(),        -- [Doc-6A R5] advances on allocation
  CONSTRAINT "id_sequences_pkey" PRIMARY KEY ("entity_type", "year")  -- [Doc-2/CR3] composite PK; name [§2.5]
);

-- §3.4 — core.system_configuration — POLICY store. PK id (UUIDv7); `key` plain unique (SD=NO).
CREATE TABLE "core"."system_configuration" (
  "id"          uuid        NOT NULL,                      -- [Doc-6A §3.1] PK UUIDv7
  "key"         text        NOT NULL,                      -- [Doc-2 §10.1]
  "value_jsonb" jsonb       NOT NULL,                      -- [Doc-2 §10.1]
  "value_type"  text        NOT NULL,                      -- [Doc-2 §10.1] integer|duration|enum|… (Doc-3 v1.0)
  "updated_by"  uuid,                                      -- [Doc-2 §10.1] actor (bare UUID; nullable for seed/System)
  "created_at"  timestamptz NOT NULL DEFAULT now(),        -- [Doc-6A R5]
  "updated_at"  timestamptz NOT NULL DEFAULT now(),        -- [Doc-6A R5]
  CONSTRAINT "system_configuration_pkey" PRIMARY KEY ("id"),       -- [§2.5] name
  CONSTRAINT "system_configuration_key_uq" UNIQUE ("key")          -- [§2.5] name; plain unique (SD=NO)
);

-- §3.5 — core.feature_flags — rollout control, firewalled. PK id (UUIDv7); unique flag_key.
CREATE TABLE "core"."feature_flags" (
  "id"          uuid        NOT NULL,                      -- [Doc-6A §3.1] PK UUIDv7
  "flag_key"    text        NOT NULL,                      -- [Doc-2 §10.1]
  "enabled"     boolean     NOT NULL DEFAULT false,        -- [Doc-2 §10.1] ([§2.5] default false)
  "scope_jsonb" jsonb,                                     -- [Doc-2 §10.1] rollout scope
  "created_at"  timestamptz NOT NULL DEFAULT now(),        -- [Doc-6A R5]
  "updated_at"  timestamptz NOT NULL DEFAULT now(),        -- [Doc-6A R5]
  CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id"),              -- [§2.5] name
  CONSTRAINT "feature_flags_flag_key_uq" UNIQUE ("flag_key")       -- [§2.5] name
);

-- ─────────────────────────────────────────────────────────────────────────────
-- (5) Indexes (Doc-6B §3.1 / §3.2; [§2.5] names per Doc-6A B.4)
-- ─────────────────────────────────────────────────────────────────────────────

-- audit reads (Doc-5B Band H; bounded by core.audit_query_* keys)
CREATE INDEX "audit_records_org_time_idx"
  ON "core"."audit_records" ("organization_id", "event_time");
CREATE INDEX "audit_records_entity_time_idx"
  ON "core"."audit_records" ("entity_type", "entity_id", "event_time");

-- outbox dispatcher poll (Doc-6A §10)
CREATE INDEX "outbox_events_status_created_at_idx"
  ON "core"."outbox_events" ("status", "created_at");

-- ─────────────────────────────────────────────────────────────────────────────
-- (6) Immutability / guard triggers (Doc-6B §4.1 / §3.3; CR4′ — event bindings load-bearing)
-- ─────────────────────────────────────────────────────────────────────────────

-- core.audit_records — payload+identity immutable (UPDATE OR DELETE) + archive set-once (UPDATE)
CREATE TRIGGER "audit_records_block_payload_mutation"
  BEFORE UPDATE OR DELETE ON "core"."audit_records" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'audit_id','actor_id','actor_type','organization_id','entity_type','entity_id',
    'action','old_value','new_value','event_time','ip_address','user_agent','created_at');
CREATE TRIGGER "audit_records_archive_set_once"
  BEFORE UPDATE ON "core"."audit_records" FOR EACH ROW
  EXECUTE FUNCTION "core".audit_archive_set_once();

-- core.outbox_events — business payload immutable (UPDATE OR DELETE) + status forward-only (UPDATE)
CREATE TRIGGER "outbox_events_block_payload_mutation"
  BEFORE UPDATE OR DELETE ON "core"."outbox_events" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation(
    'id','aggregate_id','event_name','event_version','payload_jsonb','created_at');
CREATE TRIGGER "outbox_events_status_forward_only"
  BEFORE UPDATE ON "core"."outbox_events" FOR EACH ROW
  EXECUTE FUNCTION "core".outbox_status_forward_only();

-- core.id_sequences — DELETE blocked (never-reused, Doc-2 §10.11); UPDATE/allocator permitted.
CREATE TRIGGER "id_sequences_block_delete"
  BEFORE DELETE ON "core"."id_sequences" FOR EACH ROW
  EXECUTE FUNCTION "core".raise_immutable_violation();   -- empty TG_ARGV → DELETE-only block

-- ─────────────────────────────────────────────────────────────────────────────
-- (7) RLS — platform-staff backstop on all 5 tables (Doc-6B §2.2; CR2; app-layer authz is primary)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "core"."audit_records"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."outbox_events"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."id_sequences"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."system_configuration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "core"."feature_flags"       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_records_platform_staff" ON "core"."audit_records"
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "outbox_events_platform_staff" ON "core"."outbox_events"
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "id_sequences_platform_staff" ON "core"."id_sequences"
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "system_configuration_platform_staff" ON "core"."system_configuration"
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "feature_flags_platform_staff" ON "core"."feature_flags"
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- (8) POLICY seed — the 18 registered core.* keys (Doc-6B §5.2; Doc-3 POLICY-Key-Registration-Patch-v1.0 §3)
--     Idempotent forward-only upsert on the natural key `key` (re-run safe — Doc-6A §9.5).
--     value_jsonb + value_type taken VERBATIM from Doc-3 v1.0 §3 (start value / value type); none coined.
--     updated_by is NULL (System/seed). `id` is assigned by gen_random_uuid() (PG-native) — row identity
--     is incidental here; `key` is the natural key that the upsert and all reads key on (Doc-4A §18.2).
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "core"."system_configuration" ("id", "key", "value_jsonb", "value_type") VALUES
  (gen_random_uuid(), 'core.audit_query_page_size_max',        '100'::jsonb,                                              'integer'),
  (gen_random_uuid(), 'core.audit_query_rate_window',          '"60s"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.audit_query_rate_reset',           '"60s"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.audit_lookup_rate_window',         '"60s"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.audit_lookup_rate_reset',          '"60s"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.audit_redactable_fields_max',      '10'::jsonb,                                               'integer'),
  (gen_random_uuid(), 'core.audit_redaction_reason_min_chars', '20'::jsonb,                                               'integer'),
  (gen_random_uuid(), 'core.redaction_dedup_window',           '"24h"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.outbox_dispatch_max_attempts',     '10'::jsonb,                                               'integer'),
  (gen_random_uuid(), 'core.outbox_dispatch_backoff',          '"exponential, base 2s, cap 5m"'::jsonb,                   'duration / backoff-spec'),
  (gen_random_uuid(), 'core.outbox_dispatch_dedup_window',     '"24h"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.outbox_dlq_policy',                '"park_and_alert"'::jsonb,                                 'enum'),
  (gen_random_uuid(), 'core.outbox_archive_retention',         '"30d"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.outbox_archive_dedup_window',      '"24h"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.config_change_reason_min_chars',   '20'::jsonb,                                               'integer'),
  (gen_random_uuid(), 'core.config_change_dedup_window',       '"24h"'::jsonb,                                            'duration'),
  (gen_random_uuid(), 'core.flag_change_reason_min_chars',     '20'::jsonb,                                               'integer'),
  (gen_random_uuid(), 'core.flag_change_dedup_window',         '"24h"'::jsonb,                                            'duration')
ON CONFLICT ("key") DO UPDATE
   SET "value_jsonb" = EXCLUDED."value_jsonb",
       "value_type"  = EXCLUDED."value_type",
       "updated_at"  = now();
