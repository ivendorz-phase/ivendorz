// M0 infrastructure — realizes `core.append_audit_record.v1` (Doc-4B §A10): appends exactly one
// immutable row to core.audit_records (Doc-2 §9 field set; Doc-6B §3.1). The row's audit_id is a
// time-ordered UUIDv7 (CR3), minted in-process via the shared ID generator (Doc-4B §8). This is
// M0 writing its OWN schema (allowed); other modules invoke it via the contract surface.
//
// Append-only: the DB triggers (Doc-6B §4.1, CR4′) block any later UPDATE/DELETE of the payload;
// redaction is the separate core.admin_redact_audit_field contract.
//
// RLS admission (ESC-W2-AUDIT-RLS §7 = R-b / ADR-021 / Doc-6B_Structure_Additive_Patch_v1.0.1): the
// append is admitted by the context-bound `audit_records_context_append` INSERT policy — a tenant-context
// caller (`app.is_platform_staff = false`) appends a row bound to its own `app.active_org`/`app.user_id`
// with `actor_type = 'user'`; System/staff paths append under the platform-staff leg. The READ surface
// stays platform-staff-only.
//
// NON-RETURNING (load-bearing — the Doc-6B patch's Deployment Constraint): we use `createMany` (NOT
// `create`), so the INSERT carries NO `RETURNING` clause. Postgres forces `INSERT … RETURNING` rows
// through the table's SELECT policy; under the staff-only audit SELECT posture a tenant `RETURNING` would
// abort with SQLSTATE 42501 and roll back the caller's business write. `audit_id` is minted app-side
// (below) so no DB-returned key is needed. Do NOT revert to `create()` — it re-introduces the abort.

import { prisma, Prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { AppendAuditRecord, CoreServiceExecutor } from "../../contracts/services";
import type { AppendAuditRecordInput } from "../../contracts/types";

// Map a contract jsonb value to Prisma's nullable-JSON input: `undefined` → DB NULL (omit);
// `null` → JSON null literal; otherwise the value (Doc-6A §12 — IDs/values only, no blobs).
function toJsonInput(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

async function append(input: AppendAuditRecordInput, db: DbExecutor): Promise<{ auditId: string }> {
  const auditId = uuidv7();
  // `createMany` (single-row) emits a NON-`RETURNING` INSERT (Prisma 6 returns a count, not the row —
  // the `RETURNING` variant is the separate `createManyAndReturn`). This is load-bearing: see the
  // NON-RETURNING note at the top of this file. Exactly one immutable audit row (Doc-4B §A10).
  await db.auditRecord.createMany({
    data: [
      {
        auditId,
        actorId: input.actorId ?? null,
        actorType: input.actorType,
        organizationId: input.organizationId ?? null,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        // jsonb columns: omit when undefined so the column is DB NULL.
        ...(input.oldValue !== undefined ? { oldValue: toJsonInput(input.oldValue) } : {}),
        ...(input.newValue !== undefined ? { newValue: toJsonInput(input.newValue) } : {}),
        eventTime: input.timestamp ?? new Date(),
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    ],
  });
  return { auditId };
}

/**
 * Append one immutable audit record (Doc-4B §A10 / Doc-2 §9). Runs on the supplied transaction
 * executor when present (audit is atomic with the caller's business write — Doc-4B §17.1);
 * otherwise on the shared client.
 */
export const appendAuditRecord: AppendAuditRecord = (input, executor?: CoreServiceExecutor) =>
  append(input, (executor as DbExecutor | undefined) ?? prisma);
