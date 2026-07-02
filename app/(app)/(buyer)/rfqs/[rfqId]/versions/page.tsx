// P-BUY-11 Buyer "RFQ version history" route (Doc-7F · `T-DETAILS`; IA sub-route of the RFQ detail). A
// Next.js SERVER COMPONENT in the `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE
// §8): no business logic. The dynamic segment is the OPAQUE RFQ id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): the `rfq.get_rfq_version` read (§E4.8, `can_view_rfq` /
// `can_view_all_rfqs`) is NOT wired (PARKED — Wave 4). A non-visible RFQ collapses to NOT_FOUND server-side
// (§7.5) → `data={null}` (byte-identical not-found). The browser never calls a Doc-5 contract and never
// sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3). The seed below is a presentation fixture only.
//
// Version selection is native GET nav (`?v=`) — no client state; `rfq_versions` is read-only (Inv #8).

import { RfqVersionsView } from "./rfq-versions-view";
import type { RfqVersionHistoryData } from "../../../_components/rfq-version-view-models";

export const metadata = {
  title: "RFQ version history",
};

// Presentation fixture — a 3-revision RFQ (v1 → v2 raises budget & pulls in the date → v3 changes delivery
// site). Replaced by the mapped `get_rfq_version` projection at wiring; shape matches the frozen §E4.8 set.
// `id` is threaded from the route segment at render time so breadcrumb/timeline links round-trip the real
// opaque id (Inv #5); the fixture below only supplies the version content.
const SEED: Omit<RfqVersionHistoryData, "id"> = {
  humanRef: "RFQ-2026-000123",
  state: "buyer_reviewing",
  currentVersionNo: 3,
  versions: [
    {
      versionNo: 1,
      content: {
        title: "Boiler feed-water pumps — supply & install",
        summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
        category: "Pumps & Compressors",
        value: { amount: 2400000, currency: "BDT" },
        deliveryLocation: "Narayanganj plant",
        neededBy: "2026-09-30",
      },
    },
    {
      versionNo: 2,
      content: {
        title: "Boiler feed-water pumps — supply & install",
        summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
        category: "Pumps & Compressors",
        value: { amount: 2750000, currency: "BDT" },
        deliveryLocation: "Narayanganj plant",
        neededBy: "2026-08-31",
      },
    },
    {
      versionNo: 3,
      content: {
        title: "Boiler feed-water pumps — supply & install",
        summary: "Two centrifugal feed-water pumps for the Unit-2 boiler house.",
        category: "Pumps & Compressors",
        value: { amount: 2750000, currency: "BDT" },
        deliveryLocation: "Gazipur plant",
        neededBy: "2026-08-31",
      },
    },
  ],
};

export default async function BuyerRfqVersionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { rfqId } = await params;
  const sp = await searchParams;
  // Accept only a positive integer within the disclosed set; anything else falls back to the current
  // revision inside the view. Never trust the raw query.
  const parsed = Number.parseInt(sp.v ?? "", 10);
  const selectedVersionNo = Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;

  // Thread the opaque route id into the fixture so outbound links stay coherent (matches close-lost).
  const data: RfqVersionHistoryData = { id: rfqId, ...SEED };

  return <RfqVersionsView data={data} selectedVersionNo={selectedVersionNo} />;
}
