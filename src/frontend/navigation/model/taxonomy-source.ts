// FE-PUB-09 MEGA_MENU — TaxonomySource implementations (MEGA_MENU_DATA_MODEL.md §4).
// THE seam that changes when `[ESC-7-API-CATNAV]` lands: swap the implementation, touch zero
// components (proven by tests/unit/taxonomy-source.test.ts). Providers/components consume the
// flat CategoryNodeData[] regardless of where it came from.

import type { CategoryNodeData, TaxonomySource } from "./types";
import taxonomySeed from "./taxonomy.v1.json";

/** Phase-now source: the build-time seed generated from Taxonomy Content v1.0 Appendix C. */
export const seedTaxonomySource: TaxonomySource = {
  load: () => Promise.resolve(taxonomySeed.nodes as CategoryNodeData[]),
};

// Phase-later (NOT implemented here — arrives with the public `list_categories` projection):
//   export const contractTaxonomySource: TaxonomySource = {
//     load: () => listCategories({ status: "active" }).then(toCategoryNodeData),
//   };
// Cache: Next.js data-cache / ISR, tag-revalidated per Taxonomy Content release (§4). Menus
// never hit the network on open — data resolves at page render, panel open is pure UI.
