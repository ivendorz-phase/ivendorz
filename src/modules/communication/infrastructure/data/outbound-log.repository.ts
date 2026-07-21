// M6 infrastructure (PRIVATE) — the BC-COMM-3 Outbound Log persistence (Doc-6H §3.3: the three
// structurally-identical channel structures `email_logs` / `sms_logs` / `whatsapp_logs`; append-only,
// column-scoped immutability — only `status`/`provider_ref` advance). The repository owns the SQL;
// the application command owns the orchestration. Rows are written by the delivery worker
// (owner-role — the Doc-6H "no in-band write policy" model); the column-scoped trigger enforces the
// fact-freeze beneath every write path.

import { prisma, type DbExecutor } from "@/shared/db";
import { uuidv7 } from "@/shared/ids";
import type {
  DeliveryChannel,
  DeliveryLogStatusValue,
} from "../../domain/value-objects/delivery-channel";

/** One channel-log row projection (the frozen §HB-3.1 row shape — no column added). */
export interface OutboundLogRow {
  id: string;
  recipientRef: string;
  recipientOrganizationId: string | null;
  sourceEventId: string | null;
  template: string;
  status: DeliveryLogStatusValue;
  providerRef: string | null;
  createdAt: Date;
}

/** A structural Prisma delegate over one channel structure (the three models are shape-identical —
 *  Doc-6H §3.3 "structurally identical"; this narrows each to the common surface). */
interface ChannelLogDelegate {
  findFirst(args: {
    where: { sourceEventId?: string | null; id?: string; status?: DeliveryLogStatusValue };
    select: {
      id: true;
      recipientRef: true;
      recipientOrganizationId: true;
      sourceEventId: true;
      template: true;
      status: true;
      providerRef: true;
      createdAt: true;
    };
  }): Promise<OutboundLogRow | null>;
  findMany(args: {
    where: { status: DeliveryLogStatusValue; sourceEventId: { not: null } };
    select: {
      id: true;
      recipientRef: true;
      recipientOrganizationId: true;
      sourceEventId: true;
      template: true;
      status: true;
      providerRef: true;
      createdAt: true;
    };
    orderBy: { createdAt: "asc" };
    take: number;
  }): Promise<OutboundLogRow[]>;
  create(args: {
    data: {
      id: string;
      recipientRef: string;
      recipientOrganizationId: string | null;
      sourceEventId: string;
      template: string;
      status: DeliveryLogStatusValue;
    };
  }): Promise<unknown>;
  updateMany(args: {
    where: { id: string; status: DeliveryLogStatusValue };
    data: { status: DeliveryLogStatusValue; updatedAt: Date };
  }): Promise<{ count: number }>;
}

const ROW_SELECT = {
  id: true,
  recipientRef: true,
  recipientOrganizationId: true,
  sourceEventId: true,
  template: true,
  status: true,
  providerRef: true,
  createdAt: true,
} as const;

/** Select the channel structure by the frozen 1:1 `channel` map (`<channel>_logs`). */
function delegateFor(channel: DeliveryChannel, db: DbExecutor): ChannelLogDelegate {
  switch (channel) {
    case "email":
      return db.emailLog as unknown as ChannelLogDelegate;
    case "sms":
      return db.smsLog as unknown as ChannelLogDelegate;
    case "whatsapp":
      return db.whatsappLog as unknown as ChannelLogDelegate;
  }
}

/** Find the channel-log row for a consumed `event_id` (the §HB-3.6 item 10 consumer-idempotency
 *  probe: `source_event_id` = the consumed event id). */
export async function findRowBySourceEvent(
  channel: DeliveryChannel,
  sourceEventId: string,
  db: DbExecutor = prisma,
): Promise<OutboundLogRow | null> {
  return delegateFor(channel, db).findFirst({ where: { sourceEventId }, select: ROW_SELECT });
}

/** Load one channel-log row by id (`null` when absent — the frozen §HB-3.3 REFERENCE leg). */
export async function loadRow(
  channel: DeliveryChannel,
  id: string,
  db: DbExecutor = prisma,
): Promise<OutboundLogRow | null> {
  return delegateFor(channel, db).findFirst({ where: { id }, select: ROW_SELECT });
}

/** Create one channel-log row at the frozen entry state `queued` (§HB-3.6 item 6 — the frozen
 *  §HB-3.1 row shape, no column added). Returns the new row id (UUIDv7 — M0 ID discipline). */
export async function createQueuedRow(
  input: {
    channel: DeliveryChannel;
    recipientRef: string;
    sourceEventId: string;
    template: string;
  },
  db: DbExecutor = prisma,
): Promise<string> {
  const id = uuidv7();
  await delegateFor(input.channel, db).create({
    data: {
      id,
      recipientRef: input.recipientRef,
      recipientOrganizationId: null, // external invitee — no platform org (Doc-4H GrowthDelivery §1)
      sourceEventId: input.sourceEventId,
      template: input.template,
      status: "queued",
    },
  });
  return id;
}

/** CAS `failed → queued` (the frozen §HB-3.3 re-dispatch transition — no new state). `true` iff
 *  THIS call advanced the row; `false` = lost race / not-`failed` (the caller re-reads). */
export async function requeueFailedRow(
  channel: DeliveryChannel,
  id: string,
  db: DbExecutor = prisma,
): Promise<boolean> {
  const updated = await delegateFor(channel, db).updateMany({
    where: { id, status: "failed" },
    data: { status: "queued", updatedAt: new Date() },
  });
  return updated.count === 1;
}

/** List `failed` INVITATION-ORIGIN rows (identified by a non-null `source_event_id` — Doc-4H
 *  GrowthDelivery §2) for the retry-job orchestration. Oldest-first, bounded batch. */
export async function listFailedInvitationOriginRows(
  channel: DeliveryChannel,
  limit: number,
  db: DbExecutor = prisma,
): Promise<OutboundLogRow[]> {
  return delegateFor(channel, db).findMany({
    where: { status: "failed", sourceEventId: { not: null } },
    select: ROW_SELECT,
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}
