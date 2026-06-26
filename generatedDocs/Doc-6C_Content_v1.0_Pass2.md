# Doc-6C — M1 Identity (`identity`) Schema Realization — Content v1.0 **Pass-2** (§3.4–§3.8 · §4 · §5)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (0 BLOCKER + 4 MAJOR + 3 MINOR + 2 NITPICK dispositioned; §Review Disposition). Realizes §3.4–§3.8 + §4 + §5. Next: Pass-3 |
| Date | 2026-06-26 |
| Builds on | Pass-1 (§0–§2 posture/RLS · users · organizations · memberships) |
| Authority | `Doc-2 §5/§7/§10.2` (the *what*); `Doc-6A` (the *how*); `Doc-4C` (consumed); `Doc-3 v1.9_Identity` (RATIFIED) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.2; the 45 permission slugs + role bundles by pointer to Doc-2 §7 / A-08; physical specifics §2.5-tagged |

> Same convention: **[Doc-2 binding]** verbatim; **[§2.5 choice]** physical *how*. Actual `identity` tables.

---

## §3.4 — `identity.roles` (tenant-owned + platform system-bundle seeds)

Realizes Doc-2 §10.2. Tenant-owned (`organization_id`); system bundles (Owner/Director/Manager/Officer) carry `organization_id IS NULL` (A-08; DC-CR2/DC-CR8). RLS read `= active_org OR organization_id IS NULL`; NULL-org writes System-only.

```sql
CREATE TABLE identity.roles (
  id              uuid        NOT NULL,                         -- [Doc-6A §3.1] PK UUIDv7
  organization_id uuid,                                         -- [Doc-2 §10.2] tenant anchor; NULL = platform system-bundle seed (DC-CR2)
  name            text        NOT NULL,                         -- [Doc-2 §10.2]
  is_system_bundle boolean    NOT NULL DEFAULT false,           -- [Doc-2 §10.2] Owner/Director/Manager/Officer seeds = true
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §0.2] SD=YES (org-custom; system bundles are seed, not user-deleted — DC-CR4)
  CONSTRAINT roles_pkey PRIMARY KEY (id),
  CONSTRAINT roles_org_fk FOREIGN KEY (organization_id) REFERENCES identity.organizations(id)  -- [Doc-6A §5.2] intra-schema; nullable (system seeds)
);
-- [§2.5 realizing the DC-CR2/DC-CR8 NULL-seed invariant] Doc-2 §10.2 states `name, is_system_bundle` (no explicit unique);
-- these materialize the implicit uniqueness the NULL-seed model needs: per-org for tenant roles + GLOBAL for system bundles (org_id NULL).
CREATE UNIQUE INDEX roles_org_name_live_uq    ON identity.roles (organization_id, name) WHERE deleted_at IS NULL AND organization_id IS NOT NULL;
CREATE UNIQUE INDEX roles_system_name_live_uq ON identity.roles (name)                  WHERE deleted_at IS NULL AND organization_id IS NULL;
```
- **RLS (DC-CR2) — read + write realized as DDL (RLS-WRITE-001):**
```sql
ALTER TABLE identity.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_read ON identity.roles FOR SELECT
  USING (organization_id = current_setting('app.active_org', true)::uuid
         OR organization_id IS NULL                                   -- system bundles globally readable
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- write: an org may mutate only its OWN-org roles; NULL-org system bundles are System/platform-staff only
CREATE POLICY roles_write ON identity.roles FOR ALL
  USING      (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
```
An org **clones** a system bundle into its own `organization_id` (never mutates the NULL-org seed — the `roles_write` policy denies it; only platform-staff/System may touch NULL-org rows).
- **System-bundle immutability (SD-001):** a `organization_id IS NULL` system bundle is **never soft-deleted** (it is seed) — enforced by the `roles_write` policy (NULL-org mutation = staff/System only) + a service-layer guard; org-custom roles (SD=YES) soft-delete normally.
- **`memberships_role_fk`** (Pass-1, deferred) is added now in the migration order (§6, Pass-3) — roles exists at this point.
- **Prisma [§2.5]:** `Role` model (`organizationId` nullable, `isSystemBundle`, `@@map("roles") @@schema("identity")`).

## §3.5 — `identity.permissions` (platform catalog; reference data)

