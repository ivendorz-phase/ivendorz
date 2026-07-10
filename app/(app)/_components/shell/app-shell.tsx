import type { ReactNode } from "react";
import { TooltipProvider } from "@/frontend/primitives/tooltip";
import { cn } from "@/frontend/lib/cn";
import { Topbar } from "./topbar";
import { Sidebar } from "./sidebar";
import { Breadcrumbs } from "./breadcrumbs";
import { BottomBar } from "./bottom-bar";
import type { ShellViewModel } from "./types";

// Platform shell — the single canonical Shared Authenticated Shell (IA §3.3 · Doc-7C SR2). ONE shell,
// multiple workspaces (Buyer / Vendor / Admin). A Server Component that frames every authenticated
// `(app)` surface: skip link → sticky topbar → breadcrumb bar → [collapsible sidebar | content] →
// minimal footer, plus a mobile quick-bar. PRESENTATION ONLY: renders from the typed view-model; the
// live context resolution (get_active_context, SR3/SR5) is DEFERRED.
//
// SHARED infrastructure (one implementation for every workspace): TooltipProvider, responsive logic
// (tablet auto-collapse), the breadcrumb system, the notification center, and the slot pattern. The
// Hybrid "mount-both" nav composition is NOT baked in here — the shell is nav-agnostic (renders whatever
// NavSection[] it is given); that IA decision is [ESC-7G-A7] (pending human Board).
export interface AppShellProps {
  vm: ShellViewModel;
  children: ReactNode;
  /** Slot overrides — default to the shell's own components (Doc-7C-owned slots). */
  orgSwitcherSlot?: ReactNode;
  notificationSlot?: ReactNode;
  userMenuSlot?: ReactNode;
}

export function AppShell({
  vm,
  children,
  orgSwitcherSlot,
  notificationSlot,
  userMenuSlot,
}: AppShellProps) {
  const quickBar = vm.quickBar ?? [];
  const hasQuickBar = quickBar.length > 0;

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        {/* Skip-to-content — first focusable element; bypasses the topbar + sidebar (WCAG 2.4.1). */}
        <a
          href="#main-content"
          className="sr-only z-[var(--iv-z-toast)] focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-iv-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to content
        </a>

        <Topbar
          vm={vm}
          orgSwitcherSlot={orgSwitcherSlot}
          notificationSlot={notificationSlot}
          userMenuSlot={userMenuSlot}
        />

        {vm.breadcrumb && vm.breadcrumb.length > 0 ? (
          <div className="border-b border-border bg-background">
            <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-2 sm:px-6 lg:px-8">
              <Breadcrumbs items={vm.breadcrumb} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-1">
          <Sidebar nav={vm.nav} />
          <div className={cn("flex min-w-0 flex-1 flex-col", hasQuickBar && "pb-16 md:pb-0")}>
            {/* The shell owns the content container (mx-auto max-w-content + padding); pages render content. */}
            <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
              <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground sm:px-6">
              <div className="mx-auto flex w-full max-w-[var(--iv-content-max)] flex-col items-center justify-between gap-2 sm:flex-row">
                <p>© iVendorz — Industrial Procurement OS.</p>
                <p>BDT</p>
              </div>
            </footer>
          </div>
        </div>

        {hasQuickBar ? <BottomBar items={quickBar} /> : null}
      </div>
    </TooltipProvider>
  );
}
