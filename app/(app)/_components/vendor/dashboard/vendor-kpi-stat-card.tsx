// Vendor Workspace — Dashboard KPI stat tile (VX-02 layout revision, owner-directed 2026-07-15;
// originally VX-01). Mirrors the buyer track's own `KpiStatCard` ((buyer)/_components/kpi-stat-card.tsx)
// byte-for-byte in governance posture: every figure is a WIRED READ supplied by the caller — never
// client-computed (GI-12 / UX §6.2). Today the dashboard page supplies these from an
// explicitly-labelled presentation-fixture SEED (no read is wired yet); when a figure is not yet
// available the card renders a neutral "—" placeholder rather than a fabricated number. This
// component itself invents nothing — it is presentation chrome around whatever value the caller passes.
//
// VX-02 ANATOMY (label · chip / value / caption): the reference's tile carries a delta chip
// ("+4 this wk") in the top-right. NO DELTA IS RENDERED HERE and none is accepted as a prop: a
// week-over-week delta is a time-bucketed comparison, and no time-series field exists on any vendor
// read — inventing one is exactly the GR#8 scope expansion that blocked the reference's weekly bar
// chart. The `live` chip (already-shipped VX-01 semantics, unchanged) occupies that slot instead.
// The `caption` slot takes a QUALITATIVE descriptor of what the figure counts — never a second
// figure, which would be an unbacked claim in the same way.
//
// The VX-01 icon/tone props are gone: the reference tile has no icon, and the caller had no way to
// use tone except decoratively.
import type { ReactNode } from "react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { cn } from "@/frontend/lib/cn";

export interface VendorKpiStatCardProps {
  label: string;
  value?: ReactNode;
  /**
   * A short qualitative descriptor of what the figure counts ("Invitations received to date").
   * Never a second figure or a trend claim — see the header comment.
   */
  caption?: string;
  /**
   * A small "LIVE" chip. Presentation-only labelling of "this tile is fully built/interactive" —
   * NEVER a claim that the figure itself streams from a live backend read (none is wired yet). See
   * the dashboard page's own header comment for the full disclosure.
   */
  live?: boolean;
  className?: string;
}

export function VendorKpiStatCard({
  label,
  value,
  caption,
  live = false,
  className,
}: VendorKpiStatCardProps) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-muted-foreground">{label}</span>
          {live ? (
            <span className="shrink-0 rounded-full bg-iv-success-subtle px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-iv-success-muted">
              Live
            </span>
          ) : null}
        </div>
        <p className="mt-2.5 truncate text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {value ?? "—"}
        </p>
        {caption ? <p className="mt-1 truncate text-xs text-muted-foreground">{caption}</p> : null}
      </CardContent>
    </Card>
  );
}
