"use client";

// FE-PUB-09 MEGA_MENU — CategoryTree (MEGA_MENU_COMPONENT_SPEC.md §Category-tree tier).
// The recursive renderer every surface shares — depth-recursive (the frozen level CHECK bounds
// the DATA; no level constant in code). Modes: "tree" (always-visible sidebar, tree/treeitem
// roles) and "accordion" (disclosure lists — the mobile drawer's root surface). Picker
// groundwork: `selectable` + controlled `value` render selection state ONLY — caps (≤10/≤5)
// and validation stay app-side (future buyer-RFQ / vendor-onboarding milestones adopt this).

import * as React from "react";
import { cn } from "../../lib/cn";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { categoryHref } from "../model/types";
import type { CategoryNodeVM } from "../model/types";
import { CategoryNodeItem } from "./category-node";

export interface CategoryTreeProps {
  mode: "tree" | "accordion";
  rootId?: string | null;
  selectable?: "none" | "single" | "multi";
  /** Controlled selection (node ids). Single-select uses value[0]. */
  value?: string[];
  onChange?(ids: string[]): void;
  hrefFor?(node: CategoryNodeVM): string;
  /** Marks the current route's node with aria-current="page" (sidebar surfaces). */
  currentSlug?: string;
  /** Render-prop override for a row (admin status chips etc.). */
  renderNode?(node: CategoryNodeVM, defaults: React.ReactNode): React.ReactNode;
  defaultExpandedIds?: string[];
  className?: string;
  onNavigate?(node: CategoryNodeVM): void;
  onExpand?(node: CategoryNodeVM): void;
}

export function CategoryTree({
  mode,
  rootId = null,
  selectable = "none",
  value,
  onChange,
  hrefFor = categoryHref,
  currentSlug,
  renderNode,
  defaultExpandedIds = [],
  className,
  onNavigate,
  onExpand,
}: CategoryTreeProps) {
  const { roots, byId } = useTaxonomy();
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(defaultExpandedIds));
  const selectedIds = React.useMemo(() => new Set(value ?? []), [value]);

  const topLevel = rootId ? (byId.get(rootId)?.children ?? []) : roots;

  const toggle = (node: CategoryNodeVM) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(node.id)) next.delete(node.id);
      else {
        next.add(node.id);
        onExpand?.(node);
      }
      return next;
    });
  };

  const select = (node: CategoryNodeVM) => {
    if (!onChange) return;
    if (selectable === "single") {
      onChange(selectedIds.has(node.id) ? [] : [node.id]);
      return;
    }
    const next = new Set(selectedIds);
    if (next.has(node.id)) next.delete(node.id);
    else next.add(node.id);
    onChange([...next]);
  };

  const renderList = (
    nodes: CategoryNodeVM[],
    depth: number,
    rootSlug?: string,
  ): React.ReactNode => (
    <ul role={mode === "tree" && depth === 0 ? "tree" : "group"} className="m-0 list-none p-0">
      {nodes.map((node) => {
        const isExpanded = expanded.has(node.id);
        const row = (
          <CategoryNodeItem
            node={node}
            href={hrefFor(node)}
            expanded={node.children.length > 0 ? isExpanded : undefined}
            selected={selectedIds.has(node.id)}
            current={currentSlug === node.slug}
            depth={depth}
            showIcon={depth === 0}
            rootSlug={rootSlug ?? node.slug}
            selectable={selectable}
            onToggle={toggle}
            onSelect={select}
            onNavigate={onNavigate}
          />
        );
        return (
          <li
            key={node.id}
            role={mode === "tree" ? "treeitem" : undefined}
            aria-expanded={mode === "tree" && node.children.length > 0 ? isExpanded : undefined}
            aria-selected={
              mode === "tree" && selectable !== "none" ? selectedIds.has(node.id) : undefined
            }
          >
            {renderNode ? renderNode(node, row) : row}
            {/* Children mount on first expand and STAY mounted (back-nav snappiness — ARCH §7). */}
            {node.children.length > 0 && isExpanded
              ? renderList(node.children, depth + 1, rootSlug ?? node.slug)
              : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav aria-label="Category tree" className={cn("text-sm", className)}>
      {renderList(topLevel, 0)}
    </nav>
  );
}
