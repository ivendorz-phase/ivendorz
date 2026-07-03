// Doc-7B kit — RfqCard. Promoted from the vendor-scoped `InvitationRow` realization (Shared Platform
// Component Registry §4.2 CTO override — 2026-07-03): the row rendering (state chips + link structure) is
// extracted into a pure presentational card; list composition (sort/group/`<ul>`/`<li>`) stays with the
// caller. PRESENTATION-ONLY; no fetch, no mutation, no client computation.
//
// BYTE-EQUIVALENCE (Invariant 11 / GR11): carries ONLY own/received data — never a competitor count, rank,
// score, match confidence, or "why-not-invited" signal (ND-1..ND-8).

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { RfqStateChip, InvitationStateChip, QuotationStateChip } from "./state-chips";
import { WindowStateChip } from "./window-state-chip";
import type { RfqCardVM } from "./types";

export interface RfqCardProps {
  item: RfqCardVM;
  /** Fully-resolved destination for this card's link (the caller owns route structure). */
  href: string;
}

export function RfqCard({ item, href }: RfqCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {item.rfq_human_ref ?? "RFQ"}
          </p>
          {item.unread_clarification ? (
            <span
              className="inline-flex items-center gap-1 text-xs text-iv-info-text"
              title="You have an unread clarification message"
            >
              <MessageSquare aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Unread clarification</span>
            </span>
          ) : null}
        </div>
        {item.rfq_summary ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{item.rfq_summary}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RfqStateChip state={item.rfq_state} />
        <WindowStateChip
          state={item.window_state}
          deadlineLabel={item.window_deadline_label}
          urgency={item.window_urgency}
        />
        <InvitationStateChip state={item.invitation_state} />
        <QuotationStateChip state={item.quotation_state} />
      </div>
    </Link>
  );
}
