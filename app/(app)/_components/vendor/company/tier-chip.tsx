// Financial-tier chip (A–E) for the vendor Company Profile (S1/S4). Presentation-only.
//
// This is the FINANCIAL TIER signal (capability size A–E) — distinct from the Trust/Performance
// SCORE that is blocked by [ESC-7G-SCORE-DISPLAY]/[ESC-7B-TRUSTSCORE]. It never renders a 0–100
// score and never uses the kit `trust-badge`. The tier letter is shown as text (legible, not colour-
// alone) with the design `--iv-tier-*` token only as a small accent dot. A pending kit primitive
// ([ESC-7B-TIER-CHIP], MAJOR) will eventually own this; until then it is a feature-local component
// (not a kit change). RSC-friendly.
import { cn } from "@/frontend/lib/cn";
import type { FinancialTier } from "./types";

const TIER_DOT: Record<FinancialTier, string> = {
  A: "bg-iv-tier-a",
  B: "bg-iv-tier-b",
  C: "bg-iv-tier-c",
  D: "bg-iv-tier-d",
  E: "bg-iv-tier-e",
};

export interface TierChipProps {
  tier?: FinancialTier | null;
  /** Short caption after the tier (e.g. "declared", "verified"). */
  caption?: string;
  /** Marks the value Trust-owned/read-only (verified tier). Visual + a11y only. */
  readOnly?: boolean;
  className?: string;
}

export function TierChip({ tier, caption, readOnly, className }: TierChipProps) {
  if (!tier) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground",
          className,
        )}
      >
        Not set{caption ? ` · ${caption}` : ""}
      </span>
    );
  }

  return (
    <span
      aria-label={`Financial tier ${tier}${caption ? ` (${caption})` : ""}${readOnly ? ", read-only" : ""}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-2 rounded-full", TIER_DOT[tier])} />
      <span>Tier {tier}</span>
      {caption ? <span className="font-normal text-muted-foreground">· {caption}</span> : null}
    </span>
  );
}
