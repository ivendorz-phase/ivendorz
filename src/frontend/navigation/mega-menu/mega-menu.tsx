"use client";

// FE-PUB-09 MEGA_MENU — MegaMenu root (MEGA_MENU_COMPONENT_SPEC.md §Mega-menu tier).
// Desktop (≥lg) Industrial Category Explorer. WAI-ARIA **disclosure navigation** implemented
// directly over NavigationMenuStateProvider (trigger button with aria-expanded/aria-controls;
// panel is plain <nav> content) — NOT role="menu", and NOT Radix NavigationMenu: its internal
// position:relative wrapper pins the viewport to the trigger width, which breaks the
// full-width ribbon (found live in the Phase 5 walkthrough; the vendored primitive remains
// available for simpler navs). The panel anchors to the nearest positioned ancestor — the
// sticky site header — at z --iv-z-mega-menu (ARCH §9.3/§9.4).
//
// Open: hover intent (~80ms, FINE pointers only — R2-NITPICK-02) · click · Enter/Space/↓.
// Close: ESC (focus returns to trigger) · outside click · pointer leaves trigger+panel union
// (~250ms grace) · focus leaves the disclosure (TAB past end — no trap on desktop).

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { useTaxonomyOrNull } from "../providers/taxonomy-provider";
import { NavigationMenuStateProvider, useMenuState } from "../providers/menu-state-provider";
import { MenuInstanceProvider, useMenuInstance } from "./menu-context";
import type { MenuInstanceProviderProps } from "./menu-context";
import { MegaMenuColumns } from "./mega-menu-column";
import { MegaMenuEmptyState } from "./mega-menu-empty";
import { MegaMenuFeatured } from "./mega-menu-featured";
import { MegaMenuVendors } from "./mega-menu-vendors";
import { MegaMenuTrail } from "./mega-menu-trail";
import { MegaMenuPopular } from "./mega-menu-popular";
import { MegaMenuIndustryStrip } from "./mega-menu-industry-strip";
import { MegaMenuQuickActions } from "./mega-menu-quick-actions";
import { MegaMenuFooter } from "./mega-menu-footer";
import { MegaMenuSearch } from "./mega-menu-search";
import { MegaMenuRecent } from "./mega-menu-recent";
import type {
  CategoryNodeVM,
  IndustryShortcut,
  MenuVendorVM,
  PopularSearchTerm,
} from "../model/types";

export interface MegaMenuProps extends Pick<
  MenuInstanceProviderProps,
  "source" | "hrefFor" | "onEvent" | "authenticated"
> {
  label?: string;
  /** Open on mount — used by the app-layer preload ladder when the user opened via click. */
  defaultOpen?: boolean;
  /** Addendum slot data — every slot collapses when its data is absent (GI-03). */
  popularSearches?: PopularSearchTerm[];
  industryShortcuts?: IndustryShortcut[];
  vendors?: MenuVendorVM[];
  vendorsViewAllHref?: string;
  viewAllHref?: string;
  /** Reserved authed slots (MINOR-01/02 · R2-MINOR-01) — render nothing until supplied. */
  recent?: CategoryNodeVM[];
  frequent?: CategoryNodeVM[];
  pinned?: CategoryNodeVM[];
  onPinToggle?(node: CategoryNodeVM): void;
  className?: string;
  /** Extra panel content (composed slots). */
  children?: React.ReactNode;
}

type PanelProps = Pick<
  MegaMenuProps,
  | "popularSearches"
  | "industryShortcuts"
  | "vendors"
  | "vendorsViewAllHref"
  | "viewAllHref"
  | "recent"
  | "frequent"
  | "pinned"
  | "onPinToggle"
  | "children"
>;

function MegaMenuPanel({
  popularSearches,
  industryShortcuts,
  vendors,
  vendorsViewAllHref = "/vendors",
  viewAllHref = "/categories",
  recent,
  frequent,
  pinned,
  onPinToggle,
  children,
}: PanelProps) {
  const taxonomy = useTaxonomyOrNull();
  if (!taxonomy || taxonomy.roots.length === 0) return <MegaMenuEmptyState />;

  return (
    <div className="flex flex-col">
      <MegaMenuSearch />
      {children}
      <div className="flex min-w-0">
        <MegaMenuColumns className="min-w-0 flex-1" />
        {/* Right rail — the 5th column tier (≥1280 per ARCH §9.3). */}
        <aside className="hidden w-72 shrink-0 border-s border-border xl:block">
          <MegaMenuFeatured />
          <MegaMenuVendors vendors={vendors} viewAllHref={vendorsViewAllHref} />
        </aside>
      </div>
      <MegaMenuRecent
        recent={recent}
        frequent={frequent}
        pinned={pinned}
        onPinToggle={onPinToggle}
      />
      <MegaMenuTrail className="border-t border-border" />
      <MegaMenuPopular terms={popularSearches} />
      <MegaMenuIndustryStrip shortcuts={industryShortcuts} />
      <MegaMenuQuickActions />
      <MegaMenuFooter viewAllHref={viewAllHref} />
    </div>
  );
}

