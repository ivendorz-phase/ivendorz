// Vendor Workspace — Support Tickets (VX-03, owner directive 2026-07-17; matches the design's
// Communication "Support Tickets"). PRESENTATION-ONLY SHELL: support tickets are an M6 concept
// (W3-COMM-1 `support_tickets`); no vendor-facing read is wired yet, so this renders the filter +
// table STRUCTURE with a genuine-empty state — no fabricated tickets, agents, or timelines. "New
// ticket" is disabled until the M6 create command is wired. The row-detail drawer + create modal
// mount once rows exist. Server Component; URL-param status filter (the documents/finance pattern —
// anything unrecognized ⇒ All).
import Link from "next/link";
import { LifeBuoy, Plus } from "lucide-react";
import { PageHeader } from "../../shell";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";

const BASE = "/sell/support";

// Frozen `support_tickets` status machine (M6) — open → in_progress → resolved → closed.
export const SUPPORT_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];
const STATUS_LABEL: Record<SupportStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function SupportView({ activeStatus }: { activeStatus?: SupportStatus }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Requests you've raised with the iVendorz support team. Open a ticket and track it to resolution."
        actions={
          // Disabled until the M6 create-ticket command is wired (the create modal mounts then).
          <Button disabled>
            <Plus aria-hidden className="size-4" />
            New ticket
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
        <Button asChild size="sm" variant={!activeStatus ? "secondary" : "ghost"}>
          <Link href={BASE} aria-current={!activeStatus ? "page" : undefined}>
            All
          </Link>
        </Button>
        {SUPPORT_STATUSES.map((s) => (
          <Button key={s} asChild size="sm" variant={activeStatus === s ? "secondary" : "ghost"}>
            <Link
              href={`${BASE}?status=${s}`}
              aria-current={activeStatus === s ? "page" : undefined}
            >
              {STATUS_LABEL[s]}
            </Link>
          </Button>
        ))}
      </div>

      <Card className="p-2">
        <EmptyState
          icon={<LifeBuoy aria-hidden />}
          title={
            activeStatus
              ? `No ${STATUS_LABEL[activeStatus].toLowerCase()} tickets`
              : "No support tickets yet"
          }
          description="Tickets you raise with the support team appear here with their status, priority, and assigned agent."
          className="py-12"
        />
      </Card>
    </div>
  );
}
