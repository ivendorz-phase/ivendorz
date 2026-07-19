"use client";

// Top-right Workspace Switcher (owner-directed refactor, 2026-07-18) — replaces the separate
// org-switcher + user-menu with ONE dropdown that both switches the active workspace and holds the
// org/account menu. The organization card holds NO business logic: the subtitle (Vendor/Buyer) is
// DERIVED from the active workspace via the registry (`config.subtitle`).
//
// VARIANT is driven by the org's platform participation (Invariant #2), NEVER by authorization (R7 —
// the server re-validates every action; this only decides what to show):
//   • vendor / hybrid → both workspaces switchable, Billing shown.
//   • buyer-only      → Buyer active; Seller shown DISABLED with a "Become a Vendor" upgrade path;
//                       no Billing (a buyer-only org has no vendor plan surface).
//
// Only pages that EXIST are linked (no disabled/404 menu entries) — every href below is a real route
// (`/account/*` verified present). Log out is a native POST form (a GET logout would be prefetched on
// hover and clear the session unbidden). Reuses the frozen kit DropdownMenu/Avatar/Button.
import Link from "next/link";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  LifeBuoy,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/frontend/primitives/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/frontend/primitives/dropdown-menu";
import { initials, type PlatformParticipation, type ShellIdentity } from "../shell";
import { WORKSPACE_REGISTRY, useWorkspace, type Workspace } from "./workspace-context";

export function WorkspaceSwitcher({
  identity,
  participation,
}: {
  identity: ShellIdentity;
  participation: PlatformParticipation;
}) {
  const { workspace, setWorkspace, config } = useWorkspace();
  const canSell = participation === "vendor" || participation === "hybrid";
  const org = identity.activeOrg;

  // Switch order: a vendor org leads with Seller; a buyer-only org leads with Buyer (its own workspace)
  // then the disabled Seller upgrade. Never hardcodes the subtitle — it comes from the registry.
  const switches: Workspace[] = canSell ? ["seller", "buyer"] : ["buyer", "seller"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2.5 py-1.5 pl-1.5 pr-2.5"
          aria-label="Workspace and account menu"
        >
          <Avatar className="size-8 rounded-lg">
            {identity.user.avatarUrl ? <AvatarImage src={identity.user.avatarUrl} alt="" /> : null}
            <AvatarFallback className="rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              {initials(org.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
            <span className="max-w-[160px] truncate text-sm font-semibold text-foreground">
              {org.name}
            </span>
            <span className="text-xs text-muted-foreground">{config.subtitle}</span>
          </span>
          <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate font-medium">{org.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {config.subtitle} workspace
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {switches.map((ws) => {
          // Icon comes from the registry (single source of truth, shared with the sidebar header).
          const Icon = WORKSPACE_REGISTRY[ws].icon;
          const active = ws === workspace;
          const locked = ws === "seller" && !canSell;
          if (locked) {
            // Buyer-only org: Seller Dashboard is not in the navigable set (no vendor participation).
            // Shown as a disabled upgrade path, never a working link.
            return (
              <DropdownMenuItem
                key={ws}
                disabled
                className="flex-col items-start gap-0.5 opacity-100"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon aria-hidden className="size-4" />
                  {WORKSPACE_REGISTRY[ws].label}
                </span>
                <span className="flex items-center gap-1 pl-6 text-xs text-primary">
                  <Sparkles aria-hidden className="size-3" />
                  Become a Vendor
                </span>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem
              key={ws}
              onSelect={() => setWorkspace(ws)}
              aria-current={active ? "true" : undefined}
              className="cursor-pointer"
            >
              <Icon aria-hidden className="size-4" />
              {WORKSPACE_REGISTRY[ws].label}
              {active ? <Check aria-hidden className="ml-auto size-4" /> : null}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account/settings">
            <Settings aria-hidden /> Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/organization">
            <Building2 aria-hidden /> Organization Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/notifications">
            <Bell aria-hidden /> Notifications
          </Link>
        </DropdownMenuItem>
        {canSell ? (
          <DropdownMenuItem asChild>
            <Link href="/account/billing">
              <CreditCard aria-hidden /> Billing
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/contact">
            <LifeBuoy aria-hidden /> Contact support
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <form action="/logout" method="post">
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <LogOut aria-hidden /> Logout
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
