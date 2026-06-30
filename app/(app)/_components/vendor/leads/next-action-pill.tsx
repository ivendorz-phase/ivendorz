// Next-action urgency pill (companion §13.2 M-1). A non-numeric pill driven PURELY by the row's OWN
// `next_action_at` date (own CRM data) — overdue / due today / a future label / "No date". It is NEVER
// an aggregate or a count (ND-8: no lead-stage win-rate or cross-row tally), and there is no client
// clock — the urgency tier and any label are caller/server-supplied. Presentation-only; RSC-friendly.
import { cn } from "@/frontend/lib/cn";
import type { NextActionUrgency } from "./types";

const TONE: Record<NextActionUrgency, string> = {
  none: "text-muted-foreground",
  overdue: "text-iv-danger-text",
  due_today: "text-iv-warning-text",
  upcoming: "text-foreground",
};

export interface NextActionPillProps {
  urgency?: NextActionUrgency;
  /** Server-formatted date or custom text (e.g. "02 Jul", "Re-engage Q4"); own CRM data. */
  label?: string;
  className?: string;
}

export function NextActionPill({ urgency = "none", label, className }: NextActionPillProps) {
  const text =
    urgency === "none"
      ? "No date"
      : urgency === "overdue"
        ? `Overdue${label ? ` ${label}` : ""}`
        : urgency === "due_today"
          ? "Due today"
          : (label ?? "Scheduled");

  return <span className={cn("text-xs font-medium", TONE[urgency], className)}>{text}</span>;
}
