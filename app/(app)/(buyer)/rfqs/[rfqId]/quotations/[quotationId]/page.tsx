// P-BUY-14 Buyer Quotation detail route (Doc-7F §3.1/§4.2 · `T-DETAILS`). A Next.js SERVER COMPONENT in
// the `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
// The dynamic segments are the OPAQUE RFQ id + quotation id (UUIDs) — never human refs (Inv #5 / Doc-7F).
//
// PRESENTATION-ONLY (this milestone): binds the M3 read `rfq.get_quotation.v1` (Doc-4E §E7.5), which is
// NOT wired today (the GI-02 server data layer is PARKED until the M3 backend lands — Wave 4). So the page
// renders the not-found ≡ genuine-absence state (`data={null}`, byte-identical — Inv #11 / GI-12); no
// quotation data is fabricated.
//
// WIRING SEAM (later milestone): resolve SERVER-SIDE via `get_quotation(params.quotationId)`, gated by the
// buyer's `quotation_visibility` grant; on a non-disclosed id collapse to this same not-found state (§7.5,
// no existence leak); apply the POLICY `abuse.sealed_until_close` redaction to the buyer projection
// server-side and pass `sealedUntilClose` for the UI to EXPLAIN. The browser never calls a Doc-5 contract
// and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { QuotationDetailView } from "./quotation-detail-view";

export const metadata = {
  title: "Quotation",
};

export default function BuyerQuotationDetailPage() {
  return <QuotationDetailView data={null} />;
}
