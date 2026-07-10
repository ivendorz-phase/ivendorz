-- Doc-6C — M1 Identity & Organization (`identity`) Schema Realization — `identity_authz`
-- (forward-only; Doc-6A §11). W2-IDN-1 — the 4 REMAINING tables (Doc-6C §3.5/§3.6/§3.7/§3.9),
-- bringing all 9 `identity` tables (Doc-2 §10.2) to explicit existence.
--
-- Realizes: permissions (§3.5), role_permissions (§3.6), organization_workflow_settings (§3.7),
-- delegation_grants (§3.9) — plus their enums, constraints/indexes, and per-class RLS (§6.2a).
-- Structural migration order per Doc-6C §6.2 (FK-valid): enums → permissions → role_permissions
-- (FK → roles [existing] + permissions [this migration]) → organization_workflow_settings
-- (FK → organizations [existing]) → delegation_grants (FK → organizations [existing] ×2; NO FK on
-- vendor_profile_id — cross-module M2, bare UUID, DC-CR10) → partial-unique-live + Band-H indexes
-- → RLS enable + policies (§6.2a). `users`/`organizations`/`roles`/`memberships`/`buyer_profiles`
-- already exist (`identity_init`); the deferred `memberships_role_fk` was already realized inline
-- there (roles present in that subset) — nothing to add here.
--
-- Out of scope (Wave-2, not this WP): the 45-slug/4-bundle seed (`role_permissions` composition +
-- `permissions` catalog rows) is `W2-IDN-2` — structure only here. No `identity.*` POLICY-key seed
-- (`W2-IDN-7`). No contracts/ change.
--
-- NOTE: `[Doc-2 binding]` = column/type/constraint verbatim from Doc-2 §10.2 / Doc-6C;
--       `[§2.5 choice]` = physical realization (names, index predicates) per Doc-6C §2.5.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-6C §3.5 / §3.7 / §3.9) — declared before the tables that use them
-- ─────────────────────────────────────────────────────────────────────────────

-- [Doc-2 §7 binding] the two permission slug spaces (Invariant #2)
CREATE TYPE "identity"."permission_space" AS ENUM ('tenant', 'staff');
-- [Doc-2 §10.2 binding] organization_workflow_settings.rfq_approval_mode
CREATE TYPE "identity"."rfq_approval_mode" AS ENUM ('none', 'single', 'multi_step');
-- [Doc-2 §5.10 binding] delegation_grants state machine
CREATE TYPE "identity"."delegation_grant_status" AS ENUM ('draft', 'active', 'suspended', 'revoked', 'expired');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-2 §10.2 columns verbatim; physical specifics [§2.5]) — FK-valid order
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.5 — identity.permissions — platform catalog (no org anchor); SD=NO (reference data).
CREATE TABLE "identity"."permissions" (
  "id"          uuid                          NOT NULL,          -- [Doc-6A §3.1] PK UUIDv7
  "slug"        text                          NOT NULL,          -- [Doc-2 §10.2/§7] permission slug (e.g. can_create_rfq, staff_can_ban)
  "description" text,                                            -- [Doc-2 §10.2]
  "space"       "identity"."permission_space" NOT NULL,          -- [Doc-2 §10.2/§7] tenant | staff
  "created_at"  timestamptz                   NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"  timestamptz                   NOT NULL DEFAULT now(),
  "created_by"  uuid,                                            -- [Doc-2 §0.2] actor
  "updated_by"  uuid,
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id"),               -- [§2.5] name
  CONSTRAINT "permissions_slug_uq" UNIQUE ("slug")                -- [Doc-2 §10.2 binding] plain unique (SD=NO → no partial-live)
);

