// M2 infrastructure (PRIVATE) — thin Prisma repository over `marketplace.vendor_profiles` +
// `marketplace.category_assignments` + `marketplace.categories`. This is M2 reading its OWN schema
// (allowed); other modules reach this only via the M2 composition root / contracts, never by
// importing infrastructure (REPOSITORY_STRUCTURE). No module outside `marketplace` imports this file.
//
// RLS is the row-visibility BACKSTOP for these public-readable tables (Doc-6D §3.1.9); the
// AUTHORIZATION MODEL is the app-layer shared visibility predicate
// (`domain/policies/vendor-visibility.policy.ts`) applied by the calling query, NOT re-derived here —
// this repository returns plain data (row or null), including the raw visibility-policy inputs, and
// takes NO position on whether the row is "visible" (that is the query's job).
//
// One query per lookup mode, no N+1: the active category assignments (+ their category) are fetched
// in the SAME Prisma call via a nested relation `select`, never a per-category follow-up query.

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { VendorProfileReadModel } from "../../domain/read-models/vendor-profile.read-model";

// The base column set every public-projection lookup needs (Doc-2 §10.3, narrowed to the frozen
// public projection — `vendor_type_preset`/declared-tier/capacity columns are NOT selected, they are
// not in `get_public_vendor_profile.v1`'s response). Active (status='active', non-soft-deleted)
// category assignments only (Doc-6D MK-CR8), ordered primary-before-secondary then by creation order
// (deterministic; `CategoryAssignmentLevel` sorts 'primary' < 'secondary' lexically).
const VENDOR_PROFILE_SELECT = {
  id: true,
  humanRef: true,
  name: true,
  canSupply: true,
  canService: true,
  canFabricate: true,
  canConsult: true,
  country: true,
  division: true,
  district: true,
  industrialZone: true,
  status: true,
  visibility: true,
  deletedAt: true,
  categoryAssignments: {
    where: { status: "active" as const, deletedAt: null },
    orderBy: [{ level: "asc" as const }, { createdAt: "asc" as const }],
    select: {
      category: { select: { id: true, name: true, parentId: true } },
    },
  },
};

interface VendorProfileRow {
  id: string;
  humanRef: string;
  name: string;
  canSupply: boolean;
  canService: boolean;
  canFabricate: boolean;
  canConsult: boolean;
  country: string | null;
  division: string | null;
  district: string | null;
  industrialZone: string | null;
  status: "active" | "suspended" | "banned";
  visibility: "public";
  deletedAt: Date | null;
  categoryAssignments: Array<{
    category: { id: string; name: string; parentId: string | null };
  }>;
}

function toReadModel(row: VendorProfileRow): VendorProfileReadModel {
  return {
    id: row.id,
    humanRef: row.humanRef,
    name: row.name,
    canSupply: row.canSupply,
    canService: row.canService,
    canFabricate: row.canFabricate,
    canConsult: row.canConsult,
    country: row.country,
    division: row.division,
    district: row.district,
    industrialZone: row.industrialZone,
    status: row.status,
    visibility: row.visibility,
    deletedAt: row.deletedAt,
    categories: row.categoryAssignments.map((a) => ({
      categoryId: a.category.id,
      name: a.category.name,
      parentCategoryId: a.category.parentId,
    })),
  };
}

/**
 * Look up a vendor profile by its PK (`vendor_profile_id`). Returns the row's public-projection
 * fields + its visibility-policy inputs (the CALLER applies `isVendorProfilePubliclyVisible`), or
 * `null` when no live (non-soft-deleted) row exists. One query, no N+1.
 */
export async function findPublicVendorProfileById(
  vendorProfileId: string,
  db: DbExecutor = prisma,
): Promise<VendorProfileReadModel | null> {
  const row = await db.vendorProfile.findFirst({
    where: { id: vendorProfileId, deletedAt: null },
    select: VENDOR_PROFILE_SELECT,
  });
  if (row === null) return null;
  return toReadModel(row);
}

/**
 * Look up a vendor profile by its year-scoped `human_ref` (`VENDOR-YYYY-NNNNNN`). Same contract as
 * `findPublicVendorProfileById`. One query, no N+1.
 */
export async function findPublicVendorProfileByHumanRef(
  humanRef: string,
  db: DbExecutor = prisma,
): Promise<VendorProfileReadModel | null> {
  const row = await db.vendorProfile.findFirst({
    where: { humanRef, deletedAt: null },
    select: VENDOR_PROFILE_SELECT,
  });
  if (row === null) return null;
  return toReadModel(row);
}
