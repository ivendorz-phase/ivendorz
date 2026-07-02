// P-BUY-08 Buyer RFQ detail route (Doc-7F §3.1/§4.2 · `T-DETAILS`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The
// dynamic segment is the OPAQUE RFQ id (UUID) — never a human ref (Inv #5 / Doc-7F §3.1).
//
// PRESENTATION-ONLY: binds the M3 read `get_rfq`, which is NOT wired today (the GI-02 server data layer is
// PARKED until the M3 backend lands — Wave 4). The SEED below is a presentation fixture so the enriched RFQ
// detail (Overview facts + Quotations + Activity tabs) renders for review; it is replaced by the mapped
// `get_rfq` projection at wiring. Passing `data={null}` still renders the not-found ≡ genuine-absence state
// (byte-identical — Inv #11 / GI-12).
//
// WIRING SEAM (later milestone): resolve the RFQ SERVER-SIDE via `get_rfq(params.rfqId)` (own-org RLS),
// stream behind `SK-DETAIL`, derive the GI-10 permitted-action set server-side, and on a non-disclosed id
// collapse to the not-found state (no existence leak). The browser never calls a Doc-5 contract and never
// sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3). Every field is a wired read, never client-computed.

import { RfqDetailView } from "./rfq-detail-view";
import type { RfqDetailData } from "../../_components/rfq-view-models";

export const metadata = {
  title: "RFQ",
};

// Presentation fixture — stands in for the mapped `get_rfq` projection; shape matches RfqDetailData. Content
// fields map by intent to frozen `get_rfq` content (work_nature/routing_mode/current_version_no are frozen
// Doc-2 §10.4 fields). `id` is threaded from the route segment (opaque, Inv #5).
const SEED: Omit<RfqDetailData, "id"> = {
  humanRef: "RFQ-2026-000123",
  title: "Boiler feed-water pumps — supply & install",
  state: "quotations_received",
  value: { amount: 2750000, currency: "BDT" },
  summary:
    "Two centrifugal feed-water pumps for the Unit-2 boiler house, including delivery, installation, and commissioning against the attached specification.",
  category: "Pumps & Compressors",
  workNature: ["supply", "service"],
  routingMode: "approved_conditional",
  currentVersionNo: 3,
  deliveryLocation: "Gazipur plant",
  neededBy: "2026-08-31",
  createdAt: "2026-06-20T10:00:00+06:00",
  updatedAt: "2026-06-30T14:40:00+06:00",
  permittedActions: [{ key: "cancel_rfq", label: "Cancel RFQ", emphasis: "danger" }],
  lifecycle: [
    { id: "l-1", label: "RFQ created", at: "2026-06-20T10:00:00+06:00" },
    { id: "l-2", label: "Submitted for routing", at: "2026-06-22T09:30:00+06:00" },
    { id: "l-3", label: "Vendors notified", at: "2026-06-24T11:15:00+06:00" },
    { id: "l-4", label: "Quotation received", at: "2026-06-30T14:40:00+06:00" },
  ],
  quotations: {
    items: [
      {
        id: "q-1",
        vendorName: "Meghna Industrial Supplies Ltd.",
        state: "submitted",
        amount: { amount: 2695000, currency: "BDT" },
        validUntil: "2026-07-15T00:00:00+06:00",
        submittedAt: "2026-06-30T14:40:00+06:00",
      },
      {
        id: "q-2",
        vendorName: "Padma Engineering Works",
        state: "submitted",
        amount: { amount: 2810000, currency: "BDT" },
        validUntil: "2026-07-10T00:00:00+06:00",
        submittedAt: "2026-06-29T16:05:00+06:00",
      },
    ],
    nextCursor: null,
  },
};

export default async function BuyerRfqDetailPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  const data: RfqDetailData = { id: rfqId, ...SEED };
  return <RfqDetailView data={data} />;
}
