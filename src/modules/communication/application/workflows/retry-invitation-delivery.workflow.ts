// M6 application (PRIVATE) — the INVITATION RETRY GUARD + the minimal frozen retry slice
// (W3-COMM-GRW-1 B2-5; Doc-4H GrowthDelivery Patch v1.0.1 §2 — "the guard runs in the
// invitation-delivery retry-job orchestration … BEFORE it invokes the frozen
// `comm.retry_delivery.v1`"). ORCHESTRATION-LEVEL, outside every frozen contract body; owns NO
// state — state lives in the channel-log rows (repository) and in M1 (reached only via the
// delivery-payload contract).
//
// GUARD (patch §2, binding):
//   • Invitation-origin rows are identified by their persisted `source_event_id` (= the consumed
//     `event_id`).
//   • The `delivery_reference_id` is recovered by RE-READING THE PERSISTED M0 OUTBOX EVENT
//     PAYLOAD for that `event_id` (Doc-4B — the injected M0 `readOutboxEvent` contract read) —
//     NEVER a new channel-log column, NEVER an M1 table read from M6.
//   • Re-resolve `identity.resolve_invitation_delivery_payload.v1`:
//       live     → re-dispatch proceeds with a FRESH short-lived signed URL (each resolve mints
//                  one — the stale URL is never re-sent);
//       not live → PERMANENT-FAILURE classification: the record stays `failed`, no re-queue, no
//                  provider send ("must not retry a revoked/expired invitation" — packet §B4).
//     (Exhausted-but-live still resolves — GI-1 gates at redemption; a re-send is harmless.)
//   • Invitation state is never cached (GI-3 §5 — liveness re-checked through the contract on
//     every re-dispatch).
//
// MINIMAL FROZEN RETRY SLICE realized here (disclosed): the §HB-3.3 `failed → queued` CAS
// re-dispatch + its `[ESC-COMM-AUDIT]` System audit + the provider hand-off with the fresh URL —
// in ONE transaction (a transport throw rolls the requeue back; the row stays `failed`).
// NOT realized (stays frozen-contract scope, none of it needed by this guard): the
// `retry_delivery` POLICY retry/backoff budget + `RATE_LIMITED` exhaustion (the `[ESC-COMM-POLICY]`
// retry keys are marker-carried, NOT yet Doc-3-registered — no key may be invented, so no budget
// literal is enforceable here), `update_delivery_status` (provider callback),
// `create_delivery_record`/`get_delivery_status`, and any attempt counter (Doc-6H §3.3 declares
// no such column — not persistable without coining one).

import { prisma } from "@/shared/db";
import type { AppendAuditRecord, ReadOutboxEvent } from "@/modules/core/contracts";
import type { ResolveInvitationDeliveryPayload } from "@/modules/identity/contracts";
import {
  channelLogEntityType,
  isDeliveryChannel,
} from "../../domain/value-objects/delivery-channel";
import { DeliveryAuditAction } from "../../domain/audit-actions";
import { DeliveryDispatchErrorCode } from "../../domain/error-codes";
import { loadRow, requeueFailedRow } from "../../infrastructure/data/outbound-log.repository";
import type { DeliveryProviderTransport } from "../../infrastructure/delivery/delivery-provider";
import type {
  DeliveryDispatchError,
  RetryInvitationDeliveryInput,
  RetryInvitationDeliveryOutcome,
} from "../../contracts/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Injected services (by contract TYPE; concretes supplied by the contracts facade / Inngest). */
export interface RetryInvitationDeliveryDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10). */
  appendAuditRecord: AppendAuditRecord;
  /** The M0 persisted-envelope read (Doc-4B — the §2 `delivery_reference_id` recovery path). */
  readOutboxEvent: ReadOutboxEvent;
  /** `identity.resolve_invitation_delivery_payload.v1` (M6 sole caller — DH-1). */
  resolveDeliveryPayload: ResolveInvitationDeliveryPayload;
  /** The external provider transport seam (infra, replaceable — B2-4). */
  transport: DeliveryProviderTransport;
}

/** Private marker for an in-tx transport throw (maps to `DEPENDENCY`; rollback keeps `failed`). */
class ProviderTransportFailure extends Error {
  constructor(readonly cause: unknown) {
    super("Provider transport failed.");
    this.name = "ProviderTransportFailure";
  }
}

function err(
  errorClass: DeliveryDispatchError["errorClass"],
  errorCode: string,
  message: string,
  retryable: boolean,
): RetryInvitationDeliveryOutcome {
  return { ok: false, error: { errorClass, errorCode, message, retryable } };
}

/**
 * Retry ONE invitation-origin `failed` channel-log row, guard-first (§2). System-only (retry job).
 * Terminal outcomes leave the row `failed` and are never re-queued.
 */
