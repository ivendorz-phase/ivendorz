-- Doc-6C — M1 Identity & Organization (`identity`) Schema Realization — `identity_init`
-- (forward-only; Doc-6A §11). WP-1.2 [W1-IDENTITY-001] — the 5-table minimal-valid SUBSET.
--
-- Realizes 5 of the 9 `identity` tables (Doc-2 §10.2) verbatim from Doc-6C Content
-- Pass-1/Pass-2: users (§3.1), organizations (§3.2), roles (§3.4), memberships (§3.3),
-- buyer_profiles (§3.8) — plus their enums, partial-unique-live indexes, Band-H indexes,
-- per-class RLS (Doc-6C §2.2 / §3.2 / §3.4 / §6.2a), and the system-bundle role seed (§5.2).
-- The other 4 tables (permissions, role_permissions, organization_workflow_settings,
-- delegation_grants) are Wave-2 and are NOT realized here.
--
-- Tables/columns are realized by Prisma (schema.prisma); enums / FKs / partial-unique /
-- RLS / seed are raw SQL here (Doc-6C §6.1). The `CREATE SCHEMA identity` already ran in the
-- Wave-0 baseline migration (00000000000000_init_schemas); this migration adds objects inside
-- it. Forward-only, non-destructive (Doc-6A §11.2). Migration order per Doc-6C §6.2 — FK-valid:
-- users → organizations → roles → memberships (inline FKs) → buyer_profiles. Because `roles` is
-- present in this subset, the Doc-6C DDL-1 deferred ALTER for `memberships_role_fk` is AVOIDED:
-- the role FK is created inline on `memberships`.
--
-- NOTE: `[Doc-2 binding]` = column/type/constraint verbatim from Doc-2 §10.2 / Doc-6C;
--       `[§2.5 choice]` = physical realization (names, index predicates) per Doc-6C §2.5.

-- ─────────────────────────────────────────────────────────────────────────────
-- (1) Enums (Doc-6C §3.1 / §3.2 / §3.3) — declared before the tables that use them
-- ─────────────────────────────────────────────────────────────────────────────

-- [Doc-2 §3.2 simple lifecycle] users
CREATE TYPE "identity"."user_status" AS ENUM ('active', 'suspended', 'soft_deleted');
-- [Doc-2 §5.1 binding] organization state machine
CREATE TYPE "identity"."org_status" AS ENUM ('active', 'suspended', 'soft_deleted');
-- [Doc-2 §10.2 binding] organization verification level
CREATE TYPE "identity"."verification_level" AS ENUM ('unverified', 'verified', 'enhanced_verified');
-- [Doc-2 §5.2 binding] membership state machine
CREATE TYPE "identity"."membership_state" AS ENUM ('invited', 'pending', 'active', 'suspended', 'removed');

-- ─────────────────────────────────────────────────────────────────────────────
-- (2) Tables (Doc-2 §10.2 columns verbatim; physical specifics [§2.5]) — FK-valid order
-- ─────────────────────────────────────────────────────────────────────────────

-- §3.1 — identity.users — platform-owned person record + auth boundary (DC-CR3).
-- No password/secret/session column — Supabase Auth = authentication only (DC-4);
-- `auth_user_id` is the external-auth LINKAGE (infra), not a cross-module ref (no FK).
CREATE TABLE "identity"."users" (
  "id"                uuid                  NOT NULL,           -- [Doc-6A §3.1] PK UUIDv7 (M0 ID service)
  "auth_user_id"      uuid,                                     -- [§2.5 realizing Doc-2 §10.2 password(auth-managed) + DC-4] Supabase auth.users link
  "email"             text,                                     -- [Doc-2 §10.2] partial-unique-live on lower(email)
  "phone"             text,                                     -- [Doc-2 §10.2]
  "two_fa_jsonb"      jsonb,                                    -- [Doc-2 §10.2 two_fa] 2FA SETTINGS only — never the secret (DC-4)
  "status"            "identity"."user_status" NOT NULL DEFAULT 'active', -- [Doc-2 §3.2]
  "preferences_jsonb" jsonb,                                    -- [Doc-2 §10.2]
  "created_at"        timestamptz           NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"        timestamptz           NOT NULL DEFAULT now(),
  "created_by"        uuid,                                     -- [Doc-2 §0.2] actor
  "updated_by"        uuid,
  "deleted_at"        timestamptz,                              -- [Doc-2 §0.2] soft-delete (anonymize-on-departure)
  "deleted_by"        uuid,
  "delete_reason"     text,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")                   -- [§2.5] name
);
-- [Doc-2 §10.2 binding] partial-unique-live (Doc-6A §3.5); lower() functional = case-insensitive [§2.5] (no citext — DDL-2)
CREATE UNIQUE INDEX "users_email_live_uq"    ON "identity"."users" (lower("email")) WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX "users_auth_user_id_uq"  ON "identity"."users" ("auth_user_id") WHERE "deleted_at" IS NULL; -- [§2.5] one identity per Supabase auth user (AB-1)

