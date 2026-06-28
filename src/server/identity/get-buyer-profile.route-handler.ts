// App-layer COMPOSITION for `GET /identity/buyer_profiles` (REPOSITORY_STRUCTURE §5/§8 —
// `src/server` is the composition edge that wires Supabase Auth ↔ active-org context ↔ module
// contracts). This is the handler CORE: it composes the merged WP-1.3 (auth + lazy provision) and
// WP-1.4 (active-org context guard) pieces with the M1 `identity.get_buyer_profile.v1` contract and
// the M1 wire mapper, returning a transport-agnostic `WireResponse`. The thin Next.js route
// (`app/api/identity/buyer_profiles/route.ts`) only serializes this to a `NextResponse`.
//
// Why here (not in `app/api` or a module-internal): the composition needs `src/server/*` (auth,
// context) AND module `contracts/`. A module-internal may not import `src/server`; `app` and `tests`
// may import `src/server` + module `contracts/`. Placing the core here makes it BOUNDARY-LEGAL and
// TEST-REACHABLE (tests import `src/server` + `contracts`, never `app`). [WP-1.5]
//
// Composition (Doc-5C §6.1/§6.3 realized via Doc-5A §5.6/§6.1/§6.2/§6.6):
//   1. Resolve the Supabase session (injectable — `src/server/auth`). Unauthenticated → `401`
//      (the DC-4 AUTH-BOUNDARY response — pre-contract, NOT a Doc-5A contract error; see step note).
//   2. `ensureProvisioned(session)` — lazy first-login identity materialization (WP-1.3).
//   3. `withActiveOrg(session, (tx) => getBuyerProfile(tx))` — run the M1 read INSIDE the active-org
//      context transaction so RLS scopes it to `app.active_org` (WP-1.4). NO client-supplied org filter.
//   4. Map the outcome to the wire (M1 `mapGetBuyerProfile`): present → `200` envelope; absent /
//      cross-tenant / no-context → `404` (non-disclosure, indistinguishable — Doc-5C §6.3 / Doc-5A §6.6).
//
// BOUNDARY: imports `src/server/*` + `@/modules/identity/contracts` + `@/shared/http` only. No module
// internals, no cross-schema SQL (the RLS GUC seam lives in `withActiveOrg`).
//
// AUTH-BOUNDARY 401 (DC-4 / pre-contract): authentication is INFRASTRUCTURE (Doc-5C §3.1 — "the wire
// carries `Authorization` only; the auth mechanism is infrastructure"). An UNAUTHENTICATED request never
// reaches a Doc-5A contract, so it is NOT dressed in a Doc-5A contract `error_class` — the Doc-5A closed
// class set is contract-level / post-auth and has no authentication/401 class by design. The 401 is the
// transport-level auth-boundary response (`authChallengeResponse()` — top-level `reference_id` only, no
// `error`). See `governanceReviews/ESC-W1-AUTH-401_v1.0.md`. [Board ruling: realize-never-redecide;
// Doc-5A unamended; 403 NOT used — that would conflate "no credential" with an authorization denial.]

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import {
  getBuyerProfile,
  mapGetBuyerProfile,
  type BuyerProfileView,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/**
 * Resolve the authenticated Supabase subject for this request, or `null` when unauthenticated.
 * INJECTABLE: the live cookie-bound resolution (build-local-park-deploy) is the default; tests pass a
 * test-scoped seeded session resolver so the handler runs against a real provisioned user without a
 * live Supabase round-trip.
 */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the buyer-profile route handler core. All injectable (defaults bind production wiring). */
export interface GetBuyerProfileHandlerDeps {
  /** Resolve the authenticated subject (default: the live Supabase cookie session — see route entry). */
  resolveSession: ResolveSession;
  /** Lazy first-login provisioning (default: the concrete WP-1.3 hook). */
  ensureProvisioned: typeof ensureProvisioned;
}

/**
 * The composed handler core for `GET /identity/buyer_profiles`. Returns a transport-agnostic
 * `WireResponse` — `200` with the Doc-5A §5.6 envelope (buyer-profile DTO + `reference_id`), the DC-4
 * auth-boundary `401` when unauthenticated (no contract `error_class`), or `404` (non-disclosure) for
 * absent / cross-tenant / unresolved-context.
 */
export async function handleGetBuyerProfile(
  deps: GetBuyerProfileHandlerDeps,
): Promise<WireResponse<BuyerProfileView>> {
  // (1) Authentication (only) — Doc-5C §3.1. No session → the DC-4 auth-boundary 401 (pre-contract;
  //     NO Doc-5A `error_class` — see the AUTH-BOUNDARY 401 note above).
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // (2) Lazy first-login provisioning (WP-1.3) — idempotent + atomic behind the M1 contract.
  await deps.ensureProvisioned(session);

  // (3) Run the M1 read INSIDE the server-validated active-org context (WP-1.4). RLS scopes it to
  //     `app.active_org`; no client org filter. Fail-closed: no active org ⇒ `fn` never runs.
  const outcome = await withActiveOrg(session, (tx) => getBuyerProfile(tx));

  // (4) Map to the wire. `resolved:false` (no active-org context) collapses to the SAME `404` as a
  //     genuinely-absent profile — non-disclosure, indistinguishable (Doc-5C §6.3 / Doc-5A §6.6).
  return mapGetBuyerProfile(outcome.resolved ? outcome.value : null);
}
