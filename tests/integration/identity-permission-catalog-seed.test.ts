import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";

// W2-IDN-2 — Doc-8E Invariant #2 (two role dimensions: Platform Participation ≠ Org Role)
// conformance for the Doc-2 §7 permission/role-bundle catalog seed
// (`prisma/migrations/20260709130000_identity_catalog_seed`), as corrected by
// `Doc-6C_Patch_v1.0.1` (owner-ruled `ESC-IDN-SLUGCOUNT` Option A, 2026-07-09):
// **43 slugs = 36 tenant + 7 staff** (NOT the base-text "45/38" — a propagated counting error).
//
// The seed migration already applied in global-setup (`applyMigrations`, Doc-8B §3) — this suite
// asserts the RESULTING catalog state against Doc-2 §7's enumeration, then proves idempotency by
// re-executing the seed's own SQL statements a second time and asserting byte-identical counts
// (Doc-6A §11.3 — re-run safe). Runs on the elevated connection (RLS not the concern here — see
// the separate `rls-identity-authz-tables` suite for the RLS gate); order-independent w.r.t. the RLS
// suite's temp Owner-bundle rows (B-OBS-2) — every predicate below scopes to
// `role_permissions.organization_id IS NULL` (the system-bundle composition), never to a bare count
// of `role_permissions` overall, so a transient tenant-scoped row inserted/rolled-back by another
// suite cannot perturb these assertions.

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

// The 7 staff slugs, verbatim from Doc-2 §7 "Platform-staff slugs (separate space)".
const STAFF_SLUGS = [
  "staff_can_moderate_rfq",
  "staff_can_verify",
  "staff_can_support",
  "staff_can_ban",
  "staff_can_manage_categories",
  "staff_can_redact_audit",
  "staff_super_admin",
] as const;

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

describe("W2-IDN-2 — Doc-8E Invariant #2: permission/role-bundle catalog seed (Doc-2 §7, 43-slug per Doc-6C_Patch_v1.0.1)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── §1 — identity.permissions catalog: exactly 43 slugs (36 tenant + 7 staff) ──

  it("seeds exactly 43 permission slugs total", async () => {
    const rows = await prisma.permission.findMany({ select: { slug: true } });
    expect(rows).toHaveLength(43);
  });

  it("seeds exactly 36 tenant-space slugs, matching Doc-2 §7 verbatim (names + count)", async () => {
    const rows = await prisma.permission.findMany({
      where: { space: "tenant" },
      select: { slug: true },
    });
    expect(rows).toHaveLength(36);
    expect(new Set(rows.map((r) => r.slug))).toEqual(new Set(TENANT_SLUGS));
  });

  it("seeds exactly 7 staff-space slugs, matching Doc-2 §7 verbatim (names + count)", async () => {
    const rows = await prisma.permission.findMany({
      where: { space: "staff" },
      select: { slug: true },
    });
    expect(rows).toHaveLength(7);
    expect(new Set(rows.map((r) => r.slug))).toEqual(new Set(STAFF_SLUGS));
  });

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

    const before = await snapshot();
    await prisma.$executeRawUnsafe(permissionsStmt);
    await prisma.$executeRawUnsafe(rolePermissionsStmt);
    const after = await snapshot();

    expect(after).toEqual(before);
  });
});

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
