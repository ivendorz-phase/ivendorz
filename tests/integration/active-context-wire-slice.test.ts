import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import type { ensureProvisioned } from "../../src/server/auth";
import { resolveActiveOrg } from "../../src/server/context";
import {
  handleGetActiveContext,
  handleListMyOrganizations,
  handleSwitchActiveOrganization,
} from "../../src/server/identity";

// W2-IDN-6.6 — the §C8 Context / Active-Organization WIRED surface (Doc-5C §6.1 rows 29–31, all 3
// contracts), Doc-8 bands 8C + 8E:
//   8C — envelope (Doc-5A §5.6/§6.1) · the frozen §C8 registers per contract (PassB:536/:549/:560) ·
//   idempotency (the switch is idempotent BY NATURE — replay → same context, NO side effect / NO store /
//   NO audit, PassB:538/:539) · actor-scope (self / active-org) · non-disclosure (byte-identical 404
//   collapse on non-member/absent; self-only reads never leak another user's context/orgs) ·
//   fail-closed pagination (ESC-IDN-LIST-PAGESIZE).
//   8E — THE GATE (RV-0150 OBS-B1): a suspended org → DENY through the LIVE path (the `switch` — §C8
//   BUSINESS "org not suspended", PassB:535), discriminating-tested, fail-closed, nothing persisted.
//   soft-deleted collapses to NOT_FOUND (non-disclosure); suspended is BUSINESS (surfaced to a party);
//   only an ACTIVE membership permits the switch. FLAG: the packet's ADDITIONAL "downstream resolveActiveOrg
//   must deny a suspended org" obligation CONFLICTS with the frozen §3.3 (general context = active
//   membership) + §C5 (soft_delete needs active-org context on a SUSPENDED org) — escalated as
//   `[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]`; the generic resolver stays membership-only (see the FROZEN-FAITHFUL
//   test below). The switch discharges the review-log OBS-B1 discriminating-test obligation.
// All vs REAL PostgreSQL through the composition surfaces ONLY (never module internals).

// ── Deterministic fixtures (UUIDv7-shaped; 0xd66 = W2-IDN-6.6). ──
let ownerRoleId: string;
let managerRoleId: string;

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
const key = () => `iv-k66-${uuidv7()}`;

const createdOrgIds: string[] = [];
const createdUserIds: string[] = [];

async function freshUser() {
  const id = uuidv7();
  const authUserId = uuidv7();
  await prisma.user.create({
    data: { id, authUserId, email: `d66-${id.slice(-12)}@ctx.example`, status: "active" },
  });
  createdUserIds.push(id);
  return { id, authUserId };
}

/** Mint a fresh org (direct seed — NOT via the wire) with the given members + org status. */
async function freshOrg(params: {
  tag?: string;
  status?: "active" | "suspended" | "soft_deleted";
  deleted?: boolean;
  members?: Array<{
    userId: string;
    roleId: string;
    state?: "active" | "suspended" | "invited" | "pending" | "removed";
    joinedAt?: Date;
    deleted?: boolean;
  }>;
}) {
  const id = uuidv7();
  const humanRef = `ORG-D66-${id.slice(-8)}`;
  await prisma.organization.create({
    data: {
      id,
      humanRef,
      name: `${params.tag ?? "Org"} ${id.slice(-4)}`,
      slug: humanRef.toLowerCase(),
      orgStatus: params.status ?? "active",
      isPersonalOrg: false,
      ...(params.deleted ? { deletedAt: new Date() } : {}),
    },
  });
  createdOrgIds.push(id);
  const members: Array<{ membershipId: string }> = [];
  for (const m of params.members ?? []) {
    const mid = uuidv7();
    await prisma.membership.create({
      data: {
        id: mid,
        organizationId: id,
        userId: m.userId,
        roleId: m.roleId,
        state: m.state ?? "active",
        joinedAt: m.joinedAt ?? new Date(),
        ...(m.deleted ? { deletedAt: new Date() } : {}),
      },
    });
    members.push({ membershipId: mid });
  }
  return { id, humanRef };
}

/** The seeded system-bundle tenant slugs for a role (what `check_permission` resolves — the
 *  effective_permission_summary oracle; NULL-org bundle rows + tenant space). */
async function grantedTenantSlugs(roleId: string): Promise<string[]> {
  const rows = await prisma.rolePermission.findMany({
    where: { roleId, organizationId: null, permission: { space: "tenant" } },
    select: { permission: { select: { slug: true } } },
  });
  return rows.map((r) => r.permission.slug).sort();
}

