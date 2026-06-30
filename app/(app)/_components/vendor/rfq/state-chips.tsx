// Doc-4M state → {tone, label} chips for the RFQ workspace (companion §7.1 status taxonomy). The kit
// StatusChip invents nothing: THIS surface derives the localized label + tone from the frozen Doc-4M
// token (DP3). Tones come from the companion's single mapping; labels avoid slug strings and carry NO
// comparison/rank wording (firewall — ND-3/ND-6). Presentation-only; RSC-friendly.
//
// i18n: labels are English in the presentation phase (consistent with the rest of the workspace);
// localized strings are threaded in at the i18n layer (§7.8). Non-vendor-visible tokens fall back to
// a neutral chip so an out-of-range value can never imply a leaked signal.
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { InvitationState, QuotationState, RfqState } from "./types";

type ChipSpec = { tone: StatusTone; label: string };

// Vendor-visible RFQ states (companion §7.1). Upstream states (draft…matching) are not reached by a
// vendor but are mapped neutrally for completeness/safety.
const RFQ_MAP: Record<RfqState, ChipSpec> = {
  draft: { tone: "neutral", label: "Draft" },
  pending_internal_approval: { tone: "neutral", label: "Pending approval" },
  submitted: { tone: "neutral", label: "Submitted" },
  under_review: { tone: "neutral", label: "Under review" },
  matching: { tone: "neutral", label: "Matching" },
  vendors_notified: { tone: "info", label: "Open — respond" },
  quotations_received: { tone: "info", label: "Collecting quotes" },
  buyer_reviewing: { tone: "info", label: "Buyer reviewing" },
  shortlisted: { tone: "brand", label: "Shortlisted" },
  closed_won: { tone: "success", label: "Awarded — you won" },
  closed_lost: { tone: "warning", label: "Closed" },
  expired: { tone: "neutral", label: "Expired" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

const INVITATION_MAP: Record<InvitationState, ChipSpec> = {
  draft: { tone: "neutral", label: "—" },
  selected: { tone: "neutral", label: "—" },
  deferred: { tone: "neutral", label: "—" },
  delivered: { tone: "info", label: "New invitation" },
  accepted: { tone: "success", label: "Accepted" },
  declined: { tone: "neutral", label: "Declined" },
  expired: { tone: "neutral", label: "Expired" },
};

// Quotation states (companion §7.1; aligned to §6.4/§6.7). `not_selected` carries no "why".
const QUOTATION_MAP: Record<QuotationState, ChipSpec> = {
  draft: { tone: "neutral", label: "Draft" },
  submitted: { tone: "info", label: "Submitted" },
  shortlisted: { tone: "brand", label: "Shortlisted" },
  withdrawn: { tone: "neutral", label: "Withdrawn" },
  selected: { tone: "success", label: "Selected" },
  not_selected: { tone: "warning", label: "Not selected" },
  expired: { tone: "neutral", label: "Expired" },
};

export function RfqStateChip({ state }: { state?: RfqState }) {
  if (!state) return null;
  const spec = RFQ_MAP[state];
  return <StatusChip tone={spec.tone} label={spec.label} />;
}

export function InvitationStateChip({ state }: { state?: InvitationState }) {
  if (!state) return null;
  const spec = INVITATION_MAP[state];
  return <StatusChip tone={spec.tone} label={spec.label} />;
}

export function QuotationStateChip({ state }: { state?: QuotationState }) {
  if (!state) return null;
  const spec = QUOTATION_MAP[state];
  return <StatusChip tone={spec.tone} label={spec.label} />;
}
