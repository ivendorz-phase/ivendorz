// M1 infrastructure (PRIVATE) — the `identity.delegation_grants` repository (Doc-2 §10.2 / Doc-6C §3.9).
// M1 reading/writing its OWN schema (allowed); other modules reach this only via the M1 contracts facade.
//
// The app-layer authorization/authority checks are PRIMARY (Doc-4C §C9; Doc-6C §6.2a: "App-layer authz is
// primary … RLS is the row-visibility backstop"). RLS is the dual-party backstop, already proven at IDN-1
// (`rls-identity-authz-tables`): `_party_read` (both orgs read), `_controlling_insert/_update/_delete`
// (only the controlling org — or platform staff — writes). The WRITE must run on the executor whose
// `app.active_org` GUC = the controlling org (User path) or whose `app.is_platform_staff` = true (System
// expiry sweep). This repository owns the SQL and knows NOTHING of audit policy — it returns DATA (the
// created/updated row + `old_value`/`new_value` field sets) so the COMMAND appends the audit.
//
// `vendor_profile_id` is a BARE UUID cross-module ref (→ M2, NO FK — DC-CR10); this repo never joins it.

import { Prisma, prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { DelegationGrantStatus } from "../../domain/state-machines/delegation-grant.state-machine";
import type { PermissionSpace } from "../../domain/policies/delegation-grant.policy";

/** The audited delegation-grant field set (Doc-2 §10.2) — the `old_value`/`new_value` audit shape. */
export interface DelegationGrantFieldSet {
  status: DelegationGrantStatus;
  representativeOrganizationId: string;
  vendorProfileId: string;
  permissionSet: string[];
  validFrom: Date;
  validTo: Date | null;
}

/** A live delegation-grant row resolved for a lifecycle mutation (suspend/revoke). `null` ⇒ not found. */
export interface DelegationGrantRow {
  id: string;
  controllingOrganizationId: string;
  representativeOrganizationId: string;
  vendorProfileId: string;
  status: DelegationGrantStatus;
  updatedAt: Date;
  fieldSet: DelegationGrantFieldSet;
}

/** A grant the System sweep found lapsed (`active`, `valid_to <= now`) — the teardown-seam inputs too. */
export interface ExpirableDelegationGrantRow {
  id: string;
  controllingOrganizationId: string;
  representativeOrganizationId: string;
  vendorProfileId: string;
  status: DelegationGrantStatus;
  fieldSet: DelegationGrantFieldSet;
}

function permissionSetOf(jsonb: unknown): string[] {
  return Array.isArray(jsonb) ? jsonb.filter((v): v is string => typeof v === "string") : [];
}

function fieldSetOf(row: {
  status: DelegationGrantStatus;
  representativeOrganizationId: string;
  vendorProfileId: string;
  permissionSetJsonb: unknown;
  validFrom: Date;
  validTo: Date | null;
}): DelegationGrantFieldSet {
  return {
    status: row.status,
    representativeOrganizationId: row.representativeOrganizationId,
    vendorProfileId: row.vendorProfileId,
    permissionSet: permissionSetOf(row.permissionSetJsonb),
    validFrom: row.validFrom,
    validTo: row.validTo,
  };
}

/**
 * The controlling org's ACTUALLY-HELD tenant slug set — the `permission_set ⊆ held` guard anchor (RV-0146
 * delegation leg). An org "actually holds" a slug iff some ACTIVE member holds it, resolved with the SAME
 * org-anchor as `check_permission` (RV-0146): for each active membership, `role_permissions` on the
 * member's bound `role_id` AND (`organization_id = :orgId` OR the NULL system-bundle leg), joined to
 * `permissions` filtered to `space = 'tenant'`. MEMBER-ANCHORED (not "every role that exists") so the ⊆
 * guard is meaningful — a slug no member holds is NOT delegable (an org cannot delegate authority it does
 * not itself hold; Doc-2 §5.10). The `space = 'tenant'` filter is the staff-space firewall's second layer
 * (a `staff_*` slug can never enter the held set). One indexed query over the org's active memberships.
 */
export async function resolveOrgHeldTenantSlugs(
  orgId: string,
  db: DbExecutor = prisma,
): Promise<Set<string>> {
  // Distinct role_ids bound by the org's ACTIVE members (the "actually-held" anchor).
  const memberships = await db.membership.findMany({
    where: { organizationId: orgId, state: "active", deletedAt: null },
    select: { roleId: true },
  });
  const roleIds = [...new Set(memberships.map((m) => m.roleId))];
  if (roleIds.length === 0) return new Set<string>();

  const rows = await db.rolePermission.findMany({
    where: {
      roleId: { in: roleIds },
      OR: [{ organizationId: orgId }, { organizationId: null }],
      permission: { space: "tenant" },
    },
    select: { permission: { select: { slug: true } } },
  });
  return new Set(rows.map((r) => r.permission.slug));
}

/** The Doc-2 §7 catalog spaces for the requested slugs (create REFERENCE + firewall inputs). Absent slug
 *  ⇒ omitted from the map (⇒ the policy reads it as `unknown_slug`). */
export async function findPermissionSpaces(
  slugs: readonly string[],
  db: DbExecutor = prisma,
): Promise<Map<string, PermissionSpace>> {
  const unique = [...new Set(slugs)];
  const rows = await db.permission.findMany({
    where: { slug: { in: unique } },
    select: { slug: true, space: true },
  });
  return new Map(rows.map((r) => [r.slug, r.space as PermissionSpace]));
}

/** Is `orgId` a live, ACTIVE organization? — the representative-org REFERENCE guard (Doc-4C §C9
 *  `identity_org_not_found`). M1 reads its OWN `organizations` table. */
export async function isActiveOrganization(
  orgId: string,
  db: DbExecutor = prisma,
): Promise<boolean> {
  const row = await db.organization.findFirst({
    where: { id: orgId, orgStatus: "active", deletedAt: null },
    select: { id: true },
  });
  return row !== null;
}

/** Load a live delegation grant for a lifecycle mutation (suspend/revoke). `null` ⇒ not found / soft-deleted. */
export async function findDelegationGrantById(
  delegationGrantId: string,
  db: DbExecutor = prisma,
): Promise<DelegationGrantRow | null> {
  const row = await db.delegationGrant.findFirst({
    where: { id: delegationGrantId, deletedAt: null },
    select: {
      id: true,
      controllingOrganizationId: true,
      representativeOrganizationId: true,
      vendorProfileId: true,
      status: true,
      updatedAt: true,
      permissionSetJsonb: true,
      validFrom: true,
      validTo: true,
    },
  });
  if (row === null) return null;
  return {
    id: row.id,
    controllingOrganizationId: row.controllingOrganizationId,
    representativeOrganizationId: row.representativeOrganizationId,
    vendorProfileId: row.vendorProfileId,
    status: row.status as DelegationGrantStatus,
    updatedAt: row.updatedAt,
    fieldSet: fieldSetOf({ ...row, status: row.status as DelegationGrantStatus }),
  };
}

/**
 * INSERT a delegation grant born ACTIVE — the Doc-2 §5.10 `draft → active` issue realized as one row
 * (the grant is created and immediately activated at issue; Doc-4C §C9 response `status = active`). The
 * command asserts `draft → active` on the state machine BEFORE calling this. `controllingOrganizationId`
 * = the SERVER-RESOLVED active org (Invariant #5) — the RLS `_controlling_insert` `WITH CHECK` re-verifies
 * it equals `app.active_org`. Returns the id, `updated_at`, and the `new_value` field set for the audit.
 */
export async function insertActiveDelegationGrant(
  params: {
    controllingOrganizationId: string;
    representativeOrganizationId: string;
    vendorProfileId: string;
    permissionSet: string[];
    validFrom: Date;
    validTo: Date | null;
    grantedBy: string;
    actorUserId: string;
  },
  db: DbExecutor = prisma,
): Promise<{
  id: string;
  status: DelegationGrantStatus;
  updatedAt: Date;
  newValue: DelegationGrantFieldSet;
}> {
  const id = uuidv7();
  const row = await db.delegationGrant.create({
    data: {
      id,
      controllingOrganizationId: params.controllingOrganizationId,
      representativeOrganizationId: params.representativeOrganizationId,
      vendorProfileId: params.vendorProfileId,
      permissionSetJsonb: params.permissionSet as Prisma.InputJsonValue,
      validFrom: params.validFrom,
      ...(params.validTo !== null ? { validTo: params.validTo } : {}),
      grantedBy: params.grantedBy,
      status: "active",
      createdBy: params.actorUserId,
      updatedBy: params.actorUserId,
    },
  });
  return {
    id: row.id,
    status: row.status as DelegationGrantStatus,
    updatedAt: row.updatedAt,
    newValue: fieldSetOf({ ...row, status: row.status as DelegationGrantStatus }),
  };
}

/**
 * Advance a grant's status `from → to` under a WRITE-TIME compare-and-set on the source status (the
 * concurrency + terminal-state guard: a row already moved on by a concurrent pass matches zero rows). The
 * COMMAND has already asserted `from → to` on the state machine; this only writes the legal edge. Returns
 * `null` when zero rows matched (lost race / status already changed) so the command surfaces STATE. On
 * success returns the new `updated_at` + the old/new field sets. `actorUserId = null` for the System sweep.
 */
export async function transitionDelegationGrantStatus(
  params: {
    id: string;
    from: DelegationGrantStatus;
    to: DelegationGrantStatus;
    actorUserId: string | null;
  },
  db: DbExecutor = prisma,
): Promise<{
  updatedAt: Date;
  oldValue: DelegationGrantFieldSet;
  newValue: DelegationGrantFieldSet;
} | null> {
  // Read the current row (live, at the source status) inside the caller's tx. Returns null when the
  // pre-condition no longer holds (already transitioned / soft-deleted) → the command maps to STATE.
  const current = await db.delegationGrant.findFirst({
    where: { id: params.id, status: params.from, deletedAt: null },
    select: {
      status: true,
      representativeOrganizationId: true,
      vendorProfileId: true,
      permissionSetJsonb: true,
      validFrom: true,
      validTo: true,
    },
  });
  if (current === null) return null;
  const oldValue = fieldSetOf({ ...current, status: current.status as DelegationGrantStatus });

  // Compare-and-set on source status: a concurrent transition between the read and this write matches
  // zero rows → a 0-count no-op the command reports as STATE (never a same-state re-write).
  const advanced = await db.delegationGrant.updateMany({
    where: { id: params.id, status: params.from, deletedAt: null },
    data: { status: params.to, updatedBy: params.actorUserId },
  });
  if (advanced.count !== 1) return null;

  const after = await db.delegationGrant.findFirst({
    where: { id: params.id },
    select: {
      status: true,
      updatedAt: true,
      representativeOrganizationId: true,
      vendorProfileId: true,
      permissionSetJsonb: true,
      validFrom: true,
      validTo: true,
    },
  });
  // `after` is non-null immediately post-advance (same tx); guard for the type only.
  if (after === null) return null;
  return {
    updatedAt: after.updatedAt,
    oldValue,
    newValue: fieldSetOf({ ...after, status: after.status as DelegationGrantStatus }),
  };
}

/**
 * Find grants the System sweep must expire (Doc-4C §C9 `expire_delegation_grant`): `status = 'active'`
 * AND a non-NULL `valid_to` at/PAST `now` (open-ended grants — `valid_to IS NULL` — never expire). Serves
 * the `delegation_grants_expiry_idx(status, valid_to)` index. The `active`-only filter IS the idempotency
 * guard (a terminal grant is never re-expired). `suspended` grants are deliberately EXCLUDED — the
 * `suspended`-at-`valid_to`-lapse disposition is carried on `[ESC-IDN-DELEG-EXPIRY]` (Doc-2 §5.10 silent).
 */
export async function findExpirableDelegationGrants(
  now: Date,
  batchSize: number,
  db: DbExecutor = prisma,
): Promise<ExpirableDelegationGrantRow[]> {
  const rows = await db.delegationGrant.findMany({
    where: { status: "active", deletedAt: null, validTo: { not: null, lte: now } },
    orderBy: { validTo: "asc" },
    take: batchSize,
    select: {
      id: true,
      controllingOrganizationId: true,
      representativeOrganizationId: true,
      vendorProfileId: true,
      status: true,
      permissionSetJsonb: true,
      validFrom: true,
      validTo: true,
    },
  });
  return rows.map((row) => ({
    id: row.id,
    controllingOrganizationId: row.controllingOrganizationId,
    representativeOrganizationId: row.representativeOrganizationId,
    vendorProfileId: row.vendorProfileId,
    status: row.status as DelegationGrantStatus,
    fieldSet: fieldSetOf({ ...row, status: row.status as DelegationGrantStatus }),
  }));
}
