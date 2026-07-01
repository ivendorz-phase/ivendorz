// P-ADM-05 Bans (Doc-7H · Listing · READ-ONLY · J-ADM-04 ban reads). PRESENTATION ONLY: a platform-scope
// register of platform bans (M8 enforcement — the `VendorBanned` stream). NOTE: platform bans are admin-visible
// by design; they are NOT the buyer-private blacklist (Invariant #11 governs the M4 CRM, not this register).
// URL-driven status filter (server-rendered, deep-linkable); rows open the ban detail (P-ADM-06) where
// issue/lift run under a wired command (R5) — this listing issues nothing. No governance signal; no fabricated
// total (GI-03). Reuses the shell PageHeader + the shared AdminQueueTable + kit; no new primitive, no
// duplication, no backend, no invented contract.
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import { BANS, BAN_STATUS_META, type BanVM } from "../../_components/admin/bans/bans-seed";

export const metadata: Metadata = { title: "Bans · Admin" };

const BASE = "/admin/bans";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "lifted", label: "Lifted" },
  { key: "expired", label: "Expired" },
] as const;

const COLUMNS: AdminQueueColumn<BanVM>[] = [
  {
    key: "ref",
    header: "Ban",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (b) => b.ref,
  },
  {
    key: "subject",
    header: "Subject",
    cell: (b) => (
      <>
        <div className="font-medium text-foreground">{b.subject}</div>
        <div className="text-xs text-muted-foreground">{b.subjectType}</div>
      </>
    ),
  },
  { key: "reason", header: "Reason", className: "text-muted-foreground", cell: (b) => b.reason },
  { key: "scope", header: "Scope", cell: (b) => b.scope },
  {
    key: "issuedBy",
    header: "Issued by",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (b) => b.issuedBy,
  },
  {
    key: "expiry",
    header: "Expiry",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (b) => b.expiry,
  },
  {
    key: "status",
    header: "Status",
    cell: (b) => {
      const m = BAN_STATUS_META[b.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (b) => (
      <Link
        href={`${BASE}/${b.id}`}
        className="rounded-sm text-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        View
        <span className="sr-only"> ban {b.ref}</span>
      </Link>
    ),
  },
];

export default async function BansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows = active === "all" ? BANS : BANS.filter((b) => b.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bans"
        description="Platform bans issued by admin enforcement. Read-only — open a record to review, issue, or lift a ban."
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
            rowKey={(b) => b.id}
            caption="Platform bans"
            minWidthClassName="min-w-[60rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} ban${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<ShieldOff aria-hidden="true" />}
          title="No bans in this view"
          description="There are no bans with this status right now."
        />
      )}
    </div>
  );
}
