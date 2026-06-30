// Primitive: Badge (Doc-7B BR2). Presentation-only chip. The `variant` is a PRESENTATION
// choice the caller passes — the badge invents no status/label and maps no domain value
// (Doc-7B BR3/BR12). Status text uses the saturated `*-base` ink so it reads on the subtle
// tint in the light-primary theme (and remains legible on dark).
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-2xs font-semibold uppercase leading-none tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border-border bg-secondary text-secondary-foreground",
        brand: "border-iv-navy-100 bg-iv-navy-50 text-iv-navy-700",
        amber: "border-iv-amber-100 bg-iv-amber-50 text-iv-amber-700",
        success: "border-transparent bg-iv-success-subtle text-iv-success-base",
        warning: "border-transparent bg-iv-warning-subtle text-iv-warning-base",
        danger: "border-transparent bg-iv-danger-subtle text-iv-danger-base",
        info: "border-transparent bg-iv-info-subtle text-iv-info-base",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
