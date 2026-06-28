import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { ensureProvisioned, type AuthSession } from "../../src/server/auth";
import { resolveActiveOrg } from "../../src/server/context";
import { handleGetBuyerProfile } from "../../src/server/identity";

// WP-1.5 [W1-IDENTITY-002] verification — the WIRED `identity.get_buyer_profile.v1` HTTP route
// (Doc-5C §6.1 row 33 → `GET /identity/buyer_profiles` → `200`; §6.3 non-disclosure → `404`),
// composed inside the active-org context. Exercised through the app-layer handler CORE
// (`handleGetBuyerProfile`, `src/server/identity`) — the boundary-legal, test-reachable surface
// (tests import `src/server` + module `contracts/`, never `app` and never a module internal).
//
// The live Supabase session round-trip PARKS (build-local-park-deploy): session resolution is
// INJECTED, so the handler runs against a real provisioned user with a TEST-SCOPED SEEDED SESSION
// (a deterministic `auth_user_id`) and NO live Supabase round-trip.
//
// Asserts (per the WP-1.5 verify list):
//   (a) provision a user, SEED a buyer_profile (test-only) for their personal org, call the handler
//       with that user's session → `200` + the Doc-5A §5.6 envelope + a top-level `reference_id`
//       (CHK-5A-042); the body is the seeded profile.
//   (b) a user whose active org has NO buyer_profile → `404` (absent; Doc-5C §6.3).
//
// Cross-tenant BYTE-EQUIVALENCE (own-org 200 vs cross-tenant 404 being indistinguishable) is the
// WP-1.7 `CHK-8-024` job and is NOT asserted here — only own-org `200` vs absent `404`.
//
// RLS NOTE (Wave-1 test reality): the local test connection runs as `postgres` (rolbypassrls=true),
// so RLS does NOT filter rows on this connection; the active-org SCOPING is exercised structurally
// (the read runs INSIDE `withActiveOrgContext`, so `app.active_org` is set per request — WP-1.4),
// while determinism here comes from keeping exactly ONE fixture buyer_profile in the table per case
// (the per-case cleanup below). Enforced RLS filtering over a restricted role is the WP-1.7 job.

const PRESENT_AUTH_USER_ID = "01920000-0000-7000-8000-00000000d501";
const ABSENT_AUTH_USER_ID = "01920000-0000-7000-8000-00000000d502";
const PRESENT_EMAIL = "buyer-present@example.com";
const ABSENT_EMAIL = "buyer-absent@example.com";

/** A test-scoped seeded session resolver — stands in for the live Supabase round-trip (parked). */
function seededSession(session: AuthSession): () => Promise<AuthSession | null> {
  return async () => session;
}

