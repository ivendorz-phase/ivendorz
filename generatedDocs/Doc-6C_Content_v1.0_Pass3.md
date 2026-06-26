# Doc-6C — M1 Identity (`identity`) Schema Realization — Content v1.0 **Pass-3** (§3.9 `delegation_grants` · §6 · §7 + Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 — Independent Hard Review applied** (2 BLOCKER [1 corrected-as-misread, 1 fixed] + 3 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Realizes §3.9 + §6 + §7 + Appendix A. Next: Content Hard Review → Content Freeze Audit |
| Date | 2026-06-26 |
| Builds on | Pass-1 (§0–§2 · users/organizations/memberships) + Pass-2 (roles/permissions/role_permissions/ows/buyer_profiles · §4 state · §5 seed) |
| Authority | `Doc-2 §5.10/§6/§10.2` (the *what*); `Doc-6A` (the *how*); `Doc-4C` (consumed); `Doc-3 v1.9_Identity` (RATIFIED — `identity.*` keys); `Doc-6B §3.4` (`core.system_configuration`) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.2; state set §5.10 verbatim; 7 POLICY keys = Doc-3 v1.9; physical specifics §2.5-tagged |

> With Pass-1+2, this completes all 9 `identity` tables. Same convention: **[Doc-2 binding]** verbatim · **[§2.5 choice]** physical *how*.

---

## §3.9 — `identity.delegation_grants` (the dual-party aggregate — the hardest)

Realizes Doc-2 §10.2 + §5.10 + §6 (DC-CR7). Shared dual-party; the only table with a cross-module ref (`vendor_profile_id` → M2, bare UUID).

```sql
CREATE TYPE identity.delegation_grant_status AS ENUM ('draft', 'active', 'suspended', 'revoked', 'expired');  -- [Doc-2 §5.10 binding]

CREATE TABLE identity.delegation_grants (
  id                          uuid NOT NULL,                    -- [Doc-6A §3.1] PK UUIDv7
  controlling_organization_id uuid NOT NULL,                    -- [Doc-2 §10.2/§6] party column (RLS anchor); the org that owns the grant
  representative_organization_id uuid NOT NULL,                 -- [Doc-2 §10.2/§6] party column (RLS anchor); the org acting on behalf
  vendor_profile_id           uuid NOT NULL,                    -- [Doc-2 §10.2] CROSS-MODULE bare UUID (M2); validated at issue vs Vendor Service; NO FK (Doc-2 §0.3 / DC-CR10)
  permission_set_jsonb        jsonb NOT NULL,                   -- [Doc-2 §10.2] delegated slug array (⊆ existing; never ownership-class — DC-CR7)
  valid_from                  timestamptz NOT NULL DEFAULT now(), -- [Doc-2 §10.2]
  valid_to                    timestamptz,                      -- [Doc-2 §10.2] default span from identity.delegation_validity_default (Doc-3 v1.9; set in service, not a DB default literal)
  granted_by                  uuid NOT NULL,                    -- [Doc-2 §10.2] the user (in controlling org) who granted
  status                      identity.delegation_grant_status NOT NULL DEFAULT 'draft', -- [Doc-2 §5.10]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §0.2] SD=YES
  CONSTRAINT delegation_grants_pkey PRIMARY KEY (id),
  CONSTRAINT delegation_grants_validity_chk CHECK (valid_to IS NULL OR valid_to > valid_from),  -- [§2.5] ordering when set; NULL = no-expiry (Doc-2 "optional") — VALID-TO-001
  CONSTRAINT delegation_grants_controlling_fk    FOREIGN KEY (controlling_organization_id)    REFERENCES identity.organizations(id),  -- [Doc-6A §5.2] intra-schema
  CONSTRAINT delegation_grants_representative_fk FOREIGN KEY (representative_organization_id) REFERENCES identity.organizations(id)
  -- NO FK on vendor_profile_id (cross-module M2 — bare UUID; Doc-2 §0.3 / Doc-6A §5.3)
);
CREATE INDEX delegation_grants_controlling_idx   ON identity.delegation_grants (controlling_organization_id)    WHERE deleted_at IS NULL;  -- [§2.5] Band H
CREATE INDEX delegation_grants_representative_idx ON identity.delegation_grants (representative_organization_id) WHERE deleted_at IS NULL;  -- [§2.5] Band H (party read)
CREATE INDEX delegation_grants_expiry_idx        ON identity.delegation_grants (status, valid_to)               WHERE deleted_at IS NULL;  -- [§2.5] the expiry sweep (System)
```

