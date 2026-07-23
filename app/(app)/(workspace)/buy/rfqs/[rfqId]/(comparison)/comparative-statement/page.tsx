// Comparative Statement route — the CANONICAL PRINT SURFACE (redesigned document; fresh `.cd-` visual
// system). A Next.js SERVER COMPONENT in the URL-preserving `(comparison)` route group; the dynamic
// segment is the OPAQUE RFQ id (Inv #5). The CS is a generated procurement document derived from the
// buyer's Workspace selection — NOT an independent business entity until ESC-CS-DOCKIND.
//
// PRESENTATION-ONLY: projects the SAME M3 read the workspace binds (`get_comparison_statement`,
// Doc-4E §E8.6) through the adapter seam; `?sel=` carries the ephemeral W-1 selection (server-
// normalized). Unknown/undisclosed id → `null` → byte-identical not-found (Inv #11 / GI-12). The shared
// `(comparison)` provider persists private edits from the workspace; the same gating initializer runs so
// a cold deep-link here initializes too. Screen chrome is `.cd-print-hidden`; print isolates the document.
//
// GOVERNANCE: "Draft Reference" only — no `CS-` series until ESC-CS-REF; evaluative sections are
// buyer-authored (R6, † provenance); Excel export is a gated stub (ESC-CS-EXPORT); printing is the
// browser's own print-to-PDF; line-item data is indicative until ESC-CS-LINEITEMS.

import { rfqWorkflowData } from "../../../../../../_components/rfq-workflow";
import { Breadcrumbs, PageHeader } from "../../../../../../_components/shell";
import {
  buildWorkspaceData,
  defaultSelection,
  normalizeSelection,
  parseSelParam,
  toInitializeInput,
  ComparisonWorkspaceInitializer,
  ComparisonNotFound,
  ComparisonAwaiting,
} from "../../../../_components/comparison-workspace";
import { ComparisonDocument, DocumentToolbar } from "../../../../_components/comparison-document";
import "../../../../_components/comparison-document/comparison-document.css";

export const metadata = {
  title: "Comparative Statement",
};

export default async function BuyerComparativeStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ sel?: string | string[] }>;
}) {
  const { rfqId } = await params;
  const { sel } = await searchParams;

  const comparison = await rfqWorkflowData.buyer.getComparison(rfqId);
  if (!comparison) return <ComparisonNotFound />;
  if (comparison.suppliers.length === 0) {
    return <ComparisonAwaiting humanRef={comparison.humanRef} rfqId={rfqId} />;
  }

  const disclosedIds = comparison.suppliers.map((s) => s.quotationId);
  const selectedIds = normalizeSelection(
    parseSelParam(sel),
    disclosedIds,
    defaultSelection(disclosedIds),
  );
  const statement = await rfqWorkflowData.buyer.getComparativeStatement(rfqId, selectedIds);
  if (!statement) return <ComparisonNotFound />;

  const data = buildWorkspaceData(rfqId, comparison, statement, selectedIds);
  const selQuery = data.selectedIds.map((id) => `sel=${encodeURIComponent(id)}`).join("&");
  const backHref = `/buy/rfqs/${rfqId}/compare${selQuery ? `?${selQuery}` : ""}`;

  return (
    <>
      {/* Screen-only chrome — hidden in print so only the document sheets emit. */}
      <div className="cd-print-hidden">
        <Breadcrumbs
          items={[
            { label: "RFQs", href: "/buy/rfqs" },
            { label: data.humanRef ?? "RFQ", href: `/buy/rfqs/${rfqId}` },
            { label: "Comparative Statement" },
          ]}
          className="mb-4"
        />
        <PageHeader
          title="Comparative Statement"
          description="Official procurement document (Draft) — fixed A4 landscape. Print to save as PDF."
          meta={
            <span className="text-xs text-muted-foreground">
              Draft Reference · official series pending governance · evaluative content is
              buyer-authored
            </span>
          }
          actions={<DocumentToolbar backHref={backHref} />}
        />
      </div>
      <ComparisonWorkspaceInitializer input={toInitializeInput(data)}>
        <ComparisonDocument data={data} />
      </ComparisonWorkspaceInitializer>
    </>
  );
}
