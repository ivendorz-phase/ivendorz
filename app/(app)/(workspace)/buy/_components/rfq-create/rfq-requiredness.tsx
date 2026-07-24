// P-BUY-RFQ (P-BUY-07) Phase 2 — REQUIREDNESS TAXONOMY (D3). Four DISTINCT badges — never collapsed
// into one red asterisk. Presentation-only.
//
//   • Required to start        — Tier 1, satisfied in Zone 1 (category · work nature).
//   • Required before submission — Tier 2, in the frozen submission FIXED-set (Doc-3 §1.2).
//   • Conditionally required   — required depending on another answer (the spec ⟂ no_formal_spec rule).
//   • Optional                 — never blocks submission.
//
// MANDATORY (D3): `estimated_value` carries "Required before submission" — the rejected
// "Budget & priority (optional)" / "Optional — commercial guidance" wording is not used anywhere.

import { cn } from "@/frontend/lib/cn";

export type Requiredness = "start" | "submit" | "conditional" | "optional";

const BADGE_LABEL: Record<Requiredness, string> = {
  start: "Required to start",
  submit: "Required before submission",
  conditional: "Conditionally required",
  optional: "Optional",
};

const BADGE_CLASS: Record<Requiredness, string> = {
  start: "border-transparent bg-iv-brand-100 text-iv-brand-800",
  submit: "border-iv-warning-base/30 bg-iv-warning-subtle text-iv-warning-muted",
  conditional: "border-iv-info-base/25 bg-iv-info-subtle text-iv-info-base",
  optional: "border-border bg-transparent text-muted-foreground",
};

export function RequirednessBadge({
  level,
  label,
  className,
}: {
  level: Requiredness;
  /** Override the default badge text (e.g. "Optional hint"); the tone stays keyed to `level`. */
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-2xs font-bold tracking-wide",
        BADGE_CLASS[level],
        className,
      )}
    >
      {label ?? BADGE_LABEL[level]}
    </span>
  );
}

/** The field legend rendered atop the canvas so the four badges read as a system, not decoration. */
export function RequirednessLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-card px-3.5 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="font-semibold text-foreground">Field legend</span>
      <span className="inline-flex items-center gap-1.5">
        <RequirednessBadge level="start" /> set in Zone 1
      </span>
      <span className="inline-flex items-center gap-1.5">
        <RequirednessBadge level="submit" /> Doc-3 §1.2 FIXED-set
      </span>
      <span className="inline-flex items-center gap-1.5">
        <RequirednessBadge level="conditional" /> depends on another answer
      </span>
      <span className="inline-flex items-center gap-1.5">
        <RequirednessBadge level="optional" /> never blocks
      </span>
    </div>
  );
}
