"use client";

// Vendor Workspace primary navigation rail (companion §2.2/§2.5; realizes the Doc-7G GR1–GR12 nav
// surface over Doc-7C SR2). Presentation-only: renders the typed VENDOR_NAV model, marks the active
// item from the URL, and supports a collapsed icon-rail (tablet) with tooltips. Owns no data and
// performs NO permission logic — visibility is resolved server-side and passed as props (Doc-7C
// SR3/SR4; Invariant 10). Requires a TooltipProvider ancestor (the shell provides one).
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/frontend/lib/cn";
import { Separator } from "@/frontend/primitives/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/frontend/primitives/tooltip";
import { VENDOR_NAV, resolveActiveHref, type VendorNavGroup } from "./vendor-nav";

export interface VendorSidebarNavProps {
  groups?: VendorNavGroup[];
  /** Icon-rail mode: labels become tooltips. */
  collapsed?: boolean;
  /**
   * Temporary URL prefix for the disposable mount segment (e.g. "/workspace") while [ESC-7G-A7]
   * is unratified. Defaults to "" (canonical). Post-A7 the layout drops it — components are
   * route-group-agnostic; only the thin layout wrapper changes.
   */
  basePath?: string;
  /** id used to associate the rail with assistive tech (e.g. an aria-controls target). */
  id?: string;
  className?: string;
}

export function VendorSidebarNav({
  groups = VENDOR_NAV,
  collapsed = false,
  basePath = "",
  id,
  className,
}: VendorSidebarNavProps) {
  const pathname = usePathname();
  const allHrefs = React.useMemo(
    () => groups.flatMap((group) => group.items.map((item) => `${basePath}${item.href}`)),
    [groups, basePath],
  );
  const activeHref = resolveActiveHref(pathname, allHrefs);

  return (
    <nav
      id={id}
      aria-label="Vendor workspace"
      className={cn("flex flex-col gap-1 overflow-y-auto px-2 py-3", className)}
    >
      {groups.map((group) => {
        const headingId = group.label ? `vendor-nav-${group.id}` : undefined;
        return (
          <div key={group.id} className="flex flex-col gap-1">
            {group.label && (
              <>
                <Separator className="my-1" />
                <p
                  id={headingId}
                  className={cn(
                    "px-3 pt-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground",
                    collapsed && "sr-only",
                  )}
                >
                  {group.label}
                </p>
              </>
            )}
            <ul className="flex flex-col gap-0.5" aria-labelledby={headingId}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const fullHref = `${basePath}${item.href}`;
                const isActive = fullHref === activeHref;
                const link = (
                  <Link
                    href={fullHref}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
                  </Link>
                );
                return (
                  <li key={item.id}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
