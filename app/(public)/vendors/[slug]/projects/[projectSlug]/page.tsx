// Vendor Microsite - PROJECT DETAIL page (P-PUB-25 / FE-PUB-11 / realizes the design companion S6).
// A per-project case-study page nested under the existing microsite chrome (`vendors/[slug]/layout.tsx`
// supplies the global SiteHeader + vendor brand header + route nav + footer -- "header/footer/chrome
// same", owner directive). Completes the Vendor Profile -> Project Card -> PROJECT DETAIL journey; the
// projects list's "View details" now links here (was disabled -- no destination existed).
//
// PRESENTATION-ONLY, like every other public surface in this program: renders the editorial project
// SEED (`getShowcaseProject`) -- a stand-in for the frozen `showcase_projects` M2 entity, which is NOT
// wired into a public read (that lands at Wave-4 wiring, same posture FE-PUB-05 had pre-`ESC-7-API-
// PRODDETAIL`). Coins no contract; unknown project slug -> byte-equivalent `notFound()` (Invariant #11).
//
// GOVERNANCE RULINGS honored (design companion S6.9, owner Board 2026-07-03):
//  - R1: vendor card shows the binary Verified badge ONLY; NO tier/rank badge (Inv #6 / R6).
//  - R2: the NAMED client is shown here (detail page only); vendor-authored + consent-responsible,
//    coins no platform signal, never exposes a buyer-private/blacklisted relationship. The list cards
//    keep showing the sector/role `client` (R2 scoped to this page).
//  - R3: NO "Verify Project Data" affordance and NO real "Compliance Repository"; Documents render as
//    a genuine-empty state until a real upload pipeline exists (GI-12 -- no fabricated authority/files).
//  - R4: media are decorative placeholder tiles (no fabricated <img> src) until the asset pipeline.
//  - Gold stays reserved: the category label is NOT rendered in gold/amber (that's premium/verified/
//    featured only) -- a brand-consistency correction over the raw mockup.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import {
  ProjectHero,
  ProjectVendorSummaryCard,
  VendorSection,
  getShowcaseProject,
} from "../../../../_components/microsite";
import { getPublicVendorProfile } from "../../../../_components/discovery/seed";
import { vendorHref } from "../../../../_components/vendor-url";
import { getVendorOr404 } from "../../get-vendor";

const AUTH_HREF = "/login";

/** Project status label -> presentation tone (never color-only; StatusChip also renders the text). */
function statusDisplay(status: string): { label: string; tone: StatusTone } {
  const key = status.toLowerCase();
  if (key === "completed") return { label: "Completed", tone: "success" };
  if (key === "in_progress" || key === "ongoing") return { label: "In progress", tone: "info" };
  if (key === "on_hold") return { label: "On hold", tone: "warning" };
  return { label: status, tone: "neutral" };
}

/** The project detail URL is built on the canonical vendor URL builder's projects base (never a raw
 *  vendor-host concatenation -- ADR-024 / FE-PUB-10) + the project slug child segment. */