-- §3.2 — identity.organizations — tenant root; first human_ref carrier; §5.1 state machine (DC-CR5).
-- human_ref is a plain NOT NULL text + unique with NO DB default — its value is allocated by
-- the provisioning service via core.allocate_human_ref('ORG', year) (WP-1.3), not here.
-- No cross-schema FK to core (CHK-6-025).
CREATE TABLE "identity"."organizations" (
  "id"                 uuid                  NOT NULL,          -- [Doc-6A §3.1] PK UUIDv7 (also the self-tenant id)
  "human_ref"          text                  NOT NULL,          -- [Doc-2 §0.1/§10.2] ORG-YYYY-NNNNNN via core.allocate_human_ref('ORG', year) — no DB default
  "name"               text                  NOT NULL,          -- [Doc-2 §10.2]
  "slug"               text                  NOT NULL,          -- [Doc-2 §10.2] partial-unique-live; restore-conflict regen service-layer (DC-CR5)
  "org_status"         "identity"."org_status" NOT NULL DEFAULT 'active', -- [Doc-2 §5.1]
  "has_buyer_profile"  boolean               NOT NULL DEFAULT false, -- [Doc-2 §10.2] participation flag (derived; cached)
  "has_vendor_profile" boolean               NOT NULL DEFAULT false, -- [Doc-2 §10.2] derived from M2 (cached; refreshed via event)
  "verification_level" "identity"."verification_level" NOT NULL DEFAULT 'unverified', -- [Doc-2 §10.2]
  "is_personal_org"    boolean               NOT NULL DEFAULT false, -- [Doc-2 §10.2]
  "created_at"         timestamptz           NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"         timestamptz           NOT NULL DEFAULT now(),
  "created_by"         uuid,                                    -- [Doc-2 §0.2] actor
  "updated_by"         uuid,
  "deleted_at"         timestamptz,                             -- [Doc-2 §0.2] soft-delete (cascade per §5.1, service-orchestrated)
  "deleted_by"         uuid,
  "delete_reason"      text,
  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id"),           -- [§2.5] name
  CONSTRAINT "organizations_human_ref_uq" UNIQUE ("human_ref")  -- human_ref never reused (Doc-2 §0.1) → plain unique
);
CREATE UNIQUE INDEX "organizations_slug_live_uq" ON "identity"."organizations" ("slug") WHERE "deleted_at" IS NULL; -- [Doc-2 §10.2 binding]

-- §3.4 — identity.roles — tenant-owned + platform system-bundle seeds (DC-CR2/DC-CR8).
-- organization_id NULL = platform system-bundle seed (Owner/Director/Manager/Officer);
-- nullable intra-schema FK → organizations (Doc-6A §5.2). Present here so the inline
-- memberships_role_fk is valid (Doc-6C DDL-1 deferred ALTER avoided in this subset).
CREATE TABLE "identity"."roles" (
  "id"               uuid        NOT NULL,                      -- [Doc-6A §3.1] PK UUIDv7
  "organization_id"  uuid,                                      -- [Doc-2 §10.2] tenant anchor; NULL = platform system-bundle seed (DC-CR2)
  "name"             text        NOT NULL,                      -- [Doc-2 §10.2]
  "is_system_bundle" boolean     NOT NULL DEFAULT false,        -- [Doc-2 §10.2] Owner/Director/Manager/Officer seeds = true
  "created_at"       timestamptz NOT NULL DEFAULT now(),        -- [Doc-6A R5]
  "updated_at"       timestamptz NOT NULL DEFAULT now(),
  "created_by"       uuid,                                      -- [Doc-2 §0.2] actor
  "updated_by"       uuid,
  "deleted_at"       timestamptz,                               -- [Doc-2 §0.2] SD=YES (org-custom; system bundles are seed — DC-CR4)
  "deleted_by"       uuid,
  "delete_reason"    text,
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id"),                   -- [§2.5] name
  CONSTRAINT "roles_org_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id")  -- [Doc-6A §5.2] intra-schema; nullable (system seeds)
);
-- [§2.5 realizing the DC-CR2/DC-CR8 NULL-seed invariant] per-org uniqueness for tenant roles +
-- GLOBAL uniqueness for system bundles (org_id NULL); Doc-2 §10.2 states no explicit unique.
CREATE UNIQUE INDEX "roles_org_name_live_uq"    ON "identity"."roles" ("organization_id", "name") WHERE "deleted_at" IS NULL AND "organization_id" IS NOT NULL;
CREATE UNIQUE INDEX "roles_system_name_live_uq" ON "identity"."roles" ("name")                    WHERE "deleted_at" IS NULL AND "organization_id" IS NULL;

