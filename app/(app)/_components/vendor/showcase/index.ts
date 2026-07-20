// Digital Showcase presentation components (DS-W1 · DS-W0/DS-W0-R1).
//
// Two concerns live here:
//  • The AUTHORING JOURNEY — a three-step guided path (Overview → Choose Template + Arrange
//    Sections → Preview & Publish) over `/sell/company/journey?step=`. Steps 2 and 3 compose the
//    Microsite surface's own panels; only the overview and the journey navigation belong to this
//    feature.
//  • PROJECT PORTFOLIO — the case-study authoring surface at `/sell/company/projects`. It feeds the
//    showcase's public Projects section but is deliberately NOT a journey step (DS-W0-R1).
//
// Presentation-only; composes the FROZEN Doc-7B kit + the vendor shared layer. Typed props bind the
// frozen `marketplace.showcase_projects` shape plus the owner-ruled case-study fields carried in
// `content_jsonb` pending the `[ESC-6-SCHEMA-SHOWCASE]` additive patch (see `types.ts`). No
// governance signal appears on these surfaces; no status enum is coined.
export {
  JOURNEY_STEPS,
  JOURNEY_STEP_LABELS,
  JOURNEY_STEP_SHORT_LABELS,
  parseJourneyStep,
  journeyStepHref,
  nextJourneyStep,
  previousJourneyStep,
  type ShowcaseJourneyStep,
} from "./journey-steps";
export {
  JourneyStepRail,
  JourneyStepNav,
  type JourneyStepRailProps,
  type JourneyStepNavProps,
} from "./journey-nav";
export { JourneyOverview, type JourneyOverviewProps } from "./journey-overview";
export { ProjectList, type ProjectListProps } from "./project-list";
export { ProjectForm, type ProjectFormProps } from "./project-form";
export { ShowcaseVisibilityChip } from "./showcase-visibility-chip";
export type { ShowcaseProjectView } from "./types";
