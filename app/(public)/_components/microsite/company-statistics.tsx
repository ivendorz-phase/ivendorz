// CompanyStatistics (M2.6) — at-a-glance company statistics (years in business, projects completed,
// employees, factory area, countries served). DISPLAY ONLY — values are supplier-provided strings,
// never computed and never a frozen signal: these are NOT the platform capacity profile, financial
// tier, turnover/revenue, or any governance signal — just editorial company-website figures.
// Presentation-only; genuine-empty when absent. Reuses the kit (Card); RSC-friendly.
import { Card, CardContent } from "@/frontend/primitives/card";
import type { CompanyStatVM } from "./company-content-seed";

export interface CompanyStatisticsProps {
  stats?: CompanyStatVM[];
}

export function CompanyStatistics({ stats }: CompanyStatisticsProps) {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <ul className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
            {stats.map((stat) => (
              <li
                key={stat.label}
                className="flex flex-col items-center justify-center gap-1 p-6 text-center"
              >
                <span className="text-3xl font-bold tracking-tight text-iv-navy-700 sm:text-4xl">
                  {stat.value}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Figures are provided by the supplier.</p>
    </div>
  );
}
