// App-layer SERVER-RENDERED DATA face for "who is signed in, and which org am I acting for" — the
// identity a workspace surface greets the user with (Doc-7C SR3; the `get_active_context` seam the
// buyer dashboard's `page.tsx` has carried as PARKED since it was written).
//
// NOT a route handler and NOT a contract: there is no `identity.get_active_identity.*` and this coins
// none. It is app-layer COMPOSITION (REPOSITORY_STRUCTURE §5/§8) over TWO EXISTING FROZEN M1 reads —
// `identity.get_organization.v1` (§C3, projects `name`) and `identity.get_user.v1` (§C3, projects
// `display_name`) — resolved inside the server-validated active-org context. Both come from
// `@/modules/identity/contracts`; no module internal is touched and no `identity.*` table is read
// directly (§C3: "Consumers MUST call this, never read `identity.organizations` cross-module").
//
// WHY BOTH READS. `ActiveContextView` deliberately projects `{ organizationId, membership,
// effectivePermissionSummary }` and NO display names, so the context read alone cannot render a
// greeting. `withActiveOrg` already hands back the resolved `{ userId, activeOrgId }`, so this
// composes the two name-bearing reads directly rather than re-reading the context to obtain ids it
// has already been given.
//
// COMPOSITION (identical in shape to `loadActiveOrgBuyerProfile`, deliberately — one pattern for the
// server-rendered data layer): session → `401`-equivalent (`authenticated: false`) · lazy first-login
// provisioning · `withActiveOrg` (server-validated, RLS-scoped; fail-closed — no active org ⇒ the
// reads never run) · collapse.
//
// INVARIANT #5 / Doc-7C SR3: the browser never calls a Doc-5 contract and never asserts org identity.
// The org is resolved SERVER-SIDE from the session; there is no client-supplied org id, and this face
// returns DATA, never an HTTP envelope.
//
// NON-DISCLOSURE: `resolved: false` (no active membership) and a genuinely-absent record collapse to
// the SAME `null` — a caller cannot distinguish "no context" from "not found" (Doc-5C §6.3 pattern,
// as `loadActiveOrgBuyerProfile` does for the profile).
//
// `displayName` IS NULLABLE BY CONTRACT — "absence is the legitimate state" (`UserView`, per
// `ESC-IDN-DISPLAYNAME` owner Option A, 2026-07-09). A null name is NOT an error and must NOT be
// back-filled with a fabricated one; the caller renders the un-named greeting.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { getOrganization, getUser } from "@/modules/identity/contracts";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

export interface ActiveOrgIdentityDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/**
 * The display identity for the active context. Both fields are independently nullable:
 * `userName` because `display_name` is contract-nullable; `orgName` because the org read can collapse
 * to not-found/no-context. A null field means "render without it" — never "substitute something".
 */
export interface ActiveOrgIdentity {
  /** `UserView.displayName` — the user's chosen presentation name. Never an identifier. */
  userName: string | null;
  /** `OrganizationView.name` — the active organization's name. */
  orgName: string | null;
}

/**
 * `authenticated: false` ⇒ no session (the caller decides the auth affordance; Doc-7C owns that
 * boundary). `authenticated: true, identity: null` ⇒ signed in but no resolvable active-org context.
 */
export type ActiveOrgIdentityOutcome =
  | { authenticated: false; identity: null }
  | { authenticated: true; identity: ActiveOrgIdentity | null };

/**
 * The SERVER-RENDERED DATA face for a workspace surface's identity. Returns DATA, never a
 * `WireResponse` — the page renders presentation, not a wire response.
 */
export async function loadActiveOrgIdentity(
  deps: ActiveOrgIdentityDeps,
): Promise<ActiveOrgIdentityOutcome> {
  // (1) Authentication only (Supabase = authentication; authorization is the app layer).
  const session = await deps.resolveSession();
  if (session === null) {
    return { authenticated: false, identity: null };
  }

  // (2) Lazy first-login provisioning — idempotent + atomic behind the M1 contract.
  await deps.ensureProvisioned(session);

  // (3) Both reads run INSIDE the server-validated active-org context, in ONE transaction, so the
  //     name pair can never straddle two contexts. Fail-closed: no active org ⇒ `fn` never runs.
  const outcome = await withActiveOrg(session, async (tx, context) => {
    const [organization, user] = await Promise.all([
      getOrganization(context.activeOrgId, tx),
      getUser(context.userId, tx),
    ]);
    return {
      orgName: organization.found ? organization.organization.name : null,
      userName: user.found ? user.user.displayName : null,
    };
  });

  // (4) Collapse `resolved: false` (no active-org context) to `null` — indistinguishable from absent.
  return { authenticated: true, identity: outcome.resolved ? outcome.value : null };
}
