import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { createHash } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import {
  allocateHumanReference,
  appendAuditRecord,
  writeOutboxEvent,
} from "@/modules/core/contracts";
import { INVITATION_CONVERTED_EVENT, provisionIdentity } from "@/modules/identity/contracts";
import { ensureProvisioned } from "../../src/server/auth";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// P2-A4 (1) — the §PROV-EXT attribution seam (Doc-4C v1.0.3 §PROV-EXT; provision-identity command).
// Boundary-legal: imports only `@/modules/*/contracts`, `src/server` (composition edge) and
// `src/shared/*` — never a module internal. Shared-Postgres hygiene: FULL uuidv7 fixture values
// (never sliced); assertions are scoped to fixture-owned rows (append-only residue tolerated —
// never a global count / page-1 assertion). The raw fixture tokens exist only in test memory and
// assertions — they are never logged.
//
// Asserts (per the folded §PROV-EXT):
//   (a) valid live token → GI-1 bind: `invitation_conversions` row at `registered`,
//       `InvitationConverted` outbox row (the six snake_case fields + stamped envelope), and the
//       `invitation_converted` audit record with the frozen §9 `new_value` pin.
//   (b) expired / revoked / unknown token → provisioning still succeeds; NO conversion/outbox/audit.
//   (c) capacity-exhausted invitation → no bind; registration succeeds; counter untouched.
//   (d) deps-absent → the dep-guard skips the bind fail-closed; registration succeeds.

const CAMPAIGN_KEY = "referral" as const; // the corpus-grounded MVP campaign key (Doc-7E §2(a))

/** Provision a fresh referrer identity (personal org = the referrer org). */
async function seedReferrerOrg(): Promise<string> {
  const provisioned = await ensureProvisioned({
    authUserId: uuidv7(),
    email: `referrer-${uuidv7()}@example.com`,
  });
  expect(provisioned.organizationId).not.toBeNull();
  return provisioned.organizationId as string;
}

interface SeedInvitationOverrides {
  state?: "issued" | "expired" | "revoked";
  expiresAt?: Date;
  maxRedemptions?: number | null;
  redemptionCount?: number;
}

/** Seed one `identity.growth_invitations` row directly (test fixture; superuser connection).
 *  Only sha256(token) is persisted — the raw token exists in test memory alone (GI-2 parity). */
