// App-layer COMPOSITION for the BC-BILL-5 invoice reads (Doc-5I §8 — `GET /billing/invoices/{invoice_id}` ·
// 200, `GET /billing/invoices` · 200). ORG-SELF reads (Own-Org debtor, User-only — Doc-5I §3.6): resolve
// session → provision → run inside `withActiveOrg` (RLS-scoped tenant tx), authorize `can_view_billing` via
// `hasPermission` (M1 `check_permission`) ON the tenant tx. Org = server-validated active org — NO caller
// `org_id` (Doc-5I §8 / Invariant #5). The issue/update writes + record_payment land in the next slice.

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { hasPermission } from "@/server/authz";
import {
  getPlatformInvoice,
  invoiceViewForbidden,
  listPlatformInvoices,
  mapGetPlatformInvoice,
  mapListPlatformInvoices,
  type ListPlatformInvoicesRequest,
  type ListPlatformInvoicesResult,
  type PlatformInvoiceView,
} from "@/modules/billing/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the invoice read compositions. All injectable (defaults bind production wiring). */
export interface PlatformInvoiceHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
}

/** The Doc-2 §7 slug the reads authorize (Owner, Delegate) — bound by pointer, never a role name. */
const CAN_VIEW_BILLING = "can_view_billing";

/**
 * `GET /billing/invoices/{invoice_id}` — `billing.get_platform_invoice.v1`. `200` (§5.6, incl. payments) ·
 * `401` · `400` (SYNTAX) · `403` (no active org / `can_view_billing` denied) · `404` (absent/cross-org).
 */
export async function handleGetPlatformInvoice(
  invoiceId: string,
  deps: PlatformInvoiceHandlerDeps,
): Promise<WireResponse<PlatformInvoiceView>> {
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
      outcome: await getPlatformInvoice(invoiceId, context.activeOrgId, tx),
    };
  });

  if (!ran.resolved || ran.value.denied) {
    return invoiceViewForbidden();
  }
  return mapGetPlatformInvoice(ran.value.outcome);
}

/**
 * `GET /billing/invoices` — `billing.list_platform_invoices.v1`. `200` (§5.6 list) · `401` · `400` (SYNTAX:
 * filter / cursor / page_size) · `403` (no active org / `can_view_billing` denied).
 */
export async function handleListPlatformInvoices(
  request: ListPlatformInvoicesRequest,
  deps: PlatformInvoiceHandlerDeps,
): Promise<WireResponse<ListPlatformInvoicesResult>> {
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
      outcome: await listPlatformInvoices(request, context.activeOrgId, tx),
    };
  });

  if (!ran.resolved || ran.value.denied) {
    return invoiceViewForbidden();
  }
  return mapListPlatformInvoices(ran.value.outcome);
}
