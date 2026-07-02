"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuBreadcrumb (MEGA_MENU_COMPONENT_SPEC.md §Mega-menu tier).
// Mobile drill trail: `‹ Back` + Root › L2 › L3, middle-truncated on narrow widths (leaf and
// back always visible — ux_patterns §3.3 mobile rule). Reads the drill stack from useMenuState.

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "../../lib/cn";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";
import type { CategoryNodeVM } from "../model/types";

export interface MegaMenuBreadcrumbProps {
  className?: string;
  onCrumbSelect?(node: CategoryNodeVM | null): void;
}

export function MegaMenuBreadcrumb({ className, onCrumbSelect }: MegaMenuBreadcrumbProps) {
  const { byId } = useTaxonomy();
  const { activePath, drillBack, resetPath } = useMenuState();
  if (activePath.length === 0) return null;

  const trail = activePath.map((id) => byId.get(id)).filter((n): n is CategoryNodeVM => Boolean(n));
  // Middle-truncate: keep first + last when deep; leaf always visible.
  const compact = trail.length > 2 ? [trail[0]!, null, trail[trail.length - 1]!] : trail;

  return (
    <div className={cn("flex items-center gap-1 border-b border-border px-1 py-1.5", className)}>
      <button
        type="button"
        className="flex min-h-[44px] items-center gap-1 rounded-md px-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => {
          drillBack();
          onCrumbSelect?.(trail.length > 1 ? trail[trail.length - 2]! : null);
        }}
      >
        <ChevronLeft aria-hidden className="size-4" />
        Back
      </button>
      <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground" aria-live="polite">
        <button
          type="button"
          className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            resetPath();
            onCrumbSelect?.(null);
          }}
        >
          All
        </button>
        {compact.map((node, i) =>
          node === null ? (
            <span key={`ellipsis-${i}`} aria-hidden>
              {" › …"}
            </span>
          ) : (
            <span key={node.id}>
              {" › "}
              <span
                className={i === compact.length - 1 ? "font-medium text-foreground" : undefined}
              >
                {node.name}
              </span>
            </span>
          ),
        )}
      </p>
    </div>
  );
}
