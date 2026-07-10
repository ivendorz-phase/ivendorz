import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { appendAuditRecord } from "../../src/modules/core/contracts/services";
import type { CoreServiceExecutor } from "../../src/modules/core/contracts/services";
import { asRestrictedRole, ensureRestrictedRlsRole, RESTRICTED_RLS_ROLE } from "../_harness/db";

// D5 conformance gate for the audit-append RLS mechanism — ESC-W2-AUDIT-RLS §7 = R-b · ADR-021
// (Audit-Records RLS Asymmetry: write-admission ≠ read-disclosure) · Doc-6B_Structure_Additive_Patch_v1.0.1.
// Asserted through the same Doc-8B §5 DB-role-switch backstop as `rls-buyer-profiles-byte-equivalence`:
// act as the NON-privileged tenant role `ivendorz_test_rls` (NOBYPASSRLS, non-owner) so the DB POLICY
// itself is what we prove — never the app authz, and never a superuser false-pass.
//
// `core.audit_records` RLS (realized `core_init` + `20260630090000_audit_context_append_policy`):
//   SELECT  → platform-staff only         : USING (is_platform_staff IS TRUE)            (unchanged backstop)
//   INSERT  → (staff) OR (context-bound)  : new `audit_records_context_append` FOR INSERT WITH CHECK
//               ( organization_id = app.active_org AND actor_id = app.user_id AND actor_type = 'user' )
//               OR is_platform_staff IS TRUE
//   UPDATE/DELETE → closed (CR4′ immutability triggers — not RLS)
//
// The append is NON-`RETURNING` (the service uses `createMany`): a tenant `INSERT … RETURNING` would be
// forced through the staff-only SELECT policy and abort with SQLSTATE 42501. Test (a)+(g) exercises the
// REAL service under a tenant-context RLS transaction as the end-to-end regression guard against that.

// ── Deterministic fixed fixtures (UUIDv7-shaped: version nibble 7, variant 8/9/a/b). ──
const ORG_A = "01920000-0000-7000-8000-00000000a000";
const ORG_B = "01920000-0000-7000-8000-00000000b000";
const USER_A = "01920000-0000-7000-8000-00000000a009";
const USER_OTHER = "01920000-0000-7000-8000-00000000c009";
const ENTITY_1 = "01920000-0000-7000-8000-00000000e001";
const SEED_AUDIT = "01920000-0000-7000-8000-00000000ad01";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Build a raw INSERT into core.audit_records, run on the supplied (restricted-role) tx. Lets a test set
 *  exact attribution columns to forge — the policy's `WITH CHECK` is what admits or rejects it. */
function rawInsertAudit(
  tx: { $queryRawUnsafe: (q: string, ...v: unknown[]) => Promise<unknown> },
  row: {
    auditId: string;
    actorId: string | null;
    actorType: string;
    organizationId: string | null;
    entityType?: string;
    entityId?: string;
    action?: string;
  },
): Promise<unknown> {
  return tx.$queryRawUnsafe(
    `INSERT INTO "core"."audit_records"
       (audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, event_time)
     VALUES ($1::uuid, $2::uuid, $3::"core"."ActorType", $4::uuid, $5, $6::uuid, $7, now())`,
    row.auditId,
    row.actorId,
    row.actorType,
    row.organizationId,
    row.entityType ?? "buyer_profile",
    row.entityId ?? ENTITY_1,
    row.action ?? "buyer_profile.upserted",
  );
}

/** Seed (ELEVATED, committed) one audit row for the read-disclosure tests. Append-only + immutable, so
 *  it is NOT cleaned up (DELETE is trigger-blocked by design); the fixed id + ON CONFLICT keeps re-runs
 *  idempotent. The seed exists so the staff/tenant SELECT contrast reads a real committed row. */
async function seedAuditRow(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `INSERT INTO "core"."audit_records"
       (audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, event_time)
     VALUES ($1::uuid, $2::uuid, 'user'::"core"."ActorType", $3::uuid, 'buyer_profile', $4::uuid, 'buyer_profile.seed', now())
     ON CONFLICT DO NOTHING`,
    SEED_AUDIT,
    USER_A,
    ORG_A,
    ENTITY_1,
  );
}

