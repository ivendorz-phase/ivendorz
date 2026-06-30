"use client";

// Mobile navigation drawer (companion §2.5): the full grouped Vendor nav in a Sheet, plus the
// Bn/En locale control in the drawer header (canonical placement per companion §2.7). Reuses the
// kit Sheet (focus trap + close handled by Radix) and the VendorSidebarNav (no duplication). The
// drawer auto-closes on navigation. Presentation-only.
import * as React from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/frontend/primitives/sheet";
import { VendorSidebarNav } from "./vendor-sidebar-nav";
import { LocaleTogglePlaceholder } from "./vendor-shell-slot";
import type { VendorNavGroup } from "./vendor-nav";

export interface VendorMobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups?: VendorNavGroup[];
  /** Temporary URL prefix for the disposable mount segment (e.g. "/workspace"); see [ESC-7G-A7]. */
  basePath?: string;
}

export function VendorMobileNav({ open, onOpenChange, groups, basePath }: VendorMobileNavProps) {
  const pathname = usePathname();
  const isFirstRender = React.useRef(true);

  // Close the drawer after a navigation (pathname change) — Radix does not auto-close on route.
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex-row items-center justify-between gap-2 border-b border-border px-4 py-3 text-left">
          <SheetTitle>Vendor workspace</SheetTitle>
          <LocaleTogglePlaceholder />
        </SheetHeader>
        <VendorSidebarNav groups={groups} basePath={basePath} className="py-2" />
      </SheetContent>
    </Sheet>
  );
}
