// M0 infrastructure (PRIVATE) — the transactional-outbox Phase-2 workers (`core.outbox_events`).
//
// Realizes the two Doc-4B §B6 System/Phase-2 worker contracts VERBATIM:
//   • `core.phase2_dispatch_outbox_events.v1`   — `pending → dispatched`, with retry+backoff,
//                                                 dead-letter park, and the reconciliation sweep.
//   • `core.phase2_archive_dispatched_events.v1`— `dispatched → archived`, retention-bounded.
// DISPATCH MECHANICS + the [D-5] audit leg. The mechanics are unchanged (byte-for-byte); on top, each
// worker appends ONE System-attributed immutable audit record per run that ADVANCED ≥ 1 row — per-run/
// batch granularity (Doc-4B_OutboxAuditToken_Patch_v1.0 / BOARD-DECISION-D5-OUTBOX-AUDIT_v1.1, realizing
// [D-5] Legs 3 (dispatch success) + 5 (archive); Leg 2 folds into the advance; Legs 1 (created) + 4
// (dead-letter park) are CARRIED, not written). The audit is `core.append_audit_record.v1` on the
// worker's OWN transaction (atomic with the advances — D7 rule 5: an append failure rolls the advances
// back). An empty pass (0 advances) writes NO record (noise rule); dead-letter/reconciliation counts are
// §B6/§17.1 operational telemetry, never audited. The forward-only status trigger
// (`core.outbox_status_forward_only`, Doc-6B §4.1) enforces the legal transition at the DB; this code
// only advances rows along it. M0 reads/writes its OWN `core` schema (One Module, One Owner).
//
// TRANSPORT, NEVER AUTHOR (§B6 Events-Produced: none): the dispatcher DELIVERS existing outbox
// envelopes; it coins NO domain event (Doc-2 §8 / Doc-4J catalog / Doc-4L flow untouched). The
// observable delivery is the status transition `pending → dispatched` (the dedup guard: a row already
// `dispatched` is never re-processed). EMITTER-AGNOSTIC (R-a / ESC-W1-OUTBOX): it advances whatever
// `pending` rows exist — test-seeded now, real write-plus-emit rows in Wave 2 — identically.
//
// SYSTEM/PLATFORM-STAFF ACTOR (§B6 Actor: System): each worker opens its OWN transaction and sets
// `app.is_platform_staff = 'true'` TRANSACTION-LOCAL (`set_config(.,.,true)` — WP-1.3/1.4 GUC pattern)
// so the Doc-6B §2.2 platform-staff RLS backstop admits the read/write; the GUC never leaks past the
// transaction (no pooled-connection bleed, never session-global). The P2-A1 TRANSPORT path splits the
// dispatch pass into SEVERAL SHORT transactions (read page → per-row mark/bump → run audit), each
// setting the same transaction-local GUC — NO network send ever runs inside a DB transaction
// (L-A2-MAJOR-1); the status-only path keeps its original single transaction.
//
// POLICY-BOUNDED, NEVER LITERAL (Doc-4A §18.2): max attempts, retry backoff, dead-letter policy, and
// archive retention are read from `core.system_configuration` via the W2-CORE-1 service
// `core.config_value_query.v1` (Doc-4B §B8) — see `outbox-policy.ts`. No bound is hardcoded.

import { prisma } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type {
  OutboxArchiveInput,
  OutboxArchiveResult,
  OutboxDispatchDeps,
  OutboxDispatchInput,
  OutboxDispatchResult,
} from "../../contracts/types";
// Same-module infra wiring (events/ → data/), the outbox-policy → system-configuration precedent: the
// M0 audit-append impl is imported DIRECTLY (not via `../../contracts`) to avoid the
// contracts→infrastructure→contracts import cycle. Still `core.append_audit_record.v1` — the one append.
import { appendAuditRecord } from "../data/audit-record.service";
import {
  OUTBOX_ARCHIVE_RUN_ENTITY_TYPE,
  OUTBOX_DISPATCH_RUN_ENTITY_TYPE,
  OutboxAuditAction,
} from "../../domain/audit-actions";
import {
  isBackoffElapsed,
  readOutboxArchiveRetentionMs,
  readOutboxDispatchPolicy,
} from "./outbox-policy";

/** Options for the legacy combined drain pass (Doc-8B §7.2; kept for backward-compatible callers). */
export interface DrainOutboxOptions {
  /** Cap on rows processed per leg in one pass (a poll batch). Defaults to a bounded batch. */
  batchSize?: number;
  /**
   * Run the distinct archival leg (`dispatched → archived`) this pass. Doc-4B §B6 makes archival a
   * SEPARATE retention-bounded worker; the minimal per-pass obligation is dispatch, so archival is
   * opt-in here (default off).
   */
  archive?: boolean;
}

