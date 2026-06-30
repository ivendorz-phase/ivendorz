import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { ensureProvisioned, type AuthSession } from "../../src/server/auth";
import { withActiveOrgContext } from "../../src/server/context";
import { handleUpsertBuyerProfile } from "../../src/server/identity";
import { upsertBuyerProfile } from "../../src/modules/identity/contracts";
import type { UpsertBuyerProfileInput } from "../../src/modules/identity/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";

// D7 — `identity.upsert_buyer_profile.v1` WRITE-vertical conformance slice (Doc-4C §C10). Proves, against
// a REAL PostgreSQL, the full Command → appendAuditRecord() → Repository → Transaction path AND the two
// CTO invariants:
//   • No business write without an audit row.
//   • No audit row without a successful business write (audit atomic with the write — Doc-4B §A10/§17.1).
// The audit action is the canonical Doc-2 §9 / Doc-4C v1.0.2 token: `buyer_profile_created` on create,
// `buyer_profile_updated` on update. The audit READ is staff-only (ESC-W2-AUDIT-RLS), so the test inspects
// audit rows via the superuser `prisma` (RLS-bypassing) connection — the assertion is the row's existence
// + content, exactly as a future staff/compliance reader would see it.

const D7_AUTH_USER_ID = "01920000-0000-7000-8000-0000000007d1";
const D7_EMAIL = "d7-buyer@example.com";

// Hand-built FORBIDDEN fixture ids — full, valid, distinct UUIDv7-shaped literals.
const FB_AUTH_USER_ID = "01920000-0000-7000-8000-0000000007fa";
const FB_USER_ID = "01920000-0000-7000-8000-0000000007f1";
const FB_ORG_ID = "01920000-0000-7000-8000-0000000007f2";
const FB_ROLE_ID = "01920000-0000-7000-8000-0000000007f3";

/** Test-scoped seeded session resolver — stands in for the parked live Supabase round-trip (auth boundary). */
function seededSession(session: AuthSession): () => Promise<AuthSession | null> {
  return async () => session;
}

/** Audit rows for a buyer_profile (read via the superuser connection — audit SELECT is staff-only). */
async function auditRowsFor(buyerProfileId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "buyer_profile", entityId: buyerProfileId },
    orderBy: { eventTime: "asc" },
  });
}

/** Teardown the provisioned identity + its buyer_profile (audit rows are immutable — never deleted). */
async function cleanupProvisioned(authUserId: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { authUserId } });
  if (user === null) return;
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  const orgIds = [...new Set(memberships.map((m) => m.organizationId))];
  if (orgIds.length > 0) {
    await prisma.buyerProfile.deleteMany({ where: { organizationId: { in: orgIds } } });
  }
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  if (orgIds.length > 0) await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  await prisma.user.deleteMany({ where: { id: user.id } });
}

/** Teardown the hand-built forbidden fixture (user + org + non-admin role + membership). */
async function cleanupForbiddenFixture(): Promise<void> {
  await prisma.buyerProfile.deleteMany({ where: { organizationId: FB_ORG_ID } });
  await prisma.membership.deleteMany({ where: { userId: FB_USER_ID } });
  await prisma.role.deleteMany({ where: { id: FB_ROLE_ID } });
  await prisma.organization.deleteMany({ where: { id: FB_ORG_ID } });
  await prisma.user.deleteMany({ where: { id: FB_USER_ID } });
}

