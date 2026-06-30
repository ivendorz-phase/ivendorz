// Vendor Leads & Pipeline presentation components (Team 3, Milestone 6 — PL-1/PL-2; companion §13.2).
//
// Presentation-only, reusable, route-group-agnostic; composes the FROZEN Doc-7B kit + the platform
// shell + reuses vendor atoms (PresentationFormNote — promotion candidate). Typed props bind ONLY real
// frozen fields/states (Doc-2 §10.5, Doc-4F PassB Part3, Doc-5F BC-OPS-3) — zero contract invention.
// The vendor's PRIVATE CRM of RECEIVED RFQ invitations: received-only (no self-create), byte-equivalent
// (no counts/tally, no lead-stage win-rate), won/lost firewalled from the RFQ award + governance signals.
export { LeadPipeline, type LeadPipelineProps } from "./lead-pipeline";
export { LeadList, type LeadListProps } from "./lead-list";
export { LeadBoard, type LeadBoardProps } from "./lead-board";
export { LeadStageChip } from "./lead-stage-chip";
export { NextActionPill, type NextActionPillProps } from "./next-action-pill";
export { LeadRfqContext, type LeadRfqContextProps } from "./lead-rfq-context";
export { LeadPipelinePanel, type LeadPipelinePanelProps } from "./lead-pipeline-panel";
export { LeadActivityLog, type LeadActivityLogProps } from "./lead-activity-log";
export { LeadPrivateNotes } from "./lead-private-notes";

export type {
  LeadStage,
  LeadActivityType,
  NextActionUrgency,
  LeadView,
  LeadActivityView,
  LeadDetailView,
} from "./types";
