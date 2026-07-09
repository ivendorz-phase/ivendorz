import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import {
  checkPermission,
  getMembership,
  getOrganization,
  getUser,
} from "../../src/modules/identity/contracts";
import { authorize, hasPermission } from "../../src/server/authz";

// W2-IDN-3 — `identity.check_permission.v1` end-to-end over the REAL DB through the M1 contracts facade
// (Doc-4C §C3). These assert the APP-LAYER resolution — which is PRIMARY (Doc-4C §C3; Doc-6C §6.2a) and
// must be correct INDEPENDENTLY of RLS. The local connection runs as `postgres` (RLS-BYPASSED), so a
// pass here proves the app-layer org-anchored WHERE (not RLS) is what stops the forgeries. The RLS
// backstop is proven separately in `authz-rls-backstop` (Doc-8D).
//
// The two BINDING security obligations (each with a discriminating test + how it fails under a wrong impl):
//   • RV-0146 org-anchored resolution — a forged `role_permissions` row pairing ANOTHER org's
//     `organization_id` with this role_id grants NOTHING to anyone. Under a role_id-ONLY resolution the
//     forged high-priv row WOULD leak to the role's own-org members → these tests would flip to `allow`.
//   • RV-0147 staff-space firewall — a tenant org-scoped row mapping a `staff_*` slug resolves to DENY.
//     Under a resolution that did not gate on the permission SPACE, the forged row WOULD grant the
//     staff slug → the test would flip to `allow`.

// ── Deterministic fixtures (UUIDv7-shaped: version nibble 7, variant 8..b). ──
const ORG_A = "01920000-0000-7000-8000-0000000c3a01"; // controlling / the role-owning org
const ORG_B = "01920000-0000-7000-8000-0000000c3b01"; // representative (delegation) / the forging org
const ROLE_A = "01920000-0000-7000-8000-0000000c3a02"; // org-custom role in ORG_A
const ROLE_B = "01920000-0000-7000-8000-0000000c3b02"; // org-custom role in ORG_B
const USER_A = "01920000-0000-7000-8000-0000000c3a09"; // active member of ORG_A (ROLE_A)
const USER_B = "01920000-0000-7000-8000-0000000c3b09"; // active member of ORG_B (ROLE_B)
const USER_D = "01920000-0000-7000-8000-0000000c3d09"; // active member of ORG_A on the SYSTEM Owner bundle
const USER_NOMEM = "01920000-0000-7000-8000-0000000c3009"; // exists, but no membership anywhere
const VENDOR_PROFILE_X = "01920000-0000-7000-8000-0000000c30f1"; // M2 bare UUID — the delegated target
const VENDOR_PROFILE_Y = "01920000-0000-7000-8000-0000000c30f2"; // a DIFFERENT profile (condition 4)
const DELEG_1 = "01920000-0000-7000-8000-0000000c3001";
const MEM_A = "01920000-0000-7000-8000-0000000c3a11";
const MEM_B = "01920000-0000-7000-8000-0000000c3b11";
const MEM_D = "01920000-0000-7000-8000-0000000c3d11";

// Real seeded catalog slugs (Doc-2 §7; seeded by `identity_catalog_seed`). Resolved to ids in `beforeAll`.
let permCreateRfq: string; // tenant — granted to ROLE_A
let permAwardRfq: string; // tenant — the FORGED cross-org grant target (NOT granted to ROLE_A in ORG_A)
let permSubmitQuote: string; // tenant — granted to ROLE_B + in the delegation grant's permission_set
let permRespondRfq: string; // tenant — granted to ROLE_B but NOT in the grant (the §6B condition-3 probe)
let permManageBilling: string; // tenant — a clean "not held" slug
let permStaffBan: string; // staff — the RV-0147 firewall target
let ownerRoleId: string; // the seeded NULL-org system Owner bundle (the NULL-leg proof)

