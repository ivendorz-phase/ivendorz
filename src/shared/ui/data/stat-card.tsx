import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/shared/ui/lib/cn";
import { Card, CardContent } from "@/shared/ui/card";

export interface StatCardProps {
  label: string;
  value: string;
  /** Optional icon shown in the top-right accent tile. */
  icon?: ComponentType<LucideProps>;
  /** Period-over-period change, e.g. "12.5%". */
  change?: string;
  /** Direction of change; controls color and arrow. */
  trend?: "up" | "down" | "neutral";
  /** Caption rendered under the value, e.g. "vs last month". */
  caption?: string;
  className?: string;
}

const trendStyles: Record<"up" | "down" | "neutral", string> = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  caption,
  className,
}: StatCardProps) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-[18px]" />
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {value}
          </p>
          <div className="flex items-center gap-2">
            {change ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-sm font-medium",
                  trendStyles[trend],
                )}
              >
                {trend !== "neutral" ? <TrendIcon className="size-4" /> : null}
                {change}
              </span>
            ) : null}
            {caption ? <span className="text-sm text-muted-foreground">{caption}</span> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
