# Doc-6C — M1 Identity (`identity`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 `users` · §3.2 `organizations` · §3.3 `memberships`)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (2 BLOCKER + 4 MAJOR + 1 MINOR + 1 NITPICK dispositioned; §Review Disposition). Realizes §0–§2 + §3.1/§3.2/§3.3. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | the User + Organization aggregates + membership — the first org-anchor RLS, first `human_ref` carrier, §5.1/§5.2 state machines |
| Authority | `Doc-2 §5.1/§5.2/§6/§10.2` (the *what*); `Doc-6A` (the *how*); `Doc-6B §3.3` (`core.allocate_human_ref` consumed); `Doc-4C §C1/§C3/DC-4` (M1 ownership/authz/auth-boundary, consumed); `Doc-3 v1.9_Identity` (RATIFIED — `identity.*` POLICY keys) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.2; state sets §5.1/§5.2 verbatim; POLICY keys = Doc-3 v1.9; physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("identity")` (R3b). Actual `identity` tables. **[Doc-2 binding]** = verbatim; **[§2.5 choice]** = physical *how* |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6C realizes Doc-2 §10.2 (the *what*) against frozen Doc-6A (the *how*); passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. The `[ESC-6-POLICY]` gate is **CLEARED** (Doc-3 v1.9_Identity RATIFIED — 7 `identity.*` keys). Coins nothing.

## §1 — Scope & the `identity` Table Partition
Pass-1 realizes `users` (§3.1) + `organizations` (§3.2) + `memberships` (§3.3) + the cross-cutting RLS model (§2). Pass-2: roles/permissions/role_permissions/workflow_settings/buyer_profiles + state + seed. Pass-3: delegation_grants + POLICY/migration + Appendix A. The Doc-4C contracts + Supabase Auth = code, referenced (DC-CR11). `vendor_profile_id`→M2 by pointer (Pass-3 only).

## §2 — Tenancy & RLS Realization Model *(the load-bearing section)*

### §2.1 Active-org context (Doc-6A §4.2 — server-set, never client)
Tenant RLS reads a per-transaction GUC `app.active_org` (+ `app.user_id`) set by the app-layer org-context guard (`src/server/`) — **after the guard queries `identity.memberships` and confirms the user has an `active` membership in the requested org** (RLS-3) — **never** from request input (Invariant #5). A third GUC `app.is_platform_staff` (Doc-6B §2.2) gates platform-owned reads. The `current_setting(..., true)` form (`missing_ok = true`, RLS-2) returns **NULL** when a GUC is unset → the predicate is false → **fail-closed** (no rows), never an error. Mechanism (GUC names, missing_ok) = **[§2.5]**; the principle (server-validated active org, never client-supplied) = **[Doc-2 §6 / Invariant #5 binding]**.

### §2.2 Per-class RLS policy plan (binding — DC-CR2)
| Class | Tables | RLS USING |
|---|---|---|
| Tenant-owned | memberships, roles*, role_permissions, organization_workflow_settings, buyer_profiles | `organization_id = current_setting('app.active_org')::uuid` |
| `roles` (NULL-seed) | roles | `organization_id = active_org OR organization_id IS NULL` (read); writes to NULL-org = System-only |
| Organization (member-visible) | organizations | `EXISTS(active membership of app.user_id in this org)` OR platform-staff — supports `list_my_organizations` (RLS-1); `active_org` scopes the tenant-owned tables, not org-row visibility |
| Platform-owned | users, permissions | self (`id = current_setting('app.user_id')::uuid`) OR platform-staff; permissions = read-open catalog, staff-write |
| Shared dual-party | delegation_grants (Pass-3) | read `active_org IN (controlling_organization_id, representative_organization_id)`; write `active_org = controlling_organization_id` |

Authorization is **app-layer** (Doc-4C `check_permission` §C3); RLS is the **backstop** (Doc-6A §4.5) — no business-permission logic in RLS, only row-visibility. Generic policy form **[§2.5]**:
```sql
ALTER TABLE identity.<table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY <table>_tenant_isolation ON identity.<table>
  USING (organization_id = current_setting('app.active_org', true)::uuid);
