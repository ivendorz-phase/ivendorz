"use client";

// Mobile quick-navigation bar (companion §2.5): 4 thumb-reach destinations, mobile only.
// Presentation-only; mirrors the active item from the URL. Hidden at >= md (the rail/drawer take
// over). Active state is conveyed by aria-current (not colour alone) plus weight + colour.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/frontend/lib/cn";
import { VENDOR_QUICKBAR, resolveActiveHref, type VendorNavItem } from "./vendor-nav";

export interface VendorBottomBarProps {
  items?: VendorNavItem[];
  /** Temporary URL prefix for the disposable mount segment (e.g. "/workspace"); see [ESC-7G-A7]. */
  basePath?: string;
  className?: string;
}

export function VendorBottomBar({
  items = VENDOR_QUICKBAR,
  basePath = "",
  className,
}: VendorBottomBarProps) {
  const pathname = usePathname();
  const activeHref = resolveActiveHref(
    pathname,
    items.map((item) => `${basePath}${item.href}`),
  );

  return (
    <nav
      aria-label="Quick navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[var(--iv-z-sticky)] grid grid-cols-4 border-t border-border bg-background md:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const fullHref = `${basePath}${item.href}`;
        const isActive = fullHref === activeHref;
        return (
          <Link
            key={item.id}
            href={fullHref}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-2xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              isActive
                ? "font-semibold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
