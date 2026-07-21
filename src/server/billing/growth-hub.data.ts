// App-layer SERVER-RENDERED DATA face for the Growth Hub surface at `/account/rewards`
// (Doc-7E_GrowthHub_Patch_v1.0.1 §1/§2(a) — the ER6 Rewards row: `get_reward_balance` +
// `list_referrals`, BC-BILL-6 frozen/unchanged). The WP-1.6 `loadActiveOrgBuyerProfile` pattern:
// the `(app)` page reads via this server composition, NOT a client self-fetch of its own HTTP API
// (Doc-7C server-side wired data layer). The HTTP faces for the same reads live in
// `reward.route-handler.ts` — this face composes the SAME contracts with the SAME authorization
// (`can_view_billing`) inside ONE `withActiveOrg` tenant transaction.
//
// Composition:
//   1. Resolve the Supabase session (injectable). No session ⇒ `{ authenticated: false }`.
//   2. `ensureProvisioned(session)` — lazy first-login identity materialization (WP-1.3).
//   3. `withActiveOrg(session, …)` — RLS-scoped tenant tx; org = SERVER-VALIDATED active org
//      (Invariant #5 — never a client-supplied org id).
//   4. Authorize `can_view_billing` (the BC-BILL-6 read slug — the reward.route-handler gate) via
//      `hasPermission` ON the tenant tx; also resolve `can_manage_growth_invites` (Doc-7E v1.0.1
//      §3 — SLUG-GATING IS UX ONLY: the CTA/flow renders for holders; the M1 app layer behind
//      `POST /identity/growth_invitations` is the enforcement, never this boolean).
//   5. Read `get_reward_balance` + `list_referrals` (bounded page walk) on the SAME tx.
//
// COLLAPSE: "no active-org context" and "`can_view_billing` denied" collapse to ONE
// `access: "unavailable"` (the HTTP faces collapse both to the same 403 — `rewardViewForbidden`);
// the page renders one honest state for both.
//
// FUNNEL HONESTY (Doc-7E v1.0.1 §2(a)): this face exposes ONLY the two wired reads. The
// invitation-side funnel (Sent/Accepted/Registered) has NO wired read — `[ESC-7-API]` (§5); no
// substitute figure is derived or exposed here.
//
// BOUNDARY: imports `src/server/*` + `@/modules/billing/contracts` + `@/modules/identity/contracts`
// (the slug constant — contracts-only) — never a module internal.

import { ensureProvisioned } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import { getRewardBalance, listReferrals, type ReferralItem } from "@/modules/billing/contracts";
import { CAN_MANAGE_GROWTH_INVITES_SLUG } from "@/modules/identity/contracts";
import type { ResolveSession } from "./reward.route-handler";

/** The BC-BILL-6 read slug (Doc-2 §7) — the same gate `reward.route-handler.ts` applies. */
const CAN_VIEW_BILLING = "can_view_billing";

/** Bounded referral page walk: pages of 100 (the registered list max), hard-capped. Referral
 *  volumes are small (org→org referrals); the cap only guards the loop. Beyond it the outcome is
 *  flagged `referralsTruncated` so the surface can render counts as lower bounds — never a
 *  fabricated exact total. */
const REFERRALS_PAGE_SIZE = 100;
const REFERRALS_MAX_PAGES = 5;

/** Dependencies (all injectable; production wiring binds the live session resolver + hook). */
export interface GrowthHubDataDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/**
 * The transport-agnostic DATA outcome of the Growth Hub reads.
 *
 * - `authenticated: false` — no session (the page routes to the `(auth)` login affordance).
 * - `access: "unavailable"` — no active-org context OR `can_view_billing` denied, COLLAPSED (the
 *   same collapse the HTTP faces make to one 403). Rendered as ONE honest state.
 * - `access: "ok"` — the wired reads: `balance` (reward POINTS — never money), the referral items
 *   (opaque `referredOrganizationId` refs + the frozen `pending → qualified → rewarded` states),
 *   and the §3 UX-gating boolean for the "Invite a business" CTA.
 */
export type ActiveOrgGrowthHubOutcome =
  | { authenticated: false }
  | { authenticated: true; access: "unavailable" }
  | {
      authenticated: true;
      access: "ok";
      /** Reward-points balance (`get_reward_balance` — 0 when the org has no account yet). */
      balance: number;
      /** The referrer org's referrals, newest first (`list_referrals`, walked up to the cap). */
      referrals: ReferralItem[];
      /** True iff more referrals exist beyond the bounded walk — counts are lower bounds. */
      referralsTruncated: boolean;
      /** Doc-7E v1.0.1 §3 — UX gating ONLY (the M1 app layer enforces on the write path). */
      canManageGrowthInvites: boolean;
    };

/**
 * Load the Growth Hub data for the server-rendered `/account/rewards` page (Doc-7E v1.0.1 §2(a)).
 * One tenant transaction, both frozen BC-BILL-6 reads, the `can_view_billing` gate, and the §3
 * CTA-gating slug — no client-supplied org id anywhere (Invariant #5).
 */
export async function loadActiveOrgGrowthHub(
  deps: GrowthHubDataDeps,
): Promise<ActiveOrgGrowthHubOutcome> {
  const session = await deps.resolveSession();
  if (session === null) {
    return { authenticated: false };
  }

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const canView = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_VIEW_BILLING,
      },
      undefined,
      tx,
    );
    if (!canView) return { denied: true as const };

    const canManageGrowthInvites = await hasPermission(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        permissionSlug: CAN_MANAGE_GROWTH_INVITES_SLUG,
      },
      undefined,
      tx,
    );

    const { balance } = await getRewardBalance(context.activeOrgId, tx);

    // Bounded keyset walk over `list_referrals` (server-issued cursors only — Doc-5A §8.2).
    const referrals: ReferralItem[] = [];
    let cursor: string | undefined;
    let referralsTruncated = false;
    for (let page = 0; page < REFERRALS_MAX_PAGES; page += 1) {
      const outcome = await listReferrals(
        { pageSize: REFERRALS_PAGE_SIZE, ...(cursor !== undefined ? { cursor } : {}) },
        context.activeOrgId,
        tx,
      );
      // Defensive: our request shape is fixed and every cursor is server-issued, so VALIDATION is
      // unreachable here; if it ever fires, stop the walk and flag truncation (never fabricate).
      if (!outcome.ok) {
        referralsTruncated = true;
        break;
      }
      referrals.push(...outcome.result.items);
      if (!outcome.result.pageInfo.hasMore || outcome.result.pageInfo.nextCursor === undefined) {
        break;
      }
      cursor = outcome.result.pageInfo.nextCursor;
      if (page === REFERRALS_MAX_PAGES - 1) {
        referralsTruncated = true;
      }
    }

    return {
      denied: false as const,
      balance,
      referrals,
      referralsTruncated,
      canManageGrowthInvites,
    };
  });

  if (!ran.resolved || ran.value.denied) {
    // No active-org context and `can_view_billing` denied COLLAPSE to one state (see header).
    return { authenticated: true, access: "unavailable" };
  }

  return {
    authenticated: true,
    access: "ok",
    balance: ran.value.balance,
    referrals: ran.value.referrals,
    referralsTruncated: ran.value.referralsTruncated,
    canManageGrowthInvites: ran.value.canManageGrowthInvites,
  };
}
