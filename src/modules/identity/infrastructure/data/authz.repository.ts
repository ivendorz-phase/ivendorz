// M1 infrastructure (PRIVATE) — thin Prisma repository for the authorization-resolution reads over
// M1's OWN schema (`identity`): users, organizations, memberships, roles, role_permissions,
// permissions, delegation_grants (Doc-2 §10.2 / Doc-6C). This is M1 reading its own tables (allowed);
// other modules reach these only via the M1 contracts facade, never by importing infrastructure.
//
// The app-layer authorization check is PRIMARY (Doc-4C §C3; Doc-6C §6.2a: "App-layer authz is primary
// … RLS is the row-visibility backstop"). Every resolution read therefore carries its OWN explicit
// org anchor in the WHERE clause — it does NOT rely on RLS for correctness (a local/superuser
// connection bypasses RLS entirely). RLS remains the defense-in-depth backstop (proven separately in
// the Doc-8D suite).

import { prisma, type DbExecutor } from "../../../../shared/db";

/** The active-membership resolution result (Doc-4A §6.1 layer 1). `null` ⇒ no active membership. */
export interface ActiveMembershipRow {
  membershipId: string;
  roleId: string;
}

/** A delegation grant resolved to now (Doc-4A §6B.2 condition 3). */
export interface ActiveDelegationGrantRow {
  vendorProfileId: string;
  permissionSet: string[];
}

/** `identity.get_user.v1` read (Doc-4C §C3) — the personal-data-minimized user projection (Doc-2 §3.2);
 *  auth-mechanism fields (`auth_user_id`/`two_fa_jsonb`, and never a password/2FA secret) are NEVER
 *  selected (DC-4). Only the realized columns are projected — Doc-6C's `identity.users` has no
 *  `display_name`; `preferencesSummary` is the opaque `preferences_jsonb` (shape owned upstream).
 *  `null` ⇒ not found / not disclosable. */
export async function getUserRow(
  userId: string,
  db: DbExecutor = prisma,
): Promise<{ userId: string; status: string; preferencesSummary: unknown } | null> {
  const row = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, status: true, preferencesJsonb: true },
  });
  if (row === null) return null;
  return { userId: row.id, status: row.status, preferencesSummary: row.preferencesJsonb };
}

/** `identity.get_organization.v1` read (Doc-4C §C3) — the org projection (Doc-2 §10.2). `null` ⇒ not
 *  found / not disclosable. */
