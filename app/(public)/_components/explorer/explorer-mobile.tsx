"use client";

// P-PUB mobile drawer Explorer instance (FE-PUB-09 Phase 2 — UX doc §3). Rendered INSIDE the
// site-header's mobile Sheet, lazy-loaded on first open (the taxonomy seed + drawer code live
// in this chunk). Hybrid accordion/drill-in over Taxonomy Content v1.0; Popular Searches +
// quick actions ride the root pane (Approval Addendum). Same curated data as the desktop
// instance — the two surfaces can never diverge.

import * as React from "react";
import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";
import {
  MegaMenuMobile,
  MegaMenuPopular,
  MegaMenuQuickActions,
  MenuInstanceProvider,
  NavigationMenuStateProvider,
  OVERLAY_V1,
  TaxonomyProvider,
} from "@/frontend/navigation";
import type { CategoryNodeData } from "@/frontend/navigation";
import { POPULAR_SEARCHES } from "../discovery/seed";

const NODES = taxonomySeed.nodes as CategoryNodeData[];

export interface ExplorerMobileProps {
  /** Close the hosting Sheet after a navigation. */
  onNavigate?(): void;
}

export default function ExplorerMobile({ onNavigate }: ExplorerMobileProps) {
  return (
    <TaxonomyProvider nodes={NODES} overlay={OVERLAY_V1}>
      <MenuInstanceProvider source="mobile-drawer">
        <NavigationMenuStateProvider>
          <MegaMenuMobile
            onNavigate={onNavigate}
            extraSections={
              <div className="mt-2 border-t border-border pt-2">
                <MegaMenuPopular terms={[...POPULAR_SEARCHES]} className="px-1" />
                <MegaMenuQuickActions className="px-1" />
              </div>
            }
          />
        </NavigationMenuStateProvider>
      </MenuInstanceProvider>
    </TaxonomyProvider>
  );
}
