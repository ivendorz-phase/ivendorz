// Doc-7B kit — RFQ/Quotation frozen-state types + RfqCard view-model. Promoted from the vendor-scoped
// realization (Shared Platform Component Registry §4.2 CTO override — 2026-07-03). ZERO CONTRACT
// INVENTION: every field/enum/state is a REAL frozen value (Doc-2 §10.4, Doc-4E, Doc-4M). All optional →
// genuine-empty in the presentation phase.

/** RFQ lifecycle — frozen Doc-4M / Doc-2 §5.4 (full set). */
export type RfqState =
  | "draft"
  | "pending_internal_approval"
  | "submitted"
  | "under_review"
  | "matching"
  | "vendors_notified"
  | "quotations_received"
  | "buyer_reviewing"
  | "shortlisted"
  | "closed_won"
  | "closed_lost"
  | "expired"
  | "cancelled";

/** RFQ Invitation lifecycle — frozen Doc-4M / Doc-2 §3.4 (vendor-visible entry state = `delivered`). */
export type InvitationState =
  | "draft"
  | "selected"
  | "deferred"
  | "delivered"
  | "accepted"
  | "declined"
  | "expired";

/** Quotation lifecycle — frozen Doc-4M / Doc-2 §5.5. There is NO `revised` state: revisions are immutable
 *  versions within `submitted`. `selected`/`not_selected` reach only from `shortlisted`. */
export type QuotationState =
  | "draft"
  | "submitted"
  | "withdrawn"
  | "shortlisted"
  | "selected"
  | "not_selected"
  | "expired";

/** Window sub-state — a UI-DERIVED affordance ([ESC-7B-WINDOW-CHIP]), NOT a Doc-4M state: a second
 *  independent chip orthogonal to the RFQ state. */
export type WindowState = "open" | "open_late" | "closed";

/** Optional urgency tier for an OPEN window (warning <24h, danger <2h). Caller/server-supplied — never
 *  computed on the client (no live clock in the presentation phase). */
export type WindowUrgency = "normal" | "soon" | "imminent";

/**
 * One row of a received-only RFQ inbox/listing card. Combines the entitled RFQ display with the
 * invitation + window chips. Presentation-only; byte-equivalence (Invariant 11 / GR11) is load-bearing —
 * this view carries ONLY own/received data, never a competitor count, rank, score, match confidence, or
 * "why-not-invited" signal.
 */
export interface RfqCardVM {
  /** Route identifier — used only to link to the detail route. */
  rfq_id: string;
  /** RFQ human_ref (e.g. "RFQ-2026-000481") — frozen. */
  rfq_human_ref?: string;
  /** Short display descriptor, projected by integration — NOT a standalone frozen column. */
  rfq_summary?: string;
  /** RFQ state token (Doc-4M). */
  rfq_state?: RfqState;
  /** Window sub-state chip (UI-derived). */
  window_state?: WindowState;
  /** Server-formatted window deadline label (no client clock). */
  window_deadline_label?: string;
  window_urgency?: WindowUrgency;
  /** Invitation state token (Doc-4M; vendor-visible entry = `delivered`). */
  invitation_state?: InvitationState;
  /** Own quotation state on this RFQ (Doc-4M `QuotationState`) — visibility-gated: present only when a
   *  quotation has actually been started/submitted. Own-record fact only; never a competitor's state. */
  quotation_state?: QuotationState;
  /** Own-record fact only: an unread clarification message on this own thread — never an exclusion
   *  signal. */
  unread_clarification?: boolean;
}
