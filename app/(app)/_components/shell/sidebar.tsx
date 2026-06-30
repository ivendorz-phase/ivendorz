"use client";

// Platform shell — desktop primary sidebar (IA §3.3/§4.3 · Doc-7C SR2). PRESENTATION ONLY: renders the
// nav sections passed by props (derived server-side from participation + role + entitlements — IA §4.1,
// deferred). Active state is read from the current route segment; collapse is an ephemeral presentation
// preference. Counts must be non-disclosure-safe (Invariant #11). Reuses the frozen kit Button.
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Button } from "@/frontend/primitives/button";
import { NAV_ICONS } from "./icons";
import type { NavSection } from "./types";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
}

export function Sidebar({ nav }: { nav: NavSection[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const userToggledRef = React.useRef(false);

  // Tablet auto-collapse: below `lg` (1024px) default to the icon-rail, unless the user pins it.
  // Client-side only — SSR renders expanded and adjusts on mount (no hydration mismatch).
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      if (!userToggledRef.current) setCollapsed(mql.matches);
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return (
    <div
      data-collapsed={collapsed}
      className={cn(
        "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-r border-border bg-card md:flex",
        collapsed ? "w-16" : "w-[264px]",
      )}
    >
      <nav aria-label="Primary" className="flex-1 overflow-y-auto p-3">
        {nav.map((section) => (
          <div key={section.id} className="mb-4 last:mb-0">
            {section.label && !collapsed ? (
              <p className="px-3 pb-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon ? NAV_ICONS[item.icon] : null;
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      {!collapsed && typeof item.badge === "number" && item.badge > 0 ? (
                        <span
                          data-numeric
                          className="ml-auto rounded-full bg-muted px-1.5 text-2xs tabular-nums text-muted-foreground"
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            userToggledRef.current = true;
            setCollapsed((c) => !c);
          }}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full justify-center gap-2"
        >
          {collapsed ? <PanelLeft /> : <PanelLeftClose />}
          {!collapsed ? <span>Collapse</span> : null}
        </Button>
      </div>
    </div>
  );
}
