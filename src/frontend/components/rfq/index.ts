// Doc-7B kit — RFQ card composition barrel (the single import point). Promoted from the vendor-scoped
// realization (Shared Platform Component Registry §4.2 CTO override — 2026-07-03).
export { RfqCard, type RfqCardProps } from "./rfq-card";
export { RfqStateChip, InvitationStateChip, QuotationStateChip } from "./state-chips";
export { WindowStateChip, type WindowStateChipProps } from "./window-state-chip";
export type {
  RfqState,
  InvitationState,
  QuotationState,
  WindowState,
  WindowUrgency,
  RfqCardVM,
} from "./types";