-- §3.6 — identity.role_permissions — bundle composition, N:N; PK (role_id, permission_id); SD=NO
-- (row removal = revoke, audited). organization_id [Doc-2 §10.2 binding] — not coined, §10.2 lists
-- it; NULL for system-bundle composition (mirrors roles seed); no FK on organization_id (Doc-6C §3.6).
CREATE TABLE "identity"."role_permissions" (
  "role_id"         uuid        NOT NULL,                        -- [Doc-2 §10.2] FK → roles
  "permission_id"   uuid        NOT NULL,                        -- [Doc-2 §10.2] FK → permissions
  "organization_id" uuid,                                        -- [Doc-2 §10.2 binding] RLS anchor; NULL = system-bundle composition
  "created_at"      timestamptz NOT NULL DEFAULT now(),           -- [Doc-6A R5]
  "updated_at"      timestamptz NOT NULL DEFAULT now(),
  "created_by"      uuid,                                        -- [Doc-2 §0.2] actor
  "updated_by"      uuid,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id"), -- [Doc-2 §10.2 binding] composite PK
  CONSTRAINT "role_permissions_role_fk" FOREIGN KEY ("role_id")       REFERENCES "identity"."roles"("id"),        -- [Doc-6A §5.2] intra-schema
  CONSTRAINT "role_permissions_perm_fk" FOREIGN KEY ("permission_id") REFERENCES "identity"."permissions"("id")
);
CREATE INDEX "role_permissions_org_idx" ON "identity"."role_permissions" ("organization_id"); -- [§2.5] Band H / RLS

-- §3.7 — identity.organization_workflow_settings — tenant-owned (organization_id); SD=YES; FK → organizations.
CREATE TABLE "identity"."organization_workflow_settings" (
  "id"                           uuid                            NOT NULL, -- [Doc-6A §3.1] PK UUIDv7
  "organization_id"              uuid                            NOT NULL, -- [Doc-2 §6] RLS anchor
  "rfq_approval_mode"            "identity"."rfq_approval_mode"  NOT NULL DEFAULT 'none', -- [Doc-2 §10.2]
  "approval_chain_jsonb"         jsonb,                                    -- [Doc-2 §10.2]
  "financial_permissions_jsonb"  jsonb,                                    -- [Doc-2 §10.2]
  "notification_rules_jsonb"     jsonb,                                    -- [Doc-2 §10.2]
  "created_at"                   timestamptz                     NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"                   timestamptz                     NOT NULL DEFAULT now(),
  "created_by"                   uuid,                                     -- [Doc-2 §0.2] actor
  "updated_by"                   uuid,
  "deleted_at"                   timestamptz,                              -- [Doc-2 §0.2] SD=YES
  "deleted_by"                   uuid,
  "delete_reason"                text,
  CONSTRAINT "organization_workflow_settings_pkey" PRIMARY KEY ("id"),     -- [§2.5] name
  CONSTRAINT "ows_org_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") -- [Doc-6A §5.2]
);
CREATE UNIQUE INDEX "ows_org_live_uq" ON "identity"."organization_workflow_settings" ("organization_id") WHERE "deleted_at" IS NULL; -- [§2.5] one settings row per org

