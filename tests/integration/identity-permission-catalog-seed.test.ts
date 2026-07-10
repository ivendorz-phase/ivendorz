import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";

// W2-IDN-2 / W2-IDN-7 — Doc-8E Invariant #2 (two role dimensions: Platform Participation ≠ Org Role)
// conformance for the Doc-2 §7 permission/role-bundle catalog seed
// (`prisma/migrations/20260709130000_identity_catalog_seed` + the W2-IDN-7 routing-slug extension
// `20260710160000_identity_routing_slugs_seed`).
//
// COUNT (the real arithmetic): **45 slugs = 36 tenant + 9 staff**. History — the base 43 (36+7)
// per owner ruling `ESC-IDN-SLUGCOUNT` Option A / `Doc-6C_Patch_v1.0.1` (the base-text "45/38" was a
// propagated counting error), GREW by +2 staff at owner ruling `ESC-RFQ-SLUG` (`Doc-2_Patch_v1.0.8`
// PATCH-D2-07, 2026-07-10: `staff_can_view_routing` + `staff_can_manage_routing`). The count is now
// 45 again but 36/9, NOT the stale Doc-6C §3.5 "45 (38/7)" prose (T6-OBS-3 / RV-0159). Doc-6C count
// overlay: `Doc-6C_Patch_v1.0.3` (43→45, staff 7→9).
//
// The seed migration already applied in global-setup (`applyMigrations`, Doc-8B §3) — this suite
// asserts the RESULTING catalog state against Doc-2 §7's enumeration, then proves idempotency by
// re-executing the seed's own SQL statements a second time and asserting byte-identical counts
// (Doc-6A §11.3 — re-run safe). Runs on the elevated connection (RLS not the concern here — see
// the separate `rls-identity-authz-tables` suite for the RLS gate).
//
// ORDER-INDEPENDENCE (RV-0147 B-NIT-1, re-attributed): files run sequentially — `fileParallelism: false`
// (`vitest.config.ts`) serializes DB-backed suites over the ONE shared Postgres, and every DB-mutating
// suite (RLS backstop, W2-IDN-3/4) cleans up its own fixtures in teardown. So no sibling suite's rows are
// live while this suite runs. As belt-and-suspenders the predicates below ALSO scope to
// `role_permissions.organization_id IS NULL` (the system-bundle composition), never a bare count of
// `role_permissions` overall — but the primary guarantee is the sequential-run + teardown discipline.

// The 36 tenant slugs, verbatim from Doc-2 §7 (table order), NONE coined/renamed.
const TENANT_SLUGS = [
  "can_create_rfq",
  "can_approve_rfq",
  "can_view_rfq",
  "can_view_all_rfqs",
  "can_cancel_rfq",
  "can_approve_vendor_selection",
  "can_award_rfq",
  "can_submit_quote",
  "can_respond_to_rfq",
  "can_withdraw_quote",
  "can_manage_private_vendors",
  "can_manage_vendor_status",
  "can_manage_engagements",
  "can_create_documents",
  "can_approve_po",
  "can_record_payments",
  "can_approve_payment",
  "can_manage_finance_records",
  "can_manage_templates",
  "can_manage_vendor_profile",
  "can_publish_profile",
  "can_manage_users",
  "can_manage_workflow_settings",
  "can_view_billing",
  "can_manage_billing",
  "can_transfer_ownership",
  "can_delete_organization",
  "can_submit_verification",
  "can_manage_delegations",
  "can_use_messaging",
  "can_raise_support_ticket",
  "can_manage_leads",
  "can_manage_products",
  "can_manage_ads",
  "can_upload_spec_documents",
  "can_submit_review",
] as const;

// The 9 staff slugs, verbatim from Doc-2 §7 "Platform-staff slugs (separate space)" — the 7 base
// slugs + the 2 routing-governance slugs added by `Doc-2_Patch_v1.0.8` (owner ruling `ESC-RFQ-SLUG`).
const STAFF_SLUGS = [
  "staff_can_moderate_rfq",
  "staff_can_verify",
  "staff_can_support",
  "staff_can_ban",
  "staff_can_manage_categories",
  "staff_can_redact_audit",
  "staff_super_admin",
  // Doc-2 v1.0.8 PATCH-D2-07 (routing/matching governance; read/write split; both staff-space):
  "staff_can_view_routing",
  "staff_can_manage_routing",
] as const;

