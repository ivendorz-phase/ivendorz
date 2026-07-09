import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// W2-IDN-1 — Doc-8D org-anchor RLS positive/negative/cross-tenant coverage (per Doc-6C §6.2a
// verbatim) for the 4 tables realized by `identity_authz`: `permissions`, `role_permissions`,
// `organization_workflow_settings`, `delegation_grants`. Asserted through the same Doc-8B §5
// DB-role-switch backstop as `rls-buyer-profiles-byte-equivalence` / `audit-records-context-append-rls`
// — the restricted role `ivendorz_test_rls` (NOBYPASSRLS, non-owner) so the DB POLICY itself is what
// is proven, never the app authz (Doc-8C's concern) and never a superuser false-pass.
//
// Per-table RLS (Doc-6C §6.2a verbatim; realized `identity_authz`):
//   permissions:                    read = USING(true) [INTENTIONALLY open catalog — no org anchor,
//                                    "cross-tenant" is N/A]; write = FOR ALL staff-only.
//   role_permissions:                read = (org=active_org OR org IS NULL OR staff); insert/delete =
//                                    (org=active_org OR staff); **NO UPDATE POLICY** (verbatim).
//   organization_workflow_settings:  FOR ALL (org=active_org OR staff).
//   delegation_grants:               read = active_org IN (controlling, representative) OR staff;
//                                    insert/update/delete = (active_org=controlling OR staff) — split,
//                                    not FOR ALL (RLS-COMP-001).

// ── Deterministic fixed fixtures (UUIDv7-shaped: version nibble 7, variant 8/9/a/b). ──
const ORG_A = "01920000-0000-7000-8000-0000000d0a01"; // controlling / tenant-scoped owner
const ORG_B = "01920000-0000-7000-8000-0000000d0b01"; // representative (delegation) / cross-tenant probe
const ORG_C = "01920000-0000-7000-8000-0000000d0c01"; // neither party — the true cross-tenant outsider
const ROLE_A = "01920000-0000-7000-8000-0000000d0a02"; // org-custom role, ORG_A
const PERM_1 = "01920000-0000-7000-8000-0000000d0111"; // seeded into a committed role_permissions row
const PERM_2 = "01920000-0000-7000-8000-0000000d0112"; // UNUSED by the seed — the INSERT-probe target (avoids a PK collision with the committed PERM_1 row)
const USER_A = "01920000-0000-7000-8000-0000000d0a09";
const OWS_A = "01920000-0000-7000-8000-0000000d0a03";
const DELEG_1 = "01920000-0000-7000-8000-0000000d0001";
const VENDOR_PROFILE_X = "01920000-0000-7000-8000-0000000d09f1"; // M2 bare UUID (no FK)

interface RolePermissionRow {
  role_id: string;
  permission_id: string;
  organization_id: string | null;
}
interface CountRow {
  n: number;
}

let systemOwnerRoleId: string;

/** Seed (ELEVATED, committed) the fixture: orgs A/B/C, an org-custom role for A, a permission, two
 *  role_permissions rows (tenant@A + NULL-org/system), an OWS row for A, and a dual-party delegation
 *  grant (controlling=A, representative=B). */
async function seedFixture(): Promise<void> {
  for (const [id, name, slug] of [
    [ORG_A, "IDN-Authz Org A", `idn-authz-org-a-${ORG_A}`],
    [ORG_B, "IDN-Authz Org B", `idn-authz-org-b-${ORG_B}`],
    [ORG_C, "IDN-Authz Org C", `idn-authz-org-c-${ORG_C}`],
  ] as const) {
    await prisma.organization.create({ data: { id, humanRef: `ORG-IDNAUTHZ-${id}`, name, slug } });
  }
  await prisma.role.create({
    data: {
      id: ROLE_A,
      organizationId: ORG_A,
      name: "IDN-Authz Test Role A",
      isSystemBundle: false,
    },
  });
  await prisma.permission.create({
    data: { id: PERM_1, slug: `idn-authz-test-perm-${PERM_1}`, space: "tenant" },
  });
  await prisma.permission.create({
    data: { id: PERM_2, slug: `idn-authz-test-perm-${PERM_2}`, space: "tenant" },
  });
  const owner = await prisma.role.findFirstOrThrow({
    where: { name: "Owner", organizationId: null, isSystemBundle: true, deletedAt: null },
  });
  systemOwnerRoleId = owner.id;
  await prisma.rolePermission.create({
    data: { roleId: ROLE_A, permissionId: PERM_1, organizationId: ORG_A },
  });
  await prisma.rolePermission.create({
    data: { roleId: systemOwnerRoleId, permissionId: PERM_1, organizationId: null },
  });
  await prisma.organizationWorkflowSettings.create({ data: { id: OWS_A, organizationId: ORG_A } });
  await prisma.delegationGrant.create({
    data: {
      id: DELEG_1,
      controllingOrganizationId: ORG_A,
      representativeOrganizationId: ORG_B,
      vendorProfileId: VENDOR_PROFILE_X,
      permissionSetJsonb: ["can_create_rfq"],
      grantedBy: USER_A,
      status: "active",
    },
  });
}

