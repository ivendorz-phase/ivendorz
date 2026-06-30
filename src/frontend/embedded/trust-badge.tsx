// Embedded single-owned component (Doc-7B BR5). Presentation shell for the M5 PUBLIC trust read
// (Doc-5G: get_trust_score / get_verified_tier, Public projection). The feeding contract does NOT
// exist yet (M5 is a stub) — so this takes the disclosed values as PROPS now and is wired when M5
// lands. NON-DISCLOSURE-bound: it renders ONLY what is passed; it computes no score and surfaces
// no internal/excluded/buyer-private signal (Invariant #11; Doc-7A §8/§9.1a). Trust is DISPLAYED,
// never computed here (M5 owns it; M2/Public only read).
import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Badge, type BadgeProps } from "../primitives/badge";
import { cn } from "../lib/cn";

export type TrustTier = "unverified" | "low" | "medium" | "high" | "elite";

export interface TrustBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Verified tier as disclosed by the M5 public read (presentation label only). */
  tier?: TrustTier;
  /** Score (0–100) IF the public read discloses one; omitted → qualitative badge only (no fabrication). */
  score?: number;
  /** Whether the vendor is verified, per the public read (gates the shield icon). */
  verified?: boolean;
}

const TIER_LABEL: Record<TrustTier, string> = {
  unverified: "Unverified",
  low: "Building trust",
  medium: "Trusted",
  high: "Highly trusted",
  elite: "Elite",
};

const TIER_VARIANT: Record<TrustTier, BadgeProps["variant"]> = {
  unverified: "neutral",
  low: "info",
  medium: "info",
  high: "success",
  elite: "brand",
};

export function TrustBadge({
  tier = "unverified",
  score,
  verified,
  className,
  ...props
}: TrustBadgeProps) {
  return (
    <Badge
      variant={TIER_VARIANT[tier]}
      className={cn("gap-1", className)}
      title={TIER_LABEL[tier]}
      {...props}
    >
      {verified ? <ShieldCheck className="size-3" /> : null}
      {TIER_LABEL[tier]}
      {typeof score === "number" ? (
        <span data-numeric className="tabular-nums">
          · {score}
        </span>
      ) : null}
    </Badge>
  );
}
