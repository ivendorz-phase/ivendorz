// S4 Quote Authoring (companion §13.1 → (app)/rfqs/[rfqId]/quotation). The staged quotation builder,
// bound to a fixed rfq_version_id snapshot resolved server-side from the grant (read = rfq.get_rfq.v1).
// Compose vs revise mode is resolved server-side (Invariant 5), never a client flag.
//
// PRESENTATION-ONLY: the builder's working-draft content now arrives through the RFQ WORKFLOW ADAPTER
// SEAM (`_components/rfq-workflow/adapters`) — own data only (draft lines, terms, the version-locked
// snapshot label, the numeric quota); an unknown id renders the workspace not-found (grant-scoped
// collapse, no existence leak). All actions remain disabled; draft persistence stays client-local-only
// pending [ESC-7G-Q-DRAFT]. At wiring the seam swaps to the GI-02 server data layer and this page does
// not change. Uses the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import { rfqWorkflowData } from "../../../../_components/rfq-workflow";
import { QuotationBuilder } from "../../../../_components/vendor/rfq";

export const metadata: Metadata = { title: "Author quotation" };

export default async function QuotationBuilderPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  const [draft, quota] = await Promise.all([
    rfqWorkflowData.vendor.getQuotationDraft(rfqId),
    rfqWorkflowData.vendor.getQuota(),
  ]);
  if (!draft) notFound();

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "RFQs & Quotations", href: "/workspace/rfqs" },
          { label: "RFQ detail", href: `/workspace/rfqs/${rfqId}` },
          { label: "Quotation" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Author quotation"
        description="Presentation only — saving and submitting connect in the integration phase."
        meta={<span className="font-mono text-xs text-muted-foreground">{rfqId}</span>}
      />
      <QuotationBuilder {...draft} quota={quota} />
    </div>
  );
}
