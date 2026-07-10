// M1 api (PRIVATE) — the HTTP wire mapping for `identity.list_my_organizations.v1`
// (Doc-4C §C8 → `GET /identity/organizations` → `200`; Doc-5C §6.1 row 31). Pure (no I/O).
//
// The principal-scoped list envelope (Doc-5A §8.6 — items + page_info inside the §5.6 envelope; realized
// in the ratified camelCase house shape, `ESC-WIRE-FIELD-CASING` carried — the delegation-list precedent).
// `null` ⇒ no resolvable principal — the fail-closed EMPTY list (a collection face's existence is not a
// protected fact; the empty set is the non-disclosing realization, RV-0155). Self-scoped: only the
// caller's own memberships.

import { successResponse, type WireResponse } from "@/shared/http";
import type { ListMyOrganizationsResult } from "@/modules/identity/contracts";

/**
 * Map a resolved `identity.list_my_organizations.v1` outcome to its Doc-5A §8.6 list wire response:
 * `200` with `{ items, pageInfo }` (the frozen §C8 item projection). `null` ⇒ the fail-closed empty list.
 */
export function mapListMyOrganizations(
  outcome: ListMyOrganizationsResult | null,
): WireResponse<ListMyOrganizationsResult> {
  if (outcome === null) {
    return successResponse({ items: [], pageInfo: { hasMore: false } }, 200);
  }
  return successResponse({ items: outcome.items, pageInfo: outcome.pageInfo }, 200);
}
