// M6 application (PRIVATE) — `comm.dispatch_invitation_delivery.v1` (Doc-4H GrowthDelivery Patch
// v1.0.1 §HB-3.6, the BC-COMM-3 fifth contract — 21.5 System consumed-event effect on
// `outbox/InvitationIssued`). W3-COMM-GRW-1 (B2-3).
//
// ORCHESTRATION ONLY (owns no state): validate → dedup probe → resolve the delivery payload
// JUST-IN-TIME (M6 sole caller — DH-1; never from the event, never from an M1 table) → ONE
// transaction {channel-log row at `queued` + `[ESC-COMM-AUDIT]` System audit + provider hand-off}.
// The transport runs INSIDE the transaction (the P2-A1 send-then-mark parity): a provider throw
// rolls EVERYTHING back — no row, no audit, no half-dispatch — and the consumer retries under its
// budget (`DEPENDENCY`). At-least-once: a commit failure AFTER a resolved send may duplicate the
// provider call on retry — the frozen fan-out-unit key (`event_id`+recipient+channel) is the
// platform guard (§HB-3.6 item 10).
//
// THIN PAYLOAD (Doc-2 v1.0.10 §4 — verified): {event_id, occurred_at, growth_invitation_id,
// recipient_type, delivery_reference_id}. NO raw token, NO recipient_identifier ride the event
// (§16.5 / GI-3); `link`/`qr` never arrive (the producer never emits for them).
//
// ERROR BOUNDARY (§HB-3.6 item 9 — never merged): the M1 DEFINITIVE
// `identity_growth_invite_delivery_not_resolvable` (REFERENCE) → TERMINAL no-dispatch — NO row,
// NO audit, NEVER retried. The M1 TRANSIENT `…_delivery_unavailable` and a provider outage →
// `DEPENDENCY`, retryable (the Inngest wrapper throws → broker retry). M1-side codes pass THROUGH
// verbatim ("no new error code coined here — both M1-side codes are Doc-4C's").
//
// IDEMPOTENT ON `event_id` (§HB-3.6 item 10): the channel-log `source_event_id` = the consumed
// `event_id`; a re-delivered event finds the existing row → same result, no duplicate row, no
// duplicate audit, no duplicate provider send.
//
// AUDIT (§HB-3.6 item 7): `[ESC-COMM-AUDIT]` interim serialization `invitation_delivery_dispatched`
// (domain/audit-actions.ts — named constant, never a literal), attribution SYSTEM,
// `entity_type=<channel>_logs`, in-transaction via Doc-4B. The record carries NO
// `recipient_identifier` and NO signed URL (GI-3) — ids + status facts only.

import { prisma } from "@/shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import type { ResolveInvitationDeliveryPayload } from "@/modules/identity/contracts";
import {
  channelLogEntityType,
  isDeliveryChannel,
} from "../../domain/value-objects/delivery-channel";
import { DeliveryAuditAction } from "../../domain/audit-actions";
import { DeliveryDispatchErrorCode } from "../../domain/error-codes";
import {
  createQueuedRow,
  findRowBySourceEvent,
} from "../../infrastructure/data/outbound-log.repository";
import {
  invitationTemplateFor,
  type DeliveryProviderTransport,
} from "../../infrastructure/delivery/delivery-provider";
import type {
  DispatchInvitationDeliveryInput,
  DispatchInvitationDeliveryOutcome,
  DeliveryDispatchError,
} from "../../contracts/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Injected services (D7 rule 4 — by contract TYPE; concretes supplied by the contracts facade /
 *  the Inngest composition; overridable in tests). */
export interface DispatchInvitationDeliveryDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10). */
  appendAuditRecord: AppendAuditRecord;
  /** `identity.resolve_invitation_delivery_payload.v1` — the SOLE M1 data path (DH-1 / GI-3). */
  resolveDeliveryPayload: ResolveInvitationDeliveryPayload;
  /** The external provider transport seam (infra, replaceable — B2-4). */
  transport: DeliveryProviderTransport;
}

/** Private marker: a transport throw inside the dispatch tx (distinguishes the provider outage
 *  from a DB failure so the outcome maps to `DEPENDENCY` without swallowing real errors). */
class ProviderTransportFailure extends Error {
  constructor(readonly cause: unknown) {
    super("Provider transport failed."); // never the recipient, never the URL
    this.name = "ProviderTransportFailure";
  }
}

function err(
  errorClass: DeliveryDispatchError["errorClass"],
  errorCode: string,
  message: string,
  retryable: boolean,
): DispatchInvitationDeliveryOutcome {
  return { ok: false, error: { errorClass, errorCode, message, retryable } };
}

/**
 * Dispatch one consumed `InvitationIssued` event to its channel structure (§HB-3.6). System-only —
 * never user-initiated; the caller is the registered Inngest consumer (stage-2 CONTEXT).
 */
