// Password show/hide toggle — presentational button for the (auth) password fields. Stateless: the
// owning form holds the `shown` boolean and swaps the input `type`; this only renders the control.
// `aria-pressed` is valid here because it is a real <button> toggle (unlike an <a>). Server-render-
// friendly (no hooks).
import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleProps {
  shown: boolean;
  onToggle: () => void;
}

export function PasswordToggle({ shown, onToggle }: PasswordToggleProps) {
  const Icon = shown ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={shown}
      aria-label={shown ? "Hide password" : "Show password"}
      className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon aria-hidden="true" className="size-[18px]" />
    </button>
  );
}
