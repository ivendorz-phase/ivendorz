// Vendor Workspace — Dashboard "Recent Activity" panel (VX-01, owner-directed dashboard redesign).
// Pure presentation over caller-supplied rows — this component invents nothing; the dashboard page
// supplies an explicitly-labelled presentation-fixture SEED until a real activity-feed read exists.
// Genuine-empty (no rows) renders the canonical kit EmptyState, never a fabricated placeholder row.
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  /** Server-formatted relative time label ("1h ago") — no client clock. */
  timeLabel: string;
}

export function RecentActivityFeed({ items }: { items: RecentActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <EmptyState title="No recent activity yet" className="py-10" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 p-4">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Clock aria-hidden className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.timeLabel}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
