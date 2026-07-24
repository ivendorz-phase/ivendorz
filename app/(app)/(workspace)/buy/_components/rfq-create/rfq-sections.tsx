"use client";

// P-BUY-RFQ — the canvas FIELD SECTIONS. CONTROLLED as of 2026-07-24 (owner rulings D1–D3): every
// field renders from the single `RfqDraftForm` owned by `RfqAuthoringSurface` and reports edits via
// `onChange`. Still no fetch, no mutation, no submit — the draft is client-held until an explicit
// Save, and Save itself is simulated until Phase 4 (D2). Reuses the kit `Card`/`FormField`/
// `Combobox` + the buyer `Textarea`/`Select` controls + `Badge`. The
// PINNED frozen fields (category, work_nature, scope_text, no_formal_spec, budget/currency, routing_mode) are
// labelled by intent; the rest are the dev-doc capture (see rfq-form-models.ts). No matching weight is set
// by the buyer (R6); no AI. COMMERCIAL terms (payment / incoterms / tax) are NOT here — the vendor defines
// them in its quotation (Board ruling 2026-07-01); the buyer states only optional budget GUIDANCE (R8).

import * as React from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/frontend/primitives/tooltip";
import { Combobox } from "@/frontend/primitives/combobox";
import { FormField } from "@/frontend/components/form-field";
import { RequirednessMark } from "./rfq-requiredness";
import { CATEGORY_OPTIONS, categoryDisplayPath } from "./rfq-category-options";
import { cn } from "@/frontend/lib/cn";
import { Textarea, Select, CheckboxRow } from "../form-controls";
import { ItemRequirementsTable } from "./item-requirements-table";
import { DescriptionList, type DescriptionItem } from "../description-list";
import {
  WORK_NATURE_OPTIONS,
  WORK_NATURE_LABEL,
  ROUTING_MODE_OPTIONS,
  FINANCIAL_TIER_OPTIONS,
  CONDITION_OPTIONS,
  DELIVERY_SITE_OPTIONS,
  URGENCY_OPTIONS,
  VENDOR_TYPE_OPTIONS,
} from "./rfq-options";
import type { RfqDraftForm } from "./rfq-form-models";

/** The single titled-card shell (a kit `Card` composition) reused by the form sections, the review
 *  summaries, and the host's Attachments/Review panels. `titleAs="h3"` nests review sub-cards under the
 *  "Review" `<h2>` for a correct heading outline. */
