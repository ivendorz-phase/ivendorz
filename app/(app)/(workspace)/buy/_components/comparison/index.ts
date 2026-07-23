// P-BUY-15 Buyer Supplier Comparison — barrel. `ComparisonTable`/`ComparisonSummary`/`ComparisonEmpty`/
// `ComparisonData`/`ComparisonSupplier` were PROMOTED to the Doc-7B kit (Shared Platform Component
// Registry §4.2 CTO override — 2026-07-03); this barrel re-exports them. The former buyer-scoped page
// host (`comparison-view.tsx`) was superseded by the fresh `comparison-workspace/` architecture and
// removed.
export {
  ComparisonTable,
  ComparisonSummary,
  ComparisonEmpty,
  type ComparisonData,
  type ComparisonSupplier,
} from "@/frontend/components/comparison";
