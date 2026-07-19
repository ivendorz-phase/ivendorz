// Vendor RFQ Workspace — pipeline stat cards (S1 header; reference "RFQ Workspace").
//
// A richer presentation of the SAME server-supplied vendor journey buckets that `RfqPipelineSummary`
// renders compactly for the shared header strip: this surface (the vendor RFQ home) shows them as
// full stat cards with a per-bucket icon + semantic tone. Counts are ADAPTER-SUPPLIED — the vendor's
// OWN invitation/quotation facts only (ND-1..ND-8: never a competitor count, rank, or outcome tell) —
// never client-computed (R7), and render in the SUPPLIED ORDER (GI-04). The icon, tone, and sub-label
// are pure presentation keyed on the bucket KEY (a presentation grouping key, never a lifecycle token —
// see rfq-workflow/journey.ts; the kit coins no state). Presentation-only; RSC-friendly (no hooks);
// Content ≠ Presentation (Inv #9). With no wired vendor reads the counts are honest zeros (VX-03).
import { Mail, SquarePen, Send, Users, Trophy, XCircle, Clock, CircleDot } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { JourneyBucketCount } from "../../rfq-workflow/journey";

type Tone = "info" | "warning" | "brand" | "success" | "danger" | "neutral";

// Icon tint pairs mirror the Badge tone system (AA-validated `*-muted` on light / `*-text` on dark
// over the `*-subtle` tint) so the accents stay on-brand and legible in both themes.
const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-iv-info-subtle text-iv-info-muted dark:text-iv-info-text",
  warning: "bg-iv-warning-subtle text-iv-warning-muted dark:text-iv-warning-text",
  brand: "bg-iv-navy-50 text-iv-navy-700 dark:bg-iv-brand-950 dark:text-iv-brand-300",
  success: "bg-iv-success-subtle text-iv-success-muted dark:text-iv-success-text",
  danger: "bg-iv-danger-subtle text-iv-danger-muted dark:text-iv-danger-text",
  neutral: "bg-secondary text-muted-foreground",
};

/** Presentation metadata keyed on the frozen-state-union bucket key (vendorPipelineSummary). The key
 *  is a presentation grouping key, NEVER a lifecycle token. The `hint` is descriptive copy, not a data
 *  claim (no count/total). Unknown keys fall back to a neutral tile so an out-of-range key is safe. */
const BUCKET_PRESENTATION: Record<string, { icon: LucideIcon; tone: Tone; hint: string }> = {
  new: { icon: Mail, tone: "info", hint: "Awaiting your response" },
  preparing: { icon: SquarePen, tone: "warning", hint: "Draft in progress" },
  submitted: { icon: Send, tone: "brand", hint: "Sent to the buyer" },
  shortlisted: { icon: Users, tone: "info", hint: "Under buyer evaluation" },
  won: { icon: Trophy, tone: "success", hint: "You won" },
  not_selected: { icon: XCircle, tone: "danger", hint: "Not chosen this time" },
  closed: { icon: Clock, tone: "neutral", hint: "No longer active" },
};

const FALLBACK = { icon: CircleDot, tone: "neutral" as Tone, hint: "" };

export interface RfqStatCardsProps {
  buckets: JourneyBucketCount[];
  className?: string;
}

export function RfqStatCards({ buckets, className }: RfqStatCardsProps) {
  if (buckets.length === 0) return null;
  return (
    <ol
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7",
        className,
      )}
    >
      {buckets.map((bucket) => {
        const meta = BUCKET_PRESENTATION[bucket.key] ?? FALLBACK;
        const Icon = meta.icon;
        return (
          <li
            key={bucket.key}
            className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-iv-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  TONE_CLASSES[meta.tone],
                )}
              >
                <Icon aria-hidden className="size-[18px]" />
              </span>
              <span className="font-mono text-2xl font-semibold leading-none tabular-nums text-foreground">
                {bucket.count}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{bucket.label}</p>
            {meta.hint ? <p className="mt-0.5 text-xs text-muted-foreground">{meta.hint}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