```
RLS positive/negative/cross-tenant tests = Doc-8 (Doc-6A §11.5); the schema makes them satisfiable (every tenant-owned table has its policy; no leaking view).

---

## §3.1 — `identity.users` (platform-owned; the person record + auth boundary)

Realizes Doc-2 §10.2. Platform-owned (no org anchor — DC-CR3); soft-delete = **anonymize-on-departure** (service-layer; the column tuple is here). **Supabase Auth = authentication only** (DC-4): **no password/secret/session column** — `identity.users` owns the record, preferences, 2FA *settings*.

```sql
CREATE TYPE identity.user_status AS ENUM ('active', 'suspended', 'soft_deleted');  -- [Doc-2 §3.2 simple lifecycle]

CREATE TABLE identity.users (
  id              uuid               NOT NULL,                 -- [Doc-6A §3.1] PK UUIDv7 (M0 ID service)
  auth_user_id    uuid,                                        -- [§2.5 realizing Doc-2 §10.2 `password(auth-managed)` + Doc-4C DC-4] the Supabase `auth.users` id — the external-auth LINKAGE; the credential/secret lives in Supabase Auth, never here
  email           text,                                        -- [Doc-2 §10.2] partial-unique-live on lower(email) (§below)
  phone           text,                                        -- [Doc-2 §10.2]
  two_fa_jsonb    jsonb,                                       -- [Doc-2 §10.2 `two_fa`] 2FA SETTINGS only (method/enabled) — never the secret (DC-4); [§2.5] jsonb
  status          identity.user_status NOT NULL DEFAULT 'active', -- [Doc-2 §3.2]
  preferences_jsonb jsonb,                                     -- [Doc-2 §10.2]
  created_at      timestamptz        NOT NULL DEFAULT now(),   -- [Doc-6A R5]
  updated_at      timestamptz        NOT NULL DEFAULT now(),
  created_by      uuid,                                        -- [Doc-2 §0.2] actor
  updated_by      uuid,
  deleted_at      timestamptz,                                 -- [Doc-2 §0.2] soft-delete (anonymize-on-departure)
  deleted_by      uuid,
  delete_reason   text,
  CONSTRAINT users_pkey PRIMARY KEY (id)                       -- [§2.5] name
);
CREATE UNIQUE INDEX users_email_live_uq    ON identity.users (lower(email)) WHERE deleted_at IS NULL;  -- [Doc-2 §10.2 binding] partial-unique-live (Doc-6A §3.5); lower() functional = case-insensitive [§2.5] (no citext extension dependency — DDL-2)
CREATE UNIQUE INDEX users_auth_user_id_uq  ON identity.users (auth_user_id) WHERE deleted_at IS NULL; -- [§2.5] one identity per Supabase auth user (AB-1)
```
- **No `password` column; the auth boundary is realized as a linkage (DC-4; AB-1/CF-1):** Doc-2 §10.2's `password(auth-managed)` is **not a physical column** — it is the notation that authentication is **external** (Supabase Auth, DC-4). It is realized here as **`auth_user_id`** — a bare reference to the Supabase `auth.users` id (the join from a login to the identity record). The **credential/secret/session lives entirely in Supabase Auth; this schema stores none**. `two_fa_jsonb` holds 2FA **settings** (enrolled method, enabled flag), never the TOTP secret. (`auth_user_id` is an **infra linkage**, not a cross-module reference — Supabase Auth is infrastructure, not a business module; no cross-schema FK.)
- **Anonymize-on-departure (Doc-2 §3.2):** soft-delete sets the tuple; the **anonymization** (clearing email/phone/PII while retaining the row for audit referential integrity) is a **service-layer** step (DC-CR3) — the column allows it; the redaction policy is code.
- **RLS (DC-CR2):** platform-owned — `USING (id = current_setting('app.user_id')::uuid OR current_setting('app.is_platform_staff', true)::boolean)`. No org anchor.
- **Indexes [§2.5]:** the partial-unique-live email; `(status)` for staff filters. Internal-service `get_user` (Doc-4C §C3) = PK lookup.
- **Prisma [§2.5]:**
```prisma
model User {
  id              String   @id @db.Uuid
  authUserId      String?  @map("auth_user_id") @db.Uuid   // Supabase auth.users link (partial-unique-live index in migration)
  email           String?                                   // partial-unique-live on lower(email) in migration
  phone           String?
  twoFaJsonb      Json?    @map("two_fa_jsonb") @db.JsonB
  status          UserStatus @default(active)
  preferencesJsonb Json?   @map("preferences_jsonb") @db.JsonB
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz
  createdBy String? @map("created_by") @db.Uuid
  updatedBy String? @map("updated_by") @db.Uuid
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz
  deletedBy String? @map("deleted_by") @db.Uuid
  deleteReason String? @map("delete_reason")
  @@map("users")
  @@schema("identity")
}
enum UserStatus { active suspended soft_deleted  @@schema("identity") }
```

## §3.2 — `identity.organizations` (the tenant root; first `human_ref`; §5.1 state machine)

Realizes Doc-2 §10.2 + §5.1. Self-tenant root (`organization_id` = own `id`); `human_ref ORG-…` via `core.allocate_human_ref` (DR-6-CORE).

```sql
CREATE TYPE identity.org_status AS ENUM ('active', 'suspended', 'soft_deleted');         -- [Doc-2 §5.1 binding]
CREATE TYPE identity.verification_level AS ENUM ('unverified', 'verified', 'enhanced_verified'); -- [Doc-2 §10.2 binding]

