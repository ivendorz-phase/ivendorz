// M1 api (PRIVATE) — the HTTP-handler WIRE MAPPING for `identity.upsert_buyer_profile.v1`
// (Doc-4C §C10 → `POST /identity/buyer_profiles` → `201` create / `200` update; §6.2 errors).
//
// This is the module's OWN wire face: it maps the in-process `UpsertBuyerProfileOutcome` (the command
// result) to the Doc-5A wire envelope (§5.6 success / §6.1 error), choosing the §6.2 status. It owns NO
// orchestration and touches NO session/transaction — the app-layer composition edge (`src/server`)
// resolves the session, provisions, and runs the command INSIDE `withActiveOrgContext`, then hands the
// resolved outcome here. One-Owner placement: M1 owns how its write becomes HTTP.
//
// BOUNDARY: imports `@/shared/http` (framework wire envelope) + the M1 contracts TYPES only (type-only —
// no runtime cycle with the contracts re-export). It does NOT import `src/server`; it is pure (no I/O).
//
// Reference-never-restate (Doc-4C §C10 register + Doc-5A §6.2):
//   - created (`ok, created:true`)  → `201` + Doc-5A §5.6 envelope (`result` = `{ buyerProfileId, updatedAt }`).
//   - updated (`ok, created:false`) → `200` + the same envelope.
//   - VALIDATION / AUTHORIZATION / CONFLICT → §6.1 error envelope; §6.2 maps class → `400` / `403` / `409`.
//   - no active-org context (`null`, fail-closed) → `404` NOT_FOUND (Doc-5A §6.6 non-disclosure safe
//     default — identical to the read's no-context collapse; never leak whether a write target exists).

import { errorResponse, successResponse, type WireResponse } from "@/shared/http";
import type {
  UpsertBuyerProfileOutcome,
  UpsertBuyerProfileResult,
} from "@/modules/identity/contracts";

// The non-disclosure NOT_FOUND code for the no-active-org-context collapse (Doc-5C §6.3 / Doc-5A §6.6).
// Mirrors the read mapper's interim `[ESC-IDN-BUYERPROFILE-CODE]` code; escalated, not invented.
const BUYER_PROFILE_NOT_FOUND_CODE = "identity_buyer_profile_not_found";

/**
 * Map a resolved `identity.upsert_buyer_profile.v1` outcome to its Doc-5A wire response. When `null` is
 * passed, the active org was unresolved (fail-closed) and the response is the `404` non-disclosure collapse.
 *
 * @param outcome the in-process command outcome, or `null` when no active-org context resolved.
 */
export function mapUpsertBuyerProfile(
  outcome: UpsertBuyerProfileOutcome | null,
): WireResponse<UpsertBuyerProfileResult> {
  // No active-org context (fail-closed) → `404` non-disclosure safe default (Doc-5A §6.6).
  if (outcome === null) {
    return errorResponse({
      error_class: "NOT_FOUND",
      error_code: BUYER_PROFILE_NOT_FOUND_CODE,
      message: "Not found.",
      retryable: false,
    });
  }

  if (outcome.ok) {
    // Doc-5A §5.6 single-entity success: `{ result, reference_id }`; `201` create / `200` update.
    return successResponse(outcome.result, outcome.created ? 201 : 200);
  }

  // Doc-4C §C10 contract error → Doc-5A §6.1 envelope; §6.2 fixes the status from the class.
  return errorResponse({
    error_class: outcome.error.errorClass,
    error_code: outcome.error.errorCode,
    message: outcome.error.message,
    retryable: false,
  });
}
