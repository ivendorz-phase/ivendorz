// M1 infrastructure (PRIVATE) — the `identity.roles` / `role_permissions` / `permissions` repository
// (Doc-2 §10.2 / Doc-6C §3.4–§3.6). M1 reading/writing its OWN schema (allowed); other modules reach
// this only via the M1 contracts facade, never by importing infrastructure.
//
// The app-layer authorization checks are PRIMARY (Doc-4C §C7; Doc-6C §6.2a). RLS (`roles_read` =
// `active_org OR organization_id IS NULL`; `roles_write` = own-org OR staff) is the backstop. Every
// read/write here carries its OWN explicit org anchor in the WHERE clause — it does NOT rely on RLS
// for correctness. This repository owns the SQL and knows NOTHING of audit policy — it returns DATA
// (the old/new field sets + resolved facts) so the COMMAND appends the audit and the POLICY decides.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { PermissionSpace } from "../../domain/policies/role-composition.policy";

// ─────────────────────────────────────────────────────────────────────────────
// Permission catalog reads (platform-owned reference data; `list_permissions` + the composition guard).
// ─────────────────────────────────────────────────────────────────────────────

/** A permission-catalog row projection (Doc-4C §C7 `list_permissions` — `{ slug, description, space }`). */
export interface PermissionCatalogRow {
  slug: string;
  description: string | null;
  space: PermissionSpace;
}

/**
 * List the platform permission catalog (Doc-4C §C7 `list_permissions` — platform reference data,
 * read-open RLS). Optional `space` filter (frozen `space : enum(tenant|staff) : optional : filter`).
 * Deterministic total order by `slug` (the frozen sort; tiebreaker `slug` — PassB:457). Runs on the
 * shared client: the catalog is not org-scoped (Scope = authenticated).
 */
export async function listPermissionCatalog(
  spaceFilter: PermissionSpace | undefined,
  db: DbExecutor = prisma,
): Promise<PermissionCatalogRow[]> {
  const rows = await db.permission.findMany({
    where: spaceFilter === undefined ? {} : { space: spaceFilter },
    orderBy: { slug: "asc" },
    select: { slug: true, description: true, space: true },
  });
  return rows.map((r) => ({ slug: r.slug, description: r.description, space: r.space }));
}

/** Resolve the catalog fact the composition guard needs: for each requested slug, its `id` + `space`
 *  (absent from the map ⇒ the slug is unknown — §6.4). Fetched by slug-set (never the whole catalog). */
export async function resolveRequestedPermissions(
  slugs: readonly string[],
  db: DbExecutor = prisma,
): Promise<Map<string, { id: string; space: PermissionSpace }>> {
  if (slugs.length === 0) return new Map();
  const rows = await db.permission.findMany({
    where: { slug: { in: [...new Set(slugs)] } },
    select: { id: true, slug: true, space: true },
  });
  return new Map(rows.map((r) => [r.slug, { id: r.id, space: r.space }]));
}

// ─────────────────────────────────────────────────────────────────────────────
// Role reads (`list_roles` + the write-command SCOPE loads).
// ─────────────────────────────────────────────────────────────────────────────

/** A role-list projection (Doc-4C §C7 `list_roles` — `{ role_id, name, is_system_bundle }`). */
export interface RoleListRow {
  roleId: string;
  name: string;
  isSystemBundle: boolean;
}

/**
 * List the caller's active-org roles + the platform system-bundle seeds (Doc-4C §C7 `list_roles`
 * Visibility: "caller's org roles + platform seeds only", §7). `includeSystem` (frozen
 * `include_system : boolean : default true`) toggles the NULL-org seed leg. Deterministic total order
 * by `name` (tiebreaker `role_id` — the frozen sort, PassB:468). Live rows only (soft-deleted excluded).
 * NEVER another tenant's custom role (the org anchor is explicit; §7.5).
 */
