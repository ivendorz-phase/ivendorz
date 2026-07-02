// P-BUY-14 Buyer Quotation detail route (Doc-7F §3.1/§4.2 · `T-DETAILS`). A Next.js SERVER COMPONENT in
// the `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
// The dynamic segments are the OPAQUE RFQ id + quotation id (UUIDs) — never human refs (Inv #5 / Doc-7F).
//
// PRESENTATION-ONLY: binds the M3 read `rfq.get_quotation.v1` (Doc-4E §E7.5), which is NOT wired today
// (the GI-02 server data layer is PARKED until the M3 backend lands — Wave 4). The SEED below is a
// presentation fixture (BX-03/FE-BUY-04) so the enriched quotation detail — pricing/terms/attachments +
// the headline commercial KPI band + version history — renders for review; it is replaced by the mapped
// `get_quotation` projection at wiring. Passing `data={null}` still renders the not-found ≡ genuine-absence
// state (byte-identical — Inv #11 / GI-12).
//
// WIRING SEAM (later milestone): resolve SERVER-SIDE via `get_quotation(params.quotationId)`, gated by the
// buyer's `quotation_visibility` grant; on a non-disclosed id collapse to this same not-found state (§7.5,
// no existence leak); apply the POLICY `abuse.sealed_until_close` redaction to the buyer projection
// server-side and pass `sealedUntilClose` for the UI to EXPLAIN. The browser never calls a Doc-5 contract
// and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { QuotationDetailView } from "./quotation-detail-view";
import type { QuotationDetailData } from "../../../../_components/quotation-view-models";

export const metadata = {
  title: "Quotation",
};

// Presentation fixture — stands in for the mapped `get_quotation` projection; shape matches
// `QuotationDetailData`. The vendor/amount/dates deliberately mirror the "Meghna Industrial Supplies
// Ltd." row seeded on the parent RFQ detail (BX-02, `rfqs/[rfqId]/page.tsx`) for a coherent fixture.
// `id`/`rfqId` are threaded from the route segments (opaque, Inv #5); `sealedUntilClose: false` so the
// full disclosed projection (pricing/terms/attachments) renders for review.
const SEED: Omit<QuotationDetailData, "id" | "rfqId"> = {
  humanRef: "QTN-2026-000456",
  vendorName: "Meghna Industrial Supplies Ltd.",
  state: "submitted",
  versionNo: 2,
  amount: { amount: 2695000, currency: "BDT" },
  validUntil: "2026-07-15T00:00:00+06:00",
  submittedAt: "2026-06-30T14:40:00+06:00",
  sealedUntilClose: false,
  pricing: {
    lines: [
      {
        id: "p-1",
        label: "Centrifugal feed-water pump, 45 kW",
        note: "2 × unit",
        amount: { amount: 2180000, currency: "BDT" },
      },
      {
        id: "p-2",
        label: "Installation & commissioning",
        note: "lot",
        amount: { amount: 385000, currency: "BDT" },
      },
      {
        id: "p-3",
        label: "Spare-parts starter kit",
        note: "1 × set",
        amount: { amount: 130000, currency: "BDT" },
      },
    ],
    total: { amount: 2695000, currency: "BDT" },
  },
  delivery: [
    { id: "d-1", label: "Lead time", value: "6 weeks from PO" },
    { id: "d-2", label: "Delivery site", value: "Gazipur plant, Unit-2 boiler house" },
    { id: "d-3", label: "Incoterm", value: "DAP (Delivered at Place)" },
  ],
  warranty: [
    { id: "w-1", label: "Coverage", value: "18 months from commissioning" },
    { id: "w-2", label: "Scope", value: "Parts and labour; excludes consumables" },
  ],
  compliance: [
    { id: "c-1", label: "Standard", value: "ISO 5199 compliant centrifugal pump" },
    { id: "c-2", label: "Material certification", value: "Mill test certificates included" },
  ],
  attachments: [
    { id: "a-1", name: "Technical datasheet.pdf", href: "#", sizeLabel: "1.2 MB" },
    { id: "a-2", name: "Compliance certificate.pdf", href: "#", sizeLabel: "480 KB" },
    { id: "a-3", name: "Pricing worksheet.xlsx", sizeLabel: "96 KB" },
  ],
  history: [
    { id: "h-1", label: "Version 1 submitted", at: "2026-06-27T11:20:00+06:00" },
    { id: "h-2", label: "Version 2 submitted (revised pricing)", at: "2026-06-30T14:40:00+06:00" },
  ],
};

export default async function BuyerQuotationDetailPage({
  params,
}: {
  params: Promise<{ rfqId: string; quotationId: string }>;
}) {
  const { rfqId, quotationId } = await params;
  const data: QuotationDetailData = { id: quotationId, rfqId, ...SEED };
  return <QuotationDetailView data={data} />;
}