-- §3.3 — identity.memberships — user↔org link; §5.2 state machine; partial-unique-live (DC-CR10).
-- Tenant-owned (organization_id anchor); intra-schema FKs → organizations, users, roles.
-- DDL-1: the role FK is INLINE here (not a deferred ALTER) because identity.roles is present in
-- this subset and created above — the FK-valid create order makes the inline FK satisfiable.
CREATE TABLE "identity"."memberships" (
  "id"              uuid                      NOT NULL,         -- [Doc-6A §3.1] PK UUIDv7
  "organization_id" uuid                      NOT NULL,         -- [Doc-2 §0.2/§6] RLS anchor
  "user_id"         uuid                      NOT NULL,         -- [Doc-2 §10.2]
  "role_id"         uuid                      NOT NULL,         -- [Doc-2 §10.2] FK → roles
  "state"           "identity"."membership_state" NOT NULL DEFAULT 'invited', -- [Doc-2 §5.2]
  "department"      text,                                       -- [Doc-2 §10.2]
  "joined_at"       timestamptz,                                -- [Doc-2 §10.2] set on → active
  "created_at"      timestamptz               NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"      timestamptz               NOT NULL DEFAULT now(),
  "created_by"      uuid,                                       -- [Doc-2 §0.2] actor
  "updated_by"      uuid,
  "deleted_at"      timestamptz,                                -- [Doc-2 §0.2] (removed retains audit)
  "deleted_by"      uuid,
  "delete_reason"   text,
  CONSTRAINT "memberships_pkey" PRIMARY KEY ("id"),             -- [§2.5] name
  CONSTRAINT "memberships_org_fk"  FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id"), -- [Doc-6A §5.2] intra-schema FK
  CONSTRAINT "memberships_user_fk" FOREIGN KEY ("user_id")         REFERENCES "identity"."users"("id"),
  CONSTRAINT "memberships_role_fk" FOREIGN KEY ("role_id")         REFERENCES "identity"."roles"("id")  -- [Doc-6A §5.2] inline (roles present — DDL-1 deferred ALTER avoided)
);
CREATE UNIQUE INDEX "memberships_user_org_live_uq" ON "identity"."memberships" ("user_id", "organization_id") WHERE "deleted_at" IS NULL; -- [Doc-2 §10.2 binding]
CREATE INDEX "memberships_org_state_idx" ON "identity"."memberships" ("organization_id", "state") WHERE "deleted_at" IS NULL; -- [§2.5] Band H (list members)
CREATE INDEX "memberships_user_idx"      ON "identity"."memberships" ("user_id")                  WHERE "deleted_at" IS NULL; -- [§2.5] Band H (list_my_organizations)

-- §3.8 — identity.buyer_profiles — tenant-owned (organization_id); SD=YES; FK → organizations.
CREATE TABLE "identity"."buyer_profiles" (
  "id"                            uuid        NOT NULL,         -- [Doc-6A §3.1] PK UUIDv7
  "organization_id"               uuid        NOT NULL,         -- [Doc-2 §6] RLS anchor
  "industry"                      text,                         -- [Doc-2 §10.2]
  "factory_info_jsonb"            jsonb,                        -- [Doc-2 §10.2]
  "delivery_locations_jsonb"      jsonb,                        -- [Doc-2 §10.2]
  "procurement_preferences_jsonb" jsonb,                        -- [Doc-2 §10.2]
  "created_at"                    timestamptz NOT NULL DEFAULT now(), -- [Doc-6A R5]
  "updated_at"                    timestamptz NOT NULL DEFAULT now(),
  "created_by"                    uuid,                         -- [Doc-2 §0.2] actor
  "updated_by"                    uuid,
  "deleted_at"                    timestamptz,                  -- [Doc-2 §0.2] SD=YES
  "deleted_by"                    uuid,
  "delete_reason"                 text,
  CONSTRAINT "buyer_profiles_pkey" PRIMARY KEY ("id"),          -- [§2.5] name
  CONSTRAINT "buyer_profiles_org_fk" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") -- [Doc-6A §5.2]
);
CREATE UNIQUE INDEX "buyer_profiles_org_live_uq" ON "identity"."buyer_profiles" ("organization_id") WHERE "deleted_at" IS NULL; -- [§2.5] one buyer profile per org (has_buyer_profile flag — §3.2)

