// MissionVision (M2.6) — Mission, Vision, and Core Values for the vendor microsite. Presentation-only;
// each block is optional → genuine-empty when absent. Editorial content is a supplier-provided stand-in
// (no frozen field). Reuses the kit (Card); RSC-friendly.
import type { ReactNode } from "react";
import { Target, Eye } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import type { CompanyValueVM } from "./company-content-seed";

export interface MissionVisionProps {
  mission?: string;
  vision?: string;
  values?: CompanyValueVM[];
}

function Statement({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3 pt-6">
        <span aria-hidden="true" className="mt-0.5 text-iv-navy-700">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-iv-ink-heading">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function MissionVision({ mission, vision, values }: MissionVisionProps) {
  const hasValues = values && values.length > 0;
  if (!mission && !vision && !hasValues) return null;

  return (
    <div className="flex flex-col gap-5">
      {(mission || vision) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {mission ? (
            <Statement icon={<Target className="size-5" />} title="Mission" body={mission} />
          ) : null}
          {vision ? (
            <Statement icon={<Eye className="size-5" />} title="Vision" body={vision} />
          ) : null}
        </div>
      )}

      {hasValues ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-iv-ink-heading">Core values</h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {values!.map((value) => (
              <li key={value.title} className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">{value.title}</p>
                {value.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
