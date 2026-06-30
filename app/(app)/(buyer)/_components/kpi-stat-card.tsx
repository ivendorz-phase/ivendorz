// Buyer Workspace — KPI stat card (P-BUY-01 KPI band, Doc-7F §9.1; `T-DASHBOARD` `PT §5.3`).
//
// A BUYER-SCOPED presentation composition of the existing Doc-7B kit `Card` primitive — NOT a new shared
// kit primitive (the frozen kit is not modified; the shared `kpi-stat-card`/`data-table` band remains a
// Doc-7B-owner task). Pure function of props: a Server Component, no hooks, no fetch (Content ≠
// Presentation, Inv #9). Server-render-friendly → minimal JS.
//
// GOVERNANCE: every figure is a WIRED READ supplied by the caller — never client-computed (GI-12 / UX
// §6.2). The surface composes the figure node (a `CurrencyDisplay`, a count, or a `StatusChip`) and
// passes it as `value`. Counts must respect non-disclosure — NO excluded/blacklist figure is ever
// represented (Inv #11). When a figure is not yet available the card renders a neutral "—" placeholder
// rather than a fabricated number.

import * as React from "react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { cn } from "@/frontend/lib/cn";

export interface KpiStatCardProps {
  /** KPI label (e.g. "Spend", "Active RFQs"). */
  label: string;
  /**
   * The headline figure node — a `CurrencyDisplay`, a formatted count, or a `StatusChip`, composed by the
   * surface from a contract read. Absent → a neutral "—" placeholder (no fabricated value).
   */
  value?: React.ReactNode;
  /** Optional secondary caption (e.g. a trend delta or context). Presentation only. */
  caption?: React.ReactNode;
  /** Optional leading icon (lucide), decorative. */
  icon?: React.ReactNode;
  className?: string;
}

export function KpiStatCard({ label, value, caption, icon, className }: KpiStatCardProps) {
  return (
    <Card className={cn("shadow-iv-xs", className)}>
      {/* Buyer-scoped KPI layout variant: compact `p-4` (vs the kit Card default `p-6`) for the
          dense auto-fill KPI grid (§9.1). A composition delta only — the Card primitive is unmodified. */}
      <CardContent className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {icon ? (
            <span aria-hidden className="[&_svg]:size-4 [&_svg]:text-muted-foreground">
              {icon}
            </span>
          ) : null}
          {label}
        </div>
        <div className="text-2xl font-semibold tracking-tight text-foreground">
          {value ?? <span className="text-muted-foreground">—</span>}
        </div>
        {caption ? <div className="text-xs text-muted-foreground">{caption}</div> : null}
      </CardContent>
    </Card>
  );
}
