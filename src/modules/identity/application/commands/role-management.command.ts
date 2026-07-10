// M1 application (PRIVATE) — the three §C7 role management commands (W2-IDN-6.4):
//   `identity.update_role.v1`          (Doc-4C §C7 PassB:486–496; Doc-5C §5.1 row 20) — PATCH rename
//   `identity.set_role_permissions.v1` (Doc-4C §C7 PassB:498–509; Doc-5C §5.1 row 21) — POST compose
//   `identity.delete_role.v1`          (Doc-4C §C7 PassB:511–521; Doc-5C §5.1 row 22) — DELETE (ADR-012)
// Shared tenant house shape (the 6.3 membership-lifecycle precedent): SYNTAX → AUTHZ
// (`can_manage_users` via the wired `check_permission` root; Delegation NOT eligible) → SCOPE (a live
// role VISIBLE to the active org — own custom role OR a system bundle; byte-identical NOT_FOUND
// collapse for a foreign/absent target) → [REFERENCE, set-perms only] → BUSINESS → stale body-token
// check → CAS write on `updated_at` → atomic audit (D7).
//
// THE SYSTEM-BUNDLE IMMUTABILITY FIREWALL (Invariant #2 — binding): the 4 system bundles
// (`Owner/Director/Manager/Officer`, `organization_id = NULL`, `is_system_bundle = true`) are
// IMMUTABLE — update/set-perms/delete on one is rejected `identity_role_system_protected` (BUSINESS
// 422; PassB:492/:504/:517). System bundles ARE in the SCOPE-visible set (globally readable) so the
// rejection is the frozen system-protection leg, never a 404. RLS `roles_write` (NULL-org = staff/
// System only) is the defense-in-depth backstop behind this app-layer guard.
//
// THE COMPOSITION FIREWALL (set_role_permissions — Invariant #2 + DC-CR7): every add/remove slug must
// be an ASSIGNABLE tenant slug (∈ catalog · never `staff_*` · never ownership-class) via the pure
// `role-composition.policy` — all three non-assignable reasons map to the frozen REFERENCE
// `identity_permission_slug_unknown` (422, byte-identical). Removal = an audited revocation (SD=NO;
// PassB:503/:509).
//
// `updated_at` carriage (the RV-0153 call-1 discipline): NO §C7 contract declares `Concurrency:
// optimistic` and NO §C7 register authors a concurrency-CONFLICT code — `updated_at` is the frozen
// REQUIRED request-BODY field; a stale ARRIVAL VIEW is the in-register VALIDATION 400; a LOSING
// concurrent write (lost CAS) is the in-register VALIDATION 400 CARRYING the current token (`ETag`,
// §9.5/§9.6 — roles have NO STATE code, so the losing write collapses to VALIDATION not STATE, the
// call-13 token-only-on-genuine-loss discipline). No lock-based serialization: roles carry no
// cross-row invariant (no Last-Owner analog) — the per-row CAS is the whole concurrency story.
//
// Events: none (§8 — [DC-1]). Idempotency (§B.6): required; window `identity.command_dedup_window`
// (Doc-3 v1.9 key #1) — the composition owns the replay lookup; NO claim (the CAS is the
// single-execution guard — the 6.3 CAS-covered posture, not a create).

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  composeRolePermissions,
  countLiveBoundMemberships,
  findLiveRoleByName,
  findManageableRole,
  isUniqueViolation,
  readRoleUpdatedAt,
  renameRole,
  resolveRequestedPermissions,
  softDeleteRole,
  type ManageableRoleRow,
} from "../../infrastructure/data/role.repository";
import {
  isReservedSystemBundleName,
  validateAssignableSlugs,
} from "../../domain/policies/role-composition.policy";
import { ROLE_ENTITY_TYPE, RoleAuditAction } from "../../domain/audit-actions";
import { checkPermission } from "../queries/check-permission.query";
import { MANAGE_USERS_SLUG } from "./invite-member.command";
import { ROLE_NAME_MAX_LENGTH, ROLE_PERMISSION_SLUGS_MAX } from "./create-role.command";
import type {
  CheckPermissionInput,
  CheckPermissionResult,
  DeleteRoleInput,
  DeleteRoleOutcome,
  RoleError,
  SetRolePermissionsInput,
  SetRolePermissionsOutcome,
  UpdateRoleInput,
  UpdateRoleOutcome,
} from "../../contracts/types";

