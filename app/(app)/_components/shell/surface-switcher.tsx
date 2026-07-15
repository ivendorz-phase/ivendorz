"use client";

// Platform shell — participation LENS control ([ESC-7G-A7R], Board-RULED 2026-07-15, all sub-decisions
// approved as recommended). The segmented Selling/Buying control from the owner's design reference.
// PRESENTATION ONLY.
//
// READ THIS BEFORE CHANGING THIS FILE — it sits directly on a rank-0 frozen boundary:
//
// This is a LENS, not a toggle. `Doc-7A_Content_v1.0_Pass1.md:144` §4.2 (R6) — "a surface is a
// capability, not an exclusive app" — states the shell "does not partition users into mutually
// exclusive apps", and `[ESC-7G-A7]` (Board, 2026-07-12) rejected the re-routing segmented control
// outright ("Re-routing toggle not shipped"). A7R clears THIS control only because it never
// partitions anything:
//
//  • SD-5 — it ALWAYS renders EVERY surface, active or not. Never hide, disable, omit or gate an
//    entry. The unfocused surface must stay exactly one click away, always.
//  • SD-2 — the active entry is DERIVED FROM THE ROUTE (`resolveActiveSurface`). There is no state
//    here, no cookie, no store, no `useState`. Adding one would let the control lie about where you
//    are and would re-introduce client-asserted context (Invariant #5).
//  • SD-3 — this is NOT an authorization boundary. These are plain `<Link>`s; the server re-validates
//    every action regardless (R7). Anything resembling "the lens gates X" is a BLOCKER.
//  • SD-8 (AMENDED by owner 2026-07-15 — packet SD-8 recommended the topbar; the owner moved it to the
//    TOP OF THE SIDEBAR) — it sits above the nav it filters, which is where it belongs, and the guard
//    SD-8 actually exists for still holds: it is nowhere near the OrgSwitcher, which is "the only
//    org-switch affordance" (`vendor_planning_and_design.md` §2.1) and would read as switching
//    ORGANIZATIONS if a role control sat beside it. Do not mount this next to an OrgSwitcher — which
//    is also why the MOBILE DRAWER does not carry it (IA §7.3 relocates the org switcher into that
//    drawer's header); the drawer applies the lens through its one-click surface headers instead.
//
// Rendering nothing for a single-surface org (`surfaces` unset/one entry) is not a gate — a buyer-only
// org has no second surface to foreground, so there is no lens to offer.
//
// KIT NOTE: `[ESC-7B-SEGMENTED]` records a missing kit segmented-control ("participation/role
// grouping — `tabs` is wrong semantics"). This is the app-tier realization for the single known
// consumer; promoting it into the kit is a separate primitive-promotion ruling, so that ESC stays
// OPEN and this file is the packet-documented fallback (the `document-table-spec.ts` precedent).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/frontend/lib/cn";
import { resolveActiveSurface } from "./hybrid-nav";
import type { SurfaceSwitchItem } from "./types";

export function SurfaceSwitcher({
  surfaces,
  className,
}: {
  surfaces?: SurfaceSwitchItem[];
  className?: string;
}) {
  const pathname = usePathname();

  // A lens needs at least two surfaces to mean anything.
  if (!surfaces || surfaces.length < 2) return null;

  const active = resolveActiveSurface(surfaces, pathname);

  return (
    <div
      // Not a `tablist`: these navigate to real routes rather than swap panels — `tabs` is the wrong
      // semantics ([ESC-7B-SEGMENTED]). A labelled nav group of links is what this actually is.
      aria-label="Workspace"
      role="group"
      // Visibility is the CALLER's to decide (the sidebar hides it in the 64px icon-rail), so no
      // responsive rule is baked in here. Segments are `flex-1` so they split the width evenly —
      // which is what makes this read as a segmented control when stretched across the sidebar rail.
      className={cn(
        "flex items-center gap-0.5 rounded-md border border-input bg-muted p-0.5",
        className,
      )}
    >
      {surfaces.map((surface) => {
        const isActive = surface.label === active;
        return (
          <Link
            key={surface.label}
            href={surface.href}
            // `page` would claim this IS the current page; the control points at a surface's overview,
            // which is usually not where you are. `aria-current="true"` states "this is the active one".
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "flex-1 rounded-[5px] px-3 py-1 text-center text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              // ACTIVE = the kit's own primary FILL (`bg-iv-primary` → `--iv-gradient-primary`, the
              // navy→indigo brand gradient) with `text-primary-foreground`. Reused verbatim from the
              // primary `Button` variant rather than hand-rolled, and it is what the design reference
              // fills its active segment with (`--brand-grad` + #fff).
              // NOTE: `iv-primary` is a GRADIENT token — that is correct for a fill like this; for
              // TEXT or an icon you want `text-primary` (the solid `--iv-brand-600`) instead.
              isActive
                ? "bg-iv-primary text-primary-foreground shadow-iv-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {surface.label}
          </Link>
        );
      })}
    </div>
  );
}
