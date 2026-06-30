"use client";

// VendorMicrositeNavigation (M2.5) — the in-page SECTION navigation for the single-page microsite. The
// frozen architecture models the microsite as ONE page of sections (Doc-7D §4) with NO sub-routes and
// NO per-vendor route chrome; so these are ANCHOR links (#about, #products, …) that scroll within the
// page — not route links. (The /vendors/[slug]/about|products|projects|contact URLs exist only as thin
// redirect stubs back to these anchors.) Sticky below the platform header. Client component ONLY because
// the mobile drawer needs interaction (the kit Sheet) — the desktop nav is static. Reuses the kit.
import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/frontend/primitives/sheet";

const SECTIONS = [
  { href: "#vendor-top", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#products", label: "Products" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function VendorMicrositeNavigation() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="sticky top-14 z-[var(--iv-z-sticky)] -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex h-12 items-center justify-between">
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Vendor sections">
          {SECTIONS.map((s) => (
            <Button
              key={s.label}
              asChild
              variant="ghost"
              size="sm"
              className="hover:text-iv-ink-heading"
            >
              <a href={s.href}>{s.label}</a>
            </Button>
          ))}
        </nav>

        <span className="text-sm font-medium text-muted-foreground sm:hidden">Sections</span>

        <div className="sm:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open sections menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Sections</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Vendor sections">
                {SECTIONS.map((s) => (
                  <SheetClose asChild key={s.label}>
                    <Button asChild variant="ghost" className="justify-start">
                      <a href={s.href}>{s.label}</a>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