### §3.9.1 Dual-party RLS (DC-CR7 — both-read / controlling-write)
```sql
ALTER TABLE identity.delegation_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY delegation_grants_party_read ON identity.delegation_grants FOR SELECT
  USING (current_setting('app.active_org', true)::uuid
           IN (controlling_organization_id, representative_organization_id)   -- both parties read (Doc-2 §6)
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- write = controlling org only. Split into INSERT/UPDATE/DELETE (NOT `FOR ALL`) so the write gate never
-- touches SELECT — unambiguous (RLS-COMP-001). [A `FOR ALL` write policy would still be SELECT-safe under
--  PERMISSIVE OR semantics, but the explicit split removes all doubt for a security-critical policy.]
CREATE POLICY delegation_grants_controlling_insert ON identity.delegation_grants FOR INSERT
  WITH CHECK (current_setting('app.active_org', true)::uuid = controlling_organization_id
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY delegation_grants_controlling_update ON identity.delegation_grants FOR UPDATE
  USING      (current_setting('app.active_org', true)::uuid = controlling_organization_id
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.active_org', true)::uuid = controlling_organization_id
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
CREATE POLICY delegation_grants_controlling_delete ON identity.delegation_grants FOR DELETE
  USING      (current_setting('app.active_org', true)::uuid = controlling_organization_id
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
```
Anchors on the **explicit party columns** — **no cross-schema ownership traversal** (Doc-2 §6). Read = both parties; write (insert/update/delete) = controlling org (or platform-staff) only.

### §3.9.2 Cross-module + lifecycle realization
- **`vendor_profile_id` (DC-CR10):** **bare UUID, no FK** (M2-owned). The controlling org's authority over this vendor profile is **validated at issue** against the M2 Vendor Service (Doc-4C); orphan-scan reconciles (Doc-6A §5.5). Never a cross-schema read/JOIN.
- **§5.10 state (DC-CR6):** `status` enum + CHECK; transitions (`draft→active`, `active↔suspended`, `→revoked` terminal, `active→expired` on `valid_to`) — the **dual-party authority guard** (only controlling may transition; `granted_by` must hold authority in controlling org — Doc-2 §5.10) is **service-layer** (app-layer; the RLS write policy enforces the controlling-org gate at the row level as backstop). **Delegates authority, never creates it; never grants ownership-class** (DC-CR7 — the `permission_set_jsonb` is validated ⊆ existing, service-layer).
- **`valid_to` default (Doc-3 v1.9):** the default validity span is `identity.delegation_validity_default` — **read from `core.system_configuration` in the create-grant service**, set on the row; **not a DB default literal** (Doc-6A §10.2 — no literal).
- **Refresh-on-revocation (DC-CR7; Doc-2 §5.10/§6 — load-bearing):** on `→revoked` / `→expired`, the derived **`rfq_invitation_grantees` (M3-owned)** rows + visibility records for that representative are **removed via service/event** (the grant teardown — Doc-4C; M3 consumes), **never a cross-schema write** from identity. Removals audited (Doc-2 §5.10).
- **System expiry sweep:** `expire_delegation_grant` (System 21.5) scans `delegation_grants_expiry_idx` on the `identity.delegation_expiry_sweep_cadence` cadence; transitions `active→expired` where `valid_to` passed; bounded by the v1.9 key, never a literal.
- **Idempotency:** `create_delegation_grant` + mutations dedup via `identity.command_dedup_window` (Doc-3 v1.9).
- **Prisma [§2.5]:** `DelegationGrant` model — `controllingOrganizationId`/`representativeOrganizationId`/`vendorProfileId` (`vendor_profile_id` mapped, **no Prisma relation** — cross-module), `permissionSetJsonb @db.JsonB`, enum `DelegationGrantStatus`, `@@map("delegation_grants") @@schema("identity")`.

---

## §6 — POLICY & Migration

