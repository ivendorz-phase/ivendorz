// DS-W1 · Project Portfolio listing — the vendor's own case studies (owning-org scope; there is no
// browse of other vendors' portfolios here). Read = `marketplace.get_showcase_project.v1` /
// portfolio listing (Doc-5D §6 BC-MKT-4) — UNIMPLEMENTED at time of writing, so this renders the
// genuine-empty state rather than fixture rows (VX-03).
//
// Ordering is the FROZEN interim `display_order`; the per-row chip binds the FROZEN interim
// `is_visible` boolean. No governance signal (trust/tier/performance/score) appears on this surface,
// and none may be added — a portfolio is content, not a signal.
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { ShowcaseVisibilityChip } from "./showcase-visibility-chip";
import type { ShowcaseProjectView } from "./types";

export interface ProjectListProps {
  projects?: ShowcaseProjectView[];
  /** Selling-surface mount prefix ([ESC-7G-A7] `/sell`). */
  basePath?: string;
}

export function ProjectList({ projects }: ProjectListProps) {
  const hasProjects = projects && projects.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {hasProjects ? "Ordered by display order" : null}
        </p>
        {/* Wired at Phase 4 — `create_showcase_project.v1`. Disabled rather than faked. */}
        <Button type="button" size="sm" className="ml-auto" disabled>
          Add project
        </Button>
      </div>

      {hasProjects ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {project.title ?? "Untitled project"}
                    </p>
                    {project.sector || project.period ? (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {[project.sector, project.period].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <ShowcaseVisibilityChip isVisible={project.is_visible} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No projects yet"
          description="Add a completed project to show the work behind your capabilities. Published projects appear as case studies on your public showcase; drafts stay private to your organization."
        />
      )}
    </div>
  );
}
