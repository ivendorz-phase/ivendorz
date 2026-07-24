"use client";

// P-BUY-RFQ — ZONE 1, the authoring gate (owner ruling D1, 2026-07-24).
//
// This gate is not a UX preference. `rfq.create_rfq.v1` (Doc-4E §E4.1) marks `category_id` and
// `work_nature[]` **Required: yes**, so no draft can exist server-side without them — the corpus
// puts a seam exactly where a first step belongs. The buyer cannot enter the authoring canvas until
// both are answered. A conventional nine-step wizard is NOT implemented (D1, binding).
//
// Procurement Mode is a buyer-facing LABEL that MAPS onto the frozen `work_nature` set
// (`RFQ-CREATION-BUSINESS-MODEL.md` §2 crosswalk) — it coins no RFQ field, and the stored value is
// shown verbatim so the mapping is never hidden. That companion is a DRAFT v1.0 non-authoritative
// doc; surfacing its nine labels is an open item carried in the delivery plan.
//
// PRESENTATION-ONLY: continuing does not call `create_rfq` (Wave 4, PARKED). No fetch, no mutation.

import * as React from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Combobox } from "@/frontend/primitives/combobox";
import { FormField } from "@/frontend/components/form-field";
import { cn } from "@/frontend/lib/cn";
import { Callout } from "../callout";
import { RequirednessMark } from "./rfq-requiredness";
import { CATEGORY_OPTIONS, categoryDisplayPath } from "./rfq-category-options";
import type { RfqDraftForm, WorkNature } from "./rfq-form-models";

/** Procurement Mode → `work_nature` (RFQ-CREATION-BUSINESS-MODEL.md §2). Presentation → frozen set. */
const PROCUREMENT_MODES: { key: string; label: string; workNature: WorkNature[] }[] = [
  { key: "supply", label: "Supply", workNature: ["supply"] },
  { key: "supply_install", label: "Supply + Installation", workNature: ["supply", "service"] },
  { key: "supply_commission", label: "Supply + Commissioning", workNature: ["supply", "service"] },
  { key: "fabrication", label: "Fabrication", workNature: ["fabricate"] },
  {
    key: "fabrication_install",
    label: "Fabrication + Install",
    workNature: ["fabricate", "service"],
  },
  { key: "turnkey", label: "Turnkey EPC", workNature: ["supply", "fabricate", "service"] },
  { key: "consultancy", label: "Consultancy", workNature: ["consult"] },
  { key: "maintenance", label: "Maintenance contract", workNature: ["service"] },
  { key: "amc", label: "Annual service (AMC)", workNature: ["service"] },
];

function sameSet(a: WorkNature[], b?: WorkNature[]) {
  if (!b || a.length !== b.length) return false;
  return a.every((x) => b.includes(x));
}

export function RfqZoneOne({
  form,
  onChange,
  onContinue,
}: {
  form: RfqDraftForm;
  onChange: (patch: Partial<RfqDraftForm>) => void;
  onContinue: () => void;
}) {
  const [showErrors, setShowErrors] = React.useState(false);

  const hasCategory = Boolean(form.categoryId);
  const hasWorkNature = (form.workNature ?? []).length > 0;
  const ready = hasCategory && hasWorkNature;

  function pickMode(mode: (typeof PROCUREMENT_MODES)[number]) {
    onChange({ workNature: mode.workNature, procurementMode: mode.key });
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          What do you need?
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Two answers start your request. Everything else is authored on one canvas afterwards, and
          you can change these at any time before you submit.
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
          <p className="mb-4 flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-iv-brand-600">
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-iv-brand-600 text-2xs text-white">
              1
            </span>
            Start your RFQ
          </p>

          {/* Category — the kit combobox (D6). The picker's value is the opaque `category_id`. */}
          <FormField
            id="rfq-zone1-category"
            label={
              <span className="inline-flex items-center gap-2">
                Category
                <RequirednessMark kind="start" />
              </span>
            }
            description="Type to search, ↑ ↓ to move, Enter to select. Categories shown are illustrative until the taxonomy is seeded; the live picker reads marketplace.list_categories.v1."
            className="mb-5"
            error={showErrors && !hasCategory ? "Choose a category to continue." : undefined}
          >
            <Combobox
              id="rfq-zone1-category"
              options={CATEGORY_OPTIONS}
              value={form.categoryId ?? null}
              placeholder="Search the category tree…"
              aria-invalid={showErrors && !hasCategory}
              emptyMessage={(query) => (
                <>
                  No categories match {query ? <b>“{query}”</b> : "your search"}.
                  <span className="mt-1 block text-xs">
                    Try a broader word, e.g. “pump” or “cable”.
                  </span>
                </>
              )}
              onValueChange={(value, option) =>
                onChange({
                  categoryId: value ?? undefined,
                  categoryLabel: option?.label,
                  categoryPath: categoryDisplayPath(option),
                })
              }
            />
          </FormField>

          {form.categoryPath ? (
            <p className="-mt-3 mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check aria-hidden className="size-3.5 text-iv-success-base" />
              Selected: <span className="font-medium text-foreground">{form.categoryPath}</span>
            </p>
          ) : null}

          {/* Procurement mode → work_nature. A fieldset, because it is a choice group. */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-medium text-foreground">
              What kind of work is this?
              <RequirednessMark kind="start" />
            </legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {PROCUREMENT_MODES.map((mode) => {
                const active =
                  sameSet(mode.workNature, form.workNature) && form.procurementMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => pickMode(mode)}
                    className={cn(
                      "rounded-md border border-border bg-background p-3 text-left transition-colors duration-150 ease-iv-out",
                      "hover:border-iv-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active && "border-iv-brand-500 bg-iv-brand-50 ring-1 ring-iv-brand-500",
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">{mode.label}</span>
                    <span className="mt-0.5 block font-mono text-2xs text-muted-foreground">
                      {mode.workNature.join(" · ")}
                    </span>
                  </button>
                );
              })}
            </div>
            {showErrors && !hasWorkNature ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                Pick at least one kind of work.
              </p>
            ) : null}
          </fieldset>

          {/* The mapping is shown, never hidden — the buyer-facing label is not the stored value. */}
          <p className="mt-3 rounded-md border border-iv-navy-100 bg-iv-navy-50 px-3 py-2 text-xs text-muted-foreground">
            Stored as{" "}
            <span className="font-mono font-semibold text-iv-navy-800">work_nature[]</span> —{" "}
            <span className="font-mono">
              {hasWorkNature ? `[${(form.workNature ?? []).join(", ")}]` : "nothing selected yet"}
            </span>
            . The buyer-facing label maps onto the frozen capability set; it coins nothing.
          </p>
        </CardContent>
      </Card>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Owner-specified copy 2026-07-10 (trust_adoption_ladder §5.3). There is deliberately no
            public/private option: RFQs are distributed, never published (Doc-3 §5.1). */}
        <Callout icon={<Lock aria-hidden />} className="flex-1">
          <span className="font-medium text-foreground">Privacy by Design</span> — your RFQ is never
          publicly published.
        </Callout>
        <Button
          type="button"
          size="lg"
          className="gap-2"
          aria-disabled={!ready}
          onClick={() => {
            if (!ready) {
              setShowErrors(true);
              return;
            }
            onContinue();
          }}
        >
          Continue
          <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
      <p className="mt-2 text-right text-xs text-muted-foreground">
        Continues to the authoring canvas. At wiring this is where <code>create_rfq</code> mints the
        draft — no write happens today.
      </p>
    </div>
  );
}