-- ─────────────────────────────────────────────────────────────────────────────
-- (3) RLS — per-class policies (Doc-6C §2.2 / §3.2 / §3.4 / §6.2a). App-layer authz is primary
--     (Doc-4C check_permission); RLS is the row-visibility backstop (Doc-6A §4.5). GUCs are
--     server-set (§2.1): app.user_id, app.active_org, app.is_platform_staff. current_setting(.,true)
--     → NULL when unset → predicate false → fail-closed.
-- ─────────────────────────────────────────────────────────────────────────────

-- users (platform-owned): self or staff (read=write self → split kept explicit — §6.2a)
ALTER TABLE "identity"."users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_self_read"   ON "identity"."users" FOR SELECT
  USING (id = current_setting('app.user_id', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "users_self_update" ON "identity"."users" FOR UPDATE
  USING      (id = current_setting('app.user_id', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (id = current_setting('app.user_id', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- organizations (member-visible read, §3.2; active-org/staff write, §6.2a).
-- The read subquery hits identity.memberships (intra-schema — permitted; not the cross-schema
-- traversal Doc-2 §6 forbids); it runs UNDER memberships_read (which includes own-memberships
-- across all orgs — HQ-003) so list_my_organizations works and there is no recursion.
ALTER TABLE "identity"."organizations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organizations_member_visible" ON "identity"."organizations" FOR SELECT
  USING (
    current_setting('app.is_platform_staff', true)::boolean IS TRUE
    OR EXISTS (SELECT 1 FROM "identity"."memberships" m
                WHERE m."organization_id" = "organizations"."id"
                  AND m."user_id" = current_setting('app.user_id', true)::uuid
                  AND m."state" = 'active' AND m."deleted_at" IS NULL)
  );
CREATE POLICY "organizations_write" ON "identity"."organizations" FOR UPDATE
  USING      (id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- roles (tenant + NULL system seed): read = active_org OR NULL OR staff; write = own-org OR staff
-- (NULL-org system bundles are System/platform-staff only — §3.4 RLS-WRITE-001).
ALTER TABLE "identity"."roles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_read" ON "identity"."roles" FOR SELECT
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR organization_id IS NULL                                    -- system bundles globally readable
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "roles_write" ON "identity"."roles" FOR ALL
  USING      (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- memberships: READ must include own-memberships across ALL orgs (HQ-003) — else the organizations
-- membership EXISTS-subquery would see only the active org and defeat list_my_organizations.
-- Write = active org / staff.
ALTER TABLE "identity"."memberships" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships_read"   ON "identity"."memberships" FOR SELECT
  USING (user_id = current_setting('app.user_id', true)::uuid                  -- own memberships, ANY org (drives the org EXISTS — HQ-003)
         OR organization_id = current_setting('app.active_org', true)::uuid     -- active-org roster (app-layer gates who may list)
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "memberships_insert" ON "identity"."memberships" FOR INSERT
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "memberships_update" ON "identity"."memberships" FOR UPDATE
  USING      (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY "memberships_delete" ON "identity"."memberships" FOR DELETE
  USING      (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- buyer_profiles (single-org tenant: read==write scope → FOR ALL — §6.2a)
ALTER TABLE "identity"."buyer_profiles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyer_profiles_tenant" ON "identity"."buyer_profiles" FOR ALL
  USING      (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- (4) Seed — system-bundle roles (Doc-6C §5.2 / A-08). ROLE ROWS ONLY in this subset
--     (permissions + role_permissions are Wave-2). Owner/Director/Manager/Officer,
--     organization_id IS NULL, is_system_bundle = true. Idempotent forward-only (Doc-6A §11.3):
--     ON CONFLICT predicate MATCHES roles_system_name_live_uq for arbiter-index inference
--     (CONFLICT-001 — a partial index must use the index-predicate form, NOT ON CONSTRAINT).
--     `id` = gen_random_uuid() (PG-native) — row identity is incidental; the natural conflict key
--     is (name) within the partial index. No POLICY-key seed (identity.* deferred to Wave-2).
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "identity"."roles" ("id", "organization_id", "name", "is_system_bundle") VALUES
  (gen_random_uuid(), NULL, 'Owner',    true),
  (gen_random_uuid(), NULL, 'Director', true),
  (gen_random_uuid(), NULL, 'Manager',  true),
  (gen_random_uuid(), NULL, 'Officer',  true)
ON CONFLICT ("name") WHERE "deleted_at" IS NULL AND "organization_id" IS NULL DO NOTHING;
