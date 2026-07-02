// P-ADM-28 Link triage (Doc-7H · Management · `confirm/dismiss_link_suggestion` · J-ADM-07). PRESENTATION ONLY:
// the BC-ADM-3 link-candidate queue. NON-DISCLOSURE CRITICAL (Doc-4J:132/186, §7.5; Invariant #11): a link
// candidate connects a PUBLIC vendor profile to a BUYER'S PRIVATE CRM record — the content is NEVER shown to a
// vendor or a buyer; this surface is PLATFORM-STAFF-ONLY (an unauthorized read collapses to NOT_FOUND). The
// private side is rendered ONLY as an OPAQUE reference — the buyer identity and any private notes are never
// exposed. URL-driven status filter over the frozen machine (Doc-4J H.5 suggested → confirmed / dismissed).
// Confirm / Dismiss (`confirm/dismiss_link_suggestion`, `[ESC-ADM-SLUG]`) are owned by BC-ADM-3 Admin (R5) —
// rendered DISABLED. FIREWALL: no governance score. No fabricated total (GI-03). Reuses PageHeader + shared
// AdminQueueTable + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { Link2, ShieldAlert } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  LINK_SUGGESTIONS,
  LINK_STATUS_META,
  MATCH_BASIS_LABEL,
  linkActions,
  type LinkSuggestionVM,
} from "../../_components/admin/links/link-suggestions-seed";

export const metadata: Metadata = { title: "Link triage · Admin" };

const BASE = "/admin/links";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "suggested", label: "Suggested" },
  { key: "confirmed", label: "Confirmed" },
  { key: "dismissed", label: "Dismissed" },
] as const;

const COLUMNS: AdminQueueColumn<LinkSuggestionVM>[] = [
  {
    key: "vendor",
    header: "Vendor profile",
    cell: (s) => <span className="font-medium text-foreground">{s.vendorProfileName}</span>,
  },
  {
    key: "record",
    header: "Private record",
    className: "whitespace-nowrap font-mono text-xs text-muted-foreground",
    cell: (s) => s.privateRecordRef,
  },
  {
    key: "basis",
    header: "Match basis",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (s) => MATCH_BASIS_LABEL[s.matchBasis],
  },
  {
    key: "confidence",
    header: "Confidence",
    className: "whitespace-nowrap",
    cell: (s) => <span className="font-medium text-foreground">{s.confidence}</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (s) => {
      const m = LINK_STATUS_META[s.status];
      return <StatusChip label={m.label} tone={m.tone} />;
    },
  },
  {
    key: "actions",
    header: "Actions",
    srHeader: true,
    className: "text-right",
    cell: (s) => {
      const actions = linkActions(s);
      if (actions.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        // Disabled — `confirm/dismiss_link_suggestion` is owned by BC-ADM-3 Admin (R5). Confirm writes via Operations.
        <div className="flex justify-end gap-2">
          {actions.map((label) => (
            <Button key={label} size="sm" variant="outline" disabled>
              {label}
            </Button>
          ))}
        </div>
      );
    },
  },
];

export default async function LinkTriagePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? (status as string) : "all";
  const rows =
    active === "all" ? LINK_SUGGESTIONS : LINK_SUGGESTIONS.filter((s) => s.status === active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Link triage"
        description="Candidate links between a public vendor profile and a private CRM record. Admin confirms or dismisses each; the owning module applies the effect."
      />

      <Card className="border-dashed p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
          />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">Platform-staff only — non-disclosure</p>
            <p className="text-muted-foreground">
              Link candidates reference a buyer’s private CRM record and are never shown to any
              vendor or buyer. The private record appears only as an opaque reference; its owner and
              notes are never exposed.
            </p>
          </div>
        </div>
      </Card>

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
            rowKey={(s) => s.id}
            caption="Vendor-profile to private-record link candidates"
            minWidthClassName="min-w-[60rem]"
          />
          <PaginationControl
            hasMore={false}
            hasPrevious={false}
            label={`Showing ${rows.length} candidate${rows.length === 1 ? "" : "s"}`}
          />
        </>
      ) : (
        <EmptyState
          icon={<Link2 aria-hidden="true" />}
          title="No link candidates in this view"
          description="There are no link candidates with this status right now."
        />
      )}
    </div>
  );
}