async function seedFixture(): Promise<void> {
  for (const [id, name] of [
    [ORG_A, "CHK Org A"],
    [ORG_B, "CHK Org B"],
  ] as const) {
    await prisma.organization.create({
      data: { id, humanRef: `ORG-CHK-${id}`, name, slug: `chk-${id}` },
    });
  }
  await prisma.user.create({ data: { id: USER_A, status: "active" } });
  await prisma.user.create({ data: { id: USER_B, status: "active" } });
  await prisma.user.create({ data: { id: USER_D, status: "active" } });
  await prisma.user.create({ data: { id: USER_NOMEM, status: "active" } });
  await prisma.role.create({
    data: { id: ROLE_A, organizationId: ORG_A, name: "CHK Role A", isSystemBundle: false },
  });
  await prisma.role.create({
    data: { id: ROLE_B, organizationId: ORG_B, name: "CHK Role B", isSystemBundle: false },
  });

  const slug = async (s: string): Promise<string> =>
    (await prisma.permission.findFirstOrThrow({ where: { slug: s } })).id;
  permCreateRfq = await slug("can_create_rfq");
  permAwardRfq = await slug("can_award_rfq");
  permSubmitQuote = await slug("can_submit_quote");
  permRespondRfq = await slug("can_respond_to_rfq");
  permManageBilling = await slug("can_manage_billing");
  permStaffBan = await slug("staff_can_ban");
  ownerRoleId = (
    await prisma.role.findFirstOrThrow({
      where: { name: "Owner", organizationId: null, isSystemBundle: true, deletedAt: null },
    })
  ).id;

  // Active memberships (state = active participates in the formula).
  await prisma.membership.create({
    data: { id: MEM_A, organizationId: ORG_A, userId: USER_A, roleId: ROLE_A, state: "active" },
  });
  await prisma.membership.create({
    data: { id: MEM_B, organizationId: ORG_B, userId: USER_B, roleId: ROLE_B, state: "active" },
  });
  // USER_D is an active member of ORG_A bound to the SYSTEM Owner bundle (organization_id NULL role) —
  // proves the NULL system-bundle resolution leg.
  await prisma.membership.create({
    data: {
      id: MEM_D,
      organizationId: ORG_A,
      userId: USER_D,
      roleId: ownerRoleId,
      state: "active",
    },
  });

  // Legit org-anchored composition: ROLE_A → can_create_rfq @ ORG_A.
  await prisma.rolePermission.create({
    data: { roleId: ROLE_A, permissionId: permCreateRfq, organizationId: ORG_A },
  });
  // ROLE_B → can_submit_quote @ ORG_B (the representative's OWN authorization — §6B.2 condition 2).
  await prisma.rolePermission.create({
    data: { roleId: ROLE_B, permissionId: permSubmitQuote, organizationId: ORG_B },
  });
  // ROLE_B → can_respond_to_rfq @ ORG_B: USER_B HOLDS this slug (condition 2 passes) but the grant's
  // permission_set does NOT include it (the §6B.2 condition-3 discriminator).
  await prisma.rolePermission.create({
    data: { roleId: ROLE_B, permissionId: permRespondRfq, organizationId: ORG_B },
  });

  // ── RV-0146 FORGERY: a role_permissions row pairing ROLE_A (ORG_A's role) with can_award_rfq but
  //    anchored to ORG_B. The DB admits it (no cross-org constraint). It must grant NOTHING to anyone. ──
  await prisma.rolePermission.create({
    data: { roleId: ROLE_A, permissionId: permAwardRfq, organizationId: ORG_B },
  });
  // ── RV-0147 FORGERY: a tenant org-scoped row mapping a staff_* slug to ROLE_A @ ORG_A. Must DENY. ──
  await prisma.rolePermission.create({
    data: { roleId: ROLE_A, permissionId: permStaffBan, organizationId: ORG_A },
  });

  // Delegation: ORG_A (controlling) grants ORG_B (representative) can_submit_quote on VENDOR_PROFILE_X.
  await prisma.delegationGrant.create({
    data: {
      id: DELEG_1,
      controllingOrganizationId: ORG_A,
      representativeOrganizationId: ORG_B,
      vendorProfileId: VENDOR_PROFILE_X,
      permissionSetJsonb: ["can_submit_quote"],
      grantedBy: USER_A,
      status: "active",
    },
  });
}

