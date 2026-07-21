// M6 domain — the BC-COMM-3 delivery-channel value set (Doc-2 §10.7 / Doc-4H Pass-B Part-3 frozen
// anchors): the Outbound Log aggregate's three channel structures `email_logs` / `sms_logs` /
// `whatsapp_logs`, selected by the frozen `channel` enum (`email` | `sms` | `whatsapp`), and the
// Growth-Delivery 1:1 `recipient_type` → `channel` map (Doc-4H GrowthDelivery Patch v1.0.1 §1 /
// §HB-3.6: "the `recipient_type` enum `email|sms|whatsapp` maps 1:1 onto the frozen `channel`
// enum"; `link`/`qr` never arrive — the event never fires for them). Nothing coined — the sets
// are the frozen Doc-2/Doc-6H values verbatim.

/** The frozen targeted channel set (Doc-2 §10.7; = the targeted `recipient_type` values 1:1). */
export const DELIVERY_CHANNELS = ["email", "sms", "whatsapp"] as const;

/** One Outbound Log channel (selects the channel structure `<channel>_logs`). */
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];

/** The frozen delivery lifecycle value set (Doc-2 §10.7: `queued → sent → delivered | failed`,
 *  + the frozen retry re-entry `failed → queued` — no new state). */
export type DeliveryLogStatusValue = "queued" | "sent" | "delivered" | "failed";

/** Type guard: is this consumed `recipient_type` a targeted delivery channel? (`link`/`qr` are
 *  structurally excluded — the producer never emits `InvitationIssued` for them.) */
export function isDeliveryChannel(value: string): value is DeliveryChannel {
  return (DELIVERY_CHANNELS as readonly string[]).includes(value);
}

/** The audit `entity_type` for a channel-log row — `<channel>_logs`, the frozen table literal
 *  (Doc-4H GrowthDelivery §HB-3.6 item 7: `entity_type=<channel>_logs`). */
export function channelLogEntityType(channel: DeliveryChannel): string {
  return `${channel}_logs`;
}
