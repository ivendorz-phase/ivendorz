// ManagementMessage (M2.6) — a message from the vendor's management. Presentation-only; renders nothing
// when absent. Attribution is role-based (the seed never fabricates an individual's name). Editorial
// stand-in (no frozen field). Reuses the kit (Card); RSC-friendly.
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import type { ManagementMessageVM } from "./company-content-seed";

export interface ManagementMessageProps {
  management?: ManagementMessageVM;
}

export function ManagementMessage({ management }: ManagementMessageProps) {
  if (!management) return null;
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <Quote aria-hidden="true" className="size-6 text-iv-navy-700" />
        <blockquote className="text-base leading-relaxed text-foreground">
          {management.message}
        </blockquote>
        <footer className="text-sm">
          <span className="font-semibold text-iv-ink-heading">{management.name}</span>
          {management.title ? (
            <span className="text-muted-foreground"> · {management.title}</span>
          ) : null}
        </footer>
      </CardContent>
    </Card>
  );
}
