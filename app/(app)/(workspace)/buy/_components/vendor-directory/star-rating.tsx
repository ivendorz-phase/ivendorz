// StarRating — Tier-2 BUYER component (Shared Platform Component Registry §4.2 kit-promotion
// candidate: promote to the Doc-7B kit once a second workspace needs it). Server-render-friendly
// DISPLAY component: no hooks, no state — a pure function of its props.
//
// Renders the buyer's PRIVATE `private_vendor_ratings` score (Doc-4F §F4 via
// `crm-detail-view-models.ts`) as filled/empty lucide stars. The score RANGE is POLICY-bound
// (`[ESC-OPS-POLICY]`, dev-doc scope) — this component renders the score AS GIVEN and validates
// nothing. Buyer-private data (Inv #11): never vendor-facing, never a platform score.

import { Star } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

export interface StarRatingProps {
  /** The rating score as the read supplies it (range POLICY-bound; rendered as given). */
  score: number;
  /** Number of stars drawn; defaults to the 1–5 presentation scale. */
  max?: number;
  className?: string;
}

export function StarRating({ score, max = 5, className }: StarRatingProps) {
  return (
    <span
      role="img"
      aria-label={`Rated ${score} out of ${max}`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            "size-4",
            i < score ? "fill-iv-amber-500 text-iv-amber-500" : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}