// The 2 routing-governance slugs (Doc-2 v1.0.8) — asserted staff-space + on NO org bundle (Inv #2).
const ROUTING_SLUGS = ["staff_can_view_routing", "staff_can_manage_routing"] as const;

const SYSTEM_BUNDLE_NAMES = ["Owner", "Director", "Manager", "Officer"] as const;

// Doc-2 §7 bundle-default (O/D/M/F) mapping counts, hand-derived (per-bundle) from the frozen table —
// re-derivation notes recorded in the seed migration's header comment (none ambiguous).
const EXPECTED_BUNDLE_MAPPING_COUNTS: Record<(typeof SYSTEM_BUNDLE_NAMES)[number], number> = {
  Owner: 36, // every tenant slug maps to Owner
  Director: 32, // all tenant slugs except the 4 Owner-only ones
  Manager: 25,
  Officer: 10,
};
const EXPECTED_TOTAL_MAPPING_ROWS = 36 + 32 + 25 + 10; // 103

// Split the seed migration's SQL into its two INSERT statements (Prisma raw-query execution rejects
// multiple commands in one prepared statement — `cannot insert multiple commands into a prepared
// statement`, code 42601) so the idempotency probe below can genuinely re-run the SAME on-disk seed
// content a second time, rather than a hand-duplicated copy that could drift from the real migration.
function loadSeedStatements(): { permissionsStmt: string; rolePermissionsStmt: string } {
  const sql = readFileSync(
    resolve(
      __dirname,
      "../../prisma/migrations/20260709130000_identity_catalog_seed/migration.sql",
    ),
    "utf8",
  );
  const idx1 = sql.indexOf('INSERT INTO "identity"."permissions"');
  const idx2 = sql.indexOf('INSERT INTO "identity"."role_permissions"');
  if (idx1 < 0 || idx2 < 0 || idx2 <= idx1) {
    throw new Error(
      "[8E identity-permission-catalog-seed] could not locate the two seed INSERT statements in the migration file — has it moved/renamed?",
    );
  }
  return {
    permissionsStmt: sql.slice(idx1, idx2),
    rolePermissionsStmt: sql.slice(idx2),
  };
}

describe("W2-IDN-2/7 — Doc-8E Invariant #2: permission/role-bundle catalog seed (Doc-2 §7 + v1.0.8, 45-slug)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── §1 — identity.permissions catalog: exactly 45 slugs (36 tenant + 9 staff) ──

  it("seeds exactly 45 permission slugs total", async () => {
    const rows = await prisma.permission.findMany({ select: { slug: true } });
    expect(rows).toHaveLength(45);
  });

  it("seeds exactly 36 tenant-space slugs, matching Doc-2 §7 verbatim (names + count)", async () => {
    const rows = await prisma.permission.findMany({
      where: { space: "tenant" },
      select: { slug: true },
    });
    expect(rows).toHaveLength(36);
    expect(new Set(rows.map((r) => r.slug))).toEqual(new Set(TENANT_SLUGS));
  });

  it("seeds exactly 9 staff-space slugs, matching Doc-2 §7 (+ v1.0.8) verbatim (names + count)", async () => {
    const rows = await prisma.permission.findMany({
      where: { space: "staff" },
      select: { slug: true },
    });
    expect(rows).toHaveLength(9);
    expect(new Set(rows.map((r) => r.slug))).toEqual(new Set(STAFF_SLUGS));
  });

  // ── §1a — W2-IDN-7 routing-governance slugs: staff-space + on NO org bundle (Inv #2 discriminating) ──

  it.each(ROUTING_SLUGS)(
    "routing slug '%s' is seeded as staff-space and mapped to ZERO org bundles (Inv #2)",
    async (slug) => {
      const perm = await prisma.permission.findUniqueOrThrow({
        where: { slug },
        select: { space: true, id: true },
      });
      expect(perm.space).toBe("staff");
      // Discriminating: a routing slug wrongly placed in an org bundle would make this non-zero
      // (the same firewall the "ZERO staff→bundle" aggregate proves, pinned per-routing-slug).
      const mapped = await prisma.rolePermission.count({ where: { permissionId: perm.id } });
      expect(mapped).toBe(0);
    },
  );

  // ── §2 — identity.roles: exactly 4 system bundles (verbatim names, pre-seeded by identity_init) ──

  it("exactly 4 system bundles exist (organization_id NULL, is_system_bundle true, live)", async () => {
    const rows = await prisma.role.findMany({
      where: { organizationId: null, isSystemBundle: true, deletedAt: null },
      select: { name: true },
    });
    expect(rows).toHaveLength(4);
    expect(new Set(rows.map((r) => r.name))).toEqual(new Set(SYSTEM_BUNDLE_NAMES));
  });

  // ── §3 — identity.role_permissions: Inv #2 hard guard — zero staff→bundle mappings ──

  it("Invariant #2 hard guard: ZERO staff-space slugs are mapped to any system bundle", async () => {
    const staffMapped = await prisma.rolePermission.count({
      where: {
        organizationId: null,
        permission: { space: "staff" },
      },
    });
    expect(staffMapped).toBe(0);
  });

  // ── §4 — per-bundle mapping counts ≡ Doc-2 §7 bundle-default (O/D/M/F) columns ──

  it.each(SYSTEM_BUNDLE_NAMES)(
    "bundle '%s' mapping count matches the Doc-2 §7 bundle-default column",
    async (bundleName) => {
      const count = await prisma.rolePermission.count({
        where: {
          organizationId: null,
          role: { name: bundleName, organizationId: null, isSystemBundle: true },
        },
      });
      expect(count).toBe(EXPECTED_BUNDLE_MAPPING_COUNTS[bundleName]);
    },
  );

  it("total system-bundle mapping rows = 103 (36+32+25+10)", async () => {
    const total = await prisma.rolePermission.count({ where: { organizationId: null } });
    expect(total).toBe(EXPECTED_TOTAL_MAPPING_ROWS);
  });

  // ── §5 — double-run idempotency proof (Doc-6A §11.3 — the seed is re-run safe) ──

  it("double-run idempotency: re-executing the seed's own SQL a second time leaves state IDENTICAL", async () => {
    const { permissionsStmt, rolePermissionsStmt } = loadSeedStatements();
    const routingStmt = loadRoutingSlugStatement();

    const before = await snapshot();
    await prisma.$executeRawUnsafe(permissionsStmt);
    await prisma.$executeRawUnsafe(rolePermissionsStmt);
    await prisma.$executeRawUnsafe(routingStmt); // W2-IDN-7 routing-slug seed — also re-run safe
    const after = await snapshot();

    expect(after).toEqual(before);
    expect(after.totalPermissions).toBe(45); // 43 base upserted + 2 routing untouched → still 45
  });
});

