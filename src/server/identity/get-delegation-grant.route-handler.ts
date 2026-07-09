// App-layer COMPOSITION for `identity.get_delegation_grant.v1` (W2-IDN-6.5; Doc-5C §5.1 —
// `GET /identity/delegation_grants/{id}` · `200`). The dual-party single-grant read: EITHER party
// org (controlling or representative — Doc-4C §C9 "reads are dual-party, writes are controller-only");
// Slug none. Non-party / absent → one byte-identical `404` collapse (§7.5).
//
// Composition: session → 401 · SYNTAX (`{id}` uuid — the §C9 matrix's category 1) → 400 · provision ·
// `withActiveOrg` (party scope = the server-resolved active org) → query → wire map. Reads carry no
// Idempotency-Key (§B.6: queries are `not-applicable`) and are unaudited (§17.1).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import {
  delegationInvalidInput,
  getDelegationGrant,
  mapGetDelegationGrant,
  type DelegationGrantView,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

export interface GetDelegationGrantHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The HTTP face for `GET /identity/delegation_grants/{id}`. Returns `200` (§5.6 envelope — the
 * FROZEN §C9 projection) · `401` auth-boundary · `400` malformed `{id}` · `404` collapse
 * (absent / non-party / no context — byte-identical, §7.5).
 */
export async function handleGetDelegationGrant(
  delegationGrantId: string,
  deps: GetDelegationGrantHandlerDeps,
): Promise<WireResponse<DelegationGrantView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX (Doc-4A §11.2 category 1; §C9 matrix: SYNTAX (uuid) first).
  if (!UUID_RE.test(delegationGrantId)) {
    return delegationInvalidInput("delegation_grant_id must be a uuid.");
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, (tx, context) =>
    getDelegationGrant(delegationGrantId, context.activeOrgId, tx),
  );
  return mapGetDelegationGrant(ran.resolved ? ran.value : null);
}
