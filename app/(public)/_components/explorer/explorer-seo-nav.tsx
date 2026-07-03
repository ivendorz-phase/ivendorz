// P-PUB Explorer SEO nav (FE-PUB-09 Phase 1 — ARCH §7 SEO). SERVER-rendered, crawlable L1/L2
// category links in real `<a href>` markup inside a labelled <nav>; visually hidden (the
// interactive Explorer is the visible surface — this progressive-enhancement baseline costs the
// client bundle NOTHING because it ships zero JS). Slugs come from the taxonomy seed verbatim;
// hrefs follow the Category Landing Contract (ARCH §9.1).

import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";
// FE-PUB-09 fix, take 3 (Review-B RV-0126 re-review REGRESSION, round 2): imports directly from
// the concrete `model/*` files rather than the `@/frontend/navigation` barrel. This component is
// the ONE thing in the whole mega-menu package that's actually reachable from `app/(public)/
// layout.tsx` (rendered on every public route, never lazy) — and the barrel also re-exports every
// heavy interactive `mega-menu/*` component (`MegaMenuVendors` etc.) from the same `index.ts`.
// Turbopack's production tree-shaking wasn't granular enough to prove those unused re-exports were
// safe to drop, so importing THIS component through the barrel pulled the whole mega-menu chunk
// into the always-eager layout bundle — the real root cause of the eager `<script async>` defect
// (takes 1 and 2 both "fixed" the lazy-loading API on the DESKTOP/MOBILE trigger side, which was
// never the actual leak). `model/*` and `mega-menu/*` are separate subtrees with no other shared
// dependency, so importing only from `model/*` here fully decouples this always-eager component's
// module graph from the interactive package.
import { buildTaxonomyIndex } from "@/frontend/navigation/model/taxonomy-index";
import { categoryHref } from "@/frontend/navigation/model/types";
import { OVERLAY_V1 } from "@/frontend/navigation/model/overlay.v1";
import type { CategoryNodeData } from "@/frontend/navigation/model/types";

const index = buildTaxonomyIndex(taxonomySeed.nodes as CategoryNodeData[], OVERLAY_V1);

export function ExplorerSeoNav() {
  return (
    <nav aria-label="Categories" className="sr-only">
      <ul>
        {index.roots.map((root) => (
          <li key={root.id}>
            <a href={categoryHref(root)}>{root.name}</a>
            {root.children.length > 0 ? (
              <ul>
                {root.children.map((child) => (
                  <li key={child.id}>
                    <a href={categoryHref(child)}>{child.name}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
