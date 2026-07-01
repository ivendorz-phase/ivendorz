"use client";

// Org setup wizard — P-AUTH-03 (Doc-7E §2.3). Client Component holding only ephemeral wizard state
// (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is UX only (the server is the final
// authority). It performs NO mutation and calls NO contract — `create_organization` (the frozen
// binding) is not wired in this build, so a completed wizard shows an honest interim and creates no
// org. No kit stepper/RadioGroup primitive exists yet, so the step rail and usage options are composed
// from primitives + native inputs, wired for a11y by hand.
import { useState, type FormEvent } from "react";
import { Building2, ArrowLeft, Check, Info, ShoppingCart, Factory, Repeat } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";

// Presentation-only onboarding INTENT — this is NOT the `create_organization` participation field
// (Platform Participation is derived from later profile creation — `[ESC-7-API]` participation). It
// signposts the next onboarding step and is never submitted here.
const USAGE_OPTIONS = [
  {
    value: "buyer",
    label: "Buy",
    description: "Source parts, materials, and services from suppliers.",
    icon: ShoppingCart,
  },
  {
    value: "vendor",
    label: "Sell",
    description: "Supply or service industrial buyers.",
    icon: Factory,
  },
  {
    value: "both",
    label: "Both",
    description: "Buy and sell on iVendorz.",
    icon: Repeat,
  },
] as const;

const STEPS = ["Organization", "Usage"] as const;

export function OrgSetupWizard() {
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState("");
  const [usage, setUsage] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [usageError, setUsageError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  function goToUsage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length === 0) {
      setNameError("Enter your organization name.");
      return;
    }
    setNameError(undefined);
    setStep(1);
  }

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (usage.length === 0) {
      setUsageError("Select how you’ll use iVendorz.");
      return;
    }
    setUsageError(undefined);
    // Presentation-only: `create_organization` is not wired in this build — show the honest interim.
    setSubmitted(true);
  }

  return (
    <div>
      {/* Step rail (composed — no kit stepper primitive yet). */}
      <ol
        className="mb-6 flex items-center gap-2"
        aria-label={`Step ${step + 1} of ${STEPS.length}`}
      >
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                  (done
                    ? "bg-iv-brand-600 text-white"
                    : current
                      ? "border-2 border-iv-brand-600 text-iv-brand-700"
                      : "border border-border text-muted-foreground")
                }
                aria-hidden="true"
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={
                  "text-sm font-medium " +
                  (current || done ? "text-foreground" : "text-muted-foreground")
                }
              >
                {label}
                {current ? <span className="sr-only"> (current step)</span> : null}
              </span>
              {i < STEPS.length - 1 ? (
                <span aria-hidden="true" className="mx-1 h-px flex-1 bg-border" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {step === 0 ? (
        <form onSubmit={goToUsage} noValidate className="space-y-5">
          <FormField
            id="org-name"
            label="Organization name"
            required
            description="How buyers and suppliers will see you. You can refine details later."
            error={nameError}
          >
            <Input
              name="name"
              type="text"
              autoComplete="organization"
              placeholder="e.g. Padma Valve & Fittings Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            <Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              You’ll be the <span className="font-medium text-foreground">Owner</span> of this
              organization, and it’ll get a unique reference automatically.
            </p>
          </div>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={onCreate} noValidate className="space-y-5">
          {submitted ? (
            <div
              role="status"
              className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
            >
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>
                Organization setup is coming online soon — you’ll be able to finish here shortly.
                Nothing was submitted.
              </p>
            </div>
          ) : null}

          {/* Review of the entered name (wizard summary). */}
          <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Organization: </span>
            <span className="font-medium text-foreground">{name.trim()}</span>
          </div>

          <fieldset
            aria-describedby={usageError ? "usage-error" : undefined}
            aria-invalid={usageError ? true : undefined}
          >
            <legend className="mb-1 block text-sm font-medium text-foreground">
              How will you use iVendorz?
              <span className="ml-0.5 text-destructive" aria-hidden="true">
                *
              </span>
            </legend>
            <p className="mb-3 text-xs text-muted-foreground">
              This just sets up your next step — you can add the other side later.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {USAGE_OPTIONS.map((opt) => {
                const OptIcon = opt.icon;
                const active = usage === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={
                      "flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-ring " +
                      (active
                        ? "border-iv-brand-600 bg-iv-brand-50"
                        : "border-border hover:border-iv-brand-300 hover:bg-muted/50")
                    }
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="usage"
                        value={opt.value}
                        checked={active}
                        onChange={(e) => setUsage(e.target.value)}
                        className="sr-only"
                      />
                      <OptIcon
                        aria-hidden="true"
                        className={
                          active ? "size-4 text-iv-brand-700" : "size-4 text-muted-foreground"
                        }
                      />
                      <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </label>
                );
              })}
            </div>
            {usageError ? (
              <p id="usage-error" className="mt-2 text-sm text-destructive">
                {usageError}
              </p>
            ) : null}
          </fieldset>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={() => setStep(0)}
            >
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button type="submit" className="sm:flex-1" disabled={submitted}>
              Create organization
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
