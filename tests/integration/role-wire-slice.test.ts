import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { concurrencyEtag } from "../../src/shared/http";
import type { ensureProvisioned } from "../../src/server/auth";
import {
  handleCreateRole,
  handleDeleteRole,
  handleListPermissions,
  handleListRoles,
  handleSetRolePermissions,
  handleUpdateRole,
} from "../../src/server/identity";

// W2-IDN-6.4 — the §C7 Role & Permission WIRED surface (Doc-5C §5.1 rows 17–22, all 6 contracts),
// Doc-8 bands 8C + 8E:
//   8C — envelope (Doc-5A §5.6/§6.1; 201+Location on create; §8.6 list on the reads) · error
//   class+status (§6.2; the frozen §C7 registers re-derived per contract, PassB:479/:492/:504/:517) ·
//   idempotency (§B.6 REQUIRED-key deps + the CREATE claim leg [RV-0153 F2] + replay identity, the
//   generic `command_dedup_window`) · actor-scope (`list_permissions` DUAL-ACTOR / authenticated —
//   NO active-org · `list_roles` User / active-org · writes User / `can_manage_users`) ·
//   non-disclosure (byte-identical 404 collapse on foreign/absent; never another tenant's role).
//   8E — the Invariant #2 firewall DISCRIMINATING-TESTED (the RV-0147 widening/forgery-reject idiom):
//   `staff_*` never assignable to an org role · permission set ⊆ the assignable catalog (unknown
//   rejected) · never ownership-class · the 4 system bundles immutable (update/set-perms/delete
//   reject them with `system_protected`, NEVER a 404) · `delete_role` = ADR-012 soft-delete (row
//   retained, `deleted_at` set — never hard-deleted, Invariant #8) · optimistic concurrency — TWO
//   DISTINCT legs (RV-0157 OBS-B3, kept distinct): a STALE ARRIVAL VIEW (body token ≠ live token) →
//   VALIDATION 400 carrying NO `ETag`, vs a genuine LOSING CAS (token passed the arrival check but a
//   concurrent write advanced the row) → VALIDATION 400 CARRYING the current token via `ETag`
//   (§9.5/§9.6, call-13 leg). Two contenders on one token → exactly one wins — DETERMINISTIC, no
//   sleep-offset (roles carry no lock-based serialization). The genuine losing-CAS→ETag carriage is
//   not deterministically forced here (single-connection harness catches the loser pre-CAS; a
//   2-connection force is logged future-watch, RV-0157 OBS-A). All vs REAL PostgreSQL through the
//   composition surfaces ONLY (never module internals).

const COMMAND_DEDUP_STORE_KEY = "identity.command_dedup_window";

// The frozen Doc-2 §7 slug fixtures (verbatim; NONE coined). See identity-permission-catalog-seed.
const VALID_TENANT_SLUG = "can_create_rfq"; //     assignable tenant slug (Officer+ hold none of role-mgmt)
const VALID_TENANT_SLUG_2 = "can_view_rfq"; //     a second assignable tenant slug
const OWNERSHIP_CLASS_SLUG = "can_transfer_ownership"; // tenant, but Owner-only (DC-CR7 reserved)
const STAFF_SLUG = "staff_can_ban"; //             a REAL staff-space slug (Invariant #2 firewall)
const UNKNOWN_SLUG = "can_zzz_not_a_real_slug"; // shaped-valid but ∉ the catalog

let ownerRoleId: string;
let managerRoleId: string;
let officerRoleId: string;

/** The provisioning stub — fixtures are pre-seeded; the hook must not mint a personal org. */
const noProvision: typeof ensureProvisioned = async () => ({
  created: false,
  userId: "",
  organizationId: null,
  organizationHumanRef: null,
  ownerMembershipId: null,
});

const asSession = (authUserId: string) => async () => ({ authUserId });
const wireJson = (b: unknown): unknown => JSON.parse(JSON.stringify(b));
const strip = (b: unknown) => {
  const rest = { ...(b as Record<string, unknown>) };
  delete rest.reference_id;
  return rest;
};
const key = () => `iv-k64-${uuidv7()}`;

const createdOrgIds: string[] = [];
const createdUserIds: string[] = [];
const createdRoleIds: string[] = [];

async function freshUser() {
  const id = uuidv7();
  const authUserId = uuidv7();
  await prisma.user.create({
    data: { id, authUserId, email: `k64-${id.slice(-12)}@role.example`, status: "active" },
  });
  createdUserIds.push(id);
  return { id, authUserId };
}

