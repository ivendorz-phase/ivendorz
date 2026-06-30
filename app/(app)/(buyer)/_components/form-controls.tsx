// Buyer Workspace — form controls (Tier-2): `Textarea` + `Select`. These mirror the FROZEN kit `Input`
// chrome (src/frontend/primitives/input.tsx) exactly, for the controls the kit does not yet ship (the
// kit has `input` but no `textarea`/`select` — both are Doc-7B-deferred). They compose into the kit
// `FormField` as `children` (FormField injects id/aria/required). Server-render-friendly (no state; a
// client form surface wires value/onChange at integration). PRESENTATION-ONLY.
//
// PROMOTION CANDIDATES: a kit `Textarea` is overdue — 4 vendor files hand-roll the same textarea chrome
// (platform audit) and this is the buyer consumer (≥2 workspaces). Registered for §4.2 promotion; until
// then it lives buyer-scoped (the DataListTable/DescriptionList precedent: realize a kit gap at the
// narrowest scope, never fork the frozen kit).

import * as React from "react";
import { cn } from "@/frontend/lib/cn";

// The shared kit Input chrome (verbatim from input.tsx), minus the fixed height so textarea can grow.
const CONTROL_BASE =
  "w-full rounded-md border border-input bg-background px-3 text-sm text-iv-ink-strong shadow-iv-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(CONTROL_BASE, "min-h-20 py-2", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  options: SelectOption[];
  /** Optional leading placeholder option (disabled, value=""). */
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, defaultValue, value, ...props }, ref) => (
    <select
      ref={ref}
      defaultValue={value === undefined ? (defaultValue ?? "") : undefined}
      value={value}
      className={cn(CONTROL_BASE, "h-9 py-1", className)}
      {...props}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
);
Select.displayName = "Select";
