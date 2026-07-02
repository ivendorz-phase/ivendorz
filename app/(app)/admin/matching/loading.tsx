// Skeleton-first loading for the internal Matching results surface (admin-queue `loading.tsx` convention,
// P-ADM-08). State-agnostic and identical for every admin — renders no data and infers nothing, a visual
// stand-in while the Server Component streams. Presentation-only; reuses the kit Skeleton + Card.
import { Card } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function MatchingResultsLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-[32rem] max-w-full" />
      </div>

      {/* Internal-service notice */}
      <Skeleton className="h-20 w-full rounded-lg" />

      {/* RFQ picker */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-40" />
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
