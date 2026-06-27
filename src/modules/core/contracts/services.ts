// Public service interfaces for module "core" — the only cross-module call surface
// (REPOSITORY_STRUCTURE section 3). Realizes the M0 contract surface of Doc-4B (FROZEN):
//   - core.allocate_human_reference.v1 (Doc-4B §A7)
//   - core.append_audit_record.v1      (Doc-4B §A10)
//
// Both are internal infrastructure services invoked WITHIN the caller's transaction
// (Doc-4B §A7 / §A10 — atomic with the caller's create/mutate). Callers therefore pass an
// optional transaction executor so allocation/audit-append join the caller's single
// transaction; absent one, the service runs on the shared client.

import type {
  AllocateHumanReferenceInput,
  AllocateHumanReferenceResult,
  AppendAuditRecordInput,
  AppendAuditRecordResult,
} from "./types";

/**
 * A transaction-capable executor surface (structural). Satisfied by both the shared Prisma
 * client and a Prisma interactive-transaction client; lets the caller bind these M0 primitives
 * into its own transaction (Doc-4B §A7/§A10 atomicity) without coupling `contracts/` to a
 * concrete client. The concrete type lives in `src/shared/db`; infrastructure narrows to it.
 */
export interface CoreServiceExecutor {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
}

/**
 * `core.allocate_human_reference.v1` (Doc-4B §A7).
 * Allocates the next year-scoped `human_ref` for `entityType` from `core.id_sequences`
 * (row-locked, gap-tolerant, never-reused — Doc-2 §10.11). Participates in the caller's
 * transaction when an executor is supplied.
 */
export type AllocateHumanReference = (
  input: AllocateHumanReferenceInput,
  executor?: CoreServiceExecutor,
) => Promise<AllocateHumanReferenceResult>;

/**
 * `core.append_audit_record.v1` (Doc-4B §A10).
 * Appends exactly one immutable row to `core.audit_records` (Doc-2 §9 field set). Bound to the
 * caller's transaction when an executor is supplied (audit is atomic with the business write —
 * Doc-4B §17.1).
 */
export type AppendAuditRecord = (
  input: AppendAuditRecordInput,
  executor?: CoreServiceExecutor,
) => Promise<AppendAuditRecordResult>;

/** The M0 callable service surface exposed to other modules (contracts-only). */
export interface CoreServices {
  allocateHumanReference: AllocateHumanReference;
  appendAuditRecord: AppendAuditRecord;
}
