// M1 application (PRIVATE) — the USER-attributed audit-input assembler for the identity command layer.
//
// Extracted (W2 maintainability refactor 2B — DRY only, no behavior change) from ~19 command call sites
// that each hand-built the same `core.append_audit_record.v1` argument object. It fills ONLY the
// server-resolved Invariant #5 actor fields (`actorId`, `actorType: "user"`, `ipAddress`, `userAgent`)
// so those can never drift between writes. Every audit-relevant DECISION stays with the command and is
// passed explicitly (D7 rule 6): the command still CHOOSES the `action`, the `entityType`/`entityId`,
// the `oldValue`/`newValue` diff, and the `organizationId` (which varies — `ctx.activeOrgId` for tenant
// writes, the row's org for pre-membership/self writes), and still calls `deps.appendAuditRecord(...)`
// on its OWN transaction. This helper NEVER selects, defaults, or invents an action.
//
// USER-attributed writes ONLY. Admin-attributed (`actorType: "admin"`, `actorId: ctx.adminUserId`) and
// System-attributed (`actorType: "system"`, `actorId: null`) writes build their own input inline —
// their actor context is a different, deliberately-explicit shape. Module-PRIVATE: imported solely by
// sibling `application/commands/*.command.ts`; never re-exported through `contracts/`. Single-purpose.

import type { AppendAuditRecordInput } from "@/modules/core/contracts";

/** The server-resolved actor context shared by every USER-attributed identity audit write. A command's
 *  own request context (which may carry more fields, e.g. `activeOrgId`) satisfies this structurally. */
export interface UserAuditContext {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** The per-write audit facts the COMMAND chooses (D7 — never defaulted here). `organizationId` is the
 *  audit-context org reference (nullable for the platform-scoped user writes). */
export interface UserAuditFacts {
  organizationId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Assemble the `core.append_audit_record.v1` input for a USER-attributed identity write: the four
 * server-resolved actor fields from `ctx`, the command-chosen facts verbatim. Behaviour-identical to
 * the inline object it replaces.
 */
export function buildUserAuditInput(
  ctx: UserAuditContext,
  facts: UserAuditFacts,
): AppendAuditRecordInput {
  return {
    actorId: ctx.userId,
    actorType: "user",
    organizationId: facts.organizationId,
    entityType: facts.entityType,
    entityId: facts.entityId,
    action: facts.action,
    oldValue: facts.oldValue,
    newValue: facts.newValue,
    ipAddress: ctx.ipAddress ?? null,
    userAgent: ctx.userAgent ?? null,
  };
}
