// Neutral placeholder for the four FIREWALLED governance signals (DP4 / Invariant 6): Trust,
// Performance, Verified Tier, Verification — four INDEPENDENT bands, never combined into a composite.
//
// BLOCKED, deliberately renders NO band and NO score:
//   • [ESC-7G-SCORE-DISPLAY] (BLOCKER, human Architecture Board) — band-only vs frozen
//     `display_score` is unruled; until then nothing numeric/banded is shown.
//   • [ESC-7B-TRUSTSCORE] (BLOCKER) — the kit `trust-badge` `score` prop is a disclosure footgun;
//     this surface never uses trust-badge and never passes a `score`.
// Uniform for every vendor (byte-equivalence GR11/BE-6). The signal NAMES are public concepts; no
// vendor-specific value is rendered, so nothing here pre-decides the Board.
import { cn } from "@/frontend/lib/cn";

const SIGNALS = ["Trust", "Performance", "Verified tier", "Verification"] as const;

export function GovernanceStandingPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <ul className="space-y-2">
        {SIGNALS.map((name) => (
          <li key={name} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-foreground">{name}</span>
            <span className="text-xs text-muted-foreground">Display pending</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        These four independent signals are read-only and are never combined into a single score.
        Their on-screen display is pending an Architecture Board ruling.
      </p>
    </div>
  );
}
