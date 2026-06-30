// P-BUY-RFQ — the wizard FIELD SECTIONS. PRESENTATION-ONLY: fields render from `data.form` via `defaultValue`/
// `defaultChecked` (uncontrolled — no state, no onChange, no submit; a client form surface wires values at
// integration). Reuses the kit `Card`/`FormField` + the buyer `Textarea`/`Select` controls + `Badge`. The
// PINNED frozen fields (category, work_nature, scope_text, no_formal_spec, budget/currency, routing_mode) are
// labelled by intent; the rest are the dev-doc capture (see rfq-form-models.ts). No matching weight is set
// by the buyer (R6); no AI; no money moves (R8 — payment is a stated preference only).

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { FormField } from "@/frontend/components/form-field";
import { Textarea, Select } from "../form-controls";
import { DescriptionList, type DescriptionItem } from "../description-list";
import {
  WORK_NATURE_OPTIONS,
  ROUTING_MODE_OPTIONS,
  FINANCIAL_TIER_OPTIONS,
  UNIT_OPTIONS,
  CONDITION_OPTIONS,
  INCOTERM_OPTIONS,
  PAYMENT_OPTIONS,
  TAX_OPTIONS,
  VENDOR_TYPE_OPTIONS,
} from "./rfq-options";
import type { RfqDraftForm } from "./rfq-form-models";

/** A native checkbox row (the kit ships no `checkbox` primitive yet — a Doc-7B-deferred control). */
function CheckboxRow({
  id,
  label,
  defaultChecked,
}: {
  id: string;
  label: React.ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        id={id}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 rounded border-input text-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <span>{label}</span>
    </label>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  );
}

// ── Phase 2 — Requirement details ─────────────────────────────────────────────────────────────────────
export function RequirementSection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard title="Requirement details">
      <FormField
        id="rfq-industry"
        label="Industry"
        description="Helps narrow the category list (not stored on the RFQ)."
        inputProps={{ defaultValue: form.industry, placeholder: "e.g. Steel & Metals" }}
      />
      <FormField id="rfq-category" label="Category" required>
        <Select
          options={form.categoryLabel ? [{ value: "c", label: form.categoryLabel }] : []}
          placeholder="Select a category"
          defaultValue={form.categoryLabel ? "c" : ""}
        />
      </FormField>
      {/* A checkbox GROUP → fieldset/legend (not FormField, which wires a single label→control). */}
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium text-foreground">
          Request type
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        </legend>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pick all that apply (supply / service / fabricate / consult).
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WORK_NATURE_OPTIONS.map((o) => (
            <CheckboxRow
              key={o.value}
              id={`rfq-wn-${o.value}`}
              label={o.label}
              defaultChecked={form.workNature?.includes(o.value)}
            />
          ))}
        </div>
      </fieldset>
      <FormField
        id="rfq-item"
        label="Item name"
        required
        inputProps={{ defaultValue: form.itemName, placeholder: "e.g. MS plate 12mm" }}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="rfq-qty"
          label="Quantity"
          inputProps={{ defaultValue: form.quantity, type: "number", inputMode: "decimal", min: 0 }}
        />
        <FormField id="rfq-unit" label="Unit">
          <Select options={UNIT_OPTIONS} placeholder="Unit" defaultValue={form.unit ?? ""} />
        </FormField>
      </div>
    </SectionCard>
  );
}

// ── Phase 3 — Technical requirements ──────────────────────────────────────────────────────────────────
export function TechnicalSection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard title="Technical requirements">
      <FormField
        id="rfq-scope"
        label="Specifications"
        description="Describe the requirement — grade, dimensions, tolerances, scope of work. Required to submit."
        className="sm:col-span-2"
      >
        <Textarea
          rows={6}
          defaultValue={form.scopeText}
          placeholder="Specification, scope, and acceptance criteria…"
        />
      </FormField>
      <div className="sm:col-span-2">
        <CheckboxRow
          id="rfq-noformalspec"
          label="I don't have a formal specification document"
          defaultChecked={form.noFormalSpec}
        />
      </div>
      <FormField
        id="rfq-brand"
        label="Brand preference"
        inputProps={{
          defaultValue: form.brandPreference,
          placeholder: "Preferred brand (optional)",
        }}
      />
      <FormField
        id="rfq-altbrand"
        label="Alternative brand"
        inputProps={{ defaultValue: form.alternativeBrand, placeholder: "Acceptable alternative" }}
      />
      <FormField id="rfq-condition" label="Product condition">
        <Select
          options={CONDITION_OPTIONS}
          placeholder="Select condition"
          defaultValue={form.productCondition ?? ""}
        />
      </FormField>
      <FormField
        id="rfq-standards"
        label="Standards"
        inputProps={{ defaultValue: form.standards, placeholder: "e.g. ASTM A36, ISO 9001" }}
      />
      <FormField
        id="rfq-certs"
        label="Certifications"
        className="sm:col-span-2"
        inputProps={{
          defaultValue: form.certifications,
          placeholder: "e.g. EN 10204 3.1, mill test cert",
        }}
      />
    </SectionCard>
  );
}

