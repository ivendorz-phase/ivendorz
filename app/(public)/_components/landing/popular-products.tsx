// SEC-PRODUCTS — Popular Products (landing_page_spec §6 · Doc-7D). PRESENTATION-ONLY Server Component
// bound (by VM) to `search_catalog`. A card opens the real standalone product detail page
// (FE-PUB-05, `ESC-7-API-PRODDETAIL` resolved 2026-07-03, RV-0130).
//
// GOVERNANCE: "Popular" is curated/facet-backed, NEVER labelled "Recommended" (no computed signal —
// GI-04). Prices are the {amount, currency} pair the field carries, via the kit CurrencyDisplay
// (default BDT); items without a price render "On request" — never a fabricated number (GI-08).
import { LandingSection } from "@/frontend/components/landing-section";
import { ProductCard } from "@/frontend/components/product-card";
import { FEATURED_PRODUCTS } from "../discovery/seed";
import { productHref } from "../product-url";

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
        {FEATURED_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} href={productHref(product)} />
        ))}
      </div>
    </LandingSection>
  );
}
