// CompanyOverview (M2.6) — the About prose blocks for the vendor microsite: Company Overview, Business
// Overview, and Factory & Facilities. Presentation-only; renders only the blocks it is given (each is
// optional → genuine-empty when absent). Editorial content is a supplier-provided presentation stand-in
// (no frozen field, no contract invention). Reuses the kit (Card); RSC-friendly.
import { Card, CardContent } from "@/frontend/primitives/card";

export interface CompanyOverviewProps {
  overview?: string;
  businessOverview?: string;
  facilities?: string;
}

function Block({ title, body }: { title: string; body?: string }) {
  if (!body) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-iv-ink-heading">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}

export function CompanyOverview({ overview, businessOverview, facilities }: CompanyOverviewProps) {
  if (!overview && !businessOverview && !facilities) return null;
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-6">
        <Block title="Company overview" body={overview} />
        <Block title="Business overview" body={businessOverview} />
        <Block title="Factory & facilities" body={facilities} />
      </CardContent>
    </Card>
  );
}
