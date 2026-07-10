// P-ADM-04 RFQ moderation (Doc-7H · Management · `moderate_rfq`). PRESENTATION ONLY: a platform-scope worklist
// of newly-submitted RFQs awaiting review before they enter matching. URL-driven status filter (server-rendered,
// deep-linkable). Per-row Pass / Reject are RENDERED BUT DISABLED — the wired `moderate_rfq` command is owned by
// the engine (R5: Admin decides; the owning module owns the effect — PASS → matching, REJECT → buyer draft). No
// governance signal (firewall); no fabricated totals (GI-03) — the seed stands in for the unwired read. Reuses
// the shared shell PageHeader + the shared AdminQueueTable + kit (StatusChip / PaginationControl / EmptyState);
// no new primitive, no duplication, no backend, no invented contract.
import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  RFQ_MODERATION_CASES,
  RFQ_MODERATION_STATUS_META,
  type RfqModerationVM,
} from "../../_components/admin/rfq-moderation/rfq-moderation-seed";

export const metadata: Metadata = { title: "RFQ moderation · Admin" };

const BASE = "/admin/rfq-moderation";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "passed", label: "Passed" },
  { key: "rejected", label: "Rejected" },
] as const;

const COLUMNS: AdminQueueColumn<RfqModerationVM>[] = [
  {
    key: "ref",
    header: "RFQ",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (r) => r.ref,
  },
  { key: "buyer", header: "Buyer", cell: (r) => r.buyerOrg },
  {
    key: "category",
    header: "Category",
    className: "text-muted-foreground",
    cell: (r) => r.category,
  },
  { key: "summary", header: "Summary", className: "text-muted-foreground", cell: (r) => r.summary },
  {
    key: "submitted",
    header: "Submitted",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (r) => r.submitted,
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => {
      const m = RFQ_MODERATION_STATUS_META[r.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (r) =>
      r.status === "pending" ? (
        // Disabled — `moderate_rfq` is owned by the engine (R5). Pass → matching, Reject → draft.
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled>
            Pass
          </Button>
          <Button size="sm" variant="outline" disabled>
            Reject
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];

export default async function RfqModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows =
    active === "all"
      ? RFQ_MODERATION_CASES
      : RFQ_MODERATION_CASES.filter((r) => r.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQ moderation"
        description="New RFQs awaiting review before matching. Pass sends an RFQ to matching; reject returns it to the buyer as a draft — the engine applies the effect."
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
            rowKey={(r) => r.id}
            caption="RFQs awaiting moderation"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} RFQ${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Inbox aria-hidden="true" />}
          title="No RFQs in this view"
          description="There are no RFQs with this status right now."
        />
      )}
    </div>
  );
}
