import { Hero } from "./_components/landing/hero";

// Public landing route (`/`) — P-PUB-01, the anonymous Public surface (Doc-7D · landing_page_spec.md),
// mounted in the Doc-7C `(public)` shell (layout.tsx adds the header + footer chrome).
//
// SCOPE (parallel-implementation authorization): PRESENTATION & COMPOSITION ONLY — anonymous,
// read-only, binds NO Doc-5 contract and fabricates no data; all backend wiring is left for later
// (its original wave sequence). Milestone 1 delivers SEC-HERO + the Command Center centerpiece (§2/§3).
//
// Remaining landing sections (all presentation-only, each governed by landing_page_spec.md) follow in
// later Public milestones — composed into this page as the shared kit components they need are added:
//   M2 — SEC-CATEGORY · SEC-INDUSTRY · SEC-SUPPLIERS · SEC-PRODUCTS
//        (+ vendor-card · category-tile · product-card · capability-matrix kit components)
//   M3 — SEC-STATS · SEC-PROCESS · SEC-TRUST · SEC-SUCCESS · SEC-PARTNERS · SEC-RESOURCES · SEC-CTA
//        (+ stat-card · score-ring)
export default function HomePage() {
  return <Hero />;
}
