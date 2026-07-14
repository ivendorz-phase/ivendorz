// Vendor Workspace — Dashboard "Recent Activity" panel (VX-01, owner-directed dashboard redesign).
// Pure presentation over caller-supplied rows — this component invents nothing; the dashboard page
// supplies an explicitly-labelled presentation-fixture SEED until a real activity-feed read exists.
// Genuine-empty (no rows) renders the canonical kit EmptyState, never a fabricated placeholder row.
import { Clock, Inbox } from "lucide-react";
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
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 border-b border-border p-5">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        {items.length > 0 ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-xs font-medium tabular-nums text-secondary-foreground">
            {items.length}
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <EmptyState
            icon={<Inbox aria-hidden />}
            title="No recent activity yet"
            description="New RFQs, quotes, and buyer messages matching your profile will appear here."
            className="border-0 py-12"
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 p-5 transition-colors duration-normal ease-iv-out hover:bg-iv-hover"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-iv-brand-50 text-iv-brand-600">
                  <Clock aria-hidden className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-semibold text-iv-ink-strong">{item.title}</p>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {item.timeLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
