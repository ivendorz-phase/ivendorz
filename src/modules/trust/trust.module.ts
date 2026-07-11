// Composition root for module "trust" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE §3). W3-TRUST-1 realized the BC-TRUST-1 Verification substrate (Doc-6G §3.1);
// W3-TRUST-2 realizes the `trust.request_verification.v1` audited write (Doc-4G §G4.1). Other modules
// consume `trustCommands` through `@/modules/trust/contracts`, never the application/infrastructure
// layers directly.

import {
  computePerformanceScore,
  confirmVerifiedTier,
  downgradeVerifiedTier,
  establishVerifiedTier,
  expireVerifiedTier,
  ingestPerformanceInput,
  requestVerification,
  suspendVerifiedTier,
  triggerPerformanceReview,
} from "./contracts/services";

/** The M5 write surface. `requestVerification` = the D7 audited-write + SECURITY-DEFINER twist (Doc-4G
 *  §G4.1, restricted to `subject_type = organization`; W3-TRUST-2). The five verified-tier transitions
 *  (W3-TRUST-3; Doc-4G §G4.6/§G4.7) each write the tier via a SECURITY-DEFINER function + EMIT
 *  `VendorTierChanged` (the codebase's FIRST §8 emission) + audit — all atomically. The three Performance-Score
 *  System services (W3-TRUST-4a; Doc-4G §G6.1/§G6.2/§G6.4): `ingestPerformanceInput` (sole writer of
 *  `performance_inputs`, idempotent, no event), `computePerformanceScore` (Not-Rated gate + publish-on-change
 *  `PerformanceScoreUpdated` + audit, atomic; the formula is an [ESC-TRUST-POLICY] interim plug), and
 *  `triggerPerformanceReview` (emit `PerformanceReviewTriggered` + audit, no score write). The admin HTTP
 *  commands, System timers, freeze/reactivate, and reads are DEFERRED; these are the functions they will call. */
export const trustCommands = {
  requestVerification,
  establishVerifiedTier,
  confirmVerifiedTier,
  downgradeVerifiedTier,
  suspendVerifiedTier,
  expireVerifiedTier,
  ingestPerformanceInput,
  computePerformanceScore,
  triggerPerformanceReview,
};
