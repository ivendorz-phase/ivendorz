// P-ADM-29 Support reads (Doc-7H · Details · `staff_can_support` scope · J-ADM). PRESENTATION ONLY: a READ-ONLY
// staff view of support tickets. `support_tickets` are owned by M6/Communication (A-04), tenant-owned WITH
// platform-staff access; this surface is a read scope (`staff_can_support`, Doc-5H) — NO decision action is
// invoked here (R5: any support mutation is owned by M6, so there are no action controls at all). URL-driven
// status filter (server-rendered, deep-linkable) over the frozen machine (Doc-2:362 open → in_progress →
// resolved → closed). Fields bind to frozen `support_tickets` (Doc-2:816: subject, priority, status,
// organization_id). FIREWALL: no governance score. No fabricated total (GI-03). Reuses the shell PageHeader +
// shared AdminQueueTable + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  SUPPORT_TICKETS,
  TICKET_STATUS_META,
  type SupportTicketVM,
} from "../../_components/admin/support/support-seed";

export const metadata: Metadata = { title: "Support · Admin" };

const BASE = "/admin/support";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
] as const;

const COLUMNS: AdminQueueColumn<SupportTicketVM>[] = [
  {
    key: "subject",
    header: "Subject",
    cell: (t) => (
      <>
        <div className="font-medium text-foreground">{t.subject}</div>
        <div className="font-mono text-2xs text-muted-foreground">{t.id}</div>
      </>
    ),
  },
  {
    key: "organization",
    header: "Organization",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (t) => t.organization,
  },
  {
    key: "priority",
    header: "Priority",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (t) => t.priority,
  },
  {
    key: "opened",
    header: "Opened",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (t) => t.opened,
  },
  {
    key: "status",
    header: "Status",
    cell: (t) => {
      const m = TICKET_STATUS_META[t.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
];

export default async function SupportReadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows =
    active === "all" ? SUPPORT_TICKETS : SUPPORT_TICKETS.filter((t) => t.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Read-only view of support tickets for platform staff. Tickets are owned by Communication; responding and resolving happen in the support workflow."
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
            rowKey={(t) => t.id}
            caption="Support tickets (staff read scope)"
            minWidthClassName="min-w-[56rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} ticket${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<LifeBuoy aria-hidden="true" />}
          title="No tickets in this view"
          description="There are no support tickets with this status right now."
        />
      )}
    </div>
  );
}