function MegaMenuDisclosure({
  label,
  className,
  ...panelProps
}: { label: string; className?: string } & PanelProps) {
  const { open, setOpen, close, hoverIntentDelay, resetPath } = useMenuState();
  const { emit } = useMenuInstance();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = React.useId();

  const markOpen = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (!open) {
      emit({ type: "menu_open" });
      setOpen(true);
    }
  }, [open, setOpen, emit]);

  const closeAll = React.useCallback(
    (restoreFocus = false) => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      close();
      resetPath();
      if (restoreFocus) triggerRef.current?.focus();
    },
    [close, resetPath],
  );

  // Outside click closes (UX §1 Close).
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeAll();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, closeAll]);

  React.useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("hidden lg:block", className)}
      // Pointer leaves the trigger+panel union for ~250ms → close (UX §1); re-enter cancels.
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        if (closeTimer.current) clearTimeout(closeTimer.current);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse" || !open) return;
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => closeAll(), hoverIntentDelay.out);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          closeAll(true);
          return;
        }
        // `/` anywhere in the panel focuses the search (SPEC addendum keyboard table).
        if (e.key === "/" && !(e.target as HTMLElement).closest("[data-mega-menu-search]")) {
          const search =
            rootRef.current?.querySelector<HTMLInputElement>("[data-mega-menu-search]");
          if (search) {
            e.preventDefault();
            search.focus();
          }
        }
      }}
      // TAB past the end (focus leaves the disclosure) closes — no trap on desktop (UX §4).
      onBlur={(e) => {
        if (open && !rootRef.current?.contains(e.relatedTarget as Node)) closeAll();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="group inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-accent/60"
        onClick={() => (open ? closeAll() : markOpen())}
        onPointerEnter={(e) => {
          // Hover intent (~80ms) — FINE pointers only; touch is tap-to-open (R2-NITPICK-02).
          if (e.pointerType !== "mouse") return;
          if (openTimer.current) clearTimeout(openTimer.current);
          openTimer.current = setTimeout(markOpen, hoverIntentDelay.in);
        }}
        onPointerLeave={() => {
          if (openTimer.current) clearTimeout(openTimer.current);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            markOpen();
            // Focus the first row of column 1 (UX §4 open behavior).
            requestAnimationFrame(() => {
              rootRef.current
                ?.querySelector<HTMLElement>('[data-menu-column="0"] [data-menu-row]')
                ?.focus();
            });
          }
        }}
      >
        {label}
        <ChevronDown
          aria-hidden
          className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none"
        />
      </button>

      {open ? (
        /* Full-width ribbon: anchored to the nearest positioned ancestor (the sticky header). */
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-[var(--iv-z-mega-menu)] flex justify-center"
        >
          <nav
            aria-label="All categories"
            className="mt-1.5 w-full max-w-[var(--iv-mega-menu-max)] origin-top overflow-hidden rounded-b-lg border border-border bg-popover text-popover-foreground shadow-iv-lg animate-iv-fade-in motion-reduce:animate-none"
          >
            <MegaMenuPanel {...panelProps} />
          </nav>
        </div>
      ) : null}
    </div>
  );
}

export function MegaMenu({
  source,
  hrefFor,
  onEvent,
  authenticated,
  label = "All Categories",
  defaultOpen = false,
  className,
  ...panelProps
}: MegaMenuProps) {
  const taxonomy = useTaxonomyOrNull();
  return (
    <MenuInstanceProvider
      source={source}
      hrefFor={hrefFor}
      onEvent={onEvent}
      authenticated={authenticated}
      pathFor={taxonomy ? (node) => taxonomy.pathTo(node.id) : undefined}
    >
      <NavigationMenuStateProvider>
        <DefaultOpen enabled={defaultOpen} />
        <MegaMenuDisclosure label={label} className={className} {...panelProps} />
      </NavigationMenuStateProvider>
    </MenuInstanceProvider>
  );
}

/** Applies the preload-ladder's click-to-open on mount (inside the state provider). */
function DefaultOpen({ enabled }: { enabled: boolean }) {
  const { setOpen } = useMenuState();
  const applied = React.useRef(false);
  React.useEffect(() => {
    if (enabled && !applied.current) {
      applied.current = true;
      setOpen(true);
    }
  }, [enabled, setOpen]);
  return null;
}
