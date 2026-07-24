"use client";

// Comparison Workspace — region ⑤ PRIVATE BUYER EVALUATION. The buyer AUTHORS every evaluative field
// here (R6 — the platform generates none). It is buyer-private (Inv #11) and session-local (NOT saved —
// Wave-4 backend; do not coin a contract). The recommendation is blank by default and is NEVER derived
// from the arithmetic lowest. Desktop → a sticky aside; below `xl` → a right `Sheet`. Both mount the
// SAME form (scoped ids) over the SAME provider, so edits are shared.

import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/frontend/primitives/sheet";
import { FormField } from "@/frontend/components/form-field";
import { Select, Textarea } from "../form-controls";
import { useComparisonWorkspace, type VendorCompliance } from "./comparison-workspace-state";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

const COMPLIANCE_OPTIONS: { value: VendorCompliance; label: string }[] = [
  { value: "unset", label: "Not assessed" },
  { value: "fully", label: "Fully compliant" },
  { value: "partial", label: "Partially compliant" },
  { value: "non", label: "Non-compliant" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground">{children}</h3>;
}

function EvaluationForm({ data, idScope }: { data: ComparisonWorkspaceData; idScope: string }) {
  const {
    evaluation,
    procurementPurpose,
    signatoryNames,
    setEvaluation,
    setVendorEval,
    setRecommended,
    setProcurementPurpose,
    setSignatory,
  } = useComparisonWorkspace();
  const vendors = data.statement.vendors;
  const id = (name: string) => `cmp-eval-${idScope}-${name}`;

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        Private to your organization — never shown to vendors. Your notes are not saved (integration
        pending). The platform records arithmetic only and recommends no winner.
      </p>

      <div className="flex flex-col gap-4">
        <SectionHeading>Summary &amp; purpose</SectionHeading>
        <FormField id={id("purpose")} label="Procurement purpose">
          <Input
            value={procurementPurpose}
            onChange={(e) => setProcurementPurpose(e.target.value)}
            placeholder="e.g. Supply and installation of compressed air piping"
          />
        </FormField>
        <FormField id={id("summary")} label="Executive summary">
          <Textarea
            value={evaluation.executiveSummary}
            onChange={(e) => setEvaluation({ executiveSummary: e.target.value })}
            placeholder="Your team's summary of the evaluation."
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading>Per-vendor assessment</SectionHeading>
        {vendors.map((vendor) => {
          const entry = evaluation.byQuotation[vendor.quotationId];
          return (
            <div
              key={vendor.quotationId}
              className="flex flex-col gap-3 rounded-md border border-border p-3"
            >
              <span className="text-sm font-medium text-foreground">{vendor.vendorName}</span>
              <FormField id={id(`compliance-${vendor.quotationId}`)} label="Technical compliance">
                <Select
                  options={COMPLIANCE_OPTIONS}
                  value={entry?.compliance ?? "unset"}
                  onChange={(e) =>
                    setVendorEval(vendor.quotationId, {
                      compliance: e.target.value as VendorCompliance,
                    })
                  }
                />
              </FormField>
              <FormField id={id(`note-${vendor.quotationId}`)} label="Technical note">
                <Input
                  value={entry?.technical ?? ""}
                  onChange={(e) => setVendorEval(vendor.quotationId, { technical: e.target.value })}
                  placeholder="Optional note for this vendor."
                />
              </FormField>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading>Recommendation</SectionHeading>
        <FormField
          id={id("recommended")}
          label="Recommended vendor"
          description="Your own choice — the platform never pre-selects one."
        >
          <Select
            placeholder="No recommendation"
            options={vendors.map((v) => ({ value: v.quotationId, label: v.vendorName }))}
            value={evaluation.recommendedQuotationId ?? ""}
            onChange={(e) => setRecommended(e.target.value || undefined)}
          />
        </FormField>
        <FormField id={id("reasons")} label="Reasons (one per line)">
          <Textarea
            value={evaluation.reasons}
            onChange={(e) => setEvaluation({ reasons: e.target.value })}
            placeholder="Why your team recommends this vendor."
          />
        </FormField>
        <FormField id={id("risk")} label="Risk assessment">
          <Textarea
            rows={2}
            value={evaluation.risk}
            onChange={(e) => setEvaluation({ risk: e.target.value })}
          />
        </FormField>
        <FormField id={id("advantage")} label="Commercial position">
          <Input
            value={evaluation.commercialAdvantage}
            onChange={(e) => setEvaluation({ commercialAdvantage: e.target.value })}
          />
        </FormField>
        <FormField id={id("remarks")} label="Remarks">
          <Textarea
            rows={2}
            value={evaluation.remarks}
            onChange={(e) => setEvaluation({ remarks: e.target.value })}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeading>Signatories (wet-ink)</SectionHeading>
        <p className="text-xs text-muted-foreground">
          Names print on the document; signatures are executed on paper. No digital signature is
          captured.
        </p>
        {data.statement.approvals.map((block) => {
          const override = signatoryNames[block.role];
          return (
            <div
              key={block.role}
              className="flex flex-col gap-3 rounded-md border border-border p-3"
            >
              <span className="text-sm font-medium text-foreground">{block.role}</span>
              <FormField id={id(`sig-name-${block.role}`)} label="Name">
                <Input
                  value={override?.name ?? ""}
                  onChange={(e) => setSignatory(block.role, { name: e.target.value })}
                />
              </FormField>
              <FormField id={id(`sig-title-${block.role}`)} label="Designation">
                <Input
                  value={override?.title ?? ""}
                  onChange={(e) => setSignatory(block.role, { title: e.target.value })}
                />
              </FormField>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EvaluationPanel({ data }: { data: ComparisonWorkspaceData }) {
  return (
    <>
      {/* Desktop (≥ xl): sticky aside. */}
      <aside
        aria-label="Private buyer evaluation"
        className="hidden xl:block xl:sticky xl:top-16 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto rounded-lg border border-border bg-card p-4"
      >
        <h2 className="mb-3 text-base font-semibold text-foreground">Private evaluation</h2>
        <EvaluationForm data={data} idScope="aside" />
      </aside>

      {/* Below xl: a button opens the evaluation in a right Sheet. */}
      <div className="xl:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary">Private evaluation</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Private evaluation</SheetTitle>
              <SheetDescription>
                Buyer-private, session-local. The platform recommends no winner.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <EvaluationForm data={data} idScope="sheet" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
