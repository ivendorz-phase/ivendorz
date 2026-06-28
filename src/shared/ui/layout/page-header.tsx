import type { ReactNode } from "react";
import { cn } from "@/shared/ui/lib/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional breadcrumb element rendered above the title. */
  breadcrumb?: ReactNode;
  /** Optional actions (buttons, menus) aligned to the trailing edge. */
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border pb-6", className)}>
      {breadcrumb ? <div>{breadcrumb}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-pretty text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
