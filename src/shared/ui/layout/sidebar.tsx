"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import type { LucideProps } from "lucide-react";
import { cn } from "@/shared/ui/lib/cn";
import { Logo } from "@/shared/ui/layout/logo";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: ComponentType<LucideProps>;
  /** Optional trailing content such as a count badge. */
  badge?: ReactNode;
  disabled?: boolean;
}

export interface SidebarNavGroup {
  /** Optional section heading shown above the group. */
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarProps {
  groups: SidebarNavGroup[];
  /** Pathname used to compute the active item. */
  activePath?: string;
  /** Optional content rendered at the bottom (e.g. user card, upgrade prompt). */
  footer?: ReactNode;
  className?: string;
}

function isActive(activePath: string | undefined, href: string) {
  if (!activePath) return false;
  if (href === "/") return activePath === "/";
  return activePath === href || activePath.startsWith(`${href}/`);
}

export function Sidebar({ groups, activePath, footer, className }: SidebarProps) {
  return (
    <aside
      className={cn("flex h-full w-64 shrink-0 flex-col border-r border-border bg-card", className)}
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Primary">
        <div className="flex flex-col gap-6">
          {groups.map((group, groupIndex) => (
            <div key={group.label ?? `group-${groupIndex}`} className="flex flex-col gap-1">
              {group.label ? (
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(activePath, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.disabled ? "#" : item.href}
                    aria-current={active ? "page" : undefined}
                    aria-disabled={item.disabled || undefined}
                    tabIndex={item.disabled ? -1 : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      item.disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    {Icon ? (
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                    ) : null}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </nav>
      {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
    </aside>
  );
}