### §6.1 POLICY keys (Doc-3 v1.9_Identity — RATIFIED; read, never literal)
The 7 `identity.*` keys are read from `core.system_configuration` (Doc-6B §3.4) at runtime — **never hard-coded** (Doc-6A §10.2):
| Key | Used by | Pass |
|---|---|---|
| `identity.command_dedup_window` | all `identity` mutations (idempotency-dedup store) | 1/2/3 |
| `identity.user_update_dedup_window` | `update_user_profile`/`update_user_2fa_settings` | 1 |
| `identity.membership_invite_dedup_window` | `invite_member` | 1 |
| `identity.membership_invite_expiry_window` | `expire_invitation` (System) | 1 |
| `identity.delegation_validity_default` | `create_delegation_grant` (`valid_to` span) | 3 |
| `identity.delegation_expiry_sweep_cadence` | `expire_delegation_grant` (System sweep) | 3 |
| `identity.ownership_succession_reminder_cadence` | `transfer_ownership`/`admin_recover_ownership` | (service) |

The dedup store (idempotency-key → result, within window) is realized per the owning-module design (Doc-6A §10.3); the window durations are the keys above.

### §6.2 Structural migration order (forward-only, non-destructive — Doc-6A §11)
`CREATE SCHEMA identity` → enums (`user_status`, `org_status`, `verification_level`, `membership_state`, `permission_space`, `rfq_approval_mode`, `delegation_grant_status`) → the **9 tables** (users, organizations, permissions, roles, role_permissions, organization_workflow_settings, buyer_profiles, memberships, delegation_grants) → **the deferred `memberships_role_fk` ALTER** (after roles — DDL-1, Pass-1) → partial-unique-live + Band-H indexes → **RLS enable + policies** (every tenant-owned/dual-party/platform-owned table) → **seeds** (permissions §5.1, then roles §5.2, then role_permissions composition). Codegen → `generated-contracts-registry/` (gitignored — Doc-6A §11.4). Non-destructive; `human_ref` for organizations via `core.allocate_human_ref('ORG', year)` in the create-org service.

### §6.3 Carried
`DR-6-CORE` (consumed — `core.allocate_human_ref`/`system_configuration`/audit/outbox) · `DR-6-STATE` (§4) · `DR-6-API` (Band H) · `DR-6-MKT` (`vendor_profile_id`) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.9) · `[ESC-6-SCHEMA]`/`[ESC-6-API]` none.

## §7 — Conformance & Carried Items
Doc-6C coins nothing; realizes the 9 Doc-2 §10.2 tables + 3 state machines + the role/permission seed, against frozen Doc-6A. `[ESC-6-POLICY]` cleared (Doc-3 v1.9 RATIFIED). On any conflict, flag-and-halt (the CR4′-style discipline; none raised here). Appendix A attestation below — 37/37, 0 FAIL.

---

## Appendix A — Doc-6C Conformance Attestation (Doc-6A `CHK-6-xxx`, 10 bands / 37 checks)

