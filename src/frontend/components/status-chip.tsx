// App component: StatusChip (Doc-7B BR3). Presentation-only. Maps a contract-reported state to
// a presentation `tone` (a kit presentation concern) — but the kit INVENTS NO label: the surface
// passes the display `label` it derived from the contract. The chip re-ranks/decides nothing.
import * as React from "react";
import { Badge, type BadgeProps } from "../primitives/badge";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";

export interface StatusChipProps extends Omit<BadgeProps, "variant" | "children"> {
  /** Display label — supplied by the surface from the contract (the kit invents none). */
  label: string;
  /** Presentation tone keyed on the contract-reported state; defaults neutral. */
  tone?: StatusTone;
}

const TONE_VARIANT: Record<StatusTone, BadgeProps["variant"]> = {
  neutral: "neutral",
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
  brand: "brand",
};

export function StatusChip({ label, tone = "neutral", ...props }: StatusChipProps) {
  return (
    <Badge variant={TONE_VARIANT[tone]} {...props}>
      {label}
    </Badge>
  );
}
