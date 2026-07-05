// S3 RFQ Detail (companion §6.3 → (app)/rfqs/[rfqId]). Two panes: SPECS & REQUIREMENTS + granted
// documents (left), YOUR INVITATION respond + start-quotation (right); below, the M6 Clarifications
// thread (S8, delivery-only) and "Your quotation" status/version-history/outcome (S5/S9). Read =
// rfq.get_rfq.v1 (grant-scoped, [ESC-7G-Q-01] CLOSED). Presentation-only; sections render genuine-empty
// until the reads are wired. `rfqId` is a URL param (display/link only) — no data is fetched here.
// Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../_components/shell";
import {
  ClarificationsSection,
  InvitationResponse,
  QuotationStatusCard,
  RfqSnapshot,
  RFQ_SNAPSHOT_SEED,
  INVITATION_SEED,
  QUOTA_SEED,
} from "../../../_components/vendor/rfq";

export const metadata: Metadata = { title: "RFQ detail" };

export default async function RfqDetailPage({ params }: { params: Promise<{ rfqId: string }> }) {
  const { rfqId } = await params;

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

      <div className="grid gap-6 lg:grid-cols-2">
        <RfqSnapshot rfq={RFQ_SNAPSHOT_SEED} />
        <InvitationResponse rfqId={rfqId} invitation={INVITATION_SEED} quota={QUOTA_SEED} />
      </div>

      <ClarificationsSection />

      <QuotationStatusCard rfqId={rfqId} />
    </div>
  );
}
