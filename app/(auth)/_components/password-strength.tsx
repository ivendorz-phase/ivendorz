// Password strength meter — presentational UX aid for the signup password field. Scores the value
// on four independent axes (length · mixed case · digit · symbol) and renders four token-coloured
// bars + a label. UX ONLY: this is not an authorization decision and never gates submit — the
// server is the final authority on password policy (Doc-7A). Server-render-friendly (no hooks).
import { cn } from "@/frontend/lib/cn";

/** 0–4 — one point per satisfied axis. Presentation heuristic only. */
function scorePassword(value: string): number {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

// Index by score. Colours come from the iv semantic tokens (never raw hex).
const LEVELS = [
  { label: "", bar: "" },
  { label: "Weak", bar: "bg-destructive" },
  { label: "Fair", bar: "bg-iv-amber-500" },
  { label: "Good", bar: "bg-iv-navy-500" },
  { label: "Strong", bar: "bg-iv-success-bright" },
] as const;

export function PasswordStrength({ value }: { value: string }) {
  if (value.length === 0) return null;
  const score = scorePassword(value);
  const { label, bar } = LEVELS[score];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-150 ease-iv-out",
              i < score ? bar : "bg-border",
            )}
          />
        ))}
      </div>
      {label ? (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Password strength: <span className="font-medium text-foreground">{label}</span>
        </p>
      ) : null}
    </div>
  );
}
