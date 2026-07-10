// Doc-7B kit — Comparison Table PRESENTATION VIEW-MODEL. Promoted from the buyer-scoped `P-BUY-15`
// realization (Shared Platform Component Registry §4.2 CTO override — 2026-07-03). NOT the frozen DTO and
// coins nothing — the server layer maps the wired `rfq.get_comparison_statement.v1` (Doc-4E §E8.6) read
// onto this shape when backend wiring lands (Wave 4; PARKED today).
//
// GOVERNANCE (load-bearing — this is the comparison MOAT, the most R6-sensitive buyer screen):
//  • R6 / Inv #12 — the comparison is PURELY DESCRIPTIVE. It NEVER ranks to a winner and carries NO
//    recommended/best/lowest-bidder/winner cue. `suppliers` render in the SYSTEM-supplied order and the UI
//    NEVER re-ranks/re-sorts the matrix (GI-04).
//  • Inv #11 / GI-12 — VISIBILITY-GATED: an empty comparison reads as "awaiting responses", never implying
//    a vendor was excluded.
//  • Doc-3 §10.1 — SEALED-UNTIL-CLOSE: a sealed supplier's price/commercial cells are omitted server-side;
//    the cell explains the seal (never implies the vendor under-quoted).
//  • Inv #8 — the comparison is a versioned immutable statement (`version_no`, `generated_at`).
//
// SCOPE: presentation only — no fetch, no mutation, no business logic, no client computation (Inv #9 / R7).

import type { QuotationState } from "@/frontend/components/quotation-state-display";
import type { MoneyValue } from "@/frontend/components/format";

/**
 * One column of the comparison = one DISCLOSED quotation (a "supplier"), as the System ordered it. The
 * fields are the Board's allowed DESCRIPTIVE set, each pre-resolved by the surface from the matrix
 * projection. There is deliberately NO score/band/rank/winner field. Routes (if any) use the opaque id.
 */
export interface ComparisonSupplier {
  /** Opaque quotation id (the detail identity; never a human ref). */
  quotationId: string;
  /** Vendor display name as the disclosed projection carries it. */
  vendorName: string;
  /** Frozen Doc-4M quotation state (rendered non-penalizingly via `quotationStateDisplay`). */
  state: QuotationState;
  /** Quoted price disclosed to the buyer (Doc-3 §9.1). Withheld when `sealed`. */
  amount?: MoneyValue;
  /** Delivery summary (display-ready string the surface derived from `delivery_terms`). */
  delivery?: string;
  /** Warranty summary (display-ready; `warranty_terms` is nullable in the contract). */
  warranty?: string;
  /** Validity window end (ISO-8601), formatted at the render site. */
  validUntil?: string;
  /** Specification-compliance summary (display-ready, from `spec_compliance_declaration`; Doc-3 §8.1). */
  compliance?: string;
  /** Count of attachments on this quotation (`attachments_refs`) — descriptive, never the blobs. */
  attachmentsCount?: number;
  /**
   * SEALED-UNTIL-CLOSE hint (Doc-3 §10.1 / §12.2 `abuse.sealed_until_close`, server POLICY). When set, the
   * server omitted this supplier's price + protected commercial terms; the cell explains the redaction.
   */
  sealed?: boolean;
}

/**
 * The comparison view-model. `null` drives the not-found ≡ genuine-absence state (the
 * `get_comparison_statement` read collapses an out-of-visibility RFQ to NOT_FOUND server-side — byte-
 * identical 404, no copy/layout/timing tell). A non-null statement with `suppliers: []` drives the
 * visibility-gated "awaiting responses" empty. The matrix auto-generates at the first quotation and
 * re-versions on every quotation event (Doc-3 §9.1) — `versionNo`/`generatedAt` are the immutable stamps.
 */
export interface ComparisonData {
  /** Opaque RFQ id (the back/breadcrumb route; never a leaf ref when not-visible). */
  rfqId: string;
  /** Parent RFQ year-scoped human ref ("RFQ-2026-000123") — DISPLAY ONLY (the breadcrumb label); routes
   *  carry the opaque `rfqId`. Optional; the breadcrumb falls back to a generic "RFQ" when absent. */
  humanRef?: string;
  /** `comparison_statements.version_no` (Inv #8 — immutable, append). */
  versionNo?: number;
  /** `comparison_statements.generated_at` (ISO-8601), formatted at the render site. */
  generatedAt?: string;
  /** The compared quotations, in the SYSTEM-supplied order — NEVER re-ranked/re-sorted by the UI (R6/GI-04). */
  suppliers: ComparisonSupplier[];
}
