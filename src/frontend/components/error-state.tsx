// App component: ErrorState (Doc-7B BR9 / Doc-7A §5.3–§5.4). Presentation-only. Branches on
// the contract-reported `error_class` (NEVER the HTTP status), renders the contract message
// verbatim with NO protected enrichment, and surfaces the envelope `reference_id` for support.
import * as React from "react";
import { cn } from "../lib/cn";

// Presentation-side union of the frozen error taxonomy (Doc-5A §6.2). The kit invents none;
// a surface passes the class the contract returned. An undeclared class → "INTERNAL" headline
// (and the surface flags `[ESC-7-API]` rather than the kit guessing).
export type ErrorClass =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "QUOTA"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "STATE"
  | "REFERENCE"
  | "BUSINESS"
  | "DEPENDENCY"
  | "INTERNAL";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  errorClass?: ErrorClass;
  /** The contract's message — rendered verbatim; the kit adds no protected enrichment. */
  message?: string;
  /** The envelope reference_id — surfaced, never interpreted. */
  referenceId?: string;
  /** Optional retry affordance (handler owned by the surface). */
  action?: React.ReactNode;
}

const HEADLINE: Record<ErrorClass, string> = {
  VALIDATION: "Please check the details and try again",
  AUTHORIZATION: "You don’t have access to this",
  QUOTA: "You’ve reached a plan limit",
  RATE_LIMITED: "Too many requests — please slow down",
  CONFLICT: "This was just updated — please review and retry",
  STATE: "This is no longer in a state that allows that",
  REFERENCE: "Something referenced here is missing",
  BUSINESS: "That action can’t be completed",
  DEPENDENCY: "A service is temporarily unavailable",
  INTERNAL: "Something went wrong",
};

export function ErrorState({
  errorClass = "INTERNAL",
  message,
  referenceId,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border bg-iv-danger-subtle px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <p className="text-base font-semibold text-foreground">{HEADLINE[errorClass]}</p>
      {message ? <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{message}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
      {referenceId ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Reference: <span data-type="ref">{referenceId}</span>
        </p>
      ) : null}
    </div>
  );
}
