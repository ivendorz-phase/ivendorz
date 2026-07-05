// RFQ WORKFLOW — Lifecycle document registry (FROZEN KINDS ONLY, by pointer).
//
// The documents/artifacts the procurement journey produces, keyed to their journey stage and OWNING
// module (One Module, One Owner — the workflow layer points, it never merges). Only artifacts the
// frozen corpus actually defines appear here.
//
// EXPLICITLY NOT MODELLED (no frozen backing — do NOT add without a Board-gated corpus patch, per
// the FE-DOC frozen-kinds-only constraint):
//   • "Award Notice" as a generated document — the award is the `award_rfq` command + the
//     `RFQClosedWon` event; loss feedback is a banded M6 notification (Doc-3 §9.5), not a document.
//   • "Technical / Commercial Evaluation record" — evaluation is buyer working practice over the
//     comparison statement; no evaluation-record aggregate exists.
//   • "RFQ Completion Report" — no such document kind exists in Doc-4F's frozen set.

import type { RfqJourneyStageKey } from "./journey";

export interface LifecycleDocumentEntry {
  /** Stable presentation key (display grouping only — never a contract enum). */
  key: string;
  label: string;
  /** Journey stage where the artifact chiefly appears. */
  stage: RfqJourneyStageKey;
  /** Owning module POINTER. */
  ownerModule: "M3 — RFQ" | "M4 — Operations" | "M6 — Communication";
  /** Frozen source pointer for the artifact's definition. */
  source: string;
  /** One-line description (display copy). */
  summary: string;
}

export const LIFECYCLE_DOCUMENTS: readonly LifecycleDocumentEntry[] = [
  {
    key: "rfq_document",
    label: "RFQ document (versioned)",
    stage: "authoring",
    ownerModule: "M3 — RFQ",
    source: "Doc-2 §10.4 (rfqs / rfq_versions); Doc-4E",
    summary:
      "The buyer's requirement, kept as immutable versions — every amendment is a new version, history preserved (Inv #8).",
  },
  {
    key: "rfq_invitation",
    label: "RFQ invitation",
    stage: "routing",
    ownerModule: "M3 — RFQ",
    source: "Doc-2 §3 (rfq_invitations); Doc-4E",
    summary:
      "The delivered invitation record per vendor (accepted / declined / expired tracked independently).",
  },
  {
    key: "clarification_thread",
    label: "Clarification thread (Q&A record)",
    stage: "routing",
    ownerModule: "M6 — Communication",
    source: "Doc-5H (conversation thread); Doc-4H",
    summary:
      "Buyer↔vendor Q&A on the RFQ — an M6-owned thread (delivery-only), one thread per invited vendor.",
  },
  {
    key: "quotation",
    label: "Quotation (versioned vendor offer)",
    stage: "quoting",
    ownerModule: "M3 — RFQ",
    source: "Doc-2 §5.5 (quotations / quotation_versions); Doc-4E",
    summary:
      "The vendor's offer as immutable versions — a revision (revise_quotation) supersedes, never edits.",
  },
  {
    key: "comparison_statement",
    label: "Comparison statement",
    stage: "evaluation",
    ownerModule: "M3 — RFQ",
    source: "Doc-4E §E8.6 (generate_comparison_statement — System worker)",
    summary:
      "System-generated multi-vendor comparison, read-only decision support — it never ranks-to-winner or recommends (R6).",
  },
  {
    key: "loi",
    label: "Letter of Intent (optional)",
    stage: "post_award",
    ownerModule: "M4 — Operations",
    source: "Doc-4F (engagement_document_kind = loi)",
    summary: "Optional post-award LOI on the engagement document chain.",
  },
  {
    key: "po",
    label: "Purchase Order",
    stage: "post_award",
    ownerModule: "M4 — Operations",
    source: "Doc-4F (engagement_document_kind = po)",
    summary: "The purchase order on the engagement document chain (immutable chain — Inv #8).",
  },
  {
    key: "challan",
    label: "Delivery challan",
    stage: "post_award",
    ownerModule: "M4 — Operations",
    source: "Doc-4F (engagement_document_kind = challan)",
    summary: "Delivery record on the engagement document chain.",
  },
  {
    key: "trade_invoice",
    label: "Trade invoice",
    stage: "post_award",
    ownerModule: "M4 — Operations",
    source:
      "Doc-4F §F5.5 (trade_invoices — a SEPARATE aggregate, never an engagement document kind)",
    summary:
      "Inter-party invoice record between buyer and vendor — the platform records it, it never settles it (DF-6).",
  },
  {
    key: "payment_record",
    label: "Payment record",
    stage: "post_award",
    ownerModule: "M4 — Operations",
    source: "Doc-4F §F5.6 (payment_records — recorded → confirmed; a SEPARATE aggregate)",
    summary:
      "Record-only confirmation of an off-platform payment — no escrow, no wallet, no settlement (DF-6).",
  },
  {
    key: "wcc",
    label: "Work Completion Certificate",
    stage: "post_award",
    ownerModule: "M4 — Operations",
    source: "Doc-4F (engagement_document_kind = wcc)",
    summary: "Completion certificate closing the engagement document chain, where applicable.",
  },
] as const;

/** Documents in play at a given journey stage (display grouping). */
export function documentsForStage(stage: RfqJourneyStageKey): readonly LifecycleDocumentEntry[] {
  return LIFECYCLE_DOCUMENTS.filter((d) => d.stage === stage);
}
