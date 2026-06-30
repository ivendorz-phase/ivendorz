// Landing section shell — consistent header (title + optional description + a generic header action
// slot) and a content slot, for the M2 landing sections (SEC-CATEGORY/SUPPLIERS/PRODUCTS). Pure Server
// Component; composes the kit Button only. A11y: each section is an `aria-labelledby` region keyed to
// its <h2> (SC §1 GI-06). Width caps at --iv-content-max to match the Hero measure.
//
// EXTENSION CONTRACT (MINOR-2 — extension points without over-reach):
//  • `action`  — a generic header-right slot (ReactNode). Inject any control: a "view all" link, a
//                filter, a featured ribbon, etc. `viewAllHref` is a convenience for the common case.
//  • children  — the content slot. Content STATES (loading skeleton · empty · cursor pagination) are
//                owned by the content / the M2.2 ResultsGrid, NOT by this chrome (clean separation).
//  • DEFERRED (deliberately NOT slots here): a "sponsored" ribbon → there is no public ads surface
//    ([ESC-7-API-ADS]); and analytics hooks → wiring, GI-12-governed, not presentation. Adding either
//    now would couple this presentation shell to a capability we do not (yet) have.
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

export interface LandingSectionProps {
  /** Section element id (also seeds the heading id) — e.g. "sec-suppliers". */
  id: string;
  title: string;
  description?: string;
  /** Generic header-right slot. When provided it REPLACES the `viewAll` convenience button. */
  action?: ReactNode;
  /** Convenience: a "view all" link in the header. Ignored when `action` is provided. */
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
}

export function LandingSection({
  id,
  title,
  description,
  action,
  viewAllHref,
  viewAllLabel = "View all",
  children,
}: LandingSectionProps) {
  const headingId = `${id}-heading`;
  const headerAction =
    action ??
    (viewAllHref ? (
      <Button asChild variant="ghost" size="sm" className="gap-1.5">
        <Link href={viewAllHref}>
          {viewAllLabel}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Button>
    ) : null);

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
          {headerAction}
        </div>
        {children}
      </div>
    </section>
  );
}
