// Vendor's category assignments (S5) with status (proposed / active / removed). Read-only display;
// status shown as a labelled chip (never colour alone). Vendor proposes; Admin approves out-of-wire
// (M2/Admin-governed) — no vendor approval affordance, no rejection-reason inference. Presentation-
// only; reuses kit StatusChip + EmptyState. RSC-friendly.
import { cn } from "@/frontend/lib/cn";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import type { CategoryAssignmentStatus, CategoryAssignmentView } from "./types";

const STATUS_TONE: Record<CategoryAssignmentStatus, StatusTone> = {
  proposed: "warning",
  active: "success",
  removed: "neutral",
};

const STATUS_LABEL: Record<CategoryAssignmentStatus, string> = {
  proposed: "Proposed",
  active: "Active",
  removed: "Removed",
};

export interface CategoryAssignmentListProps {
  assignments?: CategoryAssignmentView[];
  className?: string;
}

export function CategoryAssignmentList({ assignments, className }: CategoryAssignmentListProps) {
  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        title="No categories assigned yet"
        description="Propose categories below. An admin reviews each proposal before it becomes active."
      />
    );
  }

  return (
    <ul className={cn("divide-y divide-border rounded-md border border-border", className)}>
      {assignments.map((assignment) => (
        <li key={assignment.category_id} className="flex items-center gap-3 p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {assignment.name ?? assignment.category_id}
            </p>
            {assignment.description ? (
              <p className="truncate text-xs text-muted-foreground">{assignment.description}</p>
            ) : null}
            {(assignment.level || assignment.is_specialized) && (
              <p className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground">
                {[assignment.level, assignment.is_specialized ? "specialized" : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
          <StatusChip
            label={STATUS_LABEL[assignment.status]}
            tone={STATUS_TONE[assignment.status]}
          />
        </li>
      ))}
    </ul>
  );
}
