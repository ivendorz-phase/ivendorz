import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { createHash } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { resolveInvitationToken } from "@/modules/identity/contracts";
import { handleInviteIngress, INVITE_LANDING_PATH } from "@/server/auth/invite-ingress";
import { INVITE_TOKEN_COOKIE_NAME } from "@/server/auth/invite-token-cookie";
import { ensureProvisioned } from "../../src/server/auth";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// P2-A4 (3) — the row-37 anti-oracle resolve (Doc-4C v1.0.3 §C13; Doc-5C v1.0.1 G-1/G-2) + the
// P2-A2 URL-redacting `/invite` ingress (Doc-5C G-6 / Doc-7E §3 token hygiene). Boundary-legal:
// contracts + `src/server` (composition edge) + `src/shared/*` only. FULL uuidv7 fixture values;
// assertions scoped to fixture rows (shared-DB residue tolerated). Raw fixture tokens exist only
// in test memory/assertions — never logged.

const CAMPAIGN_KEY = "referral" as const;

async function seedReferrerOrg(): Promise<string> {
  const provisioned = await ensureProvisioned({
    authUserId: uuidv7(),
    email: `landing-referrer-${uuidv7()}@example.com`,
  });
  expect(provisioned.organizationId).not.toBeNull();
  return provisioned.organizationId as string;
}

async function seedInvitation(
  referrerOrganizationId: string,
  overrides: { state?: "issued" | "revoked"; expiresAt?: Date } = {},
): Promise<{ id: string; token: string }> {
  const token = `ivz_inv_test_${uuidv7()}`;
  const id = uuidv7();
  await prisma.growthInvitation.create({
    data: {
      id,
      referrerOrganizationId,
      campaignKey: CAMPAIGN_KEY,
      recipientType: "link",
      recipientIdentifier: null,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      maxRedemptions: null,
      state: overrides.state ?? "issued",
      expiresAt: overrides.expiresAt ?? new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });
  return { id, token };
}

describe("P2 landing: row-37 anti-oracle resolve + /invite URL-redacting ingress", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("unknown vs expired vs revoked → BYTE-IDENTICAL invalid shape (no state oracle)", async () => {
    const referrerOrgId = await seedReferrerOrg();
    const { token: expiredToken } = await seedInvitation(referrerOrgId, {
      expiresAt: new Date(Date.now() - 60_000),
    });
    const { token: revokedToken } = await seedInvitation(referrerOrgId, { state: "revoked" });
    const unknownToken = `ivz_inv_test_${uuidv7()}`; // never seeded

    const unknown = await resolveInvitationToken({ token: unknownToken });
    const expired = await resolveInvitationToken({ token: expiredToken });
    const revoked = await resolveInvitationToken({ token: revokedToken });

    // One indistinguishable shape across every non-live cause (Doc-5C G-1).
    expect(unknown).toEqual({ valid: false });
    expect(expired).toEqual({ valid: false });
    expect(revoked).toEqual({ valid: false });
    expect(JSON.stringify(expired)).toBe(JSON.stringify(unknown));
    expect(JSON.stringify(revoked)).toBe(JSON.stringify(unknown));
    // No extra keys leak on any branch (no `invitation_state`, no referrer/recipient facts).
    expect(Object.keys(unknown)).toEqual(["valid"]);
    expect(Object.keys(expired)).toEqual(["valid"]);
    expect(Object.keys(revoked)).toEqual(["valid"]);
  });

  it("valid token → campaign framing ONLY (no referrer identity / recipient leakage)", async () => {
    const referrerOrgId = await seedReferrerOrg();
    const { token } = await seedInvitation(referrerOrgId);

    const result = await resolveInvitationToken({ token });
    expect(result.valid).toBe(true);
    expect(result.campaignKey).toBe(CAMPAIGN_KEY);
    // EXACTLY the public-safe fields — never the referrer org/identity, never recipient facts,
    // never token material (Q-4 default-anonymous; GI-3).
    expect(Object.keys(result).sort()).toEqual(["campaignKey", "valid"]);
    const serialized = JSON.stringify(result);
    expect(serialized.includes(referrerOrgId)).toBe(false);
    expect(serialized.includes(token)).toBe(false);
  });

  it("/invite ingress: HttpOnly cookie carriage + redirect to a TOKEN-FREE landing URL", async () => {
    const rawToken = `ivz_inv_test_${uuidv7()}`;
    const response = handleInviteIngress(
      new Request(`https://ivendorz.example/invite?token=${rawToken}`),
    );

    expect(response.status).toBe(303);
    const location = response.headers.get("location");
    expect(location).not.toBeNull();
    expect(location!).toBe(`https://ivendorz.example${INVITE_LANDING_PATH}`);
    expect(location!.includes(rawToken)).toBe(false); // the resting URL is token-free
    expect(location!.includes("token=")).toBe(false);
    expect(response.headers.get("cache-control")).toBe("no-store");

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).not.toBeNull();
    expect(setCookie!.includes(`${INVITE_TOKEN_COOKIE_NAME}=${rawToken}`)).toBe(true);
    expect(setCookie!.toLowerCase()).toContain("httponly"); // no client JS may read it
    expect(setCookie!.toLowerCase()).toContain("samesite=lax");
    expect(setCookie!.toLowerCase()).toContain("path=/");
    expect(setCookie!.toLowerCase()).toContain("max-age="); // bounded carriage
  });

  it("/invite ingress with NO token: same token-free redirect, no carriage cookie written", async () => {
    const response = handleInviteIngress(new Request("https://ivendorz.example/invite"));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`https://ivendorz.example${INVITE_LANDING_PATH}`);
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
