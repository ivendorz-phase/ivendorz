// RFQ WORKFLOW — Frozen transition inventory (REFERENCE PROJECTION, by pointer).
//
// A typed, read-only projection of the frozen transition inventories: Doc-4M M5 (RFQ · RFQ
// Invitation · Quotation) plus the two RFQ edges Doc-5E §4.2 carries as patched coverage
// (`under_review → draft` moderation-reject, `matching → expired` coverage-exhausted). NOTHING here
// is invented — every row cites its frozen source, and no row may be added without one.
//
// ROLE (governance): this map exists so the MOCK adapter can shape stand-in data (permitted-action
// sets, coherent fixtures) and so orientation surfaces can label who acts next. It is NEVER a
// client-side legality decision: at wiring the SERVER derives the permitted-action set (GI-10) and
// the presentation renders exactly what the server supplies — this file then remains documentation
// and fixture support only. Terminal states have no outbound rows; never author one (Doc-4M M5).

import type { RfqState, InvitationState, QuotationState } from "@/frontend/components/rfq";

/** Trigger authority classes as Doc-4M M5 names them (display copy — authorization is server-side). */
export type TransitionAuthority = "buyer" | "vendor" | "system" | "admin" | "buyer_or_system";

/** Frozen Doc-5E buyer/vendor command names (by pointer — never a coined slug). */
export type RfqWorkflowCommand =
  | "create_rfq"
  | "update_rfq"
  | "submit_rfq"
  | "approve_rfq"
  | "reject_internal_rfq"
  | "cancel_rfq"
  | "moderate_rfq"
  | "reissue_rfq"
  | "shortlist_quotation"
  | "manage_clarification"
  | "invoke_best_and_final"
  | "award_rfq"
  | "close_lost_rfq"
  | "submit_quotation"
  | "revise_quotation"
  | "withdraw_quotation"
  | "request_late_extension"
  | "respond_to_invitation";

export interface FrozenTransition<S extends string> {
  from: S;
  to: S;
  authority: TransitionAuthority;
  /** The frozen Doc-5E command that realizes a caller-driven edge (absent for System/worker edges). */
  command?: RfqWorkflowCommand;
  /** Frozen source pointer (reference-never-restate). */
  source: string;
}

/** RFQ machine — Doc-4M M5 rows + the Doc-5E §4.2 patched edges. */
export const RFQ_TRANSITIONS: readonly FrozenTransition<RfqState>[] = [
  {
    from: "draft",
    to: "pending_internal_approval",
    authority: "buyer",
    command: "submit_rfq",
    source: "Doc-2 §5.4; Doc-3 §1.2; Doc-4E",
  },
  {
    from: "draft",
    to: "submitted",
    authority: "buyer",
    command: "submit_rfq",
    source: "Doc-2 §5.4; Doc-3 §1.2; Doc-4E",
  },
  {
    from: "pending_internal_approval",
    to: "submitted",
    authority: "buyer",
    command: "approve_rfq",
    source: "Doc-2 §5.4; Doc-3 §1.2; Doc-4E",
  },
  {
    from: "pending_internal_approval",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-2 §5.4; Doc-3 §1.6; Doc-4E",
  },
  {
    from: "submitted",
    to: "under_review",
    authority: "system",
    source: "Doc-3 §1.2; Doc-4E (platform moderation)",
  },
  {
    from: "under_review",
    to: "matching",
    authority: "admin",
    command: "moderate_rfq",
    source: "Doc-3 §1.2; Doc-4E (moderation pass — Admin decides, DE-5)",
  },
  {
    from: "under_review",
    to: "draft",
    authority: "admin",
    command: "moderate_rfq",
    source: "Doc-5E §4.2 (patched moderation-reject edge)",
  },
  {
    from: "matching",
    to: "vendors_notified",
    authority: "system",
    source: "Doc-3 §1.2; Doc-4E (matching complete; invitations dispatched)",
  },
  {
    from: "matching",
    to: "expired",
    authority: "system",
    source: "Doc-5E §4.2 (patched coverage-exhausted edge)",
  },
  {
    from: "vendors_notified",
    to: "quotations_received",
    authority: "system",
    source: "Doc-3 §1.2; Doc-4E §E7 (first quotation, same transaction as submit_quotation)",
  },
  {
    from: "quotations_received",
    to: "buyer_reviewing",
    authority: "buyer",
    source: "Doc-3 §1.2; Doc-4E §E8.6 (first open of the comparison statement)",
  },
  {
    from: "buyer_reviewing",
    to: "shortlisted",
    authority: "buyer",
    command: "shortlist_quotation",
    source: "Doc-3 §1.2; Doc-4E §E8",
  },
  {
    from: "shortlisted",
    to: "closed_won",
    authority: "buyer",
    command: "award_rfq",
    source: "Doc-3 §1.2; Doc-4E §E8.4 (emits RFQClosedWon — M6-1 seam)",
  },
  {
    from: "shortlisted",
    to: "closed_lost",
    authority: "buyer",
    command: "close_lost_rfq",
    source: "Doc-3 §1.2; Doc-4E §E8",
  },
  {
    from: "vendors_notified",
    to: "expired",
    authority: "system",
    source: "Doc-3 §1.2/§1.4 (validity clock)",
  },
  {
    from: "quotations_received",
    to: "expired",
    authority: "system",
    source: "Doc-3 §1.2/§1.4 (validity clock)",
  },
  {
    from: "buyer_reviewing",
    to: "expired",
    authority: "system",
    source: "Doc-3 §1.2/§1.4 (validity clock)",
  },
  {
    from: "draft",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-3 §1.6; Doc-4E",
  },
  {
    from: "submitted",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-3 §1.6; Doc-4E",
  },
  {
    from: "under_review",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-3 §1.6; Doc-4E",
  },
  {
    from: "matching",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-3 §1.6; Doc-4E",
  },
  {
    from: "vendors_notified",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-3 §1.6; Doc-4E",
  },
  {
    from: "quotations_received",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-3 §1.6; Doc-4E",
  },
  {
    from: "buyer_reviewing",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-3 §1.6; Doc-4E",
  },
  {
    from: "shortlisted",
    to: "cancelled",
    authority: "buyer",
    command: "cancel_rfq",
    source: "Doc-3 §1.6; Doc-4E",
  },
] as const;

