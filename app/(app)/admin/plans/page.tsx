// P-ADM-22 Plan management (Doc-7H · Management · `billing.list_plans` · J-ADM-06). PRESENTATION ONLY: the
// commercial plan catalog. URL-driven status filter (server-rendered, deep-linkable) over the frozen `plans`
// machine (Doc-2 §3.8 `draft → active → retired`). Read surface — creating/editing/activating/retiring a plan is
// `create/update/retire_plan` + `activate_plan` on the editor (P-ADM-23), owned by M7/Billing (R5); the header
// "New plan" affordance is RENDERED BUT DISABLED. A Plan (COMMERCIAL) is NOT a Financial Tier (CAPABILITY) —
// Invariant #10 — and no plan-name gating is expressed here (entitlements are boolean/numeric/enum). The list
// binds ONLY to the frozen `list_plans` projection (Doc-4I §HB-1.4: plan_id/name/billing_cycle/price/currency/
// status); `is_active` (marketing-visibility) is a `get_plan`/detail field, surfaced on the editor (P-ADM-23),
// not on this list (RV-0063). No fabricated total (GI-03). Reuses the shell PageHeader + shared AdminQueueTable.
import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  PLANS,
  PLAN_STATUS_META,
  formatPlanPrice,
  type PlanVM,
} from "../../_components/admin/plans/plans-seed";

export const metadata: Metadata = { title: "Plans · Admin" };

const BASE = "/admin/plans";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "retired", label: "Retired" },
] as const;

const COLUMNS: AdminQueueColumn<PlanVM>[] = [
  {
    key: "plan",
    header: "Plan",
    cell: (p) => <span className="font-medium text-foreground">{p.name}</span>,
  },
  {
    key: "cycle",
    header: "Billing",
    className: "whitespace-nowrap capitalize text-muted-foreground",
    cell: (p) => p.billingCycle,
  },
  {
    key: "price",
    header: "Price",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (p) => formatPlanPrice(p),
  },
  // NOTE: `is_active` (marketing-visibility) is NOT in the `list_plans` projection (Doc-4I §HB-1.4 output =
  // {plan_id,name,billing_cycle,price,currency,status}); it is a `get_plan`/detail field, surfaced on the
  // editor (P-ADM-23). Not rendered here (RV-0063).
  {
    key: "status",
    header: "Status",
    cell: (p) => {
      const m = PLAN_STATUS_META[p.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
];

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows = active === "all" ? PLANS : PLANS.filter((p) => p.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        description="Commercial subscription plans. A plan is a commercial package — not a capability or financial tier; entitlements are granted by value, never by plan name."
        actions={
          // Disabled — `create_plan` is actioned from the editor (P-ADM-23), owned by M7/Billing (R5).
          <Button size="sm" disabled>
            New plan
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => {
          const isActive = f.key === active;
          const href = f.key === "all" ? BASE : `${BASE}?status=${f.key}`;
          return (
            <Button key={f.key} asChild size="sm" variant={isActive ? "secondary" : "ghost"}>
              <Link href={href} aria-current={isActive ? "page" : undefined}>
                {f.label}
              </Link>
            </Button>
          );
        })}
      </div>

      {rows.length > 0 ? (
        <>
          <AdminQueueTable
            columns={COLUMNS}
            rows={rows}
            rowKey={(p) => p.id}
            caption="Commercial subscription plans"
            minWidthClassName="min-w-[52rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} plan${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<CreditCard aria-hidden="true" />}
          title="No plans in this view"
          description="There are no plans with this status right now."
        />
      )}
    </div>
  );
}
