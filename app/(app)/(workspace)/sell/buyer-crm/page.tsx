// Vendor Workspace — Buyer CRM route (VX-03). Thin composition-only page. The governance disclosure
// (a vendor-side Buyer CRM is not yet a frozen concept) lives in the view component.
import type { Metadata } from "next";
import { BuyerCrmView } from "../../../_components/vendor/buyer-crm/buyer-crm-view";

export const metadata: Metadata = { title: "Buyer CRM" };

export default function BuyerCrmPage() {
  return <BuyerCrmView />;
}
