// Composition root for module "trust" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE §3). W3-TRUST-1 realized the BC-TRUST-1 Verification substrate (Doc-6G §3.1);
// W3-TRUST-2 realizes the `trust.request_verification.v1` audited write (Doc-4G §G4.1). Other modules
// consume `trustCommands` through `@/modules/trust/contracts`, never the application/infrastructure
// layers directly.

import {
  confirmVerifiedTier,
  downgradeVerifiedTier,
  establishVerifiedTier,
  expireVerifiedTier,
  requestVerification,
  suspendVerifiedTier,
} from "./contracts/services";

/** The M5 write surface. `requestVerification` = the D7 audited-write + SECURITY-DEFINER twist (Doc-4G
 *  §G4.1, restricted to `subject_type = organization`; W3-TRUST-2). The five verified-tier transitions
 *  (W3-TRUST-3; Doc-4G §G4.6/§G4.7) each write the tier via a SECURITY-DEFINER function + EMIT
 *  `VendorTierChanged` (the codebase's FIRST §8 emission) + audit — all atomically. The admin HTTP
 *  commands + System expire timer are DEFERRED; these are the functions they will call. */
export const trustCommands = {
  requestVerification,
  establishVerifiedTier,
  confirmVerifiedTier,
  downgradeVerifiedTier,
  suspendVerifiedTier,
  expireVerifiedTier,
};
