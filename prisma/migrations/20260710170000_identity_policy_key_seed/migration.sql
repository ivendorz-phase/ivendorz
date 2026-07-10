-- W2-IDN-7 — the 7 `identity.*` POLICY keys seeded into `core.system_configuration`
-- (Doc-3 POLICY-Key Registration Patch v1.9 §3 — RATIFIED 2026-06-26; Board confirmed the 7-key
-- union §3.1 + all start values). Forward-only idempotent DATA migration (Doc-6A §11.3); no DDL.
--
-- REALIZATION PLAN: Doc-6C §5/§6 assigns M1 its own POLICY seed into the M0-owned store
-- `core.system_configuration` (Doc-6B §3.4; the 18 `core.*` keys were seeded by `core_init`). This
-- seed reads the Doc-3 v1.9 registered block; it is NOT cross-module application access (a data seed
-- in the persistence layer, sanctioned by the frozen realization plan — no cross-module FK, no
-- structural coupling). Clears the Doc-6C `[ESC-6-POLICY]` (DC-CR9) persistence dependency for M1's
-- dedup/timer/validity reads.
--
-- KEY FORM (Doc-4A §18.2): the store's natural key is `<domain>.<key_name>` (e.g.
-- `identity.command_dedup_window`) — the SAME shape as the 18 `core.*` rows (`core.<name>`). The M0
-- reader (`core.config_value_query.v1`, `system-configuration.service.ts`) strips the fixed
-- `core.system_configuration.` reference prefix, so the FULL reference form the M1 consumers pass
-- (`COMMAND_DEDUP_WINDOW_KEY` = `core.system_configuration.identity.command_dedup_window`, etc.)
-- resolves to the `key` column values below. Values are read live, NEVER a literal (Doc-6A §10.2).
--
-- VALUES: `value_jsonb` + `value_type` taken VERBATIM from Doc-3 v1.9 §3 (Value type = duration;
-- Proposed start value column — all seven are durations). None coined. All seven are operational
-- POLICY (tunable; changes audited per Doc-3 §12.4); NONE influences any governance signal
-- (Doc-4A §18.3 / §4B firewall).
--
-- SEED-PK CONVENTION (Board `ESC-SEED-PK-UUID` Option A, 2026-07-10 —
-- `governanceReviews/BOARD-PACKET-SEED-PK-UUID_v1.0.md`): the packet names THIS seed (the 7
-- `identity.*` POLICY keys) as the first to carry the convention — DETERMINISTIC, pre-authored,
-- format-v4 UUID constants (NEVER `gen_random_uuid()`/runtime-random). `key` is the natural key that
-- the upsert and all reads key on; the `id` is a fixed constant, incidental to lookups.
--
-- IDEMPOTENT: `ON CONFLICT (key) DO UPDATE` (re-run safe — Doc-6A §9.5). `updated_by` NULL
-- (System/seed) — the `core_init` POLICY-seed house pattern.

INSERT INTO "core"."system_configuration" ("id", "key", "value_jsonb", "value_type") VALUES
  ('1de77a17-0901-4000-8000-000000000001', 'identity.command_dedup_window',                  '"24h"'::jsonb,  'duration'),
  ('1de77a17-0901-4000-8000-000000000002', 'identity.user_update_dedup_window',              '"24h"'::jsonb,  'duration'),
  ('1de77a17-0901-4000-8000-000000000003', 'identity.membership_invite_dedup_window',        '"24h"'::jsonb,  'duration'),
  ('1de77a17-0901-4000-8000-000000000004', 'identity.membership_invite_expiry_window',       '"14d"'::jsonb,  'duration'),
  ('1de77a17-0901-4000-8000-000000000005', 'identity.delegation_validity_default',           '"365d"'::jsonb, 'duration'),
  ('1de77a17-0901-4000-8000-000000000006', 'identity.delegation_expiry_sweep_cadence',       '"1h"'::jsonb,   'duration'),
  ('1de77a17-0901-4000-8000-000000000007', 'identity.ownership_succession_reminder_cadence', '"7d"'::jsonb,   'duration')
ON CONFLICT ("key") DO UPDATE
   SET "value_jsonb" = EXCLUDED."value_jsonb",
       "value_type"  = EXCLUDED."value_type",
       "updated_at"  = now();
