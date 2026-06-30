// Typed presentation props for the Vendor Engagements workspace (Milestone 7 — E1–E5; companion §13.3).
// Vendor-leg post-award (Module M4 Business Operations: BC-OPS-2 Engagements + BC-OPS-4 Generated
// Documents). ZERO CONTRACT INVENTION: every field/enum binds a REAL frozen value (Doc-2 §10.5,
// Doc-4F PassB Part2/Part4, Doc-5F). All optional → genuine-empty in the presentation phase.
//
// MONEY BOUNDARY (binding): the platform NEVER holds, transfers, or settles funds. The only payment
// affordances are RECORD and CONFIRM of OFF-PLATFORM payment *records*. No Pay/Settle/Escrow/Wallet.
// Engagements are created OUT-OF-WIRE by `ops.create_engagement_on_award.v1` (System ← RFQClosedWon) —
// no screen ever creates one (DP10 / Inv 7); award → engagement is NAVIGATION, never a cross-module
// write. Non-party → byte-identical not-found (Inv 11).
//
// IMPORTANT FROZEN DISTINCTION: `engagement_document_kind` = {loi, po, challan, wcc} ONLY (versioned
// documents). `trade_invoices` and `payment_records` are SEPARATE frozen aggregates with their OWN
// status machines — NOT document-kind values. The E3 tab strip groups all six for presentation only.

/** Engagement lifecycle — FROZEN machine (Doc-2 §3.5 / Doc-4F): open → in_delivery → completed →
 *  closed. Only the single next legal edge is ever shown; `closed` is terminal. No on_hold/active/disputed. */
export type EngagementStatus = "open" | "in_delivery" | "completed" | "closed";

/** Versioned engagement-document kind — FROZEN `engagement_document_kind` enum (Doc-2 §10.5): exactly
 *  these four. Each is a separate versioned table (lois / purchase_orders / challans /
 *  work_completion_certificates) with immutable version chains (Invariant 8). */
export type EngagementDocumentKind = "loi" | "po" | "challan" | "wcc";

/** Trade-invoice status — FROZEN `trade_invoice_status` (Doc-2 §10.5). Records inter-party commerce;
 *  STRICTLY NOT billing.platform_invoices (DF-6), no funds custody. `paid` means the parties recorded
 *  off-platform payment, never settlement. `disputed` emits a Trust performance input (Operations
 *  emits; never scores). */
export type TradeInvoiceStatus = "issued" | "partially_paid" | "paid" | "disputed" | "cancelled";

/** Payment-record status — FROZEN `payment_record_status` (Doc-2 §10.5): a record of off-platform
 *  payment, never funds movement. `payment_records` carries NO human_ref (no `PAY-` prefix is coined). */
export type PaymentRecordStatus = "recorded" | "confirmed";

/** A resolved rendered artifact (BC-OPS-4 generated_documents.storage_ref → signed URL by integration).
 *  ASYNC_PENDING: the operational record is usable the instant issue succeeds; the rendered PDF may
 *  still be generating — the artifact NEVER gates the record's fact (companion §13.3 M-3). */
export interface GeneratedArtifactView {
  href?: string;
  name?: string;
  /** True while the BC-OPS-4 render job is still running ("issued · PDF generating…"). */
  is_pending?: boolean;
}

/** E1 row — frozen `ops.list_engagements.v1` MINIMAL projection: {engagement_id, human_ref, status}
 *  ONLY (companion MINOR-C3). Award value + buyer live on E2. The human_ref prefix is opaque (allocated
 *  by core; not coined here). */
export interface EngagementListItemView {
  id: string;
  human_ref?: string;
  status?: EngagementStatus;
}

/** E2 overview — frozen `ops.get_engagement.v1` projection (8 fields). It does NOT project `rfq_id` or
 *  any RFQ/quotation human-ref ([ESC-7G-ENG-01]); the awarded-RFQ reference is shown as "pending
 *  projection", never a live ref. The buyer is a known party but only `buyer_organization_id` (UUID) is
 *  returned — a display name needs an M1 resolution ([ESC-7G-ENG-02]); absent → a neutral label. */
export interface EngagementView {
  id: string;
  human_ref?: string;
  status?: EngagementStatus;
  /** Resolved buyer display name (M1 resolution, [ESC-7G-ENG-02]); absent → neutral label. */
  buyer_label?: string;
  /** Frozen award_value_snapshot + currency. */
  award_value_snapshot?: number;
  currency?: string;
}

/** A versioned engagement document (LOI/PO/Challan/WCC) — frozen lois/purchase_orders/challans/
 *  work_completion_certificates fields. IMMUTABLE (Invariant 8): each revision is a new version_no;
 *  only is_active_revision toggles; nothing is overwritten or deleted. revision_reason is mandatory on
 *  revise. The rendered artifact is a separate BC-OPS-4 generated_document (storage_ref). */
export interface EngagementDocumentView {
  id: string;
  kind?: EngagementDocumentKind;
  human_ref?: string;
  version_no: number;
  /** false → superseded by a newer version (kept for reference). */
  is_active_revision?: boolean;
  revision_reason?: string;
  issued_at?: string;
  created_at?: string;
  /** Rendered artifact (may be pending). */
  artifact?: GeneratedArtifactView;
}

/** A trade-invoice record — frozen trade_invoices fields (human_ref uses the INV- prefix). */
export interface TradeInvoiceView {
  id: string;
  human_ref?: string;
  amount?: number;
  currency?: string;
  status?: TradeInvoiceStatus;
  due_date?: string;
  /** UI-derived from the row's own due_date (own-party data, no client clock; companion m-3). */
  overdue?: boolean;
}

/** A payment record — frozen payment_records fields. NO human_ref. Records off-platform payment only. */
export interface PaymentRecordView {
  id: string;
  amount?: number;
  currency?: string;
  status?: PaymentRecordStatus;
  paid_at?: string;
  method_note?: string;
}

/** Reconciliation summary — a DERIVED display composition of own-party records, explicitly labelled
 *  "derived, off-platform records" (companion §13.3 M-1). NOT a count contract and NOT a stat-tile
 *  (Invariant 11): plain numeric text only, composed from already-read documents. */
export interface ReconciliationView {
  invoiced?: number;
  recorded?: number;
  confirmed?: number;
  outstanding?: number;
  currency?: string;
}
