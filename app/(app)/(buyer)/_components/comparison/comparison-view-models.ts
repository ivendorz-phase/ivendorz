// P-BUY-15 Buyer Supplier Comparison — PRESENTATION VIEW-MODEL.
//
// The presentation shape the server layer (Doc-7C SR5, GI-02) MAPS the wired `rfq.get_comparison_statement.v1`
// (Doc-4E §E8.6, T-ANALYTICS) read onto when backend wiring lands (Wave 4; PARKED today). It is NOT the frozen
// DTO and it coins nothing. The comparison is a SYSTEM-GENERATED, versioned `comparison_statements.matrix_jsonb`
// (Doc-2 §10.4) whose internal schema is "dev-doc" (NOT in the frozen corpus) — so the surface PROJECTS the
// matrix into the render-ready shape below and the presentation renders it GENERICALLY (no coined matrix keys).
//
// GOVERNANCE (load-bearing — this is the comparison MOAT, the most R6-sensitive buyer screen):
//  • R6 / Inv #12 — the comparison is PURELY DESCRIPTIVE. It NEVER ranks to a winner and carries NO
//    recommended/best/lowest-bidder/winner cue. `suppliers` render in the SYSTEM-supplied order and the UI
//    NEVER re-ranks/re-sorts the matrix (GI-04). Award is a separate, deliberate act (P-BUY-17) — not here.
//  • Doc-3 §9.1 (FIXED) — "the comparison shows standing bands but NEVER an auto-recommended winner." Per the
//    Board's P-BUY-15 scope this presentation surfaces ONLY the descriptive allowed fields below and renders
//    NO trust/performance/match SCORE or standing-band column (the firewalled signals stay firewalled).
//  • Inv #11 / GI-12 — VISIBILITY-GATED: the server returns only DISCLOSED quotations; an out-of-visibility RFQ
//    collapses to NOT_FOUND server-side (byte-identical). An empty comparison reads as "awaiting responses",
//    never implying a vendor was excluded. No client count of withheld suppliers.
//  • Doc-3 §10.1 — SEALED-UNTIL-CLOSE: a sealed supplier's price/commercial cells are omitted by the server;
//    the cell explains the seal (never implies the vendor under-quoted) — consistent with P-BUY-14.
//  • Inv #8 — the comparison is a versioned immutable statement (`version_no`, `generated_at`).
//
// SCOPE: presentation only — no fetch, no mutation, no business logic, no client computation (Inv #9 / R7).

import type { QuotationState, MoneyValue } from "../view-models";

/**
 * One column of the comparison = one DISCLOSED quotation (a "supplier"), as the System ordered it. The
 * fields are the Board's allowed DESCRIPTIVE set, each pre-resolved by the surface from the matrix
 * projection. There is deliberately NO score/band/rank/winner field. Routes (if any) use the opaque id.
 */
export interface ComparisonSupplier {
  /** Opaque quotation id (the P-BUY-14 detail identity; never a human ref). */
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
 * The P-BUY-15 comparison view-model. `null` drives the not-found ≡ genuine-absence state (the
 * `get_comparison_statement` read collapses an out-of-visibility RFQ to NOT_FOUND server-side, §7.5 —
 * byte-identical 404, no copy/layout/timing tell). A non-null statement with `suppliers: []` drives the
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
