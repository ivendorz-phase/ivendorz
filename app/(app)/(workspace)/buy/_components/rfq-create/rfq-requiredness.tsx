// P-BUY-RFQ — the requiredness taxonomy (owner ruling D3, 2026-07-24).
//
// "Do not reduce these into a single generic red-asterisk system." Four distinct kinds, each with
// its own mark, because they mean genuinely different things:
//
//   Required to start          — `create_rfq` cannot mint a draft without it (Doc-4E §E4.1).
//   Required before submission — in the frozen submission FIXED-set (Doc-3 §1.2). Non-blocking
//                                while drafting; the draft itself stays permissive.
//   Conditionally required     — required only because of another answer (spec attachment vs
//                                `no_formal_spec` + minimum scope).
//   Optional                   — never blocks, ever.
//
// Presentation only. These marks GUIDE; the server enforces the gate (Doc-4E §E4.3 stage-8).
// Composes the kit `Badge` — no bespoke chip (a re-implemented kit primitive is a review finding).

import { Badge } from "@/frontend/primitives/badge";

export type Requiredness = "start" | "submit" | "conditional" | "optional";

const COPY: Record<
  Requiredness,
  { text: string; variant: "brand" | "warning" | "info" | "neutral" }
> = {
  start: { text: "Required to start", variant: "brand" },
  submit: { text: "Required before submission", variant: "warning" },
  conditional: { text: "Conditionally required", variant: "info" },
  optional: { text: "Optional", variant: "neutral" },
};

export function RequirednessMark({
  kind,
  className,
  label,
}: {
  kind: Requiredness;
  className?: string;
  /** Override the copy (e.g. a shortened form in a dense section header). */
  label?: string;
}) {
  const { text, variant } = COPY[kind];
  return (
    <Badge variant={variant} className={className}>
      {label ?? text}
    </Badge>
  );
}

/** The legend that teaches the four marks once, at the top of the canvas. */
export function RequirednessLegend({ className }: { className?: string }) {
  return (
    <div
      className={
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground " +
        (className ?? "")
      }
    >
      <span className="font-medium text-foreground">Field legend</span>
      <span className="flex items-center gap-1.5">
        <RequirednessMark kind="start" /> set when you started
      </span>
      <span className="flex items-center gap-1.5">
        <RequirednessMark kind="submit" /> the submission gate
      </span>
      <span className="flex items-center gap-1.5">
        <RequirednessMark kind="conditional" /> depends on another answer
      </span>
      <span className="flex items-center gap-1.5">
        <RequirednessMark kind="optional" /> never blocks
      </span>
    </div>
  );
}
