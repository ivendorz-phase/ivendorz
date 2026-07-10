"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuColumn + MegaMenuColumns (MEGA_MENU_COMPONENT_SPEC.md).
// Redesigned 2026-07-04 (owner-directed, globalsources.com genre convention — supersedes the
// original §9-ratified cascading drill-columns model; see MEGA_MENU_ARCHITECTURE.md §9.8
// amendment): column 0 is the PERSISTENT root list (unchanged — `MegaMenuColumn level={0}`);
// hovering a root no longer drills one level at a time — it instantly swaps in that root's FULL
// L2+L3 subtree via `MegaMenuSubtreePanel` (mega-menu-subtree.tsx), all simultaneously visible.
// `activePath[0]` (which root is active) is the only index this file still writes; index 1 is
// still updated on L2/L3 hover but ONLY to enrich `MegaMenuTrail`'s breadcrumb preview — nothing
// downstream reads it to decide what to render anymore (see mega-menu-subtree.tsx). Hover-intent
// (~80ms) still gates ROOT activation only (switching which subtree shows); the L2/L3 rows inside
// the subtree panel have nothing left to debounce (their content was already visible). Keyboard
// map per UX doc §4 (roving focus across columns, Home/End, a–z typeahead) is UNCHANGED — it
// already generalizes from "one column per drilled depth" to "one column per visible group"
// (root list = column 0, each L2 group = columns 1..N) with zero code changes to `onKeyDown`.

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "../../lib/cn";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";
import { useMenuInstance } from "./menu-context";
import { MegaMenuCategory } from "./mega-menu-category";
import { MegaMenuSubtreePanel } from "./mega-menu-subtree";
import type { CategoryNodeVM } from "../model/types";

export interface MegaMenuColumnProps {
  level: number;
  parentId: string | null;
  emptyHint?: React.ReactNode;
  className?: string;
}