async function cleanupFixture(): Promise<void> {
  // Only the rows THIS suite created: role_permissions on the two org-custom roles (NEVER the shared
  // seeded Owner/NULL-bundle composition, which USER_D merely READS).
  await prisma.delegationGrant.deleteMany({ where: { id: DELEG_1 } });
  await prisma.rolePermission.deleteMany({ where: { roleId: { in: [ROLE_A, ROLE_B] } } });
  await prisma.membership.deleteMany({ where: { userId: { in: [USER_A, USER_B, USER_D] } } });
  await prisma.role.deleteMany({ where: { id: { in: [ROLE_A, ROLE_B] } } });
  await prisma.user.deleteMany({ where: { id: { in: [USER_A, USER_B, USER_D, USER_NOMEM] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [ORG_A, ORG_B] } } });
}

beforeAll(async () => {
  await cleanupFixture(); // idempotent re-run guard (committed fixtures).
  await seedFixture();
});
afterAll(cleanupFixture);

describe("identity.check_permission — three-layer membership path (Doc-4A §6.1)", () => {
  it("allows a held tenant slug (satisfied_by = membership)", async () => {
    const r = await checkPermission({
      userId: USER_A,
      organizationId: ORG_A,
      permissionSlug: "can_create_rfq",
    });
    expect(r).toEqual({ decision: "allow", satisfiedBy: "membership" });
  });

  it("resolves through the NULL system-bundle leg (Owner bundle grants can_create_rfq)", async () => {
    const r = await checkPermission({
      userId: USER_D,
      organizationId: ORG_A,
      permissionSlug: "can_create_rfq",
    });
    expect(r).toEqual({ decision: "allow", satisfiedBy: "membership" });
  });

  it("denies a slug the role does not hold (slug_not_held)", async () => {
    const r = await checkPermission({
      userId: USER_A,
      organizationId: ORG_A,
      permissionSlug: "can_manage_billing",
    });
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "slug_not_held" });
    void permManageBilling;
  });

  it("denies an unknown slug (unknown_slug — §6.4 conformance gap, never a grant)", async () => {
    const r = await checkPermission({
      userId: USER_A,
      organizationId: ORG_A,
      permissionSlug: "can_do_nonexistent_thing",
    });
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "unknown_slug" });
  });

  it("denies when there is no active membership (no_active_membership)", async () => {
    const r = await checkPermission({
      userId: USER_NOMEM,
      organizationId: ORG_A,
      permissionSlug: "can_create_rfq",
    });
    expect(r).toEqual({
      decision: "deny",
      satisfiedBy: "none",
      denyReason: "no_active_membership",
    });
  });
});

describe("[RV-0146] org-anchored resolution — a forged cross-org role_permissions row grants NOTHING", () => {
  it("denies the role-owning org's member: can_award_rfq is forged onto ROLE_A but anchored to ORG_B", async () => {
    // The forged row is (ROLE_A, can_award_rfq, ORG_B). USER_A resolves in ORG_A ⇒ the row is neither
    // org=ORG_A nor NULL ⇒ excluded by the org anchor. Under a role_id-ONLY resolution this would ALLOW.
    const r = await checkPermission({
      userId: USER_A,
      organizationId: ORG_A,
      permissionSlug: "can_award_rfq",
    });
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "slug_not_held" });
    void permAwardRfq;
  });

  it("denies the forging org's member: USER_B's membership binds ROLE_B, not the forged ROLE_A", async () => {
    const r = await checkPermission({
      userId: USER_B,
      organizationId: ORG_B,
      permissionSlug: "can_award_rfq",
    });
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "slug_not_held" });
  });
});