async function seedInvitation(
  referrerOrganizationId: string,
  overrides: SeedInvitationOverrides = {},
): Promise<{ id: string; token: string }> {
  const token = `ivz_inv_test_${uuidv7()}`; // FULL uuid — shared-DB uniqueness rule
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const id = uuidv7();
  await prisma.growthInvitation.create({
    data: {
      id,
      referrerOrganizationId,
      campaignKey: CAMPAIGN_KEY,
      recipientType: "link", // open invite — no delivery-ref/InvitationIssued legs in scope here
      recipientIdentifier: null,
      tokenHash,
      maxRedemptions: overrides.maxRedemptions ?? null,
      redemptionCount: overrides.redemptionCount ?? 0,
      state: overrides.state ?? "issued",
      expiresAt: overrides.expiresAt ?? new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });
  return { id, token };
}

/** The full concrete dep set (the P2-A3 composition parity). */
const fullDeps = { allocateHumanReference, writeOutboxEvent, appendAuditRecord };

function freshSubject(): { authUserId: string; email: string } {
  return { authUserId: uuidv7(), email: `referred-${uuidv7()}@example.com` };
}

describe("P2 §PROV-EXT attribution (provision-identity)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("valid token → conversion at `registered` + InvitationConverted outbox row + the frozen audit pin", async () => {
    const referrerOrgId = await seedReferrerOrg();
    const { id: invitationId, token } = await seedInvitation(referrerOrgId);

    const result = await provisionIdentity({ ...freshSubject(), referralToken: token }, fullDeps);
    expect(result.created).toBe(true);
    expect(result.organizationId).not.toBeNull();

    // (1) The conversion bind — ONE append-only row at `registered` (the collapsed insert path).
    const conversion = await prisma.invitationConversion.findFirst({
      where: { growthInvitationId: invitationId },
    });
    expect(conversion).not.toBeNull();
    expect(conversion!.state).toBe("registered");
    expect(conversion!.referrerOrganizationId).toBe(referrerOrgId);
    expect(conversion!.referredOrganizationId).toBe(result.organizationId);
    expect(conversion!.registeredAt).not.toBeNull();

    // (2) GI-1 counter incremented exactly once.
    const invitation = await prisma.growthInvitation.findUnique({ where: { id: invitationId } });
    expect(invitation!.redemptionCount).toBe(1);
    expect(invitation!.state).toBe("issued");

    // (3) The `InvitationConverted` outbox envelope — the SIX declared snake_case fields
    //     (Doc-2 v1.0.10 §4 / Doc-4J v1.0.1) + the producer-stamped envelope fields; no token,
    //     no recipient identifier (GI-3).
    const outboxRow = await prisma.outboxEvent.findFirst({
      where: { eventName: INVITATION_CONVERTED_EVENT.name, aggregateId: invitationId },
    });
    expect(outboxRow).not.toBeNull();
    expect(outboxRow!.eventVersion).toBe(INVITATION_CONVERTED_EVENT.version);
    expect(outboxRow!.status).toBe("pending");
    const payload = outboxRow!.payloadJsonb as Record<string, unknown>;
    expect(payload["conversion_id"]).toBe(conversion!.id);
    expect(payload["growth_invitation_id"]).toBe(invitationId);
    expect(payload["campaign_key"]).toBe(CAMPAIGN_KEY);
    expect(payload["recipient_type"]).toBe("link");
    expect(payload["referrer_organization_id"]).toBe(referrerOrgId);
    expect(payload["referred_organization_id"]).toBe(result.organizationId);
    expect(payload["event_id"]).toBe(outboxRow!.id); // envelope wins — stamped, not caller-authored
    expect(typeof payload["occurred_at"]).toBe("string");
    expect(payload["token"]).toBeUndefined();
    expect(payload["recipient_identifier"]).toBeUndefined();

    // (4) The §PROV-EXT audit record — entity_type `invitation_conversions` (the folded §9 table
    //     literal), action `invitation_converted`, User-attributed, and the FROZEN `new_value`
    //     pin {growth_invitation_id, referred_organization_id, state} VERBATIM (Doc-4C v1.0.3 §9).
    const audit = await prisma.auditRecord.findFirst({
      where: { entityType: "invitation_conversions", entityId: conversion!.id },
    });
    expect(audit).not.toBeNull();
    expect(audit!.action).toBe("invitation_converted");
    expect(audit!.actorType).toBe("user");
    expect(audit!.actorId).toBe(result.userId);
    expect(audit!.organizationId).toBe(referrerOrgId);
    expect(audit!.oldValue).toBeNull();
    expect(audit!.newValue).toEqual({
      growth_invitation_id: invitationId,
      referred_organization_id: result.organizationId,
      state: "registered",
    });
  });

  it("expired token → fail-open: registration succeeds with NO conversion/outbox/audit rows", async () => {
    const referrerOrgId = await seedReferrerOrg();
    const { id: invitationId, token } = await seedInvitation(referrerOrgId, {
      expiresAt: new Date(Date.now() - 60_000),
    });

    const result = await provisionIdentity({ ...freshSubject(), referralToken: token }, fullDeps);
    expect(result.created).toBe(true);
    expect(result.organizationId).not.toBeNull();

    expect(
      await prisma.invitationConversion.findFirst({ where: { growthInvitationId: invitationId } }),
    ).toBeNull();
    expect(
      await prisma.outboxEvent.findFirst({
        where: { eventName: INVITATION_CONVERTED_EVENT.name, aggregateId: invitationId },
      }),
    ).toBeNull();
    const invitation = await prisma.growthInvitation.findUnique({ where: { id: invitationId } });
    expect(invitation!.redemptionCount).toBe(0); // the GI-1 guard matched zero rows
  });

  it("revoked token → fail-open: registration succeeds with NO bind", async () => {
    const referrerOrgId = await seedReferrerOrg();
    const { id: invitationId, token } = await seedInvitation(referrerOrgId, { state: "revoked" });

    const result = await provisionIdentity({ ...freshSubject(), referralToken: token }, fullDeps);
    expect(result.created).toBe(true);

    expect(
      await prisma.invitationConversion.findFirst({ where: { growthInvitationId: invitationId } }),
    ).toBeNull();
    expect(
      await prisma.outboxEvent.findFirst({
        where: { eventName: INVITATION_CONVERTED_EVENT.name, aggregateId: invitationId },
      }),
    ).toBeNull();
    expect(
      (await prisma.growthInvitation.findUnique({ where: { id: invitationId } }))!.redemptionCount,
    ).toBe(0);
  });

  it("unknown token → fail-open: registration succeeds with NO bind anywhere", async () => {
    const unknownToken = `ivz_inv_test_${uuidv7()}`; // never seeded
    const result = await provisionIdentity(
      { ...freshSubject(), referralToken: unknownToken },
      fullDeps,
    );
    expect(result.created).toBe(true);
    expect(result.organizationId).not.toBeNull();

    // No conversion may reference the freshly-minted org (scoped — never a global count).
    expect(
      await prisma.invitationConversion.findFirst({
        where: { referredOrganizationId: result.organizationId as string },
      }),
    ).toBeNull();
  });

  it("capacity-exhausted invitation → no bind; registration succeeds; counter untouched", async () => {
    const referrerOrgId = await seedReferrerOrg();
    const { id: invitationId, token } = await seedInvitation(referrerOrgId, {
      maxRedemptions: 1,
      redemptionCount: 1, // already at the ceiling — the GI-1 predicate rejects
    });

    const result = await provisionIdentity({ ...freshSubject(), referralToken: token }, fullDeps);
    expect(result.created).toBe(true);
    expect(result.organizationId).not.toBeNull();

    expect(
      await prisma.invitationConversion.findFirst({ where: { growthInvitationId: invitationId } }),
    ).toBeNull();
    expect(
      (await prisma.growthInvitation.findUnique({ where: { id: invitationId } }))!.redemptionCount,
    ).toBe(1); // unchanged — never incremented past the ceiling
  });

  it("deps-absent → the dep-guard skips the bind FAIL-CLOSED; registration still succeeds", async () => {
    const referrerOrgId = await seedReferrerOrg();
    const { id: invitationId, token } = await seedInvitation(referrerOrgId);

    // Only the human-ref allocator — no outbox/audit deps (the L3-MINOR-2 guard scenario).
    const result = await provisionIdentity(
      { ...freshSubject(), referralToken: token },
      { allocateHumanReference },
    );
    expect(result.created).toBe(true);
    expect(result.organizationId).not.toBeNull();

    // The bind MUST NOT have happened (a bind without its unconditional legs is a breach).
    expect(
      await prisma.invitationConversion.findFirst({ where: { growthInvitationId: invitationId } }),
    ).toBeNull();
    expect(
      (await prisma.growthInvitation.findUnique({ where: { id: invitationId } }))!.redemptionCount,
    ).toBe(0);
    expect(
      await prisma.outboxEvent.findFirst({
        where: { eventName: INVITATION_CONVERTED_EVENT.name, aggregateId: invitationId },
      }),
    ).toBeNull();
  });
});
