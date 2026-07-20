// Vendor Workspace — Project Portfolio (VX-01 nav destination, under Digital Showcase). DS-W1.
//
// The surface authors `marketplace.showcase_projects` — a REAL frozen M2 aggregate (Doc-2 §3.3/§10.750,
// lifecycle draft → published at §293) with four frozen BC-MKT-4 contracts (Doc-5D Pass1:150-155).
// (This corrects an earlier comment here which claimed no case-study concept existed in the corpus —
// plan finding F6. The gap was never conceptual: it is that the typed columns are carried under
// `[ESC-6-SCHEMA-SHOWCASE]` and no contract is implemented yet.)
//
// Presentation-only: no read is wired (the BC-MKT-4 showcase contracts are unimplemented and the
// `marketplace` Prisma schema is unrealized), so the list renders its genuine-empty state and the
// editor renders empty controls with Save/Publish disabled — VX-03: a wired read or an honest empty
// state, never fixture rows.
//
// Direct module imports, not the `showcase` barrel: that barrel also re-exports the authoring-journey
// components, which reach into the microsite feature — none of which this route renders (RV-0126).
import type { Metadata } from "next";
import { ProjectForm } from "../../../../_components/vendor/showcase/project-form";
import { ProjectList } from "../../../../_components/vendor/showcase/project-list";

export const metadata: Metadata = { title: "Project Portfolio" };

export default function ProjectPortfolioPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Project Portfolio</h1>
        <p className="text-sm text-muted-foreground">
          Completed projects and case studies for your public showcase — distinct from your Product
          Portfolio (catalog) and Company Profile (identity and capability).
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start">
        <ProjectList />
        <ProjectForm />
      </div>
    </div>
  );
}
