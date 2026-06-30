// WhyChooseUs (M2.6) — editorial value propositions / differentiators for the vendor microsite.
// Presentation-only; genuine-empty when absent. Editorial stand-in (no frozen field; coins nothing — it
// makes NO trust/performance/financial claim, just company-website positioning). Reuses the kit (Card);
// RSC-friendly.
import { BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import type { CompanyDifferentiatorVM } from "./company-content-seed";

export interface WhyChooseUsProps {
  items?: CompanyDifferentiatorVM[];
}

export function WhyChooseUs({ items }: WhyChooseUsProps) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.title}>
          <Card className="h-full">
            <CardContent className="flex gap-3 pt-6">
              <BadgeCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-iv-navy-700" />
              <div>
                <p className="text-sm font-semibold text-iv-ink-heading">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
