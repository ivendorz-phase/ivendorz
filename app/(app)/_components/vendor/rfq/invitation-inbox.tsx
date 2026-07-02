// S2 Invitation Inbox (companion §6.2/§6.7) — read = `rfq.list_invitations` (vendor leg). RECEIVED-ONLY:
// the inbox renders ONLY invitations delivered to this vendor; there is NO browse/discovery of
// un-invited RFQs (DP1/BE-1) — exclusion never reaches the client, so it cannot leak.
//
// BYTE-EQUIVALENCE (Invariant 11 / GR11 / CHK-7-040, load-bearing): the empty state is ONE canonical
// copy derived from the list type alone — byte-identical for a never-matched vendor and a blacklisted
// one. No counts/totals are shown (cursor lists only, §7.5); no "of N", no rank, no competitor count,
// no "why not invited" (ND-2/ND-4). Accept/Decline live on the detail (S3) via `respond_to_invitation`;
// here they are read rows that link to the detail. Presentation-only; RSC-friendly.
//
// FE-VEN-05 delta (information hierarchy / response-window presentation): rows needing a response
// (`invitation_state === "delivered"`) sort ahead of already-responded ones, and within that group the
// most time-sensitive window (`window_urgency`) sorts first — fulfilling the promise already made by
// `QuotationHomeSummary` ("appear at the top of your inbox"). Pure client-side reordering of the given
// rows — no new field, no count, no fabricated total (GI-03); the group labels carry no numbers.
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { RfqStateChip, InvitationStateChip } from "./state-chips";
import { WindowStateChip } from "./window-state-chip";
import type { InboxItemView, WindowUrgency } from "./types";

export interface InvitationInboxProps {
  items?: InboxItemView[];
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

const URGENCY_RANK: Record<WindowUrgency, number> = { imminent: 0, soon: 1, normal: 2 };
const UNRANKED_URGENCY = 3;

function needsResponse(item: InboxItemView): boolean {
  return item.invitation_state === "delivered";
}

/** Stable sort: needs-response first, then most time-sensitive window first within that group. */
function byInformationHierarchy(items: InboxItemView[]): InboxItemView[] {
  return [...items].sort((a, b) => {
    const aNeeds = needsResponse(a) ? 0 : 1;
    const bNeeds = needsResponse(b) ? 0 : 1;
    if (aNeeds !== bNeeds) return aNeeds - bNeeds;
    if (aNeeds !== 0) return 0;
    const aRank = a.window_urgency ? URGENCY_RANK[a.window_urgency] : UNRANKED_URGENCY;
    const bRank = b.window_urgency ? URGENCY_RANK[b.window_urgency] : UNRANKED_URGENCY;
    return aRank - bRank;
  });
}

function InvitationRow({ item, basePath }: { item: InboxItemView; basePath: string }) {
  return (
    <li>
      <Link
        href={`${basePath}/rfqs/${item.rfq_id}`}
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
        </div>
      </Link>
    </li>
  );
}

export function InvitationInbox({ items, basePath = "/workspace" }: InvitationInboxProps) {
  if (!items || items.length === 0) {
    // The single canonical empty copy (fixed per list type — [ESC-7B-EMPTY-LOCK]). It asserts NOTHING
    // about this vendor's matching outcome; it is identical for excluded ≡ never-matched ≡ zero.
    return (
      <EmptyState
        title="No invitations yet"
        description="Invitations appear here when a buyer invites you to an RFQ. You don't browse or request RFQs — they come to you."
      />
    );
  }

  const sorted = byInformationHierarchy(items);
  const needsResponseItems = sorted.filter(needsResponse);
  const otherItems = sorted.filter((item) => !needsResponse(item));
  // Only split into labeled groups when the split is meaningful (a mix of both) — a single-group
  // inbox (all new, or all already-responded) stays a plain list, no label noise.
  const showGroups = needsResponseItems.length > 0 && otherItems.length > 0;

  return (
    <div className="space-y-4">
      {showGroups ? (
        <>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Needs your response
            </p>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {needsResponseItems.map((item) => (
                    <InvitationRow key={item.rfq_id} item={item} basePath={basePath} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Other invitations
            </p>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {otherItems.map((item) => (
                    <InvitationRow key={item.rfq_id} item={item} basePath={basePath} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {sorted.map((item) => (
                <InvitationRow key={item.rfq_id} item={item} basePath={basePath} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
