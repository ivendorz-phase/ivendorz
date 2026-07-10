// RFQ WORKFLOW — the frontend workflow spine (single import point).
//
// journey.ts      — presentation journey model over the FROZEN state machines (coins nothing)
// transitions.ts  — frozen transition inventory projection (Doc-4M M5 + Doc-5E §4.2 patched edges)
// documents.ts    — lifecycle document registry (frozen kinds only)
// adapters/       — the data seam: mock today, the GI-02 server layer at wiring (Wave 4)
// journey-strip / pipeline-summary — orientation UI (navigation-not-state)
//
// See README.md in this folder for the lifecycle mapping + divergence flags.

export {
  RFQ_JOURNEY,
  VENDOR_JOURNEY,
  TERMINAL_RFQ_OUTCOMES,
  BUYER_PIPELINE_BUCKETS,
  journeyStageForRfqState,
  vendorJourneyStageFor,
  type RfqJourneyStage,
  type RfqJourneyStageKey,
  type VendorJourneyStage,
  type JourneyActor,
  type JourneyBucketCount,
} from "./journey";

export {
  RFQ_TRANSITIONS,
  INVITATION_TRANSITIONS,
  QUOTATION_TRANSITIONS,
  rfqTransitionsFrom,
  isTerminalRfqState,
  type FrozenTransition,
  type RfqWorkflowCommand,
  type TransitionAuthority,
} from "./transitions";

export { LIFECYCLE_DOCUMENTS, documentsForStage, type LifecycleDocumentEntry } from "./documents";

export {
  rfqWorkflowData,
  type RfqWorkflowData,
  type BuyerRfqWorkflowReads,
  type VendorRfqWorkflowReads,
} from "./adapters";

export { RfqJourneyStrip, VendorJourneyStrip } from "./journey-strip";
export { RfqPipelineSummary, type RfqPipelineSummaryProps } from "./pipeline-summary";
