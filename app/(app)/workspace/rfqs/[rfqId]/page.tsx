// S3 RFQ Detail (companion §6.3 → (app)/rfqs/[rfqId]). Two panes: SPECS & REQUIREMENTS + granted
// documents (left), YOUR INVITATION respond + start-quotation (right); below, the M6 Clarifications
// thread (S8, delivery-only) and "Your quotation" status/version-history/outcome (S5/S9). Read =
// rfq.get_rfq.v1 (grant-scoped, [ESC-7G-Q-01] CLOSED).
//
// PRESENTATION-ONLY: data now arrives through the RFQ WORKFLOW ADAPTER SEAM
// (`_components/rfq-workflow/adapters`) — the mock adapter resolves the OPAQUE id against the vendor
// fixture universe; an unknown id renders the workspace not-found (the wired grant-scoped read
// collapses an un-granted id the same way — no existence leak). Own/received data only (ND-1..ND-8).
// The journey strip is ORIENTATION only (navigation-not-state) — own invitation/quotation facts,
// never a competitor signal. Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageHeader } from "../../../_components/shell";
import { rfqWorkflowData, VendorJourneyStrip } from "../../../_components/rfq-workflow";
import {
  ClarificationsSection,
  InvitationResponse,
  QuotationStatusCard,
  RfqSnapshot,
} from "../../../_components/vendor/rfq";

export const metadata: Metadata = { title: "RFQ detail" };

export default async function RfqDetailPage({ params }: { params: Promise<{ rfqId: string }> }) {
  const { rfqId } = await params;
  const [snapshot, invitation, quotation, quota, engagement] = await Promise.all([
    rfqWorkflowData.vendor.getRfqSnapshot(rfqId),
    rfqWorkflowData.vendor.getInvitation(rfqId),
    rfqWorkflowData.vendor.getOwnQuotation(rfqId),
    rfqWorkflowData.vendor.getQuota(),
    rfqWorkflowData.vendor.getEngagementHandoff(rfqId),
  ]);
  if (!snapshot) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "RFQs & Quotations", href: "/workspace/rfqs" }, { label: "RFQ detail" }]}
        className="mb-4"
      />
      <PageHeader
        title="RFQ detail"
        description="Review the requirements, respond to your invitation and author your quotation."
        meta={<span className="font-mono text-xs text-muted-foreground">{rfqId}</span>}
      />

      <VendorJourneyStrip invitationState={invitation?.state} quotationState={quotation?.state} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RfqSnapshot rfq={snapshot} />
        <InvitationResponse
          rfqId={rfqId}
          invitation={invitation ?? undefined}
          quota={quota}
          hasQuotation={Boolean(quotation)}
        />
      </div>

      <ClarificationsSection />

      <QuotationStatusCard
        rfqId={rfqId}
        quotation={quotation ?? undefined}
        engagement={engagement ?? undefined}
      />
    </div>
  );
}
