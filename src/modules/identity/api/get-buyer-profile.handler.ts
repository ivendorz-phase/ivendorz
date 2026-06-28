// M1 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `identity.get_buyer_profile.v1`
// (Doc-5C §6.1 row 33 → `GET /identity/buyer_profiles` → `200`; §6.3 non-disclosure → `404`).
//
// This is the module's OWN wire face: it maps the in-process `GetBuyerProfileResult` (the read
// outcome) to the Doc-5A wire envelope (§5.6 success / §6.1 error), choosing the §6.2 status. It
// owns NO orchestration and touches NO session/transaction — the app-layer composition edge
// (`src/server`) resolves the session, provisions, and runs the read INSIDE `withActiveOrgContext`,
// then hands the resolved outcome here. Keeping the wire mapping in M1's `api/` (not in `app`/`server`)
// is the One-Owner placement: M1 owns how its read becomes HTTP.
//
// BOUNDARY: imports `@/shared/http` (the platform wire envelope — framework-level) + the M1
// contracts result type only. It does NOT import `src/server` (a module-internal may not), and it is
// pure (no I/O) — fully unit-testable. The composed handler in `src/server` calls this mapper.
//
// Reference-never-restate:
//   - profile present     → `200` + Doc-5A §5.6 envelope (`result` = the buyer-profile DTO) + top-level
//                           `reference_id` (CHK-5A-042).
//   - absent / cross-tenant (`found: false`) → `404` NOT_FOUND (Doc-5C §6.3; Doc-5A §6.2 — identical
//                           shape for "absent" and "cross-tenant"; the two are NOT distinguished).
//   - active org unresolved (fail-closed) → `404` NOT_FOUND, the Doc-5A §6.6 non-disclosure-preserving
//                           safe default for an ambiguous AUTHORIZATION/NOT_FOUND failure point (never a leak).
//   The `identity_`-namespaced `error_code` is owned by Doc-4C §C10 (the buyer-profile register); it is
//   carried by pointer and NOT coined here — see ESC note below.

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type { BuyerProfileView, GetBuyerProfileResult } from "@/modules/identity/contracts";

// The NOT_FOUND `error_code` for the buyer-profile read collapse. Doc-4C §C10 owns the `identity_`
// register; Doc-5C §6.4 flags buyer-profile authority as carrying [ESC-IDN-SLUG]/[ESC-IDN-AUDIT] and
// the code is not yet pinned in this build. This placeholder is the interim non-disclosure code (a
// single, fact-free NOT_FOUND for both absence and cross-tenant — Doc-5C §6.3); it is escalated, not
// invented as a new contract element. [ESC-IDN-BUYERPROFILE-CODE]
const BUYER_PROFILE_NOT_FOUND_CODE = "identity_buyer_profile_not_found";

/**
 * Map a resolved `identity.get_buyer_profile.v1` outcome to its Doc-5A wire response. When `null` is
 * passed, the active org was unresolved (fail-closed) and the response is the same `404` collapse —
 * the absent/cross-tenant/no-context cases are byte-identical (non-disclosure; Doc-5C §6.3 / Doc-5A §6.6).
 *
 * @param outcome the in-process read result, or `null` when no active-org context resolved.
 */
export function mapGetBuyerProfile(
  outcome: GetBuyerProfileResult | null,
): WireResponse<BuyerProfileView> {
  if (outcome !== null && outcome.found) {
    // Doc-5A §5.6 single-entity success: `{ result, reference_id }`, status 200 (Doc-5C §6.1 row 33).
    return successResponse(outcome.profile, 200);
  }

  // Absent (`found: false`) OR no-context (null) → indistinguishable NOT_FOUND/404 (Doc-5C §6.3).
  return errorResponse({
    error_class: "NOT_FOUND",
    error_code: BUYER_PROFILE_NOT_FOUND_CODE,
    message: "Not found.",
    retryable: false,
  });
}
