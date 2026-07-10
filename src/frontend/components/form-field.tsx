// App component: FormField (Doc-7B `form-field` / Doc-7A §5.3–§5.4). A FULLY GENERIC field wrapper:
// `label · control · help text · error · required` + the a11y wiring (label/`htmlFor`,
// `aria-describedby`, `aria-invalid`, `aria-required`). It knows NOTHING about any domain
// (buyer-profile / identity / orgs / RFQ …) — pure presentation, reusable across every surface
// (Buyer / Vendor / Admin). It renders a field error with NO protected enrichment (Doc-7A §5.4): the
// caller passes the message it received (e.g. one entry from a contract's `field_errors`); the kit
// neither infers nor adds anything. Server-render-friendly (no hooks; the id is caller-supplied).
import * as React from "react";
import { Input } from "../primitives/input";
import { cn } from "../lib/cn";

export interface FormFieldProps {
  /** Stable id linking label → control → error/help. Required (every form field has a name). */
  id: string;
  /** Field label. */
  label: React.ReactNode;
  /** Optional help / description text (rendered under the control, before any error). */
  description?: React.ReactNode;
  /** Validation message (e.g. one `field_errors` entry). Presence wires `aria-invalid` + the error id. */
  error?: React.ReactNode;
  /** Marks the field required (a visual asterisk + the control's `required`/`aria-required`). */
  required?: boolean;
  /**
   * The control. A single element is a11y-wired automatically (id / `aria-*` / `required` injected
   * unless the caller already set them). If omitted, a default kit `Input` is rendered from `inputProps`.
   */
  children?: React.ReactElement;
  /** Props for the default kit `Input` when `children` is omitted. */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Extra classes on the field wrapper. */
  className?: string;
}

export function FormField({
  id,
  label,
  description,
  error,
  required,
  children,
  inputProps,
  className,
}: FormFieldProps) {
  const describedBy =
    [description ? `${id}-description` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  // The a11y wiring applied to whichever control is rendered.
  const wiring = {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    "aria-required": required || undefined,
    required,
  };

  let control: React.ReactNode;
  if (children && React.isValidElement(children)) {
    // Inject the wiring onto the caller's control without clobbering props it already set.
    const child = children as React.ReactElement<Record<string, unknown>>;
    control = React.cloneElement(child, {
      id: child.props.id ?? wiring.id,
      "aria-describedby": child.props["aria-describedby"] ?? wiring["aria-describedby"],
      "aria-invalid": child.props["aria-invalid"] ?? wiring["aria-invalid"],
      "aria-required": child.props["aria-required"] ?? wiring["aria-required"],
      required: child.props.required ?? wiring.required,
    });
  } else {
    control = (
      <Input
        {...inputProps}
        {...wiring}
        className={cn("aria-[invalid=true]:border-destructive", inputProps?.className)}
      />
    );
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {control}
      {description ? (
        <p id={`${id}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