const switchDeps = (auth: string, k: string | null | undefined) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
  idempotencyKey: k === undefined ? key() : k,
});
const readDeps = (auth: string) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
});

describe("W2-IDN-6.6 §C8 context / active-org wired surface — 8C + 8E (real PostgreSQL)", () => {
  beforeAll(async () => {
    for (const [name, setter] of [
      ["Owner", (id: string) => (ownerRoleId = id)],
      ["Manager", (id: string) => (managerRoleId = id)],
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
  });

  afterAll(async () => {
    await prisma.membership.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8C — switch_active_organization
  // ─────────────────────────────────────────────────────────────────────────

  it("switch → 200 with the server-validated org id (active member of an active org)", async () => {
    const u = await freshUser();
    const org = await freshOrg({
      tag: "SwitchOK",
      members: [{ userId: u.id, roleId: ownerRoleId }],
    });

    const res = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, key()),
    );
    expect(res.status).toBe(200);
    expect(strip(res.body)).toEqual({ result: { organizationId: org.id } });
    expect((res.body as { reference_id: string }).reference_id).toBeTruthy();
  });

  it("switch → 401 when unauthenticated (auth-boundary, pre-contract)", async () => {
    const res = await handleSwitchActiveOrganization(
      { organizationId: uuidv7() },
      { resolveSession: async () => null, ensureProvisioned: noProvision, idempotencyKey: key() },
    );
    expect(res.status).toBe(401);
  });

  it("switch → 400 identity_context_invalid_input when the Idempotency-Key is absent (mandatory)", async () => {
    const u = await freshUser();
    const org = await freshOrg({ tag: "NoKey", members: [{ userId: u.id, roleId: ownerRoleId }] });
    const res = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, null),
    );
    expect(res.status).toBe(400);
    expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_context_invalid_input",
    );
  });

  it("switch → 400 identity_context_invalid_input on a malformed organization_id", async () => {
    const u = await freshUser();
    const res = await handleSwitchActiveOrganization(
      { organizationId: "not-a-uuid" },
      switchDeps(u.authUserId, key()),
    );
    expect(res.status).toBe(400);
    expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_context_invalid_input",
    );
  });

  it("switch → 404 collapse when the caller is NOT a member (non-disclosure)", async () => {
    const u = await freshUser();
    // A real, active org the caller has NO membership in (owned by someone else).
    const other = await freshUser();
    const org = await freshOrg({
      tag: "Foreign",
      members: [{ userId: other.id, roleId: ownerRoleId }],
    });

    const res = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, key()),
    );
    expect(res.status).toBe(404);
    expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_context_not_found",
    );

    // Byte-identical to switching to a purely nonexistent org (no existence oracle).
    const nonexistent = await handleSwitchActiveOrganization(
      { organizationId: uuidv7() },
      switchDeps(u.authUserId, key()),
    );
    expect(strip(wireJson(nonexistent.body))).toEqual(strip(wireJson(res.body)));
  });

  it("switch → 404 when the caller's membership in the target is NON-active (only active permits)", async () => {
    const u = await freshUser();
    // active org, but the caller's membership is `suspended` (not active) — §C8 "only an active membership".
    const org = await freshOrg({
      tag: "InactiveMember",
      members: [{ userId: u.id, roleId: ownerRoleId, state: "suspended" }],
    });
    const res = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, key()),
    );
    expect(res.status).toBe(404);
    expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_context_not_found",
    );
  });

  it("switch is IDEMPOTENT BY NATURE — same key twice → byte-identical result, ZERO side effect", async () => {
    const u = await freshUser();
    const org = await freshOrg({ tag: "Idem", members: [{ userId: u.id, roleId: ownerRoleId }] });
    const k = key();

    const auditBefore = await prisma.auditRecord.count();
    const dedupBefore = await prisma.commandDedup.count();

    const r1 = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, k),
    );
    const r2 = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, k),
    );
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    // Same context both times (the frozen "replay → same context"); the org id is identical.
    expect(strip(wireJson(r1.body))).toEqual({ result: { organizationId: org.id } });
    expect(strip(wireJson(r2.body))).toEqual({ result: { organizationId: org.id } });

    // NO side effect (frozen State Effects: none · Audit: no · no §B.6 store): audit + dedup unchanged.
    expect(await prisma.auditRecord.count()).toBe(auditBefore);
    expect(await prisma.commandDedup.count()).toBe(dedupBefore);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8C — get_active_context
  // ─────────────────────────────────────────────────────────────────────────

  it("get_active_context → 200 with the frozen projection (org id + membership + permission summary)", async () => {
    const u = await freshUser();
    const org = await freshOrg({ tag: "Ctx", members: [{ userId: u.id, roleId: ownerRoleId }] });

    const res = await handleGetActiveContext(readDeps(u.authUserId));
    expect(res.status).toBe(200);
    const result = (res.body as unknown as { result: Record<string, unknown> }).result;
    expect(result.organizationId).toBe(org.id);
    expect(result.membership).toEqual({ state: "active", roleId: ownerRoleId });
    // effective_permission_summary = the SAME granted tenant slugs check_permission resolves (not re-derived).
    expect(result.effectivePermissionSummary).toEqual(await grantedTenantSlugs(ownerRoleId));
    // The EXACT frozen field set — no widened field.
    expect(Object.keys(result).sort()).toEqual([
      "effectivePermissionSummary",
      "membership",
      "organizationId",
    ]);
  });

  it("get_active_context → 401 unauthenticated · 404 when no active context", async () => {
    const anon = await handleGetActiveContext({
      resolveSession: async () => null,
      ensureProvisioned: noProvision,
    });
    expect(anon.status).toBe(401);

    // A user with NO active membership anywhere → no active context → 404.
    const u = await freshUser();
    const res = await handleGetActiveContext(readDeps(u.authUserId));
    expect(res.status).toBe(404);
    expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_context_not_found",
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8C — list_my_organizations
  // ─────────────────────────────────────────────────────────────────────────

  it("list → 200 the caller's own orgs, sorted by name; SELF-scoped (never another user's)", async () => {
    const u = await freshUser();
    // Two orgs, seeded names out of sort order to prove the server-fixed name ordering.
    const orgZ = await freshOrg({ tag: "ZZZ", members: [{ userId: u.id, roleId: managerRoleId }] });
    const orgA = await freshOrg({ tag: "AAA", members: [{ userId: u.id, roleId: ownerRoleId }] });
    // Another user's org — must NEVER appear in u's list.
    const other = await freshUser();
    await freshOrg({ tag: "Other", members: [{ userId: other.id, roleId: ownerRoleId }] });

    const res = await handleListMyOrganizations({}, readDeps(u.authUserId));
    expect(res.status).toBe(200);
    const items = (
      res.body as { result: { items: Array<{ organizationId: string; name: string }> } }
    ).result.items;
    const ids = items.map((i) => i.organizationId);
    expect(ids).toEqual([orgA.id, orgZ.id]); // AAA before ZZZ (name asc); other user's org absent
    expect(items[0]).toMatchObject({
      organizationId: orgA.id,
      roleId: ownerRoleId,
      membershipState: "active",
    });
  });

  it("list state_filter — `active` (default) excludes non-active memberships; `all` includes them", async () => {
    const u = await freshUser();
    const active = await freshOrg({
      tag: "P-active",
      members: [{ userId: u.id, roleId: ownerRoleId }],
    });
    const suspended = await freshOrg({
      tag: "Q-suspendedMember",
      members: [{ userId: u.id, roleId: managerRoleId, state: "suspended" }],
    });

    const def = await handleListMyOrganizations({}, readDeps(u.authUserId));
    const defIds = (
      def.body as { result: { items: Array<{ organizationId: string }> } }
    ).result.items
      .map((i) => i.organizationId)
      .filter((id) => id === active.id || id === suspended.id);
    expect(defIds).toEqual([active.id]); // suspended MEMBERSHIP excluded by default

    const all = await handleListMyOrganizations({ stateFilter: "all" }, readDeps(u.authUserId));
    const allIds = (
      all.body as { result: { items: Array<{ organizationId: string }> } }
    ).result.items
      .map((i) => i.organizationId)
      .filter((id) => id === active.id || id === suspended.id)
      .sort();
    expect(allIds).toEqual([active.id, suspended.id].sort()); // `all` includes the suspended membership
  });

  it("list → 400 (fail-closed) on page_size / cursor / sort, and on a bad state_filter (ESC-IDN-LIST-PAGESIZE)", async () => {
    const u = await freshUser();
    await freshOrg({ tag: "Pag", members: [{ userId: u.id, roleId: ownerRoleId }] });
    for (const bad of [
      { pageSize: "10" },
      { cursor: "x" },
      { sort: "name" },
      { stateFilter: "bogus" },
    ]) {
      const res = await handleListMyOrganizations(bad, readDeps(u.authUserId));
      expect(res.status).toBe(400);
      expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
        "identity_context_invalid_input",
      );
    }
  });

  it("list → 401 unauthenticated", async () => {
    const res = await handleListMyOrganizations(
      {},
      { resolveSession: async () => null, ensureProvisioned: noProvision },
    );
    expect(res.status).toBe(401);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 8E — THE GATE (RV-0150 OBS-B1): suspended-org denial through the LIVE path
  // ─────────────────────────────────────────────────────────────────────────

  it("GATE: switch to a SUSPENDED org (active member) → 422 BUSINESS state_invalid, nothing persisted", async () => {
    const u = await freshUser();
    const org = await freshOrg({
      tag: "Suspended",
      status: "suspended",
      members: [{ userId: u.id, roleId: ownerRoleId }],
    });
    const auditBefore = await prisma.auditRecord.count();

    const res = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, key()),
    );
    expect(res.status).toBe(422);
    expect(
      (res.body as { error: { error_code: string; error_class: string } }).error,
    ).toMatchObject({
      error_code: "identity_context_state_invalid",
      error_class: "BUSINESS",
    });
    // Nothing persisted: org status unchanged; no audit row.
    const after = await prisma.organization.findUniqueOrThrow({ where: { id: org.id } });
    expect(after.orgStatus).toBe("suspended");
    expect(await prisma.auditRecord.count()).toBe(auditBefore);
  });

  it("FROZEN-FAITHFUL (downstream): the GENERAL context resolution does NOT gate org_status (§3.3 / §C5)", async () => {
    // FLAG-AND-HALT boundary (`[ESC-IDN-CTX-SUSPENDED-DOWNSTREAM]`, W2-IDN-6.6 Handoff Note): the packet's
    // "downstream resolveActiveOrg must deny a suspended org" obligation CONFLICTS with the frozen corpus.
    // Doc-5C §3.3 makes the GENERAL active-org predicate ACTIVE MEMBERSHIP only; Doc-4C §C5
    // `soft_delete_organization` (STATE `active|suspended → soft_deleted`) REQUIRES active-org context on a
    // SUSPENDED org. Gating org_status in `resolveActiveOrg` breaks that frozen lifecycle edge (proven — it
    // reddened the W2-IDN-6.2 soft-delete-from-suspended test). So the org-status precondition is enforced
    // by the SWITCH ONLY (§C8 BUSINESS, above); the generic resolver stays membership-only.
    const u = await freshUser();
    const org = await freshOrg({
      tag: "SuspendedCtx",
      members: [{ userId: u.id, roleId: ownerRoleId }],
    });

    // Baseline (active): the context resolves.
    expect((await resolveActiveOrg({ authUserId: u.authUserId })).resolved).toBe(true);
    expect((await handleGetActiveContext(readDeps(u.authUserId))).status).toBe(200);

    // Suspend the org. The GENERAL resolution STILL resolves it (active membership) — this is the
    // §3.3/§C5-required behavior, NOT a leak of business access (which the switch + the owning business
    // modules gate). get_active_context is a self-read of the caller's own context.
    await prisma.organization.update({ where: { id: org.id }, data: { orgStatus: "suspended" } });
    const resolve = await resolveActiveOrg({ authUserId: u.authUserId });
    expect(resolve.resolved).toBe(true); // membership-only predicate — org_status NOT gated here
    const ctx = await handleGetActiveContext(readDeps(u.authUserId));
    expect(ctx.status).toBe(200);

    // But the SWITCH still refuses to ADOPT the suspended org as active context (§C8 — the enforcement point).
    const sw = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, key()),
    );
    expect(sw.status).toBe(422);
  });

  it("GATE (non-disclosure): switch to a SOFT-DELETED org collapses to 404, NOT the 422 BUSINESS leg", async () => {
    const u = await freshUser();
    // Org soft-deleted; its membership cascade-tombstoned (deleted_at) — the frozen §5.1 cascade shape.
    const org = await freshOrg({
      tag: "SoftDeleted",
      status: "soft_deleted",
      deleted: true,
      members: [{ userId: u.id, roleId: ownerRoleId, deleted: true }],
    });
    const res = await handleSwitchActiveOrganization(
      { organizationId: org.id },
      switchDeps(u.authUserId, key()),
    );
    // A soft-deleted org is non-disclosable to a would-be member → the NOT_FOUND collapse (never 422,
    // which would reveal the org exists-but-suspended).
    expect(res.status).toBe(404);
    expect((res.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_context_not_found",
    );
  });
});
