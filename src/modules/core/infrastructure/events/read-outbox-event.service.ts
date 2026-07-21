// M0 infrastructure — the persisted-envelope READ over `core.outbox_events` (Doc-4B — M0 owns the
// outbox; Doc-2 §10.1 row facts, nothing re-authored). W3-COMM-GRW-1 (B2-5) realizes the read leg
// the folded `Doc-4H_GrowthDelivery_Patch_v1.0.1` §2 BINDS TO Doc-4B by pointer: the M6 invitation
// retry guard "recover[s] the `delivery_reference_id` by re-reading the PERSISTED M0 outbox event
// payload for that `event_id` (Doc-4B) — never a new channel-log column, never an M1 table read."
// M6 consumes this ONLY via `@/modules/core/contracts` (One Module, One Owner) — this is M0 reading
// its OWN schema and exposing the envelope facts on its public surface. Read-only: no audit
// (§17.1), no event, no status advance (the §B6 workers own the lifecycle).
//
// RLS: `core.outbox_events` SELECT is platform-staff-only (`core_init` §7), so the read runs in its
// OWN short transaction under the transaction-local staff/System GUC (the resolve-token service-lane
// idiom — never session-global). The returned `payload` is the persisted `payload_jsonb` VERBATIM
// (the emitter's thin Doc-2 §8 payload + the stamped `event_id`/`occurred_at` envelope fields) —
// thin IDs only by the §16.5 rule; no recipient fact or token ever rides an envelope (GI-3).

import { prisma } from "../../../../shared/db";
import type { ReadOutboxEvent } from "../../contracts/services";
import type { PersistedOutboxEventRecord } from "../../contracts/types";

/**
 * Read one persisted outbox envelope by its `event_id` (= the `core.outbox_events.id` row key —
 * the write-service invariant). Returns `null` when no such envelope exists (e.g. archived away
 * under a retention policy that removes rows, or a foreign/unknown id) — the caller classifies.
 */
export const readOutboxEvent: ReadOutboxEvent = async (
  input,
): Promise<PersistedOutboxEventRecord | null> => {
  return prisma.$transaction(async (tx) => {
    // Service-lane context — transaction-local ONLY (never leaks past this read tx).
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const row = await tx.outboxEvent.findUnique({
      where: { id: input.eventId },
      select: {
        id: true,
        eventName: true,
        eventVersion: true,
        aggregateId: true,
        payloadJsonb: true,
      },
    });
    if (row === null) return null;

    return {
      eventId: row.id,
      eventName: row.eventName,
      eventVersion: row.eventVersion,
      aggregateId: row.aggregateId,
      payload: (row.payloadJsonb ?? {}) as Record<string, unknown>,
    };
  });
};
