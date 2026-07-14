// Vendor Workspace — Dashboard "Global Trust Score" panel (VX-01, owner-directed dashboard
// redesign, 2026-07-03 — verbatim mockup, built after an explicit owner ruling to proceed despite
// three flagged conflicts; see the WP notes for the full adjudication record).
//
// GOVERNANCE DISCLOSURE (read before touching this file):
//  • Reuses the real `TrustScoreRing` (`_components/vendor/trust`) for the 0–100 score — the SAME
//    number the Trust Center shows, permitted per the Board's 2026-07-03 Trust Score display ruling
//    (band+numeric MAY render on any surface). Never re-derives or fabricates a second score.
//  • The Gold/Platinum TIER LABELS below are a NEW, dashboard-only presentation concept — distinct
//    from (and never cross-mutating) the two REAL, frozen tier signals elsewhere in this codebase:
//    `FinancialTier` (A–E, Trust-owned, `_components/vendor/company`) and the Trust Center's own
//    band vocabulary (Unverified/Building trust/Trusted/Highly trusted/Elite,
//    `_components/vendor/trust/trust-score-card.tsx`). This panel never renders those two real
//    signals' vocabulary, so a future reviewer does not mistake "Gold" for a Financial Tier value.
//  • NO SCORING FORMULA IS EXPOSED. The Board's ruling explicitly forbids showing "formula" — so
//    this panel nudges the vendor toward completing their profile WITHOUT a numeric point-delta
//    claim ("may improve your score", never "+N points").
//  • "Increase Score" is a plain NAVIGATION link to the real Company Profile page — it does NOT
//    submit, edit, or otherwise mutate the trust score itself. The score stays exactly what §R5
//    ("no Edit Trust Score can ever exist... no action anywhere", independently verified at
//    FE-VEN-09's close) requires: auto-calculated by the System only. Completing profile DATA is a
//    real, legitimate vendor action; the SCORE remains untouched by this button.
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { TrustScoreRing } from "../trust/trust-score-ring";

/** Dashboard-only gamification tier — see the header disclosure above for why this is NOT the same
 *  vocabulary as `FinancialTier` or the Trust Center's band labels. */
export type DashboardScoreTier = "bronze" | "silver" | "gold" | "platinum";

const TIER_LABEL: Record<DashboardScoreTier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

/** Tier chip styling — gold/premium uses the reserved `--iv-amber` (award) ramp; the rest map onto
 *  neutral/navy tokens. Always paired with the tier text label, never colour alone (a11y). */
const TIER_CHIP: Record<DashboardScoreTier, string> = {
  bronze: "bg-iv-warning-subtle text-iv-warning-muted",
  silver: "bg-iv-neutral-subtle text-iv-ink-secondary",
  gold: "bg-iv-amber-100 text-iv-amber-700",
  platinum: "bg-iv-navy-100 text-iv-navy-700",
};

const TIER_ORDER: DashboardScoreTier[] = ["bronze", "silver", "gold", "platinum"];

export interface GlobalTrustScoreCardProps {
  score?: number;
  tier?: DashboardScoreTier;
  /** Fraction (0–1) of the way to the next tier — caller-supplied, never client-computed. */
  progressToNextTier?: number;
}

export function GlobalTrustScoreCard({
  score,
  tier,
  progressToNextTier,
}: GlobalTrustScoreCardProps) {
  const tierIndex = tier ? TIER_ORDER.indexOf(tier) : -1;
  const nextTier =
    tierIndex >= 0 && tierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[tierIndex + 1] : undefined;
  const progressPct = Math.round(Math.max(0, Math.min(1, progressToNextTier ?? 0)) * 100);

  return (
    <Card className="h-full overflow-hidden">
      {/* Distinct navy "status surface" header band — sets this panel apart from the plain white
          content cards as a standing status/standing signal. */}
      <CardHeader className="bg-iv-navy-700 p-5">
        <CardTitle className="text-base text-iv-fg-inverse">Global Trust Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center gap-4">
          <TrustScoreRing score={score} />
          <div className="space-y-2">
            {tier ? (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${TIER_CHIP[tier]}`}
              >
                {TIER_LABEL[tier]}
              </span>
            ) : null}
            {nextTier ? (
              <p className="text-xs font-medium text-muted-foreground">
                Next tier:{" "}
                <span className="font-semibold text-iv-ink-strong">{TIER_LABEL[nextTier]}</span>
              </p>
            ) : null}
          </div>
        </div>

        {nextTier ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Progress to {TIER_LABEL[nextTier]}</span>
              <span className="font-mono tabular-nums text-iv-ink-strong">{progressPct}%</span>
            </div>
            <div
              role="progressbar"
              aria-label={`Progress toward ${TIER_LABEL[nextTier]}`}
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-iv-navy-700 transition-[width] duration-slow ease-iv-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="rounded-md border border-iv-info-base/15 bg-iv-info-subtle p-3 text-sm leading-relaxed text-iv-info-muted">
          Completing your Operational Infrastructure section may improve your score.
        </div>

        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/workspace/company">
            Increase Score
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
