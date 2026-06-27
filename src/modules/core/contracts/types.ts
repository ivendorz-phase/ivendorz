// Public DTOs / IDs for module "core" (cross-module surface). DTOs/IDs only — domain
// value-objects stay private. Realizes the M0 contract surface of Doc-4B (FROZEN).
//
// Reference-never-restate: field names/semantics are owned by Doc-2 §9 (audit field set) and
// Doc-2 §0.1 (human_ref format); bound by pointer, never re-authored here.

/**
 * Actor type recorded on an audit row (Doc-2 §9; realized as the `core.ActorType` enum).
 * Logical value set: User | Admin | System | AI Agent (Doc-6B §3.1).
 */
export type CoreActorType = "user" | "admin" | "system" | "ai_agent";

/**
 * Input to `core.allocate_human_reference.v1` (Doc-4B §A7).
 * Allocates the next year-scoped human reference for an entity type from `core.id_sequences`.
 */
export interface AllocateHumanReferenceInput {
  /**
   * Entity-type prefix whose sequence is drawn — e.g. `ORG`, `RFQ`, `QTN`, `INV`, `DOC`.
   * Prefixes are owned by Doc-2 §0.1 / the Appendix B human_ref prefix registry (by pointer);
   * never invented here (Doc-4B §A7).
   */
  entityType: string;
  /** Year scope of the sequence (server-clock UTC year — Doc-2 §0.1). */
  year: number;
}

/**
 * Output of `core.allocate_human_reference.v1` (Doc-4B §A7).
 * Formatted reference per Doc-2 §0.1 (e.g. `ORG-2026-000001`).
 */
export interface AllocateHumanReferenceResult {
  /** Formatted `TYPE-YEAR-XXXXX` reference (Doc-2 §0.1; Doc-6B §3.3). */
  humanRef: string;
}

/**
 * Input to `core.append_audit_record.v1` (Doc-4B §A10).
 * Writes the Doc-2 §9 audit field set as exactly one immutable row in `core.audit_records`.
 * Field names/semantics are owned by Doc-2 §9 (bound by pointer).
 */
export interface AppendAuditRecordInput {
  /** Acting user; nullable for System/automated actions (Doc-6B §3.1). */
  actorId?: string | null;
  /** Actor type (Doc-2 §9). */
  actorType: CoreActorType;
  /** Recorded audit-context organization reference; nullable for platform actions (Doc-2 §9 / CR2). */
  organizationId?: string | null;
  /** Audited entity type (Doc-2 §9). */
  entityType: string;
  /** Audited entity id (Doc-2 §9). */
  entityId: string;
  /** Audit action name (Doc-2 §9 action catalog — by pointer; never coined here). */
  action: string;
  /** Prior field values / diff (Doc-2 §9); IDs + values only, no blobs (Doc-6A §12). */
  oldValue?: unknown;
  /** New field values / diff (Doc-2 §9); IDs + values only, no blobs (Doc-6A §12). */
  newValue?: unknown;
  /** Logical Doc-2 §9 `timestamp` (ISO-8601 UTC); defaults to server time when omitted. */
  timestamp?: Date;
  /** Caller IP (Doc-2 §9); redaction-aware. */
  ipAddress?: string | null;
  /** Caller user-agent (Doc-2 §9); redaction-aware. */
  userAgent?: string | null;
}

/**
 * Output of `core.append_audit_record.v1`.
 * Returns the platform-assigned identity of the appended immutable audit row.
 */
export interface AppendAuditRecordResult {
  /** The `audit_id` (UUIDv7, time-ordered) of the appended row (Doc-6B §3.1). */
  auditId: string;
}
