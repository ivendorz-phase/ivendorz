import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, describe, expect, it } from "vitest";
import { ensureProvisioned, type AuthSession } from "../../src/server/auth";
import { loadActiveOrgGrowthHub } from "../../src/server/billing";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// Growth Hub P2 Lane C — the `/account/rewards` server-rendered DATA face
// (`loadActiveOrgGrowthHub`, Doc-7E_GrowthHub_Patch_v1.0.1 §2(a)): the WP-1.6 composition over the
// frozen BC-BILL-6 reads (`get_reward_balance` + `list_referrals`) + the §3 CTA-gating slug
// (`can_manage_growth_invites`). Shared-Postgres hygiene: FULL uuidv7 fixtures; assertions scoped
// to fixture-owned rows — never global counts.

/** A fresh provisioned subject (personal-org Owner) + its session. */
async function provisionedSubject(): Promise<{ session: AuthSession; organizationId: string }> {
  const session: AuthSession = {
    authUserId: uuidv7(),
    email: `growth-hub-face-${uuidv7()}@example.com`,
  };
  const provisioned = await ensureProvisioned(session);
  expect(provisioned.organizationId).not.toBeNull();
  return { session, organizationId: provisioned.organizationId as string };
}

async function seedReferral(
  referrerOrganizationId: string,
  state: "pending" | "qualified" | "rewarded",
  createdAt: Date,
  referredOrganizationId: string | null,
): Promise<string> {
  const id = uuidv7();
  await prisma.referral.create({
    data: {
      id,
      referrerOrganizationId,
      state,
      createdAt,
      ...(referredOrganizationId !== null ? { referredOrganizationId } : {}),
    },
  });
  return id;
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe("loadActiveOrgGrowthHub — the Growth Hub server DATA face (Doc-7E v1.0.1 §2(a))", () => {
  it("returns { authenticated: false } when no session resolves (pre-contract)", async () => {
    const outcome = await loadActiveOrgGrowthHub({
      resolveSession: async () => null,
      ensureProvisioned,
    });
    expect(outcome).toEqual({ authenticated: false });
  });

  it("resolves zero-state wired reads for a fresh org (balance 0, no referrals, CTA slug held by the Owner)", async () => {
    const { session } = await provisionedSubject();

    const outcome = await loadActiveOrgGrowthHub({
      resolveSession: async () => session,
      ensureProvisioned,
    });

    expect(outcome.authenticated).toBe(true);
    if (!outcome.authenticated) return;
    expect(outcome.access).toBe("ok");
    if (outcome.access !== "ok") return;
    expect(outcome.balance).toBe(0); // no reward account yet — the frozen 0-balance leg
    expect(outcome.referrals).toEqual([]);
    expect(outcome.referralsTruncated).toBe(false);
    // §3: the personal-org Owner is in the O/D/M `can_manage_growth_invites` bundle.
    expect(outcome.canManageGrowthInvites).toBe(true);
  });

  it("surfaces the seeded balance + referrals (newest first, opaque refs, frozen states) for the ACTIVE org only", async () => {
    const { session, organizationId } = await provisionedSubject();
    const otherOrg = uuidv7();

    await prisma.rewardAccount.create({
      data: { id: uuidv7(), organizationId, balance: 900 },
    });
    const referred = uuidv7();
    const older = await seedReferral(
      organizationId,
      "rewarded",
      new Date("2026-01-01T00:00:00.000Z"),
      referred,
    );
    const newer = await seedReferral(
      organizationId,
      "pending",
      new Date("2026-02-01T00:00:00.000Z"),
      null,
    );
    // A foreign org's referral — must NEVER surface (own-org reads only, ER8).
    const foreign = await seedReferral(
      otherOrg,
      "qualified",
      new Date("2026-03-01T00:00:00.000Z"),
      uuidv7(),
    );

    const outcome = await loadActiveOrgGrowthHub({
      resolveSession: async () => session,
      ensureProvisioned,
    });

    expect(outcome.authenticated).toBe(true);
    if (!outcome.authenticated) return;
    expect(outcome.access).toBe("ok");
    if (outcome.access !== "ok") return;

    expect(outcome.balance).toBe(900);
    expect(outcome.referrals.map((r) => r.referralId)).toEqual([newer, older]);
    expect(outcome.referrals[0]).toEqual({
      referralId: newer,
      referredOrganizationId: null, // nullable — an unresolved referred org renders "—"
      state: "pending",
    });
    expect(outcome.referrals[1].referredOrganizationId).toBe(referred);
    expect(outcome.referrals.map((r) => r.referralId)).not.toContain(foreign);
    expect(outcome.referralsTruncated).toBe(false);
  });
});
