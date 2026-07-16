// App-layer SERVER composition that resolves the DEFAULT workspace destination for the signed-in
// user's active org — "which co-mounted surface do we foreground on entry" (the post-login landing +
// the `/dashboard` workspace-entry route).
//
// NOT a route handler and NOT a contract: it coins none. Composition (REPOSITORY_STRUCTURE §5/§8)
// over ONE existing frozen M1 read — `identity.get_organization.v1` (§C3), which projects
// `participation_flags` (`has_buyer_profile` / `has_vendor_profile`, Doc-2 §10.2) — resolved inside
// the server-validated active-org context. No module internal is touched and no `identity.*` table is
// read cross-module (§C3: consumers call the contract, never read `identity.organizations`).
//
// LENS ≠ GATE ([ESC-7G-A7R], binding). This picks which co-mounted surface to FOREGROUND on entry; it
// authorizes nothing and hides nothing. Both `/buy` and `/sell` stay mounted under every lens, and a
// user sent to one reaches the other in one click. This is a NAVIGATION default derived from
// participation — never an authorization boundary (the server re-validates every route regardless, R7).
//
// DEFAULT = BUY (owner-ruled 2026-07-16). A hybrid org (both flags) and a buyer-only org both enter on
// the Buying lens; only a vendor-ONLY org (vendor flag, no buyer flag) enters on Selling. No session /
// no active-org context → the Buy default (that workspace renders its own neutral first-run state).
//
// INVARIANT #5 / Doc-7C SR3: the org is resolved SERVER-SIDE from the session; there is no
// client-supplied org id, and this returns a path string, never an HTTP envelope.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { getOrganization } from "@/modules/identity/contracts";

/** The two co-mounted workspace overview routes a fresh entry can foreground. */
export const BUY_WORKSPACE_HOME = "/buy/dashboard";
export const SELL_WORKSPACE_HOME = "/sell/dashboard";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

export interface WorkspaceEntryDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/**
 * Resolve the default workspace overview route to foreground on entry. Buy for buyer-only and hybrid
 * orgs (and the fail-safe default); Sell only for a vendor-ONLY org. Never gates — see the header.
 */
export async function resolveWorkspaceEntryPath(deps: WorkspaceEntryDeps): Promise<string> {
  // (1) Authentication only. No session (e.g. demo-mode bypass) → the ruled Buy default.
  const session = await deps.resolveSession();
  if (session === null) {
    return BUY_WORKSPACE_HOME;
  }

  // (2) Lazy first-login provisioning — idempotent + atomic behind the M1 contract.
  await deps.ensureProvisioned(session);

  // (3) Read the active org's participation flags inside the server-validated, RLS-scoped context.
  //     Fail-closed: no active org ⇒ the read never runs and we fall back to the Buy default.
  const outcome = await withActiveOrg(session, async (tx, context) => {
    const organization = await getOrganization(context.activeOrgId, tx);
    return organization.found ? organization.organization.participationFlags : null;
  });

  if (!outcome.resolved || outcome.value === null) {
    return BUY_WORKSPACE_HOME;
  }

  // Vendor-ONLY → Selling. Buyer-only, hybrid, or neither → Buying (the ruled default).
  const { hasBuyerProfile, hasVendorProfile } = outcome.value;
  return hasVendorProfile && !hasBuyerProfile ? SELL_WORKSPACE_HOME : BUY_WORKSPACE_HOME;
}
