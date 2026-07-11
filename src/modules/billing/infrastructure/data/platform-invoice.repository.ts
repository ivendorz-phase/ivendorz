// M7 infrastructure (PRIVATE) — thin Prisma repository over `billing.platform_invoices` (+
// `billing.platform_payments`) for BC-BILL-5 `get_platform_invoice` / `list_platform_invoices`
// (Doc-4I §HB-5.4 / Doc-6I §3.5). M7 reading its OWN schema. Calls run under the caller's `withActiveOrg`
// tenant transaction — the `platform_invoices_tenant` / `platform_payments_read` RLS scope them to the
// debtor `app.active_org`. READ-ONLY: the issue/update writes + record_payment land in the next slice.
//
// `amount` is Doc-6I §3.5 `numeric` = REAL MONEY (platform revenue) → rendered as a precision-preserving
// decimal STRING (the `plans.price` convention), NOT a number (unlike usage/lead-credit units).

import { prisma, type DbExecutor } from "../../../../shared/db";

/** Invoice status / purpose / payment enums (Doc-2 §10.8 client values — identical to the wire strings). */
type InvoiceStatus = "issued" | "paid" | "overdue" | "void";
type InvoicePurpose = "subscription" | "lead_package" | "advertising" | "microsite" | "service";
type PaymentGateway = "sslcommerz" | "bkash" | "nagad" | "bank";
type PaymentStatus = "initiated" | "succeeded" | "failed" | "refunded";

/** One `platform_payments` row projected for the `get_platform_invoice` `payments` sub-list. */
export interface InvoicePaymentReadModel {
  gateway: PaymentGateway;
  gatewayRef: string | null;
  status: PaymentStatus;
}

/** The full `platform_invoices` head (+ payments) for `get_platform_invoice`. `amount` is a money string. */
export interface InvoiceDetailReadModel {
  id: string;
  humanRef: string;
  organizationId: string;
  purpose: InvoicePurpose;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  payments: InvoicePaymentReadModel[];
}

/** One `platform_invoices` row projected for `list_platform_invoices` (no payments). `createdAt` is carried
 *  for the keyset cursor; the query strips it from the wire item. */
export interface InvoiceListItemReadModel {
  id: string;
  humanRef: string;
  purpose: InvoicePurpose;
  amount: string;
  currency: string;
  status: InvoiceStatus;
  createdAt: Date;
}

/** Repo-level list filters (already validated by the caller). */
export interface InvoiceFilter {
  status?: InvoiceStatus;
  purpose?: InvoicePurpose;
}

/** Load ONE invoice (+ its payment records) scoped to the debtor org. `null` ⇒ absent OR cross-org (the
 *  `platform_invoices_tenant` RLS already scopes; the explicit `organizationId` filter is the twin) → NOT_FOUND. */
export async function findInvoiceForOrg(
  invoiceId: string,
  organizationId: string,
  db: DbExecutor = prisma,
): Promise<InvoiceDetailReadModel | null> {
  const row = await db.platformInvoice.findFirst({
    where: { id: invoiceId, organizationId },
    select: {
      id: true,
      humanRef: true,
      organizationId: true,
      purpose: true,
      amount: true,
      currency: true,
      status: true,
      payments: {
        orderBy: { createdAt: "asc" },
        select: { gateway: true, gatewayRef: true, status: true },
      },
    },
  });
  if (row === null) return null;
  return {
    id: row.id,
    humanRef: row.humanRef,
    organizationId: row.organizationId,
    purpose: row.purpose,
    amount: row.amount.toString(),
    currency: row.currency,
    status: row.status,
    payments: row.payments.map((p) => ({
      gateway: p.gateway,
      gatewayRef: p.gatewayRef,
      status: p.status,
    })),
  };
}

/** One keyset-paginated page of the debtor org's invoices (DESC by `created_at`, `id` tiebreak — newest
 *  first), matching `filter`, up to `limit` rows. `after` is the decoded cursor position (exclusive). */
export async function findInvoicesPage(
  organizationId: string,
  filter: InvoiceFilter,
  after: { createdAt: Date; id: string } | null,
  limit: number,
  db: DbExecutor = prisma,
): Promise<InvoiceListItemReadModel[]> {
  const rows = await db.platformInvoice.findMany({
    where: {
      organizationId,
      ...(filter.status !== undefined ? { status: filter.status } : {}),
      ...(filter.purpose !== undefined ? { purpose: filter.purpose } : {}),
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
    select: {
      id: true,
      humanRef: true,
      purpose: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    humanRef: r.humanRef,
    purpose: r.purpose,
    amount: r.amount.toString(),
    currency: r.currency,
    status: r.status,
    createdAt: r.createdAt,
  }));
}
