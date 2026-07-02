// P-BUY-02 Buyer Discover vendors route (Doc-7F · `T-LISTING`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY (this milestone): binds the M2 public reads `marketplace.list_vendor_directory.v1` /
// `marketplace.search_catalog.v1` (Doc-4D §B), NOT wired today (PARKED — Wave 4). A realistic mock stands
// in for the public projection {name, capability_flags, geography, categories, verified}. Only published/
// non-excluded rows appear; NO buyer-private (blacklist/CRM) fact exists here (Inv #11 / §7.5). Results are
// the catalog set in contract order — discovery ≠ matching (no ranking/scoring/recommend; DD-2).

import { DiscoverView } from "./discover-view";
import type { DiscoverData } from "../_components/discover-view-models";
import type { VendorCardVM } from "@/frontend/components/vendor-card";

export const metadata = {
  title: "Discover vendors",
};

// Realistic industrial-procurement MOCK — the public projection mapped to the shared VendorCard VM
// (capability = 4-flag matrix; trust = binary `verified` only, no score). In contract order (not re-ranked).
const MOCK_VENDORS: VendorCardVM[] = [
  {
    slug: "meghna-industrial-supplies",
    name: "Meghna Industrial Supplies Ltd.",
    category: "Structural steel & MS plate",
    location: "Gazipur, Dhaka",
    verified: true,
    capability: { can_supply: true, can_fabricate: true, can_service: false, can_consult: false },
  },
  {
    slug: "bengal-steel-fabrication",
    name: "Bengal Steel & Fabrication",
    category: "Fabrication & structures",
    location: "Chattogram",
    verified: true,
    capability: { can_supply: true, can_fabricate: true, can_service: true, can_consult: false },
  },
  {
    slug: "padma-engineering-works",
    name: "Padma Engineering Works",
    category: "Plant maintenance & services",
    location: "Narayanganj, Dhaka",
    verified: false,
    capability: { can_supply: false, can_service: true, can_fabricate: true, can_consult: true },
  },
  {
    slug: "delta-traders-import",
    name: "Delta Traders & Import",
    category: "Bearings & power transmission",
    location: "Motijheel, Dhaka",
    verified: true,
    capability: { can_supply: true, can_service: false, can_fabricate: false, can_consult: false },
  },
  {
    slug: "rupsha-controls",
    name: "Rupsha Controls & Automation",
    category: "Instrumentation & controls",
    location: "Khulna",
    verified: false,
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: true },
  },
  {
    slug: "titas-engineering-consultants",
    name: "Titas Engineering Consultants",
    category: "EPC advisory & inspection",
    location: "Uttara, Dhaka",
    verified: true,
    capability: { can_supply: false, can_service: false, can_fabricate: false, can_consult: true },
  },
];

export default async function BuyerDiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  // The query is echoed for presentation; the real search + filters bind server-side (PARKED).
  const data: DiscoverData = { items: MOCK_VENDORS, query: sp.q };
  return <DiscoverView data={data} />;
}
