// App-layer COMPOSITIONS for the six §C7 role/permission contracts (W2-IDN-6.4; Doc-5C §5.1 rows
// 17–22):
//   `identity.list_permissions.v1`    — `GET /identity/permissions` · 200 (DUAL-ACTOR; authenticated)
//   `identity.list_roles.v1`          — `GET /identity/roles` · 200 (User, active-org)
//   `identity.create_role.v1`         — `POST /identity/roles` · 201 + Location
//   `identity.update_role.v1`         — `PATCH /identity/roles/{id}` · 200
//   `identity.set_role_permissions.v1`— `POST …/{id}/set_role_permissions` · 200
//   `identity.delete_role.v1`         — `DELETE /identity/roles/{id}` · 200 (ADR-012 soft-delete)
//
// The three MANAGEMENT commands (update/set-perms/delete) share the 6.3 tenant composition shape:
//   session → 401 · Idempotency-Key REQUIRED (Doc-5C §4.3) → 400 · provision · `withActiveOrg`
//   (unresolved context → the 404 collapse) → §B.6 replay lookup → command → wire map → §B.6 persist
//   (success-only, same tx — the §14.3 joint rule). NO claim leg (the `updated_at` CAS is the
//   single-execution guard — the 6.3 CAS-covered posture).
//
// CREATE_ROLE adds the CREATE legs (the invite_member precedent): SYNTAX FIRST (the exported
// validator on the category-1 slot), and the §14.3 PRE-EXECUTION CLAIM inside the tenant tx (a create
// has no CAS — the claim is the single-execution guard, RV-0153 F2; a lost claim returns the
// concurrent winner's stored §9.3 payload WITHOUT executing).
//
// The two READS: `list_permissions` is DUAL-ACTOR / authenticated-scope — it needs NO active-org
// context and runs on the shared client (platform reference data; no provisioning side effect on a
// read). `list_roles` is User / active-org — it resolves context via `withActiveOrg` (unresolved →
// the empty list, the collection-face fail-closed posture). Pagination is FAIL-CLOSED on
// `ESC-IDN-LIST-PAGESIZE` (no registered identity page-size POLICY key — the list_delegation_grants
// precedent). Window POLICY: `identity.command_dedup_window` (all four writes — PassB:481/:493/:506/
// :518), UNSEEDED until W2-IDN-7 (real read, never a literal). Zero §8 events ([DC-1]).

import { prisma } from "@/shared/db";
import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  createRole,
  deleteRole,
  listPermissions,
  listRoles,
  mapCreateRole,
  mapDeleteRole,
  mapListPermissions,
  mapListRoles,
  mapSetRolePermissions,
  mapUpdateRole,
  roleInvalidInput,
  setRolePermissions,
  updateRole,
  validateCreateRoleInput,
  type CreateRoleInput,
  type CreateRoleResult,
  type DeleteRoleInput,
  type DeleteRoleResult,
  type ListPermissionsInput,
  type ListPermissionsWireResult,
  type ListRolesInput,
  type ListRolesWireResult,
  type SetRolePermissionsInput,
  type SetRolePermissionsResult,
  type UpdateRoleInput,
  type UpdateRoleResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import {
  claimStoredReplay,
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  releaseStoredClaim,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

// ═══════════════ READS (list_permissions · list_roles) ═══════════════

/** Deps for the two role/permission reads. */
export interface RoleReadHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/** The RAW wire query dimensions (route-extracted, unvalidated — this composition owns SYNTAX). */
export interface ListPermissionsWireInput {
  space?: string;
  /** Presence of any of these = the fail-closed 400 (see header). */
  pageSize?: string;
  cursor?: string;
  sort?: string;
}
export interface ListRolesWireInput {
  includeSystem?: string;
  pageSize?: string;
  cursor?: string;
  sort?: string;
}

/** Reject the handle-gated pagination/sort dimensions (Doc-4A §11.2 category 1 — see header). */
function paginationReject(dim: {
  pageSize?: string;
  cursor?: string;
  sort?: string;
}): WireResponse<never> | null {
  if (dim.pageSize !== undefined) {
    return roleInvalidInput(
      "page_size is not accepted: the identity page-size POLICY bound is unregistered (ESC-IDN-LIST-PAGESIZE).",
    );
  }
  if (dim.cursor !== undefined) {
    return roleInvalidInput(
      "cursor is not accepted: no cursor has been issued (pagination pending ESC-IDN-LIST-PAGESIZE).",
    );
  }
  if (dim.sort !== undefined) {
    return roleInvalidInput(
      "sort is not accepted: the contract declares no sortable field (server-fixed order).",
    );
  }
  return null;
}

/**
 * `GET /identity/permissions` — the DUAL-ACTOR catalog read (`identity.list_permissions.v1`).
 * Authenticated scope (no active-org): `401` if unauthenticated; else the full platform catalog
 * (optionally `space`-filtered) at `200`. Runs on the shared client (platform reference data).
 */
export async function handleListPermissions(
  input: ListPermissionsWireInput,
  deps: RoleReadHandlerDeps,
): Promise<WireResponse<ListPermissionsWireResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }
  const pageReject = paginationReject(input);
  if (pageReject !== null) return pageReject;
  if (input.space !== undefined && input.space !== "tenant" && input.space !== "staff") {
    return roleInvalidInput("space must be one of: tenant, staff.");
  }
  const typed: ListPermissionsInput =
    input.space !== undefined ? { spaceFilter: input.space as "tenant" | "staff" } : {};
  const result = await listPermissions(typed, prisma);
  return mapListPermissions(result);
}

