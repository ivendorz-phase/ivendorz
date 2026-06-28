import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import {
  asRestrictedRole,
  countBuyerProfilesNoContext,
  ensureRestrictedRlsRole,
  RESTRICTED_RLS_ROLE,
} from "../_harness/db";

// WP-1.7 [W1-TEST-001] — the MANDATORY `CHK-8-024` RLS positive/negative/cross-tenant byte-equivalence
// gate (Doc-8D §5 / §5.4; Invariant #11 defining check) on `identity.buyer_profiles`. Asserted through
// the Doc-8B §5 DB-role-switch backstop: act as a NON-privileged tenant DB role with the app layer
// bypassed, so the DB-level policy itself is what we prove (not the app authz, which Doc-8C owns).
//
// THE NO-FALSE-PASS GUARANTEE (the whole point of this WP):
//   The local/CI connection role is `postgres` (SUPERUSER + table owner) which BYPASSES RLS — a gate run
//   on it would be VACUOUS (it would "pass" with RLS doing nothing). Every assertion below runs as the
//   harness restricted role (`ivendorz_test_rls`: NOBYPASSRLS, non-owner, minimal grants — Doc-8B §5).
//   The first assertion is the META-CHECK: as that role with NO `app.active_org` GUC set, the
//   RLS-governed read returns 0 rows (fail-closed). If it returned rows, RLS is NOT enforced on this
//   connection → the gate is invalid → the test FAILS LOUDLY (never a superuser false-pass).
//
// `buyer_profiles` RLS (Doc-6C §6.2a, realized `identity_init`):
//   FOR ALL USING (organization_id = current_setting('app.active_org', true)::uuid
//                  OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
//
// Deterministic order (per the WP): migration → RLS installed (global-setup) → seed ≥2 orgs (A,B) each
// with a buyer_profile + a non-matched org C with NONE (elevated seed) → positive (role@A sees A's row)
// → negative meta-check (no-GUC ⇒ 0 rows ⇒ RLS enforced) → cross-tenant (role@A: B's row invisible) →
// byte-equivalence (excluded SELECT *and* COUNT byte-identical to a non-matched org's). Fixture ids are
// FIXED UUIDv7 literals (deterministic — no Math.random); seeding is the only elevated path.

// ── Deterministic fixed fixtures (UUIDv7-shaped: version nibble 7, variant 8/9/a/b). ──
const ORG_A = "01920000-0000-7000-8000-0000000007a0";
const ORG_B = "01920000-0000-7000-8000-0000000007b0";
const ORG_C = "01920000-0000-7000-8000-0000000007c0"; // the non-matched org (no buyer_profile)
const BP_A = "01920000-0000-7000-8000-0000000007a1";
const BP_B = "01920000-0000-7000-8000-0000000007b1";
const USER_A = "01920000-0000-7000-8000-0000000007a9";

interface BuyerProfileRow {
  id: string;
  organization_id: string;
  industry: string | null;
}

/** Seed (ELEVATED, committed) the ≥2-org fixture: A,B with a buyer_profile each; C with none. */
async function seedFixture(): Promise<void> {
  // Orgs A, B, C — human_ref carries the org id so it is unique (the allocator owns refs in prod; the
  // harness re-mints none of M0's logic — this is just a unique placeholder value for the NOT NULL col).
  for (const [id, name, slug] of [
    [ORG_A, "RLS Org A", `rls-org-a-${ORG_A}`],
    [ORG_B, "RLS Org B", `rls-org-b-${ORG_B}`],
    [ORG_C, "RLS Org C", `rls-org-c-${ORG_C}`],
  ] as const) {
    await prisma.organization.create({
      data: { id, humanRef: `ORG-RLSTEST-${id}`, name, slug },
    });
  }
  // buyer_profiles for A and B ONLY (C is the "non-matched" org — no row).
  await prisma.buyerProfile.create({
    data: { id: BP_A, organizationId: ORG_A, industry: "textiles-A" },
  });
  await prisma.buyerProfile.create({
    data: { id: BP_B, organizationId: ORG_B, industry: "steel-B" },
  });
}

async function teardownFixture(): Promise<void> {
  // TEST-ONLY hard-delete (production never hard-deletes — Invariant #8; the test DB is ephemeral).
  await prisma.buyerProfile.deleteMany({ where: { id: { in: [BP_A, BP_B] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [ORG_A, ORG_B, ORG_C] } } });
}

