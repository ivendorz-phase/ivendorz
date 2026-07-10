// App-layer COMPOSITION for the active-org buyer-profile WRITE (REPOSITORY_STRUCTURE §5/§8 — `src/server`
// wires Supabase Auth ↔ active-org context ↔ module contracts). Mirrors the read composition: ONE composed
// CORE + a thin HTTP face. This is where the M0 `appendAuditRecord` concrete is INJECTED into the M1
// command (the boundary-legal wiring — M1 depends only on the M0 contract TYPE).
//
// Composition (Doc-4C §C10 realized via Doc-5A §5.6/§6.1/§6.2/§6.6):
//   1. Resolve the Supabase session (injectable). Unauthenticated → the DC-4 auth-boundary `401`.
//   2. `ensureProvisioned(session)` — lazy first-login identity materialization (so a first-time caller
//      already has the personal org + Owner membership the write authorizes against).
//   3. `withActiveOrg(session, (tx, context) => upsertBuyerProfile(input, ctx, { appendAuditRecord }, tx))`
//      — run the M1 command INSIDE the server-validated active-org transaction. RLS scopes the
//      buyer_profiles write AND the audit `WITH CHECK` to `app.active_org`/`app.user_id`; the audit is
//      atomic with the write (same `tx`). NO client-supplied org id (Invariant #5).
//   4. Collapse `resolved:false` (no active-org context, fail-closed) → `null` → the `404` non-disclosure
//      safe default (Doc-5A §6.6), identical to the read's no-context collapse.
//
// AUTH-BOUNDARY 401 (DC-4): unauthenticated is pre-contract (no Doc-5A `error_class`) — the transport-level
// `authChallengeResponse()`. See `governanceReviews/ESC-W1-AUTH-401_v1.0.md`.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  mapUpsertBuyerProfile,
  upsertBuyerProfile,
  type UpsertBuyerProfileInput,
  type UpsertBuyerProfileOutcome,
  type UpsertBuyerProfileResult,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable for tests). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the buyer-profile write composition. All injectable (defaults bind production wiring). */
export interface UpsertBuyerProfileHandlerDeps {
  /** Resolve the authenticated subject (default: the live Supabase cookie session — see route entry). */
  resolveSession: ResolveSession;
  /** Lazy first-login provisioning (default: the concrete WP-1.3 hook). */
  ensureProvisioned: typeof ensureProvisioned;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional — null when not captured. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

type CoreOutcome =
  | { authenticated: false; outcome: null }
  | { authenticated: true; outcome: UpsertBuyerProfileOutcome | null };

/**
 * The composed CORE — runs the active-org buyer-profile upsert (no HTTP). Resolves auth → provisions →
 * runs the M1 command inside the active-org transaction (audit atomic with the write), collapsing
 * "no active-org context" to `null`.
 */
async function resolveActiveOrgUpsertBuyerProfile(
  input: UpsertBuyerProfileInput,
  deps: UpsertBuyerProfileHandlerDeps,
): Promise<CoreOutcome> {
  const session = await deps.resolveSession();
  if (session === null) {
    return { authenticated: false, outcome: null };
  }

  await deps.ensureProvisioned(session);

  // Run the command INSIDE the server-validated active-org context. The M0 `appendAuditRecord` concrete is
  // injected here (M1 sees only the contract TYPE). `tx` carries the GUCs both RLS surfaces read.
  const ran = await withActiveOrg(session, (tx, context) =>
    upsertBuyerProfile(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    ),
  );

  return { authenticated: true, outcome: ran.resolved ? ran.value : null };
}

/**
 * The HTTP face for `POST /identity/buyer_profiles` — `identity.upsert_buyer_profile.v1`. Returns a
 * transport-agnostic `WireResponse`: `201`/`200` (created/updated) with the Doc-5A §5.6 envelope; the
 * DC-4 auth-boundary `401` when unauthenticated; `400`/`403`/`409` (validation/forbidden/conflict); or
 * `404` (non-disclosure) when no active-org context resolves.
 */
export async function handleUpsertBuyerProfile(
  input: UpsertBuyerProfileInput,
  deps: UpsertBuyerProfileHandlerDeps,
): Promise<WireResponse<UpsertBuyerProfileResult>> {
  const core = await resolveActiveOrgUpsertBuyerProfile(input, deps);
  if (!core.authenticated) {
    return authChallengeResponse();
  }
  return mapUpsertBuyerProfile(core.outcome);
}