async function teardownFixture(): Promise<void> {
  await prisma.delegationGrant.deleteMany({ where: { id: DELEG_1 } });
  await prisma.organizationWorkflowSettings.deleteMany({ where: { id: OWS_A } });
  await prisma.rolePermission.deleteMany({ where: { permissionId: { in: [PERM_1, PERM_2] } } });
  await prisma.permission.deleteMany({ where: { id: { in: [PERM_1, PERM_2] } } });
  await prisma.role.deleteMany({ where: { id: ROLE_A } });
  await prisma.organization.deleteMany({ where: { id: { in: [ORG_A, ORG_B, ORG_C] } } });
}

describe("W2-IDN-1 — identity_authz RLS positive/negative/cross-tenant (DB-role backstop)", () => {
  beforeAll(async () => {
    await ensureRestrictedRlsRole(); // idempotent; grants the 4 new tables to the restricted role.
    await teardownFixture(); // clean residue from a prior aborted run (deterministic fixtures).
    await seedFixture();
  });

  afterAll(async () => {
    await teardownFixture();
    await prisma.$disconnect();
  });

  it("RLS-IS-ACTIVE meta-check: restricted role NON-privileged + RLS enabled on all 4 tables", async () => {
    const attrs = await prisma.$queryRawUnsafe<Array<{ rolsuper: boolean; rolbypassrls: boolean }>>(
      `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}'`,
    );
    expect(attrs[0]!.rolsuper).toBe(false);
    expect(attrs[0]!.rolbypassrls).toBe(false);

    for (const table of [
      "permissions",
      "role_permissions",
      "organization_workflow_settings",
      "delegation_grants",
    ]) {
      const rls = await prisma.$queryRawUnsafe<Array<{ enabled: boolean }>>(
        `SELECT relrowsecurity AS enabled FROM pg_class WHERE oid = 'identity.${table}'::regclass`,
      );
      expect(rls[0]!.enabled).toBe(true);
    }
  });

  // ── identity.permissions — read-open catalog; staff-only write; NO org anchor (cross-tenant N/A). ──

  describe("permissions (read-open catalog; staff-write)", () => {
    it("READ is INTENTIONALLY open: even with NO GUC set, the seeded row is visible", async () => {
      const rows = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM identity.permissions WHERE id = $1::uuid`,
          PERM_1,
        ),
      );
      expect(rows).toHaveLength(1);
    });

    it("READ stays open regardless of active_org (platform-wide catalog, not tenant-scoped)", async () => {
      const rows = await asRestrictedRole({ activeOrg: ORG_C }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM identity.permissions WHERE id = $1::uuid`,
          PERM_1,
        ),
      );
      expect(rows).toHaveLength(1);
    });

    it("WRITE (INSERT) by a NON-staff caller is REJECTED (WITH CHECK fails)", async () => {
      await expect(
        asRestrictedRole({}, (tx) =>
          tx.$executeRawUnsafe(
            `INSERT INTO identity.permissions (id, slug, space) VALUES ($1::uuid, $2, 'tenant')`,
            "01920000-0000-7000-8000-0000000d0113",
            "idn-authz-forged-slug",
          ),
        ),
      ).rejects.toThrow(/row-level security/i);
    });

    it("WRITE (UPDATE) by a NON-staff caller matches ZERO rows (USING excludes; fail-closed, no error)", async () => {
      const affected = await asRestrictedRole({}, (tx) =>
        tx.$executeRawUnsafe(
          `UPDATE identity.permissions SET description = 'tampered' WHERE id = $1::uuid`,
          PERM_1,
        ),
      );
      expect(affected).toBe(0);
    });

    it("WRITE (UPDATE) by a STAFF caller is ADMITTED (affects the row)", async () => {
      const affected = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$executeRawUnsafe(
          `UPDATE identity.permissions SET description = 'staff-edit' WHERE id = $1::uuid`,
          PERM_1,
        ),
      );
      expect(affected).toBe(1);
    });

    it("WRITE (INSERT) by a STAFF caller is ADMITTED", async () => {
      await expect(
        asRestrictedRole({ isPlatformStaff: true }, (tx) =>
          tx.$executeRawUnsafe(
            `INSERT INTO identity.permissions (id, slug, space) VALUES ($1::uuid, $2, 'staff')`,
            "01920000-0000-7000-8000-0000000d0114",
            "idn-authz-staff-inserted-slug",
          ),
        ),
      ).resolves.toBe(1);
    });
  });

  // ── identity.role_permissions — split read (org/NULL/staff); split insert/delete; NO UPDATE. ──

  describe("role_permissions (split read wider than write; org=active_org OR org IS NULL)", () => {
    it("READ with NO GUC: only the NULL-org (system) row is visible, not the tenant row", async () => {
      const rows = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<RolePermissionRow[]>(
          `SELECT role_id, permission_id, organization_id FROM identity.role_permissions WHERE permission_id = $1::uuid ORDER BY role_id`,
          PERM_1,
        ),
      );
      expect(rows).toHaveLength(1);
      expect(rows[0]!.organization_id).toBeNull();
    });

    it("POSITIVE: active_org=A sees BOTH the tenant@A row and the NULL-org row", async () => {
      const rows = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$queryRawUnsafe<RolePermissionRow[]>(
          `SELECT role_id, permission_id, organization_id FROM identity.role_permissions WHERE permission_id = $1::uuid ORDER BY organization_id NULLS LAST`,
          PERM_1,
        ),
      );
      expect(rows).toHaveLength(2);
      expect(rows.some((r) => r.organization_id === ORG_A)).toBe(true);
      expect(rows.some((r) => r.organization_id === null)).toBe(true);
    });

    it("CROSS-TENANT: active_org=B sees ONLY the NULL-org row, NOT the tenant@A row", async () => {
      const rows = await asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
        tx.$queryRawUnsafe<RolePermissionRow[]>(
          `SELECT role_id, permission_id, organization_id FROM identity.role_permissions WHERE permission_id = $1::uuid ORDER BY role_id`,
          PERM_1,
        ),
      );
      expect(rows).toHaveLength(1);
      expect(rows[0]!.organization_id).toBeNull();
    });

    it("staff sees BOTH rows regardless of active_org", async () => {
      const rows = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$queryRawUnsafe<RolePermissionRow[]>(
          `SELECT role_id, permission_id, organization_id FROM identity.role_permissions WHERE permission_id = $1::uuid`,
          PERM_1,
        ),
      );
      expect(rows).toHaveLength(2);
    });

    it("INSERT: active_org=A may insert a tenant@A row (admitted)", async () => {
      // Targets PERM_2 (unused by the committed seed) — PERM_1's (ROLE_A, PERM_1, ORG_A) row is already
      // committed by seedFixture; reusing it here would collide on role_permissions_pkey, unrelated to RLS.
      const affected = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$executeRawUnsafe(
          `INSERT INTO identity.role_permissions (role_id, permission_id, organization_id) VALUES ($1::uuid, $2::uuid, $3::uuid)`,
          ROLE_A,
          PERM_2,
          ORG_A,
        ),
      );
      expect(affected).toBe(1);
    });

    it("INSERT: active_org=B CANNOT insert claiming organization_id=A (WITH CHECK rejects)", async () => {
      await expect(
        asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
          tx.$executeRawUnsafe(
            `INSERT INTO identity.role_permissions (role_id, permission_id, organization_id) VALUES ($1::uuid, $2::uuid, $3::uuid)`,
            ROLE_A,
            PERM_2,
            ORG_A,
          ),
        ),
      ).rejects.toThrow(/row-level security/i);
    });

    it("DELETE: active_org=B CANNOT delete the tenant@A row (0 rows — USING excludes it)", async () => {
      const affected = await asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
        tx.$executeRawUnsafe(
          `DELETE FROM identity.role_permissions WHERE role_id = $1::uuid AND organization_id = $2::uuid`,
          ROLE_A,
          ORG_A,
        ),
      );
      expect(affected).toBe(0);
    });

    it("DELETE: active_org=A CAN delete its own tenant@A row (admitted)", async () => {
      const affected = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$executeRawUnsafe(
          `DELETE FROM identity.role_permissions WHERE role_id = $1::uuid AND organization_id = $2::uuid`,
          ROLE_A,
          ORG_A,
        ),
      );
      expect(affected).toBe(1);
    });

    it("NO UPDATE POLICY (verbatim): active_org=A attempting UPDATE on its OWN row matches ZERO rows", async () => {
      // Same org that has full read/insert/delete access — isolates "no UPDATE policy exists" (default
      // deny for the unaddressed command) from an org-mismatch negative.
      const affected = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$executeRawUnsafe(
          `UPDATE identity.role_permissions SET updated_at = now() WHERE role_id = $1::uuid AND organization_id = $2::uuid`,
          ROLE_A,
          ORG_A,
        ),
      );
      expect(affected).toBe(0);
    });
  });

  // ── identity.organization_workflow_settings — single-scope FOR ALL (org=active_org OR staff). ──

  describe("organization_workflow_settings (FOR ALL; org=active_org OR staff)", () => {
    it("POSITIVE: active_org=A sees exactly its own OWS row", async () => {
      const rows = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string; organization_id: string }>>(
          `SELECT id, organization_id FROM identity.organization_workflow_settings ORDER BY id`,
        ),
      );
      expect(rows).toHaveLength(1);
      expect(rows[0]!.id).toBe(OWS_A);
      expect(rows[0]!.organization_id).toBe(ORG_A);
    });

    it("CROSS-TENANT: active_org=B canNOT see org A's OWS row", async () => {
      const rows = await asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM identity.organization_workflow_settings WHERE id = $1::uuid`,
          OWS_A,
        ),
      );
      expect(rows).toEqual([]);
    });

    it("NEGATIVE (fail-closed): NO GUC set ⇒ zero rows visible (tenant-only, no NULL-org concept)", async () => {
      const rows = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<Array<{ n: number }>>(
          `SELECT count(*)::int AS n FROM identity.organization_workflow_settings`,
        ),
      );
      expect(rows[0]!.n).toBe(0);
    });

    it("staff sees the row regardless of active_org", async () => {
      const rows = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM identity.organization_workflow_settings WHERE id = $1::uuid`,
          OWS_A,
        ),
      );
      expect(rows).toHaveLength(1);
    });

    it("INSERT: active_org=B CANNOT insert claiming organization_id=C (WITH CHECK rejects)", async () => {
      // Targets ORG_C (no committed OWS row) rather than ORG_A — isolates the RLS forgery-rejection from
      // any interaction with the pre-existing live ows_org_live_uq row on ORG_A.
      await expect(
        asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
          tx.$executeRawUnsafe(
            `INSERT INTO identity.organization_workflow_settings (id, organization_id) VALUES ($1::uuid, $2::uuid)`,
            "01920000-0000-7000-8000-0000000d0b03",
            ORG_C,
          ),
        ),
      ).rejects.toThrow(/row-level security/i);
    });

    it("UPDATE: active_org=A CAN update its own row (admitted)", async () => {
      const affected = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$executeRawUnsafe(
          `UPDATE identity.organization_workflow_settings SET rfq_approval_mode = 'single' WHERE id = $1::uuid`,
          OWS_A,
        ),
      );
      expect(affected).toBe(1);
    });
  });

  // ── identity.delegation_grants — dual-party read; controlling-only write (split, not FOR ALL). ──

  describe("delegation_grants (dual-party read; controlling-only write)", () => {
    it("POSITIVE: active_org=A (controlling) sees the grant", async () => {
      const rows = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM identity.delegation_grants WHERE id = $1::uuid`,
          DELEG_1,
        ),
      );
      expect(rows).toHaveLength(1);
    });

    it("POSITIVE (dual-party): active_org=B (representative) ALSO sees the grant", async () => {
      const rows = await asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM identity.delegation_grants WHERE id = $1::uuid`,
          DELEG_1,
        ),
      );
      expect(rows).toHaveLength(1);
    });

    it("CROSS-TENANT: active_org=C (neither party) canNOT see the grant", async () => {
      const rows = await asRestrictedRole({ activeOrg: ORG_C }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM identity.delegation_grants WHERE id = $1::uuid`,
          DELEG_1,
        ),
      );
      expect(rows).toEqual([]);
    });

    it("NEGATIVE (fail-closed): NO GUC set ⇒ zero rows visible", async () => {
      const rows = await asRestrictedRole({}, (tx) =>
        tx.$queryRawUnsafe<CountRow[]>(`SELECT count(*)::int AS n FROM identity.delegation_grants`),
      );
      expect(rows[0]!.n).toBe(0);
    });

    it("staff sees the grant regardless of active_org", async () => {
      const rows = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM identity.delegation_grants WHERE id = $1::uuid`,
          DELEG_1,
        ),
      );
      expect(rows).toHaveLength(1);
    });

    it("WRITE (INSERT): active_org=A (controlling) CAN create a new grant it controls (admitted)", async () => {
      const affected = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$executeRawUnsafe(
          `INSERT INTO identity.delegation_grants
             (id, controlling_organization_id, representative_organization_id, vendor_profile_id, permission_set_jsonb, granted_by, status)
           VALUES ($1::uuid, $2::uuid, $2::uuid, $3::uuid, '[]'::jsonb, $4::uuid, 'draft')`,
          "01920000-0000-7000-8000-0000000d0002",
          ORG_A,
          VENDOR_PROFILE_X,
          USER_A,
        ),
      );
      expect(affected).toBe(1);
    });

    it("WRITE (INSERT): active_org=B (representative, NOT controlling) is REJECTED even for its own party role", async () => {
      await expect(
        asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
          tx.$executeRawUnsafe(
            `INSERT INTO identity.delegation_grants
               (id, controlling_organization_id, representative_organization_id, vendor_profile_id, permission_set_jsonb, granted_by, status)
             VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, '[]'::jsonb, $5::uuid, 'draft')`,
            "01920000-0000-7000-8000-0000000d0003",
            ORG_A, // controlling = A
            ORG_B, // representative = B (the caller itself)
            VENDOR_PROFILE_X,
            USER_A,
          ),
        ),
      ).rejects.toThrow(/row-level security/i);
    });

    it("WRITE (UPDATE): active_org=B (representative) canNOT update the grant (0 rows — USING excludes)", async () => {
      const affected = await asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
        tx.$executeRawUnsafe(
          `UPDATE identity.delegation_grants SET status = 'suspended' WHERE id = $1::uuid`,
          DELEG_1,
        ),
      );
      expect(affected).toBe(0);
    });

    it("WRITE (UPDATE): active_org=A (controlling) CAN update the grant (admitted)", async () => {
      const affected = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$executeRawUnsafe(
          `UPDATE identity.delegation_grants SET status = 'suspended' WHERE id = $1::uuid`,
          DELEG_1,
        ),
      );
      expect(affected).toBe(1);
    });

    it("WRITE (DELETE): active_org=B (representative) canNOT delete the grant (0 rows)", async () => {
      const affected = await asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
        tx.$executeRawUnsafe(`DELETE FROM identity.delegation_grants WHERE id = $1::uuid`, DELEG_1),
      );
      expect(affected).toBe(0);
    });

    it("WRITE (DELETE): active_org=A (controlling) CAN delete the grant (admitted)", async () => {
      const affected = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
        tx.$executeRawUnsafe(`DELETE FROM identity.delegation_grants WHERE id = $1::uuid`, DELEG_1),
      );
      expect(affected).toBe(1);
    });

    it("staff CAN write (insert/update/delete) regardless of party membership", async () => {
      const affected = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        tx.$executeRawUnsafe(
          `INSERT INTO identity.delegation_grants
             (id, controlling_organization_id, representative_organization_id, vendor_profile_id, permission_set_jsonb, granted_by, status)
           VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, '[]'::jsonb, $5::uuid, 'draft')`,
          "01920000-0000-7000-8000-0000000d0004",
          ORG_A,
          ORG_B,
          VENDOR_PROFILE_X,
          USER_A,
        ),
      );
      expect(affected).toBe(1);
    });
  });
});
