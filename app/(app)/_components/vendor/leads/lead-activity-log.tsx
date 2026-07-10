// PL-2 Lead Detail — ACTIVITY log (companion §13.2). Append-only (Invariant 8): entries are written via
// `ops.add_lead_activity.v1` (activity_jsonb; server-captured actor_user_id; idempotency) and are NEVER
// edited or deleted. Quick-activity chips (Called / Emailed / Met / Quoted-followup / Note) are a
// CLIENT-CONVENIENCE prefill over `activity_jsonb.type` (the jsonb shape is dev-doc; no frozen activity
// TYPE enum exists). System entries (e.g. "Lead received from invitation") are marked. Logging is
// disabled in the presentation phase. Cursor-paged; renders genuine-empty. Presentation-only; RSC-friendly.
import { Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import type { LeadActivityType, LeadActivityView } from "./types";

const QUICK_CHIPS: { type: LeadActivityType; label: string }[] = [
  { type: "called", label: "Called" },
  { type: "emailed", label: "Emailed" },
  { type: "met", label: "Met" },
  { type: "quoted_followup", label: "Quoted-followup" },
  { type: "note", label: "Note" },
];

export interface LeadActivityLogProps {
  activities?: LeadActivityView[];
}

export function LeadActivityLog({ activities }: LeadActivityLogProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Activity</CardTitle>
        <Button type="button" variant="outline" size="sm" disabled>
          <Plus aria-hidden="true" className="size-4" /> Log
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Quick activity types">
          {QUICK_CHIPS.map((chip) => (
            <Button key={chip.type} type="button" variant="ghost" size="sm" disabled>
              {chip.label}
            </Button>
          ))}
        </div>

        {activities && activities.length > 0 ? (
          <ol className="space-y-2">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex gap-3 rounded-md border border-border p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words text-foreground">{activity.text ?? "Activity"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {activity.created_at ? `${activity.created_at} · ` : ""}
                    {activity.actor_label ?? (activity.is_system ? "system" : "you")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="No activity yet"
            description="Log your calls, meetings and follow-ups here. Entries are kept permanently and never edited."
          />
        )}

        <p className="text-xs text-muted-foreground">
          Logging activity connects in the integration phase.
        </p>
      </CardContent>
    </Card>
  );
}
