// P-BUY-15 Buyer Supplier Comparison route (Doc-7F · `T-ANALYTICS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (UUID) — never a human ref (Inv #5).
//
// PRESENTATION-ONLY: binds the M3 read `rfq.get_comparison_statement.v1` (Doc-4E §E8.6), which is NOT wired
// today (the GI-02 server data layer is PARKED until the M3 backend lands — Wave 4). The SEED below is a
// presentation fixture (FE-BUY-05) so the built `ComparisonSummary`/`ComparisonTable` — previously always
// suppressed by an empty `suppliers: []` — actually render for review; it is replaced by the mapped
// `get_comparison_statement` projection at wiring. The two suppliers mirror the same "RFQ-2026-000123"
// fixture quotations already seeded on the RFQ detail (BX-02) and its quotation detail (FE-BUY-04), for a
// coherent fixture across RFQ → Quotations → Comparison. Passing `data={null}` still renders the not-found
// ≡ genuine-absence state (byte-identical — Inv #11 / GI-12); `suppliers: []` still renders the honest
// "awaiting responses" empty (an RFQ with 0 quotations, Doc-3 §9.1 — never fabricated).
//
// WIRING SEAM (later milestone): resolve SERVER-SIDE via `get_comparison_statement(params.rfqId)`, gated by
// `can_view_rfq`; render the System-ordered matrix WITHOUT re-ranking (R6/GI-04); the browser never calls a
// Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { ComparisonView } from "../../../_components/comparison";
import type { ComparisonData } from "../../../_components/comparison/comparison-view-models";

export const metadata = {
  title: "Comparison",
};

// Presentation fixture — stands in for the mapped `get_comparison_statement` projection; shape matches
// `ComparisonData`. `rfqId` is threaded from the route segment (opaque, Inv #5). Supplier ORDER is the
// fixture's stand-in for the System-supplied order — never re-sorted by the presentation (R6/GI-04).
const SEED: Omit<ComparisonData, "rfqId"> = {
  humanRef: "RFQ-2026-000123",
  versionNo: 2,
  generatedAt: "2026-06-30T14:45:00+06:00",
  suppliers: [
    {
      quotationId: "q-1",
      vendorName: "Meghna Industrial Supplies Ltd.",
      state: "submitted",
      amount: { amount: 2695000, currency: "BDT" },
      delivery: "6 weeks from PO",
      warranty: "18 months from commissioning",
      validUntil: "2026-07-15T00:00:00+06:00",
      compliance: "ISO 5199 compliant",
      attachmentsCount: 3,
    },
    {
      quotationId: "q-2",
      vendorName: "Padma Engineering Works",
      state: "submitted",
      amount: { amount: 2810000, currency: "BDT" },
      delivery: "4 weeks from PO",
      warranty: "12 months from commissioning",
      validUntil: "2026-07-10T00:00:00+06:00",
      compliance: "ISO 5199 compliant",
      attachmentsCount: 2,
    },
  ],
};

export default async function BuyerComparisonPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  const data: ComparisonData = { rfqId, ...SEED };
  return <ComparisonView data={data} />;
}
