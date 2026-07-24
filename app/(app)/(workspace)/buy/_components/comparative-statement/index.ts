// Comparative Statement (CS) — view-models only. The former mock-era document renderer
// (`cs-document.tsx` and its sections/stylesheet) was superseded by the fresh `comparison-document/`
// print surface and removed; these presentation view-models are retained (the RFQ workflow adapter and
// the new document render against them).
export type {
  ComparativeStatementData,
  CsApprovalBlock,
  CsBuyerEvaluation,
  CsComputed,
  CsLetterhead,
  CsLineCell,
  CsLineItem,
  CsVendor,
} from "./cs-view-models";
