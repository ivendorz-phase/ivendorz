// M1 application (PRIVATE) — `identity.set_user_account_status.v1` (Doc-4C §C4 PassB:215–227;
// Doc-5C §4.1 row 4: `POST /identity/users/{id}/set_user_account_status` · 200). W2-IDN-6.1.
//
// ADMIN PLATFORM GOVERNANCE (21.6): suspend/reinstate a user — `active ⇄ suspended` via the IDN-5
// user state machine (CONSUMED, never rebuilt). NO active-org context (Doc-4A §5.6; Doc-5C §4.5:
// Admin governance carries no org context — scope derives solely from `staff_*` + declared admin
// scope, DC-3). Events: none ([DC-1]).
//
// AUTHORIZATION — TWO DISCRIMINATED LEGS (RV-0147 B8 lineage: staff-space NEVER via org roles):
//   • The AFFIRMATIVE leg is the server-derived PLATFORM-STAFF basis (Doc-5C §3.2 actor-type
//     determination): only a composition-edge-resolved staff principal reaches this command with
//     `isPlatformStaff = true`. The production staff-principal resolver is DC-3-gated and FAILS
//     CLOSED (see `src/server/context/staff-context.ts`) — no staff roster exists in Wave 2.
//   • The NEGATIVE leg is DELEGATED to `identity.check_permission` (the single authorization-
//     resolution source — no shadow authz): a NON-staff caller's `staff_super_admin` check runs
//     through the wired root, whose staff-space firewall denies it REGARDLESS of org-role rows
//     (`resolveMembershipPath` denies `space === 'staff'` BEFORE membership; the tenant-space
//     filter excludes forged `role_permissions` rows besides). That deny leg lives at the
//     composition edge (`src/server/identity`) because it needs the caller's org context.
//   The slug is the frozen Doc-2 §7 catalog token (DC-3 interim: "bind to `staff_super_admin`
//   until a least-privilege slug is registered — do not invent").
//
// TRANSACTION & RLS CONTEXT: opens its OWN transaction with `app.user_id` = the ADMIN principal and
// `app.is_platform_staff = 'true'` transaction-local — the staff leg of `users_self_update` admits
// the cross-user status write and the ADR-021 audit policy's staff leg admits the ADMIN-attributed
// audit row (`actor_type = 'admin'` — the frozen `core.ActorType` label; the tenant leg pins
// `'user'`, so an admin row is staff-leg-only by construction). Attribution: Admin (Doc-4C §C4
// "attribution standard (Admin)") — NEVER System (caller-driven write).
//
// AUDIT: Doc-4C §C4 authors the pointer verbatim — Domain Platform ("Super Admin access (flagged)" /
// "service-role sensitive operations", §9) — `[ESC-IDN-AUDIT]`. Distinct suspend/reinstate tokens
// (`domain/audit-actions.ts`). The structured `reason` (BUSINESS: "reason recorded") is recorded in
// the audit `new_value`. Correlation both (request-scoped ip/user-agent carried).

import { prisma } from "../../../../shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  loadUserAccountRow,
  setUserStatus,
} from "../../infrastructure/data/user-account.repository";
import { canTransitionUser } from "../../domain/state-machines/user.state-machine";
import { USER_ENTITY_TYPE, UserAccountAuditAction } from "../../domain/audit-actions";
import type { SetUserAccountStatusInput, SetUserAccountStatusOutcome } from "../../contracts/types";

/**
 * The Doc-2 §7 platform-staff slug this contract binds (Doc-4C §C4 Authorization — DC-3 interim:
 * "Slug `staff_super_admin` (Doc-2 §7, existing)"). A CATALOG token bound by pointer — never
 * invented; a future least-privilege slug lands via a Doc-2 §7 additive + this constant.
 */
export const SET_USER_ACCOUNT_STATUS_SLUG = "staff_super_admin" as const;

