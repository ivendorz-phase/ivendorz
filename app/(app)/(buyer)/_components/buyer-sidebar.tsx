"use client";

// Buyer Workspace — desktop role-scoped sidebar ("Procurement", Doc-7F §4.1 / Doc-7C shell slot).
// CLIENT COMPONENT for EPHEMERAL UI ONLY: active-link highlighting via `usePathname`. It holds no
// business state, fetches nothing, and decides nothing (Content ≠ Presentation, Inv #9). The navigable
// set is server-derived (Inv #10/#7); this renders the presentation default (`BUYER_NAV_GROUPS`).
//
// A11y: a single labelled `<nav>` landmark; grouped lists with group headings; the active item carries
// `aria-current="page"`; focus-visible ring is the global token. Composes the kit Button primitive only.

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/frontend/primitives/button";
import { cn } from "@/frontend/lib/cn";
import { BUYER_NAV_GROUPS, type BuyerNavGroup } from "./buyer-nav-model";

/** True when `href` is the active route (exact match, or a section prefix for nested detail routes). */
function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BuyerSidebar({ groups = BUYER_NAV_GROUPS }: { groups?: readonly BuyerNavGroup[] }) {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Procurement" className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      {groups.map((group) => (
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
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