// Doc-4C §C7 error registers (PassB:492/:504/:517 — frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_role_invalid_input";
const FORBIDDEN_CODE = "identity_role_forbidden";
const NOT_FOUND_CODE = "identity_role_not_found";
const SLUG_UNKNOWN_CODE = "identity_permission_slug_unknown";
const SYSTEM_PROTECTED_CODE = "identity_role_system_protected";
const NAME_CONFLICT_CODE = "identity_role_name_conflict";
const ROLE_IN_USE_CODE = "identity_role_in_use";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z][a-z0-9_]*$/;

/** `reason : string : optional` (delete) — bounded [realization convention] (the ADMIN_REASON precedent). */
export const ROLE_DELETE_REASON_MAX_LENGTH = 500;

/** The server-resolved request context (shared by the three management commands). */
export interface RoleManagementContext {
  /** The acting `identity.users` id (Invariant #5). */
  userId: string;
  /** The SERVER-RESOLVED active org — must own the target custom role. */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected services (D7 rule 4). `authorize` is injectable for tests; the production default is the
 *  M1 `check_permission` root itself (never a shadow check). */
export interface RoleManagementDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** The authorization root (defaults to `identity.check_permission` — the single decider). */
  authorize?: (input: CheckPermissionInput, db?: DbExecutor) => Promise<CheckPermissionResult>;
}

function fail(errorClass: RoleError["errorClass"], errorCode: string, message: string): RoleError {
  return { errorClass, errorCode, message };
}

/**
 * The shared SYNTAX(uuid) → AUTHZ(`can_manage_users`) → SCOPE(visible live role) prelude. Returns the
 * resolved role row, or a `RoleError` (403 / 404 collapse). The BUSINESS system-bundle check is left
 * to each command (its frozen position relative to REFERENCE differs: set_role_permissions authors a
 * REFERENCE stage BEFORE its BUSINESS system-protection leg — PassB:503).
 */
async function authorizeAndScope(
  roleId: string,
  ctx: RoleManagementContext,
  deps: RoleManagementDeps,
  db: DbExecutor,
): Promise<{ ok: true; role: ManageableRoleRow } | { ok: false; error: RoleError }> {
  // (1) SYNTAX — the path `{id}` uuid.
  if (typeof roleId !== "string" || !UUID_PATTERN.test(roleId)) {
    return { ok: false, error: fail("VALIDATION", INVALID_INPUT_CODE, "id must be a UUID.") };
  }
  // (2) AUTHZ — `can_manage_users` (§11.2 category 3 precedes SCOPE — a caller without the slug learns
  //     nothing about the target). Delegation NOT eligible: membership path only.
  const authorize =
    deps.authorize ??
    ((i: CheckPermissionInput, d?: DbExecutor) => checkPermission(i, undefined, d));
  const decision = await authorize(
    { userId: ctx.userId, organizationId: ctx.activeOrgId, permissionSlug: MANAGE_USERS_SLUG },
    db,
  );
  if (decision.decision !== "allow" || decision.satisfiedBy !== "membership") {
    return {
      ok: false,
      error: fail("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to manage roles."),
    };
  }
  // (3) SCOPE — a live role visible to the active org (own custom OR a system bundle). Absent OR a
  //     foreign tenant's role → byte-identical NOT_FOUND (§B.4 SCOPE / §7.5).
  const role = await findManageableRole(roleId, ctx.activeOrgId, db);
  if (role === null) {
    return { ok: false, error: fail("NOT_FOUND", NOT_FOUND_CODE, "Not found.") };
  }
  return { ok: true, role };
}

/** The system-bundle BUSINESS leg (Invariant #2 immutability — PassB:492/:504/:517). */
function systemBundleGuard(role: ManageableRoleRow): RoleError | null {
  if (role.isSystemBundle || role.organizationId === null) {
    return fail(
      "BUSINESS",
      SYSTEM_PROTECTED_CODE,
      "system role bundles are immutable and cannot be modified or deleted.",
    );
  }
  return null;
}

