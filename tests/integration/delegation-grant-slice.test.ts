import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { withActiveOrgContext } from "../../src/server/context";
import { appendAuditRecord, configValueQuery } from "../../src/modules/core/contracts";
import {
  checkPermission,
  createDelegationGrant,
  expireDelegationGrants,
  reinstateDelegationGrant,
  revokeDelegationGrant,
  suspendDelegationGrant,
  type DelegationGrantStatusValue,
  type DelegationRefreshPort,
  type VendorProfileControlReader,
  type VendorProfileStateReader,
} from "../../src/modules/identity/contracts";

// W2-IDN-4 (+ W2-IDN-6.5 §5.10 boundary realization) — the delegation-grant WRITE side: the Doc-2
// §5.10 state machine AS PATCHED by `Doc-2_Patch_v1.0.7` (the `suspended → expired` edge · the real
// reinstate with the window-open boundary · no-resurrection), dual-party authority guards, the
// `permission_set` guards (⊆-held / staff-space / ownership-class), the audited-atomic writes (D7
// pattern), the System expiry sweep (BOTH non-terminal states — patch rule 1), refresh-on-revocation,
// and the 8E delegated-authz round trip. Proven against REAL PostgreSQL through the M1 CONTRACT
// surface ONLY (the frozen boundary rule — tests never import module internals; the state machine +
// permission-set policy are exercised via the commands, mirroring how `check_permission` proves the
// permission-resolution policy). App-layer authz is PRIMARY (Doc-4C §C9; Doc-6C §6.2a) — the local
// `postgres` connection is RLS-BYPASSED, so a pass proves the app-layer guards (not RLS) enforce; the
// dual-party RLS backstop is proven at IDN-1 (`rls-identity-authz-tables`).
//
// PIN-UPDATE PROVENANCE (ruling-realization, NOT regression — the RV-0148→6.1 pin-update precedent):
// the RV-0149 "suspended-at-lapse untouched" pin encoded the PRE-ruling frozen text; the owner ruling
// 2026-07-09 (`BOARD-DECISION-IDN-DELEG-EXPIRY_v1.0` → `Doc-2_Patch_v1.0.7`) resolved the carried
// boundary, so the pin below now asserts the PATCHED machine (suspended+lapsed IS swept).

// ── Deterministic fixtures (UUIDv7-shaped: version nibble 7, variant 8..b; 0xd4 = W2-IDN-4 namespace). ──
const CTRL_ORG = "01920000-0000-7000-8000-0000000d4a01"; // controlling org (the grant issuer)
const REP_ORG = "01920000-0000-7000-8000-0000000d4b01"; // representative org (the grantee)
const CTRL_ROLE = "01920000-0000-7000-8000-0000000d4a02"; // custom role in CTRL_ORG (holds can_manage_delegations)
const REP_ROLE = "01920000-0000-7000-8000-0000000d4b02"; // custom role in REP_ORG
const NONADMIN_ROLE = "01920000-0000-7000-8000-0000000d4a03"; // CTRL_ORG role WITHOUT can_manage_delegations
const CTRL_USER = "01920000-0000-7000-8000-0000000d4a09"; // active member of CTRL_ORG on CTRL_ROLE
const REP_USER = "01920000-0000-7000-8000-0000000d4b09"; // active member of REP_ORG on REP_ROLE
const NONADMIN_USER = "01920000-0000-7000-8000-0000000d4a19"; // active member of CTRL_ORG on NONADMIN_ROLE
const VENDOR_PROFILE = "01920000-0000-7000-8000-0000000d40f1"; // M2 bare UUID — controlled by CTRL_ORG
const VP_OTHER = "01920000-0000-7000-8000-0000000d40f2"; // controlled by a DIFFERENT org (not_controller)
const VP_MISSING = "01920000-0000-7000-8000-0000000d40f3"; // no such profile (not_found)

// A THIRD org — neither controlling nor representative party to any seeded grant. Its member holds
// can_manage_delegations (so it PASSES AUTHZ and reaches the party-scoped load) — the worst-case existence
// prober for the §C9 SCOPE non-disclosure collapse (RV-0149 F2).
const THIRD_ORG = "01920000-0000-7000-8000-0000000d4c01";
const THIRD_ROLE = "01920000-0000-7000-8000-0000000d4c02"; // holds can_manage_delegations
const THIRD_USER = "01920000-0000-7000-8000-0000000d4c09"; // active member of THIRD_ORG on THIRD_ROLE

const FUTURE = new Date("2999-01-01T00:00:00.000Z");
const PAST_FROM = new Date("2020-01-01T00:00:00.000Z");
const PAST_TO = new Date("2020-06-01T00:00:00.000Z");
const NOW_AFTER_EXPIRY = new Date("2021-01-01T00:00:00.000Z");

// The `system_configuration` STORE key (natural key = `<domain>.<key_name>`; the reader strips the fixed
// `core.system_configuration.` reference prefix) for the delegation validity default — RV-0149 F4. Bound by
// pointer to Doc-3 v1.9 / Doc-4C §C9 (`identity.delegation_validity_default`); seeded test-scoped only.
const DELEGATION_VALIDITY_DEFAULT_KEY = "identity.delegation_validity_default";
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

// The M2 Vendor Service port stub (read-validation only): CTRL_ORG controls VENDOR_PROFILE; VP_OTHER is
// controlled by someone else; VP_MISSING does not exist.
const control: VendorProfileControlReader = async (vp, org) => {
  if (vp === VENDOR_PROFILE && org === CTRL_ORG) return "controls";
  if (vp === VP_OTHER) return "not_controller";
  return "not_found";
};
const permits: { vendorProfileStateReader: VendorProfileStateReader } = {
  vendorProfileStateReader: async () => true, // §6B.2 condition 5 affirmed (for the 8E round trip)
};

const ctrlCtx = { userId: CTRL_USER, activeOrgId: CTRL_ORG } as const;
const ctrlContext = { userId: CTRL_USER, activeOrgId: CTRL_ORG, isPlatformStaff: false } as const;
const repContext = { userId: REP_USER, activeOrgId: REP_ORG, isPlatformStaff: false } as const;
const thirdContext = {
  userId: THIRD_USER,
  activeOrgId: THIRD_ORG,
  isPlatformStaff: false,
} as const;
const thirdCtx = { userId: THIRD_USER, activeOrgId: THIRD_ORG } as const;

async function slugId(s: string): Promise<string> {
  return (await prisma.permission.findFirstOrThrow({ where: { slug: s } })).id;
}

async function auditFor(grantId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "delegation_grant", entityId: grantId },
    orderBy: { eventTime: "asc" },
  });
}

/** Run a controlling-org command inside the CTRL_ORG active-org transaction (audit atomic with the write). */
function inCtrlOrg<T>(
  fn: (tx: Parameters<Parameters<typeof withActiveOrgContext>[1]>[0]) => Promise<T>,
) {
  return withActiveOrgContext(ctrlContext, fn);
}