/** Result of one legacy combined drain pass (mechanical counters only — Doc-8B §7.2). */
export interface DrainOutboxResult {
  /** Rows advanced `pending → dispatched` this pass. */
  dispatched: number;
  /** Rows advanced `dispatched → archived` this pass (the distinct archival leg). */
  archived: number;
  /** `pending` rows parked at `attempts >= max` this pass (dead-lettered; retained, never dropped). */
  skippedMaxAttempts: number;
}

const DEFAULT_BATCH_SIZE = 100 as const;

/**
 * `core.phase2_dispatch_outbox_events.v1` (Doc-4B §B6) — advance re-attempt-eligible `pending` rows to
 * `dispatched`, with retry+backoff, dead-letter park, and reconciliation. Runs as the System/platform-
 * staff actor in its OWN transaction. Idempotent (the `pending` source-status filter is the dedup
 * guard); forward-only (DB-trigger-enforced). Delivery is the status transition; coins no event.
 *
 * Retry/backoff (§B6): a `pending` row that has been re-attempted `attempts` times is only re-attempted
 * once its `core.outbox_dispatch_backoff` delay has elapsed since `updated_at`; otherwise it is left
 * `pending` (counted `skippedBackoff`). Each advance bumps `attempts` (Doc-2 §10.1).
 *
 * Dead-letter (§B6 — "never silently drop"): rows at `attempts >= core.outbox_dispatch_max_attempts`
 * are PARKED — retained `pending` with attempts at the ceiling, never advanced or deleted — and counted
 * `deadLettered` per `core.outbox_dlq_policy` (the ops-telemetry alert surface).
 *
 * Reconciliation (§B6): `pending` rows stuck beyond the expected dispatch latency (the backoff cap)
 * with `attempts` in `[1, max)` are counted `reconciledStuck` — flagged for the next tick / alerted;
 * operational telemetry, not a business audit action (§17.1). No new entity or state is introduced.
 *
 * TRANSPORT LEG (P2-A1 — the injected consumer-transport seam): when `deps.transport` is present,
 * each eligible envelope is FORWARDED first and the row is advanced `pending → dispatched` only on
 * a resolved send (SEND-THEN-MARK, per event, at-least-once: a send that lands but whose mark is
 * lost is re-sent next drain — consumers dedup on `event_id`). A transport THROW leaves the row
 * `pending` with `attempts` bumped, so the §B6 backoff/dead-letter machinery governs the retry
 * cadence and ceiling; the row is never dropped. With NO transport the historical status-only
 * advance is preserved byte-for-byte (backward compatible). The concrete transport is constructed
 * by the inngest layer and injected here — M0 never imports inngest (One Module, One Owner).
 *
 * NO NETWORK I/O INSIDE A DB TRANSACTION (L-A2-MAJOR-1): the transport path is structured as
 * (1) one SHORT read transaction (policy + telemetry counts + the candidate page), (2) per-event
 * sends OUTSIDE any transaction, each followed by its own SHORT per-row mark/bump transaction,
 * (3) the [D-5] run audit in its own short transaction. A slow/unavailable broker therefore can
 * never time out and roll back committed marks/bumps (which would re-send already-sent events
 * unboundedly and freeze the attempts counter below the dead-letter ceiling), and no DB
 * connection is held across network I/O. Per-row outcomes are ISOLATED: one row's send failure
 * never entangles another row's committed advance.
 */
export async function dispatchOutboxEvents(
  options: OutboxDispatchInput = {},
  deps: OutboxDispatchDeps = {},
): Promise<OutboxDispatchResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const transport = deps.transport;
  return transport === undefined
    ? dispatchStatusOnly(batchSize)
    : dispatchViaTransport(batchSize, transport);
}

/**
 * The historical status-only dispatch pass (no transport injected) — the pre-P2 behavior preserved
 * byte-identically INSIDE its original single worker transaction (advances + the in-tx [D-5] audit
 * are atomic — D7 rule 5). Backward compatible for every existing caller.
 */
