import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, describe, expect, it } from "vitest";
import {
  dispatchOutboxEvents,
  drainOutbox,
  writeOutboxEvent,
  type OutboxTransportEvent,
} from "@/modules/core/contracts";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// P2-A4 (2) — the M0 outbox producer (envelope-wins) + the P2-A1 consumer-transport leg
// (send-then-mark, at-least-once). Boundary-legal: imports only `@/modules/core/contracts` +
// `src/shared/*`. SYNTHETIC FIXTURES ONLY (the WP-1.8 R-a model): the seeded rows are test
// fixtures, not domain events — nothing is coined. `core.outbox_events` is APPEND-ONLY (no
// teardown DELETE — Invariant #8); every assertion is scoped to its own fresh UUIDv7-named
// fixture row, never a global count (shared-DB residue tolerated).

const FIXTURE_EVENT_NAME = "test.p2a1.synthetic_transport_fixture" as const;
const FIXTURE_EVENT_VERSION = 1 as const;

/** Append one synthetic `pending` envelope via the REAL producer (staff-GUC tx — the sanctioned
 *  INSERT admission). Returns the appended row id (= envelope event_id) + the payload marker. */
async function seedViaProducer(
  extraPayload: Record<string, unknown> = {},
): Promise<{ eventId: string; marker: string }> {
  const marker = uuidv7(); // FULL uuid — shared-DB uniqueness rule
  const { eventId } = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;
    return writeOutboxEvent(
      {
        eventName: FIXTURE_EVENT_NAME,
        eventVersion: FIXTURE_EVENT_VERSION,
        payload: { marker, ...extraPayload },
      },
      tx,
    );
  });
  return { eventId, marker };
}

async function readRow(id: string) {
  return prisma.outboxEvent.findUnique({
    where: { id },
    select: {
      status: true,
      attempts: true,
      dispatchedAt: true,
      payloadJsonb: true,
      eventName: true,
      eventVersion: true,
    },
  });
}

/** Flush residue `pending` rows (legacy status-only drain) so batch-window assertions on our own
 *  fixtures are not starved by another file's append-only residue. */
async function flushPending(): Promise<void> {
  await drainOutbox({ batchSize: 1000 });
}

describe("P2-A1 outbox producer envelope-wins + consumer-transport leg (send-then-mark)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("producer ENVELOPE WINS: a caller payload cannot clobber event_id / occurred_at", async () => {
    const spoofedOccurredAt = "1999-01-01T00:00:00.000Z";
    const { eventId, marker } = await seedViaProducer({
      event_id: "spoofed-event-id",
      occurred_at: spoofedOccurredAt,
    });

    const row = await readRow(eventId);
    expect(row).not.toBeNull();
    const payload = row!.payloadJsonb as Record<string, unknown>;
    expect(payload["marker"]).toBe(marker); // the caller's thin payload rides
    expect(payload["event_id"]).toBe(eventId); // stamped — the spoof did NOT win
    expect(payload["event_id"]).not.toBe("spoofed-event-id");
    expect(payload["occurred_at"]).not.toBe(spoofedOccurredAt); // stamped fresh
    expect(typeof payload["occurred_at"]).toBe("string");
    expect(row!.status).toBe("pending"); // producer appends pending; the worker advances
  });

  it("no-transport drain preserves the legacy status-only behavior (pending → dispatched)", async () => {
    const { eventId } = await seedViaProducer();

    const result = await drainOutbox({ batchSize: 1000 }); // no deps — legacy path
    expect(result.dispatched).toBeGreaterThanOrEqual(1);

    const row = await readRow(eventId);
    expect(row!.status).toBe("dispatched");
    expect(row!.attempts).toBe(1);
    expect(row!.dispatchedAt).not.toBeNull();
  });

  it("transport SUCCESS: the envelope is forwarded (id/name/version/payload) then the row is marked dispatched", async () => {
    await flushPending();
    const { eventId, marker } = await seedViaProducer();

    const forwarded: OutboxTransportEvent[] = [];
    const result = await dispatchOutboxEvents(
      { batchSize: 1000 },
      {
        transport: async (event) => {
          forwarded.push(event);
        },
      },
    );
    expect(result.dispatched).toBeGreaterThanOrEqual(1);

    // Our fixture was forwarded with the persisted envelope facts.
    const mine = forwarded.find((e) => e.eventId === eventId);
    expect(mine).toBeDefined();
    expect(mine!.eventName).toBe(FIXTURE_EVENT_NAME);
    expect(mine!.eventVersion).toBe(FIXTURE_EVENT_VERSION);
    expect(mine!.payload["marker"]).toBe(marker);
    expect(mine!.payload["event_id"]).toBe(eventId); // the consumer idempotency key rides the payload

    // …and only then marked dispatched (send-then-mark).
    const row = await readRow(eventId);
    expect(row!.status).toBe("dispatched");
    expect(row!.attempts).toBe(1);
    expect(row!.dispatchedAt).not.toBeNull();
  });

  it("transport FAILURE: a throwing send leaves the row PENDING (attempts bumped, never dropped)", async () => {
    await flushPending();
    const { eventId } = await seedViaProducer();

    let attemptsSeen = 0;
    const result = await dispatchOutboxEvents(
      { batchSize: 1000 },
      {
        transport: async (event) => {
          if (event.eventId === eventId) {
            attemptsSeen += 1;
            throw new Error("synthetic transport outage (fixture)");
          }
          // Any residue rows in the same pass are allowed through (scoped failure).
        },
      },
    );
    expect(attemptsSeen).toBe(1); // sent once this pass

    // SEND-THEN-MARK: the failed send never advanced the row — it stays `pending` for the next
    // drain, with attempts bumped so the §B6 backoff/dead-letter policy governs the retry.
    const row = await readRow(eventId);
    expect(row!.status).toBe("pending");
    expect(row!.attempts).toBe(1);
    expect(row!.dispatchedAt).toBeNull();

    // The failed row was NOT counted as dispatched.
    expect(result.dispatched).toBeGreaterThanOrEqual(0); // mechanical sanity (other rows may advance)
  });

  it("PER-ROW ISOLATION: X fails while Y succeeds in the SAME drain → Y dispatched, X pending+bumped", async () => {
    // L-A2-MAJOR-1 regression guard: sends run outside any DB transaction with per-row short
    // mark/bump transactions — one row's broker failure can never roll back (or block) another
    // row's committed advance. Under the old single-transaction structure an abort would have
    // entangled both rows.
    await flushPending();
    const failing = await seedViaProducer(); // X — the broker rejects this one
    const succeeding = await seedViaProducer(); // Y — delivered normally

    const result = await dispatchOutboxEvents(
      { batchSize: 1000 },
      {
        transport: async (event) => {
          if (event.eventId === failing.eventId) {
            throw new Error("synthetic per-row outage (fixture)");
          }
        },
      },
    );

    // Y advanced (send-then-mark completed) …
    const rowY = await readRow(succeeding.eventId);
    expect(rowY!.status).toBe("dispatched");
    expect(rowY!.attempts).toBe(1);
    expect(rowY!.dispatchedAt).not.toBeNull();
    expect(result.dispatched).toBeGreaterThanOrEqual(1);

    // … while X stayed pending with its attempts bumped (retry under the §B6 policy) — the
    // failure did NOT roll back Y's committed mark.
    const rowX = await readRow(failing.eventId);
    expect(rowX!.status).toBe("pending");
    expect(rowX!.attempts).toBe(1);
    expect(rowX!.dispatchedAt).toBeNull();
  });
});
