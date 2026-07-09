// M1 api (PRIVATE) — the HTTP wire mapping for `identity.list_delegation_grants.v1`
// (Doc-4C §C9 → `GET /identity/delegation_grants` → `200`; Doc-5C §5.1). Pure (no I/O).
//
// The Doc-5A §8.6 list realization inside the §5.6 envelope: `result` = `{ items, page_info }` with
// `page_info.next_cursor` present IFF more results exist (never issued while the pagination
// dimension is FAIL-CLOSED on `ESC-IDN-LIST-PAGESIZE` — see the list query). Visibility is enforced
// upstream (party scope); an UNRESOLVED active-org context maps to the EMPTY list (the fail-closed
// "deny/empty" posture for a collection face — no tenant context can never see a row; a `404` on a
// collection route would be a shape signal, and §8.7's exclusion consistency holds trivially).

import { successResponse, type WireResponse } from "@/shared/http";
import type { ListDelegationGrantsResult } from "@/modules/identity/contracts";

/** The wire list shape (Doc-5A §8.6 — items + page_info inside the §5.6 envelope). */
export interface ListDelegationGrantsWireResult {
  items: ListDelegationGrantsResult["items"];
  pageInfo: { hasMore: boolean; nextCursor?: string };
}

/**
 * Map a resolved `identity.list_delegation_grants.v1` outcome to its Doc-5A wire response (`200`).
 * `null` (no active-org context) ⇒ the empty list — fail-closed, non-disclosing.
 */
export function mapListDelegationGrants(
  outcome: ListDelegationGrantsResult | null,
): WireResponse<ListDelegationGrantsWireResult> {
  if (outcome === null) {
    return successResponse({ items: [], pageInfo: { hasMore: false } }, 200);
  }
  return successResponse({ items: outcome.items, pageInfo: outcome.pageInfo }, 200);
}
