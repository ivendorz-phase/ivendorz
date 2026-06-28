// M0 infrastructure (PRIVATE) — the transactional-outbox drainer (`core.outbox_events`).
//
// Realizes the Doc-8B §7.2 outbox observer/drainer "dispatch tick" (`pending → dispatched`) and the
// DISTINCT archival leg (`dispatched → archived`, POLICY-bounded by `core.outbox_archive_retention`),
// over the Doc-6B §3.2 `core.outbox_events` table. The forward-only status trigger
// (`core.outbox_status_forward_only`, Doc-6B §4.1) enforces the legal transition at the DB; this code
// only advances rows along it. M0 is reading/writing its OWN `core` schema (One Module, One Owner) —
// no cross-module/cross-schema access.
//
// EMITTER-AGNOSTIC (R-a / ESC-W1-OUTBOX §7): the drainer drains whatever `pending` rows EXIST. It does
// not know — and must not care — how a row got there: a test-seeded fixture now, a real write-plus-emit
// row from a Wave-2 business module later. There is NO "synthetic" special-case. This implementation
// stays IDENTICAL when real emitters arrive in Wave 2 (R-a binding condition #2); only the row's origin
// differs. The drainer COINS NO domain event (Doc-2 §8 / Doc-4J catalog / Doc-4L flow are untouched).
//
// SYSTEM/PLATFORM-STAFF ACTOR: `core.outbox_events` carries the platform-staff RLS backstop (Doc-6B §2.2)
// — its policy USING-clause is `current_setting('app.is_platform_staff', true)::boolean IS TRUE`. The
// drainer runs as the System actor, so it sets `app.is_platform_staff = 'true'` TRANSACTION-LOCAL
// (`set_config(.,.,true)` — the WP-1.3/1.4 GUC pattern). The GUC is scoped to the drain transaction and
// discarded at commit/rollback; it NEVER leaks to a pooled-connection's next request (no privilege bleed),
// and is NEVER set session-global.
//
// IDEMPOTENT: the dispatch leg selects only `status = 'pending'` rows; a row already `dispatched` is not
// re-processed (a re-run drains nothing new). The archival leg selects only `status = 'dispatched'` rows.
// `attempts` bumps on each dispatch; rows that exceed `core.outbox_dispatch_max_attempts` are skipped
// (left for the DLQ policy / a later wave — Doc-6B §3.2; not deleted here).

import { prisma, type DbExecutor } from "../../../../shared/db";

/** The registered POLICY key bounding dispatch retries (Doc-3 v1.0; Doc-6B §3.2). Bound by pointer. */
const OUTBOX_DISPATCH_MAX_ATTEMPTS_KEY = "core.outbox_dispatch_max_attempts" as const;

/** Conservative fallback if the POLICY row is missing (the seed guarantees it — Doc-6B §5.2). */
const DEFAULT_MAX_ATTEMPTS = 1 as const;

/** Outcome of one drain pass (mechanical counters only — no domain semantics). */
export interface DrainOutboxResult {
  /** Rows advanced `pending → dispatched` this pass. */
  dispatched: number;
  /** Rows advanced `dispatched → archived` this pass (the distinct archival leg). */
  archived: number;
  /** `pending` rows skipped because `attempts >= maxAttempts` (left for the DLQ policy). */
  skippedMaxAttempts: number;
}

export interface DrainOutboxOptions {
  /**
   * Cap on rows processed per leg in one pass (a poll batch). The dispatcher poll index
   * `(status, created_at)` (Doc-6B §3.2) orders the scan oldest-first. Defaults to a bounded batch.
   */
  batchSize?: number;
  /**
   * Run the distinct archival leg (`dispatched → archived`) this pass. Doc-8B §7.2 makes archival a
   * SEPARATE POLICY-bounded step from dispatch; the minimal Wave-1 obligation is the dispatch leg, so
   * archival is opt-in (default off). When real retention scheduling lands it can flip on.
   */
  archive?: boolean;
}

const DEFAULT_BATCH_SIZE = 100 as const;

/** Read `core.outbox_dispatch_max_attempts` from the POLICY store (never a literal — Doc-6A §10.2). */
async function readMaxAttempts(db: DbExecutor): Promise<number> {
  const row = await db.systemConfiguration.findUnique({
    where: { key: OUTBOX_DISPATCH_MAX_ATTEMPTS_KEY },
    select: { valueJsonb: true },
  });
  const raw = row?.valueJsonb;
  // The seed stores the integer value as a bare JSON number (Doc-6B §5.2 / migration seed).
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0) return raw;
  return DEFAULT_MAX_ATTEMPTS;
}

/**
 * Drain the M0 transactional outbox in one mechanical pass, as the System/platform-staff actor.
 *
 * Dispatch leg (always): advances each `pending` row whose `attempts < maxAttempts` to `dispatched`,
 * stamping `dispatched_at` and bumping `attempts` (the forward-only trigger enforces the transition).
 * Archival leg (when `options.archive`): advances `dispatched` rows to `archived` (distinct step).
 *
 * Idempotent: re-running drains nothing already advanced (each leg filters on its source status).
 * Boundary: touches ONLY `core.*` (its own schema). Coins NO domain event.
 *
 * The drainer ALWAYS opens its OWN transaction: the platform-staff GUC must be transaction-local to the
 * drain (no session/connection bleed), so it deliberately does not join a caller's transaction.
 *
 * @param options batch size + whether to run the archival leg this pass.
 */
export async function drainOutbox(options: DrainOutboxOptions = {}): Promise<DrainOutboxResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const runArchive = options.archive ?? false;

  // One transaction so the platform-staff GUC is transaction-LOCAL to this drain (no session bleed).
  return prisma.$transaction(async (tx) => {
    // System/platform-staff actor — satisfies the Doc-6B §2.2 platform-staff RLS backstop. Set
    // transaction-local (`set_config(.,.,true)`) so it never leaks (WP-1.3/1.4 pattern).
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const maxAttempts = await readMaxAttempts(tx);

    // ── Dispatch leg: pending → dispatched (the Doc-8B §7.2 "dispatch tick"). ──
    const pending = await tx.outboxEvent.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" }, // oldest-first; serves the (status, created_at) poll index
      take: batchSize,
      select: { id: true, attempts: true },
    });

    let dispatched = 0;
    let skippedMaxAttempts = 0;
    for (const row of pending) {
      if (row.attempts >= maxAttempts) {
        // Exhausted retries — leave for the DLQ policy (`core.outbox_dlq_policy`); never deleted.
        skippedMaxAttempts += 1;
        continue;
      }
      // Forward-only `pending → dispatched`; the trigger blocks any illegal transition. Operational
      // fields only (status/dispatched_at/attempts/updated_at) — the payload columns stay immutable.
      await tx.outboxEvent.update({
        where: { id: row.id },
        data: {
          status: "dispatched",
          dispatchedAt: new Date(),
          attempts: { increment: 1 },
        },
      });
      dispatched += 1;
    }

    // ── Archival leg (distinct, opt-in): dispatched → archived. ──
    let archived = 0;
    if (runArchive) {
      const toArchive = await tx.outboxEvent.findMany({
        where: { status: "dispatched" },
        orderBy: { createdAt: "asc" },
        take: batchSize,
        select: { id: true },
      });
      for (const row of toArchive) {
        await tx.outboxEvent.update({
          where: { id: row.id },
          data: { status: "archived" },
        });
        archived += 1;
      }
    }

    return { dispatched, archived, skippedMaxAttempts };
  });
}
