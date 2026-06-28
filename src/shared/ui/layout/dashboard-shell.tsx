"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/shared/ui/lib/cn";
import { Button } from "@/shared/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/shared/ui/drawer";
import { Navbar } from "@/shared/ui/layout/navbar";
import { Sidebar, type SidebarNavGroup } from "@/shared/ui/layout/sidebar";

export interface DashboardShellProps {
  navGroups: SidebarNavGroup[];
  activePath?: string;
  /** Optional sidebar footer content (user card, etc.). */
  sidebarFooter?: ReactNode;
  /** Navbar center slot, typically a search field. */
  navbarCenter?: ReactNode;
  /** Navbar trailing actions. */
  navbarActions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardShell({
  navGroups,
  activePath,
  sidebarFooter,
  navbarCenter,
  navbarActions,
  children,
  className,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={cn("flex min-h-screen bg-background", className)}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar groups={navGroups} activePath={activePath} footer={sidebarFooter} />
        </div>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          leading={
            <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent side="left" className="w-72 p-0">
                <DrawerTitle className="sr-only">Navigation</DrawerTitle>
                <Sidebar
                  groups={navGroups}
                  activePath={activePath}
                  footer={sidebarFooter}
                  className="w-full border-r-0"
                />
              </DrawerContent>
            </Drawer>
          }
          center={navbarCenter}
          actions={navbarActions}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
