// Composition root for module "marketplace" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE section 3). W3-MKT-1 [Wave-3 M2 pilot slice] realizes the two anonymous
// Public Discovery reads (Doc-4D §BC-MKT-6 / Doc-4D_VendorSlugResolve_Patch_v1.0.4). Other modules
// consume `marketplaceQueries`, never the application/infrastructure layers directly.

import { getPublicVendorProfile, resolveVendorSlug } from "./contracts/services";

/** The M2 public read surface realized in the W3-MKT-1 pilot slice (both anonymous public reads). */
export const marketplaceQueries = {
  resolveVendorSlug,
  getPublicVendorProfile,
};
