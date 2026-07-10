// "Editing affects matching" context banner (DP5 / Content ≠ Presentation). Shown above every
// matching-relevant edit surface in the Company group (S2/S3/S4/S5) so the vendor understands the
// edit changes how buyers match with them. Presentation-only. RSC-friendly.
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

export interface MatchingContextBannerProps {
  className?: string;
  children?: ReactNode;
}

export function MatchingContextBanner({ className, children }: MatchingContextBannerProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-md border border-iv-info-base bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-text",
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{children ?? "Editing here affects how buyers match with you."}</p>
    </div>
  );
}