export function MegaMenuColumn({ level, parentId, emptyHint, className }: MegaMenuColumnProps) {
  const router = useRouter();
  const { roots, byId, pathTo } = useTaxonomy();
  const { activePath, setActiveAt, hoverIntentDelay } = useMenuState();
  const { emit, hrefFor } = useMenuInstance();
  const pending = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const parent = parentId ? byId.get(parentId) : undefined;
  const siblings = parentId ? (parent?.children ?? []) : roots;
  const activeId = activePath[level];
  const rootSlug = parentId ? pathTo(parentId)[0]?.slug : undefined;

  React.useEffect(() => {
    return () => {
      if (pending.current) clearTimeout(pending.current);
    };
  }, []);

  // Referentially stable so memoized rows bail out on unrelated re-renders (Phase 5 audit);
  // reads the live activeId from a ref to avoid re-creating per hover.
  const activeIdRef = React.useRef(activeId);
  activeIdRef.current = activeId;
  const scheduleActivate = React.useCallback(
    (node: CategoryNodeVM) => {
      if (node.id === activeIdRef.current) return;
      if (pending.current) clearTimeout(pending.current);
      pending.current = setTimeout(() => {
        setActiveAt(level, node.id);
        if (node.children.length > 0) emit({ type: "node_drill" }, node);
        // Route prefetch ONLY after sustained hover intent — never pointer fly-by
        // (R2-NITPICK-04; row links themselves ship prefetch={false}).
        router.prefetch(hrefFor(node));
      }, hoverIntentDelay.in);
    },
    [level, setActiveAt, emit, router, hrefFor, hoverIntentDelay.in],
  );

  if (siblings.length === 0) {
    return (
      <div className={cn("w-64 shrink-0 p-3 text-sm text-muted-foreground", className)}>
        {emptyHint ?? "No categories here yet."}
      </div>
    );
  }

  // Optional visual grouping (MegaMenuSection idiom): overlay `sectionLabel` groups adjacent
  // rows under a heading — purely presentational, hierarchy untouched.
  const groups: { label?: string; nodes: CategoryNodeVM[] }[] = [];
  for (const node of siblings) {
    const last = groups[groups.length - 1];
    if (last && last.label === node.sectionLabel) last.nodes.push(node);
    else groups.push({ label: node.sectionLabel, nodes: [node] });
  }

  return (
    <div
      role="group"
      aria-label={parent?.name ?? "All categories"}
      data-menu-column={level}
      // Column-local scroll past ~14 rows with a fade cue; the panel itself never scrolls.
      className={cn(
        // Token-driven column cascade (Phase 4): fade/slide on mount, instant under
        // prefers-reduced-motion.
        "max-h-[min(60vh,672px)] w-64 shrink-0 animate-iv-fade-in overflow-y-auto border-e border-border p-1.5 last:border-e-0 motion-reduce:animate-none [mask-image:linear-gradient(to_bottom,black_calc(100%-16px),transparent)]",
        className,
      )}
      onPointerLeave={() => {
        // Leaving the column cancels a pending switch — entering the child column keeps the
        // current parent active (grace behavior, UX doc §1.3).
        if (pending.current) clearTimeout(pending.current);
      }}
    >
      {groups.map((group, gi) => (
        <React.Fragment key={group.label ?? `g${gi}`}>
          {group.label ? (
            <div className="px-2.5 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </div>
          ) : null}
          {/* Real list semantics (axe aria-required-children): li wraps each row link. */}
          <ul className="m-0 list-none p-0">
            {group.nodes.map((node) => (
              <li key={node.id}>
                <MegaMenuCategory
                  node={node}
                  active={node.id === activeId}
                  rootSlug={rootSlug ?? node.slug}
                  showIcon={level === 0}
                  onActivate={scheduleActivate}
                />
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </div>
  );
}

/** Renders the root list + the active root's full subtree panel. Wrap in the keyboard-nav container. */
export function MegaMenuColumns({ className }: { className?: string }) {
  const { roots } = useTaxonomy();
  const { activePath, setActiveAt } = useMenuState();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Default-select the first root on open so the subtree panel is never blank (genre
  // convention — globalsources.com/Alibaba-style flyouts always show a filled panel
  // immediately, not empty space waiting for the first hover).
  React.useEffect(() => {
    if (activePath.length === 0 && roots.length > 0) setActiveAt(0, roots[0].id);
  }, [activePath.length, roots, setActiveAt]);

  // Keyboard map (UX doc §4 + SPEC addendum table). Roving DOM focus over [data-menu-row]
  // links, column-scoped; ArrowRight enters the next column (the row's focus already set the
  // active path), ArrowLeft returns to the active parent.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const target = e.target as HTMLElement;
    if (e.key === "/") {
      const search = document.querySelector<HTMLInputElement>("[data-mega-menu-search]");
      if (search) {
        e.preventDefault();
        search.focus();
      }
      return;
    }
    const column = target.closest<HTMLElement>("[data-menu-column]");
    if (!column) return;
    const rows = Array.from(
      column.querySelectorAll<HTMLElement>("[data-menu-row]:not([data-disabled])"),
    );
    const idx = rows.indexOf(target.closest<HTMLElement>("[data-menu-row]") as HTMLElement);

    const focusRow = (list: HTMLElement[], i: number) => list[i]?.focus();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusRow(rows, (idx + 1) % rows.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusRow(rows, (idx - 1 + rows.length) % rows.length);
        break;
      case "Home":
        e.preventDefault();
        focusRow(rows, 0);
        break;
      case "End":
        e.preventDefault();
        focusRow(rows, rows.length - 1);
        break;
      case "ArrowRight": {
        e.preventDefault();
        const level = Number(column.dataset.menuColumn);
        const next = container.querySelector<HTMLElement>(`[data-menu-column="${level + 1}"]`);
        next?.querySelector<HTMLElement>("[data-menu-row]:not([data-disabled])")?.focus();
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        const level = Number(column.dataset.menuColumn);
        if (level === 0) break;
        const prev = container.querySelector<HTMLElement>(`[data-menu-column="${level - 1}"]`);
        const activeRow = prev?.querySelector<HTMLElement>('[data-menu-row][aria-current="true"]');
        (activeRow ?? prev?.querySelector<HTMLElement>("[data-menu-row]"))?.focus();
        break;
      }
      default: {
        // a–z typeahead within the column.
        if (
          e.key.length === 1 &&
          /[a-z0-9]/i.test(e.key) &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          const letter = e.key.toLowerCase();
          const after = rows.slice(idx + 1).concat(rows.slice(0, idx + 1));
          const hit = after.find((r) => r.textContent?.trim().toLowerCase().startsWith(letter));
          hit?.focus();
        }
      }
    }
  };

  return (
    // Container-scoped key handling over focusable link rows (roving DOM focus, no focus trap —
    // TAB order stays natural per UX doc §4).

    <div ref={containerRef} className={cn("flex min-w-0", className)} onKeyDown={onKeyDown}>
      <MegaMenuColumn level={0} parentId={null} />
      <MegaMenuSubtreePanel rootId={activePath[0] ?? null} />
    </div>
  );
}