/**
 * `GET /identity/roles` — the User active-org role read (`identity.list_roles.v1`). `401` if
 * unauthenticated; unresolved active-org context → the empty list (collection-face fail-closed).
 */
export async function handleListRoles(
  input: ListRolesWireInput,
  deps: RoleReadHandlerDeps,
): Promise<WireResponse<ListRolesWireResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }
  const pageReject = paginationReject(input);
  if (pageReject !== null) return pageReject;
  if (
    input.includeSystem !== undefined &&
    input.includeSystem !== "true" &&
    input.includeSystem !== "false"
  ) {
    return roleInvalidInput("include_system must be a boolean.");
  }

  await deps.ensureProvisioned(session);

  const typed: ListRolesInput =
    input.includeSystem !== undefined ? { includeSystem: input.includeSystem === "true" } : {};
  const ran = await withActiveOrg(session, (tx, context) =>
    listRoles(typed, context.activeOrgId, tx),
  );
  return mapListRoles(ran.resolved ? ran.value : null);
}

// ═══════════════ WRITES (create · update · set-perms · delete) ═══════════════

/** Dependencies for a §C7 write composition (uniform across the four writes — the 6.3 shape). */
export interface RoleWriteHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — `command-dedup.ts`). REQUIRED-field dep shape
   *  (RV-0153 OBS-2 — never optional on a new composition). */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

type TenantContext = {
  userId: string;
  activeOrgId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};
type TenantTx = Parameters<Parameters<typeof withActiveOrg>[1]>[0];

/** The shared tenant composition for the three MANAGEMENT writes (the 6.3 house shape — replay
 *  lookup only, no claim; the `updated_at` CAS is the single-execution guard). */
async function handleRoleManagementCommand<TOutcome, TResult>(
  contractId: string,
  run: (ctx: TenantContext, tx: TenantTx) => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
  deps: RoleWriteHandlerDeps,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }
  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — before any semantic processing.
  if (deps.idempotencyKey === null) {
    return roleInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    if (key !== undefined) {
      const replay = await findStoredReplay<TResult>(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await run(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      tx,
    );
    const wire = mapper(outcome);

    if (isOk(outcome) && key !== undefined) {
      await persistWireReplay(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        wire,
        tx,
      );
    }
    return wire;
  });

  if (!ran.resolved) {
    return mapper(null); // 404 collapse (no user / no active membership).
  }
  return ran.value;
}

/**
 * `POST /identity/roles` (`201` + `Location`) — `identity.create_role.v1` with the §14.3 CREATE claim
 * leg (the invite_member precedent). Returns the §9.3 stored replay on a within-window same-key
 * re-submission.
 */
