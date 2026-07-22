// Auth result panel — the centered outcome state shared across the (auth) secondary screens:
// success (green check), warning (invalid/expired link), info (honest "coming online soon" interim)
// and neutral (declined). PURE PRESENTATION (no hooks) so it renders inside Server pages and Client
// forms alike. Token-only tones, never raw hex. Its single <h1> makes it the page's one heading
// when a form/view swaps from its input state to its outcome.
import type { ReactNode } from "react";
import { cn } from "@/frontend/lib/cn";

type Tone = "success" | "warning" | "info" | "neutral";

const TONE: Record<Tone, string> = {
  success: "bg-iv-success-subtle text-iv-success-muted",
  warning: "bg-iv-warning-subtle text-iv-warning-muted",
  info: "bg-iv-info-subtle text-iv-info-muted",
  neutral: "bg-muted text-muted-foreground",
};

interface AuthResultPanelProps {
  tone: Tone;
  /** Decorative glyph (sized here); pass the bare lucide icon. */
  icon: ReactNode;
  title: string;
  description: ReactNode;
  /** Primary action row (e.g. a full-width Button-as-Link). */
  action?: ReactNode;
  /** Optional small print under the action (e.g. an honest preview note). */
  note?: ReactNode;
}

export function AuthResultPanel({
  tone,
  icon,
  title,
  description,
  action,
  note,
}: AuthResultPanelProps) {
  return (
    <div className="text-center">
      <span
        aria-hidden="true"
        className={cn(
          "mx-auto mb-5 flex size-[60px] items-center justify-center rounded-full [&_svg]:size-8",
          TONE[tone],
        )}
      >
        {icon}
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight text-iv-ink-heading">{title}</h1>
      <div
        className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground"
        role="status"
      >
        {description}
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
      {note ? <p className="mt-4 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}
