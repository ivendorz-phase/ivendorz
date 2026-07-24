// P-BUY-15 Buyer Supplier Comparison route — the fresh Comparison Workspace (Doc-7F · `T-ANALYTICS`).
// A Next.js SERVER COMPONENT in the URL-preserving `(comparison)` route group (composition only): the
// dynamic segment is the OPAQUE RFQ id (Inv #5). PRESENTATION-ONLY — binds the M3 reads through the RFQ
// workflow adapter seam (`get_comparison_statement`, Doc-4E §E8.6): `getComparison` (full disclosed set)
// + `getComparativeStatement` (the server-normalized 2–5 subset; arithmetic is adapter-computed — R7).
// An unknown/undisclosed id → `null` → the byte-identical not-found (Inv #11 / GI-12); an empty disclosed
// set → "awaiting responses" (never implies exclusion). `?sel=` carries the ephemeral W-1 selection.
//
// WIRING SEAM (Wave 4): swap the adapter export for the GI-02 server layer — this page does not change.

import { rfqWorkflowData } from "../../../../../../_components/rfq-workflow";
import {
  buildWorkspaceData,
  defaultSelection,
  normalizeSelection,
  parseSelParam,
  ComparisonWorkspaceView,
  ComparisonNotFound,
  ComparisonAwaiting,
} from "../../../../_components/comparison-workspace";
import "../../../../_components/comparison-document/comparison-document.css";

export const metadata = {
  title: "Comparison",
};

export default async function BuyerComparisonPage({
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
  return <ComparisonWorkspaceView data={data} />;
}
