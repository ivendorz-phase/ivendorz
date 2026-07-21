// M6 infrastructure (PRIVATE) — the EXTERNAL delivery-provider transport seam (W3-COMM-GRW-1
// B2-4). Infrastructure is REPLACEABLE: the interface is the seam; the concrete provider (Resend
// for email, an SMS/WhatsApp gateway) is infra-owned provider configuration (the frozen Part-3
// model — "transport-provider configuration (infra)"; Doc-4H GrowthDelivery §HB-3.6 item 3:
// template selection = infra-owned provider configuration, NO template coined). No live
// credentials are wired in this slice — the dev implementation is a no-op logger.
//
// CONFIDENTIALITY (GI-3 — binding): a transport implementation NEVER logs `recipientIdentifier`
// and NEVER logs `signedInvitationUrl` — log surface = channel + channel-log row id ONLY. The
// signed URL is consumed at send time and never persisted anywhere in M6 (Doc-4H GrowthDelivery §5).

import type { DeliveryChannel } from "../../domain/value-objects/delivery-channel";

/** One provider hand-off (the dispatch of one channel-log row). */
export interface DeliveryDispatchRequest {
  /** The Outbound Log channel (selects the provider lane). */
  channel: DeliveryChannel;
  /** The channel-log row id (the ONLY id a transport may log). */
  deliveryLogId: string;
  /** The provider template id (infra-owned configuration; referenced only). */
  template: string;
  /** The external address — GI-3-confined: provider call only, NEVER logged. */
  recipientIdentifier: string;
  /** The §C13 short-lived/one-time signed URL — the sole M1-sourced render parameter
   *  (§HB-3.6 item 3); consumed at send time, NEVER logged, NEVER persisted. */
  signedInvitationUrl: string;
}

/** The injected provider transport. May throw — a throw is a TRANSIENT provider failure
 *  (`DEPENDENCY`, retryable) that rolls the dispatch transaction back (no row, no audit, no
 *  half-dispatch); the consumer retries under its budget. */
export type DeliveryProviderTransport = (request: DeliveryDispatchRequest) => Promise<void>;

/**
 * Infra-owned provider-template configuration (§HB-3.6 item 3 — "the invitation provider-template
 * id is selected by infra-owned provider/template configuration … selection detail =
 * implementation scope, no template coined"). One provider template id per channel lane; the
 * string is a PROVIDER-side reference (swapped with the provider), not a governance artifact.
 */
export function invitationTemplateFor(channel: DeliveryChannel): string {
  switch (channel) {
    case "email":
      return "growth-invitation-email-v1";
    case "sms":
      return "growth-invitation-sms-v1";
    case "whatsapp":
      return "growth-invitation-whatsapp-v1";
  }
}

/**
 * The dev/no-op transport: records the hand-off without any external call. Logs channel +
 * channel-log row id ONLY (GI-3 — never the address, never the URL). The real provider adapters
 * (Resend etc.) replace this behind the same seam; credentials stay infra/env-owned.
 */
export const noopDeliveryProviderTransport: DeliveryProviderTransport = async (request) => {
  console.info(
    `[delivery] dispatched channel=${request.channel} delivery_log_id=${request.deliveryLogId}`,
  );
};
