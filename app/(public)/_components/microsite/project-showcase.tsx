// ProjectShowcase (M2.6) — a presentation showcase of selected work the supplier has delivered. The
// frozen `showcase_projects` M2 entity is NOT wired into the public read, so this renders EDITORIAL,
// supplier-provided project cards (no frozen field; coins nothing) with DECORATIVE image tiles (no
// fabricated <img> source) and a DISABLED "View details" action (no deep route is invented until wired).
// "Client" is a sector/role descriptor only — never a fabricated company name. Presentation-only;
// genuine-empty when absent. Reuses the kit (Card/Badge/Button); RSC-friendly.
import { Image as ImageIcon } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import type { ProjectShowcaseVM } from "./company-content-seed";

export interface ProjectShowcaseProps {
  projects?: ProjectShowcaseVM[];
}

export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  if (!projects || projects.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.name}>
            <Card className="flex h-full flex-col overflow-hidden p-0">
              {/* Decorative tile — no fabricated image source. */}
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border-b border-border bg-muted text-muted-foreground">
                <ImageIcon aria-hidden="true" className="size-6" />
                {project.imageLabel ? (
                  <span className="text-xs font-medium text-foreground">{project.imageLabel}</span>
                ) : null}
              </div>
              <CardContent className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {project.industry ? <Badge variant="brand">{project.industry}</Badge> : null}
                  {project.year ? (
                    <span className="text-xs text-muted-foreground">{project.year}</span>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-iv-ink-heading">{project.name}</p>
                {project.client ? (
                  <p className="text-xs text-muted-foreground">Client: {project.client}</p>
                ) : null}
                {project.scope ? (
                  <p className="text-sm text-muted-foreground">{project.scope}</p>
                ) : null}
                {project.equipment && project.equipment.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {project.equipment.map((item) => (
                      <Badge key={item} variant="neutral">
                        {item}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="mt-auto pt-1">
                  {/* Disabled until the project read is wired — no deep route fabricated. */}
                  <Button size="sm" variant="outline" disabled>
                    View details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Project information is provided by the supplier.
      </p>
    </div>
  );
}
