// M0 infrastructure — realizes `core.write_outbox_event.v1` (Doc-4B): appends exactly one
// `pending` envelope row to `core.outbox_events` (Doc-2 §10.1). This is M0 writing its OWN schema
// (allowed); emitting modules invoke it via the contract surface, injected by TYPE — never a raw
// cross-schema INSERT (One Module, One Owner). M0 TRANSPORTS the envelope and authors NO event:
// the name/version/payload are the emitting module's frozen Doc-2 §8 declaration (catalog =
// Doc-4J), bound by pointer.
//
// ATOMICITY (load-bearing — Doc-6A §7.1 write+emit): the append MUST ride the CALLER'S transaction
// (business write + event insert in ONE txn); callers therefore pass their transaction executor.
// The row `id` is a time-ordered UUIDv7 minted in-process (Doc-4B §8) and doubles as the envelope
// `event_id`; `occurred_at` is stamped here so every persisted payload carries the Doc-2 §8
// envelope fields without the caller restating them. Dispatch/архival is the SEPARATE Doc-4B §B6
// worker surface (`drain-outbox.service.ts`) — this service only appends `pending`.
//
// NON-RETURNING / VALUE-LESS (the audit-record.service precedent): the write goes through the
// M0-owned SECURITY DEFINER function `core.write_outbox_event(...)` (`RETURNS void` — the
// `allocate_human_ref` precedent; migration `20260711180000_core_write_outbox_event`, landed with
// W3-BILL-4). `core.outbox_events` SELECT is platform-staff-only RLS (`core_init` §7); the id is
// app-minted, so no DB-returned key is needed.
//
// RLS ADMISSION [growth/integration MERGE UNION]: Lane A's original Prisma-insert adapter carried a
// flagged judgment call — the direct-table platform-staff FOR-ALL policy admits only the
// staff/System GUC leg, so producers had to escalate transaction-locally. The W3-BILL-4 SECURITY
// DEFINER function IS the sanctioned privileged write path (a tenant-context emitter, e.g.
// `billing.purchase_subscription` under `withActiveOrg`, inserts inside its own txn without the
// direct-table RLS rejecting it); the merge binds this adapter to it, uniting Lane A's envelope
// stamping with billing's admission mechanism. The broader ADR-021-class INSERT-policy question
// stays the escalated Board item (routing doc "Blocked-until" list) — never resolved locally here.

import { prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { WriteOutboxEvent, CoreServiceExecutor } from "../../contracts/services";
import type { WriteOutboxEventInput } from "../../contracts/types";

async function append(input: WriteOutboxEventInput, db: DbExecutor): Promise<{ eventId: string }> {
  const eventId = uuidv7(); // M0 ID generator (Doc-4B §8) — never a raw UUID in app code.

  // The persisted payload = the Doc-2 §8 envelope (event_id + occurred_at) + the caller's thin
  // domain payload (IDs + metadata only — §16.5; the caller's declaration owns the field set).
  // Envelope LAST so the caller's payload can never clobber the stamped envelope fields
  // (`event_id === row id` is the consumer dedup invariant).
  const payloadJsonb = {
    ...input.payload,
    event_id: eventId,
    occurred_at: new Date().toISOString(),
  };

  // The frozen function signature is core.write_outbox_event(uuid, text, integer, uuid, jsonb) —
  // the payload is passed as a JSON string cast to jsonb (never string-interpolated).
  // `$executeRawUnsafe` (not `$queryRawUnsafe`) because the function RETURNS void — nothing to
  // deserialize. status stays `pending` (DB default — Doc-2 §10.1; the §B6 worker advances it).
  await db.$executeRawUnsafe(
    "SELECT core.write_outbox_event($1::uuid, $2, $3::integer, $4::uuid, $5::jsonb)",
    eventId,
    input.eventName,
    input.eventVersion,
    input.aggregateId ?? null,
    JSON.stringify(payloadJsonb),
  );

  return { eventId };
}

/**
 * Append one `pending` outbox envelope (Doc-4B `core.write_outbox_event.v1` / Doc-2 §10.1). Runs
 * on the supplied transaction executor when present (write+emit atomic — Doc-6A §7.1); otherwise
 * on the shared client (an out-of-txn append is legal only where no business write accompanies it).
 */
export const writeOutboxEvent: WriteOutboxEvent = (input, executor?: CoreServiceExecutor) =>
  append(input, (executor as DbExecutor | undefined) ?? prisma);
