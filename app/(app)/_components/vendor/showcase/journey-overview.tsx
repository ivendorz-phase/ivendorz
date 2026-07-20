// Digital Showcase — Authoring journey, step 1 of 3: Overview (DS-W0-R1).
//
// Realizes the APPROVED Stage-3 prototype's overview screen (`prototypes/digital-showcase-workspace/`
// v0.2 — owner-approved as the production visual source of truth). Shows where the showcase stands
// (status · selected template · visible sections · where content comes from), states the governing
// Content ≠ Presentation rule in vendor-facing language, and hands off to step 2.
//
// Three deliberate departures from the prototype, each required and each load-bearing:
//  • NO gate identifiers. The prototype's "What's gated" card lists G3/G4/G3A; those are internal
//    governance handles, not vendor copy. Production states plain availability instead.
//  • NO sample content. The prototype carries illustrative counts (12 products, 8 sections) to
//    demonstrate the summary. Production reads nothing yet, so it renders honest absences — never a
//    fabricated figure (VX-03; owner ruling §5 "do not present fixtures as real data").
//  • NO Project Portfolio step, description, readiness row, CTA or dependency (the DS-W0-R1 ruling).
//    Projects remain a CONTENT source that feeds a public section; the surface itself is untouched
//    at `/sell/company/projects`.
//
// Presentation-only and RSC-friendly (no hooks). Imports the template naming from the microsite
// feature's catalogue module DIRECTLY rather than through its barrel — the barrel would pull the
// whole Microsite surface into this chunk (the RV-0126 barrel-leak lesson).
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { journeyStepHref } from "./journey-steps";
import { MicrositeStatusChip } from "../microsite/status-chips";
import { templateEntry } from "../microsite/template-catalog";
import {
  isPubliclyVisibleSection,
  type MicrositeSectionView,
  type MicrositeView,
} from "../microsite/types";

export interface JourneyOverviewProps {
  /** Selling-surface mount prefix ([ESC-7G-A7] `/sell`). */
  basePath?: string;
  /** Absent in the presentation phase — the BC-MKT-4 read is not wired. */
  microsite?: MicrositeView;
  sections?: MicrositeSectionView[];
}

/**
 * One summary row. `<dt>`/`<dd>` rather than two spans so the label and value are programmatically
 * associated; the shared `DescriptionList` atom is the right primitive for label-above-value blocks
 * but renders a two-column grid, not this justified row, so the semantics are borrowed and the
 * approved layout kept.
 */
function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

export function JourneyOverview({ basePath = "/sell", microsite, sections }: JourneyOverviewProps) {
  // Never name a template the vendor has not chosen — `templateEntry` returns undefined for an
  // unread `layout_template` rather than substituting the frozen default.
  const chosenTemplate = templateEntry(microsite?.layout_template);
  // Both frozen axes — `publish_state = 'published' AND is_visible` (see `microsite/types.ts`).
  const visibleSections = sections?.filter(isPubliclyVisibleSection).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your showcase right now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl>
              <SummaryRow label="Showcase status">
                {/* The chip itself now renders an honest absence for an unread status, so all three
                    journey steps agree — no per-caller guard needed. */}
                <MicrositeStatusChip status={microsite?.status} />
              </SummaryRow>
              <SummaryRow label="Selected template">
                {chosenTemplate ? (
                  chosenTemplate.name
                ) : (
                  <span className="font-normal text-muted-foreground">Not chosen yet</span>
                )}
              </SummaryRow>
              <SummaryRow label="Sections visible on your public page">
                {sections && sections.length > 0 ? (
                  `${visibleSections} of ${sections.length}`
                ) : (
                  <span className="font-normal text-muted-foreground">None yet</span>
                )}
              </SummaryRow>
            </dl>
            <p className="text-sm text-muted-foreground">
              Nothing is public until you publish. Until then these settings are yours alone.
            </p>
            {/* The step-2 label is long; the kit Button is `whitespace-nowrap`, which would force
                the card wider than a phone viewport. Allow it to wrap instead of truncating the
                owner-approved label or shortening it on small screens. */}
            <Button asChild className="h-auto whitespace-normal py-2 text-left">
              <Link href={journeyStepHref("design", basePath)}>
                Continue: Choose Template + Arrange Sections
                <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where your content comes from</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Your showcase draws on what you have already published across the workspace:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Company profile and capabilities</li>
              <li>Product portfolio and specifications</li>
              <li>Categories you operate in</li>
              <li>Projects you have published</li>
            </ul>
            <p>
              Sections with nothing behind them stay hidden until you add content, so an incomplete
              profile never shows an empty panel to a buyer.
            </p>
            <p className="text-foreground">
              Readiness figures appear here once your showcase is connected. Saving and publishing
              are not available yet.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your content, presented your way</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Your company profile, products, specifications and projects are one set of content. A
            template changes the layout, hierarchy and visual style of your public showcase — it
            never changes what your content is, who owns it, or who can see it.
          </p>
          <p>
            Switching templates re-presents the same published material. It never rewrites,
            republishes, or hides anything you did not hide yourself.
          </p>
          <p>
            What your business does may suggest which sections to lead with, but it never limits
            which templates you can choose. Every template is available to you, and your selection
            is never changed for you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