/** The server-resolved ADMIN request context (from the composition edge — never client input). */
export interface SetUserAccountStatusContext {
  /** The acting platform-staff principal's `identity.users` id (audit attribution). */
  adminUserId: string;
  /**
   * The server-derived platform-staff basis (Doc-5C §3.2 — NEVER client-asserted). MUST be `true`;
   * the command fail-closes otherwise (defense-in-depth behind the composition-edge gate).
   */
  isPlatformStaff: boolean;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface SetUserAccountStatusDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

// Doc-4C §C4 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_user_invalid_input";
const FORBIDDEN_CODE = "identity_user_forbidden";
const NOT_FOUND_CODE = "identity_user_not_found";
const STATUS_CONFLICT_CODE = "identity_user_status_conflict";

/** `reason : string : required : structured admin reason` — bounded [realization convention]
 *  (no corpus bound / POLICY key exists; Doc-5C §0.4 transport-level fix). */
export const ADMIN_REASON_MAX_LENGTH = 500;

/** RFC-4122 UUID shape — `user_id : uuid : required` (§C4; the path `{id}`, Doc-5A §5.4). */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** SYNTAX validation (Doc-4A §11.2 category 1; §C4 field constraints). EXPORTED so the composition
 *  edge can honor the fixed category order for NON-staff callers too (SYNTAX → 400 BEFORE the
 *  CONTEXT/AUTHZ deny → 403) without re-deriving the rules; the command re-runs it (idempotent). */
export function validateSetUserAccountStatusInput(input: SetUserAccountStatusInput): string | null {
  if (typeof input.targetUserId !== "string" || !UUID_PATTERN.test(input.targetUserId)) {
    return "id must be a UUID.";
  }
  if (input.targetStatus !== "suspended" && input.targetStatus !== "active") {
    return "target_status must be one of: suspended, active.";
  }
  if (
    typeof input.reason !== "string" ||
    input.reason.trim().length === 0 ||
    input.reason.length > ADMIN_REASON_MAX_LENGTH
  ) {
    return `reason is required (structured admin reason, 1..${ADMIN_REASON_MAX_LENGTH} characters).`;
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return "updated_at is required (If-Match) and must be a timestamp.";
  }
  return null;
}

/**
 * Suspend / reinstate a user account (Doc-4C §C4 — Admin, 21.6). The status write and the
 * Admin-attributed audit row share ONE transaction (D7). Validation chain per §C4: SYNTAX →
 * CONTEXT/AUTHZ (staff basis — composition edge + the fail-closed re-check here) → STATE
 * (`active ⇄ suspended` on the machine) → BUSINESS (reason recorded).
 */
export async function setUserAccountStatusCommand(
  input: SetUserAccountStatusInput,
  ctx: SetUserAccountStatusContext,
  deps: SetUserAccountStatusDeps,
  db: typeof prisma = prisma,
): Promise<SetUserAccountStatusOutcome> {
  // (1) SYNTAX.
  const invalid = validateSetUserAccountStatusInput(input);
  if (invalid !== null) {
    return {
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: INVALID_INPUT_CODE, message: invalid },
    };
  }

  // (2) CONTEXT/AUTHZ — fail-closed defense-in-depth: only a server-derived staff principal may
  //     proceed (the composition edge has already gated + run the check_permission deny leg for
  //     non-staff callers; this re-check makes the command safe against a mis-wired caller).
  if (ctx.isPlatformStaff !== true) {
    return {
      ok: false,
      error: {
        errorClass: "AUTHORIZATION",
        errorCode: FORBIDDEN_CODE,
        message: "Platform-staff authority required.",
      },
    };
  }

  return db.$transaction(async (tx) => {
    // Staff governance context (transaction-local GUCs; see header). Attribution stays Admin.
    await tx.$executeRaw`SELECT set_config('app.user_id', ${ctx.adminUserId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // (3) Resolve the live target (absent ⇒ `identity_user_not_found`, the frozen 404).
    const row = await loadUserAccountRow(input.targetUserId, tx);
    if (row === null) {
      return {
        ok: false as const,
        error: {
          errorClass: "NOT_FOUND" as const,
          errorCode: NOT_FOUND_CODE,
          message: "Not found.",
        },
      };
    }

    // (4) STATE — the IDN-5 user machine (CONSUMED): `active ⇄ suspended` only. A same-state
    //     replay (suspend→suspended) or a terminal source is an illegal edge ⇒ the frozen
    //     `identity_user_status_conflict` (CONFLICT → 409).
    if (!canTransitionUser(row.status, input.targetStatus)) {
      return {
        ok: false as const,
        error: {
          errorClass: "CONFLICT" as const,
          errorCode: STATUS_CONFLICT_CODE,
          message: "The requested status transition is not legal from the current state.",
        },
      };
    }

    // (5) WRITE — CAS on (source status × updated_at); a stale token or concurrent move ⇒ CONFLICT.
    const write = await setUserStatus(
      {
        userId: input.targetUserId,
        from: row.status,
        to: input.targetStatus,
        expectedUpdatedAt: input.updatedAt,
        actorUserId: ctx.adminUserId,
      },
      tx,
    );
    if (write.outcome === "conflict") {
      return {
        ok: false as const,
        error: {
          errorClass: "CONFLICT" as const,
          errorCode: STATUS_CONFLICT_CODE,
          message: "The user record was modified concurrently; reload and retry.",
        },
      };
    }

    // (6) AUDIT — atomic, same tx; ADMIN-attributed (never System). Domain Platform pointer
    //     ([ESC-IDN-AUDIT], authored in §C4). The structured reason is recorded (BUSINESS).
    //     Platform-owned record ⇒ organization_id null (no org context — §5.6).
    await deps.appendAuditRecord(
      {
        actorId: ctx.adminUserId,
        actorType: "admin",
        organizationId: null,
        entityType: USER_ENTITY_TYPE,
        entityId: input.targetUserId,
        action:
          input.targetStatus === "suspended"
            ? UserAccountAuditAction.SUSPENDED
            : UserAccountAuditAction.REINSTATED,
        oldValue: { status: row.status },
        newValue: { status: input.targetStatus, reason: input.reason },
        ipAddress: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
      },
      tx,
    );

    return {
      ok: true as const,
      result: {
        userId: input.targetUserId,
        status: input.targetStatus,
        updatedAt: write.updatedAt,
      },
    };
  });
}
