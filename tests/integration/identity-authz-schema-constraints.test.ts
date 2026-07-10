import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";

// W2-IDN-1 — Doc-8D schema-constraint coverage for the 4 tables realized by `identity_authz`
// (Doc-6C §3.5/§3.6/§3.7/§3.9): `permissions`, `role_permissions`, `organization_workflow_settings`,
// `delegation_grants`. Uniques / composite PK / CHECK / FK-valid-order / the deliberate NO-FK on
// `delegation_grants.vendor_profile_id` (cross-module M2, DC-CR10). Runs on the elevated (superuser)
// connection — these are DB-constraint assertions, not RLS (RLS is the separate
// `rls-identity-authz-tables` suite); superuser bypass is irrelevant here (constraints are enforced
// regardless of role — PK/UNIQUE/CHECK/FK are not RLS policies).

// RV-0146 B-3 — signature-matched rejection helper (mirrors the RLS suite's `/row-level security/i`
// idiom): a bare `.rejects.toThrow()` passes for ANY thrown reason, so a wrong-constraint regression
// (e.g. the FK firing before the CHECK, or the wrong unique) would silently still pass. Pin the exact
// Prisma error code (`P2002` unique / `P2003` FK / `P2010` raw-query constraint) PLUS a message
// fragment naming the specific constraint/field/enum, never a generic throw.
async function rejectsWithPrismaError(
  promise: Promise<unknown>,
  code: "P2002" | "P2003" | "P2010",
  messageFragment: string,
): Promise<void> {
  await expect(promise).rejects.toMatchObject({
    code,
    message: expect.stringContaining(messageFragment),
  });
}

// ── Deterministic fixed fixtures (UUIDv7-shaped: version nibble 7, variant 8/9/a/b). ──
const ORG_A = "01920000-0000-7000-8000-0000000c0a01";
const ROLE_A = "01920000-0000-7000-8000-0000000c0a02";
const PERM_1 = "01920000-0000-7000-8000-0000000c0111";
const PERM_2 = "01920000-0000-7000-8000-0000000c0112";
const USER_A = "01920000-0000-7000-8000-0000000c0a09";
const NONEXISTENT_UUID = "01920000-0000-7000-8000-0000000cdead";
// RV-0146 B-2 — a dedicated second org for the `ows_org_live_uq` partial-index accept test, kept
// isolated from ORG_A (which the `ows_org_live_uq` reject test above already leaves holding one live
// settings row) so the two tests never interact via insertion order.
const ORG_B_OWS = "01920000-0000-7000-8000-0000000c0b01";

async function cleanup(): Promise<void> {
  await prisma.delegationGrant.deleteMany({
    where: { controllingOrganizationId: ORG_A },
  });
  await prisma.organizationWorkflowSettings.deleteMany({
    where: { organizationId: { in: [ORG_A, ORG_B_OWS] } },
  });
  await prisma.rolePermission.deleteMany({ where: { roleId: ROLE_A } });
  // Catches PERM_1/PERM_2 plus every throwaway id minted inline by the permissions_* tests below
  // (all slugs share the `sc_test_` prefix — deterministic, no Math.random).
  await prisma.permission.deleteMany({ where: { slug: { startsWith: "sc_test_" } } });
  await prisma.role.deleteMany({ where: { id: ROLE_A } });
  await prisma.organization.deleteMany({ where: { id: { in: [ORG_A, ORG_B_OWS] } } });
}

