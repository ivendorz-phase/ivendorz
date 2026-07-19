// S2 Invitation Inbox — LIST-VIEW table (the "RFQ Workspace" reference). RECEIVED-ONLY: rows exist
// only because an invitation was delivered to this vendor (DP1/BE-1) — there is no browse/discovery.
//
// A denser presentation of the SAME received-only rows the kit `RfqCard` renders as cards: this
// surface (the vendor RFQ home) shows the reference's columnar table (RFQ No. · Title · Buyer ·
// Category · Status · Deadline · Est. Value). It reuses the FROZEN kit chips + CurrencyDisplay; it
// composes, it coins nothing. BYTE-EQUIVALENCE / ND-1..ND-8 (load-bearing): every cell is an
// own/received fact — never a competitor count, rank, score, or "why-not-invited" signal; there is no
// "of N" total (cursor lists only — GR11 denominator law). Rows sort needs-response-first, then by the
// most time-sensitive window (the promise QuotaMeter/stat-cards make), a pure client reordering of the
// given rows (no new field, no fabricated total). Presentation-only; RSC-friendly (no hooks).
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { RfqStateChip, InvitationStateChip, QuotationStateChip } from "./state-chips";
import type { InboxItemView, WindowUrgency } from "./types";

export interface RfqInboxTableProps {
  items: InboxItemView[];
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

const URGENCY_RANK: Record<WindowUrgency, number> = { imminent: 0, soon: 1, normal: 2 };
const UNRANKED_URGENCY = 3;

const URGENCY_CLASS: Record<WindowUrgency, string> = {
  imminent: "font-medium text-iv-danger-muted dark:text-iv-danger-text",
  soon: "font-medium text-iv-warning-muted dark:text-iv-warning-text",
  normal: "text-foreground",
};

function needsResponse(item: InboxItemView): boolean {
  return item.invitation_state === "delivered";
}

/** Stable sort: needs-response first, then most time-sensitive window first within that group. */
function sortRows(items: InboxItemView[]): InboxItemView[] {
  return [...items].sort((a, b) => {
    const aNeeds = needsResponse(a) ? 0 : 1;
    const bNeeds = needsResponse(b) ? 0 : 1;
    if (aNeeds !== bNeeds) return aNeeds - bNeeds;
    const aRank = a.window_urgency ? URGENCY_RANK[a.window_urgency] : UNRANKED_URGENCY;
    const bRank = b.window_urgency ? URGENCY_RANK[b.window_urgency] : UNRANKED_URGENCY;
    return aRank - bRank;
  });
}

/** One status chip per row (the reference's single "Status" column): the vendor's OWN quotation state
 *  when it exists, else its invitation state, else the received RFQ state — all own/received facts. */
function StatusCell({ item }: { item: InboxItemView }) {
  if (item.quotation_state) return <QuotationStateChip state={item.quotation_state} />;
  if (item.invitation_state) return <InvitationStateChip state={item.invitation_state} />;
  return <RfqStateChip state={item.rfq_state} />;
}

const TH =
  "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground";
const TD = "px-3 py-3 align-middle";

export function RfqInboxTable({ items, basePath = "/sell" }: RfqInboxTableProps) {
  const rows = sortRows(items);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className={TH}>
              RFQ No.
            </th>
            <th scope="col" className={TH}>
              Title
            </th>
            <th scope="col" className={TH}>
              Buyer
            </th>
            <th scope="col" className={cn(TH, "hidden lg:table-cell")}>
              Category
            </th>
            <th scope="col" className={TH}>
              Status
            </th>
            <th scope="col" className={cn(TH, "hidden md:table-cell")}>
              Deadline
            </th>
            <th scope="col" className={cn(TH, "text-right")}>
              Est. Value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr
              key={item.rfq_id}
              className="relative border-b border-border transition-colors last:border-0 hover:bg-accent"
            >
              <td className={TD}>
                {/* Stretched link: the whole row navigates to the received-only detail (grant-scoped). */}
                <Link
                  href={`${basePath}/rfqs/${item.rfq_id}`}
                  className="font-mono text-xs font-semibold text-primary after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {item.rfq_human_ref ?? "RFQ"}
                </Link>
              </td>
              <td className={cn(TD, "max-w-[20rem]")}>
                <div className="flex items-center gap-1.5">
                  <span className="line-clamp-1 font-medium text-foreground">
                    {item.rfq_summary ?? "—"}
                  </span>
                  {item.unread_clarification ? (
                    <MessageSquare
                      aria-label="Unread clarification"
                      className="size-3.5 shrink-0 text-iv-info-muted dark:text-iv-info-text"
                    />
                  ) : null}
                </div>
              </td>
              <td className={cn(TD, "whitespace-nowrap")}>
                <span className="text-foreground">{item.buyer_org_name ?? "—"}</span>
              </td>
              <td className={cn(TD, "hidden text-muted-foreground lg:table-cell")}>
                {item.category_label ?? "—"}
              </td>
              <td className={TD}>
                <StatusCell item={item} />
              </td>
              <td className={cn(TD, "hidden whitespace-nowrap md:table-cell")}>
                {item.window_deadline_label ? (
                  <span
                    className={
                      item.window_urgency ? URGENCY_CLASS[item.window_urgency] : "text-foreground"
                    }
                  >
                    {item.window_deadline_label}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className={cn(TD, "text-right")}>
                {typeof item.estimated_value === "number" ? (
                  <CurrencyDisplay
                    amount={item.estimated_value}
                    currency={item.currency}
                    className="font-medium text-foreground"
                  />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
