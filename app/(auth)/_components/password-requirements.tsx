// Password requirements checklist — presentational UX aid mirroring the reset-password policy hints
// (length · mixed case · digit). Each rule lights up as the value satisfies it. UX ONLY: it never
// gates submit — the server is the final authority on password policy (Doc-7A). Sibling of
// `PasswordStrength` (the bar meter): this spells the rules out. Server-render-friendly (no hooks);
// aria-hidden because it visually mirrors the field's own described policy (no double announcing).
import { Check } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

const RULES = [
  { test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v), label: "Upper & lowercase letters" },
  { test: (v: string) => /\d/.test(v), label: "At least one number" },
] as const;

export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="grid gap-2" aria-hidden="true">
      {RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2.5 text-[13px] transition-colors duration-150 ease-iv-out",
              ok ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Check
              className={cn(
                "size-4 shrink-0",
                ok ? "text-iv-success-bright" : "text-muted-foreground/40",
              )}
            />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
