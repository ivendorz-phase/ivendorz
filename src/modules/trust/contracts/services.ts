// Public service interfaces + callables for module "trust" — the ONLY cross-module call surface
// (REPOSITORY_STRUCTURE §3). Cross-module consumers (the app-layer composition edge `src/server/trust`)
// import from here, never the private application/domain/infrastructure/api layers.
//
// W3-TRUST-2 realizes the `trust.request_verification.v1` write facade (Doc-4G §G4.1; the D7
// audited-write pattern + the SECURITY-DEFINER twist). The concrete callable delegates to THIS module's
// application command (same-module contracts-facade — `${from.module}`-scoped; no cross-module internal
// access is opened). The M0 `appendAuditRecord` is INJECTED by the caller via the contract TYPE — never
// a concrete cross-module value import. NO `@/modules/identity` / `@/modules/marketplace` import here:
// the AUTHZ (`can_submit_verification` → M1 `check_permission`) lives at the composition edge
// (`src/server/trust` → `src/server/authz`), never inside this module.

import type { DbExecutor } from "@/shared/db";
import { requestVerificationCommand } from "../application/commands/request-verification.command";
import type {
  RequestVerificationContext,
  RequestVerificationDeps,
  RequestVerificationInput,
  RequestVerificationOutcome,
} from "./types";

// Re-export the command's context/deps DTOs on the contracts surface so the composition edge builds
// them via `@/modules/trust/contracts` (contracts-only).
export type { RequestVerificationContext, RequestVerificationDeps };

// The stage-1 SYNTAX validator + its result→outcome mapper — surfaced so the composition edge runs SYNTAX
// BEFORE AUTHZ (Doc-4A §11.2 fixed order), from the SAME single source the command re-runs (self-guard).
export {
  requestVerificationSyntaxOutcome,
  validateRequestVerificationInput,
} from "../application/commands/request-verification.command";
export type { RequestVerificationSyntaxResult } from "../application/commands/request-verification.command";

// The Doc-2 §7 AUTHZ slug (bound by pointer) — surfaced so the composition edge references ONE source.
export { CAN_SUBMIT_VERIFICATION_SLUG } from "../domain/request-verification.constants";

/**
 * `trust.request_verification.v1` (Doc-4G §G4.1) — the PUBLIC, contracts-only face over the private M5
 * write command. Open an organization verification case (state `requested`), appending the canonical
 * ENUMERATED audit action (`verification_requested`) ATOMICALLY with the privileged SD-function write.
 * The active org is RESOLVED + enforced upstream by the app-layer org-context guard; AUTHZ
 * (`can_submit_verification`) is performed at the composition edge BEFORE this call; the M0
 * `appendAuditRecord` is INJECTED by the contract TYPE.
 *
 * MUST be invoked INSIDE `withActiveOrgContext` — the `db` executor carries the server-set
 * `app.active_org` / `app.user_id` GUCs the audit `WITH CHECK` reads (and under which the SD function
 * runs). RESTRICTED to `subject_type = organization` (this WP).
 */
export type RequestVerification = (
  input: RequestVerificationInput,
  ctx: RequestVerificationContext,
  deps: RequestVerificationDeps,
  db?: DbExecutor,
) => Promise<RequestVerificationOutcome>;

/** Concrete `trust.request_verification.v1` facade (M5 contracts → M5 application command). */
export const requestVerification: RequestVerification = (input, ctx, deps, db) =>
  requestVerificationCommand(input, ctx, deps, db);

// The M5 WIRE FACE for the verification-request write (outcome → Doc-5A envelope + §6.2 status) + the two
// error-builders the composition edge consumes. One-Owner placement — M5 owns how its write becomes HTTP;
// this contracts re-export is the boundary-legal handle the app-layer composition consumes via
// `@/modules/trust/contracts` (same-module contracts → own `api/`; no cross-module internal access).
export {
  mapRequestVerification,
  requestVerificationForbidden,
  requestVerificationInvalidInput,
} from "../api/request-verification.handler";
