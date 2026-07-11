// M7 api (PRIVATE) — the HTTP-handler WIRE MAPPING for the BC-BILL-6 reward/referral reads
// `get_reward_balance` / `list_referrals` (Doc-4I §HB-6.3 / Doc-5I §9). Pure (no I/O). BOUNDARY:
// `@/shared/http` + the M7 contract TYPES only.
//
//   - get_reward_balance → `200` (§5.6; org-self, balance 0 when no account).
//   - list_referrals → `200` (§5.6 list envelope) or `400` VALIDATION (cursor / page_size).
//   - 403 (no active org / `can_view_billing` denied) → the composition edge (org-self read, no NOT_FOUND).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  ListReferralsOutcome,
  ListReferralsResult,
  RewardBalanceView,
} from "@/modules/billing/contracts";

const INVALID_INPUT_CODE = "billing_reward_invalid_input";
export const REWARD_VIEW_FORBIDDEN = "billing_reward_view_forbidden";

/** `billing.get_reward_balance.v1` view → `200` (§5.6). Org-self; always resolves (balance 0 when none). */
export function mapGetRewardBalance(view: RewardBalanceView): WireResponse<RewardBalanceView> {
  return successResponse(view, 200);
}

/** `billing.list_referrals.v1` outcome → `200` (§5.6 list envelope) or `400` VALIDATION. */
export function mapListReferrals(outcome: ListReferralsOutcome): WireResponse<ListReferralsResult> {
  if (outcome.ok) return successResponse(outcome.result, 200);
  return errorResponse({
    error_class: "VALIDATION",
    error_code: INVALID_INPUT_CODE,
    message: "Invalid cursor or page_size.",
    retryable: false,
  });
}

/** Composition-edge `403` for the reward reads — no valid active-org context (Doc-4I §HB-6.3 Stage-2
 *  CONTEXT → AUTHORIZATION) OR `can_view_billing` denied. Org-self read; no caller `org_id`, no NOT_FOUND leg. */
export function rewardViewForbidden(): WireResponse<never> {
  return errorResponse({
    error_class: "AUTHORIZATION",
    error_code: REWARD_VIEW_FORBIDDEN,
    message: "An active organization context and can_view_billing are required.",
    retryable: false,
  });
}
