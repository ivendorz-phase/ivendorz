"use client";

// P-BUY-RFQ — the canvas SECTION RAIL (owner ruling D1: "provide a persistent section rail · support
// direct navigation between sections · show section completion and error state").
//
// Presentation only: it reads the derived readiness and scrolls. It owns no state and decides nothing.

import * as React from "react";
import { cn } from "@/frontend/lib/cn";
import type { RfqSectionId } from "./rfq-readiness";

export interface RailSection {
  id: RfqSectionId;
  label: string;
  /** Enough answered for the section to read as done. Presentation only — never a gate. */
  complete: boolean;
  /** Unmet submission blockers pointing at this section. */
  blockers: number;
}

export function RfqCanvasRail({
  sections,
  activeId,
  onJump,
  className,
}: {
  sections: RailSection[];
  activeId?: RfqSectionId;
  onJump: (id: RfqSectionId) => void;
  className?: string;
}) {
  return (
    // Sticky, and CAPPED to the viewport: a sticky column taller than the screen hides its own last
    // rows for the whole scroll (found in Stage-3 review, 2026-07-24). Never remove the max-height.
    <nav
      aria-label="RFQ sections"
      className={cn(
        "sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain",
        className,
      )}
    >
      <p className="px-2 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
        Sections
      </p>
      <ul className="space-y-0.5">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              aria-current={activeId === section.id ? "true" : undefined}
              onClick={() => onJump(section.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground/80 transition-colors duration-150 ease-iv-out",
                "hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeId === section.id && "bg-iv-brand-100 font-medium text-iv-brand-800",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full bg-border",
                  section.complete && "bg-iv-success-base",
                  section.blockers > 0 && "bg-iv-warning-base",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{section.label}</span>
              {section.blockers > 0 ? (
                <span className="inline-flex min-w-4 shrink-0 items-center justify-center rounded-full bg-iv-danger-subtle px-1 text-2xs font-bold text-iv-danger-muted dark:text-iv-danger-text">
                  {section.blockers}
                  <span className="sr-only"> items required before submission</span>
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