/** The stale-arrival-view check (VALIDATION 400) — body token ≠ live token. No current token carried
 *  (only a genuine losing CAS carries `ETag` — the call-13 discipline). */
function staleView(role: ManageableRoleRow, bodyUpdatedAt: Date): RoleError | null {
  if (role.updatedAt.getTime() !== bodyUpdatedAt.getTime()) {
    return fail(
      "VALIDATION",
      INVALID_INPUT_CODE,
      "the role was modified concurrently; reload and retry.",
    );
  }
  return null;
}

/** Build the losing-write error (VALIDATION 400 CARRYING the current token via `ETag`). */
async function losingWrite(roleId: string, db: DbExecutor): Promise<RoleError> {
  const current = await readRoleUpdatedAt(roleId, db);
  return {
    errorClass: "VALIDATION",
    errorCode: INVALID_INPUT_CODE,
    message: "the role was modified concurrently; reload and retry.",
    ...(current !== null ? { currentUpdatedAt: current } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// `identity.update_role.v1` — PATCH rename (Doc-4C §C7). MUST run INSIDE `withActiveOrgContext`.
// ─────────────────────────────────────────────────────────────────────────────

export async function updateRoleCommand(
  input: UpdateRoleInput,
  ctx: RoleManagementContext,
  deps: RoleManagementDeps,
  db: DbExecutor = prisma,
): Promise<UpdateRoleOutcome> {
  // SYNTAX (contract-specific): `updated_at` required; `name` (optional) bounded when supplied.
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return { ok: false, error: fail("VALIDATION", INVALID_INPUT_CODE, "updated_at is required.") };
  }
  if (
    input.name !== undefined &&
    (typeof input.name !== "string" ||
      input.name.trim().length === 0 ||
      input.name.length > ROLE_NAME_MAX_LENGTH)
  ) {
    return {
      ok: false,
      error: fail(
        "VALIDATION",
        INVALID_INPUT_CODE,
        `name must be 1..${ROLE_NAME_MAX_LENGTH} characters.`,
      ),
    };
  }

  const scoped = await authorizeAndScope(input.roleId, ctx, deps, db);
  if (!scoped.ok) return { ok: false, error: scoped.error };
  const { role } = scoped;

  // BUSINESS — system bundle immutable (metadata not renamable, PassB:496).
  const protectedErr = systemBundleGuard(role);
  if (protectedErr !== null) return { ok: false, error: protectedErr };

  const newName = input.name?.trim();
  if (newName !== undefined) {
    // BUSINESS — not a reserved system-bundle name; unique-per-org (clean pre-check; DB index is the race).
    if (isReservedSystemBundleName(newName)) {
      return {
        ok: false,
        error: fail("CONFLICT", NAME_CONFLICT_CODE, "name is reserved for a system role bundle."),
      };
    }
    const clash = await findLiveRoleByName(ctx.activeOrgId, newName, role.id, db);
    if (clash !== null) {
      return {
        ok: false,
        error: fail("CONFLICT", NAME_CONFLICT_CODE, "a role with this name already exists."),
      };
    }
  }

  // Stale arrival view (VALIDATION 400).
  const stale = staleView(role, input.updatedAt);
  if (stale !== null) return { ok: false, error: stale };

  // No name supplied ⇒ nothing to change; return the current state (a partial no-op PATCH). We still
  // require the token to match (above) so a stale no-op is rejected consistently.
  if (newName === undefined) {
    return { ok: true, result: { roleId: role.id, name: role.name, updatedAt: role.updatedAt } };
  }

  // WRITE — CAS rename on (org × updated_at). A lost race is the losing-write leg.
  let written: Awaited<ReturnType<typeof renameRole>>;
  try {
    written = await renameRole(
      {
        roleId: role.id,
        organizationId: ctx.activeOrgId,
        name: newName,
        expectedUpdatedAt: input.updatedAt,
        actorUserId: ctx.userId,
      },
      db,
    );
  } catch (e) {
    if (isUniqueViolation(e)) {
      return {
        ok: false,
        error: fail("CONFLICT", NAME_CONFLICT_CODE, "a role with this name already exists."),
      };
    }
    throw e;
  }
  if (written === null) {
    return { ok: false, error: await losingWrite(role.id, db) };
  }

  // AUDIT — the ENUMERATED §9 "role/permission change" action, atomic (same tx; D7).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: ROLE_ENTITY_TYPE,
      entityId: role.id,
      action: RoleAuditAction.UPDATED,
      oldValue: { name: written.oldName },
      newValue: { name: newName },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { roleId: role.id, name: newName, updatedAt: written.updatedAt } };
}

// ─────────────────────────────────────────────────────────────────────────────
// `identity.set_role_permissions.v1` — POST compose (Doc-4C §C7). MUST run INSIDE `withActiveOrgContext`.
// ─────────────────────────────────────────────────────────────────────────────

export async function setRolePermissionsCommand(
  input: SetRolePermissionsInput,
  ctx: RoleManagementContext,
  deps: RoleManagementDeps,
  db: DbExecutor = prisma,
): Promise<SetRolePermissionsOutcome> {
  // SYNTAX — `updated_at` required; add/remove slug formats + bounds; at least one add or remove.
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return { ok: false, error: fail("VALIDATION", INVALID_INPUT_CODE, "updated_at is required.") };
  }
  const addSlugs = input.addSlugs ?? [];
  const removeSlugs = input.removeSlugs ?? [];
  for (const [label, list] of [
    ["add_slugs", addSlugs],
    ["remove_slugs", removeSlugs],
  ] as const) {
    if (!Array.isArray(list) || list.length > ROLE_PERMISSION_SLUGS_MAX) {
      return {
        ok: false,
        error: fail(
          "VALIDATION",
          INVALID_INPUT_CODE,
          `${label} must be a list of at most ${ROLE_PERMISSION_SLUGS_MAX} slugs.`,
        ),
      };
    }
    for (const slug of list) {
      if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
        return {
          ok: false,
          error: fail(
            "VALIDATION",
            INVALID_INPUT_CODE,
            `each ${label} entry must be a lower_snake_case slug.`,
          ),
        };
      }
    }
  }
  if (addSlugs.length === 0 && removeSlugs.length === 0) {
    return {
      ok: false,
      error: fail(
        "VALIDATION",
        INVALID_INPUT_CODE,
        "at least one of add_slugs / remove_slugs is required.",
      ),
    };
  }

  const scoped = await authorizeAndScope(input.roleId, ctx, deps, db);
  if (!scoped.ok) return { ok: false, error: scoped.error };
  const { role } = scoped;

  // REFERENCE (PassB:503 "every add/remove slug ∈ §7 catalog") + the composition firewall — every
  // add AND remove slug must be an ASSIGNABLE tenant slug (∈ catalog · never staff · never
  // ownership-class). All three reasons → the frozen REFERENCE `identity_permission_slug_unknown`.
  const allSlugs = [...new Set([...addSlugs, ...removeSlugs])];
  const catalog = await resolveRequestedPermissions(allSlugs, db);
  const spaceBySlug = new Map([...catalog].map(([slug, v]) => [slug, v.space]));
  const slugCheck = validateAssignableSlugs(allSlugs, spaceBySlug);
  if (!slugCheck.ok) {
    return {
      ok: false,
      error: fail(
        "REFERENCE",
        SLUG_UNKNOWN_CODE,
        "permission_slug is not an assignable permission for a custom role.",
      ),
    };
  }

  // BUSINESS — system bundle composition is immutable (PassB:504). AFTER REFERENCE (frozen order).
  const protectedErr = systemBundleGuard(role);
  if (protectedErr !== null) return { ok: false, error: protectedErr };

  // Stale arrival view (VALIDATION 400).
  const stale = staleView(role, input.updatedAt);
  if (stale !== null) return { ok: false, error: stale };

  // WRITE — CAS-bump the role token + add/remove the role_permissions links (removal = audited
  // revocation). A lost CAS is the losing-write leg.
  const written = await composeRolePermissions(
    {
      roleId: role.id,
      organizationId: ctx.activeOrgId,
      expectedUpdatedAt: input.updatedAt,
      add: addSlugs.map((slug) => ({ slug, permissionId: catalog.get(slug)!.id })),
      remove: removeSlugs.map((slug) => ({ slug, permissionId: catalog.get(slug)!.id })),
      actorUserId: ctx.userId,
    },
    db,
  );
  if (written === null) {
    return { ok: false, error: await losingWrite(role.id, db) };
  }

  // AUDIT — the ENUMERATED §9 "role/permission change" action; the add/removed/effective slug sets
  // recorded (a removal is an audited revocation — PassB:509). Atomic (same tx; D7).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: ROLE_ENTITY_TYPE,
      entityId: role.id,
      action: RoleAuditAction.PERMISSIONS_CHANGED,
      oldValue: null,
      newValue: {
        added_slugs: written.addedSlugs,
        removed_slugs: written.removedSlugs,
        effective_slugs: written.effectiveSlugs,
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: {
      roleId: role.id,
      effectiveSlugs: written.effectiveSlugs,
      updatedAt: written.updatedAt,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// `identity.delete_role.v1` — DELETE / ADR-012 soft-delete (Doc-4C §C7). Never a hard delete
// (Invariant #8). MUST run INSIDE `withActiveOrgContext`.
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteRoleCommand(
  input: DeleteRoleInput,
  ctx: RoleManagementContext,
  deps: RoleManagementDeps,
  db: DbExecutor = prisma,
): Promise<DeleteRoleOutcome> {
  // SYNTAX — `updated_at` required; bounded reason when supplied.
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return { ok: false, error: fail("VALIDATION", INVALID_INPUT_CODE, "updated_at is required.") };
  }
  if (
    input.reason !== undefined &&
    (typeof input.reason !== "string" ||
      input.reason.length === 0 ||
      input.reason.length > ROLE_DELETE_REASON_MAX_LENGTH)
  ) {
    return {
      ok: false,
      error: fail(
        "VALIDATION",
        INVALID_INPUT_CODE,
        `reason must be 1..${ROLE_DELETE_REASON_MAX_LENGTH} characters when supplied.`,
      ),
    };
  }

  const scoped = await authorizeAndScope(input.roleId, ctx, deps, db);
  if (!scoped.ok) return { ok: false, error: scoped.error };
  const { role } = scoped;

  // BUSINESS — system bundle undeletable (PassB:517).
  const protectedErr = systemBundleGuard(role);
  if (protectedErr !== null) return { ok: false, error: protectedErr };

  // BUSINESS — no active member still bound to the role (PassB:516; `identity_role_in_use`). "Bound" =
  // a live, non-`removed` membership referencing it (a departed/removed membership is never bound).
  const boundCount = await countLiveBoundMemberships(role.id, db);
  if (boundCount > 0) {
    return {
      ok: false,
      error: fail(
        "BUSINESS",
        ROLE_IN_USE_CODE,
        "members are still bound to this role; reassign them first.",
      ),
    };
  }

  // Stale arrival view (VALIDATION 400).
  const stale = staleView(role, input.updatedAt);
  if (stale !== null) return { ok: false, error: stale };

  // WRITE — ADR-012 soft-delete under CAS on `updated_at` (never a hard delete; Invariant #8). Lost
  // race → losing-write leg.
  const written = await softDeleteRole(
    {
      roleId: role.id,
      organizationId: ctx.activeOrgId,
      expectedUpdatedAt: input.updatedAt,
      actorUserId: ctx.userId,
      reason: input.reason ?? null,
    },
    db,
  );
  if (written === null) {
    return { ok: false, error: await losingWrite(role.id, db) };
  }

  // AUDIT — the ENUMERATED §9 "role/permission change" action (the soft-delete leg). Atomic (same tx; D7).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: ROLE_ENTITY_TYPE,
      entityId: role.id,
      action: RoleAuditAction.DELETED,
      oldValue: { name: written.name, deleted: false },
      newValue: {
        deleted: true,
        ...(input.reason !== undefined ? { reason: input.reason } : {}),
      },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, result: { roleId: role.id, deleted: true } };
}
