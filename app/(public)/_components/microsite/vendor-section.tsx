// VendorSection — the generic section wrapper for the single-page vendor microsite (M2.5). The frozen
// microsite is ONE page composed of sections (Doc-7D §4 / Doc-2 §3.3 `profile_sections`); this is the
// presentation primitive for those sections. The `id` is the in-page anchor target the microsite
// navigation scrolls to (e.g. #about, #products). Provides a consistent heading + optional description +
// optional right-aligned action. Presentation-only; RSC-friendly.
import type { ReactNode } from "react";
import { cn } from "@/frontend/lib/cn";

export interface VendorSectionProps {
  /** In-page anchor id (scroll target for the microsite nav). */
  id: string;
  title: string;
  description?: string;
  /** Optional right-aligned action (e.g. a "View all" link). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function VendorSection({
  id,
  title,
  description,
  action,
  className,
  children,
}: VendorSectionProps) {
  const headingId = `${id}-heading`;
  return (
    // scroll-mt offsets the sticky platform header + microsite nav so anchored sections aren't hidden.
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-28", className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="text-xl font-semibold tracking-tight text-iv-ink-heading">
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
