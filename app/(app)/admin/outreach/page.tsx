// P-ADM-16 Outreach campaigns (Doc-7H · Listing · `list_outreach_campaigns` · J-ADM-05). PRESENTATION ONLY: a
// list of vendor-outreach campaigns. URL-driven status filter (server-rendered, deep-linkable) over the frozen
// `outreach_campaigns` machine (Doc-4J `draft → running → completed`). Read surface — creating and running a
// campaign are `create/run/complete_outreach_campaign`, actioned from the DETAIL (P-ADM-17), owned by BC-ADM-6
// (R5); the header "New campaign" affordance is RENDERED BUT DISABLED. MOAT (Doc-4J §BC-ADM-6): outreach is
// informational acquisition only — no matching / routing / ranking / supplier-selection / award / eligibility;
// no score (firewall). Fields = frozen list view only (`id`, `state`, `created_at`); no name field → opaque id,
// no coined ref. No fabricated contact/total counts (GI-03). Reuses the shell PageHeader + shared AdminQueueTable.
import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  OUTREACH_CAMPAIGNS,
  OUTREACH_STATUS_META,
  type OutreachCampaignVM,
} from "../../_components/admin/outreach/outreach-seed";

export const metadata: Metadata = { title: "Outreach · Admin" };

const BASE = "/admin/outreach";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "running", label: "Running" },
  { key: "completed", label: "Completed" },
] as const;

const COLUMNS: AdminQueueColumn<OutreachCampaignVM>[] = [
  {
    key: "campaign",
    header: "Campaign",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (c) => c.id,
  },
  {
    key: "created",
    header: "Created",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (c) => c.created,
  },
  {
    key: "status",
    header: "Status",
    cell: (c) => {
      const m = OUTREACH_STATUS_META[c.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
];

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows =
    active === "all" ? OUTREACH_CAMPAIGNS : OUTREACH_CAMPAIGNS.filter((c) => c.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outreach"
        description="Vendor-acquisition campaigns. Outreach is informational only — it never affects matching, routing, ranking, or supplier selection."
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={`${BASE}/contacts`}>Contacts</Link>
            </Button>
            {/* Disabled — `create_outreach_campaign` is actioned from the detail (P-ADM-17), owned by BC-ADM-6 (R5). */}
            <Button size="sm" disabled>
              New campaign
            </Button>
          </>
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
            rowKey={(c) => c.id}
            caption="Vendor-outreach campaigns"
            minWidthClassName="min-w-[40rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} campaign${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Send aria-hidden="true" />}
          title="No campaigns in this view"
          description="There are no outreach campaigns with this status right now."
        />
      )}
    </div>
  );
}
