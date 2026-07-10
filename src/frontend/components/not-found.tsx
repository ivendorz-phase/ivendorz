// App component: NotFound (Doc-7B BR9 / Doc-7A §8.2). Presentation-only.
//
// NON-DISCLOSURE (binding): this view is BYTE-IDENTICAL whether the target is genuinely absent
// or merely not-visible to the caller. It therefore takes NO discriminating prop — there is no
// "forbidden" vs "missing" branch; copy, layout, and markup are constant (Invariant #11; GI-05).
import * as React from "react";
import { cn } from "../lib/cn";

export interface NotFoundProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  /** Optional affordance (e.g. a link home) — supplied by the surface. */
  action?: React.ReactNode;
}

export function NotFound({
  title = "Not found",
  description = "We couldn’t find what you were looking for.",
  action,
  className,
  ...props
}: NotFoundProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}
      {...props}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
