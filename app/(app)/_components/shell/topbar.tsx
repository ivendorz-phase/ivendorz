import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { MobileNav } from "./mobile-nav";
import { OrgSwitcher } from "./org-switcher";
import { QuickCreate } from "./quick-create";
import { NotificationCenter } from "./notification-center";
import { UserMenu } from "./user-menu";
import type { ShellViewModel } from "./types";

// Platform shell — topbar (IA §3.3/§4.2 · Doc-7C SR2/SR3/SR6). A Server Component composing the shell
// slots; the interactive controls (mobile nav, org-switcher, quick-create, notifications, user menu) are
// their own Client Components. Sticky, 56px (h-14). PRESENTATION ONLY — wires nothing.
//
// SLOT PATTERN: orgSwitcherSlot / notificationSlot / userMenuSlot let a workspace (or the integration
// layer) inject custom shell-owned slots; each DEFAULTS to the shell's own component.
export interface TopbarProps {
  vm: ShellViewModel;
  orgSwitcherSlot?: ReactNode;
  notificationSlot?: ReactNode;
  userMenuSlot?: ReactNode;
}

export function Topbar({ vm, orgSwitcherSlot, notificationSlot, userMenuSlot }: TopbarProps) {
  const { identity, nav, quickCreate, notifications, unreadCount } = vm;
  return (
    <header className="sticky top-0 z-[var(--iv-z-sticky)] flex h-14 items-center gap-2 border-b border-border bg-background px-3 sm:px-4">
      <MobileNav nav={nav} org={identity.activeOrg} organizations={identity.organizations} />
      <Link
        href="/dashboard"
        className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
          iV
        </span>
        <span className="hidden sm:inline">iVendorz</span>
      </Link>

      <div className="ml-1 hidden md:block">
        {orgSwitcherSlot ?? (
          <OrgSwitcher activeOrg={identity.activeOrg} organizations={identity.organizations} />
        )}
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {quickCreate && quickCreate.length > 0 ? <QuickCreate items={quickCreate} /> : null}
        {/* AI assistant — reserved entry; future activation (Invariant #12; IA §4.10). aria-disabled,
            focusable, and inert: a Server Component, so no onClick — type="button" has no default action. */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-disabled="true"
          aria-label="AI Assistant — coming soon"
          className="hidden cursor-not-allowed opacity-60 sm:inline-flex"
        >
          <Sparkles />
        </Button>
        {notificationSlot ?? (
          <NotificationCenter notifications={notifications} unreadCount={unreadCount} />
        )}
        {userMenuSlot ?? <UserMenu user={identity.user} />}
      </div>
    </header>
  );
}
