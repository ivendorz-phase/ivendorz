// Digital Showcase — Authoring journey step model (DS-W0-R1; owner ruling 2026-07-20, plan
// `digital_showcase_planning_and_design.md` Disposition Log v0.8).
//
// THREE steps, exactly: Overview → Choose Template + Arrange Sections → Preview & Publish.
//
// Project Portfolio is deliberately NOT a step. Writing up a case study is content work that FEEDS
// the showcase, not a stage in choosing and publishing a presentation. Its surface is untouched and
// keeps its own route (`/sell/company/projects`), its content capability, and the public Projects
// section — the ruling removed it from the JOURNEY only.
//
// The active step is URL-DRIVEN through the allowlisted `?step=` param on ONE route. That is the
// established workspace idiom (`?view=` on `/sell/rfqs`, `?state=` on the invitation inbox, `?stage=`
// on the documents hub): navigation, not client state. Browser Back/Forward therefore walk the
// journey, every step is linkable, and each step stays server-rendered.
//
// NOTHING IS COINED HERE. These tokens are presentation lenses — not page IDs, lifecycle states,
// contract values, or governance identifiers. No new route is minted either: all three steps live on
// the existing `/sell/company/journey` path.

/** Allowlisted `?step=` values — anything else resolves to `overview` (the URL-param convention). */
export const JOURNEY_STEPS = ["overview", "design", "publish"] as const;

export type ShowcaseJourneyStep = (typeof JOURNEY_STEPS)[number];

/** Vendor-facing labels. Display copy only — the URL TOKEN stays the allowlisted value. */
export const JOURNEY_STEP_LABELS: Record<ShowcaseJourneyStep, string> = {
  overview: "Overview",
  design: "Choose Template + Arrange Sections",
  publish: "Preview & Publish",
};

/** Short labels for narrow rails and back/next actions. */
export const JOURNEY_STEP_SHORT_LABELS: Record<ShowcaseJourneyStep, string> = {
  overview: "Overview",
  design: "Template & sections",
  publish: "Preview & publish",
};

/**
 * Resolve a raw `?step=` search-param value against the allowlist (anything else ⇒ `overview`).
 *
 * Accepts `string[]` as well as `string`: a repeated param (`?step=design&step=publish`) arrives as
 * an array in Next.js, and a parser that only typed `string` would be lying about its input rather
 * than handling it. A repeated param has no single meaning, so it falls through to the default.
 */
export function parseJourneyStep(value: string | string[] | undefined): ShowcaseJourneyStep {
  if (typeof value !== "string") return "overview";
  return JOURNEY_STEPS.includes(value as ShowcaseJourneyStep)
    ? (value as ShowcaseJourneyStep)
    : "overview";
}

/**
 * Link target for a step. `overview` is the default, so its link carries no query — a clean
 * `/sell/company/journey` lands on the overview and the URL never accumulates a redundant param.
 */
export function journeyStepHref(step: ShowcaseJourneyStep, basePath = "/sell"): string {
  const base = `${basePath}/company/journey`;
  return step === "overview" ? base : `${base}?step=${step}`;
}

/** The step before `step`, or undefined at the start of the journey. */
export function previousJourneyStep(step: ShowcaseJourneyStep): ShowcaseJourneyStep | undefined {
  return JOURNEY_STEPS[JOURNEY_STEPS.indexOf(step) - 1];
}

/** The step after `step`, or undefined at the end of the journey. */
export function nextJourneyStep(step: ShowcaseJourneyStep): ShowcaseJourneyStep | undefined {
  return JOURNEY_STEPS[JOURNEY_STEPS.indexOf(step) + 1];
}