async function dispatchStatusOnly(batchSize: number): Promise<OutboxDispatchResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const { maxAttempts, backoff, dlqPolicy } = await readOutboxDispatchPolicy(tx);
    const now = new Date();

    // Dead-letter backlog (§B6): pending rows that have exhausted the retry ceiling. Parked — never
    // advanced, never dropped; the count IS the alert surface (per core.outbox_dlq_policy).
    const deadLettered = await tx.outboxEvent.count({
      where: { status: "pending", attempts: { gte: maxAttempts } },
    });

    // Reconciliation (§B6): pending rows stuck beyond the expected dispatch latency (backoff cap) while
    // still under the ceiling — lagging retries the next tick re-attempts once their backoff elapses.
    const stuckBefore = new Date(now.getTime() - backoff.capMs);
    const reconciledStuck = await tx.outboxEvent.count({
      where: {
        status: "pending",
        attempts: { gte: 1, lt: maxAttempts },
        createdAt: { lt: stuckBefore },
      },
    });

    // Advancement candidates: pending, under the retry ceiling, oldest-first (serves the
    // (status, created_at) poll index). Backoff eligibility is a per-row check below.
    const candidates = await tx.outboxEvent.findMany({
      where: { status: "pending", attempts: { lt: maxAttempts } },
      orderBy: { createdAt: "asc" },
      take: batchSize,
      select: { id: true, attempts: true, updatedAt: true },
    });

    let dispatched = 0;
    let skippedBackoff = 0;
    for (const row of candidates) {
      if (!isBackoffElapsed(backoff, row.attempts, row.updatedAt, now)) {
        // Re-attempt backoff not yet elapsed — leave pending for a later tick.
        skippedBackoff += 1;
        continue;
      }
      // Forward-only `pending → dispatched` under a WRITE-TIME compare-and-set on source status: the
      // §B6 status-transition dedup guard is enforced at the WRITE, not only at SELECT. A row already
      // advanced by a concurrent pass between our select and this write matches zero rows here — a
      // 0-count no-op, never a same-state `dispatched → dispatched` re-advance (which the forward-only
      // trigger admits as idempotent) that would double-bump `attempts`, overwrite `dispatched_at`
      // (the archival-retention anchor), or double-count. Operational columns only (status/
      // dispatched_at/attempts/updated_at) — payload columns stay immutable. Counting the returned
      // `.count` keeps `dispatched` truthful under a lost race.
      const advanced = await tx.outboxEvent.updateMany({
        where: { id: row.id, status: "pending" },
        data: { status: "dispatched", dispatchedAt: now, attempts: { increment: 1 } },
      });
      if (advanced.count === 1) {
        dispatched += 1;
      }
    }

    // [D-5] audit leg — run/batch granularity (Doc-4B_OutboxAuditToken_Patch_v1.0 / BOARD-DECISION-D5-
    // OUTBOX-AUDIT_v1.1). ONE System-attributed immutable audit record per dispatch run that ADVANCED
    // ≥ 1 row (`pending → dispatched`, the §B6 Mutation-Scope; Leg 2 folded into this advance), on THIS
    // worker's own tx so it is atomic with the advances (D7 rule 5 — an append failure rolls the
    // advances back; a committed run carries its audit). Noise rule: an empty pass writes NO record, and
    // `deadLettered`/`reconciledStuck` are §B6/§17.1 telemetry, NOT a business audit action — never
    // audited. `entity_id` is a fresh per-run UUIDv7 correlation id (the audited unit is the run, not a
    // row); the platform-staff GUC set above admits the System `audit_records_context_append` leg.
    if (dispatched >= 1) {
      await appendAuditRecord(
        {
          actorType: "system",
          actorId: null,
          organizationId: null,
          entityType: OUTBOX_DISPATCH_RUN_ENTITY_TYPE,
          entityId: uuidv7(),
          action: OutboxAuditAction.DISPATCHED,
          oldValue: null,
          newValue: { dispatched, batchSize },
        },
        tx,
      );
    }

    return { dispatched, deadLettered, skippedBackoff, reconciledStuck, dlqPolicy };
  });
}

/** The candidate-row shape the transport path carries between its phases. */
interface TransportCandidateRow {
  id: string;
  attempts: number;
  updatedAt: Date;
  eventName: string;
  eventVersion: number;
  payload: Record<string, unknown>;
}

