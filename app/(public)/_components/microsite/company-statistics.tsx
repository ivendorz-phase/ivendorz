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
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Card className="h-full">
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold tracking-tight text-iv-ink-heading">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Figures are provided by the supplier.</p>
    </div>
  );
}