function projectDetailHref(slug: string, projectSlug: string): string {
  return `${vendorHref(slug, "projects")}/${projectSlug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { slug, projectSlug } = await params;
  const profile = getPublicVendorProfile(slug);
  if (!profile) return { title: "Project - iVendorz" };
  const project = getShowcaseProject(profile, projectSlug);
  if (!project) return { title: `Projects - ${profile.name} - iVendorz` };
  const canonical = projectDetailHref(slug, projectSlug);
  return {
    title: `${project.name} - ${profile.name} - iVendorz`,
    description: project.scope ?? `A project delivered by ${profile.name}.`,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export default async function VendorProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}) {
  const { slug, projectSlug } = await params;
  const profile = getVendorOr404(slug);
  const project = getShowcaseProject(profile, projectSlug);
  // Unknown project -> the SAME byte-equivalent 404 an unknown vendor renders (Invariant #11).
  if (!project) notFound();

  const projectsHref = vendorHref(slug, "projects");
  const status = project.status ? statusDisplay(project.status) : null;

  const detailRows: { icon: ReactNode; label: string; value: ReactNode }[] = [];
  if (status) {
    detailRows.push({
      icon: <ClipboardList aria-hidden="true" className="size-4" />,
      label: "Status",
      value: <StatusChip label={status.label} tone={status.tone} />,
    });
  }
  if (project.durationLabel) {
    detailRows.push({
      icon: <Clock aria-hidden="true" className="size-4" />,
      label: "Duration",
      value: <span className="font-medium text-foreground">{project.durationLabel}</span>,
    });
  }
  // R2: the NAMED client (detail page only). Falls back to the sector/role descriptor if none supplied.
  const clientLabel = project.namedClient ?? project.client;
  if (clientLabel) {
    detailRows.push({
      icon: <Building2 aria-hidden="true" className="size-4" />,
      label: "Client",
      value: <span className="font-medium text-foreground">{clientLabel}</span>,
    });
  }
  if (project.location) {
    detailRows.push({
      icon: <MapPin aria-hidden="true" className="size-4" />,
      label: "Location",
      value: <span className="font-medium text-foreground">{project.location}</span>,
    });
  }
  if (project.year) {
    detailRows.push({
      icon: <Calendar aria-hidden="true" className="size-4" />,
      label: "Completion",
      value: <span className="font-medium text-foreground">{project.year}</span>,
    });
  }

  return (
    <>
      {/* Project-context bar (companion S6.1 item 0): back-to-projects + title + category + RFQ. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="outline" size="icon" aria-label="Back to projects">
            <Link href={projectsHref}>
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-iv-ink-heading">
              {project.name}
            </h1>
            {project.industry ? (
              // Category label -- muted/navy, NOT gold (gold stays reserved for premium/verified/featured).
              <p className="text-xs font-semibold uppercase tracking-wide text-iv-navy-700">
                {project.industry}
              </p>
            ) : null}
          </div>
        </div>
        <Button asChild>
          <Link href={AUTH_HREF}>Request Quote</Link>
        </Button>
      </div>

      {/* Two-column body: main content + info sidebar (companion S6.2). */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* MAIN */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          <ProjectHero caption={project.heroCaption} galleryLabels={project.galleryLabels} />

          {project.challenge || project.solution ? (
            <VendorSection id="summary" title="Executive Summary">
              <Card>
                <CardContent className="flex flex-col gap-5 p-5">
                  {project.challenge ? (
                    <div className="border-l-2 border-iv-amber-500 pl-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-iv-ink-heading">
                        The Challenge
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {project.challenge}
                      </p>
                    </div>
                  ) : null}
                  {project.solution ? (
                    <div className="border-l-2 border-iv-navy-700 pl-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-iv-ink-heading">
                        Our Solution
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {project.solution}
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </VendorSection>
          ) : null}

          {project.technologies && project.technologies.length > 0 ? (
            <VendorSection id="technologies" title="Technologies & Methods">
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="neutral">
                    {tech}
                  </Badge>
                ))}
              </div>
            </VendorSection>
          ) : null}

          {/* Documents -- genuine-empty (R3): no platform "verify", no fabricated files. */}
          <VendorSection id="documents" title="Documents">
            <EmptyState
              title="No project documents published"
              description="Project documents appear here when the supplier publishes them. The platform does not verify or hold these files."
            />
          </VendorSection>
        </div>

        {/* SIDEBAR */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <ProjectVendorSummaryCard
            profile={profile}
            vendorHomeHref={vendorHref(slug)}
            tags={project.tags}
          />

          {detailRows.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <h2 className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Project details
                </h2>
                <dl className="mt-3 flex flex-col gap-3">
                  {detailRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-muted-foreground">{row.icon}</span>
                        {row.label}
                      </dt>
                      <dd className="text-right text-sm">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ) : null}

          {project.deliverables && project.deliverables.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <h2 className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Scope of deliverables
                </h2>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {project.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-iv-success-base"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
}