-- §3.9 — identity.delegation_grants — the dual-party aggregate (the hardest); shared dual-party;
-- the only table with a cross-module ref (vendor_profile_id → M2, bare UUID, NO FK — DC-CR10).
CREATE TABLE "identity"."delegation_grants" (
  "id"                              uuid                                 NOT NULL, -- [Doc-6A §3.1] PK UUIDv7
  "controlling_organization_id"     uuid                                 NOT NULL, -- [Doc-2 §10.2/§6] party column (RLS anchor); the org that owns the grant
  "representative_organization_id"  uuid                                 NOT NULL, -- [Doc-2 §10.2/§6] party column (RLS anchor); the org acting on behalf
  "vendor_profile_id"               uuid                                 NOT NULL, -- [Doc-2 §10.2] CROSS-MODULE bare UUID (M2); validated at issue vs Vendor Service; NO FK (Doc-2 §0.3 / DC-CR10)
  "permission_set_jsonb"            jsonb                                NOT NULL, -- [Doc-2 §10.2] delegated slug array (⊆ existing; never ownership-class — DC-CR7)
  "valid_from"                      timestamptz                         NOT NULL DEFAULT now(), -- [Doc-2 §10.2]
  "valid_to"                        timestamptz,                                   -- [Doc-2 §10.2] default span from identity.delegation_validity_default (service, not a DB default literal)
  "granted_by"                      uuid                                 NOT NULL, -- [Doc-2 §10.2] the user (in controlling org) who granted
  "status"                          "identity"."delegation_grant_status" NOT NULL DEFAULT 'draft', -- [Doc-2 §5.10]
  "created_at"                      timestamptz                         NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"                      timestamptz                         NOT NULL DEFAULT now(),
  "created_by"                      uuid,                                          -- [Doc-2 §0.2] actor
  "updated_by"                      uuid,
  "deleted_at"                      timestamptz,                                   -- [Doc-2 §0.2] SD=YES
  "deleted_by"                      uuid,
  "delete_reason"                   text,
  CONSTRAINT "delegation_grants_pkey" PRIMARY KEY ("id"),                          -- [§2.5] name
  CONSTRAINT "delegation_grants_validity_chk" CHECK ("valid_to" IS NULL OR "valid_to" > "valid_from"), -- [§2.5] ordering when set; NULL = no-expiry
  CONSTRAINT "delegation_grants_controlling_fk"    FOREIGN KEY ("controlling_organization_id")    REFERENCES "identity"."organizations"("id"), -- [Doc-6A §5.2] intra-schema
  CONSTRAINT "delegation_grants_representative_fk" FOREIGN KEY ("representative_organization_id") REFERENCES "identity"."organizations"("id")
  -- NO FK on vendor_profile_id (cross-module M2 — bare UUID; Doc-2 §0.3 / Doc-6A §5.3)
);
CREATE INDEX "delegation_grants_controlling_idx"    ON "identity"."delegation_grants" ("controlling_organization_id")    WHERE "deleted_at" IS NULL; -- [§2.5] Band H
CREATE INDEX "delegation_grants_representative_idx" ON "identity"."delegation_grants" ("representative_organization_id") WHERE "deleted_at" IS NULL; -- [§2.5] Band H (party read)
CREATE INDEX "delegation_grants_expiry_idx"         ON "identity"."delegation_grants" ("status", "valid_to")             WHERE "deleted_at" IS NULL; -- [§2.5] the expiry sweep (System)

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS — per-class policies (Doc-6C §6.2a). App-layer authz is primary (Doc-4C check_permission);
--     RLS is the row-visibility backstop (Doc-6A §4.5). GUCs are server-set (§2.1): app.user_id,
--     app.active_org, app.is_platform_staff. current_setting(.,true) → NULL when unset → fail-closed.
-- ─────────────────────────────────────────────────────────────────────────────

-- permissions (platform catalog): read-open; write staff-only
ALTER TABLE "identity"."permissions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissions_read"        ON "identity"."permissions" FOR SELECT USING (true);
CREATE POLICY "permissions_staff_write" ON "identity"."permissions" FOR ALL
  USING      (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
  -- FOR ALL safe: SELECT is OR'd with the permissive read-open policy (permissive-OR); write gate = staff

-- role_permissions (tenant + NULL system): read active_org/NULL/staff; write active_org/staff
-- (split — read wider than write; NO UPDATE policy — Doc-6C §6.2a verbatim)
ALTER TABLE "identity"."role_permissions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions_read"   ON "identity"."role_permissions" FOR SELECT
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR organization_id IS NULL
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "role_permissions_insert" ON "identity"."role_permissions" FOR INSERT
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "role_permissions_delete" ON "identity"."role_permissions" FOR DELETE
  USING (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- organization_workflow_settings (single-org tenant: read==write scope → FOR ALL — §6.2a)
ALTER TABLE "identity"."organization_workflow_settings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ows_tenant" ON "identity"."organization_workflow_settings" FOR ALL
  USING      (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- delegation_grants (shared dual-party): read = both parties; write (insert/update/delete) =
-- controlling org only. Split into INSERT/UPDATE/DELETE (NOT FOR ALL) so the write gate never
-- touches SELECT — unambiguous (Doc-6C §3.9.1 RLS-COMP-001).
ALTER TABLE "identity"."delegation_grants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "delegation_grants_party_read" ON "identity"."delegation_grants" FOR SELECT
  USING (current_setting('app.active_org', true)::uuid
           IN (controlling_organization_id, representative_organization_id)
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "delegation_grants_controlling_insert" ON "identity"."delegation_grants" FOR INSERT
  WITH CHECK (current_setting('app.active_org', true)::uuid = controlling_organization_id
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "delegation_grants_controlling_update" ON "identity"."delegation_grants" FOR UPDATE
  USING      (current_setting('app.active_org', true)::uuid = controlling_organization_id
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.active_org', true)::uuid = controlling_organization_id
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "delegation_grants_controlling_delete" ON "identity"."delegation_grants" FOR DELETE
  USING      (current_setting('app.active_org', true)::uuid = controlling_organization_id
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