describe("[RV-0147] staff-space firewall — a staff_* slug never resolves through org-role membership", () => {
  it("denies staff_can_ban for ORG_A's member DESPITE a forged tenant-org role_permissions row mapping it", async () => {
    // The forged row is (ROLE_A, staff_can_ban, ORG_A) — org-anchored correctly, yet the SPACE gate
    // denies. Under a resolution that ignored the permission space, this would ALLOW (privilege escalation).
    const r = await checkPermission({
      userId: USER_A,
      organizationId: ORG_A,
      permissionSlug: "staff_can_ban",
    });
    expect(r).toEqual({
      decision: "deny",
      satisfiedBy: "none",
      denyReason: "staff_space_firewall",
    });
    void permStaffBan;
  });
});

describe("identity.check_permission — §6B delegated-access path (Doc-4A §6B.2)", () => {
  const permits = { vendorProfileStateReader: async () => true };
  const forbids = { vendorProfileStateReader: async () => false };

  it("allows when all five conditions hold (satisfied_by = delegation)", async () => {
    const r = await checkPermission(
      {
        userId: USER_B,
        organizationId: ORG_B,
        permissionSlug: "can_submit_quote",
        vendorProfileId: VENDOR_PROFILE_X,
      },
      permits,
    );
    expect(r).toEqual({ decision: "allow", satisfiedBy: "delegation" });
  });

  it("condition 5 — denies when the profile's own state forbids the operation (grant never overrides state)", async () => {
    const r = await checkPermission(
      {
        userId: USER_B,
        organizationId: ORG_B,
        permissionSlug: "can_submit_quote",
        vendorProfileId: VENDOR_PROFILE_X,
      },
      forbids,
    );
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "delegation_denied" });
  });

  it("condition 5 — fail-closed when NO vendor-profile-state reader is injected", async () => {
    const r = await checkPermission({
      userId: USER_B,
      organizationId: ORG_B,
      permissionSlug: "can_submit_quote",
      vendorProfileId: VENDOR_PROFILE_X,
    });
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "delegation_denied" });
  });

  it("condition 2 — denies a slug the representative user does NOT hold in their own org", async () => {
    // can_view_rfq is neither in ROLE_B nor relevant; the user lacks it in ORG_B ⇒ no inheritance.
    const r = await checkPermission(
      {
        userId: USER_B,
        organizationId: ORG_B,
        permissionSlug: "can_view_rfq",
        vendorProfileId: VENDOR_PROFILE_X,
      },
      permits,
    );
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "delegation_denied" });
  });

  it("condition 4 — denies when targeting a DIFFERENT vendor profile than the grant names", async () => {
    const r = await checkPermission(
      {
        userId: USER_B,
        organizationId: ORG_B,
        permissionSlug: "can_submit_quote",
        vendorProfileId: VENDOR_PROFILE_Y,
      },
      permits,
    );
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "delegation_denied" });
  });

  it("condition 3 — denies a slug the user HOLDS but the grant's permission_set does NOT include", async () => {
    // USER_B holds can_respond_to_rfq in ORG_B (condition 2 passes), but the grant's permission_set is
    // ['can_submit_quote'] only ⇒ condition 3 fails (no inheritance beyond the granted slug set).
    const r = await checkPermission(
      {
        userId: USER_B,
        organizationId: ORG_B,
        permissionSlug: "can_respond_to_rfq",
        vendorProfileId: VENDOR_PROFILE_X,
      },
      permits,
    );
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "delegation_denied" });
  });

  it("condition 1 — denies when the acting user has NO active membership in the representative org", async () => {
    const r = await checkPermission(
      {
        userId: USER_NOMEM,
        organizationId: ORG_B,
        permissionSlug: "can_submit_quote",
        vendorProfileId: VENDOR_PROFILE_X,
      },
      permits,
    );
    expect(r).toEqual({ decision: "deny", satisfiedBy: "none", denyReason: "delegation_denied" });
  });

  it("[RV-0147] staff-space firewall applies on the delegated path too (a staff_* slug is never delegable)", async () => {
    const r = await checkPermission(
      {
        userId: USER_B,
        organizationId: ORG_B,
        permissionSlug: "staff_can_ban",
        vendorProfileId: VENDOR_PROFILE_X,
      },
      permits,
    );
    expect(r).toEqual({
      decision: "deny",
      satisfiedBy: "none",
      denyReason: "staff_space_firewall",
    });
  });
});

