// Vendor dashboard section (companion §3): a titled Card wrapper with an optional header action.
// Presentation-only; reuses the kit Card. RSC-friendly (no hooks, no data).
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { cn } from "@/frontend/lib/cn";

export interface DashboardSectionProps {
  title: string;
  description?: string;
  /** Optional header affordance (e.g. a "View all" link), supplied by the page. */
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function DashboardSection({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: DashboardSectionProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("flex-1", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
