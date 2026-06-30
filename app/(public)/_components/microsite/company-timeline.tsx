// CompanyTimeline (M2.6) — the company history / milestones, as a reusable vertical timeline. Each entry
// is an editorial milestone (optional label + title + description); the seed omits fabricated dates.
// Presentation-only; genuine-empty when absent. No frozen field; coins nothing. Reuses the kit tokens;
// RSC-friendly.
import type { CompanyTimelineEntryVM } from "./company-content-seed";

export interface CompanyTimelineProps {
  entries?: CompanyTimelineEntryVM[];
}

export function CompanyTimeline({ entries }: CompanyTimelineProps) {
  if (!entries || entries.length === 0) return null;
  return (
    <ol className="relative ml-2 border-l border-border">
      {entries.map((entry, index) => (
        <li key={`${entry.title}-${index}`} className="ml-6 pb-6 last:pb-0">
          <span
            aria-hidden="true"
            className="absolute -left-[6.5px] mt-1.5 size-3 rounded-full border-2 border-background bg-iv-navy-700"
          />
          {entry.year ? (
            <p className="text-xs font-medium uppercase tracking-wide text-iv-navy-700">
              {entry.year}
            </p>
          ) : null}
          <p className="text-sm font-semibold text-iv-ink-heading">{entry.title}</p>
          {entry.description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{entry.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