/** RFQ Invitation machine — Doc-4M M5 (vendor-visible entry state is `delivered`; deferral is
 *  invisible to the buyer — Doc-3 §4.2). */
export const INVITATION_TRANSITIONS: readonly FrozenTransition<InvitationState>[] = [
  {
    from: "draft",
    to: "selected",
    authority: "system",
    source: "Doc-2 §3 (rfq_invitations); Doc-4E (matching selects vendor)",
  },
  {
    from: "selected",
    to: "deferred",
    authority: "buyer_or_system",
    source: "Doc-2 §3; Doc-4E (deferral logic)",
  },
  {
    from: "selected",
    to: "delivered",
    authority: "system",
    source: "Doc-2 §3/§8; Doc-4E (emits VendorInvited — M6-2 seam)",
  },
  {
    from: "deferred",
    to: "delivered",
    authority: "system",
    source: "Doc-2 §3/§8; Doc-4E (deferral resolved; emits VendorInvited)",
  },
  {
    from: "delivered",
    to: "accepted",
    authority: "vendor",
    command: "respond_to_invitation",
    source: "Doc-2 §3; Doc-4E (can_respond_to_rfq)",
  },
  {
    from: "delivered",
    to: "declined",
    authority: "vendor",
    command: "respond_to_invitation",
    source:
      "Doc-2 §3; Doc-4E (formal decline — recorded on the invitation, never a quotation state)",
  },
  {
    from: "delivered",
    to: "expired",
    authority: "system",
    source: "Doc-2 §3; Doc-4E (validity clock)",
  },
  {
    from: "accepted",
    to: "expired",
    authority: "system",
    source: "Doc-2 §3; Doc-4E (parent RFQ expires/cancels)",
  },
] as const;

/**
 * Quotation machine — Doc-4M M5. NOTE (load-bearing): there is NO `revised` state and NO
 * `submitted → submitted` row here — a revision is `revise_quotation` producing a NEW IMMUTABLE
 * VERSION with the state unchanged (Doc-5E §5.1; Inv #8). "Locking" is likewise not a state:
 * every submitted version is already immutable; evaluation reads versions, it never freezes them.
 */
export const QUOTATION_TRANSITIONS: readonly FrozenTransition<QuotationState>[] = [
  {
    from: "draft",
    to: "submitted",
    authority: "vendor",
    command: "submit_quotation",
    source: "Doc-2 §5.5; Doc-4E (can_submit_quote; consumes the Billing quota — DE-7)",
  },
  {
    from: "submitted",
    to: "withdrawn",
    authority: "vendor",
    command: "withdraw_quotation",
    source: "Doc-2 §5.5; Doc-4E (can_withdraw_quote)",
  },
  {
    from: "submitted",
    to: "shortlisted",
    authority: "buyer",
    command: "shortlist_quotation",
    source: "Doc-2 §5.5; Doc-4E §E8",
  },
  {
    from: "shortlisted",
    to: "selected",
    authority: "buyer",
    command: "award_rfq",
    source: "Doc-2 §5.5; Doc-4E §E8.4 (award decision — can_award_rfq)",
  },
  {
    from: "shortlisted",
    to: "not_selected",
    authority: "buyer",
    command: "award_rfq",
    source: "Doc-2 §5.5; Doc-4E §E8 (award goes to another quotation)",
  },
  {
    from: "submitted",
    to: "expired",
    authority: "system",
    source: "Doc-2 §5.5; Doc-4E (parent RFQ expires)",
  },
] as const;

/** Frozen RFQ transitions leaving `state` (empty for terminal states — closed_won/closed_lost/expired/cancelled). */
export function rfqTransitionsFrom(state: RfqState): readonly FrozenTransition<RfqState>[] {
  return RFQ_TRANSITIONS.filter((t) => t.from === state);
}

/** Terminal RFQ states — no outbound transition exists; `reissue_rfq` creates a NEW aggregate instead. */
export function isTerminalRfqState(state: RfqState): boolean {
  return (
    state === "closed_won" ||
    state === "closed_lost" ||
    state === "expired" ||
    state === "cancelled"
  );
}
