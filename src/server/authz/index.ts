// App-layer wiring ("authz") — the authorization seam (REPOSITORY_STRUCTURE §5). Authorization is the
// three-layer check (active Membership + Permission Slug + Resource Scope, OR an active Delegation Grant)
// and is M1's AUTHORITATIVE responsibility, performed inside `identity.check_permission` (Doc-4C §C3;
// Doc-5C §3.5/§7.5). That resolution is OUT-OF-WIRE. This seam BINDS to it and does NOTHING else:
//
//   ── ZERO SHADOW AUTHORIZATION ──
//   This file coins NO permission logic, NO slug list, NO resolution, NO role/plan check. It delegates
//   EVERY decision to `identity.check_permission` via the M1 contracts facade (the ONLY boundary-legal
//   surface — never `identity`'s domain/application/infrastructure). No consuming module, and not this
//   seam, re-derives the check (Doc-4C §C3 / §B.11). If you find yourself branching on a role name, a
//   plan, or a membership row HERE, stop — that is the forbidden shadow check; it belongs in M1.
//
// The active-org CONTEXT gate ("is there a valid active org?", Doc-5C §3.6) is a SEPARATE, earlier
// concern realized in `src/server/context` (the server-validated GUC guard). This seam is the PERMISSION
// gate ("may this principal perform this action?"), position 3+ — it runs AFTER context is resolved and
// consumes the server-validated `activeOrgId` (never a client-asserted org — Invariant #5).

import {
  checkPermission,
  type CheckPermissionDeps,
  type CheckPermissionResult,
} from "@/modules/identity/contracts";
import type { DbExecutor } from "@/shared/db";

/**
 * The app-layer authorization request. `userId` + `activeOrgId` are the SERVER-VALIDATED principal and
 * active-org context (from `src/server/context` — never client input). `permissionSlug` is a Doc-2 §7
 * slug (never a role/plan name). `vendorProfileId` is supplied ONLY for a delegated act-as path (§6B).
 */
export interface AuthorizeRequest {
  userId: string;
  activeOrgId: string;
  permissionSlug: string;
  resourceScope?: Record<string, string>;
  vendorProfileId?: string;
}

/**
 * Resolve an authorization decision by DELEGATING to `identity.check_permission` (the single
 * authorization-resolution source). Returns the full contract result (decision + granting path / deny
 * reason) so the caller can audit or map it. This function performs NO resolution of its own.
 *
 * @param request the server-validated authorization request.
 * @param deps    the M1 check_permission ports (the M2 vendor-profile-state reader for §6B condition 5;
 *                clock) — supplied by the app edge; absent for a non-delegated org-context check.
 * @param db      executor; when it carries the RLS-scoped active-org context, RLS is the backstop.
 */
export async function authorize(
  request: AuthorizeRequest,
  deps?: CheckPermissionDeps,
  db?: DbExecutor,
): Promise<CheckPermissionResult> {
  return checkPermission(
    {
      userId: request.userId,
      organizationId: request.activeOrgId,
      permissionSlug: request.permissionSlug,
      resourceScope: request.resourceScope,
      vendorProfileId: request.vendorProfileId,
    },
    deps,
    db,
  );
}

/**
 * Boolean convenience over {@link authorize}: `true` iff the decision is `allow`. Use when the caller
 * only needs to gate (fail-closed on any deny). The full result (via {@link authorize}) is preferred
 * where the deny reason or granting path matters (auditing / the wire error mapping — W2-IDN-6).
 */
export async function hasPermission(
  request: AuthorizeRequest,
  deps?: CheckPermissionDeps,
  db?: DbExecutor,
): Promise<boolean> {
  const result = await authorize(request, deps, db);
  return result.decision === "allow";
}
