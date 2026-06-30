// P-BUY-15 Buyer Supplier Comparison route (Doc-7F · `T-ANALYTICS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (UUID) — never a human ref (Inv #5).
//
// PRESENTATION-ONLY (this milestone): binds the M3 read `rfq.get_comparison_statement.v1` (Doc-4E §E8.6),
// which is NOT wired today (the GI-02 server data layer is PARKED until the M3 backend lands — Wave 4). The
// comparison auto-generates at the first quotation (Doc-3 §9.1), so for a buyer at their own RFQ the parked
// state is the visibility-gated "awaiting responses" empty (not a 404); a wired NON-VISIBLE RFQ collapses to
// NOT_FOUND server-side (§7.5) → `data={null}` (the byte-identical not-found in ComparisonView).
//
// WIRING SEAM (later milestone): resolve SERVER-SIDE via `get_comparison_statement(params.rfqId)`, gated by
// `can_view_rfq`; render the System-ordered matrix WITHOUT re-ranking (R6/GI-04); the browser never calls a
// Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { ComparisonView } from "../../../_components/comparison";

export const metadata = {
  title: "Comparison",
};

export default async function BuyerComparisonPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  return <ComparisonView data={{ rfqId, suppliers: [] }} />;
}