export function TitledCard({
  title,
  titleSuffix,
  children,
  contentClassName,
  titleAs,
}: {
  title: string;
  /** Optional content rendered inline after the title (e.g. a hover tips icon). */
  titleSuffix?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  titleAs?: "h2" | "h3";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-1.5 p-4">
        <CardTitle as={titleAs} className="text-sm font-semibold">
          {title}
        </CardTitle>
        {titleSuffix}
      </CardHeader>
      <CardContent className={cn("p-4 pt-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  titleSuffix,
  children,
}: {
  title: string;
  titleSuffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <TitledCard
      title={title}
      titleSuffix={titleSuffix}
      contentClassName="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {children}
    </TitledCard>
  );
}

/** Small hover-only tips affordance — a kit `Tooltip` on an info icon (no click/dismiss state; pure
 *  hover/focus disclosure). Presentation-only guidance, no AI (Board scope). */
function TipsHint({ label, tips }: { label: string; tips: string[] }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Info aria-hidden className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left" side="right">
        <ul className="flex flex-col gap-1">
          {tips.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

/** Every section is CONTROLLED: it renders `form` and reports edits through `onChange`. The draft
 *  lives in one place (`RfqAuthoringSurface`) so readiness, the rail and the preview all read the
 *  same object. No section owns draft state and none of them saves anything (D2 — explicit save). */
export interface SectionProps {
  form: RfqDraftForm;
  onChange: (patch: Partial<RfqDraftForm>) => void;
}

// ── Phase 2 — Requirement details ─────────────────────────────────────────────────────────────────────
export function RequirementSection({ form, onChange }: SectionProps) {
  return (
    <SectionCard
      title="Requirement details"
      titleSuffix={
        <TipsHint
          label="Tips for a strong RFQ"
          tips={[
            "Be specific about grade, dimensions, and tolerances — it gets you better-matched quotes.",
            "Attach drawings or a bill of quantities so vendors quote against the same scope.",
            "Set a realistic delivery date and a district so logistics can be priced.",
            "Vendors are matched by the routing engine — you choose the breadth, not the winner.",
          ]}
        />
      }
    >
      {/* The kit combobox (D6). Set in the Zone-1 gate; still editable here — the gate controls
          ENTRY, not ownership. The value is the opaque `category_id`; the path is display only. */}
      <FormField
        id="rfq-category"
        label={
          <span className="inline-flex items-center gap-2">
            Category
            <RequirednessMark kind="start" />
          </span>
        }
        description={form.categoryPath || undefined}
      >
        <Combobox
          id="rfq-category"
          options={CATEGORY_OPTIONS}
          value={form.categoryId ?? null}
          placeholder="Search the category tree…"
          onValueChange={(value, option) =>
            onChange({
              categoryId: value ?? undefined,
              categoryLabel: option?.label,
              categoryPath: categoryDisplayPath(option),
            })
          }
        />
      </FormField>
      {/* A checkbox GROUP → fieldset/legend (not FormField, which wires a single label→control). */}
      <fieldset className="sm:col-span-2">
        <legend className="flex items-center gap-2 text-sm font-medium text-foreground">
          Request type
          <RequirednessMark kind="start" />
        </legend>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pick all that apply (Product Supply / Service / Fabrication / Consulting). Stored as{" "}
          <span className="font-mono">work_nature[]</span>.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WORK_NATURE_OPTIONS.map((o) => {
            const checked = form.workNature?.includes(o.value) ?? false;
            return (
              <CheckboxRow
                key={o.value}
                id={`rfq-wn-${o.value}`}
                label={o.label}
                checked={checked}
                onChange={(event) => {
                  const current = form.workNature ?? [];
                  onChange({
                    workNature: event.target.checked
                      ? // keep the frozen set order stable, and never duplicate (Doc-2 §10.4)
                        WORK_NATURE_OPTIONS.map((x) => x.value).filter(
                          (v) => v === o.value || current.includes(v),
                        )
                      : current.filter((v) => v !== o.value),
                  });
                }}
              />
            );
          })}
        </div>
      </fieldset>
      <ItemRequirementsTable rows={form.itemRows} onChange={(itemRows) => onChange({ itemRows })} />
    </SectionCard>
  );
}

// ── Phase 3 — Technical requirements ──────────────────────────────────────────────────────────────────
export function TechnicalSection({
  form,
  onChange,
  minScopeChars,
}: SectionProps & {
  /** POLICY `rfq.min_scope_chars` — SERVER-PROVIDED (Doc-3 §12.2). Never hardcoded here. */
  minScopeChars: number;
}) {
  const scopeLength = (form.scopeText ?? "").trim().length;
  const scopeMeterOn = form.noFormalSpec === true;
  const scopeMet = scopeLength >= minScopeChars;

  return (
    <SectionCard title="Technical requirements">
      <FormField
        id="rfq-scope"
        label={
          <span className="inline-flex items-center gap-2">
            Specifications
            <RequirednessMark kind={scopeMeterOn ? "submit" : "conditional"} />
          </span>
        }
        description="Grade, dimensions, tolerances, scope of work. The submission gate needs either an attachment or a written scope."
        className="sm:col-span-2"
      >
        <Textarea
          rows={6}
          value={form.scopeText ?? ""}
          onChange={(event) => onChange({ scopeText: event.target.value })}
          placeholder="Specification, scope, and acceptance criteria…"
        />
      </FormField>

      {/* The conditional requirement, made visible: with `no_formal_spec` set, the written scope
          must reach POLICY `rfq.min_scope_chars` (Doc-3 §1.2). The threshold comes from the server. */}
      {scopeMeterOn ? (
        <div className="sm:col-span-2">
          <div className="h-1 overflow-hidden rounded-full bg-border">
            <span
              className={cn(
                "block h-full rounded-full transition-[width] duration-200 ease-iv-out",
                scopeMet ? "bg-iv-success-base" : "bg-iv-warning-base",
              )}
              style={{
                width: `${Math.min(100, Math.round((scopeLength / minScopeChars) * 100))}%`,
              }}
            />
          </div>
          <p
            className={cn(
              "mt-1.5 text-xs",
              scopeMet
                ? "text-iv-success-muted dark:text-iv-success-text"
                : "text-muted-foreground",
            )}
          >
            {scopeLength} of {minScopeChars} characters
          </p>
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <CheckboxRow
          id="rfq-noformalspec"
          label="I don't have a formal specification document"
          checked={form.noFormalSpec ?? false}
          onChange={(event) => onChange({ noFormalSpec: event.target.checked })}
        />
      </div>
      <FormField
        id="rfq-brand"
        label="Brand preference"
        inputProps={{
          value: form.brandPreference ?? "",
          onChange: (event) => onChange({ brandPreference: event.target.value }),
          placeholder: "Preferred brand (optional)",
        }}
      />
      <FormField
        id="rfq-altbrand"
        label="Alternative brand"
        inputProps={{
          value: form.alternativeBrand ?? "",
          onChange: (event) => onChange({ alternativeBrand: event.target.value }),
          placeholder: "Acceptable alternative",
        }}
      />
      <FormField id="rfq-condition" label="Product condition">
        <Select
          options={CONDITION_OPTIONS}
          placeholder="Select condition"
          value={form.productCondition ?? ""}
          onChange={(event) => onChange({ productCondition: event.target.value })}
        />
      </FormField>
      <FormField
        id="rfq-standards"
        label="Standards"
        inputProps={{
          value: form.standards ?? "",
          onChange: (event) => onChange({ standards: event.target.value }),
          placeholder: "e.g. ASTM A36, ISO 9001",
        }}
      />
      <FormField
        id="rfq-certs"
        label="Certifications"
        className="sm:col-span-2"
        inputProps={{
          value: form.certifications ?? "",
          onChange: (event) => onChange({ certifications: event.target.value }),
          placeholder: "e.g. EN 10204 3.1, mill test cert",
        }}
      />
    </SectionCard>
  );
}

// ── Delivery requirements ─────────────────────────────────────────────────────────────────────────────
export function DeliverySection({ form, onChange }: SectionProps) {
  return (
    <SectionCard title="Delivery requirements">
      <FormField
        id="rfq-location"
        label={
          <span className="inline-flex items-center gap-2">
            Delivery location
            <RequirednessMark kind="optional" />
          </span>
        }
        inputProps={{
          value: form.deliveryLocation ?? "",
          onChange: (event) => onChange({ deliveryLocation: event.target.value }),
          placeholder: "Site / address",
        }}
      />
      {/* `delivery_geography` at least to district level is in the frozen submission FIXED-set
          (Doc-3 §1.2). Marked as required-before-submission, never enforced client-side — the draft
          itself stays permissive. */}
      <FormField
        id="rfq-district"
        label={
          <span className="inline-flex items-center gap-2">
            Delivery district
            <RequirednessMark kind="submit" />
          </span>
        }
        description="At least a district is needed before you can submit."
        inputProps={{
          value: form.district ?? "",
          onChange: (event) => onChange({ district: event.target.value }),
          placeholder: "e.g. Gazipur",
        }}
      />
      <FormField
        id="rfq-date"
        label={
          <span className="inline-flex items-center gap-2">
            Required delivery date
            <RequirednessMark kind="optional" />
          </span>
        }
        inputProps={{
          value: form.deliveryDate ?? "",
          onChange: (event) => onChange({ deliveryDate: event.target.value }),
          type: "date",
        }}
      />
      <FormField id="rfq-site" label="Delivery site">
        <Select
          options={DELIVERY_SITE_OPTIONS}
          placeholder="Factory / Warehouse / Site"
          value={form.deliverySite ?? ""}
          onChange={(event) => onChange({ deliverySite: event.target.value })}
        />
      </FormField>
      <FormField id="rfq-instructions" label="Delivery instructions" className="sm:col-span-2">
        <Textarea
          rows={3}
          value={form.deliveryInstructions ?? ""}
          onChange={(event) => onChange({ deliveryInstructions: event.target.value })}
          placeholder="Access, unloading, timing, packaging…"
        />
      </FormField>
    </SectionCard>
  );
}

// ── Estimated value & priority ────────────────────────────────────────────────────────────────────────
// CORRECTED 2026-07-24 (owner ruling D3 — MAJOR, mandatory). This card previously read "Budget &
// priority (optional)" with the helper "Optional guidance for vendors", which contradicts the frozen
// gate: Doc-3 §1.2 puts `estimated_value` present and > 0 BDT INSIDE the submission FIXED-set. It
// stays non-blocking while drafting, but it is never presented as optional.
//
// It remains commercial GUIDANCE, not commercial terms: payment / incoterms / tax are defined by the
// VENDOR in its quotation (Board ruling 2026-07-01), and the platform moves no money (R8).
export function BudgetSection({ form, onChange }: SectionProps) {
  return (
    <SectionCard title="Estimated value & priority">
      <FormField
        id="rfq-budget"
        label={
          <span className="inline-flex items-center gap-2">
            Estimated value (BDT)
            <RequirednessMark kind="submit" />
          </span>
        }
        description="Needed before you can submit. Sizes and routes your request; it is not a commitment, and no currency selector — BDT at create."
        inputProps={{
          value: form.budget ?? "",
          onChange: (event) => onChange({ budget: event.target.value }),
          type: "number",
          inputMode: "decimal",
          min: 0,
          placeholder: "e.g. 1800000",
        }}
      />
      <FormField id="rfq-urgency" label="Urgency">
        <Select
          options={URGENCY_OPTIONS}
          placeholder="Standard"
          value={form.urgency ?? ""}
          onChange={(event) => onChange({ urgency: event.target.value })}
        />
      </FormField>
      <FormField id="rfq-special" label="Special instructions" className="sm:col-span-2">
        <Textarea
          rows={3}
          value={form.specialInstructions ?? ""}
          onChange={(event) => onChange({ specialInstructions: event.target.value })}
          placeholder="Anything else vendors should know — not commercial terms (those come in the quote)…"
        />
      </FormField>
    </SectionCard>
  );
}

// ── Phase 6 — Vendor preferences ──────────────────────────────────────────────────────────────────────
export function VendorSection({ form, onChange }: SectionProps) {
  return (
    <SectionCard title="Vendor preferences">
      {/* `routing_mode` is in the frozen submission FIXED-set (Doc-3 §1.2). The buyer sets BREADTH;
          the engine decides who is invited (R6) — never a dispatch, never a matching weight. */}
      <FormField
        id="rfq-routing"
        label={
          <span className="inline-flex items-center gap-2">
            Routing breadth
            <RequirednessMark kind="submit" />
          </span>
        }
        description="How broadly to route this RFQ. The matching engine still decides who is invited. Routing preferences affect vendor matching only. They never make an RFQ public."
        className="sm:col-span-2"
      >
        <Select
          options={ROUTING_MODE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Select routing breadth"
          value={form.routingMode ?? ""}
          onChange={(event) =>
            onChange({
              routingMode: (event.target.value || undefined) as RfqDraftForm["routingMode"],
            })
          }
        />
      </FormField>
      <FormField
        id="rfq-prefvendor"
        label={
          <span className="inline-flex items-center gap-2">
            Preferred vendor
            <RequirednessMark kind="optional" label="Optional hint" />
          </span>
        }
        description="A preference hint only — never an invitation or a dispatch."
        inputProps={{
          value: form.preferredVendor ?? "",
          onChange: (event) => onChange({ preferredVendor: event.target.value }),
          placeholder: "Search vendors…",
        }}
      />
      <FormField id="rfq-vendortype" label="Vendor type">
        <Select
          options={VENDOR_TYPE_OPTIONS}
          placeholder="Any"
          value={form.manufacturerOrImporter ?? ""}
          onChange={(event) => onChange({ manufacturerOrImporter: event.target.value })}
        />
      </FormField>
      <FormField
        id="rfq-tier"
        label="Preferred vendor classification"
        description="Optional — preferred Financial Tier (a capability tier, not a plan)."
      >
        <Select
          options={FINANCIAL_TIER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Any tier"
          value={form.financialTier ?? ""}
          onChange={(event) =>
            onChange({
              financialTier: (event.target.value || undefined) as RfqDraftForm["financialTier"],
            })
          }
        />
      </FormField>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <CheckboxRow
          id="rfq-verified"
          label="Verified vendors only"
          checked={form.verifiedOnly ?? false}
          onChange={(event) => onChange({ verifiedOnly: event.target.checked })}
        />
        <CheckboxRow
          id="rfq-acceptalt"
          label="Accept alternative products / brands"
          checked={form.acceptAlternatives ?? false}
          onChange={(event) => onChange({ acceptAlternatives: event.target.checked })}
        />
      </div>
    </SectionCard>
  );
}

// NOTE: `CommunicationSection` moved to `./communication-section.tsx` (CLIENT — the WhatsApp contact
// block reveals only while its checkbox is checked, a local UI toggle no longer expressible as a
// server-rendered, uncontrolled section).

// ── Phase 7 — Review (read-only summary cards) ────────────────────────────────────────────────────────
function dash(v?: string) {
  return v && v.length > 0 ? v : "—";
}

export function ReviewSection({ form }: { form: RfqDraftForm }) {
  const requirement: DescriptionItem[] = [
    { label: "Category", value: dash(form.categoryLabel) },
    {
      label: "Request type",
      value:
        form.workNature && form.workNature.length > 0
          ? form.workNature.map((w) => WORK_NATURE_LABEL[w]).join(", ")
          : "—",
    },
    {
      label: "Items",
      value: (() => {
        const rows = (form.itemRows ?? []).filter((r) => r.itemName.trim().length > 0);
        return rows.length === 0
          ? "—"
          : `${rows.length} item${rows.length === 1 ? "" : "s"} listed`;
      })(),
    },
  ];
  const specs: DescriptionItem[] = [
    { label: "Specification", value: dash(form.scopeText) },
    { label: "Brand", value: dash(form.brandPreference) },
    { label: "Condition", value: dash(form.productCondition) },
    { label: "Standards", value: dash(form.standards) },
  ];
  const delivery: DescriptionItem[] = [
    { label: "Location", value: dash(form.deliveryLocation) },
    { label: "District", value: dash(form.district) },
    { label: "Needed by", value: dash(form.deliveryDate) },
    { label: "Site", value: dash(form.deliverySite) },
  ];
  const vendor: DescriptionItem[] = [
    { label: "Routing", value: dash(form.routingMode) },
    { label: "Vendor type", value: dash(form.manufacturerOrImporter) },
    { label: "Classification", value: dash(form.financialTier) },
    { label: "Verified only", value: form.verifiedOnly ? "Yes" : "No" },
    { label: "Accept alternatives", value: form.acceptAlternatives ? "Yes" : "No" },
  ];
  const budget: DescriptionItem[] = [
    { label: "Estimated budget", value: form.budget ? `${form.budget} BDT` : "—" },
    { label: "Urgency", value: dash(form.urgency) },
  ];
  const communication: DescriptionItem[] = [
    {
      label: "Channels",
      value: [
        "Platform",
        form.contactPhone && "Phone",
        form.contactWhatsapp && "WhatsApp",
        form.contactEmail && "Email",
      ]
        .filter(Boolean)
        .join(", "),
    },
    { label: "WhatsApp", value: form.whatsappAllow ? "Allowed" : "Not allowed" },
    { label: "Contact time", value: dash(form.preferredContactTime) },
  ];
  const fileCount = form.attachments?.length ?? 0;
  const termsCount = (form.termsAndConditions ?? []).filter((t) => t.trim().length > 0).length;

  return (
    <div className="flex flex-col gap-4">
      <SummaryCard title="Requirement" items={requirement} />
      <SummaryCard title="Specifications" items={specs} />
      <TitledCard title="Files" titleAs="h3">
        <p className="text-sm text-muted-foreground">
          {fileCount === 0
            ? "No attachments"
            : fileCount === 1
              ? "1 file attached"
              : `${fileCount} files attached`}
        </p>
      </TitledCard>
      <TitledCard title="Terms & conditions" titleAs="h3">
        <p className="text-sm text-muted-foreground">
          {termsCount === 0
            ? "No conditions added"
            : `${termsCount} condition${termsCount === 1 ? "" : "s"}`}
        </p>
      </TitledCard>
      <SummaryCard title="Delivery" items={delivery} />
      <SummaryCard title="Vendor preferences" items={vendor} />
      <SummaryCard title="Budget & priority" items={budget} />
      <SummaryCard title="Communication" items={communication} />
    </div>
  );
}

function SummaryCard({ title, items }: { title: string; items: DescriptionItem[] }) {
  // h3 — these summaries nest under the host's "Review" <h2> (correct heading outline).
  return (
    <TitledCard title={title} titleAs="h3">
      <DescriptionList items={items} />
    </TitledCard>
  );
}