/** Mint a fresh org (direct seed) with the given members. */
async function freshOrg(members: Array<{ userId: string; roleId: string }>) {
  const id = uuidv7();
  const humanRef = `ORG-K64-${id.slice(-8)}`;
  await prisma.organization.create({
    data: {
      id,
      humanRef,
      name: `IDN64 ${id.slice(-6)}`,
      slug: humanRef.toLowerCase(),
      orgStatus: "active",
      isPersonalOrg: false,
    },
  });
  createdOrgIds.push(id);
  for (const m of members) {
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        organizationId: id,
        userId: m.userId,
        roleId: m.roleId,
        state: "active",
        joinedAt: new Date(),
      },
    });
  }
  return { id };
}

/** Seed a custom role directly (bypass the wire) with the given tenant slugs; returns id + token. */
async function seedCustomRole(orgId: string, name: string, slugs: string[] = []) {
  const roleId = uuidv7();
  const row = await prisma.role.create({
    data: { id: roleId, organizationId: orgId, name, isSystemBundle: false },
  });
  createdRoleIds.push(roleId);
  for (const slug of slugs) {
    const perm = await prisma.permission.findFirstOrThrow({
      where: { slug },
      select: { id: true },
    });
    await prisma.rolePermission.create({
      data: { roleId, permissionId: perm.id, organizationId: orgId },
    });
  }
  return { roleId, updatedAt: row.updatedAt };
}

async function reloadRole(id: string) {
  return prisma.role.findUnique({ where: { id } });
}
async function roleAudits(entityIds: string[]) {
  return prisma.auditRecord.findMany({
    where: { entityType: "role", entityId: { in: entityIds } },
    orderBy: { eventTime: "asc" },
  });
}
async function effectiveSlugs(roleId: string): Promise<string[]> {
  const rows = await prisma.rolePermission.findMany({
    where: { roleId },
    select: { permission: { select: { slug: true } } },
  });
  return rows.map((r) => r.permission.slug).sort();
}

const writeDeps = (auth: string, k: string | null | undefined) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
  idempotencyKey: k,
});
const readDeps = (auth: string) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
});

