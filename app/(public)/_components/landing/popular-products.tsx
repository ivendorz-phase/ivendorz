// SEC-PRODUCTS — Popular Products (landing_page_spec §6 · Doc-7D). PRESENTATION-ONLY Server Component
// bound (by VM) to `search_catalog`. Interim per [ESC-7-API-PRODDETAIL]: no standalone anonymous
// product page — a card opens the result in context (the supplier's public microsite).
//
// GOVERNANCE: "Popular" is curated/facet-backed, NEVER labelled "Recommended" (no computed signal —
// GI-04). Prices are the {amount, currency} pair the field carries, via the kit CurrencyDisplay
// (default BDT); items without a price render "On request" — never a fabricated number (GI-08).
import { LandingSection } from "./landing-section";
import { ProductCard, type ProductCardVM } from "../discovery";

// Curated static seed (representative catalog items — never presented as a computed recommendation).
const POPULAR_PRODUCTS: ProductCardVM[] = [
  {
    id: "p-gate-valve-dn100",
    name: "Cast Steel Gate Valve DN100 PN16",
    vendorName: "Padma Valve & Fittings Ltd.",
    vendorSlug: "padma-valve-fittings",
    category: "Valves & Fittings",
    spec: "DN100 · PN16 · CS body · flanged",
    price: { amount: 14500, currency: "BDT" },
  },
  {
    id: "p-ms-plate-10mm",
    name: "MS Plate 10mm (ASTM A36)",
    vendorName: "Bengal Steel Industries",
    vendorSlug: "bengal-steel-industries",
    category: "Steel & Metals",
    spec: "10mm · 1500×6000 · hot-rolled",
    // No catalog price — renders "On request" (never fabricated).
  },
  {
    id: "p-vfd-22kw",
    name: "VFD Drive 22kW 3-Phase",
    vendorName: "Jamuna Electrical & Drives",
    vendorSlug: "jamuna-electrical-drives",
    category: "Electrical & Drives",
    spec: "22kW · 380–415V · IP20",
    price: { amount: 78000, currency: "BDT" },
  },
  {
    id: "p-centrifugal-pump-15hp",
    name: "End-Suction Centrifugal Pump 15HP",
    vendorName: "Meghna Pumps & Motors",
    vendorSlug: "meghna-pumps-motors",
    category: "Pumps & Motors",
    spec: "15HP · cast-iron · 50m head",
    price: { amount: 96000, currency: "BDT" },
  },
  {
    id: "p-safety-helmet",
    name: "Industrial Safety Helmet (HDPE)",
    vendorName: "Padma Valve & Fittings Ltd.",
    vendorSlug: "padma-valve-fittings",
    category: "Safety & PPE",
    spec: "HDPE shell · ratchet · EN 397",
    price: { amount: 450, currency: "BDT" },
  },
  {
    id: "p-butterfly-valve-dn150",
    name: "Wafer Butterfly Valve DN150",
    vendorName: "Padma Valve & Fittings Ltd.",
    vendorSlug: "padma-valve-fittings",
    category: "Valves & Fittings",
    spec: "DN150 · EPDM seat · lever",
    price: { amount: 8200, currency: "BDT" },
  },
];

export function PopularProducts() {
  return (
    <LandingSection
      id="sec-products"
      title="Popular products"
      description="A representative slice of the industrial catalog — open any item to view the supplier."
      viewAllHref="/marketplace"
      viewAllLabel="Search the catalog"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {POPULAR_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </LandingSection>
  );
}
