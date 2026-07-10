// M1 application (PRIVATE) — `identity.create_role.v1` (Doc-4C §C7 PassB:472–484; Doc-5C §5.1 row 19:
// `POST /identity/roles` · 201 + Location). W2-IDN-6.4.
//
// Frozen validation chain (PassB:478): SYNTAX (name; slug formats) → CONTEXT (active-org — upstream)
// → AUTHZ (`can_manage_users` via the wired `check_permission` root; Delegation NOT eligible —
// membership path only, fail-closed) → SCOPE (caller's active org — the server-resolved context IS
// the owning org; Invariant #5) → REFERENCE (each `permission_slug` ∈ the §7 catalog) → BUSINESS
// (name unique-per-org; not a reserved system-bundle name).
//
// THE FIREWALL (Invariant #2 + DC-CR7 — realized on the WRITE side, RV-0147 B8 lineage): the initial
// `permission_slugs` bundle is validated by the pure `role-composition.policy` — each slug must be an
// ASSIGNABLE tenant slug: ∈ the catalog (else `unknown`), NEVER `staff_*` (Invariant #2 separate
// namespace), NEVER ownership-class (the Owner-only reservation, Doc-2 §7 / DC-CR7). All three
// non-assignable reasons map to the frozen REFERENCE `identity_permission_slug_unknown` (422) —
// byte-identical (the widening/forgery-reject idiom + non-disclosure; the policy keeps the reasons
// distinct so the tests prove each guard). A NEW custom role is `organization_id = active_org`,
// `is_system_bundle = false` — the 4 system bundles are platform seeds, NEVER (re)created here.
//
// STATE EFFECTS (PassB:480): a NEW `identity.roles` row + `role_permissions` rows created in-tx when
// `permission_slugs` supplied. Mutation-Scope `identity.roles` (+ `role_permissions`).
//
// Events: none (§8 — [DC-1]). Idempotency (§B.6): required; window `identity.command_dedup_window`
// (Doc-3 v1.9 key #1) — the composition owns the replay/claim legs (create-class: the RV-0153 F2
// claim pattern, the invite_member precedent). Audit: RoleAuditAction.CREATED bound to the ENUMERATED
// Doc-2 §9 Organization "role/permission change" action (PassB:482) — NO `[ESC-IDN-AUDIT]`.

import type { AppendAuditRecord } from "@/modules/core/contracts";
import { buildUserAuditInput } from "./_audit";
import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findLiveRoleByName,
  insertCustomRole,
  isUniqueViolation,
  resolveRequestedPermissions,
} from "../../infrastructure/data/role.repository";
import {
  isReservedSystemBundleName,
  validateAssignableSlugs,
} from "../../domain/policies/role-composition.policy";
import { ROLE_ENTITY_TYPE, RoleAuditAction } from "../../domain/audit-actions";
import { checkPermission } from "../queries/check-permission.query";
import { MANAGE_USERS_SLUG } from "./invite-member.command";
import type {
  CheckPermissionInput,
  CheckPermissionResult,
  CreateRoleInput,
  CreateRoleOutcome,
  RoleError,
} from "../../contracts/types";

// Doc-4C §C7 create error register (PassB:479 — frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_role_invalid_input";
const FORBIDDEN_CODE = "identity_role_forbidden";
const SLUG_UNKNOWN_CODE = "identity_permission_slug_unknown";
const NAME_CONFLICT_CODE = "identity_role_name_conflict";

/** `name : string : required : bounded` [realization convention] — the ADMIN_REASON precedent; the
 *  frozen field declares no numeric bound, an unbounded write is a hazard. Face-exported for symmetry. */
export const ROLE_NAME_MAX_LENGTH = 120;
/** A defensive ceiling on the initial bundle size [realization convention] — an unbounded slug list
 *  is a storage/DoS hazard; well above the 36-slug tenant catalog. */
export const ROLE_PERMISSION_SLUGS_MAX = 100;

const SLUG_PATTERN = /^[a-z][a-z0-9_]*$/;

/** SYNTAX validation (Doc-4A §11.2 category 1) — exported so the composition edge runs the SAME
 *  validator FIRST (the create-organization/invite precedent; single source, no re-derivation).
 *  Returns the failure message, or `null` when syntactically valid. */
export function validateCreateRoleInput(input: CreateRoleInput): string | null {
  if (
    typeof input.name !== "string" ||
    input.name.trim().length === 0 ||
    input.name.length > ROLE_NAME_MAX_LENGTH
  ) {
    return `name is required (1..${ROLE_NAME_MAX_LENGTH} characters).`;
  }
  if (input.permissionSlugs !== undefined) {
    if (
      !Array.isArray(input.permissionSlugs) ||
      input.permissionSlugs.length > ROLE_PERMISSION_SLUGS_MAX
    ) {
      return `permission_slugs must be a list of at most ${ROLE_PERMISSION_SLUGS_MAX} slugs.`;
    }
    for (const slug of input.permissionSlugs) {
      if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
        return "each permission_slug must be a lower_snake_case slug.";
      }
    }
  }
  return null;
}

