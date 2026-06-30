// Loading skeleton for the Vendor Workspace shell (companion §2.5 / §7.2 pattern 1: skeleton-first).
// State-agnostic and IDENTICAL for every vendor (byte-equivalence BE-6 / Invariant 11 — the nav
// frame paints first and no fast path reveals presence/absence). Presentation-only; reuses the kit
// Skeleton. aria-busy marks the streaming region for assistive tech. RSC-friendly (no hooks).
import { Skeleton } from "@/frontend/primitives/skeleton";

export function VendorWorkspaceSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col" aria-busy="true" aria-live="polite">
      {/* top bar */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="ml-auto size-8 rounded-full" />
      </div>

      <div className="flex flex-1">
        {/* rail */}
        <div className="hidden w-64 shrink-0 flex-col gap-2 border-r border-iv-nav-border bg-iv-nav-bg p-3 md:flex">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full rounded-md" />
          ))}
        </div>

        {/* content */}
        <div className="min-w-0 flex-1 space-y-4 p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">Loading vendor workspace…</span>
    </div>
  );
}
