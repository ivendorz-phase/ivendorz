// M1 domain (PRIVATE) — the `org_status` transition matrix (DR-6-STATE, service-layer). SINGLE authority
// for which organization lifecycle edges are legal; application commands (W2-IDN-6.2, out of scope here) and
// any consulting caller MUST consult this and NEVER hand-roll a transition. A paraphrased machine is the
// repository's cardinal sin — so the legal edge set below is transcribed VERBATIM from Doc-2 §5.1 (the
// canonical state/transition home; bound by pointer, not redefined):
//
//   active ──suspend [platform governance]──▶ suspended
//   suspended ──reinstate──▶ active
//   active|suspended ──soft delete [Owner or admin; cascade §10-note]──▶ soft_deleted
//   soft_deleted ──restore [restore-conflict rule: regenerate reused slugs]──▶ active
//
// The realized `identity.org_status` enum (Doc-6C §3.2 / migration) is exactly `active|suspended|soft_deleted`
// — this machine and the enum agree. Doc-4M's M5 index paraphrases this lifecycle with `claimed`/`closed`
// labels; Doc-4M is EXPLICITLY non-normative and self-subordinates to Doc-2 §5 ("On any apparent conflict …
// the frozen source governs — this index is corrected"; Doc-4M M1/M2). Doc-2 §5.1 governs; no Flag-and-Halt.
//
// Every legal edge is enumerated in `LEGAL_TRANSITIONS`; anything not enumerated is ILLEGAL and MUST be
// rejected (fail-closed). NO state is terminal — `soft_deleted` reopens via `restore` (§5.1). Soft-delete
// CASCADE (memberships → soft-deleted; vendor profile → suspended; RFQs → archived; quotations → preserved)
// is a CROSS-MODULE effect owned by W2-IDN-6.2 / DC-1 (out of scope here); this machine owns only the
// `organizations` row's own edge legality.

/** The three `org_status` values (Doc-2 §5.1 / the `OrgStatus` enum, Doc-6C §3.2). */
export type OrganizationStatus = "active" | "suspended" | "soft_deleted";

/** Terminal states (§13) — none: `soft_deleted → active` (restore) keeps every state reopenable (§5.1). */
export const TERMINAL_ORGANIZATION_STATUSES: ReadonlySet<OrganizationStatus> = new Set([]);

/** A directed lifecycle edge `from → to`. */
export interface OrganizationTransition {
  from: OrganizationStatus;
  to: OrganizationStatus;
}

// Encode each legal edge as a `"from>to"` key for O(1) matrix membership. VERBATIM from Doc-2 §5.1 —
// exactly five edges; nothing more.
const edgeKey = (from: OrganizationStatus, to: OrganizationStatus): string => `${from}>${to}`;

const LEGAL_TRANSITIONS: ReadonlySet<string> = new Set([
  edgeKey("active", "suspended"), //       suspend:   active ──suspend [platform governance]──▶ suspended
  edgeKey("suspended", "active"), //       reinstate: suspended ──reinstate──▶ active
  edgeKey("active", "soft_deleted"), //    soft delete: active ──soft delete──▶ soft_deleted
  edgeKey("suspended", "soft_deleted"), // soft delete: suspended ──soft delete──▶ soft_deleted
  edgeKey("soft_deleted", "active"), //    restore:   soft_deleted ──restore──▶ active
]);

/** True iff `from → to` is a legal Doc-2 §5.1 edge. Self-loops and every unlisted pair are false. */
export function canTransitionOrganization(
  from: OrganizationStatus,
  to: OrganizationStatus,
): boolean {
  return LEGAL_TRANSITIONS.has(edgeKey(from, to));
}

/** Thrown when a caller attempts an edge the machine forbids — the owning command maps it to the Doc-4C
 *  STATE error (`identity_org_*` / `identity_membership_state_invalid` per the caller). Carries the rejected
 *  edge for diagnostics. */
export class IllegalOrganizationTransitionError extends Error {
  readonly from: OrganizationStatus;
  readonly to: OrganizationStatus;

  constructor(from: OrganizationStatus, to: OrganizationStatus) {
    super(`Illegal organization transition: ${from} → ${to} (Doc-2 §5.1).`);
    this.name = "IllegalOrganizationTransitionError";
    this.from = from;
    this.to = to;
  }
}

/** Assert `from → to` is legal (Doc-2 §5.1); throw `IllegalOrganizationTransitionError` otherwise. The
 *  owning command calls this BEFORE writing the new status — an illegal edge never reaches the DB. */
export function assertOrganizationTransition(
  from: OrganizationStatus,
  to: OrganizationStatus,
): void {
  if (!canTransitionOrganization(from, to)) {
    throw new IllegalOrganizationTransitionError(from, to);
  }
}
