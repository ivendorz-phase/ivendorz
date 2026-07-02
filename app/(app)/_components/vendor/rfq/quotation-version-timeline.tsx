// Quotation version history (companion §6.4/§13.1 Flow C; Invariant 8 / DP11). Each revision is a NEW
// immutable version (`vN → vN+1`); only the current/superseded designation changes — nothing is
// overwritten or hard-deleted, and superseded versions stay readable. Rendered as a feature-local list
// (the kit has no Timeline; [ESC-7B-VERSION-LIST] is the pending kit addition — progressive disclosure
// is deferred). Presentation-only; RSC-friendly.
//
// FE-VEN-06 delta (P-VND-19): renders the frozen `supersedes_version_no` (already typed on
// `QuotationVersionView`, never previously surfaced) as an explicit "Supersedes vN" reference on every
// non-first version — makes the immutable version chain legible instead of a bare "Superseded" chip.
import { StatusChip } from "@/frontend/components/status-chip";
import type { QuotationVersionView } from "./types";

export interface QuotationVersionTimelineProps {
  versions?: QuotationVersionView[];
}

export function QuotationVersionTimeline({ versions }: QuotationVersionTimelineProps) {
  if (!versions || versions.length === 0) return null;

  return (
    <ol className="space-y-2">
      {versions.map((version) => {
        const current = version.is_current === true;
        return (
          <li
            key={version.version_no}
            className="flex items-center gap-3 rounded-md border border-border p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">v{version.version_no}</p>
              {typeof version.supersedes_version_no === "number" ? (
                <p className="text-xs text-muted-foreground">
                  Supersedes v{version.supersedes_version_no}
                </p>
              ) : null}
              {version.created_at ? (
                <p className="truncate text-xs text-muted-foreground">{version.created_at}</p>
              ) : null}
            </div>
            <StatusChip
              tone={current ? "info" : "neutral"}
              label={current ? "Current" : "Superseded"}
            />
          </li>
        );
      })}
    </ol>
  );
}
