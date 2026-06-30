"use client";

// Buyer Workspace — mobile navigation drawer (Doc-7F §4.3 responsive `sidebar → drawer`). CLIENT
// COMPONENT for EPHEMERAL UI ONLY: the open/close state of the off-canvas drawer. Mirrors the public
// shell's mobile-nav pattern, reusing the kit `Sheet`. The drawer ALWAYS closes on navigate (SheetClose).
// Holds no business state; composes kit primitives only.
//
// A11y: trigger has an accessible name; the drawer is a labelled dialog (SheetTitle); each link is
// keyboard-reachable and marked `aria-current` when active. The org context is shown read-only (Inv #5 —
// the browser never sets the active org; this is a presentational placeholder until the Doc-7C switcher
// is wired).

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Building2 } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/frontend/primitives/sheet";
import { Separator } from "@/frontend/primitives/separator";
import { cn } from "@/frontend/lib/cn";
import { BUYER_NAV_GROUPS } from "./buyer-nav-model";

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BuyerMobileNav({ activeOrgName }: { activeOrgName?: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname() ?? "";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation" className="lg:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border p-4 text-left">
          <SheetTitle>Procurement</SheetTitle>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 aria-hidden className="size-4" />
            {activeOrgName ?? "No organization selected"}
          </span>
        </SheetHeader>
        <nav aria-label="Procurement" className="flex flex-col gap-5 overflow-y-auto p-4">
          {BUYER_NAV_GROUPS.map((group) => (
            <div key={group.heading} className="flex flex-col gap-1">
              <p className="px-3 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.heading}
              </p>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-2.5 font-normal text-secondary-foreground",
                            active && "bg-accent font-medium text-foreground",
                          )}
                        >
                          <Link href={item.href} aria-current={active ? "page" : undefined}>
                            <Icon aria-hidden className="text-muted-foreground" />
                            {item.label}
                          </Link>
                        </Button>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <Separator />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
