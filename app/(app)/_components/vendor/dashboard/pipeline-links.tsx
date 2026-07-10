// Quotation/pipeline links for the vendor dashboard (companion §3).
//
// NON-NUMERIC by design: per the analytics denominator law (GR11 / CHK-7-040) and the pending
// pipeline-count contract ([ESC-7G-PIPE-CONTRACT]), the dashboard exposes navigational links ONLY
// — never counts, ratios, or "N of M". Absence is never disclosed (byte-equivalence). Presentation-
// only; the page supplies fully-resolved hrefs. RSC-friendly.
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

export interface PipelineLinkItem {
  label: string;
  href: string;
}

export interface PipelineLinksProps {
  items: PipelineLinkItem[];
  className?: string;
}

export function PipelineLinks({ items, className }: PipelineLinksProps) {
  return (
    <ul className={cn("divide-y divide-border", className)}>
      {items.map((item) => (
        <li key={item.label}>
          <Link
            href={item.href}
            className="flex items-center justify-between gap-2 rounded-sm py-2.5 text-sm text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>{item.label}</span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
