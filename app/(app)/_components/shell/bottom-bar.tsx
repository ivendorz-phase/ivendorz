"use client";

// Platform shell — mobile quick-bar (IA §7). Thumb-reach destinations, MOBILE ONLY (`md:hidden`; the
// sidebar/drawer take over at md+). PRESENTATION ONLY: items are a SUBSET of nav, passed by props.
// Active state is conveyed by aria-current + weight + colour (never colour alone). Reuses NAV_ICONS.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/frontend/lib/cn";
import { NAV_ICONS } from "./icons";
import type { NavItem } from "./types";

function resolveActiveHref(pathname: string, hrefs: string[]): string | null {
  let best: string | null = null;
  for (const href of hrefs) {
    const matches = pathname === href || pathname.startsWith(href + "/");
    if (matches && (best === null || href.length > best.length)) best = href;
  }
  return best;
}

export function BottomBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  if (items.length === 0) return null;
  const activeHref = resolveActiveHref(
    pathname,
    items.map((i) => i.href),
  );

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-[var(--iv-z-sticky)] grid border-t border-border bg-background md:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const Icon = item.icon ? NAV_ICONS[item.icon] : null;
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              active
                ? "font-semibold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon ? <Icon aria-hidden="true" className="size-5 shrink-0" /> : null}
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