async function seedGrant(params: {
  status: DelegationGrantStatusValue;
  controllingOrganizationId?: string;
  representativeOrganizationId?: string;
  vendorProfileId?: string;
  permissionSet?: string[];
  validFrom?: Date;
  validTo?: Date | null;
}): Promise<{ id: string; updatedAt: Date }> {
  // Fresh UUIDv7 id per seeded grant — audit rows are immutable and accumulate across runs; a fixed id
  // would collide an audit-action assertion with a prior run's rows.
  const row = await prisma.delegationGrant.create({
    data: {
      id: uuidv7(),
      controllingOrganizationId: params.controllingOrganizationId ?? CTRL_ORG,
      representativeOrganizationId: params.representativeOrganizationId ?? REP_ORG,
      vendorProfileId: params.vendorProfileId ?? VENDOR_PROFILE,
      permissionSetJsonb: params.permissionSet ?? ["can_submit_quote"],
      validFrom: params.validFrom ?? new Date("2000-01-01T00:00:00.000Z"),
      ...(params.validTo !== undefined && params.validTo !== null
        ? { validTo: params.validTo }
        : {}),
      grantedBy: CTRL_USER,
      status: params.status,
    },
  });
  return { id: row.id, updatedAt: row.updatedAt };
}

describe("W2-IDN-4 delegation-grant write commands (real PostgreSQL)", () => {
  beforeAll(async () => {
    for (const [id, name] of [
      [CTRL_ORG, "IDN4 Controlling"],
      [REP_ORG, "IDN4 Representative"],
      [THIRD_ORG, "IDN4 Third"],
    ] as const) {
      await prisma.organization.create({
        data: { id, humanRef: `ORG-D4-${id.slice(-6)}`, name, slug: `idn4-${id.slice(-6)}` },
      });
    }
    for (const id of [CTRL_USER, REP_USER, NONADMIN_USER, THIRD_USER]) {
      await prisma.user.create({ data: { id, status: "active" } });
    }
    await prisma.role.create({
      data: { id: CTRL_ROLE, organizationId: CTRL_ORG, name: "IDN4 Ctrl", isSystemBundle: false },
    });
    await prisma.role.create({
      data: { id: REP_ROLE, organizationId: REP_ORG, name: "IDN4 Rep", isSystemBundle: false },
    });
    await prisma.role.create({
      data: {
        id: NONADMIN_ROLE,
        organizationId: CTRL_ORG,
        name: "IDN4 NonAdmin",
        isSystemBundle: false,
      },
    });
    await prisma.role.create({
      data: {
        id: THIRD_ROLE,
        organizationId: THIRD_ORG,
        name: "IDN4 Third",
        isSystemBundle: false,
      },
    });
    await prisma.membership.create({
      data: {
        id: "01920000-0000-7000-8000-0000000d4a91",
        organizationId: CTRL_ORG,
        userId: CTRL_USER,
        roleId: CTRL_ROLE,
        state: "active",
      },
    });
    await prisma.membership.create({
      data: {
        id: "01920000-0000-7000-8000-0000000d4b91",
        organizationId: REP_ORG,
        userId: REP_USER,
        roleId: REP_ROLE,
        state: "active",
      },
    });
    await prisma.membership.create({
      data: {
        id: "01920000-0000-7000-8000-0000000d4a92",
        organizationId: CTRL_ORG,
        userId: NONADMIN_USER,
        roleId: NONADMIN_ROLE,
        state: "active",
      },
    });
    await prisma.membership.create({
      data: {
        id: "01920000-0000-7000-8000-0000000d4c91",
        organizationId: THIRD_ORG,
        userId: THIRD_USER,
        roleId: THIRD_ROLE,
        state: "active",
      },
    });

    // CTRL_ROLE holds can_manage_delegations + can_submit_quote + can_respond_to_rfq (the CTRL_ORG held set).
    for (const s of ["can_manage_delegations", "can_submit_quote", "can_respond_to_rfq"]) {
      await prisma.rolePermission.create({
        data: { roleId: CTRL_ROLE, permissionId: await slugId(s), organizationId: CTRL_ORG },
      });
    }
    // REP_ROLE holds can_manage_delegations (for the not_controller discrimination) + can_submit_quote (so
    // the 8E delegated check's §6B condition 2 passes for REP_USER).
    for (const s of ["can_manage_delegations", "can_submit_quote"]) {
      await prisma.rolePermission.create({
        data: { roleId: REP_ROLE, permissionId: await slugId(s), organizationId: REP_ORG },
      });
    }
    // NONADMIN_ROLE holds only can_view_rfq — NO can_manage_delegations (the forbidden discrimination).
    await prisma.rolePermission.create({
      data: {
        roleId: NONADMIN_ROLE,
        permissionId: await slugId("can_view_rfq"),
        organizationId: CTRL_ORG,
      },
    });
    // THIRD_ROLE holds can_manage_delegations so THIRD_USER passes AUTHZ and reaches the party-scoped load
    // (the existence-oracle prober for RV-0149 F2).
    await prisma.rolePermission.create({
      data: {
        roleId: THIRD_ROLE,
        permissionId: await slugId("can_manage_delegations"),
        organizationId: THIRD_ORG,
      },
    });
  });

  beforeEach(async () => {
    await prisma.delegationGrant.deleteMany({
      where: { controllingOrganizationId: { in: [CTRL_ORG, REP_ORG] } },
    });
  });

  afterAll(async () => {
    await prisma.delegationGrant.deleteMany({
      where: { controllingOrganizationId: { in: [CTRL_ORG, REP_ORG, THIRD_ORG] } },
    });
    await prisma.rolePermission.deleteMany({
      where: { roleId: { in: [CTRL_ROLE, REP_ROLE, NONADMIN_ROLE, THIRD_ROLE] } },
    });
    await prisma.membership.deleteMany({
      where: { userId: { in: [CTRL_USER, REP_USER, NONADMIN_USER, THIRD_USER] } },
    });
    await prisma.role.deleteMany({
      where: { id: { in: [CTRL_ROLE, REP_ROLE, NONADMIN_ROLE, THIRD_ROLE] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [CTRL_USER, REP_USER, NONADMIN_USER, THIRD_USER] } },
    });
    await prisma.organization.deleteMany({ where: { id: { in: [CTRL_ORG, REP_ORG, THIRD_ORG] } } });
    // RV-0149 F4: the test-scoped `identity.delegation_validity_default` POLICY row (unseeded until
    // W2-IDN-7; `system_configuration` is CHK-6-030 mutable-config — created + swept test-scoped, never
    // pre-empting the IDN-7 seed).
    await prisma.systemConfiguration.deleteMany({
      where: { key: DELEGATION_VALIDITY_DEFAULT_KEY },
    });
    await prisma.$disconnect();
  });

  // ── create ────────────────────────────────────────────────────────────────
  it("CREATE: issues an active grant + a `delegation_grant_issued` audit row (atomic)", async () => {
    const outcome = await inCtrlOrg((tx) =>
      createDelegationGrant(
        {
          representativeOrganizationId: REP_ORG,
          vendorProfileId: VENDOR_PROFILE,
          permissionSet: ["can_submit_quote"],
          validTo: FUTURE,
        },
        ctrlCtx,
        { appendAuditRecord, configValueQuery, vendorProfileControlReader: control },
        tx,
      ),
    );

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error("unreachable");
    expect(outcome.result.status).toBe("active");
    const grantId = outcome.result.delegationGrantId;

    const row = await prisma.delegationGrant.findFirst({ where: { id: grantId } });
    expect(row?.status).toBe("active");
    expect(row?.controllingOrganizationId).toBe(CTRL_ORG);

    const audit = await auditFor(grantId);
    expect(audit).toHaveLength(1);
    expect(audit[0]!.action).toBe("delegation_grant_issued");
    expect(audit[0]!.actorType).toBe("user");
    expect(audit[0]!.actorId).toBe(CTRL_USER);
    expect(audit[0]!.organizationId).toBe(CTRL_ORG);
    expect(audit[0]!.oldValue).toBeNull();
    expect(audit[0]!.newValue).toMatchObject({ status: "active" });
  });

  it("CREATE forbidden: a member WITHOUT can_manage_delegations → 403, no write", async () => {
    const outcome = await withActiveOrgContext(
      { userId: NONADMIN_USER, activeOrgId: CTRL_ORG, isPlatformStaff: false },
      (tx) =>
        createDelegationGrant(
          {
            representativeOrganizationId: REP_ORG,
            vendorProfileId: VENDOR_PROFILE,
            permissionSet: ["can_submit_quote"],
            validTo: FUTURE,
          },
          { userId: NONADMIN_USER, activeOrgId: CTRL_ORG },
          { appendAuditRecord, configValueQuery, vendorProfileControlReader: control },
          tx,
        ),
    );
    expect(outcome).toMatchObject({
      ok: false,
      error: { errorClass: "AUTHORIZATION", errorCode: "identity_delegation_forbidden" },
    });
    expect(
      await prisma.delegationGrant.count({ where: { controllingOrganizationId: CTRL_ORG } }),
    ).toBe(0);
  });

  it("CREATE guards: not_controller · vendor not_found · org_not_found · window · rep==controlling", async () => {
    const base = { appendAuditRecord, configValueQuery, vendorProfileControlReader: control };
    // RV-0149 F3 (atomicity direction 2): NO create-guard failure appends an audit row.
    const auditBefore = await prisma.auditRecord.count({
      where: { entityType: "delegation_grant" },
    });
    const run = (input: Parameters<typeof createDelegationGrant>[0]) =>
      inCtrlOrg((tx) => createDelegationGrant(input, ctrlCtx, base, tx));

    // vendor controlled by another org → not_controller (AUTHORIZATION).
    expect(
      await run({
        representativeOrganizationId: REP_ORG,
        vendorProfileId: VP_OTHER,
        permissionSet: ["can_submit_quote"],
        validTo: FUTURE,
      }),
    ).toMatchObject({
      ok: false,
      error: { errorClass: "AUTHORIZATION", errorCode: "identity_delegation_not_controller" },
    });
    // vendor missing → vendor_ref_invalid (REFERENCE).
    expect(
      await run({
        representativeOrganizationId: REP_ORG,
        vendorProfileId: VP_MISSING,
        permissionSet: ["can_submit_quote"],
        validTo: FUTURE,
      }),
    ).toMatchObject({
      ok: false,
      error: { errorClass: "REFERENCE", errorCode: "identity_delegation_vendor_ref_invalid" },
    });
    // representative org does not exist → org_not_found (REFERENCE).
    expect(
      await run({
        representativeOrganizationId: "01920000-0000-7000-8000-0000000d4fff",
        vendorProfileId: VENDOR_PROFILE,
        permissionSet: ["can_submit_quote"],
        validTo: FUTURE,
      }),
    ).toMatchObject({
      ok: false,
      error: { errorClass: "REFERENCE", errorCode: "identity_org_not_found" },
    });
    // valid_to <= valid_from → invalid_input (VALIDATION).
    expect(
      await run({
        representativeOrganizationId: REP_ORG,
        vendorProfileId: VENDOR_PROFILE,
        permissionSet: ["can_submit_quote"],
        validFrom: FUTURE,
        validTo: PAST_TO,
      }),
    ).toMatchObject({
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: "identity_delegation_invalid_input" },
    });
    // representative == controlling → invalid_input.
    expect(
      await run({
        representativeOrganizationId: CTRL_ORG,
        vendorProfileId: VENDOR_PROFILE,
        permissionSet: ["can_submit_quote"],
        validTo: FUTURE,
      }),
    ).toMatchObject({
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: "identity_delegation_invalid_input" },
    });
    expect(
      await prisma.delegationGrant.count({ where: { controllingOrganizationId: CTRL_ORG } }),
    ).toBe(0);
    // F3: the whole failed-create block added ZERO audit rows (no write ⇒ no audit).
    expect(await prisma.auditRecord.count({ where: { entityType: "delegation_grant" } })).toBe(
      auditBefore,
    );
  });

  it("CREATE permission_set guards: unknown · staff-space · ownership-class · not-held", async () => {
    const base = { appendAuditRecord, configValueQuery, vendorProfileControlReader: control };
    const run = (permissionSet: string[]) =>
      inCtrlOrg((tx) =>
        createDelegationGrant(
          {
            representativeOrganizationId: REP_ORG,
            vendorProfileId: VENDOR_PROFILE,
            permissionSet,
            validTo: FUTURE,
          },
          ctrlCtx,
          base,
          tx,
        ),
      );

    expect(await run(["can_bogus_slug"])).toMatchObject({
      ok: false,
      error: { errorClass: "REFERENCE", errorCode: "identity_permission_slug_unknown" },
    });
    expect(await run(["staff_can_ban"])).toMatchObject({
      ok: false,
      error: { errorClass: "AUTHORIZATION", errorCode: "identity_delegation_forbidden" },
    });
    expect(await run(["can_transfer_ownership"])).toMatchObject({
      ok: false,
      error: { errorClass: "BUSINESS", errorCode: "identity_delegation_ownership_class_block" },
    });
    // can_manage_billing is a real tenant slug NOT held by any CTRL_ORG member → not delegable → forbidden.
    expect(await run(["can_manage_billing"])).toMatchObject({
      ok: false,
      error: { errorClass: "AUTHORIZATION", errorCode: "identity_delegation_forbidden" },
    });
    expect(
      await prisma.delegationGrant.count({ where: { controllingOrganizationId: CTRL_ORG } }),
    ).toBe(0);
  });

  it("CREATE empty permission_set (F-B4): an empty set → VALIDATION via the policy `empty` branch (no write)", async () => {
    const outcome = await inCtrlOrg((tx) =>
      createDelegationGrant(
        {
          representativeOrganizationId: REP_ORG,
          vendorProfileId: VENDOR_PROFILE,
          permissionSet: [],
          validTo: FUTURE,
        },
        ctrlCtx,
        { appendAuditRecord, configValueQuery, vendorProfileControlReader: control },
        tx,
      ),
    );
    // An empty array passes SYNTAX (it IS an array) and reaches `validatePermissionSetForIssue`, whose
    // `empty` branch (delegation-grant.policy.ts:56-58) returns VALIDATION / identity_delegation_invalid_input
    // with the DISTINCT "permission_set is required." message. Deleting that branch would let the empty set
    // fall through the zero-iteration loop to ok:true → an ISSUED grant; this assertion catches that.
    expect(outcome).toMatchObject({
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: "identity_delegation_invalid_input",
        message: expect.stringMatching(/permission_set is required/),
      },
    });
    expect(
      await prisma.delegationGrant.count({ where: { controllingOrganizationId: CTRL_ORG } }),
    ).toBe(0);
  });

  it("CREATE staff-space firewall (F-B1a): a staff-space slug BOUND to a member's role is STILL rejected (both firewall layers)", async () => {
    // Bind the staff-space slug `staff_can_ban` (seeded by the catalog migration) to an ACTIVE CTRL_ORG
    // member's role. `role_permissions` carries NO space CHECK, so the DB admits this (RV-0147 B8 — that
    // reachability is exactly the point). With the binding present, deleting BOTH firewall layers — the
    // policy `staff_space` branch AND the repository's `space='tenant'` held-set filter — would let
    // `staff_can_ban` enter the held set and pass the ⊆-held gate → an ISSUED grant. This test asserts the
    // grant is STILL rejected and never written, so the both-layers regression fails here.
    const staffPermId = await slugId("staff_can_ban");
    await prisma.rolePermission.create({
      data: { roleId: CTRL_ROLE, permissionId: staffPermId, organizationId: CTRL_ORG },
    });
    try {
      const outcome = await inCtrlOrg((tx) =>
        createDelegationGrant(
          {
            representativeOrganizationId: REP_ORG,
            vendorProfileId: VENDOR_PROFILE,
            permissionSet: ["staff_can_ban"],
            validTo: FUTURE,
          },
          ctrlCtx,
          { appendAuditRecord, configValueQuery, vendorProfileControlReader: control },
          tx,
        ),
      );
      expect(outcome).toMatchObject({
        ok: false,
        error: { errorClass: "AUTHORIZATION", errorCode: "identity_delegation_forbidden" },
      });
      expect(
        await prisma.delegationGrant.count({ where: { controllingOrganizationId: CTRL_ORG } }),
      ).toBe(0);
    } finally {
      // Clean up the binding (the suite teardown idiom) — never leak the staff slug into a sibling test's
      // held set.
      await prisma.rolePermission.deleteMany({
        where: { roleId: CTRL_ROLE, permissionId: staffPermId },
      });
    }
  });

  it("CREATE staff-space firewall (F-B1b): staff-space and not-held rejections carry DISTINCT messages (single-gate net)", async () => {
    const base = { appendAuditRecord, configValueQuery, vendorProfileControlReader: control };
    const run = (permissionSet: string[]) =>
      inCtrlOrg((tx) =>
        createDelegationGrant(
          {
            representativeOrganizationId: REP_ORG,
            vendorProfileId: VENDOR_PROFILE,
            permissionSet,
            validTo: FUTURE,
          },
          ctrlCtx,
          base,
          tx,
        ),
      );

    // A staff-space slug (unbound → excluded from the held set): the policy checks `space` BEFORE ⊆-held, so
    // the STAFF-SPACE branch fires and emits its own message. Deleting that policy branch would collapse this
    // to the not-held message below (the slug is not in the held set) → this assertion fails (single-gate net).
    const staff = await run(["staff_can_ban"]);
    if (staff.ok) throw new Error("unreachable: staff-space slug must be rejected");
    expect(staff.error).toMatchObject({
      errorClass: "AUTHORIZATION",
      errorCode: "identity_delegation_forbidden",
      message: expect.stringMatching(/a staff-space slug is not delegable/),
    });

    // A real tenant slug no CTRL_ORG member holds → the NOT-HELD branch → its own distinct message.
    const notHeld = await run(["can_manage_billing"]);
    if (notHeld.ok) throw new Error("unreachable: an unheld tenant slug must be rejected");
    expect(notHeld.error).toMatchObject({
      errorClass: "AUTHORIZATION",
      errorCode: "identity_delegation_forbidden",
      message: expect.stringMatching(/the org does not hold a requested slug/),
    });

    // Both map to the SAME frozen code (no distinct §C9 code exists), so the message is the only surface
    // discriminator between the two firewall branches — they MUST differ.
    expect(staff.error.message).not.toBe(notHeld.error.message);
  });

  it("INVARIANT: a failing audit append rolls back the grant insert (no row, no audit)", async () => {
    const failingAppend = (() =>
      Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;
    await expect(
      inCtrlOrg((tx) =>
        createDelegationGrant(
          {
            representativeOrganizationId: REP_ORG,
            vendorProfileId: VENDOR_PROFILE,
            permissionSet: ["can_submit_quote"],
            validTo: FUTURE,
          },
          ctrlCtx,
          {
            appendAuditRecord: failingAppend,
            configValueQuery,
            vendorProfileControlReader: control,
          },
          tx,
        ),
      ),
    ).rejects.toThrow(/audit append failed/);
    // The insert was rolled back with the failed audit — NO orphan grant (Invariant 1).
    expect(
      await prisma.delegationGrant.count({ where: { controllingOrganizationId: CTRL_ORG } }),
    ).toBe(0);
  });

  it("INVARIANT direction 1 (F-B3): a failing audit append on SUSPEND rolls back the status write (unchanged, unaudited)", async () => {
    const g = await seedGrant({ status: "active" });
    // Inject a rejecting audit append (the create-side direction-1 injection shape) — the append runs INSIDE
    // the real active-org transaction, AFTER the `active → suspended` status write. A throw must roll that
    // write back with the failed audit: threading a non-tx executor into `transitionDelegationGrantStatus`
    // would commit the `suspended` write outside the tx and leave it standing (unaudited) — this test
    // catches that regression on the shared lifecycle path.
    const failingAppend = (() =>
      Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;
    await expect(
      inCtrlOrg((tx) =>
        suspendDelegationGrant(
          { delegationGrantId: g.id, updatedAt: g.updatedAt },
          ctrlCtx,
          { appendAuditRecord: failingAppend },
          tx,
        ),
      ),
    ).rejects.toThrow(/audit append failed/);
    // The status write rolled back — the grant is still active and carries NO audit row.
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "active",
    );
    expect(await auditFor(g.id)).toHaveLength(0);
  });

  // ── default valid_to POLICY branch (RV-0149 F4) ───────────────────────────────
  it("CREATE default valid_to (F4): an omitted valid_to derives from the identity.delegation_validity_default POLICY", async () => {
    const validFrom = new Date("2500-01-01T00:00:00.000Z");
    // Seed the POLICY row test-scoped (unseeded until W2-IDN-7; system_configuration = CHK-6-030
    // mutable-config; swept in afterAll — never pre-empting the IDN-7 seed).
    await prisma.systemConfiguration.deleteMany({
      where: { key: DELEGATION_VALIDITY_DEFAULT_KEY },
    });
    await prisma.systemConfiguration.create({
      data: {
        id: uuidv7(),
        key: DELEGATION_VALIDITY_DEFAULT_KEY,
        valueJsonb: "365d",
        valueType: "duration",
      },
    });

    // `valid_to` OMITTED → the command reads the POLICY via the REAL configValueQuery + durationToMs.
    const outcome = await inCtrlOrg((tx) =>
      createDelegationGrant(
        {
          representativeOrganizationId: REP_ORG,
          vendorProfileId: VENDOR_PROFILE,
          permissionSet: ["can_submit_quote"],
          validFrom,
        },
        ctrlCtx,
        { appendAuditRecord, configValueQuery, vendorProfileControlReader: control },
        tx,
      ),
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error("unreachable");
    const row = await prisma.delegationGrant.findFirstOrThrow({
      where: { id: outcome.result.delegationGrantId },
    });
    // validFrom + 365d, computed from the seeded POLICY value — never a literal window.
    expect(row.validTo?.getTime()).toBe(validFrom.getTime() + 365 * DAY_MS);
  });

  it("CREATE default valid_to (F4): durationToMs interprets the registered notation + rejects an unparseable value", async () => {
    const validFrom = new Date("2500-06-01T00:00:00.000Z");
    // Each notation arm of durationToMs, exercised via an injected configValueQuery stub (the omitted-
    // valid_to branch): d/h/m/s units + the plain-integer-seconds arm.
    const cases: ReadonlyArray<readonly [unknown, number]> = [
      ["365d", 365 * DAY_MS],
      ["24h", 24 * HOUR_MS],
      ["1h", HOUR_MS],
      ["30m", 30 * 60_000],
      ["45s", 45 * 1000],
      [3600, 3600 * 1000], // a plain finite integer is interpreted as seconds
    ];
    for (const [value, ms] of cases) {
      const stub: typeof configValueQuery = async () => ({ value, valueType: "duration" });
      const outcome = await inCtrlOrg((tx) =>
        createDelegationGrant(
          {
            representativeOrganizationId: REP_ORG,
            vendorProfileId: VENDOR_PROFILE,
            permissionSet: ["can_submit_quote"],
            validFrom,
          },
          ctrlCtx,
          { appendAuditRecord, configValueQuery: stub, vendorProfileControlReader: control },
          tx,
        ),
      );
      expect(outcome.ok, `notation ${String(value)} should resolve`).toBe(true);
      if (!outcome.ok) throw new Error("unreachable");
      const row = await prisma.delegationGrant.findFirstOrThrow({
        where: { id: outcome.result.delegationGrantId },
      });
      expect(row.validTo?.getTime(), `notation ${String(value)}`).toBe(validFrom.getTime() + ms);
      await prisma.delegationGrant.deleteMany({ where: { id: outcome.result.delegationGrantId } });
    }

    // An unparseable POLICY value → durationToMs THROWS (never invents a fallback window) → the command
    // rejects rather than writing an arbitrary window.
    const badStub: typeof configValueQuery = async () => ({
      value: "not-a-duration",
      valueType: "duration",
    });
    await expect(
      inCtrlOrg((tx) =>
        createDelegationGrant(
          {
            representativeOrganizationId: REP_ORG,
            vendorProfileId: VENDOR_PROFILE,
            permissionSet: ["can_submit_quote"],
            validFrom,
          },
          ctrlCtx,
          { appendAuditRecord, configValueQuery: badStub, vendorProfileControlReader: control },
          tx,
        ),
      ),
    ).rejects.toThrow(/not an interpretable duration/);
  });

  // ── suspend / revoke ────────────────────────────────────────────────────────
  it("SUSPEND: active → suspended + a `delegation_grant_suspended` audit row (atomic)", async () => {
    const g = await seedGrant({ status: "active" });
    const outcome = await inCtrlOrg((tx) =>
      suspendDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(outcome).toMatchObject({ ok: true, result: { status: "suspended" } });
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "suspended",
    );
    const audit = await auditFor(g.id);
    expect(audit.map((a) => a.action)).toEqual(["delegation_grant_suspended"]);
    expect(audit[0]!.oldValue).toMatchObject({ status: "active" });
    expect(audit[0]!.newValue).toMatchObject({ status: "suspended" });
  });

  it("SUSPEND forbidden: a representative-PARTY caller (can see the grant, not the controller) → forbidden", async () => {
    const g = await seedGrant({ status: "active" });
    // REP_USER holds can_manage_delegations in REP_ORG (passes AUTHZ) and REP_ORG IS a party (representative)
    // so the party-scoped load resolves the grant — but REP_ORG is NOT the controller. Per Doc-4C §C9 the
    // suspend register (PassB:595) carries NO `not_controller` code: the DELEGATION-stage controller failure
    // maps to `identity_delegation_forbidden` (AUTHORIZATION), NOT the create-only `..._not_controller`.
    const outcome = await withActiveOrgContext(repContext, (tx) =>
      suspendDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        { userId: REP_USER, activeOrgId: REP_ORG },
        { appendAuditRecord },
        tx,
      ),
    );
    expect(outcome).toMatchObject({
      ok: false,
      error: { errorClass: "AUTHORIZATION", errorCode: "identity_delegation_forbidden" },
    });
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "active",
    ); // unchanged
  });

  it("SUSPEND illegal state: an already-suspended grant → STATE (no re-suspend)", async () => {
    const g = await seedGrant({ status: "suspended" });
    const outcome = await inCtrlOrg((tx) =>
      suspendDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(outcome).toMatchObject({
      ok: false,
      error: { errorClass: "STATE", errorCode: "identity_delegation_state_invalid" },
    });
  });

  it("SUSPEND stale token: a mismatched updated_at → VALIDATION (no write)", async () => {
    const g = await seedGrant({ status: "active" });
    const outcome = await inCtrlOrg((tx) =>
      suspendDelegationGrant(
        { delegationGrantId: g.id, updatedAt: new Date(0) },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(outcome).toMatchObject({
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: "identity_delegation_invalid_input" },
    });
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "active",
    );
  });

  it("SUSPEND not_found: an unknown grant id → NOT_FOUND", async () => {
    const outcome = await inCtrlOrg((tx) =>
      suspendDelegationGrant(
        { delegationGrantId: "01920000-0000-7000-8000-0000000d4fee", updatedAt: new Date() },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(outcome).toMatchObject({
      ok: false,
      error: { errorClass: "NOT_FOUND", errorCode: "identity_delegation_not_found" },
    });
  });

  it("SUSPEND non-party collapse (F2): a THIRD-org caller gets an IDENTICAL NOT_FOUND for a real grant id and a random uuid", async () => {
    // A real grant between CTRL_ORG (controller) and REP_ORG (representative). THIRD_ORG is neither party.
    const g = await seedGrant({ status: "active" });
    const RANDOM_ID = "01920000-0000-7000-8000-0000000d4dee"; // no such grant

    // THIRD_USER holds can_manage_delegations in THIRD_ORG → passes AUTHZ → reaches the party-scoped load.
    const probeExisting = await withActiveOrgContext(thirdContext, (tx) =>
      suspendDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        thirdCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    const probeRandom = await withActiveOrgContext(thirdContext, (tx) =>
      suspendDelegationGrant(
        { delegationGrantId: RANDOM_ID, updatedAt: g.updatedAt },
        thirdCtx,
        { appendAuditRecord },
        tx,
      ),
    );

    // BYTE-INDISTINGUISHABLE: probing an EXISTING grant a third org is not party to yields the identical
    // outcome (ok · errorClass · errorCode · message) as probing a nonexistent id — no existence oracle
    // over other tenants' delegation relationships (§C9 SCOPE collapse; §7.5 protected-fact rule).
    expect(probeExisting).toEqual(probeRandom);
    expect(probeExisting).toMatchObject({
      ok: false,
      error: { errorClass: "NOT_FOUND", errorCode: "identity_delegation_not_found" },
    });
    // The real grant is untouched and unaudited (no write, no leak).
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "active",
    );
    expect(await auditFor(g.id)).toHaveLength(0);
  });

  it("ATOMICITY direction 2 (REFERENCE §4.10): every failed lifecycle write leaves NO audit row", async () => {
    // stale token → VALIDATION; no write, no audit.
    const g1 = await seedGrant({ status: "active" });
    await inCtrlOrg((tx) =>
      suspendDelegationGrant(
        { delegationGrantId: g1.id, updatedAt: new Date(0) },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(await auditFor(g1.id)).toHaveLength(0);

    // illegal state (already-suspended → suspend) → STATE; no write, no audit.
    const g2 = await seedGrant({ status: "suspended" });
    await inCtrlOrg((tx) =>
      suspendDelegationGrant(
        { delegationGrantId: g2.id, updatedAt: g2.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(await auditFor(g2.id)).toHaveLength(0);

    // representative-party (forbidden) → AUTHORIZATION; no write, no audit.
    const g3 = await seedGrant({ status: "active" });
    await withActiveOrgContext(repContext, (tx) =>
      suspendDelegationGrant(
        { delegationGrantId: g3.id, updatedAt: g3.updatedAt },
        { userId: REP_USER, activeOrgId: REP_ORG },
        { appendAuditRecord },
        tx,
      ),
    );
    expect(await auditFor(g3.id)).toHaveLength(0);

    // revoke from a terminal state → STATE; no write, no audit.
    const g4 = await seedGrant({ status: "revoked" });
    await inCtrlOrg((tx) =>
      revokeDelegationGrant(
        { delegationGrantId: g4.id, updatedAt: g4.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(await auditFor(g4.id)).toHaveLength(0);
  });

  it("REVOKE: active → revoked + audit + fires the refresh-on-revocation seam", async () => {
    const g = await seedGrant({ status: "active" });
    const refresh = vi.fn<DelegationRefreshPort>(async () => {});
    const outcome = await inCtrlOrg((tx) =>
      revokeDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        ctrlCtx,
        { appendAuditRecord, refreshPort: refresh },
        tx,
      ),
    );
    expect(outcome).toMatchObject({ ok: true, result: { status: "revoked" } });
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "revoked",
    );
    expect((await auditFor(g.id)).map((a) => a.action)).toEqual(["delegation_grant_revoked"]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith({
      delegationGrantId: g.id,
      vendorProfileId: VENDOR_PROFILE,
      representativeOrganizationId: REP_ORG,
    });
  });

  it("REVOKE from suspended: suspended → revoked (active|suspended → revoked)", async () => {
    const g = await seedGrant({ status: "suspended" });
    const outcome = await inCtrlOrg((tx) =>
      revokeDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(outcome).toMatchObject({ ok: true, result: { status: "revoked" } });
  });

  // ── Doc-2 §5.10 illegal-edge coverage through the contract surface (the state machine is domain-private;
  //    every illegal edge a command could attempt fails closed with STATE — a paraphrased machine is the
  //    cardinal sin). The legal edges are proven by the create/suspend/revoke/expire tests above. ──
  it("STATE machine: every illegal source-state → STATE (draft/terminal never transition via a command)", async () => {
    // Each tuple: seed a grant at `from`, attempt `op`, expect a STATE rejection (the edge is illegal).
    const illegal: ReadonlyArray<{ from: DelegationGrantStatusValue; op: "suspend" | "revoke" }> = [
      { from: "draft", op: "suspend" }, //     draft → suspended (illegal)
      { from: "draft", op: "revoke" }, //      draft → revoked (illegal)
      { from: "revoked", op: "suspend" }, //   terminal → * (illegal)
      { from: "revoked", op: "revoke" }, //    terminal re-revoke (illegal)
      { from: "expired", op: "suspend" }, //   terminal → * (illegal)
      { from: "expired", op: "revoke" }, //    terminal → * (illegal)
    ];
    for (const { from, op } of illegal) {
      const g = await seedGrant({ status: from });
      const command = op === "suspend" ? suspendDelegationGrant : revokeDelegationGrant;
      const outcome = await inCtrlOrg((tx) =>
        command(
          { delegationGrantId: g.id, updatedAt: g.updatedAt },
          ctrlCtx,
          { appendAuditRecord },
          tx,
        ),
      );
      expect(outcome).toMatchObject({
        ok: false,
        error: { errorClass: "STATE", errorCode: "identity_delegation_state_invalid" },
      });
      // The status is unchanged (no illegal write leaked through).
      expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(from);
    }
  });

  // ── reinstate (REAL since W2-IDN-6.5 — `Doc-2_Patch_v1.0.7` rule 3) ──────────
  it("REINSTATE in-window: suspended → active + a `delegation_grant_reinstated` audit row (atomic)", async () => {
    const g = await seedGrant({ status: "suspended", validFrom: PAST_FROM, validTo: FUTURE });
    const outcome = await inCtrlOrg((tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(outcome).toMatchObject({ ok: true, result: { status: "active" } });
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "active",
    );
    const audit = await auditFor(g.id);
    expect(audit.map((a) => a.action)).toEqual(["delegation_grant_reinstated"]);
    expect(audit[0]!.actorType).toBe("user");
    expect(audit[0]!.actorId).toBe(CTRL_USER);
    expect(audit[0]!.organizationId).toBe(CTRL_ORG);
    expect(audit[0]!.oldValue).toMatchObject({ status: "suspended" });
    expect(audit[0]!.newValue).toMatchObject({ status: "active" });
  });

  it("REINSTATE open-ended window: a suspended grant with valid_to NULL reinstates (the window never lapses)", async () => {
    const g = await seedGrant({ status: "suspended", validTo: null });
    const outcome = await inCtrlOrg((tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(outcome).toMatchObject({ ok: true, result: { status: "active" } });
  });

  it("REINSTATE after lapse (patch rule 3): a suspended grant whose window lapsed is REJECTED (STATE, in-register) — no write, no audit, no revival", async () => {
    const g = await seedGrant({ status: "suspended", validFrom: PAST_FROM, validTo: PAST_TO });
    const outcome = await inCtrlOrg((tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        ctrlCtx,
        { appendAuditRecord, now: () => NOW_AFTER_EXPIRY },
        tx,
      ),
    );
    // The Board instrument (c): reject-expired stays INSIDE the frozen §C9 register — the STATE row.
    expect(outcome).toMatchObject({
      ok: false,
      error: {
        errorClass: "STATE",
        errorCode: "identity_delegation_state_invalid",
        message: expect.stringMatching(/validity window has lapsed/),
      },
    });
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "suspended",
    ); // untouched — the sweep (System), not a User command, realizes `suspended → expired`.
    expect(await auditFor(g.id)).toHaveLength(0);
  });

  it("REINSTATE boundary both directions (patch rule 3): window OPEN at reinstate time succeeds; one tick past valid_to rejects", async () => {
    // Deterministic clock on BOTH sides of the boundary — the discriminating pair.
    const edge = new Date("2600-01-01T00:00:00.000Z");
    const before = new Date(edge.getTime() - 1);

    const open = await seedGrant({ status: "suspended", validFrom: PAST_FROM, validTo: edge });
    const ok = await inCtrlOrg((tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: open.id, updatedAt: open.updatedAt },
        ctrlCtx,
        { appendAuditRecord, now: () => before },
        tx,
      ),
    );
    expect(ok).toMatchObject({ ok: true, result: { status: "active" } });

    const lapsed = await seedGrant({ status: "suspended", validFrom: PAST_FROM, validTo: edge });
    const rejected = await inCtrlOrg((tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: lapsed.id, updatedAt: lapsed.updatedAt },
        ctrlCtx,
        { appendAuditRecord, now: () => edge }, // valid_to <= now ⇒ lapsed (the patch's "NOT passed" is exclusive)
        tx,
      ),
    );
    expect(rejected).toMatchObject({
      ok: false,
      error: { errorClass: "STATE", errorCode: "identity_delegation_state_invalid" },
    });
  });

  it("REINSTATE illegal sources (patch rules 2/4 — no resurrection): expired · revoked · active · draft all → STATE; stale token → VALIDATION", async () => {
    for (const from of ["expired", "revoked", "active", "draft"] as const) {
      const g = await seedGrant({ status: from, validTo: FUTURE });
      const outcome = await inCtrlOrg((tx) =>
        reinstateDelegationGrant(
          { delegationGrantId: g.id, updatedAt: g.updatedAt },
          ctrlCtx,
          { appendAuditRecord },
          tx,
        ),
      );
      expect(outcome, `reinstate from ${from}`).toMatchObject({
        ok: false,
        error: { errorClass: "STATE", errorCode: "identity_delegation_state_invalid" },
      });
      expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(from);
      expect(await auditFor(g.id)).toHaveLength(0);
    }

    // Stale token on a legal source — the IDN-4-ratified in-register VALIDATION (no §C9 CONFLICT code).
    const g = await seedGrant({ status: "suspended", validTo: FUTURE });
    const stale = await inCtrlOrg((tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: g.id, updatedAt: new Date(0) },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(stale).toMatchObject({
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: "identity_delegation_invalid_input" },
    });
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "suspended",
    );
  });

  it("REINSTATE authority: representative-party caller → forbidden; non-party caller → NOT_FOUND collapse (byte-identical to nonexistent)", async () => {
    const g = await seedGrant({ status: "suspended", validTo: FUTURE });
    const rep = await withActiveOrgContext(repContext, (tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        { userId: REP_USER, activeOrgId: REP_ORG },
        { appendAuditRecord },
        tx,
      ),
    );
    expect(rep).toMatchObject({
      ok: false,
      error: { errorClass: "AUTHORIZATION", errorCode: "identity_delegation_forbidden" },
    });

    const third = await withActiveOrgContext(thirdContext, (tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: g.id, updatedAt: g.updatedAt },
        thirdCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    const randomProbe = await withActiveOrgContext(thirdContext, (tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: "01920000-0000-7000-8000-0000000d4dee", updatedAt: g.updatedAt },
        thirdCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(third).toEqual(randomProbe); // no existence oracle (§7.5)
    expect(third).toMatchObject({
      ok: false,
      error: { errorClass: "NOT_FOUND", errorCode: "identity_delegation_not_found" },
    });
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "suspended",
    );
  });

  it("REINSTATE rollback direction (D7 invariant 1): a failing audit append rolls the suspended → active write back", async () => {
    const g = await seedGrant({ status: "suspended", validTo: FUTURE });
    const failingAppend = (() =>
      Promise.reject(new Error("audit append failed (injected)"))) as typeof appendAuditRecord;
    await expect(
      inCtrlOrg((tx) =>
        reinstateDelegationGrant(
          { delegationGrantId: g.id, updatedAt: g.updatedAt },
          ctrlCtx,
          { appendAuditRecord: failingAppend },
          tx,
        ),
      ),
    ).rejects.toThrow(/audit append failed/);
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "suspended",
    );
    expect(await auditFor(g.id)).toHaveLength(0);
  });

  // ── System expiry sweep (patch rule 1 — BOTH non-terminal states) ─────────────
  it("EXPIRE (ruling-realization pin update): sweeps active+lapsed AND suspended+lapsed → expired (System audit each); leaves in-window rows; idempotent", async () => {
    const active = await seedGrant({ status: "active", validFrom: PAST_FROM, validTo: PAST_TO });
    // A SUSPENDED grant also lapsed — NOW SWEPT (`Doc-2_Patch_v1.0.7` rule 1; the former RV-0149
    // "untouched" pin encoded the pre-ruling text — this update is ruling-realization, not regression).
    const suspended = await seedGrant({
      status: "suspended",
      validFrom: PAST_FROM,
      validTo: PAST_TO,
    });
    // An active grant still IN window — MUST NOT be swept.
    const future = await seedGrant({ status: "active", validFrom: PAST_FROM, validTo: FUTURE });
    // A suspended grant still IN window — MUST NOT be swept (discriminates the window filter,
    // not just the status filter, on the new suspended leg).
    const suspendedFuture = await seedGrant({
      status: "suspended",
      validFrom: PAST_FROM,
      validTo: FUTURE,
    });
    const refresh = vi.fn<DelegationRefreshPort>(async () => {});

    const first = await expireDelegationGrants({
      appendAuditRecord,
      refreshPort: refresh,
      now: () => NOW_AFTER_EXPIRY,
    });
    expect(first.expired).toBe(2);
    expect((await prisma.delegationGrant.findFirst({ where: { id: active.id } }))?.status).toBe(
      "expired",
    );
    expect((await prisma.delegationGrant.findFirst({ where: { id: suspended.id } }))?.status).toBe(
      "expired", // the patched `suspended → expired` edge, System-realized
    );
    expect((await prisma.delegationGrant.findFirst({ where: { id: future.id } }))?.status).toBe(
      "active",
    ); // untouched
    expect(
      (await prisma.delegationGrant.findFirst({ where: { id: suspendedFuture.id } }))?.status,
    ).toBe("suspended"); // untouched — in-window

    for (const [grantId, fromStatus] of [
      [active.id, "active"],
      [suspended.id, "suspended"],
    ] as const) {
      const audit = await auditFor(grantId);
      expect(audit.map((a) => a.action)).toEqual(["delegation_grant_expired"]);
      expect(audit[0]!.actorType).toBe("system");
      expect(audit[0]!.actorId).toBeNull();
      // F-B2: the System expiry audit row carries the grant's CONTROLLING org as business context.
      expect(audit[0]!.organizationId).toBe(CTRL_ORG);
      expect(audit[0]!.oldValue).toMatchObject({ status: fromStatus });
      expect(audit[0]!.newValue).toMatchObject({ status: "expired" });
    }
    expect(refresh).toHaveBeenCalledTimes(2);
    // F-B2: the refresh seam receives each EXPIRED grant's identifying payload.
    expect(refresh).toHaveBeenCalledWith({
      delegationGrantId: active.id,
      vendorProfileId: VENDOR_PROFILE,
      representativeOrganizationId: REP_ORG,
    });
    expect(refresh).toHaveBeenCalledWith({
      delegationGrantId: suspended.id,
      vendorProfileId: VENDOR_PROFILE,
      representativeOrganizationId: REP_ORG,
    });

    // Idempotent — a terminal grant is never re-expired (both states).
    const second = await expireDelegationGrants({
      appendAuditRecord,
      refreshPort: refresh,
      now: () => NOW_AFTER_EXPIRY,
    });
    expect(second.expired).toBe(0);
  });

  // ── no-resurrection (patch rule 4 — discriminating) ──────────────────────────
  it("NO-RESURRECTION (patch rule 4): post-terminal delegation requires a NEW grant — new UUID, fresh independent audit chain; the terminal instance is append-only", async () => {
    // Expire a suspended grant via the System sweep (the patched edge).
    const old = await seedGrant({ status: "suspended", validFrom: PAST_FROM, validTo: PAST_TO });
    await expireDelegationGrants({ appendAuditRecord, now: () => NOW_AFTER_EXPIRY });
    const oldRow = await prisma.delegationGrant.findFirstOrThrow({ where: { id: old.id } });
    expect(oldRow.status).toBe("expired");
    const oldAudit = await auditFor(old.id);
    expect(oldAudit.map((a) => a.action)).toEqual(["delegation_grant_expired"]);

    // Reinstate MUST NOT revive it (rules 2/3) — terminal with respect to the instance.
    const revive = await inCtrlOrg((tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: old.id, updatedAt: oldRow.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(revive).toMatchObject({
      ok: false,
      error: { errorClass: "STATE", errorCode: "identity_delegation_state_invalid" },
    });

    // Future delegation = a NEW grant (same parties/profile): new identity (new UUID), its OWN
    // fresh audit trail; the old instance and its chain are untouched (append-only history).
    const created = await inCtrlOrg((tx) =>
      createDelegationGrant(
        {
          representativeOrganizationId: REP_ORG,
          vendorProfileId: VENDOR_PROFILE,
          permissionSet: ["can_submit_quote"],
          validTo: FUTURE,
        },
        ctrlCtx,
        { appendAuditRecord, configValueQuery, vendorProfileControlReader: control },
        tx,
      ),
    );
    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("unreachable");
    const newId = created.result.delegationGrantId;
    expect(newId).not.toBe(old.id); // new UUID — IDs never reused (Invariant #8)

    const newAudit = await auditFor(newId);
    expect(newAudit.map((a) => a.action)).toEqual(["delegation_grant_issued"]); // fresh chain
    // The OLD instance's chain gained nothing from the new issuance (independent trails).
    expect((await auditFor(old.id)).map((a) => a.action)).toEqual(["delegation_grant_expired"]);
    // And the old row itself is byte-stable terminal (append-only history; no revival).
    const oldAfter = await prisma.delegationGrant.findFirstOrThrow({ where: { id: old.id } });
    expect(oldAfter.status).toBe("expired");
    expect(oldAfter.updatedAt.getTime()).toBe(oldRow.updatedAt.getTime());
  });

  // ── 8E end-to-end delegated-authz round trip (refresh immediacy) ───────────────
  it("8E: grant → check_permission delegated leg ALLOWS → revoke → DENIES (refresh immediacy)", async () => {
    const created = await inCtrlOrg((tx) =>
      createDelegationGrant(
        {
          representativeOrganizationId: REP_ORG,
          vendorProfileId: VENDOR_PROFILE,
          permissionSet: ["can_submit_quote"],
          validTo: FUTURE,
        },
        ctrlCtx,
        { appendAuditRecord, configValueQuery, vendorProfileControlReader: control },
        tx,
      ),
    );
    if (!created.ok) throw new Error("unreachable: create should succeed");
    const grantId = created.result.delegationGrantId;

    // REP_USER acts under the delegated path on VENDOR_PROFILE — all five §6B conditions hold ⇒ allow.
    const allowed = await checkPermission(
      {
        userId: REP_USER,
        organizationId: REP_ORG,
        permissionSlug: "can_submit_quote",
        vendorProfileId: VENDOR_PROFILE,
      },
      permits,
    );
    expect(allowed).toEqual({ decision: "allow", satisfiedBy: "delegation" });

    // Revoke — the grant is no longer active.
    const g = await prisma.delegationGrant.findFirstOrThrow({ where: { id: grantId } });
    const revoked = await inCtrlOrg((tx) =>
      revokeDelegationGrant(
        { delegationGrantId: grantId, updatedAt: g.updatedAt },
        ctrlCtx,
        { appendAuditRecord },
        tx,
      ),
    );
    expect(revoked.ok).toBe(true);

    // The delegated leg now DENIES immediately (the revocation is effective at resolution time).
    const denied = await checkPermission(
      {
        userId: REP_USER,
        organizationId: REP_ORG,
        permissionSlug: "can_submit_quote",
        vendorProfileId: VENDOR_PROFILE,
      },
      permits,
    );
    expect(denied).toEqual({
      decision: "deny",
      satisfiedBy: "none",
      denyReason: "delegation_denied",
    });
  });
});
