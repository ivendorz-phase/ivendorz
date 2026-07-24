// OriginBadge — the per-row origin badge (spec §4): "Marketplace" / "Private". Server-render-
// friendly (no hooks). Origin is DERIVED from the frozen `link_status` (spec §3 — source, not
// trust level; no type enum exists in the corpus) and renders via the kit `Badge`: brand tone
// for Marketplace, outline treatment for Private — never a StatusChip (origin is not a frozen
// status; see the `directory-display.ts` encoding rule).

import { Badge } from "@/frontend/primitives/badge";
import { cn } from "@/frontend/lib/cn";
import { originDisplay } from "./directory-display";
import type { VendorOrigin } from "./vendor-directory-view-models";

export interface OriginBadgeProps {
  origin: VendorOrigin;
  className?: string;
}

export function OriginBadge({ origin, className }: OriginBadgeProps) {
  const { label } = originDisplay[origin];
  if (origin === "marketplace") {
    return (
      <Badge variant="brand" className={className}>
        {label}
      </Badge>
    );
  }
  // Private = the outline treatment (kit neutral variant, transparent fill).
  return (
    <Badge variant="neutral" className={cn("bg-transparent", className)}>
      {label}
    </Badge>
  );
}