export async function handleCreateRole(
  input: CreateRoleInput,
  deps: RoleWriteHandlerDeps,
): Promise<WireResponse<CreateRoleResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }
  // SYNTAX FIRST (Doc-4A §11.2 fixed order — the command re-runs the same exported validator), then
  // the §B.6 mandatory-key leg on the same category-1 slot.
  const syntaxFailure = validateCreateRoleInput(input);
  if (syntaxFailure !== null) {
    return roleInvalidInput(syntaxFailure);
  }
  if (deps.idempotencyKey === null) {
    return roleInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const contractId = "identity.create_role.v1";
  const ran = await withActiveOrg(session, async (tx, context) => {
    const scope =
      key !== undefined
        ? dedupScope(contractId, context.userId, context.activeOrgId, key)
        : undefined;

    if (scope !== undefined) {
      const replay = await findStoredReplay<CreateRoleResult>(scope, COMMAND_DEDUP_WINDOW_KEY, tx);
      if (replay !== null) {
        return replay;
      }
      // Doc-4A §14.3 IN-FLIGHT protection (RV-0153 F2): CLAIM the key BEFORE the command — a create
      // has no CAS, so the claim is the single-execution guard.
      const claim = await claimStoredReplay(scope, COMMAND_DEDUP_WINDOW_KEY, tx);
      if (claim === "lost") {
        const winner = await findStoredReplay<CreateRoleResult>(
          scope,
          COMMAND_DEDUP_WINDOW_KEY,
          tx,
        );
        if (winner !== null) {
          return winner; // the §9.3 stored payload — this caller's business logic never began.
        }
        throw new Error(
          "command-dedup: claim lost but no stored record resolved (unreachable; failing closed per Doc-4A §14.3).",
        );
      }
    }

    const outcome = await createRole(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
    const wire = mapCreateRole(outcome);

    if (scope !== undefined) {
      if (outcome.ok) {
        await persistWireReplay(scope, wire, tx);
      } else {
        await releaseStoredClaim(scope, tx); // errors never cached; the key stays live (§9.6).
      }
    }
    return wire;
  });

  if (!ran.resolved) {
    return mapCreateRole(null); // 404 collapse (no user / no active membership).
  }
  return ran.value;
}

/** `PATCH /identity/roles/{id}` (`200`) — `identity.update_role.v1` (rename; system bundles immutable). */
export async function handleUpdateRole(
  input: UpdateRoleInput,
  deps: RoleWriteHandlerDeps,
): Promise<WireResponse<UpdateRoleResult>> {
  return handleRoleManagementCommand(
    "identity.update_role.v1",
    (ctx, tx) => updateRole(input, ctx, { appendAuditRecord }, tx),
    mapUpdateRole,
    (o) => o.ok,
    deps,
  );
}

/** `POST /identity/roles/{id}/set_role_permissions` (`200`) — `identity.set_role_permissions.v1`
 *  (compose; the ⊆-assignable / never-staff / never-ownership-class firewall; system bundles immutable). */
export async function handleSetRolePermissions(
  input: SetRolePermissionsInput,
  deps: RoleWriteHandlerDeps,
): Promise<WireResponse<SetRolePermissionsResult>> {
  return handleRoleManagementCommand(
    "identity.set_role_permissions.v1",
    (ctx, tx) => setRolePermissions(input, ctx, { appendAuditRecord }, tx),
    mapSetRolePermissions,
    (o) => o.ok,
    deps,
  );
}

/** `DELETE /identity/roles/{id}` (`200`) — `identity.delete_role.v1` (ADR-012 soft-delete; system
 *  bundles undeletable; blocked while members bound). */
export async function handleDeleteRole(
  input: DeleteRoleInput,
  deps: RoleWriteHandlerDeps,
): Promise<WireResponse<DeleteRoleResult>> {
  return handleRoleManagementCommand(
    "identity.delete_role.v1",
    (ctx, tx) => deleteRole(input, ctx, { appendAuditRecord }, tx),
    mapDeleteRole,
    (o) => o.ok,
    deps,
  );
}
