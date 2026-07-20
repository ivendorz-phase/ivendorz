// Digital Showcase — Authoring journey navigation (DS-W0-R1). Two presentation pieces:
//
//  • `JourneyStepRail`  — the three-step rail at the top of every step. This is the production
//    translation of the approved prototype's sidebar "Authoring journey" list: the platform shell
//    owns the real sidebar (`vendor-shell-vm.ts`) and `NavItem.children` is one level deep, so a
//    second nested nav is not available — the rail carries that role in-page instead, keeping the
//    same numbered-step reading order.
//
//    ACTIVE-STEP COLOUR — approved deviation from the prototype (owner ruling 2026-07-20). The
//    prototype marks the active step in AMBER; production uses the frozen `iv-brand-*` treatment,
//    matching the sibling `rfq-create/wizard-stepper.tsx`. `--iv-amber-*` is semantically reserved
//    for Award / Premium / Verified (`globals.css` §Premium Gold); spending it on ordinary wizard
//    progress weakens the token grammar. The frozen frontend foundation takes precedence over the
//    prototype. Amber remains correct for governance gate annotations and for prototype review
//    chrome — neither of which exists on this surface.
//  • `JourneyStepNav`   — the Back / Next pair closing each step.
//
// Both are URL-driven: every control is a plain `Link` onto the allowlisted `?step=` param, so there
// is no client state, no hooks (RSC-friendly), and browser Back/Forward walk the journey. The rail
// marks the active step with `aria-current="step"`, so assistive tech reads position without relying
// on the colour alone.
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  JOURNEY_STEPS,
  JOURNEY_STEP_LABELS,
  JOURNEY_STEP_SHORT_LABELS,
  journeyStepHref,
  nextJourneyStep,
  previousJourneyStep,
  type ShowcaseJourneyStep,
} from "./journey-steps";

export interface JourneyStepRailProps {
  active: ShowcaseJourneyStep;
  /** Selling-surface mount prefix ([ESC-7G-A7] `/sell`). */
  basePath?: string;
}

export function JourneyStepRail({ active, basePath = "/sell" }: JourneyStepRailProps) {
  return (
    <nav aria-label="Authoring journey">
      <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {JOURNEY_STEPS.map((step, index) => {
          const isActive = step === active;
          return (
            <li key={step} className="min-w-0 flex-1">
              <Link
                href={journeyStepHref(step, basePath)}
                aria-current={isActive ? "step" : undefined}
                className={`flex h-full items-center gap-3 rounded-md border bg-card p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? "border-iv-brand-200 bg-iv-brand-50 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    isActive ? "bg-iv-brand-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step {index + 1}
                  </span>
                  {/* WRAPS, never truncates. "Choose Template + Arrange Sections" overflows a
                      three-up rail across roughly 640–1100px, and on steps 1 and 3 this rail is the
                      only place the owner-approved label appears — truncating it there hides the
                      label at ordinary laptop widths. The cards are `h-full`, so they equalise. */}
                  <span className="block text-sm font-medium">{JOURNEY_STEP_LABELS[step]}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface JourneyStepNavProps {
  active: ShowcaseJourneyStep;
  basePath?: string;
}

/** Back / Next for the current step. Renders nothing at a journey end where the direction is absent. */
export function JourneyStepNav({ active, basePath = "/sell" }: JourneyStepNavProps) {
  const previous = previousJourneyStep(active);
  const next = nextJourneyStep(active);
  if (!previous && !next) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
      {/* Back FIRST, then Next — DOM/tab order matches reading order and the arrows point the way
          the buttons sit, as in `org-setup-wizard` and `WizardStepper`. `h-auto whitespace-normal`
          throughout: the kit Button is `whitespace-nowrap`, and these labels are long enough to push
          a phone viewport into horizontal scroll otherwise. */}
      {previous ? (
        <Button asChild variant="outline" className="h-auto whitespace-normal py-2 text-left">
          <Link href={journeyStepHref(previous, basePath)}>
            <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            Back to {JOURNEY_STEP_SHORT_LABELS[previous].toLowerCase()}
          </Link>
        </Button>
      ) : null}
      {next ? (
        <Button asChild className="h-auto whitespace-normal py-2 text-left sm:ml-auto">
          <Link href={journeyStepHref(next, basePath)}>
            Next: {JOURNEY_STEP_SHORT_LABELS[next]}
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