// Load the single INSERT from the W2-IDN-7 routing-slug seed migration (its own on-disk content, so
// the idempotency probe re-runs the REAL migration SQL rather than a hand-duplicated copy).
function loadRoutingSlugStatement(): string {
  const sql = readFileSync(
    resolve(
      __dirname,
      "../../prisma/migrations/20260710160000_identity_routing_slugs_seed/migration.sql",
    ),
    "utf8",
  );
  const idx = sql.indexOf('INSERT INTO "identity"."permissions"');
  if (idx < 0) {
    throw new Error(
      "[8E identity-permission-catalog-seed] could not locate the routing-slug INSERT in its migration file — has it moved/renamed?",
    );
  }
  return sql.slice(idx);
}

interface CatalogSnapshot {
  totalPermissions: number;
  tenantSlugs: string[];
  staffSlugs: string[];
  systemBundleNames: string[];
  staffMappedCount: number;
  bundleMappingCounts: Record<string, number>;
  totalMappingRows: number;
}

async function snapshot(): Promise<CatalogSnapshot> {
  const [permissions, roles, staffMapped, mappings] = await Promise.all([
    prisma.permission.findMany({ select: { slug: true, space: true } }),
    prisma.role.findMany({
      where: { organizationId: null, isSystemBundle: true, deletedAt: null },
      select: { name: true },
    }),
    prisma.rolePermission.count({
      where: { organizationId: null, permission: { space: "staff" } },
    }),
    prisma.rolePermission.findMany({
      where: { organizationId: null },
      select: { role: { select: { name: true } } },
    }),
  ]);

  const bundleMappingCounts: Record<string, number> = {};
  for (const m of mappings) {
    bundleMappingCounts[m.role.name] = (bundleMappingCounts[m.role.name] ?? 0) + 1;
  }

  return {
    totalPermissions: permissions.length,
    tenantSlugs: permissions
      .filter((p) => p.space === "tenant")
      .map((p) => p.slug)
      .sort(),
    staffSlugs: permissions
      .filter((p) => p.space === "staff")
      .map((p) => p.slug)
      .sort(),
    systemBundleNames: roles.map((r) => r.name).sort(),
    staffMappedCount: staffMapped,
    bundleMappingCounts,
    totalMappingRows: mappings.length,
  };
}
