// RFQ WORKFLOW — Pipeline summary (journey-bucket count tiles).
//
// A row of count tiles over `JourneyBucketCount[]` for the buyer RFQ workspace header and the
// vendor RFQ home. DISTINCT from `SourcingPipelineCard` (P-BUY-01), which renders the frozen
// PER-STATE facet funnel with state chips — this renders the coarser JOURNEY buckets (documented
// unions of frozen states, journey.ts) with plain labels; neither duplicates the other's model.
//
// GOVERNANCE: counts are ADAPTER-SUPPLIED (the stand-in server today; the wired faceted read at
// integration) — never client-computed (R7) — and render in the supplied order (GI-04). Pure
// function of props (Server Component; Content ≠ Presentation, Inv #9).

import Link from "next/link";
import { cn } from "@/frontend/lib/cn";
import type { JourneyBucketCount } from "./journey";

export interface RfqPipelineSummaryProps {
  buckets: JourneyBucketCount[];
  className?: string;
}

export function RfqPipelineSummary({ buckets, className }: RfqPipelineSummaryProps) {
  if (buckets.length === 0) return null;
  return (
    <ol className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8", className)}>
      {buckets.map((bucket) => {
        const body = (
          <>
            <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
              {bucket.count}
            </span>
            <span className="text-xs text-muted-foreground">{bucket.label}</span>
          </>
        );
        return (
          <li key={bucket.key}>
            {bucket.href ? (
              <Link
                href={bucket.href}
                className="flex flex-col gap-0.5 rounded-md border border-border p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {body}
              </Link>
            ) : (
              <div className="flex flex-col gap-0.5 rounded-md border border-border p-3">
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
