import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { withActiveOrgContext } from "../../src/server/context";
import { appendAuditRecord, configValueQuery } from "../../src/modules/core/contracts";
import {
  checkPermission,
  createDelegationGrant,
  DelegationReinstateGatedError,
  expireDelegationGrants,
  reinstateDelegationGrant,
  revokeDelegationGrant,
  suspendDelegationGrant,
  type DelegationGrantStatusValue,
  type DelegationRefreshPort,
  type VendorProfileControlReader,
  type VendorProfileStateReader,
} from "../../src/modules/identity/contracts";

// W2-IDN-4 — the delegation-grant WRITE side: the Doc-2 §5.10 state machine, dual-party authority guards,
// the `permission_set` guards (⊆-held / staff-space / ownership-class), the audited-atomic writes (D7
// pattern), the System expiry sweep (`active → expired` ONLY), refresh-on-revocation, and the 8E delegated-
// authz round trip. Proven against REAL PostgreSQL through the M1 CONTRACT surface ONLY (the frozen
// boundary rule — tests never import module internals; the state machine + permission-set policy are
// exercised via the commands, mirroring how `check_permission` proves the permission-resolution policy).
// App-layer authz is PRIMARY (Doc-4C §C9; Doc-6C §6.2a) — the local `postgres` connection is RLS-BYPASSED,
// so a pass proves the app-layer guards (not RLS) enforce; the dual-party RLS backstop is proven at IDN-1
// (`rls-identity-authz-tables`).

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

const FUTURE = new Date("2999-01-01T00:00:00.000Z");
const PAST_FROM = new Date("2020-01-01T00:00:00.000Z");
const PAST_TO = new Date("2020-06-01T00:00:00.000Z");
const NOW_AFTER_EXPIRY = new Date("2021-01-01T00:00:00.000Z");

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
    ] as const) {
      await prisma.organization.create({
        data: { id, humanRef: `ORG-D4-${id.slice(-6)}`, name, slug: `idn4-${id.slice(-6)}` },
      });
    }
    for (const id of [CTRL_USER, REP_USER, NONADMIN_USER]) {
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
  });

  beforeEach(async () => {
    await prisma.delegationGrant.deleteMany({
      where: { controllingOrganizationId: { in: [CTRL_ORG, REP_ORG] } },
    });
  });

  afterAll(async () => {
    await prisma.delegationGrant.deleteMany({
      where: { controllingOrganizationId: { in: [CTRL_ORG, REP_ORG] } },
    });
    await prisma.rolePermission.deleteMany({
      where: { roleId: { in: [CTRL_ROLE, REP_ROLE, NONADMIN_ROLE] } },
    });
    await prisma.membership.deleteMany({
      where: { userId: { in: [CTRL_USER, REP_USER, NONADMIN_USER] } },
    });
    await prisma.role.deleteMany({ where: { id: { in: [CTRL_ROLE, REP_ROLE, NONADMIN_ROLE] } } });
    await prisma.user.deleteMany({ where: { id: { in: [CTRL_USER, REP_USER, NONADMIN_USER] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [CTRL_ORG, REP_ORG] } } });
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

  it("SUSPEND not_controller: a representative-org caller (not the controller) → deny", async () => {
    const g = await seedGrant({ status: "active" });
    // REP_USER holds can_manage_delegations in REP_ORG (passes AUTHZ) but REP_ORG is NOT the controller.
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
      error: { errorClass: "AUTHORIZATION", errorCode: "identity_delegation_not_controller" },
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

  // ── reinstate scaffold ──────────────────────────────────────────────────────
  it("REINSTATE scaffold: rejects with an [ESC-IDN-DELEG-EXPIRY]-citing internal error (no write)", async () => {
    const g = await seedGrant({ status: "suspended" });
    await expect(
      reinstateDelegationGrant({ delegationGrantId: g.id, updatedAt: g.updatedAt }),
    ).rejects.toBeInstanceOf(DelegationReinstateGatedError);
    await expect(
      reinstateDelegationGrant({ delegationGrantId: g.id, updatedAt: g.updatedAt }),
    ).rejects.toThrow(/ESC-IDN-DELEG-EXPIRY/);
    expect((await prisma.delegationGrant.findFirst({ where: { id: g.id } }))?.status).toBe(
      "suspended",
    ); // unchanged
  });

  // ── System expiry sweep ───────────────────────────────────────────────────────
  it("EXPIRE: sweeps active+lapsed → expired (System audit); leaves suspended-at-expiry; idempotent", async () => {
    const active = await seedGrant({ status: "active", validFrom: PAST_FROM, validTo: PAST_TO });
    // A SUSPENDED grant also lapsed — MUST NOT be swept ([ESC-IDN-DELEG-EXPIRY]; active → expired ONLY).
    const suspended = await seedGrant({
      status: "suspended",
      validFrom: PAST_FROM,
      validTo: PAST_TO,
    });
    // An active grant still IN window — MUST NOT be swept.
    const future = await seedGrant({ status: "active", validFrom: PAST_FROM, validTo: FUTURE });
    const refresh = vi.fn<DelegationRefreshPort>(async () => {});

    const first = await expireDelegationGrants({
      appendAuditRecord,
      refreshPort: refresh,
      now: () => NOW_AFTER_EXPIRY,
    });
    expect(first.expired).toBe(1);
    expect((await prisma.delegationGrant.findFirst({ where: { id: active.id } }))?.status).toBe(
      "expired",
    );
    expect((await prisma.delegationGrant.findFirst({ where: { id: suspended.id } }))?.status).toBe(
      "suspended",
    ); // untouched
    expect((await prisma.delegationGrant.findFirst({ where: { id: future.id } }))?.status).toBe(
      "active",
    ); // untouched

    const audit = await auditFor(active.id);
    expect(audit.map((a) => a.action)).toEqual(["delegation_grant_expired"]);
    expect(audit[0]!.actorType).toBe("system");
    expect(audit[0]!.actorId).toBeNull();
    expect(refresh).toHaveBeenCalledTimes(1);

    // Idempotent — a terminal grant is never re-expired.
    const second = await expireDelegationGrants({
      appendAuditRecord,
      refreshPort: refresh,
      now: () => NOW_AFTER_EXPIRY,
    });
    expect(second.expired).toBe(0);
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
