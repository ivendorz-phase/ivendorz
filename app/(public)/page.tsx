import { Hero } from "./_components/landing/hero";
import { FeaturedCategories } from "./_components/landing/featured-categories";
import { SupplierShowcase } from "./_components/landing/supplier-showcase";
import { PopularProducts } from "./_components/landing/popular-products";

// Public landing route (`/`) — P-PUB-01, the anonymous Public surface (Doc-7D · landing_page_spec.md),
// mounted in the Doc-7C `(public)` shell (layout.tsx adds the header + footer chrome).
//
// SCOPE (parallel-implementation authorization): PRESENTATION & COMPOSITION ONLY — anonymous,
// read-only, binds NO Doc-5 contract and fabricates no data; all backend wiring is left for later
// (its original wave sequence).
//   M1 (delivered) — SEC-HERO + the Command Center centerpiece (§2/§3).
//   M2.1 (this slice) — SEC-CATEGORY · SEC-INDUSTRY (FeaturedCategories) · SEC-SUPPLIERS
//        (SupplierShowcase) · SEC-PRODUCTS (PopularProducts), composing the new discovery components
//        (vendor-card · product-card · category-tile) + the shared-kit capability-matrix. Section data
//        is a CURATED STATIC SEED per the registered interim ESCs (CATNAV / PRODDETAIL) — no fabrication.
//
// Remaining landing sections (all presentation-only, each governed by landing_page_spec.md) follow in
// a later Public milestone:
//   M3 — SEC-STATS · SEC-PROCESS · SEC-TRUST · SEC-SUCCESS · SEC-PARTNERS · SEC-RESOURCES · SEC-CTA
//        (+ stat-card · score-ring)
export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <SupplierShowcase />
      <PopularProducts />
    </>
  );
}