export async function retryInvitationDeliveryWorkflow(
  input: RetryInvitationDeliveryInput,
  deps: RetryInvitationDeliveryDeps,
  db: typeof prisma = prisma,
): Promise<RetryInvitationDeliveryOutcome> {
  // (1) SYNTAX.
  if (typeof input.deliveryLogId !== "string" || !UUID_PATTERN.test(input.deliveryLogId)) {
    return err(
      "VALIDATION",
      DeliveryDispatchErrorCode.INVALID_EVENT,
      "delivery_log_id must be a UUID.",
      false,
    );
  }
  if (typeof input.channel !== "string" || !isDeliveryChannel(input.channel)) {
    return err(
      "VALIDATION",
      DeliveryDispatchErrorCode.INVALID_EVENT,
      "channel must be one of email, sms, whatsapp.",
      false,
    );
  }
  const channel = input.channel;

  // (2) REFERENCE (frozen §HB-3.3 stage 7): the record must exist.
  const row = await loadRow(channel, input.deliveryLogId, db);
  if (row === null) {
    return err(
      "REFERENCE",
      DeliveryDispatchErrorCode.RECORD_NOT_FOUND,
      "The delivery record does not exist.",
      false,
    );
  }

  // (3) Guard scope: invitation-origin rows only (identified by `source_event_id` — §2).
  if (row.sourceEventId === null) {
    return err(
      "VALIDATION",
      DeliveryDispatchErrorCode.INVALID_EVENT,
      "Not an invitation-origin delivery record.",
      false,
    );
  }

  // (4) STATE (frozen §HB-3.3 stage 6): only a `failed` record is retryable.
  if (row.status !== "failed") {
    return err(
      "STATE",
      DeliveryDispatchErrorCode.INVALID_STATE,
      "Only a failed delivery record can be retried.",
      false,
    );
  }

  // (5) GUARD leg 1 — recover `delivery_reference_id` from the PERSISTED M0 outbox envelope
  //     (Doc-4B read; never a new column, never an M1 table). An unrecoverable envelope is a
  //     PERMANENT classification: the row stays `failed`, no re-queue.
  const envelope = await deps.readOutboxEvent({ eventId: row.sourceEventId });
  const deliveryReferenceId = envelope?.payload["delivery_reference_id"];
  if (typeof deliveryReferenceId !== "string" || !UUID_PATTERN.test(deliveryReferenceId)) {
    return err(
      "REFERENCE",
      DeliveryDispatchErrorCode.INVALID_EVENT,
      "The originating event envelope is not recoverable.",
      false,
    );
  }

  // (6) GUARD leg 2 — re-resolve liveness through the contract (never cached).
  const resolved = await deps.resolveDeliveryPayload({ deliveryReferenceId });
  if (!resolved.ok) {
    if (resolved.error.errorClass === "DEPENDENCY") {
      // TRANSIENT — no state change; the retry job may try again under its budget.
      return err("DEPENDENCY", resolved.error.errorCode, resolved.error.message, true);
    }
    // NOT LIVE (revoked/expired/unknown — the reconciled §C13 register) → PERMANENT FAILURE:
    // the record STAYS `failed`, no re-queue, no provider send (§2 / packet §B4). Code passthrough.
    return err("REFERENCE", resolved.error.errorCode, resolved.error.message, false);
  }
  const payload = resolved.result;

  // (7) The minimal frozen retry slice — ONE transaction: CAS `failed → queued` + System audit +
  //     the provider hand-off with the FRESH signed URL (the stale one is never re-sent). A
  //     transport throw rolls everything back (the row stays `failed`; transient → retryable).
  try {
    await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

      const advanced = await requeueFailedRow(channel, row.id, tx);
      if (!advanced) {
        // Lost race (another worker advanced it) — CONFLICT, distinct from STATE (frozen H.4).
        throw new RequeueLostRace();
      }

      // `[ESC-COMM-AUDIT]` — System; `failed → queued`; NO recipient, NO URL (GI-3).
      await deps.appendAuditRecord(
        {
          actorId: null,
          actorType: "system",
          organizationId: null,
          entityType: channelLogEntityType(channel),
          entityId: row.id,
          action: DeliveryAuditAction.RETRIED,
          oldValue: { status: "failed" },
          newValue: { status: "queued", source_event_id: row.sourceEventId },
        },
        tx,
      );

      try {
        await deps.transport({
          channel,
          deliveryLogId: row.id,
          template: row.template,
          recipientIdentifier: payload.recipientIdentifier,
          signedInvitationUrl: payload.signedInvitationUrl, // FRESH — minted by THIS re-resolve
        });
      } catch (e) {
        throw new ProviderTransportFailure(e);
      }
    });
  } catch (e) {
    if (e instanceof RequeueLostRace) {
      return err(
        "CONFLICT",
        DeliveryDispatchErrorCode.CONFLICT,
        "The delivery record was advanced concurrently.",
        false,
      );
    }
    if (e instanceof ProviderTransportFailure) {
      return err(
        "DEPENDENCY",
        DeliveryDispatchErrorCode.PROVIDER_UNAVAILABLE,
        "The channel provider is transiently unavailable.",
        true,
      );
    }
    throw e;
  }

  return { ok: true, result: { deliveryLogId: row.id, channel, requeued: true } };
}

/** Private marker for a lost `failed → queued` CAS race. */
class RequeueLostRace extends Error {
  constructor() {
    super("Requeue lost a concurrency race.");
    this.name = "RequeueLostRace";
  }
}