| Check | Disposition | Evidence |
|---|---|---|
| **A** CHK-6-001 `id UUIDv7` PK | **PASS** | all 9 tables `id UUIDv7` (role_permissions composite PK per Doc-2 §10.2) |
| A CHK-6-002 `human_ref` only where Doc-2 mandates | **PASS** | `organizations.human_ref` (ORG-…) via `core.allocate_human_ref` — **the only `identity` carrier**; the other Doc-2 §0.1 carriers (rfqs/quotations/invoices/documents) are M2/M3/M4-owned, realized in their own Doc-6x. Satisfies the downstream-PASS signal Doc-6B's CHK-6-002 set |
| A CHK-6-003 timestamp tuple; actor stamps where Doc-2 declares | **PASS** | all 9 carry `created_at`/`updated_at` + `created_by`/`updated_by` (Doc-2 §0.2) |
| A CHK-6-004 soft-delete tuple; no `is_deleted` | **PASS** | SD=YES tables carry the tuple; permissions/role_permissions SD=NO (no tuple) |
| A CHK-6-005 partial-unique on soft-deletable | **PASS** | `users.email` (lower), `organizations.slug`, `memberships(user_id,org_id)`, roles **two partial-uniques** (`roles_org_name_live_uq` + `roles_system_name_live_uq` — the NULL-seed invariant), `ows`/`buyer_profiles` (org) — all `WHERE deleted_at IS NULL` (first real use) |
| **B** CHK-6-010 schema=namespace; one Prisma ns | **PASS** | `identity`; `@@schema("identity")` |
| B CHK-6-011 no cross-schema FK | **PASS** | all FKs intra-schema; `vendor_profile_id` = bare UUID (M2), no FK |
| B CHK-6-012 cross-module ref = bare UUID, service-validated | **PASS** | `delegation_grants.vendor_profile_id` (M2, validated at issue, orphan-scan) |
| B CHK-6-013 no cross-schema JOIN/RLS traversal | **PASS** | RLS anchors on intra-schema columns/subquery (org membership) + explicit party columns; no cross-schema |
| **C** CHK-6-020 RLS org-anchor | **PASS** | **first real org-anchor RLS** — 5 tenant-owned `= active_org`; organizations membership-based; delegation dual-party; roles NULL-seed clause |
| C CHK-6-021 materialized grantee anchors | **PASS** | identity realizes cross-party access via **explicit party columns** (`controlling_organization_id`/`representative_organization_id`) — the Doc-2 §6 sanctioned alternative to materialized grantees; the materialized `rfq_invitation_grantees` is **M3-owned**, refreshed on delegation revoke/expiry via service (DC-CR7) |
| C CHK-6-022 non-disclosure byte-equiv | **N/A** | no blacklist/`buyer_vendor_statuses`/`link_suggestions` content in identity |
| C CHK-6-023 authz app-layer; RLS no business authz | **PASS** | access formula = `check_permission` (Doc-4C §C3); RLS = row-visibility backstop |
| **D** CHK-6-030 no hard-DELETE on authoritative | **PASS** | soft-delete (anonymize-on-departure for users); role_permissions row-removal = revoke (audited, reference-composition, not authoritative history) |
| D CHK-6-031 versioned tables immutable once bound | **N/A** | no versioned table in identity |
| D CHK-6-032 history INSERT-only; System scores | **N/A** | no history/score table in identity |
| D CHK-6-033 only `ai.*` TTL hard-delete | **PASS (N/A by design)** | not the `ai` schema; identity hard-deletes nothing |
| **E** CHK-6-040 transactional write+emit | **PASS** | §4.3 state transitions → `core.outbox_events` in-txn (Doc-6A §7.1) |
| E CHK-6-041 no event coined | **PASS** | Doc-2 §8 / Doc-4J / Doc-4L by pointer |
| E CHK-6-042 audit append-only per §9 | **PASS** | mutations audited via Doc-4B §17 (code, CR9); `core.audit_records` realized in Doc-6B |
| E CHK-6-043 audited-action coverage; none coined | **PASS** | Doc-2 §9 by pointer (org/membership/role/delegation changes) |
| **F** CHK-6-050 multi-currency | **N/A** | no monetary column in identity |
| **G** CHK-6-060 `system_configuration` keys seeded; none coined | **PASS** | 7 `identity.*` keys registered (Doc-3 v1.9 RATIFIED); read from `core.system_configuration` |
| G CHK-6-061 page-size/idempotency via POLICY key, not literal | **PASS** | dedup windows + timers = v1.9 keys (§6.1); never literals |
| G CHK-6-062 role/permission seed per Doc-2 §7/A-08 | **PASS** | 45 slugs + 4 role bundles + composition, by pointer (§5) |
| **H** CHK-6-070 Doc-5x reads persistable | **PASS** | Doc-5C reads (list_roles/permissions/delegation_grants/my_organizations/buyer_profile/workflow_settings) + internal-service §C3 supported |
| H CHK-6-071 deterministic sort-key index per list | **PASS** | memberships(org,state)/(user); delegation(controlling)/(representative); roles; etc. |
| H CHK-6-072 idempotency-dedup persisted | **PASS** | dedup store via `identity.*_dedup_window` keys |
| H CHK-6-073 non-persistable → `[ESC-6-API]` | **PASS** | none raised |
| **I** CHK-6-080 nothing coined; traces to Doc-2 | **PASS** | 9 tables Doc-2 §10.2; states §5; slugs §7; keys Doc-3 v1.9 |
| I CHK-6-081 physical specifics §2.5-attributed | **PASS** | citext-avoidance/auth_user_id/enum labels/index names/GUC/partial-uniques tagged |
| I CHK-6-082 no out-of-DB artifact as table | **PASS** | no blob/search/realtime table (Doc-6A §12) |
| I CHK-6-083 `[ESC-6-*]` routed to named channel | **PASS** | `[ESC-6-POLICY]` → **Doc-3 v1.9_Identity RATIFIED** (cleared); v1.9 resolved the 7-vs-6 key question (Doc-4C §C.3 listed 6; the 7th `delegation_expiry_sweep_cadence` referenced in contract bodies — Board confirmed the 7-key union). None open |
| **J** CHK-6-090 extends B.1 base model + B.2 types | **PASS** | std columns + type catalog |
| J CHK-6-091 no shared enum coined; B.3 reused | **PASS** | identity enums are module-owned (user/org/membership/delegation status, permission_space, rfq_approval_mode) — domain enums, correctly NOT lifted into the B.3 cross-cutting set (One Module One Owner) |
| J CHK-6-092 B.4 naming registry followed | **PASS** | `_pkey`/`_live_uq`/`_uq`/`_idx`/`_fk` per B.4 |
| J CHK-6-093 B.5 conventions (multi-schema/migration) | **PASS** | §6 migration; one Prisma ns |