export async function dispatchInvitationDeliveryCommand(
  input: DispatchInvitationDeliveryInput,
  deps: DispatchInvitationDeliveryDeps,
  db: typeof prisma = prisma,
): Promise<DispatchInvitationDeliveryOutcome> {
  // (1) SYNTAX (§HB-3.6 stage 1): presence/type; ids uuid; `recipient_type` ∈ the targeted enum.
  //     Malformed event fields are TERMINAL (VALIDATION, retryable:false — a replay cannot fix them).
  if (
    typeof input.eventId !== "string" ||
    !UUID_PATTERN.test(input.eventId) ||
    typeof input.growthInvitationId !== "string" ||
    !UUID_PATTERN.test(input.growthInvitationId) ||
    typeof input.deliveryReferenceId !== "string" ||
    !UUID_PATTERN.test(input.deliveryReferenceId)
  ) {
    return err(
      "VALIDATION",
      DeliveryDispatchErrorCode.INVALID_EVENT,
      "Malformed InvitationIssued event fields.",
      false,
    );
  }
  if (typeof input.recipientType !== "string" || !isDeliveryChannel(input.recipientType)) {
    // `link`/`qr` structurally never arrive; anything non-targeted here is a malformed event.
    return err(
      "VALIDATION",
      DeliveryDispatchErrorCode.INVALID_EVENT,
      "recipient_type is not a targeted delivery channel.",
      false,
    );
  }
  const channel = input.recipientType; // the frozen 1:1 recipient_type → channel map (§HB-3.6)

  // (2) IDEMPOTENCY probe (§HB-3.6 item 10): an existing row for this `event_id` → the same
  //     result — no duplicate row, no duplicate audit, NO duplicate provider send.
  const existing = await findRowBySourceEvent(channel, input.eventId, db);
  if (existing !== null) {
    return { ok: true, result: { deliveryLogId: existing.id, channel, deduplicated: true } };
  }

  // (3) REFERENCE (stage 7): resolve the delivery payload just-in-time — the SOLE M1 data path.
  const resolved = await deps.resolveDeliveryPayload({
    deliveryReferenceId: input.deliveryReferenceId,
  });
  if (!resolved.ok) {
    if (resolved.error.errorClass === "DEPENDENCY") {
      // TRANSIENT (M1 service unavailable) → retryable under the frozen budget. Code passthrough.
      return err("DEPENDENCY", resolved.error.errorCode, resolved.error.message, true);
    }
    // DEFINITIVE (`identity_growth_invite_delivery_not_resolvable` — unknown/revoked/expired/
    // not-targeted) → TERMINAL: no dispatch, NO row, NO audit, never retried. Code passthrough.
    return err("REFERENCE", resolved.error.errorCode, resolved.error.message, false);
  }
  const payload = resolved.result;

  // (4) DISPATCH transaction (§HB-3.6 items 6/7 + the in-tx hand-off): row at `queued` + System
  //     audit + provider transport, atomically. Staff/System GUC transaction-local (the audit
  //     `WITH CHECK` staff leg — the M1 System-command idiom); never session-global.
  const template = invitationTemplateFor(channel); // infra-owned provider configuration (item 3)
  try {
    const deliveryLogId = await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

      // In-tx dedup re-probe (a concurrent consumer may have won since (2)).
      const raced = await findRowBySourceEvent(channel, input.eventId, tx);
      if (raced !== null) return raced.id;

      const rowId = await createQueuedRow(
        {
          channel,
          recipientRef: payload.recipientIdentifier, // GI-3: the ONE sanctioned landing surface
          sourceEventId: input.eventId,
          template,
        },
        tx,
      );

      // `[ESC-COMM-AUDIT]` — System actor; NO recipient_identifier, NO signed URL (GI-3).
      await deps.appendAuditRecord(
        {
          actorId: null,
          actorType: "system",
          organizationId: null, // external recipient — no tenant row is read (§HB-3.6 item 5)
          entityType: channelLogEntityType(channel),
          entityId: rowId,
          action: DeliveryAuditAction.DISPATCHED,
          oldValue: null,
          newValue: {
            status: "queued",
            source_event_id: input.eventId,
            delivery_reference_id: input.deliveryReferenceId,
          },
        },
        tx,
      );

      // Hand-off to the external delivery adapter (B2-4) — the signed URL is consumed HERE and
      // never persisted (GI-3). A throw rolls the row + audit back (no half-dispatch).
      try {
        await deps.transport({
          channel,
          deliveryLogId: rowId,
          template,
          recipientIdentifier: payload.recipientIdentifier,
          signedInvitationUrl: payload.signedInvitationUrl,
        });
      } catch (e) {
        throw new ProviderTransportFailure(e);
      }

      return rowId;
    });
    return { ok: true, result: { deliveryLogId, channel, deduplicated: false } };
  } catch (e) {
    if (e instanceof ProviderTransportFailure) {
      // TRANSIENT provider outage (§HB-3.6 stage 7 / item 9) → `DEPENDENCY`, retryable; the
      // rollback left no row/audit, so the retry re-dispatches cleanly.
      return err(
        "DEPENDENCY",
        DeliveryDispatchErrorCode.PROVIDER_UNAVAILABLE,
        "The channel provider is transiently unavailable.",
        true,
      );
    }
    throw e;
  }
}