/**
 * The P2-A1 transport dispatch pass — SEND-THEN-MARK with NO network I/O inside any DB transaction
 * (L-A2-MAJOR-1). Three phases:
 *
 *   1. One SHORT read transaction (staff GUC, transaction-local): policy + the §B6 dead-letter /
 *      reconciliation telemetry counts + the candidate page (same predicate/order/take as the
 *      status-only path, plus the envelope columns the transport needs).
 *   2. OUTSIDE any transaction, per eligible row (same backoff-window filter): forward the envelope
 *      via the transport. Success → a SHORT per-row transaction performing the same forward-only
 *      compare-and-set mark (`pending → dispatched`; a row advanced by a concurrent pass between
 *      the phase-1 select and this write — or between the send and this write — matches zero rows:
 *      the duplicate send is the bounded at-least-once cost, the mark never double-advances).
 *      Throw → a SHORT per-row transaction bumping `attempts` under the same `pending` status guard
 *      (same-state update — trigger-admitted) so the §B6 backoff/dead-letter policy governs the
 *      retry; the row is never dropped. Per-row transactions ⇒ per-row ISOLATION: one row's broker
 *      failure can never roll back another row's committed advance, and a broker outage still
 *      advances `attempts` toward the dead-letter ceiling.
 *   3. The [D-5] run audit (ONE System record per run that advanced ≥ 1 row) in its own short
 *      transaction after the loop. [Logged judgment call — L-A2-MAJOR-1 consequence: with per-row
 *      marks, run-level atomicity of audit-with-advances is structurally impossible; the D5
 *      run/batch granularity and the noise rule are preserved, and an append failure still throws
 *      (surfaced to the job runner) — it can no longer roll back the already-committed advances.]
 *
 * Counters keep the exact `OutboxDispatchResult` shape (a failed send is simply not counted
 * `dispatched`). Envelope facts reach the warn log by id/name ONLY — never the payload.
 */
async function dispatchViaTransport(
  batchSize: number,
  transport: NonNullable<OutboxDispatchDeps["transport"]>,
): Promise<OutboxDispatchResult> {
  // ── Phase 1 — short read tx: policy + telemetry counts + the candidate page. ──
  // (`maxAttempts` is fully applied by the phase-1 candidate predicate — not needed in phase 2.)
  const { backoff, dlqPolicy, deadLettered, reconciledStuck, candidates, now } =
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

      const policy = await readOutboxDispatchPolicy(tx);
      const readNow = new Date();

      // Dead-letter backlog (§B6): parked rows at the ceiling — retained, never dropped; the count
      // IS the alert surface (per core.outbox_dlq_policy).
      const parked = await tx.outboxEvent.count({
        where: { status: "pending", attempts: { gte: policy.maxAttempts } },
      });

      // Reconciliation (§B6): pending rows stuck beyond the expected dispatch latency (backoff cap)
      // while still under the ceiling.
      const stuckBefore = new Date(readNow.getTime() - policy.backoff.capMs);
      const stuck = await tx.outboxEvent.count({
        where: {
          status: "pending",
          attempts: { gte: 1, lt: policy.maxAttempts },
          createdAt: { lt: stuckBefore },
        },
      });

      // Advancement candidates: same predicate/order/take as the status-only path; the envelope
      // columns ride along for the transport. Backoff eligibility is the per-row phase-2 check.
      const rows = await tx.outboxEvent.findMany({
        where: { status: "pending", attempts: { lt: policy.maxAttempts } },
        orderBy: { createdAt: "asc" },
        take: batchSize,
        select: {
          id: true,
          attempts: true,
          updatedAt: true,
          eventName: true,
          eventVersion: true,
          payloadJsonb: true,
        },
      });

      const page: TransportCandidateRow[] = rows.map((row) => ({
        id: row.id,
        attempts: row.attempts,
        updatedAt: row.updatedAt,
        eventName: row.eventName,
        eventVersion: row.eventVersion,
        // The persisted payload_jsonb is an object by construction (the producer spreads the
        // caller's thin payload then stamps the envelope fields) — narrow structurally.
        payload: (row.payloadJsonb ?? {}) as Record<string, unknown>,
      }));

      return {
        backoff: policy.backoff,
        dlqPolicy: policy.dlqPolicy,
        deadLettered: parked,
        reconciledStuck: stuck,
        candidates: page,
        now: readNow,
      };
    });

  // ── Phase 2 — per-event send OUTSIDE any tx; short per-row mark/bump transactions. ──
  let dispatched = 0;
  let skippedBackoff = 0;
  for (const row of candidates) {
    if (!isBackoffElapsed(backoff, row.attempts, row.updatedAt, now)) {
      // Re-attempt backoff not yet elapsed — leave pending for a later tick.
      skippedBackoff += 1;
      continue;
    }

    try {
      await transport({
        eventId: row.id,
        eventName: row.eventName,
        eventVersion: row.eventVersion,
        payload: row.payload,
      });
    } catch (e) {
      // Send failed → SHORT per-row tx: bump `attempts` under the `pending` status guard (a row
      // advanced concurrently is left alone). The row stays `pending` for a later drain under the
      // §B6 backoff/dead-letter policy. Log id/name only — never the payload.
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
        await tx.outboxEvent.updateMany({
          where: { id: row.id, status: "pending" },
          data: { attempts: { increment: 1 } },
        });
      });
      console.warn(
        `outbox dispatch: transport send failed for event ${row.id} (${row.eventName}); row left pending for retry.`,
        e instanceof Error ? e.message : e,
      );
      continue;
    }

    // Send resolved → SHORT per-row tx: the same forward-only compare-and-set advance as the
    // status-only path (0-count no-op under a lost race keeps `dispatched` truthful).
    const advanced = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
      return tx.outboxEvent.updateMany({
        where: { id: row.id, status: "pending" },
        data: { status: "dispatched", dispatchedAt: now, attempts: { increment: 1 } },
      });
    });
    if (advanced.count === 1) {
      dispatched += 1;
    }
  }

  // ── Phase 3 — the [D-5] run audit (run/batch granularity; noise rule: empty pass = no record). ──
  if (dispatched >= 1) {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
      await appendAuditRecord(
        {
          actorType: "system",
          actorId: null,
          organizationId: null,
          entityType: OUTBOX_DISPATCH_RUN_ENTITY_TYPE,
          entityId: uuidv7(),
          action: OutboxAuditAction.DISPATCHED,
          oldValue: null,
          newValue: { dispatched, batchSize },
        },
        tx,
      );
    });
  }

  return { dispatched, deadLettered, skippedBackoff, reconciledStuck, dlqPolicy };
}

