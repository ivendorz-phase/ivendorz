"use client";

// Buyer Workspace — global topbar (Doc-7F §4.1 / Doc-7C shell). CLIENT COMPONENT for EPHEMERAL UI ONLY
// (the user-menu dropdown + the mobile-drawer trigger). Holds no business state, fetches nothing.
//
// PRESENTATION-ONLY SLOTS (no wiring today — GI-02 server data layer is PARKED):
//  • Org context  — Doc-7C-owned org-switcher (`list_my_organizations` / `switch_active_organization`).
//                   Rendered READ-ONLY here: the browser NEVER sets the active org (Inv #5). Shown as a
//                   static label until the switcher is wired; no client-supplied org id is ever trusted.
//  • Quick Create — Buyer scope is **`New RFQ` only** (→ `create_rfq`). There is deliberately NO
//                   "invite / dispatch vendor" item (engine dispatches invitations; buyer never does —
//                   R6 / Pass-2 §4.2 / carried `[ESC-7-7F-INVITE]`). Targets P-BUY-07 (later milestone).
//  • Search / ⌘K — command-center trigger placeholder; gating mirrors nav derivation when wired.
//  • Notifications — Doc-7C shell slot (M6 / Doc-5H reads). Rendered with NO fabricated count — a count
//                   must be non-disclosure-safe (no excluded/CRM signal), so none is shown until wired.
//  • User menu    — Account (Surface E, `/account`) + Sign out. No theme switcher ships (DEF-03).

import * as React from "react";
import Link from "next/link";
import { Search, Bell, Plus, Building2, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/frontend/primitives/dropdown-menu";
import { BuyerMobileNav } from "./buyer-mobile-nav";

export interface BuyerTopbarProps {
  /** Active organization display name (server-resolved; read-only here). Absent → neutral placeholder. */
  activeOrgName?: string;
  /** Signed-in user's display name (presentation only). Absent → neutral placeholder. */
  userName?: string;
}

export function BuyerTopbar({ activeOrgName, userName }: BuyerTopbarProps) {
  return (
    <header className="sticky top-0 z-[var(--iv-z-sticky)] flex h-14 items-center gap-2 border-b border-border bg-background px-3 sm:gap-3 sm:px-4">
      <BuyerMobileNav activeOrgName={activeOrgName} />

      <Link
        href="/dashboard"
        className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
          iV
        </span>
        <span className="hidden sm:inline">iVendorz</span>
      </Link>

      {/* Org context — read-only switcher slot (Inv #5). Static until the Doc-7C switcher is wired.
          A static display element: the org name is its own accessible text (the icon is aria-hidden),
          so no redundant aria-label is applied to this non-interactive span. */}
      <span className="ml-1 hidden items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-sm text-secondary-foreground sm:flex">
        <Building2 aria-hidden className="size-4 text-muted-foreground" />
        <span className="max-w-[12rem] truncate">
          {activeOrgName ?? "No organization selected"}
        </span>
      </span>

      {/* Command-center / search trigger — presentational placeholder. The label uses the
          secondary-foreground ink (the button default) to meet WCAG-AA contrast on the secondary
          surface; only the decorative (aria-hidden) icon is muted. */}
      <Button
        variant="secondary"
        size="sm"
        className="ml-auto hidden min-w-44 justify-start gap-2 font-normal md:flex"
        aria-label="Search and commands"
      >
        <Search aria-hidden className="text-muted-foreground" />
        <span>Search…</span>
        <kbd className="ml-auto rounded border border-border bg-background px-1.5 text-2xs font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      {/* Quick Create — Buyer scope: New RFQ only (no invite/dispatch control). */}
      <Button asChild size="sm" className="ml-auto gap-1.5 md:ml-2">
        <Link href="/rfqs/new">
          <Plus aria-hidden />
          <span className="hidden sm:inline">New RFQ</span>
        </Link>
      </Button>

      {/* Notifications slot — no fabricated count (non-disclosure-safe). */}
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell />
      </Button>

      {/* User menu — Account (Surface E) + Sign out. No theme switcher (DEF-03). */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu">
            <User />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">{userName ?? "Account"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/account">
              <Settings aria-hidden />
              Account settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/login">
              <LogOut aria-hidden />
              Sign out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
