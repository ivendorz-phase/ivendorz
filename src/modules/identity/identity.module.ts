// Composition root for module "identity" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE section 3). WP-1.2 [W1-IDENTITY-001] realizes the 5-table subset
// (Doc-6C) + the `identity.get_buyer_profile.v1` read (Doc-5C §6.1/§6.3). Other modules consume
// `identityQueries`, never the application/infrastructure layers directly.

import { getBuyerProfile } from "./application/queries/get-buyer-profile.query";

/** The M1 read surface realized in WP-1.2 (the active-org buyer-profile read; Doc-5C §6). */
export const identityQueries = {
  getBuyerProfile,
};
