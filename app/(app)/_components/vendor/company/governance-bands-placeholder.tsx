// Neutral placeholder for the Trust and Performance bands on the Profile Overview (S1).
//
// These two SCORE signals are BLOCKED ([ESC-7G-SCORE-DISPLAY] band-only-vs-score, human Board; and
// [ESC-7B-TRUSTSCORE] the kit trust-badge `score` footgun) — so nothing numeric or banded is shown
// and the kit `trust-badge` is never used. Uniform for every vendor (byte-equivalence). The
// Financial Tier (A–E), claim status and verification status are SEPARATE signals and are rendered
// elsewhere on S1 as real chips. RSC-friendly.
import { cn } from "@/frontend/lib/cn";

const BANDS = ["Trust", "Performance"] as const;

export function GovernanceBandsPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <ul className="space-y-2">
        {BANDS.map((band) => (
          <li key={band} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-foreground">{band}</span>
            <span className="text-xs text-muted-foreground">Display pending</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Trust and Performance are read-only signals. Their on-screen display is pending an
        Architecture Board ruling.
      </p>
    </div>
  );
}
