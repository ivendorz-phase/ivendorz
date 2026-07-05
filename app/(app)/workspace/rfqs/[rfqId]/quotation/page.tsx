// S4 Quote Authoring (companion §13.1 → (app)/rfqs/[rfqId]/quotation). The staged quotation builder,
// bound to a fixed rfq_version_id snapshot resolved server-side from the grant (read = rfq.get_rfq.v1).
// Compose vs revise mode is resolved server-side (Invariant 5), never a client flag. Presentation-only:
// every section renders genuine-empty, all actions are disabled, draft persistence is client-local-only
// pending [ESC-7G-Q-DRAFT]. `rfqId` is a URL param (display/link only) — no data is fetched here. Uses
// the platform shell PageHeader + Breadcrumbs.
import type { Metadata } from "next";
import { Breadcrumbs, PageHeader } from "../../../../_components/shell";
import {
  QuotationBuilder,
  RFQ_SNAPSHOT_SEED,
  QUOTA_SEED,
  PRICE_BREAKDOWN_SEED,
} from "../../../../_components/vendor/rfq";

export const metadata: Metadata = { title: "Author quotation" };

export default async function QuotationBuilderPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;

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
      <QuotationBuilder
        rfqId={rfqId}
        rfqHumanRef={RFQ_SNAPSHOT_SEED.human_ref}
        versionLockedLabel={RFQ_SNAPSHOT_SEED.version_locked_label}
        windowState={RFQ_SNAPSHOT_SEED.window_state}
        windowDeadlineLabel={RFQ_SNAPSHOT_SEED.window_deadline_label}
        windowUrgency={RFQ_SNAPSHOT_SEED.window_urgency}
        quota={QUOTA_SEED}
        lines={PRICE_BREAKDOWN_SEED}
        currency={RFQ_SNAPSHOT_SEED.currency}
      />
    </div>
  );
}
