// S1 Quotation Home + S2 Invitation Inbox (companion §6.2 → (app)/rfqs). RECEIVED-ONLY: the inbox
// renders only invitations delivered to this vendor (read = rfq.list_invitations vendor leg); there is
// no browse/discovery of un-invited RFQs (DP1/BE-1). Presentation-only; renders genuine-empty (one
// canonical, byte-equivalent copy) until the reads are wired. Uses the platform shell PageHeader.
import type { Metadata } from "next";
import { PageHeader } from "../../_components/shell";
import { InvitationInbox, QuotationHomeSummary } from "../../_components/vendor/rfq";

export const metadata: Metadata = { title: "RFQs & Quotations" };

export default function RfqsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="RFQs & Quotations"
        description="Invitations buyers have sent you, and the quotations you author in response."
      />
      <QuotationHomeSummary />
      <InvitationInbox />
    </div>
  );
}
