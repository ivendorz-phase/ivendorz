"use client";

// Comparison Workspace — matrix presentation helpers shared by the attribute matrix, line-item table, and
// commercial terms: a keyboard-accessible row-explanation tooltip (§2.11A.14) and the per-Vendor focus
// emphasis/subdue classes (§2.11A.5). Focus is emphasis ONLY — it never sorts, re-orders, or ranks, and is
// never labelled Preferred/Best/Top/Recommended.

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/frontend/primitives/tooltip";

/** The one canonical lowest-value explanation — repeated wherever a lowest fact is shown. */
export const LOWEST_TIP = "Arithmetic identification only. This is not a recommendation.";

/** Focus emphasis: a subtle tint + ring on the focused vendor column. GPU/token-only. */
export const FOCUS_EMPHASIS = "bg-iv-info-subtle/50";
/** Focus subdue: the non-focused vendor columns recede (never hidden, never re-ordered). */
export const FOCUS_SUBDUE = "opacity-55";

/**
 * Per-column focus class for a comparison column. `supplierKeys` identifies which columns are vendor columns
 * (so fixed columns like the attribute label or Item/Unit/Qty are never touched); `focusedKey` is the
 * focused vendor's column key (already prefixed to match the table's column keys).
 */
export function focusClass(
  colKey: string,
  focusedKey: string | null,
  supplierKeys: Set<string>,
): string | undefined {
  if (!focusedKey || !supplierKeys.has(colKey)) return undefined;
  return colKey === focusedKey ? FOCUS_EMPHASIS : FOCUS_SUBDUE;
}

/** A small, keyboard-focusable ⓘ that reveals a plain-text explanation. Must sit under a TooltipProvider. */
export function RowTip({ text, label }: { text: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`About ${label}`}
          className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info aria-hidden className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-56 text-pretty">{text}</TooltipContent>
    </Tooltip>
  );
}
