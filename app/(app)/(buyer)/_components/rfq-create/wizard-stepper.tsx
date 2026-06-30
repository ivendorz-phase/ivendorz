// P-BUY-RFQ — wizard PROGRESS INDICATOR (a buyer-scoped realization of the Doc-7B-deferred `T-WIZARD`
// stepper chrome; promotion candidate). PRESENTATION-ONLY: `activeStep` is a prop; the stepper navigates
// nothing and mutates nothing. A11y: an ordered list under a labelled nav; the active step is aria-current.

import { Check } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { WizardStep } from "./rfq-options";

export function WizardStepper({ steps, activeStep }: { steps: WizardStep[]; activeStep: number }) {
  return (
    <nav aria-label="RFQ progress">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {steps.map((step, i) => {
          const state = i < activeStep ? "done" : i === activeStep ? "current" : "upcoming";
          return (
            <li key={step.key} className="flex flex-1 items-center gap-2">
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  state === "done" && "border-transparent bg-iv-primary text-primary-foreground",
                  state === "current" && "border-iv-brand-600 text-iv-brand-700",
                  state === "upcoming" && "border-border text-muted-foreground",
                )}
              >
                {state === "done" ? <Check aria-hidden className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium",
                  state === "current" ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {i < steps.length - 1 ? (
                <span aria-hidden className="mx-2 hidden h-px flex-1 bg-border sm:block" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
