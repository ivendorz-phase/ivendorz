// M7 infrastructure (PRIVATE) — thin Prisma repository over `billing.reward_accounts` + `billing.referrals`
// for BC-BILL-6 `get_reward_balance` / `list_referrals` (Doc-4I §HB-6.3 / Doc-6I §3.6). M7 reading its OWN
// schema. Calls run under the caller's `withActiveOrg` tenant transaction — `reward_accounts_tenant` /
// `referrals_tenant` RLS scope them to `app.active_org`. READ-ONLY: the writes (credit_reward /
// track_referral / advance_referral) land in the next slice.
//
// `balance` is Doc-6I §3.6 `numeric` = reward POINTS (units, NOT money — BL-CR10) → handled as a JS number.

import { prisma, type DbExecutor } from "../../../../shared/db";

/** Coerce a Prisma `Decimal` (points — not money) to a JS number; `null` → 0. */
function toNum(value: { toString(): string } | null): number {
  return value === null ? 0 : Number(value.toString());
}

/** One `referrals` row projected for `list_referrals` items. `createdAt` is carried for the keyset cursor. */
export interface ReferralReadModel {
  id: string;
  referredOrganizationId: string | null;
  state: "pending" | "qualified" | "rewarded";
  createdAt: Date;
}

/** The org's current reward-points balance (the live account head). `0` when the org has no account yet
 *  (an org always has a — possibly zero — balance; Doc-4I §HB-6.3 is org-self, no NOT_FOUND). */
export async function loadRewardBalance(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<number> {
  const row = await db.rewardAccount.findFirst({
    where: { organizationId, deletedAt: null },
    select: { balance: true },
  });
  return row === null ? 0 : toNum(row.balance);
}

/** One keyset-paginated page of the referrer org's referrals (DESC by `created_at`, `id` tiebreak — newest
 *  first), up to `limit` rows. Scoped to the referrer org (referrals anchor). `after` = decoded cursor pos. */
export async function findReferralsPage(
  organizationId: string,
  after: { createdAt: Date; id: string } | null,
  limit: number,
  db: DbExecutor = prisma,
): Promise<ReferralReadModel[]> {
  const rows = await db.referral.findMany({
    where: {
      referrerOrganizationId: organizationId,
      ...(after !== null
        ? {
            OR: [
              { createdAt: { lt: after.createdAt } },
              { AND: [{ createdAt: after.createdAt }, { id: { lt: after.id } }] },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: { id: true, referredOrganizationId: true, state: true, createdAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    referredOrganizationId: r.referredOrganizationId,
    state: r.state,
    createdAt: r.createdAt,
  }));
}