/** The server-resolved request context (from the composition edge — never client input). */
export interface CreateRoleContext {
  /** The acting `identity.users` id (Invariant #5 — users act). */
  userId: string;
  /** The SERVER-RESOLVED active org — the owning org (organizations own). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected services (D7 rule 4). `authorize` is injectable for tests; the production default is the
 *  M1 `check_permission` root itself (never a shadow check). */
export interface CreateRoleDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
  /** The authorization root (defaults to `identity.check_permission` — the single decider). */
  authorize?: (input: CheckPermissionInput, db?: DbExecutor) => Promise<CheckPermissionResult>;
}

/**
 * Create a custom role bundle (Doc-4C §C7). MUST be invoked INSIDE `withActiveOrgContext` — `db` is
 * the composition's tenant transaction; the role + role_permissions inserts and the audit ride it
 * atomically (D7). The §B.6 claim leg lives at the composition (create-class — RV-0153 F2).
 */
export async function createRoleCommand(
  input: CreateRoleInput,
  ctx: CreateRoleContext,
  deps: CreateRoleDeps,
  db: DbExecutor = prisma,
): Promise<CreateRoleOutcome> {
  // (1) SYNTAX — the same exported validator the composition ran.
  const syntaxFailure = validateCreateRoleInput(input);
  if (syntaxFailure !== null) {
    return err("VALIDATION", INVALID_INPUT_CODE, syntaxFailure);
  }

  // (2) AUTHZ — `can_manage_users` via the wired authorization root (§11.2 category 3 precedes
  //     SCOPE/semantics — a caller without the slug learns nothing). Delegation NOT eligible:
  //     membership path only; a delegation-satisfied allow is rejected fail-closed (the 6.2/6.3 idiom).
  const authorize =
    deps.authorize ??
    ((i: CheckPermissionInput, d?: DbExecutor) => checkPermission(i, undefined, d));
  const decision = await authorize(
    { userId: ctx.userId, organizationId: ctx.activeOrgId, permissionSlug: MANAGE_USERS_SLUG },
    db,
  );
  if (decision.decision !== "allow" || decision.satisfiedBy !== "membership") {
    return err("AUTHORIZATION", FORBIDDEN_CODE, "Not permitted to manage roles.");
  }

  const requestedSlugs = input.permissionSlugs ?? [];

  // (3) REFERENCE + firewall — resolve the requested slugs' catalog facts, then the pure composition
  //     policy (⊆ catalog / never staff / never ownership-class). All three non-assignable reasons
  //     collapse to the frozen REFERENCE `identity_permission_slug_unknown` (byte-identical; §7.5 /
  //     the RV-0147 widening-reject idiom). The policy discriminated the reason (tests prove each).
  const catalog = await resolveRequestedPermissions(requestedSlugs, db);
  const spaceBySlug = new Map([...catalog].map(([slug, v]) => [slug, v.space]));
  const slugCheck = validateAssignableSlugs(requestedSlugs, spaceBySlug);
  if (!slugCheck.ok) {
    return err(
      "REFERENCE",
      SLUG_UNKNOWN_CODE,
      "permission_slug is not an assignable permission for a custom role.",
    );
  }

  // (4) BUSINESS — not a reserved system-bundle name (would shadow the Owner/Director/Manager/Officer
  //     seeds) → the frozen CONFLICT `identity_role_name_conflict`.
  if (isReservedSystemBundleName(input.name)) {
    return err("CONFLICT", NAME_CONFLICT_CODE, "name is reserved for a system role bundle.");
  }

  // (5) BUSINESS — name unique-per-org (clean pre-check; the DB `roles_org_name_live_uq` index is the
  //     race backstop → P2002 mapped below).
  const clash = await findLiveRoleByName(ctx.activeOrgId, input.name.trim(), undefined, db);
  if (clash !== null) {
    return err("CONFLICT", NAME_CONFLICT_CODE, "a role with this name already exists.");
  }

  // (6) WRITE — the NEW role + its initial composition (Mutation-Scope `identity.roles` +
  //     `role_permissions`). A concurrent same-name create hits the partial-unique-live index → the
  //     frozen CONFLICT code (the register itself assigns the class).
  const permissionIds = requestedSlugs.map((s) => catalog.get(s)!.id);
  let created: Awaited<ReturnType<typeof insertCustomRole>>;
  try {
    created = await insertCustomRole(
      {
        organizationId: ctx.activeOrgId,
        name: input.name.trim(),
        permissionIds,
        actorUserId: ctx.userId,
      },
      db,
    );
  } catch (e) {
    if (isUniqueViolation(e)) {
      return err("CONFLICT", NAME_CONFLICT_CODE, "a role with this name already exists.");
    }
    throw e;
  }

  // (7) AUDIT — the ENUMERATED §9 "role/permission change" action, atomic (same tx; D7). Payload =
  //     ids + the created field set (name + the initial slug set) only (Doc-6A §12 ids+meta).
  await deps.appendAuditRecord(
    buildUserAuditInput(ctx, {
      organizationId: ctx.activeOrgId,
      entityType: ROLE_ENTITY_TYPE,
      entityId: created.roleId,
      action: RoleAuditAction.CREATED,
      oldValue: null,
      newValue: {
        name: input.name.trim(),
        is_system_bundle: false,
        permission_slugs: requestedSlugs,
      },
    }),
    db,
  );

  return { ok: true, result: { roleId: created.roleId, name: input.name.trim() } };
}

function err(
  errorClass: RoleError["errorClass"],
  errorCode: string,
  message: string,
): CreateRoleOutcome {
  return { ok: false, error: { errorClass, errorCode, message } };
}