CREATE TABLE identity.organizations (
  id                  uuid               NOT NULL,             -- [Doc-6A §3.1] PK UUIDv7 (also the self-tenant id)
  human_ref           text               NOT NULL,             -- [Doc-2 §0.1/§10.2] ORG-YYYY-NNNNNN via core.allocate_human_ref('ORG', year)
  name                text               NOT NULL,             -- [Doc-2 §10.2]
  slug                text               NOT NULL,             -- [Doc-2 §10.2] partial-unique-live (§below); restore-conflict regen (DC-CR5)
  org_status          identity.org_status NOT NULL DEFAULT 'active', -- [Doc-2 §5.1]
  has_buyer_profile   boolean            NOT NULL DEFAULT false, -- [Doc-2 §10.2] participation flag (derived; cached)
  has_vendor_profile  boolean            NOT NULL DEFAULT false, -- [Doc-2 §10.2] derived from M2 (cached; refreshed via event — never a cross-schema read)
  verification_level  identity.verification_level NOT NULL DEFAULT 'unverified', -- [Doc-2 §10.2]
  is_personal_org     boolean            NOT NULL DEFAULT false, -- [Doc-2 §10.2]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  deleted_at timestamptz, deleted_by uuid, delete_reason text, -- [Doc-2 §0.2] soft-delete (cascade per §5.1, service-orchestrated)
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_human_ref_uq UNIQUE (human_ref)    -- human_ref never reused (Doc-2 §0.1) → plain unique
);
CREATE UNIQUE INDEX organizations_slug_live_uq ON identity.organizations (slug) WHERE deleted_at IS NULL;  -- [Doc-2 §10.2 binding]
```
- **`human_ref` (DC-CR5):** allocated by `core.allocate_human_ref('ORG', <year>)` (Doc-6B §3.3) **in the create transaction** (Doc-4C — no second ref on replay). The `'ORG'` entity_type + year-scope produce `ORG-2026-000001`. Consumed by pointer; not re-implemented.
- **§5.1 state (DC-CR6):** `org_status` enum + CHECK (the value set); transitions (`active↔suspended`, `→soft_deleted`, `soft_deleted→active restore`) enforced **service-layer** with the governance guards (**Last-Owner Protection** ≥1 active Owner; ownership succession before owner removal — Doc-2 §5.1) — a pure-DB trigger cannot express them. The **restore-conflict slug regeneration** (Doc-2 §5.1) is service-layer [§2.5]. **Cascade-on-soft-delete** (memberships→soft-deleted; vendor profile→suspended via M2; RFQs→archived via M3; quotations→preserved) is **service-orchestrated** (Doc-2 §5.1) — never a DB cascade.
- **`has_vendor_profile`** is a **cached derived** flag (the authoritative vendor profile is M2); refreshed by an M2 event (Doc-4L), never a cross-schema read (Doc-6A §5.3).
- **RLS (DC-CR2; RLS-1 — membership-based, not active-org-narrow):** a user may read **any organization they hold an active membership in** (so `list_my_organizations` works — not just the one `active_org`); staff see all. The subquery hits `identity.memberships` (**intra-schema** — permitted; not the cross-schema traversal Doc-2 §6 forbids):
```sql
CREATE POLICY organizations_member_visible ON identity.organizations
  USING (
    current_setting('app.is_platform_staff', true)::boolean IS TRUE
    OR EXISTS (SELECT 1 FROM identity.memberships m
                WHERE m.organization_id = organizations.id
                  AND m.user_id = current_setting('app.user_id', true)::uuid
                  AND m.state = 'active' AND m.deleted_at IS NULL)
  );
