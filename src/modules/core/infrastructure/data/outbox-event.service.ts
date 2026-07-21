// M0 infrastructure — realizes `core.write_outbox_event.v1` (Doc-4B §B10): inserts exactly one row into
// core.outbox_events (Doc-2 §10.1) with `status = 'pending'`, inside the CALLER's transaction (atomic with
// the caller's business write — §16.2). The row's `id` is a time-ordered UUIDv7, minted in-process via the
// shared ID generator (Doc-4B §8). This is the producer-emit twin of `core.append_audit_record.v1`; it is
// M0 writing its OWN schema (allowed) — other modules invoke it via the contract surface only.
//
// COINS NO EVENT (Doc-4B §B10 Ownership/validation): the owning (emitting) module supplies an `event_name`
// that MUST exist in Doc-2 §8 (§16.4/§16.6); this primitive persists the row STRUCTURALLY and does NOT
// validate the catalog or business semantics. A non-existent event name is a caller-side conformance
// failure (escalation), never a runtime invention here.
//
// NON-RETURNING (mirrors audit-record.service.ts): we use `createMany` (NOT `create`), so the INSERT
// carries NO `RETURNING` clause. `core.outbox_events` SELECT is platform-staff-only (`outbox_events_platform_staff`,
// core_init); a `RETURNING` under a non-staff caller could abort with SQLSTATE 42501 (the audit-twin
// pitfall). `id` is minted app-side so no DB-returned key is needed. Do NOT revert to `create()`.
//
// NO SECURITY DEFINER + no output (owner ruling 2026-07-12, [ESC-CORE-OUTBOX-MECH] Q1/Q2/Q3): the no-SD
// caller-context INSERT is the canonical mechanism for ALL M0 append primitives; the frozen §B10 contract
// declares no Response, so this returns void. RLS admission: the runtime emit rides the privileged app
// connection (RLS = defense-in-depth backstop, not the model — CLAUDE.md §2); the staff-GUC leg admits an
// in-band staff/System write under `outbox_events_platform_staff`. A tenant-admitting INSERT `WITH CHECK`
// policy on `core.outbox_events` (Doc-6B additive patch — backstop parity for tenant-context emitters such
// as `billing.purchase_subscription`) is DEFERRED by owner decision 2026-07-22; until it lands, the
// restricted-role RLS backstop rejects a direct tenant-context outbox INSERT (fail-closed).

import { prisma, Prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { CoreServiceExecutor, WriteOutboxEvent } from "../../contracts/services";
import { CoreServiceError, type WriteOutboxEventInput } from "../../contracts/types";

async function write(input: WriteOutboxEventInput, db: DbExecutor): Promise<void> {
  const outboxEventId = uuidv7();
  try {
    // `createMany` (single-row) emits a NON-`RETURNING` INSERT — see the NON-RETURNING note above.
    // Exactly one row with the frozen Doc-2 §10.1 columns; `status`/`attempts` set explicitly (they also
    // carry DB defaults). Delivery is asynchronous via the dispatcher (§B6).
    await db.outboxEvent.createMany({
      data: [
        {
          id: outboxEventId,
          aggregateId: input.aggregateId,
          eventName: input.eventName,
          eventVersion: input.eventVersion,
          payloadJsonb: input.payload as Prisma.InputJsonValue,
          status: "pending",
          attempts: 0,
        },
      ],
    });
  } catch (cause) {
    // Doc-4B §B10: Error → `core_outbox_write_failed` (SYSTEM). The throw rolls the CALLER's transaction
    // back — the business write cannot commit without its outbox row (§16.2 atomicity). Preserve the
    // underlying DB fault as `cause`.
    throw new CoreServiceError(
      "core_outbox_write_failed",
      "core.write_outbox_event.v1: the outbox-row INSERT failed; the caller's transaction is rolled back.",
      { cause },
    );
  }
}

/**
 * Write one `core.outbox_events` row (Doc-4B §B10 / Doc-2 §10.1). Runs on the supplied transaction
 * executor when present (the emit is atomic with the caller's business write — Doc-4B §16.2); otherwise
 * on the shared client. Returns void — the frozen §B10 contract declares no Response.
 */
export const writeOutboxEvent: WriteOutboxEvent = (input, executor?: CoreServiceExecutor) =>
  write(input, (executor as DbExecutor | undefined) ?? prisma);
