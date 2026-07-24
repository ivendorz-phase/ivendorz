"use client";

// Comparison Workspace — DOCUMENT COMPLETENESS PANEL (§2.11A.12). A LOCAL readiness view shown before opening
// the printable document. It reflects only whether the on-screen inputs are present — it is NOT approval,
// submission, finalisation, or a compliance check, and it uses NEUTRAL statuses ONLY: "Ready to preview" /
// "Optional information missing" / "Required comparison input missing". The forbidden words (Approved / Final
// / Submitted / Ready for approval / Compliance passed) appear nowhere.

import { Check, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { useComparisonWorkspace } from "./comparison-workspace-state";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

export function DocumentCompletenessPanel({ data }: { data: ComparisonWorkspaceData }) {
  const { procurementPurpose, toBuyerEvaluation } = useComparisonWorkspace();
  const evaluation = toBuyerEvaluation(data.statement.vendors);

  const checks: { label: string; met: boolean; required: boolean }[] = [
    {
      label: "At least 2 vendors selected",
      met: data.selectedSuppliers.length >= 2,
      required: true,
    },
    { label: "RFQ title", met: Boolean(data.rfqTitle?.trim()), required: true },
    {
      label: "Commercial summary",
      met: data.statement.computed.grandTotals.length > 0,
      required: true,
    },
    { label: "Signatory blocks", met: data.statement.approvals.length > 0, required: true },
    { label: "Procurement purpose", met: Boolean(procurementPurpose.trim()), required: false },
    {
      label: "Prepared-by",
      met: Boolean(data.statement.preparedByLabel?.trim()),
      required: false,
    },
    { label: "Buyer Evaluation Summary", met: Boolean(evaluation), required: false },
  ];

  const requiredMissing = checks.some((c) => c.required && !c.met);
  const optionalMissing = checks.some((c) => !c.required && !c.met);
  const overall: { label: string; tone: StatusTone } = requiredMissing
    ? { label: "Required comparison input missing", tone: "warning" }
    : optionalMissing
      ? { label: "Optional information missing", tone: "info" }
      : { label: "Ready to preview", tone: "success" };

  return (
    <Card id="cw-completeness">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle as="h2" className="text-base">
          Document readiness
        </CardTitle>
        <StatusChip label={overall.label} tone={overall.tone} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-sm">
              {c.met ? (
                <Check aria-hidden className="size-4 shrink-0 text-iv-success-muted" />
              ) : (
                <Minus aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className={c.met ? "text-foreground" : "text-muted-foreground"}>
                {c.label}
                {!c.met && !c.required ? (
                  <span className="text-2xs text-muted-foreground"> · optional</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-2xs text-muted-foreground">
          Presentation completeness only — not approval, submission, or finalisation.
        </p>
      </CardContent>
    </Card>
  );
}
