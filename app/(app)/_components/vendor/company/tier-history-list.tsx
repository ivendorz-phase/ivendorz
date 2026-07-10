// Append-only Financial-Tier history (S4) — Invariant 8: immutable, never overwritten/deleted.
// Each entry is a declared (you) or verified (Trust) change. Read-only to the vendor. The real
// read is cursor-paginated (marketplace.get_financial_tier_history.v1); the cursor control is wired
// in the integration phase. Presentation-only; reuses kit EmptyState. RSC-friendly.
import { cn } from "@/frontend/lib/cn";
import { EmptyState } from "@/frontend/components/empty-state";
import { TierChip } from "./tier-chip";
import type { TierHistoryEntry } from "./types";

export interface TierHistoryListProps {
  entries?: TierHistoryEntry[];
  className?: string;
}

export function TierHistoryList({ entries, className }: TierHistoryListProps) {
  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        title="No tier history yet"
        description="Declared and verified tier changes are listed here, newest first."
      />
    );
  }

  return (
    <ol className={cn("space-y-3", className)}>
      {entries.map((entry, index) => (
        <li
          key={`${entry.change_type}-${entry.tier}-${index}`}
          className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="text-sm text-foreground">
              {entry.change_type === "verified" ? "Verified" : "Declared"} → Tier {entry.tier}
            </p>
            <p className="text-xs text-muted-foreground">
              {[entry.actor, entry.at].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
          <TierChip
            tier={entry.tier}
            caption={entry.change_type}
            readOnly={entry.change_type === "verified"}
          />
        </li>
      ))}
    </ol>
  );
}
