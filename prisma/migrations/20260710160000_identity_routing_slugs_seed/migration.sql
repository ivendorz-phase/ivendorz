-- W2-IDN-7 — routing-governance staff permission-slug catalog seed (Doc-2 §7 as patched
-- `Doc-2_Patch_v1.0.8` / PATCH-D2-07; owner ruling `ESC-RFQ-SLUG` APPROVED 2026-07-10, decision
-- record `governanceReviews/BOARD-DECISION-RFQ-SLUG_v1.0.md`). Forward-only idempotent DATA
-- migration (Doc-6A §11.3); no DDL. Extends the `20260709130000_identity_catalog_seed` catalog
-- (43 → 45).
--
-- WHAT: two dedicated platform-staff slugs, both `space='staff'` (Doc-2 v1.0.8 §7, verbatim):
--   • `staff_can_view_routing`   — routing/matching governance READS (routing log, matching results
--                                  staff leg, routing rules — "monitor, never decide").
--   • `staff_can_manage_routing` — routing-governance WRITES (human-assisted routing, routing-rule
--                                  control plane; bound by the Doc-3 §3.6 FIXED forbidden-actions wall).
-- Slug + space verbatim from the frozen patch; NONE coined, NONE renamed. The catalog grows from
-- 43 (36 tenant + 7 staff) to **45 (36 tenant + 9 staff)** — the real arithmetic (Doc-2 v1.0.8 §4;
-- the pre-existing Doc-6C §3.5 "45 (38/7)" prose is stale on the breakdown, T6-OBS-3 / RV-0159).
--
-- INVARIANT #2 (Platform Participation ≠ Org Role — the reason this migration touches ONLY
-- `identity.permissions`): the `staff_*` space is a SEPARATE identifier space (Doc-2 §7
-- "Platform-staff slugs (separate space)"; Doc-2 v1.0.8 §3). It is NEVER mapped to any org
-- role bundle, so this migration writes ZERO `role_permissions` rows (enforced by construction —
-- there is no INSERT into `role_permissions` here). The `identity-permission-catalog-seed` 8E suite
-- discriminating-tests the "routing slug on NO bundle" guard.
--
-- SEED-PK CONVENTION (Board `ESC-SEED-PK-UUID` Option A, 2026-07-10 — packet
-- `governanceReviews/BOARD-PACKET-SEED-PK-UUID_v1.0.md`): migration-time seed rows use hand-authored,
-- DETERMINISTIC, format-v4 UUID constants (NEVER `gen_random_uuid()`/runtime-random). The v4/v7
-- format distinction marks "seeded constant" from "runtime-generated" (UUIDv7 = Doc-6A §3.1 runtime
-- IDs). The pre-existing 43 catalog rows keep their `gen_random_uuid()` PKs (forward-only; the ruling
-- re-keys no live row) — the natural key is `slug`, on which all reads/joins and this upsert key.
--
-- IDEMPOTENT: `ON CONFLICT (slug) DO UPDATE` (re-run safe — Doc-6A §11.3). System-actor authored
-- (created_by/updated_by left NULL — the `identity_catalog_seed` / `core_init` seed house pattern).

INSERT INTO "identity"."permissions" ("id", "slug", "description", "space") VALUES
  ('1de77a17-05c9-4000-8000-000000000001', 'staff_can_view_routing',
   'Platform-staff routing/matching governance reads — routing log, matching results, routing rules; monitor, never decide (Doc-2 §7 / Doc-2_Patch_v1.0.8)',
   'staff'),
  ('1de77a17-05c9-4000-8000-000000000002', 'staff_can_manage_routing',
   'Platform-staff routing-governance writes — human-assisted routing, routing-rule control plane; bound by the Doc-3 §3.6 forbidden-actions wall (Doc-2 §7 / Doc-2_Patch_v1.0.8)',
   'staff')
ON CONFLICT ("slug") DO UPDATE SET description = EXCLUDED.description, space = EXCLUDED.space, updated_at = now();