/**
 * `core.phase2_archive_dispatched_events.v1` (Doc-4B §B6) — advance `dispatched` rows whose
 * `dispatched_at` is older than `core.outbox_archive_retention` to `archived` (the distinct, retention-
 * bounded archival worker). System/platform-staff actor, own transaction. Idempotent (the `dispatched`
 * source-status filter guards); forward-only. A fresher `dispatched` row inside the retention window is
 * left untouched (§B6 Request Contract). Coins no event.
 */
export async function archiveDispatchedEvents(
  options: OutboxArchiveInput = {},
): Promise<OutboxArchiveResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const retentionMs = await readOutboxArchiveRetentionMs(tx);
    const archiveBefore = new Date(Date.now() - retentionMs);

    const toArchive = await tx.outboxEvent.findMany({
      where: { status: "dispatched", dispatchedAt: { lt: archiveBefore } },
      orderBy: { createdAt: "asc" },
      take: batchSize,
      select: { id: true },
    });

    let archived = 0;
    for (const row of toArchive) {
      // Compare-and-set on source status (`dispatched`): a row already archived by a concurrent pass
      // between our select and this write matches zero rows — a 0-count no-op, so `archived` stays
      // truthful under a lost race (never a same-state `archived → archived` re-count).
      const advanced = await tx.outboxEvent.updateMany({
        where: { id: row.id, status: "dispatched" },
        data: { status: "archived" },
      });
      if (advanced.count === 1) {
        archived += 1;
      }
    }

    // [D-5] audit leg — run/batch granularity (Doc-4B_OutboxAuditToken_Patch_v1.0 / BOARD-DECISION-D5-
    // OUTBOX-AUDIT_v1.1). ONE System-attributed immutable audit record per archival run that ADVANCED
    // ≥ 1 row (`dispatched → archived`, the §B6 Mutation-Scope), atomic on this worker's own tx (D7 rule
    // 5). Empty pass → NO record (noise rule). Same posture as the dispatch leg above.
    if (archived >= 1) {
      await appendAuditRecord(
        {
          actorType: "system",
          actorId: null,
          organizationId: null,
          entityType: OUTBOX_ARCHIVE_RUN_ENTITY_TYPE,
          entityId: uuidv7(),
          action: OutboxAuditAction.ARCHIVED,
          oldValue: null,
          newValue: { archived, batchSize },
        },
        tx,
      );
    }

    return { archived };
  });
}

/**
 * Legacy combined drain pass — kept so existing callers (the Inngest job, WP-1.8 observer) keep a
 * stable entry point. Runs the §B6 dispatch worker, then (when `options.archive`) the retention-bounded
 * archival worker, and maps their counters to the historical `DrainOutboxResult` shape. Passes the
 * optional P2-A1 transport deps through to the dispatch worker (absent = legacy status-only behavior).
 */
export async function drainOutbox(
  options: DrainOutboxOptions = {},
  deps: OutboxDispatchDeps = {},
): Promise<DrainOutboxResult> {
  const dispatch = await dispatchOutboxEvents({ batchSize: options.batchSize }, deps);
  const archived = options.archive
    ? (await archiveDispatchedEvents({ batchSize: options.batchSize })).archived
    : 0;
  return {
    dispatched: dispatch.dispatched,
    archived,
    skippedMaxAttempts: dispatch.deadLettered,
  };
}
