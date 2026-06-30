// IndustryGrid (M2.6) — the industries the vendor serves, as reusable cards. Industries are NOT modeled
// in the frozen corpus (landing_page_spec §4 note) — this is a presentation reference only; it coins
// nothing and binds no contract. Presentation-only; genuine-empty when absent. Reuses the kit (Card);
// RSC-friendly.
import { Factory } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";

export interface IndustryGridProps {
  industries?: string[];
}

export function IndustryGrid({ industries }: IndustryGridProps) {
  if (!industries || industries.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {industries.map((industry) => (
        <li key={industry}>
          <Card className="h-full">
            <CardContent className="flex items-center gap-2.5 py-4">
              <Factory aria-hidden="true" className="size-4 shrink-0 text-iv-navy-700" />
              <span className="truncate text-sm font-medium text-foreground">{industry}</span>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
