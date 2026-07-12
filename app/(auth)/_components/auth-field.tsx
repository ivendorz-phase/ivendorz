// Auth field — a presentational field wrapper for the (auth) forms: label (+ optional aside link)
// · leading icon · kit Input · optional trailing control (e.g. the password toggle) · error, with
// the a11y wiring (label/`htmlFor`, `aria-describedby`, `aria-invalid`, `aria-required`) injected
// onto the caller's control. It COMPOSES the kit `Input` primitive (never re-implements it) — the
// icon is a decorative sibling and the padding is merged onto the control. Server-render-friendly
// (no hooks; the id is caller-supplied). Sibling of the generic `FormField`, specialised for the
// icon-in-field auth layout that `FormField`'s single-child contract can't host.
import * as React from "react";
import { cn } from "@/frontend/lib/cn";

interface AuthFieldProps {
  /** Stable id linking label → control → error. */
  id: string;
  label: React.ReactNode;
  /** Optional element rendered on the label row, right-aligned (e.g. a "Forgot password?" link). */
  labelAside?: React.ReactNode;
  /** Decorative leading icon (rendered inside the control, left). */
  icon: React.ReactNode;
  /** Optional trailing control (rendered inside the control, right — e.g. a show/hide button). */
  trailing?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** The control — a single element (the kit `Input`). */
  children: React.ReactElement<Record<string, unknown>>;
}

export function AuthField({
  id,
  label,
  labelAside,
  icon,
  trailing,
  error,
  required,
  children,
}: AuthFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  // Inject a11y wiring + the icon/trailing padding onto the caller's control without clobbering
  // props it already set.
  const control = React.cloneElement(children, {
    id: children.props.id ?? id,
    "aria-describedby": children.props["aria-describedby"] ?? errorId,
    "aria-invalid": children.props["aria-invalid"] ?? (error ? true : undefined),
    "aria-required": children.props["aria-required"] ?? (required || undefined),
    required: children.props.required ?? required,
    className: cn(
      "h-11 pl-10 aria-[invalid=true]:border-destructive",
      trailing ? "pr-11" : undefined,
      children.props.className as string | undefined,
    ),
  });

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-[18px]"
        >
          {icon}
        </span>
        {control}
        {trailing ? (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
