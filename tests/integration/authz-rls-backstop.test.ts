import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { asRestrictedRole, ensureRestrictedRlsRole } from "../_harness/db";

// W2-IDN-3 — Doc-8D "RLS-as-backstop": prove the DB-level RLS on `identity.role_permissions` ALSO fails
// closed on an APP-BYPASSED negative path. The app-layer org-anchored resolution is PRIMARY (proven in
// `identity-check-permission` on the RLS-bypassed superuser connection); THIS suite proves the SECOND
// line of defense — even if an attacker circumvents the app layer and queries `role_permissions`
// directly, under the tenant's own active-org GUC the RLS `role_permissions_read` policy
// (org = active_org OR org IS NULL OR staff) hides a forged CROSS-ORG row so it can never leak into the
// tenant's resolution.
//
// Asserted through the Doc-8B §5 DB-role-switch backstop: the restricted role `ivendorz_test_rls`
// (NOBYPASSRLS, non-owner) so the DB POLICY itself is what is proven — never a superuser false-pass.
//
// How this fails under a WRONG RLS: a role_permissions read policy of `USING(true)` (or one anchored on
// role_id alone) would make the forged ORG_B-anchored row VISIBLE under the ORG_A context ⇒ the
// "forged row invisible" assertion below would flip from 0 to 1.

const ORG_A = "01920000-0000-7000-8000-0000000cb501"; // the role-owning org (active context under test)
const ORG_B = "01920000-0000-7000-8000-0000000cb601"; // the forging org (the mis-anchor)
const ROLE_A = "01920000-0000-7000-8000-0000000cb502"; // org-custom role in ORG_A
const PERM_LEGIT = "01920000-0000-7000-8000-0000000cb511"; // ORG_A-anchored (the positive control)
const PERM_NULL = "01920000-0000-7000-8000-0000000cb513"; // NULL system-bundle leg (distinct perm — PK is (role_id, permission_id))
const PERM_FORGED = "01920000-0000-7000-8000-0000000cb512"; // the forged ORG_B-anchored composition target

interface CountRow {
  n: number;
}

async function seedFixture(): Promise<void> {
  for (const [id, name] of [
    [ORG_A, "Backstop Org A"],
    [ORG_B, "Backstop Org B"],
  ] as const) {
    await prisma.organization.create({
      data: { id, humanRef: `ORG-BACKSTOP-${id}`, name, slug: `backstop-${id}` },
    });
  }
  await prisma.role.create({
    data: { id: ROLE_A, organizationId: ORG_A, name: "Backstop Role A", isSystemBundle: false },
  });
  await prisma.permission.create({
    data: { id: PERM_LEGIT, slug: `backstop-legit-${PERM_LEGIT}`, space: "tenant" },
  });
  await prisma.permission.create({
    data: { id: PERM_FORGED, slug: `backstop-forged-${PERM_FORGED}`, space: "tenant" },
  });
  await prisma.permission.create({
    data: { id: PERM_NULL, slug: `backstop-null-${PERM_NULL}`, space: "tenant" },
  });
  // Legit ORG_A-anchored composition (positive control — must be VISIBLE under ORG_A context).
  await prisma.rolePermission.create({
    data: { roleId: ROLE_A, permissionId: PERM_LEGIT, organizationId: ORG_A },
  });
  // A NULL system-bundle composition on ROLE_A (distinct permission — the PK is (role_id, permission_id),
  // so the NULL leg cannot reuse PERM_LEGIT). Must be VISIBLE under ANY context — the NULL leg.
  await prisma.rolePermission.create({
    data: { roleId: ROLE_A, permissionId: PERM_NULL, organizationId: null },
  });
  // THE FORGED CROSS-ORG ROW: ROLE_A paired with an ORG_B anchor. Admitted by the DB (no cross-org
  // constraint) — RLS must hide it from the ORG_A context.
  await prisma.rolePermission.create({
    data: { roleId: ROLE_A, permissionId: PERM_FORGED, organizationId: ORG_B },
  });
}

async function cleanupFixture(): Promise<void> {
  await prisma.rolePermission.deleteMany({ where: { roleId: ROLE_A } });
  await prisma.role.deleteMany({ where: { id: ROLE_A } });
  await prisma.permission.deleteMany({
    where: { id: { in: [PERM_LEGIT, PERM_NULL, PERM_FORGED] } },
  });
  await prisma.organization.deleteMany({ where: { id: { in: [ORG_A, ORG_B] } } });
}

/** Count role_permissions rows for ROLE_A with the given ORG anchor that are VISIBLE to the restricted
 *  role under `activeOrg` — the app-bypassed direct DB read. */
async function countVisible(activeOrg: string | undefined, orgAnchor: string): Promise<number> {
  return asRestrictedRole(activeOrg === undefined ? {} : { activeOrg }, async (tx) => {
    const rows = await tx.$queryRawUnsafe<CountRow[]>(
      `SELECT count(*)::int AS n FROM identity.role_permissions
        WHERE role_id = $1::uuid AND organization_id = $2::uuid`,
      ROLE_A,
      orgAnchor,
    );
    return rows[0]?.n ?? -1;
  });
}

async function countVisibleNullLeg(activeOrg: string | undefined): Promise<number> {
  return asRestrictedRole(activeOrg === undefined ? {} : { activeOrg }, async (tx) => {
    const rows = await tx.$queryRawUnsafe<CountRow[]>(
      `SELECT count(*)::int AS n FROM identity.role_permissions
        WHERE role_id = $1::uuid AND organization_id IS NULL`,
      ROLE_A,
    );
    return rows[0]?.n ?? -1;
  });
}

beforeAll(async () => {
  await ensureRestrictedRlsRole();
  await cleanupFixture();
  await seedFixture();
});
afterAll(cleanupFixture);

describe("Doc-8D — role_permissions RLS is the app-bypassed backstop (fails closed on the forged cross-org row)", () => {
  it("[meta] RLS is actually enforcing: with NO active-org GUC, tenant-anchored rows are invisible (fail-closed)", async () => {
    // If this returned > 0 the connection would be bypassing RLS and the whole gate would be vacuous.
    expect(await countVisible(undefined, ORG_A)).toBe(0);
  });

  it("positive control: the legit ORG_A-anchored row IS visible under the ORG_A context", async () => {
    expect(await countVisible(ORG_A, ORG_A)).toBe(1);
  });

  it("the NULL system-bundle leg IS visible under the ORG_A context", async () => {
    expect(await countVisibleNullLeg(ORG_A)).toBe(1);
  });

  it("THE BACKSTOP: the forged ORG_B-anchored row is INVISIBLE under the ORG_A context (0 rows)", async () => {
    // Even bypassing the app layer, an ORG_A principal cannot read the forged cross-org grant ⇒ it can
    // never enter ORG_A's resolution. This is the RLS defense-in-depth behind the app-layer org anchor.
    expect(await countVisible(ORG_A, ORG_B)).toBe(0);
  });

  it("the forged row is only visible to ORG_B's OWN context (mis-anchored, not a cross-tenant leak)", async () => {
    // Visible to ORG_B (its anchor) — but harmless: ORG_B's members bind ORG_B's roles, not ROLE_A, so
    // the app-layer role_id anchor still grants nothing (proven in identity-check-permission).
    expect(await countVisible(ORG_B, ORG_B)).toBe(1);
  });
});