describe("WP-1.7 CHK-8-024 — identity.buyer_profiles RLS byte-equivalence (DB-role backstop)", () => {
  beforeAll(async () => {
    await ensureRestrictedRlsRole(); // idempotent (also run in global-setup); explicit for isolation.
    await teardownFixture(); // clean any residue from a prior aborted run (deterministic fixtures).
    await seedFixture();
  });

  afterAll(async () => {
    await teardownFixture();
    await prisma.$disconnect();
  });

  it("RLS-IS-ACTIVE meta-check: restricted role is NON-privileged (NOBYPASSRLS, non-owner)", async () => {
    // Prove the assertion role genuinely cannot bypass RLS — else every gate below would false-pass.
    const attrs = await prisma.$queryRawUnsafe<Array<{ rolsuper: boolean; rolbypassrls: boolean }>>(
      `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}'`,
    );
    expect(attrs).toHaveLength(1);
    expect(attrs[0]!.rolsuper).toBe(false);
    expect(attrs[0]!.rolbypassrls).toBe(false);

    // And `buyer_profiles` has RLS enabled.
    const rls = await prisma.$queryRawUnsafe<Array<{ enabled: boolean }>>(
      `SELECT relrowsecurity AS enabled FROM pg_class WHERE oid = 'identity.buyer_profiles'::regclass`,
    );
    expect(rls[0]!.enabled).toBe(true);
  });

  it("NEGATIVE (the load-bearing fail-closed): restricted role with NO app.active_org ⇒ 0 rows", async () => {
    // THE META-CHECK. If RLS were not enforced (superuser/bypass connection), the seeded A+B rows would
    // be visible here and this returns 2 — exposing a vacuous false-pass. It MUST be 0 (fail-closed).
    const n = await countBuyerProfilesNoContext();
    expect(n).toBe(0);
  });

  it("NO-FALSE-PASS CONTRAST: the SUPERUSER connection (RLS bypassed) DOES see the seeded rows", async () => {
    // The counterpoint that makes the meta-check meaningful: the difference between 0 (restricted role,
    // no GUC) and the seeded count here is RLS ENFORCEMENT, not an empty table. The privileged `postgres`
    // connection bypasses RLS, so it sees BOTH seeded profiles. If the restricted-role meta-check above
    // ALSO saw them, RLS would be a no-op and the entire gate vacuous — this contrast proves it is not.
    const rows = await prisma.$queryRawUnsafe<Array<{ n: number }>>(
      `SELECT count(*)::int AS n FROM identity.buyer_profiles WHERE id IN ($1::uuid, $2::uuid)`,
      BP_A,
      BP_B,
    );
    expect(rows[0]!.n).toBe(2); // superuser bypass sees the seed; the restricted role saw 0.
  });

  it("POSITIVE: restricted role @ app.active_org = A sees EXACTLY A's row (and only A's)", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
      tx.$queryRawUnsafe<BuyerProfileRow[]>(
        `SELECT id, organization_id, industry FROM identity.buyer_profiles ORDER BY id`,
      ),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(BP_A);
    expect(rows[0]!.organization_id).toBe(ORG_A);
    expect(rows[0]!.industry).toBe("textiles-A");
  });

  it("CROSS-TENANT: restricted role @ app.active_org = A canNOT read/list B's row (invisible)", async () => {
    // Direct query for B's row, scoped to org A — RLS denies it even with the org filter present.
    const rows = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
      tx.$queryRawUnsafe<BuyerProfileRow[]>(
        `SELECT id, organization_id, industry FROM identity.buyer_profiles WHERE organization_id = $1::uuid ORDER BY id`,
        ORG_B,
      ),
    );
    expect(rows).toEqual([]);
  });

  it("CROSS-TENANT: restricted role @ app.active_org = A canNOT COUNT B's rows (count = 0)", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
      tx.$queryRawUnsafe<Array<{ n: number }>>(
        `SELECT count(*)::int AS n FROM identity.buyer_profiles WHERE organization_id = $1::uuid`,
        ORG_B,
      ),
    );
    expect(rows[0]!.n).toBe(0);
  });

  it("BYTE-EQUIVALENCE (§5.4): excluded SELECT == non-matched org's SELECT (byte-identical)", async () => {
    // Excluded view: org A querying for B's (excluded) rows. Non-matched view: org C (which simply has
    // NO buyer_profile) querying all it can see. Invariant #11: excluded ≡ non-matched — same rows, same
    // bytes, no distinguishing leak in the DB-returned data.
    const excludedSelect = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
      tx.$queryRawUnsafe<BuyerProfileRow[]>(
        `SELECT id, organization_id, industry FROM identity.buyer_profiles WHERE organization_id = $1::uuid ORDER BY id`,
        ORG_B,
      ),
    );
    const nonMatchedSelect = await asRestrictedRole({ activeOrg: ORG_C }, (tx) =>
      tx.$queryRawUnsafe<BuyerProfileRow[]>(
        `SELECT id, organization_id, industry FROM identity.buyer_profiles ORDER BY id`,
      ),
    );
    // Both are empty result sets — byte-identical. Compared by serialized form (the DB-returned data).
    expect(JSON.stringify(excludedSelect)).toBe(JSON.stringify(nonMatchedSelect));
    expect(excludedSelect).toEqual([]);
    expect(nonMatchedSelect).toEqual([]);
  });

  it("BYTE-EQUIVALENCE (§5.4): excluded COUNT == non-matched org's COUNT (byte-identical)", async () => {
    const excludedCount = await asRestrictedRole({ activeOrg: ORG_A }, (tx) =>
      tx.$queryRawUnsafe<Array<{ n: number }>>(
        `SELECT count(*)::int AS n FROM identity.buyer_profiles WHERE organization_id = $1::uuid`,
        ORG_B,
      ),
    );
    const nonMatchedCount = await asRestrictedRole({ activeOrg: ORG_C }, (tx) =>
      tx.$queryRawUnsafe<Array<{ n: number }>>(
        `SELECT count(*)::int AS n FROM identity.buyer_profiles`,
      ),
    );
    expect(JSON.stringify(excludedCount)).toBe(JSON.stringify(nonMatchedCount));
    expect(excludedCount[0]!.n).toBe(0);
    expect(nonMatchedCount[0]!.n).toBe(0);
  });

  it("SYMMETRY: restricted role @ app.active_org = B sees EXACTLY B's row (tenant isolation holds both ways)", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_B }, (tx) =>
      tx.$queryRawUnsafe<BuyerProfileRow[]>(
        `SELECT id, organization_id, industry FROM identity.buyer_profiles ORDER BY id`,
      ),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(BP_B);
    expect(rows[0]!.organization_id).toBe(ORG_B);
  });
});
