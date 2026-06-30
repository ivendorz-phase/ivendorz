// P-BUY-16 route-level loading (SK-DETAIL preset, Doc-7F §II.6 / GI-05). Presentation-only; kit Skeleton.

import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { Skeleton } from "@/frontend/primitives/skeleton";

export default function BuyerClarificationsLoading() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Skeleton className="mb-4 h-4 w-56" />
      <div className="mb-6 border-b border-border pb-4">
        <Skeleton className="h-7 w-48" />
      </div>
      <Card>
        <CardHeader className="p-4">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 p-4 pt-0">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-80" />
        </CardContent>
      </Card>
    </div>
  );
}
