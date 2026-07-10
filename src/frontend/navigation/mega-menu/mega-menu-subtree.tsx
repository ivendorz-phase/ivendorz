"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuSubtreePanel (redesign, 2026-07-04; supersedes the §9 cascading
// drill-columns model — owner-directed, matching the globalsources.com genre convention: a
// persistent left list of top-level categories (unchanged `MegaMenuColumn level={0}`) plus a
// right panel that shows the ACTIVE root's full L2+L3 subtree simultaneously — one titled group
// per L2 child, all visible at once, no further hover/click needed to reveal grandchildren.
// L4 (if present under an L3) stays reachable by clicking through to that L3's own category
// page — the flyout goes exactly as deep as the reference genre does, not the full 4-level tree.
//
// Reuses `MegaMenuCategory` verbatim for row rendering (icons/badges/comingSoon/a11y/memoization
// all come for free) — this file only supplies the GROUPING layout, no new row primitive.
import * as React from "react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";
import { useMenuInstance } from "./menu-context";
import { MegaMenuCategory } from "./mega-menu-category";
import type { CategoryNodeVM } from "../model/types";

/** One L2 child rendered as a titled group: header links to the L2 itself, its own L3 children
 *  listed beneath — all simultaneously visible (no drill step). `columnIndex` feeds the SAME
 *  keyboard-nav engine `MegaMenuColumns` already runs (Arrow Left/Right walk `[data-menu-column]`
 *  in order) — the engine doesn't care whether a "column" is a drilled depth or a sibling group. */
function MegaMenuSubtreeGroup({
  l2,
  rootSlug,
  columnIndex,
}: {
  l2: CategoryNodeVM;
  rootSlug: string;
  columnIndex: number;
}) {
  const { hrefFor } = useMenuInstance();
  const { setActiveAt } = useMenuState();
  // Hover/focus here only enriches `MegaMenuTrail`'s breadcrumb preview (Root › L2[ › L3]) — it
  // no longer gates what renders (everything in this panel is already visible). Immediate, no
  // debounce: it updates one context string. Referentially stable (Phase 5 budget) so the
  // already-memoized `MegaMenuCategory` rows below don't get a "new" callback prop every render.
  const previewTrail = React.useCallback(
    (node: CategoryNodeVM) => setActiveAt(1, node.id),
    [setActiveAt],
  );

  return (
    <div data-menu-column={columnIndex} role="group" aria-label={l2.name} className="min-w-0">
      {l2.comingSoon ? (
        <MegaMenuCategory
          node={l2}
          showIcon
          rootSlug={rootSlug}
          className="mb-0.5 min-h-[26px] px-1.5 py-1 text-[13px] font-semibold"
        />
      ) : (
        <Link
          prefetch={false}
          href={hrefFor(l2)}
          data-menu-row
          onPointerEnter={(e) => e.pointerType === "mouse" && previewTrail(l2)}
          onFocus={() => previewTrail(l2)}
          className="mb-0.5 flex min-h-[26px] items-center gap-1.5 rounded-md px-1.5 py-1 text-[13px] font-semibold text-iv-ink-heading outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent"
        >
          {l2.name}
        </Link>
      )}
      {l2.children.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {l2.children.map((l3) => (
            <li key={l3.id}>
              <MegaMenuCategory
                node={l3}
                showIcon={false}
                rootSlug={rootSlug}
                onActivate={previewTrail}
                className="min-h-[24px] px-1.5 py-0.5 text-xs"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * The right panel: the active root's full subtree (all L2 children + their L3 children), all
 * simultaneously visible. Wraps to additional rows for roots with many L2 children (the real
 * 794-node tree has uneven fan-out) — the panel scrolls as ONE region, not per-group, so a wide
 * root never looks like N independent scrollboxes.
 *
 * Memoized on `rootId` (Phase 5 budget, same discipline as `MegaMenuCategory`): this panel can
 * hold far more rows than any single old drill-column did, so it must NOT re-render on every
 * L2/L3 hover inside it (those only call `setActiveAt(1, …)` to enrich `MegaMenuTrail` — nothing
 * in this panel's own output depends on that index). Only an actual root switch re-renders it.
 */
export const MegaMenuSubtreePanel = React.memo(function MegaMenuSubtreePanel({
  rootId,
  className,
}: {
  rootId: string | null;
  className?: string;
}) {
  const { byId } = useTaxonomy();
  const root = rootId ? byId.get(rootId) : undefined;

  if (!root) {
    return (
      <div className={cn("flex-1 p-4 text-sm text-muted-foreground", className)}>
        Hover a category to explore its catalog.
      </div>
    );
  }

  if (root.children.length === 0) {
    return (
      <div className={cn("flex-1 p-4 text-sm text-muted-foreground", className)}>
        No sub-categories yet — browse {root.name} directly.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-x-5 gap-y-3 overflow-y-auto p-3 [mask-image:linear-gradient(to_bottom,black_calc(100%-16px),transparent)]",
        className,
      )}
      style={{ maxHeight: "min(60vh, 672px)" }}
    >
      {root.children.map((l2, i) => (
        <MegaMenuSubtreeGroup key={l2.id} l2={l2} rootSlug={root.slug} columnIndex={i + 1} />
      ))}
    </div>
  );
});
