// P-ADM-07 Vendor approval queue (Doc-7H · Management · `set_vendor_profile_status` · J-ADM-03). PRESENTATION
// ONLY: a platform-scope worklist of vendor profiles awaiting approval. URL-driven status filter (server-
// rendered, deep-linkable). Per-row Approve / Reject are RENDERED BUT DISABLED — `set_vendor_profile_status` is
// owned by M2 (R5: Admin decides; the owning module owns the effect — approval publishes the profile per its
// visibility scope, Invariant #3). Approval is a PROFILE-STATUS decision, NOT a trust/performance score or
// financial tier (firewall — verification is separate, P-ADM-12/13, M5 owns the score). No fabricated total
// (GI-03). Reuses the shell PageHeader + shared AdminQueueTable + kit; no new primitive, no duplication.
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
  VENDOR_APPROVALS,
  VENDOR_APPROVAL_STATUS_META,
  type VendorApprovalVM,
} from "../../_components/admin/vendor-approval/vendor-approval-seed";

export const metadata: Metadata = { title: "Vendor approval · Admin" };

const BASE = "/admin/vendor-approval";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
] as const;

const COLUMNS: AdminQueueColumn<VendorApprovalVM>[] = [
  {
    key: "ref",
    header: "Ref",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (v) => v.ref,
  },
  {
    key: "vendor",
    header: "Vendor",
    cell: (v) => (
      <>
        <div className="font-medium text-foreground">{v.name}</div>
        <div className="text-xs text-muted-foreground">{v.location}</div>
      </>
    ),
  },
  {
    key: "category",
    header: "Category",
    className: "text-muted-foreground",
    cell: (v) => v.category,
  },
  {
    key: "claim",
    header: "Claim",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (v) => v.claim,
  },
  {
    key: "submitted",
    header: "Submitted",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (v) => v.submitted,
  },
  {
    key: "status",
    header: "Status",
    cell: (v) => {
      const m = VENDOR_APPROVAL_STATUS_META[v.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (v) =>
      v.status === "pending" ? (
        // Disabled — `set_vendor_profile_status` is owned by M2 (R5). Approve publishes the profile.
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled>
            Approve
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

export default async function VendorApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows =
    active === "all" ? VENDOR_APPROVALS : VENDOR_APPROVALS.filter((v) => v.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor approval"
        description="Vendor profiles awaiting approval. Approve publishes the profile per its visibility scope; reject returns it — the owning module applies the effect."
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
            rowKey={(v) => v.id}
            caption="Vendor profiles awaiting approval"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} vendor${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Inbox aria-hidden="true" />}
          title="No vendors in this view"
          description="There are no vendor profiles with this status right now."
        />
      )}
    </div>
  );
}
