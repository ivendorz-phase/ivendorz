import type { ReactNode } from "react";
import { cn } from "@/frontend/lib/cn";

// Platform shell — page-header layout primitive (IA §3.3: "title · ref-mono · status · actions").
// PRESENTATION ONLY. Owns the single page `<h1>` for an authenticated surface; `meta` hosts ref/status
// chips, `actions` hosts right-aligned buttons. Composition only — no data, no state.
export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Human-ref / status chips under the title (presentation). */
  meta?: ReactNode;
  /** Right-aligned actions (e.g. buttons). */
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, meta, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
