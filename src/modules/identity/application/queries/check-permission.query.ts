// M1 application (PRIVATE) — `identity.check_permission.v1`, THE platform authorization root (Doc-4C
// §C3). Orchestration only; owns NO state. It IMPLEMENTS (never redefines) the Doc-4A §6.1 three-layer
// check and the §6B.2 five-condition delegated-access check: it performs the org-anchored reads
// (infrastructure) and hands the resolved facts to the pure `permission-resolution.policy` (domain),
// which decides. This is the SINGLE authorization-resolution source — no consuming module (nor the
// `src/server/authz` seam) re-derives it (no shadow authorization). Reads unaudited; no events; reads
// NO governance signal (firewall default).

import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  findActiveDelegationGrant,
  findActiveMembership,
  findPermissionBySlug,
  resolveGrantedTenantSlugs,
} from "../../infrastructure/data/authz.repository";
import {
  resolveDelegatedAccess,
  resolveMembershipPath,
  type ActiveMembershipFact,
  type DelegationGrantFact,
  type PermissionCatalogEntry,
  type PermissionResolution,
} from "../../domain/policies/permission-resolution.policy";
import type { CheckPermissionInput, VendorProfileStateReader } from "../../contracts/types";

/** Dependencies the caller may inject (boundary-legal ports — never a cross-module import). */
export interface CheckPermissionDeps {
  /**
   * Reads the target vendor profile's OWN lifecycle state to answer §6B.2 condition 5 (does the
   * profile's state permit the operation?). The vendor profile is M2-owned, so this is injected as a
   * PORT (the M2 Vendor Service, wired at the app edge) — never an M2 import from M1. When ABSENT and a
   * delegated path is being evaluated, condition 5 CANNOT be affirmed ⇒ the delegated path fails closed.
   */
  vendorProfileStateReader?: VendorProfileStateReader;
  /** Injectable clock for deterministic validity-window evaluation (defaults to `new Date()`). */
  now?: () => Date;
}

/**
 * `identity.check_permission.v1` (Doc-4C §C3). Resolves `decision` (`allow`/`deny`) + `satisfied_by`
 * (`membership`/`delegation`/`none`) for (`userId`, `organizationId` = server-validated active org,
 * `permissionSlug`), optionally over a delegated act-as path when `vendorProfileId` is present (§6B).
 *
 * The `organizationId` is the SERVER-VALIDATED active-org context (Doc-4A §5.3) supplied by the caller;
 * it is NEVER a client-asserted org. The reads run on `db`; correctness does not depend on RLS — every
 * resolution read carries its own explicit org anchor (RLS is the defense-in-depth backstop).
 *
 * @param input the resolution request (Doc-4C §C3 request contract).
 * @param deps  injectable ports (vendor-profile-state reader for §6B condition 5; clock).
 * @param db    executor (defaults to the shared client).
 */
export async function checkPermission(
  input: CheckPermissionInput,
  deps: CheckPermissionDeps = {},
  db: DbExecutor = prisma,
): Promise<PermissionResolution> {
  const { userId, organizationId, permissionSlug, vendorProfileId } = input;
  const now = deps.now?.() ?? new Date();

  // Catalog lookup — an unknown slug is a §6.4 conformance gap, resolved by the policy (never a grant).
  const permRow = await findPermissionBySlug(permissionSlug, db);
  const permission: PermissionCatalogEntry | null = permRow;

  // Resolve the acting user's ACTIVE membership in the (active/representative) org — Doc-4A §6.1 layer 1
  // (also §6B.2 condition 1). Skipped only when the slug is unknown/staff (the policy short-circuits
  // those before membership can matter) — but resolving it unconditionally keeps the query simple and
  // the policy the sole decider.
  const membershipRow = await findActiveMembership(userId, organizationId, db);
  const membership: ActiveMembershipFact | null = membershipRow;

  // The ORG-ANCHORED granted-slug set (RV-0146) — resolved ONLY when there is an active membership
  // (no membership ⇒ no role ⇒ empty set). Anchored on (role_id ∧ (org = active_org ∨ NULL)) ∧ tenant.
  const grantedSlugs =
    membership === null
      ? new Set<string>()
      : await resolveGrantedTenantSlugs(membership.roleId, organizationId, db);

  // ── Path selection (Doc-4A §6.1 "OR"): a present `vendor_profile_id` signals the delegated act-as
  //    path (§6B); its absence is the pure three-layer membership path. ──
  if (vendorProfileId === undefined) {
    return resolveMembershipPath({ permission, membership, grantedSlugs });
  }

  // Delegated act-as path (§6B.2). Resolve the representative org's active, in-window grant on the
  // target profile (condition 3), and the target profile's own state (condition 5, via the injected
  // port — fail-closed to `false` when no reader is provided).
  const grantRow = await findActiveDelegationGrant(organizationId, vendorProfileId, now, db);
  const grant: DelegationGrantFact | null = grantRow;
  const profileStatePermits =
    deps.vendorProfileStateReader === undefined
      ? false // condition 5 cannot be affirmed without the M2 reader ⇒ fail closed.
      : await deps.vendorProfileStateReader(vendorProfileId);

  return resolveDelegatedAccess({
    permission,
    targetVendorProfileId: vendorProfileId,
    membership,
    grantedSlugs,
    grant,
    profileStatePermits,
  });
}