// ── Phase 5 — Logistics & commercial ──────────────────────────────────────────────────────────────────
export function LogisticsSection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard title="Logistics & commercial">
      <FormField
        id="rfq-location"
        label="Delivery location"
        inputProps={{ defaultValue: form.deliveryLocation, placeholder: "Site / address" }}
      />
      <FormField
        id="rfq-district"
        label="District"
        description="At least a district is required to submit."
        inputProps={{ defaultValue: form.district, placeholder: "e.g. Gazipur" }}
      />
      <FormField
        id="rfq-date"
        label="Delivery date"
        inputProps={{ defaultValue: form.deliveryDate, type: "date" }}
      />
      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <FormField
          id="rfq-budget"
          label="Budget"
          description="Estimated value — required to submit."
          inputProps={{ defaultValue: form.budget, type: "number", inputMode: "decimal", min: 0 }}
        />
        <FormField id="rfq-currency" label="Currency">
          <Select
            options={[{ value: "BDT", label: "BDT" }]}
            defaultValue={form.currency ?? "BDT"}
          />
        </FormField>
      </div>
      <FormField id="rfq-payment" label="Payment preference">
        <Select
          options={PAYMENT_OPTIONS}
          placeholder="Select preference"
          defaultValue={form.paymentPreference ?? ""}
        />
      </FormField>
      <FormField id="rfq-incoterm" label="Incoterms">
        <Select
          options={INCOTERM_OPTIONS}
          placeholder="Select incoterm"
          defaultValue={form.incoterm ?? ""}
        />
      </FormField>
      <FormField id="rfq-tax" label="Tax">
        <Select
          options={TAX_OPTIONS}
          placeholder="Select tax handling"
          defaultValue={form.tax ?? ""}
        />
      </FormField>
    </SectionCard>
  );
}

// ── Phase 6 — Vendor preferences ──────────────────────────────────────────────────────────────────────
export function VendorSection({ form }: { form: RfqDraftForm }) {
  return (
    <SectionCard title="Vendor preferences">
      <FormField
        id="rfq-routing"
        label="Routing"
        description="How broadly to route this RFQ. The matching engine still decides who is invited."
        className="sm:col-span-2"
      >
        <Select
          options={ROUTING_MODE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Select routing breadth"
          defaultValue={form.routingMode ?? ""}
        />
      </FormField>
      <FormField
        id="rfq-prefvendor"
        label="Preferred vendor"
        description="Search your network (presentation only — search connects later)."
        inputProps={{ defaultValue: form.preferredVendor, placeholder: "Search vendors…" }}
      />
      <FormField id="rfq-vendortype" label="Vendor type">
        <Select
          options={VENDOR_TYPE_OPTIONS}
          placeholder="Any"
          defaultValue={form.manufacturerOrImporter ?? ""}
        />
      </FormField>
      <FormField id="rfq-tier" label="Business tier">
        <Select
          options={FINANCIAL_TIER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Any tier"
          defaultValue={form.financialTier ?? ""}
        />
      </FormField>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <CheckboxRow
          id="rfq-verified"
          label="Verified vendors only"
          defaultChecked={form.verifiedOnly}
        />
        <CheckboxRow
          id="rfq-acceptalt"
          label="Accept alternative products / brands"
          defaultChecked={form.acceptAlternatives}
        />
      </div>
    </SectionCard>
  );
}

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
          ? form.workNature.map((w) => w[0].toUpperCase() + w.slice(1)).join(", ")
          : "—",
    },
    { label: "Item", value: dash(form.itemName) },
    {
      label: "Quantity",
      value: form.quantity ? `${form.quantity} ${form.unit ?? ""}`.trim() : "—",
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
    {
      label: "Budget",
      value: form.budget ? `${form.budget} ${form.currency ?? "BDT"}` : "—",
    },
  ];
  const vendor: DescriptionItem[] = [
    { label: "Routing", value: dash(form.routingMode) },
    { label: "Vendor type", value: dash(form.manufacturerOrImporter) },
    { label: "Verified only", value: form.verifiedOnly ? "Yes" : "No" },
    { label: "Accept alternatives", value: form.acceptAlternatives ? "Yes" : "No" },
  ];
  const fileCount = form.attachments?.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <SummaryCard title="Requirement" items={requirement} />
      <SummaryCard title="Specifications" items={specs} />
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-semibold">Files</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
          {fileCount === 0
            ? "No attachments"
            : fileCount === 1
              ? "1 file attached"
              : `${fileCount} files attached`}
        </CardContent>
      </Card>
      <SummaryCard title="Delivery" items={delivery} />
      <SummaryCard title="Vendor preferences" items={vendor} />
    </div>
  );
}

function SummaryCard({ title, items }: { title: string; items: DescriptionItem[] }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  );
}
