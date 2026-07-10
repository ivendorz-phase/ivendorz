// Doc-7B kit — Comparison composition barrel (the single import point). Promoted from the buyer-scoped
// `P-BUY-15` realization (Shared Platform Component Registry §4.2 CTO override — 2026-07-03).
export { ComparisonTable } from "./comparison-table";
export { ComparisonSummary } from "./comparison-summary";
export { ComparisonEmpty } from "./comparison-empty";
export { buildComparisonColumns } from "./comparison-column";
export { COMPARISON_ATTRIBUTES, type ComparisonAttribute } from "./comparison-row";
export type { ComparisonData, ComparisonSupplier } from "./comparison-view-models";
