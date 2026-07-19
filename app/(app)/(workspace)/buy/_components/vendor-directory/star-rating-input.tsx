"use client";

// StarRatingInput — Tier-2 BUYER form control for the private "My rating"
// (`ops.set_private_vendor_rating.v1`, spec §2 — PARKED; presentation-only, NO persistence:
// the value round-trips through props, nothing is written). Hover + click selection of 1–5 on
// the WAI-ARIA radiogroup pattern (roving tabindex; arrow keys move AND select, radio-style).
// Buyer-private data (Inv #11): never vendor-facing, never a platform score.

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

const MAX = 5;

export interface StarRatingInputProps {
  /** The selected score (0 = nothing selected yet). */
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function StarRatingInput({ value, onChange, disabled, className }: StarRatingInputProps) {
  const [hovered, setHovered] = React.useState(0);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const shown = hovered > 0 ? hovered : value;

  function select(next: number) {
    if (disabled) return;
    const clamped = Math.min(MAX, Math.max(1, next));
    onChange(clamped);
    refs.current[clamped - 1]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        select((value || 0) + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        select((value || 2) - 1);
        break;
      case "Home":
        e.preventDefault();
        select(1);
        break;
      case "End":
        e.preventDefault();
        select(MAX);
        break;
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="My rating"
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: MAX }, (_, i) => {
        const star = i + 1;
        const checked = value === star;
        return (
          <button
            key={star}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            // Roving tabindex: the selected star is tabbable; with no selection, the first is.
            tabIndex={checked || (value < 1 && star === 1) ? 0 : -1}
            disabled={disabled}
            className={cn(
              "rounded-sm p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
            onClick={() => select(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onKeyDown={handleKeyDown}
          >
            <Star
              aria-hidden
              className={cn(
                "size-5",
                star <= shown ? "fill-iv-amber-500 text-iv-amber-500" : "text-muted-foreground/30",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
