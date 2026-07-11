// Composition root for module "trust" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE §3). W3-TRUST-1 realized the BC-TRUST-1 Verification substrate (Doc-6G §3.1);
// W3-TRUST-2 realizes the `trust.request_verification.v1` audited write (Doc-4G §G4.1). Other modules
// consume `trustCommands` through `@/modules/trust/contracts`, never the application/infrastructure
// layers directly.

import { requestVerification } from "./contracts/services";

/** The M5 write surface (D7 audited-write + SECURITY-DEFINER twist) — open an organization verification
 *  case (Doc-4G §G4.1), audit-on-write. Restricted to `subject_type = organization` (W3-TRUST-2). */
export const trustCommands = {
  requestVerification,
};
