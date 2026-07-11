// App-layer COMPOSITION for the BC-BILL-6 reward/referral reads (Doc-5I §9 — `GET /billing/reward-account`
// · 200, `GET /billing/referrals` · 200). ORG-SELF reads (Own-Org, User-only — Doc-5I §3.6): resolve session
// → provision → run inside `withActiveOrg` (RLS-scoped tenant tx), authorize `can_view_billing` via
// `hasPermission` (M1 `check_permission`) ON the tenant tx. Org = server-validated active org — NO caller
// `org_id` (Doc-5I §9 / Invariant #5). The reward/referral writes land in the next slice.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import {
  getRewardBalance,
  listReferrals,
  mapGetRewardBalance,
  mapListReferrals,
  rewardViewForbidden,
  type ListReferralsRequest,
  type ListReferralsResult,
  type RewardBalanceView,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the reward read compositions. All injectable (defaults bind production wiring). */
export interface RewardHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/** The Doc-2 §7 slug the reads authorize (Owner, Delegate) — bound by pointer, never a role name. */
const CAN_VIEW_BILLING = "can_view_billing";

/**
 * `GET /billing/reward-account` — `billing.get_reward_balance.v1`. `200` (§5.6; balance 0 when no account) ·
 * `401` · `403` (no active org / `can_view_billing` denied).
 */
export async function handleGetRewardBalance(
  deps: RewardHandlerDeps,
): Promise<WireResponse<RewardBalanceView>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
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
    return { denied: false as const, view: await getRewardBalance(context.activeOrgId, tx) };
  });

  if (!ran.resolved || ran.value.denied) {
    return rewardViewForbidden();
  }
  return mapGetRewardBalance(ran.value.view);
}

/**
 * `GET /billing/referrals` — `billing.list_referrals.v1`. `200` (§5.6 list) · `401` · `400` (SYNTAX: cursor /
 * page_size) · `403` (no active org / `can_view_billing` denied).
 */
export async function handleListReferrals(
  request: ListReferralsRequest,
  deps: RewardHandlerDeps,
): Promise<WireResponse<ListReferralsResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
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
    return {
      denied: false as const,
      outcome: await listReferrals(request, context.activeOrgId, tx),
    };
  });

  if (!ran.resolved || ran.value.denied) {
    return rewardViewForbidden();
  }
  return mapListReferrals(ran.value.outcome);
}
