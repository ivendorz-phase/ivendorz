// CapabilitySection (M2.6) — the vendor's capability presentation. REUSES the existing frozen
// CapabilityMatrix for the four-flag capability indicators (Invariant #1 — never invented, never
// recomputed); the named capability "areas" (Manufacturing / Fabrication / Supply / …) are an editorial
// presentation list (no frozen field), rendered as reusable cards. Presentation-only; genuine-empty when
// nothing is provided. RSC-friendly.
import { Card, CardContent } from "@/frontend/primitives/card";
import { CapabilityMatrix, type CapabilityFlags } from "@/frontend/components/capability-matrix";
import type { CapabilityAreaVM } from "./company-content-seed";

export interface CapabilitySectionProps {
  /** Frozen four-flag capability matrix (Invariant #1) — reuses the kit component. */
  capabilityFlags?: Partial<CapabilityFlags>;
  /** Editorial capability areas (presentation reference; coins nothing). */
  capabilities?: CapabilityAreaVM[];
}

export function CapabilitySection({ capabilityFlags, capabilities }: CapabilitySectionProps) {
  const hasAreas = capabilities && capabilities.length > 0;
  const hasFlags = Boolean(capabilityFlags);
  if (!hasAreas && !hasFlags) return null;

  return (
    <div className="flex flex-col gap-5">
      {hasFlags ? <CapabilityMatrix flags={capabilityFlags} /> : null}

      {hasAreas ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities!.map((area) => (
            <li key={area.name}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-foreground">{area.name}</p>
                  {area.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{area.description}</p>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
