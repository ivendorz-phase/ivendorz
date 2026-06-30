"use client";

// Vendor Workspace shell (companion §2.4–§2.5; realizes Doc-7G GR1/GR12 over Doc-7C SR1/SR2).
// Composition-only frame: skip link → top bar (shell-owned slots) → breadcrumb → [rail | content],
// plus a mobile drawer + quick-bar. Owns no data and no domain logic; the shell-owned org switcher,
// notification center and user menu are injected via slots (placeholders during the presentation
// phase). The contested `(vendor)` route group / Hybrid "mount-both" IA ([ESC-7G-A7], pending the
// human Board) is deliberately NOT realized here — this is a reusable component a real `(app)`-group
// layout will mount once A7 is ratified and the roadmap reaches Wave 3.
import * as React from "react";
import { TooltipProvider } from "@/frontend/primitives/tooltip";
import { cn } from "@/frontend/lib/cn";
import { VendorBreadcrumbs, type VendorBreadcrumbItem } from "./vendor-breadcrumbs";
import { VendorBottomBar } from "./vendor-bottom-bar";
import { VendorMobileNav } from "./vendor-mobile-nav";
import { VendorSidebarNav } from "./vendor-sidebar-nav";
import { VendorTopbar, type VendorTopbarOrg } from "./vendor-topbar";
import type { VendorNavGroup, VendorNavItem } from "./vendor-nav";

export interface VendorWorkspaceShellProps {
  children: React.ReactNode;
  org?: VendorTopbarOrg;
  breadcrumb?: VendorBreadcrumbItem[];
  navGroups?: VendorNavGroup[];
  quickBarItems?: VendorNavItem[];
  /**
   * Temporary URL prefix for the disposable mount segment (e.g. "/workspace") while [ESC-7G-A7]
   * (the `(vendor)` route-group name + Hybrid mount-both IA) is unratified. Defaults to "".
   * Post-A7 the layout drops it — the shell + nav are route-group-agnostic by design.
   */
  basePath?: string;
  /** Inject the real shell-owned slots in the integration phase; placeholders render otherwise. */
  orgSwitcherSlot?: React.ReactNode;
  notificationSlot?: React.ReactNode;
  userMenuSlot?: React.ReactNode;
}

export function VendorWorkspaceShell({
  children,
  org,
  breadcrumb,
  navGroups,
  quickBarItems,
  basePath = "",
  orgSwitcherSlot,
  notificationSlot,
  userMenuSlot,
}: VendorWorkspaceShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const userToggledRef = React.useRef(false);

  // Tablet default: collapse the rail to an icon-rail below the lg breakpoint, unless the user has
  // explicitly pinned/unpinned it. Desktop (>= lg) defaults to the expanded rail. Runs client-side
  // only, so SSR renders the expanded rail and adjusts on mount (no hydration mismatch).
  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      if (!userToggledRef.current) setCollapsed(query.matches);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    userToggledRef.current = true;
    setCollapsed((value) => !value);
  }, []);

  const openMobileNav = React.useCallback(() => setMobileNavOpen(true), []);

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <a
          href="#vendor-main"
          className="sr-only z-[var(--iv-z-modal)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-iv-md"
        >
          Skip to content
        </a>

        <VendorTopbar
          org={org}
          basePath={basePath}
          orgSwitcherSlot={orgSwitcherSlot}
          notificationSlot={notificationSlot}
          userMenuSlot={userMenuSlot}
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggleSidebar}
          onOpenMobileNav={openMobileNav}
        />

        {breadcrumb && breadcrumb.length > 0 && (
          <div className="border-b border-border bg-background">
            <div className="px-4 py-2 sm:px-6">
              <VendorBreadcrumbs items={breadcrumb} />
            </div>
          </div>
        )}

        <div className="flex flex-1">
          <aside
            className={cn(
              "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 border-r border-iv-nav-border bg-iv-nav-bg transition-[width] duration-200 md:flex md:flex-col",
              collapsed ? "w-16" : "w-64",
            )}
          >
            <VendorSidebarNav
              id="vendor-rail"
              groups={navGroups}
              collapsed={collapsed}
              basePath={basePath}
              className="flex-1"
            />
          </aside>

          <main id="vendor-main" className="min-w-0 flex-1 px-4 pb-20 pt-4 sm:px-6 md:pb-8">
            {children}
          </main>
        </div>

        <VendorMobileNav
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          groups={navGroups}
          basePath={basePath}
        />
        <VendorBottomBar items={quickBarItems} basePath={basePath} />
      </div>
    </TooltipProvider>
  );
}
