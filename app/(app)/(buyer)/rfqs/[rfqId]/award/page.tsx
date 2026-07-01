// P-BUY-17 Buyer Award route (Doc-7F · `T-WIZARD`). A Next.js SERVER COMPONENT in the `(app)/(buyer)` group
// (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic. The dynamic segment is the
// OPAQUE RFQ id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): the audit-backed `rfq.award_rfq.v1` (Doc-4E §E8.4, `can_award_rfq`)
// write + the shortlist read are NOT wired (PARKED — Wave 4). The page seeds an empty shortlist, so a buyer
// at their own RFQ sees the "shortlist first" state; a non-visible RFQ collapses to NOT_FOUND server-side
// (§7.5) → `data={null}` (byte-identical not-found in AwardView). The browser never calls a Doc-5 contract
// and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { AwardView } from "../../../_components/award";

export const metadata = {
  title: "Award",
};

export default async function BuyerAwardPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { rfqId } = await params;
  const sp = await searchParams;
  const step = sp.step === "confirm" ? 1 : 0;
  return <AwardView data={{ rfqId, candidates: [], step }} />;
}
