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

/** Thin top accent bar that colour-codes the tile at a glance (paired with the tinted icon chip so
 *  meaning is never conveyed by colour alone — R: a11y). */
const TONE_ACCENT: Record<VendorKpiTone, string> = {
  brand: "bg-iv-brand-600",
  info: "bg-iv-info-base",
  success: "bg-iv-success-base",
  warning: "bg-iv-warning-base",
  neutral: "bg-iv-neutral-base",
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
    <Card
      className={cn(
        "min-w-0 overflow-hidden transition-shadow duration-normal ease-iv-out hover:shadow-iv-md",
        className,
      )}
    >
      <div aria-hidden className={cn("h-1 w-full", TONE_ACCENT[tone])} />
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          {icon ? (
            <span
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md [&_svg]:size-5",
                TONE_ICON_BG[tone],
              )}
            >
              {icon}
            </span>
          ) : (
            <span />
          )}
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-iv-success-subtle px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-iv-success-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-iv-success-base" />
              Live
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate font-mono text-3xl font-semibold tabular-nums leading-none text-iv-ink-strong">
            {value ?? "—"}
          </p>
          <p className="mt-2 truncate text-sm font-medium text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