describe("D5 — core.audit_records context-append RLS (ESC-W2-AUDIT-RLS R-b / ADR-021)", () => {
  beforeAll(async () => {
    await ensureRestrictedRlsRole(); // idempotent; grants core.audit_records SELECT/INSERT to the role.
    await seedAuditRow();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── Meta-checks: the gate is non-vacuous (RLS actually enforced; the new policy exists). ──

  it("RLS-IS-ACTIVE meta-check: restricted role is NON-privileged + audit_records RLS is enabled", async () => {
    const attrs = await prisma.$queryRawUnsafe<Array<{ rolsuper: boolean; rolbypassrls: boolean }>>(
      `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}'`,
    );
    expect(attrs).toHaveLength(1);
    expect(attrs[0]!.rolsuper).toBe(false);
    expect(attrs[0]!.rolbypassrls).toBe(false);

    const rls = await prisma.$queryRawUnsafe<Array<{ enabled: boolean }>>(
      `SELECT relrowsecurity AS enabled FROM pg_class WHERE oid = 'core.audit_records'::regclass`,
    );
    expect(rls[0]!.enabled).toBe(true);
  });

  it("the new context-append INSERT policy is installed on the parent AND the DEFAULT partition", async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ tablename: string; cmd: string }>>(
      `SELECT tablename, cmd FROM pg_policies
        WHERE schemaname = 'core' AND policyname LIKE '%context_append%' ORDER BY tablename`,
    );
    const tables = rows.map((r) => r.tablename);
    expect(tables).toContain("audit_records");
    expect(tables).toContain("audit_records_default");
    expect(rows.every((r) => r.cmd === "INSERT")).toBe(true);
  });

  // ── WRITE-ADMISSION (the context-bound INSERT policy). ──

  it("(a)+(g) tenant-context append via the REAL service is ADMITTED (no RETURNING/42501 abort)", async () => {
    // The end-to-end regression guard: `appendAuditRecord` runs `createMany` (NON-RETURNING) as the
    // restricted role under the tenant GUCs. Admission (resolve) proves the WITH CHECK passes AND that no
    // `RETURNING` trips the staff-only SELECT policy. The tx rolls back — "resolves" is the proof.
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        appendAuditRecord(
          {
            actorId: USER_A,
            actorType: "user",
            organizationId: ORG_A,
            entityType: "buyer_profile",
            entityId: ENTITY_1,
            action: "buyer_profile.upserted",
          },
          tx as unknown as CoreServiceExecutor,
        ),
      ),
    ).resolves.toMatchObject({ auditId: expect.stringMatching(UUID_RE) });
  });

  it("(a-raw) tenant-context INSERT truthfully attributed (org+actor+type='user') is admitted", async () => {
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        rawInsertAudit(tx, {
          auditId: "01920000-0000-7000-8000-00000000a111",
          actorId: USER_A,
          actorType: "user",
          organizationId: ORG_A,
        }),
      ),
    ).resolves.toBeDefined();
  });

  it("(c) forged actor_id (≠ app.user_id) is REJECTED by the WITH CHECK", async () => {
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        rawInsertAudit(tx, {
          auditId: "01920000-0000-7000-8000-00000000a112",
          actorId: USER_OTHER, // forging another actor
          actorType: "user",
          organizationId: ORG_A,
        }),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("(c) cross-tenant organization_id (≠ app.active_org) is REJECTED", async () => {
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        rawInsertAudit(tx, {
          auditId: "01920000-0000-7000-8000-00000000a113",
          actorId: USER_A,
          actorType: "user",
          organizationId: ORG_B, // cross-tenant audit injection
        }),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("(c) forged actor_type (System under tenant context) is REJECTED", async () => {
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        rawInsertAudit(tx, {
          auditId: "01920000-0000-7000-8000-00000000a114",
          actorId: USER_A,
          actorType: "system", // a tenant cannot forge a System actor_type
          organizationId: ORG_A,
        }),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("(d) fail-closed: NO GUCs set ⇒ INSERT REJECTED (unset GUC → NULL → predicate false)", async () => {
    await expect(
      asRestrictedRole({}, (tx) =>
        rawInsertAudit(tx, {
          auditId: "01920000-0000-7000-8000-00000000a115",
          actorId: USER_A,
          actorType: "user",
          organizationId: ORG_A,
        }),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("(e-smuggle) tenant context + NULL organization_id (System-looking row) is REJECTED", async () => {
    // The tenant leg fails (NULL = active_org → NULL → not true) and the staff leg is false → rejected.
    await expect(
      asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
        rawInsertAudit(tx, {
          auditId: "01920000-0000-7000-8000-00000000a116",
          actorId: null,
          actorType: "system",
          organizationId: null,
        }),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("(e) staff leg: is_platform_staff = true admits a System row (NULL actor/org, actor_type='system')", async () => {
    await expect(
      asRestrictedRole({ isPlatformStaff: true }, (tx) =>
        rawInsertAudit(tx, {
          auditId: "01920000-0000-7000-8000-00000000a117",
          actorId: null,
          actorType: "system",
          organizationId: null,
        }),
      ),
    ).resolves.toBeDefined();
  });

  // ── READ-DISCLOSURE stays platform-staff-only (CR2; the asymmetry). ──

  it("(d-read) tenant context CANNOT SELECT any audit row — even its own org's (staff-only read)", async () => {
    const rows = await asRestrictedRole({ activeOrg: ORG_A, userId: USER_A }, (tx) =>
      tx.$queryRawUnsafe<Array<{ n: number }>>(`SELECT count(*)::int AS n FROM core.audit_records`),
    );
    expect(rows[0]!.n).toBe(0);
  });

  it("(e-read) staff context SEES audit rows (≥1 seeded) — read is staff-gated, not an empty table", async () => {
    const rows = await asRestrictedRole({ isPlatformStaff: true }, (tx) =>
      tx.$queryRawUnsafe<Array<{ n: number }>>(`SELECT count(*)::int AS n FROM core.audit_records`),
    );
    expect(rows[0]!.n).toBeGreaterThanOrEqual(1);
  });

  it("NO-FALSE-PASS CONTRAST: the superuser connection (RLS bypassed) sees the seeded row", async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ n: number }>>(
      `SELECT count(*)::int AS n FROM core.audit_records WHERE audit_id = $1::uuid`,
      SEED_AUDIT,
    );
    expect(rows[0]!.n).toBe(1); // tenant saw 0; the difference is RLS enforcement, not an empty table.
  });

  // ── Service realization: createMany appends EXACTLY ONE row and returns the app-minted id. ──

  it("the service appends EXACTLY ONE row and returns the app-minted auditId (createMany; no RETURNING)", async () => {
    class Rollback extends Error {}
    await expect(
      prisma.$transaction(async (tx) => {
        const { auditId } = await appendAuditRecord(
          {
            actorId: USER_A,
            actorType: "user",
            organizationId: ORG_A,
            entityType: "buyer_profile",
            entityId: ENTITY_1,
            action: "buyer_profile.upserted",
          },
          tx as unknown as CoreServiceExecutor,
        );
        expect(auditId).toMatch(UUID_RE);
        const rows = await tx.$queryRawUnsafe<Array<{ n: number }>>(
          `SELECT count(*)::int AS n FROM core.audit_records WHERE audit_id = $1::uuid`,
          auditId,
        );
        expect(rows[0]!.n).toBe(1);
        throw new Rollback(); // never persist — keep the test DB clean (audit is append-only / no DELETE).
      }),
    ).rejects.toBeInstanceOf(Rollback);
  });

  // ── Immutability (CR4′) is untouched by the new policy. ──

  it("(h) UPDATE of a payload column is trigger-blocked (CR4′ immutability stands)", async () => {
    await expect(
      prisma.$executeRawUnsafe(
        `UPDATE core.audit_records SET action = 'tampered' WHERE audit_id = $1::uuid`,
        SEED_AUDIT,
      ),
    ).rejects.toThrow();
  });

  it("(h) DELETE is trigger-blocked (append-only; never deleted)", async () => {
    await expect(
      prisma.$executeRawUnsafe(
        `DELETE FROM core.audit_records WHERE audit_id = $1::uuid`,
        SEED_AUDIT,
      ),
    ).rejects.toThrow();
  });
});