describe("W2-IDN-1 — schema-constraint coverage (permissions/role_permissions/ows/delegation_grants)", () => {
  beforeAll(async () => {
    await cleanup(); // clean residue from a prior aborted run (deterministic fixtures).
    await prisma.organization.create({
      data: {
        id: ORG_A,
        humanRef: `ORG-SCTEST-${ORG_A}`,
        name: "Schema-Constraint Org A",
        slug: `sc-org-a-${ORG_A}`,
      },
    });
    await prisma.role.create({
      data: { id: ROLE_A, organizationId: ORG_A, name: "SC Test Role A", isSystemBundle: false },
    });
    // PERM_1/PERM_2 back the role_permissions tests below — created up front (order-independent; the
    // `permissions_slug_uq` test below creates its OWN throwaway duplicate-slug row, not PERM_1 itself).
    await prisma.permission.create({
      data: { id: PERM_1, slug: `sc_test_perm1_${PERM_1}`, space: "tenant" },
    });
    await prisma.permission.create({
      data: { id: PERM_2, slug: `sc_test_perm2_${PERM_2}`, space: "tenant" },
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  // ── identity.permissions (§3.5) ──

  it("permissions_slug_uq: a duplicate slug is REJECTED (plain unique, SD=NO)", async () => {
    await prisma.permission.create({
      data: {
        id: "01920000-0000-7000-8000-0000000c0113",
        slug: "sc_test_slug_dup",
        space: "tenant",
      },
    });
    await rejectsWithPrismaError(
      prisma.permission.create({
        data: {
          id: "01920000-0000-7000-8000-0000000c0114",
          slug: "sc_test_slug_dup",
          space: "staff",
        },
      }),
      "P2002",
      "slug",
    );
  });

  it("permissions.space accepts only the enum values (tenant | staff)", async () => {
    await rejectsWithPrismaError(
      prisma.$executeRawUnsafe(
        `INSERT INTO identity.permissions (id, slug, space) VALUES ($1::uuid, $2, 'bogus_space')`,
        "01920000-0000-7000-8000-0000000c0115",
        "sc_test_bad_space",
      ),
      "P2010",
      "permission_space",
    );
  });

  // ── identity.role_permissions (§3.6) ──

  it("role_permissions_pkey: a duplicate (role_id, permission_id) composite key is REJECTED", async () => {
    await prisma.rolePermission.create({
      data: { roleId: ROLE_A, permissionId: PERM_1, organizationId: ORG_A },
    });
    await rejectsWithPrismaError(
      prisma.rolePermission.create({
        data: { roleId: ROLE_A, permissionId: PERM_1, organizationId: ORG_A },
      }),
      "P2002",
      "role_id",
    );
  });

  it("role_permissions_role_fk: an invalid role_id is REJECTED (FK-valid order)", async () => {
    await rejectsWithPrismaError(
      prisma.rolePermission.create({
        data: { roleId: NONEXISTENT_UUID, permissionId: PERM_1, organizationId: ORG_A },
      }),
      "P2003",
      "role_permissions_role_fk",
    );
  });

  it("role_permissions_perm_fk: an invalid permission_id is REJECTED", async () => {
    await rejectsWithPrismaError(
      prisma.rolePermission.create({
        data: { roleId: ROLE_A, permissionId: NONEXISTENT_UUID, organizationId: ORG_A },
      }),
      "P2003",
      "role_permissions_perm_fk",
    );
  });

  it("role_permissions.organization_id carries NO FK (Doc-6C §3.6 — not coined; a non-existent org id is ACCEPTED)", async () => {
    // Proves the schema matches the oracle exactly: §3.6 declares role_fk + perm_fk only, no org_fk.
    await expect(
      prisma.rolePermission.create({
        data: { roleId: ROLE_A, permissionId: PERM_2, organizationId: NONEXISTENT_UUID },
      }),
    ).resolves.toBeDefined();
    await prisma.rolePermission.deleteMany({ where: { roleId: ROLE_A, permissionId: PERM_2 } });
  });

  it("role_permissions.organization_id accepts NULL (system-bundle composition mirror)", async () => {
    await expect(
      prisma.rolePermission.create({
        data: { roleId: ROLE_A, permissionId: PERM_2, organizationId: null },
      }),
    ).resolves.toMatchObject({ organizationId: null });
    await prisma.rolePermission.deleteMany({ where: { roleId: ROLE_A, permissionId: PERM_2 } });
  });

  // ── identity.organization_workflow_settings (§3.7) ──

  it("ows_org_live_uq: a second LIVE settings row for the same org is REJECTED (partial-unique-live)", async () => {
    await prisma.organizationWorkflowSettings.create({
      data: { id: "01920000-0000-7000-8000-0000000c0a03", organizationId: ORG_A },
    });
    await rejectsWithPrismaError(
      prisma.organizationWorkflowSettings.create({
        data: { id: "01920000-0000-7000-8000-0000000c0a04", organizationId: ORG_A },
      }),
      "P2002",
      "organization_id",
    );
  });

  // RV-0146 B-2 — proves `ows_org_live_uq` is genuinely PARTIAL (`WHERE deleted_at IS NULL`), not a
  // plain `UNIQUE(organization_id)`: the reject test above only exercises two LIVE rows colliding.
  // Under a drifted plain-unique migration, the second insert below (for a row whose sibling has
  // already been soft-deleted) would ALSO be rejected — this test discriminates the two schemas.
  it("ows_org_live_uq is genuinely PARTIAL: after soft-delete, a second LIVE row for the same org is ACCEPTED (a plain UNIQUE(organization_id) would reject this)", async () => {
    await prisma.organization.create({
      data: {
        id: ORG_B_OWS,
        humanRef: `ORG-SCTEST-${ORG_B_OWS}`,
        name: "Schema-Constraint Org B (OWS partial-unique)",
        slug: `sc-org-b-${ORG_B_OWS}`,
      },
    });
    const firstId = "01920000-0000-7000-8000-0000000c0a07";
    const secondId = "01920000-0000-7000-8000-0000000c0a08";
    await prisma.organizationWorkflowSettings.create({
      data: { id: firstId, organizationId: ORG_B_OWS },
    });
    await prisma.organizationWorkflowSettings.update({
      where: { id: firstId },
      data: { deletedAt: new Date() },
    });

    await expect(
      prisma.organizationWorkflowSettings.create({
        data: { id: secondId, organizationId: ORG_B_OWS },
      }),
    ).resolves.toMatchObject({ id: secondId, organizationId: ORG_B_OWS, deletedAt: null });

    // Verify persistence by round-trip (not just the `create()` return value): both rows genuinely
    // exist — one soft-deleted, one live.
    const rows = await prisma.organizationWorkflowSettings.findMany({
      where: { organizationId: ORG_B_OWS },
      orderBy: { id: "asc" },
    });
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.id === firstId)?.deletedAt).not.toBeNull();
    expect(rows.find((r) => r.id === secondId)?.deletedAt).toBeNull();

    await prisma.organizationWorkflowSettings.deleteMany({ where: { organizationId: ORG_B_OWS } });
    await prisma.organization.deleteMany({ where: { id: ORG_B_OWS } });
  });

  it("ows_org_fk: an invalid organization_id is REJECTED", async () => {
    await rejectsWithPrismaError(
      prisma.organizationWorkflowSettings.create({
        data: { id: "01920000-0000-7000-8000-0000000c0a05", organizationId: NONEXISTENT_UUID },
      }),
      "P2003",
      "ows_org_fk",
    );
  });

  it("organization_workflow_settings.rfq_approval_mode accepts only the enum values", async () => {
    await rejectsWithPrismaError(
      prisma.$executeRawUnsafe(
        `INSERT INTO identity.organization_workflow_settings (id, organization_id, rfq_approval_mode)
         VALUES ($1::uuid, $2::uuid, 'bogus_mode')`,
        "01920000-0000-7000-8000-0000000c0a06",
        ORG_A,
      ),
      "P2010",
      "rfq_approval_mode",
    );
  });

  // ── identity.delegation_grants (§3.9) ──

  const DELEG_OK = "01920000-0000-7000-8000-0000000c0d01";
  const VENDOR_PROFILE_X = "01920000-0000-7000-8000-0000000c09f1"; // M2 — no row anywhere; proves NO FK

  it("delegation_grants.vendor_profile_id carries NO FK (M2 cross-module bare UUID — DC-CR10): a non-existent value is ACCEPTED", async () => {
    await expect(
      prisma.delegationGrant.create({
        data: {
          id: DELEG_OK,
          controllingOrganizationId: ORG_A,
          representativeOrganizationId: ORG_A,
          vendorProfileId: VENDOR_PROFILE_X, // no row exists anywhere for this id — no FK, so it is admitted
          permissionSetJsonb: ["can_create_rfq"],
          grantedBy: USER_A,
        },
      }),
    ).resolves.toMatchObject({ vendorProfileId: VENDOR_PROFILE_X });
    await prisma.delegationGrant.deleteMany({ where: { id: DELEG_OK } });
  });

  it("delegation_grants_validity_chk: valid_to <= valid_from is REJECTED (ordering CHECK)", async () => {
    const validFrom = new Date("2026-07-09T00:00:00Z");
    const validToEarlier = new Date("2026-07-01T00:00:00Z");
    // CHECK-constraint violations raised through the typed Prisma Client (as opposed to
    // `$executeRawUnsafe`) surface as `PrismaClientUnknownRequestError` — it carries no `.code`, so
    // this is asserted by message fragment (mirroring the RLS suite's `/row-level security/i` idiom)
    // rather than `rejectsWithPrismaError`'s code+fragment pair.
    await expect(
      prisma.delegationGrant.create({
        data: {
          id: "01920000-0000-7000-8000-0000000c0d02",
          controllingOrganizationId: ORG_A,
          representativeOrganizationId: ORG_A,
          vendorProfileId: VENDOR_PROFILE_X,
          permissionSetJsonb: ["can_create_rfq"],
          grantedBy: USER_A,
          validFrom,
          validTo: validToEarlier,
        },
      }),
    ).rejects.toThrow(/delegation_grants_validity_chk/);
  });

  // RV-0146 B-1 — pins the CHECK's exact equality boundary. The frozen rule (Doc-6C §3.9) is strict
  // `valid_to > valid_from`; the reject test above only proves `valid_to < valid_from` is rejected,
  // which a DRIFTED `valid_to >= valid_from` migration would also satisfy. This test isolates the
  // boundary itself: `valid_to === valid_from` must still be rejected under the frozen strict `>`.
  it("delegation_grants_validity_chk: valid_to === valid_from (equality boundary) is REJECTED (pins strict '>', not a drifted '>=')", async () => {
    const same = new Date("2026-07-09T00:00:00Z");
    await expect(
      prisma.delegationGrant.create({
        data: {
          id: "01920000-0000-7000-8000-0000000c0d08",
          controllingOrganizationId: ORG_A,
          representativeOrganizationId: ORG_A,
          vendorProfileId: VENDOR_PROFILE_X,
          permissionSetJsonb: ["can_create_rfq"],
          grantedBy: USER_A,
          validFrom: same,
          validTo: same,
        },
      }),
    ).rejects.toThrow(/delegation_grants_validity_chk/);
  });

  it("delegation_grants_validity_chk: valid_to IS NULL is ACCEPTED (no-expiry, per Doc-2 'optional')", async () => {
    await expect(
      prisma.delegationGrant.create({
        data: {
          id: "01920000-0000-7000-8000-0000000c0d03",
          controllingOrganizationId: ORG_A,
          representativeOrganizationId: ORG_A,
          vendorProfileId: VENDOR_PROFILE_X,
          permissionSetJsonb: ["can_create_rfq"],
          grantedBy: USER_A,
          validTo: null,
        },
      }),
    ).resolves.toMatchObject({ validTo: null });
    await prisma.delegationGrant.deleteMany({
      where: { id: "01920000-0000-7000-8000-0000000c0d03" },
    });
  });

  it("delegation_grants_validity_chk: valid_to > valid_from is ACCEPTED (ordering holds)", async () => {
    const validFrom = new Date("2026-07-01T00:00:00Z");
    const validTo = new Date("2026-07-09T00:00:00Z");
    await expect(
      prisma.delegationGrant.create({
        data: {
          id: "01920000-0000-7000-8000-0000000c0d04",
          controllingOrganizationId: ORG_A,
          representativeOrganizationId: ORG_A,
          vendorProfileId: VENDOR_PROFILE_X,
          permissionSetJsonb: ["can_create_rfq"],
          grantedBy: USER_A,
          validFrom,
          validTo,
        },
      }),
    ).resolves.toMatchObject({ validFrom, validTo });
    await prisma.delegationGrant.deleteMany({
      where: { id: "01920000-0000-7000-8000-0000000c0d04" },
    });
  });

  it("delegation_grants_controlling_fk / _representative_fk: an invalid party org is REJECTED", async () => {
    await rejectsWithPrismaError(
      prisma.delegationGrant.create({
        data: {
          id: "01920000-0000-7000-8000-0000000c0d05",
          controllingOrganizationId: NONEXISTENT_UUID,
          representativeOrganizationId: ORG_A,
          vendorProfileId: VENDOR_PROFILE_X,
          permissionSetJsonb: ["can_create_rfq"],
          grantedBy: USER_A,
        },
      }),
      "P2003",
      "delegation_grants_controlling_fk",
    );
    await rejectsWithPrismaError(
      prisma.delegationGrant.create({
        data: {
          id: "01920000-0000-7000-8000-0000000c0d06",
          controllingOrganizationId: ORG_A,
          representativeOrganizationId: NONEXISTENT_UUID,
          vendorProfileId: VENDOR_PROFILE_X,
          permissionSetJsonb: ["can_create_rfq"],
          grantedBy: USER_A,
        },
      }),
      "P2003",
      "delegation_grants_representative_fk",
    );
  });

  it("delegation_grants.status accepts only the 5-state enum (draft|active|suspended|revoked|expired)", async () => {
    await rejectsWithPrismaError(
      prisma.$executeRawUnsafe(
        `INSERT INTO identity.delegation_grants
           (id, controlling_organization_id, representative_organization_id, vendor_profile_id, permission_set_jsonb, granted_by, status)
         VALUES ($1::uuid, $2::uuid, $2::uuid, $3::uuid, '[]'::jsonb, $4::uuid, 'bogus_status')`,
        "01920000-0000-7000-8000-0000000c0d07",
        ORG_A,
        VENDOR_PROFILE_X,
        USER_A,
      ),
      "P2010",
      "delegation_grant_status",
    );
  });
});