export async function getOrganizationRow(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<{
  organizationId: string;
  humanRef: string;
  name: string;
  slug: string;
  orgStatus: string;
} | null> {
  const row = await db.organization.findFirst({
    where: { id: organizationId, deletedAt: null },
    select: { id: true, humanRef: true, name: true, slug: true, orgStatus: true },
  });
  if (row === null) return null;
  return {
    organizationId: row.id,
    humanRef: row.humanRef,
    name: row.name,
    slug: row.slug,
    orgStatus: row.orgStatus,
  };
}

/**
 * `identity.get_membership.v1` read (Doc-4C §C3) — resolve the (user × org) link. Returns the FULL
 * membership state so consumers can read it (the access-formula input); the caller decides what `active`
 * means for the gate. `null` ⇒ no such membership (or not disclosable).
 */
export async function getMembershipRow(
  userId: string,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<{ membershipId: string; roleId: string; state: string } | null> {
  const row = await db.membership.findFirst({
    where: { userId, organizationId, deletedAt: null },
    select: { id: true, roleId: true, state: true },
  });
  if (row === null) return null;
  return { membershipId: row.id, roleId: row.roleId, state: row.state };
}

/**
 * Resolve the acting user's ACTIVE membership in the (active/representative) organization — Doc-4A §6.1
 * layer 1. Only `state = 'active'` participates in the access formula (Doc-4C §C3 `get_membership`).
 * `null` ⇒ no active membership ⇒ layer 1 fails closed.
 */
export async function findActiveMembership(
  userId: string,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<ActiveMembershipRow | null> {
  const row = await db.membership.findFirst({
    where: { userId, organizationId, state: "active", deletedAt: null },
    select: { id: true, roleId: true },
  });
  if (row === null) return null;
  return { membershipId: row.id, roleId: row.roleId };
}

/** Catalog lookup for a permission slug (Doc-2 §7). `null` ⇒ the slug is unknown — a §6.4 conformance
 *  gap (never a runtime grant). `space` distinguishes the tenant vs staff slug space (Invariant #2). */
export async function findPermissionBySlug(
  slug: string,
  db: DbExecutor = prisma,
): Promise<{ slug: string; space: "tenant" | "staff" } | null> {
  const row = await db.permission.findFirst({
    where: { slug },
    select: { slug: true, space: true },
  });
  if (row === null) return null;
  return { slug: row.slug, space: row.space };
}

/**
 * THE ORG-ANCHORED resolution (RV-0146 · Doc-6C §6.2a). Resolve the TENANT-space permission slugs the
 * member's bound role grants IN THE ACTIVE ORG — anchored on BOTH:
 *   - `role_id = :roleId` (the member's bound role, from their ACTIVE membership), AND
 *   - (`organization_id = :activeOrg` OR `organization_id IS NULL`) — the active-org composition rows
 *     PLUS the NULL system-bundle leg (the seeded Owner/Director/Manager/Officer bundles),
 *   - joined to `permissions` filtered to `space = 'tenant'` (the staff-space firewall's second layer —
 *     a `staff_*` slug can never enter this set even if a row maps a role to it).
 *
 * NEVER `role_id` alone: a forged `role_permissions` row pairing this role_id with ANOTHER org's
 * `organization_id` is excluded by the org anchor (it is neither `= active_org` nor NULL); a row
 * pairing a DIFFERENT org's role_id is excluded by the `role_id` anchor. So a cross-org forgery grants
 * nothing to anyone. This WHERE clause enforces that in the app layer independently of RLS.
 */
export async function resolveGrantedTenantSlugs(
  roleId: string,
  activeOrgId: string,
  db: DbExecutor = prisma,
): Promise<Set<string>> {
  const rows = await db.rolePermission.findMany({
    where: {
      roleId,
      OR: [{ organizationId: activeOrgId }, { organizationId: null }],
      permission: { space: "tenant" },
    },
    select: { permission: { select: { slug: true } } },
  });
  return new Set(rows.map((r) => r.permission.slug));
}

/**
 * Resolve the representative organization's ACTIVE, in-window delegation grant on the target vendor
 * profile — Doc-4A §6B.2 condition 3. Filters `status = 'active'`, live (not soft-deleted), and the
 * validity window covering `now` (`valid_from <= now` AND (`valid_to IS NULL` OR `valid_to > now`)).
 * Returns the grant's `permission_set` + its named `vendor_profile_id` (condition 4 anchor). `null` ⇒
 * no active, in-window grant.
 */
export async function findActiveDelegationGrant(
  representativeOrgId: string,
  vendorProfileId: string,
  now: Date,
  db: DbExecutor = prisma,
): Promise<ActiveDelegationGrantRow | null> {
  const row = await db.delegationGrant.findFirst({
    where: {
      representativeOrganizationId: representativeOrgId,
      vendorProfileId,
      status: "active",
      deletedAt: null,
      validFrom: { lte: now },
      OR: [{ validTo: null }, { validTo: { gt: now } }],
    },
    select: { vendorProfileId: true, permissionSetJsonb: true },
  });
  if (row === null) return null;
  // `permission_set_jsonb` is a JSON array of slug strings (Doc-2 §10.2); coerce defensively to strings.
  const permissionSet = Array.isArray(row.permissionSetJsonb)
    ? row.permissionSetJsonb.filter((v): v is string => typeof v === "string")
    : [];
  return { vendorProfileId: row.vendorProfileId, permissionSet };
}
