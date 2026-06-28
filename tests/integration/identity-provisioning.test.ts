import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { provisionIdentity } from "../../src/modules/identity/contracts";
import type { AllocateHumanReference } from "../../src/modules/core/contracts";

// WP-1.3 [W1-AUTH-001] verification — the atomic, idempotent lazy first-login provisioning command,
// exercised THROUGH THE M1 CONTRACT (`@/modules/identity/contracts`, the only boundary-legal
// cross-module surface) against local Postgres (no live Supabase; a deterministic stub `auth_user_id`
// stands in for an authenticated Supabase subject). Asserts:
//   (a) provision once → exactly one user + one personal org (is_personal_org=true, valid
//       ORG-YYYY-NNNNNN) + one Owner membership (active), atomically;
//   (b) idempotent — a second call with the same auth_user_id creates nothing;
//   (c) full rollback on a mid-bootstrap failure (no partial identity).
//
// The Module 0 `allocateHumanReference` contract service is INJECTED (the contracts-only DI seam).
// The test stand-in invokes the real M0 DB allocator (`core.allocate_human_ref`) on the SAME
// transaction executor the command hands it — exactly what the production M0 service does
// (Doc-4B §A7) — so the human_ref is genuinely allocated from M0's never-reused sequence and is
// atomic with the org create.

// Deterministic fixture id (a fixed UUIDv7-shaped value — no Math.random; reproducible across runs).
const FIXTURE_AUTH_USER_ID = "01920000-0000-7000-8000-000000000a13";
const FIXTURE_EMAIL = "musa@example.com";

// Faithful test stand-in for the Module 0 `allocateHumanReference` contract service.
const allocateHumanReference: AllocateHumanReference = async (input, executor) => {
  const db = executor ?? prisma;
  const rows = await db.$queryRawUnsafe<{ human_ref: string }[]>(
    "SELECT core.allocate_human_ref($1, $2::integer) AS human_ref",
    input.entityType,
    input.year,
  );
  return { humanRef: rows[0]!.human_ref };
};

async function cleanup(authUserId: string): Promise<void> {
  // Tear down any rows created for this fixture auth_user_id (memberships → orgs → user). Hard-delete
  // is a TEST-ONLY cleanup (production never hard-deletes — Invariant #8); the test DB is ephemeral.
  const user = await prisma.user.findFirst({ where: { authUserId } });
  if (user === null) return;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  const orgIds = [...new Set(memberships.map((m) => m.organizationId))];
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  if (orgIds.length > 0) await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  await prisma.user.deleteMany({ where: { id: user.id } });
}

const ORG_HUMAN_REF_RE = /^ORG-\d{4}-\d{6}$/;

describe("WP-1.3 lazy first-login identity provisioning (via M1 contract)", () => {
  beforeEach(async () => {
    await cleanup(FIXTURE_AUTH_USER_ID);
  });

  afterAll(async () => {
    await cleanup(FIXTURE_AUTH_USER_ID);
    await prisma.$disconnect();
  });

  it("provisions exactly one user + personal org + Owner membership, atomically", async () => {
    const result = await provisionIdentity(
      { authUserId: FIXTURE_AUTH_USER_ID, email: FIXTURE_EMAIL },
      { allocateHumanReference },
    );

    expect(result.created).toBe(true);

    // exactly one user for this auth_user_id
    const users = await prisma.user.findMany({
      where: { authUserId: FIXTURE_AUTH_USER_ID, deletedAt: null },
    });
    expect(users).toHaveLength(1);
    expect(users[0]!.id).toBe(result.userId);

    // exactly one personal org with a valid human_ref
    const memberships = await prisma.membership.findMany({
      where: { userId: result.userId, deletedAt: null },
    });
    expect(memberships).toHaveLength(1);
    const org = await prisma.organization.findUniqueOrThrow({
      where: { id: memberships[0]!.organizationId },
    });
    expect(org.isPersonalOrg).toBe(true);
    expect(org.orgStatus).toBe("active");
    expect(org.humanRef).toMatch(ORG_HUMAN_REF_RE);
    expect(org.id).toBe(result.organizationId);
    expect(org.humanRef).toBe(result.organizationHumanRef);

    // exactly one Owner membership, active, referencing the seeded Owner system-bundle role
    const ownerRole = await prisma.role.findFirstOrThrow({
      where: { name: "Owner", organizationId: null, isSystemBundle: true, deletedAt: null },
    });
    expect(memberships[0]!.roleId).toBe(ownerRole.id);
    expect(memberships[0]!.state).toBe("active");
    expect(memberships[0]!.joinedAt).not.toBeNull();
    expect(memberships[0]!.id).toBe(result.ownerMembershipId);
  });

  it("is idempotent — a second call with the same auth_user_id creates nothing", async () => {
    const first = await provisionIdentity(
      { authUserId: FIXTURE_AUTH_USER_ID, email: FIXTURE_EMAIL },
      { allocateHumanReference },
    );
    expect(first.created).toBe(true);

    const second = await provisionIdentity(
      { authUserId: FIXTURE_AUTH_USER_ID, email: FIXTURE_EMAIL },
      { allocateHumanReference },
    );
    expect(second.created).toBe(false);

    // same identity returned; no duplicate rows
    expect(second.userId).toBe(first.userId);
    expect(second.organizationId).toBe(first.organizationId);
    expect(second.ownerMembershipId).toBe(first.ownerMembershipId);

    expect(
      await prisma.user.count({ where: { authUserId: FIXTURE_AUTH_USER_ID, deletedAt: null } }),
    ).toBe(1);
    expect(
      await prisma.membership.count({ where: { userId: first.userId, deletedAt: null } }),
    ).toBe(1);
    expect(
      await prisma.organization.count({ where: { id: first.organizationId!, deletedAt: null } }),
    ).toBe(1);
  });

  it("rolls back ENTIRELY on a mid-bootstrap failure (no partial identity)", async () => {
    // An allocator that throws AT the org-ref step simulates a mid-bootstrap failure (after the user
    // insert); assert nothing persisted — the whole transaction (incl. the user insert) rolled back.
    const failingAllocate: AllocateHumanReference = async () => {
      throw new Error("simulated mid-bootstrap failure at human_ref allocation");
    };

    await expect(
      provisionIdentity(
        { authUserId: FIXTURE_AUTH_USER_ID, email: FIXTURE_EMAIL },
        { allocateHumanReference: failingAllocate },
      ),
    ).rejects.toThrow(/simulated mid-bootstrap failure/);

    // No partial identity: no user (hence no org/membership) for this auth_user_id.
    expect(await prisma.user.count({ where: { authUserId: FIXTURE_AUTH_USER_ID } })).toBe(0);

    // And a subsequent successful provision still produces a clean single identity.
    const ok = await provisionIdentity(
      { authUserId: FIXTURE_AUTH_USER_ID, email: FIXTURE_EMAIL },
      { allocateHumanReference },
    );
    expect(ok.created).toBe(true);
    expect(
      await prisma.user.count({ where: { authUserId: FIXTURE_AUTH_USER_ID, deletedAt: null } }),
    ).toBe(1);
  });
});
