// M1 application (PRIVATE) — the `identity.upsert_buyer_profile.v1` write command (Doc-4C §C10; D7).
//
// ORCHESTRATION ONLY (owns no state): validate → authorize → write (repository) → append audit, all on
// the SAME caller-supplied RLS-scoped transaction executor. The command is the single place that knows
// BOTH the buyer_profiles write AND the audit obligation — wiring them atomically — but it knows neither
// the SQL (the repository owns it) NOR the audit MECHANISM (the M0 `core.append_audit_record.v1` facade
// owns it). Pattern (Board ruling): Command → appendAuditRecord() → Repository → Transaction → Done.
//
// THE TWO INVARIANTS (CTO gate), guaranteed by sharing ONE transaction (`db`, set RLS-scoped by
// `withActiveOrgContext` upstream):
//   • No business write without an audit row — every successful create/update appends its audit row in
//     the SAME tx; if the append fails, the tx rolls back and the write is undone.
//   • No audit row without a successful write — the audit is appended only after the write succeeds, in
//     the same tx; any failure rolls BOTH back together (Doc-4B §A10 / §17.1 atomicity).
//
// AUDIT ACTION (canonical, frozen): the create leg appends `buyer_profile_created`, the update leg
// `buyer_profile_updated` — the M1 constants (`domain/audit-actions.ts`) realizing
// Doc-2_Patch_v1.0.4 (business actions) + Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2 (serialization).
// Never a hardcoded literal.

import { prisma, type DbExecutor } from "@/shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  findActiveMembershipRoleName,
  upsertActiveOrgBuyerProfile,
} from "../../infrastructure/data/buyer-profile.repository";
import { BUYER_PROFILE_ENTITY_TYPE, BuyerProfileAuditAction } from "../../domain/audit-actions";
import type { UpsertBuyerProfileInput, UpsertBuyerProfileOutcome } from "../../contracts/types";

/** The server-resolved request context for the write (from the active-org context guard — never client input). */
export interface UpsertBuyerProfileContext {
  /** The acting `identity.users` id (= `app.user_id`). */
  userId: string;
  /** The server-resolved active org (= `app.active_org`; the tenant anchor — Invariant #5). */
  activeOrgId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (no module re-implements audit). */
export interface UpsertBuyerProfileDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE (`@/modules/core/contracts`). */
  appendAuditRecord: AppendAuditRecord;
}

// [ESC-IDN-SLUG] INTERIM — Owner/Director authority (Doc-4C §C10: no dedicated `can_manage_buyer_profile`
// slug in Doc-2 §7's minimal set; interim bind to the nearest authority). A future Doc-2 §7 additive
// ratifies a dedicated slug; this is the documented interim, not an invented slug.
const BUYER_PROFILE_ADMIN_ROLE_NAMES: ReadonlySet<string> = new Set(["Owner", "Director"]);

// Doc-4C §C10 error register (frozen `identity_buyer_profile_*` codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_buyer_profile_invalid_input";
const FORBIDDEN_CODE = "identity_buyer_profile_forbidden";
const CONFLICT_CODE = "identity_buyer_profile_conflict";

/** SYNTAX validation (Doc-4C §B.4) — light shape checks; jsonb fields must be objects/arrays, not blobs. */
function validateInput(input: UpsertBuyerProfileInput): string | null {
  if (
    input.industry !== undefined &&
    input.industry !== null &&
    typeof input.industry !== "string"
  ) {
    return "industry must be a string.";
  }
  const jsonbFields: ReadonlyArray<readonly [string, unknown]> = [
    ["factory_info", input.factoryInfo],
    ["delivery_locations", input.deliveryLocations],
    ["procurement_preferences", input.procurementPreferences],
  ];
  for (const [name, value] of jsonbFields) {
    if (value !== undefined && value !== null && typeof value !== "object") {
      return `${name} must be an object or array.`;
    }
  }
  if (input.expectedUpdatedAt !== undefined && !(input.expectedUpdatedAt instanceof Date)) {
    return "updated_at must be a timestamp.";
  }
  return null;
}

/**
 * Upsert the active-org buyer profile (Doc-4C §C10): create if absent, update if present (one per org),
 * appending the canonical audit action atomically with the write.
 *
 * @param input the (already type-mapped) upsert fields; all optional (partial).
 * @param ctx   the server-resolved context (userId/activeOrgId — never client input).
 * @param deps  the injected M0 `appendAuditRecord` contract service.
 * @param db    the RLS-scoped transaction executor (set by `withActiveOrgContext`); audit + write share it.
 */
export async function upsertBuyerProfileCommand(
  input: UpsertBuyerProfileInput,
  ctx: UpsertBuyerProfileContext,
  deps: UpsertBuyerProfileDeps,
  db: DbExecutor = prisma,
): Promise<UpsertBuyerProfileOutcome> {
  // (1) SYNTAX (Doc-4C §B.4).
  const invalid = validateInput(input);
  if (invalid !== null) {
    return {
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: INVALID_INPUT_CODE, message: invalid },
    };
  }

  // (2) AUTHZ — [ESC-IDN-SLUG] interim Owner/Director authority (confirmed active membership + role).
  const roleName = await findActiveMembershipRoleName(ctx.userId, ctx.activeOrgId, db);
  if (roleName === null || !BUYER_PROFILE_ADMIN_ROLE_NAMES.has(roleName)) {
    return {
      ok: false,
      error: {
        errorClass: "AUTHORIZATION",
        errorCode: FORBIDDEN_CODE,
        message: "Not permitted to manage the buyer profile.",
      },
    };
  }

  // (3) WRITE — the repository owns the buyer_profiles SQL (RLS-scoped) + optimistic concurrency.
  const write = await upsertActiveOrgBuyerProfile(ctx.activeOrgId, ctx.userId, input, db);
  if (write.outcome === "conflict") {
    return {
      ok: false,
      error: {
        errorClass: "CONFLICT",
        errorCode: CONFLICT_CODE,
        message: "The buyer profile was modified concurrently; reload and retry.",
      },
    };
  }

  // (4) AUDIT — atomic with the write (SAME tx `db`), via the M0 facade ONLY (Doc-4B §A10/§17.1). Canonical
  //     action from the M1 constants. If this throws, the whole tx (incl. the write) rolls back (Invariant 1).
  const created = write.outcome === "created";
  await deps.appendAuditRecord(
    {
      actorId: ctx.userId,
      actorType: "user",
      organizationId: ctx.activeOrgId,
      entityType: BUYER_PROFILE_ENTITY_TYPE,
      entityId: write.id,
      action: created ? BuyerProfileAuditAction.CREATED : BuyerProfileAuditAction.UPDATED,
      oldValue: created ? null : write.oldValue,
      newValue: write.newValue,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    },
    db,
  );

  return { ok: true, created, result: { buyerProfileId: write.id, updatedAt: write.updatedAt } };
}
