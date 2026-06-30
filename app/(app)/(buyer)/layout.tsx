// Buyer Workspace shell (Surface F · Doc-7F §4.1) — the Dashboard frame every buyer page mounts in:
// topbar + role-scoped "Procurement" sidebar + content region. A SERVER COMPONENT (App Router
// composition only — REPOSITORY_STRUCTURE §8); the interactive controls it renders (topbar menus,
// sidebar active-state, mobile drawer) are the only Client Components, each holding ephemeral UI state.
//
// SCOPE — PRESENTATION ONLY (Content ≠ Presentation, Inv #9): this shell owns no business state, no
// fetch, no mutation. The server-resolved active-org boundary (Doc-7C SR3; Inv #5 — `Iv-Active-Organization`
// is server-set, never browser-set) and the wired Doc-7C shell slots (org-switcher, notification center)
// attach when the GI-02 server data layer is wired (PARKED). Until then the org/user are read-only
// presentational placeholders; no client-supplied org id is ever trusted.
//
// This `(buyer)` route group scopes the shell to buyer pages only — Surface E (`/account`) sits OUTSIDE
// the group and is unaffected. Promotion of this shell frame to a shared Doc-7C `(app)` shell is a
// separate shared-platform task (not coined here).

import type { ReactNode } from "react";
import { BuyerTopbar } from "./_components/buyer-topbar";
import { BuyerSidebar } from "./_components/buyer-sidebar";

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <BuyerTopbar />
      <div className="flex flex-1">
        {/* Desktop sidebar — sticky under the 56px topbar; collapses to the mobile drawer below lg. */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 border-r border-border bg-background lg:block">
          <BuyerSidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
