// S1 Quotation Home + S2 Invitation Inbox (companion §6.2 → (app)/rfqs). RECEIVED-ONLY: the inbox
// renders only invitations delivered to this vendor (read = rfq.list_invitations vendor leg); there is
// no browse/discovery of un-invited RFQs (DP1/BE-1).
//
// LAYOUT: the "RFQ Workspace" reference — a page header, a row of vendor pipeline STAT CARDS, and a
// single framed workspace panel (filter toolbar → invitation list → quota footer). The chrome matches
// the reference's visual rhythm; every FIGURE is adapter-supplied (own facts only, never
// client-computed — R7), so production data replaces the fixtures through the same seam without a
// redesign (owner directive 2026-07-18: the vendor RFQ Workspace shows data from the read path). The
// mock adapter today returns a DEV/DEMO fixture set; when the wired read returns zero RFQs the stat
// cards show honest zeros and the list shows its byte-locked empty state (the branch below).
//
// PRESENTATION-ONLY: data arrives through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`). The journey-bucket counts + quota are adapter-supplied (own
// facts only — never client-computed, R7). At wiring the seam swaps to the GI-02 server data layer and
// this page does not change. Uses the platform shell PageHeader.
//
// URL PARAMS (allowlisted, the documents-hub convention — anything else ⇒ All):
//  • `?state=` — own-quotation-state filter (draft | submitted; frozen Doc-4M tokens). The vendor
//    sidebar's "Make Offer" / "Saved Offers" entries deep-link here; the URL is the single source
//    of truth (the chips are plain Links — no client filter state). Filters the vendor's OWN
//    quotation state only (ND-2/ND-3 safe). The filtered-empty copy below is derived from the
//    FILTER alone (never from a matching outcome), so the inbox's canonical unfiltered empty state
//    stays byte-identical ([ESC-7B-EMPTY-LOCK]).
import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/frontend/components/empty-state";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import { PageHeader } from "../../../_components/shell";
import { rfqWorkflowData } from "../../../_components/rfq-workflow";
import {
  InboxStateFilter,
  InvitationInbox,
  QuotaMeter,
  RfqInboxTable,
  RfqStatCards,
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
        title="RFQs"
        description="Invitations buyers have sent you, and the quotations you author in response."
        actions={
          // Design's "Match preferences" affordance — configures which categories route
          // invitations here. Presentation-only until the M2/M3 preference read is wired.
          <Button variant="outline" disabled>
            <SlidersHorizontal aria-hidden className="size-4" />
            Match preferences
          </Button>
        }
      />
      <RfqStatCards buckets={buckets} />
      <Card className="overflow-hidden">
        {/* Toolbar — the vendor's own-quotation-state filter (URL-driven; navigation, not state). */}
        <div className="border-b border-border px-4 py-3">
          <InboxStateFilter active={activeState} />
        </div>
        {/* Body — the received-only invitation list. Populated ⇒ the reference table; filtered-empty ⇒
            the filter-derived copy; unfiltered-empty ⇒ the byte-locked canonical empty ([ESC-7B-EMPTY-LOCK],
            owned by InvitationInbox so the one copy never drifts). */}
        {activeState && visible.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={`No ${INBOX_STATE_FILTER_LABELS[activeState].toLowerCase()}`}
              description={
                activeState === "draft"
                  ? "Offers you are still drafting appear here. Clear the filter to see every invitation."
                  : "Offers you have submitted appear here. Clear the filter to see every invitation."
              }
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-4">
            <InvitationInbox items={visible} unframed />
          </div>
        ) : (
          <RfqInboxTable items={visible} />
        )}
        {/* Footer — the numeric submission quota (Doc-5I entitlement; never a plan name — Inv #10). */}
        <div className="border-t border-border px-4 py-3">
          <QuotaMeter quota={quota} />
        </div>
      </Card>
    </div>
  );
}
