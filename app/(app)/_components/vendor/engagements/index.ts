// Vendor Engagements presentation components (Team 3, Milestone 7 — E1–E5; companion §13.3).
//
// Presentation-only, reusable, route-group-agnostic; composes the FROZEN Doc-7B kit + the platform
// shell + reuses vendor atoms (DescriptionList, PresentationFormNote — promotion candidates). Typed
// props bind ONLY real frozen fields/states (Doc-2 §10.5, Doc-4F PassB Part2/Part4 BC-OPS-2/4, Doc-5F)
// — zero contract invention. Money boundary: records/confirms OFF-PLATFORM payments only; never holds/
// transfers/settles funds. Engagements are created out-of-wire on award (no create affordance);
// documents are immutable + versioned (Inv 8); per-kind enumeration is escalation-gated ([ESC-7G-ENG-03]).
export { EngagementList, type EngagementListProps } from "./engagement-list";
export { EngagementOverview, type EngagementOverviewProps } from "./engagement-overview";
export { EngagementDocuments, type EngagementDocumentsProps } from "./engagement-documents";
export {
  EngagementDocumentDetail,
  type EngagementDocumentDetailProps,
} from "./engagement-document-detail";
export { EngagementStatusChip } from "./engagement-status-chip";
export { TradeInvoiceStatusChip, PaymentStatusChip, DOC_KIND_LABEL } from "./document-status-chip";
export { MoneyBoundaryBanner } from "./money-boundary-banner";
export { ReconciliationSummary, type ReconciliationSummaryProps } from "./reconciliation-summary";

export type {
  EngagementStatus,
  EngagementDocumentKind,
  TradeInvoiceStatus,
  PaymentRecordStatus,
  GeneratedArtifactView,
  EngagementListItemView,
  EngagementView,
  EngagementDocumentView,
  TradeInvoiceView,
  PaymentRecordView,
  ReconciliationView,
} from "./types";