describe("[Inv #5] Users act; Organizations own — a grant does not travel with the user across orgs", () => {
  it("USER_A holds can_create_rfq in ORG_A but resolving the SAME user against ORG_B denies (no membership there)", async () => {
    // The permission is a property of (org, role), not the user personally: USER_A's ORG_A grant does not
    // follow them into ORG_B. The org owns the grant; the user merely acts through an active membership.
    const inOrgA = await checkPermission({
      userId: USER_A,
      organizationId: ORG_A,
      permissionSlug: "can_create_rfq",
    });
    const inOrgB = await checkPermission({
      userId: USER_A,
      organizationId: ORG_B,
      permissionSlug: "can_create_rfq",
    });
    expect(inOrgA).toEqual({ decision: "allow", satisfiedBy: "membership" });
    expect(inOrgB).toEqual({
      decision: "deny",
      satisfiedBy: "none",
      denyReason: "no_active_membership",
    });
  });
});

describe("src/server/authz — the wired seam delegates to identity.check_permission (zero shadow authz)", () => {
  it("authorize() returns the M1 decision unchanged", async () => {
    const allow = await authorize({
      userId: USER_A,
      activeOrgId: ORG_A,
      permissionSlug: "can_create_rfq",
    });
    expect(allow).toEqual({ decision: "allow", satisfiedBy: "membership" });
  });

  it("hasPermission() is a fail-closed boolean over the decision", async () => {
    expect(
      await hasPermission({ userId: USER_A, activeOrgId: ORG_A, permissionSlug: "can_create_rfq" }),
    ).toBe(true);
    expect(
      await hasPermission({ userId: USER_A, activeOrgId: ORG_A, permissionSlug: "staff_can_ban" }),
    ).toBe(false);
  });
});

describe("identity §C3 auth-root reads (get_user / get_organization / get_membership)", () => {
  it("get_user returns the minimized projection (never an auth-mechanism field)", async () => {
    const r = await getUser(USER_A);
    expect(r).toMatchObject({ found: true, user: { userId: USER_A, status: "active" } });
    // No auth fields leak in the DTO shape.
    if (r.found) expect(Object.keys(r.user)).toEqual(["userId", "status", "preferencesSummary"]);
  });

  it("get_user collapses a non-existent user to found:false", async () => {
    expect(await getUser("01920000-0000-7000-8000-0000000cffff")).toEqual({ found: false });
  });

  it("get_organization returns the org projection", async () => {
    const r = await getOrganization(ORG_A);
    expect(r).toMatchObject({
      found: true,
      organization: { organizationId: ORG_A, orgStatus: "active" },
    });
  });

  it("get_membership returns the link with its state (the access-formula input)", async () => {
    const r = await getMembership(USER_A, ORG_A);
    expect(r).toMatchObject({
      found: true,
      membership: { userId: USER_A, organizationId: ORG_A, roleId: ROLE_A, state: "active" },
    });
  });

  it("get_membership collapses a non-link to found:false", async () => {
    expect(await getMembership(USER_A, ORG_B)).toEqual({ found: false });
  });
});