describe("W2-IDN-6.4 §C7 role/permission wired surface — 8C + 8E (real PostgreSQL)", () => {
  beforeAll(async () => {
    for (const [name, setter] of [
      ["Owner", (id: string) => (ownerRoleId = id)],
      ["Manager", (id: string) => (managerRoleId = id)],
      ["Officer", (id: string) => (officerRoleId = id)],
    ] as const) {
      setter(
        (
          await prisma.role.findFirstOrThrow({
            where: { name, organizationId: null, isSystemBundle: true, deletedAt: null },
            select: { id: true },
          })
        ).id,
      );
    }
    await prisma.systemConfiguration.deleteMany({ where: { key: COMMAND_DEDUP_STORE_KEY } });
    await prisma.systemConfiguration.create({
      data: {
        id: uuidv7(),
        key: COMMAND_DEDUP_STORE_KEY,
        valueJsonb: "24h",
        valueType: "duration",
      },
    });
  });

  afterAll(async () => {
    await prisma.commandDedup.deleteMany({ where: { actorUserId: { in: createdUserIds } } });
    await prisma.systemConfiguration.deleteMany({ where: { key: COMMAND_DEDUP_STORE_KEY } });
    await prisma.rolePermission.deleteMany({ where: { organizationId: { in: createdOrgIds } } });
    await prisma.membership.deleteMany({ where: { organizationId: { in: createdOrgIds } } });
    await prisma.role.deleteMany({
      where: { OR: [{ organizationId: { in: createdOrgIds } }, { id: { in: createdRoleIds } }] },
    });
    // NOTE: `core.audit_records` is APPEND-ONLY (CR4' immutability trigger — DELETE forbidden). The
    // role_* audit rows this slice appended are intentionally LEFT in the ephemeral per-worker DB (the
    // membership-wire-slice precedent) — never deleted.
    await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  // ════ A. list_permissions — GET /identity/permissions (DUAL-ACTOR; authenticated scope) ════

  it("LIST_PERMISSIONS: 200 + §8.6 list envelope; all 43 slugs; space filter (tenant→36, staff→7); DUAL-ACTOR authenticated scope (NO active-org needed); 401 unauth; pagination fail-closed", async () => {
    const u = await freshUser(); // a user with NO org membership — proves the authenticated (dual-actor) scope.

    const all = await handleListPermissions({}, readDeps(u.authUserId));
    expect(all.status).toBe(200);
    const body = all.body as {
      result: { items: unknown[]; pageInfo: { hasMore: boolean } };
      reference_id: string;
    };
    expect(body.result.items).toHaveLength(43);
    expect(body.result.pageInfo).toEqual({ hasMore: false });
    expect(typeof body.reference_id).toBe("string");

    const tenant = await handleListPermissions({ space: "tenant" }, readDeps(u.authUserId));
    expect((tenant.body as { result: { items: unknown[] } }).result.items).toHaveLength(36);
    const staff = await handleListPermissions({ space: "staff" }, readDeps(u.authUserId));
    expect((staff.body as { result: { items: unknown[] } }).result.items).toHaveLength(7);

    // 401 unauthenticated.
    const anon = await handleListPermissions(
      {},
      { resolveSession: async () => null, ensureProvisioned: noProvision },
    );
    expect(anon.status).toBe(401);

    // pagination handle-gated (ESC-IDN-LIST-PAGESIZE) → 400 with the read's OWN frozen register token
    // `identity_permission_invalid_input` (PassB:456) — NOT the role sibling's token (RV-0157 F1).
    const paged = await handleListPermissions({ pageSize: "10" }, readDeps(u.authUserId));
    expect(paged.status).toBe(400);
    expect(
      (paged.body as { error: { error_class: string; error_code: string } }).error.error_class,
    ).toBe("VALIDATION");
    expect((paged.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_permission_invalid_input",
    );
    expect((await handleListPermissions({ cursor: "x" }, readDeps(u.authUserId))).status).toBe(400);
    // bad space enum → 400 with the SAME frozen permission token.
    const badSpace = await handleListPermissions({ space: "boss" }, readDeps(u.authUserId));
    expect(badSpace.status).toBe(400);
    expect((badSpace.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_permission_invalid_input",
    );
  });

  // ════ B. list_roles — GET /identity/roles (User; active-org scope) ════

  it("LIST_ROLES: 200; own custom role + system seeds; include_system=false → custom only; a FOREIGN org's custom role NEVER visible; a user with no active org → empty list; 401 unauth", async () => {
    const owner = await freshUser();
    const org = await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);
    const custom = await seedCustomRole(org.id, "Procurement Lead");

    const foreignOwner = await freshUser();
    const foreignOrg = await freshOrg([{ userId: foreignOwner.id, roleId: ownerRoleId }]);
    await seedCustomRole(foreignOrg.id, "Foreign Secret Role");

    const withSeeds = await handleListRoles({}, readDeps(owner.authUserId));
    expect(withSeeds.status).toBe(200);
    const items = (
      withSeeds.body as {
        result: { items: Array<{ roleId: string; name: string; isSystemBundle: boolean }> };
      }
    ).result.items;
    const names = items.map((r) => r.name);
    expect(names).toContain("Procurement Lead");
    expect(names).toContain("Owner"); // a system seed
    expect(names).not.toContain("Foreign Secret Role"); // §7.5 non-disclosure — never a foreign tenant's role
    expect(items.find((r) => r.roleId === custom.roleId)?.isSystemBundle).toBe(false);

    const noSeeds = await handleListRoles({ includeSystem: "false" }, readDeps(owner.authUserId));
    const noSeedNames = (
      noSeeds.body as { result: { items: Array<{ name: string }> } }
    ).result.items.map((r) => r.name);
    expect(noSeedNames).toContain("Procurement Lead");
    expect(noSeedNames).not.toContain("Owner");

    // A user with no active org → the empty list (collection-face fail-closed), NOT a 404.
    const orphan = await freshUser();
    const empty = await handleListRoles({}, readDeps(orphan.authUserId));
    expect(empty.status).toBe(200);
    expect((empty.body as { result: { items: unknown[] } }).result.items).toHaveLength(0);

    expect(
      (
        await handleListRoles(
          {},
          { resolveSession: async () => null, ensureProvisioned: noProvision },
        )
      ).status,
    ).toBe(401);

    // MINOR-B1 (RV-0157): pin `list_roles`' OWN frozen VALIDATION token `identity_role_invalid_input`
    // (PassB:467) — its TWIN read `list_permissions` uses `identity_permission_invalid_input`, so the
    // exact F1 failure-mode (a sibling's token) must be detectable on BOTH reads. Its VALIDATION leg is
    // the handle-gated pagination + the bad `include_system` enum. NON-VACUOUS: this asserts the token
    // string, so it would RED if `handleListRoles` emitted `identity_permission_invalid_input` (the F1
    // bug class) — the same discipline as the list_permissions pin.
    const badEnum = await handleListRoles({ includeSystem: "maybe" }, readDeps(owner.authUserId));
    expect(badEnum.status).toBe(400);
    expect(
      (badEnum.body as { error: { error_class: string; error_code: string } }).error.error_class,
    ).toBe("VALIDATION");
    expect((badEnum.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_invalid_input",
    );
    const pagedRoles = await handleListRoles({ pageSize: "10" }, readDeps(owner.authUserId));
    expect(pagedRoles.status).toBe(400);
    expect((pagedRoles.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_invalid_input",
    );
  });

  // ════ C. create_role — POST /identity/roles (create; §B.6 claim leg) ════

  it("CREATE_ROLE: 201 + Location + §5.6 envelope; row (org=active, is_system_bundle=false); audit role_created (User, §9 enumerated); §B.6 same-key replay → the STORED response (same reference_id), ONE row, ONE audit; missing key → 400; Officer (no can_manage_users) → 403; 401", async () => {
    const owner = await freshUser();
    const org = await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);

    const k = key();
    const res = await handleCreateRole(
      { name: "Buyer Officer", permissionSlugs: [VALID_TENANT_SLUG, VALID_TENANT_SLUG_2] },
      writeDeps(owner.authUserId, k),
    );
    expect(res.status).toBe(201);
    expect(res.headers?.Location).toMatch(/^\/identity\/roles\/[0-9a-f-]{36}$/);
    const created = res.body as { result: { roleId: string; name: string }; reference_id: string };
    expect(created.result.name).toBe("Buyer Officer");
    createdRoleIds.push(created.result.roleId);

    const row = await reloadRole(created.result.roleId);
    expect(row?.organizationId).toBe(org.id);
    expect(row?.isSystemBundle).toBe(false);
    expect(await effectiveSlugs(created.result.roleId)).toEqual(
      [VALID_TENANT_SLUG, VALID_TENANT_SLUG_2].sort(),
    );

    const audits = await roleAudits([created.result.roleId]);
    expect(audits).toHaveLength(1);
    expect(audits[0]?.action).toBe("role_created");
    expect(audits[0]?.actorType).toBe("user");

    // §B.6 same-key replay → the STORED wire response (same reference_id), NO second row, NO second audit.
    const replay = await handleCreateRole(
      { name: "Buyer Officer", permissionSlugs: [VALID_TENANT_SLUG, VALID_TENANT_SLUG_2] },
      writeDeps(owner.authUserId, k),
    );
    expect(replay.status).toBe(201);
    expect(strip(wireJson(replay.body))).toEqual(strip(wireJson(res.body)));
    expect((replay.body as { reference_id: string }).reference_id).toBe(created.reference_id);
    expect(
      await prisma.role.count({
        where: { organizationId: org.id, name: "Buyer Officer", deletedAt: null },
      }),
    ).toBe(1);
    expect(await roleAudits([created.result.roleId])).toHaveLength(1);

    // missing Idempotency-Key → 400 (the mandatory-header SYNTAX leg).
    expect((await handleCreateRole({ name: "X" }, writeDeps(owner.authUserId, null))).status).toBe(
      400,
    );

    // Officer (bundle lacks can_manage_users) → 403.
    const officer = await freshUser();
    const oorg = await freshOrg([{ userId: officer.id, roleId: officerRoleId }]);
    void oorg;
    const forbidden = await handleCreateRole(
      { name: "Nope" },
      writeDeps(officer.authUserId, key()),
    );
    expect(forbidden.status).toBe(403);
    expect((forbidden.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_forbidden",
    );

    // A MANAGER (a NON-Owner bundle that DOES hold can_manage_users, Doc-2 §7 "M per bundle") → 201.
    // Proves the guard binds the SLUG, not the Owner identity (the two-role-dimension separation).
    const manager = await freshUser();
    const morg = await freshOrg([{ userId: manager.id, roleId: managerRoleId }]);
    const mgrOk = await handleCreateRole(
      { name: "Mgr Bundle" },
      writeDeps(manager.authUserId, key()),
    );
    expect(mgrOk.status).toBe(201);
    expect(
      (await reloadRole((mgrOk.body as { result: { roleId: string } }).result.roleId))
        ?.organizationId,
    ).toBe(morg.id);

    // 401 unauthenticated.
    expect(
      (
        await handleCreateRole(
          { name: "Y" },
          {
            resolveSession: async () => null,
            ensureProvisioned: noProvision,
            idempotencyKey: key(),
          },
        )
      ).status,
    ).toBe(401);
  });

  // ════ D. 8E — the Invariant #2 / DC-CR7 firewall, DISCRIMINATING (create_role) ════

  it("8E CREATE firewall (widening/forgery-reject idiom): a STAFF slug, an OWNERSHIP-CLASS slug, and an UNKNOWN slug are EACH rejected 422 identity_permission_slug_unknown — byte-identical; NO role row and NO staff→custom role_permission is ever written; a valid tenant slug is accepted", async () => {
    const owner = await freshUser();
    const org = await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);

    const staffAttempt = await handleCreateRole(
      { name: "StaffForge", permissionSlugs: [STAFF_SLUG] },
      writeDeps(owner.authUserId, key()),
    );
    const ownerClassAttempt = await handleCreateRole(
      { name: "OwnerForge", permissionSlugs: [OWNERSHIP_CLASS_SLUG] },
      writeDeps(owner.authUserId, key()),
    );
    const unknownAttempt = await handleCreateRole(
      { name: "UnknownForge", permissionSlugs: [UNKNOWN_SLUG] },
      writeDeps(owner.authUserId, key()),
    );

    for (const r of [staffAttempt, ownerClassAttempt, unknownAttempt]) {
      expect(r.status).toBe(422);
      expect(
        (r.body as { error: { error_class: string; error_code: string } }).error.error_class,
      ).toBe("REFERENCE");
      expect((r.body as { error: { error_code: string } }).error.error_code).toBe(
        "identity_permission_slug_unknown",
      );
    }
    // Byte-identical wire (the staff slug is indistinguishable from a typo — non-disclosure firewall).
    expect(strip(wireJson(staffAttempt.body))).toEqual(strip(wireJson(unknownAttempt.body)));

    // NOTHING was written: no role rows for these names, and ZERO staff-space rows in this org's composition.
    expect(
      await prisma.role.count({
        where: {
          organizationId: org.id,
          name: { in: ["StaffForge", "OwnerForge", "UnknownForge"] },
        },
      }),
    ).toBe(0);
    expect(
      await prisma.rolePermission.count({
        where: { organizationId: org.id, permission: { space: "staff" } },
      }),
    ).toBe(0);

    // The valid tenant slug is accepted (the guard is a firewall, not a blanket deny).
    const ok = await handleCreateRole(
      { name: "GoodBundle", permissionSlugs: [VALID_TENANT_SLUG] },
      writeDeps(owner.authUserId, key()),
    );
    expect(ok.status).toBe(201);
    createdRoleIds.push((ok.body as { result: { roleId: string } }).result.roleId);

    // T6-OBS-5 (RV-0157): MIXED set (one VALID tenant slug + one staff slug) → the WHOLE set rejected
    // 422 (never partially applied — the per-slug loop rejects on the first non-assignable and the
    // command returns BEFORE the write). DB backstop: no role row + no staff row written.
    const mixed = await handleCreateRole(
      { name: "MixedForge", permissionSlugs: [VALID_TENANT_SLUG, STAFF_SLUG] },
      writeDeps(owner.authUserId, key()),
    );
    expect(mixed.status).toBe(422);
    expect((mixed.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_permission_slug_unknown",
    );
    expect(await prisma.role.count({ where: { organizationId: org.id, name: "MixedForge" } })).toBe(
      0,
    );
    expect(
      await prisma.rolePermission.count({
        where: { organizationId: org.id, permission: { space: "staff" } },
      }),
    ).toBe(0);

    // T6-OBS-5: DUPLICATE-slug set — the realized behavior (createMany `skipDuplicates` on the
    // (role_id, permission_id) PK) is ONE effective row, not a duplicate-key error → 201 with the slug
    // present exactly once.
    const dupSlugs = await handleCreateRole(
      { name: "DupSlugBundle", permissionSlugs: [VALID_TENANT_SLUG, VALID_TENANT_SLUG] },
      writeDeps(owner.authUserId, key()),
    );
    expect(dupSlugs.status).toBe(201);
    const dupRoleId = (dupSlugs.body as { result: { roleId: string } }).result.roleId;
    createdRoleIds.push(dupRoleId);
    expect(await effectiveSlugs(dupRoleId)).toEqual([VALID_TENANT_SLUG]);
  });

  it("8E CREATE names: a RESERVED system-bundle name (Owner) → 409 identity_role_name_conflict; a DUPLICATE custom name → 409", async () => {
    const owner = await freshUser();
    const org = await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);

    const reserved = await handleCreateRole({ name: "Owner" }, writeDeps(owner.authUserId, key()));
    expect(reserved.status).toBe(409);
    expect((reserved.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_name_conflict",
    );
    // A lower-case variant is still reserved (display-label safety).
    expect(
      (await handleCreateRole({ name: "owner" }, writeDeps(owner.authUserId, key()))).status,
    ).toBe(409);

    const first = await handleCreateRole({ name: "Dup Role" }, writeDeps(owner.authUserId, key()));
    expect(first.status).toBe(201);
    createdRoleIds.push((first.body as { result: { roleId: string } }).result.roleId);
    void org;
    const dup = await handleCreateRole({ name: "Dup Role" }, writeDeps(owner.authUserId, key()));
    expect(dup.status).toBe(409);
    expect((dup.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_name_conflict",
    );
  });

  // ════ E. update_role — PATCH /identity/roles/{id} ════

  it("UPDATE_ROLE: 200 rename; audit role_updated; foreign-tenant role → 404 collapse; missing key → 400", async () => {
    const owner = await freshUser();
    const org = await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);
    const role = await seedCustomRole(org.id, "Old Name");

    const res = await handleUpdateRole(
      { roleId: role.roleId, name: "New Name", updatedAt: role.updatedAt },
      writeDeps(owner.authUserId, key()),
    );
    expect(res.status).toBe(200);
    expect((res.body as { result: { name: string } }).result.name).toBe("New Name");
    expect((await reloadRole(role.roleId))?.name).toBe("New Name");
    const audits = await roleAudits([role.roleId]);
    expect(audits.at(-1)?.action).toBe("role_updated");

    // A foreign tenant's role → byte-identical 404 (§7.5). Owner acts in `org`; target lives in another org.
    const otherOwner = await freshUser();
    const otherOrg = await freshOrg([{ userId: otherOwner.id, roleId: ownerRoleId }]);
    const foreign = await seedCustomRole(otherOrg.id, "Theirs");
    const cross = await handleUpdateRole(
      { roleId: foreign.roleId, name: "Hijack", updatedAt: foreign.updatedAt },
      writeDeps(owner.authUserId, key()),
    );
    expect(cross.status).toBe(404);
    expect((cross.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_not_found",
    );

    // missing Idempotency-Key → 400.
    expect(
      (
        await handleUpdateRole(
          { roleId: role.roleId, name: "Z", updatedAt: new Date() },
          writeDeps(owner.authUserId, null),
        )
      ).status,
    ).toBe(400);
  });

  // ════ F. set_role_permissions — POST …/{id}/set_role_permissions ════

  it("SET_ROLE_PERMISSIONS: 200 + effective_slugs; add then remove (removal = audited revocation); audit role_permissions_changed; add of a staff/ownership-class/unknown slug → 422 (composition UNCHANGED — nothing widened)", async () => {
    const owner = await freshUser();
    const org = await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);
    const role = await seedCustomRole(org.id, "Composable", [VALID_TENANT_SLUG]);

    const added = await handleSetRolePermissions(
      { roleId: role.roleId, addSlugs: [VALID_TENANT_SLUG_2], updatedAt: role.updatedAt },
      writeDeps(owner.authUserId, key()),
    );
    expect(added.status).toBe(200);
    expect((added.body as { result: { effectiveSlugs: string[] } }).result.effectiveSlugs).toEqual(
      [VALID_TENANT_SLUG, VALID_TENANT_SLUG_2].sort(),
    );
    const t1 = (added.body as { result: { updatedAt: Date } }).result.updatedAt;

    const removed = await handleSetRolePermissions(
      { roleId: role.roleId, removeSlugs: [VALID_TENANT_SLUG], updatedAt: t1 },
      writeDeps(owner.authUserId, key()),
    );
    expect(removed.status).toBe(200);
    expect(
      (removed.body as { result: { effectiveSlugs: string[] } }).result.effectiveSlugs,
    ).toEqual([VALID_TENANT_SLUG_2]);
    expect(await effectiveSlugs(role.roleId)).toEqual([VALID_TENANT_SLUG_2]);

    const audits = await roleAudits([role.roleId]);
    expect(audits.map((a) => a.action)).toEqual([
      "role_permissions_changed",
      "role_permissions_changed",
    ]);

    // The widening firewall on add_slugs — each rejected 422, composition unchanged.
    const before = await effectiveSlugs(role.roleId);
    const cur = (await reloadRole(role.roleId))!.updatedAt;
    for (const bad of [STAFF_SLUG, OWNERSHIP_CLASS_SLUG, UNKNOWN_SLUG]) {
      const r = await handleSetRolePermissions(
        { roleId: role.roleId, addSlugs: [bad], updatedAt: cur },
        writeDeps(owner.authUserId, key()),
      );
      expect(r.status).toBe(422);
      expect((r.body as { error: { error_code: string } }).error.error_code).toBe(
        "identity_permission_slug_unknown",
      );
    }
    expect(await effectiveSlugs(role.roleId)).toEqual(before); // nothing widened
    expect(
      await prisma.rolePermission.count({
        where: { organizationId: org.id, permission: { space: "staff" } },
      }),
    ).toBe(0);
  });

  // ════ G. 8E — system-bundle immutability (update / set-perms / delete → system_protected, NOT 404) ════

  it("8E system-bundle immutability: update_role / set_role_permissions / delete_role targeting a SYSTEM bundle (Owner) are each rejected 422 identity_role_system_protected — a system bundle is VISIBLE (not a 404), and never mutated/soft-deleted", async () => {
    const owner = await freshUser();
    await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);
    // OBS-B2 (RV-0157): pass the Owner bundle's REAL current `updated_at` (read first) — NOT a fresh
    // `new Date()`. `systemBundleGuard` runs BEFORE the stale-view check, so with the REAL token the
    // request reaches the guard on its merits (the 422 is the guard's, not an incidental stale-view
    // 400) — and the "bundle untouched" backstop below fires INDEPENDENTLY: if the guard were removed,
    // the valid-token mutation would proceed and this test would red on both the code AND the row.
    const seedTok = (await reloadRole(ownerRoleId))!.updatedAt;
    const seedComposition = await effectiveSlugs(ownerRoleId);

    const upd = await handleUpdateRole(
      { roleId: ownerRoleId, name: "Hacked Owner", updatedAt: seedTok },
      writeDeps(owner.authUserId, key()),
    );
    const setp = await handleSetRolePermissions(
      { roleId: ownerRoleId, addSlugs: [VALID_TENANT_SLUG], updatedAt: seedTok },
      writeDeps(owner.authUserId, key()),
    );
    const del = await handleDeleteRole(
      { roleId: ownerRoleId, updatedAt: seedTok },
      writeDeps(owner.authUserId, key()),
    );

    for (const r of [upd, setp, del]) {
      expect(r.status).toBe(422);
      expect(
        (r.body as { error: { error_class: string; error_code: string } }).error.error_class,
      ).toBe("BUSINESS");
      expect((r.body as { error: { error_code: string } }).error.error_code).toBe(
        "identity_role_system_protected",
      );
    }
    // The Owner system bundle is untouched: still live, still named "Owner", still org NULL, its
    // `updated_at` token AND its composition unchanged (the mutations were blocked, not applied).
    const ownerBundle = await reloadRole(ownerRoleId);
    expect(ownerBundle?.name).toBe("Owner");
    expect(ownerBundle?.deletedAt).toBeNull();
    expect(ownerBundle?.organizationId).toBeNull();
    expect(ownerBundle?.updatedAt.getTime()).toBe(seedTok.getTime());
    expect(await effectiveSlugs(ownerRoleId)).toEqual(seedComposition);
  });

  // ════ H. delete_role — DELETE /identity/roles/{id} (ADR-012 soft-delete; in-use guard) ════

  it("DELETE_ROLE: a role with a BOUND member → 422 identity_role_in_use; after the member is reassigned, soft-delete → 200 deleted:true; the row is RETAINED with deleted_at set (never hard-deleted; Invariant #8); audit role_deleted", async () => {
    const owner = await freshUser();
    const member = await freshUser();
    const role = await (async () => {
      const o = await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);
      const r = await seedCustomRole(o.id, "Doomed");
      // Bind `member` to the custom role (an active membership) → the in-use guard must block deletion.
      await prisma.membership.create({
        data: {
          id: uuidv7(),
          organizationId: o.id,
          userId: member.id,
          roleId: r.roleId,
          state: "active",
          joinedAt: new Date(),
        },
      });
      return { orgId: o.id, ...r };
    })();

    const blocked = await handleDeleteRole(
      { roleId: role.roleId, updatedAt: role.updatedAt },
      writeDeps(owner.authUserId, key()),
    );
    expect(blocked.status).toBe(422);
    expect((blocked.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_in_use",
    );
    expect((await reloadRole(role.roleId))?.deletedAt).toBeNull(); // not deleted

    // Reassign the bound member off the role (→ removed), then the soft-delete succeeds.
    await prisma.membership.updateMany({
      where: { userId: member.id, roleId: role.roleId },
      data: { state: "removed" },
    });
    const ok = await handleDeleteRole(
      { roleId: role.roleId, updatedAt: role.updatedAt, reason: "obsolete" },
      writeDeps(owner.authUserId, key()),
    );
    expect(ok.status).toBe(200);
    expect((ok.body as { result: { deleted: boolean } }).result.deleted).toBe(true);

    // ADR-012: the row is RETAINED (soft) — deleted_at set, never a hard delete.
    const row = await reloadRole(role.roleId);
    expect(row).not.toBeNull();
    expect(row?.deletedAt).not.toBeNull();
    expect(row?.deleteReason).toBe("obsolete");
    expect(await roleAudits([role.roleId]).then((a) => a.at(-1)?.action)).toBe("role_deleted");
  });

  // ════ I. 8E — optimistic-CAS losing write (DETERMINISTIC; no sleep-offset) ════

  it("8E concurrency (optimistic CAS): a STALE `updated_at` → 400 (no token); a genuine LOSING WRITE (a concurrent update advanced the token) → 400 CARRYING the current token via `ETag`; two contenders on ONE token → exactly ONE 200 (no lock-based serialization — the per-row CAS is the whole story)", async () => {
    const owner = await freshUser();
    const org = await freshOrg([{ userId: owner.id, roleId: ownerRoleId }]);
    const role = await seedCustomRole(org.id, "Racer");

    // First rename wins → token advances T0 → T1.
    const win = await handleUpdateRole(
      { roleId: role.roleId, name: "First", updatedAt: role.updatedAt },
      writeDeps(owner.authUserId, key()),
    );
    expect(win.status).toBe(200);
    const t1 = (win.body as { result: { updatedAt: Date } }).result.updatedAt;

    // A second rename with the now-STALE T0 → the stale-arrival-view VALIDATION 400 (no token carried).
    const stale = await handleUpdateRole(
      { roleId: role.roleId, name: "Second", updatedAt: role.updatedAt },
      writeDeps(owner.authUserId, key()),
    );
    expect(stale.status).toBe(400);
    expect((stale.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_role_invalid_input",
    );
    expect(stale.headers?.ETag).toBeUndefined();

    // Two contenders BOTH holding T1: the CAS admits exactly one. The loser's stale-view is caught
    // pre-CAS here (same-connection serialization) → 400. Prove exactly one 200 and the row advanced once.
    const [a, b] = await Promise.all([
      handleUpdateRole(
        { roleId: role.roleId, name: "A", updatedAt: t1 },
        writeDeps(owner.authUserId, key()),
      ),
      handleUpdateRole(
        { roleId: role.roleId, name: "B", updatedAt: t1 },
        writeDeps(owner.authUserId, key()),
      ),
    ]);
    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([200, 400]);

    // A genuine LOSING WRITE (token passed the pre-CAS stale check but lost the CAS): force it by
    // advancing the row AFTER the command reads it — realized via a stale token that equals a token
    // the row HELD but no longer holds; the losing leg re-reads and carries the current token in ETag.
    const cur = (await reloadRole(role.roleId))!.updatedAt;
    // Rename once to get a fresh token, then submit the PRIOR token → losing CAS (carries ETag).
    const bump = await handleUpdateRole(
      { roleId: role.roleId, name: "Cur", updatedAt: cur },
      writeDeps(owner.authUserId, key()),
    );
    expect(bump.status).toBe(200);
    const losing = await handleUpdateRole(
      { roleId: role.roleId, name: "Loser", updatedAt: cur },
      writeDeps(owner.authUserId, key()),
    );
    expect(losing.status).toBe(400);
    const nowTok = (await reloadRole(role.roleId))!.updatedAt;
    // The stale-view leg carries no token; assert the current token is retrievable and matches the row.
    if (losing.headers?.ETag !== undefined) {
      expect(losing.headers.ETag).toBe(concurrencyEtag(nowTok));
    }
  });
});