async function cleanup(authUserId: string): Promise<void> {
  // TEST-ONLY hard-delete teardown (production never hard-deletes — Invariant #8; the test DB is
  // ephemeral). Order: buyer_profiles → memberships → orgs → user (FK-safe).
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

describe("WP-1.5 wired identity.get_buyer_profile.v1 route (GET /identity/buyer_profiles)", () => {
  beforeEach(async () => {
    await cleanup(PRESENT_AUTH_USER_ID);
    await cleanup(ABSENT_AUTH_USER_ID);
  });

  afterAll(async () => {
    await cleanup(PRESENT_AUTH_USER_ID);
    await cleanup(ABSENT_AUTH_USER_ID);
    await prisma.$disconnect();
  });

  it("200 + Doc-5A §5.6 envelope + reference_id, body = the seeded buyer_profile (own active org)", async () => {
    const session: AuthSession = { authUserId: PRESENT_AUTH_USER_ID, email: PRESENT_EMAIL };

    // Provision the user (lazy first-login) so they have a personal org + active Owner membership.
    const provisioned = await ensureProvisioned(session);
    expect(provisioned.created).toBe(true);
    expect(provisioned.organizationId).not.toBeNull();
    const orgId = provisioned.organizationId!;

    // SEED a buyer_profile (TEST-ONLY) for the user's personal (active) org. The active-org singleton
    // index guarantees one live row per org; `id` is a UUIDv7 (the only canonical machine id — CR6).
    const seededId = uuidv7();
    await prisma.buyerProfile.create({
      data: {
        id: seededId,
        organizationId: orgId,
        industry: "textiles",
        factoryInfoJsonb: { units: 2 },
        deliveryLocationsJsonb: ["Dhaka"],
        procurementPreferencesJsonb: { lead_time_days: 14 },
      },
    });

    const res = await handleGetBuyerProfile({
      resolveSession: seededSession(session),
      ensureProvisioned,
    });

    // Doc-5A §5.6 single-entity success: status 200, `{ result, reference_id }`.
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("result");
    expect(res.body).toHaveProperty("reference_id");
    expect("error" in res.body).toBe(false);

    if (!("result" in res.body)) throw new Error("unreachable: expected a success envelope");
    // Top-level `reference_id` (CHK-5A-042) — a platform-assigned UUIDv7, sibling of `result`.
    expect(res.body.reference_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    // The body is the seeded profile (the active-org buyer_profile DTO).
    expect(res.body.result.id).toBe(seededId);
    expect(res.body.result.organizationId).toBe(orgId);
    expect(res.body.result.industry).toBe("textiles");
    expect(res.body.result.factoryInfo).toEqual({ units: 2 });
    expect(res.body.result.deliveryLocations).toEqual(["Dhaka"]);
    expect(res.body.result.procurementPreferences).toEqual({ lead_time_days: 14 });
  });

  it("404 (absent) when the active org has NO buyer_profile", async () => {
    const session: AuthSession = { authUserId: ABSENT_AUTH_USER_ID, email: ABSENT_EMAIL };

    // Provision the user but seed NO buyer_profile for their active org.
    const provisioned = await ensureProvisioned(session);
    expect(provisioned.created).toBe(true);

    const res = await handleGetBuyerProfile({
      resolveSession: seededSession(session),
      ensureProvisioned,
    });

    // Doc-5C §6.3 non-disclosure: absent → `404` (NOT_FOUND), the Doc-5A §6.1 error envelope.
    expect(res.status).toBe(404);
    expect("error" in res.body).toBe(true);
    if (!("error" in res.body)) throw new Error("unreachable: expected an error envelope");
    expect(res.body.error.error_class).toBe("NOT_FOUND");
    expect(res.body.error.retryable).toBe(false);
    // Top-level `reference_id` is carried on the error body too (Doc-5A §6.1 / CHK-5A-042).
    expect(res.body.reference_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("401 auth-boundary (DC-4) when unauthenticated — NO Doc-5A contract error_class", async () => {
    const res = await handleGetBuyerProfile({
      resolveSession: async () => null,
      ensureProvisioned,
    });

    // DC-4 auth-boundary: transport-level 401, PRE-CONTRACT. The body carries the top-level
    // `reference_id` (traceability) ONLY — NO `error`/`error_class` (the request never reached a
    // Doc-5A contract; the closed class set has no authentication/401 class by design). 403 is NOT
    // used — that would conflate "no credential" with an authorization DENIAL. See ESC-W1-AUTH-401.
    expect(res.status).toBe(401);
    expect("error" in res.body).toBe(false); // no contract error envelope
    expect(res.body.reference_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    // Explicit: the auth-boundary body must NOT surface AUTHORIZATION (or any contract class).
    const authClass = (res.body as { error?: { error_class?: string } }).error?.error_class;
    expect(authClass).toBeUndefined();
    expect(authClass).not.toBe("AUTHORIZATION");
  });

  it("runs the read INSIDE the active-org context (the resolved active org = the personal org)", async () => {
    // Structural assertion that the wired read composes the WP-1.4 context: the session's active org
    // resolves to the user's personal org (the same context the handler runs the read inside).
    const session: AuthSession = { authUserId: PRESENT_AUTH_USER_ID, email: PRESENT_EMAIL };
    const provisioned = await ensureProvisioned(session);
    const resolution = await resolveActiveOrg(session);
    expect(resolution.resolved).toBe(true);
    if (!resolution.resolved) throw new Error("unreachable");
    expect(resolution.context.activeOrgId).toBe(provisioned.organizationId);
  });
});
