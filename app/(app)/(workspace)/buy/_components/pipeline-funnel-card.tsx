// Buyer Workspace — Pipeline Funnel card (shared presentation for the P-BUY-01 lifecycle funnels).
//
// EXTRACTED 2026-07-15 during the reference-driven dashboard revision (owner-directed against the
// "Vendor Dashboard Overview" design project's `Buying Overview` screen). That reference renders a
// lifecycle funnel as ONE proportional segmented bar + legend rather than the previous wide box-grid,
// and places it in the narrow (1fr) right column of a 1.55fr/1fr grid — where a 6-column box grid
// cannot render legibly. The bar form is therefore a layout consequence of the ported composition,
// not a free restyle.
//
// `SourcingPipelineCard` / `EngagementPipelineCard` remain the two named surfaces (their "2 instances
// doesn't meet the rule of three" note stands — they still own their own state→display mapping, title
// and caption) and DELEGATE this shared markup here rather than duplicating it; re-implementing the
// same bar twice would be a Review-A duplication finding.
//
// A BUYER-SCOPED presentation composition of the existing kit `Card` — NOT a new shared kit primitive
// and NOT a design-token change (the frozen kit/tokens are untouched). Pure function of props (Server
// Component; no hooks/fetch — Content ≠ Presentation, Inv #9).
//
// GOVERNANCE (carried verbatim from both callers):
//  • Stage counts are WIRED aggregate reads supplied by the caller — never client-computed (R7) and
//    never re-ranked (rendered in the caller/contract order, GI-04).
//  • Segment WIDTH is a proportional rendering of the supplied counts. The sum is used ONLY to
//    normalize those widths and is NEVER rendered as a figure — a displayed total would be a
//    client-computed aggregate (R7). (The reference's own "86 total" chart footer is dropped for
//    exactly this reason.)
//  • Counts carry NO excluded/blacklist figure (Inv #11); the funnel is observe-only — it decides and
//    recommends nothing (R6).
//  • The bar is `aria-hidden` decoration: the legend below carries every label and count as real text,
//    so meaning never rests on color alone (GI-06).

import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { cn } from "@/frontend/lib/cn";
import type { StatusTone } from "@/frontend/components/status-chip";

/** One rendered funnel segment — a caller-derived display label + tone (via `state-display.ts`) and the
 *  contract-supplied count for that lifecycle state. `key` is the frozen state value. */
export interface PipelineFunnelStage {
  key: string;
  label: string;
  tone: StatusTone;
  count: number;
}

/** Segment fill — the `-base` step of the SAME semantic status ramp `StatusChip`/`Badge` key on
 *  (`app/globals.css` §"SEMANTIC — Status Colors"), so this funnel invents no color language. A
 *  decorative cue only: a tone never implies a governance signal or a "good/bad" judgement. */
const TONE_BAR: Record<StatusTone, string> = {
  brand: "bg-iv-brand-500",
  info: "bg-iv-info-base",
  success: "bg-iv-success-base",
  warning: "bg-iv-warning-base",
  danger: "bg-iv-danger-base",
  neutral: "bg-iv-neutral-base",
};

export function PipelineFunnelCard({
  title,
  stages,
  caption,
  viewAllHref,
  viewAllLabel = "All",
}: {
  title: string;
  stages: PipelineFunnelStage[];
  /** Qualitative descriptor of what the funnel counts — never a second figure, never a trend claim. */
  caption?: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  // Presentation scaling ONLY (see header) — never rendered. Guarded so an all-zero wired read cannot
  // divide by zero; in that case every segment resolves to 0% and the empty track renders alone.
  const total = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="rounded-sm text-xs text-iv-brand-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {viewAllLabel}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Proportional bar — decorative (the legend below is the accessible content, GI-06). */}
        <div
          aria-hidden
          className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-secondary"
        >
          {stages.map((stage) =>
            total > 0 && stage.count > 0 ? (
              <span
                key={stage.key}
                className={cn("h-full min-w-0.5", TONE_BAR[stage.tone])}
                style={{ width: `${(stage.count / total) * 100}%` }}
              />
            ) : null,
          )}
        </div>

        {/* Legend — the funnel's real content: every stage, in the supplied contract order, with its
            own label + count as text. Stages with a zero count still render (an absent stage is the
            read's statement, not ours). */}
        <ol className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {stages.map((stage) => (
            <li key={stage.key} className="flex items-center gap-1.5 text-xs">
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-full", TONE_BAR[stage.tone])}
              />
              <span className="text-muted-foreground">{stage.label}</span>
              <span className="font-semibold tabular-nums text-foreground">{stage.count}</span>
            </li>
          ))}
        </ol>

        {caption ? <p className="mt-3 text-xs text-muted-foreground">{caption}</p> : null}
      </CardContent>
    </Card>
  );
}
