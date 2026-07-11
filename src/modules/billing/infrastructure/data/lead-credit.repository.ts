// M7 infrastructure (PRIVATE) — thin Prisma repository over `billing.lead_credit_accounts` +
// `billing.lead_credit_transactions` for BC-BILL-4 `get_lead_balance` / `list_lead_transactions`
// (Doc-4I §HB-4.2 / Doc-6I §3.4). M7 reading its OWN schema. Calls run under the caller's `withActiveOrg`
// tenant transaction — the `lead_credit_*_tenant` RLS scopes them to `app.active_org`. READ-ONLY: the
// credit/debit writers (§HB-4.1) land in the next slice.
//
// `balance`/`amount` are Doc-6I §3.4 `numeric` = lead CREDITS (units, NOT money — BL-CR7) → handled as JS
// numbers (unlike `plans.price`, a money string). The transactions ledger is the source of truth; the
// account head carries the System-maintained running total.

import { prisma, type DbExecutor } from "../../../../shared/db";

/** Coerce a Prisma `Decimal` (credits — not money) to a JS number; `null` → 0. */
function toNum(value: { toString(): string } | null): number {
  return value === null ? 0 : Number(value.toString());
}

/** One `lead_credit_transactions` row projected for `list_lead_transactions` items. */
export interface LeadTransactionReadModel {
  id: string;
  direction: "credit" | "debit";
  amount: number;
  sourceInvoiceId: string | null;
  occurredAt: Date;
}

/** The org's current lead-credit balance (the live account head). `0` when the org has no account yet
 *  (an org with no lead-credit movement has a zero balance — Doc-4I §HB-4.2 is org-self, no NOT_FOUND). */
export async function loadLeadBalance(
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<number> {
  const row = await db.leadCreditAccount.findFirst({
    where: { organizationId, deletedAt: null },
    select: { balance: true },
  });
  return row === null ? 0 : toNum(row.balance);
}

/** One keyset-paginated page of the org's lead-credit transactions (DESC by `created_at`, `id` tiebreak —
 *  newest first), up to `limit` rows. Scoped via the parent account's org. `after` = decoded cursor pos. */
export async function findLeadTransactionsPage(
  organizationId: string,
  after: { createdAt: Date; id: string } | null,
  limit: number,
  db: DbExecutor = prisma,
): Promise<LeadTransactionReadModel[]> {
  const rows = await db.leadCreditTransaction.findMany({
    where: {
      account: { organizationId, deletedAt: null },
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
    select: { id: true, txnType: true, amount: true, sourceInvoiceId: true, createdAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    direction: r.txnType,
    amount: toNum(r.amount),
    sourceInvoiceId: r.sourceInvoiceId,
    occurredAt: r.createdAt,
  }));
}
