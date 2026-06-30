// Landing section shell — a consistent header (title + optional description + optional "view all"
// action) and content slot for the M2 landing sections (SEC-CATEGORY/SUPPLIERS/PRODUCTS). Pure Server
// Component; composes the kit Button only. A11y: each section is an `aria-labelledby` region keyed to
// its <h2> (SC §1 GI-06). Width caps at --iv-content-max to match the Hero measure.
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

export interface LandingSectionProps {
  /** Section element id (also seeds the heading id) — e.g. "sec-suppliers". */
  id: string;
  title: string;
  description?: string;
  /** Optional "view all" action; the href is the canonical discovery route (activates in M2.2/M2.3). */
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
}

export function LandingSection({
  id,
  title,
  description,
  viewAllHref,
  viewAllLabel = "View all",
  children,
}: LandingSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="border-b border-border py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            <h2 id={headingId} className="text-2xl font-bold tracking-tight text-iv-ink-heading">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-iv-ink-secondary">{description}</p>
            ) : null}
          </div>
          {viewAllHref ? (
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href={viewAllHref}>
                {viewAllLabel}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