export async function listRolesForOrg(
  orgId: string,
  includeSystem: boolean,
  db: DbExecutor = prisma,
): Promise<RoleListRow[]> {
  const rows = await db.role.findMany({
    where: {
      deletedAt: null,
      OR: includeSystem
        ? [{ organizationId: orgId }, { organizationId: null, isSystemBundle: true }]
        : [{ organizationId: orgId }],
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: { id: true, name: true, isSystemBundle: true },
  });
  return rows.map((r) => ({ roleId: r.id, name: r.name, isSystemBundle: r.isSystemBundle }));
}

/** A role row loaded for a §C7 write command (SCOPE + concurrency + system-bundle discrimination). */
export interface ManageableRoleRow {
  id: string;
  /** `null` ⇒ a platform system bundle (org_id NULL); a uuid ⇒ a tenant custom role. */
  organizationId: string | null;
  name: string;
  isSystemBundle: boolean;
  /** The row's `updated_at` (the caller's stale-view check + the losing-write ETag re-read). */
  updatedAt: Date;
}

/**
 * The write-command SCOPE load: a LIVE role visible to the active org — its OWN custom role
 * (`organization_id = orgId`) OR a platform system bundle (`organization_id IS NULL AND
 * is_system_bundle`) — the `roles_read` visibility set. `null` = nonexistent OR a FOREIGN tenant's
 * custom role (byte-identical NOT_FOUND collapse; §7.5). A system bundle IS returned (globally
 * readable) so the command can reject it at BUSINESS with `identity_role_system_protected` (never a
 * 404) — the frozen register's system-protection leg.
 */
export async function findManageableRole(
  roleId: string,
  orgId: string,
  db: DbExecutor = prisma,
): Promise<ManageableRoleRow | null> {
  const row = await db.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null,
      OR: [{ organizationId: orgId }, { organizationId: null, isSystemBundle: true }],
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      isSystemBundle: true,
      updatedAt: true,
    },
  });
  return row === null ? null : row;
}

/** A live custom role of the org with the given name (`create_role` / `update_role` uniqueness
 *  pre-check — a clean CONFLICT before the DB `roles_org_name_live_uq` race backstop). Case-
 *  insensitive (display-label safety — see the policy). `excludeRoleId` skips the row itself on rename. */
export async function findLiveRoleByName(
  orgId: string,
  name: string,
  excludeRoleId: string | undefined,
  db: DbExecutor = prisma,
): Promise<{ id: string } | null> {
  const row = await db.role.findFirst({
    where: {
      organizationId: orgId,
      deletedAt: null,
      name: { equals: name.trim(), mode: "insensitive" },
      ...(excludeRoleId !== undefined ? { id: { not: excludeRoleId } } : {}),
    },
    select: { id: true },
  });
  return row === null ? null : { id: row.id };
}

/** Re-read a role's CURRENT `updated_at` (the Doc-5A §9.5 current-token carriage on a losing-write
 *  leg — the 6.3/6.5 lost-CAS re-read precedent). `null` when the row is gone. */
export async function readRoleUpdatedAt(
  roleId: string,
  db: DbExecutor = prisma,
): Promise<Date | null> {
  const row = await db.role.findFirst({ where: { id: roleId }, select: { updatedAt: true } });
  return row === null ? null : row.updatedAt;
}

// ─────────────────────────────────────────────────────────────────────────────
// Role writes (create / rename / compose / soft-delete). CAS on `updated_at` where a token applies.
// ─────────────────────────────────────────────────────────────────────────────

/** Prisma P2002 (unique-constraint violation) discrimination — the `roles_org_name_live_uq` index. */
export function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" && e !== null && "code" in e && (e as { code?: unknown }).code === "P2002"
  );
}

/**
 * Insert a NEW tenant custom role (`create_role` State Effects — a bundle row `organization_id =
 * orgId`, `is_system_bundle = false`) + its initial `role_permissions` composition, in ONE
 * transaction. Throws Prisma P2002 on `roles_org_name_live_uq` when a concurrent create won the
 * (org, name) — the command maps it to the frozen `identity_role_name_conflict` CONFLICT. The
 * permission ids are pre-resolved by the command (validated ∈ the assignable catalog).
 */
