// Primitive: Skeleton (Doc-7B BR9 — loading placeholder). Presentation-only; renders no
// data and infers nothing — a visual stand-in while a Server Component streams (Doc-7C SR7).
import * as React from "react";
import { cn } from "../lib/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
