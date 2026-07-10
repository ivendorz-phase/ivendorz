"use client";

// App component: PaginationControl (Doc-7B / GI-03). Presentation-only. CURSOR pagination ONLY:
// next/previous driven by the contract's `next_cursor`/`has_more` — NO page numbers, NO offset,
// and NO total unless the contract provides one. The surface owns the cursor handlers.
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../primitives/button";
import { cn } from "../lib/cn";

export interface PaginationControlProps extends React.HTMLAttributes<HTMLDivElement> {
  /** There is a next page (the contract returned `has_more` / a `next_cursor`). */
  hasMore: boolean;
  /** A previous page exists in the caller's cursor history. */
  hasPrevious?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  disabled?: boolean;
  /** Optional label, e.g. "Showing 20" — NEVER a page count / offset (no client-computed total). */
  label?: React.ReactNode;
}

export function PaginationControl({
  hasMore,
  hasPrevious = false,
  onNext,
  onPrevious,
  disabled,
  label,
  className,
  ...props
}: PaginationControlProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)} {...props}>
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : <span />}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={disabled || !hasPrevious}
          aria-label="Previous page"
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={disabled || !hasMore}
          aria-label="Next page"
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
