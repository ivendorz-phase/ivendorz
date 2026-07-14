// S1 Quotation Home + S2 Invitation Inbox (companion §6.2 → (app)/rfqs). RECEIVED-ONLY: the inbox
// renders only invitations delivered to this vendor (read = rfq.list_invitations vendor leg); there is
// no browse/discovery of un-invited RFQs (DP1/BE-1).
//
// PRESENTATION-ONLY: data now arrives through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`) — the mock adapter serves the vendor fixture universe (own
// invitations / own quotations across their frozen states; ND-1..ND-8 safe by construction). The
// journey-bucket summary is adapter-supplied (own facts only — never client-computed, R7). At wiring
// the seam swaps to the GI-02 server data layer and this page does not change. Uses the platform
// shell PageHeader.
//
// URL PARAMS (allowlisted, the documents-hub convention — anything else ⇒ All):
//  • `?state=` — own-quotation-state filter (draft | submitted; frozen Doc-4M tokens). The vendor
//    sidebar's "Make Offer" / "Saved Offers" entries deep-link here; the URL is the single source
//    of truth (the chips are plain Links — no client filter state). Filters the vendor's OWN
//    quotation state only (ND-2/ND-3 safe). The filtered-empty copy below is derived from the
//    FILTER alone (never from a matching outcome), so the inbox's canonical unfiltered empty state
//    stays byte-identical ([ESC-7B-EMPTY-LOCK]).
import type { Metadata } from "next";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader } from "../../../_components/shell";
import { rfqWorkflowData, RfqPipelineSummary } from "../../../_components/rfq-workflow";
import {
  InboxStateFilter,
  InvitationInbox,
  QuotationHomeSummary,
  parseInboxStateFilter,
  INBOX_STATE_FILTER_LABELS,
} from "../../../_components/vendor/rfq";

export const metadata: Metadata = { title: "RFQs & Quotations" };

export default async function RfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const activeState = parseInboxStateFilter((await searchParams).state);
  const [items, quota, buckets] = await Promise.all([
    rfqWorkflowData.vendor.listInbox(),
    rfqWorkflowData.vendor.getQuota(),
    rfqWorkflowData.vendor.getPipelineSummary(),
  ]);
  const visible = activeState
    ? items.filter((item) => item.quotation_state === activeState)
    : items;
  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQs & Quotations"
        description="Invitations buyers have sent you, and the quotations you author in response."
      />
      <QuotationHomeSummary quota={quota} />
      <RfqPipelineSummary buckets={buckets} />
      <InboxStateFilter active={activeState} />
      {activeState && visible.length === 0 ? (
        <EmptyState
          title={`No ${INBOX_STATE_FILTER_LABELS[activeState].toLowerCase()}`}
          description={
            activeState === "draft"
              ? "Offers you are still drafting appear here. Clear the filter to see every invitation."
              : "Offers you have submitted appear here. Clear the filter to see every invitation."
          }
        />
      ) : (
        <InvitationInbox items={visible} />
      )}
    </div>
  );
}