```
`active_org` (the GUC) scopes **tenant-owned** tables (memberships/roles/etc. — §2.2), not org-row visibility.
- **Indexes [§2.5]:** `human_ref` unique; slug partial-unique-live; `(verification_level)`, `(org_status)` for staff/discovery.
- **Prisma [§2.5]:** `Organization` model — `humanRef @map("human_ref")`, enums `OrgStatus`/`VerificationLevel @@schema("identity")`, `@@map("organizations") @@schema("identity")` (omitted for brevity; same column mapping discipline as §3.1).

## §3.3 — `identity.memberships` (user↔org link; §5.2 state machine; partial-unique-live)

Realizes Doc-2 §10.2 + §5.2. Tenant-owned (`organization_id` anchor); intra-schema FKs → organizations, users, roles.

```sql
CREATE TYPE identity.membership_state AS ENUM ('invited', 'pending', 'active', 'suspended', 'removed');  -- [Doc-2 §5.2 binding]

CREATE TABLE identity.memberships (
  id              uuid                NOT NULL,                -- [Doc-6A §3.1] PK UUIDv7
  organization_id uuid                NOT NULL,                -- [Doc-2 §0.2/§6] RLS anchor
  user_id         uuid                NOT NULL,                -- [Doc-2 §10.2]
  role_id         uuid                NOT NULL,                -- [Doc-2 §10.2] FK → roles (Pass-2)
  state           identity.membership_state NOT NULL DEFAULT 'invited', -- [Doc-2 §5.2]
  department      text,                                        -- [Doc-2 §10.2]
  joined_at       timestamptz,                                 -- [Doc-2 §10.2] set on → active
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  deleted_at timestamptz, deleted_by uuid, delete_reason text, -- [Doc-2 §0.2] (removed retains audit)
  CONSTRAINT memberships_pkey PRIMARY KEY (id),
  CONSTRAINT memberships_org_fk  FOREIGN KEY (organization_id) REFERENCES identity.organizations(id),  -- [Doc-6A §5.2] intra-schema FK
  CONSTRAINT memberships_user_fk FOREIGN KEY (user_id)         REFERENCES identity.users(id)
  -- NOTE (DDL-1): the role FK is NOT inline — identity.roles is realized in Pass-2; memberships_role_fk is added by a deferred ALTER (below), after roles exists
);
CREATE UNIQUE INDEX memberships_user_org_live_uq ON identity.memberships (user_id, organization_id) WHERE deleted_at IS NULL;  -- [Doc-2 §10.2 binding]
CREATE INDEX memberships_org_state_idx ON identity.memberships (organization_id, state) WHERE deleted_at IS NULL;  -- [§2.5] Band H (list members)
CREATE INDEX memberships_user_idx ON identity.memberships (user_id) WHERE deleted_at IS NULL;  -- [§2.5] Band H (list_my_organizations)

