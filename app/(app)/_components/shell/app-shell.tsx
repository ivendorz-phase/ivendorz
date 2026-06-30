import type { ReactNode } from "react";
import { Topbar } from "./topbar";
import { Sidebar } from "./sidebar";
import type { ShellViewModel } from "./types";

// Platform shell — the Shared Authenticated Shell layout (IA §3.3 · Doc-7C SR2). A Server Component that
// frames every authenticated `(app)` surface: sticky topbar + collapsible sidebar + content region +
// minimal app footer. PRESENTATION ONLY: renders from the typed view-model; the live context resolution
// (`get_active_context`, SR3/SR5) that produces the view-model is DEFERRED wiring. Content is capped at
// `--iv-content-max` (IA §3.3). Each workspace (Buyer / Vendor / Account) composes `<AppShell vm={...}>`.
export function AppShell({ vm, children }: { vm: ShellViewModel; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Skip-to-content — first focusable element; bypasses the topbar + sidebar (WCAG 2.4.1). */}
      <a
        href="#main-content"
        className="sr-only z-[var(--iv-z-toast)] focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-iv-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to content
      </a>
      <Topbar vm={vm} />
      <div className="flex flex-1">
        <Sidebar nav={vm.nav} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-6 sm:px-6">
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
    </div>
  );
}
