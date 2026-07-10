// Vendor Workspace — Dashboard KPI stat tile (VX-01, owner-directed dashboard redesign). Mirrors the
// buyer track's own `KpiStatCard` ((buyer)/_components/kpi-stat-card.tsx) byte-for-byte in
// governance posture: every figure is a WIRED READ supplied by the caller — never client-computed
// (GI-12 / UX §6.2). Today the dashboard page supplies these from an explicitly-labelled
// presentation-fixture SEED (no read is wired yet); when a figure is not yet available the card
// renders a neutral "—" placeholder rather than a fabricated number. This component itself invents
// nothing — it is presentation chrome around whatever value the caller passes.
import type { ReactNode } from "react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { cn } from "@/frontend/lib/cn";

export type VendorKpiTone = "brand" | "info" | "success" | "warning" | "neutral";

const TONE_ICON_BG: Record<VendorKpiTone, string> = {
  brand: "bg-iv-brand-50 text-iv-brand-600",
  info: "bg-iv-info-subtle text-iv-info-muted",
  success: "bg-iv-success-subtle text-iv-success-muted",
  warning: "bg-iv-warning-subtle text-iv-warning-muted",
  neutral: "bg-muted text-muted-foreground",
};

export interface VendorKpiStatCardProps {
  label: string;
  value?: ReactNode;
  /**
   * A small "LIVE" chip. Presentation-only labelling of "this tile is fully built/interactive" —
   * NEVER a claim that the figure itself streams from a live backend read (none is wired yet). See
   * the dashboard page's own header comment for the full disclosure.
   */
  live?: boolean;
  icon?: ReactNode;
  tone?: VendorKpiTone;
  className?: string;
}

export function VendorKpiStatCard({
  label,
  value,
  live = false,
  icon,
  tone = "neutral",
  className,
}: VendorKpiStatCardProps) {
  return (
    <Card className={cn("min-w-0", className)}>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          {icon ? (
            <span
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md",
                TONE_ICON_BG[tone],
              )}
            >
              {icon}
            </span>
          ) : (
            <span />
          )}
          {live ? (
            <span className="rounded-full bg-iv-success-subtle px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-iv-success-muted">
              Live
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-2xl font-semibold tabular-nums text-foreground">
            {value ?? "—"}
          </p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
