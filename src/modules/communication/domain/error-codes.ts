// M6 domain — the canonical `comm_support_ticket_*` error-code register (Doc-4H §H7 `comm_` namespace).
// The code STRINGS are development-document realization (Doc-4A error-code discipline — Pass-B fixes the
// error CLASS + trigger + retryable; the numeric/string code is dev-doc scope). ONE module-owned source,
// imported by the command (relative), the api wire mapper, and the app-layer composition (via contracts)
// so the same code never drifts across the three layers (NIT-1 — consolidated duplication).

export const SupportTicketErrorCode = {
  /** VALIDATION (Doc-4H §HB-4.x Stage 1 SYNTAX). */
  INVALID_INPUT: "comm_support_ticket_invalid_input",
  /** AUTHORIZATION (Stage 3 AUTHZ; incl. a User requesting a staff-only transition). */
  FORBIDDEN: "comm_support_ticket_forbidden",
  /** NOT_FOUND (Stage 4 SCOPE — the R10 protected-fact collapse; absent OR out-of-scope). */
  NOT_FOUND: "comm_support_ticket_not_found",
  /** STATE (Stage 6 — an illegal transition / closed-ticket append / non-resolved close). */
  INVALID_STATE: "comm_support_ticket_invalid_state",
  /** CONFLICT (the contract-internal OCC lost race — distinct from STATE; retryable). */
  CONFLICT: "comm_support_ticket_conflict",
} as const;

export type SupportTicketErrorCodeValue =
  (typeof SupportTicketErrorCode)[keyof typeof SupportTicketErrorCode];

// ─────────────────────────────────────────────────────────────────────────────
// BC-COMM-3 delivery-dispatch codes (W3-COMM-GRW-1 — the `comm_` namespace, Doc-4H §H.4; code
// STRINGS are dev-doc realization, classes/triggers are the frozen registers). The M1-SIDE codes
// (`identity_growth_invite_delivery_not_resolvable` / `…_delivery_unavailable`) are DELIBERATELY
// NOT re-declared here — Doc-4H GrowthDelivery §HB-3.6 item 9: "No new error code coined here
// (both M1-side codes are Doc-4C's)"; the dispatch outcome carries them THROUGH verbatim.
// ─────────────────────────────────────────────────────────────────────────────

export const DeliveryDispatchErrorCode = {
  /** VALIDATION (§HB-3.6 stage 1 SYNTAX — malformed consumed-event fields; terminal). */
  INVALID_EVENT: "comm_delivery_invalid_event",
  /** STATE (frozen §HB-3.3 stage 6 — a retry on a non-`failed` record). */
  INVALID_STATE: "comm_delivery_invalid_state",
  /** REFERENCE (frozen §HB-3.3 stage 7 — the channel-log record does not exist; definitive). */
  RECORD_NOT_FOUND: "comm_delivery_record_not_found",
  /** CONFLICT (a lost concurrency race on the status CAS — distinct from STATE; retryable). */
  CONFLICT: "comm_delivery_conflict",
  /** DEPENDENCY (the channel provider transiently unavailable — retryable; §HB-3.6 stage 7). */
  PROVIDER_UNAVAILABLE: "comm_delivery_provider_unavailable",
} as const;

export type DeliveryDispatchErrorCodeValue =
  (typeof DeliveryDispatchErrorCode)[keyof typeof DeliveryDispatchErrorCode];