describe("D7 — identity.upsert_buyer_profile.v1 write vertical (audit-on-write, real PostgreSQL)", () => {
  beforeEach(async () => {
    await cleanupProvisioned(D7_AUTH_USER_ID);
    await cleanupForbiddenFixture();
  });

  afterAll(async () => {
    await cleanupProvisioned(D7_AUTH_USER_ID);
    await cleanupForbiddenFixture();
    await prisma.$disconnect();
  });

  it("CREATE: absent → 201 + envelope + a `buyer_profile_created` audit row (atomic)", async () => {
    const session: AuthSession = { authUserId: D7_AUTH_USER_ID, email: D7_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const res = await handleUpsertBuyerProfile(
      { industry: "textiles", deliveryLocations: ["Dhaka"] },
      { resolveSession: seededSession(session), ensureProvisioned },
    );

    expect(res.status).toBe(201);
    expect("error" in res.body).toBe(false);
    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    expect(res.body).toHaveProperty("reference_id");
    const buyerProfileId = res.body.result.buyerProfileId;
    expect(buyerProfileId).toMatch(/^[0-9a-f-]{36}$/i);

    // The business row persisted under the active org.
    const row = await prisma.buyerProfile.findFirst({ where: { id: buyerProfileId } });
    expect(row?.organizationId).toBe(orgId);
    expect(row?.industry).toBe("textiles");

    // Exactly ONE audit row, the canonical `buyer_profile_created` action, correctly attributed (Invariant 1).
    const audit = await auditRowsFor(buyerProfileId);
    expect(audit).toHaveLength(1);
    expect(audit[0]!.action).toBe("buyer_profile_created");
    expect(audit[0]!.actorType).toBe("user");
    expect(audit[0]!.actorId).toBe(provisioned.userId);
    expect(audit[0]!.organizationId).toBe(orgId);
    expect(audit[0]!.oldValue).toBeNull(); // create leg: old_value = null
    expect(audit[0]!.newValue).toMatchObject({ industry: "textiles" });
  });

  it("UPDATE: present → 200 + a `buyer_profile_updated` audit row (old/new diff)", async () => {
    const session: AuthSession = { authUserId: D7_AUTH_USER_ID, email: D7_EMAIL };
    await ensureProvisioned(session);

    // Create first.
    const created = await handleUpsertBuyerProfile(
      { industry: "textiles" },
      { resolveSession: seededSession(session), ensureProvisioned },
    );
    if (!("result" in created.body)) throw new Error("unreachable: expected create success");
    const buyerProfileId = created.body.result.buyerProfileId;
    const createdUpdatedAt = created.body.result.updatedAt;

    // Update with the optimistic-concurrency token from the create.
    const updated = await handleUpsertBuyerProfile(
      { industry: "manufacturing", expectedUpdatedAt: createdUpdatedAt },
      { resolveSession: seededSession(session), ensureProvisioned },
    );

    expect(updated.status).toBe(200);
    if (!("result" in updated.body)) throw new Error("unreachable: expected update success");
    expect(updated.body.result.buyerProfileId).toBe(buyerProfileId); // same singleton row

    const row = await prisma.buyerProfile.findFirst({ where: { id: buyerProfileId } });
    expect(row?.industry).toBe("manufacturing");

    // Two audit rows now: created then updated (immutable ledger reflects what actually happened).
    const audit = await auditRowsFor(buyerProfileId);
    expect(audit.map((a) => a.action)).toEqual(["buyer_profile_created", "buyer_profile_updated"]);
    const updateRow = audit[1]!;
    expect(updateRow.oldValue).toMatchObject({ industry: "textiles" }); // prior
    expect(updateRow.newValue).toMatchObject({ industry: "manufacturing" }); // new
  });

  it("CONFLICT: stale optimistic-concurrency token → 409 + NO extra audit row (no write)", async () => {
    const session: AuthSession = { authUserId: D7_AUTH_USER_ID, email: D7_EMAIL };
    await ensureProvisioned(session);

    const created = await handleUpsertBuyerProfile(
      { industry: "textiles" },
      { resolveSession: seededSession(session), ensureProvisioned },
    );
    if (!("result" in created.body)) throw new Error("unreachable: expected create success");
    const buyerProfileId = created.body.result.buyerProfileId;
    const staleToken = created.body.result.updatedAt;

    // Simulate a concurrent update so the stored `updated_at` advances past `staleToken`.
    await prisma.buyerProfile.update({
      where: { id: buyerProfileId },
      data: { industry: "steel" },
    });

    const conflict = await handleUpsertBuyerProfile(
      { industry: "pharma", expectedUpdatedAt: staleToken },
      { resolveSession: seededSession(session), ensureProvisioned },
    );

    expect(conflict.status).toBe(409);
    if (!("error" in conflict.body)) throw new Error("unreachable: expected a conflict error");
    expect(conflict.body.error.error_class).toBe("CONFLICT");
    expect(conflict.body.error.error_code).toBe("identity_buyer_profile_conflict");

    // The conflicting attempt wrote NOTHING — still exactly the create audit (no spurious audit on a rejected write).
    const audit = await auditRowsFor(buyerProfileId);
    expect(audit.map((a) => a.action)).toEqual(["buyer_profile_created"]);
    // And the value was NOT overwritten by the rejected upsert.
    const row = await prisma.buyerProfile.findFirst({ where: { id: buyerProfileId } });
    expect(row?.industry).toBe("steel");
  });

  it("INVARIANT — audit failure rolls back the business write (no row, no audit)", async () => {
    // The load-bearing atomicity proof: inject a FAILING appendAuditRecord. The command appends audit in
    // the SAME tx as the write, so the throw must roll the whole transaction back — leaving NO buyer_profile.
    const session: AuthSession = { authUserId: D7_AUTH_USER_ID, email: D7_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    const failingAppend = (() => {
      return Promise.reject(new Error("audit append failed (injected)"));
    }) as typeof appendAuditRecord;

    await expect(
      withActiveOrgContext(
        { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
        (tx) =>
          upsertBuyerProfile(
            { industry: "textiles" },
            { userId: provisioned.userId, activeOrgId: orgId },
            { appendAuditRecord: failingAppend },
            tx,
          ),
      ),
    ).rejects.toThrow(/audit append failed/);

    // The buyer_profile create was rolled back with the failed audit — NO orphan business write (Invariant 1).
    const row = await prisma.buyerProfile.findFirst({ where: { organizationId: orgId } });
    expect(row).toBeNull();
  });

  it("FORBIDDEN ([ESC-IDN-SLUG] interim): a non-Owner/Director role → 403, no write, no audit", async () => {
    // Hand-built fixture: a user whose active membership role is NOT Owner/Director.
    const userId = FB_USER_ID;
    const orgId = FB_ORG_ID;
    const roleId = FB_ROLE_ID;
    await prisma.user.create({
      data: { id: userId, authUserId: FB_AUTH_USER_ID, status: "active" },
    });
    await prisma.organization.create({
      data: {
        id: orgId,
        humanRef: "ORG-D7TEST-0007F2",
        name: "D7 Forbidden Org",
        slug: "d7-forbidden-org-0007f2",
        orgStatus: "active",
      },
    });
    await prisma.role.create({
      data: { id: roleId, organizationId: orgId, name: "Officer", isSystemBundle: false },
    });
    await prisma.membership.create({
      data: { id: uuidv7(), userId, organizationId: orgId, roleId, state: "active" },
    });

    const outcome = await withActiveOrgContext(
      { userId, activeOrgId: orgId, isPlatformStaff: false },
      (tx) =>
        upsertBuyerProfile(
          { industry: "textiles" },
          { userId, activeOrgId: orgId },
          { appendAuditRecord },
          tx,
        ),
    );

    expect(outcome.ok).toBe(false);
    if (outcome.ok) throw new Error("unreachable: expected an authorization failure");
    expect(outcome.error.errorClass).toBe("AUTHORIZATION");
    expect(outcome.error.errorCode).toBe("identity_buyer_profile_forbidden");

    // No buyer_profile, no audit — authorization rejected before any write.
    const row = await prisma.buyerProfile.findFirst({ where: { organizationId: orgId } });
    expect(row).toBeNull();
  });

  it("VALIDATION: malformed input → 400 (before any write)", async () => {
    const session: AuthSession = { authUserId: D7_AUTH_USER_ID, email: D7_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const orgId = provisioned.organizationId!;

    // `industry` as a number is a SYNTAX violation (Doc-4C §B.4). Cast past the typed input to reach it.
    const badInput = { industry: 123 } as unknown as UpsertBuyerProfileInput;

    const outcome = await withActiveOrgContext(
      { userId: provisioned.userId, activeOrgId: orgId, isPlatformStaff: false },
      (tx) =>
        upsertBuyerProfile(
          badInput,
          { userId: provisioned.userId, activeOrgId: orgId },
          { appendAuditRecord },
          tx,
        ),
    );

    expect(outcome.ok).toBe(false);
    if (outcome.ok) throw new Error("unreachable: expected a validation failure");
    expect(outcome.error.errorClass).toBe("VALIDATION");
    expect(outcome.error.errorCode).toBe("identity_buyer_profile_invalid_input");

    const row = await prisma.buyerProfile.findFirst({ where: { organizationId: orgId } });
    expect(row).toBeNull();
  });
});
