// M7 infrastructure (PRIVATE) — thin Prisma repository over `billing.usage_ledger` for BC-BILL-3
// `enforce_quota` (§HB-3.2) + `get_usage` (§HB-3.3). M7 reading its OWN schema (allowed — One Module, One
// Owner). Calls run under the caller's tenant transaction — `usage_ledger_tenant` RLS scopes to
// `app.active_org`. READ-ONLY: the writer `record_usage` is deferred ([ESC-BILL-USAGE-ENTID]).
//
// `amount` is Doc-6I §3.3 `numeric` = QUOTA UNITS, **not money** (Doc-6I §3.3 explicit) — so it is handled
// as a JS number (unlike `plans.price`, which is a money string). Quota counts are small integers/decimals;
// the ≤/− quota arithmetic requires numeric math.

import { prisma, type DbExecutor } from "../../../../shared/db";

/** Coerce a Prisma `Decimal` (quota units — not money) to a JS number; `null` (no rows) → 0. */
function toNum(value: { toString(): string } | null): number {
  return value === null ? 0 : Number(value.toString());
}

/** Optional usage filters (already validated by the caller). */
export interface UsageFilter {
  quotaKey?: string;
  period?: string;
}

/** One `usage_ledger` row projected for `get_usage` items. */
export interface UsageRowReadModel {
  id: string;
  quotaKey: string;
  amount: number;
  period: string | null;
  source: "rfq_response" | "lead_access" | "ad_launch";
  createdAt: Date;
}

function whereFor(organizationId: string, filter: UsageFilter) {
  return {
    organizationId,
    ...(filter.quotaKey !== undefined ? { quotaKey: filter.quotaKey } : {}),
    ...(filter.period !== undefined ? { period: filter.period } : {}),
  };
}

/** SUM(`amount`) over the org's usage rows matching `filter` (the quota-balance total). `0` when none. */
export async function sumUsage(
  organizationId: string,
  filter: UsageFilter,
  db: DbExecutor = prisma,
): Promise<number> {
  const agg = await db.usageLedger.aggregate({
    where: whereFor(organizationId, filter),
    _sum: { amount: true },
  });
  return toNum(agg._sum.amount);
}

/** One keyset-paginated page of the org's usage rows matching `filter` (DESC by `created_at`, `id`
 *  tiebreak — newest first), up to `limit` rows. `after` is the decoded cursor position (exclusive). */
export async function findUsagePage(
  organizationId: string,
  filter: UsageFilter,
  after: { createdAt: Date; id: string } | null,
  limit: number,
  db: DbExecutor = prisma,
): Promise<UsageRowReadModel[]> {
  const rows = await db.usageLedger.findMany({
    where: {
      ...whereFor(organizationId, filter),
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
    select: { id: true, quotaKey: true, amount: true, period: true, source: true, createdAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    quotaKey: r.quotaKey,
    amount: toNum(r.amount),
    period: r.period,
    source: r.source,
    createdAt: r.createdAt,
  }));
}