export async function insertCustomRole(
  params: {
    organizationId: string;
    name: string;
    permissionIds: readonly string[];
    actorUserId: string;
  },
  db: DbExecutor = prisma,
): Promise<{ roleId: string }> {
  const roleId = uuidv7(); // M0 ID generator — never a raw UUID in app code.
  await db.role.create({
    data: {
      id: roleId,
      organizationId: params.organizationId,
      name: params.name,
      isSystemBundle: false,
      createdBy: params.actorUserId,
      updatedBy: params.actorUserId,
    },
    select: { id: true },
  });
  if (params.permissionIds.length > 0) {
    await db.rolePermission.createMany({
      data: params.permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
        organizationId: params.organizationId,
        createdBy: params.actorUserId,
        updatedBy: params.actorUserId,
      })),
      skipDuplicates: true,
    });
  }
  return { roleId };
}

/**
 * Rename a role under a WRITE-TIME compare-and-set on `updated_at` (`update_role`). CAS scoped to the
 * ACTIVE ORG's OWN live custom role (`organization_id = orgId` — a system bundle NEVER matches, and
 * the command has already rejected it at BUSINESS). Returns the new `updated_at` on success, `null`
 * on a lost race (stale token / concurrent write) so the command surfaces the losing-write leg.
 * Throws P2002 on `roles_org_name_live_uq` (a concurrent rename to the same name).
 */
export async function renameRole(
  params: {
    roleId: string;
    organizationId: string;
    name: string;
    expectedUpdatedAt: Date;
    actorUserId: string;
  },
  db: DbExecutor = prisma,
): Promise<{ updatedAt: Date; oldName: string } | null> {
  const current = await db.role.findFirst({
    where: { id: params.roleId, organizationId: params.organizationId, deletedAt: null },
    select: { name: true },
  });
  if (current === null) return null;

  const advanced = await db.role.updateMany({
    where: {
      id: params.roleId,
      organizationId: params.organizationId,
      deletedAt: null,
      updatedAt: params.expectedUpdatedAt,
    },
    data: { name: params.name, updatedBy: params.actorUserId },
  });
  if (advanced.count !== 1) return null;

  const after = await db.role.findFirst({
    where: { id: params.roleId },
    select: { updatedAt: true },
  });
  if (after === null) return null;
  return { updatedAt: after.updatedAt, oldName: current.name };
}

/** The audited compose result (Doc-4C §C7 `set_role_permissions` — the effective set + the leg). */
export interface ComposeResult {
  updatedAt: Date;
  addedSlugs: string[];
  removedSlugs: string[];
  effectiveSlugs: string[];
}

/**
 * Compose a role's `role_permissions` (`set_role_permissions` — add/remove the N:N rows) under a
 * compare-and-set on the ROLE's `updated_at` (the single-execution + concurrency guard; the
 * composition child-table itself carries no token). ONE transaction: (1) CAS-bump the role's
 * `updated_at` (scoped to the org's OWN live custom role), (2) add rows (skip existing — an add of a
 * held slug is a no-op), (3) remove rows (`row removal = revoked, audited` — SD=NO hard delete of the
 * link), (4) re-read the effective set. `null` on a lost CAS. `addPermissionIds`/`removeSlugs` are
 * pre-validated by the command (∈ the assignable catalog).
 */
