// Doc-7B kit — frozen QUOTATION state → PRESENTATION display mapping. Promoted from the buyer-scoped
// `state-display.ts` (Shared Platform Component Registry §4.2 CTO override — 2026-07-03) — this is the
// single slice the comparison matrix needs (`quotationStateDisplay`); the other Doc-4M domain mappings
// (RFQ/engagement/payment/invoice/vendor-link/buyer-vendor/invitation) stay workspace-scoped until a
// second workspace needs them too (registry §4).
//
// The kit `status-chip` (Doc-7B BR3) deliberately INVENTS NO LABEL: the surface passes the display `label`
// it derived from the contract, plus a presentation `tone`. This module is exactly that derivation for the
// quotation lifecycle — it maps each VERBATIM frozen Doc-4M / Doc-2 §3.5 state value to a human-readable
// label + a `StatusTone`. It coins no state and re-ranks/decides nothing (Inv #9, R6).

import type { StatusTone } from "./status-chip";

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

export interface StateDisplay {
  label: string;
  tone: StatusTone;
}

/**
 * Quotation state → label + tone. `not_selected` is rendered uniformly and NON-PENALIZINGLY (Doc-3 §9.5):
 * neutral tone, never a "rejected/loser" cue — a vendor must never learn it "lost".
 */
const QUOTATION_STATE_DISPLAY: Record<QuotationState, StateDisplay> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "info" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  shortlisted: { label: "Shortlisted", tone: "brand" },
  selected: { label: "Selected", tone: "success" },
  not_selected: { label: "Not selected", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

export function quotationStateDisplay(state: QuotationState): StateDisplay {
  return QUOTATION_STATE_DISPLAY[state];
}
