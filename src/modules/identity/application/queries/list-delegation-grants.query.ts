// M1 application (PRIVATE) — `identity.list_delegation_grants.v1` (Doc-4C §C9 · 21.3 Query · Actor:
// User, party org). The dual-party LIST read scoped strictly to the active org's party role
// (§C9 Visibility: "grants where the active org is a party only" — never a third-party grant, §7.5).
//
// FROZEN request fields realized: `role_filter : enum(as_controlling|as_representative|any) :
// optional : default any` · `status_filter : enum : optional` · `vendor_profile_id : uuid : optional`.
// Sort: `valid_from` (tiebreaker `delegation_grant_id`) — the frozen deterministic total order.
//
// PAGINATION — FAIL-CLOSED (handle-gated): the §C9 `page_size`/`cursor` dimension is bounded by a
// `[DC-5]` POLICY key that was NEVER REGISTERED — Doc-3 v1.9 §Notes (verbatim): "No
// `identity.list_page_size_max`. … If a frozen Doc-5C list contract requires an identity-scoped
// page-size bound that no existing key satisfies, that is a separate escalation ([ESC-6-API] /
// Doc-4A §18.2) — not coined here." Doc-5A §8.5 requires the min/max/default be POLICY-keyed, never
// a literal. With NO key to read and literals forbidden, the ONLY conforming interim is to gate the
// whole client-pagination dimension on the escalation (`ESC-IDN-LIST-PAGESIZE` proposed — the
// recovery_method/preferences fail-closed posture, RV-0152): the wire face rejects a supplied
// `page_size`/`cursor` (400, citing the handle), and this query returns the FULL party-scoped set in
// the frozen order with `page_info { has_more: false }` (party scope + RLS bound the set in
// practice). When the key registers, the slice/cursor activates here — never a literal meanwhile.
//
// Read: unaudited (§17.1) · `Idempotency: not-applicable` · zero events.

import { prisma, type DbExecutor } from "@/shared/db";
import { listDelegationGrantsForParty } from "../../infrastructure/data/delegation-grant.repository";
import type {
  DelegationGrantView,
  ListDelegationGrantsInput,
  ListDelegationGrantsResult,
} from "../../contracts/types";

/**
 * List the active org's delegation grants (Doc-4C §C9). `partyOrgId` is the SERVER-RESOLVED active
 * org (Invariant #5). Filters never widen visibility beyond party scope (§C9 AI-Agent Notes).
 */
export async function listDelegationGrants(
  input: ListDelegationGrantsInput,
  partyOrgId: string,
  db: DbExecutor = prisma,
): Promise<ListDelegationGrantsResult> {
  const rows = await listDelegationGrantsForParty(
    {
      partyOrgId,
      roleFilter: input.roleFilter ?? "any",
      ...(input.statusFilter !== undefined ? { statusFilter: input.statusFilter } : {}),
      ...(input.vendorProfileId !== undefined ? { vendorProfileId: input.vendorProfileId } : {}),
    },
    db,
  );

  const items: DelegationGrantView[] = rows.map((row) => ({
    delegationGrantId: row.id,
    controllingOrganizationId: row.controllingOrganizationId,
    representativeOrganizationId: row.representativeOrganizationId,
    vendorProfileId: row.vendorProfileId,
    permissionSet: row.fieldSet.permissionSet,
    validFrom: row.fieldSet.validFrom,
    validTo: row.fieldSet.validTo,
    status: row.status,
  }));

  // Doc-5A §8.6 list shape: `next_cursor` present IFF more results exist — the fail-closed interim
  // returns the full set, so `has_more` is always false and no cursor is ever issued (§8.2 opacity:
  // a client can therefore never legitimately supply one — the wire face rejects any).
  return { items, pageInfo: { hasMore: false } };
}
