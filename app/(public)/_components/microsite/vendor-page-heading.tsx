// VendorPageHeading (M2.7) — the primary `<h1>` heading for an inner microsite page. In the multi-page IA
// (ADR-022 / Doc-7D §10) the Home page's `<h1>` is the VendorHero; every OTHER route needs its own page-level
// `<h1>` for heading hierarchy + SEO, above the `VendorSection` `<h2>` blocks. Presentation-only; a thin
// composition helper (NOT part of the Team-1 foundation set). Reuses the kit tokens; RSC-friendly.
import type { ReactNode } from "react";

export interface VendorPageHeadingProps {
  title: string;
  subtitle?: string;
  /** Optional right-aligned action (e.g. a "Request quote" link). */
  action?: ReactNode;
}

export function VendorPageHeading({ title, subtitle, action }: VendorPageHeadingProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-iv-ink-heading">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
