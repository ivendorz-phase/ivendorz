"use client";

// P-PUB-08 category-landing sidebar tree (FE-PUB-09 Phase 2 — UX doc §8 "Marketplace sidebar":
// `CategoryTree mode="tree"`, always visible, current node from the route via
// `aria-current="page"`). Mounted under the FilterSidebar on taxonomy-resolved slugs; rooted at
// the node's L1 root with the ancestor chain pre-expanded. The shipped marketplace hub
// (P-PUB-10) has no sidebar region by design — this drill surface is where a route-aware tree
// is meaningful (adaptation recorded in the WP card).

import * as React from "react";
import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";
import {
  CategoryTree,
  MenuInstanceProvider,
  NavigationMenuStateProvider,
  OVERLAY_V1,
  TaxonomyProvider,
  buildTaxonomyIndex,
} from "@/frontend/navigation";
import type { CategoryNodeData } from "@/frontend/navigation";

const NODES = taxonomySeed.nodes as CategoryNodeData[];
const INDEX = buildTaxonomyIndex(NODES, OVERLAY_V1);

export function CategorySidebarTree({ slug }: { slug: string }) {
  const node = INDEX.bySlug.get(slug);
  if (!node) return null;
  const trail = INDEX.pathTo(node.id);
  const root = trail[0]!;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <h2 className="mb-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {root.name}
      </h2>
      <TaxonomyProvider nodes={NODES} overlay={OVERLAY_V1}>
        <MenuInstanceProvider source="sidebar">
          <NavigationMenuStateProvider>
            <CategoryTree
              mode="tree"
              rootId={root.id}
              currentSlug={slug}
              defaultExpandedIds={trail.map((n) => n.id)}
            />
          </NavigationMenuStateProvider>
        </MenuInstanceProvider>
      </TaxonomyProvider>
    </div>
  );
}