-- deferred in the §6 migration, AFTER identity.roles exists (Pass-2) — keeps create-order valid (DDL-1):
-- ALTER TABLE identity.memberships
--   ADD CONSTRAINT memberships_role_fk FOREIGN KEY (role_id) REFERENCES identity.roles(id);
```
- **§5.2 state (DC-CR6):** `state` enum + CHECK; transitions (`invited→pending→active`, `active↔suspended`, `→removed` terminal, `invited→removed` expire/revoke) — simple edges service-enforced; the access-formula rule **"only `active` participates"** (Doc-2 §5.2) is **app-layer** (the membership is read by `check_permission`). Invite expiry (`invited→removed`) is the System timer `expire_invitation` bounded by `identity.membership_invite_expiry_window` (Doc-3 v1.9; read from `core.system_configuration`, never a literal).
- **Last-Owner Protection** (Doc-2 §5.1/§5.2) — removing/suspending the last active Owner is **blocked service-layer**; cannot be a pure-DB constraint (it spans memberships + roles + the access formula). DR-6-STATE.
- **Idempotency:** `invite_member` dedup via `identity.membership_invite_dedup_window`; generic mutations via `identity.command_dedup_window` (Doc-3 v1.9) — the dedup store reads these keys, never literals.
- **RLS (DC-CR2):** tenant `USING (organization_id = active_org)`.
- **FK note:** `memberships_role_fk` targets `identity.roles` (Pass-2) — same schema (intra-schema FK ok, Doc-6A §5.2); created in the migration **after** `roles` exists (§6 order, Pass-3).
- **Prisma [§2.5]:** `Membership` model with `@@map`/`@@schema("identity")`, FKs as Prisma relations, enum `MembershipState`.

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: column sets (Doc-2 §10.2), state sets (§3.2/§5.1/§5.2 verbatim), `human_ref` signature (`core.allocate_human_ref('ORG', year)` — Doc-6B §3.3), the 7 v1.9 POLICY keys, auth-boundary (no secret column), coin-nothing, §2.5 attribution.

| Finding | Sev | Disposition |
|---|---|---|
| **AB-1** auth↔identity linkage missing (no `auth_user_id`) — login can't resolve to user | BLOCKER | **FIXED** — added `auth_user_id` (Supabase `auth.users` id; §2.5 realization of `password(auth-managed)`/DC-4) + partial-unique index; secret stays in Supabase. Infra linkage, not cross-module. |
| **DDL-1** memberships→roles FK inline but roles is Pass-2 → DDL fails | BLOCKER | **FIXED** — role FK removed from `CREATE TABLE`; added as a **deferred `ALTER TABLE`** (after roles, §6 migration). |
| **CF-1** `password(auth-managed)` column dropped without clarity | MAJOR | **FIXED** — clarified: Doc-2 notation = external auth (not a physical column); realized as `auth_user_id`; no secret stored. |
| **RLS-1** org RLS `id = active_org` too narrow for `list_my_organizations` | MAJOR | **FIXED** — org RLS now **membership-based** (`EXISTS active membership of app.user_id`) — intra-schema subquery (allowed); `active_org` scopes tenant-owned tables only. |
| **DDL-2** `citext` extension undeclared | MAJOR | **FIXED** — dropped citext; `email text` + `lower(email)` functional partial-unique-live (no extension dependency). |
| **RLS-2** `missing_ok=true` unattributed | MINOR | **FIXED** — §2.1: `current_setting(..., true)` → NULL when unset → **fail-closed** ([§2.5]). |
| **RLS-3** Invariant #5 validation mechanism not stated | NIT | **FIXED** — §2.1: guard queries `memberships`, confirms active membership before setting the GUC. |

**Net:** 2 BLOCKER (auth linkage, FK ordering) + 4 MAJOR (password clarity, org-RLS breadth, citext) fixed; MINOR/NIT applied. DDL now valid + executable; RLS supports the Doc-5C reads + is fail-closed. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6C Content Pass-1 (§0–§2 · §3.1 · §3.2 · §3.3) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the User+Org aggregates + membership + the first org-anchor RLS model. Columns verbatim Doc-2 §10.2; state sets §5.1/§5.2 verbatim; `human_ref` via `core.allocate_human_ref`; POLICY keys = Doc-3 v1.9 (RATIFIED); auth boundary (no secret column — DC-4); complex guards service-layer (DR-6-STATE); physical specifics §2.5-attributed; coins nothing. Next: Pass-2 (roles · permissions · role_permissions · organization_workflow_settings · buyer_profiles · §4 state · §5 seed).*
