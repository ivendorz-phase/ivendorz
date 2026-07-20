// Vendor Workspace — Digital Showcase · Authoring journey. THREE steps on ONE route (DS-W0-R1,
// owner ruling 2026-07-20): Overview → Choose Template + Arrange Sections → Preview & Publish.
//
// The step is URL-driven through the allowlisted `?step=` param (`parseJourneyStep`), the same idiom
// as `?view=` on `/sell/rfqs`. Consequences that matter: browser Back/Forward walk the journey, every
// step is linkable, no client state exists, and the whole page stays server-rendered. No new route is
// minted and no page ID is coined.
//
// Steps 2 and 3 COMPOSE the existing Microsite surface panels rather than re-implementing them —
// one editor, one preview, two entry points (the journey here, the full Microsite & Branding surface
// at `/sell/microsite` with its Branding / SEO / Custom-domain tabs). Re-implementing them here
// would be a duplication finding.
//
// Presentation-only: no read is wired, so every panel renders its own honest empty state and every
// write control is disabled. Project Portfolio is NOT a step in this journey — it is content work
// that feeds the showcase and keeps its own surface at `/sell/company/projects`.
//
// Imports are DIRECT module paths, never the feature barrels: the microsite barrel reaches
// `MicrositeTabs` → the `"use client"` WorkspaceTabs, a client boundary this route never renders
// (the RV-0126 barrel-leak lesson).
import type { Metadata } from "next";
import { JourneyOverview } from "../../../../_components/vendor/showcase/journey-overview";
import {
  JourneyStepNav,
  JourneyStepRail,
} from "../../../../_components/vendor/showcase/journey-nav";
import {
  JOURNEY_STEP_LABELS,
  parseJourneyStep,
} from "../../../../_components/vendor/showcase/journey-steps";
import { MicrositeBuilder } from "../../../../_components/vendor/microsite/microsite-builder";
import { PreviewPublishPanel } from "../../../../_components/vendor/microsite/preview-publish-panel";

export const metadata: Metadata = { title: "Authoring journey" };

const STEP_DESCRIPTIONS = {
  overview:
    "How your Digital Showcase comes together — from choosing a look to publishing your public page.",
  design:
    "Two independent settings. The template sets the visual style; the section arrangement sets what your page leads with. Neither changes the other, and neither changes your content.",
  publish: "See what the public will see, then publish. Nothing unpublished is ever visible.",
} as const;

export default async function AuthoringJourneyPage({
  searchParams,
}: {
  // `string[]` is real: a repeated `?step=` arrives as an array. `parseJourneyStep` owns the
  // allowlist and resolves anything that is not a single known token to the default.
  searchParams: Promise<{ step?: string | string[] }>;
}) {
  const sp = await searchParams;
  const step = parseJourneyStep(sp.step);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {step === "overview" ? "Authoring journey" : JOURNEY_STEP_LABELS[step]}
        </h1>
        <p className="text-sm text-muted-foreground">{STEP_DESCRIPTIONS[step]}</p>
      </header>

      <JourneyStepRail active={step} />

      {step === "overview" ? <JourneyOverview /> : null}
      {step === "design" ? <MicrositeBuilder /> : null}
      {step === "publish" ? <PreviewPublishPanel /> : null}

      <JourneyStepNav active={step} />
    </div>
  );
}