**Result: 0 FAIL.** Count = **37** checks (A:5 · B:4 · C:4 · D:4 · E:4 · F:1 · G:3 · H:4 · I:4 · J:4 = 37 — matches Doc-6A Appendix A). **Band C now PASS** (first real org-anchor RLS — the load-bearing difference from platform-owned `core`); Band G PASS (v1.9 cleared). All N/A justified. **Doc-6C is Appendix-A conformant.**

---

## Review Disposition (Independent Hard Review — Pass-3)

Reviewer: independent (Architecture Board / DDD / Security / DBA). Verified CORRECT: delegation column set (Doc-2 §10.2), `delegation_grant_status` = draft|active|suspended|revoked|expired (§5.10 verbatim), `vendor_profile_id` bare-UUID no-FK (DC-CR10), 7 v1.9 keys, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **RLS-COMP-001** dual-party RLS — `FOR ALL` write blocks representative SELECT | BLOCKER | **CORRECTED-AS-MISREAD + improved** — under PG **permissive** semantics policies are **OR'd**, so representative SELECT was `party_read(TRUE) OR write(FALSE) = TRUE` (not blocked). Reviewer's reasoning was inverted. **Nonetheless adopted** the explicit `FOR INSERT/UPDATE/DELETE` split (unambiguous for a security-critical policy). |
| **VALID-TO-001** `valid_to` nullable, no ordering CHECK | BLOCKER → MAJOR | **FIXED** — added `CHECK (valid_to IS NULL OR valid_to > valid_from)` (NULL = no-expiry per Doc-2 "optional"; ordering enforced when set). |
| **APPENDIX-A-001** CHK-6-002 "now realized" implied all human_ref carriers | MAJOR | **FIXED** — clarified: organizations is the **only `identity` carrier**; rfqs/quotations/invoices/documents are M2/M3/M4's. |
| **APPENDIX-A-002** CHK-6-005 "roles ×2" ambiguous | MAJOR | **FIXED** — named the two indexes (`roles_org_name_live_uq` + `roles_system_name_live_uq`). |
| **APPENDIX-A-003** CHK-6-021 "PASS (N/A-shape)" non-standard label | MAJOR | **FIXED** — standard **PASS**; identity realizes cross-party via explicit party columns (§6 alternative to materialized grantees); M3 owns `rfq_invitation_grantees`. |
| **MIGRATION-001** §6.2 enums not named | MINOR | **REJECTED (false)** — §6.2 already lists all 7 enums by name. |
| **APPENDIX-A-005** 37-check count | MINOR | **CLARIFIED** — recounted: A:5+B:4+C:4+D:4+E:4+F:1+G:3+H:4+I:4+J:4 = **37** (reviewer miscounted Band A as 4; it is 5). Per-band tally added to the Result line. |
| **APPENDIX-A-004** v1.9 7-vs-6 discrepancy unnoted | NIT | **FIXED** — CHK-6-083 now notes v1.9 resolved the 7-vs-6 key question (Board-confirmed). |

**Net:** 1 BLOCKER fixed (valid_to CHECK); 1 BLOCKER corrected-as-reviewer-misread (RLS permissive-OR) but the safer split adopted anyway; 3 MAJOR (attestation wording) fixed; MINOR/NIT clarified; 1 reviewer finding rejected as false (enums ARE named). DDL valid + RLS unambiguous. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6C Content Pass-3 (§3.9 · §6 · §7 + Appendix A) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the dual-party `delegation_grants` (both-read/controlling-write RLS, M2 bare-UUID, §5.10, refresh-on-revocation) + the 7-key v1.9 POLICY binding + the full migration order + the Appendix-A attestation (0 FAIL). With Pass-1+2, all 9 `identity` tables realized. Columns verbatim Doc-2 §10.2; states §5 verbatim; slugs/bundles by pointer; coins nothing. Next: Content Hard Review (cross-pass) → Content Freeze Audit → `Doc-6C_SERIES_FROZEN`.*