Realizes Doc-2 §10.2 + §7. Platform-owned catalog (no org anchor); **SD=NO** (reference data). `slug UNIQUE`, `space ∈ {tenant, staff}` — the two slug spaces (Invariant #2).

```sql
CREATE TYPE identity.permission_space AS ENUM ('tenant', 'staff');  -- [Doc-2 §7 binding] the two slug spaces

CREATE TABLE identity.permissions (
  id          uuid        NOT NULL,                             -- [Doc-6A §3.1] PK UUIDv7
  slug        text        NOT NULL,                             -- [Doc-2 §10.2/§7] the permission slug (e.g. can_create_rfq, staff_can_ban)
  description text,                                             -- [Doc-2 §10.2]
  space       identity.permission_space NOT NULL,               -- [Doc-2 §10.2/§7] tenant | staff
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  CONSTRAINT permissions_pkey PRIMARY KEY (id),
  CONSTRAINT permissions_slug_uq UNIQUE (slug)                  -- [Doc-2 §10.2 binding] plain unique (SD=NO → no partial-live)
);
```
- **RLS (DC-CR2):** read-open catalog (`USING (true)` — all authenticated callers read the slug catalog); **writes platform-staff only** (`staff_can_*` governance). Reference data; no org scope.
- **Seed:** the 45 slugs (§5) — 38 tenant + 7 staff (Doc-2 §7, by pointer); **no slug coined**.
- **Prisma [§2.5]:** `Permission` model + enum `PermissionSpace`.

## §3.6 — `identity.role_permissions` (bundle composition, N:N)

Realizes Doc-2 §10.2. Tenant-owned; PK `(role_id, permission_id)`; **SD=NO** (row removal = revoke, audited).

```sql
CREATE TABLE identity.role_permissions (
  role_id         uuid NOT NULL,                                -- [Doc-2 §10.2] FK → roles
  permission_id   uuid NOT NULL,                                -- [Doc-2 §10.2] FK → permissions
  organization_id uuid,                                         -- [Doc-2 §10.2 binding] RLS anchor (tenant-owned per §6); **not coined** — §10.2 lists it; NULL for system-bundle composition (mirrors roles seed)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),   -- [Doc-2 §10.2 binding] composite PK
  CONSTRAINT role_permissions_role_fk FOREIGN KEY (role_id)       REFERENCES identity.roles(id),        -- [Doc-6A §5.2] intra-schema
  CONSTRAINT role_permissions_perm_fk FOREIGN KEY (permission_id) REFERENCES identity.permissions(id)
);
CREATE INDEX role_permissions_org_idx ON identity.role_permissions (organization_id);  -- [§2.5] Band H / RLS
```
- **RLS (DC-CR2):** `USING (organization_id = active_org OR organization_id IS NULL OR is_platform_staff)` — mirrors `roles` (system-bundle composition has `organization_id IS NULL`). Row removal = revoke (audited via Doc-4B §17; no soft-delete tuple — SD=NO).
- **Prisma [§2.5]:** `RolePermission` model (`@@id([roleId, permissionId])`).

## §3.7 — `identity.organization_workflow_settings`

Realizes Doc-2 §10.2. Tenant-owned (`organization_id`); SD=YES; FK → organizations.

```sql
CREATE TYPE identity.rfq_approval_mode AS ENUM ('none', 'single', 'multi_step');  -- [Doc-2 §10.2 binding]

CREATE TABLE identity.organization_workflow_settings (
  id              uuid NOT NULL,                                -- [Doc-6A §3.1] PK UUIDv7
  organization_id uuid NOT NULL,                                -- [Doc-2 §6] RLS anchor
  rfq_approval_mode      identity.rfq_approval_mode NOT NULL DEFAULT 'none',  -- [Doc-2 §10.2]
  approval_chain_jsonb       jsonb,                             -- [Doc-2 §10.2]
  financial_permissions_jsonb jsonb,                            -- [Doc-2 §10.2]
  notification_rules_jsonb   jsonb,                             -- [Doc-2 §10.2]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §0.2] SD=YES
  CONSTRAINT organization_workflow_settings_pkey PRIMARY KEY (id),
  CONSTRAINT ows_org_fk FOREIGN KEY (organization_id) REFERENCES identity.organizations(id)  -- [Doc-6A §5.2]
);
CREATE UNIQUE INDEX ows_org_live_uq ON identity.organization_workflow_settings (organization_id) WHERE deleted_at IS NULL;  -- [§2.5] one settings row per org
```
- **RLS (DC-CR2):** tenant `USING (organization_id = active_org)`.
- **Prisma [§2.5]:** `OrganizationWorkflowSettings` model + enum `RfqApprovalMode`.

## §3.8 — `identity.buyer_profiles`

Realizes Doc-2 §10.2. Tenant-owned (`organization_id`); SD=YES; FK → organizations.

```sql
CREATE TABLE identity.buyer_profiles (
  id              uuid NOT NULL,                                -- [Doc-6A §3.1] PK UUIDv7
  organization_id uuid NOT NULL,                                -- [Doc-2 §6] RLS anchor
  industry                  text,                               -- [Doc-2 §10.2]
  factory_info_jsonb        jsonb,                              -- [Doc-2 §10.2]
  delivery_locations_jsonb  jsonb,                              -- [Doc-2 §10.2]
  procurement_preferences_jsonb jsonb,                          -- [Doc-2 §10.2]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §0.2] SD=YES
  CONSTRAINT buyer_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT buyer_profiles_org_fk FOREIGN KEY (organization_id) REFERENCES identity.organizations(id)  -- [Doc-6A §5.2]
);
CREATE UNIQUE INDEX buyer_profiles_org_live_uq ON identity.buyer_profiles (organization_id) WHERE deleted_at IS NULL;  -- [§2.5] one buyer profile per org (has_buyer_profile flag — §3.2)
```
- **RLS (DC-CR2):** tenant `USING (organization_id = active_org)`. Setting a row flips `organizations.has_buyer_profile` (service-orchestrated; §3.2 derived flag).
- **Prisma [§2.5]:** `BuyerProfile` model.

---

## §4 — State Machine Realization (Doc-2 §5.1 · §5.2; §5.10 → Pass-3)

Realizes DC-CR6 — status enum + CHECK (the value set) at the DB; transition enforcement split (DR-6-STATE; Doc-6A §5.4). Enums declared in Pass-1 (`org_status` §5.1, `membership_state` §5.2, `user_status`) + Pass-3 (`delegation_grant_status` §5.10).

### §4.1 DB-layer (the value set + simple invariants)
- Each state column is a PG enum → the **value set is CHECK-enforced** by construction (no out-of-set value). Terminal states (`removed`, `revoked`/`expired` Pass-3, `soft_deleted`) are reachable but the **forward/legal-transition** matrix is **not** a pure-DB constraint (a `BEFORE UPDATE` trigger could enforce simple forward-only edges; the complex governance guards cannot — §4.2). Per DR-6-STATE, Doc-6C realizes the **value set + the enumerated transitions by pointer** (Doc-2 §5 / Doc-4M); legal-transition enforcement is **service-layer**, optionally backed by a per-table transition trigger for the simple edges (a §2.5 choice, finalized per machine).

### §4.2 Service-layer (the complex governance guards — app-layer)
These span memberships + roles + the access formula and **cannot** be pure-DB (Doc-2 §5.1/§5.2):
- **Last-Owner Protection** — never leave an org with 0 active Owners (Doc-2 §5.1); ownership succession runs before owner removal/disablement.
- **"Only `active` participates in the access formula"** (Doc-2 §5.2) — enforced in `check_permission` (Doc-4C §C3), app-layer.
- **Cascade-on-soft-delete** (org → memberships/vendor-profile/RFQs/quotations — Doc-2 §5.1) — service-orchestrated, never a DB cascade (no cross-schema, no cross-aggregate DB cascade).

### §4.3 Events
State transitions that Doc-2 §8 declares as domain events emit to **`core.outbox_events`** in the transition transaction (Doc-6B §3.2 / Doc-6A §7.1). **No event coined** (Doc-2 §8 / Doc-4J catalog / Doc-4L flow). Identity emitters are exactly those Doc-2 §8 declares for M1 — bound by pointer.

---

## §5 — Permission & Role Seed (A-08 / Doc-2 §7)

Idempotent forward-only seed (Doc-6A §9.4/§11.3); upsert on natural key; **by pointer, none coined**.

### §5.1 Permission catalog seed (45 slugs — Doc-2 §7)
Seed `identity.permissions` with the **38 tenant slugs** (`space = 'tenant'`) + **7 staff slugs** (`space = 'staff'`) enumerated in **Doc-2 §7** (e.g. tenant: `can_create_rfq`, `can_approve_rfq`, `can_award_rfq`, `can_manage_users`, `can_manage_billing`, `can_manage_delegations`, … ; staff: `staff_can_moderate_rfq`, `staff_can_verify`, `staff_can_support`, `staff_can_ban`, `staff_can_manage_categories`, `staff_can_redact_audit`, `staff_super_admin`). The **authoritative exhaustive list is Doc-2 §7** (bound by pointer; not restated/closed here). Slug + space verbatim; **no slug coined** (a gap between a Doc-2 §7 declared slug and the seed → resolved by a Doc-2 patch before realization, `[ESC-6-SCHEMA]`; none expected).
```sql
INSERT INTO identity.permissions (id, slug, description, space)
VALUES (<uuidv7>, '<slug>', '<desc>', '<tenant|staff>')   -- one row per Doc-2 §7 slug
ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description, space = EXCLUDED.space, updated_at = now();
```

### §5.2 Role-bundle platform seeds (Owner/Director/Manager/Officer — A-08)
Seed `identity.roles` with the 4 system bundles (`organization_id = NULL`, `is_system_bundle = true`, `name ∈ {Owner, Director, Manager, Officer}`), and their `role_permissions` composition per the **Doc-2 §7 bundle defaults** (O/D/M/F columns) — by pointer. Org-custom roles are created by tenants (cloning a bundle into their own `organization_id`). The **two role dimensions** (Invariant #2): the `staff_*` slug space (Platform Participation) is **not** assigned to these org bundles — staff slugs belong to the platform-staff space, never an org role.
```sql
INSERT INTO identity.roles (id, organization_id, name, is_system_bundle)
VALUES (<uuidv7>, NULL, '<Owner|Director|Manager|Officer>', true)
ON CONFLICT (name) WHERE deleted_at IS NULL AND organization_id IS NULL DO NOTHING;  -- predicate MATCHES roles_system_name_live_uq for arbiter-index inference (CONFLICT-001: a partial index must use the index-predicate form, NOT `ON CONSTRAINT`)
-- role_permissions composition seeded per Doc-2 §7 bundle defaults (by pointer; none coined)
```

### §5.3 Seed = data migration (Doc-6A §11.3)
Both seeds are idempotent forward-only seed migrations (re-run safe), separate from structural migration; values bind to Doc-2 §7 / A-08; **none invented**.

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: column sets verbatim (Doc-2 §10.2); enum values (permission_space, rfq_approval_mode); 45-slug + role-bundle pointer (Doc-2 §7 / A-08, none coined); SD flags; intra-schema FKs; Invariant #2 (no staff slug in org bundles); `role_permissions.organization_id` **required not coined** (§10.2 lists it); the two roles partial-unique indexes correctly enforce the NULL-seed uniqueness. 0 BLOCKER.

| Finding | Sev | Disposition |
|---|---|---|
| **RP-001** `role_permissions.organization_id` cited §6 (general) not §10.2 (blueprint) | MAJOR | **FIXED** — re-cited `[Doc-2 §10.2 binding]`; noted "not coined — §10.2 lists it." |
| **IDX-001** roles two partial-unique indexes under-attributed | MAJOR | **FIXED** — tagged `[§2.5 realizing DC-CR2/DC-CR8 NULL-seed invariant]` + explained (per-org + global-system uniqueness; §10.2 states no explicit unique). |
| **CONFLICT-001** `ON CONFLICT (name) WHERE organization_id IS NULL` index inference risky | MAJOR | **FIXED** — predicate now matches the full index predicate `WHERE deleted_at IS NULL AND organization_id IS NULL`. (Reviewer's `ON CONSTRAINT` suggestion **rejected** — partial indexes cannot use `ON CONSTRAINT`; the index-predicate form is the correct PG inference.) |
| **RLS-WRITE-001** roles write-restriction prose-only, not DDL | MAJOR | **FIXED** — added explicit `roles_read` + `roles_write` RLS policies (NULL-org mutation = staff/System only; org clones into own org_id). |
| **SD-001** system-bundle roles soft-delete not guarded | MINOR | **FIXED** — note: NULL-org bundles never soft-deleted (roles_write policy + service guard); org-custom SD normally. |
| **SLUG-001** `[ESC-6-SCHEMA]` escalation vague | MINOR | **FIXED** — clarified (slug gap → Doc-2 patch before realization). |
| **ATTR-001 / ENUM-001 / ENUM-002** | NIT | **NO ACTION** — verified correct by reviewer. |

**Net:** 4 MAJOR (attribution ×2, ON-CONFLICT inference, roles write RLS) fixed; MINOR applied. One reviewer suggestion (`ON CONSTRAINT`) correctly rejected as invalid for partial indexes. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6C Content Pass-2 (§3.4–§3.8 · §4 · §5) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the role/permission model + the two org-child tables + the state-machine realization plan (value-set DB / governance-guards service) + the permission/role seed. Columns verbatim Doc-2 §10.2; 45 slugs + role bundles by pointer to Doc-2 §7 / A-08; intra-schema FKs (Doc-6A §5.2); RLS per DC-CR2 (incl. roles NULL-seed); physical specifics §2.5-attributed; coins nothing. Next: Pass-3 (§3.9 `delegation_grants` dual-party · §6 POLICY/migration · §7 + Appendix A attestation).*
