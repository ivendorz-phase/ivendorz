// M1 application (PRIVATE) — `identity.update_user_2fa_settings.v1` (Doc-4C §C4 PassB:188–199;
// Doc-5C §4.1 row 2: `POST /identity/users/{id}/update_user_2fa_settings` · 200 — the §4.6(b)
// named-command [realization convention]). W2-IDN-6.1.
//
// SETTINGS ONLY (DC-4): this toggles the 2FA *setting* on `identity.users.two_fa_jsonb` — the 2FA
// challenge/verification mechanism is Supabase Auth infrastructure and is NEVER represented or
// mutated here. Self-scope: target = the server-resolved session subject (path `{id}` checked
// upstream). Events: none ([DC-1]).
//
// AUDITED, ATOMIC (D7 canonical pattern): "account-security setting change" — Doc-4C §C4 Audit: yes,
// `[ESC-IDN-AUDIT]` (no enumerated Doc-2 §9 user-2FA-settings action; interim bind NEAREST by
// pointer — the §9 Domain Platform security-sensitive family; see `domain/audit-actions.ts`).
// Attribution standard: the acting USER (never System — caller-driven write). The audit and the
// settings write share ONE transaction (the caller-supplied `db` from `withActiveOrg`): no business
// write without an audit row; no audit row without a successful write.
//
// CONTEXT NOTE (mechanical, documented): the §C4 sub-domain carries NO active-org authorization
// requirement (self ops act on the platform-owned `users` record — Doc-5C §4.5). This audited write
// nevertheless runs INSIDE `withActiveOrg`, because the frozen audit-append RLS (ADR-021
// `audit_records_context_append`) admits a USER-attributed row ONLY via its tenant leg
// (`organization_id = app.active_org AND actor_id = app.user_id AND actor_type = 'user'`). The
// active org is therefore the AUDIT-CONTEXT anchor (D7 rule 8 — server-resolved, never client
// input), NOT an authorization gate; a principal with zero active memberships fails closed to the
// 404 collapse (unreachable audit obligation ⇒ no write — Doc-4B §B10; the Solo-Trader invariant
// makes this an edge case).

import { prisma, type DbExecutor } from "../../../../shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import { updateUser2faSettings } from "../../infrastructure/data/user-account.repository";
import { USER_ENTITY_TYPE, UserAccountAuditAction } from "../../domain/audit-actions";
import type {
  UpdateUser2faSettingsInput,
  UpdateUser2faSettingsOutcome,
} from "../../contracts/types";

/** The server-resolved request context (from the composition edge — never client input). */
export interface UpdateUser2faSettingsContext {
  /** The acting (= target) `identity.users` id — the session subject (= `app.user_id`). */
  userId: string;
  /** The server-resolved active org (= `app.active_org`) — the AUDIT-context anchor (see header). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface UpdateUser2faSettingsDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

// Doc-4C §C4 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_user_invalid_input";
const UPDATE_CONFLICT_CODE = "identity_user_update_conflict";
const NOT_FOUND_CODE = "identity_user_not_found"; // §6.6 collapse code (frozen §C4 user-domain code).

/** RFC-4122 UUID shape for the path `{id}` (Doc-5A §5.4 — a malformed segment is SYNTAX, cat 1). */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** SYNTAX validation (Doc-4A §11.2 category 1; §C4 field constraints). */
function validateInput(input: UpdateUser2faSettingsInput): string | null {
  if (typeof input.targetUserId !== "string" || !UUID_PATTERN.test(input.targetUserId)) {
    return "id must be a UUID.";
  }
  if (typeof input.twoFaEnabled !== "boolean") {
    return "two_fa_enabled is required and must be a boolean.";
  }
  if (input.recoveryMethod !== undefined) {
    // FAIL-CLOSED (Doc-4A §9.4): the frozen §C4 declares `recovery_method : enum : optional` but
    // names NO enum source pointer, and no recovery-method value set exists anywhere in the corpus.
    // A needed-but-missing enum is ESCALATED, never coined — accepting arbitrary values would define
    // an open enum (nonconforming). Rejected until an additive registers the value set (the RV-0148
    // MAJOR-2 `resource_scope_unsupported` precedent: never silently widen, never silently drop).
    return "recovery_method is not accepted: its enum value set is not yet registered (escalated).";
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return "updated_at is required (If-Match) and must be a timestamp.";
  }
  return null;
}

/**
 * Update the session subject's 2FA *settings* (Doc-4C §C4), appending the canonical audit action
 * atomically with the write (same `db` transaction).
 *
 * @param input the (already type-mapped) §C4 fields.
 * @param ctx   the server-resolved context (userId/activeOrgId — never client input).
 * @param deps  the injected M0 `appendAuditRecord` contract service.
 * @param db    the RLS-scoped transaction executor (set by `withActiveOrgContext`); audit + write
 *              share it (D7 rule 5).
 */
export async function updateUser2faSettingsCommand(
  input: UpdateUser2faSettingsInput,
  ctx: UpdateUser2faSettingsContext,
  deps: UpdateUser2faSettingsDeps,
  db: DbExecutor = prisma,
): Promise<UpdateUser2faSettingsOutcome> {
  // (1) SYNTAX.
  const invalid = validateInput(input);
  if (invalid !== null) {
    return {
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: INVALID_INPUT_CODE, message: invalid },
    };
  }

  // (2) CONTEXT/SCOPE — self-only (§C4). Foreign `{id}` ⇒ the §6.6 non-disclosure collapse.
  if (input.targetUserId !== ctx.userId) {
    return {
      ok: false,
      error: { errorClass: "NOT_FOUND", errorCode: NOT_FOUND_CODE, message: "Not found." },
    };
  }

  // (3) WRITE — the SETTINGS column only (`two_fa_jsonb`; never a challenge/secret — DC-4). The
  //     serialized settings shape is minimal ({ enabled }): the column's internal shape is owned
  //     upstream (Doc-2 §10.2 `two_fa`) and carried opaque everywhere else.
  const write = await updateUser2faSettings(
    {
      userId: ctx.userId,
      expectedUpdatedAt: input.updatedAt,
      twoFaSettings: { enabled: input.twoFaEnabled },
    },
    db,
  );
  if (write.outcome !== "updated") {
    if (write.outcome === "not_found") {
      return {
        ok: false,
        error: { errorClass: "NOT_FOUND", errorCode: NOT_FOUND_CODE, message: "Not found." },
      };
    }
    return {
      ok: false,
      error: {
        errorClass: "CONFLICT",
        errorCode: UPDATE_CONFLICT_CODE,
        message: "The user record was modified concurrently; reload and retry.",
      },
    };
  }

  // (4) AUDIT — atomic with the write (SAME tx), via the M0 facade ONLY (Doc-4B §A10/§17.1).
  //     Old/new = the SETTINGS values (no secret exists in this column by construction — DC-4).
  //     Attribution: the acting USER; the org is the server-resolved audit-context anchor (D7 rule 8).
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: USER_ENTITY_TYPE,
      entityId: ctx.userId,
      action: UserAccountAuditAction.TWO_FA_SETTINGS_UPDATED,
      oldValue: { two_fa: write.oldSettings },
      newValue: { two_fa: write.newSettings },
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return {
    ok: true,
    result: { userId: ctx.userId, twoFaEnabled: input.twoFaEnabled, updatedAt: write.updatedAt },
  };
}
