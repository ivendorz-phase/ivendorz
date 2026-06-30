// Content-area loading skeleton for vendor workspace pages (companion §7.2 pattern 1: skeleton-
// first). Used by route-segment loading.tsx files INSIDE the shell (the shell itself is static, so
// only the content streams). State-agnostic and identical for every vendor (byte-equivalence BE-6).
// Presentation-only; reuses the kit Skeleton. RSC-friendly.
import { Skeleton } from "@/frontend/primitives/skeleton";

export function VendorContentSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-lg" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
