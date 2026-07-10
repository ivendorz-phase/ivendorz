// M1 application (PRIVATE) — `identity.get_delegation_grant.v1` (Doc-4C §C9 · 21.3 Query · Actor:
// User, EITHER party org). The dual-party single-grant read: both party orgs may read; a non-party
// caller collapses to `found: false` (the wire `404`), BYTE-INDISTINGUISHABLE from a nonexistent
// grant (§C9 Validation Matrix SCOPE: "RLS `organization_id IN (controlling, representative)`;
// `NOT_FOUND` collapse beyond parties, §7.5"). App-layer primary (Doc-6C §6.2a); RLS is the backstop.
//
// PROJECTION — the FROZEN §C9 response field set, EXACTLY (PassB:648): `{ delegation_grant_id,
// controlling_organization_id, representative_organization_id, vendor_profile_id, permission_set,
// valid_from, valid_to, status }`. Nothing added (no `updated_at` — the frozen projection omits it;
// the wire-token bootstrap gap is OBS-recorded in the WP report, never widened here).
//
// Read: unaudited (§17.1) · `Idempotency: not-applicable` · zero events.

import { prisma, type DbExecutor } from "@/shared/db";
import { findDelegationGrantById } from "../../infrastructure/data/delegation-grant.repository";
import type { DelegationGrantView, GetDelegationGrantResult } from "../../contracts/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve one delegation grant for a PARTY org (Doc-4C §C9). `partyOrgId` is the SERVER-RESOLVED
 * active org (Invariant #5 — never client input). Non-party / absent / malformed id ⇒
 * `{ found: false }` — one indistinguishable collapse shape (§7.5).
 */
export async function getDelegationGrant(
  delegationGrantId: string,
  partyOrgId: string,
  db: DbExecutor = prisma,
): Promise<GetDelegationGrantResult> {
  // SYNTAX — a malformed id can never resolve; the wire face maps this to its own 400 leg BEFORE
  // calling here (route composition); in-process callers get the safe collapse.
  if (!UUID_RE.test(delegationGrantId)) {
    return { found: false };
  }

  const row = await findDelegationGrantById(delegationGrantId, partyOrgId, db);
  if (row === null) {
    return { found: false };
  }

  const grant: DelegationGrantView = {
    delegationGrantId: row.id,
    controllingOrganizationId: row.controllingOrganizationId,
    representativeOrganizationId: row.representativeOrganizationId,
    vendorProfileId: row.vendorProfileId,
    permissionSet: row.fieldSet.permissionSet,
    validFrom: row.fieldSet.validFrom,
    validTo: row.fieldSet.validTo,
    status: row.status,
  };
  return { found: true, grant };
}