export async function composeRolePermissions(
  params: {
    roleId: string;
    organizationId: string;
    expectedUpdatedAt: Date;
    add: ReadonlyArray<{ slug: string; permissionId: string }>;
    remove: ReadonlyArray<{ slug: string; permissionId: string }>;
    actorUserId: string;
  },
  db: DbExecutor = prisma,
): Promise<ComposeResult | null> {
  // (1) CAS-bump the ROLE token (own-org custom role only). `updatedBy` forces a real UPDATE so the
  //     @updatedAt token advances even when add/remove are otherwise no-ops.
  const advanced = await db.role.updateMany({
    where: {
      id: params.roleId,
      organizationId: params.organizationId,
      deletedAt: null,
      updatedAt: params.expectedUpdatedAt,
    },
    data: { updatedBy: params.actorUserId },
  });
  if (advanced.count !== 1) return null;

  // (2) ADD — insert the missing links (skipDuplicates: an add of a held slug is a no-op, not a dup error).
  if (params.add.length > 0) {
    await db.rolePermission.createMany({
      data: params.add.map((a) => ({
        roleId: params.roleId,
        permissionId: a.permissionId,
        organizationId: params.organizationId,
        createdBy: params.actorUserId,
        updatedBy: params.actorUserId,
      })),
      skipDuplicates: true,
    });
  }

  // (3) REMOVE — the audited revocation (SD=NO: the link row is removed, the audit records it).
  const removedActually: string[] = [];
  if (params.remove.length > 0) {
    const removed = await db.rolePermission.deleteMany({
      where: {
        roleId: params.roleId,
        organizationId: params.organizationId,
        permissionId: { in: params.remove.map((r) => r.permissionId) },
      },
    });
    // Record which slugs were actually present-and-removed (a remove of an unheld slug is a no-op).
    if (removed.count > 0) {
      for (const r of params.remove) removedActually.push(r.slug);
    }
  }

  const [after, effective] = await Promise.all([
    db.role.findFirst({ where: { id: params.roleId }, select: { updatedAt: true } }),
    db.rolePermission.findMany({
      where: { roleId: params.roleId, organizationId: params.organizationId },
      select: { permission: { select: { slug: true } } },
    }),
  ]);
  if (after === null) return null;

  return {
    updatedAt: after.updatedAt,
    addedSlugs: params.add.map((a) => a.slug),
    removedSlugs: removedActually,
    effectiveSlugs: effective.map((e) => e.permission.slug).sort(),
  };
}

/** Count LIVE, non-`removed` memberships bound to a role (`delete_role` BUSINESS "no active member
 *  still bound to the role"). A `removed` membership is departed/terminal — never "bound". > 0 ⇒ the
 *  frozen `identity_role_in_use`. */
export async function countLiveBoundMemberships(
  roleId: string,
  db: DbExecutor = prisma,
): Promise<number> {
  return db.membership.count({
    where: {
      roleId,
      deletedAt: null,
      state: { in: ["invited", "pending", "active", "suspended"] },
    },
  });
}

/**
 * ADR-012 SOFT-DELETE a tenant custom role (`delete_role` — NEVER a hard delete; Invariant #8) under
 * a compare-and-set on `updated_at`, scoped to the org's OWN live custom role. Sets the soft-delete
 * markers; `updated_at` advances. Returns the row's prior name for the audit `old_value`, or `null`
 * on a lost CAS (stale token / already deleted / concurrent write). The `role_permissions` links are
 * left intact (SD=NO; the role tombstone is the authority — no live membership resolves through a
 * soft-deleted role, deletion having been blocked while members were bound).
 */
export async function softDeleteRole(
  params: {
    roleId: string;
    organizationId: string;
    expectedUpdatedAt: Date;
    actorUserId: string;
    reason: string | null;
  },
  db: DbExecutor = prisma,
): Promise<{ name: string } | null> {
  const current = await db.role.findFirst({
    where: { id: params.roleId, organizationId: params.organizationId, deletedAt: null },
    select: { name: true },
  });
  if (current === null) return null;

  const advanced = await db.role.updateMany({
    where: {
      id: params.roleId,
      organizationId: params.organizationId,
      deletedAt: null,
      updatedAt: params.expectedUpdatedAt,
    },
    data: {
      deletedAt: new Date(),
      deletedBy: params.actorUserId,
      deleteReason: params.reason,
      updatedBy: params.actorUserId,
    },
  });
  if (advanced.count !== 1) return null;
  return { name: current.name };
}
